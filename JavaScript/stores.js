/* stores.js – searchable / filterable store list (plain JavaScript) */
(function () {
  "use strict";

  var STORES = [
    { name: "Canal Walk",          city: "Cape Town",     province: "Western Cape",  address: "Century Blvd, Century City", hours: "09:00 – 21:00" },
    { name: "V&A Waterfront",      city: "Cape Town",     province: "Western Cape",  address: "Victoria Wharf, Waterfront", hours: "09:00 – 21:00" },
    { name: "Stellenbosch Square", city: "Stellenbosch",  province: "Western Cape",  address: "Cnr Adam Tas & Bird St",     hours: "08:30 – 19:00" },
    { name: "Sandton City",        city: "Johannesburg",  province: "Gauteng",       address: "Rivonia Rd, Sandhurst",      hours: "09:00 – 20:00" },
    { name: "Rosebank Mall",       city: "Johannesburg",  province: "Gauteng",       address: "50 Bath Ave, Rosebank",      hours: "09:00 – 20:00" },
    { name: "Menlyn Park",         city: "Pretoria",      province: "Gauteng",       address: "Atterbury Rd, Menlyn",       hours: "09:00 – 20:00" },
    { name: "Gateway",             city: "Umhlanga",      province: "KwaZulu-Natal", address: "1 Palm Blvd, Umhlanga",      hours: "09:00 – 20:00" },
    { name: "Musgrave Centre",     city: "Durban",        province: "KwaZulu-Natal", address: "115 Musgrave Rd, Berea",     hours: "09:00 – 19:00" },
    { name: "Baywest",             city: "Gqeberha",      province: "Eastern Cape",  address: "Baywest Mall, Walmer",       hours: "09:00 – 19:00" },
    { name: "Mimosa Mall",         city: "Bloemfontein",  province: "Free State",    address: "Curie Ave, Bloemfontein",    hours: "09:00 – 19:00" }
  ];

  var list = document.getElementById("store-list");
  var search = document.getElementById("store-search");
  var province = document.getElementById("store-province");
  var count = document.getElementById("store-count");
  if (!list || !search || !province) return;

  // Populate province <select>
  var provinces = STORES.map(function (s) { return s.province; })
    .filter(function (p, i, a) { return a.indexOf(p) === i; }).sort();
  provinces.forEach(function (p) {
    var o = document.createElement("option");
    o.value = p; o.textContent = p;
    province.appendChild(o);
  });

  function esc(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function render() {
    var q = search.value.trim().toLowerCase();
    var prov = province.value;
    var matches = STORES.filter(function (s) {
      var text = (s.name + " " + s.city + " " + s.address).toLowerCase();
      return (!q || text.indexOf(q) > -1) && (!prov || s.province === prov);
    });

    count.textContent = matches.length + " store" + (matches.length === 1 ? "" : "s") + " found";

    if (!matches.length) {
      list.innerHTML = '<li class="empty"><h3 class="display-md">No stores found</h3><p>Try a different search.</p></li>';
      return;
    }
    list.innerHTML = matches.map(function (s) {
      return '<li class="store-item">' +
        "<div><h3>" + esc(s.name) + '</h3><p>' + esc(s.city) + ", " + esc(s.province) + "</p></div>" +
        "<p>" + esc(s.address) + "</p>" +
        '<p><span class="badge badge-black">Open</span> ' + esc(s.hours) + "</p></li>";
    }).join("");
  }

  search.addEventListener("input", render);
  province.addEventListener("change", render);
  render();
})();
