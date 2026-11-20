import { pagesHandler } from "../../_shared/adapt.js";
import {
  assertMutate,
  assertRead,
  parseJsonBody,
  resolveSocialActor,
  socialCors,
  socialJson
} from "../../_shared/social-auth.js";
import {
  getProfile,
  listAllActiveProfiles,
  listProfilesForClient,
  normEmail,
  softDeleteProfile,
  upsertProfile
} from "../../_shared/social-growth.js";

function publicProfile(row) {
  if (!row) return null;
  return {
    clientEmail: row.clientEmail,
    platform: row.platform,
    url: row.url,
    canonicalId: row.canonicalId || "",
    status: row.status,
    verification: row.verification || "unverified",
    verificationNote: row.verificationNote || "",
    displayName: row.displayName || "",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    updatedBy: row.updatedBy || "",
    lastSuccessAt: row.lastSuccessAt || null,
    lastAttemptAt: row.lastAttemptAt || null,
    lastError: row.lastError || null,
    lastErrorCode: row.lastErrorCode || null,
    unverified: (row.verification || "unverified") !== "admin_attested"
  };
}

async function handler(event) {
  const origin = String((event.headers || {}).origin || (event.headers || {}).Origin || "");
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: socialCors(origin), body: "" };
  }

  const qs = event.queryStringParameters || {};
  const body = ["POST", "PUT", "PATCH", "DELETE"].includes(event.httpMethod) ? parseJsonBody(event) : {};
  const actor = resolveSocialActor(event, body);

  try {
    if (event.httpMethod === "GET") {
      const clientEmail = normEmail(qs.clientEmail || qs.email || "");
      if (clientEmail) {
        assertRead(actor, clientEmail);
        const rows = await listProfilesForClient(event.env, clientEmail);
        return socialJson(event, { ok: true, clientEmail, profiles: rows.map(publicProfile) });
      }
      assertMutate(actor);
      const all = await listAllActiveProfiles(event.env);
      return socialJson(event, { ok: true, profiles: all.map(publicProfile) });
    }

    if (event.httpMethod === "POST" || event.httpMethod === "PUT" || event.httpMethod === "PATCH") {
      assertMutate(actor);
      const clientEmail = normEmail(body.clientEmail || body.email || "");
      const platform = String(body.platform || "").toLowerCase();
      const out = await upsertProfile(event.env, {
        clientEmail,
        platform,
        url: body.url,
        canonicalId: body.canonicalId,
        verification: body.verification,
        verificationNote: body.verificationNote,
        status: body.status,
        displayName: body.displayName
      }, actor.email);
      return socialJson(event, {
        ok: true,
        profile: publicProfile(out.profile),
        resolveWarning: out.resolveWarning
          ? { error: out.resolveWarning.error, errorCode: out.resolveWarning.errorCode }
          : null
      });
    }

    if (event.httpMethod === "DELETE") {
      assertMutate(actor);
      const clientEmail = normEmail(body.clientEmail || qs.clientEmail || "");
      const platform = String(body.platform || qs.platform || "").toLowerCase();
      const existing = await getProfile(event.env, clientEmail, platform);
      if (!existing) return socialJson(event, { ok: false, error: "not_found" }, 404);
      const out = await softDeleteProfile(event.env, clientEmail, platform, actor.email);
      return socialJson(event, { ok: true, profile: publicProfile(out?.profile || out) });
    }

    return socialJson(event, { ok: false, error: "method_not_allowed" }, 405);
  } catch (err) {
    return socialJson(event, {
      ok: false,
      error: err.message || "error",
      code: err.code || ""
    }, err.status || 500);
  }
}

export const onRequest = pagesHandler(handler);
