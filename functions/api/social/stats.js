import { pagesHandler } from "../../_shared/adapt.js";
import {
  assertRead,
  parseJsonBody,
  resolveSocialActor,
  socialCors,
  socialJson
} from "../../_shared/social-auth.js";
import {
  getProfile,
  loadSeries,
  listProfilesForClient,
  normEmail,
  platformPhase1Status,
  salesKv
} from "../../_shared/social-growth.js";

function verificationBadge(profile) {
  const v = profile?.verification || "unverified";
  if (v === "admin_attested") {
    return { kind: "verified", label: "Verified by Bizgarh" };
  }
  if (v === "untrackable") {
    return { kind: "unavailable", label: "Data unavailable" };
  }
  if (v === "api_blocked") {
    return { kind: "api_access_required", label: "API Access Required" };
  }
  return { kind: "unverified", label: "Unverified" };
}

function cardFor(profile, series, platformHint) {
  const platform = profile?.platform || series?.platform || platformHint || "";
  const gate = platformPhase1Status(platform);

  if (!gate.live) {
    return {
      platform,
      url: profile?.url || "",
      status: "api_access_required",
      label: gate.label || "API Access Required",
      count: null,
      growth: { delta: null, deltaPct: null, reason: "api_access_required" },
      series: null,
      badge: verificationBadge(profile),
      lastSuccessAt: null,
      dataUnavailable: false
    };
  }

  if (!profile) {
    const plat = platform || "youtube";
    return {
      platform: plat,
      url: "",
      status: "missing_profile",
      label: "No URL configured",
      count: null,
      growth: { delta: null, deltaPct: null, reason: "missing_profile" },
      series: null,
      badge: { kind: "unverified", label: "Unverified" },
      lastSuccessAt: null,
      dataUnavailable: true
    };
  }

  const latest = series?.latest || null;
  const hasCount = latest && latest.count != null;
  const failedRecently = !hasCount && (profile.lastErrorCode || profile.lastError);

  return {
    platform,
    url: profile.url || "",
    canonicalId: profile.canonicalId || "",
    displayName: profile.displayName || "",
    status: hasCount ? "ok" : "data_unavailable",
    label: hasCount ? null : "Data unavailable",
    count: hasCount ? latest.count : null,
    growth: series?.growth || { delta: null, deltaPct: null, reason: "insufficient_history" },
    series: {
      days: (series?.days || []).map((p) => ({
        day: p.day,
        count: p.available ? p.count : null,
        available: p.available
      })),
      gaps: series?.gaps || []
    },
    badge: verificationBadge(profile),
    lastSuccessAt: profile.lastSuccessAt || null,
    lastErrorCode: failedRecently ? (profile.lastErrorCode || "collect_failed") : null,
    dataUnavailable: !hasCount
  };
}

async function handler(event) {
  const origin = String((event.headers || {}).origin || (event.headers || {}).Origin || "");
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: socialCors(origin), body: "" };
  }
  if (event.httpMethod !== "GET" && event.httpMethod !== "POST") {
    return socialJson(event, { ok: false, error: "method_not_allowed" }, 405);
  }

  const qs = event.queryStringParameters || {};
  const body = event.httpMethod === "POST" ? parseJsonBody(event) : {};
  const actor = resolveSocialActor(event, body);
  const clientEmail = normEmail(body.clientEmail || body.email || qs.clientEmail || qs.email || "");
  const days = Math.min(Math.max(Number(body.days || qs.days || 30) || 30, 1), 90);

  try {
    assertRead(actor, clientEmail);
    if (!salesKv(event.env)) {
      return socialJson(event, { ok: false, error: "SALES KV binding missing", code: "kv_missing" }, 503);
    }

    const profiles = await listProfilesForClient(event.env, clientEmail);
    const byPlatform = Object.fromEntries(profiles.map((p) => [p.platform, p]));
    const platforms = ["youtube", "instagram", "facebook"];
    const cards = {};

    for (const platform of platforms) {
      const profile = byPlatform[platform] || await getProfile(event.env, clientEmail, platform);
      if (platform === "youtube" && profile && profile.status === "active") {
        const series = await loadSeries(event.env, clientEmail, "youtube", days);
        cards.youtube = cardFor(profile, series);
      } else if (platform === "youtube") {
        cards.youtube = cardFor(profile || null, null, "youtube");
      } else {
        cards[platform] = cardFor(
          profile && profile.status !== "deleted" ? profile : { platform, url: profile?.url || "", verification: profile?.verification || "unverified" },
          null,
          platform
        );
      }
    }

    return socialJson(event, {
      ok: true,
      clientEmail,
      days,
      cards,
      rules: {
        noDummyStats: true,
        growthRequiresHistory: true,
        igFb: "api_access_required",
        unverifiedDefault: true
      }
    });
  } catch (err) {
    return socialJson(event, {
      ok: false,
      error: err.message || "error",
      code: err.code || ""
    }, err.status || 500);
  }
}

export const onRequest = pagesHandler(handler);
