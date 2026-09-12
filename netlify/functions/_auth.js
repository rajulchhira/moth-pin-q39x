const crypto = require("crypto");

function botToken() {
  return String(process.env.TELEGRAM_BOT_TOKEN || "").trim();
}

function publicOrigin() {
  const env = String(process.env.APP_URL || "").trim().replace(/\/$/, "");
  if (env) return env;
  return "https://bizgarh.com";
}

function safeNext(next) {
  const n = String(next || "").trim().replace(/^\/+/, "");
  if (!/^[A-Za-z0-9._-]+\.html$/.test(n)) return "index.html";
  return n;
}

function redirect(url) {
  return { statusCode: 302, headers: { Location: url, "Cache-Control": "no-store" }, body: "" };
}

function json(body, status) {
  return {
    statusCode: status || 200,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    body: JSON.stringify(body)
  };
}

function ticketKey() {
  const token = botToken();
  const extra = String(process.env.SESSION_SECRET || "bizgarh").trim();
  return crypto.createHmac("sha256", extra).update(token).digest();
}

function signTicket(user, provider) {
  const payload = Buffer.from(JSON.stringify({
    user,
    provider,
    exp: Date.now() + 3 * 60 * 1000
  })).toString("base64url");
  const sig = crypto.createHmac("sha256", ticketKey()).update(payload).digest("hex");
  return payload + "." + sig;
}

function readTicket(id) {
  const raw = String(id || "");
  const dot = raw.lastIndexOf(".");
  if (dot < 1) return null;
  const payload = raw.slice(0, dot);
  const sig = raw.slice(dot + 1).toLowerCase();
  const calc = crypto.createHmac("sha256", ticketKey()).update(payload).digest("hex");
  try {
    if (!crypto.timingSafeEqual(Buffer.from(calc, "hex"), Buffer.from(sig, "hex"))) return null;
  } catch {
    return null;
  }
  let data;
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (!data || !data.user || Date.now() > Number(data.exp || 0)) return null;
  return data;
}

function verifyTelegram(qs) {
  const hash = String(qs.hash || "").toLowerCase();
  const token = botToken();
  if (!hash || !token) return false;
  const skip = new Set(["hash", "next", "flow", "ticket"]);
  const keys = Object.keys(qs).filter((k) => k && !skip.has(k)).sort();
  const check = keys.map((k) => `${k}=${qs[k]}`).join("\n");
  const secret = crypto.createHash("sha256").update(token).digest();
  const calc = crypto.createHmac("sha256", secret).update(check).digest("hex");
  try {
    if (!crypto.timingSafeEqual(Buffer.from(calc, "hex"), Buffer.from(hash, "hex"))) return false;
  } catch {
    return false;
  }
  const authDate = Number(qs.auth_date || 0);
  if (!authDate) return false;
  const age = Math.abs(Math.floor(Date.now() / 1000) - authDate);
  return age < 86400;
}

function oauthUserFromTelegram(qs) {
  const id = String(qs.id || "");
  const handle = String(qs.username || "").replace(/^@/, "").trim().toLowerCase();
  const name = [qs.first_name, qs.last_name].filter(Boolean).join(" ").trim() || handle || "Telegram user";
  const email = (handle || id) + "@telegram.user";
  return {
    name,
    email,
    password: "",
    providers: ["telegram"],
    providerId: id,
    emailVerified: true,
    status: "active",
    created: new Date().toISOString(),
    referredBy: ""
  };
}

function setupHtml() {
  const origin = publicOrigin();
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Connect Telegram | Bizgarh</title>
<style>
body{font-family:Nunito,Arial,sans-serif;background:#f8fafc;color:#0f172a;margin:0;padding:40px}
.card{max-width:640px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:28px}
h1{margin:0 0 8px} .muted{color:#64748b}
code,pre{background:#f1f5f9;padding:2px 6px;border-radius:6px;font-size:13px}
li{margin:8px 0}
</style></head><body><div class="card">
<h1>Connect Telegram login</h1>
<p class="muted">BotFather setup is done. Add these two values in Netlify, then trigger a new deploy.</p>
<p>Netlify → Site configuration → Environment variables:</p>
<pre>TELEGRAM_BOT_TOKEN   (from BotFather)
APP_URL              ${origin}</pre>
<p>BotFather <code>/setdomain</code> should be <code>bizgarh.com</code> with no https.</p>
<p><a href="/index.html">Back to Bizgarh</a></p>
</div></body></html>`;
}

module.exports = {
  botToken,
  publicOrigin,
  safeNext,
  redirect,
  json,
  signTicket,
  readTicket,
  verifyTelegram,
  oauthUserFromTelegram,
  setupHtml
};
