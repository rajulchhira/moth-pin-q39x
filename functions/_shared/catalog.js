/**
 * Shared public course catalog — Cloudflare KV (SALES binding).
 * Control dashboard writes; public site reads the same document.
 */

export const CATALOG_KV_KEY = "catalog:courses:v1";
/** Shared public instructor faces — control Staff writes; /instructors reads. */
export const INSTRUCTORS_KV_KEY = "catalog:instructors:v1";
/** Shared control staff / sub-admin roster — /control is source of truth. */
export const STAFF_KV_KEY = "catalog:staff:v1";
/** Shared public webinar catalog — control Live writes; /live + /webinar read. */
export const WEBINARS_KV_KEY = "catalog:webinars:v1";

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
    syllabus: {},
    // Per-course Community rooms (YouTube / Telegram / …) + optional free-open.
    rooms: {}
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

const ROOM_TYPE_IDS = ["whatsapp", "discord", "youtube", "telegram"];

function sanitizeRoomUrl(url) {
  let raw = String(url || "").trim();
  if (!raw) return "";
  if (!/^[a-z][a-z0-9+.-]*:/i.test(raw)) raw = "https://" + raw;
  try {
    const u = new URL(raw);
    if (u.protocol === "http:" || u.protocol === "https:") return u.href;
  } catch { /* ignore */ }
  return "";
}

function normalizeRoomsMap(raw) {
  const src = asObject(raw);
  const rooms = {};
  for (const [courseId, doc] of Object.entries(src)) {
    const key = String(courseId || "").trim();
    if (!key || !doc || typeof doc !== "object" || Array.isArray(doc)) continue;
    const out = {};
    for (const id of ROOM_TYPE_IDS) {
      const row = doc[id] && typeof doc[id] === "object" && !Array.isArray(doc[id]) ? doc[id] : {};
      out[id] = {
        live: row.live === true || row.live === "1",
        url: sanitizeRoomUrl(row.url)
      };
    }
    if (doc.open === true || doc.open === "1" || doc.open === false || doc.open === "0") {
      out.open = doc.open === true || doc.open === "1";
    }
    rooms[key] = out;
  }
  return rooms;
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
    syllabus: normalizeSyllabusMap(src.syllabus),
    rooms: normalizeRoomsMap(src.rooms)
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
  // Preserve Community rooms when an older client omits rooms on PUT.
  const prev = await readCatalogDoc(env);
  const incoming = body && typeof body === "object" ? { ...body } : {};
  if (incoming.videos === undefined) incoming.videos = prev.doc?.videos || {};
  if (incoming.syllabus === undefined) incoming.syllabus = prev.doc?.syllabus || {};
  if (incoming.rooms === undefined) incoming.rooms = prev.doc?.rooms || {};
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

export function emptyInstructorsDoc() {
  return {
    version: 1,
    updatedAt: null,
    updatedBy: "",
    edits: {}
  };
}

/** Drop oversized inline photos so instructor KV stays under the write budget. */
function sanitizeInstructorEdit(patch) {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) return null;
  const out = { ...patch };
  if (typeof out.photo === "string" && out.photo.startsWith("data:") && out.photo.length > INLINE_MEDIA_MAX) {
    out.photo = "";
    out.photoInlineDropped = true;
  }
  return out;
}

export function normalizeInstructorsDoc(body, actorEmail) {
  const src = body && typeof body === "object" ? body : {};
  const editsIn = asObject(src.edits);
  const edits = {};
  for (const [id, patch] of Object.entries(editsIn)) {
    const key = String(id || "").trim();
    if (!key) continue;
    const clean = sanitizeInstructorEdit(patch);
    if (!clean) continue;
    edits[key] = clean;
  }
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    updatedBy: String(actorEmail || "").trim().toLowerCase(),
    edits
  };
}

export async function readInstructorsDoc(env) {
  const kv = salesKv(env);
  if (!kv) return { ok: false, missing: "kv", doc: emptyInstructorsDoc() };
  try {
    const raw = await kv.get(INSTRUCTORS_KV_KEY);
    if (!raw) return { ok: true, missing: "empty", doc: emptyInstructorsDoc() };
    const parsed = JSON.parse(raw);
    const doc = normalizeInstructorsDoc(parsed, parsed?.updatedBy || "");
    if (parsed?.updatedAt) doc.updatedAt = parsed.updatedAt;
    if (parsed?.updatedBy) doc.updatedBy = String(parsed.updatedBy);
    return { ok: true, missing: null, doc };
  } catch (err) {
    return { ok: false, missing: "parse", error: String(err?.message || err), doc: emptyInstructorsDoc() };
  }
}

export async function writeInstructorsDoc(env, body, actorEmail) {
  const kv = salesKv(env);
  if (!kv) {
    const err = new Error("SALES KV binding missing");
    err.status = 503;
    err.code = "kv_missing";
    throw err;
  }
  const doc = normalizeInstructorsDoc(body, actorEmail);
  const payload = JSON.stringify(doc);
  if (payload.length > 20 * 1024 * 1024) {
    const err = new Error("Instructors payload too large");
    err.status = 413;
    err.code = "payload_too_large";
    throw err;
  }
  await kv.put(INSTRUCTORS_KV_KEY, payload);
  return doc;
}

export function emptyStaffDoc() {
  return {
    version: 1,
    updatedAt: null,
    updatedBy: "",
    staff: [],
    grantedEmails: []
  };
}

/** Drop oversized inline photos so staff KV stays under the write budget. */
function sanitizeStaffRow(row) {
  if (!row || typeof row !== "object" || Array.isArray(row)) return null;
  const email = String(row.email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) return null;
  const out = { ...row, email };
  if (typeof out.photo === "string" && out.photo.startsWith("data:") && out.photo.length > INLINE_MEDIA_MAX) {
    out.photo = "";
    out.photoInlineDropped = true;
  }
  return out;
}

/** Public-safe projection — no passwords. */
export function staffPublicRoster(staff) {
  return asArray(staff).map((row) => {
    if (!row || typeof row !== "object") return null;
    const email = String(row.email || "").trim().toLowerCase();
    if (!email) return null;
    return {
      email,
      name: String(row.name || ""),
      role: String(row.role || "subadmin"),
      status: String(row.status || "active"),
      googleAuth: !!row.googleAuth,
      creatorEnabled: !!row.creatorEnabled,
      photo: typeof row.photo === "string" && !row.photo.startsWith("data:") ? row.photo : "",
      referralCode: String(row.referralCode || ""),
      creatorId: String(row.creatorId || "")
    };
  }).filter(Boolean);
}

export function normalizeStaffDoc(body, actorEmail) {
  const src = body && typeof body === "object" ? body : {};
  const staff = asArray(src.staff).map(sanitizeStaffRow).filter(Boolean);
  const grantedEmails = Array.from(new Set(
    asArray(src.grantedEmails)
      .map((e) => String(e || "").trim().toLowerCase())
      .filter((e) => e.includes("@"))
  ));
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    updatedBy: String(actorEmail || "").trim().toLowerCase(),
    staff,
    grantedEmails
  };
}

export async function readStaffDoc(env) {
  const kv = salesKv(env);
  if (!kv) return { ok: false, missing: "kv", doc: emptyStaffDoc() };
  try {
    const raw = await kv.get(STAFF_KV_KEY);
    if (!raw) return { ok: true, missing: "empty", doc: emptyStaffDoc() };
    const parsed = JSON.parse(raw);
    const doc = normalizeStaffDoc(parsed, parsed?.updatedBy || "");
    if (parsed?.updatedAt) doc.updatedAt = parsed.updatedAt;
    if (parsed?.updatedBy) doc.updatedBy = String(parsed.updatedBy);
    return { ok: true, missing: null, doc };
  } catch (err) {
    return { ok: false, missing: "parse", error: String(err?.message || err), doc: emptyStaffDoc() };
  }
}

export async function writeStaffDoc(env, body, actorEmail) {
  const kv = salesKv(env);
  if (!kv) {
    const err = new Error("SALES KV binding missing");
    err.status = 503;
    err.code = "kv_missing";
    throw err;
  }
  const doc = normalizeStaffDoc(body, actorEmail);
  const payload = JSON.stringify(doc);
  if (payload.length > 20 * 1024 * 1024) {
    const err = new Error("Staff payload too large");
    err.status = 413;
    err.code = "payload_too_large";
    throw err;
  }
  await kv.put(STAFF_KV_KEY, payload);
  return doc;
}

/** Demo seed ids retired from the public catalog — never store or rehydrate. */
export const DEMO_WEBINAR_IDS = ["w0", "w1", "w2", "w3", "w4"];

export function emptyWebinarsDoc() {
  return {
    version: 1,
    updatedAt: null,
    updatedBy: "",
    webinars: [],
    deleted: []
  };
}

function sanitizeWebinarRow(row) {
  if (!row || typeof row !== "object" || Array.isArray(row)) return null;
  const id = String(row.id || "").trim();
  if (!id || DEMO_WEBINAR_IDS.includes(id)) return null;
  const kind = String(row.kind || "webinar").toLowerCase();
  if (kind === "class") return null;
  const out = { ...row, id, kind: "webinar" };
  for (const key of ["banner", "pdf", "hostPhoto", "pic", "cover"]) {
    const v = out[key];
    if (typeof v === "string" && v.startsWith("data:") && v.length > INLINE_MEDIA_MAX) {
      out[key] = "";
      out[key + "InlineDropped"] = true;
    }
  }
  return out;
}

export function normalizeWebinarsDoc(body, actorEmail) {
  const src = body && typeof body === "object" ? body : {};
  const webinars = asArray(src.webinars).map(sanitizeWebinarRow).filter(Boolean);
  // Always keep demo ids in deleted so clients never revive them from stale caches.
  const deleted = Array.from(new Set([
    ...asArray(src.deleted).map((id) => String(id || "").trim()).filter(Boolean),
    ...DEMO_WEBINAR_IDS
  ]));
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    updatedBy: String(actorEmail || "").trim().toLowerCase(),
    webinars,
    deleted
  };
}

export async function readWebinarsDoc(env) {
  const kv = salesKv(env);
  if (!kv) return { ok: false, missing: "kv", doc: emptyWebinarsDoc() };
  try {
    const raw = await kv.get(WEBINARS_KV_KEY);
    if (!raw) return { ok: true, missing: "empty", doc: emptyWebinarsDoc() };
    const parsed = JSON.parse(raw);
    const doc = normalizeWebinarsDoc(parsed, parsed?.updatedBy || "");
    if (parsed?.updatedAt) doc.updatedAt = parsed.updatedAt;
    if (parsed?.updatedBy) doc.updatedBy = String(parsed.updatedBy);
    return { ok: true, missing: null, doc };
  } catch (err) {
    return { ok: false, missing: "parse", error: String(err?.message || err), doc: emptyWebinarsDoc() };
  }
}

export async function writeWebinarsDoc(env, body, actorEmail) {
  const kv = salesKv(env);
  if (!kv) {
    const err = new Error("SALES KV binding missing");
    err.status = 503;
    err.code = "kv_missing";
    throw err;
  }
  const doc = normalizeWebinarsDoc(body, actorEmail);
  const payload = JSON.stringify(doc);
  if (payload.length > 20 * 1024 * 1024) {
    const err = new Error("Webinars payload too large");
    err.status = 413;
    err.code = "payload_too_large";
    throw err;
  }
  await kv.put(WEBINARS_KV_KEY, payload);
  return doc;
}
