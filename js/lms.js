const SETTINGS_KEY = "tradeshalaSettings";
const QUIZ_KEY = "tradeshalaQuizzes";
const ASSIGN_KEY = "tradeshalaAssignments";
const ASSIGN_SUB_KEY = "tradeshalaAssignSubs";
const PROGRESS_KEY = "tradeshalaProgress";
const CERT_KEY = "tradeshalaCerts";
const AFFILIATE_KEY = "tradeshalaAffiliates";
const REFERRAL_KEY = "tradeshalaReferrals";
const PAYOUT_KEY = "tradeshalaPayouts";
const CALL_KEY = "tradeshalaCalls";
const INVITE_KEY = "tradeshalaInvites";
const COMMUNITY_KEY = "tradeshalaCommunity";
const POST_KEY = "tradeshalaPosts";
const QUIZ_ATTEMPT_KEY = "tradeshalaQuizAttempts";

function defaultSettings() {
  return {
    publicSignup: true,
    inviteOnly: false,
    requireApproval: false,
    affiliateEnabled: true,
    defaultCommission: 20,
    communityOpen: true
  };
}
function platformSettings() {
  try {
    return { ...defaultSettings(), ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") };
  } catch {
    return defaultSettings();
  }
}
function saveSettings(next) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...platformSettings(), ...next }));
}

function lmsMap(key) {
  try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; }
}
function setLmsMap(key, map) { localStorage.setItem(key, JSON.stringify(map)); }

function quizzesOf(courseId) {
  const map = lmsMap(QUIZ_KEY);
  return map[courseId] || [];
}
function saveQuizzes(courseId, list) {
  const map = lmsMap(QUIZ_KEY);
  map[courseId] = list;
  setLmsMap(QUIZ_KEY, map);
}
function assignmentsOf(courseId) {
  const map = lmsMap(ASSIGN_KEY);
  return map[courseId] || [];
}
function saveAssignments(courseId, list) {
  const map = lmsMap(ASSIGN_KEY);
  map[courseId] = list;
  setLmsMap(ASSIGN_KEY, map);
}
function assignSubs() { return readList(ASSIGN_SUB_KEY); }
function affiliates() { return readList(AFFILIATE_KEY); }
function referrals() { return readList(REFERRAL_KEY); }
function payouts() { return readList(PAYOUT_KEY); }
function callRequests() { return readList(CALL_KEY); }
function invites() { return readList(INVITE_KEY); }
function telegramChannels() { return readList(COMMUNITY_KEY); }
function forumPosts() { return readList(POST_KEY); }
function certs() { return readList(CERT_KEY); }
function quizAttempts() { return readList(QUIZ_ATTEMPT_KEY); }

function progressStore() { return lmsMap(PROGRESS_KEY); }
function learnerProgress(email, courseId) {
  const all = progressStore();
  const byUser = all[email] || {};
  return byUser[courseId] || { lessons: {}, quizzes: {}, cert: false };
}
function patchProgress(email, courseId, patch) {
  const all = progressStore();
  all[email] = all[email] || {};
  all[email][courseId] = { ...learnerProgress(email, courseId), ...patch };
  setLmsMap(PROGRESS_KEY, all);
}
function markLessonDone(email, courseId, idx) {
  const cur = learnerProgress(email, courseId);
  const lessons = { ...cur.lessons, [idx]: true };
  patchProgress(email, courseId, { lessons });
}
function courseCompletion(email, courseId) {
  const c = allCourses().find((x) => x.id === courseId);
  const total = Math.max(lessonsFor(courseId).length, 1);
  const p = learnerProgress(email, courseId);
  const done = Object.keys(p.lessons).filter((k) => p.lessons[k]).length;
  const qzs = quizzesOf(courseId);
  const passed = qzs.filter((q) => Number(p.quizzes[q.id] || 0) >= Number(q.passScore || 70)).length;
  const pct = Math.round((done / total) * 80 + (qzs.length ? (passed / qzs.length) * 20 : done ? 20 : 0));
  return { done, total, passed, quizCount: qzs.length, pct: Math.min(100, pct), cert: !!p.cert };
}

function makeCode(prefix) {
  return (prefix || "TS") + "-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function findAffiliate(code) {
  if (!code) return null;
  return affiliates().find((a) => a.code.toLowerCase() === String(code).trim().toLowerCase() && a.status === "active");
}

function creditReferral(user, course) {
  const code = user.referredBy || localStorage.getItem("tradeshalaPendingRef") || "";
  const aff = findAffiliate(code);
  if (!aff || !platformSettings().affiliateEnabled) return;
  const list = referrals();
  if (list.some((r) => r.email === user.email && r.courseId === course.id)) return;
  const rate = Number(aff.rate || platformSettings().defaultCommission || 20);
  const amount = Number(course.price || 0);
  list.push({
    id: "rf-" + Date.now(),
    code: aff.code,
    affiliateEmail: aff.email,
    email: user.email,
    name: user.name,
    courseId: course.id,
    amount,
    commission: Math.round(amount * rate / 100),
    status: "unpaid",
    at: new Date().toISOString()
  });
  writeList(REFERRAL_KEY, list);
}

function issueCert(email, name, courseId) {
  const list = certs();
  if (list.some((c) => c.email === email && c.courseId === courseId)) return list.find((c) => c.email === email && c.courseId === courseId);
  const row = { id: "cert-" + Date.now(), email, name, courseId, at: new Date().toISOString() };
  list.push(row);
  writeList(CERT_KEY, list);
  patchProgress(email, courseId, { cert: true });
  return row;
}

function seedLms() {
  if (localStorage.getItem("tradeshalaLmsSeeded")) return;

  if (!affiliates().length) {
    writeList(AFFILIATE_KEY, [
      { email: "aarav@bizgarh.in", name: "Aarav Mehta", code: "AARAV20", rate: 20, status: "active", created: "2026-08-01T10:00:00.000Z" },
      { email: "neha@bizgarh.in", name: "Neha Kapoor", code: "NEHA20", rate: 25, status: "active", created: "2026-08-10T10:00:00.000Z" }
    ]);
  }
  if (!referrals().length) {
    writeList(REFERRAL_KEY, [
      { id: "rf-demo1", code: "AARAV20", affiliateEmail: "aarav@bizgarh.in", email: "ritesh@gmail.com", name: "Ritesh Kulkarni", courseId: "breakout", amount: 799, commission: 160, status: "unpaid", at: "2026-08-12T11:00:00.000Z" },
      { id: "rf-demo2", code: "NEHA20", affiliateEmail: "neha@bizgarh.in", email: "kavya@gmail.com", name: "Kavya Iyer", courseId: "income", amount: 499, commission: 125, status: "paid", at: "2026-09-04T14:00:00.000Z" }
    ]);
  }
  if (!invites().length) {
    writeList(INVITE_KEY, [
      { code: "BG-CLASS1", email: "", used: false, createdBy: "admin@bizgarh.in", at: "2026-09-01T10:00:00.000Z" }
    ]);
  }
  if (!callRequests().length) {
    writeList(CALL_KEY, [
      { id: "call-1", name: "Sneha Bansal", email: "sneha@gmail.com", topic: "Options setup", date: "2026-09-18", time: "19:00", mentor: "Neha Kapoor", mentorEmail: "neha@bizgarh.in", status: "pending", meetUrl: "", notes: "Stuck on credit spreads.", at: "2026-09-10T08:00:00.000Z" },
      { id: "call-2", name: "Aditya Menon", email: "aditya@gmail.com", topic: "Investing plan", date: "2026-09-20", time: "11:00", mentor: "Ananya Rao", mentorEmail: "ananya@bizgarh.in", status: "approved", meetUrl: "https://meet.google.com/ts-demo", notes: "", at: "2026-09-08T09:00:00.000Z" }
    ]);
  }
  if (!telegramChannels().length) {
    writeList(COMMUNITY_KEY, [
      { id: "tg-1", name: "Breakout desk", url: "https://t.me/bizgarh_breakout", creatorEmail: "aarav@bizgarh.in", courseId: "breakout" },
      { id: "tg-2", name: "Options income room", url: "https://t.me/bizgarh_income", creatorEmail: "neha@bizgarh.in", courseId: "income" }
    ]);
  }
  if (!forumPosts().length) {
    writeList(POST_KEY, [
      { id: "p-1", title: "How do you size the first week?", body: "I keep going too big on Bank Nifty. What did you write in the journal after lesson 3?", author: "Ritesh Kulkarni", email: "ritesh@gmail.com", courseId: "breakout", at: "2026-09-09T10:00:00.000Z" },
      { id: "p-2", title: "SIP vs lump sum this quarter", body: "Ananya's lab said pick one. I picked SIP. Anyone doing both?", author: "Aditya Menon", email: "aditya@gmail.com", courseId: "long-term", at: "2026-09-10T12:00:00.000Z" }
    ]);
  }

  const qmap = lmsMap(QUIZ_KEY);
  if (!qmap.breakout) {
    qmap.breakout = [{
      id: "quiz-breakout",
      title: "Breakout checkpoint",
      passScore: 70,
      questions: [
        { q: "A valid breakout usually needs which of these?", options: ["A volume expansion", "A paid telegram tip", "More indicators on the chart"], answer: 0 },
        { q: "What do you write before you click buy?", options: ["The guru's name", "Invalidation and size", "Yesterday's P&L only"], answer: 1 }
      ]
    }];
    setLmsMap(QUIZ_KEY, qmap);
  }
  const amap = lmsMap(ASSIGN_KEY);
  if (!amap.breakout) {
    amap.breakout = [{ id: "as-1", title: "Week-1 journal", due: "2026-09-20", prompt: "Screenshot one setup, write the invalidation, and the size you would actually take." }];
    setLmsMap(ASSIGN_KEY, amap);
  }
  localStorage.setItem("tradeshalaLmsSeeded", "1");
}

function affiliateBalance(email) {
  const earned = referrals().filter((r) => r.affiliateEmail === email).reduce((s, r) => s + Number(r.commission || 0), 0);
  const paid = payouts().filter((p) => p.email === email && p.status === "paid").reduce((s, p) => s + Number(p.amount || 0), 0);
  const pendingPay = payouts().filter((p) => p.email === email && p.status === "pending").reduce((s, p) => s + Number(p.amount || 0), 0);
  return { earned, paid, pendingPay, due: Math.max(0, earned - paid - pendingPay) };
}
