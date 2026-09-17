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

AdminCore.staffRow = (email) => {
  if (!email) return null;
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
    permissions: s.permissions || (role === "owner" || role === "superadmin" ? {} : { ...CREATOR_DEFAULT_PERMS }),
    lastLogin: s.lastLogin || "",
    created: s.created || "2026-08-01T10:00:00.000Z",
    totp: !!s.totp,
    googleAuth: !!s.googleAuth || !s.password
  };
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
      totp: true,
      created: "2026-01-01T00:00:00.000Z",
      lastLogin: ""
    });
  } else {
    const owner = list.find((s) => s.email === "admin@bizgarh.in");
    if (owner && owner.totp == null) owner.totp = true;
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
  const extra = storeList(COMMISSION_KEY);
  if (extra.length) return extra;
  return referrals().map((r) => AdminCore.referralToCommission(r));
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

AdminCore.syncOrdersFromEnrolls = () => {
  const enrolls = readList(ALL_ENROLL_KEY);
  const orders = AdminCore.orders();
  const pays = AdminCore.payments();
  let changed = false;
  enrolls.forEach((e) => {
    const exists = orders.find((o) => o.email === e.email && o.courseId === e.courseId);
    if (exists) return;
    const course = allCourses().find((c) => c.id === e.courseId);
    const price = Number(course?.price || 0);
    const user = readList(USERS_KEY).find((u) => u.email === e.email);
    const staff = staffList().find((s) => s.referralCode && user?.referredBy && s.referralCode.toLowerCase() === String(user.referredBy).toLowerCase());
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
      referralCode: user?.referredBy || "",
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
  const users = readList(USERS_KEY);
  let touched = false;
  users.forEach((u) => {
    if (u.email === "ritesh@gmail.com" && !u.referredBy) { u.referredBy = "AARAV20"; u.referredAt = "2026-08-12T10:00:00.000Z"; touched = true; }
    if (u.email === "kavya@gmail.com" && !u.referredBy) { u.referredBy = "NEHA20"; u.referredAt = "2026-09-04T10:00:00.000Z"; touched = true; }
  });
  if (touched) writeList(USERS_KEY, users);
  AdminCore.syncOrdersFromEnrolls();
  AdminCore.backfillAttribution();
  if (!AdminCore.leads().length) {
    saveStore(LEAD_KEY, [
      { id: uid("ld"), name: "Isha Verma", email: "isha@gmail.com", phone: "9876500011", source: "AARAV20", creatorEmail: "aarav@bizgarh.in", status: "NEW", notes: "Asked about breakout classroom.", followUp: "2026-09-16", history: [{ at: AdminCore.now(), note: "Lead captured from referral" }], at: "2026-09-08T09:00:00.000Z" },
      { id: uid("ld"), name: "Rahul Mehta", email: "rahulm@gmail.com", phone: "9822011122", source: "NEHA20", creatorEmail: "neha@bizgarh.in", status: "INTERESTED", notes: "Wants weekly options.", followUp: "2026-09-14", history: [], at: "2026-09-06T11:00:00.000Z" },
      { id: uid("ld"), name: "Tanvi Shah", email: "tanvi@gmail.com", phone: "9811100099", source: "organic", creatorEmail: "", status: "CONTACTED", notes: "", followUp: "", history: [], at: "2026-09-11T08:00:00.000Z" }
    ]);
  }
  if (!AdminCore.tickets().length) {
    saveStore(TICKET_KEY, [
      { id: uid("tk"), title: "Classroom video stuck", body: "Lesson 2 buffers on Chrome.", email: "ritesh@gmail.com", name: "Ritesh Kulkarni", courseId: "breakout", status: "OPEN", assignee: "aarav@bizgarh.in", replies: [{ by: "ritesh@gmail.com", body: "Happens after 1 min.", at: "2026-09-10T10:00:00.000Z" }], at: "2026-09-10T10:00:00.000Z" },
      { id: uid("tk"), title: "Refund request — Mutual Funds", body: "Bought by mistake.", email: "pooja@gmail.com", name: "Pooja Nair", courseId: "mf-guide", status: "OPEN", assignee: "", replies: [], at: "2026-09-11T12:00:00.000Z" }
    ]);
  }
  if (!AdminCore.coupons().length) {
    saveStore(COUPON_KEY, [
      { id: uid("cp"), code: "WELCOME20", type: "percent", value: 20, active: true, uses: 12, max: 200, courses: [], created: "2026-08-01T00:00:00.000Z" },
      { id: uid("cp"), code: "FEST500", type: "fixed", value: 500, active: true, uses: 4, max: 50, courses: [], created: "2026-09-01T00:00:00.000Z" }
    ]);
  }
  if (!storeList(COMMISSION_KEY).length) {
    saveStore(COMMISSION_KEY, AdminCore.commissions());
  }
  if (!AdminCore.notifs().length) {
    saveStore(NOTIF_KEY, [
      { id: uid("nt"), title: "Classroom is live", body: "Replay this week's session before Friday.", audience: "students", channel: "in-app", at: "2026-09-09T10:00:00.000Z" }
    ]);
  }
};

AdminCore.backfillAttribution = () => {
  const users = readList(USERS_KEY);
  const refs = typeof referrals === "function" ? referrals() : [];
  const orders = AdminCore.orders();
  let changed = false;
  orders.forEach((o) => {
    if (o.creatorEmail) return;
    const user = users.find((u) => u.email === o.email);
    const fromUser = staffList().find((s) => s.referralCode && user?.referredBy && s.referralCode.toLowerCase() === String(user.referredBy).toLowerCase());
    const ref = refs.find((r) => r.email === o.email && r.courseId === o.courseId);
    const fromRef = ref ? staffList().find((s) => s.email === ref.affiliateEmail) : null;
    const creator = fromUser || fromRef;
    if (!creator) return;
    const n = AdminCore.normalizeStaff(creator);
    o.creatorEmail = n.email;
    o.referralCode = n.referralCode || user?.referredBy || ref?.code || "";
    o.creatorId = n.creatorId || "";
    o.source = o.source || "first_touch";
    changed = true;
  });
  if (changed) saveStore(ORDER_KEY, orders);
  const comm = storeList(COMMISSION_KEY);
  let commChanged = false;
  AdminCore.orders().forEach((o) => {
    if (!o.creatorEmail || o.status !== "PAID") return;
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

AdminCore.login = (email, password, totp) => {
  email = String(email || "").trim().toLowerCase();
  const ownerOk = email === "admin@bizgarh.in" && password === "admin123";
  if (!ownerOk && AdminCore.loginLocked()) {
    return { ok: false, error: "Too many failed logins. Try again in 15 minutes." };
  }
  const row = AdminCore.staffRow(email) || (ownerOk
    ? { name: "Platform Owner", email, role: "owner", status: "active" }
    : null);
  if (!ownerOk && row && (row.googleAuth || !row.password) && !(row.password && password === row.password)) {
    AdminCore.noteLoginFail();
    return { ok: false, error: "This admin signs in with Google on the public site." };
  }
  const passOk = ownerOk || (row && row.password && row.password === password);
  if (!row || !passOk) {
    AdminCore.noteLoginFail();
    AdminCore.recordSession({ email }, false);
    return { ok: false, error: "Wrong email or password" };
  }
  const staff = AdminCore.normalizeStaff(row);
  if (staff.status === "suspended" || staff.status === "inactive") {
    return { ok: false, error: "This account is " + staff.status };
  }
  if (staff.totp && totp !== "000000") return { ok: false, needTotp: true, error: "Enter authenticator code (demo 000000)" };
  AdminCore.clearLoginFails();
  staff.lastLogin = AdminCore.now();
  AdminCore.saveStaff(staff);
  AdminCore.recordSession(staff, true);
  setStaffSession({ ...staff, password: undefined });
  AdminCore.audit("login", staff.email, "", "ok");
  return { ok: true, staff };
};

AdminCore.adoptPublicUser = () => {
  const u = typeof getUser === "function" ? getUser() : null;
  if (!u?.email) return false;
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
    const extra = JSON.parse(localStorage.getItem("tradeshalaGrantedAdmins") || "[]");
    if (!extra.map((x) => String(x).toLowerCase()).includes(e)) extra.push(e);
    localStorage.setItem("tradeshalaGrantedAdmins", JSON.stringify(extra));
  } catch { /* ignore */ }
  AdminCore.audit("staff_grant_google", e, existing ? existing.role : "", "subadmin");
  toast("Admin access granted. They sign in with Google, then open Admin panel from their name.");
  return { ok: true };
};

AdminCore.logout = () => {
  const s = AdminCore.session();
  if (s) {
    const list = AdminCore.sessions().map((x) => x.email === s.email && x.active ? { ...x, active: false } : x);
    saveStore(SESSION_KEY, list);
    AdminCore.audit("logout", s.email, "", "");
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

AdminCore.rangeFilter = (rows, field, range) => {
  if (!range || range === "all") return rows;
  const now = Date.now();
  const days = { today: 1, "7d": 7, "30d": 30, "90d": 90, "180d": 180, "365d": 365 }[range];
  let from = 0, to = now;
  if (days) from = now - days * 86400000;
  if (range === "today") {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    from = d.getTime();
  }
  if (typeof range === "object" && range.from) {
    from = new Date(range.from).getTime();
    to = range.to ? new Date(range.to).getTime() + 86400000 : now;
  }
  return rows.filter((r) => {
    const t = new Date(r[field] || r.at || r.created).getTime();
    return t >= from && t <= to;
  });
};

AdminCore.kpis = (range) => {
  const students = AdminCore.scope.students(readList(USERS_KEY));
  const enrolls = AdminCore.scope.enrolls(readList(ALL_ENROLL_KEY));
  const orders = AdminCore.rangeFilter(AdminCore.scope.orders(AdminCore.orders()), "at", range);
  const allOrders = AdminCore.scope.orders(AdminCore.orders());
  const paid = orders.filter((o) => o.status === "PAID");
  const refunds = AdminCore.rangeFilter(AdminCore.refunds(), "at", range);
  const revenue = paid.reduce((s, o) => s + Number(o.net || o.amount || 0), 0);
  const today = AdminCore.rangeFilter(allOrders.filter((o) => o.status === "PAID"), "at", "today");
  const month = AdminCore.rangeFilter(allOrders.filter((o) => o.status === "PAID"), "at", "30d");
  const comm = AdminCore.scope.commissions(AdminCore.commissions());
  const pendingComm = comm.filter((c) => ["PENDING", "APPROVED", "PAYABLE"].includes(c.status)).reduce((s, c) => s + Number(c.final || 0), 0);
  const pendingPay = payouts().filter((p) => p.status === "pending").reduce((s, p) => s + Number(p.amount || 0), 0);
  const creatorRev = allOrders.filter((o) => o.creatorEmail && o.status === "PAID").reduce((s, o) => s + Number(o.net || 0), 0);
  const newStudents = AdminCore.rangeFilter(students, "created", range || "30d");
  const activeCut = Date.now() - 30 * 86400000;
  const active = students.filter((u) => enrolls.some((e) => e.email === u.email && new Date(e.at).getTime() >= activeCut));
  return {
    students: students.length,
    newStudents: newStudents.length,
    active: active.length,
    courses: (AdminCore.isOwner() ? allCourses() : allCourses().filter((c) => ownerEmailOf(c) === AdminCore.session()?.email || c.instructor === AdminCore.session()?.name)).length,
    revenue,
    todayRevenue: today.reduce((s, o) => s + Number(o.net || 0), 0),
    monthRevenue: month.reduce((s, o) => s + Number(o.net || 0), 0),
    orders: paid.length,
    pendingPayments: allOrders.filter((o) => o.status === "PENDING").length,
    refunds: refunds.length,
    staff: staffList().filter((s) => s.role !== "owner").length,
    creatorRevenue: creatorRev,
    pendingCommission: pendingComm,
    pendingPayouts: pendingPay,
    tickets: AdminCore.scope.tickets(AdminCore.tickets()).filter((t) => t.status === "OPEN").length
  };
};

AdminCore.series = (range) => {
  const days = range === "7d" ? 7 : range === "90d" ? 12 : range === "365d" ? 12 : 8;
  const enrolls = AdminCore.scope.enrolls(readList(ALL_ENROLL_KEY));
  const orders = AdminCore.scope.orders(AdminCore.orders()).filter((o) => o.status === "PAID");
  const students = AdminCore.scope.students(readList(USERS_KEY));
  const comm = AdminCore.scope.commissions(AdminCore.commissions());
  const buckets = Array.from({ length: days }, (_, i) => {
    const end = Date.now() - (days - 1 - i) * (range === "365d" ? 30 : 7) * 86400000;
    const start = end - (range === "365d" ? 30 : 7) * 86400000;
    const label = new Date(start + 86400000).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    const inWin = (at) => { const t = new Date(at).getTime(); return t >= start && t < end; };
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
  return buckets;
};

function commerceOnEnroll(user, courseId, couponCode) {
  const course = allCourses().find((c) => c.id === courseId);
  if (!course || !user) return;
  const orders = storeList(ORDER_KEY);
  if (orders.some((o) => o.email === user.email && o.courseId === courseId && o.status !== "REFUNDED")) return;
  const priorPaid = storeList(ORDER_KEY).some((o) => o.email === user.email && o.status === "PAID");
  const attr = AdminCore.resolveAttribution(user, couponCode);
  const staff = attr.creator ? AdminCore.normalizeStaff(AdminCore.staffRow(attr.creator.email) || attr.creator) : null;
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
    status: "PAID", coupon: coupon?.code || "", creatorEmail: staff?.email || "", referralCode: attr.code || "",
    creatorId: staff?.creatorId || "", source: attr.source, attribAt: AdminCore.now(), tx, at: AdminCore.now()
  });
  saveStore(ORDER_KEY, orders);
  const pays = storeList(PAYMENT_KEY);
  pays.push({ id: uid("pay"), orderId: oid, email: user.email, amount: net, status: "SUCCESS", method: "upi", tx, at: AdminCore.now() });
  saveStore(PAYMENT_KEY, pays);
  const attribs = storeList(ATTRIB_KEY);
  attribs.push({
    id: uid("at"), creatorId: staff?.creatorId || "", creatorEmail: staff?.email || "", referralCode: attr.code || "",
    source: attr.source, attribAt: AdminCore.now(), userId: user.email, orderId: oid, courseId
  });
  saveStore(ATTRIB_KEY, attribs);
  if (staff?.creatorEnabled || staff?.referralCode) {
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
