/* VELNERY account + order history. Reads data saved by the rest of the site in this browser:
   ww_user (session), ww_users (demo accounts), ww_orders, ww_addresses, ww_address_active, ww_wishlist. */
(function () {
  "use strict";

  var PRODUCTS = window.PRODUCTS || [];
  var WW = window.WW;
  var TABS = ["overview", "orders", "addresses", "details"];

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function root() { return document.body.getAttribute("data-root") || ""; }
  function money(n) { return WW.money(n); }
  function product(id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; }
  function json(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; } }
  function longDate(iso) { return new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" }); }

  /* ---------- session ---------- */
  function getUser() { try { return JSON.parse(localStorage.getItem("ww_user") || sessionStorage.getItem("ww_user")); } catch (e) { return null; } }
  function setUser(u) {
    var store = localStorage.getItem("ww_user") ? localStorage : sessionStorage;
    try { store.setItem("ww_user", JSON.stringify(u)); } catch (e) {}
  }
  function signOut() {
    try { localStorage.removeItem("ww_user"); sessionStorage.removeItem("ww_user"); } catch (e) {}
    window.dispatchEvent(new Event("authchange"));
    WW.toast("You've been signed out.");
  }
  // same scheme auth.js uses, so passwords created in the sign-up dialog can be checked/changed here
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

  /* ---------- orders ---------- */
  function allOrders() { return json("ww_orders", []); }
  function ordersFor(user) {
    var me = user.email.toLowerCase();
    return allOrders().filter(function (o) {
      return (o.account && o.account.toLowerCase() === me) || (o.customer && o.customer.email && o.customer.email.toLowerCase() === me);
    });
  }
  var STEPS = ["Order placed", "Packed", "On its way", "Delivered"];
  // DEMO: status advances with time so the tracker can be tested (placed → packed after 1 min → on its way after 3 → delivered after 6)
  function stepOf(o) {
    var m = (Date.now() - new Date(o.date).getTime()) / 60000;
    return m < 1 ? 0 : m < 3 ? 1 : m < 6 ? 2 : 3;
  }

  function thumbs(o) {
    var box = el("div", "ac-thumbs");
    o.items.forEach(function (it) {
      var p = product(it.id) || { tone: "#777" };
      var t = el("div", "ac-thumb"); t.title = it.name; t.style.backgroundColor = p.tone;
      if (p.img) t.style.backgroundImage = "url(" + p.img.replace(/w=\d+/, "w=120") + ")";
      t.appendChild(el("em", "", String(it.qty)));
      box.appendChild(t);
    });
    return box;
  }

  function orderCard(o, opts) {
    opts = opts || {};
    var step = stepOf(o);
    var art = el("article", "ac-order"); art.id = "order-" + o.id;

    var head = el("div", "ac-order-head");
    [["Order", o.id], ["Placed", longDate(o.date)], ["Total", money(o.total)]].forEach(function (f) {
      var d = el("div"); d.appendChild(el("small", "", f[0])); d.appendChild(el("strong", "", f[1])); head.appendChild(d);
    });
    var sd = el("div"); sd.appendChild(el("small", "", "Status"));
    sd.appendChild(el("span", "ac-status" + (step === 3 ? " is-done" : ""), STEPS[step])); head.appendChild(sd);
    art.appendChild(head);

    var body = el("div", "ac-order-body");
    body.appendChild(thumbs(o));

    var detail = el("div", "ac-detail"); detail.hidden = !opts.open;
    var steps = el("ol", "ac-track-steps"); steps.setAttribute("aria-label", "Order progress");
    STEPS.forEach(function (s, i) { steps.appendChild(el("li", i <= step ? "is-done" : "", s)); });
    detail.appendChild(steps);

    var grid = el("div", "ac-detail-grid");
    var a = o.address, dA = el("div");
    dA.appendChild(el("h4", "", "Delivery to"));
    dA.appendChild(el("p", "", [o.customer.name, a.street + (a.unit ? ", " + a.unit : ""), a.suburb + ", " + a.city, a.province + " " + a.postal].join("\n")));
    var dB = el("div");
    dB.appendChild(el("h4", "", "Payment and delivery"));
    dB.appendChild(el("p", "", o.payment + "\n" + (o.ship === "express" ? "Express" : "Standard") + " delivery, " + o.eta));
    grid.appendChild(dA); grid.appendChild(dB); detail.appendChild(grid);

    var ul = el("ul", "ac-lines");
    o.items.forEach(function (it) {
      var li = el("li"); li.appendChild(el("span", "", it.qty + " × " + it.name)); li.appendChild(el("span", "", money(it.price * it.qty))); ul.appendChild(li);
    });
    [["Subtotal", money(o.subtotal)], ["Delivery", o.delivery ? money(o.delivery) : "Free"]].forEach(function (r) {
      var li = el("li"); li.appendChild(el("span", "", r[0])); li.appendChild(el("span", "", r[1])); ul.appendChild(li);
    });
    var tot = el("li", "ac-total"); tot.appendChild(el("span", "", "Total")); tot.appendChild(el("span", "", money(o.total))); ul.appendChild(tot);
    detail.appendChild(ul);
    body.appendChild(detail);

    var acts = el("div", "ac-order-actions");
    var view = el("button", "btn btn-secondary", detail.hidden ? "View details" : "Hide details"); view.type = "button";
    view.setAttribute("aria-expanded", String(!detail.hidden));
    view.addEventListener("click", function () {
      detail.hidden = !detail.hidden; view.textContent = detail.hidden ? "View details" : "Hide details"; view.setAttribute("aria-expanded", String(!detail.hidden));
    });
    var again = el("button", "btn", "Buy again"); again.type = "button";
    again.addEventListener("click", function () {
      var cart = Object.assign({}, WW.getCart());
      o.items.forEach(function (it) { if (product(it.id)) cart[it.id] = (cart[it.id] || 0) + it.qty; });
      WW.setCart(cart); WW.toast("Items added to your cart");
    });
    acts.appendChild(view); acts.appendChild(again);
    body.appendChild(acts);
    art.appendChild(body);
    return art;
  }

  /* ---------- panels ---------- */
  function renderOverview(user, orders) {
    $("ov-name").textContent = (user.name || "there").split(" ")[0];
    $("ov-email").textContent = user.email;
    $("st-orders").textContent = orders.length;
    $("st-addr").textContent = json("ww_addresses", []).length;
    $("st-wish").textContent = json("ww_wishlist", []).length;
    var box = $("ov-latest"); box.textContent = "";
    if (orders.length) box.appendChild(orderCard(orders[0], {}));
    else {
      var e = el("div", "ac-empty"); e.appendChild(el("p", "muted", "You haven't placed an order yet."));
      var a = el("a", "btn", "Start shopping"); a.href = "shop.html"; e.appendChild(a); box.appendChild(e);
    }
  }

  var findTerm = "";
  function renderOrders(orders) {
    var box = $("ord-list"); box.textContent = "";
    var list = orders.filter(function (o) { return !findTerm || o.id.toLowerCase().indexOf(findTerm) > -1; });
    if (!list.length) {
      var e = el("div", "ac-empty");
      e.appendChild(el("p", "muted", orders.length ? "No orders match that number." : "No orders yet. When you place an order it will show up here."));
      if (!orders.length) { var a = el("a", "btn", "Browse products"); a.href = "shop.html"; e.appendChild(a); }
      box.appendChild(e); return;
    }
    list.forEach(function (o) { box.appendChild(orderCard(o, {})); });
  }

  function renderAddresses() {
    var list = json("ww_addresses", []), act = "";
    try { act = localStorage.getItem("ww_address_active") || ""; } catch (e) {}
    var box = $("addr-list"); box.textContent = "";
    if (!list.length) {
      var e = el("div", "ac-empty"); e.appendChild(el("p", "muted", "You haven't saved an address yet."));
      box.appendChild(e); return;
    }
    list.forEach(function (a) {
      var c = el("div", "ac-addr" + (a.id === act ? " is-default" : ""));
      if (a.id === act) c.appendChild(el("span", "ac-tag", "Delivering here"));
      c.appendChild(el("strong", "", a.label));
      c.appendChild(el("p", "", [a.street, a.unit, a.suburb, a.city, a.province, a.postal].filter(Boolean).join(", ")));
      if (a.notes) c.appendChild(el("p", "", "Note: " + a.notes));
      var acts = el("div", "ac-addr-actions");
      if (a.id !== act) {
        var d = el("button", "ac-link", "Deliver here"); d.type = "button";
        d.addEventListener("click", function () { setActive(a); });
        acts.appendChild(d);
      }
      var r = el("button", "ac-link", "Remove"); r.type = "button";
      r.addEventListener("click", function () { removeAddress(a.id); });
      acts.appendChild(r);
      c.appendChild(acts); box.appendChild(c);
    });
  }
  function setActive(a) {
    try { localStorage.setItem("ww_address_active", a.id); localStorage.setItem("ww_address", a.suburb + ", " + a.postal); } catch (e) {}
    var t = document.getElementById("address-text"); if (t) t.textContent = a.suburb + ", " + a.postal;
    renderAddresses(); WW.toast("Delivering to " + a.suburb + ", " + a.postal);
  }
  function removeAddress(id) {
    var list = json("ww_addresses", []).filter(function (a) { return a.id !== id; });
    try { localStorage.setItem("ww_addresses", JSON.stringify(list)); } catch (e) {}
    var act = ""; try { act = localStorage.getItem("ww_address_active") || ""; } catch (e) {}
    if (act === id) {
      var n = list[0];
      try { localStorage.setItem("ww_address_active", n ? n.id : ""); localStorage.setItem("ww_address", n ? n.suburb + ", " + n.postal : ""); } catch (e) {}
      var t = document.getElementById("address-text"); if (t) t.textContent = n ? n.suburb + ", " + n.postal : "Set address";
    }
    renderAddresses(); $("st-addr").textContent = list.length; WW.toast("Address removed.");
  }

  /* ---------- details forms ---------- */
  function setErr(id, msg) {
    var e = $(id + "-err"); if (e) e.textContent = msg || "";
    var i = $(id); if (i) { if (msg) i.setAttribute("aria-invalid", "true"); else i.removeAttribute("aria-invalid"); }
    return !!msg;
  }
  function initForms() {
    $("det-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var user = getUser(); if (!user) return;
      var name = $("det-name").value.trim();
      $("det-ok").textContent = "";
      if (setErr("det-name", name.length < 2 ? "Enter your full name." : "")) return;
      user.name = name; setUser(user);
      var users = json("ww_users", {});
      if (users[user.email]) { users[user.email].name = name; try { localStorage.setItem("ww_users", JSON.stringify(users)); } catch (x) {} }
      window.dispatchEvent(new Event("authchange"));
      $("det-ok").textContent = "Your details have been saved.";
    });
    $("det-name").addEventListener("input", function () { setErr("det-name", ""); $("det-ok").textContent = ""; });

    $("pw-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var user = getUser(); if (!user) return;
      var cur = $("pw-cur").value, nw = $("pw-new").value, cf = $("pw-conf").value, bad = false;
      $("pw-ok").textContent = "";
      if (setErr("pw-cur", cur ? "" : "Enter your current password.")) bad = true;
      if (setErr("pw-new", nw.length >= 8 ? "" : "Use at least 8 characters.")) bad = true;
      if (setErr("pw-conf", cf === nw ? "" : "Passwords don't match.")) bad = true;
      if (bad) return;
      var users = json("ww_users", {}), rec = users[user.email];
      if (!rec) { setErr("pw-cur", "We couldn't find this account on this device."); return; }
      hashPw(user.email, cur).then(function (h) {
        if (h !== rec.hash) { setErr("pw-cur", "Current password is incorrect."); return; }
        return hashPw(user.email, nw).then(function (nh) {
          rec.hash = nh; try { localStorage.setItem("ww_users", JSON.stringify(users)); } catch (x) {}
          $("pw-form").reset(); $("pw-ok").textContent = "Your password has been updated.";
        });
      });
    });
    ["pw-cur", "pw-new", "pw-conf"].forEach(function (id) { $(id).addEventListener("input", function () { setErr(id, ""); $("pw-ok").textContent = ""; }); });
  }

  /* ---------- guest: track an order ---------- */
  function initTrack() {
    $("ac-track-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var id = $("ac-track-id").value.trim().toUpperCase(), out = $("ac-track-result");
      out.textContent = ""; $("ac-track-err").textContent = "";
      if (!id) { $("ac-track-err").textContent = "Enter your order number."; return; }
      var o = allOrders().filter(function (x) { return x.id.toUpperCase() === id; })[0];
      if (!o) { $("ac-track-err").textContent = "We couldn't find that order on this device."; return; }
      out.appendChild(orderCard(o, { open: true }));
    });
    $("ac-signin").addEventListener("click", function () { if (window.VelneryAuth) VelneryAuth.open("signin"); });
    $("ac-signup").addEventListener("click", function () { if (window.VelneryAuth) VelneryAuth.open("signup"); });
  }

  /* ---------- tabs + render ---------- */
  function currentTab() { var h = (location.hash || "").replace("#", ""); return TABS.indexOf(h) > -1 ? h : "overview"; }
  function showTab() {
    var t = currentTab();
    TABS.forEach(function (n) { $("tab-" + n).hidden = n !== t; });
    Array.prototype.forEach.call(document.querySelectorAll(".ac-nav a"), function (a) {
      var on = a.getAttribute("data-tab") === t; a.classList.toggle("is-current", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }

  function render() {
    var user = getUser();
    $("ac-guest").hidden = !!user;
    $("ac-app").hidden = !user;
    $("ac-sub").textContent = user ? "Orders, addresses and your details." : "Sign in, or track an order with its number.";
    if (!user) return;
    var orders = ordersFor(user);
    renderOverview(user, orders);
    renderOrders(orders);
    renderAddresses();
    $("det-name").value = user.name || ""; $("det-email").value = user.email;
    showTab();
  }

  $("ac-signout").addEventListener("click", signOut);
  $("addr-manage").addEventListener("click", function () { if (window.VelneryAddress) VelneryAddress.open(); });
  $("ac-find-form").addEventListener("submit", function (e) { e.preventDefault(); });
  $("ac-find-id").addEventListener("input", function (e) {
    findTerm = e.target.value.trim().toLowerCase(); var u = getUser(); if (u) renderOrders(ordersFor(u));
  });
  window.addEventListener("hashchange", function () { if (getUser()) showTab(); });
  window.addEventListener("authchange", render);        // sign in / sign out / details changed
  window.addEventListener("addresschange", render);     // address dialog saved something
  window.addEventListener("storage", render);

  initTrack(); initForms(); render();
})();