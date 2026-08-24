/**
 * Portfolio — main.js
 *
 * Features:
 *  1. Lucide icons initialization
 *  2. Dark / Light mode toggle (persisted in localStorage)
 *  3. Sticky-nav shadow on scroll
 *  4. Active nav-link highlight on scroll (IntersectionObserver)
 *  5. Scroll-reveal animations (IntersectionObserver)
 *  6. Mobile menu toggle
 *  7. Testimonials carousel (drag / touch / keyboard / button)
 *  8. Contact form client-side validation
 *  9. Footer year
 */

'use strict';

/* ── Helpers ─────────────────────────────────── */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── 1. Lucide Icons ─────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();
});

/* ── 2. Dark / Light Mode ────────────────────── */
(function initTheme() {
  const root   = document.documentElement;
  const toggle = $('#themeToggle');
  // Honour stored preference, then system preference
  const stored = localStorage.getItem('portfolio-theme');
  const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const initial = stored || system;
  root.setAttribute('data-theme', initial);

  toggle?.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
  });
})();

/* ── 3. Sticky Nav Shadow ────────────────────── */
(function initNavShadow() {
  const header = $('#site-header');
  const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── 4. Active Nav Link ──────────────────────── */
(function initActiveLinks() {
  const sections = $$('section[id]');
  const links    = $$('.nav__links .nav__link');
  if (!sections.length || !links.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(l => l.classList.remove('active'));
      const active = links.find(l => l.getAttribute('href') === `#${entry.target.id}`);
      active?.classList.add('active');
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => obs.observe(s));
})();

/* ── 5. Scroll-Reveal ────────────────────────── */
(function initReveal() {
  const items = $$('.reveal');
  if (!items.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach(el => obs.observe(el));
})();

/* ── 6. Mobile Menu ──────────────────────────── */
(function initMobileMenu() {
  const hamburger  = $('#hamburger');
  const mobileMenu = $('#mobileMenu');
  if (!hamburger || !mobileMenu) return;

  const open = () => {
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
  };
  const close = () => {
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
  };

  hamburger.addEventListener('click', () => {
    hamburger.getAttribute('aria-expanded') === 'true' ? close() : open();
  });

  // Close when a menu link is clicked
  $$('[data-close-menu]').forEach(el => el.addEventListener('click', close));

  // Close on outside click
  document.addEventListener('click', e => {
    if (!$('#site-header').contains(e.target)) close();
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });
})();


/* ── 8. Contact Form ─────────────────────────── */
(function initContactForm() {
  const form     = $('#contactForm');
  const feedback = $('#formFeedback');
  const submitBtn = $('#submitBtn');
  if (!form) return;

  const rules = {
    name:    v => v.trim().length >= 2  || 'Please enter your name (min. 2 characters).',
    email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Please enter a valid email address.',
    message: v => v.trim().length >= 10 || 'Message must be at least 10 characters.',
  };

  function validate(field) {
    const rule = rules[field.name];
    if (!rule) return true;
    const result = rule(field.value);
    const errEl  = field.nextElementSibling;
    if (result === true) {
      field.classList.remove('invalid');
      if (errEl) errEl.textContent = '';
      return true;
    }
    field.classList.add('invalid');
    if (errEl) errEl.textContent = result;
    return false;
  }

  // Live validation on blur
  $$('input, textarea', form).forEach(field => {
    field.addEventListener('blur', () => validate(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('invalid')) validate(field);
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Validate all fields
    const fields  = $$('input, textarea', form);
    const allValid = fields.map(validate).every(Boolean);
    if (!allValid) {
      fields.find(f => f.classList.contains('invalid'))?.focus();
      return;
    }

    // Simulate submission (replace with your real endpoint)
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn__text').textContent = 'Sending…';

    try {
      /**
       * CUSTOMIZE: Replace the simulated delay below with a real fetch() call.
       *
       * Example:
       *   const data = Object.fromEntries(new FormData(form));
       *   const res  = await fetch('https://your-api.com/contact', {
       *     method: 'POST',
       *     headers: { 'Content-Type': 'application/json' },
       *     body: JSON.stringify(data),
       *   });
       *   if (!res.ok) throw new Error('Server error');
       */
      await new Promise(r => setTimeout(r, 1200)); // ← simulated network delay

      form.reset();
      showFeedback('success', '✅ Message sent!,I get back to you within 24 hours.');
    } catch {
      showFeedback('error', '❌ Something went wrong. Please try emailing me directly.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.querySelector('.btn__text').textContent = 'Send Message';
    }
  });

  function showFeedback(type, msg) {
    if (!feedback) return;
    feedback.className = `form-feedback ${type}`;
    feedback.textContent = msg;
    setTimeout(() => {
      feedback.className = 'form-feedback';
      feedback.textContent = '';
    }, 6000);
  }
})();

/* ── 9. Footer Year ──────────────────────────── */
(function initYear() {
  const el = $('#footerYear');
  if (el) el.textContent = new Date().getFullYear();
})();
