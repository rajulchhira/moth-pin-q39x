/**
 * GET  /api/catalog/commerce — shared Control commerce ledger (KV).
 *   Staff: full orders/payments/enrolls + digest import/summary (all creators).
 * PUT  /api/catalog/commerce — control merge write (staff session).
 * POST /api/catalog/commerce —
 *   Staff: merge write (same as PUT).
 *   Trusted origin + body.sale: append one PAID sale (public purchase beacon;
 *   any sub-admin/creator course — same trust model as /api/welcome).
 */

import { pagesHandler } from "../../_shared/adapt.js";
import {
  parseJsonBody,
  resolveSocialActor,
  socialCors,
  socialJson
} from "../../_shared/social-auth.js";
import {
  appendCommerceSale,
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

function header(event, name) {
  const headers = event.headers || {};
  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(headers)) {
    if (String(k).toLowerCase() === lower) return String(v || "");
  }
  return "";
}

const TRUSTED_ORIGINS = new Set([
  "https://bizgarh.com",
  "https://www.bizgarh.com",
  "http://127.0.0.1:5510",
  "http://127.0.0.1:5500",
  "http://localhost:5510",
  "http://localhost:5500"
]);

function isTrustedBrowserOrigin(event) {
  const origin = header(event, "origin");
  if (origin && TRUSTED_ORIGINS.has(origin)) return true;
  const referer = header(event, "referer");
  if (!referer) return false;
  try {
    return TRUSTED_ORIGINS.has(new URL(referer).origin);
  } catch {
    return false;
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
      // Scan digests for every creator (any sub-admin), not only Rehan.
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

      // Public purchase beacon: one PAID sale for any course owner / sub-admin.
      if (event.httpMethod === "POST" && body && body.sale && typeof body.sale === "object") {
        if (!actor?.email && !isTrustedBrowserOrigin(event)) {
          return socialJson(event, { ok: false, error: "Forbidden", code: "forbidden" }, 403);
        }
        const sale = body.sale;
        const doc = await appendCommerceSale(event.env, {
          creatorEmail: sale.creatorEmail,
          studentEmail: sale.studentEmail || sale.email,
          studentName: sale.studentName || sale.name || "",
          courseId: sale.courseId,
          amount: sale.net != null ? sale.net : sale.amount,
          source: sale.source || "course_owner",
          referralCode: sale.referralCode || "",
          creatorId: sale.creatorId || "",
          tx: sale.tx || "",
          at: sale.at || new Date().toISOString()
        });
        if (!doc) {
          return socialJson(event, { ok: false, error: "Invalid sale", code: "bad_sale" }, 400);
        }
        return socialJson(event, {
          ok: true,
          appended: true,
          version: doc.version,
          updatedAt: doc.updatedAt,
          orders: doc.orders,
          payments: doc.payments,
          enrolls: doc.enrolls
        });
      }

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
