import type { Metadata } from "next";
import { ArrowUpRight, Code2 } from "lucide-react";
import Link from "next/link";
import { PageHeading } from "../components/page-heading";
import { ProjectCover } from "../components/project-cover";
import { SiteShell } from "../components/site-shell";
import { projects } from "../lib/content";

export const metadata: Metadata = {
  title: "项目",
  description: "一些从真实需求出发、正在持续完成的小项目。",
};

export default function ProjectsPage() {
  return (
    <SiteShell active="projects">
      <PageHeading
        eyebrow="PROJECTS"
        title="做过和正在做的东西"
        description="不按技术栈堆砌，只记录问题、过程与最终是否真的有用。"
        count={projects.length}
      />

      <section className="catalog-grid" aria-label="项目列表">
        {projects.map((project, index) => (
          <article className="catalog-card project-catalog-card" key={project.slug}>
            <div className="catalog-index">{String(index + 1).padStart(2, "0")}</div>
            <div className="catalog-icon" aria-hidden="true">
              <Code2 size={22} />
            </div>
            <ProjectCover
              className="catalog-cover"
              cover={project.cover}
              title={project.title}
              sizes="(max-width: 720px) calc(100vw - 80px), (max-width: 960px) 40vw, 360px"
            />
            <div className="catalog-copy">
              <div className="catalog-meta">
                <span>{project.year}</span>
                <span>{project.status}</span>
              </div>
              <h2>{project.title}</h2>
              <p>{project.summary}</p>
              <div className="tag-list">
                {project.tech.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
            <Link
              className="catalog-link"
              href={`/read/project/${project.slug}`}
              aria-label={`查看项目：${project.title}`}
            >
              查看详情
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
