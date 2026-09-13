const BRAND = "Bizgarh";

let brandMarkSeq = 0;
function brandMarkSVG() {
  const n = ++brandMarkSeq;
  const g = "baurora" + n;
  const glass = "bglass" + n;
  const clip = "bdisc" + n;
  return `<span class="logo-mark" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none">
    <defs>
      <linearGradient id="${g}" x1="8" y1="40" x2="38" y2="8" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#4F46E5"/>
        <stop offset=".46" stop-color="#7C3AED"/>
        <stop offset="1" stop-color="#E11D74"/>
      </linearGradient>
      <linearGradient id="${glass}" x1="14" y1="12" x2="30" y2="36">
        <stop offset="0" stop-color="#fff" stop-opacity=".24"/>
        <stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <clipPath id="${clip}"><circle cx="23" cy="25.4" r="16.35"/></clipPath>
    </defs>
    <circle cx="23" cy="25.4" r="20.35" fill="none" stroke="url(#${g})" stroke-width="1.75"/>
    <circle cx="23" cy="25.4" r="16.55" fill="url(#${g})"/>
    <ellipse cx="18.4" cy="20" rx="8.4" ry="5.8" fill="url(#${glass})"/>
    <circle cx="23" cy="25.4" r="15.45" stroke="#fff" stroke-width="1" opacity=".32"/>
    <path fill="#fff" d="M14.35 35.05V21.15C14.35 15.2 18.15 11.85 23 11.85S31.65 15.2 31.65 21.15v13.9h-4.05V22.85c0-2.85-2-4.95-4.6-4.95s-4.6 2.1-4.6 4.95v12.2h-4.05Z"/>
    <g clip-path="url(#${clip})">
      <path d="M18.9 30.35 21.95 25.15 24.85 27.2 28.85 19.55" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path fill="#fff" d="M27.55 18.05 31.35 17.35 29.55 21.45Z"/>
    </g>
    <circle cx="36.35" cy="9.85" r="3.55" fill="#fff"/>
    <circle cx="36.35" cy="9.85" r="2.55" fill="#E11D74"/>
    <circle cx="36.35" cy="9.85" r="1.05" fill="#fff"/>
  </svg></span>`;
}

function brandLogoHTML() {
  return `${brandMarkSVG()}<span class="logo-word">Bizgarh</span>`;
}

function currentPageName() {
  const p = String(location.pathname || "/").replace(/^\//, "").replace(/\.html$/i, "").split("/")[0];
  if (!p || p === "index") return "index";
  return p;
}

function prettyPath() {
  const name = currentPageName();
  return name === "index" ? "/" : "/" + name;
}

function stripHtmlUrl() {
  const path = location.pathname;
  let pretty = path;
  if (/^\/index(?:\.html)?$/i.test(path)) pretty = "/";
  else if (/\.html$/i.test(path)) pretty = path.replace(/\.html$/i, "");
  else return;
  if (pretty === path) return;
  history.replaceState(null, "", pretty + location.search + location.hash);
}

function ensureBrandFont() {
  if (!document.getElementById("playfairBrand") && !document.querySelector('link[href*="Playfair"]')) {
    const link = document.createElement("link");
    link.id = "playfairBrand";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap";
    document.head.appendChild(link);
  }
  if (!document.querySelector('link[rel="icon"]')) {
    const icon = document.createElement("link");
    icon.rel = "icon";
    icon.type = "image/svg+xml";
    icon.href = "img/bizgarh-mark.svg?v=orbit5";
    document.head.appendChild(icon);
  }
}
const USER_KEY = "tradeshalaUser";
const OTP_STORE_KEY = "tradeshalaEmailOtp";
const SOCIAL_PROFILES_KEY = "tradeshalaSocialProfiles";
const ENROLL_KEY = "tradeshalaEnroll";
const USERS_KEY = "tradeshalaUsers";
const ALL_ENROLL_KEY = "tradeshalaAllEnrolls";
const REGS_KEY = "tradeshalaRegs";
const EXTRA_COURSES_KEY = "tradeshalaExtraCourses";
const HIDDEN_COURSES_KEY = "tradeshalaHiddenCourses";
const STAFF_KEY = "tradeshalaStaff";
const STAFF_SESSION_KEY = "tradeshalaStaffSession";
const COURSE_OWNERS_KEY = "tradeshalaCourseOwners";
const SUPER_ADMINS = [
  { email: "rajulchhira1@gmail.com", name: "Rajul Chhira" },
  { email: "bizgarh@gmail.com", name: "Bizgarh" }
];

function normEmail(email) {
  return String(email || "").trim().toLowerCase();
}
function isSuperAdminEmail(email) {
  const e = normEmail(email);
  return SUPER_ADMINS.some((s) => s.email === e);
}
function grantedAdminEmails() {
  try {
    return JSON.parse(localStorage.getItem("tradeshalaGrantedAdmins") || "[]").map(normEmail);
  } catch {
    return [];
  }
}
function staffAccessRole(email) {
  const e = normEmail(email);
  if (!e) return "";
  if (isSuperAdminEmail(e)) return "superadmin";
  const row = staffList().find((s) => normEmail(s.email) === e);
  if (row && row.status !== "suspended" && row.status !== "inactive" && row.status !== "blocked") {
    if (row.role === "owner") return "owner";
    if (row.role === "superadmin") return "superadmin";
    if (row.role === "subadmin" || row.role === "admin" || row.role === "creator") return "admin";
  }
  if (grantedAdminEmails().includes(e)) return "admin";
  return "";
}
function openAdminDesk() {
  const user = getUser();
  const role = staffAccessRole(user?.email);
  if (!role) return;
  const named = SUPER_ADMINS.find((s) => s.email === normEmail(user.email));
  setStaffSession({
    name: user.name || named?.name || "Admin",
    email: normEmail(user.email),
    role: role === "admin" ? "subadmin" : role,
    status: "active"
  });
  location.href = "/admin";
}
const LIVE_KEY = "tradeshalaLives";
const COURSE_EDITS_KEY = "tradeshalaCourseEdits";
const COURSE_VIDEOS_KEY = "tradeshalaCourseVideos";

const DEFAULT_LESSONS = [
  { t: "Welcome & how this classroom works", dur: "00:15", src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
  { t: "Setup selection on a live chart", dur: "00:15", src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
  { t: "Entries, invalidation, targets", dur: "00:15", src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
  { t: "Position sizing you can follow", dur: "00:15", src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
  { t: "Journal template walkthrough", dur: "00:15", src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" }
];

function courseVideosMap() {
  try { return JSON.parse(localStorage.getItem(COURSE_VIDEOS_KEY) || "{}"); } catch { return {}; }
}
function setCourseVideosMap(map) { localStorage.setItem(COURSE_VIDEOS_KEY, JSON.stringify(map)); }
function lessonsFor(courseId) {
  const custom = courseVideosMap()[courseId];
  if (custom && custom.length) return custom;
  return DEFAULT_LESSONS.map((l) => ({ ...l }));
}
function setCourseLessons(courseId, lessons) {
  const map = courseVideosMap();
  if (!lessons.length) delete map[courseId];
  else map[courseId] = lessons;
  setCourseVideosMap(map);
  applyCoursePatch(courseId, { lessons: lessons.length || DEFAULT_LESSONS.length });
}
function videoDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("tradeshalaVideoFiles", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("files");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function putVideoBlob(key, blob) {
  const db = await videoDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction("files", "readwrite");
    tx.objectStore("files").put(blob, key);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}
async function getVideoBlob(key) {
  const db = await videoDb();
  return new Promise((resolve, reject) => {
    const r = db.transaction("files").objectStore("files").get(key);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
async function delVideoBlob(key) {
  const db = await videoDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction("files", "readwrite");
    tx.objectStore("files").delete(key);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

const COURSES = [
  { id: "breakout", title: "Intraday Breakout Blueprint", instructor: "Aarav Mehta", learners: "12,480", rating: "4.8", price: 799, old: 1999, cat: "trending", cover: "breakout", hours: "6.5", lessons: 18 },
  { id: "income", title: "Weekly Options Income Playbook", instructor: "Neha Kapoor", learners: "28,910", rating: "4.9", price: 499, old: 1499, cat: "trending", cover: "income", hours: "8.0", lessons: 22 },
  { id: "price-action", title: "Price Action Without Indicators", instructor: "Vikram Singh", learners: "9,340", rating: "4.8", price: 899, old: 2199, cat: "trending", cover: "pa", hours: "7.0", lessons: 16 },
  { id: "opening-range", title: "Opening Range for Index Options", instructor: "Kabir Joshi", learners: "6,112", rating: "4.7", price: 999, old: 2499, cat: "trending", cover: "or", hours: "5.5", lessons: 14 },
  { id: "long-term", title: "How to Build a 10-Year Stock Portfolio", instructor: "Ananya Rao", learners: "15,220", rating: "4.8", price: 399, old: 999, cat: "investing", cover: "lt", hours: "5.0", lessons: 12 },
  { id: "mf-guide", title: "Mutual Funds Made Simple", instructor: "Rohan Desai", learners: "11,004", rating: "4.7", price: 299, old: 799, cat: "investing", cover: "mf", hours: "4.0", lessons: 10 },
  { id: "sip", title: "SIP & Asset Allocation Lab", instructor: "Priya Nair", learners: "8,760", rating: "4.8", price: 349, old: 899, cat: "investing", cover: "sip", hours: "3.5", lessons: 9 },
  { id: "opt-start", title: "Options from Zero", instructor: "Meera Iyer", learners: "21,550", rating: "4.8", price: 449, old: 1199, cat: "options", cover: "opt", hours: "7.5", lessons: 20 },
  { id: "spreads", title: "Spreads & Defined-Risk Setups", instructor: "Neha Kapoor", learners: "7,890", rating: "4.8", price: 699, old: 1799, cat: "options", cover: "spread", hours: "6.0", lessons: 15 },
  { id: "first-month", title: "Your First 30 Days in Markets", instructor: "Aarav Mehta", learners: "33,001", rating: "4.9", price: 199, old: 599, cat: "beginners", cover: "first", hours: "4.5", lessons: 11 },
  { id: "charts-101", title: "Reading Charts for Beginners", instructor: "Vikram Singh", learners: "14,670", rating: "4.7", price: 299, old: 799, cat: "beginners", cover: "charts", hours: "5.0", lessons: 13 },
  { id: "candles", title: "Candlestick Context Course", instructor: "Kabir Joshi", learners: "10,240", rating: "4.8", price: 399, old: 999, cat: "ta", cover: "candle", hours: "5.5", lessons: 12 },
  { id: "levels", title: "Support, Resistance & Market Structure", instructor: "Meera Iyer", learners: "9,018", rating: "4.8", price: 449, old: 1099, cat: "ta", cover: "levels", hours: "6.0", lessons: 14 },
  { id: "hindi-ta", title: "टेक्निकल एनालिसिस हिंदी में", instructor: "Ananya Rao", learners: "18,430", rating: "4.8", price: 399, old: 999, cat: "hindi", cover: "hindi", hours: "6.5", lessons: 16 },
  { id: "hindi-swing", title: "स्विंग ट्रेडिंग आसान भाषा में", instructor: "Rohan Desai", learners: "13,880", rating: "4.7", price: 449, old: 1099, cat: "hindi", cover: "swing", hours: "6.0", lessons: 14 },
  { id: "crypto-lab", title: "Crypto Spot & Risk Basics", instructor: "Priya Nair", learners: "6,540", rating: "4.6", price: 499, old: 1299, cat: "crypto", cover: "crypto", hours: "5.0", lessons: 12 },
  { id: "ema-swing", title: "EMA Pullback Swing System", instructor: "Vikram Singh", learners: "4,210", rating: "4.7", price: 249, old: 699, cat: "strategy", cover: "ema", hours: "3.5", lessons: 8 },
  { id: "vwap", title: "VWAP Intraday Checklist", instructor: "Aarav Mehta", learners: "5,002", rating: "4.7", price: 249, old: 699, cat: "strategy", cover: "vwap", hours: "3.0", lessons: 8 }
];

const COVERS = {
  breakout: { bg: "linear-gradient(135deg,#0b1220 0%,#1e3a5f 55%,#0f766e 100%)", title: "BREAKOUT<br>BLUEPRINT", sub: "Intraday system" },
  income: { bg: "linear-gradient(135deg,#1c1917,#9a3412 70%)", title: "WEEKLY<br>OPTIONS", sub: "Income playbook" },
  pa: { bg: "linear-gradient(135deg,#0f172a,#334155)", title: "PRICE<br>ACTION", sub: "No indicators" },
  or: { bg: "linear-gradient(135deg,#1e1b4b,#1d4ed8)", title: "OPENING<br>RANGE", sub: "Index options" },
  lt: { bg: "linear-gradient(135deg,#042f2e,#0f766e)", title: "10-YEAR<br>PORTFOLIO", sub: "Long-term" },
  mf: { bg: "linear-gradient(135deg,#1a2e05,#4d7c0f)", title: "MUTUAL<br>FUNDS", sub: "Simple picks" },
  sip: { bg: "linear-gradient(135deg,#083344,#0e7490)", title: "SIP<br>LAB", sub: "Allocation" },
  opt: { bg: "linear-gradient(135deg,#431407,#c2410c)", title: "OPTIONS<br>FROM ZERO", sub: "Start here" },
  spread: { bg: "linear-gradient(135deg,#1e1b4b,#4338ca)", title: "DEFINED<br>RISK", sub: "Spreads" },
  first: { bg: "linear-gradient(135deg,#022c22,#0f766e)", title: "FIRST<br>30 DAYS", sub: "Beginner path" },
  charts: { bg: "linear-gradient(135deg,#111827,#374151)", title: "CHARTS<br>101", sub: "Read the tape" },
  candle: { bg: "linear-gradient(135deg,#052e16,#166534)", title: "CANDLE<br>CONTEXT", sub: "TA course" },
  levels: { bg: "linear-gradient(135deg,#020617,#1e293b)", title: "MARKET<br>STRUCTURE", sub: "S/R + trend" },
  hindi: { bg: "linear-gradient(135deg,#042f2e,#0f766e)", title: "टेक्निकल<br>एनालिसिस", sub: "हिंदी में" },
  swing: { bg: "linear-gradient(135deg,#431407,#9a3412)", title: "स्विंग<br>ट्रेडिंग", sub: "हिंदी course" },
  crypto: { bg: "linear-gradient(135deg,#020617,#111827)", title: "CRYPTO<br>SPOT", sub: "Risk basics" },
  ema: { bg: "linear-gradient(135deg,#1e1b4b,#4f46e5)", title: "EMA<br>SWING", sub: "Pullback system" },
  vwap: { bg: "linear-gradient(135deg,#1e1b4b,#4f46e5)", title: "VWAP<br>CHECKLIST", sub: "Intraday" }
};

const MENTORS = [
  { name: "Aarav Mehta", role: "Full-time trader", tag: "Intraday", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=640&h=860&q=80" },
  { name: "Neha Kapoor", role: "Options specialist", tag: "Income strategies", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=640&h=860&q=80" },
  { name: "Vikram Singh", role: "Price action coach", tag: "Swing trading", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=640&h=860&q=80" },
  { name: "Ananya Rao", role: "Long-term investor", tag: "Portfolio", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=640&h=860&q=80" },
  { name: "Kabir Joshi", role: "Index options", tag: "Bank Nifty", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=640&h=860&q=80" },
  { name: "Rohan Desai", role: "Fund researcher", tag: "Mutual funds", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=640&h=860&q=80" },
  { name: "Priya Nair", role: "Asset allocation", tag: "SIP lab", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=640&h=860&q=80" },
  { name: "Meera Iyer", role: "Options coach", tag: "Defined risk", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=640&h=860&q=80" }
];

function photoFor(name) {
  return MENTORS.find((m) => m.name === name)?.img || "https://randomuser.me/api/portraits/men/15.jpg";
}

function iconSvg(name) {
  const paths = {
    wifi: '<path d="M5 12.5a9 9 0 0 1 14 0"/><path d="M8.5 15.5a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none"/>',
    users: '<circle cx="9" cy="8" r="3"/><circle cx="16" cy="9" r="2.4"/><path d="M4 19c.4-3 2.4-5 5-5s4.6 2 5 5"/><path d="M14 19c.2-2 1.4-3.4 3.4-3.6 1.8.1 3.2 1.4 3.6 3.6"/>',
    headset: '<path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="3" y="12" width="4" height="7" rx="1.5"/><rect x="17" y="12" width="4" height="7" rx="1.5"/><path d="M17 19v1a3 3 0 0 1-3 3h-2"/>',
    chart: '<path d="M4 19V9"/><path d="M10 19V5"/><path d="M16 19v-7"/><path d="M20 19H3"/>',
    layers: '<path d="M12 4 4 8l8 4 8-4-8-4Z"/><path d="M4 12l8 4 8-4"/><path d="M4 16l8 4 8-4"/>',
    bars: '<path d="M5 19V10"/><path d="M10 19V6"/><path d="M15 19v-5"/><path d="M20 19V8"/>',
    candle: '<path d="M8 4v4"/><rect x="6" y="8" width="4" height="9" rx="1"/><path d="M8 17v3"/><path d="M16 3v3"/><rect x="14" y="6" width="4" height="10" rx="1"/><path d="M16 16v4"/>',
    chat: '<path d="M5 17.5 3 21l4-1.2A9 9 0 1 0 5 17.5Z"/>',
    coin: '<circle cx="12" cy="12" r="8"/><path d="M12 7v10"/><path d="M9.5 9.2c.7-1 2.6-1.4 3.8-.4 1.1.9.7 2.4-.8 2.8-1.7.5-2.4 1.5-1.5 2.7 1 1.3 3.2.9 4-.3"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
    badge: '<path d="M8 3h8l1 4H7L8 3Z"/><path d="M7 7h10v4a5 5 0 0 1-10 0V7Z"/><path d="M9 19 8 22l4-1 4 1-1-3"/>',
    share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 13.4 7.6 4.2M15.8 6.4 8.2 10.6"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5-6-3.5Z" fill="currentColor" stroke="none"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4.2l2.4 1.6"/>',
    check: '<path d="m6.5 12.2 3.4 3.4 7.6-7.6"/>',
    gift: '<rect x="3" y="10" width="18" height="11" rx="2"/><path d="M12 7v14"/><path d="M3 10h18"/><path d="M12 7c-2.2-3.4-5.5-1.4-4.2 1.2C9.2 10 12 7 12 7Z"/><path d="M12 7c2.2-3.4 5.5-1.4 4.2 1.2C14.8 10 12 7 12 7Z"/>'
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.chart}</svg>`;
}

const CATEGORIES = [
  { id: "investing", title: "Stock Market Investing", desc: "Learn the principles of investing in the stock market. Patient, long-term courses.", icon: "chart", tint: "#eef2ff", color: "#4f46e5" },
  { id: "options", title: "Option Trading", desc: "Defined-risk option courses designed for all levels of traders.", icon: "layers", tint: "#f5f3ff", color: "#7c3aed" },
  { id: "beginners", title: "Stock Market Basics", desc: "Begin your market journey with our beginner-friendly courses.", icon: "bars", color: "#0284c7", tint: "#e0f2fe" },
  { id: "ta", title: "Technical Analysis", desc: "Learn candlestick context, levels, and clean chart structure.", icon: "candle", color: "#16a34a", tint: "#dcfce7" },
  { id: "hindi", title: "Stock Market in Hindi", desc: "Learn in Hindi to understand the concepts with more clarity.", icon: "chat", color: "#2563eb", tint: "#dbeafe" },
  { id: "crypto", title: "Crypto", desc: "Learn how to analyse, trade, and size risk in cryptocurrency.", icon: "coin", color: "#ca8a04", tint: "#fef9c3" },
  { id: "strategy", title: "Trading Strategies", desc: "From simple checklists to advanced options trading systems.", icon: "target", color: "#db2777", tint: "#fce7f3" },
  { id: "cert", title: "Finance Certification", desc: "Structured modules to practice exam-style market concepts.", icon: "badge", color: "#ea580c", tint: "#ffedd5" }
];

const WEB_BANNERS = [
  "linear-gradient(135deg,#4f46e5,#1e1b4b)",
  "linear-gradient(135deg,#e11d74,#9f1239)",
  "linear-gradient(135deg,#0f766e,#115e59)",
  "linear-gradient(135deg,#1d4ed8,#1e3a8a)"
];

function courseFilterFromCat(id) {
  return !id || id === "cert" ? "all" : id;
}

function categoryCardsHTML(active) {
  return CATEGORIES.map((c) => {
    const filter = courseFilterFromCat(c.id);
    const on = active && ((c.id === active) || (c.id !== "cert" && filter === active)) ? " on" : "";
    return `
    <a class="cat-card${on}" data-cat="${c.id}" href="/courses?cat=${filter}#library">
      <div class="cat-icon" style="background:${c.tint};color:${c.color}">${iconSvg(c.icon)}</div>
      <h3>${c.title}</h3>
      <p>${c.desc}</p>
    </a>`;
  }).join("");
}

function webinarBannerHTML(w, i) {
  return `<div class="web-banner" style="background:${WEB_BANNERS[i % WEB_BANNERS.length]}">
    <div class="web-banner-copy"><small>Bizgarh</small><b>${w.title}</b></div>
    <img src="${photoFor(w.by)}" alt="${w.by}">
  </div>`;
}

const WEBINARS = [
  { id: "w1", title: "Gap & Go for Nifty Options", by: "Aarav Mehta", when: "18 Sep 2026 • 11:00 am", free: true },
  { id: "w2", title: "Defined-Risk Credit Spreads", by: "Neha Kapoor", when: "20 Sep 2026 • 08:00 pm", free: true },
  { id: "w3", title: "Reading Weekly Structure", by: "Vikram Singh", when: "22 Sep 2026 • 07:30 pm", free: true }
];

function getUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); } catch { return null; }
}
function setUser(user) { localStorage.setItem(USER_KEY, JSON.stringify(user)); }
function enrolled() { try { return JSON.parse(localStorage.getItem(ENROLL_KEY) || "[]"); } catch { return []; } }
function setEnrolled(ids) { localStorage.setItem(ENROLL_KEY, JSON.stringify(ids)); }
function isEnrolled(id) { return enrolled().includes(id); }
function readList(key) { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } }
function writeList(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function upsertUser(user) {
  const list = readList(USERS_KEY);
  const i = list.findIndex((x) => x.email === user.email);
  const prev = i >= 0 ? list[i] : {};
  const row = {
    name: user.name || prev.name,
    email: user.email,
    created: prev.created || user.created || new Date().toISOString(),
    status: user.status || prev.status || "active",
    password: user.password || prev.password || "",
    referredBy: user.referredBy || prev.referredBy || "",
    invitedBy: user.invitedBy || prev.invitedBy || "",
    inviteCode: user.inviteCode || prev.inviteCode || "",
    providers: user.providers || prev.providers || [],
    emailVerified: user.emailVerified != null ? user.emailVerified : prev.emailVerified,
    providerId: user.providerId || prev.providerId || ""
  };
  if (i >= 0) list[i] = { ...prev, ...row };
  else list.push(row);
  writeList(USERS_KEY, list);
}

let AuthPending = null;
function socialProfiles() {
  try { return JSON.parse(localStorage.getItem(SOCIAL_PROFILES_KEY) || "{}"); } catch { return {}; }
}
function saveSocialProfile(provider, profile) {
  const all = socialProfiles();
  all[provider] = profile;
  localStorage.setItem(SOCIAL_PROFILES_KEY, JSON.stringify(all));
}
function findStudent(email) {
  if (!email) return null;
  return readList(USERS_KEY).find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}
function authSocialHTML() {
  return `<div class="auth-social">
    <button type="button" class="auth-sbtn" data-social="google" aria-label="Continue with Google">${authIcon("google")}<span>Google</span></button>
    <button type="button" class="auth-sbtn" data-social="telegram" aria-label="Continue with Telegram">${authIcon("telegram")}<span>Telegram</span></button>
  </div>
  <p class="auth-or"><span>or</span></p>`;
}
function authIcon(kind) {
  if (kind === "google") return `<svg class="auth-sico" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`;
  if (kind === "facebook") return `<svg class="auth-sico" viewBox="0 0 24 24" aria-hidden="true"><path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.8-4.7 4.54-4.7 1.32 0 2.7.24 2.7.24v2.97h-1.52c-1.5 0-1.96.93-1.96 1.89v2.27h3.34l-.53 3.49h-2.81V24C19.61 23.09 24 18.1 24 12.07z"/></svg>`;
  return `<svg class="auth-sico" viewBox="0 0 24 24" aria-hidden="true"><path fill="#229ED9" d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.5 8.2l-1.65 7.78c-.12.55-.45.68-.9.42l-2.5-1.84-1.2 1.16c-.14.14-.25.25-.51.25l.18-2.54 4.63-4.18c.2-.18-.05-.28-.31-.1l-5.73 3.6-2.47-.77c-.54-.17-.55-.54.11-.8l9.66-3.72c.45-.16.84.11.7.74z"/></svg>`;
}
function referralBits(code) {
  const cookieRef = localStorage.getItem("tradeshalaPendingRef") || "";
  const codeLooksLikeRef = code && (
    (typeof affiliates === "function" && affiliates().some((a) => a.code.toLowerCase() === code.toLowerCase())) ||
    staffList().some((s) => s.referralCode && s.referralCode.toLowerCase() === code.toLowerCase())
  );
  return cookieRef || (codeLooksLikeRef ? code : "");
}
function completeStudentSession(user, message) {
  if (isSuperAdminEmail(user.email)) user.status = "active";
  if (user.status === "pending") {
    toast("Account created. Wait for admin approval before login.");
    closeModals();
    return;
  }
  if (user.status === "blocked" || user.status === "suspended") {
    toast("This account is blocked");
    return;
  }
  setUser({
    name: user.name,
    email: user.email,
    password: user.password || "",
    referredBy: user.referredBy || "",
    providers: user.providers || []
  });
  upsertUser(user);
  closeModals();
  toast(message || "Logged in");
  location.reload();
}
function makeOtp() { return String(Math.floor(100000 + Math.random() * 900000)); }
function saveOtp(email, purpose) {
  const code = makeOtp();
  const row = { email: email.toLowerCase(), code, purpose, exp: Date.now() + 5 * 60 * 1000 };
  sessionStorage.setItem(OTP_STORE_KEY, JSON.stringify(row));
  return code;
}
function readOtp() {
  try { return JSON.parse(sessionStorage.getItem(OTP_STORE_KEY) || "null"); } catch { return null; }
}
function otpDigits() {
  return [...document.querySelectorAll("#otpInputs input")].map((i) => i.value).join("");
}
function paintOtpMail(code, email) {
  const box = document.getElementById("otpMail");
  if (!box) return;
  box.innerHTML = `<div class="gmail-card">
    <div class="gmail-from">Gmail · Inbox</div>
    <p class="gmail-meta">From <b>Bizgarh</b> &lt;desk@bizgarh.com&gt;<br>To ${escapeHtml(email)}</p>
    <h4>Your verification code</h4>
    <p class="gmail-code">${code}</p>
    <p class="muted">This code expires in 5 minutes. Do not share it.</p>
  </div>`;
  box.classList.remove("hidden");
}
function showOtpModal(email, purpose) {
  const code = saveOtp(email, purpose);
  document.getElementById("otpEmailLabel").textContent = email;
  document.getElementById("otpStepCode").classList.remove("hidden");
  document.getElementById("otpStepReset").classList.add("hidden");
  document.querySelectorAll("#otpInputs input").forEach((i) => { i.value = ""; });
  paintOtpMail(code, email);
  openModal("otpModal");
  toast("OTP sent to your Gmail");
  setTimeout(() => document.querySelector("#otpInputs input")?.focus(), 80);
}
function verifyOtpCode() {
  const row = readOtp();
  const typed = otpDigits();
  if (!row || Date.now() > row.exp) { toast("OTP expired. Resend it."); return false; }
  if (typed !== row.code) { toast("Wrong OTP"); return false; }
  sessionStorage.removeItem(OTP_STORE_KEY);
  return true;
}

function startSocial(provider) {
  if (provider === "facebook") {
    toast("Facebook login is not available. Use Google or Telegram.");
    return;
  }
  const next = currentPageName();
  window.BizgarhLoader?.show?.();
  location.href = "/auth/" + encodeURIComponent(provider) + "?next=" + encodeURIComponent(next);
}

function oauthUser(row) {
  if (!row) return null;
  const providers = Array.isArray(row.providers) ? row.providers : (row.providers ? [row.providers] : []);
  return {
    name: row.name,
    email: row.email,
    password: "",
    providers,
    providerId: row.providerId || "",
    emailVerified: true,
    status: row.status || "active",
    created: row.created,
    referredBy: row.referredBy || ""
  };
}

async function consumeOAuth() {
  const params = new URLSearchParams(location.search);
  const err = params.get("oauth_error");
  const ticket = params.get("oauth_ticket");
  if (err) {
    toast(err.replace(/\+/g, " "));
    history.replaceState({}, "", prettyPath());
  }
  if (!ticket) return false;
  history.replaceState({}, "", prettyPath());
  try {
    const res = await fetch("/api/auth/ticket/" + encodeURIComponent(ticket), { credentials: "same-origin" });
    const data = await res.json();
    const user = oauthUser(data.user);
    if (!user) {
      toast(data.error || "OAuth login failed");
      return true;
    }
    completeStudentSession(user, "Logged in with " + (data.provider || providersLabel(user)));
    return true;
  } catch {
    toast("Login could not finish. Try again.");
    return true;
  }
}
function providersLabel(user) {
  return (user.providers && user.providers[0]) || "OAuth";
}
async function restoreOAuthSession() {
  if (getUser()) return;
  try {
    const res = await fetch("/api/me", { credentials: "same-origin" });
    if (!res.ok) return;
    const data = await res.json();
    const user = oauthUser(data.user);
    if (!user) return;
    setUser({ name: user.name, email: user.email, password: "", referredBy: user.referredBy || "", providers: user.providers || [] });
    upsertUser(user);
    location.reload();
  } catch { /* static file server without OAuth */ }
}

function finishSocial(provider, profile) {
  const st = typeof platformSettings === "function" ? platformSettings() : { publicSignup: true };
  let email = (profile.email || "").trim().toLowerCase();
  const name = (profile.name || "").trim();
  let providerId = profile.id || email;
  if (provider === "telegram") {
    const handle = (profile.username || profile.id || "").replace(/^@/, "").trim().toLowerCase();
    if (!handle) { toast("Enter your Telegram username"); return; }
    email = handle + "@telegram.user";
    providerId = handle;
    profile = { ...profile, email, id: handle, username: handle };
  }
  if (!email || !name) { toast("Name and account are required"); return; }
  if (provider === "google" && !email.endsWith("@gmail.com")) {
    toast("Google login needs a Gmail address");
    return;
  }
  saveSocialProfile(provider, { ...profile, email, name, id: providerId });
  const existing = findStudent(email);
  if (existing) {
    const providers = Array.from(new Set([...(existing.providers || []), provider]));
    completeStudentSession({ ...existing, providers, providerId, emailVerified: true }, "Logged in");
    return;
  }
  if (!st.publicSignup && !st.inviteOnly) {
    toast("Public registration is closed. Login if you already have an account.");
    return;
  }
  const code = (document.querySelector("#signupForm [name=code]")?.value || "").trim();
  if (st.inviteOnly || !st.publicSignup) {
    const invite = typeof invites === "function" ? invites().find((i) => i.code.toLowerCase() === code.toLowerCase() && !i.used) : null;
    if (!invite) { toast("A valid invite code is required on the signup form first"); return; }
  }
  const pendingRef = pendingRefSafe(referralBits(code), email);
  const user = {
    name,
    email,
    password: "",
    providers: [provider],
    providerId,
    emailVerified: provider !== "google",
    referredBy: pendingRef,
    referredAt: pendingRef ? new Date().toISOString() : "",
    referralSource: "social_" + provider,
    status: st.requireApproval ? "pending" : "active",
    created: new Date().toISOString()
  };
  if (provider === "google") {
    AuthPending = { kind: "google", user };
    showOtpModal(email, "google");
    return;
  }
  completeStudentSession(user, "Welcome to Bizgarh");
}
function pendingRefSafe(pendingRef, email) {
  const selfStaff = staffList().find((s) => s.email === email);
  if (selfStaff && pendingRef && selfStaff.referralCode && selfStaff.referralCode.toLowerCase() === pendingRef.toLowerCase()) return "";
  const existing = findStudent(email);
  if (existing?.referredBy) return existing.referredBy;
  return pendingRef;
}

function logEnroll(courseId) {
  const u = getUser();
  if (!u) return;
  const list = readList(ALL_ENROLL_KEY);
  if (list.some((x) => x.email === u.email && x.courseId === courseId)) return;
  list.push({ name: u.name, email: u.email, courseId, at: new Date().toISOString() });
  writeList(ALL_ENROLL_KEY, list);
  const course = allCourses().find((c) => c.id === courseId);
  if (course && typeof creditReferral === "function") creditReferral(u, course);
  if (typeof commerceOnEnroll === "function") commerceOnEnroll(u, courseId);
  sendWelcomeMail(courseId);
}

function mailEndpoint(path) {
  return /(?:^|\.)bizgarh\.com$/i.test(location.hostname)
    ? path
    : "https://bizgarh.com" + path;
}

function creatorShareFor(course) {
  const ownerEmail = typeof ownerEmailOf === "function" ? ownerEmailOf(course) : "";
  if (!ownerEmail) return null;
  const staff = (typeof staffList === "function" ? staffList() : []).find((s) => String(s.email || "").toLowerCase() === String(ownerEmail).toLowerCase());
  const rule = staff?.commission || { type: "percent", newSale: 20 };
  const courseRule = (rule.courses || []).find((x) => x.courseId === course.id);
  const shareType = courseRule?.type || rule.type || "percent";
  const shareRate = courseRule ? Number(courseRule.value) : Number(rule.newSale || 20);
  return {
    creatorEmail: ownerEmail,
    creatorName: staff?.name || course.instructor || "",
    shareType,
    shareRate
  };
}

function pingCreatorDigest() {
  const key = "tradeshalaDigestPing";
  const last = localStorage.getItem(key) || "";
  const now = Date.now();
  if (last && now - Number(last) < 30 * 60 * 1000) return;
  fetch(mailEndpoint("/api/digest"), { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })
    .then(() => localStorage.setItem(key, String(now)))
    .catch(() => {});
}

function sendWelcomeMail(courseId) {
  const u = getUser();
  const course = allCourses().find((c) => c.id === courseId);
  if (!u?.email || !course) return;
  const key = "tradeshalaWelcome:" + String(u.email).toLowerCase() + ":" + courseId;
  if (localStorage.getItem(key) === "1") return;
  const share = creatorShareFor(course);
  const amount = Number(course.price || 0);
  fetch(mailEndpoint("/api/welcome"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: u.name,
      email: u.email,
      courseId: course.id,
      title: course.title,
      instructor: course.instructor,
      hours: course.hours,
      lessons: course.lessons,
      amount,
      ...(share || {})
    })
  }).then((r) => {
    if (r.ok) localStorage.setItem(key, "1");
  }).catch(() => {});
}

function extraCourses() { return readList(EXTRA_COURSES_KEY); }
function hiddenCourseIds() { return readList(HIDDEN_COURSES_KEY); }
function courseEdits() {
  try { return JSON.parse(localStorage.getItem(COURSE_EDITS_KEY) || "{}"); } catch { return {}; }
}
function setCourseEdits(map) { localStorage.setItem(COURSE_EDITS_KEY, JSON.stringify(map)); }
function applyCoursePatch(id, fields) {
  const extra = extraCourses();
  const i = extra.findIndex((c) => c.id === id);
  if (i >= 0) {
    extra[i] = { ...extra[i], ...fields };
    writeList(EXTRA_COURSES_KEY, extra);
    return;
  }
  const edits = courseEdits();
  edits[id] = { ...(edits[id] || {}), ...fields };
  setCourseEdits(edits);
}
function allCourses() {
  const hidden = hiddenCourseIds();
  const edits = courseEdits();
  return COURSES.filter((c) => !hidden.includes(c.id))
    .map((c) => ({ ...c, ...(edits[c.id] || {}) }))
    .concat(extraCourses());
}
function formatLiveWhen(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}
function seedLiveClasses() {
  if (localStorage.getItem("tradeshalaLivesSeeded")) return;
  const seed = [
    { id: "w1", title: "Gap & Go for Nifty Options", by: "Aarav Mehta", at: "2026-09-18T11:00:00" },
    { id: "w2", title: "Defined-Risk Credit Spreads", by: "Neha Kapoor", at: "2026-09-20T20:00:00" },
    { id: "w3", title: "Reading Weekly Structure", by: "Vikram Singh", at: "2026-09-22T19:30:00" }
  ].map((w) => ({
    ...w,
    hostEmail: w.by.split(" ")[0].toLowerCase() + "@bizgarh.in",
    when: formatLiveWhen(w.at),
    duration: "60 min",
    joinUrl: "",
    notes: "Live market session with Q&A.",
    status: "scheduled"
  }));
  writeList(LIVE_KEY, seed);
  localStorage.setItem("tradeshalaLivesSeeded", "1");
}
function allWebinars() {
  seedLiveClasses();
  return readList(LIVE_KEY);
}
function saveWebinars(list) { writeList(LIVE_KEY, list); }
function updateLive(id, patch) {
  const list = allWebinars();
  const i = list.findIndex((x) => x.id === id);
  if (i < 0) return null;
  list[i] = { ...list[i], ...patch };
  saveWebinars(list);
  return list[i];
}
function getStaffSession() {
  try { return JSON.parse(localStorage.getItem(STAFF_SESSION_KEY) || "null"); } catch { return null; }
}
function setStaffSession(staff) { localStorage.setItem(STAFF_SESSION_KEY, JSON.stringify(staff)); }
function clearStaffSession() { localStorage.removeItem(STAFF_SESSION_KEY); }
function staffList() { return readList(STAFF_KEY); }
function courseOwners() {
  try { return JSON.parse(localStorage.getItem(COURSE_OWNERS_KEY) || "{}"); } catch { return {}; }
}
function setCourseOwners(map) { localStorage.setItem(COURSE_OWNERS_KEY, JSON.stringify(map)); }
function ownerEmailOf(course) {
  if (course.ownerEmail) return course.ownerEmail;
  const map = courseOwners();
  if (map[course.id]) return map[course.id];
  const staff = staffList().find((s) => s.name === course.instructor && (s.role === "creator" || s.creatorEnabled || s.role === "subadmin"));
  return staff?.email || "";
}
(function mergeExtraCovers() {
  extraCourses().forEach((c) => {
    if (!COVERS[c.cover]) COVERS[c.cover] = { bg: "linear-gradient(135deg,#4f46e5,#1e1b4b)", title: (c.title || "COURSE").slice(0, 14).toUpperCase(), sub: c.instructor || "Bizgarh" };
  });
})();

function toast(text) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2200);
}

function savePct(c) {
  const price = Number(c.price);
  const old = Number(c.old);
  if (!old || !price || old <= price) return 0;
  return Math.round((1 - price / old) * 100);
}

function courseCard(c, extra = "") {
  const art = COVERS[c.cover] || { bg: "linear-gradient(135deg,#4f46e5,#1e1b4b)", title: c.title, sub: c.instructor };
  const photo = photoFor(c.instructor);
  const href = `/course?id=${c.id}`;
  const pct = savePct(c);
  const rupee = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
  const priceRow = `<div class="price">${rupee(c.price)}${c.old ? ` <s>${rupee(c.old)}</s>` : ""}${pct ? ` <span class="save">SAVE ${pct}%</span>` : ""}</div>`;
  return `<a class="course-card ${extra}" href="${href}">
    <div class="thumb" style="background:${art.bg}">
      <img class="person" src="${photo}" alt="">
      <div class="cover-copy"><h3>${art.title}</h3></div>
      <span class="brand-badge" aria-hidden="true">${brandMarkSVG()}</span>
    </div>
    <div class="course-body">
      <div class="course-head">
        <div class="course-title">${c.title}</div>
        <span class="star">★ ${c.rating || "4.8"}</span>
      </div>
      <div class="meta">${c.learners || "New"} learners • by ${c.instructor}</div>
      ${priceRow}
    </div>
  </a>`;
}

function renderCourses(target, filter = "trending", asGrid = false, query = "") {
  const el = document.querySelector(target);
  if (!el) return;
  let list = allCourses().filter((c) => {
    const q = query.toLowerCase();
    const matchQ = !q || c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q);
    const matchF = filter === "all" || c.cat === filter;
    return matchQ && matchF;
  });
  if (!list.length && filter !== "all" && query) list = allCourses().filter((c) => !query);
  el.innerHTML = list.length
    ? list.map((c) => courseCard(c, asGrid ? "grid-card" : "")).join("")
    : `<div class="empty">No courses match this filter.</div>`;
}

function liveMegaHTML() {
  const cards = allWebinars().filter((w) => w.status !== "ended").slice(0, 3).map((w, i) => `
    <a class="mega-web" href="/live#webinars">
      ${webinarBannerHTML(w, i)}
      <div class="mega-web-meta">
        <small>${w.when}</small>
        <b>${w.title}</b>
        <span>by ${w.by}</span>
      </div>
    </a>`).join("");
  return `
    <div class="dropdown mega-live">
      <div class="mega-left">
        <a href="/live#webinars">
          <span class="mega-ico">${iconSvg("wifi")}</span>
          <span><strong>Webinars</strong><em>Value packed interactive sessions led by expert traders</em></span>
        </a>
        <a href="/live#mentorship">
          <span class="mega-ico">${iconSvg("users")}</span>
          <span><strong>Mentorship Programs</strong><em>Learn from training and online sessions with stock market experts</em></span>
        </a>
        <a href="/live#call">
          <span class="mega-ico">${iconSvg("headset")}</span>
          <span><strong>1:1 Guidance</strong><em>Guidance calls with experts to discuss strategy, setups, and risk</em></span>
        </a>
      </div>
      <div class="mega-right">
        <div class="mega-kicker">Upcoming live webinars</div>
        <div class="mega-webs">${cards}</div>
        <a class="btn btn-primary" href="/live">View All Webinars →</a>
      </div>
    </div>`;
}

function headerAuthHTML(place) {
  const user = getUser();
  if (!user) {
    return `<button class="btn btn-ghost" type="button" data-open="loginModal">Login</button><button class="btn btn-primary" type="button" data-open="signupModal">Sign Up</button>`;
  }
  const first = escapeHtml(user.name.split(" ")[0]);
  const role = staffAccessRole(user.email);
  if (!role) {
    return `<a class="btn btn-ghost" href="/dashboard">Hi, ${first}</a><button class="btn btn-ghost js-logout" type="button">Logout</button>`;
  }
  if (place === "mobile") {
    return `<a class="btn btn-ghost" href="/dashboard">Hi, ${first}</a>
      <a class="btn btn-primary js-open-admin" href="/admin">Admin panel</a>
      <button class="btn btn-ghost js-logout" type="button">Logout</button>`;
  }
  return `<div class="acct-wrap">
    <button class="btn btn-ghost acct-btn" type="button" aria-haspopup="true" aria-expanded="false">Hi, ${first} <span class="acct-caret" aria-hidden="true">▾</span></button>
    <div class="acct-menu" role="menu">
      <a href="/dashboard">My learning</a>
      <a class="js-open-admin" href="/admin">Admin panel</a>
      <button type="button" class="js-logout">Logout</button>
    </div>
  </div>`;
}

function headerHTML() {
  const authDesk = headerAuthHTML("desk");
  const authMobile = headerAuthHTML("mobile");
  const courseLinks = CATEGORIES.map((c) => `
    <a href="/courses?cat=${courseFilterFromCat(c.id)}#library">
      <span class="mega-ico" style="background:${c.tint};color:${c.color}">${iconSvg(c.icon)}</span>
      ${c.title}
    </a>`).join("");
  return `
  <header class="header">
    <div class="container header-inner">
      <a class="logo" href="/">${brandLogoHTML("h")}</a>
      <nav class="nav">
        <div class="nav-item mega">
          <a class="nav-link" href="/courses">Courses</a>
          <div class="dropdown mega-courses">${courseLinks}</div>
        </div>
        <div class="nav-item mega">
          <a class="nav-link" href="/live">Live <i class="live-dot-nav"></i></a>
          ${liveMegaHTML()}
        </div>
        <a class="nav-link" href="/reviews">Reviews</a>
        <a class="nav-link" href="/about">About</a>
      </nav>
      <form class="search-wrap" id="searchForm">
        <input id="searchInput" placeholder="Search courses, mentors..." autocomplete="off">
        <button class="search-btn" type="submit" aria-label="Search">⌕</button>
        <div class="search-panel" id="searchPanel"><div id="searchResults"></div></div>
      </form>
      <div class="header-actions" id="headerActions">${authDesk}</div>
      <button class="menu-toggle" id="menuToggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobileNav">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>
  <div class="nav-scrim" id="navScrim"></div>
  <nav class="mobile-nav" id="mobileNav" aria-label="Menu">
    <form class="mnav-search" id="mobileSearchForm">
      <input id="mobileSearchInput" type="search" placeholder="Search courses, mentors..." autocomplete="off" enterkeyhint="search">
      <button type="submit" aria-label="Search">⌕</button>
    </form>
    <a href="/courses">Courses</a>
    <a href="/live">Live classes</a>
    <a href="/reviews">Reviews</a>
    <a href="/about">About</a>
    <a href="/dashboard">My learning</a>
    <a href="/contact">Contact</a>
    <div class="mnav-auth">${authMobile}</div>
  </nav>`;
}

function footerHTML() {
  return `
  <footer class="footer">
    <div class="container">
      <div class="footer-main">
        <div class="footer-brand">
          <a class="logo" href="/">${brandLogoHTML()}</a>
          <p>A classroom for Indian traders and long-term investors. Setups, risk, and process — not a tip feed.</p>
          <a class="footer-mail" href="mailto:desk@bizgarh.com">desk@bizgarh.com</a>
        </div>
        <nav class="footer-nav" aria-label="Footer">
          <div>
            <h4>Classroom</h4>
            <a href="/courses">All courses</a>
            <a href="/live">Live rooms</a>
            <a href="/live#mentorship">Mentorship</a>
            <a href="/courses?cat=hindi">Hindi library</a>
          </div>
          <div>
            <h4>Company</h4>
            <a href="/about">About</a>
            <a href="/reviews">Reviews</a>
            <a href="/contact">Contact</a>
            <a href="/dashboard">My learning</a>
          </div>
        </nav>
      </div>
      <div class="footer-bottom">
        <p>© 2026 Bizgarh Learning Pvt Ltd</p>
        <p>Educational content only. Not investment advice.</p>
      </div>
    </div>
  </footer>
  <div class="overlay" id="loginModal">
    <form class="modal auth-modal" id="loginForm">
      <button type="button" class="close-x" data-close>×</button>
      <h3>Welcome back</h3>
      <p class="muted">Login to continue your lessons.</p>
      ${authSocialHTML()}
      <div class="field"><label>Email</label><input name="email" type="email" required></div>
      <div class="field"><label>Password</label><input name="password" type="password" required minlength="4"></div>
      <div class="auth-forgot-row"><button type="button" data-open="forgotModal">Forgot password?</button></div>
      <button class="btn btn-primary btn-block btn-shine">Login</button>
      <div class="switch">New here? <button type="button" data-open="signupModal">Create account</button></div>
    </form>
  </div>
  <div class="overlay" id="signupModal">
    <form class="modal auth-modal" id="signupForm">
      <button type="button" class="close-x" data-close>×</button>
      <h3>Join Bizgarh</h3>
      <p class="muted">Create an account to enroll and track progress.</p>
      ${authSocialHTML()}
      <div class="field"><label>Name</label><input name="name" required></div>
      <div class="field"><label>Email</label><input name="email" type="email" required placeholder="you@gmail.com"></div>
      <div class="field"><label>Password</label><input name="password" type="password" required minlength="4"></div>
      <div class="field" id="inviteFieldWrap"><label>Invite / affiliate code</label><input name="code" placeholder="Optional unless invite-only"></div>
      <p class="muted" id="signupNote"></p>
      <button class="btn btn-primary btn-block btn-shine">Send Gmail OTP</button>
      <div class="switch">Already have an account? <button type="button" data-open="loginModal">Login</button></div>
    </form>
  </div>
  <div class="overlay" id="forgotModal">
    <form class="modal auth-modal" id="forgotForm">
      <button type="button" class="close-x" data-close>×</button>
      <h3>Forgot password</h3>
      <p class="muted">We will send a Gmail OTP to reset it.</p>
      <div class="field"><label>Email</label><input name="email" type="email" required></div>
      <button class="btn btn-primary btn-block">Send OTP</button>
      <div class="switch"><button type="button" data-open="loginModal">Back to login</button></div>
    </form>
  </div>
  <div class="overlay" id="otpModal">
    <form class="modal auth-modal" id="otpForm">
      <button type="button" class="close-x" data-close>×</button>
      <div id="otpStepCode">
        <h3>Verify OTP</h3>
        <p class="muted">Enter the 6-digit code sent to <strong id="otpEmailLabel"></strong></p>
        <div class="otp-row" id="otpInputs">
          <input maxlength="1" inputmode="numeric" autocomplete="one-time-code">
          <input maxlength="1" inputmode="numeric">
          <input maxlength="1" inputmode="numeric">
          <input maxlength="1" inputmode="numeric">
          <input maxlength="1" inputmode="numeric">
          <input maxlength="1" inputmode="numeric">
        </div>
        <button class="btn btn-primary btn-block" type="submit">Verify & continue</button>
        <div class="auth-otp-actions">
          <button type="button" id="otpResend">Resend OTP</button>
        </div>
        <div id="otpMail"></div>
      </div>
      <div id="otpStepReset" class="hidden">
        <h3>Set a new password</h3>
        <div class="field"><label>New password</label><input name="password" type="password" minlength="4"></div>
        <button class="btn btn-primary btn-block" type="button" id="otpSavePass">Update password</button>
      </div>
    </form>
  </div>
  <div class="overlay" id="socialModal">
    <form class="modal auth-modal" id="socialForm">
      <button type="button" class="close-x" data-close>×</button>
      <h3 id="socialTitle">Continue</h3>
      <p class="muted" id="socialEmailHint"></p>
      <input type="hidden" name="provider">
      <div class="field"><label>Name</label><input name="name" required></div>
      <div class="field" id="socialEmailWrap"><label>Email</label><input name="email" type="email" placeholder="you@gmail.com"></div>
      <div class="field hidden" id="socialUserWrap"><label>Telegram username</label><input name="username" placeholder="@yourid"></div>
      <button class="btn btn-primary btn-block">Continue</button>
    </form>
  </div>
  <button class="to-top" id="toTop">↑</button>`;
}

function setMobileNav(open) {
  const nav = document.getElementById("mobileNav");
  const btn = document.getElementById("menuToggle");
  const scrim = document.getElementById("navScrim");
  nav?.classList.toggle("open", open);
  scrim?.classList.toggle("open", open);
  btn?.classList.toggle("open", open);
  btn?.setAttribute("aria-expanded", open ? "true" : "false");
  btn?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.classList.toggle("nav-open", open);
}

function bindChrome() {
  document.getElementById("menuToggle")?.addEventListener("click", () => {
    setMobileNav(!document.getElementById("mobileNav")?.classList.contains("open"));
  });
  document.getElementById("navScrim")?.addEventListener("click", () => setMobileNav(false));
  document.getElementById("mobileNav")?.addEventListener("click", (e) => {
    if (e.target.closest("a, [data-open], .js-logout, .js-open-admin, button[type=submit]")) {
      setMobileNav(false);
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      setMobileNav(false);
      closeModals();
      document.querySelectorAll(".acct-wrap").forEach((el) => el.classList.remove("open"));
    }
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) setMobileNav(false);
  });
  document.querySelectorAll(".nav-item.mega").forEach((item) => {
    item.addEventListener("mouseenter", () => document.body.classList.add("nav-dim"));
    item.addEventListener("mouseleave", () => document.body.classList.remove("nav-dim"));
  });
  document.body.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-open]");
    if (opener) openModal(opener.dataset.open);
    if (e.target.closest("[data-close]")) closeModals();
    const social = e.target.closest("[data-social]");
    if (social) {
      e.preventDefault();
      startSocial(social.dataset.social);
    }
    if (e.target.closest(".js-open-admin")) {
      e.preventDefault();
      openAdminDesk();
      return;
    }
    const acctBtn = e.target.closest(".acct-btn");
    if (acctBtn) {
      const wrap = acctBtn.closest(".acct-wrap");
      const open = !wrap.classList.contains("open");
      document.querySelectorAll(".acct-wrap").forEach((el) => {
        el.classList.remove("open");
        el.querySelector(".acct-btn")?.setAttribute("aria-expanded", "false");
      });
      wrap.classList.toggle("open", open);
      acctBtn.setAttribute("aria-expanded", open ? "true" : "false");
      return;
    }
    if (!e.target.closest(".acct-wrap")) {
      document.querySelectorAll(".acct-wrap").forEach((el) => {
        el.classList.remove("open");
        el.querySelector(".acct-btn")?.setAttribute("aria-expanded", "false");
      });
    }
    if (e.target.closest(".js-logout")) {
      localStorage.removeItem(USER_KEY);
      clearStaffSession();
      fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
      toast("Logged out");
      location.href = "/";
    }
  });
  document.querySelectorAll(".overlay").forEach((o) => o.addEventListener("click", (e) => { if (e.target === o) closeModals(); }));

  const search = document.getElementById("searchInput");
  const panel = document.getElementById("searchPanel");
  const goSearch = (q) => { location.href = q ? `/courses?q=${encodeURIComponent(q)}` : "/courses"; };
  document.getElementById("searchForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    goSearch(search?.value.trim());
  });
  document.getElementById("mobileSearchForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    setMobileNav(false);
    goSearch(document.getElementById("mobileSearchInput")?.value.trim());
  });
  search?.addEventListener("focus", () => panel?.classList.add("open"));
  document.addEventListener("click", (e) => { if (!e.target.closest(".search-wrap")) panel?.classList.remove("open"); });
  search?.addEventListener("input", () => {
    const q = search.value.toLowerCase();
    const hits = allCourses().filter((c) => c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q)).slice(0, 6);
    document.getElementById("searchResults").innerHTML = hits.map((c) => `<a href="/course?id=${c.id}">${c.title}</a>`).join("") || "<a>No matches</a>";
  });

  document.getElementById("loginForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim().toLowerCase();
    const password = e.target.password.value;
    const found = readList(USERS_KEY).find((u) => u.email.toLowerCase() === email && u.password && u.password === password);
    const saved = getUser();
    const match = found || (saved && saved.email.toLowerCase() === email && saved.password === password ? saved : null);
    if (!match) {
      toast("Wrong email or password");
      return;
    }
    if (match.status === "pending") {
      toast("This account is waiting for admin approval");
      return;
    }
    if (match.status === "blocked") {
      toast("This account is blocked");
      return;
    }
    setUser({ name: match.name, email: match.email, password: match.password || password, referredBy: match.referredBy });
    upsertUser(match);
    closeModals();
    toast("Logged in");
    location.reload();
  });
  document.getElementById("signupForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const st = typeof platformSettings === "function" ? platformSettings() : { publicSignup: true };
    const code = (e.target.code?.value || "").trim();
    if (!st.publicSignup && !st.inviteOnly) {
      toast("Public registration is closed. Ask an admin for an invite.");
      return;
    }
    let invite = null;
    if (st.inviteOnly || (!st.publicSignup)) {
      invite = typeof invites === "function" ? invites().find((i) => i.code.toLowerCase() === code.toLowerCase() && !i.used) : null;
      if (!invite) {
        toast("A valid invite code is required");
        return;
      }
      if (invite.email && invite.email !== e.target.email.value.trim().toLowerCase()) {
        toast("This invite is locked to another email");
        return;
      }
    }
    const email = e.target.email.value.trim().toLowerCase();
    if (!email.endsWith("@gmail.com")) {
      toast("Sign up with a Gmail address. We send the OTP there.");
      return;
    }
    if (findStudent(email)) {
      toast("This email already has an account. Login instead.");
      openModal("loginModal");
      return;
    }
    const pendingRef = pendingRefSafe(referralBits(code), email);
    AuthPending = {
      kind: "signup",
      invite,
      user: {
        name: e.target.name.value.trim(),
        email,
        password: e.target.password.value,
        referredBy: pendingRef,
        referredAt: pendingRef ? new Date().toISOString() : "",
        referralSource: pendingRef ? "signup" : "direct",
        inviteCode: invite?.code || "",
        invitedBy: invite?.createdBy || "",
        providers: ["email"],
        emailVerified: false,
        status: st.requireApproval ? "pending" : "active"
      }
    };
    showOtpModal(email, "signup");
  });

  document.getElementById("forgotForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim().toLowerCase();
    const user = findStudent(email);
    if (!user) { toast("No account found for this email"); return; }
    if (!user.password) {
      toast("This account uses Google / Facebook / Telegram. Continue with that instead.");
      openModal("loginModal");
      return;
    }
    AuthPending = { kind: "reset", email };
    showOtpModal(email, "reset");
  });

  document.getElementById("otpForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (AuthPending?.kind === "reset" && !document.getElementById("otpStepReset")?.classList.contains("hidden")) {
      document.getElementById("otpSavePass")?.click();
      return;
    }
    if (!verifyOtpCode()) return;
    if (!AuthPending) { toast("Start again"); return; }
    if (AuthPending.kind === "reset") {
      document.getElementById("otpStepCode").classList.add("hidden");
      document.getElementById("otpStepReset").classList.remove("hidden");
      document.querySelector("#otpStepReset [name=password]")?.focus();
      return;
    }
    const user = { ...AuthPending.user, emailVerified: true };
    if (AuthPending.invite && typeof invites === "function") {
      writeList(INVITE_KEY, invites().map((i) => i.code === AuthPending.invite.code ? { ...i, used: true } : i));
    }
    AuthPending = null;
    completeStudentSession(user, user.providers?.includes("google") ? "Google account verified" : "Welcome to Bizgarh");
  });

  document.getElementById("otpSavePass")?.addEventListener("click", () => {
    const pass = document.querySelector("#otpStepReset [name=password]")?.value || "";
    if (pass.length < 4) { toast("Password must be at least 4 characters"); return; }
    const email = AuthPending?.email;
    const user = findStudent(email);
    if (!user) { toast("Account not found"); return; }
    upsertUser({ ...user, password: pass });
    AuthPending = null;
    completeStudentSession({ ...user, password: pass }, "Password updated");
  });

  document.getElementById("otpResend")?.addEventListener("click", () => {
    const email = document.getElementById("otpEmailLabel")?.textContent;
    if (!email) return;
    const purpose = readOtp()?.purpose || AuthPending?.kind || "signup";
    showOtpModal(email, purpose);
  });

  const otpBox = document.getElementById("otpInputs");
  otpBox?.addEventListener("input", (e) => {
    const input = e.target;
    if (!(input instanceof HTMLInputElement)) return;
    input.value = input.value.replace(/\D/g, "").slice(0, 1);
    if (input.value && input.nextElementSibling) input.nextElementSibling.focus();
    if (otpDigits().length === 6) document.getElementById("otpForm")?.requestSubmit();
  });
  otpBox?.addEventListener("keydown", (e) => {
    const input = e.target;
    if (e.key === "Backspace" && input instanceof HTMLInputElement && !input.value && input.previousElementSibling) {
      input.previousElementSibling.focus();
    }
  });
  otpBox?.addEventListener("paste", (e) => {
    const text = (e.clipboardData?.getData("text") || "").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    [...otpBox.querySelectorAll("input")].forEach((el, i) => { el.value = text[i] || ""; });
    if (text.length === 6) document.getElementById("otpForm")?.requestSubmit();
  });

  document.getElementById("socialForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    finishSocial(f.provider.value, {
      name: f.name.value.trim(),
      email: f.email.value.trim().toLowerCase(),
      username: f.username.value.trim(),
      id: f.username.value.replace(/^@/, "").trim().toLowerCase() || f.email.value.trim().toLowerCase()
    });
  });

  document.getElementById("toTop")?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", () => document.getElementById("toTop")?.classList.toggle("show", window.scrollY > 500));
}

function openModal(id) {
  closeModals();
  setMobileNav(false);
  document.getElementById(id)?.classList.add("open");
  document.body.classList.add("modal-open");
}
function closeModals() {
  document.querySelectorAll(".overlay").forEach((o) => o.classList.remove("open"));
  document.body.classList.remove("modal-open");
}

function requireAuth(next) {
  if (getUser()) return next();
  const st = typeof platformSettings === "function" ? platformSettings() : { publicSignup: true };
  if (!st.publicSignup) {
    openModal("loginModal");
    toast("Registration is invite-only. Login if you already have an account.");
    return;
  }
  openModal("signupModal");
  toast("Create an account to continue");
}

function unlockCourse(id, opts = {}) {
  const ids = enrolled();
  if (!ids.includes(id)) {
    ids.push(id);
    setEnrolled(ids);
    logEnroll(id);
  }
  if (!opts.silent) toast("Classroom unlocked on this page");
  const here = document.getElementById("courseDetail");
  const current = new URLSearchParams(location.search).get("id");
  if (here && current === id) {
    if (!opts.skipRender) {
      renderCoursePage();
      document.getElementById("learnRoot")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      sessionStorage.setItem("tradeshalaScrollPlayer", "1");
    }
    return;
  }
  location.href = `/course?id=${id}`;
}

function consumePendingBuy() {
  if (!getUser()) return;
  const id = sessionStorage.getItem("tradeshalaPendingBuy");
  if (!id) return;
  sessionStorage.removeItem("tradeshalaPendingBuy");
  const here = document.getElementById("courseDetail");
  const current = new URLSearchParams(location.search).get("id");
  if (here && current === id) {
    unlockCourse(id, { silent: false, skipRender: true });
    return;
  }
  unlockCourse(id);
}

function enroll(id) {
  sessionStorage.setItem("tradeshalaPendingBuy", id);
  requireAuth(() => {
    sessionStorage.removeItem("tradeshalaPendingBuy");
    unlockCourse(id);
  });
}

function webinarCardHTML(w, i) {
  return `
    <article class="course-card webinar-card">
      ${webinarBannerHTML(w, i)}
      <div class="date">${w.when}</div>
      <div class="course-title" style="padding:0 14px">${w.title}</div>
      <p class="muted" style="padding:0 14px">by ${w.by}</p>
      ${liveActionBtn(w)}
    </article>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
}

function allReviews() {
  return Array.isArray(window.REVIEWS) ? window.REVIEWS : [];
}

function reviewCardHTML(r) {
  const stars = "★".repeat(r.stars) + "☆".repeat(5 - r.stars);
  const fb = `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&background=eef2ff&color=4f46e5&size=128`;
  return `<article class="review-card">
    <div class="review-top"><span class="review-stars">${stars}</span><small>${escapeHtml(r.when || "")}</small></div>
    <p>${escapeHtml(r.text)}</p>
    <div class="reviewer">
      <img src="${r.photo}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${fb}'">
      <div><strong>${escapeHtml(r.name)}</strong><span class="muted">${escapeHtml(r.city)} · ${escapeHtml(r.course)}</span></div>
    </div>
  </article>`;
}

function renderHomeReviews() {
  const host = document.getElementById("reviewMarquee");
  if (!host) return;
  const list = allReviews();
  if (!list.length) return;
  const row1 = list.slice(0, 24);
  const row2 = list.slice(24, 48);
  const paint = (rows) => rows.concat(rows).map(reviewCardHTML).join("");
  host.innerHTML = `
    <div class="review-row"><div class="review-track">${paint(row1)}</div></div>
    <div class="review-row reverse"><div class="review-track">${paint(row2)}</div></div>`;
}

function renderReviewsPage() {
  const grid = document.getElementById("reviewsGrid");
  if (!grid) return;
  const list = allReviews();
  const summary = document.getElementById("reviewsSummary");
  const avg = list.length ? (list.reduce((s, r) => s + r.stars, 0) / list.length).toFixed(1) : "0";
  if (summary) summary.textContent = `${list.length} reviews · ${avg} average from desks across India.`;
  let filter = "all";
  let q = "";
  let shown = 18;
  const filtered = () => list.filter((r) => {
    if (filter === "5" && r.stars !== 5) return false;
    if (filter === "4" && r.stars !== 4) return false;
    if (filter === "3" && r.stars > 3) return false;
    if (filter === "hi" && r.lang === "en") return false;
    if (filter === "en" && r.lang !== "en") return false;
    if (q) {
      const hay = `${r.name} ${r.city} ${r.course} ${r.text}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const paint = () => {
    const rows = filtered();
    grid.innerHTML = rows.slice(0, shown).map(reviewCardHTML).join("") || `<div class="empty">No reviews match that filter.</div>`;
    const more = document.getElementById("loadMoreReviews");
    if (more) more.style.display = shown >= rows.length ? "none" : "inline-flex";
  };
  document.getElementById("reviewFilters")?.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-rev]");
    if (!chip) return;
    document.querySelectorAll("#reviewFilters .chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    filter = chip.dataset.rev;
    shown = 18;
    paint();
  });
  document.getElementById("reviewSearch")?.addEventListener("input", (e) => {
    q = e.target.value.trim().toLowerCase();
    shown = 18;
    paint();
  });
  document.getElementById("loadMoreReviews")?.addEventListener("click", () => {
    shown += 18;
    paint();
  });
  paint();
}

function bindExploreTiles() {
  /* Hover motion is CSS-only so the homepage stays light. */
}

function applyCourseFilter(cat, query, scroll) {
  const filter = courseFilterFromCat(cat);
  document.querySelectorAll(".filters .chip").forEach((c) => c.classList.toggle("active", c.dataset.filter === filter));
  document.querySelectorAll(".cat-card").forEach((a) => {
    a.classList.toggle("on", a.dataset.cat === cat || (a.dataset.cat !== "cert" && courseFilterFromCat(a.dataset.cat) === filter && filter !== "all"));
  });
  renderCourses("#allCoursesGrid", filter, true, query || "");
  if (scroll) document.getElementById("courseLibrary")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function bindCourseLibrary() {
  const grid = document.getElementById("allCoursesGrid");
  if (!grid) return;
  const params = new URLSearchParams(location.search);
  const q = params.get("q") || "";
  const cat = params.get("cat") || "all";
  if (q) {
    const si = document.getElementById("searchInput");
    if (si) si.value = q;
  }
  applyCourseFilter(cat, q, false);
  document.querySelector("[data-cat-grid]")?.addEventListener("click", (e) => {
    const a = e.target.closest("a.cat-card");
    if (!a) return;
    e.preventDefault();
    const next = courseFilterFromCat(a.dataset.cat);
    history.pushState({ cat: next }, "", `/courses?cat=${encodeURIComponent(next)}#library`);
    applyCourseFilter(a.dataset.cat, q, true);
  });
  document.querySelectorAll(".filters .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const next = chip.dataset.filter;
      history.pushState({ cat: next }, "", `/courses?cat=${encodeURIComponent(next)}#library`);
      applyCourseFilter(next, q, true);
    });
  });
  window.addEventListener("popstate", () => {
    const p = new URLSearchParams(location.search);
    applyCourseFilter(p.get("cat") || "all", p.get("q") || "", false);
  });
  if (params.get("cat") || location.hash === "#library") {
    document.getElementById("courseLibrary")?.scrollIntoView({ behavior: "auto", block: "start" });
  }
}

function renderHomeExtras() {
  const mentorTrack = document.getElementById("mentorTrack");
  if (mentorTrack) {
    mentorTrack.innerHTML = MENTORS.map((m) => `
      <a class="mentor-card" href="/courses">
        <div class="mentor-photo"><img src="${m.img}" alt="${m.name}"></div>
        <h3>${m.name}</h3><p>${m.role}</p><span class="pill">${m.tag}</span>
      </a>`).join("");
  }
  const web = document.getElementById("webinarTrack");
  if (web) {
    web.innerHTML = allWebinars().filter((w) => w.status !== "ended").map((w, i) => webinarCardHTML(w, i)).join("");
  }
  document.querySelectorAll("[data-cat-grid]").forEach((el) => { el.innerHTML = categoryCardsHTML(); });
  const pageWeb = document.getElementById("courseWebinars");
  if (pageWeb) {
    pageWeb.innerHTML = allWebinars().filter((w) => w.status !== "ended").slice(0, 3).map((w, i) => webinarCardHTML(w, i)).join("");
  }
}

function catLabel(cat) {
  return CATEGORIES.find((x) => x.id === cat)?.title || (cat === "trending" ? "Popular" : "Course");
}

function courseLevel(c) {
  if (c.cat === "beginners" || c.cat === "hindi") return "Beginner Level";
  if (c.cat === "options" || c.cat === "strategy" || c.cat === "ta") return "Intermediate Level";
  return "All Levels";
}

function courseLangs(c) {
  return c.cat === "hindi" ? ["Hindi", "English"] : ["English", "Hindi"];
}

function learnPoints(c) {
  const pack = {
    options: ["A complete map of option buying vs selling", "How to pick strikes without guessing", "Defined invalidation before you click buy", "Risk and capital rules for weekly trading", "The psychology to skip a weak setup"],
    investing: ["How to think in years, not tips", "A simple SIP and allocation routine", "How to judge a fund or stock without noise", "Rebalancing without over-trading", "A journal for long-term decisions"],
    beginners: ["How Indian markets actually work", "What to ignore in your first 30 days", "How to read a basic chart", "Position size that will not wreck you", "A weekly review you can keep"],
    ta: ["Candlesticks in context, not isolation", "Support, resistance and market structure", "When a level is real vs wishful", "A checklist before you trade the chart", "Common indicator clutter to drop"],
    hindi: ["चार्ट पढ़ने की साफ भाषा", "सेटअप चुनने का छोटा चेकलिस्ट", "जोखिम और साइज़ की आसान रीत", "इंडिकेटर के बिना लेवल देखना", "हफ्ते का रिव्यु कैसे लिखें"],
    crypto: ["Spot vs leverage — what to skip", "Position size on a volatile book", "How to read a crypto chart without hype", "A simple invalidation rule", "Keeping a journal when feeds are loud"],
    strategy: ["A written system you can repeat", "Entry, stop and target in one page", "When the setup is absent", "How to review a week of trades", "Keeping size boring on purpose"],
    trending: ["How the setup is chosen on a live tape", "Entry, invalidation and targets", "Position sizing you can actually follow", "A simple journal template", "Common mistakes to skip this week"]
  };
  return pack[c.cat] || pack.trending;
}

function courseOverview(c) {
  return [
    { t: "Introduction", m: "4 min", items: [`Meet ${c.instructor}`, "How this classroom is structured"] },
    { t: "Core ideas", m: "12 min", items: ["What we will practise this week", "What we will not do"] },
    { t: "The setup", m: "18 min", items: ["Selection checklist on a chart", "Entry, invalidation, targets"] },
    { t: "Risk & journal", m: "10 min", items: ["Position sizing you can follow", "A journal template walkthrough"] },
    { t: "Managing trades", m: "8 min", items: ["When to hold, cut, or skip", "A weekly review"] }
  ];
}

function curriculumFromLessons(c) {
  const lessons = lessonsFor(c.id);
  const titles = ["Introduction", "Core ideas", "The setup", "Risk & journal", "Managing trades"];
  const sections = [];
  for (let i = 0; i < lessons.length; i += 3) {
    const slice = lessons.slice(i, i + 3);
    const gi = Math.floor(i / 3);
    sections.push({
      t: titles[gi] || `Section ${String(gi + 1).padStart(2, "0")}`,
      m: `${slice.length} lesson${slice.length === 1 ? "" : "s"}`,
      items: slice.map((l, j) => ({ t: l.t, dur: l.dur, lesson: i + j }))
    });
  }
  return sections;
}

function courseOverviewCardHTML(c, playable) {
  const sections = playable
    ? curriculumFromLessons(c)
    : courseOverview(c).map((s) => ({
        t: s.t,
        m: s.m,
        items: s.items.map((t) => ({ t }))
      }));
  const topicCount = playable ? lessonsFor(c.id).length : c.lessons;
  return `
        <section class="cd-card cd-overview-card" id="courseOverview">
          <div class="cd-ov-head">
            <h2>Your Course Overview</h2>
            <p class="cd-ov-meta">
              <span>${sections.length} sections</span>
              <span>${topicCount} topics</span>
              <span>${c.hours} hrs content</span>
            </p>
          </div>
          <div class="cd-overview">
            ${sections.map((s, i) => `
              <div class="cd-sec ${playable || i === 0 ? "open" : ""}" style="--i:${i}">
                <button type="button" class="cd-sec-h" aria-expanded="${playable || i === 0 ? "true" : "false"}">
                  <span class="cd-sec-num">${String(i + 1).padStart(2, "0")}</span>
                  <span class="cd-sec-title">${escapeHtml(s.t)}</span>
                  <em class="cd-sec-dur">${iconSvg("clock")} ${escapeHtml(s.m)}</em>
                  <i class="cd-sec-arrow" aria-hidden="true"></i>
                </button>
                <div class="cd-topics">
                  <div class="cd-topics-inner">
                    ${s.items.map((it) => playable && it.lesson != null
                      ? `<button type="button" class="cd-topic playable${it.lesson === 0 ? " active" : ""}" data-lesson="${it.lesson}">
                          <span class="cd-topic-ico">${iconSvg("play")}</span>
                          <span>${escapeHtml(it.t)}</span>
                          ${it.dur ? `<em>${escapeHtml(it.dur)}</em>` : ""}
                        </button>`
                      : `<div class="cd-topic"><span class="cd-topic-ico">${iconSvg("play")}</span><span>${escapeHtml(it.t)}</span></div>`).join("")}
                  </div>
                </div>
              </div>`).join("")}
            ${awardedCertFooterHTML(c, playable)}
          </div>
        </section>`;
}

function courseAbout(c) {
  if (c.description) return c.description;
  return `${c.title} is taught by ${c.instructor}. The classroom is built around a written setup, a clear invalidation, and a journal you can keep after the video ends. You will learn how to choose the trade, size it, and review the week — not a list of tips. The lessons are short, practical, and meant to be replayed before the next session.`;
}

function communityForCourse(courseId) {
  const channels = typeof telegramChannels === "function" ? telegramChannels().filter((x) => x.courseId === courseId) : [];
  const posts = typeof forumPosts === "function" ? forumPosts().filter((p) => p.courseId === courseId).slice().reverse() : [];
  return { channels, posts };
}

function courseCommunityBodyHTML(c) {
  const { channels, posts } = communityForCourse(c.id);
  const user = getUser();
  return `
    <div class="course-comm-body">
      <div class="course-comm-tg">
        ${channels.length
          ? channels.map((ch) => `<a class="course-tg-link" href="${ch.url}" target="_blank" rel="noopener"><span class="cd-fact-ico">${iconSvg("chat")}</span><span class="course-tg-copy"><b>${escapeHtml(ch.name)}</b><small>Telegram room</small></span><em>Open</em></a>`).join("")
          : `<p class="muted">No Telegram channel for this course yet.</p>`}
      </div>
      ${user ? `<form class="course-comm-form" data-course-comm="${c.id}">
        <input name="title" required placeholder="Start a thread">
        <textarea name="body" required placeholder="Ask or share a setup from this classroom."></textarea>
        <button class="btn btn-primary" type="submit">Post</button>
      </form>` : `<p class="muted">Login to post in this room.</p>`}
      <div class="course-comm-posts">
        ${posts.length ? posts.map((p) => `<article class="course-comm-post"><span class="cd-post-ava">${escapeHtml((p.author || "?").charAt(0).toUpperCase())}</span><div><h4>${escapeHtml(p.title)}</h4><p>${escapeHtml(p.body)}</p><small>${escapeHtml(p.author)} · ${new Date(p.at).toLocaleDateString("en-IN")}</small></div></article>`).join("") : `<p class="muted">No discussion yet in this course.</p>`}
      </div>
    </div>`;
}

function bindCourseCommunity(courseId) {
  document.querySelector(`[data-course-comm="${courseId}"]`)?.addEventListener("submit", (e) => {
    e.preventDefault();
    requireAuth(() => {
      const u = getUser();
      const f = e.target;
      const list = forumPosts();
      list.push({
        id: "p-" + Date.now(),
        title: f.title.value.trim(),
        body: f.body.value.trim(),
        author: u.name,
        email: u.email,
        courseId,
        at: new Date().toISOString()
      });
      writeList(POST_KEY, list);
      f.reset();
      toast("Posted in this course community");
      const host = document.getElementById("courseCommInner");
      if (host) {
        const course = allCourses().find((x) => x.id === courseId);
        if (course) host.innerHTML = courseCommunityBodyHTML(course);
        bindCourseCommunity(courseId);
      }
    });
  });
}

function renderCoursePage() {
  const box = document.getElementById("courseDetail");
  if (!box) return;
  const id = new URLSearchParams(location.search).get("id");
  const c = allCourses().find((x) => x.id === id) || allCourses()[0];
  const art = COVERS[c.cover] || { bg: "linear-gradient(135deg,#4f46e5,#1e1b4b)", title: c.title, sub: c.instructor };
  const logged = Boolean(getUser());
  const owned = logged && isEnrolled(c.id);
  const langs = courseLangs(c);
  const points = learnPoints(c);
  const watchers = 11 + (c.title.length * 3) % 37;
  const photo = photoFor(c.instructor);
  document.title = `${c.title} | ${BRAND}`;

  box.innerHTML = `
    <div class="cd-layout${owned ? " is-owned" : ""}">
      <div class="cd-main">
        <nav class="cd-crumb">
          <a href="/">Home</a><span>/</span>
          <a href="/courses">All Courses</a><span>/</span>
          <b>${c.title}</b>
        </nav>
        <span class="cd-pill">${catLabel(c.cat).toUpperCase()}</span>
        <h1 class="cd-title">${c.title}</h1>

        ${owned
          ? `<div id="learnRoot" class="cd-classroom"></div>
             <div id="certAward"></div>
             ${courseOverviewCardHTML(c, true)}`
          : `<div class="cd-preview" style="--cover:${art.bg}">
          <video id="cdPreview" autoplay muted loop playsinline preload="metadata" src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"></video>
          <div class="cd-preview-art">
            <img class="cd-preview-person" src="${photo}" alt="${c.instructor}">
            <div class="cd-preview-copy"><small>${BRAND}</small><b>${art.title}</b></div>
          </div>
          <div class="cd-preview-top">
            <button type="button" class="cd-icon-btn" id="cdShare" title="Share" aria-label="Share">${iconSvg("share")}</button>
          </div>
          <div class="cd-langs">${langs.map((l, i) => `<button type="button" class="cd-lang ${i === 0 ? "on" : ""}">${l}${i === 0 ? " <em>Original</em>" : ""}</button>`).join("")}</div>
          <div class="cd-stars">★ ${c.rating} <span>★★★★★</span></div>
        </div>`}

        <div class="cd-bonus cd-bonus-card">
          <div class="cd-ov-head">
            <h2>Bonus resources included</h2>
            <p class="cd-ov-meta"><span class="cd-free">FREE</span></p>
          </div>
          <div class="cd-bonus-row">
            <span class="cd-learn-ico">${iconSvg("gift")}</span>
            <span>Access to the Bizgarh practice desk with ${c.instructor}</span>
          </div>
        </div>

        <section class="cd-card cd-learn-card">
          <div class="cd-ov-head">
            <h2>What You Will Learn</h2>
            <p class="cd-ov-meta">
              <span>${points.length} outcomes</span>
              <span>Practical skills</span>
            </p>
          </div>
          <ul class="cd-learn">
            ${points.map((p, i) => `<li style="--i:${i}"><span class="cd-learn-ico">${iconSvg("check")}</span><span>${p}</span></li>`).join("")}
          </ul>
        </section>

        ${owned ? "" : courseOverviewCardHTML(c, false)}

        <section class="cd-card cd-about-card" id="cdAbout">
          <div class="cd-ov-head">
            <h2>About The Course</h2>
            <p class="cd-ov-meta">
              <span>By ${c.instructor}</span>
              <span>${c.hours} hrs</span>
            </p>
          </div>
          <div class="cd-about-body">
            <p class="cd-about-text">${courseAbout(c)}</p>
          </div>
          <button type="button" class="cd-more" id="cdMore">See more</button>
        </section>

        <section class="cd-card cd-community-card cd-community ${owned ? "is-open" : "is-locked"}" id="courseCommunity">
          <div class="cd-ov-head">
            <h2>Community</h2>
            <p class="cd-ov-meta">
              ${owned ? `<span class="cd-comm-open">Members only</span>` : `<span class="cd-lock-badge">${iconSvg("lock")} Locked</span>`}
            </p>
          </div>
          ${owned
            ? `<div id="courseCommInner">${courseCommunityBodyHTML(c)}</div>`
            : `<div class="cd-comm-locked-panel">
                <span class="cd-comm-lock-ico">${iconSvg("lock")}</span>
                <div>
                  <b>Buy to unlock this room</b>
                  <p>Telegram and discussion for students of this course.</p>
                </div>
                <button type="button" class="cd-comm-cta locked" id="commLockedBtn">
                  <span class="cd-lock-on" aria-hidden="true">${iconSvg("lock")}</span>
                  Community
                </button>
              </div>`}
        </section>
      </div>

      ${owned ? "" : `<aside class="cd-buy">
        <ul class="cd-facts">
          <li>${iconSvg("badge")} <span>${c.learners} Learners Enrolled</span></li>
          <li>${iconSvg("bars")} <span>${courseLevel(c)}</span></li>
          <li>${iconSvg("wifi")} <span>${c.hours} hrs of Content</span></li>
          <li>${iconSvg("chat")} <span>${langs.join(", ")}</span></li>
          <li>${iconSvg("target")} <span>1 Year Access</span></li>
          <li>${iconSvg("badge")} <span>Earn a Certificate</span></li>
        </ul>
        <div class="cd-price">₹${Number(c.price).toLocaleString("en-IN")}</div>
        <button class="btn btn-primary btn-block cd-cta" id="enrollBtn">Buy Now →</button>
        <button type="button" class="btn btn-ghost btn-block cd-comm-cta locked" id="commLockCta">
          <span class="cd-lock-on" aria-hidden="true">${iconSvg("lock")}</span>
          Community
        </button>
        <p class="cd-watch"><i></i> ${watchers} learners watching right now</p>
      </aside>`}
    </div>`;

  document.getElementById("enrollBtn")?.addEventListener("click", () => enroll(c.id));
  const lockCommunity = () => {
    toast("Buy this course to unlock the community");
    document.getElementById("enrollBtn")?.focus();
  };
  document.getElementById("commLockCta")?.addEventListener("click", lockCommunity);
  document.getElementById("commLockedBtn")?.addEventListener("click", lockCommunity);
  if (owned) bindCourseCommunity(c.id);
  document.querySelectorAll(".cd-sec-h").forEach((btn) => {
    btn.addEventListener("click", () => {
      const sec = btn.parentElement;
      const playable = Boolean(document.querySelector("#courseOverview .cd-topic.playable"));
      if (playable) {
        const open = !sec.classList.contains("open");
        sec.classList.toggle("open", open);
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        return;
      }
      const open = sec.classList.contains("open");
      document.querySelectorAll(".cd-sec").forEach((s) => {
        s.classList.remove("open");
        s.querySelector(".cd-sec-h")?.setAttribute("aria-expanded", "false");
      });
      if (!open) {
        sec.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
  document.getElementById("cdMore")?.addEventListener("click", (e) => {
    const wrap = document.getElementById("cdAbout");
    wrap.classList.toggle("open");
    e.target.textContent = wrap.classList.contains("open") ? "See less" : "See more";
  });
  document.querySelectorAll(".cd-lang").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".cd-lang").forEach((x) => x.classList.remove("on"));
      btn.classList.add("on");
    });
  });
  document.getElementById("cdShare")?.addEventListener("click", () => {
    navigator.clipboard?.writeText(location.href);
    toast("Course link copied");
  });
  const vid = document.getElementById("cdPreview");
  if (vid) {
    const preview = document.querySelector(".cd-preview");
    vid.muted = true;
    vid.addEventListener("playing", () => preview?.classList.add("playing"));
    const start = () => vid.play().catch(() => {});
    if (vid.readyState >= 2) start();
    else vid.addEventListener("canplay", start, { once: true });
  }
  if (owned && typeof renderLearnPage === "function") renderLearnPage();
  if (owned && typeof maybeIssueCert === "function") {
    const cert = maybeIssueCert(getUser().email, c.id);
    if (cert) renderCertAward(document.getElementById("certAward"), c, cert);
  }
}

function renderDashboard() {
  const grid = document.getElementById("myCourses");
  if (!grid) return;
  const user = getUser();
  if (!user) {
    grid.innerHTML = `<div class="empty"><h3>Login to see your classroom</h3><p class="muted">Your enrolled courses will appear here.</p><button class="btn btn-orange" data-open="signupModal" style="margin-top:12px">Start learning</button></div>`;
    return;
  }
  document.getElementById("dashName").textContent = user.name;
  const ids = enrolled();
  const list = allCourses().filter((c) => ids.includes(c.id));
  const myCalls = typeof callRequests === "function" ? callRequests().filter((c) => c.email === user.email) : [];
  const aff = typeof affiliates === "function" ? affiliates().find((a) => a.email === user.email) : null;
  const extra = `
    <div class="dash-tools">
      <div class="info-card">
        <h3>Progress</h3>
        ${list.length ? list.map((c) => {
          const p = typeof courseCompletion === "function" ? courseCompletion(user.email, c.id) : { pct: 0 };
          return `<div class="bar-row"><span>${c.title}</span><div class="bar-track"><i style="width:${p.pct}%"></i></div><b>${p.pct}%</b></div>
            ${p.cert ? `<div class="cert-mini-links"><a href="/certificate?course=${c.id}">View certificate</a><button type="button" class="btn btn-primary" data-cert-download="${c.id}">Download</button></div>` : ""}`;
        }).join("") : `<p class="muted">No classrooms yet.</p>`}
      </div>
      <div class="info-card">
        <h3>1:1 sessions</h3>
        ${myCalls.length ? myCalls.map((c) => `<p><strong>${c.topic}</strong> · ${c.date} ${c.time || ""} · ${c.status}${c.meetUrl ? ` · <a href="${c.meetUrl}" target="_blank">Join</a>` : ""}</p>`).join("") : `<p class="muted">No calls booked. <a href="/live#call">Request a 1:1</a></p>`}
      </div>
      <div class="info-card">
        <h3>Affiliate</h3>
        ${aff
          ? `<p>Code <strong>${aff.code}</strong> · ${aff.status}</p>
             <p class="muted">Share: ${location.origin}/?ref=${aff.code}</p>
             ${typeof affiliateBalance === "function" ? `<p>Due ${ "₹" + affiliateBalance(user.email).due.toLocaleString("en-IN") }</p>` : ""}`
          : `<p class="muted">Turn students into ambassadors. Ask admin to activate your code, or apply below.</p>
             <button class="btn btn-ghost" id="joinAffBtn" type="button">Apply as affiliate</button>`}
      </div>
    </div>`;
  if (!list.length) {
    grid.innerHTML = `<div class="empty"><h3>No courses yet</h3><p class="muted">Pick a course to start your first week of practice.</p><a class="btn btn-primary" href="/courses" style="margin-top:12px">Browse courses</a></div>` + extra;
    bindDashAff();
    return;
  }
  grid.innerHTML = `<div class="grid-3">${list.map((c) => courseCard(c, "grid-card")).join("")}</div>` + extra;
  bindDashAff();
}

function bindDashAff() {
  document.getElementById("joinAffBtn")?.addEventListener("click", () => {
    const u = getUser();
    if (!u || typeof affiliates !== "function") return;
    const list = affiliates();
    if (list.some((a) => a.email === u.email)) return;
    list.push({ email: u.email, name: u.name, code: makeCode(u.name.slice(0, 4).toUpperCase()), rate: platformSettings().defaultCommission, status: "pending", created: new Date().toISOString() });
    writeList(AFFILIATE_KEY, list);
    toast("Affiliate application sent to admin");
    renderDashboard();
  });
}

function liveActionBtn(w) {
  if (w.status === "ended") return `<span class="muted" style="display:block;margin:8px 14px 14px">This class has ended.</span>`;
  if (w.status === "live") return `<a class="btn btn-primary" style="margin:8px 14px 14px" href="/live-room?id=${w.id}">Join now</a>`;
  return `<button class="btn btn-primary" style="margin:8px 14px 14px" data-register="${w.id}">Register free</button>`;
}

function renderLive() {
  const list = document.getElementById("liveList");
  if (!list) return;
  list.innerHTML = allWebinars().map((w, i) => webinarCardHTML(w, i)).join("");
}

function renderLiveRoom() {
  const root = document.getElementById("liveRoom");
  if (!root) return;
  const id = new URLSearchParams(location.search).get("id");
  const session = allWebinars().find((w) => w.id === id);
  if (!session) {
    root.innerHTML = `<div class="empty"><h3>Class not found</h3><a class="btn btn-primary" href="/live" style="margin-top:12px">All live classes</a></div>`;
    return;
  }
  const staff = getStaffSession();
  const isHost = staff && staff.email === session.hostEmail;
  const user = getUser();
  const regs = readList(REGS_KEY).filter((r) => r.id === session.id);
  const registered = user && regs.some((r) => r.email === user.email);
  document.title = `${session.title} | Live | ${BRAND}`;

  if (isHost && session.status === "scheduled") updateLive(id, { status: "live" });
  const live = allWebinars().find((w) => w.id === id);

  root.innerHTML = `
    <div class="live-room">
      <div class="live-stage">
        <span class="live-dot ${live.status || "scheduled"}">${(live.status || "scheduled").toUpperCase()}</span>
        <h1>${live.title}</h1>
        <p>${live.when} • ${live.by} • ${live.duration || "60 min"}</p>
        <div class="live-cam">${isHost ? "You are teaching this room · camera / screen share via your Meet link" : "Waiting for the instructor feed"}</div>
        ${live.joinUrl ? `<a class="btn btn-primary" href="${live.joinUrl}" target="_blank" rel="noopener">Open live video / screen share</a>` : ""}
        ${live.recordUrl ? `<a class="btn btn-ghost" href="${live.recordUrl}" target="_blank" rel="noopener">Watch recording</a>` : ""}
        ${isHost ? `
          <form id="hostLinkForm" class="live-host-form">
            <input name="joinUrl" placeholder="Paste Google Meet / Zoom / stream link" value="${live.joinUrl || ""}">
            <button class="btn btn-ghost">Save link</button>
          </form>
          <form id="hostRecForm" class="live-host-form">
            <input name="recordUrl" placeholder="Paste recording URL after class" value="${live.recordUrl || ""}">
            <button class="btn btn-ghost">Save recording</button>
          </form>
          <div class="live-host-actions">
            ${live.status !== "ended" ? `<button class="btn btn-primary" id="endLiveBtn">End class</button>` : ""}
            <a class="btn btn-ghost" href="/admin">Back to dashboard</a>
          </div>` : `
          <div class="live-host-actions">
            ${!user ? `<button class="btn btn-primary" data-open="loginModal">Login to join</button>` : ""}
            ${user && !registered && live.status !== "ended" ? `<button class="btn btn-primary" data-register="${live.id}">Register & stay</button>` : ""}
            <a class="btn btn-ghost" href="/live">All live classes</a>
          </div>`}
      </div>
      <aside class="live-side">
        <h3>${isHost ? "Students in this class" : "Class details"}</h3>
        ${isHost
          ? (regs.length ? `<ul class="live-students">${regs.map((r) => `<li>${r.name}<small>${r.email}</small></li>`).join("")}</ul>` : `<p class="muted">No registrations yet.</p>`)
          : `<p class="muted">${live.notes || "Bring your journal. Q&A at the end."}</p><p class="muted" style="margin-top:8px">${regs.length} learners registered.${live.chat === false ? " Chat is off for this session." : " Chat is on in the Meet room."}</p>`}
      </aside>
    </div>`;

  document.getElementById("hostLinkForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    updateLive(id, { joinUrl: e.target.joinUrl.value.trim() });
    toast("Join link saved");
    renderLiveRoom();
  });
  document.getElementById("hostRecForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    updateLive(id, { recordUrl: e.target.recordUrl.value.trim() });
    toast("Recording link saved");
    renderLiveRoom();
  });
  document.getElementById("endLiveBtn")?.addEventListener("click", () => {
    updateLive(id, { status: "ended" });
    toast("Class ended");
    renderLiveRoom();
  });
}

function applySignupGate() {
  const st = typeof platformSettings === "function" ? platformSettings() : { publicSignup: true, inviteOnly: false };
  const note = document.getElementById("signupNote");
  const wrap = document.getElementById("inviteFieldWrap");
  if (note) {
    if (!st.publicSignup && !st.inviteOnly) note.textContent = "Public registration is closed. Use an invite from admin.";
    else if (st.inviteOnly) note.textContent = "This classroom is invite-only. Enter a code from your admin.";
    else if (st.requireApproval) note.textContent = "New accounts wait for admin approval.";
    else note.textContent = "";
  }
  if (wrap && (st.inviteOnly || !st.publicSignup)) {
    const input = wrap.querySelector("input");
    if (input) input.required = true;
  }
  const pending = localStorage.getItem("tradeshalaPendingRef");
  const code = document.querySelector("#signupForm [name=code]");
  if (code && pending && !code.value) code.value = pending;
}

function renderCommunityPage() {
  if (!document.getElementById("tgList") && !document.getElementById("forumList")) return;
  location.replace("/courses");
}

function awardedCertFooterHTML(c, playable) {
  const u = getUser();
  const row = playable && u && typeof certFor === "function" ? certFor(u.email, c.id) : null;
  if (row) {
    return `<div class="cd-cert is-awarded">
      <span class="cd-cert-ico">${iconSvg("badge")}</span>
      <div>
        <b>Certificate ready</b>
        <p>Classroom complete</p>
      </div>
      <button type="button" class="btn btn-primary" data-cert-download="${c.id}">Download</button>
    </div>`;
  }
  return `<div class="cd-cert">
    <span class="cd-cert-ico">${iconSvg("badge")}</span>
    <div>
      <b>Earn a Certificate</b>
      <p>Finish every lesson and your Bizgarh certificate unlocks here.</p>
    </div>
  </div>`;
}

function renderCertAward(host, course, row) {
  if (!host || !course || !row) return;
  host.innerHTML = `
    <div class="cert-award">
      <div class="cert-award-copy">
        <span class="cert-award-pill">Classroom complete</span>
        <b>Your certificate is ready</b>
        <p>Finish line crossed. Download it for LinkedIn or print a copy for your desk.</p>
      </div>
      <div class="cert-award-actions">
        <button type="button" class="btn btn-primary" data-cert-download="${course.id}">Download certificate</button>
        <a class="btn btn-ghost" href="/certificate?course=${encodeURIComponent(course.id)}">View certificate</a>
      </div>
    </div>`;
  host.hidden = false;
}

function certRoundRect(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function drawBizgarhMark(ctx, cx, cy, size) {
  const s = size / 48;
  ctx.save();
  ctx.translate(cx - 24 * s, cy - 24 * s);
  ctx.scale(s, s);
  const g = ctx.createLinearGradient(8, 40, 38, 8);
  g.addColorStop(0, "#4F46E5");
  g.addColorStop(0.46, "#7C3AED");
  g.addColorStop(1, "#E11D74");
  ctx.beginPath();
  ctx.arc(23, 25.4, 20.35, 0, Math.PI * 2);
  ctx.strokeStyle = g;
  ctx.lineWidth = 1.75;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(23, 25.4, 16.55, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.22)";
  ctx.beginPath();
  ctx.ellipse(18.4, 20, 8.4, 5.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(23, 25.4, 15.45, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,.32)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.fill(new Path2D("M14.35 35.05V21.15C14.35 15.2 18.15 11.85 23 11.85S31.65 15.2 31.65 21.15v13.9h-4.05V22.85c0-2.85-2-4.95-4.6-4.95s-4.6 2.1-4.6 4.95v12.2h-4.05Z"));
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(18.9, 30.35);
  ctx.lineTo(21.95, 25.15);
  ctx.lineTo(24.85, 27.2);
  ctx.lineTo(28.85, 19.55);
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(27.55, 18.05);
  ctx.lineTo(31.35, 17.35);
  ctx.lineTo(29.55, 21.45);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(36.35, 9.85, 3.55, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(36.35, 9.85, 2.55, 0, Math.PI * 2);
  ctx.fillStyle = "#E11D74";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(36.35, 9.85, 1.05, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.restore();
}

function fitCertText(ctx, text, maxW, maxSize, minSize, font) {
  let size = maxSize;
  ctx.font = font.replace("SIZE", size);
  while (size > minSize && ctx.measureText(text).width > maxW) {
    size -= 2;
    ctx.font = font.replace("SIZE", size);
  }
  return size;
}

function ensureCertFonts() {
  if (!document.getElementById("certScriptFont")) {
    const link = document.createElement("link");
    link.id = "certScriptFont";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,700;1,700&display=swap";
    document.head.appendChild(link);
  }
  const ready = document.fonts?.ready ? document.fonts.ready.catch(() => {}) : Promise.resolve();
  return ready.then(() => Promise.all([
    document.fonts?.load("80px Great Vibes").catch(() => {}),
    document.fonts?.load("700 72px 'Playfair Display'").catch(() => {}),
    document.fonts?.load("italic 700 28px 'Playfair Display'").catch(() => {})
  ]));
}

function fillTracked(ctx, text, cx, y, tracking) {
  const prev = ctx.textAlign;
  ctx.textAlign = "left";
  const chars = Array.from(text);
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + tracking * Math.max(0, chars.length - 1);
  let x = cx - total / 2;
  chars.forEach((ch, i) => {
    ctx.fillText(ch, x, y);
    x += widths[i] + tracking;
  });
  ctx.textAlign = prev;
}

function wrapCertLines(ctx, text, maxW) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const next = line ? line + " " + word : word;
    if (ctx.measureText(next).width > maxW && line) {
      lines.push(line);
      line = word;
    } else line = next;
  });
  if (line) lines.push(line);
  return lines;
}

function drawCertSeal(ctx, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  const spikes = 20;
  for (let i = 0; i <= spikes; i++) {
    const a = (i / spikes) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.78;
    const px = Math.cos(a) * rad;
    const py = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  const g = ctx.createLinearGradient(-r, -r, r, r);
  g.addColorStop(0, "#4F46E5");
  g.addColorStop(0.5, "#7C3AED");
  g.addColorStop(1, "#E11D74");
  ctx.fillStyle = g;
  ctx.shadowColor = "rgba(79,70,229,.28)";
  ctx.shadowBlur = 18;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.62, 0, Math.PI * 2);
  ctx.fillStyle = "#1e1b4b";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.54, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,.35)";
  ctx.lineWidth = 1.4;
  ctx.stroke();
  drawBizgarhMark(ctx, 0, 2, r * 1.05);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-18, r * 0.72);
  ctx.quadraticCurveTo(-28, r * 1.35, -8, r * 1.55);
  ctx.lineTo(4, r * 0.78);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(18, r * 0.72);
  ctx.quadraticCurveTo(30, r * 1.38, 10, r * 1.58);
  ctx.lineTo(-2, r * 0.78);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCertCornerWaves(ctx, W, H, layer) {
  ctx.save();
  if (layer === "dark") {
    ctx.fillStyle = "#1e1b4b";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(260, 0);
    ctx.bezierCurveTo(120, 12, 28, 80, 0, 210);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(W, H);
    ctx.lineTo(W - 260, H);
    ctx.bezierCurveTo(W - 120, H - 12, W - 28, H - 80, W, H - 210);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    return;
  }
  const ribbon = (flip) => {
    ctx.save();
    if (flip) {
      ctx.translate(W, H);
      ctx.rotate(Math.PI);
    }
    const g = ctx.createLinearGradient(0, 20, 520, 240);
    g.addColorStop(0, "rgba(225,29,116,.95)");
    g.addColorStop(0.45, "rgba(124,58,237,.92)");
    g.addColorStop(1, "rgba(79,70,229,.55)");
    ctx.strokeStyle = g;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const paths = [
      [[16, 28], [190, 12, 340, 62, 470, 34], [580, 12, 640, 86, 500, 138]],
      [[6, 62], [160, 42, 280, 98, 430, 78], [560, 54, 630, 128, 470, 172]],
      [[36, 98], [180, 78, 310, 136, 430, 112]]
    ];
    const widths = [22, 11, 6];
    paths.forEach((p, i) => {
      ctx.lineWidth = widths[i];
      ctx.beginPath();
      ctx.moveTo(p[0][0], p[0][1]);
      p.slice(1).forEach((c) => ctx.bezierCurveTo(c[0], c[1], c[2], c[3], c[4], c[5]));
      ctx.stroke();
    });
    ctx.restore();
  };
  ribbon(false);
  ribbon(true);
  ctx.restore();
}

function auroraStroke(ctx, x1, y1, x2, y2) {
  const g = ctx.createLinearGradient(x1, y1, x2, y2);
  g.addColorStop(0, "#4F46E5");
  g.addColorStop(0.5, "#7C3AED");
  g.addColorStop(1, "#E11D74");
  return g;
}

function drawCertCrest(ctx, cx, cy, r) {
  const g = auroraStroke(ctx, cx - r, cy + r, cx + r, cy - r);
  ctx.save();
  ctx.strokeStyle = g;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1.15;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#7C3AED";
  [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach((a) => {
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2.4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = "#4F46E5";
  ctx.font = `700 ${Math.round(r * 0.92)}px 'Playfair Display', Georgia, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("B", cx, cy + 1);
  ctx.restore();
}

function drawCertBackdrop(ctx, W, H) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(150, 96, 1300, 908);
  ctx.clip();

  ctx.globalAlpha = 0.1;
  drawBizgarhMark(ctx, W / 2, 560, 520);
  ctx.globalAlpha = 1;

  ctx.setLineDash([8, 12]);
  ctx.strokeStyle = "rgba(79,70,229,.18)";
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.ellipse(W / 2, 560, 460, 268, -0.16, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(124,58,237,.16)";
  ctx.beginPath();
  ctx.ellipse(W / 2, 560, 352, 198, 0.24, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = "rgba(225,29,116,.14)";
  ctx.lineWidth = 1.35;
  ctx.beginPath();
  ctx.ellipse(W / 2, 560, 248, 132, -0.08, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(79,70,229,.11)";
  ctx.beginPath();
  ctx.ellipse(390, 280, 168, 108, 0.55, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(225,29,116,.11)";
  ctx.beginPath();
  ctx.ellipse(1210, 840, 188, 118, -0.38, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = auroraStroke(ctx, 220, 200, 1380, 900);
  ctx.globalAlpha = 0.22;
  ctx.lineWidth = 2.4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(240, 740);
  ctx.bezierCurveTo(470, 610, 700, 880, 980, 690);
  ctx.bezierCurveTo(1160, 580, 1300, 800, 1400, 770);
  ctx.stroke();
  ctx.globalAlpha = 0.16;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(220, 320);
  ctx.bezierCurveTo(420, 180, 780, 260, 1120, 210);
  ctx.bezierCurveTo(1280, 180, 1360, 280, 1420, 250);
  ctx.stroke();
  ctx.globalAlpha = 1;

  const ornaments = [
    [210, 160],
    [1390, 160],
    [210, 940],
    [1390, 940]
  ];
  ornaments.forEach(([x, y]) => {
    ctx.strokeStyle = "rgba(124,58,237,.18)";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(x - 16, y);
    ctx.lineTo(x, y - 16);
    ctx.lineTo(x + 16, y);
    ctx.lineTo(x, y + 16);
    ctx.closePath();
    ctx.stroke();
  });
  ctx.restore();
}

async function paintBizgarhCertificate(canvas, { row, course }) {
  await ensureCertFonts();
  const W = 1600;
  const H = 1100;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const name = String(row.name || "Learner");
  const title = String(course.title || "Classroom");
  const instructor = String(course.instructor || "Bizgarh");
  const when = new Date(row.at || Date.now()).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  const aurora = ctx.createLinearGradient(140, 90, 1460, 1010);
  aurora.addColorStop(0, "#4F46E5");
  aurora.addColorStop(0.46, "#7C3AED");
  aurora.addColorStop(1, "#E11D74");

  ctx.fillStyle = "#fbf7f1";
  ctx.fillRect(0, 0, W, H);
  const washA = ctx.createRadialGradient(1280, 180, 40, 1280, 180, 520);
  washA.addColorStop(0, "rgba(79,70,229,.12)");
  washA.addColorStop(1, "rgba(79,70,229,0)");
  ctx.fillStyle = washA;
  ctx.fillRect(0, 0, W, H);
  const washB = ctx.createRadialGradient(280, 940, 20, 280, 940, 460);
  washB.addColorStop(0, "rgba(225,29,116,.12)");
  washB.addColorStop(1, "rgba(225,29,116,0)");
  ctx.fillStyle = washB;
  ctx.fillRect(0, 0, W, H);

  drawCertCornerWaves(ctx, W, H, "dark");
  drawCertCornerWaves(ctx, W, H, "ribbons");

  ctx.strokeStyle = aurora;
  ctx.lineWidth = 7;
  ctx.strokeRect(132, 78, 1336, 944);
  ctx.lineWidth = 2.2;
  ctx.strokeRect(150, 96, 1300, 908);

  drawCertBackdrop(ctx, W, H);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  drawBizgarhMark(ctx, 1396, 178, 86);

  ctx.fillStyle = "#4F46E5";
  ctx.font = "700 86px 'Playfair Display', Georgia, serif";
  fillTracked(ctx, "CERTIFICATE", W / 2, 268, 12);
  ctx.fillStyle = "#E11D74";
  ctx.font = "800 28px Nunito, Segoe UI, sans-serif";
  fillTracked(ctx, "OF COMPLETION", W / 2, 316, 12);

  ctx.fillStyle = "#7C3AED";
  ctx.font = "800 18px Nunito, Segoe UI, sans-serif";
  ctx.fillText("A classroom, not a tip desk", W / 2, 372);

  ctx.fillStyle = "#475569";
  ctx.font = "22px Nunito, Segoe UI, sans-serif";
  ctx.fillText("This certificate is proudly presented to", W / 2, 430);

  ctx.fillStyle = "#E11D74";
  const nameSize = fitCertText(ctx, name, 1080, 108, 56, "SIZEpx Great Vibes, 'Playfair Display', cursive");
  ctx.font = `${nameSize}px Great Vibes, 'Playfair Display', cursive`;
  ctx.fillText(name, W / 2, 548);

  ctx.strokeStyle = aurora;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 280, 576);
  ctx.lineTo(W / 2 + 280, 576);
  ctx.stroke();
  ctx.fillStyle = "#7C3AED";
  ctx.beginPath();
  ctx.arc(W / 2 - 280, 576, 4.5, 0, Math.PI * 2);
  ctx.arc(W / 2 + 280, 576, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#4F46E5";
  const titleSize = fitCertText(ctx, title, 1100, 42, 28, "800 SIZEpx Nunito, Segoe UI, sans-serif");
  ctx.font = `800 ${titleSize}px Nunito, Segoe UI, sans-serif`;
  ctx.fillText(title, W / 2, 648);

  ctx.fillStyle = "#334155";
  ctx.font = "22px Nunito, Segoe UI, sans-serif";
  ctx.fillText("taught by " + instructor + "  ·  " + when, W / 2, 702);

  ctx.fillStyle = "#7C3AED";
  ctx.font = "52px Great Vibes, 'Playfair Display', cursive";
  ctx.fillText(instructor, W / 2, 790);

  ctx.strokeStyle = aurora;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 110, 808);
  ctx.lineTo(W / 2 + 110, 808);
  ctx.stroke();

  ctx.fillStyle = "#1e1b4b";
  ctx.font = "800 18px Nunito, Segoe UI, sans-serif";
  fillTracked(ctx, "BIZGARH LEARNING", W / 2, 848, 6);
  ctx.fillStyle = "#E11D74";
  ctx.font = "700 16px Nunito, Segoe UI, sans-serif";
  ctx.fillText("Classroom instructor", W / 2, 878);

  ctx.fillStyle = "#7C3AED";
  ctx.font = "700 15px Nunito, Segoe UI, sans-serif";
  ctx.fillText("bizgarh.com   ·   desk@bizgarh.com", W / 2, 980);
}

async function downloadBizgarhCertificate(row, course) {
  const canvas = document.createElement("canvas");
  await paintBizgarhCertificate(canvas, { row, course });
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `Bizgarh-Certificate-${course.id}.png`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  toast("Certificate downloaded");
}

async function renderCertificatePage() {
  const root = document.getElementById("certRoot");
  if (!root) return;
  const q = new URLSearchParams(location.search);
  const courseId = q.get("course");
  const email = q.get("email") || getUser()?.email;
  const course = allCourses().find((c) => c.id === courseId);
  const row = typeof certs === "function" ? certs().find((c) => c.courseId === courseId && c.email === email) : null;
  if (!course || !row) {
    root.innerHTML = `<div class="empty"><h3>Certificate not issued yet</h3><p class="muted">Finish every lesson in the classroom and it appears here.</p><a class="btn btn-primary" href="/dashboard" style="margin-top:12px">My learning</a></div>`;
    return;
  }
  document.title = `Certificate · ${course.title} | ${BRAND}`;
  root.innerHTML = `
    <div class="cert-stage">
      <p class="cert-stage-kicker">Certificate of completion</p>
      <h1 class="cert-stage-title">Your classroom certificate</h1>
      <canvas class="biz-cert-canvas" id="bizCertCanvas" aria-label="Certificate of completion"></canvas>
      <div class="cert-actions">
        <button type="button" class="btn btn-primary" data-cert-download="${course.id}">Download PNG</button>
        <button type="button" class="btn btn-ghost" id="certPrintBtn">Print / PDF</button>
      </div>
    </div>`;
  await paintBizgarhCertificate(document.getElementById("bizCertCanvas"), { row, course });
  document.getElementById("certPrintBtn")?.addEventListener("click", () => {
    const canvas = document.getElementById("bizCertCanvas");
    const win = window.open("", "_blank");
    if (!win) {
      window.print();
      return;
    }
    win.document.write(`<!DOCTYPE html><title>Certificate</title><img src="${canvas.toDataURL("image/png")}" style="width:100%;display:block">`);
    win.document.close();
    win.focus();
    win.print();
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  pingCreatorDigest();
  stripHtmlUrl();
  const ref = new URLSearchParams(location.search).get("ref");
  if (ref) {
    localStorage.setItem("tradeshalaPendingRef", ref);
    if (typeof AdminCore !== "undefined") AdminCore.trackRefClick(ref);
    else {
      try {
        const clicks = JSON.parse(localStorage.getItem("tradeshalaRefClicks") || "[]");
        clicks.push({ code: ref, at: new Date().toISOString() });
        localStorage.setItem("tradeshalaRefClicks", JSON.stringify(clicks.slice(-2000)));
      } catch { /* ignore */ }
    }
  }
  if (typeof seedLms === "function") seedLms();

  const mountH = document.getElementById("site-header");
  const mountF = document.getElementById("site-footer");
  ensureBrandFont();
  if (mountH) mountH.innerHTML = headerHTML();
  if (mountF) mountF.innerHTML = footerHTML();
  bindChrome();
  applySignupGate();
  const oauthed = await consumeOAuth();
  if (!oauthed) restoreOAuthSession();

  const typedEl = document.getElementById("typed");
  if (typedEl) {
    const words = [
      "Nifty",
      "Bank Nifty",
      "Sensex",
      "Options Trading",
      "Option Selling",
      "Option Buying",
      "Index Options",
      "Credit Spreads",
      "Expiry Day Setups",
      "Intraday Trading",
      "Swing Trading",
      "Price Action",
      "Technical Analysis",
      "Candlestick Charts",
      "Support & Resistance",
      "VWAP Setups",
      "Futures Trading",
      "F&O Hedging",
      "Forex Trading",
      "Currency Pairs",
      "Gold Trading",
      "Silver Trading",
      "Crude Oil",
      "Commodities",
      "MCX Commodities",
      "Crypto Markets",
      "Mutual Funds",
      "SIP Investing",
      "ETF Investing",
      "Portfolio Building",
      "Long-term Investing",
      "Risk Management",
      "Market Psychology",
      "Stock Market"
    ];
    let wi = 0;
    const swap = () => {
      typedEl.classList.remove("in");
      typedEl.classList.add("out");
      setTimeout(() => {
        wi = (wi + 1) % words.length;
        typedEl.textContent = words[wi];
        typedEl.classList.remove("out");
        typedEl.classList.add("in");
      }, 420);
    };
    setInterval(swap, 3200);
  }
  const dust = document.getElementById("heroDust");
  if (dust) {
    dust.innerHTML = Array.from({ length: 28 }, (_, i) =>
      `<span style="--x:${6 + (i * 3.4) % 88}%;--y:${12 + (i * 13) % 70}%;--d:${(i * 0.22).toFixed(1)}s;--s:${0.4 + (i % 6) * 0.16}"></span>`
    ).join("");
  }
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion) {
    document.querySelectorAll("[data-count]").forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const decimals = parseInt(el.dataset.decimals || "0", 10);
      const start = performance.now();
      const duration = 1400;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const val = target * eased;
        const shown = decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString("en-IN");
        el.textContent = shown + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach((el) => { el.style.opacity = 1; el.style.transform = "none"; });
  }

  if (document.getElementById("courseTrack")) renderCourses("#courseTrack", "trending");
  if (document.getElementById("strategyTrack")) renderCourses("#strategyTrack", "strategy");

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      renderCourses("#courseTrack", tab.dataset.filter);
    });
  });

  document.querySelectorAll("[data-carousel]").forEach((wrap) => {
    const track = wrap.querySelector(".track");
    wrap.querySelector(".prev")?.addEventListener("click", () => track.scrollBy({ left: -300, behavior: "smooth" }));
    wrap.querySelector(".next")?.addEventListener("click", () => track.scrollBy({ left: 300, behavior: "smooth" }));
  });

  seedLiveClasses();
  renderHomeExtras();
  bindCourseLibrary();
  bindExploreTiles();
  renderHomeReviews();
  renderReviewsPage();
  consumePendingBuy();
  renderCoursePage();
  if (sessionStorage.getItem("tradeshalaScrollPlayer")) {
    sessionStorage.removeItem("tradeshalaScrollPlayer");
    document.getElementById("learnRoot")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  renderDashboard();
  renderLive();
  renderLiveRoom();

  document.body.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-register]");
    if (!btn) return;
    requireAuth(() => {
      const u = getUser();
      const regs = readList(REGS_KEY);
      if (regs.some((r) => r.id === btn.dataset.register && r.email === u.email)) {
        toast("Already registered");
        return;
      }
      const live = allWebinars().find((w) => w.id === btn.dataset.register);
      regs.push({ id: btn.dataset.register, name: u.name, email: u.email, at: new Date().toISOString() });
      writeList(REGS_KEY, regs);
      toast(`Registered for ${live?.title || "live class"}`);
      renderLive();
      renderHomeExtras();
      renderLiveRoom();
    });
  });

  document.getElementById("contactForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    e.target.reset();
    document.getElementById("contactMsg").textContent = "Thanks. We’ll reply at your email within 1 working day.";
  });

  document.getElementById("callForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    requireAuth(() => {
      const f = e.target;
      const u = getUser();
      const mentorName = f.mentor?.value || "";
      const mentor = typeof staffList === "function" ? staffList().find((s) => s.name === mentorName) : null;
      const list = typeof callRequests === "function" ? callRequests() : [];
      list.push({
        id: "call-" + Date.now(),
        name: u.name,
        email: u.email,
        topic: f.topic.value,
        date: f.date.value,
        time: f.time?.value || "18:00",
        mentor: mentorName,
        mentorEmail: mentor?.email || "",
        status: "pending",
        meetUrl: "",
        notes: f.notes?.value || "",
        at: new Date().toISOString()
      });
      writeList(CALL_KEY, list);
      f.reset();
      toast("1:1 call request sent to the mentor");
    });
  });
  renderCommunityPage();
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cert-download]");
    if (!btn) return;
    const u = getUser();
    const course = allCourses().find((c) => c.id === btn.dataset.certDownload);
    const row = u && course && typeof certFor === "function" ? certFor(u.email, course.id) : null;
    if (row && course) downloadBizgarhCertificate(row, course);
  });
  renderCertificatePage();
  window.BizgarhLoader?.done?.();
});
