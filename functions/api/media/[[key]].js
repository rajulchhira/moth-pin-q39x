/**
 * Classroom media on R2.
 * GET/HEAD  /api/media/:key — stream lesson bytes (Range supported)
 * PUT       /api/media/:key — staff single-shot upload (≤ ~95MB request)
 * POST      /api/media/:key?action=multipart-init|multipart-complete
 * PUT       /api/media/:key?action=part&uploadId=&partNumber=
 */

import { injectEnv } from "../../_shared/adapt.js";
import {
  assertMediaWrite,
  mediaBucket,
  mediaCors,
  parseRange,
  sanitizeMediaKey
} from "../../_shared/media.js";

function originOf(request) {
  return String(request.headers.get("Origin") || "");
}

function json(request, body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...mediaCors(originOf(request))
    }
  });
}

function keyFromContext(context) {
  const raw = context.params && context.params.key;
  if (Array.isArray(raw)) return sanitizeMediaKey(raw.filter(Boolean).join("/"));
  return sanitizeMediaKey(raw);
}

async function handleGet(context, key, headOnly) {
  const bucket = mediaBucket(context.env);
  if (!bucket) {
    return json(context.request, { ok: false, error: "MEDIA R2 binding missing", code: "media_missing" }, 503);
  }
  const rangeHdr = context.request.headers.get("Range") || "";
  let object;
  if (rangeHdr) {
    const head = await bucket.head(key);
    if (!head) {
      return json(context.request, { ok: false, error: "Media not found", code: "not_found" }, 404);
    }
    const size = Number(head.size) || 0;
    const range = parseRange(rangeHdr, size);
    if (!range) {
      return new Response("Invalid Range", {
        status: 416,
        headers: {
          "Content-Range": `bytes */${size}`,
          ...mediaCors(originOf(context.request), "GET, HEAD, OPTIONS")
        }
      });
    }
    object = await bucket.get(key, { range: { offset: range.offset, length: range.length } });
    if (!object) {
      return json(context.request, { ok: false, error: "Media not found", code: "not_found" }, 404);
    }
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("Accept-Ranges", "bytes");
    headers.set("Content-Length", String(range.length));
    headers.set("Content-Range", `bytes ${range.start}-${range.end}/${size}`);
    headers.set("Cache-Control", "private, max-age=3600");
    Object.entries(mediaCors(originOf(context.request), "GET, HEAD, OPTIONS")).forEach(([k, v]) => headers.set(k, v));
    if (headOnly) return new Response(null, { status: 206, headers });
    return new Response(object.body, { status: 206, headers });
  }

  object = await bucket.get(key);
  if (!object) {
    return json(context.request, { ok: false, error: "Media not found", code: "not_found" }, 404);
  }
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "private, max-age=3600");
  if (object.size != null) headers.set("Content-Length", String(object.size));
  Object.entries(mediaCors(originOf(context.request), "GET, HEAD, OPTIONS")).forEach(([k, v]) => headers.set(k, v));
  if (headOnly) return new Response(null, { status: 200, headers });
  return new Response(object.body, { status: 200, headers });
}

async function handlePut(context, key) {
  assertMediaWrite(context.request);
  const bucket = mediaBucket(context.env);
  if (!bucket) {
    return json(context.request, { ok: false, error: "MEDIA R2 binding missing — create bucket bizgarh-media and bind as MEDIA", code: "media_missing" }, 503);
  }
  const url = new URL(context.request.url);
  const action = String(url.searchParams.get("action") || "").toLowerCase();

  if (action === "part") {
    const uploadId = String(url.searchParams.get("uploadId") || "").trim();
    const partNumber = Number(url.searchParams.get("partNumber") || 0);
    if (!uploadId || !(partNumber >= 1 && partNumber <= 10000)) {
      return json(context.request, { ok: false, error: "uploadId and partNumber required", code: "bad_part" }, 400);
    }
    const multipart = bucket.resumeMultipartUpload(key, uploadId);
    const part = await multipart.uploadPart(partNumber, context.request.body);
    return json(context.request, { ok: true, partNumber, etag: part.etag });
  }

  const contentType = context.request.headers.get("Content-Type") || "application/octet-stream";
  await bucket.put(key, context.request.body, {
    httpMetadata: { contentType: contentType.split(";")[0].trim() || "video/mp4" }
  });
  return json(context.request, { ok: true, key, src: "/api/media/" + encodeURIComponent(key).replace(/%2F/gi, "/") });
}

async function handlePost(context, key) {
  assertMediaWrite(context.request);
  const bucket = mediaBucket(context.env);
  if (!bucket) {
    return json(context.request, { ok: false, error: "MEDIA R2 binding missing — create bucket bizgarh-media and bind as MEDIA", code: "media_missing" }, 503);
  }
  const url = new URL(context.request.url);
  const action = String(url.searchParams.get("action") || "").toLowerCase();
  let body = {};
  try { body = await context.request.json(); } catch { body = {}; }

  if (action === "multipart-init" || action === "init") {
    const contentType = String(body.contentType || context.request.headers.get("Content-Type") || "video/mp4")
      .split(";")[0]
      .trim() || "video/mp4";
    const multipart = await bucket.createMultipartUpload(key, {
      httpMetadata: { contentType }
    });
    return json(context.request, {
      ok: true,
      key,
      uploadId: multipart.uploadId,
      src: "/api/media/" + key.split("/").map(encodeURIComponent).join("/")
    });
  }

  if (action === "multipart-complete" || action === "complete") {
    const uploadId = String(body.uploadId || "").trim();
    const parts = Array.isArray(body.parts) ? body.parts : [];
    if (!uploadId || !parts.length) {
      return json(context.request, { ok: false, error: "uploadId and parts required", code: "bad_complete" }, 400);
    }
    const multipart = bucket.resumeMultipartUpload(key, uploadId);
    await multipart.complete(parts.map((p) => ({
      partNumber: Number(p.partNumber),
      etag: String(p.etag || "")
    })));
    return json(context.request, {
      ok: true,
      key,
      src: "/api/media/" + key.split("/").map(encodeURIComponent).join("/")
    });
  }

  if (action === "multipart-abort" || action === "abort") {
    const uploadId = String(body.uploadId || "").trim();
    if (!uploadId) return json(context.request, { ok: false, error: "uploadId required" }, 400);
    const multipart = bucket.resumeMultipartUpload(key, uploadId);
    await multipart.abort();
    return json(context.request, { ok: true, aborted: true });
  }

  return json(context.request, { ok: false, error: "Unknown action", code: "action" }, 400);
}

export async function onRequest(context) {
  injectEnv(context.env);
  const request = context.request;
  const origin = originOf(request);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: mediaCors(origin) });
  }

  // Health probe (no object)
  const url = new URL(request.url);
  if (url.pathname === "/api/media" || url.pathname === "/api/media/") {
    const ready = Boolean(mediaBucket(context.env));
    return json(request, {
      ok: ready,
      ready,
      binding: "MEDIA",
      bucket: "bizgarh-media",
      code: ready ? "" : "media_missing"
    }, ready ? 200 : 503);
  }

  const key = keyFromContext(context);
  if (!key) {
    return json(request, { ok: false, error: "Missing media key", code: "bad_key" }, 400);
  }

  try {
    if (request.method === "GET") return await handleGet(context, key, false);
    if (request.method === "HEAD") return await handleGet(context, key, true);
    if (request.method === "PUT") return await handlePut(context, key);
    if (request.method === "POST") return await handlePost(context, key);
    return json(request, { ok: false, error: "Method not allowed" }, 405);
  } catch (err) {
    return json(request, {
      ok: false,
      error: err.message || "Media error",
      code: err.code || ""
    }, err.status || 500);
  }
}
