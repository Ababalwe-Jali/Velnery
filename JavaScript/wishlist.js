/* VELNERY wishlist page. Reads the product ids saved by the hearts (localStorage "ww_wishlist"). */
(function () {
  "use strict";

  var KEY = "ww_wishlist";
  var PRODUCTS = window.PRODUCTS || [];
  var WW = window.WW;

  var PATH_HEART = "M12 20.5s-8-4.9-8-11a4.6 4.6 0 018-3 4.6 4.6 0 018 3c0 6.1-8 11-8 11z";
  var PATH_BAG = "M5 8h14l-1 12H6L5 8zM9 8V6a3 3 0 016 0v2";
  var PATH_CHECK = "M5 12.5l4.5 4.5L19 7.5";

  var sort = "added";

  function $(id) { return document.getElementById(id); }
  function root() { return document.body.getAttribute("data-root") || ""; }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }

  function readIds() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function writeIds(ids) {
    try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch (e) {}
    window.dispatchEvent(new Event("wishlistchange"));
  }
  function product(id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; }

  function icon(d, filled) {
    var ns = "http://www.w3.org/2000/svg";
    var s = document.createElementNS(ns, "svg");
    s.setAttribute("class", "icon"); s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("fill", filled ? "currentColor" : "none"); s.setAttribute("stroke", "currentColor");
    s.setAttribute("stroke-width", "1.5"); s.setAttribute("stroke-linecap", "square"); s.setAttribute("aria-hidden", "true");
    var p = document.createElementNS(ns, "path"); p.setAttribute("d", d); s.appendChild(p);
    return s;
  }

  function addToCart(p, qty) {
    var cart = Object.assign({}, WW.getCart());
    cart[p.id] = (cart[p.id] || 0) + (qty || 1);
    WW.setCart(cart);
  }

  /* ---------- one product card (same markup/classes as the shop cards) ---------- */
  function card(p, opts) {
    var onSale = p.was && p.was > p.price;
    var pct = onSale ? Math.round((1 - p.price / p.was) * 100) : 0;
    var href = root() + "HTML/product.html?id=" + p.id;
    var inList = readIds().indexOf(p.id) > -1;

    var art = el("article", "product-card");
    art.setAttribute("data-id", p.id);

    var media = el("div", "product-media");
    var a = el("a", "product-img"); a.href = href; a.tabIndex = -1; a.setAttribute("aria-hidden", "true");
    a.style.backgroundColor = p.tone;
    if (p.img) a.style.backgroundImage = "url(" + p.img.replace(/w=\d+/, "w=600") + ")"; else a.appendChild(el("b", "", p.name.charAt(0)));
    media.appendChild(a);
    if (onSale) media.appendChild(el("span", "badge badge-yellow", "Save " + pct + "%"));

    var wish = el("button", "wish" + (inList ? " is-on" : "")); wish.type = "button";
    wish.setAttribute("aria-pressed", String(inList));
    wish.setAttribute("aria-label", (inList ? "Remove " : "Add ") + p.name + (inList ? " from wishlist" : " to wishlist"));
    wish.appendChild(icon(PATH_HEART, inList));
    wish.addEventListener("click", function () {
      var ids = readIds(), i = ids.indexOf(p.id);
      if (i > -1) {
        ids.splice(i, 1); writeIds(ids); WW.toast("Removed from wishlist");
        if (opts.onRemoved) opts.onRemoved(art);
      } else {
        ids.push(p.id); writeIds(ids); WW.toast("Saved to wishlist");
        wish.classList.add("is-on"); wish.setAttribute("aria-pressed", "true"); wish.replaceChild(icon(PATH_HEART, true), wish.firstChild);
        if (opts.onAdded) opts.onAdded();
      }
    });
    media.appendChild(wish);
    art.appendChild(media);

    var body = el("div", "product-body");
    body.appendChild(el("span", "product-cat", p.cat));
    var name = el("a", "product-name", p.name); name.href = href; body.appendChild(name);
    var row = el("div", "price-row"); row.appendChild(el("span", "price", WW.money(p.price)));
    if (onSale) row.appendChild(el("s", "was", WW.money(p.was)));
    body.appendChild(row);

    var btn = el("button", "btn btn-cart"); btn.type = "button";
    var label = el("span", "", "Add to cart"); btn.appendChild(label); btn.appendChild(icon(PATH_BAG));
    btn.addEventListener("click", function () {
      addToCart(p, 1); WW.toast(p.name + " added to cart");
      btn.classList.add("is-added"); label.textContent = "Added"; btn.replaceChild(icon(PATH_CHECK), btn.lastChild);
      setTimeout(function () { btn.classList.remove("is-added"); label.textContent = "Add to cart"; btn.replaceChild(icon(PATH_BAG), btn.lastChild); }, 1400);
    });
    body.appendChild(btn);
    art.appendChild(body);
    return art;
  }

  /* ---------- page ---------- */
  function sorted(list) {
    var l = list.slice();   // list is in saved order (oldest first), so "added" shows newest first
    if (sort === "added") l.reverse();
    if (sort === "low") l.sort(function (a, b) { return a.price - b.price; });
    if (sort === "high") l.sort(function (a, b) { return b.price - a.price; });
    if (sort === "name") l.sort(function (a, b) { return a.name.localeCompare(b.name); });
    return l;
  }

  function render() {
    var items = readIds().map(product).filter(Boolean);
    var grid = $("wl-grid"); grid.textContent = "";
    var has = items.length > 0;

    $("wl-bar").hidden = !has;
    $("wl-empty").hidden = has;
    grid.hidden = !has;
    $("wl-sub").textContent = has ? "Everything you've saved, in one place." : "Save products you love and find them here.";

    if (has) {
      $("wl-count").textContent = items.length + " saved item" + (items.length === 1 ? "" : "s");
      sorted(items).forEach(function (p) {
        grid.appendChild(card(p, { onRemoved: function (art) {
          art.classList.add("is-leaving");
          setTimeout(render, 260);
        } }));
      });
    }
    renderSuggestions(items);
  }

  function renderSuggestions(items) {
    var saved = items.map(function (p) { return p.id; });
    var cats = items.map(function (p) { return p.cat; });
    var pool = PRODUCTS.filter(function (p) { return saved.indexOf(p.id) === -1; });
    pool.sort(function (a, b) {                                    // same-category products first, then deals
      var sa = (cats.indexOf(a.cat) > -1 ? 2 : 0) + (a.was ? 1 : 0), sb = (cats.indexOf(b.cat) > -1 ? 2 : 0) + (b.was ? 1 : 0);
      return sb - sa;
    });
    var picks = pool.slice(0, 5), box = $("wl-suggest");
    box.textContent = "";
    $("wl-more").hidden = !picks.length;
    picks.forEach(function (p) { box.appendChild(card(p, { onAdded: function () { setTimeout(render, 400); } })); });
  }

  $("wl-sort").addEventListener("change", function (e) { sort = e.target.value; render(); });
  $("wl-add-all").addEventListener("click", function () {
    var items = readIds().map(product).filter(Boolean);
    if (!items.length) return;
    var cart = Object.assign({}, WW.getCart());
    items.forEach(function (p) { cart[p.id] = (cart[p.id] || 0) + 1; });
    WW.setCart(cart);
    WW.toast(items.length + " item" + (items.length === 1 ? "" : "s") + " added to cart");
  });
  $("wl-clear").addEventListener("click", function () {
    if (!readIds().length) return;
    if (window.confirm("Remove everything from your wishlist?")) { writeIds([]); render(); WW.toast("Wishlist cleared"); }
  });
  window.addEventListener("storage", render);   // changed in another tab

  render();
})();