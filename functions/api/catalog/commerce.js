/**
 * GET  /api/catalog/commerce — shared Control commerce ledger (KV).
 *   Staff: full orders/payments/enrolls + digest import/summary.
 * PUT  /api/catalog/commerce — control merge write (staff session).
 * POST /api/catalog/commerce — append/merge payload (staff) or no-op probe.
 */

import { pagesHandler } from "../../_shared/adapt.js";
import {
  parseJsonBody,
  resolveSocialActor,
  socialCors,
  socialJson
} from "../../_shared/social-auth.js";
import {
  emptyCommerceDoc,
  importDigestsIntoCommerce,
  mergeWriteCommerceDoc,
  readCommerceDoc
} from "../../_shared/commerce.js";

function assertStaff(actor) {
  if (!actor || !actor.email) {
    const err = new Error("Sign in as staff to read or update commerce");
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
      const actor = resolveSocialActor(event, {});
      assertStaff(actor);
      const { ok, missing, doc, error } = await readCommerceDoc(event.env);
      if (!ok && missing === "kv") {
        return socialJson(event, {
          ok: false,
          error: "SALES KV binding missing",
          code: "kv_missing",
          ...emptyCommerceDoc()
        }, 503);
      }
      // Always scan digests so Control can surface real creator PAID sales
      // that were recorded via /api/welcome before this ledger existed.
      const imported = await importDigestsIntoCommerce(event.env, { persistSummary: true });
      const out = imported.doc || doc;
      return socialJson(event, {
        ok: true,
        source: missing === "empty" && !(out.orders || []).length ? "empty" : "kv",
        parseError: error || null,
        version: out.version,
        updatedAt: out.updatedAt,
        updatedBy: out.updatedBy,
        orders: out.orders || [],
        payments: out.payments || [],
        enrolls: out.enrolls || [],
        refunds: out.refunds || [],
        commissions: out.commissions || [],
        users: out.users || [],
        digestSummary: imported.digestSummary || out.digestSummary || null,
        imported: imported.imported || 0
      });
    }

    if (event.httpMethod === "PUT" || event.httpMethod === "POST" || event.httpMethod === "PATCH") {
      const body = parseJsonBody(event);
      const actor = resolveSocialActor(event, body);
      assertStaff(actor);
      const doc = await mergeWriteCommerceDoc(event.env, body, actor.email);
      return socialJson(event, {
        ok: true,
        version: doc.version,
        updatedAt: doc.updatedAt,
        updatedBy: doc.updatedBy,
        orders: doc.orders,
        payments: doc.payments,
        enrolls: doc.enrolls,
        refunds: doc.refunds,
        commissions: doc.commissions,
        users: doc.users,
        digestSummary: doc.digestSummary
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
