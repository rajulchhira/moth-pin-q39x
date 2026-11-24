/**
 * GET  /api/catalog/staff — shared staff / sub-admin roster (KV).
 *   Authenticated staff: full rows (incl. passwords for control sync).
 *   Public: grantedEmails + password-free roster for access checks.
 * PUT  /api/catalog/staff — control/staff write (/control is source of truth).
 */

import { pagesHandler } from "../../_shared/adapt.js";
import {
  parseJsonBody,
  resolveSocialActor,
  socialCors,
  socialJson
} from "../../_shared/social-auth.js";
import {
  emptyStaffDoc,
  readStaffDoc,
  staffPublicRoster,
  writeStaffDoc
} from "../../_shared/catalog.js";

function assertStaffWrite(actor) {
  if (!actor || !actor.email) {
    const err = new Error("Sign in as staff to update the admin list");
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
      const { ok, missing, doc, error } = await readStaffDoc(event.env);
      if (!ok && missing === "kv") {
        return socialJson(event, {
          ok: false,
          error: "SALES KV binding missing",
          code: "kv_missing",
          ...emptyStaffDoc(),
          roster: []
        }, 503);
      }
      const actor = resolveSocialActor(event, {});
      const base = {
        ok: true,
        source: missing === "empty" ? "empty" : "kv",
        parseError: error || null,
        version: doc.version,
        updatedAt: doc.updatedAt,
        updatedBy: doc.updatedBy,
        grantedEmails: doc.grantedEmails || []
      };
      // Full staff (with passwords) only for signed-in control/staff clients.
      if (actor && actor.email) {
        return socialJson(event, {
          ...base,
          staff: doc.staff || [],
          roster: staffPublicRoster(doc.staff || [])
        });
      }
      return socialJson(event, {
        ...base,
        staff: [],
        roster: staffPublicRoster(doc.staff || [])
      });
    }

    if (event.httpMethod === "PUT" || event.httpMethod === "POST" || event.httpMethod === "PATCH") {
      const body = parseJsonBody(event);
      const actor = resolveSocialActor(event, body);
      assertStaffWrite(actor);
      const doc = await writeStaffDoc(event.env, body, actor.email);
      return socialJson(event, {
        ok: true,
        version: doc.version,
        updatedAt: doc.updatedAt,
        updatedBy: doc.updatedBy,
        staff: doc.staff,
        grantedEmails: doc.grantedEmails,
        roster: staffPublicRoster(doc.staff)
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
