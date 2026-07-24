import type { MetadataRoute } from "next";
import {
  campusPosts,
  notes,
  projects,
  site,
} from "./lib/content";

export const dynamic = "force-static";

function absolute(pathname: string) {
  return `${site.siteUrl.replace(/\/$/, "")}${pathname}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/projects", "/campus", "/resources", "/notes", "/about"];
  const latestUpdate = [...campusPosts, ...notes]
    .map((entry) => entry.updated)
    .sort()
    .at(-1);

  return [
    ...staticRoutes.map((route) => ({
      url: absolute(route || "/"),
      lastModified: latestUpdate ? new Date(latestUpdate) : new Date(),
      changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
      priority: route === "" ? 1 : 0.7,
    })),
    ...projects.map((entry) => ({
      url: absolute(`/read/project/${entry.slug}/`),
      lastModified: new Date(`${entry.year}-01-01`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...campusPosts.map((entry) => ({
      url: absolute(`/read/campus/${entry.slug}/`),
      lastModified: new Date(entry.updated),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...notes.map((entry) => ({
      url: absolute(`/read/note/${entry.slug}/`),
      lastModified: new Date(entry.updated),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
