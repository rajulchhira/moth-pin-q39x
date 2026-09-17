function canEditMentor(p) {
  const s = AdminCore.session();
  if (!s || !p) return false;
  if (AdminCore.isOwner()) return true;
  if (!AdminCore.can("courses", "edit")) return false;
  return p.ownerEmail === s.email || p.by === s.name;
}

function mbLocal(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const MentorAdmin = {
  titleQ: "",
  studentEmail: "",
  STEPS: [
    { id: "setup", n: "1", label: "Details", hint: "Name & desk" },
    { id: "page", n: "2", label: "Page", hint: "What students see" },
    { id: "sessions", n: "3", label: "Sessions", hint: "Live & recordings" },
    { id: "live", n: "4", label: "Go live", hint: "Show on the site" }
  ],
  MORE: [
    { id: "students", label: "Students", hint: "Who enrolled" },
    { id: "community", label: "Community", hint: "Links on / off" },
    { id: "reviews", label: "Reviews", hint: "Ratings" },
    { id: "next", label: "Next", hint: "What they buy next" }
  ],

  catalog() {
    const list = typeof mentorCatalogAll === "function" ? mentorCatalogAll() : (typeof allMentorPrograms === "function" ? allMentorPrograms() : []);
    return AdminCore.isOwner()
      ? list
      : list.filter((p) => p.ownerEmail === AdminCore.session().email || p.by === AdminCore.session().name);
  },

  byId(id) {
    return this.catalog().find((p) => p.id === id)
      || (typeof mentorProgramById === "function" ? mentorProgramById(id) : null);
  },

  phaseLabel(p) {
    const phase = typeof mentorPhase === "function" ? mentorPhase(p) : "upcoming";
    if (p.unpublished) return "Draft";
    if (phase === "ended") return "Ended";
    if (phase === "ongoing") return "Ongoing";
    return "Upcoming";
  },

  statusLabel(p) {
    return p.unpublished ? "Draft" : "Live";
  },

  thumb(p) {
    if (typeof mentorShotHTML === "function") {
      return `<span class="cb-thumb cb-thumb-real mb-thumb">${mentorShotHTML(p)}</span>`;
    }
    return `<span class="cb-thumb cb-thumb-gen">${adEsc((p.title || "M").slice(0, 1))}</span>`;
  },

  sessionCount(p) {
    try { return mentorLessonsFor(p.id).length; } catch { return Number(p.sessions || 0); }
  },

  progress(p) {
    const titleOk = Boolean(String(p.title || "").trim()) && !/^untitled/i.test(p.title) && Boolean(String(p.by || "").trim()) && Boolean(p.at);
    const isSeed = typeof MENTOR_PROGRAMS !== "undefined" && MENTOR_PROGRAMS.some((x) => x.id === p.id);
    const story = String(p.blurb || "").trim();
    const learnN = (Array.isArray(p.learn) ? p.learn : (typeof mentorPack === "function" ? mentorPack(p).learn : [])).filter((x) => String(x || "").trim()).length;
    const pic = typeof mentorBannerOf === "function" ? mentorBannerOf(p) : (p.banner || "");
    const pageOk = isSeed
      ? Number(p.price) > 0 && Boolean(story)
      : Number(p.price) > 0 && Boolean(story) && learnN >= 5 && Boolean(pic || p.tint);
    const sessionsOk = this.sessionCount(p) > 0;
    return { setup: titleOk, page: pageOk, sessions: sessionsOk, live: !p.unpublished };
  },

  firstTab(p) {
    const prog = this.progress(p);
    if (!prog.setup) return "setup";
    if (!prog.page) return "page";
    if (!prog.sessions) return "sessions";
    if (!prog.live) return "live";
    return "sessions";
  },

  nextHint(p) {
    const prog = this.progress(p);
    if (!prog.setup) return "Next: add the desk name and start date";
    if (!prog.page) {
      if (!(Number(p.price) > 0)) return "Next: add a price";
      if (!String(p.blurb || "").trim()) return "Next: write the short story";
      return "Next: add 5 What You Will Learn points";
    }
    if (!prog.sessions) return "Next: add the first session";
    if (!prog.live) return "Ready to go live";
    return "Live on the site";
  },

  nextTab(tab) {
    const i = this.STEPS.findIndex((s) => s.id === tab);
    return this.STEPS[Math.min(this.STEPS.length - 1, i + 1)]?.id || "live";
  },

  prevTab(tab) {
    const i = this.STEPS.findIndex((s) => s.id === tab);
    return this.STEPS[Math.max(0, i - 1)]?.id || "setup";
  },

  stepperHTML(p, tab) {
    const prog = this.progress(p);
    return `<ol class="cb-stepper" aria-label="Mentorship steps">
      ${this.STEPS.map((s, i) => {
        const done = prog[s.id];
        const on = s.id === tab;
        return `<li>
          <button type="button" data-mb-tab="${s.id}" class="${on ? "on" : ""} ${done ? "is-done" : ""}">
            <b>${done && !on ? "✓" : s.n}</b>
            <span>${adEsc(s.label)}</span>
            <small>${adEsc(s.hint)}</small>
          </button>
          ${i < this.STEPS.length - 1 ? `<i></i>` : ""}
        </li>`;
      }).join("")}
    </ol>`;
  },

  isMore(tab) {
    return this.MORE.some((s) => s.id === tab);
  },

  seeHTML(p) {
    const base = `/program?id=${encodeURIComponent(p.id)}&preview=1`;
    return `<div class="cb-see">
      <span>See as a student</span>
      <a href="${base}&view=buy" target="_blank" rel="noopener">Before enroll</a>
      <a href="${base}&view=owned" target="_blank" rel="noopener">After enroll</a>
    </div>`;
  },

  footHTML(tab, extra) {
    const back = this.prevTab(tab);
    const next = this.nextTab(tab);
    const last = tab === "live";
    const extraTab = this.isMore(tab);
    const saveNext = tab === "setup" || tab === "page";
    return `<div class="cb-foot">
      ${tab === "setup" || extraTab ? `<button type="button" class="btn btn-ghost" data-mb-back>← All mentorships</button>`
        : `<button type="button" class="btn btn-ghost" data-mb-tab="${back}">← Back</button>`}
      <div class="cb-foot-main">
        ${extra || ""}
        ${last || extraTab ? "" : saveNext
          ? `<button class="btn btn-primary" type="submit">Save & continue →</button>`
          : `<button type="button" class="btn btn-primary" data-mb-tab="${next}">Continue →</button>`}
      </div>
    </div>`;
  },

  hostBarHTML(p) {
    const can = canEditMentor(p) && AdminCore.can("courses", "edit");
    if (!can) return "";
    const liveSessions = mentorLessonsFor(p.id).map((l, i) => ({ l, i })).filter((x) => (x.l.mode || "live") === "live");
    const nextLive = liveSessions.find((x) => x.l.status === "live") || liveSessions[0];
    if (!nextLive) {
      return `<aside class="wb-hostbar">
        <div>
          <strong>Host a live meeting</strong>
          <p>Add a live session first. Then host it from Sessions.</p>
        </div>
        <div class="wb-hostbar-actions">
          <button type="button" class="btn btn-primary" data-mb-tab="sessions">Open sessions</button>
        </div>
      </aside>`;
    }
    const live = nextLive.l.status === "live";
    return `<aside class="wb-hostbar ${live ? "is-live" : ""}">
      <div>
        <strong>${live ? "Session is live now" : "Host this meeting"}</strong>
        <p>${live
          ? "Students can join from the program page. Stay in the room as host."
          : `Start ${adEsc(nextLive.l.t)} from here. Students join after you go live.`}</p>
      </div>
      <div class="wb-hostbar-actions">
        <button type="button" class="btn btn-primary" data-mb-host-session="${nextLive.i}">${live ? "Enter as host" : "Host meeting"}</button>
        <button type="button" class="btn btn-ghost" data-mb-tab="sessions">All sessions</button>
      </div>
    </aside>`;
  },

  screenHTML(p, tab, body) {
    return `<section class="cb-desk">
      <div class="cb-desk-top">
        <div>
          <span class="cb-pill ${p.unpublished ? "is-draft" : "is-live"}">${adEsc(this.statusLabel(p))}</span>
          <h2>${adEsc(p.title)}</h2>
        </div>
        ${this.seeHTML(p)}
      </div>
      ${this.hostBarHTML(p)}
      ${this.stepperHTML(p, tab)}
      ${body}
    </section>`;
  },

  filtered() {
    const q = String(this.titleQ || "").trim().toLowerCase();
    return this.catalog().filter((p) => {
      if (!q) return true;
      return [p.title, p.by, p.tag, this.phaseLabel(p), this.nextHint(p)].join(" ").toLowerCase().includes(q);
    });
  },

  catalogHTML() {
    const rows = this.filtered();
    const canCreate = AdminCore.can("courses", "create");
    const drafts = this.catalog().filter((p) => p.unpublished).length;
    return `<section class="cb-home">
      <div class="cb-home-bar">
        <input id="mbSearch" type="search" value="${adEsc(this.titleQ)}" placeholder="Find a mentorship…">
        ${canCreate ? `<button type="button" class="btn btn-primary" data-mb-create>+ New mentorship</button>` : ""}
      </div>
      <p class="cb-home-note">${this.catalog().length} desks${drafts ? ` · ${drafts} still draft` : ""}. Click a desk to edit it.</p>
      <div class="cb-cards">
        ${rows.map((p) => `
          <button type="button" class="cb-card-row" data-mb-open="${adEsc(p.id)}">
            ${this.thumb(p)}
            <div class="cb-card-copy">
              <strong>${adEsc(p.title)}</strong>
              <span>${adEsc(this.phaseLabel(p))} · ${this.sessionCount(p)} sessions · ${adEsc(p.weeks || 0)} weeks</span>
              <em>${adEsc(this.nextHint(p))}</em>
            </div>
            <span class="cb-pill ${p.unpublished ? "is-draft" : "is-live"}">${adEsc(this.statusLabel(p))}</span>
          </button>`).join("") || `<div class="cb-empty-box"><p>No mentorship matches that search.</p></div>`}
      </div>
      <div class="cb-modal hidden" id="mbCreateModal">
        <form class="cb-modal-card" id="mbCreateForm">
          <h3>New mentorship</h3>
          <p>Just the name. You can change everything after this.</p>
          <label>What should students call this desk?
            <input name="title" required autofocus placeholder="e.g. Intraday Journal Desk">
          </label>
          <div class="cb-modal-actions">
            <button class="btn btn-ghost" type="button" data-mb-create-close>Cancel</button>
            <button class="btn btn-primary" type="submit">Start</button>
          </div>
        </form>
      </div>
    </section>`;
  },

  sideHTML(p) {
    const tab = Ad.mentorTab || this.firstTab(p);
    const prog = this.progress(p);
    const s = AdminCore.session();
    return `
      <a class="ad-brand" href="/">${typeof brandLogoHTML === "function" ? brandLogoHTML("ad") : "Bizgarh"}</a>
      <button type="button" class="cb-back" data-mb-back>← All mentorships</button>
      <div class="cb-side-course">
        ${this.thumb(p)}
        <div>
          <strong>${adEsc(p.title)}</strong>
          <small>${adEsc(this.statusLabel(p))} · ${adEsc(this.phaseLabel(p))}</small>
        </div>
      </div>
      <nav class="ad-nav cb-side-nav">
        ${this.STEPS.map((st) => `<button type="button" data-mb-tab="${st.id}" class="${tab === st.id ? "on" : ""}">
          <span>${prog[st.id] ? "✓" : st.n}</span> ${adEsc(st.label)}
        </button>`).join("")}
        <span class="ad-nav-label">Also</span>
        ${this.MORE.map((st) => `<button type="button" data-mb-tab="${st.id}" class="${tab === st.id ? "on" : ""}">
          ${adEsc(st.label)}
        </button>`).join("")}
      </nav>
      <div class="ad-side-foot">
        <div class="ad-who">${adEsc(s.name)}<br>${AdminCore.isSuperAdmin() ? "Super Admin" : (AdminCore.isOwner() ? "Owner" : "Admin")}</div>
        <button type="button" id="staffLogout">Logout</button>
        <a href="/">← Public site</a>
      </div>`;
  },

  mentorOptions(p) {
    const names = [...new Set([p.by, ...(typeof MENTORS !== "undefined" ? MENTORS.map((m) => m.name) : [])].filter(Boolean))];
    return names.map((n) => `<option value="${adEsc(n)}" ${p.by === n ? "selected" : ""}>${adEsc(n)}</option>`).join("");
  },

  setupHTML(p) {
    const can = canEditMentor(p) && AdminCore.can("courses", "edit");
    const body = `<form class="cb-panel" id="mbSetupForm" data-mentor="${adEsc(p.id)}">
      <p class="cb-say">Name the desk, pick the mentor, and set when the batch starts.</p>
      <label class="cb-big">Desk name
        <input name="title" required value="${adEsc(p.title)}" ${can ? "" : "readonly"} placeholder="Students see this name">
      </label>
      <label>Who hosts it?
        <select name="by" ${can && AdminCore.isOwner() ? "" : "disabled"}>
          ${this.mentorOptions(p)}
        </select>
      </label>
      <label>Tag
        <input name="tag" value="${adEsc(p.tag || "")}" ${can ? "" : "readonly"} placeholder="e.g. Intraday">
      </label>
      <div class="cb-split">
        <label>First session <em>required</em>
          <input name="at" type="datetime-local" required value="${adEsc(mbLocal(p.at))}" ${can ? "" : "readonly"}>
        </label>
        <label>Weeks
          <input name="weeks" type="number" min="1" value="${adEsc(p.weeks || 4)}" ${can ? "" : "readonly"}>
        </label>
      </div>
      <div class="cb-split">
        <label>Seat cap
          <input name="seats" type="number" min="1" value="${adEsc(p.seats || 20)}" ${can ? "" : "readonly"}>
        </label>
        <label>Hours
          <input name="hours" value="${adEsc(p.hours || "")}" ${can ? "" : "readonly"} placeholder="12">
        </label>
      </div>
      ${can ? this.footHTML("setup") : ""}
    </form>`;
    return this.screenHTML(p, "setup", body);
  },

  lineRow(name, value, i, can, min, placeholder) {
    return `<div class="cb-line">
      <label>Point ${i + 1}${i < min ? ` <em>required</em>` : ""}
        <input name="${adEsc(name)}" ${i < min ? "required" : ""} value="${adEsc(value || "")}" ${can ? "" : "readonly"} placeholder="${adEsc(placeholder)}">
      </label>
      ${can && i >= min ? `<button type="button" class="cb-x" data-mb-del-line="${adEsc(name)}" title="Remove">✕</button>` : ""}
    </div>`;
  },

  pairRow(kind, row, i, can) {
    return `<div class="cb-bonus-row" data-mb-pair="${adEsc(kind)}">
      <label>${kind === "who" ? "Who" : "Step"} ${i + 1}<input name="${adEsc(kind)}Title" value="${adEsc(row.t || "")}" ${can ? "" : "readonly"} placeholder="${kind === "who" ? "e.g. Working professionals" : "e.g. Join the desk"}"></label>
      <label>Line<input name="${adEsc(kind)}Note" value="${adEsc(row.d || "")}" ${can ? "" : "readonly"} placeholder="One short line"></label>
      ${can ? `<button type="button" class="cb-x" data-mb-del-pair="${adEsc(kind)}" title="Remove">✕</button>` : ""}
    </div>`;
  },

  landingHTML(p) {
    const can = canEditMentor(p) && AdminCore.can("courses", "edit");
    const banner = typeof mentorBannerOf === "function" ? mentorBannerOf(p) : "";
    const pack = typeof mentorPack === "function" ? mentorPack(p) : { learn: [], outcomes: [], prep: [], who: [], steps: [], curriculum: [], bio: "" };
    const learn = [...(pack.learn || [])];
    while (learn.length < 5) learn.push("");
    const outcomes = [...(pack.outcomes || [])];
    while (outcomes.length < 3) outcomes.push("");
    const body = `<div class="cb-pagegrid">
      <form class="cb-panel cb-pageform" id="mbLandingForm" data-mentor="${adEsc(p.id)}">
        <p class="cb-say">This is the public mentorship page. Price, story, and 5 learn points are required.</p>
        <label class="cb-drop-pic">
          <span>${banner ? "Change picture" : "Add a desk picture"}</span>
          <small>Width 1280 px × height 720 px (16:9). JPG, PNG or WebP.</small>
          <em>This banner shows on the listing and the program page. Leave empty to keep the designed desk card.</em>
          <input name="bannerFile" type="file" accept="image/jpeg,image/png,image/webp,image/*" ${can ? "" : "disabled"}>
        </label>
        <input name="banner" type="url" inputmode="url" placeholder="Or paste an image link" value="${adEsc(banner && !String(banner).startsWith("data:") ? banner : "")}" ${can ? "" : "readonly"}>
        ${banner ? `<img class="cb-banner-prev" id="mbBannerPrev" src="${adEsc(banner)}" alt="">` : `<img class="cb-banner-prev" id="mbBannerPrev" alt="" hidden>`}
        ${can && banner ? `<label class="cb-check"><input type="checkbox" name="bannerClear"> Remove picture</label>` : ""}
        <label>Desk colour
          <input name="tint" type="color" value="${adEsc(/^#/.test(p.tint || "") ? p.tint : "#C7D2FE")}" ${can ? "" : "disabled"}>
        </label>
        <div class="cb-split">
          <label>Price students pay ₹ <em>required</em>
            <input name="price" type="number" min="1" required value="${adEsc(p.price || "")}" ${can ? "" : "readonly"}>
          </label>
          <label>Old price ₹ <small>(optional)</small>
            <input name="old" type="number" min="0" value="${adEsc(p.old || "")}" ${can ? "" : "readonly"}>
          </label>
        </div>
        <label>Short story <em>required</em>
          <textarea name="blurb" required ${can ? "" : "readonly"} placeholder="2–4 lines. What this desk is.">${adEsc(p.blurb || "")}</textarea>
        </label>
        <label>Mentor bio
          <textarea name="bio" ${can ? "" : "readonly"} placeholder="Who hosts this desk.">${adEsc(pack.bio || "")}</textarea>
        </label>
        <div class="cb-block">
          <p class="cb-say">What You Will Learn <small>minimum 5, required</small></p>
          <div class="cb-stack" id="mbLearnList">
            ${learn.map((v, i) => this.lineRow("learn", v, i, can, 5, "One thing they can do after this desk")).join("")}
          </div>
          ${can ? `<button type="button" class="cb-add-chapter" data-mb-add-line="learn">+ Add another point</button>` : ""}
        </div>
        <div class="cb-block">
          <p class="cb-say">What they can do after <small>minimum 3</small></p>
          <div class="cb-stack" id="mbOutcomeList">
            ${outcomes.map((v, i) => this.lineRow("outcome", v, i, can, 3, "e.g. Write invalidation before entry")).join("")}
          </div>
          ${can ? `<button type="button" class="cb-add-chapter" data-mb-add-line="outcome">+ Add another</button>` : ""}
        </div>
        <details class="cb-more">
          <summary>More page copy (prep, who, how it works, curriculum)</summary>
          <div class="cb-block">
            <p class="cb-say">Key concepts before joining</p>
            <div class="cb-stack" id="mbPrepList">
              ${(pack.prep || [""]).map((v, i) => this.lineRow("prep", v, i, can, 0, "One prep line")).join("")}
            </div>
            ${can ? `<button type="button" class="cb-add-chapter" data-mb-add-line="prep">+ Add a line</button>` : ""}
          </div>
          <div class="cb-block">
            <p class="cb-say">Who is this for</p>
            <div class="cb-stack" id="mbWhoList">
              ${(pack.who || []).map((row, i) => this.pairRow("who", row, i, can)).join("")}
            </div>
            ${can ? `<button type="button" class="cb-add-chapter" data-mb-add-pair="who">+ Add who</button>` : ""}
          </div>
          <div class="cb-block">
            <p class="cb-say">How the desk works</p>
            <div class="cb-stack" id="mbStepList">
              ${(pack.steps || []).map((row, i) => this.pairRow("step", row, i, can)).join("")}
            </div>
            ${can ? `<button type="button" class="cb-add-chapter" data-mb-add-pair="step">+ Add a step</button>` : ""}
          </div>
          <div class="cb-block">
            <p class="cb-say">Download curriculum <small>optional · session titles are used if empty</small></p>
            <div class="cb-stack" id="mbCurrList">
              ${(pack.curriculum || [""]).map((v, i) => this.lineRow("curriculum", v, i, can, 0, "Week 1 topic")).join("")}
            </div>
            ${can ? `<button type="button" class="cb-add-chapter" data-mb-add-line="curriculum">+ Add a line</button>` : ""}
          </div>
        </details>
        ${can ? this.footHTML("page") : ""}
      </form>
      <aside class="cb-preview">
        <span>Students see this</span>
        <div class="cb-preview-thumb">${this.thumb(p)}</div>
        <strong>${adEsc(p.title)}</strong>
        <p>by ${adEsc(p.by)}</p>
        <b>₹${Number(p.price || 0).toLocaleString("en-IN")}</b>
      </aside>
    </div>`;
    return this.screenHTML(p, "page", body);
  },

  persistSessions(pid) {
    const map = typeof mentorLessonsMap === "function" ? mentorLessonsMap() : {};
    if (map[pid] && map[pid].length) return;
    const list = mentorLessonsFor(pid);
    if (list.length && typeof setMentorLessons === "function") setMentorLessons(pid, list);
  },

  sessionsHTML(p) {
    this.persistSessions(p.id);
    const can = canEditMentor(p) && AdminCore.can("courses", "edit");
    const list = mentorLessonsFor(p.id);
    const body = `<div class="cb-panel">
      <p class="cb-say">${list.length ? "Host a live session from this list. Students join after you start." : "Add the first live session. Recordings can be uploaded after the desk runs."}</p>
      <div class="cb-sy-list" data-mentor="${adEsc(p.id)}">
        ${list.map((l, i) => `<article class="cb-item mb-session">
          <span class="cb-ico ${ (l.mode || "live") === "recorded" ? "is-video" : "is-live"}">${typeof iconSvg === "function" ? iconSvg((l.mode || "live") === "recorded" ? "play" : "wifi") : ""}</span>
          <div class="cb-item-copy">
            <b>${adEsc(l.t)}</b>
            <small>${(l.mode || "live") === "recorded" ? "Recorded" : (l.status === "live" ? "Live now" : "Live")}${l.dur ? " · " + adEsc(l.dur) : ""}${l.at ? " · " + adEsc(new Date(l.at).toLocaleString("en-IN")) : ""}</small>
          </div>
          ${can && (l.mode || "live") === "live" ? `<button type="button" class="btn btn-primary cb-card-host" data-mb-host-session="${i}">${l.status === "live" ? "Enter as host" : "Host meeting"}</button>` : ""}
          ${can ? `<button type="button" class="cb-icon-btn" data-mb-edit-session="${i}" title="Edit">✎</button>
            <button type="button" class="cb-icon-btn" data-mb-del-session="${i}" title="Remove">✕</button>` : ""}
        </article>`).join("") || `<div class="cb-empty-box"><p>No sessions yet.</p></div>`}
      </div>
      ${can ? `<div class="cb-add-row">
        <button type="button" data-mb-add-session="live">+ Live session</button>
        <button type="button" data-mb-add-session="recorded">+ Recording</button>
      </div>` : ""}
      ${this.footHTML("sessions")}
      <div class="cb-modal hidden" id="mbSessionModal">
        <form class="cb-modal-card" id="mbSessionForm">
          <h3 id="mbSessionTitle">Add a live session</h3>
          <input type="hidden" name="index" value="-1">
          <input type="hidden" name="mode" value="live">
          <label>Session name<input name="t" required placeholder="e.g. Week 1 · Pre-open checklist"></label>
          <label>When<input name="at" type="datetime-local"></label>
          <label>Length<input name="dur" placeholder="e.g. 60 min"></label>
          <label>Notes for students<textarea name="notes" placeholder="Optional"></textarea></label>
          <label class="is-pdf">Session PDF
            <input name="pdfFile" type="file" accept="application/pdf">
          </label>
          <label class="is-rec">Recording file
            <input name="file" type="file" accept="video/mp4,video/webm,video/quicktime,video/*">
          </label>
          <label class="is-rec">Or paste a video link
            <input name="src" placeholder="Video URL">
          </label>
          <div class="cb-modal-actions">
            <button class="btn btn-ghost" type="button" data-mb-session-close>Cancel</button>
            <button class="btn btn-primary" type="submit">Save session</button>
          </div>
        </form>
      </div>
    </div>`;
    return this.screenHTML(p, "sessions", body);
  },

  liveHTML(p) {
    const prog = this.progress(p);
    const can = canEditMentor(p) && AdminCore.can("courses", "edit");
    const checks = [
      [prog.setup, "Desk has a name, mentor, and start date", "setup"],
      [prog.page, "Page has a price and a story", "page"],
      [prog.sessions, "At least one session is listed", "sessions"]
    ];
    const ready = prog.setup && prog.page && prog.sessions;
    const body = `<div class="cb-panel cb-go">
      <p class="cb-say">${p.unpublished
        ? "This desk is a draft. Students cannot enroll yet."
        : "This mentorship is live on Bizgarh."}</p>
      <ul class="cb-check-list">
        ${checks.map(([ok, label, tab]) => `<li class="${ok ? "ok" : "miss"}">
          <b>${ok ? "✓" : "!"}</b>
          <span>${adEsc(label)}</span>
          ${ok ? "" : `<button type="button" data-mb-tab="${tab}">Fix this</button>`}
        </li>`).join("")}
      </ul>
      ${can ? (p.unpublished
        ? `<button type="button" class="btn btn-primary cb-go-btn" data-mb-golive="${adEsc(p.id)}" ${ready ? "" : "disabled"}>${ready ? "Make it live" : "Finish the list first"}</button>`
        : `<button type="button" class="btn btn-ghost" data-mb-draft="${adEsc(p.id)}">Take it back to draft</button>`) : ""}
      ${this.seeHTML(p)}
      ${this.footHTML("live")}
    </div>`;
    return this.screenHTML(p, "live", body);
  },

  deskStudents(p) {
    const enrolls = (typeof mentorEnrolls === "function" ? mentorEnrolls() : []).filter((e) => e.id === p.id);
    const users = typeof readList === "function" ? readList(USERS_KEY) : [];
    return enrolls.map((e) => {
      const u = users.find((x) => String(x.email || "").toLowerCase() === String(e.email || "").toLowerCase());
      return { ...e, name: e.name || u?.name || e.email, user: u };
    }).sort((a, b) => String(b.at || "").localeCompare(String(a.at || "")));
  },

  studentsHTML(p) {
    const rows = this.deskStudents(p);
    const stats = typeof ratingStats === "function" ? ratingStats("mentor", p.id) : { avg: "0.0", count: 0 };
    const seats = typeof mentorSeatsLeft === "function" ? mentorSeatsLeft(p) : Math.max(0, (p.seats || 0) - rows.length);
    const week = rows.filter((r) => r.at && (Date.now() - new Date(r.at).getTime()) < 7 * 86400000).length;
    const pick = this.studentEmail ? rows.find((r) => r.email === this.studentEmail) : null;
    const body = `<div class="cb-panel">
      <p class="cb-say">People who enrolled on this desk. No course certificate here — this is a live batch.</p>
      <div class="cb-kpis">
        <div><span>Enrolled</span><b>${rows.length}</b></div>
        <div><span>Seats left</span><b>${seats}</b></div>
        <div><span>Seat cap</span><b>${Number(p.seats || 0)}</b></div>
        <div><span>New this week</span><b>${week}</b></div>
        <div><span>Reviews</span><b>★ ${adEsc(stats.avg)}</b><small>${stats.count}</small></div>
      </div>
      ${pick ? `<article class="cb-student-detail">
        <header>
          <div>
            <strong>${adEsc(pick.name)}</strong>
            <small>${adEsc(pick.email)}</small>
          </div>
          <button type="button" class="btn btn-ghost" data-mb-student-close>Close</button>
        </header>
        <p>Joined ${pick.at ? new Date(pick.at).toLocaleString("en-IN") : "—"}</p>
      </article>` : ""}
      <div class="cb-students">
        ${rows.map((r) => `<button type="button" class="cb-student ${this.studentEmail === r.email ? "on" : ""}" data-mb-student="${adEsc(r.email)}">
          <strong>${adEsc(r.name)}</strong>
          <span>${adEsc(r.email)}</span>
        </button>`).join("") || `<div class="cb-empty-box"><p>No students yet.</p></div>`}
      </div>
      ${this.footHTML("students")}
    </div>`;
    return this.screenHTML(p, "students", body);
  },

  communityHTML(p) {
    const can = canEditMentor(p) && AdminCore.can("courses", "edit");
    const map = typeof mentorRoomsOf === "function" ? mentorRoomsOf(p.id) : {};
    const types = typeof DESK_ROOM_TYPES !== "undefined" ? DESK_ROOM_TYPES : [];
    const body = `<form class="cb-panel" id="mbRoomsForm" data-mentor="${adEsc(p.id)}">
      <p class="cb-say">Turn a room on and paste the invite link. Off rooms stay hidden on this desk.</p>
      <div class="cb-rooms">
        ${types.map((t) => {
          const row = map[t.id] || {};
          return `<article class="cb-room">
            <strong>${adEsc(t.label)}</strong>
            <label class="cb-switch">
              <input type="checkbox" name="${adEsc(t.id)}_live" ${row.live ? "checked" : ""} ${can ? "" : "disabled"}>
              <span>${row.live ? "On" : "Off"}</span>
            </label>
            <input name="${adEsc(t.id)}_url" type="url" inputmode="url" placeholder="${adEsc(t.placeholder)}" value="${adEsc(row.url || "")}" ${can ? "" : "readonly"}>
          </article>`;
        }).join("")}
      </div>
      ${can ? `<button class="btn btn-primary" type="submit">Save community</button>` : ""}
      ${this.footHTML("community")}
    </form>`;
    return this.screenHTML(p, "community", body);
  },

  reviewsHTML(p) {
    const list = typeof reviewsFor === "function" ? reviewsFor("mentor", p.id) : [];
    const stats = typeof ratingStats === "function" ? ratingStats("mentor", p.id) : { avg: "0.0", count: 0 };
    const can = AdminCore.can("community", "edit") || AdminCore.can("community", "delete");
    const body = `<div class="cb-panel">
      <p class="cb-say">${stats.count ? `★ ${adEsc(stats.avg)} from ${stats.count} review${stats.count === 1 ? "" : "s"}.` : "No reviews on this desk yet. Students review after the batch ends."}</p>
      <div class="cb-reviews">
        ${list.map((r) => `<article class="cb-review">
          <header><strong>${adEsc(r.name)}</strong><span>★ ${adEsc(r.stars)}</span><small>${adEsc(r.city || "")}</small></header>
          <p>${adEsc(r.text)}</p>
          ${can && r.source === "learner" ? `<button type="button" class="btn btn-ghost" data-del-review="${adEsc(r.id)}">Remove</button>` : ""}
        </article>`).join("") || `<div class="cb-empty-box"><p>Reviews show at the bottom of the program page after the desk ends.</p></div>`}
      </div>
      ${this.footHTML("reviews")}
    </div>`;
    return this.screenHTML(p, "reviews", body);
  },

  nextHTML(p) {
    const can = canEditMentor(p) && AdminCore.can("courses", "edit");
    const map = typeof nextPathMap === "function" ? nextPathMap() : {};
    const cur = map["mentor:" + p.id] || {};
    const val = cur.id ? `${cur.kind || "course"}:${cur.id}` : "";
    const courses = typeof allCourses === "function" ? allCourses() : [];
    const webs = typeof allWebinars === "function" ? allWebinars() : [];
    const mentors = this.catalog().filter((x) => x.id !== p.id);
    const opt = (kind, id, title) => `<option value="${adEsc(kind)}:${adEsc(id)}" ${val === `${kind}:${id}` ? "selected" : ""}>${adEsc(title)}</option>`;
    const body = `<form class="cb-panel" id="mbNextForm" data-mentor="${adEsc(p.id)}">
      <p class="cb-say">When this batch ends, show this next. Leave blank to use the automatic pick.</p>
      <label>Show this next
        <select name="next" ${can ? "" : "disabled"}>
          <option value="">Automatic</option>
          <optgroup label="Courses">${courses.map((x) => opt("course", x.id, x.title)).join("")}</optgroup>
          <optgroup label="Webinars">${webs.map((w) => opt("webinar", w.id, w.title)).join("")}</optgroup>
          <optgroup label="Mentorships">${mentors.map((x) => opt("mentor", x.id, x.title)).join("")}</optgroup>
        </select>
      </label>
      ${can ? `<button class="btn btn-primary" type="submit">Save next</button>` : ""}
      ${this.footHTML("next")}
    </form>`;
    return this.screenHTML(p, "next", body);
  },

  viewHTML(p, tab) {
    const t = tab || this.firstTab(p);
    if (t === "setup") return this.setupHTML(p);
    if (t === "sessions") return this.sessionsHTML(p);
    if (t === "live") return this.liveHTML(p);
    if (t === "students") return this.studentsHTML(p);
    if (t === "community") return this.communityHTML(p);
    if (t === "reviews") return this.reviewsHTML(p);
    if (t === "next") return this.nextHTML(p);
    return this.landingHTML(p);
  },

  openBuilder(id, tab) {
    const p = this.byId(id);
    if (tab === "sessions") this.persistSessions(id);
    go("mentorBuilder", { mentorId: id, tab: tab || (p ? this.firstTab(p) : "setup") });
  },

  setVisibility(p, unlisted) {
    if (extraMentorPrograms().some((x) => x.id === p.id)) {
      applyMentorPatch(p.id, { unpublished: unlisted, status: unlisted ? "unlisted" : "published" });
      return;
    }
    const ids = hiddenMentorIds();
    if (unlisted && !ids.includes(p.id)) {
      ids.push(p.id);
      writeList(HIDDEN_MENTORS_KEY, ids);
    }
    if (!unlisted) writeList(HIDDEN_MENTORS_KEY, ids.filter((id) => id !== p.id));
    applyMentorPatch(p.id, { unpublished: unlisted, status: unlisted ? "unlisted" : "published" });
  },

  openSessionModal(mode, index) {
    const p = this.byId(Ad.mentorId);
    const form = document.getElementById("mbSessionForm");
    const modal = document.getElementById("mbSessionModal");
    if (!form || !modal || !p) return;
    const list = mentorLessonsFor(p.id);
    const lesson = index >= 0 ? list[index] : null;
    form.index.value = index;
    form.mode.value = lesson ? (lesson.mode || mode || "live") : (mode || "live");
    form.t.value = lesson?.t || "";
    form.at.value = lesson?.at ? mbLocal(lesson.at) : "";
    form.dur.value = lesson?.dur || "60 min";
    form.notes.value = lesson?.notes || "";
    form.src.value = lesson?.src || "";
    if (form.file) form.file.value = "";
    if (form.pdfFile) form.pdfFile.value = "";
    document.getElementById("mbSessionTitle").textContent = form.mode.value === "recorded" ? (lesson ? "Edit recording" : "Add a recording") : (lesson ? "Edit live session" : "Add a live session");
    form.classList.toggle("is-rec", form.mode.value === "recorded");
    modal.classList.remove("hidden");
    form.t.focus();
  },

  async saveSession(form) {
    const id = Ad.mentorId;
    const p = this.byId(id);
    if (!p || !canEditMentor(p)) return;
    const list = mentorLessonsFor(id).slice();
    const idx = Number(form.index.value);
    const mode = form.mode.value === "recorded" ? "recorded" : "live";
    let fileKey = idx >= 0 ? (list[idx]?.fileKey || "") : "";
    const file = form.file?.files?.[0];
    if (file && typeof putVideoBlob === "function") {
      fileKey = "mp-" + id + "-" + Date.now();
      await putVideoBlob(fileKey, file);
    }
    let pdf = idx >= 0 ? (list[idx]?.pdf || "") : "";
    let pdfName = idx >= 0 ? (list[idx]?.pdfName || "") : "";
    const pdfFile = form.pdfFile?.files?.[0];
    if (pdfFile) {
      pdf = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result || ""));
        r.onerror = () => reject(new Error("Could not read that PDF"));
        r.readAsDataURL(pdfFile);
      });
      pdfName = pdfFile.name;
    }
    const row = {
      id: idx >= 0 ? list[idx].id : (id + "-l" + Date.now()),
      t: form.t.value.trim(),
      dur: form.dur.value.trim() || "60 min",
      mode,
      at: form.at.value ? new Date(form.at.value).toISOString() : (p.at || ""),
      notes: form.notes.value.trim(),
      pdf,
      pdfName,
      src: String(form.src.value || "").trim(),
      vdoId: idx >= 0 ? (list[idx].vdoId || "") : "",
      fileKey
    };
    if (idx >= 0) list[idx] = { ...list[idx], ...row };
    else list.push(row);
    setMentorLessons(id, list);
    applyMentorPatch(id, { sessions: list.length });
    AdminCore.audit("mentor_session", id, "", row.t);
    toast(idx >= 0 ? "Session saved" : "Session added");
    this.openBuilder(id, "sessions");
  },

  saveSetup(form) {
    const id = form.dataset.mentor;
    const p = this.byId(id);
    if (!p || !canEditMentor(p)) return;
    const at = form.at.value ? new Date(form.at.value).toISOString() : p.at;
    applyMentorPatch(id, {
      title: form.title.value.trim(),
      by: form.by?.value || p.by,
      tag: form.tag.value.trim(),
      at,
      weeks: Number(form.weeks.value || p.weeks || 4),
      seats: Number(form.seats.value || p.seats || 20),
      hours: form.hours.value.trim() || p.hours
    });
    AdminCore.audit("mentor_edit", id, p.title, form.title.value.trim());
    toast("Details saved");
    this.openBuilder(id, "page");
  },

  async saveLanding(form) {
    const id = form.dataset.mentor;
    const p = this.byId(id);
    if (!p || !canEditMentor(p)) return;
    const btn = form.querySelector("[type=submit]");
    if (btn) { btn.disabled = true; btn.textContent = "Saving…"; }
    try {
      const banner = await resolveCourseBanner(form, p.banner || "");
      const learn = [...form.querySelectorAll("[name=learn]")].map((el) => el.value.trim()).filter(Boolean);
      const outcomes = [...form.querySelectorAll("[name=outcome]")].map((el) => el.value.trim()).filter(Boolean);
      if (learn.length < 5) { toast("Add at least 5 What You Will Learn points"); return; }
      if (outcomes.length < 3) { toast("Add at least 3 outcome lines"); return; }
      if (!String(form.blurb.value || "").trim()) { toast("Write the short story"); return; }
      if (!(Number(form.price.value) > 0)) { toast("Add a price"); return; }
      const isSeed = typeof MENTOR_PROGRAMS !== "undefined" && MENTOR_PROGRAMS.some((x) => x.id === id);
      if (!banner && !isSeed && !form.tint.value) { toast("Add a desk picture or keep the desk colour"); return; }
      const whoTitles = [...form.querySelectorAll("[name=whoTitle]")];
      const whoNotes = [...form.querySelectorAll("[name=whoNote]")];
      const who = whoTitles.map((el, i) => ({ t: el.value.trim(), d: (whoNotes[i]?.value || "").trim() })).filter((x) => x.t);
      const stepTitles = [...form.querySelectorAll("[name=stepTitle]")];
      const stepNotes = [...form.querySelectorAll("[name=stepNote]")];
      const steps = stepTitles.map((el, i) => ({ n: String(i + 1).padStart(2, "0"), t: el.value.trim(), d: (stepNotes[i]?.value || "").trim() })).filter((x) => x.t);
      applyMentorPatch(id, {
        price: Number(form.price.value),
        old: Number(form.old.value || form.price.value),
        blurb: form.blurb.value.trim(),
        bio: form.bio.value.trim(),
        banner,
        tint: form.tint.value || p.tint || "#C7D2FE",
        learn,
        outcomes,
        prep: [...form.querySelectorAll("[name=prep]")].map((el) => el.value.trim()).filter(Boolean),
        curriculum: [...form.querySelectorAll("[name=curriculum]")].map((el) => el.value.trim()).filter(Boolean),
        who,
        steps
      });
      AdminCore.audit("mentor_edit", id, p.title, "page");
      toast("Page saved");
      this.openBuilder(id, "sessions");
    } catch (err) {
      toast(err.message || "Could not save page");
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = "Save & continue →"; }
    }
  },

  saveRooms(form) {
    const id = form.dataset.mentor;
    const p = this.byId(id);
    if (!p || !canEditMentor(p)) return;
    const next = {};
    (typeof DESK_ROOM_TYPES !== "undefined" ? DESK_ROOM_TYPES : []).forEach((t) => {
      next[t.id] = {
        live: form[t.id + "_live"]?.checked === true,
        url: form[t.id + "_url"]?.value || ""
      };
    });
    if (typeof setMentorRooms === "function") setMentorRooms(id, next);
    AdminCore.audit("mentor_community", id, "", "updated");
    toast("Community saved for this desk");
    paint();
  },

  saveNext(form) {
    const id = form.dataset.mentor;
    const p = this.byId(id);
    if (!p || !canEditMentor(p)) return;
    const map = typeof nextPathMap === "function" ? nextPathMap() : {};
    const raw = form.next.value || "";
    const cut = raw.indexOf(":");
    if (cut < 1) delete map["mentor:" + id];
    else map["mentor:" + id] = { kind: raw.slice(0, cut), id: raw.slice(cut + 1) };
    if (typeof setNextPathMap === "function") setNextPathMap(map);
    AdminCore.audit("next_path", id, "", raw || "auto");
    toast("Next path saved");
    paint();
  },

  createDesk(form) {
    AdminCore.assert("courses", "create");
    const s = AdminCore.session();
    const id = "mp-" + Date.now();
    const title = form.title.value.trim();
    const extra = extraMentorPrograms();
    extra.push({
      id,
      title,
      by: s.name,
      at: new Date(Date.now() + 7 * 86400000).toISOString(),
      weeks: 4,
      sessions: 0,
      hours: 12,
      price: 0,
      old: 0,
      seats: 16,
      tint: "#C7D2FE",
      tag: "Desk",
      blurb: "",
      ownerEmail: s.email,
      banner: "",
      unpublished: true,
      status: "unlisted",
      createdAt: new Date().toISOString()
    });
    writeList(EXTRA_MENTORS_KEY, extra);
    if (typeof setMentorLessons === "function") setMentorLessons(id, []);
    AdminCore.audit("mentor_create", id, "", title);
    toast("Draft ready. Add the details.");
    this.openBuilder(id, "setup");
  },

  bind() {
    if (this._bound) return;
    this._bound = true;
    const view = document.getElementById("adminView");
    const side = document.getElementById("adminSide");
    if (!view) return;

    view.addEventListener("input", (e) => {
      if (e.target.id !== "mbSearch") return;
      this.titleQ = e.target.value;
      const pos = e.target.selectionStart;
      paint();
      const inp = document.getElementById("mbSearch");
      if (inp) { inp.focus(); inp.setSelectionRange(pos, pos); }
    });

    view.addEventListener("submit", (e) => {
      if (e.target.id === "mbCreateForm") { e.preventDefault(); this.createDesk(e.target); }
      if (e.target.id === "mbSetupForm") { e.preventDefault(); this.saveSetup(e.target); }
      if (e.target.id === "mbLandingForm") { e.preventDefault(); this.saveLanding(e.target); }
      if (e.target.id === "mbSessionForm") { e.preventDefault(); this.saveSession(e.target).catch((err) => toast(err.message || "Could not save session")); }
      if (e.target.id === "mbRoomsForm") { e.preventDefault(); this.saveRooms(e.target); }
      if (e.target.id === "mbNextForm") { e.preventDefault(); this.saveNext(e.target); }
    });

    view.addEventListener("click", (e) => {
      if (e.target.closest("[data-mb-create]")) {
        document.getElementById("mbCreateModal")?.classList.remove("hidden");
        document.querySelector("#mbCreateForm [name=title]")?.focus();
        return;
      }
      if (e.target.closest("[data-mb-create-close]") || e.target.id === "mbCreateModal") {
        if (e.target.id === "mbCreateModal" || e.target.closest("[data-mb-create-close]")) {
          document.getElementById("mbCreateModal")?.classList.add("hidden");
        }
        return;
      }
      const open = e.target.closest("[data-mb-open]");
      if (open) { this.openBuilder(open.dataset.mbOpen); return; }
      const tab = e.target.closest("[data-mb-tab]");
      if (tab && Ad.mentorId) { this.openBuilder(Ad.mentorId, tab.dataset.mbTab); return; }
      if (e.target.closest("[data-mb-back]")) { go("mentors"); return; }
      const addSess = e.target.closest("[data-mb-add-session]");
      if (addSess) { this.openSessionModal(addSess.dataset.mbAddSession, -1); return; }
      const hostSess = e.target.closest("[data-mb-host-session]");
      if (hostSess && Ad.mentorId) {
        if (typeof startMentorSessionAsHost === "function") startMentorSessionAsHost(Ad.mentorId, Number(hostSess.dataset.mbHostSession));
        else toast("Could not open the live room");
        return;
      }
      const editSess = e.target.closest("[data-mb-edit-session]");
      if (editSess) { this.openSessionModal("", Number(editSess.dataset.mbEditSession)); return; }
      const delSess = e.target.closest("[data-mb-del-session]");
      if (delSess && Ad.mentorId && confirm("Remove this session?")) {
        const list = mentorLessonsFor(Ad.mentorId).filter((_, i) => i !== Number(delSess.dataset.mbDelSession));
        setMentorLessons(Ad.mentorId, list);
        applyMentorPatch(Ad.mentorId, { sessions: list.length });
        paint();
        return;
      }
      const addLine = e.target.closest("[data-mb-add-line]");
      if (addLine) {
        const name = addLine.dataset.mbAddLine;
        const box = name === "learn" ? document.getElementById("mbLearnList")
          : name === "outcome" ? document.getElementById("mbOutcomeList")
          : name === "prep" ? document.getElementById("mbPrepList")
          : document.getElementById("mbCurrList");
        if (!box) return;
        const values = [...box.querySelectorAll(`[name=${name}]`)].map((el) => el.value);
        values.push("");
        const min = name === "learn" ? 5 : name === "outcome" ? 3 : 0;
        box.innerHTML = values.map((v, i) => this.lineRow(name, v, i, true, min, "")).join("");
        box.querySelector(".cb-line:last-child input")?.focus();
        return;
      }
      const delLine = e.target.closest("[data-mb-del-line]");
      if (delLine) {
        delLine.closest(".cb-line")?.remove();
        return;
      }
      const addPair = e.target.closest("[data-mb-add-pair]");
      if (addPair) {
        const kind = addPair.dataset.mbAddPair;
        const box = kind === "who" ? document.getElementById("mbWhoList") : document.getElementById("mbStepList");
        if (!box) return;
        const rows = [...box.querySelectorAll("[data-mb-pair]")].map((row) => ({
          t: row.querySelector(`[name=${kind}Title]`)?.value || "",
          d: row.querySelector(`[name=${kind}Note]`)?.value || ""
        }));
        rows.push({ t: "", d: "" });
        box.innerHTML = rows.map((row, i) => this.pairRow(kind, row, i, true)).join("");
        return;
      }
      const delPair = e.target.closest("[data-mb-del-pair]");
      if (delPair) {
        delPair.closest("[data-mb-pair]")?.remove();
        return;
      }
      const student = e.target.closest("[data-mb-student]");
      if (student) { this.studentEmail = student.dataset.mbStudent; paint(); return; }
      if (e.target.closest("[data-mb-student-close]")) { this.studentEmail = ""; paint(); return; }
      const goLive = e.target.closest("[data-mb-golive]");
      if (goLive) {
        const p = this.byId(goLive.dataset.mbGolive);
        if (!p || !this.progress(p).setup || !this.progress(p).page || !this.progress(p).sessions) {
          toast("Finish the list first");
          return;
        }
        this.setVisibility(p, false);
        AdminCore.audit("mentor_publish", p.id, "draft", "live");
        toast("Mentorship is live");
        paint();
        return;
      }
      const draft = e.target.closest("[data-mb-draft]");
      if (draft) {
        const p = this.byId(draft.dataset.mbDraft);
        if (!p) return;
        this.setVisibility(p, true);
        AdminCore.audit("mentor_unpublish", p.id, "live", "draft");
        toast("Back to draft. Students cannot enroll.");
        paint();
        return;
      }
      if (e.target.closest("[data-mb-session-close]") || e.target.id === "mbSessionModal") {
        if (e.target.id === "mbSessionModal" || e.target.closest("[data-mb-session-close]")) {
          document.getElementById("mbSessionModal")?.classList.add("hidden");
        }
      }
    });

    view.addEventListener("change", (e) => {
      if (e.target.name === "bannerFile" && e.target.closest("#mbLandingForm")) {
        const file = e.target.files?.[0];
        const prev = document.getElementById("mbBannerPrev");
        if (file && prev) { prev.src = URL.createObjectURL(file); prev.hidden = false; }
      }
      if (e.target.closest("#mbRoomsForm") && e.target.type === "checkbox" && e.target.name.endsWith("_live")) {
        const lab = e.target.closest(".cb-switch")?.querySelector("span");
        if (lab) lab.textContent = e.target.checked ? "On" : "Off";
      }
    });

    if (side) {
      side.addEventListener("click", (e) => {
        if (e.target.closest("[data-mb-back]")) { go("mentors"); return; }
        const tab = e.target.closest("[data-mb-tab]");
        if (tab && Ad.mentorId) this.openBuilder(Ad.mentorId, tab.dataset.mbTab);
      });
    }
  }
};
