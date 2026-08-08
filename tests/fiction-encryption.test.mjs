import assert from "node:assert/strict";
import {
  createDecipheriv,
  pbkdf2Sync,
} from "node:crypto";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { encryptFiction } from "../scripts/encrypt-fiction.mjs";

function decryptJson(payload, key, associatedData) {
  const encrypted = Buffer.from(payload.data, "base64");
  const body = encrypted.subarray(0, -16);
  const authTag = encrypted.subarray(-16);
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(payload.iv, "base64"),
  );
  decipher.setAAD(Buffer.from(associatedData, "utf8"));
  decipher.setAuthTag(authTag);
  return JSON.parse(
    Buffer.concat([decipher.update(body), decipher.final()]).toString("utf8"),
  );
}

test("长篇内容只发布可由正确密码解密的密文", async () => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "fiction-test-"));
  const sourceDirectory = path.join(temporaryRoot, "drafts");
  const targetDirectory = path.join(temporaryRoot, "encrypted");
  const password = "a-long-test-password";

  try {
    await mkdir(sourceDirectory, { recursive: true });
    await writeFile(
      path.join(sourceDirectory, "chapter-one.json"),
      JSON.stringify({
        slug: "chapter-one",
        title: "只有解锁后才能看到的标题",
        summary: "受保护的摘要",
        body: "# 第一章\n\n受保护的长篇正文。",
        date: "2026-08-08",
        updated: "2026-08-08",
        order: 1,
        published: true,
      }),
      "utf8",
    );

    await encryptFiction(password, { sourceDirectory, targetDirectory });

    const manifestSource = await readFile(
      path.join(targetDirectory, "manifest.json"),
      "utf8",
    );
    assert.doesNotMatch(manifestSource, /解锁后|受保护的摘要|长篇正文/);

    const manifest = JSON.parse(manifestSource);
    const key = pbkdf2Sync(
      password,
      Buffer.from(manifest.kdf.salt, "base64"),
      manifest.kdf.iterations,
      32,
      "sha256",
    );
    const decryptedManifest = decryptJson(
      manifest.cipher,
      key,
      "fiction:manifest:v1",
    );
    assert.equal(decryptedManifest.entries[0].title, "只有解锁后才能看到的标题");

    const articleFiles = await readdir(path.join(targetDirectory, "articles"));
    assert.equal(articleFiles.length, 1);
    const encryptedArticle = JSON.parse(
      await readFile(
        path.join(targetDirectory, "articles", articleFiles[0]),
        "utf8",
      ),
    );
    const article = decryptJson(
      encryptedArticle.cipher,
      key,
      `fiction:article:${decryptedManifest.entries[0].id}:v1`,
    );
    assert.match(article.body, /受保护的长篇正文/);

    const wrongKey = pbkdf2Sync(
      "another-long-password",
      Buffer.from(manifest.kdf.salt, "base64"),
      manifest.kdf.iterations,
      32,
      "sha256",
    );
    assert.throws(
      () => decryptJson(manifest.cipher, wrongKey, "fiction:manifest:v1"),
      /authenticate data|Unsupported state/i,
    );
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test("长篇加密密码至少需要 12 个字符", async () => {
  await assert.rejects(() => encryptFiction("too-short"), /至少需要 12 个字符/);
});
