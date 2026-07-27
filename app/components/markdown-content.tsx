import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { withBasePath } from "../lib/content";

export function MarkdownContent({ children }: { children: string }) {
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children: linkChildren }) => (
            <a
              href={href}
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noreferrer" : undefined}
            >
              {linkChildren}
            </a>
          ),
          img: ({ src, alt, title }) => (
            // Article images have unknown dimensions, so a native responsive
            // image is more appropriate than reserving an incorrect aspect ratio.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={typeof src === "string" ? withBasePath(src) : undefined}
              alt={alt ?? ""}
              title={title}
              loading="lazy"
              decoding="async"
            />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
