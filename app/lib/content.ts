import {
  campusData,
  noteData,
  projectData,
  resourceData,
  siteData,
  videoData,
} from "../generated/content";

export type SiteConfig = {
  networkId: string;
  tagline: string;
  intro: string;
  location: string;
  status: string;
  avatar: string;
  github: string;
  bilibili: string;
  bilibiliVideo1: string;
  bilibiliVideo2: string;
  qq: string;
  email: string;
  siteUrl: string;
  keywords: readonly string[];
};

export type BilibiliVideo = {
  url: string;
  bvid: string;
  title: string;
  cover: string;
};

export type Project = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  year: number;
  status: string;
  tech: readonly string[];
  github: string;
  demo: string;
  cover: string;
  featured: boolean;
  published: boolean;
};

export type Article = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  date: string;
  updated: string;
  category: string;
  tags: readonly string[];
  cover?: string;
  featured: boolean;
  published: boolean;
};

export type Resource = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  url: string;
  audience: string;
  lastChecked: string;
  featured: boolean;
  published: boolean;
};

export const site = siteData as SiteConfig;
export const bilibiliVideos = videoData as readonly BilibiliVideo[];
export const projects = (projectData as readonly Project[])
  .filter((entry) => entry.published)
  .sort((a, b) => Number(b.featured) - Number(a.featured) || b.year - a.year);
export const campusPosts = (campusData as readonly Article[])
  .filter((entry) => entry.published)
  .sort((a, b) => b.date.localeCompare(a.date));
export const notes = (noteData as readonly Article[])
  .filter((entry) => entry.published)
  .sort((a, b) => b.date.localeCompare(a.date));
export const resources = (resourceData as readonly Resource[])
  .filter((entry) => entry.published)
  .sort(
    (a, b) =>
      Number(b.featured) - Number(a.featured) ||
      b.lastChecked.localeCompare(a.lastChecked),
  );

export const allReadableEntries = [
  ...projects.map((entry) => ({ ...entry, kind: "project" as const })),
  ...campusPosts.map((entry) => ({ ...entry, kind: "campus" as const })),
  ...notes.map((entry) => ({ ...entry, kind: "note" as const })),
];

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00+08:00`));
}

export function withBasePath(pathname: string) {
  if (!pathname || /^(?:https?:)?\/\//.test(pathname)) return pathname;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${basePath}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}
