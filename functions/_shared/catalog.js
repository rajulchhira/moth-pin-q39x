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

const PLACEHOLDER_LESSON_TITLES = new Set([
  "welcome & how this classroom works",
  "setup selection on a live chart",
  "entries, invalidation, targets",
  "position sizing you can follow",
  "journal template walkthrough"
]);
const PLACEHOLDER_SECTION_TITLES = new Set([
  "introduction", "core ideas", "the setup", "risk & journal", "managing trades", "lessons", "new chapter"
]);

function isSampleMediaUrl(url) {
  const s = String(url || "");
  return !s || /flower\.mp4/i.test(s) || /interactive-examples\.mdn\.mozilla\.net/i.test(s);
}

function isPlaceholderLessonList(list) {
  if (!Array.isArray(list) || !list.length) return true;
  return list.every((l) => {
    const title = String(l?.t || "").toLowerCase();
    const kind = String(l?.kind || "video").toLowerCase();
    if (kind === "pdf" || l?.pdf || l?.pdfInline) return false;
    if (l?.vdoId || l?.fileKey) return false;
    if (!PLACEHOLDER_LESSON_TITLES.has(title)) return false;
    return isSampleMediaUrl(l?.src);
  });
}

function isPlaceholderSyllabusDoc(doc) {
  const sections = doc && Array.isArray(doc.sections) ? doc.sections : [];
  if (!sections.length) return true;
  return sections.every((sec) => PLACEHOLDER_SECTION_TITLES.has(String(sec?.title || "").toLowerCase()));
}

function curriculumVideosScore(list) {
  if (!Array.isArray(list) || !list.length) return 0;
  if (isPlaceholderLessonList(list)) return 1;
  let score = list.length * 2;
  for (const l of list) {
    const title = String(l?.t || "").toLowerCase();
    if (!PLACEHOLDER_LESSON_TITLES.has(title)) score += 4;
    if (String(l?.kind || "") === "pdf" || l?.pdf || l?.pdfInline) score += 6;
    if (l?.vdoId || l?.fileKey) score += 5;
    if (l?.src && !isSampleMediaUrl(l.src)) score += 3;
  }
  return score;
}

function curriculumSyllabusScore(doc) {
  const sections = doc && Array.isArray(doc.sections) ? doc.sections : [];
  if (!sections.length) return 0;
  if (isPlaceholderSyllabusDoc(doc)) return 1;
  let score = sections.length * 2;
  for (const sec of sections) {
    const title = String(sec?.title || "");
    if (/^lesson\s*\d+/i.test(title)) score += 8;
    if (!PLACEHOLDER_SECTION_TITLES.has(title.toLowerCase())) score += 4;
    score += asArray(sec?.items).length;
  }
  return score;
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

/**
 * Prefer authored curriculum over DEFAULT/flower placeholders on write.
 * Explicit empty arrays still clear (course delete). Only placeholders lose to richer prev.
 */
function mergeCurriculumMaps(incomingVideos, incomingSyllabus, prevVideos, prevSyllabus) {
  const videos = {};
  const syllabus = {};
  const ids = new Set([
    ...Object.keys(asObject(incomingVideos)),
    ...Object.keys(asObject(prevVideos)),
    ...Object.keys(asObject(incomingSyllabus)),
    ...Object.keys(asObject(prevSyllabus))
  ]);
  for (const id of ids) {
    const nextList = incomingVideos[id];
    const prevList = prevVideos[id];
    if (Array.isArray(nextList)) {
      if (nextList.length && isPlaceholderLessonList(nextList) && curriculumVideosScore(prevList) > 1) {
        videos[id] = prevList;
      } else {
        videos[id] = nextList;
      }
    } else if (Array.isArray(prevList)) {
      videos[id] = prevList;
    }
    const nextSy = incomingSyllabus[id];
    const prevSy = prevSyllabus[id];
    if (nextSy && Array.isArray(nextSy.sections)) {
      const nextEmpty = !nextSy.sections.length;
      if (!nextEmpty && isPlaceholderSyllabusDoc(nextSy) && curriculumSyllabusScore(prevSy) > 1) {
        syllabus[id] = prevSy;
      } else {
        syllabus[id] = nextSy;
      }
    } else if (prevSy && Array.isArray(prevSy.sections)) {
      syllabus[id] = prevSy;
    }
  }
  return { videos, syllabus };
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
  // Also refuse DEFAULT/flower placeholders overwriting authored Lesson 2–4 maps.
  const prev = await readCatalogDoc(env);
  const incoming = body && typeof body === "object" ? { ...body } : {};
  if (incoming.videos === undefined) incoming.videos = prev.doc?.videos || {};
  if (incoming.syllabus === undefined) incoming.syllabus = prev.doc?.syllabus || {};
  const normalized = normalizeCatalogDoc(incoming, actorEmail);
  const mergedMaps = mergeCurriculumMaps(
    normalized.videos,
    normalized.syllabus,
    prev.doc?.videos || {},
    prev.doc?.syllabus || {}
  );
  const doc = { ...normalized, videos: mergedMaps.videos, syllabus: mergedMaps.syllabus };
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
