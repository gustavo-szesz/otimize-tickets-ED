window.HubspotPopup = window.HubspotPopup || {};

window.HubspotPopup.dom = {
  byId(id) {
    return document.getElementById(id);
  },

  setStatus(message, isError = false) {
    const statusElement = this.byId("status");
    statusElement.textContent = message;
    statusElement.classList.toggle("error", Boolean(isError));
  },

  setFieldValue(id, value) {
    this.byId(id).value = value || "";
  },

  getFieldValue(id) {
    return this.byId(id).value.trim();
  },

  collectFormValues(fieldIds) {
    const values = {};
    for (const fieldId of fieldIds) {
      values[fieldId] = this.byId(fieldId).value;
    }
    return values;
  },

  applyFormValues(fieldIds, values) {
    if (!values || typeof values !== "object") return;
    for (const fieldId of fieldIds) {
      if (typeof values[fieldId] === "string") {
        this.setFieldValue(fieldId, values[fieldId]);
      }
    }
  },

  clearForm(fieldIds) {
    for (const fieldId of fieldIds) {
      this.setFieldValue(fieldId, "");
    }
  },
};

