function envGet(key, fallback) {
  const g = globalThis.process && globalThis.process.env ? globalThis.process.env : {};
  const v = g[key];
  return String(v == null ? fallback || "" : v).trim();
}

export function vdoSecret() {
  return envGet("VDOCIPHER_API_SECRET") || envGet("VDOCIPHER_API_KEY");
}

export function vdoReady() {
  return Boolean(vdoSecret());
}

export function parseVideoId(raw) {
  const s = String(raw || "").trim();
  if (!s || s.length > 80) return "";
  if (!/^[A-Za-z0-9_-]{6,64}$/.test(s)) return "";
  return s;
}

function watermarkText(name, email) {
  const who = [String(name || "").trim(), String(email || "").trim().toLowerCase()].filter(Boolean);
  return (who.join(" · ") || "Bizgarh classroom").slice(0, 80);
}

function otpUserId(email, name) {
  const raw = String(email || name || "student").trim().toLowerCase();
  const safe = raw.replace(/[^a-z0-9_-]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
  return (safe || "student").slice(0, 36);
}

export async function createUpload(title) {
  const secret = vdoSecret();
  if (!secret) {
    const err = new Error("VdoCipher is not configured");
    err.status = 503;
    throw err;
  }
  const name = String(title || "Lesson").trim().slice(0, 80) || "Lesson";
  const res = await fetch("https://dev.vdocipher.com/api/videos?title=" + encodeURIComponent(name), {
    method: "PUT",
    headers: {
      Accept: "application/json",
      Authorization: "Apisecret " + secret
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.videoId || !data.clientPayload || !data.clientPayload.uploadLink) {
    const msg = res.status === 403
      ? "VdoCipher API key needs Uploader permission. Open VdoCipher → Config → API Keys, enable Uploader (or Full Access), put that secret in Cloudflare as VDOCIPHER_API_SECRET, then redeploy."
      : (data.message || data.error || "Could not start DRM upload");
    const err = new Error(msg);
    err.status = res.status >= 400 ? res.status : 502;
    err.code = res.status === 403 ? "VDO_UPLOADER" : "UPLOAD";
    throw err;
  }
  return { videoId: String(data.videoId), clientPayload: data.clientPayload };
}

/** List videos in the VdoCipher library (for Control to link lesson vdoIds). */
export async function listVideos({ page, limit, q } = {}) {
  const secret = vdoSecret();
  if (!secret) {
    const err = new Error("VdoCipher is not configured");
    err.status = 503;
    throw err;
  }
  const params = new URLSearchParams();
  params.set("page", String(Math.max(1, Number(page) || 1)));
  params.set("limit", String(Math.min(100, Math.max(1, Number(limit) || 50))));
  const query = String(q || "").trim();
  if (query) params.set("q", query.slice(0, 80));
  const res = await fetch("https://dev.vdocipher.com/api/videos?" + params.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: "Apisecret " + secret
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || data.error || "Could not list DRM videos");
    err.status = res.status >= 400 ? res.status : 502;
    throw err;
  }
  const rows = Array.isArray(data.rows) ? data.rows
    : (Array.isArray(data.videos) ? data.videos : (Array.isArray(data) ? data : []));
  const videos = rows.map((v) => ({
    id: String(v.id || v.videoId || ""),
    title: String(v.title || v.name || ""),
    status: String(v.status || v.upload_status || ""),
    length: v.length != null ? Number(v.length) : (v.duration != null ? Number(v.duration) : null)
  })).filter((v) => v.id);
  return {
    videos,
    count: Number(data.count != null ? data.count : videos.length) || videos.length,
    page: Number(data.page) || Number(page) || 1
  };
}

export async function issueOtp({ videoId, name, email }) {
  const secret = vdoSecret();
  if (!secret) {
    const err = new Error("VdoCipher is not configured");
    err.status = 503;
    throw err;
  }
  const id = parseVideoId(videoId);
  if (!id) {
    const err = new Error("Invalid video id");
    err.status = 400;
    throw err;
  }
  const mark = watermarkText(name, email);
  const annotate = JSON.stringify([
    {
      type: "rtext",
      text: mark,
      alpha: "0.72",
      color: "0xFFFFFF",
      size: "16",
      interval: "3500",
      skip: "1800"
    },
    {
      type: "rtext",
      text: String(email || name || "Bizgarh").trim().slice(0, 60),
      alpha: "0.55",
      color: "0xFBBF24",
      size: "14",
      interval: "5200",
      skip: "2600"
    },
    {
      type: "text",
      text: mark,
      alpha: "0.35",
      color: "0xFFFFFF",
      size: "12",
      x: "12",
      y: "18"
    }
  ]);
  const res = await fetch("https://dev.vdocipher.com/api/videos/" + encodeURIComponent(id) + "/otp", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Apisecret " + secret
    },
    body: JSON.stringify({
      ttl: 600,
      userId: otpUserId(email, name),
      annotate
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.otp || !data.playbackInfo) {
    const err = new Error(data.message || data.error || "Could not unlock this lesson");
    err.status = res.status >= 400 ? res.status : 502;
    throw err;
  }
  return { otp: data.otp, playbackInfo: data.playbackInfo };
}
