/* Creator CRM dashboard — desk210 Profile change password + show toggles */
(function () {
  const PROD_KEY = "tradeshalaCreatorProduction";
  const SOCIAL_KEY = "tradeshalaCreatorSocialLinks";
  const SOCIAL_CACHE_KEY = "tradeshalaCreatorSocialCache";
  const SOCIAL_API_KEY = "tradeshalaCreatorSocialApiV1";
  const THEME_KEY = "crmTheme";
  const ACCORDION_KEY = "crmAccordionOpen";
  const STUDENTS_DEMO_KEY = "crmStudentsDemoV1";
  // V2 drops poisoned V1 seeds (queue demos were written without demo:true).
  const STUDIO_SCRIPTS_KEY = "crmStudioScriptsV2";
  const STUDIO_RECORDINGS_KEY = "crmStudioRecordingsV2";
  const STUDIO_QUEUE_KEY = "crmStudioEditingQueueV2";
  const STUDIO_LIBRARY_KEY = "crmStudioContentLibraryV2";
  const STUDY_KEY = "crmStudyMaterialsV2";
  const STUDIO_LEGACY_KEYS = [
    "crmStudioScriptsV1",
    "crmStudioRecordingsV1",
    "crmStudioEditingQueueV1",
    "crmStudioContentLibraryV1",
    "crmStudyMaterialsV1"
  ];
  const TICKETS_KEY = "crmCreatorTicketsV1";
  const PROFILE_KEY = "crmCreatorProfileV1";
  const ACTIVE_DAYS = 14;
  const DEFAULT_PERIOD = 30;
  const EDIT_STATUSES = ["Under Review", "Editing", "Revision", "Completed"];
  const VIDEO_ACCEPT = "video/*,.mp4,.webm,.mov,.m4v,.avi,.mkv";
  const STUDY_ACCEPT = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.webp,.gif,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  /** @type {Map<string, { blob: Blob, url: string }>} */
  const studioBlobs = new Map();

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function ensureCreatorSeed() {
    if (typeof seedLms === "function") seedLms();
    if (typeof AdminCore !== "undefined" && AdminCore.migrateStaff) AdminCore.migrateStaff();
    if (typeof AdminCore !== "undefined" && AdminCore.seedControlPlane) AdminCore.seedControlPlane();
    // Rehan Khan CRM: same staff email as /control KV + password Rehan8055
    if (typeof AdminCore !== "undefined" && AdminCore.ensureRehanCreator) {
      try { AdminCore.ensureRehanCreator(); } catch { /* ignore */ }
    }
    // Never re-seed MENTORS[] as Sub-admins / creators — purge leftovers.
    if (typeof AdminCore !== "undefined" && AdminCore.purgeDemoMentorStaff) {
      try { AdminCore.purgeDemoMentorStaff({ push: false }); } catch { /* ignore */ }
    }

    const staff = typeof staffList === "function" ? staffList() : [];

    if (typeof courseOwners === "function" && typeof setCourseOwners === "function" && typeof allCourses === "function") {
      const owners = courseOwners();
      allCourses().forEach((c) => {
        if (!owners[c.id]) {
          const match = staff.find((s) => (s.role === "creator" || s.creatorEnabled) && s.name === c.instructor);
          if (match) owners[c.id] = match.email;
        }
      });
      setCourseOwners(owners);
    }

    // Never seed fake analytics/enrolls — CRM shows real control/KV data only.
    try { purgeCrmDemoFill(); } catch { /* ignore */ }
  }

  const CRM_DEMO_EMAILS = new Set([
    "riya@gmail.com", "omkar@gmail.com", "pooja@gmail.com", "sahil@gmail.com",
    "dev@gmail.com", "mehul@gmail.com", "ananya.b@gmail.com", "kabir.s@gmail.com",
    "nisha.b@gmail.com", "vikram.g@gmail.com", "ankit.rao@gmail.com", "sneha.p@gmail.com",
    "karan.m@gmail.com", "divya.i@gmail.com", "ritesh@gmail.com", "kavya@gmail.com"
  ]);

  function isCrmDemoOrder(o) {
    if (!o) return false;
    if (CRM_DEMO_EMAILS.has(String(o.email || "").toLowerCase())) return true;
    const id = String(o.id || o.orderId || "");
    const tx = String(o.tx || "");
    return /^ord-demo/i.test(id) || /^TXNDEMO/i.test(tx) || /^out-/i.test(id);
  }

  function purgeCrmDemoFill() {
    try {
      if (localStorage.getItem("crmDemoFillPurgedV2") === "1") return;
    } catch { /* ignore */ }
    const isDemo = (email) => CRM_DEMO_EMAILS.has(String(email || "").toLowerCase());
    if (typeof readList === "function" && typeof writeList === "function") {
      try {
        if (typeof USERS_KEY !== "undefined") {
          writeList(USERS_KEY, readList(USERS_KEY).filter((u) => !isDemo(u.email)));
        }
      } catch { /* ignore */ }
      try {
        if (typeof ALL_ENROLL_KEY !== "undefined") {
          writeList(ALL_ENROLL_KEY, readList(ALL_ENROLL_KEY).filter((e) => !isDemo(e.email)));
        }
      } catch { /* ignore */ }
    }
    if (typeof AdminCore !== "undefined" && AdminCore.orders && typeof saveStore === "function") {
      try {
        const orders = AdminCore.orders().filter((o) => !isDemo(o.email) && !String(o.id || "").startsWith("out-"));
        const key = (typeof ORDER_KEY !== "undefined" && ORDER_KEY) || "tradeshalaOrders";
        saveStore(key, orders);
      } catch { /* ignore */ }
    }
    if (typeof AdminCore !== "undefined" && AdminCore.tickets && typeof saveStore === "function") {
      try {
        const tickets = AdminCore.tickets().filter((t) => !isDemo(t.email) && !String(t.id || "").startsWith("crm-st-"));
        const key = (typeof TICKET_KEY !== "undefined" && TICKET_KEY) || "tradeshalaTickets";
        saveStore(key, tickets);
      } catch { /* ignore */ }
    }
    try {
      localStorage.removeItem(STUDENTS_DEMO_KEY);
      localStorage.removeItem("crmAnalyticsOutstandingV1");
      localStorage.removeItem("tradeshalaAnalyticsV2");
      STUDIO_LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
      // Allow one more purge pass if demo LMS seeds reappear after staff hydrate.
      localStorage.setItem("crmDemoFillPurgedV2", "1");
      localStorage.setItem("crmStudioDemoPurgedV2", "1");
    } catch { /* ignore */ }
  }

  function session() {
    if (typeof AdminCore !== "undefined" && AdminCore.session) return AdminCore.session();
    try { return JSON.parse(localStorage.getItem(STAFF_SESSION_KEY) || "null"); } catch { return null; }
  }

  function isCreatorStaff(s) {
    if (!s) return false;
    if (typeof AdminCore !== "undefined" && AdminCore.normalizeStaff) s = AdminCore.normalizeStaff(s);
    if (s.creatorEnabled) return true;
    if (s.role === "creator") return true;
    if (s.role === "owner" || s.role === "superadmin") return true;
    return false;
  }

  /** Control Sub-admin staff row linked to this CRM session (generic, not Rehan-only). */
  function linkedControlStaff(s) {
    if (!s) return null;
    const mail = String(s.email || "").trim().toLowerCase();
    let row = null;
    if (typeof AdminCore !== "undefined" && AdminCore.staffRow) {
      try { row = AdminCore.staffRow(mail) || AdminCore.staffRow(s.email); } catch { row = null; }
    }
    if (!row && typeof staffList === "function") {
      try {
        row = (staffList() || []).find((x) => String(x?.email || "").trim().toLowerCase() === mail) || null;
      } catch { row = null; }
    }
    const base = row || s;
    if (typeof AdminCore !== "undefined" && AdminCore.normalizeStaff) {
      try { return AdminCore.normalizeStaff(base); } catch { /* fall through */ }
    }
    return base;
  }

  function pickStaffPhoto(raw) {
    const v = String(raw || "").trim();
    if (!v) return "";
    // Keep under-budget inline DPs from Control (KV drops >200KB).
    if (v.startsWith("data:") && v.length > 200 * 1024) return "";
    if (/randomuser\.me/i.test(v)) return "";
    return v;
  }

  function creatorAvatar(s) {
    const linked = linkedControlStaff(s) || s;
    const fromStaff = pickStaffPhoto(linked?.photo);
    if (fromStaff) return fromStaff;
    if (typeof photoFor === "function" && linked?.name) {
      const p = pickStaffPhoto(photoFor(linked.name));
      if (p) return p;
    }
    const face = linked?.faceKey || (typeof instructorSlug === "function" ? instructorSlug(linked?.name || "") : "");
    if (face === "rehan-khan" || linked?.name === "Rehan Khan") {
      return "/img/instructors/rehan-khan.jpg?v=desk218";
    }
    if (face) return `/img/instructors/${face}.jpg`;
    const mentors = typeof MENTORS !== "undefined" ? MENTORS : [];
    const hit = mentors.find((m) => m.name === linked?.name);
    return (hit && hit.img) || "/img/bizgarh-avatar.png";
  }

  function creatorHeaderLabel(s) {
    const linked = linkedControlStaff(s) || s;
    const name = linked?.name || s?.name || "Creator";
    const loginId = (typeof AdminCore !== "undefined" && AdminCore.isRehanStaffEmail && AdminCore.isRehanStaffEmail(s?.email))
      ? "rehan@bizgarh.in"
      : (s?.email || linked?.email || "");
    return { linked, name, loginId };
  }

  function ownedCourseIds(staff) {
    if (typeof AdminCore !== "undefined" && AdminCore.ownedCourseIds) return AdminCore.ownedCourseIds(staff);
    const s = staff || session();
    if (!s || typeof allCourses !== "function") return [];
    return allCourses()
      .filter((c) => (typeof ownerEmailOf === "function" ? ownerEmailOf(c) === s.email : false) || c.instructor === s.name)
      .map((c) => c.id);
  }

  function creatorEnrolls(staff) {
    const mine = new Set(ownedCourseIds(staff));
    const all = typeof readList === "function" ? readList(ALL_ENROLL_KEY) : [];
    return all.filter((e) => mine.has(e.courseId) && !CRM_DEMO_EMAILS.has(String(e.email || "").toLowerCase()));
  }

  function uniqueStudents(enrolls) {
    const map = new Map();
    enrolls.forEach((e) => {
      const key = String(e.email || "").toLowerCase();
      if (!key) return;
      if (!map.has(key)) map.set(key, e);
    });
    return Array.from(map.values());
  }

  function inLastDays(iso, days) {
    const t = new Date(iso || 0).getTime();
    if (!Number.isFinite(t) || !t) return false;
    return t >= Date.now() - days * 86400000;
  }

  function hasLearningActivity(email, courseIds) {
    if (typeof progressStore !== "function") return false;
    const all = progressStore();
    const byUser = all[email] || all[String(email).toLowerCase()] || null;
    if (!byUser) return false;
    return courseIds.some((cid) => {
      const p = byUser[cid];
      if (!p || !p.lessons) return false;
      return Object.keys(p.lessons).some((k) => p.lessons[k]);
    });
  }

  /**
   * Metric rules (creator-scoped):
   * - Total Students: unique emails enrolled in any of this creator's courses
   * - New Students: unique emails whose first enroll into this creator's courses
   *   falls inside the selected period (default 30 days)
   * - Active Students: subset of Total with either (a) any lesson progress on a
   *   creator course, or (b) an enroll into a creator course in the last ACTIVE_DAYS (14)
   * - Total Revenue: ₹ sum of PAID order net attributed to this creator, else
   *   commission finals, else enroll × course price for owned courses in period
   */
  function computeMetrics(staff, periodDays) {
    const days = Number(periodDays) || DEFAULT_PERIOD;
    const enrolls = creatorEnrolls(staff);
    const courseIds = ownedCourseIds(staff);
    const students = uniqueStudents(enrolls);

    const firstEnrollAt = new Map();
    enrolls.forEach((e) => {
      const key = String(e.email || "").toLowerCase();
      const t = new Date(e.at || 0).getTime();
      if (!key || !t) return;
      if (!firstEnrollAt.has(key) || t < firstEnrollAt.get(key)) firstEnrollAt.set(key, t);
    });

    const newStudents = students.filter((s) => {
      const t = firstEnrollAt.get(String(s.email || "").toLowerCase());
      return t && t >= Date.now() - days * 86400000;
    });

    const prevNew = students.filter((s) => {
      const t = firstEnrollAt.get(String(s.email || "").toLowerCase());
      return t && t < Date.now() - days * 86400000 && t >= Date.now() - days * 2 * 86400000;
    });

    const active = students.filter((s) => {
      const mail = String(s.email || "").toLowerCase();
      if (hasLearningActivity(mail, courseIds) || hasLearningActivity(s.email, courseIds)) return true;
      return enrolls.some((e) => String(e.email || "").toLowerCase() === mail && inLastDays(e.at, ACTIVE_DAYS));
    });

    const prevActiveCutStart = Date.now() - (ACTIVE_DAYS + days) * 86400000;
    const prevActiveCutEnd = Date.now() - days * 86400000;
    const prevActive = students.filter((s) => {
      const mail = String(s.email || "").toLowerCase();
      return enrolls.some((e) => {
        const t = new Date(e.at || 0).getTime();
        return String(e.email || "").toLowerCase() === mail && t >= prevActiveCutStart && t < prevActiveCutEnd;
      });
    });

    const totalNow = students.length;
    const totalPrev = students.filter((s) => {
      const t = firstEnrollAt.get(String(s.email || "").toLowerCase());
      return t && t < Date.now() - days * 86400000;
    }).length;

    let revenue = 0;
    let prevRevenue = 0;
    if (typeof AdminCore !== "undefined" && AdminCore.orders) {
      const orders = AdminCore.orders().filter((o) => o.status === "PAID" && (
        o.creatorEmail === staff.email || courseIds.includes(o.courseId)
      ));
      orders.forEach((o) => {
        const amt = Number(o.net || o.amount || 0);
        const t = new Date(o.at || 0).getTime();
        if (t >= Date.now() - days * 86400000) revenue += amt;
        else if (t >= Date.now() - days * 2 * 86400000) prevRevenue += amt;
      });
    }
    if (!revenue && typeof AdminCore !== "undefined" && AdminCore.commissions) {
      AdminCore.commissions().filter((c) => c.creatorEmail === staff.email).forEach((c) => {
        const amt = Number(c.final || c.amount || 0);
        const t = new Date(c.created || c.at || 0).getTime();
        if (t >= Date.now() - days * 86400000) revenue += amt;
        else if (t >= Date.now() - days * 2 * 86400000) prevRevenue += amt;
      });
    }
    // No enroll-price inventing — revenue stays 0 until real paid orders / commissions exist.

    const pct = (cur, prev) => {
      if (!prev) return cur ? 100 : 0;
      return Math.round(((cur - prev) / prev) * 1000) / 10;
    };

    const spark = (base, wobble) => Array.from({ length: 8 }, (_, i) => {
      const wave = Math.sin(i * 0.9 + wobble) * 0.12 + 1;
      return Math.max(0, Math.round(base * (0.55 + i * 0.06) * wave));
    });

    return {
      totalStudents: totalNow,
      totalDelta: pct(totalNow, totalPrev),
      newStudents: newStudents.length,
      newDelta: pct(newStudents.length, prevNew.length),
      activeStudents: active.length,
      activeDelta: pct(active.length, prevActive.length),
      revenue,
      revenueDelta: pct(revenue, prevRevenue),
      sparks: {
        total: spark(Math.max(totalNow, 4), 0.2),
        neu: spark(Math.max(newStudents.length, 2), 1.1),
        active: spark(Math.max(active.length, 3), 2.0),
        revenue: spark(Math.max(revenue / 100, 5), 0.7)
      },
      series: revenueSeries(staff, courseIds, days)
    };
  }

  function revenueSeries(staff, courseIds, days) {
    const points = 8;
    const step = Math.max(1, Math.round(days / points));
    const buckets = Array.from({ length: points }, (_, i) => {
      const end = Date.now() - (points - 1 - i) * step * 86400000;
      const start = end - step * 86400000;
      let revenue = 0;
      if (typeof AdminCore !== "undefined" && AdminCore.orders) {
        AdminCore.orders().forEach((o) => {
          if (o.status !== "PAID") return;
          if (!(o.creatorEmail === staff.email || courseIds.includes(o.courseId))) return;
          const t = new Date(o.at || 0).getTime();
          if (t >= start && t < end) revenue += Number(o.net || o.amount || 0);
        });
      }
      if (!revenue) {
        creatorEnrolls(staff).forEach((e) => {
          const t = new Date(e.at || 0).getTime();
          if (t < start || t >= end) return;
          const c = typeof allCourses === "function" ? allCourses().find((x) => x.id === e.courseId) : null;
          revenue += Number(c?.price || 0);
        });
      }
      return {
        label: new Date(start + 86400000).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        revenue
      };
    });
    return buckets;
  }

  function inrCompact(n) {
    const v = Number(n || 0);
    if (v >= 1e7) return "₹" + (v / 1e7).toFixed(2).replace(/\.00$/, "") + "Cr";
    if (v >= 1e5) return "₹" + (v / 1e5).toFixed(2).replace(/\.00$/, "") + "L";
    if (v >= 1e3) return "₹" + (v / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    return "₹" + Math.round(v).toLocaleString("en-IN");
  }

  function fmtNum(n) {
    return Math.round(Number(n || 0)).toLocaleString("en-IN");
  }

  function sparkSVG(values, color) {
    const w = 88, h = 28, p = 2;
    const max = Math.max(...values, 1);
    const pts = values.map((v, i) => {
      const x = p + (i / Math.max(values.length - 1, 1)) * (w - p * 2);
      const y = h - p - (v / max) * (h - p * 2);
      return `${x},${y}`;
    });
    const fill = `${p},${h - p} ${pts.join(" ")} ${w - p},${h - p}`;
    return `<svg class="crm-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
      <polyline points="${fill}" fill="${color}22" stroke="none"></polyline>
      <polyline points="${pts.join(" ")}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linejoin="round"></polyline>
    </svg>`;
  }

  function deltaHTML(d) {
    const n = Number(d);
    if (!Number.isFinite(n) || n === 0) return `<span class="crm-delta flat">0% vs prior</span>`;
    const up = n > 0;
    return `<span class="crm-delta ${up ? "" : "down"}">${up ? "+" : ""}${n}% vs prior</span>`;
  }

  function productionStore(email) {
    // Source of truth: /control staff.contentProduction (admin-editable). CRM is read-only.
    if (typeof AdminCore !== "undefined" && AdminCore.creatorProduction) {
      return AdminCore.creatorProduction(email);
    }
    return { scriptsPending: 0, inEditing: 0, awaitingApproval: 0, videosDelivered: 0 };
  }

  function studioUid(prefix) {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function studioEmailKey(email) {
    return String(email || "creator").trim().toLowerCase();
  }

  function readStudioBucket(key, email) {
    try {
      const all = JSON.parse(localStorage.getItem(key) || "{}");
      const row = all[studioEmailKey(email)];
      return Array.isArray(row) ? row : null;
    } catch {
      return null;
    }
  }

  function writeStudioBucket(key, email, rows) {
    let all = {};
    try { all = JSON.parse(localStorage.getItem(key) || "{}"); } catch { all = {}; }
    all[studioEmailKey(email)] = rows;
    localStorage.setItem(key, JSON.stringify(all));
  }

  function rememberBlob(id, blob, preferredName) {
    const prev = studioBlobs.get(id);
    if (prev?.url) {
      try { URL.revokeObjectURL(prev.url); } catch { /* ignore */ }
    }
    const file = blob instanceof File
      ? blob
      : new File([blob], preferredName || "file", { type: blob.type || "application/octet-stream" });
    const url = URL.createObjectURL(file);
    studioBlobs.set(id, { blob: file, url });
    return url;
  }

  function blobUrlFor(id) {
    return studioBlobs.get(id)?.url || "";
  }

  function ensureDemoBlob(id, name, mime, text) {
    if (studioBlobs.has(id)) return blobUrlFor(id);
    const body = text || `Bizgarh demo file: ${name}`;
    return rememberBlob(id, new Blob([body], { type: mime || "text/plain" }), name);
  }

  function isVideoFile(file) {
    const name = String(file?.name || "").toLowerCase();
    const type = String(file?.type || "").toLowerCase();
    if (type.startsWith("video/")) return true;
    return /\.(mp4|webm|mov|m4v|avi|mkv|ogv)$/.test(name);
  }

  function fmtBytes(n) {
    const v = Number(n) || 0;
    if (v < 1024) return v + " B";
    if (v < 1024 * 1024) return (v / 1024).toFixed(1).replace(/\.0$/, "") + " KB";
    return (v / (1024 * 1024)).toFixed(1).replace(/\.0$/, "") + " MB";
  }

  function isStudioDemoRow(r) {
    if (!r || typeof r !== "object") return true;
    if (r.demo) return true;
    const id = String(r.id || "");
    // Legacy V1 seeds often omitted demo:true (esp. editing queue).
    if (/^(eq|script|rec|lib)_demo/i.test(id) || /_demo_/i.test(id)) return true;
    return false;
  }

  function studioRealRows(key, email) {
    const existing = readStudioBucket(key, email);
    if (!existing) {
      writeStudioBucket(key, email, []);
      return [];
    }
    const real = existing.filter((r) => !isStudioDemoRow(r));
    if (real.length !== existing.length) writeStudioBucket(key, email, real);
    return real;
  }

  function studioScripts(email) {
    return studioRealRows(STUDIO_SCRIPTS_KEY, email);
  }

  function studioRecordings(email) {
    return studioRealRows(STUDIO_RECORDINGS_KEY, email);
  }

  function studioQueue(email) {
    return studioRealRows(STUDIO_QUEUE_KEY, email);
  }

  function studioLibrary(email) {
    return studioRealRows(STUDIO_LIBRARY_KEY, email);
  }

  function downloadStudioBlob(id, fallbackName) {
    const entry = studioBlobs.get(id);
    if (!entry) {
      alert("File is only available for download in this browser session after upload (or as demo seed).");
      return;
    }
    const a = document.createElement("a");
    a.href = entry.url;
    a.download = entry.blob.name || fallbackName || "download";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function dropzoneHTML(kind, accept, hint) {
    return `<div class="crm-dropzone" data-studio-drop="${esc(kind)}" tabindex="0" role="button" aria-label="${esc(hint)}">
      <input type="file" class="crm-drop-input" data-studio-file="${esc(kind)}" accept="${esc(accept)}" multiple hidden>
      <div class="crm-drop-visual">
        <span class="crm-drop-ico">${icon(kind === "recordings" ? "clapper" : "file")}</span>
        <strong>Drag &amp; drop files here</strong>
        <p>${esc(hint)}</p>
        <button type="button" class="crm-btn crm-btn-ghost crm-drop-browse" data-studio-browse="${esc(kind)}" style="width:auto;padding:8px 14px">Browse files</button>
      </div>
    </div>`;
  }

  function fileListHTML(kind, rows) {
    if (!rows.length) {
      const empty = kind === "scripts"
        ? "No scripts yet — the Bizgarh team will share files here."
        : kind === "study"
          ? "No study materials yet — drop a PDF, DOC, or image to get started."
          : "No files yet — drop a video to get started.";
      return `<div class="crm-file-empty">${empty}</div>`;
    }
    return `<ul class="crm-file-list">${rows.map((r) => {
      const when = r.uploadedAt ? fmtDate(r.uploadedAt) : "—";
      return `<li class="crm-file-row" data-studio-row="${esc(r.id)}">
        <div class="crm-file-meta">
          <b title="${esc(r.name)}">${esc(r.name)}</b>
          <span>${esc(fmtBytes(r.size))} · ${esc(when)}${r.demo ? " · demo" : ""}</span>
        </div>
        <div class="crm-file-actions">
          <button type="button" class="crm-btn crm-btn-ghost crm-btn-sm" data-studio-dl="${esc(kind)}" data-id="${esc(r.id)}" data-name="${esc(r.name)}">Download</button>
          <button type="button" class="crm-btn crm-btn-ghost crm-btn-sm crm-btn-danger" data-studio-del="${esc(kind)}" data-id="${esc(r.id)}">Delete</button>
        </div>
      </li>`;
    }).join("")}</ul>`;
  }

  function renderScripts(root, s) {
    const rows = studioScripts(s.email);
    root.innerHTML = `<div class="crm-panel-view crm-studio">
      <section class="crm-section">
        <div class="crm-section-head">
          <div>
            <h3>Scripts</h3>
            <p>Scripts are provided by the Bizgarh team. Download or delete from your list — creators cannot upload here.</p>
          </div>
          <span class="crm-studio-count">${rows.length} file${rows.length === 1 ? "" : "s"}</span>
        </div>
        <div class="crm-file-panel" id="crmStudioScriptsList">${fileListHTML("scripts", rows)}</div>
      </section>
    </div>`;
  }

  function renderRecordings(root, s) {
    const rows = studioRecordings(s.email);
    root.innerHTML = `<div class="crm-panel-view crm-studio">
      <section class="crm-section">
        <div class="crm-section-head">
          <div>
            <h3>Recording Submissions</h3>
            <p>Video formats only (mp4, webm, mov, and similar). Submit takes for the edit desk.</p>
          </div>
          <span class="crm-studio-count">${rows.length} file${rows.length === 1 ? "" : "s"}</span>
        </div>
        ${dropzoneHTML("recordings", VIDEO_ACCEPT, "Accepts mp4, webm, mov, and other video files")}
        <div class="crm-file-panel" id="crmStudioRecordingsList">${fileListHTML("recordings", rows)}</div>
      </section>
    </div>`;
  }

  function editingStatusBadge(status) {
    const label = EDIT_STATUSES.includes(status) ? status : "Under Review";
    const slug = label.toLowerCase().replace(/\s+/g, "-");
    return `<span class="crm-eq-badge crm-eq-badge-${esc(slug)}">${esc(label)}</span>`;
  }

  function renderEditingQueue(root, s) {
    const rows = studioQueue(s.email);
    const body = rows.length
      ? rows.map((r) => `<tr data-eq-id="${esc(r.id)}">
          <td class="crm-eq-title">${esc(r.title)}</td>
          <td>${editingStatusBadge(r.status)}</td>
        </tr>`).join("")
      : `<tr><td colspan="2" class="crm-sheet-empty">No videos in the editing queue</td></tr>`;
    root.innerHTML = `<div class="crm-panel-view crm-studio">
      <section class="crm-section">
        <div class="crm-section-head">
          <div>
            <h3>Editing Queue</h3>
            <p>Status is set by the Bizgarh team — Under Review → Editing → Revision → Completed.</p>
          </div>
          <span class="crm-studio-count">${rows.length} video${rows.length === 1 ? "" : "s"}</span>
        </div>
        <div class="crm-sheet-scroll crm-studio-sheet">
          <table class="crm-sheet-table crm-eq-table">
            <thead><tr><th>Video Title</th><th>Status</th></tr></thead>
            <tbody>${body}</tbody>
          </table>
        </div>
      </section>
    </div>`;
  }

  function libraryThumbHTML(row) {
    // Prefer static poster/thumb — avoid <video> for demo text blobs (native player chrome / empty boxes)
    if (row.thumb) {
      return `<div class="crm-lib-thumb"><img src="${esc(row.thumb)}" alt=""></div>`;
    }
    const url = blobUrlFor(row.id);
    const name = String(row.videoName || row.mime || "");
    const isVid = /\.(mp4|webm|mov|m4v)$/i.test(name) || String(row.mime || "").startsWith("video/");
    const playable = url && isVid && !row.demo;
    if (playable) {
      return `<div class="crm-lib-thumb"><video src="${esc(url)}" muted preload="metadata" playsinline></video></div>`;
    }
    return `<div class="crm-lib-thumb crm-lib-thumb-ph" aria-hidden="true">${icon("clapper")}</div>`;
  }

  function renderContentLibrary(root, s) {
    const rows = studioLibrary(s.email);
    const body = rows.length
      ? rows.map((r) => {
        const pdfUrl = r.pdfId ? blobUrlFor(r.pdfId) : "";
        const pdfCell = r.pdfName
          ? (pdfUrl
            ? `<a class="crm-link" href="${esc(pdfUrl)}" download="${esc(r.pdfName)}">${esc(r.pdfName)}</a>`
            : `<span class="crm-lib-pdf">${esc(r.pdfName)}</span>`)
          : "—";
        return `<tr data-lib-id="${esc(r.id)}">
          <td class="crm-lib-preview-cell">${libraryThumbHTML(r)}</td>
          <td class="crm-lib-title">${esc(r.title)}</td>
          <td class="crm-lib-caption" title="${esc(r.caption || "")}"><span class="crm-lib-caption-text">${esc(r.caption || "—")}</span></td>
          <td>${pdfCell}</td>
          <td class="crm-lib-actions">
            <button type="button" class="crm-btn crm-btn-ghost crm-btn-sm" data-studio-dl="library" data-id="${esc(r.id)}" data-name="${esc(r.videoName || r.title + ".mp4")}">Download</button>
            <button type="button" class="crm-btn crm-btn-ghost crm-btn-sm crm-btn-danger" data-studio-del="library" data-id="${esc(r.id)}">Delete</button>
          </td>
        </tr>`;
      }).join("")
      : `<tr><td colspan="5" class="crm-sheet-empty">Content library is empty</td></tr>`;
    root.innerHTML = `<div class="crm-panel-view crm-studio">
      <section class="crm-section">
        <div class="crm-section-head">
          <div>
            <h3>Content Library</h3>
            <p>Approved cuts with preview, caption, and PDF attachment.</p>
          </div>
          <span class="crm-studio-count">${rows.length} item${rows.length === 1 ? "" : "s"}</span>
        </div>
        <div class="crm-sheet-scroll crm-studio-sheet">
          <table class="crm-sheet-table crm-lib-table">
            <thead>
              <tr>
                <th>Video Preview</th>
                <th>Video title</th>
                <th>Caption</th>
                <th>PDF</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>${body}</tbody>
          </table>
        </div>
      </section>
    </div>`;
  }

  function addStudioFiles(kind, fileList, staff) {
    const files = Array.from(fileList || []);
    if (!files.length || !staff) return;
    // Creators cannot upload scripts — admin/team provides them
    if (kind === "scripts") return;
    if (kind === "recordings") {
      const accepted = files.filter(isVideoFile);
      const rejected = files.length - accepted.length;
      if (!accepted.length) {
        alert("Recording submissions accept video files only.");
        return;
      }
      if (rejected) alert(`${rejected} file(s) skipped — video formats only.`);
      const rows = studioRecordings(staff.email).slice();
      accepted.forEach((f) => {
        const id = studioUid("rec");
        rememberBlob(id, f);
        rows.unshift({
          id,
          name: f.name,
          size: f.size,
          mime: f.type || "video/mp4",
          uploadedAt: new Date().toISOString(),
          demo: false
        });
      });
      writeStudioBucket(STUDIO_RECORDINGS_KEY, staff.email, rows);
      renderRecordings($("#crmView"), staff);
      return;
    }
    if (kind === "study") {
      addStudyFiles(files, staff);
    }
  }

  function deleteStudioItem(kind, id, staff) {
    if (!staff || !id) return;
    if (kind === "scripts") {
      const next = studioScripts(staff.email).filter((r) => r.id !== id);
      writeStudioBucket(STUDIO_SCRIPTS_KEY, staff.email, next);
      const prev = studioBlobs.get(id);
      if (prev?.url) try { URL.revokeObjectURL(prev.url); } catch { /* ignore */ }
      studioBlobs.delete(id);
      renderScripts($("#crmView"), staff);
      return;
    }
    if (kind === "recordings") {
      const next = studioRecordings(staff.email).filter((r) => r.id !== id);
      writeStudioBucket(STUDIO_RECORDINGS_KEY, staff.email, next);
      const prev = studioBlobs.get(id);
      if (prev?.url) try { URL.revokeObjectURL(prev.url); } catch { /* ignore */ }
      studioBlobs.delete(id);
      renderRecordings($("#crmView"), staff);
      return;
    }
    if (kind === "library") {
      const row = studioLibrary(staff.email).find((r) => r.id === id);
      const next = studioLibrary(staff.email).filter((r) => r.id !== id);
      writeStudioBucket(STUDIO_LIBRARY_KEY, staff.email, next);
      [id, row?.pdfId].filter(Boolean).forEach((bid) => {
        const prev = studioBlobs.get(bid);
        if (prev?.url) try { URL.revokeObjectURL(prev.url); } catch { /* ignore */ }
        studioBlobs.delete(bid);
      });
      renderContentLibrary($("#crmView"), staff);
      return;
    }
    if (kind === "study") {
      deleteStudyItem(id, staff);
    }
  }


  function socialLinks(email) {
    try {
      const all = JSON.parse(localStorage.getItem(SOCIAL_KEY) || "{}");
      const row = all[email] || all[String(email || "").toLowerCase()] || {};
      return {
        youtube: row.youtube || "",
        instagram: row.instagram || "",
        facebook: row.facebook || ""
      };
    } catch {
      return { youtube: "", instagram: "", facebook: "" };
    }
  }

  function saveSocialLinks(email, links) {
    let all = {};
    try { all = JSON.parse(localStorage.getItem(SOCIAL_KEY) || "{}"); } catch { all = {}; }
    all[email] = links;
    localStorage.setItem(SOCIAL_KEY, JSON.stringify(all));
  }

  function socialCache(email) {
    try {
      const all = JSON.parse(localStorage.getItem(SOCIAL_CACHE_KEY) || "{}");
      return all[email] || {};
    } catch { return {}; }
  }

  function saveSocialCache(email, platforms) {
    let all = {};
    try { all = JSON.parse(localStorage.getItem(SOCIAL_CACHE_KEY) || "{}"); } catch { all = {}; }
    all[email] = platforms;
    localStorage.setItem(SOCIAL_CACHE_KEY, JSON.stringify(all));
  }

  function icon(name) {
    const paths = {
      dash: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
      user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 19c1.2-3.2 3.5-5 7-5s5.8 1.8 7 5"/>',
      posts: '<path d="M5 5h14v14H5z"/><path d="M8 9h8M8 12h8M8 15h5"/>',
      feeds: '<path d="M5 7h14M5 12h14M5 17h10"/>',
      followers: '<circle cx="9" cy="8" r="3"/><circle cx="16" cy="9" r="2.4"/><path d="M4 19c.4-3 2.4-5 5-5s4.6 2 5 5"/><path d="M14 19c.2-2 1.4-3.4 3.4-3.6"/>',
      link: '<path d="M9 12a4 4 0 0 1 0-5.7l1.4-1.4a4 4 0 0 1 5.7 5.7L15 12"/><path d="M15 12a4 4 0 0 1 0 5.7l-1.4 1.4a4 4 0 1 1-5.7-5.7L9 12"/>',
      channels: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M10 9.5v5l5-2.5-5-2.5Z"/>',
      settings: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
      bell: '<path d="M6.4 16h11.2"/><path d="M7 16v-5.1a5 5 0 0 1 10 0V16"/><path d="M10.2 16.2a1.8 1.8 0 0 0 3.6 0"/>',
      cap: '<path d="M3 10 12 5l9 5-9 5-9-5Z"/><path d="M7 12v4c0 1.5 2.2 3 5 3s5-1.5 5-3v-4"/>',
      pulse: '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
      wallet: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><circle cx="16" cy="14" r="1.4"/>',
      file: '<path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v5h5"/>',
      scissors: '<circle cx="7" cy="7" r="2.5"/><circle cx="7" cy="17" r="2.5"/><path d="m10 8 10 10M10 16 20 6"/>',
      eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
      eyeOff: '<path d="M3 3l18 18"/><path d="M10.6 10.6a2.5 2.5 0 0 0 3.5 3.5"/><path d="M9.9 5.1A10.4 10.4 0 0 1 12 4.8c6.5 0 10 7.2 10 7.2a17.4 17.4 0 0 1-4.1 4.7"/><path d="M6.1 6.1C3.7 7.7 2 12 2 12s3.5 7.2 10 7.2a10.2 10.2 0 0 0 4.1-.9"/>',
      check: '<path d="m6.5 12.2 3.4 3.4 7.6-7.6"/>',
      menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
      clapper: '<path d="M4 10h16v10H4z"/><path d="m4 10 3.2-5.2 3 1.8L7 10"/><path d="m10.2 6.6 3 1.8L10.8 14"/><path d="m16.2 6.4 3.2 1.9L17 10"/><path d="M4 14h16"/>',
      book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v16H6.5A2.5 2.5 0 0 0 4 21.5Z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v16h5.5A2.5 2.5 0 0 1 20 21.5Z"/>',
      life: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.2"/><path d="M12 3v5.5M12 15.5V21M3 12h5.5M15.5 12H21"/>',
      chevron: '<path d="m6 9 6 6 6-6"/>',
      yt: '<path fill="currentColor" d="M23.5 7.2a2.9 2.9 0 0 0-2-2C19.5 4.7 12 4.7 12 4.7s-7.5 0-9.5.5a2.9 2.9 0 0 0-2 2A30 30 0 0 0 .1 12a30 30 0 0 0 .4 4.8 2.9 2.9 0 0 0 2 2c2 .5 9.5.5 9.5.5s7.5 0 9.5-.5a2.9 2.9 0 0 0 2-2A30 30 0 0 0 23.9 12a30 30 0 0 0-.4-4.8ZM9.8 15.5V8.5L16 12l-6.2 3.5Z"/>',
      ig: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/>',
      fb: '<path fill="currentColor" d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.6L16 12h-3v-2c0-.6.4-1 1-1Z"/>'
    };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.dash}</svg>`;
  }

  function getTheme() {
    try {
      const t = localStorage.getItem(THEME_KEY);
      return t === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  }

  function prefersReduceMotion() {
    try {
      return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch {
      return false;
    }
  }

  /**
   * Structurally guarantee the dual-layer mesh exists and is animating.
   * Survives hard refresh, theme toggle, login↔desk, and accidental DOM loss.
   */
  function ensureCrmMesh(opts) {
    const restart = !!(opts && opts.restart);
    const reduce = prefersReduceMotion();
    document.documentElement.setAttribute("data-crm-reduce-motion", reduce ? "1" : "0");

    let mesh = document.getElementById("crmMesh") || document.querySelector(".crm-mesh");
    if (!mesh) {
      mesh = document.createElement("div");
      mesh.className = "crm-mesh";
      mesh.id = "crmMesh";
      mesh.setAttribute("aria-hidden", "true");
      document.body.insertBefore(mesh, document.body.firstChild);
    } else if (mesh.parentElement !== document.body || mesh !== document.body.firstElementChild) {
      document.body.insertBefore(mesh, document.body.firstChild);
    }

    let layerA = mesh.querySelector(".crm-mesh-layer-a");
    let layerB = mesh.querySelector(".crm-mesh-layer-b");
    let waves = mesh.querySelector(".crm-mesh-waves");
    if (!layerA) {
      layerA = document.createElement("div");
      layerA.className = "crm-mesh-layer crm-mesh-layer-a";
      mesh.appendChild(layerA);
    }
    if (!layerB) {
      layerB = document.createElement("div");
      layerB.className = "crm-mesh-layer crm-mesh-layer-b";
      mesh.appendChild(layerB);
    }
    if (!waves) {
      waves = document.createElement("div");
      waves.className = "crm-mesh-waves";
      waves.setAttribute("aria-hidden", "true");
      mesh.appendChild(waves);
    }

    // Keep backdrop base in sync with theme (FOUC + inline style)
    const base = getTheme() === "light" ? "#eef8ff" : "#0c1834";
    document.documentElement.style.background = base;
    mesh.style.backgroundColor = base;

    if (reduce) {
      mesh.classList.remove("is-restarting");
      return mesh;
    }

    const kick = () => {
      mesh.classList.add("is-restarting");
      // Force reflow so removing the class restarts CSS animations
      void mesh.offsetWidth;
      mesh.classList.remove("is-restarting");
      [layerA, layerB, waves].forEach((el) => {
        if (!el) return;
        el.style.animationPlayState = "running";
      });
    };

    if (restart) kick();
    else {
      // Ensure play-state even without a full restart
      [layerA, layerB, waves].forEach((el) => {
        if (!el) return;
        el.style.animationPlayState = "running";
      });
    }
    return mesh;
  }

  function applyTheme(theme) {
    const next = theme === "light" ? "light" : "dark";
    const prev = document.documentElement.getAttribute("data-crm-theme");
    const changed = prev !== next;
    try { localStorage.setItem(THEME_KEY, next); } catch { /* ignore */ }
    document.documentElement.setAttribute("data-crm-theme", next);
    document.documentElement.style.colorScheme = next;
    document.documentElement.style.background = next === "light" ? "#eef8ff" : "#0c1834";
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) meta.setAttribute("content", next);
    $$(".crm-theme-toggle").forEach((el) => el.setAttribute("data-theme", next));
    // Only hard-restart on real theme flips — renderShell() calls applyTheme every nav
    ensureCrmMesh({ restart: changed });
  }

  function themeToggleHTML(id) {
    const t = getTheme();
    return `<button type="button" class="crm-theme-toggle" id="${esc(id || "")}" data-theme="${t}" aria-label="Theme toggle" title="Switch theme">
      <span class="crm-theme-knob" aria-hidden="true"></span>
      <span class="crm-theme-opt" data-val="dark">DARK</span>
      <span class="crm-theme-opt" data-val="light">LIGHT</span>
    </button>`;
  }

  function clearLoginFields() {
    const email = $("#crmEmail");
    const pass = $("#crmPassword");
    const totp = $("#crmTotp");
    if (email) {
      email.value = "";
      email.removeAttribute("value");
      email.setAttribute("autocomplete", "off");
      email.setAttribute("readonly", "readonly");
      setTimeout(() => { try { email.removeAttribute("readonly"); } catch { /* ignore */ } }, 50);
    }
    if (pass) {
      pass.value = "";
      pass.removeAttribute("value");
      pass.setAttribute("autocomplete", "new-password");
    }
    if (totp) totp.value = "";
  }

  function showLogin(errMsg) {
    const login = $("#crmLogin");
    const app = $("#crmApp");
    if (login) login.classList.remove("crm-hidden");
    if (app) app.classList.add("crm-hidden");
    clearLoginFields();
    const err = $("#crmLoginErr");
    if (err) err.textContent = errMsg || "";
    ensureCrmMesh({ restart: true });
  }

  function showApp() {
    const login = $("#crmLogin");
    const app = $("#crmApp");
    if (login) login.classList.add("crm-hidden");
    if (app) app.classList.remove("crm-hidden");
    renderShell();
    ensureCrmMesh({ restart: true });
  }

  function navSections() {
    return [
      {
        id: "overview",
        label: "Overview",
        icon: "dash",
        items: [
          { id: "dashboard", label: "Dashboard" },
          { id: "analytics", label: "Analytics" },
          { id: "students", label: "Students" }
        ]
      },
      {
        id: "creator-studio",
        label: "Creator Studio",
        icon: "clapper",
        items: [
          { id: "scripts", label: "Scripts" },
          { id: "recording-submissions", label: "Recording Submissions" },
          { id: "editing-queue", label: "Editing Queue" },
          { id: "content-library", label: "Content Library" }
        ]
      },
      {
        id: "finance",
        label: "Finance",
        icon: "wallet",
        items: [
          { id: "today-revenue", label: "Today Revenue" },
          { id: "commission", label: "Commission" },
          { id: "pending-payout", label: "Pending Payout" },
          { id: "payout", label: "Payout" },
          { id: "revenue-reports", label: "Revenue Reports" }
        ]
      },
      {
        id: "courses-learning",
        label: "Courses & Learning",
        icon: "book",
        items: [
          { id: "courses", label: "Courses" },
          { id: "mentorship", label: "Mentorship" },
          { id: "webinars", label: "Webinars" }
        ]
      },
      {
        id: "support",
        label: "Support",
        icon: "life",
        items: [
          { id: "tickets", label: "Tickets" },
          { id: "queries", label: "Queries" }
        ]
      },
      {
        id: "settings",
        label: "Settings",
        icon: "settings",
        items: [
          { id: "theme", label: "Theme", action: "theme-sidebar" },
          { id: "profile", label: "Profile" },
          { id: "logout", label: "Logout", action: "logout" }
        ]
      }
    ];
  }

  function flatNavItems() {
    return navSections().flatMap((sec) => sec.items.map((it) => ({ ...it, section: sec.id })));
  }

  function findNavItem(id) {
    return flatNavItems().find((n) => n.id === id) || null;
  }

  function sectionForView(view) {
    const hit = findNavItem(view);
    return hit ? hit.section : "overview";
  }

  function getOpenSection(view) {
    // Prefer the section that owns the current view so nav always reveals context.
    // Accordion clicks update DOM until the next shell render.
    try {
      const saved = localStorage.getItem(ACCORDION_KEY);
      if (saved && navSections().some((s) => s.id === saved)) {
        const owned = sectionForView(view);
        if (!owned || saved === owned) return saved;
      }
    } catch { /* ignore */ }
    return sectionForView(view) || "overview";
  }

  function setOpenSection(id) {
    try {
      if (id) localStorage.setItem(ACCORDION_KEY, id);
      else localStorage.removeItem(ACCORDION_KEY);
    } catch { /* ignore */ }
  }

  function unreadNotes(email) {
    if (typeof myNotes !== "function") return [];
    return myNotes(email).filter((n) => !n.read).slice(0, 20);
  }

  function currentView() {
    const h = String(location.hash || "").replace(/^#/, "").trim();
    if (!h || h === "settings" || h === "theme" || h === "logout") return "dashboard";
    // Review & Approval removed — flow lives in Editing Queue + Content Library
    if (h === "review-approval") return "editing-queue";
    // desk202 renames / removals
    if (h === "assignments" || h === "classroom-lms") return "courses";
    if (h === "revenue-orders" || h === "refunds" || h === "pending-payments") return "today-revenue";
    if (h === "commissions") return "commission";
    if (h === "payouts") return "payout";
    return h;
  }

  function goView(id) {
    const next = String(id || "dashboard").replace(/^#/, "");
    if (next === "logout") {
      doLogout();
      return;
    }
    // Theme lives only in the sidebar toggle — never open a main Theme panel
    if (next === "theme") {
      setOpenSection("settings");
      if (String(location.hash || "").replace(/^#/, "") === "theme") location.hash = "dashboard";
      renderShell();
      return;
    }
    if (currentView() === next) {
      renderShell();
      return;
    }
    location.hash = next;
    // hashchange may be ignored in some automation hosts — render explicitly
    renderShell();
  }

  function doLogout() {
    if (typeof AdminCore !== "undefined" && AdminCore.logout) AdminCore.logout();
    else if (typeof clearStaffSession === "function") clearStaffSession();
    location.hash = "";
    showLogin();
  }

  function renderSideNav(view) {
    const side = $("#crmSideNav");
    if (!side) return;
    const openId = getOpenSection(view);
    side.innerHTML = navSections().map((sec) => {
      const open = sec.id === openId;
      const subs = sec.items.map((it) => {
        if (it.id === "theme" || it.action === "theme-sidebar") {
          return `<div class="crm-nav-theme-wrap">
            <div class="crm-nav-theme-label"><span>${esc(it.label)}</span></div>
            <div class="crm-nav-theme-row">${themeToggleHTML("crmThemeSide")}</div>
          </div>`;
        }
        return `<button type="button" data-crm-nav="${it.id}" class="${view === it.id ? "on" : ""}"><span>${esc(it.label)}</span></button>`;
      }).join("");
      return `<div class="crm-nav-group${open ? " open" : ""}" data-crm-section="${sec.id}">
        <button type="button" class="crm-nav-head" data-crm-accordion="${sec.id}" aria-expanded="${open ? "true" : "false"}">
          <span class="crm-nav-ico">${icon(sec.icon)}</span>
          <span class="crm-nav-label">${esc(sec.label)}</span>
        </button>
        <div class="crm-nav-sub">${subs}</div>
      </div>`;
    }).join("");
  }

  function renderShell() {
    const s = session();
    if (!s) return showLogin();
    applyTheme(getTheme());
    const view = currentView();
    setOpenSection(sectionForView(view));
    renderSideNav(view);
    const title = $("#crmPageTitle");
    const sub = $("#crmPageSub");
    const nav = findNavItem(view);
    const label = nav?.label || "Dashboard";
    if (title) title.textContent = label;
    if (sub) {
      if (view === "dashboard") sub.textContent = "Creator-scoped metrics for your classrooms";
      else if (view === "analytics") sub.textContent = "Student and revenue analytics with spreadsheet detail sheets";
      else if (view === "students") sub.textContent = "Full student roster — open any row for the complete profile";
      else if (view === "profile") sub.textContent = "Display name · locked ID/referral · social API connect";
      else if (view === "scripts") sub.textContent = "Scripts from the Bizgarh team — download or delete anytime";
      else if (view === "recording-submissions") sub.textContent = "Drop raw video takes for the editing desk";
      else if (view === "editing-queue") sub.textContent = "View status for each cut — team updates the queue";
      else if (view === "content-library") sub.textContent = "Approved videos, captions, and PDF attachments";
      else if (view === "review-approval") sub.textContent = "Covered by Editing Queue and Content Library";
      else if (view === "today-revenue") sub.textContent = "Today revenue with nested View detail";
      else if (view === "commission" || view === "pending-payout" || view === "payout" || view === "revenue-reports") sub.textContent = "Excel-style finance ledger";
      else if (view === "courses") sub.textContent = "Your course cards — open for overview (no Buy Now)";
      else if (view === "mentorship") sub.textContent = "Your mentorship desks";
      else if (view === "webinars") sub.textContent = "Your live webinars";
      else if (view === "tickets") sub.textContent = "Raise and track support tickets";
      else if (view === "queries") sub.textContent = "Creator FAQs";
      else sub.textContent = "Creator CRM module";
    }
    const who = $("#crmWho");
    if (who) {
      const label = creatorHeaderLabel(s);
      who.setAttribute("role", "button");
      who.setAttribute("tabindex", "0");
      who.setAttribute("data-crm-open-profile", "1");
      who.setAttribute("aria-label", "Open profile");
      who.title = "Open profile";
      who.innerHTML = `
        <img src="${esc(creatorAvatar(label.linked))}" alt="">
        <span><b>${esc(label.name)}</b><small>${esc(label.loginId)}</small></span>`;
    }
    const badge = $("#crmBellBadge");
    const notes = unreadNotes(s.email);
    if (badge) {
      badge.textContent = notes.length ? String(notes.length) : "";
      badge.classList.toggle("crm-hidden", !notes.length);
    }
    renderView(view);
  }


  /* ——— desk202: Finance / Course Learning / Support / Profile helpers ——— */

  function socialApiState(email) {
    try {
      const all = JSON.parse(localStorage.getItem(SOCIAL_API_KEY) || "{}");
      const row = all[String(email || "").toLowerCase()] || {};
      return {
        youtube: !!row.youtube,
        instagram: !!row.instagram,
        facebook: !!row.facebook
      };
    } catch {
      return { youtube: false, instagram: false, facebook: false };
    }
  }

  function saveSocialApiState(email, next) {
    let all = {};
    try { all = JSON.parse(localStorage.getItem(SOCIAL_API_KEY) || "{}"); } catch { all = {}; }
    all[String(email || "").toLowerCase()] = {
      youtube: !!next.youtube,
      instagram: !!next.instagram,
      facebook: !!next.facebook
    };
    localStorage.setItem(SOCIAL_API_KEY, JSON.stringify(all));
  }

  function profileExtras(email) {
    try {
      const all = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
      return all[String(email || "").toLowerCase()] || {};
    } catch { return {}; }
  }

  function saveProfileExtras(email, next) {
    let all = {};
    try { all = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}"); } catch { all = {}; }
    all[String(email || "").toLowerCase()] = { ...(all[String(email || "").toLowerCase()] || {}), ...next };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(all));
  }

  function readStudyBucket(email) {
    return readStudioBucket(STUDY_KEY, email);
  }

  function writeStudyBucket(email, rows) {
    writeStudioBucket(STUDY_KEY, email, rows);
  }

  function studyMaterials(email) {
    const existing = readStudyBucket(email);
    if (!Array.isArray(existing)) {
      writeStudyBucket(email, []);
      return [];
    }
    const real = existing.filter((r) => !isStudioDemoRow(r));
    if (real.length !== existing.length) writeStudyBucket(email, real);
    return real;
  }

  function readTickets(email) {
    try {
      const all = JSON.parse(localStorage.getItem(TICKETS_KEY) || "{}");
      const rows = all[String(email || "").toLowerCase()];
      return Array.isArray(rows) ? rows : [];
    } catch { return []; }
  }

  function writeTickets(email, rows) {
    let all = {};
    try { all = JSON.parse(localStorage.getItem(TICKETS_KEY) || "{}"); } catch { all = {}; }
    all[String(email || "").toLowerCase()] = rows;
    localStorage.setItem(TICKETS_KEY, JSON.stringify(all));
  }

  function creatorCommissionRate(staff) {
    if (typeof AdminCore !== "undefined" && AdminCore.normalizeStaff) {
      const n = AdminCore.normalizeStaff(staff);
      const r = Number(n?.commissionRate || n?.rate || 0);
      if (r) return r;
    }
    return 20;
  }

  function buildFinanceBundle(staff) {
    const orders = creatorOrders(staff).slice().sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0));
    const paid = orders.filter((o) => String(o.status || "").toUpperCase() === "PAID");
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayPaid = paid.filter((o) => new Date(o.at || 0).getTime() >= todayStart.getTime());
    const todayRevenue = todayPaid.reduce((s, o) => s + Number(o.net || o.amount || 0), 0);
    const rate = creatorCommissionRate(staff);

    // Commission lines: course commission + referral income style rows
    let commissions = [];
    if (typeof AdminCore !== "undefined" && AdminCore.commissions) {
      commissions = AdminCore.commissions().filter((c) => c.creatorEmail === staff.email);
    }
    if (!commissions.length) {
      // Derive only from real paid orders — no invented referral/demo lines.
      commissions = paid.map((o, i) => {
        const gross = Number(o.net || o.amount || 0);
        const amount = Math.round(gross * (rate / 100));
        return {
          id: "cm-" + (o.id || i),
          type: "Course commission",
          source: courseTitle(o.courseId),
          name: o.name || "—",
          email: o.email || "—",
          course: courseTitle(o.courseId),
          courseId: o.courseId,
          gross,
          rate,
          amount,
          status: "ACCRUED",
          at: o.at
        };
      });
    } else {
      commissions = commissions.map((c, i) => ({
        id: c.id || c.orderId || ("cm-" + i),
        type: c.type || (i % 4 === 0 ? "Referral income" : "Course commission"),
        source: c.source || c.course || courseTitle(c.courseId) || (c.referralCode || "—"),
        name: c.name || c.student || "—",
        email: c.email || c.studentEmail || "—",
        course: c.course || courseTitle(c.courseId),
        courseId: c.courseId || "",
        gross: Number(c.gross || c.amount || 0),
        rate: Number(c.rate || rate),
        amount: Number(c.final || c.amount || 0),
        status: c.status || "ACCRUED",
        at: c.created || c.at
      }));
    }
    const commissionTotal = commissions.reduce((s, c) => s + Number(c.amount || 0), 0);

    // Pending / paid payouts — month-oriented rows
    let payoutRows = [];
    if (typeof payouts === "function") {
      payoutRows = payouts().filter((p) => String(p.email || "").toLowerCase() === String(staff.email || "").toLowerCase());
    }
    // Empty payout ledger until control / payouts store has real rows.
    const mappedPayouts = payoutRows.map((p) => {
      const at = p.at || p.created;
      const month = p.month || (at ? new Date(at).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—");
      return {
        id: p.id,
        month,
        course: p.course || p.note || "Course commission",
        amount: Number(p.amount || 0),
        status: String(p.status || "pending").toUpperCase(),
        method: p.method || "upi",
        at,
        note: p.note || p.ref || "—"
      };
    });
    const pendingRows = mappedPayouts.filter((r) => r.status === "PENDING" || r.status === "SCHEDULED");
    const paidOutRows = mappedPayouts.filter((r) => r.status === "PAID");

    // Revenue reports: per-month detail
    const byMonth = new Map();
    paid.forEach((o) => {
      const t = new Date(o.at || 0);
      if (!Number.isFinite(t.getTime()) || !t.getTime()) return;
      const key = t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0");
      const label = t.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
      const row = byMonth.get(key) || { monthKey: key, month: label, orders: 0, revenue: 0, students: new Set() };
      row.orders += 1;
      row.revenue += Number(o.net || o.amount || 0);
      if (o.email) row.students.add(String(o.email).toLowerCase());
      byMonth.set(key, row);
    });
    let monthReport = Array.from(byMonth.values())
      .sort((a, b) => b.monthKey.localeCompare(a.monthKey))
      .map((r) => ({
        month: r.month,
        orders: r.orders,
        students: r.students.size,
        revenue: r.revenue,
        avgOrder: r.orders ? Math.round(r.revenue / r.orders) : 0
      }));
    // Keep month report empty when there are no paid sales.

    return {
      todayRevenue,
      todayPaid,
      todayRows: todayPaid.map((o) => ({
        id: o.id,
        name: o.name || "—",
        email: o.email || "—",
        course: courseTitle(o.courseId),
        amount: Number(o.net || o.amount || 0),
        method: o.method || "upi",
        at: o.at,
        status: o.status || "PAID"
      })),
      commissions,
      commissionTotal,
      rate,
      pendingPayout: pendingRows.reduce((s, p) => s + Number(p.amount || 0), 0),
      paidPayout: paidOutRows.reduce((s, p) => s + Number(p.amount || 0), 0),
      pendingRows,
      paidOutRows,
      payoutRows: mappedPayouts,
      monthReport,
      periodRevenue: paid.filter((o) => inLastDays(o.at, DEFAULT_PERIOD)).reduce((s, o) => s + Number(o.net || o.amount || 0), 0)
    };
  }

  const FINANCE_TABLES = {
    commission: {
      title: "Commission",
      blurb: "What you earned — course commission and referral income line items.",
      columns: [
        { key: "type", label: "Type" },
        { key: "source", label: "Source" },
        { key: "name", label: "Student" },
        { key: "gross", label: "Gross", fmt: "inr" },
        { key: "rate", label: "Rate %", fmt: "pct" },
        { key: "amount", label: "Earned", fmt: "inr" },
        { key: "status", label: "Status" },
        { key: "at", label: "Date", fmt: "date" }
      ],
      rows: (b) => b.commissions
    },
    "pending-payout": {
      title: "Pending Payout",
      blurb: "Recent month amounts awaiting approval or the next payout window.",
      columns: [
        { key: "month", label: "Month" },
        { key: "course", label: "Source" },
        { key: "amount", label: "Amount", fmt: "inr" },
        { key: "status", label: "Status" },
        { key: "method", label: "Method" },
        { key: "at", label: "Raised", fmt: "date" },
        { key: "note", label: "Note" }
      ],
      rows: (b) => b.pendingRows
    },
    payout: {
      title: "Payout",
      blurb: "Historical course-commission payouts already paid out.",
      columns: [
        { key: "month", label: "Month" },
        { key: "course", label: "Course / source" },
        { key: "amount", label: "Paid", fmt: "inr" },
        { key: "method", label: "Method" },
        { key: "at", label: "Paid on", fmt: "date" },
        { key: "note", label: "Note" },
        { key: "status", label: "Status" }
      ],
      rows: (b) => b.paidOutRows
    },
    "revenue-reports": {
      title: "Revenue Reports",
      blurb: "Per-month revenue detail for your attributed sales.",
      columns: [
        { key: "month", label: "Month" },
        { key: "orders", label: "Orders" },
        { key: "students", label: "Students" },
        { key: "revenue", label: "Revenue", fmt: "inr" },
        { key: "avgOrder", label: "Avg order", fmt: "inr" }
      ],
      rows: (b) => b.monthReport
    }
  };

  const FINANCE_SHEETS = {
    "today-revenue": {
      title: "Today Revenue",
      columns: [
        { key: "id", label: "Order ID" },
        { key: "name", label: "Student" },
        { key: "email", label: "Email" },
        { key: "course", label: "Course" },
        { key: "amount", label: "Amount", fmt: "inr" },
        { key: "method", label: "Method" },
        { key: "at", label: "Paid at", fmt: "date" },
        { key: "status", label: "Status" }
      ],
      rows: (b) => b.todayRows,
      deep: {
        title: "Today Revenue — In-depth",
        columns: [
          { key: "id", label: "Order ID" },
          { key: "name", label: "Student" },
          { key: "email", label: "Email" },
          { key: "course", label: "Course" },
          { key: "amount", label: "Amount", fmt: "inr" },
          { key: "method", label: "Method" },
          { key: "at", label: "Paid at", fmt: "date" },
          { key: "status", label: "Status" }
        ],
        rows: (b) => b.todayRows
      }
    }
  };

  function openFinanceSheet(sheetId, staff, level) {
    const def = FINANCE_SHEETS[sheetId];
    if (!def) return;
    const lvl = level === 2 ? 2 : 1;
    const deep = lvl === 2 && def.deep ? def.deep : null;
    const view = deep || def;
    const bundle = buildFinanceBundle(staff);
    const rows = (view.rows ? view.rows(bundle) : []) || [];
    const subtitle = deep
      ? `${rows.length} row${rows.length === 1 ? "" : "s"} · in-depth spreadsheet`
      : `${rows.length} row${rows.length === 1 ? "" : "s"} · spreadsheet detail`;
    const actions = deep
      ? `<button type="button" class="crm-btn crm-btn-ghost" data-crm-fin-back="${esc(sheetId)}" style="width:auto;padding:6px 12px">Back</button>
         <button type="button" class="crm-btn crm-btn-ghost" data-crm-sheet-close style="width:auto;padding:6px 12px">Close</button>`
      : `<button type="button" class="crm-btn crm-btn-ghost" data-crm-fin-deep="${esc(sheetId)}" style="width:auto;padding:6px 12px">View detail</button>
         <button type="button" class="crm-btn crm-btn-ghost" data-crm-sheet-close style="width:auto;padding:6px 12px">Close</button>`;
    let overlay = $("#crmSheetOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "crmSheetOverlay";
      overlay.className = "crm-sheet-overlay";
      document.body.appendChild(overlay);
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeAnalyticsSheet();
      });
    }
    overlay.dataset.sheetId = sheetId;
    overlay.dataset.sheetLevel = String(lvl);
    overlay.dataset.sheetKind = "finance";
    overlay.innerHTML = `
      <div class="crm-sheet-panel${deep ? " crm-sheet-panel-deep" : ""}" role="dialog" aria-modal="true" aria-label="${esc(view.title)}">
        <header class="crm-sheet-head">
          <div>
            <h2>${esc(view.title)}</h2>
            <p>${subtitle}</p>
          </div>
          <div class="crm-sheet-actions">${actions}</div>
        </header>
        ${sheetTableHTML(view, rows)}
      </div>`;
  }

  function renderFinanceTableView(root, s, view) {
    const def = FINANCE_TABLES[view];
    if (!def) return;
    const b = buildFinanceBundle(s);
    const rows = def.rows(b) || [];
    root.innerHTML = `
      <div class="crm-panel-view crm-finance crm-finance-table">
        <div class="crm-welcome">
          <div>
            <h2>${esc(def.title)}</h2>
            <p>${esc(def.blurb)}</p>
          </div>
          <span class="crm-studio-count">${rows.length} row${rows.length === 1 ? "" : "s"}</span>
        </div>
        <section class="crm-section">
          <div class="crm-section-head">
            <div>
              <h3>${esc(def.title)}</h3>
              <p>Excel-style ledger for this desk.</p>
            </div>
          </div>
          ${sheetTableHTML(def, rows)}
        </section>
      </div>`;
  }

  function renderFinance(root, s, view) {
    if (view === "commission" || view === "pending-payout" || view === "payout" || view === "revenue-reports") {
      return renderFinanceTableView(root, s, view);
    }
    const b = buildFinanceBundle(s);
    root.innerHTML = `
      <div class="crm-panel-view crm-analytics crm-finance">
        <div class="crm-welcome">
          <div>
            <h2>Today Revenue</h2>
            <p>Paid orders since midnight — open View detail for the spreadsheet.</p>
          </div>
        </div>
        <section class="crm-section crm-analytics-block">
          <div class="crm-metrics crm-analytics-metrics" style="grid-template-columns:minmax(0,1fr)">
            <article class="crm-metric crm-analytics-card on">
              <div class="crm-metric-head"><span>Today Revenue</span><div class="crm-metric-ico cyan">${icon("wallet")}</div></div>
              <b>${esc(inrCompact(b.todayRevenue))}</b>
              <div class="crm-metric-foot"><span class="crm-delta flat">${b.todayPaid.length} paid order${b.todayPaid.length === 1 ? "" : "s"} since midnight</span></div>
              <button type="button" class="crm-view-detail" data-crm-fin-sheet="today-revenue">View detail</button>
            </article>
          </div>
        </section>
        <section class="crm-section">
          <div class="crm-section-head">
            <div>
              <h3>Today Revenue sheet</h3>
              <p>Preview rows — open View detail for the nested spreadsheet.</p>
            </div>
            <button type="button" class="crm-link-btn" data-crm-fin-sheet="today-revenue">View all</button>
          </div>
          ${sheetTableHTML(FINANCE_SHEETS["today-revenue"], b.todayRows, 8)}
        </section>
      </div>`;
  }

  function ownedCatalogCourses(staff) {
    const ids = new Set(ownedCourseIds(staff));
    const all = typeof allCourses === "function" ? allCourses() : [];
    return all.filter((c) => ids.has(c.id) || c.instructor === staff.name);
  }

  function ownedMentorships(staff) {
    const list = typeof mentorCatalogAll === "function" ? mentorCatalogAll()
      : (typeof MENTOR_PROGRAMS !== "undefined" ? MENTOR_PROGRAMS : []);
    return list.filter((p) => !p.unpublished && p.by === staff.name);
  }

  function ownedWebinars(staff) {
    const list = typeof allWebinars === "function" ? allWebinars()
      : (typeof WEBINARS !== "undefined" ? WEBINARS : []);
    return (Array.isArray(list) ? list : []).filter((w) => w.by === staff.name);
  }

  function savePct(price, old) {
    const p = Number(price || 0);
    const o = Number(old || 0);
    if (!o || o <= p) return 0;
    return Math.round(((o - p) / o) * 100);
  }

  function courseCoverArt(c) {
    const covers = typeof COVERS === "object" ? COVERS : {};
    return covers[c.cover] || { bg: "linear-gradient(135deg,#0f766e,#042f2e)", title: String(c.title || "COURSE").slice(0, 18).toUpperCase() };
  }

  function courseThumbBlock(c) {
    // Always resolve the live catalog course so modal/cards share /course?id=… banner.
    let course = c;
    if ((!c._kind || c._kind === "course") && c?.id && typeof allCourses === "function") {
      const live = allCourses().find((x) => x && x.id === c.id);
      if (live) course = { ...live, ...c, banner: live.banner || c.banner || "" };
    }
    const banner = (typeof courseBannerOf === "function" ? courseBannerOf(course) : "") || String(course?.banner || "").trim();
    if (banner && (!course._kind || course._kind === "course")) {
      return `<div class="crm-course-thumb crm-course-thumb-real has-banner">
        <div class="thumb has-banner">
          <img class="thumb-banner" src="${esc(banner)}" alt="">
          <span class="brand-badge" aria-hidden="true">B</span>
        </div>
      </div>`;
    }
    if (typeof courseThumbHTML === "function" && (!course._kind || course._kind === "course")) {
      return `<div class="crm-course-thumb crm-course-thumb-real">${courseThumbHTML(course)}</div>`;
    }
    const art = courseCoverArt(course);
    const photo = typeof photoFor === "function" ? photoFor(course.instructor) : "/img/bizgarh-avatar.png";
    return `<div class="crm-course-thumb" style="background:${esc(art.bg)}">
      <div class="cover-copy">${art.title}</div>
      <img class="person" src="${esc(photo)}" alt="">
      <span class="brand-badge">B</span>
    </div>`;
  }

  function courseCardHTML(c, kind) {
    const price = Number(c.price || 0);
    const old = Number(c.old || 0);
    const pct = savePct(price, old);
    const rating = c.rating || "4.8";
    return `<button type="button" class="crm-course-card" data-crm-course-open="${esc(kind)}" data-id="${esc(c.id)}">
      ${courseThumbBlock(c)}
      <div class="crm-course-body">
        <div class="crm-course-title-row">
          <b>${esc(c.title)}</b>
          <span class="crm-course-rating">★ ${esc(rating)}</span>
        </div>
        <div class="crm-course-price-row">
          <span class="now">${esc(inrFull(price))}</span>
          ${old ? `<span class="old">${esc(inrFull(old))}</span>` : ""}
          ${pct ? `<span class="save">SAVE ${pct}%</span>` : ""}
        </div>
      </div>
    </button>`;
  }

  function mentorshipAsCard(p) {
    return {
      id: p.id,
      title: p.title,
      instructor: p.by,
      rating: "4.8",
      price: p.price,
      old: p.old,
      hours: String(p.hours || p.weeks || "—"),
      cover: "mp",
      _kind: "mentorship",
      _raw: p
    };
  }

  function webinarAsCard(w) {
    return {
      id: w.id,
      title: w.title,
      instructor: w.by,
      rating: "4.7",
      price: w.free ? 0 : Number(w.price || 0),
      old: 0,
      hours: "1.0",
      cover: "web",
      _kind: "webinar",
      _raw: w
    };
  }

  function courseOverviewText(c) {
    if (c._kind === "mentorship") {
      return c._raw?.blurb || "Live multi-week mentorship desk with session recordings for enrolled learners.";
    }
    if (c._kind === "webinar") {
      return `Live webinar with ${c.instructor}. ${c._raw?.when ? "Scheduled " + c._raw.when + "." : ""} Process-first session — not tips.`;
    }
    const hours = c.hours || "—";
    const lessons = c.lessons || "—";
    return `${c.title} is a recorded Bizgarh classroom (${hours} hrs · ${lessons} lessons). Teach process, risk, and journals — education only.`;
  }

  function openCoursePopup(item, kind) {
    closeCoursePopup();
    const level = kind === "mentorship" ? "Mentorship desk" : kind === "webinar" ? "Live webinar" : "All Levels";
    const duration = kind === "webinar"
      ? "Live session"
      : kind === "mentorship"
        ? `${item._raw?.weeks || "—"} weeks · ${item._raw?.sessions || "—"} sessions`
        : `${item.hours || "—"} hrs of content`;
    const langs = "English, Hindi";
    const access = kind === "webinar" ? "Session + recording when uploaded" : kind === "mentorship" ? "Desk access while enrolled" : "1 Year Access";
    const cert = kind === "course" ? "Earn a Certificate" : kind === "webinar" ? "Participation certificate" : "Desk completion badge";
    const price = Number(item.price || 0);
    const rating = item.rating || "4.8";
    const overlay = document.createElement("div");
    overlay.id = "crmCourseOverlay";
    overlay.className = "crm-course-overlay";
    overlay.innerHTML = `
      <div class="crm-course-popup" role="dialog" aria-modal="true" aria-label="${esc(item.title)}">
        <header class="crm-course-popup-head">
          <h2>${esc(item.title)}</h2>
          <button type="button" class="crm-btn crm-btn-ghost" data-crm-course-close style="width:auto;padding:6px 12px">Close</button>
        </header>
        <div class="crm-course-popup-grid">
          <div class="crm-course-hero">
            ${courseThumbBlock(item)}
            <div class="crm-course-overview">
              <h3>Course overview</h3>
              <p>${esc(courseOverviewText(item))}</p>
            </div>
          </div>
          <aside class="crm-course-side">
            <ul>
              <li><span class="ico">${icon("cap")}</span>${esc(level)}</li>
              <li><span class="ico">${icon("pulse")}</span>${esc(duration)}</li>
              <li><span class="ico">${icon("life")}</span>${esc(langs)}</li>
              <li><span class="ico">${icon("eye")}</span>${esc(access)}</li>
              <li><span class="ico">${icon("check")}</span>${esc(cert)}</li>
            </ul>
            <div class="crm-course-side-price">${price ? esc(inrFull(price)) : "Free"}</div>
            <div class="crm-course-side-rating">★ ${esc(rating)}</div>
          </aside>
        </div>
      </div>`;
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeCoursePopup();
    });
    document.body.appendChild(overlay);
  }

  function closeCoursePopup() {
    $("#crmCourseOverlay")?.remove();
  }

  function renderCourses(root, s) {
    const rows = ownedCatalogCourses(s);
    root.innerHTML = `
      <div class="crm-panel-view">
        <div class="crm-welcome">
          <div>
            <h2>Courses</h2>
            <p>Your published classrooms — open a card for overview and meta (no checkout).</p>
          </div>
          <span class="crm-studio-count">${rows.length} course${rows.length === 1 ? "" : "s"}</span>
        </div>
        ${rows.length ? `<div class="crm-course-grid">${rows.map((c) => courseCardHTML(c, "course")).join("")}</div>` : ""}
      </div>`;
  }

  function renderMentorship(root, s) {
    const rows = ownedMentorships(s).map(mentorshipAsCard);
    root.innerHTML = `
      <div class="crm-panel-view">
        <div class="crm-welcome">
          <div>
            <h2>Mentorship</h2>
            <p>Live desks attributed to you.</p>
          </div>
          ${rows.length ? `<span class="crm-studio-count">${rows.length}</span>` : ""}
        </div>
        ${rows.length ? `<div class="crm-course-grid">${rows.map((c) => courseCardHTML(c, "mentorship")).join("")}</div>` : ""}
      </div>`;
  }

  function renderWebinars(root, s) {
    const rows = ownedWebinars(s).map(webinarAsCard);
    root.innerHTML = `
      <div class="crm-panel-view">
        <div class="crm-welcome">
          <div>
            <h2>Webinars</h2>
            <p>Live sessions you host on Bizgarh.</p>
          </div>
          ${rows.length ? `<span class="crm-studio-count">${rows.length}</span>` : ""}
        </div>
        ${rows.length ? `<div class="crm-course-grid">${rows.map((c) => courseCardHTML(c, "webinar")).join("")}</div>` : ""}
      </div>`;
  }

  function renderStudyMaterials(root, s) {
    const rows = studyMaterials(s.email);
    root.innerHTML = `<div class="crm-panel-view crm-studio">
      <section class="crm-section">
        <div class="crm-section-head">
          <div>
            <h3>Study materials</h3>
            <p>Upload PDF, DOC, images, and other files for your learners — list stays on this desk.</p>
          </div>
          <span class="crm-studio-count">${rows.length} file${rows.length === 1 ? "" : "s"}</span>
        </div>
        ${dropzoneHTML("study", STUDY_ACCEPT, "Accepts PDF, DOC, images, and other study files")}
        <div class="crm-file-panel" id="crmStudyList">${fileListHTML("study", rows)}</div>
      </section>
    </div>`;
  }

  function addStudyFiles(fileList, staff) {
    if (!staff || !fileList?.length) return;
    const rows = studyMaterials(staff.email).slice();
    Array.from(fileList).forEach((file) => {
      const id = studioUid("study");
      rememberBlob(id, file);
      rows.unshift({
        id,
        name: file.name || "file",
        size: Number(file.size || 0),
        uploadedAt: new Date().toISOString(),
        demo: false,
        blobId: id
      });
    });
    writeStudyBucket(staff.email, rows);
    renderStudyMaterials($("#crmView"), staff);
  }

  function deleteStudyItem(id, staff) {
    const next = studyMaterials(staff.email).filter((r) => r.id !== id);
    writeStudyBucket(staff.email, next);
    const prev = studioBlobs.get(id);
    if (prev?.url) URL.revokeObjectURL(prev.url);
    studioBlobs.delete(id);
    renderStudyMaterials($("#crmView"), staff);
  }

  const CREATOR_FAQS = [
    { q: "How do I see today's revenue?", a: "Open Finance → Today Revenue. View detail opens the nested spreadsheet of paid orders since midnight." },
    { q: "When do payouts land?", a: "Pending Payout shows amounts awaiting approval or the next window. Paid rows appear under Payout once the desk marks them paid." },
    { q: "How is commission calculated?", a: "Commission uses your creator rate on attributed paid orders. Open Finance → Commission for line-level detail." },
    { q: "Where did Study materials go?", a: "Study materials was removed from Creator CRM. Course files stay on the public classroom; Creator Studio holds scripts and recordings." },
    { q: "Why is Mentorship empty?", a: "Mentorship and Webinar only list programs attributed to your creator name. If you have none, the section stays blank by design." },
    { q: "How do Platform Performance counts work?", a: "Connect YouTube / Instagram / Facebook under Settings → Profile (API install). Until connected, dashboard counts stay offline." },
    { q: "Can I edit my Creator ID or referral code?", a: "No. Those are admin-side only. You can edit display name and profile fields; ID and referral stay locked." },
    { q: "How do I raise a support ticket?", a: "Support → Tickets. Submit subject, category, description, and an optional attachment. Your ticket list persists on this desk." },
    { q: "Where did Assignments and Classroom go?", a: "Those CRM stubs were removed. Classroom delivery stays on the public Bizgarh site; Creator Studio handles scripts and recordings." },
    { q: "Who do I contact for editing queue status?", a: "Editing Queue is updated by the Bizgarh team. Use Support → Tickets if a status looks stuck." }
  ];

  function renderTickets(root, s) {
    const rows = readTickets(s.email);
    root.innerHTML = `
      <div class="crm-panel-view">
        <section class="crm-section">
          <div class="crm-section-head">
            <div>
              <h3>Tickets</h3>
              <p>Raise a complaint or problem for the Bizgarh desk — submissions stay in your ticket list.</p>
            </div>
            <span class="crm-studio-count">${rows.length} ticket${rows.length === 1 ? "" : "s"}</span>
          </div>
          <form class="crm-ticket-form" id="crmTicketForm">
            <div class="crm-form-grid">
              <div class="crm-field"><label for="crmTicketSubject">Subject</label><input id="crmTicketSubject" required placeholder="Short title"></div>
              <div class="crm-field"><label for="crmTicketCat">Category</label>
                <select id="crmTicketCat">
                  <option value="Payout">Payout</option>
                  <option value="Content">Content / Studio</option>
                  <option value="Students">Students</option>
                  <option value="Platform">Platform / API</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div class="crm-field full crm-ticket-desc"><label for="crmTicketBody">Description</label><textarea id="crmTicketBody" rows="6" required placeholder="What went wrong, and what should happen next?"></textarea></div>
              <div class="crm-field full"><label for="crmTicketFile">Attachment (optional)</label><input id="crmTicketFile" type="file"></div>
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap">
              <button type="submit" class="crm-btn crm-btn-primary" style="width:auto;padding-inline:22px">Submit ticket</button>
              <span id="crmTicketMsg" class="crm-err" style="color:var(--crm-green)"></span>
            </div>
          </form>
          <div class="crm-ticket-list">
            ${rows.length ? rows.map((t) => `
              <article class="crm-ticket-row">
                <b>${esc(t.subject)}</b>
                <span>${esc(t.category)} · ${esc(t.status)} · ${esc(fmtDate(t.at))}${t.fileName ? " · " + esc(t.fileName) : ""}</span>
                <span>${esc(t.body)}</span>
              </article>`).join("") : `<div class="crm-file-empty">No tickets yet — submit the form above.</div>`}
          </div>
        </section>
      </div>`;
    const form = $("#crmTicketForm");
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const subject = ($("#crmTicketSubject")?.value || "").trim();
        const category = ($("#crmTicketCat")?.value || "Other").trim();
        const body = ($("#crmTicketBody")?.value || "").trim();
        const file = $("#crmTicketFile")?.files?.[0];
        if (!subject || !body) return;
        const next = readTickets(s.email).slice();
        next.unshift({
          id: studioUid("tkt"),
          subject,
          category,
          body,
          status: "OPEN",
          at: new Date().toISOString(),
          fileName: file ? file.name : ""
        });
        writeTickets(s.email, next);
        renderTickets(root, s);
      };
    }
  }

  function renderQueries(root) {
    root.innerHTML = `
      <div class="crm-panel-view">
        <section class="crm-section">
          <div class="crm-section-head">
            <div>
              <h3>Queries</h3>
              <p>Bizgarh creator FAQs — finance, content, platform connect, and desk workflow.</p>
            </div>
          </div>
          <div class="crm-faq-list">
            ${CREATOR_FAQS.map((f) => `
              <details class="crm-faq-item">
                <summary>${esc(f.q)}</summary>
                <p>${esc(f.a)}</p>
              </details>`).join("")}
          </div>
        </section>
      </div>`;
  }


  function renderView(view) {
    const root = $("#crmView");
    if (!root) return;
    const s = session();
    if (!s) return;
    if (view === "profile") return renderProfile(root, s, view);
    if (view === "analytics") return renderAnalytics(root, s);
    if (view === "students") return renderStudents(root, s);
    if (view === "scripts") return renderScripts(root, s);
    if (view === "recording-submissions") return renderRecordings(root, s);
    if (view === "editing-queue") return renderEditingQueue(root, s);
    if (view === "content-library") return renderContentLibrary(root, s);
    if (view === "review-approval") {
      location.hash = "editing-queue";
      return renderEditingQueue(root, s);
    }
    if (view === "today-revenue" || view === "commission" || view === "pending-payout" || view === "payout" || view === "revenue-reports") {
      return renderFinance(root, s, view);
    }
    if (view === "courses") return renderCourses(root, s);
    if (view === "mentorship") return renderMentorship(root, s);
    if (view === "webinars") return renderWebinars(root, s);
    if (view === "study-materials") {
      location.hash = "courses";
      return renderCourses(root, s);
    }
    if (view === "tickets") return renderTickets(root, s);
    if (view === "queries") return renderQueries(root);
    if (view !== "dashboard") {
      const label = findNavItem(view)?.label || "Section";
      root.innerHTML = `<div class="crm-panel-view crm-section"><div class="crm-stub">
        <h3>${esc(label)}</h3>
        <p>Coming soon — this nav shell is ready for the next creator CRM modules.</p>
        <p style="margin-top:12px"><a class="crm-link" href="#dashboard">← Back to Dashboard</a></p>
      </div></div>`;
      return;
    }
    renderDashboard(root, s);
  }

  function renderDashboard(root, s) {
    const periodSel = Number(localStorage.getItem("crmPeriodDays") || DEFAULT_PERIOD);
    const m = computeMetrics(s, periodSel);
    const prod = productionStore(s.email);
    const first = String(s.name || "Creator").split(" ")[0];

    root.innerHTML = `
      <div class="crm-panel-view">
        <div class="crm-welcome">
          <div>
            <h2>Welcome back, ${esc(first)}!</h2>
            <p>Your creator desk — students, revenue, content, and social reach.</p>
          </div>
          <label class="crm-period">Last
            <select id="crmPeriod">
              <option value="7" ${periodSel === 7 ? "selected" : ""}>7 Days</option>
              <option value="30" ${periodSel === 30 ? "selected" : ""}>30 Days</option>
              <option value="90" ${periodSel === 90 ? "selected" : ""}>90 Days</option>
            </select>
          </label>
        </div>

        <div class="crm-metrics">
          <article class="crm-metric">
            <div class="crm-metric-head"><span>Total Students</span><div class="crm-metric-ico purple">${icon("cap")}</div></div>
            <b>${fmtNum(m.totalStudents)}</b>
            <div class="crm-metric-foot">${deltaHTML(m.totalDelta)}${sparkSVG(m.sparks.total, "#a78bfa")}</div>
          </article>
          <article class="crm-metric">
            <div class="crm-metric-head"><span>New Students</span><div class="crm-metric-ico blue">${icon("user")}</div></div>
            <b>${fmtNum(m.newStudents)}</b>
            <div class="crm-metric-foot">${deltaHTML(m.newDelta)}${sparkSVG(m.sparks.neu, "#38bdf8")}</div>
          </article>
          <article class="crm-metric">
            <div class="crm-metric-head"><span>Active Students</span><div class="crm-metric-ico green">${icon("pulse")}</div></div>
            <b>${fmtNum(m.activeStudents)}</b>
            <div class="crm-metric-foot">${deltaHTML(m.activeDelta)}${sparkSVG(m.sparks.active, "#34d399")}</div>
          </article>
          <article class="crm-metric">
            <div class="crm-metric-head"><span>Total Revenue</span><div class="crm-metric-ico cyan">${icon("wallet")}</div></div>
            <b>${inrCompact(m.revenue)}</b>
            <div class="crm-metric-foot">${deltaHTML(m.revenueDelta)}${sparkSVG(m.sparks.revenue, "#67e8f9")}</div>
          </article>
        </div>

        <section class="crm-section">
          <div class="crm-section-head">
            <div>
              <h3>Content Production</h3>
              <p>Read-only workflow counts set by Bizgarh admin on Control for this creator.</p>
            </div>
            <span class="crm-prod-ro-hint" id="crmProdSaveHint">Admin-controlled</span>
          </div>
          <div class="crm-prod crm-prod-readonly">
            <div class="crm-prod-card pending">
              <div class="crm-prod-ico">${icon("file")}</div>
              <label>Scripts Pending</label>
              <b class="crm-prod-value">${Number(prod.scriptsPending) || 0}</b>
              <small>Waiting for shooting</small>
            </div>
            <div class="crm-prod-card editing">
              <div class="crm-prod-ico">${icon("scissors")}</div>
              <label>In Editing</label>
              <b class="crm-prod-value">${Number(prod.inEditing) || 0}</b>
              <small>Being edited by team</small>
            </div>
            <div class="crm-prod-card approval">
              <div class="crm-prod-ico">${icon("eye")}</div>
              <label>Awaiting Approval</label>
              <b class="crm-prod-value">${Number(prod.awaitingApproval) || 0}</b>
              <small>Action required</small>
            </div>
            <div class="crm-prod-card delivered">
              <div class="crm-prod-ico">${icon("check")}</div>
              <label>Videos Delivered</label>
              <b class="crm-prod-value">${Number(prod.videosDelivered) || 0}</b>
              <small>Ready to download</small>
            </div>
          </div>
        </section>

        <section class="crm-section">
          <div class="crm-section-head">
            <div>
              <h3>Revenue Overview</h3>
              <p>Creator-attributed sales across the selected window.</p>
            </div>
          </div>
          <div class="crm-chart-wrap">${revenueChartSVG(m.series)}</div>
        </section>

        <section class="crm-section">
          <div class="crm-section-head">
            <div>
              <h3>Platform Performance</h3>
              <p>Live reach for YouTube, Instagram, and Facebook · 24h delta when a prior snapshot exists.</p>
            </div>
            <a href="#profile">API connect</a>
          </div>
          <div class="crm-platforms" id="crmPlatforms">${platformSkeleton()}</div>
        </section>
      </div>`;

    bindDashboard(s);
    loadPlatforms(s);
  }

  function revenueChartSVG(series) {
    const w = 640, h = 200, p = 28;
    const values = series.map((x) => x.revenue);
    const max = Math.max(...values, 1);
    const pts = values.map((v, i) => {
      const x = p + (i / Math.max(values.length - 1, 1)) * (w - p * 2);
      const y = h - p - (v / max) * (h - p * 2 - 10);
      return { x, y, v, label: series[i].label };
    });
    const line = pts.map((pt) => `${pt.x},${pt.y}`).join(" ");
    const fill = `${pts[0].x},${h - p} ${line} ${pts[pts.length - 1].x},${h - p}`;
    const dots = pts.map((pt) => `
      <circle cx="${pt.x}" cy="${pt.y}" r="3.5" fill="#38bdf8"/>
      <text x="${pt.x}" y="${pt.y - 10}" text-anchor="middle" fill="#94a3b8" font-size="10" font-weight="700">${inrCompact(pt.v)}</text>
      <text x="${pt.x}" y="${h - 8}" text-anchor="middle" fill="#64748b" font-size="10">${esc(pt.label)}</text>
    `).join("");
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Revenue overview">
      <polyline points="${fill}" fill="rgba(56,189,248,0.14)" stroke="none"></polyline>
      <polyline points="${line}" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linejoin="round"></polyline>
      ${dots}
    </svg>`;
  }

  function courseTitle(id) {
    const c = typeof allCourses === "function" ? allCourses().find((x) => x.id === id) : null;
    return c?.title || id || "—";
  }

  function coursePrice(id) {
    const c = typeof allCourses === "function" ? allCourses().find((x) => x.id === id) : null;
    return Number(c?.price || 0);
  }

  function lessonCount(courseId) {
    if (typeof courseById === "function") {
      const c = courseById(courseId);
      if (c && Array.isArray(c.lessons)) return c.lessons.length;
      if (c && Array.isArray(c.modules)) {
        return c.modules.reduce((n, m) => n + (Array.isArray(m.lessons) ? m.lessons.length : 0), 0);
      }
    }
    const c = typeof allCourses === "function" ? allCourses().find((x) => x.id === courseId) : null;
    if (c && Number(c.lessons)) return Number(c.lessons);
    return 8;
  }

  function progressPct(email, courseId) {
    if (typeof progressStore !== "function") return 0;
    const all = progressStore();
    const byUser = all[email] || all[String(email).toLowerCase()] || null;
    if (!byUser || !byUser[courseId] || !byUser[courseId].lessons) return 0;
    const done = Object.keys(byUser[courseId].lessons).filter((k) => byUser[courseId].lessons[k]).length;
    const total = lessonCount(courseId);
    if (!total) return 0;
    return Math.min(100, Math.round((done / total) * 1000) / 10);
  }

  function fmtDate(iso) {
    const t = new Date(iso || 0).getTime();
    if (!Number.isFinite(t) || !t) return "—";
    return new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  function inrFull(n) {
    return "₹" + Math.round(Number(n || 0)).toLocaleString("en-IN");
  }

  function creatorOrders(staff) {
    const courseIds = ownedCourseIds(staff);
    const mine = new Set(courseIds);
    let orders = [];
    if (typeof AdminCore !== "undefined" && AdminCore.orders) {
      orders = AdminCore.orders().filter((o) =>
        (o.creatorEmail === staff.email || mine.has(o.courseId)) && !isCrmDemoOrder(o)
      );
    }
    // Do not synthesize paid orders from enrolls — empty until real sales exist.
    return orders;
  }

  function ensureOutstandingDemo() {
    // Intentionally empty — analytics must not invent outstanding payment rows.
  }

  function studentSeries(enrolls, days, uniqueOnly) {
    const points = 8;
    const step = Math.max(1, Math.round(days / points));
    const seen = new Set();
    return Array.from({ length: points }, (_, i) => {
      const end = Date.now() - (points - 1 - i) * step * 86400000;
      const start = end - step * 86400000;
      let n = 0;
      enrolls.forEach((e) => {
        const t = new Date(e.at || 0).getTime();
        if (t < start || t >= end) return;
        if (uniqueOnly) {
          const key = String(e.email || "").toLowerCase();
          if (!key || seen.has(key)) return;
          seen.add(key);
        }
        n += 1;
      });
      return {
        label: new Date(start + 86400000).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        value: n
      };
    });
  }

  function periodRevenueSeries(staff, mode) {
    const courseIds = ownedCourseIds(staff);
    const orders = creatorOrders(staff).filter((o) => o.status === "PAID");
    let buckets;
    const now = new Date();
    if (mode === "daily") {
      buckets = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(now);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - (13 - i));
        const start = d.getTime();
        const end = start + 86400000;
        let revenue = 0;
        orders.forEach((o) => {
          const t = new Date(o.at || 0).getTime();
          if (t >= start && t < end) revenue += Number(o.net || o.amount || 0);
        });
        return {
          label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
          revenue
        };
      });
    } else if (mode === "weekly") {
      buckets = Array.from({ length: 8 }, (_, i) => {
        const end = new Date(now);
        end.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() - (7 - i) * 7 + 7);
        const start = end.getTime() - 7 * 86400000;
        const endT = end.getTime();
        let revenue = 0;
        orders.forEach((o) => {
          const t = new Date(o.at || 0).getTime();
          if (t >= start && t < endT) revenue += Number(o.net || o.amount || 0);
        });
        return {
          label: "W" + (i + 1),
          revenue
        };
      });
    } else {
      buckets = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const start = d.getTime();
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
        let revenue = 0;
        orders.forEach((o) => {
          const t = new Date(o.at || 0).getTime();
          if (t >= start && t < end) revenue += Number(o.net || o.amount || 0);
        });
        return {
          label: d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
          revenue
        };
      });
    }
    // Keep zeros when there are no paid sales — do not invent chart values.
    return buckets;
  }

  function lineChartSVG(series, opts) {
    const w = opts?.w || 560;
    const h = opts?.h || 140;
    const p = opts?.pad || 24;
    const color = opts?.color || "#38bdf8";
    const values = series.map((x) => Number(x.value != null ? x.value : x.revenue) || 0);
    const max = Math.max(...values, 1);
    const pts = values.map((v, i) => {
      const x = p + (i / Math.max(values.length - 1, 1)) * (w - p * 2);
      const y = h - p - (v / max) * (h - p * 2 - 8);
      return { x, y, v, label: series[i].label };
    });
    const line = pts.map((pt) => `${pt.x},${pt.y}`).join(" ");
    const fill = `${pts[0].x},${h - p} ${line} ${pts[pts.length - 1].x},${h - p}`;
    const showLabels = values.length <= 10;
    const dots = pts.map((pt) => `
      <circle cx="${pt.x}" cy="${pt.y}" r="3" fill="${color}"/>
      ${showLabels ? `<text x="${pt.x}" y="${h - 6}" text-anchor="middle" fill="#64748b" font-size="9">${esc(pt.label)}</text>` : ""}
    `).join("");
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="${esc(opts?.label || "Chart")}">
      <polyline points="${fill}" fill="${color}22" stroke="none"></polyline>
      <polyline points="${line}" fill="none" stroke="${color}" stroke-width="2.4" stroke-linejoin="round"></polyline>
      ${dots}
    </svg>`;
  }

  function barChartSVG(series, opts) {
    const w = opts?.w || 560;
    const h = opts?.h || 140;
    const p = opts?.pad || 24;
    const color = opts?.color || "#67e8f9";
    const values = series.map((x) => Number(x.value != null ? x.value : x.revenue) || 0);
    const max = Math.max(...values, 1);
    const gap = 6;
    const barW = Math.max(8, (w - p * 2) / values.length - gap);
    const bars = values.map((v, i) => {
      const x = p + i * (barW + gap);
      const bh = (v / max) * (h - p * 2 - 8);
      const y = h - p - bh;
      return `<rect x="${x}" y="${y}" width="${barW}" height="${Math.max(bh, 1)}" rx="3" fill="${color}" opacity="0.85"/>
        <text x="${x + barW / 2}" y="${h - 6}" text-anchor="middle" fill="#64748b" font-size="9">${esc(series[i].label)}</text>`;
    }).join("");
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="${esc(opts?.label || "Chart")}">${bars}</svg>`;
  }

  function buildAnalyticsBundle(staff, periodDays) {
    ensureOutstandingDemo(staff);
    const days = Number(periodDays) || DEFAULT_PERIOD;
    const m = computeMetrics(staff, days);
    const enrolls = creatorEnrolls(staff);
    const courseIds = ownedCourseIds(staff);
    const students = uniqueStudents(enrolls);

    const firstEnrollAt = new Map();
    enrolls.forEach((e) => {
      const key = String(e.email || "").toLowerCase();
      const t = new Date(e.at || 0).getTime();
      if (!key || !t) return;
      if (!firstEnrollAt.has(key) || t < firstEnrollAt.get(key)) firstEnrollAt.set(key, t);
    });

    const studentRows = students.map((s) => {
      const mail = String(s.email || "").toLowerCase();
      const courses = enrolls.filter((e) => String(e.email || "").toLowerCase() === mail);
      const last = courses.reduce((a, e) => {
        const t = new Date(e.at || 0).getTime();
        return t > a ? t : a;
      }, 0);
      const avgPct = courses.length
        ? Math.round(courses.reduce((a, e) => a + progressPct(s.email, e.courseId), 0) / courses.length)
        : 0;
      const active = hasLearningActivity(mail, courseIds) || hasLearningActivity(s.email, courseIds)
        || courses.some((e) => inLastDays(e.at, ACTIVE_DAYS));
      const first = firstEnrollAt.get(mail);
      const isNew = first && first >= Date.now() - days * 86400000;
      return {
        name: s.name || "—",
        email: s.email || "—",
        courses: courses.length,
        courseList: courses.map((e) => courseTitle(e.courseId)).join("; "),
        firstAt: first ? new Date(first).toISOString() : "",
        lastAt: last ? new Date(last).toISOString() : "",
        progress: avgPct,
        status: active ? "Active" : "Inactive",
        isNew: !!isNew,
        active: !!active
      };
    }).sort((a, b) => new Date(b.lastAt || 0) - new Date(a.lastAt || 0));

    const completionRows = [];
    enrolls.forEach((e) => {
      const pct = progressPct(e.email, e.courseId);
      completionRows.push({
        name: e.name || "—",
        email: e.email || "—",
        course: courseTitle(e.courseId),
        courseId: e.courseId,
        enrolled: e.at || "",
        progress: pct,
        status: pct >= 100 ? "Completed" : pct >= 40 ? "In progress" : "Started"
      });
    });
    const completionRate = completionRows.length
      ? Math.round((completionRows.reduce((a, r) => a + Number(r.progress || 0), 0) / completionRows.length) * 10) / 10
      : 0;

    const orders = creatorOrders(staff);
    const paid = orders.filter((o) => o.status === "PAID");
    const outstanding = orders.filter((o) => o.status !== "PAID");

    const courseRevMap = new Map();
    paid.forEach((o) => {
      const id = o.courseId || "unknown";
      const row = courseRevMap.get(id) || { courseId: id, course: courseTitle(id), orders: 0, revenue: 0, students: new Set() };
      row.orders += 1;
      row.revenue += Number(o.net || o.amount || 0);
      row.students.add(String(o.email || "").toLowerCase());
      courseRevMap.set(id, row);
    });
    const courseWise = Array.from(courseRevMap.values())
      .map((r) => ({
        course: r.course,
        students: r.students.size,
        orders: r.orders,
        revenue: r.revenue,
        avg: r.orders ? Math.round(r.revenue / r.orders) : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const paymentRows = paid
      .toSorted((a, b) => new Date(b.at || 0) - new Date(a.at || 0))
      .map((o) => ({
        id: o.id || "—",
        name: o.name || "—",
        email: o.email || "—",
        course: courseTitle(o.courseId),
        amount: Number(o.net || o.amount || 0),
        method: o.method || "upi",
        tx: o.tx || "—",
        at: o.at || "",
        status: "Collected"
      }));

    const outstandingRows = outstanding
      .toSorted((a, b) => new Date(b.at || 0) - new Date(a.at || 0))
      .map((o) => ({
        id: o.id || "—",
        name: o.name || "—",
        email: o.email || "—",
        course: courseTitle(o.courseId),
        amount: Number(o.net || o.amount || 0),
        status: o.status || "PENDING",
        due: o.at || "",
        daysOverdue: Math.max(0, Math.floor((Date.now() - new Date(o.at || 0).getTime()) / 86400000))
      }));

    const revMode = localStorage.getItem("crmAnalyticsRevMode") || "weekly";
    const periodSeries = periodRevenueSeries(staff, revMode);

    const result = {
      metrics: m,
      days,
      completionRate,
      studentRows,
      newRows: studentRows.filter((r) => r.isNew),
      activeRows: studentRows.filter((r) => r.active),
      completionRows,
      courseWise,
      paymentRows,
      outstandingRows,
      studentSpark: {
        total: studentSeries(enrolls, days, true).map((x) => x.value),
        neu: studentSeries(enrolls, days, true).map((x) => x.value),
        active: m.sparks.active,
        completion: completionRows.slice(0, 8).map((r) => r.progress)
      },
      studentCharts: {
        total: studentSeries(enrolls, Math.max(days, 56), true),
        neu: studentSeries(enrolls, days, false),
        active: studentSeries(enrolls, ACTIVE_DAYS * 4, false).map((x, i, arr) => ({
          ...x,
          value: Math.max(x.value, Math.round((m.activeStudents / arr.length) * (0.6 + (i % 3) * 0.2)))
        })),
        completion: Array.from({ length: 8 }, (_, i) => ({
          label: "W" + (i + 1),
          value: Math.min(100, Math.round(completionRate * (0.55 + i * 0.06)))
        }))
      },
      totalRevenueSeries: m.series,
      periodSeries,
      revMode,
      revenueDetailRows: paid
        .toSorted((a, b) => new Date(b.at || 0) - new Date(a.at || 0))
        .map((o) => ({
          id: o.id || "—",
          name: o.name || "—",
          email: o.email || "—",
          course: courseTitle(o.courseId),
          amount: Number(o.net || o.amount || 0),
          at: o.at || "",
          status: o.status || "PAID"
        })),
      periodDetailRows: periodSeries.map((b) => ({
        period: b.label,
        revenue: b.revenue,
        avgOrder: b.revenue
      }))
    };

    // Level-2 in-depth rows (nested View detail)
    const deepStudentRows = [];
    result.studentRows.forEach((s) => {
      const mail = String(s.email || "").toLowerCase();
      const mine = enrolls.filter((e) => String(e.email || "").toLowerCase() === mail);
      if (!mine.length) {
        deepStudentRows.push({
          name: s.name, email: s.email, phone: "—", course: "—", courseId: "—",
          enrolled: s.firstAt, firstAt: s.firstAt, lastAt: s.lastAt,
          progress: s.progress, lessonsDone: "—", lessonsTotal: "—",
          status: s.status, isNew: s.isNew ? "Yes" : "No", active: s.active ? "Yes" : "No",
          source: "enroll"
        });
        return;
      }
      mine.forEach((e) => {
        const pct = Number(progressPct(e.email, e.courseId) || s.progress || 0);
        const total = lessonCount(e.courseId);
        const done = Math.round((pct / 100) * total);
        deepStudentRows.push({
          name: s.name || e.name || "—",
          email: s.email || e.email || "—",
          phone: "—",
          course: courseTitle(e.courseId),
          courseId: e.courseId || "—",
          enrolled: e.at || "",
          firstAt: s.firstAt || "",
          lastAt: s.lastAt || e.at || "",
          progress: pct,
          lessonsDone: done,
          lessonsTotal: total,
          status: pct >= 100 ? "Completed" : (s.active ? "Active" : "Inactive"),
          isNew: s.isNew ? "Yes" : "No",
          active: s.active ? "Yes" : "No",
          source: "creator enroll"
        });
      });
    });
    result.deepStudentRows = deepStudentRows;
    result.deepNewRows = deepStudentRows.filter((r) => r.isNew === "Yes");
    result.deepActiveRows = deepStudentRows.filter((r) => r.active === "Yes");
    result.deepCompletionRows = completionRows.map((r) => {
      const total = lessonCount(r.courseId);
      const pct = Number(r.progress || 0);
      return {
        name: r.name,
        email: r.email,
        course: r.course,
        courseId: r.courseId || "—",
        enrolled: r.enrolled,
        progress: pct,
        lessonsDone: Math.round((pct / 100) * total),
        lessonsTotal: total,
        remaining: Math.max(0, 100 - pct),
        status: r.status,
        risk: pct < 25 ? "At risk" : pct < 70 ? "On track" : "Strong"
      };
    });
    result.deepRevenueRows = paid
      .toSorted((a, b) => new Date(b.at || 0) - new Date(a.at || 0))
      .map((o) => ({
        id: o.id || "—",
        name: o.name || "—",
        email: o.email || "—",
        course: courseTitle(o.courseId),
        courseId: o.courseId || "—",
        gross: Number(o.amount || o.net || 0),
        discount: Number(o.discount || 0),
        tax: Number(o.tax || 0),
        net: Number(o.net || o.amount || 0),
        method: o.method || "upi",
        tx: o.tx || "—",
        at: o.at || "",
        status: o.status || "PAID",
        creator: o.creatorEmail || staff.email || "—",
        referral: o.referralCode || "—"
      }));
    result.deepPeriodRows = periodSeries.map((b, i) => {
      const prev = i > 0 ? periodSeries[i - 1].revenue : 0;
      const delta = prev ? Math.round(((b.revenue - prev) / prev) * 1000) / 10 : (b.revenue ? 100 : 0);
      return {
        period: b.label,
        revenue: b.revenue,
        avgOrder: b.revenue,
        deltaPct: delta,
        mode: revMode
      };
    });
    const courseRevTotal = courseWise.reduce((a, x) => a + Number(x.revenue || 0), 0) || 1;
    result.deepCourseWise = courseWise.map((r, i) => ({
      rank: i + 1,
      course: r.course,
      students: r.students,
      orders: r.orders,
      revenue: r.revenue,
      avg: r.avg,
      share: Math.round((r.revenue / courseRevTotal) * 1000) / 10,
      perStudent: r.students ? Math.round(r.revenue / r.students) : 0
    }));
    result.deepPaymentRows = paymentRows.map((r) => ({
      ...r,
      gateway: "Razorpay",
      settlement: "T+2",
      currency: "INR",
      feeEst: Math.round(Number(r.amount || 0) * 0.02),
      netToCreator: Math.round(Number(r.amount || 0) * 0.8)
    }));
    result.deepOutstandingRows = outstandingRows.map((r) => ({
      ...r,
      phone: "—",
      followUp: r.daysOverdue >= 14 ? "Escalated" : r.daysOverdue >= 7 ? "Reminder due" : "Watch",
      priority: r.daysOverdue >= 21 ? "High" : r.daysOverdue >= 7 ? "Medium" : "Low",
      notes: r.status === "FAILED" ? "Payment failed — retry link" : "Awaiting collection"
    }));
    return result;
  }

  const SHEET_DEFS = {
    "total-students": {
      title: "Total Students",
      columns: [
        { key: "name", label: "Student" },
        { key: "email", label: "Email" },
        { key: "courses", label: "Courses" },
        { key: "courseList", label: "Enrolled in" },
        { key: "firstAt", label: "First enroll", fmt: "date" },
        { key: "lastAt", label: "Last activity", fmt: "date" },
        { key: "progress", label: "Avg progress", fmt: "pct" },
        { key: "status", label: "Status" }
      ],
      rows: (b) => b.studentRows,
      deep: {
        title: "Total Students — In-depth",
        columns: [
          { key: "name", label: "Student" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "course", label: "Course" },
          { key: "courseId", label: "Course ID" },
          { key: "enrolled", label: "Enrolled", fmt: "date" },
          { key: "firstAt", label: "First enroll", fmt: "date" },
          { key: "lastAt", label: "Last activity", fmt: "date" },
          { key: "progress", label: "Progress", fmt: "pct" },
          { key: "lessonsDone", label: "Lessons done" },
          { key: "lessonsTotal", label: "Lessons total" },
          { key: "status", label: "Status" },
          { key: "isNew", label: "New?" },
          { key: "active", label: "Active?" },
          { key: "source", label: "Source" }
        ],
        rows: (b) => b.deepStudentRows
      }
    },
    "new-students": {
      title: "New Students",
      columns: [
        { key: "name", label: "Student" },
        { key: "email", label: "Email" },
        { key: "firstAt", label: "Joined", fmt: "date" },
        { key: "courses", label: "Courses" },
        { key: "courseList", label: "Enrolled in" },
        { key: "status", label: "Status" }
      ],
      rows: (b) => b.newRows,
      deep: {
        title: "New Students — In-depth",
        columns: [
          { key: "name", label: "Student" },
          { key: "email", label: "Email" },
          { key: "course", label: "Course" },
          { key: "courseId", label: "Course ID" },
          { key: "enrolled", label: "Enrolled", fmt: "date" },
          { key: "firstAt", label: "First enroll", fmt: "date" },
          { key: "progress", label: "Progress", fmt: "pct" },
          { key: "lessonsDone", label: "Lessons done" },
          { key: "lessonsTotal", label: "Lessons total" },
          { key: "status", label: "Status" },
          { key: "active", label: "Active?" },
          { key: "source", label: "Source" }
        ],
        rows: (b) => b.deepNewRows
      }
    },
    "active-students": {
      title: "Active Students",
      columns: [
        { key: "name", label: "Student" },
        { key: "email", label: "Email" },
        { key: "lastAt", label: "Last activity", fmt: "date" },
        { key: "progress", label: "Avg progress", fmt: "pct" },
        { key: "courses", label: "Courses" },
        { key: "status", label: "Status" }
      ],
      rows: (b) => b.activeRows,
      deep: {
        title: "Active Students — In-depth",
        columns: [
          { key: "name", label: "Student" },
          { key: "email", label: "Email" },
          { key: "course", label: "Course" },
          { key: "courseId", label: "Course ID" },
          { key: "lastAt", label: "Last activity", fmt: "date" },
          { key: "progress", label: "Progress", fmt: "pct" },
          { key: "lessonsDone", label: "Lessons done" },
          { key: "lessonsTotal", label: "Lessons total" },
          { key: "status", label: "Status" },
          { key: "isNew", label: "New?" },
          { key: "source", label: "Source" }
        ],
        rows: (b) => b.deepActiveRows
      }
    },
    "completion-rate": {
      title: "Course Completion Rate",
      columns: [
        { key: "name", label: "Student" },
        { key: "email", label: "Email" },
        { key: "course", label: "Course" },
        { key: "enrolled", label: "Enrolled", fmt: "date" },
        { key: "progress", label: "Progress", fmt: "pct" },
        { key: "status", label: "Status" }
      ],
      rows: (b) => b.completionRows,
      deep: {
        title: "Course Completion — In-depth",
        columns: [
          { key: "name", label: "Student" },
          { key: "email", label: "Email" },
          { key: "course", label: "Course" },
          { key: "courseId", label: "Course ID" },
          { key: "enrolled", label: "Enrolled", fmt: "date" },
          { key: "progress", label: "Progress", fmt: "pct" },
          { key: "lessonsDone", label: "Lessons done" },
          { key: "lessonsTotal", label: "Lessons total" },
          { key: "remaining", label: "Remaining %", fmt: "pct" },
          { key: "status", label: "Status" },
          { key: "risk", label: "Risk" }
        ],
        rows: (b) => b.deepCompletionRows
      }
    },
    "total-revenue": {
      title: "Total Revenue",
      columns: [
        { key: "id", label: "Order ID" },
        { key: "name", label: "Student" },
        { key: "email", label: "Email" },
        { key: "course", label: "Course" },
        { key: "amount", label: "Amount", fmt: "inr" },
        { key: "at", label: "Paid on", fmt: "date" },
        { key: "status", label: "Status" }
      ],
      rows: (b) => b.revenueDetailRows,
      deep: {
        title: "Total Revenue — In-depth",
        columns: [
          { key: "id", label: "Order ID" },
          { key: "name", label: "Student" },
          { key: "email", label: "Email" },
          { key: "course", label: "Course" },
          { key: "courseId", label: "Course ID" },
          { key: "gross", label: "Gross", fmt: "inr" },
          { key: "discount", label: "Discount", fmt: "inr" },
          { key: "tax", label: "Tax", fmt: "inr" },
          { key: "net", label: "Net", fmt: "inr" },
          { key: "method", label: "Method" },
          { key: "tx", label: "Txn" },
          { key: "at", label: "Paid on", fmt: "date" },
          { key: "status", label: "Status" },
          { key: "creator", label: "Creator" },
          { key: "referral", label: "Referral" }
        ],
        rows: (b) => b.deepRevenueRows
      }
    },
    "period-revenue": {
      title: "Daily / Weekly / Monthly Revenue",
      columns: [
        { key: "period", label: "Period" },
        { key: "revenue", label: "Revenue", fmt: "inr" },
        { key: "avgOrder", label: "Bucket total", fmt: "inr" }
      ],
      rows: (b) => b.periodDetailRows,
      deep: {
        title: "Period Revenue — In-depth",
        columns: [
          { key: "period", label: "Period" },
          { key: "mode", label: "Grain" },
          { key: "revenue", label: "Revenue", fmt: "inr" },
          { key: "avgOrder", label: "Bucket total", fmt: "inr" },
          { key: "deltaPct", label: "vs prior %", fmt: "pct" }
        ],
        rows: (b) => b.deepPeriodRows
      }
    },
    "course-revenue": {
      title: "Course-wise Revenue",
      columns: [
        { key: "course", label: "Course" },
        { key: "students", label: "Students" },
        { key: "orders", label: "Orders" },
        { key: "revenue", label: "Revenue", fmt: "inr" },
        { key: "avg", label: "Avg order", fmt: "inr" }
      ],
      rows: (b) => b.courseWise,
      deep: {
        title: "Course-wise Revenue — In-depth",
        columns: [
          { key: "rank", label: "Rank" },
          { key: "course", label: "Course" },
          { key: "students", label: "Students" },
          { key: "orders", label: "Orders" },
          { key: "revenue", label: "Revenue", fmt: "inr" },
          { key: "avg", label: "Avg order", fmt: "inr" },
          { key: "perStudent", label: "Rev / student", fmt: "inr" },
          { key: "share", label: "Share %", fmt: "pct" }
        ],
        rows: (b) => b.deepCourseWise
      }
    },
    "payment-collection": {
      title: "Payment Collection Report",
      columns: [
        { key: "id", label: "Order ID" },
        { key: "name", label: "Student" },
        { key: "email", label: "Email" },
        { key: "course", label: "Course" },
        { key: "amount", label: "Amount", fmt: "inr" },
        { key: "method", label: "Method" },
        { key: "tx", label: "Txn" },
        { key: "at", label: "Collected", fmt: "date" },
        { key: "status", label: "Status" }
      ],
      rows: (b) => b.paymentRows,
      deep: {
        title: "Payment Collection — In-depth",
        columns: [
          { key: "id", label: "Order ID" },
          { key: "name", label: "Student" },
          { key: "email", label: "Email" },
          { key: "course", label: "Course" },
          { key: "amount", label: "Amount", fmt: "inr" },
          { key: "method", label: "Method" },
          { key: "gateway", label: "Gateway" },
          { key: "tx", label: "Txn" },
          { key: "currency", label: "Currency" },
          { key: "feeEst", label: "Fee est.", fmt: "inr" },
          { key: "netToCreator", label: "Creator net", fmt: "inr" },
          { key: "settlement", label: "Settlement" },
          { key: "at", label: "Collected", fmt: "date" },
          { key: "status", label: "Status" }
        ],
        rows: (b) => b.deepPaymentRows
      }
    },
    "outstanding": {
      title: "Outstanding Payments",
      columns: [
        { key: "id", label: "Order ID" },
        { key: "name", label: "Student" },
        { key: "email", label: "Email" },
        { key: "course", label: "Course" },
        { key: "amount", label: "Amount", fmt: "inr" },
        { key: "status", label: "Status" },
        { key: "due", label: "Raised", fmt: "date" },
        { key: "daysOverdue", label: "Days open" }
      ],
      rows: (b) => b.outstandingRows,
      deep: {
        title: "Outstanding Payments — In-depth",
        columns: [
          { key: "id", label: "Order ID" },
          { key: "name", label: "Student" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "course", label: "Course" },
          { key: "amount", label: "Amount", fmt: "inr" },
          { key: "status", label: "Status" },
          { key: "due", label: "Raised", fmt: "date" },
          { key: "daysOverdue", label: "Days open" },
          { key: "priority", label: "Priority" },
          { key: "followUp", label: "Follow-up" },
          { key: "notes", label: "Notes" }
        ],
        rows: (b) => b.deepOutstandingRows
      }
    }
  };

  function cellDisplay(row, col) {
    const v = row[col.key];
    if (col.fmt === "date") return fmtDate(v);
    if (col.fmt === "inr") return inrFull(v);
    if (col.fmt === "pct") return (Number(v) || 0) + "%";
    return v == null || v === "" ? "—" : String(v);
  }

  function sheetTableHTML(def, rows, limit) {
    const slice = limit ? rows.slice(0, limit) : rows;
    const head = def.columns.map((c) => `<th>${esc(c.label)}</th>`).join("");
    const body = slice.length
      ? slice.map((r) => `<tr>${def.columns.map((c) => `<td>${esc(cellDisplay(r, c))}</td>`).join("")}</tr>`).join("")
      : `<tr><td colspan="${def.columns.length}" class="crm-sheet-empty">No rows yet</td></tr>`;
    return `<div class="crm-sheet-scroll"><table class="crm-sheet-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
  }

  function closeAnalyticsSheet() {
    $("#crmSheetOverlay")?.remove();
  }

  function renderSheetPanel(sheetId, staff, level) {
    const def = SHEET_DEFS[sheetId];
    if (!def) return "";
    const deep = level === 2 && def.deep ? def.deep : null;
    const view = deep || def;
    const periodSel = Number(localStorage.getItem("crmPeriodDays") || DEFAULT_PERIOD);
    const bundle = buildAnalyticsBundle(staff, periodSel);
    const rows = (view.rows ? view.rows(bundle) : []) || [];
    const subtitle = deep
      ? `${rows.length} row${rows.length === 1 ? "" : "s"} · in-depth spreadsheet`
      : `${rows.length} row${rows.length === 1 ? "" : "s"} · spreadsheet detail`;
    const actions = deep
      ? `<button type="button" class="crm-btn crm-btn-ghost" data-crm-sheet-back="${esc(sheetId)}" style="width:auto;padding:6px 12px">Back</button>
         <button type="button" class="crm-btn crm-btn-ghost" data-crm-sheet-close style="width:auto;padding:6px 12px">Close</button>`
      : `<button type="button" class="crm-btn crm-btn-ghost" data-crm-sheet-deep="${esc(sheetId)}" style="width:auto;padding:6px 12px">View detail</button>
         <button type="button" class="crm-btn crm-btn-ghost" data-crm-sheet-close style="width:auto;padding:6px 12px">Close</button>`;
    return `
      <div class="crm-sheet-panel${deep ? " crm-sheet-panel-deep" : ""}" role="dialog" aria-modal="true" aria-label="${esc(view.title)}">
        <header class="crm-sheet-head">
          <div>
            <h2>${esc(view.title)}</h2>
            <p>${subtitle}</p>
          </div>
          <div class="crm-sheet-actions">${actions}</div>
        </header>
        ${sheetTableHTML(view, rows)}
      </div>`;
  }

  function openAnalyticsSheet(sheetId, staff, level) {
    const def = SHEET_DEFS[sheetId];
    if (!def) return;
    const lvl = level === 2 ? 2 : 1;
    let overlay = $("#crmSheetOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "crmSheetOverlay";
      overlay.className = "crm-sheet-overlay";
      document.body.appendChild(overlay);
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeAnalyticsSheet();
      });
    }
    overlay.dataset.sheetId = sheetId;
    overlay.dataset.sheetLevel = String(lvl);
    overlay.innerHTML = renderSheetPanel(sheetId, staff, lvl);
  }

  function fmtMobile(raw) {
    const digits = String(raw || "").replace(/\D/g, "");
    if (digits.length === 10) return "+91 " + digits.slice(0, 5) + " " + digits.slice(5);
    if (digits.length === 12 && digits.startsWith("91")) {
      return "+91 " + digits.slice(2, 7) + " " + digits.slice(7);
    }
    return raw ? String(raw) : "—";
  }

  function demoPhoneFor(email, i) {
    const base = [
      "9876543210", "9823012345", "9811122233", "9988776655", "9765432109",
      "9898989898", "9123456780", "9001122334", "9876500011", "9811100099",
      "9822011122", "9900112233"
    ];
    const hash = String(email || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return base[(hash + (i || 0)) % base.length];
  }

  function ensureStudentsDemo() {
    // Intentionally empty — do not invent students / enrollments for the CRM desk.
  }

  function studentTickets(email) {
    const mail = String(email || "").toLowerCase();
    let list = [];
    if (typeof AdminCore !== "undefined" && AdminCore.tickets) list = AdminCore.tickets();
    else if (typeof readList === "function" && typeof TICKETS_KEY !== "undefined") list = readList(TICKETS_KEY);
    else {
      try { list = JSON.parse(localStorage.getItem("tradeshalaTickets") || "[]"); } catch { list = []; }
    }
    return list
      .filter((t) => String(t.email || "").toLowerCase() === mail)
      .slice()
      .sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0));
  }

  function userPhone(email) {
    const mail = String(email || "").toLowerCase();
    if (typeof readList === "function" && typeof USERS_KEY !== "undefined") {
      const u = readList(USERS_KEY).find((x) => String(x.email || "").toLowerCase() === mail);
      if (u?.phone) return u.phone;
    }
    if (typeof AdminCore !== "undefined" && AdminCore.leads) {
      const lead = AdminCore.leads().find((l) => String(l.email || "").toLowerCase() === mail);
      if (lead?.phone) return lead.phone;
    }
    return "";
  }

  function buildStudentsBundle(staff) {
    ensureStudentsDemo(staff);
    ensureOutstandingDemo(staff);
    const enrolls = creatorEnrolls(staff);
    const orders = creatorOrders(staff);
    const students = uniqueStudents(enrolls);

    const useSeed = false;

    const rows = students.map((s, idx) => {
      const mail = String(s.email || "").toLowerCase();
      const mine = enrolls
        .filter((e) => String(e.email || "").toLowerCase() === mail)
        .slice()
        .sort((a, b) => new Date(a.at || 0) - new Date(b.at || 0));
      const firstAt = mine[0]?.at || s.at || "";
      const courseTitles = mine.map((e) => courseTitle(e.courseId));
      const primaryCourse = courseTitles[courseTitles.length - 1] || "—";
      const courseEnrolled = courseTitles.length > 1
        ? primaryCourse + " +" + (courseTitles.length - 1)
        : primaryCourse;

      const mineOrders = orders
        .filter((o) => String(o.email || "").toLowerCase() === mail)
        .slice()
        .sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0));
      const paidOrders = mineOrders.filter((o) => o.status === "PAID");
      const amountPaid = paidOrders.reduce((a, o) => a + Number(o.net || o.amount || 0), 0);

      const progressRows = mine.map((e, i) => {
        let pct = progressPct(e.email, e.courseId);
        const total = lessonCount(e.courseId);
        return {
          courseId: e.courseId,
          course: courseTitle(e.courseId),
          enrolled: e.at || "",
          progress: pct,
          lessonsDone: Math.round((pct / 100) * total),
          lessonsTotal: total,
          status: pct >= 100 ? "Completed" : pct >= 40 ? "In progress" : "Started"
        };
      });
      const avgProgress = progressRows.length
        ? Math.round(progressRows.reduce((a, r) => a + Number(r.progress || 0), 0) / progressRows.length)
        : 0;

      const transactions = mineOrders.map((o) => ({
        id: o.id || "—",
        course: courseTitle(o.courseId),
        amount: Number(o.net || o.amount || 0),
        status: o.status || "—",
        method: o.method || "upi",
        tx: o.tx || "—",
        at: o.at || ""
      }));
      const txnSummary = transactions.length
        ? (transactions.length + " txn" + (transactions.length === 1 ? "" : "s") + " · " + inrFull(amountPaid))
        : "No transactions";

      const support = studentTickets(mail).map((t) => ({
        id: t.id || "—",
        title: t.title || "Support",
        body: t.body || "",
        status: t.status || "OPEN",
        course: t.courseId ? courseTitle(t.courseId) : "—",
        at: t.at || "",
        replies: Array.isArray(t.replies) ? t.replies.length : 0
      }));
      const openSupport = support.filter((t) => String(t.status || "").toUpperCase() === "OPEN").length;
      const supportSummary = support.length
        ? (openSupport ? openSupport + " open · " + support.length + " total" : support.length + " closed")
        : "No tickets";

      const phone = userPhone(mail) || demoPhoneFor(mail, idx);

      return {
        key: mail,
        name: s.name || mine[0]?.name || "—",
        mobile: fmtMobile(phone),
        mobileRaw: phone,
        email: s.email || mail,
        registeredAt: firstAt,
        courseEnrolled,
        courseList: courseTitles.join("; "),
        amountPaid,
        progress: avgProgress,
        txnSummary,
        txnCount: transactions.length,
        supportSummary,
        supportCount: support.length,
        supportOpen: openSupport,
        courses: progressRows,
        transactions,
        support,
        status: progressRows.some((r) => r.progress > 0) || mine.some((e) => inLastDays(e.at, ACTIVE_DAYS))
          ? "Active"
          : "Inactive"
      };
    }).sort((a, b) => new Date(b.registeredAt || 0) - new Date(a.registeredAt || 0));

    return { rows, total: rows.length };
  }

  function closeStudentProfile() {
    $("#crmStudentOverlay")?.remove();
  }

  function renderStudentProfilePanel(row, focus) {
    if (!row) return "";
    const focusSec = focus === "support" ? "support" : focus === "txn" ? "txn" : "identity";
    const courseRows = (row.courses || []).map((c) => `
      <tr>
        <td>${esc(c.course)}</td>
        <td>${esc(fmtDate(c.enrolled))}</td>
        <td>
          <div class="crm-prog-cell">
            <span class="crm-prog-bar"><i style="width:${Math.min(100, Number(c.progress) || 0)}%"></i></span>
            <span>${esc(String(c.progress))}%</span>
          </div>
        </td>
        <td>${esc(c.lessonsDone + "/" + c.lessonsTotal)}</td>
        <td>${esc(c.status)}</td>
      </tr>`).join("") || `<tr><td colspan="5" class="crm-sheet-empty">No course enrollments</td></tr>`;

    const txnRows = (row.transactions || []).map((t) => `
      <tr>
        <td>${esc(t.id)}</td>
        <td>${esc(t.course)}</td>
        <td>${esc(inrFull(t.amount))}</td>
        <td>${esc(t.status)}</td>
        <td>${esc(t.method)}</td>
        <td>${esc(t.tx)}</td>
        <td>${esc(fmtDate(t.at))}</td>
      </tr>`).join("") || `<tr><td colspan="7" class="crm-sheet-empty">No transactions yet</td></tr>`;

    const supportRows = (row.support || []).map((t) => `
      <tr>
        <td>${esc(t.title)}</td>
        <td><span class="crm-pill ${String(t.status).toUpperCase() === "OPEN" ? "warn" : "ok"}">${esc(t.status)}</span></td>
        <td>${esc(t.course)}</td>
        <td>${esc(fmtDate(t.at))}</td>
        <td>${esc(String(t.replies))}</td>
      </tr>`).join("") || `<tr><td colspan="5" class="crm-sheet-empty">No support history</td></tr>`;

    return `
      <div class="crm-sheet-panel crm-student-profile" role="dialog" aria-modal="true" aria-label="Student profile">
        <header class="crm-sheet-head">
          <div>
            <h2>${esc(row.name)}</h2>
            <p>Complete student profile · ${esc(row.status)} · registered ${esc(fmtDate(row.registeredAt))}</p>
          </div>
          <div class="crm-sheet-actions">
            <button type="button" class="crm-btn crm-btn-ghost" data-crm-student-close style="width:auto;padding:6px 12px">Close</button>
          </div>
        </header>
        <div class="crm-student-profile-body">
          <section class="crm-student-sec${focusSec === "identity" ? " focus" : ""}" id="crmStudentIdentity">
            <h3>Identity</h3>
            <div class="crm-student-id-grid">
              <div><span>Name</span><b>${esc(row.name)}</b></div>
              <div><span>Mobile</span><b>${esc(row.mobile)}</b></div>
              <div><span>Email</span><b>${esc(row.email)}</b></div>
              <div><span>Registration</span><b>${esc(fmtDate(row.registeredAt))}</b></div>
              <div><span>Amount paid</span><b>${esc(inrFull(row.amountPaid))}</b></div>
              <div><span>Avg progress</span><b>${esc(String(row.progress))}%</b></div>
            </div>
          </section>
          <section class="crm-student-sec" id="crmStudentCourses">
            <h3>Courses &amp; progress</h3>
            <div class="crm-sheet-scroll crm-sheet-scroll-short">
              <table class="crm-sheet-table">
                <thead><tr><th>Course</th><th>Enrolled</th><th>Progress</th><th>Lessons</th><th>Status</th></tr></thead>
                <tbody>${courseRows}</tbody>
              </table>
            </div>
          </section>
          <section class="crm-student-sec${focusSec === "txn" ? " focus" : ""}" id="crmStudentTxn">
            <h3>Payments / transactions</h3>
            <p class="crm-student-sec-sub">${esc(row.txnSummary)}</p>
            <div class="crm-sheet-scroll crm-sheet-scroll-short">
              <table class="crm-sheet-table">
                <thead><tr><th>Order</th><th>Course</th><th>Amount</th><th>Status</th><th>Method</th><th>Txn</th><th>Date</th></tr></thead>
                <tbody>${txnRows}</tbody>
              </table>
            </div>
          </section>
          <section class="crm-student-sec${focusSec === "support" ? " focus" : ""}" id="crmStudentSupport">
            <h3>Support history</h3>
            <p class="crm-student-sec-sub">${esc(row.supportSummary)}</p>
            <div class="crm-sheet-scroll crm-sheet-scroll-short">
              <table class="crm-sheet-table">
                <thead><tr><th>Ticket</th><th>Status</th><th>Course</th><th>Opened</th><th>Replies</th></tr></thead>
                <tbody>${supportRows}</tbody>
              </table>
            </div>
          </section>
        </div>
      </div>`;
  }

  function openStudentProfile(staff, email, focus) {
    const bundle = buildStudentsBundle(staff);
    const mail = String(email || "").toLowerCase();
    const row = bundle.rows.find((r) => r.key === mail);
    if (!row) return;
    closeAnalyticsSheet();
    let overlay = $("#crmStudentOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "crmStudentOverlay";
      overlay.className = "crm-sheet-overlay";
      document.body.appendChild(overlay);
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeStudentProfile();
      });
    }
    overlay.dataset.studentEmail = mail;
    overlay.innerHTML = renderStudentProfilePanel(row, focus);
    const target = focus === "support"
      ? $("#crmStudentSupport", overlay)
      : focus === "txn"
        ? $("#crmStudentTxn", overlay)
        : $("#crmStudentIdentity", overlay);
    if (target) setTimeout(() => target.scrollIntoView({ block: "nearest", behavior: "smooth" }), 40);
  }

  function studentsSheetHTML(rows) {
    const head = `
      <th>Name</th>
      <th>Mobile</th>
      <th>Email</th>
      <th>Registration date</th>
      <th>Course enrolled</th>
      <th>Amount paid</th>
      <th>Course progress</th>
      <th>Transaction history</th>
      <th>Support history</th>`;
    const body = rows.length
      ? rows.map((r) => `
        <tr class="crm-student-row" data-crm-student="${esc(r.key)}" tabindex="0">
          <td><button type="button" class="crm-student-name" data-crm-student="${esc(r.key)}">${esc(r.name)}</button></td>
          <td>${esc(r.mobile)}</td>
          <td>${esc(r.email)}</td>
          <td>${esc(fmtDate(r.registeredAt))}</td>
          <td title="${esc(r.courseList)}">${esc(r.courseEnrolled)}</td>
          <td>${esc(inrFull(r.amountPaid))}</td>
          <td>
            <div class="crm-prog-cell">
              <span class="crm-prog-bar"><i style="width:${Math.min(100, Number(r.progress) || 0)}%"></i></span>
              <span>${esc(String(r.progress))}%</span>
            </div>
          </td>
          <td>
            <button type="button" class="crm-link-btn crm-sheet-link" data-crm-student-txn="${esc(r.key)}">${esc(r.txnSummary)}</button>
          </td>
          <td>
            <button type="button" class="crm-link-btn crm-sheet-link" data-crm-student-support="${esc(r.key)}">${esc(r.supportSummary)}</button>
          </td>
        </tr>`).join("")
      : `<tr><td colspan="9" class="crm-sheet-empty">No students enrolled on your courses yet</td></tr>`;
    return `<div class="crm-sheet-scroll crm-students-scroll"><table class="crm-sheet-table crm-students-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
  }

  function renderStudents(root, s) {
    const q = String(localStorage.getItem("crmStudentsQuery") || "").trim().toLowerCase();
    const bundle = buildStudentsBundle(s);
    let rows = bundle.rows;
    if (q) {
      rows = rows.filter((r) =>
        [r.name, r.email, r.mobile, r.mobileRaw, r.courseEnrolled, r.courseList]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    root.innerHTML = `
      <div class="crm-panel-view crm-students">
        <div class="crm-welcome">
          <div>
            <h2>Students</h2>
            <p>Spreadsheet roster of learners on your courses. Click a name or row for the full profile.</p>
          </div>
          <label class="crm-period crm-students-search">Search
            <input id="crmStudentsSearch" type="search" placeholder="Name, email, mobile, course" value="${esc(q)}" autocomplete="off">
          </label>
        </div>
        <section class="crm-section">
          <div class="crm-analytics-table-card crm-students-sheet-card">
            <div class="crm-analytics-table-head">
              <h4>Student roster</h4>
              <span class="crm-table-sum">${rows.length} of ${bundle.total} student${bundle.total === 1 ? "" : "s"}</span>
            </div>
            ${studentsSheetHTML(rows)}
          </div>
        </section>
      </div>`;

    const search = $("#crmStudentsSearch");
    if (search) {
      let timer = null;
      search.addEventListener("input", () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          localStorage.setItem("crmStudentsQuery", search.value || "");
          renderStudents(root, s);
          const again = $("#crmStudentsSearch");
          if (again) {
            again.focus();
            const len = again.value.length;
            try { again.setSelectionRange(len, len); } catch { /* ignore */ }
          }
        }, 180);
      });
    }
  }

  function renderAnalytics(root, s) {
    const periodSel = Number(localStorage.getItem("crmPeriodDays") || DEFAULT_PERIOD);
    const b = buildAnalyticsBundle(s, periodSel);
    const m = b.metrics;
    const outSum = b.outstandingRows.reduce((a, r) => a + Number(r.amount || 0), 0);
    const collectedSum = b.paymentRows.reduce((a, r) => a + Number(r.amount || 0), 0);

    root.innerHTML = `
      <div class="crm-panel-view crm-analytics">
        <div class="crm-welcome">
          <div>
            <h2>Analytics</h2>
            <p>Drill into student and revenue metrics with spreadsheet-style detail sheets.</p>
          </div>
          <label class="crm-period">Last
            <select id="crmAnalyticsPeriod">
              <option value="7" ${periodSel === 7 ? "selected" : ""}>7 Days</option>
              <option value="30" ${periodSel === 30 ? "selected" : ""}>30 Days</option>
              <option value="90" ${periodSel === 90 ? "selected" : ""}>90 Days</option>
            </select>
          </label>
        </div>

        <section class="crm-section crm-analytics-block">
          <div class="crm-section-head">
            <div>
              <h3 class="crm-analytics-heading">Student Analytics</h3>
              <p>Unique learners on your courses · active rule uses lesson progress or enroll in last ${ACTIVE_DAYS} days.</p>
            </div>
          </div>
          <div class="crm-metrics crm-analytics-metrics">
            <article class="crm-metric crm-analytics-card">
              <div class="crm-metric-head"><span>Total Students</span><div class="crm-metric-ico purple">${icon("cap")}</div></div>
              <b>${fmtNum(m.totalStudents)}</b>
              <div class="crm-metric-foot">${deltaHTML(m.totalDelta)}${sparkSVG(m.sparks.total, "#a78bfa")}</div>
              <button type="button" class="crm-view-detail" data-crm-sheet="total-students">View detail</button>
            </article>
            <article class="crm-metric crm-analytics-card">
              <div class="crm-metric-head"><span>New Student</span><div class="crm-metric-ico blue">${icon("user")}</div></div>
              <b>${fmtNum(m.newStudents)}</b>
              <div class="crm-metric-foot">${deltaHTML(m.newDelta)}${sparkSVG(m.sparks.neu, "#38bdf8")}</div>
              <button type="button" class="crm-view-detail" data-crm-sheet="new-students">View detail</button>
            </article>
            <article class="crm-metric crm-analytics-card">
              <div class="crm-metric-head"><span>Active Students</span><div class="crm-metric-ico green">${icon("pulse")}</div></div>
              <b>${fmtNum(m.activeStudents)}</b>
              <div class="crm-metric-foot">${deltaHTML(m.activeDelta)}${sparkSVG(m.sparks.active, "#34d399")}</div>
              <button type="button" class="crm-view-detail" data-crm-sheet="active-students">View detail</button>
            </article>
            <article class="crm-metric crm-analytics-card">
              <div class="crm-metric-head"><span>Course Completion Rate</span><div class="crm-metric-ico cyan">${icon("check")}</div></div>
              <b>${fmtNum(b.completionRate)}%</b>
              <div class="crm-metric-foot"><span class="crm-delta flat">avg across enrolls</span>${sparkSVG(b.studentSpark.completion.length ? b.studentSpark.completion : [10, 20, 30, 40, 50, 60, 70, 80], "#67e8f9")}</div>
              <button type="button" class="crm-view-detail" data-crm-sheet="completion-rate">View detail</button>
            </article>
          </div>
        </section>

        <section class="crm-section crm-analytics-block">
          <div class="crm-section-head">
            <div>
              <h3 class="crm-analytics-heading">Revenue Analytics</h3>
              <p>Creator-attributed collections · outstanding includes pending / failed demo rows when live orders are thin.</p>
            </div>
          </div>

          <div class="crm-metrics crm-analytics-metrics crm-analytics-metrics-2">
            <article class="crm-metric crm-analytics-card">
              <div class="crm-metric-head"><span>Total Revenue</span><div class="crm-metric-ico cyan">${icon("wallet")}</div></div>
              <b>${inrCompact(m.revenue)}</b>
              <div class="crm-metric-foot">${deltaHTML(m.revenueDelta)}${sparkSVG(m.sparks.revenue, "#67e8f9")}</div>
              <div class="crm-chart-wrap crm-chart-mini">${lineChartSVG(b.totalRevenueSeries, { color: "#38bdf8", label: "Total revenue", h: 120 })}</div>
              <button type="button" class="crm-view-detail" data-crm-sheet="total-revenue">View detail</button>
            </article>
            <article class="crm-metric crm-analytics-card">
              <div class="crm-metric-head">
                <span>Daily / Weekly / Monthly Revenue</span>
                <div class="crm-metric-ico purple">${icon("pulse")}</div>
              </div>
              <b>${inrCompact(b.periodSeries.reduce((a, x) => a + x.revenue, 0))}</b>
              <div class="crm-rev-modes" role="tablist" aria-label="Revenue period">
                <button type="button" class="crm-rev-mode ${b.revMode === "daily" ? "on" : ""}" data-crm-rev-mode="daily">Daily</button>
                <button type="button" class="crm-rev-mode ${b.revMode === "weekly" ? "on" : ""}" data-crm-rev-mode="weekly">Weekly</button>
                <button type="button" class="crm-rev-mode ${b.revMode === "monthly" ? "on" : ""}" data-crm-rev-mode="monthly">Monthly</button>
              </div>
              <div class="crm-chart-wrap crm-chart-mini">${barChartSVG(b.periodSeries, { color: "#a78bfa", label: "Period revenue", h: 120 })}</div>
              <button type="button" class="crm-view-detail" data-crm-sheet="period-revenue">View detail</button>
            </article>
          </div>

          <div class="crm-analytics-tables">
            <div class="crm-analytics-table-card">
              <div class="crm-analytics-table-head">
                <h4>Course-wise Revenue</h4>
                <button type="button" class="crm-link-btn" data-crm-sheet="course-revenue">View all</button>
              </div>
              ${sheetTableHTML(SHEET_DEFS["course-revenue"], b.courseWise, 5)}
            </div>
            <div class="crm-analytics-table-card">
              <div class="crm-analytics-table-head">
                <h4>Payment Collection Report</h4>
                <span class="crm-table-sum">${inrCompact(collectedSum)} collected</span>
                <button type="button" class="crm-link-btn" data-crm-sheet="payment-collection">View all</button>
              </div>
              ${sheetTableHTML(SHEET_DEFS["payment-collection"], b.paymentRows, 5)}
            </div>
            <div class="crm-analytics-table-card">
              <div class="crm-analytics-table-head">
                <h4>Outstanding Payments</h4>
                <span class="crm-table-sum warn">${inrCompact(outSum)} open</span>
                <button type="button" class="crm-link-btn" data-crm-sheet="outstanding">View all</button>
              </div>
              ${sheetTableHTML(SHEET_DEFS["outstanding"], b.outstandingRows, 5)}
            </div>
          </div>
        </section>
      </div>`;

    const period = $("#crmAnalyticsPeriod");
    if (period) {
      period.onchange = () => {
        localStorage.setItem("crmPeriodDays", period.value);
        renderAnalytics(root, s);
      };
    }
  }

  function platformSkeleton() {
    return ["youtube", "instagram", "facebook"].map((p) => {
      const label = p === "youtube" ? "YouTube" : p === "instagram" ? "Instagram" : "Facebook";
      const cls = p === "youtube" ? "yt" : p === "instagram" ? "ig" : "fb";
      const ico = p === "youtube" ? "yt" : p === "instagram" ? "ig" : "fb";
      return `<article class="crm-plat" data-plat="${p}">
        <div class="crm-plat-logo ${cls}">${icon(ico)}</div>
        <div>
          <strong>${label}</strong>
          <b>—</b>
          <div class="crm-plat-meta">Loading…</div>
        </div>
      </article>`;
    }).join("");
  }

  function bindDashboard(s) {
    const period = $("#crmPeriod");
    if (period) {
      period.onchange = () => {
        localStorage.setItem("crmPeriodDays", period.value);
        renderDashboard($("#crmView"), s);
      };
    }
    // Content Production is admin-controlled on /control — no CRM steppers.
  }

  async function loadPlatforms(s) {
    const api = socialApiState(s.email);
    const links = socialLinks(s.email);
    const cached = socialCache(s.email);
    const anyConnected = api.youtube || api.instagram || api.facebook;
    if (!anyConnected) {
      renderPlatformCards({
        youtube: { ok: false, count: null, error: "not_connected" },
        instagram: { ok: false, count: null, error: "not_connected" },
        facebook: { ok: false, count: null, error: "not_connected" }
      }, links, true, api);
      return;
    }
    renderPlatformCards(cached, links, false, api);

    const activeLinks = {
      youtube: api.youtube ? (links.youtube || "connected") : "",
      instagram: api.instagram ? (links.instagram || "connected") : "",
      facebook: api.facebook ? (links.facebook || "connected") : ""
    };
    try {
      const res = await fetch("/api/creator/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: s.email, links: activeLinks })
      });
      if (!res.ok) throw new Error("social_http_" + res.status);
      const data = await res.json();
      if (data && data.platforms) {
        saveSocialCache(s.email, data.platforms);
        renderPlatformCards(data.platforms, links, false, api);
        return;
      }
    } catch {
      // Local static servers cannot run /api/creator/social — keep cache + clear status
    }
    const fallback = Object.keys(cached).length ? cached : {
      youtube: { ok: false, count: null, error: "api_offline", hint: "Live counts need Cloudflare Pages /api/creator/social + YOUTUBE_API_KEY" },
      instagram: { ok: false, count: null, error: "api_offline", hint: "Live counts need deploy + optional META_APP_TOKEN" },
      facebook: { ok: false, count: null, error: "api_offline", hint: "Live counts need deploy + optional META_APP_TOKEN" }
    };
    renderPlatformCards(fallback, links, true, api);
  }

  function renderPlatformCards(platforms, links, offline, apiState) {
    const root = $("#crmPlatforms");
    if (!root) return;
    const api = apiState || socialApiState(session()?.email);
    ["youtube", "instagram", "facebook"].forEach((p) => {
      const el = root.querySelector(`[data-plat="${p}"]`);
      if (!el) return;
      const row = platforms[p] || {};
      const label = p === "youtube" ? "YouTube" : p === "instagram" ? "Instagram" : "Facebook";
      const connected = !!api[p];
      const count = connected && row.count != null ? fmtNum(row.count) : "—";
      let meta = "";
      if (!connected) {
        meta = "Connect API in Profile";
      } else if (row.deltaPct != null) {
        const up = row.deltaPct >= 0;
        meta = `${up ? "+" : ""}${row.deltaPct}% vs prior 24h snapshot`;
      } else if (row.note === "24h_delta_pending") {
        meta = "Snapshot saved · 24h delta pending";
      } else if (row.error === "not_connected" || row.error === "link_missing") {
        meta = "Connect API in Profile";
      } else if (row.error === "missing_youtube_key" || row.error === "instagram_unavailable" || row.error === "facebook_unavailable" || row.error === "api_offline" || row.error) {
        if (row.count != null) {
          meta = row.stale || offline ? "Last known count · refresh on deploy" : (row.hint ? String(row.hint).slice(0, 72) : "Could not refresh");
        } else if (row.error === "missing_youtube_key") {
          meta = "Needs YOUTUBE_API_KEY in CF env";
        } else if (row.error === "api_offline") {
          meta = "Connected · live on Cloudflare Pages API";
        } else {
          meta = row.hint ? String(row.hint).slice(0, 72) : "Could not refresh · check API keys";
        }
      } else if (row.source) {
        meta = row.stale ? "Stale · last good count" : `Live · ${row.source.replace(/_/g, " ")}`;
      } else {
        meta = "Connected · waiting for live count";
      }
      const b = el.querySelector("b");
      const m = el.querySelector(".crm-plat-meta");
      if (b && count !== "—") b.textContent = count;
      else if (b) b.textContent = "—";
      if (m) m.textContent = (count !== "—" ? (p === "youtube" ? "Subscribers · " : "Followers · ") : "") + meta;
      el.title = connected ? (links[p] || label + " connected") : "Not connected";
    });
  }

  function persistProfileName(s, staffRow, name) {
    const nextName = (name || "").trim() || staffRow.name || s.name;
    saveProfileExtras(s.email, { name: nextName });
    if (typeof AdminCore !== "undefined" && AdminCore.saveStaff) {
      try { AdminCore.saveStaff({ ...staffRow, name: nextName }); } catch { /* ignore */ }
    }
    try {
      const key = typeof STAFF_SESSION_KEY !== "undefined" ? STAFF_SESSION_KEY : "tradeshalaStaffSession";
      localStorage.setItem(key, JSON.stringify({ ...s, name: nextName }));
    } catch { /* ignore */ }
    const who = $("#crmWho");
    if (who) {
      const b = who.querySelector("b");
      if (b) b.textContent = nextName || "Creator";
      const img = who.querySelector("img");
      if (img) img.src = creatorAvatar(linkedControlStaff(s) || s);
    }
    const msg = $("#crmProfileMsg");
    if (msg) msg.textContent = "Name saved";
  }

  function passwordFieldHTML(id, label, autocomplete) {
    return `<div class="crm-field crm-field-password">
      <label for="${esc(id)}">${esc(label)}</label>
      <div class="crm-pw-wrap">
        <input id="${esc(id)}" name="${esc(id)}" type="password" autocomplete="${esc(autocomplete)}" required minlength="4">
        <button type="button" class="crm-pw-toggle" data-crm-pw-toggle="${esc(id)}" aria-label="Show password" aria-pressed="false" title="Show password">${icon("eye")}</button>
      </div>
    </div>`;
  }

  function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input || !btn) return;
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    btn.setAttribute("aria-pressed", show ? "true" : "false");
    btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
    btn.title = show ? "Hide password" : "Show password";
    btn.innerHTML = icon(show ? "eyeOff" : "eye");
  }

  async function submitChangePassword(s, form) {
    const msg = $("#crmPasswordMsg");
    const setMsg = (text, ok) => {
      if (!msg) return;
      msg.textContent = text || "";
      msg.style.color = ok ? "var(--crm-green)" : "var(--crm-pink, #f07178)";
    };
    if (!s || typeof AdminCore === "undefined" || !AdminCore.changeStaffPassword) {
      setMsg("Password change is unavailable right now", false);
      return;
    }
    const current = String(form?.crmPwCurrent?.value || "");
    const next = String(form?.crmPwNew?.value || "");
    const confirm = String(form?.crmPwConfirm?.value || "");
    if (!current || !next || !confirm) {
      setMsg("Fill in all password fields", false);
      return;
    }
    if (next !== confirm) {
      setMsg("New password and confirmation do not match", false);
      return;
    }
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    setMsg("Updating password…", true);
    let r;
    try {
      r = await AdminCore.changeStaffPassword(s.email, current, next);
    } catch (err) {
      r = { ok: false, error: String(err?.message || err || "Could not change password") };
    }
    if (submitBtn) submitBtn.disabled = false;
    if (!r?.ok) {
      setMsg(r?.error || "Could not change password", false);
      return;
    }
    form.reset();
    $$("[data-crm-pw-toggle]", form).forEach((btn) => {
      const id = btn.getAttribute("data-crm-pw-toggle");
      const input = id ? document.getElementById(id) : null;
      if (input) input.type = "password";
      btn.setAttribute("aria-pressed", "false");
      btn.setAttribute("aria-label", "Show password");
      btn.title = "Show password";
      btn.innerHTML = icon("eye");
    });
    setMsg("Password updated — use the new password next time you sign in", true);
  }

  function renderProfile(root, s, view) {
    const extras = profileExtras(s.email);
    const api = socialApiState(s.email);
    const linked = linkedControlStaff(s) || s;
    const displayName = extras.name || linked.name || s.name || "";
    const creatorId = linked.creatorId || s.creatorId || "—";
    const referral = linked.referralCode || s.referralCode || "—";
    const bio = linked.bio || "";
    const loginId = creatorHeaderLabel(s).loginId;
    root.innerHTML = `
      <div class="crm-panel-view crm-section">
        <div class="crm-section-head">
          <div>
            <h3>${view === "settings" ? "Settings" : "Profile"}</h3>
            <p>Linked to Control Sub-admin · photo / bio / referral from that staff row.</p>
          </div>
        </div>
        <div class="crm-profile-hero">
          <img class="crm-profile-dp" src="${esc(creatorAvatar(linked))}" alt="">
          <div>
            <b>${esc(linked.name || displayName || "Creator")}</b>
            <small>${esc(loginId)}</small>
            ${bio ? `<p class="crm-profile-bio">${esc(bio)}</p>` : `<p class="crm-profile-bio muted">Bio is set on Control → Staff for this sub-admin.</p>`}
          </div>
        </div>
        <div class="crm-form-grid">
          <div class="crm-field"><label for="crmProfileName">Display name</label><input id="crmProfileName" value="${esc(displayName)}"></div>
          <div class="crm-field"><label>CRM login ID</label><input value="${esc(loginId)}" disabled></div>
          <div class="crm-field"><label>Staff email (Control)</label><input value="${esc(linked.email || s.email || "")}" disabled></div>
          <div class="crm-field crm-locked-field"><label>Creator ID</label><input value="${esc(creatorId)}" disabled><p class="crm-locked-hint">Admin-side only</p></div>
          <div class="crm-field crm-locked-field"><label>Referral code</label><input value="${esc(referral)}" disabled><p class="crm-locked-hint">Admin-side only</p></div>
        </div>
        <div class="crm-section-head" style="margin-top:18px">
          <div>
            <h3>Change password</h3>
            <p>Updates the password for this CRM login (same Control-linked staff account).</p>
          </div>
        </div>
        <form class="crm-password-form" id="crmChangePasswordForm" action="#" method="post" autocomplete="off">
          ${passwordFieldHTML("crmPwCurrent", "Current password", "current-password")}
          ${passwordFieldHTML("crmPwNew", "New password", "new-password")}
          ${passwordFieldHTML("crmPwConfirm", "Confirm new password", "new-password")}
          <div class="crm-password-actions">
            <button type="submit" class="crm-btn crm-btn-primary" style="width:auto;padding:10px 18px">Update password</button>
            <p id="crmPasswordMsg" class="crm-err" style="margin:0"></p>
          </div>
        </form>
        <div class="crm-section-head" style="margin-top:18px">
          <div>
            <h3>Social API install</h3>
            <p>Opt in to connect YouTube / Instagram / Facebook trackers. Platform Performance stays offline until connected.</p>
          </div>
        </div>
        <div class="crm-api-grid" id="crmApiConnect">
          ${["youtube", "instagram", "facebook"].map((p) => {
            const label = p === "youtube" ? "YouTube tracker" : p === "instagram" ? "Instagram collect" : "Facebook collect";
            const on = !!api[p];
            return `<article class="crm-api-row" data-api-plat="${p}">
              <div>
                <strong>${label}</strong>
                <span>${p === "youtube" ? "Subscriber counts via YouTube Data API" : "Follower counts via Meta graph when tokens exist"}</span>
                <span class="crm-api-status${on ? " on" : ""}">${on ? "Connected" : "Not connected"}</span>
              </div>
              <button type="button" class="crm-btn ${on ? "crm-btn-ghost" : "crm-btn-primary"}" data-crm-api-toggle="${p}" style="width:auto;padding:8px 14px">${on ? "Disconnect" : "Install / Connect"}</button>
            </article>`;
          }).join("")}
        </div>
        <p id="crmProfileMsg" class="crm-err" style="color:var(--crm-green)"></p>
      </div>`;

    const nameInput = $("#crmProfileName");
    if (nameInput) {
      const save = () => persistProfileName(s, linked, nameInput.value);
      nameInput.addEventListener("change", save);
      nameInput.addEventListener("blur", save);
    }
    const pwForm = $("#crmChangePasswordForm");
    if (pwForm) {
      pwForm.addEventListener("submit", (e) => {
        e.preventDefault();
        submitChangePassword(s, pwForm);
      });
    }
  }

  async function refreshCreatorFromAdmin() {
    try {
      if (typeof hydrateCatalogFromRemote === "function") await hydrateCatalogFromRemote();
    } catch { /* ignore */ }
    try {
      if (typeof hydrateInstructorsFromRemote === "function") await hydrateInstructorsFromRemote();
    } catch { /* ignore */ }
    try {
      if (typeof hydrateStaffFromRemote === "function") await hydrateStaffFromRemote();
    } catch { /* ignore */ }
    if (typeof AdminCore !== "undefined" && AdminCore.ensureRehanCreator) {
      try { AdminCore.ensureRehanCreator(); } catch { /* ignore */ }
    }
    // Refresh session face/bio from the linked staff row after KV hydrate.
    const s = session();
    if (s && typeof AdminCore !== "undefined" && AdminCore.staffRow) {
      const row = AdminCore.normalizeStaff(AdminCore.staffRow(s.email));
      if (row) {
        setStaffSession({
          ...s,
          ...row,
          password: undefined,
          photo: row.photo || s.photo || "",
          bio: row.bio || s.bio || "",
          faceKey: row.faceKey || s.faceKey || "",
          referralCode: row.referralCode || s.referralCode || "",
          creatorId: row.creatorId || s.creatorId || "",
          creatorEnabled: row.creatorEnabled != null ? row.creatorEnabled : s.creatorEnabled
        });
      }
    }
  }

  function tryLogin(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    ensureCreatorSeed();
    const email = ($("#crmEmail")?.value || "").trim().toLowerCase();
    const password = $("#crmPassword")?.value || "";
    const err = $("#crmLoginErr");
    if (!email || !password) {
      if (err) err.textContent = "Enter your Bizgarh email and password";
      return false;
    }
    if (typeof AdminCore === "undefined" || !AdminCore.login) {
      if (err) err.textContent = "Auth is still loading — try again";
      return false;
    }
    // Rehan: only rehan@bizgarh.in — block rehan / rehan.khan / admin gmail aliases
    if (typeof AdminCore.isRehanCrmLoginAllowed === "function" && !AdminCore.isRehanCrmLoginAllowed(email)) {
      if (err) err.textContent = "Wrong email or password";
      return false;
    }
    // Password checked against Control-linked staff store (AdminCore.login).
    const r = AdminCore.login(email, password, ($("#crmTotp")?.value || ""));
    if (r?.needTotp) {
      $("#crmTotpWrap")?.classList.remove("crm-hidden");
      if (err) err.textContent = r.error || "Enter authenticator code";
      return false;
    }
    if (!r?.ok) {
      if (err) err.textContent = r?.error || "Wrong email or password";
      return false;
    }
    const staff = AdminCore.normalizeStaff(r.staff || session());
    if (!isCreatorStaff(staff)) {
      AdminCore.logout();
      if (err) err.textContent = "This login is not a creator account";
      return false;
    }
    Promise.resolve(refreshCreatorFromAdmin()).finally(() => {
      showApp();
    });
    return false;
  }

  async function boot() {
    ensureCrmMesh({ restart: true });
    applyTheme(getTheme());
    clearLoginFields();
    await refreshCreatorFromAdmin();
    ensureCreatorSeed();
    const existing = session();
    const rehanSession = existing && typeof AdminCore !== "undefined" && AdminCore.isRehanStaffEmail
      && AdminCore.isRehanStaffEmail(existing.email);
    if (rehanSession && !(AdminCore.hasRehanCrmPasswordOk && AdminCore.hasRehanCrmPasswordOk())) {
      // Stale / passwordless Rehan session — force a real CRM password login.
      try { AdminCore.logout(); } catch { /* ignore */ }
      showLogin();
    } else if (existing && isCreatorStaff(existing)) {
      showApp();
    } else if (typeof AdminCore !== "undefined" && AdminCore.adoptPublicUser && AdminCore.adoptPublicUser()) {
      const s = session();
      if (s && isCreatorStaff(s) && !(AdminCore.isRehanStaffEmail && AdminCore.isRehanStaffEmail(s.email))) showApp();
      else showLogin();
    } else {
      showLogin();
    }

    // Re-assert mesh after BFCache restore / tab focus / OS motion preference flips
    window.addEventListener("pageshow", () => ensureCrmMesh({ restart: true }));
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") ensureCrmMesh({ restart: true });
    });
    try {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      const onMotion = () => ensureCrmMesh({ restart: true });
      if (mq.addEventListener) mq.addEventListener("change", onMotion);
      else if (mq.addListener) mq.addListener(onMotion);
    } catch { /* ignore */ }

    // Delegated handlers — survive re-renders and automation hosts
    document.addEventListener("submit", (e) => {
      if (e.target && e.target.id === "crmLoginForm") tryLogin(e);
    });
    document.addEventListener("click", (e) => {
      const t = e.target;
      if (!t || !t.closest) return;
      const pwToggle = t.closest("[data-crm-pw-toggle]");
      if (pwToggle) {
        e.preventDefault();
        togglePasswordVisibility(pwToggle.getAttribute("data-crm-pw-toggle"), pwToggle);
        return;
      }
      if (t.closest("#crmPassBtn")) {
        tryLogin(e);
        return;
      }
      const themeBtn = t.closest(".crm-theme-toggle");
      if (themeBtn) {
        e.preventDefault();
        e.stopPropagation();
        const opt = t.closest(".crm-theme-opt");
        let next = getTheme() === "light" ? "dark" : "light";
        if (opt) next = opt.getAttribute("data-val") || next;
        else if (themeBtn.getAttribute("data-theme") === "light") next = "dark";
        else next = "light";
        applyTheme(next);
        setOpenSection("settings");
        // Keep current main view — theme toggle is sidebar-only
        const openSettings = document.querySelector('[data-crm-section="settings"]');
        $$(".crm-nav-group").forEach((g) => {
          const on = g === openSettings;
          g.classList.toggle("open", on);
          const head = g.querySelector("[data-crm-accordion]");
          if (head) head.setAttribute("aria-expanded", on ? "true" : "false");
        });
        $$(".crm-theme-toggle").forEach((el) => el.setAttribute("data-theme", next));
        return;
      }
      const accordion = t.closest("[data-crm-accordion]");
      if (accordion) {
        e.preventDefault();
        const id = accordion.getAttribute("data-crm-accordion");
        const group = accordion.closest(".crm-nav-group");
        const wasOpen = group?.classList.contains("open");
        $$(".crm-nav-group").forEach((g) => {
          g.classList.remove("open");
          const head = g.querySelector("[data-crm-accordion]");
          if (head) head.setAttribute("aria-expanded", "false");
        });
        if (!wasOpen && group) {
          group.classList.add("open");
          accordion.setAttribute("aria-expanded", "true");
          setOpenSection(id);
        } else {
          setOpenSection(wasOpen ? "" : id);
        }
        return;
      }
      const nav = t.closest("[data-crm-nav]");
      if (nav) {
        e.preventDefault();
        $("#crmApp")?.classList.remove("nav-open");
        goView(nav.getAttribute("data-crm-nav"));
        return;
      }
      if (t.closest("#crmMenuBtn")) {
        $("#crmApp")?.classList.add("nav-open");
        return;
      }
      if (t.closest("#crmScrim")) {
        $("#crmApp")?.classList.remove("nav-open");
        return;
      }
      if (t.closest("[data-crm-open-profile]") || t.closest("#crmWho")) {
        e.preventDefault();
        $("#crmApp")?.classList.remove("nav-open");
        goView("profile");
        return;
      }
      if (t.closest("#crmBell")) {
        const panel = $("#crmNotesPanel");
        if (!panel) return;
        const open = !panel.classList.contains("crm-hidden");
        if (open) {
          panel.classList.add("crm-hidden");
          return;
        }
        const s = session();
        const list = typeof myNotes === "function" ? myNotes(s.email).slice(0, 12) : [];
        panel.innerHTML = `<header><span>Notifications</span><button type="button" class="crm-btn crm-btn-ghost" id="crmNotesClose" style="width:auto;padding:4px 10px">Close</button></header>` +
          (list.length
            ? `<ul>${list.map((n) => `<li><b>${esc(n.title || "Note")}</b><span>${esc(n.body || "")}</span></li>`).join("")}</ul>`
            : `<div class="empty">No notifications yet.</div>`);
        panel.classList.remove("crm-hidden");
        if (typeof markNotesRead === "function") markNotesRead(s.email);
        const badge = $("#crmBellBadge");
        if (badge) badge.classList.add("crm-hidden");
        return;
      }
      if (t.closest("#crmNotesClose")) {
        $("#crmNotesPanel")?.classList.add("crm-hidden");
      }
      const sheetClose = t.closest("[data-crm-sheet-close]");
      if (sheetClose) {
        e.preventDefault();
        closeAnalyticsSheet();
        return;
      }
      const sheetBack = t.closest("[data-crm-sheet-back]");
      if (sheetBack) {
        e.preventDefault();
        const s = session();
        if (!s) return;
        openAnalyticsSheet(sheetBack.getAttribute("data-crm-sheet-back"), s, 1);
        return;
      }
      const sheetDeep = t.closest("[data-crm-sheet-deep]");
      if (sheetDeep) {
        e.preventDefault();
        const s = session();
        if (!s) return;
        openAnalyticsSheet(sheetDeep.getAttribute("data-crm-sheet-deep"), s, 2);
        return;
      }
      const sheetBtn = t.closest("[data-crm-sheet]");
      if (sheetBtn) {
        e.preventDefault();
        const s = session();
        if (!s) return;
        openAnalyticsSheet(sheetBtn.getAttribute("data-crm-sheet"), s, 1);
        return;
      }
      const studentClose = t.closest("[data-crm-student-close]");
      if (studentClose) {
        e.preventDefault();
        closeStudentProfile();
        return;
      }
      const studentTxn = t.closest("[data-crm-student-txn]");
      if (studentTxn) {
        e.preventDefault();
        e.stopPropagation();
        const s = session();
        if (!s) return;
        openStudentProfile(s, studentTxn.getAttribute("data-crm-student-txn"), "txn");
        return;
      }
      const studentSupport = t.closest("[data-crm-student-support]");
      if (studentSupport) {
        e.preventDefault();
        e.stopPropagation();
        const s = session();
        if (!s) return;
        openStudentProfile(s, studentSupport.getAttribute("data-crm-student-support"), "support");
        return;
      }
      const studentOpen = t.closest("[data-crm-student]");
      if (studentOpen) {
        e.preventDefault();
        const s = session();
        if (!s) return;
        openStudentProfile(s, studentOpen.getAttribute("data-crm-student"), "identity");
        return;
      }
      const finSheet = t.closest("[data-crm-fin-sheet]");
      if (finSheet) {
        e.preventDefault();
        const s = session();
        if (!s) return;
        openFinanceSheet(finSheet.getAttribute("data-crm-fin-sheet"), s, 1);
        return;
      }
      const finDeep = t.closest("[data-crm-fin-deep]");
      if (finDeep) {
        e.preventDefault();
        const s = session();
        if (!s) return;
        openFinanceSheet(finDeep.getAttribute("data-crm-fin-deep"), s, 2);
        return;
      }
      const finBack = t.closest("[data-crm-fin-back]");
      if (finBack) {
        e.preventDefault();
        const s = session();
        if (!s) return;
        openFinanceSheet(finBack.getAttribute("data-crm-fin-back"), s, 1);
        return;
      }
      const courseOpen = t.closest("[data-crm-course-open]");
      if (courseOpen) {
        e.preventDefault();
        const s = session();
        if (!s) return;
        const kind = courseOpen.getAttribute("data-crm-course-open");
        const id = courseOpen.getAttribute("data-id");
        let item = null;
        if (kind === "course") item = ownedCatalogCourses(s).find((c) => c.id === id);
        else if (kind === "mentorship") item = ownedMentorships(s).map(mentorshipAsCard).find((c) => c.id === id);
        else if (kind === "webinar") item = ownedWebinars(s).map(webinarAsCard).find((c) => c.id === id);
        if (item) openCoursePopup(item, kind === "course" ? "course" : kind);
        return;
      }
      if (t.closest("[data-crm-course-close]")) {
        e.preventDefault();
        closeCoursePopup();
        return;
      }
      const apiToggle = t.closest("[data-crm-api-toggle]");
      if (apiToggle) {
        e.preventDefault();
        const s = session();
        if (!s) return;
        const plat = apiToggle.getAttribute("data-crm-api-toggle");
        const api = socialApiState(s.email);
        api[plat] = !api[plat];
        saveSocialApiState(s.email, api);
        // Keep a marker link so connected platforms are identifiable offline
        const links = socialLinks(s.email);
        if (api[plat] && !links[plat]) {
          const defaults = {
            youtube: "https://www.youtube.com/@bizgarh",
            instagram: "https://www.instagram.com/bizgarh",
            facebook: "https://www.facebook.com/bizgarh"
          };
          links[plat] = defaults[plat] || "connected";
          saveSocialLinks(s.email, links);
        }
        renderProfile($("#crmView"), s, "profile");
        const msg = $("#crmProfileMsg");
        if (msg) msg.textContent = api[plat] ? (plat + " connected") : (plat + " disconnected");
        return;
      }
      const revMode = t.closest("[data-crm-rev-mode]");
      if (revMode) {
        e.preventDefault();
        localStorage.setItem("crmAnalyticsRevMode", revMode.getAttribute("data-crm-rev-mode") || "weekly");
        const s = session();
        const root = $("#crmView");
        if (s && root && currentView() === "analytics") renderAnalytics(root, s);
        return;
      }
      const browse = t.closest("[data-studio-browse]");
      if (browse) {
        e.preventDefault();
        const kind = browse.getAttribute("data-studio-browse");
        const input = $(`[data-studio-file="${kind}"]`);
        if (input) input.click();
        return;
      }
      const dropzone = t.closest("[data-studio-drop]");
      if (dropzone && !t.closest("[data-studio-browse]") && !t.closest(".crm-drop-input")) {
        const kind = dropzone.getAttribute("data-studio-drop");
        const input = dropzone.querySelector("[data-studio-file]");
        if (input) input.click();
        return;
      }
      const dl = t.closest("[data-studio-dl]");
      if (dl) {
        e.preventDefault();
        downloadStudioBlob(dl.getAttribute("data-id"), dl.getAttribute("data-name"));
        return;
      }
      const del = t.closest("[data-studio-del]");
      if (del) {
        e.preventDefault();
        const s = session();
        if (!s) return;
        const kind = del.getAttribute("data-studio-del");
        const id = del.getAttribute("data-id");
        if (!confirm(kind === "study" ? "Delete this study material?" : "Delete this file from Creator Studio?")) return;
        deleteStudioItem(kind, id, s);
        return;
      }
    });

    document.addEventListener("change", (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      const fileInput = t.closest("[data-studio-file]");
      if (fileInput) {
        const kind = fileInput.getAttribute("data-studio-file");
        const s = session();
        addStudioFiles(kind, fileInput.files, s);
        fileInput.value = "";
        return;
      }
      // Editing queue status is display-only for creators (admin/Control updates it)
    });

    document.addEventListener("dragenter", (e) => {
      const zone = e.target instanceof Element ? e.target.closest("[data-studio-drop]") : null;
      if (!zone) return;
      e.preventDefault();
      zone.classList.add("dragover");
    });
    document.addEventListener("dragover", (e) => {
      const zone = e.target instanceof Element ? e.target.closest("[data-studio-drop]") : null;
      if (!zone) return;
      e.preventDefault();
      zone.classList.add("dragover");
    });
    document.addEventListener("dragleave", (e) => {
      const zone = e.target instanceof Element ? e.target.closest("[data-studio-drop]") : null;
      if (!zone) return;
      if (e.relatedTarget instanceof Node && zone.contains(e.relatedTarget)) return;
      zone.classList.remove("dragover");
    });
    document.addEventListener("drop", (e) => {
      const zone = e.target instanceof Element ? e.target.closest("[data-studio-drop]") : null;
      if (!zone) return;
      e.preventDefault();
      zone.classList.remove("dragover");
      const kind = zone.getAttribute("data-studio-drop");
      addStudioFiles(kind, e.dataTransfer?.files, session());
    });

    document.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && e.target && e.target.closest && e.target.closest("#crmWho")) {
        e.preventDefault();
        goView("profile");
        return;
      }
      if (e.key !== "Escape") return;
      if ($("#crmCourseOverlay")) {
        closeCoursePopup();
        return;
      }
      if ($("#crmStudentOverlay")) {
        closeStudentProfile();
        return;
      }
      closeAnalyticsSheet();
    });

    window.addEventListener("hashchange", () => {
      const h = String(location.hash || "").replace(/^#/, "");
      if (h === "review-approval") {
        location.hash = "editing-queue";
        return;
      }
      if (!$("#crmApp")?.classList.contains("crm-hidden")) renderShell();
      ensureCrmMesh({ restart: false });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
