import type { Metadata } from "next";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import { PageHeading } from "../components/page-heading";
import { SiteShell } from "../components/site-shell";
import { campusPosts, formatDate } from "../lib/content";

export const metadata: Metadata = {
  title: "南大生活",
  description: "在南京大学学习和生活时留下的经验、观察与校园切片。",
};

export default function CampusPage() {
  return (
    <SiteShell active="campus">
      <PageHeading
        eyebrow="CAMPUS NOTES"
        title="在南大生活的切片"
        description="这里不是官方指南，只是我亲自走过之后愿意留下的经验。涉及时间与地点的信息都会标注更新时间。"
        count={campusPosts.length}
      />

      <section className="story-list" aria-label="校园手记列表">
        {campusPosts.map((post, index) => (
          <article className="story-row" key={post.slug}>
            <div className="story-marker" aria-hidden="true">
              {index === 0 ? <MapPin size={20} /> : <span />}
            </div>
            <div className="story-date">
              <CalendarDays size={15} aria-hidden="true" />
              {formatDate(post.date)}
            </div>
            <div className="story-copy">
              <span className="category-label">{post.category}</span>
              <h2>{post.title}</h2>
              <p>{post.summary}</p>
              <div className="tag-list">
                {post.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
            <Link
              className="story-link"
              href={`/read/campus/${post.slug}`}
              aria-label={`阅读：${post.title}`}
            >
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
