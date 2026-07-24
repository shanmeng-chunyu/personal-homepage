import { ArrowUpRight, Play } from "lucide-react";
import Image from "next/image";
import type { BilibiliVideo } from "../lib/content";

type BilibiliVideoCardProps = {
  video: BilibiliVideo;
  priority?: boolean;
};

export function BilibiliVideoCard({
  video,
  priority = false,
}: BilibiliVideoCardProps) {
  return (
    <a
      className="video-card"
      href={video.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`前往 B站观看：${video.title}`}
    >
      <div className="video-card-cover">
        {video.cover ? (
          <Image
            className="video-card-image"
            src={video.cover}
            alt={`${video.title}的视频封面`}
            fill
            priority={priority}
            referrerPolicy="no-referrer"
            sizes="(max-width: 720px) calc(100vw - 72px), (max-width: 960px) 35vw, 390px"
            unoptimized
          />
        ) : (
          <div className="video-card-placeholder" aria-hidden="true">
            <Play size={34} strokeWidth={1.6} />
          </div>
        )}
        <span className="video-play" aria-hidden="true">
          <Play size={16} fill="currentColor" />
        </span>
      </div>
      <div className="video-card-copy">
        <div>
          <p>BILIBILI</p>
          <h3>{video.title}</h3>
        </div>
        <ArrowUpRight size={18} aria-hidden="true" />
      </div>
    </a>
  );
}
