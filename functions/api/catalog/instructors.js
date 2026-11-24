/**
 * GET  /api/catalog/instructors — public read of shared instructor faces (KV).
 * PUT  /api/catalog/instructors — control/staff write (same auth style as courses).
 */

import { pagesHandler } from "../../_shared/adapt.js";
import {
  parseJsonBody,
  resolveSocialActor,
  socialCors,
  socialJson
} from "../../_shared/social-auth.js";
import {
  emptyInstructorsDoc,
  readInstructorsDoc,
  writeInstructorsDoc
} from "../../_shared/catalog.js";

function assertInstructorsWrite(actor) {
  if (!actor || !actor.email) {
    const err = new Error("Sign in as staff to update instructors");
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
      const { ok, missing, doc, error } = await readInstructorsDoc(event.env);
      if (!ok && missing === "kv") {
        return socialJson(event, {
          ok: false,
          error: "SALES KV binding missing",
          code: "kv_missing",
          ...emptyInstructorsDoc()
        }, 503);
      }
      return socialJson(event, {
        ok: true,
        source: missing === "empty" ? "empty" : "kv",
        parseError: error || null,
        version: doc.version,
        updatedAt: doc.updatedAt,
        updatedBy: doc.updatedBy,
        edits: doc.edits || {}
      });
    }

    if (event.httpMethod === "PUT" || event.httpMethod === "POST" || event.httpMethod === "PATCH") {
      const body = parseJsonBody(event);
      const actor = resolveSocialActor(event, body);
      assertInstructorsWrite(actor);
      const doc = await writeInstructorsDoc(event.env, body, actor.email);
      return socialJson(event, {
        ok: true,
        version: doc.version,
        updatedAt: doc.updatedAt,
        updatedBy: doc.updatedBy,
        edits: doc.edits
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
