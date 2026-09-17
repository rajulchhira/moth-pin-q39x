(function () {
  var ORIGIN = "https://www.bizgarh.com";
  var BRAND = "Bizgarh";
  var IMG = ORIGIN + "/img/bizgarh-lockup.png";
  var ICON = ORIGIN + "/img/favicon-512.png?v=logo2";
  var LOGO = ORIGIN + "/img/bizgarh-mark.svg?v=logo2";

  function pathOf() {
    var p = (location.pathname || "/").replace(/\.html$/i, "").replace(/\/+$/, "");
    return p || "/";
  }
  function q(name) {
    try { return new URLSearchParams(location.search).get(name) || ""; } catch (e) { return ""; }
  }
  function abs(path) {
    if (!path) return ORIGIN + "/";
    if (/^https?:/i.test(path)) return path;
    return ORIGIN + (path.charAt(0) === "/" ? path : "/" + path);
  }
  function setAttr(el, key, val, kind) {
    if (!val) return;
    if (kind === "prop") el.setAttribute("property", key);
    else el.setAttribute("name", key);
    el.setAttribute("content", val);
  }
  function upsert(kind, key, val) {
    if (!val) return;
    var sel = kind === "prop" ? 'meta[property="' + key + '"]' : 'meta[name="' + key + '"]';
    var el = document.head.querySelector(sel);
    if (!el) {
      el = document.createElement("meta");
      document.head.appendChild(el);
    }
    setAttr(el, key, val, kind);
  }
  function upsertLink(rel, href, extra, attrs) {
    if (!href) return;
    var el = document.head.querySelector('link[rel="' + rel + '"]' + (extra || ""));
    if (!el) {
      el = document.createElement("link");
      el.setAttribute("rel", rel);
      document.head.appendChild(el);
    }
    el.setAttribute("href", href);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (attrs[k]) el.setAttribute(k, attrs[k]);
      });
    }
  }
  function ld(data) {
    var old = document.getElementById("bizgarh-jsonld");
    if (old) old.remove();
    var el = document.createElement("script");
    el.id = "bizgarh-jsonld";
    el.type = "application/ld+json";
    el.textContent = JSON.stringify(data);
    document.head.appendChild(el);
  }

  var COURSES = {
    breakout: { name: "Intraday Breakout Blueprint", title: "Intraday Breakout Blueprint Course | Nifty Intraday Trading | Bizgarh", desc: "Learn a written Nifty intraday breakout process: selection, invalidation, and size. A stock market course for Indian traders — education, not tips.", instructor: "Aarav Mehta", price: 799, rating: "4.8", learners: 12480, hours: "PT6H30M", cat: "trending" },
    income: { name: "Weekly Options Income Playbook", title: "Weekly Options Income Course | Defined-Risk Nifty Options | Bizgarh", desc: "Build a weekly options income process with defined risk, adjustments, and a journal. Option trading course for Indian desks.", instructor: "Neha Kapoor", price: 499, rating: "4.9", learners: 28910, hours: "PT8H", cat: "options" },
    "price-action": { name: "Price Action Without Indicators", title: "Price Action Trading Course | Read Charts Without Indicators | Bizgarh", desc: "Learn price action, market structure, and clean levels without an indicator pile. Technical analysis for Indian swing traders.", instructor: "Vikram Singh", price: 899, rating: "4.8", learners: 9340, hours: "PT7H", cat: "ta" },
    "opening-range": { name: "Opening Range for Index Options", title: "Opening Range Course | Bank Nifty & Nifty First Hour | Bizgarh", desc: "Mark the opening range on Nifty and Bank Nifty, wait for acceptance, and write invalidation. Index options classroom.", instructor: "Kabir Joshi", price: 999, rating: "4.7", learners: 6112, hours: "PT5H30M", cat: "options" },
    "long-term": { name: "How to Build a 10-Year Stock Portfolio", title: "Stock Market Investing Course | 10-Year Portfolio | Bizgarh", desc: "A patient stock investing classroom: allocation, review, and what not to chase. For Indian long-term investors.", instructor: "Ananya Rao", price: 399, rating: "4.8", learners: 15220, hours: "PT5H", cat: "investing" },
    "mf-guide": { name: "Mutual Funds Made Simple", title: "Mutual Fund Course in India | SIP Basics | Bizgarh", desc: "Understand mutual funds, categories, and a simple review habit. Investing education for Indian beginners.", instructor: "Rohan Desai", price: 299, rating: "4.7", learners: 11004, hours: "PT4H", cat: "investing" },
    sip: { name: "SIP & Asset Allocation Lab", title: "SIP & Asset Allocation Course | Indian Investors | Bizgarh", desc: "Learn SIP, asset allocation, and a quarterly rebalance you can keep. Long-term investing classroom.", instructor: "Priya Nair", price: 349, rating: "4.8", learners: 8760, hours: "PT3H30M", cat: "investing" },
    "opt-start": { name: "Options from Zero", title: "Options Trading Course for Beginners | Calls, Puts, Expiry | Bizgarh", desc: "Start option trading from zero: calls, puts, expiry, and defined risk before you size up. For Indian beginners.", instructor: "Meera Iyer", price: 449, rating: "4.8", learners: 21550, hours: "PT7H30M", cat: "options" },
    spreads: { name: "Spreads & Defined-Risk Setups", title: "Options Spreads Course | Credit Spreads & Defined Risk | Bizgarh", desc: "Learn credit spreads and defined-risk option setups with a written adjustment rule. Intermediate options classroom.", instructor: "Neha Kapoor", price: 699, rating: "4.8", learners: 7890, hours: "PT6H", cat: "options" },
    "first-month": { name: "Your First 30 Days in Markets", title: "Share Market Course for Beginners | First 30 Days | Bizgarh", desc: "A 30-day stock market basics path: accounts, charts, risk, and a journal. Beginner course for India.", instructor: "Aarav Mehta", price: 199, rating: "4.9", learners: 33001, hours: "PT4H30M", cat: "beginners" },
    "charts-101": { name: "Reading Charts for Beginners", title: "How to Read Stock Charts | Beginner Technical Analysis | Bizgarh", desc: "Learn to read candlesticks, volume, and simple structure. Chart-reading course for new Indian traders.", instructor: "Vikram Singh", price: 299, rating: "4.7", learners: 14670, hours: "PT5H", cat: "beginners" },
    candles: { name: "Candlestick Context Course", title: "Candlestick Pattern Course | Context Over Isolated Signals | Bizgarh", desc: "Study candlesticks in context — not isolated patterns. Technical analysis classroom for Indian traders.", instructor: "Kabir Joshi", price: 399, rating: "4.8", learners: 10240, hours: "PT5H30M", cat: "ta" },
    levels: { name: "Support, Resistance & Market Structure", title: "Support & Resistance Course | Market Structure Trading | Bizgarh", desc: "Mark support, resistance, and market structure you can defend. Price-action technical analysis course.", instructor: "Meera Iyer", price: 449, rating: "4.8", learners: 9018, hours: "PT6H", cat: "ta" },
    "hindi-ta": { name: "टेक्निकल एनालिसिस हिंदी में", title: "टेक्निकल एनालिसिस कोर्स हिंदी में | Share Market Course | Bizgarh", desc: "हिंदी में टेक्निकल एनालिसिस: चार्ट, लेवल, और एक लिखा हुआ प्रोसेस। भारतीय ट्रेडर्स के लिए शेयर मार्केट कोर्स।", instructor: "Ananya Rao", price: 399, rating: "4.8", learners: 18430, hours: "PT6H30M", cat: "hindi" },
    "hindi-swing": { name: "स्विंग ट्रेडिंग आसान भाषा में", title: "स्विंग ट्रेडिंग कोर्स हिंदी में | Share Market Swing Trading | Bizgarh", desc: "आसान हिंदी में स्विंग ट्रेडिंग: स्ट्रक्चर, एंट्री, और रिस्क। शेयर मार्केट कोर्स इंडिया।", instructor: "Rohan Desai", price: 449, rating: "4.7", learners: 13880, hours: "PT6H", cat: "hindi" },
    "crypto-lab": { name: "Crypto Spot & Risk Basics", title: "Crypto Trading Course | Spot & Risk Basics | Bizgarh", desc: "Learn crypto spot markets, position size, and risk — not a signal feed. Education for Indian learners.", instructor: "Priya Nair", price: 499, rating: "4.6", learners: 6540, hours: "PT5H", cat: "crypto" },
    "ema-swing": { name: "EMA Pullback Swing System", title: "EMA Pullback Swing Trading Course | Checklist System | Bizgarh", desc: "A written EMA pullback swing checklist: trend, pullback, and invalidation. Trading strategy classroom.", instructor: "Vikram Singh", price: 249, rating: "4.7", learners: 4210, hours: "PT3H30M", cat: "strategy" },
    vwap: { name: "VWAP Intraday Checklist", title: "VWAP Intraday Trading Course | Nifty Intraday Checklist | Bizgarh", desc: "Use VWAP as a location tool for Nifty intraday, with a size rule and a stop you can explain.", instructor: "Aarav Mehta", price: 249, rating: "4.7", learners: 5002, hours: "PT3H", cat: "strategy" }
  };

  var WEBINARS = {
    w1: { name: "Gap & Go for Nifty Options", title: "Gap & Go Nifty Options Webinar | Live Trading Class | Bizgarh", desc: "Live Nifty options webinar on gap selection, opening acceptance, and a journal — 18 Sep 2026. Free for registered learners.", by: "Aarav Mehta", start: "2026-09-18T11:00:00+05:30" },
    w2: { name: "Defined-Risk Credit Spreads", title: "Credit Spreads Webinar | Defined-Risk Options Live Class | Bizgarh", desc: "Live webinar on defined-risk credit spreads for Indian options traders. 20 Sep 2026 with Neha Kapoor.", by: "Neha Kapoor", start: "2026-09-20T20:00:00+05:30" },
    w3: { name: "Reading Weekly Structure", title: "Weekly Market Structure Webinar | Price Action Live Class | Bizgarh", desc: "Live class on reading weekly structure and real levels. 22 Sep 2026 with Vikram Singh. Education only.", by: "Vikram Singh", start: "2026-09-22T19:30:00+05:30" }
  };

  var PROGRAMS = {
    "mp-income": { name: "Options Income Mentorship", title: "Options Income Mentorship | 3-Week Live Desk | Bizgarh", desc: "A 3-week live mentorship on weekly options income, spreads, and a review you can keep. Indian traders, education only.", by: "Neha Kapoor" },
    "mp-gap": { name: "Gap & Go Mentorship", title: "Gap & Go Mentorship | Nifty Intraday Desk | Bizgarh", desc: "Four-week mentorship on gap selection and opening acceptance for Nifty. Live desk with Aarav Mehta.", by: "Aarav Mehta" },
    "mp-or": { name: "Opening Range Mentorship", title: "Opening Range Mentorship | Index Options Desk | Bizgarh", desc: "First-hour process for Nifty and Bank Nifty options. Live mentorship with Kabir Joshi.", by: "Kabir Joshi" },
    "mp-breakout": { name: "Intraday Desk Mentorship", title: "Intraday Breakout Mentorship | Live Trading Desk | Bizgarh", desc: "Live tape, written invalidation, and a weekly journal check. Intraday mentorship for Indian traders.", by: "Aarav Mehta" },
    "mp-swing": { name: "Swing Structure Mentorship", title: "Swing Trading Mentorship | Price Action Desk | Bizgarh", desc: "Six-week swing mentorship on weekly structure and real levels with Vikram Singh.", by: "Vikram Singh" },
    "mp-port": { name: "Portfolio Construction Lab", title: "Portfolio Mentorship | 10-Year Investing Desk | Bizgarh", desc: "Build a 10-year book: SIP, allocation, and a quarterly review. Investing mentorship, not tips.", by: "Ananya Rao" },
    "mp-opt0": { name: "Options from Zero Mentorship", title: "Options Mentorship for Beginners | Live Desk | Bizgarh", desc: "Calls, puts, expiry, and defined risk before you size up. Beginner options mentorship.", by: "Meera Iyer" },
    "mp-sip": { name: "SIP & Allocation Mentorship", title: "SIP Mentorship | Asset Allocation Live Desk | Bizgarh", desc: "A patient desk for SIP, rebalance, and what not to chase. Long-term investing mentorship.", by: "Priya Nair" },
    "mp-pa": { name: "Price Action Mentorship", title: "Price Action Mentorship | Chart Structure Desk | Bizgarh", desc: "Read the chart without the indicator pile. Live price-action mentorship with Vikram Singh.", by: "Vikram Singh" }
  };

  var CATS = {
    investing: { title: "Stock Market Investing Courses in India | Long-Term Portfolio | Bizgarh", desc: "Stock investing courses for Indian long-term investors: 10-year portfolio, mutual funds, and SIP allocation. Education, not tips." },
    options: { title: "Option Trading Courses in India | Nifty Options & Spreads | Bizgarh", desc: "Option trading courses from zero to defined-risk spreads and weekly income. Built for Indian Nifty and Bank Nifty desks." },
    beginners: { title: "Share Market Course for Beginners in India | Stock Market Basics | Bizgarh", desc: "Start the share market with a 30-day path and chart-reading basics. Beginner stock market courses for India." },
    ta: { title: "Technical Analysis Course | Candlesticks, Levels, Price Action | Bizgarh", desc: "Technical analysis classrooms: candlestick context, support and resistance, and market structure for Indian traders." },
    hindi: { title: "शेयर मार्केट कोर्स हिंदी में | टेक्निकल एनालिसिस व स्विंग ट्रेडिंग | Bizgarh", desc: "हिंदी में शेयर मार्केट और टेक्निकल एनालिसिस कोर्स। आसान भाषा में चार्ट, स्विंग, और एक लिखा प्रोसेस।" },
    crypto: { title: "Crypto Trading Course | Spot & Risk Basics | Bizgarh", desc: "Crypto spot and risk classroom for Indian learners. Process and size — not a tip channel." },
    strategy: { title: "Trading Strategy Courses | EMA Swing & VWAP Intraday | Bizgarh", desc: "Written trading strategies: EMA pullback swing and VWAP intraday checklists for Indian markets." },
    trending: { title: "Trending Stock Market Courses | Breakout, Options, Price Action | Bizgarh", desc: "Most-followed Bizgarh classrooms: intraday breakout, weekly options income, price action, and opening range." },
    cert: { title: "Finance Certification Classrooms | Exam-Style Market Concepts | Bizgarh", desc: "Structured modules to practice exam-style market concepts. Education only — not a SEBI certification claim." }
  };

  var PAGES = {
    "/": { title: "Stock Market Courses in India | Option Trading, Nifty & Mentorship | Bizgarh", desc: "Bizgarh is a classroom for Indian traders: stock market courses, Nifty options webinars, price action, Hindi library, and live mentorship. Process and risk — not a tip feed.", type: "website" },
    "/courses": { title: "All Stock Market Courses in India | Trading & Investing | Bizgarh", desc: "Browse stock market courses: options, investing, technical analysis, beginners, Hindi, and crypto. Self-paced classrooms for Indian traders." },
    "/course": { title: "Stock Market Course | Trading Classroom | Bizgarh", desc: "Open a Bizgarh classroom: recorded stock market and option trading courses with progress, community, and a certificate when you finish." },
    "/live": { title: "Live Stock Market Classes & Nifty Options Webinars | Bizgarh", desc: "Join live stock market classes, Nifty options webinars, mentorship desks, and 1:1 journal reviews inside Bizgarh — not on Zoom." },
    "/webinar": { title: "Stock Market Webinars | Live Trading Classes | Bizgarh", desc: "Enroll in live trading webinars on Nifty options, credit spreads, and weekly structure. Join the Bizgarh room at start time." },
    "/mentorship": { title: "Trading Mentorship Programs in India | Live Options & Swing Desks | Bizgarh", desc: "Multi-week live mentorship with working traders: options income, gap & go, price action, and portfolio construction. Education only." },
    "/program": { title: "Live Mentorship Program | Trading Desk | Bizgarh", desc: "A guided multi-week trading mentorship inside Bizgarh: live sessions, community room, and recordings for enrolled learners." },
    "/about": { title: "About Bizgarh | Stock Market Classroom for Indian Traders", desc: "Bizgarh is an independent stock market classroom. We teach process, risk, and journals — not tips, PMS, or guaranteed returns." },
    "/reviews": { title: "Bizgarh Reviews | Stock Market Course Feedback from Indian Learners", desc: "520 learner notes on Bizgarh stock market courses, webinars, and mentorship desks. Honest classroom feedback, not a highlight reel." },
    "/contact": { title: "Help Centre | Stock Market Course FAQ | Bizgarh", desc: "Search 111 FAQs on enroll, live desks, certificates, and journals — or write desk@bizgarh.com. Help for Bizgarh learners." },
    "/instructors": { title: "Instructors | Stock Market Mentors | Bizgarh", desc: "Meet Bizgarh instructors: working traders and investors who teach courses, live mentorship, and 1:1 guidance." },
    "/instructor": { title: "Instructor | Trading Mentor | Bizgarh", desc: "Open a Bizgarh instructor profile: courses, live mentorship desks, and personal guidance." },
    "/stock-market-courses": { title: "Stock Market Courses in India 2026 | Trading & Investing Classes | Bizgarh", desc: "Compare stock market courses in India: beginners, Nifty options, price action, investing, and Hindi classrooms. Start a written process on Bizgarh." },
    "/option-trading-course": { title: "Option Trading Course in India | Nifty Options from Zero | Bizgarh", desc: "Option trading course for Indian traders: calls, puts, credit spreads, weekly income, and opening range. Defined risk, not tips." },
    "/nifty-options": { title: "Nifty Options Course & Live Webinars | Bank Nifty Classroom | Bizgarh", desc: "Learn Nifty and Bank Nifty options: gap & go, opening range, and defined-risk spreads. Courses, webinars, and mentorship." },
    "/technical-analysis-course": { title: "Technical Analysis Course | Price Action, Candlesticks, Levels | Bizgarh", desc: "Technical analysis course for Indian traders: candlestick context, support and resistance, and price action without indicator clutter." },
    "/share-market-course-in-hindi": { title: "शेयर मार्केट कोर्स हिंदी में | टेक्निकल एनालिसिस व स्विंग ट्रेडिंग | Bizgarh", desc: "हिंदी में शेयर मार्केट कोर्स: टेक्निकल एनालिसिस और स्विंग ट्रेडिंग आसान भाषा में। भारतीय ट्रेडर्स के लिए Bizgarh क्लासरूम।" }
  };

  var NOINDEX = {
    "/dashboard": 1, "/learning": 1, "/account": 1, "/admin": 1, "/control": 1, "/live-room": 1,
    "/certificate": 1, "/community": 1, "/plus": 1, "/premium": 1, "/learn": 1, "/logo": 1
  };

  var FAQ_HOME = [
    { q: "What is Bizgarh?", a: "Bizgarh is an education classroom for Indian traders and long-term investors. You get recorded courses, live webinars, mentorship desks, and optional 1:1 calls. We teach process, risk, and journals — not tips." },
    { q: "Is this investment advice?", a: "No. Everything on Bizgarh is education. You write your own process and size. We do not give buy/sell calls or manage money." },
    { q: "Do I need an account?", a: "Yes. Login to enroll, join a live room, continue a classroom, or see certificates. After login you land on your dashboard." },
    { q: "What is the difference between a course, a webinar, and a mentorship?", a: "A course is a recorded classroom you finish at your pace. A webinar is one live session. A mentorship is a multi-week live desk with the same mentor." }
  ];

  function org() {
    return {
      "@type": ["EducationalOrganization", "Organization"],
      "@id": ORIGIN + "/#org",
      name: "Bizgarh",
      legalName: "Bizgarh Learning Pvt Ltd",
      url: ORIGIN + "/",
      logo: { "@type": "ImageObject", url: ICON },
      image: IMG,
      email: "desk@bizgarh.com",
      description: "Stock market classroom for Indian traders and investors: courses, Nifty options webinars, and live mentorship. Educational content only.",
      areaServed: { "@type": "Country", name: "India" },
      knowsAbout: ["Stock market courses", "Option trading", "Nifty options", "Price action", "Technical analysis", "Share market in Hindi"],
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", bestRating: "5", reviewCount: "520" }
    };
  }

  function website() {
    return {
      "@type": "WebSite",
      "@id": ORIGIN + "/#site",
      url: ORIGIN + "/",
      name: "Bizgarh",
      inLanguage: "en-IN",
      publisher: { "@id": ORIGIN + "/#org" },
      potentialAction: {
        "@type": "SearchAction",
        target: ORIGIN + "/courses?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };
  }

  function crumbs(items) {
    return {
      "@type": "BreadcrumbList",
      itemListElement: items.map(function (it, i) {
        return { "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.href) };
      })
    };
  }

  function resolve() {
    var path = pathOf();
    var page = PAGES[path] || { title: document.title || (BRAND + " | Stock market classroom"), desc: "Bizgarh stock market classroom for Indian traders." };
    var robots = NOINDEX[path] ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
    var url = abs(path === "/" ? "/" : path);
    var extra = [];
    var trail = [{ name: "Home", href: "/" }];
    var type = page.type || "article";
    var id;

    if (path === "/courses") {
      id = q("cat");
      if (id && CATS[id]) {
        page = CATS[id];
        url = abs("/courses?cat=" + encodeURIComponent(id));
        trail.push({ name: "Courses", href: "/courses" }, { name: CATS[id].title.split("|")[0].trim(), href: url });
      } else if (q("q")) {
        var term = q("q").replace(/[<>]/g, "").slice(0, 60);
        page = { title: term + " — Stock Market Courses | Bizgarh", desc: "Stock market and option trading courses matching “" + term + "” in the Bizgarh classroom." };
        url = abs("/courses?q=" + encodeURIComponent(q("q")));
        trail.push({ name: "Courses", href: "/courses" }, { name: term, href: url });
      } else {
        trail.push({ name: "Stock market courses", href: "/courses" });
      }
    } else if (path === "/course") {
      id = q("id");
      if (id && COURSES[id]) {
        var c = COURSES[id];
        page = c;
        url = abs("/course?id=" + encodeURIComponent(id));
        trail.push({ name: "Courses", href: "/courses" }, { name: c.name, href: url });
        extra.push({
          "@type": "Course",
          name: c.name,
          description: c.desc,
          url: url,
          image: IMG,
          provider: { "@id": ORIGIN + "/#org" },
          inLanguage: c.cat === "hindi" ? "hi-IN" : "en-IN",
          educationalLevel: c.cat === "beginners" || c.cat === "hindi" ? "beginner" : "intermediate",
          offers: { "@type": "Offer", price: String(c.price), priceCurrency: "INR", availability: "https://schema.org/InStock", url: url, category: "Paid" },
          hasCourseInstance: {
            "@type": "CourseInstance",
            courseMode: "Online",
            duration: c.hours,
            instructor: { "@type": "Person", name: c.instructor }
          }
        });
      } else {
        url = abs("/courses");
        trail.push({ name: "Courses", href: "/courses" });
      }
    } else if (path === "/webinar") {
      id = q("id");
      if (id && WEBINARS[id]) {
        var w = WEBINARS[id];
        page = w;
        url = abs("/webinar?id=" + encodeURIComponent(id));
        trail.push({ name: "Live classes", href: "/live" }, { name: w.name, href: url });
        extra.push({
          "@type": "EducationEvent",
          name: w.name,
          description: w.desc,
          startDate: w.start,
          eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          location: { "@type": "VirtualLocation", url: url },
          organizer: { "@id": ORIGIN + "/#org" },
          performer: { "@type": "Person", name: w.by },
          isAccessibleForFree: true,
          inLanguage: "en-IN"
        });
      } else {
        url = abs("/live");
        trail.push({ name: "Live classes", href: "/live" });
      }
    } else if (path === "/program") {
      id = q("id");
      if (id && PROGRAMS[id]) {
        var p = PROGRAMS[id];
        page = p;
        url = abs("/program?id=" + encodeURIComponent(id));
        trail.push({ name: "Mentorship", href: "/mentorship" }, { name: p.name, href: url });
        extra.push({
          "@type": "Course",
          name: p.name,
          description: p.desc,
          url: url,
          provider: { "@id": ORIGIN + "/#org" },
          educationalCredentialAwarded: "Mentorship desk access",
          hasCourseInstance: {
            "@type": "CourseInstance",
            courseMode: "Blended",
            instructor: { "@type": "Person", name: p.by }
          }
        });
      } else {
        url = abs("/mentorship");
        trail.push({ name: "Mentorship", href: "/mentorship" });
      }
    } else if (path === "/live") {
      trail.push({ name: "Live classes", href: "/live" });
    } else if (path === "/mentorship") {
      trail.push({ name: "Mentorship programs", href: "/mentorship" });
    } else if (path === "/about") {
      trail.push({ name: "About", href: "/about" });
    } else if (path === "/reviews") {
      trail.push({ name: "Reviews", href: "/reviews" });
    } else if (path === "/instructors") {
      trail.push({ name: "Instructors", href: "/instructors" });
    } else if (path === "/instructor" || path.indexOf("/instructor/") === 0) {
      var islug = path.indexOf("/instructor/") === 0 ? path.slice("/instructor/".length) : q("id");
      var inames = {
        "aarav-mehta": "Aarav Mehta",
        "neha-kapoor": "Neha Kapoor",
        "vikram-singh": "Vikram Singh",
        "ananya-rao": "Ananya Rao",
        "kabir-joshi": "Kabir Joshi",
        "rohan-desai": "Rohan Desai",
        "priya-nair": "Priya Nair",
        "meera-iyer": "Meera Iyer"
      };
      var iname = inames[islug] || "";
      if (iname) {
        page = { title: iname + " | Instructor | Bizgarh", desc: "Courses, live mentorship, and 1:1 guidance with " + iname + " on Bizgarh. Education only." };
        url = abs("/instructor/" + islug);
        trail.push({ name: "Instructors", href: "/instructors" }, { name: iname, href: url });
        extra.push({ "@type": "Person", name: iname, url: url, worksFor: { "@id": ORIGIN + "/#org" }, jobTitle: "Instructor" });
      } else {
        trail.push({ name: "Instructors", href: "/instructors" });
        url = abs("/instructors");
      }
    } else if (path === "/contact") {
      trail.push({ name: "Help", href: "/contact" });
      extra.push({
        "@type": "FAQPage",
        mainEntity: FAQ_HOME.map(function (f) {
          return { "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } };
        })
      });
    } else if (PAGES[path] && path !== "/") {
      trail.push({ name: page.title.split("|")[0].trim(), href: path });
    }

    if (path === "/courses" && !q("cat") && !q("q")) {
      extra.push({
        "@type": "ItemList",
        name: "Stock market courses on Bizgarh",
        itemListElement: Object.keys(COURSES).map(function (cid, i) {
          return { "@type": "ListItem", position: i + 1, url: abs("/course?id=" + cid), name: COURSES[cid].name };
        })
      });
    }

    if (path === "/" || path === "/about") {
      extra.push({
        "@type": "FAQPage",
        mainEntity: FAQ_HOME.map(function (f) {
          return { "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } };
        })
      });
    }

    return { page: page, url: url, robots: robots, extra: extra, trail: trail, type: type, path: path };
  }

  function apply() {
    var info = resolve();
    var title = info.page.title;
    var desc = info.page.desc;
    document.title = title;
    document.documentElement.lang = info.path.indexOf("hindi") !== -1 || info.path === "/share-market-course-in-hindi" ? "hi-IN" : "en-IN";
    upsert("name", "description", desc);
    upsert("name", "google-site-verification", "Sd1V3IA8UHbg7EO0ROMnjlC0RZZ_Y8mQN3KOXKmsxnQ");
    upsert("name", "robots", info.robots);
    upsert("name", "googlebot", info.robots);
    upsert("name", "author", "Bizgarh Learning Pvt Ltd");
    upsert("name", "theme-color", "#4f46e5");
    upsert("name", "application-name", BRAND);
    upsert("name", "apple-mobile-web-app-title", BRAND);
    upsert("name", "format-detection", "telephone=no");
    upsert("name", "geo.region", "IN");
    upsert("name", "geo.placename", "India");
    upsert("name", "rating", "general");
    upsert("prop", "og:locale", "en_IN");
    upsert("prop", "og:type", info.path === "/" ? "website" : "article");
    upsert("prop", "og:site_name", BRAND);
    upsert("prop", "og:title", title);
    upsert("prop", "og:description", desc);
    upsert("prop", "og:url", info.url);
    upsert("prop", "og:image", IMG);
    upsert("prop", "og:image:alt", "Bizgarh — stock market classroom for Indian traders");
    upsert("name", "twitter:card", "summary_large_image");
    upsert("name", "twitter:title", title);
    upsert("name", "twitter:description", desc);
    upsert("name", "twitter:image", IMG);
    upsertLink("canonical", info.url);
    upsertLink("icon", ORIGIN + "/favicon.ico?v=logo2", '[sizes="48x48"]', { type: "image/x-icon", sizes: "48x48" });
    upsertLink("icon", ORIGIN + "/img/favicon-48.png?v=logo2", '[type="image/png"][sizes="48x48"]', { type: "image/png", sizes: "48x48" });
    upsertLink("icon", ORIGIN + "/img/favicon-96.png?v=logo2", '[sizes="96x96"]', { type: "image/png", sizes: "96x96" });
    upsertLink("icon", LOGO, '[type="image/svg+xml"]', { type: "image/svg+xml" });
    upsertLink("apple-touch-icon", ORIGIN + "/img/favicon-192.png?v=logo2", "", { sizes: "192x192" });
    upsertLink("manifest", "/site.webmanifest?v=logo2");
    if (info.path === "/share-market-course-in-hindi" || info.path === "/stock-market-courses" || info.path === "/courses") {
      var hi = document.head.querySelector('link[rel="alternate"][hreflang="hi-IN"]') || document.head.appendChild(document.createElement("link"));
      hi.rel = "alternate"; hi.hreflang = "hi-IN"; hi.href = abs("/share-market-course-in-hindi");
      var en = document.head.querySelector('link[rel="alternate"][hreflang="en-IN"]') || document.head.appendChild(document.createElement("link"));
      en.rel = "alternate"; en.hreflang = "en-IN"; en.href = abs("/stock-market-courses");
      var xd = document.head.querySelector('link[rel="alternate"][hreflang="x-default"]') || document.head.appendChild(document.createElement("link"));
      xd.rel = "alternate"; xd.hreflang = "x-default"; xd.href = abs("/");
    }
    var graph = { "@context": "https://schema.org", "@graph": [org(), website(), crumbs(info.trail)].concat(info.extra) };
    ld(graph);
  }

  window.BizgarhSeo = {
    apply: apply,
    origin: ORIGIN,
    courses: COURSES,
    webinars: WEBINARS,
    programs: PROGRAMS
  };
  apply();
})();
