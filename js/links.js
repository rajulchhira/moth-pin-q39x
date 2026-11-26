/**
 * Bizgarh /links hub — config + lightweight click tracking (desk215)
 *
 * Customize:
 *   - LINKS_CONFIG.links → labels / urls / icons
 *   - css/links.css :root → brand colors & background atmosphere
 *
 * Tracking:
 *   - Counts stored in localStorage key `bizgarhLinkClicks`
 *   - Dispatches `bizgarh:link-click` CustomEvent on window
 *   - Optional window.BizgarhAnalytics.track(event, payload) hook if present
 */
(function () {
  "use strict";

  var STORAGE_KEY = "bizgarhLinkClicks";

  var ICONS = {
    website:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm7.4 9h-3.1a14.6 14.6 0 0 0-1.3-5.1A8 8 0 0 1 19.4 11zM12 4c.9 0 2.3 1.9 3 5H9c.7-3.1 2.1-5 3-5zM4.6 13h3.1c.2 1.8.7 3.5 1.3 5.1A8 8 0 0 1 4.6 13zm3.1-2H4.6a8 8 0 0 1 4.4-5.1A14.6 14.6 0 0 0 7.7 11zM12 20c-.9 0-2.3-1.9-3-5h6c-.7 3.1-2.1 5-3 5zm1.6-2a14.6 14.6 0 0 0 1.3-5h3.1a8 8 0 0 1-4.4 5zM9.9 13c.2 1.4.6 2.8 1.1 4h2c.5-1.2.9-2.6 1.1-4H9.9zm0-2h4.2c-.2-1.4-.6-2.8-1.1-4h-2c-.5 1.2-.9 2.6-1.1 4z"/></svg>',
    instagram:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.3 4h7.4A4.3 4.3 0 0 1 20 8.3v7.4A4.3 4.3 0 0 1 15.7 20H8.3A4.3 4.3 0 0 1 4 15.7V8.3A4.3 4.3 0 0 1 8.3 4zm7.4 1.6H8.3A2.7 2.7 0 0 0 5.6 8.3v7.4a2.7 2.7 0 0 0 2.7 2.7h7.4a2.7 2.7 0 0 0 2.7-2.7V8.3a2.7 2.7 0 0 0-2.7-2.7zM12 8.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5zm0 1.5A2 2 0 1 0 14 12a2 2 0 0 0-2-2zm4.1-2.7a.85.85 0 1 1-.85.85.85.85 0 0 1 .85-.85z"/></svg>',
    youtube:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.7 8.3a2.2 2.2 0 0 0-1.55-1.56C16.6 6.4 12 6.4 12 6.4s-4.6 0-6.15.34A2.2 2.2 0 0 0 4.3 8.3 22 22 0 0 0 4 12a22 22 0 0 0 .3 3.7 2.2 2.2 0 0 0 1.55 1.56C7.4 17.6 12 17.6 12 17.6s4.6 0 6.15-.34A2.2 2.2 0 0 0 19.7 15.7 22 22 0 0 0 20 12a22 22 0 0 0-.3-3.7zM10.5 14.6V9.4L15 12z"/></svg>',
    telegram:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.8 5.3 4.1 11.3c-1 .4-1 1-.2 1.3l4 1.2 1.5 4.7c.2.5.6.6 1 .4l2.2-1.8 4.2 3.1c.8.4 1.3.2 1.5-.7l2.7-13c.3-1.1-.4-1.6-1.2-1.2zM8.8 13l8.2-5.2c.4-.2.7 0 .4.3l-7 6.4-.2 2.8z"/></svg>',
    facebook:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.6 8.4h-1.5c-.6 0-.9.3-.9.9v1.5h2.3l-.3 2.4h-2V20H10v-6.8H8.2v-2.4H10V9c0-2 1.2-3.5 3.4-3.5.7 0 1.5.1 1.7.1v2.8z"/></svg>'
  };

  var ARROW =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  /** Edit labels / URLs here — order = display order */
  var LINKS_CONFIG = {
    brand: "Bizgarh",
    bio: "Creator-driven learning for Indian traders — process, risk, and journals. Not tips.",
    links: [
      { id: "website", label: "Official Website", url: "https://www.bizgarh.com/", icon: "website" },
      { id: "instagram", label: "Instagram", url: "https://www.instagram.com/bizgarh", icon: "instagram" },
      { id: "youtube", label: "YouTube", url: "https://www.youtube.com/@bizgarh", icon: "youtube" },
      { id: "telegram", label: "Telegram", url: "https://t.me/bizgarh", icon: "telegram" },
      { id: "facebook", label: "Facebook", url: "https://www.facebook.com/bizgarh", icon: "facebook" }
    ]
  };

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
      path: "/links"
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
    var nav = document.getElementById("bizgarhLinksNav");
    if (!nav) return;

    nav.innerHTML = LINKS_CONFIG.links
      .map(function (item, i) {
        var icon = ICONS[item.icon] || ICONS.website;
        return (
          '<a class="links-btn" style="--i:' +
          i +
          '" href="' +
          item.url +
          '" target="_blank" rel="noopener noreferrer" data-link-id="' +
          item.id +
          '">' +
          '<span class="links-btn-icon">' +
          icon +
          "</span>" +
          '<span class="links-btn-label">' +
          item.label +
          "</span>" +
          '<span class="links-btn-arrow">' +
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

  window.BizgarhLinks = {
    config: LINKS_CONFIG,
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
