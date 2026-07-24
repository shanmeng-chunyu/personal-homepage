import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { site, withBasePath } from "./lib/content";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.siteUrl),
  title: {
    default: `${site.networkId} 的个人空间`,
    template: `%s · ${site.networkId}`,
  },
  description: site.intro,
  keywords: [...site.keywords],
  authors: [{ name: site.networkId }],
  creator: site.networkId,
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: site.siteUrl,
    siteName: `${site.networkId} 的个人空间`,
    title: `${site.networkId} 的个人空间`,
    description: site.intro,
    images: [
      {
        url: withBasePath("/og.png"),
        width: 1749,
        height: 909,
        alt: `${site.networkId} 的个人空间`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.networkId} 的个人空间`,
    description: site.intro,
    images: [withBasePath("/og.png")],
  },
  alternates: {
    types: {
      "application/rss+xml": withBasePath("/feed.xml"),
    },
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f5f8" },
    { media: "(prefers-color-scheme: dark)", color: "#11131a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
