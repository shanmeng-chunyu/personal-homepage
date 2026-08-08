import type { Metadata } from "next";
import { FictionLibrary } from "../components/fiction-library";
import { PageHeading } from "../components/page-heading";
import { SiteShell } from "../components/site-shell";

export const metadata: Metadata = {
  title: "长篇",
  description: "需要密码解锁的长篇文字。",
  robots: {
    index: false,
    follow: false,
  },
};

export default function FictionPage() {
  return (
    <SiteShell active="fiction">
      <PageHeading
        eyebrow="LONGFORM"
        title="写下来的故事"
        description="只在这里保存，不参与首页推荐或公开内容索引。"
      />
      <FictionLibrary />
    </SiteShell>
  );
}
