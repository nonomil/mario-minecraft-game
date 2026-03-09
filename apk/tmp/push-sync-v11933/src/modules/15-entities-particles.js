/**
 * 15-entities-particles.js - 粒子效果类
 * 从 15-entities.js 拆分 (原始行 606-826)
 */

class Particle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.velX = 0;
        this.velY = 0;
        this.life = 100;
        this.remove = false;
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.remove = false;
    }

    update() {
        this.x += this.velX;
        this.y += this.velY;
        this.life--;
        if (this.life <= 0) this.remove = true;
    }
}

class Snowflake extends Particle {
    constructor(x, y) {
        super(x, y, "snowflake");
        this.reset(x, y);
    }
    reset(x, y) {
        super.reset(x, y);
        this.velX = (Math.random() - 0.5) * 0.5;
        this.velY = 0.5 + Math.random() * 1;
        this.size = 2 + Math.random() * 3;
        this.life = 200;
    }
    update() {
        super.update();
        this.velX += Math.sin(this.life * 0.05) * 0.02;
    }
}

class LeafParticle extends Particle {
    constructor(x, y) {
        super(x, y, "leaf");
        this.reset(x, y);
    }
    reset(x, y) {
        super.reset(x, y);
        this.velX = (Math.random() - 0.5) * 0.6;
        this.velY = 0.4 + Math.random() * 0.6;
        this.size = 3 + Math.random() * 3;
        this.life = 180;
        this.color = ["#7CB342", "#558B2F", "#9CCC65"][Math.floor(Math.random() * 3)];
    }
}

class DustParticle extends Particle {
    constructor(x, y) {
        super(x, y, "dust");
        this.reset(x, y);
    }
    reset(x, y) {
        super.reset(x, y);
        this.velX = -0.5 + Math.random() * 1;
        this.velY = 0.2 + Math.random() * 0.4;
        this.size = 2 + Math.random() * 2;
        this.life = 140;
    }
}

class EmberParticle extends Particle {
    constructor(x, y) {
        super(x, y, "ember");
        this.reset(x, y);
    }
    reset(x, y) {
        super.reset(x, y);
        this.velX = (Math.random() - 0.5) * 0.3;
        this.velY = -0.6 - Math.random() * 0.6;
        this.size = 2 + Math.random() * 2;
        this.life = 120;
    }
}

class BubbleParticle extends Particle {
    constructor(x, y) {
        super(x, y, "bubble");
        this.reset(x, y);
    }
    reset(x, y) {
        super.reset(x, y);
        this.velX = (Math.random() - 0.5) * 0.2;
        this.velY = -0.4 - Math.random() * 0.4;
        this.size = 2 + Math.random() * 2;
        this.life = 120;
    }
}

class SparkleParticle extends Particle {
    constructor(x, y) {
        super(x, y, "sparkle");
        this.reset(x, y);
    }
    reset(x, y) {
        super.reset(x, y);
        this.velX = (Math.random() - 0.5) * 0.2;
        this.velY = -0.2 + Math.random() * 0.4;
        this.size = 2 + Math.random() * 3;
        this.life = 100;
    }
}

class RainParticle extends Particle {
    constructor(x, y) {
        super(x, y, "rain");
        this.reset(x, y);
    }
    reset(x, y) {
        super.reset(x, y);
        this.velX = -0.3 + Math.random() * 0.6;
        this.velY = 3 + Math.random() * 2;
        this.size = 6;
        this.life = 80;
    }
}

const ENEMY_STATS = {
    zombie: {
        hp: 20,
        speed: 0.55,
        damage: 10,
        attackType: "melee",
        color: "#00AA00",
        drops: ["rotten_flesh"],
        scoreValue: 10,
        size: { w: 32, h: 48 }
    },
    spider: {
        hp: 16,
        speed: 1.2,
        damage: 8,
        attackType: "melee",
        color: "#4A0E0E",
        drops: ["string"],
        scoreValue: 12,
        size: { w: 44, h: 24 }
    },
    creeper: {
        hp: 20,
        speed: 0.4,
        damage: 40,
        attackType: "explode",
        color: "#00AA00",
        drops: ["gunpowder"],
        scoreValue: 18,
        size: { w: 32, h: 48 }
    },
    skeleton: {
        hp: 15,
        speed: 0.5,
        damage: 12,
        attackType: "ranged",
        color: "#C0C0C0",
        drops: ["arrow"],
        scoreValue: 20,
        size: { w: 32, h: 48 }
    },
    drowned: {
        hp: 18,
        speed: 0.6,
        damage: 9,
        attackType: "melee",
        color: "#1E88E5",
        drops: ["rotten_flesh", "shell"],
        scoreValue: 14,
        size: { w: 32, h: 48 }
    },
    pufferfish: {
        hp: 14,
        speed: 0.9,
        damage: 7,
        attackType: "melee",
        color: "#FFB300",
        drops: ["shell", "starfish"],
        scoreValue: 12,
        size: { w: 30, h: 30 }
    },
    enderman: {
        hp: 40,
        speed: 1.4,
        damage: 25,
        attackType: "teleport",
        color: "#1A0033",
        drops: ["ender_pearl"],
        scoreValue: 35,
        size: { w: 32, h: 64 }
    },
    piglin: {
        hp: 60,
        speed: 1.1,
        damage: 20,
        attackType: "melee",
        color: "#C68642",
        drops: ["diamond"],
        scoreValue: 28,
        size: { w: 32, h: 52 }
    }
};

// ============ 海洋生物系统 ============
let oceanCreatures = [];

class CodFish {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.hp = 1; this.width = 24; this.height = 12;
        this.speed = 1.5;
        this.facing = Math.random() > 0.5 ? 1 : -1;
        this.swimAngle = Math.random() * Math.PI * 2;
        this.alive = true;
        this.type = 'cod';
    }
    update() {
        if (!this.alive) return;
        const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
        if (distToPlayer < 80) {
            const angle = Math.atan2(this.y - player.y, this.x - player.x);
            this.x += Math.cos(angle) * this.speed * 2;
            this.y += Math.sin(angle) * this.speed * 2;
            this.facing = Math.cos(angle) > 0 ? 1 : -1;
        } else {
            this.swimAngle += 0.03;
            this.x += Math.sin(this.swimAngle) * this.speed * 0.5;
            this.y += Math.cos(this.swimAngle * 2) * this.speed * 0.3;
        }
        this.y = Math.max(30, Math.min(this.y, groundY - 30));
    }
    takeDamage() {
        this.alive = false;
        inventory['raw_fish'] = (inventory['raw_fish'] || 0) + 1;
        showFloatingText('+1 🐟', this.x, this.y - 10, '#87CEEB');
    }
    render(ctx, camX) {
        if (!this.alive) return;
        const dx = this.x - camX;
        ctx.fillStyle = '#A9A9A9';
        ctx.fillRect(dx, this.y, this.width, this.height);
        ctx.fillStyle = '#808080';
        const tailX = this.facing > 0 ? dx - 6 : dx + this.width;
        ctx.fillRect(tailX, this.y + 2, 6, 8);
        ctx.fillStyle = '#000';
        const eyeX = this.facing > 0 ? dx + this.width - 6 : dx + 2;
        ctx.fillRect(eyeX, this.y + 3, 3, 3);
    }
}
// PLACEHOLDER_OCEAN_CREATURES_CONTINUE

class Squid {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.hp = 3; this.maxHp = 3;
        this.width = 28; this.height = 32;
        this.speed = 1.0;
        this.alive = true;
        this.inkCooldown = 0;
        this.swimAngle = Math.random() * Math.PI * 2;
        this.type = 'squid';
    }
    update() {
        if (!this.alive) return;
        this.swimAngle += 0.02;
        this.x += Math.sin(this.swimAngle) * this.speed * 0.3;
        this.y += Math.cos(this.swimAngle * 0.7) * this.speed * 0.2;
        this.y = Math.max(30, Math.min(this.y, groundY - 40));
        if (this.inkCooldown > 0) this.inkCooldown--;
    }
    takeDamage(amount) {
        this.hp -= amount;
        if (this.inkCooldown <= 0) {
            this.sprayInk();
            this.inkCooldown = 300;
        }
        if (this.hp <= 0) {
            this.alive = false;
            score += 10;
            showFloatingText('+10', this.x, this.y - 10, '#FFD700');
        }
    }
    sprayInk() {
        if (typeof gameState === 'undefined') window.gameState = {};
        gameState.inkEffect = { active: true, timer: 120, opacity: 0.9 };
        showFloatingText('🦑 墨汁!', player.x + player.width / 2, player.y - 20, '#333');
    }
    render(ctx, camX) {
        if (!this.alive) return;
        const dx = this.x - camX;
        ctx.fillStyle = '#191970';
        ctx.fillRect(dx, this.y, this.width, this.height - 8);
        ctx.fillStyle = '#1A1A6E';
        for (let i = 0; i < 4; i++) {
            const tx = dx + 2 + i * 7;
            const sway = Math.sin(Date.now() / 400 + i) * 2;
            ctx.fillRect(tx + sway, this.y + this.height - 8, 4, 10);
        }
        ctx.fillStyle = '#FF4444';
        ctx.fillRect(dx + 6, this.y + 8, 5, 5);
        ctx.fillRect(dx + 17, this.y + 8, 5, 5);
    }
}

// 海洋生物生成
function spawnOceanCreatures() {
    if (currentBiome !== 'ocean') return;
    if (oceanCreatures.length > 0) return;
    const codCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < codCount; i++) {
        oceanCreatures.push(new CodFish(
            player.x + (Math.random() - 0.3) * 600,
            100 + Math.random() * (groundY - 200)
        ));
    }
    const squidCount = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < squidCount; i++) {
        oceanCreatures.push(new Squid(
            player.x + (Math.random() - 0.3) * 600,
            80 + Math.random() * (groundY - 180)
        ));
    }
}

// 海洋生物更新
function updateOceanCreatures() {
    if (currentBiome === 'ocean') {
        spawnOceanCreatures();
    } else {
        oceanCreatures = [];
        return;
    }
    oceanCreatures.forEach(c => c.update());
    oceanCreatures = oceanCreatures.filter(c => c.alive);
}

// 海洋生物渲染
function renderOceanCreatures(ctx, camX) {
    oceanCreatures.forEach(c => c.render(ctx, camX));
}

// 墨汁效果渲染
function renderInkEffect(ctx) {
    if (typeof gameState === 'undefined' || !gameState.inkEffect || !gameState.inkEffect.active) return;
    const ink = gameState.inkEffect;
    ink.timer--;
    const progress = ink.timer / 120;
    ctx.fillStyle = `rgba(0, 0, 0, ${ink.opacity * progress})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (ink.timer > 60) {
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('被墨汁喷中!', canvas.width / 2, canvas.height / 2);
        ctx.textAlign = 'left';
    }
    if (ink.timer <= 0) ink.active = false;
}

// ============ 末地粒子 ============
class EndParticle extends Particle {
    constructor(x, y) {
        super(x, y, "end_particle");
        this.reset(x, y);
    }
    reset(x, y) {
        super.reset(x, y);
        this.velX = (Math.random() - 0.5) * 0.3;
        this.velY = -0.3 + Math.random() * 0.6;
        this.size = 2 + Math.random() * 2;
        this.life = 140;
        this.color = Math.random() > 0.5 ? '#CE93D8' : '#7B1FA2';
    }
}

// ============ 末影螨 ============
class Endermite {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.hp = 3; this.maxHp = 3;
        this.width = 16; this.height = 10;
        this.speed = 1.8;
        this.alive = true;
        this.damage = 5;
        this.attackCooldown = 0;
        this.floatAngle = Math.random() * Math.PI * 2;
    }
    update() {
        if (!this.alive) return;
        this.floatAngle += 0.05;
        // 追踪玩家
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 10) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed + Math.sin(this.floatAngle) * 0.5;
        }
        // 攻击
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.attackCooldown <= 0 && rectIntersect(player.x, player.y, player.width, player.height, this.x, this.y, this.width, this.height)) {
            damagePlayer(this.damage, this.x);
            this.attackCooldown = 60;
        }
    }
    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.alive = false;
            score += 8;
            showFloatingText('+8', this.x, this.y - 10, '#CE93D8');
        }
    }
    render(ctx, camX) {
        if (!this.alive) return;
        const dx = this.x - camX;
        // 身体 - 紫色小虫
        ctx.fillStyle = '#4A148C';
        ctx.fillRect(dx, this.y, this.width, this.height);
        // 节段
        ctx.fillStyle = '#7B1FA2';
        ctx.fillRect(dx + 2, this.y + 1, 4, this.height - 2);
        ctx.fillRect(dx + 8, this.y + 1, 4, this.height - 2);
        // 眼睛
        ctx.fillStyle = '#E040FB';
        ctx.fillRect(dx + this.width - 4, this.y + 2, 2, 2);
    }
}

// ============ 潜影贝 ============
class ShulkerTurret {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.hp = 5; this.maxHp = 5;
        this.width = 28; this.height = 28;
        this.alive = true;
        this.isOpen = false;
        this.openTimer = 0;
        this.cycleTimer = 0;
        this.shootCooldown = 0;
        this.projectiles = [];
    }
    update() {
        if (!this.alive) return;
        this.cycleTimer++;
        // 开合循环: 关闭120帧 → 打开180帧
        if (!this.isOpen && this.cycleTimer >= 120) {
            this.isOpen = true;
            this.cycleTimer = 0;
        } else if (this.isOpen && this.cycleTimer >= 180) {
            this.isOpen = false;
            this.cycleTimer = 0;
        }
        // 打开时射击
        if (this.isOpen) {
            this.shootCooldown--;
            if (this.shootCooldown <= 0) {
                this.shoot();
                this.shootCooldown = 60;
            }
        }
        // 更新弹幕
        this.projectiles.forEach(p => {
            const dx = player.x + player.width / 2 - p.x;
            const dy = player.y + player.height / 2 - p.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 5) {
                p.x += (dx / dist) * p.speed;
                p.y += (dy / dist) * p.speed;
            }
            p.life--;
            if (rectIntersect(player.x, player.y, player.width, player.height, p.x - 4, p.y - 4, 8, 8)) {
                damagePlayer(8, p.x);
                p.life = 0;
            }
        });
        this.projectiles = this.projectiles.filter(p => p.life > 0);
    }
    shoot() {
        this.projectiles.push({
            x: this.x + this.width / 2,
            y: this.y,
            speed: 1.5,
            life: 180
        });
    }
    takeDamage(amount) {
        if (!this.isOpen) {
            showFloatingText('🛡️', this.x, this.y - 10, '#9E9E9E');
            return; // 关闭时无敌
        }
        this.hp -= amount;
        if (this.hp <= 0) {
            this.alive = false;
            score += 15;
            showFloatingText('+15', this.x, this.y - 10, '#CE93D8');
        }
    }
    render(ctx, camX) {
        if (!this.alive) return;
        const dx = this.x - camX;
        // 底座
        ctx.fillStyle = '#4A148C';
        ctx.fillRect(dx, this.y + this.height * 0.6, this.width, this.height * 0.4);
        if (this.isOpen) {
            // 打开 - 显示内部
            ctx.fillStyle = '#7B1FA2';
            ctx.fillRect(dx + 2, this.y + 4, this.width - 4, this.height * 0.6);
            // 头部
            ctx.fillStyle = '#E040FB';
            ctx.fillRect(dx + 6, this.y + 8, this.width - 12, 10);
            // 眼睛
            ctx.fillStyle = '#FFF';
            ctx.fillRect(dx + 10, this.y + 10, 3, 3);
            ctx.fillRect(dx + 16, this.y + 10, 3, 3);
        } else {
            // 关闭 - 壳
            ctx.fillStyle = '#6A1B9A';
            ctx.fillRect(dx, this.y, this.width, this.height);
            ctx.fillStyle = '#4A148C';
            ctx.fillRect(dx + 2, this.y + this.height / 2 - 1, this.width - 4, 2);
        }
        // 弹幕
        this.projectiles.forEach(p => {
            ctx.fillStyle = '#E040FB';
            ctx.beginPath();
            ctx.arc(p.x - camX, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(224,64,251,0.3)';
            ctx.beginPath();
            ctx.arc(p.x - camX, p.y, 7, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

// ============ 技能物品实体 ============

// 炸弹类
class Bomb {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.vx = direction * 4;
        this.vy = -6;
        this.width = 16;
        this.height = 16;
        this.life = 90; // 1.5秒后爆炸
        this.exploded = false;
        this.remove = false;
    }
    update() {
        if (this.exploded) return;
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.3; // 重力
        // 地面碰撞
        if (this.y >= groundY - this.height) {
            this.y = groundY - this.height;
            this.vy = 0;
            this.vx *= 0.8;
        }
        this.life--;
        if (this.life <= 0) {
            this.explode();
        }
    }
    explode() {
        this.exploded = true;
        this.remove = true;
        const explosionRadius = 120;

        if (typeof createGroundFire === 'function') {
            createGroundFire(this.x, this.y, 200, 20, 180);
        }

        // 伤害敌人
        enemies.forEach(e => {
            const dist = Math.hypot(e.x - this.x, e.y - this.y);
            if (dist < explosionRadius && typeof e.takeDamage === "function") {
                e.takeDamage(30);
            }
        });
        // 破坏树木
        trees.forEach(t => {
            const dist = Math.hypot(t.x - this.x, t.y - this.y);
            if (dist < explosionRadius) {
                if (typeof t.takeDamage === "function") {
                    t.takeDamage(999);
                } else {
                    t.remove = true;
                }
            }
        });
        // 爆炸粒子
        for (let i = 0; i < 20; i++) {
            particles.push(new ExplosionParticle(this.x, this.y));
        }
        showFloatingText('💥', this.x, this.y - 20, '#FF4500');
    }
    render(ctx, camX) {
        if (this.exploded) return;
        const dx = this.x - camX;
        const flash = Math.floor(this.life / 10) % 2 === 0;
        ctx.fillStyle = flash ? '#FF0000' : '#333';
        ctx.fillRect(dx, this.y, this.width, this.height);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(dx + 6, this.y + 2, 4, 6);
    }
}

// 爆炸粒子
class ExplosionParticle extends Particle {
    constructor(x, y) {
        super(x, y, "explosion");
        this.reset(x, y);
    }
    reset(x, y) {
        super.reset(x, y);
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4;
        this.velX = Math.cos(angle) * speed;
        this.velY = Math.sin(angle) * speed;
        this.size = 3 + Math.random() * 4;
        this.life = 30;
        this.color = Math.random() > 0.5 ? '#FF4500' : '#FFA500';
    }
}

// 蛛网陷阱类
class WebTrap {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 60;
        this.duration = 300; // 5秒
        this.slowFactor = 0.2; // 减速80%
        this.remove = false;
    }
    update() {
        this.duration--;
        if (this.duration <= 0) {
            this.remove = true;
            return;
        }
        // 减速经过的敌人
        enemies.forEach(e => {
            if (rectIntersect(e.x, e.y, e.width, e.height, this.x, this.y, this.width, this.height)) {
                e.webbed = 60; // 标记被蛛网减速
            }
        });
    }
    render(ctx, camX) {
        const dx = this.x - camX;
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = '#DDD';
        ctx.fillRect(dx, this.y, this.width, this.height);
        // 蛛网纹理
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(dx, this.y + i * 15);
            ctx.lineTo(dx + this.width, this.y + i * 15);
            ctx.stroke();
        }
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(dx + i * 20, this.y);
            ctx.lineTo(dx + i * 20, this.y + this.height);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }
}

// 腐肉诱饵类
class FleshBait {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.duration = 180; // 3秒
        this.attractRadius = 200;
        this.remove = false;
    }
    update() {
        this.duration--;
        if (this.duration <= 0) {
            this.remove = true;
            return;
        }
        // 吸引附近敌人
        enemies.forEach(e => {
            const dist = Math.hypot(e.x - this.x, e.y - this.y);
            if (dist < this.attractRadius && dist > 10) {
                const dx = this.x - e.x;
                const dy = this.y - e.y;
                const angle = Math.atan2(dy, dx);
                e.x += Math.cos(angle) * (e.speed || 1) * 1.5;
                e.y += Math.sin(angle) * (e.speed || 1) * 0.5;
            }
        });
    }
    render(ctx, camX) {
        const dx = this.x - camX;
        const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;
        // 腐肉
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(dx - 10, this.y - 10, this.width, this.height);
        // 吸引光环
        ctx.strokeStyle = '#FF6B6B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(dx, this.y, this.attractRadius * (1 - this.duration / 180), 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
}

// 火把类
class Torch {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 12;
        this.height = 30;
        this.duration = 480; // 8秒
        this.lightRadius = 150;
        this.remove = false;
        this.flicker = 0;
    }
    update() {
        this.duration--;
        this.flicker = Math.sin(Date.now() / 100) * 5;
        if (this.duration <= 0) {
            this.remove = true;
        }
    }
    render(ctx, camX) {
        const dx = this.x - camX;
        // 光晕
        const grad = ctx.createRadialGradient(dx, this.y, 0, dx, this.y, this.lightRadius + this.flicker);
        grad.addColorStop(0, 'rgba(255, 200, 100, 0.4)');
        grad.addColorStop(0.5, 'rgba(255, 150, 50, 0.2)');
        grad.addColorStop(1, 'rgba(255, 100, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(dx - this.lightRadius, this.y - this.lightRadius, this.lightRadius * 2, this.lightRadius * 2);
        // 火把杆
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(dx - 3, this.y, 6, this.height);
        // 火焰
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.moveTo(dx, this.y - 10 + this.flicker);
        ctx.lineTo(dx - 6, this.y + 5);
        ctx.lineTo(dx + 6, this.y + 5);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.moveTo(dx, this.y - 5 + this.flicker);
        ctx.lineTo(dx - 3, this.y + 2);
        ctx.lineTo(dx + 3, this.y + 2);
        ctx.closePath();
        ctx.fill();
    }
}

let bombs = [];
let webTraps = [];
let fleshBaits = [];
let torches = [];

// ===== 新增：粒子池机制 =====

/**
 * 粒子池 - 复用粒子对象以提升性能
 */
class ParticlePool {
    constructor(ParticleClass, initialSize = 20) {
        this.ParticleClass = ParticleClass;
        this.pool = [];
        this.active = [];

        // 预创建粒子对象
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(new ParticleClass(0, 0));
        }
    }

    /**
     * 获取粒子（从池中复用或新建）
     */
    get(x, y) {
        let particle;
        if (this.pool.length > 0) {
            particle = this.pool.pop();
            particle.reset(x, y);
        } else {
            particle = new this.ParticleClass(x, y);
        }
        this.active.push(particle);
        return particle;
    }

    /**
     * 回收粒子到池中
     */
    update() {
        this.active = this.active.filter(p => {
            if (p.remove || p.life <= 0) {
                p.remove = false;
                this.pool.push(p);
                return false;
            }
            return true;
        });
    }

    /**
     * 清空所有活跃粒子
     */
    clear() {
        this.pool.push(...this.active);
        this.active = [];
    }
}

// 全局粒子池实例
const particlePools = {
    ember: new ParticlePool(EmberParticle, 30),
    explosion: new ParticlePool(ExplosionParticle, 20),
    sparkle: new ParticlePool(SparkleParticle, 20),
    bubble: new ParticlePool(BubbleParticle, 15),
    dust: new ParticlePool(DustParticle, 15),
    leaf: new ParticlePool(LeafParticle, 15),
    snowflake: new ParticlePool(Snowflake, 15),
    rain: new ParticlePool(RainParticle, 20),
    end: new ParticlePool(EndParticle, 15)
};

/**
 * 获取粒子（优先从池中获取）
 * @param {string} type - 粒子类型
 * @param {number} x - X 坐标
 * @param {number} y - Y 坐标
 * @returns {Particle} 粒子实例
 */
function getPooledParticle(type, x, y) {
    const pool = particlePools[type];
    if (pool) {
        return pool.get(x, y);
    }
    // 降级：直接创建（用于未池化的粒子类型）
    console.warn(`Particle type "${type}" not pooled, creating new instance`);
    return new Particle(x, y, type);
}

/**
 * 更新所有粒子池（回收过期粒子）
 * 应在游戏主循环中调用
 */
function updateParticlePools() {
    for (const key in particlePools) {
        particlePools[key].update();
    }
}

/**
 * 清空所有粒子池
 */
function clearParticlePools() {
    for (const key in particlePools) {
        particlePools[key].clear();
    }
}

