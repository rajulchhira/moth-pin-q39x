import { pagesHandler } from "../_shared/adapt.js";
import {
  createRazorpayOrder,
  razorpayKeyId,
  razorpayReady
} from "../_shared/razorpay.js";

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
    return json(event, { ok: false, error: "POST only", ready: razorpayReady() }, 405);
  }
  if (!razorpayReady()) {
    return json(event, { ok: false, error: "Razorpay is not configured", ready: false }, 401);
  }

  let body = {};
  try { body = JSON.parse(event.body || "{}"); } catch { body = {}; }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount < 100 || !Number.isInteger(amount)) {
    return json(event, { ok: false, error: "amount must be an integer >= 100 (paise)" }, 400);
  }

  const currency = String(body.currency || "INR").toUpperCase() || "INR";
  const receipt = body.receipt ? String(body.receipt).slice(0, 40) : undefined;
  const notes = body.notes && typeof body.notes === "object" ? body.notes : undefined;

  try {
    const order = await createRazorpayOrder({ amount, currency, receipt, notes });
    return json(event, {
      ok: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency || currency,
      key_id: razorpayKeyId()
    });
  } catch (err) {
    const status = err.status || 500;
    return json(event, {
      ok: false,
      error: err.message || "Could not create order",
      ready: razorpayReady()
    }, status);
  }
}

export const onRequest = pagesHandler(handler);
