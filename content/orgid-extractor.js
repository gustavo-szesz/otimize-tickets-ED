window.HubspotContent = window.HubspotContent || {};

window.HubspotContent.orgIdExtractor = {
  hasOnlyEngaged10(text) {
    const normalized = window.HubspotContent.domUtils.normalizeText(text);
    return (
      normalized.includes("id engaged 1.0") &&
      !normalized.includes("id engaged 2.0")
    );
  },

  findBestCandidate(text, label) {
    if (!text) return "";
    const { domUtils, ORG_ID_REGEX } = window.HubspotContent;
    const normalizedText = domUtils.normalizeText(text);
    const normalizedLabel = domUtils.normalizeText(label);
    const labelIndex = normalizedText.indexOf(normalizedLabel);
    if (labelIndex < 0) return "";
    if (this.hasOnlyEngaged10(text)) return "";

    const hashCandidates = [];
    const regex = new RegExp(ORG_ID_REGEX.source, "gi");
    let match = regex.exec(text);
    while (match) {
      hashCandidates.push({ value: match[0], index: match.index });
      match = regex.exec(text);
    }
    if (!hashCandidates.length) return "";

    hashCandidates.sort(
      (a, b) => Math.abs(a.index - labelIndex) - Math.abs(b.index - labelIndex)
    );
    return hashCandidates[0].value.toLowerCase();
  },

  detectBestLabel(text) {
    const { ORG_ID_LABEL_RULES, domUtils } = window.HubspotContent;
    const normalized = domUtils.normalizeText(text);
    for (const rule of ORG_ID_LABEL_RULES) {
      if (normalized.includes(rule.label)) return rule;
    }
    return null;
  },

  findDirectPropertyValue() {
    const { ORG_ID_DIRECT_SELECTORS, domUtils, ORG_ID_REGEX } =
      window.HubspotContent;
    const roots = domUtils.getAllSearchRoots();

    for (const selector of ORG_ID_DIRECT_SELECTORS) {
      for (const root of roots) {
        const candidates = root.querySelectorAll(selector);
        for (const field of candidates) {
          if (!domUtils.isVisible(field)) continue;

          const value = domUtils.getElementValueText(field);
          const directHash = value.match(ORG_ID_REGEX)?.[0]?.toLowerCase() || "";
          if (!directHash) continue;

          const scope =
            field.closest('[data-test-id="DisplayOptimizedFormControl"]') ||
            field.closest('[data-test-id*="id_engaged"]') ||
            field.parentElement;
          const scopeText = scope ? domUtils.getRichText(scope) : "";
          const label = this.detectBestLabel(scopeText);

          if (scopeText && this.hasOnlyEngaged10(scopeText)) continue;
          if (
            label &&
            window.HubspotContent.domUtils.normalizeText(label.label) !==
              "id engaged 2.0"
          ) {
            continue;
          }

          return directHash;
        }
      }
    }
    return "";
  },

  scopesForLabelNode(node) {
    return [
      node,
      node.parentElement,
      node.parentElement?.parentElement,
      node.previousElementSibling,
      node.nextElementSibling,
      node.parentElement?.previousElementSibling,
      node.parentElement?.nextElementSibling,
    ].filter(Boolean);
  },

  extractOrgIdVisible() {
    const { domUtils, ORG_ID_LABEL_RULES } = window.HubspotContent;

    const direct = this.findDirectPropertyValue();
    if (direct) return direct;

    const roots = domUtils.getAllSearchRoots();
    const labelNodes = [];

    for (const root of roots) {
      const elements = root.querySelectorAll("*");
      for (const element of elements) {
        if (!domUtils.isVisible(element)) continue;

        const text = domUtils.getElementValueText(element);
        if (!text || this.hasOnlyEngaged10(text)) continue;

        const normalized = domUtils.normalizeText(text);
        for (const rule of ORG_ID_LABEL_RULES) {
          if (normalized.includes(rule.label)) {
            labelNodes.push({ element, score: rule.score, label: rule.label });
            break;
          }
        }
      }
    }

    labelNodes.sort((a, b) => b.score - a.score);

    for (const item of labelNodes) {
      const scopes = this.scopesForLabelNode(item.element);
      for (const scope of scopes) {
        if (!domUtils.isVisible(scope)) continue;
        const scopeText = domUtils.getRichText(scope);
        const candidate = this.findBestCandidate(scopeText, item.label);
        if (candidate) return candidate;
      }
    }

    return "";
  },
};

