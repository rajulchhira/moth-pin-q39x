import { pagesHandler } from "../../_shared/adapt.js";
import {
  fetchPlatformCount,
  salesKv,
  snapshotKey,
  deltaPct
} from "../../_shared/social.js";

const PLATFORMS = ["youtube", "instagram", "facebook"];
const SNAPSHOT_TTL_MS = 24 * 60 * 60 * 1000;

function cors(origin) {
  const allow = [
    "https://bizgarh.com",
    "https://www.bizgarh.com",
    "http://127.0.0.1:5510",
    "http://127.0.0.1:5500",
    "http://localhost:5510",
    "http://localhost:5500"
  ];
  return {
    "Access-Control-Allow-Origin": allow.includes(origin) ? origin : "https://www.bizgarh.com",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store"
  };
}

function json(body, status, origin) {
  return {
    statusCode: status || 200,
    headers: { "Content-Type": "application/json; charset=utf-8", ...cors(origin) },
    body: JSON.stringify(body)
  };
}

function parseBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch {
    return {};
  }
}

async function readSnapshot(kv, email, platform) {
  if (!kv) return null;
  try {
    const raw = await kv.get(snapshotKey(email, platform));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeSnapshot(kv, email, platform, row) {
  if (!kv) return;
  try {
    await kv.put(snapshotKey(email, platform), JSON.stringify(row));
  } catch { /* ignore */ }
}

function withDelta(current, previous) {
  if (!previous || previous.count == null || current.count == null) {
    return { ...current, deltaPct: null, previousCount: previous?.count ?? null, previousAt: previous?.at || null };
  }
  const age = Date.now() - Number(previous.at || 0);
  if (age < SNAPSHOT_TTL_MS) {
    return {
      ...current,
      deltaPct: null,
      previousCount: previous.count,
      previousAt: previous.at,
      deltaReadyInMs: SNAPSHOT_TTL_MS - age,
      note: "24h_delta_pending"
    };
  }
  return {
    ...current,
    deltaPct: deltaPct(current.count, previous.count),
    previousCount: previous.count,
    previousAt: previous.at
  };
}

async function refreshOne(env, email, platform, link, force) {
  const kv = salesKv(env);
  const prev = await readSnapshot(kv, email, platform);
  const now = Date.now();

  if (!force && prev && prev.count != null && now - Number(prev.at || 0) < 15 * 60 * 1000) {
    const older = prev.previous || null;
    return withDelta({
      ok: true,
      platform,
      count: prev.count,
      link: prev.link || link,
      source: prev.source || "cache",
      at: prev.at,
      cached: true
    }, older || (prev.baseline ? { count: prev.baseline, at: prev.baselineAt } : null));
  }

  const live = await fetchPlatformCount(platform, link);
  const at = new Date().toISOString();
  if (live.ok && live.count != null) {
    const baselineReady = prev && prev.count != null && (now - Number(prev.at || 0) >= SNAPSHOT_TTL_MS);
    const row = {
      count: live.count,
      at,
      link,
      source: live.source,
      previous: baselineReady
        ? { count: prev.count, at: prev.at }
        : (prev?.previous || (prev?.count != null ? { count: prev.count, at: prev.at } : null)),
      baseline: prev?.baseline ?? prev?.count ?? null,
      baselineAt: prev?.baselineAt || prev?.at || null
    };
    // Once 24h passed since last "previous" anchor, roll previous forward
    if (!row.previous && prev?.count != null) {
      row.previous = { count: prev.count, at: prev.at };
    }
    await writeSnapshot(kv, email, platform, row);
    return withDelta({
      ok: true,
      platform,
      count: live.count,
      link,
      source: live.source,
      at,
      cached: false,
      meta: { channelId: live.channelId, username: live.username, name: live.name }
    }, row.previous);
  }

  // Persist failure state lightly so UI can show last good count
  if (prev?.count != null) {
    return withDelta({
      ok: false,
      platform,
      count: prev.count,
      link: prev.link || link,
      source: prev.source || "stale",
      at: prev.at,
      error: live.error,
      hint: live.hint,
      stale: true
    }, prev.previous || null);
  }

  return {
    ok: false,
    platform,
    count: null,
    link,
    error: live.error || "fetch_failed",
    hint: live.hint || null,
    at
  };
}

async function handler(event) {
  const origin = String((event.headers || {}).origin || (event.headers || {}).Origin || "");
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors(origin), body: "" };
  }

  const qs = event.queryStringParameters || {};
  const body = event.httpMethod === "POST" ? parseBody(event) : {};
  const email = String(body.email || qs.email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return json({ ok: false, error: "email_required" }, 400, origin);
  }

  const links = body.links || {
    youtube: body.youtube || qs.youtube || "",
    instagram: body.instagram || qs.instagram || "",
    facebook: body.facebook || qs.facebook || ""
  };
  const force = Boolean(body.force || qs.force === "1");
  const only = String(body.platform || qs.platform || "").toLowerCase();
  const platforms = only && PLATFORMS.includes(only) ? [only] : PLATFORMS;

  const results = {};
  for (const platform of platforms) {
    const link = String(links[platform] || "").trim();
    if (!link) {
      results[platform] = { ok: false, platform, count: null, error: "link_missing" };
      continue;
    }
    results[platform] = await refreshOne(event.env, email, platform, link, force);
  }

  return json({
    ok: true,
    email,
    platforms: results,
    rules: {
      deltaWindowHours: 24,
      note: "Delta % appears after a prior snapshot is at least 24 hours old."
    }
  }, 200, origin);
}

export const onRequest = pagesHandler(handler);
