/**
 * 14-renderer-decorations.js - 装饰物渲染函数
 * 从 14-renderer.js 拆分
 */

function drawDecoration(decor) {
    switch (decor.type) {
        case "bush":
            drawBush(decor);
            break;
        case "flower":
            drawFlower(decor);
            break;
        case "mushroom":
            drawMushroom(decor);
            break;
        case "vine":
            drawVine(decor);
            break;
        case "ice_spike":
            drawIceSpike(decor);
            break;
        case "snow_pile":
            drawSnowPile(decor);
            break;
        case "ice_block":
            drawIceBlock(decor);
            break;
        case "dead_bush":
            drawDeadBush(decor);
            break;
        case "rock":
            drawRock(decor);
            break;
        case "bones":
            drawBones(decor);
            break;
        case "cactus":
            drawCactusDecor(decor);
            break;
        case "ore_coal":
        case "ore_iron":
        case "ore_gold":
        case "ore_diamond":
            drawOre(decor);
            break;
        case "stalactite":
            drawStalactite(decor);
            break;
        case "crystal":
            drawCrystal(decor);
            break;
        case "lava_pool":
            drawLavaPool(decor);
            break;
        case "shell":
            drawShell(decor);
            break;
        case "starfish":
            drawStarfish(decor);
            break;
        case "seaweed":
            drawSeaweed(decor);
            break;
        case "boat":
            drawBoatDecor(decor);
            break;
        case "fire":
            drawFireDecor(decor);
            break;
        case "lava_fall":
            drawLavaFall(decor);
            break;
        case "soul_sand":
            drawSoulSand(decor);
            break;
        case "nether_wart":
            drawNetherWart(decor);
            break;
        case "basalt":
            drawBasalt(decor);
            break;
        default:
            break;
    }
}

function drawBush(bush) {
    const x = bush.x;
    const y = bush.y;
    ctx.fillStyle = "#2E7D32";
    ctx.beginPath();
    ctx.ellipse(x + 15, y + 10, 15, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4CAF50";
    ctx.beginPath();
    ctx.ellipse(x + 12, y + 8, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    if (bush.variant === 1) {
        ctx.fillStyle = "#2E7D32";
        ctx.beginPath();
        ctx.ellipse(x + 22, y + 12, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
    } else if (bush.variant === 2) {
        ctx.fillStyle = "#FF1744";
        ctx.fillRect(x + 10, y + 5, 3, 3);
        ctx.fillRect(x + 18, y + 7, 3, 3);
    }
}

function drawFlower(flower) {
    const x = flower.x;
    const y = flower.y;
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(x + 5, y + 8, 2, 10);
    ctx.fillStyle = flower.color;
    for (let i = 0; i < 4; i++) {
        const angle = (Math.PI / 2) * i;
        const px = x + 6 + Math.cos(angle) * 4;
        const py = y + 6 + Math.sin(angle) * 4;
        ctx.fillRect(px, py, 4, 4);
    }
    ctx.fillStyle = "#FFEB3B";
    ctx.fillRect(x + 5, y + 5, 3, 3);
}

function drawMushroom(mushroom) {
    const x = mushroom.x;
    const y = mushroom.y;
    ctx.fillStyle = "#F5F5DC";
    ctx.fillRect(x + 6, y + 8, 4, 12);
    ctx.fillStyle = mushroom.isRed ? "#D32F2F" : "#8D6E63";
    ctx.fillRect(x, y, 16, 10);
    ctx.fillRect(x + 2, y - 2, 12, 2);
    if (mushroom.isRed) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(x + 4, y + 3, 3, 3);
        ctx.fillRect(x + 10, y + 5, 2, 2);
        ctx.fillRect(x + 7, y + 1, 2, 2);
    }
}

function drawVine(vine) {
    const x = vine.x;
    const y = vine.y;
    const sway = Math.sin(vine.animFrame * 0.05 + vine.swayOffset) * 3;
    ctx.strokeStyle = "#2E7D32";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    const segments = 5;
    for (let i = 1; i <= segments; i++) {
        const segY = y + (vine.height / segments) * i;
        const segX = x + sway * (i / segments);
        ctx.lineTo(segX, segY);
    }
    ctx.stroke();
    ctx.fillStyle = "#4CAF50";
    for (let i = 1; i < segments; i++) {
        const leafY = y + (vine.height / segments) * i;
        const leafX = x + sway * (i / segments);
        ctx.fillRect(leafX - 3, leafY, 6, 4);
    }
}

function drawIceSpike(spike) {
    const x = spike.x;
    const y = spike.y;
    const h = spike.height;
    const gradient = ctx.createLinearGradient(x, y, x, y + h);
    gradient.addColorStop(0, "#E3F2FD");
    gradient.addColorStop(0.5, "#90CAF9");
    gradient.addColorStop(1, "#42A5F5");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(x + 10, y);
    ctx.lineTo(x + 20, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 5);
    ctx.lineTo(x + 14, y + h / 2);
    ctx.lineTo(x + 10, y + h / 2);
    ctx.fill();
}

function drawSnowPile(pile) {
    const x = pile.x;
    const y = pile.y;
    const w = pile.width;
    const h = pile.height;
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(200, 220, 255, 0.6)";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h - 5, w / 2 - 3, h / 4, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawIceBlock(ice) {
    const x = ice.x;
    const y = ice.y;
    const w = ice.width;
    const h = ice.height;
    ctx.fillStyle = "#B3E5FC";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillRect(x + 5, y + 5, w - 10, 10);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
        const cx = x + Math.random() * w;
        const cy = y + Math.random() * h;
        ctx.beginPath();
        ctx.moveTo(cx - 5, cy);
        ctx.lineTo(cx + 5, cy);
        ctx.moveTo(cx, cy - 5);
        ctx.lineTo(cx, cy + 5);
        ctx.stroke();
    }
}

function drawDeadBush(bush) {
    const x = bush.x;
    const y = bush.y;
    ctx.strokeStyle = "#5D4037";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 30);
    ctx.lineTo(x + 12, y + 15);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 18);
    ctx.lineTo(x + 5, y + 10);
    ctx.moveTo(x + 5, y + 10);
    ctx.lineTo(x + 3, y + 5);
    ctx.moveTo(x + 12, y + 20);
    ctx.lineTo(x + 20, y + 12);
    ctx.moveTo(x + 20, y + 12);
    ctx.lineTo(x + 23, y + 8);
    ctx.stroke();
}

function drawRock(rock) {
    const x = rock.x;
    const y = rock.y;
    const w = rock.width;
    const h = rock.height;
    ctx.fillStyle = "#9E9E9E";
    if (rock.shape === 0) {
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
    } else if (rock.shape === 1) {
        ctx.fillRect(x, y, w, h);
    } else {
        ctx.beginPath();
        ctx.moveTo(x + w * 0.2, y);
        ctx.lineTo(x + w * 0.8, y);
        ctx.lineTo(x + w, y + h * 0.6);
        ctx.lineTo(x + w * 0.7, y + h);
        ctx.lineTo(x + w * 0.3, y + h);
        ctx.lineTo(x, y + h * 0.5);
        ctx.closePath();
        ctx.fill();
    }
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(x + 5, y + h - 5, w - 10, 5);
}

function drawBones(bones) {
    const x = bones.x;
    const y = bones.y;
    ctx.strokeStyle = "#E0E0E0";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y + 6);
    ctx.lineTo(x + 30, y + 6);
    ctx.stroke();
    ctx.fillStyle = "#EEEEEE";
    ctx.beginPath();
    ctx.arc(x + 4, y + 6, 4, 0, Math.PI * 2);
    ctx.arc(x + 26, y + 6, 4, 0, Math.PI * 2);
    ctx.fill();
}

function drawCactusDecor(cactus) {
    const x = cactus.x;
    const y = cactus.y;
    const h = cactus.height;
    ctx.fillStyle = "#2E7D32";
    ctx.fillRect(x + 4, y, 12, h);
    ctx.fillStyle = "#1B5E20";
    for (let i = 0; i < h; i += 10) {
        ctx.fillRect(x + 2, y + i, 2, 4);
        ctx.fillRect(x + 16, y + i + 5, 2, 4);
    }
    if (h > 50) {
        ctx.fillStyle = "#2E7D32";
        ctx.fillRect(x, y + 20, 8, 15);
        ctx.fillRect(x + 12, y + 35, 8, 15);
    }
}

function drawOre(ore) {
    const x = ore.x;
    const y = ore.y;
    ctx.fillStyle = "#757575";
    ctx.fillRect(x, y, 30, 30);
    ctx.fillStyle = ore.color;
    ctx.fillRect(x + 5, y + 8, 8, 8);
    ctx.fillRect(x + 15, y + 5, 10, 6);
    ctx.fillRect(x + 8, y + 18, 6, 8);
    if (ore.oreType === "diamond" || ore.oreType === "gold") {
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.fillRect(x + 7, y + 10, 2, 2);
        ctx.fillRect(x + 18, y + 7, 2, 2);
    }
}

function drawStalactite(stal) {
    const x = stal.x;
    const y = stal.y;
    const h = stal.height;
    ctx.fillStyle = "#616161";
    ctx.beginPath();
    if (stal.direction === "down") {
        ctx.moveTo(x + 10, y);
        ctx.lineTo(x + 20, y + h);
        ctx.lineTo(x, y + h);
    } else {
        ctx.moveTo(x, y);
        ctx.lineTo(x + 20, y);
        ctx.lineTo(x + 10, y + h);
    }
    ctx.closePath();
    ctx.fill();
}

function drawCrystal(crystal) {
    const x = crystal.x;
    const y = crystal.y;
    const glow = 0.6 + Math.sin(crystal.animFrame * 0.1) * 0.2;
    ctx.fillStyle = `rgba(160, 255, 255, ${glow})`;
    ctx.beginPath();
    ctx.moveTo(x + 9, y);
    ctx.lineTo(x + 18, y + 16);
    ctx.lineTo(x + 9, y + 28);
    ctx.lineTo(x, y + 16);
    ctx.closePath();
    ctx.fill();
}

function drawLavaPool(pool) {
    const x = pool.x;
    const y = pool.y;
    const w = pool.width;
    const h = pool.height;
    const wave = Math.sin(pool.animFrame * 0.1) * 3;
    ctx.fillStyle = "#FF5722";
    ctx.fillRect(x, y + wave, w, h);
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.fillRect(x + 5, y + 4 + wave, w - 10, 4);
}

function drawShell(shell) {
    const x = shell.x;
    const y = shell.y;
    const w = shell.width || 28;
    const h = shell.height || 18;
    const variant = shell.variant || "scallop";

    if (variant === "spiral") {
        ctx.fillStyle = "#F8BBD0";
        ctx.beginPath();
        ctx.ellipse(x + w * 0.45, y + h * 0.6, w * 0.42, h * 0.38, -0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#EC407A";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + w * 0.48, y + h * 0.62, h * 0.28, 0.3, Math.PI * 1.9);
        ctx.stroke();
        return;
    }

    if (variant === "conch") {
        ctx.fillStyle = "#FFE082";
        ctx.beginPath();
        ctx.moveTo(x + 2, y + h - 2);
        ctx.lineTo(x + w - 4, y + h * 0.55);
        ctx.lineTo(x + w * 0.6, y + 2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#A1887F";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 5, y + h - 4);
        ctx.lineTo(x + w * 0.7, y + h * 0.58);
        ctx.stroke();
        return;
    }

    ctx.fillStyle = "#FFE0B2";
    ctx.beginPath();
    ctx.ellipse(x + w * 0.5, y + h * 0.7, w * 0.48, h * 0.42, 0, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = "#FFCC80";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
        const sx = x + w * (0.2 + i * 0.2);
        ctx.beginPath();
        ctx.moveTo(sx, y + h * 0.72);
        ctx.lineTo(sx, y + h * 0.45);
        ctx.stroke();
    }
}

function drawStarfish(star) {
    const x = star.x;
    const y = star.y;
    const w = star.width || 30;
    const h = star.height || 30;
    const cx = x + w * 0.5;
    const cy = y + h * 0.48;
    const outerRadius = Math.min(w, h) * 0.5;
    const innerRadius = outerRadius * 0.45;
    ctx.fillStyle = "#FF9800";
    ctx.beginPath();
    for (let index = 0; index < 10; index++) {
        const angle = -Math.PI / 2 + index * (Math.PI / 5);
        const radius = index % 2 === 0 ? outerRadius : innerRadius;
        const pointX = cx + Math.cos(angle) * radius;
        const pointY = cy + Math.sin(angle) * radius;
        if (index === 0) ctx.moveTo(pointX, pointY);
        else ctx.lineTo(pointX, pointY);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#FFB74D";
    ctx.beginPath();
    ctx.arc(cx, cy, innerRadius * 0.55, 0, Math.PI * 2);
    ctx.fill();
}

function drawSeaweed(seaweed) {
    const x = seaweed.x;
    const y = seaweed.y;
    const sway = Math.sin(seaweed.animFrame * 0.05 + seaweed.swayOffset) * 4;
    ctx.strokeStyle = "#2E7D32";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 5, y + seaweed.height);
    ctx.lineTo(x + 5 + sway, y);
    ctx.stroke();
}

function drawBoatDecor(boat) {
    const x = boat.x;
    const y = boat.y;
    ctx.fillStyle = "#8D6E63";
    ctx.fillRect(x, y, boat.width, boat.height);
    ctx.fillStyle = "#6D4C41";
    ctx.fillRect(x + 4, y - 6, boat.width - 8, 6);
}

function drawFireDecor(fire) {
    const x = fire.x;
    const y = fire.y;
    const flicker = Math.sin(fire.animFrame * 0.2) * 2;
    ctx.fillStyle = "#FF5722";
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 24);
    ctx.lineTo(x + 12, y + 24);
    ctx.lineTo(x + 9, y + 6 + flicker);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#FFC107";
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 20);
    ctx.lineTo(x + 12, y + 20);
    ctx.lineTo(x + 9, y + 10 + flicker);
    ctx.closePath();
    ctx.fill();
}

function drawLavaFall(fall) {
    const x = fall.x;
    const y = fall.y;
    const h = fall.height;
    const wobble = Math.sin(fall.animFrame * 0.1) * 2;
    ctx.fillStyle = "#FF7043";
    ctx.fillRect(x + wobble, y, fall.width, h);
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.fillRect(x + wobble + 2, y + 10, fall.width - 4, 6);
}

function drawSoulSand(sand) {
    const x = sand.x;
    const y = sand.y;
    const w = sand.width;
    ctx.fillStyle = "#5D4037";
    ctx.fillRect(x, y, w, sand.height);
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(x + 4, y + 2, w - 8, 4);
}

function drawNetherWart(wart) {
    const x = wart.x;
    const y = wart.y;
    ctx.fillStyle = "#B71C1C";
    ctx.fillRect(x, y, 12, 10);
    ctx.fillStyle = "#D32F2F";
    ctx.fillRect(x + 2, y + 2, 8, 4);
}

function drawBasalt(basalt) {
    const x = basalt.x;
    const y = basalt.y;
    ctx.fillStyle = "#424242";
    ctx.fillRect(x, y, basalt.width, basalt.height);
    ctx.fillStyle = "#303030";
    ctx.fillRect(x + 4, y + 6, basalt.width - 8, 6);
}
