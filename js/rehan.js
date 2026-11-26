/**
 * Rehan Khan /rehan course catalog — config + click tracking (desk218)
 *
 * Parallel to /links. Customize:
 *   - COURSES_CONFIG.courses → titles / urls / thumbs
 *   - css/rehan.css :root → brand colors & atmosphere
 *
 * Tracking:
 *   - Counts in localStorage key `bizgarhLinkClicks` (shared with /links)
 *   - Dispatches `bizgarh:link-click` CustomEvent on window
 *   - Optional window.BizgarhAnalytics.track(event, payload)
 */
(function () {
  "use strict";

  var STORAGE_KEY = "bizgarhLinkClicks";

  var ARROW =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  /** Edit courses here — order = display order. Thumb = live Slingshot Strategy asset. */
  var COURSES_CONFIG = {
    name: "Rehan Khan",
    bio: "Stock Market Instructor — Forex & Indian markets. Practical process, not tips.",
    /* Same bytes as Control instructors KV edits.rehan-khan.photo */
    avatar: "/img/instructors/rehan-khan.jpg?v=desk218",
    courses: [
      {
        id: "course-slingshot",
        title: "Slingshot",
        subtitle: "The 5-Minute Trading Edge",
        url: "https://www.bizgarh.com/course?id=slingshot",
        thumb: "/mobile/assets/courses/slingshot-banner.jpg"
      }
    ]
  };

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function readCounts() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
    } catch (e) {
      return {};
    }
  }

  function writeCounts(map) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch (e) {
      /* private mode / quota — ignore */
    }
  }

  function trackClick(id, url) {
    var counts = readCounts();
    counts[id] = (counts[id] || 0) + 1;
    writeCounts(counts);

    var detail = {
      id: id,
      url: url,
      count: counts[id],
      ts: Date.now(),
      path: "/rehan"
    };

    try {
      window.dispatchEvent(new CustomEvent("bizgarh:link-click", { detail: detail }));
    } catch (e) {
      /* older browsers */
    }

    try {
      if (window.BizgarhAnalytics && typeof window.BizgarhAnalytics.track === "function") {
        window.BizgarhAnalytics.track("link_click", detail);
      }
    } catch (e) {
      /* optional hook */
    }

    return detail;
  }

  function render() {
    var nav = document.getElementById("rehanCoursesNav");
    if (!nav) return;

    nav.innerHTML = COURSES_CONFIG.courses
      .map(function (item, i) {
        var sub = item.subtitle
          ? '<span class="rehan-course-sub">' + escapeHtml(item.subtitle) + "</span>"
          : "";
        return (
          '<a class="rehan-course" style="--i:' +
          i +
          '" href="' +
          escapeHtml(item.url) +
          '" target="_blank" rel="noopener noreferrer" data-link-id="' +
          escapeHtml(item.id) +
          '">' +
          '<img class="rehan-course-thumb" src="' +
          escapeHtml(item.thumb) +
          '" alt="" width="112" height="74" loading="lazy" decoding="async">' +
          '<span class="rehan-course-copy">' +
          '<span class="rehan-course-title">' +
          escapeHtml(item.title) +
          "</span>" +
          sub +
          "</span>" +
          '<span class="rehan-course-arrow">' +
          ARROW +
          "</span>" +
          "</a>"
        );
      })
      .join("");
  }

  function bindTracking() {
    document.addEventListener(
      "click",
      function (ev) {
        var a = ev.target && ev.target.closest ? ev.target.closest("[data-link-id]") : null;
        if (!a) return;
        var id = a.getAttribute("data-link-id");
        var url = a.getAttribute("href") || "";
        if (!id) return;
        trackClick(id, url);
      },
      true
    );
  }

  window.BizgarhRehanCatalog = {
    config: COURSES_CONFIG,
    track: trackClick,
    getCounts: readCounts,
    storageKey: STORAGE_KEY
  };

  function init() {
    render();
    bindTracking();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
