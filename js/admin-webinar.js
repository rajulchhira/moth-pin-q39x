function canEditWebinar(w) {
  const s = AdminCore.session();
  if (!s || !w) return false;
  if (AdminCore.isOwner()) return true;
  if (!AdminCore.can("live", "edit")) return false;
  const mail = String(s.email || "").toLowerCase();
  return String(w.hostEmail || "").toLowerCase() === mail
    || String(w.ownerEmail || "").toLowerCase() === mail
    || w.by === s.name;
}

function wbLocal(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const WebinarAdmin = {
  titleQ: "",
  studentEmail: "",
  STEPS: [
    { id: "setup", n: "1", label: "Details", hint: "Name & time" },
    { id: "page", n: "2", label: "Page", hint: "What students see" },
    { id: "session", n: "3", label: "Session", hint: "Room & start" },
    { id: "live", n: "4", label: "Go live", hint: "Publish & start" }
  ],
  MORE: [
    { id: "students", label: "Students", hint: "Who enrolled" },
    { id: "community", label: "Community", hint: "Links on / off" },
    { id: "reviews", label: "Reviews", hint: "Ratings" },
    { id: "next", label: "Next", hint: "What they buy next" }
  ],

  catalog() {
    const list = typeof webinarCatalogAll === "function" ? webinarCatalogAll() : (typeof allWebinars === "function" ? allWebinars().filter((w) => w.kind !== "class") : []);
    if (AdminCore.isOwner()) return list;
    const s = AdminCore.session();
    if (!s) return [];
    return list.filter((w) => w.hostEmail === s.email || w.ownerEmail === s.email || w.by === s.name);
  },

  byId(id) {
    return this.catalog().find((w) => w.id === id)
      || (typeof webinarById === "function" ? webinarById(id) : null);
  },

  isSeed(w) {
    return ["w0", "w1", "w2", "w3", "w4"].includes(w?.id);
  },

  phaseLabel(w) {
    const phase = typeof webinarPhase === "function" ? webinarPhase(w) : (w.status || "upcoming");
    if (w.unpublished || phase === "draft") return "Draft";
    if (phase === "ended") return "Ended";
    if (phase === "live") return "Live now";
    return "Upcoming";
  },

  statusLabel(w) {
    return w.unpublished ? "Draft" : "Live";
  },

  thumb(w) {
    if (typeof webinarBannerHTML === "function") {
      return `<span class="cb-thumb cb-thumb-real wb-thumb">${webinarBannerHTML(w)}</span>`;
    }
    return `<span class="cb-thumb cb-thumb-gen">${adEsc((w.title || "W").slice(0, 1))}</span>`;
  },

  progress(w) {
    const titleOk = Boolean(String(w.title || "").trim()) && !/^untitled/i.test(w.title) && Boolean(String(w.by || "").trim()) && Boolean(w.at);
    const pack = typeof webinarProfile === "function" ? webinarProfile(w) : {};
    const story = String(pack.about || w.about || w.blurb || w.notes || "").trim();
    const learnN = (Array.isArray(w.learn) ? w.learn : (pack.learn || [])).filter((x) => String(x || "").trim()).length;
    const priceOk = w.free !== false || Number(w.price) > 0 || this.isSeed(w);
    const pageOk = this.isSeed(w)
      ? Boolean(story)
      : Boolean(story) && learnN >= 4 && priceOk;
    const sessionOk = this.isSeed(w) || Boolean(String(w.notes || "").trim()) || Boolean(w.introUrl) || Boolean(w.pdf) || Boolean(w.recordUrl);
    return { setup: titleOk, page: pageOk, session: sessionOk, live: !w.unpublished };
  },

  firstTab(w) {
    const prog = this.progress(w);
    if (!prog.setup) return "setup";
    if (!prog.page) return "page";
    if (!prog.session) return "session";
    if (!prog.live) return "live";
    return "session";
  },

  nextHint(w) {
    const prog = this.progress(w);
    if (!prog.setup) return "Next: add the title and start time";
    if (!prog.page) {
      if (!String(w.about || w.blurb || w.notes || "").trim()) return "Next: write the short story";
      return "Next: add 4 What You Will Learn points";
    }
    if (!prog.session) return "Next: add notes or an intro for the room";
    if (!prog.live) return "Publish it, then start the room";
    if (w.status === "live") return "Room is live — enter as host";
    if (w.status === "ended") return "Ended";
    return "On the site — start the room when ready";
  },

  nextTab(tab) {
    const i = this.STEPS.findIndex((s) => s.id === tab);
    return this.STEPS[Math.min(this.STEPS.length - 1, i + 1)]?.id || "live";
  },

  prevTab(tab) {
    const i = this.STEPS.findIndex((s) => s.id === tab);
    return this.STEPS[Math.max(0, i - 1)]?.id || "setup";
  },

  stepperHTML(w, tab) {
    const prog = this.progress(w);
    return `<ol class="cb-stepper" aria-label="Webinar steps">
      ${this.STEPS.map((s, i) => {
        const done = prog[s.id];
        const on = s.id === tab;
        return `<li>
          <button type="button" data-wb-tab="${s.id}" class="${on ? "on" : ""} ${done ? "is-done" : ""}">
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

  seeHTML(w) {
    const base = `/webinar?id=${encodeURIComponent(w.id)}&preview=1`;
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
    const saveNext = tab === "setup" || tab === "page" || tab === "session";
    return `<div class="cb-foot">
      ${tab === "setup" || extraTab ? `<button type="button" class="btn btn-ghost" data-wb-back>← All webinars</button>`
        : `<button type="button" class="btn btn-ghost" data-wb-tab="${back}">← Back</button>`}
      <div class="cb-foot-main">
        ${extra || ""}
        ${last || extraTab ? "" : saveNext
          ? `<button class="btn btn-primary" type="submit">Save & continue →</button>`
          : `<button type="button" class="btn btn-primary" data-wb-tab="${next}">Continue →</button>`}
      </div>
    </div>`;
  },

  hostRoomHref(id) {
    return typeof webinarHostRoomHref === "function"
      ? webinarHostRoomHref(id)
      : `/live-room?id=${encodeURIComponent(id)}&host=1`;
  },

  hostBarHTML(w) {
    const can = canEditWebinar(w) && AdminCore.can("live", "edit");
    if (!can) return "";
    const live = w.status === "live";
    const ended = w.status === "ended";
    const href = this.hostRoomHref(w.id);
    return `<aside class="wb-hostbar ${live ? "is-live" : ended ? "is-ended" : ""}">
      <div>
        <strong>${live ? "Room is live now" : ended ? "This webinar has ended" : "Start this webinar"}</strong>
        <p>${ended
          ? "Paste a recording URL on the Session tab if you have one."
          : live
            ? "Enrolled students can join from the webinar page. Stay in the room as host."
            : w.unpublished
              ? "This listing is still a draft. You can start the room to test. Students will not see it until you publish."
              : "This opens the live classroom. Enrolled students can join after you start."}</p>
      </div>
      <div class="wb-hostbar-actions">
        ${ended ? `<a class="btn btn-ghost" href="${href}">Open room</a>`
          : live
            ? `<a class="btn btn-primary" href="${href}">Enter room as host</a>
               <button type="button" class="btn btn-ghost" data-wb-end="${adEsc(w.id)}">End webinar</button>`
            : `<button type="button" class="btn btn-primary" data-wb-start="${adEsc(w.id)}">Start webinar</button>
               <a class="btn btn-ghost" href="${href}">Open room first</a>`}
      </div>
    </aside>`;
  },

  catalogHostHTML(w) {
    const can = canEditWebinar(w) && AdminCore.can("live", "edit");
    if (!can || w.status === "ended") return "";
    if (w.status === "live") {
      return `<a class="btn btn-primary cb-card-host" href="${this.hostRoomHref(w.id)}" data-wb-enter="${adEsc(w.id)}">Enter as host</a>`;
    }
    return `<button type="button" class="btn btn-primary cb-card-host" data-wb-start="${adEsc(w.id)}">Start webinar</button>`;
  },

  screenHTML(w, tab, body) {
    return `<section class="cb-desk">
      <div class="cb-desk-top">
        <div>
          <span class="cb-pill ${w.unpublished ? "is-draft" : "is-live"}">${adEsc(this.statusLabel(w))}</span>
          <span class="cb-pill ${w.status === "live" ? "is-live" : "is-draft"}">${w.status === "live" ? "Room live" : w.status === "ended" ? "Ended" : "Room not started"}</span>
          <h2>${adEsc(w.title)}</h2>
        </div>
        ${this.seeHTML(w)}
      </div>
      ${this.hostBarHTML(w)}
      ${this.stepperHTML(w, tab)}
      ${body}
    </section>`;
  },

  filtered() {
    const q = String(this.titleQ || "").trim().toLowerCase();
    return this.catalog().filter((w) => {
      if (!q) return true;
      return [w.title, w.by, w.tag, this.phaseLabel(w), this.nextHint(w)].join(" ").toLowerCase().includes(q);
    });
  },

  catalogHTML() {
    const rows = this.filtered();
    const canCreate = AdminCore.can("live", "create");
    const drafts = this.catalog().filter((w) => w.unpublished).length;
    return `<section class="cb-home desk-home">
      <div class="cb-home-bar desk-toolbar">
        <input id="wbSearch" type="search" value="${adEsc(this.titleQ)}" placeholder="Find a webinar…">
        ${canCreate ? `<button type="button" class="btn btn-primary" data-wb-create>+ New webinar</button>` : ""}
      </div>
      <p class="cb-home-note">${this.catalog().length} webinars${drafts ? ` · ${drafts} still draft` : ""}. Start the room from this list. Open a row to edit details.</p>
      <div class="cb-cards desk-cards">
        ${rows.map((w, i) => {
          const host = typeof deskHostOf === "function" ? deskHostOf(w.hostEmail || w.ownerEmail, w.by) : { name: w.by, photo: w.hostPhoto };
          const regs = typeof readList === "function" ? readList(REGS_KEY).filter((r) => r.id === w.id).length : 0;
          const when = typeof formatLiveWhen === "function" ? formatLiveWhen(w.at) : (w.when || "");
          const mins = w.duration || ((typeof webinarMins === "function" ? webinarMins(w) : 60) + " min");
          return `<article class="desk-row" style="--i:${i}">
            <button type="button" class="desk-row-main" data-wb-open="${adEsc(w.id)}">
              ${this.thumb(w)}
              <div class="desk-copy">
                <strong>${adEsc(w.title)}</strong>
                ${typeof deskMetaHTML === "function" ? deskMetaHTML([
                  adEsc(this.phaseLabel(w)),
                  adEsc(mins),
                  w.seats ? regs + "/" + w.seats + " seats" : (regs ? regs + " enrolled" : ""),
                  w.lang ? adEsc(w.lang) : "",
                  w.free === false && w.price ? "₹" + Number(w.price).toLocaleString("en-IN") : "Free"
                ]) : ""}
                <div class="desk-hostline">${typeof deskFaceHTML === "function" ? deskFaceHTML(host.name, host.photo || w.hostPhoto) : ""}<span>${adEsc(host.name || w.by || "Host")}</span></div>
                <em>${adEsc(when ? when + " · " : "")}${adEsc(this.nextHint(w))}</em>
              </div>
            </button>
            <div class="desk-side">
              <span class="cb-pill ${w.status === "live" ? "is-live" : w.unpublished ? "is-draft" : "is-live"}">${w.status === "live" ? "Live now" : adEsc(this.statusLabel(w))}</span>
              ${this.catalogHostHTML(w)}
            </div>
          </article>`;
        }).join("") || `<div class="cb-empty-box"><p>No webinar matches that search.</p></div>`}
      </div>
      <div class="cb-modal hidden" id="wbCreateModal">
        <form class="cb-modal-card" id="wbCreateForm">
          <h3>New webinar</h3>
          <p>Just the name. You can change everything after this.</p>
          <label>What should students call this session?
            <input name="title" required autofocus placeholder="e.g. Opening Range Live Desk">
          </label>
          <div class="cb-modal-actions">
            <button class="btn btn-ghost" type="button" data-wb-create-close>Cancel</button>
            <button class="btn btn-primary" type="submit">Start</button>
          </div>
        </form>
      </div>
    </section>`;
  },

  sideHTML(w) {
    const tab = Ad.webinarTab || this.firstTab(w);
    const prog = this.progress(w);
    const s = AdminCore.session();
    return `
      <a class="ad-brand" href="/">${typeof brandLogoHTML === "function" ? brandLogoHTML("ad") : "Bizgarh"}</a>
      <button type="button" class="cb-back" data-wb-back>← All webinars</button>
      <div class="cb-side-course">
        ${this.thumb(w)}
        <div>
          <strong>${adEsc(w.title)}</strong>
          <small>${adEsc(this.statusLabel(w))} · ${adEsc(this.phaseLabel(w))}</small>
        </div>
      </div>
      <nav class="ad-nav cb-side-nav">
        ${this.STEPS.map((st) => `<button type="button" data-wb-tab="${st.id}" class="${tab === st.id ? "on" : ""}">
          <span>${prog[st.id] ? "✓" : st.n}</span> ${adEsc(st.label)}
        </button>`).join("")}
        <span class="ad-nav-label">Also</span>
        ${this.MORE.map((st) => `<button type="button" data-wb-tab="${st.id}" class="${tab === st.id ? "on" : ""}">
          ${adEsc(st.label)}
        </button>`).join("")}
      </nav>
      <div class="ad-side-foot">
        <div class="ad-who">${adEsc(s.name)}<br>${AdminCore.isSuperAdmin() ? "Super Admin" : (AdminCore.isOwner() ? "Owner" : "Admin")}</div>
        <button type="button" id="staffLogout">Logout</button>
        <a href="/">← Public site</a>
      </div>`;
  },

  mentorOptions(w) {
    const names = [...new Set([w.by, ...(typeof MENTORS !== "undefined" ? MENTORS.map((m) => m.name) : [])].filter(Boolean))];
    return names.map((n) => `<option value="${adEsc(n)}" ${w.by === n ? "selected" : ""}>${adEsc(n)}</option>`).join("");
  },

  setupHTML(w) {
    const can = canEditWebinar(w) && AdminCore.can("live", "edit");
    const mins = typeof webinarMins === "function" ? webinarMins(w) : 60;
    const body = `<form class="cb-panel" id="wbSetupForm" data-webinar="${adEsc(w.id)}">
      <p class="cb-say">Name the session, pick the host, and set when it starts. One sitting — no weekly batch here.</p>
      <label class="cb-big">Webinar name
        <input name="title" required value="${adEsc(w.title)}" ${can ? "" : "readonly"} placeholder="Students see this name">
      </label>
      ${typeof deskHostLockHTML === "function"
        ? deskHostLockHTML(deskHostOf(w.hostEmail || w.ownerEmail, w.by), { field: "by" })
        : `<label>Who hosts it?
        <select name="by" ${can && AdminCore.isOwner() ? "" : "disabled"}>
          ${this.mentorOptions(w)}
        </select>
      </label>`}
      <label>Tag
        <input name="tag" value="${adEsc(w.tag || "")}" ${can ? "" : "readonly"} placeholder="e.g. Nifty options">
      </label>
      <div class="cb-split">
        <label>Starts <em>required</em>
          <input name="at" type="datetime-local" required value="${adEsc(wbLocal(w.at))}" ${can ? "" : "readonly"}>
        </label>
        <label>Length (minutes)
          <input name="mins" type="number" min="15" value="${adEsc(mins)}" ${can ? "" : "readonly"}>
        </label>
      </div>
      <div class="cb-split">
        <label>Seat cap
          <input name="seats" type="number" min="1" value="${adEsc(w.seats || (typeof webinarProfile === "function" ? webinarProfile(w).seats : 80))}" ${can ? "" : "readonly"}>
        </label>
        <label>Language
          <input name="lang" value="${adEsc(w.lang || (typeof webinarProfile === "function" ? webinarProfile(w).lang : "Hindi, English"))}" ${can ? "" : "readonly"}>
        </label>
      </div>
      ${can ? this.footHTML("setup") : ""}
    </form>`;
    return this.screenHTML(w, "setup", body);
  },

  lineRow(name, value, i, can, min, placeholder) {
    return `<div class="cb-line">
      <label>Point ${i + 1}${i < min ? ` <em>required</em>` : ""}
        <input name="${adEsc(name)}" ${i < min ? "required" : ""} value="${adEsc(value || "")}" ${can ? "" : "readonly"} placeholder="${adEsc(placeholder)}">
      </label>
      ${can && i >= min ? `<button type="button" class="cb-x" data-wb-del-line="${adEsc(name)}" title="Remove">✕</button>` : ""}
    </div>`;
  },

  pairRow(kind, row, i, can) {
    return `<div class="cb-bonus-row" data-wb-pair="${adEsc(kind)}">
      <label>Who ${i + 1}<input name="${adEsc(kind)}Title" value="${adEsc(row.t || "")}" ${can ? "" : "readonly"} placeholder="e.g. Intraday traders"></label>
      <label>Line<input name="${adEsc(kind)}Note" value="${adEsc(row.d || "")}" ${can ? "" : "readonly"} placeholder="One short line"></label>
      ${can ? `<button type="button" class="cb-x" data-wb-del-pair="${adEsc(kind)}" title="Remove">✕</button>` : ""}
    </div>`;
  },

  landingHTML(w) {
    const can = canEditWebinar(w) && AdminCore.can("live", "edit");
    const banner = typeof webinarBannerOf === "function" ? webinarBannerOf(w) : "";
    const pack = typeof webinarProfile === "function" ? webinarProfile(w) : { learn: [], audience: [], about: "", aboutMore: "", bio: "", listPrice: 1999, price: 0 };
    const learn = [...(pack.learn || [])];
    while (learn.length < 4) learn.push("");
    const free = !(pack.price > 0);
    const body = `<div class="cb-pagegrid">
      <form class="cb-panel cb-pageform" id="wbLandingForm" data-webinar="${adEsc(w.id)}">
        <p class="cb-say">This is the public webinar page. Story and 4 learn points are required. Price can stay free.</p>
        <label class="cb-drop-pic">
          <span>${banner ? "Change picture" : "Add a webinar picture"}</span>
          <small>Width 1280 px × height 720 px (16:9). JPG, PNG or WebP.</small>
          <em>This banner shows on the listing and the webinar page. Leave empty to keep the designed cover.</em>
          <input name="bannerFile" type="file" accept="image/jpeg,image/png,image/webp,image/*" ${can ? "" : "disabled"}>
        </label>
        <input name="banner" type="url" inputmode="url" placeholder="Or paste an image link" value="${adEsc(banner && !String(banner).startsWith("data:") ? banner : "")}" ${can ? "" : "readonly"}>
        ${banner ? `<img class="cb-banner-prev" id="wbBannerPrev" src="${adEsc(banner)}" alt="">` : `<img class="cb-banner-prev" id="wbBannerPrev" alt="" hidden>`}
        ${can && banner ? `<label class="cb-check"><input type="checkbox" name="bannerClear"> Remove picture</label>` : ""}
        <label>Cover colour
          <input name="tint" type="color" value="${adEsc(/^#/.test(w.tint || "") ? w.tint : "#4F46E5")}" ${can ? "" : "disabled"}>
        </label>
        <label class="cb-check"><input type="checkbox" name="free" ${free ? "checked" : ""} ${can ? "" : "disabled"}> This webinar is free</label>
        <div class="cb-split">
          <label>Price students pay ₹
            <input name="price" type="number" min="0" value="${adEsc(pack.price || 0)}" ${can ? "" : "readonly"}>
          </label>
          <label>List price ₹ <small>(shown struck when free)</small>
            <input name="listPrice" type="number" min="0" value="${adEsc(pack.listPrice || 1999)}" ${can ? "" : "readonly"}>
          </label>
        </div>
        <label>Short story <em>required</em>
          <textarea name="about" required ${can ? "" : "readonly"} placeholder="2–4 lines. What this live session is.">${adEsc(pack.about || "")}</textarea>
        </label>
        <label>More about
          <textarea name="aboutMore" ${can ? "" : "readonly"} placeholder="Shown under show more.">${adEsc(pack.aboutMore || "")}</textarea>
        </label>
        <label>Host bio <small>auto-filled from the sub-admin profile</small>
          <textarea name="bio" ${can ? "" : "readonly"} placeholder="Filled from the host profile.">${adEsc(pack.bio || (typeof deskHostOf === "function" ? deskHostOf(w.hostEmail || w.ownerEmail, w.by).bio : "") || "")}</textarea>
        </label>
        <div class="cb-block">
          <p class="cb-say">What You Will Learn <small>minimum 4, required</small></p>
          <div class="cb-stack" id="wbLearnList">
            ${learn.map((v, i) => this.lineRow("learn", v, i, can, 4, "One thing they can do after this session")).join("")}
          </div>
          ${can ? `<button type="button" class="cb-add-chapter" data-wb-add-line="learn">+ Add another point</button>` : ""}
        </div>
        <div class="cb-block">
          <p class="cb-say">Who is this webinar for</p>
          <div class="cb-stack" id="wbWhoList">
            ${(pack.audience || []).map((row, i) => this.pairRow("who", row, i, can)).join("")}
          </div>
          ${can ? `<button type="button" class="cb-add-chapter" data-wb-add-pair="who">+ Add who</button>` : ""}
        </div>
        ${can ? this.footHTML("page") : ""}
      </form>
      <aside class="cb-preview">
        <span>Students see this</span>
        <div class="cb-preview-thumb">${this.thumb(w)}</div>
        <strong>${adEsc(w.title)}</strong>
        <p>by ${adEsc(w.by)}</p>
        <b>${pack.price ? "₹" + Number(pack.price).toLocaleString("en-IN") : "FREE"}</b>
      </aside>
    </div>`;
    return this.screenHTML(w, "page", body);
  },

  sessionHTML(w) {
    const can = canEditWebinar(w) && AdminCore.can("live", "edit");
    const body = `<form class="cb-panel" id="wbSessionForm" data-webinar="${adEsc(w.id)}">
      <p class="cb-say">One live room. Add notes, a PDF, or an intro. Recording stays here after it ends. No DRM course player.</p>
      <label>Session notes <em>required unless you add an intro or PDF</em>
        <textarea name="notes" ${can ? "" : "readonly"} placeholder="Shown in the overview after they enroll.">${adEsc(w.notes || "")}</textarea>
      </label>
      <label>Intro video
        <input name="introUrl" type="url" inputmode="url" value="${adEsc(w.introUrl || "")}" ${can ? "" : "readonly"} placeholder="YouTube or MP4 URL">
      </label>
      <label>PDF link
        <input name="pdf" type="url" inputmode="url" value="${adEsc(w.pdf && String(w.pdf).startsWith("data:") ? "" : (w.pdf || ""))}" ${can ? "" : "readonly"} placeholder="https://…">
      </label>
      <label class="cb-drop-pic">
        <span>${w.pdfName || (w.pdf ? "Replace session PDF" : "Upload session PDF")}</span>
        <input name="pdfFile" type="file" accept="application/pdf" ${can ? "" : "disabled"}>
      </label>
      <div class="cb-split">
        <label>Chat
          <select name="chat" ${can ? "" : "disabled"}>
            <option value="1" ${w.chat !== false ? "selected" : ""}>On</option>
            <option value="0" ${w.chat === false ? "selected" : ""}>Off</option>
          </select>
        </label>
        <label>Record
          <select name="record" ${can ? "" : "disabled"}>
            <option value="1" ${w.record !== false ? "selected" : ""}>Yes</option>
            <option value="0" ${w.record === false ? "selected" : ""}>No</option>
          </select>
        </label>
      </div>
      <label>Recording URL <small>after it ends</small>
        <input name="recordUrl" type="url" inputmode="url" value="${adEsc(w.recordUrl || "")}" ${can ? "" : "readonly"} placeholder="https://…">
      </label>
      <label>Room status <small>use Start webinar above unless you need to mark it ended here</small>
        <select name="status" ${can ? "" : "disabled"}>
          <option value="scheduled" ${w.status !== "live" && w.status !== "ended" ? "selected" : ""}>Scheduled</option>
          <option value="live" ${w.status === "live" ? "selected" : ""}>Live now</option>
          <option value="ended" ${w.status === "ended" ? "selected" : ""}>Ended</option>
        </select>
      </label>
      ${can ? this.footHTML("session") : ""}
    </form>`;
    return this.screenHTML(w, "session", body);
  },

  liveHTML(w) {
    const prog = this.progress(w);
    const can = canEditWebinar(w) && AdminCore.can("live", "edit");
    const checks = [
      [prog.setup, "Webinar has a name, host, and start time", "setup"],
      [prog.page, "Page has a story and learn list", "page"],
      [prog.session, "Session has notes, an intro, or a PDF", "session"]
    ];
    const ready = prog.setup && prog.page && prog.session;
    const body = `<div class="cb-panel cb-go">
      <p class="cb-say">${w.unpublished
        ? "Publish puts this webinar on the site so students can enroll. Starting the room is the Start webinar button above."
        : "This webinar is on the site. Use Start webinar above when you want the classroom to open."}</p>
      <ul class="cb-check-list">
        ${checks.map(([ok, label, tab]) => `<li class="${ok ? "ok" : "miss"}">
          <b>${ok ? "✓" : "!"}</b>
          <span>${adEsc(label)}</span>
          ${ok ? "" : `<button type="button" data-wb-tab="${tab}">Fix this</button>`}
        </li>`).join("")}
      </ul>
      ${can ? (w.unpublished
        ? `<button type="button" class="btn btn-primary cb-go-btn" data-wb-golive="${adEsc(w.id)}" ${ready ? "" : "disabled"}>${ready ? "Make it live" : "Finish the list first"}</button>`
        : `<button type="button" class="btn btn-ghost" data-wb-draft="${adEsc(w.id)}">Take it back to draft</button>`) : ""}
      ${this.seeHTML(w)}
      ${this.footHTML("live")}
    </div>`;
    return this.screenHTML(w, "live", body);
  },

  deskStudents(w) {
    const enrolls = (typeof readList === "function" ? readList(REGS_KEY) : []).filter((e) => e.id === w.id);
    const users = typeof readList === "function" ? readList(USERS_KEY) : [];
    return enrolls.map((e) => {
      const u = users.find((x) => String(x.email || "").toLowerCase() === String(e.email || "").toLowerCase());
      return { ...e, name: e.name || u?.name || e.email, user: u };
    }).sort((a, b) => String(b.at || "").localeCompare(String(a.at || "")));
  },

  studentsHTML(w) {
    const rows = this.deskStudents(w);
    const stats = typeof ratingStats === "function" ? ratingStats("webinar", w.id) : { avg: "0.0", count: 0 };
    const seats = Math.max(0, Number(w.seats || (typeof webinarProfile === "function" ? webinarProfile(w).seats : 80)) - rows.length);
    const week = rows.filter((r) => r.at && (Date.now() - new Date(r.at).getTime()) < 7 * 86400000).length;
    const pick = this.studentEmail ? rows.find((r) => r.email === this.studentEmail) : null;
    const body = `<div class="cb-panel">
      <p class="cb-say">People who enrolled in this webinar. No course certificate here — this is one live session.</p>
      <div class="cb-kpis">
        <div><span>Enrolled</span><b>${rows.length}</b></div>
        <div><span>Seats left</span><b>${seats}</b></div>
        <div><span>Seat cap</span><b>${Number(w.seats || (typeof webinarProfile === "function" ? webinarProfile(w).seats : 80))}</b></div>
        <div><span>New this week</span><b>${week}</b></div>
        <div><span>Reviews</span><b>★ ${adEsc(stats.avg)}</b><small>${stats.count}</small></div>
      </div>
      ${pick ? `<article class="cb-student-detail">
        <header>
          <div>
            <strong>${adEsc(pick.name)}</strong>
            <small>${adEsc(pick.email)}</small>
          </div>
          <button type="button" class="btn btn-ghost" data-wb-student-close>Close</button>
        </header>
        <p>Joined ${pick.at ? new Date(pick.at).toLocaleString("en-IN") : "—"}</p>
      </article>` : ""}
      <div class="cb-students">
        ${rows.map((r) => `<button type="button" class="cb-student ${this.studentEmail === r.email ? "on" : ""}" data-wb-student="${adEsc(r.email)}">
          <strong>${adEsc(r.name)}</strong>
          <span>${adEsc(r.email)}</span>
        </button>`).join("") || `<div class="cb-empty-box"><p>No students yet.</p></div>`}
      </div>
      ${this.footHTML("students")}
    </div>`;
    return this.screenHTML(w, "students", body);
  },

  communityHTML(w) {
    const can = canEditWebinar(w) && AdminCore.can("live", "edit");
    const map = typeof webinarRoomsOf === "function" ? webinarRoomsOf(w.id) : {};
    const types = typeof DESK_ROOM_TYPES !== "undefined" ? DESK_ROOM_TYPES : [];
    const body = `<form class="cb-panel" id="wbRoomsForm" data-webinar="${adEsc(w.id)}">
      <p class="cb-say">Turn a room on and paste the invite link. Off rooms stay hidden on this webinar.</p>
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
    return this.screenHTML(w, "community", body);
  },

  reviewsHTML(w) {
    const list = typeof reviewsFor === "function" ? reviewsFor("webinar", w.id) : [];
    const stats = typeof ratingStats === "function" ? ratingStats("webinar", w.id) : { avg: "0.0", count: 0 };
    const can = AdminCore.can("community", "edit") || AdminCore.can("community", "delete");
    const body = `<div class="cb-panel">
      <p class="cb-say">${stats.count ? `★ ${adEsc(stats.avg)} from ${stats.count} review${stats.count === 1 ? "" : "s"}.` : "No reviews on this webinar yet. Students review after it ends."}</p>
      <div class="cb-reviews">
        ${list.map((r) => `<article class="cb-review">
          <header><strong>${adEsc(r.name)}</strong><span>★ ${adEsc(r.stars)}</span><small>${adEsc(r.city || "")}</small></header>
          <p>${adEsc(r.text)}</p>
          ${can && r.source === "learner" ? `<button type="button" class="btn btn-ghost" data-del-review="${adEsc(r.id)}">Remove</button>` : ""}
        </article>`).join("") || `<div class="cb-empty-box"><p>Reviews show at the bottom of the webinar page after the session ends.</p></div>`}
      </div>
      ${this.footHTML("reviews")}
    </div>`;
    return this.screenHTML(w, "reviews", body);
  },

  nextHTML(w) {
    const can = canEditWebinar(w) && AdminCore.can("live", "edit");
    const map = typeof nextPathMap === "function" ? nextPathMap() : {};
    const cur = map["webinar:" + w.id] || {};
    const val = cur.id ? `${cur.kind || "course"}:${cur.id}` : "";
    const courses = typeof allCourses === "function" ? allCourses() : [];
    const webs = this.catalog().filter((x) => x.id !== w.id);
    const mentors = typeof mentorCatalogAll === "function" ? mentorCatalogAll() : (typeof allMentorPrograms === "function" ? allMentorPrograms() : []);
    const opt = (kind, id, title) => `<option value="${adEsc(kind)}:${adEsc(id)}" ${val === `${kind}:${id}` ? "selected" : ""}>${adEsc(title)}</option>`;
    const body = `<form class="cb-panel" id="wbNextForm" data-webinar="${adEsc(w.id)}">
      <p class="cb-say">When this webinar ends, show this next. Leave blank to use the automatic pick.</p>
      <label>Show this next
        <select name="next" ${can ? "" : "disabled"}>
          <option value="">Automatic</option>
          <optgroup label="Courses">${courses.map((x) => opt("course", x.id, x.title)).join("")}</optgroup>
          <optgroup label="Webinars">${webs.map((x) => opt("webinar", x.id, x.title)).join("")}</optgroup>
          <optgroup label="Mentorships">${mentors.map((x) => opt("mentor", x.id, x.title)).join("")}</optgroup>
        </select>
      </label>
      ${can ? `<button class="btn btn-primary" type="submit">Save next</button>` : ""}
      ${this.footHTML("next")}
    </form>`;
    return this.screenHTML(w, "next", body);
  },

  viewHTML(w, tab) {
    const t = tab || this.firstTab(w);
    if (t === "setup") return this.setupHTML(w);
    if (t === "session") return this.sessionHTML(w);
    if (t === "live") return this.liveHTML(w);
    if (t === "students") return this.studentsHTML(w);
    if (t === "community") return this.communityHTML(w);
    if (t === "reviews") return this.reviewsHTML(w);
    if (t === "next") return this.nextHTML(w);
    return this.landingHTML(w);
  },

  openBuilder(id, tab) {
    const w = this.byId(id);
    go("webinarBuilder", { webinarId: id, tab: tab || (w ? this.firstTab(w) : "setup") });
  },

  setVisibility(w, unlisted) {
    if (typeof updateLive === "function") updateLive(w.id, { unpublished: unlisted });
  },

  saveSetup(form) {
    const id = form.dataset.webinar;
    const w = this.byId(id);
    if (!w || !canEditWebinar(w)) return;
    const at = form.at.value ? new Date(form.at.value).toISOString() : w.at;
    const mins = Number(form.mins.value || 60);
    const s = AdminCore.session();
    const host = typeof deskHostOf === "function"
      ? deskHostOf(form.hostEmail?.value || w.hostEmail || s?.email, form.by?.value || w.by)
      : { name: form.by?.value || w.by, email: w.hostEmail || s?.email };
    updateLive(id, {
      title: form.title.value.trim(),
      by: host.name,
      hostEmail: host.email || w.hostEmail || s?.email || "",
      ownerEmail: host.email || w.ownerEmail || s?.email || "",
      hostPhoto: host.photo || w.hostPhoto || "",
      tag: form.tag.value.trim(),
      at,
      when: typeof formatLiveWhen === "function" ? formatLiveWhen(at) : w.when,
      duration: mins + " min",
      durationMinutes: mins,
      seats: Number(form.seats.value || w.seats || 80),
      lang: form.lang.value.trim()
    });
    AdminCore.audit("webinar_edit", id, w.title, form.title.value.trim());
    toast("Details saved");
    this.openBuilder(id, "page");
  },

  async saveLanding(form) {
    const id = form.dataset.webinar;
    const w = this.byId(id);
    if (!w || !canEditWebinar(w)) return;
    const btn = form.querySelector("[type=submit]");
    if (btn) { btn.disabled = true; btn.textContent = "Saving…"; }
    try {
      const banner = await resolveCourseBanner(form, w.banner || "");
      const learn = [...form.querySelectorAll("[name=learn]")].map((el) => el.value.trim()).filter(Boolean);
      if (learn.length < 4) { toast("Add at least 4 What You Will Learn points"); return; }
      if (!String(form.about.value || "").trim()) { toast("Write the short story"); return; }
      const free = form.free?.checked === true;
      const price = free ? 0 : Number(form.price.value || 0);
      const whoTitles = [...form.querySelectorAll("[name=whoTitle]")];
      const whoNotes = [...form.querySelectorAll("[name=whoNote]")];
      const audience = whoTitles.map((el, i) => ({ t: el.value.trim(), d: (whoNotes[i]?.value || "").trim() })).filter((x) => x.t);
      updateLive(id, {
        banner,
        tint: form.tint.value || w.tint || "#4F46E5",
        free,
        price,
        listPrice: Number(form.listPrice.value || 1999),
        about: form.about.value.trim(),
        blurb: form.about.value.trim(),
        aboutMore: form.aboutMore.value.trim(),
        bio: form.bio.value.trim() || (typeof deskHostOf === "function" ? deskHostOf(w.hostEmail, w.by).bio : "") || w.bio || "",
        learn,
        audience
      });
      AdminCore.audit("webinar_edit", id, w.title, "page");
      toast("Page saved");
      this.openBuilder(id, "session");
    } catch (err) {
      toast(err.message || "Could not save page");
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = "Save & continue →"; }
    }
  },

  async saveSession(form) {
    const id = form.dataset.webinar;
    const w = this.byId(id);
    if (!w || !canEditWebinar(w)) return;
    let pdf = w.pdf || "";
    let pdfName = w.pdfName || "";
    const pdfFile = form.pdfFile?.files?.[0];
    if (pdfFile) {
      pdf = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result || ""));
        r.onerror = () => reject(new Error("Could not read that PDF"));
        r.readAsDataURL(pdfFile);
      });
      pdfName = pdfFile.name;
    } else if (form.pdf.value.trim()) {
      pdf = form.pdf.value.trim();
    }
    const notes = form.notes.value.trim();
    const introUrl = form.introUrl.value.trim();
    if (!notes && !introUrl && !pdf) {
      toast("Add notes, an intro video, or a PDF");
      return;
    }
    updateLive(id, {
      notes,
      introUrl,
      pdf,
      pdfName,
      chat: form.chat.value === "1",
      record: form.record.value === "1",
      recordUrl: form.recordUrl.value.trim(),
      status: form.status.value === "live" || form.status.value === "ended" ? form.status.value : "scheduled"
    });
    AdminCore.audit("webinar_session", id, "", "updated");
    toast("Session saved");
    this.openBuilder(id, "live");
  },

  saveRooms(form) {
    const id = form.dataset.webinar;
    const w = this.byId(id);
    if (!w || !canEditWebinar(w)) return;
    const next = {};
    (typeof DESK_ROOM_TYPES !== "undefined" ? DESK_ROOM_TYPES : []).forEach((t) => {
      next[t.id] = {
        live: form[t.id + "_live"]?.checked === true,
        url: form[t.id + "_url"]?.value || ""
      };
    });
    if (typeof setWebinarRooms === "function") setWebinarRooms(id, next);
    AdminCore.audit("webinar_community", id, "", "updated");
    toast("Community saved for this webinar");
    paint();
  },

  saveNext(form) {
    const id = form.dataset.webinar;
    const w = this.byId(id);
    if (!w || !canEditWebinar(w)) return;
    const map = typeof nextPathMap === "function" ? nextPathMap() : {};
    const raw = form.next.value || "";
    const cut = raw.indexOf(":");
    if (cut < 1) delete map["webinar:" + id];
    else map["webinar:" + id] = { kind: raw.slice(0, cut), id: raw.slice(cut + 1) };
    if (typeof setNextPathMap === "function") setNextPathMap(map);
    AdminCore.audit("next_path", id, "", raw || "auto");
    toast("Next path saved");
    paint();
  },

  startRoom(id) {
    const w = this.byId(id);
    if (!w || !canEditWebinar(w)) {
      toast("You cannot host this webinar");
      return;
    }
    const s = AdminCore.session();
    updateLive(id, { status: "live", hostEmail: w.hostEmail || s?.email || "" });
    AdminCore.audit("webinar_start", id, w.status || "scheduled", "live");
    toast("Webinar is live · opening the room as host");
    location.href = this.hostRoomHref(id);
  },

  async endRoom(id) {
    const w = this.byId(id);
    if (!w || !canEditWebinar(w)) return;
    if (typeof endWebinarAsHost === "function") {
      await endWebinarAsHost(id);
    } else {
      updateLive(id, { status: "ended" });
    }
    AdminCore.audit("webinar_end", id, "live", "ended");
    paint();
  },

  createDesk(form) {
    AdminCore.assert("live", "create");
    const s = AdminCore.session();
    const id = "lv-" + Date.now();
    const title = form.title.value.trim();
    const at = new Date(Date.now() + 3 * 86400000).toISOString();
    const list = allWebinars();
    list.push({
      id,
      title,
      by: s.name,
      hostEmail: s.email,
      ownerEmail: s.email,
      at,
      when: typeof formatLiveWhen === "function" ? formatLiveWhen(at) : at,
      duration: "60 min",
      durationMinutes: 60,
      kind: "webinar",
      joinUrl: "",
      notes: "",
      pdf: "",
      chat: true,
      record: true,
      recordUrl: "",
      introUrl: "",
      status: "scheduled",
      unpublished: true,
      hostPhoto: (typeof deskHostOf === "function" ? deskHostOf(s.email, s.name).photo : "") || "",
      bio: (typeof deskHostOf === "function" ? deskHostOf(s.email, s.name).bio : "") || "",
      free: true,
      price: 0,
      listPrice: 1999,
      seats: 80,
      lang: "Hindi, English",
      tag: "Live webinar",
      about: "",
      blurb: "",
      banner: "",
      tint: "#4F46E5",
      createdAt: new Date().toISOString()
    });
    saveWebinars(list);
    AdminCore.audit("webinar_create", id, "", title);
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
      if (e.target.id !== "wbSearch") return;
      this.titleQ = e.target.value;
      const pos = e.target.selectionStart;
      paint();
      const inp = document.getElementById("wbSearch");
      if (inp) { inp.focus(); inp.setSelectionRange(pos, pos); }
    });

    view.addEventListener("submit", (e) => {
      if (e.target.id === "wbCreateForm") { e.preventDefault(); this.createDesk(e.target); }
      if (e.target.id === "wbSetupForm") { e.preventDefault(); this.saveSetup(e.target); }
      if (e.target.id === "wbLandingForm") { e.preventDefault(); this.saveLanding(e.target).catch((err) => toast(err.message || "Could not save page")); }
      if (e.target.id === "wbSessionForm") { e.preventDefault(); this.saveSession(e.target).catch((err) => toast(err.message || "Could not save session")); }
      if (e.target.id === "wbRoomsForm") { e.preventDefault(); this.saveRooms(e.target); }
      if (e.target.id === "wbNextForm") { e.preventDefault(); this.saveNext(e.target); }
    });

    view.addEventListener("click", (e) => {
      const start = e.target.closest("[data-wb-start]");
      if (start) {
        e.preventDefault();
        e.stopPropagation();
        this.startRoom(start.dataset.wbStart);
        return;
      }
      const endBtn = e.target.closest("[data-wb-end]");
      if (endBtn) {
        e.preventDefault();
        e.stopPropagation();
        this.endRoom(endBtn.dataset.wbEnd);
        return;
      }
      if (e.target.closest("[data-wb-create]")) {
        document.getElementById("wbCreateModal")?.classList.remove("hidden");
        document.querySelector("#wbCreateForm [name=title]")?.focus();
        return;
      }
      if (e.target.closest("[data-wb-create-close]") || e.target.id === "wbCreateModal") {
        if (e.target.id === "wbCreateModal" || e.target.closest("[data-wb-create-close]")) {
          document.getElementById("wbCreateModal")?.classList.add("hidden");
        }
        return;
      }
      const open = e.target.closest("[data-wb-open]");
      if (open) { this.openBuilder(open.dataset.wbOpen); return; }
      const tab = e.target.closest("[data-wb-tab]");
      if (tab && Ad.webinarId) { this.openBuilder(Ad.webinarId, tab.dataset.wbTab); return; }
      if (e.target.closest("[data-wb-back]")) { go("webinars"); return; }
      const addLine = e.target.closest("[data-wb-add-line]");
      if (addLine) {
        const box = document.getElementById("wbLearnList");
        if (!box) return;
        const values = [...box.querySelectorAll("[name=learn]")].map((el) => el.value);
        values.push("");
        box.innerHTML = values.map((v, i) => this.lineRow("learn", v, i, true, 4, "")).join("");
        box.querySelector(".cb-line:last-child input")?.focus();
        return;
      }
      const delLine = e.target.closest("[data-wb-del-line]");
      if (delLine) {
        delLine.closest(".cb-line")?.remove();
        return;
      }
      const addPair = e.target.closest("[data-wb-add-pair]");
      if (addPair) {
        const box = document.getElementById("wbWhoList");
        if (!box) return;
        const rows = [...box.querySelectorAll("[data-wb-pair]")].map((row) => ({
          t: row.querySelector("[name=whoTitle]")?.value || "",
          d: row.querySelector("[name=whoNote]")?.value || ""
        }));
        rows.push({ t: "", d: "" });
        box.innerHTML = rows.map((row, i) => this.pairRow("who", row, i, true)).join("");
        return;
      }
      const delPair = e.target.closest("[data-wb-del-pair]");
      if (delPair) {
        delPair.closest("[data-wb-pair]")?.remove();
        return;
      }
      const student = e.target.closest("[data-wb-student]");
      if (student) { this.studentEmail = student.dataset.wbStudent; paint(); return; }
      if (e.target.closest("[data-wb-student-close]")) { this.studentEmail = ""; paint(); return; }
      const goLive = e.target.closest("[data-wb-golive]");
      if (goLive) {
        const w = this.byId(goLive.dataset.wbGolive);
        if (!w || !this.progress(w).setup || !this.progress(w).page || !this.progress(w).session) {
          toast("Finish the list first");
          return;
        }
        this.setVisibility(w, false);
        AdminCore.audit("webinar_publish", w.id, "draft", "live");
        toast("Webinar is live");
        paint();
        return;
      }
      const draft = e.target.closest("[data-wb-draft]");
      if (draft) {
        const w = this.byId(draft.dataset.wbDraft);
        if (!w) return;
        this.setVisibility(w, true);
        AdminCore.audit("webinar_unpublish", w.id, "live", "draft");
        toast("Back to draft. Students cannot enroll.");
        paint();
        return;
      }
    });

    view.addEventListener("change", (e) => {
      if (e.target.name === "bannerFile" && e.target.closest("#wbLandingForm")) {
        const file = e.target.files?.[0];
        const prev = document.getElementById("wbBannerPrev");
        if (file && prev) { prev.src = URL.createObjectURL(file); prev.hidden = false; }
      }
      if (e.target.closest("#wbRoomsForm") && e.target.type === "checkbox" && e.target.name.endsWith("_live")) {
        const lab = e.target.closest(".cb-switch")?.querySelector("span");
        if (lab) lab.textContent = e.target.checked ? "On" : "Off";
      }
    });

    if (side) {
      side.addEventListener("click", (e) => {
        if (e.target.closest("[data-wb-back]")) { go("webinars"); return; }
        const tab = e.target.closest("[data-wb-tab]");
        if (tab && Ad.webinarId) this.openBuilder(Ad.webinarId, tab.dataset.wbTab);
      });
    }
  }
};
