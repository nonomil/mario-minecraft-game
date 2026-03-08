// ============ BOSS 战斗系统 ============

function isPlayerProtectedFromWitherInVillage() {
    return typeof playerInVillage !== 'undefined' && !!playerInVillage;
}

const BOSS_VISUAL_TOKENS = Object.freeze({
    blazeCoreDark: '#38210A',
    blazeCoreMid: '#5A3310',
    blazeGlowWarm: '#FFB300',
    blazeGlowHot: '#FFF59D',
    blazeRodLight: '#FFD54F',
    blazeRodMid: '#FFB300',
    blazeRodShadow: '#A85A00',
    blazeFace: '#251300',
    blazeEye: '#FFE082',
    blazeEmber: 'rgba(255, 140, 0, 0.55)',
    ashDark: 'rgba(28, 28, 28, 0.78)',
    ashLight: 'rgba(108, 108, 108, 0.48)',
    boneDark: '#1A1A1A',
    boneMid: '#343434',
    boneLight: '#565656',
    boneAsh: '#7A7A7A',
    eyeRed: '#D32F2F',
    eyeHot: '#FF6B6B',
    swordEdge: '#A8B0B8',
    swordMid: '#7E8791',
    swordGuard: '#5D646B',
    swordGrip: '#34261D'
});

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

function drawShadowEllipse(ctx, centerX, centerY, width, height, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, width / 2, height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawGlowOrb(ctx, centerX, centerY, innerRadius, outerRadius, innerColor, outerColor) {
    const gradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius);
    gradient.addColorStop(0, innerColor);
    gradient.addColorStop(1, outerColor);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
    ctx.fill();
}

function drawBlazeFigure(ctx, centerX, centerY, options = {}) {
    const size = Number(options.size) || 1;
    const timeValue = Number(options.timeValue) || (Date.now() / 220);
    const flashActive = !!options.flashActive;
    const rodCount = Math.max(6, Number(options.rodCount) || 12);
    const coreWidth = 18 * size;
    const coreHeight = 24 * size;
    const outerRadius = 24 * size;
    const innerRadius = 15 * size;
    const faceWidth = 13 * size;
    const faceHeight = 9 * size;
    const faceY = centerY - 4 * size;

    drawShadowEllipse(ctx, centerX, centerY + 24 * size, 32 * size, 8 * size, 'rgba(0, 0, 0, 0.28)');
    drawGlowOrb(
        ctx,
        centerX,
        centerY,
        3 * size,
        20 * size,
        flashActive ? '#FFFFFF' : BOSS_VISUAL_TOKENS.blazeGlowHot,
        'rgba(255, 140, 0, 0.18)'
    );

    ctx.save();
    ctx.fillStyle = BOSS_VISUAL_TOKENS.blazeCoreDark;
    ctx.fillRect(centerX - coreWidth / 2, centerY - coreHeight / 2, coreWidth, coreHeight);
    ctx.fillStyle = BOSS_VISUAL_TOKENS.blazeCoreMid;
    ctx.fillRect(centerX - coreWidth / 2 + 2 * size, centerY - coreHeight / 2 + 2 * size, coreWidth - 4 * size, coreHeight - 4 * size);
    ctx.fillStyle = BOSS_VISUAL_TOKENS.blazeFace;
    ctx.fillRect(centerX - faceWidth / 2, faceY - faceHeight / 2, faceWidth, faceHeight);
    ctx.fillStyle = BOSS_VISUAL_TOKENS.blazeEye;
    ctx.fillRect(centerX - 4 * size, faceY - 1 * size, 2 * size, 2 * size);
    ctx.fillRect(centerX + 2 * size, faceY - 1 * size, 2 * size, 2 * size);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.24)';
    ctx.fillRect(centerX - 2 * size, centerY - coreHeight / 2 + 2 * size, 4 * size, 3 * size);

    const rodsPerRing = rodCount / 2;
    for (let index = 0; index < rodCount; index++) {
        const ringIndex = index < rodsPerRing ? 0 : 1;
        const localIndex = index % rodsPerRing;
        const radius = ringIndex === 0 ? outerRadius : innerRadius;
        const rodHeight = (ringIndex === 0 ? 16 : 12) * size + (localIndex % 3) * 3 * size;
        const rodWidth = 5 * size;
        const angle = timeValue * (ringIndex === 0 ? 1.05 : -1.35) + ((Math.PI * 2) / rodsPerRing) * localIndex;
        const verticalWave = Math.sin(timeValue * 2.1 + index * 0.9) * (ringIndex === 0 ? 7 : 4) * size;
        const rodX = centerX + Math.cos(angle) * radius - rodWidth / 2;
        const rodY = centerY + Math.sin(angle * 1.2) * 8 * size + verticalWave - rodHeight / 2;
        const rodGradient = ctx.createLinearGradient(rodX, rodY, rodX, rodY + rodHeight);
        rodGradient.addColorStop(0, BOSS_VISUAL_TOKENS.blazeRodLight);
        rodGradient.addColorStop(0.55, BOSS_VISUAL_TOKENS.blazeRodMid);
        rodGradient.addColorStop(1, BOSS_VISUAL_TOKENS.blazeRodShadow);
        ctx.fillStyle = rodGradient;
        ctx.fillRect(rodX, rodY, rodWidth, rodHeight);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.fillRect(rodX + 1 * size, rodY + 1 * size, Math.max(1, 1 * size), Math.max(2, rodHeight * 0.25));
    }

    const emberCount = options.emberCount || 5;
    for (let index = 0; index < emberCount; index++) {
        const emberX = centerX + Math.sin(timeValue * 1.7 + index * 1.3) * (8 + index * 2) * size;
        const emberY = centerY + 20 * size - ((timeValue * 18 + index * 11) % (24 * size));
        ctx.fillStyle = BOSS_VISUAL_TOKENS.blazeEmber;
        ctx.fillRect(emberX, emberY, Math.max(2, 2 * size), Math.max(2, 2 * size));
    }
    ctx.restore();
}

function drawWitherSkeletonMinion(ctx, drawX, drawY, minion, facing) {
    const centerX = drawX + minion.width / 2;
    drawShadowEllipse(ctx, centerX, drawY + minion.height + 4, minion.width * 0.8, 8, 'rgba(0, 0, 0, 0.22)');
    ctx.save();
    ctx.fillStyle = BOSS_VISUAL_TOKENS.boneDark;
    ctx.fillRect(drawX + 6, drawY + 2, 12, 12);
    ctx.fillStyle = BOSS_VISUAL_TOKENS.boneMid;
    ctx.fillRect(drawX + 10, drawY + 16, 4, 16);
    for (let ribIndex = 0; ribIndex < 3; ribIndex++) {
        const ribY = drawY + 18 + ribIndex * 5;
        ctx.fillStyle = ribIndex % 2 === 0 ? BOSS_VISUAL_TOKENS.boneLight : BOSS_VISUAL_TOKENS.boneMid;
        ctx.fillRect(drawX + 6, ribY, 12, 2);
    }
    ctx.fillStyle = BOSS_VISUAL_TOKENS.boneLight;
    ctx.fillRect(drawX + 4, drawY + 16, 3, 15);
    ctx.fillRect(drawX + 17, drawY + 16, 3, 15);
    ctx.fillRect(drawX + 8, drawY + 32, 3, 14);
    ctx.fillRect(drawX + 13, drawY + 32, 3, 14);
    ctx.fillStyle = BOSS_VISUAL_TOKENS.eyeRed;
    ctx.fillRect(drawX + 8, drawY + 6, 2, 2);
    ctx.fillRect(drawX + 14, drawY + 6, 2, 2);
    const swordX = facing >= 0 ? drawX + minion.width : drawX - 4;
    ctx.fillStyle = BOSS_VISUAL_TOKENS.swordMid;
    ctx.fillRect(swordX, drawY + 18, 4, 14);
    ctx.restore();
}

// BOSS 基类
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
        this.weaponBeforeBoss = playerWeapons.current || "sword";
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
        let boss = null;
        switch (type) {
            case 'wither': boss = new WitherBoss(spawnX); break;
            case 'ghast': boss = new GhastBoss(spawnX); break;
            case 'blaze': boss = new BlazeBoss(spawnX); break;
            case 'wither_skeleton': boss = new WitherSkeletonBoss(spawnX); break;
            case 'warden': boss = (typeof WardenBoss === 'function') ? new WardenBoss(spawnX) : new WitherSkeletonBoss(spawnX); break;
            case 'evoker': boss = (typeof EvokerBoss === 'function') ? new EvokerBoss(spawnX) : new BlazeBoss(spawnX); break;
            default: boss = new WitherBoss(spawnX); break;
        }

        if (typeof dragonList !== "undefined" && Array.isArray(dragonList) && dragonList.some(entry => entry && !entry.remove)) {
            boss.maxHp = Math.round(boss.maxHp * 2);
            boss.hp = boss.maxHp;
            boss.dragonScaled = true;
        }

        return boss;
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

// 凋零 BOSS
class WitherBoss extends Boss {
    constructor(spawnX) {
        super({
            name: '凋零 Wither',
            maxHp: 30,
            color: '#1A1A1A',
            x: spawnX,
            y: 80,
            width: 96,
            height: 96,
            phaseThresholds: [0.6, 0.2],
            damage: 1
        });
        this.floatOffset = 0;
        this.moveDir = 1;
        this.moveSpeed = 1.5;
        this.charging = false;
        this.chargeTarget = null;
        this.chargeTimer = 0;
        this.startX = spawnX;
        this.shockwave = null;
    }

    updateBehavior(playerRef) {
        this.floatOffset = Math.sin(Date.now() / 420) * 8;
        // 跟随玩家水平位置
        const targetX = playerRef.x;
        if (Math.abs(this.x - targetX) > 150) {
            this.x += (targetX > this.x ? 1 : -1) * this.moveSpeed * (this.phase === 2 ? 1.5 : 1);
        }
        const baseY = canvas.height * 0.2;
        this.y += (baseY - this.y) * 0.06;
        switch (this.phase) {
            case 1: this.phaseOne(playerRef); break;
            case 2: this.phaseTwo(playerRef); break;
            case 3: this.phaseThree(playerRef); break;
        }
        this.updateShockwave();
    }

    // 阶段一：每3秒1个黑球
    phaseOne(playerRef) {
        this.setIntent('skull_shot');
        this.attackTimer++;
        if (this.attackTimer >= 180) {
            this.shootBlackBall(playerRef, 1);
            this.attackTimer = 0;
        }
    }

    // 阶段二：每2秒3个扇形黑球 + 冲刺
    phaseTwo(playerRef) {
        if (this.charging) {
            this.setIntent('charge_sweep');
            this.executeCharge(playerRef);
            return;
        }
        this.setIntent('fan_shot');
        this.attackTimer++;
        if (this.attackTimer >= 120) {
            this.shootBlackBall(playerRef, 3);
            this.attackTimer = 0;
        }
        this.chargeTimer++;
        if (this.chargeTimer >= 480) {
            this.startCharge(playerRef);
            this.chargeTimer = 0;
        }
    }

    // 阶段三：固定中央，每1秒5个追踪弹
    phaseThree(playerRef) {
        this.setIntent('tracking_barrage');
        const centerX = playerRef.x;
        this.x += (centerX - this.x) * 0.03;
        this.x += (Math.random() - 0.5) * 4;
        const frenzyY = canvas.height * 0.2 + Math.sin(Date.now() / 140) * 6;
        this.y += (frenzyY - this.y) * 0.2;
        this.attackTimer++;
        if (this.attackTimer >= 60) {
            this.shootTrackingBalls(5);
            this.attackTimer = 0;
        }
    }
// PLACEHOLDER_WITHER_METHODS

    shootBlackBall(playerRef, count) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const px = playerRef.x + playerRef.width / 2;
        const py = playerRef.y + playerRef.height / 2;
        const angle = Math.atan2(py - cy, px - cx);
        for (let i = 0; i < count; i++) {
            const spread = count > 1 ? (i - (count - 1) / 2) * 0.3 : 0;
            this.bossProjectiles.push({
                x: cx, y: cy,
                vx: Math.cos(angle + spread) * 4,
                vy: Math.sin(angle + spread) * 4,
                damage: this.phase >= 2 ? 2 : 1,
                size: 12, color: '#1A1A1A',
                tracking: false, life: 300,
                type: 'wither_orb'
            });
        }
    }

    shootTrackingBalls(count) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            this.bossProjectiles.push({
                x: cx, y: cy,
                vx: Math.cos(angle) * 3,
                vy: Math.sin(angle) * 3,
                damage: 1, size: 10, color: '#4A0080',
                tracking: true, trackDelay: 60, life: 300,
                type: 'wither_tracking_orb'
            });
        }
    }

    startCharge(playerRef) {
        this.charging = true;
        this.chargeTarget = { x: playerRef.x, y: playerRef.y };
        this.flashTimer = 30;
        showFloatingText('⚠️', this.x + this.width / 2, this.y - 20, '#FF0000');
    }

    executeCharge() {
        const dx = this.chargeTarget.x - this.x;
        const dy = this.chargeTarget.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 20) {
            this.charging = false;
            this.stunTimer = 30;
            this.shockwave = { x: this.x + this.width / 2, y: this.y + this.height / 2, radius: 12, maxRadius: 96, alpha: 0.85 };
            return;
        }
        this.x += (dx / dist) * 8;
        this.y += (dy / dist) * 8;
        // 冲刺碰撞玩家
        if (Math.abs(this.x - player.x) < this.width &&
            Math.abs(this.y - player.y) < this.height) {
            if (!isPlayerProtectedFromWitherInVillage()) {
                damagePlayer(2, this.x, 120);
            }
            this.charging = false;
            this.stunTimer = 30;
            this.shockwave = { x: this.x + this.width / 2, y: this.y + this.height / 2, radius: 12, maxRadius: 96, alpha: 0.85 };
        }
    }

    onPhaseChange(newPhase) {
        super.onPhaseChange(newPhase);
        this.attackTimer = 0;
        this.chargeTimer = 0;
        if (newPhase === 2) {
            this.color = '#8B0000';
            showToast('⚠️ 凋零进入暴怒状态!');
        } else if (newPhase === 3) {
            showToast('⚠️ 凋零进入狂暴状态!');
        }
        // 爆发粒子
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: this.x + Math.random() * this.width,
                y: this.y + Math.random() * this.height,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 1
            });
        }
    }

    updateShockwave() {
        if (!this.shockwave) return;
        this.shockwave.radius += 4;
        this.shockwave.alpha -= 0.04;
        if (this.shockwave.radius >= this.shockwave.maxRadius || this.shockwave.alpha <= 0) {
            this.shockwave = null;
        }
    }

    renderProjectile(ctx, proj, camX) {
        const px = proj.x - camX;
        const py = proj.y;
        const s = Math.max(10, proj.size || 10);
        const fillColor = proj.tracking ? '#5E3AA5' : '#1A1A1A';
        const eyeColor = proj.tracking ? '#C7A8FF' : '#666';

        ctx.fillStyle = fillColor;
        ctx.fillRect(px - s / 2, py - s / 2, s, s);
        ctx.fillStyle = eyeColor;
        ctx.fillRect(px - s * 0.22, py - s * 0.12, 3, 3);
        ctx.fillRect(px + s * 0.04, py - s * 0.12, 3, 3);

        // 拖尾
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = proj.tracking ? '#9D7BDF' : '#444';
        ctx.fillRect(px - (proj.vx || 0) * 2 - s * 0.3, py - (proj.vy || 0) * 2 - s * 0.3, s * 0.55, s * 0.55);
        ctx.globalAlpha = 0.25;
        ctx.fillRect(px - (proj.vx || 0) * 4 - s * 0.2, py - (proj.vy || 0) * 4 - s * 0.2, s * 0.4, s * 0.4);
        ctx.globalAlpha = 1;
    }

    render(ctx, camX) {
        const x = this.x - camX;
        const y = this.y + this.floatOffset;
        const bodyColor = this.flashTimer > 0 ? '#FFFFFF' : (this.phase >= 2 ? '#2A0A0A' : '#1A1A1A');
        const headColor = this.phase >= 2 ? '#3A0D0D' : '#0D0D0D';
        const eyeColor = this.phase >= 3 ? '#FF0000' : (this.phase >= 2 ? '#FF4444' : '#4488FF');

        // T 形主体
        ctx.fillStyle = bodyColor;
        ctx.fillRect(x + 36, y + 30, 24, 50);
        ctx.fillRect(x + 8, y + 32, 80, 16);
        ctx.fillStyle = '#333';
        for (let i = 0; i < 4; i++) ctx.fillRect(x + 38, y + 40 + i * 10, 20, 2);

        // 主头
        ctx.fillStyle = headColor;
        ctx.fillRect(x + 30, y, 36, 32);
        ctx.fillStyle = '#2A2A2A';
        ctx.fillRect(x + 34, y + 8, 28, 20);
        ctx.fillStyle = eyeColor;
        ctx.fillRect(x + 38, y + 12, 6, 6);
        ctx.fillRect(x + 52, y + 12, 6, 6);
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(x + 42, y + 22, 12, 4);

        // 左右副头
        ctx.fillStyle = headColor;
        ctx.fillRect(x, y + 10, 24, 22);
        ctx.fillRect(x + 72, y + 10, 24, 22);
        ctx.fillStyle = eyeColor;
        ctx.fillRect(x + 4, y + 16, 4, 4);
        ctx.fillRect(x + 14, y + 16, 4, 4);
        ctx.fillRect(x + 76, y + 16, 4, 4);
        ctx.fillRect(x + 86, y + 16, 4, 4);

        if (this.phase >= 3) {
            ctx.strokeStyle = '#FF6600';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + 40, y + 35);
            ctx.lineTo(x + 50, y + 55);
            ctx.lineTo(x + 45, y + 70);
            ctx.stroke();
        }

        if (this.shockwave) {
            ctx.strokeStyle = `rgba(100, 0, 200, ${Math.max(0, this.shockwave.alpha)})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.shockwave.x - camX, this.shockwave.y, this.shockwave.radius, 0, Math.PI * 2);
            ctx.stroke();
        }

        // 粒子
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = '#8B008B';
            ctx.fillRect(p.x - camX, p.y, 3, 3);
        });
        ctx.globalAlpha = 1;
    }
}

// 恶魂 BOSS
class GhastBoss extends Boss {
    constructor(spawnX) {
        super({
            name: '恶魂 Ghast',
            maxHp: 25,
            color: '#F0F0F0',
            x: spawnX,
            y: 80,
            width: 64,
            height: 64,
            phaseThresholds: [0.5, 0.2],
            damage: 2
        });
        this.hitCount = 0;
        this.crying = false;
        this.cryTimer = 0;
        this.moveAngle = 0;
        this.rushTimer = 0;
        this.rushing = false;
        this.rushTarget = null;
        this.startX = spawnX;
    }
// PLACEHOLDER_GHAST_PART1

    updateBehavior(playerRef) {
        // 哭泣状态更新
        if (this.crying) {
            this.setIntent('crying');
            this.cryTimer--;
            if (this.cryTimer % 10 === 0) {
                this.particles.push({
                    x: this.x + this.width / 2 + (Math.random() - 0.5) * 20,
                    y: this.y + this.height / 2,
                    vx: 0, vy: 2, life: 1.0
                });
            }
            if (this.cryTimer <= 0) this.crying = false;
            return; // 哭泣期间不攻击
        }

        // 突进逻辑
        if (this.rushing) {
            this.setIntent('rush');
            this.executeRush(playerRef);
            return;
        }

        // 8字形移动
        const speed = this.phase === 1 ? 0.02 : this.phase === 2 ? 0.03 : 0.04;
        this.moveAngle += speed;
        const rangeX = this.phase >= 3 ? 200 : 150;
        this.x = playerRef.x + Math.sin(this.moveAngle) * rangeX - this.width / 2;
        this.y = 80 + Math.sin(this.moveAngle * 2) * 60;

        // 攻击
        this.setIntent(this.phase >= 3 ? 'bombardment' : 'hover_fire');
        const interval = this.phase === 1 ? 150 : this.phase === 2 ? 90 : 60;
        this.attackTimer++;
        if (this.attackTimer >= interval) {
            const count = this.phase === 1 ? 1 : this.phase === 2 ? 2 : 3;
            this.shootFireball(playerRef, count);
            this.attackTimer = 0;
        }

        // 突进计时
        const rushInterval = this.phase >= 3 ? 360 : 600;
        this.rushTimer++;
        if (this.rushTimer >= rushInterval) {
            this.startRush(playerRef);
            this.rushTimer = 0;
        }
    }
// PLACEHOLDER_GHAST_PART2

    shootFireball(playerRef, count) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const px = playerRef.x + playerRef.width / 2;
        const py = playerRef.y + playerRef.height / 2;
        const angle = Math.atan2(py - cy, px - cx);
        for (let i = 0; i < count; i++) {
            const spread = count > 1 ? (i - (count - 1) / 2) * 0.25 : 0;
            this.bossProjectiles.push({
                x: cx, y: cy,
                vx: Math.cos(angle + spread) * 3.5,
                vy: Math.sin(angle + spread) * 3.5,
                damage: 2, size: 16,
                color: '#FF4500',
                reflectable: true,
                reflected: false,
                tracking: false, life: 300,
                type: count >= 3 ? 'ghast_fireball_volley' : 'ghast_fireball'
            });
        }
    }

    startRush(playerRef) {
        this.rushing = true;
        this.rushTarget = { x: playerRef.x, y: playerRef.y - 50 };
        this.flashTimer = 20;
        showFloatingText('⚠️', this.x + this.width / 2, this.y - 20, '#FF0000');
    }

    executeRush(playerRef) {
        const dx = this.rushTarget.x - this.x;
        const dy = this.rushTarget.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 20) {
            this.rushing = false;
            this.stunTimer = 20;
            return;
        }
        this.x += (dx / dist) * 6;
        this.y += (dy / dist) * 6;
        if (Math.abs(this.x - player.x) < this.width &&
            Math.abs(this.y - player.y) < this.height) {
            damagePlayer(2, this.x, 100);
            this.rushing = false;
            this.stunTimer = 20;
        }
    }

    takeDamage(amount) {
        super.takeDamage(amount);
        this.hitCount++;
        if (this.hitCount >= 10 && !this.crying) {
            this.crying = true;
            this.cryTimer = 300; // 5秒
            this.hitCount = 0;
            showToast('😢 恶魂进入哭泣状态!');
        }
    }

    onPhaseChange(newPhase) {
        super.onPhaseChange(newPhase);
        this.attackTimer = 0;
        this.rushTimer = 0;
        if (newPhase === 2) {
            showToast('⚠️ 恶魂变得更加狂暴!');
        } else if (newPhase === 3) {
            showToast('⚠️ 恶魂进入濒死状态!');
        }
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: this.x + Math.random() * this.width,
                y: this.y + Math.random() * this.height,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                life: 1
            });
        }
    }
// PLACEHOLDER_GHAST_RENDER

    renderProjectile(ctx, proj, camX) {
        const x = proj.x - camX;
        const y = proj.y;
        const r = Math.max(8, proj.size || 10);
        const grad = ctx.createRadialGradient(x, y, 2, x, y, r);
        grad.addColorStop(0, '#FFE0B2');
        grad.addColorStop(1, '#E65100');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#FF8A65';
        ctx.beginPath();
        ctx.arc(x - (proj.vx || 0) * 2, y - (proj.vy || 0) * 2, r * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    render(ctx, camX) {
        const drawX = this.x - camX;
        const drawY = this.y;
        const attacking = this.rushing || this.attackTimer > 0 && this.attackTimer < 18;
        ctx.globalAlpha = this.crying ? 0.6 : 0.95;
        ctx.fillStyle = this.flashTimer > 0 ? '#FFFFFF' : '#F0F0F0';
        ctx.fillRect(drawX, drawY, this.width, this.height);

        // 面部
        const eyeY = drawY + 20;
        if (this.crying) {
            ctx.fillStyle = '#4FC3F7';
            ctx.fillRect(drawX + 16, eyeY + 4, 8, 4);
            ctx.fillRect(drawX + 40, eyeY + 4, 8, 4);
            ctx.fillStyle = '#1A1A1A';
            ctx.fillRect(drawX + 22, drawY + 42, 20, 4);
        } else if (attacking) {
            ctx.fillStyle = '#C62828';
            ctx.fillRect(drawX + 14, eyeY, 10, 10);
            ctx.fillRect(drawX + 40, eyeY, 10, 10);
            ctx.fillStyle = '#D84315';
            ctx.fillRect(drawX + 20, drawY + 40, 24, 12);
        } else {
            ctx.fillStyle = '#212121';
            ctx.fillRect(drawX + 16, eyeY + 6, 8, 3);
            ctx.fillRect(drawX + 40, eyeY + 6, 8, 3);
            ctx.fillStyle = '#333';
            ctx.fillRect(drawX + 22, drawY + 40, 20, 8);
        }

        // 9 条触手
        ctx.fillStyle = '#DDD';
        for (let i = 0; i < 9; i++) {
            const tx = drawX + 4 + i * 7;
            const baseLen = 12 + (i % 3) * 5;
            const sway = Math.sin(Date.now() / 240 + i * 0.7) * 3;
            ctx.fillRect(tx + sway, drawY + this.height, 4, baseLen);
        }
        ctx.globalAlpha = 1;
        // 哭泣泪水粒子
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = this.crying ? '#4FC3F7' : '#FF8A65';
            ctx.fillRect(p.x - camX, p.y, 3, 3);
        });
        ctx.globalAlpha = 1;
    }
}

// 烈焰人 BOSS
class BlazeBoss extends Boss {
    constructor(spawnX) {
        super({
            id: 'blaze',
            visualKey: 'blaze_v2',
            name: '烈焰人 Blaze',
            maxHp: 28,
            color: '#FFD700',
            x: spawnX,
            y: 100,
            width: 48,
            height: 64,
            phaseThresholds: [0.7, 0.5],
            damage: 1
        });
        this.rotationAngle = 0;
        this.floatY = 100;
        this.floatDir = 1;
        this.fireColumns = [];
        this.minions = [];
        this.minionsSummoned = false;
        this.burstQueue = [];
        this.burstTimer = 0;
        this.fireColumnTimer = 0;
        this.ringCooldown = 180;
    }

    updateBehavior(playerRef) {
        this.updateFloat();
        const hasFlameRing = this.bossProjectiles.some((projectile) => projectile && projectile.type === 'blaze_ring_orb' && (projectile.life || 0) > 0);
        this.setIntent(hasFlameRing ? 'flame_ring' : (this.phase >= 3 ? 'ember_pressure' : 'fireburst'));
        this.updateBurstQueue(playerRef);
        this.updateFireColumns(playerRef);
        this.updateMinions(playerRef);

        // 三连火球（始终激活）
        const burstInterval = this.phase === 1 ? 240 : this.phase === 2 ? 180 : 120;
        this.attackTimer++;
        if (this.attackTimer >= burstInterval) {
            this.fireballBurst(playerRef, 3, 18);
            this.attackTimer = 0;
        }

        // 火焰旋风（阶段2+）
        if (this.phase >= 2) {
            this.fireColumnTimer++;
            if (this.fireColumnTimer >= 600) {
                this.spawnFireColumns();
                this.fireColumnTimer = 0;
            }
        }

        // 召唤小烈焰人（阶段3，仅一次）
        if (this.phase >= 3 && !this.minionsSummoned) {
            this.summonMinions();
        }
        if (this.phase >= 3) {
            this.ringCooldown--;
            if (this.ringCooldown <= 0) {
                this.castFlameRing();
                this.ringCooldown = 240;
            }
        }
    }

    castFlameRing() {
        this.setIntent('flame_ring');
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const count = 8;
        for (let index = 0; index < count; index++) {
            const angle = (Math.PI * 2 / count) * index;
            this.bossProjectiles.push({
                x: cx, y: cy,
                vx: Math.cos(angle) * 3.2,
                vy: Math.sin(angle) * 3.2,
                damage: 1, size: 9,
                color: '#FFB300',
                tracking: false, life: 90,
                type: 'blaze_ring_orb'
            });
        }
        showFloatingText('🔥 火焰环!', cx, this.y - 20, '#FFB300');
    }
// PLACEHOLDER_BLAZE_CONTINUE

    updateFloat() {
        this.floatY += this.floatDir * 0.5;
        if (this.floatY <= 60 || this.floatY >= 180) this.floatDir *= -1;
        this.y = this.floatY;
        // 水平缓慢追踪玩家
        const dx = player.x - this.x;
        this.x += Math.sign(dx) * 0.5;
    }

    fireballBurst(playerRef, count, interval) {
        for (let i = 0; i < count; i++) {
            this.burstQueue.push({ delay: i * interval, playerRef });
        }
    }

    updateBurstQueue(playerRef) {
        if (this.burstQueue.length === 0) return;
        this.burstTimer++;
        while (this.burstQueue.length > 0 && this.burstTimer >= this.burstQueue[0].delay) {
            const burst = this.burstQueue.shift();
            const cx = this.x + this.width / 2;
            const cy = this.y + this.height / 2;
            const px = player.x + player.width / 2;
            const py = player.y + player.height / 2;
            const angle = Math.atan2(py - cy, px - cx);
            this.bossProjectiles.push({
                x: cx, y: cy,
                vx: Math.cos(angle) * 4,
                vy: Math.sin(angle) * 4,
                damage: 1, size: 10,
                color: '#FF4500',
                tracking: false, life: 300,
                type: 'blaze_fireball'
            });
        }
        if (this.burstQueue.length === 0) this.burstTimer = 0;
    }

    spawnFireColumns() {
        for (let i = 0; i < 3; i++) {
            this.fireColumns.push({
                x: player.x + (Math.random() - 0.5) * 300,
                y: groundY,
                width: 20, height: 60,
                life: 480,
                trackSpeed: 0.8,
                dmgTimer: 0
            });
        }
        showFloatingText('🔥 火焰旋风!', this.x + this.width / 2, this.y - 20, '#FF4500');
    }
// PLACEHOLDER_BLAZE_CONTINUE2

    updateFireColumns(playerRef) {
        for (let i = this.fireColumns.length - 1; i >= 0; i--) {
            const col = this.fireColumns[i];
            const dx = player.x - col.x;
            col.x += Math.sign(dx) * col.trackSpeed;
            col.life--;
            col.dmgTimer++;
            // 每秒1心伤害
            if (col.dmgTimer >= 60) {
                col.dmgTimer = 0;
                if (Math.abs(player.x + player.width / 2 - col.x - col.width / 2) < col.width / 2 + player.width / 2 &&
                    player.y + player.height > col.y - col.height && player.y < col.y) {
                    damagePlayer(1, col.x);
                }
            }
            if (col.life <= 0) this.fireColumns.splice(i, 1);
        }
    }

    summonMinions() {
        this.minionsSummoned = true;
        for (let i = 0; i < 2; i++) {
            this.minions.push({
                x: this.x + (i === 0 ? -80 : 80),
                y: this.y,
                type: "blaze_mini",
                hp: 2, maxHp: 2,
                width: 20, height: 20,
                speed: 2.5,
                attackTimer: 0,
                alive: true
            });
        }
        showFloatingText('🔥 召唤小烈焰人!', this.x + this.width / 2, this.y - 20, '#FF4500');
    }

    updateMinions(playerRef) {
        this.minions.forEach(m => {
            if (!m.alive) return;
            const dx = player.x - m.x;
            m.x += Math.sign(dx) * m.speed;
            // 浮空
            m.y = this.floatY + 30;
            m.attackTimer++;
            if (m.attackTimer >= 180) {
                this.bossProjectiles.push({
                    x: m.x + m.width / 2, y: m.y + m.height / 2,
                    vx: Math.sign(dx) * 3, vy: 0,
                    damage: 1, size: 8, color: '#FF6600',
                    tracking: false, life: 300
                });
                m.attackTimer = 0;
            }
        });
    }
// PLACEHOLDER_BLAZE_CONTINUE3

    // 小烈焰人受伤（近战攻击检测）
    damageMinionAt(ax, ay, range, damage) {
        this.minions.forEach(m => {
            if (!m.alive) return;
            if (Math.abs(ax - m.x - m.width / 2) < range + m.width / 2 &&
                Math.abs(ay - m.y - m.height / 2) < range + m.height / 2) {
                m.hp -= damage;
                showFloatingText(`-${damage}`, m.x + m.width / 2, m.y - 10, '#FF4444');
                if (m.hp <= 0) {
                    m.alive = false;
                    showFloatingText('💀', m.x + m.width / 2, m.y - 20, '#FFD700');
                }
            }
        });
    }

    // 小怪存活时BOSS防御+50%
    takeDamage(amount) {
        const aliveMinions = this.minions.filter(m => m.alive).length;
        if (aliveMinions > 0) amount = Math.ceil(amount * 0.5);
        super.takeDamage(amount);
    }

    onPhaseChange(newPhase) {
        super.onPhaseChange(newPhase);
        this.attackTimer = 0;
        this.fireColumnTimer = 0;
        if (newPhase === 2) {
            showToast('⚠️ 烈焰人释放火焰旋风!');
        } else if (newPhase === 3) {
            showToast('⚠️ 烈焰人召唤援军!');
        }
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: this.x + Math.random() * this.width,
                y: this.y + Math.random() * this.height,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 1
            });
        }
    }

    render(ctx, camX) {
        const drawX = this.x - camX;
        const drawY = this.y;
        const centerX = drawX + this.width / 2;
        const centerY = drawY + this.height / 2;
        const timeValue = Date.now() / 220;
        const rotationSpeed = this.phase >= 3 ? 0.15 : this.phase === 2 ? 0.11 : 0.08;
        this.rotationAngle += rotationSpeed;

        drawBlazeFigure(ctx, centerX, centerY, {
            size: 1,
            timeValue: this.rotationAngle + timeValue,
            flashActive: this.flashTimer > 0,
            rodCount: this.phase >= 3 ? 12 : 10,
            emberCount: this.phase >= 2 ? 6 : 4
        });

        this.fireColumns.forEach((column) => {
            const columnX = column.x - camX;
            const alpha = column.life > 60 ? 0.8 : (column.life / 60) * 0.8;
            const glowGradient = ctx.createLinearGradient(columnX, column.y, columnX, column.y - column.height);
            glowGradient.addColorStop(0, `rgba(255, 111, 0, ${alpha})`);
            glowGradient.addColorStop(0.55, `rgba(255, 196, 0, ${alpha * 0.9})`);
            glowGradient.addColorStop(1, `rgba(255, 245, 157, ${alpha * 0.72})`);
            ctx.fillStyle = glowGradient;
            ctx.fillRect(columnX, column.y - column.height, column.width, column.height);
            ctx.fillStyle = `rgba(255, 245, 157, ${alpha * 0.8})`;
            ctx.fillRect(columnX - 2, column.y - column.height - 8, column.width + 4, 8);
        });

        this.minions.forEach((minion, index) => {
            if (!minion.alive) return;
            const bobOffset = Math.sin(timeValue * 2 + index * 0.9) * 3;
            minion.y = this.floatY + 24 + bobOffset;
            const minionDrawX = minion.x - camX;
            if (minion.type === 'blaze_mini') {
                drawBlazeFigure(ctx, minionDrawX + minion.width / 2, minion.y + minion.height / 2, {
                    size: 0.42,
                    timeValue: this.rotationAngle + index,
                    flashActive: false,
                    rodCount: 6,
                    emberCount: 3
                });
            } else {
                ctx.fillStyle = '#FF8C00';
                ctx.fillRect(minionDrawX, minion.y, minion.width, minion.height);
            }
            const hpPercent = minion.hp / minion.maxHp;
            ctx.fillStyle = '#F44336';
            ctx.fillRect(minionDrawX, minion.y - 6, minion.width * hpPercent, 3);
        });

        this.particles.forEach((particle) => {
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = '#FF6600';
            ctx.fillRect(particle.x - camX, particle.y, 3, 3);
        });
        ctx.globalAlpha = 1;
    }
}

// 凋零骷髅 BOSS
class WitherSkeletonBoss extends Boss {
    constructor(spawnX) {
        super({
            id: 'wither_skeleton',
            visualKey: 'wither_skeleton_v2',
            name: '凋零骷髅 Wither Skeleton',
            maxHp: 40,
            color: '#1A1A1A',
            x: spawnX,
            y: groundY - 96,
            width: 48,
            height: 96,
            phaseThresholds: [0.6, 0.3],
            damage: 1
        });
        this.grounded = true;
        this.moveSpeed = 2.0;
        this.facing = -1;
        this.state = 'patrol';
        this.comboStep = 0;
        this.comboTimer = 0;
        this.blockTimer = 0;
        this.blockHits = 0;
        this.jumpAttackPhase = 0;
        this.minions = [];
        this.minionsSummoned = false;
        this.vy = 0;
        this.gravity = 0.5;
        this.actionCooldown = 0;
        this.boneWallCooldown = 150;
    }

    updateBehavior(playerRef) {
        this.facing = playerRef.x > this.x ? 1 : -1;
        const dist = Math.abs(playerRef.x - this.x);
        const hasBoneWall = this.bossProjectiles.some((projectile) => projectile && projectile.type === 'bone_wall_shard' && (projectile.life || 0) > 0);
        this.setIntent(hasBoneWall ? 'bone_wall' : (this.phase >= 3 ? 'bone_pressure' : this.state || 'patrol'));

        // 重力
        if (this.y < groundY - this.height) {
            this.vy += this.gravity;
            this.y += this.vy;
            if (this.y >= groundY - this.height) {
                this.y = groundY - this.height;
                this.vy = 0;
            }
        }

        if (this.actionCooldown > 0) this.actionCooldown--;

        switch (this.state) {
            case 'patrol':
                this.x += this.facing * this.moveSpeed * (this.phase >= 2 ? 1.3 : 1);
                if (dist < 64 && this.actionCooldown <= 0) {
                    this.startCombo();
                } else if (dist > 96 && this.actionCooldown <= 0 && Math.random() < 0.01) {
                    this.startJumpAttack();
                }
                if (this.actionCooldown <= 0 && Math.random() < 0.003) {
                    this.startBlocking();
                }
                break;
            case 'combo': this.updateCombo(); break;
            case 'jump_attack': this.updateJumpAttack(); break;
            case 'blocking': this.updateBlocking(); break;
            case 'stunned':
                this.stunTimer--;
                if (this.stunTimer <= 0) { this.state = 'patrol'; this.actionCooldown = 60; }
                break;
            case 'summoning':
                this.comboTimer++;
                if (this.comboTimer >= 60) { this.state = 'patrol'; this.actionCooldown = 60; }
                break;
        }

        if (this.hp / this.maxHp < 0.3) this.summonMinions();
        if (this.phase >= 3) {
            this.boneWallCooldown--;
            if (this.boneWallCooldown <= 0 && this.state === 'patrol') {
                this.raiseBoneWall();
                this.boneWallCooldown = 220;
            }
        }
        this.updateMinions();
    }

    raiseBoneWall() {
        this.setIntent('bone_wall');
        const centerX = this.x + this.width / 2 + this.facing * 48;
        const shardCount = 5;
        for (let index = 0; index < shardCount; index++) {
            this.bossProjectiles.push({
                x: centerX + (index - 2) * 16,
                y: groundY - 16 - index * 8,
                vx: this.facing * 0.8,
                vy: -0.2,
                damage: 1, size: 8,
                color: '#9E9E9E',
                tracking: false, life: 80,
                type: 'bone_wall_shard'
            });
        }
        this.actionCooldown = Math.max(this.actionCooldown, 50);
        showFloatingText('💀 骨墙!', centerX, this.y - 24, '#BDBDBD');
    }
// PLACEHOLDER_WSKEL_CONTINUE

    startCombo() {
        this.state = 'combo';
        this.comboStep = 0;
        this.comboTimer = 0;
    }

    updateCombo() {
        this.comboTimer++;
        const stepDuration = 30;
        if (this.comboTimer >= stepDuration) {
            this.comboTimer = 0;
            this.executeComboStep(this.comboStep);
            this.comboStep++;
            if (this.comboStep >= 3) {
                this.state = 'patrol';
                this.comboStep = 0;
                this.actionCooldown = 60;
            }
        }
    }

    executeComboStep(step) {
        const range = 60;
        const playerDist = Math.abs(player.x - this.x);
        switch (step) {
            case 0: // 横扫
                if (playerDist < range + 20) {
                    damagePlayer(1, this.x);
                    showFloatingText('横扫!', this.x + this.width / 2, this.y - 20, '#FF4444');
                }
                break;
            case 1: // 下劈
                if (playerDist < range) {
                    damagePlayer(2, this.x);
                    showFloatingText('下劈!', this.x + this.width / 2, this.y - 20, '#FF0000');
                }
                break;
            case 2: // 突刺+击退
                if (playerDist < range + 10) {
                    damagePlayer(1, this.x, 150);
                    showFloatingText('突刺!', this.x + this.width / 2, this.y - 20, '#FF6600');
                }
                break;
        }
    }

    startJumpAttack() {
        this.state = 'jump_attack';
        this.jumpAttackPhase = 1;
        this.comboTimer = 0;
        showFloatingText('⚠️', this.x + this.width / 2, this.y - 20, '#FF0000');
    }
// PLACEHOLDER_WSKEL_CONTINUE2

    updateJumpAttack() {
        switch (this.jumpAttackPhase) {
            case 1: // 蓄力
                this.comboTimer++;
                if (this.comboTimer >= 30) {
                    this.jumpAttackPhase = 2;
                    this.vy = -12;
                    this.facing = player.x > this.x ? 1 : -1;
                }
                break;
            case 2: // 跃起+下落
                this.vy += this.gravity;
                this.y += this.vy;
                this.x += this.facing * 3;
                if (this.y >= groundY - this.height) {
                    this.y = groundY - this.height;
                    this.vy = 0;
                    this.jumpAttackPhase = 3;
                    this.comboTimer = 0;
                    this.jumpAttackLand();
                }
                break;
            case 3: // 着地硬直
                this.comboTimer++;
                if (this.comboTimer >= 30) {
                    this.state = 'patrol';
                    this.jumpAttackPhase = 0;
                    this.actionCooldown = 60;
                }
                break;
        }
    }

    jumpAttackLand() {
        const aoeRange = 64;
        const dist = Math.abs(player.x - this.x);
        if (dist < aoeRange) {
            damagePlayer(2, this.x, 120);
            showFloatingText('💥 跳劈!', this.x + this.width / 2, this.y - 30, '#FF0000');
        }
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: this.x + (Math.random() - 0.5) * aoeRange * 2,
                y: groundY,
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 4,
                life: 1.0
            });
        }
    }

    startBlocking() {
        this.state = 'blocking';
        this.blockTimer = 180;
        this.blockHits = 0;
    }

    updateBlocking() {
        this.blockTimer--;
        if (this.blockTimer <= 0) {
            this.state = 'patrol';
            this.actionCooldown = 60;
        }
    }
// PLACEHOLDER_WSKEL_CONTINUE3

    takeDamage(amount) {
        if (this.state === 'blocking') {
            this.blockHits++;
            showFloatingText('格挡!', this.x + this.width / 2, this.y - 20, '#AAAAAA');
            if (this.blockHits >= 7) {
                this.state = 'stunned';
                this.stunTimer = 180;
                showFloatingText('⭐ 破防!', this.x + this.width / 2, this.y - 30, '#FFD700');
            }
            return;
        }
        if (this.state === 'stunned') amount = Math.ceil(amount * 1.5);
        super.takeDamage(amount);
    }

    summonMinions() {
        if (this.minionsSummoned) return;
        this.minionsSummoned = true;
        this.state = 'summoning';
        this.comboTimer = 0;
        for (let i = 0; i < 4; i++) {
            this.minions.push({
                x: this.x + (i - 1.5) * 50,
                y: groundY - 48,
                hp: 5, maxHp: 5,
                width: 24, height: 48,
                speed: 2.0,
                attackTimer: 0,
                alive: true
            });
        }
        showFloatingText('💀 召唤骷髅小兵!', this.x + this.width / 2, this.y - 30, '#666');
    }

    updateMinions() {
        this.minions.forEach(m => {
            if (!m.alive) return;
            const dx = player.x - m.x;
            m.x += Math.sign(dx) * m.speed;
            m.attackTimer++;
            if (m.attackTimer >= 120 && Math.abs(player.x - m.x) < 40) {
                damagePlayer(1, m.x);
                m.attackTimer = 0;
                showFloatingText('💀', m.x, m.y - 10, '#666');
            }
        });
    }

    damageMinionAt(ax, ay, range, damage) {
        this.minions.forEach(m => {
            if (!m.alive) return;
            if (Math.abs(ax - m.x - m.width / 2) < range + m.width / 2 &&
                Math.abs(ay - m.y - m.height / 2) < range + m.height / 2) {
                m.hp -= damage;
                showFloatingText(`-${damage}`, m.x + m.width / 2, m.y - 10, '#FF4444');
                if (m.hp <= 0) {
                    m.alive = false;
                    showFloatingText('💀', m.x + m.width / 2, m.y - 20, '#FFD700');
                }
            }
        });
    }
// PLACEHOLDER_WSKEL_CONTINUE4

    onPhaseChange(newPhase) {
        super.onPhaseChange(newPhase);
        this.actionCooldown = 0;
        if (newPhase === 2) {
            this.moveSpeed = 2.6;
            showToast('⚠️ 凋零骷髅变得更加凶猛!');
        } else if (newPhase === 3) {
            this.moveSpeed = 3.0;
            showToast('⚠️ 凋零骷髅进入狂暴状态!');
        }
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: this.x + Math.random() * this.width,
                y: this.y + Math.random() * this.height,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 1
            });
        }
    }

    render(ctx, camX) {
        const drawX = this.x - camX;
        const drawY = this.y;
        const squat = this.jumpAttackPhase === 1 ? 0.85 : 1;
        const swing = this.state === 'combo' ? Math.sin(Date.now() / 90) * 10 : 0;
        const bodyOffsetY = this.height * (1 - squat);
        const skullY = drawY - 6 + bodyOffsetY;
        const torsoY = drawY + 22 + bodyOffsetY;
        const pelvisY = drawY + 66 + bodyOffsetY;
        const eyeColor = this.phase >= 3 ? BOSS_VISUAL_TOKENS.eyeHot : BOSS_VISUAL_TOKENS.eyeRed;

        drawShadowEllipse(ctx, drawX + this.width / 2, drawY + this.height + 6, 46, 10, 'rgba(0, 0, 0, 0.26)');

        ctx.save();
        ctx.fillStyle = this.flashTimer > 0 ? '#FFFFFF' : BOSS_VISUAL_TOKENS.boneDark;
        ctx.fillRect(drawX + 8, skullY, 32, 22);
        ctx.fillStyle = BOSS_VISUAL_TOKENS.boneMid;
        ctx.fillRect(drawX + 10, skullY + 4, 28, 15);
        ctx.fillStyle = BOSS_VISUAL_TOKENS.boneLight;
        ctx.fillRect(drawX + 12, skullY + 18, 24, 5);
        ctx.fillStyle = BOSS_VISUAL_TOKENS.boneAsh;
        ctx.fillRect(drawX + 16, skullY + 22, 16, 4);
        ctx.fillStyle = eyeColor;
        ctx.fillRect(drawX + 15, skullY + 7, 5, 4);
        ctx.fillRect(drawX + 28, skullY + 7, 5, 4);

        ctx.fillStyle = BOSS_VISUAL_TOKENS.boneMid;
        ctx.fillRect(drawX + 22, torsoY - 6, 4, 44 * squat);
        for (let ribIndex = 0; ribIndex < 5; ribIndex++) {
            const ribY = torsoY + ribIndex * 7;
            const ribWidth = 20 - ribIndex;
            ctx.fillStyle = ribIndex % 2 === 0 ? BOSS_VISUAL_TOKENS.boneLight : BOSS_VISUAL_TOKENS.boneMid;
            ctx.fillRect(drawX + 14, ribY, ribWidth, 3);
        }
        ctx.fillStyle = BOSS_VISUAL_TOKENS.boneDark;
        ctx.fillRect(drawX + 16, pelvisY, 16, 6 * squat);

        const armBaseY = torsoY + 6;
        const legBaseY = pelvisY + 6;
        ctx.fillStyle = BOSS_VISUAL_TOKENS.boneLight;
        ctx.fillRect(drawX + 10, armBaseY, 4, 24 * squat);
        ctx.fillRect(drawX + 34, armBaseY, 4, 24 * squat);
        ctx.fillRect(drawX + 8, armBaseY + 20, 4, 16 * squat);
        ctx.fillRect(drawX + 36, armBaseY + 20, 4, 16 * squat);
        ctx.fillRect(drawX + 16, legBaseY, 4, 26 * squat);
        ctx.fillRect(drawX + 28, legBaseY, 4, 26 * squat);
        ctx.fillRect(drawX + 14, legBaseY + 24, 4, 18 * squat);
        ctx.fillRect(drawX + 30, legBaseY + 24, 4, 18 * squat);

        const swordX = this.facing > 0 ? drawX + this.width + 2 : drawX - 12;
        const bladeY = drawY + 14 + swing;
        ctx.fillStyle = BOSS_VISUAL_TOKENS.swordMid;
        ctx.fillRect(swordX, bladeY, 7, 44);
        ctx.fillStyle = BOSS_VISUAL_TOKENS.swordEdge;
        ctx.fillRect(swordX + 1, bladeY + 2, 2, 36);
        ctx.fillStyle = BOSS_VISUAL_TOKENS.swordGuard;
        ctx.fillRect(swordX - 4, bladeY + 42, 15, 5);
        ctx.fillStyle = BOSS_VISUAL_TOKENS.swordGrip;
        ctx.fillRect(swordX + 2, bladeY + 47, 3, 12);

        for (let ashIndex = 0; ashIndex < 5; ashIndex++) {
            const ashX = drawX + 10 + ((Date.now() / 11 + ashIndex * 19) % 28);
            const ashY = drawY + ((Date.now() / 24 + ashIndex * 17) % this.height);
            ctx.fillStyle = ashIndex % 2 === 0 ? BOSS_VISUAL_TOKENS.ashDark : BOSS_VISUAL_TOKENS.ashLight;
            ctx.fillRect(ashX, ashY, 2, 2);
        }
        ctx.restore();

        if (this.state === 'blocking') {
            ctx.strokeStyle = 'rgba(66, 165, 245, 0.75)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(drawX + this.width / 2, drawY + this.height / 2, 50, 0, Math.PI * 2);
            ctx.stroke();
        }

        if (this.state === 'stunned') {
            for (let starIndex = 0; starIndex < 3; starIndex++) {
                const starX = drawX + 10 + starIndex * 14 + Math.sin(Date.now() / 200 + starIndex) * 5;
                ctx.fillStyle = '#FFD700';
                ctx.font = '14px Arial';
                ctx.fillText('*', starX, drawY - 20);
            }
        }

        this.minions.forEach((minion) => {
            if (!minion.alive) return;
            const minionDrawX = minion.x - camX;
            drawWitherSkeletonMinion(ctx, minionDrawX, minion.y, minion, this.facing);
            ctx.fillStyle = '#F44336';
            ctx.fillRect(minionDrawX, minion.y - 5, minion.width * (minion.hp / minion.maxHp), 3);
        });

        this.particles.forEach((particle) => {
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = '#666';
            ctx.fillRect(particle.x - camX, particle.y, 3, 3);
        });
        ctx.globalAlpha = 1;
    }
}


class WardenBoss extends Boss {
    constructor(spawnX) {
        super({
            id: 'warden',
            visualKey: 'warden_v1',
            name: '监守者 Warden',
            maxHp: 52,
            color: '#163E42',
            x: spawnX,
            y: groundY - 116,
            width: 72,
            height: 116,
            phaseThresholds: [0.65, 0.35],
            damage: 2
        });
        this.grounded = true;
        this.moveSpeed = 1.3;
        this.facing = -1;
        this.state = 'stalk';
        this.actionCooldown = 0;
        this.slamTimer = 0;
        this.sonicTimer = 180;
        this.chestPulse = 0;
        this.darkPulseCooldown = 150;
    }

    updateBehavior(playerRef) {
        this.facing = playerRef.x > this.x ? 1 : -1;
        const hasDarkPulse = this.bossProjectiles.some((projectile) => projectile && projectile.type === 'warden_dark_pulse' && (projectile.life || 0) > 0);
        this.setIntent(hasDarkPulse ? 'dark_pulse' : (this.state || 'stalk'));
        this.chestPulse += this.phase >= 3 ? 0.18 : this.phase === 2 ? 0.14 : 0.1;
        if (this.actionCooldown > 0) this.actionCooldown--;
        this.sonicTimer++;

        switch (this.state) {
            case 'slam_charge':
                this.slamTimer--;
                if (this.slamTimer <= 0) {
                    this.releaseGroundSlam(playerRef);
                    this.state = 'slam_recover';
                    this.slamTimer = this.phase >= 3 ? 20 : 28;
                }
                return;
            case 'slam_recover':
                this.slamTimer--;
                if (this.slamTimer <= 0) this.state = 'stalk';
                return;
            case 'sonic_cast':
                this.slamTimer--;
                if (this.slamTimer === 12) this.fireSonicPulse();
                if (this.slamTimer <= 0) this.state = 'stalk';
                return;
            default:
                break;
        }

        const distance = Math.abs(playerRef.x - this.x);
        const speedScale = this.phase >= 3 ? 1.28 : this.phase === 2 ? 1.14 : 1;
        this.x += Math.sign(playerRef.x - this.x) * this.moveSpeed * speedScale;

        if (distance < 116 && this.actionCooldown <= 0) {
            this.startGroundSlam();
            return;
        }
        if (this.phase >= 2 && distance >= 116 && this.actionCooldown <= 0 && this.sonicTimer >= 180) {
            this.startSonicCast();
        }
        if (this.phase >= 3) {
            this.darkPulseCooldown--;
            if (this.darkPulseCooldown <= 0 && this.actionCooldown <= 0) {
                this.emitDarkPulse();
                this.darkPulseCooldown = 220;
                this.actionCooldown = 50;
            }
        }
    }

    startGroundSlam() {
        this.state = 'slam_charge';
        this.slamTimer = this.phase >= 3 ? 18 : 28;
        this.actionCooldown = 100;
        showFloatingText('⚡', this.x + this.width / 2, this.y - 24, '#80DEEA');
    }

    releaseGroundSlam(playerRef) {
        const impactCenterX = this.x + this.width / 2;
        const distance = Math.abs(playerRef.x + playerRef.width / 2 - impactCenterX);
        if (distance < 100) damagePlayer(this.phase >= 3 ? 3 : 2, this.x, 180);
        for (const direction of [-1, 1]) {
            this.bossProjectiles.push({
                x: impactCenterX,
                y: groundY - 18,
                vx: direction * (this.phase >= 3 ? 4.8 : 3.8),
                vy: 0,
                damage: 1,
                size: 14,
                color: '#5ED8D8',
                tracking: false,
                life: 60,
                type: 'warden_shockwave'
            });
        }
        for (let index = 0; index < 14; index++) {
            this.particles.push({
                x: impactCenterX + (Math.random() - 0.5) * 80,
                y: groundY - 4,
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 3.5,
                life: 1
            });
        }
        showFloatingText('💥 震地!', impactCenterX, this.y - 28, '#80DEEA');
    }

    startSonicCast() {
        this.state = 'sonic_cast';
        this.slamTimer = 26;
        this.actionCooldown = 140;
        this.sonicTimer = 0;
        showFloatingText(')))', this.x + this.width / 2, this.y - 28, '#B2FFFA');
    }

    fireSonicPulse() {
        this.bossProjectiles.push({
            x: this.x + this.width / 2,
            y: this.y + 42,
            vx: this.facing * (this.phase >= 3 ? 5.8 : 4.8),
            vy: 0,
            damage: this.phase >= 3 ? 2 : 1,
            size: 18,
            color: '#B2FFFA',
            tracking: false,
            life: 90,
            type: 'warden_sonic'
        });
    }

    emitDarkPulse() {
        this.setIntent('dark_pulse');
        const centerX = this.x + this.width / 2;
        const centerY = this.y + 42;
        for (const direction of [-1, 1]) {
            this.bossProjectiles.push({
                x: centerX,
                y: centerY,
                vx: direction * 2.2,
                vy: 0,
                damage: 1,
                size: 22,
                color: '#4DD0E1',
                tracking: false,
                life: 55,
                type: 'warden_dark_pulse'
            });
        }
        showFloatingText('🌀 暗脉冲!', centerX, this.y - 28, '#80DEEA');
    }

    renderProjectile(ctx, projectile, camX) {
        const drawX = projectile.x - camX;
        if (projectile.type === 'warden_shockwave') {
            ctx.fillStyle = 'rgba(94, 216, 216, 0.85)';
            ctx.fillRect(drawX - projectile.size, projectile.y - 6, projectile.size * 2, 12);
            ctx.fillStyle = 'rgba(178, 255, 250, 0.65)';
            ctx.fillRect(drawX - projectile.size * 0.4, projectile.y - 4, projectile.size * 0.8, 8);
            return;
        }
        if (projectile.type === 'warden_sonic') {
            ctx.strokeStyle = 'rgba(178, 255, 250, 0.9)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(drawX, projectile.y, projectile.size, 0, Math.PI * 2);
            ctx.stroke();
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(drawX, projectile.y, projectile.size * 0.55, 0, Math.PI * 2);
            ctx.stroke();
            return;
        }
        if (projectile.type === 'warden_dark_pulse') {
            ctx.strokeStyle = 'rgba(77, 208, 225, 0.8)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(drawX, projectile.y, projectile.size, 0, Math.PI * 2);
            ctx.stroke();
            return;
        }
    }

    onPhaseChange(newPhase) {
        super.onPhaseChange(newPhase);
        this.actionCooldown = 0;
        if (newPhase === 2) {
            showToast('⚠️ 监守者释放音波!');
        } else if (newPhase === 3) {
            showToast('⚠️ 监守者进入狂暴!');
        }
    }

    render(ctx, camX) {
        const drawX = this.x - camX;
        const drawY = this.y;
        const chestGlow = 0.55 + Math.sin(this.chestPulse) * 0.2;
        const armLift = this.state === 'slam_charge' ? -10 : 0;
        const bodyColor = this.flashTimer > 0 ? '#D7FFFA' : '#163E42';

        drawShadowEllipse(ctx, drawX + this.width / 2, drawY + this.height + 6, 56, 12, 'rgba(0, 0, 0, 0.32)');
        ctx.save();
        ctx.fillStyle = bodyColor;
        ctx.fillRect(drawX + 16, drawY + 8, 40, 62);
        ctx.fillStyle = '#214E53';
        ctx.fillRect(drawX + 10, drawY + 18, 52, 24);
        ctx.fillRect(drawX + 20, drawY + 66, 32, 18);
        ctx.fillStyle = '#2E666B';
        ctx.fillRect(drawX + 22, drawY + 0, 28, 18);

        ctx.fillStyle = '#88FFF4';
        ctx.fillRect(drawX + 10, drawY + 10, 10, 6);
        ctx.fillRect(drawX + 52, drawY + 10, 10, 6);
        ctx.fillStyle = 'rgba(136, 255, 244, 0.28)';
        ctx.fillRect(drawX + 8, drawY + 8, 14, 10);
        ctx.fillRect(drawX + 50, drawY + 8, 14, 10);

        const chestGradient = ctx.createRadialGradient(drawX + this.width / 2, drawY + 52, 4, drawX + this.width / 2, drawY + 52, 18);
        chestGradient.addColorStop(0, `rgba(178, 255, 250, ${0.9 * chestGlow})`);
        chestGradient.addColorStop(1, 'rgba(94, 216, 216, 0.12)');
        ctx.fillStyle = chestGradient;
        ctx.beginPath();
        ctx.arc(drawX + this.width / 2, drawY + 52, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#173A3E';
        ctx.fillRect(drawX + 6, drawY + 38 + armLift, 10, 42);
        ctx.fillRect(drawX + 56, drawY + 38 + armLift, 10, 42);
        ctx.fillRect(drawX + 22, drawY + 84, 10, 32);
        ctx.fillRect(drawX + 40, drawY + 84, 10, 32);
        ctx.fillStyle = '#29565C';
        ctx.fillRect(drawX + 4, drawY + 72 + armLift, 12, 14);
        ctx.fillRect(drawX + 56, drawY + 72 + armLift, 12, 14);
        ctx.fillRect(drawX + 20, drawY + 110, 12, 6);
        ctx.fillRect(drawX + 40, drawY + 110, 12, 6);

        if (this.state === 'slam_charge' || this.state === 'sonic_cast') {
            ctx.strokeStyle = 'rgba(178, 255, 250, 0.8)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(drawX + this.width / 2, drawY + 52, 28, 0, Math.PI * 2);
            ctx.stroke();
        }

        this.particles.forEach((particle) => {
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = 'rgba(114, 194, 194, 0.9)';
            ctx.fillRect(particle.x - camX, particle.y, 3, 3);
        });
        ctx.globalAlpha = 1;
        ctx.restore();
    }
}

class EvokerBoss extends Boss {
    constructor(spawnX) {
        super({
            id: 'evoker',
            visualKey: 'evoker_v1',
            name: '唤魔者 Evoker',
            maxHp: 44,
            color: '#5E35B1',
            x: spawnX,
            y: groundY - 98,
            width: 62,
            height: 98,
            phaseThresholds: [0.65, 0.35],
            damage: 1
        });
        this.grounded = true;
        this.moveSpeed = 1.55;
        this.facing = -1;
        this.state = 'reposition';
        this.castTimer = 0;
        this.actionCooldown = 40;
        this.repositionTimer = 0;
        this.staffGlow = 0;
        this.spellburstCooldown = 120;
    }

    updateBehavior(playerRef) {
        this.facing = playerRef.x > this.x ? 1 : -1;
        const hasSpellburst = this.bossProjectiles.some((projectile) => projectile && projectile.type === 'evoker_spellburst' && (projectile.life || 0) > 0);
        this.setIntent(hasSpellburst ? 'spellburst' : (this.state === 'casting' ? 'spellcast' : this.state || 'reposition'));
        this.staffGlow += this.phase >= 3 ? 0.2 : 0.14;
        if (this.actionCooldown > 0) this.actionCooldown--;

        if (this.state === 'casting') {
            this.castTimer--;
            if (this.castTimer === 10) this.castFangLine(playerRef);
            if (this.castTimer <= 0) {
                this.state = 'reposition';
                this.repositionTimer = 32;
            }
            return;
        }

        const distance = Math.abs(playerRef.x - this.x);
        if (this.repositionTimer > 0) {
            this.repositionTimer--;
            this.x -= this.facing * this.moveSpeed * 1.4;
            return;
        }

        if (distance < 120) {
            this.x -= this.facing * this.moveSpeed;
        } else if (distance > 220) {
            this.x += this.facing * this.moveSpeed * 0.5;
        }

        if (this.phase >= 3) {
            this.spellburstCooldown--;
            if (this.spellburstCooldown <= 0 && this.actionCooldown <= 0) {
                this.castSpellBurst();
                this.spellburstCooldown = 180;
                this.actionCooldown = 60;
                return;
            }
        }

        if (this.actionCooldown <= 0) this.startCast();
    }

    startCast() {
        this.state = 'casting';
        this.castTimer = this.phase >= 3 ? 22 : 28;
        this.actionCooldown = this.phase >= 3 ? 90 : 120;
        showFloatingText('✨', this.x + this.width / 2, this.y - 26, '#D1C4E9');
    }

    castSpellBurst() {
        this.setIntent('spellburst');
        const centerX = this.x + this.width / 2;
        const centerY = this.y + 30;
        for (let index = 0; index < 6; index++) {
            const angle = (Math.PI * 2 / 6) * index;
            this.bossProjectiles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * 2.6,
                vy: Math.sin(angle) * 2.6,
                damage: 1,
                size: 10,
                color: '#C7B5FF',
                tracking: false,
                life: 65,
                type: 'evoker_spellburst'
            });
        }
        showFloatingText('🌟', centerX, this.y - 22, '#D1C4E9');
    }

    castFangLine(playerRef) {
        const direction = playerRef.x > this.x ? 1 : -1;
        const fangCount = this.phase >= 3 ? 7 : this.phase === 2 ? 6 : 5;
        for (let index = 1; index <= fangCount; index++) {
            this.bossProjectiles.push({
                x: this.x + this.width / 2 + direction * index * 38,
                y: groundY - 14,
                vx: 0,
                vy: 0,
                damage: this.phase >= 3 ? 2 : 1,
                size: 14,
                color: '#C7B5FF',
                tracking: false,
                life: 28 + index * 3,
                type: 'evoker_fang'
            });
        }
        for (let index = 0; index < 14; index++) {
            this.particles.push({
                x: this.x + this.width / 2,
                y: this.y + 42,
                vx: (Math.random() - 0.5) * 3.2,
                vy: -Math.random() * 3,
                life: 1
            });
        }
    }

    renderProjectile(ctx, projectile, camX) {
        const drawX = projectile.x - camX;
        if (projectile.type === 'evoker_spellburst') {
            ctx.save();
            ctx.strokeStyle = 'rgba(199, 181, 255, 0.85)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(drawX, projectile.y, projectile.size, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
            return;
        }
        if (projectile.type !== 'evoker_fang') return;
        const alpha = Math.min(1, projectile.life / 18);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#EDE7F6';
        ctx.beginPath();
        ctx.moveTo(drawX, projectile.y - projectile.size);
        ctx.lineTo(drawX - projectile.size * 0.6, projectile.y + 4);
        ctx.lineTo(drawX + projectile.size * 0.6, projectile.y + 4);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#9575CD';
        ctx.fillRect(drawX - 4, projectile.y - projectile.size * 0.3, 8, projectile.size * 0.9);
        ctx.restore();
    }

    onPhaseChange(newPhase) {
        super.onPhaseChange(newPhase);
        this.actionCooldown = 20;
        if (newPhase === 2) {
            showToast('⚠️ 唤魔者增强法术!');
        } else if (newPhase === 3) {
            showToast('⚠️ 唤魔者释放禁咒!');
        }
    }

    render(ctx, camX) {
        const drawX = this.x - camX;
        const drawY = this.y;
        const robeColor = this.flashTimer > 0 ? '#F3E5F5' : '#4A2B80';
        const trimColor = '#C5B3FF';
        const glowStrength = 0.55 + Math.sin(this.staffGlow) * 0.2;

        drawShadowEllipse(ctx, drawX + this.width / 2, drawY + this.height + 4, 42, 10, 'rgba(0, 0, 0, 0.24)');
        ctx.save();
        ctx.fillStyle = robeColor;
        ctx.fillRect(drawX + 18, drawY + 4, 26, 24);
        ctx.fillRect(drawX + 12, drawY + 28, 38, 48);
        ctx.fillRect(drawX + 8, drawY + 72, 46, 24);
        ctx.fillStyle = trimColor;
        ctx.fillRect(drawX + 20, drawY + 28, 4, 52);
        ctx.fillRect(drawX + 38, drawY + 28, 4, 52);
        ctx.fillRect(drawX + 27, drawY + 6, 8, 16);

        ctx.fillStyle = '#E8E0D0';
        ctx.fillRect(drawX + 22, drawY + 8, 18, 16);
        ctx.fillStyle = '#4A4A4A';
        ctx.fillRect(drawX + 24, drawY + 13, 3, 3);
        ctx.fillRect(drawX + 35, drawY + 13, 3, 3);
        ctx.fillStyle = '#5C6BC0';
        ctx.fillRect(drawX + 28, drawY + 18, 6, 2);

        const staffX = this.facing > 0 ? drawX + this.width + 2 : drawX - 8;
        ctx.fillStyle = '#6D4C41';
        ctx.fillRect(staffX, drawY + 18, 4, 62);
        const staffGlow = ctx.createRadialGradient(staffX + 2, drawY + 16, 3, staffX + 2, drawY + 16, 16);
        staffGlow.addColorStop(0, `rgba(237, 231, 246, ${0.95 * glowStrength})`);
        staffGlow.addColorStop(1, 'rgba(149, 117, 205, 0.1)');
        ctx.fillStyle = staffGlow;
        ctx.beginPath();
        ctx.arc(staffX + 2, drawY + 16, 14, 0, Math.PI * 2);
        ctx.fill();

        if (this.state === 'casting') {
            ctx.strokeStyle = 'rgba(197, 179, 255, 0.75)';
            ctx.lineWidth = 3;
            ctx.strokeRect(drawX + 6, drawY + 2, 50, 92);
        }

        this.particles.forEach((particle) => {
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = 'rgba(197, 179, 255, 0.9)';
            ctx.fillRect(particle.x - camX, particle.y, 3, 3);
        });
        ctx.globalAlpha = 1;
        ctx.restore();
    }
}
