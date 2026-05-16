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

  function renderResourceBar({ root, playerProfile }) {
    if (!root) return;
    root.innerHTML = `
      <span>Lv. ${safeText(playerProfile.playerLevel || 1)}</span>
      <span>灵石 ${safeText(playerProfile.spiritStones || 0)}</span>
      <span>最高波次 ${safeText(playerProfile.highestWave || 0)}</span>
      <span>主线：妖门初启</span>
    `;
  }

  function renderMainHub({ elements, playerProfile }) {
    renderResourceBar({ root: elements.hubResourceBar, playerProfile });
  }

  function classifyPage(page) {
    const config = {
      CHARACTERS: ["角色", "宗门弟子、先天武学与局外成长。"],
      ARTIFACTS: ["法宝", "随行法器、基础效果与羁绊线索。"],
      FORMATIONS: ["护山大阵", "每局选择一个阵法，影响整局战斗节奏。"],
      BAG: ["背包", "材料、消耗、特殊与任务物品。"],
      GACHA: ["抽取", "以灵石抽取宗门角色，后续扩展法宝抽取。"],
      CODEX: ["妖录", "角色、法宝、妖物、阵法与剧情档案。"],
      ADVENTURE: ["历练", "选择章节关卡，并进入战前配置。"],
    };
    return config[page] || config.CHARACTERS;
  }

  function martialArtNameForRole(DATA, role) {
    const art = (DATA.martialArts || []).find((item) => item.ownerCharacterId === role.id || item.characterId === role.id || item.id === role.martialArtId);
    return art?.name || role.martialArtName || role.martialArtId || "先天武学";
  }

  function roleCard(role, DATA, playerProfile, helpers) {
    const owned = playerProfile.ownedCharacters.includes(role.id);
    const level = helpers.getCharacterLevel(role.id);
    return `
      <article class="xm-detail-card ${owned ? "" : "xm-card--disabled"}">
        <small>${safeText(role.rarity)} · ${safeText(role.rankTitle || role.rank)} · ${safeText(role.school)}</small>
        <h3>${safeText(role.name)}</h3>
        <p>${safeText(martialArtNameForRole(DATA, role))}</p>
        <p>Lv${owned ? safeText(level) : "-"} · ${safeText(role.role || role.trajectoryType || "宗门弟子")}</p>
        <p>${safeText(role.designValue || role.description || "")}</p>
        ${owned ? `<button type="button" class="secondary" data-role-upgrade-id="${safeText(role.id)}">升级角色</button>` : "<span>未拥有</span>"}
      </article>
    `;
  }

  function renderCharactersPage({ DATA, playerProfile, helpers }) {
    const roles = Object.values(DATA.roles || {});
    const ownedCount = roles.filter((role) => playerProfile.ownedCharacters.includes(role.id)).length;
    return `
      <section class="xm-page-panel">
        <h2>宗门弟子</h2>
        <p>已拥有 ${ownedCount} / ${roles.length} · 上阵位 ${playerProfile.maxDeploySlots || 1}</p>
        <div class="xm-card-grid xm-card-grid--roles">
          ${roles.map((role) => roleCard(role, DATA, playerProfile, helpers)).join("")}
        </div>
      </section>
    `;
  }

  function renderArtifactsPage({ DATA, playerProfile }) {
    const artifacts = Object.values(DATA.artifacts || {});
    const owned = new Set(playerProfile.ownedArtifacts || []);
    const bonds = window.XM.Artifacts?.getActiveArtifactBonds
      ? window.XM.Artifacts.getActiveArtifactBonds(playerProfile.ownedArtifacts || [])
      : [];
    return `
      <section class="xm-page-panel">
        <h2>法宝阁</h2>
        <p>法宝位随玩家等级解锁；局外升级暂未开放。</p>
        <p>${bonds.length ? `已发现羁绊：${bonds.map((bond) => safeText(bond.name)).join("、")}` : "已发现羁绊：暂无"}</p>
        <div class="xm-card-grid">
          ${artifacts
            .map(
              (artifact) => `
                <article class="xm-detail-card ${owned.has(artifact.id) ? "" : "xm-card--disabled"}">
                  <small>${safeText(artifact.role || artifact.rarity || "法宝")}</small>
                  <h3>${safeText(artifact.name)}</h3>
                  <p>${safeText(artifact.attackText || artifact.description || "")}</p>
                  <p>${owned.has(artifact.id) ? "已拥有" : "未拥有"} · 局外升级暂未开放</p>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
    `;
  }

  function renderFormationsPage({ DATA, playerProfile, state }) {
    const formations = Object.values(DATA.formations || {});
    const unlocked = new Set(playerProfile.unlockedFormations || []);
    return `
      <section class="xm-page-panel xm-formation-page">
        <div class="xm-array-preview"><span>阵</span></div>
        <div>
          <h2>护山大阵</h2>
          <p>护山大阵与阵眼为同一区域；阵法局外升级暂未开放。</p>
          <div class="xm-card-grid">
            ${formations
              .map(
                (formation) => `
                  <button type="button" class="xm-detail-card xm-detail-button ${state.loadoutFormationId === formation.id ? "xm-card--selected" : ""} ${unlocked.has(formation.id) ? "" : "xm-card--disabled"}" data-hub-formation-id="${safeText(formation.id)}">
                    <small>${safeText(formation.role || formation.rarity || "护山大阵")}</small>
                    <strong>${safeText(formation.name)}</strong>
                    <span>${safeText(formation.effectText || formation.description || "")}</span>
                  </button>
                `,
              )
              .join("")}
          </div>
        </div>
      </section>
    `;
  }

  function renderBagPage() {
    return `
      <section class="xm-page-panel">
        <h2>背包</h2>
        <div class="xm-card-grid">
          ${["材料", "消耗", "特殊", "任务"].map((name) => `<article class="xm-detail-card"><h3>${name}</h3><p>背包系统暂未开放，后续用于存放妖核、阵纹残片、法宝材料等。</p></article>`).join("")}
        </div>
      </section>
    `;
  }

  function renderGachaPage({ playerProfile }) {
    return `
      <section class="xm-page-panel">
        <h2>抽取</h2>
        <p>当前灵石：${safeText(playerProfile.spiritStones || 0)}</p>
        <div class="xm-card-grid">
          <article class="xm-detail-card">
            <h3>角色抽取</h3>
            <p>消耗灵石抽取宗门角色，概率与返还沿用当前规则。</p>
            <button type="button" class="primary" data-hub-gacha="single">单抽</button>
          </article>
          <article class="xm-detail-card xm-card--disabled">
            <h3>法宝抽取</h3>
            <p>暂未开放。</p>
            <button type="button" class="secondary" disabled>十连暂未开放</button>
          </article>
        </div>
      </section>
    `;
  }

  function renderCodexPage({ DATA }) {
    const roleItems = Object.values(DATA.roles || {}).map((item) => item.name);
    const artifactItems = Object.values(DATA.artifacts || {}).map((item) => item.name);
    const enemyItems = Object.values(DATA.enemies || {}).map((item) => item.name);
    const formationItems = Object.values(DATA.formations || {}).map((item) => item.name);
    const section = (title, items) => `
      <article class="xm-detail-card">
        <h3>${title}</h3>
        <p>${items.slice(0, 16).map(safeText).join("、") || "暂无"}</p>
      </article>
    `;
    return `
      <section class="xm-page-panel">
        <h2>妖录 / 图鉴</h2>
        <div class="xm-card-grid">
          ${section("角色图鉴", roleItems)}
          ${section("法宝图鉴", artifactItems)}
          ${section("妖物图鉴", enemyItems)}
          ${section("阵法图鉴", formationItems)}
          ${section("剧情档案", ["第一章·妖门初启", "妖门既开，山门当守"])}
        </div>
      </section>
    `;
  }

  function renderAdventurePage({ DATA }) {
    const preview = (DATA.waves || [])
      .filter((wave) => wave.wave <= 5)
      .flatMap((wave) => (wave.enemies || wave.segments || []).map((segment) => segment.enemyId))
      .filter(Boolean);
    const names = [...new Set(preview)].map((id) => DATA.enemies?.[id]?.name || id).filter(Boolean);
    return `
      <section class="xm-page-panel xm-adventure-panel">
        <p class="xm-eyebrow">当前章节</p>
        <h2>第一章·妖门初启</h2>
        <h3>当前关卡：妖门初开</h3>
        <p>推荐：整备 1 名以上角色，选择 1 个护山大阵，可携带法宝辅助守阵。</p>
        <p>怪物预览：${names.length ? names.map(safeText).join("、") : "赤鬃獠、掠影猲、铁甲魈"}</p>
        <p>奖励预览：灵气成长、局外灵石、玩家经验。</p>
        <button type="button" class="primary" data-page-action="start-adventure">开始历练</button>
      </section>
    `;
  }

  function renderFeaturePage({ elements, page, DATA, playerProfile, state, helpers }) {
    const [title, subtitle] = classifyPage(page);
    elements.featurePageTitle.textContent = title;
    elements.featurePageSubtitle.textContent = subtitle;
    const renderers = {
      CHARACTERS: () => renderCharactersPage({ DATA, playerProfile, helpers }),
      ARTIFACTS: () => renderArtifactsPage({ DATA, playerProfile }),
      FORMATIONS: () => renderFormationsPage({ DATA, playerProfile, state }),
      BAG: () => renderBagPage(),
      GACHA: () => renderGachaPage({ playerProfile }),
      CODEX: () => renderCodexPage({ DATA }),
      ADVENTURE: () => renderAdventurePage({ DATA }),
    };
    elements.featurePageContent.innerHTML = (renderers[page] || renderers.CHARACTERS)();
  }

  function renderLoadout({ elements, state, playerProfile, DATA, helpers }) {
    elements.loadoutFormationList.innerHTML = "";
    playerProfile.unlockedFormations.forEach((id) => {
      const formation = DATA.formations[id];
      if (!formation) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice choice--formation";
      button.classList.toggle("selected", state.loadoutFormationId === id);
      button.dataset.loadoutFormationId = id;
      button.innerHTML = [
        `<strong>${safeText(formation.name)}</strong>`,
        `<span>${safeText(formation.role || formation.rarity || "护山大阵")}</span>`,
        `<span>${safeText(formation.effectText || formation.description || "")}</span>`,
      ].join("");
      elements.loadoutFormationList.appendChild(button);
    });

    elements.loadoutRoleList.innerHTML = "";
    playerProfile.ownedCharacters.forEach((id) => {
      const role = DATA.roles[id];
      if (!role) return;
      const selected = state.loadoutRoleIds.includes(id);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice choice--role";
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
    artifactSummary.className = "unlock-tip loadout-summary";
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
      button.className = "choice choice--artifact";
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
        item.className = "choice choice--formation selected";
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
      button.className = "choice choice--role";
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
        item.className = "choice choice--artifact selected";
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
    const hpRatio = state.arrayCoreMaxHp > 0 ? Math.max(0, Math.min(1, state.arrayCoreHp / state.arrayCoreMaxHp)) : 0;
    elements.hpText.parentElement?.classList.toggle("hud-meter", true);
    elements.hpText.parentElement?.classList.toggle("hud-meter--danger", hpRatio < 0.35);
    elements.hpText.parentElement?.style.setProperty("--hud-fill", `${Math.round(hpRatio * 100)}%`);
    const next = nextLevelRequirement();
    const qiRatio = next < Infinity && next > 0 ? Math.max(0, Math.min(1, state.lingqi / next)) : 1;
    elements.lingqiText.textContent =
      next < Infinity
        ? `Lv${state.runLevel} · ${Math.floor(state.lingqi)} / ${next}`
        : `Lv${state.runLevel} · 已满`;
    elements.lingqiText.parentElement?.classList.toggle("hud-meter", true);
    elements.lingqiText.parentElement?.classList.toggle("hud-meter--lingqi", true);
    elements.lingqiText.parentElement?.style.setProperty("--hud-fill", `${Math.round(qiRatio * 100)}%`);
    const formationName = DATA.formations[state.selectedFormationId]?.name;
    const artifactNames = (state.selectedArtifactIds || [])
      .map((id) => DATA.artifacts[id]?.name || id)
      .filter(Boolean);
    const activeBonds = window.XM.Artifacts?.getActiveArtifactBonds
      ? window.XM.Artifacts.getActiveArtifactBonds(state.selectedArtifactIds || [])
      : [];
    const statusLines = [
      safeText(state.status),
      formationName ? `当前阵法：${safeText(formationName)}` : "",
      artifactNames.length ? `当前法宝：${artifactNames.map(safeText).join("、")}` : "当前法宝：无",
      activeBonds.length ? `已激活羁绊：${activeBonds.map((bond) => safeText(bond.name)).join("、")}` : "当前未激活法宝羁绊",
    ].filter(Boolean);
    elements.runStatus.innerHTML = statusLines.join("<br>");
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
    renderFeaturePage,
    renderLoadout,
    renderLobby,
    renderMainHub,
    renderPerkChoiceCard,
    renderResourceBar,
    renderSetupLists,
    renderSettlement,
    safeText,
  });
})();
