(() => {
  window.XM = window.XM || {};

  const { DEBUG_STORAGE_KEY, DEBUG_OVERRIDES_KEY } = window.XM.Constants;

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value ?? null));
  }

  function createEmptyDebugOverrides() {
    return {
      characters: {},
      martialArts: {},
      upgrades: {},
      perks: {},
      enemies: {},
      waves: {},
      artifacts: {},
      formations: {},
    };
  }

  function normalizeDebugOverrides(value) {
    return { ...createEmptyDebugOverrides(), ...(value || {}) };
  }

  function loadDebugOverrides() {
    try {
      return normalizeDebugOverrides(JSON.parse(localStorage.getItem(DEBUG_OVERRIDES_KEY) || "{}"));
    } catch {
      return createEmptyDebugOverrides();
    }
  }

  function saveDebugData(debugOverrides, debugExportData) {
    localStorage.setItem(DEBUG_OVERRIDES_KEY, JSON.stringify(debugOverrides));
    localStorage.setItem(DEBUG_STORAGE_KEY, JSON.stringify(debugExportData));
  }

  function resetDebugData() {
    localStorage.removeItem(DEBUG_OVERRIDES_KEY);
    localStorage.removeItem(DEBUG_STORAGE_KEY);
  }

  function mergeObject(base, override) {
    if (!override || typeof override !== "object") return base;
    Object.entries(override).forEach(([key, value]) => {
      if (value && typeof value === "object" && !Array.isArray(value) && base[key] && typeof base[key] === "object" && !Array.isArray(base[key])) {
        mergeObject(base[key], value);
      } else {
        base[key] = value;
      }
    });
    return base;
  }

  window.XM.Storage = window.XM.Storage || {};
  Object.assign(window.XM.Storage, {
    createEmptyDebugOverrides,
    deepClone,
    loadDebugOverrides,
    mergeObject,
    normalizeDebugOverrides,
    resetDebugData,
    saveDebugData,
  });
})();
