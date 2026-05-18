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

  function currentChapterSummary({ DATA, playerProfile, helpers }) {
    const chapter = DATA.chapters?.chapter_1;
    const nodeId = helpers?.getCurrentChapterNodeId ? helpers.getCurrentChapterNodeId("chapter_1") : playerProfile.chapterProgress?.chapter_1?.currentNodeId;
    const node = helpers?.getChapterNode ? helpers.getChapterNode("chapter_1", nodeId) : chapter?.nodes?.find((item) => item.nodeId === nodeId);
    const clearedCount = playerProfile.chapterProgress?.chapter_1?.clearedNodeIds?.length || 0;
    const complete = chapter?.nodes?.length && clearedCount >= chapter.nodes.length;
    return { chapter, node, clearedCount, complete };
  }

  function renderResourceBar({ root, playerProfile, DATA, helpers }) {
    if (!root) return;
    const summary = currentChapterSummary({ DATA, playerProfile, helpers });
    root.innerHTML = `
      <span class="xm-resource-label">道行 Lv. ${safeText(playerProfile.playerLevel || 1)}</span>
      <span class="xm-resource-label">靈石 <strong class="xm-resource-value">${safeText(playerProfile.spiritStones || 0)}</strong></span>
      <span class="xm-resource-label">當前章節：${safeText(summary.complete ? "第一章已平定" : summary.chapter?.name || "第一章·妖門初啟")}</span>
      <span class="xm-resource-label">當前界域：青冥一界</span>
    `;
  }

  function renderMainHub({ elements, playerProfile, DATA, helpers }) {
    const summary = currentChapterSummary({ DATA, playerProfile, helpers });
    renderResourceBar({ root: elements.hubResourceBar, playerProfile, DATA, helpers });
    if (elements.hubMainTitle) {
      elements.hubMainTitle.textContent = summary.complete ? "第一章已平定" : summary.chapter?.name || "第一章·妖門初啟";
    }
    if (elements.hubNodeTitle) {
      elements.hubNodeTitle.textContent = summary.complete
        ? "新的裂隙正在外山深处蔓延"
        : `当前节点：${summary.node ? `${summary.node.displayId} ${summary.node.name}` : "1-1 山门警钟"}`;
    }
    if (elements.hubMainDescription) {
      elements.hubMainDescription.textContent = summary.complete
        ? "第一章妖潮已暂平。新的裂隙正在外山深处蔓延，宗门仍需整备。"
        : "妖門裂隙初現，護山大陣外環失衡。請前往山門外環查明妖潮源頭。";
    }
  }

  function classifyPage(page) {
    const config = {
      CHARACTERS: ["洞府", "查看、培养与管理宗门门人和已拥有角色。"],
      ARTIFACTS: ["炼器阁", "随行法器、基础效果与羁绊线索。"],
      FORMATIONS: ["阵枢殿", "护山大阵核心中枢，影响整局战斗节奏。"],
      BAG: ["库藏殿", "材料、消耗、特殊与任务物品。"],
      GACHA: ["祈灵台", "以灵石祈召宗门角色，后续扩展法宝祈召。"],
      CODEX: ["镇妖录", "妖物图鉴、怪物记录与封妖资料。"],
      ADVENTURE: ["山门外", "選擇章節關卡，並進入戰前配置。"],
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

  function nodeTypeLabel(type) {
    return {
      tutorial_battle: "教学战斗",
      normal_battle: "普通战斗",
      mechanic_battle: "机制战斗",
      elite_battle: "精英战斗",
      story_battle: "剧情战斗",
      ranged_battle: "远程压阵",
      mini_boss: "小首领",
      boss: "Boss",
    }[type] || type || "战斗";
  }

  function renderAdventurePage({ DATA, playerProfile, state, helpers }) {
    const chapter = DATA.chapters?.chapter_1;
    if (!chapter) return `<section class="xm-page-panel"><h2>历练</h2><p>章节数据暂未开放。</p></section>`;
    const progress = playerProfile.chapterProgress?.[chapter.chapterId] || {};
    const selectedNodeId = state.selectedAdventureNodeId || progress.currentNodeId || chapter.nodes[0]?.nodeId;
    const selectedNode = chapter.nodes.find((node) => node.nodeId === selectedNodeId) || chapter.nodes[0];
    const selectedStatus = helpers.getChapterNodeStatus(chapter.chapterId, selectedNode.nodeId);
    const clearedCount = progress.clearedNodeIds?.length || 0;
    const detailOpen = Boolean(state.adventureDetailOpen && selectedNode);
    const nodePositions = [
      [12, 78],
      [22, 65],
      [34, 72],
      [43, 56],
      [53, 47],
      [42, 34],
      [56, 27],
      [67, 40],
      [76, 27],
      [87, 18],
    ];
    const nodeButton = (node, index) => {
      const status = helpers.getChapterNodeStatus(chapter.chapterId, node.nodeId);
      const isSelected = detailOpen && node.nodeId === selectedNode.nodeId;
      const [x, y] = nodePositions[index] || [12 + index * 8, 64 - (index % 3) * 8];
      return `
        <button type="button" class="xm-map-node xm-map-node--${safeText(status)} ${node.boss || node.type === "boss" || node.type === "mini_boss" ? "xm-map-node--boss" : ""} ${isSelected ? "xm-map-node--selected" : ""}" style="--node-x: ${x}%; --node-y: ${y}%;" data-adventure-chapter-id="${safeText(chapter.chapterId)}" data-adventure-node-id="${safeText(node.nodeId)}" aria-label="${safeText(`${node.displayId} ${node.name}`)}">
          <span>${safeText(node.displayId)}</span>
          <strong>${safeText(node.name)}</strong>
          <small>${status === "locked" ? "未解锁" : status === "cleared" ? "已通关" : "可挑战"}${node.boss || node.type === "boss" ? " · Boss" : ""}</small>
        </button>
      `;
    };
    const enemies = (selectedNode.enemyPreview || []).map((name) => `<span>${safeText(name)}</span>`).join("");
    const rewards = (selectedNode.rewardPreview || []).map((name) => `<span>${safeText(name)}</span>`).join("");
    const locked = selectedStatus === "locked";
    const startLabel = selectedStatus === "cleared" ? "再次挑战" : "开始历练";
    const detail = detailOpen
      ? `
        <aside class="xm-node-detail xm-node-detail--drawer ${locked ? "xm-node-detail--locked" : ""}">
          <button type="button" class="xm-node-detail-close" data-page-action="close-adventure-detail" aria-label="关闭节点详情">×</button>
          <p class="xm-eyebrow">${safeText(selectedNode.displayId)} · ${safeText(nodeTypeLabel(selectedNode.type))}${selectedNode.boss || selectedNode.type === "boss" ? " · Boss" : ""}</p>
          <h2>${safeText(selectedNode.name)}</h2>
          <p>${safeText(locked ? "未解锁，请先完成前置节点。" : selectedNode.description)}</p>
          <blockquote>${safeText(selectedNode.storyText || selectedNode.description)}</blockquote>
          <div class="xm-preview-row"><strong>敌人预览</strong><div>${enemies || "<span>未知妖物</span>"}</div></div>
          <div class="xm-preview-row"><strong>奖励预览</strong><div>${rewards || "<span>灵石</span>"}</div></div>
          <button type="button" class="primary" data-page-action="start-adventure" data-chapter-id="${safeText(chapter.chapterId)}" data-node-id="${safeText(selectedNode.nodeId)}" ${locked ? "disabled" : ""}>${safeText(locked ? "尚未解锁" : startLabel)}</button>
          <button type="button" class="secondary" data-page-action="back-main">返回宗门</button>
        </aside>
      `
      : "";
    return `
      <section class="xm-adventure-map">
        <header class="xm-adventure-map-header">
          <div>
            <p class="xm-eyebrow">山门外环历练图</p>
            <h2>${safeText(chapter.name)}</h2>
          </div>
          <p>${safeText(chapter.subtitle)} · 进度 ${clearedCount} / ${chapter.nodes.length}</p>
        </header>
        <aside class="xm-chapter-panel xm-chapter-panel--compact">
          <strong>${safeText(chapter.theme)}</strong>
          <span>${safeText(chapter.description)}</span>
        </aside>
        <div class="xm-node-route">
          ${chapter.nodes.map(nodeButton).join("")}
        </div>
        ${detail}
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
      ADVENTURE: () => renderAdventurePage({ DATA, playerProfile, state, helpers }),
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
    elements.waveText.textContent = `第 ${state.wave} / ${DATA.config.maxWaves} 波`;
    elements.hpText.textContent = `${Math.max(0, Math.ceil(state.arrayCoreHp))} / ${state.arrayCoreMaxHp}${
      state.arrayCoreDefense > 0 ? `\n陣防：${state.arrayCoreDefense}` : ""
    }`;
    const hpRatio = state.arrayCoreMaxHp > 0 ? Math.max(0, Math.min(1, state.arrayCoreHp / state.arrayCoreMaxHp)) : 0;
    elements.hpText.parentElement?.classList.toggle("hud-meter", true);
    elements.hpText.parentElement?.classList.toggle("hud-meter--danger", hpRatio < 0.35);
    elements.hpText.parentElement?.style.setProperty("--hud-fill", `${Math.round(hpRatio * 100)}%`);
    const next = nextLevelRequirement();
    const qiRatio = next < Infinity && next > 0 ? Math.max(0, Math.min(1, state.lingqi / next)) : 1;
    elements.lingqiText.textContent =
      next < Infinity
        ? `Lv.${state.runLevel} · ${Math.floor(state.lingqi)} / ${next}`
        : `Lv.${state.runLevel} · 已滿`;
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
      formationName ? `當前陣法：${safeText(formationName)}` : "",
      artifactNames.length ? `當前法寶：${artifactNames.map(safeText).join("、")}` : "當前法寶：無",
      activeBonds.length ? `已激活羁绊：${activeBonds.map((bond) => safeText(bond.name)).join("、")}` : "当前未激活法宝羁绊",
    ].filter(Boolean);
    elements.runStatus.innerHTML = statusLines.join("<br>");
    elements.startButton.textContent = state.appState === elements.deployState ? "開始鎮守" : "鎮守中";
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
