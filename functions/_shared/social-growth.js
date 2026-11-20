/**
 * Phase 1 Social Growth Tracker — YouTube Data API v3 + KV social:* keys.
 * Never touch digest:/sale:/creator:social: or other non-social prefixes.
 */

const PLATFORMS = ["youtube", "instagram", "facebook"];
const INDEX_KEY = "social:profiles:index";
const COLLECT_META_KEY = "social:collect:meta";
const COLLECT_LOCK_KEY = "social:collect:lock";
const LOCK_TTL_SECONDS = 14 * 60;

/** IST calendar day as YYYY-MM-DD (Asia/Kolkata). */
export function istDay(d) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(d || new Date());
}

function envGet(key, fallback) {
  const g = globalThis.process && globalThis.process.env ? globalThis.process.env : {};
  const v = g[key];
  return String(v == null ? fallback || "" : v).trim();
}

export function youtubeApiKey() {
  return envGet("YOUTUBE_API_KEY");
}

export function socialCollectSecret() {
  return envGet("SOCIAL_COLLECT_SECRET");
}

export function salesKv(env) {
  return env && (env.SALES || env.SALES_KV || null);
}

export function normEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function normPlatform(platform) {
  const p = String(platform || "").trim().toLowerCase();
  return PLATFORMS.includes(p) ? p : "";
}

export function profileKey(clientEmail, platform) {
  return `social:profile:${normEmail(clientEmail)}:${normPlatform(platform)}`;
}

export function byClientKey(clientEmail) {
  return `social:profiles:byClient:${normEmail(clientEmail)}`;
}

export function snapKey(clientEmail, platform, day) {
  return `social:snap:${normEmail(clientEmail)}:${normPlatform(platform)}:${day}`;
}

export function istToday(d) {
  return istDay(d || new Date());
}

export function assertSocialKey(key) {
  const k = String(key || "");
  if (!k.startsWith("social:")) {
    throw new Error("refusing non-social KV key: " + k.slice(0, 40));
  }
  return k;
}

async function kvGetJson(kv, key) {
  if (!kv) return null;
  assertSocialKey(key);
  try {
    const raw = await kv.get(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function kvPutJson(kv, key, value) {
  if (!kv) throw new Error("SALES KV binding missing");
  assertSocialKey(key);
  await kv.put(key, JSON.stringify(value));
}

export function parseYoutubeTarget(raw) {
  const url = String(raw || "").trim();
  if (!url) return { kind: "", id: "" };
  if (/^UC[\w-]{21,}$/.test(url)) return { kind: "id", id: url };
  if (url.startsWith("@")) return { kind: "handle", id: url.slice(1) };
  try {
    const u = new URL(url.startsWith("http") ? url : "https://" + url);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id ? { kind: "video", id } : { kind: "", id: "" };
    }
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts[0] === "channel" && parts[1]) return { kind: "id", id: parts[1] };
      if (parts[0] === "c" && parts[1]) return { kind: "custom", id: parts[1] };
      if (parts[0] === "user" && parts[1]) return { kind: "user", id: parts[1] };
      if (parts[0] && parts[0].startsWith("@")) {
        return { kind: "handle", id: parts[0].slice(1) };
      }
      const v = u.searchParams.get("v");
      if (v) return { kind: "video", id: v };
    }
  } catch {
    /* fall through */
  }
  return { kind: "handle", id: url.replace(/^@/, "") };
}

async function ytGet(path, params) {
  const key = youtubeApiKey();
  if (!key) return { error: "missing_youtube_key", errorCode: "missing_youtube_key" };
  const qs = new URLSearchParams({ ...params, key });
  let res;
  try {
    res = await fetch(`https://www.googleapis.com/youtube/v3/${path}?${qs}`);
  } catch (e) {
    return { error: "youtube_network", errorCode: "youtube_network", detail: String(e && e.message || e).slice(0, 120) };
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { error: "youtube_http_" + res.status, errorCode: "youtube_http_" + res.status, detail: body.slice(0, 200) };
  }
  return res.json();
}

/** Resolve URL/handle → UC… once. Avoids search.list (high quota). */
export async function resolveYoutubeChannelId(urlOrId) {
  const parsed = parseYoutubeTarget(urlOrId);
  if (!parsed.id) return { ok: false, channelId: "", error: "invalid_youtube_url", errorCode: "invalid_youtube_url" };
  if (!youtubeApiKey()) {
    return { ok: false, channelId: "", error: "missing_youtube_key", errorCode: "missing_youtube_key" };
  }

  if (parsed.kind === "id" && parsed.id.startsWith("UC")) {
    return { ok: true, channelId: parsed.id };
  }

  if (parsed.kind === "handle" || parsed.kind === "custom" || parsed.kind === "user") {
    const forHandle = await ytGet("channels", { part: "id", forHandle: parsed.id });
    if (forHandle.error) return { ok: false, channelId: "", ...forHandle };
    const id = forHandle?.items?.[0]?.id || "";
    if (id) return { ok: true, channelId: id };
    return { ok: false, channelId: "", error: "youtube_channel_not_found", errorCode: "youtube_channel_not_found" };
  }

  if (parsed.kind === "video") {
    const vid = await ytGet("videos", { part: "snippet", id: parsed.id });
    if (vid.error) return { ok: false, channelId: "", ...vid };
    const id = vid?.items?.[0]?.snippet?.channelId || "";
    if (id) return { ok: true, channelId: id };
    return { ok: false, channelId: "", error: "youtube_channel_not_found", errorCode: "youtube_channel_not_found" };
  }

  return { ok: false, channelId: "", error: "invalid_youtube_url", errorCode: "invalid_youtube_url" };
}

export async function fetchYoutubeSubscriberCount(channelId) {
  const id = String(channelId || "").trim();
  if (!id.startsWith("UC")) {
    return { ok: false, count: null, error: "invalid_channel_id", errorCode: "invalid_channel_id" };
  }
  if (!youtubeApiKey()) {
    return { ok: false, count: null, error: "missing_youtube_key", errorCode: "missing_youtube_key" };
  }
  const data = await ytGet("channels", { part: "statistics,snippet", id });
  if (data.error) return { ok: false, count: null, ...data };
  const item = data?.items?.[0];
  if (!item) return { ok: false, count: null, error: "youtube_channel_not_found", errorCode: "youtube_channel_not_found" };
  const hidden = item.statistics?.hiddenSubscriberCount === true;
  if (hidden) {
    return {
      ok: false,
      count: null,
      error: "subscribers_hidden",
      errorCode: "subscribers_hidden",
      title: item.snippet?.title || ""
    };
  }
  const n = Number(item.statistics?.subscriberCount);
  if (!Number.isFinite(n)) {
    return { ok: false, count: null, error: "youtube_no_stats", errorCode: "youtube_no_stats" };
  }
  return {
    ok: true,
    count: n,
    channelId: id,
    title: item.snippet?.title || "",
    source: "youtube_data_api_v3"
  };
}

export function emptyProfile(partial) {
  const now = new Date().toISOString();
  return {
    clientEmail: normEmail(partial.clientEmail),
    platform: normPlatform(partial.platform),
    url: String(partial.url || "").trim(),
    canonicalId: String(partial.canonicalId || "").trim(),
    status: partial.status === "deleted" ? "deleted" : "active",
    verification: ["unverified", "admin_attested", "untrackable", "api_blocked"].includes(partial.verification)
      ? partial.verification
      : "unverified",
    verificationNote: String(partial.verificationNote || ""),
    createdAt: partial.createdAt || now,
    updatedAt: now,
    updatedBy: String(partial.updatedBy || ""),
    lastSuccessAt: partial.lastSuccessAt || null,
    lastAttemptAt: partial.lastAttemptAt || null,
    lastError: partial.lastError || null,
    lastErrorCode: partial.lastErrorCode || null,
    displayName: String(partial.displayName || "")
  };
}

async function readIndex(kv) {
  const idx = await kvGetJson(kv, INDEX_KEY);
  return Array.isArray(idx?.entries) ? idx.entries : [];
}

async function writeIndex(kv, entries) {
  await kvPutJson(kv, INDEX_KEY, { entries, updatedAt: new Date().toISOString() });
}

async function syncIndexes(kv, profile) {
  const email = normEmail(profile.clientEmail);
  const platform = normPlatform(profile.platform);
  const entries = await readIndex(kv);
  const key = `${email}|${platform}`;
  const next = entries.filter((e) => `${e.clientEmail}|${e.platform}` !== key);
  if (profile.status === "active") {
    next.push({ clientEmail: email, platform });
  }
  next.sort((a, b) => String(a.clientEmail).localeCompare(b.clientEmail) || String(a.platform).localeCompare(b.platform));
  await writeIndex(kv, next);

  const by = await kvGetJson(kv, byClientKey(email));
  const platforms = Array.isArray(by?.platforms) ? by.platforms.filter((p) => p !== platform) : [];
  if (profile.status === "active") platforms.push(platform);
  await kvPutJson(kv, byClientKey(email), {
    clientEmail: email,
    platforms: [...new Set(platforms)].sort(),
    updatedAt: new Date().toISOString()
  });
}

export async function getProfile(env, clientEmail, platform) {
  const kv = salesKv(env);
  if (!kv) return null;
  return kvGetJson(kv, profileKey(clientEmail, platform));
}

export async function listProfilesForClient(env, clientEmail) {
  const kv = salesKv(env);
  if (!kv) return [];
  const by = await kvGetJson(kv, byClientKey(clientEmail));
  const platforms = Array.isArray(by?.platforms) ? by.platforms : PLATFORMS;
  const out = [];
  for (const p of platforms) {
    const row = await getProfile(env, clientEmail, p);
    if (row && row.status !== "deleted") out.push(row);
  }
  return out;
}

export async function listAllActiveProfiles(env, platformFilter) {
  const kv = salesKv(env);
  if (!kv) return [];
  const entries = await readIndex(kv);
  const out = [];
  for (const e of entries) {
    if (platformFilter && e.platform !== platformFilter) continue;
    const row = await getProfile(env, e.clientEmail, e.platform);
    if (row && row.status === "active") out.push(row);
  }
  return out;
}

export async function upsertProfile(env, input, actorEmail) {
  const kv = salesKv(env);
  if (!kv) throw Object.assign(new Error("SALES KV binding missing"), { status: 503, code: "kv_missing" });

  const platform = normPlatform(input.platform);
  const clientEmail = normEmail(input.clientEmail);
  if (!platform || !clientEmail || !clientEmail.includes("@")) {
    throw Object.assign(new Error("clientEmail and platform required"), { status: 400, code: "bad_request" });
  }
  const url = String(input.url || "").trim();
  if (!url && input.status !== "deleted") {
    throw Object.assign(new Error("url required"), { status: 400, code: "url_required" });
  }

  const existing = await getProfile(env, clientEmail, platform);
  let canonicalId = String(input.canonicalId || existing?.canonicalId || "").trim();
  let displayName = String(input.displayName || existing?.displayName || "");

  if (platform === "youtube" && url && (!canonicalId || input.url !== existing?.url)) {
    const resolved = await resolveYoutubeChannelId(url);
    if (resolved.ok) canonicalId = resolved.channelId;
    else if (!canonicalId) {
      // Keep profile savable; collect will retry. Surface resolve error on profile.
      const profile = emptyProfile({
        ...(existing || {}),
        clientEmail,
        platform,
        url,
        canonicalId: "",
        verification: input.verification || existing?.verification || "unverified",
        verificationNote: input.verificationNote != null ? input.verificationNote : (existing?.verificationNote || ""),
        createdAt: existing?.createdAt,
        updatedBy: actorEmail,
        status: input.status === "deleted" ? "deleted" : "active",
        lastError: resolved.error || "resolve_failed",
        lastErrorCode: resolved.errorCode || "resolve_failed",
        lastAttemptAt: new Date().toISOString(),
        lastSuccessAt: existing?.lastSuccessAt || null,
        displayName
      });
      await kvPutJson(kv, profileKey(clientEmail, platform), profile);
      await syncIndexes(kv, profile);
      return { profile, resolveWarning: resolved };
    }
  }

  if (platform === "instagram" || platform === "facebook") {
    // Phase 1: store URL only; mark api_blocked unless admin already set untrackable
    const v = input.verification || existing?.verification;
    if (!v || v === "unverified") {
      /* keep unverified; cards show API Access Required via platform gate */
    }
  }

  const profile = emptyProfile({
    ...(existing || {}),
    clientEmail,
    platform,
    url,
    canonicalId,
    verification: input.verification || existing?.verification || "unverified",
    verificationNote: input.verificationNote != null ? String(input.verificationNote) : (existing?.verificationNote || ""),
    createdAt: existing?.createdAt,
    updatedBy: actorEmail,
    status: input.status === "deleted" ? "deleted" : "active",
    lastSuccessAt: existing?.lastSuccessAt || null,
    lastAttemptAt: existing?.lastAttemptAt || null,
    lastError: existing?.lastError || null,
    lastErrorCode: existing?.lastErrorCode || null,
    displayName
  });

  await kvPutJson(kv, profileKey(clientEmail, platform), profile);
  await syncIndexes(kv, profile);
  return { profile };
}

export async function softDeleteProfile(env, clientEmail, platform, actorEmail) {
  const existing = await getProfile(env, clientEmail, platform);
  if (!existing) return null;
  return upsertProfile(env, { ...existing, status: "deleted" }, actorEmail);
}

async function writeSnapshotOnce(kv, clientEmail, platform, day, snap) {
  const key = snapKey(clientEmail, platform, day);
  const prev = await kvGetJson(kv, key);
  if (prev && prev.count != null && snap.count != null && Number(prev.count) === Number(snap.count)) {
    return { wrote: false, snap: prev };
  }
  if (prev && prev.count != null && snap.count == null) {
    // Never blank a good day with a failed collect
    return { wrote: false, snap: prev };
  }
  if (prev && prev.count != null && snap.count != null && Number(prev.count) !== Number(snap.count)) {
    // Same IST day recount — allow update to latest successful reading
    await kvPutJson(kv, key, snap);
    return { wrote: true, snap };
  }
  await kvPutJson(kv, key, snap);
  return { wrote: true, snap };
}

export async function collectYoutubeOne(env, profile) {
  const kv = salesKv(env);
  if (!kv) return { ok: false, error: "kv_missing", errorCode: "kv_missing" };
  if (!profile || profile.platform !== "youtube" || profile.status !== "active") {
    return { ok: false, error: "skip", errorCode: "skip" };
  }

  const nowIso = new Date().toISOString();
  const day = istToday();
  let canonicalId = String(profile.canonicalId || "").trim();
  let resolveErr = null;

  if (!canonicalId) {
    const resolved = await resolveYoutubeChannelId(profile.url);
    if (resolved.ok) canonicalId = resolved.channelId;
    else resolveErr = resolved;
  }

  const attempt = {
    ...profile,
    lastAttemptAt: nowIso,
    canonicalId: canonicalId || profile.canonicalId || ""
  };

  if (!canonicalId) {
    const updated = {
      ...attempt,
      lastError: resolveErr?.error || "youtube_channel_not_found",
      lastErrorCode: resolveErr?.errorCode || "youtube_channel_not_found"
    };
    await kvPutJson(kv, profileKey(profile.clientEmail, "youtube"), updated);
    return { ok: false, error: updated.lastError, errorCode: updated.lastErrorCode, profile: updated, day };
  }

  const live = await fetchYoutubeSubscriberCount(canonicalId);
  if (!live.ok || live.count == null) {
    const updated = {
      ...attempt,
      lastError: live.error || "collect_failed",
      lastErrorCode: live.errorCode || "collect_failed",
      displayName: live.title || attempt.displayName || ""
    };
    await kvPutJson(kv, profileKey(profile.clientEmail, "youtube"), updated);
    return { ok: false, error: updated.lastError, errorCode: updated.lastErrorCode, profile: updated, day };
  }

  const snap = {
    clientEmail: normEmail(profile.clientEmail),
    platform: "youtube",
    day,
    count: live.count,
    collectedAt: nowIso,
    source: live.source || "youtube_data_api_v3",
    canonicalId
  };
  const written = await writeSnapshotOnce(kv, profile.clientEmail, "youtube", day, snap);
  const updated = {
    ...attempt,
    canonicalId,
    displayName: live.title || attempt.displayName || "",
    lastSuccessAt: nowIso,
    lastError: null,
    lastErrorCode: null
  };
  await kvPutJson(kv, profileKey(profile.clientEmail, "youtube"), updated);
  return { ok: true, profile: updated, snap: written.snap, wrote: written.wrote, day };
}

export async function acquireCollectLock(env) {
  const kv = salesKv(env);
  if (!kv) return { ok: false, reason: "kv_missing" };
  const existing = await kvGetJson(kv, COLLECT_LOCK_KEY);
  const now = Date.now();
  if (existing?.until && Number(existing.until) > now) {
    return { ok: false, reason: "locked", until: existing.until };
  }
  const until = now + LOCK_TTL_SECONDS * 1000;
  await kvPutJson(kv, COLLECT_LOCK_KEY, { until, at: new Date().toISOString() });
  return { ok: true, until };
}

export async function releaseCollectLock(env) {
  const kv = salesKv(env);
  if (!kv) return;
  assertSocialKey(COLLECT_LOCK_KEY);
  try {
    await kv.put(COLLECT_LOCK_KEY, JSON.stringify({ until: 0, releasedAt: new Date().toISOString() }));
  } catch {
    /* ignore */
  }
}

export async function runDailyCollect(env, opts) {
  const options = opts || {};
  const lock = await acquireCollectLock(env);
  if (!lock.ok && !options.force) {
    return { ok: false, skipped: true, reason: lock.reason || "locked" };
  }

  const startedAt = new Date().toISOString();
  const day = istToday();
  const profiles = await listAllActiveProfiles(env, "youtube");
  const results = [];
  let okCount = 0;
  let failCount = 0;

  try {
    for (const profile of profiles) {
      const r = await collectYoutubeOne(env, profile);
      results.push({
        clientEmail: profile.clientEmail,
        ok: !!r.ok,
        error: r.error || null,
        errorCode: r.errorCode || null,
        count: r.snap?.count ?? null,
        day: r.day || day
      });
      if (r.ok) okCount += 1;
      else if (r.errorCode !== "skip") failCount += 1;
    }

    const meta = {
      lastRunAt: startedAt,
      finishedAt: new Date().toISOString(),
      day,
      okCount,
      failCount,
      total: profiles.length,
      platform: "youtube"
    };
    const kv = salesKv(env);
    if (kv) await kvPutJson(kv, COLLECT_META_KEY, meta);

    return { ok: true, ...meta, results };
  } finally {
    await releaseCollectLock(env);
  }
}

/** Failure-safe growth: null when either endpoint missing/failed — never invent 0%. */
export function safeGrowth(currentCount, priorCount) {
  if (currentCount == null || priorCount == null) {
    return { delta: null, deltaPct: null, reason: "insufficient_history" };
  }
  const cur = Number(currentCount);
  const prior = Number(priorCount);
  if (!Number.isFinite(cur) || !Number.isFinite(prior)) {
    return { delta: null, deltaPct: null, reason: "insufficient_history" };
  }
  const delta = cur - prior;
  if (prior === 0) {
    return { delta, deltaPct: null, reason: "prior_zero" };
  }
  return {
    delta,
    deltaPct: Math.round((delta / prior) * 1000) / 10,
    reason: null
  };
}

export async function readSnap(env, clientEmail, platform, day) {
  const kv = salesKv(env);
  if (!kv) return null;
  return kvGetJson(kv, snapKey(clientEmail, platform, day));
}

export function listIstDays(daysBack) {
  const n = Math.min(Math.max(Number(daysBack) || 30, 1), 365);
  const today = istToday();
  const [y, m, day] = today.split("-").map(Number);
  // Midnight IST expressed as UTC instant for the start of today
  const startIstMs = Date.UTC(y, m - 1, day, 0, 0, 0) - (5.5 * 3600000);
  const out = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    out.push(istDay(new Date(startIstMs - i * 86400000)));
  }
  return out;
}

export async function loadSeries(env, clientEmail, platform, daysBack) {
  const days = listIstDays(Math.min(Math.max(Number(daysBack) || 30, 1), 365));
  const points = [];
  for (const day of days) {
    const snap = await readSnap(env, clientEmail, platform, day);
    points.push({
      day,
      count: snap && snap.count != null && Number.isFinite(Number(snap.count)) ? Number(snap.count) : null,
      collectedAt: snap?.collectedAt || null,
      source: snap?.source || null,
      available: !!(snap && snap.count != null)
    });
  }
  const available = points.filter((p) => p.available);
  const latest = available.length ? available[available.length - 1] : null;
  const windowStart = points.length ? points[0] : null;
  const windowEnd = points.length ? points[points.length - 1] : null;
  // Period delta only when both ends of the requested window have successful snaps.
  // Gaps mid-window still appear on the chart; never invent a 0% from sparse data.
  const growth = windowStart?.available && windowEnd?.available
    ? safeGrowth(windowEnd.count, windowStart.count)
    : { delta: null, deltaPct: null, reason: "insufficient_history" };

  return {
    platform,
    clientEmail: normEmail(clientEmail),
    days: points,
    latest,
    growth,
    gaps: points.filter((p) => !p.available).map((p) => p.day)
  };
}

export function platformPhase1Status(platform) {
  const p = normPlatform(platform);
  if (p === "youtube") return { live: true, gate: null };
  if (p === "instagram" || p === "facebook") {
    return { live: false, gate: "api_access_required", label: "API Access Required" };
  }
  return { live: false, gate: "unknown_platform", label: "Data unavailable" };
}

export { PLATFORMS, INDEX_KEY, COLLECT_META_KEY };
