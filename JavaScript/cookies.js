/* cookies.js – cookie consent popup (loaded on index.html only) */
(function () {
  "use strict";

  var KEY = "ww_cookie_consent";
  var modal = document.getElementById("cookie-modal");
  if (!modal) return;

  // Already answered on a previous visit? Don't show it again.
  try { if (localStorage.getItem(KEY)) return; } catch (e) { /* storage blocked: show it */ }

  var acceptBtn = document.getElementById("cookie-accept");
  var lastFocus = null;

  function open() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("cookie-open");     // stops the page scrolling behind
    acceptBtn.focus();
  }

  function close() {
    modal.hidden = true;
    document.body.classList.remove("cookie-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function choose(choice) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ choice: choice, date: new Date().toISOString() }));
    } catch (e) { /* storage blocked */ }
    close();
    if (window.WW && WW.toast) {
      WW.toast(choice === "accepted" ? "Cookies accepted. Thank you!" : "Optional cookies declined.");
    }
  }

  modal.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-cookie]");
    if (btn) choose(btn.getAttribute("data-cookie"));
  });

  // Escape closes it for now; it will appear again on the next visit
  document.addEventListener("keydown", function (e) {
    if (modal.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "Tab") {                           // keep focus inside the dialog
      var items = modal.querySelectorAll("button, a[href]");
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Small delay so it "pops out" after the page appears
  setTimeout(open, 600);
})();