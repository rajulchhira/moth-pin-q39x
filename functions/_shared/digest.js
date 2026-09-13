import { publicOrigin } from "./auth.js";
import { sendSmtp } from "./mail.js";

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

export function istDay(d) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(d || new Date());
}

export function istYesterday(d) {
  const today = istDay(d);
  const [y, m, day] = today.split("-").map(Number);
  const startIstMs = Date.UTC(y, m - 1, day, 0, 0, 0) - (5.5 * 3600000);
  return istDay(new Date(startIstMs - 86400000));
}

function prettyIstDate(ymd) {
  const [y, m, d] = String(ymd || "").split("-").map(Number);
  if (!y || !m || !d) return String(ymd || "");
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  });
}

export function creatorEarning(amount, shareType, shareRate) {
  const type = String(shareType || "percent").toLowerCase() === "fixed" ? "fixed" : "percent";
  const rate = Number(shareRate);
  const gross = Math.max(0, Number(amount) || 0);
  if (!Number.isFinite(rate) || rate < 0) return 0;
  if (type === "fixed") return Math.round(rate);
  return Math.round(gross * Math.min(100, rate) / 100);
}

function inr(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}

function salesKv(env) {
  return env && (env.SALES || env.SALES_KV || null);
}

function dayKey(date, email) {
  return "digest:" + date + ":" + String(email || "").toLowerCase();
}

function saleKey(date, email, courseId, studentEmail) {
  return "sale:" + date + ":" + String(studentEmail || "").toLowerCase() + ":" + courseId;
}

export async function recordCreatorSale(env, raw) {
  const kv = salesKv(env);
  if (!kv) return null;
  const creatorEmail = String(raw.creatorEmail || "").trim().toLowerCase();
  const creatorName = String(raw.creatorName || "").trim().slice(0, 80);
  const studentEmail = String(raw.studentEmail || "").trim().toLowerCase();
  const courseId = String(raw.courseId || "").trim().slice(0, 80);
  const amount = Math.max(0, Number(raw.amount) || 0);
  const shareType = String(raw.shareType || "percent").toLowerCase() === "fixed" ? "fixed" : "percent";
  const shareRate = Number(raw.shareRate);
  if (!validEmail(creatorEmail) || !validEmail(studentEmail) || !/^[a-z0-9-]+$/i.test(courseId)) return null;
  const date = istDay();
  const dupe = saleKey(date, creatorEmail, courseId, studentEmail);
  if (await kv.get(dupe)) return null;
  const earning = creatorEarning(amount, shareType, shareRate);
  const key = dayKey(date, creatorEmail);
  const prev = JSON.parse((await kv.get(key)) || "null") || {
    date,
    creatorEmail,
    creatorName,
    shareType,
    shareRate: Number.isFinite(shareRate) ? shareRate : 0,
    sales: 0,
    earning: 0,
    gross: 0,
    sent: false
  };
  prev.creatorName = creatorName || prev.creatorName;
  prev.shareType = shareType;
  prev.shareRate = Number.isFinite(shareRate) ? shareRate : prev.shareRate;
  prev.sales += 1;
  prev.earning += earning;
  prev.gross += amount;
  prev.sent = false;
  await kv.put(key, JSON.stringify(prev));
  await kv.put(dupe, "1", { expirationTtl: 60 * 60 * 24 * 14 });
  return prev;
}

function digestHtml(row) {
  const origin = publicOrigin();
  const first = esc(firstName(row.creatorName));
  const day = esc(prettyIstDate(row.date));
  const sales = Number(row.sales || 0);
  const earning = inr(row.earning);
  const share = row.shareType === "fixed"
    ? inr(row.shareRate) + " per sale"
    : String(row.shareRate) + "% of each sale";
  const logo = origin + "/img/bizgarh-logo-transparent.png";
  const adminUrl = origin + "/admin.html";
  const saleWord = sales === 1 ? "sale" : "sales";
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
            <td style="padding:18px 36px 0 36px;font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:#E11D74;font-weight:700;">
              Day close · ${day}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 36px 0 36px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;color:#1e1b4b;font-weight:700;">
              Your classrooms closed the day, ${first}.
            </td>
          </tr>
          <tr>
            <td style="padding:16px 36px 0 36px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.7;color:#475569;">
              Hello ${first},<br><br>
              This is the close for <strong style="color:#1e1b4b;">your classrooms only</strong>. Other creators are not copied. Your earning is the share the superadmin set for you — not the full course price.
            </td>
          </tr>
          <tr>
            <td style="padding:24px 36px 0 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border:1px solid #eadfd4;border-radius:14px;">
                <tr>
                  <td width="50%" style="padding:22px 22px;border-right:1px solid #f1e7dc;">
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#E11D74;">Total sales</div>
                    <div style="font-family:Georgia,'Times New Roman',serif;font-size:36px;color:#1e1b4b;font-weight:700;padding-top:4px;">${sales}</div>
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#64748b;padding-top:4px;">${saleWord} today</div>
                  </td>
                  <td width="50%" style="padding:22px 22px;">
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#E11D74;">Your earning</div>
                    <div style="font-family:Georgia,'Times New Roman',serif;font-size:36px;color:#1e1b4b;font-weight:700;padding-top:4px;">${esc(earning)}</div>
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#64748b;padding-top:4px;">Your share · ${esc(share)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:26px 36px 0 36px;" align="center">
              <a href="${esc(adminUrl)}" style="display:inline-block;background:#4F46E5;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:999px;">Open your admin desk</a>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 36px 8px 36px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.7;color:#334155;">
              Tomorrow the count starts again at zero.<br><br>
              Warm regards,<br>
              <strong style="color:#1e1b4b;">The Bizgarh desk</strong>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 36px 32px 36px;border-top:1px solid #eadfd4;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#94a3b8;line-height:1.7;">
                Bizgarh Learning Pvt Ltd · bizgarh.com<br>
                You received this because at least one seat sold in a classroom assigned to you.
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

function digestText(row) {
  const first = firstName(row.creatorName);
  const sales = Number(row.sales || 0);
  const share = row.shareType === "fixed"
    ? inr(row.shareRate) + " per sale"
    : String(row.shareRate) + "% of each sale";
  return [
    `Hello ${first},`,
    "",
    `Day close for ${prettyIstDate(row.date)}.`,
    `Total sales: ${sales}`,
    `Your earning: ${inr(row.earning)} (${share})`,
    "",
    "This is only for your classrooms. The earning is the share the superadmin set for you.",
    "",
    `Open your admin desk: ${publicOrigin()}/admin.html`,
    "",
    "Warm regards,",
    "The Bizgarh desk"
  ].join("\n");
}

async function sendRow(row) {
  const sales = Number(row.sales || 0);
  await sendSmtp({
    to: row.creatorEmail,
    name: row.creatorName,
    subject: `Your day at the desk — ${sales} ${sales === 1 ? "sale" : "sales"} · ${inr(row.earning)}`,
    html: digestHtml(row),
    text: digestText(row)
  });
}

export async function flushCompletedDigests(env) {
  const kv = salesKv(env);
  if (!kv || typeof kv.list !== "function") return { sent: 0 };
  const today = istDay();
  const listed = await kv.list({ prefix: "digest:" });
  const keys = (listed.keys || []).map((k) => k.name).filter((name) => {
    const date = String(name).split(":")[1] || "";
    return date && date < today;
  });
  let sent = 0;
  for (const key of keys) {
    const row = JSON.parse((await kv.get(key)) || "null");
    if (!row || row.sent || !row.sales) continue;
    try {
      await sendRow(row);
      row.sent = true;
      row.sentAt = new Date().toISOString();
      await kv.put(key, JSON.stringify(row));
      sent += 1;
    } catch {
      /* retry on the next request after midnight IST */
    }
  }
  return { sent };
}
