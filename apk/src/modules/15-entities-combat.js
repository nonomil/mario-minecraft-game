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

class Enemy extends Entity {
    constructor(x, y, type = "zombie", range = 120) {
        const stats = ENEMY_STATS[type] || ENEMY_STATS.zombie;
        const size = stats.size || { w: 32, h: 32 };
        const diff = getDifficultyState();
        super(x, y, size.w, size.h);
        this.type = type;
        this.startX = x;
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
            case "ender_dragon":
                this.updateEnderDragon(playerRef);
                break;
            default:
                this.updateBasic();
        }

        this.applyGravity();
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.teleportCooldown > 0) this.teleportCooldown--;
        if (this.webbed > 0) this.webbed--;
    }

    applyGravity() {
        if (this.type === "ender_dragon") return;
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

    updateEnderDragon(playerRef) {
        const phase = this.hp > this.maxHp * 0.5 ? 1 : 2;
        if (phase === 2 && !this.phaseChanged) {
            this.phaseChanged = true;
            this.speed *= 1.5;
            showToast("⚠️ 末影龙进入狂暴状态！");
        }

        this.x += this.speed * this.dir;
        this.y = 100 + Math.sin(gameFrame * 0.02) * 50;
        if (this.x > this.startX + 400 || this.x < this.startX - 200) this.dir *= -1;

        if (this.attackCooldown === 0 && Math.random() < 0.02) {
            const fireball = projectilePool.getFireball(this.x + 40, this.y + 20, playerRef.x, playerRef.y);
            if (!projectiles.includes(fireball)) projectiles.push(fireball);
            this.attackCooldown = phase === 1 ? 120 : 60;
        }

        if (phase === 2 && Math.random() < 0.005) {
            this.state = "diving";
            this.targetDiveY = 400;
        }

        if (this.state === "diving") {
            this.y += 5;
            if (this.y >= this.targetDiveY) {
                this.state = "patrol";
                if (Math.abs(this.x - playerRef.x) < 150) {
                    damagePlayer(this.damage, this.x, 150);
                    showFloatingText("💥 龙息冲击!", playerRef.x, playerRef.y);
                }
            }
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

