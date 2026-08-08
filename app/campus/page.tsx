import type { Metadata } from "next";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import { PageHeading } from "../components/page-heading";
import { SiteShell } from "../components/site-shell";
import { campusPosts, formatDate, site } from "../lib/content";

export const metadata: Metadata = {
  title: "南大生活",
  description: site.campusPageDescription,
};

export default function CampusPage() {
  return (
    <SiteShell active="campus">
      <PageHeading
        eyebrow="CAMPUS NOTES"
        title={site.campusPageTitle}
        description={site.campusPageDescription}
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
