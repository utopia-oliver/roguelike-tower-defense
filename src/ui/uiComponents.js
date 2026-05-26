(() => {
  window.XM = window.XM || {};
  window.XM.UI = window.XM.UI || {};

  const UI_SKINS = {
    bg: {
      sectHome: "assets/images/ui/bg/sect-home-bg.webp",
    },
    panels: {
      common: "assets/images/ui/panels/panel-common-9slice.webp",
    },
    buttons: {
      primary: "assets/images/ui/buttons/btn-primary.webp",
      primaryPressed: "assets/images/ui/buttons/btn-primary-pressed.webp",
      disabled: "assets/images/ui/buttons/btn-disabled.webp",
    },
    icons: {
      spiritStones: "assets/images/ui/icons/icon-lingshi.webp",
      daoStones: "assets/images/ui/icons/icon-daoshi.webp",
    },
    rarity: {
      SR: {
        frame: "assets/images/ui/rarity/frame_sr.webp",
        label: "assets/images/ui/rarity/label_sr.webp",
      },
      SSR: {
        frame: "assets/images/ui/rarity/frame_ssr.webp",
        label: "assets/images/ui/rarity/label_ssr.webp",
      },
      UR: {
        frame: "assets/images/ui/rarity/frame_ur.webp",
        label: "assets/images/ui/rarity/label_ur.webp",
      },
    },
  };

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

  function renderSkinIcon(src, fallback, className = "xm-ui-icon") {
    return `<span class="${safeText(className)}"><img src="${safeText(src)}" alt="" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false;"><span hidden>${safeText(fallback)}</span></span>`;
  }

  function renderPanel({ title = "", content = "", footer = "", closable = false, className = "" } = {}) {
    return `
      <section class="xm-ui-panel ${safeText(className)}">
        ${title || closable ? `<header class="xm-ui-panel__header">${title ? `<h3>${safeText(title)}</h3>` : ""}${closable ? '<button type="button" class="xm-ui-panel__close" data-ui-modal-close>×</button>' : ""}</header>` : ""}
        <div class="xm-ui-panel__body">${content}</div>
        ${footer ? `<footer class="xm-ui-panel__footer">${footer}</footer>` : ""}
      </section>
    `;
  }

  function renderButton({ label = "按钮", icon = "", disabled = false, active = false, selected = false, variant = "primary", attrs = "" } = {}) {
    return `<button type="button" class="xm-ui-button xm-ui-button--${safeText(variant)} ${active ? "is-active" : ""} ${selected ? "is-selected" : ""}" ${disabled ? "disabled" : ""} ${attrs}>${icon ? `<span class="xm-ui-button__icon">${safeText(icon)}</span>` : ""}<span>${safeText(label)}</span></button>`;
  }

  function renderTabs({ tabs = [], activeId = "", attrsFor = () => "" } = {}) {
    return `<nav class="xm-ui-tabs">${tabs.map((tab) => renderButton({ label: tab.label, selected: tab.id === activeId, disabled: tab.disabled, variant: "tab", attrs: attrsFor(tab) })).join("")}</nav>`;
  }

  function renderCard({ title = "", subtitle = "", icon = "", image = "", rarity = "", selected = false, disabled = false, attrs = "" } = {}) {
    const content = `
      <span class="xm-ui-card__icon">${image ? renderSkinIcon(image, icon || title.slice(0, 1), "xm-ui-card__image") : safeText(icon || title.slice(0, 1))}</span>
      <strong>${safeText(title)}</strong>
      ${subtitle ? `<small>${safeText(subtitle)}</small>` : ""}
    `;
    return `<button type="button" class="xm-ui-card ${selected ? "is-selected" : ""} ${disabled ? "is-disabled" : ""} ${rarity ? `xm-ui-card--${safeText(rarity.toLowerCase())}` : ""}" ${disabled ? "disabled" : ""} ${attrs}>${renderRarityFrame({ rarity, content })}</button>`;
  }

  function renderResourceBar({ currencies = {}, spiritStones = 0, stamina = 0 } = {}) {
    const resources = [
      { id: "spiritStones", name: "灵石", value: safeNumber(currencies.spiritStones ?? spiritStones), icon: UI_SKINS.icons.spiritStones, fallback: "石" },
      { id: "daoStones", name: "道石", value: safeNumber(currencies.daoStones), icon: UI_SKINS.icons.daoStones, fallback: "道" },
      { id: "stamina", name: "体力", value: safeNumber(stamina), icon: "", fallback: "力" },
    ];
    return `<div class="xm-ui-resource-bar">${resources.map((item) => `<span class="xm-ui-resource xm-ui-resource--${safeText(item.id)}">${item.icon ? renderSkinIcon(item.icon, item.fallback, "xm-ui-resource__icon") : `<span class="xm-ui-resource__icon">${safeText(item.fallback)}</span>`}<strong>${safeText(item.name)}</strong><em>${safeText(item.value)}</em></span>`).join("")}</div>`;
  }

  function renderModal({ title = "提示", content = "", confirmText = "确认", cancelText = "", closable = true } = {}) {
    const footer = `${cancelText ? renderButton({ label: cancelText, variant: "secondary", attrs: "data-ui-modal-close" }) : ""}${renderButton({ label: confirmText, attrs: "data-ui-modal-close" })}`;
    return `<div class="xm-ui-modal" role="dialog" aria-modal="true">${renderPanel({ title, content, footer, closable, className: "xm-ui-modal__panel" })}</div>`;
  }

  function renderRarityFrame({ rarity = "SR", content = "" } = {}) {
    const key = UI_SKINS.rarity[rarity] ? rarity : "SR";
    const assets = UI_SKINS.rarity[key];
    return `<span class="xm-ui-rarity-frame xm-ui-rarity-frame--${safeText(key.toLowerCase())}" style="--rarity-frame-image: url('${safeText(assets.frame)}'); --rarity-label-image: url('${safeText(assets.label)}');">${content}<span class="xm-ui-rarity-frame__label">${safeText(key)}</span></span>`;
  }

  function renderProgressBar({ current = 0, max = 1, label = "", showPercent = false } = {}) {
    const safeMax = Math.max(1, safeNumber(max, 1));
    const safeCurrent = Math.max(0, Math.min(safeMax, safeNumber(current)));
    const percent = Math.round((safeCurrent / safeMax) * 100);
    return `<div class="xm-ui-progress" role="progressbar" aria-valuenow="${safeText(safeCurrent)}" aria-valuemin="0" aria-valuemax="${safeText(safeMax)}">${label ? `<strong>${safeText(label)}</strong>` : ""}<span class="xm-ui-progress__track"><i style="width: ${percent}%"></i></span>${showPercent ? `<em>${percent}%</em>` : ""}</div>`;
  }

  function openPlaceholderModal(title) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = renderModal({ title, content: "<p>功能开发中。</p>" });
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
    UI_SKINS,
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
