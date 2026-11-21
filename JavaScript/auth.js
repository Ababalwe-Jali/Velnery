/* VELNERY sign in / sign up dialog.
   Load on every page after main.js:  <script src="../JavaScript/auth.js"></script>
   Any link to signin.html / signup.html (or [data-auth="signin|signup"]) opens the dialog instead of navigating.

   IMPORTANT: this is a front-end demo. Accounts live in this browser's localStorage, so it is NOT real
   security. For a live store, replace the three functions in `API` below with calls to your server. */
(function () {
  "use strict";

  /* ---------- Backend hooks (swap these for real server calls) ---------- */
  var API = {
    signIn: function (email, password) {
      return hashPw(email, password).then(function (h) {
        var u = readUsers()[email];
        if (!u || u.hash !== h) throw new Error("Incorrect email or password.");
        return { name: u.name, email: email };
      });
    },
    signUp: function (name, email, password) {
      var users = readUsers();
      if (users[email]) return Promise.reject(new Error("An account with this email already exists. Try signing in."));
      return hashPw(email, password).then(function (h) {
        users[email] = { name: name, hash: h };
        localStorage.setItem("ww_users", JSON.stringify(users));
        return { name: name, email: email };
      });
    },
    reset: function (email) { return Promise.resolve(); }   // e.g. POST /forgot-password
  };

  /* ---------- Storage helpers ---------- */
  function readUsers() { try { return JSON.parse(localStorage.getItem("ww_users")) || {}; } catch (e) { return {}; } }
  function getUser() {
    try { return JSON.parse(localStorage.getItem("ww_user") || sessionStorage.getItem("ww_user")); } catch (e) { return null; }
  }
  function setUser(u, remember) {
    try { localStorage.removeItem("ww_user"); sessionStorage.removeItem("ww_user"); } catch (e) {}
    try { (remember ? localStorage : sessionStorage).setItem("ww_user", JSON.stringify(u)); } catch (e) {}
  }
  function clearUser() { try { localStorage.removeItem("ww_user"); sessionStorage.removeItem("ww_user"); } catch (e) {} }

  function hashPw(email, pw) {
    var text = "velnery:" + email + ":" + pw;
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      return crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
      });
    }
    var h = 5381; for (var i = 0; i < text.length; i++) { h = ((h << 5) + h + text.charCodeAt(i)) | 0; }
    return Promise.resolve("x" + h);
  }

  /* ---------- Markup ---------- */
  var EYE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  function field(id, label, type, extra) {
    return '<div class="au-field"><label for="' + id + '">' + label + '</label>' +
      '<input id="' + id + '" name="' + id + '" type="' + type + '" ' + (extra || "") + '>' +
      '<p class="au-err" id="' + id + '-err" role="alert"></p></div>';
  }
  function pwField(id, label, autocomplete) {
    return '<div class="au-field"><label for="' + id + '">' + label + '</label>' +
      '<div class="au-pw"><input id="' + id + '" name="' + id + '" type="password" autocomplete="' + autocomplete + '" placeholder="At least 8 characters">' +
      '<button type="button" class="au-eye" data-eye="' + id + '" aria-label="Show password" aria-pressed="false">' + EYE + '</button></div>' +
      '<p class="au-err" id="' + id + '-err" role="alert"></p></div>';
  }
  /* Logo files in Assets/icon. Rename these to match your file names (png, svg, webp all work). */
  var SOCIAL_ICONS = {
    Google:   "Assets/icon/search.png",
    Apple:    "Assets/icon/apple-logo.png",
    Facebook: "Assets/icon/facebook.png"
  };
  var LETTER = { Google: "G", Apple: "A", Facebook: "f" };
  function socialBtn(name) {
    var root = (document.body && document.body.getAttribute("data-root")) || "";
    return '<button type="button" class="au-soc" data-social="' + name + '" aria-label="Continue with ' + name + '">' +
      '<img class="au-soc-ico" src="' + root + SOCIAL_ICONS[name] + '" alt="" width="22" height="22" ' +
        'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'grid\'">' +
      '<b style="display:none">' + LETTER[name] + '</b><span>' + name + '</span></button>';
  }
  function social() {
    return '<div class="au-or"><span>or continue with</span></div>' +
      '<div class="au-social">' + socialBtn("Google") + socialBtn("Apple") + socialBtn("Facebook") + '</div>';
  }

  var HTML =
    '<div class="au-backdrop" data-close></div>' +
    '<div class="au-dialog" role="dialog" aria-modal="true" aria-labelledby="au-title">' +
      '<aside class="au-image" aria-hidden="true">' +
        '<div class="au-image-copy"><span class="au-brand">VELNERY</span><p>Quality for everyday living.</p></div>' +
      '</aside>' +
      '<section class="au-panel">' +
        '<button type="button" class="au-close" data-close aria-label="Close">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +

        '<div class="au-tabs" role="tablist">' +
          '<button type="button" role="tab" id="tab-signin" data-view="signin">Sign in</button>' +
          '<button type="button" role="tab" id="tab-signup" data-view="signup">Create account</button>' +
        '</div>' +

        /* Sign in */
        '<form class="au-view" data-pane="signin" novalidate>' +
          '<h2 class="au-title" id="au-title">Welcome back</h2>' +
          '<p class="au-sub">Sign in to see your orders, wishlist and saved details.</p>' +
          field("si-email", "Email address", "email", 'autocomplete="email" placeholder="someone@example.com"') +
          pwField("si-pw", "Password", "current-password") +
          '<div class="au-row">' +
            '<label class="au-check"><input type="checkbox" id="si-remember" checked><span>Keep me signed in</span></label>' +
            '<button type="button" class="au-link" data-view="forgot">Forgot password?</button>' +
          '</div>' +
          '<p class="au-form-err" id="si-form-err" role="alert"></p>' +
          '<button class="au-submit" type="submit"><span>Sign in</span></button>' +
          social() +
          '<p class="au-switch">New to VELNERY? <button type="button" class="au-link" data-view="signup">Create an account</button></p>' +
        '</form>' +

        /* Sign up */
        '<form class="au-view" data-pane="signup" novalidate>' +
          '<h2 class="au-title">Create your account</h2>' +
          '<p class="au-sub">Join VELNERY for faster checkout and member-only offers.</p>' +
          field("su-name", "Full name", "text", 'autocomplete="name" placeholder="Enter your full name"') +
          field("su-email", "Email address", "email", 'autocomplete="email" placeholder="someone@example.com"') +
          pwField("su-pw", "Password", "new-password") +
          '<div class="au-meter" aria-hidden="true"><i></i><i></i><i></i><i></i></div>' +
          '<label class="au-check au-terms"><input type="checkbox" id="su-terms"><span>I agree to the <a href="about.html">Terms</a> and <a href="about.html">Privacy Policy</a>.</span></label>' +
          '<p class="au-err" id="su-terms-err" role="alert"></p>' +
          '<p class="au-form-err" id="su-form-err" role="alert"></p>' +
          '<button class="au-submit" type="submit"><span>Create account</span></button>' +
          social() +
          '<p class="au-switch">Already have an account? <button type="button" class="au-link" data-view="signin">Sign in</button></p>' +
        '</form>' +

        /* Forgot password */
        '<form class="au-view" data-pane="forgot" novalidate>' +
          '<h2 class="au-title">Reset your password</h2>' +
          '<p class="au-sub">Enter your email and we\'ll send you a link to reset it.</p>' +
          field("fp-email", "Email address", "email", 'autocomplete="email" placeholder="you@example.com"') +
          '<p class="au-ok" id="fp-ok" role="status"></p>' +
          '<button class="au-submit" type="submit"><span>Send reset link</span></button>' +
          '<p class="au-switch"><button type="button" class="au-link" data-view="signin">Back to sign in</button></p>' +
        '</form>' +

        /* Signed in */
        '<div class="au-view au-done" data-pane="done">' +
          '<span class="au-avatar" id="au-avatar" aria-hidden="true"></span>' +
          '<h2 class="au-title" id="au-done-title">You\'re signed in</h2>' +
          '<p class="au-sub" id="au-done-email"></p>' +
          '<a class="au-submit au-submit-link" href="#" id="au-continue" data-close><span>Continue shopping</span></a>' +
          '<button type="button" class="au-outline" id="au-signout">Sign out</button>' +
        '</div>' +
      '</section>' +
    '</div>';

  var root, dialog, lastFocus, view = "signin", open = false;

  function build() {
    root = document.createElement("div");
    root.className = "au-root";
    root.hidden = true;
    root.innerHTML = HTML;
    document.body.appendChild(root);
    dialog = root.querySelector(".au-dialog");

    root.addEventListener("click", onClick);
    root.addEventListener("submit", onSubmit);
    root.addEventListener("input", onInput);
    document.addEventListener("keydown", onKey);
  }

  /* ---------- Views ---------- */
  function show(name, instant) {
    view = name;
    var panes = root.querySelectorAll(".au-view");
    Array.prototype.forEach.call(panes, function (p) {
      var on = p.getAttribute("data-pane") === name;
      p.classList.toggle("is-active", on);
      p.hidden = !on;
      if (on && !instant) { p.classList.remove("is-in"); void p.offsetWidth; p.classList.add("is-in"); }
    });
    var tabs = root.querySelector(".au-tabs");
    tabs.hidden = (name === "forgot" || name === "done");
    tabs.setAttribute("data-on", name === "signup" ? "signup" : "signin");
    ["signin", "signup"].forEach(function (n) {
      var t = root.querySelector("#tab-" + n);
      t.setAttribute("aria-selected", String(name === n));
      t.tabIndex = name === n ? 0 : -1;
    });
    clearErrors();
    var first = root.querySelector('.au-view.is-active input:not([type=checkbox]), .au-view.is-active .au-submit-link');
    if (first && open && !instant) setTimeout(function () { first.focus(); }, 60);
  }

  function openDialog(which) {
    if (!root) build();
    lastFocus = document.activeElement;
    var u = getUser();
    if (u) fillDone(u);
    show(u ? "done" : (which || "signin"), true);
    root.hidden = false;
    void root.offsetWidth;
    root.classList.add("is-open");
    document.documentElement.classList.add("au-lock");
    open = true;
    var f = root.querySelector('.au-view.is-active input:not([type=checkbox]), .au-view.is-active .au-submit-link');
    setTimeout(function () { if (f) f.focus(); else dialog.focus(); }, 350);
  }

  function closeDialog() {
    if (!open) return;
    open = false;
    root.classList.remove("is-open");
    root.classList.add("is-closing");
    setTimeout(function () {
      root.hidden = true;
      root.classList.remove("is-closing");
      document.documentElement.classList.remove("au-lock");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }, 380);
  }

  function fillDone(u) {
    root.querySelector("#au-avatar").textContent = (u.name || u.email || "?").charAt(0).toUpperCase();
    root.querySelector("#au-done-title").textContent = "Hi, " + (u.name || "there").split(" ")[0];
    root.querySelector("#au-done-email").textContent = u.email;
  }

  /* ---------- Errors & validation ---------- */
  function setErr(id, msg) {
    var el = root.querySelector("#" + id + "-err"); if (el) el.textContent = msg || "";
    var inp = root.querySelector("#" + id);
    if (inp) { if (msg) inp.setAttribute("aria-invalid", "true"); else inp.removeAttribute("aria-invalid"); }
  }
  function clearErrors() {
    Array.prototype.forEach.call(root.querySelectorAll(".au-err, .au-form-err, .au-ok"), function (e) { e.textContent = ""; });
    Array.prototype.forEach.call(root.querySelectorAll("[aria-invalid]"), function (e) { e.removeAttribute("aria-invalid"); });
  }
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function val(id) { return (root.querySelector("#" + id).value || "").trim(); }

  function strength(pw) {
    var s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 14) s++;
    return s;
  }
  function onInput(e) {
    var t = e.target;
    if (t.id) setErr(t.id, "");
    if (t.id === "su-pw") {
      var s = strength(t.value), bars = root.querySelectorAll(".au-meter i");
      Array.prototype.forEach.call(bars, function (b, i) { b.className = i < s ? "on s" + s : ""; });
    }
  }

  function busy(form, on) {
    var b = form.querySelector(".au-submit");
    b.disabled = on; b.classList.toggle("is-busy", on);
  }
  function toast(m) { if (window.WW && WW.toast) WW.toast(m); }

  /* ---------- Events ---------- */
  function onClick(e) {
    var t = e.target;
    if (t.closest("[data-close]")) { if (t.closest("#au-continue")) e.preventDefault(); closeDialog(); return; }
    var v = t.closest("[data-view]");
    if (v) { show(v.getAttribute("data-view")); return; }
    var eye = t.closest("[data-eye]");
    if (eye) {
      var inp = root.querySelector("#" + eye.getAttribute("data-eye"));
      var showIt = inp.type === "password";
      inp.type = showIt ? "text" : "password";
      eye.setAttribute("aria-pressed", String(showIt));
      eye.setAttribute("aria-label", showIt ? "Hide password" : "Show password");
      eye.classList.toggle("is-on", showIt);
      return;
    }
    var soc = t.closest("[data-social]");
    if (soc) { toast(soc.getAttribute("data-social") + " sign-in needs to be connected to your login provider."); return; }
    if (t.closest("#au-signout")) { clearUser(); updateHeader(); toast("You've been signed out."); closeDialog(); }
  }

  function onSubmit(e) {
    e.preventDefault();
    var form = e.target, name = form.getAttribute("data-pane");
    clearErrors();
    var bad = false;

    if (name === "signin") {
      var em = val("si-email").toLowerCase(), pw = root.querySelector("#si-pw").value;
      if (!EMAIL.test(em)) { setErr("si-email", "Enter a valid email address."); bad = true; }
      if (!pw) { setErr("si-pw", "Enter your password."); bad = true; }
      if (bad) return focusInvalid(form);
      busy(form, true);
      API.signIn(em, pw).then(function (u) { done(u, root.querySelector("#si-remember").checked); })
        .catch(function (err) { root.querySelector("#si-form-err").textContent = err.message; })
        .then(function () { busy(form, false); });
    }

    if (name === "signup") {
      var nm = val("su-name"), em2 = val("su-email").toLowerCase(), pw2 = root.querySelector("#su-pw").value;
      if (nm.length < 2) { setErr("su-name", "Enter your full name."); bad = true; }
      if (!EMAIL.test(em2)) { setErr("su-email", "Enter a valid email address."); bad = true; }
      if (pw2.length < 8) { setErr("su-pw", "Use at least 8 characters."); bad = true; }
      if (!root.querySelector("#su-terms").checked) { root.querySelector("#su-terms-err").textContent = "Please accept the terms to continue."; bad = true; }
      if (bad) return focusInvalid(form);
      busy(form, true);
      API.signUp(nm, em2, pw2).then(function (u) { done(u, true); toast("Welcome to VELNERY, " + nm.split(" ")[0] + "!"); })
        .catch(function (err) { root.querySelector("#su-form-err").textContent = err.message; })
        .then(function () { busy(form, false); });
    }

    if (name === "forgot") {
      var em3 = val("fp-email").toLowerCase();
      if (!EMAIL.test(em3)) { setErr("fp-email", "Enter a valid email address."); return focusInvalid(form); }
      busy(form, true);
      API.reset(em3).then(function () {
        root.querySelector("#fp-ok").textContent = "If an account exists for " + em3 + ", a reset link is on its way.";
      }).then(function () { busy(form, false); });
    }
  }

  function focusInvalid(form) { var f = form.querySelector("[aria-invalid]") || form.querySelector(".au-err:not(:empty)"); if (f && f.focus) f.focus(); }

  function done(u, remember) {
    setUser(u, remember);
    updateHeader();
    fillDone(u);
    show("done");
  }

  function onKey(e) {
    if (!open) return;
    if (e.key === "Escape") { closeDialog(); return; }
    if (e.key !== "Tab") return;
    var f = dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled])');
    f = Array.prototype.filter.call(f, function (x) { return x.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------- Header link ---------- */
  function updateHeader() {
    var u = getUser();
    Array.prototype.forEach.call(document.querySelectorAll('a[href$="signin.html"]'), function (a) {
      var small = a.querySelector("small"), strong = a.querySelector("strong");
      if (small) small.textContent = u ? "Hi, " + (u.name || "there").split(" ")[0] : "Hello";
      if (strong) strong.textContent = u ? "My account" : "Sign in";
    });
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href$="signin.html"], a[href$="signup.html"], [data-auth]');
    if (!a) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    var which = a.getAttribute("data-auth") || (/signup\.html$/.test(a.getAttribute("href") || "") ? "signup" : "signin");
    openDialog(which);
  });

  document.addEventListener("DOMContentLoaded", updateHeader);
  window.addEventListener("load", updateHeader);
  window.VelneryAuth = { open: openDialog, close: closeDialog, user: getUser };
})();