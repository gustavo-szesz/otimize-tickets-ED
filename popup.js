const fieldIds = [
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
const STORAGE_KEY = "hubspotHelpDeskFormData";

function byId(id) {
  return document.getElementById(id);
}

function setStatus(message, isError = false) {
  const status = byId("status");
  status.textContent = message;
  status.classList.toggle("error", Boolean(isError));
}

function setFieldValue(id, value) {
  byId(id).value = value || "";
}

function getFieldValue(id) {
  return byId(id).value.trim();
}

function collectCurrentFormValues() {
  const values = {};
  for (const fieldId of fieldIds) {
    values[fieldId] = byId(fieldId).value;
  }
  return values;
}

async function persistFormValues() {
  await chrome.storage.local.set({
    [STORAGE_KEY]: collectCurrentFormValues(),
  });
}

async function restoreFormValues() {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  const values = stored?.[STORAGE_KEY];
  if (!values || typeof values !== "object") return;

  for (const fieldId of fieldIds) {
    if (typeof values[fieldId] === "string") {
      setFieldValue(fieldId, values[fieldId]);
    }
  }
}

async function getCurrentTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

async function sendMessageToContent(action) {
  const tab = await getCurrentTab();
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
      files: ["content.js"],
    });
    return chrome.tabs.sendMessage(tab.id, { action });
  }
}

function buildObservation() {
  return [
    "Resumo interno do atendimento:",
    `- Ticket HubSpot: ${getFieldValue("ticketId")}`,
    `- Link do ticket: ${getFieldValue("ticketUrl")}`,
    `- Cliente/empresa: ${getFieldValue("empresa")}`,
    `- Usuário/contato: ${getFieldValue("usuario")}`,
    `- E-mail: ${getFieldValue("email")}`,
    `- Org-id / ID EngagED 2.0: ${getFieldValue("orgId")}`,
    `- Canal: ${getFieldValue("canal")}`,
    `- Motivo do contato: ${getFieldValue("motivo")}`,
    `- Ação realizada: ${getFieldValue("acao")}`,
    `- Próximo passo: ${getFieldValue("proximoPasso")}`,
    `- Observações: ${getFieldValue("observacoes")}`,
  ].join("\n");
}

async function handleCaptureTicket() {
  setStatus("Capturando dados visíveis do ticket...");
  try {
    const data = await sendMessageToContent("extractTicketData");
    setFieldValue("ticketId", data?.ticketId);
    setFieldValue("ticketUrl", data?.ticketUrl);
    setFieldValue("empresa", data?.empresa);
    setFieldValue("usuario", data?.usuario);
    setFieldValue("email", data?.email);
    setFieldValue("canal", data?.canal);
    await persistFormValues();
    setStatus("Dados do ticket capturados. Revise e ajuste se necessário.");
  } catch (error) {
    setStatus(error.message || "Falha ao capturar dados do ticket.", true);
  }
}

async function handleCaptureOrgId() {
  setStatus("Buscando org-id visível...");
  try {
    const data = await sendMessageToContent("extractOrgIdVisible");
    if (data?.orgId) {
      setFieldValue("orgId", data.orgId);
      await persistFormValues();
      setStatus("Org-id capturado com sucesso.");
      return;
    }

    setStatus(
      "Org-id não encontrado. Abra manualmente os detalhes da empresa pelo ícone de olho e clique novamente em Capturar org-id visível.",
      true
    );
  } catch (error) {
    setStatus(error.message || "Falha ao capturar org-id.", true);
  }
}

async function handleCopyObservation() {
  const observation = buildObservation();
  try {
    await navigator.clipboard.writeText(observation);
    setStatus("Observação copiada. Cole no campo Observação do HubSpot.");
  } catch (_error) {
    setStatus("Não foi possível copiar. Tente novamente.", true);
  }
}

function handleClearFields() {
  for (const fieldId of fieldIds) {
    setFieldValue(fieldId, "");
  }
  void persistFormValues();
  setStatus("Campos limpos.");
}

function bindEvents() {
  byId("btnCaptureTicket").addEventListener("click", handleCaptureTicket);
  byId("btnCaptureOrgId").addEventListener("click", handleCaptureOrgId);
  byId("btnCopy").addEventListener("click", handleCopyObservation);
  byId("btnClear").addEventListener("click", handleClearFields);

  for (const fieldId of fieldIds) {
    byId(fieldId).addEventListener("input", () => {
      void persistFormValues();
    });
  }
}

async function init() {
  bindEvents();
  try {
    await restoreFormValues();
  } catch (_error) {
    setStatus("Não foi possível restaurar os campos salvos.", true);
  }
}

void init();
