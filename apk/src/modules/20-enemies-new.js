/**
 * 20-enemies-new.js - 新群系敌人系统 (v1.7.0)
 * 樱花丛林、蘑菇岛、火山、深暗之域、天空之城专用敌人
 */

// ============ 新敌人属性配置 ============
const BIOME_ENEMY_STATS = {
    // 樱花丛林敌人
    bee: {
        hp: 10,
        speed: 1.8,
        damage: 2,
        size: { w: 16, h: 16 },
        color: "#FFD700",
        attackType: "melee",
        drops: ["honey", "honey"],
        scoreValue: 15,
        biome: "cherry_grove"
    },
    fox: {
        hp: 12,
        speed: 2.2,
        damage: 3,
        size: { w: 24, h: 20 },
        color: "#FF8C00",
        attackType: "melee",
        drops: ["fur", "leather"],
        scoreValue: 20,
        biome: "cherry_grove"
    },
    witch: {
        hp: 25,
        speed: 1.0,
        damage: 5,
        size: { w: 24, h: 32 },
        color: "#800080",
        attackType: "ranged",
        drops: ["potion", "diamond"],
        scoreValue: 40,
        biome: "cherry_grove"
    },

    // 蘑菇岛敌人
    spore_bug: {
        hp: 8,
        speed: 0.8,
        damage: 2,
        size: { w: 14, h: 12 },
        color: "#9370DB",
        attackType: "melee",
        drops: ["mushroom", "mushroom"],
        scoreValue: 12,
        biome: "mushroom_island"
    },

    // 鐏北鏁屼汉
    magma_cube: {
        hp: 25,
        speed: 1.2,
        damage: 8,
        size: { w: 28, h: 28 },
        color: "#FF4500",
        attackType: "melee",
        drops: ["magma_cream", "iron"],
        scoreValue: 35,
        biome: "volcano"
    },
    fire_spirit: {
        hp: 18,
        speed: 2.5,
        damage: 6,
        size: { w: 18, h: 22 },
        color: "#FF6347",
        attackType: "melee",
        drops: ["blaze_powder", "gold"],
        scoreValue: 30,
        biome: "volcano"
    },

    // 深暗之域敌人
    sculk_worm: {
        hp: 5,
        speed: 1.5,
        damage: 1,
        size: { w: 20, h: 12 },
        color: "#008080",
        attackType: "melee",
        drops: ["sculk_vein", "sculk_vein"],
        scoreValue: 10,
        biome: "deep_dark"
    },
    shadow_stalker: {
        hp: 20,
        speed: 1.8,
        damage: 10,
        size: { w: 24, h: 30 },
        color: "#1B3A4B",
        attackType: "melee",
        drops: ["echo_shard", "diamond"],
        scoreValue: 50,
        biome: "deep_dark"
    },
    warden: {
        hp: 100,
        speed: 0.8,
        damage: 50,
        size: { w: 32, h: 48 },
        color: "#0E2230",
        attackType: "melee",
        drops: ["echo_shard", "sculk_vein"],
        scoreValue: 120,
        biome: "deep_dark"
    },

    // 天空之城敌人
    phantom: {
        hp: 22,
        speed: 2.0,
        damage: 8,
        size: { w: 32, h: 16 },
        color: "#9370DB",
        attackType: "melee",
        drops: ["phantom_membrane", "leather"],
        scoreValue: 45,
        biome: "sky_dimension"
    },
    vex: {
        hp: 14,
        speed: 2.8,
        damage: 5,
        size: { w: 14, h: 24 },
        color: "#87CEEB",
        attackType: "melee",
        drops: ["iron", "iron"],
        scoreValue: 25,
        biome: "sky_dimension"
    }
};

const deepDarkNoiseState = {
    value: 0,
    max: 100,
    wardenCooldown: 0,
    lastActionFrame: -999
};
let deepDarkSonicWaves = [];

function hasSilentBootsEquipped() {
    return !!(silentBootsState && silentBootsState.equipped && Number(silentBootsState.durability) > 0);
}

function consumeSilentBootsDurability(cost = 1) {
    if (!hasSilentBootsEquipped()) return;
    const useCost = Math.max(1, Number(cost) || 1);
    silentBootsState.durability = Math.max(0, Number(silentBootsState.durability) - useCost);
    if (silentBootsState.durability <= 0) {
        silentBootsState.equipped = false;
        silentBootsState.durability = 0;
        showToast("静音靴已损坏");
    }
}

function adjustDeepDarkNoiseByEquipment(amount, actionType = "generic") {
    if (currentBiome !== "deep_dark") return Math.max(0, Number(amount) || 0);
    const base = Math.max(0, Number(amount) || 0);
    if (!base || !hasSilentBootsEquipped()) return base;

    if (actionType === "jump" || actionType === "attack" || actionType === "use_item") {
        consumeSilentBootsDurability(1);
        return Math.max(3, Math.round(base * 0.55));
    }
    return base;
}

function addDeepDarkNoise(amount, source = "", actionType = "generic") {
    if (currentBiome !== "deep_dark") return;
    const inc = adjustDeepDarkNoiseByEquipment(amount, actionType);
    if (!inc) return;
    deepDarkNoiseState.value = Math.min(deepDarkNoiseState.max, deepDarkNoiseState.value + inc);
    deepDarkNoiseState.lastActionFrame = gameFrame;
    if (source) {
        showFloatingText(`Noise +${Math.round(inc)}`, player.x, player.y - 56, "#66E0E0");
    }
}

function getDeepDarkNoiseLevel() {
    return deepDarkNoiseState.value;
}

function spawnDeepDarkWarden() {
    if (currentBiome !== "deep_dark") return false;
    const hasWarden = enemies.some(e => !e.remove && e.type === "warden");
    if (hasWarden) return false;
    const spawnX = player.x + (player.facingRight ? 260 : -260);
    const spawnY = Math.max(40, groundY - 60);
    const warden = new WardenEnemy(spawnX, spawnY);
    enemies.push(warden);
    deepDarkNoiseState.wardenCooldown = 900;
    deepDarkNoiseState.value = 40;
    showToast("Warden has awakened!");
    return true;
}

function updateDeepDarkNoiseSystem() {
    if (currentBiome !== "deep_dark") {
        deepDarkNoiseState.value = Math.max(0, deepDarkNoiseState.value - 4);
        deepDarkSonicWaves = [];
        return;
    }
    deepDarkNoiseState.value = Math.max(0, deepDarkNoiseState.value - 0.033);
    if (deepDarkNoiseState.wardenCooldown > 0) deepDarkNoiseState.wardenCooldown--;
    if (deepDarkNoiseState.value >= deepDarkNoiseState.max && deepDarkNoiseState.wardenCooldown <= 0) {
        spawnDeepDarkWarden();
    }

    deepDarkSonicWaves = deepDarkSonicWaves.filter(w => {
        w.x += w.speed * w.dir;
        w.life--;
        if (!w.hit && rectIntersect(w.x - w.radius, w.y - w.radius, w.radius * 2, w.radius * 2, player.x, player.y, player.width, player.height)) {
            w.hit = true;
            damagePlayer(w.damage, w.x, 60);
        }
        return w.life > 0;
    });
}

function renderDeepDarkEnemyEffects(ctx, camX) {
    if (!deepDarkSonicWaves.length) return;
    ctx.save();
    deepDarkSonicWaves.forEach(w => {
        const dx = w.x - camX;
        const alpha = Math.max(0.2, w.life / w.maxLife);
        ctx.strokeStyle = `rgba(110, 220, 255, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(dx, w.y, w.radius, 0, Math.PI * 2);
        ctx.stroke();
    });
    ctx.restore();
}

function renderDeepDarkNoiseHud(ctx) {
    if (currentBiome !== "deep_dark") return;
    const width = 180;
    const height = 10;
    const x = canvas.width - width - 20;
    const y = 14;
    const pct = Math.max(0, Math.min(1, deepDarkNoiseState.value / deepDarkNoiseState.max));
    ctx.save();
    ctx.fillStyle = "rgba(10, 20, 28, 0.7)";
    ctx.fillRect(x - 6, y - 6, width + 12, height + 22);
    ctx.fillStyle = "rgba(12, 45, 60, 0.9)";
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = pct > 0.85 ? "#FF6B6B" : "#5ED6D6";
    ctx.fillRect(x, y, width * pct, height);
    ctx.fillStyle = "#D2F8FF";
    ctx.font = "bold 11px Verdana";
    ctx.fillText(`Noise ${Math.round(deepDarkNoiseState.value)}/100`, x, y + 21);
    ctx.restore();
}

// ============ 新敌人AI类 ============

class BeeEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, "bee", 100);
        this.poisonCooldown = 0;
        this.hoverOffset = Math.random() * Math.PI * 2;
    }

    update(playerRef) {
        const dist = Math.abs(this.x - playerRef.x);
        const speedMult = this.webbed > 0 ? 0.2 : 1;

        // 铚滆渹鎮仠椋炶
        this.y = this.startY + Math.sin(gameFrame * 0.05 + this.hoverOffset) * 20;

        if (dist < 180) {
            this.state = "chase";
            this.x += (playerRef.x > this.x ? 1 : -1) * this.speed * speedMult;

            // 中毒攻击
            if (dist < 30 && this.attackCooldown === 0) {
                damagePlayer(this.damage, this.x);
                tryApplyPoisonEffect(this.x, this.y);
                this.attackCooldown = 90;
                this.poisonCooldown = 120;
            }
        } else {
            this.state = "patrol";
            this.x += this.dir * this.speed * 0.5 * speedMult;
            if (this.x > this.startX + this.range || this.x < this.startX) this.dir *= -1;
        }

        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.poisonCooldown > 0) this.poisonCooldown--;
    }
}

class FoxEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, "fox", 150);
        this.stealCooldown = 0;
        this.fleeTimer = 0;
    }

    update(playerRef) {
        const dist = Math.abs(this.x - playerRef.x);
        const speedMult = this.webbed > 0 ? 0.2 : 1;

        if (this.fleeTimer > 0) {
            // 逃跑模式
            this.state = "fleeing";
            this.x += (playerRef.x > this.x ? -1 : 1) * this.speed * 1.5 * speedMult;
            this.fleeTimer--;
            if (this.fleeTimer === 0) this.state = "patrol";
            return;
        }

        if (dist < 200) {
            if (dist < 40 && this.stealCooldown === 0) {
                // 偷窃攻击
                if (score >= 50) {
                    score = Math.max(0, score - 50);
                    showFloatingText("🦊 偷走了50分!", playerRef.x, playerRef.y - 40, "#FF8C00");
                }
                this.stealCooldown = 300;
                this.fleeTimer = 90;
            } else {
                this.state = "chase";
                this.x += (playerRef.x > this.x ? 1 : -1) * this.speed * speedMult;
            }
        } else {
            this.state = "patrol";
            this.updateBasic();
        }

        if (this.stealCooldown > 0) this.stealCooldown--;
    }
}

class WitchEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, "witch", 180);
        this.potionCooldown = 0;
        this.potionType = "poison";
    }

    update(playerRef) {
        const dist = Math.abs(this.x - playerRef.x);
        const speedMult = this.webbed > 0 ? 0.2 : 1;

        if (dist < 250) {
            this.state = "chase";

            // 保持距离
            if (dist < 100) {
                this.x += (playerRef.x > this.x ? -1 : 1) * this.speed * speedMult;
            } else if (dist > 150) {
                this.x += (playerRef.x > this.x ? 1 : -1) * this.speed * speedMult;
            }

            // 投掷药水
            if (this.potionCooldown === 0 && dist < 200) {
                const allowPoison = canApplyPoisonEffect();
                this.potionType = allowPoison && Math.random() < 0.6 ? "poison" : "slow";
                const potion = potionPool.getPotion(this.x, this.y, playerRef.x, playerRef.y, this.potionType);
                if (!projectiles.includes(potion)) projectiles.push(potion);
                this.potionCooldown = 150;
            }
        } else {
            this.state = "patrol";
            this.updateBasic();
        }

        if (this.potionCooldown > 0) this.potionCooldown--;
    }
}

class SporeBugEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, "spore_bug", 80);
        this.splitOnDeath = true;
        this.splitCount = 0;
    }

    die() {
        if (this.splitOnDeath && this.splitCount < 2) {
            // 分裂成2个小孢子虫
            for (let i = 0; i < 2; i++) {
                const offsetX = (i === 0 ? -20 : 20);
                const miniBug = new SporeBugEnemy(this.x + offsetX, this.y);
                miniBug.hp = 4;
                miniBug.splitCount = this.splitCount + 1;
                miniBug.splitOnDeath = miniBug.splitCount < 2;
                if (!enemies.includes(miniBug)) enemies.push(miniBug);
            }
            showFloatingText("✨ 分裂!", this.x, this.y - 20, "#9370DB");
        }
        super.die();
    }

    update(playerRef) {
        const dist = Math.abs(this.x - playerRef.x);
        const speedMult = this.webbed > 0 ? 0.2 : 1;

        // 缓慢追踪
        if (dist < 150) {
            this.state = "chase";
            this.x += (playerRef.x > this.x ? 1 : -1) * this.speed * 0.7 * speedMult;
        } else {
            this.state = "patrol";
            this.x += this.dir * this.speed * 0.5 * speedMult;
            if (this.x > this.startX + this.range || this.x < this.startX) this.dir *= -1;
        }
    }
}

class MagmaCubeEnemy extends Enemy {
    constructor(x, y, size = "large") {
        super(x, y, "magma_cube", 100);
        this.cubeSize = size;
        this.jumpTimer = 0;
        this.jumpCooldown = 60;
        this.isJumping = false;
        this.jumpVelY = 0;

        // 根据大小调整属性
        if (size === "large") {
            this.hp = 25;
            this.maxHp = 25;
            this.width = 28;
            this.height = 28;
        } else if (size === "medium") {
            this.hp = 15;
            this.maxHp = 15;
            this.width = 20;
            this.height = 20;
        } else {
            this.hp = 8;
            this.maxHp = 8;
            this.width = 12;
            this.height = 12;
        }
    }

    die() {
        // 分裂成小岩浆怪
        if (this.cubeSize === "large") {
            for (let i = 0; i < 2; i++) {
                const offsetX = (i === 0 ? -25 : 25);
                const mediumCube = new MagmaCubeEnemy(this.x + offsetX, this.y, "medium");
                mediumCube.startX = this.x + offsetX;
                if (!enemies.includes(mediumCube)) enemies.push(mediumCube);
            }
            showFloatingText("✨ 分裂!", this.x, this.y - 20, "#FF4500");
        } else if (this.cubeSize === "medium") {
            for (let i = 0; i < 2; i++) {
                const offsetX = (i === 0 ? -18 : 18);
                const smallCube = new MagmaCubeEnemy(this.x + offsetX, this.y, "small");
                smallCube.startX = this.x + offsetX;
                if (!enemies.includes(smallCube)) enemies.push(smallCube);
            }
            showFloatingText("✨ 分裂!", this.x, this.y - 20, "#FF4500");
        }
        super.die();
    }

    update(playerRef) {
        const dist = Math.abs(this.x - playerRef.x);
        const speedMult = this.webbed > 0 ? 0.2 : 1;

        // 岩浆怪跳跃机制
        if (this.jumpCooldown > 0) {
            this.jumpCooldown--;
        } else if (!this.isJumping) {
            this.isJumping = true;
            this.jumpVelY = -8;
            this.jumpTimer = 40;
        }

        if (this.isJumping) {
            this.jumpVelY += gameConfig.physics.gravity;
            this.y += this.jumpVelY;

            // 检测落地
            for (const p of platforms) {
                if (colCheck(this, p)) {
                    this.isJumping = false;
                    this.jumpCooldown = this.cubeSize === "large" ? 60 : this.cubeSize === "medium" ? 45 : 30;
                    break;
                }
            }

            // 空中移动
            if (dist < 200) {
                this.x += (playerRef.x > this.x ? 1 : -1) * this.speed * 0.8 * speedMult;
            }
        } else {
            // 地面追踪
            if (dist < 150) {
                this.state = "chase";
                this.x += (playerRef.x > this.x ? 1 : -1) * this.speed * speedMult;
            } else {
                this.state = "patrol";
                this.x += this.dir * this.speed * 0.6 * speedMult;
                if (this.x > this.startX + this.range || this.x < this.startX) this.dir *= -1;
            }
        }

        // 碰撞伤害
        if (rectIntersect(this.x, this.y, this.width, this.height, playerRef.x, playerRef.y, playerRef.width, playerRef.height)) {
            damagePlayer(this.damage, this.x);
        }
    }
}

class FireSpiritEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, "fire_spirit", 120);
        this.teleportCooldown = 60;
        this.dashCooldown = 90;
        this.isDashing = false;
        this.dashTimer = 0;
        this.dashTargetX = 0;
    }

    update(playerRef) {
        const dist = Math.abs(this.x - playerRef.x);
        const speedMult = this.webbed > 0 ? 0.2 : 1;

        if (this.isDashing) {
            // 冲刺状态
            this.x += (this.dashTargetX > this.x ? 1 : -1) * this.speed * 2.5 * speedMult;
            this.dashTimer--;

            if (this.dashTimer <= 0) {
                this.isDashing = false;
            }

            // 冲刺碰撞伤害
            if (rectIntersect(this.x, this.y, this.width, this.height, playerRef.x, playerRef.y, playerRef.width, playerRef.height)) {
                damagePlayer(this.damage, this.x);
                this.isDashing = false;
            }
            return;
        }

        // 传送机制
        if (this.teleportCooldown === 0 && dist > 150 && Math.random() < 0.03) {
            this.x = playerRef.x + (Math.random() > 0.5 ? 100 : -100);
            this.y = playerRef.y;
            this.teleportCooldown = 90;
            showFloatingText("🔥", this.x, this.y, "#FF6347");
            return;
        }

        // 冲刺攻击
        if (this.dashCooldown === 0 && dist < 200) {
            this.isDashing = true;
            this.dashTimer = 25;
            this.dashTargetX = playerRef.x;
            this.dashCooldown = 150;
            showFloatingText("⚡ 冲刺!", this.x, this.y - 20, "#FF4500");
            return;
        }

        // 正常追踪
        if (dist < 180) {
            this.state = "chase";
            this.x += (playerRef.x > this.x ? 1 : -1) * this.speed * speedMult;
        } else {
            this.state = "patrol";
            this.x += this.dir * this.speed * 0.7 * speedMult;
            if (this.x > this.startX + this.range || this.x < this.startX) this.dir *= -1;
        }

        if (this.teleportCooldown > 0) this.teleportCooldown--;
        if (this.dashCooldown > 0) this.dashCooldown--;
    }
}

class SculkWormEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, "sculk_worm", 80);
        this.underground = true;
        this.emergeTimer = 0;
        this.isEmerged = false;
    }

    update(playerRef) {
        const dist = Math.abs(this.x - playerRef.x);
        const speedMult = this.webbed > 0 ? 0.2 : 1;

        if (this.underground) {
            // 地下追踪，不可见
            this.emergeTimer--;
            if (this.emergeTimer <= 0 && dist < 100) {
                this.underground = false;
                this.isEmerged = true;
                this.emergeTimer = 120;
                showFloatingText("🐛 幽匿虫出现!", this.x, this.y - 20, "#008080");
            } else {
                this.x += (playerRef.x > this.x ? 1 : -1) * this.speed * 1.2 * speedMult;
            }
        } else {
            // 地面攻击
            if (dist < 40 && this.attackCooldown === 0) {
                damagePlayer(this.damage, this.x);
                this.attackCooldown = 60;
            }

            this.emergeTimer--;
            if (this.emergeTimer <= 0) {
                this.underground = true;
                this.emergeTimer = 60;
                showFloatingText("💨 钻入地下", this.x, this.y - 20, "#008080");
            }
        }

        if (this.attackCooldown > 0) this.attackCooldown--;
    }

    render(ctx, camX) {
        if (this.underground) return; // 地下时不渲染
        super.render(ctx, camX);
    }
}

class ShadowStalkerEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, "shadow_stalker", 150);
        this.stealthed = true;
        this.backstabBonus = 5;
        this.revealTimer = 0;
        this.teleportCooldown = 120;
    }

    update(playerRef) {
        const dist = Math.abs(this.x - playerRef.x);
        const speedMult = this.webbed > 0 ? 0.2 : 1;

        if (this.stealthed) {
            // 隐身状态
            if (dist < 80) {
                // 背刺判定
                const facingAway = (playerRef.x > this.x && playerRef.dir > 0) || (playerRef.x < this.x && playerRef.dir < 0);
                if (facingAway) {
                    this.stealthed = false;
                    this.revealTimer = 90;
                    const backstabDamage = this.damage + this.backstabBonus;
                    damagePlayer(backstabDamage, this.x);
                    showFloatingText(`🗡️ 背刺 ${backstabDamage}!`, playerRef.x, playerRef.y - 40, "#1B3A4B");
                }
            }

            // 缓慢接近
            this.x += (playerRef.x > this.x ? 1 : -1) * this.speed * 1.5 * speedMult;

            // 传送
            if (this.teleportCooldown === 0 && dist > 200 && Math.random() < 0.02) {
                this.x = playerRef.x + (Math.random() > 0.5 ? -80 : 80);
                this.y = playerRef.y;
                this.teleportCooldown = 120;
            }
        } else {
            // 显形状态
            if (dist < 60 && this.attackCooldown === 0) {
                damagePlayer(this.damage, this.x);
                this.attackCooldown = 80;
            }

            this.revealTimer--;
            if (this.revealTimer <= 0) {
                this.stealthed = true;
            }
        }

        if (this.teleportCooldown > 0) this.teleportCooldown--;
        if (this.attackCooldown > 0) this.attackCooldown--;
    }
}

class WardenEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, "warden", 220);
        this.sonicCooldown = 120;
    }

    update(playerRef) {
        const dist = Math.abs(this.x - playerRef.x);
        const speedMult = this.webbed > 0 ? 0.2 : 1;

        if (dist < 68 && this.attackCooldown === 0) {
            damagePlayer(this.damage, this.x, 110);
            this.attackCooldown = 90;
            showFloatingText("Warden slam!", this.x, this.y - 24, "#6EC8E8");
        } else if (dist < 280 && this.sonicCooldown === 0) {
            const dir = playerRef.x >= this.x ? 1 : -1;
            deepDarkSonicWaves.push({
                x: this.x + this.width * 0.5,
                y: this.y + this.height * 0.45,
                radius: 16,
                dir,
                speed: 5,
                damage: Math.max(10, Math.round(this.damage * 0.5)),
                life: 36,
                maxLife: 36,
                hit: false
            });
            this.sonicCooldown = 150;
            showFloatingText("Sonic wave!", this.x, this.y - 24, "#7FDBFF");
        } else if (dist < 220) {
            this.state = "chase";
            this.x += (playerRef.x > this.x ? 1 : -1) * this.speed * speedMult;
        } else {
            this.state = "patrol";
            this.updateBasic();
        }

        this.applyGravity();
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.sonicCooldown > 0) this.sonicCooldown--;
        if (this.webbed > 0) this.webbed--;
    }
}

class PhantomEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, "phantom", 200);
        this.flyHeight = 80 + Math.random() * 60;
        this.circlePhase = 0;
        this.diveCooldown = 180;
        this.isDiving = false;
        this.diveTimer = 0;
    }

    update(playerRef) {
        const dist = Math.abs(this.x - playerRef.x);

        // 椋炶楂樺害
        this.y = this.startY - this.flyHeight;

        if (this.isDiving) {
            // 俯冲攻击
            this.y += 5;
            this.x += (playerRef.x - this.x) * 0.1;

            this.diveTimer--;
            if (this.diveTimer <= 0 || this.y > this.startY) {
                this.isDiving = false;
                this.y = this.startY - this.flyHeight;
            }

            // 俯冲碰撞
            if (rectIntersect(this.x, this.y, this.width, this.height, playerRef.x, playerRef.y, playerRef.width, playerRef.height)) {
                damagePlayer(this.damage, this.x);
                this.isDiving = false;
                this.y = this.startY - this.flyHeight;
            }
            return;
        }

        // 盘旋飞行
        if (dist < 250) {
            this.state = "chase";
            this.circlePhase += 0.03;
            const circleX = Math.sin(this.circlePhase) * 80;
            this.x = playerRef.x + circleX;

            // 俯冲攻击
            if (this.diveCooldown === 0 && dist < 150) {
                this.isDiving = true;
                this.diveTimer = 60;
                this.diveCooldown = 200;
                showFloatingText("⬇️ 俯冲!", this.x, this.y - 20, "#9370DB");
            }
        } else {
            this.state = "patrol";
            this.x += this.dir * this.speed * 0.6;
            if (this.x > this.startX + this.range || this.x < this.startX) this.dir *= -1;
        }

        if (this.diveCooldown > 0) this.diveCooldown--;
    }

    applyGravity() {
        // 幻翼不受重力影响
    }
}

class VexEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, "vex", 150);
        this.phaseCooldown = 60;
        this.isPhasing = false;
        this.phaseTimer = 0;
        this.summoned = false;
    }

    updateVexAI(playerRef) {
        const dist = Math.abs(this.x - playerRef.x);
        const speedMult = this.webbed > 0 ? 0.2 : 1;

        // 穿墙冲刺
        if (this.isPhasing) {
            this.x += (playerRef.x > this.x ? 1 : -1) * this.speed * 3 * speedMult;
            this.phaseTimer--;

            if (this.phaseTimer <= 0) {
                this.isPhasing = false;
            }

            // 穿墙碰撞
            if (rectIntersect(this.x, this.y, this.width, this.height, playerRef.x, playerRef.y, playerRef.width, playerRef.height)) {
                damagePlayer(this.damage, this.x);
                this.isPhasing = false;
            }
            return;
        }

        // 正常AI
        if (dist < 200) {
            this.state = "chase";
            this.x += (playerRef.x > this.x ? 1 : -1) * this.speed * speedMult;

            // 穿墙攻击
            if (this.phaseCooldown === 0 && dist < 150) {
                this.isPhasing = true;
                this.phaseTimer = 20;
                this.phaseCooldown = 100;
                showFloatingText("✨ 穿墙!", this.x, this.y - 20, "#87CEEB");
            }
        } else {
            this.state = "patrol";
            this.x += this.dir * this.speed * 0.7 * speedMult;
            if (this.x > this.startX + this.range || this.x < this.startX) this.dir *= -1;
        }

        if (this.phaseCooldown > 0) this.phaseCooldown--;
    }

    applyGravity() {
        // 恶魂不受重力影响
    }

    update(playerRef) {
        if (this.remove || this.y > 900) return;
        this.updateVexAI(playerRef);
        this.applyGravity();

        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.teleportCooldown > 0) this.teleportCooldown--;
        if (this.webbed > 0) this.webbed--;
    }
}

// ============ 女巫药水投射物 ============
class PotionProjectile extends Projectile {
    constructor(x, y, targetX, targetY, potionType = "poison") {
        super(x, y, targetX, targetY, 2.5, "enemy");
        this.potionType = potionType;
        this.gravity = 0.15;
        this.velY = -3;
        this.width = 10;
        this.height = 10;
    }

    update(playerRef, golemList, enemyList) {
        this.velY += this.gravity;
        this.x += this.velX;
        this.y += this.velY;
        this.lifetime--;

        // 检测碰撞
        if (rectIntersect(this.x, this.y, this.width, this.height, playerRef.x, playerRef.y, playerRef.width, playerRef.height)) {
            if (this.potionType === "poison") {
                tryApplyPoisonEffect(this.x, this.y);
            } else if (this.potionType === "slow") {
                player.velX *= 0.3;
                showFloatingText("🐌 减速!", this.x, this.y - 20, "#87CEEB");
            }
            this.remove = true;
            return;
        }

        // 检测平台碰撞
        for (const p of platforms) {
            if (rectIntersect(this.x, this.y, this.width, this.height, p.x, p.y, p.width, p.height)) {
                this.remove = true;
                return;
            }
        }

        if (this.lifetime <= 0) this.remove = true;
    }
}

// ============ 投射物池扩展 ============
const potionPool = {
    potions: [],

    getPotion(x, y, targetX, targetY, potionType) {
        const reused = this.potions.find(p => p.remove);
        if (reused) {
            reused.reset(x, y, targetX, targetY, potionType);
            return reused;
        }
        const fresh = new PotionProjectile(x, y, targetX, targetY, potionType);
        this.potions.push(fresh);
        return fresh;
    }
};

const POISON_HALF_HEART_INTERVAL_MS = 60000;
let playerPoisonState = {
    activeUntil: 0,
    lastTickAt: 0,
    halfHeartCarry: 0
};

function getCurrentBiomePoisonAllowed() {
    const biomeId = currentBiome || "";
    const cfg = biomeConfigs?.[biomeId];
    const tiers = cfg?.enemyTiers;
    if (!Array.isArray(tiers) || !tiers.length || typeof getBiomeVisitRound !== "function") return true;
    const round = Math.max(1, Number(getBiomeVisitRound(biomeId)) || 1);
    const tier = tiers[Math.min(round, tiers.length) - 1];
    return !!tier?.poison;
}

function canApplyPoisonEffect() {
    const minScoreForPoison = 600;
    return (Number(score) || 0) >= minScoreForPoison && getCurrentBiomePoisonAllowed();
}

function tryApplyPoisonEffect(sourceX, sourceY) {
    if (!canApplyPoisonEffect()) return false;
    const now = Date.now();
    const durationMs = 5 * 60 * 1000;
    playerPoisonState.activeUntil = Math.max(playerPoisonState.activeUntil || 0, now + durationMs);
    if (!playerPoisonState.lastTickAt) playerPoisonState.lastTickAt = now;
    showFloatingText("☠️ 中毒!", sourceX, sourceY - 20, "#9370DB");
    return true;
}

function updatePlayerPoisonStatus() {
    const now = Date.now();
    if (!playerPoisonState.activeUntil || now >= playerPoisonState.activeUntil) {
        playerPoisonState.activeUntil = 0;
        playerPoisonState.lastTickAt = 0;
        playerPoisonState.halfHeartCarry = 0;
        return;
    }
    if (playerPoisonState.lastTickAt <= 0) playerPoisonState.lastTickAt = now;
    const elapsed = now - playerPoisonState.lastTickAt;
    if (elapsed < POISON_HALF_HEART_INTERVAL_MS) return;

    const ticks = Math.floor(elapsed / POISON_HALF_HEART_INTERVAL_MS);
    playerPoisonState.lastTickAt += ticks * POISON_HALF_HEART_INTERVAL_MS;
    playerPoisonState.halfHeartCarry += ticks * 0.5;

    while (playerPoisonState.halfHeartCarry >= 1) {
        damagePlayer(1, player.x, 0);
        playerPoisonState.halfHeartCarry -= 1;
    }
}

function resetPlayerPoisonStatus() {
    playerPoisonState.activeUntil = 0;
    playerPoisonState.lastTickAt = 0;
    playerPoisonState.halfHeartCarry = 0;
}

// ============ 敌人工厂扩展 ============
function spawnBiomeEnemy(biomeId, x, y) {
    const enemyTypes = [];

    switch (biomeId) {
        case "cherry_grove":
            enemyTypes.push("bee", "bee", "fox");
            if (score > 300) enemyTypes.push("witch");
            break;
        case "mushroom_island":
            enemyTypes.push("spore_bug", "spore_bug");
            if (score > 400) enemyTypes.push("spore_bug");
            break;
        case "volcano":
            enemyTypes.push("magma_cube", "fire_spirit");
            if (score > 600) enemyTypes.push("magma_cube");
            break;
        case "deep_dark":
            enemyTypes.push("sculk_worm", "shadow_stalker");
            if (score > 800) enemyTypes.push("shadow_stalker");
            if (score > 1200 || getDeepDarkNoiseLevel() > 75) enemyTypes.push("warden");
            break;
        case "sky_dimension":
            enemyTypes.push("phantom", "vex");
            if (score > 1000) enemyTypes.push("phantom");
            break;
        default:
            break;
    }

    // 狐狸全图随机刷新：樱花更常见，其它群系低概率出现。
    if (biomeId === "cherry_grove") {
        if (Math.random() < 0.55) enemyTypes.push("fox");
    } else if (Math.random() < 0.18) {
        enemyTypes.push("fox");
    }

    if (!enemyTypes.length) return null;
    const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    return createBiomeEnemy(type, x, y);
}

function createBiomeEnemy(type, x, y) {
    switch (type) {
        case "bee": return new BeeEnemy(x, y);
        case "fox": return new FoxEnemy(x, y);
        case "witch": return new WitchEnemy(x, y);
        case "spore_bug": return new SporeBugEnemy(x, y);
        case "magma_cube": return new MagmaCubeEnemy(x, y);
        case "fire_spirit": return new FireSpiritEnemy(x, y);
        case "sculk_worm": return new SculkWormEnemy(x, y);
        case "shadow_stalker": return new ShadowStalkerEnemy(x, y);
        case "warden": return new WardenEnemy(x, y);
        case "phantom": return new PhantomEnemy(x, y);
        case "vex": return new VexEnemy(x, y);
        default: return null;
    }
}

// ============ 导出配置 ============
if (typeof ENEMY_STATS !== 'undefined') {
    Object.assign(ENEMY_STATS, BIOME_ENEMY_STATS);
}

