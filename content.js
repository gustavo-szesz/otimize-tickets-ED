(function () {
  const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
  const ORG_ID_REGEX = /\b[a-f0-9]{24}\b/i;

  function isVisible(element) {
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
  }

  function getText(selector, root = document) {
    const element = root.querySelector(selector);
    if (!element || !isVisible(element)) return "";
    return element.innerText?.trim() || "";
  }

  function getAllSearchRoots() {
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
  }

  function queryVisibleTextDeep(selectors) {
    const roots = getAllSearchRoots();
    for (const selector of selectors) {
      for (const root of roots) {
        const element = root.querySelector(selector);
        if (!element || !isVisible(element)) continue;
        const text = element.innerText?.trim() || "";
        if (text) return text;
      }
    }
    return "";
  }

  function extractTicketId() {
    return location.href.match(/\/ticket\/(\d+)/)?.[1] || "";
  }

  function extractTicketUrl() {
    return location.href;
  }

  function extractEmail() {
    const relevantRoots = [
      document.querySelector('[data-test-id="AgentThreadHistory"]'),
      document.querySelector('[data-test-id="inbox-thread-loaded"]'),
      document.querySelector('[data-selenium-test="chicklet"]'),
      document.body,
    ].filter(Boolean);

    for (const root of relevantRoots) {
      const links = Array.from(root.querySelectorAll('a[href^="mailto:"]')).filter(
        isVisible
      );
      for (const link of links) {
        const mail = link.getAttribute("href")?.replace(/^mailto:/i, "").trim();
        if (mail) return mail;
      }
    }

    for (const root of relevantRoots) {
      const text = root.innerText || "";
      const match = text.match(EMAIL_REGEX);
      if (match) return match[0];
    }

    return "";
  }

  function extractChannel() {
    if (location.hash.toLowerCase().includes("whatsapp")) return "WhatsApp";
    if ((document.body?.innerText || "").toLowerCase().includes("whatsapp")) {
      return "WhatsApp";
    }
    return "";
  }

  function extractUserName() {
    const selectors = [
      '[data-test-id="contact-chicklet-title-link"]',
      '[data-selenium-test="contact-chicklet-title"]',
      '[data-test-id="sender-name"]',
    ];

    const text = queryVisibleTextDeep(selectors);
    if (text) return text.replace(/^Talvez:\s*/i, "").trim();

    return "";
  }

  function extractCompanyName() {
    const selectors = [
      '[data-selenium-test="contact-chicklet-job-title"]',
      '[data-test-id="contact-chicklet-job-title"]',
    ];

    const text = queryVisibleTextDeep(selectors);
    if (text) return text.trim();

    return "";
  }

  function normalizeText(value) {
    return (value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function extractOrgIdVisible() {
    const labelRules = [
      { label: "id engaged 2.0", score: 100 },
      { label: "id engaged", score: 80 },
      { label: "engaged 2.0", score: 60 },
      { label: "org-id", score: 40 },
      { label: "org id", score: 30 },
      { label: "orgid", score: 20 },
    ];

    function hasOnlyEngaged10(text) {
      const normalized = normalizeText(text);
      return (
        normalized.includes("id engaged 1.0") &&
        !normalized.includes("id engaged 2.0")
      );
    }

    function getElementValueText(element) {
      if (!element) return "";
      if ("value" in element && typeof element.value === "string") {
        const value = element.value.trim();
        if (value) return value;
      }
      const text = element.innerText || element.textContent || "";
      return text.trim();
    }

    function getAttributeText(element) {
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
    }

    function getRichText(scopeElement) {
      const parts = [];
      const ownText = getElementValueText(scopeElement);
      if (ownText) parts.push(ownText);

      const ownAttributes = getAttributeText(scopeElement);
      if (ownAttributes) parts.push(ownAttributes);

      const descendants = scopeElement.querySelectorAll("*");
      for (const descendant of descendants) {
        const text = getElementValueText(descendant);
        if (text) parts.push(text);
        const attrText = getAttributeText(descendant);
        if (attrText) parts.push(attrText);
      }

      return parts.join("\n");
    }

    function findBestCandidate(text, label) {
      if (!text) return "";
      const normalizedText = normalizeText(text);
      const normalizedLabel = normalizeText(label);
      const labelIndex = normalizedText.indexOf(normalizedLabel);
      if (labelIndex < 0) return "";
      if (hasOnlyEngaged10(text)) return "";

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
    }

    function detectBestLabel(text) {
      const normalized = normalizeText(text);
      for (const rule of labelRules) {
        if (normalized.includes(rule.label)) return rule;
      }
      return null;
    }

    function findDirectPropertyValue() {
      const directSelectors = [
        '[data-selenium-test="property-input-id_engaged_area_de_membros"]',
        '[data-test-id="id_engaged_area_de_membros"] textarea',
        '[data-test-id="id_engaged_area_de_membros"] input',
        '[data-test-id*="id_engaged_area"] textarea',
        '[data-test-id*="id_engaged_area"] input',
      ];

      const roots = getAllSearchRoots();
      for (const selector of directSelectors) {
        for (const root of roots) {
          const candidates = root.querySelectorAll(selector);
          for (const field of candidates) {
            if (!isVisible(field)) continue;

            const value = getElementValueText(field);
            const directHash = value.match(ORG_ID_REGEX)?.[0]?.toLowerCase() || "";
            if (!directHash) continue;

            const scope =
              field.closest('[data-test-id="DisplayOptimizedFormControl"]') ||
              field.closest('[data-test-id*="id_engaged"]') ||
              field.parentElement;
            const scopeText = scope ? getRichText(scope) : "";
            const label = detectBestLabel(scopeText);

            if (scopeText && hasOnlyEngaged10(scopeText)) continue;
            if (label && normalizeText(label.label) !== "id engaged 2.0") continue;

            return directHash;
          }
        }
      }
      return "";
    }

    function scopesForLabelNode(node) {
      return [
        node,
        node.parentElement,
        node.parentElement?.parentElement,
        node.previousElementSibling,
        node.nextElementSibling,
        node.parentElement?.previousElementSibling,
        node.parentElement?.nextElementSibling,
      ].filter(Boolean);
    }

    const direct = findDirectPropertyValue();
    if (direct) return direct;

    const roots = getAllSearchRoots();
    const labelNodes = [];

    for (const root of roots) {
      const elements = root.querySelectorAll("*");
      for (const element of elements) {
        if (!isVisible(element)) continue;

        const text = getElementValueText(element);
        if (!text || hasOnlyEngaged10(text)) continue;

        const normalized = normalizeText(text);
        for (const rule of labelRules) {
          if (normalized.includes(rule.label)) {
            labelNodes.push({ element, score: rule.score, label: rule.label });
            break;
          }
        }
      }
    }

    labelNodes.sort((a, b) => b.score - a.score);

    for (const item of labelNodes) {
      const scopes = scopesForLabelNode(item.element);
      for (const scope of scopes) {
        if (!isVisible(scope)) continue;
        const scopeText = getRichText(scope);
        const candidate = findBestCandidate(scopeText, item.label);
        if (candidate) return candidate;
      }
    }

    return "";
  }

  function extractTicketData() {
    return {
      ticketId: extractTicketId(),
      ticketUrl: extractTicketUrl(),
      empresa: extractCompanyName(),
      usuario: extractUserName(),
      email: extractEmail(),
      canal: extractChannel(),
    };
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message?.action) return;

    if (message.action === "extractTicketData") {
      sendResponse(extractTicketData());
      return;
    }

    if (message.action === "extractOrgIdVisible") {
      sendResponse({ orgId: extractOrgIdVisible() });
    }
  });
})();
