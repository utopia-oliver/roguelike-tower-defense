(() => {
  window.XM = window.XM || {};
  window.XM.UI = window.XM.UI || {};

  const UI_ASSETS = {
    bg: {
      sectHome: "assets/images/ui/bg/sect-home-bg.webp",
    },
    panels: {
      common: "assets/images/ui/panels/panel-common-9slice.webp",
      sub: "assets/images/ui/panels/panel-sub-9slice.webp",
      chip: "assets/images/ui/panels/panel-chip.webp",
    },
    buttons: {
      primary: "assets/images/ui/buttons/btn-primary.webp",
      primaryHover: "assets/images/ui/buttons/btn-primary-hover.webp",
      primaryPressed: "assets/images/ui/buttons/btn-primary-pressed.webp",
      disabled: "assets/images/ui/buttons/btn-disabled.webp",
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
      rewardChest: "assets/images/ui/icons/icon-reward-chest.webp",
      daoSeal: "assets/images/ui/icons/icon-daoyin.webp",
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

  Object.assign(window.XM.UI, {
    UI_ASSETS,
    UI_SKINS: UI_ASSETS,
    getRarityAssets,
    getUiAsset,
    imageOnErrorFallback,
  });
})();
