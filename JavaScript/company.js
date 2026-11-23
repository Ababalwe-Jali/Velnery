/* VELNERY company pages: news filter, media enquiry form, progress bars and counters. DEMO ONLY: the enquiry opens the visitor's email app. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };

  /* news filter */
  var news = $("cp-news");
  if (news) {
    var chips = [].slice.call(document.querySelectorAll(".cp-filter .chip"));
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        var f = c.getAttribute("data-f");
        chips.forEach(function (x) { x.setAttribute("aria-pressed", x === c ? "true" : "false"); });
        [].slice.call(news.children).forEach(function (li) { li.hidden = !(f === "all" || li.getAttribute("data-t") === f); });
      });
    });
  }

  /* media enquiry form */
  var form = $("media-form");
  if (form) {
    var setErr = function (id, msg) {
      var el = $(id + "-err"), inp = $(id);
      el.textContent = msg || "";
      inp.classList.toggle("is-invalid", !!msg);
      if (msg) inp.setAttribute("aria-invalid", "true"); else inp.removeAttribute("aria-invalid");
      return !msg;
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("m-name").value.trim(), email = $("m-email").value.trim(), topic = $("m-topic").value, msg = $("m-msg").value.trim(), outlet = $("m-outlet").value.trim();
      var ok = true;
      ok = setErr("m-name", name ? "" : "Enter your name.") && ok;
      ok = setErr("m-email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Enter a valid email address.") && ok;
      ok = setErr("m-topic", topic ? "" : "Choose a topic.") && ok;
      ok = setErr("m-msg", msg.length >= 10 ? "" : "Please write at least a short message.") && ok;
      if (!ok) { var bad = form.querySelector(".is-invalid"); if (bad) bad.focus(); return; }
      var body = msg + "\n\nName: " + name + (outlet ? "\nOutlet: " + outlet : "") + "\nEmail: " + email;
      window.location.href = "mailto:velnery@gmail.com?subject=" + encodeURIComponent("Media enquiry: " + topic) + "&body=" + encodeURIComponent(body);
      form.hidden = true;
      var done = $("media-done"); done.hidden = false; done.setAttribute("tabindex", "-1"); done.focus();
    });
    $("media-again").addEventListener("click", function () {
      form.reset(); form.hidden = false; $("media-done").hidden = true; $("m-name").focus();
    });
  }

  /* progress bars + counters animate when scrolled into view */
  var bars = $("cp-bars");
  var counters = [].slice.call(document.querySelectorAll("[data-count]"));
  var still = !("IntersectionObserver" in window) || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  var setCount = function (el, v) { el.textContent = v + (el.getAttribute("data-suffix") || ""); };
  if (still) {
    document.documentElement.classList.add("no-io");
    counters.forEach(function (el) { setCount(el, el.getAttribute("data-count")); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        if (en.target === bars) { bars.classList.add("is-in"); return; }
        var el = en.target, to = +el.getAttribute("data-count"), t0 = null;
        var tick = function (t) {
          if (t0 === null) t0 = t;
          var p = Math.min((t - t0) / 1200, 1);
          setCount(el, Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.3 });
    if (bars) io.observe(bars);
    counters.forEach(function (el) { io.observe(el); });
  }
})();