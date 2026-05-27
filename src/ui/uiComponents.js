(() => {
  window.XM = window.XM || {};
  window.XM.UI = window.XM.UI || {};

  const UI_ASSETS = window.XM.UI.UI_ASSETS || {};

  function safeText(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function safeNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function asset(section, key) {
    return window.XM.UI.getUiAsset?.(section, key) || UI_ASSETS?.[section]?.[key] || "";
  }

  function rarityAssets(rarity = "SR") {
    return window.XM.UI.getRarityAssets?.(rarity) || UI_ASSETS.rarity?.[rarity] || UI_ASSETS.rarity?.SR || {};
  }

  function renderSkinIcon(src, fallback, className = "xm-ui-icon") {
    if (!src) return `<span class="${safeText(className)}">${safeText(fallback)}</span>`;
    return `<span class="${safeText(className)}"><img src="${safeText(src)}" alt="" loading="lazy" onerror="${window.XM.UI.imageOnErrorFallback?.() || "this.hidden=true;this.nextElementSibling.hidden=false;"}"><span hidden>${safeText(fallback)}</span></span>`;
  }

  function renderPanel({ title = "", content = "", footer = "", closable = false, className = "", skin = "common" } = {}) {
    return `
      <section class="xm-ui-panel xm-ui-panel--${safeText(skin)} ${safeText(className)}">
        ${title || closable ? `<header class="xm-ui-panel__header">${title ? `<h3>${safeText(title)}</h3>` : ""}${closable ? '<button type="button" class="xm-ui-panel__close" data-ui-modal-close>x</button>' : ""}</header>` : ""}
        <div class="xm-ui-panel__body">${content}</div>
        ${footer ? `<footer class="xm-ui-panel__footer">${footer}</footer>` : ""}
      </section>
    `;
  }

  function renderButton({ label = "\u6309\u94ae", icon = "", disabled = false, active = false, selected = false, variant = "primary", attrs = "" } = {}) {
    return `<button type="button" class="xm-ui-button xm-ui-button--${safeText(variant)} ${active ? "is-active" : ""} ${selected ? "is-selected" : ""}" ${disabled ? "disabled" : ""} ${attrs}>${icon ? `<span class="xm-ui-button__icon">${safeText(icon)}</span>` : ""}<span>${safeText(label)}</span></button>`;
  }

  function renderTabs({ tabs = [], activeId = "", orientation = "horizontal", attrsFor = () => "" } = {}) {
    return `<nav class="xm-ui-tabs xm-ui-tabs--${safeText(orientation)}">${tabs.map((tab) => renderButton({ label: tab.label, selected: tab.id === activeId, disabled: tab.disabled, variant: orientation === "vertical" ? "tab-vertical" : "tab", attrs: attrsFor(tab) })).join("")}</nav>`;
  }

  function renderRarityFrame({ rarity = "SR", content = "" } = {}) {
    const key = rarityAssets(rarity) ? rarity : "SR";
    const assets = rarityAssets(key);
    return `<span class="xm-ui-rarity-frame xm-ui-rarity-frame--${safeText(String(key).toLowerCase())}" style="--rarity-frame-image: url('${safeText(assets.frame || assets.legacyFrame || "")}'); --rarity-label-image: url('${safeText(assets.label || "")}');">${content}<span class="xm-ui-rarity-frame__label">${safeText(key)}</span></span>`;
  }

  function renderCard({ title = "", subtitle = "", icon = "", image = "", rarity = "", selected = false, disabled = false, attrs = "" } = {}) {
    const content = `
      <span class="xm-ui-card__icon">${image ? renderSkinIcon(image, icon || title.slice(0, 1), "xm-ui-card__image") : safeText(icon || title.slice(0, 1))}</span>
      <strong>${safeText(title)}</strong>
      ${subtitle ? `<small>${safeText(subtitle)}</small>` : ""}
    `;
    return `<button type="button" class="xm-ui-card ${selected ? "is-selected" : ""} ${disabled ? "is-disabled" : ""} ${rarity ? `xm-ui-card--${safeText(String(rarity).toLowerCase())}` : ""}" ${disabled ? "disabled" : ""} ${attrs}>${renderRarityFrame({ rarity, content })}</button>`;
  }

  function renderResourceBar({ currencies = {}, spiritStones = 0, stamina = 0 } = {}) {
    const resources = [
      { id: "spiritStones", name: "\u7075\u77f3", value: safeNumber(currencies.spiritStones ?? spiritStones), icon: asset("icons", "spiritStones"), fallback: "\u77f3" },
      { id: "daoStones", name: "\u9053\u77f3", value: safeNumber(currencies.daoStones), icon: asset("icons", "daoStones"), fallback: "\u9053" },
      { id: "stamina", name: "\u4f53\u529b", value: safeNumber(stamina), icon: asset("icons", "stamina"), fallback: "\u529b" },
    ];
    return `<div class="xm-ui-resource-bar">${resources.map((item) => `<span class="xm-ui-resource xm-ui-resource--${safeText(item.id)}">${renderSkinIcon(item.icon, item.fallback, "xm-ui-resource__icon")}<strong>${safeText(item.name)}</strong><em>${safeText(item.value)}</em></span>`).join("")}</div>`;
  }

  function renderModal({ title = "\u63d0\u793a", content = "", confirmText = "\u786e\u8ba4", cancelText = "", closable = true } = {}) {
    const footer = `${cancelText ? renderButton({ label: cancelText, variant: "secondary", attrs: "data-ui-modal-close" }) : ""}${renderButton({ label: confirmText, attrs: "data-ui-modal-close" })}`;
    return `<div class="xm-ui-modal" role="dialog" aria-modal="true">${renderPanel({ title, content, footer, closable, className: "xm-ui-modal__panel" })}</div>`;
  }

  function renderProgressBar({ current = 0, max = 1, label = "", showPercent = false } = {}) {
    const safeMax = Math.max(1, safeNumber(max, 1));
    const safeCurrent = Math.max(0, Math.min(safeMax, safeNumber(current)));
    const percent = Math.round((safeCurrent / safeMax) * 100);
    return `<div class="xm-ui-progress" role="progressbar" aria-valuenow="${safeText(safeCurrent)}" aria-valuemin="0" aria-valuemax="${safeText(safeMax)}">${label ? `<strong>${safeText(label)}</strong>` : ""}<span class="xm-ui-progress__track"><i style="width: ${percent}%"></i></span>${showPercent ? `<em>${percent}%</em>` : ""}</div>`;
  }

  function openPlaceholderModal(title) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = renderModal({ title, content: "<p>\u529f\u80fd\u5f00\u53d1\u4e2d\u3002</p>" });
    const modal = wrapper.firstElementChild;
    document.body.appendChild(modal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal || event.target.closest("[data-ui-modal-close]")) modal.remove();
    });
    const onKeydown = (event) => {
      if (event.key === "Escape") {
        modal.remove();
        document.removeEventListener("keydown", onKeydown);
      }
    };
    document.addEventListener("keydown", onKeydown);
  }

  Object.assign(window.XM.UI, {
    openPlaceholderModal,
    renderButton,
    renderCard,
    renderModal,
    renderPanel,
    renderProgressBar,
    renderRarityFrame,
    renderResourceBar,
    renderTabs,
  });
})();
