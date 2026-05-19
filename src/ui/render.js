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
      ARTIFACTS: ["炼器阁", "法宝祭炼、器灵养成、羁绊共鸣。"],
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

  function formationRoleLabel(formation = {}) {
    const raw = `${formation.role || ""} ${formation.effectType || ""} ${formation.description || ""}`;
    if (/heal|回复|回元|护心/i.test(raw)) return "阵眼护持";
    if (/slow|迟|冰/i.test(raw)) return "迟滞妖潮";
    if (/burn|火|焚/i.test(raw)) return "范围灼烧";
    if (/chain|雷|精英|高血/i.test(raw)) return "精英压制";
    if (/damage|镇妖|伤害|压制/i.test(raw)) return "通用压制";
    return formation.role || "护山大阵";
  }

  function formationTriggerLabel(value) {
    return {
      interval: "周期触发",
      cooldown: "周期触发",
      on_damage: "阵眼受击触发",
      near_core: "妖物靠近触发",
      low_hp: "阵眼低血触发",
    }[value] || "特殊触发";
  }

  function formationStageLabel(level = 1) {
    const value = Number(level) || 1;
    if (value >= 7) return "大阵圆满";
    if (value >= 5) return "通玄";
    if (value >= 3) return "稳固";
    return "初启";
  }

  function formationEffectText(formation = {}) {
    const effects = {
      taiyi_zhenyao_array: "周期性激活镇妖阵纹，对靠近阵眼的妖物造成压制与伤害。",
      qinglian_huiyuan_array: "以青莲灵纹护持阵眼，定时回复护山阵眼生命，低血时护持更强。",
      xuanbing_chiyao_array: "凝结玄冰阵纹，迟滞妖潮推进速度，并造成少量冰霜伤害。",
      lihuo_fenyao_array: "引动离火阵纹，对妖物密集区域造成范围伤害与短暂灼烧。",
      leigang_zhuxie_array: "召落雷罡打击高血量妖物，并向附近目标跳跃传导。",
    };
    return effects[formation.id] || formation.effectText || formation.description || "阵纹流转，镇守五方。";
  }

  function formationLore(formation = {}) {
    const lores = {
      taiyi_zhenyao_array: "玄门旧传镇妖阵式之一，阵纹沉稳，善于压制靠近山门的妖物，是护山大阵最基础也最可靠的阵法。",
      qinglian_huiyuan_array: "以青莲灵纹护持阵眼，适合阵眼承压较高时使用。青莲纹开时，阵眼灵光会短暂回稳。",
      xuanbing_chiyao_array: "以寒纹封锁妖气流动，擅长迟滞妖潮推进，使护山大阵获得更多喘息余地。",
      lihuo_fenyao_array: "引离火入阵，专克妖邪污秽，适合清理密集妖潮。阵纹燃起时，山门前会泛出赤金火意。",
      leigang_zhuxie_array: "以雷罡刻入阵盘，专打妖气厚重之物。雷纹落处，常能逼退精英妖物的冲阵之势。",
    };
    return lores[formation.id] || "此阵法来历尚未完整录入，后续将随宗门旧卷与阵枢殿修复逐步解锁。";
  }

  function renderFormationCoreStatus({ coreHp = 0, coreMaxHp = 0, formation = {} }) {
    const ratio = coreMaxHp ? Math.max(0, Math.min(1, coreHp / coreMaxHp)) : 0;
    const bonusText = formation.passiveCoreDamageReduction
      ? `阵眼减伤 ${Math.round(Number(formation.passiveCoreDamageReduction) * 100)}%`
      : formation.spiritQiGainMultiplier
        ? `灵气流转效率 ×${formation.spiritQiGainMultiplier}`
        : "当前阵法加成随战斗配置生效";
    return `<section class="xm-formation-core"><h3>阵眼状态</h3><div class="xm-core-meter"><span style="--core-ratio: ${ratio};"></span></div><p><strong>护山阵眼</strong><span>${safeText(coreHp)} / ${safeText(coreMaxHp)}</span></p><p><strong>当前加成</strong><span>${safeText(bonusText)}</span></p><p><strong>修复状态</strong><span>阵纹修复系统暂未开放</span></p><div class="xm-core-points"><span>东</span><span>西</span><span>南</span><span>北</span><span>中</span></div></section>`;
  }

  function renderFormationCultivation(formation = {}, level = 1) {
    return `<section class="xm-formation-cultivation"><h3>阵法养成</h3><div class="xm-artifact-info-grid"><p><strong>当前等级</strong><span>Lv.${safeText(level)}</span></p><p><strong>当前阶段</strong><span>${safeText(formationStageLabel(level))}</span></p><p><strong>阵纹状态</strong><span>待修复</span></p></div><div class="xm-artifact-materials"><strong>升级所需材料</strong><ul><li>阵纹残片 × 20</li><li>妖核 × 30</li><li>靈石 × 500</li></ul></div><div class="xm-artifact-materials"><strong>材料来源</strong><ul><li>山门外历练</li><li>Boss / 精英妖物掉落</li><li>库藏殿查看材料</li><li>万宝阁兑换</li></ul></div><p class="xm-artifact-muted">材料系统暂未完全开放，当前仅作阵法局外养成预留。</p><div class="xm-artifact-stage__actions"><button type="button" class="secondary" disabled title="材料系统暂未完全开放。">升级阵法</button><button type="button" class="secondary" disabled title="阵纹修复系统暂未开放。">修复阵纹</button><button type="button" class="secondary" disabled title="阵眼加固系统后续开放。">阵眼加固</button></div></section>`;
  }

  function renderFormationsPage({ DATA, playerProfile, state }) {
    const formations = valuesOf(DATA.formations);
    const unlocked = new Set(playerProfile.unlockedFormations || []);
    if (!formations.length) {
      return `<section class="xm-formation-page"><aside class="xm-formation-page__sidebar xm-inner-panel"><h2>阵法名录</h2><p>暂无阵法数据。</p></aside><section class="xm-formation-page__center xm-inner-panel"><h2>护山阵盘</h2><p>暂无可展示阵法。</p></section><aside class="xm-formation-page__detail xm-inner-panel"><h2>阵法卷宗</h2><p>阵法数据尚未载入。</p></aside></section>`;
    }
    const selectedId = state.selectedFormationPageId || state.loadoutFormationId || state.selectedFormationId;
    const current = formations.find((formation) => formation.id === selectedId)
      || formations.find((formation) => unlocked.has(formation.id))
      || formations[0];
    if (state && current?.id && state.selectedFormationPageId !== current.id) state.selectedFormationPageId = current.id;
    const isUnlocked = unlocked.has(current.id);
    const isSelected = state.loadoutFormationId === current.id || state.selectedFormationId === current.id;
    const level = playerProfile.formationLevels?.[current.id] || 1;
    const phase = formationStageLabel(level);
    const coreHp = state.arrayCoreHp ?? state.baseHp ?? DATA.config?.arrayCore?.currentHp ?? DATA.config?.baseHp ?? 0;
    const coreMaxHp = state.arrayCoreMaxHp ?? DATA.config?.arrayCore?.maxHp ?? DATA.config?.baseHp ?? 0;
    return `
      <section class="xm-formation-page">
        <aside class="xm-formation-page__sidebar xm-inner-panel">
          <h2>阵法名录</h2>
          <div class="xm-scroll-list xm-formation-list">
            ${formations.map((formation) => {
              const itemUnlocked = unlocked.has(formation.id);
              const itemSelected = formation.id === current.id;
              const itemCurrent = state.loadoutFormationId === formation.id || state.selectedFormationId === formation.id;
              return `<button type="button" class="xm-formation-list-item ${itemSelected ? "xm-formation-list-item--selected" : ""} ${itemUnlocked ? "" : "xm-formation-list-item--locked"}" data-formation-select-id="${safeText(formation.id)}"><span class="xm-formation-list-item__icon">阵</span><span class="xm-formation-list-item__body"><strong>${safeText(formation.name || formation.id)}</strong><small>${safeText(formationRoleLabel(formation))}</small></span><em>${safeText(itemCurrent ? "当前" : itemUnlocked ? "已解锁" : "未解锁")}</em></button>`;
            }).join("")}
          </div>
        </aside>
        <section class="xm-formation-page__center xm-inner-panel">
          <h2>护山阵盘</h2>
          <div class="xm-formation-stage ${isUnlocked ? "" : "xm-formation-stage--locked"}">
            <div class="xm-array-preview xm-array-preview--large"><span>阵</span><i class="xm-array-eye xm-array-eye--east"></i><i class="xm-array-eye xm-array-eye--west"></i><i class="xm-array-eye xm-array-eye--south"></i><i class="xm-array-eye xm-array-eye--north"></i><i class="xm-array-eye xm-array-eye--center"></i></div>
            <div class="xm-formation-stage__name">${safeText(current.name || "护山大阵")}</div>
            <div class="xm-formation-stage__meta">${safeText(formationRoleLabel(current))} · Lv.${safeText(level)} · ${safeText(phase)}</div>
            <div class="xm-formation-stage__meta">阵眼：${safeText(coreHp)} / ${safeText(coreMaxHp)} · ${safeText(isSelected ? "当前选择" : "未选择")}</div>
            <div class="xm-artifact-stage__actions">
              ${isUnlocked ? `<button type="button" class="primary" data-hub-formation-id="${safeText(current.id)}">${isSelected ? "已设为当前阵法" : "设为当前阵法"}</button>` : `<button type="button" class="secondary" disabled>尚未解锁</button>`}
              <button type="button" class="secondary" disabled title="材料系统暂未完全开放。">升级阵法</button>
              <button type="button" class="secondary" disabled title="阵纹修复系统暂未开放。">修复阵纹</button>
            </div>
          </div>
        </section>
        <aside class="xm-formation-page__detail xm-inner-panel">
          <h2>阵法卷宗</h2>
          <div class="xm-formation-detail">
            <section class="xm-character-detail__section"><h3>阵法信息</h3><p><strong>阵法名</strong><span>${safeText(current.name || "-")}</span></p><p><strong>定位</strong><span>${safeText(formationRoleLabel(current))}</span></p><p><strong>等级</strong><span>Lv.${safeText(level)}</span></p><p><strong>状态</strong><span>${safeText(`${isUnlocked ? "已解锁" : "未解锁"} · ${isSelected ? "当前选择" : "未选择"}`)}</span></p><p><strong>触发方式</strong><span>${safeText(formationTriggerLabel(current.triggerType))}</span></p><p><strong>冷却 / 间隔</strong><span>${safeText(current.triggerInterval || current.cooldown ? `${current.triggerInterval || current.cooldown}秒` : "-")}</span></p></section>
            <section class="xm-character-detail__section"><h3>阵法效果</h3><p>${safeText(formationEffectText(current))}</p></section>
            ${renderFormationCoreStatus({ coreHp, coreMaxHp, formation: current })}
            ${renderFormationCultivation(current, level)}
            <section class="xm-character-detail__section xm-character-detail__bio"><h3>阵法来历</h3><p>${safeText(formationLore(current))}</p></section>
          </div>
        </aside>
      </section>
    `;
  }

  function getMaterialCatalogPreview() {
    return [
      { id: "monster_core", name: "妖核", icon: "核", category: "妖核", rarity: "普通", quantity: 0, key: false, sources: ["妖物掉落", "山门外历练", "精英妖物掉落"], uses: ["法宝升级", "阵法升级", "部分角色突破"], systems: ["炼器阁", "阵枢殿"], description: "妖物体内凝结的妖气核心，虽浊气未散，却可经炼化后作为宗门修复与祭炼材料。" },
      { id: "array_fragment", name: "阵纹残片", icon: "纹", category: "阵纹", rarity: "普通", quantity: 0, key: false, sources: ["破阵妖物", "外阵遗迹", "山门外历练"], uses: ["护山大阵升级", "阵眼修复", "阵纹修补"], systems: ["阵枢殿", "山门外"], description: "从破损阵纹中剥离出的残片，仍残留微弱灵光，可用于修补护山大阵。" },
      { id: "qingming_sword_soul", name: "青冥剑魄", icon: "剑", category: "法宝素材", rarity: "稀有", quantity: 0, key: false, sources: ["剑系节点", "精英掉落", "章节首通奖励"], uses: ["青冥剑匣进阶", "青冥剑匣大成路线"], systems: ["炼器阁", "山门外"], description: "蕴含青冥剑意的碎魄，是祭炼青冥剑匣的重要材料。" },
      { id: "lihuo_sand", name: "离火砂", icon: "火", category: "法宝素材", rarity: "稀有", quantity: 0, key: false, sources: ["火系妖物", "万宝阁兑换，后续开放"], uses: ["离火葫芦进阶", "火系法宝强化"], systems: ["炼器阁"], description: "赤红如砂，遇妖气则温热，可催发离火法宝的真焰。" },
      { id: "xuanbing_jade", name: "玄冰玉髓", icon: "冰", category: "法宝素材", rarity: "稀有", quantity: 0, key: false, sources: ["寒气节点", "Boss 掉落"], uses: ["玄冰玉镜进阶", "冰系法宝强化"], systems: ["炼器阁"], description: "寒玉深处凝成的冰髓，可用于强化冰系法宝与阵纹。" },
      { id: "artifact_spirit_remnant", name: "器灵残识", icon: "灵", category: "法宝素材", rarity: "珍稀", quantity: 0, key: true, sources: ["Boss 掉落", "章节奖励"], uses: ["法宝大成路线解锁"], systems: ["炼器阁", "山门外"], description: "法宝器灵破碎后残留的一缕灵识，是开启大成路线的关键材料。" },
      { id: "break_array_rune", name: "破阵残纹", icon: "阵", category: "阵纹", rarity: "稀有", quantity: 0, key: false, sources: ["噬阵螟", "破阵精英"], uses: ["阵法升级", "破阵飞剑路线"], systems: ["阵枢殿", "炼器阁"], description: "被妖气污染过的阵纹残片，处理后可用于研究破阵与反制之法。" },
      { id: "spirit_stone", name: "靈石", icon: "石", category: "消耗品", rarity: "普通", quantity: 0, key: false, sources: ["历练结算", "章节奖励"], uses: ["抽取", "角色培养", "法宝与阵法养成"], systems: ["祈灵台", "炼器阁", "阵枢殿"], description: "宗门日常修行与祭炼所需的基础灵材，经过净化后可用于多种局外养成。" },
      { id: "return_gate_rune", name: "归门妖纹", icon: "纹", category: "剧情物品", rarity: "剧情", quantity: 0, key: true, sources: ["第一章 Boss", "剧情奖励"], uses: ["主线线索", "镇妖录记录"], systems: ["镇妖录", "山门外"], description: "黑渊门将遗留的古老妖纹，上有“归门”之意，似乎指向护山大阵背后的旧秘。" },
    ];
  }

  function renderBagPage({ state }) {
    const categories = ["全部", "妖核", "阵纹", "法宝素材", "角色素材", "消耗品", "剧情物品"];
    const items = getMaterialCatalogPreview();
    const activeCategory = state.bagCategory || "全部";
    const filtered = activeCategory === "全部" ? items : items.filter((item) => item.category === activeCategory);
    const selected = filtered.find((item) => item.id === state.selectedMaterialId)
      || items.find((item) => item.id === state.selectedMaterialId)
      || filtered[0]
      || items[0];
    if (state && selected?.id) state.selectedMaterialId = selected.id;
    const owned = Number(selected.quantity) > 0;
    return `
      <section class="xm-bag-page">
        <aside class="xm-bag-page__sidebar xm-inner-panel">
          <h2>物资分类</h2>
          <div class="xm-bag-category-list">
            ${categories.map((category) => {
              const count = category === "全部" ? items.length : items.filter((item) => item.category === category).length;
              return `<button type="button" class="xm-bag-category ${activeCategory === category ? "xm-bag-category--selected" : ""}" data-bag-category="${safeText(category)}"><strong>${safeText(category)}</strong><span>${count} 项</span></button>`;
            }).join("")}
          </div>
        </aside>
        <section class="xm-bag-page__main xm-inner-panel">
          <h2>库藏清单</h2>
          <div class="xm-material-grid">
            ${filtered.map((item) => `<button type="button" class="xm-material-card ${item.id === selected.id ? "xm-material-card--selected" : ""} ${item.quantity > 0 ? "" : "xm-material-card--locked"} xm-material-card--${safeText(item.rarity)}" data-material-id="${safeText(item.id)}"><span class="xm-material-card__icon">${safeText(item.icon)}</span><strong>${safeText(item.name)}</strong><small>${safeText(item.rarity)} · ${safeText(item.category)}</small><em>× ${safeText(item.quantity)}</em></button>`).join("")}
          </div>
        </section>
        <aside class="xm-bag-page__detail xm-inner-panel">
          <h2>物资卷宗</h2>
          <div class="xm-material-detail">
            <section class="xm-character-detail__section"><h3>物品信息</h3><p><strong>物品名称</strong><span>${safeText(selected.name)}</span></p><p><strong>分类</strong><span>${safeText(selected.category)}</span></p><p><strong>品质</strong><span>${safeText(selected.rarity)}</span></p><p><strong>当前数量</strong><span>${safeText(selected.quantity)}</span></p><p><strong>获得状态</strong><span>${safeText(owned ? "已获得" : "未获得，可预览")}</span></p><p><strong>关键材料</strong><span>${safeText(selected.key ? "是" : "否")}</span></p></section>
            <section class="xm-character-detail__section"><h3>获取来源</h3><p>${selected.sources.map(safeText).join("、")}</p></section>
            <section class="xm-character-detail__section"><h3>主要用途</h3><p>${selected.uses.map(safeText).join("、")}</p></section>
            <section class="xm-character-detail__section"><h3>相关系统</h3><div class="xm-related-actions"><button type="button" class="secondary" data-bag-link="ARTIFACTS">前往炼器阁</button><button type="button" class="secondary" data-bag-link="FORMATIONS">前往阵枢殿</button><button type="button" class="secondary" data-bag-link="ADVENTURE">前往山门外</button><button type="button" class="secondary" data-bag-link="WANBAO">前往万宝阁</button></div></section>
            <section class="xm-character-detail__section xm-character-detail__bio"><h3>物品说明</h3><p>${safeText(selected.description)}</p></section>
          </div>
        </aside>
      </section>
    `;
  }

  function gachaPoolPreview(DATA, poolId) {
    if (poolId === "artifact") return valuesOf(DATA.artifacts).slice(0, 4).map((item) => item.name);
    return valuesOf(DATA.roles).filter((role) => role.unlockType === "gacha").slice(0, 4).map((item) => item.name);
  }

  function renderGachaResult(result) {
    if (!result) return "";
    if (!result.ok) {
      return `<section class="xm-gacha-result"><h3>祈召结果</h3><p>${safeText(result.reason === "not_enough_spirit_stones" ? "靈石不足，无法祈召。" : "祈召未能完成。")}</p><button type="button" class="secondary" data-gacha-result-close>确认</button></section>`;
    }
    const character = result.character || {};
    const duplicateText = result.isNew ? "新门人已入宗门名册。" : `重复获得，已按现有规则返还资源。`;
    return `<section class="xm-gacha-result"><h3>祈召结果</h3><div class="xm-gacha-result__seal">${safeText(character.name?.slice(0, 1) || "灵")}</div><p><strong>${safeText(character.name || "未知门人")}</strong></p><p>类型：门人 · 品质：${safeText(character.rarity || "-")}</p><p>${safeText(duplicateText)}</p><div class="xm-related-actions"><button type="button" class="secondary" data-gacha-result-close>确认</button><button type="button" class="primary" data-bag-link="CHARACTERS">前往洞府</button></div></section>`;
  }

  function renderGachaPage({ DATA, playerProfile, state }) {
    const pools = [
      { id: "character", name: "门人祈召", desc: "感召宗门门人 / 角色", open: true },
      { id: "artifact", name: "法宝祈召", desc: "感召法宝与器灵", open: false },
      { id: "mixed", name: "混元祈召", desc: "角色与法宝混合池，后续开放", open: false },
      { id: "formation", name: "阵法祈召", desc: "护山阵法相关，后续开放", open: false },
    ];
    const currentPool = pools.find((pool) => pool.id === state.gachaPoolId) || pools[0];
    if (state && state.gachaPoolId !== currentPool.id) state.gachaPoolId = currentPool.id;
    const cost = window.XM.Constants?.GACHA_COST || 0;
    const preview = gachaPoolPreview(DATA, currentPool.id);
    return `
      <section class="xm-gacha-page">
        <aside class="xm-gacha-page__sidebar xm-inner-panel">
          <h2>祈召法坛</h2>
          <div class="xm-gacha-pool-list">
            ${pools.map((pool) => `<button type="button" class="xm-gacha-pool ${pool.id === currentPool.id ? "xm-gacha-pool--selected" : ""} ${pool.open ? "" : "xm-gacha-pool--locked"}" data-gacha-pool="${safeText(pool.id)}"><strong>${safeText(pool.name)}</strong><span>${safeText(pool.open ? pool.desc : `${pool.desc} · 暂未开放`)}</span></button>`).join("")}
          </div>
        </aside>
        <section class="xm-gacha-page__main xm-inner-panel">
          <h2>灵契法坛</h2>
          <div class="xm-gacha-altar"><span>祈</span><i></i></div>
          <h3>${safeText(currentPool.name)}</h3>
          <p>${safeText(currentPool.id === "character" ? "焚香问灵，可感召宗门门人加入山门。" : currentPool.id === "artifact" ? "以灵石启坛，可感召法宝、器灵与镇妖旧物。" : currentPool.desc)}</p>
          <div class="xm-gacha-preview">${preview.map((name) => `<span>${safeText(name)}</span>`).join("") || "<span>卡池预览筹备中</span>"}</div>
          ${renderGachaResult(state.gachaResult)}
        </section>
        <aside class="xm-gacha-page__detail xm-inner-panel">
          <h2>祈灵卷宗</h2>
          <div class="xm-gacha-detail">
            <section class="xm-character-detail__section"><h3>当前资源</h3><p><strong>靈石</strong><span>${safeText(playerProfile.spiritStones || 0)}</span></p><p><strong>祈灵符</strong><span>0 · 暂未开放</span></p><p><strong>单次祈召</strong><span>${safeText(cost)} 靈石</span></p><p><strong>十连祈召</strong><span>暂未开放</span></p></section>
            <section class="xm-character-detail__section"><h3>卡池说明</h3><p>${safeText(currentPool.id === "character" ? "焚香问灵，可感召宗门门人加入山门。" : currentPool.id === "artifact" ? "法宝祈召界面预留中，实际法宝祈召后续开放。" : "该卡池后续开放。")}</p></section>
            <section class="xm-character-detail__section"><h3>祈召概率</h3><p>SR：常见 · SSR：稀有 · UR：极稀有</p><p class="xm-artifact-muted">当前概率沿用现有抽取逻辑，后续将接入正式卡池公告。</p></section>
            <section class="xm-character-detail__section"><h3>祈灵记录</h3><p>今日祈召：0 次</p><p>保底系统：暂未开放</p><p>最近获得：${safeText(state.gachaResult?.character?.name || "暂无记录")}</p></section>
            <section class="xm-character-detail__section"><h3>祈召</h3><div class="xm-artifact-stage__actions"><button type="button" class="primary" data-hub-gacha="single" ${currentPool.open ? "" : "disabled"}>单次祈召</button><button type="button" class="secondary" disabled title="十连祈召暂未开放。">十连祈召</button></div></section>
          </div>
        </aside>
      </section>
    `;
  }

  function enemyTypeLabel(enemy = {}) {
    const raw = `${enemy.type || ""} ${enemy.attackMode || ""} ${enemy.trait || ""}`;
    if (enemy.isBoss || /boss|首领|门将/i.test(raw)) return "首领";
    if (/elite|妖将|精英/i.test(raw)) return "精英";
    if (/ranged|arrow|远程/i.test(raw)) return "远程";
    if (/caster|符|巫|施法/i.test(raw)) return "施法";
    if (/fast|swift|疾|影/i.test(raw)) return "疾行";
    if (/armored|tank|甲|魈/i.test(raw)) return "厚甲";
    if (/breaker|噬阵|破阵|螟/i.test(raw)) return "破阵";
    if (/poison|瘴|毒/i.test(raw)) return "毒瘴";
    return "近战";
  }

  function codexEnemyLore(enemy = {}) {
    const lores = {
      enemy_little_yao: "低阶兽妖，常成群冲阵。鬃毛赤红，遇妖气则狂，虽无灵智，却极易受高阶妖物驱使。",
      redmane_fiend: "低阶兽妖，常成群冲阵。鬃毛赤红，遇妖气则狂，虽无灵智，却极易受高阶妖物驱使。",
      enemy_swift_wolf: "身形瘦长，行动极快，常绕开正面防线直扑阵眼。若不及时处理，容易造成阵眼压力。",
      shadow_hound: "身形瘦长，行动极快，常绕开正面防线直扑阵眼。若不及时处理，容易造成阵眼压力。",
      enemy_armor_beast: "披有妖化骨甲，行动缓慢但极耐击打。适合用持续输出或穿透类攻击压制。",
      ironhide_xiao: "披有妖化骨甲，行动缓慢但极耐击打。适合用持续输出或穿透类攻击压制。",
      rending_claw: "爪尖缠有污浊妖气，擅长撕咬阵纹。其出现意味着妖潮已经开始主动破阵。",
      dark_talisman_shaman: "操使残符与骨铃的妖巫，常在妖群后方施咒，强化其他妖物或干扰护山大阵。",
      miasma_mirage: "死后可残留毒瘴，污染战场。若处理不当，会持续压迫阵眼附近区域。",
      array_devouring_moth: "专门啃噬灵纹的破阵妖种。并非天然妖兽，更像是被人为炼化出的破阵之物。",
      redmane_demon_general: "赤鬃獠群中的妖将，体魄更强，能统御低阶兽妖冲阵。",
      gloom_arrow_hound: "擅长在黑雾中远程袭击阵眼，不急于近身，常与施咒妖物配合。",
      bone_talisman_witch: "比幽符巫更危险的妖术施法者，可短暂压制阵纹运行节律。",
      black_gate_guardian: "妖门裂隙前出现的黑甲妖将。其甲胄上刻有古老门纹，似乎并非普通妖族军卒，而是某种旧封印的守门者。",
    };
    return lores[enemy.id] || enemy.note || "此妖物条目尚在补录，后续将随山门外历练逐步完善。";
  }

  function codexStoryEntries(playerProfile = {}) {
    const flags = playerProfile.chapterProgress?.chapter_1?.storyFlags || {};
    const cleared = playerProfile.chapterProgress?.chapter_1?.clearedNodeIds || [];
    const hasLateProgress = cleared.includes("chapter1_6") || cleared.includes("chapter1_10");
    return [
      { id: "old_array_rubbing", name: "旧阵残拓", type: "剧情线索", source: "第一章·旧阵残碑", unlocked: Boolean(flags.old_array_rubbing || hasLateProgress), description: "外山旧碑上的残缺拓文，记载护山大阵最初并非为护宗而建，而是为了镇住某处“门隙”。" },
      { id: "return_gate_rune", name: "归门妖纹", type: "剧情线索", source: "第一章·妖门初开", unlocked: Boolean(flags.return_gate_rune || cleared.includes("chapter1_10")), description: "黑渊门将死后遗留的古老妖纹。纹形并非杀伐符号，而像是在指向一扇本该归位的旧门。" },
      { id: "seal_gate_mountain", name: "镇门于山", type: "旧碑残文", source: "旧阵残碑", unlocked: Boolean(flags.old_array_rubbing || hasLateProgress), description: "残碑上仅存的四字，似乎揭示了护山大阵真正的用途。" },
      { id: "black_gate_mark", name: "黑渊门纹", type: "妖门线索", source: "黑渊门将", unlocked: Boolean(flags.return_gate_rune || cleared.includes("chapter1_10")), description: "黑甲碎片上的门纹，与玄门现有阵法体系并不完全一致。" },
    ];
  }

  function codexWorldEntries() {
    return [
      { id: "yaomen", name: "妖门", type: "世界秘闻", description: "外山深处裂开的妖气之门，似乎不是单纯入侵通道，而与旧日封印有关。" },
      { id: "array_core", name: "护山大阵", type: "宗门旧制", description: "玄门赖以镇守山门的核心阵法。其真正用途，或许比护宗更古老。" },
      { id: "xuanmen_gate", name: "玄门山门", type: "宗门地标", description: "新任宗主接掌的山门所在，前庭安静，外山却妖气翻涌。" },
      { id: "outer_forbidden", name: "外山禁地", type: "禁地", description: "山门之外的旧禁地，残碑、裂隙与妖潮皆从此处浮现线索。" },
      { id: "return_gate", name: "归门", type: "旧日秘闻", description: "反复出现在妖纹与残碑中的词，似乎指向一扇本该归位的旧门。" },
    ].map((item) => ({ ...item, unlocked: true }));
  }

  function codexEntries(DATA, playerProfile, category) {
    if (category === "门人") return valuesOf(DATA.roles).map((role) => ({ id: role.id, name: role.name, icon: (role.name || "人").slice(0, 1), type: role.school || "门人", rarity: role.rarity || "-", tag: rolePositionLabel(role), unlocked: (playerProfile.ownedCharacters || []).includes(role.id), raw: role }));
    if (category === "法宝") return valuesOf(DATA.artifacts).map((artifact) => ({ id: artifact.id, name: artifact.name, icon: artifactIconText(artifact), type: artifactRoleLabel(artifact), rarity: artifact.rarity || "-", tag: "法宝记录", unlocked: (playerProfile.ownedArtifacts || []).includes(artifact.id), raw: artifact }));
    if (category === "阵法") return valuesOf(DATA.formations).map((formation) => ({ id: formation.id, name: formation.name, icon: "阵", type: formationRoleLabel(formation), rarity: formation.rarity || "-", tag: "护山阵法", unlocked: (playerProfile.unlockedFormations || []).includes(formation.id), raw: formation }));
    if (category === "剧情线索") return codexStoryEntries(playerProfile).map((item) => ({ ...item, icon: "线", rarity: item.unlocked ? "已收录" : "待收录", tag: item.source, raw: item }));
    if (category === "世界秘闻") return codexWorldEntries().map((item) => ({ ...item, icon: "闻", rarity: "秘闻", tag: item.type, raw: item }));
    const chapterOneNames = new Set(["赤鬃獠", "掠影猲", "铁甲魈", "裂爪獠", "幽符巫", "腐瘴蜃", "噬阵螟", "赤鬃妖将", "幽箭猲", "骨符祭巫", "黑渊门将"]);
    return valuesOf(DATA.enemies).filter((enemy) => chapterOneNames.has(enemy.name)).map((enemy) => ({ id: enemy.id, name: enemy.name, icon: (enemy.name || "妖").slice(0, 1), type: enemyTypeLabel(enemy), rarity: enemy.isBoss ? "首领" : enemy.trait || "妖物", tag: enemy.attackMode === "ranged" ? "远程威胁" : enemy.isBoss ? "Boss" : "山门外妖物", unlocked: true, raw: enemy }));
  }

  function codexDetail(entry, category) {
    const item = entry?.raw || {};
    if (!entry) return "<p>暂无条目。</p>";
    if (!entry.unlocked) return `<section class="xm-character-detail__section"><h3>尚未收录</h3><p>该条目尚未在镇妖录中完整显现，请继续推进山门外历练。</p></section>`;
    if (category === "门人") return `<section class="xm-character-detail__section"><h3>门人档案</h3><p><strong>角色名</strong><span>${safeText(item.name)}</span></p><p><strong>品质</strong><span>${safeText(item.rarity || "-")}</span></p><p><strong>身份</strong><span>${safeText(item.rankTitle || item.rank || "宗门门人")}</span></p><p><strong>流派</strong><span>${safeText(item.school || "-")}</span></p><p><strong>定位</strong><span>${safeText(rolePositionLabel(item))}</span></p><p><strong>先天武学</strong><span>${safeText(item.martialArtName || "未载明")}</span></p></section><section class="xm-character-detail__section xm-character-detail__bio"><h3>人物小传</h3><p>${safeText(item.note || item.description || `${item.name || "此门人"}在宗门静修待命，可随宗主出阵守护山门。`)}</p><button type="button" class="secondary" data-codex-link="CHARACTERS" data-codex-target="${safeText(item.id)}">前往洞府</button></section>`;
    if (category === "法宝") return `<section class="xm-character-detail__section"><h3>法宝记录</h3><p><strong>法宝名</strong><span>${safeText(item.name)}</span></p><p><strong>定位</strong><span>${safeText(artifactRoleLabel(item))}</span></p><p><strong>品质</strong><span>${safeText(item.rarity || "-")}</span></p><p><strong>战斗效果</strong><span>${safeText(artifactEffectText(item))}</span></p></section><section class="xm-character-detail__section xm-character-detail__bio"><h3>法宝来历</h3><p>${safeText(artifactLore(item))}</p><button type="button" class="secondary" data-codex-link="ARTIFACTS" data-codex-target="${safeText(item.id)}">前往炼器阁</button></section>`;
    if (category === "阵法") return `<section class="xm-character-detail__section"><h3>阵法卷宗</h3><p><strong>阵法名</strong><span>${safeText(item.name)}</span></p><p><strong>定位</strong><span>${safeText(formationRoleLabel(item))}</span></p><p><strong>触发方式</strong><span>${safeText(formationTriggerLabel(item.triggerType))}</span></p><p><strong>阵法效果</strong><span>${safeText(formationEffectText(item))}</span></p></section><section class="xm-character-detail__section xm-character-detail__bio"><h3>阵法来历</h3><p>${safeText(formationLore(item))}</p><button type="button" class="secondary" data-codex-link="FORMATIONS" data-codex-target="${safeText(item.id)}">前往阵枢殿</button></section>`;
    if (category === "剧情线索" || category === "世界秘闻") return `<section class="xm-character-detail__section"><h3>${safeText(entry.name)}</h3><p><strong>类型</strong><span>${safeText(item.type || entry.type)}</span></p><p><strong>来源</strong><span>${safeText(item.source || "镇妖录")}</span></p></section><section class="xm-character-detail__section xm-character-detail__bio"><h3>线索说明</h3><p>${safeText(item.description || entry.description)}</p><button type="button" class="secondary" data-codex-link="ADVENTURE">前往山门外</button></section>`;
    return `<section class="xm-character-detail__section"><h3>妖物图鉴</h3><p><strong>妖物名称</strong><span>${safeText(item.name)}</span></p><p><strong>妖物类型</strong><span>${safeText(enemyTypeLabel(item))}</span></p><p><strong>威胁等级</strong><span>${safeText(item.isBoss ? "首领" : item.trait || "普通")}</span></p><p><strong>出现场景</strong><span>第一章·妖门初启</span></p><p><strong>攻击方式</strong><span>${safeText(item.attackMode === "ranged" ? "远程" : item.attackMode === "caster" ? "施法" : "近战")}</span></p><p><strong>特性</strong><span>${safeText(item.trait || item.note || "妖潮单位")}</span></p><p><strong>克制建议</strong><span>${safeText(item.isBoss ? "优先使用高爆发与持续压制。" : item.type === "fast" ? "尽早点杀，避免快速压迫阵眼。" : item.type === "armored" ? "使用持续输出或穿透攻击。" : "稳定输出即可压制。")}</span></p></section><section class="xm-character-detail__section xm-character-detail__bio"><h3>妖物志</h3><p>${safeText(codexEnemyLore(item))}</p></section>`;
  }

  function renderCodexPage({ DATA, playerProfile, state }) {
    const categories = ["妖物", "门人", "法宝", "阵法", "剧情线索", "世界秘闻"];
    const activeCategory = state.codexCategory || "妖物";
    const entries = codexEntries(DATA, playerProfile, activeCategory);
    const selected = entries.find((entry) => entry.id === state.selectedCodexEntryId) || entries[0];
    if (state && selected?.id) state.selectedCodexEntryId = selected.id;
    const listTitle = { 妖物: "妖物名录", 门人: "门人档案", 法宝: "法宝记录", 阵法: "阵法卷宗", 剧情线索: "旧事线索", 世界秘闻: "山海秘闻" }[activeCategory] || "卷宗条目";
    return `<section class="xm-codex-page"><aside class="xm-codex-page__sidebar xm-inner-panel"><h2>卷宗分类</h2><div class="xm-codex-category-list">${categories.map((category) => `<button type="button" class="xm-codex-category ${category === activeCategory ? "xm-codex-category--selected" : ""}" data-codex-category="${safeText(category)}"><strong>${safeText(category)}</strong><span>卷宗</span></button>`).join("")}</div></aside><section class="xm-codex-page__main xm-inner-panel"><h2>${safeText(listTitle)}</h2><div class="xm-codex-entry-list">${entries.map((entry) => `<button type="button" class="xm-codex-entry ${entry.id === selected?.id ? "xm-codex-entry--selected" : ""} ${entry.unlocked ? "" : "xm-codex-entry--locked"}" data-codex-entry-id="${safeText(entry.id)}"><span class="xm-codex-entry__icon">${safeText(entry.unlocked ? entry.icon : "？")}</span><strong>${safeText(entry.unlocked ? entry.name : "？？？")}</strong><small>${safeText(entry.type || entry.tag || "-")} · ${safeText(entry.rarity || "-")}</small><em>${safeText(entry.unlocked ? entry.tag || "已收录" : "尚未收录")}</em></button>`).join("")}</div></section><aside class="xm-codex-page__detail xm-inner-panel"><h2>卷宗详情</h2><div class="xm-codex-detail">${codexDetail(selected, activeCategory)}</div></aside></section>`;
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

  function artifactIconText(artifact = {}) {
    const text = `${artifact.id || ""} ${artifact.name || ""} ${artifact.role || ""} ${artifact.type || ""}`;
    if (/lihuo|火/i.test(text)) return "火";
    if (/xuanbing|冰/i.test(text)) return "冰";
    if (/zhenmo|镇|bell/i.test(text)) return "镇";
    if (/lei|雷/i.test(text)) return "雷";
    if (/wandu|毒/i.test(text)) return "毒";
    if (/shanhe|山/i.test(text)) return "山";
    if (/guiyuan|幡|banner/i.test(text)) return "幡";
    if (/jian|鉴|mirror/i.test(text)) return "鉴";
    if (/bag|袋/i.test(text)) return "袋";
    return "剑";
  }

  function artifactRoleLabel(artifact = {}) {
    const raw = `${artifact.role || ""} ${artifact.type || ""} ${artifact.projectileType || ""}`;
    if (/chain|雷/i.test(raw)) return "连锁雷击";
    if (/poison|毒/i.test(raw)) return "持续毒伤";
    if (/frost|slow|冰/i.test(raw)) return "冰霜控制";
    if (/debuff|bell|镇/i.test(raw)) return "削弱压制";
    if (/support|heal|幡|归元/i.test(raw)) return "辅助增益";
    if (/area|crush|火|山/i.test(raw)) return "范围伤害";
    if (/projectile|sword|blade|剑/i.test(raw)) return "弹道输出";
    return "特殊法宝";
  }

  function artifactTargetLabel(value) {
    return {
      nearest: "最近妖物",
      front: "前方妖物",
      random: "随机妖物",
      random_enemies: "随机妖物",
      boss: "精英 / Boss",
      area: "范围区域",
      densest_cluster: "妖物密集区域",
      nearest_to_core: "阵眼前方妖物",
      highest_hp_or_nearest: "高血量或最近妖物",
      multiple_nearest: "多个近处妖物",
      array_core: "护山阵眼",
    }[value] || "战场目标";
  }

  function artifactEffectText(artifact = {}) {
    const effects = {
      qingming_sword_box: "释放剑匣飞剑，对前方妖物造成多段剑气伤害。",
      lihuo_gourd: "喷吐离火，对范围内妖物造成爆发伤害。",
      xuanbing_mirror: "凝出玄冰镜光，迟滞妖物并造成冰霜伤害。",
      zhenmo_bell: "铃音镇魂，使妖物短暂虚弱，降低其推进威胁。",
      leiwen_seal: "召下雷纹法印，对多个目标造成连锁雷击。",
      wandu_orb: "释放毒雾，使妖物持续受到毒伤。",
      shanhe_seal: "重压地脉，对范围妖物造成控制与伤害。",
      guiyuan_banner: "牵引灵气，辅助本局法宝或阵眼续航。",
      zhanyao_blades: "分化斩妖飞刃，向多个妖物发起散射打击。",
    };
    return effects[artifact.id] || artifact.description || artifact.attackText || "该法宝效果尚未完整录入。";
  }

  function artifactLore(artifact = {}) {
    const lores = {
      qingming_sword_box: "玄门旧库中封存的剑匣，内藏数道青冥剑气。传闻此匣曾随前代长老镇守山门外环。",
      lihuo_gourd: "以离火砂炼成的赤纹葫芦，可吞吐炽焰。遇妖气越盛，葫中火意越烈。",
      xuanbing_mirror: "镜面如寒潭凝玉，可映出妖物气机。催动时寒光成阵，迟滞妖潮。",
      zhenmo_bell: "古铜小铃，铃音不高，却能震散妖气。玄门弟子常以此铃镇守夜阵。",
      leiwen_seal: "印上刻有细密雷纹，落印时如天雷入地，最擅破开密集妖群。",
      wandu_orb: "由百毒灵材炼成，珠光幽暗。毒雾散开时，能慢慢蚕食妖物血气。",
      shanhe_seal: "沉重如岳的古印，压下时似山势倾覆。常用于镇压冲阵巨妖。",
      guiyuan_banner: "幡面残旧，却能牵引散落灵气，令法宝之间产生微妙共鸣。",
      zhanyao_blades: "由斩妖残刃重炼而成，刃光分化如雨，适合清理散乱妖群。",
    };
    return lores[artifact.id] || "此法宝来历尚未完整录入，后续将随宗门旧库与炼器剧情逐步解锁。";
  }

  function artifactBondRows(artifact = {}, ownedIds = [], selectedIds = [], DATA = {}) {
    const all = [
      { name: "剑火交鸣", ids: ["qingming_sword_box", "lihuo_gourd"], effect: "飞剑附带离火灼烧。" },
      { name: "冰雷裂阵", ids: ["xuanbing_mirror", "leiwen_seal"], effect: "被冰霜迟滞的妖物更容易受到雷击连锁。" },
      { name: "镇妖封识", ids: ["zhenmo_bell", "zhanyao_blades"], effect: "削弱精英与 Boss 的特殊抗性。" },
      { name: "毒雾困山", ids: ["wandu_orb", "shanhe_seal"], effect: "被山河印压制的妖物持续受到毒伤。" },
      { name: "归元纳器", ids: ["guiyuan_banner"], effect: "提升本局法宝触发效率。", extra: "任意两件法宝" },
    ];
    const related = all.filter((bond) => bond.ids.includes(artifact.id) || (artifact.id && bond.name === "归元纳器"));
    const rows = related.length ? related : all.slice(0, 3);
    return rows.map((bond) => {
      const active = bond.ids.every((id) => selectedIds.includes(id)) && selectedIds.length >= bond.ids.length;
      const owned = bond.ids.every((id) => ownedIds.includes(id));
      const need = [
        ...bond.ids.map((id) => DATA.artifacts?.[id]?.name || id),
        bond.extra,
      ].filter(Boolean).join(" + ");
      return `<article class="xm-artifact-bond ${active ? "xm-artifact-bond--active" : ""}"><strong>${safeText(bond.name)}</strong><span>所需：${safeText(need)}</span><p>${safeText(bond.effect)}</p><em>${active ? "已激活" : owned ? "已拥有条件，需本局携带" : "未激活"}</em></article>`;
    }).join("");
  }

  function artifactRankLabel(level = 1) {
    const value = Number(level) || 1;
    if (value >= 7) return "大成";
    if (value >= 5) return "通玄";
    if (value >= 3) return "小成";
    return "初醒";
  }

  function artifactRouteLabel(artifact = {}) {
    return artifact.evolutionRouteName || artifact.selectedEvolutionRoute || "未定";
  }

  function artifactMaterialPlan(artifact = {}, level = 1) {
    const textById = {
      qingming_sword_box: ["青冥剑魄 × 3", "妖核 × 20", "靈石 × 500"],
      lihuo_gourd: ["离火砂 × 3", "妖核 × 20", "靈石 × 500"],
      xuanbing_mirror: ["玄冰玉屑 × 3", "妖核 × 20", "靈石 × 500"],
      zhenmo_bell: ["镇魔铜铃片 × 3", "妖核 × 24", "靈石 × 600"],
      leiwen_seal: ["雷纹残印 × 3", "妖核 × 24", "靈石 × 600"],
      wandu_orb: ["百毒灵材 × 3", "妖核 × 24", "靈石 × 600"],
      shanhe_seal: ["山河石髓 × 3", "妖核 × 28", "靈石 × 700"],
      guiyuan_banner: ["归元幡纱 × 3", "妖核 × 28", "靈石 × 700"],
      zhanyao_blades: ["照妖镜片 × 3", "妖核 × 28", "靈石 × 700"],
    };
    return {
      materials: textById[artifact.id] || ["法宝精粹 × 3", "妖核 × 20", "靈石 × 500"],
      sources: ["山门外历练", "Boss / 精英妖物掉落", "章节首通奖励", "万宝阁兑换"],
      note: level >= 7 ? "该法宝已达当前预览上限，后续开放重修路线。" : "材料系统暂未完全开放，当前仅作养成预览。",
    };
  }

  function artifactEvolutionBranches(artifact = {}) {
    const byId = {
      qingming_sword_box: [
        { name: "青冥剑阵", type: "常规大成", description: "飞剑数量提升，形成持续剑阵。", requirements: ["法宝 Lv.7", "青冥剑魄 × 8", "妖核 × 60"], materials: ["青冥剑魄 × 8", "妖核 × 60"], status: "暂未开放" },
        { name: "万剑归宗", type: "输出大成", description: "周期性释放大量飞剑，造成爆发伤害。", requirements: ["法宝 Lv.7", "青冥剑魄 × 10", "剑魄精粹 × 2"], materials: ["青冥剑魄 × 10", "剑魄精粹 × 2"], status: "暂未开放" },
        { name: "破阵飞剑", type: "专精大成", description: "提升穿透能力，并优先攻击高威胁妖物。", requirements: ["法宝 Lv.7", "破阵残纹 × 5", "妖核 × 80"], materials: ["破阵残纹 × 5", "妖核 × 80"], status: "暂未开放" },
        { name: "青冥剑灵", type: "羁绊大成", description: "剑匣化生剑灵，可与剑修门人产生额外共鸣。", requirements: ["法宝 Lv.7", "器灵残识 × 1", "青冥剑魄 × 12"], materials: ["器灵残识 × 1", "青冥剑魄 × 12"], status: "暂未开放" },
      ],
      lihuo_gourd: [
        { name: "离火焚妖", type: "常规大成", description: "离火范围扩大，持续灼烧妖群。", requirements: ["法宝 Lv.7", "离火砂 × 8", "妖核 × 60"], materials: ["离火砂 × 8", "妖核 × 60"], status: "暂未开放" },
        { name: "九转火葫", type: "输出大成", description: "周期性喷吐爆裂离火，压制密集妖潮。", requirements: ["法宝 Lv.7", "离火砂 × 10", "火脉精粹 × 2"], materials: ["离火砂 × 10", "火脉精粹 × 2"], status: "暂未开放" },
        { name: "剑火交鸣", type: "羁绊大成", description: "与飞剑类法宝共鸣，使剑气附带离火灼烧。", requirements: ["法宝 Lv.7", "青冥剑匣已拥有", "离火砂 × 12"], materials: ["离火砂 × 12", "妖核 × 80"], status: "暂未开放" },
      ],
      xuanbing_mirror: [
        { name: "玄冰镜阵", type: "控制大成", description: "镜光扩散，显著迟滞妖物推进。", requirements: ["法宝 Lv.7", "玄冰玉屑 × 8", "妖核 × 60"], materials: ["玄冰玉屑 × 8", "妖核 × 60"], status: "暂未开放" },
        { name: "冰雷裂阵", type: "羁绊大成", description: "被冰霜迟滞的妖物更容易受到雷击连锁。", requirements: ["法宝 Lv.7", "雷纹法印已拥有", "玄冰玉屑 × 12"], materials: ["玄冰玉屑 × 12", "雷纹残印 × 4"], status: "暂未开放" },
      ],
    };
    const generic = [
      { name: `${artifact.name || "法宝"}真形`, type: "常规大成", description: "强化基础效果，使法宝在战斗中更稳定触发。", requirements: ["法宝 Lv.7", "法宝精粹 × 8", "妖核 × 60"], materials: ["法宝精粹 × 8", "妖核 × 60"], status: "暂未开放" },
      { name: "器灵显化", type: "专精大成", description: "器灵短暂显化，获得更明确的专精效果。", requirements: ["法宝 Lv.7", "器灵残识 × 1", "法宝精粹 × 10"], materials: ["器灵残识 × 1", "法宝精粹 × 10"], status: "暂未开放" },
      { name: "共鸣归一", type: "羁绊大成", description: "增强与其他法宝的共鸣，预留组合攻击方向。", requirements: ["法宝 Lv.7", "任意两件法宝已拥有", "妖核 × 80"], materials: ["妖核 × 80", "共鸣玉砂 × 4"], status: "暂未开放" },
    ];
    return artifact.evolutionBranches || byId[artifact.id] || generic;
  }

  function renderArtifactCultivation(artifact = {}, level = 1) {
    const rank = artifactRankLabel(level);
    const plan = artifactMaterialPlan(artifact, level);
    return `<section class="xm-artifact-cultivation"><h3>器灵养成</h3><p class="xm-artifact-note">局外永久成长仅在炼器阁进行；战斗中的机缘三选一只影响本局临时强化。</p><div class="xm-artifact-info-grid"><p><strong>当前等级</strong><span>Lv.${safeText(level)}</span></p><p><strong>当前品阶</strong><span>${safeText(rank)}</span></p><p><strong>当前路线</strong><span>${safeText(artifactRouteLabel(artifact))}</span></p></div><div class="xm-artifact-materials"><strong>升级所需材料</strong><ul>${plan.materials.map((item) => `<li>${safeText(item)}</li>`).join("")}</ul></div><div class="xm-artifact-materials"><strong>材料来源</strong><ul>${plan.sources.map((item) => `<li>${safeText(item)}</li>`).join("")}</ul></div><p class="xm-artifact-muted">${safeText(plan.note)}</p><div class="xm-artifact-stage__actions"><button type="button" class="secondary" disabled title="材料系统暂未完全开放。">升级法宝</button><button type="button" class="secondary" disabled title="材料系统暂未完全开放。">进阶法宝</button><button type="button" class="secondary" disabled title="多路线大成系统后续开放。">选择大成路线</button><button type="button" class="secondary" disabled title="重修路线后续开放。">重修路线</button></div></section>`;
  }

  function renderArtifactBranches(artifact = {}) {
    return `<section class="xm-artifact-branches"><h3>大成路线</h3><p class="xm-artifact-note">大成方向属于局外永久选择，后续在炼器阁中消耗材料解锁，不会进入战斗中的三选一。</p><div class="xm-artifact-branch-list">${artifactEvolutionBranches(artifact).map((branch) => `<article class="xm-artifact-branch"><header><strong>${safeText(branch.name)}</strong><em>${safeText(branch.type)}</em></header><p>${safeText(branch.description)}</p><div><span>解锁条件：${safeText((branch.requirements || []).join("、"))}</span><span>所需材料：${safeText((branch.materials || []).join("、"))}</span><span>状态：${safeText(branch.status || "暂未开放")}</span></div></article>`).join("")}</div></section>`;
  }

  function renderArtifactsPageV2({ DATA, playerProfile, state }) {
    const artifacts = valuesOf(DATA.artifacts);
    const ownedIds = Array.isArray(playerProfile?.ownedArtifacts) ? playerProfile.ownedArtifacts : [];
    const ownedSet = new Set(ownedIds);
    if (!artifacts.length) {
      return `<section class="xm-artifact-page"><aside class="xm-artifact-page__sidebar xm-inner-panel"><h2>法宝名录</h2><p>暂无法宝数据。</p></aside><section class="xm-artifact-page__center xm-inner-panel"><h2>器灵祭台</h2><p>暂无可展示法宝。</p></section><aside class="xm-artifact-page__detail xm-inner-panel"><h2>法宝卷宗</h2><p>法宝数据尚未载入。</p></aside></section>`;
    }
    const selectedIds = Array.isArray(state?.loadoutArtifactIds) ? state.loadoutArtifactIds : [];
    const preferred = artifacts.find((item) => ownedSet.has(item.id) && /qingming|sword_box/i.test(item.id))
      || artifacts.find((item) => ownedSet.has(item.id))
      || artifacts[0];
    const current = artifacts.find((item) => item.id === state?.selectedArtifactId) || preferred;
    if (state && current?.id && state.selectedArtifactId !== current.id) state.selectedArtifactId = current.id;
    const owned = ownedSet.has(current.id);
    const carried = selectedIds.includes(current.id);
    const level = playerProfile?.artifactLevels?.[current.id] || 1;
    const rank = artifactRankLabel(level);
    const route = artifactRouteLabel(current);

    return `
      <section class="xm-artifact-page">
        <aside class="xm-artifact-page__sidebar xm-inner-panel">
          <h2>法宝名录</h2>
          <div class="xm-scroll-list xm-artifact-list">
            ${artifacts.map((artifact) => {
              const isOwned = ownedSet.has(artifact.id);
              const selected = artifact.id === current.id;
              return `<button type="button" class="xm-artifact-list-item ${selected ? "xm-artifact-list-item--selected" : ""} ${isOwned ? "" : "xm-artifact-list-item--locked"}" data-artifact-select-id="${safeText(artifact.id)}"><span class="xm-artifact-list-item__icon">${safeText(artifactIconText(artifact))}</span><span class="xm-artifact-list-item__body"><strong>${safeText(artifact.name || artifact.id)}</strong><small>${safeText(artifact.rarity || "-")} · ${safeText(artifactRoleLabel(artifact))}</small></span><em>${safeText(isOwned ? "已拥有" : "未拥有")}</em></button>`;
            }).join("")}
          </div>
        </aside>
        <section class="xm-artifact-page__center xm-inner-panel">
          <h2>器灵祭台</h2>
          <div class="xm-artifact-stage ${owned ? "" : "xm-artifact-stage--locked"}">
            <div class="xm-artifact-stage__sigil"><span>${safeText(artifactIconText(current))}</span></div>
            <div class="xm-artifact-stage__name">${safeText(current.name || "法宝")}</div>
            <div class="xm-artifact-stage__meta">${safeText(current.rarity || "-")} · ${safeText(artifactRoleLabel(current))}</div>
            <div class="xm-artifact-stage__level">Lv.${safeText(level)} · ${safeText(rank)} · ${safeText(carried ? "本局携带" : "未携带")}</div>
            <div class="xm-artifact-stage__level">当前路线：${safeText(route)}</div>
            <div class="xm-artifact-stage__actions">
              ${owned ? `<button type="button" class="primary" data-artifact-toggle-id="${safeText(current.id)}">${carried ? "卸下法宝" : "携带法宝"}</button>` : `<button type="button" class="secondary" disabled>尚未拥有</button>`}
              <button type="button" class="secondary" disabled title="材料系统暂未完全开放。">升级法宝</button>
              <button type="button" class="secondary" disabled title="材料系统暂未完全开放。">进阶法宝</button>
              <button type="button" class="secondary" disabled title="多路线大成系统后续开放。">选择大成路线</button>
              <button type="button" class="secondary" disabled>查看羁绊</button>
            </div>
          </div>
        </section>
        <aside class="xm-artifact-page__detail xm-inner-panel">
          <h2>法宝卷宗</h2>
          <div class="xm-artifact-detail">
            <section class="xm-character-detail__section"><h3>法宝信息</h3><p><strong>名称</strong><span>${safeText(current.name || "-")}</span></p><p><strong>品质</strong><span>${safeText(current.rarity || "-")}</span></p><p><strong>定位</strong><span>${safeText(artifactRoleLabel(current))}</span></p><p><strong>等级</strong><span>Lv.${safeText(level)}</span></p><p><strong>品阶</strong><span>${safeText(rank)}</span></p><p><strong>当前路线</strong><span>${safeText(route)}</span></p><p><strong>状态</strong><span>${safeText(`${owned ? "已拥有" : "未拥有"} · ${carried ? "本局携带" : "未携带"}`)}</span></p><p><strong>冷却</strong><span>${safeText(current.cooldown ? `${current.cooldown}秒` : "-")}</span></p><p><strong>目标</strong><span>${safeText(artifactTargetLabel(current.targetRule))}</span></p></section>
            <section class="xm-character-detail__section"><h3>战斗效果</h3><p>${safeText(artifactEffectText(current))}</p><p class="xm-artifact-muted">此处展示进入战斗后的自动生效效果；本局机缘强化仍在战斗中通过三选一临时获得。</p></section>
            ${renderArtifactCultivation(current, level)}
            ${renderArtifactBranches(current)}
            <section class="xm-artifact-bonds"><h3>法宝羁绊</h3>${artifactBondRows(current, ownedIds, selectedIds, DATA)}</section>
            <section class="xm-character-detail__section xm-character-detail__bio"><h3>法宝来历</h3><p>${safeText(artifactLore(current))}</p></section>
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
    const nodePositions = [[18, 72], [27, 64], [36, 57], [45, 50], [53, 43], [60, 36], [67, 30], [74, 25], [82, 22], [89, 18]];
    const statusLabel = (status) => ({ locked: "未解锁", cleared: "已通关", available: "可挑战" }[status] || "未知");
    const routePoints = chapter.nodes.map((node, index) => {
      const [x, y] = nodePositions[index] || [18 + index * 7, 72 - index * 6];
      const status = helpers.getChapterNodeStatus(chapter.chapterId, node.nodeId);
      return { x, y, status };
    });
    const routeSegments = routePoints.slice(0, -1).map((point, index) => {
      const next = routePoints[index + 1];
      const active = point.status === "cleared" && (next.status === "cleared" || next.status === "available");
      const current = point.status === "cleared" && next.status === "available";
      return `<line class="xm-map-route-line ${active ? "xm-map-route-line--open" : "xm-map-route-line--locked"} ${current ? "xm-map-route-line--current" : ""}" x1="${point.x}" y1="${point.y}" x2="${next.x}" y2="${next.y}" />`;
    }).join("");
    const nodeButton = (node, index) => {
      const status = helpers.getChapterNodeStatus(chapter.chapterId, node.nodeId);
      const isSelected = detailOpen && node.nodeId === selectedNode.nodeId;
      const [x, y] = nodePositions[index] || [18 + index * 7, 72 - index * 6];
      const boss = node.boss || node.type === "boss" || node.type === "mini_boss";
      return `<button type="button" class="xm-map-node xm-map-node--${safeText(status)} ${boss ? "xm-map-node--boss" : ""} ${isSelected ? "xm-map-node--selected" : ""}" style="--node-x: ${x}%; --node-y: ${y}%;" data-adventure-chapter-id="${safeText(chapter.chapterId)}" data-adventure-node-id="${safeText(node.nodeId)}" aria-label="${safeText(`${node.displayId} ${node.name}`)}" title="${safeText(`${node.displayId} ${node.name}`)}"><span>${safeText(node.displayId)}</span><strong>${safeText(node.name)}</strong><small>${safeText(statusLabel(status))}${boss ? " · Boss" : ""}</small></button>`;
    };
    const enemies = (selectedNode.enemyPreview || []).map((name) => `<span>${safeText(name)}</span>`).join("");
    const rewards = (selectedNode.rewardPreview || []).map((name) => `<span>${safeText(name)}</span>`).join("");
    const locked = selectedStatus === "locked";
    const startLabel = selectedStatus === "cleared" ? "再次挑战" : "开始历练";
    const detail = detailOpen ? `<aside class="xm-node-detail xm-node-detail--drawer ${locked ? "xm-node-detail--locked" : ""}"><button type="button" class="xm-node-detail-close" data-page-action="close-adventure-detail" aria-label="关闭节点详情">×</button><p class="xm-eyebrow">${safeText(selectedNode.displayId)} · ${safeText(nodeTypeLabel(selectedNode.type))}${selectedNode.boss || selectedNode.type === "boss" ? " · Boss" : ""}</p><h2>${safeText(selectedNode.name)}</h2><p>${safeText(locked ? "未解锁，请先完成前置节点。" : selectedNode.description)}</p><blockquote>${safeText(selectedNode.storyText || selectedNode.description)}</blockquote><div class="xm-preview-row"><strong>节点状态</strong><div><span>${safeText(statusLabel(selectedStatus))}</span></div></div><div class="xm-preview-row"><strong>敌人预览</strong><div>${enemies || "<span>未知妖物</span>"}</div></div><div class="xm-preview-row"><strong>奖励预览</strong><div>${rewards || "<span>灵石</span>"}</div></div><button type="button" class="primary" data-page-action="start-adventure" data-chapter-id="${safeText(chapter.chapterId)}" data-node-id="${safeText(selectedNode.nodeId)}" ${locked ? "disabled" : ""}>${safeText(locked ? "请先完成前置节点" : startLabel)}</button><button type="button" class="secondary" data-page-action="back-main">返回宗门</button></aside>` : "";
    return `<section class="xm-adventure-map"><div class="xm-adventure-map-frame"><header class="xm-adventure-map-header"><div><p class="xm-eyebrow">山门外</p><h2>${safeText(chapter.name)}</h2></div><p>${safeText(chapter.subtitle)} · 进度 ${clearedCount} / ${chapter.nodes.length}</p></header><aside class="xm-chapter-panel xm-chapter-panel--compact"><strong>${safeText(chapter.theme)}</strong><span>${safeText(chapter.description)}</span></aside><svg class="xm-map-route-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${routeSegments}</svg><div class="xm-node-route">${chapter.nodes.map(nodeButton).join("")}</div>${detail}</div></section>`;
  }

  function renderFeaturePage({ elements, page, DATA, playerProfile, state, helpers }) {
    const [title, subtitle] = classifyPage(page);
    elements.featurePageTitle.textContent = title;
    elements.featurePageSubtitle.textContent = subtitle;
    const renderers = {
      CHARACTERS: () => renderCharactersPageV2({ DATA, playerProfile, state, helpers }),
      ARTIFACTS: () => renderArtifactsPageV2({ DATA, playerProfile, state }),
      FORMATIONS: () => renderFormationsPage({ DATA, playerProfile, state }),
      BAG: () => renderBagPage({ state }),
      GACHA: () => renderGachaPage({ DATA, playerProfile, state }),
      CODEX: () => renderCodexPage({ DATA, playerProfile, state }),
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

  function xmBattleModeLabel(mode) {
    return {
      guard: "守山模式",
      expedition: "推进模式",
      encounter: "遭遇战",
      boss: "讨伐战",
      trial: "宗门试炼",
    }[mode || "guard"] || "守山模式";
  }

  function xmFormationSlotEffects(formationId) {
    const common = [
      { id: "slot_1", name: "前锋位", bonus: "攻击 +8%" },
      { id: "slot_2", name: "左辅位", bonus: "射程 +8%" },
      { id: "slot_3", name: "中枢位", bonus: "阵法效果 +10%" },
      { id: "slot_4", name: "右弼位", bonus: "攻速 +6%" },
      { id: "slot_5", name: "后阵位", bonus: "法宝冷却 -5%" },
    ];
    const presets = {
      qinglian_huiyuan_array: ["阵位护持", "回复效果提升", "阵眼韧性提升", "控制效果提升", "法宝触发效率提升"],
      xuanbing_chiyao_array: ["冰霜伤害提升", "减速效果提升", "控制时间提升", "射程提升", "冷却缩短"],
      lihuo_fenyao_array: ["火焰伤害提升", "范围伤害提升", "阵法伤害提升", "灼烧效果提升", "法宝伤害提升"],
    };
    const bonus = presets[formationId];
    return bonus ? common.map((slot, index) => ({ ...slot, bonus: bonus[index] || slot.bonus })) : common;
  }

  function xmCurrentAdventureNode(DATA, state) {
    const chapterId = state.currentChapterId || state.selectedAdventureChapterId || "chapter_1";
    const chapter = DATA.chapters?.[chapterId] || DATA.chapters?.chapter_1;
    const nodeId = state.currentNodeId || state.selectedAdventureNodeId || chapter?.nodes?.[0]?.nodeId;
    const node = chapter?.nodes?.find((item) => item.nodeId === nodeId) || chapter?.nodes?.[0] || null;
    return { chapter, node };
  }

  function renderLoadout({ elements, state, playerProfile, DATA, helpers }) {
    const { chapter, node } = xmCurrentAdventureNode(DATA, state);
    const mode = state.battleMode || node?.battleMode || "guard";
    const selectedFormation = DATA.formations[state.loadoutFormationId] || DATA.formations[playerProfile.unlockedFormations?.[0]] || {};
    const enemies = (node?.enemyPreview || []).map((name) => `<span>${safeText(name)}</span>`).join("") || "<span>未知妖物</span>";
    const rewards = (node?.rewardPreview || []).map((name) => `<span>${safeText(name)}</span>`).join("") || "<span>灵石</span>";
    const slotPreview = xmFormationSlotEffects(selectedFormation.id).map((slot) => `<li><strong>${safeText(slot.name)}</strong><span>${safeText(slot.bonus)}</span></li>`).join("");

    elements.loadoutFormationList.innerHTML = `
      <article class="xm-loadout-brief">
        <p class="xm-eyebrow">${safeText(chapter?.name || "山门外历练")}</p>
        <h3>${safeText(node ? `${node.displayId} ${node.name}` : "未选择节点")}</h3>
        <p>${safeText(node?.description || "山门外妖气渐盛，需先完成战前整备。")}</p>
        <div class="xm-loadout-tags"><span>${safeText(xmBattleModeLabel(mode))}</span></div>
        <div class="xm-preview-row"><strong>敌人预览</strong><div>${enemies}</div></div>
        <div class="xm-preview-row"><strong>奖励预览</strong><div>${rewards}</div></div>
      </article>
    `;

    const roleItems = (playerProfile.ownedCharacters || []).map((id) => {
      const role = DATA.roles[id];
      if (!role) return "";
      const selected = state.loadoutRoleIds.includes(id);
      return `<button type="button" class="choice choice--role ${selected ? "selected" : ""}" data-loadout-role-id="${safeText(id)}"><strong>${safeText(role.name)}${selected ? " · 已出战" : ""}</strong><span>${safeText(role.rarity)} · ${safeText(role.rankTitle || role.rank || "门人")} · Lv${helpers.getCharacterLevel(id)} · ${safeText(role.role || role.school || "守阵")}</span></button>`;
    }).join("");
    const artifactSlots = Math.max(1, playerProfile.maxArtifactSlots || 1);
    const selectedArtifactIds = Array.isArray(state.loadoutArtifactIds) ? state.loadoutArtifactIds : state.loadoutArtifactId ? [state.loadoutArtifactId] : [];
    const artifactItems = (playerProfile.ownedArtifacts || []).map((id) => {
      const artifact = DATA.artifacts[id];
      if (!artifact) return "";
      const selected = selectedArtifactIds.includes(id);
      return `<button type="button" class="choice choice--artifact ${selected ? "selected" : ""}" data-loadout-artifact-id="${safeText(id)}"><strong>${safeText(artifact.name)}${selected ? " · 已携带" : ""}</strong><span>${safeText(artifact.role || "法宝")} · ${safeText(artifact.attackText || artifact.description || "战斗中自动触发")}</span></button>`;
    }).join("");
    elements.loadoutRoleList.innerHTML = `
      <section class="xm-loadout-section"><h3>出战门人 <small>${state.loadoutRoleIds.length}/${playerProfile.maxDeploySlots}</small></h3><div class="xm-loadout-stack">${roleItems || "<p>暂无可出战门人。</p>"}</div></section>
      <section class="xm-loadout-section"><h3>携带法宝 <small>${selectedArtifactIds.length}/${artifactSlots}</small></h3><div class="xm-loadout-stack">${artifactItems || "<p>暂无可携带法宝。</p>"}</div></section>
    `;

    const formationButtons = (playerProfile.unlockedFormations || []).map((id) => {
      const formation = DATA.formations[id];
      if (!formation) return "";
      return `<button type="button" class="choice choice--formation ${state.loadoutFormationId === id ? "selected" : ""}" data-loadout-formation-id="${safeText(id)}"><strong>${safeText(formation.name)}</strong><span>${safeText(formation.role || formation.rarity || "护山阵法")}</span></button>`;
    }).join("");
    const activeBonds = helpers.getActiveArtifactBonds ? helpers.getActiveArtifactBonds(selectedArtifactIds) : [];
    elements.loadoutArtifactList.innerHTML = `
      <article class="xm-loadout-formation">
        <h3>${safeText(selectedFormation.name || "未选择阵法")}</h3>
        <p>${safeText(selectedFormation.effectText || selectedFormation.description || "选择阵法后，将在下一步布置五方阵位。")}</p>
        <div class="xm-loadout-stack">${formationButtons}</div>
        <h4>五方阵位预览</h4>
        <ul class="xm-slot-preview">${slotPreview}</ul>
        <p class="hint">${activeBonds.length ? `法宝羁绊：${activeBonds.map((bond) => safeText(bond.name)).join("、")}` : "阵位加成当前仅作展示，后续接入战斗数值系统。"}</p>
      </article>
    `;

    const roleText = `${state.loadoutRoleIds.length}/${playerProfile.maxDeploySlots}`;
    const artifactText = `${selectedArtifactIds.length}/${artifactSlots}`;
    const nextSlot = helpers.getNextDeploySlotUnlock();
    elements.loadoutStatus.textContent = helpers.loadoutReady()
      ? `整备完成：${xmBattleModeLabel(mode)}，${roleText}名门人，法宝 ${artifactText}。下一步进入阵法配置。`
      : `整备未完成：需要 1 个阵法、至少 1 名门人；法宝可不携带。当前出战位：${roleText}，法宝位：${artifactText}。`;
    if (nextSlot) elements.loadoutStatus.textContent += ` ${nextSlot.level}级解锁第${nextSlot.deploySlots}个出战位。`;
    elements.enterDeployButton.disabled = !helpers.loadoutReady();
  }

  function renderSetupLists({ elements, state, DATA, deployState }) {
    elements.formationList.innerHTML = "";
    if (state.selectedFormationId) {
      const formation = DATA.formations[state.selectedFormationId];
      if (formation) {
        const item = document.createElement("div");
        item.className = "choice choice--formation selected";
        item.innerHTML = `<strong>${safeText(formation.name)}</strong><span>${safeText(formation.role || "当前阵法")}</span><span>${safeText(formation.effectText || formation.description || "")}</span>`;
        elements.formationList.appendChild(item);
      }
    }

    elements.roleList.innerHTML = "";
    state.availableRoles.forEach((roleId) => {
      const role = DATA.roles[roleId];
      if (!role) return;
      const deployedSlot = state.deployedRoles.find((item) => item.roleId === roleId);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice choice--role";
      button.classList.toggle("selected", roleId === state.selectedRoleId);
      button.classList.toggle("deployed", Boolean(deployedSlot));
      button.dataset.setupRoleId = roleId;
      button.disabled = state.appState !== deployState;
      button.innerHTML = `<strong>${safeText(role.name)}</strong><span>${deployedSlot ? `已入阵 · 阵位 ${deployedSlot.col + 1}` : "待入阵"} · ${safeText(role.rarity)} · ${safeText(role.role || role.school || "门人")}</span>`;
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
      item.innerHTML = "<strong>未携带法宝</strong><span>可直接开阵迎敌</span>";
      elements.artifactList.appendChild(item);
    }

    if (elements.deployBoard) {
      const formation = DATA.formations[state.selectedFormationId] || {};
      const slots = xmFormationSlotEffects(formation.id);
      const slotButtons = slots.map((slot, index) => {
        const role = state.deployedRoles.find((item) => item.col === index);
        const roleConfig = role ? DATA.roles[role.roleId] : null;
        return `<button type="button" class="xm-formation-slot xm-formation-slot--${index + 1} ${role ? "xm-formation-slot--filled" : ""}" data-formation-slot-index="${index}" ${state.appState !== deployState ? "disabled" : ""}>
          <span>${safeText(slot.name)}</span>
          <strong>${safeText(roleConfig?.name || "空位")}</strong>
          <small>${safeText(slot.bonus)}</small>
        </button>`;
      }).join("");
      elements.deployBoard.innerHTML = `
        <div class="xm-deploy-board__header">
          <p class="xm-eyebrow">阵法配置</p>
          <h2>${safeText(formation.name || "五方阵位")}</h2>
          <p>${safeText(xmBattleModeLabel(state.battleMode || "guard"))}下，五方阵位会映射为护山大阵前的五个防守位置。</p>
        </div>
        <div class="xm-formation-disc">
          <div class="xm-formation-disc__core">阵核</div>
          ${slotButtons}
        </div>
        <p class="xm-deploy-note">阵位加成当前仅作 UI 展示，后续可接入战斗数值系统；未来推进模式可映射为队伍行进阵型。</p>
      `;
      elements.deployBoard.classList.toggle("hidden", state.appState !== deployState);
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
    elements.startButton.textContent = state.appState === elements.deployState ? "开阵迎敌" : "迎敌中";
    elements.startButton.disabled = state.appState !== elements.deployState || state.deployedRoles.length < 1;
    elements.deployHint.textContent = state.appState === elements.deployState
      ? `已入阵 ${state.deployedRoles.length}/${state.availableRoles.length}。点击门人后选择五方阵位；同一门人不可重复入阵。`
      : "迎敌中门人会自动攻击，不能中途调整阵位。";
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
