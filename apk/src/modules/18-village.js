/**
 * 18-village.js - 鏉戝簞绯荤粺鏍稿績閫昏緫
 * v1.8.0 瀹炵幇鏉戝簞鍩虹妗嗘灦
 */

// ========== 鏉戝簞椋庢牸瀹氫箟 ==========
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

// ========== 鍔犺浇閰嶇疆 ==========
function loadVillageConfig() {
  // 浠?config/village.json 鍔犺浇锛屽け璐ユ椂鐢ㄩ粯璁ゅ€?
  // 鍦?17-bootstrap.js 鐨?loadAllConfigs() 涓皟鐢?
  const defaultVillageConfig = {
    enabled: true,
    spawnScoreInterval: 500,
    villageWidth: 800,
    safeZone: true,
    restHealFull: true,
    challengeQuestionCount: 3,
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
      save_stone: { w: 40, h: 50, offset: 550 },
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

  fetch('config/village.json')
    .then(r => r.json())
    .then(data => {
      villageConfig = data;
      console.log('[Village] 閰嶇疆鍔犺浇鎴愬姛');
    })
    .catch(() => {
      villageConfig = defaultVillageConfig;
      console.warn('[Village] 浣跨敤榛樿閰嶇疆');
    });
}

// ========== 鏉戝簞鐢熸垚 ==========
function maybeSpawnVillage(playerScore, playerX) {
  if (!settings || !settings.villageEnabled) return;
  if (!villageConfig || !villageConfig.enabled) return;
  const interval = villageConfig.spawnScoreInterval || 500;
  // 璁＄畻褰撳墠鍒嗘暟搴旇鐢熸垚鐨勬潙搴勭紪鍙?
  const villageIndex = Math.floor(playerScore / interval);
  if (villageIndex < 1) return; // 0鍒嗕笉鐢熸垚
  if (villageSpawnedForScore[villageIndex]) return; // 宸茬敓鎴?

  const biomeId = currentBiome || 'forest';
  const village = createVillage(playerX + 600, biomeId, villageIndex);
  activeVillages.push(village);
  villageSpawnedForScore[villageIndex] = true;

  // 鍥炴敹杩滃鐨勬潙搴?
  cleanupVillages(playerX);
  console.log(`[Village] 鐢熸垚鏉戝簞 #${villageIndex} at x=${village.x}, biome=${biomeId}`);
}

function createVillage(startX, biomeId, index) {
  const style = VILLAGE_STYLES[biomeId] || VILLAGE_STYLES.forest;
  const cfg = villageConfig.buildings || {};
  const village = {
    id: index,
    x: startX,
    width: villageConfig.villageWidth || 800,
    biomeId: biomeId,
    style: style,
    buildings: [
      { type: 'bed_house',  x: startX + (cfg.bed_house?.offset || 100),  w: cfg.bed_house?.w || 80,  h: cfg.bed_house?.h || 60 },
      { type: 'word_house', x: startX + (cfg.word_house?.offset || 300), w: cfg.word_house?.w || 100, h: cfg.word_house?.h || 80 },
      { type: 'save_stone', x: startX + (cfg.save_stone?.offset || 550), w: cfg.save_stone?.w || 40,  h: cfg.save_stone?.h || 50 },
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

  // v1.8.1 娣诲姞 NPC
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
  const max = villageConfig.maxActiveVillages || 3;
  // 绉婚櫎鐜╁韬悗瓒呰繃 2000px 鐨勬潙搴?
  activeVillages = activeVillages.filter(v => {
    return (v.x + v.width) > playerX - 2000;
  });
  // 濡傛灉浠嶈秴杩囦笂闄愶紝绉婚櫎鏈€杩滅殑
  while (activeVillages.length > max) {
    activeVillages.shift();
  }
}

// ========== NPC 鏉戞皯绯荤粺 (v1.8.1) ==========

const NPC_ROLES = {
  greeter: {
    greeting: 'Welcome! 娆㈣繋!',
    speed: 0.3,
    patrolRange: 120
  },
  teacher: {
    greeting: 'Come learn! 鏉ュ涔?',
    speed: 0.2,
    patrolRange: 80
  },
  trader: {
    greeting: 'Trade? 浜ゆ槗鍚?',
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
    // 鏉ュ洖璧板姩
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

    // 璧拌矾鍔ㄧ敾甯?
    npc.animTimer++;
    if (npc.animTimer >= 15) {
      npc.animTimer = 0;
      npc.animFrame = (npc.animFrame + 1) % 2;
    }

    // 鐜╁闈犺繎鏃舵樉绀烘皵娉?
    const dist = Math.abs(player.x - npc.x);
    const greetDist = villageConfig.npcGreetDistance || 80;
    if (dist < greetDist) {
      npc.showBubble = true;
      // 闈㈠悜鐜╁
      npc.facingRight = player.x > npc.x;
      npc.direction = 0; // 鍋滀笅鏉?
      npc.bubbleTimer = 120; // 姘旀场鎸佺画 2 绉?
    } else if (npc.bubbleTimer > 0) {
      npc.bubbleTimer--;
      if (npc.bubbleTimer <= 0) {
        npc.showBubble = false;
        // 鎭㈠宸￠€?
        npc.direction = npc.facingRight ? 1 : -1;
      }
    } else {
      npc.showBubble = false;
    }
  }
}

// ========== 鏉戝簞鐘舵€佹洿鏂?==========
function updateVillages() {
  if (!settings || !settings.villageEnabled) return;
  if (!player) return;
  if (typeof updateVillageBuffs === 'function') updateVillageBuffs();
  // 妫€鏌ユ槸鍚﹂渶瑕佺敓鎴愭柊鏉戝簞
  maybeSpawnVillage(score, player.x);
  // 妫€娴嬬帺瀹舵槸鍚﹀湪鏉戝簞鍐?
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
      // v1.8.1 鏇存柊鏉戞皯
      updateVillageNPCs(v);
      if (typeof tryAutoEnterVillageInterior === "function") {
        tryAutoEnterVillageInterior(v);
      }

      break;
    }
  }
  if (wasInVillage && !playerInVillage) {
    showToast(BIOME_MESSAGES.leaveVillage);
    // v1.8.2 娓呴櫎浼戞伅鎻愮ず
    hideRestPrompt();
  }
}

// ========== 浼戞伅绯荤粺 (v1.8.2) ==========
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
  if (!silent && wasActive) showToast("馃彔 宸茬寮€鎴垮眿");
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
  const label = building.type === "bed_house" ? "搴婂眿" : "璇嶅眿";
  showToast(`馃彔 杩涘叆${label}锛圗sc 閫€鍑猴級`);
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
  const text = reason || "馃彔 绂诲紑鎴垮眿";
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
    exitVillageInterior("馃彔 鎸戞垬缁撴潫锛屽凡绂诲紑璇嶅眿");
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

  const title = buildingType === "bed_house" ? "馃彔 搴婂眿瀹ゅ唴" : "馃摌 璇嶅眿瀹ゅ唴";
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
    exitVillageInterior("馃彔 绂诲紑鎴垮眿");
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
    showToast(type === "bed_house" ? "闈犺繎搴婂悗鎸夊疂绠遍敭" : "闈犺繎鍗曡瘝涔﹀悗鎸夊疂绠遍敭");
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
  if (village.restUsed) return; // 宸蹭娇鐢ㄨ繃
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

  // 妫€鏌ユ弧琛€鏉′欢
  const isFullHp = playerHp >= playerMaxHp;
  if (isFullHp && villageConfig.restHealFull) {
    showToast(UI_TEXTS.restFullHp);
    return;
  }

  // 鎵ц浼戞伅鍥炶
  if (villageConfig.restHealFull) {
    playerHp = playerMaxHp;
  } else {
    playerHp = Math.min(playerMaxHp, playerHp + 5);
  }

  updateHpUI();
  village.restUsed = true;
  hideRestPrompt();

  const healAmount = villageConfig.restHealFull ? '鍏ㄦ弧' : '+5';
  showToast(UI_TEXTS.restSuccess(healAmount));
  showFloatingText(UI_TEXTS.restHeal, player.x, player.y - 60);

  // 淇濆瓨杩涘害
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

// ========== v1.8.3 鏉戝簞鍗曡瘝绯荤粺 ==========
function getVillageWords(biomeId) {
  if (!villageConfig || !villageConfig.biomeWords) return [];
  return villageConfig.biomeWords[biomeId] || villageConfig.biomeWords.forest || [];
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
    case 'save_stone':
      saveVillageProgress(village);
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
  showFloatingText('馃捑 Save', player.x, player.y - 40, '#66BB6A');
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
      showToast(`鈴?${buffId} 鏁堟灉缁撴潫`);
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
        showToast(`馃摌 瀛︿範: ${hints}`);
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
      showToast('鉂わ笍 鎶楀啺鍐?0绉掞紝鎭㈠2鐢熷懡');
      showFloatingText('+2 HP', player.x, player.y - 30, '#80CBC4');
    }
  },
  water_station: {
    execute() {
      setVillageBuff('waterProtection', 30000);
      addInventoryItem('shell', 1);
      showToast('馃毀 娌欐紶淇濇姢30绉掞紝鑾峰緱璐濆３x1');
      showFloatingText('+1 shell', player.x, player.y - 30, '#4FC3F7');
    }
  },
  blacksmith: {
    execute() {
      addInventoryItem('iron', 3);
      if (typeof addScore === 'function') addScore(50);
      else score += 50;
      showToast('鈿掞笍 鑾峰緱閾佸潡x3锛屽垎鏁?50');
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
      showToast('鈿欙笍 鎶楃伀30绉掞紝鑾峰緱铇戣弴鐓瞲1');
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
