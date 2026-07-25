import { z } from "zod";

const slug = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug 只能包含小写字母、数字和连字符");
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式必须为 YYYY-MM-DD");
const emptyMarkers = new Set(["", '""', "''", "“”", "‘’"]);

function normalizeOptionalString(value) {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") return value;

  const normalized = value.trim();
  return emptyMarkers.has(normalized) ? "" : normalized;
}

const optionalText = z.preprocess(normalizeOptionalString, z.string());
const optionalUrl = z.preprocess(
  normalizeOptionalString,
  z.union([z.literal(""), z.string().url()]),
);
const optionalEmail = z.preprocess(
  normalizeOptionalString,
  z.union([z.literal(""), z.string().email()]),
);
const optionalQq = z.preprocess(
  normalizeOptionalString,
  z.union([
    z.literal(""),
    z.string().regex(/^\d{5,12}$/, "QQ 号应为 5 至 12 位数字"),
  ]),
);
const optionalBilibiliVideoUrl = z.preprocess(
  normalizeOptionalString,
  z.union([
    z.literal(""),
    z
      .string()
      .url()
      .refine(
        (value) =>
          /^https?:\/\/(?:www\.)?b23\.tv\//i.test(value) ||
          /^https?:\/\/(?:www\.|m\.)?bilibili\.com\/video\/BV[0-9A-Za-z]{10}/i.test(
            value,
          ),
        "请填写 bilibili.com/video/BV... 或 b23.tv 的视频链接",
      ),
  ]),
);
const optionalTags = z.array(z.string().min(1)).default([]);
const optionalFlag = z.boolean().default(false);

export const siteSchema = z
  .object({
    networkId: z.string().min(2),
    tagline: z.string().min(1),
    intro: z.string().min(1),
    location: optionalText,
    status: optionalText,
    avatar: optionalText,
    github: optionalUrl,
    bilibili: optionalUrl,
    bilibiliVideo1: optionalBilibiliVideoUrl,
    bilibiliVideo2: optionalBilibiliVideoUrl,
    qq: optionalQq,
    email: optionalEmail,
    siteUrl: z.string().url(),
    keywords: z.array(z.string().min(1)).min(1),
  })
  .strict();

export const projectSchema = z
  .object({
    slug,
    title: z.string().min(1),
    summary: z.string().min(1),
    body: z.string().min(1),
    year: z.number().int().min(2000).max(2100),
    status: z.string().min(1),
    tech: optionalTags,
    github: optionalUrl,
    demo: optionalUrl,
    cover: optionalText,
    featured: optionalFlag,
    published: optionalFlag,
  })
  .strict();

export const articleSchema = z
  .object({
    slug,
    title: z.string().min(1),
    summary: z.string().min(1),
    body: z.string().min(1),
    date,
    updated: date,
    category: z.string().min(1),
    tags: optionalTags,
    cover: optionalText,
    featured: optionalFlag,
    published: optionalFlag,
  })
  .strict();

export const resourceSchema = z
  .object({
    slug,
    title: z.string().min(1),
    summary: z.string().min(1),
    category: z.string().min(1),
    entryType: z.enum(["external", "article"]).default("external"),
    url: optionalUrl,
    body: optionalText,
    audience: z.string().min(1),
    lastChecked: date,
    featured: optionalFlag,
    published: optionalFlag,
  })
  .strict()
  .superRefine((resource, context) => {
    if (resource.entryType === "external" && resource.body) {
      context.addIssue({
        code: "custom",
        path: ["body"],
        message: "外部链接类型不应填写站内正文",
      });
    }

    if (resource.entryType === "article" && resource.url) {
      context.addIssue({
        code: "custom",
        path: ["url"],
        message: "站内文章类型不应填写外部链接",
      });
    }

    if (!resource.published) return;

    if (resource.entryType === "external" && !resource.url) {
      context.addIssue({
        code: "custom",
        path: ["url"],
        message: "公开发布外部资源前必须填写外部链接",
      });
    }

    if (resource.entryType === "article" && !resource.body) {
      context.addIssue({
        code: "custom",
        path: ["body"],
        message: "公开发布站内文章前必须填写正文",
      });
    }
  });
