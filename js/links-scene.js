/**
 * Bizgarh /links — dark nebula + crystal backdrop (desk216)
 * Canvas 2D, no deps. Medium-speed fluid ribbons, drifting glass shards,
 * glowing particles. Deep layer is CSS-blurred; UI stays sharp above.
 * prefers-reduced-motion / hidden tab → static or paused.
 */
(function () {
  "use strict";

  var deep = document.getElementById("linksSceneDeep");
  var mid = document.getElementById("linksSceneMid");
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
  var cx = 0;
  var cy = 0;
  var raf = 0;
  var t0 = performance.now();
  var running = false;

  var TEAL = [45, 212, 191];
  var EMERALD = [16, 185, 129];
  var MAGENTA = [232, 48, 152];
  var PURPLE = [139, 92, 246];
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

  var FOV = 560;
  function project(x, y, z) {
    var zz = z + FOV;
    if (zz < 50) zz = 50;
    var s = FOV / zz;
    return { x: cx + x * s, y: cy + y * s, s: s, z: z };
  }
  function rotX(p, a) {
    var c = Math.cos(a);
    var s = Math.sin(a);
    return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
  }
  function rotY(p, a) {
    var c = Math.cos(a);
    var s = Math.sin(a);
    return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
  }
  function rotZ(p, a) {
    var c = Math.cos(a);
    var s = Math.sin(a);
    return { x: p.x * c - p.y * s, y: p.x * s + p.y * c, z: p.z };
  }

  /* Fluid ribbon control points (undulate over time) */
  var ribbons = [
    {
      amp: 0.22,
      speed: 0.55,
      phase: 0.2,
      y0: 0.28,
      thick: 0.38,
      c0: PURPLE,
      c1: MAGENTA,
      alpha: 0.55
    },
    {
      amp: 0.18,
      speed: 0.42,
      phase: 1.7,
      y0: 0.48,
      thick: 0.42,
      c0: MAGENTA,
      c1: TEAL,
      alpha: 0.5
    },
    {
      amp: 0.2,
      speed: 0.48,
      phase: 3.4,
      y0: 0.62,
      thick: 0.36,
      c0: TEAL,
      c1: EMERALD,
      alpha: 0.48
    },
    {
      amp: 0.14,
      speed: 0.35,
      phase: 5.1,
      y0: 0.4,
      thick: 0.28,
      c0: PURPLE,
      c1: TEAL,
      alpha: 0.32
    }
  ];

  /* Crystal polyhedra — octahedron + pyramid verts */
  function octahedron(size) {
    return [
      { x: 0, y: -size, z: 0 },
      { x: size, y: 0, z: 0 },
      { x: 0, y: 0, z: size },
      { x: -size, y: 0, z: 0 },
      { x: 0, y: 0, z: -size },
      { x: 0, y: size, z: 0 }
    ];
  }
  var OCTA_FACES = [
    [0, 1, 2],
    [0, 2, 3],
    [0, 3, 4],
    [0, 4, 1],
    [5, 2, 1],
    [5, 3, 2],
    [5, 4, 3],
    [5, 1, 4]
  ];

  var crystals = [
    { size: 52, x: -180, y: -40, z: 40, rx: 0.4, ry: 0.55, rz: 0.2, drift: 18, tint: TEAL },
    { size: 38, x: 160, y: 20, z: -20, rx: -0.35, ry: 0.45, rz: 0.3, drift: 22, tint: MAGENTA },
    { size: 44, x: 40, y: -110, z: 80, rx: 0.5, ry: -0.4, rz: 0.15, drift: 16, tint: PURPLE },
    { size: 28, x: -90, y: 90, z: -60, rx: 0.25, ry: 0.6, rz: -0.35, drift: 26, tint: EMERALD },
    { size: 34, x: 200, y: -80, z: 10, rx: -0.45, ry: 0.3, rz: 0.4, drift: 20, tint: TEAL },
    { size: 24, x: -220, y: 50, z: -90, rx: 0.55, ry: -0.25, rz: 0.2, drift: 30, tint: MAGENTA },
    { size: 30, x: 110, y: 110, z: 50, rx: 0.3, ry: 0.5, rz: -0.2, drift: 18, tint: PURPLE }
  ];

  var particles = [];
  function seedParticles(n) {
    particles = [];
    var i;
    for (i = 0; i < n; i++) {
      particles.push({
        x: (Math.random() - 0.5) * w * 1.4,
        y: (Math.random() - 0.5) * h * 1.4,
        z: (Math.random() - 0.5) * 320,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 10,
        phase: Math.random() * Math.PI * 2,
        tw: 0.6 + Math.random() * 1.4,
        link: Math.random() > 0.72
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
    cx = w * 0.5;
    cy = h * 0.45;
    if (!particles.length) seedParticles(Math.min(160, Math.floor((w * h) / 4500)));
  }

  function drawNebula(ctx, t) {
    ctx.fillStyle = "#0a0e18";
    ctx.fillRect(0, 0, w, h);

    // Soft vignette glow pools
    var g1 = ctx.createRadialGradient(w * 0.28, h * 0.4, 0, w * 0.28, h * 0.4, w * 0.55);
    g1.addColorStop(0, rgba(PURPLE, 0.35));
    g1.addColorStop(0.55, rgba(MAGENTA, 0.12));
    g1.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, w, h);

    var g2 = ctx.createRadialGradient(w * 0.78, h * 0.55, 0, w * 0.78, h * 0.55, w * 0.5);
    g2.addColorStop(0, rgba(TEAL, 0.32));
    g2.addColorStop(0.5, rgba(EMERALD, 0.12));
    g2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, w, h);

    var i;
    for (i = 0; i < ribbons.length; i++) {
      drawRibbon(ctx, ribbons[i], t);
    }
  }

  function drawRibbon(ctx, r, t) {
    var steps = 48;
    var ptsTop = [];
    var ptsBot = [];
    var i;
    for (i = 0; i <= steps; i++) {
      var u = i / steps;
      var x = u * w * 1.2 - w * 0.1;
      var wave =
        Math.sin(u * Math.PI * 2.2 + t * r.speed + r.phase) * r.amp * h +
        Math.sin(u * Math.PI * 1.1 - t * r.speed * 0.7 + r.phase) * r.amp * h * 0.45;
      var y = r.y0 * h + wave;
      var th = r.thick * h * (0.55 + 0.45 * Math.sin(u * Math.PI));
      ptsTop.push({ x: x, y: y - th * 0.5 });
      ptsBot.push({ x: x, y: y + th * 0.5 });
    }
    ctx.beginPath();
    ctx.moveTo(ptsTop[0].x, ptsTop[0].y);
    for (i = 1; i < ptsTop.length; i++) ctx.lineTo(ptsTop[i].x, ptsTop[i].y);
    for (i = ptsBot.length - 1; i >= 0; i--) ctx.lineTo(ptsBot[i].x, ptsBot[i].y);
    ctx.closePath();

    var grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, rgba(r.c0, r.alpha));
    grd.addColorStop(0.5, rgba(mix(r.c0, r.c1, 0.5), r.alpha * 0.85));
    grd.addColorStop(1, rgba(r.c1, r.alpha * 0.7));
    ctx.fillStyle = grd;
    ctx.fill();

    // Bloom highlight along ridge
    ctx.beginPath();
    ctx.moveTo(ptsTop[0].x, (ptsTop[0].y + ptsBot[0].y) * 0.5);
    for (i = 1; i < ptsTop.length; i++) {
      var my = (ptsTop[i].y + ptsBot[i].y) * 0.5;
      ctx.lineTo(ptsTop[i].x, my);
    }
    ctx.strokeStyle = rgba(WHITE, 0.12);
    ctx.lineWidth = 6;
    ctx.stroke();
  }

  function drawCrystal(ctx, cr, t) {
    var base = octahedron(cr.size);
    var angX = t * cr.rx + cr.drift * 0.01;
    var angY = t * cr.ry;
    var angZ = t * cr.rz * 0.8;
    var ox = cr.x + Math.sin(t * 0.45 + cr.drift) * cr.drift;
    var oy = cr.y + Math.cos(t * 0.38 + cr.drift * 0.5) * (cr.drift * 0.6);
    var oz = cr.z + Math.sin(t * 0.3 + cr.x * 0.01) * 20;

    var world = [];
    var i;
    for (i = 0; i < base.length; i++) {
      var p = rotZ(rotY(rotX(base[i], angX), angY), angZ);
      p = { x: p.x + ox, y: p.y + oy, z: p.z + oz };
      world.push({ local: p, pr: project(p.x, p.y, p.z) });
    }

    var faces = [];
    for (i = 0; i < OCTA_FACES.length; i++) {
      var f = OCTA_FACES[i];
      var a = world[f[0]].local;
      var b = world[f[1]].local;
      var c = world[f[2]].local;
      var nx = (b.y - a.y) * (c.z - a.z) - (b.z - a.z) * (c.y - a.y);
      var ny = (b.z - a.z) * (c.x - a.x) - (b.x - a.x) * (c.z - a.z);
      var nz = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
      var midZ = (a.z + b.z + c.z) / 3;
      // Camera looks from -Z toward origin-ish; keep faces with outward toward viewer
      if (nz > -5) continue;
      var nlen = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      var light = Math.max(0.15, Math.min(1, (-nx * 0.2 - ny * 0.35 - nz * 0.9) / nlen));
      faces.push({
        i0: f[0],
        i1: f[1],
        i2: f[2],
        z: midZ,
        light: light
      });
    }
    faces.sort(function (u, v) {
      return u.z - v.z;
    });

    for (i = 0; i < faces.length; i++) {
      var face = faces[i];
      var p0 = world[face.i0].pr;
      var p1 = world[face.i1].pr;
      var p2 = world[face.i2].pr;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.closePath();
      var fillA = 0.12 + face.light * 0.28;
      var col = mix(WHITE, cr.tint, 0.55 + face.light * 0.35);
      ctx.fillStyle = rgba(col, fillA);
      ctx.fill();
      ctx.strokeStyle = rgba(mix(WHITE, cr.tint, 0.4), 0.35 + face.light * 0.35);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function drawParticles(ctx, t, layer) {
    var pts = [];
    var i;
    for (i = 0; i < particles.length; i++) {
      var p = particles[i];
      var px = p.x + Math.sin(t * 0.5 + p.phase) * p.vx * 4;
      var py = p.y + Math.cos(t * 0.4 + p.phase) * p.vy * 4 + t * 4 * (layer === "deep" ? 0.4 : 0.8);
      // wrap vertically slowly
      var yy = ((py + h) % (h * 1.6)) - h * 0.3;
      var pr = project(px * 0.55, yy * 0.55, p.z);
      var tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * p.tw + p.phase));
      pts.push({ x: pr.x, y: pr.y, z: p.z, a: tw, link: p.link, s: pr.s });
    }

    // constellation lines among linked near particles
    if (layer === "mid") {
      ctx.lineWidth = 0.6;
      for (i = 0; i < pts.length; i++) {
        if (!pts[i].link) continue;
        var j;
        var linked = 0;
        for (j = i + 1; j < pts.length && linked < 2; j++) {
          if (!pts[j].link) continue;
          var dx = pts[i].x - pts[j].x;
          var dy = pts[i].y - pts[j].y;
          var dist = Math.hypot(dx, dy);
          if (dist < 90) {
            ctx.strokeStyle = rgba(WHITE, 0.08 * (1 - dist / 90) * pts[i].a);
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
            linked++;
          }
        }
      }
    }

    for (i = 0; i < pts.length; i++) {
      var q = pts[i];
      var r = Math.max(0.6, 1.6 * q.s * (layer === "mid" ? 1.2 : 0.9));
      var g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, r * 3);
      g.addColorStop(0, rgba(WHITE, 0.85 * q.a));
      g.addColorStop(0.35, rgba(TEAL, 0.25 * q.a));
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(q.x, q.y, r * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function frame(now) {
    if (!running) return;
    var t = (now - t0) / 1000;

    drawNebula(ctxD, t);
    drawParticles(ctxD, t, "deep");

    ctxM.clearRect(0, 0, w, h);
    // Soft mid nebula echo (lighter)
    var i;
    for (i = 0; i < ribbons.length; i += 2) {
      var rr = ribbons[i];
      ctxM.globalAlpha = 0.22;
      drawRibbon(ctxM, rr, t * 1.05 + 0.4);
      ctxM.globalAlpha = 1;
    }

    var sorted = crystals.slice().sort(function (a, b) {
      return a.z - b.z;
    });
    for (i = 0; i < sorted.length; i++) drawCrystal(ctxM, sorted[i], t);
    drawParticles(ctxM, t, "mid");

    raf = requestAnimationFrame(frame);
  }

  function drawStatic() {
    resize();
    drawNebula(ctxD, 1.2);
    drawParticles(ctxD, 1.2, "deep");
    ctxM.clearRect(0, 0, w, h);
    var i;
    for (i = 0; i < crystals.length; i++) drawCrystal(ctxM, crystals[i], 1.2);
    drawParticles(ctxM, 1.2, "mid");
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
    if (!prev) seedParticles(Math.min(160, Math.floor((w * h) / 4500)));
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
