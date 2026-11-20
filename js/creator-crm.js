/* Creator CRM dashboard — desk197 caption fix + desk196 mesh + Studio (no-upload; queue badges) */
(function () {
  const PROD_KEY = "tradeshalaCreatorProduction";
  const SOCIAL_KEY = "tradeshalaCreatorSocialLinks";
  const SOCIAL_CACHE_KEY = "tradeshalaCreatorSocialCache";
  const THEME_KEY = "crmTheme";
  const ACCORDION_KEY = "crmAccordionOpen";
  const STUDIO_SCRIPTS_KEY = "crmStudioScriptsV1";
  const STUDIO_RECORDINGS_KEY = "crmStudioRecordingsV1";
  const STUDIO_QUEUE_KEY = "crmStudioEditingQueueV1";
  const STUDIO_LIBRARY_KEY = "crmStudioContentLibraryV1";
  const ACTIVE_DAYS = 14;
  const DEFAULT_PERIOD = 30;
  const EDIT_STATUSES = ["Under Review", "Editing", "Revision", "Completed"];
  const VIDEO_ACCEPT = "video/*,.mp4,.webm,.mov,.m4v,.avi,.mkv";
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

  function seedStudioScripts(email) {
    const rows = [
      { id: "script_demo_1", name: "Module-1-Opening-Script.pdf", size: 48200, mime: "application/pdf", uploadedAt: "2026-11-12T09:10:00.000Z", demo: true },
      { id: "script_demo_2", name: "Live-Session-Talking-Points.docx", size: 31800, mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", uploadedAt: "2026-11-14T14:22:00.000Z", demo: true }
    ];
    rows.forEach((r) => ensureDemoBlob(r.id, r.name, r.mime, `Demo script\n${r.name}\n`));
    writeStudioBucket(STUDIO_SCRIPTS_KEY, email, rows);
    return rows;
  }

  function seedStudioRecordings(email) {
    const rows = [
      { id: "rec_demo_1", name: "Take-A-Intro-Hook.mp4", size: 18400000, mime: "video/mp4", uploadedAt: "2026-11-15T11:05:00.000Z", demo: true },
      { id: "rec_demo_2", name: "Take-B-Chart-Walkthrough.webm", size: 22100000, mime: "video/webm", uploadedAt: "2026-11-16T16:40:00.000Z", demo: true }
    ];
    rows.forEach((r) => ensureDemoBlob(r.id, r.name, r.mime, `Demo video placeholder for ${r.name}`));
    writeStudioBucket(STUDIO_RECORDINGS_KEY, email, rows);
    return rows;
  }

  function seedStudioQueue(email) {
    const rows = [
      { id: "eq_demo_1", title: "Price Action Mastery — Episode 12", status: "Under Review" },
      { id: "eq_demo_2", title: "Options Weekly Recap", status: "Editing" },
      { id: "eq_demo_3", title: "Risk Rules for Beginners", status: "Revision" },
      { id: "eq_demo_4", title: "Index Futures Warm-up", status: "Completed" }
    ];
    writeStudioBucket(STUDIO_QUEUE_KEY, email, rows);
    return rows;
  }

  function seedStudioLibrary(email) {
    const rows = [
      {
        id: "lib_demo_1",
        title: "Opening Range Breakout Explained",
        caption: "A calm walkthrough of ORB setups with risk notes for new traders.",
        pdfName: "ORB-cheat-sheet.pdf",
        pdfId: "lib_demo_1_pdf",
        videoName: "orb-explained.mp4",
        thumb: "",
        uploadedAt: "2026-11-10T08:00:00.000Z",
        demo: true
      },
      {
        id: "lib_demo_2",
        title: "Position Sizing in 8 Minutes",
        caption: "Practical sizing rules — never risk more than you can sleep with.",
        pdfName: "position-sizing.pdf",
        pdfId: "lib_demo_2_pdf",
        videoName: "position-sizing.mp4",
        thumb: "",
        uploadedAt: "2026-11-13T12:30:00.000Z",
        demo: true
      }
    ];
    rows.forEach((r) => {
      ensureDemoBlob(r.id, r.videoName, "video/mp4", `Demo library video: ${r.title}`);
      ensureDemoBlob(r.pdfId, r.pdfName, "application/pdf", `Demo PDF for ${r.title}`);
    });
    writeStudioBucket(STUDIO_LIBRARY_KEY, email, rows);
    return rows;
  }

  function studioScripts(email) {
    const existing = readStudioBucket(STUDIO_SCRIPTS_KEY, email);
    if (existing) {
      existing.forEach((r) => {
        if (r.demo) ensureDemoBlob(r.id, r.name, r.mime, `Demo script\n${r.name}\n`);
      });
      return existing;
    }
    return seedStudioScripts(email);
  }

  function studioRecordings(email) {
    const existing = readStudioBucket(STUDIO_RECORDINGS_KEY, email);
    if (existing) {
      existing.forEach((r) => {
        if (r.demo) ensureDemoBlob(r.id, r.name, r.mime, `Demo video placeholder for ${r.name}`);
      });
      return existing;
    }
    return seedStudioRecordings(email);
  }

  function studioQueue(email) {
    const existing = readStudioBucket(STUDIO_QUEUE_KEY, email);
    if (existing) return existing;
    return seedStudioQueue(email);
  }

  function studioLibrary(email) {
    const existing = readStudioBucket(STUDIO_LIBRARY_KEY, email);
    if (existing) {
      existing.forEach((r) => {
        if (r.demo) {
          ensureDemoBlob(r.id, r.videoName || `${r.title}.mp4`, "video/mp4", `Demo library video: ${r.title}`);
          if (r.pdfId) ensureDemoBlob(r.pdfId, r.pdfName || "notes.pdf", "application/pdf", `Demo PDF for ${r.title}`);
        }
      });
      return existing;
    }
    return seedStudioLibrary(email);
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
        <span class="crm-drop-ico">${icon(kind === "scripts" ? "file" : "clapper")}</span>
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
    }
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

    // Keep backdrop base in sync with theme (FOUC + inline style)
    const base = getTheme() === "light" ? "#ffffff" : "#0c1834";
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
      [layerA, layerB].forEach((el) => {
        if (!el) return;
        el.style.animationPlayState = "running";
      });
    };

    if (restart) kick();
    else {
      // Ensure play-state even without a full restart
      [layerA, layerB].forEach((el) => {
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
    document.documentElement.style.background = next === "light" ? "#ffffff" : "#0c1834";
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

  function showLogin(errMsg) {
    const login = $("#crmLogin");
    const app = $("#crmApp");
    if (login) login.classList.remove("crm-hidden");
    if (app) app.classList.add("crm-hidden");
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
          { id: "students", label: "Students", stub: true }
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
    // Review & Approval removed — flow lives in Editing Queue + Content Library
    if (h === "review-approval") return "editing-queue";
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
      else if (view === "profile") sub.textContent = "Account and social links for Platform Performance";
      else if (view === "scripts") sub.textContent = "Scripts from the Bizgarh team — download or delete anytime";
      else if (view === "recording-submissions") sub.textContent = "Drop raw video takes for the editing desk";
      else if (view === "editing-queue") sub.textContent = "View status for each cut — team updates the queue";
      else if (view === "content-library") sub.textContent = "Approved videos, captions, and PDF attachments";
      else if (view === "review-approval") sub.textContent = "Covered by Editing Queue and Content Library";
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
    if (view === "analytics") return renderAnalytics(root, s);
    if (view === "scripts") return renderScripts(root, s);
    if (view === "recording-submissions") return renderRecordings(root, s);
    if (view === "editing-queue") return renderEditingQueue(root, s);
    if (view === "content-library") return renderContentLibrary(root, s);
    if (view === "review-approval") {
      location.hash = "editing-queue";
      return renderEditingQueue(root, s);
    }
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
        o.creatorEmail === staff.email || mine.has(o.courseId)
      );
    }
    if (!orders.length) {
      // Fallback: synthesize from enrolls × course price so analytics stays populated offline
      orders = creatorEnrolls(staff).map((e, i) => ({
        id: "syn-" + i + "-" + (e.email || "").slice(0, 6),
        email: e.email,
        name: e.name,
        courseId: e.courseId,
        amount: coursePrice(e.courseId),
        net: coursePrice(e.courseId),
        status: "PAID",
        method: "upi",
        tx: "TXN" + String(1000 + i),
        at: e.at
      }));
    }
    return orders;
  }

  function ensureOutstandingDemo(staff) {
    if (typeof AdminCore === "undefined" || !AdminCore.orders || typeof saveStore !== "function") return;
    try {
      if (localStorage.getItem("crmAnalyticsOutstandingV1")) return;
      const orders = AdminCore.orders();
      const courseIds = ownedCourseIds(staff);
      if (!courseIds.length) return;
      const demo = [
        { name: "Ankit Rao", email: "ankit.rao@gmail.com", days: 9, status: "PENDING" },
        { name: "Sneha Patel", email: "sneha.p@gmail.com", days: 18, status: "PENDING" },
        { name: "Vikram Gill", email: "vikram.g@gmail.com", days: 27, status: "FAILED" },
        { name: "Nisha Bhatt", email: "nisha.b@gmail.com", days: 5, status: "PENDING" },
        { name: "Karan Malhotra", email: "karan.m@gmail.com", days: 35, status: "PENDING" },
        { name: "Divya Iyer", email: "divya.i@gmail.com", days: 12, status: "PENDING" }
      ];
      demo.forEach((d, i) => {
        const cid = courseIds[i % courseIds.length];
        const price = coursePrice(cid);
        if (!price) return;
        if (orders.some((o) => o.email === d.email && o.courseId === cid && o.status !== "PAID")) return;
        orders.push({
          id: "out-" + (i + 1),
          email: d.email,
          name: d.name,
          courseId: cid,
          amount: price,
          discount: 0,
          tax: 0,
          net: price,
          status: d.status,
          coupon: "",
          creatorEmail: staff.email,
          referralCode: "",
          tx: d.status === "FAILED" ? "TXNFAIL" + (i + 1) : "",
          at: new Date(Date.now() - d.days * 86400000).toISOString()
        });
      });
      if (typeof saveStore === "function" && typeof ORDER_KEY !== "undefined") saveStore(ORDER_KEY, orders);
      else if (typeof writeList === "function") writeList("tradeshalaOrders", orders);
      else localStorage.setItem("tradeshalaOrders", JSON.stringify(orders));
      localStorage.setItem("crmAnalyticsOutstandingV1", "1");
    } catch { /* ignore */ }
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
    // If all zero (sparse demo), lightly distribute owned revenue so charts still read
    if (buckets.every((b) => !b.revenue)) {
      const m = computeMetrics(staff, DEFAULT_PERIOD);
      const base = Math.max(m.revenue, courseIds.length * 99) / buckets.length;
      return buckets.map((b, i) => ({
        ...b,
        revenue: Math.round(base * (0.55 + (i % 5) * 0.18))
      }));
    }
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
    // Seed light progress for demo when store is empty so completion rate isn't always 0
    if (completionRows.every((r) => !r.progress)) {
      completionRows.forEach((r, i) => {
        r.progress = [0, 25, 48, 72, 100, 36, 88, 12][i % 8];
        r.status = r.progress >= 100 ? "Completed" : r.progress >= 40 ? "In progress" : "Started";
      });
      // Mirror seeded progress onto student summary rows
      studentRows.forEach((s) => {
        const mine = completionRows.filter((r) => String(r.email || "").toLowerCase() === String(s.email || "").toLowerCase());
        if (!mine.length) return;
        s.progress = Math.round(mine.reduce((a, r) => a + Number(r.progress || 0), 0) / mine.length);
      });
    }
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
      .slice()
      .sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0))
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
      .slice()
      .sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0))
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
        .slice()
        .sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0))
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
      .slice()
      .sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0))
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
    ensureCrmMesh({ restart: true });
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
        if (!confirm("Delete this file from Creator Studio?")) return;
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
      if (e.key === "Escape") closeAnalyticsSheet();
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
