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
    link.media = "print";
    link.onload = function () { this.media = "all"; };
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
const EXTRA_MENTORS_KEY = "tradeshalaExtraMentors";
const HIDDEN_MENTORS_KEY = "tradeshalaHiddenMentors";
const MENTOR_EDITS_KEY = "tradeshalaMentorEdits";
const MENTOR_ROOMS_KEY = "tradeshalaMentorRooms";
const WEBINAR_ROOMS_KEY = "tradeshalaWebinarRooms";
const STAFF_KEY = "tradeshalaStaff";
const STAFF_SESSION_KEY = "tradeshalaStaffSession";
const COURSE_OWNERS_KEY = "tradeshalaCourseOwners";
const FOOTER_SOCIAL_KEY = "tradeshalaFooterSocial";
const FOOTER_SOCIAL_DEFAULTS = {
  facebook: "https://www.facebook.com/bizgarh",
  instagram: "https://www.instagram.com/bizgarh",
  youtube: "https://www.youtube.com/@bizgarh",
  x: "https://x.com/bizgarh",
  telegram: "https://t.me/bizgarh",
  linkedin: "https://www.linkedin.com/company/bizgarh"
};
const FOOTER_SOCIAL_FIELDS = [
  { id: "facebook", label: "Facebook", placeholder: "https://www.facebook.com/bizgarh" },
  { id: "instagram", label: "Instagram", placeholder: "https://www.instagram.com/bizgarh" },
  { id: "youtube", label: "YouTube", placeholder: "https://www.youtube.com/@bizgarh" },
  { id: "x", label: "X", placeholder: "https://x.com/bizgarh" },
  { id: "telegram", label: "Telegram", placeholder: "https://t.me/bizgarh" },
  { id: "linkedin", label: "LinkedIn", placeholder: "https://www.linkedin.com/company/bizgarh" }
];
function sanitizeSocialUrl(url) {
  let raw = String(url || "").trim();
  if (!raw) return "";
  if (!/^[a-z][a-z0-9+.-]*:/i.test(raw)) raw = "https://" + raw;
  try {
    const u = new URL(raw);
    if (u.protocol === "http:" || u.protocol === "https:") return u.href;
  } catch { /* ignore */ }
  return "";
}
function footerSocialLinks() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(FOOTER_SOCIAL_KEY) || "{}") || {}; } catch { saved = {}; }
  const out = {};
  FOOTER_SOCIAL_FIELDS.forEach((f) => {
    out[f.id] = sanitizeSocialUrl(saved[f.id]) || FOOTER_SOCIAL_DEFAULTS[f.id] || "";
  });
  return out;
}
function saveFooterSocialLinks(next) {
  const out = {};
  FOOTER_SOCIAL_FIELDS.forEach((f) => { out[f.id] = sanitizeSocialUrl(next && next[f.id]); });
  localStorage.setItem(FOOTER_SOCIAL_KEY, JSON.stringify(out));
  return out;
}
function footerSocialSvg(id) {
  const paths = {
    facebook: '<path d="M14.6 8.4h-1.5c-.6 0-.9.3-.9.9v1.5h2.3l-.3 2.4h-2V20H10v-6.8H8.2v-2.4H10V9c0-2 1.2-3.5 3.4-3.5.7 0 1.5.1 1.7.1v2.8z"/>',
    instagram: '<path d="M8.3 4h7.4A4.3 4.3 0 0 1 20 8.3v7.4A4.3 4.3 0 0 1 15.7 20H8.3A4.3 4.3 0 0 1 4 15.7V8.3A4.3 4.3 0 0 1 8.3 4zm7.4 1.6H8.3A2.7 2.7 0 0 0 5.6 8.3v7.4a2.7 2.7 0 0 0 2.7 2.7h7.4a2.7 2.7 0 0 0 2.7-2.7V8.3a2.7 2.7 0 0 0-2.7-2.7zM12 8.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5zm0 1.5A2 2 0 1 0 14 12a2 2 0 0 0-2-2zm4.1-2.7a.85.85 0 1 1-.85.85.85.85 0 0 1 .85-.85z"/>',
    youtube: '<path d="M19.7 8.3a2.2 2.2 0 0 0-1.55-1.56C16.6 6.4 12 6.4 12 6.4s-4.6 0-6.15.34A2.2 2.2 0 0 0 4.3 8.3 22 22 0 0 0 4 12a22 22 0 0 0 .3 3.7 2.2 2.2 0 0 0 1.55 1.56C7.4 17.6 12 17.6 12 17.6s4.6 0 6.15-.34A2.2 2.2 0 0 0 19.7 15.7 22 22 0 0 0 20 12a22 22 0 0 0-.3-3.7zM10.5 14.6V9.4L15 12z"/>',
    x: '<path d="M16.9 4h2.5l-5.5 6.3L20.2 20h-4.6l-3.6-4.7L7.3 20H4.7l5.8-6.6L4.2 4h4.7l3.3 4.4zm-.8 14.3h1.4L8.1 5.6H6.6z"/>',
    telegram: '<path d="M19.8 5.3 4.1 11.3c-1 .4-1 1-.2 1.3l4 1.2 1.5 4.7c.2.5.6.6 1 .4l2.2-1.8 4.2 3.1c.8.4 1.3.2 1.5-.7l2.7-13c.3-1.1-.4-1.6-1.2-1.2zM8.8 13l8.2-5.2c.4-.2.7 0 .4.3l-7 6.4-.2 2.8z"/>',
    linkedin: '<path d="M7.3 9.2H4.9V19h2.4zM7.5 5.8a1.4 1.4 0 1 1-2.8 0 1.4 1.4 0 0 1 2.8 0zM19 13c0-2.8-1.5-4.1-3.5-4.1-1.6 0-2.3.9-2.7 1.5V9.2h-2.4V19h2.4v-5.3c0-.3 0-.6.1-.8.2-.6.9-1.2 1.8-1.2 1.3 0 1.8 1 1.8 2.4V19H19z"/>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[id] || ""}</svg>`;
}
const DESK_ROOMS_KEY = "tradeshalaDeskRooms";
const COURSE_ROOMS_KEY = "tradeshalaCourseRooms";
const DESK_ROOM_TYPES = [
  { id: "whatsapp", label: "WhatsApp", blurb: "Student WhatsApp group", placeholder: "https://chat.whatsapp.com/...", icon: "wa" },
  { id: "discord", label: "Discord", blurb: "Discord server", placeholder: "https://discord.gg/...", icon: "discord" },
  { id: "youtube", label: "YouTube", blurb: "Classroom YouTube", placeholder: "https://www.youtube.com/@bizgarh", icon: "youtube" },
  { id: "telegram", label: "Telegram", blurb: "Telegram room", placeholder: "https://t.me/bizgarh", icon: "telegram" }
];
const DESK_ROOM_DEFAULTS = {
  whatsapp: { live: false, url: "" },
  discord: { live: false, url: "" },
  youtube: { live: true, url: "https://www.youtube.com/@bizgarh" },
  telegram: { live: true, url: "https://t.me/bizgarh" }
};
function deskRoomsMap() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(DESK_ROOMS_KEY) || "{}") || {}; } catch { saved = {}; }
  const out = {};
  DESK_ROOM_TYPES.forEach((t) => {
    const row = saved[t.id] || {};
    out[t.id] = {
      live: row.live === true || row.live === "1",
      url: sanitizeSocialUrl(row.url) || ""
    };
    if (saved[t.id] == null && DESK_ROOM_DEFAULTS[t.id]) {
      out[t.id] = {
        live: DESK_ROOM_DEFAULTS[t.id].live,
        url: sanitizeSocialUrl(DESK_ROOM_DEFAULTS[t.id].url)
      };
    }
  });
  return out;
}
function setDeskRoomsMap(next) {
  const out = {};
  DESK_ROOM_TYPES.forEach((t) => {
    const row = (next && next[t.id]) || {};
    out[t.id] = {
      live: row.live === true || row.live === "1",
      url: sanitizeSocialUrl(row.url)
    };
  });
  localStorage.setItem(DESK_ROOMS_KEY, JSON.stringify(out));
  return out;
}
function liveDeskRooms() {
  const map = deskRoomsMap();
  return DESK_ROOM_TYPES.map((t) => ({ ...t, ...map[t.id] })).filter((r) => r.live && r.url);
}
function primaryDeskRoomUrl() {
  const rooms = liveDeskRooms();
  const prefer = ["telegram", "whatsapp", "discord", "youtube"];
  for (const id of prefer) {
    const hit = rooms.find((r) => r.id === id);
    if (hit) return hit.url;
  }
  return rooms[0]?.url || "";
}
function communityRoomIcon(id) {
  if (id === "youtube" || id === "telegram") return footerSocialSvg(id);
  return iconSvg(id === "whatsapp" ? "wa" : id === "discord" ? "discord" : "chat");
}
function deskRoomCardHTML(room, canJoin) {
  const state = canJoin ? "Join" : (room.state || "Locked");
  const inner = `
    <span class="cd-room-ico cd-room-${escapeHtml(room.id)}">${communityRoomIcon(room.id)}</span>
    <span class="cd-room-copy"><b>${escapeHtml(room.label)}</b><small>${escapeHtml(room.blurb)}</small></span>
    <em>${escapeHtml(state)}</em>`;
  if (canJoin && room.url) {
    return `<a class="cd-room" href="${escapeHtml(room.url)}" target="_blank" rel="noopener noreferrer">${inner}</a>`;
  }
  return `<div class="cd-room is-off">${inner}</div>`;
}
function courseRoomsMap() {
  try { return JSON.parse(localStorage.getItem(COURSE_ROOMS_KEY) || "{}") || {}; } catch { return {}; }
}
function setCourseRooms(courseId, next) {
  const all = courseRoomsMap();
  const out = {};
  DESK_ROOM_TYPES.forEach((t) => {
    const row = (next && next[t.id]) || {};
    out[t.id] = {
      live: row.live === true || row.live === "1",
      url: typeof sanitizeSocialUrl === "function" ? sanitizeSocialUrl(row.url) : String(row.url || "").trim()
    };
  });
  all[courseId] = out;
  localStorage.setItem(COURSE_ROOMS_KEY, JSON.stringify(all));
  return out;
}
function courseRoomsOf(courseId) {
  const own = courseRoomsMap()[courseId];
  if (own && typeof own === "object") return own;
  return deskRoomsMap();
}
function mentorRoomsMap() {
  try { return JSON.parse(localStorage.getItem(MENTOR_ROOMS_KEY) || "{}") || {}; } catch { return {}; }
}
function setMentorRooms(programId, next) {
  const all = mentorRoomsMap();
  const out = {};
  DESK_ROOM_TYPES.forEach((t) => {
    const row = (next && next[t.id]) || {};
    out[t.id] = {
      live: row.live === true || row.live === "1",
      url: typeof sanitizeSocialUrl === "function" ? sanitizeSocialUrl(row.url) : String(row.url || "").trim()
    };
  });
  all[programId] = out;
  localStorage.setItem(MENTOR_ROOMS_KEY, JSON.stringify(all));
  return out;
}
function mentorRoomsOf(programId) {
  const own = mentorRoomsMap()[programId];
  if (own && typeof own === "object") return own;
  return deskRoomsMap();
}
function webinarRoomsMap() {
  try { return JSON.parse(localStorage.getItem(WEBINAR_ROOMS_KEY) || "{}") || {}; } catch { return {}; }
}
function setWebinarRooms(webinarId, next) {
  const all = webinarRoomsMap();
  const out = {};
  DESK_ROOM_TYPES.forEach((t) => {
    const row = (next && next[t.id]) || {};
    out[t.id] = {
      live: row.live === true || row.live === "1",
      url: typeof sanitizeSocialUrl === "function" ? sanitizeSocialUrl(row.url) : String(row.url || "").trim()
    };
  });
  all[webinarId] = out;
  localStorage.setItem(WEBINAR_ROOMS_KEY, JSON.stringify(all));
  return out;
}
function webinarRoomsOf(webinarId) {
  const own = webinarRoomsMap()[webinarId];
  if (own && typeof own === "object") return own;
  return deskRoomsMap();
}
function visibleDeskRooms(roomsMap) {
  const map = roomsMap || deskRoomsMap();
  return DESK_ROOM_TYPES.map((t) => ({ ...t, ...(map[t.id] || {}) })).filter((r) => r.live && r.url);
}
function deskRoomsGridHTML(open, lockCopy, roomsMap) {
  const rooms = visibleDeskRooms(roomsMap);
  if (!rooms.length) return "";
  const names = rooms.map((r) => r.label).join(", ");
  return `<div class="cd-rooms${open ? "" : " is-locked"}">${rooms.map((r) => deskRoomCardHTML(r, open)).join("")}</div>
    ${open ? "" : `<p class="cd-rooms-lock">${escapeHtml(lockCopy || ("Buy this classroom to open " + names + "."))}</p>`}`;
}

function footerSocialHTML() {
  const links = footerSocialLinks();
  return FOOTER_SOCIAL_FIELDS.map((f) => {
    const href = links[f.id];
    const icon = footerSocialSvg(f.id);
    if (href) {
      return `<a class="ft-soc" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" aria-label="${f.label}">${icon}</a>`;
    }
    return `<span class="ft-soc ft-soc-off" title="${f.label} link not set" aria-label="${f.label}">${icon}</span>`;
  }).join("");
}
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
function staffCoursePreview() {
  const qs = new URLSearchParams(location.search);
  if (qs.get("preview") !== "1") return "";
  const u = typeof getUser === "function" ? getUser() : null;
  if (!u || !staffAccessRole(u.email)) return "";
  return qs.get("view") === "owned" ? "owned" : "buy";
}
function courseOwnedForPage(c) {
  const preview = staffCoursePreview();
  if (preview === "owned") return true;
  if (preview === "buy") return false;
  const logged = Boolean(typeof getUser === "function" && getUser());
  return logged && typeof isEnrolled === "function" && isEnrolled(c.id);
}
function staffMentorPreview() {
  const qs = new URLSearchParams(location.search);
  if (qs.get("preview") !== "1") return "";
  const u = typeof getUser === "function" ? getUser() : null;
  if (!u || !staffAccessRole(u.email)) return "";
  return qs.get("view") === "owned" ? "owned" : "buy";
}
function mentorOwnedForPage(p) {
  const preview = staffMentorPreview();
  if (preview === "owned") return true;
  if (preview === "buy") return false;
  return typeof isMentorEnrolled === "function" && isMentorEnrolled(p.id);
}
function staffWebinarPreview() {
  const qs = new URLSearchParams(location.search);
  if (qs.get("preview") !== "1") return "";
  const u = typeof getUser === "function" ? getUser() : null;
  if (!u || !staffAccessRole(u.email)) return "";
  return qs.get("view") === "owned" ? "owned" : "buy";
}
function webinarOwnedForPage(w) {
  const preview = staffWebinarPreview();
  if (preview === "owned") return true;
  if (preview === "buy") return false;
  return typeof isWebinarRegistered === "function" && isWebinarRegistered(w.id);
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
const COURSE_SYLLABUS_KEY = "tradeshalaCourseSyllabus";
const NEXT_PATH_KEY = "tradeshalaNextPath";
const MENTOR_LESSONS_KEY = "tradeshalaMentorLessons";
const LEARNER_REVIEWS_KEY = "tradeshalaLearnerReviews";

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
function lessonsAll(courseId) {
  const custom = courseVideosMap()[courseId];
  const list = Array.isArray(custom) ? custom : DEFAULT_LESSONS.map((l) => ({ ...l }));
  return list.map((l, i) => ({
    ...l,
    id: l.id || (courseId + "-l" + i),
    kind: l.kind || ((l.src || l.vdoId || l.fileKey) ? "video" : (l.pdf ? "pdf" : (l.notes ? "article" : "video"))),
    published: l.published !== false,
    drm: (l.kind || "video") === "video" ? l.drm !== false : false
  }));
}
function lessonsFor(courseId, opts) {
  const list = lessonsAll(courseId);
  if (opts && opts.all) return list;
  return list.filter((l) => l.published !== false);
}
function setCourseLessons(courseId, lessons, keepEmpty) {
  const map = courseVideosMap();
  if (!lessons.length && !keepEmpty) delete map[courseId];
  else map[courseId] = lessons;
  setCourseVideosMap(map);
  applyCoursePatch(courseId, { lessons: lessons.length || 0 });
}
function courseSyllabusMap() {
  try { return JSON.parse(localStorage.getItem(COURSE_SYLLABUS_KEY) || "{}"); } catch { return {}; }
}
function derivedSyllabus(courseId) {
  const lessons = lessonsAll(courseId);
  const titles = ["Introduction", "Core ideas", "The setup", "Risk & journal", "Managing trades"];
  const sections = [];
  for (let i = 0; i < lessons.length; i += 3) {
    const slice = lessons.slice(i, i + 3);
    const gi = Math.floor(i / 3);
    sections.push({
      id: "sec-" + courseId + "-" + gi,
      title: titles[gi] || ("Section " + (gi + 1)),
      items: slice.map((l) => ({
        lessonId: l.id,
        kind: l.kind || "video",
        published: l.published !== false
      }))
    });
  }
  if (!sections.length) {
    sections.push({ id: "sec-" + courseId + "-0", title: "Introduction", items: [] });
  }
  return { sections };
}
function syllabusFor(courseId) {
  const stored = courseSyllabusMap()[courseId];
  if (stored && Array.isArray(stored.sections) && stored.sections.length) return stored;
  return derivedSyllabus(courseId);
}
function syncLessonsFromSyllabus(courseId, syllabus) {
  const all = lessonsAll(courseId);
  const byId = Object.fromEntries(all.map((l) => [l.id, l]));
  const ordered = [];
  (syllabus.sections || []).forEach((sec) => {
    (sec.items || []).forEach((it) => {
      const lesson = byId[it.lessonId];
      if (lesson) {
        ordered.push({
          ...lesson,
          kind: it.kind || lesson.kind || "video",
          published: it.published !== false,
          sectionId: sec.id
        });
      }
    });
  });
  setCourseLessons(courseId, ordered, true);
}
function setCourseSyllabus(courseId, syllabus) {
  const map = courseSyllabusMap();
  map[courseId] = syllabus;
  localStorage.setItem(COURSE_SYLLABUS_KEY, JSON.stringify(map));
  syncLessonsFromSyllabus(courseId, syllabus);
}
function ensureCourseSyllabus(courseId) {
  const lessons = lessonsAll(courseId);
  if (!courseVideosMap()[courseId]?.length) setCourseLessons(courseId, lessons, true);
  if (!courseSyllabusMap()[courseId]) setCourseSyllabus(courseId, derivedSyllabus(courseId));
  return syllabusFor(courseId);
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
    src: vdoId ? "" : src,
    kind: fields.kind || "video",
    published: fields.published !== false,
    drm: fields.drm !== false
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
  if (fields.notes) lesson.notes = String(fields.notes || "").trim();
  if (fields.pdf) lesson.pdf = String(fields.pdf || "").trim();
  if (fields.pdfName) lesson.pdfName = String(fields.pdfName || "").trim();
  setCourseLessons(courseId, (courseVideosMap()[courseId] || []).concat(lesson));
  return lesson;
}

function nextPathMap() {
  try { return JSON.parse(localStorage.getItem(NEXT_PATH_KEY) || "{}"); } catch { return {}; }
}
function setNextPathMap(map) { localStorage.setItem(NEXT_PATH_KEY, JSON.stringify(map)); }
function mentorLessonsMap() {
  try { return JSON.parse(localStorage.getItem(MENTOR_LESSONS_KEY) || "{}"); } catch { return {}; }
}
function setMentorLessons(programId, lessons) {
  const map = mentorLessonsMap();
  map[programId] = Array.isArray(lessons) ? lessons : [];
  localStorage.setItem(MENTOR_LESSONS_KEY, JSON.stringify(map));
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
function instructorSlug(name) {
  return String(name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function instructorHref(name) {
  const slug = instructorSlug(name);
  return slug ? "/instructor?id=" + encodeURIComponent(slug) : "/instructors";
}
function instructorSlugFromLocation() {
  const qs = new URLSearchParams(location.search);
  const q = qs.get("id") || qs.get("slug") || "";
  if (q) return instructorSlug(q);
  const parts = String(location.pathname || "").replace(/\.html$/i, "").split("/").filter(Boolean);
  if (parts[0] === "instructor" && parts[1]) return instructorSlug(decodeURIComponent(parts[1]));
  return "";
}
const INSTRUCTOR_PACKS = {
  "aarav-mehta": {
    title: "Full-time trader, Bizgarh desk",
    company: "Bizgarh",
    years: "12+",
    learners: "50,483",
    topRated: true,
    languages: ["Hindi", "English"],
    tags: ["Intraday", "Nifty options", "Gap & go"],
    bio: "Aarav Mehta is a full-time trader. He teaches process: locate the gap, wait for acceptance, and leave if the level fails. Journals first. No tip feed.",
    quote: "Write the invalidation before the first click. Size is a decision. The open is not a suggestion to chase.",
    pillars: [
      { t: "Process over tips", d: "One written setup for the first hour. If the level fails, you are out." },
      { t: "Size before entry", d: "Risk is decided before the candle prints, not after it runs." },
      { t: "Journal every session", d: "What you saw, what you did, and what you will skip tomorrow." },
      { t: "Stand aside is a trade", d: "The best open is often no trade. Waiting is part of the desk." }
    ]
  },
  "neha-kapoor": {
    title: "Options specialist, defined risk",
    company: "Bizgarh",
    years: "10+",
    learners: "36,800",
    topRated: true,
    languages: ["English", "Hindi"],
    tags: ["Credit spreads", "Weekly income", "Defined risk"],
    bio: "Neha Kapoor teaches options as risk first. Spreads, adjustments, and a weekly review you can keep after the premium looks tempting.",
    quote: "Premium is not income until the trade is closed. Defined risk is the product. Hope is not an adjustment.",
    pillars: [
      { t: "Defined risk only", d: "Every structure has a written max loss before you click sell." },
      { t: "Adjustments are rules", d: "You do not turn a losing spread into a bigger hope trade." },
      { t: "Weekly review", d: "One page: what paid, what decayed, what you will not repeat." },
      { t: "Size stays small", d: "Income-style size is smaller than the premium looks." }
    ]
  },
  "vikram-singh": {
    title: "Price action coach",
    company: "Bizgarh",
    years: "14+",
    learners: "28,220",
    topRated: true,
    languages: ["English", "Hindi"],
    tags: ["Swing", "Structure", "Charts"],
    bio: "Vikram Singh reads weekly structure without the indicator pile. One chart, one invalidation, levels that are real.",
    quote: "If the level is decoration, skip it. Structure first. Then size. The indicator stack can wait.",
    pillars: [
      { t: "Structure first", d: "Last week's high, low, and the level that cancels the idea." },
      { t: "Fewer names", d: "A journal of three charts beats a watchlist of forty." },
      { t: "Weekend process", d: "Mark the week before Monday. Do not discover it on the open." },
      { t: "No pile of tools", d: "Price and context. Indicators are optional, not the desk." }
    ]
  },
  "ananya-rao": {
    title: "Long-term investor",
    company: "Bizgarh",
    years: "11+",
    learners: "33,650",
    topRated: true,
    languages: ["English", "Hindi"],
    tags: ["Portfolio", "SIP", "Investing"],
    bio: "Ananya Rao builds 10-year books: allocation, review, and what not to chase. Patient process for working professionals.",
    quote: "A portfolio is a system. SIP is a habit. Chasing last quarter's winner is not a plan.",
    pillars: [
      { t: "Horizon first", d: "Ten years, not ten days. The review matches the horizon." },
      { t: "Allocation on paper", d: "Equity, debt, and cash written before you add a name." },
      { t: "Quarterly review", d: "Rebalance on a calendar. Not on a headline." },
      { t: "Skip the noise", d: "Tips and IPO chatter stay off the book." }
    ]
  },
  "kabir-joshi": {
    title: "Index options, first hour",
    company: "Bizgarh",
    years: "9+",
    learners: "16,352",
    topRated: false,
    languages: ["Hindi", "English"],
    tags: ["Bank Nifty", "Opening range", "Index options"],
    bio: "Kabir Joshi teaches the opening-range playbook on index options. First hour only. A clock, a range, and a stop.",
    quote: "The first 15 minutes are for marking, not clicking. If the range fails, you are done for the open.",
    pillars: [
      { t: "Clock first", d: "The open has a window. After it, the desk is closed." },
      { t: "Range then wait", d: "Mark it. Wait for acceptance. Do not fade the first spike." },
      { t: "One invalidation", d: "If the range fails, stand aside. No afternoon revenge." },
      { t: "Size for speed", d: "Index tape is fast. Size is smaller than it feels." }
    ]
  },
  "rohan-desai": {
    title: "Fund researcher",
    company: "Bizgarh",
    years: "8+",
    learners: "24,884",
    topRated: false,
    languages: ["English", "Hindi"],
    tags: ["Mutual funds", "Swing", "Research"],
    bio: "Rohan Desai teaches funds and swing in plain language. Categories, costs, and a review you can keep.",
    quote: "A fund is a product with a cost. Read the category before the return. Hindi or English — same rule.",
    pillars: [
      { t: "Category before return", d: "Know what you own. Then look at the year." },
      { t: "Cost is a drag", d: "Expense and exit load sit on the same page as return." },
      { t: "Simple Hindi, same desk", d: "The process does not change when the language does." },
      { t: "Review, do not chase", d: "Last year's top fund is a headline, not a plan." }
    ]
  },
  "priya-nair": {
    title: "Asset allocation",
    company: "Bizgarh",
    years: "9+",
    learners: "15,300",
    topRated: false,
    languages: ["English", "Hindi"],
    tags: ["SIP", "Allocation", "Crypto risk"],
    bio: "Priya Nair runs the SIP and allocation lab. Rebalance, patience, and risk in spot crypto without a signal feed.",
    quote: "SIP works because you repeat it. Allocation works because you write it. Crypto is a size problem first.",
    pillars: [
      { t: "Habit over timing", d: "The SIP date is the strategy. Not the headline." },
      { t: "Write the mix", d: "Equity, debt, and satellite size stay on one page." },
      { t: "Crypto is satellite", d: "Spot only. Size you can explain. No leverage story." },
      { t: "Rebalance on a calendar", d: "Not when the chart looks exciting." }
    ]
  },
  "meera-iyer": {
    title: "Options coach, from zero",
    company: "Bizgarh",
    years: "8+",
    learners: "30,568",
    topRated: true,
    languages: ["English", "Hindi"],
    tags: ["Options", "Defined risk", "Levels"],
    bio: "Meera Iyer starts people from zero: calls, puts, expiry, then defined risk. Structure on the chart, size on paper.",
    quote: "Learn the contract before the strategy. Expiry is a clock. Defined risk is how you stay in the game.",
    pillars: [
      { t: "Contract first", d: "Call, put, and expiry before any spread story." },
      { t: "Defined risk next", d: "You do not sell naked while you are still learning." },
      { t: "Levels you can defend", d: "Support and resistance that survive a second look." },
      { t: "Size stays beginner", d: "Small until the journal is boring and clean." }
    ]
  }
};
function instructorBySlug(slug) {
  const key = instructorSlug(slug);
  return MENTORS.find((m) => instructorSlug(m.name) === key) || MENTORS.find((m) => m.name.toLowerCase() === String(slug || "").toLowerCase()) || null;
}
function instructorPack(name) {
  const m = MENTORS.find((x) => x.name === name) || { name, role: "Mentor", tag: "Desk" };
  const saved = INSTRUCTOR_PACKS[instructorSlug(name)] || {};
  const courses = (typeof allCourses === "function" ? allCourses() : []).filter((c) => c.instructor === name);
  const fromCourses = courses.reduce((n, c) => n + Number(String(c.learners || "0").replace(/,/g, "") || 0), 0);
  return {
    title: saved.title || m.role,
    company: saved.company || "Bizgarh",
    years: saved.years || "8+",
    learners: saved.learners || (fromCourses ? fromCourses.toLocaleString("en-IN") : "1,200"),
    topRated: saved.topRated !== false && (saved.topRated === true || fromCourses > 20000),
    languages: saved.languages || ["English", "Hindi"],
    tags: saved.tags || [m.tag].filter(Boolean),
    bio: saved.bio || `${name} teaches a written process on the Bizgarh desk — setups, invalidation, and a journal. Education only.`,
    quote: saved.quote || "Write the process. Size the risk. Review the week. That is the desk.",
    pillars: saved.pillars || [
      { t: "Process over noise", d: "One setup you can explain, not a feed of calls." },
      { t: "Risk on paper", d: "Invalidation and size before the first click." },
      { t: "Journal the session", d: "What worked, what you skip next time." },
      { t: "Education only", d: "You make the decision. We teach the checklist." }
    ]
  };
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
    discord: '<path d="M8.2 8.4c1.7-.8 3.3-1 3.3-1l.2.3A11 11 0 0 0 8 9s.8-.4 2.5-.8C12 7.8 13.6 8 13.6 8A12 12 0 0 1 16 9s.4 4.2-.8 6.4c-1.3 2.3-3.4 2.4-3.4 2.4l-.5-.7c1 .3 2.2.4 3.3-.3.3-.2.5-.4.5-.4a6.6 6.6 0 0 1-5.5 0s.2.2.5.4c1.1.7 2.3.6 3.3.3l-.5.7s-2.1-.1-3.4-2.4C7.6 13.2 8 9 8 9c.7-.4 1.5-.7 2.3-.9L10 7.8s1.6.2 3.3 1C8.8 8.4 8.2 8.4 8.2 8.4ZM10 13.2c.5 0 .9-.4.9-1s-.4-1-.9-1-.9.4-.9 1 .4 1 .9 1Zm4 0c.5 0 .9-.4.9-1s-.4-1-.9-1-.9.4-.9 1 .4 1 .9 1Z"/>',
    download: '<path d="M12 4v10"/><path d="m8 10 4 4 4-4"/><path d="M5 18h14"/>',
    flag: '<path d="M5 21V4"/><path d="M5 4h12l-2.2 4L17 12H5"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5-6-3.5Z" fill="currentColor" stroke="none"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4.2l2.4 1.6"/>',
    check: '<path d="m6.5 12.2 3.4 3.4 7.6-7.6"/>',
    gift: '<rect x="3" y="10" width="18" height="11" rx="2"/><path d="M12 7v14"/><path d="M3 10h18"/><path d="M12 7c-2.2-3.4-5.5-1.4-4.2 1.2C9.2 10 12 7 12 7Z"/><path d="M12 7c2.2-3.4 5.5-1.4 4.2 1.2C14.8 10 12 7 12 7Z"/>',
    bell: '<path d="M6.4 16h11.2"/><path d="M7 16v-5.1a5 5 0 0 1 10 0V16"/><path d="M10.2 16.2a1.8 1.8 0 0 0 3.6 0"/><path d="M12 4.2V6"/>',
    file: '<path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v5h5"/>',
    building: '<rect x="5" y="4" width="14" height="16" rx="1.5"/><path d="M9 8h.01M12 8h.01M15 8h.01M9 12h.01M12 12h.01M15 12h.01M9 20v-3h6v3"/>',
    star: '<path d="m12 3.6 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16l-4.8 2.5.9-5.4L4.2 9.3l5.4-.8Z"/>'
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

function webinarBannerOf(w) {
  return String(w?.banner || "").trim();
}
function webinarBannerHTML(w, i) {
  const pic = webinarBannerOf(w);
  if (pic) {
    return `<div class="web-banner has-banner" style="background-image:url('${escapeHtml(pic)}')"></div>`;
  }
  const catalog = typeof webinarCatalogAll === "function" ? webinarCatalogAll() : allWebinars();
  const idx = catalog.findIndex((x) => x.id === w.id);
  const tint = String(w.tint || "").trim();
  const bg = /^#/.test(tint)
    ? `linear-gradient(135deg,${tint},#0f172a)`
    : (/^linear-gradient/i.test(tint) ? tint : WEB_BANNERS[(i ?? (idx < 0 ? 0 : idx)) % WEB_BANNERS.length]);
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
  if (!/(?:^|;\s*)(bg_session|oauth_session)=/.test(document.cookie || "")) return;
  try {
    const res = await fetch("/api/me", { credentials: "same-origin", signal: AbortSignal.timeout(800) });
    if (!res.ok) return;
    const type = res.headers.get("content-type") || "";
    if (!type.includes("application/json")) return;
    const data = await res.json();
    const user = oauthUser(data.user);
    if (!user) return;
    setUser({ name: user.name, email: user.email, password: "", referredBy: user.referredBy || "", providers: user.providers || [] });
    upsertUser(user);
    afterAuthArrive();
  } catch { /* no session API on this host */ }
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
function courseBannerOf(c) {
  return String(c?.banner || "").trim();
}
function readImageAsBanner(file) {
  return new Promise((resolve, reject) => {
    if (!file || !String(file.type || "").startsWith("image/")) {
      reject(new Error("Pick a banner image"));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const max = 1400;
      let w = img.naturalWidth || img.width;
      let h = img.naturalHeight || img.height;
      if (w > max) {
        h = Math.round((h * max) / w);
        w = max;
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image"));
    };
    img.src = url;
  });
}
async function resolveCourseBanner(form, current) {
  if (form?.bannerClear?.checked) return "";
  const file = form?.bannerFile?.files?.[0];
  if (file) return readImageAsBanner(file);
  const url = String(form?.banner?.value || "").trim();
  if (url) return url;
  return current || "";
}
function allCourses() {
  const hidden = hiddenCourseIds();
  const edits = courseEdits();
  const u = typeof getUser === "function" ? getUser() : null;
  const preview = /(?:\?|&)preview=1(?:&|$)/.test(location.search)
    && u
    && typeof staffAccessRole === "function"
    && staffAccessRole(u.email);
  const extras = extraCourses().filter((c) => preview || (!c.unpublished && c.status !== "unlisted"));
  return COURSES.filter((c) => preview || !hidden.includes(c.id))
    .map((c) => ({ ...c, ...(edits[c.id] || {}) }))
    .concat(extras);
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
function webinarCatalogAll() {
  return allWebinars().filter((w) => w.kind !== "class");
}
function webinarById(id) {
  return allWebinars().find((w) => w.id === id) || null;
}
function listedWebinars() {
  const preview = typeof staffWebinarPreview === "function" && staffWebinarPreview();
  return webinarCatalogAll().filter((w) => preview || !w.unpublished);
}
function ensureCatalogWebinars() {
  const list = readList(LIVE_KEY);
  const extra = [
    { id: "w4", title: "Opening Range Playbook", by: "Kabir Joshi", at: "2026-09-30T20:00:00", duration: "90 min", kind: "webinar", notes: "Index open, first hour, and defined invalidation." },
    { id: "w0", title: "Gap & Go Replay Desk", by: "Aarav Mehta", at: "2026-09-08T11:00:00", duration: "60 min", kind: "webinar", notes: "Ended replay of the gap desk. Review opens after you register.", status: "ended" }
  ];
  let changed = false;
  extra.forEach((w) => {
    if (list.some((x) => x.id === w.id)) return;
    list.push({
      ...w,
      hostEmail: w.by.split(" ")[0].toLowerCase() + "@bizgarh.in",
      when: formatLiveWhen(w.at),
      joinUrl: "",
      status: w.status || "scheduled"
    });
    changed = true;
  });
  if (changed) writeList(LIVE_KEY, list);
}
function webinarHref(id) {
  return "/webinar?id=" + encodeURIComponent(id);
}
function webinarHostRoomHref(id) {
  return "/live-room?id=" + encodeURIComponent(id) + "&host=1";
}
function isWebinarHost(w) {
  const staff = typeof getStaffSession === "function" ? getStaffSession() : null;
  if (!staff?.email || !w) return false;
  if (staff.status === "suspended" || staff.status === "inactive") return false;
  const mail = normEmail(staff.email);
  if (w.hostEmail && normEmail(w.hostEmail) === mail) return true;
  if (w.ownerEmail && normEmail(w.ownerEmail) === mail) return true;
  if (w.by && staff.name && String(w.by) === String(staff.name)) return true;
  if (typeof isSuperAdminEmail === "function" && isSuperAdminEmail(mail)) return true;
  const role = staff.role || (typeof staffAccessRole === "function" ? staffAccessRole(mail) : "");
  if (role === "owner" || role === "superadmin") return true;
  try {
    const qs = new URLSearchParams(location.search);
    if (qs.get("host") === "1" && qs.get("id") === w.id && staffAccessRole(mail)) return true;
  } catch {}
  return false;
}
function startWebinarAsHost(id, goRoom) {
  const w = typeof webinarById === "function" ? webinarById(id) : allWebinars().find((x) => x.id === id);
  if (!w || !isWebinarHost(w)) {
    toast("Only the host can start this webinar");
    return null;
  }
  const staff = getStaffSession();
  const patch = { status: "live" };
  if (staff?.email && !w.hostEmail) patch.hostEmail = staff.email;
  const next = updateLive(id, patch);
  toast("Webinar is live · enrolled students can join now");
  if (goRoom !== false) location.href = webinarHostRoomHref(id);
  return next;
}
async function endWebinarAsHost(id) {
  const w = typeof webinarById === "function" ? webinarById(id) : allWebinars().find((x) => x.id === id);
  if (!w || !isWebinarHost(w)) {
    toast("Only the host can end this webinar");
    return;
  }
  updateLive(id, { status: "ended" });
  try {
    await fetch(hmsApiUrl("/api/live/end"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: liveKindOf(w), id })
    });
  } catch {}
  toast("Webinar ended · everyone is out of the room");
}
function webinarStart(w) {
  const d = new Date(w.at || w.when || "");
  return Number.isNaN(d.getTime()) ? null : d;
}
function webinarMins(w) {
  return Number(w.durationMinutes || String(w.duration || "60").replace(/\D/g, "") || 60);
}
function webinarPhase(w) {
  if (w?.unpublished) return "draft";
  if (w?.status === "ended") return "ended";
  if (w?.status === "live") return "live";
  const end = webinarEnd(w);
  const start = webinarStart(w);
  if (end && Date.now() > end.getTime()) return "ended";
  if (start && Date.now() >= start.getTime()) return "live";
  return "upcoming";
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
  const reveal = () => root?.querySelectorAll("[data-wb]")?.forEach((el) => el.classList.add("wb-on"));
  if (!root || !("IntersectionObserver" in window)) {
    reveal();
    return;
  }
  const io = new IntersectionObserver((ents) => {
    ents.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("wb-on");
      io.unobserve(e.target);
    });
  }, { threshold: 0.01, rootMargin: "120px 0px 80px" });
  root.querySelectorAll("[data-wb]").forEach((el) => io.observe(el));
  requestAnimationFrame(() => {
    root.querySelectorAll("[data-wb]").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight + 80) el.classList.add("wb-on");
    });
  });
  setTimeout(reveal, 160);
}

function faqSectionHTML(items, title) {
  if (!items || !items.length) return "";
  return `<section class="wb-block faq-block">
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
    { q: "Where are my live sessions?", a: "Your upcoming webinar and mentorship desk appear under Your upcoming live sessions. Open My Learning for the full list." },
    { q: "How do I open My Mentorship?", a: "Use the mentorship card under Your upcoming live sessions, or open My Learning → My Mentorship." },
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
  const rooms = webinarLiveRooms(w);
  return rooms[0]?.url || "";
}
function webinarLiveRooms(w) {
  return visibleDeskRooms(typeof webinarRoomsOf === "function" && w ? webinarRoomsOf(w.id) : deskRoomsMap());
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
  const learn = Array.isArray(w.learn) ? w.learn.filter((x) => String(x || "").trim()) : [];
  const audience = Array.isArray(w.audience) ? w.audience.filter((a) => a && (a.t || a.d)) : [];
  const paid = w.free !== true && Number(w.price) > 0;
  return {
    tag: w.tag || pack.tag || (liveKindOf(w) === "class" ? "Live class" : "Live webinar"),
    listPrice: Number(w.listPrice || pack.listPrice || 1999),
    price: paid ? Number(w.price || 0) : 0,
    seats: Number(w.seats || pack.seats || 80),
    lang: w.lang || pack.lang || "Hindi, English",
    exp: w.exp || pack.exp || mentor.tag || "Working trader",
    learners: w.learners || pack.learners || "",
    learn: learn.length ? learn : (pack.learn || [
      "A written setup you can run after the session",
      "Invalidation and size before the first click",
      "Live Q&A with the mentor",
      "A journal prompt for the next trading day"
    ]),
    about: w.about || w.blurb || pack.about || w.notes || `${w.title} is a live Bizgarh classroom with ${w.by}.`,
    aboutMore: w.aboutMore || pack.aboutMore || "Register to get the room link on this page. Recording, if any, stays here.",
    audience: audience.length ? audience : (pack.audience || [
      { t: "Active traders", d: "Sit with a working desk and write the process." },
      { t: "Working professionals", d: "A focused session you can finish the same evening." },
      { t: "Learners", d: "See how the mentor thinks, then journal it." }
    ]),
    bio: w.bio || pack.bio || `${w.by} hosts this live room on Bizgarh.`,
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
  { id: "mp-pa", title: "Price Action Mentorship", by: "Vikram Singh", at: "2026-08-20T19:00:00", weeks: 5, sessions: 10, hours: 12, price: 10999, old: 19999, seats: 18, tint: "#A5F3FC", tag: "Charts", blurb: "Read the chart without the indicator pile. Structure, then size." },
  { id: "mp-closed", title: "Intraday Journal Cohort", by: "Aarav Mehta", at: "2026-06-02T19:00:00", weeks: 4, sessions: 12, hours: 14, price: 12999, old: 22999, seats: 16, tint: "#E0E7FF", tag: "Closed", blurb: "A finished batch of the journal desk. Recordings stay open for members who sat through it." }
];

function mentorEdits() {
  try { return JSON.parse(localStorage.getItem(MENTOR_EDITS_KEY) || "{}"); } catch { return {}; }
}
function setMentorEdits(map) { localStorage.setItem(MENTOR_EDITS_KEY, JSON.stringify(map)); }
function extraMentorPrograms() { return readList(EXTRA_MENTORS_KEY); }
function hiddenMentorIds() { return readList(HIDDEN_MENTORS_KEY); }
function applyMentorPatch(id, fields) {
  const extra = extraMentorPrograms();
  const i = extra.findIndex((p) => p.id === id);
  if (i >= 0) {
    extra[i] = { ...extra[i], ...fields };
    writeList(EXTRA_MENTORS_KEY, extra);
    return extra[i];
  }
  const edits = mentorEdits();
  edits[id] = { ...(edits[id] || {}), ...fields };
  setMentorEdits(edits);
  return edits[id];
}
function mentorCatalogAll() {
  const hidden = hiddenMentorIds();
  const edits = mentorEdits();
  return MENTOR_PROGRAMS.map((p) => ({
    ...p,
    ...(edits[p.id] || {}),
    unpublished: hidden.includes(p.id) || Boolean((edits[p.id] || {}).unpublished)
  })).concat(extraMentorPrograms().map((p) => ({
    ...p,
    unpublished: Boolean(p.unpublished || p.status === "unlisted")
  })));
}
function mentorProgramById(id) {
  return mentorCatalogAll().find((p) => p.id === id) || null;
}
function allMentorPrograms() {
  const u = typeof getUser === "function" ? getUser() : null;
  const preview = (typeof staffMentorPreview === "function" && staffMentorPreview())
    || (/(?:\?|&)preview=1(?:&|$)/.test(location.search) && u && typeof staffAccessRole === "function" && staffAccessRole(u.email));
  return mentorCatalogAll().filter((p) => preview || !p.unpublished);
}
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
  const rooms = typeof mentorRoomsOf === "function" ? mentorRoomsOf(p.id) : null;
  const live = visibleDeskRooms(rooms);
  return live[0]?.url || primaryDeskRoomUrl() || "https://t.me/bizgarh";
}
function mentorLiveRooms(p) {
  return visibleDeskRooms(typeof mentorRoomsOf === "function" ? mentorRoomsOf(p.id) : deskRoomsMap());
}
function mentorBannerOf(p) {
  return String(p?.banner || "").trim();
}
function mentorShotHTML(p, extraClass) {
  const banner = mentorBannerOf(p);
  const hero = extraClass && /mp-hero-shot/.test(extraClass);
  const cls = `${hero ? extraClass : ("mp-shot" + (extraClass ? " " + extraClass : ""))}${banner ? " has-banner" : ""}`;
  if (banner) {
    return `<div class="${cls}" style="background-image:url('${String(banner).replace(/'/g, "%27")}')">
      <span class="mp-live"><i></i> Live on Bizgarh</span>
      <span class="wb-chip">Bizgarh</span>
    </div>`;
  }
  return `<div class="${cls}" style="--mp:${escapeHtml(p.tint || "#C7D2FE")}">
    <span class="mp-live"><i></i> Live on Bizgarh</span>
    <span class="wb-chip">Bizgarh</span>
    <h3>${escapeHtml(p.title)}</h3>
    <p>by ${escapeHtml(p.by)}</p>
    <img src="${photoFor(p.by)}" alt="">
  </div>`;
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
  const clean = (arr) => (Array.isArray(arr) ? arr.map((x) => String(x || "").trim()).filter(Boolean) : []);
  const whoOf = (arr) => (Array.isArray(arr) ? arr.map((x) => ({ t: String(x.t || "").trim(), d: String(x.d || "").trim() })).filter((x) => x.t) : []);
  const stepsOf = (arr) => (Array.isArray(arr) ? arr.map((x, i) => ({ n: String(x.n || String(i + 1).padStart(2, "0")), t: String(x.t || "").trim(), d: String(x.d || "").trim() })).filter((x) => x.t) : []);
  return {
    learn: clean(p.learn).length ? clean(p.learn) : (packs.learn || [
      "A written setup you can run after each live desk",
      "Invalidation and size before the first click",
      "Weekly review with the mentor",
      "A journal that survives a bad week"
    ]),
    curriculum: clean(p.curriculum).length ? clean(p.curriculum) : (packs.curriculum || [
      "How the desk is run each week",
      "Setup selection on a live chart",
      "Entry, invalidation, targets",
      "Position sizing you can follow",
      "Journal template walkthrough",
      "Common mistakes to skip",
      "A process you can repeat"
    ]),
    outcomes: clean(p.outcomes).length ? clean(p.outcomes) : (packs.outcomes || [
      "Identify high-probability setups",
      "Read the chart or chain with context",
      "Use time and size with a plan",
      "Manage risk without copying trades"
    ]),
    prep: clean(p.prep).length ? clean(p.prep) : [
      "Familiarity with stocks or indices helps",
      "Know calls, puts, and expiry if this is an options desk",
      "A basic read of OI or volume is useful, not required",
      "Bring a journal and the broker you already use"
    ],
    who: whoOf(p.who).length ? whoOf(p.who) : [
      { t: "Beginners who want a desk", d: "Sit with a process instead of a tip feed." },
      { t: "Working professionals", d: "A timed program you can finish around work." },
      { t: "Traders adding a new book", d: "Learn one process, then journal it." },
      { t: "Long-term learners", d: "Use the recordings and the weekly review." }
    ],
    steps: stepsOf(p.steps).length ? stepsOf(p.steps) : [
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
    bio: String(p.bio || "").trim() || `${p.by} hosts this mentorship on Bizgarh. ${mentor.role || "Working trader"}. The desk is process, invalidation, and journal work — not a tip feed.`,
    role: String(p.role || "").trim() || mentor.tag || mentor.role || "Mentor"
  };
}

function mentorPriceHTML(p) {
  return `<div class="mp-price"><b>₹${Number(p.price).toLocaleString("en-IN")}</b><s>₹${Number(p.old).toLocaleString("en-IN")}</s><em>SAVE ${mentorSavePct(p)}%</em></div>`;
}

function mentorCardHTML(p) {
  const enrolled = isMentorEnrolled(p.id);
  return `<a class="mp-card wb-in" href="${mentorHref(p.id)}">
    ${mentorShotHTML(p)}
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
  const hasComm = mentorLiveRooms(p).length > 0;
  if (enrolled) {
    return `<a class="btn btn-primary wb-cta" href="/live-room?id=${encodeURIComponent(p.id)}">Join desk ›</a>
      ${hasComm ? `<a class="btn btn-ghost wb-cta wb-wa" href="${escapeHtml(mentorCommunityUrl(p))}" target="_blank" rel="noopener">${iconSvg("chat")} Join community</a>` : ""}`;
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

function instructorCourses(name) {
  return (typeof allCourses === "function" ? allCourses() : []).filter((c) => c.instructor === name);
}
function instructorMentorships(name) {
  return (typeof allMentorPrograms === "function" ? allMentorPrograms() : []).filter((p) => p.by === name);
}
function instructorReviews(name) {
  const courses = instructorCourses(name).map((c) => c.id);
  const desks = instructorMentorships(name).map((p) => p.id);
  const webs = (typeof listedWebinars === "function" ? listedWebinars() : []).filter((w) => w.by === name).map((w) => w.id);
  return (typeof allReviews === "function" ? allReviews() : []).filter((r) => {
    const id = r.targetId || r.courseId;
    if ((r.kind || "course") === "course") return courses.includes(id);
    if (r.kind === "mentor") return desks.includes(id);
    if (r.kind === "webinar") return webs.includes(id);
    return r.name === name;
  });
}
function requestInstructorCallback(name) {
  requireAuth(() => {
    const u = getUser();
    const key = typeof CALL_KEY === "string" ? CALL_KEY : "tradeshalaCalls";
    const list = readList(key);
    list.push({
      id: "call-" + Date.now(),
      name: u.name,
      email: u.email,
      topic: "Guidance · " + name,
      date: "",
      time: "",
      mentor: name,
      status: "pending",
      notes: "Callback requested from instructor page",
      at: new Date().toISOString()
    });
    writeList(key, list);
    pushNote({ key: "callback:ins:" + name + ":" + Date.now(), kind: "call", title: "Callback requested", body: "The desk will reach you about a 1:1 with " + name + ".", href: instructorHref(name) });
    toast("Callback requested · the desk will reach you");
  });
}
function instructorMentorCardHTML(p) {
  return String(mentorCardHTML(p) || "").replace('class="mp-card wb-in"', 'class="mp-card wb-in ip-reveal"');
}
function bindInstructorReveal(root) {
  const nodes = [...(root || document).querySelectorAll(".ip-reveal")];
  if (!nodes.length) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    nodes.forEach((n) => n.classList.add("in"));
    return;
  }
  if (!("IntersectionObserver" in window)) {
    nodes.forEach((n) => n.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  nodes.forEach((n, i) => {
    n.style.setProperty("--ip-delay", (i % 6) * 70 + "ms");
    io.observe(n);
  });
}
function renderInstructorListing() {
  const root = document.getElementById("instructorsRoot");
  if (!root) return;
  if (window.BizgarhSeo) window.BizgarhSeo.apply();
  else document.title = `Instructors | ${BRAND}`;
  root.innerHTML = `<div class="ip-list-stage">
    <div class="ip-aurora" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="container">
      <div class="ip-crumb"><a href="${homeHref()}">Home</a><span>/</span><b>Instructors</b></div>
      <header class="ip-list-head">
        <p class="ip-kicker"><span class="ip-pulse"></span> The Bizgarh desk</p>
        <h1>Instructors who trade the process</h1>
        <p>Working traders and investors. Courses, live mentorship, and 1:1 guidance — not a tip feed.</p>
      </header>
    </div>
  </div>
  <div class="container ip-list-body">
    <div class="ip-list-grid">
      ${MENTORS.map((m, i) => {
        const pack = instructorPack(m.name);
        const n = instructorCourses(m.name).length;
        const desks = instructorMentorships(m.name).length;
        const face = typeof traderFace === "function" ? traderFace(m) : { badge: "Expert", tone: "violet", exp: "star", years: pack.years || "8+" };
        const badgeIcon = face.badge === "Specialist" ? "specialist" : face.badge === "Coach" ? "coach" : face.badge === "Investor" ? "investor" : "expert";
        const tagIcon = face.tone === "amber" ? "clock" : face.tone === "orange" || face.tone === "teal" ? "bag" : face.tone === "blue" ? "pulse" : face.badge === "Coach" ? "bolt" : "pulse";
        return `<a class="ip-list-card tone-${escapeHtml(face.tone)} ip-reveal" href="${instructorHref(m.name)}" style="--ip-delay:${i * 70}ms">
          <span class="ip-list-shot">
            <img src="${escapeHtml(m.img)}" alt="${escapeHtml(m.name)}">
            <span class="tr-badge">${typeof traderIcon === "function" ? traderIcon(badgeIcon) : ""} ${escapeHtml(face.badge)}</span>
            ${pack.topRated ? `<span class="ip-rated">${iconSvg("star")} Top rated</span>` : ""}
            <i class="ip-list-shine" aria-hidden="true"></i>
          </span>
          <span class="ip-list-copy">
            <strong>${escapeHtml(m.name)} <i class="tr-check" aria-hidden="true"><svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="8"/><path d="M4.6 8.2 7 10.5l4.5-5"/></svg></i></strong>
            <em>${escapeHtml(pack.title)}</em>
            <span class="tr-tag">${typeof traderIcon === "function" ? traderIcon(tagIcon) : ""} ${escapeHtml(m.tag)}</span>
            <span class="tr-years">${typeof traderIcon === "function" ? traderIcon(face.exp) : ""} ${escapeHtml(face.years)} Years Experience</span>
            <small>${escapeHtml(pack.learners)} learners · ${n} course${n === 1 ? "" : "s"}${desks ? ` · ${desks} desk${desks === 1 ? "" : "s"}` : ""}</small>
            <div class="ip-list-tags">${pack.tags.slice(0, 3).map((t) => `<span>${escapeHtml(t)}</span>`).join("")}</div>
          </span>
        </a>`;
      }).join("")}
    </div>
  </div>`;
  bindInstructorReveal(root);
}
function renderInstructorPage() {
  const root = document.getElementById("instructorRoot");
  if (!root) return;
  const slug = instructorSlugFromLocation();
  if (!slug) return;
  const mentor = instructorBySlug(slug);
  if (!mentor) {
    root.innerHTML = `<div class="container"><div class="empty"><h3>Instructor not found</h3><a class="btn btn-primary" href="/instructors" style="margin-top:12px">All instructors</a></div></div>`;
    return;
  }
  const pack = instructorPack(mentor.name);
  const courses = instructorCourses(mentor.name);
  const desks = instructorMentorships(mentor.name);
  const reviews = instructorReviews(mentor.name);
  const lives = (typeof listedWebinars === "function" ? listedWebinars() : []).filter((w) => w.by === mentor.name);
  const stats = reviews.length
    ? { avg: (reviews.reduce((s, r) => s + Number(r.stars || 0), 0) / reviews.length).toFixed(1), count: reviews.length }
    : { avg: "4.9", count: 0 };
  const shown = courses.slice(0, 3);
  const more = courses.length > 3;
  if (window.BizgarhSeo) window.BizgarhSeo.apply();
  else document.title = `${mentor.name} | Instructor | ${BRAND}`;
  const tabs = [
    ["courses", "Courses", courses.length],
    ["mentorship", "Mentorship", desks.length],
    ["guidance", "Guidance", 1],
    ["style", "Trading style", 1]
  ].filter((t) => t[0] === "guidance" || t[0] === "style" || t[2] > 0 || t[0] === "courses");
  root.innerHTML = `<div class="ip-stage">
    <div class="ip-aurora" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="container">
      <nav class="ip-crumb">
        <a href="${homeHref()}">Home</a><span>/</span>
        <a href="/instructors">Instructors</a><span>/</span>
        <b>${escapeHtml(mentor.name)}</b>
      </nav>
      <section class="ip-hero">
        <div class="ip-hero-photo">
          <div class="ip-frame">
            <span class="ip-ring" aria-hidden="true"></span>
            <img src="${escapeHtml(mentor.img)}" alt="${escapeHtml(mentor.name)}">
          </div>
          ${pack.topRated ? `<span class="ip-rated">${iconSvg("star")} Top rated mentor</span>` : ""}
        </div>
        <div class="ip-hero-copy">
          <p class="ip-kicker"><span class="ip-pulse"></span> ${escapeHtml(pack.company)} instructor</p>
          <h1>${escapeHtml(mentor.name)}</h1>
          <p class="ip-role">${escapeHtml(pack.title)} · ${escapeHtml(pack.languages.join(" · "))}</p>
          <p class="ip-bio">${escapeHtml(pack.bio)}</p>
          <div class="ip-hero-tags">${pack.tags.map((t) => `<span>${escapeHtml(t)}</span>`).join("")}</div>
          <div class="ip-hero-actions">
            <a class="btn btn-primary" href="#ip-courses">See classrooms</a>
            <button type="button" class="btn btn-ghost ip-ghost" data-instructor-call="${escapeHtml(mentor.name)}">Request a callback</button>
          </div>
        </div>
      </section>
      <ul class="ip-stats">
        <li><b>${escapeHtml(pack.years)}</b><span>Years on the desk</span></li>
        <li><b>${escapeHtml(pack.learners)}</b><span>Learners taught</span></li>
        <li><b>${courses.length || "—"}</b><span>Classrooms</span></li>
        <li><b>${desks.length || lives.length || "—"}</b><span>Live desks</span></li>
      </ul>
    </div>
  </div>
  <div class="ip-tabs-wrap">
    <div class="container">
      <nav class="ip-tabs" aria-label="Instructor sections">
        ${tabs.map(([id, label, n], i) => `<button type="button" data-ip-tab="${id}" class="${i === 0 ? "on" : ""}">${escapeHtml(label)}${n > 1 || id === "courses" || id === "mentorship" ? `<em>${n}</em>` : ""}</button>`).join("")}
      </nav>
    </div>
  </div>
  <div class="container ip-sections">
    <section class="ip-block" id="ip-courses">
      <div class="ip-block-head ip-reveal">
        <h2>Classrooms by ${escapeHtml(mentor.name)}</h2>
        <p>Self-paced courses from this desk. Process first. Education only.</p>
      </div>
      <div class="ip-course-grid" id="ipCourseGrid">
        ${(shown.length ? shown : []).map((c) => courseCard(c, "grid-card ip-reveal")).join("") || `<p class="ip-empty">No classrooms yet.</p>`}
      </div>
      ${more ? `<button type="button" class="ip-more" data-ip-more>View more classrooms</button>` : ""}
    </section>
    ${desks.length ? `<section class="ip-block" id="ip-mentorship">
      <div class="ip-block-head ip-reveal">
        <h2>Live mentorship</h2>
        <p>Multi-week desks. Show up live. Journal after.</p>
      </div>
      <div class="mp-grid ip-mp-grid">
        ${desks.map(instructorMentorCardHTML).join("")}
      </div>
    </section>` : ""}
    <section class="ip-block" id="ip-guidance">
      <div class="ip-guide ip-reveal">
        <div class="ip-guide-copy">
          <p class="ip-kicker ip-kicker-ink"><span class="ip-pulse"></span> 1:1 desk time</p>
          <h2>Book personal guidance</h2>
          <p>A callback for your journal, risk, or a stuck setup. ${escapeHtml(mentor.name)} reviews the process — not a signal feed.</p>
          <button type="button" class="btn btn-primary" data-instructor-call="${escapeHtml(mentor.name)}">Request a callback</button>
        </div>
        <article class="ip-guide-card">
          <div class="ip-guide-photo"><img src="${escapeHtml(mentor.img)}" alt="${escapeHtml(mentor.name)}"></div>
          <p class="ip-guide-stars">★ ${escapeHtml(stats.avg)}</p>
          <h3>${escapeHtml(mentor.name)}</h3>
          <p>${escapeHtml(pack.years)} years · ${escapeHtml(pack.languages.join(" · "))}</p>
          <div class="ip-guide-tags">${pack.tags.map((t) => `<span>${escapeHtml(t)}</span>`).join("")}</div>
        </article>
      </div>
    </section>
    <section class="ip-block" id="ip-style">
      <div class="ip-block-head ip-reveal">
        <h2>Teaching style &amp; philosophy</h2>
        <p>How this desk thinks about risk, size, and the week.</p>
      </div>
      <div class="ip-style">
        <blockquote class="ip-style-board ip-reveal">
          <i class="ip-style-glow" aria-hidden="true"></i>
          <span class="ip-style-mark" aria-hidden="true">“</span>
          <p>${escapeHtml(pack.quote)}</p>
          <footer>
            <img src="${escapeHtml(mentor.img)}" alt="">
            <div>
              <b>${escapeHtml(mentor.name)}</b>
              <small>${escapeHtml(pack.title)}</small>
            </div>
          </footer>
        </blockquote>
        <ol class="ip-pillars">
          ${pack.pillars.map((p, i) => `<li class="ip-reveal">
            <em>${String(i + 1).padStart(2, "0")}</em>
            <h3>${escapeHtml(p.t)}</h3>
            <p>${escapeHtml(p.d)}</p>
          </li>`).join("")}
        </ol>
      </div>
    </section>
  </div>`;

  const moreBtn = root.querySelector("[data-ip-more]");
  moreBtn?.addEventListener("click", () => {
    const grid = document.getElementById("ipCourseGrid");
    if (grid) {
      grid.innerHTML = courses.map((c) => courseCard(c, "grid-card ip-reveal")).join("");
      bindInstructorReveal(grid);
    }
    moreBtn.remove();
  });
  const tabBtns = [...root.querySelectorAll("[data-ip-tab]")];
  const setTab = (id) => {
    tabBtns.forEach((b) => b.classList.toggle("on", b.dataset.ipTab === id));
    const el = document.getElementById("ip-" + id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  tabBtns.forEach((btn) => btn.addEventListener("click", () => setTab(btn.dataset.ipTab)));
  root.querySelectorAll('a[href^="#ip-"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      setTab(id.replace(/^ip-/, ""));
    });
  });
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!vis) return;
      const id = vis.target.id.replace(/^ip-/, "");
      tabBtns.forEach((b) => b.classList.toggle("on", b.dataset.ipTab === id));
    }, { rootMargin: "-35% 0px -50% 0px", threshold: [0.15, 0.4] })
    : null;
  if (io) tabs.forEach(([id]) => {
    const el = document.getElementById("ip-" + id);
    if (el) io.observe(el);
  });
  bindInstructorReveal(root);
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
  const preview = typeof staffMentorPreview === "function" ? staffMentorPreview() : "";
  if (!id && !preview) return;
  const p = (typeof mentorProgramById === "function" ? mentorProgramById(id) : null)
    || allMentorPrograms().find((x) => x.id === id)
    || (preview ? allMentorPrograms()[0] : null);
  if (!p || (p.unpublished && !preview)) {
    root.innerHTML = `<div class="container"><div class="empty"><h3>Program not found</h3><a class="btn btn-primary" href="/mentorship" style="margin-top:12px">All programs</a></div></div>`;
    return;
  }
  ensureMentorLive(p);
  const pack = mentorPack(p);
  const enrolled = typeof mentorOwnedForPage === "function" ? mentorOwnedForPage(p) : isMentorEnrolled(p.id);
  const liveRooms = mentorLiveRooms(p);
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
      ${mentorShotHTML(p, "mp-hero-shot wb-in")}
    </section>
    <div class="mp-strip" data-wb>
      <span>${iconSvg("clock")} ${p.hours}+ hours of teaching</span>
      <span>${iconSvg("headset")} Doubt solving live on Bizgarh</span>
      <span>${iconSvg("chat")} Exclusive desk community</span>
      <span>${iconSvg("play")} 1 year access to recordings</span>
    </div>
    <div id="mpPlayer" class="mp-player" hidden></div>
    ${mentorOverviewCardHTML(p, enrolled)}
    ${liveRooms.length ? `<section class="cd-card cd-community-card cd-community ${enrolled ? "is-open" : "is-locked"}" id="deskRooms">
      <div class="cd-ov-head">
        <h2>Community</h2>
        <p class="cd-ov-meta">${enrolled ? `<span class="cd-comm-open">Members only</span>` : `<span class="cd-lock-badge">${iconSvg("lock")} Locked</span>`}</p>
      </div>
      ${deskRoomsGridHTML(enrolled, "Enroll to open " + liveRooms.map((r) => r.label).join(", ") + ".", mentorRoomsOf(p.id))}
    </section>` : ""}
    ${itemReviewsBlockHTML("mentor", p.id)}
    ${mentorPhase(p) === "ended" ? pathNudgeHTML(p.title, "mentor", p.id, "live-end") : ""}
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
          <h3><a href="${instructorHref(p.by)}">${escapeHtml(p.by)}</a></h3>
          <p>${escapeHtml(pack.bio)}</p>
          <div class="mp-ins-tags"><span>${escapeHtml(pack.role)}</span><span>Full-time desk</span><span>Bizgarh mentor</span></div>
          <a class="btn btn-ghost" href="${instructorHref(p.by)}">View instructor profile</a>
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
  bindOverviewExtras(root);
  root.querySelectorAll(".cd-sec-h").forEach((btn) => {
    btn.addEventListener("click", () => {
      const sec = btn.parentElement;
      const open = !sec.classList.contains("open");
      sec.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });
  root.querySelectorAll("[data-mp-lesson]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lesson = mentorLessonsFor(p.id)[Number(btn.dataset.mpLesson)];
      if (!lesson) return;
      if ((lesson.mode || "live") === "live") {
        location.href = "/live-room?id=" + encodeURIComponent(p.id);
        return;
      }
      playMentorRecording(lesson);
    });
  });
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
  const href = `/course?id=${c.id}`;
  const pct = savePct(c);
  const rupee = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
  const priceRow = `<div class="price">${rupee(c.price)}${c.old ? ` <s>${rupee(c.old)}</s>` : ""}${pct ? ` <span class="save">SAVE ${pct}%</span>` : ""}</div>`;
  return `<a class="course-card ${extra}" href="${href}">
    ${courseThumbHTML(c)}
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
  const cards = (typeof listedWebinars === "function" ? listedWebinars() : allWebinars()).filter((w) => w.status !== "ended").slice(0, 3).map((w, i) => `
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
            <a href="/instructors">Instructors</a>
            <a href="/about">About</a>
            <a href="/reviews">Reviews</a>
            <a href="/contact">Help</a>
            <a href="/dashboard">My Dashboard</a>
            <a href="/learning">My Learning</a>
          </div>
        </nav>
      </div>
      <div class="footer-bar">
        <div class="footer-bottom">
          <p>© 2026 Bizgarh Learning Pvt Ltd</p>
          <p>Educational content only. Not investment advice.</p>
        </div>
        <div class="footer-follow">
          <span>Follow us</span>
          <nav class="footer-soc" aria-label="Social">${footerSocialHTML()}</nav>
        </div>
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
    const courseHits = allCourses().filter((c) => c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q)).slice(0, 5);
    const mentorHits = MENTORS.filter((m) => m.name.toLowerCase().includes(q) || (m.role || "").toLowerCase().includes(q) || (m.tag || "").toLowerCase().includes(q)).slice(0, 3);
    const rows = mentorHits.map((m) => `<a href="${instructorHref(m.name)}">${m.name} · instructor</a>`).concat(courseHits.map((c) => `<a href="/course?id=${c.id}">${c.title}</a>`));
    document.getElementById("searchResults").innerHTML = rows.join("") || "<a>No matches</a>";
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

const COURSE_NEXT = {
  "first-month": ["charts-101", "opt-start", "candles"],
  "charts-101": ["candles", "price-action", "levels"],
  "candles": ["levels", "price-action", "breakout"],
  "levels": ["price-action", "breakout"],
  "mf-guide": ["sip", "long-term"],
  "sip": ["long-term", "mf-guide"],
  "long-term": ["sip", "opt-start"],
  "opt-start": ["income", "spreads"],
  "income": ["spreads", "opening-range"],
  "spreads": ["opening-range", "income"],
  "breakout": ["opening-range", "price-action"],
  "price-action": ["breakout", "opening-range"],
  "opening-range": ["breakout", "spreads"],
  "hindi-ta": ["hindi-swing", "candles"],
  "hindi-swing": ["hindi-ta", "price-action"],
  "crypto-lab": ["opt-start", "first-month"],
  "ema-swing": ["price-action", "vwap"],
  "vwap": ["breakout", "opening-range"]
};

function resolveNextTarget(kind, id) {
  if (kind === "webinar") {
    const w = allWebinars().find((x) => x.id === id);
    if (!w) return null;
    return { kind, id, title: w.title, by: w.by, price: 0, old: 0, href: webinarHref(w.id), label: "Enroll next webinar →", owned: isWebinarRegistered(w.id) };
  }
  if (kind === "mentor") {
    const p = allMentorPrograms().find((x) => x.id === id);
    if (!p) return null;
    return { kind, id, title: p.title, by: p.by, price: p.price, old: p.old, href: mentorHref(p.id), label: "Enroll next desk →", owned: isMentorEnrolled(p.id) };
  }
  const c = allCourses().find((x) => x.id === id);
  if (!c) return null;
  return { kind: "course", id, title: c.title, by: c.instructor, price: c.price, old: c.old, href: "/course?id=" + encodeURIComponent(c.id), learners: c.learners, owned: enrolled().includes(c.id), label: "Enroll next classroom →" };
}

function defaultNextCourseId(fromId) {
  const own = new Set(enrolled());
  const catalog = allCourses();
  const from = catalog.find((c) => c.id === fromId);
  for (const id of (COURSE_NEXT[fromId] || [])) {
    const hit = catalog.find((c) => c.id === id);
    if (hit && !own.has(hit.id)) return { kind: "course", id: hit.id };
  }
  const pool = catalog.filter((c) => c.id !== fromId && !own.has(c.id));
  if (!pool.length) return null;
  const related = pool.filter((c) => from && c.cat === from.cat && Number(c.price) >= Number(from.price || 0));
  const pick = (related.length ? related : pool).slice().sort((a, b) => Number(a.price) - Number(b.price))[0];
  return pick ? { kind: "course", id: pick.id } : null;
}

function nextOffer(kind, fromId) {
  const saved = nextPathMap()[kind + ":" + fromId];
  const mapped = saved?.id ? resolveNextTarget(saved.kind || "course", saved.id) : null;
  if (mapped && !mapped.owned) return mapped;
  if (kind === "course") {
    const fb = defaultNextCourseId(fromId);
    return fb ? resolveNextTarget(fb.kind, fb.id) : null;
  }
  if (kind === "webinar" || kind === "mentor") {
    const host = kind === "webinar"
      ? allWebinars().find((w) => w.id === fromId)?.by
      : allMentorPrograms().find((p) => p.id === fromId)?.by;
    const pool = allCourses().filter((c) => !enrolled().includes(c.id));
    const same = pool.find((c) => c.instructor === host);
    const fallback = same || pool.slice().sort((a, b) => Number(a.price) - Number(b.price))[0];
    return fallback ? resolveNextTarget("course", fallback.id) : null;
  }
  return null;
}

function nextCourseOffer(fromId) {
  const offer = nextOffer("course", fromId);
  if (!offer || offer.kind !== "course") return offer ? { title: offer.title, instructor: offer.by, price: offer.price, old: offer.old, id: offer.id, learners: offer.learners || "", _offer: offer } : null;
  return allCourses().find((c) => c.id === offer.id) || null;
}

function takeNextOffer(kind, id) {
  if (kind === "webinar") registerForWebinar(id);
  else if (kind === "mentor") enrollMentorProgram(id);
  else enroll(id);
}

function courseNudgeCopy(fromTitle, next, reason) {
  if (reason === "done" || reason === "live-end") {
    return {
      kicker: reason === "live-end" ? "Session ended. The next desk is open." : "Certificate unlocked. Momentum is rare.",
      title: "Don't stop at the finish line",
      body: `You just finished ${fromTitle}. ${next.title} is the next written process — same desk language, next setup.`
    };
  }
  if (reason === "dash") {
    return {
      kicker: "You bought the first classroom. Most people stall here.",
      title: "Open the next desk before the first one goes cold",
      body: `${next.title} is the step learners take after ${fromTitle}, so the first buy turns into a process — not a one-off video.`
    };
  }
  return {
    kicker: "You opened the door. Keep the chain.",
    title: "This one got you in. The next one makes it stick.",
    body: `You started with ${fromTitle}. ${next.title} is the natural next setup, so you do not leave the first step unused.`
  };
}

function pathNudgeHTML(fromTitle, fromKind, fromId, reason) {
  const next = nextOffer(fromKind, fromId);
  if (!next) return "";
  const copy = courseNudgeCopy(fromTitle, next, reason);
  const save = next.old && next.price ? Math.max(0, Math.round((1 - Number(next.price) / Number(next.old)) * 100)) : 0;
  return `<section class="cd-nudge" data-nudge="${escapeHtml(next.id)}">
    <div class="cd-nudge-copy">
      <span class="cd-nudge-kicker">${escapeHtml(copy.kicker)}</span>
      <h3>${escapeHtml(copy.title)}</h3>
      <p>${escapeHtml(copy.body)}</p>
      <div class="cd-nudge-path" aria-hidden="true">
        <em>You have</em><b>${escapeHtml(fromTitle)}</b>
        <i>→</i>
        <em>Next</em><strong>${escapeHtml(next.title)}</strong>
      </div>
    </div>
    <div class="cd-nudge-offer">
      <small>by ${escapeHtml(next.by || "")}${next.learners ? ` · ${escapeHtml(next.learners)} learners` : ""}</small>
      <div class="cd-nudge-price">${next.price ? `₹${Number(next.price).toLocaleString("en-IN")}` : "Free"}${next.old ? ` <s>₹${Number(next.old).toLocaleString("en-IN")}</s>` : ""}${save ? ` <span>SAVE ${save}%</span>` : ""}</div>
      <div class="cd-nudge-actions">
        <button type="button" class="btn btn-primary" data-nudge-kind="${escapeHtml(next.kind)}" data-nudge-id="${escapeHtml(next.id)}">${escapeHtml(next.label)}</button>
        <a class="btn btn-ghost" href="${escapeHtml(next.href)}">See the syllabus</a>
      </div>
    </div>
  </section>`;
}

function courseNudgeHTML(from, reason) {
  return pathNudgeHTML(from.title, "course", from.id, reason);
}

function offerBannerHTML(next) {
  if (!next?.id) return "";
  if (next.kind === "webinar") {
    const w = allWebinars().find((x) => x.id === next.id);
    return w ? `<div class="yt-upsell-banner">${webinarBannerHTML(w)}</div>` : "";
  }
  if (next.kind === "mentor") {
    const p = allMentorPrograms().find((x) => x.id === next.id);
    if (!p) return "";
    return `<div class="yt-upsell-banner yt-upsell-mentor" style="--mp:${p.tint || "#4f46e5"}">
      <span class="wb-chip">Bizgarh</span>
      <div class="web-banner-copy"><small>Mentorship</small><b>${escapeHtml(p.title)}</b></div>
      <img src="${photoFor(p.by)}" alt="">
    </div>`;
  }
  const c = allCourses().find((x) => x.id === next.id);
  if (!c) return "";
  return courseThumbHTML(c);
}

function courseNudgePlayerHTML(from, nextCourse, awarded) {
  const next = nextOffer("course", from.id) || (nextCourse ? resolveNextTarget("course", nextCourse.id) : null);
  if (next) {
    const copy = courseNudgeCopy(from.title, next, awarded ? "done" : "buy");
    return `<div class="yt-upsell">
      <span class="yt-upsell-pill">${awarded ? "Classroom complete" : "Keep the streak"}</span>
      <h3>${escapeHtml(copy.title)}</h3>
      <p>${escapeHtml(copy.body)}</p>
      <div class="yt-upsell-next">
        ${offerBannerHTML(next)}
        <div class="yt-upsell-meta">
          <b>${escapeHtml(next.title)}</b>
          <small>${next.price ? `₹${Number(next.price).toLocaleString("en-IN")}` : "Free"} · by ${escapeHtml(next.by || "")}</small>
        </div>
      </div>
      <div class="yt-end-actions">
        ${awarded ? `<button type="button" class="yt-end-play" data-cert-download="${escapeHtml(from.id)}">Download certificate</button>` : ""}
        <button type="button" class="${awarded ? "" : "yt-end-play"}" data-nudge-kind="${escapeHtml(next.kind)}" data-nudge-id="${escapeHtml(next.id)}">Enroll next →</button>
        <a href="${escapeHtml(next.href)}">See syllabus</a>
        <button type="button" id="endCancel">Close</button>
      </div>
    </div>`;
  }
  return `<div class="yt-upsell">
    <span class="yt-upsell-pill">${awarded ? "Classroom complete" : "Finished"}</span>
    <h3>${awarded ? "Certificate unlocked" : "You reached the last lesson"}</h3>
    <p>${awarded ? "Download it, then open another classroom so the finish does not go cold." : "Browse the next classroom while this one is still fresh."}</p>
    <div class="yt-end-actions">
      ${awarded ? `<button type="button" class="yt-end-play" data-cert-download="${escapeHtml(from.id)}">Download certificate</button>` : ""}
      <a class="yt-end-play" href="/courses">Browse classrooms</a>
      <button type="button" id="endCancel">Close</button>
    </div>
  </div>`;
}

function bindCourseNudge(root = document) {
  root.querySelectorAll("[data-nudge-id]").forEach((btn) => {
    if (btn.dataset.boundNudge) return;
    btn.dataset.boundNudge = "1";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      takeNextOffer(btn.dataset.nudgeKind || "course", btn.dataset.nudgeId);
    });
  });
  root.querySelectorAll("[data-nudge-buy]").forEach((btn) => {
    if (btn.dataset.boundNudge) return;
    btn.dataset.boundNudge = "1";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      enroll(btn.dataset.nudgeBuy);
    });
  });
}

function dashboardPathNudgeHTML(user) {
  const mine = ownedCourses(user.email);
  if (!mine.length) return "";
  const cheapest = mine.slice().sort((a, b) => Number(a.c.price) - Number(b.c.price))[0];
  const onlyStarter = mine.length === 1 || mine.every((x) => Number(x.c.price) <= 499);
  if (!onlyStarter && mine.length > 2) return "";
  return courseNudgeHTML(cheapest.c, "dash");
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

function learnerReviews() {
  return readList(LEARNER_REVIEWS_KEY);
}
function setLearnerReviews(list) { writeList(LEARNER_REVIEWS_KEY, list); }
function reviewTargetTitle(kind, id) {
  if (kind === "webinar") return allWebinars().find((x) => x.id === id)?.title || id;
  if (kind === "mentor") return allMentorPrograms().find((x) => x.id === id)?.title || id;
  return allCourses().find((x) => x.id === id)?.title || id;
}
function canReview(kind, id) {
  const u = getUser();
  if (!u) return false;
  if (kind === "course") return isEnrolled(id) && typeof certFor === "function" && !!certFor(u.email, id);
  if (kind === "webinar") {
    const w = allWebinars().find((x) => x.id === id);
    return isWebinarRegistered(id) && w && w.status === "ended";
  }
  if (kind === "mentor") {
    const p = allMentorPrograms().find((x) => x.id === id);
    return isMentorEnrolled(id) && p && mentorPhase(p) === "ended";
  }
  return false;
}
function myReview(kind, id) {
  const u = getUser();
  if (!u) return null;
  return learnerReviews().find((r) => r.email === u.email && r.kind === kind && r.targetId === id) || null;
}
function reviewsFor(kind, id) {
  return allReviews().filter((r) => (r.kind || "course") === kind && (r.targetId === id || r.courseId === id));
}
function ratingStats(kind, id) {
  const list = reviewsFor(kind, id);
  const count = list.length;
  const avg = count ? (list.reduce((s, r) => s + Number(r.stars || 0), 0) / count).toFixed(1) : "0.0";
  return { count, avg };
}
function submitLearnerReview(kind, id, fields) {
  const u = getUser();
  if (!u || !canReview(kind, id)) return null;
  const text = String(fields.text || "").trim();
  if (!text) return null;
  const stars = Math.min(5, Math.max(1, Number(fields.stars) || 5));
  const title = reviewTargetTitle(kind, id);
  const row = {
    id: "lr-" + Date.now(),
    kind,
    targetId: id,
    name: u.name || "Learner",
    email: u.email,
    city: String(fields.city || "").trim() || "India",
    photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "Learner")}&background=eef2ff&color=4f46e5&size=128`,
    stars,
    text,
    course: title,
    courseId: kind === "course" ? id : "",
    when: "Just now",
    lang: /[\u0900-\u097F]/.test(text) ? "hi" : "en",
    at: new Date().toISOString(),
    source: "learner"
  };
  setLearnerReviews([row, ...learnerReviews().filter((r) => !(r.email === u.email && r.kind === kind && r.targetId === id))]);
  return row;
}
function reviewFormHTML(kind, id) {
  const mine = myReview(kind, id);
  const ready = canReview(kind, id);
  const user = getUser();
  const label = kind === "webinar" ? "webinar" : kind === "mentor" ? "desk" : "classroom";
  const stars = mine ? Number(mine.stars) : 5;
  let gate = "";
  if (!user) gate = "Login to put your name on this review.";
  else if (!ready) gate = kind === "course" ? "Finish the last lesson, then this note goes live." : "Reviews open after this desk ends.";
  return `<form class="desk-review${gate ? " is-gated" : ""}" data-review-kind="${escapeHtml(kind)}" data-review-id="${escapeHtml(id)}">
    <span class="desk-review-kicker">Write a review</span>
    <h3>How did this ${label} sit with you?</h3>
    <p class="desk-review-sub">A star rating and a few honest lines. It publishes on Reviews as soon as you submit.</p>
    <div class="desk-stars" role="radiogroup" aria-label="Stars">
      ${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-star="${n}" class="${n <= stars ? "on" : ""}" style="--s:${n}">★</button>`).join("")}
    </div>
    <input type="hidden" name="stars" value="${stars}">
    <textarea name="text" required maxlength="400" placeholder="What stayed with you after you finished?">${mine ? escapeHtml(mine.text) : ""}</textarea>
    <div class="desk-review-row">
      <input name="city" maxlength="40" placeholder="City (optional)" value="${mine ? escapeHtml(mine.city || "") : ""}">
      <button class="btn btn-primary desk-review-go" type="submit">${mine ? "Update review" : "Submit review"}</button>
    </div>
    ${gate ? `<p class="desk-review-gate">${gate}</p>` : mine ? `<p class="desk-review-thanks">You rated this ${mine.stars}★. Edit and submit again anytime.</p>` : ""}
  </form>`;
}
function itemReviewsBlockHTML(kind, id) {
  const stats = ratingStats(kind, id);
  const list = reviewsFor(kind, id);
  return `<section class="cd-card desk-reviews-card" id="deskReviews" data-review-block="${escapeHtml(kind)}" data-review-target="${escapeHtml(id)}">
    <div class="cd-ov-head">
      <h2>Reviews</h2>
      <p class="cd-ov-meta">${stats.count ? `<span>★ ${stats.avg}</span><span>${stats.count} review${stats.count === 1 ? "" : "s"}</span>` : `<span>Be the first to review</span>`}</p>
    </div>
    ${reviewFormHTML(kind, id)}
    <div class="desk-review-list">${list.slice(0, 8).map(reviewCardHTML).join("")}</div>
  </section>`;
}
function refreshDeskReviews(kind, id) {
  const host = document.getElementById("deskReviews");
  if (!host) return;
  const parent = host.parentElement;
  host.outerHTML = itemReviewsBlockHTML(kind, id);
  bindReviewForm(parent || document);
}
function bindReviewForm(root = document) {
  root.querySelectorAll("[data-review-kind]").forEach((form) => {
    if (form.dataset.boundReview) return;
    form.dataset.boundReview = "1";
    form.querySelectorAll("[data-star]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const n = Number(btn.dataset.star);
        form.stars.value = String(n);
        form.querySelectorAll("[data-star]").forEach((x) => x.classList.toggle("on", Number(x.dataset.star) <= n));
      });
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const kind = form.dataset.reviewKind;
      const id = form.dataset.reviewId;
      if (!getUser()) {
        if (typeof requireAuth === "function") requireAuth(() => form.requestSubmit());
        else toast("Login to submit a review");
        return;
      }
      const row = submitLearnerReview(kind, id, {
        stars: form.stars.value,
        text: form.text.value,
        city: form.city?.value
      });
      if (!row) {
        toast(canReview(kind, id) ? "Write a short review first" : "Finish this desk first, then review");
        return;
      }
      toast("Review is live");
      refreshDeskReviews(kind, id);
      if (typeof paintReviewMarquee === "function") {
        paintReviewMarquee(document.getElementById("reviewMarquee"));
        paintReviewMarquee(document.getElementById("learnReviews"), true);
      }
    });
  });
}

function deskReviewSeeds() {
  return [
    { id: "seed-w1", kind: "webinar", targetId: "w1", name: "Isha Verma", city: "Delhi", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=128&h=128&q=80&crop=faces", stars: 5, text: "Live room felt like a real desk. I wrote the gap rule before the open and skipped two noisy trades.", course: "Gap & Go for Nifty Options", courseId: "", when: "1 week ago", lang: "en", source: "seed" },
    { id: "seed-w0", kind: "webinar", targetId: "w0", name: "Rohit Nair", city: "Kochi", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&h=128&q=80&crop=faces", stars: 4, text: "Replay was tight. I wanted more Q&A time, but the invalidation line was clear.", course: "Gap & Go Replay Desk", courseId: "", when: "3 weeks ago", lang: "en", source: "seed" },
    { id: "seed-m1", kind: "mentor", targetId: "mp-breakout", name: "Sana Qureshi", city: "Hyderabad", photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=128&h=128&q=80&crop=faces", stars: 5, text: "Journal check every week kept me honest. I still size too big sometimes, but the process stuck.", course: "Intraday Desk Mentorship", courseId: "", when: "4 days ago", lang: "en", source: "seed" },
    { id: "seed-m2", kind: "mentor", targetId: "mp-closed", name: "Kabir Shah", city: "Ahmedabad", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=128&h=128&q=80&crop=faces", stars: 5, text: "Closed cohort, still using the same journal. That is the point.", course: "Intraday Journal Cohort", courseId: "", when: "1 month ago", lang: "en", source: "seed" }
  ];
}
function allReviews() {
  const seed = (Array.isArray(window.REVIEWS) ? window.REVIEWS : []).map((r) => ({
    ...r,
    kind: r.kind || "course",
    targetId: r.targetId || r.courseId || ""
  }));
  return learnerReviews().concat(deskReviewSeeds(), seed);
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

function paintReviewMarquee(host, single) {
  if (!host) return;
  const list = allReviews();
  if (!list.length) return;
  const row1 = list.slice(0, 24);
  const row2 = list.slice(24, 48);
  const paint = (rows) => rows.concat(rows).map(reviewCardHTML).join("");
  host.innerHTML = single
    ? `<div class="review-row"><div class="review-track">${paint(row1)}</div></div>`
    : `<div class="review-row"><div class="review-track">${paint(row1)}</div></div>
    <div class="review-row reverse"><div class="review-track">${paint(row2)}</div></div>`;
}
function renderHomeReviews() {
  paintReviewMarquee(document.getElementById("reviewMarquee"));
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
    if (filter === "course" && (r.kind || "course") !== "course") return false;
    if (filter === "webinar" && r.kind !== "webinar") return false;
    if (filter === "mentor" && r.kind !== "mentor") return false;
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

function traderFace(m) {
  const pack = typeof instructorPack === "function" ? instructorPack(m.name) : {};
  const faces = {
    "Aarav Mehta": { badge: "Expert", tone: "violet", exp: "star" },
    "Neha Kapoor": { badge: "Specialist", tone: "amber", exp: "trophy" },
    "Vikram Singh": { badge: "Coach", tone: "purple", exp: "cap" },
    "Ananya Rao": { badge: "Investor", tone: "orange", exp: "chart" },
    "Kabir Joshi": { badge: "Expert", tone: "blue", exp: "shield" },
    "Rohan Desai": { badge: "Specialist", tone: "amber", exp: "trophy" },
    "Priya Nair": { badge: "Investor", tone: "teal", exp: "chart" },
    "Meera Iyer": { badge: "Coach", tone: "purple", exp: "cap" }
  };
  return Object.assign({ badge: "Expert", tone: "violet", exp: "star", years: "8+" }, faces[m.name] || {}, { years: pack.years || "8+" });
}

function traderIcon(kind) {
  const icons = {
    expert: '<path d="M4 15.2 9 10.8l3.2 3L20 7"/><path d="M14.2 7H20v5.6"/>',
    specialist: '<circle cx="12" cy="12" r="7.2"/><path d="M12 8.2V12l2.6 1.6"/>',
    coach: '<path d="M11 4.6 6.6 13h4.2l-.8 6.4L17.6 11h-4.1L14.4 4.6H11Z"/>',
    investor: '<path d="M8 8.2V6.8A4 4 0 0 1 16 6.8v1.4"/><rect x="5.2" y="8.2" width="13.6" height="10.4" rx="2"/><path d="M5.2 12.4h13.6"/>',
    pulse: '<path d="M3.6 13h3.2l1.8-4.4 2.6 8.2 2-3.8H20"/>',
    clock: '<circle cx="12" cy="12" r="7.2"/><path d="M12 8.2V12l2.6 1.6"/>',
    bolt: '<path d="M11 4.6 6.6 13h4.2l-.8 6.4L17.6 11h-4.1L14.4 4.6H11Z"/>',
    bag: '<path d="M8 8.2V6.8A4 4 0 0 1 16 6.8v1.4"/><rect x="5.2" y="8.2" width="13.6" height="10.4" rx="2"/>',
    leaf: '<path d="M6.4 15.2c2.8 2.8 8.8 2.2 10.8-2.2 0-6-4.6-8.8-8.8-8.6-1.8 3.4-.8 8.2-2 10.8Z"/><path d="M8.4 14.8c1.8-2 3.2-5 3.6-8"/>',
    star: '<path d="m12 3.6 2.1 4.3 4.7.7-3.4 3.3.8 4.7L12 14.4 7.8 16.6l.8-4.7-3.4-3.3 4.7-.7Z"/>',
    trophy: '<path d="M8 20h8M12 16.6V20M7.4 4.6h9.2v4.2c0 3.2-2 5.8-4.6 5.8S7.4 12 7.4 8.8V4.6Z"/><path d="M7.4 6.6H5.2A2.4 2.4 0 0 0 5.2 11h2M16.6 6.6h2.2a2.4 2.4 0 0 1 0 4.4h-2"/>',
    cap: '<path d="M3 10.2 12 5.2l9 5-9 5-9-5Z"/><path d="M7 12.4v4.2c0 .6 2.2 2 5 2s5-1.4 5-2v-4.2"/><path d="M21 11.2v5.2"/>',
    chart: '<path d="M4 16.4 9 11.8l3.3 3.1L20 7.4"/><path d="M14.4 7.4H20V13"/>',
    shield: '<path d="M12 3.5 5 6.2v5.6c0 4.2 2.9 7.3 7 8.7 4.1-1.4 7-4.5 7-8.7V6.2L12 3.5Z"/>'
  };
  return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">${icons[kind] || icons.expert}</svg>`;
}

function traderCardHTML(m, i) {
  const face = traderFace(m);
  const badgeIcon = face.badge === "Specialist" ? "specialist" : face.badge === "Coach" ? "coach" : face.badge === "Investor" ? "investor" : "expert";
  const tagIcon = face.tone === "amber" ? "clock" : face.tone === "orange" || face.tone === "teal" ? "bag" : face.tone === "blue" ? "pulse" : face.badge === "Coach" ? "bolt" : "pulse";
  return `
      <a class="tr-card tone-${face.tone}" href="${instructorHref(m.name)}" style="--d:${0.08 + i * 0.06}s">
        <span class="tr-shot">
          <img src="${m.img}" alt="${m.name}">
          <span class="tr-badge">${traderIcon(badgeIcon)} ${face.badge}</span>
        </span>
        <span class="tr-body">
          <strong>${m.name} <i class="tr-check" aria-hidden="true"><svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="8"/><path d="M4.6 8.2 7 10.5l4.5-5"/></svg></i></strong>
          <em>${m.role}</em>
          <span class="tr-tag">${traderIcon(tagIcon)} ${m.tag}</span>
          <span class="tr-years">${traderIcon(face.exp)} ${face.years} Years Experience</span>
        </span>
      </a>`;
}

function bindTraderCarousel(sec) {
  const track = sec.querySelector("#mentorTrack");
  if (!track || track.dataset.bound === "1") return;
  track.dataset.bound = "1";
  const stage = sec.querySelector(".tr-stage");
  const step = () => {
    const card = track.querySelector(".tr-card");
    return Math.max(200, (card ? card.getBoundingClientRect().width : 220) + 16);
  };
  sec.querySelector("[data-tr-prev]")?.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
  sec.querySelector("[data-tr-next]")?.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
  const pager = sec.querySelector("#traderPager");
  const paint = () => {
    const max = track.scrollWidth - track.clientWidth;
    if (stage) {
      stage.classList.toggle("is-start", track.scrollLeft <= 4);
      stage.classList.toggle("is-end", max <= 4 || track.scrollLeft >= max - 4);
    }
    if (!pager) return;
    const p = max <= 1 ? 0 : track.scrollLeft / max;
    const dots = [...pager.querySelectorAll("i")];
    const idx = Math.round(p * Math.max(0, dots.length - 1));
    dots.forEach((d, i) => d.classList.toggle("is-on", i === idx));
  };
  track.addEventListener("scroll", paint, { passive: true });
  window.addEventListener("resize", paint);
  paint();
}

function bindTradersReveal(sec) {
  const show = () => {
    sec.classList.add("is-in");
    setTimeout(() => sec.classList.add("is-ready"), 900);
  };
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { show(); return; }
  if (!("IntersectionObserver" in window)) { show(); return; }
  const io = new IntersectionObserver((entries) => {
    if (!entries[0] || !entries[0].isIntersecting) return;
    show();
    io.disconnect();
  }, { threshold: 0.16, rootMargin: "0px 0px -6% 0px" });
  io.observe(sec);
}

function renderHomeExtras() {
  const mentorTrack = document.getElementById("mentorTrack");
  if (mentorTrack) {
    mentorTrack.innerHTML = MENTORS.map((m, i) => traderCardHTML(m, i)).join("");
    const sec = document.getElementById("workingTraders");
    if (sec) {
      bindTraderCarousel(sec);
      bindTradersReveal(sec);
    }
  }
  const web = document.getElementById("webinarTrack");
  if (web) {
    web.innerHTML = (typeof listedWebinars === "function" ? listedWebinars() : allWebinars()).filter((w) => w.status !== "ended").map((w, i) => webinarCardHTML(w, i)).join("");
  }
  document.querySelectorAll("[data-cat-grid]").forEach((el) => { el.innerHTML = categoryCardsHTML(); });
  const pageWeb = document.getElementById("courseWebinars");
  if (pageWeb) {
    pageWeb.innerHTML = (typeof listedWebinars === "function" ? listedWebinars() : allWebinars()).filter((w) => w.status !== "ended").slice(0, 3).map((w, i) => webinarCardHTML(w, i)).join("");
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
  const custom = Array.isArray(c?.learn) ? c.learn.map((s) => String(s || "").trim()).filter(Boolean) : [];
  if (custom.length) return custom;
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
function bonusResourcesOf(c) {
  if (Array.isArray(c?.bonus)) {
    return c.bonus.map((b) => {
      if (typeof b === "string") return { title: b.trim(), note: "" };
      return { title: String(b?.title || "").trim(), note: String(b?.note || "").trim() };
    }).filter((b) => b.title).slice(0, 5);
  }
  return [{ title: `Access to the Bizgarh practice desk with ${c.instructor}`, note: "FREE" }];
}

function topicResHTML(it, playable) {
  const notes = String(it.notes || "").trim();
  const pdf = String(it.pdf || "").trim();
  if (!notes && !pdf) return "";
  return `<div class="cd-topic-res">
    ${notes ? `<button type="button" class="cd-res" data-open-notes="${escapeHtml(it.t)}" data-notes="${encodeURIComponent(notes)}" ${playable ? "" : "disabled"}>Notes</button>` : ""}
    ${pdf ? (playable
      ? `<a class="cd-res" href="${escapeHtml(pdf)}" target="_blank" rel="noopener" download="${escapeHtml(it.pdfName || "lesson.pdf")}">PDF</a>`
      : `<button type="button" class="cd-res" disabled>PDF</button>`) : ""}
  </div>`;
}

function topicRowHTML(it, playable) {
  const mode = it.mode || "";
  const live = mode === "live" || it.kind === "live";
  const rec = mode === "recorded";
  if (it.kind === "pdf") {
    const href = String(it.pdf || "").trim();
    return `<div class="cd-topic-row">
      <div class="cd-topic">
        <span class="cd-topic-ico">${iconSvg("file")}</span>
        <span>${escapeHtml(it.t)}</span>
        ${it.dur ? `<em>${escapeHtml(it.dur)}</em>` : `<em>PDF</em>`}
      </div>
      ${href && playable
        ? `<a class="cd-res" href="${escapeHtml(href)}" target="_blank" rel="noopener" download="${escapeHtml(it.pdfName || "lesson.pdf")}">Open PDF</a>`
        : `<button type="button" class="cd-res" disabled>PDF</button>`}
    </div>`;
  }
  if (it.kind === "article") {
    return `<div class="cd-topic-row">
      <div class="cd-topic">
        <span class="cd-topic-ico">${iconSvg("file")}</span>
        <span>${escapeHtml(it.t)}</span>
        ${it.dur ? `<em>${escapeHtml(it.dur)}</em>` : ""}
      </div>
      ${topicResHTML(it, playable)}
    </div>`;
  }
  if (playable && it.lesson != null && !live && !rec) {
    return `<div class="cd-topic-row">
      <button type="button" class="cd-topic playable${it.lesson === 0 ? " active" : ""}" data-lesson="${it.lesson}">
        <span class="cd-topic-ico">${iconSvg("play")}</span>
        <span>${escapeHtml(it.t)}</span>
        ${it.dur ? `<em>${escapeHtml(it.dur)}</em>` : ""}
      </button>
      ${topicResHTML(it, true)}
    </div>`;
  }
  if (playable && (live || rec)) {
    return `<div class="cd-topic-row">
      <button type="button" class="cd-topic playable" data-mp-lesson="${escapeHtml(String(it.i ?? ""))}" data-mp-mode="${escapeHtml(mode)}">
        <span class="cd-topic-ico">${iconSvg(live ? "wifi" : "play")}</span>
        <span>${escapeHtml(it.t)}</span>
        <em>${live ? "Live" : "Recorded"}${it.dur ? " · " + escapeHtml(it.dur) : ""}</em>
      </button>
      ${topicResHTML(it, true)}
    </div>`;
  }
  return `<div class="cd-topic-row">
    <div class="cd-topic">
      <span class="cd-topic-ico">${iconSvg(live ? "wifi" : "play")}</span>
      <span>${escapeHtml(it.t)}</span>
      ${mode ? `<em>${live ? "Live" : rec ? "Recorded" : ""}</em>` : ""}
    </div>
    ${topicResHTML(it, false)}
  </div>`;
}

function mentorLessonsFor(programId) {
  const map = mentorLessonsMap();
  if (Object.prototype.hasOwnProperty.call(map, programId)) return map[programId] || [];
  const p = (typeof mentorProgramById === "function" ? mentorProgramById(programId) : null)
    || allMentorPrograms().find((x) => x.id === programId);
  const pack = p && typeof mentorPack === "function" ? mentorPack(p) : { curriculum: [] };
  return (pack.curriculum || ["Live desk session"]).map((t, i) => ({
    id: programId + "-l" + i,
    t,
    dur: "60 min",
    mode: "live",
    notes: "",
    pdf: "",
    src: "",
    vdoId: "",
    at: p?.at || ""
  }));
}

function mentorOverviewCardHTML(p, playable) {
  const lessons = mentorLessonsFor(p.id);
  const liveN = lessons.filter((l) => (l.mode || "live") === "live").length;
  const recN = lessons.length - liveN;
  const sections = [];
  for (let i = 0; i < lessons.length; i += 3) {
    const slice = lessons.slice(i, i + 3);
    sections.push({
      t: i === 0 ? "Desk sessions" : `Section ${String(Math.floor(i / 3) + 1).padStart(2, "0")}`,
      m: `${slice.length} session${slice.length === 1 ? "" : "s"}`,
      items: slice.map((l, j) => ({ ...l, i: i + j, lesson: null, mode: l.mode || "live" }))
    });
  }
  return `
        <section class="cd-card cd-overview-card" id="mentorOverview">
          <div class="cd-ov-head">
            <h2>Your Course Overview</h2>
            <p class="cd-ov-meta">
              <span>${sections.length} sections</span>
              <span>${lessons.length} sessions</span>
              <span>${liveN} live · ${recN} recorded</span>
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
                    ${s.items.map((it) => topicRowHTML(it, playable)).join("")}
                  </div>
                </div>
              </div>`).join("")}
          </div>
        </section>`;
}

function webinarOverviewCardHTML(w) {
  const playable = (typeof webinarOwnedForPage === "function" ? webinarOwnedForPage(w) : isWebinarRegistered(w.id)) || w.status === "ended";
  const item = { t: w.title, dur: w.duration || "60 min", notes: w.notes || "", pdf: w.pdf || "", mode: w.status === "ended" && w.recordUrl ? "recorded" : "live" };
  return `
        <section class="cd-card cd-overview-card" id="webinarOverview">
          <div class="cd-ov-head">
            <h2>Your Course Overview</h2>
            <p class="cd-ov-meta"><span>1 session</span><span>${w.status === "ended" ? "Ended" : "Live webinar"}</span></p>
          </div>
          <div class="cd-overview">
            <div class="cd-sec open">
              <button type="button" class="cd-sec-h" aria-expanded="true">
                <span class="cd-sec-num">01</span>
                <span class="cd-sec-title">Live session</span>
                <em class="cd-sec-dur">${iconSvg("clock")} ${escapeHtml(w.duration || "60 min")}</em>
                <i class="cd-sec-arrow" aria-hidden="true"></i>
              </button>
              <div class="cd-topics"><div class="cd-topics-inner">${topicRowHTML({ ...item, i: 0 }, playable)}</div></div>
            </div>
          </div>
        </section>`;
}

function openDeskNotes(title, body) {
  let pop = document.getElementById("deskNotePop");
  if (!pop) {
    pop = document.createElement("div");
    pop.id = "deskNotePop";
    pop.className = "desk-note-pop";
    document.body.appendChild(pop);
  }
  pop.innerHTML = `<div class="desk-note-card">
    <button type="button" class="desk-note-x" aria-label="Close">Close</button>
    <h3>${escapeHtml(title || "Lesson notes")}</h3>
    <div class="desk-note-body">${escapeHtml(body || "").replace(/\n/g, "<br>")}</div>
  </div>`;
  pop.hidden = false;
  pop.querySelector(".desk-note-x").addEventListener("click", () => { pop.hidden = true; });
  pop.addEventListener("click", (e) => { if (e.target === pop) pop.hidden = true; });
}

async function playMentorRecording(lesson) {
  const host = document.getElementById("mpPlayer");
  if (!host) { toast("Open the program page to watch the recording"); return; }
  host.hidden = false;
  host.innerHTML = `<p class="muted">Loading recording…</p>`;
  host.scrollIntoView({ behavior: "smooth", block: "start" });
  if (lesson.vdoId && typeof fetchVdoOtp === "function") {
    try {
      const data = await fetchVdoOtp(lesson.vdoId);
      host.innerHTML = `<iframe class="mp-frame" title="Recorded session" src="https://player.vdocipher.com/v2/?otp=${encodeURIComponent(data.otp)}&playbackInfo=${encodeURIComponent(data.playbackInfo)}" allow="encrypted-media; autoplay; fullscreen" allowfullscreen></iframe>`;
      return;
    } catch {
      host.innerHTML = `<p class="muted">Could not start the DRM recording. Try the MP4 link or join the live desk.</p>`;
      return;
    }
  }
  if (lesson.fileKey && typeof getVideoBlob === "function") {
    try {
      const blob = await getVideoBlob(lesson.fileKey);
      if (blob) {
        host.innerHTML = `<video class="mp-frame" src="${URL.createObjectURL(blob)}" controls playsinline></video>`;
        return;
      }
    } catch {}
  }
  if (lesson.src) {
    host.innerHTML = `<video class="mp-frame" src="${escapeHtml(lesson.src)}" controls playsinline></video>`;
    return;
  }
  host.innerHTML = `<p class="muted">No recording uploaded yet. Join the live desk, or wait for the mentor to add the file in admin.</p>`;
}

function bindOverviewExtras(root = document) {
  bindCourseNudge(root);
  bindReviewForm(root);
  root.querySelectorAll("[data-open-notes]").forEach((btn) => {
    if (btn.dataset.boundNotes) return;
    btn.dataset.boundNotes = "1";
    btn.addEventListener("click", () => {
      let body = btn.dataset.notes || "";
      try { body = decodeURIComponent(body); } catch {}
      openDeskNotes(btn.dataset.openNotes, body);
    });
  });
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
  const sy = typeof syllabusFor === "function" ? syllabusFor(c.id) : null;
  const publicLessons = lessonsFor(c.id);
  if (!sy || !sy.sections) {
    const titles = ["Introduction", "Core ideas", "The setup", "Risk & journal", "Managing trades"];
    const sections = [];
    for (let i = 0; i < publicLessons.length; i += 3) {
      const slice = publicLessons.slice(i, i + 3);
      const gi = Math.floor(i / 3);
      sections.push({
        t: titles[gi] || `Section ${String(gi + 1).padStart(2, "0")}`,
        m: `${slice.length} lesson${slice.length === 1 ? "" : "s"}`,
        items: slice.map((l, j) => ({ t: l.t, dur: l.dur, lesson: i + j, notes: l.notes || "", pdf: l.pdf || "", pdfName: l.pdfName || "", kind: l.kind || "video" }))
      });
    }
    return sections;
  }
  const all = lessonsAll(c.id);
  const byId = Object.fromEntries(all.map((l) => [l.id, l]));
  return sy.sections.map((sec) => {
    const items = (sec.items || []).map((it) => {
      const l = byId[it.lessonId];
      if (!l || l.published === false || it.published === false) return null;
      const lesson = publicLessons.findIndex((x) => x.id === l.id);
      return {
        t: l.t,
        dur: l.dur || "",
        lesson: lesson >= 0 ? lesson : null,
        notes: l.notes || "",
        pdf: l.pdf || "",
        pdfName: l.pdfName || "",
        kind: it.kind || l.kind || "video"
      };
    }).filter(Boolean);
    return {
      t: sec.title,
      m: `${items.length} lesson${items.length === 1 ? "" : "s"}`,
      items
    };
  }).filter((s) => s.items.length);
}

function courseOverviewCardHTML(c, playable) {
  const sections = curriculumFromLessons(c).map((s) => ({
    ...s,
    items: playable ? s.items : s.items.map((it) => ({ ...it, lesson: null }))
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
                    ${s.items.map((it) => topicRowHTML(it, playable)).join("")}
                  </div>
                </div>
              </div>`).join("")}
            ${awardedCertFooterHTML(c, playable)}
          </div>
        </section>
        ${playable ? courseNudgeHTML(c, (typeof certFor === "function" && getUser() && certFor(getUser().email, c.id)) ? "done" : "buy") : ""}`;
}

function courseAbout(c) {
  if (c.description) return c.description;
  return `${c.title} is taught by ${c.instructor}. The classroom is built around a written setup, a clear invalidation, and a journal you can keep after the video ends. You will learn how to choose the trade, size it, and review the week — not a list of tips. The lessons are short, practical, and meant to be replayed before the next session.`;
}

function courseLiveRooms(c) {
  return visibleDeskRooms(typeof courseRoomsOf === "function" ? courseRoomsOf(c.id) : deskRoomsMap());
}
function courseCommunityBodyHTML(c, owned) {
  const rooms = typeof courseRoomsOf === "function" ? courseRoomsOf(c.id) : null;
  const live = visibleDeskRooms(rooms);
  if (!live.length) return "";
  const names = live.map((r) => r.label).join(", ");
  return `<div class="course-comm-body">${deskRoomsGridHTML(owned, "Buy this classroom to open " + names + ".", rooms)}</div>`;
}

function courseBuyBoxHTML(c, langs, watchers, extraClass) {
  const hasComm = courseLiveRooms(c).length > 0;
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
        ${hasComm ? `<button type="button" class="btn btn-ghost btn-block cd-comm-cta locked js-comm-lock">
          <span class="cd-lock-on" aria-hidden="true">${iconSvg("lock")}</span>
          Community
        </button>` : ""}
        <p class="cd-watch"><i></i> ${watchers} learners watching right now</p>
      </aside>`;
}

function renderCoursePage() {
  const box = document.getElementById("courseDetail");
  if (!box) return;
  const id = new URLSearchParams(location.search).get("id");
  if (!id) return;
  const c = allCourses().find((x) => x.id === id);
  if (!c) {
    box.innerHTML = `<div class="empty"><h3>Classroom not found</h3><a class="btn btn-primary" href="/courses" style="margin-top:12px">All courses</a></div>`;
    return;
  }
  const art = COVERS[c.cover] || { bg: "linear-gradient(135deg,#4f46e5,#1e1b4b)", title: c.title, sub: c.instructor };
  const logged = Boolean(getUser());
  const previewMode = typeof staffCoursePreview === "function" ? staffCoursePreview() : "";
  const owned = typeof courseOwnedForPage === "function" ? courseOwnedForPage(c) : (logged && isEnrolled(c.id));
  const langs = courseLangs(c);
  const points = learnPoints(c);
  const bonuses = bonusResourcesOf(c);
  const liveRooms = courseLiveRooms(c);
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
        : `<div class="cd-preview${courseBannerOf(c) ? " has-banner" : ""}" style="${courseBannerOf(c) ? `background-image:url('${String(courseBannerOf(c)).replace(/'/g, "%27")}')` : `--cover:${art.bg}`}">
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
        ${previewMode ? `<p class="cd-admin-preview">${previewMode === "owned" ? "Admin view · after the student buys" : "Admin view · before the student buys"}</p>` : ""}
        ${bonuses.length ? `<div class="cd-bonus cd-bonus-card">
          <div class="cd-ov-head">
            <h2>Bonus resources included</h2>
            <p class="cd-ov-meta"><span class="cd-free">FREE</span></p>
          </div>
          ${bonuses.map((b) => `<div class="cd-bonus-row">
            <span class="cd-learn-ico">${iconSvg("gift")}</span>
            <span>${escapeHtml(b.title)}</span>
            ${b.note ? `<em>${escapeHtml(b.note)}</em>` : ""}
          </div>`).join("")}
        </div>` : ""}

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
              <span>By <a href="${instructorHref(c.instructor)}">${escapeHtml(c.instructor)}</a></span>
              <span>${c.hours} hrs</span>
            </p>
          </div>
          <div class="cd-about-body">
            <p class="cd-about-text">${courseAbout(c)}</p>
          </div>
          <button type="button" class="cd-more" id="cdMore">See more</button>
        </section>

        ${liveRooms.length ? `<section class="cd-card cd-community-card cd-community ${owned ? "is-open" : "is-locked"}" id="courseCommunity">
          <div class="cd-ov-head">
            <h2>Community</h2>
            <p class="cd-ov-meta">
              ${owned ? `<span class="cd-comm-open">Members only</span>` : `<span class="cd-lock-badge">${iconSvg("lock")} Locked</span>`}
            </p>
          </div>
          <div id="courseCommInner">${courseCommunityBodyHTML(c, owned)}</div>
          ${owned ? "" : `<button type="button" class="cd-comm-cta locked" id="commLockedBtn">
            <span class="cd-lock-on" aria-hidden="true">${iconSvg("lock")}</span>
            Community
          </button>`}
        </section>` : ""}
        ${itemReviewsBlockHTML("course", c.id)}
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
  bindOverviewExtras(box);
  if (typeof bindWbMotion === "function") bindWbMotion(box);
}

function courseThumbHTML(c) {
  const banner = courseBannerOf(c);
  if (banner) {
    return `<div class="thumb has-banner">
      <img class="thumb-banner" src="${escapeHtml(banner)}" alt="">
      <span class="brand-badge" aria-hidden="true">${brandMarkSVG()}</span>
    </div>`;
  }
  const art = COVERS[c.cover] || { bg: "linear-gradient(135deg,#4f46e5,#1e1b4b)", title: c.title };
  const photo = photoFor(c.instructor);
  return `<div class="thumb" style="background:${art.bg}">
    <img class="person" src="${photo}" alt="">
    <div class="cover-copy"><h3>${art.title}</h3></div>
    <span class="brand-badge" aria-hidden="true">${brandMarkSVG()}</span>
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

function bindSlideFades(root = document) {
  root.querySelectorAll(".carousel, .slide-fade").forEach((el) => {
    if (el.querySelector(".review-marquee") || el.classList.contains("slide-fade-always")) return;
    const track = el.querySelector(".track, .ld-rec") || el;
    const sync = () => {
      const max = track.scrollWidth - track.clientWidth - 4;
      el.classList.toggle("is-start", track.scrollLeft <= 4);
      el.classList.toggle("is-end", max <= 0 || track.scrollLeft >= max);
    };
    if (el.dataset.fadeBound) {
      sync();
      return;
    }
    el.dataset.fadeBound = "1";
    track.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    requestAnimationFrame(sync);
  });
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
  const mineMentors = myMentorships(user.email);
  const nextMentor = mineMentors.filter((p) => mentorPhase(p) !== "ended")[0] || null;
  const sessionCards = [];
  if (nextLive) {
    sessionCards.push(`<article class="ld-sess ld-sess-web">
        <i class="ld-sess-sheen" aria-hidden="true"></i>
        <div class="ld-sess-copy">
          <div class="ld-sess-meta"><span class="ld-live-pill"><b></b> Live webinar</span></div>
          <h3>${escapeHtml(nextLive.title)}</h3>
          <p>by ${escapeHtml(nextLive.by)}</p>
          <small>${iconSvg("cal")} ${escapeHtml(webinarDateLabel(nextLive))} · ${escapeHtml(webinarTimeLabel(nextLive))}</small>
          ${countdownHTML(webinarStart(nextLive), "Starts in")}
          <a class="ld-sess-cta" href="${webinarHref(nextLive.id)}">View details ›</a>
        </div>
        <div class="ld-sess-photo"><img src="${photoFor(nextLive.by)}" alt=""></div>
      </article>`);
  }
  if (nextMentor) {
    sessionCards.push(`<article class="ld-sess ld-sess-ment">
        <div class="ld-sess-copy">
          <div class="ld-sess-meta">
            <span class="ld-desk-pill">1:1 Mentorship</span>
            <em class="ld-uplive-cd">${mentorPhase(nextMentor) === "upcoming" ? "Upcoming desk" : "Ongoing desk"}</em>
          </div>
          <h3>${escapeHtml(nextMentor.title)}</h3>
          <p>by ${escapeHtml(nextMentor.by)}</p>
          <small>${iconSvg("cal")} ${escapeHtml(webinarDateLabel(nextMentor))} · ${escapeHtml(String(nextMentor.weeks || ""))} weeks</small>
          <a class="ld-sess-cta" href="${mentorHref(nextMentor.id)}">Open program ›</a>
        </div>
        <div class="ld-sess-photo"><img src="${photoFor(nextMentor.by)}" alt=""></div>
      </article>`);
  }
  const sessionsHTML = sessionCards.join("") || `<article class="ld-sess ld-sess-empty">
        <div class="ld-sess-copy">
          <div class="ld-sess-meta"><span class="ld-desk-pill">Live desk</span></div>
          <h3>No live session on your book</h3>
          <p>Register for a webinar or join a mentorship desk.</p>
          <a class="ld-sess-cta" href="/live">Browse live ›</a>
        </div>
      </article>`;
  const promoHTML = `<div class="ld-promo">
          <div class="ld-promo-top">
            <span class="ld-promo-kicker">This week</span>
            <h3>Live rooms and 1:1 desks</h3>
            <p>Sit with a working trader. Process and risk — not a tip feed.</p>
          </div>
          <div class="ld-promo-pills" aria-hidden="true"><em>Webinar</em><em>1:1 desk</em><em>Live room</em></div>
          <a class="btn btn-primary" href="/live">Join live</a>
        </div>`;
  const upLiveHTML = `<div class="ld-uplive">
      <h2>Your upcoming live sessions</h2>
      ${sessionsHTML}
    </div>`;
  const continueHTML = cont
    ? `<a class="ld-resume" href="/course?id=${encodeURIComponent(cont.c.id)}&lesson=${cont.resume.i}">
        <div class="ld-shot">${courseThumbHTML(cont.c)}<span class="ld-mark" aria-hidden="true">${brandMarkSVG()}</span><span class="ld-play"><i><svg viewBox="0 0 10 10"><path d="M2 1.2v7.6L8.5 5Z"/></svg></i> Continue learning</span></div>
        <h3>${escapeHtml(cont.c.title)}</h3>
        <div class="ld-from">Resume from: ${escapeHtml(cont.resume.lesson?.t || "Lesson 1")}</div>
        <div class="ld-meter"><div class="ld-track"><i style="width:${cont.stats.pct}%"></i></div><b>${cont.stats.pct}% · ${timeLeftLabel(cont.c, cont.stats.pct)}</b></div>
      </a>`
    : `<div class="ld-resume ld-resume-empty">
        <div class="ld-shot ld-shot-empty"><span class="ld-play"><i><svg viewBox="0 0 10 10"><path d="M2 1.2v7.6L8.5 5Z"/></svg></i> Start learning</span></div>
        <h3>No classroom yet</h3>
        <div class="ld-from">Pick a course and it will sit here to resume.</div>
        <a class="ld-ghost" href="/courses">Browse courses ›</a>
      </div>`;
  root.innerHTML = `<div class="ld ld-home">
    <div class="ld-welcome">
      <h1>Welcome back, ${escapeHtml(user.name)} 👋</h1>
      <p>Continue where you left off.</p>
    </div>
    <div class="ld-continue">${continueHTML}</div>
    ${dashboardPathNudgeHTML(user)}
    <div class="ld-split ld-home-split">
      <div class="ld-main">
        ${upLiveHTML}
        <div class="ld-row-h"><h2>Recommended courses for you</h2><a href="/courses">View All ›</a></div>
        <div class="slide-fade"><div class="ld-rec">${rec.map((c) => courseCard(c, "grid-card")).join("") || `<p class="muted">You already own the library.</p>`}</div></div>
        ${faqSectionHTML(FAQ_SETS.dashboard)}
      </div>
      <aside class="ld-side">
        ${promoHTML}
        <div class="ld-quick">
          <h3>Quick Actions</h3>
          <a href="/learning" style="--i:1"><span class="ld-q-ico">${iconSvg("play")}</span><span>My Learning</span><i>›</i></a>
          <a href="/learning#certs" style="--i:2"><span class="ld-q-ico">${iconSvg("badge")}</span><span>My Certificates</span><i>›</i></a>
          <a href="/live" style="--i:3"><span class="ld-q-ico">${iconSvg("wifi")}</span><span>Live rooms</span><i>›</i></a>
          <a href="/mentorship" style="--i:4"><span class="ld-q-ico">${iconSvg("users")}</span><span>1:1 desk</span><i>›</i></a>
        </div>
      </aside>
    </div>
  </div>`;
  startWbCountdown(root);
  bindWbMotion(root);
  bindFaqs(root);
  bindSlideFades(root);
  bindCourseNudge(root);
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
    <div class="ld-rev">
      <div class="ld-row-h"><h2>Experiences shared by learners</h2><a href="/reviews">Read all ›</a></div>
    </div>
    <div class="slide-fade ld-rev-fade"><div class="review-marquee" id="learnReviews"></div></div>
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
  paintReviewMarquee(document.getElementById("learnReviews"), true);
  bindSlideFades(root);
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
  if (typeof isWebinarHost === "function" && isWebinarHost(w)) {
    if (w.status === "ended") return `<span class="muted" style="display:block;margin:8px 14px 14px">This webinar has ended.</span>`;
    if (w.status === "live") return `<a class="btn btn-primary" style="margin:8px 14px 14px" href="${webinarHostRoomHref(w.id)}">Enter as host</a>`;
    return `<button class="btn btn-primary" style="margin:8px 14px 14px" data-wb-host-start="${w.id}">Start webinar</button>`;
  }
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
  const webinars = (typeof listedWebinars === "function" ? listedWebinars() : allWebinars().filter((w) => liveKindOf(w) === "webinar"));
  const classes = allWebinars().filter((w) => liveKindOf(w) === "class" && !w.unpublished);
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
  if (typeof isWebinarHost === "function" && isWebinarHost(w)) {
    if (w.status === "ended") {
      return w.recordUrl
        ? `<a class="btn btn-primary wb-cta" href="${escapeHtml(w.recordUrl)}" target="_blank" rel="noopener">Watch recording</a>`
        : `<span class="btn btn-ghost wb-cta is-off">This webinar has ended</span>`;
    }
    if (w.status === "live") {
      return `<a class="btn btn-primary wb-cta" href="${webinarHostRoomHref(w.id)}">Enter as host ›</a>
        <button type="button" class="btn btn-ghost wb-cta" data-wb-host-end="${w.id}">End webinar</button>`;
    }
    return `<button type="button" class="btn btn-primary wb-cta" data-wb-host-start="${w.id}">Start webinar ›</button>
      <a class="btn btn-ghost wb-cta" href="${webinarHostRoomHref(w.id)}">Open room</a>`;
  }
  if (w.status === "ended") {
    return w.recordUrl
      ? `<a class="btn btn-primary wb-cta" href="${escapeHtml(w.recordUrl)}" target="_blank" rel="noopener">Watch recording</a>`
      : `<span class="btn btn-ghost wb-cta is-off">This webinar has ended</span>`;
  }
  if (registered) {
    const join = `<a class="btn btn-primary wb-cta" href="/live-room?id=${encodeURIComponent(w.id)}">Join Now ›</a>`;
    const rooms = typeof webinarLiveRooms === "function" ? webinarLiveRooms(w) : [];
    const comm = rooms.length
      ? `<a class="btn btn-ghost wb-cta wb-wa" href="${escapeHtml(webinarCommunityUrl(w))}" target="_blank" rel="noopener">${iconSvg("wa")} Join community</a>`
      : "";
    return `${join}${comm}`;
  }
  return `<button type="button" class="btn btn-primary wb-cta" data-register="${w.id}">Enroll Now ›</button>`;
}

function renderWebinarPage() {
  const root = document.getElementById("webinarRoot");
  if (!root) return;
  const id = new URLSearchParams(location.search).get("id");
  const preview = typeof staffWebinarPreview === "function" ? staffWebinarPreview() : "";
  if (!id && !preview) return;
  const list = typeof webinarCatalogAll === "function" ? webinarCatalogAll() : allWebinars().filter((x) => x.kind !== "class");
  const w = (id && list.find((x) => x.id === id))
    || (preview ? list.find((x) => !x.unpublished) || list[0] : null);
  if (!w || (w.unpublished && !preview && !isWebinarRegistered(w.id))) {
    root.innerHTML = `<div class="container"><div class="empty"><h3>Webinar not found</h3><a class="btn btn-primary" href="/live" style="margin-top:12px">All webinars</a></div></div>`;
    return;
  }
  const meta = webinarProfile(w);
  const user = getUser();
  const regs = readList(REGS_KEY).filter((r) => r.id === w.id);
  const registered = typeof webinarOwnedForPage === "function" ? webinarOwnedForPage(w) : isWebinarRegistered(w.id);
  const liveRooms = typeof webinarLiveRooms === "function" ? webinarLiveRooms(w) : [];
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
          ${webinarOverviewCardHTML(w)}
          ${liveRooms.length ? `<section class="cd-card cd-community-card cd-community ${registered ? "is-open" : "is-locked"}" id="deskRooms">
            <div class="cd-ov-head">
              <h2>Community</h2>
              <p class="cd-ov-meta">${registered ? `<span class="cd-comm-open">Members only</span>` : `<span class="cd-lock-badge">${iconSvg("lock")} Locked</span>`}</p>
            </div>
            ${deskRoomsGridHTML(registered, "Enroll to open " + liveRooms.map((r) => r.label).join(", ") + ".", typeof webinarRoomsOf === "function" ? webinarRoomsOf(w.id) : null)}
          </section>` : ""}
          ${itemReviewsBlockHTML("webinar", w.id)}
          ${w.status === "ended" ? pathNudgeHTML(w.title, "webinar", w.id, "live-end") : ""}
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
  bindOverviewExtras(root);
  root.querySelectorAll(".wb-split .cd-sec-h").forEach((btn) => {
    btn.addEventListener("click", () => {
      const sec = btn.parentElement;
      const open = !sec.classList.contains("open");
      sec.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });
  root.querySelectorAll("[data-mp-lesson]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (w.status === "ended" && w.recordUrl) {
        location.href = w.recordUrl;
        return;
      }
      location.href = "/live-room?id=" + encodeURIComponent(w.id);
    });
  });
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
  const isHost = typeof isWebinarHost === "function" ? isWebinarHost(session) : (staff && staff.email === session.hostEmail);
  const regs = readList(REGS_KEY).filter((r) => r.id === session.id);
  const registered = user && regs.some((r) => r.email === user.email);
  document.title = `${session.title} | Live | ${BRAND}`;
  const live = allWebinars().find((w) => w.id === id);
  const noun = liveKindOf(live) === "class" ? "class" : "webinar";
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
            ${live.status === "scheduled" ? `<button class="btn btn-primary" id="startLiveBtn">Start ${noun}</button>` : ""}
            ${live.status !== "ended" && live.status !== "scheduled" ? `<button class="btn btn-primary" id="endLiveBtn">End ${noun}</button>` : ""}
            <a class="btn btn-ghost" href="/admin#webinar/${encodeURIComponent(live.id)}/session">Back to webinar</a>
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
    </div>
    ${live.status === "ended" ? pathNudgeHTML(live.title, "webinar", live.id, "live-end") : ""}
    ${itemReviewsBlockHTML("webinar", live.id)}`;

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
    const staffNow = getStaffSession();
    const patch = { status: "live" };
    if (staffNow?.email && !live.hostEmail) patch.hostEmail = staffNow.email;
    updateLive(id, patch);
    toast(noun === "class" ? "Class is live · registered students can join now" : "Webinar is live · enrolled students can join now");
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
    toast(noun === "class" ? "Class ended · everyone is kicked from the room" : "Webinar ended · everyone is out of the room");
    renderLiveRoom();
  });
  bindOverviewExtras(root);
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
  window.BizgarhLoader?.done?.();
  syncNotesFromAccount();
  paintNoteBell(false);
  applySignupGate();
  const bootQ = new URLSearchParams(location.search);
  if (bootQ.get("oauth_ticket") || bootQ.get("oauth_error")) await consumeOAuth();
  else restoreOAuthSession();
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
  const trustRow = document.querySelector(".trust-row");
  if (trustRow) {
    const runTrust = () => {
      trustRow.classList.add("is-in");
      if (reduceMotion) return;
      trustRow.querySelectorAll("[data-trust-n]").forEach((el) => {
        const target = parseFloat(el.dataset.trustN);
        const suffix = el.dataset.suffix || "";
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - start) / 1400);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(target * eased).toLocaleString("en-IN") + suffix;
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    };
    if ("IntersectionObserver" in window) {
      const tio = new IntersectionObserver((entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        runTrust();
        tio.disconnect();
      }, { threshold: 0.35 });
      tio.observe(trustRow);
    } else runTrust();
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
  bindSlideFades(document);

  try {
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
    renderInstructorListing();
    renderInstructorPage();
    renderLiveRoom();
    renderCommunityPage();
    renderCertificatePage();
    mountStaticFaqs();
    bindHelpFaqSearch();
  } finally {
    window.BizgarhLoader?.done?.();
  }

  document.body.addEventListener("click", (e) => {
    const hostStart = e.target.closest("[data-wb-host-start]");
    if (hostStart) {
      startWebinarAsHost(hostStart.dataset.wbHostStart);
      return;
    }
    const hostEnd = e.target.closest("[data-wb-host-end]");
    if (hostEnd) {
      endWebinarAsHost(hostEnd.dataset.wbHostEnd).then(() => {
        if (document.getElementById("webinarRoot")) renderWebinarPage();
        if (document.getElementById("liveRoom")) renderLiveRoom();
        if (document.getElementById("liveCatalog")) renderLive();
      });
      return;
    }
    const reg = e.target.closest("[data-register]");
    if (reg) registerForWebinar(reg.dataset.register);
    const men = e.target.closest("[data-mentor-enroll]");
    if (men) enrollMentorProgram(men.dataset.mentorEnroll);
    const call = e.target.closest("[data-mentor-call]");
    if (call) requestMentorCallback(call.dataset.mentorCall);
    const icall = e.target.closest("[data-instructor-call]");
    if (icall) requestInstructorCallback(icall.dataset.instructorCall);
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
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cert-download]");
    if (!btn) return;
    const u = getUser();
    const course = allCourses().find((c) => c.id === btn.dataset.certDownload);
    const row = u && course && typeof certFor === "function" ? certFor(u.email, course.id) : null;
    if (row && course) downloadBizgarhCertificate(row, course);
  });
  window.BizgarhLoader?.done?.();
});
