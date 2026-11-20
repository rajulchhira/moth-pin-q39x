import { pagesHandler } from "../../_shared/adapt.js";
import {
  requireCollectSecret,
  socialCors,
  socialJson
} from "../../_shared/social-auth.js";
import {
  collectYoutubeOne,
  getProfile,
  normEmail,
  runDailyCollect,
  salesKv,
  youtubeApiKey
} from "../../_shared/social-growth.js";
import { parseJsonBody } from "../../_shared/social-auth.js";

async function handler(event) {
  const origin = String((event.headers || {}).origin || (event.headers || {}).Origin || "");
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: socialCors(origin), body: "" };
  }
  if (event.httpMethod !== "POST") {
    return socialJson(event, { ok: false, error: "POST only" }, 405);
  }

  try {
    requireCollectSecret(event);
  } catch (err) {
    return socialJson(event, { ok: false, error: err.message, code: err.code || "" }, err.status || 401);
  }

  if (!salesKv(event.env)) {
    return socialJson(event, { ok: false, error: "SALES KV binding missing", code: "kv_missing" }, 503);
  }
  if (!youtubeApiKey()) {
    return socialJson(event, {
      ok: false,
      error: "YOUTUBE_API_KEY is not configured",
      code: "missing_youtube_key",
      hint: "Set YOUTUBE_API_KEY in Cloudflare Pages + Worker env (Dashboard), then redeploy."
    }, 503);
  }

  const body = parseJsonBody(event);
  const clientEmail = normEmail(body.clientEmail || body.email || "");
  const force = Boolean(body.force);

  try {
    if (clientEmail) {
      const profile = await getProfile(event.env, clientEmail, "youtube");
      if (!profile || profile.status !== "active") {
        return socialJson(event, { ok: false, error: "youtube_profile_not_found", code: "not_found" }, 404);
      }
      const result = await collectYoutubeOne(event.env, profile);
      return socialJson(event, {
        ok: !!result.ok,
        mode: "one",
        clientEmail,
        day: result.day || null,
        count: result.snap?.count ?? null,
        error: result.error || null,
        errorCode: result.errorCode || null,
        profile: result.profile
          ? {
              lastSuccessAt: result.profile.lastSuccessAt,
              lastError: result.profile.lastError,
              lastErrorCode: result.profile.lastErrorCode,
              canonicalId: result.profile.canonicalId
            }
          : null
      }, result.ok ? 200 : 502);
    }

    const out = await runDailyCollect(event.env, { force });
    return socialJson(event, out, out.ok || out.skipped ? 200 : 500);
  } catch (err) {
    return socialJson(event, {
      ok: false,
      error: err.message || "collect_failed",
      code: err.code || ""
    }, err.status || 500);
  }
}

export const onRequest = pagesHandler(handler);
