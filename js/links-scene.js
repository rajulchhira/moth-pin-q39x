/**
 * Bizgarh /links — lightweight canvas 3D backdrop (desk215)
 * Soft orbiting geometry projected in perspective. No external deps.
 * Pauses when prefers-reduced-motion or tab is hidden.
 */
(function () {
  "use strict";

  var canvas = document.getElementById("linksScene");
  if (!canvas || !canvas.getContext) return;

  var reduce = false;
  try {
    reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {
    reduce = false;
  }

  var ctx = canvas.getContext("2d", { alpha: true });
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var w = 0;
  var h = 0;
  var cx = 0;
  var cy = 0;
  var raf = 0;
  var t0 = performance.now();
  var running = false;

  // Soft light palette — cool mist, restrained brand tints (not glow spam)
  var COLORS = {
    sky: [150, 180, 210],
    slate: [120, 145, 175],
    indigo: [99, 102, 241],
    rose: [225, 29, 116],
    frost: [240, 245, 250]
  };

  function rgba(rgb, a) {
    return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + a + ")";
  }

  /* Perspective helpers */
  var FOV = 520;
  function project(x, y, z) {
    var zz = z + FOV;
    if (zz < 40) zz = 40;
    var s = FOV / zz;
    return { x: cx + x * s, y: cy + y * s, s: s, z: z };
  }

  function rotY(p, a) {
    var c = Math.cos(a);
    var s = Math.sin(a);
    return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
  }
  function rotX(p, a) {
    var c = Math.cos(a);
    var s = Math.sin(a);
    return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
  }
  function rotZ(p, a) {
    var c = Math.cos(a);
    var s = Math.sin(a);
    return { x: p.x * c - p.y * s, y: p.x * s + p.y * c, z: p.z };
  }

  /* Scene objects */
  var spheres = [
    { r: 78, color: COLORS.sky, orbit: 160, speed: 0.22, phase: 0.2, y: -40, bob: 18 },
    { r: 52, color: COLORS.indigo, orbit: 210, speed: -0.16, phase: 2.1, y: 30, bob: 22 },
    { r: 64, color: COLORS.rose, orbit: 140, speed: 0.13, phase: 4.0, y: 70, bob: 16 },
    { r: 36, color: COLORS.slate, orbit: 260, speed: 0.28, phase: 1.1, y: -90, bob: 26 }
  ];

  var rings = [
    { major: 170, minor: 12, speed: 0.18, tiltX: 0.85, tiltZ: 0.25, color: COLORS.slate, alpha: 0.55 },
    { major: 220, minor: 9, speed: -0.12, tiltX: 1.15, tiltZ: -0.4, color: COLORS.indigo, alpha: 0.4 },
    { major: 130, minor: 8, speed: 0.25, tiltX: 0.55, tiltZ: 0.7, color: COLORS.rose, alpha: 0.32 }
  ];

  var panels = [
    { w: 90, h: 56, orbit: 190, speed: 0.15, phase: 0.6, y: -20, color: COLORS.frost },
    { w: 70, h: 70, orbit: 240, speed: -0.11, phase: 2.8, y: 50, color: COLORS.sky },
    { w: 80, h: 48, orbit: 160, speed: 0.2, phase: 4.5, y: -70, color: COLORS.frost }
  ];

  function resize() {
    var rect = canvas.parentElement.getBoundingClientRect();
    w = Math.max(1, Math.floor(rect.width));
    h = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = w * 0.5;
    cy = h * 0.42;
  }

  function drawSphere(p, radius, color, depthAlpha) {
    var pr = project(p.x, p.y, p.z);
    var R = radius * pr.s;
    if (R < 2) return;
    var g = ctx.createRadialGradient(
      pr.x - R * 0.28,
      pr.y - R * 0.32,
      R * 0.08,
      pr.x,
      pr.y,
      R
    );
    var a = depthAlpha * (0.35 + 0.45 * Math.min(1, pr.s));
    g.addColorStop(0, rgba([255, 255, 255], a * 0.95));
    g.addColorStop(0.35, rgba(color, a * 0.7));
    g.addColorStop(0.78, rgba(color, a * 0.28));
    g.addColorStop(1, rgba(color, 0));
    ctx.beginPath();
    ctx.arc(pr.x, pr.y, R, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  }

  function drawRing(angle, ring) {
    var steps = 64;
    var pts = [];
    var i;
    for (i = 0; i <= steps; i++) {
      var u = (i / steps) * Math.PI * 2;
      var p = {
        x: Math.cos(u) * ring.major,
        y: 0,
        z: Math.sin(u) * ring.major
      };
      p = rotY(p, angle);
      p = rotX(p, ring.tiltX);
      p = rotZ(p, ring.tiltZ + angle * 0.35);
      pts.push(project(p.x, p.y, p.z));
    }
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.strokeStyle = rgba(ring.color, ring.alpha);
    ctx.lineWidth = Math.max(1.5, ring.minor * (pts[0].s + pts[Math.floor(steps / 2)].s) * 0.5);
    ctx.lineJoin = "round";
    ctx.stroke();
  }

  function drawPanel(p, pw, ph, color, spin) {
    var corners = [
      { x: -pw / 2, y: -ph / 2, z: 0 },
      { x: pw / 2, y: -ph / 2, z: 0 },
      { x: pw / 2, y: ph / 2, z: 0 },
      { x: -pw / 2, y: ph / 2, z: 0 }
    ];
    var i;
    var world = [];
    for (i = 0; i < 4; i++) {
      var q = rotZ(corners[i], spin);
      q = rotY(q, spin * 0.6);
      q = { x: q.x + p.x, y: q.y + p.y, z: q.z + p.z };
      world.push(project(q.x, q.y, q.z));
    }
    var avgS = (world[0].s + world[1].s + world[2].s + world[3].s) / 4;
    var a = 0.18 + 0.22 * Math.min(1, avgS);
    ctx.beginPath();
    ctx.moveTo(world[0].x, world[0].y);
    for (i = 1; i < 4; i++) ctx.lineTo(world[i].x, world[i].y);
    ctx.closePath();
    ctx.fillStyle = rgba(color, a);
    ctx.fill();
    ctx.strokeStyle = rgba(COLORS.slate, a * 0.7);
    ctx.lineWidth = 1.25;
    ctx.stroke();
  }

  function frame(now) {
    if (!running) return;
    var t = (now - t0) / 1000;
    ctx.clearRect(0, 0, w, h);

    // Soft base wash on canvas (extra depth under blur)
    var bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, "rgba(232, 240, 248, 0.55)");
    bg.addColorStop(0.55, "rgba(236, 240, 247, 0.25)");
    bg.addColorStop(1, "rgba(210, 222, 236, 0.5)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Rings first (behind)
    for (var r = 0; r < rings.length; r++) {
      drawRing(t * rings[r].speed, rings[r]);
    }

    // Collect drawable spheres + panels with depth for sort
    var drawables = [];
    var i;
    for (i = 0; i < spheres.length; i++) {
      var s = spheres[i];
      var ang = t * s.speed + s.phase;
      var sp = {
        x: Math.cos(ang) * s.orbit,
        y: s.y + Math.sin(t * 0.7 + s.phase) * s.bob,
        z: Math.sin(ang) * s.orbit * 0.85
      };
      drawables.push({ z: sp.z, kind: "sphere", p: sp, obj: s });
    }
    for (i = 0; i < panels.length; i++) {
      var pn = panels[i];
      var pang = t * pn.speed + pn.phase;
      var pp = {
        x: Math.cos(pang) * pn.orbit,
        y: pn.y + Math.sin(t * 0.55 + pn.phase) * 14,
        z: Math.sin(pang) * pn.orbit * 0.9
      };
      drawables.push({ z: pp.z, kind: "panel", p: pp, obj: pn, spin: t * pn.speed * 1.4 + pn.phase });
    }
    drawables.sort(function (a, b) {
      return a.z - b.z;
    });

    for (i = 0; i < drawables.length; i++) {
      var d = drawables[i];
      if (d.kind === "sphere") {
        drawSphere(d.p, d.obj.r, d.obj.color, 0.9);
      } else {
        drawPanel(d.p, d.obj.w, d.obj.h, d.obj.color, d.spin);
      }
    }

    raf = requestAnimationFrame(frame);
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

  function drawStatic() {
    resize();
    ctx.clearRect(0, 0, w, h);
    var g = ctx.createRadialGradient(cx, cy, 20, cx, cy, Math.max(w, h) * 0.55);
    g.addColorStop(0, "rgba(255,255,255,0.5)");
    g.addColorStop(0.45, "rgba(200,218,236,0.35)");
    g.addColorStop(1, "rgba(180,198,220,0.2)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // One still ring for depth cue
    drawRing(0.6, rings[0]);
    drawSphere({ x: -40, y: -20, z: 40 }, 70, COLORS.sky, 0.7);
    drawSphere({ x: 80, y: 40, z: -30 }, 48, COLORS.indigo, 0.55);
  }

  resize();
  window.addEventListener("resize", function () {
    resize();
    if (reduce) drawStatic();
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else if (!reduce) start();
  });

  if (reduce) {
    canvas.setAttribute("data-motion", "reduced");
    drawStatic();
  } else {
    canvas.setAttribute("data-motion", "live");
    start();
  }
})();
