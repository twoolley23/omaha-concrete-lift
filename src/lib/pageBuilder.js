'use strict';

const { renderPage, escapeHtml, SITE_URL, PHONE_TEL, PHONE_DISPLAY } = require('./layout');
const { fixInternalLinks } = require('./links');
const { renderQuoteForm } = require('./quoteForm');
const schema = require('./schema');
const content = require('./content');

const metaMap = content.seo.per_page_meta;

/**
 * Renders hero section markup.
 */
function renderHero({ h1, subhead, ctaButtonLabel, showTrustBadges = true, heroImageAlt }) {
  const badges = showTrustBadges
    ? `
    <ul class="trust-badges" aria-label="Trust information">
      <li class="trust-badge">Free, No-Obligation Quotes</li>
      <li class="trust-badge"><a href="/referral-disclosure">Licensed and Insured Contractors Only</a></li>
      <li class="trust-badge">Independent Local Referral Service</li>
    </ul>`
    : '';

  return `
  <section class="hero">
    <div class="container hero-inner">
      <div class="hero-content">
        <h1 class="hero-title">${escapeHtml(h1)}</h1>
        <p class="hero-subhead">${escapeHtml(subhead)}</p>
        <div class="hero-cta-row">
          <a href="#quote-form" class="btn btn-cta btn-lg">${escapeHtml(ctaButtonLabel)}</a>
          <a href="tel:${PHONE_TEL}" class="btn btn-outline btn-lg hero-call-btn" aria-label="Call Omaha Concrete Lift at ${escapeHtml(PHONE_DISPLAY)}">Call ${escapeHtml(PHONE_DISPLAY)}</a>
        </div>
        ${badges}
      </div>
      <div class="hero-media">
        <img
          src="/img/hero-driveway.svg"
          alt="${escapeHtml(heroImageAlt || 'Stock illustration of a cracked concrete driveway slab')}"
          width="560" height="420"
          fetchpriority="high"
          loading="eager"
        >
      </div>
    </div>
  </section>`;
}

function renderBodySections(bodySections) {
  return bodySections
    .map((section, i) => {
      const html = fixInternalLinks(section.body_html_or_markdown);
      // FAQ pages use an accordion pattern; detect via a flag passed by caller instead.
      return `
      <section class="content-section" aria-labelledby="section-heading-${i}">
        <h2 class="content-section-heading" id="section-heading-${i}">${escapeHtml(section.heading)}</h2>
        <div class="content-section-body">${html}</div>
      </section>`;
    })
    .join('\n');
}

function renderFaqAccordion(bodySections) {
  return bodySections
    .map((section, i) => {
      const html = fixInternalLinks(section.body_html_or_markdown);
      return `
      <div class="accordion-item">
        <h2 class="accordion-heading">
          <button type="button" class="accordion-trigger" id="faq-trigger-${i}" aria-expanded="false" aria-controls="faq-panel-${i}">
            <span>${escapeHtml(section.heading)}</span>
            <span class="accordion-icon" aria-hidden="true">+</span>
          </button>
        </h2>
        <div class="accordion-panel" id="faq-panel-${i}" role="region" aria-labelledby="faq-trigger-${i}" hidden>
          <div class="accordion-panel-inner">${html}</div>
        </div>
      </div>`;
    })
    .join('\n');
}

function renderCtaBand({ ctaText, ctaButtonLabel }) {
  return `
  <section class="cta-band">
    <div class="container cta-band-inner">
      <p class="cta-band-text">${escapeHtml(ctaText)}</p>
      <div class="cta-band-actions">
        <a href="#quote-form" class="btn btn-cta btn-lg">${escapeHtml(ctaButtonLabel)}</a>
        <a href="tel:${PHONE_TEL}" class="btn btn-outline-light btn-lg" aria-label="Call Omaha Concrete Lift at ${escapeHtml(PHONE_DISPLAY)}">Call ${escapeHtml(PHONE_DISPLAY)}</a>
      </div>
    </div>
  </section>`;
}

function renderServiceCardGrid() {
  const services = [
    { href: '/services/concrete-lifting', label: 'Concrete Lifting', desc: 'General overview of concrete leveling and lifting methods.' },
    { href: '/services/mudjacking', label: 'Mudjacking', desc: 'Traditional cement-slurry slab lifting.' },
    { href: '/services/polyjacking', label: 'Polyjacking', desc: 'Polyurethane foam injection leveling.' },
    { href: '/services/driveway-leveling', label: 'Driveway Leveling', desc: 'Fix sunken or sloped driveway sections.' },
    { href: '/services/sidewalk-leveling', label: 'Sidewalk Leveling', desc: 'Correct trip-hazard sidewalk slabs.' },
    { href: '/services/patio-leveling', label: 'Patio Leveling', desc: 'Level tilted or pooling patio slabs.' },
    { href: '/services/garage-slab-leveling', label: 'Garage Slab Leveling', desc: 'Address settling garage floor slabs.' }
  ];
  const cards = services
    .map(
      (s) => `
      <li class="service-card">
        <h3 class="service-card-title"><a href="${s.href}">${escapeHtml(s.label)}</a></h3>
        <p class="service-card-desc">${escapeHtml(s.desc)}</p>
        <a href="${s.href}" class="service-card-link">Learn more &rarr;</a>
      </li>`
    )
    .join('');
  return `
  <section class="service-grid-section">
    <div class="container">
      <h2 class="section-title">Explore Concrete Leveling Methods</h2>
      <ul class="service-grid">${cards}</ul>
    </div>
  </section>`;
}

/**
 * Renders a generic content page from a content JSON page key.
 */
function renderContentPage({
  pageKey,
  urlPath,
  jsonLd = [],
  breadcrumbLabel,
  embedForm = null, // 'full' | 'condensed' | null
  preselectService = '',
  isFaq = false,
  showServiceGrid = false
}) {
  const page = content.pages[pageKey];
  const meta = metaMap[pageKey];

  const heroSection = renderHero({
    h1: page.h1,
    subhead: page.hero_subhead,
    ctaButtonLabel: page.cta_button_label,
    showTrustBadges: pageKey === 'home' || pageKey.startsWith('services-')
  });

  const bodySectionsHtml = isFaq
    ? `<section class="faq-accordion-section container"><div class="accordion" id="faq-accordion">${renderFaqAccordion(page.body_sections)}</div></section>`
    : `<div class="container content-sections-wrap">${renderBodySections(page.body_sections)}</div>`;

  const ctaBand = renderCtaBand({ ctaText: page.cta_text, ctaButtonLabel: page.cta_button_label });

  const grid = showServiceGrid ? renderServiceCardGrid() : '';

  let formSection = '';
  if (embedForm) {
    const formHtml = renderQuoteForm({ variant: embedForm, preselectService, idPrefix: embedForm === 'full' ? 'quote' : `quote-${pageKey}` });
    formSection = `
    <section class="quote-form-section" id="quote-form">
      <div class="container quote-form-wrap">
        <h2 class="section-title">Get My Free Quote</h2>
        ${formHtml}
      </div>
    </section>`;
  }

  const bodyHtml = `
    ${heroSection}
    ${bodySectionsHtml}
    ${grid}
    ${formSection}
    ${ctaBand}
  `;

  return renderPage({
    title: meta.title,
    description: meta.description,
    canonicalPath: urlPath,
    bodyHtml,
    jsonLd
  });
}

module.exports = {
  renderContentPage,
  renderHero,
  renderBodySections,
  renderFaqAccordion,
  renderCtaBand,
  renderServiceCardGrid,
  content,
  metaMap,
  schema
};
