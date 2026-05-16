window.HubspotPopup = window.HubspotPopup || {};

window.HubspotPopup.main = {
  bindEvents() {
    const { dom, useCases, FIELD_IDS, storage } = window.HubspotPopup;

    dom.byId("btnCaptureTicket").addEventListener("click", () => {
      void useCases.captureTicket();
    });
    dom.byId("btnCaptureOrgId").addEventListener("click", () => {
      void useCases.captureOrgId();
    });
    dom.byId("btnCopy").addEventListener("click", () => {
      void useCases.copyObservation();
    });
    dom.byId("btnClear").addEventListener("click", () => {
      useCases.clearFields();
    });

    for (const fieldId of FIELD_IDS) {
      dom.byId(fieldId).addEventListener("input", () => {
        void storage.persistFormValues();
      });
    }
  },

  async init() {
    const { dom, storage, FIELD_IDS } = window.HubspotPopup;
    this.bindEvents();
    try {
      const storedValues = await storage.restoreFormValues();
      dom.applyFormValues(FIELD_IDS, storedValues);
    } catch (_error) {
      dom.setStatus("Não foi possível restaurar os campos salvos.", true);
    }
  },
};

