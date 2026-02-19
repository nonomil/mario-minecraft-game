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
    victoryTimer: 0,
    phaseFlashTimer: 0,
    phaseBannerText: '',
    bossTypes: ['wither', 'ghast', 'blaze', 'wither_skeleton'],
    bossScores: [2000, 4000, 6000, 8000],         // 触发分数阈值
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
        this.phaseFlashTimer = 0;
        this.phaseBannerText = '';
        this.spawned[bossType] = true;
        this.boss = this.createBoss(bossType);
        const isFlyingBoss = bossType === 'wither' || bossType === 'ghast' || bossType === 'blaze';
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
        showToast(`⚔️ BOSS战！${this.boss.name}${supportText}`);
    },

    createBoss(type) {
        const spawnX = player.x + 300;
        switch (type) {
            case 'wither': return new WitherBoss(spawnX);
            case 'ghast': return new GhastBoss(spawnX);
            case 'blaze': return new BlazeBoss(spawnX);
            case 'wither_skeleton': return new WitherSkeletonBoss(spawnX);
            default: return new WitherBoss(spawnX);
        }
    },

    exit() {
        this.active = false;
        this.boss = null;
        this.viewportLocked = false;
        this.phaseFlashTimer = 0;
        this.phaseBannerText = '';
    },

    onVictory() {
        if (this.victoryTimer > 0) return;
        this.victoryTimer = 1;
        this.viewportLocked = false;
        // 奖励
        score += 500;
        inventory.iron = (inventory.iron || 0) + 5;
        addArmorToInventory('diamond');
        showFloatingText('🏆 BOSS DEFEATED!', player.x, player.y - 60, '#FFD700');
        showToast('🏆 击败BOSS! 获得丰厚奖励!');
    },

    update() {
        if (!this.active || !this.boss) return;
        if (this.phaseFlashTimer > 0) this.phaseFlashTimer--;
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
            this.shockwave = { x: this.x + this.width / 2, y: this.y + this.height / 2, radius: 12, maxRadius: 96, alpha: 0.85 };
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
    }

    updateBehavior(playerRef) {
        this.updateFloat();
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
                tracking: false, life: 300
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
                hp: 8, maxHp: 8,
                width: 24, height: 32,
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
        const rotationSpeed = this.phase >= 3 ? 0.12 : this.phase === 2 ? 0.09 : 0.07;
        this.rotationAngle += rotationSpeed;
        const cx = drawX + this.width / 2;
        const cy = drawY + this.height / 2;

        // 中心发光核心
        const coreGradient = ctx.createRadialGradient(cx, cy, 4, cx, cy, 18);
        coreGradient.addColorStop(0, this.flashTimer > 0 ? '#FFFFFF' : '#FFF59D');
        coreGradient.addColorStop(1, this.phase >= 3 ? '#FF8F00' : '#FFD54F');
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(cx, cy, 18, 0, Math.PI * 2);
        ctx.fill();

        // 12 根环绕烈焰棒
        for (let i = 0; i < 12; i++) {
            const angle = this.rotationAngle + (Math.PI * 2 / 12) * i;
            const radius = 24 + ((i % 3) - 1) * 5;
            const rodHeight = 14 + (i % 4) * 4;
            const bx = cx + Math.cos(angle) * radius - 3;
            const by = cy + Math.sin(angle) * radius - rodHeight / 2;
            ctx.fillStyle = i % 2 === 0 ? '#FFC107' : '#FFB300';
            ctx.fillRect(bx, by, 6, rodHeight);
        }

        // 火焰粒子环绕
        const particleCount = this.phase >= 3 ? 6 : 4;
        for (let i = 0; i < particleCount; i++) {
            const px = cx + Math.cos(Date.now() / 180 + i * 1.4) * (18 + i * 2);
            const py = cy + Math.sin(Date.now() / 180 + i * 1.4) * 18;
            ctx.fillStyle = `rgba(255, ${100 + Math.random() * 100 | 0}, 0, 0.6)`;
            ctx.fillRect(px - 2, py - 2, 4, 4);
        }

        // 渲染火焰柱
        this.fireColumns.forEach(col => {
            const colX = col.x - camX;
            const alpha = col.life > 60 ? 0.8 : (col.life / 60) * 0.8;
            ctx.fillStyle = `rgba(255, 69, 0, ${alpha})`;
            ctx.fillRect(colX, col.y - col.height, col.width, col.height);
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(colX - 2, col.y - col.height - 8, col.width + 4, 8);
        });

        // 渲染小烈焰人
        this.minions.forEach(m => {
            if (!m.alive) return;
            const mx = m.x - camX;
            ctx.fillStyle = '#FF8C00';
            ctx.fillRect(mx, m.y, m.width, m.height);
            // 小血条
            const hpPct = m.hp / m.maxHp;
            ctx.fillStyle = '#F44336';
            ctx.fillRect(mx, m.y - 6, m.width * hpPct, 3);
        });

        // 粒子
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = '#FF6600';
            ctx.fillRect(p.x - camX, p.y, 3, 3);
        });
        ctx.globalAlpha = 1;
    }
}

// 凋零骷髅 BOSS
class WitherSkeletonBoss extends Boss {
    constructor(spawnX) {
        super({
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
    }

    updateBehavior(playerRef) {
        this.facing = playerRef.x > this.x ? 1 : -1;
        const dist = Math.abs(playerRef.x - this.x);

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
        this.updateMinions();
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

        // 身体（高瘦骨架）
        ctx.fillStyle = this.flashTimer > 0 ? '#FFF' : '#1A1A1A';
        ctx.fillRect(drawX + 8, drawY + this.height * (1 - squat), 32, this.height * squat);
        ctx.fillStyle = '#242424';
        ctx.fillRect(drawX + 14, drawY + 28 + this.height * (1 - squat), 20, 44 * squat);

        // 骷髅头
        ctx.fillStyle = '#2A2A2A';
        ctx.fillRect(drawX + 8, drawY - 4 + this.height * (1 - squat), 32, 28);
        // 眼睛
        ctx.fillStyle = this.phase >= 3 ? '#FF0000' : '#CC0000';
        ctx.fillRect(drawX + 14, drawY + 4 + this.height * (1 - squat), 6, 6);
        ctx.fillRect(drawX + 28, drawY + 4 + this.height * (1 - squat), 6, 6);

        // 石剑
        ctx.fillStyle = '#808080';
        const swordX = this.facing > 0 ? drawX + this.width : drawX - 12;
        ctx.fillRect(swordX, drawY + 20 + swing, 8, 40);
        ctx.fillStyle = '#A0A0A0';
        ctx.fillRect(swordX - 4, drawY + 56 + swing, 16, 6);

        // 煤灰粒子（环境态）
        for (let i = 0; i < 3; i++) {
            const ashX = drawX + 8 + ((Date.now() / 9 + i * 17) % 32);
            const ashY = drawY + ((Date.now() / 22 + i * 21) % this.height);
            ctx.fillStyle = 'rgba(90,90,90,0.45)';
            ctx.fillRect(ashX, ashY, 2, 2);
        }

        // 格挡状态 - 蓝色防护罩
        if (this.state === 'blocking') {
            ctx.strokeStyle = 'rgba(66,165,245,0.75)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(drawX + this.width / 2, drawY + this.height / 2, 50, 0, Math.PI * 2);
            ctx.stroke();
        }

        // 眩晕状态 - 头顶星星
        if (this.state === 'stunned') {
            for (let i = 0; i < 3; i++) {
                const sx = drawX + 10 + i * 14 + Math.sin(Date.now() / 200 + i) * 5;
                ctx.fillStyle = '#FFD700';
                ctx.font = '14px Arial';
                ctx.fillText('⭐', sx, drawY - 20);
            }
        }

        // 渲染小兵
        this.minions.forEach(m => {
            if (!m.alive) return;
            const mx = m.x - camX;
            ctx.fillStyle = '#333';
            ctx.fillRect(mx, m.y, m.width, m.height);
            ctx.fillStyle = '#F44336';
            ctx.fillRect(mx, m.y - 5, m.width * (m.hp / m.maxHp), 3);
        });

        // 粒子
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = '#666';
            ctx.fillRect(p.x - camX, p.y, 3, 3);
        });
        ctx.globalAlpha = 1;
    }
}
