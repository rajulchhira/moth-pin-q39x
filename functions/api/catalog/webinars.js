/**
 * GET  /api/catalog/webinars — public read of shared webinar catalog (KV).
 * PUT  /api/catalog/webinars — control/staff write (same auth style as courses).
 */

import { pagesHandler } from "../../_shared/adapt.js";
import {
  parseJsonBody,
  resolveSocialActor,
  socialCors,
  socialJson
} from "../../_shared/social-auth.js";
import {
  emptyWebinarsDoc,
  readWebinarsDoc,
  writeWebinarsDoc
} from "../../_shared/catalog.js";

function assertWebinarsWrite(actor) {
  if (!actor || !actor.email) {
    const err = new Error("Sign in as staff to update webinars");
    err.status = 401;
    err.code = "unauthorized";
    throw err;
  }
}

async function handler(event) {
  const origin = String((event.headers || {}).origin || (event.headers || {}).Origin || "");
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: socialCors(origin), body: "" };
  }

  try {
    if (event.httpMethod === "GET") {
      const { ok, missing, doc, error } = await readWebinarsDoc(event.env);
      if (!ok && missing === "kv") {
        return socialJson(event, {
          ok: false,
          error: "SALES KV binding missing",
          code: "kv_missing",
          ...emptyWebinarsDoc()
        }, 503);
      }
      return socialJson(event, {
        ok: true,
        source: missing === "empty" ? "empty" : "kv",
        parseError: error || null,
        version: doc.version,
        updatedAt: doc.updatedAt,
        updatedBy: doc.updatedBy,
        webinars: doc.webinars || [],
        deleted: doc.deleted || []
      });
    }

    if (event.httpMethod === "PUT" || event.httpMethod === "POST" || event.httpMethod === "PATCH") {
      const body = parseJsonBody(event);
      const actor = resolveSocialActor(event, body);
      assertWebinarsWrite(actor);
      const doc = await writeWebinarsDoc(event.env, body, actor.email);
      return socialJson(event, {
        ok: true,
        version: doc.version,
        updatedAt: doc.updatedAt,
        updatedBy: doc.updatedBy,
        webinars: doc.webinars,
        deleted: doc.deleted
      });
    }

    return socialJson(event, { ok: false, error: "Method not allowed", code: "method" }, 405);
  } catch (err) {
    return socialJson(event, {
      ok: false,
      error: err.message || "error",
      code: err.code || ""
    }, err.status || 500);
  }
}

export const onRequest = pagesHandler(handler);
