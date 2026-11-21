/* VELNERY delivery address dialog.
   Load on every page after main.js and auth.js:  <script src="../JavaScript/address.js"></script>
   Opens when the "Deliver to / Set address" button in the navbar is clicked (replaces the old prompt box).
   Addresses are saved in this browser (localStorage). For a live store, also save them to the customer's account on your server. */
(function () {
  "use strict";

  var KEY_LIST = "ww_addresses", KEY_ACTIVE = "ww_address_active", KEY_TEXT = "ww_address";
  var PROVINCES = ["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"];
  var LABELS = ["Home", "Work", "Other"];

  /* ---------- Storage ---------- */
  function load() { try { return JSON.parse(localStorage.getItem(KEY_LIST)) || []; } catch (e) { return []; } }
  function save(list) { try { localStorage.setItem(KEY_LIST, JSON.stringify(list)); } catch (e) {} }
  function activeId() { try { return localStorage.getItem(KEY_ACTIVE) || ""; } catch (e) { return ""; } }
  function setActive(id) {
    try { localStorage.setItem(KEY_ACTIVE, id || ""); } catch (e) {}
    var a = find(id);
    try { localStorage.setItem(KEY_TEXT, a ? short(a) : ""); } catch (e) {}
    updateHeader();
  }
  function find(id) { return load().filter(function (a) { return a.id === id; })[0]; }
  function short(a) { return a.suburb + ", " + a.postal; }
  function line(a) { return [a.street, a.unit, a.suburb, a.city, a.province, a.postal].filter(Boolean).join(", "); }
  function uid() { return "a" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function updateHeader() {
    var t = document.getElementById("address-text");
    if (!t) return;
    var a = find(activeId());
    var legacy = ""; try { legacy = localStorage.getItem(KEY_TEXT) || ""; } catch (e) {}
    t.textContent = a ? short(a) : (legacy || "Set address");   // keeps an address typed in the old prompt box
  }

  /* ---------- DOM helpers ---------- */
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function toast(m) { if (window.WW && WW.toast) WW.toast(m); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function field(id, label, input, hint) {
    return '<div class="au-field"><label for="' + id + '">' + label + (hint ? ' <span class="ad-opt">' + hint + "</span>" : "") + "</label>" + input +
      '<p class="au-err" id="' + id + '-err" role="alert"></p></div>';
  }
  function inp(id, type, extra) { return '<input id="' + id + '" name="' + id + '" type="' + type + '" ' + (extra || "") + ">"; }

  var provinceOptions = '<option value="">Select province</option>' + PROVINCES.map(function (p) { return "<option>" + p + "</option>"; }).join("");
  var chips = LABELS.map(function (l, i) {
    return '<label class="ad-chip"><input type="radio" name="ad-label" value="' + l + '"' + (i === 0 ? " checked" : "") + "><span>" + l + "</span></label>";
  }).join("");

  var HTML =
    '<div class="au-backdrop" data-close></div>' +
    '<div class="au-dialog" role="dialog" aria-modal="true" aria-labelledby="ad-title" tabindex="-1">' +
      '<aside class="au-image ad-image" aria-hidden="true">' +
        '<div class="au-image-copy"><span class="au-brand">VELNERY</span><p>Delivered to your door.</p></div>' +
      "</aside>" +
      '<section class="au-panel">' +
        '<button type="button" class="au-close" data-close aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +

        /* Saved addresses */
        '<div class="au-view" data-pane="list">' +
          '<h2 class="au-title" id="ad-title">Where should we deliver?</h2>' +
          '<p class="au-sub">Choose a saved address or add a new one. We\'ll use it to show delivery options at checkout.</p>' +
          '<div class="ad-list" id="ad-list"></div>' +
          '<button type="button" class="au-submit" data-act="new"><span>+ Add new address</span></button>' +
        "</div>" +

        /* Form */
        '<form class="au-view" data-pane="form" novalidate>' +
          '<h2 class="au-title" id="ad-form-title">Add a delivery address</h2>' +
          '<p class="au-sub">Enter the address where your order should be delivered.</p>' +
          '<div class="ad-chips" role="radiogroup" aria-label="Address type">' + chips + "</div>" +
          field("ad-street", "Street address", inp("ad-street", "text", 'autocomplete="address-line1" placeholder="12 Main Road"')) +
          field("ad-unit", "Complex, unit or building", inp("ad-unit", "text", 'autocomplete="address-line2" placeholder="Unit 4, Oak Court"'), "optional") +
          '<div class="ad-grid">' +
            field("ad-suburb", "Suburb", inp("ad-suburb", "text", 'autocomplete="address-level3" placeholder="Sandton"')) +
            field("ad-city", "City / town", inp("ad-city", "text", 'autocomplete="address-level2" placeholder="Johannesburg"')) +
          "</div>" +
          '<div class="ad-grid">' +
            field("ad-province", "Province", '<select id="ad-province" name="ad-province" autocomplete="address-level1">' + provinceOptions + "</select>") +
            field("ad-postal", "Postal code", inp("ad-postal", "text", 'inputmode="numeric" maxlength="4" autocomplete="postal-code" placeholder="2196"')) +
          "</div>" +
          field("ad-phone", "Contact number", inp("ad-phone", "tel", 'autocomplete="tel" placeholder="082 123 4567"'), "optional, for the courier") +
          field("ad-notes", "Delivery instructions", '<textarea id="ad-notes" name="ad-notes" rows="2" maxlength="160" placeholder="e.g. Gate code, leave with security"></textarea>', "optional") +
          '<p class="au-form-err" id="ad-form-err" role="alert"></p>' +
          '<button class="au-submit" type="submit"><span>Save and deliver here</span></button>' +
          '<p class="au-switch"><button type="button" class="au-link" data-act="back" id="ad-back">Back to saved addresses</button></p>' +
        "</form>" +
      "</section>" +
    "</div>";

  var root, dialog, open = false, lastFocus, editing = null;

  function build() {
    root = el("div", "au-root ad-root");
    root.hidden = true;
    root.innerHTML = HTML;
    document.body.appendChild(root);
    dialog = root.querySelector(".au-dialog");
    root.addEventListener("click", onClick);
    root.addEventListener("submit", onSubmit);
    root.addEventListener("input", function (e) { if (e.target.id) setErr(e.target.id, ""); });
    document.addEventListener("keydown", onKey);
  }

  /* ---------- Views ---------- */
  function show(name, instant) {
    Array.prototype.forEach.call(root.querySelectorAll(".au-view"), function (p) {
      var on = p.getAttribute("data-pane") === name;
      p.hidden = !on;
      p.classList.toggle("is-active", on);
      if (on && !instant) { p.classList.remove("is-in"); void p.offsetWidth; p.classList.add("is-in"); }
    });
    clearErrors();
    root.querySelector(".au-panel").scrollTop = 0;
    if (open && !instant) {
      var f = name === "form" ? root.querySelector("#ad-street") : root.querySelector('[data-act="new"]');
      setTimeout(function () { if (f) f.focus(); }, 60);
    }
  }

  function renderList() {
    var box = root.querySelector("#ad-list"), list = load(), act = activeId();
    box.textContent = "";
    if (!list.length) { box.appendChild(el("p", "ad-empty", "You haven't saved an address yet.")); return; }
    list.forEach(function (a) {
      var card = el("div", "ad-card" + (a.id === act ? " is-active" : ""));
      var pick = el("button", "ad-pick");
      pick.type = "button"; pick.setAttribute("data-pick", a.id);
      pick.setAttribute("aria-pressed", String(a.id === act));
      var dot = el("span", "ad-dot"); dot.setAttribute("aria-hidden", "true");
      var txt = el("span", "ad-txt");
      var h = el("strong", "", a.label + (a.id === act ? "  ·  Delivering here" : ""));
      txt.appendChild(h);
      txt.appendChild(el("span", "", line(a)));
      if (a.notes) txt.appendChild(el("em", "", a.notes));
      pick.appendChild(dot); pick.appendChild(txt);
      var tools = el("div", "ad-tools");
      var ed = el("button", "au-link", "Edit"); ed.type = "button"; ed.setAttribute("data-edit", a.id);
      var rm = el("button", "au-link", "Remove"); rm.type = "button"; rm.setAttribute("data-remove", a.id);
      tools.appendChild(ed); tools.appendChild(rm);
      card.appendChild(pick); card.appendChild(tools);
      box.appendChild(card);
    });
  }

  function openForm(a) {
    editing = a ? a.id : null;
    var f = root.querySelector('[data-pane="form"]');
    f.reset();
    root.querySelector("#ad-form-title").textContent = a ? "Edit address" : "Add a delivery address";
    if (a) {
      root.querySelector("#ad-street").value = a.street || "";
      root.querySelector("#ad-unit").value = a.unit || "";
      root.querySelector("#ad-suburb").value = a.suburb || "";
      root.querySelector("#ad-city").value = a.city || "";
      root.querySelector("#ad-province").value = a.province || "";
      root.querySelector("#ad-postal").value = a.postal || "";
      root.querySelector("#ad-phone").value = a.phone || "";
      root.querySelector("#ad-notes").value = a.notes || "";
      Array.prototype.forEach.call(f.querySelectorAll('input[name="ad-label"]'), function (r) { r.checked = r.value === a.label; });
    }
    root.querySelector("#ad-back").hidden = load().length === 0 && !a;
    show("form");
  }

  function openDialog() {
    if (!root) build();
    lastFocus = document.activeElement;
    renderList();
    if (load().length) show("list", true); else { openForm(null); }
    root.hidden = false;
    void root.offsetWidth;
    root.classList.add("is-open");
    document.documentElement.classList.add("au-lock");
    open = true;
    setTimeout(function () {
      var f = root.querySelector(".au-view.is-active input:not([type=radio]), .au-view.is-active .au-submit");
      if (f) f.focus(); else dialog.focus();
    }, 350);
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

  /* ---------- Errors ---------- */
  function setErr(id, msg) {
    var e = root.querySelector("#" + id + "-err"); if (e) e.textContent = msg || "";
    var i = root.querySelector("#" + id);
    if (i) { if (msg) i.setAttribute("aria-invalid", "true"); else i.removeAttribute("aria-invalid"); }
  }
  function clearErrors() {
    Array.prototype.forEach.call(root.querySelectorAll(".au-err, .au-form-err"), function (e) { e.textContent = ""; });
    Array.prototype.forEach.call(root.querySelectorAll("[aria-invalid]"), function (e) { e.removeAttribute("aria-invalid"); });
  }
  function val(id) { return (root.querySelector("#" + id).value || "").trim(); }

  /* ---------- Events ---------- */
  function onClick(e) {
    var t = e.target;
    if (t.closest("[data-close]")) { closeDialog(); return; }
    var n = t.closest("[data-act]");
    if (n) {
      var act = n.getAttribute("data-act");
      if (act === "new") openForm(null);
      if (act === "back") { renderList(); show("list"); }
      return;
    }
    var pick = t.closest("[data-pick]");
    if (pick) {
      var a = find(pick.getAttribute("data-pick"));
      setActive(a.id);
      toast("Delivering to " + short(a));
      closeDialog();
      return;
    }
    var ed = t.closest("[data-edit]");
    if (ed) { openForm(find(ed.getAttribute("data-edit"))); return; }
    var rm = t.closest("[data-remove]");
    if (rm) {
      var id = rm.getAttribute("data-remove"), wasActive = id === activeId();
      save(load().filter(function (x) { return x.id !== id; }));
      if (wasActive) { var rest = load(); setActive(rest.length ? rest[0].id : ""); }
      renderList();
      if (!load().length) openForm(null);
      toast("Address removed.");
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    clearErrors();
    var bad = false;
    var street = val("ad-street"), suburb = val("ad-suburb"), city = val("ad-city"), prov = val("ad-province"), postal = val("ad-postal"), phone = val("ad-phone");
    if (street.length < 3) { setErr("ad-street", "Enter your street address."); bad = true; }
    if (suburb.length < 2) { setErr("ad-suburb", "Enter your suburb."); bad = true; }
    if (city.length < 2) { setErr("ad-city", "Enter your city or town."); bad = true; }
    if (!prov) { setErr("ad-province", "Select your province."); bad = true; }
    if (!/^\d{4}$/.test(postal)) { setErr("ad-postal", "Enter a 4-digit postal code."); bad = true; }
    if (phone && !/^[+()\d][\d\s()+-]{7,}$/.test(phone)) { setErr("ad-phone", "Enter a valid phone number."); bad = true; }
    if (bad) { var f = root.querySelector("[aria-invalid]"); if (f) f.focus(); return; }

    var checked = root.querySelector('input[name="ad-label"]:checked');
    var rec = {
      id: editing || uid(), label: checked ? checked.value : "Home",
      street: street, unit: val("ad-unit"), suburb: suburb, city: city, province: prov, postal: postal,
      phone: phone, notes: val("ad-notes")
    };
    var list = load();
    if (editing) list = list.map(function (x) { return x.id === editing ? rec : x; });
    else list.push(rec);
    save(list);
    setActive(rec.id);
    toast("Delivering to " + short(rec));
    closeDialog();
  }

  function onKey(e) {
    if (!open) return;
    if (e.key === "Escape") { closeDialog(); return; }
    if (e.key !== "Tab") return;
    var f = Array.prototype.filter.call(dialog.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), select, textarea"), function (x) { return x.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* Capture-phase click: runs before main.js's old prompt() handler and stops it. */
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("#address-btn, [data-address]");
    if (!b) return;
    e.preventDefault();
    e.stopPropagation();
    openDialog();
  }, true);

  document.addEventListener("DOMContentLoaded", updateHeader);
  window.addEventListener("load", updateHeader);
  window.VelneryAddress = { open: openDialog, close: closeDialog };
})();