/**
 * Rehan Khan /rehan course catalog — dynamic Control courses + socials (desk221)
 *
 * Courses load from GET /api/catalog/courses (same KV source as Control),
 * filtered to instructor Rehan Khan / his owner emails. New published courses
 * appear automatically with banner + title. Course list is behind a single
 * accordion toggle (collapsed by default).
 *
 * Tracking:
 *   - Counts in localStorage key `bizgarhLinkClicks` (shared with /links)
 *   - Dispatches `bizgarh:link-click` CustomEvent on window
 *   - Optional window.BizgarhAnalytics.track(event, payload)
 */
(function () {
  "use strict";

  var STORAGE_KEY = "bizgarhLinkClicks";
  var CATALOG_API = "/api/catalog/courses";
  var REHAN_NAME = "Rehan Khan";
  var REHAN_EMAILS = ["rrehann3377@gmail.com", "rehan@bizgarh.in"];
  var COURSE_URL_BASE = "https://www.bizgarh.com/course?id=";
  var SLINGSHOT_FALLBACK_THUMB = "/mobile/assets/courses/slingshot-banner.jpg";

  var ARROW =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  var ICONS = {
    instagram:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.3 4h7.4A4.3 4.3 0 0 1 20 8.3v7.4A4.3 4.3 0 0 1 15.7 20H8.3A4.3 4.3 0 0 1 4 15.7V8.3A4.3 4.3 0 0 1 8.3 4zm7.4 1.6H8.3A2.7 2.7 0 0 0 5.6 8.3v7.4a2.7 2.7 0 0 0 2.7 2.7h7.4a2.7 2.7 0 0 0 2.7-2.7V8.3a2.7 2.7 0 0 0-2.7-2.7zM12 8.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5zm0 1.5A2 2 0 1 0 14 12a2 2 0 0 0-2-2zm4.1-2.7a.85.85 0 1 1-.85.85.85.85 0 0 1 .85-.85z"/></svg>',
    youtube:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.7 8.3a2.2 2.2 0 0 0-1.55-1.56C16.6 6.4 12 6.4 12 6.4s-4.6 0-6.15.34A2.2 2.2 0 0 0 4.3 8.3 22 22 0 0 0 4 12a22 22 0 0 0 .3 3.7 2.2 2.2 0 0 0 1.55 1.56C7.4 17.6 12 17.6 12 17.6s4.6 0 6.15-.34A2.2 2.2 0 0 0 19.7 15.7 22 22 0 0 0 20 12a22 22 0 0 0-.3-3.7zM10.5 14.6V9.4L15 12z"/></svg>',
    telegram:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.8 5.3 4.1 11.3c-1 .4-1 1-.2 1.3l4 1.2 1.5 4.7c.2.5.6.6 1 .4l2.2-1.8 4.2 3.1c.8.4 1.3.2 1.5-.7l2.7-13c.3-1.1-.4-1.6-1.2-1.2zM8.8 13l8.2-5.2c.4-.2.7 0 .4.3l-7 6.4-.2 2.8z"/></svg>',
    facebook:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.6 8.4h-1.5c-.6 0-.9.3-.9.9v1.5h2.3l-.3 2.4h-2V20H10v-6.8H8.2v-2.4H10V9c0-2 1.2-3.5 3.4-3.5.7 0 1.5.1 1.7.1v2.8z"/></svg>'
  };

  /** Static profile + socials; courses hydrate from Control catalog. */
  var PAGE_CONFIG = {
    name: "Rehan Khan",
    bio: "Stock Market Instructor — Forex & Indian markets. Practical process, not tips.",
    avatar: "/img/instructors/rehan-khan.jpg?v=desk221",
    socials: [
      {
        id: "social-instagram",
        label: "Instagram",
        url: "https://www.instagram.com/fxtrading.house",
        icon: "instagram"
      },
      {
        id: "social-youtube",
        label: "YouTube",
        url: "https://www.youtube.com/@trading.house.official",
        icon: "youtube"
      },
      {
        id: "social-telegram",
        label: "Telegram",
        url: "https://web.telegram.org/k/#@tradinghouseTH",
        icon: "telegram"
      },
      {
        id: "social-facebook",
        label: "Facebook",
        url: "https://www.facebook.com/fxtrading.house.official",
        icon: "facebook"
      }
    ]
  };

  /** Offline / API-failure seed — same Slingshot catalog id as Control. */
  var FALLBACK_COURSES = [
    {
      id: "slingshot",
      title: "Slingshot",
      subtitle: "The 5-Minute Trading Edge",
      url: COURSE_URL_BASE + "slingshot",
      thumb: SLINGSHOT_FALLBACK_THUMB
    }
  ];

  var state = {
    courses: FALLBACK_COURSES.slice(),
    coursesOpen: false
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

  function isRehanOwned(c) {
    if (!c) return false;
    if (String(c.id) === "slingshot") return true;
    if (String(c.instructor || "").trim() === REHAN_NAME) return true;
    var mail = String(c.ownerEmail || "").trim().toLowerCase();
    return REHAN_EMAILS.indexOf(mail) !== -1;
  }

  function isPublicCourse(c) {
    if (!c || !c.id) return false;
    if (c.deleted) return false;
    if (c.unpublished || c.status === "unlisted") return false;
    /* Ignore empty stub edits (e.g. lessons-only rows without a title). */
    var title = String(c.title || "").trim();
    if (!title && String(c.id) !== "slingshot") return false;
    return true;
  }

  function splitTitle(full) {
    var raw = String(full || "").trim() || "Course";
    var idx = raw.indexOf(":");
    if (idx > 0 && idx < raw.length - 1) {
      return {
        title: raw.slice(0, idx).trim(),
        subtitle: raw.slice(idx + 1).trim()
      };
    }
    return { title: raw, subtitle: "" };
  }

  function bannerOf(c) {
    /* Prefer packaged Slingshot asset (same bytes as Control KV) so the
       full-width contain thumb stays cacheable and title-readable. */
    if (String(c && c.id) === "slingshot") return SLINGSHOT_FALLBACK_THUMB;
    var b = String(c && c.banner || "").trim();
    if (b) return b;
    return "";
  }

  function toCard(c) {
    var parts = splitTitle(c.title || (c.id === "slingshot" ? "Slingshot: The 5-Minute Trading Edge" : c.id));
    return {
      id: "course-" + c.id,
      courseId: c.id,
      title: parts.title,
      subtitle: parts.subtitle,
      url: COURSE_URL_BASE + encodeURIComponent(c.id),
      thumb: bannerOf(c) || SLINGSHOT_FALLBACK_THUMB
    };
  }

  function coursesFromCatalog(doc) {
    var edits = (doc && doc.edits) || {};
    var extras = Array.isArray(doc && doc.extras) ? doc.extras : [];
    var hidden = (Array.isArray(doc && doc.hidden) ? doc.hidden : []).map(String);
    var byId = {};

    byId.slingshot = {
      id: "slingshot",
      title: "Slingshot: The 5-Minute Trading Edge",
      instructor: REHAN_NAME,
      ownerEmail: REHAN_EMAILS[0],
      banner: SLINGSHOT_FALLBACK_THUMB,
      unpublished: false,
      deleted: false,
      status: "published"
    };

    Object.keys(edits).forEach(function (id) {
      var e = edits[id];
      if (!e || typeof e !== "object") return;
      byId[id] = Object.assign({}, byId[id] || { id: id }, e, { id: id });
    });

    extras.forEach(function (c) {
      if (!c || !c.id) return;
      byId[c.id] = Object.assign({}, byId[c.id] || {}, c, { id: c.id });
    });

    return Object.keys(byId)
      .map(function (id) {
        return byId[id];
      })
      .filter(function (c) {
        if (hidden.indexOf(String(c.id)) !== -1) return false;
        return isRehanOwned(c) && isPublicCourse(c);
      })
      .sort(function (a, b) {
        if (a.id === "slingshot") return -1;
        if (b.id === "slingshot") return 1;
        return String(a.title || "").localeCompare(String(b.title || ""));
      })
      .map(toCard);
  }

  function renderCourses(list) {
    var nav = document.getElementById("rehanCoursesNav");
    if (!nav) return;

    if (!list || !list.length) {
      nav.innerHTML =
        '<p class="rehan-empty">Courses will appear here when published.</p>';
      return;
    }

    nav.innerHTML = list
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
          '<span class="rehan-course-thumb-wrap">' +
          '<img class="rehan-course-thumb" src="' +
          escapeHtml(item.thumb) +
          '" alt="' +
          escapeHtml(item.title) +
          '" width="800" height="450" loading="lazy" decoding="async">' +
          "</span>" +
          '<span class="rehan-course-body">' +
          '<span class="rehan-course-copy">' +
          '<span class="rehan-course-title">' +
          escapeHtml(item.title) +
          "</span>" +
          sub +
          "</span>" +
          '<span class="rehan-course-arrow">' +
          ARROW +
          "</span>" +
          "</span>" +
          "</a>"
        );
      })
      .join("");
  }

  function renderSocials() {
    var nav = document.getElementById("rehanSocialNav");
    if (!nav) return;

    nav.innerHTML = PAGE_CONFIG.socials
      .map(function (item, i) {
        var icon = ICONS[item.icon] || ICONS.instagram;
        return (
          '<a class="rehan-social" style="--i:' +
          i +
          '" href="' +
          escapeHtml(item.url) +
          '" target="_blank" rel="noopener noreferrer" data-link-id="' +
          escapeHtml(item.id) +
          '">' +
          '<span class="rehan-social-icon">' +
          icon +
          "</span>" +
          '<span class="rehan-social-label">' +
          escapeHtml(item.label) +
          "</span>" +
          '<span class="rehan-social-arrow">' +
          ARROW +
          "</span>" +
          "</a>"
        );
      })
      .join("");
  }

  function setCoursesOpen(open) {
    state.coursesOpen = !!open;
    var btn = document.getElementById("rehanCourseToggle");
    var panel = document.getElementById("rehanCoursesPanel");
    if (btn) {
      btn.setAttribute("aria-expanded", state.coursesOpen ? "true" : "false");
      btn.classList.toggle("is-open", state.coursesOpen);
    }
    if (panel) {
      if (state.coursesOpen) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "");
      panel.classList.toggle("is-open", state.coursesOpen);
    }
  }

  function bindCourseToggle() {
    var btn = document.getElementById("rehanCourseToggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var next = !state.coursesOpen;
      setCoursesOpen(next);
      trackClick("course-toggle", next ? "open" : "close");
    });
  }

  function bindTracking() {
    document.addEventListener(
      "click",
      function (ev) {
        var a = ev.target && ev.target.closest ? ev.target.closest("a[data-link-id]") : null;
        if (!a) return;
        var id = a.getAttribute("data-link-id");
        var url = a.getAttribute("href") || "";
        if (!id) return;
        trackClick(id, url);
      },
      true
    );
  }

  async function hydrateCourses() {
    try {
      var res = await fetch(CATALOG_API, {
        credentials: "same-origin",
        headers: { Accept: "application/json" }
      });
      if (!res.ok) throw new Error("catalog " + res.status);
      var doc = await res.json();
      if (!doc || doc.ok === false) throw new Error("catalog not ok");
      var list = coursesFromCatalog(doc);
      if (list.length) {
        state.courses = list;
        renderCourses(list);
      }
    } catch (e) {
      /* keep FALLBACK_COURSES already rendered */
    }
  }

  window.BizgarhRehanCatalog = {
    config: PAGE_CONFIG,
    getCourses: function () {
      return state.courses.slice();
    },
    track: trackClick,
    getCounts: readCounts,
    storageKey: STORAGE_KEY,
    refresh: hydrateCourses,
    isCoursesOpen: function () {
      return state.coursesOpen;
    },
    setCoursesOpen: setCoursesOpen
  };

  function init() {
    renderCourses(state.courses);
    renderSocials();
    setCoursesOpen(false);
    bindCourseToggle();
    bindTracking();
    hydrateCourses();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
