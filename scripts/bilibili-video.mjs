const directVideoHosts = new Set([
  "bilibili.com",
  "www.bilibili.com",
  "m.bilibili.com",
]);
const shortVideoHosts = new Set(["b23.tv", "www.b23.tv"]);

export function extractBvid(value) {
  if (typeof value !== "string") return "";
  const match = value.match(/BV[0-9A-Za-z]{10}/i);
  return match ? `BV${match[0].slice(2)}` : "";
}

export function isSupportedBilibiliVideoUrl(value) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    return (
      shortVideoHosts.has(hostname) ||
      (directVideoHosts.has(hostname) && Boolean(extractBvid(value)))
    );
  } catch {
    return false;
  }
}

function normalizeCoverUrl(value) {
  if (typeof value !== "string" || !value.trim()) return "";
  if (value.startsWith("//")) return `https:${value}`;
  return value.replace(/^http:\/\//i, "https://");
}

function fallbackVideo(url, bvid = "") {
  return {
    url,
    bvid,
    title: "在 B站观看",
    cover: "",
  };
}

export async function resolveBilibiliVideo(
  url,
  {
    fetchImpl = fetch,
    timeoutMs = 8000,
    warn = (message) => console.warn(message),
  } = {},
) {
  if (!url) return null;

  let resolvedUrl = url;
  let bvid = extractBvid(url);

  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (shortVideoHosts.has(hostname)) {
      const response = await fetchImpl(url, {
        redirect: "follow",
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(timeoutMs),
      });
      resolvedUrl = response.url || url;
      bvid = extractBvid(resolvedUrl);
    }

    if (!bvid) {
      warn(`无法从 B站链接提取 BV 号：${url}`);
      return fallbackVideo(url);
    }

    const apiUrl = new URL("https://api.bilibili.com/x/web-interface/view");
    apiUrl.searchParams.set("bvid", bvid);
    const response = await fetchImpl(apiUrl, {
      headers: {
        Referer: "https://www.bilibili.com/",
        "User-Agent": "Mozilla/5.0",
      },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    if (payload.code !== 0 || !payload.data) {
      throw new Error(payload.message || `B站接口返回 ${payload.code}`);
    }

    return {
      url,
      bvid,
      title: payload.data.title?.trim() || "在 B站观看",
      cover: normalizeCoverUrl(payload.data.pic),
    };
  } catch (error) {
    warn(`读取 B站视频信息失败，将使用安全占位：${error.message}`);
    return fallbackVideo(url, bvid);
  }
}

export async function resolveBilibiliVideos(urls, options) {
  const uniqueUrls = [...new Set(urls.filter(Boolean))].slice(0, 2);
  const videos = await Promise.all(
    uniqueUrls.map((url) => resolveBilibiliVideo(url, options)),
  );
  return videos.filter(Boolean);
}
