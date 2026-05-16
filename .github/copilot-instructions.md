# Copilot Instructions

## Build, test, and lint commands

There are currently no build, test, or lint scripts configured in this repository (no `package.json`, Makefile, or test runner config).

Manual run path for this project:
1. Open `chrome://extensions`
2. Enable Developer Mode
3. Click **Load unpacked**
4. Select this repository folder

Single-test command is not available yet because there is no automated test suite.

## High-level architecture

This is a Chrome Extension (Manifest V3) focused on **manual assistive workflow** for HubSpot Help Desk tickets.

- `manifest.json` wires the extension popup (`popup.html`) and injects the content stack on `https://app.hubspot.com/help-desk/*`.
- Popup is layered into `popup/`:
  - UI + DOM helpers (`dom.js`)
  - App flows/use-cases (`use-cases.js`)
  - Infra adapters (`storage.js`, `messaging.js`)
  - Domain/template (`observation.js`, `constants.js`)
  - Bootstrap (`main.js`, `popup.js`)
- Content extraction is layered into `content/`:
  - DOM utility primitives (`dom-utils.js`)
  - Ticket extraction (`ticket-extractor.js`)
  - org-id extraction heuristics (`orgid-extractor.js`)
  - Message routing (`message-handler.js`)
  - Bootstrap (`content.js`)
- Data flow is one-way for extraction: popup -> content script message -> extracted values -> popup fields/storage -> clipboard output for manual paste in HubSpot.

## Key conventions

- Scope is intentionally passive and local-only: read visible DOM data and assist manual copy/paste; do not automate HubSpot writes/clicks and do not call HubSpot APIs.
- Keep selectors/heuristics resilient to HubSpot UI changes: prefer multi-selector fallback strategies and visibility checks over single brittle selectors.
- `orgId` extraction is conservative by design: prioritize "ID EngagED 2.0" context and avoid false positives (e.g., avoid matching "ID EngagED 1.0" only contexts).
- Preserve Portuguese UX text and field semantics (`empresa`, `usuario`, `motivo`, `proximoPasso`, etc.) because the popup labels and generated observation template are domain-specific and user-facing.
- Persist form values under `chrome.storage.local` key `hubspotHelpDeskFormData` so popup state survives reopen/reload during ticket handling.
