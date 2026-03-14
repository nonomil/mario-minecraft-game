// ============ BOSS：凋零 ============

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
        this.shieldActive = false;
        this.shieldTimer = 0;
        this.shieldBreakTimer = 0;
        this.shieldCooldown = 240;
    }

    updateBehavior(playerRef) {
        if (this.shieldBreakTimer > 0) {
            this.setIntent('shield_break');
            this.shieldBreakTimer--;
            return;
        }
        if (this.shieldActive) {
            this.setIntent('shield_active');
            this.shieldTimer--;
            if (this.shieldTimer <= 0) {
                this.shieldActive = false;
                this.shieldCooldown = 240;
            }
            return;
        }
        if (this.phase >= 2 && this.shieldCooldown > 0) this.shieldCooldown--;
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
        if (!this.shieldActive && this.shieldCooldown <= 0 && !this.charging) {
            this.activateShield();
            return;
        }
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

    activateShield() {
        this.shieldActive = true;
        this.shieldTimer = 90;
        this.setIntent('shield_active');
        showFloatingText('🛡️', this.x + this.width / 2, this.y - 24, '#90CAF9');
    }

    triggerShieldBreak() {
        if (this.shieldBreakTimer > 0) return;
        this.shieldActive = false;
        this.shieldBreakTimer = 120;
        this.stunTimer = Math.max(this.stunTimer, 60);
        this.setIntent('shield_break');
        showFloatingText('💥', this.x + this.width / 2, this.y - 24, '#FF7043');
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
