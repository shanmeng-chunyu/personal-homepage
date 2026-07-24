import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <p className="eyebrow">404 · LOST IN SPACE</p>
      <h1>这里暂时没有内容</h1>
      <p>链接可能已经移动，也可能还在整理中。</p>
      <Link href="/">回到个人空间</Link>
    </main>
  );
}
