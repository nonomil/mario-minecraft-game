/**
 * 13-game-loop.js - 游戏主循环、背包、装备
 * 从 main.js 拆分 (原始行 3818-4571)
 */
function optimizedUpdate(entity, updateFn) {
    const margin = blockSize * 2;
    const onScreen = entity.x > cameraX - margin && entity.x < cameraX + canvas.width + margin;
    if (onScreen) {
        updateFn();
    } else if (gameFrame % 3 === 0) {
        updateFn();
    }
}

function checkBossSpawn() {
    if (bossSpawned) return;
    const enemyConfig = getEnemyConfig();
    if (getProgressScore() >= (enemyConfig.bossSpawnScore || 5000)) {
        bossSpawned = true;
        const dragon = new Enemy(player.x + 300, 100, "ender_dragon");
        enemies.push(dragon);
        showToast("⚠️ 末影龙降临！");
    }
}

function update() {
    if (paused) return;
    updateCurrentBiome();
    applyBiomeEffectsToPlayer();
    tickWeather();
    if (keys.right) {
        if (player.velX < player.speed) player.velX++;
        player.facingRight = true;
    }
    if (keys.left) {
        if (player.velX > -player.speed) player.velX--;
        player.facingRight = false;
    }

    player.velX *= gameConfig.physics.friction;
    let currentGravity = gameConfig.physics.gravity;
    if (Math.abs(player.velY) < 1.0) currentGravity = gameConfig.physics.gravity * 0.4;
    player.velY += currentGravity;
    player.grounded = false;

    for (let p of platforms) {
        const dir = colCheck(player, p);
        if (dir === "l" || dir === "r") player.velX = 0;
        else if (dir === "b") {
            player.grounded = true;
            player.jumpCount = 0;
            coyoteTimer = gameConfig.jump.coyoteFrames;
        } else if (dir === "t") {
            player.velY *= -1;
        }
    }

    for (let t of trees) {
        const trunkX = t.x + (t.width - 30) / 2;
        const trunkY = t.y + t.height - 60;
        const dir = colCheckRect(player.x, player.y, player.width, player.height, trunkX, trunkY, 30, 60);
        if (dir) {
            if (dir === "l" || dir === "r") player.velX = 0;
            else if (dir === "b") {
                player.grounded = true;
                player.jumpCount = 0;
                player.y = trunkY - player.height;
                coyoteTimer = gameConfig.jump.coyoteFrames;
            }
        }
    }

    if (!player.grounded && coyoteTimer > 0) {
        coyoteTimer--;
    }

    if (jumpBuffer > 0) {
        jumpBuffer--;
    }

    if (jumpBuffer > 0) {
        if (coyoteTimer > 0) {
            player.velY = player.jumpStrength;
            player.grounded = false;
            player.jumpCount = 1;
            coyoteTimer = 0;
            jumpBuffer = 0;
        } else if (player.jumpCount < player.maxJumps) {
            player.velY = player.jumpStrength * 0.8;
            player.jumpCount++;
            jumpBuffer = 0;
        }
    }

    if (player.grounded) player.velY = 0;

    player.x += player.velX;
    player.y += player.velY;

    if (player.y > fallResetY) {
        player.y = 0;
        player.x -= 200;
        if (player.x < 0) player.x = 100;
        player.velY = 0;
    }

    let targetCamX = player.x - cameraOffsetX;
    if (targetCamX < 0) targetCamX = 0;
    if (targetCamX > cameraX) cameraX = targetCamX;

    updateMapGeneration();

    decorations.forEach(d => {
        d.update();
        if ((d.interactive || d.harmful) && rectIntersect(player.x, player.y, player.width, player.height, d.x, d.y, d.width, d.height)) {
            d.onCollision(player);
        }
    });
    decorations = decorations.filter(d => d.x + d.width > cameraX - removeThreshold && !d.remove);

    if (particles.length) {
        particles.forEach(p => p.update());
        particles = particles.filter(p => !p.remove);
    }
    spawnBiomeParticles();

    checkBossSpawn();

    playerPositionHistory.push({ x: player.x, y: player.y, frame: gameFrame });
    if (playerPositionHistory.length > 150) playerPositionHistory.shift();

    golems.forEach(g => optimizedUpdate(g, () => g.update(player, playerPositionHistory, enemies, platforms)));
    golems = golems.filter(g => !g.remove && g.x > cameraX - 260);

    enemies.forEach(e => {
        optimizedUpdate(e, () => e.update(player));
        if (e.remove || e.y > 900) return;
        if (colCheck(player, e)) {
            if (player.velY > 0 && player.y + player.height < e.y + e.height * 0.8) {
                e.takeDamage(999);
                player.velY = -4;
            } else {
                damagePlayer(Number(e.damage) || 10, e.x);
            }
        }
    });
    enemies = enemies.filter(e => !e.remove && e.y < 950);

    if (projectiles.length) {
        projectiles.forEach(p => optimizedUpdate(p, () => p.update(player, golems, enemies)));
        projectiles = projectiles.filter(p => {
            const inRange = p.x > cameraX - 300 && p.x < cameraX + 1200;
            if (!inRange) p.remove = true;
            return !p.remove && inRange;
        });
    }

    items.forEach(item => {
        item.floatY = Math.sin(gameFrame / 20) * 5;
        if (rectIntersect(player.x, player.y, player.width, player.height, item.x, item.y + item.floatY, 30, 30)) {
            item.collected = true;
            addScore(gameConfig.scoring.word);
            recordWordProgress(item.wordObj);
            speakWord(item.wordObj);
            showFloatingText(item.wordObj.zh, item.x, item.y);
            maybeTriggerLearningChallenge(item.wordObj);
        }
    });

    wordGates.forEach(gate => {
        if (gate.cooldown > 0) gate.cooldown--;
        if (gate.locked && gate.cooldown <= 0 && rectIntersect(player.x, player.y, player.width, player.height, gate.x, gate.y, gate.width, gate.height)) {
            triggerWordGateChallenge(gate);
        }
    });
    wordGates = wordGates.filter(gate => !gate.remove);

    if (player.isAttacking) {
        player.attackTimer--;
        if (player.attackTimer <= 0) player.isAttacking = false;
    }

    floatingTexts = floatingTexts.filter(t => t.life > 0);
    floatingTexts.forEach(t => {
        t.y -= 1;
        t.life--;
    });

    if (playerInvincibleTimer > 0) playerInvincibleTimer--;
    if (playerWeapons.attackCooldown > 0) playerWeapons.attackCooldown--;
    if (playerWeapons.isCharging) {
        const weapon = WEAPONS.bow;
        playerWeapons.chargeTime = Math.min(weapon.chargeMax, playerWeapons.chargeTime + 1);
    }

    // Biomes are score-driven now; the old "next level / scene switch" caused conflicts.
    updateDifficultyState();
    gameFrame++;
}

function addScore(points) {
    score += points;
    levelScore += points;
    if (score < 0) score = 0;
    if (levelScore < 0) levelScore = 0;
    runBestScore = Math.max(runBestScore, score);
    document.getElementById("score").innerText = score;
    checkAchievement("score", score);
    updateDifficultyState();
}

function updateHpUI() {
    const el = document.getElementById("hp");
    if (!el) return;
    const maxPerRow = 5;
    const total = Math.max(0, playerMaxHp);
    const filled = Math.max(0, Math.min(playerHp, total));
    const rows = Math.ceil(total / maxPerRow) || 1;
    let html = "";
    for (let r = 0; r < rows; r++) {
        const rowStart = r * maxPerRow;
        const rowEnd = Math.min(total, rowStart + maxPerRow);
        const rowFilled = Math.max(0, Math.min(filled - rowStart, rowEnd - rowStart));
        const rowEmpty = (rowEnd - rowStart) - rowFilled;
        let rowHtml = "";
        for (let i = 0; i < rowFilled; i++) rowHtml += `<span class="hp-heart">❤️</span>`;
        for (let i = 0; i < rowEmpty; i++) rowHtml += `<span class="hp-heart">🖤</span>`;
        html += `<div class="hp-row">${rowHtml}</div>`;
    }
    el.innerHTML = html;
}

function getDiamondCount() {
    return Number(inventory.diamond) || 0;
}

function updateDiamondUI() {
    updateInventoryUI();
}

function useDiamondForHp() {
    if (playerHp >= playerMaxHp) {
        showToast("❤️ 已满血");
        return;
    }
    if (getDiamondCount() < 1) {
        showToast("💎 不足");
        return;
    }
    inventory.diamond -= 1;
    healPlayer(1);
    updateDiamondUI();
    showToast("💎 换取 +1❤️");
}

function getLearnedWordCount() {
    const vocab = progress && progress.vocab ? Object.keys(progress.vocab) : [];
    return vocab.length;
}

function recordEnemyKill(type) {
    enemyKillStats.total = (enemyKillStats.total || 0) + 1;
    enemyKillStats[type] = (enemyKillStats[type] || 0) + 1;
    onEnemyKilled();
}

function healPlayer(amount) {
    if (playerHp <= 0) return;
    playerHp = Math.min(playerMaxHp, playerHp + amount);
    updateHpUI();
}

function scorePenaltyForDamage(amount) {
    const dmg = Math.max(0, Number(amount) || 0);
    // Score is the "HP" proxy in this game: lose a few points on contact, but not too punishing.
    const scale = typeof gameConfig?.scoring?.hitPenaltyScale === "number" ? gameConfig.scoring.hitPenaltyScale : 0.5;
    const minPenalty = typeof gameConfig?.scoring?.minHitPenalty === "number" ? gameConfig.scoring.minHitPenalty : 5;
    const maxPenalty = typeof gameConfig?.scoring?.maxHitPenalty === "number" ? gameConfig.scoring.maxHitPenalty : 30;
    const raw = Math.round(dmg * scale);
    return Math.max(minPenalty, Math.min(maxPenalty, raw || minPenalty));
}

function damagePlayer(amount, sourceX, knockback = 90) {
    if (playerInvincibleTimer > 0) return;
    const invFrames = Number(getDifficultyConfig().invincibleFrames ?? 30) || 30;
    playerInvincibleTimer = Math.max(10, invFrames);
    lastDamageFrame = gameFrame;
    const dir = sourceX != null ? (player.x > sourceX ? 1 : -1) : -1;
    player.x += dir * knockback;
    player.y -= 40;
    const baseDamage = Math.max(1, Number(amount) || 1);
    const diff = getDifficultyState();
    const damageUnit = Number(getDifficultyConfig().damageUnit ?? 20) || 20;
    const scaledDamage = Math.max(1, Math.round((baseDamage * diff.enemyDamageMult) / damageUnit));
    const penalty = scorePenaltyForDamage(baseDamage * diff.enemyDamageMult);
    addScore(-penalty);
    const defense = getArmorDefense();
    const reduction = Math.min(0.5, defense * 0.1);
    const actualDamage = Math.max(1, Math.round(scaledDamage * (1 - reduction)));
    if (playerEquipment.armor && playerEquipment.armorDurability > 0) {
        playerEquipment.armorDurability = Math.max(0, playerEquipment.armorDurability - 5);
        if (playerEquipment.armorDurability <= 0) {
            const broken = ARMOR_TYPES[playerEquipment.armor];
            showToast(`${broken?.name || "盔甲"} 已破损`);
            playerEquipment.armor = null;
            playerEquipment.armorDurability = 0;
        }
    }
    updateArmorUI();
    playerHp = Math.max(0, playerHp - actualDamage);
    updateHpUI();
    showFloatingText(`-${penalty}分`, player.x, player.y);
    if (playerHp <= 0 || score <= 0) {
        triggerGameOver();
    }
}

function nextLevel() {
    // Deprecated: scenes are controlled by biomes now.
    levelScore = 0;
}

function showToast(msg) {
    const t = document.getElementById("toast");
    t.innerText = msg;
    t.style.display = "block";
    setTimeout(() => t.style.display = "none", 2000);
}

function showFloatingText(text, x, y) {
    floatingTexts.push({ text, x, y, life: 60 });
}

function updateInventoryUI() {
    const ids = {
        diamond: "count-diamond",
        pumpkin: "count-pumpkin",
        iron: "count-iron",
        stick: "count-stick",
        stone_sword: "count-stone_sword",
        iron_pickaxe: "count-iron_pickaxe",
        bow: "count-bow",
        arrow: "count-arrow"
    };
    Object.keys(ids).forEach(key => {
        const el = document.getElementById(ids[key]);
        if (el) el.innerText = inventory[key] ?? 0;
    });
    const slots = Array.from(document.querySelectorAll(".inventory-bar .inv-slot:not(.inv-slot-button)"));
    slots.forEach((s, idx) => {
        s.classList.toggle("selected", idx === selectedSlot);
    });
    syncWeaponsFromInventory();
    updateWeaponUI();
    updateInventoryModal();
}

function getInventoryEntries(keys) {
    return keys
        .map(key => ({
            key,
            count: Number(inventory[key]) || 0,
            label: ITEM_LABELS[key] || key,
            icon: ITEM_ICONS[key] || "📦"
        }))
        .filter(entry => entry.count > 0);
}

function renderInventoryModal() {
    if (!inventoryContentEl) return;
    if (inventoryTab === "equipment") {
        const armorLabel = playerEquipment.armor ? (ARMOR_TYPES[playerEquipment.armor]?.name || playerEquipment.armor) : "无";
        const armorDur = playerEquipment.armor ? `${playerEquipment.armorDurability}%` : "--";
        const armorList = (armorInventory || []).map(entry => {
            const name = ARMOR_TYPES[entry.id]?.name || entry.id;
            return `${name} (${entry.durability}%)`;
        });
        const weapons = getInventoryEntries(["stone_sword", "iron_pickaxe", "bow", "arrow"]);
        const armorHtml = `
            <div class="inventory-equipment">
                <div>🛡️ 护甲：${armorLabel}</div>
                <div>耐久：${armorDur}</div>
                <div>库存：${armorList.length ? armorList.join("、") : "无"}</div>
            </div>
        `;
        const weaponHtml = weapons.length
            ? weapons.map(entry => `
                <div class="inventory-item" data-item="${entry.key}" onclick="window.useInventoryItem && window.useInventoryItem('${entry.key}')">
                    <div class="inventory-item-left">
                        <div class="inventory-item-icon">${entry.icon}</div>
                        <div>${entry.label}</div>
                    </div>
                    <div class="inventory-item-count">${entry.count}</div>
                </div>
            `).join("")
            : `<div class="inventory-empty">暂无装备</div>`;
        inventoryContentEl.innerHTML = `${armorHtml}${weaponHtml}`;
        return;
    }

    const keys = INVENTORY_CATEGORIES[inventoryTab] || [];
    const entries = getInventoryEntries(keys);
    if (!entries.length) {
        inventoryContentEl.innerHTML = `<div class="inventory-empty">暂无物品</div>`;
        return;
    }
    inventoryContentEl.innerHTML = entries.map(entry => `
        <div class="inventory-item" data-item="${entry.key}" onclick="window.useInventoryItem && window.useInventoryItem('${entry.key}')">
            <div class="inventory-item-left">
                <div class="inventory-item-icon">${entry.icon}</div>
                <div>${entry.label}</div>
            </div>
            <div class="inventory-item-count">${entry.count}</div>
        </div>
    `).join("");
}

function setInventoryTab(tab) {
    inventoryTab = tab;
    if (inventoryTabButtons) {
        inventoryTabButtons.forEach(btn => {
            btn.classList.toggle("active", btn.dataset.tab === tab);
        });
    }
    renderInventoryModal();
}

function showInventoryModal() {
    if (!inventoryModalEl) return;
    pausedByModal = !paused;
    paused = true;
    inventoryModalEl.classList.add("visible");
    inventoryModalEl.setAttribute("aria-hidden", "false");
    renderInventoryModal();
}

function hideInventoryModal() {
    if (!inventoryModalEl) return;
    inventoryModalEl.classList.remove("visible");
    inventoryModalEl.setAttribute("aria-hidden", "true");
    if (pausedByModal) paused = false;
    pausedByModal = false;
}

function updateInventoryModal() {
    if (!inventoryModalEl || !inventoryModalEl.classList.contains("visible")) return;
    renderInventoryModal();
}

// 背包物品使用函数
function useInventoryItem(itemKey) {
    const count = Number(inventory[itemKey]) || 0;
    if (count <= 0) {
        showToast("❌ 物品不足");
        return;
    }

    const itemName = ITEM_LABELS[itemKey] || itemKey;
    let used = false;

    // 消耗品使用
    if (itemKey === "diamond") {
        if (playerHp >= playerMaxHp) {
            showToast("❤️ 已满血");
            return;
        }
        inventory.diamond -= 1;
        healPlayer(1);
        showFloatingText("+1❤️", player.x, player.y - 60);
        showToast(`💎 恢复生命`);
        used = true;
    } else if (itemKey === "pumpkin") {
        if (playerHp >= playerMaxHp) {
            showToast("❤️ 已满血");
            return;
        }
        inventory.pumpkin -= 1;
        healPlayer(2);
        showFloatingText("+2❤️", player.x, player.y - 60);
        showToast(`🎃 恢复2点生命`);
        used = true;
    }
    // 武器切换
    else if (itemKey === "stone_sword" || itemKey === "iron_pickaxe") {
        const weaponMap = {
            stone_sword: "sword",
            iron_pickaxe: "pickaxe"
        };
        const weaponId = weaponMap[itemKey];
        if (weaponId && playerWeapons.current !== weaponId) {
            playerWeapons.current = weaponId;
            playerWeapons.attackCooldown = 0;
            const weapon = WEAPONS[weaponId];
            updateWeaponUI();
            showToast(`⚔️ 切换到 ${weapon.emoji} ${weapon.name}`);
            used = true;
        } else {
            showToast("⚔️ 已装备当前武器");
        }
    }
    // 箭矢
    else if (itemKey === "arrow") {
        showToast(`🏹 箭矢数量: ${count}`);
    }
    // 其他材料
    else {
        showToast(`${itemName}: ${count}个`);
    }

    if (used) {
        updateHpUI();
        updateInventoryUI();
        updateInventoryModal(); // 刷新背包显示
    }
}

// 导出到全局供 HTML onclick 使用
if (typeof window !== "undefined") {
    window.useInventoryItem = useInventoryItem;
}

function addArmorToInventory(armorId) {
    if (!ARMOR_TYPES[armorId]) return;
    armorInventory.push({
        id: armorId,
        durability: 100
    });
    updateArmorUI();
}

function equipArmor(armorId) {
    const armor = ARMOR_TYPES[armorId];
    if (!armor) return false;
    if (playerEquipment.armor === armorId) return false;
    const idx = armorInventory.findIndex(a => a.id === armorId);
    if (idx === -1) {
        return false;
    }
    const selected = armorInventory.splice(idx, 1)[0];
    if (playerEquipment.armor) {
        armorInventory.push({
            id: playerEquipment.armor,
            durability: playerEquipment.armorDurability
        });
    }
    playerEquipment.armor = selected.id;
    playerEquipment.armorDurability = selected.durability;
    updateArmorUI();
    showToast(`🛡️ 装备 ${armor.name}`);
    showFloatingText(`🛡️ ${armor.name}`, player ? player.x : 0, player ? player.y - 60 : 120);
    return true;
}

function unequipArmor() {
    if (!playerEquipment.armor) return;
    const armor = ARMOR_TYPES[playerEquipment.armor];
    armorInventory.push({
        id: playerEquipment.armor,
        durability: playerEquipment.armorDurability
    });
    playerEquipment.armor = null;
    playerEquipment.armorDurability = 0;
    updateArmorUI();
    showToast(`${armor?.name || "盔甲"} 已卸下`);
}

function getArmorDefense() {
    if (!playerEquipment.armor) return 0;
    const armor = ARMOR_TYPES[playerEquipment.armor];
    return armor ? armor.defense : 0;
}

function updateArmorUI() {
    const el = document.getElementById("armor-status");
    if (!el) return;
    if (playerEquipment.armor) {
        const armor = ARMOR_TYPES[playerEquipment.armor];
        const dur = Math.max(0, Math.min(100, playerEquipment.armorDurability));
        el.innerText = `🛡️ ${armor.name} ${dur}%`;
        el.classList.add("hud-box-active");
    } else {
        el.innerText = "🛡️ 无";
        el.classList.remove("hud-box-active");
    }
}

function showArmorSelectUI() {
    const modal = document.getElementById("armor-select-modal");
    if (!modal) return;
    const list = modal.querySelector(".armor-list");
    if (!list) return;
    list.innerHTML = "";
    if (playerEquipment.armor) {
        const armor = ARMOR_TYPES[playerEquipment.armor];
        const card = document.createElement("div");
        card.className = "armor-item equipped";
        card.innerHTML = `
            <span class="armor-icon" style="background:${armor.color}">🛡️</span>
            <div class="armor-details">
                <div class="armor-name">${armor.name}（已装备）</div>
                <div class="armor-defense">防御 ${armor.defense}</div>
                <div class="armor-durability">耐久 ${playerEquipment.armorDurability}%</div>
            </div>
        `;
        card.addEventListener("click", () => {
            unequipArmor();
            hideArmorSelectUI();
        });
        list.appendChild(card);
    }
    if (armorInventory.length) {
        armorInventory.forEach(item => {
            const armor = ARMOR_TYPES[item.id];
            if (!armor) return;
            const card = document.createElement("div");
            card.className = "armor-item";
            card.innerHTML = `
                <span class="armor-icon" style="background:${armor.color}">🛡️</span>
                <div class="armor-details">
                    <div class="armor-name">${armor.name}</div>
                    <div class="armor-defense">防御 ${armor.defense}</div>
                    <div class="armor-durability">耐久 ${item.durability}%</div>
                </div>
            `;
            card.addEventListener("click", () => {
                if (equipArmor(item.id)) {
                    hideArmorSelectUI();
                }
            });
            list.appendChild(card);
        });
    } else if (!playerEquipment.armor) {
        list.innerHTML = "<div class=\"armor-item\">当前无盔甲可用</div>";
    }
    modal.classList.add("visible");
    modal.setAttribute("aria-hidden", "false");
    pausedByModal = !paused;
    paused = true;
}

function hideArmorSelectUI() {
    const modal = document.getElementById("armor-select-modal");
    if (!modal) return;
    modal.classList.remove("visible");
    modal.setAttribute("aria-hidden", "true");
    if (pausedByModal) {
        paused = false;
        pausedByModal = false;
    } else {
        paused = false;
    }
}

const RECIPES = {
    iron_golem: { iron: 10 },
    snow_golem: { pumpkin: 10 }
};

function tryCraft(recipeKey) {
    const recipe = RECIPES[recipeKey];
    if (!recipe) return false;
    for (const [item, count] of Object.entries(recipe)) {
        if ((inventory[item] || 0) < count) {
            showToast(`材料不足: 需要 ${ITEM_LABELS[item] || item} x${count}`);
            return false;
        }
    }
    for (const [item, count] of Object.entries(recipe)) {
        inventory[item] -= count;
    }
    spawnGolem(recipeKey === "iron_golem" ? "iron" : "snow");
    updateInventoryUI();
    return true;
}

function spawnGolem(type) {
    const config = getGolemConfig();
    const maxCount = Number(config.maxCount) || MAX_GOLEMS;
    if (golems.length >= maxCount) {
        showToast(`最多同时存在 ${maxCount} 个傀儡！`);
        return;
    }
    const newGolem = new Golem(player.x + 50, player.y, type);
    golems.push(newGolem);
    const name = type === "iron" ? "铁傀儡" : "雪傀儡";
    showToast(`✅ 成功召唤 ${name}！`);
    showFloatingText(`⚒️ ${name}`, player.x, player.y - 40);
}

function handleInteraction() {
    let nearestChest = null;
    let minDist = 60;
    const now = Date.now();
    for (let c of chests) {
        const d = Math.abs((player.x + player.width / 2) - (c.x + c.width / 2));
        if (d < minDist) {
            nearestChest = c;
            minDist = d;
        }
    }
    if (!nearestChest) return;
    if (nearestChest.opened) {
        if (now - (nearestChest.lastClickTime || 0) < 350) {
            nearestChest.onDoubleClick();
        }
    } else {
        // === v1.6.1 宝箱学习模式：开箱前先答题 ===
        if (settings.learningMode &&
            settings.chestLearningEnabled &&
            !currentLearningChallenge) {

            // 从当前词库随机取一个单词
            const wordObj = pickNextWord();

            if (wordObj) {
                // 触发 Challenge，origin 传入 chest 实例
                startLearningChallenge(wordObj, null, nearestChest);
            } else {
                // 无可用单词时直接开箱
                nearestChest.open();
            }
        } else {
            // 学习模式关闭时直接开箱
            nearestChest.open();
        }
        // === v1.6.1 结束 ===
    }
    nearestChest.lastClickTime = now;
}

function handleDecorationInteract() {
    for (const d of decorations) {
        if (!d.collectible) continue;
        if (rectIntersect(player.x, player.y, player.width, player.height, d.x, d.y, d.width, d.height)) {
            d.interact(player);
            break;
        }
    }
}

function handleAttack(mode = "press") {
    if (playerWeapons.attackCooldown > 0) return;
    const weapon = WEAPONS[playerWeapons.current] || WEAPONS.sword;

    if (weapon.type === "ranged") {
        if (mode === "tap") {
            releaseBowShot(0.35);
            return;
        }
        if (!playerWeapons.isCharging) {
            startBowCharge();
        }
        return;
    }

    if (weapon.type === "dig") {
        digGroundBlock();
        return;
    }

    performMeleeAttack(weapon);
}

function handleAttackRelease() {
    const weapon = WEAPONS[playerWeapons.current] || WEAPONS.sword;
    if (weapon.type !== "ranged") return;
    if (!playerWeapons.isCharging) return;
    releaseBowShot();
}

function triggerChestHint() {
    if (chestHintSeen) return;
    chestHintSeen = true;
    chestHintFramesLeft = CHEST_HINT_FRAMES;
    chestHintPos = null;
    if (storage) storage.saveJson("mmwg:hintChestSeen", true);
}
