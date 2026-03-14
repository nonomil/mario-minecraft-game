// ============ BOSS：监守者 ============

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
        this.sonicWarnFrames = 18;
        this.sonicWarnTimer = 0;
        this.chestPulse = 0;
        this.darkPulseCooldown = 150;
        this.darkPulseIntentHold = 0;
    }

    updateBehavior(playerRef) {
        if (this.darkPulseIntentHold > 0) {
            this.setIntent('dark_pulse');
            this.darkPulseIntentHold--;
            return;
        }
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
            case 'sonic_warn':
                this.setIntent('sonic_warn');
                this.sonicWarnTimer--;
                if (this.sonicWarnTimer <= 0) {
                    this.state = 'sonic_cast';
                    this.slamTimer = 26;
                }
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
        this.state = 'sonic_warn';
        this.sonicWarnTimer = Math.max(1, Number(this.sonicWarnFrames) || 18);
        this.setIntent('sonic_warn');
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
        this.darkPulseIntentHold = Math.max(this.darkPulseIntentHold, 12);
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
