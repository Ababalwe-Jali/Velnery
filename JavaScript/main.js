/* ==========================================================
   main.js – shared on every page
   - Builds the header + footer so navigation stays consistent
   - Handles the mobile menu, cart badge and toast messages
   - Exposes a tiny shared "WW" helper used by the other scripts
   ========================================================== */
(function () {
  "use strict";

  // Pages that sit in /HTML need "../" to reach the root; index.html needs "".
  var root = document.body.getAttribute("data-root") || "";
  var current = document.body.getAttribute("data-page") || "";

  var PAGES = [
    { id: "home",   label: "Home",     href: root + "index.html" },
    { id: "shop",   label: "Shop",     href: root + "HTML/shop.html" },
    { id: "deals",  label: "Deals",    href: root + "HTML/deals.html" },
    { id: "stores", label: "Stores",   href: root + "HTML/stores.html" },
    { id: "about",  label: "About us", href: root + "HTML/about.html" },
    { id: "contact",label: "Contact",  href: root + "HTML/contact.html" }
  ];

  var CART_KEY = "ww_cart";

  // ---------- shared helpers ----------
  var WW = (window.WW = {});

  WW.money = function (n) {
    return "R" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  WW.getCart = function () {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }
    catch (e) { return {}; }
  };

  WW.setCart = function (cart) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* storage blocked */ }
    window.dispatchEvent(new Event("cartchange"));
  };

  WW.cartCount = function () {
    var c = WW.getCart();
    return Object.keys(c).reduce(function (sum, id) { return sum + c[id]; }, 0);
  };

  WW.toast = function (msg) {
    var t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(WW._toastTimer);
    WW._toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2200);
  };

  // ---------- Black Friday ticker ----------
  var MESSAGES = [
    "Black Friday savings",
    "Up to 40% off selected food, fashion and home",
    "Free delivery on orders over R600",
    "New deals added daily"
  ];

  function marquee() {
    var items = MESSAGES.map(function (m) {
      return '<li><span class="badge badge-black">Black Friday</span> ' + m + "</li>";
    }).join("");
    // Two identical copies: the track slides left by 50% then loops seamlessly.
    return '<div class="ticker"><ul class="ticker-track">' + items +
      '</ul><ul class="ticker-track" aria-hidden="true">' + items + "</ul></div>" +
      '<span class="sr-only">Black Friday savings: ' + MESSAGES.join(". ") + "</span>";
  }

  // ---------- icons (inline SVG, they inherit the text colour) ----------
  function icon(paths) {
    return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" aria-hidden="true">' + paths + "</svg>";
  }
  var ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    user:   '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
    bag:    '<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 016 0v2"/>',
    pin:    '<path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    chev:   '<path d="M6 9l6 6 6-6"/>',
    heart:  '<path d="M12 20.5s-8-4.9-8-11a4.6 4.6 0 018-3 4.6 4.6 0 018 3c0 6.1-8 11-8 11z"/>'
  };

  // ---------- social media icons (filled glyphs, inherit the text colour) ----------
  function socialIcon(inner) {
    return '<svg class="social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + inner + "</svg>";
  }
  var SOCIAL = [
    {
      label: "Facebook", href: "https://www.facebook.com/",
      svg: '<path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z"/>'
    },
    {
      label: "Instagram", href: "https://www.instagram.com/",
      svg: '<rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/>' +
           '<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/>' +
           '<circle cx="17.2" cy="6.8" r="1.1"/>'
    },
    {
      label: "X (Twitter)", href: "https://x.com/",
      svg: '<path d="M17.8 3h3l-6.6 7.5L22 21h-6.1l-4.8-6.3L5.6 21h-3l7-8L2 3h6.2l4.3 5.7L17.8 3zm-1.1 16.2h1.7L7.3 4.7H5.5l11.2 14.5z"/>'
    },
    {
      label: "YouTube", href: "https://www.youtube.com/",
      svg: '<path d="M21.6 7.2a2.5 2.5 0 00-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 002.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 001.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 001.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z"/>'
    },
    {
      label: "TikTok", href: "https://www.tiktok.com/",
      svg: '<path d="M16 3c.3 2.3 1.6 3.8 4 4v3c-1.5 0-2.900-.5-4-1.300V15a6 6 0 11-6-6c.3 0 .7 0 1 .1v3.100a3 3 0 102 2.800V3h3z"/>'
    },
    {
      label: "LinkedIn", href: "https://www.linkedin.com/",
      svg: '<path d="M4.5 9h3v11h-3V9zM6 4a1.700 1.700 0 110 3.400A1.700 1.700 0 016 4zM10 9h2.900v1.500c.4-.8 1.500-1.700 3.100-1.700 3.200 0 3.800 2.100 3.800 4.800V20h-3v-5.700c0-1.400 0-3.100-1.900-3.100s-2.100 1.500-2.100 3V20h-3V9z"/>'
    }
  ];

  function socialLinks() {
    return SOCIAL.map(function (s) {
      return '<li><a class="social-link" href="' + s.href + '" target="_blank" rel="noopener" aria-label="' +
        s.label + '" title="' + s.label + '">' + socialIcon(s.svg) + "</a></li>";
    }).join("");
  }

  // ---------- Shop mega dropdown content ----------
  var MEGA = [
    { title: "Food",     cat: "Food",     items: ["Fresh produce", "Bakery", "Pantry", "Drinks"] },
    { title: "Clothing", cat: "Clothing", items: ["Women", "Men", "Kids", "Knitwear"] },
    { title: "Home",     cat: "Home",     items: ["Bedding", "Kitchen", "Candles", "Decor"] },
    { title: "Beauty",   cat: "Beauty",   items: ["Skincare", "Hair", "Body", "Hand care"] }
  ];

  function megaMenu() {
    var shop = root + "HTML/shop.html";
    var cols = MEGA.map(function (c) {
      var items = c.items.map(function (i) {
        return '<li><a href="' + shop + "?cat=" + c.cat + '">' + i + "</a></li>";
      }).join("");
      return '<div class="mega-col"><h3><a href="' + shop + "?cat=" + c.cat + '">' + c.title + "</a></h3><ul>" + items + "</ul></div>";
    }).join("");

    return '<div class="mega"><div class="container mega-inner">' +
      '<a class="mega-image" href="' + shop + '?cat=Food">' +
        '<span class="badge badge-yellow">New season</span>' +
        "<strong>Fresh &amp; seasonal</strong><small>Shop the edit &rarr;</small>" +
      "</a>" +
      '<div class="mega-links">' + cols +
        '<a class="mega-all" href="' + shop + '">View all products &rarr;</a>' +
      "</div></div></div>";
  }

  // ---------- header ----------
  function buildHeader() {
    var address = "";
    try { address = localStorage.getItem("ww_address") || ""; } catch (e) {}

    var links = PAGES.map(function (p) {
      var cur = p.id === current ? ' aria-current="page"' : "";
      if (p.id === "shop") {
        return '<li class="has-mega"><a href="' + p.href + '"' + cur + ' aria-haspopup="true" aria-expanded="false">' +
          p.label + icon(ICONS.chev) + "</a>" + megaMenu() + "</li>";
      }
      return '<li><a href="' + p.href + '"' + cur + ">" + p.label + "</a></li>";
    }).join("");

    var html =
      '<a class="skip-link" href="#main">Skip to content</a>' +
      '<div class="utility-bar" role="region" aria-label="Black Friday savings">' + marquee() + "</div>" +
      '<header class="site-header">' +
        '<div class="header-main"><div class="container">' +
          '<button class="menu-toggle" aria-label="Toggle menu" aria-expanded="false" aria-controls="nav-list">&#9776;</button>' +
          '<a class="brand" href="' + root + 'index.html" aria-label="Home">' +
            '<img src="' + root + 'Assets/icon/velnery-black-logo.jpeg" alt="Brand logo">' +
          "</a>" +

          '<form class="search" action="' + root + 'HTML/shop.html" method="get" role="search">' +
            '<input type="search" name="q" placeholder="Search for products" aria-label="Search products">' +
            '<button type="submit" aria-label="Search">' + icon(ICONS.search) + "</button>" +
          "</form>" +

          '<div class="header-actions">' +
            '<button class="hdr-btn" id="address-btn" type="button">' + icon(ICONS.pin) +
              '<span class="hdr-text"><small>Deliver to</small><strong id="address-text">' + (address || "Set address") + "</strong></span></button>" +
            '<a class="hdr-btn" href="' + root + 'HTML/signin.html">' + icon(ICONS.user) +
              '<span class="hdr-text"><small>Hello</small><strong>Sign in</strong></span></a>' +
            '<a class="hdr-btn wish-btn" href="' + root + 'HTML/wishlist.html" aria-label="Wishlist"' + (current === "wishlist" ? ' aria-current="page"' : "") + ">" +
              '<span class="icon-wrap">' + icon(ICONS.heart) + '<span class="cart-count" id="wish-count">0</span></span></a>' +
            '<a class="hdr-btn cart-btn" href="' + root + 'HTML/cart.html" aria-label="Cart"' + (current === "cart" ? ' aria-current="page"' : "") + ">" +
              '<span class="icon-wrap">' + icon(ICONS.bag) + '<span class="cart-count" id="cart-count">0</span></span></a>' +
          "</div>" +
        "</div></div>" +

        '<nav class="header-nav" aria-label="Main"><ul class="nav-list" id="nav-list">' + links + "</ul></nav>" +
      "</header>";

    var holder = document.getElementById("site-header");
    if (holder) holder.innerHTML = html;

    // mobile menu button
    var btn = document.querySelector(".menu-toggle");
    var list = document.getElementById("nav-list");
    if (btn && list) {
      btn.addEventListener("click", function () {
        var open = list.classList.toggle("open");
        btn.setAttribute("aria-expanded", String(open));
      });
    }

    // on phones the Shop link opens its sub-menu instead of navigating
    var shopLink = document.querySelector(".has-mega > a");
    if (shopLink) {
      shopLink.addEventListener("click", function (e) {
        if (window.matchMedia("(max-width: 900px)").matches) {
          e.preventDefault();
          var li = shopLink.parentNode;
          var open = li.classList.toggle("open");
          shopLink.setAttribute("aria-expanded", String(open));
        }
      });
    }

    // delivery address (placeholder: asks for a suburb and remembers it)
    var addrBtn = document.getElementById("address-btn");
    if (addrBtn) {
      addrBtn.addEventListener("click", function () {
        var v = window.prompt("Enter your suburb or postcode for delivery:", address);
        if (v === null) return;
        address = v.trim();
        try { localStorage.setItem("ww_address", address); } catch (e) {}
        document.getElementById("address-text").textContent = address || "Set address";
      });
    }
  }


  // ---------- footer ----------
  // Small helper: turns [{label, href}] into a <ul> of links.
  function linkList(items) {
    return "<ul>" + items.map(function (i) {
      return '<li><a href="' + i.href + '">' + i.label + "</a></li>";
    }).join("") + "</ul>";
  }

  // Payment logos live in Assets/icon. Rename the files here to match yours (svg, png, webp all work).
  // Leave logo as null to show the plain text label instead.
  var PAYMENTS = [
    { name: "Visa",       logo: "Assets/icon/visa.svg" },
    { name: "Mastercard", logo: "Assets/icon/mastercard.svg" },
    { name: "Payflex",    logo: "Assets/icon/payflex.svg" },
    { name: "EFT",        logo: null },
    { name: "Gift card",  logo: null }
  ];

  function paymentList() {
    return PAYMENTS.map(function (p) {
      if (!p.logo) return '<li><span>' + p.name + "</span></li>";
      return '<li class="has-logo"><img src="' + root + p.logo + '" alt="' + p.name + '" data-name="' + p.name + '" height="20"></li>';
    }).join("");
  }

  function buildFooter() {
    var year = new Date().getFullYear();
    var shop = root + "HTML/shop.html";

    // ----- link columns -----
    var colShop = [
      { label: "All products",  href: shop },
      { label: "Food",          href: shop + "?cat=Food" },
      { label: "Clothing",      href: shop + "?cat=Clothing" },
      { label: "Home",          href: shop + "?cat=Home" },
      { label: "Beauty",        href: shop + "?cat=Beauty" },
      { label: "Deals",         href: root + "HTML/deals.html" }
    ];
    var colHelp = [
      { label: "Contact us",       href: root + "HTML/contact.html" },
      { label: "Track your order", href: root + "HTML/cart.html" },
      { label: "Delivery info",    href: root + "index.html#delivery" },
      { label: "Returns & refunds",href: root + "HTML/contact.html" },
      { label: "FAQs",             href: root + "HTML/contact.html" },
      { label: "Find a store",     href: root + "HTML/stores.html" }
    ];
    var colServices = [
      { label: "Payflex",        href: root + "index.html#payflex" },
      { label: "Rewards",        href: root + "index.html#rewards" },
      { label: "Gift cards",     href: root + "index.html#giftcards" },
      { label: "Wishlist",       href: root + "HTML/wishlist.html" },
      { label: "Your cart",      href: root + "HTML/cart.html" },
      { label: "Sign in",        href: root + "HTML/signin.html" }
    ];
    var colCompany = [
      { label: "About us",       href: root + "HTML/about.html" },
      { label: "Careers",        href: root + "HTML/about.html" },
      { label: "Sustainability", href: root + "HTML/about.html" },
      { label: "Media & press",  href: root + "HTML/contact.html" },
      { label: "Store locations",href: root + "HTML/stores.html" }
    ];

    var html =
      // ----- app download strip -----
      '<div class="app-strip"><div class="container app-strip-inner">' +
        '<div class="app-strip-left">' +
          '<img class="app-strip-logo" src="' + root + 'Assets/icon/velnery-black-logo.jpeg" alt="Brand logo">' +
          "<div>" +
            "<h4>Shop smarter with our app</h4>" +
            "<p>Browse deals, track your order and shop on the go.</p>" +
          "</div>" +
        "</div>" +
        '<ul class="app-strip-stores">' +
          '<li><a href="https://apps.apple.com/" target="_blank" rel="noopener"><img src="' + root + 'Assets/icon/app-store.svg" alt="Download on the App Store"></a></li>' +
          '<li><a href="https://play.google.com/store" target="_blank" rel="noopener"><img src="' + root + 'Assets/icon/google-play.svg" alt="Get it on Google Play"></a></li>' +
          '<li><a href="https://appgallery.huawei.com/" target="_blank" rel="noopener"><img src="' + root + 'Assets/icon/AppGallery.svg" alt="Explore it on AppGallery"></a></li>' +
        "</ul>" +
      "</div></div>" +

      '<footer class="site-footer"><div class="container footer-wrap">' +

        // ----- top row: brand blurb, contact details, newsletter -----
        '<div class="footer-top">' +
          '<div class="footer-brand">' +
            "<p>Quality food, fashion and homeware, delivered to your door. Fresh deals every week, <br>all in one place. " +
            "Products, prices and stores shown are sample data.</p>" +
            '<ul class="footer-contact">' +
              '<li><strong>Customer care</strong><a href="tel:+270000000000">0800 210 4329</a></li>' +
              '<li><strong>Email</strong><a href="mailto:velnery@gmail.com">velnery@gmail.com</a></li>' +
              '<li><strong>Hours</strong><span>Mon&ndash;Fri 8:00&ndash;18:00, <br>Sat 9:00&ndash;14:00</span></li>' +
            "</ul>" +
          "</div>" +

          '<div class="footer-news">' +
            "<h4>Join our newsletter</h4>" +
            "<p>Get weekly deals, new arrivals and Black Friday alerts straight to your inbox.</p>" +
            '<form id="newsletter" class="newsletter-form" novalidate>' +
              '<label class="sr-only" for="nl-email">Email address</label>' +
              '<input type="email" id="nl-email" placeholder="someone@example.com" autocomplete="email">' +
              '<button class="btn" type="submit">Subscribe</button>' +
            "</form>" +
            '<p class="body-sm footer-note">By subscribing you agree to receive marketing emails. Unsubscribe at any time.</p>' +
            '<h4 class="footer-follow">Follow us</h4>' +
            '<ul class="social-list">' + socialLinks() + "</ul>" +
          "</div>" +
        "</div>" +

        // ----- link columns -----
        '<nav class="footer-cols" aria-label="Footer">' +
          "<div><h4>Shop</h4>" + linkList(colShop) + "</div>" +
          "<div><h4>Help &amp; support</h4>" + linkList(colHelp) + "</div>" +
          "<div><h4>Services</h4>" + linkList(colServices) + "</div>" +
          "<div><h4>Company</h4>" + linkList(colCompany) + "</div>" +
        "</nav>" +

        // ----- payments + delivery trust row -----
        '<div class="footer-trust">' +
          '<div class="footer-pay">' +
            '<span class="footer-label">We accept</span>' +
            '<ul class="pay-list" aria-label="Accepted payment methods">' +
              paymentList() +
            "</ul>" +
          "</div>" +
          '<ul class="trust-list">' +
            "<li>Free delivery over R600</li>" +
            "<li>Secure checkout</li>" +
            "<li>Easy returns</li>" +
          "</ul>" +
        "</div>" +

        // ----- bottom bar -----
        '<div class="footer-bottom">' +
          '<div class="footer-bottom-left">' +
            "<span>&copy; " + year + " Velnery. All rights reserved.</span>" +
            '<ul class="legal-links">' +
              '<li><a href="' + root + 'HTML/about.html">Privacy policy</a></li>' +
              '<li><a href="' + root + 'HTML/about.html">Terms &amp; conditions</a></li>' +
              '<li><a href="' + root + 'HTML/about.html">Cookie policy</a></li>' +
              '<li><a href="' + root + 'HTML/contact.html">Accessibility</a></li>' +
            "</ul>" +
          "</div>" +
          '<div class="footer-bottom-right">' +
            '<span class="footer-region">South Africa &middot; ZAR (R)</span>' +
            '<span>Proudly designed and developed by <a href="https://www.linkedin.com/in/ababalwe-jali/" target="_blank" rel="noopener">Ababalwe Jali</a></span>' +
          "</div>" +
        "</div>" +

      "</div></footer>" +
      '<div class="toast" id="toast" role="status" aria-live="polite"></div>';

    var holder = document.getElementById("site-footer");
    if (holder) holder.innerHTML = html;

    // if a logo file is missing or misnamed, show the text label instead of a broken image
    Array.prototype.forEach.call(document.querySelectorAll(".pay-list img"), function (img) {
      img.addEventListener("error", function () {
        var li = img.parentNode;
        li.classList.remove("has-logo");
        li.textContent = img.getAttribute("data-name");
      });
    });

    var form = document.getElementById("newsletter");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var v = document.getElementById("nl-email").value.trim();
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
          WW.toast("Thanks for subscribing!");
          form.reset();
        } else {
          WW.toast("Please enter a valid email address.");
        }
      });
    }
  }

  function updateBadge() {
    var el = document.getElementById("cart-count");
    if (el) el.textContent = WW.cartCount();
  }

  function updateWishBadge() {
    var el = document.getElementById("wish-count"), n = 0;
    try { n = (JSON.parse(localStorage.getItem("ww_wishlist")) || []).length; } catch (e) {}
    if (el) el.textContent = n;
  }

  buildHeader();
  buildFooter();
  updateBadge();
  updateWishBadge();
  window.addEventListener("wishlistchange", updateWishBadge);
  window.addEventListener("cartchange", updateBadge);
  window.addEventListener("storage", function () { updateBadge(); updateWishBadge(); }); // other tab changed the cart or wishlist
})();