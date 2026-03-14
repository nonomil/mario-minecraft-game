// ============ BOSS：凋零骷髅 ============

// 凋零骷髅 BOSS
class WitherSkeletonBoss extends Boss {
    constructor(spawnX) {
        super({
            id: 'wither_skeleton',
            visualKey: 'wither_skeleton_v2',
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
        this.boneWallCooldown = 150;
        this.dashState = 'idle';
        this.dashTimer = 0;
        this.dashChargeFrames = 36;
        this.dashDashFrames = 12;
        this.dashRecoverFrames = 60;
        this.dashCooldown = 0;
        this.dashSpeed = 7.0;
        this.dashTargetX = null;
    }

    updateBehavior(playerRef) {
        this.facing = playerRef.x > this.x ? 1 : -1;
        const dist = Math.abs(playerRef.x - this.x);
        const hasBoneWall = this.bossProjectiles.some((projectile) => projectile && projectile.type === 'bone_wall_shard' && (projectile.life || 0) > 0);
        if (this.dashCooldown > 0) this.dashCooldown--;
        if (this.dashState !== 'idle') {
            this.updateDash(playerRef);
            this.updateMinions();
            return;
        }
        this.setIntent(hasBoneWall ? 'bone_wall' : (this.phase >= 3 ? 'bone_pressure' : this.state || 'patrol'));

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
                if (this.phase >= 2 && this.actionCooldown <= 0 && this.dashCooldown <= 0 && dist > 96 && Math.random() < 0.01) {
                    this.startDash(playerRef);
                    break;
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
        if (this.phase >= 3) {
            this.boneWallCooldown--;
            if (this.boneWallCooldown <= 0 && this.state === 'patrol') {
                this.raiseBoneWall();
                this.boneWallCooldown = 220;
            }
        }
        this.updateMinions();
    }

    raiseBoneWall() {
        this.setIntent('bone_wall');
        const centerX = this.x + this.width / 2 + this.facing * 48;
        const shardCount = 5;
        for (let index = 0; index < shardCount; index++) {
            this.bossProjectiles.push({
                x: centerX + (index - 2) * 16,
                y: groundY - 16 - index * 8,
                vx: this.facing * 0.8,
                vy: -0.2,
                damage: 1, size: 8,
                color: '#9E9E9E',
                tracking: false, life: 80,
                type: 'bone_wall_shard'
            });
        }
        this.actionCooldown = Math.max(this.actionCooldown, 50);
        showFloatingText('💀 骨墙!', centerX, this.y - 24, '#BDBDBD');
    }

    startDash(playerRef) {
        if (this.dashState !== 'idle' || this.state === 'stunned' || this.state === 'summoning') return;
        this.dashState = 'charge';
        this.dashTimer = this.dashChargeFrames;
        this.dashTargetX = playerRef ? (playerRef.x + playerRef.width / 2) : this.x;
        this.actionCooldown = Math.max(this.actionCooldown, 40);
        showFloatingText('⚠️', this.x + this.width / 2, this.y - 22, '#FF7043');
    }

    updateDash(playerRef) {
        switch (this.dashState) {
            case 'charge':
                this.setIntent('dash_charge');
                this.dashTimer--;
                if (this.dashTimer <= 0) {
                    this.dashState = 'dash';
                    this.dashTimer = this.dashDashFrames;
                    this.dashTargetX = playerRef ? (playerRef.x + playerRef.width / 2) : this.dashTargetX;
                }
                break;
            case 'dash': {
                this.setIntent('dash_attack');
                const targetX = Number(this.dashTargetX);
                const centerX = this.x + this.width / 2;
                const dir = targetX > centerX ? 1 : -1;
                this.x += dir * this.dashSpeed;
                this.dashTimer--;
                if (this.dashTimer <= 0 || Math.abs(centerX - targetX) < 10) {
                    this.dashState = 'recover';
                    this.dashTimer = this.dashRecoverFrames;
                    this.stunTimer = Math.max(this.stunTimer, 20);
                    this.setIntent('dash_recover');
                }
                break;
            }
            case 'recover':
                this.setIntent('dash_recover');
                this.dashTimer--;
                if (this.dashTimer <= 0) {
                    this.dashState = 'idle';
                    this.dashCooldown = 180;
                    this.state = 'patrol';
                }
                break;
            default:
                this.dashState = 'idle';
                break;
        }
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
        const bodyOffsetY = this.height * (1 - squat);
        const skullY = drawY - 6 + bodyOffsetY;
        const torsoY = drawY + 22 + bodyOffsetY;
        const pelvisY = drawY + 66 + bodyOffsetY;
        const eyeColor = this.phase >= 3 ? BOSS_VISUAL_TOKENS.eyeHot : BOSS_VISUAL_TOKENS.eyeRed;

        drawShadowEllipse(ctx, drawX + this.width / 2, drawY + this.height + 6, 46, 10, 'rgba(0, 0, 0, 0.26)');

        ctx.save();
        ctx.fillStyle = this.flashTimer > 0 ? '#FFFFFF' : BOSS_VISUAL_TOKENS.boneDark;
        ctx.fillRect(drawX + 8, skullY, 32, 22);
        ctx.fillStyle = BOSS_VISUAL_TOKENS.boneMid;
        ctx.fillRect(drawX + 10, skullY + 4, 28, 15);
        ctx.fillStyle = BOSS_VISUAL_TOKENS.boneLight;
        ctx.fillRect(drawX + 12, skullY + 18, 24, 5);
        ctx.fillStyle = BOSS_VISUAL_TOKENS.boneAsh;
        ctx.fillRect(drawX + 16, skullY + 22, 16, 4);
        ctx.fillStyle = eyeColor;
        ctx.fillRect(drawX + 15, skullY + 7, 5, 4);
        ctx.fillRect(drawX + 28, skullY + 7, 5, 4);

        ctx.fillStyle = BOSS_VISUAL_TOKENS.boneMid;
        ctx.fillRect(drawX + 22, torsoY - 6, 4, 44 * squat);
        for (let ribIndex = 0; ribIndex < 5; ribIndex++) {
            const ribY = torsoY + ribIndex * 7;
            const ribWidth = 20 - ribIndex;
            ctx.fillStyle = ribIndex % 2 === 0 ? BOSS_VISUAL_TOKENS.boneLight : BOSS_VISUAL_TOKENS.boneMid;
            ctx.fillRect(drawX + 14, ribY, ribWidth, 3);
        }
        ctx.fillStyle = BOSS_VISUAL_TOKENS.boneDark;
        ctx.fillRect(drawX + 16, pelvisY, 16, 6 * squat);

        const armBaseY = torsoY + 6;
        const legBaseY = pelvisY + 6;
        ctx.fillStyle = BOSS_VISUAL_TOKENS.boneLight;
        ctx.fillRect(drawX + 10, armBaseY, 4, 24 * squat);
        ctx.fillRect(drawX + 34, armBaseY, 4, 24 * squat);
        ctx.fillRect(drawX + 8, armBaseY + 20, 4, 16 * squat);
        ctx.fillRect(drawX + 36, armBaseY + 20, 4, 16 * squat);
        ctx.fillRect(drawX + 16, legBaseY, 4, 26 * squat);
        ctx.fillRect(drawX + 28, legBaseY, 4, 26 * squat);
        ctx.fillRect(drawX + 14, legBaseY + 24, 4, 18 * squat);
        ctx.fillRect(drawX + 30, legBaseY + 24, 4, 18 * squat);

        const swordX = this.facing > 0 ? drawX + this.width + 2 : drawX - 12;
        const bladeY = drawY + 14 + swing;
        ctx.fillStyle = BOSS_VISUAL_TOKENS.swordMid;
        ctx.fillRect(swordX, bladeY, 7, 44);
        ctx.fillStyle = BOSS_VISUAL_TOKENS.swordEdge;
        ctx.fillRect(swordX + 1, bladeY + 2, 2, 36);
        ctx.fillStyle = BOSS_VISUAL_TOKENS.swordGuard;
        ctx.fillRect(swordX - 4, bladeY + 42, 15, 5);
        ctx.fillStyle = BOSS_VISUAL_TOKENS.swordGrip;
        ctx.fillRect(swordX + 2, bladeY + 47, 3, 12);

        for (let ashIndex = 0; ashIndex < 5; ashIndex++) {
            const ashX = drawX + 10 + ((Date.now() / 11 + ashIndex * 19) % 28);
            const ashY = drawY + ((Date.now() / 24 + ashIndex * 17) % this.height);
            ctx.fillStyle = ashIndex % 2 === 0 ? BOSS_VISUAL_TOKENS.ashDark : BOSS_VISUAL_TOKENS.ashLight;
            ctx.fillRect(ashX, ashY, 2, 2);
        }
        ctx.restore();

        if (this.state === 'blocking') {
            ctx.strokeStyle = 'rgba(66, 165, 245, 0.75)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(drawX + this.width / 2, drawY + this.height / 2, 50, 0, Math.PI * 2);
            ctx.stroke();
        }

        if (this.state === 'stunned') {
            for (let starIndex = 0; starIndex < 3; starIndex++) {
                const starX = drawX + 10 + starIndex * 14 + Math.sin(Date.now() / 200 + starIndex) * 5;
                ctx.fillStyle = '#FFD700';
                ctx.font = '14px Arial';
                ctx.fillText('*', starX, drawY - 20);
            }
        }

        this.minions.forEach((minion) => {
            if (!minion.alive) return;
            const minionDrawX = minion.x - camX;
            drawWitherSkeletonMinion(ctx, minionDrawX, minion.y, minion, this.facing);
            ctx.fillStyle = '#F44336';
            ctx.fillRect(minionDrawX, minion.y - 5, minion.width * (minion.hp / minion.maxHp), 3);
        });

        this.particles.forEach((particle) => {
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = '#666';
            ctx.fillRect(particle.x - camX, particle.y, 3, 3);
        });
        ctx.globalAlpha = 1;
    }
}
