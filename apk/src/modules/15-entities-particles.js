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
    },
    ender_dragon: {
        hp: 200,
        speed: 1.5,
        damage: 30,
        attackType: "boss",
        color: "#000000",
        drops: ["dragon_egg"],
        scoreValue: 200,
        size: { w: 120, h: 60 }
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
