import { connect } from "cloudflare:sockets";
import crypto from "node:crypto";
import { publicOrigin } from "./auth.js";

function corsHeaders(event) {
  const origin = String((event.headers || {}).origin || (event.headers || {}).Origin || "");
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
  return {
    statusCode: status || 200,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders(event) },
    body: JSON.stringify(body)
  };
}

function esc(s) {
  return String(s || "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
}

function firstName(name) {
  const n = String(name || "").trim();
  return n.split(/\s+/)[0] || "there";
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ""));
}

function welcomeHtml(p) {
  const origin = publicOrigin();
  const first = esc(p.first);
  const title = esc(p.title);
  const instructor = esc(p.instructor);
  const hours = esc(p.hours);
  const lessons = esc(p.lessons);
  const courseUrl = origin + "/course?id=" + encodeURIComponent(p.courseId);
  const logo = origin + "/img/bizgarh-logo-transparent.png";
  return `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#eef1f7;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#eef1f7;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background:#fbf7f1;border-radius:18px;overflow:hidden;border:1px solid #eadfd4;">
          <tr>
            <td style="padding:0;background:linear-gradient(90deg,#4F46E5 0%,#7C3AED 48%,#E11D74 100%);height:8px;font-size:0;line-height:8px;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:28px 36px 8px 36px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:10px;">
                    <img src="${logo}" width="36" height="36" alt="Bizgarh" style="display:block;border:0;border-radius:18px;">
                  </td>
                  <td style="vertical-align:middle;font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:700;color:#1e1b4b;letter-spacing:-0.02em;">Bizgarh</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 36px 0 36px;font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:#7C3AED;font-weight:700;">
              A note from the desk
            </td>
          </tr>
          <tr>
            <td style="padding:8px 36px 0 36px;font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:1.2;color:#1e1b4b;font-weight:700;">
              Welcome to Bizgarh, ${first}.
            </td>
          </tr>
          <tr>
            <td style="padding:16px 36px 0 36px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.7;color:#475569;">
              Hello ${first},<br><br>
              Thank you for joining us. We saved your seat in <strong style="color:#4F46E5;">${title}</strong> with ${instructor}, and we are glad you are here.<br><br>
              Take the first lesson when you are ready. Pause where you need to. Write the setup, the invalidation, and the size. Replay before the next session. This is a classroom for Indian traders &#8212; not a tip desk.
            </td>
          </tr>
          <tr>
            <td style="padding:24px 36px 0 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border:1px solid #eadfd4;border-radius:14px;">
                <tr>
                  <td style="padding:20px 22px;">
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#E11D74;">Your course</div>
                    <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;color:#1e1b4b;font-weight:700;padding-top:6px;">${title}</div>
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#64748b;padding-top:6px;">Taught by ${instructor} &#183; ${lessons} lessons &#183; ${hours} hrs</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:26px 36px 0 36px;" align="center">
              <a href="${esc(courseUrl)}" style="display:inline-block;background:#4F46E5;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:999px;">Open your classroom</a>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 36px 0 36px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#1e1b4b;">
              What to do first
            </td>
          </tr>
          <tr>
            <td style="padding:12px 36px 0 36px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#334155;line-height:1.5;">
              <span style="color:#7C3AED;font-weight:800;">01</span>&nbsp;&nbsp;Open lesson one and watch it once through.<br><br>
              <span style="color:#7C3AED;font-weight:800;">02</span>&nbsp;&nbsp;Write the setup, invalidation, and size in your journal.<br><br>
              <span style="color:#7C3AED;font-weight:800;">03</span>&nbsp;&nbsp;Replay before the next session. Do not copy trades.
            </td>
          </tr>
          <tr>
            <td style="padding:28px 36px 8px 36px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.7;color:#334155;">
              Warm regards,<br>
              <strong style="color:#1e1b4b;">The Bizgarh desk</strong>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 36px 8px 36px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#64748b;line-height:1.6;">
              If anything is stuck &#8212; login, video, or the classroom &#8212; write to <a href="mailto:desk@bizgarh.com" style="color:#4F46E5;font-weight:700;text-decoration:none;">desk@bizgarh.com</a>. We reply on a working day.
            </td>
          </tr>
          <tr>
            <td style="padding:22px 36px 32px 36px;border-top:1px solid #eadfd4;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#94a3b8;line-height:1.7;">
                Bizgarh Learning Pvt Ltd &#183; bizgarh.com<br>
                Educational content only. Not investment advice.<br>
                You received this because you bought a classroom seat.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function welcomeText(p) {
  return [
    `Welcome to Bizgarh, ${p.first}.`,
    "",
    `Hello ${p.first},`,
    "",
    `Thank you for joining us. We saved your seat in ${p.title} with ${p.instructor}, and we are glad you are here.`,
    "",
    "Take the first lesson when you are ready. This is a classroom for Indian traders — not a tip desk.",
    "",
    `Open your classroom: ${publicOrigin()}/course?id=${encodeURIComponent(p.courseId)}`,
    "",
    "Warm regards,",
    "The Bizgarh desk",
    "desk@bizgarh.com"
  ].join("\n");
}

function wrap76(s) {
  return String(s).replace(/(.{1,76})/g, "$1\r\n").trim();
}

function wait(ms, msg) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(msg)), ms);
  });
}

function attachIo(socket) {
  const writer = socket.writable.getWriter();
  const reader = socket.readable.getReader();
  const decoder = new TextDecoder();
  let leftover = "";

  async function readResp() {
    const started = Date.now();
    while (true) {
      if (Date.now() - started > 12000) throw new Error("SMTP timeout");
      const chunk = await Promise.race([
        reader.read(),
        wait(12000, "SMTP timeout")
      ]);
      if (chunk.done) throw new Error("SMTP closed");
      leftover += decoder.decode(chunk.value, { stream: true });
      const chunks = leftover.split(/\r?\n/);
      leftover = chunks.pop() || "";
      const lines = chunks.filter(Boolean);
      if (!lines.length) continue;
      const last = lines[lines.length - 1];
      if (/^\d{3} /.test(last)) {
        return { code: Number(last.slice(0, 3)), text: lines.join("\n") };
      }
    }
  }

  async function talk(cmd) {
    if (cmd != null) await writer.write(new TextEncoder().encode(cmd + "\r\n"));
    return readResp();
  }

  async function close() {
    try { await writer.close(); } catch { /* ignore */ }
    try { reader.releaseLock(); } catch { /* ignore */ }
    try { socket.close(); } catch { /* ignore */ }
  }

  async function release() {
    try { writer.releaseLock(); } catch { /* ignore */ }
    try { reader.releaseLock(); } catch { /* ignore */ }
  }

  return { talk, readResp, close, release };
}

async function smtpSession(host, port) {
  const useTls = Number(port) === 465;
  let socket = connect(
    { hostname: host, port: Number(port) },
    { secureTransport: useTls ? "on" : "starttls" }
  );
  await Promise.race([socket.opened, wait(10000, "SMTP connect timeout")]);
  let io = attachIo(socket);

  const greet = await io.readResp();
  if (greet.code !== 220) throw new Error(greet.text || "SMTP greeting failed");

  if (!useTls) {
    const ehlo = await io.talk("EHLO bizgarh.com");
    if (ehlo.code !== 250) throw new Error(ehlo.text);
    const start = await io.talk("STARTTLS");
    if (start.code !== 220) throw new Error(start.text);
    await io.release();
    socket = socket.startTls();
    await Promise.race([socket.opened, wait(10000, "SMTP TLS timeout")]);
    io = attachIo(socket);
  }

  return io;
}

async function sendSmtp({ to, name, subject, html, text }) {
  const host = String(process.env.SMTP_HOST || "smtpout.secureserver.net").trim();
  const port = Number(process.env.SMTP_PORT || 465);
  const user = String(process.env.SMTP_USER || "desk@bizgarh.com").trim();
  const pass = String(process.env.SMTP_PASS || "").trim();
  const from = String(process.env.MAIL_FROM || "Bizgarh Desk <desk@bizgarh.com>").trim();
  if (!pass) throw new Error("SMTP_PASS is not set");

  const fromEmail = (from.match(/<([^>]+)>/) || [null, user])[1];
  const toHeader = name ? `"${String(name).replace(/"/g, "")}" <${to}>` : to;
  const boundary = "bg" + crypto.randomBytes(8).toString("hex");
  const raw = [
    `From: ${from}`,
    `To: ${toHeader}`,
    `Reply-To: desk@bizgarh.com`,
    `Subject: =?UTF-8?B?${Buffer.from(subject, "utf8").toString("base64")}?=`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${Date.now()}.${crypto.randomBytes(6).toString("hex")}@bizgarh.com>`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    wrap76(Buffer.from(text, "utf8").toString("base64")),
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    wrap76(Buffer.from(html, "utf8").toString("base64")),
    `--${boundary}--`,
    ""
  ].join("\r\n");

  const smtp = await smtpSession(host, port);
  try {
    const ehlo = await smtp.talk("EHLO bizgarh.com");
    if (ehlo.code !== 250) throw new Error(ehlo.text);
    const auth = await smtp.talk("AUTH LOGIN");
    if (auth.code !== 334) throw new Error(auth.text);
    const u = await smtp.talk(Buffer.from(user, "utf8").toString("base64"));
    if (u.code !== 334) throw new Error(u.text);
    const p = await smtp.talk(Buffer.from(pass, "utf8").toString("base64"));
    if (p.code !== 235) throw new Error("SMTP login failed");
    const mail = await smtp.talk(`MAIL FROM:<${fromEmail}>`);
    if (mail.code !== 250) throw new Error(mail.text);
    const rcpt = await smtp.talk(`RCPT TO:<${to}>`);
    if (rcpt.code !== 250) throw new Error(rcpt.text);
    const data = await smtp.talk("DATA");
    if (data.code !== 354) throw new Error(data.text);
    const done = await smtp.talk(raw.replace(/^\./gm, "..") + "\r\n.");
    if (done.code !== 250) throw new Error(done.text);
    await smtp.talk("QUIT").catch(() => {});
  } finally {
    await smtp.close();
  }
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(event), body: "" };
  }
  if (event.httpMethod !== "POST") return json(event, { error: "POST only" }, 405);
  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(event, { error: "Bad JSON" }, 400);
  }
  const email = String(body.email || "").trim().toLowerCase();
  const name = String(body.name || "").trim().slice(0, 80);
  const courseId = String(body.courseId || "").trim().slice(0, 80);
  const title = String(body.title || "Classroom").trim().slice(0, 140);
  const instructor = String(body.instructor || "Bizgarh").trim().slice(0, 80);
  const hours = String(body.hours || "").trim().slice(0, 12);
  const lessons = String(body.lessons || "").trim().slice(0, 8);
  if (!validEmail(email) || !courseId || !/^[a-z0-9-]+$/i.test(courseId)) {
    return json(event, { error: "Invalid student" }, 400);
  }
  const first = firstName(name);
  const payload = { first, title, instructor, hours, lessons, courseId };
  try {
    await sendSmtp({
      to: email,
      name,
      subject: `Welcome, ${first} — your classroom is ready`,
      html: welcomeHtml(payload),
      text: welcomeText(payload)
    });
    return json(event, { ok: true });
  } catch {
    return json(event, { ok: false, error: "Could not send welcome mail" }, 502);
  }
}
