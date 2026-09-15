'use strict';

const { renderPage, escapeHtml, SITE_URL, PHONE_TEL, PHONE_DISPLAY } = require('./layout');
const { fixInternalLinks } = require('./links');
const { renderQuoteForm } = require('./quoteForm');
const schema = require('./schema');
const content = require('./content');

const metaMap = content.seo.per_page_meta;

function renderHero({ h1, subhead, ctaButtonLabel, showTrustBadges = true, heroImageAlt, isHomepage = false }) {
  const badges = showTrustBadges
    ? `\n    <ul class="trust-badges" aria-label="Trust information">\n      <li class="trust-badge">Free, No-Obligation Quotes</li>\n      <li class="trust-badge"><a href="/referral-disclosure">Licensed and Insured Contractors Only</a></li>\n      <li class="trust-badge">Independent Local Referral Service</li>\n    </ul>`
    : '';
  const heroMedia = isHomepage
    ? `\n    <div class="hero-media">\n      <img\n        src="/img/hero-concrete-leveling.svg"\n        alt="${escapeHtml(heroImageAlt || 'Isometric before/after illustration of concrete leveling: a sunken, cracked driveway slab being raised by polyurethane foam injection next to a leveled slab near an Omaha home')}"\n        width="600" height="450"\n        fetchpriority="high"\n        loading="eager"\n      >\n    </div>`
    : '';
  const badgeRow = isHomepage
    ? `\n    <div class="hero-badge-row">\n      <span class="hero-badge"><span class="hero-badge-icon green">&#10003;</span> Free Quotes</span>\n      <span class="hero-badge"><span class="hero-badge-icon green">&#10003;</span> Local Pros</span>\n      <span class="hero-badge"><span class="hero-badge-icon gold">&#9733;</span> No Obligation</span>\n    </div>`
    : '';
  return `\n  <section class="hero">\n    <div class="container hero-inner">\n      <div class="hero-content">\n        <h1 class="hero-title">${escapeHtml(h1)}</h1>\n        <p class="hero-subhead">${escapeHtml(subhead)}</p>\n        ${badgeRow}\n        <div class="hero-cta-row">\n          <a href="#quote-form" class="btn btn-cta btn-lg">${escapeHtml(ctaButtonLabel)}</a>\n          <a href="tel:${PHONE_TEL}" class="btn btn-outline btn-lg hero-call-btn" aria-label="Call Omaha Concrete Lift at ${escapeHtml(PHONE_DISPLAY)}">Call ${escapeHtml(PHONE_DISPLAY)}</a>\n        </div>\n        ${badges}\n      </div>\n      ${heroMedia}\n    </div>\n  </section>`;
}

function renderStatsBand() {
  return `\n  <section class="stats-band">\n    <div class="container">\n      <div class="stats-grid">\n        <div class="stat-card">\n          <div class="stat-number">1</div>\n          <p class="stat-label">Quick form to submit</p>\n          <p class="stat-source">Takes about a minute</p>\n        </div>\n        <div class="stat-card">\n          <div class="stat-number">10+</div>\n          <p class="stat-label">Metro area communities served</p>\n          <p class="stat-source">Omaha &amp; surrounding suburbs</p>\n        </div>\n        <div class="stat-card">\n          <div class="stat-number">100%</div>\n          <p class="stat-label">Free to homeowners</p>\n          <p class="stat-source">No cost, no obligation</p>\n        </div>\n        <div class="stat-card">\n          <div class="stat-number">24h</div>\n          <p class="stat-label">Typical contractor response</p>\n          <p class="stat-source">Many reach out within a day</p>\n        </div>\n      </div>\n    </div>\n  </section>`;
}

function renderBodySections(bodySections) {
  return bodySections.map((section, i) => {
    const html = fixInternalLinks(section.body_html_or_markdown);
    return `\n      <section class="content-section" aria-labelledby="section-heading-${i}">\n        <h2 class="content-section-heading" id="section-heading-${i}">${escapeHtml(section.heading)}</h2>\n        <div class="content-section-body">${html}</div>\n      </section>`;
  }).join('\n');
}

function renderFaqAccordion(bodySections) {
  return bodySections.map((section, i) => {
    const html = fixInternalLinks(section.body_html_or_markdown);
    return `\n      <div class="accordion-item">\n        <h2 class="accordion-heading">\n          <button type="button" class="accordion-trigger" id="faq-trigger-${i}" aria-expanded="false" aria-controls="faq-panel-${i}">\n            <span>${escapeHtml(section.heading)}</span>\n            <span class="accordion-icon" aria-hidden="true">+</span>\n          </button>\n        </h2>\n        <div class="accordion-panel" id="faq-panel-${i}" role="region" aria-labelledby="faq-trigger-${i}" hidden>\n          <div class="accordion-panel-inner">${html}</div>\n        </div>\n      </div>`;
  }).join('\n');
}

function renderCtaBand({ ctaText, ctaButtonLabel }) {
  return `\n  <section class="cta-band">\n    <div class="container cta-band-inner">\n      <div>\n        <p class="cta-band-text">${escapeHtml(ctaText)}</p>\n      </div>\n      <div class="cta-band-actions">\n        <a href="#quote-form" class="btn btn-cta btn-lg">${escapeHtml(ctaButtonLabel)}</a>\n        <a href="tel:${PHONE_TEL}" class="btn btn-outline-light btn-lg" aria-label="Call Omaha Concrete Lift at ${escapeHtml(PHONE_DISPLAY)}">Call ${escapeHtml(PHONE_DISPLAY)}</a>\n      </div>\n    </div>\n  </section>`;
}

function renderServiceCardGrid() {
  const services = [
    { href: '/services/concrete-lifting', label: 'Concrete Lifting', desc: 'General overview of concrete leveling and lifting methods.', icon: '&#9881;' },
    { href: '/services/mudjacking', label: 'Mudjacking', desc: 'Traditional cement-slurry slab lifting.', icon: '&#9881;' },
    { href: '/services/polyjacking', label: 'Polyjacking', desc: 'Polyurethane foam injection leveling.', icon: '&#9881;' },
    { href: '/services/driveway-leveling', label: 'Driveway Leveling', desc: 'Fix sunken or sloped driveway sections.', icon: '&#9881;' },
    { href: '/services/sidewalk-leveling', label: 'Sidewalk Leveling', desc: 'Correct trip-hazard sidewalk slabs.', icon: '&#9881;' },
    { href: '/services/patio-leveling', label: 'Patio Leveling', desc: 'Level tilted or pooling patio slabs.', icon: '&#9881;' },
    { href: '/services/garage-slab-leveling', label: 'Garage Slab Leveling', desc: 'Address settling garage floor slabs.', icon: '&#9881;' }
  ];
  const cards = services.map((s) => `\n      <li class="service-card">\n        <div class="service-card-icon" aria-hidden="true">${s.icon}</div>\n        <h3 class="service-card-title"><a href="${s.href}">${escapeHtml(s.label)}</a></h3>\n        <p class="service-card-desc">${escapeHtml(s.desc)}</p>\n        <a href="${s.href}" class="service-card-link">Learn more <span aria-hidden="true">&rarr;</span></a>\n      </li>`).join('');
  return `\n  <section class="service-grid-section">\n    <div class="container">\n      <h2 class="section-title">Explore Concrete Leveling Methods</h2>\n      <p class="section-subtitle">Learn about the techniques and applications Omaha contractors use.</p>\n      <ul class="service-grid">${cards}</ul>\n    </div>\n  </section>`;
}

function renderContentPage({ pageKey, urlPath, jsonLd = [], breadcrumbLabel, embedForm = null, preselectService = '', isFaq = false, showServiceGrid = false, showStatsBand = false }) {
  const page = content.pages[pageKey];
  const meta = metaMap[pageKey];
  const heroSection = renderHero({ h1: page.h1, subhead: page.hero_subhead, ctaButtonLabel: page.cta_button_label, showTrustBadges: pageKey === 'home' || pageKey.startsWith('services-'), isHomepage: pageKey === 'home' });
  const statsBand = showStatsBand ? renderStatsBand() : '';
  const bodySectionsHtml = isFaq
    ? `<section class="faq-accordion-section"><div class="accordion" id="faq-accordion">${renderFaqAccordion(page.body_sections)}</div></section>`
    : `<div class="container content-sections-wrap">${renderBodySections(page.body_sections)}</div>`;
  const ctaBand = renderCtaBand({ ctaText: page.cta_text, ctaButtonLabel: page.cta_button_label });
  const grid = showServiceGrid ? renderServiceCardGrid() : '';
  let formSection = '';
  if (embedForm) {
    const formHtml = renderQuoteForm({ variant: embedForm, preselectService, idPrefix: embedForm === 'full' ? 'quote' : `quote-${pageKey}` });
    formSection = `\n    <section class="quote-form-section" id="quote-form">\n      <div class="container quote-form-wrap">\n        <h2 class="section-title">Get My Free Quote</h2>\n        ${formHtml}\n      </div>\n    </section>`;
  }
  const bodyHtml = `\n    ${heroSection}\n    ${statsBand}\n    ${bodySectionsHtml}\n    ${grid}\n    ${formSection}\n    ${ctaBand}\n  `;
  return renderPage({ title: meta.title, description: meta.description, canonicalPath: urlPath, bodyHtml, jsonLd });
}

module.exports = { renderContentPage, renderHero, renderBodySections, renderFaqAccordion, renderCtaBand, renderServiceCardGrid, renderStatsBand, content, metaMap, schema };
