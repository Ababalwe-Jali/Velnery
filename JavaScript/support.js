/* VELNERY support pages: FAQ filter, delivery calculator, returns form. DEMO ONLY: returns are saved to localStorage ("ww_returns"). */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  function read(k, fb) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; } catch (e) { return fb; } }
  function currentUser() {
    try { return JSON.parse(localStorage.getItem("ww_user") || sessionStorage.getItem("ww_user") || "null"); } catch (e) { return null; }
  }
  function money(n) { return (window.WW && WW.money) ? WW.money(n) : "R" + Number(n).toFixed(2); }

  /* ---------- FAQ ---------- */
  var list = $("faq-list");
  if (list) {
    var qs = [].slice.call(list.querySelectorAll(".sp-q"));
    var chips = [].slice.call(document.querySelectorAll(".chip[data-cat]"));
    var search = $("faq-search"), count = $("faq-count"), none = $("faq-none");
    var cat = "all";
    var apply = function () {
      var term = (search.value || "").trim().toLowerCase(), shown = 0;
      qs.forEach(function (q) {
        var ok = (cat === "all" || q.getAttribute("data-cat") === cat) && (!term || q.textContent.toLowerCase().indexOf(term) !== -1);
        q.hidden = !ok;
        if (ok) shown++;
      });
      count.textContent = shown + (shown === 1 ? " question" : " questions");
      none.hidden = shown !== 0;
    };
    search.addEventListener("input", apply);
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        cat = c.getAttribute("data-cat");
        chips.forEach(function (x) { x.setAttribute("aria-pressed", x === c ? "true" : "false"); });
        apply();
      });
    });
    apply();
    if (location.hash) {   // open a question linked by #index
      var m = /^#q(\d+)$/.exec(location.hash);
      if (m && qs[+m[1]]) qs[+m[1]].open = true;
    }
  }

  /* ---------- Delivery calculator ---------- */
  var calc = $("calc-form");
  if (calc) {
    calc.addEventListener("submit", function (e) {
      e.preventDefault();
      var out = $("calc-out");
      var n = parseFloat(String($("calc-amt").value).replace(/[^\d.,]/g, "").replace(",", "."));
      if (!isFinite(n) || n <= 0) { out.className = "sp-result is-err"; out.textContent = "Enter your basket total, for example 450."; return; }
      out.className = "sp-result";
      if (n >= 600) out.textContent = "Standard delivery is free for a basket of " + money(n) + ".";
      else out.textContent = "Standard delivery is " + money(60) + ". Add " + money(600 - n) + " more for free delivery.";
    });
  }

  /* ---------- Returns form ---------- */
  var form = $("ret-form");
  if (form) {
    var found = null;
    var setErr = function (id, msg) {
      var el = $(id + "-err"), inp = $(id);
      if (el) el.textContent = msg || "";
      if (inp) { inp.classList.toggle("is-invalid", !!msg); if (msg) inp.setAttribute("aria-invalid", "true"); else inp.removeAttribute("aria-invalid"); }
      return !msg;
    };
    var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

    var user = currentUser();
    if (user && user.email) $("ret-email").value = user.email;

    var lookup = function () {
      var no = $("ret-order").value.trim().toUpperCase();
      var box = $("ret-items"), listEl = $("ret-items-list");
      found = null;
      if (!no) { box.hidden = true; return; }
      var orders = read("ww_orders", []);
      for (var i = 0; i < orders.length; i++) if (String(orders[i].id).toUpperCase() === no) { found = orders[i]; break; }
      if (!found || !found.items || !found.items.length) { box.hidden = true; listEl.innerHTML = ""; return; }
      listEl.innerHTML = found.items.map(function (it, i) {
        return '<label><input type="checkbox" name="ret-item" value="' + i + '"> ' + esc(it.name) + (it.qty > 1 ? " &times; " + it.qty : "") + "</label>";
      }).join("");
      box.hidden = false;
      if (found.customer && found.customer.email && !$("ret-email").value) $("ret-email").value = found.customer.email;
    };
    $("ret-order").addEventListener("input", lookup);
    $("ret-order").addEventListener("blur", lookup);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var no = $("ret-order").value.trim().toUpperCase();
      var email = $("ret-email").value.trim();
      var what = $("ret-what").value.trim();
      var reason = $("ret-reason").value;
      var picked = [].slice.call(form.querySelectorAll('input[name="ret-item"]:checked')).map(function (c) { return found.items[+c.value].name; });
      var ok = true;
      ok = setErr("ret-order", /^VEL-\d{4,}$/.test(no) ? "" : "Enter your order number, for example VEL-123456.") && ok;
      ok = setErr("ret-email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Enter a valid email address.") && ok;
      ok = setErr("ret-what", (what || picked.length) ? "" : "Tell us what you're returning.") && ok;
      ok = setErr("ret-reason", reason ? "" : "Choose a reason.") && ok;
      if (!ok) { var bad = form.querySelector(".is-invalid"); if (bad) bad.focus(); return; }

      var ref = "RET-" + Date.now().toString(36).toUpperCase().slice(-5);
      var rec = {
        ref: ref, order: no, email: email, items: picked, description: what, reason: reason,
        resolution: (form.querySelector('input[name="ret-res"]:checked') || {}).value || "Refund",
        notes: $("ret-notes").value.trim(), date: new Date().toISOString(), status: "Requested"
      };
      var all = read("ww_returns", []);
      all.unshift(rec);
      try { localStorage.setItem("ww_returns", JSON.stringify(all)); } catch (err) {}

      $("ret-ref").textContent = ref;
      $("ret-mail").textContent = email;
      form.hidden = true;
      var done = $("ret-done");
      done.hidden = false;
      done.setAttribute("tabindex", "-1");
      done.focus();
      if (window.WW && WW.toast) WW.toast("Return request submitted");
    });

    $("ret-again").addEventListener("click", function () {
      form.reset();
      var u = currentUser(); if (u && u.email) $("ret-email").value = u.email;
      $("ret-items").hidden = true; $("ret-items-list").innerHTML = ""; found = null;
      form.hidden = false; $("ret-done").hidden = true;
      $("ret-order").focus();
    });
  }
})();