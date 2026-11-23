/* VELNERY legal pages: print button, table-of-contents highlight, cookie preferences.
   Preferences are saved in localStorage as "ww_cookie_prefs". DEMO ONLY. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };

  var pr = $("lg-print");
  if (pr) pr.addEventListener("click", function () { window.print(); });

  /* highlight current section in the contents list */
  var links = [].slice.call(document.querySelectorAll(".lg-toc ol a"));
  var secs = links.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); }).filter(Boolean);
  if (secs.length && "IntersectionObserver" in window) {
    var set = function (id) { links.forEach(function (a) { a.classList.toggle("is-current", a.getAttribute("href") === "#" + id); }); };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) set(e.target.id); });
    }, { rootMargin: "-20% 0px -70% 0px" });
    secs.forEach(function (s) { io.observe(s); });
    set(secs[0].id);
  }

  /* cookie preferences */
  var form = $("ck-form");
  if (form) {
    var ok = $("ck-ok");
    var prefs = {};
    try { prefs = JSON.parse(localStorage.getItem("ww_cookie_prefs") || "{}") || {}; } catch (e) {}
    $("ck-analytics").checked = !!prefs.analytics;
    $("ck-marketing").checked = !!prefs.marketing;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      try {
        localStorage.setItem("ww_cookie_prefs", JSON.stringify({ essential: true, analytics: $("ck-analytics").checked, marketing: $("ck-marketing").checked }));
        localStorage.setItem("ww_cookie_consent", "custom");
      } catch (err) {}
      ok.textContent = "Your choices have been saved.";
      if (window.WW && WW.toast) WW.toast("Cookie choices saved");
    });

    $("ck-reset").addEventListener("click", function () {
      try { localStorage.removeItem("ww_cookie_consent"); localStorage.removeItem("ww_cookie_prefs"); } catch (err) {}
      $("ck-analytics").checked = false; $("ck-marketing").checked = false;
      ok.textContent = "Done. The cookie banner will appear again the next time you open a page.";
    });
  }
})();