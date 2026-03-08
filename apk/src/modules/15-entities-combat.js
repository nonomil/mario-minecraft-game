/**
 * 15-entities-combat.js - 战斗实体类 (投射物、敌人、傀儡)
 * 从 15-entities.js 拆分 (原始行 827-1319)
 */

class Projectile extends Entity {
    constructor(x, y, targetX, targetY, speed = 3, faction = "enemy") {
        super(x, y, 8 * worldScale.unit, 8 * worldScale.unit);
        const angle = Math.atan2(targetY - y, targetX - x);
        const scaledSpeed = speed * worldScale.unit;
        this.velX = Math.cos(angle) * scaledSpeed;
        this.velY = Math.sin(angle) * scaledSpeed;
        this.lifetime = 180;
        this.damage = 12;
        this.faction = faction;
    }

    reset(x, y, targetX, targetY, speed) {
        this.x = x;
        this.y = y;
        const angle = Math.atan2(targetY - y, targetX - x);
        const scaledSpeed = speed * worldScale.unit;
        this.velX = Math.cos(angle) * scaledSpeed;
        this.velY = Math.sin(angle) * scaledSpeed;
        this.lifetime = 180;
        this.remove = false;
    }

    update(playerRef, golemList, enemyList) {
        this.x += this.velX;
        this.y += this.velY;
        this.lifetime--;

        if (this.faction === "enemy") {
            if (rectIntersect(this.x, this.y, this.width, this.height, playerRef.x, playerRef.y, playerRef.width, playerRef.height)) {
                damagePlayer(this.damage, this.x);
                this.remove = true;
                return;
            }
            for (const g of golemList) {
                if (rectIntersect(this.x, this.y, this.width, this.height, g.x, g.y, g.width, g.height)) {
                    g.takeDamage(this.damage);
                    this.remove = true;
                    return;
                }
            }
            // 检查 dragonList 碰撞
            if (typeof dragonList !== 'undefined') {
                for (const d of dragonList) {
                    if (!d.remove && rectIntersect(this.x, this.y, this.width, this.height, d.x, d.y, d.width, d.height)) {
                        d.takeDamage(this.damage);
                        this.remove = true;
                        return;
                    }
                }
            }
        } else if (this.faction === "golem") {
            for (const e of enemyList) {
                if (!e.remove && rectIntersect(this.x, this.y, this.width, this.height, e.x, e.y, e.width, e.height)) {
                    e.takeDamage(this.damage);
                    showFloatingText(`⚔️ ${this.damage}`, e.x, e.y - 10);
                    this.remove = true;
                    return;
                }
            }
        } else if (this.faction === "player") {
            for (const e of enemyList) {
                if (!e.remove && rectIntersect(this.x, this.y, this.width, this.height, e.x, e.y, e.width, e.height)) {
                    e.takeDamage(this.damage);
                    showFloatingText(`-${this.damage}`, e.x, e.y - 10);
                    this.remove = true;
                    return;
                }
            }
            // BOSS碰撞
            if (typeof bossArena !== 'undefined' && bossArena.active && bossArena.boss && bossArena.boss.alive) {
                const b = bossArena.boss;
                if (rectIntersect(this.x, this.y, this.width, this.height, b.x, b.y, b.width, b.height)) {
                    b.takeDamage(this.damage);
                    this.remove = true;
                    return;
                }
            }
        }

        if (this.lifetime <= 0) this.remove = true;
    }
}

class Arrow extends Projectile {
    constructor(x, y, targetX, targetY, faction = "enemy", speed = 4, damage = 12) {
        super(x, y, targetX, targetY, speed, faction);
        this.damage = damage;
        this.width = 12;
        this.height = 4;
    }
}

class Snowball extends Projectile {
    constructor(x, y, targetX, targetY) {
        super(x, y, targetX, targetY, 3, "golem");
        this.damage = 8;
    }
}

class DragonFireball extends Projectile {
    constructor(x, y, targetX, targetY) {
        super(x, y, targetX, targetY, 2, "enemy");
        this.damage = 30;
        this.width = 16;
        this.height = 16;
    }
}

// ============ EnderDragonFireball 类 ============
class EnderDragonFireball extends Projectile {
    constructor(x, y, targetX, targetY) {
        super(x, y, targetX, targetY, 3, "player");
        this.damage = 25;
        this.aoeRadius = 30;
        this.width = 16;
        this.height = 16;
        const unit = Math.max(1, worldScale.unit || 1);
        const dx = targetX - x;
        const dy = targetY - y;
        const dirX = dx === 0 ? 1 : Math.sign(dx);
        const horizontalSpeed = 4.2 * unit;
        const verticalBias = Math.max(-0.35 * unit, Math.min(0.18 * unit, (dy / Math.max(Math.abs(dx), 1)) * horizontalSpeed * 0.28));
        this.velX = dirX * horizontalSpeed;
        this.velY = verticalBias;
        this.dropDelayFrames = 9;
        this.gravity = 0.32 * unit;
        this.maxFallSpeed = 6.5 * unit;
    }

    update(playerRef, golemList, enemyList) {
        this.x += this.velX;
        if (this.dropDelayFrames > 0) {
            this.y += this.velY;
            this.dropDelayFrames--;
        } else {
            this.velY = Math.min(this.maxFallSpeed, this.velY + this.gravity);
            this.y += this.velY;
        }
        this.lifetime--;

        // 检测敌人碰撞
        for (const e of enemyList) {
            if (!e.remove && rectIntersect(this.x, this.y, this.width, this.height, e.x, e.y, e.width, e.height)) {
                // 直接伤害
                e.takeDamage(this.damage);
                if (typeof showFloatingText === 'function') {
                    showFloatingText(`-${this.damage}`, e.x, e.y - 10);
                }

                // AOE 伤害
                for (const target of enemyList) {
                    if (target.remove || target === e) continue;
                    const dist = Math.hypot(target.x - this.x, target.y - this.y);
                    if (dist <= this.aoeRadius) {
                        const aoeDamage = Math.round(this.damage * 0.5);
                        target.takeDamage(aoeDamage);
                        if (typeof showFloatingText === 'function') {
                            showFloatingText(`-${aoeDamage}`, target.x, target.y - 10);
                        }
                    }
                }

                this.remove = true;
                return;
            }
        }

        // BOSS 碰撞检测（复用现有逻辑）
        if (typeof bossArena !== 'undefined' && bossArena.active && bossArena.boss && bossArena.boss.alive) {
            const b = bossArena.boss;
            if (rectIntersect(this.x, this.y, this.width, this.height, b.x, b.y, b.width, b.height)) {
                b.takeDamage(this.damage);
                this.remove = true;
                return;
            }
        }

        if (this.lifetime <= 0) this.remove = true;
    }
}

class Enemy extends Entity {
    constructor(x, y, type = "zombie", range = 120) {
        const stats = ENEMY_STATS[type] || ENEMY_STATS.zombie;
        const size = stats.size || { w: 32, h: 32 };
        const diff = getDifficultyState();
        super(x, y, size.w, size.h);
        this.type = type;
        this.startX = x;
        this.startY = y;
        this.range = range;
        this.hp = Math.max(1, Math.round(stats.hp * diff.enemyHpMult));
        this.maxHp = this.hp;
        this.speed = stats.speed;
        this.damage = Math.max(1, Math.round(stats.damage * diff.enemyDamageMult));
        this.attackType = stats.attackType;
        this.color = stats.color;
        this.drops = stats.drops || [];
        this.scoreValue = Math.max(1, Math.round((stats.scoreValue || gameConfig.scoring.enemy) * diff.scoreMultiplier));
        this.dir = 1;
        this.state = "patrol";
        this.attackCooldown = 0;
        this.explodeTimer = 0;
        this.teleportCooldown = 0;
        this.phaseChanged = false;
        this.velY = 0;
        this.grounded = false;
        this.webbed = 0; // 蛛网减速计时器

        // ===== 新增：Debuff 系统状态 =====
        this.debuffs = [];           // Debuff 数组
        this.originalSpeed = null;   // 保存原始速度用于减速恢复
    }

    takeDamage(amount) {
        this.hp -= amount;
        playHitSfx(Math.min(1, Math.max(0.2, amount / 20)));
        if (this.hp <= 0) this.die();
    }

    die() {
        this.remove = true;
        this.y = 1000;
        if (Math.random() < 0.6 && this.drops.length) {
            const drop = this.drops[Math.floor(Math.random() * this.drops.length)];
            dropItem(drop, this.x, this.y);
        }
        addScore(this.scoreValue);
        recordEnemyKill(this.type);
    }

    // ===== 新增：添加 Debuff 方法 =====
    addDebuff(type, duration, params = {}) {
        // 防止同类型 debuff 叠加
        const existing = this.debuffs.find(d => d.type === type);
        if (existing) {
            // 刷新持续时间，取最大值
            existing.duration = Math.max(existing.duration, duration);
            return;
        }

        // 减速效果：保存原始速度（仅首次）
        if (type === "slow" && this.originalSpeed === null) {
            this.originalSpeed = this.speed;
        }

        // 添加新 debuff
        this.debuffs.push({
            type: type,
            duration: duration,
            damagePerFrame: params.damagePerFrame || 0,
            speedMult: params.speedMult || 1.0,
            particleTimer: 0
        });
    }

    // ===== 新增：更新 Debuff 状态 =====
    updateDebuffs() {
        // 过滤过期 debuff
        this.debuffs = this.debuffs.filter(d => {
            d.duration--;
            if (d.duration <= 0) return false;

            // 燃烧效果：持续伤害 + 粒子
            if (d.type === "burn") {
                this.hp -= d.damagePerFrame;
                d.particleTimer++;

                // 每 10 帧生成一个火焰粒子
                if (d.particleTimer % 10 === 0) {
                    // 使用现有的 EmberParticle 类（已存在于 15-entities-particles.js）
                    if (typeof particles !== 'undefined' && typeof EmberParticle !== 'undefined') {
                        const ember = new EmberParticle(
                            this.x + this.width / 2 + (Math.random() - 0.5) * this.width,
                            this.y + Math.random() * this.height
                        );
                        particles.push(ember);
                    }
                }
            }

            return true;
        });

        // 减速效果：应用速度修正
        const slowDebuff = this.debuffs.find(d => d.type === "slow");
        if (slowDebuff && this.originalSpeed !== null) {
            this.speed = this.originalSpeed * slowDebuff.speedMult;
        } else if (!slowDebuff && this.originalSpeed !== null) {
            // 减速结束，恢复原始速度
            this.speed = this.originalSpeed;
            this.originalSpeed = null;
        }

        // 检查燃烧致死
        if (this.hp <= 0 && !this.remove) {
            this.die();
        }
    }

    update(playerRef) {
        if (this.remove || this.y > 900) return;
        switch (this.type) {
            case "zombie":
                this.updateZombie(playerRef);
                break;
            case "spider":
                this.updateSpider(playerRef);
                break;
            case "creeper":
                this.updateCreeper(playerRef);
                break;
            case "skeleton":
                this.updateSkeleton(playerRef);
                break;
            case "enderman":
                this.updateEnderman(playerRef);
                break;
            default:
                this.updateBasic();
        }

        this.applyGravity();
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.teleportCooldown > 0) this.teleportCooldown--;
        if (this.webbed > 0) this.webbed--;

        // ===== 新增：更新 Debuff 状态 =====
        this.updateDebuffs();
    }

    applyGravity() {
        this.velY += gameConfig.physics.gravity;
        this.y += this.velY;
        this.grounded = false;

        for (const p of platforms) {
            const dir = colCheck(this, p);
            if (dir === "b") {
                this.grounded = true;
                this.y = p.y - this.height;
                this.velY = 0;
            } else if (dir === "t") {
                this.velY = 0;
            }
        }

        if (this.y > fallResetY) {
            this.remove = true;
        }
    }

    updateBasic() {
        const speedMult = this.webbed > 0 ? 0.2 : 1; // 蛛网减速80%
        this.x += this.speed * this.dir * speedMult;
        if (this.x > this.startX + this.range || this.x < this.startX) this.dir *= -1;
    }

    updateZombie(playerRef) {
        const dist = Math.abs(this.x - playerRef.x);
        const speedMult = this.webbed > 0 ? 0.2 : 1;
        if (dist < 200) {
            this.state = "chase";
            this.x += (playerRef.x > this.x ? 1 : -1) * this.speed * speedMult;
        } else {
            this.state = "patrol";
            this.updateBasic();
        }
    }

    updateSpider(playerRef) {
        const dist = Math.abs(this.x - playerRef.x);
        const speedMult = this.webbed > 0 ? 0.2 : 1;
        if (dist < 240) {
            this.state = "chase";
            this.x += (playerRef.x > this.x ? 1 : -1) * this.speed * speedMult;
        } else {
            this.state = "patrol";
            this.updateBasic();
        }
    }

    updateCreeper(playerRef) {
        // P1-3: 海洋中苦力怕不爆炸，直接消失
        if (currentBiome === 'ocean') {
            this.die();
            return;
        }
        const dist = Math.abs(this.x - playerRef.x);
        if (dist < 60) {
            this.state = "exploding";
            if (this.explodeTimer === 0) this.explodeTimer = 90;
            this.explodeTimer--;
            if (this.explodeTimer <= 0) {
                if (Math.abs(this.x - playerRef.x) < 120 && Math.abs(this.y - playerRef.y) < 120) {
                    damagePlayer(this.damage, this.x);
                    showFloatingText("💥 爆炸!", this.x, this.y);
                }
                this.die();
            }
        } else if (dist < 200) {
            this.state = "chase";
            this.x += (playerRef.x > this.x ? 1 : -1) * this.speed;
            this.explodeTimer = 0;
        } else {
            this.state = "patrol";
            this.explodeTimer = 0;
            this.updateBasic();
        }
    }

    updateSkeleton(playerRef) {
        const dist = Math.abs(this.x - playerRef.x);
        if (dist < 80) {
            this.x += (playerRef.x > this.x ? -1 : 1) * this.speed;
        } else if (dist > 150 && dist < 300) {
            this.x += (playerRef.x > this.x ? 1 : -1) * this.speed;
        }

        if (this.attackCooldown === 0 && dist < 260) {
            const arrow = projectilePool.getArrow(this.x, this.y, playerRef.x, playerRef.y);
            if (!projectiles.includes(arrow)) projectiles.push(arrow);
            this.attackCooldown = 120;
        }
    }

    updateEnderman(playerRef) {
        const dist = Math.abs(this.x - playerRef.x);
        if (dist > 300 && this.teleportCooldown === 0 && Math.random() < 0.02) {
            this.x = playerRef.x + (Math.random() > 0.5 ? 120 : -120);
            this.y = playerRef.y;
            this.teleportCooldown = 180;
            showFloatingText("⚡", this.x, this.y);
        } else if (dist < 150) {
            this.x += (playerRef.x > this.x ? 1 : -1) * this.speed;
        } else {
            this.updateBasic();
        }
    }
}

class Golem extends Entity {
    constructor(x, y, type = "iron") {
        const sizeScale = worldScale.unit;
        super(x, y, type === "iron" ? 40 * sizeScale : 32 * sizeScale, type === "iron" ? 48 * sizeScale : 40 * sizeScale);
        const config = getGolemConfig();
        const stats = type === "iron" ? config.ironGolem : config.snowGolem;
        this.type = type;
        this.hp = stats.hp;
        this.maxHp = stats.hp;
        this.damage = stats.damage;
        this.speed = stats.speed;
        this.followDelay = 30;
        this.attackCooldown = 0;
        this.attackRange = (type === "iron" ? 80 : 120) * sizeScale;
        this.velX = 0;
        this.velY = 0;
        this.grounded = false;
        this.facingRight = true;
        this.stuckCounter = 0;
        this.lastX = x;
        this.spawnBiome = currentBiome; // 记录召唤时的群系
        this.meltTimer = 0; // 沙漠融化计时器
    }

    updateFollow(playerHistory, platformsRef, playerRef) {
        if (playerHistory.length < this.followDelay) return;
        const target = playerHistory[playerHistory.length - this.followDelay];
        const dx = target.x - this.x;
        if (Math.abs(dx) > 30 * worldScale.unit) {
            this.velX = Math.sign(dx) * this.speed;
            this.facingRight = dx > 0;
        } else {
            this.velX *= 0.8;
        }
        if (this.grounded && this.shouldJump(playerRef, platformsRef)) {
            this.velY = -10 * worldScale.unit;
        }
    }

    shouldJump(playerRef, platformsRef) {
        if (this.detectObstacle(platformsRef)) return true;
        if (this.detectGap(platformsRef)) return true;
        return this.shouldMirrorPlayerJump(playerRef);
    }

    detectObstacle(platformsRef) {
        if (!platformsRef || !platformsRef.length) return false;
        const unit = worldScale?.unit || 1;
        const offset = 5 * unit;
        const checkX = this.facingRight ? this.x + this.width + offset : this.x - offset;
        const checkY = this.y + this.height;
        return platformsRef.some(p => {
            const withinY = p.y < checkY && p.y > this.y - 40 * unit;
            return withinY && checkX >= p.x && checkX <= p.x + p.width;
        });
    }

    detectGap(platformsRef) {
        if (!platformsRef || !platformsRef.length) return false;
        if (this.hasGroundAhead(platformsRef)) return false;
        return this.findLandingPlatform(platformsRef);
    }

    hasGroundAhead(platformsRef) {
        if (!platformsRef || !platformsRef.length) return false;
        const unit = worldScale?.unit || 1;
        const lookX = this.facingRight ? this.x + this.width + 10 * unit : this.x - 10 * unit;
        const feetY = this.y + this.height;
        return platformsRef.some(p => {
            const withinY = p.y >= feetY - 4 * unit && p.y <= feetY + 12 * unit;
            return withinY && lookX >= p.x && lookX <= p.x + p.width;
        });
    }

    findLandingPlatform(platformsRef) {
        if (!platformsRef || !platformsRef.length) return false;
        const unit = worldScale?.unit || 1;
        const offset = 20 * unit;
        const lookRange = 160 * unit;
        const start = this.facingRight ? this.x + this.width + offset : this.x - offset;
        const end = this.facingRight ? start + lookRange : start - lookRange;
        const minX = Math.min(start, end);
        const maxX = Math.max(start, end);
        for (const p of platformsRef) {
            if (p.x + p.width < minX || p.x > maxX) continue;
            if (p.y < this.y - 120 * unit || p.y > this.y + 60 * unit) continue;
            return true;
        }
        return false;
    }

    shouldMirrorPlayerJump(playerRef) {
        if (!playerRef) return false;
        const unit = worldScale?.unit || 1;
        const horizontalGap = Math.abs(playerRef.x - this.x);
        return horizontalGap < 150 * unit && playerRef.velY < -2 && !playerRef.grounded;
    }

    checkFallRecovery(playerRef) {
        if (!playerRef) return false;
        const unit = worldScale?.unit || 1;
        const verticalGap = this.y - playerRef.y;
        const threshold = 280 * unit;
        if (this.y > fallResetY + 80 || verticalGap > threshold) {
            const offset = (Math.random() > 0.5 ? -1 : 1) * 80 * unit;
            this.x = playerRef.x + offset;
            this.y = playerRef.y - 10 * unit;
            this.velX = 0;
            this.velY = 0;
            this.grounded = false;
            this.stuckCounter = 0;
            this.lastX = this.x;
            return true;
        }
        return false;
    }

    updateAttack(enemyList) {
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
            return;
        }
        let nearest = null;
        let minDist = this.attackRange;
        for (const e of enemyList) {
            if (e.remove || e.y > canvas.height + blockSize * 4) continue;
            const dist = Math.abs(this.x - e.x);
            const vertDist = Math.abs(this.y - e.y);
            if (dist < minDist && vertDist < blockSize * 2) {
                nearest = e;
                minDist = dist;
            }
        }
        if (nearest) {
            if (this.type === "snow") {
                const snowball = projectilePool.getSnowball(this.x + this.width / 2, this.y + this.height / 2, nearest.x, nearest.y);
                if (!projectiles.includes(snowball)) projectiles.push(snowball);
            } else {
                nearest.takeDamage(this.damage);
            }
            this.attackCooldown = 60;
            showFloatingText(`⚔️ ${this.damage}`, nearest.x, nearest.y - 20);
        }
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.remove = true;
            if (Math.random() < 0.5) {
                const dropType = this.type === "iron" ? "iron" : "pumpkin";
                dropItem(dropType, this.x, this.y);
            }
        }
    }

    update(playerRef, playerHistory, enemyList, platformsRef) {
        // 检查群系变化：离开召唤群系时消失
        if (typeof currentBiome !== 'undefined' && this.spawnBiome !== currentBiome) {
            this.remove = true;
            showFloatingText('👋', this.x, this.y - 20, '#888');
            return;
        }

        // 雪傀儡在沙漠融化
        if (this.type === 'snow' && currentBiome === 'desert') {
            this.meltTimer++;
            if (this.meltTimer > 180) { // 3秒后融化
                this.remove = true;
                // 融化粒子效果
                for (let i = 0; i < 10; i++) {
                    if (typeof particles !== 'undefined') {
                        particles.push(new Particle(
                            this.x + Math.random() * this.width,
                            this.y + Math.random() * this.height,
                            "bubble"
                        ));
                    }
                }
                showFloatingText('💧 融化了!', this.x, this.y - 20, '#87CEEB');
                return;
            }
        }

        this.updateFollow(playerHistory, platformsRef, playerRef);
        this.velY += gameConfig.physics.gravity;
        this.grounded = false;

        for (const p of platformsRef) {
            const dir = colCheck(this, p);
            if (dir === "l" || dir === "r") this.velX = 0;
            else if (dir === "b") {
                this.grounded = true;
                this.y = p.y - this.height;
                this.velY = 0;
            } else if (dir === "t") {
                this.velY = 0;
            }
        }

        this.updateAttack(enemyList);

        this.x += this.velX;
        this.y += this.velY;

        const recovered = this.checkFallRecovery(playerRef);
        if (!recovered && this.y > fallResetY) this.remove = true;

        if (Math.abs(this.x - this.lastX) < 0.2) this.stuckCounter++;
        else this.stuckCounter = 0;
        this.lastX = this.x;

        if (this.stuckCounter > 180 && playerRef) {
            this.x = playerRef.x + (Math.random() > 0.5 ? 50 : -50);
            this.y = playerRef.y;
            this.stuckCounter = 0;
        }
    }
}

// ============ EnderDragon 类 ============
class EnderDragon extends Entity {
    constructor(x, y) {
        super(x, y, 96, 56);
        this.hp = 30;
        this.maxHp = 30;
        this.speed = 2.5;
        this.faction = "golem";
        this.rideable = true;
        this.rider = null;
        this.fireballCooldown = 0;
        this.velX = 0;
        this.velY = 0;
        this.color = "#8B00FF";
        this.state = "standby";
        this.animationTime = 0;
        this.facingRight = true;
        this.standbyOffsetX = 96;
        this.standbyOffsetY = 0;
        this.standbyAnchor = { x, y };
        this.returnThreshold = 14;
    }

    getStandbyAnchor(playerRef) {
        if (playerRef) {
            const groundLevel = typeof groundY === "number" ? groundY - this.height : this.y;
            return {
                x: (playerRef.x || 0) + this.standbyOffsetX,
                y: groundLevel + this.standbyOffsetY
            };
        }
        return {
            x: Number(this.standbyAnchor?.x) || this.x,
            y: Number(this.standbyAnchor?.y) || this.y
        };
    }

    setStandbyState(playerRef = null) {
        this.state = "standby";
        this.rider = null;
        if (playerRef) {
            this.standbyAnchor = this.getStandbyAnchor(playerRef);
        }
        const anchor = this.getStandbyAnchor();
        this.x = anchor.x;
        this.y = anchor.y;
        this.velX = 0;
        this.velY = 0;
    }

    setReturningState(playerRef = null) {
        this.state = "returning";
        this.rider = null;
        if (playerRef) {
            this.standbyAnchor = this.getStandbyAnchor(playerRef);
        }
    }

    setRiddenState(rider) {
        this.state = "ridden";
        this.rider = rider;
        if (rider && typeof rider.facingRight === "boolean") {
            this.facingRight = rider.facingRight;
        }
        this.velX = 0;
        this.velY = 0;
    }

    canAcceptRider() {
        return !this.remove && this.rideable && !this.rider && this.state !== "ridden";
    }

    moveTowardAnchor(playerRef, speedMultiplier = 1) {
        const anchor = playerRef ? this.getStandbyAnchor(playerRef) : this.getStandbyAnchor();
        const dx = anchor.x - this.x;
        const dy = anchor.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= this.returnThreshold) {
            this.x = anchor.x;
            this.y = anchor.y;
            this.velX = 0;
            this.velY = 0;
            return true;
        }

        const moveSpeed = this.speed * speedMultiplier;
        const step = Math.min(dist, moveSpeed);
        this.velX = dist > 0 ? (dx / dist) * step : 0;
        this.velY = dist > 0 ? (dy / dist) * step : 0;
        this.x += this.velX;
        this.y += this.velY;
        return false;
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (typeof showFloatingText === 'function') {
            showFloatingText(`-${amount}`, this.x, this.y - 10);
        }
        if (this.hp <= 0) this.die();
    }

    die() {
        const rider = this.rider;
        this.remove = true;
        this.rider = null;
        if (rider && typeof dismountRider === 'function') {
            dismountRider(rider);
        }
        // 如果有骑手，通知下龙（由 13-game-loop.js 处理）
        if (typeof showToast === 'function') {
            showToast("💀 末影龙已死亡");
        }
    }

    update(playerRef) {
        this.animationTime += 1;

        if (this.fireballCooldown > 0) {
            this.fireballCooldown--;
        }

        if (this.rider) {
            this.state = "ridden";
            if (typeof this.rider.facingRight === "boolean") {
                this.facingRight = this.rider.facingRight;
            }
            return;
        }

        if (this.state === "returning") {
            const arrived = this.moveTowardAnchor(playerRef, 1.35);
            if (arrived) this.setStandbyState();
        } else if (this.state === "standby") {
            const anchor = this.getStandbyAnchor();
            this.x = anchor.x;
            this.y = anchor.y;
            this.velX = 0;
            this.velY = 0;
        } else {
            this.setStandbyState();
        }

        if (typeof cameraX !== 'undefined' && typeof canvas !== 'undefined') {
            this.x = Math.max(cameraX - 50, Math.min(this.x, cameraX + canvas.width + 50));
        }
        if (typeof groundY !== 'undefined') {
            const maxY = this.state === "ridden" ? groundY - this.height - 50 : groundY - this.height;
            this.y = Math.max(50, Math.min(this.y, maxY));
        }
    }

    shootFireball(targetX, targetY) {
        if (this.fireballCooldown > 0) return false;

        const fireball = new EnderDragonFireball(
            this.x + this.width / 2,
            this.y + this.height / 2,
            targetX,
            targetY
        );

        if (typeof projectiles !== 'undefined') {
            projectiles.push(fireball);
        }

        this.fireballCooldown = 60; // 1秒冷却
        return true;
    }
}

