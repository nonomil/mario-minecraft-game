/**
 * 15-entities-base.js - 碰撞检测与基础实体类
 * 从 15-entities.js 拆分
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
        // 垂直重叠较小时优先判断为垂直碰撞（站在平台边缘不会被当成撞墙）
        if (oX >= oY || oY < 8) {
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
        this.fragile = false;
        this.stepCount = 0;
        this.maxSteps = 3;
        this.breaking = false;
        this.breakTimer = 0;
    }

    makeFragile(maxSteps = 3) {
        this.fragile = true;
        this.stepCount = 0;
        this.maxSteps = Math.max(1, Number(maxSteps) || 3);
        this.breaking = false;
        this.breakTimer = 0;
        return this;
    }

    onPlayerStep() {
        if (!this.fragile || this.breaking || this.remove) return;
        this.stepCount++;
        if (this.stepCount >= this.maxSteps) {
            this.breaking = true;
            this.breakTimer = 0;
        }
    }

    updateFragile() {
        if (!this.fragile || !this.breaking || this.remove) return;
        this.breakTimer++;
        // Break after a short warning window.
        if (this.breakTimer > 30) {
            this.remove = true;
            if (typeof triggerGravityCheck === "function") {
                triggerGravityCheck(this.x, this.x + this.width, this.y);
            }
        }
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
        this.velY = 0;
        this.falling = false;
    }
    open() {
        if (this.opened) return;
        if (this.falling) return;
        this.opened = true;
        const diff = getDifficultyState();
        const lootCfg = getLootConfig();

        // 幸运星效果：提升稀有度
        let rarityBoost = diff.chestRareBoost;
        if (typeof gameState !== 'undefined' && gameState.luckyStarActive) {
            rarityBoost += 0.5; // 提升稀有度
        }

        const rarity = pickChestRarity(lootCfg.chestRarities, rarityBoost);
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
        // 新需求：若本次宝箱掉出南瓜，则同箱补齐雪块材料（2个）
        const hasPumpkinDrop = drops.some(d => d.item === "pumpkin" && d.count > 0);
        if (hasPumpkinDrop) {
            drops.push({ item: "snow_block", count: 2 });
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
            if (d.item === "word_card") {
                const learnedWord = typeof pickWordForSpawn === "function" ? pickWordForSpawn() : null;
                addScore(d.count);
                if (learnedWord && learnedWord.en) {
                    const zh = learnedWord.zh ? ` (${learnedWord.zh})` : "";
                    showFloatingText(`📘 ${learnedWord.en}${zh} +${d.count}`, this.x, this.y - 20, "#7FB3FF");
                    if (typeof speakWord === "function") speakWord(learnedWord);
                } else {
                    showFloatingText(`📘 +${d.count}`, this.x, this.y - 20, "#7FB3FF");
                }
                return;
            }
            if (d.item === "empty") {
                showToast("宝箱是空的");
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
        this.velY = 0;
        this.falling = false;
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
