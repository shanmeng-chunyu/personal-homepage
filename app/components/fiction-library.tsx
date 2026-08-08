"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { formatDate, withBasePath } from "../lib/content";
import { MarkdownContent } from "./markdown-content";

type CipherPayload = {
  iv: string;
  data: string;
};

type EncryptedManifest = {
  version: number;
  kdf: {
    algorithm: string;
    hash: string;
    iterations: number;
    salt: string;
  };
  cipher: CipherPayload;
};

type FictionEntryMeta = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  date: string;
  updated: string;
  order: number;
};

type FictionArticle = FictionEntryMeta & {
  body: string;
  published: boolean;
};

type EncryptedArticle = {
  version: number;
  cipher: CipherPayload;
};

function decodeBase64(value: string) {
  const binary = window.atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function deriveKey(password: string, manifest: EncryptedManifest) {
  if (
    manifest.version !== 1 ||
    manifest.kdf.algorithm !== "PBKDF2" ||
    manifest.kdf.hash !== "SHA-256" ||
    manifest.kdf.iterations !== 310_000
  ) {
    throw new Error("不支持的加密内容格式");
  }

  const sourceKey = await window.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: manifest.kdf.hash,
      iterations: manifest.kdf.iterations,
      salt: decodeBase64(manifest.kdf.salt),
    },
    sourceKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );
}

async function decryptJson<T>(
  payload: CipherPayload,
  key: CryptoKey,
  associatedData: string,
): Promise<T> {
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: decodeBase64(payload.iv),
      additionalData: new TextEncoder().encode(associatedData),
    },
    key,
    decodeBase64(payload.data),
  );
  return JSON.parse(new TextDecoder().decode(decrypted)) as T;
}

export function FictionLibrary() {
  const [manifest, setManifest] = useState<EncryptedManifest | null>(null);
  const [loadState, setLoadState] = useState<
    "loading" | "locked" | "missing" | "failed"
  >("loading");
  const [password, setPassword] = useState("");
  const [entries, setEntries] = useState<FictionEntryMeta[] | null>(null);
  const [article, setArticle] = useState<FictionArticle | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const keyRef = useRef<CryptoKey | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(withBasePath("/protected/fiction/manifest.json"), {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.status === 404) {
          setLoadState("missing");
          return;
        }
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        setManifest((await response.json()) as EncryptedManifest);
        setLoadState("locked");
      })
      .catch((fetchError) => {
        if (fetchError.name !== "AbortError") setLoadState("failed");
      });
    return () => controller.abort();
  }, []);

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!manifest || !password || busy) return;
    setBusy(true);
    setError("");
    try {
      const key = await deriveKey(password, manifest);
      const decrypted = await decryptJson<{
        version: number;
        entries: FictionEntryMeta[];
      }>(manifest.cipher, key, "fiction:manifest:v1");
      if (decrypted.version !== 1 || !Array.isArray(decrypted.entries)) {
        throw new Error("无效的长篇目录");
      }
      keyRef.current = key;
      setEntries(decrypted.entries);
      setPassword("");
    } catch {
      setError("密码不正确，或加密内容已损坏。");
    } finally {
      setBusy(false);
    }
  }

  async function openArticle(entry: FictionEntryMeta) {
    if (!keyRef.current || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        withBasePath(`/protected/fiction/articles/${entry.id}.json`),
        { cache: "no-store" },
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const encrypted = (await response.json()) as EncryptedArticle;
      if (encrypted.version !== 1) throw new Error("无效的长篇内容");
      const decrypted = await decryptJson<FictionArticle>(
        encrypted.cipher,
        keyRef.current,
        `fiction:article:${entry.id}:v1`,
      );
      if (decrypted.slug !== entry.slug) throw new Error("长篇内容不匹配");
      setArticle(decrypted);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("这篇内容暂时无法读取，请重新解锁后再试。");
    } finally {
      setBusy(false);
    }
  }

  function lock() {
    keyRef.current = null;
    setEntries(null);
    setArticle(null);
    setError("");
  }

  if (loadState === "loading") {
    return (
      <div className="fiction-state" aria-live="polite">
        <LoaderCircle className="is-spinning" size={22} aria-hidden="true" />
        正在读取加密目录
      </div>
    );
  }

  if (loadState === "missing") {
    return (
      <div className="fiction-state">
        <BookOpenText size={24} aria-hidden="true" />
        <strong>长篇内容暂未开放</strong>
      </div>
    );
  }

  if (loadState === "failed" || !manifest) {
    return (
      <div className="fiction-state" role="alert">
        <LockKeyhole size={24} aria-hidden="true" />
        <strong>加密内容暂时无法载入</strong>
      </div>
    );
  }

  if (!entries) {
    return (
      <section className="fiction-gate" aria-labelledby="fiction-gate-title">
        <span className="fiction-gate-icon" aria-hidden="true">
          <LockKeyhole size={25} />
        </span>
        <p className="eyebrow">PROTECTED WRITING</p>
        <h2 id="fiction-gate-title">这部分内容已加密</h2>
        <form className="fiction-password-form" onSubmit={unlock}>
          <label htmlFor="fiction-password">访问密码</label>
          <div>
            <input
              id="fiction-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              disabled={busy}
              autoFocus
            />
            <button type="submit" disabled={password.length !== 4 || busy}>
              {busy ? (
                <LoaderCircle className="is-spinning" size={17} aria-hidden="true" />
              ) : (
                <KeyRound size={17} aria-hidden="true" />
              )}
              解锁
            </button>
          </div>
        </form>
        <p className="fiction-security-note">密码不会被保存，离开页面后自动锁定。</p>
        {error ? (
          <p className="fiction-error" role="alert">
            {error}
          </p>
        ) : null}
      </section>
    );
  }

  if (article) {
    return (
      <article className="fiction-article">
        <div className="fiction-toolbar">
          <button type="button" onClick={() => setArticle(null)}>
            <ArrowLeft size={16} aria-hidden="true" />
            返回目录
          </button>
          <button type="button" onClick={lock}>
            <LockKeyhole size={16} aria-hidden="true" />
            锁定
          </button>
        </div>
        <header className="article-header">
          <p className="eyebrow">LONGFORM</p>
          <h1>{article.title}</h1>
          {article.summary ? (
            <p className="article-summary">{article.summary}</p>
          ) : null}
          <div className="article-meta">
            <span>{formatDate(article.date)}</span>
            <span>更新于 {formatDate(article.updated)}</span>
          </div>
        </header>
        <MarkdownContent>{article.body}</MarkdownContent>
      </article>
    );
  }

  return (
    <section className="fiction-index" aria-labelledby="fiction-index-title">
      <div className="fiction-index-head">
        <div>
          <p className="eyebrow">UNLOCKED</p>
          <h2 id="fiction-index-title">长篇目录</h2>
        </div>
        <button type="button" onClick={lock}>
          <LockKeyhole size={16} aria-hidden="true" />
          锁定
        </button>
      </div>
      {entries.length ? (
        <ol className="fiction-list">
          {entries.map((entry, index) => (
            <li key={entry.id}>
              <button type="button" onClick={() => openArticle(entry)}>
                <span className="fiction-list-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="fiction-list-copy">
                  <time dateTime={entry.date}>{formatDate(entry.date)}</time>
                  <strong>{entry.title}</strong>
                  {entry.summary ? <span>{entry.summary}</span> : null}
                </span>
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <div className="fiction-state">还没有可阅读的长篇内容</div>
      )}
      {error ? (
        <p className="fiction-error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
