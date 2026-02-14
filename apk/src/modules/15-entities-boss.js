// ============ BOSS 战斗系统 ============

// BOSS 基类
class Boss {
    constructor(config) {
        this.name = config.name;
        this.maxHp = config.maxHp;
        this.hp = config.maxHp;
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
        this.type = 'boss';
    }

    update(playerRef) {
        if (!this.alive) return;
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
    onPhaseChange(newPhase) {}
    render(ctx) {}
}

// BOSS 战场管理器
const bossArena = {
    active: false,
    boss: null,
    victoryTimer: 0,
    bossTypes: ['wither', 'ghast'], // v1.4.2+: 'blaze', 'wither_skeleton'
    bossScores: [2000, 4000],      // 触发分数阈值
    spawned: {},           // 已生成的BOSS记录

// PLACEHOLDER_ARENA_METHODS

    checkSpawn() {
        if (this.active) return;
        const score = getProgressScore();
        for (let i = 0; i < this.bossTypes.length; i++) {
            const type = this.bossTypes[i];
            if (!this.spawned[type] && score >= this.bossScores[i]) {
                this.enter(type);
                return;
            }
        }
    },

    enter(bossType) {
        this.active = true;
        this.victoryTimer = 0;
        this.spawned[bossType] = true;
        this.boss = this.createBoss(bossType);
        showToast(`⚠️ BOSS战: ${this.boss.name}!`);
    },

    createBoss(type) {
        const spawnX = player.x + 300;
        switch (type) {
            case 'wither': return new WitherBoss(spawnX);
            case 'ghast': return new GhastBoss(spawnX);
            default: return new WitherBoss(spawnX);
        }
    },

    exit() {
        this.active = false;
        this.boss = null;
    },

    onVictory() {
        if (this.victoryTimer > 0) return;
        this.victoryTimer = 1;
        // 奖励
        score += 500;
        inventory.iron = (inventory.iron || 0) + 5;
        addArmorToInventory('diamond');
        showFloatingText('🏆 BOSS DEFEATED!', player.x, player.y - 60, '#FFD700');
        showToast('🏆 击败BOSS! 获得丰厚奖励!');
    },

    update() {
        if (!this.active || !this.boss) return;
        if (!this.boss.alive) {
            this.victoryTimer++;
            if (this.victoryTimer > 180) this.exit();
            return;
        }
        this.boss.update(player);
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
        ctx.fillText(`${this.boss.name} (阶段${this.boss.phase})`, canvas.width / 2, by - 6);
        ctx.textAlign = 'left';
    },

    renderProjectiles(ctx, camX) {
        if (!this.active || !this.boss) return;
        this.boss.bossProjectiles.forEach(p => {
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
    }
};

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
    }

    updateBehavior(playerRef) {
        this.floatOffset = Math.sin(Date.now() / 500) * 10;
        // 跟随玩家水平位置
        const targetX = playerRef.x;
        if (Math.abs(this.x - targetX) > 150) {
            this.x += (targetX > this.x ? 1 : -1) * this.moveSpeed * (this.phase === 2 ? 1.5 : 1);
        }
        switch (this.phase) {
            case 1: this.phaseOne(playerRef); break;
            case 2: this.phaseTwo(playerRef); break;
            case 3: this.phaseThree(playerRef); break;
        }
    }

    // 阶段一：每3秒1个黑球
    phaseOne(playerRef) {
        this.attackTimer++;
        if (this.attackTimer >= 180) {
            this.shootBlackBall(playerRef, 1);
            this.attackTimer = 0;
        }
    }

    // 阶段二：每2秒3个扇形黑球 + 冲刺
    phaseTwo(playerRef) {
        if (this.charging) { this.executeCharge(playerRef); return; }
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
        const centerX = playerRef.x;
        this.x += (centerX - this.x) * 0.03;
        this.x += (Math.random() - 0.5) * 4;
        this.y = 80 + (Math.random() - 0.5) * 4;
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
                tracking: false, life: 300
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
                tracking: true, trackDelay: 60, life: 300
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
            this.y = 80;
            return;
        }
        this.x += (dx / dist) * 8;
        this.y += (dy / dist) * 8;
        // 冲刺碰撞玩家
        if (Math.abs(this.x - player.x) < this.width &&
            Math.abs(this.y - player.y) < this.height) {
            damagePlayer(2, this.x, 120);
            this.charging = false;
            this.stunTimer = 30;
            this.y = 80;
        }
    }

    onPhaseChange(newPhase) {
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

    render(ctx, camX) {
        const drawX = this.x - camX;
        const drawY = this.y + this.floatOffset;
        // 受击闪白
        ctx.fillStyle = this.flashTimer > 0 ? '#FFF' : this.color;
        // 身体
        ctx.fillRect(drawX, drawY, this.width, this.height);
        // 三个头
        const hs = 24;
        ctx.fillStyle = '#0D0D0D';
        ctx.fillRect(drawX + 8, drawY - hs, hs, hs);
        ctx.fillRect(drawX + this.width / 2 - hs / 2, drawY - hs - 8, hs, hs);
        ctx.fillRect(drawX + this.width - hs - 8, drawY - hs, hs, hs);
        // 眼睛
        ctx.fillStyle = this.phase === 3 ? '#FF0000' : '#FFF';
        [drawX + 14, drawX + this.width / 2 - 4, drawX + this.width - 22].forEach(ex => {
            ctx.fillRect(ex, drawY - hs + 6, 4, 4);
            ctx.fillRect(ex + 8, drawY - hs + 6, 4, 4);
        });
        // 阶段三裂痕
        if (this.phase === 3) {
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(drawX + 20, drawY + 10);
            ctx.lineTo(drawX + 50, drawY + 50);
            ctx.lineTo(drawX + 30, drawY + 80);
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
                tracking: false, life: 300
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

    render(ctx, camX) {
        const drawX = this.x - camX;
        const drawY = this.y;
        // 哭泣时半透明
        ctx.globalAlpha = this.crying ? 0.5 : 0.9;
        // 身体
        ctx.fillStyle = this.flashTimer > 0 ? '#FFF' : '#F0F0F0';
        ctx.fillRect(drawX, drawY, this.width, this.height);
        // 红色眼睛
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(drawX + 16, drawY + 20, 8, 12);
        ctx.fillRect(drawX + 40, drawY + 20, 8, 12);
        // 嘴巴
        ctx.fillStyle = '#333';
        if (this.crying) {
            ctx.fillRect(drawX + 20, drawY + 44, 24, 4);
        } else {
            ctx.fillRect(drawX + 22, drawY + 40, 20, 8);
        }
        // 触手
        ctx.fillStyle = '#DDD';
        for (let i = 0; i < 4; i++) {
            const tx = drawX + 8 + i * 14;
            const sway = Math.sin(Date.now() / 300 + i) * 3;
            ctx.fillRect(tx + sway, drawY + this.height, 6, 16);
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
