/* contact.js – client-side validation for the contact form */
(function () {
  "use strict";

  var form = document.getElementById("contact-form");
  if (!form) return;

  var notice = document.getElementById("contact-notice");

  var rules = {
    name:    function (v) { return v.trim().length >= 2 ? "" : "Please enter your name."; },
    email:   function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Please enter a valid email address."; },
    topic:   function (v) { return v ? "" : "Please choose a topic."; },
    message: function (v) { return v.trim().length >= 10 ? "" : "Message must be at least 10 characters."; }
  };

  function check(input) {
    var field = input.closest(".field");
    var msg = rules[input.name](input.value);
    field.classList.toggle("invalid", !!msg);
    field.querySelector(".error").textContent = msg;
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }

  Array.prototype.forEach.call(form.elements, function (el) {
    if (rules[el.name]) el.addEventListener("blur", function () { check(el); });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var firstBad = null;
    Array.prototype.forEach.call(form.elements, function (el) {
      if (rules[el.name] && !check(el) && !firstBad) firstBad = el;
    });
    if (firstBad) { firstBad.focus(); return; }

    notice.hidden = false;
    notice.textContent = "Thanks " + form.elements.name.value.trim() + "! We'll reply to " +
      form.elements.email.value.trim() + " within 2 working days (demo: nothing was actually sent).";
    form.reset();
  });
})();
