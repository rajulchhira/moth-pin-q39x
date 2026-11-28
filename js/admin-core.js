/* Bizgarh control plane — RBAC, commerce, CRM, audit.
   Uses existing localStorage tables. Student site stays unchanged. */

const ORDER_KEY = "tradeshalaOrders";
const PAYMENT_KEY = "tradeshalaPayments";
const REFUND_KEY = "tradeshalaRefunds";
const COUPON_KEY = "tradeshalaCoupons";
const LEAD_KEY = "tradeshalaLeads";
const TICKET_KEY = "tradeshalaTickets";
const NOTIF_KEY = "tradeshalaNotifs";
const AUDIT_KEY = "tradeshalaAudit";
const SESSION_KEY = "tradeshalaStaffSessions";
const CLICK_KEY = "tradeshalaRefClicks";
const COMMISSION_KEY = "tradeshalaCommissions";
const ATTRIB_KEY = "tradeshalaAttribution";
const LOGIN_FAIL_KEY = "tradeshalaStaffLoginFails";

const ADMIN_MODULES = {
  students: ["view", "create", "edit", "delete", "export"],
  leads: ["view", "create", "edit", "delete", "assign"],
  courses: ["view", "create", "edit", "delete", "approve"],
  enrollments: ["view", "create", "edit", "delete"],
  orders: ["view", "edit", "export"],
  payments: ["view", "export"],
  refunds: ["view", "approve"],
  coupons: ["view", "create", "edit", "delete"],
  support: ["view", "create", "edit"],
  notifications: ["view", "create"],
  analytics: ["view", "export"],
  creator: ["view", "edit"],
  commission: ["view", "approve", "edit"],
  payouts: ["view", "approve", "create"],
  content: ["view", "create", "edit", "delete"],
  security: ["view", "edit"],
  settings: ["view", "edit"],
  classroom: ["view", "create", "edit"],
  live: ["view", "create", "edit", "delete"],
  community: ["view", "create", "edit", "delete"],
  staff: ["view", "create", "edit", "delete"]
};

const CREATOR_DEFAULT_PERMS = {
  students: ["view"],
  leads: ["view", "edit"],
  courses: ["view", "edit"],
  enrollments: ["view"],
  orders: ["view"],
  payments: ["view"],
  refunds: ["view"],
  support: ["view", "edit"],
  analytics: ["view"],
  creator: ["view"],
  commission: ["view"],
  payouts: ["view"],
  classroom: ["view", "create", "edit"],
  live: ["view", "create", "edit"],
  community: ["view", "create", "edit"],
  content: ["view", "edit"]
};

function storeList(key) { return readList(key); }
function saveStore(key, list) { writeList(key, list); }
function uid(prefix) { return prefix + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function AdminCore() {}

AdminCore.now = () => new Date().toISOString();
AdminCore.inr = (n) => "₹" + Math.round(Number(n || 0)).toLocaleString("en-IN");
AdminCore.device = () => navigator.userAgent.slice(0, 72);

function readStaffSessionRaw() {
  if (typeof getStaffSession === "function") return getStaffSession();
  try { return JSON.parse(localStorage.getItem("tradeshalaStaffSession") || "null"); } catch { return null; }
}

AdminCore.session = () => {
  const raw = readStaffSessionRaw();
  if (!raw || !raw.email) return null;
  const keepOwner = raw.role === "owner" || raw.role === "superadmin" || raw.email === "admin@bizgarh.in";
  const row = AdminCore.staffRow(raw.email);
  if (!row) {
    if (keepOwner) return { ...raw, password: undefined };
    return null;
  }
  const staff = AdminCore.normalizeStaff(row);
  if (staff.status === "suspended" || staff.status === "inactive") {
    if (keepOwner || staff.role === "owner" || staff.role === "superadmin") {
      return { ...staff, status: "active", password: undefined };
    }
    if (typeof clearStaffSession === "function") clearStaffSession();
    return null;
  }
  return { ...staff, password: undefined };
};
AdminCore.isOwner = () => {
  const s = AdminCore.session();
  return s && (s.role === "owner" || s.role === "superadmin" || isSuperAdminEmail(s.email));
};
AdminCore.isSuperAdmin = () => {
  const s = AdminCore.session();
  return s && (s.role === "superadmin" || isSuperAdminEmail(s.email));
};

AdminCore.brandEmail = (email) => String(email || "").replace(/@tradeshala\.in$/i, "@bizgarh.in");

/** Rehan Khan — same staff row as /control KV (courses, students, referral). */
const REHAN_CANONICAL_EMAIL = "rrehann3377@gmail.com";
const REHAN_CRM_PASSWORD = "Rehan8055";
/** Only CRM login ID allowed for Rehan (aliases blocked for security). */
const REHAN_CRM_LOGIN_ID = "rehan@bizgarh.in";
const REHAN_FACE_KEY = "rehan-khan";
const REHAN_STOCK_PHOTO = "/img/instructors/rehan-khan.jpg?v=desk218";
const REHAN_BIO_FALLBACK = "Rehan Khan is a Stock Market Instructor with 8+ years of experience in Forex and Indian Financial Markets. He focuses on educating aspiring traders and investors through practical market knowledge, trading concepts, and structured learning.";
const REHAN_CRM_PW_FLAG = "crmRehanPwOk";

AdminCore.resolveStaffLoginId = (raw) => {
  const v = String(raw || "").trim().toLowerCase();
  if (!v) return "";
  // Map the single allowed CRM ID → live admin staff email. No short/gmail aliases.
  if (v === REHAN_CRM_LOGIN_ID) return REHAN_CANONICAL_EMAIL;
  return AdminCore.brandEmail(v);
};

AdminCore.isRehanStaffEmail = (email) => {
  const e = AdminCore.brandEmail(email).toLowerCase();
  return e === REHAN_CANONICAL_EMAIL || e === REHAN_CRM_LOGIN_ID;
};

/** Creator CRM only: reject Rehan aliases / canonical gmail; allow `rehan@bizgarh.in`. */
AdminCore.isRehanCrmLoginAllowed = (raw) => {
  const v = String(raw || "").trim().toLowerCase();
  if (!v) return true;
  if (v === REHAN_CRM_LOGIN_ID) return true;
  if (v === REHAN_CANONICAL_EMAIL || v === "rehan" || v === "rehan.khan") return false;
  return true;
};

AdminCore.hasRehanCrmPasswordOk = () => {
  try { return sessionStorage.getItem(REHAN_CRM_PW_FLAG) === "1"; } catch { return false; }
};
AdminCore.markRehanCrmPasswordOk = () => {
  try { sessionStorage.setItem(REHAN_CRM_PW_FLAG, "1"); } catch { /* ignore */ }
};
AdminCore.clearRehanCrmPasswordOk = () => {
  try { sessionStorage.removeItem(REHAN_CRM_PW_FLAG); } catch { /* ignore */ }
};

AdminCore.pickHostedPhoto = (raw) => {
  const p = String(raw || "").trim();
  if (!p) return "";
  // KV drops data: photos over 200 KB; keep under-budget inline DPs so Save+hydrate
  // does not wipe a successfully persisted sub-admin / Rehan DP back to stock.
  if (p.startsWith("data:") && p.length > 200 * 1024) return "";
  return p;
};

/**
 * Seeded MENTORS[] used to auto-create firstname@bizgarh.in staff rows.
 * Those fake Sub-admins must never reappear after remove until a human adds them.
 * Keep Rehan / owner / supers — never treat them as demo mentor seeds.
 */
const DEMO_MENTOR_STAFF_EMAILS = new Set([
  "aarav@bizgarh.in",
  "neha@bizgarh.in",
  "vikram@bizgarh.in",
  "ananya@bizgarh.in",
  "kabir@bizgarh.in",
  "rohan@bizgarh.in",
  "priya@bizgarh.in",
  "meera@bizgarh.in"
]);

AdminCore.demoMentorStaffEmails = () => {
  const out = new Set(DEMO_MENTOR_STAFF_EMAILS);
  if (typeof MENTORS !== "undefined" && Array.isArray(MENTORS)) {
    MENTORS.forEach((m) => {
      const first = String(m?.name || "").trim().split(/\s+/)[0];
      if (!first) return;
      out.add(first.toLowerCase() + "@bizgarh.in");
    });
  }
  return out;
};

AdminCore.isDemoMentorStaffEmail = (email) => {
  const e = AdminCore.brandEmail(email).toLowerCase();
  if (!e || AdminCore.isRehanStaffEmail(e)) return false;
  if (e === "admin@bizgarh.in") return false;
  if (typeof isSuperAdminEmail === "function" && isSuperAdminEmail(e)) return false;
  return AdminCore.demoMentorStaffEmails().has(e);
};

/** Seeded learner emails used by Control/LMS/public demo fills — never count in live KPIs. */
const DEMO_LEARNER_EMAILS = new Set([
  "riya@gmail.com", "omkar@gmail.com", "pooja@gmail.com", "sahil@gmail.com",
  "dev@gmail.com", "mehul@gmail.com", "ananya.b@gmail.com", "kabir.s@gmail.com",
  "nisha.b@gmail.com", "vikram.g@gmail.com", "ankit.rao@gmail.com", "sneha.p@gmail.com",
  "karan.m@gmail.com", "divya.i@gmail.com", "ritesh@gmail.com", "kavya@gmail.com",
  "sneha@gmail.com", "aditya@gmail.com", "harsh@gmail.com", "isha@gmail.com",
  "rahulm@gmail.com", "tanvi@gmail.com"
]);

AdminCore.TZ = "Asia/Kolkata";

AdminCore.isDemoLearnerEmail = (email) => DEMO_LEARNER_EMAILS.has(String(email || "").trim().toLowerCase());

AdminCore.isDemoCommerceRecord = (row) => {
  if (!row || typeof row !== "object") return false;
  if (row.demo === true || row.sample === true) return true;
  if (AdminCore.isDemoLearnerEmail(row.email || row.studentEmail || row.student)) return true;
  const id = String(row.id || row.orderId || "");
  const tx = String(row.tx || row.transactionId || "");
  if (/^ord-demo/i.test(id) || /^pay-ord-demo/i.test(id) || /^out-/i.test(id)) return true;
  if (/^TXNDEMO/i.test(tx) || /^rf-demo/i.test(id) || /^crm-st-/i.test(id)) return true;
  if (/^ld-demo/i.test(id) || String(row.code || "").toUpperCase() === "BG-CLASS1" && row.demo) return true;
  return false;
};

/** Successful purchase only — never FAILED / CANCELLED / UNPAID / PENDING / REFUNDED. */
AdminCore.isPaidOrder = (o) => {
  if (!o || AdminCore.isDemoCommerceRecord(o)) return false;
  const s = String(o.status || "").toUpperCase();
  return s === "PAID" || s === "SUCCESS" || s === "CAPTURED";
};

AdminCore.liveOrders = () => AdminCore.orders().filter((o) => !AdminCore.isDemoCommerceRecord(o));
AdminCore.paidOrders = () => AdminCore.liveOrders().filter(AdminCore.isPaidOrder);

/**
 * One-shot purge of known demo commerce so Dashboard/Analytics never show sample fill.
 * Does not invent replacements — empty store stays empty (0 / empty states).
 */
AdminCore.purgeDemoCommerce = () => {
  try {
    if (localStorage.getItem("controlDemoCommercePurgedV1") === "1") return { changed: false };
  } catch { /* ignore */ }

  let changed = false;
  const drop = (key, pred) => {
    try {
      const list = storeList(key);
      const next = list.filter((row) => !pred(row));
      if (next.length !== list.length) {
        saveStore(key, next);
        changed = true;
      }
    } catch { /* ignore */ }
  };

  const isDemoEmail = (row) => AdminCore.isDemoLearnerEmail(row?.email || row?.studentEmail);
  const isDemoRow = (row) => AdminCore.isDemoCommerceRecord(row) || isDemoEmail(row);

  try {
    if (typeof USERS_KEY !== "undefined" && typeof readList === "function" && typeof writeList === "function") {
      const users = readList(USERS_KEY);
      const next = users.filter((u) => !AdminCore.isDemoLearnerEmail(u.email));
      if (next.length !== users.length) { writeList(USERS_KEY, next); changed = true; }
    }
  } catch { /* ignore */ }
  try {
    if (typeof ALL_ENROLL_KEY !== "undefined" && typeof readList === "function" && typeof writeList === "function") {
      const enrolls = readList(ALL_ENROLL_KEY);
      const next = enrolls.filter((e) => !AdminCore.isDemoLearnerEmail(e.email));
      if (next.length !== enrolls.length) { writeList(ALL_ENROLL_KEY, next); changed = true; }
    }
  } catch { /* ignore */ }

  drop(ORDER_KEY, isDemoRow);
  drop(PAYMENT_KEY, isDemoRow);
  drop(REFUND_KEY, isDemoRow);
  drop(COMMISSION_KEY, isDemoRow);
  drop(LEAD_KEY, isDemoRow);
  drop(TICKET_KEY, isDemoRow);
  drop(ATTRIB_KEY, isDemoRow);
  try {
    if (typeof REFERRAL_KEY !== "undefined") {
      const refs = typeof referrals === "function" ? referrals() : storeList(REFERRAL_KEY);
      const next = refs.filter((r) => !isDemoRow(r) && !/^rf-demo/i.test(String(r.id || "")));
      if (next.length !== refs.length && typeof writeList === "function") {
        writeList(REFERRAL_KEY, next);
        changed = true;
      }
    }
  } catch { /* ignore */ }
  try {
    if (typeof PAYOUT_KEY !== "undefined" && typeof payouts === "function" && typeof writeList === "function") {
      const list = payouts();
      const next = list.filter((p) => !AdminCore.isDemoLearnerEmail(p.email) && !String(p.note || "").includes("demo"));
      if (next.length !== list.length) { writeList(PAYOUT_KEY, next); changed = true; }
    }
  } catch { /* ignore */ }

  try {
    localStorage.removeItem("tradeshalaAnalyticsV2");
    localStorage.removeItem("tradeshalaAdminSeeded");
    localStorage.setItem("controlDemoCommercePurgedV1", "1");
    // Prevent public/LMS demo purchase seeds from re-filling metrics on this browser.
    localStorage.setItem("tradeshalaPublicPurchaseSeed", "1");
    localStorage.setItem("tradeshalaLmsSeeded", "1");
  } catch { /* ignore */ }

  return { changed };
};

/**
 * Drop seeded mentor Sub-admins from local staff. Optionally push cleaned roster to KV.
 * Returns { changed, removed }.
 */
AdminCore.purgeDemoMentorStaff = (opts) => {
  const push = !opts || opts.push !== false;
  if (typeof staffList !== "function" || typeof writeList !== "function") {
    return { changed: false, removed: [] };
  }
  const before = staffList();
  const removed = [];
  const next = before.filter((s) => {
    const mail = AdminCore.brandEmail(s?.email).toLowerCase();
    if (!AdminCore.isDemoMentorStaffEmail(mail)) return true;
    removed.push(mail);
    return false;
  });
  if (!removed.length) return { changed: false, removed: [] };
  writeList(STAFF_KEY, next);
  if (push) {
    if (typeof scheduleStaffPush === "function") scheduleStaffPush();
    else if (typeof pushStaffRemote === "function") {
      try { pushStaffRemote({ silent: true }); } catch { /* ignore */ }
    }
  }
  return { changed: true, removed };
};

/**
 * Seed / refresh Rehan as creator staff using the live admin email so CRM
 * scopes match /control staff + course ownership (Slingshot → Rehan Khan).
 */
AdminCore.ensureRehanCreator = () => {
  if (typeof staffList !== "function" || typeof writeList !== "function") return null;
  const list = staffList().map((s) => ({ ...s }));
  const mail = REHAN_CANONICAL_EMAIL;
  let i = list.findIndex((s) => AdminCore.brandEmail(s.email).toLowerCase() === mail);
  const remote = (typeof getRemoteStaff === "function" ? getRemoteStaff() : null);
  const fromRoster = Array.isArray(remote?.roster)
    ? remote.roster.find((r) => String(r?.email || "").toLowerCase() === mail)
    : null;
  const fromStaff = Array.isArray(remote?.staff)
    ? remote.staff.find((r) => String(r?.email || "").toLowerCase() === mail)
    : null;
  const prev = i >= 0 ? list[i] : null;
  const hosted = AdminCore.pickHostedPhoto(fromStaff?.photo)
    || AdminCore.pickHostedPhoto(prev?.photo)
    || AdminCore.pickHostedPhoto(fromRoster?.photo)
    || REHAN_STOCK_PHOTO;
  // Prefer local staff password over remote — change-password writes local first and
  // KV push is async; remote can briefly lag and must not clobber the new password.
  const seededPassword = (prev && prev.password)
    || (fromStaff && fromStaff.password)
    || REHAN_CRM_PASSWORD;
  const next = {
    ...(prev || {}),
    name: (fromStaff && fromStaff.name) || (prev && prev.name) || fromRoster?.name || "Rehan Khan",
    email: mail,
    password: seededPassword,
    role: (fromStaff && fromStaff.role) || (prev && prev.role) || fromRoster?.role || "subadmin",
    status: (fromStaff && fromStaff.status) || (prev && prev.status) || fromRoster?.status || "active",
    creatorEnabled: true,
    googleAuth: false,
    totp: false,
    faceKey: (fromStaff && fromStaff.faceKey) || (prev && prev.faceKey) || REHAN_FACE_KEY,
    referralCode: (fromStaff && fromStaff.referralCode) || (prev && prev.referralCode) || fromRoster?.referralCode || "REHAN-ZMQOH1",
    creatorId: (fromStaff && fromStaff.creatorId) || (prev && prev.creatorId) || fromRoster?.creatorId || "CR-REHAN-ZMQOH1",
    photo: hosted,
    bio: (fromStaff && fromStaff.bio) || (prev && prev.bio) || REHAN_BIO_FALLBACK,
    photoInlineDropped: false,
    contentProduction: AdminCore.normalizeContentProduction(
      (fromStaff && fromStaff.contentProduction) || (prev && prev.contentProduction)
    ),
    created: (prev && prev.created) || (fromStaff && fromStaff.created) || "2026-08-01T10:00:00.000Z",
    permissions: (fromStaff && fromStaff.permissions) || (prev && prev.permissions) || { ...CREATOR_DEFAULT_PERMS }
  };
  if (i >= 0) list[i] = next;
  else list.push(next);
  writeList(STAFF_KEY, list);

  // Mirror into instructor catalog edits (same source of truth as /control Staff face).
  if (typeof applyInstructorEdit === "function") {
    try {
      applyInstructorEdit(next.name, {
        name: next.name,
        email: next.email,
        photo: next.photo,
        bio: next.bio,
        title: "Stock market instructor",
        tag: "Forex & markets",
        hidden: false,
        faceKey: next.faceKey || REHAN_FACE_KEY
      }, next.email);
    } catch { /* ignore */ }
  }

  // Keep course ownership aligned with admin catalog (instructor name + owner email).
  // Live /control assigns Slingshot → Rehan; pin that even before KV catalog hydrates.
  if (typeof courseOwners === "function" && typeof setCourseOwners === "function") {
    const owners = courseOwners();
    let dirty = false;
    if (owners.slingshot !== mail) {
      owners.slingshot = mail;
      dirty = true;
    }
    if (typeof allCourses === "function") {
      allCourses().forEach((c) => {
        if (!c || !c.id) return;
        const isRehanCourse = c.id === "slingshot"
          || c.instructor === "Rehan Khan"
          || String(c.ownerEmail || "").toLowerCase() === mail
          || String(owners[c.id] || "").toLowerCase() === mail;
        if (!isRehanCourse) return;
        if (owners[c.id] !== mail) {
          owners[c.id] = mail;
          dirty = true;
        }
      });
    }
    if (dirty) setCourseOwners(owners);
  }
  // Pin local course edit so CRM cards show Rehan even before / while KV merges.
  // Also keep Hindi as the Original language chip for Slingshot.
  if (typeof courseEdits === "function" && typeof setCourseEdits === "function") {
    try {
      const edits = courseEdits();
      const prev = edits.slingshot || {};
      const langs = Array.isArray(prev.languages) ? prev.languages.map((x) => String(x || "").trim()).filter(Boolean) : [];
      const hindiOriginal = langs.length >= 1 && String(langs[0]).toLowerCase() === "hindi";
      const needHost = prev.instructor !== "Rehan Khan" || String(prev.ownerEmail || "").toLowerCase() !== mail;
      const needLang = !hindiOriginal;
      if (needHost || needLang) {
        edits.slingshot = {
          ...prev,
          instructor: "Rehan Khan",
          ownerEmail: mail,
          languages: ["Hindi", "English"]
        };
        setCourseEdits(edits);
        if (needLang && typeof scheduleCatalogPush === "function") scheduleCatalogPush();
        else if (needLang && typeof pushCatalogRemote === "function") {
          try { pushCatalogRemote({ silent: true }); } catch { /* ignore */ }
        }
      }
    } catch { /* ignore */ }
  }
  return next;
};

AdminCore.staffRow = (email) => {
  if (!email) return null;
  email = AdminCore.resolveStaffLoginId(email);
  email = AdminCore.brandEmail(email);
  const e = String(email).toLowerCase();
  const listed = staffList().find((s) => AdminCore.brandEmail(s.email).toLowerCase() === e) || null;
  if (typeof isSuperAdminEmail === "function" && isSuperAdminEmail(e)) {
    const named = SUPER_ADMINS.find((s) => s.email === e);
    return {
      ...(listed || {}),
      name: listed?.name || named?.name || "Super Admin",
      email: e,
      role: "superadmin",
      status: listed?.status === "suspended" ? "active" : (listed?.status || "active"),
      creatorEnabled: false,
      permissions: {},
      totp: false
    };
  }
  if (e === "admin@bizgarh.in") {
    return listed || { name: "Platform Owner", email: "admin@bizgarh.in", role: "owner", status: "active", creatorEnabled: false };
  }
  return listed;
};

AdminCore.can = (mod, action, staff) => {
  const s = staff || AdminCore.session();
  if (!s) return false;
  if (s.status === "suspended" || s.status === "inactive") return false;
  if (s.role === "owner" || s.role === "superadmin" || (typeof isSuperAdminEmail === "function" && isSuperAdminEmail(s.email))) return true;
  const perms = s.permissions || CREATOR_DEFAULT_PERMS;
  const list = perms[mod] || [];
  return list.includes(action) || list.includes("*");
};

AdminCore.assert = (mod, action) => {
  if (!AdminCore.can(mod, action)) {
    toast("You do not have permission for this action");
    throw new Error("forbidden:" + mod + ":" + action);
  }
};

AdminCore.audit = (action, target, prev, next) => {
  const s = AdminCore.session();
  const list = storeList(AUDIT_KEY);
  list.unshift({
    id: uid("aud"),
    actor: s?.email || "system",
    role: s?.role || "system",
    action,
    target: target || "",
    prev: prev == null ? "" : String(prev).slice(0, 240),
    next: next == null ? "" : String(next).slice(0, 240),
    ip: "local",
    device: AdminCore.device(),
    at: AdminCore.now()
  });
  saveStore(AUDIT_KEY, list.slice(0, 800));
};

AdminCore.saveStaff = (row) => {
  const list = staffList();
  const i = list.findIndex((x) => x.email.toLowerCase() === row.email.toLowerCase());
  if (i >= 0) list[i] = { ...list[i], ...row };
  else list.push(row);
  writeList(STAFF_KEY, list);
  if (typeof scheduleStaffPush === "function") scheduleStaffPush();
  else if (typeof pushStaffRemote === "function") {
    try { pushStaffRemote({ silent: true }); } catch { /* ignore */ }
  }
};

AdminCore.deleteStaff = (email) => {
  AdminCore.assert("staff", "delete");
  const mail = String(email || "").trim().toLowerCase();
  const row = AdminCore.normalizeStaff(AdminCore.staffRow(mail));
  if (!row) return false;
  if (row.role === "owner" || row.role === "superadmin" || (typeof isSuperAdminEmail === "function" && isSuperAdminEmail(mail))) {
    throw new Error("Owner and super admin cannot be deleted");
  }
  const self = AdminCore.session()?.email;
  if (self && String(self).toLowerCase() === mail) {
    throw new Error("You cannot delete your own login");
  }
  writeList(STAFF_KEY, staffList().filter((s) => String(s.email || "").toLowerCase() !== mail));
  if (typeof affiliates === "function" && typeof AFFILIATE_KEY === "string") {
    writeList(AFFILIATE_KEY, affiliates().filter((a) => String(a.email || "").toLowerCase() !== mail));
  }
  if (typeof instructorEdits === "function" && typeof setInstructorEdits === "function") {
    const map = instructorEdits();
    const slug = typeof instructorSlug === "function" ? instructorSlug(row.name) : "";
    const isSeed = typeof MENTORS !== "undefined" && Array.isArray(MENTORS)
      && MENTORS.some((m) => {
        if (!m || !m.name) return false;
        if (m.name === row.name) return true;
        return slug && typeof instructorSlug === "function" && instructorSlug(m.name) === slug;
      });
    // Seed faces live in MENTORS[]; deleting staff must hide them on public, not drop the edit key.
    if (isSeed && slug) {
      Object.keys(map).forEach((k) => {
        const e = map[k];
        if (!e) return;
        const matchMail = String(e.email || "").toLowerCase() === mail;
        const matchSlug = slug && typeof instructorSlug === "function" && instructorSlug(e.name) === slug;
        if (matchMail || matchSlug || k === slug) delete map[k];
      });
      map[slug] = {
        name: row.name,
        email: mail,
        hidden: true,
        photo: row.photo || "",
        bio: row.bio || ""
      };
    } else {
      Object.keys(map).forEach((k) => {
        const e = map[k];
        if (!e) return;
        if (String(e.email || "").toLowerCase() === mail) delete map[k];
        else if (slug && typeof instructorSlug === "function" && instructorSlug(e.name) === slug) delete map[k];
      });
    }
    setInstructorEdits(map);
    if (typeof scheduleInstructorsPush === "function") scheduleInstructorsPush();
    else if (typeof pushInstructorsRemote === "function") {
      try { pushInstructorsRemote({ silent: true }); } catch { /* ignore */ }
    }
  }
  if (typeof AdminCore.forceLogout === "function") AdminCore.forceLogout(mail);
  AdminCore.audit("staff_delete", mail, row.name || "", "");
  if (typeof scheduleStaffPush === "function") scheduleStaffPush();
  else if (typeof pushStaffRemote === "function") {
    try { pushStaffRemote({ silent: true }); } catch { /* ignore */ }
  }
  return true;
};

AdminCore.normalizeStaff = (s) => {
  if (!s) return s;
  const creatorEnabled = s.creatorEnabled != null ? s.creatorEnabled : s.role === "creator";
  const email = AdminCore.brandEmail(s.email);
  let role = s.role;
  if (typeof isSuperAdminEmail === "function" && isSuperAdminEmail(email)) role = "superadmin";
  else if (role === "owner") role = "owner";
  else if (role === "superadmin") role = "superadmin";
  else role = "subadmin";
  return {
    ...s,
    email,
    role,
    status: s.status || "active",
    phone: s.phone || "",
    photo: s.photo || "",
    bio: s.bio || "",
    faceKey: s.faceKey || "",
    creatorEnabled,
    creatorId: s.creatorId || (creatorEnabled ? "CR-" + s.email.slice(0, 4).toUpperCase() : ""),
    referralCode: s.referralCode || "",
    studentScope: s.studentScope || "own",
    commission: s.commission || { type: "percent", newSale: 20, renewal: 10, start: "", end: "" },
    payout: s.payout || { method: "upi", upi: "", account: "" },
    contentProduction: AdminCore.normalizeContentProduction(s.contentProduction),
    permissions: s.permissions || (role === "owner" || role === "superadmin" ? {} : { ...CREATOR_DEFAULT_PERMS }),
    lastLogin: s.lastLogin || "",
    created: s.created || "2026-08-01T10:00:00.000Z",
    totp: !!s.totp,
    googleAuth: !!s.googleAuth || !s.password
  };
};

AdminCore.normalizeContentProduction = (raw) => {
  const r = raw && typeof raw === "object" ? raw : {};
  const n = (v) => Math.max(0, Math.floor(Number(v) || 0));
  return {
    scriptsPending: n(r.scriptsPending),
    inEditing: n(r.inEditing),
    awaitingApproval: n(r.awaitingApproval),
    videosDelivered: n(r.videosDelivered)
  };
};

/** Content Production counts — edited on /control, read-only on Creator CRM. */
AdminCore.creatorProduction = (staffOrEmail) => {
  const email = typeof staffOrEmail === "string"
    ? staffOrEmail
    : (staffOrEmail && staffOrEmail.email) || "";
  const row = email ? AdminCore.staffRow(email) : (staffOrEmail || null);
  return AdminCore.normalizeContentProduction(row && row.contentProduction);
};

AdminCore.setCreatorProduction = (email, production) => {
  const row = AdminCore.staffRow(email);
  if (!row) return null;
  const next = AdminCore.normalizeStaff({
    ...row,
    contentProduction: AdminCore.normalizeContentProduction(production)
  });
  AdminCore.saveStaff(next);
  if (typeof scheduleStaffPush === "function") scheduleStaffPush();
  else if (typeof pushStaffRemote === "function") {
    try { pushStaffRemote({ silent: true }); } catch { /* ignore */ }
  }
  return next;
};

AdminCore.migrateStaff = () => {
  const list = staffList().map((s) => {
    const row = AdminCore.normalizeStaff(s);
    row.email = AdminCore.brandEmail(row.email);
    return row;
  });
  if (!list.some((s) => s.email === "admin@bizgarh.in")) {
    list.unshift({
      name: "Platform Owner",
      email: "admin@bizgarh.in",
      password: "admin123",
      role: "owner",
      status: "active",
      creatorEnabled: false,
      permissions: {},
      totp: false,
      created: "2026-01-01T00:00:00.000Z",
      lastLogin: ""
    });
  } else {
    const owner = list.find((s) => s.email === "admin@bizgarh.in");
    if (owner) owner.totp = false;
  }
  if (typeof SUPER_ADMINS !== "undefined") {
    SUPER_ADMINS.forEach((sa) => {
      const i = list.findIndex((s) => AdminCore.brandEmail(s.email).toLowerCase() === sa.email);
      if (i < 0) {
        list.unshift({
          name: sa.name,
          email: sa.email,
          role: "superadmin",
          status: "active",
          creatorEnabled: false,
          permissions: {},
          totp: false,
          googleAuth: true,
          created: "2026-01-01T00:00:00.000Z",
          lastLogin: ""
        });
      } else {
        list[i].role = "superadmin";
        list[i].status = "active";
        list[i].googleAuth = true;
      }
    });
  }
  list.forEach((s) => {
    if (s.creatorEnabled && !s.referralCode) {
      const aff = typeof affiliates === "function" ? affiliates().find((a) => a.email === s.email) : null;
      s.referralCode = aff?.code || makeCode(s.name.split(" ")[0].slice(0, 5).toUpperCase());
      s.creatorId = s.creatorId || "CR-" + s.referralCode;
    }
  });
  writeList(STAFF_KEY, list);
  // Rehan must stay linked to the live /control staff email + CRM password.
  try { AdminCore.ensureRehanCreator(); } catch { /* ignore */ }
  // Never keep MENTORS[] demo Sub-admins after migrate.
  try { AdminCore.purgeDemoMentorStaff({ push: false }); } catch { /* ignore */ }
};

AdminCore.orders = () => storeList(ORDER_KEY);
AdminCore.payments = () => storeList(PAYMENT_KEY);
AdminCore.refunds = () => storeList(REFUND_KEY);
AdminCore.coupons = () => storeList(COUPON_KEY);
AdminCore.leads = () => storeList(LEAD_KEY);
AdminCore.tickets = () => storeList(TICKET_KEY);
AdminCore.notifs = () => storeList(NOTIF_KEY);
AdminCore.auditLog = () => storeList(AUDIT_KEY);
AdminCore.sessions = () => storeList(SESSION_KEY);
AdminCore.clicks = () => storeList(CLICK_KEY);
AdminCore.attribution = () => storeList(ATTRIB_KEY);
AdminCore.commissions = () => {
  const extra = storeList(COMMISSION_KEY).filter((c) => !AdminCore.isDemoCommerceRecord(c));
  if (extra.length) return extra;
  const refs = typeof referrals === "function" ? referrals() : [];
  return refs
    .filter((r) => !AdminCore.isDemoCommerceRecord(r) && !/^rf-demo/i.test(String(r.id || "")))
    .map((r) => AdminCore.referralToCommission(r));
};

AdminCore.referralToCommission = (r) => ({
  id: r.id || uid("cm"),
  creatorEmail: r.affiliateEmail,
  student: r.name,
  studentEmail: r.email,
  courseId: r.courseId,
  orderId: r.orderId || "",
  transactionId: r.tx || "",
  gross: Number(r.amount || 0),
  discount: 0,
  tax: 0,
  net: Number(r.amount || 0),
  rule: "percent",
  rate: "",
  amount: Number(r.commission || 0),
  refundAdj: 0,
  final: Number(r.commission || 0),
  status: r.status === "paid" ? "PAID" : r.status === "reversed" ? "REVERSED" : "PENDING",
  created: r.at,
  approved: "",
  paid: r.status === "paid" ? r.at : ""
});

AdminCore.courseOwnerStaff = (courseId) => {
  const course = typeof allCourses === "function" ? allCourses().find((c) => c.id === courseId) : null;
  if (!course) return null;
  const ownerEmail = typeof ownerEmailOf === "function" ? ownerEmailOf(course) : "";
  if (ownerEmail) {
    const row = AdminCore.staffRow(ownerEmail) || staffList().find((s) => String(s.email || "").toLowerCase() === String(ownerEmail).toLowerCase());
    if (row) return AdminCore.normalizeStaff(row);
  }
  const byName = staffList().find((s) => {
    const n = AdminCore.normalizeStaff(s);
    return n.name && n.name === course.instructor && (n.creatorEnabled || n.role === "creator" || n.role === "subadmin");
  });
  return byName ? AdminCore.normalizeStaff(byName) : null;
};

AdminCore.syncOrdersFromEnrolls = () => {
  const enrolls = readList(ALL_ENROLL_KEY).filter((e) => !AdminCore.isDemoLearnerEmail(e.email));
  const orders = AdminCore.orders();
  const pays = AdminCore.payments();
  let changed = false;
  enrolls.forEach((e) => {
    if (AdminCore.isDemoCommerceRecord(e)) return;
    const exists = orders.find((o) => o.email === e.email && o.courseId === e.courseId && !AdminCore.isDemoCommerceRecord(o));
    if (exists) return;
    const course = allCourses().find((c) => c.id === e.courseId);
    const price = Number(course?.price || 0);
    const user = readList(USERS_KEY).find((u) => u.email === e.email);
    const referred = staffList().find((s) => s.referralCode && user?.referredBy && s.referralCode.toLowerCase() === String(user.referredBy).toLowerCase());
    const owner = AdminCore.courseOwnerStaff(e.courseId);
    const staff = referred || owner;
    const oid = uid("ord");
    const tx = "TXN" + Math.random().toString(36).slice(2, 10).toUpperCase();
    orders.push({
      id: oid,
      email: e.email,
      name: e.name,
      courseId: e.courseId,
      amount: price,
      discount: 0,
      tax: 0,
      net: price,
      status: "PAID",
      coupon: "",
      creatorEmail: staff?.email || "",
      referralCode: user?.referredBy || staff?.referralCode || "",
      creatorId: staff?.creatorId || "",
      source: referred ? "first_touch" : (owner ? "course_owner" : "direct"),
      tx,
      at: e.at || AdminCore.now()
    });
    pays.push({
      id: uid("pay"),
      orderId: oid,
      email: e.email,
      amount: price,
      status: "SUCCESS",
      method: "upi",
      tx,
      at: e.at || AdminCore.now()
    });
    changed = true;
  });
  if (changed) {
    saveStore(ORDER_KEY, orders);
    saveStore(PAYMENT_KEY, pays);
  }
};

AdminCore.seedControlPlane = () => {
  AdminCore.migrateStaff();
  try { AdminCore.purgeDemoCommerce(); } catch { /* ignore */ }
  // No sample leads / tickets / coupons / notifs — empty stays empty.
  AdminCore.syncOrdersFromEnrolls();
  AdminCore.backfillAttribution();
};

AdminCore.backfillAttribution = () => {
  const users = readList(USERS_KEY);
  const refs = typeof referrals === "function" ? referrals() : [];
  const orders = AdminCore.orders();
  let changed = false;
  orders.forEach((o) => {
    if (AdminCore.isDemoCommerceRecord(o)) return;
    if (o.creatorEmail) return;
    const user = users.find((u) => u.email === o.email);
    const fromUser = staffList().find((s) => s.referralCode && user?.referredBy && s.referralCode.toLowerCase() === String(user.referredBy).toLowerCase());
    const ref = refs.find((r) => r.email === o.email && r.courseId === o.courseId && !AdminCore.isDemoCommerceRecord(r));
    const fromRef = ref ? staffList().find((s) => s.email === ref.affiliateEmail) : null;
    const fromOwner = AdminCore.courseOwnerStaff(o.courseId);
    const creator = fromUser || fromRef || fromOwner;
    if (!creator) return;
    const n = AdminCore.normalizeStaff(creator);
    o.creatorEmail = n.email;
    o.referralCode = n.referralCode || user?.referredBy || ref?.code || "";
    o.creatorId = n.creatorId || "";
    o.source = o.source || (fromUser || fromRef ? "first_touch" : "course_owner");
    changed = true;
  });
  if (changed) saveStore(ORDER_KEY, orders);
  const comm = storeList(COMMISSION_KEY);
  let commChanged = false;
  AdminCore.paidOrders().forEach((o) => {
    if (!o.creatorEmail) return;
    if (comm.some((c) => c.orderId === o.id)) return;
    const orphan = comm.find((c) => !c.orderId && c.studentEmail === o.email && c.courseId === o.courseId && c.creatorEmail === o.creatorEmail);
    if (orphan) {
      orphan.orderId = o.id;
      orphan.transactionId = o.tx;
      commChanged = true;
      return;
    }
    const staff = AdminCore.normalizeStaff(AdminCore.staffRow(o.creatorEmail));
    if (!staff) return;
    const rule = staff.commission || { type: "percent", newSale: 20 };
    const amount = rule.type === "fixed" ? Number(rule.newSale || 0) : Math.round(Number(o.net || 0) * Number(rule.newSale || 20) / 100);
    comm.push({
      id: uid("cm"), creatorEmail: staff.email, student: o.name, studentEmail: o.email, courseId: o.courseId, orderId: o.id, transactionId: o.tx,
      gross: o.amount, discount: o.discount || 0, tax: 0, net: o.net, rule: rule.type || "percent", rate: rule.newSale, amount, refundAdj: 0, final: amount,
      saleKind: "new", status: "PENDING", created: o.at, approved: "", paid: ""
    });
    commChanged = true;
  });
  if (commChanged) saveStore(COMMISSION_KEY, comm);
};

AdminCore.recordSession = (staff, ok) => {
  const list = AdminCore.sessions();
  list.unshift({
    id: uid("ses"),
    email: staff.email,
    ok,
    at: AdminCore.now(),
    device: AdminCore.device(),
    active: !!ok
  });
  saveStore(SESSION_KEY, list.slice(0, 400));
};

AdminCore.loginLocked = () => {
  try {
    const fails = JSON.parse(localStorage.getItem(LOGIN_FAIL_KEY) || "[]");
    const recent = fails.filter((t) => Date.now() - t < 15 * 60 * 1000);
    return recent.length >= 8;
  } catch { return false; }
};
AdminCore.noteLoginFail = () => {
  try {
    const fails = JSON.parse(localStorage.getItem(LOGIN_FAIL_KEY) || "[]");
    fails.push(Date.now());
    localStorage.setItem(LOGIN_FAIL_KEY, JSON.stringify(fails.slice(-20)));
  } catch { /* ignore */ }
};
AdminCore.clearLoginFails = () => localStorage.removeItem(LOGIN_FAIL_KEY);

AdminCore.findCreatorByCode = (code) => {
  if (!code) return null;
  const needle = String(code).trim().toLowerCase();
  const staff = staffList().map(AdminCore.normalizeStaff).find((s) => s.creatorEnabled && s.referralCode && s.referralCode.toLowerCase() === needle);
  if (staff) return staff;
  const aff = typeof affiliates === "function" ? affiliates().find((a) => a.code && a.code.toLowerCase() === needle && a.status === "active") : null;
  if (!aff) return null;
  return AdminCore.normalizeStaff(AdminCore.staffRow(aff.email)) || { email: aff.email, name: aff.name, referralCode: aff.code, creatorEnabled: true, creatorId: "CR-" + aff.code };
};

AdminCore.resolveAttribution = (user, couponCode) => {
  const email = user?.email || "";
  const firstTouch = user?.referredBy || "";
  const coupon = couponCode || "";
  const pending = localStorage.getItem("tradeshalaPendingRef") || "";
  let code = firstTouch || coupon || pending;
  let source = firstTouch ? "first_touch" : (coupon ? "coupon" : (pending ? "last_click" : "direct"));
  if (coupon && AdminCore.findCreatorByCode(coupon) && !firstTouch) {
    code = coupon;
    source = "coupon";
  }
  const creator = AdminCore.findCreatorByCode(code);
  if (!creator) return { creator: null, code: "", source: "direct" };
  if (creator.email && email && creator.email.toLowerCase() === email.toLowerCase()) {
    return { creator: null, code: "", source: "self_referral_blocked" };
  }
  return { creator, code: creator.referralCode || code, source };
};

/** Effective CRM / staff password for a row (Rehan defaults to seed until changed). */
AdminCore.staffPassword = (rowOrEmail) => {
  let row = rowOrEmail;
  if (typeof rowOrEmail === "string") row = AdminCore.staffRow(rowOrEmail);
  const pw = String(row?.password || "");
  if (pw) return pw;
  if (row && AdminCore.isRehanStaffEmail(row.email)) return REHAN_CRM_PASSWORD;
  return "";
};

AdminCore.changeStaffPassword = async (email, currentPassword, newPassword) => {
  const rawId = String(email || "").trim().toLowerCase();
  email = AdminCore.resolveStaffLoginId(email);
  if (email === REHAN_CANONICAL_EMAIL) {
    try { AdminCore.ensureRehanCreator(); } catch { /* ignore */ }
    if (rawId && rawId !== REHAN_CRM_LOGIN_ID && rawId !== REHAN_CANONICAL_EMAIL) {
      return { ok: false, error: "Wrong account" };
    }
  }
  const row = AdminCore.staffRow(email);
  if (!row) return { ok: false, error: "Account not found" };
  const expected = AdminCore.staffPassword(row);
  if (!currentPassword || currentPassword !== expected) {
    return { ok: false, error: "Current password is incorrect" };
  }
  const next = String(newPassword || "");
  if (next.length < 4) return { ok: false, error: "New password must be at least 4 characters" };
  if (next === currentPassword) return { ok: false, error: "New password must be different" };
  AdminCore.saveStaff({
    ...row,
    password: next,
    googleAuth: false
  });
  // Push immediately so other devices / next hydrate see the new password.
  if (typeof pushStaffRemote === "function") {
    try { await pushStaffRemote({ silent: true }); } catch { /* local save still holds */ }
  }
  if (AdminCore.isRehanStaffEmail(email)) AdminCore.markRehanCrmPasswordOk();
  AdminCore.audit("password_change", email, "", "ok");
  return { ok: true };
};

AdminCore.login = (email, password, totp) => {
  const rawId = String(email || "").trim().toLowerCase();
  email = AdminCore.resolveStaffLoginId(email);
  // Ensure Rehan staff row exists before password check (preserves changed CRM password).
  if (email === REHAN_CANONICAL_EMAIL) {
    try { AdminCore.ensureRehanCreator(); } catch { /* ignore */ }
    // CRM must use rehan@bizgarh.in only (aliases already blocked upstream).
    if (rawId && rawId !== REHAN_CRM_LOGIN_ID && rawId !== REHAN_CANONICAL_EMAIL) {
      AdminCore.noteLoginFail();
      AdminCore.clearRehanCrmPasswordOk();
      return { ok: false, error: "Wrong email or password" };
    }
  }
  const ownerOk = email === "admin@bizgarh.in" && password === "admin123";
  if (!ownerOk && AdminCore.loginLocked()) {
    return { ok: false, error: "Too many failed logins. Try again in 15 minutes." };
  }
  const row = AdminCore.staffRow(email) || (ownerOk
    ? { name: "Platform Owner", email, role: "owner", status: "active" }
    : null);
  if (email === REHAN_CANONICAL_EMAIL) {
    // Hard require a password match against the staff store — no empty / Google bypass.
    const expected = AdminCore.staffPassword(row);
    if (!password || !expected || password !== expected) {
      AdminCore.noteLoginFail();
      AdminCore.recordSession({ email }, false);
      AdminCore.clearRehanCrmPasswordOk();
      return { ok: false, error: "Wrong email or password" };
    }
  }
  if (!ownerOk && row && (row.googleAuth || !row.password) && !(row.password && password === row.password)
      && !(AdminCore.isRehanStaffEmail(email) && password === AdminCore.staffPassword(row))) {
    AdminCore.noteLoginFail();
    return { ok: false, error: "This admin signs in with Google on the public site." };
  }
  const passOk = ownerOk
    || (row && row.password && row.password === password)
    || (row && AdminCore.isRehanStaffEmail(email) && password === AdminCore.staffPassword(row));
  if (!row || !passOk) {
    AdminCore.noteLoginFail();
    AdminCore.recordSession({ email }, false);
    return { ok: false, error: "Wrong email or password" };
  }
  const staff = AdminCore.normalizeStaff(row);
  if (staff.status === "suspended" || staff.status === "inactive") {
    return { ok: false, error: "This account is " + staff.status };
  }
  if (!ownerOk && staff.totp && totp !== "000000") return { ok: false, needTotp: true, error: "Enter authenticator code (demo 000000)" };
  AdminCore.clearLoginFails();
  staff.lastLogin = AdminCore.now();
  AdminCore.saveStaff(staff);
  AdminCore.recordSession(staff, true);
  setStaffSession({ ...staff, password: undefined });
  if (email === REHAN_CANONICAL_EMAIL) AdminCore.markRehanCrmPasswordOk();
  AdminCore.audit("login", staff.email, "", "ok");
  return { ok: true, staff };
};

AdminCore.adoptPublicUser = () => {
  const u = typeof getUser === "function" ? getUser() : null;
  if (!u?.email) return false;
  // Never passwordless-adopt Rehan into Creator CRM / staff session.
  if (AdminCore.isRehanStaffEmail(u.email)) return false;
  const role = typeof staffAccessRole === "function" ? staffAccessRole(u.email) : "";
  if (!role) return false;
  let row = AdminCore.staffRow(u.email);
  if (!row) {
    row = {
      name: u.name,
      email: normEmail(u.email),
      role: role === "admin" ? "subadmin" : role,
      status: "active",
      googleAuth: true,
      created: AdminCore.now()
    };
  }
  const staff = AdminCore.normalizeStaff({ ...row, name: row.name || u.name, googleAuth: true });
  if (staff.status === "suspended" || staff.status === "inactive") return false;
  staff.lastLogin = AdminCore.now();
  AdminCore.saveStaff(staff);
  AdminCore.recordSession(staff, true);
  setStaffSession({ ...staff, password: undefined });
  return true;
};

AdminCore.grantGoogleAdmin = (email, name) => {
  if (!AdminCore.isSuperAdmin()) {
    toast("Only a super admin can grant admin access");
    return { ok: false };
  }
  const e = String(email || "").trim().toLowerCase();
  if (!e || !e.includes("@")) {
    toast("Enter a valid Google email");
    return { ok: false };
  }
  if (typeof isSuperAdminEmail === "function" && isSuperAdminEmail(e)) {
    toast("This account is already a super admin");
    return { ok: false };
  }
  const existing = AdminCore.staffRow(e);
  if (existing && (existing.role === "owner" || existing.role === "superadmin")) {
    toast("This account already has full control");
    return { ok: false };
  }
  const perms = {};
  Object.keys(ADMIN_MODULES).forEach((m) => {
    if (m === "staff" || m === "settings") return;
    perms[m] = ADMIN_MODULES[m].slice();
  });
  const row = AdminCore.normalizeStaff({
    ...(existing || {}),
    name: (name || "").trim() || existing?.name || e.split("@")[0],
    email: e,
    role: "subadmin",
    status: "active",
    googleAuth: true,
    totp: false,
    permissions: existing?.permissions || perms,
    created: existing?.created || AdminCore.now()
  });
  AdminCore.saveStaff(row);
  try {
    if (typeof setGrantedAdminEmails === "function") {
      setGrantedAdminEmails(grantedAdminEmails().concat([e]));
    } else {
      const extra = JSON.parse(localStorage.getItem("tradeshalaGrantedAdmins") || "[]");
      if (!extra.map((x) => String(x).toLowerCase()).includes(e)) extra.push(e);
      localStorage.setItem("tradeshalaGrantedAdmins", JSON.stringify(extra));
    }
  } catch { /* ignore */ }
  AdminCore.audit("staff_grant_google", e, existing ? existing.role : "", "subadmin");
  // saveStaff already schedules staff KV push; nudge once more after grantedEmails write.
  if (typeof scheduleStaffPush === "function") scheduleStaffPush();
  toast("Admin access granted. They sign in with Google, then open Admin panel from their name.");
  return { ok: true };
};

AdminCore.logout = () => {
  const s = AdminCore.session();
  if (s) {
    const list = AdminCore.sessions().map((x) => x.email === s.email && x.active ? { ...x, active: false } : x);
    saveStore(SESSION_KEY, list);
    AdminCore.audit("logout", s.email, "", "");
    if (AdminCore.isRehanStaffEmail(s.email)) AdminCore.clearRehanCrmPasswordOk();
  }
  clearStaffSession();
};

AdminCore.forceLogout = (email) => {
  AdminCore.assert("security", "edit");
  const list = AdminCore.sessions().map((x) => x.email === email ? { ...x, active: false } : x);
  saveStore(SESSION_KEY, list);
  const cur = AdminCore.session();
  if (cur?.email === email) clearStaffSession();
  AdminCore.audit("force_logout", email, "active", "logged_out");
};

AdminCore.ownedCourseIds = (staff) => {
  const s = staff || AdminCore.session();
  if (!s) return [];
  return allCourses().filter((c) => ownerEmailOf(c) === s.email || c.instructor === s.name).map((c) => c.id);
};

AdminCore.scope = {
  students(rows) {
    const s = AdminCore.session();
    if (!s || AdminCore.isOwner() || s.studentScope === "all") return rows;
    const mine = new Set(AdminCore.ownedCourseIds(s));
    const referred = new Set(readList(USERS_KEY).filter((u) => u.referredBy && s.referralCode && u.referredBy.toLowerCase() === s.referralCode.toLowerCase()).map((u) => u.email));
    const enrolled = new Set(readList(ALL_ENROLL_KEY).filter((e) => mine.has(e.courseId)).map((e) => e.email));
    return rows.filter((u) => referred.has(u.email) || enrolled.has(u.email));
  },
  enrolls(rows) {
    const s = AdminCore.session();
    if (!s || AdminCore.isOwner() || s.studentScope === "all") return rows;
    const mine = new Set(AdminCore.ownedCourseIds(s));
    return rows.filter((e) => mine.has(e.courseId) || AdminCore.studentIsMine(e.email, s));
  },
  orders(rows) {
    const s = AdminCore.session();
    if (!s || AdminCore.isOwner()) return rows;
    if (s.creatorEnabled && !AdminCore.can("orders", "view")) return [];
    const mine = new Set(AdminCore.ownedCourseIds(s));
    return rows.filter((o) => o.creatorEmail === s.email || mine.has(o.courseId));
  },
  leads(rows) {
    const s = AdminCore.session();
    if (!s || AdminCore.isOwner() || s.studentScope === "all") return rows;
    return rows.filter((l) => l.creatorEmail === s.email);
  },
  tickets(rows) {
    const s = AdminCore.session();
    if (!s || AdminCore.isOwner()) return rows;
    const mine = new Set(AdminCore.ownedCourseIds(s));
    return rows.filter((t) => t.assignee === s.email || mine.has(t.courseId));
  },
  commissions(rows) {
    const s = AdminCore.session();
    if (!s || AdminCore.isOwner()) return rows;
    return rows.filter((c) => c.creatorEmail === s.email);
  },
  refunds(rows) {
    const s = AdminCore.session();
    if (!s || AdminCore.isOwner()) return rows;
    const mine = new Set(AdminCore.scope.orders(AdminCore.orders()).map((o) => o.id));
    return rows.filter((r) => mine.has(r.orderId) || r.email && AdminCore.studentIsMine(r.email, s));
  },
  payments(rows) {
    const s = AdminCore.session();
    if (!s || AdminCore.isOwner()) return rows;
    const mine = new Set(AdminCore.scope.orders(AdminCore.orders()).map((o) => o.id));
    return rows.filter((p) => mine.has(p.orderId));
  }
};

AdminCore.studentIsMine = (email, staff) => {
  const s = staff || AdminCore.session();
  const u = readList(USERS_KEY).find((x) => x.email === email);
  if (s.referralCode && u?.referredBy && u.referredBy.toLowerCase() === s.referralCode.toLowerCase()) return true;
  const mine = new Set(AdminCore.ownedCourseIds(s));
  return readList(ALL_ENROLL_KEY).some((e) => e.email === email && mine.has(e.courseId));
};

AdminCore.guardRecord = (mod, recordEmail, courseId) => {
  if (AdminCore.isOwner()) return true;
  const s = AdminCore.session();
  if (!s) return false;
  if (recordEmail && recordEmail === s.email) return true;
  if (courseId && AdminCore.ownedCourseIds(s).includes(courseId)) return true;
  if (recordEmail && AdminCore.studentIsMine(recordEmail, s)) return true;
  return false;
};

/** Instant bounds for a Control date filter, in Asia/Kolkata calendar days. */
AdminCore.rangeBounds = (range) => {
  const tz = AdminCore.TZ;
  const now = Date.now();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(new Date(now));
  const y = Number(parts.find((p) => p.type === "year")?.value);
  const m = Number(parts.find((p) => p.type === "month")?.value);
  const d = Number(parts.find((p) => p.type === "day")?.value);
  // Approximate IST offset (+05:30) for day start — Bizgarh / Colombo share this offset.
  const istOffsetMs = 5.5 * 3600000;
  const utcMidnightOf = (yy, mm, dd) => Date.UTC(yy, mm - 1, dd) - istOffsetMs;
  const startToday = utcMidnightOf(y, m, d);
  const endExclusive = startToday + 86400000;

  if (!range || range === "all") return { from: 0, to: now };
  if (typeof range === "object" && range.from) {
    const fromParts = String(range.from).split("-").map(Number);
    const toParts = String(range.to || range.from).split("-").map(Number);
    const from = utcMidnightOf(fromParts[0], fromParts[1], fromParts[2]);
    const to = utcMidnightOf(toParts[0], toParts[1], toParts[2]) + 86400000 - 1;
    return { from, to: Math.min(to, now + 86400000) };
  }
  if (range === "today") return { from: startToday, to: Math.max(now, endExclusive - 1) };
  if (range === "month") {
    const from = utcMidnightOf(y, m, 1);
    return { from, to: now };
  }
  const days = { "7d": 7, "30d": 30, "90d": 90, "180d": 180, "365d": 365 }[range];
  if (days) return { from: startToday - (days - 1) * 86400000, to: now };
  return { from: 0, to: now };
};

AdminCore.rangeFilter = (rows, field, range) => {
  if (!range || range === "all") return rows;
  const { from, to } = AdminCore.rangeBounds(range);
  return rows.filter((r) => {
    const t = new Date(r[field] || r.at || r.created).getTime();
    return Number.isFinite(t) && t >= from && t <= to;
  });
};

AdminCore.kpis = (range) => {
  const students = AdminCore.scope.students(readList(USERS_KEY).filter((u) => !AdminCore.isDemoLearnerEmail(u.email)));
  const enrolls = AdminCore.scope.enrolls(readList(ALL_ENROLL_KEY).filter((e) => !AdminCore.isDemoLearnerEmail(e.email)));
  const scopedLive = AdminCore.scope.orders(AdminCore.liveOrders());
  const ordersInRange = AdminCore.rangeFilter(scopedLive, "at", range);
  const paid = ordersInRange.filter(AdminCore.isPaidOrder);
  const allPaid = scopedLive.filter(AdminCore.isPaidOrder);
  const refunds = AdminCore.rangeFilter(
    AdminCore.scope.refunds(AdminCore.refunds().filter((r) => !AdminCore.isDemoCommerceRecord(r))),
    "at",
    range
  );
  const revenue = paid.reduce((s, o) => s + Number(o.net || o.amount || 0), 0);
  const today = AdminCore.rangeFilter(allPaid, "at", "today");
  const month = AdminCore.rangeFilter(allPaid, "at", "month");
  const comm = AdminCore.scope.commissions(AdminCore.commissions()).filter((c) => !AdminCore.isDemoCommerceRecord(c));
  const pendingComm = comm
    .filter((c) => ["PENDING", "APPROVED", "PAYABLE"].includes(String(c.status || "").toUpperCase()))
    .reduce((s, c) => s + Number(c.final || 0), 0);
  const pendingPay = (typeof payouts === "function" ? payouts() : [])
    .filter((p) => String(p.status || "").toLowerCase() === "pending")
    .reduce((s, p) => s + Number(p.amount || 0), 0);
  const creatorRev = allPaid.filter((o) => o.creatorEmail).reduce((s, o) => s + Number(o.net || 0), 0);
  const newStudents = AdminCore.rangeFilter(students, "created", range || "30d");
  const activeCut = Date.now() - 30 * 86400000;
  const active = students.filter((u) => enrolls.some((e) => e.email === u.email && new Date(e.at).getTime() >= activeCut));
  const staffCount = staffList().filter((s) => {
    const n = AdminCore.normalizeStaff(s);
    if (n.role === "owner" || n.role === "superadmin") return false;
    if (AdminCore.isDemoMentorStaffEmail(n.email)) return false;
    return true;
  }).length;
  const tickets = AdminCore.scope.tickets(AdminCore.tickets().filter((t) => !AdminCore.isDemoCommerceRecord(t)))
    .filter((t) => String(t.status || "").toUpperCase() === "OPEN");
  return {
    students: students.length,
    newStudents: newStudents.length,
    active: active.length,
    courses: (AdminCore.isOwner() ? allCourses() : allCourses().filter((c) => ownerEmailOf(c) === AdminCore.session()?.email || c.instructor === AdminCore.session()?.name)).length,
    revenue,
    todayRevenue: today.reduce((s, o) => s + Number(o.net || 0), 0),
    monthRevenue: month.reduce((s, o) => s + Number(o.net || 0), 0),
    orders: paid.length,
    pendingPayments: scopedLive.filter((o) => String(o.status || "").toUpperCase() === "PENDING").length,
    refunds: refunds.length,
    staff: staffCount,
    creatorRevenue: creatorRev,
    pendingCommission: pendingComm,
    pendingPayouts: pendingPay,
    tickets: tickets.length,
    paidAll: allPaid.length,
    refundAll: AdminCore.refunds().filter((r) => !AdminCore.isDemoCommerceRecord(r)).length
  };
};

AdminCore.series = (range) => {
  const bounds = AdminCore.rangeBounds(range);
  const span = Math.max(1, bounds.to - bounds.from);
  const dayMs = 86400000;
  let bucketMs;
  let count;
  const rKey = typeof range === "object" ? "custom" : String(range || "30d");
  if (rKey === "today") {
    bucketMs = 3600000;
    count = 24;
  } else if (rKey === "7d") {
    bucketMs = dayMs;
    count = 7;
  } else if (rKey === "30d") {
    bucketMs = dayMs;
    count = 30;
  } else if (rKey === "90d") {
    bucketMs = 7 * dayMs;
    count = 13;
  } else if (rKey === "180d") {
    bucketMs = 14 * dayMs;
    count = 13;
  } else if (rKey === "365d") {
    bucketMs = 30 * dayMs;
    count = 12;
  } else {
    // custom / fallback — pick day/week/month from span
    if (span <= 2 * dayMs) { bucketMs = 3600000; count = Math.max(1, Math.ceil(span / bucketMs)); }
    else if (span <= 45 * dayMs) { bucketMs = dayMs; count = Math.max(1, Math.ceil(span / bucketMs)); }
    else if (span <= 180 * dayMs) { bucketMs = 7 * dayMs; count = Math.max(1, Math.ceil(span / bucketMs)); }
    else { bucketMs = 30 * dayMs; count = Math.max(1, Math.ceil(span / bucketMs)); }
  }
  count = Math.min(count, 48);

  const enrolls = AdminCore.scope.enrolls(readList(ALL_ENROLL_KEY).filter((e) => !AdminCore.isDemoLearnerEmail(e.email)));
  const orders = AdminCore.scope.orders(AdminCore.paidOrders());
  const students = AdminCore.scope.students(readList(USERS_KEY).filter((u) => !AdminCore.isDemoLearnerEmail(u.email)));
  const comm = AdminCore.scope.commissions(AdminCore.commissions()).filter((c) => !AdminCore.isDemoCommerceRecord(c));

  const endEdge = rKey === "today"
    ? AdminCore.rangeBounds("today").from + 24 * 3600000
    : bounds.to;
  const startEdge = endEdge - count * bucketMs;

  return Array.from({ length: count }, (_, i) => {
    const start = startEdge + i * bucketMs;
    const end = start + bucketMs;
    const labelDate = new Date(start + Math.min(bucketMs / 2, dayMs / 2));
    const label = bucketMs < dayMs
      ? labelDate.toLocaleTimeString("en-IN", { hour: "numeric", timeZone: AdminCore.TZ })
      : labelDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: AdminCore.TZ });
    const inWin = (at) => {
      const t = new Date(at).getTime();
      return Number.isFinite(t) && t >= start && t < end && t >= bounds.from && t <= bounds.to;
    };
    const oSlice = orders.filter((o) => inWin(o.at));
    return {
      label,
      revenue: oSlice.reduce((s, o) => s + Number(o.net || 0), 0),
      orders: oSlice.length,
      students: students.filter((u) => inWin(u.created)).length,
      enrolls: enrolls.filter((e) => inWin(e.at)).length,
      commission: comm.filter((c) => inWin(c.created)).reduce((s, c) => s + Number(c.final || 0), 0)
    };
  });
};

/** Popular courses from successful PAID purchases in range — real titles, counts, revenue. */
AdminCore.popularCourses = (range) => {
  const paid = AdminCore.rangeFilter(AdminCore.scope.orders(AdminCore.paidOrders()), "at", range);
  const by = {};
  paid.forEach((o) => {
    const id = o.courseId || "";
    if (!id) return;
    if (!by[id]) by[id] = { courseId: id, purchases: 0, revenue: 0 };
    by[id].purchases += 1;
    by[id].revenue += Number(o.net || o.amount || 0);
  });
  return Object.values(by)
    .map((row) => {
      const c = typeof allCourses === "function" ? allCourses().find((x) => x.id === row.courseId) : null;
      return {
        courseId: row.courseId,
        label: c?.title || row.courseId,
        purchases: row.purchases,
        revenue: row.revenue,
        v: row.purchases,
        display: `${row.purchases} · ${AdminCore.inr(row.revenue)}`
      };
    })
    .sort((a, b) => b.purchases - a.purchases || b.revenue - a.revenue);
};

function commerceOnEnroll(user, courseId, couponCode) {
  const course = allCourses().find((c) => c.id === courseId);
  if (!course || !user) return;
  if (AdminCore.isDemoLearnerEmail(user.email)) return;
  const orders = storeList(ORDER_KEY);
  if (orders.some((o) => o.email === user.email && o.courseId === courseId && String(o.status || "").toUpperCase() !== "REFUNDED")) return;
  const priorPaid = storeList(ORDER_KEY).some((o) => o.email === user.email && AdminCore.isPaidOrder(o));
  const attr = AdminCore.resolveAttribution(user, couponCode);
  let staff = attr.creator ? AdminCore.normalizeStaff(AdminCore.staffRow(attr.creator.email) || attr.creator) : null;
  let source = attr.source || "direct";
  if (!staff) {
    staff = AdminCore.courseOwnerStaff(courseId);
    if (staff) source = "course_owner";
  }
  const oid = uid("ord");
  const tx = "TXN" + Math.random().toString(36).slice(2, 10).toUpperCase();
  const price = Number(course.price || 0);
  const coupon = (AdminCore.coupons() || []).find((c) => couponCode && c.code === String(couponCode).toUpperCase() && c.active);
  let discount = 0;
  if (coupon) {
    discount = coupon.type === "percent" ? Math.round(price * Number(coupon.value) / 100) : Number(coupon.value || 0);
    coupon.uses = Number(coupon.uses || 0) + 1;
    saveStore(COUPON_KEY, AdminCore.coupons().map((c) => c.id === coupon.id ? coupon : c));
  }
  const net = Math.max(0, price - discount);
  orders.push({
    id: oid, email: user.email, name: user.name, courseId, amount: price, discount, tax: 0, net,
    status: "PAID", coupon: coupon?.code || "", creatorEmail: staff?.email || "", referralCode: attr.code || staff?.referralCode || "",
    creatorId: staff?.creatorId || "", source, attribAt: AdminCore.now(), tx, at: AdminCore.now()
  });
  saveStore(ORDER_KEY, orders);
  const pays = storeList(PAYMENT_KEY);
  pays.push({ id: uid("pay"), orderId: oid, email: user.email, amount: net, status: "SUCCESS", method: "upi", tx, at: AdminCore.now() });
  saveStore(PAYMENT_KEY, pays);
  const attribs = storeList(ATTRIB_KEY);
  attribs.push({
    id: uid("at"), creatorId: staff?.creatorId || "", creatorEmail: staff?.email || "", referralCode: attr.code || staff?.referralCode || "",
    source, attribAt: AdminCore.now(), userId: user.email, orderId: oid, courseId
  });
  saveStore(ATTRIB_KEY, attribs);
  if (staff && (staff.creatorEnabled || staff.referralCode || staff.role === "creator" || staff.role === "subadmin")) {
    const rule = staff.commission || { type: "percent", newSale: 20, renewal: 10 };
    const saleKind = priorPaid ? "renewal" : "new";
    const rate = saleKind === "renewal" ? Number(rule.renewal || 0) : Number(rule.newSale || 20);
    const courseRule = (rule.courses || []).find((x) => x.courseId === courseId);
    const useRate = courseRule ? Number(courseRule.value) : rate;
    const useType = courseRule?.type || rule.type || "percent";
    const amount = useType === "fixed" ? Number(useRate || 0) : Math.round(net * Number(useRate || 0) / 100);
    const startOk = !rule.start || Date.now() >= new Date(rule.start).getTime();
    const endOk = !rule.end || Date.now() <= new Date(rule.end).getTime();
    if (startOk && endOk && amount > 0) {
      const list = storeList(COMMISSION_KEY);
      list.push({
        id: uid("cm"), creatorEmail: staff.email, student: user.name, studentEmail: user.email, courseId, orderId: oid, transactionId: tx,
        gross: price, discount, tax: 0, net, rule: useType, rate: useRate, amount, refundAdj: 0, final: amount,
        saleKind, status: "PENDING", created: AdminCore.now(), approved: "", paid: ""
      });
      saveStore(COMMISSION_KEY, list);
    }
  }
  // Push to shared KV so Control Overview / Analytics update across devices.
  if (typeof scheduleCommercePush === "function") {
    try { scheduleCommercePush(); } catch { /* ignore */ }
  } else if (typeof pushCommerceRemote === "function") {
    try { pushCommerceRemote({ silent: true }); } catch { /* ignore */ }
  }
  // Same-tab Control refresh (storage events only fire cross-tab).
  try {
    window.dispatchEvent(new CustomEvent("bizgarh:commerce", { detail: { courseId, orderId: oid } }));
  } catch { /* ignore */ }
}

AdminCore.refundOrder = (orderId) => {
  AdminCore.assert("refunds", "approve");
  const orders = AdminCore.orders();
  const i = orders.findIndex((o) => o.id === orderId);
  if (i < 0) return;
  const prev = orders[i].status;
  orders[i].status = "REFUNDED";
  saveStore(ORDER_KEY, orders);
  const refunds = AdminCore.refunds();
  refunds.unshift({ id: uid("rf"), orderId, email: orders[i].email, courseId: orders[i].courseId, amount: orders[i].net, at: AdminCore.now(), by: AdminCore.session().email });
  saveStore(REFUND_KEY, refunds);
  const enrolls = readList(ALL_ENROLL_KEY).filter((e) => !(e.email === orders[i].email && e.courseId === orders[i].courseId));
  writeList(ALL_ENROLL_KEY, enrolls);
  const reversed = AdminCore.commissions().filter((c) => c.orderId === orderId);
  const comm = AdminCore.commissions().map((c) => c.orderId === orderId ? { ...c, status: "REVERSED", refundAdj: c.final, final: 0 } : c);
  saveStore(COMMISSION_KEY, comm);
  const reversedIds = reversed.map((c) => c.id);
  const reversedAmt = reversed.reduce((s, c) => s + Number(c.final || c.amount || 0), 0);
  writeList(PAYOUT_KEY, payouts().map((p) => {
    if (p.status === "paid" || p.status === "failed") return p;
    const included = p.commissionIds || [];
    if (!included.length || !included.some((id) => reversedIds.includes(id))) return p;
    return { ...p, status: "pending", amount: Math.max(0, Number(p.amount || 0) - reversedAmt), note: "Adjusted after refund" };
  }));
  AdminCore.audit("refund_order", orderId, prev, "REFUNDED");
  if (typeof scheduleCommercePush === "function") {
    try { scheduleCommercePush(); } catch { /* ignore */ }
  } else if (typeof pushCommerceRemote === "function") {
    try { pushCommerceRemote({ silent: true }); } catch { /* ignore */ }
  }
  try {
    window.dispatchEvent(new CustomEvent("bizgarh:commerce", { detail: { orderId, refund: true } }));
  } catch { /* ignore */ }
};

AdminCore.exportCsv = (rows, fields, name) => {
  const header = fields.map((c) => c.label).join(",");
  const body = rows.map((r) => fields.map((c) => `"${String(c.value(r) ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([header + "\n" + body], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = (name || "export") + ".csv";
  a.click();
};

AdminCore.trackRefClick = (code) => {
  const list = storeList(CLICK_KEY);
  list.push({ code, at: AdminCore.now() });
  saveStore(CLICK_KEY, list.slice(-2000));
};

AdminCore.hostProfile = (email, name) => {
  const mail = String(email || "").toLowerCase();
  const staff = (typeof staffList === "function" ? staffList() : []).map((x) => AdminCore.normalizeStaff(x));
  const sess = AdminCore.session();
  const row = staff.find((s) => String(s.email || "").toLowerCase() === mail)
    || staff.find((s) => s.name && s.name === name)
    || (sess && (sess.email === email || sess.name === name || (!email && !name)) ? sess : null);
  const nm = row?.name || name || sess?.name || "Host";
  const pack = typeof instructorPack === "function"
    ? instructorPack(nm)
    : ((typeof INSTRUCTOR_PACKS !== "undefined" && typeof instructorSlug === "function")
      ? INSTRUCTOR_PACKS[instructorSlug(nm)]
      : null);
  return {
    name: nm,
    email: row?.email || email || sess?.email || "",
    photo: row?.photo || (typeof photoFor === "function" ? photoFor(nm) : ""),
    bio: row?.bio || pack?.bio || ""
  };
};

window.AdminCore = AdminCore;
window.ADMIN_MODULES = ADMIN_MODULES;
window.CREATOR_DEFAULT_PERMS = CREATOR_DEFAULT_PERMS;
window.commerceOnEnroll = commerceOnEnroll;
