# Repository Guidelines（仓库指南与交接说明）

## 项目定位与架构

这是一个以 Git 为内容数据库的静态个人主页。日常内容通过 Pages CMS 编辑并保存到 `content/`，构建时由 `scripts/generate-content.mjs` 使用 Zod 校验，再生成忽略提交的 `app/generated/content.ts`。页面、组件和元数据路由位于 `app/`；测试位于 `tests/`；图片等静态资源位于 `public/`。受密码保护的长篇是例外：明文只保存在被忽略的 `private-content/fiction/`，仓库仅提交 `public/protected/fiction/` 密文。

本地开发和渲染测试使用 vinext、Vite 与 `worker/`；GitHub Pages 生产发布使用 `next.config.ts` 的静态导出。不要引入运行时数据库，除非需求明确改变现有架构。

## 接手前必做

1. 阅读 `README.md`、`docs/architecture.md` 和 `docs/content-guide.md`。
2. 运行 `git status`、`git ls-remote origin refs/heads/main`，确认本地跟踪分支是否过期。
3. 运行 `npm run check`，再使用 `$env:NEXT_PUBLIC_BASE_PATH='/personal-homepage'; npm run build:pages` 验证真实发布路径。
4. 修改内容时只编辑 `content/`，不要手改生成文件。

## 当前交接状态

截至 2026-08-08，已获取并合并远端 `85db9ff`，保留远端新增的 `visualswap-reproduction` 项目和本地响应式图片修复。本轮新增左侧“长篇”入口、浏览器端密码解锁、按需解密阅读、长篇加密脚本和作者文档；密码格式现按需求限制为 4 位数字，但前端输入框不显示格式提示、不强制数字键盘或输入长度。长篇草稿现在使用“每篇一个 JSON 元数据 + 一个 Markdown 正文”的本地格式，JSON 通过 `bodyFile` 指向同目录 `.md` 文件。当前已生成 7 篇长篇密文，明文仍仅保存在已忽略的 `private-content/fiction/`。四位密码安全性较低，只适合一般访问门槛。

已确认 `npm run check` 全部通过，包括 18 项测试；带 `/personal-homepage` 前缀的静态导出成功。密码门、错误密码、解锁目录、正文、锁定和 390px 移动端布局均已在浏览器验证，测试明文和密文已清理。

## 已知问题与优先级

1. `app/layout.tsx` 同时使用含子路径的 `metadataBase` 和 `withBasePath`，导致线上 RSS alternate、Open Graph 与 Twitter 图片地址重复 `/personal-homepage`。
2. GitHub Actions 仅运行类型检查、Lint 和静态构建，没有执行 `tests/*.test.mjs`。
3. `content/projects/agent.json` 的年份为 `2028`，会在 sitemap 中产生未来时间，需确认是否有意。
4. `public/media/` 中有两张内容完全相同的 2.22 MB PNG，其中一张未被引用；`og.png` 实际宽度与 metadata 声明不一致。

## 常用命令

- `npm install`：安装依赖，要求 Node.js 22.13 及以上。
- `npm run dev`：生成内容并启动本地开发服务。
- `npm run fiction:encrypt`：使用 `.env.local` 中 4 位数字的 `FICTION_PASSWORD` 加密本地长篇 JSON 元数据与 Markdown 正文草稿。
- `npm run typecheck`：生成内容并执行 TypeScript 检查。
- `npm run lint`：执行 ESLint。
- `npm test`：构建 vinext Worker，并运行 `tests/*.test.mjs`。
- `npm run check`：依次执行类型检查、Lint、构建和测试。
- `npm run build:pages`：生成 GitHub Pages 静态产物到 `out/`。

## 编码与测试规范

应用代码使用 TypeScript/TSX，脚本和测试使用 ESM。沿用两空格缩进、双引号、分号和尾逗号。React 组件使用 PascalCase，函数使用 camelCase，内容 slug 使用小写 kebab-case，例如 `why-this-site`。优先使用服务端组件；内容约束集中在 `scripts/content-schema.mjs`。

测试使用 `node:test` 和 `node:assert/strict`，文件命名为 `*.test.mjs`。修改 schema 或 CMS 字段时补充契约测试；修改路由、导航、图片或 metadata 时补充渲染测试。提交前至少运行 `npm run check` 和 Pages 静态构建。

## 提交、评审与安全

提交标题沿用 `fix: ...`、`ui: ...`、`content: ...`、`ci: ...`。代码和无关内容分开提交。PR 应说明用户可见变化、验证命令和已知影响；视觉修改附桌面端与移动端截图。

每次完成重要更改后，必须同步更新本文件中的“当前交接状态”“已知问题与优先级”或其他受影响章节，记录已经完成的工作、验证结果和剩余事项。随后必须将本次代码与 `AGENTS.md` 一并提交并推送到 GitHub 仓库；未更新交接文档或未完成 GitHub 提交与推送，不得视为该项更改已经完成。推送前先确认本地与远端分支关系，禁止通过强推覆盖他人提交。

不要提交密钥、真实姓名、学号、手机号、宿舍等隐私数据。`.env*` 和 `private-content/` 仅用于本地且已忽略；邮箱和 QQ 一旦写入 `content/site.json` 就会公开。更新长篇时只提交加密产物，并确认 Git diff 中没有章节 JSON、Markdown 正文或其他明文草稿。保留 B站元数据接口不可用时的降级行为，避免外部服务阻断整站发布。
