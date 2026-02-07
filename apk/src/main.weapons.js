/**
 * main.weapons.js - 武器系统模块
 *
 * 本模块包含游戏的武器相关功能：
 * - 武器定义和属性
 * - 武器切换
 * - 弓箭蓄力和射击
 * - 近战攻击
 * - 挖掘系统
 */

(function() {
    const M = window.MMWG;

    // ============================================
    // 武器定义
    // ============================================
    const WEAPONS = {
        sword: {
            id: "sword",
            name: "石剑",
            damage: 14,
            range: 55,
            cooldown: 18,
            knockback: 8,
            type: "melee",
            emoji: "⚔️"
        },
        axe: {
            id: "axe",
            name: "木斧",
            damage: 20,
            range: 70,
            cooldown: 30,
            knockback: 12,
            type: "melee",
            emoji: "🪓"
        },
        pickaxe: {
            id: "pickaxe",
            name: "铁镐",
            damage: 8,
            range: 40,
            cooldown: 180,
            knockback: 0,
            type: "dig",
            emoji: "⛏️",
            digHits: 3
        },
        bow: {
            id: "bow",
            name: "弓",
            damage: 12,
            range: 380,
            cooldown: 26,
            knockback: 5,
            type: "ranged",
            emoji: "🏹",
            chargeMax: 40
        }
    };

    // ============================================
    // 玩家武器状态
    // ============================================
    const playerWeapons = {
        current: "sword",
        unlocked: ["sword", "bow", "pickaxe", "axe"],
        attackCooldown: 0,
        isCharging: false,
        chargeTime: 0,
        lastPressTs: 0,
        doublePressWindow: 220
    };

    // ============================================
    // 弹射物池
    // ============================================
    const projectilePool = {
        arrows: [],
        snowballs: [],
        fireballs: [],
        getArrow(x, y, tx, ty) {
            let arrow = this.arrows.find(p => p.remove);
            if (arrow) {
                arrow.reset(x, y, tx, ty, 4);
            } else {
                arrow = new Arrow(x, y, tx, ty);
                this.arrows.push(arrow);
            }
            return arrow;
        },
        getSnowball(x, y, tx, ty) {
            let snowball = this.snowballs.find(p => p.remove);
            if (snowball) {
                snowball.reset(x, y, tx, ty, 3);
            } else {
                snowball = new Snowball(x, y, tx, ty);
                this.snowballs.push(snowball);
            }
            return snowball;
        },
        getFireball(x, y, tx, ty) {
            let fireball = this.fireballs.find(p => p.remove);
            if (fireball) {
                fireball.reset(x, y, tx, ty, 2);
            } else {
                fireball = new DragonFireball(x, y, tx, ty);
                this.fireballs.push(fireball);
            }
            return fireball;
        }
    };

    // ============================================
    // 武器辅助函数
    // ============================================
    function getArrowCount() {
        return Number(M.inventory.arrow) || 0;
    }

    function unlockWeapon(id) {
        if (!WEAPONS[id]) return false;
        if (playerWeapons.unlocked.includes(id)) return false;
        playerWeapons.unlocked.push(id);
        M.showToast(`🎉 解锁武器: ${WEAPONS[id].emoji} ${WEAPONS[id].name}`);
        updateWeaponUI();
        return true;
    }

    function syncWeaponsFromInventory() {
        if ((M.inventory.stone_sword || 0) > 0) unlockWeapon("sword");
        if ((M.inventory.iron_pickaxe || 0) > 0) unlockWeapon("axe");
        if ((M.inventory.iron_pickaxe || 0) > 0) unlockWeapon("pickaxe");
        if ((M.inventory.bow || 0) > 0) unlockWeapon("bow");
    }

    function switchWeapon() {
        const list = playerWeapons.unlocked;
        if (!list.length) return;
        if (list.length === 1) {
            M.showToast("⚔️ 只有一种武器");
            return;
        }
        const idx = list.indexOf(playerWeapons.current);
        const nextIdx = idx >= 0 ? (idx + 1) % list.length : 0;
        playerWeapons.current = list[nextIdx];
        playerWeapons.attackCooldown = 0;
        playerWeapons.isCharging = false;
        playerWeapons.chargeTime = 0;
        const weapon = WEAPONS[playerWeapons.current];
        updateWeaponUI();
        M.showToast(`⚔️ 切换武器: ${weapon.emoji} ${weapon.name}`);
    }

    function updateWeaponUI() {
        const el = document.getElementById("weapon-info");
        if (!el) return;
        const weapon = WEAPONS[playerWeapons.current] || WEAPONS.sword;
        const arrows = getArrowCount();
        const arrowText = weapon.type === "ranged" ? ` | 🏹 ${arrows}` : "";
        el.innerText = `武器: ${weapon.emoji} ${weapon.name}${arrowText}`;
    }

    // ============================================
    // 弓箭系统
    // ============================================
    function startBowCharge() {
        const weapon = WEAPONS.bow;
        if (playerWeapons.attackCooldown > 0) return;
        if (getArrowCount() <= 0) {
            M.showToast("❌ 没有箭！");
            return;
        }
        playerWeapons.isCharging = true;
        playerWeapons.chargeTime = 0;
    }

    function releaseBowShot(forceCharge = null) {
        const weapon = WEAPONS.bow;
        if (playerWeapons.attackCooldown > 0) return;
        if (getArrowCount() <= 0) {
            M.showToast("❌ 没有箭！");
            return;
        }
        const ratio = forceCharge != null ? forceCharge : Math.min(1, playerWeapons.chargeTime / weapon.chargeMax);
        const charge = M.clamp(ratio, 0.2, 1);
        const dir = M.player.facingRight ? 1 : -1;
        const startX = M.player.facingRight ? M.player.x + M.player.width : M.player.x;
        const startY = M.player.y + M.player.height * 0.4;
        const targetX = startX + dir * weapon.range;
        const targetY = startY - 20 * charge;
        const speed = 4 + charge * 4;
        const damage = Math.round(weapon.damage * (0.6 + charge * 0.9));
        const arrow = new Arrow(startX, startY, targetX, targetY, "player", speed, damage);
        M.projectiles.push(arrow);
        M.inventory.arrow = Math.max(0, (M.inventory.arrow || 0) - 1);
        M.updateInventoryUI();
        playerWeapons.attackCooldown = weapon.cooldown;
        playerWeapons.isCharging = false;
        playerWeapons.chargeTime = 0;
    }

    // ============================================
    // 挖掘系统
    // ============================================
    function digGroundBlock() {
        const weapon = WEAPONS.pickaxe;
        const dir = M.player.facingRight ? 1 : -1;
        const targetX = M.player.x + (dir > 0 ? M.player.width + 6 : -6);
        const blockX = Math.floor(targetX / M.blockSize) * M.blockSize;
        const key = `${blockX}`;
        const hit = (M.digHits.get(key) || 0) + 1;
        M.digHits.set(key, hit);
        M.showFloatingText(`${weapon.emoji} ${hit}/${weapon.digHits}`, blockX + M.blockSize / 2, M.groundY - 40);

        if (hit < weapon.digHits) {
            playerWeapons.attackCooldown = weapon.cooldown;
            return;
        }

        const idx = M.platforms.findIndex(p => p.y === M.groundY && blockX >= p.x && blockX < p.x + p.width);
        if (idx === -1) {
            playerWeapons.attackCooldown = weapon.cooldown;
            return;
        }
        const p = M.platforms[idx];
        const leftWidth = blockX - p.x;
        const rightStart = blockX + M.blockSize;
        const rightWidth = (p.x + p.width) - rightStart;
        M.platforms.splice(idx, 1);
        if (leftWidth > 0) M.platforms.push(new Platform(p.x, p.y, leftWidth, p.height, p.type));
        if (rightWidth > 0) M.platforms.push(new Platform(rightStart, p.y, rightWidth, p.height, p.type));
        M.digHits.delete(key);
        M.showFloatingText("🕳️ 深坑", blockX + M.blockSize / 2, M.groundY - 50);
        playerWeapons.attackCooldown = weapon.cooldown;
    }

    function digDownBlock() {
        const weapon = WEAPONS.pickaxe;
        const blockX = Math.floor((M.player.x + M.player.width / 2) / M.blockSize) * M.blockSize;
        const key = `down:${blockX}`;
        const hit = (M.digHits.get(key) || 0) + 1;
        M.digHits.set(key, hit);
        M.showFloatingText(`${weapon.emoji} ${hit}/${weapon.digHits}`, blockX + M.blockSize / 2, M.groundY - 40);

        if (hit < weapon.digHits) {
            playerWeapons.attackCooldown = weapon.cooldown;
            return;
        }

        const idx = M.platforms.findIndex(p => p.y === M.groundY && blockX >= p.x && blockX < p.x + p.width);
        if (idx === -1) {
            playerWeapons.attackCooldown = weapon.cooldown;
            return;
        }
        const p = M.platforms[idx];
        const leftWidth = blockX - p.x;
        const rightStart = blockX + M.blockSize;
        const rightWidth = (p.x + p.width) - rightStart;
        M.platforms.splice(idx, 1);
        if (leftWidth > 0) M.platforms.push(new Platform(p.x, p.y, leftWidth, p.height, p.type));
        if (rightWidth > 0) M.platforms.push(new Platform(rightStart, p.y, rightWidth, p.height, p.type));
        M.digHits.delete(key);
        M.caveEntryArmed = { x: blockX, width: M.blockSize, ttl: 180 };
        M.showFloatingText("🕳️ 向下挖", blockX + M.blockSize / 2, M.groundY - 50);
        playerWeapons.attackCooldown = weapon.cooldown;
    }

    // ============================================
    // 近战攻击
    // ============================================
    function performMeleeAttack(weapon) {
        if (M.player.isAttacking) return;
        M.player.isAttacking = true;
        M.player.attackTimer = Math.max(12, Math.floor(weapon.cooldown * 0.6));
        const range = weapon.range;
        const ax = M.player.facingRight ? M.player.x + M.player.width : M.player.x - range;
        const ay = M.player.y;
        const dmg = weapon.damage;

        M.trees.forEach(t => {
            if (M.rectIntersect(ax, ay, range, M.player.height, t.x, t.y, t.width, t.height)) {
                t.hit();
            }
        });

        M.enemies.forEach(e => {
            if (M.rectIntersect(ax, ay, range, M.player.height, e.x, e.y, e.width, e.height)) {
                if (e.takeDamage) e.takeDamage(dmg);
                else e.hp -= dmg;
                M.showFloatingText(`-${dmg}`, e.x, e.y);
            }
        });

        playerWeapons.attackCooldown = weapon.cooldown;
    }

    // ============================================
    // 导出到全局
    // ============================================
    Object.assign(M, {
        WEAPONS,
        playerWeapons,
        projectilePool,
        getArrowCount,
        unlockWeapon,
        syncWeaponsFromInventory,
        switchWeapon,
        updateWeaponUI,
        startBowCharge,
        releaseBowShot,
        digGroundBlock,
        digDownBlock,
        performMeleeAttack
    });
})();
