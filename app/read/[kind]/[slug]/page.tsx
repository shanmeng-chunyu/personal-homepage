import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, CalendarDays } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownContent } from "../../../components/markdown-content";
import { ProjectCover } from "../../../components/project-cover";
import { SiteShell } from "../../../components/site-shell";
import {
  allReadableEntries,
  formatDate,
  type Article,
  type Project,
  type Resource,
} from "../../../lib/content";

type Kind = "project" | "campus" | "note" | "resource";
type PageProps = {
  params: Promise<{ kind: string; slug: string }>;
};

const routeMeta: Record<
  Kind,
  {
    active: "projects" | "campus" | "notes" | "resources";
    label: string;
    back: string;
  }
> = {
  project: { active: "projects", label: "项目", back: "/projects" },
  campus: { active: "campus", label: "校园手记", back: "/campus" },
  note: { active: "notes", label: "随笔", back: "/notes" },
  resource: { active: "resources", label: "资料库", back: "/resources" },
};

function isKind(value: string): value is Kind {
  return (
    value === "project" ||
    value === "campus" ||
    value === "note" ||
    value === "resource"
  );
}

function getEntry(kind: string, slug: string) {
  if (!isKind(kind)) return undefined;
  return allReadableEntries.find(
    (entry) => entry.kind === kind && entry.slug === slug,
  );
}

export function generateStaticParams() {
  return allReadableEntries.map((entry) => ({
    kind: entry.kind,
    slug: entry.slug,
  }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { kind, slug } = await params;
  const entry = getEntry(kind, slug);
  if (!entry) return {};
  return {
    title: entry.title,
    description: entry.summary,
  };
}

export default async function ReadingPage({ params }: PageProps) {
  const { kind, slug } = await params;
  const entry = getEntry(kind, slug);
  if (!entry || !isKind(kind)) notFound();

  const meta = routeMeta[kind];
  const isProject = kind === "project";
  const project = isProject ? (entry as Project & { kind: Kind }) : null;
  const article =
    kind === "campus" || kind === "note"
      ? (entry as Article & { kind: Kind })
      : null;
  const resource =
    kind === "resource" ? (entry as Resource & { kind: Kind }) : null;

  return (
    <SiteShell active={meta.active}>
      <article className="reading-page">
        <Link className="back-link" href={meta.back}>
          <ArrowLeft size={16} aria-hidden="true" />
          返回{meta.label}
        </Link>

        <header className="article-header">
          <p className="eyebrow">{meta.label.toUpperCase()}</p>
          <h1>{entry.title}</h1>
          <p className="article-summary">{entry.summary}</p>
          <div className="article-meta">
            {project ? (
              <>
                <span>{project.year}</span>
                <span>{project.status}</span>
                {project.tech.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </>
            ) : article ? (
              <>
                <span>
                  <CalendarDays size={15} aria-hidden="true" />
                  {formatDate(article.date)}
                </span>
                <span>{article.category}</span>
                {article.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </>
            ) : resource ? (
              <>
                <span>
                  <CalendarDays size={15} aria-hidden="true" />
                  {formatDate(resource.lastChecked)}
                </span>
                <span>{resource.category}</span>
                <span>适合：{resource.audience}</span>
              </>
            ) : null}
          </div>
          {project && (project.github || project.demo) ? (
            <div className="article-actions">
              {project.demo ? (
                <a href={project.demo} target="_blank" rel="noreferrer">
                  在线体验
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              ) : null}
              {project.github ? (
                <a href={project.github} target="_blank" rel="noreferrer">
                  查看源码
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              ) : null}
            </div>
          ) : null}
          {project ? (
            <ProjectCover
              className="article-cover"
              cover={project.cover}
              title={project.title}
              priority
              sizes="(max-width: 720px) calc(100vw - 36px), 820px"
            />
          ) : null}
        </header>

        <MarkdownContent>{entry.body}</MarkdownContent>

        <footer className="article-footer">
          <span>最后更新</span>
          <strong>
            {article
              ? formatDate(article.updated)
              : resource
                ? formatDate(resource.lastChecked)
                : `${project?.year ?? ""}`}
          </strong>
        </footer>
      </article>
    </SiteShell>
  );
}
