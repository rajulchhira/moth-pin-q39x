import { pagesHandler } from "../../_shared/adapt.js";
import { hmsReady, listHmsPeers, muteHmsPeers, removeHmsPeer } from "../../_shared/hms.js";

function cors(origin) {
  const allow = [
    "https://bizgarh.com",
    "https://www.bizgarh.com",
    "http://127.0.0.1:5510",
    "http://127.0.0.1:5500",
    "http://localhost:5510",
    "http://localhost:5500"
  ];
  return {
    "Access-Control-Allow-Origin": allow.includes(origin) ? origin : "https://bizgarh.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store"
  };
}

function json(event, body, status) {
  const origin = String((event.headers || {}).origin || (event.headers || {}).Origin || "");
  return {
    statusCode: status || 200,
    headers: { "Content-Type": "application/json; charset=utf-8", ...cors(origin) },
    body: JSON.stringify(body)
  };
}

async function handler(event) {
  const origin = String((event.headers || {}).origin || (event.headers || {}).Origin || "");
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors(origin), body: "" };
  }
  if (event.httpMethod !== "POST") {
    return json(event, { ok: false, error: "POST only", ready: hmsReady() }, 405);
  }
  let body = {};
  try { body = JSON.parse(event.body || "{}"); } catch { body = {}; }
  const id = String(body.id || "").trim();
  const action = String(body.action || "list").toLowerCase();
  if (!id) return json(event, { ok: false, error: "Missing room id" }, 400);
  if (!body.asHost) return json(event, { ok: false, error: "Only the host can manage this room" }, 403);
  try {
    if (action === "kick") {
      if (!body.peerId) return json(event, { ok: false, error: "Missing peer" }, 400);
      const out = await removeHmsPeer(body.kind, id, body.peerId);
      return json(event, { ok: true, ...out });
    }
    if (action === "mute" || action === "muteall") {
      const out = await muteHmsPeers(body.kind, id, body.peerId, action === "muteall");
      return json(event, { ok: true, ...out });
    }
    const out = await listHmsPeers(body.kind, id);
    return json(event, { ok: true, ...out });
  } catch (err) {
    return json(event, { ok: false, error: err.message || "Could not update the room" }, err.status || 500);
  }
}

export const onRequest = pagesHandler(handler);
