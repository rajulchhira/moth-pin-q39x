function shieldId() {
  const u = getUser();
  const raw = `${u?.email || "guest"}|${navigator.userAgent}|${screen.width}x${screen.height}|${Date.now().toString().slice(0, 8)}`;
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = (h * 31 + raw.charCodeAt(i)) >>> 0;
  return "TS-" + h.toString(16).toUpperCase();
}

function canAccess(course) {
  const u = getUser();
  if (!u) return false;
  return isEnrolled(course.id);
}

function fmt(t) {
  if (!t || !isFinite(t)) return "0:00";
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60).toString().padStart(2, "0");
  if (h) return `${h}:${String(m).padStart(2, "0")}:${s}`;
  return `${m}:${s}`;
}

function ytIcon(name) {
  const icons = {
    play: `<svg viewBox="0 0 36 36" aria-hidden="true"><path fill="currentColor" d="M 11 8 L 11 28 L 28 18 Z"/></svg>`,
    pause: `<svg viewBox="0 0 36 36" aria-hidden="true"><path fill="currentColor" d="M12 10h4.5v16H12zm7.5 0H24v16h-4.5z"/></svg>`,
    replay: `<svg viewBox="0 0 36 36" aria-hidden="true"><path fill="currentColor" d="M18 8a10 10 0 1 0 9.5 13h-2.1A8 8 0 1 1 18 10V6l6 5-6 5v-4z"/></svg>`,
    next: `<svg viewBox="0 0 36 36" aria-hidden="true"><path fill="currentColor" d="M10 10v16l11-8zm13 0h3v16h-3z"/></svg>`,
    vol: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.24 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`,
    volLow: `<svg viewBox="0 0 36 36" aria-hidden="true"><path fill="currentColor" d="M8 14h5.2L20 9v18l-6.8-5H8zm14.2-3.2c1.9 1.7 3 4.1 3 7.2s-1.1 5.5-3 7.2v-2.5c1.2-1.3 1.9-3 1.9-4.7s-.7-3.4-1.9-4.7z"/></svg>`,
    mute: `<svg viewBox="0 0 36 36" aria-hidden="true"><path fill="currentColor" d="M8 14h5.2L20 9v6.2L8.6 18.8zm12 13-2.4-2.4 2.4-2.4zm7.3-16.1 1.4 1.4-16 16-1.4-1.4z"/></svg>`,
    cc: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm-8 11H9.5v-.5h-2v3h2V17H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V17H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z"/></svg>`,
    gear: `<svg viewBox="0 0 36 36" aria-hidden="true"><path fill="currentColor" d="M18 13.5A4.5 4.5 0 1 1 13.5 18 4.5 4.5 0 0 1 18 13.5zm9.2 3.1-1.8-.3a7.6 7.6 0 0 0-.7-1.7l1.1-1.5-1.8-1.8-1.5 1.1a7.6 7.6 0 0 0-1.7-.7l-.3-1.8h-2.6l-.3 1.8a7.6 7.6 0 0 0-1.7.7l-1.5-1.1-1.8 1.8 1.1 1.5a7.6 7.6 0 0 0-.7 1.7l-1.8.3v2.6l1.8.3a7.6 7.6 0 0 0 .7 1.7l-1.1 1.5 1.8 1.8 1.5-1.1a7.6 7.6 0 0 0 1.7.7l.3 1.8h2.6l.3-1.8a7.6 7.6 0 0 0 1.7-.7l1.5 1.1 1.8-1.8-1.1-1.5a7.6 7.6 0 0 0 .7-1.7l1.8-.3z"/></svg>`,
    mini: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19 7H5v10h14V7zm-2 8h-6v-4h6v4z"/></svg>`,
    theater: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/></svg>`,
    theaterOff: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/></svg>`,
    fs: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 14H5v5h5v-2H7v-3zm12 0h-2v3h-3v2h5v-5zM7 10h2V7h3V5H5v5h2zm12-5h-5v2h3v3h2V5z"/></svg>`,
    fsExit: `<svg viewBox="0 0 36 36" aria-hidden="true"><path fill="currentColor" d="M14 10h-2v5H7v2h7zm8 0h2v5h5v2h-7zm-8 16h-2v-5H7v-2h7zm8 0h2v-5h5v-2h-7z"/></svg>`,
    back: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z"/></svg>`,
    check: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9.8 16.6 5.5 12.3l1.4-1.4 2.9 2.9 7.3-7.3 1.4 1.4z"/></svg>`,
    skipBack: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M11.4 12 18 7v10zm-7.4 0 6.6-5v10z"/></svg>`,
    skipFwd: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 7v10l6.6-5zm7.4 0v10L20 12z"/></svg>`
  };
  return icons[name] || "";
}

function renderLearnPage() {
  const root = document.getElementById("learnRoot");
  if (!root) return;
  if (window.top !== window.self) {
    document.documentElement.innerHTML = "";
    return;
  }
  const onCoursePage = Boolean(document.getElementById("courseDetail"));
  const id = new URLSearchParams(location.search).get("id");
  const c = allCourses().find((x) => x.id === id) || allCourses()[0];
  if (!onCoursePage) document.title = `${c.title} | Classroom`;

  if (!getUser()) {
    if (onCoursePage) return;
    root.innerHTML = `<div class="cr-lock"><h3>Login required</h3><p>This classroom is locked to your Bizgarh account.</p><button class="btn btn-orange" data-open="signupModal" style="margin-top:14px">Start learning</button></div>`;
    return;
  }
  if (!canAccess(c)) {
    if (onCoursePage) return;
    location.replace(`/course?id=${c.id}`);
    return;
  }

  if (onCoursePage) root.classList.add("drm-lock");
  else document.body.classList.add("drm-lock");
  const user = getUser();
  const sid = shieldId();
  const mark = `${user.name} · ${user.email} · ${sid}`;
  const LESSONS = lessonsFor(c.id);

  root.innerHTML = `
    <div class="learn-wrap">
      <section>
        <div class="player-shell show-ui" id="drmStage">
          <div class="yt-top" id="playerTop">
            <span class="drm-chip">Protected</span>
            <span class="yt-fs-title" id="ytFsTitle">${escapeHtml(LESSONS[0].t)}</span>
          </div>
          <video id="drmVideo" playsinline disablePictureInPicture controlsList="nodownload noremoteplayback nofullscreen"></video>
          <canvas class="drm-canvas" id="drmCanvas"></canvas>
          <div class="player-load" id="playerLoad"><div class="yt-spin"></div></div>
          <div class="drm-blackout" id="drmBlackout">
            <div>
              <h2>Playback paused</h2>
              <p>Return to this tab to continue.</p>
            </div>
          </div>
          <div class="yt-skip-side left" id="skipLeft"><div class="yt-skip-ring">${ytIcon("skipBack")}<b id="skipLeftN">10</b> seconds</div></div>
          <div class="yt-skip-side right" id="skipRight"><div class="yt-skip-ring">${ytIcon("skipFwd")}<b id="skipRightN">10</b> seconds</div></div>
          <button type="button" class="yt-bezel" id="ytBezel" aria-hidden="true">${ytIcon("play")}</button>
          <button type="button" class="yt-bigplay" id="ytBigPlay" aria-label="Play">${ytIcon("play")}</button>
          <div class="yt-cue" id="ytCue"></div>
          <div class="yt-end" id="endCard" hidden>
            <p>Up next</p>
            <h3 id="endTitle"></h3>
            <div class="yt-end-actions">
              <button type="button" class="yt-end-play" id="endPlay">Play next</button>
              <button type="button" id="endCancel">Cancel</button>
            </div>
          </div>
          <div class="player-ui" id="playerUi">
            <div class="yt-bar" id="seekWrap">
              <div class="yt-tip" id="seekTip">0:00</div>
              <div class="yt-track">
                <div class="yt-buf" id="bufBar"></div>
                <div class="yt-hover" id="hoverBar"></div>
                <div class="yt-played" id="playBar"></div>
                <div class="yt-chapters" id="chapters"></div>
                <i class="yt-knob" id="seekKnob"></i>
              </div>
            </div>
            <div class="player-row">
              <button type="button" id="playBtn" class="yt-btn" data-tip="Play (k)" aria-label="Play">${ytIcon("play")}</button>
              <button type="button" id="nextBtn" class="yt-btn" data-tip="Next lesson (Shift+N)" aria-label="Next lesson">${ytIcon("next")}</button>
              <div class="yt-vol">
                <button type="button" id="muteBtn" class="yt-btn" data-tip="Mute (m)" aria-label="Mute">${ytIcon("vol")}</button>
                <div class="yt-vol-rail">
                  <input type="range" id="vol" min="0" max="1" step="0.01" value="1" aria-label="Volume">
                </div>
              </div>
              <button type="button" id="timeLabel" class="yt-time" data-tip="Remaining time">0:00 / 0:00</button>
              <span class="yt-spacer"></span>
              <button type="button" id="autoBtn" class="yt-auto" data-tip="Autoplay" aria-label="Autoplay"><i></i></button>
              <button type="button" id="ccBtn" class="yt-btn" data-tip="Subtitles (c)" aria-label="Subtitles">${ytIcon("cc")}</button>
              <div class="yt-gear-wrap">
                <button type="button" id="gearBtn" class="yt-btn" data-tip="Settings" aria-label="Settings">${ytIcon("gear")}</button>
                <div class="yt-menu" id="settingsMenu" hidden>
                  <button type="button" data-menu="speed">Playback speed <span><b id="speedNow">Normal</b> ›</span></button>
                  <button type="button" data-menu="cc">Subtitles/CC <span><b id="ccNow">Off</b> ›</span></button>
                  <button type="button" data-menu="quality">Quality <span><b id="qualNow">Auto</b> ›</span></button>
                  <button type="button" data-menu="help">Keyboard shortcuts</button>
                </div>
                <div class="yt-menu" id="speedMenu" hidden></div>
                <div class="yt-menu" id="ccMenu" hidden>
                  <button type="button" data-back="1">${ytIcon("back")} Subtitles/CC</button>
                  <button type="button" data-cc="off" class="on"><span>Off</span></button>
                  <button type="button" data-cc="en"><span>English</span></button>
                  <button type="button" data-cc="hi"><span>Hindi</span></button>
                </div>
                <div class="yt-menu" id="qualMenu" hidden></div>
              </div>
              <button type="button" id="miniBtn" class="yt-btn" data-tip="Miniplayer (i)" aria-label="Miniplayer">${ytIcon("mini")}</button>
              <button type="button" id="theaterBtn" class="yt-btn" data-tip="Theater mode (t)" aria-label="Theater mode">${ytIcon("theater")}</button>
              <button type="button" id="fsBtn" class="yt-btn" data-tip="Full screen (f)" aria-label="Full screen">${ytIcon("fs")}</button>
            </div>
          </div>
          <div class="yt-tooltip" id="ytTip" hidden></div>
        </div>
        <div class="yt-keys" id="ytKeys" hidden>
          <div class="yt-keys-card">
            <h3>Keyboard shortcuts</h3>
            <ul>
              <li><b>k</b> / Space — Play / pause</li>
              <li><b>j</b> / <b>l</b> — Back / forward 10s</li>
              <li><b>←</b> / <b>→</b> — Back / forward 5s</li>
              <li><b>m</b> Mute · <b>f</b> Full screen · <b>t</b> Theater · <b>i</b> Miniplayer</li>
              <li><b>c</b> Subtitles · <b>0–9</b> Seek · <b>&lt;</b> <b>&gt;</b> Speed</li>
              <li><b>Shift+N</b> Next · <b>Shift+P</b> Previous</li>
            </ul>
            <button type="button" class="btn btn-primary" id="keysClose">Got it</button>
          </div>
        </div>
        ${onCoursePage ? `<h2 class="cr-lesson-title" id="lessonTitle">${escapeHtml(LESSONS[0].t)}</h2>` : `<h1 class="cr-lesson-title" id="lessonTitle">${escapeHtml(LESSONS[0].t)}</h1>`}
        <p class="muted" style="margin-top:6px">${c.title} · ${c.instructor}</p>
      </section>
      <aside>
        <h3 style="margin-bottom:12px">${c.title}</h3>
        <div class="cr-list" id="lessonList"></div>
        <div class="cr-lms" id="crLms"></div>
        ${onCoursePage ? "" : `<section class="cr-community" id="crCommunity">
          <h3>Community</h3>
          <div id="courseCommInner"></div>
        </section>`}
        <p class="cr-note">Watermarked to <strong>${user.email}</strong>. Recording or sharing is a license breach.</p>
      </aside>
    </div>`;

  const list = document.getElementById("lessonList");
  list.innerHTML = LESSONS.map((l, i) => `
    <button class="cr-item${i === 0 ? " active" : ""}" data-lesson="${i}">
      <span class="cr-num">${String(i + 1).padStart(2, "0")}</span>
      <span class="cr-item-body"><strong>${escapeHtml(l.t)}</strong><small>${escapeHtml(l.dur)} · encrypted</small></span>
    </button>`).join("");

  const video = document.getElementById("drmVideo");
  const canvas = document.getElementById("drmCanvas");
  const ctx = canvas.getContext("2d");
  const playBtn = document.getElementById("playBtn");
  const vol = document.getElementById("vol");
  const timeLabel = document.getElementById("timeLabel");
  const blackout = document.getElementById("drmBlackout");
  const loadEl = document.getElementById("playerLoad");
  const stage = document.getElementById("drmStage");
  const titleEl = document.getElementById("lessonTitle");
  const seekWrap = document.getElementById("seekWrap");
  const bufBar = document.getElementById("bufBar");
  const playBar = document.getElementById("playBar");
  const hoverBar = document.getElementById("hoverBar");
  const seekKnob = document.getElementById("seekKnob");
  const seekTip = document.getElementById("seekTip");
  const muteBtn = document.getElementById("muteBtn");
  const bigPlay = document.getElementById("ytBigPlay");
  const bezel = document.getElementById("ytBezel");
  const cueEl = document.getElementById("ytCue");
  const endCard = document.getElementById("endCard");
  const wrap = root.querySelector(".learn-wrap");
  if (window.__drmTeardown) window.__drmTeardown();
  const drmCtl = new AbortController();
  window.__drmCtl = drmCtl;
  const drmSig = { signal: drmCtl.signal };
  let currentLesson = 0;
  let blobUrl = "";
  let vttUrl = "";
  let wx = 48;
  let wy = 72;
  let painting = true;
  window.__drmTeardown = () => {
    painting = false;
    drmCtl.abort();
  };
  let uiTimer;
  let remainTime = false;
  let clickTimer = 0;
  let rate = Number(localStorage.getItem("tradeshalaPlaybackRate") || 1) || 1;
  let autoplay = localStorage.getItem("tradeshalaAutoplay") !== "0";
  let lastVol = 1;
  let quality = localStorage.getItem("tradeshalaQuality") || "auto";
  let captionsOn = localStorage.getItem("tradeshalaCaptions") === "1";
  let captionLang = localStorage.getItem("tradeshalaCaptionLang") || "en";
  let skipLeftAmt = 0;
  let skipRightAmt = 0;
  let skipReset;
  let ended = false;

  video.controls = false;
  video.disablePictureInPicture = true;
  if (video.disableRemotePlayback !== undefined) video.disableRemotePlayback = true;

  const RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  document.getElementById("speedMenu").innerHTML =
    `<button type="button" data-back="1">${ytIcon("back")} Playback speed</button>` +
    RATES.map((r) => `<button type="button" data-rate="${r}"><span>${r === 1 ? "Normal" : r}</span></button>`).join("");
  document.getElementById("qualMenu").innerHTML =
    `<button type="button" data-back="1">${ytIcon("back")} Quality</button>` +
    [["auto", "Auto"], ["1080", "1080p"], ["720", "720p"], ["480", "480p"], ["360", "360p"]].map(
      ([v, lab]) => `<button type="button" data-qual="${v}"><span>${lab}</span></button>`
    ).join("");

  function sizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(640, Math.floor(rect.width * devicePixelRatio));
    const h = Math.max(360, Math.floor(rect.height * devicePixelRatio));
    canvas.width = w;
    canvas.height = h;
  }
  sizeCanvas();
  window.addEventListener("resize", sizeCanvas, drmSig);

  function paint() {
    if (!painting) return;
    requestAnimationFrame(paint);
    if (!canvas.width) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `700 ${Math.round(canvas.width / 48)}px Roboto, Nunito, sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillText(mark, wx, wy);
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillText(user.email, canvas.width * 0.08, canvas.height * 0.88);
    ctx.fillText(sid, canvas.width * 0.55, canvas.height * 0.18);
  }
  paint();
  setInterval(() => {
    wx = 20 + Math.random() * (canvas.width * 0.5);
    wy = 40 + Math.random() * (canvas.height * 0.65);
  }, 2200);

  function flashBezel(kind) {
    bezel.innerHTML = ytIcon(kind);
    bezel.classList.remove("go");
    void bezel.offsetWidth;
    bezel.classList.add("go");
  }
  function setPlaying(on) {
    playBtn.innerHTML = ytIcon(on ? "pause" : ended ? "replay" : "play");
    playBtn.dataset.tip = on ? "Pause (k)" : ended ? "Replay" : "Play (k)";
    playBtn.setAttribute("aria-label", on ? "Pause" : "Play");
    bigPlay.classList.toggle("show", !on && !ended);
    if (on) endCard.hidden = true;
  }
  function showUi(ms = 3000) {
    stage.classList.add("show-ui");
    clearTimeout(uiTimer);
    if (video.paused) return;
    uiTimer = setTimeout(() => {
      if (!video.paused && !document.querySelector(".yt-menu:not([hidden])")) {
        stage.classList.remove("show-ui");
      }
    }, ms);
  }
  function speedLabel(v) {
    return Number(v) === 1 ? "Normal" : String(v);
  }
  function setRate(v) {
    rate = Number(v) || 1;
    video.playbackRate = rate;
    localStorage.setItem("tradeshalaPlaybackRate", String(rate));
    document.getElementById("speedNow").textContent = speedLabel(rate);
    document.querySelectorAll("#speedMenu [data-rate]").forEach((b) => {
      b.classList.toggle("on", Number(b.dataset.rate) === rate);
      b.querySelectorAll("svg").forEach((s) => s.remove());
      if (Number(b.dataset.rate) === rate) b.querySelector("span")?.insertAdjacentHTML("afterbegin", ytIcon("check"));
    });
  }
  function volIcon() {
    if (video.muted || video.volume === 0) return ytIcon("mute");
    if (video.volume < 0.5) return ytIcon("volLow");
    return ytIcon("vol");
  }
  function syncVolume() {
    muteBtn.innerHTML = volIcon();
    muteBtn.dataset.tip = video.muted || video.volume === 0 ? "Unmute (m)" : "Mute (m)";
    vol.value = String(video.muted ? 0 : video.volume);
    vol.style.setProperty("--vol", `${(video.muted ? 0 : video.volume) * 100}%`);
  }
  function togglePlay() {
    if (ended) {
      ended = false;
      video.currentTime = 0;
      video.play();
      return;
    }
    if (video.paused) video.play();
    else video.pause();
  }
  function showSkip(dir, total) {
    const el = document.getElementById(dir === -1 ? "skipLeft" : "skipRight");
    const n = document.getElementById(dir === -1 ? "skipLeftN" : "skipRightN");
    n.textContent = String(total);
    el.classList.remove("go");
    void el.offsetWidth;
    el.classList.add("go");
  }
  function skip(sec) {
    if (!video.duration) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + sec));
    const amt = Math.abs(Math.round(sec)) || 10;
    if (sec < 0) {
      skipLeftAmt += amt;
      skipRightAmt = 0;
      showSkip(-1, skipLeftAmt);
    } else {
      skipRightAmt += amt;
      skipLeftAmt = 0;
      showSkip(1, skipRightAmt);
    }
    clearTimeout(skipReset);
    skipReset = setTimeout(() => { skipLeftAmt = 0; skipRightAmt = 0; }, 900);
    showUi();
  }
  function seekTo(ratio) {
    if (!video.duration) return;
    ended = false;
    video.currentTime = Math.max(0, Math.min(1, ratio)) * video.duration;
  }
  function ratioFromEvent(e) {
    const r = seekWrap.querySelector(".yt-track").getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
  }
  function updateBars() {
    const d = video.duration || 0;
    const t = video.currentTime || 0;
    const p = d ? (t / d) * 100 : 0;
    playBar.style.width = p + "%";
    seekKnob.style.left = p + "%";
    let buf = 0;
    try {
      if (video.buffered.length) buf = (video.buffered.end(video.buffered.length - 1) / d) * 100;
    } catch { buf = 0; }
    bufBar.style.width = (d ? buf : 0) + "%";
    timeLabel.textContent = remainTime && d
      ? `-${fmt(Math.max(0, d - t))} / ${fmt(d)}`
      : `${fmt(t)} / ${fmt(d)}`;
    if (d && d >= 25 && d - t <= 8 && currentLesson < LESSONS.length - 1 && !video.paused) {
      endCard.hidden = false;
      document.getElementById("endTitle").textContent = LESSONS[currentLesson + 1].t;
    } else if (!ended) endCard.hidden = true;
  }
  function applyQuality() {
    const h = video.videoHeight || 720;
    const label = quality === "auto" ? `Auto ${h}p` : quality + "p";
    document.getElementById("qualNow").textContent = label;
    document.querySelectorAll("#qualMenu [data-qual]").forEach((b) => {
      b.classList.toggle("on", b.dataset.qual === quality);
      b.querySelectorAll("svg").forEach((s) => s.remove());
      if (b.dataset.qual === quality) b.querySelector("span")?.insertAdjacentHTML("afterbegin", ytIcon("check"));
    });
    const cap = quality === "auto" ? 0 : Number(quality);
    stage.style.setProperty("--q-blur", cap && cap < h ? "0.35px" : "0px");
    localStorage.setItem("tradeshalaQuality", quality);
  }
  function paintChapters() {
    const host = document.getElementById("chapters");
    if (!host) return;
    host.innerHTML = [0.2, 0.45, 0.72].map((m) => `<i style="left:${m * 100}%"></i>`).join("");
  }
  function closeMenus() {
    ["settingsMenu", "speedMenu", "ccMenu", "qualMenu"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.hidden = true;
    });
  }
  function typeInField(e) {
    return e.target.closest("input, textarea, select, [contenteditable]");
  }
  function setCaptions(on, lang) {
    captionsOn = on;
    if (lang) captionLang = lang;
    localStorage.setItem("tradeshalaCaptions", on ? "1" : "0");
    localStorage.setItem("tradeshalaCaptionLang", captionLang);
    document.getElementById("ccBtn").classList.toggle("on", on);
    document.getElementById("ccNow").textContent = on ? (captionLang === "hi" ? "Hindi" : "English") : "Off";
    document.querySelectorAll("#ccMenu [data-cc]").forEach((b) => {
      const val = on ? captionLang : "off";
      b.classList.toggle("on", b.dataset.cc === val);
    });
    [...(video.textTracks || [])].forEach((t) => { t.mode = "hidden"; });
    if (!on) cueEl.classList.remove("show");
  }
  function attachCaptions(lesson, duration) {
    if (vttUrl) URL.revokeObjectURL(vttUrl);
    [...video.querySelectorAll("track")].forEach((t) => t.remove());
    const d = duration || 60;
    const en = [
      [0, Math.min(7, d), lesson.t],
      [7, Math.min(18, d), "Pause and write the setup, invalidation, and size."],
      [18, Math.min(32, d), `${c.instructor} · ${c.title}`],
      [32, Math.min(48, d), "Do not copy trades. Follow the process on your own chart."],
      [48, d, "Watermarked classroom · Bizgarh"]
    ];
    const hi = [
      [0, Math.min(7, d), lesson.t],
      [7, Math.min(18, d), "Pause karke setup, invalidation aur size likho."],
      [18, Math.min(32, d), `${c.instructor} · ${c.title}`],
      [32, Math.min(48, d), "Trade copy mat karo. Apne chart par process follow karo."],
      [48, d, "Watermarked classroom · Bizgarh"]
    ];
    const rows = captionLang === "hi" ? hi : en;
    const vtt = "WEBVTT\n\n" + rows.filter((x) => x[1] > x[0]).map((x, i) => {
      const a = fmtVtt(x[0]);
      const b = fmtVtt(x[1]);
      return `${i + 1}\n${a} --> ${b}\n${x[2]}`;
    }).join("\n\n");
    vttUrl = URL.createObjectURL(new Blob([vtt], { type: "text/vtt" }));
    const track = document.createElement("track");
    track.kind = "subtitles";
    track.label = captionLang === "hi" ? "Hindi" : "English";
    track.srclang = captionLang;
    track.src = vttUrl;
    video.appendChild(track);
    const kick = () => {
      const tt = video.textTracks[0];
      if (!tt) return;
      tt.mode = "hidden";
      tt.oncuechange = () => {
        const cue = tt.activeCues && tt.activeCues[0];
        if (captionsOn && cue) {
          cueEl.textContent = cue.text;
          cueEl.classList.add("show");
        } else cueEl.classList.remove("show");
      };
    };
    track.addEventListener("load", kick);
    setTimeout(kick, 250);
  }
  function fmtVtt(sec) {
    const t = Math.max(0, sec);
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = t % 60;
    const ss = s.toFixed(3).padStart(6, "0");
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${ss}`;
  }

  async function loadLesson(i) {
    if (i < 0 || i >= LESSONS.length) return;
    currentLesson = i;
    ended = false;
    endCard.hidden = true;
    document.querySelectorAll(".cr-item").forEach((b) => b.classList.toggle("active", Number(b.dataset.lesson) === i));
    titleEl.textContent = LESSONS[i].t;
    document.getElementById("ytFsTitle").textContent = LESSONS[i].t;
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    video.removeAttribute("src");
    loadEl.classList.add("show");
    try {
      if (LESSONS[i].fileKey) {
        const blob = await getVideoBlob(LESSONS[i].fileKey);
        if (!blob) throw new Error("missing file");
        blobUrl = URL.createObjectURL(blob);
        video.src = blobUrl;
      } else if (LESSONS[i].src) {
        video.src = LESSONS[i].src;
      }
    } catch {
      if (LESSONS[i].src) video.src = LESSONS[i].src;
    }
    const bounce = () => {
      if (LESSONS[i].src && video.src.startsWith("blob:")) video.src = LESSONS[i].src;
    };
    video.addEventListener("error", bounce, { once: true });
    video.playbackRate = rate;
    await video.play().catch(() => {});
    loadEl.classList.remove("show");
    setPlaying(!video.paused);
    applyQuality();
    showUi();
  }

  setRate(rate);
  document.getElementById("autoBtn").classList.toggle("on", autoplay);
  setCaptions(captionsOn, captionLang);
  syncVolume();

  playBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const willPlay = video.paused || ended;
    togglePlay();
    flashBezel(willPlay ? "play" : "pause");
  });
  document.getElementById("nextBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    loadLesson(currentLesson + 1);
  });
  muteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (video.muted || video.volume === 0) {
      video.muted = false;
      video.volume = lastVol || 1;
    } else {
      lastVol = video.volume || 1;
      video.muted = true;
    }
    syncVolume();
  });
  vol.addEventListener("input", (e) => {
    e.stopPropagation();
    video.volume = Number(vol.value);
    video.muted = video.volume === 0;
    if (video.volume) lastVol = video.volume;
    syncVolume();
  });
  timeLabel.addEventListener("click", (e) => {
    e.stopPropagation();
    remainTime = !remainTime;
    updateBars();
  });
  document.getElementById("autoBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    autoplay = !autoplay;
    localStorage.setItem("tradeshalaAutoplay", autoplay ? "1" : "0");
    e.currentTarget.classList.toggle("on", autoplay);
  });
  document.getElementById("ccBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    setCaptions(!captionsOn, captionLang);
  });
  document.getElementById("gearBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    const menu = document.getElementById("settingsMenu");
    const open = menu.hidden;
    closeMenus();
    menu.hidden = !open;
  });
  document.getElementById("settingsMenu").addEventListener("click", (e) => {
    e.stopPropagation();
    const btn = e.target.closest("[data-menu]");
    if (!btn) return;
    document.getElementById("settingsMenu").hidden = true;
    if (btn.dataset.menu === "help") {
      document.getElementById("ytKeys").hidden = false;
      return;
    }
    document.getElementById(btn.dataset.menu === "speed" ? "speedMenu" : btn.dataset.menu === "cc" ? "ccMenu" : "qualMenu").hidden = false;
  });
  document.getElementById("speedMenu").addEventListener("click", (e) => {
    e.stopPropagation();
    if (e.target.closest("[data-back]")) {
      document.getElementById("speedMenu").hidden = true;
      document.getElementById("settingsMenu").hidden = false;
      return;
    }
    const b = e.target.closest("[data-rate]");
    if (b) { setRate(b.dataset.rate); closeMenus(); }
  });
  document.getElementById("ccMenu").addEventListener("click", (e) => {
    e.stopPropagation();
    if (e.target.closest("[data-back]")) {
      document.getElementById("ccMenu").hidden = true;
      document.getElementById("settingsMenu").hidden = false;
      return;
    }
    const b = e.target.closest("[data-cc]");
    if (!b) return;
    if (b.dataset.cc === "off") setCaptions(false);
    else {
      captionLang = b.dataset.cc;
      setCaptions(true, captionLang);
      attachCaptions(LESSONS[currentLesson], video.duration);
    }
    closeMenus();
  });
  document.getElementById("qualMenu").addEventListener("click", (e) => {
    e.stopPropagation();
    if (e.target.closest("[data-back]")) {
      document.getElementById("qualMenu").hidden = true;
      document.getElementById("settingsMenu").hidden = false;
      return;
    }
    const b = e.target.closest("[data-qual]");
    if (!b) return;
    quality = b.dataset.qual;
    applyQuality();
    closeMenus();
  });
  document.getElementById("miniBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    if (document.fullscreenElement) document.exitFullscreen?.();
    wrap.classList.toggle("mini");
    document.body.classList.toggle("yt-mini-on", wrap.classList.contains("mini"));
    sizeCanvas();
  });
  document.getElementById("theaterBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    if (wrap.classList.contains("mini")) {
      wrap.classList.remove("mini");
      document.body.classList.remove("yt-mini-on");
    }
    wrap.classList.toggle("theater");
    document.getElementById("theaterBtn").innerHTML = ytIcon(wrap.classList.contains("theater") ? "theaterOff" : "theater");
    sizeCanvas();
  });
  function setFs(on) {
    document.getElementById("fsBtn").innerHTML = ytIcon(on ? "fsExit" : "fs");
    document.getElementById("fsBtn").dataset.tip = on ? "Exit full screen (f)" : "Full screen (f)";
  }
  document.getElementById("fsBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    if (!document.fullscreenElement) stage.requestFullscreen?.();
    else document.exitFullscreen?.();
  });
  document.addEventListener("fullscreenchange", () => {
    setFs(!!document.fullscreenElement);
    sizeCanvas();
  }, drmSig);
  bigPlay.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePlay();
  });
  document.getElementById("endPlay").addEventListener("click", (e) => {
    e.stopPropagation();
    loadLesson(currentLesson + 1);
  });
  document.getElementById("endCancel").addEventListener("click", (e) => {
    e.stopPropagation();
    endCard.hidden = true;
  });
  document.getElementById("keysClose").addEventListener("click", () => {
    document.getElementById("ytKeys").hidden = true;
  });
  document.getElementById("ytKeys").addEventListener("click", (e) => {
    if (e.target.id === "ytKeys") e.currentTarget.hidden = true;
  });

  let dragging = false;
  seekWrap.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    dragging = true;
    seekTo(ratioFromEvent(e));
    seekWrap.setPointerCapture(e.pointerId);
  });
  seekWrap.addEventListener("pointermove", (e) => {
    const ratio = ratioFromEvent(e);
    hoverBar.style.width = ratio * 100 + "%";
    seekTip.style.left = ratio * 100 + "%";
    seekTip.textContent = fmt((video.duration || 0) * ratio);
    seekWrap.classList.add("tip");
    if (dragging) seekTo(ratio);
  });
  seekWrap.addEventListener("pointerup", () => { dragging = false; });
  seekWrap.addEventListener("pointerleave", () => { if (!dragging) seekWrap.classList.remove("tip"); });

  video.addEventListener("ended", () => {
    ended = true;
    setPlaying(false);
    playBtn.innerHTML = ytIcon("replay");
    if (typeof markLessonDone === "function") markLessonDone(user.email, c.id, currentLesson);
    renderCrLms();
    if (autoplay && currentLesson < LESSONS.length - 1) {
      loadLesson(currentLesson + 1);
      return;
    }
    if (currentLesson < LESSONS.length - 1) {
      endCard.hidden = false;
      document.getElementById("endTitle").textContent = LESSONS[currentLesson + 1].t;
    }
  });
  video.addEventListener("play", () => {
    ended = false;
    setPlaying(true);
  });
  video.addEventListener("pause", () => {
    setPlaying(false);
    stage.classList.add("show-ui");
  });
  video.addEventListener("timeupdate", updateBars);
  video.addEventListener("progress", updateBars);
  video.addEventListener("loadedmetadata", () => {
    setRate(rate);
    applyQuality();
    updateBars();
    paintChapters();
    attachCaptions(LESSONS[currentLesson], video.duration);
  });
  video.addEventListener("waiting", () => loadEl.classList.add("show"));
  video.addEventListener("playing", () => loadEl.classList.remove("show"));
  video.addEventListener("volumechange", syncVolume);

  const tip = document.getElementById("ytTip");
  stage.addEventListener("pointermove", (e) => {
    if (document.querySelector(".yt-menu:not([hidden])")) {
      tip.hidden = true;
      return;
    }
    const btn = e.target.closest("[data-tip]");
    if (!btn || !stage.contains(btn)) {
      tip.hidden = true;
      return;
    }
    const r = btn.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    tip.textContent = btn.dataset.tip;
    tip.hidden = false;
    tip.style.left = `${r.left - s.left + r.width / 2}px`;
    tip.style.bottom = `${s.bottom - r.top + 10}px`;
  });
  stage.addEventListener("pointerleave", () => { tip.hidden = true; });

  stage.addEventListener("click", (e) => {
    if (e.target.closest(".player-ui") || e.target.closest(".yt-top") || e.target.closest(".yt-menu") || e.target.closest(".yt-end") || e.target.closest(".yt-bigplay")) return;
    const x = (e.clientX - stage.getBoundingClientRect().left) / stage.clientWidth;
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = 0;
      if (x < 0.32) skip(-10);
      else if (x > 0.68) skip(10);
      else if (!document.fullscreenElement) stage.requestFullscreen?.();
      else document.exitFullscreen?.();
      return;
    }
    clickTimer = setTimeout(() => {
      clickTimer = 0;
      const willPlay = video.paused || ended;
      togglePlay();
      flashBezel(willPlay ? "play" : "pause");
    }, 220);
  });
  stage.addEventListener("dblclick", (e) => e.preventDefault());
  stage.addEventListener("mousemove", () => showUi());
  stage.addEventListener("wheel", (e) => {
    if (!e.altKey && Math.abs(e.deltaY) < 4) return;
    if (!stage.matches(":hover")) return;
    const overVol = e.target.closest(".yt-vol");
    if (!overVol && !e.altKey) return;
    e.preventDefault();
    video.volume = Math.max(0, Math.min(1, video.volume + (e.deltaY > 0 ? -0.05 : 0.05)));
    video.muted = video.volume === 0;
    syncVolume();
    showUi();
  }, { passive: false });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".yt-gear-wrap")) closeMenus();
  }, drmSig);
  list.addEventListener("click", (e) => {
    const b = e.target.closest("[data-lesson]");
    if (b) loadLesson(Number(b.dataset.lesson));
  });

  const lock = () => {
    video.pause();
    blackout.classList.add("show");
  };
  const unlock = () => blackout.classList.remove("show");
  document.addEventListener("visibilitychange", () => { if (document.hidden) lock(); else unlock(); }, drmSig);

  const inClassroom = (el) => Boolean(el?.closest?.("#learnRoot, #drmStage"));
  const block = (e) => {
    if (onCoursePage && !inClassroom(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    return false;
  };
  document.addEventListener("contextmenu", block, drmSig);
  document.addEventListener("copy", block, drmSig);
  document.addEventListener("cut", block, drmSig);
  document.addEventListener("dragstart", block, drmSig);
  document.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    const bad =
      e.key === "PrintScreen" ||
      (e.ctrlKey && e.shiftKey && ["i", "c"].includes(k)) ||
      (e.ctrlKey && ["s", "u", "p"].includes(k)) ||
      k === "f12" ||
      (e.metaKey && e.shiftKey && ["3", "4", "5"].includes(e.key));
    if (bad) {
      e.preventDefault();
      lock();
      toast("Capture blocked · session watermarked");
      return;
    }
    if (onCoursePage && !inClassroom(e.target) && !document.fullscreenElement) return;
    if (typeInField(e) || (e.ctrlKey && k !== "/") || e.metaKey || e.altKey) return;
    if (e.key === "?" || (e.shiftKey && e.key === "/")) {
      e.preventDefault();
      const box = document.getElementById("ytKeys");
      box.hidden = !box.hidden;
      return;
    }
    if (e.key === "Escape") {
      document.getElementById("ytKeys").hidden = true;
      closeMenus();
      if (wrap.classList.contains("mini")) {
        wrap.classList.remove("mini");
        document.body.classList.remove("yt-mini-on");
      }
    }
    const map = {
      " ": () => togglePlay(),
      k: () => togglePlay(),
      j: () => skip(-10),
      l: () => skip(10),
      arrowleft: () => skip(e.shiftKey ? -10 : -5),
      arrowright: () => skip(e.shiftKey ? 10 : 5),
      arrowup: () => { video.volume = Math.min(1, video.volume + 0.05); video.muted = false; syncVolume(); },
      arrowdown: () => { video.volume = Math.max(0, video.volume - 0.05); syncVolume(); },
      m: () => muteBtn.click(),
      f: () => document.getElementById("fsBtn").click(),
      t: () => document.getElementById("theaterBtn").click(),
      i: () => document.getElementById("miniBtn").click(),
      c: () => document.getElementById("ccBtn").click(),
      home: () => seekTo(0),
      end: () => seekTo(1),
      n: () => { if (e.shiftKey) loadLesson(currentLesson + 1); },
      p: () => { if (e.shiftKey) loadLesson(currentLesson - 1); },
      ",": () => { if (video.paused) video.currentTime = Math.max(0, video.currentTime - 1 / 30); },
      ".": () => { if (video.paused) video.currentTime = Math.min(video.duration || 0, video.currentTime + 1 / 30); }
    };
    if (e.key === "<" || (e.shiftKey && e.key === ",")) { e.preventDefault(); setRate(Math.max(0.25, +(rate - 0.25).toFixed(2))); return; }
    if (e.key === ">" || (e.shiftKey && e.key === ".")) { e.preventDefault(); setRate(Math.min(2, +(rate + 0.25).toFixed(2))); return; }
    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      seekTo(Number(e.key) / 10);
      return;
    }
    const fn = map[k] || map[e.key];
    if (fn) {
      e.preventDefault();
      fn();
      showUi();
    }
  }, drmSig);

  if (navigator.mediaDevices?.getDisplayMedia && !navigator.mediaDevices.getDisplayMedia.__bizgarhBlock) {
    const orig = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);
    const blocked = async function () {
      lock();
      toast("Screen capture is not allowed in this classroom");
      throw new DOMException("Capture blocked", "NotAllowedError");
    };
    blocked.__bizgarhBlock = true;
    navigator.mediaDevices.getDisplayMedia = blocked;
    window.addEventListener("pagehide", () => { navigator.mediaDevices.getDisplayMedia = orig; }, drmSig);
  }

  function renderCrLms() {
    const host = document.getElementById("crLms");
    if (!host || typeof quizzesOf !== "function") return;
    const qzs = quizzesOf(c.id);
    const asg = assignmentsOf(c.id);
    const prog = courseCompletion(user.email, c.id);
    const lp = learnerProgress(user.email, c.id);
    host.innerHTML = `
      <div class="cr-progress"><span>Progress ${prog.pct}%</span><div class="bar-track"><i style="width:${prog.pct}%"></i></div></div>
      ${qzs.map((q) => `<button class="btn btn-ghost cr-quiz-btn" type="button" data-take-quiz="${q.id}">Quiz · ${q.title}${lp.quizzes[q.id] != null ? " · " + lp.quizzes[q.id] + "%" : ""}</button>`).join("")}
      ${asg.map((a) => `<button class="btn btn-ghost cr-quiz-btn" type="button" data-open-assign="${a.id}">Assignment · ${a.title}</button>`).join("")}
      ${prog.cert ? `<a class="btn btn-primary" href="/certificate?course=${c.id}&email=${encodeURIComponent(user.email)}">Certificate</a>` : ""}
      <div id="crQuizBox"></div>`;
  }
  renderCrLms();
  if (!onCoursePage) {
    const commInner = document.getElementById("courseCommInner");
    if (commInner && typeof courseCommunityBodyHTML === "function") {
      commInner.innerHTML = courseCommunityBodyHTML(c);
      bindCourseCommunity(c.id);
    }
  }
  document.getElementById("crLms")?.addEventListener("click", (e) => {
    const quizBtn = e.target.closest("[data-take-quiz]");
    const asBtn = e.target.closest("[data-open-assign]");
    const box = document.getElementById("crQuizBox");
    if (quizBtn) {
      const quiz = quizzesOf(c.id).find((q) => q.id === quizBtn.dataset.takeQuiz);
      if (!quiz || !box) return;
      box.innerHTML = `<form id="takeQuizForm" class="cr-quiz">
        <h4>${quiz.title}</h4>
        ${(quiz.questions || []).map((q, i) => `<fieldset><legend>${q.q}</legend>${q.options.map((o, j) => `<label><input type="radio" name="q${i}" value="${j}" required> ${o}</label>`).join("")}</fieldset>`).join("")}
        <button class="btn btn-primary" type="submit">Submit quiz</button>
      </form>`;
      document.getElementById("takeQuizForm").onsubmit = (ev) => {
        ev.preventDefault();
        const fd = new FormData(ev.target);
        let ok = 0;
        quiz.questions.forEach((q, i) => { if (Number(fd.get("q" + i)) === Number(q.answer)) ok += 1; });
        const score = Math.round((ok / quiz.questions.length) * 100);
        const cur = learnerProgress(user.email, c.id);
        patchProgress(user.email, c.id, { quizzes: { ...cur.quizzes, [quiz.id]: score } });
        const attempts = quizAttempts();
        attempts.push({ quizId: quiz.id, courseId: c.id, email: user.email, score, at: new Date().toISOString() });
        writeList(QUIZ_ATTEMPT_KEY, attempts);
        toast(score >= quiz.passScore ? `Passed · ${score}%` : `Score ${score}% · pass is ${quiz.passScore}%`);
        if (score >= quiz.passScore && courseCompletion(user.email, c.id).pct >= 80) issueCert(user.email, user.name, c.id);
        renderCrLms();
      };
    }
    if (asBtn) {
      const a = assignmentsOf(c.id).find((x) => x.id === asBtn.dataset.openAssign);
      if (!a || !box) return;
      box.innerHTML = `<form id="takeAssignForm" class="cr-quiz">
        <h4>${a.title}</h4>
        <p class="muted">${a.prompt || ""} ${a.due ? " · due " + a.due : ""}</p>
        <textarea name="text" required placeholder="Your submission"></textarea>
        <button class="btn btn-primary" type="submit">Submit</button>
      </form>`;
      document.getElementById("takeAssignForm").onsubmit = (ev) => {
        ev.preventDefault();
        const list = assignSubs();
        list.push({ id: "sub-" + Date.now(), courseId: c.id, assignmentId: a.id, email: user.email, name: user.name, text: ev.target.text.value.trim(), at: new Date().toISOString(), status: "submitted" });
        writeList(ASSIGN_SUB_KEY, list);
        toast("Assignment submitted");
        renderCrLms();
      };
    }
  });

  loadLesson(0);
}

window.renderLearnPage = renderLearnPage;
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("learnRoot") && !document.getElementById("courseDetail")) renderLearnPage();
});
