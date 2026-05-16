window.HubspotContent = window.HubspotContent || {};

window.HubspotContent.ticketExtractor = {
  extractTicketId() {
    return location.href.match(/\/ticket\/(\d+)/)?.[1] || "";
  },

  extractTicketUrl() {
    return location.href;
  },

  extractEmail() {
    const { EMAIL_REGEX, domUtils } = window.HubspotContent;
    const relevantRoots = [
      document.querySelector('[data-test-id="AgentThreadHistory"]'),
      document.querySelector('[data-test-id="inbox-thread-loaded"]'),
      document.querySelector('[data-selenium-test="chicklet"]'),
      document.body,
    ].filter(Boolean);

    for (const root of relevantRoots) {
      const links = Array.from(root.querySelectorAll('a[href^="mailto:"]')).filter(
        domUtils.isVisible
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
  },

  extractChannel() {
    if (location.hash.toLowerCase().includes("whatsapp")) return "WhatsApp";
    if ((document.body?.innerText || "").toLowerCase().includes("whatsapp")) {
      return "WhatsApp";
    }
    return "";
  },

  extractUserName() {
    const { USER_NAME_SELECTORS, domUtils } = window.HubspotContent;
    const text = domUtils.queryVisibleTextDeep(USER_NAME_SELECTORS);
    if (text) return text.replace(/^Talvez:\s*/i, "").trim();
    return "";
  },

  extractCompanyName() {
    const { COMPANY_NAME_SELECTORS, domUtils } = window.HubspotContent;
    const text = domUtils.queryVisibleTextDeep(COMPANY_NAME_SELECTORS);
    if (text) return text.trim();
    return "";
  },

  extractTicketData() {
    return {
      ticketId: this.extractTicketId(),
      ticketUrl: this.extractTicketUrl(),
      empresa: this.extractCompanyName(),
      usuario: this.extractUserName(),
      email: this.extractEmail(),
      canal: this.extractChannel(),
    };
  },
};

