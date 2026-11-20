/* Creator CRM dashboard — desk188 accordion nav + sidebar-only theme */
(function () {
  const PROD_KEY = "tradeshalaCreatorProduction";
  const SOCIAL_KEY = "tradeshalaCreatorSocialLinks";
  const SOCIAL_CACHE_KEY = "tradeshalaCreatorSocialCache";
  const THEME_KEY = "crmTheme";
  const ACCORDION_KEY = "crmAccordionOpen";
  const ACTIVE_DAYS = 14;
  const DEFAULT_PERIOD = 30;

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

    const mentors = typeof MENTORS !== "undefined" ? MENTORS : [];
    const staff = typeof staffList === "function" ? staffList() : [];
    let changed = false;
    mentors.forEach((m) => {
      const email = (m.name.split(" ")[0] || "creator").toLowerCase() + "@bizgarh.in";
      if (!staff.some((s) => String(s.email || "").toLowerCase() === email)) {
        staff.push({
          name: m.name,
          email,
          password: "creator123",
          role: "creator",
          creatorEnabled: true,
          status: "active",
          created: "2026-08-01T10:00:00.000Z"
        });
        changed = true;
      }
    });
    if (changed && typeof writeList === "function") writeList(STAFF_KEY, staff);

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

    // Demo analytics enrolls if empty for creators
    if (typeof seedStaffAndAnalytics === "function") seedStaffAndAnalytics();
    else if (!localStorage.getItem("tradeshalaAnalyticsV2") && typeof readList === "function" && typeof writeList === "function") {
      // minimal enroll seed so metrics are non-zero after first login
      const names = [
        ["Riya Shah", "riya@gmail.com"],
        ["Omkar Kale", "omkar@gmail.com"],
        ["Pooja Nair", "pooja@gmail.com"],
        ["Sahil Khan", "sahil@gmail.com"]
      ];
      const users = readList(USERS_KEY);
      names.forEach(([name, email]) => {
        if (!users.some((u) => u.email === email)) {
          users.push({ name, email, created: new Date(Date.now() - 20 * 86400000).toISOString(), status: "active" });
        }
      });
      writeList(USERS_KEY, users);
      const enrolls = readList(ALL_ENROLL_KEY);
      const courses = typeof allCourses === "function" ? allCourses() : [];
      courses.slice(0, 6).forEach((c, i) => {
        const person = names[i % names.length];
        const at = new Date(Date.now() - (i + 2) * 86400000).toISOString();
        if (!enrolls.some((e) => e.email === person[1] && e.courseId === c.id)) {
          enrolls.push({ name: person[0], email: person[1], courseId: c.id, at });
        }
      });
      writeList(ALL_ENROLL_KEY, enrolls);
      localStorage.setItem("tradeshalaAnalyticsV2", "1");
    }
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

  function creatorAvatar(s) {
    const mentors = typeof MENTORS !== "undefined" ? MENTORS : [];
    const hit = mentors.find((m) => m.name === s.name);
    return (hit && hit.img) || "/img/bizgarh-avatar.png";
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
    return all.filter((e) => mine.has(e.courseId));
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
    if (!revenue) {
      const priceOf = (id) => {
        const c = typeof allCourses === "function" ? allCourses().find((x) => x.id === id) : null;
        return Number(c?.price || 0);
      };
      enrolls.forEach((e) => {
        const amt = priceOf(e.courseId);
        if (inLastDays(e.at, days)) revenue += amt;
        else if (inLastDays(e.at, days * 2) && !inLastDays(e.at, days)) prevRevenue += amt;
      });
    }

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
    try {
      const all = JSON.parse(localStorage.getItem(PROD_KEY) || "{}");
      return all[email] || { scriptsPending: 12, inEditing: 8, awaitingApproval: 5, videosDelivered: 24 };
    } catch {
      return { scriptsPending: 12, inEditing: 8, awaitingApproval: 5, videosDelivered: 24 };
    }
  }

  function saveProduction(email, row) {
    let all = {};
    try { all = JSON.parse(localStorage.getItem(PROD_KEY) || "{}"); } catch { all = {}; }
    all[email] = row;
    localStorage.setItem(PROD_KEY, JSON.stringify(all));
  }

  function socialLinks(email) {
    try {
      const all = JSON.parse(localStorage.getItem(SOCIAL_KEY) || "{}");
      const row = all[email] || {};
      return {
        youtube: row.youtube || "https://www.youtube.com/@bizgarh",
        instagram: row.instagram || "https://www.instagram.com/bizgarh",
        facebook: row.facebook || "https://www.facebook.com/bizgarh"
      };
    } catch {
      return {
        youtube: "https://www.youtube.com/@bizgarh",
        instagram: "https://www.instagram.com/bizgarh",
        facebook: "https://www.facebook.com/bizgarh"
      };
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

  function applyTheme(theme) {
    const next = theme === "light" ? "light" : "dark";
    try { localStorage.setItem(THEME_KEY, next); } catch { /* ignore */ }
    document.documentElement.setAttribute("data-crm-theme", next);
    document.documentElement.style.colorScheme = next;
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) meta.setAttribute("content", next);
    $$(".crm-theme-toggle").forEach((el) => el.setAttribute("data-theme", next));
  }

  function themeToggleHTML(id) {
    const t = getTheme();
    return `<button type="button" class="crm-theme-toggle" id="${esc(id || "")}" data-theme="${t}" aria-label="Theme toggle" title="Switch theme">
      <span class="crm-theme-knob" aria-hidden="true"></span>
      <span class="crm-theme-opt" data-val="dark">DARK</span>
      <span class="crm-theme-opt" data-val="light">LIGHT</span>
    </button>`;
  }

  function showLogin(errMsg) {
    const login = $("#crmLogin");
    const app = $("#crmApp");
    if (login) login.classList.remove("crm-hidden");
    if (app) app.classList.add("crm-hidden");
    const err = $("#crmLoginErr");
    if (err) err.textContent = errMsg || "";
  }

  function showApp() {
    const login = $("#crmLogin");
    const app = $("#crmApp");
    if (login) login.classList.add("crm-hidden");
    if (app) app.classList.remove("crm-hidden");
    renderShell();
  }

  function navSections() {
    return [
      {
        id: "overview",
        label: "Overview",
        icon: "dash",
        items: [
          { id: "dashboard", label: "Dashboard" },
          { id: "analytics", label: "Analytics", stub: true },
          { id: "students", label: "Students", stub: true }
        ]
      },
      {
        id: "creator-studio",
        label: "Creator Studio",
        icon: "clapper",
        items: [
          { id: "scripts", label: "Scripts", stub: true },
          { id: "recording-submissions", label: "Recording Submissions", stub: true },
          { id: "editing-queue", label: "Editing Queue", stub: true },
          { id: "review-approval", label: "Review & Approval", stub: true },
          { id: "content-library", label: "Content Library", stub: true }
        ]
      },
      {
        id: "finance",
        label: "Finance",
        icon: "wallet",
        items: [
          { id: "revenue-orders", label: "Revenue & Orders", stub: true },
          { id: "commissions", label: "Commissions", stub: true },
          { id: "payouts", label: "Payouts", stub: true },
          { id: "refunds", label: "Refunds", stub: true },
          { id: "pending-payments", label: "Pending Payments", stub: true }
        ]
      },
      {
        id: "courses-learning",
        label: "Courses & Learning",
        icon: "book",
        items: [
          { id: "courses", label: "Courses", stub: true },
          { id: "mentorship", label: "Mentorship", stub: true },
          { id: "webinars", label: "Webinars", stub: true },
          { id: "study-materials", label: "Study materials", stub: true },
          { id: "assignments", label: "Assignments", stub: true },
          { id: "classroom-lms", label: "Classroom / LMS", stub: true }
        ]
      },
      {
        id: "support",
        label: "Support",
        icon: "life",
        items: [
          { id: "tickets", label: "Tickets", stub: true },
          { id: "queries", label: "Queries", stub: true }
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
      else if (view === "profile") sub.textContent = "Account and social links for Platform Performance";
      else sub.textContent = "Creator CRM module";
    }
    const who = $("#crmWho");
    if (who) {
      who.innerHTML = `
        <img src="${esc(creatorAvatar(s))}" alt="">
        <span><b>${esc(s.name || "Creator")}</b><small>${esc(s.email || "")}</small></span>`;
    }
    const badge = $("#crmBellBadge");
    const notes = unreadNotes(s.email);
    if (badge) {
      badge.textContent = notes.length ? String(notes.length) : "";
      badge.classList.toggle("crm-hidden", !notes.length);
    }
    renderView(view);
  }

  function renderView(view) {
    const root = $("#crmView");
    if (!root) return;
    const s = session();
    if (!s) return;
    if (view === "profile") return renderProfile(root, s, view);
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
              <p>Track your video production workflow — counts save for this creator.</p>
            </div>
            <a href="#dashboard" id="crmProdSaveHint">Auto-saves</a>
          </div>
          <div class="crm-prod">
            <div class="crm-prod-card pending">
              <div class="crm-prod-ico">${icon("file")}</div>
              <label>Scripts Pending</label>
              <input type="number" min="0" data-prod="scriptsPending" value="${Number(prod.scriptsPending) || 0}">
              <small>Waiting for shooting</small>
            </div>
            <div class="crm-prod-card editing">
              <div class="crm-prod-ico">${icon("scissors")}</div>
              <label>In Editing</label>
              <input type="number" min="0" data-prod="inEditing" value="${Number(prod.inEditing) || 0}">
              <small>Being edited by team</small>
            </div>
            <div class="crm-prod-card approval">
              <div class="crm-prod-ico">${icon("eye")}</div>
              <label>Awaiting Approval</label>
              <input type="number" min="0" data-prod="awaitingApproval" value="${Number(prod.awaitingApproval) || 0}">
              <small>Action required</small>
            </div>
            <div class="crm-prod-card delivered">
              <div class="crm-prod-ico">${icon("check")}</div>
              <label>Videos Delivered</label>
              <input type="number" min="0" data-prod="videosDelivered" value="${Number(prod.videosDelivered) || 0}">
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
            <a href="#profile">Edit links</a>
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
    $$("[data-prod]").forEach((input) => {
      input.addEventListener("change", () => {
        const row = productionStore(s.email);
        row[input.dataset.prod] = Math.max(0, Number(input.value) || 0);
        saveProduction(s.email, row);
        const hint = $("#crmProdSaveHint");
        if (hint) {
          hint.textContent = "Saved";
          setTimeout(() => { hint.textContent = "Auto-saves"; }, 1200);
        }
      });
    });
  }

  async function loadPlatforms(s) {
    const links = socialLinks(s.email);
    const cached = socialCache(s.email);
    renderPlatformCards(cached, links);

    try {
      const res = await fetch("/api/creator/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: s.email, links })
      });
      if (!res.ok) throw new Error("social_http_" + res.status);
      const data = await res.json();
      if (data && data.platforms) {
        saveSocialCache(s.email, data.platforms);
        renderPlatformCards(data.platforms, links);
        return;
      }
    } catch {
      // Local static servers cannot run /api/creator/social — keep cache + clear status
    }
    renderPlatformCards(Object.keys(cached).length ? cached : {
      youtube: { ok: false, count: null, error: "api_offline", hint: "Live counts need Cloudflare Pages /api/creator/social + YOUTUBE_API_KEY" },
      instagram: { ok: false, count: null, error: "api_offline", hint: "Live counts need deploy + optional META_APP_TOKEN" },
      facebook: { ok: false, count: null, error: "api_offline", hint: "Live counts need deploy + optional META_APP_TOKEN" }
    }, links, true);
  }

  function renderPlatformCards(platforms, links, offline) {
    const root = $("#crmPlatforms");
    if (!root) return;
    ["youtube", "instagram", "facebook"].forEach((p) => {
      const el = root.querySelector(`[data-plat="${p}"]`);
      if (!el) return;
      const row = platforms[p] || {};
      const label = p === "youtube" ? "YouTube" : p === "instagram" ? "Instagram" : "Facebook";
      const count = row.count != null ? fmtNum(row.count) : "—";
      let meta = "";
      if (row.deltaPct != null) {
        const up = row.deltaPct >= 0;
        meta = `${up ? "+" : ""}${row.deltaPct}% vs prior 24h snapshot`;
      } else if (row.note === "24h_delta_pending") {
        meta = "Snapshot saved · 24h delta pending";
      } else if (row.error === "link_missing") {
        meta = "Add link in Profile";
      } else if (row.error === "missing_youtube_key" || row.error === "instagram_unavailable" || row.error === "facebook_unavailable" || row.error === "api_offline" || row.error) {
        if (row.count != null) {
          meta = row.stale || offline ? "Last known count · refresh on deploy" : (row.hint ? String(row.hint).slice(0, 72) : "Could not refresh");
        } else if (row.error === "missing_youtube_key") {
          meta = "Needs YOUTUBE_API_KEY in CF env";
        } else if (row.error === "api_offline") {
          meta = "Live on Cloudflare Pages API";
        } else {
          meta = row.hint ? String(row.hint).slice(0, 72) : "Could not refresh · check API keys / links";
        }
      } else if (row.source) {
        meta = row.stale ? "Stale · last good count" : `Live · ${row.source.replace(/_/g, " ")}`;
      } else if (!links[p]) {
        meta = "Add link in Profile";
      } else {
        meta = "Waiting for live count";
      }
      const b = el.querySelector("b");
      const m = el.querySelector(".crm-plat-meta");
      if (b) b.textContent = count === "—" ? "—" : count + (p === "youtube" ? " subscribers" : " followers");
      // Keep number prominent like mock — put unit in meta if long
      if (b && count !== "—") b.textContent = count;
      if (m) m.textContent = (count !== "—" ? (p === "youtube" ? "Subscribers · " : "Followers · ") : "") + meta;
      el.title = links[p] || label;
    });
  }

  function renderProfile(root, s, view) {
    const links = socialLinks(s.email);
    root.innerHTML = `
      <div class="crm-panel-view crm-section">
        <div class="crm-section-head">
          <div>
            <h3>${view === "settings" ? "Settings" : "Profile"}</h3>
            <p>Bizgarh creator ID and social links used for Platform Performance.</p>
          </div>
        </div>
        <div class="crm-form-grid">
          <div class="crm-field"><label>Name</label><input value="${esc(s.name || "")}" disabled></div>
          <div class="crm-field"><label>Email / Bizgarh ID</label><input value="${esc(s.email || "")}" disabled></div>
          <div class="crm-field"><label>Creator ID</label><input value="${esc(s.creatorId || "—")}" disabled></div>
          <div class="crm-field"><label>Referral code</label><input value="${esc(s.referralCode || "—")}" disabled></div>
          <div class="crm-field full"><label>YouTube channel URL</label><input id="crmYt" type="url" placeholder="https://www.youtube.com/@yourchannel" value="${esc(links.youtube)}"></div>
          <div class="crm-field full"><label>Instagram profile URL</label><input id="crmIg" type="url" placeholder="https://www.instagram.com/yourhandle" value="${esc(links.instagram)}"></div>
          <div class="crm-field full"><label>Facebook page URL</label><input id="crmFb" type="url" placeholder="https://www.facebook.com/yourpage" value="${esc(links.facebook)}"></div>
        </div>
        <p id="crmProfileMsg" class="crm-err" style="color:var(--crm-green)"></p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px">
          <button type="button" class="crm-btn crm-btn-primary" id="crmSaveSocial" style="width:auto;padding-inline:22px">Save social links</button>
          <button type="button" class="crm-btn crm-btn-ghost" id="crmRefreshSocial" style="width:auto">Refresh platform counts</button>
          <button type="button" class="crm-btn crm-btn-ghost" id="crmLogout" style="width:auto">Log out</button>
        </div>
        <p class="crm-login-hint" style="margin-top:16px">
          Active students rule: lesson progress on your courses <em>or</em> enrollment in the last ${ACTIVE_DAYS} days.
          Platform deltas compare against a snapshot at least 24 hours old (KV when available).
        </p>
      </div>`;

    $("#crmSaveSocial").onclick = async () => {
      const next = {
        youtube: ($("#crmYt").value || "").trim(),
        instagram: ($("#crmIg").value || "").trim(),
        facebook: ($("#crmFb").value || "").trim()
      };
      saveSocialLinks(s.email, next);
      $("#crmProfileMsg").textContent = "Saved";
      try {
        const res = await fetch("/api/creator/social", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: s.email, links: next, force: true })
        });
        const data = await res.json();
        if (data.platforms) saveSocialCache(s.email, data.platforms);
        $("#crmProfileMsg").textContent = "Saved · platform refresh queued";
      } catch {
        $("#crmProfileMsg").textContent = "Saved locally · live refresh when API is reachable";
      }
    };
    $("#crmRefreshSocial").onclick = () => {
      location.hash = "dashboard";
      setTimeout(() => loadPlatforms(s), 50);
    };
    $("#crmLogout").onclick = () => doLogout();
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
    showApp();
    return false;
  }

  function boot() {
    applyTheme(getTheme());
    ensureCreatorSeed();
    const existing = session();
    if (existing && isCreatorStaff(existing)) {
      showApp();
    } else if (typeof AdminCore !== "undefined" && AdminCore.adoptPublicUser && AdminCore.adoptPublicUser()) {
      const s = session();
      if (s && isCreatorStaff(s)) showApp();
      else showLogin();
    } else {
      showLogin();
    }

    // Delegated handlers — survive re-renders and automation hosts
    document.addEventListener("submit", (e) => {
      if (e.target && e.target.id === "crmLoginForm") tryLogin(e);
    });
    document.addEventListener("click", (e) => {
      const t = e.target;
      if (!t || !t.closest) return;
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
    });

    window.addEventListener("hashchange", () => {
      if (!$("#crmApp")?.classList.contains("crm-hidden")) renderShell();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
