window.HubspotPopup = window.HubspotPopup || {};

window.HubspotPopup.useCases = {
  async captureTicket() {
    const { dom, storage, messaging, ACTIONS } = window.HubspotPopup;
    dom.setStatus("Capturando dados visíveis do ticket...");
    try {
      const data = await messaging.sendMessageToContent(ACTIONS.EXTRACT_TICKET_DATA);
      dom.setFieldValue("ticketId", data?.ticketId);
      dom.setFieldValue("ticketUrl", data?.ticketUrl);
      dom.setFieldValue("empresa", data?.empresa);
      dom.setFieldValue("usuario", data?.usuario);
      dom.setFieldValue("email", data?.email);
      dom.setFieldValue("canal", data?.canal);
      await storage.persistFormValues();
      dom.setStatus("Dados do ticket capturados. Revise e ajuste se necessário.");
    } catch (error) {
      dom.setStatus(error.message || "Falha ao capturar dados do ticket.", true);
    }
  },

  async captureOrgId() {
    const { dom, storage, messaging, ACTIONS } = window.HubspotPopup;
    dom.setStatus("Buscando org-id visível...");
    try {
      const data = await messaging.sendMessageToContent(
        ACTIONS.EXTRACT_ORG_ID_VISIBLE
      );
      if (data?.orgId) {
        dom.setFieldValue("orgId", data.orgId);
        await storage.persistFormValues();
        dom.setStatus("Org-id capturado com sucesso.");
        return;
      }

      dom.setStatus(
        "Org-id não encontrado. Abra manualmente os detalhes da empresa pelo ícone de olho e clique novamente em Capturar org-id visível.",
        true
      );
    } catch (error) {
      dom.setStatus(error.message || "Falha ao capturar org-id.", true);
    }
  },

  async copyObservation() {
    const { dom, observation } = window.HubspotPopup;
    const text = observation.buildObservation();
    try {
      await navigator.clipboard.writeText(text);
      dom.setStatus("Observação copiada. Cole no campo Observação do HubSpot.");
    } catch (_error) {
      dom.setStatus("Não foi possível copiar. Tente novamente.", true);
    }
  },

  clearFields() {
    const { dom, storage, FIELD_IDS } = window.HubspotPopup;
    dom.clearForm(FIELD_IDS);
    void storage.persistFormValues();
    dom.setStatus("Campos limpos.");
  },
};

