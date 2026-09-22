const Ad = {
  route: "dashboard",
  range: "30d",
  q: "",
  page: 1,
  per: 20,
  drawer: null,
  courseId: "",
  courseTab: "",
  mentorId: "",
  mentorTab: "",
  webinarId: "",
  webinarTab: ""
};

const NAV = [
  { group: "Overview", items: [
    { id: "dashboard", label: "Dashboard" },
    { id: "analytics", label: "Analytics", mod: "analytics", act: "view" }
  ]},
  { group: "Users", items: [
    { id: "students", label: "Students", mod: "students", act: "view" },
    { id: "leads", label: "Leads", mod: "leads", act: "view" }
  ]},
  { group: "Sub-admins / Creators", items: [
    { id: "staff", label: "Admins", mod: "staff", act: "view", owner: true },
    { id: "performance", label: "Creator Performance", mod: "creator", act: "view" },
    { id: "referrals", label: "Referrals", mod: "creator", act: "view" },
    { id: "commissions", label: "Commissions", mod: "commission", act: "view" },
    { id: "payouts", label: "Payouts", mod: "payouts", act: "view" }
  ]},
  { group: "Courses", items: [
    { id: "courses", label: "Course", mod: "courses", act: "view" },
    { id: "nextpath", label: "Next path", mod: "courses", act: "edit" },
    { id: "mentors", label: "Mentorships", mod: "courses", act: "view" },
    { id: "webinars", label: "Webinars", mod: "live", act: "view" },
    { id: "enrolls", label: "Enrollments", mod: "enrollments", act: "view" },
    { id: "classroom", label: "Classroom LMS", mod: "classroom", act: "view" },
    { id: "live", label: "Live sessions", mod: "live", act: "view" }
  ]},
  { group: "Sales", items: [
    { id: "orders", label: "Orders", mod: "orders", act: "view" },
    { id: "payments", label: "Payments", mod: "payments", act: "view" },
    { id: "refunds", label: "Refunds", mod: "refunds", act: "view" },
    { id: "coupons", label: "Coupons / Offers", mod: "coupons", act: "view" }
  ]},
  { group: "Ops", items: [
    { id: "support", label: "Support", mod: "support", act: "view" },
    { id: "notifs", label: "Notifications", mod: "notifications", act: "view" },
    { id: "community", label: "Community", mod: "community", act: "view" },
    { id: "reviews", label: "Reviews", mod: "community", act: "view" }
  ]},
  { group: "Security", items: [
    { id: "sessions", label: "Sessions", mod: "security", act: "view" },
    { id: "audit", label: "Audit logs", mod: "security", act: "view" },
    { id: "settings", label: "Settings", mod: "settings", act: "view", owner: true },
    { id: "footer", label: "Footer links", owner: true }
  ]}
];

function adEsc(s) { return escapeHtml(String(s ?? "")); }
function deskFaceHTML(name, photo) {
  const src = photo || (typeof photoFor === "function" ? photoFor(name) : "");
  if (src) return `<img class="desk-face" src="${adEsc(src)}" alt="">`;
  return `<span class="desk-face desk-face-fallback">${adEsc(String(name || "H").slice(0, 1))}</span>`;
}
function deskHostOf(email, name) {
  return typeof AdminCore.hostProfile === "function"
    ? AdminCore.hostProfile(email, name)
    : { name: name || "Host", email: email || "", photo: typeof photoFor === "function" ? photoFor(name) : "", bio: "" };
}
function deskHostLockHTML(host, opts) {
  const o = opts || {};
  const field = o.field || "by";
  const owner = typeof AdminCore.isOwner === "function" && AdminCore.isOwner();
  const staff = owner && typeof staffList === "function"
    ? staffList().map((x) => AdminCore.normalizeStaff(x)).filter((s) => s.status === "active")
    : [];
  const pick = owner && staff.length
    ? `<label class="desk-host-assign">Assign this meeting to
        <select name="hostEmail">
          ${staff.map((s) => `<option value="${adEsc(s.email)}" ${s.email === host.email ? "selected" : ""}>${adEsc(s.name)} · ${adEsc(s.email)}</option>`).join("")}
        </select>
      </label>`
    : `<input type="hidden" name="hostEmail" value="${adEsc(host.email)}">`;
  return `<aside class="desk-host-lock">
    ${deskFaceHTML(host.name, host.photo)}
    <div>
      <small>Meeting host</small>
      <strong>${adEsc(host.name)}</strong>
      <span>${adEsc(host.email || "Filled from this login")}</span>
    </div>
    <p>Name and photo fill from the sub-admin profile. Students see the same host in the room — no extra form.</p>
    <input type="hidden" name="${adEsc(field)}" value="${adEsc(host.name)}">
    ${pick}
  </aside>`;
}
function deskMetaHTML(items) {
  return `<ul class="desk-meta">${items.filter(Boolean).map((x) => `<li>${x}</li>`).join("")}</ul>`;
}
function splitFaceList(value) {
  return String(value || "").split(",").map((x) => x.trim()).filter(Boolean);
}
function instructorFaceFieldsHTML(pack, mode) {
  const p = pack || {};
  const pillars = Array.isArray(p.pillars) ? p.pillars.slice(0, 4) : [];
  while (pillars.length < 4) pillars.push({ t: "", d: "" });
  const langs = Array.isArray(p.languages) ? p.languages.join(", ") : (p.languages || "Hindi, English");
  const tags = Array.isArray(p.tags) ? p.tags.join(", ") : (p.tags || "");
  return `
    <label>Public headline
      <input name="title" value="${adEsc(p.title || "")}" placeholder="Full-time trader, Bizgarh desk">
    </label>
    <label>Listing tag
      <input name="tag" value="${adEsc(p.tag || "")}" placeholder="Intraday">
    </label>
    <label>Languages
      <input name="languages" value="${adEsc(langs)}" placeholder="Hindi, English">
    </label>
    <label>Topic tags
      <input name="tags" value="${adEsc(tags)}" placeholder="Intraday, Nifty options, Gap & go">
    </label>
    <label>Years on the desk
      <input name="years" value="${adEsc(p.years || "")}" placeholder="12+">
    </label>
    <label>Learners taught
      <input name="learners" value="${adEsc(p.learners || "")}" placeholder="50,483">
    </label>
    ${mode === "full" ? `
    <label class="staff-create-wide">Quote on the public page
      <textarea name="quote" rows="2" placeholder="Write the invalidation before the first click.">${adEsc(p.quote || "")}</textarea>
    </label>
    <div class="staff-create-wide staff-pillars">
      <b>Teaching style — 4 points students see</b>
      ${pillars.map((row, i) => `
        <input name="pillar${i + 1}t" value="${adEsc(row.t || "")}" placeholder="Point ${i + 1} title">
        <textarea name="pillar${i + 1}d" rows="2" placeholder="Point ${i + 1} detail">${adEsc(row.d || "")}</textarea>
      `).join("")}
    </div>` : ""}
    <label class="staff-create-check"><input type="checkbox" name="topRated" value="1" ${p.topRated ? "checked" : ""}> Top rated mentor badge</label>
    <label class="staff-create-check"><input type="checkbox" name="showPublic" value="1" ${p.hidden ? "" : "checked"}> Show on the public Instructors page</label>`;
}
function staffFaceFromForm(f) {
  const langs = splitFaceList(f.languages && f.languages.value);
  const tags = splitFaceList(f.tags && f.tags.value);
  const pillars = [1, 2, 3, 4].map((i) => ({
    t: String((f["pillar" + i + "t"] && f["pillar" + i + "t"].value) || "").trim(),
    d: String((f["pillar" + i + "d"] && f["pillar" + i + "d"].value) || "").trim()
  })).filter((row) => row.t || row.d);
  return {
    title: String((f.title && f.title.value) || "").trim(),
    tag: String((f.tag && f.tag.value) || "").trim(),
    years: String((f.years && f.years.value) || "").trim(),
    learners: String((f.learners && f.learners.value) || "").trim(),
    languages: langs,
    tags,
    quote: String((f.quote && f.quote.value) || "").trim(),
    topRated: !!(f.topRated && (f.topRated.type === "checkbox" ? f.topRated.checked : f.topRated.value === "1")),
    hidden: !(f.showPublic && (f.showPublic.type === "checkbox" ? f.showPublic.checked : f.showPublic.value === "1")),
    pillars
  };
}
function syncStaffInstructor(staff, extra) {
  if (typeof applyInstructorEdit !== "function" || !staff || !staff.name) return;
  applyInstructorEdit(staff.name, {
    name: staff.name,
    email: staff.email,
    photo: staff.photo || "",
    bio: staff.bio || "",
    ...(extra || {})
  }, staff.email);
}
function adCourse(id) { return allCourses().find((c) => c.id === id); }
function adTitle(id) { return adCourse(id)?.title || id || "—"; }
function kpiRange() {
  if (Ad.range === "custom" || (Ad.range && Ad.range.from)) {
    return { from: Ad.customFrom, to: Ad.customTo };
  }
  return Ad.range;
}
function badge(status) {
  const s = String(status || "").toUpperCase();
  const cls = ["PAID", "SUCCESS", "ACTIVE", "APPROVED", "RESOLVED", "CONVERTED"].includes(s) ? "ok"
    : ["PENDING", "FOLLOW-UP", "OPEN", "INTERESTED"].includes(s) ? "warn"
    : ["REFUNDED", "FAILED", "REVERSED", "SUSPENDED", "LOST"].includes(s) ? "bad" : "muted";
  return `<span class="ad-badge ${cls}">${adEsc(s || "—")}</span>`;
}
function lineChart(values, color) {
  const w = 520, h = 160, p = 8;
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => {
    const x = p + (i / Math.max(values.length - 1, 1)) * (w - p * 2);
    const y = h - p - (v / max) * (h - p * 2);
    return `${x},${y}`;
  });
  return `<svg viewBox="0 0 ${w} ${h}" class="chart-svg" preserveAspectRatio="none">
    <polyline points="${p},${h - p} ${pts.join(" ")} ${w - p},${h - p}" fill="${color}22" stroke="none"></polyline>
    <polyline points="${pts.join(" ")}" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round"></polyline>
  </svg>`;
}
function barRows(items) {
  const max = Math.max(...items.map((x) => x.v), 1);
  return items.map((x) => `<div class="bar-row"><span>${adEsc(x.label)}</span><div class="bar-track"><i style="width:${Math.max(6,(x.v/max)*100)}%"></i></div><b>${x.display}</b></div>`).join("") || `<p class="ad-empty">No data.</p>`;
}
function pager(n) {
  const pages = Math.max(1, Math.ceil(n / Ad.per));
  if (Ad.page > pages) Ad.page = 1;
  return `<div class="ad-pager">
    <button class="btn btn-ghost" data-page="${Math.max(1, Ad.page - 1)}">Prev</button>
    <span class="muted">${Ad.page} / ${pages}</span>
    <button class="btn btn-ghost" data-page="${Math.min(pages, Ad.page + 1)}">Next</button>
  </div>`;
}
function slice(rows) { return rows.slice((Ad.page - 1) * Ad.per, Ad.page * Ad.per); }
function searchRows(rows, keys) {
  const q = Ad.q.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((r) => keys.some((k) => String(r[k] || "").toLowerCase().includes(q)));
}
function rangeBar() {
  const opts = [["today","Today"],["7d","7 Days"],["30d","30 Days"],["90d","3 Months"],["180d","6 Months"],["365d","1 Year"],["custom","Custom"]];
  const custom = Ad.range === "custom" || (Ad.range && Ad.range.from);
  const from = Ad.customFrom || "";
  const to = Ad.customTo || "";
  return `<div class="ad-range">${opts.map(([k,l]) => `<button type="button" data-range="${k}" class="${(Ad.range===k || (k==="custom"&&custom))?"on":""}">${l}</button>`).join("")}
    ${custom ? `<span class="ad-custom"><input type="date" data-custom-from value="${adEsc(from)}"><input type="date" data-custom-to value="${adEsc(to)}"><button type="button" class="btn btn-ghost" data-apply-custom>Apply</button></span>` : ""}</div>`;
}
function toolbar(placeholder, exportMod) {
  const exp = exportMod && AdminCore.can(exportMod, "export") ? `<button class="btn btn-ghost" data-export="${exportMod}">Export</button>` : "";
  return `<div class="ad-toolbar"><input id="adSearch" placeholder="${placeholder}" value="${adEsc(Ad.q)}">${exp}${rangeBar()}</div>`;
}
function table(headers, htmlRows, empty) {
  if (!htmlRows.length) return `<p class="ad-empty">${empty || "No records."}</p>`;
  return `<div class="ad-table-wrap"><table class="ad-table"><thead><tr>${headers.map((h)=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${htmlRows.join("")}</tbody></table></div>`;
}

function navLabel(it) {
  if (AdminCore.isOwner()) return it.label;
  const map = {
    students: "My Students",
    leads: "My Leads",
    orders: "My Sales",
    enrolls: "My Enrollments",
    performance: "Performance",
    referrals: "Referral Link",
    commissions: "Commission",
    payouts: "Payouts"
  };
  return map[it.id] || it.label;
}

function visibleNav() {
  const s = AdminCore.session();
  return NAV.map((g) => ({
    ...g,
    items: g.items.filter((it) => {
      if (it.owner && !AdminCore.isOwner()) return false;
      if (it.id === "dashboard") return true;
      if (it.id === "performance" || it.id === "referrals" || it.id === "commissions" || it.id === "payouts") {
        return AdminCore.can(it.mod, it.act) && (AdminCore.isOwner() || s?.creatorEnabled);
      }
      return AdminCore.can(it.mod, it.act);
    }).map((it) => ({ ...it, label: navLabel(it) }))
  })).filter((g) => g.items.length);
}

function mapCourseTab(tab) {
  if (tab === "syllabus" || tab === "lessons") return "lessons";
  if (tab === "landing" || tab === "page") return "page";
  if (tab === "setup" || tab === "live" || tab === "students" || tab === "community" || tab === "reviews" || tab === "next") return tab;
  return "";
}
function mapMentorTab(tab) {
  if (tab === "lessons" || tab === "sessions") return "sessions";
  if (tab === "landing" || tab === "page") return "page";
  if (tab === "setup" || tab === "live" || tab === "students" || tab === "community" || tab === "reviews" || tab === "next") return tab;
  return "";
}
function mapWebinarTab(tab) {
  if (tab === "lessons" || tab === "sessions" || tab === "session") return "session";
  if (tab === "landing" || tab === "page") return "page";
  if (tab === "setup" || tab === "live" || tab === "students" || tab === "community" || tab === "reviews" || tab === "next") return tab;
  return "";
}
function parseAdminRoute(hash) {
  const raw = String(hash || location.hash || "#dashboard").replace(/^#/, "");
  const parts = raw.split("/").filter(Boolean);
  if (parts[0] === "course" && parts[1]) {
    return { route: "courseBuilder", courseId: decodeURIComponent(parts[1]), tab: mapCourseTab(parts[2] || "") };
  }
  if (parts[0] === "course") return { route: "courses", courseId: "", tab: "" };
  if (parts[0] === "mentor" && parts[1]) {
    return { route: "mentorBuilder", mentorId: decodeURIComponent(parts[1]), tab: mapMentorTab(parts[2] || "") };
  }
  if (parts[0] === "mentor") return { route: "mentors", mentorId: "", tab: "" };
  if (parts[0] === "webinar" && parts[1]) {
    return { route: "webinarBuilder", webinarId: decodeURIComponent(parts[1]), tab: mapWebinarTab(parts[2] || "") };
  }
  if (parts[0] === "webinar") return { route: "webinars", webinarId: "", tab: "" };
  return { route: VIEWS[raw] ? raw : "dashboard", courseId: "", tab: "" };
}
function applyAdminRoute(parsed) {
  Ad.route = parsed.route;
  Ad.courseId = parsed.courseId || "";
  Ad.courseTab = parsed.route === "courseBuilder" ? (parsed.tab || "") : "";
  Ad.mentorId = parsed.mentorId || "";
  Ad.mentorTab = parsed.route === "mentorBuilder" ? (parsed.tab || "") : "";
  Ad.webinarId = parsed.webinarId || "";
  Ad.webinarTab = parsed.route === "webinarBuilder" ? (parsed.tab || "") : "";
}

function renderSide() {
  let s = null;
  try { s = AdminCore.session(); } catch (_) { s = null; }
  if (!s) {
    try { s = JSON.parse(localStorage.getItem("tradeshalaStaffSession") || "null"); } catch (_) { s = null; }
  }
  if (!s) s = { name: "Owner", email: "admin@bizgarh.in", role: "owner" };
  if (Ad.route === "courseBuilder" && Ad.courseId && typeof CourseAdmin !== "undefined") {
    const c = CourseAdmin.byId(Ad.courseId);
    if (c) {
      document.getElementById("adminSide").innerHTML = CourseAdmin.sideHTML(c);
      return;
    }
  }
  if (Ad.route === "mentorBuilder" && Ad.mentorId && typeof MentorAdmin !== "undefined") {
    const p = MentorAdmin.byId(Ad.mentorId);
    if (p) {
      document.getElementById("adminSide").innerHTML = MentorAdmin.sideHTML(p);
      return;
    }
  }
  if (Ad.route === "webinarBuilder" && Ad.webinarId && typeof WebinarAdmin !== "undefined") {
    const w = WebinarAdmin.byId(Ad.webinarId);
    if (w) {
      document.getElementById("adminSide").innerHTML = WebinarAdmin.sideHTML(w);
      return;
    }
  }
  document.getElementById("adminSide").innerHTML = `
    <a class="ad-brand" href="/">${typeof brandLogoHTML === "function" ? brandLogoHTML("ad") : "Bizgarh"}</a>
    <div class="ad-who">${adEsc(s.name)}<br>${AdminCore.isSuperAdmin() ? "Super Admin" : (AdminCore.isOwner() ? "Owner" : (s.creatorEnabled ? "Admin · Creator" : "Admin"))}</div>
    <nav class="ad-nav">${visibleNav().map((g) => `
      <div class="ad-nav-label">${g.group}</div>
      ${g.items.map((it) => `<button type="button" data-route="${it.id}" class="${Ad.route===it.id || (it.id==="courses" && Ad.route==="courseBuilder") || (it.id==="mentors" && Ad.route==="mentorBuilder") || (it.id==="webinars" && Ad.route==="webinarBuilder")?"on":""}">${it.label}</button>`).join("")}
    `).join("")}</nav>
    <div class="ad-side-foot">
      <button type="button" id="staffLogout">Logout</button>
      <a href="/">← Public site</a>
    </div>`;
}

function setAdminNav(open) {
  const app = document.getElementById("adminApp");
  if (!app) return;
  app.classList.toggle("nav-open", !!open);
  document.body.classList.toggle("ad-nav-lock", !!open);
}
function closeAdminNav() { setAdminNav(false); }

function go(route, extra) {
  closeAdminNav();
  Ad.page = 1;
  Ad.q = "";
  Ad.drawer = null;
  if (route === "courseBuilder" && extra?.courseId) {
    Ad.route = "courseBuilder";
    Ad.courseId = extra.courseId;
    Ad.courseTab = extra.tab || "setup";
    Ad.mentorId = "";
    Ad.mentorTab = "";
    Ad.webinarId = "";
    Ad.webinarTab = "";
    location.hash = "course/" + encodeURIComponent(extra.courseId) + "/" + Ad.courseTab;
    paint();
    return;
  }
  if (route === "mentorBuilder" && extra?.mentorId) {
    Ad.route = "mentorBuilder";
    Ad.mentorId = extra.mentorId;
    Ad.mentorTab = extra.tab || "setup";
    Ad.courseId = "";
    Ad.courseTab = "";
    Ad.webinarId = "";
    Ad.webinarTab = "";
    location.hash = "mentor/" + encodeURIComponent(extra.mentorId) + "/" + Ad.mentorTab;
    paint();
    return;
  }
  if (route === "webinarBuilder" && extra?.webinarId) {
    Ad.route = "webinarBuilder";
    Ad.webinarId = extra.webinarId;
    Ad.webinarTab = extra.tab || "setup";
    Ad.courseId = "";
    Ad.courseTab = "";
    Ad.mentorId = "";
    Ad.mentorTab = "";
    location.hash = "webinar/" + encodeURIComponent(extra.webinarId) + "/" + Ad.webinarTab;
    paint();
    return;
  }
  Ad.courseId = "";
  Ad.courseTab = "";
  Ad.mentorId = "";
  Ad.mentorTab = "";
  Ad.webinarId = "";
  Ad.webinarTab = "";
  Ad.route = route;
  location.hash = route;
  paint();
}

function paint() {
  let s = null;
  try { s = AdminCore.session(); } catch (_) { s = null; }
  if (!s) {
    try { s = JSON.parse(localStorage.getItem("tradeshalaStaffSession") || "null"); } catch (_) { s = null; }
  }
  if (!s) {
    const view = document.getElementById("adminView");
    if (view) view.innerHTML = `<div class="ad-card"><h3>Sign in again</h3><p class="muted">The desk could not restore this session.</p></div>`;
    return;
  }
  document.getElementById("adminPill").textContent = AdminCore.isSuperAdmin() ? "Super Admin" : (AdminCore.isOwner() ? "Owner" : "Admin");
  const titles = {
    dashboard: ["Dashboard", "Numbers, rooms, and what needs you"],
    students: ["Students", "Accounts, enrollments, attribution"],
    leads: ["Leads", "CRM pipeline"],
    staff: ["Sub-admins", "Each sub-admin is the meeting host. Profile fills automatically."],
    performance: ["Creator performance", "Referral and sales"],
    referrals: ["Referrals", "Clicks, signups, attributed sales"],
    commissions: ["Commission ledger", "Pending → paid"],
    payouts: ["Payouts", "Approval workflow"],
    courses: ["Courses", "Edit a classroom or start a new draft."],
    courseBuilder: ["Course", "Details, page, lessons, then go live"],
    nextpath: ["Next path", "After this classroom / webinar / desk, open that one"],
    mentors: ["Mentorships", "Host a live session from the list, or open a desk to edit."],
    mentorBuilder: ["Mentorship", "Details, page, sessions, then go live"],
    webinars: ["Webinars", "Start the room from here. Host name fills from the sub-admin."],
    webinarBuilder: ["Webinar", "Details, page, session, then go live"],
    enrolls: ["Enrollments", "Access granted on the public site"],
    classroom: ["Classroom LMS", "Quizzes, assignments, certificates"],
    live: ["Live classes", "Live classes and 1:1 rooms"],
    orders: ["Orders", "Paid enrollments"],
    payments: ["Payments", "No card numbers stored"],
    refunds: ["Refunds", "Reverses access and commission"],
    coupons: ["Coupons", "Offers on checkout"],
    support: ["Support", "Tickets"],
    notifs: ["Notifications", "In-app announcements"],
    community: ["Community", "WhatsApp, Discord, YouTube, Telegram"],
    reviews: ["Reviews", "Ratings on courses, webinars, and desks"],
    analytics: ["Analytics", "Business, courses, creators"],
    sessions: ["Sessions", "Force logout"],
    audit: ["Audit logs", "Sub-admins cannot delete"],
    settings: ["Settings", "Registration and program rules"],
    footer: ["Footer links", "Public social icons — Facebook, Instagram, YouTube, X, Telegram, LinkedIn"]
  };
  const item = NAV.flatMap((g) => g.items).find((it) => it.id === (Ad.route === "courseBuilder" ? "courses" : Ad.route === "mentorBuilder" ? "mentors" : Ad.route === "webinarBuilder" ? "webinars" : Ad.route));
  if (item?.mod && !AdminCore.can(item.mod, item.act)) {
    document.getElementById("adminTitle").textContent = "Not allowed";
    document.getElementById("adminSub").textContent = "Permission required";
    renderSide();
    document.getElementById("adminView").innerHTML = `<div class="ad-card ad-forbidden"><h3>Not allowed</h3><p class="muted">You do not have permission for this module.</p></div>`;
    return;
  }
  let t = titles[Ad.route] || ["Dashboard", ""];
  if (Ad.route === "courseBuilder") {
    t = Ad.courseTab === "setup" ? ["Details", "Name it. Pick recorded or live batch."]
      : Ad.courseTab === "lessons" ? ["Lessons", "Add videos, articles, PDFs, and live classes."]
      : Ad.courseTab === "live" ? ["Go live", "Check the list, then show this course on the site."]
      : Ad.courseTab === "students" ? ["Students", "Who bought this course, and how they are doing."]
      : Ad.courseTab === "community" ? ["Community", "WhatsApp, Discord, YouTube, Telegram — on or off."]
      : Ad.courseTab === "reviews" ? ["Reviews", "Ratings for this course only."]
      : Ad.courseTab === "next" ? ["Next", "After they finish, show this next."]
      : ["What students see", "Banner, price, story, learn list, and bonuses."];
  }
  if (Ad.route === "mentorBuilder") {
    t = Ad.mentorTab === "setup" ? ["Details", "Name the desk, mentor, start date, weeks, and seats."]
      : Ad.mentorTab === "sessions" ? ["Sessions", "Live desks and recordings. No DRM or course certificates."]
      : Ad.mentorTab === "live" ? ["Go live", "Check the list, then show this desk on the site."]
      : Ad.mentorTab === "students" ? ["Students", "Who enrolled on this desk, and seats left."]
      : Ad.mentorTab === "community" ? ["Community", "WhatsApp, Discord, YouTube, Telegram — on or off."]
      : Ad.mentorTab === "reviews" ? ["Reviews", "Ratings for this desk only."]
      : Ad.mentorTab === "next" ? ["Next", "After the batch ends, show this next."]
      : ["What students see", "Picture, price, story, learn list, and desk copy."];
  }
  if (Ad.route === "webinarBuilder") {
    t = Ad.webinarTab === "setup" ? ["Details", "Name the session, host, start time, and seats."]
      : Ad.webinarTab === "session" ? ["Session", "Notes, intro, PDF, and recording. One live room."]
      : Ad.webinarTab === "live" ? ["Go live", "Check the list, then show this webinar on the site."]
      : Ad.webinarTab === "students" ? ["Students", "Who enrolled in this webinar, and seats left."]
      : Ad.webinarTab === "community" ? ["Community", "WhatsApp, Discord, YouTube, Telegram — on or off."]
      : Ad.webinarTab === "reviews" ? ["Reviews", "Ratings for this webinar only."]
      : Ad.webinarTab === "next" ? ["Next", "After the session ends, show this next."]
      : ["What students see", "Picture, price, story, and learn list."];
  }
  document.getElementById("adminTitle").textContent = t[0];
  document.getElementById("adminSub").textContent = t[1];
  document.body.classList.toggle("is-cb", Ad.route === "courseBuilder" || Ad.route === "mentorBuilder" || Ad.route === "webinarBuilder");
  renderSide();
  if (Ad.route === "courseBuilder" && typeof CourseAdmin !== "undefined") {
    const c = CourseAdmin.byId(Ad.courseId);
    if (!c) {
      Ad.route = "courses";
      Ad.courseId = "";
      location.hash = "courses";
      document.getElementById("adminView").innerHTML = CourseAdmin.catalogHTML();
      return;
    }
    try {
      const tab = Ad.courseTab || CourseAdmin.firstTab(c);
      Ad.courseTab = tab;
      document.getElementById("adminView").innerHTML = CourseAdmin.viewHTML(c, tab);
    } catch (err) {
      document.getElementById("adminView").innerHTML = `<div class="ad-card"><p>Could not load the course builder.</p></div>`;
      console.error(err);
    }
    return;
  }
  if (Ad.route === "mentorBuilder" && typeof MentorAdmin !== "undefined") {
    const p = MentorAdmin.byId(Ad.mentorId);
    if (!p) {
      Ad.route = "mentors";
      Ad.mentorId = "";
      location.hash = "mentors";
      document.getElementById("adminView").innerHTML = MentorAdmin.catalogHTML();
      return;
    }
    try {
      const tab = Ad.mentorTab || MentorAdmin.firstTab(p);
      Ad.mentorTab = tab;
      document.getElementById("adminView").innerHTML = MentorAdmin.viewHTML(p, tab);
    } catch (err) {
      document.getElementById("adminView").innerHTML = `<div class="ad-card"><p>Could not load the mentorship builder.</p></div>`;
      console.error(err);
    }
    return;
  }
  if (Ad.route === "webinarBuilder" && typeof WebinarAdmin !== "undefined") {
    const w = WebinarAdmin.byId(Ad.webinarId);
    if (!w) {
      Ad.route = "webinars";
      Ad.webinarId = "";
      location.hash = "webinars";
      document.getElementById("adminView").innerHTML = WebinarAdmin.catalogHTML();
      return;
    }
    try {
      const tab = Ad.webinarTab || WebinarAdmin.firstTab(w);
      Ad.webinarTab = tab;
      document.getElementById("adminView").innerHTML = WebinarAdmin.viewHTML(w, tab);
    } catch (err) {
      document.getElementById("adminView").innerHTML = `<div class="ad-card"><p>Could not load the webinar builder.</p></div>`;
      console.error(err);
    }
    return;
  }
  const fn = VIEWS[Ad.route] || VIEWS.dashboard;
  try { document.getElementById("adminView").innerHTML = fn(); }
  catch (err) {
    const msg = String(err.message || "");
    document.getElementById("adminView").innerHTML = msg.startsWith("forbidden:")
      ? `<div class="ad-card ad-forbidden"><h3>Not allowed</h3><p class="muted">You do not have permission for this action.</p></div>`
      : `<div class="ad-card"><p>Could not load this module.</p></div>`;
    if (!msg.startsWith("forbidden:")) console.error(err);
  }
}

const VIEWS = {
  dashboard() {
    const k = AdminCore.kpis(kpiRange());
    const ser = AdminCore.series(typeof Ad.range === "object" ? "30d" : (Ad.range === "custom" ? "30d" : Ad.range));
    const cards = AdminCore.isOwner() ? [
      ["Total students", k.students], ["New students", k.newStudents], ["Active students", k.active],
      ["Courses", k.courses], ["Total revenue", AdminCore.inr(k.revenue)], ["Today", AdminCore.inr(k.todayRevenue)],
      ["Monthly revenue", AdminCore.inr(k.monthRevenue)], ["Orders", k.orders], ["Pending payments", k.pendingPayments],
      ["Refunds", k.refunds], ["Sub-admins", k.staff], ["Creator revenue", AdminCore.inr(k.creatorRevenue)],
      ["Pending commission", AdminCore.inr(k.pendingCommission)], ["Pending payouts", AdminCore.inr(k.pendingPayouts)],
      ["Open tickets", k.tickets]
    ] : [
      ["My students", k.students], ["My sales", k.orders], ["Revenue generated", AdminCore.inr(k.revenue)],
      ["Commission pending", AdminCore.inr(k.pendingCommission)], ["Open tickets", k.tickets]
    ];
    const s = AdminCore.session();
    const code = s.referralCode || "";
    const link = `${location.origin}/?ref=${adEsc(code)}`;
    const follows = AdminCore.scope.leads(AdminCore.leads()).filter((l) => l.followUp && ["NEW","CONTACTED","INTERESTED","FOLLOW-UP"].includes(l.status));
    const creatorBox = (!AdminCore.isOwner() && s.creatorEnabled) ? `
      <div class="ad-grid-2">
        <div class="ad-card">
          <h3>Referral</h3>
          <p>Code <strong>${adEsc(code)}</strong></p>
          <p class="ad-copy">${link}</p>
          <button class="btn btn-ghost" data-copy="${adEsc(link)}">Copy link</button>
        </div>
        <div class="ad-card">
          <h3>Follow-ups</h3>
          ${follows.length ? follows.slice(0,6).map((l)=>`<p><strong>${adEsc(l.name)}</strong> · ${adEsc(l.status)} · ${adEsc(l.followUp)}</p>`).join("") : `<p class="muted">No scheduled follow-ups.</p>`}
        </div>
      </div>` : "";
    return `${rangeBar()}
      <div class="ad-kpis" style="margin-top:14px">${cards.map(([a,b]) => `<div class="ad-kpi"><span>${a}</span><b>${b}</b></div>`).join("")}</div>
      <div class="ad-grid-2">
        <div class="ad-card"><h3>Revenue trend</h3>${lineChart(ser.map((x)=>x.revenue),"#4f46e5")}<div class="chart-labels">${ser.map((x)=>`<span>${x.label}</span>`).join("")}</div></div>
        <div class="ad-card"><h3>Student growth</h3>${lineChart(ser.map((x)=>x.students),"#e11d74")}<div class="chart-labels">${ser.map((x)=>`<span>${x.label}</span>`).join("")}</div></div>
      </div>
      <div class="ad-grid-2">
        <div class="ad-card"><h3>Orders</h3>${lineChart(ser.map((x)=>x.orders),"#0f766e")}</div>
        <div class="ad-card"><h3>Commission</h3>${lineChart(ser.map((x)=>x.commission),"#7c3aed")}</div>
      </div>${creatorBox}`;
  },
  students() {
    AdminCore.assert("students", "view");
    let rows = searchRows(AdminCore.scope.students(readList(USERS_KEY)).slice().reverse(), ["name","email","referredBy"]);
    const page = slice(rows);
    return `${toolbar("Search students", "students")}
      ${table(["Student","Email","Status","Attribution","Enrolls","Joined","Actions"], page.map((u) => {
        const n = readList(ALL_ENROLL_KEY).filter((e) => e.email === u.email).length;
        return `<tr>
          <td><strong>${adEsc(u.name)}</strong></td><td>${adEsc(u.email)}</td><td>${badge(u.status||"active")}</td>
          <td>${adEsc(u.referredBy||"—")}</td><td>${n}</td><td>${new Date(u.created||Date.now()).toLocaleDateString("en-IN")}</td>
          <td>${AdminCore.can("students","edit")?`<button class="btn btn-ghost" data-stu="${adEsc(u.email)}">Open</button>`:""}</td></tr>`;
      }), "No students in your scope.")}${pager(rows.length)}`;
  },
  leads() {
    AdminCore.assert("leads", "view");
    let rows = searchRows(AdminCore.scope.leads(AdminCore.leads()).slice().reverse(), ["name","email","status","source"]);
    const page = slice(rows);
    const form = AdminCore.can("leads","create") ? `<form class="ad-form ad-card" id="addLeadForm" style="margin-bottom:14px;grid-template-columns:1fr 1fr 1fr auto">
      <input name="name" placeholder="Name" required><input name="email" type="email" placeholder="Email" required>
      <input name="phone" placeholder="Phone"><button class="btn btn-primary">Add lead</button></form>` : "";
    return `${form}${toolbar("Search leads", "leads")}
      ${table(["Lead","Source","Creator","Status","Follow-up","Actions"], page.map((l) => `<tr>
        <td><strong>${adEsc(l.name)}</strong><div class="muted">${adEsc(l.email)}</div></td>
        <td>${adEsc(l.source||"—")}</td><td>${adEsc(l.creatorEmail||"—")}</td><td>${badge(l.status)}</td>
        <td>${adEsc(l.followUp||"—")}</td>
        <td>${AdminCore.can("leads","edit")?`<button class="btn btn-ghost" data-lead="${l.id}">Open</button>`:""}</td></tr>`))}${pager(rows.length)}`;
  },
  staff() {
    AdminCore.assert("staff", "view");
    const rows = staffList().map((s) => AdminCore.normalizeStaff(s));
    const grant = AdminCore.isSuperAdmin() ? `<form class="staff-grant" id="grantAdminForm">
      <div>
        <strong>Google admin</strong>
        <p>They sign in with Google. Super admin cannot be granted here.</p>
      </div>
      <input name="email" type="email" placeholder="Google email" required>
      <input name="name" placeholder="Name (optional)">
      <button class="btn btn-primary" type="submit">Grant access</button>
    </form>` : "";
    const create = AdminCore.can("staff", "create") ? `<form class="staff-create" id="addStaffForm">
      <header>
        <b>New sub-admin</b>
        <p>This login is the meeting host. The same name, photo, bio, and stats fill their public instructor page — change those fields here.</p>
      </header>
      <label>Full name
        <input name="name" required placeholder="e.g. Neha Kapoor" autocomplete="name">
      </label>
      <label>Work email
        <input name="email" type="email" required placeholder="neha@bizgarh.in" autocomplete="email">
      </label>
      <label>Password
        <input name="password" type="password" required minlength="4" placeholder="They use this on /control" autocomplete="new-password">
      </label>
      <label>Host photo
        <input name="photo" type="url" placeholder="https://…  square photo, or leave empty">
        <input name="photoFile" type="file" accept="image/jpeg,image/png,image/webp,image/*">
      </label>
      <label class="staff-create-wide">Public bio
        <textarea name="bio" rows="3" placeholder="This is the paragraph under their name on the instructor page."></textarea>
      </label>
      ${instructorFaceFieldsHTML({ languages: ["Hindi", "English"], topRated: false, hidden: false }, "short")}
      <label class="staff-create-check"><input type="checkbox" name="creatorEnabled" value="1" checked> Also let them sell as a creator</label>
      <button class="btn btn-primary" type="submit">Create sub-admin</button>
    </form>` : "";
    const cards = rows.map((n, i) => {
      const locked = n.role === "superadmin" || n.role === "owner";
      const roleLabel = n.role === "superadmin" ? "Super admin" : (n.role === "owner" ? "Owner" : "Sub-admin");
      const host = typeof deskHostOf === "function" ? deskHostOf(n.email, n.name) : n;
      const pack = !locked && typeof instructorPack === "function" ? instructorPack(n.name) : null;
      const pageHref = typeof instructorHref === "function" ? instructorHref(n.name) : "";
      return `<article class="staff-card" style="--i:${i}">
        ${typeof deskFaceHTML === "function" ? deskFaceHTML(host.name, host.photo) : ""}
        <div>
          <strong>${adEsc(n.name)}</strong>
          <span>${adEsc(n.email)}</span>
          <ul class="desk-meta">
            <li>${adEsc(roleLabel)}</li>
            <li>${n.creatorEnabled ? "Creator" : "Host only"}</li>
            ${pack ? `<li>${adEsc(pack.years || "—")} years</li>` : ""}
            ${pack ? `<li>${adEsc(pack.learners || "—")} learners</li>` : ""}
            <li>${n.lastLogin ? "Last in " + new Date(n.lastLogin).toLocaleDateString("en-IN") : "No login yet"}</li>
          </ul>
        </div>
        <div class="staff-card-side">
          ${badge(n.status)}
          <div class="staff-card-actions">
            ${!locked && pageHref ? `<a class="btn btn-ghost" href="${adEsc(pageHref)}" target="_blank" rel="noopener">View page</a>` : ""}
            ${locked ? "" : `<button class="btn btn-ghost" data-staff="${adEsc(n.email)}">Edit page</button>`}
            ${!locked && AdminCore.can("staff", "delete") ? `<button class="btn btn-ghost ad-del" type="button" data-del-staff="${adEsc(n.email)}">Delete</button>` : ""}
          </div>
        </div>
      </article>`;
    }).join("");
    return `<section class="staff-desk">
      <div class="staff-aside">${create}${grant}</div>
      <div class="staff-list">${cards || `<div class="cb-empty-box"><p>No sub-admins yet.</p></div>`}</div>
    </section>`;
  },
  performance() {
    const s = AdminCore.session();
    const creators = AdminCore.isOwner() ? staffList().filter((x) => AdminCore.normalizeStaff(x).creatorEnabled) : staffList().filter((x) => x.email === s.email);
    const clicks = AdminCore.clicks();
    const rows = creators.map((c) => {
      const n = AdminCore.normalizeStaff(c);
      const orders = AdminCore.orders().filter((o) => o.creatorEmail === n.email && o.status === "PAID");
      const comm = AdminCore.commissions().filter((x) => x.creatorEmail === n.email);
      const leads = AdminCore.leads().filter((l) => l.creatorEmail === n.email);
      const rev = orders.reduce((a,o)=>a+Number(o.net||0),0);
      const conv = clicks.filter((x)=>x.code===n.referralCode).length;
      return { n, orders, comm, leads, rev, clicks: conv, conv: conv ? Math.round(orders.length/conv*100) : 0 };
    });
    return `${table(["Creator","Clicks","Leads","Sales","Revenue","Commission","Pending"], rows.map((r) => `<tr>
      <td><strong>${adEsc(r.n.name)}</strong><div class="muted">${adEsc(r.n.referralCode)}</div></td>
      <td>${r.clicks}</td><td>${r.leads.length}</td><td>${r.orders.length}</td>
      <td>${AdminCore.inr(r.rev)}</td><td>${AdminCore.inr(r.comm.reduce((s,c)=>s+Number(c.final||0),0))}</td>
      <td>${AdminCore.inr(r.comm.filter((c)=>c.status!=="PAID"&&c.status!=="REVERSED").reduce((s,c)=>s+Number(c.final||0),0))}</td></tr>`))}`;
  },
  referrals() {
    const rows = AdminCore.scope.commissions(AdminCore.commissions()).slice().reverse();
    const clicks = AdminCore.clicks();
    return `<div class="ad-kpis"><div class="ad-kpi"><span>Clicks</span><b>${clicks.length}</b></div>
      <div class="ad-kpi"><span>Attributed sales</span><b>${rows.length}</b></div></div>
      ${table(["When","Student","Course","Creator","Code","Amount"], rows.map((r)=>`<tr>
        <td>${new Date(r.created).toLocaleDateString("en-IN")}</td><td>${adEsc(r.student)}</td>
        <td>${adEsc(adTitle(r.courseId))}</td><td>${adEsc(r.creatorEmail)}</td>
        <td>${adEsc(staffList().find((x)=>x.email===r.creatorEmail)?.referralCode||"—")}</td>
        <td>${AdminCore.inr(r.gross)}</td></tr>`))}`;
  },
  commissions() {
    AdminCore.assert("commission","view");
    const rows = AdminCore.scope.commissions(AdminCore.commissions()).slice().reverse();
    return table(["Date","Creator","Student","Course","Net","Commission","Status","Actions"], rows.map((c)=>`<tr>
      <td>${new Date(c.created).toLocaleDateString("en-IN")}</td><td>${adEsc(c.creatorEmail)}</td>
      <td>${adEsc(c.student)}</td><td>${adEsc(adTitle(c.courseId))}</td>
      <td>${AdminCore.inr(c.net)}</td><td>${AdminCore.inr(c.final)}</td><td>${badge(c.status)}</td>
      <td>${AdminCore.can("commission","approve")&&c.status==="PENDING"?`<button class="btn btn-ghost" data-cm="${c.id}" data-st="APPROVED">Approve</button>`:""}
          ${AdminCore.can("commission","approve")&&c.status==="APPROVED"?`<button class="btn btn-ghost" data-cm="${c.id}" data-st="PAYABLE">Mark payable</button>`:""}</td></tr>`));
  },
  payouts() {
    AdminCore.assert("payouts","view");
    const list = payouts().filter((p) => AdminCore.isOwner() || p.email === AdminCore.session().email);
    const form = AdminCore.can("payouts","create") ? `<form class="ad-card ad-form" id="addPayoutForm" style="margin-bottom:14px;grid-template-columns:1fr 1fr auto">
      <input name="email" type="email" placeholder="Creator email" required>
      <input name="amount" type="number" min="1" placeholder="Amount ₹" required>
      <button class="btn btn-primary">Create payout</button></form>` : "";
    return `${form}${table(["Creator","Amount","Status","When","Actions"], list.map((p)=>`<tr>
      <td>${adEsc(p.email)}</td><td>${AdminCore.inr(p.amount)}</td><td>${badge(p.status)}</td>
      <td>${new Date(p.at||Date.now()).toLocaleDateString("en-IN")}</td>
      <td>${AdminCore.can("payouts","approve")&&p.status==="pending"?`<button class="btn btn-ghost" data-po="${p.id||p.at}" data-st="paid">Mark paid</button>
          <button class="btn btn-ghost" data-po="${p.id||p.at}" data-st="failed">Fail</button>`:""}</td></tr>`))}`;
  },
  courses() {
    AdminCore.assert("courses","view");
    if (typeof CourseAdmin !== "undefined") return CourseAdmin.catalogHTML();
    return `<div class="ad-card"><p>Course builder failed to load.</p></div>`;
  },
  enrolls() {
    AdminCore.assert("enrollments","view");
    const rows = searchRows(AdminCore.scope.enrolls(readList(ALL_ENROLL_KEY)).slice().reverse(), ["name","email","courseId"]);
    return `${toolbar("Search enrollments", "enrollments")}${table(["Student","Course","When"], slice(rows).map((e)=>`<tr>
      <td>${adEsc(e.name)}<div class="muted">${adEsc(e.email)}</div></td>
      <td>${adEsc(adTitle(e.courseId))}</td><td>${new Date(e.at).toLocaleString("en-IN")}</td></tr>`))}${pager(rows.length)}`;
  },
  orders() {
    AdminCore.assert("orders","view");
    const rows = searchRows(AdminCore.scope.orders(AdminCore.orders()).slice().reverse(), ["name","email","tx","id"]);
    return `${toolbar("Search orders / TXN", "orders")}${table(["Order","Student","Course","Net","Creator","Status","TXN","Actions"], slice(rows).map((o)=>`<tr>
      <td>${adEsc(o.id)}</td><td>${adEsc(o.name)}</td><td>${adEsc(adTitle(o.courseId))}</td>
      <td>${AdminCore.inr(o.net)}</td><td>${adEsc(o.creatorEmail||"—")}</td><td>${badge(o.status)}</td>
      <td>${adEsc(o.tx)}</td>
      <td>${AdminCore.can("refunds","approve")&&o.status==="PAID"?`<button class="btn btn-ghost" data-refund="${o.id}">Refund</button>`:""}</td></tr>`))}${pager(rows.length)}`;
  },
  payments() {
    AdminCore.assert("payments","view");
    const rows = AdminCore.scope.payments(AdminCore.payments());
    return table(["When","Student","Amount","Status","TXN"], rows.slice().reverse().map((p)=>`<tr>
      <td>${new Date(p.at).toLocaleString("en-IN")}</td><td>${adEsc(p.email)}</td>
      <td>${AdminCore.inr(p.amount)}</td><td>${badge(p.status)}</td><td>${adEsc(p.tx)}</td></tr>`));
  },
  refunds() {
    AdminCore.assert("refunds","view");
    return table(["When","Order","Student","Course","Amount"], AdminCore.scope.refunds(AdminCore.refunds()).map((r)=>`<tr>
      <td>${new Date(r.at).toLocaleString("en-IN")}</td><td>${adEsc(r.orderId)}</td>
      <td>${adEsc(r.email)}</td><td>${adEsc(adTitle(r.courseId))}</td><td>${AdminCore.inr(r.amount)}</td></tr>`));
  },
  coupons() {
    AdminCore.assert("coupons","view");
    const form = AdminCore.can("coupons","create") ? `<form class="ad-card ad-form" id="addCouponForm" style="margin-bottom:14px;grid-template-columns:1fr 1fr 1fr 1fr auto">
      <input name="code" placeholder="CODE" required><select name="type"><option value="percent">%</option><option value="fixed">₹</option></select>
      <input name="value" type="number" min="1" required><input name="max" type="number" placeholder="Max uses" value="100">
      <button class="btn btn-primary">Add coupon</button></form>` : "";
    return form + table(["Code","Type","Value","Uses","Status"], AdminCore.coupons().map((c)=>`<tr>
      <td><strong>${adEsc(c.code)}</strong></td><td>${adEsc(c.type)}</td><td>${c.type==="percent"?c.value+"%":AdminCore.inr(c.value)}</td>
      <td>${c.uses||0}/${c.max||"—"}</td><td>${badge(c.active?"ACTIVE":"OFF")}</td></tr>`));
  },
  support() {
    AdminCore.assert("support","view");
    const rows = AdminCore.scope.tickets(AdminCore.tickets());
    return table(["Ticket","Student","Course","Status","Assignee","Actions"], rows.map((t)=>`<tr>
      <td><strong>${adEsc(t.title)}</strong></td><td>${adEsc(t.name)}</td><td>${adEsc(adTitle(t.courseId))}</td>
      <td>${badge(t.status)}</td><td>${adEsc(t.assignee||"—")}</td>
      <td><button class="btn btn-ghost" data-tk="${t.id}">Open</button></td></tr>`));
  },
  notifs() {
    AdminCore.assert("notifications","view");
    const form = AdminCore.can("notifications","create") ? `<form class="ad-card ad-form" id="addNotifForm" style="margin-bottom:14px">
      <input name="title" placeholder="Title" required>
      <textarea name="body" placeholder="Message"></textarea>
      <select name="audience"><option value="students">Students</option><option value="creators">Creators</option><option value="all">Everyone</option></select>
      <button class="btn btn-primary">Send</button></form>` : "";
    return form + table(["When","Title","Audience"], AdminCore.notifs().map((n)=>`<tr>
      <td>${new Date(n.at).toLocaleString("en-IN")}</td><td>${adEsc(n.title)}</td><td>${adEsc(n.audience)}</td></tr>`));
  },
  community() {
    AdminCore.assert("community","view");
    const map = typeof deskRoomsMap === "function" ? deskRoomsMap() : {};
    const types = typeof DESK_ROOM_TYPES !== "undefined" ? DESK_ROOM_TYPES : [];
    const canEdit = AdminCore.can("community", "edit");
    return `<form class="ad-card" id="deskRoomsForm">
      <p class="muted">Turn a room live and paste its invite link. Only live rooms with a link show on course, webinar, and mentorship pages.</p>
      <div class="ad-rooms">${types.map((t) => {
        const row = map[t.id] || {};
        return `<article class="ad-room">
          <div class="ad-room-head">
            <span class="cd-room-ico cd-room-${adEsc(t.id)}">${typeof communityRoomIcon === "function" ? communityRoomIcon(t.id) : t.label}</span>
            <div><strong>${adEsc(t.label)}</strong><div class="muted">${adEsc(t.blurb)}</div></div>
          </div>
          <label>Status</label>
          <select name="${adEsc(t.id)}_live" ${canEdit ? "" : "disabled"}>
            <option value="1" ${row.live ? "selected" : ""}>Live</option>
            <option value="0" ${row.live ? "" : "selected"}>Off</option>
          </select>
          <label>Invite / channel link</label>
          <input name="${adEsc(t.id)}_url" type="url" inputmode="url" placeholder="${adEsc(t.placeholder)}" value="${adEsc(row.url || "")}" ${canEdit ? "" : "readonly"}>
        </article>`;
      }).join("")}</div>
      ${canEdit ? `<button class="btn btn-primary" type="submit" style="margin-top:16px">Save communities</button>` : ""}
    </form>`;
  },
  reviews() {
    AdminCore.assert("community", "view");
    const list = typeof allReviews === "function" ? allReviews() : [];
    const groups = {};
    list.forEach((r) => {
      const key = (r.kind || "course") + ":" + (r.targetId || r.courseId || r.course || "other");
      if (!groups[key]) groups[key] = { kind: r.kind || "course", title: r.course || r.targetId || "—", stars: [], n: 0 };
      groups[key].stars.push(Number(r.stars || 0));
      groups[key].n += 1;
    });
    const cards = Object.values(groups).sort((a, b) => b.n - a.n).slice(0, 12).map((g) => {
      const avg = (g.stars.reduce((s, n) => s + n, 0) / g.n).toFixed(1);
      return `<div class="ad-kpi"><span>${adEsc(g.title)}</span><b>★ ${avg}</b><small>${g.n} review${g.n === 1 ? "" : "s"} · ${adEsc(g.kind)}</small></div>`;
    }).join("");
    const canEdit = AdminCore.can("community", "delete") || AdminCore.can("community", "edit");
    return `<p class="muted">Learner reviews go live as soon as they submit. Seed reviews from the public site are included in the averages.</p>
      <div class="ad-kpis">${cards || `<div class="ad-empty">No reviews yet.</div>`}</div>
      ${table(["When", "Desk", "Stars", "Reviewer", "Review", ""], list.slice(0, 120).map((r) => `<tr>
        <td>${r.at ? new Date(r.at).toLocaleString("en-IN") : adEsc(r.when || "")}</td>
        <td><strong>${adEsc(r.course || r.targetId)}</strong><div class="muted">${adEsc(r.kind || "course")}</div></td>
        <td>★ ${adEsc(r.stars)}</td>
        <td>${adEsc(r.name)}<div class="muted">${adEsc(r.city || "")}</div></td>
        <td>${adEsc(r.text)}</td>
        <td>${canEdit && r.source === "learner" ? `<button class="btn btn-ghost" type="button" data-del-review="${adEsc(r.id)}">Remove</button>` : ""}</td>
      </tr>`))}`;
  },
  classroom() {
    AdminCore.assert("classroom","view");
    const courses = AdminCore.isOwner() ? allCourses() : allCourses().filter((c) => ownerEmailOf(c) === AdminCore.session().email || c.instructor === AdminCore.session().name);
    const sel = courses[0]?.id || "";
    const stats = courses.map((c) => {
      const n = readList(ALL_ENROLL_KEY).filter((e)=>e.courseId===c.id).length;
      return `<div class="ad-kpi"><span>${adEsc(c.title)}</span><b>${n}</b><small>${quizzesOf(c.id).length} quizzes · ${assignmentsOf(c.id).length} assignments</small></div>`;
    }).join("");
    return `<p class="muted">Classroom tools stay on the existing LMS. This view reports live progress from the same tables.</p>
      <div class="ad-kpis">${stats || `<div class="ad-empty">No courses in scope.</div>`}</div>
      <p class="muted" style="margin-top:12px">Open a course on the public site to run the student classroom. Quizzes/assignments added previously still apply to <code>${adEsc(sel)}</code>.</p>`;
  },
  live() {
    AdminCore.assert("live","view");
    const phaseOf = (w) => typeof webinarPhase === "function" ? webinarPhase(w) : (w.status || "scheduled");
    const list = (AdminCore.isOwner() ? allWebinars() : allWebinars().filter((w) => w.hostEmail === AdminCore.session().email || w.by === AdminCore.session().name)).filter((w) => w.kind === "class");
    const calls = (typeof callRequests === "function" ? callRequests() : []).filter((c) => AdminCore.isOwner() || c.mentorEmail === AdminCore.session().email || c.mentor === AdminCore.session().name);
    const sess = AdminCore.session();
    const host = typeof deskHostOf === "function" ? deskHostOf(sess.email, sess.name) : { name: sess.name, email: sess.email };
    const form = AdminCore.can("live","create") ? `<form class="ad-card ad-form" id="addLiveForm" style="margin-bottom:14px;grid-template-columns:1fr 1fr">
      ${typeof deskHostLockHTML === "function" ? deskHostLockHTML(host, { field: "by" }) : `<input type="hidden" name="by" value="${adEsc(sess.name)}"><input type="hidden" name="hostEmail" value="${adEsc(sess.email)}">`}
      <input name="title" placeholder="Title" required>
      <input name="at" type="datetime-local" required>
      <input name="duration" value="60 min">
      <select name="chat"><option value="1">Chat on</option><option value="0">Chat off</option></select>
      <select name="record"><option value="1">Record</option><option value="0">No record</option></select>
      <input name="recordUrl" placeholder="Recording URL (optional)">
      <input name="introUrl" placeholder="Intro video (YouTube or MP4 URL)">
      <input name="pdf" placeholder="Session PDF URL (optional)">
      <textarea name="notes" placeholder="Session notes (shown in overview)"></textarea>
      <button class="btn btn-primary">Schedule class</button></form>` : "";
    return form
      + `<p class="muted" style="margin:0 0 8px">Public webinars live under <a href="#webinars">Webinars</a>. This list is live classes only. Rooms open inside Bizgarh on 100ms.</p>`
      + table(["When","Title","Host","Room"], list.map((w)=>`<tr>
      <td>${adEsc(w.when||w.at)}</td><td>${adEsc(w.title)}</td><td>${adEsc(w.by)}</td>
      <td class="admin-actions">
        ${phaseOf(w) === "ended" ? `<span class="muted">Ended</span>` : `<a class="btn btn-primary" href="/live-room?id=${adEsc(w.id)}&host=1">${phaseOf(w) === "live" ? "Enter as host" : "Host meeting"}</a>`}
        ${AdminCore.can("live","edit") ? `<button class="btn btn-ghost" type="button" data-live-extras="${adEsc(w.id)}">Notes / PDF</button>` : ""}
      </td></tr>`))
      + `<h3 style="margin:22px 0 8px">1:1 calls</h3>`
      + table(["Student","Topic","When","Mentor","Status",""], calls.slice().reverse().map((c)=>`<tr>
      <td>${adEsc(c.name)}<div class="muted">${adEsc(c.email)}</div></td>
      <td>${adEsc(c.topic)}</td>
      <td>${adEsc(c.date)} ${adEsc(c.time||"")}</td>
      <td>${adEsc(c.mentor||"—")}</td>
      <td>${badge(c.status)}</td>
      <td class="admin-actions">
        ${c.status === "pending" && AdminCore.can("live","edit") ? `<button class="btn btn-ghost" data-call="${adEsc(c.id)}" data-status="approved">Approve</button>` : ""}
        ${c.status === "approved" ? `<a class="btn btn-ghost" href="/live-room?type=call&id=${adEsc(c.id)}">Join</a>` : ""}
      </td></tr>`));
  },
  analytics() {
    AdminCore.assert("analytics","view");
    const k = AdminCore.kpis(kpiRange());
    const ser = AdminCore.series(typeof Ad.range === "object" ? "30d" : (Ad.range === "custom" ? "30d" : Ad.range));
    const enrolls = AdminCore.scope.enrolls(readList(ALL_ENROLL_KEY));
    const byCourse = {};
    enrolls.forEach((e) => { byCourse[e.courseId] = (byCourse[e.courseId]||0)+1; });
    const top = Object.entries(byCourse).map(([id,v])=>({label: adTitle(id), v, display: v+" · "+AdminCore.inr(nPrice(id)*v)})).sort((a,b)=>b.v-a.v).slice(0,8);
    const refundN = AdminCore.refunds().length;
    const paidN = AdminCore.orders().filter((o)=>o.status==="PAID").length;
    return `${rangeBar()}
      <div class="ad-kpis" style="margin-top:14px">
        <div class="ad-kpi"><span>Revenue</span><b>${AdminCore.inr(k.revenue)}</b></div>
        <div class="ad-kpi"><span>Refund rate</span><b>${paidN?Math.round(refundN/(paidN+refundN)*100):0}%</b></div>
        <div class="ad-kpi"><span>Conversion (orders/students)</span><b>${k.students?Math.round(k.orders/k.students*100):0}%</b></div>
      </div>
      <div class="ad-grid-2">
        <div class="ad-card"><h3>Popular courses</h3>${barRows(top)}</div>
        <div class="ad-card"><h3>Revenue</h3>${lineChart(ser.map((x)=>x.revenue),"#4f46e5")}</div>
      </div>`;
  },
  sessions() {
    AdminCore.assert("security","view");
    return table(["When","Email","Result","Device","Actions"], AdminCore.sessions().slice(0,80).map((s)=>`<tr>
      <td>${new Date(s.at).toLocaleString("en-IN")}</td><td>${adEsc(s.email)}</td>
      <td>${badge(s.ok?"ACTIVE":"FAILED")}</td><td>${adEsc(s.device)}</td>
      <td>${AdminCore.can("security","edit")&&s.active?`<button class="btn btn-ghost" data-flog="${adEsc(s.email)}">Force logout</button>`:""}</td></tr>`));
  },
  audit() {
    AdminCore.assert("security","view");
    return table(["When","Actor","Action","Target","From","To"], AdminCore.auditLog().slice(0,100).map((a)=>`<tr>
      <td>${new Date(a.at).toLocaleString("en-IN")}</td><td>${adEsc(a.actor)}</td>
      <td>${adEsc(a.action)}</td><td>${adEsc(a.target)}</td><td>${adEsc(a.prev)}</td><td>${adEsc(a.next)}</td></tr>`));
  },
  settings() {
    AdminCore.assert("settings","view");
    const st = platformSettings();
    return `<form class="ad-card ad-form" id="regSettingsForm">
      <label>Public signup</label><select name="publicSignup"><option value="1" ${st.publicSignup?"selected":""}>On</option><option value="0" ${!st.publicSignup?"selected":""}>Off</option></select>
      <label>Invite only</label><select name="inviteOnly"><option value="0" ${!st.inviteOnly?"selected":""}>Optional</option><option value="1" ${st.inviteOnly?"selected":""}>Required</option></select>
      <label>Approve new users</label><select name="requireApproval"><option value="0" ${!st.requireApproval?"selected":""}>Instant</option><option value="1" ${st.requireApproval?"selected":""}>Approve</option></select>
      <label>Affiliate program</label><select name="affiliateEnabled"><option value="1" ${st.affiliateEnabled?"selected":""}>On</option><option value="0" ${!st.affiliateEnabled?"selected":""}>Off</option></select>
      <label>Default commission %</label><input name="defaultCommission" type="number" value="${st.defaultCommission||20}">
      <button class="btn btn-primary">Save settings</button></form>`;
  },
  nextpath() {
    AdminCore.assert("courses", "edit");
    const map = typeof nextPathMap === "function" ? nextPathMap() : {};
    const courses = allCourses();
    const webs = typeof webinarCatalogAll === "function" ? webinarCatalogAll() : (typeof allWebinars === "function" ? allWebinars() : []);
    const mentors = typeof allMentorPrograms === "function" ? allMentorPrograms() : [];
    const opts = (kind) => {
      const none = `<option value="">— none —</option>`;
      if (kind === "webinar") return none + webs.map((w) => `<option value="webinar:${adEsc(w.id)}">${adEsc(w.title)}</option>`).join("");
      if (kind === "mentor") return none + mentors.map((p) => `<option value="mentor:${adEsc(p.id)}">${adEsc(p.title)}</option>`).join("");
      return none + courses.map((c) => `<option value="course:${adEsc(c.id)}">${adEsc(c.title)}</option>`).join("");
    };
    const pickSelected = (html, val) => {
      if (!val) return html;
      return html.replace(`value="${val}"`, `value="${val}" selected`);
    };
    const makeRow = (kind, id, title) => {
      const cur = map[kind + ":" + id] || {};
      const val = cur.id ? `${cur.kind || "course"}:${cur.id}` : "";
      const select = `<select name="next" data-from-kind="${adEsc(kind)}" data-from-id="${adEsc(id)}">
        <optgroup label="Courses">${opts("course")}</optgroup>
        <optgroup label="Webinars">${opts("webinar")}</optgroup>
        <optgroup label="Mentorships">${opts("mentor")}</optgroup>
      </select>`;
      return `<tr><td><strong>${adEsc(title)}</strong><div class="muted">${adEsc(kind)}</div></td><td>${pickSelected(select, val)}</td></tr>`;
    };
    return `<form class="ad-card" id="nextPathForm">
      <p class="muted">After a learner finishes the left item, the public site offers the right item. Leave blank to use the built-in course path.</p>
      <h3>After a course</h3>
      ${table(["After this classroom", "Show this next"], courses.map((c) => makeRow("course", c.id, c.title)))}
      <h3 style="margin-top:22px">After a webinar</h3>
      ${table(["After this webinar", "Show this next"], webs.map((w) => makeRow("webinar", w.id, w.title)))}
      <h3 style="margin-top:22px">After a mentorship</h3>
      ${table(["After this desk", "Show this next"], mentors.map((p) => makeRow("mentor", p.id, p.title)))}
      <button class="btn btn-primary" type="submit" style="margin-top:16px">Save next path</button>
    </form>`;
  },
  mentors() {
    AdminCore.assert("courses", "view");
    if (typeof MentorAdmin !== "undefined") return MentorAdmin.catalogHTML();
    return `<p class="muted">Mentorship builder could not load.</p>`;
  },
  webinars() {
    AdminCore.assert("live", "view");
    if (typeof WebinarAdmin !== "undefined") return WebinarAdmin.catalogHTML();
    return `<p class="muted">Webinar builder could not load.</p>`;
  },
  footer() {
    if (!AdminCore.isOwner()) throw new Error("forbidden:settings:view");
    const links = typeof footerSocialLinks === "function" ? footerSocialLinks() : {};
    const fields = typeof FOOTER_SOCIAL_FIELDS !== "undefined" ? FOOTER_SOCIAL_FIELDS : [];
    return `<form class="ad-card ad-form" id="footerSocialForm">
      <p class="muted">These icons sit in the public footer. Paste a full https link for each. Leave blank to show the icon without a click. Spotify is not used — Telegram is.</p>
      ${fields.map((f) => `<label>${adEsc(f.label)}</label><input name="${adEsc(f.id)}" type="text" inputmode="url" placeholder="${adEsc(f.placeholder)}" value="${adEsc(links[f.id] || "")}">`).join("")}
      <button class="btn btn-primary" type="submit">Save footer links</button></form>`;
  }
};

function nPrice(id) { return Number(adCourse(id)?.price || 0); }

function staffDrawer(email) {
  const s = AdminCore.normalizeStaff(AdminCore.staffRow(email));
  if (!s) return "";
  const mods = Object.keys(ADMIN_MODULES);
    const logs = AdminCore.sessions().filter((x) => x.email === s.email).slice(0, 8);
    const orders = AdminCore.orders().filter((o) => o.creatorEmail === s.email && o.status === "PAID");
    const pack = typeof instructorPack === "function" ? instructorPack(s.name) : {};
    const pageHref = typeof instructorHref === "function" ? instructorHref(s.name) : "";
    return `<div class="ad-drawer" id="adDrawer"><div class="ad-drawer-card staff-drawer">
    <button class="btn btn-ghost" data-close-drawer>Close</button>
    <h3>${adEsc(s.name)}</h3>
    <p class="muted">${adEsc(s.email)} · ${adEsc(s.phone || "no phone")}</p>
    <p class="muted">Created ${new Date(s.created).toLocaleDateString("en-IN")} · Last login ${s.lastLogin ? new Date(s.lastLogin).toLocaleString("en-IN") : "—"}</p>
    <p>Creator ${s.creatorEnabled ? "on" : "off"} · ID ${adEsc(s.creatorId || "—")} · Code <strong>${adEsc(s.referralCode || "—")}</strong></p>
    <p>Sales ${orders.length} · ${AdminCore.inr(orders.reduce((a,o)=>a+Number(o.net||0),0))}</p>
    ${pageHref ? `<p><a class="btn btn-ghost" href="${adEsc(pageHref)}" target="_blank" rel="noopener">Open public instructor page</a></p>` : ""}
    <button class="btn btn-ghost" data-flog="${adEsc(s.email)}">Force logout</button>
    <form class="ad-form staff-face-form" id="editStaffForm">
      <input type="hidden" name="email" value="${adEsc(s.email)}">
      <h4>Public instructor page</h4>
      <p class="muted">These fields are what students see on /instructor. Save here and that page updates.</p>
      <label>Display name</label><input name="name" value="${adEsc(s.name)}" required>
      <label>Photo URL</label><input name="photo" value="${adEsc(s.photo || pack.photo || "")}" placeholder="https://…">
      <label>Upload photo</label><input name="photoFile" type="file" accept="image/jpeg,image/png,image/webp,image/*">
      <label>Bio</label><textarea name="bio" rows="4">${adEsc(s.bio || pack.bio || "")}</textarea>
      ${instructorFaceFieldsHTML({ ...pack, tag: pack.tag, hidden: pack.hidden }, "full")}
      <h4>Account</h4>
      <label>Status</label><select name="status"><option ${s.status==="active"?"selected":""}>active</option><option ${s.status==="inactive"?"selected":""}>inactive</option><option ${s.status==="suspended"?"selected":""}>suspended</option></select>
      <label>Phone</label><input name="phone" value="${adEsc(s.phone)}">
      <label>Password reset</label><input name="password" placeholder="Leave blank to keep">
      <label>Creator functionality</label><select name="creatorEnabled"><option value="1" ${s.creatorEnabled?"selected":""}>Enabled</option><option value="0" ${!s.creatorEnabled?"selected":""}>Disabled</option></select>
      <label>Student scope</label><select name="studentScope"><option value="own" ${s.studentScope==="own"?"selected":""}>Own referrals/courses</option><option value="all" ${s.studentScope==="all"?"selected":""}>All students</option></select>
      <label>Commission type</label><select name="ctype"><option value="percent" ${s.commission.type==="percent"?"selected":""}>Percent</option><option value="fixed" ${s.commission.type==="fixed"?"selected":""}>Fixed ₹</option></select>
      <label>New sale</label><input name="newSale" type="number" value="${s.commission.newSale||20}">
      <label>Renewal</label><input name="renewal" type="number" value="${s.commission.renewal||10}">
      <label>2FA</label><select name="totp"><option value="0" ${!s.totp?"selected":""}>Off</option><option value="1" ${s.totp?"selected":""}>On (code 000000)</option></select>
      <h4>Permissions</h4>
      <div class="ad-perm-grid">${mods.map((m) => `<div class="ad-perm-row"><b>${m}</b><div class="ad-checks">${ADMIN_MODULES[m].map((a)=>`<label><input type="checkbox" name="p_${m}_${a}" ${(s.permissions[m]||[]).includes(a)?"checked":""}> ${a}</label>`).join("")}</div></div>`).join("")}</div>
      <button class="btn btn-primary">Save</button>
    </form>
    ${s.role !== "owner" && s.role !== "superadmin" && AdminCore.can("staff", "delete")
      ? `<button class="btn btn-ghost ad-del" type="button" data-del-staff="${adEsc(s.email)}">Delete this admin</button>`
      : ""}
    <p class="muted">Referral: <strong>${adEsc(s.referralCode||"—")}</strong></p>
    <h4>Login history</h4>
    ${logs.map((x)=>`<p class="muted">${new Date(x.at).toLocaleString("en-IN")} · ${x.ok?"ok":"failed"} · ${adEsc(x.device)}</p>`).join("") || "<p class='muted'>None</p>"}
  </div></div>`;
}

function leadDrawer(id) {
  const l = AdminCore.leads().find((x) => x.id === id);
  if (!l) return "";
  if (!AdminCore.isOwner() && l.creatorEmail !== AdminCore.session().email && AdminCore.session().studentScope !== "all") {
    return `<div class="ad-drawer" id="adDrawer"><div class="ad-drawer-card"><p>Not allowed.</p><button data-close-drawer>Close</button></div></div>`;
  }
  return `<div class="ad-drawer" id="adDrawer"><div class="ad-drawer-card">
    <button class="btn btn-ghost" data-close-drawer>Close</button>
    <h3>${adEsc(l.name)}</h3>
    <form class="ad-form" id="editLeadForm">
      <input type="hidden" name="id" value="${l.id}">
      <label>Status</label><select name="status">${["NEW","CONTACTED","INTERESTED","FOLLOW-UP","CONVERTED","NOT INTERESTED","LOST"].map((x)=>`<option ${l.status===x?"selected":""}>${x}</option>`).join("")}</select>
      <label>Assign creator</label><select name="creatorEmail"><option value="">Unassigned</option>${staffList().filter((s)=>s.role!=="owner").map((s)=>`<option value="${adEsc(s.email)}" ${l.creatorEmail===s.email?"selected":""}>${adEsc(s.name)}</option>`).join("")}</select>
      <label>Follow-up</label><input name="followUp" type="date" value="${adEsc(l.followUp||"")}">
      <label>Notes</label><textarea name="notes">${adEsc(l.notes||"")}</textarea>
      <button class="btn btn-primary">Save lead</button>
    </form>
  </div></div>`;
}

function ticketDrawer(id) {
  const t = AdminCore.tickets().find((x) => x.id === id);
  if (!t) return "";
  if (!AdminCore.isOwner() && !AdminCore.guardRecord("support", t.email, t.courseId) && t.assignee !== AdminCore.session().email) {
    return `<div class="ad-drawer" id="adDrawer"><div class="ad-drawer-card"><p>Not allowed.</p><button data-close-drawer>Close</button></div></div>`;
  }
  return `<div class="ad-drawer" id="adDrawer"><div class="ad-drawer-card">
    <button class="btn btn-ghost" data-close-drawer>Close</button>
    <h3>${adEsc(t.title)}</h3>
    <p>${adEsc(t.body)}</p>
    ${(t.replies||[]).map((r)=>`<p class="muted"><strong>${adEsc(r.by)}</strong> · ${adEsc(r.body)}</p>`).join("")}
    <form class="ad-form" id="replyTicketForm">
      <input type="hidden" name="id" value="${t.id}">
      <textarea name="body" placeholder="Reply"></textarea>
      <select name="status"><option ${t.status==="OPEN"?"selected":""}>OPEN</option><option ${t.status==="RESOLVED"?"selected":""}>RESOLVED</option><option ${t.status==="CLOSED"?"selected":""}>CLOSED</option></select>
      <button class="btn btn-primary">Update</button>
    </form>
  </div></div>`;
}

function studentDrawer(email) {
  const u = readList(USERS_KEY).find((x) => x.email === email);
  if (!u) return "";
  if (!AdminCore.isOwner() && !AdminCore.studentIsMine(email)) {
    return `<div class="ad-drawer" id="adDrawer"><div class="ad-drawer-card"><p>Not allowed.</p><button data-close-drawer>Close</button></div></div>`;
  }
  const ens = readList(ALL_ENROLL_KEY).filter((e)=>e.email===email);
  const ords = AdminCore.orders().filter((o)=>o.email===email);
  const certList = typeof certs === "function" ? certs().filter((c)=>c.email===email) : [];
  return `<div class="ad-drawer" id="adDrawer"><div class="ad-drawer-card">
    <button class="btn btn-ghost" data-close-drawer>Close</button>
    <h3>${adEsc(u.name)}</h3>
    <p class="muted">${adEsc(u.email)} · ${badge(u.status||"active")}</p>
    <p>Attribution: ${adEsc(u.referredBy||"direct")} ${u.referredAt ? "· "+new Date(u.referredAt).toLocaleDateString("en-IN") : ""}</p>
    <h4>Enrollments & progress</h4>${ens.map((e)=>{
      const p = typeof courseCompletion === "function" ? courseCompletion(email, e.courseId) : { pct: 0 };
      return `<p>${adEsc(adTitle(e.courseId))} · ${p.pct}%</p>`;
    }).join("")||"<p class='muted'>None</p>"}
    <h4>Orders</h4>${ords.map((o)=>`<p>${adEsc(o.id)} · ${badge(o.status)} · ${AdminCore.inr(o.net)} · ${adEsc(o.creatorEmail||"direct")}</p>`).join("")||"<p class='muted'>None</p>"}
    <h4>Certificates</h4>${certList.map((c)=>`<p>${adEsc(adTitle(c.courseId))}</p>`).join("")||"<p class='muted'>None</p>"}
    ${AdminCore.can("students","edit")?`<button class="btn btn-ghost" data-toggle-user="${adEsc(u.email)}">${u.status==="suspended"?"Activate":"Suspend"}</button>
      <button class="btn btn-ghost" data-reset-user="${adEsc(u.email)}">Reset password to student123</button>`:""}
  </div></div>`;
}

function bindApp() {
  document.getElementById("adminView").addEventListener("click", (e) => {
    const range = e.target.closest("[data-range]");
    if (range) {
      Ad.range = range.dataset.range;
      paint();
      return;
    }
    const applyCustom = e.target.closest("[data-apply-custom]");
    if (applyCustom) {
      const from = document.querySelector("[data-custom-from]")?.value;
      const to = document.querySelector("[data-custom-to]")?.value;
      Ad.customFrom = from;
      Ad.customTo = to;
      Ad.range = { from, to };
      paint();
      return;
    }
    const copy = e.target.closest("[data-copy]");
    if (copy) {
      navigator.clipboard?.writeText(copy.dataset.copy).then(() => toast("Copied")).catch(() => toast(copy.dataset.copy));
      return;
    }
    const exp = e.target.closest("[data-export]");
    if (exp) {
      const mod = exp.dataset.export;
      AdminCore.assert(mod, "export");
      if (mod === "students") AdminCore.exportCsv(AdminCore.scope.students(readList(USERS_KEY)), [{label:"Name",value:r=>r.name},{label:"Email",value:r=>r.email},{label:"Status",value:r=>r.status||"active"},{label:"Ref",value:r=>r.referredBy||""}], "students");
      if (mod === "leads") AdminCore.exportCsv(AdminCore.scope.leads(AdminCore.leads()), [{label:"Name",value:r=>r.name},{label:"Email",value:r=>r.email},{label:"Status",value:r=>r.status},{label:"Creator",value:r=>r.creatorEmail||""}], "leads");
      if (mod === "orders") AdminCore.exportCsv(AdminCore.scope.orders(AdminCore.orders()), [{label:"Order",value:r=>r.id},{label:"Student",value:r=>r.email},{label:"Course",value:r=>r.courseId},{label:"Net",value:r=>r.net},{label:"Status",value:r=>r.status}], "orders");
      if (mod === "enrollments") AdminCore.exportCsv(AdminCore.scope.enrolls(readList(ALL_ENROLL_KEY)), [{label:"Student",value:r=>r.email},{label:"Course",value:r=>r.courseId},{label:"When",value:r=>r.at}], "enrollments");
      toast("Export ready");
      return;
    }
    const unpub = e.target.closest("[data-unpublish]");
    if (unpub && AdminCore.isOwner()) {
      const ids = hiddenCourseIds();
      if (!ids.includes(unpub.dataset.unpublish)) ids.push(unpub.dataset.unpublish);
      writeList(HIDDEN_COURSES_KEY, ids);
      AdminCore.audit("course_unpublish", unpub.dataset.unpublish, "live", "unpublished");
      toast("Course unpublished");
      paint();
      return;
    }
    const pub = e.target.closest("[data-publish]");
    if (pub && AdminCore.isOwner()) {
      writeList(HIDDEN_COURSES_KEY, hiddenCourseIds().filter((id) => id !== pub.dataset.publish));
      AdminCore.audit("course_publish", pub.dataset.publish, "unpublished", "live");
      toast("Course published");
      paint();
      return;
    }
    const page = e.target.closest("[data-page]");
    if (page) { Ad.page = Number(page.dataset.page); paint(); return; }
    const delStaff = e.target.closest("[data-del-staff]");
    if (delStaff) {
      e.preventDefault();
      const mail = delStaff.dataset.delStaff;
      const row = AdminCore.normalizeStaff(AdminCore.staffRow(mail));
      if (!row) return;
      if (!confirm(`Delete admin "${row.name}" (${row.email})? They will lose /control access.`)) return;
      try {
        AdminCore.deleteStaff(mail);
        toast("Admin deleted");
        document.getElementById("adDrawer")?.remove();
        paint();
      } catch (err) {
        toast(err.message || "Could not delete admin");
      }
      return;
    }
    const staff = e.target.closest("[data-staff]");
    if (staff) { document.getElementById("adminView").insertAdjacentHTML("beforeend", staffDrawer(staff.dataset.staff)); return; }
    const lead = e.target.closest("[data-lead]");
    if (lead) { document.getElementById("adminView").insertAdjacentHTML("beforeend", leadDrawer(lead.dataset.lead)); return; }
    const tk = e.target.closest("[data-tk]");
    if (tk) { document.getElementById("adminView").insertAdjacentHTML("beforeend", ticketDrawer(tk.dataset.tk)); return; }
    const stu = e.target.closest("[data-stu]");
    if (stu) { document.getElementById("adminView").insertAdjacentHTML("beforeend", studentDrawer(stu.dataset.stu)); return; }
    if (e.target.closest("[data-close-drawer]")) { e.target.closest("#adDrawer")?.remove(); return; }
    if (e.target.closest("[data-new-staff]")) {
      document.getElementById("adminView").insertAdjacentHTML("beforeend", `<div class="ad-drawer" id="adDrawer"><div class="ad-drawer-card">
        <button class="btn btn-ghost" data-close-drawer>Close</button>
        <h3>Add sub-admin</h3>
        <form class="ad-form" id="addStaffForm">
          <input name="name" placeholder="Name" required>
          <input name="email" type="email" required>
          <input name="password" required minlength="4">
          <select name="creatorEnabled"><option value="1">Creator on</option><option value="0">Creator off</option></select>
          <button class="btn btn-primary">Create</button>
        </form></div></div>`);
      return;
    }
    const cm = e.target.closest("[data-cm]");
    if (cm) {
      AdminCore.assert("commission","approve");
      const list = AdminCore.commissions().map((c) => c.id === cm.dataset.cm ? { ...c, status: cm.dataset.st, approved: AdminCore.now() } : c);
      writeList(COMMISSION_KEY, list);
      AdminCore.audit("commission_status", cm.dataset.cm, "", cm.dataset.st);
      paint(); return;
    }
    const po = e.target.closest("[data-po]");
    if (po) {
      AdminCore.assert("payouts","approve");
      const st = po.dataset.st || "paid";
      const row = payouts().find((p) => p.id === po.dataset.po || p.at === po.dataset.po);
      writeList(PAYOUT_KEY, payouts().map((p) => (p.id === po.dataset.po || p.at === po.dataset.po) ? { ...p, status: st, paid: st === "paid" ? AdminCore.now() : p.paid } : p));
      if (st === "paid" && row?.commissionIds?.length) {
        writeList(COMMISSION_KEY, AdminCore.commissions().map((c) => row.commissionIds.includes(c.id) ? { ...c, status: "PAID", paid: AdminCore.now() } : c));
      }
      AdminCore.audit("payout_status", po.dataset.po, "pending", st);
      paint(); return;
    }
    const callBtn = e.target.closest("[data-call]");
    if (callBtn) {
      AdminCore.assert("live", "edit");
      writeList(CALL_KEY, callRequests().map((c) => {
        if (c.id !== callBtn.dataset.call) return c;
        const next = { ...c, status: callBtn.dataset.status };
        if (callBtn.dataset.status === "approved") next.meetUrl = "/live-room?type=call&id=" + c.id;
        return next;
      }));
      toast("1:1 updated");
      paint();
      return;
    }
    const refund = e.target.closest("[data-refund]");
    if (refund) { AdminCore.refundOrder(refund.dataset.refund); toast("Refunded · commission reversed"); paint(); return; }
    const flog = e.target.closest("[data-flog]");
    if (flog) { AdminCore.forceLogout(flog.dataset.flog); toast("Session ended"); paint(); return; }
    const tu = e.target.closest("[data-toggle-user]");
    if (tu) {
      const list = readList(USERS_KEY);
      const i = list.findIndex((x)=>x.email===tu.dataset.toggleUser);
      const next = list[i].status === "suspended" ? "active" : "suspended";
      list[i].status = next;
      writeList(USERS_KEY, list);
      AdminCore.audit("student_status", emailSafe(tu.dataset.toggleUser), "", next);
      paint(); return;
    }
    const ru = e.target.closest("[data-reset-user]");
    if (ru) {
      const list = readList(USERS_KEY);
      const i = list.findIndex((x)=>x.email===ru.dataset.resetUser);
      if (i>=0) { list[i].password = "student123"; writeList(USERS_KEY, list); toast("Password reset"); }
      return;
    }
    const editC = e.target.closest("[data-edit-course]");
    if (editC && typeof openEditCourse === "function") { openEditCourse(editC.dataset.editCourse); return; }
    const vid = e.target.closest("[data-videos]");
    if (vid && typeof openVideos === "function") { openVideos(vid.dataset.videos); return; }
    const delRev = e.target.closest("[data-del-review]");
    if (delRev) {
      AdminCore.assert("community", "edit");
      if (typeof setLearnerReviews === "function") {
        setLearnerReviews(learnerReviews().filter((r) => r.id !== delRev.dataset.delReview));
        AdminCore.audit("review_delete", delRev.dataset.delReview, "", "");
        toast("Review removed");
        paint();
      }
      return;
    }
    const ml = e.target.closest("[data-mentor-lessons]");
    if (ml && typeof openMentorLessons === "function") { openMentorLessons(ml.dataset.mentorLessons); return; }
    const lx = e.target.closest("[data-live-extras]");
    if (lx && typeof openLiveExtras === "function") { openLiveExtras(lx.dataset.liveExtras); return; }
  });
  document.getElementById("adminView").addEventListener("input", (e) => {
    if (e.target.id === "adSearch") {
      Ad.q = e.target.value;
      Ad.page = 1;
      const pos = e.target.selectionStart;
      paint();
      const inp = document.getElementById("adSearch");
      if (inp) { inp.focus(); inp.setSelectionRange(pos, pos); }
    }
  });
  document.getElementById("adminView").addEventListener("submit", (e) => {
    const f = e.target;
    if (f.id === "addLeadForm") {
      e.preventDefault();
      AdminCore.assert("leads","create");
      const list = AdminCore.leads();
      list.unshift({ id: uid("ld"), name: f.name.value, email: f.email.value, phone: f.phone.value, source: AdminCore.session().referralCode || "manual", creatorEmail: AdminCore.session().email, status: "NEW", notes: "", followUp: "", history: [], at: AdminCore.now() });
      writeList(LEAD_KEY, list);
      paint();
    }
    if (f.id === "editLeadForm") {
      e.preventDefault();
      AdminCore.assert("leads","edit");
      writeList(LEAD_KEY, AdminCore.leads().map((l) => l.id === f.id.value ? { ...l, status: f.status.value, creatorEmail: f.creatorEmail.value, followUp: f.followUp.value, notes: f.notes.value } : l));
      AdminCore.audit("lead_update", f.id.value, "", f.status.value);
      paint();
    }
    if (f.id === "grantAdminForm") {
      e.preventDefault();
      AdminCore.grantGoogleAdmin(f.email.value, f.name.value);
      paint();
      return;
    }
    if (f.id === "addStaffForm") {
      e.preventDefault();
      AdminCore.assert("staff","create");
      const email = f.email.value.trim().toLowerCase();
      if (staffList().some((s)=>s.email===email)) { toast("Email in use"); return; }
      const creatorEnabled = f.creatorEnabled?.type === "checkbox" ? f.creatorEnabled.checked : f.creatorEnabled?.value === "1";
      const code = makeCode(f.name.value.trim().slice(0,5).toUpperCase());
      const finish = (photo) => {
        const name = f.name.value.trim();
        const bio = (f.bio?.value || "").trim();
        const face = staffFaceFromForm(f);
        const row = AdminCore.normalizeStaff({
          name, email, password: f.password.value, role: "subadmin", status: "active",
          photo, bio, faceKey: instructorSlug(name),
          creatorEnabled, referralCode: creatorEnabled ? code : "", creatorId: creatorEnabled ? "CR-"+code : "",
          permissions: { ...CREATOR_DEFAULT_PERMS }, created: AdminCore.now()
        });
        AdminCore.saveStaff(row);
        syncStaffInstructor(row, face);
        if (creatorEnabled) {
          const aff = affiliates();
          if (!aff.some((a)=>a.email===email)) {
            aff.push({ email, name, code, rate: 20, status: "active", created: AdminCore.now() });
            writeList(AFFILIATE_KEY, aff);
          }
        }
        AdminCore.audit("staff_create", email, "", "subadmin");
        toast("Sub-admin created · public instructor page is ready");
        paint();
      };
      const file = f.photoFile?.files?.[0];
      if (file) {
        const r = new FileReader();
        r.onload = () => finish(String(r.result || ""));
        r.onerror = () => finish((f.photo?.value || "").trim() || (typeof photoFor === "function" ? photoFor(f.name.value.trim()) : ""));
        r.readAsDataURL(file);
        return;
      }
      finish((f.photo?.value || "").trim() || (typeof photoFor === "function" ? photoFor(f.name.value.trim()) : ""));
    }
    if (f.id === "editStaffForm") {
      e.preventDefault();
      AdminCore.assert("staff","edit");
      const email = f.email.value;
      if (typeof isSuperAdminEmail === "function" && isSuperAdminEmail(email)) {
        toast("Super admin accounts cannot be edited here");
        return;
      }
      const row = AdminCore.staffRow(email);
      const perms = {};
      Object.keys(ADMIN_MODULES).forEach((m) => {
        perms[m] = ADMIN_MODULES[m].filter((a) => f["p_"+m+"_"+a]?.checked);
      });
      const creatorEnabled = f.creatorEnabled.value === "1";
      const saveRow = (photo) => {
        const name = String((f.name && f.name.value) || row.name || "").trim() || row.name;
        const bio = (f.bio?.value || "").trim();
        const face = staffFaceFromForm(f);
        const next = AdminCore.normalizeStaff({
          ...row,
          name,
          status: f.status.value,
          phone: f.phone.value,
          photo,
          bio,
          faceKey: row.faceKey || instructorSlug(row.name || name),
          password: f.password.value || row.password,
          creatorEnabled,
          studentScope: f.studentScope.value,
          totp: f.totp.value === "1",
          permissions: perms,
          commission: { type: f.ctype.value, newSale: Number(f.newSale.value), renewal: Number(f.renewal.value), start: row.commission?.start || "", end: row.commission?.end || "" },
          referralCode: row.referralCode || (creatorEnabled ? makeCode(name.slice(0,5).toUpperCase()) : row.referralCode),
          creatorId: row.creatorId || (creatorEnabled ? "CR-" + (row.referralCode || "") : row.creatorId)
        });
        AdminCore.saveStaff(next);
        syncStaffInstructor(next, face);
        if (creatorEnabled) {
          const aff = affiliates();
          if (!aff.some((a)=>a.email===email)) {
            aff.push({ email, name: next.name, code: next.referralCode, rate: next.commission.newSale, status: "active", created: AdminCore.now() });
            writeList(AFFILIATE_KEY, aff);
          }
        }
        AdminCore.audit("staff_update", email, JSON.stringify({ status: row.status, creator: row.creatorEnabled, newSale: row.commission?.newSale }), JSON.stringify({ status: next.status, creator: next.creatorEnabled, newSale: next.commission.newSale }));
        toast("Instructor page saved");
        paint();
      };
      const file = f.photoFile?.files?.[0];
      const photoUrl = (f.photo?.value || row.photo || "").trim();
      if (file) {
        const r = new FileReader();
        r.onload = () => saveRow(String(r.result || photoUrl));
        r.onerror = () => saveRow(photoUrl);
        r.readAsDataURL(file);
        return;
      }
      saveRow(photoUrl);
    }
    if (f.id === "addPayoutForm") {
      e.preventDefault();
      AdminCore.assert("payouts","create");
      const email = f.email.value.trim().toLowerCase();
      const payable = AdminCore.commissions().filter((c) => c.creatorEmail === email && c.status === "PAYABLE");
      const amount = Number(f.amount.value) || payable.reduce((s,c)=>s+Number(c.final||0),0);
      const list = payouts();
      const id = uid("po");
      list.unshift({ id, email, amount, status: "pending", commissionIds: payable.map((c)=>c.id), at: AdminCore.now() });
      writeList(PAYOUT_KEY, list);
      AdminCore.audit("payout_create", email, "", String(amount));
      paint();
    }
    if (f.id === "addCouponForm") {
      e.preventDefault();
      AdminCore.assert("coupons","create");
      const list = AdminCore.coupons();
      list.unshift({ id: uid("cp"), code: f.code.value.trim().toUpperCase(), type: f.type.value, value: Number(f.value.value), active: true, uses: 0, max: Number(f.max.value||100), courses: [], created: AdminCore.now() });
      writeList(COUPON_KEY, list);
      paint();
    }
    if (f.id === "addNotifForm") {
      e.preventDefault();
      AdminCore.assert("notifications","create");
      const list = AdminCore.notifs();
      list.unshift({ id: uid("nt"), title: f.title.value, body: f.body.value, audience: f.audience.value, channel: "in-app", at: AdminCore.now() });
      writeList(NOTIF_KEY, list);
      toast("Notification sent");
      paint();
    }
    if (f.id === "replyTicketForm") {
      e.preventDefault();
      AdminCore.assert("support","edit");
      writeList(TICKET_KEY, AdminCore.tickets().map((t) => t.id === f.id.value ? {
        ...t, status: f.status.value,
        replies: (t.replies||[]).concat(f.body.value ? [{ by: AdminCore.session().email, body: f.body.value, at: AdminCore.now() }] : [])
      } : t));
      paint();
    }
    if (f.id === "addCourseForm") {
      e.preventDefault();
      AdminCore.assert("courses","create");
      const s = AdminCore.session();
      const id = "c-" + Date.now();
      const instructor = AdminCore.isOwner() ? f.instructor.value.trim() : s.name;
      const extra = extraCourses();
      const btn = f.querySelector("button[type=submit]");
      if (btn) { btn.disabled = true; btn.textContent = "Publishing…"; }
      resolveCourseBanner(f, "").then((banner) => {
        extra.push({ id, title: f.title.value.trim(), instructor, learners: "0", rating: "4.8", price: Number(f.price.value), old: Number(f.price.value), cat: f.cat.value, cover: id, hours: f.hours.value, lessons: Number(f.lessons.value), description: f.description.value.trim(), ownerEmail: s.email, banner });
        writeList(EXTRA_COURSES_KEY, extra);
        const map = courseOwners(); map[id] = s.email; setCourseOwners(map);
        AdminCore.audit("course_create", id, "", f.title.value);
        toast("Course published");
        paint();
      }).catch((err) => toast(err.message || "Could not save banner")).finally(() => {
        if (btn) { btn.disabled = false; btn.textContent = "Publish course"; }
      });
    }
    if (f.id === "addLiveForm") {
      e.preventDefault();
      AdminCore.assert("live","create");
      const s = AdminCore.session();
      const at = new Date(f.at.value);
      const hostEmail = (f.hostEmail && f.hostEmail.value) || s.email;
      const hostName = (f.by && f.by.value) || s.name;
      const host = typeof deskHostOf === "function" ? deskHostOf(hostEmail, hostName) : { name: hostName, email: hostEmail };
      const list = readList(typeof LIVE_KEY === "string" ? LIVE_KEY : "tradeshalaLives");
      list.push({ id: "lv-"+Date.now(), title: f.title.value.trim(), by: host.name, hostEmail: host.email, at: at.toISOString(), when: at.toLocaleString("en-IN"), duration: f.duration.value, kind: "class", joinUrl: "", introUrl: (f.introUrl?.value || "").trim(), notes: f.notes.value, pdf: (f.pdf?.value || "").trim(), chat: f.chat.value==="1", record: f.record.value==="1", recordUrl: f.recordUrl.value, status: "scheduled" });
      saveWebinars(list);
      toast("Live class scheduled");
      paint();
    }
    if (f.id === "regSettingsForm") {
      e.preventDefault();
      AdminCore.assert("settings","edit");
      saveSettings({
        publicSignup: f.publicSignup.value === "1",
        inviteOnly: f.inviteOnly.value === "1",
        requireApproval: f.requireApproval.value === "1",
        affiliateEnabled: f.affiliateEnabled.value === "1",
        defaultCommission: Number(f.defaultCommission.value) || 20
      });
      AdminCore.audit("settings", "platform", "", "updated");
      toast("Settings saved");
    }
    if (f.id === "nextPathForm") {
      e.preventDefault();
      AdminCore.assert("courses", "edit");
      const next = {};
      f.querySelectorAll("select[data-from-id]").forEach((sel) => {
        const raw = sel.value || "";
        const cut = raw.indexOf(":");
        if (cut < 1) return;
        const kind = raw.slice(0, cut);
        const id = raw.slice(cut + 1);
        if (!kind || !id) return;
        next[sel.dataset.fromKind + ":" + sel.dataset.fromId] = { kind, id };
      });
      if (typeof setNextPathMap === "function") setNextPathMap(next);
      AdminCore.audit("next_path", "map", "", String(Object.keys(next).length));
      toast("Next path saved");
      paint();
    }
    if (f.id === "footerSocialForm") {
      e.preventDefault();
      if (!AdminCore.isOwner()) { toast("Only a super admin can edit footer links"); return; }
      AdminCore.assert("settings","edit");
      if (typeof saveFooterSocialLinks !== "function") { toast("Could not save footer links"); return; }
      saveFooterSocialLinks({
        facebook: f.facebook.value,
        instagram: f.instagram.value,
        youtube: f.youtube.value,
        x: f.x.value,
        telegram: f.telegram.value,
        linkedin: f.linkedin.value
      });
      AdminCore.audit("settings", "footer_social", "", "updated");
      toast("Footer links saved");
      paint();
    }
    if (f.id === "deskRoomsForm") {
      e.preventDefault();
      AdminCore.assert("community", "edit");
      if (typeof setDeskRoomsMap !== "function") { toast("Could not save communities"); return; }
      const next = {};
      (typeof DESK_ROOM_TYPES !== "undefined" ? DESK_ROOM_TYPES : []).forEach((t) => {
        next[t.id] = {
          live: f[t.id + "_live"]?.value === "1",
          url: f[t.id + "_url"]?.value || ""
        };
      });
      setDeskRoomsMap(next);
      AdminCore.audit("community", "desk_rooms", "", "updated");
      toast("Communities saved");
      paint();
    }
  });
}

function bindCourseOverlays() {
  function openEditCourse(id) {
    const c = allCourses().find((x) => x.id === id) || COURSES.find((x) => x.id === id);
    if (!c || !canEditCourse(c)) { toast("Not allowed"); return; }
    const f = document.getElementById("editCourseForm");
    f.courseId.value = c.id;
    f.title.value = c.title;
    f.instructor.value = c.instructor;
    f.price.value = c.price;
    f.cat.value = c.cat;
    f.hours.value = c.hours;
    f.lessons.value = c.lessons;
    f.description.value = c.description || "";
    if (f.banner) f.banner.value = c.banner && !String(c.banner).startsWith("data:") ? c.banner : "";
    if (f.bannerFile) f.bannerFile.value = "";
    if (f.bannerClear) f.bannerClear.checked = false;
    const prev = document.getElementById("editBannerPreview");
    if (prev) {
      if (c.banner) {
        prev.src = c.banner;
        prev.hidden = false;
      } else {
        prev.removeAttribute("src");
        prev.hidden = true;
      }
    }
    document.getElementById("editCourseOverlay").classList.add("open");
  }
  document.getElementById("editCourseForm")?.bannerFile?.addEventListener("change", () => {
    const file = document.getElementById("editCourseForm").bannerFile.files[0];
    const prev = document.getElementById("editBannerPreview");
    if (!prev) return;
    if (!file) return;
    const url = URL.createObjectURL(file);
    prev.src = url;
    prev.hidden = false;
  });
  function renderVideosList(courseId) {
    const host = document.getElementById("videosList");
    if (!host) return;
    const list = courseVideosMap()[courseId] || [];
    const rows = list.length ? list : (typeof lessonsFor === "function" ? lessonsFor(courseId) : []);
    if (!rows.length) {
      host.innerHTML = `<p class="muted">No custom lessons yet. Sample classroom videos play until you add your own.</p>`;
      return;
    }
    host.innerHTML = rows.map((l, i) => `
      <div class="video-admin-item">
        <span class="cr-num">${String(i + 1).padStart(2, "0")}</span>
        <div>
          <strong>${escapeHtml(l.t)}</strong>
          <div class="muted">${escapeHtml(l.dur || "video")} · ${escapeHtml(lessonMediaLabel(l))}</div>
          <textarea data-lesson-notes="${adEsc(l.id || String(i))}" placeholder="Notes for overview">${adEsc(l.notes || "")}</textarea>
          <input data-lesson-pdf="${adEsc(l.id || String(i))}" placeholder="PDF URL" value="${adEsc(l.pdf || "")}">
          <button class="btn btn-ghost" type="button" data-save-lesson="${adEsc(l.id || String(i))}" data-course="${courseId}" data-idx="${i}">Save notes / PDF</button>
        </div>
        ${l.id ? `<button class="btn btn-ghost" type="button" data-del-video="${l.id}" data-course="${courseId}">Remove</button>` : ""}
      </div>`).join("");
  }
  function openVideos(id) {
    const c = allCourses().find((x) => x.id === id) || COURSES.find((x) => x.id === id);
    if (!c || !canEditCourse(c)) { toast("Not allowed"); return; }
    document.getElementById("videosTitle").textContent = `Videos · ${c.title}`;
    document.querySelector("#addVideoForm [name=courseId]").value = id;
    renderVideosList(id);
    document.getElementById("videosOverlay").classList.add("open");
  }
  window.openEditCourse = openEditCourse;
  window.openVideos = openVideos;
  document.getElementById("closeEditCourse")?.addEventListener("click", () => document.getElementById("editCourseOverlay").classList.remove("open"));
  document.getElementById("editCourseOverlay")?.addEventListener("click", (e) => {
    if (e.target.id === "editCourseOverlay") e.currentTarget.classList.remove("open");
  });
  document.getElementById("editCourseForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    AdminCore.assert("courses", "edit");
    const f = e.target;
    const id = f.courseId.value;
    const c = allCourses().find((x) => x.id === id) || COURSES.find((x) => x.id === id);
    if (!c || !canEditCourse(c)) return;
    const s = AdminCore.session();
    const instructor = AdminCore.isOwner() ? f.instructor.value.trim() : s.name;
    const btn = f.querySelector("button[type=submit]");
    if (btn) { btn.disabled = true; btn.textContent = "Saving…"; }
    try {
      const banner = await resolveCourseBanner(f, c.banner || "");
      applyCoursePatch(id, {
        title: f.title.value.trim(),
        instructor,
        price: Number(f.price.value),
        old: Number(f.price.value),
        cat: f.cat.value,
        hours: f.hours.value,
        lessons: Number(f.lessons.value),
        description: f.description.value.trim(),
        banner
      });
      document.getElementById("editCourseOverlay").classList.remove("open");
      AdminCore.audit("course_edit", id, c.title, f.title.value.trim());
      toast("Course updated");
      paint();
    } catch (err) {
      toast(err.message || "Could not save banner");
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = "Save changes"; }
    }
  });
  document.getElementById("closeVideos")?.addEventListener("click", () => document.getElementById("videosOverlay").classList.remove("open"));
  document.getElementById("videosOverlay")?.addEventListener("click", (e) => {
    if (e.target.id === "videosOverlay") e.currentTarget.classList.remove("open");
  });
  document.getElementById("addVideoForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    AdminCore.assert("courses", "edit");
    const f = e.target;
    const id = f.courseId.value;
    const c = allCourses().find((x) => x.id === id) || COURSES.find((x) => x.id === id);
    if (!c || !canEditCourse(c)) return;
    if (e._bizgarhLesson) return;
    e._bizgarhLesson = true;
    const file = f.file.files[0];
    const src = f.src.value.trim();
    const vdoId = (f.vdoId?.value || "").trim();
    if (!file && !src && !vdoId) { toast("Choose a video file to upload"); return; }
    const btn = f.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = file ? "Uploading…" : "Saving…";
    setAdminUploadProgress(f, file ? 0.01 : 0);
    try {
      let pdf = (f.pdf?.value || "").trim();
      const pdfFile = f.pdfFile?.files?.[0];
      if (pdfFile) {
        pdf = await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result || ""));
          r.onerror = () => reject(new Error("Could not read PDF"));
          r.readAsDataURL(pdfFile);
        });
      }
      const lesson = await addClassroomLesson(id, {
        title: f.title.value.trim(),
        dur: f.dur.value.trim(),
        src,
        vdoId,
        file,
        notes: (f.notes?.value || "").trim(),
        pdf,
        pdfName: pdfFile?.name || ""
      }, (p) => setAdminUploadProgress(f, p));
      f.reset();
      f.courseId.value = id;
      setAdminUploadProgress(f, 0);
      renderVideosList(id);
      toast(lesson.vdoId ? "DRM lesson uploaded. Play after encoding (a few minutes)." : "Lesson added to classroom");
    } catch (err) {
      toast(err.message || "Could not save video");
    } finally {
      btn.disabled = false;
      btn.textContent = "Upload lesson";
    }
  });
  document.body.addEventListener("click", (e) => {
    const delVid = e.target.closest("[data-del-video]");
    if (!delVid) return;
    const cid = delVid.dataset.course;
    const c = allCourses().find((x) => x.id === cid);
    if (!c || !canEditCourse(c)) return;
    const current = courseVideosMap()[cid] || [];
    const gone = current.find((l) => l.id === delVid.dataset.delVideo);
    if (gone?.fileKey) delVideoBlob(gone.fileKey);
    setCourseLessons(cid, current.filter((l) => l.id !== delVid.dataset.delVideo));
    renderVideosList(cid);
    toast("Lesson removed");
  });
  document.body.addEventListener("click", (e) => {
    const saveL = e.target.closest("[data-save-lesson]");
    if (!saveL) return;
    const cid = saveL.dataset.course;
    const idx = Number(saveL.dataset.idx);
    const wrap = saveL.closest(".video-admin-item");
    const notes = wrap?.querySelector("[data-lesson-notes]")?.value || "";
    const pdf = wrap?.querySelector("[data-lesson-pdf]")?.value || "";
    const list = (typeof lessonsFor === "function" ? lessonsFor(cid) : []).map((l, i) => i === idx ? { ...l, id: l.id || ("v-" + Date.now() + "-" + i), notes, pdf } : { ...l, id: l.id || ("v-" + Date.now() + "-" + i) });
    setCourseLessons(cid, list);
    renderVideosList(cid);
    toast("Notes and PDF saved");
  });

  function persistMentorLessons(pid) {
    const list = mentorLessonsFor(pid).map((l, i) => ({
      ...l,
      id: l.id || (pid + "-l" + i),
      mode: l.mode || "live",
      notes: l.notes || "",
      pdf: l.pdf || ""
    }));
    setMentorLessons(pid, list);
    return list;
  }
  function renderMentorLessonList(pid) {
    const host = document.getElementById("mentorLessonList");
    if (!host || typeof mentorLessonsFor !== "function") return;
    const list = mentorLessonsFor(pid);
    host.innerHTML = list.map((l, i) => `
      <div class="video-admin-item">
        <span class="cr-num">${String(i + 1).padStart(2, "0")}</span>
        <div>
          <strong>${adEsc(l.t)}</strong>
          <div class="muted">${adEsc(l.mode || "live")} · ${adEsc(l.dur || "")}${l.src || l.vdoId || l.fileKey ? " · video" : ""}</div>
          <select data-ml-mode>
            <option value="live" ${(l.mode || "live") === "live" ? "selected" : ""}>Live</option>
            <option value="recorded" ${l.mode === "recorded" ? "selected" : ""}>Recorded</option>
          </select>
          <textarea data-ml-notes placeholder="Notes for overview">${adEsc(l.notes || "")}</textarea>
          <input data-ml-pdf placeholder="PDF URL" value="${adEsc(l.pdf && String(l.pdf).startsWith("data:") ? "" : (l.pdf || ""))}">
          <label class="admin-file-field"><span>Replace PDF</span><input data-ml-pdf-file type="file" accept="application/pdf"></label>
          <input data-ml-src placeholder="Video URL" value="${adEsc(l.src || "")}">
          <input data-ml-vdo placeholder="VdoCipher ID" value="${adEsc(l.vdoId || "")}">
          <label class="admin-file-field"><span>Recorded video file</span><input data-ml-file type="file" accept="video/*"></label>
          <button class="btn btn-ghost" type="button" data-save-ml="${i}" data-pid="${adEsc(pid)}">Save session</button>
        </div>
        <button class="btn btn-ghost" type="button" data-del-ml="${i}" data-pid="${adEsc(pid)}">Remove</button>
      </div>`).join("") || `<p class="muted">No sessions yet. Add a live or recorded session below.</p>`;
  }
  function openMentorLessons(id) {
    const p = allMentorPrograms().find((x) => x.id === id);
    if (!p || !AdminCore.can("courses", "edit")) { toast("Not allowed"); return; }
    persistMentorLessons(id);
    document.getElementById("mentorLessonTitle").textContent = `Sessions · ${p.title}`;
    document.querySelector("#addMentorLessonForm [name=programId]").value = id;
    renderMentorLessonList(id);
    document.getElementById("mentorLessonOverlay").classList.add("open");
  }
  function openLiveExtras(id) {
    const w = allWebinars().find((x) => x.id === id);
    if (!w || !AdminCore.can("live", "edit")) { toast("Not allowed"); return; }
    const f = document.getElementById("liveExtrasForm");
    if (!f) return;
    f.liveId.value = w.id;
    f.notes.value = w.notes || "";
    f.pdf.value = w.pdf || "";
    f.recordUrl.value = w.recordUrl || "";
    document.getElementById("liveExtrasTitle").textContent = `Notes / PDF · ${w.title}`;
    document.getElementById("liveExtrasOverlay").classList.add("open");
  }
  window.openLiveExtras = openLiveExtras;
  window.openMentorLessons = openMentorLessons;
  document.getElementById("closeMentorLessons")?.addEventListener("click", () => document.getElementById("mentorLessonOverlay").classList.remove("open"));
  document.getElementById("mentorLessonOverlay")?.addEventListener("click", (e) => {
    if (e.target.id === "mentorLessonOverlay") e.currentTarget.classList.remove("open");
  });
  document.getElementById("addMentorLessonForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    AdminCore.assert("courses", "edit");
    const f = e.target;
    const pid = f.programId.value;
    let pdf = (f.pdf?.value || "").trim();
    const pdfFile = f.pdfFile?.files?.[0];
    if (pdfFile) {
      pdf = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result || ""));
        r.onerror = () => reject(new Error("Could not read PDF"));
        r.readAsDataURL(pdfFile);
      });
    }
    let src = (f.src?.value || "").trim();
    const vdoId = (f.vdoId?.value || "").trim();
    const file = f.file?.files?.[0];
    if (file) {
      const key = "mp-" + pid + "-" + Date.now();
      await putVideoBlob(key, file);
      src = "";
      const lesson = {
        id: "ml-" + Date.now(),
        t: f.title.value.trim(),
        dur: f.dur.value.trim() || "60 min",
        mode: f.mode.value,
        notes: (f.notes?.value || "").trim(),
        pdf,
        pdfName: pdfFile?.name || "",
        src,
        vdoId,
        fileKey: key,
        at: f.at?.value || ""
      };
      setMentorLessons(pid, mentorLessonsFor(pid).concat(lesson));
    } else {
      setMentorLessons(pid, mentorLessonsFor(pid).concat({
        id: "ml-" + Date.now(),
        t: f.title.value.trim(),
        dur: f.dur.value.trim() || "60 min",
        mode: f.mode.value,
        notes: (f.notes?.value || "").trim(),
        pdf,
        pdfName: pdfFile?.name || "",
        src,
        vdoId,
        at: f.at?.value || ""
      }));
    }
    f.reset();
    f.programId.value = pid;
    renderMentorLessonList(pid);
    toast("Session saved");
  });
  document.body.addEventListener("click", (e) => {
    const del = e.target.closest("[data-del-ml]");
    if (!del) return;
    const pid = del.dataset.pid;
    const list = mentorLessonsFor(pid).filter((_, i) => i !== Number(del.dataset.delMl));
    setMentorLessons(pid, list);
    renderMentorLessonList(pid);
    toast("Session removed");
  });
  document.body.addEventListener("click", async (e) => {
    const save = e.target.closest("[data-save-ml]");
    if (!save) return;
    const pid = save.dataset.pid;
    const idx = Number(save.dataset.saveMl);
    const wrap = save.closest(".video-admin-item");
    const list = mentorLessonsFor(pid);
    const cur = list[idx];
    if (!cur) return;
    let pdf = wrap.querySelector("[data-ml-pdf]")?.value.trim() || cur.pdf || "";
    const pdfFile = wrap.querySelector("[data-ml-pdf-file]")?.files?.[0];
    if (pdfFile) {
      pdf = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result || ""));
        r.onerror = () => reject(new Error("Could not read PDF"));
        r.readAsDataURL(pdfFile);
      });
    }
    const file = wrap.querySelector("[data-ml-file]")?.files?.[0];
    let fileKey = cur.fileKey || "";
    if (file) {
      fileKey = "mp-" + pid + "-" + Date.now();
      await putVideoBlob(fileKey, file);
    }
    list[idx] = {
      ...cur,
      mode: wrap.querySelector("[data-ml-mode]")?.value || cur.mode || "live",
      notes: wrap.querySelector("[data-ml-notes]")?.value.trim() || "",
      pdf,
      pdfName: pdfFile?.name || cur.pdfName || "",
      src: wrap.querySelector("[data-ml-src]")?.value.trim() || "",
      vdoId: wrap.querySelector("[data-ml-vdo]")?.value.trim() || "",
      fileKey
    };
    setMentorLessons(pid, list);
    renderMentorLessonList(pid);
    toast("Session updated");
  });
  document.getElementById("closeLiveExtras")?.addEventListener("click", () => document.getElementById("liveExtrasOverlay").classList.remove("open"));
  document.getElementById("liveExtrasOverlay")?.addEventListener("click", (e) => {
    if (e.target.id === "liveExtrasOverlay") e.currentTarget.classList.remove("open");
  });
  document.getElementById("liveExtrasForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    AdminCore.assert("live", "edit");
    const f = e.target;
    updateLive(f.liveId.value, {
      notes: f.notes.value.trim(),
      pdf: f.pdf.value.trim(),
      recordUrl: f.recordUrl.value.trim()
    });
    document.getElementById("liveExtrasOverlay").classList.remove("open");
    toast("Webinar notes and PDF saved");
    paint();
  });
}

function emailSafe(s) { return s; }

function showAdmin() {
  const login = document.getElementById("staffLogin");
  const app = document.getElementById("adminApp");
  login && login.classList.add("hidden");
  app && app.classList.remove("hidden");
  try {
    applyAdminRoute(parseAdminRoute());
    paint();
  } catch (err) {
    console.error(err);
    const view = document.getElementById("adminView");
    if (view) {
      view.innerHTML = `<div class="ad-card"><h3>Desk is open</h3><p class="muted">Refresh if a section does not appear.</p></div>`;
    }
    try { renderSide(); } catch (_) {}
  }
}

function bootAdminUi() {
  if (window.__bgAdminUi) return;
  window.__bgAdminUi = true;
  const note = (msg) => { if (typeof toast === "function") toast(msg); };

  document.getElementById("staffGoogleBtn")?.addEventListener("click", () => {
    if (typeof startSocial === "function") startSocial("google");
  });
  const cont = document.getElementById("staffContinue");
  const u = typeof getUser === "function" ? getUser() : null;
  const existing = (() => { try { return AdminCore.session(); } catch { return null; } })();
  if (cont && (existing || (u && typeof staffAccessRole === "function" && staffAccessRole(u.email)))) {
    cont.classList.remove("hidden");
    const who = cont.querySelector("span");
    if (who) who.textContent = existing?.email || u.email;
    cont.addEventListener("click", () => {
      if (existing || AdminCore.adoptPublicUser()) {
        note("Welcome");
        showAdmin();
      }
    });
    if (existing) {
      try {
        const logs = typeof AdminCore.sessions === "function" ? AdminCore.sessions() : [];
        const fresh = logs.some((x) => x.ok && x.email === existing.email && Date.now() - new Date(x.at).getTime() < 10 * 60 * 1000);
        if (!fresh) AdminCore.recordSession(existing, true);
      } catch (_) {}
      showAdmin();
    }
  }

  document.getElementById("staffLoginForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (AdminCore.session()) { showAdmin(); return; }
    const r = AdminCore.login(e.target.email.value.trim().toLowerCase(), e.target.password.value, e.target.totp.value);
    if (r.needTotp) { document.getElementById("totpWrap").classList.remove("hidden"); note(r.error); return; }
    if (!r.ok) { note(r.error); return; }
    note("Welcome");
    showAdmin();
  });
  document.getElementById("adminSide")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-route]");
    if (btn) go(btn.dataset.route);
    if (e.target.id === "staffLogout" || e.target.closest("#staffLogout")) { AdminCore.logout(); location.reload(); }
  });
  document.getElementById("adMenu")?.addEventListener("click", () => {
    const app = document.getElementById("adminApp");
    setAdminNav(!app?.classList.contains("nav-open"));
  });
  document.getElementById("adNavScrim")?.addEventListener("click", closeAdminNav);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAdminNav();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) closeAdminNav();
  });
  window.addEventListener("hashchange", () => {
    if (!AdminCore.session()) return;
    closeAdminNav();
    applyAdminRoute(parseAdminRoute());
    Ad.page = 1;
    paint();
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      try {
        if (typeof seedStaffAndAnalytics === "function") seedStaffAndAnalytics();
        AdminCore.seedControlPlane();
        bindApp();
        bindCourseOverlays();
        if (typeof CourseAdmin !== "undefined") CourseAdmin.bind();
        if (typeof MentorAdmin !== "undefined") MentorAdmin.bind();
        if (typeof WebinarAdmin !== "undefined") WebinarAdmin.bind();
      } catch (err) {
        console.error(err);
      }
    });
  });
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootAdminUi);
else bootAdminUi();
window.bootAdminUi = bootAdminUi;
window.showAdmin = showAdmin;
