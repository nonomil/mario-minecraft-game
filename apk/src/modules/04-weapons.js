/**
 * 04-weapons.js - 武器与战斗系统
 * 从 main.js 拆分 (原始行 826-965)
 */
function getArrowCount() {
    return Number(inventory.arrow) || 0;
}

let lastNoArrowToastFrame = -9999;

function showNoArrowToast() {
    const frame = Number(gameFrame) || 0;
    if (frame - lastNoArrowToastFrame < 45) return;
    lastNoArrowToastFrame = frame;
    showToast("❌ 没有箭！");
}

function unlockWeapon(id) {
    if (!WEAPONS[id]) return false;
    if (playerWeapons.unlocked.includes(id)) return false;
    playerWeapons.unlocked.push(id);
    showToast(`🎉 解锁武器: ${WEAPONS[id].emoji} ${WEAPONS[id].name}`);
    updateWeaponUI();
    return true;
}

function syncWeaponsFromInventory() {
    if ((inventory.stone_sword || 0) > 0) unlockWeapon("sword");
    if ((inventory.iron_pickaxe || 0) > 0) unlockWeapon("axe");
    if ((inventory.iron_pickaxe || 0) > 0) unlockWeapon("pickaxe");
    if ((inventory.bow || 0) > 0) unlockWeapon("bow");
}

function switchWeapon() {
    if (typeof isBossWeaponLockActive === "function" && isBossWeaponLockActive()) {
        showToast("⚔️ BOSS战期间仅可使用剑");
        return;
    }
    const list = playerWeapons.unlocked;
    if (!list.length) return;
    if (list.length === 1) {
        showToast("⚠️ 只有一种武器");
        return;
    }
    const idx = list.indexOf(playerWeapons.current);
    const nextIdx = idx >= 0 ? (idx + 1) % list.length : 0;
    playerWeapons.current = list[nextIdx];
    playerWeapons.attackCooldown = 0;
    playerWeapons.isCharging = false;
    playerWeapons.chargeTime = 0;
    const weapon = WEAPONS[playerWeapons.current];
    showToast(`⚔️ ${weapon.emoji} ${weapon.name}`);
    updateWeaponUI();
}

function updateWeaponUI() {
    updateEquipStatus();
}

function updateEquipStatus() {
    const el = document.getElementById("equip-status");
    if (!el) return;
    const weapon = WEAPONS[playerWeapons.current] || WEAPONS.sword;
    const arrows = getArrowCount();
    const arrowText = weapon.type === "ranged" ? ` 🏹${arrows}` : "";
    el.innerText = `${weapon.emoji}${weapon.name}${arrowText}`;
    el.classList.remove("hud-box-active");
}

function startBowCharge() {
    const weapon = WEAPONS.bow;
    if (playerWeapons.attackCooldown > 0) return;
    if (getArrowCount() <= 0) {
        showNoArrowToast();
        return;
    }
    playerWeapons.isCharging = true;
    playerWeapons.chargeTime = 0;
}

function releaseBowShot(forceCharge = null) {
    const weapon = WEAPONS.bow;
    if (playerWeapons.attackCooldown > 0) return;
    if (getArrowCount() <= 0) {
        showNoArrowToast();
        return;
    }
    const ratio = forceCharge != null ? forceCharge : Math.min(1, playerWeapons.chargeTime / weapon.chargeMax);
    const charge = clamp(ratio, 0.2, 1);
    const dir = player.facingRight ? 1 : -1;
    const startX = player.facingRight ? player.x + player.width : player.x;
    const startY = player.y + player.height * 0.4;
    const targetX = startX + dir * weapon.range;
    const targetY = startY - 20 * charge;
    const speed = 4 + charge * 4;
    const damage = Math.round(weapon.damage * (0.6 + charge * 0.9));
    const arrow = new Arrow(startX, startY, targetX, targetY, "player", speed, damage);
    projectiles.push(arrow);
    inventory.arrow = Math.max(0, (inventory.arrow || 0) - 1);
    updateInventoryUI();
    playerWeapons.attackCooldown = weapon.cooldown;
    playerWeapons.isCharging = false;
    playerWeapons.chargeTime = 0;
}

// 挖掘碎片粒子
function emitDigParticles(x, y, type) {
    const colors = {
        grass: ["#5d4037", "#4CAF50"], snow: ["#1e3f66", "#fff"],
        stone: ["#757575", "#424242"], sand: ["#FDD835", "#E6C02E"],
        netherrack: ["#5E1B1B", "#8B0000"], end_stone: ["#D4C99E", "#BDB76B"]
    };
    const palette = colors[type] || colors.grass;
    for (let i = 0; i < 8; i++) {
        const px = x + Math.random() * blockSize;
        const py = y + Math.random() * blockSize * 0.5;
        const c = palette[Math.floor(Math.random() * palette.length)];
        const p = {
            x: px, y: py, size: 3 + Math.random() * 4,
            velX: (Math.random() - 0.5) * 4, velY: -1 - Math.random() * 3,
            color: c, life: 1, remove: false,
            type: "dig_debris",
            update() {
                this.x += this.velX;
                this.y += this.velY;
                this.velY += 0.15;
                this.life -= 0.025;
                if (this.life <= 0) this.remove = true;
            }
        };
        particles.push(p);
    }
}

function digGroundBlock() {
    const weapon = WEAPONS.pickaxe;
    const dir = player.facingRight ? 1 : -1;
    const reachX = player.x + (dir > 0 ? player.width + 10 : -10);
    const playerBottom = player.y + player.height;
    const playerCenterY = player.y + player.height / 2;

    // 1. 优先找玩家接触的平台（脚下站着的、或面前碰到的）
    let target = null;
    let bestPriority = Infinity;
    for (let i = 0; i < platforms.length; i++) {
        const p = platforms[i];
        if (p.remove) continue;
        // 检查平台是否在挖掘方向上
        const pRight = p.x + p.width;
        // 玩家脚下的平台（站着的）
        const standingOn = Math.abs(playerBottom - p.y) < 6 &&
            player.x + player.width > p.x && player.x < pRight;
        // 面前方向的平台
        const inFront = reachX >= p.x && reachX < pRight &&
            Math.abs(p.y - playerCenterY) < blockSize * 2.5;
        if (!standingOn && !inFront) continue;
        // 优先级：面前接触的 > 脚下的，非地面 > 地面
        let priority = 10;
        if (inFront && p.y !== groundY) priority = 0;      // 面前悬浮方块最优先
        else if (standingOn && p.y !== groundY) priority = 1; // 脚下悬浮方块
        else if (inFront) priority = 2;                      // 面前地面
        else if (standingOn) priority = 3;                    // 脚下地面
        if (priority < bestPriority) {
            bestPriority = priority;
            target = { idx: i, platform: p };
        }
    }

    if (!target) {
        playerWeapons.attackCooldown = weapon.cooldown;
        return;
    }

    const p = target.platform;
    const floorToBlock = (x) => p.x + Math.floor((x - p.x) / blockSize) * blockSize;
    const hasFloorMark = (blockX) => Array.isArray(p.hiddenChestFloors)
        && p.hiddenChestFloors.some((x) => Math.abs(x - blockX) < 1);
    const removeFloorMark = (blockX) => {
        if (!Array.isArray(p.hiddenChestFloors)) return;
        p.hiddenChestFloors = p.hiddenChestFloors.filter((x) => Math.abs(x - blockX) >= 1);
    };
    const addFloorMark = (blockX) => {
        if (!Array.isArray(p.hiddenChestFloors)) p.hiddenChestFloors = [];
        if (!hasFloorMark(blockX)) p.hiddenChestFloors.push(blockX);
    };
    const findTreasureIndex = (blockX) => {
        if (!Array.isArray(treasureBlocks)) return -1;
        for (let ti = treasureBlocks.length - 1; ti >= 0; ti--) {
            const tb = treasureBlocks[ti];
            if (Math.abs((Number(tb?.x) || 0) - blockX) < blockSize
                && Math.abs((Number(tb?.y) || 0) - p.y) < blockSize) {
                return ti;
            }
        }
        return -1;
    };
    const findHiddenChestAbove = (blockX) => {
        const expectedY = p.y - blockSize;
        return (Array.isArray(chests) ? chests : []).find((c) => {
            if (!c || !c.hidden) return false;
            if (Math.abs((Number(c.y) || 0) - expectedY) > blockSize * 0.75) return false;
            const left = Number(c.x) || 0;
            const right = left + (Number(c.width) || blockSize * 0.8);
            return right > blockX && left < blockX + blockSize;
        }) || null;
    };

    // 计算挖掘位置：standingOn 用玩家中心X，inFront 用 reachX
    let digX = p.x;
    if (p.width > blockSize) {
        let rawDigX;
        if (bestPriority === 1 || bestPriority === 3) {
            rawDigX = player.x + player.width / 2;
        } else {
            rawDigX = reachX;
        }
        // 对齐到平台自身的 blockSize 网格（相对平台起点），并限制在平台范围内
        digX = floorToBlock(rawDigX);
        digX = Math.max(p.x, Math.min(digX, p.x + p.width - blockSize));
    }

    if (hasFloorMark(digX)) {
        const chestAbove = findHiddenChestAbove(digX);
        if (chestAbove && !chestAbove.opened) {
            showToast("💡 先打开宝箱！");
            playerWeapons.attackCooldown = weapon.cooldown;
            return;
        }
        removeFloorMark(digX);
    }

    const treasureIndex = findTreasureIndex(digX);
    if (treasureIndex >= 0) {
        treasureBlocks.splice(treasureIndex, 1);
        const hiddenChest = new Chest(digX + blockSize * 0.1, p.y - blockSize, true);
        hiddenChest.hidden = true;
        chests.push(hiddenChest);
        addFloorMark(digX);
        showFloatingText("✨ 藏宝方块!", digX + blockSize / 2, p.y - 60, "#FFD700");
        showToast("💡 先打开宝箱！");
        playerWeapons.attackCooldown = weapon.cooldown;
        return;
    }

    // 如果平台小于一个blockSize，直接整个移除
    if (p.width <= blockSize) {
        emitDigParticles(p.x, p.y, p.type);
        platforms.splice(target.idx, 1);
        showFloatingText("🕳️ 挖掉了", p.x + p.width / 2, p.y - 50);
        if (typeof triggerGravityCheck === "function") {
            triggerGravityCheck(p.x, p.x + p.width, p.y);
        }
        playerWeapons.attackCooldown = weapon.cooldown;
        return;
    }

    // 悬浮平台与地面统一逻辑：挖一格
    const key = `${digX},${p.y}`;
    const hit = (digHits.get(key) || 0) + 1;
    digHits.set(key, hit);
    if (hit < weapon.digHits) {
        showFloatingText(`⛏️ ${hit}/${weapon.digHits}`, digX + blockSize / 2, p.y - 40);
        playerWeapons.attackCooldown = weapon.cooldown;
        return;
    }
    const cutLeft = digX;
    const cutRight = Math.min(digX + blockSize, p.x + p.width);
    const leftWidth = cutLeft - p.x;
    const rightWidth = (p.x + p.width) - cutRight;
    const inheritedFloorMarks = Array.isArray(p.hiddenChestFloors) ? [...p.hiddenChestFloors] : [];
    emitDigParticles(digX, p.y, p.type);
    platforms.splice(target.idx, 1);
    if (leftWidth > 4) {
        const lp = new Platform(p.x, p.y, leftWidth, p.height, p.type);
        if (p.fragile && typeof lp.makeFragile === "function") lp.makeFragile(p.maxSteps);
        const leftMarks = inheritedFloorMarks.filter((x) => x < cutLeft);
        if (leftMarks.length) lp.hiddenChestFloors = leftMarks;
        platforms.push(lp);
    }
    if (rightWidth > 4) {
        const rp = new Platform(cutRight, p.y, rightWidth, p.height, p.type);
        if (p.fragile && typeof rp.makeFragile === "function") rp.makeFragile(p.maxSteps);
        const rightMarks = inheritedFloorMarks.filter((x) => x >= cutRight);
        if (rightMarks.length) rp.hiddenChestFloors = rightMarks;
        platforms.push(rp);
    }
    digHits.delete(key);
    showFloatingText("🕳️ 挖掉了", digX + blockSize / 2, p.y - 50);
    if (typeof triggerGravityCheck === "function") {
        triggerGravityCheck(cutLeft, cutRight, p.y);
    }
    playerWeapons.attackCooldown = weapon.cooldown;
}

function performMeleeAttack(weapon) {
    if (player.isAttacking) return;
    player.isAttacking = true;
    player.attackTimer = Math.max(12, Math.floor(weapon.cooldown * 0.6));
    const range = weapon.range;
    const ax = player.facingRight ? player.x + player.width : player.x - range;
    const ay = player.y;
    const dmg = weapon.damage;

    trees.forEach(t => {
        if (rectIntersect(ax, ay, range, player.height, t.x, t.y, t.width, t.height)) {
            t.hit();
        }
    });

    enemies.forEach(e => {
        if (rectIntersect(ax, ay, range, player.height, e.x, e.y, e.width, e.height)) {
            if (e.takeDamage) e.takeDamage(dmg);
            else e.hp -= dmg;
            showFloatingText(`-${dmg}`, e.x, e.y);
        }
    });

    // 海洋生物伤害
    if (typeof oceanCreatures !== 'undefined') {
        oceanCreatures.forEach(c => {
            if (!c.alive) return;
            if (rectIntersect(ax, ay, range, player.height, c.x, c.y, c.width, c.height)) {
                if (c.takeDamage) c.takeDamage(dmg);
            }
        });
    }

    // 末地生物伤害
    if (typeof endCreatures !== 'undefined') {
        endCreatures.forEach(c => {
            if (!c.alive) return;
            if (rectIntersect(ax, ay, range, player.height, c.x, c.y, c.width, c.height)) {
                if (c.takeDamage) c.takeDamage(dmg);
            }
        });
    }

    // BOSS伤害
    if (typeof bossArena !== 'undefined' && bossArena.active && bossArena.boss && bossArena.boss.alive) {
        const b = bossArena.boss;
        if (rectIntersect(ax, ay, range, player.height, b.x, b.y, b.width, b.height)) {
            b.takeDamage(dmg);
        }
        // 火球反弹：攻击范围内的可反弹弹幕
        b.bossProjectiles.forEach(p => {
            if (!p.reflectable || p.reflected) return;
            if (rectIntersect(ax, ay, range, player.height, p.x - p.size, p.y - p.size, p.size * 2, p.size * 2)) {
                p.reflected = true;
                p.color = '#00BFFF';
                const angle = Math.atan2(b.y + b.height / 2 - p.y, b.x + b.width / 2 - p.x);
                p.vx = Math.cos(angle) * 5;
                p.vy = Math.sin(angle) * 5;
                p.damage = 3;
                showFloatingText('🔄 反弹!', p.x, p.y - 20, '#00BFFF');
            }
        });
        // 小烈焰人受伤
        if (typeof b.damageMinionAt === 'function') {
            b.damageMinionAt(ax + range / 2, ay + player.height / 2, range, dmg);
        }
    }

    playerWeapons.attackCooldown = weapon.cooldown;
}
