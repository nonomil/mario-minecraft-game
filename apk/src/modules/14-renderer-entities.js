/**
 * 14-renderer-entities.js - 实体渲染函数
 * 从 14-renderer.js 拆分
 */

function drawSteve(x, y, facingRight, attacking) {
    const s = player.width / 26;
    const hasSunscreen = typeof hasSunscreenBuff === "function" && hasSunscreenBuff();
    ctx.fillStyle = hasSunscreen ? "#FFFFFF" : "#00AAAA";
    ctx.fillRect(x + 6 * s, y + 20 * s, 14 * s, 20 * s);
    ctx.fillStyle = hasSunscreen ? "#EEEEEE" : "#0000AA";
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
    if (enemy.type === "sculk_worm" && enemy.underground) return;
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
        case "drowned":
            drawDrownedEnemy(enemy);
            break;
        case "guardian":
            drawGuardianEnemy(enemy);
            break;
        case "pufferfish":
            drawPufferfishEnemy(enemy);
            break;
        case "enderman":
            drawEnderman(enemy);
            break;
        case "piglin":
            drawPiglinEnemy(enemy);
            break;
        case "bee":
            drawBeeEnemy(enemy);
            break;
        case "fox":
            drawFoxEnemy(enemy);
            break;
        case "spore_bug":
            drawSporeBugEnemy(enemy);
            break;
        case "magma_cube":
            drawMagmaCubeEnemy(enemy);
            break;
        case "fire_spirit":
            drawFireSpiritEnemy(enemy);
            break;
        case "sculk_worm":
            drawSculkWormEnemy(enemy);
            break;
        case "shadow_stalker":
            drawShadowStalkerEnemy(enemy);
            break;
        case "warden":
            drawWardenEnemy(enemy);
            break;
        default:
            drawSimpleBiomeEnemy(enemy, enemy.color || "#78909C", "#263238", enemy.height >= enemy.width);
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

function drawDrownedEnemy(enemy) {
    const x = enemy.x;
    const s = enemy.width / 16;
    const y = enemy.y + enemy.height - 24 * s;

    ctx.fillStyle = "#4D8B7E";
    drawMobRect(x, y, s, 0, 0, 16, 8);
    ctx.fillStyle = "#29584A";
    drawMobRect(x, y, s, 1, 0, 14, 2);
    drawMobRect(x, y, s, 2, 2, 2, 2);
    drawMobRect(x, y, s, 12, 3, 2, 2);

    ctx.fillStyle = "#E1F5FE";
    drawMobRect(x, y, s, 4, 3, 2, 2);
    drawMobRect(x, y, s, 10, 3, 2, 2);
    ctx.fillStyle = "#19363B";
    drawMobRect(x, y, s, 7, 5, 2, 1);

    ctx.fillStyle = "#266D8F";
    drawMobRect(x, y, s, 3, 8, 10, 8);
    drawMobRect(x, y, s, 0, 8, 3, 12);
    drawMobRect(x, y, s, 13, 8, 3, 12);
    ctx.fillStyle = "#52A6AE";
    drawMobRect(x, y, s, 4, 9, 8, 2);
    drawMobRect(x, y, s, 2, 12, 2, 5);
    drawMobRect(x, y, s, 12, 13, 2, 5);
    ctx.fillStyle = "#A7C6A5";
    drawMobRect(x, y, s, 5, 11, 1, 4);
    drawMobRect(x, y, s, 10, 12, 1, 5);

    ctx.fillStyle = "#355C5C";
    drawMobRect(x, y, s, 3, 16, 5, 8);
    drawMobRect(x, y, s, 8, 16, 5, 8);
    ctx.fillStyle = "#82B7B5";
    drawMobRect(x, y, s, 4, 18, 3, 1);
    drawMobRect(x, y, s, 9, 19, 3, 1);
}

function drawGuardianEnemy(enemy) {
    const x = enemy.x;
    const y = enemy.y;
    const w = enemy.width;
    const h = enemy.height;
    const shellX = x + w * 0.12;
    const shellY = y + h * 0.18;
    const shellW = w * 0.7;
    const shellH = h * 0.56;
    const tailX = x + w * 0.72;
    const tailY = y + h * 0.32;
    const spikes = [
        [0.26, 0.02, 0.1, 0.18],
        [0.54, 0.01, 0.1, 0.2],
        [0.18, 0.2, 0.09, 0.18],
        [0.63, 0.18, 0.09, 0.18],
        [0.27, 0.62, 0.1, 0.18],
        [0.54, 0.61, 0.1, 0.18],
        [0.04, 0.36, 0.15, 0.08],
        [0.72, 0.38, 0.16, 0.08]
    ];

    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(x + w * 0.12, y + h * 0.78, w * 0.7, h * 0.08);

    ctx.fillStyle = "#A3B5A4";
    spikes.forEach(([px, py, pw, ph]) => {
        ctx.fillRect(x + w * px, y + h * py, w * pw, h * ph);
    });

    ctx.fillStyle = "#6F8376";
    ctx.fillRect(shellX, shellY, shellW, shellH);
    ctx.fillStyle = "#8CA18C";
    ctx.fillRect(x + w * 0.2, y + h * 0.26, w * 0.5, h * 0.16);
    ctx.fillRect(x + w * 0.18, y + h * 0.44, w * 0.46, h * 0.18);

    ctx.fillStyle = "#4E6762";
    ctx.fillRect(tailX, tailY, w * 0.12, h * 0.16);
    ctx.fillRect(tailX + w * 0.1, tailY - h * 0.08, w * 0.1, h * 0.34);
    ctx.fillStyle = "#2BC8B7";
    ctx.fillRect(tailX + w * 0.04, tailY + h * 0.02, w * 0.16, h * 0.04);
    ctx.fillRect(x + w * 0.32, y + h * 0.22, w * 0.05, h * 0.08);
    ctx.fillRect(x + w * 0.58, y + h * 0.22, w * 0.05, h * 0.08);

    ctx.fillStyle = "#E3B868";
    ctx.fillRect(x + w * 0.26, y + h * 0.34, w * 0.26, h * 0.16);
    ctx.fillStyle = "#FFF3C4";
    ctx.fillRect(x + w * 0.3, y + h * 0.37, w * 0.16, h * 0.1);
    ctx.fillStyle = "#161616";
    ctx.fillRect(x + w * 0.37, y + h * 0.39, w * 0.06, h * 0.06);
}

function drawPufferfishEnemy(enemy) {
    const x = enemy.x;
    const y = enemy.y;
    const w = enemy.width;
    const h = enemy.height;
    const spikes = [
        [0.14, 0.04, 0.08, 0.12],
        [0.38, 0.0, 0.08, 0.14],
        [0.62, 0.04, 0.08, 0.12],
        [0.82, 0.18, 0.1, 0.1],
        [0.84, 0.46, 0.1, 0.1],
        [0.78, 0.72, 0.12, 0.1],
        [0.58, 0.84, 0.1, 0.1],
        [0.34, 0.86, 0.1, 0.1],
        [0.1, 0.74, 0.12, 0.1],
        [0.04, 0.48, 0.1, 0.1],
        [0.08, 0.22, 0.1, 0.1]
    ];

    ctx.fillStyle = "#F5C84B";
    ctx.fillRect(x + w * 0.16, y + h * 0.12, w * 0.68, h * 0.72);
    ctx.fillStyle = "#F9E07B";
    ctx.fillRect(x + w * 0.26, y + h * 0.2, w * 0.5, h * 0.56);
    ctx.fillStyle = "#D69A1C";
    spikes.forEach(([px, py, pw, ph]) => {
        ctx.fillRect(x + w * px, y + h * py, w * pw, h * ph);
    });
    ctx.fillRect(x + w * 0.1, y + h * 0.4, w * 0.08, h * 0.12);
    ctx.fillRect(x + w * 0.82, y + h * 0.4, w * 0.08, h * 0.12);

    ctx.fillStyle = "#212121";
    ctx.fillRect(x + w * 0.28, y + h * 0.34, w * 0.1, h * 0.1);
    ctx.fillRect(x + w * 0.62, y + h * 0.34, w * 0.1, h * 0.1);
    ctx.fillStyle = "#FDF5D0";
    ctx.fillRect(x + w * 0.32, y + h * 0.37, w * 0.03, h * 0.03);
    ctx.fillRect(x + w * 0.66, y + h * 0.37, w * 0.03, h * 0.03);
    ctx.fillStyle = "#8D6E63";
    ctx.fillRect(x + w * 0.42, y + h * 0.54, w * 0.16, h * 0.05);
    ctx.fillRect(x + w * 0.46, y + h * 0.62, w * 0.08, h * 0.04);
}

function drawPiglinEnemy(enemy) {
    const x = enemy.x;
    const s = enemy.width / 16;
    const y = enemy.y + enemy.height - 26 * s;

    ctx.fillStyle = "#D89A8A";
    drawMobRect(x, y, s, 0, 0, 16, 8);
    ctx.fillStyle = "#F0B3A5";
    drawMobRect(x, y, s, 4, 2, 8, 4);
    ctx.fillStyle = "#C97F74";
    drawMobRect(x, y, s, -2, 1, 3, 4);
    drawMobRect(x, y, s, 15, 1, 3, 4);
    drawMobRect(x, y, s, 6, 4, 4, 2);
    ctx.fillStyle = "#FFF5F3";
    drawMobRect(x, y, s, 4, 6, 2, 2);
    drawMobRect(x, y, s, 10, 6, 2, 2);
    ctx.fillStyle = "#2E1B17";
    drawMobRect(x, y, s, 5, 2, 2, 2);
    drawMobRect(x, y, s, 9, 2, 2, 2);

    ctx.fillStyle = "#7A3F2C";
    drawMobRect(x, y, s, 3, 8, 10, 9);
    drawMobRect(x, y, s, 0, 8, 3, 12);
    drawMobRect(x, y, s, 13, 8, 3, 12);
    ctx.fillStyle = "#9C5D3E";
    drawMobRect(x, y, s, 4, 9, 8, 3);
    ctx.fillStyle = "#E8C16B";
    drawMobRect(x, y, s, 0, 11, 2, 5);
    drawMobRect(x, y, s, 13, 12, 2, 5);

    ctx.fillStyle = "#4E342E";
    drawMobRect(x, y, s, 3, 17, 5, 9);
    drawMobRect(x, y, s, 8, 17, 5, 9);
    ctx.fillStyle = "#2F1D18";
    drawMobRect(x, y, s, 3, 24, 5, 2);
    drawMobRect(x, y, s, 8, 24, 5, 2);
}

function drawBeeEnemy(enemy) {
    const x = enemy.x;
    const y = enemy.y;
    const w = enemy.width;
    const h = enemy.height;
    const faceRight = enemy.dir >= 0;
    const bodyX = faceRight ? x + w * 0.08 : x + w * 0.16;
    const wingPulse = Math.sin((typeof gameFrame === "number" ? gameFrame : 0) * 0.18 + enemy.x * 0.02) * h * 0.08;

    ctx.save();
    ctx.fillStyle = "rgba(210, 240, 255, 0.72)";
    ctx.fillRect(x + w * 0.16, y + h * 0.08 + wingPulse, w * 0.26, h * 0.24);
    ctx.fillRect(x + w * 0.44, y + h * 0.02 - wingPulse, w * 0.26, h * 0.24);
    ctx.restore();

    ctx.fillStyle = "#3B2C1A";
    ctx.fillRect(bodyX, y + h * 0.3, w * 0.68, h * 0.42);
    ctx.fillStyle = "#FFD54F";
    ctx.fillRect(bodyX + w * 0.04, y + h * 0.24, w * 0.6, h * 0.42);
    ctx.fillStyle = "#2B2B2B";
    ctx.fillRect(bodyX + w * 0.12, y + h * 0.26, w * 0.08, h * 0.4);
    ctx.fillRect(bodyX + w * 0.32, y + h * 0.24, w * 0.08, h * 0.42);
    ctx.fillRect(bodyX + w * 0.52, y + h * 0.26, w * 0.08, h * 0.4);
    ctx.fillStyle = "#FFF6CF";
    ctx.fillRect(faceRight ? bodyX + w * 0.5 : bodyX + w * 0.06, y + h * 0.36, w * 0.12, h * 0.12);
    ctx.fillStyle = "#121212";
    ctx.fillRect(faceRight ? bodyX + w * 0.56 : bodyX + w * 0.12, y + h * 0.4, w * 0.04, h * 0.04);
    ctx.fillStyle = "#D4A000";
    ctx.fillRect(faceRight ? x + w * 0.02 : x + w * 0.82, y + h * 0.42, w * 0.08, h * 0.08);
    ctx.fillStyle = "#1E1E1E";
    ctx.fillRect(faceRight ? x + w * 0.88 : x + w * 0.04, y + h * 0.42, w * 0.06, h * 0.05);
}

function drawSporeBugEnemy(enemy) {
    const x = enemy.x;
    const y = enemy.y;
    const w = enemy.width;
    const h = enemy.height;
    const pulse = (Math.sin((typeof gameFrame === "number" ? gameFrame : 0) * 0.14 + enemy.x * 0.12) + 1) * 0.5;

    ctx.fillStyle = "#5D2B7E";
    ctx.fillRect(x + w * 0.08, y + h * 0.08, w * 0.84, h * 0.38);
    ctx.fillStyle = "#9B62D4";
    ctx.fillRect(x + w * 0.18, y + h * 0.12, w * 0.64, h * 0.22);
    ctx.fillStyle = "#D8C2FF";
    ctx.fillRect(x + w * 0.24, y + h * 0.16, w * 0.08, h * 0.08);
    ctx.fillRect(x + w * 0.56, y + h * 0.16, w * 0.1, h * 0.1);

    ctx.fillStyle = "#3F2747";
    ctx.fillRect(x + w * 0.2, y + h * 0.42, w * 0.48, h * 0.28);
    ctx.fillStyle = "#B8FFCC";
    ctx.fillRect(x + w * 0.28, y + h * 0.48, w * 0.08, h * 0.08);
    ctx.fillRect(x + w * 0.5, y + h * 0.48, w * 0.08, h * 0.08);
    ctx.fillStyle = `rgba(184, 255, 204, ${0.22 + pulse * 0.28})`;
    ctx.fillRect(x + w * 0.24, y + h * 0.44, w * 0.4, h * 0.22);
    ctx.fillStyle = "#2D1B34";
    ctx.fillRect(x + w * 0.16, y + h * 0.72, w * 0.08, h * 0.14);
    ctx.fillRect(x + w * 0.34, y + h * 0.72, w * 0.08, h * 0.14);
    ctx.fillRect(x + w * 0.52, y + h * 0.72, w * 0.08, h * 0.14);
    ctx.fillRect(x + w * 0.7, y + h * 0.72, w * 0.08, h * 0.14);
}

function drawMagmaCubeEnemy(enemy) {
    const x = enemy.x;
    const y = enemy.y;
    const w = enemy.width;
    const h = enemy.height;
    const squash = enemy.isJumping ? 0.82 : 0.96 + Math.sin((enemy.jumpCooldown || 0) * 0.08) * 0.04;
    const topY = y + h * (1 - squash);
    const bodyH = h * squash;

    ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
    ctx.fillRect(x + w * 0.08, y + h * 0.88, w * 0.84, h * 0.08);
    ctx.fillStyle = "#4A0F07";
    ctx.fillRect(x, topY, w, bodyH);
    ctx.fillStyle = "#8D1B09";
    ctx.fillRect(x + w * 0.08, topY + bodyH * 0.08, w * 0.84, bodyH * 0.22);
    ctx.fillRect(x + w * 0.1, topY + bodyH * 0.42, w * 0.8, bodyH * 0.22);
    ctx.fillRect(x + w * 0.14, topY + bodyH * 0.72, w * 0.72, bodyH * 0.12);
    ctx.fillStyle = "#FF6F1C";
    ctx.fillRect(x + w * 0.22, topY + bodyH * 0.18, w * 0.56, bodyH * 0.46);
    ctx.fillStyle = "#FFD54F";
    ctx.fillRect(x + w * 0.32, topY + bodyH * 0.28, w * 0.36, bodyH * 0.18);
    ctx.fillStyle = "#220B05";
    ctx.fillRect(x + w * 0.26, topY + bodyH * 0.38, w * 0.12, bodyH * 0.08);
    ctx.fillRect(x + w * 0.62, topY + bodyH * 0.38, w * 0.12, bodyH * 0.08);
    ctx.fillRect(x + w * 0.38, topY + bodyH * 0.56, w * 0.24, bodyH * 0.06);
}

function drawFireSpiritEnemy(enemy) {
    const x = enemy.x;
    const y = enemy.y;
    const w = enemy.width;
    const h = enemy.height;
    const sway = Math.sin((typeof gameFrame === "number" ? gameFrame : 0) * 0.12 + enemy.x * 0.08) * w * 0.06;

    ctx.save();
    ctx.globalAlpha = enemy.isDashing ? 0.78 : 0.62;
    ctx.fillStyle = "#FF6F00";
    ctx.beginPath();
    ctx.moveTo(x + w * 0.5, y + h * 0.04);
    ctx.lineTo(x + w * 0.82 + sway, y + h * 0.32);
    ctx.lineTo(x + w * 0.72, y + h * 0.7);
    ctx.lineTo(x + w * 0.5, y + h * 0.96);
    ctx.lineTo(x + w * 0.28, y + h * 0.72);
    ctx.lineTo(x + w * 0.16 - sway, y + h * 0.32);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "#FFB74D";
    ctx.fillRect(x + w * 0.28, y + h * 0.24, w * 0.44, h * 0.44);
    ctx.fillStyle = "#FFF3C4";
    ctx.fillRect(x + w * 0.38, y + h * 0.34, w * 0.24, h * 0.2);
    ctx.fillStyle = "#2B1100";
    ctx.fillRect(x + w * 0.35, y + h * 0.42, w * 0.08, h * 0.06);
    ctx.fillRect(x + w * 0.57, y + h * 0.42, w * 0.08, h * 0.06);
    ctx.fillStyle = "#FF7043";
    ctx.fillRect(x + w * 0.1, y + h * 0.58, w * 0.12, h * 0.08);
    ctx.fillRect(x + w * 0.78, y + h * 0.5, w * 0.12, h * 0.08);
}

function drawSculkWormEnemy(enemy) {
    if (enemy.underground) return;

    const x = enemy.x;
    const y = enemy.y;
    const w = enemy.width;
    const h = enemy.height;
    const segments = 5;
    const frame = typeof gameFrame === "number" ? gameFrame : 0;

    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(x + w * 0.06, y + h * 0.76, w * 0.88, h * 0.1);

    for (let index = 0; index < segments; index += 1) {
        const segX = x + (w / segments) * index;
        const wave = Math.sin(frame * 0.16 + index * 0.8) * h * 0.08;
        const segY = y + h * 0.24 + wave;
        const segW = w / segments + (index === segments - 1 ? 0 : 1);
        const segH = h * (index === 0 ? 0.46 : 0.4);
        ctx.fillStyle = index === 0 ? "#0E3236" : "#12474C";
        ctx.fillRect(segX, segY, segW, segH);
        ctx.fillStyle = "#77F7F0";
        ctx.fillRect(segX + segW * 0.3, segY + segH * 0.24, segW * 0.22, segH * 0.2);
    }

    ctx.fillStyle = "#B5FFFB";
    ctx.fillRect(x + w * 0.04, y + h * 0.32, w * 0.08, h * 0.06);
    ctx.fillRect(x + w * 0.04, y + h * 0.58, w * 0.08, h * 0.06);
    ctx.fillStyle = "#042328";
    ctx.fillRect(x + w * 0.1, y + h * 0.42, w * 0.1, h * 0.06);
}

function drawShadowStalkerEnemy(enemy) {
    const x = enemy.x;
    const y = enemy.y;
    const w = enemy.width;
    const h = enemy.height;
    const alpha = enemy.stealthed ? 0.5 : 0.95;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#0E1020";
    ctx.fillRect(x + w * 0.24, y + h * 0.08, w * 0.32, h * 0.22);
    ctx.fillRect(x + w * 0.12, y + h * 0.26, w * 0.56, h * 0.46);
    ctx.fillRect(x + w * 0.04, y + h * 0.46, w * 0.18, h * 0.18);
    ctx.fillRect(x + w * 0.64, y + h * 0.44, w * 0.18, h * 0.18);
    ctx.fillRect(x + w * 0.2, y + h * 0.68, w * 0.14, h * 0.26);
    ctx.fillRect(x + w * 0.48, y + h * 0.68, w * 0.14, h * 0.26);
    ctx.fillStyle = "#232846";
    ctx.fillRect(x + w * 0.18, y + h * 0.3, w * 0.44, h * 0.16);
    ctx.fillRect(x + w * 0.3, y + h * 0.18, w * 0.2, h * 0.08);
    ctx.fillStyle = "#E53935";
    ctx.fillRect(x + w * 0.31, y + h * 0.16, w * 0.08, h * 0.05);
    ctx.fillRect(x + w * 0.47, y + h * 0.16, w * 0.08, h * 0.05);
    ctx.fillStyle = "#9A2424";
    ctx.fillRect(x + w * 0.02, y + h * 0.58, w * 0.08, h * 0.04);
    ctx.fillRect(x + w * 0.82, y + h * 0.56, w * 0.08, h * 0.04);
    if (enemy.stealthed) {
        ctx.fillStyle = "rgba(229, 57, 53, 0.14)";
        ctx.fillRect(x + w * 0.08, y + h * 0.08, w * 0.72, h * 0.78);
    }
    ctx.restore();
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

function drawEnderDragon(dragon) {
    const x = dragon.x;
    const y = dragon.y;
    const w = dragon.width;
    const h = dragon.height;
    const flap = Math.sin((dragon.animationTime || 0) / 6) * h * 0.12;
    const facingRight = dragon.facingRight !== false;
    const outlineColor = "#04050A";
    const bodyColor = "#101116";
    const bodyShadeColor = "#1A1C24";
    const wingMembraneColor = "#090A10";
    const boneColor = "#C7CAD2";
    const eyeColor = dragon.state === "ridden" ? "#FFD54F" : "#D94CFF";
    const spineColor = "#70737D";

    function fillOutlinedRect(px, py, pw, ph, fillColor) {
        ctx.fillStyle = outlineColor;
        ctx.fillRect(px - 2, py - 2, pw + 4, ph + 4);
        ctx.fillStyle = fillColor;
        ctx.fillRect(px, py, pw, ph);
    }

    function fillWing(points) {
        ctx.fillStyle = outlineColor;
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let index = 1; index < points.length; index += 1) {
            ctx.lineTo(points[index][0], points[index][1]);
        }
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = wingMembraneColor;
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let index = 1; index < points.length; index += 1) {
            ctx.lineTo(points[index][0], points[index][1]);
        }
        ctx.closePath();
        ctx.fill();
    }

    ctx.save();
    ctx.translate(facingRight ? x + w : x, y);
    if (facingRight) ctx.scale(-1, 1);

    ctx.fillStyle = "rgba(4, 3, 10, 0.36)";
    ctx.beginPath();
    ctx.ellipse(w * 0.52, h * 0.95, w * 0.42, h * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    fillWing([
        [w * 0.28, h * 0.3],
        [-w * 0.32, -h * 0.48 - flap],
        [-w * 0.52, -h * 0.26 - flap],
        [-w * 0.4, h * 0.08],
        [-w * 0.06, h * 0.14],
        [w * 0.24, h * 0.06]
    ]);
    fillWing([
        [w * 0.64, h * 0.24],
        [w * 1.02, -h * 0.5 + flap],
        [w * 1.22, -h * 0.24 + flap],
        [w * 1.08, h * 0.12],
        [w * 0.78, h * 0.18],
        [w * 0.58, h * 0.08]
    ]);

    ctx.strokeStyle = boneColor;
    ctx.lineWidth = Math.max(2, w * 0.045);
    ctx.lineCap = "square";
    ctx.beginPath();
    ctx.moveTo(w * 0.28, h * 0.26);
    ctx.lineTo(-w * 0.3, -h * 0.46 - flap);
    ctx.moveTo(w * 0.28, h * 0.26);
    ctx.lineTo(-w * 0.42, -h * 0.2 - flap);
    ctx.moveTo(w * 0.28, h * 0.26);
    ctx.lineTo(-w * 0.33, h * 0.04);
    ctx.moveTo(w * 0.64, h * 0.22);
    ctx.lineTo(w * 1.0, -h * 0.48 + flap);
    ctx.moveTo(w * 0.64, h * 0.22);
    ctx.lineTo(w * 1.14, -h * 0.18 + flap);
    ctx.moveTo(w * 0.64, h * 0.22);
    ctx.lineTo(w * 1.02, h * 0.02);
    ctx.stroke();

    fillOutlinedRect(w * 0.26, h * 0.22, w * 0.42, h * 0.28, bodyColor);
    fillOutlinedRect(w * 0.12, h * 0.27, w * 0.18, h * 0.12, bodyShadeColor);
    fillOutlinedRect(-w * 0.08, h * 0.16, w * 0.19, h * 0.15, bodyColor);
    fillOutlinedRect(-w * 0.12, h * 0.23, w * 0.12, h * 0.08, bodyShadeColor);
    fillOutlinedRect(w * 0.4, h * 0.48, w * 0.05, h * 0.28, bodyShadeColor);
    fillOutlinedRect(w * 0.54, h * 0.48, w * 0.05, h * 0.26, bodyShadeColor);

    for (let segment = 0; segment < 7; segment += 1) {
        const segmentX = w * (0.69 + segment * 0.095);
        const segmentY = h * (0.16 - segment * 0.045);
        fillOutlinedRect(segmentX, segmentY, w * 0.1, h * 0.09, bodyColor);
        ctx.fillStyle = spineColor;
        ctx.fillRect(segmentX + w * 0.018, segmentY - h * 0.06, w * 0.05, h * 0.05);
    }

    for (let spine = 0; spine < 5; spine += 1) {
        ctx.fillStyle = spineColor;
        ctx.fillRect(w * (0.31 + spine * 0.08), h * 0.11, w * 0.05, h * 0.05);
    }

    ctx.fillStyle = bodyShadeColor;
    ctx.fillRect(w * 0.36, h * 0.28, w * 0.15, h * 0.1);
    ctx.fillRect(-w * 0.05, h * 0.22, w * 0.05, h * 0.05);
    ctx.fillRect(-w * 0.09, h * 0.1, w * 0.04, h * 0.07);
    ctx.fillRect(w * 0.02, h * 0.09, w * 0.04, h * 0.07);

    ctx.fillStyle = boneColor;
    ctx.fillRect(-w * 0.12, h * 0.08, w * 0.026, h * 0.18);
    ctx.fillRect(0, h * 0.05, w * 0.026, h * 0.18);

    ctx.fillStyle = eyeColor;
    ctx.fillRect(-w * 0.09, h * 0.25, w * 0.04, h * 0.05);
    ctx.fillRect(-w * 0.01, h * 0.25, w * 0.04, h * 0.05);

    if (dragon.rider) {
        ctx.strokeStyle = "#FFD54F";
        ctx.lineWidth = 2;
        ctx.strokeRect(-2, -2, w + 4, h + 4);
    }

    ctx.restore();
    drawHealthBar(x, y - 10, w, dragon.hp, dragon.maxHp);
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
    } else if (proj instanceof DragonFireball || proj instanceof EnderDragonFireball) {
        ctx.fillStyle = "#FF5722";
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#FF9800";
        ctx.stroke();
        if (proj instanceof EnderDragonFireball) {
            ctx.strokeStyle = "#BA68C8";
            ctx.lineWidth = 2;
            ctx.strokeRect(proj.x - 10, proj.y - 10, 20, 20);
        }
    }
}

// 渲染新BOSS系统
function renderBossSystem() {
    if (typeof endDragonArena !== 'undefined' && endDragonArena.active && typeof endDragonArena.renderEntities === 'function') {
        endDragonArena.renderEntities(ctx, 0);
    }
    if (typeof bossArena === 'undefined' || !bossArena.active) return;
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
