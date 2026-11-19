import { pagesHandler } from "../_shared/adapt.js";
import { razorpayReady, verifyPaymentSignature } from "../_shared/razorpay.js";

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

  const orderId = String(body.razorpay_order_id || "").trim();
  const paymentId = String(body.razorpay_payment_id || "").trim();
  const signature = String(body.razorpay_signature || "").trim();

  if (!orderId || !paymentId || !signature) {
    return json(event, {
      ok: false,
      error: "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required"
    }, 400);
  }

  const match = verifyPaymentSignature({ orderId, paymentId, signature });
  if (!match) {
    return json(event, { ok: false, error: "Payment signature mismatch" }, 400);
  }

  return json(event, { ok: true });
}

export const onRequest = pagesHandler(handler);
