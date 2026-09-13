import { pagesHandler } from "../_shared/adapt.js";
import { flushCompletedDigests } from "../_shared/digest.js";

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
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store"
  };
}

async function handler(event) {
  const origin = String((event.headers || {}).origin || (event.headers || {}).Origin || "");
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors(origin), body: "" };
  }
  const out = await flushCompletedDigests(event.env);
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json; charset=utf-8", ...cors(origin) },
    body: JSON.stringify({ ok: true, ...out })
  };
}

export const onRequest = pagesHandler(handler);
