/**
 * 14-renderer-entities.js - 实体渲染函数
 * 从 14-renderer.js 拆分
 */

function drawSteve(x, y, facingRight, attacking) {
    const s = player.width / 26;
    ctx.fillStyle = "#00AAAA";
    ctx.fillRect(x + 6 * s, y + 20 * s, 14 * s, 20 * s);
    ctx.fillStyle = "#0000AA";
    ctx.fillRect(x + 6 * s, y + 40 * s, 14 * s, 12 * s);
    ctx.fillStyle = "#F5Bca9";
    ctx.fillRect(x + 3 * s, y, 20 * s, 20 * s);
    ctx.fillStyle = "#4A332A";
    ctx.fillRect(x + 3 * s, y, 20 * s, 6 * s);

    // Eyes: Black
    ctx.fillStyle = "#000";
    const ex = facingRight ? x + 16 * s : x + 6 * s;
    ctx.fillRect(ex, y + 6 * s, 4 * s, 4 * s); // Steve's eye

    if (playerEquipment?.armor) {
        const armor = ARMOR_TYPES?.[playerEquipment.armor];
        const dur = Math.max(0, Math.min(100, Number(playerEquipment?.armorDurability) || 0));
        if (armor && dur > 0) {
            const alpha = 0.4 + (dur / 100) * 0.35;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = armor.color || "#90A4AE";
            // Helmet (on head, slightly wider than hair)
            ctx.fillRect(x + 2 * s, y - 1 * s, 22 * s, 8 * s);
            // Chest plate
            ctx.fillRect(x + 6 * s, y + 20 * s, 14 * s, 20 * s);
            // Shoulder pads
            ctx.fillRect(x + 4 * s, y + 20 * s, 2 * s, 8 * s);
            ctx.fillRect(x + 20 * s, y + 20 * s, 2 * s, 8 * s);
            // Leggings
            ctx.fillRect(x + 6 * s, y + 40 * s, 14 * s, 8 * s);
            ctx.restore();

            ctx.strokeStyle = "rgba(255,255,255,0.45)";
            ctx.lineWidth = Math.max(1, s * 0.8);
            ctx.strokeRect(x + 6 * s, y + 20 * s, 14 * s, 20 * s);
        }
    }

    if (attacking) {
        ctx.save();
        ctx.translate(x + (facingRight ? 26 * s : 0), y + 26 * s);
        if (!facingRight) ctx.scale(-1, 1);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = "#00FFFF";
        ctx.fillRect(0, -16 * s, 5 * s, 32 * s);
        ctx.restore();
    }
}

function drawMobRect(x, y, s, px, py, pw, ph) {
    ctx.fillRect(x + px * s, y + py * s, pw * s, ph * s);
}

function drawCreeperMob(enemy) {
    const x = enemy.x;
    const s = enemy.width / 16;
    const y = enemy.y + enemy.height - 24 * s;

    // Base greens close to the in-game creeper texture.
    ctx.fillStyle = "#3AAE2A";
    drawMobRect(x, y, s, 0, 0, 16, 8); // head
    drawMobRect(x, y, s, 2, 8, 12, 8); // body
    // legs
    drawMobRect(x, y, s, 1, 16, 3, 8);
    drawMobRect(x, y, s, 5, 16, 3, 8);
    drawMobRect(x, y, s, 8, 16, 3, 8);
    drawMobRect(x, y, s, 12, 16, 3, 8);

    // Texture patches
    ctx.fillStyle = "#2E7D32";
    drawMobRect(x, y, s, 1, 1, 3, 2);
    drawMobRect(x, y, s, 10, 1, 3, 2);
    drawMobRect(x, y, s, 4, 9, 2, 2);
    drawMobRect(x, y, s, 11, 10, 2, 2);

    // Face
    ctx.fillStyle = "#111";
    drawMobRect(x, y, s, 3, 2, 3, 3);  // left eye
    drawMobRect(x, y, s, 10, 2, 3, 3); // right eye
    drawMobRect(x, y, s, 7, 5, 2, 2);  // nose
    drawMobRect(x, y, s, 6, 6, 4, 2);  // mouth top
    drawMobRect(x, y, s, 5, 7, 2, 1);  // mouth left
    drawMobRect(x, y, s, 9, 7, 2, 1);  // mouth right
}

function drawEnemy(enemy) {
    if (enemy.remove || enemy.y > 900) return;
    switch (enemy.type) {
        case "zombie":
            drawZombie(enemy);
            break;
        case "spider":
            drawSpider(enemy);
            break;
        case "creeper":
            drawCreeperMob(enemy);
            if (enemy.state === "exploding") {
                const flash = Math.floor(enemy.explodeTimer / 10) % 2 === 0;
                if (flash) {
                    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
                    ctx.fillRect(enemy.x - 6, enemy.y - 6, enemy.width + 12, enemy.height + 12);
                }
            }
            break;
        case "skeleton":
            drawSkeleton(enemy);
            break;
        case "enderman":
            drawEnderman(enemy);
            break;
        case "piglin":
            drawSimpleBiomeEnemy(enemy, "#C68642", "#8B4513", true);
            break;
        case "bee":
            drawSimpleBiomeEnemy(enemy, "#FFD54F", "#212121", false);
            break;
        case "fox":
            drawFoxEnemy(enemy);
            break;
        case "spore_bug":
            drawSimpleBiomeEnemy(enemy, "#8E24AA", "#4A148C", false);
            break;
        case "magma_cube":
            drawSimpleBiomeEnemy(enemy, "#FF5722", "#BF360C", false);
            break;
        case "fire_spirit":
            drawSimpleBiomeEnemy(enemy, "#FFB300", "#F57C00", false);
            break;
        case "sculk_worm":
            drawSimpleBiomeEnemy(enemy, "#00838F", "#80DEEA", false);
            break;
        case "shadow_stalker":
            drawSimpleBiomeEnemy(enemy, "#1B1B2F", "#E53935", true);
            break;
        case "warden":
            drawWardenEnemy(enemy);
            break;
    }

    if (enemy.hp < enemy.maxHp) {
        drawHealthBar(enemy.x, enemy.y - 8, enemy.width, enemy.hp, enemy.maxHp);
    }
}

function drawSimpleBiomeEnemy(enemy, bodyColor, detailColor, humanoid) {
    const x = enemy.x;
    const y = enemy.y;
    const w = enemy.width;
    const h = enemy.height;
    ctx.fillStyle = bodyColor;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = detailColor;
    if (humanoid) {
        ctx.fillRect(x + w * 0.2, y + h * 0.25, w * 0.15, h * 0.12);
        ctx.fillRect(x + w * 0.65, y + h * 0.25, w * 0.15, h * 0.12);
        ctx.fillRect(x + w * 0.35, y + h * 0.65, w * 0.3, h * 0.1);
    } else {
        ctx.fillRect(x + w * 0.2, y + h * 0.4, w * 0.6, h * 0.18);
    }
}

function drawWardenEnemy(enemy) {
    const x = enemy.x;
    const y = enemy.y;
    const w = enemy.width;
    const h = enemy.height;
    ctx.fillStyle = "#0D1F2B";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#173748";
    ctx.fillRect(x + w * 0.1, y + h * 0.1, w * 0.8, h * 0.75);
    ctx.fillStyle = "#63D8D1";
    ctx.beginPath();
    ctx.arc(x + w * 0.5, y + h * 0.48, Math.max(4, w * 0.14), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#87E5FF";
    ctx.fillRect(x + w * 0.18, y + h * 0.18, w * 0.12, h * 0.08);
    ctx.fillRect(x + w * 0.7, y + h * 0.18, w * 0.12, h * 0.08);
}

function drawZombie(enemy) {
    const x = enemy.x;
    const s = enemy.width / 16;
    const y = enemy.y + enemy.height - 24 * s;

    // Head (green), shirt (blue), pants (purple) - closer to the classic Minecraft zombie palette.
    ctx.fillStyle = "#4CAF50";
    drawMobRect(x, y, s, 0, 0, 16, 8);
    ctx.fillStyle = "#2E7D32";
    drawMobRect(x, y, s, 2, 1, 3, 2);
    drawMobRect(x, y, s, 11, 2, 3, 2);

    // Face
    ctx.fillStyle = "#1B1B1B";
    drawMobRect(x, y, s, 4, 3, 2, 2);
    drawMobRect(x, y, s, 10, 3, 2, 2);
    ctx.fillStyle = "#2B2B2B";
    drawMobRect(x, y, s, 7, 5, 2, 1);

    // Torso + arms
    ctx.fillStyle = "#2E7D9A"; // shirt
    drawMobRect(x, y, s, 3, 8, 10, 8);
    drawMobRect(x, y, s, 0, 8, 3, 12);
    drawMobRect(x, y, s, 13, 8, 3, 12);

    // Pants + legs
    ctx.fillStyle = "#5E35B1";
    drawMobRect(x, y, s, 3, 16, 5, 8);
    drawMobRect(x, y, s, 8, 16, 5, 8);
    ctx.fillStyle = "#4527A0";
    drawMobRect(x, y, s, 3, 22, 5, 2);
    drawMobRect(x, y, s, 8, 22, 5, 2);
}

function drawSpider(enemy) {
    const x = enemy.x;
    const y = enemy.y + enemy.height - 12 * (enemy.width / 22);
    const s = enemy.width / 22;

    // Body
    ctx.fillStyle = "#1B1B1B";
    ctx.fillRect(x + 4 * s, y + 3 * s, 14 * s, 6 * s);
    ctx.fillStyle = "#2B2B2B";
    ctx.fillRect(x + 6 * s, y + 2 * s, 10 * s, 3 * s);

    // Eyes (red)
    ctx.fillStyle = "#D50000";
    ctx.fillRect(x + 7 * s, y + 3 * s, 2 * s, 2 * s);
    ctx.fillRect(x + 13 * s, y + 3 * s, 2 * s, 2 * s);

    // Legs (8)
    ctx.strokeStyle = "#111";
    ctx.lineWidth = Math.max(2, s);
    const legPairs = [
        [[6, 4], [1, 1]],
        [[6, 7], [1, 10]],
        [[8, 4], [2, 0]],
        [[8, 7], [2, 11]],
        [[16, 4], [21, 1]],
        [[16, 7], [21, 10]],
        [[14, 4], [20, 0]],
        [[14, 7], [20, 11]]
    ];
    ctx.beginPath();
    for (const [[sx, sy], [ex, ey]] of legPairs) {
        ctx.moveTo(x + sx * s, y + sy * s);
        ctx.lineTo(x + ex * s, y + ey * s);
    }
    ctx.stroke();
}

function drawSkeleton(enemy) {
    const x = enemy.x;
    const s = enemy.width / 16;
    const y = enemy.y + enemy.height - 24 * s;

    ctx.fillStyle = "#E0E0E0";
    drawMobRect(x, y, s, 0, 0, 16, 8); // head
    ctx.fillStyle = "#111";
    drawMobRect(x, y, s, 4, 3, 3, 3);
    drawMobRect(x, y, s, 9, 3, 3, 3);

    // torso + arms
    ctx.fillStyle = "#D6D6D6";
    drawMobRect(x, y, s, 4, 8, 8, 8);
    drawMobRect(x, y, s, 1, 8, 3, 12);
    drawMobRect(x, y, s, 12, 8, 3, 12);

    // ribs detail
    ctx.fillStyle = "#BDBDBD";
    for (let i = 0; i < 4; i++) drawMobRect(x, y, s, 5, 9 + i * 2, 6, 1);

    // legs
    ctx.fillStyle = "#D6D6D6";
    drawMobRect(x, y, s, 5, 16, 3, 8);
    drawMobRect(x, y, s, 8, 16, 3, 8);

    // simple bow hint
    ctx.strokeStyle = "#8B4513";
    ctx.lineWidth = Math.max(2, s);
    ctx.beginPath();
    ctx.arc(x + 1.5 * s, y + 12 * s, 4 * s, 0, Math.PI);
    ctx.stroke();
}

function drawEnderman(enemy) {
    const x = enemy.x;
    const s = enemy.width / 16;
    const y = enemy.y + enemy.height - 32 * s;

    ctx.fillStyle = "#0B0B0B";
    // head
    drawMobRect(x, y, s, 0, 0, 16, 8);
    // torso
    drawMobRect(x, y, s, 6, 8, 4, 10);
    // arms
    drawMobRect(x, y, s, 4, 8, 2, 20);
    drawMobRect(x, y, s, 10, 8, 2, 20);
    // legs
    drawMobRect(x, y, s, 6, 18, 2, 14);
    drawMobRect(x, y, s, 8, 18, 2, 14);

    // eyes
    ctx.fillStyle = "#AA00FF";
    drawMobRect(x, y, s, 4, 3, 3, 1);
    drawMobRect(x, y, s, 9, 3, 3, 1);
    ctx.fillStyle = "#E1BEE7";
    drawMobRect(x, y, s, 5, 3, 1, 1);
    drawMobRect(x, y, s, 10, 3, 1, 1);
}

function drawGolem(golem) {
    const x = golem.x;
    const y = golem.y;
    if (golem.type === "iron") {
        ctx.fillStyle = "#757575";
        ctx.fillRect(x + 10, y + 10, 20, 38);
        ctx.fillStyle = "#424242";
        ctx.fillRect(x + 5, y, 30, 10);
        ctx.fillStyle = "#FF5722";
        ctx.fillRect(x + 12, y + 3, 4, 4);
        ctx.fillRect(x + 22, y + 3, 4, 4);
    } else {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(x + 8, y + 15, 16, 16);
        ctx.fillRect(x + 10, y, 12, 12);
        ctx.fillStyle = "#FF5722";
        ctx.fillRect(x + 12, y + 4, 2, 2);
        ctx.fillRect(x + 18, y + 4, 2, 2);
        ctx.fillStyle = "#FFA500";
        ctx.fillRect(x + 15, y + 6, 4, 2);
    }
    drawHealthBar(x, y - 8, golem.width, golem.hp, golem.maxHp);
}

function drawHealthBar(x, y, width, hp, maxHp) {
    const barWidth = width;
    const barHeight = 4;
    const hpPercent = Math.max(0, hp / maxHp);
    ctx.fillStyle = "#333";
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = hpPercent > 0.5 ? "#4CAF50" : hpPercent > 0.2 ? "#FFC107" : "#F44336";
    ctx.fillRect(x, y, barWidth * hpPercent, barHeight);
}

function drawProjectile(proj) {
    if (proj instanceof Arrow) {
        ctx.fillStyle = "#8B4513";
        ctx.save();
        ctx.translate(proj.x, proj.y);
        const angle = Math.atan2(proj.velY, proj.velX);
        ctx.rotate(angle);
        ctx.fillRect(0, -1, 12, 2);
        ctx.fillStyle = "#C0C0C0";
        ctx.fillRect(10, -2, 2, 4);
        ctx.restore();
    } else if (proj instanceof Snowball) {
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#E0E0E0";
        ctx.stroke();
    } else if (proj instanceof DragonFireball) {
        ctx.fillStyle = "#FF5722";
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#FF9800";
        ctx.stroke();
    }
}

// 渲染新BOSS系统
function renderBossSystem() {
    if (typeof bossArena === 'undefined' || !bossArena.active) return;
    // draw() already applied ctx.translate(-cameraX, 0), so pass 0 here to avoid double offset.
    bossArena.renderBoss(ctx, 0);
    bossArena.renderProjectiles(ctx, 0);
}

function drawFoxEnemy(enemy) {
    const x = enemy.x;
    const y = enemy.y;
    const w = enemy.width;
    const h = enemy.height;
    const faceRight = enemy.dir >= 0;

    // Body
    ctx.fillStyle = "#F57C00";
    ctx.fillRect(x + w * 0.12, y + h * 0.38, w * 0.7, h * 0.42);

    // Head
    const headX = faceRight ? x + w * 0.58 : x + w * 0.06;
    const headY = y + h * 0.2;
    ctx.fillStyle = "#FB8C00";
    ctx.fillRect(headX, headY, w * 0.32, h * 0.28);

    // Ears
    ctx.fillStyle = "#F57C00";
    ctx.fillRect(headX + w * 0.02, headY - h * 0.08, w * 0.08, h * 0.1);
    ctx.fillRect(headX + w * 0.22, headY - h * 0.08, w * 0.08, h * 0.1);
    ctx.fillStyle = "#FFD9B3";
    ctx.fillRect(headX + w * 0.04, headY - h * 0.05, w * 0.04, h * 0.05);
    ctx.fillRect(headX + w * 0.24, headY - h * 0.05, w * 0.04, h * 0.05);

    // Face details
    const eyeX = faceRight ? headX + w * 0.2 : headX + w * 0.08;
    ctx.fillStyle = "#212121";
    ctx.fillRect(eyeX, headY + h * 0.09, w * 0.04, h * 0.05);
    ctx.fillStyle = "#FFF3E0";
    ctx.fillRect(headX + w * 0.1, headY + h * 0.16, w * 0.14, h * 0.1);
    const noseX = faceRight ? headX + w * 0.25 : headX + w * 0.09;
    ctx.fillStyle = "#5D4037";
    ctx.fillRect(noseX, headY + h * 0.2, w * 0.03, h * 0.03);

    // Tail
    const tailX = faceRight ? x + w * 0.02 : x + w * 0.7;
    ctx.fillStyle = "#F57C00";
    ctx.fillRect(tailX, y + h * 0.32, w * 0.2, h * 0.16);
    ctx.fillStyle = "#FFF3E0";
    ctx.fillRect(faceRight ? tailX : tailX + w * 0.12, y + h * 0.34, w * 0.08, h * 0.1);

    // Feet
    ctx.fillStyle = "#E65100";
    ctx.fillRect(x + w * 0.24, y + h * 0.76, w * 0.1, h * 0.1);
    ctx.fillRect(x + w * 0.55, y + h * 0.76, w * 0.1, h * 0.1);
}
