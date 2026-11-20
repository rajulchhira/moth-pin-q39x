/**
 * Cloudflare Worker Cron — Phase 1 YouTube Growth Tracker collect.
 * Reuses Pages shared module so KV key rules stay identical.
 */

import { injectEnv } from "../../../functions/_shared/adapt.js";
import { runDailyCollect, youtubeApiKey, socialCollectSecret } from "../../../functions/_shared/social-growth.js";

async function collect(env) {
  injectEnv(env);
  if (!youtubeApiKey()) {
    return { ok: false, error: "missing_youtube_key" };
  }
  // Secret is required for HTTP collect; cron runs in-process and does not need to re-present it.
  if (!socialCollectSecret()) {
    // Still allow cron if only the key is set — secret protects the HTTP endpoint.
  }
  return runDailyCollect(env, { force: false });
}

export default {
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(
      collect(env).then((out) => {
        console.log("social-collect", JSON.stringify({
          ok: out.ok,
          skipped: out.skipped || false,
          day: out.day,
          okCount: out.okCount,
          failCount: out.failCount,
          total: out.total,
          reason: out.reason || out.error || null
        }));
      }).catch((err) => {
        console.error("social-collect-failed", String(err && err.message || err));
      })
    );
  },

  async fetch(request, env) {
    injectEnv(env);
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname ===="/health") {
      return Response.json({
        ok: true,
        service: "bizgarh-social-collect",
        youtubeKey: Boolean(youtubeApiKey()),
        collectSecret: Boolean(socialCollectSecret())
      });
    }
    if (request.method === "POST" && (url.pathname === "/run" || url.pathname === "/collect")) {
      const secret = socialCollectSecret();
      const auth = request.headers.get("authorization") || "";
      const headerSecret = request.headers.get("x-social-collect-secret") || "";
      const presented = /^Bearer\s+/i.test(auth) ? auth.replace(/^Bearer\s+/i, "").trim() : headerSecret.trim();
      if (!secret || presented !== secret) {
        return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
      }
      const out = await collect(env);
      return Response.json(out, { status: out.ok || out.skipped ? 200 : 500 });
    }
    return Response.json({ ok: false, error: "not_found" }, { status: 404 });
  }
};
