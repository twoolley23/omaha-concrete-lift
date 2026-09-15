'use strict';

const { escapeHtml } = require('./layout');

const SERVICE_OPTIONS = [
  'Concrete Lifting / Not Sure Which Type',
  'Mudjacking',
  'Polyjacking',
  'Driveway Leveling',
  'Sidewalk Leveling',
  'Patio Leveling',
  'Garage Slab Leveling',
  'Other'
];

const CONSENT_TEXT_VERSION = 'v2-2026-09-14';

const CONSENT_MARKETING_TEXT =
  'I agree to receive marketing text messages from Omaha Concrete Lift about concrete-leveling services, promotions, and related offers at the number provided. Message frequency varies. Msg & data rates may apply. Reply HELP for help and STOP to opt out. Consent is not a condition of purchasing any service, submitting a quote request, or doing business with Omaha Concrete Lift. See our <a href="/privacy">Privacy Policy</a> and <a href="/terms">Terms & Conditions</a>.';

const CONSENT_PROJECT_UPDATES_TEXT =
  'I agree to receive automated text messages about my concrete-leveling quote request, including questions about my project, contractor-match updates, appointment coordination, quote-status updates, and related service-request information at the number provided. Message frequency varies. Msg & data rates may apply. Reply HELP for help and STOP to opt out. Consent is not a condition of purchasing any service, submitting a quote request, or doing business with Omaha Concrete Lift. See our <a href="/privacy">Privacy Policy</a> and <a href="/terms">Terms & Conditions</a>.';

const SUCCESS_MESSAGE_HTML =
  "Thanks — your request is on its way! We're routing your project details to local concrete leveling contractors who serve your area. Expect a call, text, or email soon. In the meantime, feel free to browse our <a href=\"/faq\">FAQ</a> or learn more about <a href=\"/how-it-works\">how this works</a>.";

function renderQuoteForm({ variant = 'full', preselectService = '', idPrefix = 'quote' } = {}) {
  const isFull = variant === 'full';
  const options = SERVICE_OPTIONS.map((opt) => {
    const selected = opt === preselectService ? ' selected' : '';
    return `<option value="${escapeHtml(opt)}"${selected}>${escapeHtml(opt)}</option>`;
  }).join('');

  const descriptionField = isFull
    ? `\n      <div class="form-field">\n        <label for="${idPrefix}-description">Briefly describe the issue (what's sinking, how bad, any drainage concerns)</label>\n        <textarea id="${idPrefix}-description" name="description" rows="4" maxlength="1000" aria-describedby="${idPrefix}-description-error"></textarea>\n        <p class="field-error" id="${idPrefix}-description-error" role="alert" hidden></p>\n      </div>`
    : '';

  const contactMethodField = isFull
    ? `\n      <fieldset class="form-field form-fieldset">\n        <legend>Preferred contact method</legend>\n        <div class="radio-group">\n          <label class="radio-label"><input type="radio" name="preferred_contact_method" value="Phone" checked> Phone</label>\n          <label class="radio-label"><input type="radio" name="preferred_contact_method" value="Text"> Text</label>\n          <label class="radio-label"><input type="radio" name="preferred_contact_method" value="Email"> Email</label>\n        </div>\n      </fieldset>`
    : '';

  const smsConsentsHtml = `\n    <div class="form-field-consent-row form-field-sms-consents">\n      <span class="consent-section-label">SMS Consent (Optional)</span>\n      <label class="checkbox-label" for="${idPrefix}-marketing-consent">\n        <input type="checkbox" id="${idPrefix}-marketing-consent" name="marketing_sms_consent" value="true">\n        <span class="consent-text">A: <strong>Optional — Marketing texts from Omaha Concrete Lift.</strong> ${CONSENT_MARKETING_TEXT}</span>\n      </label>\n      <label class="checkbox-label" for="${idPrefix}-project-consent">\n        <input type="checkbox" id="${idPrefix}-project-consent" name="project_update_sms_consent" value="true">\n        <span class="consent-text">B: <strong>Optional — Quote and project updates from Omaha Concrete Lift.</strong> ${CONSENT_PROJECT_UPDATES_TEXT}</span>\n      </label>\n      <p class="consent-disclosure-note">\n        SMS consent is optional and not a condition of submitting this form.\n        By submitting, you authorize Omaha Concrete Lift to share your project and contact information with a matched local concrete-leveling provider solely to respond to your request.\n        <a href="/privacy">Privacy Policy</a> &middot; <a href="/terms">Terms &amp; Conditions</a>\n      </p>\n    </div>`;

  return `\n  <form class="quote-form ${isFull ? 'quote-form-full' : 'quote-form-condensed'}" id="${idPrefix}-form" novalidate autocomplete="on">\n    <div class="form-field">\n      <label for="${idPrefix}-name">Full Name</label>\n      <input type="text" id="${idPrefix}-name" name="name" required minlength="2" autocomplete="name"\n        aria-describedby="${idPrefix}-name-error">\n      <p class="field-error" id="${idPrefix}-name-error" role="alert" hidden></p>\n    </div>\n\n    <div class="form-field">\n      <label for="${idPrefix}-phone">Phone Number</label>\n      <input type="tel" id="${idPrefix}-phone" name="phone" required autocomplete="tel"\n        placeholder="(402) 555-0148" aria-describedby="${idPrefix}-phone-error">\n      <p class="field-error" id="${idPrefix}-phone-error" role="alert" hidden></p>\n    </div>\n\n    <div class="form-field">\n      <label for="${idPrefix}-email">Email Address</label>\n      <input type="email" id="${idPrefix}-email" name="email" required autocomplete="email"\n        aria-describedby="${idPrefix}-email-error">\n      <p class="field-error" id="${idPrefix}-email-error" role="alert" hidden></p>\n    </div>\n\n    <div class="form-field">\n      <label for="${idPrefix}-service_type">What kind of concrete leveling do you need?</label>\n      <select id="${idPrefix}-service_type" name="service_type" required aria-describedby="${idPrefix}-service_type-error">\n        <option value="">Select one&hellip;</option>\n        ${options}\n      </select>\n      <p class="field-error" id="${idPrefix}-service_type-error" role="alert" hidden></p>\n    </div>\n\n    <div class="form-field">\n      <label for="${idPrefix}-zip_or_city">Property City/ZIP Code</label>\n      <input type="text" id="${idPrefix}-zip_or_city" name="zip_or_city" required autocomplete="postal-code"\n        placeholder="e.g. Omaha or 68102" aria-describedby="${idPrefix}-zip_or_city-error">\n      <p class="field-error" id="${idPrefix}-zip_or_city-error" role="alert" hidden></p>\n    </div>\n    ${descriptionField}\n    ${contactMethodField}\n\n    <div class="form-field honeypot-field" aria-hidden="true">\n      <label for="${idPrefix}-website">Website</label>\n      <input type="text" id="${idPrefix}-website" name="website" tabindex="-1" autocomplete="off">\n    </div>\n\n    ${smsConsentsHtml}\n\n    <input type="hidden" name="consent_version" value="${CONSENT_TEXT_VERSION}">\n\n    <div class="form-status" id="${idPrefix}-status" role="alert" aria-live="polite"></div>\n\n    <button type="submit" class="btn btn-cta btn-submit">Get My Free Quote</button>\n  </form>`;
}

module.exports = { renderQuoteForm, SERVICE_OPTIONS, CONSENT_TEXT_VERSION, SUCCESS_MESSAGE_HTML };
