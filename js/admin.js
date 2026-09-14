const OWNER = { name: "Platform Owner", email: "admin@bizgarh.in", password: "admin123", role: "owner" };

function seedAdminDemo() {
  if (localStorage.getItem("tradeshalaAdminSeeded")) return;
  const users = readList(USERS_KEY);
  const demo = [
    { name: "Ritesh Kulkarni", email: "ritesh@gmail.com", created: "2026-08-12T10:00:00.000Z" },
    { name: "Sneha Bansal", email: "sneha@gmail.com", created: "2026-08-18T10:00:00.000Z" },
    { name: "Aditya Menon", email: "aditya@gmail.com", created: "2026-09-01T10:00:00.000Z" },
    { name: "Kavya Iyer", email: "kavya@gmail.com", created: "2026-09-04T10:00:00.000Z" },
    { name: "Harsh Patel", email: "harsh@gmail.com", created: "2026-09-08T10:00:00.000Z" }
  ];
  demo.forEach((u) => {
    if (!users.some((x) => x.email === u.email)) users.push(u);
  });
  writeList(USERS_KEY, users);

  const enrolls = readList(ALL_ENROLL_KEY);
  const demoEn = [
    { name: "Ritesh Kulkarni", email: "ritesh@gmail.com", courseId: "breakout", at: "2026-08-12T11:00:00.000Z" },
    { name: "Ritesh Kulkarni", email: "ritesh@gmail.com", courseId: "opt-start", at: "2026-08-13T11:00:00.000Z" },
    { name: "Sneha Bansal", email: "sneha@gmail.com", courseId: "hindi-ta", at: "2026-08-18T12:00:00.000Z" },
    { name: "Aditya Menon", email: "aditya@gmail.com", courseId: "long-term", at: "2026-09-01T09:00:00.000Z" },
    { name: "Kavya Iyer", email: "kavya@gmail.com", courseId: "income", at: "2026-09-04T14:00:00.000Z" },
    { name: "Harsh Patel", email: "harsh@gmail.com", courseId: "first-month", at: "2026-09-08T16:00:00.000Z" }
  ];
  demoEn.forEach((e) => {
    if (!enrolls.some((x) => x.email === e.email && x.courseId === e.courseId)) enrolls.push(e);
  });
  writeList(ALL_ENROLL_KEY, enrolls);

  const regs = readList(REGS_KEY);
  if (!regs.length) {
    writeList(REGS_KEY, [
      { id: "w1", name: "Ritesh Kulkarni", email: "ritesh@gmail.com", at: "2026-09-09T08:00:00.000Z" },
      { id: "w2", name: "Sneha Bansal", email: "sneha@gmail.com", at: "2026-09-10T08:00:00.000Z" }
    ]);
  }
  localStorage.setItem("tradeshalaAdminSeeded", "1");
}

function seedStaffAndAnalytics() {
  seedAdminDemo();
  seedLms();
  const staff = staffList();
  MENTORS.forEach((m) => {
    const email = m.name.split(" ")[0].toLowerCase() + "@bizgarh.in";
    if (!staff.some((s) => s.email === email)) {
      staff.push({ name: m.name, email, password: "creator123", role: "creator" });
    }
  });
  writeList(STAFF_KEY, staff);

  const owners = courseOwners();
  allCourses().forEach((c) => {
    if (!owners[c.id]) {
      const match = staff.find((s) => s.role === "creator" && s.name === c.instructor);
      if (match) owners[c.id] = match.email;
    }
  });
  setCourseOwners(owners);

  if (localStorage.getItem("tradeshalaAnalyticsV2")) return;
  const names = [
    ["Riya Shah", "riya@gmail.com"],
    ["Omkar Kale", "omkar@gmail.com"],
    ["Pooja Nair", "pooja@gmail.com"],
    ["Sahil Khan", "sahil@gmail.com"],
    ["Dev Joshi", "dev@gmail.com"],
    ["Mehul Shah", "mehul@gmail.com"]
  ];
  const users = readList(USERS_KEY);
  names.forEach(([name, email]) => {
    if (!users.some((u) => u.email === email)) {
      users.push({ name, email, created: new Date(Date.now() - 40 * 86400000).toISOString() });
    }
  });
  writeList(USERS_KEY, users);

  const enrolls = readList(ALL_ENROLL_KEY);
  const courseIds = allCourses().map((c) => c.id);
  for (let w = 0; w < 8; w++) {
    const count = 3 + (w % 3);
    for (let i = 0; i < count; i++) {
      const person = names[(w + i) % names.length];
      const cid = courseIds[(w * 2 + i) % courseIds.length];
      const at = new Date(Date.now() - (7 - w) * 7 * 86400000 - i * 3600000).toISOString();
      if (!enrolls.some((e) => e.email === person[1] && e.courseId === cid && e.at === at)) {
        enrolls.push({ name: person[0], email: person[1], courseId: cid, at });
      }
    }
  }
  writeList(ALL_ENROLL_KEY, enrolls);
  localStorage.setItem("tradeshalaAnalyticsV2", "1");
}

function inr(n) { return "₹" + Math.round(Number(n || 0)).toLocaleString("en-IN"); }

function staffNow() { return getStaffSession(); }
function isOwner() { return staffNow()?.role === "owner"; }

function scopedCourses() {
  const s = staffNow();
  const list = allCourses();
  if (!s || s.role === "owner") return list;
  return list.filter((c) => ownerEmailOf(c) === s.email || c.instructor === s.name);
}
function scopedEnrolls() {
  const ids = new Set(scopedCourses().map((c) => c.id));
  return readList(ALL_ENROLL_KEY).filter((e) => ids.has(e.courseId));
}
function scopedLives() {
  const s = staffNow();
  const list = allWebinars();
  if (!s || s.role === "owner") return list;
  return list.filter((w) => w.hostEmail === s.email || w.by === s.name);
}
function canEditCourse(c) {
  const s = staffNow();
  if (!s) return false;
  if (isOwner()) return true;
  return ownerEmailOf(c) === s.email || c.instructor === s.name;
}
function courseById(id) { return allCourses().find((c) => c.id === id); }

function table(headers, rows) {
  if (!rows.length) return `<p class="muted" style="padding:12px 0">No records yet.</p>`;
  return `<div class="table-wrap"><table class="admin-table"><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
}

function weekBuckets(enrolls) {
  const now = Date.now();
  return Array.from({ length: 8 }, (_, i) => {
    const end = now - (7 - i) * 7 * 86400000;
    const start = end - 7 * 86400000;
    const label = new Date(start + 86400000).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    const slice = enrolls.filter((e) => {
      const t = new Date(e.at).getTime();
      return t >= start && t < end;
    });
    const revenue = slice.reduce((s, e) => s + Number(courseById(e.courseId)?.price || 0), 0);
    return { label, count: slice.length, revenue };
  });
}

function lineChart(values, color) {
  const w = 520, h = 160, p = 8;
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => {
    const x = p + (i / Math.max(values.length - 1, 1)) * (w - p * 2);
    const y = h - p - (v / max) * (h - p * 2);
    return `${x},${y}`;
  });
  const fill = `${p},${h - p} ${pts.join(" ")} ${w - p},${h - p}`;
  return `<svg viewBox="0 0 ${w} ${h}" class="chart-svg" preserveAspectRatio="none">
    <polyline points="${fill}" fill="${color}22" stroke="none"></polyline>
    <polyline points="${pts.join(" ")}" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round"></polyline>
  </svg>`;
}

function barRows(items, valueKey) {
  const max = Math.max(...items.map((x) => x[valueKey]), 1);
  return items.map((x) => `
    <div class="bar-row">
      <span>${x.label}</span>
      <div class="bar-track"><i style="width:${Math.max(6, (x[valueKey] / max) * 100)}%"></i></div>
      <b>${x.display}</b>
    </div>`).join("") || `<p class="muted">No data yet.</p>`;
}

function renderOverview() {
  const courses = scopedCourses();
  const enrolls = scopedEnrolls();
  const students = [...new Set(enrolls.map((e) => e.email))];
  const revenue = enrolls.reduce((s, e) => s + Number(courseById(e.courseId)?.price || 0), 0);
  const weeks = weekBuckets(enrolls);
  const thisW = weeks[weeks.length - 1] || { count: 0, revenue: 0 };
  const lastW = weeks[weeks.length - 2] || { count: 0, revenue: 0 };
  const arpu = students.length ? revenue / students.length : 0;
  const watch = enrolls.reduce((s, e) => s + Number(courseById(e.courseId)?.hours || 4) * 0.62, 0);

  function delta(cur, prev) {
    if (!prev) return "—";
    const d = Math.round(((cur - prev) / prev) * 100);
    const cls = d >= 0 ? "up" : "down";
    return `<small class="${cls}">${d >= 0 ? "+" : ""}${d}% vs last week</small>`;
  }

  document.getElementById("statGrid").innerHTML = [
    ["Revenue", inr(revenue), delta(thisW.revenue, lastW.revenue)],
    ["Enrollments", enrolls.length, delta(thisW.count, lastW.count)],
    ["Active students", students.length, ""],
    ["Avg. order value", inr(arpu), `${Math.round(watch)} watch hrs`]
  ].map(([k, v, d]) => `<div class="admin-stat"><span>${k}</span><b>${v}</b>${d || ""}</div>`).join("");

  document.getElementById("revChart").innerHTML = lineChart(weeks.map((w) => w.revenue), "#4f46e5") +
    `<div class="chart-labels">${weeks.map((w) => `<span>${w.label}</span>`).join("")}</div>`;
  document.getElementById("enrollChart").innerHTML = lineChart(weeks.map((w) => w.count), "#e11d74") +
    `<div class="chart-labels">${weeks.map((w) => `<span>${w.label}</span>`).join("")}</div>`;

  const byCourse = {};
  enrolls.forEach((e) => {
    const c = courseById(e.courseId);
    if (!c) return;
    byCourse[c.id] = byCourse[c.id] || { label: c.title, revenue: 0, count: 0 };
    byCourse[c.id].revenue += Number(c.price);
    byCourse[c.id].count += 1;
  });
  const top = Object.values(byCourse).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
    .map((x) => ({ label: x.label, value: x.revenue, display: `${inr(x.revenue)} · ${x.count}` }));
  document.getElementById("topCourses").innerHTML = barRows(top, "value");

  const byCat = {};
  enrolls.forEach((e) => {
    const cat = courseById(e.courseId)?.cat || "other";
    byCat[cat] = (byCat[cat] || 0) + 1;
  });
  const mix = Object.entries(byCat).map(([label, value]) => ({ label, value, display: value }));
  document.getElementById("catMix").innerHTML = barRows(mix, "value");

  const board = staffList().filter((s) => s.role === "creator").map((s) => {
    const mine = allCourses().filter((c) => ownerEmailOf(c) === s.email || c.instructor === s.name);
    const ids = new Set(mine.map((c) => c.id));
    const en = readList(ALL_ENROLL_KEY).filter((e) => ids.has(e.courseId));
    const rev = en.reduce((sum, e) => sum + Number(courseById(e.courseId)?.price || 0), 0);
    return { name: s.name, email: s.email, courses: mine.length, enrolls: en.length, revenue: rev };
  }).sort((a, b) => b.revenue - a.revenue);

  const scopedBoard = isOwner() ? board : board.filter((b) => b.email === staffNow().email);
  document.getElementById("creatorBoard").innerHTML = table(
    ["Creator", "Courses", "Enrolls", "Revenue"],
    scopedBoard.map((b) => `<tr><td>${b.name}<div class="muted">${b.email}</div></td><td>${b.courses}</td><td>${b.enrolls}</td><td>${inr(b.revenue)}</td></tr>`)
  );
}

function renderCoursesAdmin() {
  const extraIds = extraCourses().map((c) => c.id);
  const s = staffNow();
  document.getElementById("courseTable").innerHTML = table(
    ["Course", "Creator", "Price", "Category", ""],
    scopedCourses().map((c) => {
      const owner = ownerEmailOf(c);
      const canDel = extraIds.includes(c.id) && (isOwner() || owner === s.email);
      return `<tr>
        <td>${c.title}</td>
        <td>${c.instructor}</td>
        <td>${inr(c.price)}</td>
        <td>${c.cat}</td>
        <td class="admin-actions">
          ${canEditCourse(c) ? `<button class="btn btn-ghost" data-videos-course="${c.id}">Videos</button>` : ""}
          ${canEditCourse(c) ? `<button class="btn btn-ghost" data-edit-course="${c.id}">Edit</button>` : ""}
          ${canDel
            ? `<button class="btn btn-ghost" data-del-course="${c.id}">Remove</button>`
            : (isOwner() ? `<button class="btn btn-ghost" data-hide-course="${c.id}">Hide</button>` : "")}
        </td>
      </tr>`;
    })
  );
}

function renderStudents() {
  const emails = new Set(scopedEnrolls().map((e) => e.email));
  const rows = readList(USERS_KEY).filter((u) => isOwner() || emails.has(u.email)).slice().reverse();
  document.getElementById("studentTable").innerHTML = table(
    ["Name", "Email", "Joined"],
    rows.map((u) => `<tr><td>${u.name}</td><td>${u.email}</td><td>${new Date(u.created).toLocaleDateString("en-IN")}</td></tr>`)
  );
}

function renderEnrolls() {
  document.getElementById("enrollTable").innerHTML = table(
    ["Student", "Course", "Amount", "Date"],
    scopedEnrolls().slice().reverse().map((e) => {
      const c = courseById(e.courseId);
      return `<tr><td>${e.name}<div class="muted">${e.email}</div></td><td>${c?.title || e.courseId}</td><td>${inr(c?.price || 0)}</td><td>${new Date(e.at).toLocaleString("en-IN")}</td></tr>`;
    })
  );
}

function renderLiveAdmin() {
  const s = staffNow();
  const lives = scopedLives().slice().sort((a, b) => new Date(a.at) - new Date(b.at));
  document.getElementById("liveListHeading").textContent = isOwner() ? "All live classes" : "Your live classes";
  document.getElementById("liveClassTable").innerHTML = table(
    ["Class", "When", "Status", "Signups", ""],
    lives.map((w) => {
      const n = readList(REGS_KEY).filter((r) => r.id === w.id).length;
      const host = w.hostEmail === s.email;
      return `<tr>
        <td>${w.title}<div class="muted">${w.by}</div></td>
        <td>${w.when}</td>
        <td><span class="live-status ${w.status || "scheduled"}">${w.status || "scheduled"}</span></td>
        <td>${n}</td>
        <td class="admin-actions">
          ${host && w.status !== "ended" ? `<a class="btn btn-primary" href="/live-room?id=${w.id}">${w.status === "live" ? "Enter room" : "Open room"}</a>` : ""}
          ${host || isOwner() ? `<button class="btn btn-ghost" data-del-live="${w.id}">Remove</button>` : ""}
        </td>
      </tr>`;
    })
  );
  document.getElementById("liveTable").innerHTML = table(
    ["Class", "Student", "Email", "Date"],
    readList(REGS_KEY).filter((r) => lives.some((w) => w.id === r.id)).slice().reverse().map((r) => {
      const live = allWebinars().find((w) => w.id === r.id);
      return `<tr><td>${live?.title || r.id}</td><td>${r.name}</td><td>${r.email}</td><td>${new Date(r.at).toLocaleString("en-IN")}</td></tr>`;
    })
  );
}

function renderCreators() {
  const sel = document.querySelector("#addCreatorForm select[name=courseId]");
  if (sel) {
    sel.innerHTML = `<option value="">Assign a course (optional)</option>` +
      allCourses().map((c) => `<option value="${c.id}">${c.title} — ${c.instructor}</option>`).join("");
  }
  document.getElementById("creatorTable").innerHTML = table(
    ["Creator", "Email", "Courses", ""],
    staffList().filter((s) => s.role === "creator").map((s) => {
      const n = allCourses().filter((c) => ownerEmailOf(c) === s.email || c.instructor === s.name).length;
      return `<tr><td>${s.name}</td><td>${s.email}<div class="muted">password set</div></td><td>${n}</td>
        <td><button class="btn btn-ghost" data-del-staff="${s.email}">Remove</button></td></tr>`;
    })
  );
}

function selectedLmsCourse() {
  const id = document.getElementById("lmsCourseSel")?.value;
  return scopedCourses().find((c) => c.id === id) || scopedCourses()[0];
}

function fillCourseSelects() {
  const opts = `<option value="">All / general</option>` + scopedCourses().map((c) => `<option value="${c.id}">${c.title}</option>`).join("");
  ["lmsCourseSel", "tgCourseSel", "postCourseSel"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const keep = el.value;
    if (id === "lmsCourseSel") {
      el.innerHTML = scopedCourses().map((c) => `<option value="${c.id}">${c.title}</option>`).join("") || `<option>No courses</option>`;
    } else {
      el.innerHTML = opts;
    }
    if ([...el.options].some((o) => o.value === keep)) el.value = keep;
  });
  const mentors = staffList().filter((s) => s.role === "creator");
  const msel = document.getElementById("callMentorSel");
  if (msel) {
    const mine = staffNow();
    msel.innerHTML = (isOwner() ? mentors : mentors.filter((x) => x.email === mine.email)).map((s) =>
      `<option value="${s.email}">${s.name}</option>`).join("");
    if (!isOwner() && mine) msel.value = mine.email;
  }
}

function parseQuizBlocks(text) {
  const blocks = String(text || "").split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((block) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const q = lines[0] || "Untitled question";
    const options = [];
    let answer = 0;
    lines.slice(1).forEach((line) => {
      const m = line.match(/^(?:([A-Da-d])\)\s*|-\s*)(.+)/);
      const ans = line.match(/^Answer:\s*([A-Da-d]|\d)/i);
      if (ans) {
        const v = ans[1].toUpperCase();
        answer = /[A-D]/.test(v) ? v.charCodeAt(0) - 65 : Math.max(0, Number(v) - 1);
      } else if (m) options.push(m[2]);
      else options.push(line);
    });
    return { q, options: options.length ? options : ["True", "False"], answer };
  }).filter((x) => x.q);
}

function renderClassroom() {
  fillCourseSelects();
  const c = selectedLmsCourse();
  if (!c) {
    document.getElementById("lmsStats").innerHTML = `<p class="muted">Publish a course first.</p>`;
    return;
  }
  const enrolls = scopedEnrolls().filter((e) => e.courseId === c.id);
  document.getElementById("lmsStats").innerHTML = [
    ["Lessons", lessonsFor(c.id).length],
    ["Quizzes", quizzesOf(c.id).length],
    ["Assignments", assignmentsOf(c.id).length],
    ["Certificates", certs().filter((x) => x.courseId === c.id).length]
  ].map(([k, v]) => `<div class="admin-stat"><span>${k}</span><b>${v}</b></div>`).join("");

  document.getElementById("quizTable").innerHTML = table(
    ["Quiz", "Questions", "Pass", ""],
    quizzesOf(c.id).map((q) => `<tr><td>${q.title}</td><td>${(q.questions || []).length}</td><td>${q.passScore}%</td>
      <td><button class="btn btn-ghost" data-del-quiz="${q.id}" data-course="${c.id}">Remove</button></td></tr>`)
  );
  document.getElementById("assignTable").innerHTML = table(
    ["Assignment", "Due", ""],
    assignmentsOf(c.id).map((a) => `<tr><td>${a.title}</td><td>${a.due || "—"}</td>
      <td><button class="btn btn-ghost" data-del-assign="${a.id}" data-course="${c.id}">Remove</button></td></tr>`)
  );
  document.getElementById("progressTable").innerHTML = table(
    ["Student", "Lessons", "Quizzes", "Progress", ""],
    enrolls.map((e) => {
      const p = courseCompletion(e.email, c.id);
      return `<tr><td>${e.name}<div class="muted">${e.email}</div></td>
        <td>${p.done}/${p.total}</td><td>${p.passed}/${p.quizCount}</td>
        <td>${p.pct}%</td>
        <td>${p.cert ? `<a class="btn btn-ghost" href="/certificate?course=${c.id}&email=${encodeURIComponent(e.email)}" target="_blank">Certificate</a>`
          : `<button class="btn btn-ghost" data-issue-cert="${c.id}" data-email="${e.email}" data-name="${e.name}">Issue cert</button>`}</td></tr>`;
    })
  );
  const subs = assignSubs().filter((s) => s.courseId === c.id);
  document.getElementById("assignSubTable").innerHTML = table(
    ["Student", "Assignment", "Submitted", "Status", ""],
    subs.slice().reverse().map((s) => {
      const a = assignmentsOf(c.id).find((x) => x.id === s.assignmentId);
      return `<tr><td>${s.name}<div class="muted">${s.email}</div></td><td>${a?.title || s.assignmentId}</td>
        <td>${new Date(s.at).toLocaleString("en-IN")}</td><td>${s.status}</td>
        <td class="admin-actions">
          <button class="btn btn-ghost" data-grade="${s.id}" data-status="accepted">Accept</button>
          <button class="btn btn-ghost" data-grade="${s.id}" data-status="revision">Ask revision</button>
        </td></tr>`;
    })
  );
}

function scopedCalls() {
  const s = staffNow();
  const list = callRequests();
  if (!s || isOwner()) return list;
  return list.filter((c) => c.mentorEmail === s.email || c.mentor === s.name || !c.mentorEmail);
}
function scopedAffiliates() {
  const s = staffNow();
  const list = affiliates();
  if (!s || isOwner()) return list;
  return list.filter((a) => a.email === s.email);
}
function scopedReferrals() {
  const s = staffNow();
  const list = referrals();
  if (!s || isOwner()) return list;
  const mine = new Set(scopedCourses().map((c) => c.id));
  return list.filter((r) => r.affiliateEmail === s.email || mine.has(r.courseId));
}
function scopedChannels() {
  const s = staffNow();
  const list = telegramChannels();
  if (!s || isOwner()) return list;
  return list.filter((c) => c.creatorEmail === s.email);
}
function scopedPosts() {
  const s = staffNow();
  const list = forumPosts();
  if (!s || isOwner()) return list;
  const ids = new Set(scopedCourses().map((c) => c.id));
  return list.filter((p) => !p.courseId || ids.has(p.courseId) || p.email === s.email);
}

function renderCallsAdmin() {
  fillCourseSelects();
  document.getElementById("callTable").innerHTML = table(
    ["Student", "Topic", "When", "Mentor", "Status", ""],
    scopedCalls().slice().reverse().map((c) => `<tr>
      <td>${c.name}<div class="muted">${c.email}</div></td>
      <td>${c.topic}</td>
      <td>${c.date} ${c.time || ""}</td>
      <td>${c.mentor || "—"}</td>
      <td><span class="live-status ${c.status}">${c.status}</span></td>
      <td class="admin-actions">
        ${c.status === "pending" ? `<button class="btn btn-ghost" data-call="${c.id}" data-status="approved">Approve</button>` : ""}
        ${c.status !== "done" ? `<button class="btn btn-ghost" data-call="${c.id}" data-status="done">Mark done</button>` : ""}
        ${c.status === "approved" ? `<a class="btn btn-ghost" href="/live-room?type=call&id=${c.id}">Join</a>` : ""}
        <button class="btn btn-ghost" data-del-call="${c.id}">Remove</button>
      </td></tr>`)
  );
}

function renderAffiliateAdmin() {
  const st = platformSettings();
  const f = document.getElementById("affSettingsForm");
  if (f) {
    f.affiliateEnabled.value = st.affiliateEnabled ? "1" : "0";
    f.defaultCommission.value = st.defaultCommission;
  }
  document.getElementById("affTable").innerHTML = table(
    ["Affiliate", "Code", "Rate", "Due", "Status", ""],
    scopedAffiliates().map((a) => {
      const bal = affiliateBalance(a.email);
      return `<tr><td>${a.name}<div class="muted">${a.email}</div></td><td>${a.code}</td><td>${a.rate}%</td>
        <td>${inr(bal.due)}</td><td>${a.status}</td>
        <td class="admin-actions">
          ${a.status !== "active" ? `<button class="btn btn-ghost" data-aff="${a.email}" data-status="active">Approve</button>` : `<button class="btn btn-ghost" data-aff="${a.email}" data-status="paused">Pause</button>`}
        </td></tr>`;
    })
  );
  document.getElementById("refTable").innerHTML = table(
    ["Affiliate", "Buyer", "Course", "Commission", "Status", ""],
    scopedReferrals().slice().reverse().map((r) => {
      const c = courseById(r.courseId);
      return `<tr><td>${r.code}</td><td>${r.name}<div class="muted">${r.email}</div></td>
        <td>${c?.title || r.courseId}</td><td>${inr(r.commission)}</td><td>${r.status}</td>
        <td>${r.status === "unpaid" ? `<button class="btn btn-ghost" data-mark-ref="${r.id}">Mark paid</button>` : "—"}</td></tr>`;
    })
  );
  const po = payouts().filter((p) => isOwner() || p.email === staffNow().email);
  document.getElementById("payoutTable").innerHTML = table(
    ["Affiliate", "Amount", "Status", "Date"],
    po.slice().reverse().map((p) => `<tr><td>${p.email}</td><td>${inr(p.amount)}</td><td>${p.status}</td><td>${new Date(p.at).toLocaleDateString("en-IN")}</td></tr>`)
  );
}

function renderRegistrationAdmin() {
  const st = platformSettings();
  const f = document.getElementById("regSettingsForm");
  if (f) {
    f.publicSignup.value = st.publicSignup ? "1" : "0";
    f.inviteOnly.value = st.inviteOnly ? "1" : "0";
    f.requireApproval.value = st.requireApproval ? "1" : "0";
    f.querySelectorAll("select").forEach((el) => { el.disabled = !isOwner(); });
    f.querySelector("button").disabled = !isOwner();
  }
  const mineInv = invites().filter((i) => isOwner() || i.createdBy === staffNow().email);
  document.getElementById("inviteTable").innerHTML = table(
    ["Code", "Email lock", "Used", "By", ""],
    mineInv.slice().reverse().map((i) => `<tr><td>${i.code}</td><td>${i.email || "any"}</td>
      <td>${i.used ? "yes" : "open"}</td><td>${i.createdBy}</td>
      <td><button class="btn btn-ghost" data-del-invite="${i.code}">Remove</button></td></tr>`)
  );
  const users = readList(USERS_KEY).slice().reverse();
  const scoped = isOwner() ? users : users.filter((u) => scopedEnrolls().some((e) => e.email === u.email) || u.invitedBy === staffNow().email);
  document.getElementById("accessTable").innerHTML = table(
    ["User", "Status", "Joined", ""],
    scoped.map((u) => `<tr><td>${u.name}<div class="muted">${u.email}</div></td>
      <td><span class="live-status ${u.status || "active"}">${u.status || "active"}</span></td>
      <td>${u.created ? new Date(u.created).toLocaleDateString("en-IN") : "—"}</td>
      <td class="admin-actions">
        ${(u.status || "active") === "pending" ? `<button class="btn btn-ghost" data-user="${u.email}" data-status="active">Approve</button>` : ""}
        ${(u.status || "active") !== "blocked" ? `<button class="btn btn-ghost" data-user="${u.email}" data-status="blocked">Block</button>`
          : `<button class="btn btn-ghost" data-user="${u.email}" data-status="active">Unblock</button>`}
      </td></tr>`)
  );
}

function renderCommunityAdmin() {
  fillCourseSelects();
  document.getElementById("tgTable").innerHTML = table(
    ["Channel", "Course", "Link", ""],
    scopedChannels().map((c) => {
      const course = courseById(c.courseId);
      return `<tr><td>${c.name}<div class="muted">${c.creatorEmail || ""}</div></td>
        <td>${course?.title || "General"}</td>
        <td><a href="${c.url}" target="_blank" rel="noopener">${c.url}</a></td>
        <td><button class="btn btn-ghost" data-del-tg="${c.id}">Remove</button></td></tr>`;
    })
  );
  document.getElementById("postTable").innerHTML = table(
    ["Post", "Course", "By", ""],
    scopedPosts().slice().reverse().map((p) => {
      const course = courseById(p.courseId);
      return `<tr><td>${p.title}<div class="muted">${escapeHtml((p.body || "").slice(0, 80))}</div></td>
        <td>${course?.title || "General"}</td><td>${p.author}</td>
        <td><button class="btn btn-ghost" data-del-post="${p.id}">Remove</button></td></tr>`;
    })
  );
}

function applyRoleUi() {
  const s = staffNow();
  document.getElementById("sideBrand").textContent = isOwner() ? "Main admin" : "Creator";
  document.getElementById("sideRole").textContent = s.name + " · " + s.email;
  document.getElementById("adminPill").textContent = isOwner() ? "Main admin" : "Sub-admin";
  document.getElementById("adminSub").textContent = isOwner() ? "Full platform · LMS, affiliate, community" : "Your courses, live, 1:1, and community";
  document.querySelectorAll("[data-owner-only]").forEach((el) => {
    el.classList.toggle("hidden", !isOwner());
  });
  document.querySelectorAll("[data-creator-only]").forEach((el) => {
    el.classList.toggle("hidden", isOwner());
  });
  const inst = document.getElementById("instructorField");
  if (inst && !isOwner()) {
    inst.value = s.name;
    inst.readOnly = true;
  }
  const editInst = document.getElementById("editInstructorField");
  if (editInst) editInst.readOnly = !isOwner();
}

function refreshAdmin() {
  if (!staffNow()) return;
  applyRoleUi();
  renderOverview();
  renderCoursesAdmin();
  renderStudents();
  renderEnrolls();
  renderLiveAdmin();
  renderClassroom();
  renderCallsAdmin();
  renderAffiliateAdmin();
  renderRegistrationAdmin();
  renderCommunityAdmin();
  if (isOwner()) renderCreators();
}

function showApp() {
  document.getElementById("staffLogin").classList.add("hidden");
  document.getElementById("adminApp").classList.remove("hidden");
  refreshAdmin();
}

document.addEventListener("DOMContentLoaded", () => {
  seedStaffAndAnalytics();
  if (document.getElementById("adminView")) return;


  if (staffNow()) showApp();

  document.getElementById("staffLoginForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim().toLowerCase();
    const password = e.target.password.value;
    if (email === OWNER.email && password === OWNER.password) {
      setStaffSession(OWNER);
      toast("Logged in as owner");
      showApp();
      return;
    }
    const creator = staffList().find((s) => s.email.toLowerCase() === email && s.password === password);
    if (creator) {
      setStaffSession(creator);
      toast("Logged in as creator");
      showApp();
      return;
    }
    toast("Wrong email or password");
  });

  document.getElementById("staffLogout")?.addEventListener("click", () => {
    clearStaffSession();
    location.reload();
  });

  document.querySelectorAll(".admin-nav button").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("hidden")) return;
      document.querySelectorAll(".admin-nav button").forEach((b) => b.classList.remove("on"));
      btn.classList.add("on");
      document.querySelectorAll(".admin-panel").forEach((p) => p.classList.add("hidden"));
      document.getElementById("panel-" + btn.dataset.panel).classList.remove("hidden");
      document.getElementById("adminTitle").textContent = btn.textContent;
    });
  });

  document.getElementById("addCourseForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const s = staffNow();
    const id = "c-" + Date.now();
    const instructor = isOwner() ? f.instructor.value.trim() : s.name;
    const course = {
      id,
      title: f.title.value.trim(),
      instructor,
      learners: "0",
      rating: "4.8",
      price: Number(f.price.value),
      old: Number(f.price.value),
      cat: f.cat.value,
      cover: id,
      hours: f.hours.value,
      lessons: Number(f.lessons.value),
      description: f.description.value.trim(),
      ownerEmail: s.role === "owner" ? ownerEmailOf({ instructor, id: "" }) || "" : s.email
    };
    if (!course.ownerEmail && s.role !== "owner") course.ownerEmail = s.email;
    const extra = extraCourses();
    extra.push(course);
    writeList(EXTRA_COURSES_KEY, extra);
    const map = courseOwners();
    map[id] = course.ownerEmail || s.email;
    setCourseOwners(map);
    COVERS[id] = { bg: "linear-gradient(135deg,#4f46e5,#1e1b4b)", title: course.title.slice(0, 14).toUpperCase(), sub: course.instructor };
    f.reset();
    if (!isOwner()) document.getElementById("instructorField").value = s.name;
    toast("Course published");
    refreshAdmin();
  });

  document.getElementById("addCreatorForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!isOwner()) return;
    const f = e.target;
    const email = f.email.value.trim().toLowerCase();
    const staff = staffList();
    if (staff.some((s) => s.email === email) || email === OWNER.email) {
      toast("This email is already a staff account");
      return;
    }
    staff.push({ name: f.name.value.trim(), email, password: f.password.value, role: "creator" });
    writeList(STAFF_KEY, staff);
    const cid = f.courseId.value;
    if (cid) {
      const map = courseOwners();
      map[cid] = email;
      setCourseOwners(map);
    }
    f.reset();
    toast("Creator added · they can login on this page");
    refreshAdmin();
  });

  document.getElementById("addLiveForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const s = staffNow();
    if (!s) return;
    const f = e.target;
    const at = new Date(f.at.value);
    const live = {
      id: "lv-" + Date.now(),
      title: f.title.value.trim(),
      by: s.name,
      hostEmail: s.email,
      at: at.toISOString(),
      when: formatLiveWhen(at.toISOString()),
      duration: f.duration.value.trim() || "60 min",
      kind: f.kind && f.kind.value === "class" ? "class" : "webinar",
      joinUrl: f.joinUrl ? f.joinUrl.value.trim() : "",
      notes: f.notes.value.trim(),
      chat: f.chat.value === "1",
      record: f.record.value === "1",
      recordUrl: f.recordUrl.value.trim(),
      introUrl: f.introUrl ? f.introUrl.value.trim() : "",
      status: "scheduled"
    };
    const list = allWebinars();
    list.push(live);
    saveWebinars(list);
    f.reset();
    toast("Live class scheduled");
    refreshAdmin();
  });

  document.getElementById("lmsCourseSel")?.addEventListener("change", renderClassroom);

  document.getElementById("addQuizForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const c = selectedLmsCourse();
    if (!c) return;
    const f = e.target;
    const questions = parseQuizBlocks(f.questions.value);
    if (!questions.length) {
      toast("Add at least one question");
      return;
    }
    saveQuizzes(c.id, quizzesOf(c.id).concat([{
      id: "quiz-" + Date.now(),
      title: f.title.value.trim(),
      passScore: Number(f.passScore.value) || 70,
      questions
    }]));
    f.reset();
    toast("Quiz saved");
    refreshAdmin();
  });

  document.getElementById("addAssignForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const c = selectedLmsCourse();
    if (!c) return;
    const f = e.target;
    saveAssignments(c.id, assignmentsOf(c.id).concat([{
      id: "as-" + Date.now(),
      title: f.title.value.trim(),
      due: f.due.value,
      prompt: f.prompt.value.trim()
    }]));
    f.reset();
    toast("Assignment saved");
    refreshAdmin();
  });

  document.getElementById("addCallForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const mentor = staffList().find((x) => x.email === f.mentorEmail.value) || staffNow();
    const list = callRequests();
    list.push({
      id: "call-" + Date.now(),
      name: f.name.value.trim(),
      email: f.email.value.trim(),
      topic: f.topic.value,
      date: f.date.value,
      time: f.time.value,
      mentor: mentor.name,
      mentorEmail: mentor.email,
      status: "approved",
      meetUrl: f.meetUrl.value.trim(),
      notes: f.notes.value.trim(),
      at: new Date().toISOString()
    });
    writeList(CALL_KEY, list);
    f.reset();
    toast("1:1 session saved");
    refreshAdmin();
  });

  document.getElementById("affSettingsForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!isOwner()) return;
    const f = e.target;
    saveSettings({ affiliateEnabled: f.affiliateEnabled.value === "1", defaultCommission: Number(f.defaultCommission.value) || 20 });
    toast("Affiliate program updated");
    refreshAdmin();
  });

  document.getElementById("addAffForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const email = f.email.value.trim().toLowerCase();
    const list = affiliates();
    const existing = list.find((a) => a.email === email);
    const row = {
      email,
      name: f.name.value.trim(),
      code: (f.code.value.trim() || makeCode("TS")).toUpperCase(),
      rate: Number(f.rate.value) || platformSettings().defaultCommission,
      status: "active",
      created: new Date().toISOString()
    };
    if (existing) Object.assign(existing, row);
    else list.push(row);
    writeList(AFFILIATE_KEY, list);
    f.reset();
    toast("Affiliate saved");
    refreshAdmin();
  });

  document.getElementById("addPayoutForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const list = payouts();
    list.push({ id: "po-" + Date.now(), email: f.email.value.trim().toLowerCase(), amount: Number(f.amount.value), status: "paid", at: new Date().toISOString() });
    writeList(PAYOUT_KEY, list);
    f.reset();
    toast("Payout recorded");
    refreshAdmin();
  });

  document.getElementById("regSettingsForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!isOwner()) return;
    const f = e.target;
    saveSettings({
      publicSignup: f.publicSignup.value === "1",
      inviteOnly: f.inviteOnly.value === "1",
      requireApproval: f.requireApproval.value === "1"
    });
    toast("Registration rules saved");
    refreshAdmin();
  });

  document.getElementById("addInviteForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const list = invites();
    list.push({
      code: (f.code.value.trim() || makeCode("TS")).toUpperCase(),
      email: f.email.value.trim().toLowerCase(),
      used: false,
      createdBy: staffNow().email,
      at: new Date().toISOString()
    });
    writeList(INVITE_KEY, list);
    f.reset();
    toast("Invite created");
    refreshAdmin();
  });

  document.getElementById("addTgForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const list = telegramChannels();
    list.push({
      id: "tg-" + Date.now(),
      name: f.name.value.trim(),
      url: f.url.value.trim(),
      creatorEmail: staffNow().email,
      courseId: f.courseId.value
    });
    writeList(COMMUNITY_KEY, list);
    f.reset();
    toast("Telegram channel added");
    refreshAdmin();
  });

  document.getElementById("addPostForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const s = staffNow();
    const list = forumPosts();
    list.push({
      id: "p-" + Date.now(),
      title: f.title.value.trim(),
      body: f.body.value.trim(),
      author: s.name,
      email: s.email,
      courseId: f.courseId.value,
      at: new Date().toISOString()
    });
    writeList(POST_KEY, list);
    f.reset();
    toast("Post published");
    refreshAdmin();
  });

  function openEditCourse(id) {
    const c = courseById(id);
    if (!c || !canEditCourse(c)) return;
    const f = document.getElementById("editCourseForm");
    f.courseId.value = c.id;
    f.title.value = c.title;
    f.instructor.value = c.instructor;
    f.price.value = c.price;
    f.cat.value = c.cat;
    f.hours.value = c.hours;
    f.lessons.value = c.lessons;
    f.description.value = c.description || "";
    document.getElementById("editCourseOverlay").classList.add("open");
  }
  document.getElementById("closeEditCourse")?.addEventListener("click", () => {
    document.getElementById("editCourseOverlay").classList.remove("open");
  });
  document.getElementById("editCourseOverlay")?.addEventListener("click", (e) => {
    if (e.target.id === "editCourseOverlay") e.currentTarget.classList.remove("open");
  });
  document.getElementById("editCourseForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const id = f.courseId.value;
    const c = courseById(id);
    if (!c || !canEditCourse(c)) return;
    const s = staffNow();
    const instructor = isOwner() ? f.instructor.value.trim() : s.name;
    applyCoursePatch(id, {
      title: f.title.value.trim(),
      instructor,
      price: Number(f.price.value),
      old: Number(f.price.value),
      cat: f.cat.value,
      hours: f.hours.value,
      lessons: Number(f.lessons.value),
      description: f.description.value.trim()
    });
    if (COVERS[c.cover] || COVERS[id]) {
      COVERS[c.cover || id] = { bg: (COVERS[c.cover] || COVERS[id] || { bg: "linear-gradient(135deg,#4f46e5,#1e1b4b)" }).bg, title: f.title.value.trim().slice(0, 14).toUpperCase(), sub: instructor };
    }
    document.getElementById("editCourseOverlay").classList.remove("open");
    toast("Course updated");
    refreshAdmin();
  });

  function renderVideosList(courseId) {
    const host = document.getElementById("videosList");
    if (!host) return;
    const custom = courseVideosMap()[courseId] || [];
    const list = custom.length ? custom : [];
    if (!list.length) {
      host.innerHTML = `<p class="muted">No custom lessons yet. Sample classroom videos play until you add your own.</p>`;
      return;
    }
    host.innerHTML = list.map((l, i) => `
      <div class="video-admin-item">
        <span class="cr-num">${String(i + 1).padStart(2, "0")}</span>
        <div>
          <strong>${escapeHtml(l.t)}</strong>
          <div class="muted">${escapeHtml(l.dur || "video")} · ${escapeHtml(lessonMediaLabel(l))}</div>
        </div>
        <button class="btn btn-ghost" type="button" data-del-video="${l.id}" data-course="${courseId}">Remove</button>
      </div>`).join("");
  }
  function openVideos(id) {
    const c = courseById(id);
    if (!c || !canEditCourse(c)) return;
    document.getElementById("videosTitle").textContent = `Videos · ${c.title}`;
    document.querySelector("#addVideoForm [name=courseId]").value = id;
    renderVideosList(id);
    document.getElementById("videosOverlay").classList.add("open");
  }
  document.getElementById("closeVideos")?.addEventListener("click", () => {
    document.getElementById("videosOverlay").classList.remove("open");
  });
  document.getElementById("videosOverlay")?.addEventListener("click", (e) => {
    if (e.target.id === "videosOverlay") e.currentTarget.classList.remove("open");
  });
  document.getElementById("addVideoForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const id = f.courseId.value;
    const c = courseById(id);
    if (!c || !canEditCourse(c)) return;
    if (e._bizgarhLesson) return;
    e._bizgarhLesson = true;
    const file = f.file.files[0];
    const src = f.src.value.trim();
    const vdoId = (f.vdoId?.value || "").trim();
    if (!file && !src && !vdoId) {
      toast("Add a VdoCipher video ID, an MP4 link, or a file");
      return;
    }
    const btn = f.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Saving…";
    try {
      await addClassroomLesson(id, {
        title: f.title.value.trim(),
        dur: f.dur.value.trim(),
        src,
        vdoId,
        file
      });
      f.reset();
      f.courseId.value = id;
      renderVideosList(id);
      toast(vdoId || parseVdoCipherId(src) ? "DRM lesson added" : "Lesson added to classroom");
      refreshAdmin();
    } catch (err) {
      toast(err.message || "Could not save video");
    } finally {
      btn.disabled = false;
      btn.textContent = "Add lesson";
    }
  });

  document.body.addEventListener("click", (e) => {
    const del = e.target.closest("[data-del-course]");
    if (del) {
      writeList(EXTRA_COURSES_KEY, extraCourses().filter((c) => c.id !== del.dataset.delCourse));
      toast("Course removed");
      refreshAdmin();
    }
    const hide = e.target.closest("[data-hide-course]");
    if (hide && isOwner()) {
      const ids = hiddenCourseIds();
      if (!ids.includes(hide.dataset.hideCourse)) ids.push(hide.dataset.hideCourse);
      writeList(HIDDEN_COURSES_KEY, ids);
      toast("Course hidden from site");
      refreshAdmin();
    }
    const rm = e.target.closest("[data-del-staff]");
    if (rm && isOwner()) {
      writeList(STAFF_KEY, staffList().filter((s) => s.email !== rm.dataset.delStaff));
      toast("Creator removed");
      refreshAdmin();
    }
    const edit = e.target.closest("[data-edit-course]");
    if (edit) openEditCourse(edit.dataset.editCourse);
    const vids = e.target.closest("[data-videos-course]");
    if (vids) openVideos(vids.dataset.videosCourse);
    const delVid = e.target.closest("[data-del-video]");
    if (delVid) {
      const cid = delVid.dataset.course;
      const vid = delVid.dataset.delVideo;
      const c = courseById(cid);
      if (!c || !canEditCourse(c)) return;
      const current = courseVideosMap()[cid] || [];
      const gone = current.find((l) => l.id === vid);
      if (gone?.fileKey) delVideoBlob(gone.fileKey);
      setCourseLessons(cid, current.filter((l) => l.id !== vid));
      renderVideosList(cid);
      toast("Lesson removed");
      refreshAdmin();
    }
    const delLive = e.target.closest("[data-del-live]");
    if (delLive) {
      const live = allWebinars().find((w) => w.id === delLive.dataset.delLive);
      const s = staffNow();
      if (live && (isOwner() || live.hostEmail === s.email)) {
        saveWebinars(allWebinars().filter((w) => w.id !== live.id));
        toast("Live class removed");
        refreshAdmin();
      }
    }
    const delQuiz = e.target.closest("[data-del-quiz]");
    if (delQuiz && canEditCourse(courseById(delQuiz.dataset.course) || {})) {
      saveQuizzes(delQuiz.dataset.course, quizzesOf(delQuiz.dataset.course).filter((q) => q.id !== delQuiz.dataset.delQuiz));
      toast("Quiz removed");
      refreshAdmin();
    }
    const delAs = e.target.closest("[data-del-assign]");
    if (delAs && canEditCourse(courseById(delAs.dataset.course) || {})) {
      saveAssignments(delAs.dataset.course, assignmentsOf(delAs.dataset.course).filter((a) => a.id !== delAs.dataset.delAssign));
      toast("Assignment removed");
      refreshAdmin();
    }
    const issue = e.target.closest("[data-issue-cert]");
    if (issue) {
      issueCert(issue.dataset.email, issue.dataset.name, issue.dataset.issueCert);
      toast("Certificate issued");
      refreshAdmin();
    }
    const grade = e.target.closest("[data-grade]");
    if (grade) {
      writeList(ASSIGN_SUB_KEY, assignSubs().map((s) => s.id === grade.dataset.grade ? { ...s, status: grade.dataset.status } : s));
      toast("Submission updated");
      refreshAdmin();
    }
    const callBtn = e.target.closest("[data-call]");
    if (callBtn) {
      writeList(CALL_KEY, callRequests().map((c) => {
        if (c.id !== callBtn.dataset.call) return c;
        const next = { ...c, status: callBtn.dataset.status };
        if (callBtn.dataset.status === "approved") next.meetUrl = "/live-room?type=call&id=" + c.id;
        return next;
      }));
      toast("Session updated");
      refreshAdmin();
    }
    const delCall = e.target.closest("[data-del-call]");
    if (delCall) {
      writeList(CALL_KEY, callRequests().filter((c) => c.id !== delCall.dataset.delCall));
      toast("Session removed");
      refreshAdmin();
    }
    const affBtn = e.target.closest("[data-aff]");
    if (affBtn) {
      writeList(AFFILIATE_KEY, affiliates().map((a) => a.email === affBtn.dataset.aff ? { ...a, status: affBtn.dataset.status } : a));
      toast("Affiliate updated");
      refreshAdmin();
    }
    const markRef = e.target.closest("[data-mark-ref]");
    if (markRef) {
      writeList(REFERRAL_KEY, referrals().map((r) => r.id === markRef.dataset.markRef ? { ...r, status: "paid" } : r));
      toast("Referral marked paid");
      refreshAdmin();
    }
    const delInv = e.target.closest("[data-del-invite]");
    if (delInv) {
      writeList(INVITE_KEY, invites().filter((i) => i.code !== delInv.dataset.delInvite));
      toast("Invite removed");
      refreshAdmin();
    }
    const userBtn = e.target.closest("[data-user]");
    if (userBtn) {
      writeList(USERS_KEY, readList(USERS_KEY).map((u) => u.email === userBtn.dataset.user ? { ...u, status: userBtn.dataset.status } : u));
      toast("User updated");
      refreshAdmin();
    }
    const delTg = e.target.closest("[data-del-tg]");
    if (delTg) {
      writeList(COMMUNITY_KEY, telegramChannels().filter((c) => c.id !== delTg.dataset.delTg));
      toast("Channel removed");
      refreshAdmin();
    }
    const delPost = e.target.closest("[data-del-post]");
    if (delPost) {
      writeList(POST_KEY, forumPosts().filter((p) => p.id !== delPost.dataset.delPost));
      toast("Post removed");
      refreshAdmin();
    }
  });
});
