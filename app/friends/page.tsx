import type { Metadata } from "next";
import { ArrowUpRight, UsersRound } from "lucide-react";
import Image from "next/image";
import { PageHeading } from "../components/page-heading";
import { SiteShell } from "../components/site-shell";
import { friends, site, withBasePath } from "../lib/content";

export const metadata: Metadata = {
  title: "友站",
  description: site.friendsPageDescription,
};

function getSiteHost(url: string) {
  return new URL(url).hostname.replace(/^www\./, "");
}

export default function FriendsPage() {
  return (
    <SiteShell active="friends">
      <PageHeading
        eyebrow="FRIENDS"
        title={site.friendsPageTitle}
        description={site.friendsPageDescription}
        count={friends.length}
      />

      {friends.length ? (
        <section className="friend-grid" aria-label="友站列表">
          {friends.map((friend) => (
            <a
              className="friend-card"
              href={friend.url}
              target="_blank"
              rel="noreferrer"
              key={friend.slug}
              aria-label={`访问友站：${friend.name}`}
            >
              <div className="friend-card-head">
                <span className="friend-avatar" aria-hidden={!friend.avatar}>
                  {friend.avatar ? (
                    <Image
                      src={withBasePath(friend.avatar)}
                      alt={`${friend.name} 的头像或站点图标`}
                      width={58}
                      height={58}
                    />
                  ) : (
                    <span>{Array.from(friend.name.trim())[0] ?? "友"}</span>
                  )}
                </span>
                <span className="friend-host">{getSiteHost(friend.url)}</span>
                <ArrowUpRight size={18} aria-hidden="true" />
              </div>
              <div className="friend-copy">
                <h2>{friend.name}</h2>
                <p>{friend.description}</p>
              </div>
              {friend.tags.length ? (
                <div className="tag-list" aria-label={`${friend.name} 的标签`}>
                  {friend.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              ) : null}
            </a>
          ))}
        </section>
      ) : (
        <section className="friend-empty" aria-label="友站列表为空">
          <span aria-hidden="true">
            <UsersRound size={26} />
          </span>
          <h2>还没有公开的友站</h2>
          <p>这里会慢慢收集互联网上值得拜访的个人主页。</p>
        </section>
      )}
    </SiteShell>
  );
}
