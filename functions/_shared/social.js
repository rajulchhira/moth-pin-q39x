/**
 * Creator social reach helpers.
 * YouTube: Data API v3 (needs YOUTUBE_API_KEY).
 * Instagram / Facebook: best-effort public fetch; META_APP_TOKEN optional for Graph.
 * Never hardcode secrets — read from env only.
 */

function envGet(key, fallback) {
  const g = globalThis.process && globalThis.process.env ? globalThis.process.env : {};
  const v = g[key];
  return String(v == null ? fallback || "" : v).trim();
}

export function youtubeApiKey() {
  return envGet("YOUTUBE_API_KEY");
}

export function metaAppToken() {
  return envGet("META_APP_TOKEN") || envGet("FACEBOOK_ACCESS_TOKEN");
}

export function parseYoutubeId(raw) {
  const url = String(raw || "").trim();
  if (!url) return { kind: "", id: "" };
  try {
    const u = new URL(url.startsWith("http") ? url : "https://" + url);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id ? { kind: "id", id } : { kind: "", id: "" };
    }
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts[0] === "channel" && parts[1]) return { kind: "id", id: parts[1] };
      if (parts[0] === "c" && parts[1]) return { kind: "search", id: parts[1] };
      if (parts[0] === "user" && parts[1]) return { kind: "user", id: parts[1] };
      if (parts[0] === "@" || (parts[0] && parts[0].startsWith("@"))) {
        return { kind: "handle", id: parts[0].replace(/^@/, "") };
      }
      if (parts[0] && parts[0].startsWith("@")) {
        return { kind: "handle", id: parts[0].slice(1) };
      }
      const v = u.searchParams.get("v");
      if (v) return { kind: "video", id: v };
    }
  } catch { /* fall through */ }
  if (/^UC[\w-]{20,}$/.test(url)) return { kind: "id", id: url };
  if (url.startsWith("@")) return { kind: "handle", id: url.slice(1) };
  return { kind: "handle", id: url.replace(/^@/, "") };
}

export function parseInstagramUser(raw) {
  const url = String(raw || "").trim();
  if (!url) return "";
  try {
    const u = new URL(url.startsWith("http") ? url : "https://" + url);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (host.includes("instagram.com")) {
      const user = u.pathname.split("/").filter(Boolean)[0] || "";
      return user.replace(/^@/, "").split("?")[0];
    }
  } catch { /* ignore */ }
  return url.replace(/^@/, "").replace(/^https?:\/\/[^/]+\//, "").split("/")[0];
}

export function parseFacebookTarget(raw) {
  const url = String(raw || "").trim();
  if (!url) return { kind: "", id: "" };
  try {
    const u = new URL(url.startsWith("http") ? url : "https://" + url);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (host.includes("facebook.com") || host.includes("fb.com")) {
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts[0] === "profile.php") {
        const id = u.searchParams.get("id");
        return id ? { kind: "id", id } : { kind: "", id: "" };
      }
      if (parts[0] === "pages" && parts[2]) return { kind: "id", id: parts[2] };
      if (parts[0]) return { kind: "username", id: parts[0] };
    }
  } catch { /* ignore */ }
  if (/^\d+$/.test(url)) return { kind: "id", id: url };
  return { kind: "username", id: url.replace(/^@/, "") };
}

async function ytGet(path, params) {
  const key = youtubeApiKey();
  if (!key) return { error: "missing_youtube_key" };
  const qs = new URLSearchParams({ ...params, key });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/${path}?${qs}`);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { error: "youtube_http_" + res.status, detail: body.slice(0, 200) };
  }
  return res.json();
}

export async function fetchYoutubeSubscribers(link) {
  const parsed = parseYoutubeId(link);
  if (!parsed.id) return { ok: false, count: null, error: "invalid_youtube_link" };
  if (!youtubeApiKey()) {
    return { ok: false, count: null, error: "missing_youtube_key", hint: "Set YOUTUBE_API_KEY in Cloudflare Pages env" };
  }

  let channelId = "";
  if (parsed.kind === "id" && parsed.id.startsWith("UC")) {
    channelId = parsed.id;
  } else if (parsed.kind === "handle" || parsed.kind === "search" || parsed.kind === "user") {
    const q = parsed.kind === "user" ? parsed.id : parsed.id;
    const forHandle = await ytGet("channels", { part: "statistics", forHandle: q });
    if (forHandle?.items?.[0]) {
      channelId = forHandle.items[0].id;
      const n = Number(forHandle.items[0].statistics?.subscriberCount);
      return { ok: true, count: Number.isFinite(n) ? n : null, platform: "youtube", source: "youtube_data_api", channelId };
    }
    const search = await ytGet("search", { part: "snippet", type: "channel", q, maxResults: "1" });
    channelId = search?.items?.[0]?.snippet?.channelId || search?.items?.[0]?.id?.channelId || "";
  } else if (parsed.kind === "video") {
    const vid = await ytGet("videos", { part: "snippet", id: parsed.id });
    channelId = vid?.items?.[0]?.snippet?.channelId || "";
  }

  if (!channelId) return { ok: false, count: null, error: "youtube_channel_not_found" };
  const data = await ytGet("channels", { part: "statistics", id: channelId });
  if (data.error) return { ok: false, count: null, ...data };
  const n = Number(data?.items?.[0]?.statistics?.subscriberCount);
  if (!Number.isFinite(n)) return { ok: false, count: null, error: "youtube_no_stats" };
  return { ok: true, count: n, platform: "youtube", source: "youtube_data_api", channelId };
}

function parseCountish(raw) {
  const s = String(raw || "").trim().replace(/,/g, "");
  if (!s) return null;
  const m = s.match(/^([\d.]+)\s*([kKmMbB])?/);
  if (!m) return null;
  let n = Number(m[1]);
  if (!Number.isFinite(n)) return null;
  const suf = (m[2] || "").toLowerCase();
  if (suf === "k") n *= 1e3;
  if (suf === "m") n *= 1e6;
  if (suf === "b") n *= 1e9;
  return Math.round(n);
}

async function scrapeMetaCount(url, patterns) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BizgarhCRM/1.0; +https://www.bizgarh.com)",
        Accept: "text/html,application/json"
      },
      redirect: "follow"
    });
    if (!res.ok) return { ok: false, error: "http_" + res.status };
    const text = await res.text();
    for (const re of patterns) {
      const m = text.match(re);
      if (m) {
        const n = parseCountish(m[1]);
        if (n != null) return { ok: true, count: n, source: "public_scrape" };
      }
    }
    return { ok: false, error: "count_not_found" };
  } catch (e) {
    return { ok: false, error: "fetch_failed", detail: String(e && e.message || e).slice(0, 120) };
  }
}

export async function fetchInstagramFollowers(link) {
  const user = parseInstagramUser(link);
  if (!user) return { ok: false, count: null, error: "invalid_instagram_link" };

  const token = metaAppToken();
  if (token) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v19.0/${encodeURIComponent(user)}?fields=followers_count,username&access_token=${encodeURIComponent(token)}`
      );
      if (res.ok) {
        const data = await res.json();
        const n = Number(data.followers_count);
        if (Number.isFinite(n)) {
          return { ok: true, count: n, platform: "instagram", source: "meta_graph", username: data.username || user };
        }
      }
    } catch { /* fall through to scrape */ }
  }

  const page = `https://www.instagram.com/${encodeURIComponent(user)}/`;
  const scraped = await scrapeMetaCount(page, [
    /"edge_followed_by"\s*:\s*\{\s*"count"\s*:\s*(\d+)/,
    /"follower_count"\s*:\s*(\d+)/,
    /(\d[\d.,]*\s*[kKmMbB]?)\s+Followers/i,
    /content="[^"]*?(\d[\d.,]*[kKmMbB]?)\s+Followers/i
  ]);
  if (scraped.ok) {
    return { ok: true, count: scraped.count, platform: "instagram", source: scraped.source, username: user };
  }
  return {
    ok: false,
    count: null,
    error: scraped.error || "instagram_unavailable",
    hint: "Instagram needs META_APP_TOKEN (Graph) or a public profile the edge can read. Save the link and retry later.",
    username: user
  };
}

export async function fetchFacebookFollowers(link) {
  const target = parseFacebookTarget(link);
  if (!target.id) return { ok: false, count: null, error: "invalid_facebook_link" };

  const token = metaAppToken();
  if (token) {
    try {
      const id = target.id;
      const res = await fetch(
        `https://graph.facebook.com/v19.0/${encodeURIComponent(id)}?fields=fan_count,followers_count,name&access_token=${encodeURIComponent(token)}`
      );
      if (res.ok) {
        const data = await res.json();
        const n = Number(data.followers_count ?? data.fan_count);
        if (Number.isFinite(n)) {
          return { ok: true, count: n, platform: "facebook", source: "meta_graph", name: data.name || id };
        }
      }
    } catch { /* fall through */ }
  }

  const page = target.kind === "id"
    ? `https://www.facebook.com/${encodeURIComponent(target.id)}`
    : `https://www.facebook.com/${encodeURIComponent(target.id)}`;
  const scraped = await scrapeMetaCount(page, [
    /(\d[\d.,]*\s*[kKmMbB]?)\s+followers/i,
    /(\d[\d.,]*\s*[kKmMbB]?)\s+likes/i,
    /"follower_count"\s*:\s*(\d+)/,
    /"fan_count"\s*:\s*(\d+)/
  ]);
  if (scraped.ok) {
    return { ok: true, count: scraped.count, platform: "facebook", source: scraped.source, name: target.id };
  }
  return {
    ok: false,
    count: null,
    error: scraped.error || "facebook_unavailable",
    hint: "Facebook page counts usually need META_APP_TOKEN. Save the page link and retry after the token is set.",
    name: target.id
  };
}

export async function fetchPlatformCount(platform, link) {
  const p = String(platform || "").toLowerCase();
  if (p === "youtube") return fetchYoutubeSubscribers(link);
  if (p === "instagram") return fetchInstagramFollowers(link);
  if (p === "facebook") return fetchFacebookFollowers(link);
  return { ok: false, count: null, error: "unknown_platform" };
}

export function salesKv(env) {
  return env && (env.SALES || env.SALES_KV || null);
}

export function snapshotKey(creatorEmail, platform) {
  const mail = String(creatorEmail || "").trim().toLowerCase().replace(/[^a-z0-9@._+-]/g, "");
  const plat = String(platform || "").toLowerCase();
  return `creator:social:${mail}:${plat}`;
}

export function deltaPct(current, previous) {
  const cur = Number(current);
  const prev = Number(previous);
  if (!Number.isFinite(cur) || !Number.isFinite(prev) || prev <= 0) return null;
  return Math.round(((cur - prev) / prev) * 1000) / 10;
}
