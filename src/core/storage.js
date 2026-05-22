(() => {
  window.XM = window.XM || {};

  const { PLAYER_PROFILE_STORAGE_KEY, DEBUG_STORAGE_KEY, DEBUG_OVERRIDES_KEY } = window.XM.Constants;

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value ?? null));
  }

  function playerProfileHelpers(helpers = {}) {
    const initialRoles = Array.isArray(helpers.initialRoles) && helpers.initialRoles.length ? helpers.initialRoles : ["lu_qingya"];
    const initialArtifacts = Array.isArray(helpers.initialArtifacts) && helpers.initialArtifacts.length
      ? helpers.initialArtifacts
      : helpers.initialArtifact
        ? [helpers.initialArtifact]
        : [];
    return {
      initialRoles,
      initialArtifact: helpers.initialArtifact || "",
      initialArtifacts,
      initialFormation: helpers.initialFormation || "",
      initialFormations: Array.isArray(helpers.initialFormations) ? helpers.initialFormations : [],
      roles: helpers.roles || null,
      artifacts: helpers.artifacts || null,
      formations: helpers.formations || null,
      getMaxDeploySlots: helpers.getMaxDeploySlots,
      getMaxArtifactSlots: helpers.getMaxArtifactSlots,
      chapters: helpers.chapters || null,
    };
  }

  function compactIdList(ids, collection) {
    const idAliases = {
      zhenyao_bell: "zhenmo_bell",
    };
    return [...new Set((Array.isArray(ids) ? ids : []).map((id) => idAliases[id] || id).filter((id) => !collection || collection[id]))];
  }

  function normalizeLevelMap(value, validIds, fallbackLevels = {}) {
    const result = {};
    if (value && typeof value === "object") {
      Object.entries(value).forEach(([id, level]) => {
        if (!validIds.includes(id)) return;
        result[id] = Math.max(1, Math.floor(Number(level) || 1));
      });
    }
    Object.entries(fallbackLevels).forEach(([id, level]) => {
      if (validIds.includes(id) && !result[id]) result[id] = Math.max(1, Math.floor(Number(level) || 1));
    });
    return result;
  }

  function createDefaultPlayerProfile(helpers = {}) {
    const profileHelpers = playerProfileHelpers(helpers);
    const ownedArtifacts = [...profileHelpers.initialArtifacts];
    const unlockedFormations = profileHelpers.initialFormations?.length
      ? [...profileHelpers.initialFormations]
      : profileHelpers.initialFormation
        ? [profileHelpers.initialFormation]
        : [];
    return {
      playerLevel: 1,
      playerExp: 0,
      spiritStones: 0,
      highestWave: 0,
      totalKills: 0,
      ownedCharacters: [...profileHelpers.initialRoles],
      characterLevels: Object.fromEntries(profileHelpers.initialRoles.map((id) => [id, 1])),
      ownedArtifacts,
      artifactLevels: {},
      unlockedFormations,
      formationLevels: {},
      maxDeploySlots: 1,
      maxArtifactSlots: 1,
      arrayCoreLevel: 1,
      arrayCoreBaseHpBonus: 0,
      arrayCoreDefenseBonus: 0,
      chapterProgress: createDefaultChapterProgress(profileHelpers.chapters),
      chapterStars: {},
      chapterStarChests: {},
      materials: {},
    };
  }

  function createDefaultChapterProgress(chapters) {
    const chapterIds = Object.keys(chapters || {});
    if (!chapterIds.length) {
      return {
        chapter_1: {
          unlockedNodeIds: ["chapter1_1"],
          clearedNodeIds: [],
          currentNodeId: "chapter1_1",
          lastClearedNodeId: null,
          storyFlags: {},
        },
      };
    }
    return Object.fromEntries(
      chapterIds.map((chapterId) => {
        const firstNodeId = chapters[chapterId]?.nodes?.[0]?.nodeId || "";
        return [
          chapterId,
          {
            unlockedNodeIds: firstNodeId ? [firstNodeId] : [],
            clearedNodeIds: [],
            currentNodeId: firstNodeId,
            lastClearedNodeId: null,
            storyFlags: {},
          },
        ];
      }),
    );
  }

  function normalizeChapterProgress(value, chapters) {
    const defaults = createDefaultChapterProgress(chapters);
    const source = value && typeof value === "object" ? value : {};
    return Object.fromEntries(
      Object.entries(defaults).map(([chapterId, chapterDefaults]) => {
        const chapter = chapters?.[chapterId] || {};
        const validNodeIds = (chapter.nodes || []).map((node) => node.nodeId);
        const raw = source[chapterId] && typeof source[chapterId] === "object" ? source[chapterId] : {};
        const unlocked = compactIdList(raw.unlockedNodeIds || chapterDefaults.unlockedNodeIds, null).filter((id) => !validNodeIds.length || validNodeIds.includes(id));
        const cleared = compactIdList(raw.clearedNodeIds || [], null).filter((id) => !validNodeIds.length || validNodeIds.includes(id));
        chapterDefaults.unlockedNodeIds.forEach((id) => {
          if (id && !unlocked.includes(id)) unlocked.unshift(id);
        });
        const currentNodeId = validNodeIds.includes(raw.currentNodeId)
          ? raw.currentNodeId
          : unlocked.find((id) => !cleared.includes(id)) || unlocked[unlocked.length - 1] || chapterDefaults.currentNodeId;
        const lastClearedNodeId = validNodeIds.includes(raw.lastClearedNodeId) ? raw.lastClearedNodeId : null;
        return [
          chapterId,
          {
            unlockedNodeIds: unlocked,
            clearedNodeIds: cleared,
            currentNodeId,
            lastClearedNodeId,
            storyFlags: raw.storyFlags && typeof raw.storyFlags === "object" ? { ...raw.storyFlags } : {},
          },
        ];
      }),
    );
  }

  function normalizePlayerProfile(raw, helpers = {}) {
    const profileHelpers = playerProfileHelpers(helpers);
    const defaults = createDefaultPlayerProfile(profileHelpers);
    const profile = {
      ...defaults,
      ...(raw || {}),
    };
    const firstCharacterId = profileHelpers.initialRoles[0] || "lu_qingya";

    profile.playerLevel = Math.max(1, Math.floor(Number(profile.playerLevel) || 1));
    profile.playerExp = Math.max(0, Math.floor(Number(profile.playerExp) || 0));
    profile.spiritStones = Math.max(0, Math.floor(Number(profile.spiritStones) || 0));
    profile.highestWave = Math.max(0, Math.floor(Number(profile.highestWave) || 0));
    profile.totalKills = Math.max(0, Math.floor(Number(profile.totalKills) || 0));

    profile.ownedCharacters = compactIdList(profile.ownedCharacters, profileHelpers.roles);
    if (!profile.ownedCharacters.includes(firstCharacterId)) {
      profile.ownedCharacters.unshift(firstCharacterId);
    }
    profile.characterLevels = normalizeLevelMap(profile.characterLevels, profile.ownedCharacters, defaults.characterLevels);
    profile.ownedCharacters.forEach((id) => {
      if (!profile.characterLevels[id]) profile.characterLevels[id] = 1;
    });

    profile.ownedArtifacts = compactIdList(profile.ownedArtifacts, profileHelpers.artifacts);
    defaults.ownedArtifacts.forEach((id) => {
      if (!profile.ownedArtifacts.includes(id)) profile.ownedArtifacts.unshift(id);
    });
    profile.artifactLevels = normalizeLevelMap(profile.artifactLevels, profile.ownedArtifacts);

    profile.unlockedFormations = compactIdList(profile.unlockedFormations, profileHelpers.formations);
    defaults.unlockedFormations.forEach((id) => {
      if (!profile.unlockedFormations.includes(id)) profile.unlockedFormations.unshift(id);
    });
    profile.formationLevels = normalizeLevelMap(profile.formationLevels, profile.unlockedFormations);

    profile.maxDeploySlots =
      typeof profileHelpers.getMaxDeploySlots === "function"
        ? profileHelpers.getMaxDeploySlots(profile.playerLevel)
        : Math.max(1, Number(profile.maxDeploySlots) || 1);
    profile.maxArtifactSlots =
      typeof profileHelpers.getMaxArtifactSlots === "function"
        ? profileHelpers.getMaxArtifactSlots(profile.playerLevel)
        : Math.max(1, Number(profile.maxArtifactSlots) || 1);
    profile.arrayCoreLevel = Math.max(1, Math.floor(Number(profile.arrayCoreLevel) || defaults.arrayCoreLevel));
    profile.arrayCoreBaseHpBonus = Math.max(0, Math.floor(Number(profile.arrayCoreBaseHpBonus) || defaults.arrayCoreBaseHpBonus));
    profile.arrayCoreDefenseBonus = Math.max(0, Math.floor(Number(profile.arrayCoreDefenseBonus) || defaults.arrayCoreDefenseBonus));
    profile.chapterProgress = normalizeChapterProgress(profile.chapterProgress, profileHelpers.chapters);
    profile.chapterStars = profile.chapterStars && typeof profile.chapterStars === "object" ? profile.chapterStars : {};
    profile.chapterStarChests = profile.chapterStarChests && typeof profile.chapterStarChests === "object" ? profile.chapterStarChests : {};
    profile.materials = profile.materials && typeof profile.materials === "object" ? profile.materials : {};

    return {
      playerLevel: profile.playerLevel,
      playerExp: profile.playerExp,
      spiritStones: profile.spiritStones,
      highestWave: profile.highestWave,
      totalKills: profile.totalKills,
      ownedCharacters: profile.ownedCharacters,
      characterLevels: profile.characterLevels,
      ownedArtifacts: profile.ownedArtifacts,
      artifactLevels: profile.artifactLevels,
      unlockedFormations: profile.unlockedFormations,
      formationLevels: profile.formationLevels,
      maxDeploySlots: profile.maxDeploySlots,
      maxArtifactSlots: profile.maxArtifactSlots,
      arrayCoreLevel: profile.arrayCoreLevel,
      arrayCoreBaseHpBonus: profile.arrayCoreBaseHpBonus,
      arrayCoreDefenseBonus: profile.arrayCoreDefenseBonus,
      chapterProgress: profile.chapterProgress,
      chapterStars: profile.chapterStars,
      chapterStarChests: profile.chapterStarChests,
      materials: profile.materials,
    };
  }

  function loadPlayerProfile(helpers = {}) {
    try {
      const text = localStorage.getItem(PLAYER_PROFILE_STORAGE_KEY);
      if (!text) {
        return {
          profile: createDefaultPlayerProfile(helpers),
          loadedFromStorage: false,
        };
      }
      return {
        profile: normalizePlayerProfile(JSON.parse(text), helpers),
        loadedFromStorage: true,
      };
    } catch (error) {
      console.warn("[PlayerProfile] Failed to load profile, fallback to default.", error);
      return {
        profile: createDefaultPlayerProfile(helpers),
        loadedFromStorage: false,
      };
    }
  }

  function savePlayerProfile(profile, helpers = {}) {
    try {
      const profileToSave = normalizePlayerProfile(profile, helpers);
      localStorage.setItem(PLAYER_PROFILE_STORAGE_KEY, JSON.stringify(profileToSave));
      return {
        profile: profileToSave,
        saved: true,
      };
    } catch (error) {
      console.warn("[PlayerProfile] Failed to save profile.", error);
      return {
        profile,
        saved: false,
      };
    }
  }

  function resetPlayerProfile() {
    localStorage.removeItem(PLAYER_PROFILE_STORAGE_KEY);
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
    createDefaultPlayerProfile,
    createEmptyDebugOverrides,
    deepClone,
    loadDebugOverrides,
    loadPlayerProfile,
    mergeObject,
    normalizeDebugOverrides,
    normalizePlayerProfile,
    resetDebugData,
    resetPlayerProfile,
    saveDebugData,
    savePlayerProfile,
  });
})();
