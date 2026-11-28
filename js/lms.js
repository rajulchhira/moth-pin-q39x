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
  return maybeIssueCert(email, courseId);
}
function lessonNeedsWatch(l) {
  const kind = l && l.kind ? l.kind : "video";
  if (kind === "live") return false;
  return kind === "video" || Boolean(l && (l.src || l.vdoId || l.fileKey));
}
function courseCompletion(email, courseId) {
  const published = typeof lessonsFor === "function" ? lessonsFor(courseId) : [];
  const watch = published.map((l, i) => ({ l, i })).filter((x) => lessonNeedsWatch(x.l));
  const tracked = watch.length ? watch : published.map((l, i) => ({ l, i }));
  const total = Math.max(tracked.length, 1);
  const p = learnerProgress(email, courseId);
  const done = tracked.filter((x) => p.lessons[x.i]).length;
  const pct = Math.round((done / total) * 100);
  return { done, total, passed: 0, quizCount: 0, pct: Math.min(100, pct), cert: !!p.cert };
}
function certFor(email, courseId) {
  return certs().find((c) => c.email === email && c.courseId === courseId) || null;
}
function certCode(courseId) {
  const slug = String(courseId || "BG").replace(/[^a-z0-9]/gi, "").slice(0, 4).toUpperCase() || "BG";
  return "BG-" + slug + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
}
function maybeIssueCert(email, courseId) {
  if (!email || !courseId) return null;
  const stats = courseCompletion(email, courseId);
  if (stats.done < stats.total) return certFor(email, courseId);
  const u = typeof getUser === "function" ? getUser() : null;
  return issueCert(email, u?.name || email, courseId);
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
  const existing = list.find((c) => c.email === email && c.courseId === courseId);
  if (existing) {
    if (!existing.code) {
      existing.code = certCode(courseId);
      writeList(CERT_KEY, list);
    }
    patchProgress(email, courseId, { cert: true });
    return existing;
  }
  const row = {
    id: "cert-" + Date.now(),
    code: certCode(courseId),
    email,
    name,
    courseId,
    at: new Date().toISOString()
  };
  list.push(row);
  writeList(CERT_KEY, list);
  patchProgress(email, courseId, { cert: true });
  if (typeof pushNote === "function") {
    const course = typeof allCourses === "function" ? allCourses().find((c) => c.id === courseId) : null;
    pushNote({
      key: "cert:" + courseId,
      kind: "cert",
      title: "Certificate ready",
      body: (course?.title || "Your classroom") + " is ready to download.",
      href: "/certificate?course=" + encodeURIComponent(courseId),
      email
    });
  }
  return row;
}

function seedLms() {
  if (localStorage.getItem("tradeshalaLmsSeeded")) return;
  // Do not plant demo affiliates / referrals / call requests / forum posts —
  // Control Dashboard + Analytics must stay empty until real activity exists.
  // Classroom quiz/assignment templates for Slingshot remain available for editors.
  const qmap = lmsMap(QUIZ_KEY);
  if (!qmap.slingshot) {
    qmap.slingshot = [{
      id: "quiz-slingshot",
      title: "Slingshot checkpoint",
      passScore: 70,
      questions: [
        { q: "What do you write before you take the 5-minute edge?", options: ["A tip from a group", "Invalidation and size", "Yesterday's P&L only"], answer: 1 },
        { q: "This classroom is for which of these?", options: ["Education and process", "Guaranteed returns", "Live buy/sell calls"], answer: 0 }
      ]
    }];
    setLmsMap(QUIZ_KEY, qmap);
  }
  const amap = lmsMap(ASSIGN_KEY);
  if (!amap.slingshot) {
    amap.slingshot = [{ id: "as-1", title: "Week-1 journal", due: "2026-09-20", prompt: "Screenshot one 5-minute edge setup, write the invalidation, and the size you would actually take." }];
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
