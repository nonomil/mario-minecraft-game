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
    const el = document.getElementById("weapon-info");
    if (!el) return;
    const weapon = WEAPONS[playerWeapons.current] || WEAPONS.sword;
    const arrows = getArrowCount();
    const arrowText = weapon.type === "ranged" ? ` | 🏹 ${arrows}` : "";
    el.innerText = `武器: ${weapon.emoji} ${weapon.name}${arrowText}`;
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

function digGroundBlock() {
    const weapon = WEAPONS.pickaxe;
    const dir = player.facingRight ? 1 : -1;
    const targetX = player.x + (dir > 0 ? player.width + 6 : -6);
    const blockX = Math.floor(targetX / blockSize) * blockSize;

    // Find target platform: prefer ground, then nearest floating platform
    let targetIdx = platforms.findIndex(p => p.y === groundY && blockX >= p.x && blockX < p.x + p.width);
    let targetY = groundY;
    if (targetIdx === -1) {
        // Search for floating platforms near the player
        let bestDist = Infinity;
        const playerCenterY = player.y + player.height / 2;
        for (let i = 0; i < platforms.length; i++) {
            const p = platforms[i];
            if (p.remove) continue;
            if (blockX < p.x || blockX >= p.x + p.width) continue;
            const dist = Math.abs(p.y - playerCenterY);
            if (dist < blockSize * 2.5 && dist < bestDist) {
                bestDist = dist;
                targetIdx = i;
                targetY = p.y;
            }
        }
    }

    const key = `${blockX},${targetY}`;
    const hit = (digHits.get(key) || 0) + 1;
    digHits.set(key, hit);
    showFloatingText(`⛏️ ${hit}/${weapon.digHits}`, blockX + blockSize / 2, targetY - 40);

    if (hit < weapon.digHits) {
        playerWeapons.attackCooldown = weapon.cooldown;
        return;
    }

    if (targetIdx === -1) {
        playerWeapons.attackCooldown = weapon.cooldown;
        return;
    }
    const p = platforms[targetIdx];
    const leftWidth = blockX - p.x;
    const rightStart = blockX + blockSize;
    const rightWidth = (p.x + p.width) - rightStart;
    platforms.splice(targetIdx, 1);
    if (leftWidth > 0) platforms.push(new Platform(p.x, p.y, leftWidth, p.height, p.type));
    if (rightWidth > 0) platforms.push(new Platform(rightStart, p.y, rightWidth, p.height, p.type));
    digHits.delete(key);
    showFloatingText("🕳️ 挖掉了", blockX + blockSize / 2, targetY - 50);
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
