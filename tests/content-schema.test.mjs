import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  articleSchema,
  projectSchema,
  resourceSchema,
  siteSchema,
} from "../scripts/content-schema.mjs";
import {
  extractBvid,
  isSupportedBilibiliVideoUrl,
  resolveBilibiliVideo,
  resolveBilibiliVideos,
} from "../scripts/bilibili-video.mjs";
import { listJsonFiles } from "../scripts/content-files.mjs";

const contentRoot = new URL("../content/", import.meta.url);

async function readJson(url) {
  return JSON.parse(await readFile(url, "utf8"));
}

async function readCollection(folder) {
  const directory = new URL(`${folder}/`, contentRoot);
  const files = await listJsonFiles(directory);
  return Promise.all(files.map((name) => readJson(new URL(name, directory))));
}

test("内容栏目为空且目录不存在时按空列表处理", async () => {
  const missingDirectory = new URL(
    "fixtures/collection-that-does-not-exist/",
    import.meta.url,
  );

  assert.deepEqual(await listJsonFiles(missingDirectory), []);
});

test("个人设置不包含真实姓名字段", async () => {
  const site = siteSchema.parse(await readJson(new URL("site.json", contentRoot)));
  assert.equal(Object.hasOwn(site, "realName"), false);
  assert.equal(Object.hasOwn(site, "name"), false);
  assert.ok(site.networkId.length >= 2);
});

test("B站主页和 QQ 可选且填写时会校验格式", async () => {
  const site = siteSchema.parse(await readJson(new URL("site.json", contentRoot)));
  assert.match(site.bilibili, /^(?:$|https:\/\/)/);
  assert.match(site.qq, /^(?:$|\d{5,12})$/);

  const configured = siteSchema.parse({
    ...site,
    bilibili: "https://space.bilibili.com/123456",
    bilibiliVideo1: "https://www.bilibili.com/video/BV1GJ411x7h7/",
    bilibiliVideo2: "https://b23.tv/example",
    qq: "123456789",
  });
  assert.equal(configured.bilibili, "https://space.bilibili.com/123456");
  assert.equal(
    configured.bilibiliVideo1,
    "https://www.bilibili.com/video/BV1GJ411x7h7/",
  );
  assert.equal(configured.bilibiliVideo2, "https://b23.tv/example");
  assert.equal(configured.qq, "123456789");

  assert.throws(
    () =>
      siteSchema.parse({
        ...site,
        bilibiliVideo1: "https://example.com/video/BV1GJ411x7h7",
      }),
    /请填写 bilibili\.com/,
  );
});

test("B站视频链接会提取 BV 号、标题和 HTTPS 封面", async () => {
  const cmsConfig = await readFile(new URL("../.pages.yml", import.meta.url), "utf8");
  assert.match(cmsConfig, /name: bilibiliVideo1/);
  assert.match(cmsConfig, /name: bilibiliVideo2/);

  const url = "https://www.bilibili.com/video/BV1GJ411x7h7/?spm_id_from=333";
  assert.equal(extractBvid(url), "BV1GJ411x7h7");
  assert.equal(isSupportedBilibiliVideoUrl(url), true);
  assert.equal(isSupportedBilibiliVideoUrl("https://example.com/video"), false);

  const calls = [];
  const video = await resolveBilibiliVideo(url, {
    fetchImpl: async (requestUrl) => {
      calls.push(String(requestUrl));
      return {
        ok: true,
        json: async () => ({
          code: 0,
          data: {
            title: "测试视频",
            pic: "http://i1.hdslb.com/bfs/archive/cover.jpg",
          },
        }),
      };
    },
  });

  assert.equal(calls.length, 1);
  assert.match(calls[0], /api\.bilibili\.com/);
  assert.deepEqual(video, {
    url,
    bvid: "BV1GJ411x7h7",
    title: "测试视频",
    cover: "https://i1.hdslb.com/bfs/archive/cover.jpg",
  });
});

test("B站暂时不可用时保留链接并安全降级", async () => {
  const url = "https://www.bilibili.com/video/BV1GJ411x7h7/";
  const warnings = [];
  const video = await resolveBilibiliVideo(url, {
    fetchImpl: async () => {
      throw new Error("temporary unavailable");
    },
    warn: (message) => warnings.push(message),
  });

  assert.deepEqual(video, {
    url,
    bvid: "BV1GJ411x7h7",
    title: "在 B站观看",
    cover: "",
  });
  assert.equal(warnings.length, 1);
});

test("首页最多保留两个不重复的 B站视频", async () => {
  const urls = [
    "https://www.bilibili.com/video/BV1GJ411x7h7/",
    "https://www.bilibili.com/video/BV1Q541167Qg/",
    "https://www.bilibili.com/video/BV1GJ411x7h7/",
  ];
  const videos = await resolveBilibiliVideos(urls, {
    fetchImpl: async (requestUrl) => {
      const bvid = new URL(requestUrl).searchParams.get("bvid");
      return {
        ok: true,
        json: async () => ({
          code: 0,
          data: {
            title: bvid,
            pic: `https://i0.hdslb.com/${bvid}.jpg`,
          },
        }),
      };
    },
  });

  assert.deepEqual(
    videos.map((video) => video.bvid),
    ["BV1GJ411x7h7", "BV1Q541167Qg"],
  );
});

test("CMS 省略可选字段或填写空值标记时会安全归一化", async () => {
  const source = await readJson(
    new URL("projects/emoji.json", contentRoot),
  );
  const required = { ...source };
  for (const field of [
    "github",
    "demo",
    "cover",
    "tech",
    "featured",
    "published",
  ]) {
    delete required[field];
  }

  const omitted = projectSchema.parse(required);
  assert.equal(omitted.github, "");
  assert.equal(omitted.demo, "");
  assert.equal(omitted.cover, "");
  assert.deepEqual(omitted.tech, []);
  assert.equal(omitted.featured, false);
  assert.equal(omitted.published, false);

  for (const marker of ['""', "''", "“”", "‘’", "   "]) {
    assert.equal(projectSchema.parse({ ...source, demo: marker }).demo, "");
  }

  assert.throws(
    () => projectSchema.parse({ ...source, demo: "不是网址" }),
    /Invalid URL/,
  );
});

test("资料库区分外部链接和站内文章，并检查发布目标", () => {
  const shared = {
    slug: "example-resource",
    title: "示例资料",
    summary: "用于验证两种资料打开方式。",
    category: "示例",
    audience: "所有同学",
    lastChecked: "2026-07-25",
    featured: false,
    published: true,
  };

  const external = resourceSchema.parse({
    ...shared,
    entryType: "external",
    url: "https://example.com/resource",
    body: "",
  });
  assert.equal(external.entryType, "external");

  const article = resourceSchema.parse({
    ...shared,
    entryType: "article",
    url: "",
    body: "## 站内正文",
  });
  assert.equal(article.entryType, "article");

  assert.throws(
    () =>
      resourceSchema.parse({
        ...shared,
        entryType: "external",
        url: "",
        body: "",
      }),
    /必须填写外部链接/,
  );
  assert.throws(
    () =>
      resourceSchema.parse({
        ...shared,
        entryType: "article",
        url: "",
        body: "",
      }),
    /必须填写正文/,
  );
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
