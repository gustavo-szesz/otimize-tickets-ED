window.HubspotPopup = window.HubspotPopup || {};

window.HubspotPopup.storage = {
  async persistFormValues() {
    const values = window.HubspotPopup.dom.collectFormValues(
      window.HubspotPopup.FIELD_IDS
    );
    await chrome.storage.local.set({
      [window.HubspotPopup.STORAGE_KEY]: values,
    });
  },

  async restoreFormValues() {
    const stored = await chrome.storage.local.get(window.HubspotPopup.STORAGE_KEY);
    return stored?.[window.HubspotPopup.STORAGE_KEY] || null;
  },
};

