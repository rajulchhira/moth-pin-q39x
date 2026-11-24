/**
 * Shared public course catalog — Cloudflare KV (SALES binding).
 * Control dashboard writes; public site reads the same document.
 */

export const CATALOG_KV_KEY = "catalog:courses:v1";

export function salesKv(env) {
  return env && (env.SALES || env.SALES_KV || null);
}

export function emptyCatalogDoc() {
  return {
    version: 1,
    updatedAt: null,
    updatedBy: "",
    edits: {},
    extras: [],
    hidden: []
  };
}

function asObject(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw;
}

function asArray(raw) {
  return Array.isArray(raw) ? raw : [];
}

/** Sanitize a catalog write body into a stable KV document. */
export function normalizeCatalogDoc(body, actorEmail) {
  const src = body && typeof body === "object" ? body : {};
  const editsIn = asObject(src.edits);
  const edits = {};
  for (const [id, patch] of Object.entries(editsIn)) {
    const key = String(id || "").trim();
    if (!key || !patch || typeof patch !== "object" || Array.isArray(patch)) continue;
    edits[key] = { ...patch };
  }
  const extras = asArray(src.extras)
    .filter((c) => c && typeof c === "object" && !Array.isArray(c) && c.id)
    .map((c) => ({ ...c, id: String(c.id) }));
  const hidden = asArray(src.hidden)
    .map((id) => String(id || "").trim())
    .filter(Boolean);
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    updatedBy: String(actorEmail || "").trim().toLowerCase(),
    edits,
    extras,
    hidden
  };
}

export async function readCatalogDoc(env) {
  const kv = salesKv(env);
  if (!kv) return { ok: false, missing: "kv", doc: emptyCatalogDoc() };
  try {
    const raw = await kv.get(CATALOG_KV_KEY);
    if (!raw) return { ok: true, missing: "empty", doc: emptyCatalogDoc() };
    const parsed = JSON.parse(raw);
    const doc = normalizeCatalogDoc(parsed, parsed?.updatedBy || "");
    // Preserve stored timestamps when reading.
    if (parsed?.updatedAt) doc.updatedAt = parsed.updatedAt;
    if (parsed?.updatedBy) doc.updatedBy = String(parsed.updatedBy);
    return { ok: true, missing: null, doc };
  } catch (err) {
    return { ok: false, missing: "parse", error: String(err?.message || err), doc: emptyCatalogDoc() };
  }
}

export async function writeCatalogDoc(env, body, actorEmail) {
  const kv = salesKv(env);
  if (!kv) {
    const err = new Error("SALES KV binding missing");
    err.status = 503;
    err.code = "kv_missing";
    throw err;
  }
  const doc = normalizeCatalogDoc(body, actorEmail);
  const payload = JSON.stringify(doc);
  // Cloudflare KV value limit is 25 MiB; refuse oversized catalog writes early.
  if (payload.length > 20 * 1024 * 1024) {
    const err = new Error("Catalog payload too large");
    err.status = 413;
    err.code = "payload_too_large";
    throw err;
  }
  await kv.put(CATALOG_KV_KEY, payload);
  return doc;
}
