/**
 * 14-renderer-main.js - 主渲染函数
 * 从 14-renderer.js 拆分
 */
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const biome = getBiomeById(currentBiome);
    drawBackground(biome);
    if (typeof renderBiomeVisuals === 'function') renderBiomeVisuals(ctx, cameraX);
    if (typeof renderOceanEnvironment === 'function') renderOceanEnvironment(ctx);
    if (typeof renderEndEnvironment === 'function') renderEndEnvironment(ctx);
    ctx.save();
    ctx.translate(-cameraX, 0);

    // Debug: 检查 platforms 数组
    if (gameFrame % 60 === 0) {
        console.log('Platforms count:', platforms.length, 'Camera X:', cameraX);
    }

    platforms.forEach(p => drawBlock(p.x, p.y, p.width, p.height, p.type));

    if (biome.effects?.waterLevel) {
        ctx.fillStyle = "rgba(33, 150, 243, 0.25)";
        ctx.fillRect(cameraX - 50, biome.effects.waterLevel, canvas.width + 100, canvas.height - biome.effects.waterLevel);
    }

    trees.forEach(t => {
        if (t.shake > 0) t.shake--;
        const shakeX = (Math.random() - 0.5) * t.shake * 2;
        drawPixelTree(ctx, t.x + shakeX, t.y, t.type, t.hp);
    });

    decorations.forEach(d => drawDecoration(d));
    if (typeof renderInteractionChains === 'function') renderInteractionChains(ctx, cameraX);

    chests.forEach(c => drawChest(c.x, c.y, c.opened));

    items.forEach(i => {
        if (!i.collected) drawItem(i.x, i.y + i.floatY, i.wordObj.en);
    });

    wordGates.forEach(gate => drawWordGate(gate));

    // 村庄系统渲染 (v1.8.0)
    if (typeof drawVillages === 'function') drawVillages(ctx);

    if (particles.length) {
        particles.forEach(p => drawParticle(p));
    }
    if (typeof renderSwimBubbles === 'function') renderSwimBubbles(ctx, cameraX);

    enemies.forEach(e => drawEnemy(e));
    if (typeof renderDeepDarkEnemyEffects === "function") renderDeepDarkEnemyEffects(ctx, cameraX);

    // 海洋生物渲染
    if (typeof renderOceanCreatures === 'function') renderOceanCreatures(ctx, cameraX);

    golems.forEach(g => drawGolem(g));

    if (projectiles.length) {
        projectiles.forEach(p => drawProjectile(p));
    }

    // 新BOSS系统渲染
    if (typeof renderBossSystem === 'function') renderBossSystem();

    // 地狱蘑菇渲染
    if (typeof renderNetherMushrooms === 'function') renderNetherMushrooms(ctx, cameraX);

    // 末地实体渲染
    if (typeof renderEndEntities === 'function') renderEndEntities(ctx, cameraX);

    // 技能物品实体渲染
    if (typeof bombs !== 'undefined') bombs.forEach(b => b.render(ctx, cameraX));
    if (typeof webTraps !== 'undefined') webTraps.forEach(w => w.render(ctx, cameraX));
    if (typeof fleshBaits !== 'undefined') fleshBaits.forEach(f => f.render(ctx, cameraX));
    if (typeof torches !== 'undefined') torches.forEach(t => t.render(ctx, cameraX));

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

    // 墨汁效果（全屏遮罩）
    if (typeof renderInkEffect === 'function') renderInkEffect(ctx);
    // 地狱热浪效果
    if (typeof renderNetherHeatEffect === 'function') renderNetherHeatEffect(ctx);
    // 末地速度buff
    if (typeof renderEndSpeedBuff === 'function') renderEndSpeedBuff(ctx);
    if (typeof renderMushroomIslandPenaltyWarning === 'function') renderMushroomIslandPenaltyWarning(ctx);
    if (typeof renderDeepDarkNoiseHud === "function") renderDeepDarkNoiseHud(ctx);

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
    // 新BOSS血条
    if (typeof bossArena !== 'undefined' && bossArena.active && bossArena.boss && bossArena.boss.alive) {
        bossArena.renderBossHpBar(ctx);
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
        } else if (type === "end_stone") {
            ctx.fillStyle = "#D4C99E";
            ctx.fillRect(cx, y, blockSize, h);
            ctx.fillStyle = "#BDB76B";
            ctx.fillRect(cx + 6, y + 4, 8, 8);
            ctx.fillRect(cx + 18, y + 14, 6, 6);
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
                else if (type === "end_stone") ctx.fillStyle = "#B8AD82";
                else ctx.fillStyle = "#5d4037";
                ctx.fillRect(cx, y + h, blockSize, fillHeight);
                ctx.fillStyle = "rgba(0,0,0,0.05)";
                ctx.fillRect(cx + 10, y + h + 10, 20, 20);
            }
        }
    }
}

function drawPixelTree(ctx2d, x, y, type, hp) {
    // Scale all dimensions relative to blockSize (base blockSize=50)
    const s = blockSize / 50;
    const treeW = 80 * s;
    const trunkW = 20 * s;
    const trunkH = 100 * s;
    const totalH = 140 * s;
    const trunkX = x + (treeW - trunkW) / 2;
    const trunkY = y + totalH - trunkH;
    if (type === "cactus") {
        ctx2d.fillStyle = "#2E7D32";
        ctx2d.fillRect(trunkX, trunkY, trunkW, trunkH);
        ctx2d.fillRect(trunkX - 15 * s, trunkY + 10 * s, 15 * s, 10 * s);
        ctx2d.fillRect(trunkX - 15 * s, trunkY - 10 * s, 10 * s, 20 * s);
        ctx2d.fillRect(trunkX + trunkW, trunkY + 20 * s, 15 * s, 10 * s);
        ctx2d.fillRect(trunkX + trunkW + 5 * s, trunkY + 5 * s, 10 * s, 15 * s);
        return;
    }

    if (type === "palm") {
        ctx2d.fillStyle = "#8D6E63";
        ctx2d.fillRect(trunkX + 6 * s, trunkY - 20 * s, 8 * s, trunkH + 20 * s);
        ctx2d.fillStyle = "#2E7D32";
        ctx2d.beginPath();
        ctx2d.moveTo(trunkX + 10 * s, trunkY - 30 * s);
        ctx2d.lineTo(trunkX - 10 * s, trunkY - 10 * s);
        ctx2d.lineTo(trunkX + 30 * s, trunkY - 10 * s);
        ctx2d.closePath();
        ctx2d.fill();
        return;
    }

    if (type === "spruce" || type === "pine") {
        ctx2d.fillStyle = "#5D4037";
        ctx2d.fillRect(trunkX + 4 * s, trunkY, trunkW - 8 * s, trunkH);
        ctx2d.fillStyle = type === "spruce" ? "#1B5E20" : "#2E7D32";
        ctx2d.beginPath();
        ctx2d.moveTo(x + 40 * s, y + 10 * s);
        ctx2d.lineTo(x + 10 * s, y + 70 * s);
        ctx2d.lineTo(x + 70 * s, y + 70 * s);
        ctx2d.closePath();
        ctx2d.fill();
        ctx2d.fillStyle = "rgba(255,255,255,0.5)";
        ctx2d.fillRect(x + 20 * s, y + 40 * s, 40 * s, 6 * s);
        return;
    }

    if (type === "brown_mushroom" || type === "red_mushroom") {
        const capColor = type === "red_mushroom" ? "#D32F2F" : "#8D6E63";
        ctx2d.fillStyle = "#E8D8B0";
        ctx2d.fillRect(trunkX + 3 * s, trunkY + 20 * s, trunkW - 6 * s, trunkH - 20 * s);
        ctx2d.fillStyle = capColor;
        ctx2d.fillRect(x + 6 * s, y + 30 * s, treeW - 12 * s, 34 * s);
        ctx2d.fillRect(x + 14 * s, y + 12 * s, treeW - 28 * s, 22 * s);
        if (type === "red_mushroom") {
            ctx2d.fillStyle = "#FFFFFF";
            ctx2d.fillRect(x + 20 * s, y + 22 * s, 7 * s, 7 * s);
            ctx2d.fillRect(x + 44 * s, y + 26 * s, 6 * s, 6 * s);
            ctx2d.fillRect(x + 56 * s, y + 20 * s, 5 * s, 5 * s);
        }
        return;
    }

    let leafColor = "#2E7D32";
    if (type === "birch") leafColor = "#7CB342";
    if (type === "dark_oak") leafColor = "#1B5E20";
    if (type === "mushroom") leafColor = "#D32F2F";
    if (type === "cherry") leafColor = "#FFB7C5";

    if (type === "birch") {
        ctx2d.fillStyle = "#F5F5F5";
    } else if (type === "dark_oak") {
        ctx2d.fillStyle = "#4E342E";
    } else {
        ctx2d.fillStyle = "#5D4037";
    }
    ctx2d.fillRect(trunkX, trunkY, trunkW, trunkH);

    ctx2d.fillStyle = leafColor;
    ctx2d.fillRect(x, y + 40 * s, treeW, 40 * s);
    ctx2d.fillRect(x + 10 * s, y + 20 * s, 60 * s, 20 * s);
    ctx2d.fillRect(x + 20 * s, y, 40 * s, 20 * s);

    if (type === "birch") {
        ctx2d.fillStyle = "#424242";
        ctx2d.fillRect(trunkX + 4 * s, trunkY + 10 * s, 4 * s, 6 * s);
        ctx2d.fillRect(trunkX + 12 * s, trunkY + 28 * s, 4 * s, 6 * s);
    }

    if (hp < 5) {
        ctx2d.fillStyle = "rgba(0,0,0,0.3)";
        const crackH = (5 - hp) * 10 * s;
        ctx2d.fillRect(trunkX + 5 * s, trunkY + trunkH - crackH, 10 * s, crackH);
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
    } else if (p.type === "end_particle") {
        ctx.globalAlpha = Math.min(1, p.life / 60);
        ctx.fillStyle = p.color || "#CE93D8";
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.globalAlpha = 1;
    }
}

function drawBackground(biome) {
    const ambient = biome.effects?.ambient || "#87CEEB";
    ctx.fillStyle = ambient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (currentBiome === "volcano" && typeof renderVolcanoSilhouette === "function") {
        renderVolcanoSilhouette(ctx);
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

    if (currentBiome !== "volcano") {
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        for (let i = 0; i < 4; i++) {
            const cx = (i * 220 + (cameraX * 0.4) % 220) - 100;
            ctx.beginPath();
            ctx.arc(cx, 80, 30, 0, Math.PI * 2);
            ctx.arc(cx + 40, 90, 20, 0, Math.PI * 2);
            ctx.arc(cx + 70, 80, 26, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.fillStyle = "rgba(255, 215, 0, 0.8)";
    ctx.beginPath();
    ctx.arc(canvas.width - 80, 60, 24, 0, Math.PI * 2);
    ctx.fill();

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

    if (biome.effects?.heatWave && currentBiome !== "volcano") {
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
