// ============ BOSS：掠夺兽 ============

class RavagerBoss extends Boss {
    constructor(spawnX) {
        super({
            id: 'ravager',
            visualKey: 'ravager_v1',
            name: '掠夺兽 Ravager',
            maxHp: 60,
            color: '#5D4037',
            x: spawnX,
            y: groundY - 82,
            width: 92,
            height: 82,
            phaseThresholds: [0.7, 0.34],
            damage: 2,
            debugState: 'stalk',
            intentKey: 'stalk'
        });
        this.facing = -1;
        this.state = 'stalk';
        this.moveSpeed = 1.25;
        this.chargeSpeed = 4.8;
        this.actionCooldown = 48;
        this.chargeTimer = 0;
        this.recoverTimer = 0;
        this.roarWindup = 0;
        this.roarCooldown = 140;
        this.stompCooldown = 90;
        this.stompTimer = 0;
        this.contactCooldown = 0;
        this.animationTick = 0;
    }

    updateBehavior(playerRef) {
        if (!playerRef) return;
        this.animationTick++;
        this.facing = playerRef.x >= this.x ? 1 : -1;
        if (this.contactCooldown > 0) this.contactCooldown--;
        if (this.actionCooldown > 0) this.actionCooldown--;
        if (this.roarCooldown > 0) this.roarCooldown--;
        if (this.stompCooldown > 0) this.stompCooldown--;

        if (this.roarWindup > 0) {
            this.state = 'roar';
            this.setIntent('roar');
            this.roarWindup--;
            if (this.roarWindup <= 0) this.releaseRoar();
            return;
        }

        if (this.chargeTimer > 0) {
            this.state = 'charge';
            this.setIntent('charge');
            this.x += this.facing * (this.chargeSpeed + (this.phase - 1) * 0.45);
            if (this.contactCooldown <= 0 && this.hitsPlayer(playerRef, 6)) {
                damagePlayer(this.phase >= 3 ? 3 : 2, this.x, 125);
                this.contactCooldown = 24;
                showFloatingText('💥 冲撞', playerRef.x, playerRef.y - 24, '#FFB74D');
            }
            if (this.animationTick % 4 === 0) this.spawnDustTrail();
            this.chargeTimer--;
            if (this.chargeTimer <= 0) {
                this.recoverTimer = this.phase >= 3 ? 18 : 24;
                this.actionCooldown = this.phase >= 3 ? 34 : 44;
            }
            return;
        }

        if (this.recoverTimer > 0) {
            this.state = 'recover';
            this.setIntent('recover');
            this.recoverTimer--;
            return;
        }

        if (this.stompTimer > 0) {
            this.state = 'stomp';
            this.setIntent('stomp');
            this.stompTimer--;
            return;
        }

        const distance = playerRef.x - this.x;
        this.state = 'stalk';
        this.setIntent('stalk');
        if (Math.abs(distance) > 150) {
            this.x += Math.sign(distance) * this.moveSpeed * (this.phase >= 2 ? 1.18 : 1);
        } else if (Math.abs(distance) < 88) {
            this.x -= Math.sign(distance) * this.moveSpeed * 0.45;
        }

        if (this.phase >= 2 && this.roarCooldown <= 0 && Math.abs(distance) < 260) {
            this.startRoar();
            return;
        }

        if (Math.abs(distance) < 110 && this.stompCooldown <= 0) {
            this.performStomp(playerRef);
            return;
        }

        if (this.actionCooldown <= 0) {
            this.startCharge(playerRef);
        }
    }

    hitsPlayer(playerRef, padding = 0) {
        return Math.abs((playerRef.x + playerRef.width / 2) - (this.x + this.width / 2)) < (this.width + playerRef.width) / 2 + padding
            && Math.abs((playerRef.y + playerRef.height / 2) - (this.y + this.height / 2)) < (this.height + playerRef.height) / 2;
    }

    startCharge(playerRef) {
        this.state = 'charge';
        this.setIntent('charge');
        this.facing = playerRef.x >= this.x ? 1 : -1;
        this.chargeTimer = this.phase >= 3 ? 56 : (this.phase === 2 ? 46 : 36);
        this.actionCooldown = this.phase >= 3 ? 110 : 130;
        showFloatingText('🐂 冲锋', this.x + this.width / 2, this.y - 22, '#FFB74D');
    }

    startRoar() {
        this.state = 'roar';
        this.setIntent('roar');
        this.roarWindup = this.phase >= 3 ? 18 : 24;
        this.actionCooldown = this.phase >= 3 ? 80 : 96;
        showFloatingText('📢 蓄力', this.x + this.width / 2, this.y - 26, '#CFD8DC');
    }

    releaseRoar() {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height * 0.46;
        const projectileCount = this.phase >= 3 ? 4 : 3;
        for (let index = 0; index < projectileCount; index++) {
            const speedBoost = index * 0.26;
            this.bossProjectiles.push({
                x: centerX + this.facing * 18,
                y: centerY + (index - 1) * 5,
                vx: this.facing * (2.5 + speedBoost + (this.phase >= 3 ? 0.4 : 0)),
                vy: (index - 1) * 0.12,
                damage: this.phase >= 3 ? 2 : 1,
                size: 12 + index * 2,
                color: '#B0BEC5',
                tracking: false,
                life: 58,
                type: 'ravager_roar'
            });
        }
        this.roarCooldown = this.phase >= 3 ? 100 : 145;
        this.stompCooldown = Math.max(this.stompCooldown, 36);
        showFloatingText('📢 怒吼', centerX, this.y - 26, '#ECEFF1');
    }

    performStomp(playerRef) {
        this.state = 'stomp';
        this.setIntent('stomp');
        this.stompTimer = this.phase >= 3 ? 12 : 10;
        this.actionCooldown = this.phase >= 3 ? 28 : 36;
        this.stompCooldown = this.phase >= 3 ? 50 : 74;
        if (Math.abs((playerRef.x + playerRef.width / 2) - (this.x + this.width / 2)) < 150) {
            damagePlayer(this.phase >= 3 ? 2 : 1, this.x, 110);
        }
        this.spawnDustTrail(8);
        showFloatingText('💥 震地', this.x + this.width / 2, this.y - 22, '#D7CCC8');
    }

    spawnDustTrail(count = 4) {
        for (let index = 0; index < count; index++) {
            this.particles.push({
                x: this.x + 16 + Math.random() * Math.max(12, this.width - 32),
                y: this.y + this.height - 10 + Math.random() * 8,
                vx: (Math.random() - 0.5) * 2.8,
                vy: -Math.random() * 1.8,
                life: 0.95
            });
        }
    }

    onPhaseChange(newPhase) {
        super.onPhaseChange(newPhase);
        this.actionCooldown = 16;
        if (newPhase === 2) {
            showToast('⚠️ 掠夺兽开始怒吼压制！');
        } else if (newPhase === 3) {
            showToast('⚠️ 掠夺兽冲锋大幅提速！');
        }
    }

    renderProjectile(ctx, projectile, camX) {
        const drawX = projectile.x - camX;
        if (projectile.type !== 'ravager_roar') return;
        ctx.save();
        ctx.strokeStyle = 'rgba(207, 216, 220, 0.88)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(drawX, projectile.y, projectile.size, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(176, 190, 197, 0.48)';
        ctx.beginPath();
        ctx.arc(drawX, projectile.y, projectile.size * 1.45, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    render(ctx, camX) {
        const drawX = this.x - camX;
        const drawY = this.y;
        const bodyColor = this.flashTimer > 0 ? '#8D6E63' : '#4E342E';
        const hornColor = '#D7CCC8';
        const eyeColor = this.state === 'charge' ? '#FF7043' : '#EF5350';
        const legLift = Math.sin(this.animationTick * 0.18) * 2;

        drawShadowEllipse(ctx, drawX + this.width / 2, drawY + this.height + 4, this.width * 0.8, 14, 'rgba(0, 0, 0, 0.26)');
        ctx.save();
        ctx.fillStyle = bodyColor;
        ctx.fillRect(drawX + 14, drawY + 16, 56, 34);
        ctx.fillRect(drawX + 8, drawY + 24, 72, 30);
        ctx.fillRect(drawX + 60, drawY + 8, 24, 24);
        ctx.fillRect(drawX + 66, drawY + 26, 16, 14);

        ctx.fillStyle = '#6D4C41';
        ctx.fillRect(drawX + 10, drawY + 20, 68, 10);
        ctx.fillRect(drawX + 18, drawY + 10, 44, 8);

        ctx.fillStyle = hornColor;
        ctx.fillRect(drawX + 62, drawY + 4, 8, 6);
        ctx.fillRect(drawX + 76, drawY + 4, 8, 6);
        ctx.fillRect(drawX + 64, drawY + 10, 4, 10);
        ctx.fillRect(drawX + 78, drawY + 10, 4, 10);

        ctx.fillStyle = eyeColor;
        ctx.fillRect(drawX + 68, drawY + 16, 3, 3);
        ctx.fillRect(drawX + 77, drawY + 16, 3, 3);

        ctx.fillStyle = '#3E2723';
        ctx.fillRect(drawX + 64, drawY + 24, 18, 8);
        ctx.fillRect(drawX + 18, drawY + 48 + legLift, 10, 24);
        ctx.fillRect(drawX + 34, drawY + 48 - legLift, 10, 24);
        ctx.fillRect(drawX + 56, drawY + 48 - legLift, 10, 24);
        ctx.fillRect(drawX + 72, drawY + 48 + legLift, 10, 24);

        if (this.state === 'charge') {
            ctx.strokeStyle = 'rgba(255, 183, 77, 0.75)';
            ctx.lineWidth = 3;
            ctx.strokeRect(drawX + 6, drawY + 6, 82, 64);
        }

        this.particles.forEach((particle) => {
            ctx.globalAlpha = Math.max(0, particle.life);
            ctx.fillStyle = 'rgba(188, 170, 164, 0.9)';
            ctx.fillRect(particle.x - camX, particle.y, 4, 4);
        });
        ctx.globalAlpha = 1;
        ctx.restore();
    }
}

// 保留旧名字仅做兼容，实际轮换名单已切换为 Ravager。
class EvokerBoss extends RavagerBoss {}

// ============ BOSS：唤魔者 ============

class LegacyEvokerBoss extends Boss {
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
        this.shieldActive = false;
        this.shieldTimer = 0;
        this.shieldBreakTimer = 0;
        this.shieldCooldown = 180;
        this.summonWaveTimer = 0;
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
            this.summonWaveTimer--;
            if (this.summonWaveTimer <= 0) {
                this.castSpellBurst();
                this.summonWaveTimer = 45;
            }
            if (this.shieldTimer <= 0) {
                this.shieldActive = false;
                this.shieldCooldown = 180;
            }
            return;
        }
        this.facing = playerRef.x > this.x ? 1 : -1;
        const hasSpellburst = this.bossProjectiles.some((projectile) => projectile && projectile.type === 'evoker_spellburst' && (projectile.life || 0) > 0);
        this.setIntent(hasSpellburst ? 'spellburst' : (this.state === 'casting' ? 'spellcast' : this.state || 'reposition'));
        this.staffGlow += this.phase >= 3 ? 0.2 : 0.14;
        if (this.actionCooldown > 0) this.actionCooldown--;
        if (this.phase >= 2 && this.shieldCooldown > 0) this.shieldCooldown--;

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

        if (this.phase >= 2 && this.shieldCooldown <= 0) {
            this.activateShield();
            return;
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

    activateShield() {
        this.shieldActive = true;
        this.shieldTimer = 120;
        this.summonWaveTimer = 24;
        this.setIntent('shield_active');
        showFloatingText('🛡️', this.x + this.width / 2, this.y - 24, '#B39DDB');
    }

    triggerShieldBreak() {
        this.shieldActive = false;
        this.shieldBreakTimer = 120;
        this.stunTimer = Math.max(this.stunTimer, 60);
        this.setIntent('shield_break');
        showFloatingText('💥', this.x + this.width / 2, this.y - 24, '#FF8A65');
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
