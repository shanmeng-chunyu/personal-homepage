import {
  createCipheriv,
  createHash,
  pbkdf2Sync,
  randomBytes,
} from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const draftDirectory = path.join(root, "private-content", "fiction");
const outputDirectory = path.join(root, "public", "protected", "fiction");
const PBKDF2_ITERATIONS = 310_000;
const FICTION_PASSWORD_PATTERN = /^[0-9]{4}$/;
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const slug = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const fictionEntrySchema = z
  .object({
    slug,
    title: z.string().min(1),
    summary: z.string().default(""),
    body: z.string().min(1).optional(),
    bodyFile: z.string().min(1).optional(),
    date,
    updated: date,
    order: z.number().int().min(0).default(0),
    published: z.boolean().default(false),
  })
  .strict()
  .refine((entry) => Boolean(entry.body) !== Boolean(entry.bodyFile), {
    message: "必须提供 body 或 bodyFile，且只能提供其中一个。",
    path: ["bodyFile"],
  });

function encode(value) {
  return Buffer.from(value).toString("base64");
}

function encryptJson(value, key, associatedData) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from(associatedData, "utf8"));
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
    cipher.getAuthTag(),
  ]);
  return { iv: encode(iv), data: encode(encrypted) };
}

async function readMarkdownBody(directory, bodyFile) {
  const normalized = bodyFile.replaceAll("\\", "/");
  const segments = normalized.split("/");
  if (
    !normalized.toLowerCase().endsWith(".md") ||
    normalized.startsWith("/") ||
    /^[a-z]:\//i.test(normalized) ||
    segments.includes("..")
  ) {
    throw new Error(`长篇正文路径必须是 fiction 目录内的 Markdown 文件：${bodyFile}`);
  }

  const filePath = path.resolve(directory, ...segments);
  const relativePath = path.relative(directory, filePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error(`长篇正文路径不能离开 fiction 目录：${bodyFile}`);
  }

  try {
    const body = await readFile(filePath, "utf8");
    if (!body.trim()) throw new Error(`长篇正文不能为空：${bodyFile}`);
    return body;
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new Error(`未找到长篇正文 Markdown 文件：${bodyFile}`);
    }
    throw error;
  }
}

async function readDrafts(directory) {
  let files;
  try {
    files = (await readdir(directory))
      .filter((file) => file.endsWith(".json"))
      .sort();
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new Error(
        "未找到 private-content/fiction/，请先按 examples/fiction-entry.example.json 创建明文草稿。",
      );
    }
    throw error;
  }

  const entries = await Promise.all(
    files.map(async (file) => {
      const parsed = fictionEntrySchema.parse(
        JSON.parse(await readFile(path.join(directory, file), "utf8")),
      );
      const body = parsed.bodyFile
        ? await readMarkdownBody(directory, parsed.bodyFile)
        : parsed.body;
      return { ...parsed, body };
    }),
  );
  const slugs = new Set();
  for (const entry of entries) {
    if (slugs.has(entry.slug)) {
      throw new Error(`长篇内容存在重复 slug：${entry.slug}`);
    }
    slugs.add(entry.slug);
  }

  return entries
    .filter((entry) => entry.published)
    .sort(
      (a, b) =>
        a.order - b.order ||
        a.date.localeCompare(b.date) ||
        a.slug.localeCompare(b.slug),
    );
}

export async function encryptFiction(
  password,
  {
    sourceDirectory = draftDirectory,
    targetDirectory = outputDirectory,
  } = {},
) {
  if (
    typeof password !== "string" ||
    !FICTION_PASSWORD_PATTERN.test(password)
  ) {
    throw new Error(
      "FICTION_PASSWORD 必须是 4 位数字。不要把密码写入仓库。",
    );
  }

  const entries = await readDrafts(sourceDirectory);
  const salt = randomBytes(16);
  const key = pbkdf2Sync(
    password,
    salt,
    PBKDF2_ITERATIONS,
    32,
    "sha256",
  );

  await rm(targetDirectory, { recursive: true, force: true });
  await mkdir(path.join(targetDirectory, "articles"), { recursive: true });

  const manifestEntries = [];
  for (const entry of entries) {
    const articleEntry = { ...entry };
    delete articleEntry.bodyFile;
    const id = createHash("sha256")
      .update(entry.slug, "utf8")
      .digest("hex")
      .slice(0, 24);
    const article = encryptJson(
      articleEntry,
      key,
      `fiction:article:${id}:v1`,
    );
    await writeFile(
      path.join(targetDirectory, "articles", `${id}.json`),
      JSON.stringify({ version: 1, cipher: article }, null, 2),
      "utf8",
    );
    manifestEntries.push({
      id,
      slug: entry.slug,
      title: entry.title,
      summary: entry.summary,
      date: entry.date,
      updated: entry.updated,
      order: entry.order,
    });
  }

  const manifest = {
    version: 1,
    kdf: {
      algorithm: "PBKDF2",
      hash: "SHA-256",
      iterations: PBKDF2_ITERATIONS,
      salt: encode(salt),
    },
    cipher: encryptJson(
      { version: 1, entries: manifestEntries },
      key,
      "fiction:manifest:v1",
    ),
  };
  await writeFile(
    path.join(targetDirectory, "manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8",
  );

  console.log(`已加密 ${entries.length} 篇长篇内容。`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.env.FICTION_PASSWORD) {
    try {
      process.loadEnvFile(path.join(root, ".env.local"));
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  encryptFiction(process.env.FICTION_PASSWORD).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
