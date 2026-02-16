/**
 * 18-village.js - 村庄系统核心逻辑 (v1.9.0)
 * 每500分生成一个村庄，包含休息、学习、存档等建筑
 */

const VILLAGE_STYLES = {
    forest: { ground: "#5D4037", roof: "#8D6E63", wall: "#D7CCC8", accent: "#4CAF50", path: "#795548" },
    snow: { ground: "#B0BEC5", roof: "#546E7A", wall: "#ECEFF1", accent: "#42A5F5", path: "#90A4AE" },
    desert: { ground: "#F9A825", roof: "#E65100", wall: "#FFF8E1", accent: "#FF8F00", path: "#FFB300" },
    mountain: { ground: "#78909C", roof: "#455A64", wall: "#CFD8DC", accent: "#607D8B", path: "#90A4AE" },
    ocean: { ground: "#0277BD", roof: "#01579B", wall: "#E1F5FE", accent: "#039BE5", path: "#0288D1" },
    nether: { ground: "#4E342E", roof: "#BF360C", wall: "#3E2723", accent: "#FF5722", path: "#5D4037" }
};

const BUILDING_DEFS = {
    bed_house: { w: 80, h: 70, label: "🛏️ 休息", icon: "🛏️" },
    word_house: { w: 90, h: 75, label: "📖 学习", icon: "📖" },
    save_stone: { w: 50, h: 60, label: "💾 存档", icon: "💾" },
    special: { w: 70, h: 65, label: "⭐ 特殊", icon: "⭐" }
};

let activeVillages = [];
let villageSpawnedForScore = {};
let playerInVillage = false;
let currentVillage = null;

function createVillageNPC(x, y) {
    return {
        x, y: y - 48, width: 24, height: 48,
        velX: 0, dir: 1, walkTimer: 0, walkDuration: 60,
        idleTimer: 0, state: "idle", chatBubble: "", chatTimer: 0
    };
}

function createVillage(baseX, biomeId, index) {
    const style = VILLAGE_STYLES[biomeId] || VILLAGE_STYLES.forest;
    const vw = (villageConfig && villageConfig.villageWidth) || 800;
    const buildingTypes = (villageConfig && villageConfig.buildings) || ["bed_house", "word_house", "save_stone", "special"];
    const buildings = [];
    const spacing = vw / (buildingTypes.length + 1);

    for (let i = 0; i < buildingTypes.length; i++) {
        const type = buildingTypes[i];
        const def = BUILDING_DEFS[type] || BUILDING_DEFS.bed_house;
        const bx = baseX + spacing * (i + 1) - def.w / 2;
        const by = groundY - def.h;
        buildings.push({
            type, x: bx, y: by, width: def.w, height: def.h,
            label: def.label, icon: def.icon, used: false, interactCooldown: 0
        });
    }
    const npcs = [];
    for (let i = 0; i < 2; i++) {
        npcs.push(createVillageNPC(baseX + spacing * (i + 1), groundY));
    }

    return {
        x: baseX, width: vw, biome: biomeId, style, index,
        buildings, npcs, entered: false
    };
}

function maybeSpawnVillage(playerScore, playerX) {
    if (!villageConfig || !villageConfig.enabled) return;
    if (settings && settings.villageEnabled === false) return;
    const interval = villageConfig.spawnScoreInterval || 500;
    const idx = Math.floor(playerScore / interval);
    if (idx < 1 || villageSpawnedForScore[idx]) return;
    villageSpawnedForScore[idx] = true;
    const spawnX = playerX + 600 + Math.random() * 200;
    const biomeId = (typeof currentBiome !== 'undefined' && currentBiome) ? currentBiome : "forest";
    const v = createVillage(spawnX, biomeId, idx);
    activeVillages.push(v);
    showToast("🏘️ 前方发现村庄!");
}

function updateVillageNPCs(village) {
    village.npcs.forEach(npc => {
        if (npc.chatTimer > 0) npc.chatTimer--;
        if (npc.state === "idle") {
            npc.idleTimer--;
            if (npc.idleTimer <= 0) {
                npc.state = "walk";
                npc.dir = Math.random() > 0.5 ? 1 : -1;
                npc.walkDuration = 40 + Math.random() * 60;
                npc.walkTimer = npc.walkDuration;
            }
        } else {
            npc.x += npc.dir * 0.5;
            npc.walkTimer--;
            if (npc.x < village.x + 20) { npc.x = village.x + 20; npc.dir = 1; }
            if (npc.x > village.x + village.width - 40) { npc.x = village.x + village.width - 40; npc.dir = -1; }
            if (npc.walkTimer <= 0) {
                npc.state = "idle";
                npc.idleTimer = 60 + Math.random() * 90;
            }
        }
    });
}
function handleVillageInteraction(building, village) {
    if (!building || building.interactCooldown > 0) return;
    building.interactCooldown = 60;

    if (building.type === "bed_house") {
        if (villageConfig.restHealFull) {
            playerHp = playerMaxHp;
        } else {
            playerHp = Math.min(playerMaxHp, playerHp + 1);
        }
        showToast("🛏️ 休息完毕，生命恢复!");
        showFloatingText(player.x, player.y - 20, "+HP");
        building.used = true;
    } else if (building.type === "word_house") {
        if (typeof startVillageChallenge === 'function') {
            startVillageChallenge(village, (result) => {
                if (result === "perfect") {
                    const r = villageConfig.challengeReward.perfect;
                    if (typeof addScore === 'function') addScore(r.score);
                    else score += r.score;
                    if (inventory) inventory.diamond = (inventory.diamond || 0) + r.diamonds;
                    showToast(`📖 全部正确! +${r.score}分 +${r.diamonds}💎`);
                } else if (result === "partial") {
                    const r = villageConfig.challengeReward.partial;
                    if (typeof addScore === 'function') addScore(r.score);
                    else score += r.score;
                    showToast(`📖 部分正确! +${r.score}分`);
                }
            });
        }
        building.used = true;
    } else if (building.type === "save_stone") {
        if (typeof saveCurrentProgress === 'function') saveCurrentProgress();
        showToast("💾 进度已保存!");
        building.used = true;
    } else if (building.type === "special") {
        const bonus = 50 + Math.floor(Math.random() * 50);
        if (typeof addScore === 'function') addScore(bonus);
        else score += bonus;
        showToast(`⭐ 获得 ${bonus} 分奖励!`);
        building.used = true;
    }
}

function updateVillages() {
    if (!villageConfig || !villageConfig.enabled) return;
    if (settings && settings.villageEnabled === false) return;
    if (!player) return;

    maybeSpawnVillage(getProgressScore(), player.x);

    const px = player.x;
    let inAny = false;
    activeVillages.forEach(v => {
        if (px >= v.x && px <= v.x + v.width) {
            inAny = true;
            if (!v.entered) {
                v.entered = true;
                showToast("🏘️ 进入村庄 — 按(🧰)与建筑互动");
            }
            currentVillage = v;
            // 建筑冷却更新
            v.buildings.forEach(b => {
                if (b.interactCooldown > 0) b.interactCooldown--;
            });
        }
        updateVillageNPCs(v);
    });

    playerInVillage = inAny;
    if (!inAny) currentVillage = null;

    // 清理远处村庄
    activeVillages = activeVillages.filter(v => {
        return Math.abs(player.x - (v.x + v.width / 2)) < 3000;
    });
}

/** Called from handleInteraction() when player presses interact key in a village */
function tryVillageInteraction() {
    if (!playerInVillage || !currentVillage || !player) return false;
    const px = player.x;
    for (const b of currentVillage.buildings) {
        if (!b.used && b.interactCooldown <= 0 &&
            Math.abs(px - (b.x + b.width / 2)) < b.width / 2 + 20 &&
            Math.abs(player.y - b.y) < b.height + 20) {
            handleVillageInteraction(b, currentVillage);
            return true;
        }
    }
    return false;
}
