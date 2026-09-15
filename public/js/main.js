/* =============================================================================
   OMAHA CONCRETE LIFT — MAIN CLIENT JS (vanilla, no dependencies)
   v2: Dual SMS consents (both optional, neither required).
============================================================================= */

(function () {
  'use strict';

  var yearEl = document.getElementById('copyright-year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  var header = document.querySelector('[data-header]');
  if (header) {
    function onScroll() {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  var hamburger = document.getElementById('hamburger-btn');
  var nav = document.getElementById('main-nav');

  if (hamburger && nav) {
    var focusableSelector = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
    var lastFocused = null;

    function getFocusable() {
      return Array.prototype.slice.call(nav.querySelectorAll(focusableSelector));
    }

    function openMenu() {
      nav.classList.add('is-open');
      hamburger.setAttribute('aria-expanded', 'true');
      hamburger.setAttribute('aria-label', 'Close menu');
      lastFocused = document.activeElement;
      var focusable = getFocusable();
      if (focusable.length) focusable[0].focus();
      document.addEventListener('keydown', onKeydown, true);
    }

    function closeMenu() {
      nav.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open menu');
      document.removeEventListener('keydown', onKeydown, true);
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    }

    function isOpen() {
      return nav.classList.contains('is-open');
    }

    function onKeydown(e) {
      if (!isOpen()) return;
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        closeMenu();
        return;
      }
      if (e.key === 'Tab') {
        var focusable = getFocusable();
        if (!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    hamburger.addEventListener('click', function () {
      if (isOpen()) { closeMenu(); } else { openMenu(); }
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && isOpen()) { closeMenu(); }
    });
  }

  var accordionTriggers = document.querySelectorAll('.accordion-trigger');
  accordionTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var expanded = trigger.getAttribute('aria-expanded') === 'true';
      var panelId = trigger.getAttribute('aria-controls');
      var panel = document.getElementById(panelId);
      trigger.setAttribute('aria-expanded', String(!expanded));
      if (panel) { panel.hidden = expanded; }
    });
  });

  var forms = document.querySelectorAll('.quote-form');

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function isValidPhone(value) {
    var digits = value.replace(/\D/g, '');
    return digits.length === 10 || (digits.length === 11 && digits.charAt(0) === '1');
  }

  function fieldRules(form) {
    return {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Please enter your full name.'; },
      phone: function (v) { return isValidPhone(v) ? '' : 'Please enter a valid 10-digit US phone number.'; },
      email: function (v) { return isValidEmail(v) ? '' : 'Please enter a valid email address.'; },
      service_type: function (v) { return v ? '' : 'Please select a service type.'; },
      zip_or_city: function (v) { return v.trim() ? '' : 'Please enter your property city or ZIP code.'; }
    };
  }

  function showFieldError(form, name, message) {
    var input = form.elements[name];
    if (!input) return;
    var errorId = input.getAttribute('aria-describedby');
    var errorEl = errorId ? document.getElementById(errorId) : null;
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = !message;
    }
    if (input.setAttribute) {
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
    }
  }

  function validateField(form, name) {
    var rules = fieldRules(form);
    var rule = rules[name];
    if (!rule) return true;
    var input = form.elements[name];
    var value;
    if (!input) return true;
    if (input.type === 'checkbox') {
      value = input.checked;
    } else if (input.length !== undefined && input[0] && input[0].type === 'radio') {
      value = true;
    } else {
      value = input.value;
    }
    var message = rule(value);
    showFieldError(form, name, message);
    return !message;
  }

  function validateForm(form) {
    var names = ['name', 'phone', 'email', 'service_type', 'zip_or_city'];
    var allValid = true;
    names.forEach(function (name) {
      var valid = validateField(form, name);
      if (!valid) allValid = false;
    });
    return allValid;
  }

  forms.forEach(function (form) {
    var watchedFields = ['name', 'phone', 'email', 'service_type', 'zip_or_city'];
    watchedFields.forEach(function (name) {
      var input = form.elements[name];
      if (!input) return;
      input.addEventListener('blur', function () {
        validateField(form, name);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var statusEl = form.querySelector('.form-status');
      if (!validateForm(form)) {
        if (statusEl) {
          statusEl.textContent = 'Please fix the highlighted fields and try again.';
          statusEl.className = 'form-status is-error';
        }
        return;
      }
      var formData = new FormData(form);
      var payload = {};
      formData.forEach(function (value, key) { payload[key] = value; });
      var marketingInput = form.elements.marketing_sms_consent;
      var projectInput = form.elements.project_update_sms_consent;
      payload.marketing_sms_consent = !!(marketingInput && marketingInput.checked);
      payload.project_update_sms_consent = !!(projectInput && projectInput.checked);
      var submitBtn = form.querySelector('.btn-submit');
      if (submitBtn) submitBtn.disabled = true;
      fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) { return res.json().then(function (data) { return { status: res.status, data: data }; }); })
        .then(function (result) {
          if (statusEl) {
            if (result.data && result.data.ok) {
              statusEl.innerHTML = "Thanks...";
              statusEl.className = 'form-status is-success';
              form.reset();
            } else {
              statusEl.textContent = (result.data && result.data.error) || 'Something went wrong.';
              statusEl.className = 'form-status is-error';
            }
          }
        })
        .catch(function () {
          if (statusEl) {
            statusEl.textContent = 'Something went wrong submitting your request. Please check your connection and try again.';
            statusEl.className = 'form-status is-error';
          }
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  });
})();
