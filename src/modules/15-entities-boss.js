/**
 * 15-entities-boss.js - BOSS 竞技场系统 (v1.9.0)
 * 4个BOSS: WitherBoss(2000), GhastBoss(4000), BlazeBoss(6000), WitherSkeletonBoss(8000)
 */

// ===== BOSS 基类 =====
class BossBase {
    constructor(x, y, w, h, hp, damage, name) {
        this.x = x; this.y = y;
        this.width = w; this.height = h;
        this.hp = hp; this.maxHp = hp;
        this.damage = damage; this.name = name;
        this.alive = true; this.phase = 1;
        this.projectiles = []; this.particles = [];
        this.attackCooldown = 0; this.hitFlash = 0;
        this.velX = 0; this.velY = 0;
        this.facingRight = false;
    }
    takeDamage(amount) {
        if (!this.alive) return;
        this.hp -= amount;
        this.hitFlash = 8;
        if (this.hp <= 0) { this.hp = 0; this.alive = false; }
        if (this.alive && this.hp < this.maxHp * 0.5 && this.phase === 1) {
            this.phase = 2;
            showToast("BOSS 进入狂暴阶段！");
        }
    }
    updateProjectiles() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.x += p.velX; p.y += p.velY; p.life--;
            if (p.life <= 0) { this.projectiles.splice(i, 1); continue; }
            if (player && Math.abs(p.x - player.x) < 20 && Math.abs(p.y - player.y) < 30) {
                if (playerInvincibleTimer <= 0) {
                    playerHp -= p.damage || this.damage;
                    playerInvincibleTimer = 60;
                    showFloatingText(player.x, player.y - 20, `-${p.damage || this.damage}`);
                }
                this.projectiles.splice(i, 1);
            }
        }
    }
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.velX || 0; p.y += p.velY || 0; p.life--;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }
    spawnParticle(color) {
        this.particles.push({
            x: this.x + Math.random() * this.width,
            y: this.y + Math.random() * this.height,
            velX: (Math.random() - 0.5) * 2, velY: -Math.random() * 2,
            life: 20, color, size: 3 + Math.random() * 3
        });
    }
    renderParticles(ctx2d) {
        this.particles.forEach(p => {
            ctx2d.fillStyle = p.color;
            ctx2d.globalAlpha = p.life / 20;
            ctx2d.fillRect(p.x, p.y, p.size, p.size);
        });
        ctx2d.globalAlpha = 1;
    }
    renderProjectiles(ctx2d) {
        this.projectiles.forEach(p => {
            ctx2d.fillStyle = p.color || "#FF5722";
            ctx2d.beginPath();
            ctx2d.arc(p.x, p.y, p.size || 6, 0, Math.PI * 2);
            ctx2d.fill();
        });
    }
}

// ===== WitherBoss (2000分) =====
class WitherBoss extends BossBase {
    constructor(x, y) {
        super(x, y, 80, 80, 150, 15, "凋零");
        this.floatBase = y; this.floatAngle = 0;
    }
    update(playerRef) {
        this.updateProjectiles(); this.updateParticles();
        if (!this.alive) { this.spawnParticle("#333"); return; }
        if (this.hitFlash > 0) this.hitFlash--;
        this.floatAngle += 0.03;
        this.y = this.floatBase + Math.sin(this.floatAngle) * 30;
        this.facingRight = playerRef.x > this.x;
        const speed = this.phase === 2 ? 1.2 : 0.8;
        if (Math.abs(this.x - playerRef.x) > 150) {
            this.x += this.facingRight ? speed : -speed;
        }
        this.attackCooldown--;
        const interval = this.phase === 2 ? 40 : 70;
        if (this.attackCooldown <= 0) {
            this.attackCooldown = interval;
            const heads = this.phase === 2 ? 3 : 1;
            for (let i = 0; i < heads; i++) {
                const angle = Math.atan2(playerRef.y - this.y, playerRef.x - this.x) + (i - 1) * 0.3;
                this.projectiles.push({
                    x: this.x + this.width / 2, y: this.y + 20,
                    velX: Math.cos(angle) * 4, velY: Math.sin(angle) * 4,
                    life: 120, damage: this.damage, color: "#333", size: 8
                });
            }
        }
        this.spawnParticle("#555");
    }
    render(ctx2d, camX) {
        if (this.hitFlash > 0 && this.hitFlash % 2 === 0) return;
        const sx = this.x; const sy = this.y;
        // 身体
        ctx2d.fillStyle = "#333";
        ctx2d.fillRect(sx + 15, sy + 30, 50, 50);
        // 三个头
        ctx2d.fillStyle = "#222";
        ctx2d.fillRect(sx + 10, sy, 20, 25);
        ctx2d.fillRect(sx + 30, sy - 5, 20, 25);
        ctx2d.fillRect(sx + 50, sy, 20, 25);
        // 眼睛
        ctx2d.fillStyle = "#FFF";
        ctx2d.fillRect(sx + 14, sy + 8, 4, 4);
        ctx2d.fillRect(sx + 34, sy + 3, 4, 4);
        ctx2d.fillRect(sx + 54, sy + 8, 4, 4);
        this.renderParticles(ctx2d);
        this.renderProjectiles(ctx2d);
    }
}

// ===== GhastBoss (4000分) =====
class GhastBoss extends BossBase {
    constructor(x, y) {
        super(x, y, 70, 70, 120, 20, "恶魂");
        this.floatBase = y; this.floatAngle = 0;
    }
    update(playerRef) {
        this.updateProjectiles(); this.updateParticles();
        if (!this.alive) { this.spawnParticle("#DDD"); return; }
        if (this.hitFlash > 0) this.hitFlash--;
        this.floatAngle += 0.02;
        this.y = this.floatBase + Math.sin(this.floatAngle) * 40;
        this.x += Math.cos(this.floatAngle * 0.7) * 0.5;
        this.facingRight = playerRef.x > this.x;
        this.attackCooldown--;
        const interval = this.phase === 2 ? 50 : 80;
        if (this.attackCooldown <= 0) {
            this.attackCooldown = interval;
            const count = this.phase === 2 ? 3 : 1;
            for (let i = 0; i < count; i++) {
                const spread = (i - Math.floor(count / 2)) * 0.25;
                const angle = Math.atan2(playerRef.y - this.y, playerRef.x - this.x) + spread;
                this.projectiles.push({
                    x: this.x + this.width / 2, y: this.y + this.height / 2,
                    velX: Math.cos(angle) * 3.5, velY: Math.sin(angle) * 3.5,
                    life: 150, damage: this.damage, color: "#FF6F00", size: 10
                });
            }
        }
    }
    render(ctx2d, camX) {
        if (this.hitFlash > 0 && this.hitFlash % 2 === 0) return;
        const sx = this.x; const sy = this.y;
        ctx2d.fillStyle = "#F5F5F5";
        ctx2d.fillRect(sx, sy, 70, 60);
        // 眼睛和嘴
        ctx2d.fillStyle = "#333";
        ctx2d.fillRect(sx + 15, sy + 15, 8, 10);
        ctx2d.fillRect(sx + 45, sy + 15, 8, 10);
        ctx2d.fillRect(sx + 25, sy + 35, 20, 8);
        // 触手
        ctx2d.fillStyle = "#DDD";
        for (let i = 0; i < 4; i++) {
            const tx = sx + 10 + i * 16;
            const wobble = Math.sin(gameFrame * 0.05 + i) * 3;
            ctx2d.fillRect(tx, sy + 60, 6, 20 + wobble);
        }
        this.renderParticles(ctx2d);
        this.renderProjectiles(ctx2d);
    }
}

// ===== BlazeBoss (6000分) =====
class BlazeBoss extends BossBase {
    constructor(x, y) {
        super(x, y, 50, 60, 180, 18, "烈焰人");
        this.floatBase = y; this.floatAngle = 0;
        this.shieldActive = false; this.shieldTimer = 0;
    }
    update(playerRef) {
        this.updateProjectiles(); this.updateParticles();
        if (!this.alive) { this.spawnParticle("#FF9800"); return; }
        if (this.hitFlash > 0) this.hitFlash--;
        this.floatAngle += 0.04;
        this.y = this.floatBase + Math.sin(this.floatAngle) * 25;
        this.facingRight = playerRef.x > this.x;
        const speed = this.phase === 2 ? 1.5 : 1.0;
        if (Math.abs(this.x - playerRef.x) > 120) {
            this.x += this.facingRight ? speed : -speed;
        }
        // 护盾阶段
        if (this.phase === 2) {
            this.shieldTimer--;
            if (this.shieldTimer <= 0) {
                this.shieldActive = !this.shieldActive;
                this.shieldTimer = this.shieldActive ? 90 : 120;
            }
        }
        this.attackCooldown--;
        if (this.attackCooldown <= 0) {
            this.attackCooldown = this.phase === 2 ? 20 : 35;
            const count = this.phase === 2 ? 5 : 3;
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 / count) * i + this.floatAngle;
                this.projectiles.push({
                    x: this.x + this.width / 2, y: this.y + this.height / 2,
                    velX: Math.cos(angle) * 3, velY: Math.sin(angle) * 3,
                    life: 100, damage: this.damage, color: "#FF5722", size: 5
                });
            }
        }
        this.spawnParticle("#FF9800");
    }
    takeDamage(amount) {
        if (this.shieldActive) {
            showFloatingText(this.x, this.y - 10, "护盾!");
            return;
        }
        super.takeDamage(amount);
    }
    render(ctx2d, camX) {
        if (this.hitFlash > 0 && this.hitFlash % 2 === 0) return;
        const sx = this.x; const sy = this.y;
        // 身体
        ctx2d.fillStyle = "#FFC107";
        ctx2d.fillRect(sx + 10, sy + 10, 30, 40);
        // 头
        ctx2d.fillStyle = "#FFD54F";
        ctx2d.fillRect(sx + 12, sy, 26, 16);
        // 眼睛
        ctx2d.fillStyle = "#FF5722";
        ctx2d.fillRect(sx + 16, sy + 4, 6, 4);
        ctx2d.fillRect(sx + 28, sy + 4, 6, 4);
        // 旋转火焰棒
        ctx2d.fillStyle = "#FF9800";
        for (let i = 0; i < 4; i++) {
            const angle = this.floatAngle * 2 + (Math.PI / 2) * i;
            const rx = sx + 25 + Math.cos(angle) * 22;
            const ry = sy + 30 + Math.sin(angle) * 22;
            ctx2d.fillRect(rx - 3, ry - 8, 6, 16);
        }
        // 护盾
        if (this.shieldActive) {
            ctx2d.strokeStyle = "rgba(255, 152, 0, 0.6)";
            ctx2d.lineWidth = 3;
            ctx2d.beginPath();
            ctx2d.arc(sx + 25, sy + 30, 35, 0, Math.PI * 2);
            ctx2d.stroke();
        }
        this.renderParticles(ctx2d);
        this.renderProjectiles(ctx2d);
    }
}

// ===== WitherSkeletonBoss (8000分) =====
class WitherSkeletonBoss extends BossBase {
    constructor(x, y) {
        super(x, y, 40, 64, 200, 25, "凋零骷髅");
        this.grounded = false; this.chargeTimer = 0;
        this.summonCooldown = 300;
    }
    update(playerRef) {
        this.updateProjectiles(); this.updateParticles();
        if (!this.alive) { this.spawnParticle("#444"); return; }
        if (this.hitFlash > 0) this.hitFlash--;
        // 重力
        this.velY += 0.3;
        this.y += this.velY;
        if (this.y + this.height > groundY) {
            this.y = groundY - this.height;
            this.velY = 0; this.grounded = true;
        }
        // 追踪玩家
        this.facingRight = playerRef.x > this.x;
        const speed = this.phase === 2 ? 2.5 : 1.8;
        if (Math.abs(this.x - playerRef.x) > 40) {
            this.x += this.facingRight ? speed : -speed;
        }
        // 近战攻击
        this.attackCooldown--;
        if (this.attackCooldown <= 0 && Math.abs(this.x - playerRef.x) < 60) {
            this.attackCooldown = this.phase === 2 ? 30 : 50;
            if (playerInvincibleTimer <= 0) {
                playerHp -= this.damage;
                playerInvincibleTimer = 60;
                showFloatingText(playerRef.x, playerRef.y - 20, `-${this.damage}`);
            }
        }
        // 召唤小怪 (阶段2)
        if (this.phase === 2) {
            this.summonCooldown--;
            if (this.summonCooldown <= 0) {
                this.summonCooldown = 240;
                const minion = new Enemy(this.x + (this.facingRight ? 60 : -60), groundY - 48, "skeleton");
                enemies.push(minion);
                showToast("凋零骷髅召唤了骷髅!");
            }
        }
        if (gameFrame % 3 === 0) this.spawnParticle("#555");
    }
    render(ctx2d, camX) {
        if (this.hitFlash > 0 && this.hitFlash % 2 === 0) return;
        const sx = this.x; const sy = this.y;
        // 身体
        ctx2d.fillStyle = "#333";
        ctx2d.fillRect(sx + 8, sy + 16, 24, 32);
        // 头
        ctx2d.fillStyle = "#222";
        ctx2d.fillRect(sx + 6, sy, 28, 18);
        // 眼睛
        ctx2d.fillStyle = "#FF1744";
        ctx2d.fillRect(sx + 12, sy + 6, 5, 4);
        ctx2d.fillRect(sx + 23, sy + 6, 5, 4);
        // 腿
        ctx2d.fillStyle = "#333";
        ctx2d.fillRect(sx + 10, sy + 48, 8, 16);
        ctx2d.fillRect(sx + 22, sy + 48, 8, 16);
        // 石剑
        ctx2d.fillStyle = "#555";
        const swordX = this.facingRight ? sx + 34 : sx - 10;
        ctx2d.fillRect(swordX, sy + 16, 6, 30);
        ctx2d.fillStyle = "#8D6E63";
        ctx2d.fillRect(swordX - 2, sy + 30, 10, 6);
        this.renderParticles(ctx2d);
    }
}

// ===== BOSS 竞技场管理器 =====
const BOSS_TYPES = ['wither', 'ghast', 'blaze', 'wither_skeleton'];
const BOSS_SCORES = [2000, 4000, 6000, 8000];
const BOSS_REWARDS = [
    { score: 200, diamonds: 3 },
    { score: 300, diamonds: 5 },
    { score: 400, diamonds: 7 },
    { score: 500, diamonds: 10 }
];

bossArena = {
    active: false,
    boss: null,
    spawned: {},
    victoryTimer: 0,

    checkSpawn(score) {
        if (this.active) return;
        for (let i = BOSS_TYPES.length - 1; i >= 0; i--) {
            const type = BOSS_TYPES[i];
            if (!this.spawned[type] && score >= BOSS_SCORES[i]) {
                this.enter(type, i);
                return;
            }
        }
    },

    enter(bossType, index) {
        this.active = true;
        this.spawned[bossType] = true;
        this.victoryTimer = 0;
        const spawnX = player.x + 400;
        const spawnY = groundY - 150;
        if (bossType === 'wither') this.boss = new WitherBoss(spawnX, spawnY);
        else if (bossType === 'ghast') this.boss = new GhastBoss(spawnX, spawnY - 50);
        else if (bossType === 'blaze') this.boss = new BlazeBoss(spawnX, spawnY);
        else if (bossType === 'wither_skeleton') this.boss = new WitherSkeletonBoss(spawnX, groundY - 64);
        this.boss._typeIndex = typeof index === 'number' ? index : BOSS_TYPES.indexOf(bossType);
        showToast("BOSS战: " + this.boss.name + " 出现了!");
    },

    update(playerRef) {
        if (!this.active || !this.boss) return;
        this.boss.update(playerRef);
        // 玩家攻击BOSS检测
        if (playerRef.isAttacking && this.boss.alive) {
            const dx = Math.abs(playerRef.x - this.boss.x);
            const dy = Math.abs(playerRef.y - this.boss.y);
            if (dx < this.boss.width + 20 && dy < this.boss.height + 20) {
                if (!this.boss._lastHitFrame || gameFrame - this.boss._lastHitFrame > 15) {
                    this.boss._lastHitFrame = gameFrame;
                    const wpn = typeof getCurrentWeaponDamage === 'function' ? getCurrentWeaponDamage() : 10;
                    this.boss.takeDamage(wpn);
                    showFloatingText(this.boss.x, this.boss.y - 10, `-${wpn}`);
                }
            }
        }
        // BOSS死亡
        if (!this.boss.alive) {
            this.victoryTimer++;
            if (this.victoryTimer >= 90) this.exit();
        }
    },
    exit() {
        if (!this.boss) return;
        const idx = this.boss._typeIndex;
        const reward = BOSS_REWARDS[idx] || { score: 200, diamonds: 3 };
        if (typeof addScore === 'function') addScore(reward.score);
        else if (typeof score !== 'undefined') score += reward.score;
        if (typeof inventory !== 'undefined') {
            inventory.diamond = (inventory.diamond || 0) + reward.diamonds;
        }
        showToast(`🏆 ${this.boss.name} 被击败! +${reward.score}分 +${reward.diamonds}💎`);
        showFloatingText(this.boss.x, this.boss.y - 30, `+${reward.score}`);
        this.active = false;
        this.boss = null;
    },

    renderBoss(ctx) {
        if (!this.active || !this.boss) return;
        this.boss.render(ctx);
    },

    renderProjectiles(ctx) {
        if (!this.active || !this.boss) return;
        this.boss.renderProjectiles(ctx);
    },

    renderBossHpBar(ctx) {
        if (!this.active || !this.boss || !this.boss.alive) return;
        const b = this.boss;
        const barW = 300, barH = 16;
        const bx = (ctx.canvas.width - barW) / 2, by = 10;
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(bx - 2, by - 2, barW + 4, barH + 4);
        ctx.fillStyle = "#555";
        ctx.fillRect(bx, by, barW, barH);
        const ratio = b.hp / b.maxHp;
        ctx.fillStyle = ratio > 0.5 ? "#4CAF50" : ratio > 0.25 ? "#FF9800" : "#F44336";
        ctx.fillRect(bx, by, barW * ratio, barH);
        ctx.fillStyle = "#FFF";
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`${b.name}  ${b.hp}/${b.maxHp}`, bx + barW / 2, by + 13);
        ctx.textAlign = "left";
        if (b.phase === 2) {
            ctx.fillStyle = "#FF5722";
            ctx.font = "bold 10px monospace";
            ctx.fillText("狂暴", bx + barW + 8, by + 13);
        }
    }
};
