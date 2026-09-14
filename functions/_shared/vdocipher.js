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
      ? "VdoCipher key needs Uploader permission"
      : (data.message || data.error || "Could not start DRM upload");
    const err = new Error(msg);
    err.status = res.status >= 400 ? res.status : 502;
    throw err;
  }
  return { videoId: String(data.videoId), clientPayload: data.clientPayload };
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
  const annotate = JSON.stringify([{
    type: "rtext",
    text: watermarkText(name, email),
    alpha: "0.55",
    color: "0xFFFFFF",
    size: "13",
    interval: "4500"
  }]);
  const res = await fetch("https://dev.vdocipher.com/api/videos/" + encodeURIComponent(id) + "/otp", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Apisecret " + secret
    },
    body: JSON.stringify({
      ttl: 600,
      userId: String(email || name || "student").slice(0, 80),
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
