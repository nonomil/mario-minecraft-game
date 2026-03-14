// ============ BOSS：恶魂 ============

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
        this.fireballWindup = 0;
        this.pendingFireballCount = 0;
        this.fireballWindupFrames = 24;
        this.reflectStunDuration = 120;
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
        const interval = this.phase === 1 ? 150 : this.phase === 2 ? 90 : 60;
        if (this.fireballWindup > 0) {
            const windupIntent = this.phase >= 3 ? 'bombardment' : 'charge_fire';
            this.setIntent(windupIntent);
            this.fireballWindup--;
            if (this.fireballWindup === 0 && this.pendingFireballCount > 0) {
                this.shootFireball(playerRef, this.pendingFireballCount);
                this.pendingFireballCount = 0;
            }
        } else {
            this.setIntent(this.phase >= 3 ? 'bombardment' : 'hover_fire');
            this.attackTimer++;
            if (this.attackTimer >= interval) {
                this.pendingFireballCount = this.phase === 1 ? 1 : this.phase === 2 ? 2 : 3;
                this.fireballWindup = Math.max(10, Number(this.fireballWindupFrames) || 24);
                this.attackTimer = 0;
                this.flashTimer = Math.max(this.flashTimer || 0, 12);
                showFloatingText('⚠️', this.x + this.width / 2, this.y - 20, '#FFB74D');
            }
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

    onReflectedHit(projectile) {
        const type = projectile && projectile.type ? String(projectile.type) : '';
        if (!type.startsWith('ghast_fireball')) return;
        const stunDuration = Math.max(30, Number(this.reflectStunDuration) || 90);
        this.stunTimer = Math.max(this.stunTimer, stunDuration);
        this.rushing = false;
        this.rushTarget = null;
        this.rushTimer = 0;
        this.fireballWindup = 0;
        this.pendingFireballCount = 0;
        this.attackTimer = 0;
        this.setIntent('stunned');
        if (typeof showFloatingText === 'function') {
            showFloatingText('反弹命中!', this.x + this.width / 2, this.y - 28, '#FFE082');
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
        const attacking = this.rushing || this.fireballWindup > 0 || this.attackTimer > 0 && this.attackTimer < 18;
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
