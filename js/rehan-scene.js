/**
 * Rehan /rehan — Liquid Aurora Waves / Cyber Neon (desk217)
 * Canvas 2D, no deps. Soft layered aurora ribbons at normal speed.
 * Deep layer CSS-blurred for depth; UI stays sharp above.
 * prefers-reduced-motion / hidden tab → static or paused.
 */
(function () {
  "use strict";

  var deep = document.getElementById("rehanSceneDeep");
  var mid = document.getElementById("rehanSceneMid");
  if (!deep || !mid || !deep.getContext) return;

  var reduce = false;
  try {
    reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {
    reduce = false;
  }

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var ctxD = deep.getContext("2d", { alpha: true });
  var ctxM = mid.getContext("2d", { alpha: true });
  var w = 0;
  var h = 0;
  var raf = 0;
  var t0 = performance.now();
  var running = false;

  /* Cyber Neon palette — violet / magenta / cyan / teal */
  var VIOLET = [124, 58, 237];
  var INDIGO = [67, 56, 202];
  var MAGENTA = [232, 121, 249];
  var CYAN = [34, 211, 238];
  var TEAL = [45, 212, 191];
  var WHITE = [255, 255, 255];

  function rgba(c, a) {
    return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
  }
  function mix(a, b, t) {
    return [
      (a[0] + (b[0] - a[0]) * t) | 0,
      (a[1] + (b[1] - a[1]) * t) | 0,
      (a[2] + (b[2] - a[2]) * t) | 0
    ];
  }

  /* Normal-speed liquid aurora ribbons */
  var ribbons = [
    {
      amp: 0.24,
      speed: 0.38,
      phase: 0.15,
      y0: 0.26,
      thick: 0.44,
      c0: VIOLET,
      c1: MAGENTA,
      alpha: 0.58
    },
    {
      amp: 0.2,
      speed: 0.32,
      phase: 1.9,
      y0: 0.46,
      thick: 0.48,
      c0: MAGENTA,
      c1: CYAN,
      alpha: 0.52
    },
    {
      amp: 0.22,
      speed: 0.35,
      phase: 3.6,
      y0: 0.64,
      thick: 0.4,
      c0: CYAN,
      c1: TEAL,
      alpha: 0.5
    },
    {
      amp: 0.16,
      speed: 0.28,
      phase: 5.2,
      y0: 0.38,
      thick: 0.3,
      c0: INDIGO,
      c1: CYAN,
      alpha: 0.36
    },
    {
      amp: 0.14,
      speed: 0.3,
      phase: 4.1,
      y0: 0.72,
      thick: 0.26,
      c0: MAGENTA,
      c1: VIOLET,
      alpha: 0.3
    }
  ];

  var particles = [];
  function seedParticles(n) {
    particles = [];
    var i;
    for (i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.8,
        phase: Math.random() * Math.PI * 2,
        tw: 0.5 + Math.random() * 1.2,
        drift: 8 + Math.random() * 18,
        tint: Math.random() > 0.5 ? CYAN : MAGENTA
      });
    }
  }

  function resize() {
    var host = deep.parentElement.parentElement || deep.parentElement;
    var rect = host.getBoundingClientRect();
    w = Math.max(1, Math.floor(rect.width));
    h = Math.max(1, Math.floor(rect.height));
    [deep, mid].forEach(function (c) {
      c.width = Math.floor(w * dpr);
      c.height = Math.floor(h * dpr);
      c.style.width = w + "px";
      c.style.height = h + "px";
    });
    ctxD.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctxM.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!particles.length) seedParticles(Math.min(90, Math.floor((w * h) / 9000)));
  }

  function drawBase(ctx) {
    ctx.fillStyle = "#07061a";
    ctx.fillRect(0, 0, w, h);

    var g1 = ctx.createRadialGradient(w * 0.3, h * 0.35, 0, w * 0.3, h * 0.35, w * 0.58);
    g1.addColorStop(0, rgba(VIOLET, 0.42));
    g1.addColorStop(0.5, rgba(MAGENTA, 0.14));
    g1.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, w, h);

    var g2 = ctx.createRadialGradient(w * 0.78, h * 0.58, 0, w * 0.78, h * 0.58, w * 0.52);
    g2.addColorStop(0, rgba(CYAN, 0.36));
    g2.addColorStop(0.55, rgba(TEAL, 0.12));
    g2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, w, h);

    var g3 = ctx.createRadialGradient(w * 0.5, h * 0.15, 0, w * 0.5, h * 0.15, w * 0.4);
    g3.addColorStop(0, rgba(INDIGO, 0.28));
    g3.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g3;
    ctx.fillRect(0, 0, w, h);
  }

  function drawRibbon(ctx, r, t) {
    var steps = 56;
    var ptsTop = [];
    var ptsBot = [];
    var i;
    for (i = 0; i <= steps; i++) {
      var u = i / steps;
      var x = u * w * 1.25 - w * 0.12;
      var wave =
        Math.sin(u * Math.PI * 2.0 + t * r.speed + r.phase) * r.amp * h +
        Math.sin(u * Math.PI * 1.15 - t * r.speed * 0.65 + r.phase * 1.3) * r.amp * h * 0.42 +
        Math.sin(u * Math.PI * 3.1 + t * r.speed * 0.4) * r.amp * h * 0.12;
      var y = r.y0 * h + wave;
      var th = r.thick * h * (0.5 + 0.5 * Math.sin(u * Math.PI));
      ptsTop.push({ x: x, y: y - th * 0.5 });
      ptsBot.push({ x: x, y: y + th * 0.5 });
    }

    ctx.beginPath();
    ctx.moveTo(ptsTop[0].x, ptsTop[0].y);
    for (i = 1; i < ptsTop.length; i++) ctx.lineTo(ptsTop[i].x, ptsTop[i].y);
    for (i = ptsBot.length - 1; i >= 0; i--) ctx.lineTo(ptsBot[i].x, ptsBot[i].y);
    ctx.closePath();

    var grd = ctx.createLinearGradient(0, 0, w, h * 0.8);
    grd.addColorStop(0, rgba(r.c0, r.alpha));
    grd.addColorStop(0.45, rgba(mix(r.c0, r.c1, 0.5), r.alpha * 0.9));
    grd.addColorStop(1, rgba(r.c1, r.alpha * 0.72));
    ctx.fillStyle = grd;
    ctx.fill();

    /* Soft ridge highlight */
    ctx.beginPath();
    ctx.moveTo(ptsTop[0].x, (ptsTop[0].y + ptsBot[0].y) * 0.5);
    for (i = 1; i < ptsTop.length; i++) {
      ctx.lineTo(ptsTop[i].x, (ptsTop[i].y + ptsBot[i].y) * 0.5);
    }
    ctx.strokeStyle = rgba(WHITE, 0.1);
    ctx.lineWidth = 5;
    ctx.stroke();
  }

  function drawParticles(ctx, t) {
    var i;
    for (i = 0; i < particles.length; i++) {
      var p = particles[i];
      var px = p.x + Math.sin(t * 0.35 + p.phase) * p.drift;
      var py = ((p.y + Math.cos(t * 0.28 + p.phase) * (p.drift * 0.5) + t * 6) % (h + 40)) - 20;
      var tw = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * p.tw + p.phase));
      var r = p.r * (1.2 + tw * 0.6);
      var g = ctx.createRadialGradient(px, py, 0, px, py, r * 4);
      g.addColorStop(0, rgba(WHITE, 0.7 * tw));
      g.addColorStop(0.35, rgba(p.tint, 0.28 * tw));
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, py, r * 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawAurora(ctx, t) {
    drawBase(ctx);
    var i;
    for (i = 0; i < ribbons.length; i++) {
      drawRibbon(ctx, ribbons[i], t);
    }
    drawParticles(ctx, t);
  }

  function frame(now) {
    if (!running) return;
    var t = (now - t0) / 1000;

    drawAurora(ctxD, t);

    ctxM.clearRect(0, 0, w, h);
    var i;
    for (i = 0; i < ribbons.length; i += 2) {
      ctxM.globalAlpha = 0.2;
      drawRibbon(ctxM, ribbons[i], t * 0.95 + 0.5);
      ctxM.globalAlpha = 1;
    }
    /* Soft mid glow orbs */
    var ox = w * 0.35 + Math.sin(t * 0.25) * 40;
    var oy = h * 0.42 + Math.cos(t * 0.22) * 30;
    var og = ctxM.createRadialGradient(ox, oy, 0, ox, oy, w * 0.28);
    og.addColorStop(0, rgba(MAGENTA, 0.12));
    og.addColorStop(1, "rgba(0,0,0,0)");
    ctxM.fillStyle = og;
    ctxM.fillRect(0, 0, w, h);

    var ox2 = w * 0.7 + Math.cos(t * 0.2) * 35;
    var oy2 = h * 0.55 + Math.sin(t * 0.27) * 28;
    var og2 = ctxM.createRadialGradient(ox2, oy2, 0, ox2, oy2, w * 0.25);
    og2.addColorStop(0, rgba(CYAN, 0.11));
    og2.addColorStop(1, "rgba(0,0,0,0)");
    ctxM.fillStyle = og2;
    ctxM.fillRect(0, 0, w, h);

    raf = requestAnimationFrame(frame);
  }

  function drawStatic() {
    resize();
    drawAurora(ctxD, 1.4);
    ctxM.clearRect(0, 0, w, h);
    var i;
    for (i = 0; i < ribbons.length; i += 2) {
      ctxM.globalAlpha = 0.18;
      drawRibbon(ctxM, ribbons[i], 1.6);
      ctxM.globalAlpha = 1;
    }
  }

  function start() {
    if (running || reduce) return;
    running = true;
    t0 = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  resize();
  window.addEventListener("resize", function () {
    var prev = particles.length;
    resize();
    if (!prev) seedParticles(Math.min(90, Math.floor((w * h) / 9000)));
    if (reduce) drawStatic();
  });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else if (!reduce) start();
  });

  if (reduce) {
    deep.setAttribute("data-motion", "reduced");
    mid.setAttribute("data-motion", "reduced");
    drawStatic();
  } else {
    deep.setAttribute("data-motion", "live");
    mid.setAttribute("data-motion", "live");
    start();
  }
})();
