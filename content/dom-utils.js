window.HubspotContent = window.HubspotContent || {};

window.HubspotContent.domUtils = {
  isVisible(element) {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      style.opacity === "0"
    ) {
      return false;
    }
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  },

  getAllSearchRoots() {
    const roots = [document];
    const queue = [document];

    while (queue.length) {
      const root = queue.shift();
      const elements = root.querySelectorAll("*");
      for (const element of elements) {
        if (element.shadowRoot && element.shadowRoot.mode === "open") {
          roots.push(element.shadowRoot);
          queue.push(element.shadowRoot);
        }
      }
    }

    return roots;
  },

  queryVisibleTextDeep(selectors) {
    const roots = this.getAllSearchRoots();
    for (const selector of selectors) {
      for (const root of roots) {
        const element = root.querySelector(selector);
        if (!element || !this.isVisible(element)) continue;
        const text = element.innerText?.trim() || "";
        if (text) return text;
      }
    }
    return "";
  },

  normalizeText(value) {
    return (value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  },

  getElementValueText(element) {
    if (!element) return "";
    if ("value" in element && typeof element.value === "string") {
      const value = element.value.trim();
      if (value) return value;
    }
    const text = element.innerText || element.textContent || "";
    return text.trim();
  },

  getAttributeText(element) {
    const attrs = [
      "title",
      "aria-label",
      "data-test-id",
      "data-selenium-test",
      "data-tooltip",
    ];
    const values = [];

    for (const attr of attrs) {
      const value = element.getAttribute(attr);
      if (value) values.push(value);
    }

    return values.join("\n");
  },

  getRichText(scopeElement) {
    const parts = [];
    const ownText = this.getElementValueText(scopeElement);
    if (ownText) parts.push(ownText);

    const ownAttributes = this.getAttributeText(scopeElement);
    if (ownAttributes) parts.push(ownAttributes);

    const descendants = scopeElement.querySelectorAll("*");
    for (const descendant of descendants) {
      const text = this.getElementValueText(descendant);
      if (text) parts.push(text);
      const attrText = this.getAttributeText(descendant);
      if (attrText) parts.push(attrText);
    }

    return parts.join("\n");
  },
};

