const CourseAdmin = {
  titleQ: "",
  studentEmail: "",
  STEPS: [
    { id: "setup", n: "1", label: "Details", hint: "Name & type" },
    { id: "page", n: "2", label: "Page", hint: "What students see" },
    { id: "lessons", n: "3", label: "Lessons", hint: "Videos & files" },
    { id: "live", n: "4", label: "Go live", hint: "Show on the site" }
  ],
  MORE: [
    { id: "students", label: "Students", hint: "Who bought it" },
    { id: "community", label: "Community", hint: "Links on / off" },
    { id: "reviews", label: "Reviews", hint: "Ratings" },
    { id: "next", label: "Next", hint: "What they buy next" }
  ],

  catalog() {
    const hidden = hiddenCourseIds();
    const edits = courseEdits();
    const list = COURSES.map((c) => ({
      ...c,
      ...(edits[c.id] || {}),
      unpublished: hidden.includes(c.id)
    })).concat(extraCourses().map((c) => ({
      ...c,
      unpublished: Boolean(c.unpublished || c.status === "unlisted")
    })));
    return AdminCore.isOwner()
      ? list
      : list.filter((c) => ownerEmailOf(c) === AdminCore.session().email || c.instructor === AdminCore.session().name);
  },

  byId(id) {
    return this.catalog().find((c) => c.id === id) || allCourses().find((c) => c.id === id) || COURSES.find((c) => c.id === id) || null;
  },

  formatLabel(c) {
    return c.format === "cohort" ? "Live batch" : "Recorded";
  },

  statusLabel(c) {
    return c.unpublished ? "Draft" : "Live";
  },

  thumb(c) {
    if (typeof courseThumbHTML === "function") {
      return `<span class="cb-thumb cb-thumb-real">${courseThumbHTML(c)}</span>`;
    }
    const banner = typeof courseBannerOf === "function" ? courseBannerOf(c) : (c.banner || "");
    if (banner) return `<img class="cb-thumb" src="${adEsc(banner)}" alt="">`;
    return `<span class="cb-thumb cb-thumb-gen">${adEsc((c.title || "C").slice(0, 1))}</span>`;
  },

  lessonCount(c) {
    try { return lessonsAll(c.id).length; } catch { return Number(c.lessons || 0); }
  },

  readyLessonCount(c) {
    try { return lessonsAll(c.id).filter((l) => l.published !== false).length; } catch { return 0; }
  },

  progress(c) {
    const titleOk = Boolean(String(c.title || "").trim()) && !/^untitled/i.test(c.title);
    const isSeed = typeof COURSES !== "undefined" && COURSES.some((x) => x.id === c.id);
    const pic = typeof courseBannerOf === "function" ? courseBannerOf(c) : (c.banner || "");
    const story = String(c.description || "").trim();
    const learnN = (Array.isArray(c.learn) ? c.learn : (typeof learnPoints === "function" ? learnPoints(c) : [])).filter((p) => String(p || "").trim()).length;
    const pageOk = isSeed
      ? Number(c.price) > 0 && Boolean(pic || c.cover)
      : Number(c.price) > 0 && Boolean(pic) && Boolean(story) && learnN >= 5;
    const lessonsOk = this.readyLessonCount(c) > 0;
    return { setup: titleOk, page: pageOk, lessons: lessonsOk, live: !c.unpublished };
  },

  firstTab(c) {
    const p = this.progress(c);
    if (!p.setup) return "setup";
    if (!p.page) return "page";
    if (!p.lessons) return "lessons";
    if (!p.live) return "live";
    return "lessons";
  },

  nextHint(c) {
    const p = this.progress(c);
    if (!p.setup) return "Next: add the course name";
    if (!p.page) {
      if (!(Number(c.price) > 0)) return "Next: add a price";
      if (!(typeof courseBannerOf === "function" ? courseBannerOf(c) : c.banner)) return "Next: add the course picture";
      if (!String(c.description || "").trim()) return "Next: write the short story";
      return "Next: add 5 What You Will Learn points";
    }
    if (!p.lessons) return "Next: add the first lesson";
    if (!p.live) return "Ready to go live";
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

  stepperHTML(c, tab) {
    const p = this.progress(c);
    return `<ol class="cb-stepper" aria-label="Course steps">
      ${this.STEPS.map((s, i) => {
        const done = p[s.id];
        const on = s.id === tab;
        return `<li>
          <button type="button" data-cb-tab="${s.id}" class="${on ? "on" : ""} ${done ? "is-done" : ""}">
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

  seeHTML(c) {
    const base = `/course?id=${encodeURIComponent(c.id)}&preview=1`;
    return `<div class="cb-see">
      <span>See as a student</span>
      <a href="${base}&view=buy" target="_blank" rel="noopener">Before buy</a>
      <a href="${base}&view=owned" target="_blank" rel="noopener">After buy</a>
    </div>`;
  },

  footHTML(tab, extra) {
    const back = this.prevTab(tab);
    const next = this.nextTab(tab);
    const last = tab === "live";
    const extraTab = this.isMore(tab);
    const saveNext = tab === "setup" || tab === "page";
    return `<div class="cb-foot">
      ${tab === "setup" || extraTab ? `<button type="button" class="btn btn-ghost" data-cb-back>← All courses</button>`
        : `<button type="button" class="btn btn-ghost" data-cb-tab="${back}">← Back</button>`}
      <div class="cb-foot-main">
        ${extra || ""}
        ${last || extraTab ? "" : saveNext
          ? `<button class="btn btn-primary" type="submit">Save & continue →</button>`
          : `<button type="button" class="btn btn-primary" data-cb-tab="${next}">Continue →</button>`}
      </div>
    </div>`;
  },

  screenHTML(c, tab, body) {
    return `<section class="cb-desk">
      <div class="cb-desk-top">
        <div>
          <span class="cb-pill ${c.unpublished ? "is-draft" : "is-live"}">${adEsc(this.statusLabel(c))}</span>
          <h2>${adEsc(c.title)}</h2>
        </div>
        ${this.seeHTML(c)}
      </div>
      ${this.stepperHTML(c, tab)}
      ${body}
    </section>`;
  },

  filtered() {
    const q = String(this.titleQ || "").trim().toLowerCase();
    return this.catalog().filter((c) => {
      if (!q) return true;
      return [c.title, c.instructor, this.formatLabel(c), this.statusLabel(c), this.nextHint(c)]
        .join(" ").toLowerCase().includes(q);
    });
  },

  catalogHTML() {
    const rows = this.filtered();
    const canCreate = AdminCore.can("courses", "create");
    const drafts = this.catalog().filter((c) => c.unpublished).length;
    return `<section class="cb-home desk-home">
      <div class="cb-home-bar desk-toolbar">
        <input id="cbSearch" type="search" value="${adEsc(this.titleQ)}" placeholder="Find a course…">
        ${canCreate ? `<button type="button" class="btn btn-primary" data-cb-create>+ New course</button>` : ""}
      </div>
      <p class="cb-home-note">${this.catalog().length} courses${drafts ? ` · ${drafts} still draft` : ""}. Open a row to edit the page, lessons, and go live.</p>
      <div class="cb-cards desk-cards">
        ${rows.map((c, i) => {
          const host = typeof deskHostOf === "function" ? deskHostOf(c.ownerEmail, c.instructor) : { name: c.instructor, photo: "" };
          const price = Number(c.price || 0);
          return `<button type="button" class="desk-row" style="--i:${i}" data-cb-open="${adEsc(c.id)}">
            ${this.thumb(c)}
            <div class="desk-copy">
              <strong>${adEsc(c.title)}</strong>
              ${typeof deskMetaHTML === "function" ? deskMetaHTML([
                this.formatLabel(c),
                this.lessonCount(c) + " lessons",
                c.hours ? adEsc(c.hours) + " hrs" : "",
                price ? "₹" + price.toLocaleString("en-IN") : "Free"
              ]) : ""}
              <div class="desk-hostline">${typeof deskFaceHTML === "function" ? deskFaceHTML(host.name, host.photo) : ""}<span>${adEsc(host.name || c.instructor || "Instructor")}</span></div>
              <em>${adEsc(this.nextHint(c))}</em>
            </div>
            <span class="cb-pill ${c.unpublished ? "is-draft" : "is-live"}">${adEsc(this.statusLabel(c))}</span>
          </button>`;
        }).join("") || `<div class="cb-empty-box"><p>No course matches that search.</p></div>`}
      </div>
      <div class="cb-modal hidden" id="cbCreateModal">
        <form class="cb-modal-card" id="cbCreateForm">
          <h3>New course</h3>
          <p>Just the name. You can change everything after this.</p>
          <label>What should students call this?
            <input name="title" required autofocus placeholder="e.g. Intraday Journal Desk">
          </label>
          <div class="cb-modal-actions">
            <button class="btn btn-ghost" type="button" data-cb-create-close>Cancel</button>
            <button class="btn btn-primary" type="submit">Start</button>
          </div>
        </form>
      </div>
    </section>`;
  },

  sideHTML(c) {
    const tab = Ad.courseTab || this.firstTab(c);
    const p = this.progress(c);
    const s = AdminCore.session();
    return `
      <a class="ad-brand" href="/">${typeof brandLogoHTML === "function" ? brandLogoHTML("ad") : "Bizgarh"}</a>
      <button type="button" class="cb-back" data-cb-back>← All courses</button>
      <div class="cb-side-course">
        ${this.thumb(c)}
        <div>
          <strong>${adEsc(c.title)}</strong>
          <small>${adEsc(this.statusLabel(c))} · ${adEsc(this.formatLabel(c))}</small>
        </div>
      </div>
      <nav class="ad-nav cb-side-nav">
        ${this.STEPS.map((st) => `<button type="button" data-cb-tab="${st.id}" class="${tab === st.id ? "on" : ""}">
          <span>${p[st.id] ? "✓" : st.n}</span> ${adEsc(st.label)}
        </button>`).join("")}
        <span class="ad-nav-label">Also</span>
        ${this.MORE.map((st) => `<button type="button" data-cb-tab="${st.id}" class="${tab === st.id ? "on" : ""}">
          ${adEsc(st.label)}
        </button>`).join("")}
      </nav>
      <div class="ad-side-foot">
        <div class="ad-who">${adEsc(s.name)}<br>${AdminCore.isSuperAdmin() ? "Super Admin" : (AdminCore.isOwner() ? "Owner" : "Admin")}</div>
        <button type="button" id="staffLogout">Logout</button>
        <a href="/">← Public site</a>
      </div>`;
  },

  setupHTML(c) {
    const can = canEditCourse(c) && AdminCore.can("courses", "edit");
    const body = `<form class="cb-panel" id="cbSetupForm" data-course="${adEsc(c.id)}">
      <p class="cb-say">First, name the course and pick how it runs.</p>
      <label class="cb-big">Course name
        <input name="title" required value="${adEsc(c.title)}" ${can ? "" : "readonly"} placeholder="Students see this name">
      </label>
      <p class="cb-say">How will you teach it?</p>
      <div class="cb-choice">
        <label class="${c.format !== "cohort" ? "on" : ""}">
          <input type="radio" name="format" value="recorded" ${c.format !== "cohort" ? "checked" : ""} ${can ? "" : "disabled"}>
          <b>Recorded</b>
          <span>Videos they watch anytime.</span>
        </label>
        <label class="${c.format === "cohort" ? "on" : ""}">
          <input type="radio" name="format" value="cohort" ${c.format === "cohort" ? "checked" : ""} ${can ? "" : "disabled"}>
          <b>Live batch</b>
          <span>A group that starts together.</span>
        </label>
      </div>
      ${typeof deskHostLockHTML === "function"
        ? deskHostLockHTML(deskHostOf(c.ownerEmail, c.instructor), { field: "instructor" })
        : `<label>Who teaches it?
        <input name="instructor" required value="${adEsc(c.instructor)}" ${can && AdminCore.isOwner() ? "" : "readonly"}>
      </label>`}
      <label>Show it under
        <select name="cat" ${can ? "" : "disabled"}>
          ${[["trending","Trending"],["beginners","For beginners"],["options","Options"],["investing","Investing"],["ta","Charts"],["hindi","Hindi"],["crypto","Crypto"],["strategy","Strategy"]].map(([v,l]) => `<option value="${v}" ${c.cat===v?"selected":""}>${l}</option>`).join("")}
        </select>
      </label>
      ${can ? this.footHTML("setup") : ""}
    </form>`;
    return this.screenHTML(c, "setup", body);
  },

  learnRowHTML(value, i, can, total) {
    return `<div class="cb-line">
      <label>Point ${i + 1}${i < 5 ? ` <em>required</em>` : ""}
        <input name="learn" ${i < 5 ? "required" : ""} value="${adEsc(value || "")}" ${can ? "" : "readonly"} placeholder="One thing they can do after this course">
      </label>
      ${can && total > 5 ? `<button type="button" class="cb-x" data-cb-del-learn title="Remove">✕</button>` : ""}
    </div>`;
  },

  bonusRowHTML(b, i, can) {
    return `<div class="cb-bonus-row">
      <label>Bonus ${i + 1}<input name="bonusTitle" value="${adEsc(b.title || "")}" ${can ? "" : "readonly"} placeholder="e.g. Practice desk access"></label>
      <label>Tag <small>(optional)</small><input name="bonusNote" value="${adEsc(b.note || "")}" ${can ? "" : "readonly"} placeholder="FREE"></label>
      ${can ? `<button type="button" class="cb-x" data-cb-del-bonus title="Remove">✕</button>` : ""}
    </div>`;
  },

  refreshLearnXs() {
    const box = document.getElementById("cbLearnList");
    if (!box) return;
    const values = [...box.querySelectorAll("[name=learn]")].map((el) => el.value);
    const can = !box.querySelector("[name=learn][readonly]");
    box.innerHTML = values.map((v, i) => this.learnRowHTML(v, i, can, values.length)).join("");
  },

  refreshBonusXs() {
    const box = document.getElementById("cbBonusList");
    if (!box) return;
    const rows = [...box.querySelectorAll(".cb-bonus-row")].map((row) => ({
      title: row.querySelector("[name=bonusTitle]")?.value || "",
      note: row.querySelector("[name=bonusNote]")?.value || ""
    }));
    const can = !box.querySelector("[name=bonusTitle][readonly]");
    box.innerHTML = rows.map((b, i) => this.bonusRowHTML(b, i, can)).join("");
  },

  landingHTML(c) {
    const can = canEditCourse(c) && AdminCore.can("courses", "edit");
    const banner = typeof courseBannerOf === "function" ? courseBannerOf(c) : "";
    const points = [...(typeof learnPoints === "function" ? learnPoints(c) : [])];
    while (points.length < 5) points.push("");
    const bonuses = Array.isArray(c.bonus) ? c.bonus.filter((b) => String(b.title || b || "").trim()) : [];
    const body = `<div class="cb-pagegrid">
      <form class="cb-panel cb-pageform" id="cbLandingForm" data-course="${adEsc(c.id)}">
        <p class="cb-say">This is the public course page. Picture, price, story, and 5 learn points are required.</p>
        <label class="cb-drop-pic">
          <span>${banner ? "Change picture" : "Add a course picture"}</span>
          <small>Width 1280 px × height 720 px (16:9). JPG, PNG or WebP.</small>
          <em>This banner shows on the homepage and the course page.</em>
          <input name="bannerFile" type="file" accept="image/jpeg,image/png,image/webp,image/*" ${can ? "" : "disabled"}>
        </label>
        <input name="banner" type="url" inputmode="url" placeholder="Or paste an image link" value="${adEsc(banner && !String(banner).startsWith("data:") ? banner : "")}" ${can ? "" : "readonly"}>
        ${banner ? `<img class="cb-banner-prev" id="cbBannerPrev" src="${adEsc(banner)}" alt="">` : `<img class="cb-banner-prev" id="cbBannerPrev" alt="" hidden>`}
        ${can && banner ? `<label class="cb-check"><input type="checkbox" name="bannerClear"> Remove picture</label>` : ""}
        <div class="cb-split">
          <label>Price students pay ₹ <em>required</em>
            <input name="price" type="number" min="1" required value="${adEsc(c.price || "")}" ${can ? "" : "readonly"}>
          </label>
          <label>Old price ₹ <small>(optional)</small>
            <input name="old" type="number" min="0" value="${adEsc(c.old || "")}" ${can ? "" : "readonly"}>
          </label>
        </div>
        <label>Short story <em>required</em>
          <textarea name="description" required ${can ? "" : "readonly"} placeholder="2–4 lines. Plain words.">${adEsc(c.description || "")}</textarea>
        </label>
        <details class="cb-more">
          <summary>More (hours)</summary>
          <label>Hours<input name="hours" value="${adEsc(c.hours || "")}" ${can ? "" : "readonly"}></label>
        </details>
        <div class="cb-block">
          <p class="cb-say">What You Will Learn <small>minimum 5, required</small></p>
          <div class="cb-stack" id="cbLearnList">
            ${points.map((p, i) => this.learnRowHTML(p, i, can, points.length)).join("")}
          </div>
          ${can ? `<button type="button" class="cb-add-chapter" data-cb-add-learn>+ Add another point</button>` : ""}
        </div>
        <div class="cb-block">
          <p class="cb-say">Bonus resources <small>optional · max 5</small></p>
          <div class="cb-stack" id="cbBonusList">
            ${bonuses.map((b, i) => this.bonusRowHTML(typeof b === "string" ? { title: b, note: "" } : b, i, can)).join("")}
          </div>
          ${can ? `<button type="button" class="cb-add-chapter" data-cb-add-bonus>+ Add a bonus</button>` : ""}
        </div>
        ${can ? this.footHTML("page") : ""}
      </form>
      <aside class="cb-preview">
        <span>Students see this</span>
        <div class="cb-preview-thumb">${typeof courseThumbHTML === "function" ? courseThumbHTML(c) : this.thumb(c)}</div>
        <strong>${adEsc(c.title)}</strong>
        <p>by ${adEsc(c.instructor)}</p>
        <b>₹${Number(c.price || 0).toLocaleString("en-IN")}</b>
      </aside>
    </div>`;
    return this.screenHTML(c, "page", body);
  },

  itemIcon(kind) {
    if (kind === "article") return `<span class="cb-ico is-article">${typeof iconSvg === "function" ? iconSvg("file") : "A"}</span>`;
    if (kind === "pdf") return `<span class="cb-ico is-pdf">${typeof iconSvg === "function" ? iconSvg("file") : "P"}</span>`;
    if (kind === "live") return `<span class="cb-ico is-live">${typeof iconSvg === "function" ? iconSvg("wifi") : "L"}</span>`;
    return `<span class="cb-ico is-video">${typeof iconSvg === "function" ? iconSvg("play") : "V"}</span>`;
  },

  kindLabel(kind) {
    if (kind === "article") return "Article";
    if (kind === "pdf") return "PDF";
    if (kind === "live") return "Live class";
    return "Video";
  },

  syllabusHTML(c) {
    if (typeof ensureCourseSyllabus === "function") ensureCourseSyllabus(c.id);
    const sy = syllabusFor(c.id);
    const lessons = lessonsAll(c.id);
    const byId = Object.fromEntries(lessons.map((l) => [l.id, l]));
    const can = canEditCourse(c) && AdminCore.can("courses", "edit");
    const count = sy.sections.reduce((n, s) => n + (s.items || []).length, 0);
    const firstSec = sy.sections[0]?.id || "";
    const empty = !count;
    const list = empty ? `<div class="cb-empty-box">
        <p>No lessons yet.</p>
        <p class="muted">Add one video. Students watch them in this order.</p>
        ${can ? `<div class="cb-empty-actions">
          <button type="button" class="btn btn-primary" data-add-kind="video" data-sec="${adEsc(firstSec)}">Add a video</button>
          <button type="button" class="btn btn-ghost" data-add-kind="article" data-sec="${adEsc(firstSec)}">Add an article</button>
          <button type="button" class="btn btn-ghost" data-add-kind="pdf" data-sec="${adEsc(firstSec)}">Add a PDF</button>
        </div>` : ""}
      </div>` : sy.sections.map((sec, si) => `
        <section class="cb-sec" data-sec="${adEsc(sec.id)}" draggable="${can ? "true" : "false"}">
          <header class="cb-sec-h">
            <span class="cb-drag" aria-hidden="true">⋮⋮</span>
            <input class="cb-sec-title" data-sec-title="${adEsc(sec.id)}" value="${adEsc(sec.title)}" ${can ? "" : "readonly"}>
            ${can ? `<button type="button" class="cb-icon-btn" data-sec-del="${adEsc(sec.id)}" title="Remove chapter">✕</button>` : ""}
          </header>
          <div class="cb-items">
            ${(sec.items || []).map((it) => {
              const l = byId[it.lessonId] || { t: "Untitled", kind: it.kind };
              const ready = it.published !== false && l.published !== false;
              const kind = it.kind || l.kind || "video";
              return `<article class="cb-item" draggable="${can ? "true" : "false"}" data-item="${adEsc(it.lessonId)}" data-sec="${adEsc(sec.id)}">
                <span class="cb-drag" aria-hidden="true">⋮⋮</span>
                ${this.itemIcon(kind)}
                <div class="cb-item-copy">
                  <b>${adEsc(l.t)}</b>
                  <small>${adEsc(this.kindLabel(kind))}${l.dur ? " · " + adEsc(l.dur) : ""}</small>
                </div>
                ${can ? `${kind === "video" ? `<button type="button" class="cb-drm ${l.drm !== false ? "on" : ""}" data-item-drm="${adEsc(it.lessonId)}" data-on="${l.drm !== false ? "0" : "1"}">${l.drm !== false ? "DRM on" : "DRM off"}</button>` : ""}
                  <button type="button" class="cb-ready ${ready ? "on" : ""}" data-item-pub="${adEsc(it.lessonId)}" data-on="${ready ? "0" : "1"}">${ready ? "Shown" : "Hidden"}</button>
                  <button type="button" class="cb-icon-btn" data-item-rename="${adEsc(it.lessonId)}" title="Rename">✎</button>
                  <button type="button" class="cb-icon-btn" data-item-del="${adEsc(it.lessonId)}" title="Remove">✕</button>` : ""}
              </article>`;
            }).join("")}
          </div>
          ${can ? `<div class="cb-add-row">
            <button type="button" data-add-kind="video" data-sec="${adEsc(sec.id)}">+ Video</button>
            <button type="button" data-add-kind="article" data-sec="${adEsc(sec.id)}">+ Article</button>
            <button type="button" data-add-kind="pdf" data-sec="${adEsc(sec.id)}">+ PDF</button>
          </div>` : ""}
        </section>`).join("");
    const body = `<div class="cb-panel">
      <p class="cb-say">${empty ? "Add lessons in the order students should watch them." : "Drag a lesson to change the order. Hidden lessons stay off the public page."}</p>
      <div class="cb-sy-list" data-course="${adEsc(c.id)}">${list}</div>
      ${can && !empty ? `<button type="button" class="cb-add-chapter" data-sec-insert="${sy.sections.length}">+ Add a chapter</button>
        <details class="cb-more"><summary>Import many lessons from a file</summary>
          <button type="button" class="btn btn-ghost" data-cb-import>Choose CSV</button>
          <input id="cbCsv" type="file" accept=".csv,text/csv" hidden>
        </details>` : ""}
      ${this.footHTML("lessons")}
      <div class="cb-modal hidden" id="cbLessonModal">
        <form class="cb-modal-card" id="cbLessonForm">
          <h3 id="cbLessonTitle">Add a video</h3>
          <input type="hidden" name="sec">
          <input type="hidden" name="kind">
          <label>Lesson name<input name="title" required placeholder="e.g. How to mark the level"></label>
          <label class="is-dur">Length<input name="dur" placeholder="e.g. 8 min"></label>
          <label class="is-video">Upload a video
            <input name="file" type="file" accept="video/mp4,video/webm,video/quicktime,video/*">
          </label>
          <label class="is-video">Or paste a video link
            <input name="src" placeholder="Video URL">
          </label>
          <label class="is-video cb-check"><input type="checkbox" name="drm" checked> Protect this video (DRM)</label>
          <label class="is-pdf">Upload a PDF
            <input name="pdfFile" type="file" accept="application/pdf">
          </label>
          <label class="is-article">What should they read?
            <textarea name="notes" placeholder="Write it here"></textarea>
          </label>
          <div class="cb-modal-actions">
            <button class="btn btn-ghost" type="button" data-cb-lesson-close>Cancel</button>
            <button class="btn btn-primary" type="submit">Add lesson</button>
          </div>
        </form>
      </div>
    </div>`;
    return this.screenHTML(c, "lessons", body);
  },

  liveHTML(c) {
    const p = this.progress(c);
    const can = canEditCourse(c) && AdminCore.can("courses", "edit");
    const checks = [
      [p.setup, "Course has a name", "setup"],
      [p.page, "Page has a price and a picture or story", "page"],
      [p.lessons, "At least one lesson is shown", "lessons"]
    ];
    const ready = p.setup && p.page && p.lessons;
    const body = `<div class="cb-panel cb-go">
      <p class="cb-say">${c.unpublished
        ? "This course is a draft. Students cannot buy it yet."
        : "This course is live on Bizgarh."}</p>
      <ul class="cb-check-list">
        ${checks.map(([ok, label, tab]) => `<li class="${ok ? "ok" : "miss"}">
          <b>${ok ? "✓" : "!"}</b>
          <span>${adEsc(label)}</span>
          ${ok ? "" : `<button type="button" data-cb-tab="${tab}">Fix this</button>`}
        </li>`).join("")}
      </ul>
      ${can ? (c.unpublished
        ? `<button type="button" class="btn btn-primary cb-go-btn" data-cb-golive="${adEsc(c.id)}" ${ready ? "" : "disabled"}>${ready ? "Make it live" : "Finish the list first"}</button>`
        : `<button type="button" class="btn btn-ghost" data-cb-draft="${adEsc(c.id)}">Take it back to draft</button>`) : ""}
      ${this.seeHTML(c)}
      ${this.footHTML("live")}
    </div>`;
    return this.screenHTML(c, "live", body);
  },

  courseStudents(c) {
    const enrolls = (typeof readList === "function" ? readList(ALL_ENROLL_KEY) : []).filter((e) => e.courseId === c.id);
    const users = typeof readList === "function" ? readList(USERS_KEY) : [];
    return enrolls.map((e) => {
      const u = users.find((x) => String(x.email || "").toLowerCase() === String(e.email || "").toLowerCase());
      const prog = typeof courseCompletion === "function" ? courseCompletion(e.email, c.id) : { pct: 0, done: 0, total: 0, cert: false };
      return { ...e, name: e.name || u?.name || e.email, user: u, prog };
    }).sort((a, b) => String(b.at || "").localeCompare(String(a.at || "")));
  },

  studentsHTML(c) {
    const rows = this.courseStudents(c);
    const stats = typeof ratingStats === "function" ? ratingStats("course", c.id) : { avg: "0.0", count: 0 };
    const avg = rows.length ? Math.round(rows.reduce((s, r) => s + Number(r.prog.pct || 0), 0) / rows.length) : 0;
    const done = rows.filter((r) => Number(r.prog.pct) >= 100).length;
    const week = rows.filter((r) => r.at && (Date.now() - new Date(r.at).getTime()) < 7 * 86400000).length;
    const pick = this.studentEmail ? rows.find((r) => r.email === this.studentEmail) : null;
    const body = `<div class="cb-panel">
      <p class="cb-say">Students who bought this course. Click a name for the full view.</p>
      <div class="cb-kpis">
        <div><span>Students</span><b>${rows.length}</b></div>
        <div><span>Avg progress</span><b>${avg}%</b></div>
        <div><span>Finished</span><b>${done}</b></div>
        <div><span>New this week</span><b>${week}</b></div>
        <div><span>Reviews</span><b>★ ${adEsc(stats.avg)}</b><small>${stats.count}</small></div>
      </div>
      ${pick ? `<article class="cb-student-detail">
        <header>
          <div>
            <strong>${adEsc(pick.name)}</strong>
            <small>${adEsc(pick.email)}</small>
          </div>
          <button type="button" class="btn btn-ghost" data-cb-student-close>Close</button>
        </header>
        <p>Joined ${pick.at ? new Date(pick.at).toLocaleString("en-IN") : "—"}</p>
        <p>Progress <b>${pick.prog.pct}%</b> · ${pick.prog.done}/${pick.prog.total} lessons${pick.prog.cert ? " · Certificate ready" : ""}</p>
        <div class="cb-bar"><i style="width:${Math.max(0, Math.min(100, pick.prog.pct))}%"></i></div>
      </article>` : ""}
      <div class="cb-students">
        ${rows.map((r) => `<button type="button" class="cb-student ${this.studentEmail === r.email ? "on" : ""}" data-cb-student="${adEsc(r.email)}">
          <strong>${adEsc(r.name)}</strong>
          <span>${adEsc(r.email)}</span>
          <em>${r.prog.pct}%</em>
        </button>`).join("") || `<div class="cb-empty-box"><p>No students yet.</p></div>`}
      </div>
      ${this.footHTML("students")}
    </div>`;
    return this.screenHTML(c, "students", body);
  },

  communityHTML(c) {
    const can = canEditCourse(c) && AdminCore.can("courses", "edit");
    const map = typeof courseRoomsOf === "function" ? courseRoomsOf(c.id) : {};
    const types = typeof DESK_ROOM_TYPES !== "undefined" ? DESK_ROOM_TYPES : [];
    const body = `<form class="cb-panel" id="cbRoomsForm" data-course="${adEsc(c.id)}">
      <p class="cb-say">Turn a room on and paste the invite link. Off rooms stay hidden on this course.</p>
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
    return this.screenHTML(c, "community", body);
  },

  reviewsHTML(c) {
    const list = typeof reviewsFor === "function" ? reviewsFor("course", c.id) : [];
    const stats = typeof ratingStats === "function" ? ratingStats("course", c.id) : { avg: "0.0", count: 0 };
    const can = AdminCore.can("community", "edit") || AdminCore.can("community", "delete");
    const body = `<div class="cb-panel">
      <p class="cb-say">${stats.count ? `★ ${adEsc(stats.avg)} from ${stats.count} review${stats.count === 1 ? "" : "s"}.` : "No reviews on this course yet."}</p>
      <div class="cb-reviews">
        ${list.map((r) => `<article class="cb-review">
          <header><strong>${adEsc(r.name)}</strong><span>★ ${adEsc(r.stars)}</span><small>${adEsc(r.city || "")}</small></header>
          <p>${adEsc(r.text)}</p>
          ${can && r.source === "learner" ? `<button type="button" class="btn btn-ghost" data-del-review="${adEsc(r.id)}">Remove</button>` : ""}
        </article>`).join("") || `<div class="cb-empty-box"><p>Students review at the bottom of the course page.</p></div>`}
      </div>
      ${this.footHTML("reviews")}
    </div>`;
    return this.screenHTML(c, "reviews", body);
  },

  nextHTML(c) {
    const can = canEditCourse(c) && AdminCore.can("courses", "edit");
    const map = typeof nextPathMap === "function" ? nextPathMap() : {};
    const cur = map["course:" + c.id] || {};
    const val = cur.id ? `${cur.kind || "course"}:${cur.id}` : "";
    const courses = typeof allCourses === "function" ? allCourses().filter((x) => x.id !== c.id) : [];
    const webs = typeof allWebinars === "function" ? allWebinars() : [];
    const mentors = typeof allMentorPrograms === "function" ? allMentorPrograms() : [];
    const opt = (kind, id, title) => `<option value="${adEsc(kind)}:${adEsc(id)}" ${val === `${kind}:${id}` ? "selected" : ""}>${adEsc(title)}</option>`;
    const body = `<form class="cb-panel" id="cbNextForm" data-course="${adEsc(c.id)}">
      <p class="cb-say">When a student finishes this course, show this next. Leave blank to use the automatic pick.</p>
      <label>Show this next
        <select name="next" ${can ? "" : "disabled"}>
          <option value="">Automatic</option>
          <optgroup label="Courses">${courses.map((x) => opt("course", x.id, x.title)).join("")}</optgroup>
          <optgroup label="Webinars">${webs.map((w) => opt("webinar", w.id, w.title)).join("")}</optgroup>
          <optgroup label="Mentorships">${mentors.map((p) => opt("mentor", p.id, p.title)).join("")}</optgroup>
        </select>
      </label>
      ${can ? `<button class="btn btn-primary" type="submit">Save next</button>` : ""}
      ${this.footHTML("next")}
    </form>`;
    return this.screenHTML(c, "next", body);
  },

  viewHTML(c, tab) {
    const t = tab || this.firstTab(c);
    if (t === "setup") return this.setupHTML(c);
    if (t === "lessons") return this.syllabusHTML(c);
    if (t === "live") return this.liveHTML(c);
    if (t === "students") return this.studentsHTML(c);
    if (t === "community") return this.communityHTML(c);
    if (t === "reviews") return this.reviewsHTML(c);
    if (t === "next") return this.nextHTML(c);
    return this.landingHTML(c);
  },

  openBuilder(id, tab) {
    if (typeof ensureCourseSyllabus === "function") ensureCourseSyllabus(id);
    const c = this.byId(id);
    go("courseBuilder", { courseId: id, tab: tab || (c ? this.firstTab(c) : "setup") });
  },

  setVisibility(c, unlisted) {
    if (extraCourses().some((x) => x.id === c.id)) {
      applyCoursePatch(c.id, { unpublished: unlisted, status: unlisted ? "unlisted" : "published" });
      return;
    }
    const ids = hiddenCourseIds();
    if (unlisted && !ids.includes(c.id)) {
      ids.push(c.id);
      writeList(HIDDEN_COURSES_KEY, ids);
    }
    if (!unlisted) writeList(HIDDEN_COURSES_KEY, ids.filter((id) => id !== c.id));
    applyCoursePatch(c.id, { unpublished: unlisted, status: unlisted ? "unlisted" : "published" });
  },

  saveSyllabus(courseId, next) {
    setCourseSyllabus(courseId, next);
  },

  mutateSyllabus(courseId, fn) {
    const sy = JSON.parse(JSON.stringify(syllabusFor(courseId)));
    fn(sy);
    this.saveSyllabus(courseId, sy);
  },

  addBlankSection(courseId, at) {
    const id = "sec-" + courseId + "-" + Date.now();
    this.mutateSyllabus(courseId, (sy) => {
      const row = { id, title: "New chapter", items: [] };
      const i = Number(at);
      if (Number.isFinite(i)) sy.sections.splice(i, 0, row);
      else sy.sections.push(row);
    });
  },

  attachLesson(courseId, secId, lesson, kind) {
    this.mutateSyllabus(courseId, (sy) => {
      let sec = sy.sections.find((s) => s.id === secId);
      if (!sec) {
        if (!sy.sections.length) {
          sy.sections.push({ id: "sec-" + courseId + "-0", title: "Lessons", items: [] });
        }
        sec = sy.sections[0];
      }
      sec.items.push({ lessonId: lesson.id, kind: kind || lesson.kind || "video", published: true });
    });
  },

  bind() {
    if (this._bound) return;
    this._bound = true;
    const view = document.getElementById("adminView");
    const side = document.getElementById("adminSide");
    if (!view) return;

    view.addEventListener("input", (e) => {
      if (e.target.id !== "cbSearch") return;
      this.titleQ = e.target.value;
      const pos = e.target.selectionStart;
      paint();
      const inp = document.getElementById("cbSearch");
      if (inp) { inp.focus(); inp.setSelectionRange(pos, pos); }
    });

    view.addEventListener("submit", (e) => {
      if (e.target.id === "cbCreateForm") { e.preventDefault(); this.createCourse(e.target); }
      if (e.target.id === "cbSetupForm") { e.preventDefault(); this.saveSetup(e.target); }
      if (e.target.id === "cbLandingForm") { e.preventDefault(); this.saveLanding(e.target); }
      if (e.target.id === "cbLessonForm") { e.preventDefault(); this.saveLesson(e.target); }
      if (e.target.id === "cbRoomsForm") { e.preventDefault(); this.saveRooms(e.target); }
      if (e.target.id === "cbNextForm") { e.preventDefault(); this.saveNext(e.target); }
    });

    view.addEventListener("click", (e) => {
      if (e.target.closest("[data-cb-create]")) {
        document.getElementById("cbCreateModal")?.classList.remove("hidden");
        document.querySelector("#cbCreateForm [name=title]")?.focus();
        return;
      }
      if (e.target.closest("[data-cb-create-close]") || e.target.id === "cbCreateModal") {
        if (e.target.id === "cbCreateModal" || e.target.closest("[data-cb-create-close]")) {
          document.getElementById("cbCreateModal")?.classList.add("hidden");
        }
        return;
      }
      const open = e.target.closest("[data-cb-open]");
      if (open) { this.openBuilder(open.dataset.cbOpen); return; }
      const tab = e.target.closest("[data-cb-tab]");
      if (tab && Ad.courseId) { this.openBuilder(Ad.courseId, tab.dataset.cbTab); return; }
      if (e.target.closest("[data-cb-back]")) { go("courses"); return; }
      if (e.target.closest("[data-cb-import]")) { document.getElementById("cbCsv")?.click(); return; }
      const addKind = e.target.closest("[data-add-kind]");
      if (addKind) { this.openLessonModal(addKind.dataset.sec, addKind.dataset.addKind); return; }
      const insert = e.target.closest("[data-sec-insert]");
      if (insert && Ad.courseId) { this.addBlankSection(Ad.courseId, insert.dataset.secInsert); paint(); return; }
      const delSec = e.target.closest("[data-sec-del]");
      if (delSec && Ad.courseId && confirm("Remove this chapter?")) {
        this.mutateSyllabus(Ad.courseId, (sy) => { sy.sections = sy.sections.filter((s) => s.id !== delSec.dataset.secDel); });
        paint();
        return;
      }
      const rename = e.target.closest("[data-item-rename]");
      if (rename && Ad.courseId) {
        const next = prompt("Lesson name");
        if (!next) return;
        setCourseLessons(Ad.courseId, lessonsAll(Ad.courseId).map((l) => l.id === rename.dataset.itemRename ? { ...l, t: next.trim() } : l), true);
        paint();
        return;
      }
      if (e.target.closest("[data-cb-add-learn]")) {
        const box = document.getElementById("cbLearnList");
        if (!box) return;
        const values = [...box.querySelectorAll("[name=learn]")].map((el) => el.value);
        values.push("");
        box.innerHTML = values.map((v, i) => this.learnRowHTML(v, i, true, values.length)).join("");
        box.querySelector(".cb-line:last-child input")?.focus();
        return;
      }
      if (e.target.closest("[data-cb-del-learn]")) {
        const box = document.getElementById("cbLearnList");
        if (!box || box.querySelectorAll("[name=learn]").length <= 5) {
          toast("Keep at least 5 points");
          return;
        }
        e.target.closest(".cb-line")?.remove();
        this.refreshLearnXs();
        return;
      }
      if (e.target.closest("[data-cb-add-bonus]")) {
        const box = document.getElementById("cbBonusList");
        if (!box || box.querySelectorAll("[name=bonusTitle]").length >= 5) {
          toast("Maximum 5 bonuses");
          return;
        }
        const rows = [...box.querySelectorAll(".cb-bonus-row")].map((row) => ({
          title: row.querySelector("[name=bonusTitle]")?.value || "",
          note: row.querySelector("[name=bonusNote]")?.value || ""
        }));
        rows.push({ title: "", note: "" });
        box.innerHTML = rows.map((b, i) => this.bonusRowHTML(b, i, true)).join("");
        box.querySelector(".cb-bonus-row:last-child input")?.focus();
        return;
      }
      if (e.target.closest("[data-cb-del-bonus]")) {
        e.target.closest(".cb-bonus-row")?.remove();
        this.refreshBonusXs();
        return;
      }
      const student = e.target.closest("[data-cb-student]");
      if (student) { this.studentEmail = student.dataset.cbStudent; paint(); return; }
      if (e.target.closest("[data-cb-student-close]")) { this.studentEmail = ""; paint(); return; }
      const drm = e.target.closest("[data-item-drm]");
      if (drm && Ad.courseId) {
        const on = drm.dataset.on === "1";
        setCourseLessons(Ad.courseId, lessonsAll(Ad.courseId).map((l) => l.id === drm.dataset.itemDrm ? { ...l, drm: on } : l), true);
        toast(on ? "DRM on for this video" : "DRM off. It plays as a normal video.");
        paint();
        return;
      }
      const pub = e.target.closest("[data-item-pub]");
      if (pub && Ad.courseId) {
        const on = pub.dataset.on === "1";
        this.mutateSyllabus(Ad.courseId, (sy) => {
          sy.sections.forEach((s) => s.items.forEach((it) => {
            if (it.lessonId === pub.dataset.itemPub) it.published = on;
          }));
        });
        setCourseLessons(Ad.courseId, lessonsAll(Ad.courseId).map((l) => l.id === pub.dataset.itemPub ? { ...l, published: on } : l), true);
        toast(on ? "Students can see this lesson" : "Lesson hidden");
        paint();
        return;
      }
      const delItem = e.target.closest("[data-item-del]");
      if (delItem && Ad.courseId && confirm("Remove this lesson?")) {
        this.mutateSyllabus(Ad.courseId, (sy) => {
          sy.sections.forEach((s) => { s.items = s.items.filter((it) => it.lessonId !== delItem.dataset.itemDel); });
        });
        paint();
        return;
      }
      const goLive = e.target.closest("[data-cb-golive]");
      if (goLive) {
        const c = this.byId(goLive.dataset.cbGolive);
        if (!c || !this.progress(c).setup || !this.progress(c).page || !this.progress(c).lessons) {
          toast("Finish the list first");
          return;
        }
        this.setVisibility(c, false);
        AdminCore.audit("course_publish", c.id, "draft", "live");
        toast("Course is live");
        paint();
        return;
      }
      const draft = e.target.closest("[data-cb-draft]");
      if (draft) {
        const c = this.byId(draft.dataset.cbDraft);
        if (!c) return;
        this.setVisibility(c, true);
        AdminCore.audit("course_unpublish", c.id, "live", "draft");
        toast("Back to draft. Students cannot buy it.");
        paint();
        return;
      }
      if (e.target.closest("[data-cb-lesson-close]") || e.target.id === "cbLessonModal") {
        if (e.target.id === "cbLessonModal" || e.target.closest("[data-cb-lesson-close]")) {
          document.getElementById("cbLessonModal")?.classList.add("hidden");
        }
      }
    });

    view.addEventListener("change", (e) => {
      if (e.target.id === "cbCsv" && e.target.files?.[0] && Ad.courseId) {
        this.importCsv(Ad.courseId, e.target.files[0]);
        e.target.value = "";
      }
      if (e.target.name === "bannerFile" && e.target.closest("#cbLandingForm")) {
        const file = e.target.files?.[0];
        const prev = document.getElementById("cbBannerPrev");
        if (file && prev) { prev.src = URL.createObjectURL(file); prev.hidden = false; }
      }
      if (e.target.name === "format" && e.target.closest("#cbSetupForm")) {
        e.target.closest(".cb-choice")?.querySelectorAll("label").forEach((el) => el.classList.toggle("on", el.contains(e.target) && e.target.checked));
      }
      if (e.target.closest("#cbRoomsForm") && e.target.type === "checkbox" && e.target.name.endsWith("_live")) {
        const lab = e.target.closest(".cb-switch")?.querySelector("span");
        if (lab) lab.textContent = e.target.checked ? "On" : "Off";
      }
    });

    view.addEventListener("blur", (e) => {
      const title = e.target.closest("[data-sec-title]");
      if (!title || !Ad.courseId) return;
      this.mutateSyllabus(Ad.courseId, (sy) => {
        const sec = sy.sections.find((s) => s.id === title.dataset.secTitle);
        if (sec) sec.title = title.value.trim() || sec.title;
      });
    }, true);

    this.bindDrag(view);
    if (side) {
      side.addEventListener("click", (e) => {
        if (e.target.closest("[data-cb-back]")) { go("courses"); return; }
        const tab = e.target.closest("[data-cb-tab]");
        if (tab && Ad.courseId) this.openBuilder(Ad.courseId, tab.dataset.cbTab);
      });
    }
  },

  bindDrag(view) {
    let drag = null;
    view.addEventListener("dragstart", (e) => {
      const item = e.target.closest(".cb-item");
      const sec = e.target.closest(".cb-sec");
      if (item) {
        drag = { type: "item", id: item.dataset.item };
        e.dataTransfer.setData("text/plain", item.dataset.item);
        return;
      }
      if (sec) {
        drag = { type: "sec", id: sec.dataset.sec };
        e.dataTransfer.setData("text/plain", sec.dataset.sec);
      }
    });
    view.addEventListener("dragover", (e) => { if (drag) e.preventDefault(); });
    view.addEventListener("drop", (e) => {
      if (!drag || !Ad.courseId) return;
      e.preventDefault();
      const overItem = e.target.closest(".cb-item");
      const overSec = e.target.closest(".cb-sec");
      if (drag.type === "item" && (overItem || overSec)) {
        const toSec = (overItem || overSec).dataset.sec;
        const before = overItem?.dataset.item;
        this.mutateSyllabus(Ad.courseId, (sy) => {
          let moving = null;
          sy.sections.forEach((s) => {
            const i = s.items.findIndex((it) => it.lessonId === drag.id);
            if (i >= 0) moving = s.items.splice(i, 1)[0];
          });
          const dest = sy.sections.find((s) => s.id === toSec);
          if (!moving || !dest) return;
          const at = before ? dest.items.findIndex((it) => it.lessonId === before) : dest.items.length;
          dest.items.splice(at < 0 ? dest.items.length : at, 0, moving);
        });
        drag = null;
        paint();
        return;
      }
      if (drag.type === "sec" && overSec && overSec.dataset.sec !== drag.id) {
        this.mutateSyllabus(Ad.courseId, (sy) => {
          const from = sy.sections.findIndex((s) => s.id === drag.id);
          const to = sy.sections.findIndex((s) => s.id === overSec.dataset.sec);
          if (from < 0 || to < 0) return;
          const [row] = sy.sections.splice(from, 1);
          sy.sections.splice(to, 0, row);
        });
        drag = null;
        paint();
      }
    });
  },

  openLessonModal(secId, kind) {
    if (typeof ensureCourseSyllabus === "function" && Ad.courseId) ensureCourseSyllabus(Ad.courseId);
    const modal = document.getElementById("cbLessonModal");
    const form = document.getElementById("cbLessonForm");
    if (!modal || !form) return;
    form.reset();
    form.sec.value = secId || "";
    form.kind.value = kind;
    if (kind === "live") { toast("Live class is not used on courses"); return; }
    document.getElementById("cbLessonTitle").textContent =
      kind === "article" ? "Add an article" : kind === "pdf" ? "Add a PDF" : "Add a video";
    form.classList.toggle("is-article", kind === "article");
    form.classList.toggle("is-pdf", kind === "pdf");
    form.classList.toggle("is-video", kind === "video");
    modal.classList.remove("hidden");
    form.title.focus();
  },

  async saveLesson(form) {
    const courseId = Ad.courseId;
    const c = this.byId(courseId);
    if (!c || !canEditCourse(c)) return;
    const kind = form.kind.value;
    const sec = form.sec.value;
    const title = form.title.value.trim();
    const dur = form.dur.value.trim();
    const btn = form.querySelector("[type=submit]");
    if (btn) { btn.disabled = true; btn.textContent = "Adding…"; }
    try {
      if (kind === "video") {
        const file = form.file.files[0];
        const src = form.src.value.trim();
        if (!file && !src) { toast("Pick a video or paste a link"); return; }
        const lesson = await addClassroomLesson(courseId, { title, dur, src, file, kind: "video", published: true, drm: form.drm?.checked !== false });
        this.attachLesson(courseId, sec, lesson, "video");
      } else if (kind === "pdf") {
        const file = form.pdfFile?.files?.[0];
        if (!file) { toast("Pick a PDF from this computer"); return; }
        let pdfName = file.name;
        const pdf = await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.onerror = () => reject(new Error("Could not read that PDF"));
          r.readAsDataURL(file);
        });
        const lesson = {
          id: "v-" + Date.now(),
          t: title,
          dur: dur || "PDF",
          kind: "pdf",
          published: true,
          drm: false,
          pdf,
          pdfName,
          src: ""
        };
        setCourseLessons(courseId, lessonsAll(courseId).concat(lesson), true);
        this.attachLesson(courseId, sec, lesson, "pdf");
      } else {
        const lesson = {
          id: "v-" + Date.now(),
          t: title,
          dur: dur || (kind === "live" ? "60 min" : "3 min"),
          kind,
          published: true,
          notes: form.notes.value.trim(),
          src: ""
        };
        setCourseLessons(courseId, lessonsAll(courseId).concat(lesson), true);
        this.attachLesson(courseId, sec, lesson, kind);
      }
      document.getElementById("cbLessonModal")?.classList.add("hidden");
      toast("Lesson added");
      paint();
    } catch (err) {
      toast(err.message || "Could not add lesson");
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = "Add lesson"; }
    }
  },

  saveSetup(form) {
    const id = form.dataset.course;
    const c = this.byId(id);
    if (!c || !canEditCourse(c)) return;
    const host = typeof deskHostOf === "function"
      ? deskHostOf(form.hostEmail?.value || c.ownerEmail, form.instructor?.value || c.instructor)
      : { name: form.instructor?.value || c.instructor, email: c.ownerEmail };
    applyCoursePatch(id, {
      title: form.title.value.trim(),
      instructor: host.name,
      ownerEmail: host.email || c.ownerEmail,
      format: form.format.value,
      cat: form.cat.value
    });
    AdminCore.audit("course_edit", id, c.title, form.title.value.trim());
    toast("Details saved");
    this.openBuilder(id, "page");
  },

  async saveLanding(form) {
    const id = form.dataset.course;
    const c = this.byId(id);
    if (!c || !canEditCourse(c)) return;
    const btn = form.querySelector("[type=submit]");
    if (btn) { btn.disabled = true; btn.textContent = "Saving…"; }
    try {
      const banner = await resolveCourseBanner(form, c.banner || "");
      const learn = [...form.querySelectorAll("[name=learn]")].map((el) => el.value.trim()).filter(Boolean);
      if (learn.length < 5) { toast("Add at least 5 What You Will Learn points"); return; }
      if (!String(form.description.value || "").trim()) { toast("Write the short story"); return; }
      if (!(Number(form.price.value) > 0)) { toast("Add a price"); return; }
      const isSeed = typeof COURSES !== "undefined" && COURSES.some((x) => x.id === id);
      if (!banner && !isSeed) { toast("Add a course picture (1280 × 720 px)"); return; }
      const titles = [...form.querySelectorAll("[name=bonusTitle]")];
      const notes = [...form.querySelectorAll("[name=bonusNote]")];
      const bonus = titles.map((el, i) => ({ title: el.value.trim(), note: (notes[i]?.value || "").trim() })).filter((b) => b.title).slice(0, 5);
      applyCoursePatch(id, {
        price: Number(form.price.value),
        old: Number(form.old.value || form.price.value),
        hours: form.hours?.value || c.hours,
        description: form.description.value.trim(),
        banner,
        learn,
        bonus
      });
      AdminCore.audit("course_edit", id, c.title, "page");
      toast("Page saved");
      this.openBuilder(id, "lessons");
    } catch (err) {
      toast(err.message || "Could not save page");
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = "Save & continue →"; }
    }
  },

  saveRooms(form) {
    const id = form.dataset.course;
    const c = this.byId(id);
    if (!c || !canEditCourse(c)) return;
    const next = {};
    (typeof DESK_ROOM_TYPES !== "undefined" ? DESK_ROOM_TYPES : []).forEach((t) => {
      next[t.id] = {
        live: form[t.id + "_live"]?.checked === true,
        url: form[t.id + "_url"]?.value || ""
      };
    });
    if (typeof setCourseRooms === "function") setCourseRooms(id, next);
    AdminCore.audit("course_community", id, "", "updated");
    toast("Community saved for this course");
    paint();
  },

  saveNext(form) {
    const id = form.dataset.course;
    const c = this.byId(id);
    if (!c || !canEditCourse(c)) return;
    const map = typeof nextPathMap === "function" ? nextPathMap() : {};
    const raw = form.next.value || "";
    const cut = raw.indexOf(":");
    if (cut < 1) delete map["course:" + id];
    else map["course:" + id] = { kind: raw.slice(0, cut), id: raw.slice(cut + 1) };
    if (typeof setNextPathMap === "function") setNextPathMap(map);
    AdminCore.audit("next_path", id, "", raw || "auto");
    toast("Next path saved");
    paint();
  },

  createCourse(form) {
    AdminCore.assert("courses", "create");
    const s = AdminCore.session();
    const id = "c-" + Date.now();
    const title = form.title.value.trim();
    const extra = extraCourses();
    extra.push({
      id,
      title,
      instructor: s.name,
      learners: "0",
      rating: "4.8",
      price: 0,
      old: 0,
      cat: "trending",
      cover: id,
      hours: "4.0",
      lessons: 0,
      description: "",
      ownerEmail: s.email,
      banner: "",
      format: "recorded",
      unpublished: true,
      status: "unlisted",
      tags: [],
      createdAt: new Date().toISOString()
    });
    writeList(EXTRA_COURSES_KEY, extra);
    if (typeof setCourseLessons === "function") setCourseLessons(id, [], true);
    const map = courseOwners();
    map[id] = s.email;
    setCourseOwners(map);
    if (typeof ensureCourseSyllabus === "function") ensureCourseSyllabus(id);
    AdminCore.audit("course_create", id, "", title);
    toast("Draft ready. Add the details.");
    this.openBuilder(id, "setup");
  },

  async importCsv(courseId, file) {
    const text = await file.text();
    const lines = text.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
    if (!lines.length) { toast("That file is empty"); return; }
    const start = /section/i.test(lines[0]) ? 1 : 0;
    ensureCourseSyllabus(courseId);
    this.mutateSyllabus(courseId, (sy) => {
      for (let i = start; i < lines.length; i++) {
        const cols = lines[i].split(",").map((x) => x.trim().replace(/^"|"$/g, ""));
        const [section, title, kind, dur] = cols;
        if (!title) continue;
        const k = /article|read/i.test(kind) ? "article" : /live/i.test(kind) ? "live" : "video";
        let sec = sy.sections.find((s) => s.title.toLowerCase() === String(section || "").toLowerCase());
        if (!sec) {
          sec = { id: "sec-" + courseId + "-" + Date.now() + "-" + i, title: section || "Lessons", items: [] };
          sy.sections.push(sec);
        }
        const lesson = { id: "v-" + Date.now() + "-" + i, t: title, dur: dur || "", kind: k, published: true, notes: "", src: "" };
        setCourseLessons(courseId, lessonsAll(courseId).concat(lesson), true);
        sec.items.push({ lessonId: lesson.id, kind: k, published: true });
      }
    });
    toast("Lessons imported");
    paint();
  }
};
