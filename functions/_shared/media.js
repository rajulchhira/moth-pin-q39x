/**
 * R2 classroom media helpers (open-play lesson files).
 * Binding name: MEDIA → bucket bizgarh-media
 */

const ALLOW_ORIGINS = [
  "https://bizgarh.com",
  "https://www.bizgarh.com",
  "http://127.0.0.1:5510",
  "http://127.0.0.1:5500",
  "http://localhost:5510",
  "http://localhost:5500"
];

export function mediaBucket(env) {
  return env && env.MEDIA ? env.MEDIA : null;
}

export function mediaCors(origin, methods) {
  const o = String(origin || "");
  return {
    "Access-Control-Allow-Origin": ALLOW_ORIGINS.includes(o) ? o : "https://www.bizgarh.com",
    "Access-Control-Allow-Methods": methods || "GET, HEAD, PUT, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Content-Range, X-Staff-Email, X-Staff-Role, X-Staff-Creator, Range",
    "Access-Control-Expose-Headers": "Accept-Ranges, Content-Length, Content-Range, ETag",
    "Access-Control-Max-Age": "86400"
  };
}

export function sanitizeMediaKey(raw) {
  const s = String(raw || "").trim().replace(/^\/+/, "");
  if (!s || s.length > 200) return "";
  if (s.includes("..") || s.includes("\\")) return "";
  if (!/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(s)) return "";
  return s;
}

function header(eventOrReq, name) {
  if (eventOrReq && eventOrReq.headers) {
    if (typeof eventOrReq.headers.get === "function") {
      return String(eventOrReq.headers.get(name) || "");
    }
    const lower = name.toLowerCase();
    for (const [k, v] of Object.entries(eventOrReq.headers)) {
      if (String(k).toLowerCase() === lower) return String(v || "");
    }
  }
  return "";
}

export function mediaStaffEmail(request) {
  return String(header(request, "x-staff-email") || "").trim().toLowerCase();
}

export function assertMediaWrite(request) {
  const email = mediaStaffEmail(request);
  if (!email || !email.includes("@")) {
    const err = new Error("Sign in as staff to upload classroom media");
    err.status = 401;
    err.code = "unauthorized";
    throw err;
  }
  return email;
}

export function parseRange(rangeHeader, size) {
  const m = String(rangeHeader || "").match(/^bytes=(\d*)-(\d*)$/i);
  if (!m) return null;
  let start = m[1] === "" ? NaN : Number(m[1]);
  let end = m[2] === "" ? NaN : Number(m[2]);
  if (Number.isNaN(start) && Number.isNaN(end)) return null;
  if (Number.isNaN(start)) {
    const suffix = end;
    if (!suffix || suffix <= 0) return null;
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    if (Number.isNaN(end) || end >= size) end = size - 1;
    if (start > end || start >= size) return null;
  }
  return { offset: start, length: end - start + 1, start, end };
}
