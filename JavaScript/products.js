/* Sample product data (prices are fictional). Shared by the React app. */
window.PRODUCTS = [
  { id: 1,  name: "Free-range eggs, 18 pack",      cat: "Food",   price: 64.99,  was: null,   tone: "#7F7474", img: "https://images.unsplash.com/photo-1529589776585-089471c85ff2?auto=format&fit=crop&w=800&q=80" },
  { id: 2,  name: "Sourdough loaf",                cat: "Food",   price: 34.99,  was: 42.99,  tone: "#525151", img: "https://images.unsplash.com/photo-1620921592619-652411a0d01a?auto=format&fit=crop&w=800&q=80" },
  { id: 3,  name: "Ripe avocados, 4 pack",         cat: "Food",   price: 39.99,  was: 49.99,  tone: "#3D3D3D", img: "https://images.unsplash.com/photo-1578830610378-23b3b0edef93?auto=format&fit=crop&w=800&q=80" },
  { id: 4,  name: "Rooibos tea, 80 bags",          cat: "Food",   price: 45.99,  was: null,   tone: "#908989", img: "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?auto=format&fit=crop&w=800&q=80" },
  { id: 5,  name: "Dark chocolate slab, 150g",     cat: "Food",   price: 37.99,  was: 44.99,  tone: "#4B4949", img: "https://images.unsplash.com/photo-1604514813549-92e26bbae4f2?auto=format&fit=crop&w=800&q=80" },
  { id: 6,  name: "Cotton crew-neck T-shirt",      cat: "Clothing", price: 149.00, was: null,  tone: "#525151", img: "https://images.unsplash.com/photo-1651761179569-4ba2aa054997?auto=format&fit=crop&w=800&q=80" },
  { id: 7,  name: "Slim-fit stretch jeans",        cat: "Clothing", price: 499.00, was: 599.00, tone: "#3D3D3D", img: "https://images.unsplash.com/photo-1602293589930-45aad59ba3ab?auto=format&fit=crop&w=800&q=80" },
  { id: 8,  name: "Merino wool jersey",            cat: "Clothing", price: 649.00, was: null,  tone: "#7F7474", img: "https://images.unsplash.com/photo-1601379327928-bedfaf9da2d0?auto=format&fit=crop&w=800&q=80" },
  { id: 9,  name: "Kids' pyjama set",              cat: "Clothing", price: 229.00, was: 279.00, tone: "#908989", img: "https://images.unsplash.com/photo-1768696082668-411638a55476?auto=format&fit=crop&w=800&q=80" },
  { id: 10, name: "Linen duvet cover, queen",      cat: "Home",   price: 899.00, was: 1099.00, tone: "#4B4949", img: "https://images.unsplash.com/photo-1640348307767-b8e8bc765ff5?auto=format&fit=crop&w=800&q=80" },
  { id: 11, name: "Stoneware mug set, 4 piece",    cat: "Home",   price: 249.00, was: null,   tone: "#7F7474", img: "https://images.unsplash.com/photo-1522120573867-e574959f84c8?auto=format&fit=crop&w=800&q=80" },
  { id: 12, name: "Scented candle, vanilla",       cat: "Home",   price: 129.00, was: 159.00, tone: "#525151", img: "https://images.unsplash.com/photo-1477777662939-1b56b5b5966d?auto=format&fit=crop&w=800&q=80" },
  { id: 13, name: "Hydrating face cream, 50ml",    cat: "Beauty", price: 199.00, was: null,   tone: "#3D3D3D", img: "https://images.unsplash.com/photo-1611080541626-4ecc5ead618d?auto=format&fit=crop&w=800&q=80" },
  { id: 14, name: "Shampoo & conditioner duo",     cat: "Beauty", price: 169.00, was: 209.00, tone: "#908989", img: "https://images.unsplash.com/photo-1701992678972-d5a053ad0fb0?auto=format&fit=crop&w=800&q=80" },
  { id: 15, name: "Hand wash, 500ml",              cat: "Beauty", price: 59.99,  was: null,   tone: "#4B4949", img: "https://images.unsplash.com/photo-1616622236995-cb00e537365e?auto=format&fit=crop&w=800&q=80" },
  { id: 16, name: "Sparkling water, 6 x 500ml",    cat: "Food",   price: 54.99,  was: 64.99,  tone: "#7F7474", img: "https://images.unsplash.com/photo-1637710769758-ea52dba4e9b8?auto=format&fit=crop&w=800&q=80" }
];

/* Extra detail copy for the product page (sample text). */
(function () {
  var DETAILS = {
    1:  ["Eggs from hens that roam outdoors, graded large.", ["18 eggs", "Keep refrigerated", "Best before date on pack"]],
    2:  ["Slow-fermented loaf with a crisp crust and chewy crumb.", ["Baked fresh daily", "800g", "Best eaten within 3 days"]],
    3:  ["Creamy, ready-to-eat avocados picked at their best.", ["4 per pack", "Ripe and ready", "Store at room temperature"]],
    4:  ["Naturally caffeine-free tea with a smooth, earthy flavour.", ["80 tea bags", "Caffeine free", "Plastic-free bags"]],
    5:  ["Rich dark chocolate made with responsibly sourced cocoa.", ["150g slab", "70% cocoa", "May contain nuts and milk"]],
    6:  ["A soft everyday tee in breathable cotton.", ["100% cotton", "Regular fit", "Machine wash at 30°C"]],
    7:  ["Comfortable stretch denim with a slim, tapered leg.", ["98% cotton, 2% elastane", "Slim fit", "Machine wash cold"]],
    8:  ["A warm, lightweight jersey that holds its shape.", ["100% merino wool", "Regular fit", "Hand wash or wool cycle"]],
    9:  ["Soft two-piece pyjamas for easy bedtimes.", ["Cotton jersey", "Ages 2 to 10", "Machine wash at 40°C"]],
    10: ["Washed linen that gets softer with every wash.", ["100% linen", "Queen size", "Includes 2 pillowcases"]],
    11: ["Four glazed stoneware mugs, dishwasher and microwave safe.", ["Set of 4", "350ml each", "Dishwasher safe"]],
    12: ["A warm vanilla scent for a calm, cosy room.", ["Soy wax blend", "Burns up to 40 hours", "Never leave burning unattended"]],
    13: ["A lightweight daily moisturiser for dry or sensitive skin.", ["50ml", "Fragrance free", "Dermatologically tested"]],
    14: ["A gentle cleansing and conditioning pair for everyday use.", ["2 x 400ml", "All hair types", "Paraben free"]],
    15: ["A mild, moisturising hand wash with a fresh scent.", ["500ml", "pH balanced", "Recyclable bottle"]],
    16: ["Crisp, naturally sparkling water with no sweeteners.", ["6 x 500ml", "No sugar", "Recyclable bottles"]]
  };
  window.PRODUCTS.forEach(function (p) {
    var d = DETAILS[p.id];
    if (d) { p.desc = d[0]; p.details = d[1]; }
  });
})();