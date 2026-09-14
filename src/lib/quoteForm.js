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

const CONSENT_HTML =
  'By checking this box and submitting this form, I agree to be contacted by Omaha Concrete Lift and/or matched local concrete leveling contractors by phone, text message (SMS), and/or email regarding my request, including via automated dialing or messaging technology. Message and data rates may apply; message frequency varies. Consent is not a condition of purchase. I have read and agree to the <a href="/referral-disclosure">Referral Disclosure</a>, <a href="/privacy">Privacy Policy</a>, and <a href="/terms">Terms of Service</a>.';

const CONSENT_TEXT_VERSION = 'v1-2026-09-14';

const SUCCESS_MESSAGE_HTML =
  "Thanks — your request is on its way! We're routing your project details to local concrete leveling contractors who serve your area. Expect a call, text, or email soon. In the meantime, feel free to browse our <a href=\"/faq\">FAQ</a> or learn more about <a href=\"/how-it-works\">how this works</a>.";

/**
 * Renders the quote form.
 * @param {Object} opts
 * @param {'full'|'condensed'} opts.variant
 * @param {string} [opts.preselectService] - option label to preselect
 * @param {string} [opts.idPrefix] - unique id prefix so multiple forms can exist per page
 */
function renderQuoteForm({ variant = 'full', preselectService = '', idPrefix = 'quote' } = {}) {
  const isFull = variant === 'full';
  const options = SERVICE_OPTIONS.map((opt) => {
    const selected = opt === preselectService ? ' selected' : '';
    return `<option value="${escapeHtml(opt)}"${selected}>${escapeHtml(opt)}</option>`;
  }).join('');

  const descriptionField = isFull
    ? `
      <div class="form-field">
        <label for="${idPrefix}-description">Briefly describe the issue (what's sinking, how bad, any drainage concerns)</label>
        <textarea id="${idPrefix}-description" name="description" rows="4" maxlength="1000" aria-describedby="${idPrefix}-description-error"></textarea>
        <p class="field-error" id="${idPrefix}-description-error" role="alert" hidden></p>
      </div>`
    : '';

  const contactMethodField = isFull
    ? `
      <fieldset class="form-field form-fieldset">
        <legend>Preferred contact method</legend>
        <div class="radio-group">
          <label class="radio-label"><input type="radio" name="preferred_contact_method" value="Phone" checked> Phone</label>
          <label class="radio-label"><input type="radio" name="preferred_contact_method" value="Text"> Text</label>
          <label class="radio-label"><input type="radio" name="preferred_contact_method" value="Email"> Email</label>
        </div>
      </fieldset>`
    : '';

  return `
  <form class="quote-form ${isFull ? 'quote-form-full' : 'quote-form-condensed'}" id="${idPrefix}-form" novalidate autocomplete="on">
    <div class="form-field">
      <label for="${idPrefix}-name">Full Name</label>
      <input type="text" id="${idPrefix}-name" name="name" required minlength="2" autocomplete="name"
        aria-describedby="${idPrefix}-name-error">
      <p class="field-error" id="${idPrefix}-name-error" role="alert" hidden></p>
    </div>

    <div class="form-field">
      <label for="${idPrefix}-phone">Phone Number</label>
      <input type="tel" id="${idPrefix}-phone" name="phone" required autocomplete="tel"
        placeholder="(402) 555-0148" aria-describedby="${idPrefix}-phone-error">
      <p class="field-error" id="${idPrefix}-phone-error" role="alert" hidden></p>
    </div>

    <div class="form-field">
      <label for="${idPrefix}-email">Email Address</label>
      <input type="email" id="${idPrefix}-email" name="email" required autocomplete="email"
        aria-describedby="${idPrefix}-email-error">
      <p class="field-error" id="${idPrefix}-email-error" role="alert" hidden></p>
    </div>

    <div class="form-field">
      <label for="${idPrefix}-service_type">What kind of concrete leveling do you need?</label>
      <select id="${idPrefix}-service_type" name="service_type" required aria-describedby="${idPrefix}-service_type-error">
        <option value="">Select one&hellip;</option>
        ${options}
      </select>
      <p class="field-error" id="${idPrefix}-service_type-error" role="alert" hidden></p>
    </div>

    <div class="form-field">
      <label for="${idPrefix}-zip_or_city">Property City/ZIP Code</label>
      <input type="text" id="${idPrefix}-zip_or_city" name="zip_or_city" required autocomplete="postal-code"
        placeholder="e.g. Omaha or 68102" aria-describedby="${idPrefix}-zip_or_city-error">
      <p class="field-error" id="${idPrefix}-zip_or_city-error" role="alert" hidden></p>
    </div>
    ${descriptionField}
    ${contactMethodField}

    <!-- Honeypot field: genuinely hidden from sighted users and screen readers,
         not just display:none, to better trap automated form-fillers. -->
    <div class="form-field honeypot-field" aria-hidden="true">
      <label for="${idPrefix}-website">Website</label>
      <input type="text" id="${idPrefix}-website" name="website" tabindex="-1" autocomplete="off">
    </div>

    <div class="form-field form-field-consent">
      <label class="checkbox-label" for="${idPrefix}-consent">
        <input type="checkbox" id="${idPrefix}-consent" name="consent" required aria-describedby="${idPrefix}-consent-error">
        <span class="consent-text">${CONSENT_HTML}</span>
      </label>
      <p class="field-error" id="${idPrefix}-consent-error" role="alert" hidden></p>
      <input type="hidden" name="consent_text_version" value="${CONSENT_TEXT_VERSION}">
    </div>

    <div class="form-status" id="${idPrefix}-status" role="alert" aria-live="polite"></div>

    <button type="submit" class="btn btn-cta btn-submit">Get My Free Quote</button>
  </form>`;
}

module.exports = { renderQuoteForm, SERVICE_OPTIONS, CONSENT_TEXT_VERSION, SUCCESS_MESSAGE_HTML };
