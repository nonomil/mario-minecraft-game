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

// ========== 加载配置 ==========
function loadVillageConfig() {
  // 从 config/village.json 加载，失败时用默认值
  // 在 17-bootstrap.js 的 loadAllConfigs() 中调用
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
      console.log('[Village] 配置加载成功');
    })
    .catch(() => {
      villageConfig = defaultVillageConfig;
      console.warn('[Village] 使用默认配置');
    });
}

// ========== 村庄生成 ==========
function maybeSpawnVillage(playerScore, playerX) {
  if (!settings.villageEnabled || !villageConfig.enabled) return;
  const interval = villageConfig.spawnScoreInterval || 500;
  // 计算当前分数应该生成的村庄编号
  const villageIndex = Math.floor(playerScore / interval);
  if (villageIndex < 1) return; // 0分不生成
  if (villageSpawnedForScore[villageIndex]) return; // 已生成

  const biomeId = currentBiome || 'forest';
  const village = createVillage(playerX + 600, biomeId, villageIndex);
  activeVillages.push(village);
  villageSpawnedForScore[villageIndex] = true;

  // 回收远离的村庄
  cleanupVillages(playerX);
  console.log(`[Village] 生成村庄 #${villageIndex} at x=${village.x}, biome=${biomeId}`);
}

function createVillage(startX, biomeId, index) {
  const style = VILLAGE_STYLES[biomeId] || VILLAGE_STYLES.forest;
  const cfg = villageConfig.buildings || {};
  return {
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
    npcs: [],       // v1.8.1 实现
    decorations: style.decorations.map((d, i) => ({
      type: d, x: startX + 50 + i * 150
    })),
    visited: false,
    restUsed: false,
    questCompleted: false,
    saved: false
  };

  // v1.8.1 添加 NPC
  const roles = ['greeter', 'teacher', 'trader'];
  const baseX = startX + 200;
  village.npcs = roles.map((role, i) =>
    createVillageNPC(baseX + i * 200, role, village.x, village.width)
  );

  return village;
}

function cleanupVillages(playerX) {
  const max = villageConfig.maxActiveVillages || 3;
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
    const greetDist = villageConfig.npcGreetDistance || 80;
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
  if (!settings.villageEnabled) return;
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
        showToast(`🏘️ 进入${biomeName}村庄`);
      }
      // v1.8.1 更新村民 (v1.8.1)
      updateVillageNPCs(v);

      // v1.8.2 检测休息屋 (v1.8.2)
      checkVillageRest(v);
      break;
    }
  }
  if (wasInVillage && !playerInVillage) {
    showToast('👋 离开村庄');
    // v1.8.2 清除休息提示
    hideRestPrompt();
  }
}

// ========== 休息系统 (v1.8.2) ==========
let restPromptVisible = false;
let restPromptVillage = null;

function checkVillageRest(village) {
  if (!village) return;
  if (village.restUsed) return; // 已使用过

  // 查找 bed_house 建筑
  const bedHouse = village.buildings.find(b => b.type === 'bed_house');
  if (!bedHouse) return;

  // 检测玩家是否在床屋区域内
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

    // 检测玩家是否在建筑区域内
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

  // 动态创建休息提示
  const prompt = document.createElement('div');
  prompt.id = 'rest-prompt';
  prompt.className = 'rest-prompt';
  prompt.innerHTML = `
    <div class="rest-prompt-content">
      <div>💤 休息回血</div>
      <button id="btn-rest" class="game-btn">休息 (Y)</button>
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
    showToast('💤 已经休息过了');
    return;
  }

  // 检查满血条件
  const isFullHp = playerHp >= playerMaxHp;
  if (isFullHp && villageConfig.restHealFull) {
    showToast('❤️ 已满血，无需休息');
    return;
  }

  // 执行休息回血
  if (villageConfig.restHealFull) {
    playerHp = playerMaxHp;
  } else {
    playerHp = Math.min(playerMaxHp, playerHp + 5);
  }

  updateHpUI();
  village.restUsed = true;
  hideRestPrompt();

  const healAmount = villageConfig.restHealFull ? '全满' : '+5';
  showToast(`💤 休息成功！生命${healAmount}`);
  showFloatingText('❤️ +休息', player.x, player.y - 60);

  // 保存进度
  if (typeof saveCurrentProgress === 'function') {
    saveCurrentProgress();
  }
}

// ========== 辅助函数 ==========
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
  const biome = biomeConfigs[biomeId];
  return biome ? biome.name : biomeId;
}

// ========== v1.8.3 村庄单词系统 ==========
function getVillageWords(biomeId) {
  if (!villageConfig || !villageConfig.biomeWords) return [];
  return villageConfig.biomeWords[biomeId] || villageConfig.biomeWords.forest || [];
}

function handleVillageInteraction(building, village) {
  if (!building || !village) return false;

  switch (building.type) {
    case 'bed_house':
      // v1.8.2 休息系统已在 checkVillageRest 中处理
      return true;
    case 'word_house':
      // v1.8.3 单词学习屋
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
      // v1.8.4 存档石碑
      if (typeof saveVillageProgress === 'function') {
        saveVillageProgress(village);
      }
      return true;
    case 'special':
      // v1.8.4 特色建筑
      showToast('🏗 特色建筑暂未开放');
      return true;
  }
  return false;
}

function saveVillageProgress(village) {
  village.saved = true;
  showToast('💾 游戏进度已保存');
  // 这里可以添加实际的存档逻辑
}
