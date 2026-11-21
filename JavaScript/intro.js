/* VELNERY intro curtain: letters pop in, the full name pops, then the curtain lifts.
   Load in <head> (no defer) so the curtain covers the page from the first paint.
   Plays once per browser session. To replay while testing: sessionStorage.removeItem("ww_intro_seen") */
(function () {
  var NAME = "VELNERY";
  var KEY = "ww_intro_seen";
  var root = document.documentElement;
  try { if (sessionStorage.getItem(KEY)) return; } catch (e) {}

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var letters = NAME.split("").map(function (c, i) {
    return '<span style="--i:' + i + '">' + c + "</span>";
  }).join("");

  var el = document.createElement("div");
  el.className = "intro";
  el.setAttribute("role", "presentation");
  el.innerHTML =
    '<div class="intro-inner">' +
      '<div class="intro-word" aria-label="' + NAME + '">' + letters + "</div>" +
      '<i class="intro-line"></i>' +
      '<p class="intro-tag">Quality for everyday living</p>' +
    "</div>";

  root.classList.add("intro-on");
  root.appendChild(el);

  var lettersDone = 350 + (NAME.length - 1) * 130 + 550;   // last letter finished popping
  var fullAt = lettersDone + 100;                          // whole name pops
  var liftAt = fullAt + 1300;                              // curtain lifts
  var timers = [], finished = false;

  function lift() {
    if (finished) return;
    finished = true;
    timers.forEach(clearTimeout);
    try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
    el.classList.add("is-full", "is-lifting");
    setTimeout(function () {
      root.classList.remove("intro-on");
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 1300);
  }

  timers.push(setTimeout(function () { el.classList.add("is-full"); }, reduce ? 50 : fullAt));
  timers.push(setTimeout(lift, reduce ? 600 : liftAt));
  el.addEventListener("click", lift);   // click anywhere to skip
})();