import crypto from "node:crypto";

function envGet(key, fallback) {
  const g = globalThis.process && globalThis.process.env ? globalThis.process.env : {};
  const v = g[key];
  return String(v == null ? fallback || "" : v).trim();
}

export function razorpayKeyId() {
  return envGet("RAZORPAY_KEY_ID");
}

export function razorpayKeySecret() {
  return envGet("RAZORPAY_KEY_SECRET");
}

export function razorpayReady() {
  return Boolean(razorpayKeyId() && razorpayKeySecret());
}

export function razorpayAuthHeader() {
  const id = razorpayKeyId();
  const secret = razorpayKeySecret();
  if (!id || !secret) return "";
  const token = Buffer.from(`${id}:${secret}`, "utf8").toString("base64");
  return `Basic ${token}`;
}

export function timingSafeEqualHex(a, b) {
  const left = String(a || "");
  const right = String(b || "");
  if (!left || !right) return false;
  const bufA = Buffer.from(left, "utf8");
  const bufB = Buffer.from(right, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyPaymentSignature({ orderId, paymentId, signature }) {
  const secret = razorpayKeySecret();
  if (!secret) return false;
  const payload = `${String(orderId || "").trim()}|${String(paymentId || "").trim()}`;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return timingSafeEqualHex(expected, String(signature || "").trim());
}

export async function createRazorpayOrder({ amount, currency, receipt, notes }) {
  const auth = razorpayAuthHeader();
  if (!auth) {
    const err = new Error("Razorpay is not configured");
    err.status = 401;
    throw err;
  }
  const body = {
    amount: Number(amount),
    currency: String(currency || "INR").toUpperCase(),
    receipt: String(receipt || `rcpt_${Date.now()}`).slice(0, 40)
  };
  if (notes && typeof notes === "object") body.notes = notes;

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.id) {
    const msg = data.error?.description || data.error?.reason || data.message || "Razorpay order failed";
    const err = new Error(msg);
    err.status = res.status === 401 || res.status === 403 ? 401 : 500;
    err.razorpay = data;
    throw err;
  }
  return data;
}
