/**
 * 15-entities.js - 碰撞检测与实体类
 * 从 main.js 拆分 (原始行 5754-7075)
 */
function colCheck(shapeA, shapeB) {
    return colCheckRect(shapeA.x, shapeA.y, shapeA.width, shapeA.height, shapeB.x, shapeB.y, shapeB.width, shapeB.height);
}

function colCheckRect(x1, y1, w1, h1, x2, y2, w2, h2) {
    const vX = (x1 + w1 / 2) - (x2 + w2 / 2);
    const vY = (y1 + h1 / 2) - (y2 + h2 / 2);
    const hWidths = w1 / 2 + w2 / 2;
    const hHeights = h1 / 2 + h2 / 2;
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
        const oX = hWidths - Math.abs(vX);
        const oY = hHeights - Math.abs(vY);
        if (oX >= oY || oY < 15) {
            if (vY > 0) return "t";
            return "b";
        }
        if (vX > 0) return "l";
        return "r";
    }
    return null;
}

function rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x2 < x1 + w1 && x2 + w2 > x1 && y2 < y1 + h1 && y2 + h2 > y1;
}

class Entity {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.remove = false;
    }
}

class Platform extends Entity {
    constructor(x, y, w, h, type) {
        super(x, y, w, h);
        this.type = type;
    }
}

class Tree extends Entity {
    constructor(x, y, type) {
        const w = blockSize * 1.6;
        const h = blockSize * 2.8;
        super(x, y - h, w, h);
        this.type = type;
        this.hp = 5;
        this.shake = 0;
    }
    hit() {
        this.hp--;
        this.shake = 8;
        if (this.hp <= 0) {
            this.remove = true;
            dropItem("stick", this.x + this.width / 2, this.y + this.height - blockSize * 0.4);
        }
    }
}

class Chest extends Entity {
    constructor(x, y) {
        const size = blockSize * 0.8;
        super(x, y - size, size, size);
        this.opened = false;
        this.lastClickTime = 0;
        this.pendingArmor = null;
    }
    open() {
        if (this.opened) return;
        this.opened = true;
        const diff = getDifficultyState();
        const lootCfg = getLootConfig();
        const rarity = pickChestRarity(lootCfg.chestRarities, diff.chestRareBoost);
        const lootTable = lootCfg.chestTables[rarity] || lootCfg.chestTables.common || [];
        const baseTwo = Number(lootCfg.chestRolls.twoDropChance ?? 0.45);
        const baseThree = Number(lootCfg.chestRolls.threeDropChance ?? 0.15);
        const rollBonus = Number(diff.chestRollBonus) || 0;
        const twoChance = clamp(baseTwo + rollBonus, 0.1, 0.9);
        const threeChance = clamp(baseThree + rollBonus * 0.6, 0.05, 0.6);
        const rollCount = Math.random() < threeChance ? 3 : Math.random() < twoChance ? 2 : 1;
        const drops = [];
        for (let i = 0; i < rollCount; i++) {
            const picked = pickWeightedLoot(lootTable);
            if (!picked) continue;
            const count = picked.min + Math.floor(Math.random() * (picked.max - picked.min + 1));
            drops.push({ item: picked.item, count });
        }
        drops.forEach(d => {
            if (d.item === "hp") {
                healPlayer(d.count);
                return;
            }
            if (d.item === "max_hp") {
                playerMaxHp = Math.min(10, playerMaxHp + d.count);
                playerHp = Math.min(playerMaxHp, playerHp + d.count);
                updateHpUI();
                return;
            }
            if (d.item === "score") {
                addScore(d.count);
                return;
            }
            if (d.item && d.item.startsWith("armor_")) {
                const armorId = d.item.replace("armor_", "");
                this.pendingArmor = armorId;
                if (typeof addArmorToInventory === "function") addArmorToInventory(armorId);
                const armorName = ARMOR_TYPES[armorId]?.name || armorId;
                showToast(`✨ 获得 ${armorName}，双击宝箱即可装备`);
                return;
            }
            if (!inventory[d.item] && inventory[d.item] !== 0) inventory[d.item] = 0;
            inventory[d.item] += d.count;
        });
        updateHpUI();
        updateInventoryUI();
        const summary = drops.map(d => `${ITEM_ICONS[d.item] || "✨"}x${d.count}`).join(" ");
        const rarityLabel = { common: "普通", rare: "稀有", epic: "史诗", legendary: "传说" }[rarity] || "普通";
        showFloatingText("🎁", this.x + 10, this.y - 30);
        if (summary) showToast(`宝箱(${rarityLabel}): ${summary}`);
        onChestOpened();
    }

    onDoubleClick() {
        if (!this.opened) return;
        if (this.pendingArmor && equipArmor(this.pendingArmor)) {
            this.pendingArmor = null;
            return;
        }
        if (typeof showArmorSelectUI === "function") {
            showArmorSelectUI();
        }
    }
}

class Item extends Entity {
    constructor(x, y, wordObj) {
        const size = blockSize * 0.6;
        super(x, y, size, size);
        this.wordObj = wordObj;
        this.collected = false;
        this.floatY = 0;
    }
}

class WordGate extends Entity {
    constructor(x, y, wordObj) {
        super(x - 30, y - 90, 90, 90);
        this.wordObj = wordObj;
        this.locked = true;
        this.attempts = 0;
        this.cooldown = 0;
    }
}

const decorationPool = Object.create(null);

function getPooledDecoration(type, resetFn, createFn) {
    const pool = decorationPool[type] || (decorationPool[type] = []);
    const reused = pool.find(d => d.remove);
    if (reused) {
        resetFn(reused);
        reused.remove = false;
        return reused;
    }
    const fresh = createFn();
    pool.push(fresh);
    return fresh;
}

function spawnDecoration(type, resetFn, createFn) {
    if (decorations.length >= MAX_DECORATIONS_ONSCREEN) return;
    const decor = getPooledDecoration(type, resetFn, createFn);
    decorations.push(decor);
}

class Decoration extends Entity {
    constructor(x, y, type, biome) {
        super(x, y, 0, 0);
        this.type = type;
        this.biome = biome;
        this.interactive = false;
        this.collectible = false;
        this.harmful = false;
        this.animated = false;
        this.animFrame = 0;
    }

    resetBase(x, y, type, biome) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.biome = biome;
        this.remove = false;
        this.animFrame = 0;
    }

    update() {
        if (this.animated) this.animFrame++;
    }

    interact() {
    }

    onCollision() {
    }
}

class Bush extends Decoration {
    constructor(x, y) {
        super(x, y, "bush", "forest");
        this.reset(x, y);
    }
    reset(x, y) {
        this.resetBase(x, y, "bush", "forest");
        this.width = 30;
        this.height = 20;
        this.variant = Math.floor(Math.random() * 3);
    }
}

class Flower extends Decoration {
    constructor(x, y) {
        super(x, y, "flower", "forest");
        this.reset(x, y);
    }
    reset(x, y) {
        this.resetBase(x, y, "flower", "forest");
        this.width = 12;
        this.height = 18;
        this.collectible = true;
        this.color = ["#FF1744", "#FFEB3B", "#2196F3", "#9C27B0", "#FFFFFF"][Math.floor(Math.random() * 5)];
    }
    interact() {
        inventory.flower = (inventory.flower || 0) + 1;
        this.remove = true;
        showFloatingText("🌸 +1", this.x, this.y);
        updateInventoryUI();
    }
}

class Mushroom extends Decoration {
    constructor(x, y) {
        super(x, y, "mushroom", "forest");
        this.reset(x, y);
    }
    reset(x, y) {
        this.resetBase(x, y, "mushroom", "forest");
        this.width = 16;
        this.height = 20;
        this.collectible = true;
        this.isRed = Math.random() > 0.5;
    }
    interact() {
        inventory.mushroom = (inventory.mushroom || 0) + 1;
        this.remove = true;
        showFloatingText("🍄 +1", this.x, this.y);
        updateInventoryUI();
    }
}

class Vine extends Decoration {
    constructor(x, y, height) {
        super(x, y, "vine", "forest");
        this.reset(x, y, height);
    }
    reset(x, y, height) {
        this.resetBase(x, y, "vine", "forest");
        this.width = 4;
        this.height = height || (30 + Math.random() * 40);
        this.animated = true;
        this.swayOffset = Math.random() * Math.PI * 2;
    }
}

class IceSpike extends Decoration {
    constructor(x, y) {
        super(x, y, "ice_spike", "snow");
        this.reset(x, y);
    }
    reset(x, y) {
        this.resetBase(x, y, "ice_spike", "snow");
        this.width = 20;
        this.height = 40 + Math.random() * 40;
    }
}

class SnowPile extends Decoration {
    constructor(x, y, size = "medium") {
        super(x, y, "snow_pile", "snow");
        this.reset(x, y, size);
    }
    reset(x, y, size = "medium") {
        this.resetBase(x, y, "snow_pile", "snow");
        this.size = size;
        this.width = size === "small" ? 20 : size === "medium" ? 35 : 50;
        this.height = size === "small" ? 10 : size === "medium" ? 18 : 25;
        this.interactive = true;
    }
    onCollision(entity) {
        if (entity === player && entity.grounded) {
            entity.velX *= 0.9;
        }
    }
}

class IceBlock extends Decoration {
    constructor(x, y, width) {
        super(x, y, "ice_block", "snow");
        this.reset(x, y, width);
    }
    reset(x, y, width) {
        this.resetBase(x, y, "ice_block", "snow");
        this.width = width || 80;
        this.height = 50;
        this.interactive = true;
        this.slippery = true;
    }
    onCollision(entity) {
        if (this.slippery && entity.grounded) {
            entity.velX *= 1.2;
        }
    }
}

class DeadBush extends Decoration {
    constructor(x, y) {
        super(x, y, "dead_bush", "desert");
        this.reset(x, y);
    }
    reset(x, y) {
        this.resetBase(x, y, "dead_bush", "desert");
        this.width = 25;
        this.height = 30;
    }
}

class Rock extends Decoration {
    constructor(x, y, size = "medium") {
        super(x, y, "rock", "desert");
        this.reset(x, y, size);
    }
    reset(x, y, size = "medium") {
        this.resetBase(x, y, "rock", "desert");
        this.size = size;
        this.width = size === "small" ? 20 : size === "medium" ? 35 : 50;
        this.height = size === "small" ? 15 : size === "medium" ? 25 : 35;
        this.shape = Math.floor(Math.random() * 3);
    }
}

class BoneDecor extends Decoration {
    constructor(x, y) {
        super(x, y, "bones", "desert");
        this.reset(x, y);
    }
    reset(x, y) {
        this.resetBase(x, y, "bones", "desert");
        this.width = 30;
        this.height = 12;
    }
}

class CactusDecor extends Decoration {
    constructor(x, y, height) {
        super(x, y, "cactus", "desert");
        this.reset(x, y, height);
    }
    reset(x, y, height) {
        this.resetBase(x, y, "cactus", "desert");
        this.width = 20;
        this.height = height || (40 + Math.random() * 60);
        this.harmful = true;
        this.damage = 5;
    }
    onCollision(entity) {
        if (this.harmful && rectIntersect(entity.x, entity.y, entity.width, entity.height, this.x, this.y, this.width, this.height)) {
            damagePlayer(this.damage, this.x, 40);
            showFloatingText("🌵 -5", entity.x, entity.y - 20);
        }
    }
}

class Ore extends Decoration {
    constructor(x, y, oreType) {
        super(x, y, `ore_${oreType}`, "mountain");
        this.reset(x, y, oreType);
    }
    reset(x, y, oreType) {
        this.resetBase(x, y, `ore_${oreType}`, "mountain");
        this.oreType = oreType;
        this.width = 30;
        this.height = 30;
        this.collectible = true;
        this.hp = { coal: 3, iron: 5, gold: 7, diamond: 10 }[oreType];
        this.color = { coal: "#424242", iron: "#B0BEC5", gold: "#FFD700", diamond: "#00BCD4" }[oreType];
    }
    interact() {
        if (inventory.iron_pickaxe <= 0) {
            showToast("❌ 需要铁镐");
            return;
        }
        this.hp--;
        showFloatingText(`⛏️ ${this.hp}`, this.x, this.y - 20);
        if (this.hp <= 0) {
            inventory[this.oreType] = (inventory[this.oreType] || 0) + 1;
            this.remove = true;
            showFloatingText(`✨ +1 ${this.oreType}`, this.x, this.y);
            updateInventoryUI();
        }
    }
}

class Stalactite extends Decoration {
    constructor(x, y, direction = "down") {
        super(x, y, "stalactite", "mountain");
        this.reset(x, y, direction);
    }
    reset(x, y, direction = "down") {
        this.resetBase(x, y, "stalactite", "mountain");
        this.direction = direction;
        this.width = 20;
        this.height = 30 + Math.random() * 40;
    }
}

class Crystal extends Decoration {
    constructor(x, y) {
        super(x, y, "crystal", "mountain");
        this.reset(x, y);
    }
    reset(x, y) {
        this.resetBase(x, y, "crystal", "mountain");
        this.width = 18;
        this.height = 28;
        this.animated = true;
    }
}

class LavaPool extends Decoration {
    constructor(x, y, width, biome = "mountain") {
        super(x, y, "lava_pool", biome);
        this.reset(x, y, width, biome);
    }
    reset(x, y, width, biome = "mountain") {
        this.resetBase(x, y, "lava_pool", biome);
        this.width = width || (60 + Math.random() * 80);
        this.height = 16;
        this.harmful = true;
        this.damage = 2;
        this.animated = true;
    }
    onCollision() {
        damagePlayer(this.damage, this.x, 30);
    }
}

class Shell extends Decoration {
    constructor(x, y) {
        super(x, y, "shell", "ocean");
        this.reset(x, y);
    }
    reset(x, y) {
        this.resetBase(x, y, "shell", "ocean");
        this.width = 16;
        this.height = 10;
        this.collectible = true;
    }
    interact() {
        inventory.shell = (inventory.shell || 0) + 1;
        this.remove = true;
        showFloatingText("🐚 +1", this.x, this.y);
        updateInventoryUI();
    }
}

class Starfish extends Decoration {
    constructor(x, y) {
        super(x, y, "starfish", "ocean");
        this.reset(x, y);
    }
    reset(x, y) {
        this.resetBase(x, y, "starfish", "ocean");
        this.width = 18;
        this.height = 18;
        this.collectible = true;
    }
    interact() {
        inventory.starfish = (inventory.starfish || 0) + 1;
        this.remove = true;
        showFloatingText("⭐ +1", this.x, this.y);
        updateInventoryUI();
    }
}

class Seaweed extends Decoration {
    constructor(x, y) {
        super(x, y, "seaweed", "ocean");
        this.reset(x, y);
    }
    reset(x, y) {
        this.resetBase(x, y, "seaweed", "ocean");
        this.width = 10;
        this.height = 30 + Math.random() * 20;
        this.animated = true;
        this.swayOffset = Math.random() * Math.PI * 2;
    }
}

class BoatDecor extends Decoration {
    constructor(x, y) {
        super(x, y, "boat", "ocean");
        this.reset(x, y);
    }
    reset(x, y) {
        this.resetBase(x, y, "boat", "ocean");
        this.width = 40;
        this.height = 16;
    }
}

class FireDecor extends Decoration {
    constructor(x, y) {
        super(x, y, "fire", "nether");
        this.reset(x, y);
    }
    reset(x, y) {
        this.resetBase(x, y, "fire", "nether");
        this.width = 12;
        this.height = 24;
        this.harmful = true;
        this.damage = 2;
        this.animated = true;
    }
    onCollision() {
        damagePlayer(this.damage, this.x, 20);
    }
}

class LavaFall extends Decoration {
    constructor(x, y) {
        super(x, y, "lava_fall", "nether");
        this.reset(x, y);
    }
    reset(x, y) {
        this.resetBase(x, y, "lava_fall", "nether");
        this.width = 12;
        this.height = 60 + Math.random() * 60;
        this.harmful = true;
        this.damage = 3;
        this.animated = true;
    }
    onCollision() {
        damagePlayer(this.damage, this.x, 20);
    }
}

class SoulSand extends Decoration {
    constructor(x, y, width) {
        super(x, y, "soul_sand", "nether");
        this.reset(x, y, width);
    }
    reset(x, y, width) {
        this.resetBase(x, y, "soul_sand", "nether");
        this.width = width || 50;
        this.height = 10;
        this.interactive = true;
    }
    onCollision(entity) {
        if (entity === player && entity.grounded) {
            entity.velX *= 0.8;
        }
    }
}

class NetherWart extends Decoration {
    constructor(x, y) {
        super(x, y, "nether_wart", "nether");
        this.reset(x, y);
    }
    reset(x, y) {
        this.resetBase(x, y, "nether_wart", "nether");
        this.width = 12;
        this.height = 10;
    }
}

class Basalt extends Decoration {
    constructor(x, y) {
        super(x, y, "basalt", "nether");
        this.reset(x, y);
    }
    reset(x, y) {
        this.resetBase(x, y, "basalt", "nether");
        this.width = 25;
        this.height = 40;
    }
}

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

class Projectile extends Entity {
    constructor(x, y, targetX, targetY, speed = 3, faction = "enemy") {
        super(x, y, 8 * worldScale.unit, 8 * worldScale.unit);
        const angle = Math.atan2(targetY - y, targetX - x);
        const scaledSpeed = speed * worldScale.unit;
        this.velX = Math.cos(angle) * scaledSpeed;
        this.velY = Math.sin(angle) * scaledSpeed;
        this.lifetime = 180;
        this.damage = 12;
        this.faction = faction;
    }

    reset(x, y, targetX, targetY, speed) {
        this.x = x;
        this.y = y;
        const angle = Math.atan2(targetY - y, targetX - x);
        const scaledSpeed = speed * worldScale.unit;
        this.velX = Math.cos(angle) * scaledSpeed;
        this.velY = Math.sin(angle) * scaledSpeed;
        this.lifetime = 180;
        this.remove = false;
    }

    update(playerRef, golemList, enemyList) {
        this.x += this.velX;
        this.y += this.velY;
        this.lifetime--;

        if (this.faction === "enemy") {
            if (rectIntersect(this.x, this.y, this.width, this.height, playerRef.x, playerRef.y, playerRef.width, playerRef.height)) {
                damagePlayer(this.damage, this.x);
                this.remove = true;
                return;
            }
            for (const g of golemList) {
                if (rectIntersect(this.x, this.y, this.width, this.height, g.x, g.y, g.width, g.height)) {
                    g.takeDamage(this.damage);
                    this.remove = true;
                    return;
                }
            }
        } else if (this.faction === "golem") {
            for (const e of enemyList) {
                if (!e.remove && rectIntersect(this.x, this.y, this.width, this.height, e.x, e.y, e.width, e.height)) {
                    e.takeDamage(this.damage);
                    showFloatingText(`⚔️ ${this.damage}`, e.x, e.y - 10);
                    this.remove = true;
                    return;
                }
            }
        } else if (this.faction === "player") {
            for (const e of enemyList) {
                if (!e.remove && rectIntersect(this.x, this.y, this.width, this.height, e.x, e.y, e.width, e.height)) {
                    e.takeDamage(this.damage);
                    showFloatingText(`-${this.damage}`, e.x, e.y - 10);
                    this.remove = true;
                    return;
                }
            }
        }

        if (this.lifetime <= 0) this.remove = true;
    }
}

class Arrow extends Projectile {
    constructor(x, y, targetX, targetY, faction = "enemy", speed = 4, damage = 12) {
        super(x, y, targetX, targetY, speed, faction);
        this.damage = damage;
        this.width = 12;
        this.height = 4;
    }
}

class Snowball extends Projectile {
    constructor(x, y, targetX, targetY) {
        super(x, y, targetX, targetY, 3, "golem");
        this.damage = 8;
    }
}

class DragonFireball extends Projectile {
    constructor(x, y, targetX, targetY) {
        super(x, y, targetX, targetY, 2, "enemy");
        this.damage = 30;
        this.width = 16;
        this.height = 16;
    }
}

class Enemy extends Entity {
    constructor(x, y, type = "zombie", range = 120) {
        const stats = ENEMY_STATS[type] || ENEMY_STATS.zombie;
        const size = stats.size || { w: 32, h: 32 };
        const diff = getDifficultyState();
        super(x, y, size.w, size.h);
        this.type = type;
        this.startX = x;
        this.startY = y;
        this.range = range;
        this.hp = Math.max(1, Math.round(stats.hp * diff.enemyHpMult));
        this.maxHp = this.hp;
        this.speed = stats.speed;
        this.damage = Math.max(1, Math.round(stats.damage * diff.enemyDamageMult));
        this.attackType = stats.attackType;
        this.color = stats.color;
        this.drops = stats.drops || [];
        this.scoreValue = Math.max(1, Math.round((stats.scoreValue || gameConfig.scoring.enemy) * diff.scoreMultiplier));
        this.dir = 1;
        this.state = "patrol";
        this.attackCooldown = 0;
        this.explodeTimer = 0;
        this.teleportCooldown = 0;
        this.phaseChanged = false;
        this.velY = 0;
        this.grounded = false;
    }

    takeDamage(amount) {
        this.hp -= amount;
        playHitSfx(Math.min(1, Math.max(0.2, amount / 20)));
        if (this.hp <= 0) this.die();
    }

    die() {
        this.remove = true;
        this.y = 1000;
        if (Math.random() < 0.6 && this.drops.length) {
            const drop = this.drops[Math.floor(Math.random() * this.drops.length)];
            dropItem(drop, this.x, this.y);
        }
        addScore(this.scoreValue);
        recordEnemyKill(this.type);
    }

    update(playerRef) {
        if (this.remove || this.y > 900) return;
        switch (this.type) {
            case "zombie":
                this.updateZombie(playerRef);
                break;
            case "spider":
                this.updateSpider(playerRef);
                break;
            case "creeper":
                this.updateCreeper(playerRef);
                break;
            case "skeleton":
                this.updateSkeleton(playerRef);
                break;
            case "enderman":
                this.updateEnderman(playerRef);
                break;
            case "ender_dragon":
                this.updateEnderDragon(playerRef);
                break;
            default:
                this.updateBasic();
        }

        this.applyGravity();
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.teleportCooldown > 0) this.teleportCooldown--;
    }

    applyGravity() {
        if (this.type === "ender_dragon") return;
        this.velY += gameConfig.physics.gravity;
        this.y += this.velY;
        this.grounded = false;

        for (const p of platforms) {
            const dir = colCheck(this, p);
            if (dir === "b") {
                this.grounded = true;
                this.y = p.y - this.height;
                this.velY = 0;
            } else if (dir === "t") {
                this.velY = 0;
            }
        }

        if (this.y > fallResetY) {
            this.remove = true;
        }
    }

    updateBasic() {
        this.x += this.speed * this.dir;
        if (this.x > this.startX + this.range || this.x < this.startX) this.dir *= -1;
    }

    updateZombie(playerRef) {
        const dist = Math.abs(this.x - playerRef.x);
        if (dist < 200) {
            this.state = "chase";
            this.x += (playerRef.x > this.x ? 1 : -1) * this.speed;
        } else {
            this.state = "patrol";
            this.updateBasic();
        }
    }

    updateSpider(playerRef) {
        const dist = Math.abs(this.x - playerRef.x);
        if (dist < 240) {
            this.state = "chase";
            this.x += (playerRef.x > this.x ? 1 : -1) * this.speed;
        } else {
            this.state = "patrol";
            this.updateBasic();
        }
    }

    updateCreeper(playerRef) {
        const dist = Math.abs(this.x - playerRef.x);
        if (dist < 60) {
            this.state = "exploding";
            if (this.explodeTimer === 0) this.explodeTimer = 90;
            this.explodeTimer--;
            if (this.explodeTimer <= 0) {
                if (Math.abs(this.x - playerRef.x) < 120 && Math.abs(this.y - playerRef.y) < 120) {
                    damagePlayer(this.damage, this.x);
                    showFloatingText("💥 爆炸!", this.x, this.y);
                }
                this.die();
            }
        } else if (dist < 200) {
            this.state = "chase";
            this.x += (playerRef.x > this.x ? 1 : -1) * this.speed;
            this.explodeTimer = 0;
        } else {
            this.state = "patrol";
            this.explodeTimer = 0;
            this.updateBasic();
        }
    }

    updateSkeleton(playerRef) {
        const dist = Math.abs(this.x - playerRef.x);
        if (dist < 80) {
            this.x += (playerRef.x > this.x ? -1 : 1) * this.speed;
        } else if (dist > 150 && dist < 300) {
            this.x += (playerRef.x > this.x ? 1 : -1) * this.speed;
        }

        if (this.attackCooldown === 0 && dist < 260) {
            const arrow = projectilePool.getArrow(this.x, this.y, playerRef.x, playerRef.y);
            if (!projectiles.includes(arrow)) projectiles.push(arrow);
            this.attackCooldown = 120;
        }
    }

    updateEnderman(playerRef) {
        const dist = Math.abs(this.x - playerRef.x);
        if (dist > 300 && this.teleportCooldown === 0 && Math.random() < 0.02) {
            this.x = playerRef.x + (Math.random() > 0.5 ? 120 : -120);
            this.y = playerRef.y;
            this.teleportCooldown = 180;
            showFloatingText("⚡", this.x, this.y);
        } else if (dist < 150) {
            this.x += (playerRef.x > this.x ? 1 : -1) * this.speed;
        } else {
            this.updateBasic();
        }
    }

    updateEnderDragon(playerRef) {
        const phase = this.hp > this.maxHp * 0.5 ? 1 : 2;
        if (phase === 2 && !this.phaseChanged) {
            this.phaseChanged = true;
            this.speed *= 1.5;
            showToast("⚠️ 末影龙进入狂暴状态！");
        }

        this.x += this.speed * this.dir;
        this.y = 100 + Math.sin(gameFrame * 0.02) * 50;
        if (this.x > this.startX + 400 || this.x < this.startX - 200) this.dir *= -1;

        if (this.attackCooldown === 0 && Math.random() < 0.02) {
            const fireball = projectilePool.getFireball(this.x + 40, this.y + 20, playerRef.x, playerRef.y);
            if (!projectiles.includes(fireball)) projectiles.push(fireball);
            this.attackCooldown = phase === 1 ? 120 : 60;
        }

        if (phase === 2 && Math.random() < 0.005) {
            this.state = "diving";
            this.targetDiveY = 400;
        }

        if (this.state === "diving") {
            this.y += 5;
            if (this.y >= this.targetDiveY) {
                this.state = "patrol";
                if (Math.abs(this.x - playerRef.x) < 150) {
                    damagePlayer(this.damage, this.x, 150);
                    showFloatingText("💥 龙息冲击!", playerRef.x, playerRef.y);
                }
            }
        }
    }
}

class Golem extends Entity {
    constructor(x, y, type = "iron") {
        const sizeScale = worldScale.unit;
        super(x, y, type === "iron" ? 40 * sizeScale : 32 * sizeScale, type === "iron" ? 48 * sizeScale : 40 * sizeScale);
        const config = getGolemConfig();
        const stats = type === "iron" ? config.ironGolem : config.snowGolem;
        this.type = type;
        this.hp = stats.hp;
        this.maxHp = stats.hp;
        this.damage = stats.damage;
        this.speed = stats.speed;
        this.followDelay = 30;
        this.attackCooldown = 0;
        this.attackRange = (type === "iron" ? 80 : 120) * sizeScale;
        this.velX = 0;
        this.velY = 0;
        this.grounded = false;
        this.facingRight = true;
        this.stuckCounter = 0;
        this.lastX = x;
    }

    updateFollow(playerHistory, platformsRef, playerRef) {
        if (playerHistory.length < this.followDelay) return;
        const target = playerHistory[playerHistory.length - this.followDelay];
        const dx = target.x - this.x;
        if (Math.abs(dx) > 30 * worldScale.unit) {
            this.velX = Math.sign(dx) * this.speed;
            this.facingRight = dx > 0;
        } else {
            this.velX *= 0.8;
        }
        if (this.grounded && this.shouldJump(playerRef, platformsRef)) {
            this.velY = -10 * worldScale.unit;
        }
    }

    shouldJump(playerRef, platformsRef) {
        if (this.detectObstacle(platformsRef)) return true;
        if (this.detectGap(platformsRef)) return true;
        return this.shouldMirrorPlayerJump(playerRef);
    }

    detectObstacle(platformsRef) {
        if (!platformsRef || !platformsRef.length) return false;
        const unit = worldScale?.unit || 1;
        const offset = 5 * unit;
        const checkX = this.facingRight ? this.x + this.width + offset : this.x - offset;
        const checkY = this.y + this.height;
        return platformsRef.some(p => {
            const withinY = p.y < checkY && p.y > this.y - 40 * unit;
            return withinY && checkX >= p.x && checkX <= p.x + p.width;
        });
    }

    detectGap(platformsRef) {
        if (!platformsRef || !platformsRef.length) return false;
        if (this.hasGroundAhead(platformsRef)) return false;
        return this.findLandingPlatform(platformsRef);
    }

    hasGroundAhead(platformsRef) {
        if (!platformsRef || !platformsRef.length) return false;
        const unit = worldScale?.unit || 1;
        const lookX = this.facingRight ? this.x + this.width + 10 * unit : this.x - 10 * unit;
        const feetY = this.y + this.height;
        return platformsRef.some(p => {
            const withinY = p.y >= feetY - 4 * unit && p.y <= feetY + 12 * unit;
            return withinY && lookX >= p.x && lookX <= p.x + p.width;
        });
    }

    findLandingPlatform(platformsRef) {
        if (!platformsRef || !platformsRef.length) return false;
        const unit = worldScale?.unit || 1;
        const offset = 20 * unit;
        const lookRange = 160 * unit;
        const start = this.facingRight ? this.x + this.width + offset : this.x - offset;
        const end = this.facingRight ? start + lookRange : start - lookRange;
        const minX = Math.min(start, end);
        const maxX = Math.max(start, end);
        for (const p of platformsRef) {
            if (p.x + p.width < minX || p.x > maxX) continue;
            if (p.y < this.y - 120 * unit || p.y > this.y + 60 * unit) continue;
            return true;
        }
        return false;
    }

    shouldMirrorPlayerJump(playerRef) {
        if (!playerRef) return false;
        const unit = worldScale?.unit || 1;
        const horizontalGap = Math.abs(playerRef.x - this.x);
        return horizontalGap < 150 * unit && playerRef.velY < -2 && !playerRef.grounded;
    }

    checkFallRecovery(playerRef) {
        if (!playerRef) return false;
        const unit = worldScale?.unit || 1;
        const verticalGap = this.y - playerRef.y;
        const threshold = 280 * unit;
        if (this.y > fallResetY + 80 || verticalGap > threshold) {
            const offset = (Math.random() > 0.5 ? -1 : 1) * 80 * unit;
            this.x = playerRef.x + offset;
            this.y = playerRef.y - 10 * unit;
            this.velX = 0;
            this.velY = 0;
            this.grounded = false;
            this.stuckCounter = 0;
            this.lastX = this.x;
            return true;
        }
        return false;
    }

    updateAttack(enemyList) {
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
            return;
        }
        let nearest = null;
        let minDist = this.attackRange;
        for (const e of enemyList) {
            if (e.remove || e.y > canvas.height + blockSize * 4) continue;
            const dist = Math.abs(this.x - e.x);
            const vertDist = Math.abs(this.y - e.y);
            if (dist < minDist && vertDist < blockSize * 2) {
                nearest = e;
                minDist = dist;
            }
        }
        if (nearest) {
            if (this.type === "snow") {
                const snowball = projectilePool.getSnowball(this.x + this.width / 2, this.y + this.height / 2, nearest.x, nearest.y);
                if (!projectiles.includes(snowball)) projectiles.push(snowball);
            } else {
                nearest.takeDamage(this.damage);
            }
            this.attackCooldown = 60;
            showFloatingText(`⚔️ ${this.damage}`, nearest.x, nearest.y - 20);
        }
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.remove = true;
            if (Math.random() < 0.5) {
                const dropType = this.type === "iron" ? "iron" : "pumpkin";
                dropItem(dropType, this.x, this.y);
            }
        }
    }

    update(playerRef, playerHistory, enemyList, platformsRef) {
        this.updateFollow(playerHistory, platformsRef, playerRef);
        this.velY += gameConfig.physics.gravity;
        this.grounded = false;

        for (const p of platformsRef) {
            const dir = colCheck(this, p);
            if (dir === "l" || dir === "r") this.velX = 0;
            else if (dir === "b") {
                this.grounded = true;
                this.y = p.y - this.height;
                this.velY = 0;
            } else if (dir === "t") {
                this.velY = 0;
            }
        }

        this.updateAttack(enemyList);

        this.x += this.velX;
        this.y += this.velY;

        const recovered = this.checkFallRecovery(playerRef);
        if (!recovered && this.y > fallResetY) this.remove = true;

        if (Math.abs(this.x - this.lastX) < 0.2) this.stuckCounter++;
        else this.stuckCounter = 0;
        this.lastX = this.x;

        if (this.stuckCounter > 180 && playerRef) {
            this.x = playerRef.x + (Math.random() > 0.5 ? 50 : -50);
            this.y = playerRef.y;
            this.stuckCounter = 0;
        }
    }
}
