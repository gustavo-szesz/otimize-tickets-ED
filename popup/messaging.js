window.HubspotPopup = window.HubspotPopup || {};

window.HubspotPopup.messaging = {
  async getCurrentTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0];
  },

  async sendMessageToContent(action) {
    const tab = await this.getCurrentTab();
    if (!tab?.id) {
      throw new Error("Não foi possível acessar a aba ativa.");
    }

    if (!tab.url?.startsWith("https://app.hubspot.com/help-desk/")) {
      throw new Error("Abra um ticket em https://app.hubspot.com/help-desk/.");
    }

    try {
      return await chrome.tabs.sendMessage(tab.id, { action });
    } catch (_firstError) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: window.HubspotPopup.CONTENT_SCRIPT_FILES,
      });
      return chrome.tabs.sendMessage(tab.id, { action });
    }
  },
};

