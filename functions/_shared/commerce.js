/**
 * Shared Control commerce ledger — Cloudflare KV (SALES binding).
 * Orders / payments / enrolls written on purchase (welcome digest path)
 * and merged from Control; digests + sale: keys backfill existing PAID sales.
 */

import { salesKv } from "./catalog.js";

export const COMMERCE_KV_KEY = "commerce:v1";

function istDay(d) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(d || new Date());
}

const REHAN_EMAILS = new Set([
  "rrehann3377@gmail.com",
  "rehan@bizgarh.in"
]);

function asArray(raw) {
  return Array.isArray(raw) ? raw : [];
}

function normEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normEmail(email));
}

export function emptyCommerceDoc() {
  return {
    version: 1,
    updatedAt: null,
    updatedBy: "",
    orders: [],
    payments: [],
    enrolls: [],
    refunds: [],
    commissions: [],
    users: [],
    digestSummary: null
  };
}

function sanitizeOrder(row) {
  if (!row || typeof row !== "object" || Array.isArray(row)) return null;
  const email = normEmail(row.email);
  const courseId = String(row.courseId || "").trim().slice(0, 80);
  if (!validEmail(email) || !courseId) return null;
  const id = String(row.id || "").trim().slice(0, 80) || orderIdFor(email, courseId, row.at);
  const amount = Math.max(0, Number(row.amount) || 0);
  const discount = Math.max(0, Number(row.discount) || 0);
  const net = Math.max(0, Number(row.net != null ? row.net : amount - discount) || 0);
  const status = String(row.status || "PAID").toUpperCase() || "PAID";
  return {
    id,
    email,
    name: String(row.name || "").trim().slice(0, 120),
    courseId,
    amount,
    discount,
    tax: Math.max(0, Number(row.tax) || 0),
    net,
    status,
    coupon: String(row.coupon || "").slice(0, 40),
    creatorEmail: normEmail(row.creatorEmail),
    referralCode: String(row.referralCode || "").slice(0, 40),
    creatorId: String(row.creatorId || "").slice(0, 40),
    source: String(row.source || "direct").slice(0, 40),
    tx: String(row.tx || "").slice(0, 60),
    at: String(row.at || new Date().toISOString()),
    attribAt: row.attribAt ? String(row.attribAt) : undefined
  };
}

function sanitizePayment(row) {
  if (!row || typeof row !== "object" || Array.isArray(row)) return null;
  const email = normEmail(row.email);
  if (!validEmail(email)) return null;
  return {
    id: String(row.id || "").trim().slice(0, 80) || ("pay-" + Date.now()),
    orderId: String(row.orderId || "").slice(0, 80),
    email,
    amount: Math.max(0, Number(row.amount) || 0),
    status: String(row.status || "SUCCESS").toUpperCase(),
    method: String(row.method || "upi").slice(0, 20),
    tx: String(row.tx || "").slice(0, 60),
    at: String(row.at || new Date().toISOString())
  };
}

function sanitizeEnroll(row) {
  if (!row || typeof row !== "object" || Array.isArray(row)) return null;
  const email = normEmail(row.email);
  const courseId = String(row.courseId || "").trim().slice(0, 80);
  if (!validEmail(email) || !courseId) return null;
  return {
    name: String(row.name || "").trim().slice(0, 120),
    email,
    courseId,
    at: String(row.at || new Date().toISOString())
  };
}

function sanitizeRefund(row) {
  if (!row || typeof row !== "object" || Array.isArray(row)) return null;
  const email = normEmail(row.email);
  if (!validEmail(email)) return null;
  return {
    id: String(row.id || "").trim().slice(0, 80) || ("rf-" + Date.now()),
    orderId: String(row.orderId || "").slice(0, 80),
    email,
    courseId: String(row.courseId || "").slice(0, 80),
    amount: Math.max(0, Number(row.amount) || 0),
    at: String(row.at || new Date().toISOString()),
    by: normEmail(row.by)
  };
}

function sanitizeCommission(row) {
  if (!row || typeof row !== "object" || Array.isArray(row)) return null;
  const creatorEmail = normEmail(row.creatorEmail);
  if (!validEmail(creatorEmail)) return null;
  return {
    ...row,
    id: String(row.id || "").trim().slice(0, 80) || ("cm-" + Date.now()),
    creatorEmail,
    studentEmail: normEmail(row.studentEmail),
    courseId: String(row.courseId || "").slice(0, 80),
    orderId: String(row.orderId || "").slice(0, 80),
    status: String(row.status || "PENDING").toUpperCase()
  };
}

function sanitizeUser(row) {
  if (!row || typeof row !== "object" || Array.isArray(row)) return null;
  const email = normEmail(row.email);
  if (!validEmail(email)) return null;
  return {
    name: String(row.name || "").trim().slice(0, 120),
    email,
    created: String(row.created || row.at || new Date().toISOString()),
    referredBy: String(row.referredBy || "").slice(0, 40)
  };
}

function orderIdFor(email, courseId, at) {
  const day = String(at || "").slice(0, 10) || istDay();
  const slug = normEmail(email).replace(/[^a-z0-9]/g, "").slice(0, 18);
  return ("ord-kv-" + day + "-" + slug + "-" + courseId).slice(0, 80);
}

function mergeById(existing, incoming, idKey) {
  const map = new Map();
  asArray(existing).forEach((row) => {
    const id = row && row[idKey];
    if (id) map.set(String(id), row);
  });
  asArray(incoming).forEach((row) => {
    const id = row && row[idKey];
    if (!id) return;
    const prev = map.get(String(id));
    map.set(String(id), prev ? { ...prev, ...row } : row);
  });
  return Array.from(map.values());
}

function mergeEnrolls(existing, incoming) {
  const map = new Map();
  const keyOf = (r) => normEmail(r.email) + "|" + String(r.courseId || "");
  asArray(existing).forEach((row) => {
    if (row) map.set(keyOf(row), row);
  });
  asArray(incoming).forEach((row) => {
    if (!row) return;
    const k = keyOf(row);
    const prev = map.get(k);
    map.set(k, prev ? { ...prev, ...row } : row);
  });
  return Array.from(map.values());
}

function mergeUsers(existing, incoming) {
  const map = new Map();
  asArray(existing).forEach((row) => {
    if (row?.email) map.set(normEmail(row.email), row);
  });
  asArray(incoming).forEach((row) => {
    if (!row?.email) return;
    const k = normEmail(row.email);
    const prev = map.get(k);
    map.set(k, prev ? { ...prev, ...row } : row);
  });
  return Array.from(map.values());
}

export function normalizeCommerceDoc(body, actorEmail) {
  const src = body && typeof body === "object" ? body : {};
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    updatedBy: normEmail(actorEmail),
    orders: asArray(src.orders).map(sanitizeOrder).filter(Boolean),
    payments: asArray(src.payments).map(sanitizePayment).filter(Boolean),
    enrolls: asArray(src.enrolls).map(sanitizeEnroll).filter(Boolean),
    refunds: asArray(src.refunds).map(sanitizeRefund).filter(Boolean),
    commissions: asArray(src.commissions).map(sanitizeCommission).filter(Boolean),
    users: asArray(src.users).map(sanitizeUser).filter(Boolean),
    digestSummary: src.digestSummary && typeof src.digestSummary === "object" ? src.digestSummary : null
  };
}

export function mergeCommerceDocs(base, incoming, actorEmail) {
  const a = base && typeof base === "object" ? base : emptyCommerceDoc();
  const b = incoming && typeof incoming === "object" ? incoming : {};
  return normalizeCommerceDoc({
    orders: mergeById(a.orders, b.orders, "id"),
    payments: mergeById(a.payments, b.payments, "id"),
    enrolls: mergeEnrolls(a.enrolls, b.enrolls),
    refunds: mergeById(a.refunds, b.refunds, "id"),
    commissions: mergeById(a.commissions, b.commissions, "id"),
    users: mergeUsers(a.users, b.users),
    digestSummary: b.digestSummary || a.digestSummary || null
  }, actorEmail);
}

export async function readCommerceDoc(env) {
  const kv = salesKv(env);
  if (!kv) return { ok: false, missing: "kv", doc: emptyCommerceDoc() };
  try {
    const raw = await kv.get(COMMERCE_KV_KEY);
    if (!raw) return { ok: true, missing: "empty", doc: emptyCommerceDoc() };
    const parsed = JSON.parse(raw);
    const doc = normalizeCommerceDoc(parsed, parsed?.updatedBy || "");
    if (parsed?.updatedAt) doc.updatedAt = parsed.updatedAt;
    if (parsed?.updatedBy) doc.updatedBy = String(parsed.updatedBy);
    if (parsed?.digestSummary) doc.digestSummary = parsed.digestSummary;
    return { ok: true, missing: null, doc };
  } catch (err) {
    return { ok: false, missing: "parse", error: String(err?.message || err), doc: emptyCommerceDoc() };
  }
}

export async function writeCommerceDoc(env, body, actorEmail) {
  const kv = salesKv(env);
  if (!kv) {
    const err = new Error("SALES KV binding missing");
    err.status = 503;
    err.code = "kv_missing";
    throw err;
  }
  const doc = normalizeCommerceDoc(body, actorEmail);
  const payload = JSON.stringify(doc);
  if (payload.length > 8 * 1024 * 1024) {
    const err = new Error("Commerce payload too large");
    err.status = 413;
    err.code = "payload_too_large";
    throw err;
  }
  await kv.put(COMMERCE_KV_KEY, payload);
  return doc;
}

export async function mergeWriteCommerceDoc(env, body, actorEmail) {
  const { doc: current } = await readCommerceDoc(env);
  const merged = mergeCommerceDocs(current, body, actorEmail);
  return writeCommerceDoc(env, merged, actorEmail);
}

/** Append one PAID sale from welcome / digest path (server-trusted). */
export async function appendCommerceSale(env, raw) {
  const kv = salesKv(env);
  if (!kv) return null;
  const creatorEmail = normEmail(raw.creatorEmail);
  const studentEmail = normEmail(raw.studentEmail);
  const courseId = String(raw.courseId || "").trim().slice(0, 80);
  const amount = Math.max(0, Number(raw.amount) || 0);
  if (!validEmail(studentEmail) || !courseId) return null;
  const at = String(raw.at || new Date().toISOString());
  const day = String(at).slice(0, 10) || istDay();
  const id = orderIdFor(studentEmail, courseId, day);
  const tx = String(raw.tx || ("TXN-KV-" + day.replace(/-/g, "") + "-" + courseId)).slice(0, 60);
  const order = sanitizeOrder({
    id,
    email: studentEmail,
    name: String(raw.studentName || raw.name || "").trim(),
    courseId,
    amount,
    discount: 0,
    tax: 0,
    net: amount,
    status: "PAID",
    creatorEmail,
    referralCode: String(raw.referralCode || ""),
    creatorId: String(raw.creatorId || ""),
    source: String(raw.source || (creatorEmail ? "course_owner" : "welcome")),
    tx,
    at
  });
  const payment = sanitizePayment({
    id: "pay-" + id,
    orderId: id,
    email: studentEmail,
    amount,
    status: "SUCCESS",
    method: "upi",
    tx,
    at
  });
  const enroll = sanitizeEnroll({
    name: order.name,
    email: studentEmail,
    courseId,
    at
  });
  const user = sanitizeUser({
    name: order.name,
    email: studentEmail,
    created: at
  });
  return mergeWriteCommerceDoc(env, {
    orders: [order],
    payments: [payment],
    enrolls: [enroll],
    users: [user]
  }, creatorEmail || "welcome@bizgarh.com");
}

function isoFromIstDay(ymd, hour) {
  const h = String(Number(hour) || 12).padStart(2, "0");
  const ms = Date.parse(String(ymd || "") + "T" + h + ":00:00+05:30");
  if (!Number.isFinite(ms)) return new Date().toISOString();
  return new Date(ms).toISOString();
}

async function listAllKeys(kv, prefix) {
  const out = [];
  let cursor;
  do {
    const listed = await kv.list({ prefix, cursor });
    (listed.keys || []).forEach((k) => out.push(k.name));
    cursor = listed.list_complete ? undefined : listed.cursor;
  } while (cursor);
  return out;
}

/**
 * Import PAID sales from digest:/sale: KV keys into the commerce ledger.
 * Only materializes student-level rows when a matching sale: key exists
 * (real student email). Digest aggregates are always returned in digestSummary.
 */
export async function importDigestsIntoCommerce(env, opts) {
  const kv = salesKv(env);
  if (!kv || typeof kv.list !== "function") {
    return { imported: 0, digestSummary: null, doc: null };
  }
  const { doc: current } = await readCommerceDoc(env);
  const digestKeys = await listAllKeys(kv, "digest:");
  const saleKeys = await listAllKeys(kv, "sale:");

  // sale:YYYY-MM-DD:student@mail:courseId
  const salesByDateCourse = new Map();
  saleKeys.forEach((name) => {
    const parts = String(name).split(":");
    if (parts.length < 4) return;
    const date = parts[1];
    const courseId = parts[parts.length - 1];
    const studentEmail = parts.slice(2, -1).join(":");
    if (!date || !courseId || !validEmail(studentEmail)) return;
    const k = date + "|" + courseId;
    if (!salesByDateCourse.has(k)) salesByDateCourse.set(k, []);
    salesByDateCourse.get(k).push(normEmail(studentEmail));
  });

  const creators = {};
  const newOrders = [];
  const newPayments = [];
  const newEnrolls = [];
  const newUsers = [];
  let imported = 0;

  for (const key of digestKeys) {
    let row;
    try {
      row = JSON.parse((await kv.get(key)) || "null");
    } catch {
      continue;
    }
    if (!row || !Number(row.sales)) continue;
    const creatorEmail = normEmail(row.creatorEmail);
    if (!validEmail(creatorEmail)) continue;
    const date = String(row.date || key.split(":")[1] || "");
    if (!creators[creatorEmail]) {
      creators[creatorEmail] = {
        sales: 0,
        gross: 0,
        earning: 0,
        days: [],
        courses: {},
        isRehan: REHAN_EMAILS.has(creatorEmail)
      };
    }
    const csum = creators[creatorEmail];
    csum.sales += Number(row.sales) || 0;
    csum.gross += Number(row.gross) || 0;
    csum.earning += Number(row.earning) || 0;
    csum.days.push({
      date,
      sales: Number(row.sales) || 0,
      gross: Number(row.gross) || 0,
      earning: Number(row.earning) || 0,
      courses: row.courses || {}
    });
    Object.entries(row.courses || {}).forEach(([courseId, info]) => {
      if (!csum.courses[courseId]) csum.courses[courseId] = { title: info?.title || courseId, sales: 0, earning: 0 };
      csum.courses[courseId].sales += Number(info?.sales) || 0;
      csum.courses[courseId].earning += Number(info?.earning) || 0;
      csum.courses[courseId].title = info?.title || csum.courses[courseId].title;

      const saleList = salesByDateCourse.get(date + "|" + courseId) || [];
      const perSale = Number(row.sales) > 0
        ? Math.round((Number(row.gross) || 0) / Number(row.sales))
        : 0;
      const courseSales = Number(info?.sales) || 0;
      // Prefer per-course share of gross when possible.
      const courseGross = courseSales > 0 && Number(row.sales) > 0
        ? Math.round((Number(row.gross) || 0) * (courseSales / Number(row.sales)))
        : perSale * courseSales;
      const unit = courseSales > 0 ? Math.round(courseGross / courseSales) : perSale;

      saleList.slice(0, courseSales || saleList.length).forEach((studentEmail, idx) => {
        const at = isoFromIstDay(date, 10 + (idx % 8));
        const id = orderIdFor(studentEmail, courseId, date);
        if (asArray(current.orders).some((o) => o.id === id || (o.email === studentEmail && o.courseId === courseId && String(o.status || "").toUpperCase() !== "REFUNDED"))) {
          return;
        }
        if (newOrders.some((o) => o.id === id || (o.email === studentEmail && o.courseId === courseId))) return;
        const amount = unit || perSale;
        const order = sanitizeOrder({
          id,
          email: studentEmail,
          name: "",
          courseId,
          amount,
          net: amount,
          status: "PAID",
          creatorEmail,
          source: "digest_import",
          tx: ("TXN-DG-" + date.replace(/-/g, "") + "-" + String(idx + 1)).slice(0, 60),
          at
        });
        if (!order) return;
        newOrders.push(order);
        newPayments.push(sanitizePayment({
          id: "pay-" + id,
          orderId: id,
          email: studentEmail,
          amount,
          status: "SUCCESS",
          method: "upi",
          tx: order.tx,
          at
        }));
        newEnrolls.push(sanitizeEnroll({ email: studentEmail, courseId, at }));
        newUsers.push(sanitizeUser({ email: studentEmail, created: at }));
        imported += 1;
      });
    });
  }

  const rehan = Object.entries(creators)
    .filter(([email, row]) => row.isRehan || REHAN_EMAILS.has(email))
    .reduce((acc, [, row]) => ({
      sales: acc.sales + row.sales,
      gross: acc.gross + row.gross,
      earning: acc.earning + row.earning
    }), { sales: 0, gross: 0, earning: 0 });

  const allCreators = Object.values(creators).reduce((acc, row) => ({
    sales: acc.sales + (Number(row.sales) || 0),
    gross: acc.gross + (Number(row.gross) || 0),
    earning: acc.earning + (Number(row.earning) || 0),
    count: acc.count + 1
  }), { sales: 0, gross: 0, earning: 0, count: 0 });

  const digestSummary = {
    scannedAt: new Date().toISOString(),
    digestKeyCount: digestKeys.length,
    saleKeyCount: saleKeys.length,
    // Per-creator breakdown (every sub-admin / creator with digests).
    creators,
    creatorCount: allCreators.count,
    totalSales: allCreators.sales,
    totalGross: allCreators.gross,
    totalEarning: allCreators.earning,
    // Backward-compatible Rehan rollup (also in creators[rrehann3377@gmail.com]).
    rehanSales: rehan.sales,
    rehanGross: rehan.gross,
    rehanEarning: rehan.earning,
    imported
  };

  let doc = current;
  if (imported > 0 || opts?.persistSummary) {
    doc = await mergeWriteCommerceDoc(env, {
      orders: newOrders,
      payments: newPayments.filter(Boolean),
      enrolls: newEnrolls.filter(Boolean),
      users: newUsers.filter(Boolean),
      digestSummary
    }, "digest-import@bizgarh.com");
  } else {
    doc = { ...current, digestSummary };
  }

  return { imported, digestSummary, doc };
}
