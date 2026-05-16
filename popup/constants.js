window.HubspotPopup = window.HubspotPopup || {};

window.HubspotPopup.FIELD_IDS = [
  "empresa",
  "usuario",
  "email",
  "orgId",
  "ticketId",
  "ticketUrl",
  "canal",
  "motivo",
  "acao",
  "proximoPasso",
  "observacoes",
];

window.HubspotPopup.STORAGE_KEY = "hubspotHelpDeskFormData";

window.HubspotPopup.ACTIONS = {
  EXTRACT_TICKET_DATA: "extractTicketData",
  EXTRACT_ORG_ID_VISIBLE: "extractOrgIdVisible",
};

window.HubspotPopup.CONTENT_SCRIPT_FILES = [
  "content/constants.js",
  "content/dom-utils.js",
  "content/ticket-extractor.js",
  "content/orgid-extractor.js",
  "content/message-handler.js",
  "content.js",
];
