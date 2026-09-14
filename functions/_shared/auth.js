import crypto from "node:crypto";

function envGet(key, fallback) {
  const g = globalThis.process && globalThis.process.env ? globalThis.process.env : {};
  const v = g[key];
  return String(v == null ? fallback || "" : v).trim();
}

export function botToken() {
  return envGet("TELEGRAM_BOT_TOKEN");
}

export function googleClientId() {
  return envGet("GOOGLE_CLIENT_ID");
}

export function googleClientSecret() {
  return envGet("GOOGLE_CLIENT_SECRET");
}

export function googleReady() {
  return Boolean(googleClientId() && googleClientSecret());
}

export function publicOrigin() {
  const env = envGet("APP_URL").replace(/\/$/, "");
  if (env) return env;
  return "https://www.bizgarh.com";
}

export function requestOrigin(event) {
  const headers = event && event.headers ? event.headers : {};
  const host = String(headers["x-forwarded-host"] || headers.host || "").split(",")[0].trim();
  const proto = String(headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  if (host) return `${proto}://${host}`.replace(/\/$/, "");
  return publicOrigin();
}

export function readCookie(event, name) {
  const headers = event && event.headers ? event.headers : {};
  const raw = String(headers.cookie || headers.Cookie || "");
  const parts = raw.split(";");
  for (const part of parts) {
    const kv = part.trim();
    const eq = kv.indexOf("=");
    if (eq < 1) continue;
    if (kv.slice(0, eq) === name) return kv.slice(eq + 1);
  }
  return "";
}

export function safeNext(next) {
  let n = String(next || "").trim().replace(/^\/+/, "").split("?")[0].split("#")[0];
  if (!n || n === "index") return "index.html";
  if (!n.endsWith(".html")) n += ".html";
  if (!/^[A-Za-z0-9._-]+\.html$/.test(n)) return "index.html";
  return n;
}

export function publicPath(next) {
  const n = safeNext(next);
  if (n === "index.html") return "/";
  return "/" + n.replace(/\.html$/i, "");
}

export function redirect(url, extraHeaders) {
  return {
    statusCode: 302,
    headers: { Location: url, "Cache-Control": "no-store", ...(extraHeaders || {}) },
    body: ""
  };
}

export function json(body, status) {
  return {
    statusCode: status || 200,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    body: JSON.stringify(body)
  };
}

function ticketKey() {
  const token = botToken() || googleClientSecret() || "bizgarh";
  const extra = envGet("SESSION_SECRET", "bizgarh");
  return crypto.createHmac("sha256", extra).update(token).digest();
}

export function signTicket(user, provider) {
  const payload = Buffer.from(JSON.stringify({
    user,
    provider,
    exp: Date.now() + 3 * 60 * 1000
  })).toString("base64url");
  const sig = crypto.createHmac("sha256", ticketKey()).update(payload).digest("hex");
  return payload + "." + sig;
}

export function readTicket(id) {
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

export function verifyTelegram(qs) {
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

export function oauthUserFromGoogle(info) {
  const email = String(info && info.email || "").trim().toLowerCase();
  const name = String((info && info.name) || email || "Google user").trim();
  return {
    name,
    email,
    password: "",
    providers: ["google"],
    providerId: String((info && info.sub) || email),
    emailVerified: true,
    status: "active",
    created: new Date().toISOString(),
    referredBy: ""
  };
}

export function oauthUserFromTelegram(qs) {
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

export function setupHtml(kind) {
  const origin = publicOrigin();
  if (kind === "google") {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Connect Google | Bizgarh</title>
<style>
body{font-family:Nunito,Arial,sans-serif;background:#f8fafc;color:#0f172a;margin:0;padding:40px}
.card{max-width:640px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:28px}
h1{margin:0 0 8px} .muted{color:#64748b}
code,pre{background:#f1f5f9;padding:2px 6px;border-radius:6px;font-size:13px}
li{margin:8px 0}
</style></head><body><div class="card">
<h1>Connect Google login</h1>
<p class="muted">Create a Web OAuth client in Google Cloud, then add the two values in Cloudflare Pages and redeploy.</p>
<p>Authorized JavaScript origins:</p>
<pre>https://bizgarh.com
https://www.bizgarh.com</pre>
<p>Authorized redirect URIs:</p>
<pre>https://bizgarh.com/auth/google/callback
https://www.bizgarh.com/auth/google/callback</pre>
<p>Cloudflare Pages → Settings → Environment variables:</p>
<pre>GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
APP_URL              ${origin}</pre>
<p><a href="/">Back to Bizgarh</a></p>
</div></body></html>`;
  }
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Connect Telegram | Bizgarh</title>
<style>
body{font-family:Nunito,Arial,sans-serif;background:#f8fafc;color:#0f172a;margin:0;padding:40px}
.card{max-width:640px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:28px}
h1{margin:0 0 8px} .muted{color:#64748b}
code,pre{background:#f1f5f9;padding:2px 6px;border-radius:6px;font-size:13px}
li{margin:8px 0}
</style></head><body><div class="card">
<h1>Connect Telegram login</h1>
<p class="muted">Add the BotFather token in Cloudflare Pages, then redeploy.</p>
<pre>TELEGRAM_BOT_TOKEN
APP_URL              ${origin}</pre>
<p>BotFather <code>/setdomain</code> should be <code>bizgarh.com</code> with no https.</p>
<p><a href="/">Back to Bizgarh</a></p>
</div></body></html>`;
}
