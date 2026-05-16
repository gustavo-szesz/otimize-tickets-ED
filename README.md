# Extensão interna HubSpot Help Desk (Manifest V3)

Extensão Chrome interna para suporte técnico que lê apenas dados **visíveis** no HubSpot Help Desk, permite revisão manual e copia uma observação padronizada para colagem manual no ticket.

## 1) Instalação em modo desenvolvedor

1. Abra `chrome://extensions`.
2. Ative **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação**.
4. Selecione a pasta desta extensão.

## 2) Como usar

1. Abra um ticket no HubSpot Help Desk (`https://app.hubspot.com/help-desk/*`).
2. Clique no ícone da extensão.
3. Clique em **Capturar dados do ticket**.
4. Abra manualmente o olho/detalhes da empresa no HubSpot (onde aparece o ID EngagED 2.0).
5. Clique em **Capturar org-id visível**.
6. Revise e edite os campos no popup, se necessário.
7. Clique em **Copiar observação**.
8. Cole manualmente no campo **Observação** do HubSpot.

## 3) Limitações

- A extensão lê somente dados visíveis no DOM da página atual.
- Se o org-id não estiver visível, ele não será capturado.
- Alguns seletores do HubSpot podem mudar com atualizações da interface.
- A extensão não envia nem cria observação automaticamente no HubSpot.

## 4) Segurança

- Não há backend.
- Não há uso de API do HubSpot.
- Não há armazenamento de histórico.
- Não há analytics.
- Não há automação de cliques.
- Os dados não saem do navegador.

## Arquivos

- `manifest.json`
- `popup.html`
- `popup.js`
- `content.js`
- `styles.css`
- `README.md`
