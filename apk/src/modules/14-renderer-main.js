/**
 * 14-renderer-main.js - 主渲染函数
 * 从 14-renderer.js 拆分
 */
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const biome = getBiomeById(currentBiome);
    drawBackground(biome);
    ctx.save();
    ctx.translate(-cameraX, 0);

    platforms.forEach(p => drawBlock(p.x, p.y, p.width, p.height, p.type));

    if (biome.effects?.waterLevel) {
        const wl = biome.effects.waterLevel;
        // Gradient water overlay (lighter at surface, darker at bottom)
        const grad = ctx.createLinearGradient(0, wl, 0, canvas.height);
        grad.addColorStop(0, "rgba(33, 150, 243, 0.15)");
        grad.addColorStop(0.4, "rgba(21, 101, 192, 0.30)");
        grad.addColorStop(1, "rgba(13, 71, 161, 0.45)");
        ctx.fillStyle = grad;
        ctx.fillRect(cameraX - 50, wl, canvas.width + 100, canvas.height - wl);

        // Water surface wave line
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let wx = cameraX - 50; wx < cameraX + canvas.width + 50; wx += 8) {
            const wy = wl + Math.sin((wx + gameFrame * 1.5) * 0.03) * 3;
            wx === cameraX - 50 ? ctx.moveTo(wx, wy) : ctx.lineTo(wx, wy);
        }
        ctx.stroke();

        // Light rays from surface
        ctx.save();
        ctx.globalAlpha = 0.06;
        for (let r = 0; r < 5; r++) {
            const rx = cameraX + ((r * 197 + gameFrame * 0.3) % (canvas.width + 100)) - 50;
            const rw = 20 + r * 8;
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.moveTo(rx, wl);
            ctx.lineTo(rx - rw, canvas.height);
            ctx.lineTo(rx + rw, canvas.height);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();

        // Background fish (small, non-interactive, parallax)
        ctx.save();
        const fishColors = ["#FF6F00", "#E91E63", "#4CAF50", "#FFEB3B", "#00BCD4"];
        for (let f = 0; f < 6; f++) {
            const fishSeed = f * 137;
            const fishX = cameraX + ((fishSeed + gameFrame * (0.3 + f * 0.1)) % (canvas.width + 200)) - 100;
            const fishY = wl + 40 + (fishSeed * 7) % (canvas.height - wl - 80);
            const fishSize = 6 + (f % 3) * 3;
            const fishDir = f % 2 === 0 ? 1 : -1;
            ctx.fillStyle = fishColors[f % fishColors.length];
            // Fish body (ellipse)
            ctx.beginPath();
            ctx.ellipse(fishX, fishY, fishSize, fishSize * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
            // Fish tail
            ctx.beginPath();
            ctx.moveTo(fishX - fishDir * fishSize, fishY);
            ctx.lineTo(fishX - fishDir * (fishSize + 5), fishY - 3);
            ctx.lineTo(fishX - fishDir * (fishSize + 5), fishY + 3);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }

    trees.forEach(t => {
        if (t.shake > 0) t.shake--;
        const shakeX = (Math.random() - 0.5) * t.shake * 2;
        drawPixelTree(ctx, t.x + shakeX, t.y, t.type, t.hp);
    });

    decorations.forEach(d => drawDecoration(d));

    chests.forEach(c => drawChest(c.x, c.y, c.opened));

    items.forEach(i => {
        if (!i.collected) drawItem(i.x, i.y + i.floatY, i.wordObj.en);
    });

    wordGates.forEach(gate => drawWordGate(gate));

    if (particles.length) {
        particles.forEach(p => drawParticle(p));
    }

    enemies.forEach(e => drawEnemy(e));

    golems.forEach(g => drawGolem(g));

    if (projectiles.length) {
        projectiles.forEach(p => drawProjectile(p));
    }

    drawSteve(player.x, player.y, player.facingRight, player.isAttacking);

    ctx.fillStyle = "#FFF";
    ctx.font = "bold 20px Verdana";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    floatingTexts.forEach(t => {
        ctx.strokeText(t.text, t.x + 10, t.y);
        ctx.fillText(t.text, t.x + 10, t.y);
    });

    chests.forEach(c => {
        if (!c.opened && Math.abs(player.x - c.x) < 60 && !chestHintSeen) {
            triggerChestHint();
            chestHintPos = { x: c.x, y: c.y };
        }
    });

    if (chestHintFramesLeft > 0 && chestHintPos) {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 4;
        ctx.fillStyle = "white";
        const hint = "按(📦)打开";
        ctx.strokeText(hint, chestHintPos.x - 10, chestHintPos.y - 15);
        ctx.fillText(hint, chestHintPos.x - 10, chestHintPos.y - 15);
        chestHintFramesLeft--;
    }

    ctx.restore();

    const boss = enemies.find(e => e.type === "ender_dragon" && !e.remove);
    if (boss) {
        const barW = 360;
        const barH = 14;
        const bx = (canvas.width - barW) / 2;
        const by = 20;
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(bx - 4, by - 4, barW + 8, barH + 8);
        ctx.fillStyle = "#111";
        ctx.fillRect(bx, by, barW, barH);
        const pct = Math.max(0, boss.hp / boss.maxHp);
        ctx.fillStyle = "#8E24AA";
        ctx.fillRect(bx, by, barW * pct, barH);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 14px Verdana";
        ctx.textAlign = "center";
        ctx.fillText("末影龙", canvas.width / 2, by - 6);
        ctx.textAlign = "left";
    }

    requestAnimationFrame(() => { update(); draw(); });
}

function drawBlock(x, y, w, h, type) {
    const cols = Math.ceil(w / blockSize);
    for (let i = 0; i < cols; i++) {
        const cx = x + i * blockSize;
        if (type === "grass") {
            ctx.fillStyle = "#5d4037";
            ctx.fillRect(cx, y, blockSize, h);
            ctx.fillStyle = "#4CAF50";
            ctx.fillRect(cx, y, blockSize, h / 3);
        } else if (type === "snow") {
            ctx.fillStyle = "#1e3f66";
            ctx.fillRect(cx, y, blockSize, h);
            ctx.fillStyle = "#fff";
            ctx.fillRect(cx, y, blockSize, h / 3);
        } else if (type === "stone") {
            ctx.fillStyle = "#757575";
            ctx.fillRect(cx, y, blockSize, h);
            ctx.fillStyle = "#424242";
            ctx.fillRect(cx + 5, y + 5, 10, 10);
        } else if (type === "sand") {
            ctx.fillStyle = "#FDD835";
            ctx.fillRect(cx, y, blockSize, h);
        } else if (type === "netherrack") {
            ctx.fillStyle = "#5E1B1B";
            ctx.fillRect(cx, y, blockSize, h);
            ctx.fillStyle = "#8B0000";
            ctx.fillRect(cx + 4, y + 6, 12, 8);
            ctx.fillRect(cx + 20, y + 16, 10, 8);
        } else if (type === "cloud") {
            ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
            ctx.beginPath();
            ctx.ellipse(cx + blockSize / 2, y + h / 2, blockSize / 2, h / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(200, 230, 255, 0.4)";
            ctx.beginPath();
            ctx.ellipse(cx + blockSize / 2 - 4, y + h / 2 - 3, blockSize / 3, h / 3, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = "#5d4037";
            ctx.fillRect(cx, y, blockSize, h);
            ctx.fillStyle = "#4CAF50";
            ctx.fillRect(cx, y, blockSize, h / 3);
        }

        ctx.strokeStyle = "rgba(0,0,0,0.1)";
        ctx.strokeRect(cx, y, blockSize, h);

        if (y >= groundY) {
            const fillHeight = canvasHeight - (y + h);
            if (fillHeight > 0) {
                if (type === "grass") ctx.fillStyle = "#5d4037";
                else if (type === "snow") ctx.fillStyle = "#1e3f66";
                else if (type === "stone") ctx.fillStyle = "#757575";
                else if (type === "sand") ctx.fillStyle = "#FDD835";
                else if (type === "netherrack") ctx.fillStyle = "#3E1010";
                else ctx.fillStyle = "#5d4037";
                ctx.fillRect(cx, y + h, blockSize, fillHeight);
                ctx.fillStyle = "rgba(0,0,0,0.05)";
                ctx.fillRect(cx + 10, y + h + 10, 20, 20);
            }
        }
    }
}

function drawPixelTree(ctx2d, x, y, type, hp) {
    const trunkW = 20;
    const trunkH = 100;
    const trunkX = x + (80 - trunkW) / 2;
    const trunkY = y + 140 - trunkH;
    if (type === "cactus") {
        ctx2d.fillStyle = "#2E7D32";
        ctx2d.fillRect(trunkX, trunkY, trunkW, trunkH);
        ctx2d.fillRect(trunkX - 15, trunkY + 10, 15, 10);
        ctx2d.fillRect(trunkX - 15, trunkY - 10, 10, 20);
        ctx2d.fillRect(trunkX + 20, trunkY + 20, 15, 10);
        ctx2d.fillRect(trunkX + 25, trunkY + 5, 10, 15);
        return;
    }

    if (type === "palm") {
        ctx2d.fillStyle = "#8D6E63";
        ctx2d.fillRect(trunkX + 6, trunkY - 20, 8, trunkH + 20);
        ctx2d.fillStyle = "#2E7D32";
        ctx2d.beginPath();
        ctx2d.moveTo(trunkX + 10, trunkY - 30);
        ctx2d.lineTo(trunkX - 10, trunkY - 10);
        ctx2d.lineTo(trunkX + 30, trunkY - 10);
        ctx2d.closePath();
        ctx2d.fill();
        return;
    }

    if (type === "spruce" || type === "pine") {
        ctx2d.fillStyle = "#5D4037";
        ctx2d.fillRect(trunkX + 4, trunkY, trunkW - 8, trunkH);
        ctx2d.fillStyle = type === "spruce" ? "#1B5E20" : "#2E7D32";
        ctx2d.beginPath();
        ctx2d.moveTo(x + 40, y + 10);
        ctx2d.lineTo(x + 10, y + 70);
        ctx2d.lineTo(x + 70, y + 70);
        ctx2d.closePath();
        ctx2d.fill();
        ctx2d.fillStyle = "rgba(255,255,255,0.5)";
        ctx2d.fillRect(x + 20, y + 40, 40, 6);
        return;
    }

    let leafColor = "#2E7D32";
    if (type === "birch") leafColor = "#7CB342";
    if (type === "dark_oak") leafColor = "#1B5E20";
    if (type === "mushroom") leafColor = "#D32F2F";

    if (type === "birch") {
        ctx2d.fillStyle = "#F5F5F5";
    } else if (type === "dark_oak") {
        ctx2d.fillStyle = "#4E342E";
    } else {
        ctx2d.fillStyle = "#5D4037";
    }
    ctx2d.fillRect(trunkX, trunkY, trunkW, trunkH);

    ctx2d.fillStyle = leafColor;
    ctx2d.fillRect(x, y + 40, 80, 40);
    ctx2d.fillRect(x + 10, y + 20, 60, 20);
    ctx2d.fillRect(x + 20, y, 40, 20);

    if (type === "birch") {
        ctx2d.fillStyle = "#424242";
        ctx2d.fillRect(trunkX + 4, trunkY + 10, 4, 6);
        ctx2d.fillRect(trunkX + 12, trunkY + 28, 4, 6);
    }

    if (hp < 5) {
        ctx2d.fillStyle = "rgba(0,0,0,0.3)";
        const crackH = (5 - hp) * 10;
        ctx2d.fillRect(trunkX + 5, trunkY + trunkH - crackH, 10, crackH);
    }
}

function drawChest(x, y, opened) {
    const size = blockSize * 0.8;
    ctx.fillStyle = "#795548";
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = "#3E2723";
    ctx.strokeRect(x, y, size, size);
    ctx.fillStyle = "#FFC107";
    if (opened) {
        ctx.fillRect(x + size * 0.38, y + size * 0.12, size * 0.25, size * 0.12);
        ctx.fillStyle = "#000";
        ctx.fillText("?", x + size * 0.25, y + size * 0.62);
    } else {
        ctx.fillRect(x + size * 0.38, y + size * 0.45, size * 0.25, size * 0.15);
    }
}

function drawItem(x, y, text) {
    const size = blockSize * 0.6;
    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size / 2;
    const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.2, cx, cy, r);
    grad.addColorStop(0, "#FFF7B0");
    grad.addColorStop(0.55, "#FFD54F");
    grad.addColorStop(1, "#F9A825");

    ctx.save();
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#C99700";
    ctx.lineWidth = Math.max(2, size * 0.08);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = Math.max(1, size * 0.05);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.72, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.beginPath();
    ctx.arc(cx - r * 0.25, cy - r * 0.28, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = Math.max(2, size * 0.12);
    ctx.font = `bold ${Math.max(12, Math.round(size * 0.6))}px Arial`;
    ctx.textAlign = "center";
    ctx.strokeText(text, cx, y - size * 0.2);
    ctx.fillText(text, cx, y - size * 0.2);
}

function drawWordGate(gate) {
    if (!gate || gate.remove) return;
    ctx.save();
    ctx.translate(0, 0);
    ctx.fillStyle = gate.locked ? "#FFA726" : "#4CAF50";
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 3;
    ctx.fillRect(gate.x, gate.y, gate.width, gate.height);
    ctx.strokeRect(gate.x, gate.y, gate.width, gate.height);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px Verdana";
    ctx.textAlign = "center";
    ctx.fillText(gate.wordObj?.en || "词语", gate.x + gate.width / 2, gate.y + 28);
    ctx.font = "14px Verdana";
    ctx.fillText(gate.locked ? "词语闸门" : "已解锁", gate.x + gate.width / 2, gate.y + gate.height - 12);
    ctx.restore();
}

function drawParticle(p) {
    if (p.type === "snowflake") {
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillRect(p.x, p.y, p.size, p.size);
    } else if (p.type === "leaf") {
        ctx.fillStyle = p.color || "#7CB342";
        ctx.fillRect(p.x, p.y, p.size, p.size);
    } else if (p.type === "dust") {
        ctx.fillStyle = "rgba(210, 180, 120, 0.5)";
        ctx.fillRect(p.x, p.y, p.size, p.size);
    } else if (p.type === "ember") {
        ctx.fillStyle = "rgba(255, 140, 0, 0.8)";
        ctx.fillRect(p.x, p.y, p.size, p.size);
    } else if (p.type === "bubble") {
        ctx.strokeStyle = "rgba(173, 216, 230, 0.8)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.stroke();
    } else if (p.type === "sparkle") {
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fillRect(p.x, p.y, p.size, p.size);
    } else if (p.type === "rain") {
        ctx.strokeStyle = "rgba(120, 170, 255, 0.8)";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.velX, p.y + p.size);
        ctx.stroke();
    }
}

function drawBackground(biome) {
    const ambient = biome.effects?.ambient || "#87CEEB";
    ctx.fillStyle = ambient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ocean biome: underwater gradient background instead of mountains
    if (biome.id === "ocean") {
        const wl = biome.effects?.waterLevel || 150;
        // Sky above water
        const skyGrad = ctx.createLinearGradient(0, 0, 0, wl);
        skyGrad.addColorStop(0, "#87CEEB");
        skyGrad.addColorStop(1, "#B3E5FC");
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvas.width, wl);
        // Deep water below
        const waterGrad = ctx.createLinearGradient(0, wl, 0, canvas.height);
        waterGrad.addColorStop(0, "#42A5F5");
        waterGrad.addColorStop(0.5, "#1E88E5");
        waterGrad.addColorStop(1, "#0D47A1");
        ctx.fillStyle = waterGrad;
        ctx.fillRect(0, wl, canvas.width, canvas.height - wl);

        // Coral reef silhouettes at bottom (background layer)
        const parallaxX = cameraX * 0.15;
        ctx.fillStyle = "rgba(0, 77, 64, 0.2)";
        for (let c = 0; c < 6; c++) {
            const cx = (c * 160 - parallaxX % 160 + 960) % 960 - 80;
            const ch = 30 + (c * 17) % 40;
            ctx.beginPath();
            ctx.ellipse(cx, canvas.height - 20, 25 + c * 5, ch, 0, Math.PI, 0);
            ctx.fill();
        }
    } else if (biome.id === "sky") {
        // Sky biome: gradient sky with distant clouds
        const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGrad.addColorStop(0, "#4FC3F7");
        skyGrad.addColorStop(0.4, "#81D4FA");
        skyGrad.addColorStop(1, "#B3E5FC");
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Distant cloud layers (parallax)
        const parallaxX = cameraX * 0.1;
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        for (let c = 0; c < 5; c++) {
            const cx = (c * 200 - parallaxX % 200 + 1000) % 1000 - 100;
            ctx.beginPath();
            ctx.arc(cx, 120 + c * 30, 40 + c * 10, 0, Math.PI * 2);
            ctx.arc(cx + 50, 130 + c * 30, 30 + c * 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Rainbow (subtle, background)
        ctx.save();
        ctx.globalAlpha = 0.12;
        const rainbowColors = ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#8B00FF"];
        for (let r = 0; r < rainbowColors.length; r++) {
            ctx.strokeStyle = rainbowColors[r];
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height + 100, 300 - r * 8, Math.PI, 0);
            ctx.stroke();
        }
        ctx.restore();
    } else if (biome.id === "cave") {
        // Cave biome: dark background with stalactites and torch glow
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Ceiling stalactites (background layer)
        ctx.fillStyle = "rgba(80, 80, 100, 0.5)";
        for (let s = 0; s < 8; s++) {
            const sx = (s * 120 + (cameraX * 0.15) % 120 + 960) % 960 - 60;
            const sh = 20 + (s * 13) % 30;
            ctx.beginPath();
            ctx.moveTo(sx, 0);
            ctx.lineTo(sx + 8, sh);
            ctx.lineTo(sx + 16, 0);
            ctx.fill();
        }

        // Torch light around player (radial gradient)
        ctx.save();
        const px = player.x - cameraX;
        const py = player.y;
        const torchGrad = ctx.createRadialGradient(px, py, 20, px, py, 200);
        torchGrad.addColorStop(0, "rgba(255, 200, 100, 0.15)");
        torchGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = torchGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    } else {
        const parallaxX = cameraX * 0.2;
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        for (let i = 0; i < 3; i++) {
            const mx = -parallaxX + i * 400;
            ctx.beginPath();
            ctx.moveTo(mx, canvas.height - 200);
            ctx.lineTo(mx + 200, canvas.height - 320);
            ctx.lineTo(mx + 400, canvas.height - 200);
            ctx.closePath();
            ctx.fill();
        }
    }

    ctx.fillStyle = "rgba(255,255,255,0.6)";
    for (let i = 0; i < 4; i++) {
        const cx = (i * 220 + (cameraX * 0.4) % 220) - 100;
        ctx.beginPath();
        ctx.arc(cx, 80, 30, 0, Math.PI * 2);
        ctx.arc(cx + 40, 90, 20, 0, Math.PI * 2);
        ctx.arc(cx + 70, 80, 26, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = "rgba(255, 215, 0, 0.8)";
    ctx.beginPath();
    ctx.arc(canvas.width - 80, 60, 24, 0, Math.PI * 2);
    ctx.fill();

    if (biome.effects?.darkness) {
        ctx.fillStyle = `rgba(0,0,0,${biome.effects.darkness})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (weatherState.type === "fog") {
        ctx.fillStyle = "rgba(200,200,200,0.25)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (weatherState.type === "sandstorm") {
        ctx.fillStyle = "rgba(210,180,140,0.35)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (weatherState.type === "rain") {
        ctx.fillStyle = "rgba(0,0,50,0.15)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (weatherState.type === "snow") {
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (biome.effects?.heatWave) {
        ctx.strokeStyle = "rgba(255, 200, 120, 0.25)";
        for (let y = 120; y < canvas.height; y += 40) {
            ctx.beginPath();
            for (let x = 0; x <= canvas.width; x += 40) {
                const offset = Math.sin((x + gameFrame) * 0.02 + y * 0.05) * 6;
                ctx.lineTo(x, y + offset);
            }
            ctx.stroke();
        }
    }
}
