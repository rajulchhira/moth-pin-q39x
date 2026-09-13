import { connect } from "cloudflare:sockets";
import crypto from "node:crypto";

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

export async function sendSmtp({ to, name, subject, html, text }) {
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
