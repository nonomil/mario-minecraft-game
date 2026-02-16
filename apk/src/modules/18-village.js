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

  // 鍥炴敹杩滅鐨勬潙搴?
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

  return village;
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
        showToast(`馃彉锔?杩涘叆${biomeName}鏉戝簞`);
      }
      // v1.8.1 鏇存柊鏉戞皯 (v1.8.1)
      updateVillageNPCs(v);

      // v1.8.2 妫€娴嬩紤鎭眿 (v1.8.2)
      checkVillageRest(v);
      break;
    }
  }
  if (wasInVillage && !playerInVillage) {
    showToast('馃憢 绂诲紑鏉戝簞');
    // v1.8.2 娓呴櫎浼戞伅鎻愮ず
    hideRestPrompt();
  }
}

// ========== 浼戞伅绯荤粺 (v1.8.2) ==========
let restPromptVisible = false;
let restPromptVillage = null;

function checkVillageRest(village) {
  if (!village) return;
  if (village.restUsed) return; // 宸蹭娇鐢ㄨ繃

  // 鏌ユ壘 bed_house 寤虹瓚
  const bedHouse = village.buildings.find(b => b.type === 'bed_house');
  if (!bedHouse) return;

  // 妫€娴嬬帺瀹舵槸鍚﹀湪搴婂眿鍖哄煙鍐?
  const inBedHouse = player.x >= bedHouse.x && player.x <= bedHouse.x + bedHouse.w;
  if (inBedHouse && !restPromptVisible) {
    showRestPrompt(village);
  } else if (!inBedHouse && restPromptVisible) {
    hideRestPrompt();
  }
}

function checkVillageBuildings(village) {
  if (!village) return;

  for (const building of village.buildings) {
    const buildingLeft = building.x;
    const buildingRight = building.x + building.w;

    // 妫€娴嬬帺瀹舵槸鍚﹀湪寤虹瓚鍖哄煙鍐?
    if (player.x + player.width / 2 >= buildingLeft &&
        player.x + player.width / 2 <= buildingRight) {
      handleVillageInteraction(building, village);
    }
  }
}

function showRestPrompt(village) {
  restPromptVisible = true;
  restPromptVillage = village;
  const restPromptEl = document.getElementById('rest-prompt');
  if (restPromptEl) {
    restPromptEl.style.display = 'block';
    return;
  }

  // 鍔ㄦ€佸垱寤轰紤鎭彁绀?
  const prompt = document.createElement('div');
  prompt.id = 'rest-prompt';
  prompt.className = 'rest-prompt';
  prompt.innerHTML = `
    <div class="rest-prompt-content">
      <div>馃挙 浼戞伅鍥炶</div>
      <button id="btn-rest" class="game-btn">浼戞伅 (Y)</button>
    </div>
  `;
  document.getElementById('game-container').appendChild(prompt);

  const btnRest = document.getElementById('btn-rest');
  if (btnRest) {
    btnRest.addEventListener('click', () => {
      performRest(restPromptVillage);
    });
  }
}

function hideRestPrompt() {
  restPromptVisible = false;
  restPromptVillage = null;
  const restPromptEl = document.getElementById('rest-prompt');
  if (restPromptEl) {
    restPromptEl.style.display = 'none';
  }
}

function performRest(village) {
  if (!village) return;
  if (village.restUsed) {
    showToast('馃挙 宸茬粡浼戞伅杩囦簡');
    return;
  }

  // 妫€鏌ユ弧琛€鏉′欢
  const isFullHp = playerHp >= playerMaxHp;
  if (isFullHp && villageConfig.restHealFull) {
    showToast('鉂わ笍 宸叉弧琛€锛屾棤闇€浼戞伅');
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
  showToast(`馃挙 浼戞伅鎴愬姛锛佺敓鍛?{healAmount}`);
  showFloatingText('鉂わ笍 +浼戞伅', player.x, player.y - 60);

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
      return true;
    case 'word_house':
      if (village.questCompleted) {
        showToast('📚 已完成学习任务');
        return false;
      }
      if (typeof startVillageChallenge === 'function') {
        startVillageChallenge(village, () => {
          village.questCompleted = true;
        });
      }
      return true;
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

function saveVillageProgress(village) {
  if (!village) return false;
  if (village.saved) {
    showToast('💾 本村庄已存档');
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
  showToast('💾 游戏进度已保存');
  showFloatingText('💾 Save', player.x, player.y - 40, '#66BB6A');
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
      showToast(`⏱ ${buffId} 效果结束`);
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
        const hints = picked.map(w => `${w.en || w}/${w.zh || ''}`.trim()).join('、');
        showToast(`📘 学习: ${hints}`);
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
      showToast('❤️ 抗冰冻30秒，恢复2生命');
      showFloatingText('+2 HP', player.x, player.y - 30, '#80CBC4');
    }
  },
  water_station: {
    execute() {
      setVillageBuff('waterProtection', 30000);
      addInventoryItem('shell', 1);
      showToast('🚧 沙漠保护30秒，获得贝壳x1');
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
      showToast('⚙️ 抗火30秒，获得蘑菇煲x1');
      showFloatingText('FireRes+', player.x, player.y - 30, '#FF8A65');
    }
  }
};

function interactSpecialBuilding(village, buildingType) {
  if (!village || !buildingType) return false;
  if (village.specialUsed) {
    showToast('🏗 该特色建筑已使用');
    return false;
  }

  const effect = SPECIAL_BUILDING_EFFECTS[buildingType];
  if (!effect) {
    showToast('🏗 特色建筑暂无功能');
    return false;
  }

  village.specialUsed = true;
  effect.execute(village);
  return true;
}
