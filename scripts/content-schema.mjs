import { z } from "zod";

const slug = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug 只能包含小写字母、数字和连字符");
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式必须为 YYYY-MM-DD");
const optionalUrl = z.union([z.literal(""), z.string().url()]);

export const siteSchema = z
  .object({
    networkId: z.string().min(2),
    tagline: z.string().min(1),
    intro: z.string().min(1),
    location: z.string(),
    status: z.string(),
    avatar: z.string(),
    github: optionalUrl,
    email: z.union([z.literal(""), z.string().email()]),
    siteUrl: optionalUrl,
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
    tech: z.array(z.string().min(1)),
    github: optionalUrl,
    demo: optionalUrl,
    cover: z.string(),
    featured: z.boolean(),
    published: z.boolean(),
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
    tags: z.array(z.string().min(1)),
    cover: z.string().optional(),
    featured: z.boolean(),
    published: z.boolean(),
  })
  .strict();

export const resourceSchema = z
  .object({
    slug,
    title: z.string().min(1),
    summary: z.string().min(1),
    category: z.string().min(1),
    url: optionalUrl,
    audience: z.string().min(1),
    lastChecked: date,
    featured: z.boolean(),
    published: z.boolean(),
  })
  .strict();
