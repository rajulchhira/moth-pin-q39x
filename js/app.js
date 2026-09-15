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
    icon.type = "image/png";
    icon.sizes = "48x48";
    icon.href = "img/favicon-48.png?v=logo2";
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
const MENTOR_ENROLL_KEY = "tradeshalaMentorEnroll";
const TICKETS_KEY = "tradeshalaTickets";
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

function parseVdoCipherId(value) {
  const s = String(value || "").trim();
  if (!s || /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(s)) return "";
  if (/^https?:\/\//i.test(s) && !/vdocipher\.com/i.test(s)) return "";
  const fromUrl = s.match(/vdocipher\.com\/(?:dashboard\/)?videos?\/([A-Za-z0-9_-]+)/i)
    || s.match(/[?&](?:videoId|id)=([A-Za-z0-9_-]{6,64})/i);
  const id = (fromUrl && fromUrl[1]) || (/^[A-Za-z0-9_-]{6,64}$/.test(s) ? s : "");
  if (!id || /^(watch|embed|shorts|http|https)$/i.test(id)) return "";
  return id;
}

function lessonMediaLabel(lesson) {
  if (lesson?.vdoId) return "VdoCipher DRM";
  if (lesson?.fileKey) return "uploaded file";
  return "link";
}

function ensureVdoPlayerApi() {
  if (window.VdoPlayer) return Promise.resolve();
  if (window.__vdoApiWait) return window.__vdoApiWait;
  window.__vdoApiWait = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://player.vdocipher.com/v2/api.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      window.__vdoApiWait = null;
      reject(new Error("Could not load the DRM player"));
    };
    document.head.appendChild(s);
  });
  return window.__vdoApiWait;
}

async function fetchVdoOtp(videoId) {
  const u = typeof getUser === "function" ? getUser() : null;
  const res = await fetch("/api/video/otp", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      videoId,
      email: u?.email || "",
      name: u?.name || ""
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!data.ok || !data.otp || !data.playbackInfo) {
    throw new Error(data.error || "Could not unlock this DRM lesson. Add VDOCIPHER_API_SECRET on the server.");
  }
  return data;
}

async function fetchVdoUpload(title) {
  let res;
  try {
    res = await fetch("/api/video/upload", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title || "Lesson" })
    });
  } catch {
    const err = new Error("DRM upload needs the live Bizgarh server");
    err.code = "NO_DRM";
    throw err;
  }
  const data = await res.json().catch(() => ({}));
  if (!data.ok || !data.videoId || !data.clientPayload) {
    const err = new Error(data.error || "Could not start VdoCipher upload");
    err.code = (data.ready === false || res.status === 404 || res.status === 503) ? "NO_DRM" : "UPLOAD";
    throw err;
  }
  return data;
}

function uploadFileToVdo(payload, file, onProgress) {
  const p = payload.clientPayload || {};
  if (!p.uploadLink) return Promise.reject(new Error("Missing VdoCipher upload link"));
  const fd = new FormData();
  Object.keys(p).forEach((k) => {
    if (k === "uploadLink" || p[k] == null || p[k] === "") return;
    if (typeof p[k] === "object") return;
    fd.append(k, String(p[k]));
  });
  fd.append("file", file, file.name || "lesson.mp4");
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", p.uploadLink);
    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201 || xhr.status === 204) resolve();
      else reject(new Error("Could not upload this file to VdoCipher"));
    };
    xhr.onerror = () => reject(new Error("Upload failed. Check the file and try again."));
    xhr.onabort = () => reject(new Error("Upload cancelled"));
    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(e.loaded / e.total);
      };
    }
    xhr.send(fd);
  });
}

function setAdminUploadProgress(form, fraction) {
  const bar = form.querySelector("[data-upload-bar]");
  const fill = form.querySelector("[data-upload-fill]");
  const btn = form.querySelector("button[type=submit]");
  const pct = Math.max(0, Math.min(100, Math.round(Number(fraction || 0) * 100)));
  if (bar) bar.hidden = pct <= 0;
  if (fill) fill.style.width = pct + "%";
  if (btn && pct > 0 && pct < 100) btn.textContent = "Uploading " + pct + "%";
  if (btn && pct >= 100) btn.textContent = "Saving…";
}

async function addClassroomLesson(courseId, fields, onProgress) {
  const vdoId = parseVdoCipherId(fields.vdoId || fields.src);
  const src = String(fields.src || "").trim();
  const file = fields.file;
  if (!file && !src && !vdoId) throw new Error("Choose a video file to upload");
  const lessonId = "v-" + Date.now();
  const lesson = {
    id: lessonId,
    t: String(fields.title || "").trim(),
    dur: String(fields.dur || "").trim() || "video",
    src: vdoId ? "" : src
  };
  if (vdoId) lesson.vdoId = vdoId;
  if (file && !lesson.vdoId) {
    const kind = String(file.type || "").toLowerCase();
    const name = String(file.name || "").toLowerCase();
    if (kind && !kind.startsWith("video/") && !/\.(mp4|webm|mov|m4v|mkv)$/.test(name)) {
      throw new Error("Choose an MP4 or similar video file");
    }
    const up = await fetchVdoUpload(lesson.t || file.name);
    if (onProgress) onProgress(0.02);
    await uploadFileToVdo(up, file, onProgress);
    lesson.vdoId = String(up.videoId);
    lesson.src = "";
  }
  setCourseLessons(courseId, (courseVideosMap()[courseId] || []).concat(lesson));
  return lesson;
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
    cal: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>',
    globe: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4a12 12 0 0 1 0 16M12 4a12 12 0 0 0 0 16"/>',
    wa: '<path d="M12 4a8 8 0 0 0-6.9 12L4 20l4.1-1.1A8 8 0 1 0 12 4Z"/><path d="M9.2 9.4c.2-.4.4-.4.6-.4h.5c.2 0 .3.1.4.3l.6 1.4c.1.2 0 .4-.1.5l-.4.4c-.1.1-.1.3 0 .5.3.5.8 1 1.3 1.3.2.1.4.1.5 0l.4-.4c.2-.2.4-.2.5-.1l1.4.6c.2.1.3.2.3.4v.5c0 .2 0 .4-.4.6A5.2 5.2 0 0 1 9.2 9.4Z"/>',
    download: '<path d="M12 4v10"/><path d="m8 10 4 4 4-4"/><path d="M5 18h14"/>',
    flag: '<path d="M5 21V4"/><path d="M5 4h12l-2.2 4L17 12H5"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5-6-3.5Z" fill="currentColor" stroke="none"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4.2l2.4 1.6"/>',
    check: '<path d="m6.5 12.2 3.4 3.4 7.6-7.6"/>',
    gift: '<rect x="3" y="10" width="18" height="11" rx="2"/><path d="M12 7v14"/><path d="M3 10h18"/><path d="M12 7c-2.2-3.4-5.5-1.4-4.2 1.2C9.2 10 12 7 12 7Z"/><path d="M12 7c2.2-3.4 5.5-1.4 4.2 1.2C14.8 10 12 7 12 7Z"/>',
    bell: '<path d="M6.4 16h11.2"/><path d="M7 16v-5.1a5 5 0 0 1 10 0V16"/><path d="M10.2 16.2a1.8 1.8 0 0 0 3.6 0"/><path d="M12 4.2V6"/>'
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
  const idx = allWebinars().findIndex((x) => x.id === w.id);
  const bg = WEB_BANNERS[(i ?? (idx < 0 ? 0 : idx)) % WEB_BANNERS.length];
  return `<div class="web-banner" style="background:${bg}">
    <span class="wb-chip">Bizgarh</span>
    <div class="web-banner-copy"><small>${escapeHtml(webinarProfile(w).tag)}</small><b>${escapeHtml(w.title)}</b></div>
    <img src="${photoFor(w.by)}" alt="${escapeHtml(w.by)}">
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

const NOTE_KEY = "tradeshalaNotes";
function notesAll() { return readList(NOTE_KEY); }
function notesSave(list) { writeList(NOTE_KEY, list.slice(0, 100)); }
function myNotes(email) {
  const mail = email || getUser()?.email;
  if (!mail) return [];
  return notesAll().filter((n) => n.email === mail).sort((a, b) => new Date(b.at) - new Date(a.at));
}
function noteWhen(at) {
  const t = new Date(at).getTime();
  if (!Number.isFinite(t)) return "";
  const d = Date.now() - t;
  if (d < 45000) return "Just now";
  if (d < 3600000) return Math.max(1, Math.floor(d / 60000)) + "m ago";
  if (d < 86400000) return Math.max(1, Math.floor(d / 3600000)) + "h ago";
  return new Date(at).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
function pushNote(note) {
  const mail = note.email || getUser()?.email;
  if (!mail || !note.title) return null;
  const list = notesAll();
  if (note.key && list.some((n) => n.email === mail && n.key === note.key)) return null;
  const row = {
    id: "nt-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
    email: mail,
    key: note.key || ("nt-" + Date.now()),
    kind: note.kind || "desk",
    title: note.title,
    body: note.body || "",
    href: note.href || "/dashboard",
    at: note.at || new Date().toISOString(),
    read: !!note.read
  };
  list.unshift(row);
  notesSave(list);
  if (!note.silent) paintNoteBell(true);
  else paintNoteBell(false);
  return row;
}
function markNotesRead(email) {
  const mail = email || getUser()?.email;
  if (!mail) return;
  notesSave(notesAll().map((n) => n.email === mail ? { ...n, read: true } : n));
  paintNoteBell(false);
}
function noteBellHTML() {
  if (!getUser()) return "";
  return `<div class="note-wrap">
    <button class="note-btn" type="button" aria-label="Notifications" aria-expanded="false">${iconSvg("bell")}<em class="note-dot" hidden>0</em></button>
    <div class="note-panel" role="menu">
      <div class="note-head"><b>Notifications</b><button type="button" data-note-read>Mark all read</button></div>
      <div class="note-list"></div>
    </div>
  </div>`;
}
function paintNoteBell(ring) {
  const wrap = document.querySelector(".note-wrap");
  if (!wrap) return;
  const user = getUser();
  if (!user) return;
  const rows = myNotes(user.email);
  const unread = rows.filter((n) => !n.read).length;
  const dot = wrap.querySelector(".note-dot");
  const btn = wrap.querySelector(".note-btn");
  const list = wrap.querySelector(".note-list");
  if (dot) {
    dot.hidden = !unread;
    dot.textContent = unread > 9 ? "9+" : String(unread);
  }
  btn?.classList.toggle("has-unread", !!unread);
  if (ring && unread) {
    wrap.classList.remove("is-ring");
    void wrap.offsetWidth;
    wrap.classList.add("is-ring");
    setTimeout(() => wrap.classList.remove("is-ring"), 1400);
  }
  if (list) {
    list.innerHTML = rows.length
      ? rows.slice(0, 16).map((n) => `
        <a class="note-item${n.read ? "" : " is-new"}" href="${escapeHtml(n.href)}" data-note-id="${n.id}">
          <span class="note-ico ${n.kind}">${iconSvg(n.kind === "cert" ? "badge" : n.kind === "live" || n.kind === "webinar" ? "wifi" : n.kind === "mentor" ? "users" : n.kind === "call" ? "headset" : n.kind === "course" ? "play" : n.kind === "ticket" ? "chat" : "bell")}</span>
          <span>
            <b>${escapeHtml(n.title)}</b>
            <small>${escapeHtml(n.body)}</small>
            <em>${escapeHtml(noteWhen(n.at))}</em>
          </span>
        </a>`).join("")
      : `<p class="note-empty">No notifications yet. Enroll, join a desk, or finish a classroom and they appear here.</p>`;
  }
}
function syncNotesFromAccount() {
  const u = getUser();
  if (!u) return;
  pushNote({ key: "welcome:" + u.email, kind: "welcome", title: "Welcome to Bizgarh", body: "Your dashboard, classrooms, and live desks are ready.", href: "/dashboard", silent: true });
  if (typeof ownedCourses === "function") {
    ownedCourses(u.email).forEach((x) => {
      pushNote({ key: "course:" + x.c.id, kind: "course", title: "Classroom unlocked", body: x.c.title + " is in My Learning.", href: "/course?id=" + encodeURIComponent(x.c.id), at: x.c.at, read: true, silent: true });
      if (x.stats?.cert || (typeof certFor === "function" && certFor(u.email, x.c.id))) {
        pushNote({ key: "cert:" + x.c.id, kind: "cert", title: "Certificate ready", body: x.c.title + " is ready to download.", href: "/certificate?course=" + encodeURIComponent(x.c.id), read: true, silent: true });
      }
    });
  }
  if (typeof myWebinars === "function") {
    myWebinars(u.email).forEach((row) => {
      const w = row.w;
      pushNote({ key: "webinar:" + w.id, kind: "webinar", title: "Webinar enrolled", body: w.title + " · " + (w.when || "See details"), href: webinarHref(w.id), read: true, silent: true });
      const start = typeof webinarStart === "function" ? webinarStart(w) : null;
      const soon = start && start.getTime() - Date.now() < 36 * 3600000 && start.getTime() > Date.now() - 3600000;
      if (w.status === "live") {
        pushNote({ key: "livenow:" + w.id, kind: "live", title: "Live now", body: w.title + " is in session. Join the room.", href: "/live-room?id=" + encodeURIComponent(w.id), silent: true });
      } else if (soon && w.status !== "ended") {
        pushNote({ key: "livesoon:" + w.id, kind: "live", title: "Live session soon", body: w.title + " starts " + (w.when || "soon") + ".", href: webinarHref(w.id), silent: true });
      }
    });
  }
  if (typeof myMentorships === "function") {
    myMentorships(u.email).forEach((p) => {
      pushNote({ key: "mentor:" + p.id, kind: "mentor", title: "Mentorship enrolled", body: p.title + " by " + p.by + ".", href: mentorHref(p.id), read: true, silent: true });
      if (mentorPhase(p) === "upcoming") {
        pushNote({ key: "mentorsoon:" + p.id, kind: "live", title: "First session coming up", body: p.title + " starts " + webinarDateLabel(p) + ".", href: mentorHref(p.id), silent: true });
      }
    });
  }
  paintNoteBell(false);
}
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
    providerId: user.providerId || prev.providerId || "",
    profile: { ...(prev.profile || {}), ...(user.profile || {}) }
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
  afterAuthArrive();
}

function pagePath() {
  return (location.pathname || "/").replace(/\.html$/i, "").replace(/\/$/, "") || "/";
}

function afterAuthArrive() {
  const pending = sessionStorage.getItem("tradeshalaPendingBuy");
    if (pending) {
    location.href = "/course?id=" + encodeURIComponent(pending);
    return;
  }
  const pendingWeb = sessionStorage.getItem("tradeshalaPendingWebinar");
  if (pendingWeb) {
    location.href = "/webinar?id=" + encodeURIComponent(pendingWeb);
    return;
  }
  const pendingMentor = sessionStorage.getItem("tradeshalaPendingMentor");
  if (pendingMentor) {
    location.href = "/program?id=" + encodeURIComponent(pendingMentor);
    return;
  }
  if (pagePath() === "/dashboard") {
    location.reload();
    return;
  }
  location.href = "/dashboard";
}

function sendLoggedInHomeToDashboard() {
  if (!getUser()) return;
  const path = pagePath();
  if (path === "/" || path === "/index") location.replace("/dashboard");
}

function homeHref() {
  return getUser() ? "/dashboard" : "/";
}

function isPublicHomeHref(href) {
  const raw = String(href || "").trim();
  if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:")) return false;
  try {
    const u = new URL(raw, location.origin);
    if (u.origin !== location.origin) return false;
    const p = (u.pathname || "/").replace(/\.html$/i, "").replace(/\/$/, "") || "/";
    return p === "/" || p === "/index";
  } catch {
    return raw === "/" || raw === "/index" || raw === "/index.html";
  }
}

function userInitials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "BG";
  const a = parts[0][0] || "B";
  const b = parts.length > 1 ? (parts[parts.length - 1][0] || "") : (parts[0][1] || "");
  return (a + b).toUpperCase();
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
    afterAuthArrive();
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
    kind: "webinar",
    joinUrl: "",
    notes: "Live market session with Q&A.",
    status: "scheduled"
  }));
  writeList(LIVE_KEY, seed);
  localStorage.setItem("tradeshalaLivesSeeded", "1");
}
function allWebinars() {
  seedLiveClasses();
  ensureCatalogWebinars();
  return readList(LIVE_KEY);
}
function ensureCatalogWebinars() {
  const list = readList(LIVE_KEY);
  const extra = [
    { id: "w4", title: "Opening Range Playbook", by: "Kabir Joshi", at: "2026-09-30T20:00:00", duration: "90 min", kind: "webinar", notes: "Index open, first hour, and defined invalidation." }
  ];
  let changed = false;
  extra.forEach((w) => {
    if (list.some((x) => x.id === w.id)) return;
    list.push({
      ...w,
      hostEmail: w.by.split(" ")[0].toLowerCase() + "@bizgarh.in",
      when: formatLiveWhen(w.at),
      joinUrl: "",
      status: "scheduled"
    });
    changed = true;
  });
  if (changed) writeList(LIVE_KEY, list);
}
function webinarHref(id) {
  return "/webinar?id=" + encodeURIComponent(id);
}
function webinarStart(w) {
  const d = new Date(w.at || w.when || "");
  return Number.isNaN(d.getTime()) ? null : d;
}
function webinarMins(w) {
  return Number(w.durationMinutes || String(w.duration || "60").replace(/\D/g, "") || 60);
}
function webinarEnd(w) {
  const start = webinarStart(w);
  return start ? new Date(start.getTime() + webinarMins(w) * 60000) : null;
}
function ordinalDay(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
function webinarDateLabel(w) {
  const d = webinarStart(w);
  if (!d) return w.when || "";
  return `${ordinalDay(d.getDate())} ${d.toLocaleString("en-IN", { month: "long" })}, ${d.getFullYear()}`;
}
function webinarTimeLabel(w) {
  const a = webinarStart(w);
  const b = webinarEnd(w);
  const fmt = (x) => x.toLocaleString("en-IN", { hour: "numeric", minute: "2-digit" }).toLowerCase();
  if (!a) return w.when || "";
  return b ? `${fmt(a)} - ${fmt(b)}` : fmt(a);
}
function webinarWhenShort(w) {
  const d = webinarStart(w);
  if (!d) return w.when || "";
  return `${d.getDate()} ${d.toLocaleString("en-IN", { month: "long" })}, ${d.getFullYear()} · ${d.toLocaleString("en-IN", { hour: "numeric", minute: "2-digit" }).toLowerCase()}`;
}
function countdownParts(msTarget) {
  const ms = Math.max(0, Number(msTarget) - Date.now());
  const s = Math.floor(ms / 1000);
  return {
    days: String(Math.floor(s / 86400)).padStart(2, "0"),
    hours: String(Math.floor((s % 86400) / 3600)).padStart(2, "0"),
    mins: String(Math.floor((s % 3600) / 60)).padStart(2, "0"),
    secs: String(s % 60).padStart(2, "0"),
    done: ms <= 0
  };
}
function countdownHTML(target, label) {
  const t = target ? target.getTime() : 0;
  const p = countdownParts(t);
  return `<div class="wb-count" data-count="${t}" aria-label="${escapeHtml(label || "Starts in")}">
    <span><b data-k="days">${p.days}</b><small>Days</small></span>
    <span><b data-k="hours">${p.hours}</b><small>Hours</small></span>
    <span><b data-k="mins">${p.mins}</b><small>Min</small></span>
    <span><b data-k="secs">${p.secs}</b><small>Sec</small></span>
  </div>`;
}
function countdownLineHTML(target) {
  const t = target ? target.getTime() : 0;
  const p = countdownParts(t);
  return `<em class="ld-uplive-cd" data-count="${t}" data-line="1">Starts in ${p.days}d : ${p.hours}h : ${p.mins}m : ${p.secs}s</em>`;
}
function startWbCountdown(root = document) {
  if (window.__wbTick) clearInterval(window.__wbTick);
  const boxes = root.querySelectorAll("[data-count]");
  if (!boxes.length) return;
  const tick = () => {
    boxes.forEach((el) => {
      const p = countdownParts(el.dataset.count);
      if (el.dataset.line) {
        el.textContent = `Starts in ${p.days}d : ${p.hours}h : ${p.mins}m : ${p.secs}s`;
        return;
      }
      const set = (k, v) => { const n = el.querySelector(`[data-k="${k}"]`); if (n) n.textContent = v; };
      set("days", p.days);
      set("hours", p.hours);
      set("mins", p.mins);
      set("secs", p.secs);
      el.classList.toggle("is-live", p.done);
    });
  };
  tick();
  window.__wbTick = setInterval(tick, 1000);
}
function bindWbMotion(root) {
  if (!root || !("IntersectionObserver" in window)) {
    root?.querySelectorAll("[data-wb]")?.forEach((el) => el.classList.add("wb-on"));
    return;
  }
  const io = new IntersectionObserver((ents) => {
    ents.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("wb-on");
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px" });
  root.querySelectorAll("[data-wb]").forEach((el) => io.observe(el));
}

function faqSectionHTML(items, title) {
  if (!items || !items.length) return "";
  return `<section class="wb-block faq-block" data-wb>
    <h2>${escapeHtml(title || "Frequently Asked Questions")}</h2>
    <div class="wb-faqs">${items.map((f, i) => `
      <article class="wb-faq${i === 0 ? " open" : ""}">
        <button type="button" data-faq>${escapeHtml(f.q)}<i></i></button>
        <div class="ans"><p>${escapeHtml(f.a)}</p></div>
      </article>`).join("")}</div>
  </section>`;
}
function bindFaqs(root) {
  (root || document).querySelectorAll("[data-faq]").forEach((btn) => {
    if (btn.dataset.boundFaq) return;
    btn.dataset.boundFaq = "1";
    btn.addEventListener("click", () => btn.closest(".wb-faq")?.classList.toggle("open"));
  });
}
function mountStaticFaqs() {
  document.querySelectorAll("[data-faq-set]").forEach((el) => {
    const items = FAQ_SETS[el.dataset.faqSet];
    if (!items) return;
    el.innerHTML = faqSectionHTML(items, el.dataset.faqTitle || "Frequently Asked Questions");
    bindFaqs(el);
    bindWbMotion(el);
  });
}

function helpFaqItems() {
  return Array.isArray(window.HELP_FAQS) ? window.HELP_FAQS : [];
}

function renderHelpPage() {
  const root = document.getElementById("helpFaqRoot");
  if (!root) return;
  const all = helpFaqItems();
  const input = document.getElementById("helpFaqQ");
  const q = (input?.value || "").trim().toLowerCase();
  const matched = all.filter((f) => !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  const topN = 8;
  const items = q ? matched : matched.slice(0, topN);
  const list = root.querySelector("[data-help-list]");
  const count = root.querySelector("[data-help-count]");
  if (count) {
    count.textContent = q
      ? (matched.length ? `${matched.length} match${matched.length === 1 ? "" : "es"}` : "No match")
      : `Top ${Math.min(topN, all.length)} of ${all.length}`;
  }
  if (list) {
    const hint = !q && all.length > topN
      ? `<p class="help-faq-hint">Showing the top ${topN}. Type above to find the rest.</p>`
      : "";
    list.innerHTML = items.length
      ? items.map((f, i) => `
        <article class="wb-faq${q && i === 0 ? " open" : ""}">
          <button type="button" data-faq>${escapeHtml(f.q)}<i></i></button>
          <div class="ans"><p>${escapeHtml(f.a)}</p></div>
        </article>`).join("") + hint
      : `<p class="muted help-faq-empty">No FAQ matches that search. Try enroll, live desk, certificate, or journal.</p>`;
  }
  bindFaqs(root);
}

function bindHelpFaqSearch() {
  const input = document.getElementById("helpFaqQ");
  if (!input) return;
  input.addEventListener("input", () => renderHelpPage());
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      input.value = "";
      renderHelpPage();
    }
  });
  renderHelpPage();
}

const FAQ_SETS = {
  home: [
    { q: "What is Bizgarh?", a: "Bizgarh is an education classroom for Indian traders and long-term investors. You get recorded courses, live webinars, mentorship desks, and optional 1:1 calls. We teach process, risk, and journals — not tips." },
    { q: "Is this investment advice or portfolio management?", a: "No. Everything on Bizgarh is education. You write your own process and size. We do not give buy/sell calls or manage money." },
    { q: "What is the difference between a course, a webinar, and a mentorship?", a: "A course is a recorded classroom you can finish at your pace. A webinar is a single live session. A mentorship is a multi-week live desk with the same mentor, a community room, and recordings when they are uploaded." },
    { q: "Do I need an account?", a: "Yes. Login to enroll, join a live room, continue a classroom, or see certificates. After login you land on your dashboard." },
    { q: "How do I start if I am new?", a: "Open Courses, pick a beginner or Hindi classroom, or sit in a live webinar first. Mentorships are better once you already have a journal." },
    { q: "Can I learn on my phone?", a: "Yes. The site, classroom player, mentorship pages, and live rooms are built for mobile browsers." },
    { q: "What language are the classrooms in?", a: "Most desks run in English and Hindi. Each course or live page lists the language." },
    { q: "Where do I get help?", a: "Open Help and search the FAQ, or write to desk@bizgarh.com. For a program you already joined, use the community room for follow-ups." }
  ],
  mentorList: [
    { q: "What is a live mentorship program?", a: "A guided multi-week desk with a working trader. You enroll, join live sessions inside Bizgarh, use the community room, and review recordings when they are uploaded." },
    { q: "How is this different from a webinar?", a: "A webinar is one session. A mentorship runs for several weeks with a fixed curriculum, weekly reviews, and a seat in the desk community." },
    { q: "How do I enroll?", a: "Open any program card, then tap Enroll Now. You need to be logged in. After enroll, the same page shows Join desk and Join community." },
    { q: "Where do enrolled programs appear?", a: "On your dashboard under My Mentorship, and in My Learning → My Mentorship." },
    { q: "Is the listed price a one-time fee?", a: "Yes. The price on the card is for that program. The struck-through amount is the listed full price." },
    { q: "Do I get a certificate?", a: "Mentorships are live desks. Course-completion certificates are issued when you finish a recorded classroom. Ask the mentor during the program if they issue a participation note." },
    { q: "Is this investment advice?", a: "No. Bizgarh does not give investment advice or manage portfolios. You write your own process and size." },
    { q: "Can I request a callback before I enroll?", a: "Yes. Open the program and tap Request a callback. The desk will reach you on the email on your account." }
  ],
  mentorship: [
    { q: "Will the sessions be live?", a: "Yes. Sessions run inside the Bizgarh classroom. After you enroll, use Join desk on this page, or open the program from My Learning." },
    { q: "How do I enroll?", a: "Tap Enroll Now and log in if asked. You will see Already enrolled, Join desk, and Join community on this same page." },
    { q: "What happens after I enroll?", a: "The program is saved to My Mentorship on your dashboard and My Learning. You can join the desk and the Telegram community from this page." },
    { q: "How do I join the live desk?", a: "Tap Join desk when you are enrolled. The room opens in Bizgarh. You can also reach it from My Learning → My Mentorship." },
    { q: "Can I skip a session?", a: "Prefer not to. If you miss one, the recording — when the mentor uploads it — stays on this page for enrolled learners." },
    { q: "How long do I have access to recordings?", a: "One year from the day you enroll, on this same program page, whenever a recording is uploaded." },
    { q: "Will I get to ask doubts?", a: "Yes. Live Q&A is part of each session. The community room is for short follow-ups, not for personal trading calls." },
    { q: "What is the community room?", a: "An exclusive Telegram room for this desk: session notes, reminders, and follow-up questions. It is not a tip channel." },
    { q: "What does Request a callback do?", a: "It sends your name and email to the desk. Someone from Bizgarh will contact you about this program. It does not enroll you." },
    { q: "Is this investment advice?", a: "No. Ideas shared on this desk are education only. You write your own process and size. Bizgarh does not manage portfolios." },
    { q: "Who is this program for?", a: "Traders and learners who want a written process they can run after the live desk closes. Beginners can join if they are willing to journal. It is not a signals service." },
    { q: "What should I prepare before the first session?", a: "Bring the broker you already use, a journal, and the basics listed under Key concepts on this page. You do not need a new platform." },
    { q: "Can I attend on mobile?", a: "Yes. Enroll, join the desk, and watch recordings in your mobile browser. Keep the phone charged for live sessions." },
    { q: "What language is the desk in?", a: "Mentors teach in English and Hindi as needed. Curriculum text on this page is in English." },
    { q: "What if seats are full?", a: "The page shows seats left. If a batch is full, request a callback and we will tell you about the next desk." },
    { q: "Who do I write to for access issues?", a: "Email desk@bizgarh.com or use Help. Mention this program title and the email on your account." }
  ],
  webinarList: [
    { q: "Are webinars free?", a: "Most Bizgarh webinars are listed as free for registered learners. The detail page shows the price if a session is paid." },
    { q: "How do I enroll in a webinar?", a: "Open the webinar card and tap Enroll Now. Login is required. You then see Join Now and the community link." },
    { q: "Where do I join when it goes live?", a: "From the webinar page or from your dashboard under upcoming live sessions. Join Now opens the Bizgarh live room." },
    { q: "Will I get a recording?", a: "If the mentor uploads one, registered learners see it on the same webinar page." },
    { q: "Is there a certificate?", a: "Yes. Registered learners get a certificate of participation after the session." },
    { q: "How is a live class different from a webinar?", a: "Both run in the Bizgarh room. Webinars are public sessions. Live classes may be tied to a classroom or mentorship desk." }
  ],
  webinar: [
    { q: "Will this webinar be conducted live?", a: "Yes. Registered learners join the Bizgarh room from this page when the teacher starts the session." },
    { q: "How do I enroll?", a: "Tap Enroll Now and log in. The page then shows Already enrolled, Join Now, and Join community." },
    { q: "How do I join at start time?", a: "Stay on this page or open it from your dashboard. Tap Join Now. The countdown shows when the room opens." },
    { q: "Will I have access to the recording?", a: "If the mentor uploads a recording after class, it appears on this same page for registered learners." },
    { q: "Is there a certificate?", a: "Yes. Registered learners receive a certificate of participation after the session." },
    { q: "Do I need a paid course first?", a: "No. A webinar stands on its own. A related classroom is useful but not required." },
    { q: "What should I bring?", a: "A journal and one question you already have. This is not a tip feed — you write the process as the mentor works." },
    { q: "Is this investment advice?", a: "No. The session is education. You make your own decisions and size." },
    { q: "Can I join from my phone?", a: "Yes. Use your mobile browser. Allow camera or mic only if the room asks and you want to speak." },
    { q: "What is Join community?", a: "A Telegram room for reminders and follow-ups for this session. It is not a WhatsApp broadcast or a calls channel." },
    { q: "What if I miss the live time?", a: "Register anyway. If a recording is uploaded, you can watch it here. The certificate still applies if you registered." },
    { q: "Who can I contact if I cannot join?", a: "Write to desk@bizgarh.com with the webinar title and your login email." }
  ],
  courseList: [
    { q: "How do I buy a course?", a: "Open a course card and complete enroll while logged in. Owned classrooms then appear on your dashboard and in My Learning." },
    { q: "Can I watch at my own pace?", a: "Yes. Courses are recorded classrooms. Your progress and last lesson are saved to your account." },
    { q: "When do I get a certificate?", a: "After you finish every lesson in that classroom. View and download it from My Learning → My Certificates." },
    { q: "Is the community included?", a: "Yes, after you own the course. The Telegram room on the course page unlocks for students of that classroom." },
    { q: "Are courses investment advice?", a: "No. Classrooms teach process and risk. They are not recommendations or portfolio management." },
    { q: "Can I filter Hindi or beginner classrooms?", a: "Yes. Use the chips on this page: Beginners, Hindi, Options, Investing, Charts, and more." }
  ],
  course: [
    { q: "How do I start this classroom?", a: "Enroll while logged in. The preview becomes the full player and you can continue from any lesson." },
    { q: "Will my progress be saved?", a: "Yes. The last lesson and completion percent stay on your dashboard and in My Learning." },
    { q: "When is the certificate issued?", a: "When every lesson is complete. You can view and download it from this course and from My Certificates." },
    { q: "What is in Bonus resources?", a: "Student access to the practice desk and community for this course, after you own it." },
    { q: "Why is Community locked?", a: "The room opens only after you enroll in this course. It is for students, not a public tip feed." },
    { q: "Can I watch on mobile?", a: "Yes. The player stays on screen on a phone. Use play, next, mute, and fullscreen from the bar." },
    { q: "Which language is original?", a: "The first language chip is the original track. You can switch labels on the preview; the classroom follows the course language." },
    { q: "Is this investment advice?", a: "No. This classroom is education. You write your own process and size." },
    { q: "How long do I keep access?", a: "As long as the course stays on your Bizgarh account. Certificates remain available after you finish." },
    { q: "Who do I contact for playback issues?", a: "Use Contact or desk@bizgarh.com. Mention the course title, lesson name, and your login email." }
  ],
  live: [
    { q: "What can I join from this page?", a: "Live webinars, live classes, mentorship desks, and 1:1 call requests. Each card opens a detail page before you enter the room." },
    { q: "Do I need to register before joining?", a: "Yes. Enroll or register on the detail page while logged in. Join Now then opens the Bizgarh room." },
    { q: "Where does the live video run?", a: "Inside Bizgarh, not on Zoom. Use Join desk or Join Now from the program or webinar page." },
    { q: "Can I book a 1:1 from here?", a: "Yes. Scroll to Book a 1:1 call, pick a topic and time, and submit while logged in. After approval you join inside Bizgarh." }
  ],
  call: [
    { q: "How long is a 1:1 call?", a: "45 minutes on your journal, risk, or a stuck setup. It is not a live trading call service." },
    { q: "When do I get the room?", a: "After the desk approves your slot. You will join from Bizgarh using the same account email." },
    { q: "What should I write in Notes?", a: "What is stuck: a setup, a size rule, or a journal week. Bring that to the call." },
    { q: "Can I pick a mentor?", a: "Yes, or leave Any available. We assign someone who teaches that topic." },
    { q: "Is a 1:1 investment advice?", a: "No. The mentor reviews your process. You still make your own decisions." }
  ],
  dashboard: [
    { q: "What is Continue learning?", a: "The classroom you last opened that is not finished. Tap it to resume the same lesson." },
    { q: "Where are my live sessions?", a: "Your upcoming webinar appears under Your upcoming live sessions. Mentorships appear under My Mentorship." },
    { q: "How do I open My Mentorship?", a: "Use the card on this page, Quick Actions → My Mentorship, or My Learning → My Mentorship." },
    { q: "Where are my certificates?", a: "Quick Actions → My Certificates, or My Learning → My Certificates. Finish every lesson in a course to issue one." },
    { q: "Why did I land here after login?", a: "Logged-in learners open the dashboard so you can continue, instead of the public homepage." }
  ],
  learning: [
    { q: "What is in My Courses?", a: "Classrooms you own. Ongoing is not finished yet. Completed is 100% watched." },
    { q: "What is in Webinars?", a: "Sessions you enrolled in. Ongoing is still scheduled or live. Completed has ended." },
    { q: "What is in My Mentorship?", a: "Programs you enrolled in. Open a card to join the desk, read the curriculum, or enter the community." },
    { q: "How do certificates work?", a: "Finish every lesson in a course. Then open My Certificates to view or download the PNG." },
    { q: "I enrolled but I do not see the tab count go up.", a: "Refresh the page after login. Mentorship and webinar lists are stored on this browser for your account email." },
    { q: "Can I switch between Ongoing and Completed?", a: "Yes. The chips under each tab filter that list only." }
  ],
  cert: [
    { q: "When is a certificate issued?", a: "After you complete every lesson in that classroom. It then appears here and in My Certificates." },
    { q: "How do I download it?", a: "Tap Download PNG. Your name and the course title are printed on the certificate." },
    { q: "Can I print a PDF?", a: "Yes. Use Print / PDF and save from the browser print dialog." },
    { q: "The page says it is not issued yet.", a: "Finish the remaining lessons, then return. Certificates are not issued for webinars or mentorships unless a classroom is completed." },
    { q: "Whose name is on the certificate?", a: "The name on your Bizgarh account. Update it in My Profile before you download if you need a correction." }
  ],
  contact: [
    { q: "How fast will you reply?", a: "We reply to desk@bizgarh.com and this form within one working day." },
    { q: "What should I include?", a: "Your login email, the course or program title, and what is broken: enroll, player, live room, or certificate. Do not send passwords or OTPs." },
    { q: "Can I ask a trading doubt here?", a: "Use the community room or a 1:1 for process questions. This form is for access and account help." }
  ]
};

function isWebinarRegistered(id, email) {
  const mail = email || getUser()?.email;
  if (!mail) return false;
  return readList(REGS_KEY).some((r) => r.id === id && r.email === mail);
}
function webinarCommunityUrl(w) {
  const channels = typeof telegramChannels === "function" ? telegramChannels() : [];
  const hit = channels.find((x) => x.creatorEmail === w.hostEmail) || channels[0];
  return hit?.url || "https://t.me/bizgarh_breakout";
}
function webinarProfile(w) {
  const mentor = MENTORS.find((m) => m.name === w.by) || {};
  const pack = {
    w1: {
      tag: "Nifty options",
      listPrice: 2999,
      seats: 80,
      lang: "Hindi, English",
      exp: "10+ Years of Experience",
      learners: "12,480 Learners",
      learn: [
        "The 60-minute theory and the right trading mindset",
        "Gap selection and how to mark the opening range",
        "Step-by-step execution with a written invalidation",
        "Risk and trade management to protect your capital"
      ],
      about: "A live desk on gap-and-go for Nifty options. You will write the setup, the invalidation, and the size before the first candle of the session.",
      aboutMore: "This is not a tip feed. Aarav walks one process: locate the gap, wait for acceptance, and leave the trade if the level fails. Bring a journal.",
      audience: [
        { t: "Intraday traders", d: "Get a written process for the first hour instead of chasing the open." },
        { t: "Working professionals", d: "Learn a checklist you can run before the office day starts." },
        { t: "Serious beginners", d: "See how a working desk sizes risk on index options." }
      ],
      bio: "Aarav Mehta is a full-time trader. He teaches process, invalidation, and journal work — not calls."
    },
    w2: {
      tag: "Defined risk",
      listPrice: 2499,
      seats: 70,
      lang: "English, Hindi",
      exp: "8+ Years of Experience",
      learners: "7,890 Learners",
      learn: [
        "How a credit spread is built before you click buy",
        "Adjustment rules that do not turn into hope",
        "Defined risk vs undefined size on weekly options",
        "A journal template for income-style trades"
      ],
      about: "Neha walks defined-risk credit spreads for weekly income. You leave with a written risk, not a target.",
      aboutMore: "We cover which strikes to skip, when to take the loss, and why size is smaller than the premium looks.",
      audience: [
        { t: "Options traders", d: "Replace naked selling with a defined-risk structure." },
        { t: "Income seekers", d: "See why premium is not income until the trade is closed." },
        { t: "Course students", d: "A live lab for the income playbook classroom." }
      ],
      bio: "Neha Kapoor teaches options as risk first. Spreads, adjustments, and weekly review."
    },
    w3: {
      tag: "Price action",
      listPrice: 1999,
      seats: 90,
      lang: "English, Hindi",
      exp: "12+ Years of Experience",
      learners: "9,340 Learners",
      learn: [
        "How weekly structure is marked before Monday",
        "Which levels are real and which are decoration",
        "A swing journal you can keep after the call",
        "Common mistakes when a level is taken out"
      ],
      about: "Vikram reads weekly structure live. One chart, one invalidation, no indicator stack.",
      aboutMore: "You will mark last week's high, low, and the level that would cancel the idea.",
      audience: [
        { t: "Swing traders", d: "Get a weekend process before the next week opens." },
        { t: "Chart readers", d: "Learn what to ignore on a busy chart." },
        { t: "Desk builders", d: "Leave with a journal, not a watchlist of 40 names." }
      ],
      bio: "Vikram Singh coaches price action without the indicator pile. Structure, then size."
    },
    w4: {
      tag: "Index open",
      listPrice: 1999,
      seats: 75,
      lang: "Hindi, English",
      exp: "9+ Years of Experience",
      learners: "6,112 Learners",
      learn: [
        "How the opening range is defined on index options",
        "When to stand aside in the first 15 minutes",
        "A written invalidation for Bank Nifty opens",
        "Size rules that survive a fast tape"
      ],
      about: "Kabir runs the opening-range playbook on index options. First hour only. No afternoon noise.",
      aboutMore: "We mark the range, wait for acceptance, and leave if the range fails. Bring yesterday's journal.",
      audience: [
        { t: "Index traders", d: "A process for the open instead of chasing the first spike." },
        { t: "Working desks", d: "A checklist you can finish before 10:15." },
        { t: "Students", d: "Live lab for the opening-range classroom." }
      ],
      bio: "Kabir Joshi teaches index options with a clock. Opening range, then stop."
    }
  }[w.id] || {};
  return {
    tag: pack.tag || (liveKindOf(w) === "class" ? "Live class" : "Live webinar"),
    listPrice: pack.listPrice || 1999,
    price: w.free === false ? Number(w.price || 0) : 0,
    seats: pack.seats || 80,
    lang: pack.lang || "Hindi, English",
    exp: pack.exp || mentor.tag || "Working trader",
    learners: pack.learners || "",
    learn: pack.learn || [
      "A written setup you can run after the session",
      "Invalidation and size before the first click",
      "Live Q&A with the mentor",
      "A journal prompt for the next trading day"
    ],
    about: pack.about || w.notes || `${w.title} is a live Bizgarh classroom with ${w.by}.`,
    aboutMore: pack.aboutMore || "Register to get the room link on this page. Recording, if any, stays here.",
    audience: pack.audience || [
      { t: "Active traders", d: "Sit with a working desk and write the process." },
      { t: "Working professionals", d: "A focused session you can finish the same evening." },
      { t: "Learners", d: "See how the mentor thinks, then journal it." }
    ],
    bio: pack.bio || `${w.by} hosts this live room on Bizgarh.`,
    faqs: FAQ_SETS.webinar
  };
}

const MENTOR_PROGRAMS = [
  { id: "mp-income", title: "Options Income Mentorship", by: "Neha Kapoor", at: "2026-09-22T18:00:00", weeks: 3, sessions: 10, hours: 12, price: 14999, old: 29999, seats: 18, tint: "#FDE68A", tag: "Defined risk", blurb: "Build a written income process: spreads, adjustments, and a weekly review you can keep after the desk closes." },
  { id: "mp-gap", title: "Gap & Go Mentorship", by: "Aarav Mehta", at: "2026-09-28T19:00:00", weeks: 4, sessions: 12, hours: 14, price: 12999, old: 24999, seats: 16, tint: "#C7D2FE", tag: "Intraday", blurb: "A four-week desk on gap selection, opening acceptance, and size you can defend." },
  { id: "mp-or", title: "Opening Range Mentorship", by: "Kabir Joshi", at: "2026-10-01T20:15:00", weeks: 3, sessions: 9, hours: 10, price: 11999, old: 19999, seats: 20, tint: "#FBCFE8", tag: "Index open", blurb: "First-hour process for index options. Mark the range, wait, or stand aside." },
  { id: "mp-breakout", title: "Intraday Desk Mentorship", by: "Aarav Mehta", at: "2026-09-08T19:00:00", weeks: 4, sessions: 12, hours: 14, price: 15999, old: 29999, seats: 14, tint: "#DDD6FE", tag: "Breakout", blurb: "Live tape, written invalidation, and a journal check every week." },
  { id: "mp-swing", title: "Swing Structure Mentorship", by: "Vikram Singh", at: "2026-09-01T11:00:00", weeks: 6, sessions: 12, hours: 16, price: 13999, old: 24999, seats: 22, tint: "#BBF7D0", tag: "Price action", blurb: "Weekly structure, real levels, and a weekend recap with Vikram." },
  { id: "mp-port", title: "Portfolio Construction Lab", by: "Ananya Rao", at: "2026-09-02T10:00:00", weeks: 4, sessions: 8, hours: 10, price: 9999, old: 18999, seats: 24, tint: "#BAE6FD", tag: "Investing", blurb: "Build a 10-year book: SIP, allocation, and a review you can run each quarter." },
  { id: "mp-opt0", title: "Options from Zero Mentorship", by: "Meera Iyer", at: "2026-08-18T19:30:00", weeks: 6, sessions: 14, hours: 16, price: 11999, old: 21999, seats: 20, tint: "#FED7AA", tag: "Options", blurb: "Calls, puts, expiry, and defined risk before you size up." },
  { id: "mp-sip", title: "SIP & Allocation Mentorship", by: "Priya Nair", at: "2026-08-04T19:30:00", weeks: 8, sessions: 12, hours: 14, price: 8999, old: 16999, seats: 25, tint: "#FECACA", tag: "Long-term", blurb: "A patient desk for SIP, rebalance, and what not to chase." },
  { id: "mp-pa", title: "Price Action Mentorship", by: "Vikram Singh", at: "2026-08-20T19:00:00", weeks: 5, sessions: 10, hours: 12, price: 10999, old: 19999, seats: 18, tint: "#A5F3FC", tag: "Charts", blurb: "Read the chart without the indicator pile. Structure, then size." }
];

function allMentorPrograms() { return MENTOR_PROGRAMS; }
function mentorHref(id) { return "/program?id=" + encodeURIComponent(id); }
function mentorEnrolls() { return readList(MENTOR_ENROLL_KEY); }
function isMentorEnrolled(id, email) {
  const mail = email || getUser()?.email;
  return !!mail && mentorEnrolls().some((r) => r.id === id && r.email === mail);
}
function myMentorships(email) {
  return allMentorPrograms().filter((p) => isMentorEnrolled(p.id, email));
}
function mentorEnd(p) {
  return new Date(new Date(p.at).getTime() + (p.weeks || 4) * 7 * 86400000);
}
function mentorPhase(p) {
  const start = new Date(p.at);
  const end = mentorEnd(p);
  if (Number.isNaN(start.getTime())) return "upcoming";
  if (Date.now() > end.getTime()) return "ended";
  if (Date.now() >= start.getTime()) return "ongoing";
  return "upcoming";
}
function mentorSavePct(p) {
  return Math.max(0, Math.round((1 - Number(p.price) / Number(p.old || p.price)) * 100));
}
function mentorSeatsLeft(p) {
  return Math.max(0, (p.seats || 20) - mentorEnrolls().filter((r) => r.id === p.id).length);
}
function mentorCommunityUrl(p) {
  const channels = typeof telegramChannels === "function" ? telegramChannels() : [];
  const host = (p.by || "").split(" ")[0].toLowerCase() + "@bizgarh.in";
  return (channels.find((x) => x.creatorEmail === host) || channels[0])?.url || "https://t.me/bizgarh_breakout";
}
function mentorPack(p) {
  const packs = {
    "mp-income": {
      learn: ["How a credit spread is built before you click", "Adjustment rules that do not become hope", "A weekly income journal", "When to skip the week entirely"],
      curriculum: ["Defined-risk structure on weekly options", "Strike choice and what to ignore", "Adjustment vs hope", "Size that survives a fast week", "Journal template for income trades", "Live review of student books", "When premium is not income"],
      outcomes: ["Spot defined-risk income setups", "Read option chain context", "Use time decay with a written plan", "Manage risk without averaging down"]
    },
    "mp-gap": {
      learn: ["Gap selection before the open", "Acceptance vs fade", "A size rule for the first hour", "A journal you can keep after class"],
      curriculum: ["Pre-open checklist", "Gap quality vs noise", "Opening acceptance", "Invalidation you can write", "Size for the first hour", "When to stand aside", "Weekend recap"],
      outcomes: ["Choose which gaps to skip", "Write invalidation before entry", "Size without chasing", "Keep a first-hour journal"]
    }
  }[p.id] || {};
  const mentor = MENTORS.find((m) => m.name === p.by) || {};
  return {
    learn: packs.learn || [
      "A written setup you can run after each live desk",
      "Invalidation and size before the first click",
      "Weekly review with the mentor",
      "A journal that survives a bad week"
    ],
    curriculum: packs.curriculum || [
      "How the desk is run each week",
      "Setup selection on a live chart",
      "Entry, invalidation, targets",
      "Position sizing you can follow",
      "Journal template walkthrough",
      "Common mistakes to skip",
      "A process you can repeat"
    ],
    outcomes: packs.outcomes || [
      "Identify high-probability setups",
      "Read the chart or chain with context",
      "Use time and size with a plan",
      "Manage risk without copying trades"
    ],
    prep: [
      "Familiarity with stocks or indices helps",
      "Know calls, puts, and expiry if this is an options desk",
      "A basic read of OI or volume is useful, not required",
      "Bring a journal and the broker you already use"
    ],
    who: [
      { t: "Beginners who want a desk", d: "Sit with a process instead of a tip feed." },
      { t: "Working professionals", d: "A timed program you can finish around work." },
      { t: "Traders adding a new book", d: "Learn one process, then journal it." },
      { t: "Long-term learners", d: "Use the recordings and the weekly review." }
    ],
    steps: [
      { n: "01", t: "Join the desk community", d: "You get the Telegram room for program notes and session reminders." },
      { n: "02", t: "Attend live inside Bizgarh", d: "Sessions run in the Bizgarh classroom. Join from this page or My Learning." },
      { n: "03", t: "Review the recording", d: "If a recording is uploaded, registered learners see it here within a day." }
    ],
    faqs: [
      { q: "Can I skip a session?", a: "Prefer not to. If you miss one, the recording — when uploaded — stays on this page for registered learners." },
      { q: "How long do I have access to recordings?", a: "One year from the day you enroll, on this same program page." },
      { q: "Will I get to ask doubts?", a: "Yes. Live Q&A is part of each session. The community room is for follow-ups, not for calls." },
      { q: "Is this investment advice?", a: "No. Bizgarh classrooms are education. You write your own process and size." }
    ],
    bio: `${p.by} hosts this mentorship on Bizgarh. ${mentor.role || "Working trader"}. The desk is process, invalidation, and journal work — not a tip feed.`,
    role: mentor.tag || mentor.role || "Mentor"
  };
}

function mentorPriceHTML(p) {
  return `<div class="mp-price"><b>₹${Number(p.price).toLocaleString("en-IN")}</b><s>₹${Number(p.old).toLocaleString("en-IN")}</s><em>SAVE ${mentorSavePct(p)}%</em></div>`;
}

function mentorCardHTML(p) {
  const enrolled = isMentorEnrolled(p.id);
  return `<a class="mp-card wb-in" href="${mentorHref(p.id)}">
    <div class="mp-shot" style="--mp:${p.tint}">
      <span class="mp-live"><i></i> Live on Bizgarh</span>
      <span class="wb-chip">Bizgarh</span>
      <h3>${escapeHtml(p.title)}</h3>
      <p>by ${escapeHtml(p.by)}</p>
      <img src="${photoFor(p.by)}" alt="">
    </div>
    <div class="mp-body">
      <small>${escapeHtml(webinarWhenShort(p))}</small>
      <h3>${escapeHtml(p.title)}</h3>
      <p>by ${escapeHtml(p.by)}</p>
      ${mentorPriceHTML(p)}
      ${enrolled ? `<em class="mp-in-pill">Enrolled</em>` : ""}
    </div>
  </a>`;
}

function mentorCtaHTML(p, enrolled) {
  if (enrolled) {
    return `<a class="btn btn-primary wb-cta" href="/live-room?id=${encodeURIComponent(p.id)}">Join desk ›</a>
      <a class="btn btn-ghost wb-cta wb-wa" href="${escapeHtml(mentorCommunityUrl(p))}" target="_blank" rel="noopener">${iconSvg("wa")} Join community</a>`;
  }
  return `<button type="button" class="btn btn-primary wb-cta" data-mentor-enroll="${p.id}">Enroll Now ›</button>
    <button type="button" class="btn btn-ghost wb-cta" data-mentor-call="${p.id}">Request a callback</button>`;
}

function enrollMentorProgram(id) {
  sessionStorage.setItem("tradeshalaPendingMentor", id);
  requireAuth(() => {
    sessionStorage.removeItem("tradeshalaPendingMentor");
    const u = getUser();
    const list = mentorEnrolls();
    if (list.some((r) => r.id === id && r.email === u.email)) {
      toast("Already enrolled");
      renderMentorProgramPage();
      return;
    }
    list.push({ id, name: u.name, email: u.email, at: new Date().toISOString() });
    writeList(MENTOR_ENROLL_KEY, list);
    const p = allMentorPrograms().find((x) => x.id === id);
    pushNote({ key: "mentor:" + id, kind: "mentor", title: "You're in the mentorship desk", body: (p?.title || "Mentorship") + " is now in My Mentorship.", href: mentorHref(id) });
    sessionStorage.setItem("tradeshalaMentorPop", "1");
    toast("You're in the mentorship desk");
    if (document.getElementById("programRoot")) renderMentorProgramPage();
    else location.href = mentorHref(id);
    renderMentorListing();
    renderLive();
    renderDashboard();
    renderMyLearning();
  });
}

function requestMentorCallback(id) {
  requireAuth(() => {
    const u = getUser();
    const p = allMentorPrograms().find((x) => x.id === id);
    const key = typeof CALL_KEY === "string" ? CALL_KEY : "tradeshalaCalls";
    const list = readList(key);
    list.push({
      id: "call-" + Date.now(),
      name: u.name,
      email: u.email,
      topic: "Mentorship · " + (p?.title || id),
      date: "",
      time: "",
      mentor: p?.by || "",
      status: "pending",
      notes: "Callback requested from mentorship page",
      at: new Date().toISOString()
    });
    writeList(key, list);
    pushNote({ key: "callback:" + id + ":" + Date.now(), kind: "call", title: "Callback requested", body: "The desk will reach you about " + (p?.title || "this mentorship") + ".", href: mentorHref(id) });
    toast("Callback requested · the desk will reach you");
  });
}

function consumePendingMentor() {
  const id = sessionStorage.getItem("tradeshalaPendingMentor");
  if (!id || !getUser()) return;
  sessionStorage.removeItem("tradeshalaPendingMentor");
  enrollMentorProgram(id);
}

function ensureMentorLive(p) {
  const list = allWebinars();
  if (list.some((x) => x.id === p.id)) return;
  list.push({
    id: p.id,
    title: p.title,
    by: p.by,
    at: p.at,
    when: formatLiveWhen(p.at),
    duration: "90 min",
    kind: "class",
    hostEmail: (p.by || "desk").split(" ")[0].toLowerCase() + "@bizgarh.in",
    notes: p.blurb,
    status: "scheduled",
    joinUrl: ""
  });
  saveWebinars(list);
}

function downloadMentorCurriculum(id) {
  const p = allMentorPrograms().find((x) => x.id === id);
  if (!p) return;
  const pack = mentorPack(p);
  const text = [p.title, "by " + p.by, "", "Live curriculum", ...pack.curriculum.map((x, i) => `${i + 1}. ${x}`)].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  a.download = p.id + "-curriculum.txt";
  a.click();
}

function renderMentorListing() {
  const root = document.getElementById("mentorRoot");
  const strip = document.getElementById("mentorHomeList");
  const programs = allMentorPrograms();
  const upcoming = programs.filter((p) => mentorPhase(p) === "upcoming");
  const ongoing = programs.filter((p) => mentorPhase(p) === "ongoing");
  const listHTML = (rows) => rows.map(mentorCardHTML).join("") || `<p class="muted">None in this list right now.</p>`;
  if (root) {
    if (window.BizgarhSeo) window.BizgarhSeo.apply();
    else document.title = `Mentorship Programs | ${BRAND}`;
    root.innerHTML = `<div class="container">
      <div class="wb-crumb wb-in"><a href="${homeHref()}">Home</a> · Mentorship Programs</div>
      <div class="mp-head wb-in">
        <h1>Live Mentorship Programs</h1>
        <p>${iconSvg("wifi")} ${upcoming.length} upcoming · ${iconSvg("users")} ${ongoing.length} ongoing</p>
        <small>Education only. Bizgarh does not give investment advice or manage portfolios.</small>
      </div>
      <h2 class="wb-list-kicker" data-wb>Upcoming Mentorship Programs</h2>
      <div class="mp-grid">${listHTML(upcoming)}</div>
      <h2 class="wb-list-kicker" data-wb>Ongoing Mentorship Programs</h2>
      <div class="mp-grid">${listHTML(ongoing)}</div>
      ${faqSectionHTML(FAQ_SETS.mentorList)}
    </div>`;
    bindWbMotion(root);
    bindFaqs(root);
  }
  if (strip) {
    strip.innerHTML = `<div class="row-between">
      <div><h2>Mentorship programs</h2><p class="muted">Guided desks with working traders. Enroll, then join live inside Bizgarh.</p></div>
      <a class="btn btn-ghost" href="/mentorship">View all →</a>
    </div>
    <div class="mp-grid" style="margin-top:18px">${upcoming.concat(ongoing).slice(0, 3).map(mentorCardHTML).join("")}</div>`;
  }
}

function renderMentorProgramPage() {
  const root = document.getElementById("programRoot");
  if (!root) return;
  const id = new URLSearchParams(location.search).get("id");
  const p = allMentorPrograms().find((x) => x.id === id) || allMentorPrograms()[0];
  if (!p) {
    root.innerHTML = `<div class="container"><div class="empty"><h3>Program not found</h3><a class="btn btn-primary" href="/mentorship" style="margin-top:12px">All programs</a></div></div>`;
    return;
  }
  ensureMentorLive(p);
  const pack = mentorPack(p);
  const enrolled = isMentorEnrolled(p.id);
  const just = sessionStorage.getItem("tradeshalaMentorPop") === "1";
  if (just) sessionStorage.removeItem("tradeshalaMentorPop");
  const seats = mentorSeatsLeft(p);
  const start = webinarStart(p);
  if (window.BizgarhSeo) window.BizgarhSeo.apply();
  else document.title = `${p.title} | Mentorship | ${BRAND}`;
  root.innerHTML = `<div class="container">
    <div class="wb-crumb wb-in"><a href="${homeHref()}">Home</a> · <a href="/mentorship">Mentorship Programs</a> · ${escapeHtml(p.title)}</div>
    <section class="mp-hero${just ? " wb-just-in" : ""}">
      <div class="mp-hero-copy wb-in">
        ${enrolled ? `<span class="wb-pill in">Already enrolled</span>` : `<span class="wb-pill">${escapeHtml(p.tag)} mentorship</span>`}
        <h1>${escapeHtml(p.title)}</h1>
        <p class="wb-by">${escapeHtml(p.blurb)}</p>
        <div class="mp-when">
          <b>${new Date(p.at).toLocaleString("en-IN", { month: "short" }).toUpperCase()}<span>${new Date(p.at).getDate()}</span></b>
          <div>
            <strong>Starts on ${escapeHtml(webinarDateLabel(p))}</strong>
            <small>${escapeHtml(webinarTimeLabel({ ...p, durationMinutes: 60 }))}</small>
          </div>
        </div>
        ${mentorPriceHTML(p)}
        <div class="wb-hero-ctas">${mentorCtaHTML(p, enrolled)}</div>
      </div>
      <div class="mp-hero-shot wb-in" style="--mp:${p.tint}">
        <span class="mp-live"><i></i> Live on Bizgarh</span>
        <span class="wb-chip">Bizgarh</span>
        <h3>${escapeHtml(p.title)}</h3>
        <p>by ${escapeHtml(p.by)}</p>
        <img src="${photoFor(p.by)}" alt="">
      </div>
    </section>
    <div class="mp-strip" data-wb>
      <span>${iconSvg("clock")} ${p.hours}+ hours of teaching</span>
      <span>${iconSvg("headset")} Doubt solving live on Bizgarh</span>
      <span>${iconSvg("chat")} Exclusive desk community</span>
      <span>${iconSvg("play")} 1 year access to recordings</span>
    </div>
    <section class="wb-block" data-wb>
      <h2>What you will learn</h2>
      <div class="mp-learn">${pack.learn.map((x) => `<p>${iconSvg("check")} <span>${escapeHtml(x)}</span></p>`).join("")}</div>
    </section>
    <section class="mp-overview" data-wb>
      <h2>Program overview</h2>
      <div class="mp-ov-facts">
        <div><small>Starts on</small><b>${escapeHtml(webinarDateLabel(p))}</b></div>
        <div><small>Duration</small><b>${p.weeks} weeks</b></div>
        <div><small>Sessions</small><b>${p.sessions} live sessions</b></div>
      </div>
      <div class="mp-curr-h">
        <h3>Live curriculum</h3>
        <button type="button" class="btn btn-ghost" data-curr="${p.id}">${iconSvg("download")} Download curriculum</button>
      </div>
      <ul class="mp-curr">${pack.curriculum.map((x) => `<li>${iconSvg("check")} ${escapeHtml(x)}</li>`).join("")}</ul>
    </section>
    <section class="wb-block" data-wb>
      <h2>What you will be able to do after this program</h2>
      <div class="mp-out">${pack.outcomes.map((x, i) => `<article><b>${iconSvg(["target", "bars", "clock", "flag"][i] || "check")}</b><p>${escapeHtml(x)}</p></article>`).join("")}</div>
    </section>
    <section class="wb-block mp-instructor" data-wb>
      <h2>Know your instructor</h2>
      <div class="mp-ins">
        <img src="${photoFor(p.by)}" alt="">
        <div>
          <h3>${escapeHtml(p.by)}</h3>
          <p>${escapeHtml(pack.bio)}</p>
          <div class="mp-ins-tags"><span>${escapeHtml(pack.role)}</span><span>Full-time desk</span><span>Bizgarh mentor</span></div>
        </div>
      </div>
    </section>
    <section class="wb-block" data-wb>
      <h2>Key concepts you should know before joining</h2>
      <div class="mp-prep">${pack.prep.map((x) => `<p>${iconSvg("check")} <span>${escapeHtml(x)}</span></p>`).join("")}</div>
    </section>
    <section class="wb-block" data-wb>
      <h2>Who is this program for</h2>
      <div class="mp-who">${pack.who.map((x) => `<article><b>${iconSvg("users")}</b><strong>${escapeHtml(x.t)}</strong><p>${escapeHtml(x.d)}</p></article>`).join("")}</div>
    </section>
    <section class="wb-block" data-wb>
      <h2>How will this program work?</h2>
      <div class="mp-steps">${pack.steps.map((s) => `<article><em>${s.n}</em><h3>${escapeHtml(s.t)}</h3><p>${escapeHtml(s.d)}</p></article>`).join("")}</div>
      <p class="mp-note">The ideas shared on this desk are education only — not investment advice. You write your own process and size.</p>
    </section>
    <section class="mp-seats" data-wb>
      <div>
        <b>First session starts on ${escapeHtml(webinarDateLabel(p))}</b>
        <small>Only ${seats} seats left</small>
      </div>
      ${enrolled ? `<a class="btn btn-primary" href="/live-room?id=${encodeURIComponent(p.id)}">Join desk ›</a>` : `<button type="button" class="btn btn-primary" data-mentor-enroll="${p.id}">Enroll Now ›</button>`}
    </section>
    <section class="wb-block" data-wb>
      <h2>Frequently Asked Questions</h2>
      <div class="wb-faqs">${FAQ_SETS.mentorship.map((f, i) => `
        <article class="wb-faq${i === 0 ? " open" : ""}">
          <button type="button" data-faq>${escapeHtml(f.q)}<i></i></button>
          <div class="ans"><p>${escapeHtml(f.a)}</p></div>
        </article>`).join("")}</div>
    </section>
  </div>
  <div class="mp-stick">
    <div class="mp-stick-in">
      <span>Starts on <b>${escapeHtml(webinarDateLabel(p))}</b></span>
      <span>Duration <b>${p.weeks} weeks</b></span>
      <span>Price <b>₹${Number(p.price).toLocaleString("en-IN")}</b> <s>₹${Number(p.old).toLocaleString("en-IN")}</s></span>
      <div class="mp-stick-cta">${mentorCtaHTML(p, enrolled)}</div>
    </div>
  </div>`;
  bindWbMotion(root);
  startWbCountdown(root);
  bindFaqs(root);
  root.querySelector("[data-curr]")?.addEventListener("click", () => downloadMentorCurriculum(p.id));
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
    <a class="mega-web" href="${webinarHref(w.id)}">
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
        <a href="/mentorship">
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
  const initials = escapeHtml(userInitials(user.name));
  if (place === "mobile") {
    return `<a class="btn btn-ghost" href="/dashboard">My Dashboard</a>
      <a class="btn btn-primary" href="/learning">My Learning</a>
      <a class="btn btn-ghost" href="/account">My Profile</a>
      ${role ? `<a class="btn btn-primary js-open-admin" href="/admin">Admin panel</a>` : ""}
      <button class="btn btn-ghost js-logout" type="button">Logout</button>`;
  }
  return `<a class="btn btn-ghost hdr-learn" href="/learning">My Learning</a>
    ${noteBellHTML()}
    <div class="acct-wrap">
      <button class="hdr-avatar acct-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-label="${first}">${initials}</button>
      <div class="acct-menu" role="menu">
        <a href="/dashboard">${iconSvg("chart")} My Dashboard</a>
        <a href="/learning">${iconSvg("play")} My Learning</a>
        <a href="/account">${iconSvg("users")} My Profile</a>
        ${role ? `<a class="js-open-admin" href="/admin">${iconSvg("lock")} Admin panel</a>` : ""}
        <a href="/contact">${iconSvg("headset")} Help</a>
        <button type="button" class="js-logout">${iconSvg("share")} Logout</button>
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
      <a class="logo" href="${homeHref()}">${brandLogoHTML("h")}</a>
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
    <a href="/dashboard">My Dashboard</a>
    <a href="/learning">My Learning</a>
    <a href="/contact">Help</a>
    <div class="mnav-auth">${authMobile}</div>
  </nav>`;
}

function footerHTML() {
  return `
  <footer class="footer">
    <div class="container">
      <div class="footer-main">
        <div class="footer-brand">
          <a class="logo" href="${homeHref()}">${brandLogoHTML()}</a>
          <p>A classroom for Indian traders and long-term investors. Setups, risk, and process — not a tip feed.</p>
          <a class="footer-mail" href="mailto:desk@bizgarh.com">desk@bizgarh.com</a>
        </div>
        <nav class="footer-nav" aria-label="Footer">
          <div>
            <h4>Classroom</h4>
            <a href="/stock-market-courses">Stock market courses in India</a>
            <a href="/courses">All stock market courses</a>
            <a href="/option-trading-course">Option trading course</a>
            <a href="/nifty-options">Nifty options</a>
            <a href="/technical-analysis-course">Technical analysis</a>
            <a href="/share-market-course-in-hindi">Share market in Hindi</a>
            <a href="/live">Live webinars</a>
            <a href="/mentorship">Trading mentorship</a>
          </div>
          <div>
            <h4>Company</h4>
            <a href="/about">About</a>
            <a href="/reviews">Reviews</a>
            <a href="/contact">Help</a>
            <a href="/dashboard">My Dashboard</a>
            <a href="/learning">My Learning</a>
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
      document.querySelectorAll(".acct-wrap, .note-wrap, .nav-item.mega").forEach((el) => el.classList.remove("open"));
      document.body.classList.remove("nav-dim");
    }
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) setMobileNav(false);
  });
  const finePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const closeDeskMenus = (except) => {
    document.querySelectorAll(".nav-item.mega, .acct-wrap, .note-wrap").forEach((el) => {
      if (el === except) return;
      el.classList.remove("open");
      el.querySelector(".acct-btn, .note-btn")?.setAttribute("aria-expanded", "false");
    });
    if (!except?.classList.contains("mega")) document.body.classList.remove("nav-dim");
  };
  const armHoverDesk = (el, onOpen) => {
    if (!el) return;
    const openNow = () => {
      clearTimeout(el._deskT);
      closeDeskMenus(el);
      el.classList.add("open");
      el.querySelector(".acct-btn, .note-btn")?.setAttribute("aria-expanded", "true");
      onOpen?.(el);
    };
    const closeSoon = () => {
      clearTimeout(el._deskT);
      el._deskT = setTimeout(() => {
        el.classList.remove("open");
        el.querySelector(".acct-btn, .note-btn")?.setAttribute("aria-expanded", "false");
        if (el.classList.contains("mega")) document.body.classList.remove("nav-dim");
      }, 280);
    };
    el.addEventListener("mouseenter", () => {
      if (finePointer()) openNow();
    });
    el.addEventListener("mouseleave", () => {
      if (finePointer()) closeSoon();
    });
  };
  document.querySelectorAll(".nav-item.mega").forEach((item) => {
    armHoverDesk(item, () => document.body.classList.add("nav-dim"));
  });
  armHoverDesk(document.querySelector(".note-wrap"), () => paintNoteBell(false));
  armHoverDesk(document.querySelector(".acct-wrap"));
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
    const noteBtn = e.target.closest(".note-btn");
    if (noteBtn) {
      if (finePointer()) return;
      const wrap = noteBtn.closest(".note-wrap");
      const open = !wrap.classList.contains("open");
      closeDeskMenus(open ? wrap : null);
      wrap.classList.toggle("open", open);
      noteBtn.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) paintNoteBell(false);
      return;
    }
    if (e.target.closest("[data-note-read]")) {
      markNotesRead();
      return;
    }
    const noteItem = e.target.closest("[data-note-id]");
    if (noteItem) {
      const id = noteItem.getAttribute("data-note-id");
      notesSave(notesAll().map((n) => n.id === id ? { ...n, read: true } : n));
    }
    const acctBtn = e.target.closest(".acct-btn");
    if (acctBtn) {
      if (finePointer()) return;
      const wrap = acctBtn.closest(".acct-wrap");
      const open = !wrap.classList.contains("open");
      closeDeskMenus(open ? wrap : null);
      wrap.classList.toggle("open", open);
      acctBtn.setAttribute("aria-expanded", open ? "true" : "false");
      return;
    }
    if (!e.target.closest(".acct-wrap") && !e.target.closest(".note-wrap") && !e.target.closest(".nav-item.mega")) {
      closeDeskMenus(null);
    }
    if (e.target.closest(".js-logout")) {
      localStorage.removeItem(USER_KEY);
      clearStaffSession();
      fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
      toast("Logged out");
      location.href = "/";
    }
  });
  document.addEventListener("click", (e) => {
    if (!getUser()) return;
    const a = e.target.closest("a[href]");
    if (!a || a.classList.contains("js-logout")) return;
    if (isPublicHomeHref(a.getAttribute("href"))) {
      e.preventDefault();
      location.href = "/dashboard";
    }
  }, true);
  window.addEventListener("popstate", sendLoggedInHomeToDashboard);
  window.addEventListener("pageshow", sendLoggedInHomeToDashboard);
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
    afterAuthArrive();
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
    const c = allCourses().find((x) => x.id === id);
    pushNote({ key: "course:" + id, kind: "course", title: "Classroom unlocked", body: (c?.title || "Course") + " is now in My Learning.", href: "/course?id=" + encodeURIComponent(id) });
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
  const meta = webinarProfile(w);
  const enrolled = isWebinarRegistered(w.id);
  return `
    <a class="wb-card webinar-card" href="${webinarHref(w.id)}">
      <div class="wb-card-shot">${webinarBannerHTML(w, i)}</div>
      <div class="wb-card-body">
        <span class="wb-card-when">${escapeHtml(webinarWhenShort(w))}</span>
        <h3>${escapeHtml(w.title)}</h3>
        <p>by ${escapeHtml(w.by)}</p>
        <div class="wb-card-foot">
          ${meta.price ? `<b>₹${Number(meta.price).toLocaleString("en-IN")}</b>` : `<b>FREE</b><s>₹${Number(meta.listPrice).toLocaleString("en-IN")}</s>`}
          ${enrolled ? `<em>Enrolled</em>` : ""}
        </div>
      </div>
    </a>`;
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

function courseBuyBoxHTML(c, langs, watchers, extraClass) {
  return `<aside class="cd-buy${extraClass ? ` ${extraClass}` : ""}">
        <ul class="cd-facts">
          <li>${iconSvg("badge")} <span>${c.learners} Learners Enrolled</span></li>
          <li>${iconSvg("bars")} <span>${courseLevel(c)}</span></li>
          <li>${iconSvg("wifi")} <span>${c.hours} hrs of Content</span></li>
          <li>${iconSvg("chat")} <span>${langs.join(", ")}</span></li>
          <li>${iconSvg("target")} <span>1 Year Access</span></li>
          <li>${iconSvg("badge")} <span>Earn a Certificate</span></li>
        </ul>
        <div class="cd-price">₹${Number(c.price).toLocaleString("en-IN")}</div>
        <button class="btn btn-primary btn-block cd-cta js-enroll">Buy Now →</button>
        <button type="button" class="btn btn-ghost btn-block cd-comm-cta locked js-comm-lock">
          <span class="cd-lock-on" aria-hidden="true">${iconSvg("lock")}</span>
          Community
        </button>
        <p class="cd-watch"><i></i> ${watchers} learners watching right now</p>
      </aside>`;
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
  if (window.BizgarhSeo) window.BizgarhSeo.apply();
  else document.title = `${c.title} | ${BRAND}`;

  box.innerHTML = `
    <div class="cd-layout${owned ? " is-owned" : ""}">
      <div class="cd-head">
        <nav class="cd-crumb">
          <a href="${homeHref()}">Home</a><span>/</span>
          <a href="/courses">All Courses</a><span>/</span>
          <b>${c.title}</b>
        </nav>
        <span class="cd-pill">${catLabel(c.cat).toUpperCase()}</span>
        <h1 class="cd-title">${c.title}</h1>
      </div>

      ${owned
        ? `<div id="learnRoot" class="cd-classroom"></div>`
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
        </div>
        ${courseBuyBoxHTML(c, langs, watchers)}`}

      <div class="cd-body">
        ${owned ? `<div id="certAward"></div>${courseOverviewCardHTML(c, true)}` : ""}
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
        ${faqSectionHTML(FAQ_SETS.course)}
      </div>
    </div>`;

  document.querySelectorAll(".js-enroll").forEach((btn) => {
    btn.addEventListener("click", () => enroll(c.id));
  });
  const lockCommunity = () => {
    toast("Buy this course to unlock the community");
    document.querySelector(".js-enroll")?.focus();
  };
  document.querySelectorAll(".js-comm-lock").forEach((btn) => {
    btn.addEventListener("click", lockCommunity);
  });
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
  bindFaqs(box);
}

function courseThumbHTML(c) {
  const art = COVERS[c.cover] || { bg: "linear-gradient(135deg,#4f46e5,#1e1b4b)", title: c.title };
  const photo = photoFor(c.instructor);
  return `<div class="thumb" style="background:${art.bg}">
    <img class="person" src="${photo}" alt="">
    <div class="cover-copy"><h3>${art.title}</h3></div>
  </div>`;
}

function resumeFor(email, courseId) {
  const lessons = lessonsFor(courseId);
  const p = typeof learnerProgress === "function" ? learnerProgress(email, courseId) : { lessons: {} };
  const last = Number(p.lastIdx);
  let i = Number.isInteger(last) && last >= 0 && last < lessons.length ? last : lessons.findIndex((_, n) => !p.lessons?.[n]);
  if (i < 0) i = 0;
  return { i, lesson: lessons[i] || lessons[0], done: Object.keys(p.lessons || {}).filter((k) => p.lessons[k]).length };
}

function timeLeftLabel(c, pct) {
  const hours = Number(c.hours) || 0;
  const left = Math.max(0, hours * (1 - (Number(pct) || 0) / 100));
  if (left >= 1) return Math.round(left) + "h 00m left";
  const mins = Math.max(1, Math.round(left * 60));
  return mins + "m left";
}

function ownedCourses(email) {
  const ids = enrolled();
  return allCourses().filter((c) => ids.includes(c.id)).map((c) => {
    const stats = typeof courseCompletion === "function" ? courseCompletion(email, c.id) : { pct: 0, cert: false };
    return { c, stats, resume: resumeFor(email, c.id) };
  });
}

function learnerGateHTML() {
  return `<div class="ld"><div class="empty"><h3>Login to see your classroom</h3><p class="muted">Purchased courses appear here after login.</p><button class="btn btn-primary" data-open="loginModal" style="margin-top:12px">Login</button></div></div>`;
}

function renderDashboard() {
  const root = document.getElementById("learnerHome") || document.getElementById("myCourses");
  if (!root) return;
  const user = getUser();
  if (!user) {
    root.innerHTML = learnerGateHTML();
    return;
  }
  const mine = ownedCourses(user.email);
  const cont = mine.find((x) => x.stats.pct < 100) || mine[0];
  const rec = allCourses().filter((c) => !enrolled().includes(c.id)).slice(0, 8);
  const nextLive = myWebinars(user.email)
    .map((x) => x.w)
    .filter((w) => w.status !== "ended")
    .sort((a, b) => (webinarStart(a)?.getTime() || 0) - (webinarStart(b)?.getTime() || 0))[0];
  const upLiveHTML = nextLive ? `<div class="ld-uplive">
      <h2>Your upcoming live sessions</h2>
      <article>
        <div>
          <div class="ld-uplive-top">
            <span>WEBINAR</span>
            ${countdownLineHTML(webinarStart(nextLive))}
          </div>
          <h3>${escapeHtml(nextLive.title)}</h3>
          <p>by ${escapeHtml(nextLive.by)}</p>
          <small>${iconSvg("cal")} ${escapeHtml(webinarDateLabel(nextLive))} · ${escapeHtml(webinarTimeLabel(nextLive))}</small>
          <a class="btn btn-ghost" href="${webinarHref(nextLive.id)}">View Details ›</a>
        </div>
        <img src="${photoFor(nextLive.by)}" alt="">
      </article>
    </div>` : "";
  const mineMentors = myMentorships(user.email);
  const nextMentor = mineMentors.filter((p) => mentorPhase(p) !== "ended")[0] || mineMentors[0];
  const myMentorHTML = `<div class="ld-mentor">
      <div class="ld-row-h"><h2>My Mentorship</h2><a href="/mentorship">${mineMentors.length ? "View all ›" : "Browse ›"}</a></div>
      ${nextMentor ? `<a class="ld-mentor-card" href="${mentorHref(nextMentor.id)}">
        <div class="mp-shot" style="--mp:${nextMentor.tint}">
          <span class="mp-live"><i></i> ${mentorPhase(nextMentor) === "upcoming" ? "Upcoming" : "Ongoing"}</span>
          <img src="${photoFor(nextMentor.by)}" alt="">
        </div>
        <div>
          <small>${escapeHtml(webinarDateLabel(nextMentor))} · ${nextMentor.weeks} weeks</small>
          <h3>${escapeHtml(nextMentor.title)}</h3>
          <p>by ${escapeHtml(nextMentor.by)}</p>
          <span class="go">Open program ›</span>
        </div>
      </a>` : `<div class="ld-empty" style="padding:28px 8px"><p>No mentorship desk yet.</p><a class="btn btn-primary" href="/mentorship">Browse programs</a></div>`}
    </div>`;
  const continueHTML = cont
    ? `<a class="ld-resume" href="/course?id=${encodeURIComponent(cont.c.id)}&lesson=${cont.resume.i}">
        <div class="ld-shot">${courseThumbHTML(cont.c)}<span class="ld-play"><i><svg viewBox="0 0 10 10"><path d="M2 1.2v7.6L8.5 5Z"/></svg></i> Continue learning</span></div>
        <h3>${escapeHtml(cont.c.title)}</h3>
        <div class="ld-from">Resume from: ${escapeHtml(cont.resume.lesson?.t || "Lesson 1")}</div>
        <div class="ld-meter"><div class="ld-track"><i style="width:${cont.stats.pct}%"></i></div><b>${cont.stats.pct}% · ${timeLeftLabel(cont.c, cont.stats.pct)}</b></div>
      </a>`
    : `<div class="empty" style="text-align:left;max-width:420px"><h3>No classroom yet</h3><p class="muted">Buy a course and it appears here to continue.</p><a class="btn btn-primary" href="/courses" style="margin-top:12px">Browse courses</a></div>`;
  root.innerHTML = `<div class="ld">
    <div class="ld-welcome">
      <h1>Welcome back, ${escapeHtml(user.name)} 👋</h1>
      <p>Continue where you left off.</p>
    </div>
    <div class="ld-continue">${continueHTML}</div>
    <div class="ld-split">
      <div>
        ${upLiveHTML}
        ${myMentorHTML}
        <div class="ld-row-h"><h2>Recommended courses for you</h2><a href="/courses">View All ›</a></div>
        <div class="ld-rec">${rec.map((c) => courseCard(c, "grid-card")).join("") || `<p class="muted">You already own the library.</p>`}</div>
        <div class="ld-row-h" style="margin-top:28px"><h2>Explore by category</h2></div>
        <div class="ld-cats">${CATEGORIES.map((cat) => `
          <a class="ld-cat" href="/courses?cat=${courseFilterFromCat(cat.id)}#library">
            <span style="background:${cat.tint};color:${cat.color}">${iconSvg(cat.icon)}</span>
            <strong>${escapeHtml(cat.title)}</strong>
          </a>`).join("")}</div>
        <div class="ld-row-h"><h2>Explore Bizgarh</h2></div>
        <div class="ld-ex">
          <a href="/courses"><span class="ld-ex-ico">${iconSvg("layers")}</span><strong>Courses</strong><em>Setup-first classrooms for Indian traders</em><i class="go">›</i></a>
          <a href="/live#webinars"><span class="ld-ex-ico">${iconSvg("wifi")}</span><strong>Live Webinars</strong><em>Live sessions with market desks</em><i class="go">›</i></a>
          <a href="/mentorship"><span class="ld-ex-ico">${iconSvg("users")}</span><strong>Live Mentorships</strong><em>Guided programs with working traders</em><i class="go">›</i></a>
          <a class="on" href="/live#call"><span class="ld-ex-ico">${iconSvg("headset")}</span><strong>1:1 Guidance</strong><em>Book a personal call with a mentor</em><i class="go">›</i></a>
        </div>
      </div>
      <aside class="ld-side">
        <div class="ld-promo">
          <h3>Live rooms and 1:1s this week</h3>
          <p>Sit with a working desk. No tip feed — just process.</p>
          <a class="btn btn-primary" href="/live">Join live ›</a>
        </div>
        <div class="ld-quick">
          <h3>Quick Actions</h3>
          <a href="/learning">${iconSvg("play")} My Learning</a>
          <a href="/learning#mentors">${iconSvg("users")} My Mentorship</a>
          <a href="/learning#certs">${iconSvg("badge")} My Certificates</a>
          <a href="/contact">${iconSvg("headset")} Help</a>
        </div>
      </aside>
    </div>
    ${faqSectionHTML(FAQ_SETS.dashboard)}
  </div>`;
  startWbCountdown(root);
  bindWbMotion(root);
  bindFaqs(root);
}

function myWebinars(email) {
  const regs = readList(REGS_KEY).filter((r) => r.email === email);
  return allWebinars().filter((w) => regs.some((r) => r.id === w.id)).map((w) => ({
    w,
    registered: true
  }));
}

function renderMyLearning() {
  const root = document.getElementById("myLearning");
  if (!root) return;
  const user = getUser();
  if (!user) {
    root.innerHTML = learnerGateHTML();
    return;
  }
  const tab = (location.hash || "#courses").replace("#", "");
  const chip = (root.dataset.chip || "ongoing");
  const mine = ownedCourses(user.email);
  const ongoing = mine.filter((x) => x.stats.pct < 100);
  const done = mine.filter((x) => x.stats.pct >= 100);
  const shown = tab === "webinars" || tab === "certs" || tab === "mentors" ? [] : (chip === "completed" ? done : ongoing);
  const webs = myWebinars(user.email);
  const webChip = chip === "completed";
  const webShown = webs.filter((x) => webChip ? x.w.status === "ended" : x.w.status !== "ended");
  const mentors = myMentorships(user.email);
  const mentorChip = chip === "completed";
  const mentorShown = mentors.filter((p) => mentorChip ? mentorPhase(p) === "ended" : mentorPhase(p) !== "ended");
  const certRows = mine.filter((x) => x.stats.cert || (typeof certFor === "function" && certFor(user.email, x.c.id)));
  root.innerHTML = `<div class="ld">
    <div class="ld-crumb"><a href="${homeHref()}">Home</a> · My Learning</div>
    <h1 class="ld-title">My Learning</h1>
    <div class="ld-tabs">
      <button type="button" data-ltab="courses" class="${tab !== "webinars" && tab !== "certs" && tab !== "mentors" ? "on" : ""}">${iconSvg("layers")} My Courses <b>${mine.length}</b></button>
      <button type="button" data-ltab="webinars" class="${tab === "webinars" ? "on" : ""}">${iconSvg("wifi")} Webinars <b>${webs.length}</b></button>
      <button type="button" data-ltab="mentors" class="${tab === "mentors" ? "on" : ""}">${iconSvg("users")} My Mentorship <b>${mentors.length}</b></button>
      <button type="button" data-ltab="certs" class="${tab === "certs" ? "on" : ""}">${iconSvg("badge")} My Certificates <b>${certRows.length}</b></button>
    </div>
    ${tab === "mentors" ? `
      <button class="ld-chip ${mentorChip ? "off" : ""}" data-lchip="ongoing" type="button">Ongoing</button>
      <button class="ld-chip ${mentorChip ? "" : "off"}" data-lchip="completed" type="button">Completed</button>
      <div class="mp-grid ld-mp">${mentorShown.length ? mentorShown.map(mentorCardHTML).join("") : `<div class="ld-empty"><p>No mentorship desks in this list.</p><a class="btn btn-primary" href="/mentorship">Browse programs</a></div>`}</div>
    ` : tab === "certs" ? `
      <div class="ld-cert-grid">${certRows.length ? certRows.map((x) => `
        <article class="ld-cert">
          <div class="ld-shot">${courseThumbHTML(x.c)}</div>
          <div class="ld-cert-body">
            <h3>${escapeHtml(x.c.title)}</h3>
            <small>by ${escapeHtml(x.c.instructor)}</small>
            <div class="ld-cert-actions">
              <a class="btn btn-ghost" href="/certificate?course=${encodeURIComponent(x.c.id)}">View</a>
              <button type="button" class="btn btn-primary" data-cert-download="${x.c.id}">Download</button>
            </div>
          </div>
        </article>`).join("") : `<div class="ld-empty"><p>Finish a classroom to earn a certificate.</p><a class="btn btn-primary" href="/courses">Browse courses</a></div>`}</div>
    ` : tab === "webinars" ? `
      <button class="ld-chip ${webChip ? "off" : ""}" data-lchip="ongoing" type="button">Ongoing</button>
      <button class="ld-chip ${webChip ? "" : "off"}" data-lchip="completed" type="button">Completed</button>
      <div class="ld-web">${webShown.length ? webShown.map((row, i) => `
        <a href="${webinarHref(row.w.id)}">
          ${webinarBannerHTML(row.w, i)}
          <div class="body">
            <small class="${row.w.status === "ended" ? "ended" : ""}">${row.w.status === "ended" ? "Ended" : (row.w.when || "Upcoming")}</small>
            <h3>${escapeHtml(row.w.title)}</h3>
            <p class="muted">by ${escapeHtml(row.w.by)}</p>
          </div>
        </a>`).join("") : `<div class="ld-empty"><p>No webinars in this list yet.</p><a class="btn btn-primary" href="/live">Browse live classes</a></div>`}</div>
    ` : `
      <button class="ld-chip ${chip === "completed" ? "off" : ""}" data-lchip="ongoing" type="button">Ongoing</button>
      <button class="ld-chip ${chip === "completed" ? "" : "off"}" data-lchip="completed" type="button">Completed</button>
      <div class="ld-learn-grid">${shown.length ? shown.map((x) => `
        <a class="ld-own" href="/course?id=${encodeURIComponent(x.c.id)}&lesson=${x.resume.i}">
          <div class="ld-shot">${courseThumbHTML(x.c)}
            <span class="ld-own-meta">${x.stats.pct}% · ${timeLeftLabel(x.c, x.stats.pct)}</span>
            <span class="ld-own-bar"><i style="width:${x.stats.pct}%"></i></span>
          </div>
          <h3>${escapeHtml(x.c.title)}</h3>
          <small>by ${escapeHtml(x.c.instructor)}</small>
          <span class="go">Continue watching ›</span>
        </a>`).join("") : `<div class="ld-empty"><p>${chip === "completed" ? "No completed classrooms yet." : "No ongoing classrooms. Buy a course to start."}</p>        <a class="btn btn-primary" href="/courses">Browse courses</a></div>`}</div>
    `}
    ${faqSectionHTML(FAQ_SETS.learning)}
  </div>`;
  root.dataset.chip = chip;
  root.querySelectorAll("[data-ltab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      history.replaceState({}, "", "/learning#" + btn.dataset.ltab);
      renderMyLearning();
    });
  });
  root.querySelectorAll("[data-lchip]").forEach((btn) => {
    btn.addEventListener("click", () => {
      root.dataset.chip = btn.dataset.lchip;
      renderMyLearning();
    });
  });
  bindFaqs(root);
}

function renderAccountPage() {
  const root = document.getElementById("accountRoot");
  if (!root) return;
  const user = getUser();
  if (!user) {
    root.innerHTML = learnerGateHTML();
    return;
  }
  const row = (typeof findStudent === "function" ? findStudent(user.email) : null) || user;
  const p = row.profile || {};
  const hash = (location.hash || "#edit").replace("#", "") || "edit";
  const mine = ownedCourses(user.email);
  const certRows = mine.filter((x) => x.stats.cert || (typeof certFor === "function" && certFor(user.email, x.c.id)));
  const buys = readList(ALL_ENROLL_KEY).filter((e) => e.email === user.email);
  const tickets = readList(TICKETS_KEY).filter((t) => t.email === user.email);
  const tkTab = root.dataset.tk || "open";
  const tkMap = {
    open: tickets.filter((t) => t.status === "OPEN"),
    progress: tickets.filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS"),
    closed: tickets.filter((t) => t.status === "CLOSED")
  };
  const panes = {
    edit: `<h2>Account info</h2>
      <form id="profileForm" class="form-card" style="max-width:none;box-shadow:none;border:0;padding:0">
        <div class="field"><label>Name</label><input name="name" required value="${escapeHtml(row.name || "")}"></div>
        <div class="field"><label>Phone number</label><input name="phone" value="${escapeHtml(p.phone || "")}"></div>
        <div class="field"><label>Email ID</label><input name="email" value="${escapeHtml(row.email || "")}" disabled></div>
        <div class="field"><label>Gender</label><div class="radios">
          ${["Male", "Female", "Prefer not to say"].map((g) => `<label><input type="radio" name="gender" value="${g}" ${p.gender === g ? "checked" : ""}> ${g}</label>`).join("")}
        </div></div>
        <div class="field"><label>Date of birth</label><input name="dob" type="date" value="${escapeHtml(p.dob || "")}"></div>
        <div class="field"><label>Interested in</label><div class="radios">
          ${["Trading", "Investing", "Both"].map((g) => `<label><input type="radio" name="interest" value="${g}" ${p.interest === g ? "checked" : ""}> ${g}</label>`).join("")}
        </div></div>
        <div class="field"><label>Experience in the market</label><div class="radios">
          ${["0-1 year", "1-3 years", "3+ years"].map((g) => `<label><input type="radio" name="marketExp" value="${g}" ${p.marketExp === g ? "checked" : ""}> ${g}</label>`).join("")}
        </div></div>
        <div class="field"><label>Country</label><input name="country" value="${escapeHtml(p.country || "India")}"></div>
        <div class="field"><label>State</label><input name="state" value="${escapeHtml(p.state || "")}"></div>
        <div class="field"><label>City</label><input name="city" value="${escapeHtml(p.city || "")}"></div>
        <div class="field"><label>Pin code</label><input name="pin" value="${escapeHtml(p.pin || "")}"></div>
        <button class="btn btn-primary btn-block">Save changes</button>
      </form>`,
    certs: `<h2>My certificates</h2>${certRows.length ? certRows.map((x) => `<div class="info-card" style="margin-bottom:12px"><strong>${escapeHtml(x.c.title)}</strong><div class="cert-mini-links" style="margin-top:8px"><a href="/certificate?course=${x.c.id}">View certificate</a> <button type="button" class="btn btn-primary" data-cert-download="${x.c.id}">Download</button></div></div>`).join("") : `<div class="ld-empty"><p>Finish a classroom to earn a certificate.</p><a class="btn btn-primary" href="/learning">My Learning</a></div>`}`,
    purchases: `<h2>My purchases</h2>${buys.length || mine.length ? (buys.length ? buys : mine.map((x) => ({ courseId: x.c.id, at: "" }))).map((b) => {
      const c = allCourses().find((x) => x.id === b.courseId);
      return `<div class="info-card" style="margin-bottom:12px"><strong>${escapeHtml(c?.title || b.courseId)}</strong><p class="muted">${c ? "₹" + Number(c.price).toLocaleString("en-IN") : ""}${b.at ? " · " + new Date(b.at).toLocaleDateString("en-IN") : ""}</p><a href="/course?id=${encodeURIComponent(b.courseId)}">Open classroom</a></div>`;
    }).join("") : `<div class="ld-empty"><p>No purchases yet.</p><a class="btn btn-primary" href="/courses">Browse courses</a></div>`}`,
    tickets: `<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
        <div class="tk-tabs">
          <button type="button" data-tk="open" class="${tkTab === "open" ? "on" : ""}">Open</button>
          <button type="button" data-tk="progress" class="${tkTab === "progress" ? "on" : ""}">In Progress</button>
          <button type="button" data-tk="closed" class="${tkTab === "closed" ? "on" : ""}">Closed</button>
        </div>
        <a class="btn btn-ghost" href="/contact">Raise a Ticket</a>
      </div>
      ${tkMap[tkTab]?.length ? tkMap[tkTab].map((t) => `<div class="info-card" style="margin:12px 0"><strong>${escapeHtml(t.title)}</strong><p class="muted">${escapeHtml(t.body || "")}</p></div>`).join("") : `<div class="ld-empty"><p>No queries yet</p><a class="btn btn-primary" href="/contact">Raise a Ticket</a></div>`}`
  };
  const pane = panes[hash] || panes.edit;

  root.innerHTML = `<div class="ld-acct">
    <nav>
      <a href="/account#edit" class="${hash === "edit" ? "on" : ""}">Edit Profile</a>
      <a href="/account#certs" class="${hash === "certs" ? "on" : ""}">My Certificates</a>
      <a href="/account#purchases" class="${hash === "purchases" ? "on" : ""}">My Purchases</a>
      <a href="/account#tickets" class="${hash === "tickets" ? "on" : ""}">My Tickets</a>
    </nav>
    <section>${pane}</section>
  </div>`;
  root.dataset.tk = tkTab;
  document.getElementById("profileForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const profile = {
      phone: f.phone.value.trim(),
      gender: (f.gender?.value || p.gender || ""),
      dob: f.dob.value,
      interest: f.interest?.value || p.interest || "",
      marketExp: f.marketExp?.value || p.marketExp || "",
      country: f.country.value.trim(),
      state: f.state.value.trim(),
      city: f.city.value.trim(),
      pin: f.pin.value.trim()
    };
    const next = { ...row, name: f.name.value.trim(), profile };
    upsertUser(next);
    setUser({ ...getUser(), name: next.name });
    toast("Profile saved");
    renderAccountPage();
  });
  root.querySelectorAll("[data-tk]").forEach((btn) => {
    btn.addEventListener("click", () => {
      root.dataset.tk = btn.dataset.tk;
      renderAccountPage();
    });
  });
}

function liveActionBtn(w) {
  if (w.status === "ended") return `<span class="muted" style="display:block;margin:8px 14px 14px">This class has ended.</span>`;
  if (w.status === "live") return `<a class="btn btn-primary" style="margin:8px 14px 14px" href="/live-room?id=${w.id}">Join now</a>`;
  return `<button class="btn btn-primary" style="margin:8px 14px 14px" data-register="${w.id}">Register free</button>`;
}

function liveKindOf(w) {
  return w && w.kind === "class" ? "class" : "webinar";
}

function callJoinPath(id) {
  return "/live-room?type=call&id=" + encodeURIComponent(id);
}

function hmsApiUrl(path) {
  return path;
}

function safeMediaUrl(url) {
  try {
    const u = new URL(String(url || "").trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") return "";
    return u.href;
  } catch {
    return "";
  }
}

function youtubeIdFromUrl(url) {
  const u = safeMediaUrl(url);
  if (!u) return "";
  const m = u.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : "";
}

function introPlayerHTML(url) {
  const raw = safeMediaUrl(url);
  if (!raw) return `<div class="live-cam">Class starts soon. Stay on this page — the teacher will go live here.</div>`;
  const yt = youtubeIdFromUrl(raw);
  if (yt) {
    return `<iframe class="hms-frame" title="Intro video" src="https://www.youtube.com/embed/${yt}?rel=0&modestbranding=1" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
  }
  if (/\.(mp4|webm|ogg)(\?|#|$)/i.test(raw)) {
    return `<video class="hms-frame" src="${escapeHtml(raw)}" controls playsinline preload="metadata"></video>`;
  }
  return `<iframe class="hms-frame" title="Intro video" src="${escapeHtml(raw)}" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
}

async function mountHmsFrame(el, opts) {
  if (!el) return;
  el.innerHTML = `<div class="live-cam">Connecting classroom…</div>`;
  try {
    const res = await fetch(hmsApiUrl("/api/live/room"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: opts.kind,
        id: opts.id,
        title: opts.title,
        duration: opts.duration,
        asHost: !!opts.asHost
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!data.ok || !data.joinUrl) throw new Error(data.error || "Could not open the live room");
    const src = data.joinUrl + (data.joinUrl.includes("?") ? "&" : "?") + "userName=" + encodeURIComponent(opts.userName || "Guest");
    el.innerHTML = `<iframe class="hms-frame" title="Live classroom" src="${src}" allow="camera *; microphone *; fullscreen *; display-capture *; autoplay *; clipboard-write *" allowfullscreen></iframe>`;
  } catch (err) {
    el.innerHTML = `<div class="live-cam">${escapeHtml(err.message || "Live room unavailable")}</div>`;
  }
}

function renderLive() {
  const webinars = allWebinars().filter((w) => liveKindOf(w) === "webinar");
  const classes = allWebinars().filter((w) => liveKindOf(w) === "class");
  const upcoming = webinars.filter((w) => w.status !== "ended");
  const catalog = document.getElementById("liveCatalog");
  if (catalog) {
    catalog.innerHTML = `<section class="wb-list" id="webinars">
      <div class="container">
        <div class="wb-crumb wb-in"><a href="${homeHref()}">Home</a> · Live Webinars</div>
        <div class="wb-list-head wb-in">
          <h1>Live stock market webinars</h1>
          <p>${iconSvg("wifi")} ${upcoming.length} webinar${upcoming.length === 1 ? "" : "s"}</p>
        </div>
        <h2 class="wb-list-kicker wb-in" data-wb>Upcoming Webinars</h2>
        <div class="wb-grid">${upcoming.length ? upcoming.map((w, i) => webinarCardHTML(w, i)).join("") : `<p class="muted">No webinars scheduled.</p>`}</div>
        ${faqSectionHTML(FAQ_SETS.webinarList)}
      </div>
    </section>`;
    bindWbMotion(catalog);
    bindFaqs(catalog);
  }
  const classList = document.getElementById("classList");
  if (classList) {
    const box = classList.closest("section");
    if (!classes.length) {
      if (box) box.hidden = true;
    } else {
      if (box) box.hidden = false;
      classList.innerHTML = classes.map((w, i) => webinarCardHTML(w, i)).join("");
    }
  }
}

function registerForWebinar(id) {
  sessionStorage.setItem("tradeshalaPendingWebinar", id);
  requireAuth(() => {
    sessionStorage.removeItem("tradeshalaPendingWebinar");
    const u = getUser();
    const regs = readList(REGS_KEY);
    if (regs.some((r) => r.id === id && r.email === u.email)) {
      toast("Already registered");
      renderWebinarPage();
      renderLive();
      return;
    }
    regs.push({ id, name: u.name, email: u.email, at: new Date().toISOString() });
    writeList(REGS_KEY, regs);
    const w = allWebinars().find((x) => x.id === id);
    pushNote({ key: "webinar:" + id, kind: "webinar", title: "Webinar enrolled", body: (w?.title || "Live session") + " · Join from the webinar page.", href: webinarHref(id) });
    sessionStorage.setItem("tradeshalaWebinarPop", "1");
    toast("You're enrolled");
    if (document.getElementById("webinarRoot")) renderWebinarPage();
    else location.href = webinarHref(id);
    renderLive();
    renderHomeExtras();
    renderDashboard();
    renderMyLearning();
    renderLiveRoom();
  });
}

function consumePendingWebinar() {
  const id = sessionStorage.getItem("tradeshalaPendingWebinar");
  if (!id || !getUser()) return;
  sessionStorage.removeItem("tradeshalaPendingWebinar");
  registerForWebinar(id);
}

function webinarCtaHTML(w, registered) {
  if (w.status === "ended") {
    return w.recordUrl
      ? `<a class="btn btn-primary wb-cta" href="${escapeHtml(w.recordUrl)}" target="_blank" rel="noopener">Watch recording</a>`
      : `<span class="btn btn-ghost wb-cta is-off">This webinar has ended</span>`;
  }
  if (registered) {
    const join = w.status === "live"
      ? `<a class="btn btn-primary wb-cta" href="/live-room?id=${encodeURIComponent(w.id)}">Join Now ›</a>`
      : `<a class="btn btn-primary wb-cta" href="/live-room?id=${encodeURIComponent(w.id)}">Join Now ›</a>`;
    return `${join}<a class="btn btn-ghost wb-cta wb-wa" href="${escapeHtml(webinarCommunityUrl(w))}" target="_blank" rel="noopener">${iconSvg("wa")} Join community</a>`;
  }
  return `<button type="button" class="btn btn-primary wb-cta" data-register="${w.id}">Enroll Now ›</button>`;
}

function renderWebinarPage() {
  const root = document.getElementById("webinarRoot");
  if (!root) return;
  const id = new URLSearchParams(location.search).get("id");
  const list = allWebinars();
  const w = list.find((x) => x.id === id) || list[0];
  if (!w) {
    root.innerHTML = `<div class="container"><div class="empty"><h3>Webinar not found</h3><a class="btn btn-primary" href="/live" style="margin-top:12px">All webinars</a></div></div>`;
    return;
  }
  const meta = webinarProfile(w);
  const user = getUser();
  const regs = readList(REGS_KEY).filter((r) => r.id === w.id);
  const registered = isWebinarRegistered(w.id);
  const justIn = sessionStorage.getItem("tradeshalaWebinarPop") === "1";
  if (justIn) sessionStorage.removeItem("tradeshalaWebinarPop");
  const seatsLeft = Math.max(0, meta.seats - regs.length);
  const faces = regs.slice(0, 3).map((r) => `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&background=eef2ff&color=4f46e5&size=64`);
  while (faces.length < 3) faces.push(photoFor(w.by));
  const start = webinarStart(w);
  const idx = list.findIndex((x) => x.id === w.id);
  if (window.BizgarhSeo) window.BizgarhSeo.apply();
  else document.title = `${w.title} | Webinar | ${BRAND}`;
  const priceHTML = meta.price
    ? `<div class="wb-price"><b>₹${Number(meta.price).toLocaleString("en-IN")}</b></div>`
    : `<div class="wb-price"><b>FREE</b><s>₹${Number(meta.listPrice).toLocaleString("en-IN")}</s><em>100% OFF</em></div>`;
  const facts = `
    <ul class="wb-facts">
      <li>${iconSvg("cal")} ${escapeHtml(webinarDateLabel(w))}</li>
      <li>${iconSvg("clock")} ${escapeHtml(webinarTimeLabel(w))}</li>
      <li>${iconSvg("globe")} ${escapeHtml(meta.lang)}</li>
      <li>${iconSvg("badge")} Certificate of Participation</li>
    </ul>`;
  const sideCard = `
    <aside class="wb-side" data-wb>
      ${registered ? `<div class="wb-mini">${webinarBannerHTML(w, idx)}${webinarCtaHTML(w, true)}</div>` : ""}
      ${facts}
      ${registered ? "" : webinarCtaHTML(w, false)}
      <p class="wb-or">or</p>
      <a class="btn btn-ghost wb-soft" href="/courses">Browse classrooms after this session</a>
      <div class="wb-starts">
        <small>Webinar Starts In</small>
        ${countdownHTML(start, "Webinar starts in")}
      </div>
    </aside>`;

  const hero = registered ? `
    <section class="wb-hero is-in${justIn ? " wb-just-in" : ""}">
      <div class="wb-hero-copy wb-in">
        <span class="wb-pill in">Already enrolled</span>
        <h1>${escapeHtml(w.title)}</h1>
        <p class="wb-by">by ${escapeHtml(w.by)}</p>
        <div class="wb-meta-row">
          <span>${iconSvg("cal")} Date: ${escapeHtml(webinarDateLabel(w))}</span>
          <span>${iconSvg("clock")} Time: ${escapeHtml(webinarTimeLabel(w))}</span>
        </div>
        <div class="wb-hero-ctas">${webinarCtaHTML(w, true)}</div>
      </div>
      <div class="wb-hero-shot wb-in">
        ${webinarBannerHTML(w, idx)}
        <div class="wb-hero-count">
          <small>Starts in</small>
          ${countdownHTML(start, "Starts in")}
        </div>
      </div>
    </section>` : `
    <section class="wb-hero">
      <div class="wb-hero-shot wb-in">
        ${webinarBannerHTML(w, idx)}
        <div class="wb-hero-count">
          <small>Starts in</small>
          ${countdownHTML(start, "Starts in")}
        </div>
      </div>
      <div class="wb-hero-copy wb-in">
        <span class="wb-pill">${w.status === "live" ? "Live now" : "Live webinar"}</span>
        <h1>${escapeHtml(w.title)}</h1>
        <div class="wb-meta-row">
          <span>${iconSvg("cal")} ${escapeHtml(webinarDateLabel(w))}</span>
          <span>${iconSvg("clock")} ${escapeHtml(webinarTimeLabel(w))}</span>
        </div>
        ${priceHTML}
        ${webinarCtaHTML(w, false)}
        <div class="wb-seats">
          <div class="wb-faces">${faces.map((src) => `<img src="${src}" alt="">`).join("")}</div>
          <small>Limited seats · ${seatsLeft} left</small>
        </div>
      </div>
    </section>`;

  root.innerHTML = `
    <div class="container">
      <div class="wb-crumb wb-in"><a href="${homeHref()}">Home</a> · <a href="/live#webinars">Webinars</a> · ${escapeHtml(w.title)}</div>
      ${hero}
      <div class="wb-split">
        <div>
          <section class="wb-block" data-wb>
            <h2>What You Will Learn</h2>
            <div class="wb-learn">${meta.learn.map((x) => `<p>${iconSvg("check")} <span>${escapeHtml(x)}</span></p>`).join("")}</div>
          </section>
          ${registered ? "" : `<section class="wb-block" data-wb>
            <h2>About The Webinar</h2>
            <div class="wb-about">
              <p>${escapeHtml(meta.about)}</p>
              <p class="wb-more">${escapeHtml(meta.aboutMore)}</p>
            </div>
            <button type="button" class="wb-more-btn" data-more>show more</button>
          </section>`}
          <section class="wb-block" data-wb>
            <h2>Who Is This Webinar For</h2>
            <div class="wb-who">${meta.audience.map((a) => `
              <article>
                <b>${iconSvg("users")} ${escapeHtml(a.t)}</b>
                <p>${escapeHtml(a.d)}</p>
              </article>`).join("")}</div>
          </section>
          <section class="wb-block wb-mentor" data-wb>
            <h2>Meet Your Instructor</h2>
            <div class="wb-mentor-card">
              <div class="wb-mentor-top">
                <img src="${photoFor(w.by)}" alt="">
                <div>
                  <small>Learn From · ${escapeHtml(w.by)}</small>
                  <p>${escapeHtml(meta.exp)}${meta.learners ? ` · ${escapeHtml(meta.learners)}` : ""}</p>
                </div>
              </div>
              <h3>${escapeHtml(w.by)}</h3>
              <p>${escapeHtml(meta.bio)}</p>
            </div>
          </section>
          <section class="wb-block" data-wb>
            <h2>Frequently Asked Questions</h2>
            <div class="wb-faqs">${meta.faqs.map((f, i) => `
              <article class="wb-faq${i === 0 ? " open" : ""}">
                <button type="button" data-faq>${escapeHtml(f.q)}<i></i></button>
                <div class="ans"><p>${escapeHtml(f.a)}</p></div>
              </article>`).join("")}</div>
          </section>
        </div>
        ${sideCard}
      </div>
    </div>
    <div class="wb-dock">${webinarCtaHTML(w, registered)}</div>`;

  bindWbMotion(root);
  startWbCountdown(root);
  root.querySelector("[data-more]")?.addEventListener("click", (e) => {
    root.querySelector(".wb-about")?.classList.toggle("open");
    e.currentTarget.textContent = root.querySelector(".wb-about")?.classList.contains("open") ? "show less" : "show more";
  });
  bindFaqs(root);
}

function renderLiveRoom() {
  const root = document.getElementById("liveRoom");
  if (!root) return;
  const qs = new URLSearchParams(location.search);
  const type = qs.get("type") === "call" ? "call" : "live";
  const id = qs.get("id");
  const user = getUser();
  const staff = getStaffSession();

  if (type === "call") {
    const session = typeof callRequests === "function" ? callRequests().find((c) => c.id === id) : null;
    if (!session) {
      root.innerHTML = `<div class="empty"><h3>Call not found</h3><a class="btn btn-primary" href="/live#call" style="margin-top:12px">Book a 1:1</a></div>`;
      return;
    }
    const isHost = staff && (staff.email === session.mentorEmail || staff.name === session.mentor);
    const isGuest = user && user.email === session.email;
    document.title = `${session.topic} | 1:1 | ${BRAND}`;
    const canJoin = session.status === "approved" && (isHost || isGuest);
    root.innerHTML = `
      <div class="live-room">
        <div class="live-stage">
          <span class="live-dot ${session.status === "approved" ? "live" : "scheduled"}">${(session.status || "pending").toUpperCase()}</span>
          <h1>${escapeHtml(session.topic)}</h1>
          <p>${escapeHtml(session.date)} ${escapeHtml(session.time || "")} • ${escapeHtml(session.mentor || "Mentor")} with ${escapeHtml(session.name)}</p>
          <div id="hmsMount">${canJoin ? `<div class="live-cam">Connecting 1:1 room…</div>` : `<div class="live-cam">${session.status === "pending" ? "Waiting for mentor approval" : "This 1:1 is private to the booked student and mentor"}</div>`}</div>
          <div class="live-host-actions">
            ${!user ? `<button class="btn btn-primary" data-open="loginModal">Login to join</button>` : ""}
            <a class="btn btn-ghost" href="/live#call">All 1:1 calls</a>
            ${isHost ? `<a class="btn btn-ghost" href="/admin">Back to dashboard</a>` : ""}
          </div>
        </div>
        <aside class="live-side">
          <h3>1:1 details</h3>
          <p class="muted">${escapeHtml(session.notes || "Bring your journal and the setup you want reviewed.")}</p>
          <p class="muted" style="margin-top:8px">Camera and mic open for both of you inside Bizgarh.</p>
        </aside>
      </div>`;
    if (canJoin) {
      mountHmsFrame(document.getElementById("hmsMount"), {
        kind: "call",
        id: session.id,
        title: session.topic,
        duration: "60 min",
        asHost: isHost,
        userName: (isHost ? staff.name : user.name) || "Guest"
      });
    }
    return;
  }

  const session = allWebinars().find((w) => w.id === id);
  if (!session) {
    root.innerHTML = `<div class="empty"><h3>Class not found</h3><a class="btn btn-primary" href="/live" style="margin-top:12px">All live classes</a></div>`;
    return;
  }
  const isHost = staff && staff.email === session.hostEmail;
  const regs = readList(REGS_KEY).filter((r) => r.id === session.id);
  const registered = user && regs.some((r) => r.email === user.email);
  document.title = `${session.title} | Live | ${BRAND}`;
  const live = allWebinars().find((w) => w.id === id);
  const showIntro = !isHost && registered && live.status === "scheduled";
  const canJoinHms = live.status !== "ended" && (isHost || (registered && live.status === "live"));

  root.innerHTML = `
    <div class="live-room">
      <div class="live-stage">
        <span class="live-dot ${live.status || "scheduled"}">${(live.status || "scheduled").toUpperCase()}</span>
        <h1>${live.title}</h1>
        <p>${live.when} • ${live.by} • ${live.duration || "60 min"}</p>
        <div id="hmsMount">${
          canJoinHms
            ? `<div class="live-cam">Connecting classroom…</div>`
            : showIntro
              ? introPlayerHTML(live.introUrl)
              : `<div class="live-cam">${live.status === "ended" ? "This class has ended" : "Register, then wait here. The teacher will start the class in this room."}</div>`
        }</div>
        ${live.recordUrl ? `<a class="btn btn-ghost" href="${live.recordUrl}" target="_blank" rel="noopener">Watch recording</a>` : ""}
        ${isHost ? `
          <form id="hostIntroForm" class="live-host-form">
            <input name="introUrl" placeholder="Intro video before class (YouTube or MP4 URL)" value="${escapeHtml(live.introUrl || "")}">
            <button class="btn btn-ghost">Save intro</button>
          </form>
          <form id="hostRecForm" class="live-host-form">
            <input name="recordUrl" placeholder="Paste recording URL after class" value="${live.recordUrl || ""}">
            <button class="btn btn-ghost">Save recording</button>
          </form>
          <div class="live-host-actions">
            ${live.status === "scheduled" ? `<button class="btn btn-primary" id="startLiveBtn">Start class</button>` : ""}
            ${live.status !== "ended" && live.status !== "scheduled" ? `<button class="btn btn-primary" id="endLiveBtn">End class</button>` : ""}
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
          : `<p class="muted">${live.notes || "Bring your journal. Q&A at the end."}</p><p class="muted" style="margin-top:8px">${regs.length} learners registered.${live.chat === false ? " Chat is off for this session." : " Chat is on in the live room."}</p>`}
      </aside>
    </div>`;

  if (canJoinHms) {
    mountHmsFrame(document.getElementById("hmsMount"), {
      kind: liveKindOf(live),
      id: live.id,
      title: live.title,
      duration: live.duration,
      asHost: isHost,
      userName: (isHost ? staff.name : (user && user.name)) || "Guest"
    });
  }
  document.getElementById("hostIntroForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    updateLive(id, { introUrl: e.target.introUrl.value.trim() });
    toast("Intro video saved · students see it until you start class");
    renderLiveRoom();
  });
  document.getElementById("startLiveBtn")?.addEventListener("click", () => {
    updateLive(id, { status: "live" });
    toast("Class is live · registered students can join now");
    renderLiveRoom();
  });
  document.getElementById("hostRecForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    updateLive(id, { recordUrl: e.target.recordUrl.value.trim() });
    toast("Recording link saved");
    renderLiveRoom();
  });
  document.getElementById("endLiveBtn")?.addEventListener("click", async () => {
    updateLive(id, { status: "ended" });
    try {
      await fetch(hmsApiUrl("/api/live/end"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: liveKindOf(live), id: live.id })
      });
    } catch {}
    toast("Class ended · everyone is kicked from the room");
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
    root.innerHTML = `<div class="empty"><h3>Certificate not issued yet</h3><p class="muted">Finish every lesson in the classroom and it appears here.</p><a class="btn btn-primary" href="/dashboard" style="margin-top:12px">My learning</a></div>${faqSectionHTML(FAQ_SETS.cert)}`;
    bindFaqs(root);
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
  root.insertAdjacentHTML("beforeend", faqSectionHTML(FAQ_SETS.cert));
  bindFaqs(root);
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
  syncNotesFromAccount();
  paintNoteBell(false);
  applySignupGate();
  const oauthed = await consumeOAuth();
  if (!oauthed) await restoreOAuthSession();
  sendLoggedInHomeToDashboard();

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
  renderMyLearning();
  renderAccountPage();
  window.addEventListener("hashchange", () => {
    renderMyLearning();
    renderAccountPage();
  });
  renderLive();
  renderWebinarPage();
  consumePendingWebinar();
  renderMentorListing();
  renderMentorProgramPage();
  consumePendingMentor();
  renderLiveRoom();

  document.body.addEventListener("click", (e) => {
    const reg = e.target.closest("[data-register]");
    if (reg) registerForWebinar(reg.dataset.register);
    const men = e.target.closest("[data-mentor-enroll]");
    if (men) enrollMentorProgram(men.dataset.mentorEnroll);
    const call = e.target.closest("[data-mentor-call]");
    if (call) requestMentorCallback(call.dataset.mentorCall);
  });

  document.getElementById("contactForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const u = getUser();
    const list = readList(TICKETS_KEY);
    list.push({
      id: "tk-" + Date.now(),
      title: String(f.message.value || "Support").trim().slice(0, 80),
      body: String(f.message.value || "").trim(),
      email: (u?.email || f.email.value).trim().toLowerCase(),
      name: u?.name || f.name.value.trim(),
      courseId: "",
      status: "OPEN",
      assignee: "",
      replies: [],
      at: new Date().toISOString()
    });
    writeList(TICKETS_KEY, list);
    if (u?.email) {
      pushNote({ key: "ticket:" + list[list.length - 1].id, kind: "ticket", title: "Help note sent", body: "The desk will reply within one working day.", href: "/contact", email: u.email });
    }
    f.reset();
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
      pushNote({ key: "call:" + list[list.length - 1].id, kind: "call", title: "1:1 call requested", body: (f.topic.value || "Guidance") + " is with the desk for approval.", href: "/live#call" });
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
  mountStaticFaqs();
  bindHelpFaqSearch();
  window.BizgarhLoader?.done?.();
});
