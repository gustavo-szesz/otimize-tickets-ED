window.HubspotPopup = window.HubspotPopup || {};

window.HubspotPopup.observation = {
  buildObservation() {
    const dom = window.HubspotPopup.dom;
    return [
      "Resumo interno do atendimento:",
      `- Ticket HubSpot: ${dom.getFieldValue("ticketId")}`,
      `- Link do ticket: ${dom.getFieldValue("ticketUrl")}`,
      `- Cliente/empresa: ${dom.getFieldValue("empresa")}`,
      `- Usuário/contato: ${dom.getFieldValue("usuario")}`,
      `- E-mail: ${dom.getFieldValue("email")}`,
      `- Org-id / ID EngagED 2.0: ${dom.getFieldValue("orgId")}`,
      `- Canal: ${dom.getFieldValue("canal")}`,
      `- Motivo do contato: ${dom.getFieldValue("motivo")}`,
      `- Ação realizada: ${dom.getFieldValue("acao")}`,
      `- Próximo passo: ${dom.getFieldValue("proximoPasso")}`,
      `- Observações: ${dom.getFieldValue("observacoes")}`,
    ].join("\n");
  },
};

