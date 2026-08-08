import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { PageHeading } from "../components/page-heading";
import { SiteShell } from "../components/site-shell";
import { formatDate, notes, site } from "../lib/content";

export const metadata: Metadata = {
  title: "随笔",
  description: site.notesPageDescription,
};

export default function NotesPage() {
  return (
    <SiteShell active="notes">
      <PageHeading
        eyebrow="NOTES"
        title={site.notesPageTitle}
        description={site.notesPageDescription}
        count={notes.length}
      />

      <section className="notes-index" aria-label="随笔列表">
        {notes.map((note) => (
          <article className="note-row" key={note.slug}>
            <time dateTime={note.date}>{formatDate(note.date)}</time>
            <div>
              <span className="category-label">{note.category}</span>
              <h2>{note.title}</h2>
              <p>{note.summary}</p>
            </div>
            <Link
              href={`/read/note/${note.slug}`}
              aria-label={`阅读：${note.title}`}
            >
              <ArrowRight size={19} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
