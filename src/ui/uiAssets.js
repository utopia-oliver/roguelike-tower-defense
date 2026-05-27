(() => {
  window.XM = window.XM || {};
  window.XM.UI = window.XM.UI || {};

  const UI_ASSETS = {
    bg: {
      login: "assets/images/ui/bg/login-bg.webp",
      sectHome: "assets/images/ui/bg/sect-home-bg.webp",
      secondaryPage: "assets/images/ui/bg/secondary-page-bg.webp",
      dongfu: "assets/images/ui/bg/dongfu-bg.webp",
      artifact: "assets/images/ui/bg/artifact-bg.webp",
      formation: "assets/images/ui/bg/formation-bg.webp",
      summon: "assets/images/ui/bg/summon-bg.webp",
      shop: "assets/images/ui/bg/shop-bg.webp",
      archive: "assets/images/ui/bg/archive-bg.webp",
      adventure: "assets/images/ui/bg/adventure-bg.webp",
    },
    panels: {
      common: "assets/images/ui/panels/panel-common-9slice.webp",
      sub: "assets/images/ui/panels/panel-sub-9slice.webp",
      chip: "assets/images/ui/panels/panel-chip.webp",
      darkModal: "assets/images/ui/panels/panel-dark-modal.webp",
      loginMain: "assets/images/ui/panels/panel-login-main.webp",
      loginModal: "assets/images/ui/panels/panel-login-modal.webp",
      serverSelect: "assets/images/ui/panels/panel-server-select.webp",
      resourcePill: "assets/images/ui/panels/resource-pill.webp",
      chapterChip: "assets/images/ui/panels/chapter-chip.webp",
    },
    buttons: {
      primary: "assets/images/ui/buttons/btn-primary.webp",
      primaryHover: "assets/images/ui/buttons/btn-primary-hover.webp",
      primaryPressed: "assets/images/ui/buttons/btn-primary-pressed.webp",
      disabled: "assets/images/ui/buttons/btn-disabled.webp",
      loginEnter: "assets/images/ui/buttons/btn-login-enter.webp",
      loginSecondary: "assets/images/ui/buttons/btn-login-secondary.webp",
    },
    tabs: {
      nav: "assets/images/ui/tabs/tab-nav.webp",
      navActive: "assets/images/ui/tabs/tab-nav-active.webp",
      vertical: "assets/images/ui/tabs/tab-vertical.webp",
      verticalActive: "assets/images/ui/tabs/tab-vertical-active.webp",
    },
    icons: {
      spiritStones: "assets/images/ui/icons/icon-lingshi.webp",
      daoStones: "assets/images/ui/icons/icon-daoshi.webp",
      stamina: "assets/images/ui/icons/icon-stamina.webp",
      daoSeal: "assets/images/ui/icons/icon-daoyin.webp",
      rewardChest: "assets/images/ui/icons/icon-reward-chest.webp",
      settings: "assets/images/ui/icons/icon-settings.webp",
      checkboxUnchecked: "assets/images/ui/icons/icon-checkbox-unchecked.webp",
      checkboxChecked: "assets/images/ui/icons/icon-checkbox-checked.webp",
    },
    rarity: {
      SR: {
        frame: "assets/images/ui/rarity/rarity-frame-sr.webp",
        legacyFrame: "assets/images/ui/rarity/frame_sr.webp",
        label: "assets/images/ui/rarity/label_sr.webp",
      },
      SSR: {
        frame: "assets/images/ui/rarity/rarity-frame-ssr.webp",
        legacyFrame: "assets/images/ui/rarity/frame_ssr.webp",
        label: "assets/images/ui/rarity/label_ssr.webp",
      },
      UR: {
        frame: "assets/images/ui/rarity/rarity-frame-ur.webp",
        legacyFrame: "assets/images/ui/rarity/frame_ur.webp",
        label: "assets/images/ui/rarity/label_ur.webp",
      },
    },
    ornaments: {
      corner: "assets/images/ui/ornaments/ornament-corner.webp",
      divider: "assets/images/ui/ornaments/ornament-divider.webp",
      titlebar: "assets/images/ui/ornaments/ornament-titlebar.webp",
      loginTitleBase: "assets/images/ui/ornaments/login-title-base.webp",
      loginFooterInfo: "assets/images/ui/ornaments/login-footer-info.webp",
      loginSideGlow: "assets/images/ui/ornaments/login-side-glow.webp",
    },
  };

  function getUiAsset(section, key) {
    return UI_ASSETS?.[section]?.[key] || null;
  }

  function getRarityAssets(rarity = "SR") {
    return UI_ASSETS.rarity[rarity] || UI_ASSETS.rarity.SR;
  }

  function imageOnErrorFallback() {
    return "this.hidden=true;this.nextElementSibling.hidden=false;";
  }

  function collectAssetPaths(value, prefix = "", result = []) {
    if (!value) return result;
    if (typeof value === "string") {
      result.push({ key: prefix, path: value });
      return result;
    }
    Object.entries(value).forEach(([key, child]) => {
      collectAssetPaths(child, prefix ? `${prefix}.${key}` : key, result);
    });
    return result;
  }

  function listUiAssetPaths() {
    return collectAssetPaths(UI_ASSETS);
  }

  function checkUiAssets() {
    const paths = listUiAssetPaths();
    if (typeof Image === "undefined") {
      console.warn("[UI_ASSETS] Image probe is only available in browser runtime.", paths);
      return Promise.resolve({ checked: [], missing: [], skipped: paths });
    }

    const checks = paths.map(({ key, path }) => new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve({ key, path, exists: true });
      image.onerror = () => resolve({ key, path, exists: false });
      image.src = path;
    }));

    return Promise.all(checks).then((checked) => {
      const missing = checked.filter((item) => !item.exists);
      if (missing.length) {
        console.warn("[UI_ASSETS] Missing optional UI art assets:", missing);
      }
      return { checked, missing };
    });
  }

  Object.assign(window.XM.UI, {
    UI_ASSETS,
    UI_SKINS: UI_ASSETS,
    checkUiAssets,
    getRarityAssets,
    getUiAsset,
    imageOnErrorFallback,
    listUiAssetPaths,
  });
})();
