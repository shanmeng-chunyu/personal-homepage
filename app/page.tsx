import {
  ArrowRight,
  ArrowUpRight,
  BookMarked,
  CalendarDays,
  Clock3,
  Code2,
  Map,
} from "lucide-react";
import Link from "next/link";
import { SiteShell } from "./components/site-shell";
import {
  campusPosts,
  formatDate,
  notes,
  projects,
  resources,
  site,
} from "./lib/content";

export default function Home() {
  const featuredProject = projects.find((entry) => entry.featured) ?? projects[0];
  const featuredCampus =
    campusPosts.find((entry) => entry.featured) ?? campusPosts[0];
  const recentNote = notes[0];

  return (
    <SiteShell active="home">
      <header className="home-hero">
        <div>
          <p className="eyebrow">MY LITTLE CORNER OF THE WEB</p>
          <h1>{site.networkId}</h1>
          <p className="hero-tagline">{site.tagline}</p>
          <p className="hero-intro">{site.intro}</p>
        </div>
        <div className="presence">
          <span className="presence-dot" aria-hidden="true" />
          最近有更新
        </div>
      </header>

      <section className="bento-grid" aria-label="精选内容">
        {featuredProject ? (
          <article className="bento-card project-feature">
            <div className="card-topline">
              <span>
                <Code2 size={16} aria-hidden="true" />
                置顶项目
              </span>
              <span>{featuredProject.status}</span>
            </div>
            <div className="project-art" aria-hidden="true">
              <span className="art-window art-window-small" />
              <span className="art-window art-window-main">
                <i />
                <i />
                <i />
              </span>
              <span className="art-orbit" />
            </div>
            <div className="card-copy">
              <p className="card-kicker">{featuredProject.year}</p>
              <h2>{featuredProject.title}</h2>
              <p>{featuredProject.summary}</p>
              <div className="tag-list">
                {featuredProject.tech.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
            <Link
              className="card-link"
              href={`/read/project/${featuredProject.slug}`}
              aria-label={`查看项目：${featuredProject.title}`}
            >
              查看项目
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </article>
        ) : null}

        <article className="bento-card now-card">
          <div className="card-topline">
            <span>
              <Clock3 size={16} aria-hidden="true" />
              NOW
            </span>
            <span>最近</span>
          </div>
          <p className="now-copy">{site.status}</p>
          <div className="now-rule" />
          <p className="now-foot">阅读 · 写代码 · 记录生活</p>
        </article>

        {featuredCampus ? (
          <article className="bento-card campus-feature">
            <div className="campus-art" aria-hidden="true">
              <Map size={32} />
              <span />
            </div>
            <div className="card-copy">
              <p className="card-kicker">校园手记</p>
              <h2>{featuredCampus.title}</h2>
              <p>{featuredCampus.summary}</p>
            </div>
            <Link
              className="card-link"
              href={`/read/campus/${featuredCampus.slug}`}
              aria-label={`阅读校园手记：${featuredCampus.title}`}
            >
              继续阅读
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </article>
        ) : null}

        <article className="bento-card resource-feature">
          <div className="card-topline">
            <span>
              <BookMarked size={16} aria-hidden="true" />
              资料库
            </span>
            <span>{resources.length} 项</span>
          </div>
          <ul className="resource-mini-list">
            {resources.slice(0, 3).map((resource) => (
              <li key={resource.slug}>
                <div>
                  <strong>{resource.title}</strong>
                  <span>{resource.category}</span>
                </div>
                {resource.url ? (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`打开资源：${resource.title}`}
                  >
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                ) : (
                  <span className="resource-pending">整理中</span>
                )}
              </li>
            ))}
          </ul>
          <Link className="card-link" href="/resources">
            浏览资料库
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </article>

        {recentNote ? (
          <article className="bento-card recent-note">
            <div className="card-topline">
              <span>
                <CalendarDays size={16} aria-hidden="true" />
                最近写下
              </span>
              <span>{formatDate(recentNote.date)}</span>
            </div>
            <div className="card-copy">
              <p className="card-kicker">{recentNote.category}</p>
              <h2>{recentNote.title}</h2>
              <p>{recentNote.summary}</p>
            </div>
            <Link
              className="card-link"
              href={`/read/note/${recentNote.slug}`}
            >
              阅读随笔
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </article>
        ) : null}
      </section>

      <footer className="home-footer">
        <span>由内容慢慢构成，而不是由真实姓名定义。</span>
        <span>{site.networkId} · 2026</span>
      </footer>
    </SiteShell>
  );
}
