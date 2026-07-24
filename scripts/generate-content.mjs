import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listJsonFiles } from "./content-files.mjs";
import { resolveBilibiliVideos } from "./bilibili-video.mjs";
import {
  articleSchema,
  projectSchema,
  resourceSchema,
  siteSchema,
} from "./content-schema.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function readCollection(folder, schema) {
  const directory = path.join(root, "content", folder);
  const files = await listJsonFiles(directory);

  const entries = await Promise.all(
    files.map(async (file) => {
      const value = await readJson(path.join(directory, file));
      return schema.parse(value);
    }),
  );

  const slugs = new Set();
  for (const entry of entries) {
    if (slugs.has(entry.slug)) {
      throw new Error(`${folder} 中存在重复 slug：${entry.slug}`);
    }
    slugs.add(entry.slug);
  }

  return entries;
}

const site = siteSchema.parse(
  await readJson(path.join(root, "content", "site.json")),
);
const videos = await resolveBilibiliVideos([
  site.bilibiliVideo1,
  site.bilibiliVideo2,
]);
const [projects, campusPosts, notes, resources] = await Promise.all([
  readCollection("projects", projectSchema),
  readCollection("campus", articleSchema),
  readCollection("notes", articleSchema),
  readCollection("resources", resourceSchema),
]);

const generated = `/* This file is generated. Edit files under /content instead. */
export const siteData = ${JSON.stringify(site, null, 2)} as const;
export const videoData = ${JSON.stringify(videos, null, 2)} as const;
export const projectData = ${JSON.stringify(projects, null, 2)} as const;
export const campusData = ${JSON.stringify(campusPosts, null, 2)} as const;
export const noteData = ${JSON.stringify(notes, null, 2)} as const;
export const resourceData = ${JSON.stringify(resources, null, 2)} as const;
`;

const outputDirectory = path.join(root, "app", "generated");
await mkdir(outputDirectory, { recursive: true });
await writeFile(path.join(outputDirectory, "content.ts"), generated, "utf8");

console.log(
  `Validated ${projects.length + campusPosts.length + notes.length + resources.length} content entries.`,
);
