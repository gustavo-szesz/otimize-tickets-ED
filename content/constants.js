window.HubspotContent = window.HubspotContent || {};

window.HubspotContent.EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
window.HubspotContent.ORG_ID_REGEX = /\b[a-f0-9]{24}\b/i;

window.HubspotContent.ORG_ID_LABEL_RULES = [
  { label: "id engaged 2.0", score: 100 },
  { label: "id engaged", score: 80 },
  { label: "engaged 2.0", score: 60 },
  { label: "org-id", score: 40 },
  { label: "org id", score: 30 },
  { label: "orgid", score: 20 },
];

window.HubspotContent.USER_NAME_SELECTORS = [
  '[data-test-id="contact-chicklet-title-link"]',
  '[data-selenium-test="contact-chicklet-title"]',
  '[data-test-id="sender-name"]',
];

window.HubspotContent.COMPANY_NAME_SELECTORS = [
  '[data-selenium-test="contact-chicklet-job-title"]',
  '[data-test-id="contact-chicklet-job-title"]',
];

window.HubspotContent.ORG_ID_DIRECT_SELECTORS = [
  '[data-selenium-test="property-input-id_engaged_area_de_membros"]',
  '[data-test-id="id_engaged_area_de_membros"] textarea',
  '[data-test-id="id_engaged_area_de_membros"] input',
  '[data-test-id*="id_engaged_area"] textarea',
  '[data-test-id*="id_engaged_area"] input',
];

