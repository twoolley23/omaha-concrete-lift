'use strict';

/**
 * The content JSON's internal links use slugs like "/services-mudjacking"
 * or "/privacy-policy". Our actual route structure uses "/services/mudjacking"
 * and "/privacy". This map rewrites hrefs found in body copy so links resolve
 * correctly, WITHOUT altering any visible wording/disclaimer text.
 */
const LINK_MAP = {
  '/services-concrete-lifting': '/services/concrete-lifting',
  '/services-mudjacking': '/services/mudjacking',
  '/services-polyjacking': '/services/polyjacking',
  '/services-driveway-leveling': '/services/driveway-leveling',
  '/services-sidewalk-leveling': '/services/sidewalk-leveling',
  '/services-patio-leveling': '/services/patio-leveling',
  '/services-garage-slab-leveling': '/services/garage-slab-leveling',
  '/privacy-policy': '/privacy',
  '/terms-of-service': '/terms'
};

function fixInternalLinks(html) {
  if (!html) return html;
  let out = html;
  for (const [from, to] of Object.entries(LINK_MAP)) {
    // Only rewrite href="..." occurrences, exact path match (word boundary via quote)
    out = out.split(`href="${from}"`).join(`href="${to}"`);
  }
  return out;
}

module.exports = { fixInternalLinks, LINK_MAP };
