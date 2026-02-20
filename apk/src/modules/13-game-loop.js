/**
 * 13-game-loop.js - 游戏主循环、背包、装备
 * 从 main.js 拆分（原始行 3818-4571）
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

function isEntityNearCamera(entity, margin = blockSize * 2) {
    if (!entity || typeof entity.x !== "number") return true;
    return entity.x > cameraX - margin && entity.x < cameraX + canvas.width + margin;
}

function emitGameParticle(type, x, y) {
    if (typeof emitBiomeParticle === "function") {
        const pooled = emitBiomeParticle(type, x, y);
        if (pooled) return pooled;
    }

    let created = null;
    switch (type) {
        case "bubble":
            created = new BubbleParticle(x, y);
            break;
        case "end_particle":
            created = new EndParticle(x, y);
            break;
        case "ember":
            created = new EmberParticle(x, y);
            break;
        default:
            break;
    }
    if (!created) return null;
    particles.push(created);
    return created;
}

function update() {
    if (paused) return;
    if (typeof isVillageInteriorActive === "function" && isVillageInteriorActive()) {
        if (typeof updateVillageInteriorMode === "function") updateVillageInteriorMode();
        gameFrame++;
        return;
    }
    updateCurrentBiome();
    // 村庄系统更新 (v1.8.0)
    if (typeof updateVillages === 'function') updateVillages();
    applyBiomeEffectsToPlayer();
    if (typeof updateAllInteractionChains === 'function') updateAllInteractionChains();
    if (typeof updateBiomeVisuals === 'function') updateBiomeVisuals();
    if (typeof updateDeepDarkNoiseSystem === 'function') updateDeepDarkNoiseSystem();
    if (typeof updatePlayerPoisonStatus === "function") updatePlayerPoisonStatus();
    tickWeather();

    const isUnderwater = (currentBiome === 'ocean');
    const camelRideEffect = typeof getCamelRideEffect === 'function' ? getCamelRideEffect() : null;
    const camelSpeedMult = camelRideEffect?.speedMultiplier || 1;
    const camelJumpMult = camelRideEffect?.jumpBoost || 1;

    if (isUnderwater) {
        // 水下移动
        if (keys.right) {
            player.velX = player.speed * WATER_PHYSICS.horizontalSpeedMultiplier * camelSpeedMult;
            player.facingRight = true;
        } else if (keys.left) {
            player.velX = -player.speed * WATER_PHYSICS.horizontalSpeedMultiplier * camelSpeedMult;
            player.facingRight = false;
        } else {
            player.velX *= 0.9;
        }
        // 兼容移动端：跳跃按钮主要写入 jumpBuffer，水下也要生效
        const swimJumpTriggered = jumpBuffer > 0;
        if (swimJumpTriggered) jumpBuffer = 0;
        if (keys.up || keys.jump || swimJumpTriggered) {
            player.velY = -(
                swimJumpTriggered
                    ? (WATER_PHYSICS.swimJumpImpulse || WATER_PHYSICS.verticalSwimSpeed)
                    : WATER_PHYSICS.verticalSwimSpeed
            ) * camelJumpMult;
            if (swimJumpTriggered && typeof addDeepDarkNoise === "function") addDeepDarkNoise(15, "", "jump");
        } else if (keys.down) {
            player.velY = WATER_PHYSICS.verticalSwimSpeed;
        } else {
            player.velY += WATER_PHYSICS.gravity;
            if (player.velY > WATER_PHYSICS.sinkSpeed) player.velY = WATER_PHYSICS.sinkSpeed;
        }
        player.y = Math.max(20, Math.min(player.y, groundY - player.height));
        player.x += player.velX;
        player.y += player.velY;
        player.grounded = (player.y >= groundY - player.height - 1);
        // 气泡粒子
        if ((Math.abs(player.velX) > 0.5 || Math.abs(player.velY) > 0.5) && gameFrame % WATER_PHYSICS.bubbleInterval === 0) {
            emitGameParticle(
                "bubble",
                player.x + player.width / 2 + (Math.random() - 0.5) * 10,
                player.y + player.height * 0.3
            );
        }
    } else {
    if (keys.right) {
        if (player.velX < player.speed * camelSpeedMult) player.velX++;
        player.facingRight = true;
    }
    if (keys.left) {
        if (player.velX > -player.speed * camelSpeedMult) player.velX--;
        player.facingRight = false;
    }

    player.velX *= gameConfig.physics.friction;
    let currentGravity = gameConfig.physics.gravity;
    if (Math.abs(player.velY) < 1.0) currentGravity = gameConfig.physics.gravity * 0.4;
    // 本地低重力
    const endBiomeCfg = (currentBiome === 'end') ? getBiomeById('end') : null;
    if (endBiomeCfg) currentGravity *= (endBiomeCfg.effects?.gravityMultiplier || 0.65);
    player.velY += currentGravity;
    player.grounded = false;
    let currentFragilePlatform = null;

    for (let i = 0; i < platforms.length; i++) {
        const p = platforms[i];
        if (p && typeof p.updateFragile === "function") p.updateFragile();
    }

    for (let p of platforms) {
        if (!p || p.remove) continue;
        const dir = colCheck(player, p);
        if (dir === "l" || dir === "r") {
            // 如果玩家脚底接近平台顶部，视为踩上平台而非撞墙
            const feetY = player.y + player.height;
            const stepUpThreshold = blockSize * 0.6;
            if (feetY >= p.y && feetY - p.y < stepUpThreshold) {
                player.y = p.y - player.height;
                player.grounded = true;
                player.jumpCount = 0;
                player.velY = 0;
                coyoteTimer = gameConfig.jump.coyoteFrames;
            } else {
                // 侧向碰撞仅阻挡“朝平台方向”的移动，避免反向也被锁死
                if (dir === "l" && player.velX < 0) {
                    player.velX = 0;
                    player.x = p.x + p.width;
                } else if (dir === "r" && player.velX > 0) {
                    player.velX = 0;
                    player.x = p.x - player.width;
                }
            }
        } else if (dir === "b") {
            player.grounded = true;
            player.y = p.y - player.height;
            player.jumpCount = 0;
            coyoteTimer = gameConfig.jump.coyoteFrames;
            if (p.fragile && !p.breaking && typeof p.onPlayerStep === "function") {
                currentFragilePlatform = p;
                if (player.lastFragilePlatform !== p) {
                    p.onPlayerStep();
                    if (p.breaking) {
                        showFloatingText("⚠️ 平台即将破裂", p.x + p.width / 2, p.y - 12, "#FF7043");
                    }
                }
            }
        } else if (dir === "t") {
            player.y = p.y + p.height;
            if (player.velY < 0) player.velY = 0;
        }
    }
    player.lastFragilePlatform = currentFragilePlatform;

    for (let t of trees) {
        const trunkX = t.x + (t.width - 30) / 2;
        const trunkY = t.y + t.height - 60;
        const dir = colCheckRect(player.x, player.y, player.width, player.height, trunkX, trunkY, 30, 60);
        if (dir) {
            if (dir === "l" || dir === "r") {
                // 树干也需要 step-up 逻辑
                const feetY = player.y + player.height;
                const stepUpThreshold = blockSize * 0.6;
                if (feetY >= trunkY && feetY - trunkY < stepUpThreshold) {
                    player.y = trunkY - player.height;
                    player.grounded = true;
                    player.jumpCount = 0;
                    player.velY = 0;
                    coyoteTimer = gameConfig.jump.coyoteFrames;
                } else {
                    // 方向判定：只阻止朝树方向的移动，允许反向脱困
                    if (dir === "l" && player.velX < 0) {
                        player.velX = 0;
                        player.x = trunkX + 30; // 推离到树右侧
                    } else if (dir === "r" && player.velX > 0) {
                        player.velX = 0;
                        player.x = trunkX - player.width; // 推离到树左侧
                    }
                }
            } else if (dir === "b") {
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
        const endJumpMult = endBiomeCfg ? (endBiomeCfg.effects?.jumpMultiplier || 1.5) : 1;
        const totalJumpMult = endJumpMult * camelJumpMult;
        if (coyoteTimer > 0) {
            player.velY = player.jumpStrength * totalJumpMult;
            player.grounded = false;
            player.jumpCount = 1;
            coyoteTimer = 0;
            jumpBuffer = 0;
            if (typeof addDeepDarkNoise === "function") addDeepDarkNoise(15, "", "jump");
        } else if (player.jumpCount < player.maxJumps) {
            player.velY = player.jumpStrength * 0.8 * totalJumpMult;
            player.jumpCount++;
            jumpBuffer = 0;
            if (typeof addDeepDarkNoise === "function") addDeepDarkNoise(15, "", "jump");
        }
    }

    if (player.grounded) player.velY = 0;

    player.x += player.velX;
    player.y += player.velY;

    // 上边界保护：跳出屏幕顶部时回弹
    if (player.y < -player.height * 2) {
        player.y = -player.height * 2;
        if (player.velY < 0) player.velY = 0;
    }

    if (player.y > fallResetY) {
        player.y = 0;
        player.x -= 200;
        if (player.x < 0) player.x = 100;
        player.velY = 0;
    }
    } // end else (not underwater)

    // 卡住检测：如果玩家有输入但位置长时间不变，强制解卡
    if (typeof player._stuckFrames === "undefined") player._stuckFrames = 0;
    if (typeof player._lastStuckX === "undefined") player._lastStuckX = player.x;
    const hasInput = keys.right || keys.left || keys.up || keys.jump;
    if (hasInput && Math.abs(player.x - player._lastStuckX) < 0.5 && player.grounded) {
        player._stuckFrames++;
        if (player._stuckFrames > 45) {
            // 强制向前推一点
            player.y = player.y - blockSize * 0.8;
            player.velY = -2;
            player._stuckFrames = 0;
        }
    } else {
        player._stuckFrames = 0;
    }
    player._lastStuckX = player.x;

    let targetCamX = player.x - cameraOffsetX;
    if (targetCamX < 0) targetCamX = 0;
    // BOSS战视口锁定
    if (typeof bossArena !== 'undefined' && bossArena.viewportLocked) {
        cameraX = bossArena.lockedCamX;
    } else {
        if (targetCamX > cameraX) cameraX = targetCamX;
    }

    // BOSS战边界墙限制玩家移动
    if (typeof bossArena !== 'undefined' && bossArena.active && bossArena.viewportLocked) {
        if (player.x < bossArena.leftWall) {
            player.x = bossArena.leftWall;
            player.velX = 0;
        } else if (player.x + player.width > bossArena.rightWall) {
            player.x = bossArena.rightWall - player.width;
            player.velX = 0;
        }
    }

    updateMapGeneration();

    decorations.forEach(d => {
        optimizedUpdate(d, () => d.update());
        if ((d.interactive || d.harmful) &&
            isEntityNearCamera(d, blockSize * 3) &&
            rectIntersect(player.x, player.y, player.width, player.height, d.x, d.y, d.width, d.height)) {
            d.onCollision(player);
        }
    });
    decorations = decorations.filter(d => d.x + d.width > cameraX - removeThreshold && !d.remove);

    if (particles.length) {
        particles.forEach(p => {
            if (!p) return;
            optimizedUpdate(p, () => {
                if (typeof p.update === "function") {
                    p.update();
                    return;
                }
                if (p.type === "bubble") {
                    p.x += p.vx || 0;
                    p.y += p.vy || 0;
                    p.life -= 0.01;
                    p.size = (p.size || 3) * 1.002;
                    if (p.life <= 0) p.remove = true;
                }
            });
        });
        particles = particles.filter(p => !p?.remove);
    }
    spawnBiomeParticles();

    if (typeof bossArena !== 'undefined') {
        bossArena.checkSpawn();
        bossArena.update();
    }

    // 海洋生物更新
    if (typeof updateOceanCreatures === 'function') updateOceanCreatures();

    // 地狱环境更新
    if (typeof checkLavaCollision === 'function') checkLavaCollision();
    if (typeof updateNetherMushrooms === 'function') updateNetherMushrooms();

    // 本地实体清理（离开本地时）
    if (currentBiome !== 'end' && typeof clearEndEntities === 'function') clearEndEntities();

    // 技能物品实体更新
    if (typeof bombs !== 'undefined') {
        bombs.forEach(b => b.update());
        bombs = bombs.filter(b => !b.remove);
    }
    if (typeof webTraps !== 'undefined') {
        webTraps.forEach(w => w.update());
        webTraps = webTraps.filter(w => !w.remove);
    }
    if (typeof fleshBaits !== 'undefined') {
        fleshBaits.forEach(f => f.update());
        fleshBaits = fleshBaits.filter(f => !f.remove);
    }
    if (typeof torches !== 'undefined') {
        torches.forEach(t => t.update());
        torches = torches.filter(t => !t.remove);
    }

    playerPositionHistory.push({ x: player.x, y: player.y, frame: gameFrame });
    if (playerPositionHistory.length > 150) playerPositionHistory.shift();

    golems.forEach(g => optimizedUpdate(g, () => g.update(player, playerPositionHistory, enemies, platforms)));
    golems = golems.filter(g => {
        if (!g || g.remove || g.x <= cameraX - 260) return false;
        if (g.type === "snow") {
            if (!g.spawnedAt) g.spawnedAt = Date.now();
            if (!g.maxLifetimeMs) g.maxLifetimeMs = 5 * 60 * 1000;
            if (Date.now() - g.spawnedAt >= g.maxLifetimeMs) {
                g.remove = true;
                showFloatingText("🧱 消失", g.x, g.y - 20, "#B0BEC5");
                return false;
            }
        }
        return true;
    });

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
            if (wordPicker && typeof wordPicker.updateWordQuality === "function" && item.wordObj?.en) {
                wordPicker.updateWordQuality(item.wordObj.en, "correct_slow");
            }
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
    if (foodCooldown > 0) foodCooldown--;
    if (playerWeapons.attackCooldown > 0) playerWeapons.attackCooldown--;
    if (playerWeapons.isCharging) {
        const weapon = WEAPONS.bow;
        playerWeapons.chargeTime = Math.min(weapon.chargeMax, playerWeapons.chargeTime + 1);
    }

    // 物品冷却计时器更新
    for (const itemKey in itemCooldownTimers) {
        if (itemCooldownTimers[itemKey] > 0) {
            itemCooldownTimers[itemKey]--;
        } else {
            delete itemCooldownTimers[itemKey];
        }
    }

    // 幸运星计时器
    if (typeof gameState !== 'undefined' && gameState.luckyStarActive) {
        gameState.luckyStarTimer--;
        if (gameState.luckyStarTimer <= 0) {
            gameState.luckyStarActive = false;
            showToast('🌟 幸运星效果结束');
        }
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
        for (let i = 0; i < rowEmpty; i++) rowHtml += `<span class="hp-heart">🤍</span>`;
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
    if (typeof hasVillageBuff === "function" && hasVillageBuff("invisible")) return;
    if (typeof getInvincibilityEffect === 'function') {
        const inv = getInvincibilityEffect();
        if (inv?.invincible) return;
    }
    if (playerInvincibleTimer > 0) return;
    const invFrames = Number(getDifficultyConfig().invincibleFrames ?? 30) || 30;
    playerInvincibleTimer = Math.max(10, invFrames);
    lastDamageFrame = gameFrame;
    const dir = sourceX != null ? (player.x > sourceX ? 1 : -1) : -1;
    player.x += dir * knockback;
    player.y -= 40;
    // 击退后位置合法性校验：不嵌入平台
    for (let p of platforms) {
        if (!p || p.remove) continue;
        const d = colCheck(player, p);
        if (d === "l") player.x = p.x + p.width;
        else if (d === "r") player.x = p.x - player.width;
        else if (d === "b") player.y = p.y - player.height;
        else if (d === "t") player.y = p.y + p.height;
    }
    // 不超出屏幕上边界
    if (player.y < -player.height * 2) player.y = -player.height * 2;
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
    if (typeof addDeepDarkNoise === "function") addDeepDarkNoise(8, "", "hurt");
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

function showFloatingText(text, x, y, color) {
    floatingTexts.push({ text, x, y, life: 60, color: color || '#FFF' });
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
        const armorListHtml = (armorInventory || []).map((entry, idx) => {
            const armor = ARMOR_TYPES[entry.id];
            const name = armor?.name || entry.id;
            const icon = ITEM_ICONS["armor_" + entry.id] || "🛡️";
            return `<div class="inventory-item" onclick="window.equipArmorFromBackpack && window.equipArmorFromBackpack('${entry.id}')">
                <div class="inventory-item-left">
                    <div class="inventory-item-icon">${icon}</div>
                    <div>${name} (${entry.durability}%)</div>
                </div>
                <div class="inventory-item-count">装备</div>
            </div>`;
        }).join("");
        const weapons = getInventoryEntries(["stone_sword", "iron_pickaxe", "bow", "arrow"]);
        const currentArmorHtml = `
            <div class="inventory-equipment">
                <div>🛡️ 当前护甲：${armorLabel}</div>
                <div>耐久：${armorDur}</div>
                ${playerEquipment.armor ? `<div class="inventory-item" onclick="window.unequipArmorFromBackpack && window.unequipArmorFromBackpack()" style="cursor:pointer;margin-top:4px"><div class="inventory-item-left"><div>卸下护甲</div></div></div>` : ""}
            </div>
        `;
        const armorSectionHtml = armorListHtml || `<div class="inventory-empty">无库存护甲</div>`;
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
        inventoryContentEl.innerHTML = `${currentArmorHtml}${armorSectionHtml}${weaponHtml}`;
        return;
    }

    const keys = INVENTORY_CATEGORIES[inventoryTab] || [];
    const entries = getInventoryEntries(keys);
    if (!entries.length) {
        inventoryContentEl.innerHTML = `<div class="inventory-empty">暂无物品</div>`;
        return;
    }
    inventoryContentEl.innerHTML = entries.map(entry => {
        const isFood = !!FOOD_TYPES[entry.key];
        const isHealItem = isFood || entry.key === "diamond";
        const isSummon = entry.key === "pumpkin" || entry.key === "iron";
        const fullHp = playerHp >= playerMaxHp;
        const onCooldown = isFood && foodCooldown > 0;
        const disabled = (isHealItem && fullHp) || onCooldown;
        const style = disabled ? 'opacity:0.4;pointer-events:none' : '';
        let hint = '';
        if (entry.key === "pumpkin") hint = ' (→⛄)';
        else if (entry.key === "iron" && entry.count >= 3) hint = ' (×3→🤖)';
        else if (entry.key === "iron") hint = ` (${entry.count}/3→🤖)`;
        return `<div class="inventory-item" data-item="${entry.key}" style="${style}" onclick="window.useInventoryItem && window.useInventoryItem('${entry.key}')">
            <div class="inventory-item-left">
                <div class="inventory-item-icon">${entry.icon}</div>
                <div>${entry.label}${hint}${onCooldown ? ' ⏳' : ''}</div>
            </div>
            <div class="inventory-item-count">${entry.count}</div>
        </div>`;
    }).join("");
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

    // 检查冷却
    if (ITEM_COOLDOWNS[itemKey] && itemCooldownTimers[itemKey] > 0) {
        const remainingSec = Math.ceil(itemCooldownTimers[itemKey] / 60);
        showToast(`⏳ 冷却中 (${remainingSec}秒)`);
        return;
    }

    // 技能物品使用
    if (itemKey === "gunpowder") {
        // 火药炸弹
        inventory.gunpowder -= 1;
        const direction = player.facingRight ? 1 : -1;
        if (typeof bombs !== 'undefined') {
            bombs.push(new Bomb(player.x + player.width / 2, player.y, direction));
        }
        itemCooldownTimers.gunpowder = ITEM_COOLDOWNS.gunpowder;
        showToast("💣 投掷炸弹");
        used = true;
    } else if (itemKey === "ender_pearl") {
        // 末影珍珠传送
        inventory.ender_pearl -= 1;
        const direction = player.facingRight ? 1 : -1;
        const teleportDist = 200;
        player.x += direction * teleportDist;
        player.velY = 0;
        // 粒子效果
        for (let i = 0; i < 15; i++) {
            emitGameParticle("end_particle", player.x, player.y + Math.random() * player.height);
        }
        if (typeof setVillageBuff === "function") {
            setVillageBuff("invisible", 60000);
        }
        itemCooldownTimers.ender_pearl = ITEM_COOLDOWNS.ender_pearl;
        showFloatingText("🟣 传送+隐身", player.x, player.y - 30, "#9C27B0");
        showToast("🟣 末影传送，60秒隐身");
        used = true;
    } else if (itemKey === "string") {
        // 蜘蛛丝陷阱
        if (count < 2) {
            showToast("❌ 需要2个蜘蛛丝");
            return;
        }
        inventory.string -= 2;
        if (typeof webTraps !== 'undefined') {
            webTraps.push(new WebTrap(player.x - 20, groundY - 60));
        }
        itemCooldownTimers.string = ITEM_COOLDOWNS.string;
        showToast("🕸️ 放置蛛网陷阱");
        used = true;
    } else if (itemKey === "rotten_flesh") {
        // 腐肉诱饵
        inventory.rotten_flesh -= 1;
        if (typeof fleshBaits !== 'undefined') {
            fleshBaits.push(new FleshBait(player.x + player.width / 2, groundY - 20));
        }
        itemCooldownTimers.rotten_flesh = ITEM_COOLDOWNS.rotten_flesh;
        showToast("🥩 投掷腐肉诱饵");
        used = true;
    } else if (itemKey === "shell") {
        // 贝壳护盾
        if (count < 3) {
            showToast("❌ 需要3个贝壳");
            return;
        }
        inventory.shell -= 3;
        playerInvincibleTimer = 120; // 2秒无敌
        itemCooldownTimers.shell = ITEM_COOLDOWNS.shell;
        showFloatingText('🛡️ 无敌!', player.x, player.y - 30, '#00BFFF');
        showToast('🐚 激活护盾');
        used = true;
    } else if (itemKey === "coal") {
        // 煤炭火把
        inventory.coal -= 1;
        if (typeof torches !== 'undefined') {
            torches.push(new Torch(player.x, groundY - 30));
        }
        itemCooldownTimers.coal = ITEM_COOLDOWNS.coal;
        showToast("🕯️ 放置火把");
        used = true;
    } else if (itemKey === "dragon_egg") {
        // 龙蛋龙息
        inventory.dragon_egg -= 1;
        let hitCount = 0;
        enemies.forEach(e => {
            if (!e.remove && e.x > cameraX - 100 && e.x < cameraX + canvas.width + 100) {
                e.takeDamage(50);
                hitCount++;
            }
        });
        // 龙息粒子效果
        for (let i = 0; i < 30; i++) {
            emitGameParticle("ember", cameraX + Math.random() * canvas.width, Math.random() * canvas.height);
        }
        itemCooldownTimers.dragon_egg = ITEM_COOLDOWNS.dragon_egg;
        showFloatingText(`🐉 龙息! (${hitCount}个敌人)`, player.x, player.y - 40, '#FF4500');
        showToast("🐉 释放龙息");
        used = true;
    } else if (itemKey === "starfish") {
        // 海星幸运星
        inventory.starfish -= 1;
        if (typeof gameState === 'undefined') window.gameState = {};
        gameState.luckyStarActive = true;
        gameState.luckyStarTimer = 1800; // 30秒
        itemCooldownTimers.starfish = ITEM_COOLDOWNS.starfish;
        showFloatingText("⭐ 幸运加持!", player.x, player.y - 30, "#FFD700");
        showToast("⭐ 幸运星激活 (30秒)");
        used = true;
    } else if (itemKey === "gold") {
        // 黄金交易
        inventory.gold -= 1;
        const trades = [
            { item: 'iron', count: 2 },
            { item: 'arrow', count: 4 },
            { item: 'ender_pearl', count: 1 }
        ];
        const trade = trades[Math.floor(Math.random() * trades.length)];
        if (!inventory[trade.item]) inventory[trade.item] = 0;
        inventory[trade.item] += trade.count;
        const icon = ITEM_ICONS[trade.item] || '✅';
        showFloatingText(`${icon} +${trade.count}`, player.x, player.y - 30, '#FFD700');
        showToast(`🐷 猪灵交易: ${ITEM_LABELS[trade.item]} x${trade.count}`);
        used = true;
    }
    // 消耗品使用
    else if (itemKey === "diamond") {
        if (playerHp >= playerMaxHp) {
            showToast("❤️ 已满血");
            return;
        }
        inventory.diamond -= 1;
        healPlayer(1);
        showFloatingText("+1❤️", player.x, player.y - 60);
        showToast("💎 恢复生命");
        used = true;
    } else if (itemKey === "pumpkin") {
        // 南瓜 -> 召唤雪傀儡（x1）
        if (tryCraft("snow_golem")) {
            used = true;
        }
        renderInventoryModal();
        return;
    } else if (itemKey === "iron") {
        // 铁块 -> 召唤铁傀儡（x3）
        if (tryCraft("iron_golem")) {
            used = true;
        }
        renderInventoryModal();
        return;
    } else if (itemKey === "sculk_vein") {
        // 幽匿碎片 -> 制作静音靴（x5）
        if (tryCraft("silent_boots")) {
            used = true;
        }
        renderInventoryModal();
        return;
    }
    // 食物使用（牛肉、羊肉、蘑菇煲）
    else if (FOOD_TYPES[itemKey]) {
        if (playerHp >= playerMaxHp) {
            showToast("❌ 已满血");
            return;
        }
        if (foodCooldown > 0) {
            showToast("⏳ 冷却中");
            return;
        }
        const food = FOOD_TYPES[itemKey];
        inventory[itemKey] -= 1;
        healPlayer(food.heal);
        foodCooldown = 180; // 3秒冷却 @60fps
        showFloatingText(`+${food.heal}❤️`, player.x, player.y - 60);
        showToast(`${food.icon} ${food.name} 恢复${food.heal}点生命`);
        used = true;
    }
    // 武器切换
    else if (itemKey === "stone_sword" || itemKey === "iron_pickaxe") {
        const weaponMap = {
            stone_sword: "sword",
            iron_pickaxe: "pickaxe"
        };
        const weaponId = weaponMap[itemKey];
        if (
            weaponId &&
            weaponId !== "sword" &&
            typeof isBossWeaponLockActive === "function" &&
            isBossWeaponLockActive()
        ) {
            showToast("⚔️ BOSS战期间仅可使用剑");
            return;
        }
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
        if (typeof addDeepDarkNoise === "function") addDeepDarkNoise(10, "", "use_item");
        updateHpUI();
        updateInventoryUI();
        updateInventoryModal(); // 刷新背包显示
    }
}

// 导出到全局，供 HTML onclick 使用
if (typeof window !== "undefined") {
    window.useInventoryItem = useInventoryItem;
    window.equipArmorFromBackpack = function(armorId) {
        if (equipArmor(armorId)) {
            updateInventoryModal();
        }
    };
    window.unequipArmorFromBackpack = function() {
        unequipArmor();
        updateInventoryModal();
    };
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
        list.innerHTML = "<div class=\"armor-item\">当前无护甲可用</div>";
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
    iron_golem: { iron: 3 },
    snow_golem: { pumpkin: 1, snow_block: 2 },
    silent_boots: { sculk_vein: 5 }
};

function tryCraft(recipeKey) {
    const recipe = RECIPES[recipeKey];
    if (!recipe) return false;
    if (recipeKey === "silent_boots" && silentBootsState?.equipped && Number(silentBootsState.durability) > 0) {
        showToast("静音靴已装备");
        return false;
    }
    const isGolemRecipe = recipeKey === "snow_golem" || recipeKey === "iron_golem";
    if (isGolemRecipe && currentBiome === "ocean") {
        showToast("⚠️ 海洋环境无法召唤傀儡！");
        return false;
    }
    for (const [item, count] of Object.entries(recipe)) {
        if ((inventory[item] || 0) < count) {
            showToast(`材料不足: 需要 ${ITEM_LABELS[item] || item} x${count}`);
            return false;
        }
    }
    for (const [item, count] of Object.entries(recipe)) {
        inventory[item] -= count;
    }
    if (recipeKey === "silent_boots") {
        silentBootsState.equipped = true;
        silentBootsState.maxDurability = 30;
        silentBootsState.durability = 30;
        showToast("🥾 静音靴已装备（耐久30）");
        showFloatingText("🥾 静音靴", player.x, player.y - 40, "#7FDBFF");
        updateInventoryUI();
        return true;
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
    if (type === "snow") {
        newGolem.spawnedAt = Date.now();
        newGolem.maxLifetimeMs = 5 * 60 * 1000;
    }
    golems.push(newGolem);
    const name = type === "iron" ? "铁傀儡" : "雪傀儡";
    showToast(`✅ 成功召唤 ${name}`);
    showFloatingText(`🧱 ${name}`, player.x, player.y - 40);
}

function handleInteraction() {
    if (typeof isVillageInteriorActive === "function" && isVillageInteriorActive()) {
        if (paused || pausedByModal) return;
        if (typeof handleVillageInteriorInteraction === "function") {
            handleVillageInteriorInteraction();
        }
        return;
    }
    if (paused || pausedByModal) return;
    // v1.8.3 村庄建筑交互优先
    if (playerInVillage && currentVillage && typeof checkVillageBuildings === 'function') {
      const handled = checkVillageBuildings(currentVillage);
      if (handled) return;
    }

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
        nearestChest.open();
    }
    nearestChest.lastClickTime = now;
}

function handleDecorationInteract() {
    if (typeof isVillageInteriorActive === "function" && isVillageInteriorActive()) return;
    for (const d of decorations) {
        if (!d.collectible) continue;
        if (rectIntersect(player.x, player.y, player.width, player.height, d.x, d.y, d.width, d.height)) {
            d.interact(player);
            break;
        }
    }
}

function handleAttack(mode = "press") {
    if (typeof isVillageInteriorActive === "function" && isVillageInteriorActive()) return;
    if (playerWeapons.attackCooldown > 0) return;
    if (typeof addDeepDarkNoise === "function") addDeepDarkNoise(10, "", "attack");
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

