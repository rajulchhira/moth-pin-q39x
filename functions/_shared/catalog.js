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
    hidden: [],
    // Control curriculum → public course overview (lessons + section map).
    videos: {},
    syllabus: {}
  };
}

function asObject(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw;
}

function asArray(raw) {
  return Array.isArray(raw) ? raw : [];
}

/** Drop oversized inline blobs so KV stays under the write budget. */
const INLINE_MEDIA_MAX = 200 * 1024;

export function sanitizeLessonForRemote(lesson) {
  if (!lesson || typeof lesson !== "object" || Array.isArray(lesson)) return null;
  const out = { ...lesson };
  for (const key of ["src", "pdf", "notes"]) {
    const v = out[key];
    if (typeof v !== "string") continue;
    if (v.startsWith("data:") && v.length > INLINE_MEDIA_MAX) {
      if (key === "pdf") out.pdfInline = true;
      out[key] = "";
    }
  }
  return out;
}

function normalizeVideosMap(raw) {
  const src = asObject(raw);
  const videos = {};
  for (const [courseId, list] of Object.entries(src)) {
    const key = String(courseId || "").trim();
    if (!key || !Array.isArray(list)) continue;
    videos[key] = list.map(sanitizeLessonForRemote).filter(Boolean);
  }
  return videos;
}

function normalizeSyllabusMap(raw) {
  const src = asObject(raw);
  const syllabus = {};
  for (const [courseId, doc] of Object.entries(src)) {
    const key = String(courseId || "").trim();
    if (!key || !doc || typeof doc !== "object" || Array.isArray(doc)) continue;
    const sections = asArray(doc.sections)
      .filter((sec) => sec && typeof sec === "object" && !Array.isArray(sec))
      .map((sec) => ({
        id: String(sec.id || "").trim() || ("sec-" + key),
        title: String(sec.title || "Lessons"),
        items: asArray(sec.items)
          .filter((it) => it && typeof it === "object" && !Array.isArray(it) && it.lessonId)
          .map((it) => ({
            lessonId: String(it.lessonId),
            kind: String(it.kind || "video"),
            published: it.published !== false
          }))
      }));
    syllabus[key] = { sections };
  }
  return syllabus;
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
    hidden,
    videos: normalizeVideosMap(src.videos),
    syllabus: normalizeSyllabusMap(src.syllabus)
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
  // Preserve curriculum when an older client omits videos/syllabus on PUT
  // (e.g. landing-only save from a cached pre-desk188 admin bundle).
  const incoming = body && typeof body === "object" ? { ...body } : {};
  if (incoming.videos === undefined || incoming.syllabus === undefined) {
    const prev = await readCatalogDoc(env);
    if (incoming.videos === undefined) incoming.videos = prev.doc?.videos || {};
    if (incoming.syllabus === undefined) incoming.syllabus = prev.doc?.syllabus || {};
  }
  const doc = normalizeCatalogDoc(incoming, actorEmail);
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
