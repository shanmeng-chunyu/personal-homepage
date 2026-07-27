import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("首页服务端渲染个人空间", async () => {
  const site = JSON.parse(
    await readFile(new URL("../content/site.json", import.meta.url), "utf8"),
  );
  const projectsDirectory = new URL("../content/projects/", import.meta.url);
  const projectFiles = (await readdir(projectsDirectory)).filter((file) =>
    file.endsWith(".json"),
  );
  const projects = await Promise.all(
    projectFiles.map((file) =>
      readFile(new URL(file, projectsDirectory), "utf8").then(JSON.parse),
    ),
  );
  const featuredProject =
    projects.find((entry) => entry.published && entry.featured) ??
    projects.find((entry) => entry.published);
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.ok(html.includes(site.networkId));
  assert.match(html, /在南大生活，也做点有用的小东西/);
  assert.match(html, /项目展示/);
  assert.match(html, /南大生活/);
  assert.match(html, /资料库/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|SkeletonPreview/);
  if (featuredProject?.cover) {
    assert.ok(html.includes(featuredProject.cover));
    assert.ok(html.includes(`${featuredProject.title}的项目封面`));
  }
});

test("B站视频卡片保持 4:3，并在填写链接后出现在首页", async () => {
  const styles = await readFile(
    new URL("../app/globals.css", import.meta.url),
    "utf8",
  );
  assert.match(
    styles,
    /\.video-card-cover\s*\{[^}]*aspect-ratio:\s*4\s*\/\s*3;/s,
  );

  const generated = await readFile(
    new URL("../app/generated/content.ts", import.meta.url),
    "utf8",
  );
  if (!generated.includes("export const videoData = [\n  {")) return;

  const response = await render("/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /最近的视频/);
  assert.match(html, /video-card-cover/);
  assert.match(html, /前往 B站观看/);
});

test("主要栏目均可访问", async () => {
  for (const [pathname, expected] of [
    ["/projects/", "做过和正在做的东西"],
    ["/campus/", "在南大生活的切片"],
    ["/resources/", "值得保存的资料"],
    ["/notes/", "一些慢慢写下来的东西"],
    ["/about/", "关于这个网络住处"],
  ]) {
    const response = await render(pathname);
    assert.equal(response.status, 200, pathname);
    assert.match(await response.text(), new RegExp(expected), pathname);
  }
});

test("当前项目的列表与详情页可访问并展示封面", async () => {
  const projectsDirectory = new URL("../content/projects/", import.meta.url);
  const projectFiles = (await readdir(projectsDirectory))
    .filter((file) => file.endsWith(".json"))
    .sort();
  const projects = await Promise.all(
    projectFiles.map((file) =>
      readFile(new URL(file, projectsDirectory), "utf8").then(JSON.parse),
    ),
  );
  const project = projects.find((entry) => entry.published);

  if (!project) return;

  const catalogResponse = await render("/projects/");
  assert.equal(catalogResponse.status, 200);
  const catalogHtml = await catalogResponse.text();
  assert.ok(catalogHtml.includes(project.title));
  if (project.cover) {
    assert.ok(catalogHtml.includes(project.cover));
    assert.ok(catalogHtml.includes(`${project.title}的项目封面`));
  }

  const response = await render(`/read/project/${project.slug}/`);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.ok(html.includes(project.title));
  assert.ok(html.includes(project.summary));
  if (project.cover) {
    assert.ok(html.includes(project.cover));
    assert.ok(html.includes(`${project.title}的项目封面`));
  }
});

test("资料库的站内文章会从卡片进入正文页", async () => {
  const resourcesDirectory = new URL("../content/resources/", import.meta.url);
  const resourceFiles = (await readdir(resourcesDirectory)).filter((file) =>
    file.endsWith(".json"),
  );
  const resources = await Promise.all(
    resourceFiles.map((file) =>
      readFile(new URL(file, resourcesDirectory), "utf8").then(JSON.parse),
    ),
  );
  const article = resources.find(
    (entry) =>
      entry.published && entry.entryType === "article" && entry.body,
  );

  assert.ok(article, "至少需要一篇已发布的站内资料用于验证");

  const catalogResponse = await render("/resources/");
  assert.equal(catalogResponse.status, 200);
  const catalogHtml = await catalogResponse.text();
  assert.ok(catalogHtml.includes(article.title));
  assert.match(catalogHtml, /站内文章/);
  assert.match(catalogHtml, /阅读全文/);
  assert.ok(catalogHtml.includes(`/read/resource/${article.slug}`));

  const response = await render(`/read/resource/${article.slug}/`);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.ok(html.includes(article.title));
  assert.ok(html.includes(article.summary));
  assert.match(html, /class="back-link"/);
  assert.match(html, /href="\/resources"/);
});

test("正文图片会修正站内路径并响应式显示", async () => {
  const component = await readFile(
    new URL("../app/components/markdown-content.tsx", import.meta.url),
    "utf8",
  );
  assert.match(component, /withBasePath\(src\)/);
  assert.match(component, /loading="lazy"/);
  assert.match(component, /decoding="async"/);

  const styles = await readFile(
    new URL("../app/globals.css", import.meta.url),
    "utf8",
  );
  assert.match(
    styles,
    /\.prose img\s*\{[^}]*max-width:\s*100%;[^}]*height:\s*auto;/s,
  );
});
