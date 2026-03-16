// ============ BOSS 战斗系统：核心与管理 ============

function isPlayerProtectedFromWitherInVillage() {
    return typeof playerInVillage !== 'undefined' && !!playerInVillage;
}

const BOSS_REGISTRY = Object.freeze([
    { id: 'wither', score: 2000, flying: true, debugCtor: 'WitherBoss' },
    { id: 'ghast', score: 4000, flying: true, debugCtor: 'GhastBoss' },
    { id: 'blaze', score: 6000, flying: true, debugCtor: 'BlazeBoss' },
    { id: 'wither_skeleton', score: 8000, flying: false, debugCtor: 'WitherSkeletonBoss' },
    { id: 'warden', score: 10000, flying: false, debugCtor: 'WardenBoss' },
    { id: 'evoker', score: 12000, flying: false, debugCtor: 'EvokerBoss' }
]);

const DEFAULT_BOSS_REWARDS = Object.freeze({
    wither: Object.freeze({ key: 'wither_relic', drops: Object.freeze(['diamond', 'diamond', 'potion']) }),
    ghast: Object.freeze({ key: 'ghast_tear_cache', drops: Object.freeze(['diamond', 'iron', 'potion']) }),
    blaze: Object.freeze({ key: 'blaze_powder_cache', drops: Object.freeze(['blaze_powder', 'magma_cream']) }),
    wither_skeleton: Object.freeze({ key: 'ashen_bone_cache', drops: Object.freeze(['coal', 'iron']) }),
    warden: Object.freeze({ key: 'echo_cache', drops: Object.freeze(['echo_shard', 'sculk_vein']) }),
    evoker: Object.freeze({ key: 'arcane_cache', drops: Object.freeze(['emerald', 'potion']) })
});

function getBossRewardConfig(type) {
    const normalized = String(type || '').trim().toLowerCase();
    return DEFAULT_BOSS_REWARDS[normalized] || Object.freeze({ key: `${normalized || 'boss'}_cache`, drops: Object.freeze(['iron']) });
}

function getBossMetaEntry(type) {
    const normalized = String(type || '').trim().toLowerCase();
    return BOSS_REGISTRY.find((entry) => entry.id === normalized) || BOSS_REGISTRY[0];
}

class Boss {
    constructor(config) {
        const hpMultiplier = Math.max(1, Number(settings?.bossHpMultiplier) || 2);
        const scaledMaxHp = Math.max(1, Math.round((Number(config.maxHp) || 1) * hpMultiplier));
        this.name = config.name;
        this.maxHp = scaledMaxHp;
        this.hp = scaledMaxHp;
        this.x = config.x || 0;
        this.y = config.y || 100;
        this.width = config.width || 96;
        this.height = config.height || 96;
        this.color = config.color || '#333';
        this.phase = 1;
        this.phaseThresholds = config.phaseThresholds || [0.6, 0.2];
        this.alive = true;
        this.remove = false;
        this.bossProjectiles = [];
        this.attackTimer = 0;
        this.stunTimer = 0;
        this.flashTimer = 0;
        this.particles = [];
        this.damage = config.damage || 1;
        this.type = config.id || 'boss';
        this.visualKey = config.visualKey || 'boss_v1';
        this.debugState = config.debugState || 'idle';
        this.intentKey = config.intentKey || this.debugState || 'idle';
        const rewardConfig = config.rewardConfig || getBossRewardConfig(this.type);
        this.rewardKey = config.rewardKey || rewardConfig.key || `${this.type}_cache`;
        this.rewardDrops = Array.isArray(config.rewardDrops) ? config.rewardDrops.slice() : Array.isArray(rewardConfig.drops) ? rewardConfig.drops.slice() : [];
        this.phaseInvulnerableTimer = 0;
    }

    update(playerRef) {
        if (!this.alive) return;
        if (this.phaseInvulnerableTimer > 0) this.phaseInvulnerableTimer--;
        this.updatePhase();
        this.updateProjectiles();
        this.updateParticles();
        if (this.flashTimer > 0) this.flashTimer--;
        if (this.stunTimer > 0) { this.stunTimer--; return; }
        this.updateBehavior(playerRef);
    }

    updatePhase() {
        const pct = this.hp / this.maxHp;
        if (this.phase === 1 && pct <= this.phaseThresholds[0]) {
            this.phase = 2;
            this.onPhaseChange(2);
        } else if (this.phase === 2 && pct <= this.phaseThresholds[1]) {
            this.phase = 3;
            this.onPhaseChange(3);
        }
    }

    setIntent(key) {
        this.intentKey = String(key || 'idle');
        return this.intentKey;
    }

    setReward(config = {}) {
        const drops = Array.isArray(config.drops) ? config.drops.slice() : this.rewardDrops.slice();
        this.rewardKey = String(config.key || this.rewardKey || `${this.type}_cache`);
        this.rewardDrops = drops;
        return { key: this.rewardKey, drops: this.rewardDrops.slice() };
    }

    getProjectileTypeSnapshot() {
        if (!Array.isArray(this.bossProjectiles) || !this.bossProjectiles.length) return [];
        const seen = new Set();
        this.bossProjectiles.forEach((projectile) => {
            const type = projectile && projectile.type ? String(projectile.type) : 'default';
            if (type) seen.add(type);
        });
        return Array.from(seen);
    }
// PLACEHOLDER_BOSS_METHODS
    onReflectedHit(projectile) {}

    updateProjectiles() {
        for (let i = this.bossProjectiles.length - 1; i >= 0; i--) {
            const p = this.bossProjectiles[i];
            // 追踪逻辑（反弹后不再追踪玩家）
            if (p.tracking && !p.reflected && p.trackDelay !== undefined) {
                if (p.trackDelay > 0) { p.trackDelay--; }
                else {
                    const dx = player.x + player.width / 2 - p.x;
                    const dy = player.y + player.height / 2 - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 0) {
                        p.vx += (dx / dist) * 0.15;
                        p.vy += (dy / dist) * 0.15;
                        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                        if (spd > 4) { p.vx = (p.vx / spd) * 4; p.vy = (p.vy / spd) * 4; }
                    }
                }
            }
            p.x += p.vx;
            p.y += p.vy;
            p.life = (p.life || 300) - 1;
            // 反弹弹幕碰撞BOSS
            if (p.reflected) {
                if (Math.abs(p.x - this.x - this.width / 2) < p.size + this.width / 2 &&
                    Math.abs(p.y - this.y - this.height / 2) < p.size + this.height / 2) {
                    this.takeDamage(p.damage);
                    this.onReflectedHit(p);
                    this.bossProjectiles.splice(i, 1);
                    continue;
                }
            } else {
                // 碰撞玩家
                if (Math.abs(p.x - player.x - player.width / 2) < p.size + player.width / 2 &&
                    Math.abs(p.y - player.y - player.height / 2) < p.size + player.height / 2) {
                    if (this.type === 'wither' && isPlayerProtectedFromWitherInVillage()) continue;
                    damagePlayer(p.damage, p.x);
                    this.bossProjectiles.splice(i, 1);
                    continue;
                }
            }
            // 超出范围或生命结束
            if (p.life <= 0 || p.x < cameraX - 200 || p.x > cameraX + canvas.width + 200 ||
                p.y < -200 || p.y > 1000) {
                this.bossProjectiles.splice(i, 1);
            }
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx || 0;
            p.y += p.vy || 0;
            p.life -= 0.02;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    takeDamage(amount) {
        if (this.phaseInvulnerableTimer > 0) return;
        if (this.stunTimer > 0) amount = Math.ceil(amount * 1.5);
        this.hp -= amount;
        this.flashTimer = 10;
        showFloatingText(`-${amount}`, this.x + this.width / 2, this.y - 10, '#FF4444');
        if (this.hp <= 0) {
            this.hp = 0;
            this.die();
        }
    }

    die() {
        this.alive = false;
        this.remove = true;
        bossArena.onVictory();
    }

    updateBehavior(playerRef) {}
    onPhaseChange(newPhase) {
        this.phaseInvulnerableTimer = 30;
        this.flashTimer = 15;
        if (typeof bossArena !== 'undefined' && typeof bossArena.triggerPhaseFlash === 'function') {
            bossArena.triggerPhaseFlash(`${this.name} 进入阶段 ${newPhase}`);
        }
    }
    render(ctx) {}
}

// BOSS 战场管理器
globalThis.bossArena = globalThis.bossArena || {
    active: false,
    boss: null,
    currentEncounter: null,
    victoryTimer: 0,
    phaseFlashTimer: 0,
    phaseBannerText: '',
    bossTypes: BOSS_REGISTRY.map((entry) => entry.id),
    bossScores: BOSS_REGISTRY.map((entry) => entry.score),         // BOSS分数阈值
    spawned: {},           // 已生成的BOSS记录
    gateBossRotationCursor: 0,
    weaponLockActive: false,
    weaponBeforeBoss: "sword",
    lastEnvironmentPulseSerial: 0,
    comboCooldowns: { volcanic: 0, shadow: 0, arcane: 0 },
    environmentController: (typeof globalThis.bossEnvironmentController !== "undefined") ? globalThis.bossEnvironmentController : null,

// PLACEHOLDER_ARENA_METHODS

    getBossMeta(type) {
        return getBossMetaEntry(type);
    },

    getBossTypes() {
        return this.bossTypes.slice();
    },

    normalizeBossType(type) {
        const normalized = String(type || "").trim().toLowerCase();
        if (this.bossTypes.includes(normalized)) return normalized;
        return "wither";
    },

    resolveGateBossType(fromBiomeId) {
        const cfg = (typeof getBiomeSwitchConfig === "function") ? getBiomeSwitchConfig() : null;
        const gateBossCfg = cfg && cfg.gateBoss && typeof cfg.gateBoss === "object" ? cfg.gateBoss : {};
        const fromBiome = (fromBiomeId && typeof getBiomeById === "function") ? getBiomeById(fromBiomeId) : null;
        const biomeType = String(fromBiome?.gateBossType || "").trim().toLowerCase();
        const defaultType = String(gateBossCfg.defaultType || "wither").trim().toLowerCase();
        if (biomeType) return this.normalizeBossType(biomeType);
        // Keep gate bosses rotating by default so players don't always face wither.
        if (!defaultType || defaultType === "rotate") return this.nextGateBossType();
        if (defaultType === "wither" && gateBossCfg.rotateOnFallback !== false) return this.nextGateBossType();
        return this.normalizeBossType(defaultType);
    },

    nextGateBossType() {
        const list = Array.isArray(this.bossTypes) && this.bossTypes.length ? this.bossTypes : ["wither"];
        const idx = Math.max(0, Number(this.gateBossRotationCursor) || 0) % list.length;
        this.gateBossRotationCursor = (idx + 1) % list.length;
        return this.normalizeBossType(list[idx]);
    },

    lockWeaponForBossFight() {
        if (typeof playerWeapons === "undefined" || !playerWeapons) return;
        this.weaponLockActive = true;
        this.weaponBeforeBoss = "sword";
        if (playerWeapons.current !== "sword") {
            playerWeapons.current = "sword";
            playerWeapons.attackCooldown = 0;
            if (typeof updateWeaponUI === "function") updateWeaponUI();
            showToast("⚔️ BOSS战已锁定为剑模式");
        }
    },

    unlockWeaponAfterBossFight() {
        if (typeof playerWeapons === "undefined" || !playerWeapons) {
            this.weaponLockActive = false;
            this.weaponBeforeBoss = "sword";
            return;
        }
        const prev = this.weaponBeforeBoss || "sword";
        const unlocked = Array.isArray(playerWeapons.unlocked) ? playerWeapons.unlocked : [];
        playerWeapons.current = unlocked.includes(prev) ? prev : "sword";
        playerWeapons.attackCooldown = 0;
        this.weaponLockActive = false;
        this.weaponBeforeBoss = "sword";
        if (typeof updateWeaponUI === "function") updateWeaponUI();
    },

    checkSpawn() {
        if (this.active) return;
        if (settings && settings.fixedBossEnabled === false) return;
        const score = getProgressScore();
        for (let i = 0; i < this.bossTypes.length; i++) {
            const type = this.bossTypes[i];
            if (!this.spawned[type] && score >= this.bossScores[i]) {
                this.enter(type, { source: "score_threshold", markSpawned: true });
                return;
            }
        }
    },

    enter(bossType, options = {}) {
        const resolvedType = this.normalizeBossType(bossType);
        this.active = true;
        this.victoryTimer = 0;
        this.phaseFlashTimer = 0;
        this.phaseBannerText = '';
        this.currentEncounter = {
            source: String(options.source || "manual"),
            fromBiome: options.fromBiome || null,
            toBiome: options.toBiome || null,
            onVictory: (typeof options.onVictory === "function") ? options.onVictory : null
        };
        if (options.markSpawned !== false) this.spawned[resolvedType] = true;
        this.boss = this.createBoss(resolvedType);
        this.environmentController = (typeof globalThis.bossEnvironmentController !== "undefined") ? globalThis.bossEnvironmentController : this.environmentController;
        if (this.environmentController && typeof this.environmentController.enter === "function") {
            this.environmentController.enter(resolvedType, { source: this.currentEncounter.source || "manual" });
        }
        this.lockWeaponForBossFight();
        const isFlyingBoss = !!this.getBossMeta(resolvedType).flying;
        let grantedRangedSupport = false;
        if (isFlyingBoss) {
            const minArrows = 12;
            if ((inventory.bow || 0) <= 0) {
                inventory.bow = 1;
                grantedRangedSupport = true;
            }
            if ((inventory.arrow || 0) < minArrows) {
                inventory.arrow = minArrows;
                grantedRangedSupport = true;
            }
            if (typeof syncWeaponsFromInventory === 'function') syncWeaponsFromInventory();
            if (typeof updateInventoryUI === 'function') updateInventoryUI();
        }
        // 视口锁定 + 边界墙
        this.viewportLocked = true;
        this.lockedCamX = cameraX;
        this.leftWall = cameraX;
        this.rightWall = cameraX + canvas.width;
        this.clampBossToArena();
        const supportText = grantedRangedSupport ? '（已补给弓箭）' : '';
        if (this.currentEncounter.source === "biome_gate") {
            const fromBiome = this.currentEncounter.fromBiome || "?";
            const toBiome = this.currentEncounter.toBiome || "?";
            showToast(`⚔️ 门禁BOSS：${fromBiome} -> ${toBiome}（${this.boss.name}）${supportText}`);
        } else {
            showToast(`⚔️ BOSS战！${this.boss.name}${supportText}`);
        }
    },

    enterBiomeGate(fromBiomeId, toBiomeId, options = {}) {
        const bossType = this.resolveGateBossType(fromBiomeId);
        this.enter(bossType, {
            source: "biome_gate",
            fromBiome: fromBiomeId || null,
            toBiome: toBiomeId || null,
            markSpawned: false,
            onVictory: options.onVictory
        });
    },

    createBoss(type) {
        const spawnX = player.x + 300;
        switch (type) {
            case 'wither': return new WitherBoss(spawnX);
            case 'ghast': return new GhastBoss(spawnX);
            case 'blaze': return new BlazeBoss(spawnX);
            case 'wither_skeleton': return new WitherSkeletonBoss(spawnX);
            case 'warden': return (typeof WardenBoss === 'function') ? new WardenBoss(spawnX) : new WitherSkeletonBoss(spawnX);
            case 'evoker': return (typeof EvokerBoss === 'function') ? new EvokerBoss(spawnX) : new BlazeBoss(spawnX);
            default: return new WitherBoss(spawnX);
        }
    },

    clampBossToArena() {
        if (!this.active || !this.boss) return;
        const padding = 20;
        const bossWidth = Math.max(0, Number(this.boss.width) || 0);
        const minX = (Number(this.leftWall) || 0) + padding;
        const maxX = (Number(this.rightWall) || (canvas ? canvas.width : 0)) - bossWidth - padding;
        if (!Number.isFinite(minX) || !Number.isFinite(maxX)) return;
        if (maxX >= minX) {
            this.boss.x = Math.max(minX, Math.min(maxX, Number(this.boss.x) || minX));
        }
    },

    exit() {
        if (this.environmentController && typeof this.environmentController.exit === "function") {
            this.environmentController.exit();
        }
        this.unlockWeaponAfterBossFight();
        this.lastEnvironmentPulseSerial = 0;
        this.comboCooldowns = { volcanic: 0, shadow: 0, arcane: 0 };
        this.active = false;
        this.boss = null;
        this.currentEncounter = null;
        this.viewportLocked = false;
        this.phaseFlashTimer = 0;
        this.phaseBannerText = '';
    },

    onVictory() {
        if (this.victoryTimer > 0) return;
        this.victoryTimer = 1;
        this.viewportLocked = false;
        const defeatedBoss = this.boss;
        const rewardDrops = defeatedBoss && Array.isArray(defeatedBoss.rewardDrops) ? defeatedBoss.rewardDrops.slice() : [];
        const rewardKey = defeatedBoss && defeatedBoss.rewardKey ? defeatedBoss.rewardKey : 'boss_cache';
        const rewardName = defeatedBoss && defeatedBoss.name ? defeatedBoss.name : 'BOSS';
        score += 500;
        inventory.iron = (inventory.iron || 0) + 5;
        addArmorToInventory('diamond');
        rewardDrops.forEach((itemKey) => {
            if (!itemKey) return;
            inventory[itemKey] = (inventory[itemKey] || 0) + 1;
        });
        showFloatingText('🎉 击败BOSS!', player.x, player.y - 60, '#FFD700');
        if (rewardDrops.length) {
            showFloatingText(`🎁 ${rewardDrops.join(' + ')}`, player.x, player.y - 88, '#FFE082');
        }
        showToast(`🎉 击败${rewardName}! 🎁 ${rewardKey} 掉落!`);
        const callback = this.currentEncounter && typeof this.currentEncounter.onVictory === "function"
            ? this.currentEncounter.onVictory
            : null;
        if (callback) {
            try {
                callback({
                    source: this.currentEncounter.source || "manual",
                    fromBiome: this.currentEncounter.fromBiome || null,
                    toBiome: this.currentEncounter.toBiome || null,
                    bossType: this.boss ? this.boss.type : null
                });
            } catch (err) {
                console.warn("bossArena.onVictory callback failed", err);
            }
        }
    },

    applyEnvironmentEffects(snapshot = null) {
        if (!this.active || typeof player === "undefined" || !player) return;
        const environmentSnapshot = snapshot || (this.environmentController && typeof this.environmentController.getSnapshot === "function"
            ? this.environmentController.getSnapshot()
            : null);
        if (!environmentSnapshot || !environmentSnapshot.active) return;
        if (environmentSnapshot.theme === "storm") {
            const windForce = Number(environmentSnapshot.windForce) || 0;
            if (Math.abs(windForce) >= 0.01) {
                const padding = 18;
                const minX = (Number(this.leftWall) || 0) + padding;
                const maxX = (Number(this.rightWall) || (canvas ? canvas.width : 0)) - (Number(player.width) || 0) - padding;
                player.x += windForce * 2.4;
                if (typeof player.velX === "number") player.velX += windForce * 0.35;
                if (Number.isFinite(minX) && Number.isFinite(maxX) && maxX > minX) {
                    player.x = Math.max(minX, Math.min(maxX, player.x));
                }
            }
        }
        if (environmentSnapshot.theme === "volcanic") {
            const pulseSerial = Math.max(0, Number(environmentSnapshot.pulseSerial) || 0);
            if (pulseSerial > 0 && pulseSerial !== this.lastEnvironmentPulseSerial) {
                this.lastEnvironmentPulseSerial = pulseSerial;
                player.y -= 16;
                if (typeof damagePlayer === "function") damagePlayer(1, player.x, 0);
                if (this.boss && typeof this.boss.castFlameRing === "function" && (this.comboCooldowns?.volcanic || 0) <= 0) {
                    this.boss.castFlameRing();
                    this.comboCooldowns.volcanic = 90;
                    if (this.environmentController && typeof this.environmentController.triggerCombo === "function") {
                        this.environmentController.triggerCombo("volcanic_ring", 48);
                    }
                }
            }
        }
        if (environmentSnapshot.theme === "ashen") {
            const inset = Math.max(0, Number(environmentSnapshot.safeZoneInset) || 0);
            if (inset > 0) {
                const minX = (Number(this.leftWall) || 0) + inset;
                const maxX = (Number(this.rightWall) || (canvas ? canvas.width : 0)) - (Number(player.width) || 0) - inset;
                if (Number.isFinite(minX) && Number.isFinite(maxX) && maxX > minX) {
                    player.x = Math.max(minX, Math.min(maxX, player.x));
                }
            }
        }
        if (environmentSnapshot.theme === "darkness") {
            if (typeof player.velX === "number") player.velX *= 0.82;
        }
        if (environmentSnapshot.theme === "shadow") {
            const driftForce = Math.max(0, Number(environmentSnapshot.driftForce) || 0);
            if (driftForce > 0) {
                const arenaCenterX = (((Number(this.leftWall) || 0) + (Number(this.rightWall) || (canvas ? canvas.width : 0))) * 0.5) - ((Number(player.width) || 0) * 0.5);
                const direction = arenaCenterX > player.x ? 1 : -1;
                player.x += direction * driftForce * 2.2;
                if (typeof player.velX === "number") player.velX += direction * driftForce * 0.25;
                const farEdge = player.x > ((Number(this.leftWall) || 0) + ((Number(this.rightWall) || 0) - (Number(this.leftWall) || 0)) * 0.7) || player.x < ((Number(this.leftWall) || 0) + ((Number(this.rightWall) || 0) - (Number(this.leftWall) || 0)) * 0.3);
                if (farEdge && this.boss && typeof this.boss.shootTrackingBalls === "function" && (this.comboCooldowns?.shadow || 0) <= 0) {
                    this.boss.shootTrackingBalls(3);
                    this.comboCooldowns.shadow = 90;
                    if (this.environmentController && typeof this.environmentController.triggerCombo === "function") {
                        this.environmentController.triggerCombo("shadow_barrage", 48);
                    }
                }
            }
        }
        if (environmentSnapshot.theme === "arcane") {
            const sealFrames = Math.max(0, Number(environmentSnapshot.sealFrames) || 0);
            if (sealFrames > 0) {
                const arenaWidth = Math.max(0, (Number(this.rightWall) || 0) - (Number(this.leftWall) || 0));
                const sealThreshold = (Number(this.leftWall) || 0) + arenaWidth * 0.72;
                if (player.x >= sealThreshold) {
                    player.x -= 16 + sealFrames * 0.6;
                    if (typeof player.velX === "number") player.velX *= 0.42;
                    if (this.boss && typeof this.boss.castFangLine === "function" && (this.comboCooldowns?.arcane || 0) <= 0) {
                        this.boss.castFangLine(player);
                        this.comboCooldowns.arcane = 90;
                        if (this.environmentController && typeof this.environmentController.triggerCombo === "function") {
                            this.environmentController.triggerCombo("sigil_fangline", 48);
                        }
                    }
                }
            }
        }
    },

    updateComboCooldowns() {
        if (!this.comboCooldowns) this.comboCooldowns = { volcanic: 0, shadow: 0, arcane: 0 };
        Object.keys(this.comboCooldowns).forEach((key) => {
            if (this.comboCooldowns[key] > 0) this.comboCooldowns[key] -= 1;
        });
    },

    update() {
        this.updateComboCooldowns();
        if (!this.active || !this.boss) {
            if (this.environmentController && typeof this.environmentController.update === "function") {
                this.environmentController.update(this);
            }
            return;
        }
        if (this.phaseFlashTimer > 0) this.phaseFlashTimer--;
        if (!this.boss.alive) {
            this.victoryTimer++;
            if (this.victoryTimer > 180) this.exit();
            return;
        }
        this.boss.update(player);
        this.clampBossToArena();
        let environmentSnapshot = null;
        if (this.environmentController && typeof this.environmentController.update === "function") {
            this.environmentController.update(this);
            if (typeof this.environmentController.getSnapshot === "function") {
                environmentSnapshot = this.environmentController.getSnapshot();
            }
        }
        this.applyEnvironmentEffects(environmentSnapshot);
    },

    renderEnvironmentOverlay(ctx) {
        if (!this.active || !this.environmentController || typeof this.environmentController.renderOverlay !== "function") return;
        this.environmentController.renderOverlay(ctx);
    },

    renderBossHpBar(ctx) {
        if (!this.active || !this.boss) return;
        const barW = Math.min(360, canvas.width * 0.6);
        const barH = 14;
        const bx = (canvas.width - barW) / 2;
        const by = 20;
        const pct = Math.max(0, this.boss.hp / this.boss.maxHp);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(bx - 4, by - 4, barW + 8, barH + 8);
        ctx.fillStyle = '#111';
        ctx.fillRect(bx, by, barW, barH);
        const hpColor = pct > 0.5 ? '#4CAF50' : pct > 0.2 ? '#FF9800' : '#F44336';
        ctx.fillStyle = hpColor;
        ctx.fillRect(bx, by, barW * pct, barH);
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, barW, barH);
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 14px Verdana';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.boss.name}（阶段${this.boss.phase}）`, canvas.width / 2, by - 6);
        const environmentSnapshot = this.environmentController && typeof this.environmentController.getSnapshot === "function"
            ? this.environmentController.getSnapshot()
            : null;
        if (environmentSnapshot && environmentSnapshot.environmentId) {
            ctx.fillStyle = 'rgba(255,255,255,0.82)';
            ctx.font = '12px Verdana';
            ctx.fillText(`环境：${environmentSnapshot.label || environmentSnapshot.environmentId}`, canvas.width / 2, by + barH + 16);
        }
        if (this.phaseFlashTimer > 0 && this.phaseBannerText) {
            const bannerAlpha = Math.min(1, this.phaseFlashTimer / 20);
            ctx.fillStyle = `rgba(255, 255, 255, ${bannerAlpha * 0.85})`;
            ctx.fillRect(canvas.width * 0.2, by + 24, canvas.width * 0.6, 28);
            ctx.fillStyle = '#111';
            ctx.font = 'bold 16px Verdana';
            ctx.fillText(this.phaseBannerText, canvas.width / 2, by + 43);
        }
        if (this.phaseFlashTimer > 0) {
            const flashAlpha = Math.min(0.35, this.phaseFlashTimer / 50);
            ctx.fillStyle = `rgba(255,255,255,${flashAlpha})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.textAlign = 'left';
    },

    renderProjectiles(ctx, camX) {
        if (!this.active || !this.boss) return;
        this.boss.bossProjectiles.forEach(p => {
            if (typeof this.boss.renderProjectile === 'function') {
                this.boss.renderProjectile(ctx, p, camX);
                return;
            }
            ctx.fillStyle = p.color || '#1A1A1A';
            ctx.beginPath();
            ctx.arc(p.x - camX, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            // 反弹火球拖尾
            if (p.reflected) {
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = '#00BFFF';
                ctx.beginPath();
                ctx.arc(p.x - camX - p.vx, p.y - p.vy, p.size * 0.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        });
    },

    renderBoss(ctx, camX) {
        if (!this.active || !this.boss) return;
        this.boss.render(ctx, camX);
    },

    triggerPhaseFlash(text) {
        this.phaseBannerText = text || '';
        this.phaseFlashTimer = 18;
    }
};

function isBossWeaponLockActive() {
    return !!(typeof bossArena !== "undefined" && bossArena && bossArena.weaponLockActive);
}
