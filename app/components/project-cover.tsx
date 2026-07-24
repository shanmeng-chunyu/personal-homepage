import Image from "next/image";
import { withBasePath } from "../lib/content";

type ProjectCoverProps = {
  cover: string;
  title: string;
  className?: string;
  priority?: boolean;
  sizes: string;
};

export function ProjectCover({
  cover,
  title,
  className,
  priority = false,
  sizes,
}: ProjectCoverProps) {
  const classes = ["project-cover", className].filter(Boolean).join(" ");

  return (
    <div className={classes} data-has-image={Boolean(cover)}>
      {cover ? (
        <Image
          className="project-cover-image"
          src={withBasePath(cover)}
          alt={`${title}的项目封面`}
          fill
          priority={priority}
          sizes={sizes}
        />
      ) : (
        <div className="project-cover-placeholder" aria-hidden="true">
          <span className="art-window art-window-small" />
          <span className="art-window art-window-main">
            <i />
            <i />
            <i />
          </span>
          <span className="art-orbit" />
        </div>
      )}
    </div>
  );
}
