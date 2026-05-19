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

  function valuesOf(collection) {
    return Array.isArray(collection) ? collection : Object.values(collection || {});
  }

  function currentChapterSummary({ DATA, playerProfile, helpers }) {
    const chapter = DATA.chapters?.chapter_1;
    const nodeId = helpers?.getCurrentChapterNodeId
      ? helpers.getCurrentChapterNodeId("chapter_1")
      : playerProfile.chapterProgress?.chapter_1?.currentNodeId;
    const node = helpers?.getChapterNode
      ? helpers.getChapterNode("chapter_1", nodeId)
      : chapter?.nodes?.find((item) => item.nodeId === nodeId);
    const clearedCount = playerProfile.chapterProgress?.chapter_1?.clearedNodeIds?.length || 0;
    return { chapter, node, clearedCount, complete: Boolean(chapter?.nodes?.length && clearedCount >= chapter.nodes.length) };
  }

  function renderResourceBar({ root, playerProfile, DATA, helpers }) {
    if (!root) return;
    const summary = currentChapterSummary({ DATA, playerProfile, helpers });
    root.innerHTML = `
      <span class="xm-resource-label">Lv. ${safeText(playerProfile.playerLevel || 1)}</span>
      <span class="xm-resource-label">灵石 <strong class="xm-resource-value">${safeText(playerProfile.spiritStones || 0)}</strong></span>
      <span class="xm-resource-label">${safeText(summary.complete ? "第一章已平定" : summary.chapter?.name || "第一章·妖门初启")}</span>
      <span class="xm-resource-label">青冥一界</span>
    `;
  }

  function renderLobby({ elements, DATA, playerProfile, helpers }) {
    helpers.syncPlayerMetaAliases();
    elements.metaLevel.textContent = `${playerProfile.playerLevel}级 · ${playerProfile.playerExp}/${helpers.getPlayerLevelExpRequirement(playerProfile.playerLevel)}`;
    elements.metaLingstone.textContent = playerProfile.spiritStones;
    elements.ownedRolesList.innerHTML = "";

    valuesOf(DATA.roles).forEach((role) => {
      const owned = playerProfile.ownedCharacters.includes(role.id);
      const level = helpers.getCharacterLevel(role.id);
      const damage = Math.round(helpers.getCharacterBaseFinalDamage(role) * 10) / 10;
      const item = document.createElement("div");
      item.className = `character-card ${owned ? "owned" : "locked"}`;
      const source = role.unlockType === "gacha" ? "抽卡获得" : `${role.unlockLevel || "?"}级解锁`;
      item.innerHTML = `
        <strong>${safeText(role.name)} <small>${safeText(role.rarity)}</small></strong>
        <span>${safeText(role.rankTitle || role.rank || "宗门门人")} · ${safeText(role.school || "-")} · ${safeText(role.role || "-")}</span>
        <span>等级 ${owned ? level : "-"} · 伤害 ${owned ? damage : role.baseDamage} · ${safeText(role.trajectoryType || "single")}</span>
        <span>${owned ? "已拥有" : safeText(source)}</span>
        <p>${safeText(owned ? role.designValue || role.description : role.description || role.designValue)}</p>
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
    if (nextCharacter) tips.push(`${nextCharacter.level}级解锁：${DATA.roles[nextCharacter.characterId]?.name || nextCharacter.characterId}`);
    if (nextSlot) tips.push(`${nextSlot.level}级解锁第${nextSlot.deploySlots}个上阵位`);
    if (tips.length) {
      const tip = document.createElement("span");
      tip.className = "unlock-tip";
      tip.textContent = tips.join(" · ");
      elements.ownedRolesList.prepend(tip);
    }

    elements.ownedArtifactsList.innerHTML = (playerProfile.ownedArtifacts || []).map((id) => `<span>${safeText(DATA.artifacts[id]?.name || id)}</span>`).join("");
    elements.unlockedFormationsList.innerHTML = (playerProfile.unlockedFormations || []).map((id) => `<span>${safeText(DATA.formations[id]?.name || id)}</span>`).join("");
  }

  function renderMainHub({ elements, playerProfile, DATA, helpers }) {
    const summary = currentChapterSummary({ DATA, playerProfile, helpers });
    renderResourceBar({ root: elements.hubResourceBar, playerProfile, DATA, helpers });
    if (elements.hubMainTitle) elements.hubMainTitle.textContent = summary.complete ? "第一章已平定" : summary.chapter?.name || "第一章·妖门初启";
    if (elements.hubNodeTitle) {
      elements.hubNodeTitle.textContent = summary.complete
        ? "新的裂隙正在外山深处蔓延"
        : `当前节点：${summary.node ? `${summary.node.displayId} ${summary.node.name}` : "1-1 山门警钟"}`;
    }
    if (elements.hubMainDescription) {
      elements.hubMainDescription.textContent = summary.complete
        ? "第一章妖潮已暂平。新的裂隙正在外山深处蔓延，宗门仍需整备。"
        : "妖门裂隙初现，护山大阵外环失衡。请前往山门外环查明妖潮源头。";
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
      ADVENTURE: ["山门外", "选择章节关卡，进入战前配置。"],
    };
    return config[page] || config.CHARACTERS;
  }

  function subpageShell({ className = "", sidebarTitle, sidebar, mainTitle, main, detailTitle, detail }) {
    return `
      <section class="xm-subpage-body ${safeText(className)}">
        <aside class="xm-subpage-sidebar xm-inner-panel"><h2>${safeText(sidebarTitle)}</h2><div class="xm-scroll-list">${sidebar}</div></aside>
        <main class="xm-subpage-main xm-inner-panel"><h2>${safeText(mainTitle)}</h2>${main}</main>
        <aside class="xm-subpage-detail xm-inner-panel"><h2>${safeText(detailTitle)}</h2>${detail}</aside>
      </section>
    `;
  }

  function martialArtNameForRole(DATA, role) {
    const art = (DATA.martialArts || []).find((item) => item.ownerCharacterId === role.id || item.characterId === role.id || item.id === role.martialArtId);
    return art?.name || role.martialArtName || role.martialArtId || "先天武学未载明";
  }

  function trajectoryLabel(value) {
    return {
      single: "单体",
      splash: "溅射",
      pierce: "穿透",
      slow: "减速",
      poison: "持续伤害",
      horizontal: "横扫",
      chain: "连锁",
      execute: "斩杀",
      sword: "飞剑",
      orb: "灵弹",
    }[value] || value || "单体";
  }

  function rolePositionLabel(role = {}) {
    const raw = `${role.role || ""} ${role.trajectoryType || ""} ${role.projectileType || ""} ${role.school || ""}`;
    if (/slow|冰|减速/.test(raw)) return "减速控制";
    if (/poison|毒/.test(raw)) return "持续伤害";
    if (/splash|火|范围/.test(raw)) return "小范围伤害";
    if (/horizontal|pierce|chain|横|穿|连/.test(raw)) return "群体压制";
    if (/buff|增幅|阵/.test(raw)) return "全局增幅";
    return "单体输出";
  }

  function renderCharactersPage({ DATA, playerProfile, state, helpers }) {
    const roles = valuesOf(DATA.characters || DATA.roles);
    const ownedIds = Array.isArray(playerProfile?.ownedCharacters) ? playerProfile.ownedCharacters : [];
    const ownedSet = new Set(ownedIds);
    const levels = playerProfile?.characterLevels || {};

    if (!roles.length) {
      return `
        <section class="xm-character-page">
          <aside class="xm-character-page__sidebar xm-inner-panel"><h2>门人名册</h2><p>暂无门人数据。</p></aside>
          <section class="xm-character-page__center xm-inner-panel"><h2>洞府修行</h2><div class="xm-character-stage"><p>暂无可展示角色。</p></div></section>
          <aside class="xm-character-page__detail xm-inner-panel"><h2>门人卷宗</h2><p>角色数据尚未载入。</p></aside>
        </section>
      `;
    }

    const preferredRole = roles.find((role) => ownedSet.has(role.id) && /lu_qingya|qingya/i.test(role.id))
      || roles.find((role) => ownedSet.has(role.id))
      || roles[0];
    const currentRole = roles.find((role) => role.id === state?.selectedCharacterId) || preferredRole;
    if (state && currentRole?.id && state.selectedCharacterId !== currentRole.id) state.selectedCharacterId = currentRole.id;

    const owned = ownedSet.has(currentRole.id);
    const currentLevel = helpers?.getCharacterLevel ? helpers.getCharacterLevel(currentRole.id) : levels[currentRole.id] || 1;
    const baseDamage = Number(currentRole.baseDamage ?? currentRole.damage ?? 0);
    const finalDamage = helpers?.getCharacterBaseFinalDamage ? helpers.getCharacterBaseFinalDamage(currentRole) : baseDamage;
    const currentDamage = Number.isFinite(finalDamage) ? Math.round(finalDamage * 10) / 10 : baseDamage || "-";
    const loadoutRoleIds = Array.isArray(state?.loadoutRoleIds) ? state.loadoutRoleIds : [];
    const selectedRoleIds = Array.isArray(state?.selectedRoleIds) ? state.selectedRoleIds : [];
    const deployedRoles = Array.isArray(state?.deployedRoles) ? state.deployedRoles : [];
    const isSelectedForRun = Boolean(state?.selectedRoleId === currentRole.id || loadoutRoleIds.includes(currentRole.id) || selectedRoleIds.includes(currentRole.id) || deployedRoles.some((role) => role.roleId === currentRole.id || role.id === currentRole.id));
    const martialName = martialArtNameForRole(DATA, currentRole);
    const unlockText = currentRole.unlockCondition || currentRole.unlock || (currentRole.unlockLevel ? `${currentRole.unlockLevel}级解锁` : "抽取或进度解锁");

    return `
      <section class="xm-character-page">
        <aside class="xm-character-page__sidebar xm-inner-panel">
          <h2>门人名册</h2>
          <div class="xm-scroll-list xm-character-list">
            ${roles.map((role) => {
              const isOwned = ownedSet.has(role.id);
              const selected = role.id === currentRole.id;
              return `
                <button type="button" class="xm-character-list-item ${selected ? "xm-character-list-item--selected" : ""} ${isOwned ? "" : "xm-character-list-item--locked"}" data-character-select-id="${safeText(role.id)}">
                  <span class="xm-character-list-item__avatar">${safeText((role.name || "?").slice(0, 1))}</span>
                  <span class="xm-character-list-item__body"><strong>${safeText(role.name || role.id || "未命名门人")}</strong><small>${safeText(role.rarity || "-")} · ${safeText(role.school || "宗门")}</small></span>
                  <em>${safeText(isOwned ? "已拥有" : "未拥有")}</em>
                </button>
              `;
            }).join("")}
          </div>
        </aside>
        <section class="xm-character-page__center xm-inner-panel">
          <h2>洞府修行</h2>
          <div class="xm-character-stage">
            <div class="xm-character-stage__portrait"><span>${safeText((currentRole.name || "门").slice(0, 1))}</span></div>
            <div class="xm-character-stage__name">${safeText(currentRole.name || "门人")}</div>
            <div class="xm-character-stage__meta">${safeText(currentRole.rarity || "-")} · ${safeText(currentRole.rankTitle || currentRole.rank || "宗门门人")} · ${safeText(currentRole.school || "宗门")}</div>
            <div class="xm-character-stage__role">${safeText(rolePositionLabel(currentRole))}</div>
            <div class="xm-character-stage__actions">
              ${owned ? `<button type="button" class="primary" data-role-upgrade-id="${safeText(currentRole.id)}">升级角色</button>` : `<button type="button" class="secondary" disabled>尚未拥有</button>`}
              <button type="button" class="secondary" disabled>设为主修</button>
              <button type="button" class="secondary" disabled>查看先天武学</button>
            </div>
          </div>
        </section>
        <aside class="xm-character-page__detail xm-inner-panel">
          <h2>门人卷宗</h2>
          <div class="xm-character-detail">
            <section class="xm-character-detail__section"><h3>基本信息</h3><p><strong>角色姓名</strong><span>${safeText(currentRole.name || "-")}</span></p><p><strong>品质</strong><span>${safeText(currentRole.rarity || "-")}</span></p><p><strong>身份阶位</strong><span>${safeText(currentRole.rankTitle || currentRole.rank || "宗门门人")}</span></p><p><strong>流派</strong><span>${safeText(currentRole.school || "-")}</span></p><p><strong>角色定位</strong><span>${safeText(rolePositionLabel(currentRole))}</span></p></section>
            <section class="xm-character-detail__section"><h3>修为信息</h3><p><strong>角色等级</strong><span>Lv.${safeText(owned ? currentLevel : "-")}</span></p><p><strong>拥有状态</strong><span>${safeText(owned ? "已拥有" : "未拥有")}</span></p><p><strong>上阵状态</strong><span>${safeText(isSelectedForRun ? "本局已选择" : "未上阵")}</span></p><p><strong>解锁条件</strong><span>${safeText(owned ? "已解锁" : unlockText)}</span></p></section>
            <section class="xm-character-detail__section xm-character-detail__stats"><h3>数值面板</h3><p><strong>攻击</strong><span>${safeText(owned ? currentDamage : currentRole.baseDamage || "-")}</span></p><p><strong>攻速</strong><span>${safeText(currentRole.baseAttackSpeed || currentRole.attackSpeed || "-")}</span></p><p><strong>射程</strong><span>${safeText(currentRole.baseRange || currentRole.range || "-")}</span></p><p><strong>攻击形式</strong><span>${safeText(trajectoryLabel(currentRole.projectileType || currentRole.projectile))}</span></p><p><strong>弹道类型</strong><span>${safeText(trajectoryLabel(currentRole.trajectoryType))}</span></p></section>
            <section class="xm-character-detail__section xm-character-detail__skill"><h3>先天武学</h3><p><strong>${safeText(martialName)}</strong><span>${safeText(currentRole.passiveSkill || currentRole.projectileText || "主修本命法门，随局内机缘逐步展开。")}</span></p></section>
            <section class="xm-character-detail__section xm-character-detail__bio"><h3>门人札记</h3><p>${safeText(currentRole.note || currentRole.designValue || currentRole.description || `${currentRole.name || "此门人"}在宗门静修待命，可随宗主出阵守护山门。`)}</p></section>
          </div>
        </aside>
      </section>
    `;
  }

  function renderArtifactsPage({ DATA, playerProfile }) {
    const artifacts = valuesOf(DATA.artifacts);
    const owned = new Set(playerProfile.ownedArtifacts || []);
    const currentArtifact = artifacts.find((artifact) => owned.has(artifact.id)) || artifacts[0] || {};
    const bonds = window.XM.Artifacts?.getActiveArtifactBonds ? window.XM.Artifacts.getActiveArtifactBonds(playerProfile.ownedArtifacts || []) : [];
    return subpageShell({
      className: "xm-subpage--artifacts",
      sidebarTitle: "器胚",
      sidebar: artifacts.map((artifact) => `<article class="xm-item-card ${owned.has(artifact.id) ? "xm-item-card--selected" : "xm-card--disabled"}"><strong>${safeText(artifact.name)}</strong><span>${safeText(artifact.role || artifact.rarity || "法宝")}</span></article>`).join(""),
      mainTitle: "炼器案台",
      main: `<div class="xm-subpage-hero xm-subpage-hero--artifact"><span>${safeText(currentArtifact.name || "法宝")}</span></div><p>${bonds.length ? `已发现羁绊：${bonds.map((bond) => safeText(bond.name)).join("、")}` : "已发现羁绊：暂无"}</p><div class="xm-card-grid">${artifacts.map((artifact) => `<article class="xm-detail-card ${owned.has(artifact.id) ? "" : "xm-card--disabled"}"><small>${safeText(artifact.role || artifact.rarity || "法宝")}</small><h3>${safeText(artifact.name)}</h3><p>${safeText(artifact.attackText || artifact.description || "")}</p><p>${owned.has(artifact.id) ? "已拥有" : "未拥有"} · 局外升级暂未开放</p></article>`).join("")}</div>`,
      detailTitle: "器灵卷宗",
      detail: `<p><strong>当前法宝</strong> ${safeText(currentArtifact.name || "-")}</p><p>${safeText(currentArtifact.attackText || currentArtifact.description || "法宝祭炼、羁绊共鸣与器灵大成将在后续开放。")}</p><p><strong>携带规则</strong> 战前整备中选择本局随行法宝。</p>`,
    });
  }

  function renderFormationsPage({ DATA, playerProfile, state }) {
    const formations = valuesOf(DATA.formations);
    const unlocked = new Set(playerProfile.unlockedFormations || []);
    const currentFormation = formations.find((formation) => state.loadoutFormationId === formation.id) || formations[0] || {};
    return subpageShell({
      className: "xm-subpage--formations",
      sidebarTitle: "阵法目录",
      sidebar: formations.map((formation) => `<article class="xm-item-card ${state.loadoutFormationId === formation.id ? "xm-item-card--selected" : ""} ${unlocked.has(formation.id) ? "" : "xm-card--disabled"}"><strong>${safeText(formation.name)}</strong><span>${safeText(formation.role || formation.rarity || "护山大阵")}</span></article>`).join(""),
      mainTitle: "阵枢图",
      main: `<div class="xm-array-preview"><span>阵</span></div><p>护山大阵与阵眼为同一区域；阵法局外升级暂未开放。</p><div class="xm-card-grid">${formations.map((formation) => `<button type="button" class="xm-detail-card xm-detail-button ${state.loadoutFormationId === formation.id ? "xm-card--selected" : ""} ${unlocked.has(formation.id) ? "" : "xm-card--disabled"}" data-hub-formation-id="${safeText(formation.id)}"><small>${safeText(formation.role || formation.rarity || "护山大阵")}</small><strong>${safeText(formation.name)}</strong><span>${safeText(formation.effectText || formation.description || "")}</span></button>`).join("")}</div>`,
      detailTitle: "阵纹注解",
      detail: `<p><strong>当前阵法</strong> ${safeText(currentFormation.name || "-")}</p><p>${safeText(currentFormation.effectText || currentFormation.description || "阵纹流转，镇守五方。")}</p><p><strong>当前选择</strong> ${safeText(state.loadoutFormationId || "未选择")}</p>`,
    });
  }

  function renderBagPage() {
    const categories = ["材料", "消耗", "特殊", "任务"];
    return subpageShell({
      className: "xm-subpage--bag",
      sidebarTitle: "库藏分类",
      sidebar: categories.map((name, index) => `<article class="xm-item-card ${index === 0 ? "xm-item-card--selected" : ""}"><strong>${safeText(name)}</strong><span>待整理</span></article>`).join(""),
      mainTitle: "宗门宝库",
      main: `<div class="xm-inventory-grid">${Array.from({ length: 16 }, (_, index) => `<span>${index + 1}</span>`).join("")}</div>`,
      detailTitle: "物资说明",
      detail: "<p>库藏系统暂未开放，后续用于存放妖核、阵纹残片、法宝材料等。</p>",
    });
  }

  function renderGachaPage({ playerProfile }) {
    return subpageShell({
      className: "xm-subpage--gacha",
      sidebarTitle: "祈召门类",
      sidebar: `<article class="xm-item-card xm-item-card--selected"><strong>门人祈召</strong><span>当前开放</span></article><article class="xm-item-card xm-card--disabled"><strong>法宝祈召</strong><span>筹备中</span></article>`,
      mainTitle: "祈灵台",
      main: `<div class="xm-subpage-hero xm-subpage-hero--gacha"><span>祈</span></div><p>当前灵石：${safeText(playerProfile.spiritStones || 0)}</p><div class="xm-card-grid"><article class="xm-detail-card"><h3>角色抽取</h3><p>消耗灵石抽取宗门角色，概率与返还沿用当前规则。</p><button type="button" class="primary" data-hub-gacha="single">单抽</button></article><article class="xm-detail-card xm-card--disabled"><h3>法宝抽取</h3><p>暂未开放。</p><button type="button" class="secondary" disabled>十连暂未开放</button></article></div>`,
      detailTitle: "卡池说明",
      detail: "<p>焚香祈灵，感召门人与法宝机缘。概率说明沿用当前抽取规则，后续补充正式卡池公告。</p>",
    });
  }

  function renderCodexPage({ DATA }) {
    const section = (title, items) => `<article class="xm-detail-card"><h3>${safeText(title)}</h3><p>${items.slice(0, 16).map(safeText).join("、") || "暂无"}</p></article>`;
    return subpageShell({
      className: "xm-subpage--codex",
      sidebarTitle: "封妖目录",
      sidebar: ["妖物", "角色", "法宝", "阵法", "剧情线索"].map((name, index) => `<article class="xm-item-card ${index === 0 ? "xm-item-card--selected" : ""}"><strong>${safeText(name)}</strong><span>卷宗</span></article>`).join(""),
      mainTitle: "镇妖录卷",
      main: `<div class="xm-card-grid">${section("角色图鉴", valuesOf(DATA.roles).map((item) => item.name))}${section("法宝图鉴", valuesOf(DATA.artifacts).map((item) => item.name))}${section("妖物图鉴", valuesOf(DATA.enemies).map((item) => item.name))}${section("阵法图鉴", valuesOf(DATA.formations).map((item) => item.name))}${section("剧情档案", ["第一章·妖门初启", "妖门既开，山门当守"])}</div>`,
      detailTitle: "条目详情",
      detail: "<p>封妖志异，记录妖物、法宝、阵法与旧日线索。后续可在此展开单条目详情。</p>",
    });
  }

  function characterAttackTypeLabel(value) {
    return {
      flying_sword: "飞剑",
      fire_talisman: "火符",
      frost_bolt: "冰魄",
      poison_needle: "毒针",
      sword_wave: "剑气",
      thunder_arc: "雷弧",
      spear_arc: "枪罡",
      sound_wave: "音波",
      shadow_blade: "影刃",
      dao_light: "道光",
      sword: "飞剑",
      orb: "灵弹",
    }[value] || "特殊";
  }

  function characterTrajectoryLabel(value) {
    return {
      single: "单体",
      splash: "溅射",
      slow: "减速",
      poison: "毒伤",
      vertical: "纵向穿透",
      pierce: "纵向穿透",
      chain: "连锁",
      horizontal: "横向扫击",
      execute: "斩杀",
      multi: "多重",
    }[value] || "特殊";
  }

  function damageTypeLabel(role = {}) {
    const raw = `${role.damageType || ""} ${role.school || ""} ${role.projectileType || ""}`;
    if (/毒|poison/i.test(raw)) return "毒性伤害";
    if (/雷|thunder/i.test(raw)) return "雷法伤害";
    if (/冰|frost|ice/i.test(raw)) return "冰霜伤害";
    if (/音|sound/i.test(raw)) return "音律伤害";
    if (/暗|shadow/i.test(raw)) return "暗影伤害";
    if (/火|fire/i.test(raw)) return "火焰伤害";
    if (/法|dao|orb/i.test(raw)) return "灵气伤害";
    if (/枪|spear/i.test(raw)) return "枪罡伤害";
    if (/剑|sword|flying_sword/i.test(raw)) return "剑气伤害";
    return "物理伤害";
  }

  function skillIconText(role = {}) {
    const raw = `${role.school || ""} ${role.projectileType || ""} ${role.trajectoryType || ""}`;
    if (/火|fire/i.test(raw)) return "火";
    if (/冰|frost|ice|slow/i.test(raw)) return "冰";
    if (/毒|poison/i.test(raw)) return "毒";
    if (/雷|thunder/i.test(raw)) return "雷";
    if (/枪|spear/i.test(raw)) return "枪";
    if (/音|sound/i.test(raw)) return "音";
    if (/暗|shadow/i.test(raw)) return "影";
    if (/法|dao|orb/i.test(raw)) return "法";
    return "剑";
  }

  function martialTypeText(role = {}) {
    const attack = characterAttackTypeLabel(role.projectileType || role.projectile);
    return `${attack}弹道 · ${rolePositionLabel(role)}`;
  }

  function martialDescription(role = {}, martialName = "") {
    const key = role.id || "";
    const descriptions = {
      lu_qingya: "以飞剑为核心，擅长持续点杀。局内可提升弹道数、穿透与大成飞剑威能。",
      shen_lianxing: "以火符引爆妖群，擅长清理密集小怪。",
      ye_hanyan: "凝冰魄迟滞妖潮，适合拖慢高压波次。",
      wen_suyi: "以毒针叠伤，擅长消磨精英与Boss。",
    };
    return descriptions[key] || role.passiveSkill || role.projectileText || `${martialName || "本命法门"}随局内机缘成长，强化该角色的核心攻击方式。`;
  }

  function characterBio(role = {}) {
    const bios = {
      lu_qingya: "玄门外门剑修，性子沉稳，守山之乱中第一个响应宗主调令。虽修为尚浅，却以一手青崖剑诀稳住了山门初阵。",
      shen_lianxing: "内门火修，性情急烈，擅以火符压制妖潮。平日不喜繁礼，临阵却极少退后半步。",
      ye_hanyan: "寒脉出身的冰修，言语不多，出手极稳。她擅以冰魄迟滞妖潮，为宗门争得喘息之机。",
      wen_suyi: "素衣毒修，熟识草木妖瘴。她行事温和，却能在无声处消磨强敌。",
    };
    return bios[role.id] || role.note || role.designValue || role.description || "此门人档案尚未完整录入，后续将随宗门剧情逐步解锁。";
  }

  function starText(level) {
    const value = Math.max(0, Math.min(5, Number(level || 1)));
    return `${"★".repeat(value)}${"☆".repeat(5 - value)}`;
  }

  function renderCharactersPageV2({ DATA, playerProfile, state, helpers }) {
    const roles = valuesOf(DATA.characters || DATA.roles);
    const ownedIds = Array.isArray(playerProfile?.ownedCharacters) ? playerProfile.ownedCharacters : [];
    const ownedSet = new Set(ownedIds);
    const levels = playerProfile?.characterLevels || {};
    if (!roles.length) {
      return `<section class="xm-character-page"><aside class="xm-character-page__sidebar xm-inner-panel"><h2>门人名册</h2><p>暂无门人数据。</p></aside><section class="xm-character-page__center xm-inner-panel"><h2>洞府修行</h2><div class="xm-character-stage"><p>暂无可展示角色。</p></div></section><aside class="xm-character-page__detail xm-inner-panel"><h2>门人卷宗</h2><p>角色数据尚未载入。</p></aside></section>`;
    }

    const preferredRole = roles.find((role) => ownedSet.has(role.id) && /lu_qingya|qingya/i.test(role.id))
      || roles.find((role) => ownedSet.has(role.id))
      || roles[0];
    const currentRole = roles.find((role) => role.id === state?.selectedCharacterId) || preferredRole;
    if (state && currentRole?.id && state.selectedCharacterId !== currentRole.id) state.selectedCharacterId = currentRole.id;

    const owned = ownedSet.has(currentRole.id);
    const currentLevel = helpers?.getCharacterLevel ? helpers.getCharacterLevel(currentRole.id) : levels[currentRole.id] || 1;
    const baseDamage = Number(currentRole.baseDamage ?? currentRole.damage ?? 0);
    const finalDamage = helpers?.getCharacterBaseFinalDamage ? helpers.getCharacterBaseFinalDamage(currentRole) : baseDamage;
    const currentDamage = Number.isFinite(finalDamage) ? Math.round(finalDamage * 10) / 10 : baseDamage || "-";
    const loadoutRoleIds = Array.isArray(state?.loadoutRoleIds) ? state.loadoutRoleIds : [];
    const selectedRoleIds = Array.isArray(state?.selectedRoleIds) ? state.selectedRoleIds : [];
    const deployedRoles = Array.isArray(state?.deployedRoles) ? state.deployedRoles : [];
    const isSelectedForRun = Boolean(state?.selectedRoleId === currentRole.id || loadoutRoleIds.includes(currentRole.id) || selectedRoleIds.includes(currentRole.id) || deployedRoles.some((role) => role.roleId === currentRole.id || role.id === currentRole.id));
    const martialName = martialArtNameForRole(DATA, currentRole);
    const starLevel = currentRole.starLevel ?? playerProfile?.characterStars?.[currentRole.id] ?? 1;

    return `
      <section class="xm-character-page xm-character-page--formal">
        <aside class="xm-character-page__sidebar xm-inner-panel">
          <h2>门人名册</h2>
          <div class="xm-scroll-list xm-character-list">
            ${roles.map((role) => {
              const isOwned = ownedSet.has(role.id);
              const selected = role.id === currentRole.id;
              return `<button type="button" class="xm-character-list-item ${selected ? "xm-character-list-item--selected" : ""} ${isOwned ? "" : "xm-character-list-item--locked"}" data-character-select-id="${safeText(role.id)}"><span class="xm-character-list-item__avatar">${safeText((role.name || "?").slice(0, 1))}</span><span class="xm-character-list-item__body"><strong>${safeText(role.name || role.id || "未命名门人")}</strong><small>${safeText(role.rarity || "-")} · ${safeText(role.school || "宗门")}</small></span><em>${safeText(isOwned ? "已拥有" : "未拥有")}</em></button>`;
            }).join("")}
          </div>
        </aside>
        <section class="xm-character-page__center xm-inner-panel">
          <h2>洞府修行</h2>
          <div class="xm-character-stage">
            <div class="xm-character-stage__portrait"><span>${safeText((currentRole.name || "门").slice(0, 1))}</span></div>
            <div class="xm-character-stage__name">${safeText(currentRole.name || "门人")}</div>
            <div class="xm-character-stage__meta">${safeText(currentRole.rarity || "-")} · ${safeText(currentRole.rankTitle || currentRole.rank || "宗门门人")} · ${safeText(currentRole.school || "宗门")}</div>
            <div class="xm-character-stage__role">${safeText(rolePositionLabel(currentRole))}</div>
            <div class="xm-character-stage__actions">
              ${owned ? `<button type="button" class="primary" data-role-upgrade-id="${safeText(currentRole.id)}">升级角色</button>` : `<button type="button" class="secondary" disabled>尚未拥有</button>`}
            </div>
          </div>
        </section>
        <aside class="xm-character-page__detail xm-inner-panel">
          <h2>门人卷宗</h2>
          <div class="xm-character-detail xm-character-detail--formal">
            <section class="xm-character-detail__section"><h3>角色信息</h3><p><strong>等级</strong><span>Lv.${safeText(owned ? currentLevel : "-")}</span></p><p><strong>星级</strong><span class="xm-character-stars">${safeText(starText(starLevel))}</span></p><p><strong>品质</strong><span>${safeText(currentRole.rarity || "-")}</span></p><p><strong>身份</strong><span>${safeText(currentRole.rankTitle || currentRole.rank || "宗门门人")}</span></p><p><strong>流派</strong><span>${safeText(currentRole.school || "-")}</span></p><p><strong>定位</strong><span>${safeText(rolePositionLabel(currentRole))}</span></p><p><strong>状态</strong><span>${safeText(`${owned ? "已拥有" : "未拥有"} · ${isSelectedForRun ? "已上阵" : "未上阵"}`)}</span></p></section>
            <section class="xm-character-detail__section xm-character-detail__stats"><h3>战斗属性</h3><p><strong>伤害类型</strong><span>${safeText(damageTypeLabel(currentRole))}</span></p><p><strong>攻击</strong><span>${safeText(owned ? currentDamage : currentRole.baseDamage || "-")}</span></p><p><strong>攻速</strong><span>${safeText(currentRole.baseAttackSpeed || currentRole.attackSpeed || "-")}</span></p><p><strong>射程</strong><span>${safeText(currentRole.baseRange || currentRole.range || "-")}</span></p><p><strong>攻击方式</strong><span>${safeText(characterAttackTypeLabel(currentRole.projectileType || currentRole.projectile))}</span></p><p><strong>弹道类型</strong><span>${safeText(characterTrajectoryLabel(currentRole.trajectoryType))}</span></p></section>
            <section class="xm-character-skill-card"><span class="xm-character-skill-icon">${safeText(skillIconText(currentRole))}</span><span class="xm-character-skill-body"><strong>${safeText(martialName)}</strong><em>${safeText(martialTypeText(currentRole))}</em><p>${safeText(martialDescription(currentRole, martialName))}</p></span></section>
            <section class="xm-character-detail__section xm-character-detail__bio"><h3>人物小传</h3><p>${safeText(characterBio(currentRole))}</p><button type="button" class="secondary" data-character-bio-id="${safeText(currentRole.id)}">人物传记</button></section>
          </div>
        </aside>
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
    const nodePositions = [[12, 78], [22, 65], [34, 72], [43, 56], [53, 47], [42, 34], [56, 27], [67, 40], [76, 27], [87, 18]];
    const nodeButton = (node, index) => {
      const status = helpers.getChapterNodeStatus(chapter.chapterId, node.nodeId);
      const isSelected = detailOpen && node.nodeId === selectedNode.nodeId;
      const [x, y] = nodePositions[index] || [12 + index * 8, 64 - (index % 3) * 8];
      return `<button type="button" class="xm-map-node xm-map-node--${safeText(status)} ${node.boss || node.type === "boss" || node.type === "mini_boss" ? "xm-map-node--boss" : ""} ${isSelected ? "xm-map-node--selected" : ""}" style="--node-x: ${x}%; --node-y: ${y}%;" data-adventure-chapter-id="${safeText(chapter.chapterId)}" data-adventure-node-id="${safeText(node.nodeId)}" aria-label="${safeText(`${node.displayId} ${node.name}`)}"><span>${safeText(node.displayId)}</span><strong>${safeText(node.name)}</strong><small>${status === "locked" ? "未解锁" : status === "cleared" ? "已通关" : "可挑战"}${node.boss || node.type === "boss" ? " · Boss" : ""}</small></button>`;
    };
    const enemies = (selectedNode.enemyPreview || []).map((name) => `<span>${safeText(name)}</span>`).join("");
    const rewards = (selectedNode.rewardPreview || []).map((name) => `<span>${safeText(name)}</span>`).join("");
    const locked = selectedStatus === "locked";
    const startLabel = selectedStatus === "cleared" ? "再次挑战" : "开始历练";
    const detail = detailOpen ? `<aside class="xm-node-detail xm-node-detail--drawer ${locked ? "xm-node-detail--locked" : ""}"><button type="button" class="xm-node-detail-close" data-page-action="close-adventure-detail" aria-label="关闭节点详情">×</button><p class="xm-eyebrow">${safeText(selectedNode.displayId)} · ${safeText(nodeTypeLabel(selectedNode.type))}${selectedNode.boss || selectedNode.type === "boss" ? " · Boss" : ""}</p><h2>${safeText(selectedNode.name)}</h2><p>${safeText(locked ? "未解锁，请先完成前置节点。" : selectedNode.description)}</p><blockquote>${safeText(selectedNode.storyText || selectedNode.description)}</blockquote><div class="xm-preview-row"><strong>敌人预览</strong><div>${enemies || "<span>未知妖物</span>"}</div></div><div class="xm-preview-row"><strong>奖励预览</strong><div>${rewards || "<span>灵石</span>"}</div></div><button type="button" class="primary" data-page-action="start-adventure" data-chapter-id="${safeText(chapter.chapterId)}" data-node-id="${safeText(selectedNode.nodeId)}" ${locked ? "disabled" : ""}>${safeText(locked ? "尚未解锁" : startLabel)}</button><button type="button" class="secondary" data-page-action="back-main">返回宗门</button></aside>` : "";
    return `<section class="xm-adventure-map"><header class="xm-adventure-map-header"><div><p class="xm-eyebrow">山门外环历练图</p><h2>${safeText(chapter.name)}</h2></div><p>${safeText(chapter.subtitle)} · 进度 ${clearedCount} / ${chapter.nodes.length}</p></header><aside class="xm-chapter-panel xm-chapter-panel--compact"><strong>${safeText(chapter.theme)}</strong><span>${safeText(chapter.description)}</span></aside><div class="xm-node-route">${chapter.nodes.map(nodeButton).join("")}</div>${detail}</section>`;
  }

  function renderFeaturePage({ elements, page, DATA, playerProfile, state, helpers }) {
    const [title, subtitle] = classifyPage(page);
    elements.featurePageTitle.textContent = title;
    elements.featurePageSubtitle.textContent = subtitle;
    const renderers = {
      CHARACTERS: () => renderCharactersPageV2({ DATA, playerProfile, state, helpers }),
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
    (playerProfile.unlockedFormations || []).forEach((id) => {
      const formation = DATA.formations[id];
      if (!formation) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice choice--formation";
      button.classList.toggle("selected", state.loadoutFormationId === id);
      button.dataset.loadoutFormationId = id;
      button.innerHTML = `<strong>${safeText(formation.name)}</strong><span>${safeText(formation.role || formation.rarity || "护山大阵")}</span><span>${safeText(formation.effectText || formation.description || "")}</span>`;
      elements.loadoutFormationList.appendChild(button);
    });

    elements.loadoutRoleList.innerHTML = "";
    (playerProfile.ownedCharacters || []).forEach((id) => {
      const role = DATA.roles[id];
      if (!role) return;
      const selected = state.loadoutRoleIds.includes(id);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice choice--role";
      button.classList.toggle("selected", selected);
      button.dataset.loadoutRoleId = id;
      button.innerHTML = `<strong>${safeText(role.name)}</strong><span>${safeText(role.rarity)} · ${safeText(role.rankTitle || role.rank || "门人")} · Lv${helpers.getCharacterLevel(id)} · ${safeText(role.trajectoryType || "single")}</span>`;
      elements.loadoutRoleList.appendChild(button);
    });

    const artifactSlots = Math.max(1, playerProfile.maxArtifactSlots || 1);
    const selectedArtifactIds = Array.isArray(state.loadoutArtifactIds) ? state.loadoutArtifactIds : state.loadoutArtifactId ? [state.loadoutArtifactId] : [];
    const activeBonds = helpers.getActiveArtifactBonds ? helpers.getActiveArtifactBonds(selectedArtifactIds) : [];
    elements.loadoutArtifactList.innerHTML = "";
    const artifactSummary = document.createElement("div");
    artifactSummary.className = "unlock-tip loadout-summary";
    artifactSummary.innerHTML = `<strong>法宝位：已选择 ${selectedArtifactIds.length} / ${artifactSlots}</strong><span>当前已选择：${selectedArtifactIds.length ? selectedArtifactIds.map((id) => safeText(DATA.artifacts[id]?.name || id)).join("、") : "无"}</span><span>${activeBonds.length ? `已激活羁绊：${activeBonds.map((bond) => safeText(bond.name)).join("、")}` : "当前未激活法宝羁绊"}</span>`;
    elements.loadoutArtifactList.appendChild(artifactSummary);
    (playerProfile.ownedArtifacts || []).forEach((id) => {
      const artifact = DATA.artifacts[id];
      if (!artifact) return;
      const selected = selectedArtifactIds.includes(id);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice choice--artifact";
      button.classList.toggle("selected", selected);
      button.dataset.loadoutArtifactId = id;
      button.innerHTML = `<strong>${safeText(artifact.name)}${selected ? " · 已选择" : ""}</strong><span>${safeText(artifact.role || "法宝")} · ${safeText(artifact.attackText || artifact.description || "")}</span><span>基础：${safeText(artifact.damage || 0)}伤害 · ${safeText(artifact.cooldown || 0)}秒${artifact.areaRadius ? ` · ${safeText(artifact.areaRadius)}范围` : ""}</span>`;
      elements.loadoutArtifactList.appendChild(button);
    });

    const roleText = `${state.loadoutRoleIds.length}/${playerProfile.maxDeploySlots}`;
    const artifactText = `${selectedArtifactIds.length}/${artifactSlots}`;
    const nextSlot = helpers.getNextDeploySlotUnlock();
    elements.loadoutStatus.textContent = helpers.loadoutReady()
      ? `配置完成：1个阵法，${roleText}名角色，法宝 ${artifactText}。`
      : `配置未完成：需要1个阵法、至少1名角色；法宝可不携带。当前上阵位：${roleText}，法宝位：${artifactText}。`;
    if (nextSlot) elements.loadoutStatus.textContent += ` ${nextSlot.level}级解锁第${nextSlot.deploySlots}个上阵位。`;
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
      button.disabled = state.appState !== deployState || deployed;
      button.innerHTML = `<strong>${safeText(role.name)}</strong><span>${deployed ? "已部署" : "待部署"} · ${safeText(role.rarity)} · ${safeText(role.trajectoryType || "single")}</span>`;
      elements.roleList.appendChild(button);
    });

    elements.artifactList.innerHTML = "";
    (state.selectedArtifactIds || []).forEach((artifactId) => {
      const artifact = DATA.artifacts[artifactId];
      if (!artifact) return;
      const item = document.createElement("div");
      item.className = "choice choice--artifact selected";
      item.innerHTML = `<strong>${safeText(artifact.name)}</strong><span>${safeText(artifact.role || "法宝")} · 战斗中自动触发</span>`;
      elements.artifactList.appendChild(item);
    });
    if (!elements.artifactList.children.length) {
      const item = document.createElement("div");
      item.className = "choice choice--artifact";
      item.innerHTML = "<strong>未携带法宝</strong><span>可直接开始战斗</span>";
      elements.artifactList.appendChild(item);
    }
  }

  function renderHud({ elements, state, DATA, nextLevelRequirement }) {
    const player = state.player || { level: 1, spiritQi: 0 };
    const requiredSpiritQi = nextLevelRequirement();
    elements.waveText.textContent = `妖潮\n第 ${state.wave} 波`;
    elements.hpText.textContent = `护山阵眼\n${Math.max(0, Math.ceil(state.baseHp))} / ${state.baseMaxHp}`;
    elements.lingqiText.textContent = `灵气 Lv.${player.level}\n${Math.floor(player.spiritQi)} / ${requiredSpiritQi}`;
    elements.hpText.parentElement?.style.setProperty("--hud-fill", `${Math.max(0, Math.min(100, (state.baseHp / state.baseMaxHp) * 100))}%`);
    elements.lingqiText.parentElement?.style.setProperty("--hud-fill", `${Math.max(0, Math.min(100, (player.spiritQi / requiredSpiritQi) * 100))}%`);
    const formationName = DATA.formations[state.selectedFormationId]?.name || "";
    const artifactNames = (state.selectedArtifactIds || []).map((id) => DATA.artifacts[id]?.name || id).filter(Boolean);
    const activeBonds = window.XM.Artifacts?.getActiveArtifactBonds ? window.XM.Artifacts.getActiveArtifactBonds(state.selectedArtifactIds || []) : [];
    const statusLines = [
      safeText(state.status),
      formationName ? `当前阵法：${safeText(formationName)}` : "",
      artifactNames.length ? `当前法宝：${artifactNames.map(safeText).join("、")}` : "当前法宝：无",
      activeBonds.length ? `已激活羁绊：${activeBonds.map((bond) => safeText(bond.name)).join("、")}` : "当前未激活法宝羁绊",
    ].filter(Boolean);
    elements.runStatus.innerHTML = statusLines.join("<br>");
    elements.startButton.textContent = state.appState === elements.deployState ? "开始镇守" : "镇守中";
    elements.startButton.disabled = state.appState !== elements.deployState || state.deployedRoles.length !== state.availableRoles.length;
    elements.deployHint.textContent = state.appState === elements.deployState
      ? `已部署 ${state.deployedRoles.length}/${state.availableRoles.length}。只能放在最底部5个护山大阵/阵眼格。`
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
