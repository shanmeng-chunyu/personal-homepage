import assert from "node:assert/strict";
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
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /@YourID/);
  assert.match(html, /在南大生活，也做点有用的小东西/);
  assert.match(html, /置顶项目/);
  assert.match(html, /校园手记/);
  assert.match(html, /资料库/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|SkeletonPreview/);
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

test("内容详情页可访问", async () => {
  const response = await render("/read/project/course-companion/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /课程信息整理工具/);
  assert.match(html, /为什么做它/);
});
