/* VELNERY checkout + order confirmation (one script for both pages).
   Reads the cart saved by the site (WW.getCart), shows the summary, validates the form and saves the order in
   localStorage under "ww_orders". DEMO ONLY: nothing is charged and card details are never stored. */
(function () {
  "use strict";

  var PRODUCTS = window.PRODUCTS || [];
  var FREE_OVER = 600, STD_FEE = 60, EXP_FEE = 120, VAT = 0.15;
  var ORDERS_KEY = "ww_orders";

  function $(id) { return document.getElementById(id); }
  function money(n) { return window.WW ? WW.money(n) : "R" + n.toFixed(2); }
  function byId(id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function img(p, w) { return p && p.img ? p.img.replace(/w=\d+/, "w=" + w) : ""; }

  function readOrders() { try { return JSON.parse(localStorage.getItem(ORDERS_KEY)) || []; } catch (e) { return []; } }
  function writeOrders(list) { try { localStorage.setItem(ORDERS_KEY, JSON.stringify(list)); } catch (e) {} }

  /* ---------- working-day helper for delivery estimates ---------- */
  function addWorkingDays(d, n) {
    var x = new Date(d.getTime());
    while (n > 0) { x.setDate(x.getDate() + 1); var w = x.getDay(); if (w !== 0 && w !== 6) n--; }
    return x;
  }
  function fmt(d) { return d.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" }); }
  function range(a, b) { var d = new Date(); return fmt(addWorkingDays(d, a)) + (b !== a ? " – " + fmt(addWorkingDays(d, b)) : ""); }

  /* ---------- cart lines ---------- */
  function lines() {
    var cart = window.WW ? WW.getCart() : {};
    return Object.keys(cart).map(function (id) {
      var p = byId(Number(id)); return p ? { p: p, qty: cart[id] } : null;
    }).filter(Boolean);
  }
  function renderItems(ul, list) {
    ul.textContent = "";
    list.forEach(function (l) {
      var li = el("li", "co-item");
      var th = el("div", "co-thumb");
      th.style.backgroundColor = l.p.tone;
      if (l.p.img) th.style.backgroundImage = "url(" + img(l.p, 160) + ")";
      th.appendChild(el("em", "", String(l.qty)));
      var t = el("div"); t.appendChild(el("strong", "", l.p.name)); t.appendChild(el("small", "", l.p.cat));
      li.appendChild(th); li.appendChild(t); li.appendChild(el("span", "co-item-price", money(l.p.price * l.qty)));
      ul.appendChild(li);
    });
  }
  function totals(subtotal, ship) {
    var fee = subtotal >= FREE_OVER && ship === "standard" ? 0 : (ship === "express" ? EXP_FEE : STD_FEE);
    var total = subtotal + fee;
    return { fee: fee, total: total, vat: total * VAT / (1 + VAT) };
  }

  /* =====================================================
     CHECKOUT PAGE
     ===================================================== */
  function initCheckout() {
    var form = $("co-form"), list = lines();
    if (!list.length) { $("co-empty").hidden = false; return; }
    $("co-layout").hidden = false;

    var subtotal = list.reduce(function (s, l) { return s + l.p.price * l.qty; }, 0);
    renderItems($("co-items"), list);

    function shipValue() { return form.querySelector('input[name="ship"]:checked').value; }
    function payValue() { return form.querySelector('input[name="pay"]:checked').value; }

    function update() {
      var t = totals(subtotal, shipValue());
      $("co-sub").textContent = money(subtotal);
      $("co-ship").textContent = t.fee ? money(t.fee) : "Free";
      $("co-total").textContent = money(t.total);
      $("co-vat").textContent = "Includes VAT of " + money(t.vat);
      var std = totals(subtotal, "standard").fee;
      $("co-std-price").textContent = std ? money(std) : "Free";
      $("co-std-days").textContent = range(2, 4);
      $("co-exp-days").textContent = "Next working day, " + range(1, 1);
      $("co-free").textContent = subtotal >= FREE_OVER ? "You've unlocked free standard delivery." : "Spend " + money(FREE_OVER - subtotal) + " more for free standard delivery.";
      $("co-payflex-note").textContent = "4 interest-free payments of " + money(t.total / 4);
    }

    /* payment panes */
    function showPane() {
      var v = payValue();
      ["card", "payflex", "eft"].forEach(function (k) { $("co-pane-" + k).hidden = k !== v; });
    }
    form.addEventListener("change", function (e) {
      if (e.target.name === "ship") update();
      if (e.target.name === "pay") showPane();
    });

    /* prefill: signed-in user + saved addresses */
    var user = null;
    try { user = JSON.parse(localStorage.getItem("ww_user") || sessionStorage.getItem("ww_user")); } catch (e) {}
    if (user) { $("co-name").value = user.name || ""; $("co-email").value = user.email || ""; $("co-signin").hidden = true; }
    $("co-signin-btn").addEventListener("click", function () { if (window.VelneryAuth) VelneryAuth.open("signin"); });

    var saved = []; try { saved = JSON.parse(localStorage.getItem("ww_addresses")) || []; } catch (e) {}
    var activeId = ""; try { activeId = localStorage.getItem("ww_address_active") || ""; } catch (e) {}
    function fillAddress(a) {
      $("co-street").value = a ? a.street || "" : ""; $("co-unit").value = a ? a.unit || "" : "";
      $("co-suburb").value = a ? a.suburb || "" : ""; $("co-city").value = a ? a.city || "" : "";
      $("co-province").value = a ? a.province || "" : ""; $("co-postal").value = a ? a.postal || "" : "";
      $("co-notes").value = a ? a.notes || "" : "";
      if (a && a.phone && !$("co-phone").value) $("co-phone").value = a.phone;
    }
    if (saved.length) {
      $("co-saved-wrap").hidden = false;
      var sel = $("co-saved");
      saved.forEach(function (a) { var o = el("option", "", a.label + " – " + a.street + ", " + a.suburb); o.value = a.id; sel.appendChild(o); });
      var n = el("option", "", "Enter a new address"); n.value = ""; sel.appendChild(n);
      var cur = saved.filter(function (a) { return a.id === activeId; })[0] || saved[0];
      sel.value = cur.id; fillAddress(cur); $("co-save").checked = false;
      sel.addEventListener("change", function () {
        var a = saved.filter(function (x) { return x.id === sel.value; })[0];
        fillAddress(a || null); $("co-save").checked = !a;
      });
    }

    /* input formatting */
    $("co-card").addEventListener("input", function (e) {
      var d = e.target.value.replace(/\D/g, "").slice(0, 19);
      e.target.value = d.replace(/(.{4})/g, "$1 ").trim();
    });
    $("co-exp").addEventListener("input", function (e) {
      var d = e.target.value.replace(/\D/g, "").slice(0, 4);
      e.target.value = d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
    });
    $("co-cvv").addEventListener("input", function (e) { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4); });
    $("co-postal").addEventListener("input", function (e) { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4); });

    /* validation */
    function setErr(id, msg) {
      var e = $(id + "-err"); if (e) e.textContent = msg || "";
      var i = $(id); if (i) { if (msg) i.setAttribute("aria-invalid", "true"); else i.removeAttribute("aria-invalid"); }
      return !!msg;
    }
    form.addEventListener("input", function (e) { if (e.target.id) setErr(e.target.id, ""); $("co-form-err").textContent = ""; });
    function val(id) { return $(id).value.trim(); }
    function luhn(num) {
      var s = 0, alt = false;
      for (var i = num.length - 1; i >= 0; i--) { var n = parseInt(num.charAt(i), 10); if (alt) { n *= 2; if (n > 9) n -= 9; } s += n; alt = !alt; }
      return s % 10 === 0;
    }
    function cardBrand(n) { return /^4/.test(n) ? "Visa" : /^(5[1-5]|2[2-7])/.test(n) ? "Mastercard" : "Card"; }

    function validate() {
      var bad = false;
      function chk(id, ok, msg) { if (setErr(id, ok ? "" : msg)) bad = true; else if (!ok) bad = true; }
      chk("co-name", val("co-name").length >= 2, "Enter your full name.");
      chk("co-phone", /^[+()\d][\d\s()+-]{8,}$/.test(val("co-phone")), "Enter a valid phone number.");
      chk("co-email", /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val("co-email")), "Enter a valid email address.");
      chk("co-street", val("co-street").length >= 3, "Enter your street address.");
      chk("co-suburb", val("co-suburb").length >= 2, "Enter your suburb.");
      chk("co-city", val("co-city").length >= 2, "Enter your city or town.");
      chk("co-province", !!val("co-province"), "Select your province.");
      chk("co-postal", /^\d{4}$/.test(val("co-postal")), "Enter a 4-digit postal code.");
      if (payValue() === "card") {
        var num = val("co-card").replace(/\s/g, "");
        chk("co-card", num.length >= 13 && luhn(num), "Enter a valid card number.");
        chk("co-cardname", val("co-cardname").length >= 2, "Enter the name on the card.");
        var m = /^(\d{2})\/(\d{2})$/.exec(val("co-exp")), okExp = false;
        if (m) {
          var mm = +m[1], yy = 2000 + +m[2], now = new Date();
          okExp = mm >= 1 && mm <= 12 && (yy > now.getFullYear() || (yy === now.getFullYear() && mm >= now.getMonth() + 1));
        }
        chk("co-exp", okExp, "Enter a valid expiry date.");
        chk("co-cvv", /^\d{3,4}$/.test(val("co-cvv")), "Enter the 3 or 4 digit CVV.");
      }
      return !bad;
    }

    /* place order */
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) {
        $("co-form-err").textContent = "Please fix the highlighted fields.";
        var f = form.querySelector("[aria-invalid]"); if (f) { f.scrollIntoView({ behavior: "smooth", block: "center" }); f.focus({ preventScroll: true }); }
        return;
      }
      var btn = $("co-place"); btn.disabled = true; btn.classList.add("is-busy");

      var ship = shipValue(), t = totals(subtotal, ship), pay = payValue(), num = val("co-card").replace(/\s/g, "");
      var order = {
        id: "VEL-" + Date.now().toString().slice(-6) + Math.floor(Math.random() * 90 + 10),
        account: user ? user.email : "",
        date: new Date().toISOString(),
        customer: { name: val("co-name"), email: val("co-email"), phone: val("co-phone") },
        address: { street: val("co-street"), unit: val("co-unit"), suburb: val("co-suburb"), city: val("co-city"), province: val("co-province"), postal: val("co-postal"), notes: val("co-notes") },
        ship: ship, eta: ship === "express" ? range(1, 1) : range(2, 4),
        payment: pay === "card" ? cardBrand(num) + " ending " + num.slice(-4) : pay === "payflex" ? "Payflex" : "Instant EFT",   // never the full number
        items: list.map(function (l) { return { id: l.p.id, name: l.p.name, price: l.p.price, qty: l.qty }; }),
        subtotal: subtotal, delivery: t.fee, total: t.total, vat: t.vat, status: "Order placed"
      };

      setTimeout(function () {
        var orders = readOrders(); orders.unshift(order); writeOrders(orders);

        if ($("co-save").checked) {
          var all = []; try { all = JSON.parse(localStorage.getItem("ww_addresses")) || []; } catch (x) {}
          var rec = { id: "a" + Date.now().toString(36), label: "Home", street: order.address.street, unit: order.address.unit, suburb: order.address.suburb, city: order.address.city, province: order.address.province, postal: order.address.postal, phone: order.customer.phone, notes: order.address.notes };
          all.push(rec);
          try { localStorage.setItem("ww_addresses", JSON.stringify(all)); localStorage.setItem("ww_address_active", rec.id); localStorage.setItem("ww_address", rec.suburb + ", " + rec.postal); } catch (x) {}
        }
        if (window.WW) WW.setCart({});                       // empties the cart and updates the badge
        window.location.href = "order-confirmation.html?order=" + encodeURIComponent(order.id);
      }, 900);
    });

    update(); showPane();
  }

  /* =====================================================
     CONFIRMATION PAGE
     ===================================================== */
  function initConfirmation() {
    var id = new URLSearchParams(window.location.search).get("order");
    var orders = readOrders();
    var o = orders.filter(function (x) { return x.id === id; })[0] || (!id ? orders[0] : null);
    if (!o) { $("oc-none").hidden = false; return; }
    $("oc-wrap").hidden = false;

    var first = (o.customer.name || "").split(" ")[0] || "there";
    $("oc-title").textContent = "Thank you, " + first + "!";
    $("oc-sub").textContent = "We've sent a confirmation to " + o.customer.email + ".";
    $("oc-id").textContent = o.id;
    $("oc-eta").textContent = o.eta;
    $("oc-pay").textContent = o.payment;
    $("oc-total").textContent = money(o.total);

    var ul = $("oc-items"); ul.textContent = "";
    o.items.forEach(function (it) {
      var p = byId(it.id) || { tone: "#777", name: it.name, cat: "" };
      var li = el("li", "co-item"), th = el("div", "co-thumb");
      th.style.backgroundColor = p.tone; if (p.img) th.style.backgroundImage = "url(" + img(p, 160) + ")";
      th.appendChild(el("em", "", String(it.qty)));
      var t = el("div"); t.appendChild(el("strong", "", it.name)); t.appendChild(el("small", "", money(it.price) + " each"));
      li.appendChild(th); li.appendChild(t); li.appendChild(el("span", "co-item-price", money(it.price * it.qty)));
      ul.appendChild(li);
    });

    var a = o.address;
    $("oc-addr").textContent = [o.customer.name, a.street + (a.unit ? ", " + a.unit : ""), a.suburb + ", " + a.city, a.province + " " + a.postal, a.notes ? "Note: " + a.notes : ""].filter(Boolean).join("\n");
    $("oc-sub-amt").textContent = money(o.subtotal);
    $("oc-ship-amt").textContent = o.delivery ? money(o.delivery) : "Free";
    $("oc-total-amt").textContent = money(o.total);
    $("oc-vat").textContent = "Includes VAT of " + money(o.vat);
  }

  if ($("co-form")) initCheckout();
  if ($("oc-wrap")) initConfirmation();
})();