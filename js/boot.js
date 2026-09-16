(function () {
  try {
    if (location.hostname === "bizgarh.com") {
      location.replace("https://www.bizgarh.com" + location.pathname + location.search + location.hash);
      return;
    }
    var path = (location.pathname || "/").replace(/\.html$/i, "").replace(/\/$/, "") || "/";
    if (path === "/" || path === "/index") {
      var raw = localStorage.getItem("tradeshalaUser");
      var user = raw ? JSON.parse(raw) : null;
      if (user && user.email) {
        location.replace("/dashboard");
        return;
      }
    }
  } catch (e) { /* stay on public home */ }

  var BOOT = "bgBoot";
  var WAIT = "bgWait";
  var hidden = false;
  var painted = false;
  var minOk = false;

  document.documentElement.classList.add("bg-booting");

  if (!document.getElementById("bgBootCss")) {
    var css = document.createElement("style");
    css.id = "bgBootCss";
    css.textContent =
      "html.bg-waiting{overflow:hidden}" +
      "#bgBoot,#bgWait{position:fixed;inset:0;z-index:4000;display:grid;place-items:center;background:#fff;transition:opacity .38s ease,visibility .38s}" +
      "#bgWait{background:rgba(255,255,255,.88);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}" +
      "#bgBoot.is-out,#bgWait.is-out{opacity:0;visibility:hidden;pointer-events:none}" +
      ".bg-loader{width:88px;height:88px;display:grid;place-items:center;animation:bgBreathe 1.7s ease-in-out infinite}" +
      ".bg-loader svg{width:100%;height:100%;display:block;overflow:visible}" +
      ".bg-loader-ring{transform-box:view-box;transform-origin:47.92% 52.92%;animation:bgOrbit 1.25s linear infinite}" +
      ".bg-loader--md{width:56px;height:56px}" +
      ".bg-loader--sm{width:36px;height:36px}" +
      "@keyframes bgOrbit{to{transform:rotate(360deg)}}" +
      "@keyframes bgBreathe{0%,100%{filter:drop-shadow(0 0 10px rgba(79,70,229,.38)) drop-shadow(0 0 22px rgba(225,29,116,.22))}50%{filter:drop-shadow(0 0 18px rgba(79,70,229,.7)) drop-shadow(0 0 36px rgba(225,29,116,.42))}}" +
      "@media (prefers-reduced-motion:reduce){.bg-loader,.bg-loader-ring{animation:none}}";
    document.head.appendChild(css);
  }

  function svg() {
    var n = "bl" + Math.random().toString(36).slice(2, 8);
    var g = n + "g";
    var glass = n + "s";
    var clip = n + "c";
    return (
      '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">' +
      "<defs>" +
      '<linearGradient id="' + g + '" x1="8" y1="40" x2="38" y2="8" gradientUnits="userSpaceOnUse">' +
      '<stop offset="0" stop-color="#4F46E5"/>' +
      '<stop offset=".46" stop-color="#7C3AED"/>' +
      '<stop offset="1" stop-color="#E11D74"/>' +
      "</linearGradient>" +
      '<linearGradient id="' + glass + '" x1="14" y1="12" x2="30" y2="36">' +
      '<stop offset="0" stop-color="#fff" stop-opacity=".24"/>' +
      '<stop offset="1" stop-color="#fff" stop-opacity="0"/>' +
      "</linearGradient>" +
      '<clipPath id="' + clip + '"><circle cx="23" cy="25.4" r="16.35"/></clipPath>' +
      "</defs>" +
      '<g class="bg-loader-ring">' +
      '<circle cx="23" cy="25.4" r="20.35" fill="none" stroke="url(#' + g + ')" stroke-width="2"/>' +
      '<circle cx="36.35" cy="9.85" r="3.55" fill="#fff"/>' +
      '<circle cx="36.35" cy="9.85" r="2.55" fill="#E11D74"/>' +
      '<circle cx="36.35" cy="9.85" r="1.05" fill="#fff"/>' +
      "</g>" +
      '<circle cx="23" cy="25.4" r="16.55" fill="url(#' + g + ')"/>' +
      '<ellipse cx="18.4" cy="20" rx="8.4" ry="5.8" fill="url(#' + glass + ')"/>' +
      '<circle cx="23" cy="25.4" r="15.45" stroke="#fff" stroke-width="1" opacity=".32"/>' +
      '<path fill="#fff" d="M14.35 35.05V21.15C14.35 15.2 18.15 11.85 23 11.85S31.65 15.2 31.65 21.15v13.9h-4.05V22.85c0-2.85-2-4.95-4.6-4.95s-4.6 2.1-4.6 4.95v12.2h-4.05Z"/>' +
      '<g clip-path="url(#' + clip + ')">' +
      '<path d="M18.9 30.35 21.95 25.15 24.85 27.2 28.85 19.55" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path fill="#fff" d="M27.55 18.05 31.35 17.35 29.55 21.45Z"/>' +
      "</g>" +
      "</svg>"
    );
  }

  function html(mod) {
    return '<span class="bg-loader ' + (mod || "") + '" aria-hidden="true">' + svg() + "</span>";
  }

  function mountBoot() {
    if (!document.body) return;
    var el = document.getElementById(BOOT);
    if (!el) {
      el = document.createElement("div");
      el.id = BOOT;
      el.setAttribute("aria-busy", "true");
      el.setAttribute("aria-label", "Loading Bizgarh");
      document.body.insertBefore(el, document.body.firstChild);
    }
    if (!el.querySelector(".bg-loader")) el.innerHTML = html("bg-loader--lg");
  }

  function hideBoot() {
    if (hidden) return;
    hidden = true;
    document.documentElement.classList.remove("bg-booting");
    var el = document.getElementById(BOOT);
    if (!el) return;
    el.classList.add("is-out");
    setTimeout(function () {
      el.remove();
    }, 420);
  }

  function maybeHide() {
    if (painted && minOk) hideBoot();
  }

  function mountWait() {
    var el = document.getElementById(WAIT);
    if (el) {
      el.classList.remove("is-out");
      document.documentElement.classList.add("bg-waiting");
      return;
    }
    if (!document.body) return;
    document.documentElement.classList.add("bg-waiting");
    el = document.createElement("div");
    el.id = WAIT;
    el.setAttribute("aria-busy", "true");
    el.setAttribute("aria-label", "Loading");
    el.innerHTML = html("bg-loader--lg");
    document.body.appendChild(el);
  }

  function hideWait() {
    document.documentElement.classList.remove("bg-waiting");
    var el = document.getElementById(WAIT);
    if (!el) return;
    el.classList.add("is-out");
    setTimeout(function () {
      el.remove();
    }, 420);
  }

  if (document.body) mountBoot();
  else {
    var obs = new MutationObserver(function () {
      if (document.body) {
        obs.disconnect();
        mountBoot();
      }
    });
    obs.observe(document.documentElement, { childList: true });
  }

  function readyHide() {
    painted = true;
    minOk = true;
    hideBoot();
  }
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(readyHide, 0);
  } else {
    document.addEventListener("DOMContentLoaded", readyHide);
  }
  setTimeout(readyHide, 400);

  window.BizgarhLoader = {
    html: html,
    svg: svg,
    done: function () {
      painted = true;
      maybeHide();
    },
    show: mountWait,
    hide: hideWait
  };
})();
