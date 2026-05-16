window.HubspotContent = window.HubspotContent || {};

window.HubspotContent.registerMessageListener = function registerMessageListener() {
  if (window.HubspotContent._listenerRegistered) return;
  window.HubspotContent._listenerRegistered = true;

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message?.action) return;

    if (message.action === "extractTicketData") {
      sendResponse(window.HubspotContent.ticketExtractor.extractTicketData());
      return;
    }

    if (message.action === "extractOrgIdVisible") {
      sendResponse({
        orgId: window.HubspotContent.orgIdExtractor.extractOrgIdVisible(),
      });
    }
  });
};

