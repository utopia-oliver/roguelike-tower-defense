(() => {
  window.XM = window.XM || {};
  window.XM.Render = window.XM.Render || {};

  function safeText(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderLobby({ elements, DATA, playerProfile, helpers }) {
    helpers.syncPlayerMetaAliases();
    elements.metaLevel.textContent = `${playerProfile.playerLevel}级 · ${playerProfile.playerExp}/${helpers.getPlayerLevelExpRequirement(playerProfile.playerLevel)}`;
    elements.metaLingstone.textContent = playerProfile.spiritStones;
    elements.ownedRolesList.innerHTML = "";

    Object.values(DATA.roles).forEach((role) => {
      const owned = playerProfile.ownedCharacters.includes(role.id);
      const level = helpers.getCharacterLevel(role.id);
      const damage = Math.round(helpers.getCharacterBaseFinalDamage(role) * 10) / 10;
      const item = document.createElement("div");
      item.className = `character-card ${owned ? "owned" : "locked"}`;
      const source = role.unlockType === "gacha" ? "抽卡获得" : `${role.unlockLevel}级解锁`;
      item.innerHTML = `
        <strong>${safeText(role.name)} <small>${safeText(role.rarity)}</small></strong>
        <span>${safeText(role.rankTitle || role.rank)} · ${safeText(role.school)} · ${safeText(role.role)}</span>
        <span>等级 ${owned ? level : "-"} · 伤害 ${owned ? damage : role.baseDamage} · ${safeText(role.trajectoryType)}</span>
        <span>${owned ? "已拥有" : safeText(source)}</span>
        <p>${safeText(owned ? role.designValue : role.description)}</p>
      `;
      if (owned) {
        const button = document.createElement("button");
        button.className = "secondary";
        button.type = "button";
        button.dataset.roleUpgradeId = role.id;
        button.textContent = `升级 ${helpers.getCharacterUpgradeCost(level, role.rarity)}灵石`;
        item.appendChild(button);
      }
      elements.ownedRolesList.appendChild(item);
    });

    const nextCharacter = helpers.getNextCharacterUnlock();
    const nextSlot = helpers.getNextDeploySlotUnlock();
    const tips = [];
    if (nextCharacter) tips.push(`${nextCharacter.level}级解锁：${DATA.roles[nextCharacter.characterId].name}`);
    if (nextSlot) tips.push(`${nextSlot.level}级解锁第${nextSlot.deploySlots}个上阵位`);
    if (tips.length) {
      const tip = document.createElement("span");
      tip.className = "unlock-tip";
      tip.textContent = tips.join(" · ");
      elements.ownedRolesList.prepend(tip);
    }

    elements.ownedArtifactsList.innerHTML = playerProfile.ownedArtifacts
      .map((id) => `<span>${safeText(DATA.artifacts[id]?.name || id)}</span>`)
      .join("");
    elements.unlockedFormationsList.innerHTML = playerProfile.unlockedFormations
      .map((id) => `<span>${safeText(DATA.formations[id]?.name || id)}</span>`)
      .join("");
  }

  function renderLoadout({ elements, state, playerProfile, DATA, helpers }) {
    elements.loadoutFormationList.innerHTML = "";
    playerProfile.unlockedFormations.forEach((id) => {
      const formation = DATA.formations[id];
      if (!formation) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice";
      button.classList.toggle("selected", state.loadoutFormationId === id);
      button.dataset.loadoutFormationId = id;
      button.innerHTML = `<strong>${safeText(formation.name)}</strong><span>被动 · ${formation.triggerRadius}格 · ${formation.cooldown}秒</span>`;
      elements.loadoutFormationList.appendChild(button);
    });

    elements.loadoutRoleList.innerHTML = "";
    playerProfile.ownedCharacters.forEach((id) => {
      const role = DATA.roles[id];
      if (!role) return;
      const selected = state.loadoutRoleIds.includes(id);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice";
      button.classList.toggle("selected", selected);
      button.dataset.loadoutRoleId = id;
      button.innerHTML = `<strong>${safeText(role.name)}</strong><span>${safeText(role.rarity)} · ${safeText(role.rankTitle || role.rank)} · Lv${helpers.getCharacterLevel(id)} · ${safeText(role.trajectoryType)}</span>`;
      elements.loadoutRoleList.appendChild(button);
    });

    const artifactSlots = Math.max(1, playerProfile.maxArtifactSlots || 1);
    const selectedArtifactIds = Array.isArray(state.loadoutArtifactIds)
      ? state.loadoutArtifactIds
      : state.loadoutArtifactId
        ? [state.loadoutArtifactId]
        : [];
    const activeBonds = helpers.getActiveArtifactBonds
      ? helpers.getActiveArtifactBonds(selectedArtifactIds)
      : [];
    elements.loadoutArtifactList.innerHTML = "";
    const artifactSummary = document.createElement("div");
    artifactSummary.className = "unlock-tip";
    artifactSummary.innerHTML = `
      <strong>法宝位：已选择 ${selectedArtifactIds.length} / ${artifactSlots}</strong>
      <span>当前已选择：${selectedArtifactIds.length ? selectedArtifactIds.map((id) => safeText(DATA.artifacts[id]?.name || id)).join("、") : "无"}</span>
      <span>${activeBonds.length ? `已激活羁绊：${activeBonds.map((bond) => safeText(bond.name)).join("、")}` : "当前未激活法宝羁绊"}</span>
    `;
    elements.loadoutArtifactList.appendChild(artifactSummary);
    playerProfile.ownedArtifacts.forEach((id) => {
      const artifact = DATA.artifacts[id];
      if (!artifact) return;
      const selected = selectedArtifactIds.includes(id);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice";
      button.classList.toggle("selected", selected);
      button.dataset.loadoutArtifactId = id;
      button.innerHTML = `
        <strong>${safeText(artifact.name)}${selected ? " · 已选择" : ""}</strong>
        <span>${safeText(artifact.role || "法宝")} · ${safeText(artifact.attackText || artifact.description || "")}</span>
        <span>基础：${artifact.damage}伤害 · ${artifact.cooldown}秒${artifact.areaRadius ? ` · ${artifact.areaRadius}范围` : ""}</span>
      `;
      elements.loadoutArtifactList.appendChild(button);
    });

    const roleText = `${state.loadoutRoleIds.length}/${playerProfile.maxDeploySlots}`;
    const artifactText = `${selectedArtifactIds.length}/${artifactSlots}`;
    const nextSlot = helpers.getNextDeploySlotUnlock();
    elements.loadoutStatus.textContent = helpers.loadoutReady()
      ? `配置完成：1个阵法，${roleText} 名角色，法宝 ${artifactText}。`
      : `配置未完成：需要 1 个阵法、至少 1 名角色；法宝可不携带。当前上阵位：${roleText}，法宝位：${artifactText}。`;
    if (nextSlot) {
      elements.loadoutStatus.textContent += ` ${nextSlot.level}级解锁第${nextSlot.deploySlots}个上阵位。`;
    }
    elements.enterDeployButton.disabled = !helpers.loadoutReady();
  }

  function renderSetupLists({ elements, state, DATA, deployState }) {
    elements.formationList.innerHTML = "";
    if (state.selectedFormationId) {
      const formation = DATA.formations[state.selectedFormationId];
      if (formation) {
        const item = document.createElement("div");
        item.className = "choice selected";
        item.innerHTML = `<strong>${safeText(formation.name)}</strong><span>战斗中不可更换</span>`;
        elements.formationList.appendChild(item);
      }
    }

    elements.roleList.innerHTML = "";
    state.availableRoles.forEach((roleId) => {
      const role = DATA.roles[roleId];
      if (!role) return;
      const deployed = state.deployedRoles.some((item) => item.roleId === roleId);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice";
      button.classList.toggle("selected", roleId === state.selectedRoleId);
      button.classList.toggle("deployed", deployed);
      button.dataset.setupRoleId = roleId;
      button.innerHTML = `<strong>${safeText(role.name)}</strong><span>${safeText(role.rarity)} · ${safeText(role.rankTitle || role.rank)} · ${safeText(role.school)} · ${safeText(role.trajectoryType)}</span>`;
      button.disabled = state.appState !== deployState || deployed;
      elements.roleList.appendChild(button);
    });

    elements.artifactList.innerHTML = "";
    const selectedArtifactIds = Array.isArray(state.selectedArtifactIds)
      ? state.selectedArtifactIds
      : state.selectedArtifactId
        ? [state.selectedArtifactId]
        : [];
    selectedArtifactIds.forEach((artifactId) => {
      const artifact = DATA.artifacts[artifactId];
      if (artifact) {
        const item = document.createElement("div");
        item.className = "choice selected";
        item.innerHTML = `<strong>${safeText(artifact.name)}</strong><span>自动攻击 · 战斗中不可更换</span>`;
        elements.artifactList.appendChild(item);
      }
    });
  }

  function renderHud({ elements, state, DATA, nextLevelRequirement }) {
    elements.waveText.textContent = `${state.wave} / ${DATA.config.maxWaves}`;
    elements.hpText.textContent = `${Math.max(0, Math.ceil(state.arrayCoreHp))} / ${state.arrayCoreMaxHp}${
      state.arrayCoreDefense > 0 ? `\n防御：${state.arrayCoreDefense}` : ""
    }`;
    const next = nextLevelRequirement();
    elements.lingqiText.textContent =
      next < Infinity
        ? `Lv${state.runLevel} · ${Math.floor(state.lingqi)} / ${next}`
        : `Lv${state.runLevel} · 已满`;
    elements.runStatus.textContent = state.status;
    elements.startButton.textContent = state.appState === elements.deployState ? "开始战斗" : "战斗中";
    elements.startButton.disabled = state.appState !== elements.deployState || state.deployedRoles.length !== state.availableRoles.length;
    elements.deployHint.textContent =
      state.appState === elements.deployState
        ? `已部署 ${state.deployedRoles.length}/${state.availableRoles.length}。只能放在最底部 5 个护山大阵 / 护山阵眼格。`
        : "战斗中角色会自动攻击，不能消耗灵石建造。";
  }

  function renderSettlement({ elements, win, state, reward, playerExp, levelRewards }) {
    elements.settlementTitle.textContent = win ? "守山成功" : "阵眼破碎";
    elements.settlementWave.textContent = state.highestWave;
    elements.settlementKills.textContent = state.kills;
    elements.settlementLingstone.textContent = `${reward}灵石 / ${playerExp}经验${levelRewards.length ? ` / ${levelRewards.join("，")}` : ""}`;
  }

  function renderPerkChoiceCard(perk) {
    return `<small>${safeText(perk.rarity)} · ${safeText(perk.category)}</small><strong>${safeText(perk.name)}</strong><p>${safeText(perk.description)}</p>`;
  }

  Object.assign(window.XM.Render, {
    renderHud,
    renderLoadout,
    renderLobby,
    renderPerkChoiceCard,
    renderSetupLists,
    renderSettlement,
    safeText,
  });
})();
