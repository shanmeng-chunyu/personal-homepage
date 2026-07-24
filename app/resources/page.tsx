import type { Metadata } from "next";
import {
  ArrowUpRight,
  CalendarCheck2,
  ExternalLink,
  FolderOpen,
} from "lucide-react";
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
        description="只收录确实使用过或核验过的内容。失效链接会被标记，而不是悄悄留下。"
        count={resources.length}
      />

      <section className="resource-grid" aria-label="资料列表">
        {resources.map((resource) => (
          <article className="resource-card" key={resource.slug}>
            <div className="resource-card-head">
              <span className="resource-icon" aria-hidden="true">
                <FolderOpen size={20} />
              </span>
              <span className="category-label">{resource.category}</span>
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
                  最后核验
                </dt>
                <dd>{formatDate(resource.lastChecked)}</dd>
              </div>
            </dl>
            {resource.url ? (
              <a
                className="resource-action"
                href={resource.url}
                target="_blank"
                rel="noreferrer"
              >
                打开资源
                <ExternalLink size={16} aria-hidden="true" />
              </a>
            ) : (
              <span className="resource-action is-disabled">
                内容整理中
                <ArrowUpRight size={16} aria-hidden="true" />
              </span>
            )}
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
