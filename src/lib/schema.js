'use strict';

const { SITE_URL, PHONE_TEL, CONTACT_EMAIL } = require('./layout');

/**
 * JSON-LD schema builders.
 * NEVER emit LocalBusiness, GeneralContractor, AggregateRating, or Review here.
 * telephone/contactPoint fields are safe here (Organization/ContactPage, not
 * LocalBusiness) and use the site's real tracking number -- no street address.
 */

function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Omaha Concrete Lift',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
}

function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Omaha Concrete Lift',
    url: SITE_URL,
    description:
      'Omaha Concrete Lift is an independent referral and lead-matching service that connects homeowners in the Omaha, Nebraska metro area with local, independent concrete leveling contractors. Omaha Concrete Lift is not a contractor and does not perform concrete leveling work.',
    email: CONTACT_EMAIL,
    telephone: PHONE_TEL,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: PHONE_TEL,
      contactType: 'customer service',
      areaServed: 'US-NE',
      availableLanguage: ['English']
    },
    sameAs: []
  };
}

function faqPageSchema(bodySections) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: bodySections.map((s) => ({
      '@type': 'Question',
      name: s.heading,
      acceptedAnswer: {
        '@type': 'Answer',
        text: stripHtml(s.body_html_or_markdown)
      }
    }))
  };
}

function stripHtml(html) {
  return String(html)
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function breadcrumbListSchema(items) {
  // items: [{ name, path }]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path === '/' ? '' : item.path}`
    }))
  };
}

function webPageSchema({ name, description, urlPath }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: `${SITE_URL}${urlPath === '/' ? '' : urlPath}`
  };
}

function aboutPageSchema({ name, description, urlPath }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name,
    description,
    url: `${SITE_URL}${urlPath === '/' ? '' : urlPath}`
  };
}

function contactPageSchema({ name, description, urlPath }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name,
    description,
    url: `${SITE_URL}${urlPath === '/' ? '' : urlPath}`,
    mainEntity: {
      '@type': 'Organization',
      name: 'Omaha Concrete Lift',
      telephone: PHONE_TEL,
      email: CONTACT_EMAIL
    }
  };
}

function itemListSchema(itemNames) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: itemNames.map((n, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: n
    }))
  };
}

module.exports = {
  websiteSchema,
  organizationSchema,
  faqPageSchema,
  breadcrumbListSchema,
  webPageSchema,
  aboutPageSchema,
  contactPageSchema,
  itemListSchema,
  stripHtml
};
