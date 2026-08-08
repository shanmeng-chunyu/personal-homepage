# 个人空间

一个使用头像和网络 ID 作为公开身份的个人主页，用来整理项目、南大生活经验、随笔和大学资料。

线上地址：[https://shanmeng-chunyu.github.io/personal-homepage/](https://shanmeng-chunyu.github.io/personal-homepage/)

代码仓库：[https://github.com/shanmeng-chunyu/personal-homepage](https://github.com/shanmeng-chunyu/personal-homepage)

## 日常更新内容

不需要修改网站代码。打开 [Pages CMS](https://app.pagescms.org/)，使用 GitHub 登录并选择这个仓库，即可在中文表单中：

- 修改头像、网络 ID、B站主页、QQ 和 NOW 近况
- 选择首页展示的两个 B站视频，标题和封面会自动读取
- 新增或修改项目
- 写校园手记和随笔
- 上传图片
- 更新资料链接及最后核验日期

`公开发布` 关闭时，内容会保存在仓库但不会出现在网站中。打开后保存，GitHub 会自动检查并发布；检查失败时，线上仍保留上一个正常版本。

详细步骤见 [内容编辑指南](docs/content-guide.md)。

## 工程命令

```bash
npm install
npm run dev
npm run check
npm run build:pages
```

## 更新受保护的长篇

长篇内容不能通过 Pages CMS 编辑，否则明文会出现在公开仓库。将文章 JSON 放入已忽略的 `private-content/fiction/`，格式参考 `examples/fiction-entry.example.json`。每篇文章使用一个独立 JSON 文件；新增文章时复制模板并改名，修改文章时编辑原文件，不要在单个文件中追加条目数组。在本地 `.env.local` 中设置 4 位数字的 `FICTION_PASSWORD`，然后运行：

```bash
npm run fiction:encrypt
```

只提交生成的 `public/protected/fiction/` 密文，不要提交 `.env.local` 或明文草稿。修改密码时必须重新加密并提交全部长篇密文。
当前密码按设计为 4 位数字，安全性较低，请不要用于高度敏感的内容。

## 架构原则

- 内容、展示与发布流程分离
- `content/` 是所有公开内容的唯一事实来源
- 内容结构由自动化 schema 校验
- 代码修改和内容修改都有 Git 历史
- GitHub Pages 在检查通过后自动更新
- 不在内容模型中保存真实姓名、学号等私人身份信息

架构说明见 [architecture.md](docs/architecture.md)。
