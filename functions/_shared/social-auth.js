/**
 * RBAC for Social Growth Tracker APIs.
 * Staff identity is asserted via headers (matches localStorage control-plane session).
 * Collect / system jobs authenticate with SOCIAL_COLLECT_SECRET.
 */

import { socialCollectSecret, normEmail } from "./social-growth.js";

const ALLOW_ORIGINS = [
  "https://bizgarh.com",
  "https://www.bizgarh.com",
  "http://127.0.0.1:5510",
  "http://127.0.0.1:5500",
  "http://localhost:5510",
  "http://localhost:5500"
];

/** Hardcoded platform owners (same as public SUPER_ADMINS + desk owner). */
const HARD_ADMIN_EMAILS = new Set([
  "admin@bizgarh.in",
  "rajulchhira1@gmail.com",
  "bizgarh@gmail.com"
]);

function header(event, name) {
  const headers = event.headers || {};
  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(headers)) {
    if (String(k).toLowerCase() === lower) return String(v || "");
  }
  return "";
}

export function socialCors(origin) {
  const o = String(origin || "");
  return {
    "Access-Control-Allow-Origin": ALLOW_ORIGINS.includes(o) ? o : "https://www.bizgarh.com",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Staff-Email, X-Staff-Role, X-Staff-Creator, X-Social-Collect-Secret",
    "Cache-Control": "no-store"
  };
}

export function socialJson(event, body, status) {
  const origin = header(event, "origin");
  return {
    statusCode: status || 200,
    headers: { "Content-Type": "application/json; charset=utf-8", ...socialCors(origin) },
    body: JSON.stringify(body)
  };
}

function timingSafeEqual(a, b) {
  const x = String(a || "");
  const y = String(b || "");
  if (!x || !y || x.length !== y.length) return false;
  let out = 0;
  for (let i = 0; i < x.length; i += 1) out |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return out === 0;
}

function extractCollectSecret(event) {
  const auth = header(event, "authorization");
  if (/^Bearer\s+/i.test(auth)) return auth.replace(/^Bearer\s+/i, "").trim();
  return header(event, "x-social-collect-secret").trim();
}

function isTrustedBrowserOrigin(event) {
  const origin = header(event, "origin");
  if (origin && ALLOW_ORIGINS.includes(origin)) return true;
  const referer = header(event, "referer");
  if (!referer) return false;
  try {
    const u = new URL(referer);
    return ALLOW_ORIGINS.includes(u.origin);
  } catch {
    return false;
  }
}

function roleIsAdmin(role, email) {
  const r = String(role || "").toLowerCase();
  if (r === "owner" || r === "superadmin") return true;
  if (HARD_ADMIN_EMAILS.has(normEmail(email))) return true;
  return false;
}

/**
 * @returns {null | { kind: string, email: string, role: string, canMutate: boolean, canReadAny: boolean, canReadSelf: boolean, creatorEnabled: boolean }}
 */
export function resolveSocialActor(event, body) {
  const secret = socialCollectSecret();
  const presented = extractCollectSecret(event);
  if (secret && presented && timingSafeEqual(secret, presented)) {
    return {
      kind: "system",
      email: "system@social-collect",
      role: "system",
      canMutate: true,
      canReadAny: true,
      canReadSelf: true,
      creatorEnabled: true
    };
  }

  if (!isTrustedBrowserOrigin(event)) return null;

  const b = body && typeof body === "object" ? body : {};
  const email = normEmail(header(event, "x-staff-email") || b.actorEmail || "");
  const role = String(header(event, "x-staff-role") || b.actorRole || "").toLowerCase();
  const creatorFlag = header(event, "x-staff-creator") || b.actorCreator || "";
  const creatorEnabled = creatorFlag === "1" || creatorFlag === "true" || creatorFlag === true;

  if (!email || !email.includes("@")) return null;

  const admin = roleIsAdmin(role, email);
  return {
    kind: "staff",
    email,
    role: admin ? (role === "owner" ? "owner" : "superadmin") : (role || "subadmin"),
    creatorEnabled: admin ? true : !!creatorEnabled,
    canMutate: admin,
    canReadAny: admin,
    canReadSelf: admin || !!creatorEnabled
  };
}

export function assertMutate(actor) {
  if (!actor) {
    const err = new Error("Sign in as owner or superadmin");
    err.status = 401;
    err.code = "unauthorized";
    throw err;
  }
  if (!actor.canMutate) {
    const err = new Error("Only owner / superadmin can manage social profile URLs");
    err.status = 403;
    err.code = "forbidden";
    throw err;
  }
}

export function assertRead(actor, clientEmail) {
  if (!actor) {
    const err = new Error("Sign in required");
    err.status = 401;
    err.code = "unauthorized";
    throw err;
  }
  const target = normEmail(clientEmail);
  if (!target || !target.includes("@")) {
    const err = new Error("clientEmail required");
    err.status = 400;
    err.code = "bad_request";
    throw err;
  }
  if (actor.canReadAny) return;
  if (actor.canReadSelf && actor.email === target) return;
  const err = new Error("You can only view your own social stats");
  err.status = 403;
  err.code = "forbidden";
  throw err;
}

export function parseJsonBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch {
    return {};
  }
}

export function requireCollectSecret(event) {
  const secret = socialCollectSecret();
  if (!secret) {
    const err = new Error("SOCIAL_COLLECT_SECRET is not configured");
    err.status = 503;
    err.code = "collect_secret_missing";
    throw err;
  }
  const presented = extractCollectSecret(event);
  if (!presented || !timingSafeEqual(secret, presented)) {
    const err = new Error("Invalid collect secret");
    err.status = 401;
    err.code = "unauthorized";
    throw err;
  }
}
