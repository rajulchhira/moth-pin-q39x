import { pagesHandler } from "../../_shared/adapt.js";
import { listVideos, vdoReady } from "../../_shared/vdocipher.js";
import { resolveSocialActor, socialCors, socialJson } from "../../_shared/social-auth.js";

async function handler(event) {
  const origin = String((event.headers || {}).origin || (event.headers || {}).Origin || "");
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: socialCors(origin), body: "" };
  }
  if (event.httpMethod !== "GET") {
    return socialJson(event, { ok: false, error: "GET only", ready: vdoReady() }, 405);
  }
  const actor = resolveSocialActor(event, {});
  if (!actor || !actor.email) {
    return socialJson(event, { ok: false, error: "Sign in as staff to list DRM videos", code: "unauthorized", ready: vdoReady() }, 401);
  }
  try {
    const qs = event.queryStringParameters || {};
    const out = await listVideos({
      page: qs.page,
      limit: qs.limit,
      q: qs.q || qs.query || ""
    });
    return socialJson(event, { ok: true, ready: true, ...out });
  } catch (err) {
    return socialJson(event, {
      ok: false,
      error: err.message || "Could not list DRM videos",
      ready: vdoReady()
    }, err.status || 500);
  }
}

export const onRequest = pagesHandler(handler);
