// ============ BOSS：烈焰人 ============

const BLAZE_RING_DEFAULTS = Object.freeze({
    telegraphFrames: 36,
    activeFrames: 260,
    punishFrames: 90,
    cooldownFrames: 360,
    innerRadius: 80,
    outerRadius: 140,
    damageCooldown: 24,
    speed: 0.1,
    gapSize: 1.2,
    punishDamageMultiplier: 1.5
});

// 烈焰人 BOSS
class BlazeBoss extends Boss {
    constructor(spawnX) {
        super({
            id: 'blaze',
            visualKey: 'blaze_v2',
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
        this.ringCooldown = 180;
        this.ringEnabled = false;
        this.ringState = 'idle';
        this.ringTimer = 0;
        this.ringSpeed = BLAZE_RING_DEFAULTS.speed;
        this.ringGapSize = BLAZE_RING_DEFAULTS.gapSize;
        this.ringAngle = 0;
        this.ringInnerRadius = BLAZE_RING_DEFAULTS.innerRadius;
        this.ringOuterRadius = BLAZE_RING_DEFAULTS.outerRadius;
        this.ringDamageCooldown = BLAZE_RING_DEFAULTS.damageCooldown;
        this.ringDamageTimer = 0;
    }

    updateBehavior(playerRef) {
        this.updateRingState();
        this.updateRingDamage(playerRef);
        this.updateFloat();
        const hasRingState = this.ringState !== 'idle' && this.ringState !== 'cooldown';
        const hasFlameRing = hasRingState || this.bossProjectiles.some((projectile) => projectile && projectile.type === 'blaze_ring_orb' && (projectile.life || 0) > 0);
        this.setIntent(hasFlameRing ? 'flame_ring' : (this.phase >= 3 ? 'ember_pressure' : 'fireburst'));
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
        if (this.phase >= 3) {
            this.ringCooldown--;
            if (this.ringCooldown <= 0) {
                this.castFlameRing();
                this.ringCooldown = 240;
            }
        }
    }

    castFlameRing() {
        this.setIntent('flame_ring');
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const count = 8;
        for (let index = 0; index < count; index++) {
            const angle = (Math.PI * 2 / count) * index;
            this.bossProjectiles.push({
                x: cx, y: cy,
                vx: Math.cos(angle) * 3.2,
                vy: Math.sin(angle) * 3.2,
                damage: 1, size: 9,
                color: '#FFB300',
                tracking: false, life: 90,
                type: 'blaze_ring_orb'
            });
        }
        showFloatingText('🔥 火焰环!', cx, this.y - 20, '#FFB300');
    }

    updateRingState() {
        if (!this.ringEnabled && this.ringState === 'idle') return;
        this.ringTimer += 1;
        let nextState = null;

        switch (this.ringState) {
            case 'idle':
                if (this.ringEnabled) nextState = 'telegraph';
                break;
            case 'telegraph':
                if (this.ringTimer >= BLAZE_RING_DEFAULTS.telegraphFrames) nextState = 'active';
                break;
            case 'active':
                if (this.ringTimer >= BLAZE_RING_DEFAULTS.activeFrames) nextState = 'punish';
                break;
            case 'punish':
                if (this.ringTimer >= BLAZE_RING_DEFAULTS.punishFrames) nextState = 'cooldown';
                break;
            case 'cooldown':
                if (this.ringTimer >= BLAZE_RING_DEFAULTS.cooldownFrames) nextState = 'idle';
                break;
            default:
                nextState = 'idle';
                break;
        }

        if (nextState) {
            this.ringState = nextState;
            this.ringTimer = 0;
        }
    }

    updateRingDamage(playerRef) {
        if (this.ringState !== 'active') {
            if (this.ringDamageTimer > 0) this.ringDamageTimer -= 1;
            return;
        }
        const target = playerRef || (typeof player !== 'undefined' ? player : null);
        if (!target) return;

        this.ringAngle += this.ringSpeed;
        if (this.ringDamageTimer > 0) {
            this.ringDamageTimer -= 1;
            return;
        }

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const playerCenterX = target.x + target.width / 2;
        const playerCenterY = target.y + target.height / 2;
        const dx = playerCenterX - centerX;
        const dy = playerCenterY - centerY;
        const distance = Math.hypot(dx, dy);
        if (distance < this.ringInnerRadius || distance > this.ringOuterRadius) return;

        const angle = Math.atan2(dy, dx);
        const delta = Math.atan2(Math.sin(angle - this.ringAngle), Math.cos(angle - this.ringAngle));
        const gapHalf = Math.max(0, Number(this.ringGapSize) || 0) / 2;
        if (Math.abs(delta) <= gapHalf) return;

        if (typeof damagePlayer === 'function') {
            damagePlayer(1, this.x, 120);
            this.ringDamageTimer = this.ringDamageCooldown;
        }
    }

    takeDamage(amount) {
        const multiplier = this.ringState === 'punish' ? BLAZE_RING_DEFAULTS.punishDamageMultiplier : 1;
        const scaledAmount = Math.ceil((Number(amount) || 0) * multiplier);
        super.takeDamage(scaledAmount);
    }

    renderRing(ctx, centerX, centerY) {
        if (this.ringState === 'idle' || this.ringState === 'cooldown') return;
        const inner = Math.max(0, Number(this.ringInnerRadius) || 0);
        const outer = Math.max(inner + 4, Number(this.ringOuterRadius) || inner + 4);
        const twoPi = Math.PI * 2;
        const rawGapSize = Math.max(0, Number(this.ringGapSize) || 0);
        const gapSize = Math.min(rawGapSize, twoPi - 0.01);
        const gapHalf = gapSize / 2;
        const gapStart = this.ringAngle - gapHalf;
        const gapEnd = this.ringAngle + gapHalf;

        const normalize = (angle) => {
            let value = angle % twoPi;
            if (value < 0) value += twoPi;
            return value;
        };

        const drawBand = (start, end, color, alpha) => {
            if (end <= start) return;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(centerX, centerY, outer, start, end);
            ctx.arc(centerX, centerY, inner, end, start, true);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        };

        const start = normalize(gapEnd);
        const end = normalize(gapStart);
        const baseColor = this.ringState === 'telegraph' ? '#FFB300' : '#FF6F00';
        const baseAlpha = this.ringState === 'telegraph' ? 0.35 : 0.55;
        if (start <= end) {
            drawBand(start, end, baseColor, baseAlpha);
        } else {
            drawBand(start, twoPi, baseColor, baseAlpha);
            drawBand(0, end, baseColor, baseAlpha);
        }

        ctx.save();
        ctx.strokeStyle = this.ringState === 'telegraph' ? '#FFE082' : '#FFD54F';
        ctx.globalAlpha = this.ringState === 'telegraph' ? 0.8 : 1;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(centerX, centerY, outer + 2, gapStart, gapEnd);
        ctx.stroke();
        ctx.restore();

        this.ringRenderState = this.ringState;
        this.ringRenderTick = (this.ringRenderTick || 0) + 1;
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
                tracking: false, life: 300,
                type: 'blaze_fireball'
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
                type: "blaze_mini",
                hp: 2, maxHp: 2,
                width: 20, height: 20,
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
        const centerX = drawX + this.width / 2;
        const centerY = drawY + this.height / 2;
        const timeValue = Date.now() / 220;
        const rotationSpeed = this.phase >= 3 ? 0.15 : this.phase === 2 ? 0.11 : 0.08;
        this.rotationAngle += rotationSpeed;

        this.renderRing(ctx, centerX, centerY);

        drawBlazeFigure(ctx, centerX, centerY, {
            size: 1,
            timeValue: this.rotationAngle + timeValue,
            flashActive: this.flashTimer > 0,
            rodCount: this.phase >= 3 ? 12 : 10,
            emberCount: this.phase >= 2 ? 6 : 4
        });

        this.fireColumns.forEach((column) => {
            const columnX = column.x - camX;
            const alpha = column.life > 60 ? 0.8 : (column.life / 60) * 0.8;
            const glowGradient = ctx.createLinearGradient(columnX, column.y, columnX, column.y - column.height);
            glowGradient.addColorStop(0, `rgba(255, 111, 0, ${alpha})`);
            glowGradient.addColorStop(0.55, `rgba(255, 196, 0, ${alpha * 0.9})`);
            glowGradient.addColorStop(1, `rgba(255, 245, 157, ${alpha * 0.72})`);
            ctx.fillStyle = glowGradient;
            ctx.fillRect(columnX, column.y - column.height, column.width, column.height);
            ctx.fillStyle = `rgba(255, 245, 157, ${alpha * 0.8})`;
            ctx.fillRect(columnX - 2, column.y - column.height - 8, column.width + 4, 8);
        });

        this.minions.forEach((minion, index) => {
            if (!minion.alive) return;
            const bobOffset = Math.sin(timeValue * 2 + index * 0.9) * 3;
            minion.y = this.floatY + 24 + bobOffset;
            const minionDrawX = minion.x - camX;
            if (minion.type === 'blaze_mini') {
                drawBlazeFigure(ctx, minionDrawX + minion.width / 2, minion.y + minion.height / 2, {
                    size: 0.42,
                    timeValue: this.rotationAngle + index,
                    flashActive: false,
                    rodCount: 6,
                    emberCount: 3
                });
            } else {
                ctx.fillStyle = '#FF8C00';
                ctx.fillRect(minionDrawX, minion.y, minion.width, minion.height);
            }
            const hpPercent = minion.hp / minion.maxHp;
            ctx.fillStyle = '#F44336';
            ctx.fillRect(minionDrawX, minion.y - 6, minion.width * hpPercent, 3);
        });

        this.particles.forEach((particle) => {
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = '#FF6600';
            ctx.fillRect(particle.x - camX, particle.y, 3, 3);
        });
        ctx.globalAlpha = 1;
    }
}
