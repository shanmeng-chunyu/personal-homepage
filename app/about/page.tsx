import type { Metadata } from "next";
import {
  GitBranch,
  Mail,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Tv,
} from "lucide-react";
import { PageHeading } from "../components/page-heading";
import { SiteShell } from "../components/site-shell";
import { site } from "../lib/content";

export const metadata: Metadata = {
  title: "关于",
  description: "关于这个匿名个人空间，以及它选择公开和保留的边界。",
};

export default function AboutPage() {
  return (
    <SiteShell active="about">
      <PageHeading
        eyebrow="ABOUT THIS SPACE"
        title="关于这个网络住处"
        description="这里用头像和网络 ID 表达身份。真实姓名不是认识一个人的必要入口。"
      />

      <section className="about-layout">
        <article className="about-primary">
          <div className="about-symbol" aria-hidden="true">
            <Sparkles size={28} />
          </div>
          <p className="about-lead">{site.tagline}</p>
          <p>{site.intro}</p>
          <p>
            我希望这里首先是一个可以长期维护的个人空间，其次才是作品展示。
            内容会逐渐增加，旧内容也会在需要时修订。
          </p>
        </article>

        <aside className="about-side">
          <div className="about-fact">
            <MapPin size={18} aria-hidden="true" />
            <div>
              <span>位置</span>
              <strong>{site.location}</strong>
            </div>
          </div>
          <div className="about-fact">
            <ShieldCheck size={18} aria-hidden="true" />
            <div>
              <span>公开原则</span>
              <strong>分享经验，保留私人身份</strong>
            </div>
          </div>
          {site.github ? (
            <a
              className="about-fact"
              href={site.github}
              target="_blank"
              rel="noreferrer"
            >
              <GitBranch size={18} aria-hidden="true" />
              <div>
                <span>代码</span>
                <strong>访问 GitHub</strong>
              </div>
            </a>
          ) : null}
          {site.bilibili ? (
            <a
              className="about-fact"
              href={site.bilibili}
              target="_blank"
              rel="noreferrer"
            >
              <Tv size={18} aria-hidden="true" />
              <div>
                <span>视频主页</span>
                <strong>访问 B站主页</strong>
              </div>
            </a>
          ) : null}
          {site.qq ? (
            <div className="about-fact">
              <MessageCircle size={18} aria-hidden="true" />
              <div>
                <span>QQ</span>
                <strong>{site.qq}</strong>
              </div>
            </div>
          ) : null}
          {site.email ? (
            <a className="about-fact" href={`mailto:${site.email}`}>
              <Mail size={18} aria-hidden="true" />
              <div>
                <span>联系</span>
                <strong>发送邮件</strong>
              </div>
            </a>
          ) : null}
        </aside>
      </section>
    </SiteShell>
  );
}
