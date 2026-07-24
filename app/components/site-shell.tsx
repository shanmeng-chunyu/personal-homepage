import {
  BookOpenText,
  FolderKanban,
  GitBranch,
  Home,
  Library,
  Mail,
  MapPin,
  Sparkles,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { site, withBasePath } from "../lib/content";

const navigation = [
  { key: "home", label: "首页", href: "/", icon: Home },
  { key: "projects", label: "项目", href: "/projects", icon: FolderKanban },
  { key: "campus", label: "南大生活", href: "/campus", icon: MapPin },
  { key: "resources", label: "资料库", href: "/resources", icon: Library },
  { key: "notes", label: "随笔", href: "/notes", icon: BookOpenText },
  { key: "about", label: "关于", href: "/about", icon: UserRound },
] as const;

type SiteShellProps = {
  active: (typeof navigation)[number]["key"];
  children: React.ReactNode;
};

export function SiteShell({ active, children }: SiteShellProps) {
  return (
    <div className="site-frame">
      <aside className="sidebar">
        <div className="profile-block">
          <Link className="avatar-link" href="/" aria-label="返回首页">
            {site.avatar ? (
              <Image
                className="avatar-image"
                src={withBasePath(site.avatar)}
                alt={`${site.networkId} 的头像`}
                width={56}
                height={56}
                priority
              />
            ) : (
              <span className="avatar-placeholder" aria-hidden="true">
                <Sparkles size={24} strokeWidth={1.7} />
              </span>
            )}
          </Link>
          <div>
            <p className="profile-id">{site.networkId}</p>
            <p className="profile-location">{site.location}</p>
          </div>
        </div>

        <nav className="primary-nav" aria-label="主要导航">
          {navigation.map(({ key, label, href, icon: Icon }) => (
            <Link
              className={active === key ? "nav-link is-active" : "nav-link"}
              href={href}
              key={key}
              aria-current={active === key ? "page" : undefined}
            >
              <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-foot">
          <p>保持好奇，慢慢更新。</p>
          <div className="social-links">
            {site.github ? (
              <a
                href={site.github}
                target="_blank"
                rel="noreferrer"
                aria-label="访问 GitHub"
              >
                <GitBranch size={17} aria-hidden="true" />
              </a>
            ) : null}
            {site.email ? (
              <a href={`mailto:${site.email}`} aria-label="发送邮件">
                <Mail size={17} aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>
      </aside>

      <main className="site-main">{children}</main>
    </div>
  );
}
