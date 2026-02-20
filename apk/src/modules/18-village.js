/**
 * 18-village.js - 村庄系统核心逻辑
 * v1.8.0 实现村庄基础框架
 */

// ========== 村庄风格定义 ==========
const VILLAGE_STYLES = {
  forest: {
    buildingColors: { wall: '#8B6914', roof: '#2E7D32', door: '#5D4037' },
    groundColor: '#6D4C41',
    decorations: ['well', 'farm', 'fence', 'flower_pot'],
    specialBuilding: 'library'
  },
  snow: {
    buildingColors: { wall: '#ECEFF1', roof: '#1565C0', door: '#37474F' },
    groundColor: '#B0BEC5',
    decorations: ['snowman', 'ice_lamp', 'pine_fence'],
    specialBuilding: 'hot_spring'
  },
  desert: {
    buildingColors: { wall: '#D7CCC8', roof: '#FF8F00', door: '#4E342E' },
    groundColor: '#BCAAA4',
    decorations: ['cactus_pot', 'sand_lamp', 'oasis'],
    specialBuilding: 'water_station'
  },
  mountain: {
    buildingColors: { wall: '#78909C', roof: '#455A64', door: '#37474F' },
    groundColor: '#607D8B',
    decorations: ['anvil', 'stone_lamp', 'mine_cart'],
    specialBuilding: 'blacksmith'
  },
  ocean: {
    buildingColors: { wall: '#4FC3F7', roof: '#0277BD', door: '#01579B' },
    groundColor: '#4DB6AC',
    decorations: ['anchor', 'barrel', 'fishing_rod'],
    specialBuilding: 'lighthouse'
  },
  nether: {
    buildingColors: { wall: '#4A148C', roof: '#880E4F', door: '#311B92' },
    groundColor: '#6A1B9A',
    decorations: ['soul_lantern', 'nether_wart_pot', 'chain'],
    specialBuilding: 'brewing_stand'
  }
};

const DEFAULT_VILLAGE_CONFIG = {
  enabled: true,
  spawnScoreInterval: 500,
  villageWidth: 800,
  safeZone: true,
  restHealFull: true,
  challengeQuestionCount: 3,
  minSpawnScoreGap: 900,
  minSpawnDistancePx: 2600,
  minBiomeTransitionsBetweenVillages: 2,
  minBiomeStayScoreForVillage: 120,
  challengeReward: {
    perfect: { score: 100, diamonds: 1 },
    partial: { score: 50, diamonds: 0 }
  },
  npcSpeed: 0.3,
  npcGreetDistance: 80,
  maxActiveVillages: 3,
  buildings: {
    bed_house: { w: 80, h: 60, offset: 100 },
    word_house: { w: 100, h: 80, offset: 300 },
    trader_house: { w: 72, h: 62, offset: 550 },
    special: { w: 80, h: 60, offset: 700 }
  },
  biomeWords: {
    forest: ["tree", "leaf", "bird", "flower", "grass", "wood", "deer", "owl"],
    snow: ["snow", "ice", "cold", "coat", "hat", "scarf", "ski", "sled"],
    desert: ["sand", "sun", "hot", "water", "cactus", "camel", "oasis", "dry"],
    mountain: ["rock", "iron", "gold", "pick", "cave", "stone", "gem", "ore"],
    ocean: ["fish", "wave", "boat", "shell", "whale", "coral", "swim", "sea"],
    nether: ["fire", "red", "lava", "dark", "flame", "ash", "smoke", "glow"]
  }
};

function getVillageConfig() {
  const cfg = (villageConfig && typeof villageConfig === "object") ? villageConfig : {};
  return {
    ...DEFAULT_VILLAGE_CONFIG,
    ...cfg,
    challengeReward: {
      ...DEFAULT_VILLAGE_CONFIG.challengeReward,
      ...(cfg.challengeReward || {}),
      perfect: {
        ...DEFAULT_VILLAGE_CONFIG.challengeReward.perfect,
        ...(cfg.challengeReward?.perfect || {})
      },
      partial: {
        ...DEFAULT_VILLAGE_CONFIG.challengeReward.partial,
        ...(cfg.challengeReward?.partial || {})
      }
    },
    buildings: {
      ...DEFAULT_VILLAGE_CONFIG.buildings,
      ...(cfg.buildings || {})
    },
    biomeWords: {
      ...DEFAULT_VILLAGE_CONFIG.biomeWords,
      ...(cfg.biomeWords || {})
    }
  };
}

// ========== 加载配置 ==========
function loadVillageConfig() {
  // 从 config/village.json 加载，失败时使用默认值
  // 在 17-bootstrap.js 的 loadAllConfigs() 中调用
  fetch('config/village.json')
    .then(r => r.json())
    .then(data => {
      villageConfig = {
        ...DEFAULT_VILLAGE_CONFIG,
        ...(data || {}),
        buildings: {
          ...DEFAULT_VILLAGE_CONFIG.buildings,
          ...(data?.buildings || {})
        },
        biomeWords: {
          ...DEFAULT_VILLAGE_CONFIG.biomeWords,
          ...(data?.biomeWords || {})
        }
      };
      console.log('[Village] 配置加载成功');
    })
    .catch(() => {
      villageConfig = { ...DEFAULT_VILLAGE_CONFIG };
      console.warn('[Village] 使用默认配置');
    });
}

// ========== 村庄生成 ==========
function maybeSpawnVillage(playerScore, playerX) {
  if (!settings || !settings.villageEnabled) return;
  const cfg = getVillageConfig();
  if (!cfg.enabled) return;
  const interval = cfg.spawnScoreInterval || 500;
  const minScoreGap = Math.max(0, Number(cfg.minSpawnScoreGap ?? 900));
  const minDistancePx = Math.max(0, Number(cfg.minSpawnDistancePx ?? 2600));
  const minBiomeTransitionsBetweenVillages = Math.max(0, Math.floor(Number(cfg.minBiomeTransitionsBetweenVillages ?? 2)));
  const minBiomeStayScoreForVillage = Math.max(0, Number(cfg.minBiomeStayScoreForVillage ?? 120));

  const transitionTick = (() => {
    if (typeof getBiomeVisitCountSnapshot !== "function") return 0;
    const snap = getBiomeVisitCountSnapshot() || {};
    let total = 0;
    for (const v of Object.values(snap)) total += Number(v) || 0;
    return total;
  })();

  const stayScore = (() => {
    if (typeof getBiomeStayDebugInfo !== "function") return Infinity;
    const info = getBiomeStayDebugInfo(playerScore) || {};
    return Number(info.scoreInBiome) || 0;
  })();

  const hasSpawnHistory = (() => {
    const hasScoreMark = villageSpawnedForScore && typeof villageSpawnedForScore === "object"
      ? Object.keys(villageSpawnedForScore).length > 0
      : false;
    const lastScore = Number(villageSpawnState?.lastSpawnScore);
    const lastX = Number(villageSpawnState?.lastSpawnX);
    return hasScoreMark
      || (Number.isFinite(lastScore) && lastScore > 0)
      || (Number.isFinite(lastX) && lastX > 0);
  })();

  if (typeof villageSpawnState !== "undefined" && villageSpawnState && hasSpawnHistory) {
    if ((playerScore - (Number(villageSpawnState.lastSpawnScore) || -Infinity)) < minScoreGap) return;
    if ((playerX - (Number(villageSpawnState.lastSpawnX) || -Infinity)) < minDistancePx) return;
    if ((transitionTick - (Number(villageSpawnState.lastSpawnTransitionTick) || 0)) < minBiomeTransitionsBetweenVillages) return;
    if (stayScore < minBiomeStayScoreForVillage) return;
  }

  // 计算当前分数应当生成的村庄编号
  const villageIndex = Math.floor(playerScore / interval);
  if (villageIndex < 1) return; // 0分不生成
  if (villageSpawnedForScore[villageIndex]) return; // 已生成

  const biomeId = currentBiome || 'forest';
  const village = createVillage(playerX + 600, biomeId, villageIndex);
  activeVillages.push(village);
  villageSpawnedForScore[villageIndex] = true;
  if (typeof villageSpawnState !== "undefined" && villageSpawnState) {
    villageSpawnState.lastSpawnScore = Number(playerScore) || 0;
    villageSpawnState.lastSpawnX = Number(village.x) || Number(playerX) || 0;
    villageSpawnState.lastSpawnBiome = biomeId;
    villageSpawnState.lastSpawnTransitionTick = transitionTick;
  }

  // 回收远处的村庄
  cleanupVillages(playerX);
  console.log(`[Village] 生成村庄 #${villageIndex} at x=${village.x}, biome=${biomeId}`);
}

function createVillage(startX, biomeId, index) {
  const config = getVillageConfig();
  const style = VILLAGE_STYLES[biomeId] || VILLAGE_STYLES.forest;
  const cfg = config.buildings || {};
  const village = {
    id: index,
    x: startX,
    width: config.villageWidth || 800,
    biomeId: biomeId,
    style: style,
    buildings: [
      { type: 'bed_house',  x: startX + (cfg.bed_house?.offset || 100),  w: cfg.bed_house?.w || 80,  h: cfg.bed_house?.h || 60 },
      { type: 'word_house', x: startX + (cfg.word_house?.offset || 300), w: cfg.word_house?.w || 100, h: cfg.word_house?.h || 80 },
      { type: 'trader_house', x: startX + (cfg.trader_house?.offset || cfg.save_stone?.offset || 550), w: cfg.trader_house?.w || 72,  h: cfg.trader_house?.h || 62 },
      { type: style.specialBuilding, x: startX + (cfg.special?.offset || 700), w: cfg.special?.w || 80, h: cfg.special?.h || 60 }
    ],
    npcs: [],
    decorations: style.decorations.map((d, i) => ({
      type: d, x: startX + 50 + i * 150
    })),
    visited: false,
    restUsed: false,
    questCompleted: false,
    saved: false
  };

  // v1.8.1 添加 NPC
  if (typeof createVillageNPC === 'function') {
    const roles = ['greeter', 'teacher', 'trader'];
    const baseX = startX + 200;
    village.npcs = roles.map((role, i) =>
      createVillageNPC(baseX + i * 200, role, village.x, village.width)
    );
  }

  // Spawn word items and chests inside village
  spawnVillageItems(village);

  return village;
}

function spawnVillageItems(village) {
  if (typeof pickWordForSpawn !== 'function') return;
  if (typeof Item === 'undefined') return;
  const vx = village.x;
  const w = village.width || 800;
  const wordCount = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < wordCount; i++) {
    const ix = vx + 80 + (i * (w - 160) / wordCount) + Math.random() * 40;
    const word = pickWordForSpawn();
    if (word) {
      items.push(new Item(ix, groundY - 60, word));
      if (typeof registerWordItemSpawn === 'function') registerWordItemSpawn(ix);
    }
  }
  if (typeof Chest !== 'undefined') {
    const chestCount = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < chestCount; i++) {
      const cx = vx + 200 + i * 300 + Math.random() * 80;
      chests.push(new Chest(cx, groundY));
    }
  }
}

function cleanupVillages(playerX) {
  const max = getVillageConfig().maxActiveVillages || 3;
  // 移除玩家身后超过 2000px 的村庄
  activeVillages = activeVillages.filter(v => {
    return (v.x + v.width) > playerX - 2000;
  });
  // 如果仍超过上限，移除最远的
  while (activeVillages.length > max) {
    activeVillages.shift();
  }
}

// ========== NPC 村民系统 (v1.8.1) ==========

const NPC_ROLES = {
  greeter: {
    greeting: 'Welcome! 欢迎!',
    speed: 0.3,
    patrolRange: 120
  },
  teacher: {
    greeting: 'Come learn! 来学习!',
    speed: 0.2,
    patrolRange: 80
  },
  trader: {
    greeting: 'Trade? 交易吗?',
    speed: 0.15,
    patrolRange: 60
  }
};

function createVillageNPC(baseX, role, villageX, villageWidth) {
  const cfg = NPC_ROLES[role] || NPC_ROLES.greeter;
  const minX = Math.max(villageX + 20, baseX - cfg.patrolRange);
  const maxX = Math.min(villageX + villageWidth - 20, baseX + cfg.patrolRange);
  return {
    x: baseX,
    y: 0,
    role: role,
    direction: 1,
    speed: cfg.speed,
    minX: minX,
    maxX: maxX,
    showBubble: false,
    bubbleText: cfg.greeting,
    bubbleTimer: 0,
    facingRight: true,
    animFrame: 0,
    animTimer: 0
  };
}

function updateVillageNPCs(village) {
  for (const npc of village.npcs) {
    // 来回走动
    npc.x += npc.direction * npc.speed;
    if (npc.x <= npc.minX) {
      npc.x = npc.minX;
      npc.direction = 1;
      npc.facingRight = true;
    } else if (npc.x >= npc.maxX) {
      npc.x = npc.maxX;
      npc.direction = -1;
      npc.facingRight = false;
    }

    // 走路动画帧
    npc.animTimer++;
    if (npc.animTimer >= 15) {
      npc.animTimer = 0;
      npc.animFrame = (npc.animFrame + 1) % 2;
    }

    // 玩家靠近时显示气泡
    const dist = Math.abs(player.x - npc.x);
    const greetDist = getVillageConfig().npcGreetDistance || 80;
    if (dist < greetDist) {
      npc.showBubble = true;
      // 面向玩家
      npc.facingRight = player.x > npc.x;
      npc.direction = 0; // 停下来
      npc.bubbleTimer = 120; // 气泡持续 2 秒
    } else if (npc.bubbleTimer > 0) {
      npc.bubbleTimer--;
      if (npc.bubbleTimer <= 0) {
        npc.showBubble = false;
        // 恢复巡逻
        npc.direction = npc.facingRight ? 1 : -1;
      }
    } else {
      npc.showBubble = false;
    }
  }
}

// ========== 村庄状态更新 ==========
function updateVillages() {
  if (!settings || !settings.villageEnabled) return;
  if (!player) return;
  if (typeof updateVillageBuffs === 'function') updateVillageBuffs();
  // 检查是否需要生成新村庄
  maybeSpawnVillage(score, player.x);
  // 检测玩家是否在村庄内
  const wasInVillage = playerInVillage;
  playerInVillage = false;
  currentVillage = null;
  for (const v of activeVillages) {
    if (player.x >= v.x && player.x <= v.x + v.width) {
      playerInVillage = true;
      currentVillage = v;
      if (!v.visited) {
        v.visited = true;
        const biomeName = getBiomeName(v.biomeId);
        showToast(BIOME_MESSAGES.enterVillage(biomeName));
        // Remove enemies inside village area
        if (typeof enemies !== 'undefined' && Array.isArray(enemies)) {
          for (let i = enemies.length - 1; i >= 0; i--) {
            if (enemies[i].x >= v.x && enemies[i].x <= v.x + v.width) {
              enemies.splice(i, 1);
            }
          }
        }
      }
      // v1.8.1 更新村民
      updateVillageNPCs(v);
      if (typeof tryAutoEnterVillageInterior === "function") {
        tryAutoEnterVillageInterior(v);
      }

      break;
    }
  }
  if (wasInVillage && !playerInVillage) {
    showToast(BIOME_MESSAGES.leaveVillage);
    // v1.8.2 清除休息提示
    hideRestPrompt();
  }
}

// ========== 休息系统 (v1.8.2) ==========
let restPromptVisible = false;
let restPromptVillage = null;
const INTERIOR_BUILDING_TYPES = new Set(["bed_house", "word_house"]);
const INTERIOR_MOVE_SPEED_FACTOR = 0.5;
const INTERIOR_HALF_RANGE = 72;
const INTERIOR_DOOR_RANGE = 20;
const INTERIOR_ACTION_RANGE = 22;
const villageInteriorState = {
  active: false,
  villageId: null,
  buildingType: null,
  entryBuildingX: 0,
  returnPlayerX: 0,
  returnPlayerY: 0,
  enteredAt: 0,
  exitConfirmUntil: 0,
  challengeStarted: false,
  autoEnterBlockUntil: 0,
  autoTriggerCooldownUntil: 0,
  autoTriggerZone: ""
};

function isVillageInteriorActive() {
  return !!villageInteriorState.active;
}

function syncVillageInteriorTouchUi() {
  if (typeof document === "undefined") return;
  const root = document.getElementById("touch-controls");
  if (!root) return;
  if (isVillageInteriorActive()) root.classList.add("interior-active");
  else root.classList.remove("interior-active");
}

function getVillageInteriorVillage() {
  if (!villageInteriorState.villageId) return null;
  return activeVillages.find(v => v && v.id === villageInteriorState.villageId) || null;
}

function getVillageInteriorBuilding(village) {
  if (!village || !villageInteriorState.buildingType) return null;
  return village.buildings?.find(b => b?.type === villageInteriorState.buildingType) || null;
}

function getInteriorDoorX() {
  const center = Number(villageInteriorState.entryBuildingX) || 0;
  return center + Math.round(INTERIOR_HALF_RANGE * 0.7);
}

function getInteriorActionX(type = villageInteriorState.buildingType) {
  const center = Number(villageInteriorState.entryBuildingX) || 0;
  if (type === "bed_house") return center - Math.round(INTERIOR_HALF_RANGE * 0.7);
  if (type === "word_house") return center - Math.round(INTERIOR_HALF_RANGE * 0.7);
  return center;
}

function getInteriorMoveBounds() {
  const centerX = Number(villageInteriorState.entryBuildingX) || 0;
  return {
    minX: centerX - INTERIOR_HALF_RANGE,
    maxX: centerX + INTERIOR_HALF_RANGE
  };
}

function getPlayerCenterX() {
  if (!player) return 0;
  return (Number(player.x) || 0) + ((Number(player.width) || 0) * 0.5);
}

function resetVillageInteriorState({ silent = true } = {}) {
  const wasActive = villageInteriorState.active;
  villageInteriorState.active = false;
  villageInteriorState.villageId = null;
  villageInteriorState.buildingType = null;
  villageInteriorState.entryBuildingX = 0;
  villageInteriorState.returnPlayerX = 0;
  villageInteriorState.returnPlayerY = 0;
  villageInteriorState.enteredAt = 0;
  villageInteriorState.exitConfirmUntil = 0;
  villageInteriorState.challengeStarted = false;
  villageInteriorState.autoEnterBlockUntil = 0;
  villageInteriorState.autoTriggerCooldownUntil = 0;
  villageInteriorState.autoTriggerZone = "";
  syncVillageInteriorTouchUi();
  if (!silent && wasActive) showToast("🏠 已离开房屋");
}

function canEnterVillageInterior(village, building) {
  if (!village || !building) return false;
  if (!INTERIOR_BUILDING_TYPES.has(building.type)) return false;
  if (isVillageInteriorActive()) return false;
  if (typeof bossArena !== "undefined" && bossArena?.active) {
    showToast("⚔️ BOSS战中，暂时不能进屋");
    return false;
  }
  if (typeof biomeGateState !== "undefined" && biomeGateState?.gateActive) {
    showToast("🚫 门禁战进行中，暂时不能进屋");
    return false;
  }
  return true;
}

function enterVillageInterior(village, building) {
  if (!canEnterVillageInterior(village, building)) return false;
  villageInteriorState.active = true;
  villageInteriorState.villageId = village.id;
  villageInteriorState.buildingType = building.type;
  villageInteriorState.entryBuildingX = Number(building.x) || 0;
  villageInteriorState.returnPlayerX = Number(player?.x) || 0;
  villageInteriorState.returnPlayerY = Number(player?.y) || 0;
  villageInteriorState.enteredAt = Date.now();
  villageInteriorState.exitConfirmUntil = 0;
  villageInteriorState.challengeStarted = false;
  villageInteriorState.autoTriggerCooldownUntil = Date.now() + 600;
  villageInteriorState.autoTriggerZone = "";
  syncVillageInteriorTouchUi();
  if (player) {
    const centerX = Number(villageInteriorState.entryBuildingX) || 0;
    const bounds = getInteriorMoveBounds();
    player.x = Math.max(bounds.minX, Math.min(bounds.maxX, centerX - (player.width * 0.5)));
    player.y = groundY - player.height;
    player.velX = 0;
    player.velY = 0;
    player.grounded = true;
  }
  const label = building.type === "bed_house" ? "床屋" : "词屋";
  showToast(`🏠 进入${label}（Esc 退出）`);
  return true;
}

function exitVillageInterior(reason = "") {
  if (!isVillageInteriorActive()) return false;
  const village = getVillageInteriorVillage();
  const building = getVillageInteriorBuilding(village);
  if (player) {
    const fallbackX = villageInteriorState.returnPlayerX || player.x;
    const exitX = building ? (building.x + building.w * 0.5 - player.width * 0.5) : fallbackX;
    player.x = Math.max(0, exitX);
    player.y = Math.min(groundY - player.height, villageInteriorState.returnPlayerY || player.y);
    player.velX = 0;
    player.velY = 0;
    player.grounded = false;
    player.jumpCount = 0;
    player.lastFragilePlatform = null;
  }
  const text = reason || "🏠 离开房屋";
  resetVillageInteriorState();
  villageInteriorState.autoEnterBlockUntil = Date.now() + 1400;
  showToast(text);
  return true;
}

function updateVillageInteriorMode() {
  if (!isVillageInteriorActive()) return;
  syncVillageInteriorTouchUi();
  const village = getVillageInteriorVillage();
  if (!village) {
    resetVillageInteriorState();
    return;
  }
  if (!player) return;
  if (
    villageInteriorState.buildingType === "word_house" &&
    villageInteriorState.challengeStarted &&
    !village._challengeRunning &&
    !pausedByModal
  ) {
    exitVillageInterior("🏠 挑战结束，已离开词屋");
    return;
  }
  const bounds = getInteriorMoveBounds();
  const interiorMoveSpeed = Math.max(
    0.8,
    (Number(player.baseSpeed) || Number(player.speed) || 4) * INTERIOR_MOVE_SPEED_FACTOR
  );
  let moveX = 0;
  if (keys.left) {
    moveX -= interiorMoveSpeed;
    player.facingRight = false;
  }
  if (keys.right) {
    moveX += interiorMoveSpeed;
    player.facingRight = true;
  }
  player.x = Math.max(bounds.minX, Math.min(bounds.maxX, (Number(player.x) || 0) + moveX));
  player.y = groundY - player.height;
  player.velX = 0;
  player.velY = 0;
  player.grounded = true;
  player.jumpCount = 0;
  triggerVillageInteriorAutoDoor(village);
  const targetCam = Math.max(0, player.x - cameraOffsetX);
  if (targetCam > cameraX) cameraX = targetCam;
}

function renderVillageInterior(ctx) {
  if (!isVillageInteriorActive()) return false;
  if (!ctx || !canvas) return false;
  const village = getVillageInteriorVillage();
  const buildingType = villageInteriorState.buildingType || "bed_house";
  const colors = typeof getVillageColors === "function"
    ? getVillageColors(village?.biomeId || "forest")
    : { plank: "#B8945A", log: "#5D4037", glass: "#A8D8EA" };

  ctx.fillStyle = "rgba(0,0,0,0.72)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const panelW = Math.min(canvas.width * 0.9, 720);
  const panelH = Math.min(canvas.height * 0.8, 460);
  const panelX = (canvas.width - panelW) * 0.5;
  const panelY = (canvas.height - panelH) * 0.5;
  ctx.fillStyle = colors.plank || "#B8945A";
  ctx.fillRect(panelX, panelY, panelW, panelH);
  ctx.strokeStyle = colors.log || "#5D4037";
  ctx.lineWidth = 6;
  ctx.strokeRect(panelX, panelY, panelW, panelH);

  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.fillRect(panelX + 24, panelY + panelH - 92, panelW - 48, 56);
  ctx.fillStyle = colors.glass || "#A8D8EA";
  ctx.fillRect(panelX + panelW - 110, panelY + 36, 70, 46);
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 2;
  ctx.strokeRect(panelX + panelW - 110, panelY + 36, 70, 46);

  const bounds = getInteriorMoveBounds();
  const floorY = panelY + panelH - 84;
  const usableLeft = panelX + 56;
  const usableRight = panelX + panelW - 56;
  const toPanelX = (worldX) => {
    const ratio = (worldX - bounds.minX) / Math.max(1, (bounds.maxX - bounds.minX));
    return usableLeft + Math.max(0, Math.min(1, ratio)) * (usableRight - usableLeft);
  };
  const doorPx = toPanelX(getInteriorDoorX());
  const actionPx = toPanelX(getInteriorActionX(buildingType));
  const playerPx = toPanelX(getPlayerCenterX());

  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(doorPx - 10, floorY, 20, 8);
  ctx.fillRect(actionPx - 10, floorY, 20, 8);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.textAlign = "center";
  ctx.font = "bold 13px sans-serif";
  ctx.fillText("门口（自动离开）", doorPx, floorY - 22);
  ctx.fillText(buildingType === "bed_house" ? "床（按宝箱键）" : "单词书（按宝箱键）", actionPx, floorY - 22);

  const steveX = playerPx - (Number(player?.width) || 26) * 0.5;
  const steveY = floorY - (Number(player?.height) || 52);
  if (typeof drawSteve === "function") {
    drawSteve(steveX, steveY, !!player?.facingRight, false);
  } else {
    ctx.fillStyle = "#FFEE58";
    ctx.fillRect(playerPx - 9, floorY - 26, 18, 24);
    ctx.fillStyle = "#5D4037";
    ctx.fillRect(playerPx - 9, floorY - 2, 18, 2);
  }

  const title = buildingType === "bed_house" ? "🏠 床屋室内" : "📘 词屋室内";
  ctx.fillStyle = "#1E1E1E";
  ctx.font = "bold 28px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(title, panelX + 28, panelY + 48);

  ctx.fillStyle = "#222";
  ctx.font = "18px sans-serif";
  if (buildingType === "bed_house") {
    drawVillageBed(ctx, panelX + 80, panelY + panelH - 110, colors);
    ctx.fillText("", panelX + 28, panelY + 96);
    ctx.fillText("", panelX + 28, panelY + 128);
  } else {
    ctx.fillStyle = colors.log || "#6B4226";
    ctx.fillRect(panelX + 72, panelY + panelH - 126, 180, 18);
    ctx.fillRect(panelX + 86, panelY + panelH - 108, 14, 50);
    ctx.fillRect(panelX + 224, panelY + panelH - 108, 14, 50);
    ctx.fillStyle = "#222";
    ctx.fillText("", panelX + 28, panelY + 96);
    ctx.fillText("", panelX + 28, panelY + 128);
  }
  // Requirement update: keep door as auto-exit, bed/word use chest-key trigger.
  ctx.fillStyle = colors.plank || "#B8945A";
  ctx.fillRect(panelX + 24, panelY + 72, panelW - 48, 86);

  const doorW = 28;
  const doorH = 52;
  const doorShapeX = doorPx - doorW * 0.5;
  const doorShapeY = floorY - doorH;
  ctx.fillStyle = "#6D4C41";
  ctx.fillRect(doorShapeX, doorShapeY, doorW, doorH);
  ctx.strokeStyle = "#3E2723";
  ctx.lineWidth = 2;
  ctx.strokeRect(doorShapeX, doorShapeY, doorW, doorH);
  ctx.fillStyle = "#FBC02D";
  ctx.beginPath();
  ctx.arc(doorShapeX + doorW - 6, doorShapeY + doorH * 0.55, 2.2, 0, Math.PI * 2);
  ctx.fill();

  if (buildingType === "word_house") {
    // Cover old table marker and render book only.
    ctx.fillStyle = colors.plank || "#B8945A";
    ctx.fillRect(actionPx - 56, floorY - 62, 112, 62);
    const bookX = actionPx - 24;
    const bookY = floorY - 44;
    ctx.fillStyle = "#1E88E5";
    ctx.fillRect(bookX, bookY, 48, 32);
    ctx.fillStyle = "#E3F2FD";
    ctx.fillRect(bookX + 4, bookY + 4, 18, 24);
    ctx.fillRect(bookX + 26, bookY + 4, 18, 24);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(bookX + 23, bookY + 2, 2, 28);
  }

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.textAlign = "center";
  ctx.font = "bold 13px sans-serif";
  ctx.fillText("门", doorPx, floorY - 24);
  ctx.fillText("靠近自动离开", doorPx, floorY - 8);
  ctx.fillText(buildingType === "bed_house" ? "床" : "单词书", actionPx, floorY - 24);
  ctx.fillText("按宝箱键触发", actionPx, floorY - 8);
  ctx.fillText(buildingType === "bed_house" ? "休息回血" : "开始单词测验", actionPx, floorY + 8);

  ctx.textAlign = "left";
  return true;
}

function triggerVillageInteriorAutoDoor(village) {
  if (!isVillageInteriorActive() || !village || !player) return false;
  if (paused || pausedByModal) return false;
  const now = Date.now();
  if (now < Number(villageInteriorState.autoTriggerCooldownUntil || 0)) return false;

  const centerX = getPlayerCenterX();
  const nearDoor = Math.abs(centerX - getInteriorDoorX()) <= INTERIOR_DOOR_RANGE;
  const zone = nearDoor ? "door" : "";

  if (!zone) {
    if (villageInteriorState.autoTriggerZone === "door") villageInteriorState.autoTriggerZone = "";
    return false;
  }
  if (zone === villageInteriorState.autoTriggerZone) return false;

  villageInteriorState.autoTriggerZone = zone;
  villageInteriorState.autoTriggerCooldownUntil = now + 900;

  if (zone === "door") {
    exitVillageInterior("🏠 离开房屋");
    return true;
  }

  return false;
}

function triggerVillageInteriorChestAction(village) {
  if (!isVillageInteriorActive() || !village || !player) return false;
  const type = villageInteriorState.buildingType;
  const centerX = getPlayerCenterX();
  const nearAction = Math.abs(centerX - getInteriorActionX(type)) <= INTERIOR_ACTION_RANGE;
  if (!nearAction) {
    showToast(type === "bed_house" ? "靠近床后按宝箱键" : "靠近单词书后按宝箱键");
    return true;
  }
  if (type === "bed_house") {
    performRest(village);
    return true;
  }
  if (type === "word_house") {
    if (village.questCompleted) {
      showToast(UI_TEXTS.questDone);
      return true;
    }
    if (typeof startVillageChallenge === "function") {
      villageInteriorState.challengeStarted = true;
      startVillageChallenge(village, () => {
        village.questCompleted = true;
      });
      return true;
    }
  }
  return false;
}

function checkVillageRest(village) {
  if (!village) return;
  if (village.restUsed) return; // 已使用过
  const nearby = getNearbyBuilding(village);
  if (nearby && nearby.type === 'bed_house') showRestPrompt(village);
  else hideRestPrompt();
}

function checkVillageBuildings(village) {
  if (!village) return false;
  const nearby = getNearbyBuilding(village);
  if (!nearby) return false;
  return !!handleVillageInteraction(nearby, village);
}


function isInteriorBuildingType(type) {
  return type === "bed_house" || type === "word_house";
}

function tryAutoEnterVillageInterior(village) {
  if (!village || !player) return false;
  if (isVillageInteriorActive()) return false;
  if (paused || pausedByModal) return false;
  const now = Date.now();
  if (now < Number(villageInteriorState.autoEnterBlockUntil || 0)) return false;
  const nearby = getNearbyBuilding(village, 2);
  if (!nearby || !isInteriorBuildingType(nearby.type)) return false;
  const centerX = getPlayerCenterX();
  const doorCenter = nearby.x + nearby.w * 0.5;
  if (Math.abs(centerX - doorCenter) > INTERIOR_DOOR_RANGE) return false;
  if (village._lastAutoEnterAt && now - village._lastAutoEnterAt < 1000) return false;
  village._lastAutoEnterAt = now;
  return enterVillageInterior(village, nearby);
}
function getNearbyBuilding(village, margin = 4) {
  if (!village || !Array.isArray(village.buildings) || !player) return null;
  const centerX = player.x + player.width / 2;
  for (const building of village.buildings) {
    const left = building.x - margin;
    const right = building.x + building.w + margin;
    if (centerX >= left && centerX <= right) return building;
  }
  return null;
}

function showRestPrompt(village) {
  restPromptVisible = true;
  restPromptVillage = village;
}

function hideRestPrompt() {
  restPromptVisible = false;
  restPromptVillage = null;
}

function performRest(village) {
  if (!village) return;
  if (village.restUsed) {
    showToast(UI_TEXTS.restAlready);
    return;
  }

  // 检查满血条件
  const isFullHp = playerHp >= playerMaxHp;
  const cfg = getVillageConfig();
  if (isFullHp && cfg.restHealFull) {
    showToast(UI_TEXTS.restFullHp);
    return;
  }

  // 执行休息回血
  if (cfg.restHealFull) {
    playerHp = playerMaxHp;
  } else {
    playerHp = Math.min(playerMaxHp, playerHp + 5);
  }

  updateHpUI();
  village.restUsed = true;
  hideRestPrompt();

  const healAmount = cfg.restHealFull ? '全满' : '+5';
  showToast(UI_TEXTS.restSuccess(healAmount));
  showFloatingText(UI_TEXTS.restHeal, player.x, player.y - 60);

  // 保存进度
  if (typeof saveCurrentProgress === 'function') {
    saveCurrentProgress();
  }
}

// ========== 杈呭姪鍑芥暟 ==========
function isInVillageArea(x) {
  for (const v of activeVillages) {
    if (x >= v.x && x <= v.x + v.width) return true;
  }
  return false;
}

function getVillageAt(x) {
  for (const v of activeVillages) {
    if (x >= v.x && x <= v.x + v.width) return v;
  }
  return null;
}

function getBiomeName(biomeId) {
  if (typeof biomeConfigs === 'undefined' || !biomeConfigs) return biomeId || 'forest';
  const biome = biomeConfigs[biomeId];
  return biome ? biome.name : biomeId;
}

// ========== v1.8.3 村庄单词系统 ==========
function getVillageWords(biomeId) {
  const cfg = getVillageConfig();
  if (!cfg.biomeWords) return [];
  return cfg.biomeWords[biomeId] || cfg.biomeWords.forest || [];
}

function handleVillageInteraction(building, village) {
  if (!building || !village) return false;
  const now = Date.now();
  if (village._lastInteractAt && now - village._lastInteractAt < 250) return false;
  village._lastInteractAt = now;

  switch (building.type) {
    case 'bed_house':
      return enterVillageInterior(village, building);
    case 'word_house':
      return enterVillageInterior(village, building);
    case 'trader_house':
      openVillageTrader(village);
      return true;
    default:
      if (SPECIAL_BUILDING_EFFECTS[building.type]) {
        interactSpecialBuilding(village, building.type);
        return true;
      }
      return false;
  }
}

function handleVillageInteriorInteraction() {
  const village = getVillageInteriorVillage();
  if (!village) return false;
  return !!triggerVillageInteriorChestAction(village);
}

const TRADER_MATERIAL_PRICES = {
  iron: 2,
  gold: 3,
  coal: 1,
  shell: 2,
  starfish: 4,
  gunpowder: 2,
  rotten_flesh: 1,
  string: 1,
  ender_pearl: 5,
  sculk_vein: 4,
  echo_shard: 6
};

const TRADER_ARMOR_PRICES = {
  leather: 10,
  iron: 20,
  gold: 30,
  diamond: 40
};

let traderPrevPaused = false;

function openVillageTrader(village) {
  if (typeof document === "undefined") {
    showToast("🧑‍🌾 商人暂不可用");
    return false;
  }
  if (pausedByModal) return false;
  traderPrevPaused = !!paused;
  pausedByModal = true;
  paused = true;
  const modal = ensureVillageTraderModal();
  renderVillageTraderMain(modal, village);
  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");
  return true;
}

function ensureVillageTraderModal() {
  let modal = document.getElementById("village-trader-modal");
  if (modal) return modal;
  modal = document.createElement("div");
  modal.id = "village-trader-modal";
  modal.className = "learning-modal";
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="learning-modal-content" style="max-width: 560px;">
      <div id="village-trader-body"></div>
    </div>
  `;
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeVillageTrader();
  });
  document.getElementById("game-container")?.appendChild(modal);
  return modal;
}

function closeVillageTrader() {
  const modal = document.getElementById("village-trader-modal");
  if (modal) {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
  }
  if (pausedByModal) {
    paused = traderPrevPaused;
    pausedByModal = false;
  }
}

function renderVillageTraderMain(modal, village) {
  const body = modal.querySelector("#village-trader-body");
  if (!body) return;
  const diamondCount = Number(inventory?.diamond) || 0;
  body.innerHTML = `
    <h3 style="margin:0 0 12px;color:#FFD54F;">🧑‍🌾 商人交易</h3>
    <p style="margin:0 0 12px;color:#E0E0E0;">当前钻石：<b>${diamondCount}</b></p>
    <div style="display:flex;flex-direction:column;gap:10px;">
      <button id="trader-btn-sell" class="game-btn">卖材料换钻石</button>
      <button id="trader-btn-armor" class="game-btn">买盔甲</button>
      <button id="trader-btn-sunscreen" class="game-btn">买防晒霜（5💎）</button>
      <button id="trader-btn-close" class="game-btn">关闭</button>
    </div>
  `;
  body.querySelector("#trader-btn-sell")?.addEventListener("click", () => renderTraderSellMaterials(modal, village));
  body.querySelector("#trader-btn-armor")?.addEventListener("click", () => renderTraderBuyArmor(modal, village));
  body.querySelector("#trader-btn-sunscreen")?.addEventListener("click", () => {
    handleTraderBuySunscreen();
    renderVillageTraderMain(modal, village);
  });
  body.querySelector("#trader-btn-close")?.addEventListener("click", closeVillageTrader);
}

function renderTraderSellMaterials(modal, village) {
  const body = modal.querySelector("#village-trader-body");
  if (!body) return;
  const sellable = Object.entries(TRADER_MATERIAL_PRICES)
    .filter(([itemId]) => Number(inventory?.[itemId]) > 0)
    .map(([itemId, price]) => {
      const count = Number(inventory[itemId]) || 0;
      const label = ITEM_LABELS[itemId] || itemId;
      return { itemId, price, count, label };
    });
  if (!sellable.length) {
    showToast("🧺 没有可出售材料");
    renderVillageTraderMain(modal, village);
    return;
  }
  body.innerHTML = `
    <h3 style="margin:0 0 12px;color:#FFD54F;">出售材料</h3>
    <div id="trader-sell-list" style="display:flex;flex-direction:column;gap:8px;"></div>
    <div style="margin-top:12px;">
      <button id="trader-btn-back-main" class="game-btn">返回</button>
    </div>
  `;
  const list = body.querySelector("#trader-sell-list");
  sellable.forEach(({ itemId, price, count, label }) => {
    const btn = document.createElement("button");
    btn.className = "game-btn";
    btn.textContent = `${label}（库存${count}，单价${price}💎）`;
    btn.addEventListener("click", () => renderTraderSellCount(modal, village, itemId, price, count, label));
    list?.appendChild(btn);
  });
  body.querySelector("#trader-btn-back-main")?.addEventListener("click", () => renderVillageTraderMain(modal, village));
}

function renderTraderSellCount(modal, village, itemId, unitPrice, maxCount, label) {
  const body = modal.querySelector("#village-trader-body");
  if (!body) return;
  const btnAllText = `全部（${maxCount}）`;
  body.innerHTML = `
    <h3 style="margin:0 0 12px;color:#FFD54F;">出售 ${label}</h3>
    <p style="margin:0 0 12px;color:#E0E0E0;">单价：${unitPrice}💎 / 件，库存：${maxCount}</p>
    <div style="display:flex;flex-direction:column;gap:8px;">
      <button id="trader-sell-1" class="game-btn">卖出 x1</button>
      <button id="trader-sell-5" class="game-btn">卖出 x5</button>
      <button id="trader-sell-all" class="game-btn">${btnAllText}</button>
      <button id="trader-sell-back" class="game-btn">返回材料列表</button>
    </div>
  `;
  body.querySelector("#trader-sell-1")?.addEventListener("click", () => {
    sellMaterialByTrader(itemId, unitPrice, 1);
    renderTraderSellMaterials(modal, village);
  });
  body.querySelector("#trader-sell-5")?.addEventListener("click", () => {
    sellMaterialByTrader(itemId, unitPrice, 5);
    renderTraderSellMaterials(modal, village);
  });
  body.querySelector("#trader-sell-all")?.addEventListener("click", () => {
    sellMaterialByTrader(itemId, unitPrice, maxCount);
    renderTraderSellMaterials(modal, village);
  });
  body.querySelector("#trader-sell-back")?.addEventListener("click", () => renderTraderSellMaterials(modal, village));
}

function sellMaterialByTrader(itemId, unitPrice, requestedCount) {
  const maxCount = Number(inventory?.[itemId]) || 0;
  const sellCount = Math.max(0, Math.min(maxCount, Number(requestedCount) || 0));
  if (sellCount <= 0) {
    showToast("🛒 没有可出售数量");
    return false;
  }
  inventory[itemId] -= sellCount;
  inventory.diamond = (Number(inventory.diamond) || 0) + (sellCount * unitPrice);
  if (typeof updateInventoryUI === "function") updateInventoryUI();
  showToast(`💎 售出${ITEM_LABELS[itemId] || itemId} x${sellCount}，获得${sellCount * unitPrice}钻石`);
  return true;
}

function renderTraderBuyArmor(modal, village) {
  const body = modal.querySelector("#village-trader-body");
  if (!body) return;
  body.innerHTML = `
    <h3 style="margin:0 0 12px;color:#FFD54F;">购买盔甲</h3>
    <div id="trader-armor-list" style="display:flex;flex-direction:column;gap:8px;"></div>
    <div style="margin-top:12px;">
      <button id="trader-btn-back-main" class="game-btn">返回</button>
    </div>
  `;
  const list = body.querySelector("#trader-armor-list");
  Object.entries(TRADER_ARMOR_PRICES).forEach(([armorId, cost]) => {
    const armorName = ARMOR_TYPES?.[armorId]?.name || armorId;
    const btn = document.createElement("button");
    btn.className = "game-btn";
    btn.textContent = `${armorName}（${cost}💎）`;
    btn.addEventListener("click", () => {
      handleTraderBuyArmor(armorId, cost);
      renderTraderBuyArmor(modal, village);
    });
    list?.appendChild(btn);
  });
  body.querySelector("#trader-btn-back-main")?.addEventListener("click", () => renderVillageTraderMain(modal, village));
}

function handleTraderBuyArmor(armorId, cost) {
  if (!armorId || !Number.isFinite(Number(cost))) return false;
  if ((Number(inventory.diamond) || 0) < Number(cost)) {
    showToast("💎 钻石不足");
    return false;
  }
  inventory.diamond -= Number(cost);
  if (typeof addArmorToInventory === "function") addArmorToInventory(armorId);
  if (typeof updateInventoryUI === "function") updateInventoryUI();
  const armorName = ARMOR_TYPES?.[armorId]?.name || armorId;
  showToast(`🛡️ 购买成功：${armorName}`);
  return true;
}

function handleTraderBuySunscreen() {
  const cost = 5;
  if ((Number(inventory.diamond) || 0) < cost) {
    showToast("💎 钻石不足");
    return false;
  }
  inventory.diamond -= cost;
  setVillageBuff("sunscreen", 180000);
  if (typeof updateInventoryUI === "function") updateInventoryUI();
  showToast("🧴 防晒霜已生效（180秒）");
  showFloatingText("🧴 防晒中", player.x, player.y - 36, "#FFD54F");
  return true;
}

function saveVillageProgress(village) {
  if (!village) return false;
  if (village.saved) {
    showToast(UI_TEXTS.villageAlreadySaved);
    return false;
  }

  village.saved = true;
  village.saveTimestamp = Date.now();

  const checkpoint = {
    version: 1,
    timestamp: village.saveTimestamp,
    villageId: village.id,
    villageX: village.x,
    biomeId: village.biomeId,
    score: Number(score) || 0,
    playerHp: Number(playerHp) || 0,
    playerMaxHp: Number(playerMaxHp) || 0,
    playerX: Number(player?.x) || 0,
    diamonds: Number(inventory?.diamond) || 0,
    inventory: { ...(inventory || {}) },
    equipment: { ...(playerEquipment || {}) },
    armorInventory: Array.isArray(armorInventory) ? [...armorInventory] : []
  };

  try {
    localStorage.setItem('mmwg:villageCheckpoint', JSON.stringify(checkpoint));
  } catch (_) {}

  if (typeof saveCurrentProgress === 'function') {
    saveCurrentProgress();
  }
  showToast(UI_TEXTS.villageSaved);
  showFloatingText('💾 已保存', player.x, player.y - 40, '#66BB6A');
  return true;
}

function getPlayerBuffStore() {
  if (!window.playerBuffs || typeof window.playerBuffs !== 'object') {
    window.playerBuffs = {};
  }
  return window.playerBuffs;
}

function setVillageBuff(buffId, durationMs, payload = {}) {
  const buffs = getPlayerBuffStore();
  buffs[buffId] = {
    ...payload,
    expiresAt: Date.now() + Math.max(1000, Number(durationMs) || 1000)
  };
}

function hasVillageBuff(buffId) {
  const buffs = getPlayerBuffStore();
  const buff = buffs[buffId];
  return !!(buff && Number(buff.expiresAt) > Date.now());
}

function updateVillageBuffs() {
  const buffs = getPlayerBuffStore();
  const now = Date.now();
  for (const [buffId, buff] of Object.entries(buffs)) {
    if (!buff || Number(buff.expiresAt) <= now) {
      delete buffs[buffId];
      showToast(`🔔 ${buffId} 效果结束`);
    }
  }
}

function addInventoryItem(itemId, count = 1) {
  if (!itemId) return;
  if (!inventory[itemId] && inventory[itemId] !== 0) inventory[itemId] = 0;
  inventory[itemId] += Math.max(1, Number(count) || 1);
  if (typeof updateInventoryUI === 'function') updateInventoryUI();
}

const SPECIAL_BUILDING_EFFECTS = {
  library: {
    execute(village) {
      const words = (typeof getVillageWords === 'function' ? getVillageWords(village.biomeId) : []) || [];
      const picked = [...words].sort(() => Math.random() - 0.5).slice(0, 2);
      if (picked.length) {
        const hints = picked.map(w => `${w.en || w}/${w.zh || ''}`.trim()).join(' / ');
        showToast(`📚 学习: ${hints}`);
        if (typeof speakWord === 'function') {
          picked.forEach((w, i) => setTimeout(() => speakWord({ en: w.en || w, zh: w.zh || '' }), i * 700));
        }
      }
      if (typeof addScore === 'function') addScore(30);
      else score += 30;
      showFloatingText('+30 分', player.x, player.y - 30, '#FFD54F');
    }
  },
  hot_spring: {
    execute() {
      setVillageBuff('antiFreeze', 30000);
      playerHp = Math.min((Number(playerMaxHp) || 3), (Number(playerHp) || 0) + 2);
      if (typeof updateHpUI === 'function') updateHpUI();
      showToast('❤️ 抗冰冻30秒，恢复2点生命');
      showFloatingText('+2 HP', player.x, player.y - 30, '#80CBC4');
    }
  },
  water_station: {
    execute() {
      setVillageBuff('waterProtection', 30000);
      addInventoryItem('shell', 1);
      showToast('🛡️ 沙漠保护30秒，获得贝壳x1');
      showFloatingText('+1 shell', player.x, player.y - 30, '#4FC3F7');
    }
  },
  blacksmith: {
    execute() {
      addInventoryItem('iron', 3);
      if (typeof addScore === 'function') addScore(50);
      else score += 50;
      showToast('⚒️ 获得铁块x3，分数+50');
      showFloatingText('+3 iron +50', player.x, player.y - 30, '#B0BEC5');
    }
  },
  lighthouse: {
    execute() {
      setVillageBuff('lighthouse', 45000, { radius: 500 });
      showToast('🗼 视野增强45秒');
      showFloatingText('Light+', player.x, player.y - 30, '#FFF176');
    }
  },
  brewing_stand: {
    execute() {
      setVillageBuff('fireResistance', 30000);
      addInventoryItem('mushroom_stew', 1);
      showToast('🧪 抗火30秒，获得蘑菇煲x1');
      showFloatingText('FireRes+', player.x, player.y - 30, '#FF8A65');
    }
  }
};

function interactSpecialBuilding(village, buildingType) {
  if (!village || !buildingType) return false;
  if (village.specialUsed) {
    showToast(UI_TEXTS.specialUsed);
    return false;
  }

  const effect = SPECIAL_BUILDING_EFFECTS[buildingType];
  if (!effect) {
    showToast(UI_TEXTS.specialNoFunc);
    return false;
  }

  village.specialUsed = true;
  effect.execute(village);
  return true;
}
