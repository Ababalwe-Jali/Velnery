/* VELNERY About page: scroll reveal + number count-up. */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reveals = document.querySelectorAll(".reveal");
  var counters = document.querySelectorAll("[data-count]");

  function count(el) {
    var end = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce) { el.textContent = end + suffix; return; }
    var start = null, dur = 1200;
    function step(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (!("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
    counters.forEach(count);
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      if (e.target.hasAttribute("data-count")) count(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.2 });
  reveals.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 80 + "ms"; io.observe(el); });
  counters.forEach(function (el) { io.observe(el); });
})();