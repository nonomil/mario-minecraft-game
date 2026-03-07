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

let pauseStack = 0;
let inventoryPauseHeld = false;
let armorPauseHeld = false;

// 末影龙系统
let dragonList = [];
let ridingDragon = null;
let skipPlayerGravity = false;
let dismountInvincibleFrames = 0;

function pushPause() {
    pauseStack += 1;
    paused = true;
    return pauseStack;
}

function popPause() {
    pauseStack = Math.max(0, pauseStack - 1);
    if (pauseStack === 0) paused = false;
    return pauseStack;
}

function isModalPauseActive() {
    return pauseStack > 0;
}

function clearModalPauseStack(resumeGame = true) {
    pauseStack = 0;
    if (resumeGame) paused = false;
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

// --- 实体重力系统 ---
const ENTITY_GRAVITY = 0.3;
const ENTITY_MAX_FALL_SPEED = 8;

function findSupportingPlatform(entityX, entityWidth, entityBottom) {
    let bestPlatform = null;
    let bestY = Infinity;
    for (let i = 0; i < platforms.length; i++) {
        const p = platforms[i];
        if (p.remove) continue;
        if (entityX + entityWidth <= p.x || entityX >= p.x + p.width) continue;
        if (p.y < entityBottom - 2) continue;
        if (p.y < bestY) {
            bestY = p.y;
            bestPlatform = p;
        }
    }
    return bestPlatform;
}

function updateEntityGravity(entity) {
    const entityBottom = entity.y + entity.height;
    const support = findSupportingPlatform(entity.x, entity.width, entityBottom);
    // Landed on platform
    if (support && entityBottom >= support.y - 2 && entityBottom <= support.y + 4) {
        entity.y = support.y - entity.height;
        entity.velY = 0;
        entity.falling = false;
        return;
    }
    // Landed on ground
    const groundLimit = groundY - entity.height;
    if (entity.y >= groundLimit) {
        entity.y = groundLimit;
        entity.velY = 0;
        entity.falling = false;
        return;
    }
    // No support — fall
    entity.falling = true;
    entity.velY = Math.min(entity.velY + ENTITY_GRAVITY, ENTITY_MAX_FALL_SPEED);
    entity.y += entity.velY;
    // Clamp to ground
    if (entity.y >= groundLimit) {
        entity.y = groundLimit;
        entity.velY = 0;
        entity.falling = false;
    } else if (support && entity.y + entity.height >= support.y) {
        entity.y = support.y - entity.height;
        entity.velY = 0;
        entity.falling = false;
    }
}

function triggerGravityCheck(digLeft, digRight, platformY) {
    items.forEach(item => {
        if (item.collected) return;
        const cx = item.x + item.width / 2;
        const bottom = item.y + item.height;
        if (cx >= digLeft && cx <= digRight && Math.abs(bottom - platformY) < blockSize) {
            item.falling = true;
            item.velY = 0;
        }
    });
    chests.forEach(chest => {
        if (chest.opened) return;
        const cx = chest.x + chest.width / 2;
        const bottom = chest.y + chest.height;
        if (cx >= digLeft && cx <= digRight && Math.abs(bottom - platformY) < blockSize) {
            chest.falling = true;
            chest.velY = 0;
        }
    });
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
    tickArmorDurabilityByTime();

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
    // 骑乘时跳过玩家重力更新
    if (!skipPlayerGravity) {
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
    } // end skipPlayerGravity check
    } // end else (not underwater)

    // 卡住检测：如果玩家有输入但位置长时间不变，强制解卡
    if (typeof player._stuckFrames === "undefined") player._stuckFrames = 0;
    if (typeof player._lastStuckX === "undefined") player._lastStuckX = player.x;
    const hasInput = keys.right || keys.left || keys.up || keys.jump;
    if (hasInput && player.grounded) {
        if (Math.abs(player.x - player._lastStuckX) < 0.5) {
            player._stuckFrames++;
            // 不更新 _lastStuckX，保持记录卡住起始位置
        } else {
            player._stuckFrames = 0;
            player._lastStuckX = player.x;  // 正常移动时才更新
        }
        if (player._stuckFrames > 45) {
            player.y -= blockSize * 0.8;
            player.velY = -2;
            player._stuckFrames = 0;
            player._lastStuckX = player.x;
        }
    } else {
        player._stuckFrames = 0;
        player._lastStuckX = player.x;
    }

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

    if (typeof updateFireZones === 'function') {
        updateFireZones();
    }

    // 更新末影龙
    for (const dragon of dragonList) {
        if (dragon.remove) continue;
        dragon.update(player);
    }
    dragonList = dragonList.filter(d => !d.remove);

    // 下龙无敌帧
    if (dismountInvincibleFrames > 0) {
        dismountInvincibleFrames--;
    }

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

    // 骑乘逻辑
    if (ridingDragon) {
        // 检查末影龙是否还存在
        if (ridingDragon.remove || !dragonList.includes(ridingDragon)) {
            dismountRider(player);
        } else {
            // 同步玩家位置
            player.x = ridingDragon.x + (ridingDragon.width - player.width) / 2;
            player.y = ridingDragon.y - player.height;
            player.velX = 0;
            player.velY = 0;

            // 控制末影龙移动
            const moveSpeed = ridingDragon.speed;
            if (keys.left) {
                ridingDragon.x -= moveSpeed;
                player.facingRight = false;
            }
            if (keys.right) {
                ridingDragon.x += moveSpeed;
                player.facingRight = true;
            }
            if (keys.up || keys.jump) {
                ridingDragon.y -= moveSpeed;
            }
            if (keys.down) {
                ridingDragon.y += moveSpeed;
            }

            // 边界限制
            ridingDragon.x = Math.max(cameraX - 50, Math.min(ridingDragon.x, cameraX + canvas.width + 50));
            ridingDragon.y = Math.max(50, Math.min(ridingDragon.y, groundY - ridingDragon.height - 50));

            // 跳过玩家重力更新
            skipPlayerGravity = true;
        }
    } else {
        skipPlayerGravity = false;

        // 检测上龙
        for (const dragon of dragonList) {
            if (rectIntersect(player.x, player.y, player.width, player.height, dragon.x, dragon.y, dragon.width, dragon.height)) {
                ridingDragon = dragon;
                dragon.rider = player;
                showToast("🐉 骑乘末影龙");
                break;
            }
        }
    }

    items.forEach(item => {
        if (item.collected) return;
        // 重力更新
        if (item.falling || item.velY !== 0) {
            updateEntityGravity(item);
        }
        // 浮动动画（下落时停止）
        if (!item.falling) {
            item.floatY = Math.sin(gameFrame / 20) * 5;
        } else {
            item.floatY = 0;
        }
        if (rectIntersect(player.x, player.y, player.width, player.height, item.x, item.y + item.floatY, 30, 30)) {
            item.collected = true;
            addScore(gameConfig.scoring.word);
            if (wordPicker && typeof wordPicker.updateWordQuality === "function" && item.wordObj?.en) {
                wordPicker.updateWordQuality(item.wordObj.en, "correct_slow");
            }
            recordWordProgress(item.wordObj);
            speakWord(item.wordObj);

            // Show floating text based on language mode
            const displayContent = window.BilingualVocab?.getDisplayContent?.(item.wordObj);
            const floatingText = displayContent ? displayContent.primaryText : (item.wordObj.zh || item.wordObj.en);
            showFloatingText(floatingText, item.x, item.y);

            maybeTriggerLearningChallenge(item.wordObj);
        }
    });

    // 宝箱重力更新
    chests.forEach(chest => {
        if (chest.falling || chest.velY !== 0) {
            updateEntityGravity(chest);
        }
    });

    wordGates.forEach(gate => {
        if (gate.cooldown > 0) gate.cooldown--;
        if (gate.locked && gate.cooldown <= 0 && rectIntersect(player.x, player.y, player.width, player.height, gate.x, gate.y, gate.width, gate.height)) {
            if (progress && !progress.shownWordGateTip) {
                showToast("路被词语闸门拦住了！答对单词才能继续前进");
                progress.shownWordGateTip = true;
                saveProgress();
            }
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

    // 花香护体计时器
    if (typeof gameState !== 'undefined' && gameState.flowerBuffTimer > 0) {
        gameState.flowerBuffTimer--;
        if (gameState.flowerBuffTimer <= 0) {
            showToast('🌸 花香护体效果结束');
        }
    }

    // 雪块临时平台倒计时
    for (let p of platforms) {
        if (p && p.type === "snow_temp" && !p.remove) {
            p.tempTimer--;
            if (p.tempTimer <= 0) {
                p.remove = true;
            }
        }
    }

    // Biomes are score-driven now; the old "next level / scene switch" caused conflicts.
    updateDifficultyState();
    gameFrame++;
}

function useDragonEgg() {
    // 检查是否已有末影龙
    if (dragonList.length > 0) {
        showToast("⚠️ 已有末影龙存在");
        return false;
    }

    // 检查龙蛋数量
    if ((inventory.dragon_egg || 0) <= 0) {
        showToast("❌ 没有龙蛋");
        return false;
    }

    // 消耗龙蛋
    inventory.dragon_egg--;
    if (typeof updateInventoryUI === 'function') {
        updateInventoryUI();
    }

    // 召唤末影龙
    const dragon = new EnderDragon(player.x + 50, player.y - 100);
    dragonList.push(dragon);
    showToast("🐉 召唤末影龙");
    return true;
}

function dismountRider(rider) {
    if (!ridingDragon || !rider) return;

    ridingDragon.rider = null;
    ridingDragon = null;
    skipPlayerGravity = false;

    // 给予缓降效果
    rider.velY = -2;

    // 无敌帧
    dismountInvincibleFrames = 60;
    playerInvincibleTimer = Math.max(Number(playerInvincibleTimer) || 0, 60);

    showToast("⬇️ 已下龙");
}

function dragonShootFireball() {
    if (!ridingDragon) return false;

    const dir = player.facingRight ? 1 : -1;
    const targetX = ridingDragon.x + dir * 300;
    const targetY = ridingDragon.y;

    return ridingDragon.shootFireball(targetX, targetY);
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

const ARMOR_DURATION_MINUTES = {
    leather: 3,   // 木盔甲（皮革）
    chainmail: 4,
    iron: 4,
    gold: 3,
    diamond: 6,
    netherite: 7
};

function getArmorDurationMs(armorId) {
    const minutes = Number(ARMOR_DURATION_MINUTES[armorId]);
    const safeMinutes = Number.isFinite(minutes) && minutes > 0 ? minutes : 4;
    return safeMinutes * 60 * 1000;
}

function breakEquippedArmor(armorId) {
    const broken = ARMOR_TYPES?.[armorId];
    playerEquipment.armor = null;
    playerEquipment.armorDurability = 0;
    playerEquipment.armorEquippedAt = 0;
    playerEquipment.armorLastDurabilityTick = 0;
    if (Array.isArray(armorInventory)) {
        armorInventory = armorInventory.filter((entry) => String(entry?.id || "") !== String(armorId || ""));
    }
    showToast(`${broken?.name || "盔甲"} 已失效`);
    updateArmorUI();
    if (typeof updateInventoryUI === "function") updateInventoryUI();
    if (typeof updateInventoryModal === "function") updateInventoryModal();
}

function tickArmorDurabilityByTime() {
    const armorId = playerEquipment?.armor;
    if (!armorId) return;
    if (!Number.isFinite(Number(playerEquipment.armorDurability))) {
        playerEquipment.armorDurability = 100;
    }
    if (playerEquipment.armorDurability <= 0) {
        breakEquippedArmor(armorId);
        return;
    }

    const now = Date.now();
    if (!Number(playerEquipment.armorEquippedAt)) {
        playerEquipment.armorEquippedAt = now;
        playerEquipment.armorLastDurabilityTick = now;
        return;
    }

    const lastTick = Number(playerEquipment.armorLastDurabilityTick) || now;
    const dt = Math.max(0, now - lastTick);
    if (dt <= 0) return;

    const durationMs = getArmorDurationMs(armorId);
    const loss = (dt / durationMs) * 100;
    if (loss <= 0) return;

    playerEquipment.armorDurability = Math.max(0, Number(playerEquipment.armorDurability) - loss);
    playerEquipment.armorLastDurabilityTick = now;
    if (playerEquipment.armorDurability <= 0) {
        breakEquippedArmor(armorId);
        return;
    }
    updateArmorUI();
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
    const armorId = playerEquipment.armor;
    const hasArmor = !!(armorId && playerEquipment.armorDurability > 0);
    const reductionByArmor = {
        leather:   0.25,  // 皮革：减伤 25%
        chainmail: 0.40,  // 锁链：减伤 40%
        iron:      0.55,  // 铁甲：减伤 55%
        gold:      0.35,  // 黄金：减伤 35%（防御弱，耐久低，参考 Minecraft 原版）
        diamond:   0.75,  // 钻石：减伤 75%（强但不无敌）
        netherite: 0.82   // 下界合金：减伤 82%（最强，仍会掉血）
    };
    const baseReduction = Math.min(0.6, defense * 0.12);
    const armorReduction = reductionByArmor[armorId];
    const reduction = hasArmor ? (Number.isFinite(armorReduction) ? armorReduction : baseReduction) : baseReduction;
    const minDamage = 1;  // 有无护甲都至少受 1 点伤害，钻石/下界合金不再无敌
    const actualDamage = Math.max(minDamage, Math.round(scaledDamage * (1 - reduction)));
    if (hasArmor) {
        // Hit-based durability loss per armor type
        const hitDurabilityCost = {
            leather: 8, chainmail: 6, iron: 5, gold: 5, diamond: 3, netherite: 2
        };
        const cost = hitDurabilityCost[armorId] || 5;
        playerEquipment.armorDurability = Math.max(0, playerEquipment.armorDurability - cost);
        if (playerEquipment.armorDurability <= 0) {
            breakEquippedArmor(armorId);
        }
    }
    updateArmorUI();
    playerHp = Math.max(0, playerHp - actualDamage);
    if (typeof addDeepDarkNoise === "function") addDeepDarkNoise(8, "", "hurt");
    updateHpUI();
    showFloatingText(`-${penalty}分`, player.x, player.y);
    if (playerHp <= 0 || score <= 0) {
        // 检查图腾复活
        if (playerHp <= 0 && inventory.totem > 0) {
            inventory.totem -= 1;
            playerHp = 3;
            playerInvincibleTimer = 180; // 3秒无敌
            for (let i = 0; i < 20; i++) {
                emitGameParticle("ember", player.x + Math.random() * player.width, player.y + Math.random() * player.height);
            }
            showFloatingText('🗿 图腾复活!', player.x, player.y - 50, '#FFD700');
            showToast('🗿 复活图腾生效！HP恢复3❤️');
            updateHpUI();
            updateInventoryUI();
            return;
        }
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

function applyInventoryTabLayoutClass() {
    if (!inventoryContentEl) return;
    inventoryContentEl.classList.remove(
        "inventory-tab-items",
        "inventory-tab-materials",
        "inventory-tab-equipment",
        "inventory-tab-collectibles"
    );
    const safeTab = INVENTORY_CATEGORIES[inventoryTab] ? inventoryTab : "items";
    inventoryContentEl.classList.add(`inventory-tab-${safeTab}`);
}

function renderInventoryModal() {
    if (!inventoryContentEl) return;
    applyInventoryTabLayoutClass();
    if (inventoryTab === "equipment") {
        const armorLabel = playerEquipment.armor ? (ARMOR_TYPES[playerEquipment.armor]?.name || playerEquipment.armor) : "无";
        const armorDur = playerEquipment.armor ? `${Math.round(Number(playerEquipment.armorDurability) || 0)}%` : "--";
        const armorListHtml = (armorInventory || []).map((entry, idx) => {
            const armor = ARMOR_TYPES[entry.id];
            const name = armor?.name || entry.id;
            const icon = ITEM_ICONS["armor_" + entry.id] || "🛡️";
            return `<div class="inventory-item" onclick="window.equipArmorFromBackpack && window.equipArmorFromBackpack('${entry.id}')">
                <div class="inventory-item-left">
                    <div class="inventory-item-icon">${icon}</div>
                    <div class="inventory-item-name">${name} (${Math.round(Number(entry.durability) || 0)}%)</div>
                </div>
                <div class="inventory-item-count">装备</div>
            </div>`;
        }).join("");
        const weapons = getInventoryEntries(["stone_sword", "iron_pickaxe", "bow", "arrow"]);
        const currentArmorHtml = `
            <div class="inventory-equipment inventory-item-wide">
                <div>🛡️ 当前护甲：${armorLabel}</div>
                <div>耐久：${armorDur}</div>
                ${playerEquipment.armor ? `<div class="inventory-item inventory-item-wide" onclick="window.unequipArmorFromBackpack && window.unequipArmorFromBackpack()" style="cursor:pointer;margin-top:4px"><div class="inventory-item-left"><div class="inventory-item-name">卸下护甲</div></div></div>` : ""}
            </div>
        `;
        const armorSectionHtml = armorListHtml || `<div class="inventory-empty">无库存护甲</div>`;
        const weaponHtml = weapons.length
            ? weapons.map(entry => `
                <div class="inventory-item" data-item="${entry.key}" onclick="window.useInventoryItem && window.useInventoryItem('${entry.key}')">
                    <div class="inventory-item-left">
                        <div class="inventory-item-icon">${entry.icon}</div>
                        <div class="inventory-item-name">${entry.label}</div>
                    </div>
                    <div class="inventory-item-count">${entry.count}</div>
                </div>
            `).join("")
            : `<div class="inventory-empty">暂无装备</div>`;
        // Sunscreen buff display
        let sunscreenHtml = "";
        if (typeof hasVillageBuff === "function" && hasVillageBuff("sunscreen")) {
            const buffs = typeof getPlayerBuffStore === "function" ? getPlayerBuffStore() : {};
            const remaining = Math.max(0, (buffs.sunscreen?.expiresAt || 0) - Date.now());
            const mins = Math.floor(remaining / 60000);
            const secs = Math.floor((remaining % 60000) / 1000);
            sunscreenHtml = `<div class="inventory-equipment inventory-item-wide" style="margin-top:6px;">
                <div>🧴 防晒霜 剩余 ${mins}:${String(secs).padStart(2, "0")}</div>
            </div>`;
        }
        inventoryContentEl.innerHTML = `${currentArmorHtml}${sunscreenHtml}${armorSectionHtml}${weaponHtml}`;
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
                <div class="inventory-item-name">${entry.label}${hint}${onCooldown ? ' ⏳' : ''}</div>
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
    if (inventoryModalEl.classList.contains("visible")) return;
    pushPause();
    inventoryPauseHeld = true;
    inventoryModalEl.classList.add("visible");
    inventoryModalEl.setAttribute("aria-hidden", "false");
    renderInventoryModal();
}

function hideInventoryModal() {
    if (!inventoryModalEl) return;
    if (!inventoryModalEl.classList.contains("visible") && !inventoryPauseHeld) return;
    inventoryModalEl.classList.remove("visible");
    inventoryModalEl.setAttribute("aria-hidden", "true");
    if (inventoryPauseHeld) {
        popPause();
        inventoryPauseHeld = false;
    }
}

function updateInventoryModal() {
    if (!inventoryModalEl || !inventoryModalEl.classList.contains("visible")) return;
    renderInventoryModal();
}

// 背包物品使用函数
// ============================================
// 消耗品装备槽逻辑（新增）
// ============================================

/**
 * 装备消耗品到槽位
 * @param {string} itemKey - 材料 key（如 "gunpowder"）
 * @returns {boolean} 是否装备成功
 */
function equipConsumable(itemKey) {
    const count = Number(inventory[itemKey]) || 0;
    if (count <= 0) {
        showToast("❌ 没有该物品");
        return false;
    }

    const config = CONSUMABLES_CONFIG[itemKey];
    if (!config) {
        console.warn('[Consumable] Unknown item:', itemKey);
        return false;
    }

    equippedConsumable = {
        itemKey: itemKey,
        count: count,
        icon: config.icon
    };

    updateConsumableUI();
    showToast(`✅ 装备: ${config.icon} ${config.name}`);
    return true;
}

/**
 * 使用已装备的消耗品
 */
function useEquippedConsumable() {
    if (!equippedConsumable.itemKey) {
        showToast("❌ 未装备消耗品");
        return;
    }

    // 调用现有的 useInventoryItem 函数
    useInventoryItem(equippedConsumable.itemKey);

    // 更新装备槽状态
    equippedConsumable.count = Number(inventory[equippedConsumable.itemKey]) || 0;
    if (equippedConsumable.count <= 0) {
        showToast("⚠️ 消耗品已用完");
        equippedConsumable = { itemKey: null, count: 0, icon: null };
    }

    updateConsumableUI();
}

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
        if (!Array.isArray(bombs) || typeof Bomb !== "function") {
            showToast("❌ 炸药功能暂不可用");
            return;
        }
        inventory.gunpowder -= 1;
        const direction = player.facingRight ? 1 : -1;
        bombs.push(new Bomb(player.x + player.width / 2, player.y, direction));
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
        used = useDragonEgg();
        if (used) {
            itemCooldownTimers.dragon_egg = ITEM_COOLDOWNS.dragon_egg;
        }
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
    } else if (itemKey === "echo_shard") {
        // 回响碎片 x3 -> 合成复活图腾
        if (count < 3) {
            showToast("❌ 需要3个回响碎片");
            return;
        }
        inventory.echo_shard -= 3;
        if (!inventory.totem) inventory.totem = 0;
        inventory.totem += 1;
        showFloatingText("🗿 合成图腾!", player.x, player.y - 40, "#FFD700");
        showToast("🔷 回响碎片×3 → 🗿 复活图腾");
        used = true;
    } else if (itemKey === "mushroom") {
        // 蘑菇 x2 -> 合成蘑菇煲
        if (count < 2) {
            showToast("❌ 需要2个蘑菇");
            return;
        }
        inventory.mushroom -= 2;
        if (!inventory.mushroom_stew) inventory.mushroom_stew = 0;
        inventory.mushroom_stew += 1;
        showFloatingText("🍲 合成蘑菇煲!", player.x, player.y - 40, "#CD853F");
        showToast("🍄 蘑菇×2 → 🍲 蘑菇煲");
        used = true;
    } else if (itemKey === "stick") {
        // 木棍 x5 + 蜘蛛丝 x3 -> 合成弓
        if (count < 5) {
            showToast(`❌ 需要5根木棍（当前${count}根）`);
            return;
        }
        if ((inventory.string || 0) < 3) {
            showToast(`❌ 还需要3根蜘蛛丝（当前${inventory.string || 0}根）`);
            return;
        }
        inventory.stick -= 5;
        inventory.string -= 3;
        inventory.bow = (inventory.bow || 0) + 1;
        showFloatingText("🏹 合成弓!", player.x, player.y - 40, "#8B4513");
        showToast("🥢×5 + 🕸️×3 → 🏹 弓");
        used = true;
    } else if (itemKey === "flower") {
        // 花朵 -> 花香护体30秒，敌人攻击频率-30%
        inventory.flower -= 1;
        if (typeof gameState === 'undefined') window.gameState = {};
        gameState.flowerBuffTimer = 1800; // 30秒 @60fps
        itemCooldownTimers.flower = ITEM_COOLDOWNS.flower;
        showFloatingText("🌸 花香护体!", player.x, player.y - 40, "#FF69B4");
        showToast("🌸 花香护体激活 (30秒，敌人攻击减缓)");
        used = true;
    } else if (itemKey === "snow_block") {
        // 雪块 -> 在脚下放置临时平台5秒
        inventory.snow_block -= 1;
        const tempPlatform = {
            x: player.x - 10,
            y: player.y + player.height,
            width: player.width + 20,
            height: 16,
            color: "#B0E0E6",
            tempTimer: 300, // 5秒 @60fps
            remove: false,
            type: "snow_temp"
        };
        platforms.push(tempPlatform);
        showFloatingText("🧊 临时平台!", player.x, player.y - 30, "#B0E0E6");
        showToast("🧊 雪块平台放置 (5秒后消失)");
        used = true;
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

    // ============================================
    // 新增：根据配置应用 Debuff
    // ============================================
    const config = CONSUMABLES_CONFIG[itemKey];
    if (config && config.effect && config.effect.debuff) {
        const debuff = config.effect.debuff;
        const effectRadius = config.effect.radius || 150;

        // 对范围内敌人应用 debuff
        enemies.forEach(enemy => {
            const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
            if (dist < effectRadius && typeof enemy.addDebuff === "function") {
                enemy.addDebuff(
                    debuff.type,
                    debuff.duration,
                    {
                        damagePerFrame: debuff.damagePerSecond ? debuff.damagePerSecond / 60 : 0,
                        speedMult: debuff.speedMult || 1.0
                    }
                );
            }
        });
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
    playerEquipment.armorDurability = Number.isFinite(Number(selected.durability)) ? Number(selected.durability) : 100;
    const now = Date.now();
    playerEquipment.armorEquippedAt = now;
    playerEquipment.armorLastDurabilityTick = now;
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
    playerEquipment.armorEquippedAt = 0;
    playerEquipment.armorLastDurabilityTick = 0;
    updateArmorUI();
    showToast(`${armor?.name || "盔甲"} 已卸下`);
}

function getArmorDefense() {
    if (!playerEquipment.armor) return 0;
    const armor = ARMOR_TYPES[playerEquipment.armor];
    return armor ? armor.defense : 0;
}

function updateArmorUI() {
    if (typeof updateEquipStatus === "function") updateEquipStatus();
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
                <div class="armor-durability">耐久 ${Math.round(Number(playerEquipment.armorDurability) || 0)}%</div>
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
                    <div class="armor-durability">耐久 ${Math.round(Number(item.durability) || 0)}%</div>
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
    if (!armorPauseHeld) {
        pushPause();
        armorPauseHeld = true;
    }
}

function hideArmorSelectUI() {
    const modal = document.getElementById("armor-select-modal");
    if (!modal) return;
    modal.classList.remove("visible");
    modal.setAttribute("aria-hidden", "true");
    if (armorPauseHeld) {
        popPause();
        armorPauseHeld = false;
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

function handleInteraction(interactMode = "tap") {
    if (typeof isVillageInteriorActive === "function" && isVillageInteriorActive()) {
        if (paused || isModalPauseActive()) return;
        if (typeof handleVillageInteriorInteraction === "function") {
            handleVillageInteriorInteraction(interactMode);
        }
        return;
    }
    if (paused || isModalPauseActive()) return;
    // v1.8.3 村庄建筑交互优先
    if (playerInVillage && currentVillage && typeof checkVillageBuildings === 'function') {
      const handled = checkVillageBuildings(currentVillage, interactMode);
      if (handled) return;
    }

    let nearestChest = null;
    let minDist = 60;
    const now = Date.now();
    for (let c of chests) {
        const dx = Math.abs((player.x + player.width / 2) - (c.x + c.width / 2));
        const dy = Math.abs((player.y + player.height) - (c.y + c.height));
        if (dx < minDist && dy < blockSize * 1.5) {
            nearestChest = c;
            minDist = dx;
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

    if (ridingDragon) {
        dragonShootFireball();
        return;
    }

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

