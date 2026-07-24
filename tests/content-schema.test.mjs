import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import {
  articleSchema,
  projectSchema,
  resourceSchema,
  siteSchema,
} from "../scripts/content-schema.mjs";

const contentRoot = new URL("../content/", import.meta.url);

async function readJson(url) {
  return JSON.parse(await readFile(url, "utf8"));
}

async function readCollection(folder) {
  const directory = new URL(`${folder}/`, contentRoot);
  const files = (await readdir(directory)).filter((name) => name.endsWith(".json"));
  return Promise.all(files.map((name) => readJson(new URL(name, directory))));
}

test("个人设置不包含真实姓名字段", async () => {
  const site = siteSchema.parse(await readJson(new URL("site.json", contentRoot)));
  assert.equal(Object.hasOwn(site, "realName"), false);
  assert.equal(Object.hasOwn(site, "name"), false);
  assert.match(site.networkId, /^@/);
});

test("所有增量内容都满足契约且 slug 唯一", async () => {
  const groups = [
    [await readCollection("projects"), projectSchema],
    [await readCollection("campus"), articleSchema],
    [await readCollection("notes"), articleSchema],
    [await readCollection("resources"), resourceSchema],
  ];

  for (const [entries, schema] of groups) {
    const slugs = entries.map((entry) => schema.parse(entry).slug);
    assert.equal(new Set(slugs).size, slugs.length);
  }
});
