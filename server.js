"use strict";

const express = require('express');
const path = require('path');
const crypto = require('crypto');

const { renderPage, escapeHtml, SITE_URL } = require('./src/lib/layout');
const { renderContentPage, content, metaMap, schema } = require('./src/lib/pageBuilder');
const { insertLead } = require('./src/lib/db');
const { createRateLimiter } = require('./src/lib/rateLimiter');
const { CONSENT_TEXT_VERSION } = require('./src/lib/quoteForm');

const app = express();
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');
app.set('trust proxy', true);

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/img', express.static(path.join(__dirname, 'public', 'img')));

app.get('/', (req, res) => {
  const jsonLd = [schema.websiteSchema(), schema.organizationSchema()];
  const html = renderContentPage({
    pageKey: 'home', urlPath: '/', jsonLd,
    embedForm: 'full', showServiceGrid: true, showStatsBand: true
  });
  res.type('html').send(html);
});

const SERVICE_ROUTES = [
  { path: '/services/concrete-lifting', pageKey: 'services-concrete-lifting', label: 'Concrete Lifting', preselect: 'Concrete Lifting / Not Sure Which Type' },
  { path: '/services/mudjacking', pageKey: 'services-mudjacking', label: 'Mudjacking', preselect: 'Mudjacking' },
  { path: '/services/polyjacking', pageKey: 'services-polyjacking', label: 'Polyjacking', preselect: 'Polyjacking' },
  { path: '/services/driveway-leveling', pageKey: 'services-driveway-leveling', label: 'Driveway Leveling', preselect: 'Driveway Leveling' },
  { path: '/services/sidewalk-leveling', pageKey: 'services-sidewalk-leveling', label: 'Sidewalk Leveling', preselect: 'Sidewalk Leveling' },
  { path: '/services/patio-leveling', pageKey: 'services-patio-leveling', label: 'Patio Leveling', preselect: 'Patio Leveling' },
  { path: '/services/garage-slab-leveling', pageKey: 'services-garage-slab-leveling', label: 'Garage Slab Leveling', preselect: 'Garage Slab Leveling' }
];

for (const svc of SERVICE_ROUTES) {
  app.get(svc.path, (req, res) => {
    const jsonLd = [
      schema.breadcrumbListSchema([
        { name: 'Home', path: '/' },
        { name: svc.label, path: svc.path }
      ])
    ];
    const html = renderContentPage({
      pageKey: svc.pageKey, urlPath: svc.path, jsonLd,
      embedForm: 'condensed', preselectService: svc.preselect
    });
    res.type('html').send(html);
  });
}

app.get('/service-areas', (req, res) => {
  const areas = ['Omaha', 'Bellevue', 'Papillion', 'La Vista', 'Elkhorn', 'Gretna', 'Millard', 'Ralston', 'Council Bluffs IA', 'Fremont NE'];
  const jsonLd = [
    schema.breadcrumbListSchema([
      { name: 'Home', path: '/' },
      { name: 'Service Areas', path: '/service-areas' }
    ]),
    schema.itemListSchema(areas)
  ];
  const html = renderContentPage({ pageKey: 'service-areas', urlPath: '/service-areas', jsonLd });
  res.type('html').send(html);
});

app.get('/how-it-works', (req, res) => {
  const jsonLd = [
    schema.breadcrumbListSchema([
      { name: 'Home', path: '/' },
      { name: 'How It Works', path: '/how-it-works' }
    ])
  ];
  const html = renderContentPage({ pageKey: 'how-it-works', urlPath: '/how-it-works', jsonLd, embedForm: 'condensed' });
  res.type('html').send(html);
});

app.get('/faq', (req, res) => {
  const page = content.pages.faq;
  const jsonLd = [
    schema.faqPageSchema(page.body_sections),
    schema.breadcrumbListSchema([
      { name: 'Home', path: '/' },
      { name: 'FAQ', path: '/faq' }
    ])
  ];
  const html = renderContentPage({ pageKey: 'faq', urlPath: '/faq', jsonLd, isFaq: true, embedForm: 'condensed' });
  res.type('html').send(html);
});

app.get('/about', (req, res) => {
  const meta = metaMap.about;
  const jsonLd = [
    schema.breadcrumbListSchema([
      { name: 'Home', path: '/' },
      { name: 'About', path: '/about' }
    ]),
    schema.aboutPageSchema({ name: meta.title, description: meta.description, urlPath: '/about' })
  ];
  const html = renderContentPage({ pageKey: 'about', urlPath: '/about', jsonLd });
  res.type('html').send(html);
});

app.get('/contact', (req, res) => {
  const meta = metaMap.contact;
  const jsonLd = [
    schema.breadcrumbListSchema([
      { name: 'Home', path: '/' },
      { name: 'Contact', path: '/contact' }
    ]),
    schema.contactPageSchema({ name: meta.title, description: meta.description, urlPath: '/contact' })
  ];
  const html = renderContentPage({ pageKey: 'contact', urlPath: '/contact', jsonLd, embedForm: 'full' });
  res.type('html').send(html);
});

const LEGAL_ROUTES = [
  { path: '/privacy', pageKey: 'privacy-policy', label: 'Privacy Policy' },
  { path: '/terms', pageKey: 'terms-of-service', label: 'Terms of Service' },
  { path: '/referral-disclosure', pageKey: 'referral-disclosure', label: 'Referral Disclosure' }
];

for (const legal of LEGAL_ROUTES) {
  app.get(legal.path, (req, res) => {
    const meta = metaMap[legal.pageKey];
    const jsonLd = [
      schema.breadcrumbListSchema([
        { name: 'Home', path: '/' },
        { name: legal.label, path: legal.path }
      ]),
      schema.webPageSchema({ name: meta.title, description: meta.description, urlPath: legal.path })
    ];
    const html = renderContentPage({ pageKey: legal.pageKey, urlPath: legal.path, jsonLd });
    res.type('html').send(html);
  });
}

app.get('/sitemap.xml', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/services/concrete-lifting', changefreq: 'monthly', priority: '0.9' },
    { path: '/services/mudjacking', changefreq: 'monthly', priority: '0.8' },
    { path: '/services/polyjacking', changefreq: 'monthly', priority: '0.8' },
    { path: '/services/driveway-leveling', changefreq: 'monthly', priority: '0.8' },
    { path: '/services/sidewalk-leveling', changefreq: 'monthly', priority: '0.8' },
    { path: '/services/patio-leveling', changefreq: 'monthly', priority: '0.8' },
    { path: '/services/garage-slab-leveling', changefreq: 'monthly', priority: '0.8' },
    { path: '/service-areas', changefreq: 'monthly', priority: '0.7' },
    { path: '/how-it-works', changefreq: 'monthly', priority: '0.7' },
    { path: '/faq', changefreq: 'monthly', priority: '0.7' },
    { path: '/about', changefreq: 'yearly', priority: '0.5' },
    { path: '/contact', changefreq: 'monthly', priority: '0.9' },
    { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
    { path: '/terms', changefreq: 'yearly', priority: '0.3' },
    { path: '/referral-disclosure', changefreq: 'yearly', priority: '0.4' }
  ];
  const body = urls.map((u) => `  <url>\n    <loc>${SITE_URL}${u.path === '/' ? '' : u.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n');
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`);
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
});

const quoteRateLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 5 });

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  const digits = String(phone).replace(/\D/g, '');
  return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
}

app.post('/api/quote', quoteRateLimiter, (req, res) => {
  const body = req.body || {};
  if (body.website && String(body.website).trim() !== '') {
    return res.status(200).json({ ok: true });
  }
  const name = (body.name || '').trim();
  const phone = (body.phone || '').trim();
  const email = (body.email || '').trim();
  const serviceType = (body.service_type || '').trim();
  const zipOrCity = (body.zip_or_city || '').trim();
  const description = (body.description || '').trim();
  const preferredContactMethod = (body.preferred_contact_method || 'Phone').trim();
  const marketingSmsConsent = body.marketing_sms_consent === true || body.marketing_sms_consent === 'true' || body.marketing_sms_consent === 'on' ? 1 : 0;
  const projectUpdateSmsConsent = body.project_update_sms_consent === true || body.project_update_sms_consent === 'true' || body.project_update_sms_consent === 'on' ? 1 : 0;
  if (!name || name.length < 2) return res.status(400).json({ ok: false, error: 'Please enter your full name.' });
  if (!phone || !isValidPhone(phone)) return res.status(400).json({ ok: false, error: 'Please enter a valid 10-digit US phone number.' });
  if (!email || !isValidEmail(email)) return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
  if (!serviceType) return res.status(400).json({ ok: false, error: 'Please select the type of concrete leveling you need.' });
  if (!zipOrCity) return res.status(400).json({ ok: false, error: 'Please enter your property city or ZIP code.' });
  const id = crypto.randomUUID();
  const nowIso = new Date().toISOString();
  const lead = { id, created_at: nowIso, name, phone, email, service_type: serviceType, zip_or_city: zipOrCity, description: description || null, preferred_contact_method: preferredContactMethod, marketing_sms_consent: marketingSmsConsent, project_update_sms_consent: projectUpdateSmsConsent, consent_version: body.consent_version || CONSENT_TEXT_VERSION, consent_timestamp: nowIso, source_ip: req.ip || null, user_agent: req.get('user-agent') || null };
  try { insertLead(lead); } catch (err) { console.error('Failed to persist lead:', err.message); return res.status(500).json({ ok: false, error: 'Something went wrong saving your request. Please try again.' }); }
  console.log(`NEW LEAD: id=${lead.id} service_type="${lead.service_type}" zip_or_city="${lead.zip_or_city}" marketing_sms=${marketingSmsConsent} project_sms=${projectUpdateSmsConsent}`);
  return res.status(200).json({ ok: true });
});

app.use((req, res) => {
  const page = content.pages['404'];
  const meta = metaMap['404'];
  const { renderHero, renderBodySections, renderCtaBand } = require('./src/lib/pageBuilder');
  const bodyHtml = `\n    <section class="hero hero-404">\n      <div class="container hero-inner">\n        <div class="hero-content">\n          <h1 class="hero-title">${escapeHtml(page.h1)}</h1>\n          <p class="hero-subhead">${escapeHtml(page.hero_subhead)}</p>\n        </div>\n      </div>\n    </section>\n    <div class="container content-sections-wrap">${renderBodySections(page.body_sections)}</div>\n    ${renderCtaBand({ ctaText: page.cta_text, ctaButtonLabel: page.cta_button_label })}\n  `;
  const html = renderPage({ title: meta.title, description: meta.description, canonicalPath: req.path, bodyHtml });
  res.status(404).type('html').send(html);
});

app.listen(PORT, '0.0.0.0', () => { console.log(`Omaha Concrete Lift server listening on 0.0.0.0:${PORT}`); });

module.exports = app;
