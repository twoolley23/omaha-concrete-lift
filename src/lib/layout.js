'use strict';

/**
 * Shared HTML layout helper.
 * Renders full HTML document: <head> (meta/OG/canonical/JSON-LD),
 * header (sticky nav + hamburger + CTA), main content, footer,
 * and mobile bottom CTA bar.
 *
 * This is the ONLY place header/footer markup is defined -- every
 * page route calls renderPage() instead of duplicating markup.
 */

const SITE_URL = 'https://omahaconcretelift.com';
const PHONE_DISPLAY = '(402) 409-4222';
const PHONE_TEL = '+14024094222';
const CONTACT_EMAIL = 'hello@omahaconcretelift.com';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/services/concrete-lifting', label: 'Services' },
  { href: '/service-areas', label: 'Service Areas' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/faq', label: 'FAQ' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' }
];

const FOOTER_COLUMNS = {
  services: {
    title: 'Services',
    links: [
      { href: '/services/concrete-lifting', label: 'Concrete Lifting' },
      { href: '/services/mudjacking', label: 'Mudjacking' },
      { href: '/services/polyjacking', label: 'Polyjacking' },
      { href: '/services/driveway-leveling', label: 'Driveway Leveling' },
      { href: '/services/sidewalk-leveling', label: 'Sidewalk Leveling' },
      { href: '/services/patio-leveling', label: 'Patio Leveling' },
      { href: '/services/garage-slab-leveling', label: 'Garage Slab Leveling' }
    ]
  },
  company: {
    title: 'Company',
    links: [
      { href: '/about', label: 'About Us' },
      { href: '/how-it-works', label: 'How It Works' },
      { href: '/service-areas', label: 'Service Areas' },
      { href: '/faq', label: 'FAQ' },
      { href: '/contact', label: 'Contact' }
    ]
  },
  legal: {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
      { href: '/referral-disclosure', label: 'Referral Disclosure' }
    ]
  }
};

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderHeader() {
  const navItems = NAV_LINKS.map(
    (l) => `<li><a href="${l.href}" class="nav-link">${escapeHtml(l.label)}</a></li>`
  ).join('');

  return `
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <header class="site-header" data-header>
    <div class="header-inner container">
      <a href="/" class="logo" aria-label="Omaha Concrete Lift home">
        <span class="logo-mark" aria-hidden="true">OCL</span>
        <span class="logo-text">Omaha Concrete&nbsp;Lift</span>
      </a>

      <nav class="main-nav" id="main-nav" aria-label="Primary">
        <ul class="nav-list">
          ${navItems}
        </ul>
      </nav>

      <div class="header-actions">
        <a href="tel:${PHONE_TEL}" class="phone-link" aria-label="Call Omaha Concrete Lift at ${PHONE_DISPLAY}">
          <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <span class="phone-text">${PHONE_DISPLAY}</span>
        </a>
        <a href="/contact" class="btn btn-cta">Get a Free Quote</a>
        <button type="button" class="hamburger" id="hamburger-btn" aria-expanded="false" aria-controls="main-nav" aria-label="Open menu">
          <span class="hamburger-box" aria-hidden="true">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </span>
        </button>
      </div>
    </div>
  </header>`;
}

function renderFooter() {
  function col(c) {
    const items = c.links.map((l) => `<li><a href="${l.href}">${escapeHtml(l.label)}</a></li>`).join('');
    return `<div class="footer-col"><h3 class="footer-col-title">${escapeHtml(c.title)}</h3><ul class="footer-col-list">${items}</ul></div>`;
  }

  return `
  <footer class="site-footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <span class="logo-mark" aria-hidden="true">OCL</span>
        <p class="footer-tagline">Omaha Concrete Lift is an independent referral service that connects Omaha-area homeowners with local concrete leveling contractors. We are not a contractor and do not perform concrete leveling work ourselves.</p>
        <p class="footer-contact"><a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
        <p class="footer-contact"><a href="/contact">Contact us</a></p>
      </div>
      <div class="footer-columns">
        ${col(FOOTER_COLUMNS.services)}
        ${col(FOOTER_COLUMNS.company)}
        ${col(FOOTER_COLUMNS.legal)}
      </div>
    </div>
    <div class="footer-bottom container">
      <p>&copy; <span id="copyright-year">2026</span> Omaha Concrete Lift. All rights reserved. Omaha Concrete Lift is an independent referral website, not a licensed contractor.</p>
    </div>
  </footer>

  <div class="mobile-cta-bar" role="region" aria-label="Quick actions">
    <a href="tel:${PHONE_TEL}" class="mobile-cta-btn mobile-cta-call">
      <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      Call
    </a>
    <a href="/contact" class="mobile-cta-btn mobile-cta-quote">Get a Free Quote</a>
  </div>`;
}

function renderJsonLd(blocks) {
  if (!blocks || !blocks.length) return '';
  return blocks
    .map((b) => `<script type="application/ld+json">${JSON.stringify(b, null, 0)}</script>`)
    .join('\n  ');
}

/**
 * Render a full HTML page.
 * @param {Object} opts
 * @param {string} opts.title - <title> text (already includes site name suffix if desired)
 * @param {string} opts.description - meta description
 * @param {string} opts.canonicalPath - path portion for canonical/OG url, e.g. "/faq"
 * @param {string} opts.bodyHtml - inner HTML for <main>
 * @param {Array}  opts.jsonLd - array of JSON-LD objects to embed
 * @param {string} [opts.ogType] - open graph type, defaults to "website"
 */
function renderPage({ title, description, canonicalPath, bodyHtml, jsonLd = [], ogType = 'website' }) {
  const canonicalUrl = `${SITE_URL}${canonicalPath === '/' ? '' : canonicalPath}` || SITE_URL;
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}">
  <link rel="canonical" href="${canonicalUrl}">

  <!-- Open Graph -->
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDesc}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:type" content="${ogType}">
  <meta property="og:site_name" content="Omaha Concrete Lift">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="/css/main.css">
  <link rel="icon" href="data:,">

  ${renderJsonLd(jsonLd)}
</head>
<body>
  ${renderHeader()}

  <main id="main-content" class="site-main">
    ${bodyHtml}
  </main>

  ${renderFooter()}

  <script src="/js/main.js" defer></script>
</body>
</html>`;
}

module.exports = {
  renderPage,
  escapeHtml,
  SITE_URL,
  PHONE_DISPLAY,
  PHONE_TEL,
  CONTACT_EMAIL,
  NAV_LINKS
};
