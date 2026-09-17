import crypto from "node:crypto";

function envGet(key, fallback) {
  const g = globalThis.process && globalThis.process.env ? globalThis.process.env : {};
  const v = g[key];
  return String(v == null ? fallback || "" : v).trim();
}

export function hmsReady() {
  return Boolean(envGet("HMS_ACCESS_KEY") && envGet("HMS_SECRET"));
}

export function hmsSubdomain() {
  let s = envGet("HMS_SUBDOMAIN", "rajulchhira-webinar-1524.app.100ms.live");
  s = s.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  if (s && !s.includes(".")) s += ".app.100ms.live";
  return s || "rajulchhira-webinar-1524.app.100ms.live";
}

export function hmsTemplateId(kind) {
  const webinar = envGet("HMS_TEMPLATE_WEBINAR") || envGet("HMS_TEMPLATE_ID") || "6aa7c48b06e552af73ba3ee3";
  if (kind === "call") return envGet("HMS_TEMPLATE_CALL") || webinar;
  if (kind === "class") return envGet("HMS_TEMPLATE_LIVE") || webinar;
  return webinar;
}

function b64url(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input));
  return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function signJwt(payload, secret) {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(JSON.stringify(payload));
  const sig = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest();
  return `${header}.${body}.${b64url(sig)}`;
}

export function managementToken() {
  const access = envGet("HMS_ACCESS_KEY");
  const secret = envGet("HMS_SECRET");
  const now = Math.floor(Date.now() / 1000);
  return signJwt({
    access_key: access,
    type: "management",
    version: 2,
    iat: now,
    nbf: now,
    exp: now + 24 * 3600,
    jti: crypto.randomUUID()
  }, secret);
}

function slug(value) {
  const s = String(value || "room")
    .toLowerCase()
    .replace(/[^a-z0-9._:-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return s || "room";
}

function normalizeKind(kind) {
  const k = String(kind || "webinar").toLowerCase();
  if (k === "call" || k === "1on1" || k === "1:1") return "call";
  if (k === "class" || k === "live") return "class";
  return "webinar";
}

function firstRole(names, preferred) {
  for (const p of preferred) {
    if (names.includes(p)) return p;
  }
  return names[0] || "";
}

function hostRole(names) {
  return firstRole(names, ["broadcaster", "host", "teacher", "speaker"]);
}

function studentRole(kind, names) {
  if (kind === "call" || kind === "class") {
    return firstRole(names, ["viewer-on-stage", "guest", "student", "co-host"]);
  }
  return firstRole(names, ["viewer", "hls-viewer", "guest", "viewer-on-stage"]);
}

async function hmsFetch(path, opts) {
  const res = await fetch("https://api.100ms.live/v2" + path, {
    method: (opts && opts.method) || "GET",
    headers: {
      Authorization: "Bearer " + managementToken(),
      "Content-Type": "application/json"
    },
    body: opts && opts.body ? JSON.stringify(opts.body) : undefined
  });
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
  if (!res.ok) {
    const err = new Error(data.message || data.error || text || ("100ms " + res.status));
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

async function codesForRoom(roomId) {
  let payload = null;
  try {
    payload = await hmsFetch("/room-codes/room/" + roomId);
  } catch {
    payload = null;
  }
  let list = Array.isArray(payload && payload.data) ? payload.data : [];
  list = list.filter((c) => c && c.enabled !== false && c.code && c.role && !String(c.role).startsWith("__"));
  if (list.length) return list;
  payload = await hmsFetch("/room-codes/room/" + roomId, { method: "POST" });
  list = Array.isArray(payload && payload.data) ? payload.data : [];
  return list.filter((c) => c && c.enabled !== false && c.code);
}

function roomName(kind, id) {
  return ("bizgarh-" + normalizeKind(kind) + "-" + slug(id)).slice(0, 80);
}

function maxDurationSeconds(kind, duration) {
  const m = String(duration || "").match(/(\d+)/);
  let mins = m ? Number(m[1]) : (kind === "call" ? 60 : 90);
  if (!Number.isFinite(mins) || mins < 5) mins = kind === "call" ? 60 : 90;
  mins = Math.min(mins + 15, 12 * 60);
  return Math.min(43200, Math.max(120, mins * 60));
}

export async function ensureHmsRoom({ kind, id, title, asHost, duration }) {
  if (!hmsReady()) {
    const err = new Error("100ms is not connected");
    err.status = 503;
    throw err;
  }
  const k = normalizeKind(kind);
  const name = roomName(k, id);
  const room = await hmsFetch("/rooms", {
    method: "POST",
    body: {
      name,
      description: String(title || name).slice(0, 180),
      template_id: hmsTemplateId(k),
      region: envGet("HMS_REGION", "in"),
      max_duration_seconds: maxDurationSeconds(k, duration)
    }
  });
  const roomId = room.id || room.room_id;
  if (!roomId) throw new Error("100ms did not return a room id");
  const codes = await codesForRoom(roomId);
  const names = codes.map((c) => c.role).filter(Boolean);
  const role = asHost ? hostRole(names) : studentRole(k, names);
  const row = codes.find((c) => c.role === role) || codes[0];
  if (!row || !row.code) throw new Error("No 100ms room code for this role");
  const host = hmsSubdomain();
  const path = asHost ? "/meeting/" : "/preview/";
  return {
    ok: true,
    kind: k,
    roomId,
    role: row.role,
    hostRole: hostRole(names),
    joinUrl: "https://" + host + path + row.code
  };
}

function isHostRoleName(role) {
  return /broadcaster|host|teacher|speaker/i.test(String(role || ""));
}

export async function hmsRoomIdByKey(kind, id) {
  const k = normalizeKind(kind);
  const room = await hmsFetch("/rooms", {
    method: "POST",
    body: { name: roomName(k, id) }
  });
  return room.id || room.room_id || "";
}

function peerRows(data) {
  const raw = data && data.peers;
  const list = Array.isArray(raw) ? raw : (raw && typeof raw === "object" ? Object.values(raw) : []);
  return list.map((p) => ({
    id: p.id || p.peer_id || "",
    name: p.name || p.user_name || "Guest",
    role: p.role || "",
    joinedAt: p.joined_at || "",
    host: isHostRoleName(p.role)
  })).filter((p) => p.id);
}

export async function listHmsPeers(kind, id) {
  const roomId = await hmsRoomIdByKey(kind, id);
  if (!roomId) return { roomId: "", peers: [] };
  try {
    const data = await hmsFetch("/active-rooms/" + roomId);
    return { roomId, peers: peerRows(data) };
  } catch (err) {
    if (err.status === 404) return { roomId, peers: [] };
    throw err;
  }
}

export async function removeHmsPeer(kind, id, peerId) {
  const roomId = await hmsRoomIdByKey(kind, id);
  await hmsFetch("/active-rooms/" + roomId + "/remove-peer", {
    method: "POST",
    body: { peer_id: peerId, reason: "Removed by host" }
  });
  return { ok: true, roomId, peerId };
}

export async function muteHmsPeers(kind, id, peerId, all) {
  const { roomId, peers } = await listHmsPeers(kind, id);
  const targets = all ? peers.filter((p) => !p.host) : peers.filter((p) => p.id === peerId);
  for (const p of targets) {
    try {
      await hmsFetch("/active-rooms/" + roomId + "/peers/" + p.id, {
        method: "POST",
        body: { mute: { audio: true } }
      });
    } catch {
      try {
        await hmsFetch("/active-rooms/" + roomId + "/peers/" + p.id, {
          method: "POST",
          body: { role: "viewer" }
        });
      } catch {
        /* 100ms template may already keep students muted */
      }
    }
  }
  return { ok: true, roomId, muted: targets.length };
}

export async function endHmsSession({ kind, id }) {
  if (!hmsReady()) {
    const err = new Error("100ms is not connected");
    err.status = 503;
    throw err;
  }
  const k = normalizeKind(kind);
  const room = await hmsFetch("/rooms", {
    method: "POST",
    body: { name: roomName(k, id) }
  });
  const roomId = room.id || room.room_id;
  if (!roomId) throw new Error("100ms did not return a room id");
  try {
    await hmsFetch("/active-rooms/" + roomId + "/end-room", {
      method: "POST",
      body: { reason: "Ended on Bizgarh", lock: false }
    });
  } catch (err) {
    if (err.status === 404) return { ok: true, ended: false, roomId };
    throw err;
  }
  return { ok: true, ended: true, roomId };
}
