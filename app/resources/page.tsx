import type { Metadata } from "next";
import {
  ArrowUpRight,
  ArrowRight,
  CalendarCheck2,
  ExternalLink,
  FolderOpen,
} from "lucide-react";
import Link from "next/link";
import { PageHeading } from "../components/page-heading";
import { SiteShell } from "../components/site-shell";
import { formatDate, resources } from "../lib/content";

export const metadata: Metadata = {
  title: "资料库",
  description: "课程、校园网站、工具与模板组成的实用资料索引。",
};

export default function ResourcesPage() {
  return (
    <SiteShell active="resources">
      <PageHeading
        eyebrow="RESOURCE LIBRARY"
        title="值得保存的资料"
        description="这里既有经过核验的外部链接，也有直接整理在站内、可以慢慢阅读的资料文章。"
        count={resources.length}
      />

      <section className="resource-grid" aria-label="资料列表">
        {resources.map((resource) => {
          const isArticle = resource.entryType === "article";

          return (
            <article className="resource-card" key={resource.slug}>
              <div className="resource-card-head">
                <span className="resource-icon" aria-hidden="true">
                  <FolderOpen size={20} />
                </span>
                <span className="category-label">
                  {isArticle ? "站内文章" : "外部资源"} · {resource.category}
                </span>
              </div>
              <h2>{resource.title}</h2>
              <p>{resource.summary}</p>
              <dl className="resource-details">
                <div>
                  <dt>适合</dt>
                  <dd>{resource.audience}</dd>
                </div>
                <div>
                  <dt>
                    <CalendarCheck2 size={14} aria-hidden="true" />
                    {isArticle ? "最后更新" : "最后核验"}
                  </dt>
                  <dd>{formatDate(resource.lastChecked)}</dd>
                </div>
              </dl>
              {isArticle ? (
                <Link
                  className="resource-action"
                  href={`/read/resource/${resource.slug}`}
                  aria-label={`阅读站内资料：${resource.title}`}
                >
                  阅读全文
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              ) : resource.url ? (
                <a
                  className="resource-action"
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  打开外部链接
                  <ExternalLink size={16} aria-hidden="true" />
                </a>
              ) : (
                <span className="resource-action is-disabled">
                  内容整理中
                  <ArrowUpRight size={16} aria-hidden="true" />
                </span>
              )}
            </article>
          );
        })}
      </section>
    </SiteShell>
  );
}
