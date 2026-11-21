/* ==========================================================
   app.js – React components (no build step, no JSX)
   Mounts into <div id="root" data-view="..."> on:
     index.html  -> "featured"
     shop.html   -> "shop"
     deals.html  -> "deals"
     cart.html   -> "cart"
   Uses React.createElement so it works when opened straight
   from the file system (no Babel / server needed).
   ========================================================== */
(function () {
  "use strict";

  var rootEl = document.getElementById("root");
  if (!rootEl) return;

  if (!window.React || !window.ReactDOM) {
    rootEl.innerHTML =
      '<p class="body-md">React could not be loaded. Check your internet connection and refresh the page.</p>';
    return;
  }

  var h = React.createElement;
  var useState = React.useState;
  var useEffect = React.useEffect;
  var useMemo = React.useMemo;
  var PRODUCTS = window.PRODUCTS;
  var WW = window.WW;

  function pageRoot() { return document.body.getAttribute("data-root") || ""; }

  /* ---------- cart state hook (kept in sync with localStorage) ---------- */
  function useCart() {
    var s = useState(WW.getCart());
    var cart = s[0], setLocal = s[1];

    useEffect(function () {
      function sync() { setLocal(WW.getCart()); }
      window.addEventListener("cartchange", sync);
      window.addEventListener("storage", sync);
      return function () {
        window.removeEventListener("cartchange", sync);
        window.removeEventListener("storage", sync);
      };
    }, []);

    function change(id, delta) {
      var next = Object.assign({}, WW.getCart());
      var qty = (next[id] || 0) + delta;
      if (qty <= 0) delete next[id]; else next[id] = qty;
      WW.setCart(next);
    }
    function clear() { WW.setCart({}); }

    return { cart: cart, change: change, clear: clear };
  }

  /* ---------- icons ---------- */
  /* Photo helpers: p.img is an Unsplash URL; the grey tone shows while it loads or if it is missing. */
  function imgUrl(p, w) { return p.img ? p.img.replace(/w=\d+/, "w=" + w) : ""; }
  function photoStyle(p, w) {
    var st = { backgroundColor: p.tone };
    if (p.img) { st.backgroundImage = "url(" + imgUrl(p, w) + ")"; }
    return st;
  }

  var PATH_HEART = "M12 20.5s-8-4.9-8-11a4.6 4.6 0 018-3 4.6 4.6 0 018 3c0 6.1-8 11-8 11z";
  var PATH_BAG   = "M5 8h14l-1 12H6L5 8zM9 8V6a3 3 0 016 0v2";
  var PATH_CHECK = "M5 12.5l4.5 4.5L19 7.5";

  function Icon(props) {
    return h("svg", {
      className: "icon", viewBox: "0 0 24 24", fill: props.fill || "none",
      stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "square", "aria-hidden": "true"
    }, h("path", { d: props.d }));
  }

  /* ---------- wishlist (saved in localStorage, no page needed yet) ---------- */
  var WISH_KEY = "ww_wishlist";

  function readWish() {
    try { return JSON.parse(localStorage.getItem(WISH_KEY)) || []; }
    catch (e) { return []; }
  }

  function useWishlist() {
    var s = useState(readWish);
    var ids = s[0], setIds = s[1];

    useEffect(function () {
      function sync() { setIds(readWish()); }
      window.addEventListener("wishlistchange", sync);
      window.addEventListener("storage", sync);
      return function () {
        window.removeEventListener("wishlistchange", sync);
        window.removeEventListener("storage", sync);
      };
    }, []);

    function toggle(p) {
      var list = readWish();
      var i = list.indexOf(p.id);
      if (i > -1) { list.splice(i, 1); WW.toast("Removed from wishlist"); }
      else { list.push(p.id); WW.toast("Saved to wishlist"); }
      try { localStorage.setItem(WISH_KEY, JSON.stringify(list)); } catch (e) {}
      window.dispatchEvent(new Event("wishlistchange"));
    }

    return { has: function (id) { return ids.indexOf(id) > -1; }, toggle: toggle };
  }

  /* ---------- Product card ---------- */
  function ProductCard(props) {
    var p = props.product;
    var onSale = p.was && p.was > p.price;
    var pct = onSale ? Math.round((1 - p.price / p.was) * 100) : 0;
    var href = pageRoot() + "HTML/product.html?id=" + p.id;

    var wish = useWishlist();
    var wished = wish.has(p.id);

    var as = useState(false);
    var added = as[0], setAdded = as[1];

    function add() {
      props.onAdd(p);
      setAdded(true);
      setTimeout(function () { setAdded(false); }, 1400);
    }

    return h("article", { className: "product-card" },
      h("div", { className: "product-media" },
        h("a", { className: "product-img", href: href, style: photoStyle(p, 600), tabIndex: -1, "aria-hidden": "true" },
          p.img ? null : h("b", null, p.name.charAt(0))
        ),
        onSale ? h("span", { className: "badge badge-yellow" }, "Save " + pct + "%") : null,
        h("button", {
          className: "wish" + (wished ? " is-on" : ""),
          type: "button",
          "aria-pressed": wished,
          "aria-label": (wished ? "Remove " : "Add ") + p.name + (wished ? " from wishlist" : " to wishlist"),
          onClick: function () { wish.toggle(p); }
        }, h(Icon, { d: PATH_HEART, fill: wished ? "currentColor" : "none" }))
      ),
      h("div", { className: "product-body" },
        h("span", { className: "product-cat" }, p.cat),
        h("a", { className: "product-name", href: href }, p.name),
        h("div", { className: "price-row" },
          h("span", { className: "price" }, WW.money(p.price)),
          onSale ? h("s", { className: "was" }, WW.money(p.was)) : null
        ),
        h("button", {
          className: "btn btn-cart" + (added ? " is-added" : ""),
          type: "button",
          onClick: add
        },
          h("span", null, added ? "Added" : "Add to cart"),
          h(Icon, { d: added ? PATH_CHECK : PATH_BAG })
        )
      )
    );
  }

  function ProductGrid(props) {
    if (!props.items.length) {
      return h("div", { className: "empty" },
        h("h3", { className: "display-md" }, "No products found"),
        h("p", null, "Try a different search or category.")
      );
    }
    return h("div", { className: "grid-5" },
      props.items.map(function (p) {
        return h(ProductCard, { key: p.id, product: p, onAdd: props.onAdd });
      })
    );
  }

  /* ---------- Featured (home page) ---------- */
  function Featured() {
    var c = useCart();
    var items = PRODUCTS.filter(function (p) { return p.was; }).slice(0, 5);
    return h(ProductGrid, {
      items: items,
      onAdd: function (p) { c.change(p.id, 1); WW.toast(p.name + " added to cart"); }
    });
  }

  /* ---------- Shop / Deals ---------- */
  function Shop(props) {
    var dealsOnly = props.dealsOnly;
    var c = useCart();
    var qs = useState("");
    var query = qs[0], setQuery = qs[1];
    var cs = useState("All");
    var category = cs[0], setCategory = cs[1];
    var ss = useState("featured");
    var sort = ss[0], setSort = ss[1];

    // honour ?cat=Food (home page / menu links) and ?q=bread (header search)
    useEffect(function () {
      var params = new URLSearchParams(window.location.search);
      if (params.get("cat")) setCategory(params.get("cat"));
      if (params.get("q")) setQuery(params.get("q"));
    }, []);

    var categories = ["All", "Food", "Clothing", "Home", "Beauty"];

    var items = useMemo(function () {
      var list = PRODUCTS.filter(function (p) {
        if (dealsOnly && !p.was) return false;
        if (category !== "All" && p.cat !== category) return false;
        if (query && p.name.toLowerCase().indexOf(query.toLowerCase()) === -1) return false;
        return true;
      });
      if (sort === "low") list = list.slice().sort(function (a, b) { return a.price - b.price; });
      if (sort === "high") list = list.slice().sort(function (a, b) { return b.price - a.price; });
      if (sort === "name") list = list.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
      return list;
    }, [dealsOnly, category, query, sort]);

    return h("div", null,
      h("div", { className: "toolbar" },
        h("input", {
          type: "search", placeholder: "Search products", "aria-label": "Search products",
          value: query, onChange: function (e) { setQuery(e.target.value); }
        }),
        h("select", {
          "aria-label": "Sort products", value: sort,
          onChange: function (e) { setSort(e.target.value); }
        },
          h("option", { value: "featured" }, "Sort: Featured"),
          h("option", { value: "low" }, "Price: low to high"),
          h("option", { value: "high" }, "Price: high to low"),
          h("option", { value: "name" }, "Name: A to Z")
        )
      ),
      h("div", { className: "toolbar", role: "group", "aria-label": "Categories" },
        categories.map(function (cat) {
          return h("button", {
            key: cat, type: "button", className: "chip",
            "aria-pressed": category === cat,
            onClick: function () { setCategory(cat); }
          }, cat);
        })
      ),
      h("p", { className: "body-sm muted", role: "status" }, items.length + " product" + (items.length === 1 ? "" : "s")),
      h(ProductGrid, {
        items: items,
        onAdd: function (p) { c.change(p.id, 1); WW.toast(p.name + " added to cart"); }
      })
    );
  }

  /* ---------- Cart page ---------- */
  var DELIVERY_THRESHOLD = 600;
  var DELIVERY_FEE = 60;

  function Cart() {
    var c = useCart();
    var cs = useState(false);
    var ordered = cs[0], setOrdered = cs[1];

    var lines = Object.keys(c.cart).map(function (id) {
      var p = PRODUCTS.filter(function (x) { return String(x.id) === id; })[0];
      return p ? { product: p, qty: c.cart[id] } : null;
    }).filter(Boolean);

    var subtotal = lines.reduce(function (s, l) { return s + l.product.price * l.qty; }, 0);
    var delivery = subtotal === 0 || subtotal >= DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    var total = subtotal + delivery;

    if (ordered) {
      return h("div", { className: "empty" },
        h("span", { className: "badge badge-yellow" }, "Order placed"),
        h("h2", { className: "display-md", style: { marginTop: 16 } }, "Thank you!"),
        h("p", null, "This is a demo, so nothing was actually ordered."),
        h("a", { className: "btn", href: pageRoot() + "HTML/shop.html" }, "Keep shopping")
      );
    }

    if (!lines.length) {
      return h("div", { className: "empty" },
        h("h2", { className: "display-md" }, "Your cart is empty"),
        h("p", null, "Add a few items and they'll show up here."),
        h("a", { className: "btn", href: pageRoot() + "HTML/shop.html" }, "Browse products")
      );
    }

    return h("div", { className: "cart-layout" },
      h("div", null,
        lines.map(function (l) {
          var p = l.product;
          return h("div", { className: "cart-row", key: p.id },
            h("div", { className: "cart-thumb", style: photoStyle(p, 200), "aria-hidden": "true" }, p.img ? null : p.name.charAt(0)),
            h("div", null,
              h("a", { className: "product-name", href: pageRoot() + "HTML/product.html?id=" + p.id }, p.name),
              h("div", { className: "body-sm muted" }, WW.money(p.price) + " each"),
              h("div", { className: "qty" },
                h("button", { type: "button", "aria-label": "Decrease quantity of " + p.name, onClick: function () { c.change(p.id, -1); } }, "−"),
                h("span", { "aria-live": "polite" }, l.qty),
                h("button", { type: "button", "aria-label": "Increase quantity of " + p.name, onClick: function () { c.change(p.id, 1); } }, "+")
              )
            ),
            h("div", { className: "price" }, WW.money(p.price * l.qty))
          );
        }),
        h("button", { className: "btn btn-secondary", type: "button", style: { marginTop: 16 }, onClick: c.clear }, "Clear cart")
      ),
      h("aside", { className: "summary", "aria-label": "Order summary" },
        h("h2", { className: "display-md", style: { fontSize: 24 } }, "Order summary"),
        h("div", { className: "summary-row" }, h("span", null, "Subtotal"), h("span", null, WW.money(subtotal))),
        h("div", { className: "summary-row" }, h("span", null, "Delivery"), h("span", null, delivery ? WW.money(delivery) : "Free")),
        delivery
          ? h("p", { className: "body-sm muted", style: { margin: 0 } }, "Spend " + WW.money(DELIVERY_THRESHOLD - subtotal) + " more for free delivery.")
          : null,
        h("div", { className: "summary-row summary-total" }, h("span", null, "Total"), h("span", null, WW.money(total))),
        h("button", { className: "btn", type: "button", onClick: function () { c.clear(); setOrdered(true); } }, "Checkout")
      )
    );
  }

  /* ---------- Product detail page ---------- */
  function ProductDetail() {
    var c = useCart();
    var qs = useState(1);
    var qty = qs[0], setQty = qs[1];

    var id = new URLSearchParams(window.location.search).get("id");
    var p = PRODUCTS.filter(function (x) { return String(x.id) === id; })[0];

    if (!p) {
      return h("div", { className: "empty" },
        h("h2", { className: "display-md" }, "Product not found"),
        h("p", null, "We couldn't find that product."),
        h("a", { className: "btn", href: pageRoot() + "HTML/shop.html" }, "Back to shop")
      );
    }

    document.title = p.name + " \u2013 Woolworths (demo)";
    var onSale = p.was && p.was > p.price;
    var pct = onSale ? Math.round((1 - p.price / p.was) * 100) : 0;
    var related = PRODUCTS.filter(function (x) { return x.cat === p.cat && x.id !== p.id; }).slice(0, 5);

    return h("div", null,
      h("nav", { className: "breadcrumb body-sm", "aria-label": "Breadcrumb" },
        h("a", { href: pageRoot() + "HTML/shop.html" }, "Shop"), " / ",
        h("a", { href: pageRoot() + "HTML/shop.html?cat=" + p.cat }, p.cat), " / ",
        h("span", null, p.name)
      ),
      h("div", { className: "detail" },
        h("div", { className: "detail-img", style: photoStyle(p, 1000), role: "img", "aria-label": p.name },
          onSale ? h("span", { className: "badge badge-yellow" }, "Save " + pct + "%") : null,
          p.img ? null : h("b", null, p.name.charAt(0))
        ),
        h("div", { className: "detail-info" },
          h("span", { className: "eyebrow muted" }, p.cat),
          h("h1", { className: "display-md" }, p.name),
          h("div", { className: "price detail-price" },
            WW.money(p.price),
            onSale ? h("s", null, WW.money(p.was)) : null
          ),
          h("p", { className: "body-lg muted" }, p.desc || ""),
          h("div", { className: "buy-row" },
            h("div", { className: "qty", role: "group", "aria-label": "Quantity" },
              h("button", { type: "button", "aria-label": "Decrease quantity", onClick: function () { setQty(Math.max(1, qty - 1)); } }, "\u2212"),
              h("span", { "aria-live": "polite" }, qty),
              h("button", { type: "button", "aria-label": "Increase quantity", onClick: function () { setQty(Math.min(20, qty + 1)); } }, "+")
            ),
            h("button", {
              className: "btn", type: "button",
              onClick: function () { c.change(p.id, qty); WW.toast(qty + " \u00d7 " + p.name + " added to cart"); }
            }, "Add to cart \u2013 " + WW.money(p.price * qty)),
            h("a", { className: "btn btn-secondary", href: pageRoot() + "HTML/cart.html" }, "View cart")
          ),
          p.details ? h("div", { className: "info-block", style: { marginTop: 32 } },
            h("h3", null, "Product details"),
            h("ul", { className: "detail-list" }, p.details.map(function (d) { return h("li", { key: d }, d); }))
          ) : null
        )
      ),
      related.length ? h("section", { className: "related" },
        h("h2", { className: "display-md", style: { marginBottom: 24 } }, "More in " + p.cat),
        h(ProductGrid, {
          items: related,
          onAdd: function (x) { c.change(x.id, 1); WW.toast(x.name + " added to cart"); }
        })
      ) : null
    );
  }

  /* ---------- mount ---------- */
  var view = rootEl.getAttribute("data-view");
  var component =
    view === "featured" ? h(Featured) :
    view === "deals"    ? h(Shop, { dealsOnly: true }) :
    view === "cart"     ? h(Cart) :
    view === "product"  ? h(ProductDetail) :
                          h(Shop, { dealsOnly: false });

  ReactDOM.createRoot(rootEl).render(component);
})();