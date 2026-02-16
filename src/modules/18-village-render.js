/**
 * 18-village-render.js - 村庄渲染模块 (v1.9.0)
 */

function drawVillages(ctx) {
    if (!activeVillages || !activeVillages.length) return;
    activeVillages.forEach(v => {
        drawVillageGround(ctx, v);
        v.buildings.forEach(b => drawVillageBuilding(ctx, b, v.style));
        v.npcs.forEach(npc => drawVillageNPC(ctx, npc));
    });
}

function drawVillageGround(ctx, village) {
    const s = village.style;
    // 路径
    ctx.fillStyle = s.path;
    ctx.fillRect(village.x, groundY - 4, village.width, 8);
    // 入口标记
    ctx.fillStyle = s.accent;
    ctx.fillRect(village.x - 5, groundY - 40, 10, 40);
    ctx.fillRect(village.x + village.width - 5, groundY - 40, 10, 40);
    // 旗帜
    ctx.fillStyle = "#FFF";
    ctx.fillRect(village.x - 3, groundY - 55, 20, 12);
    ctx.fillRect(village.x + village.width - 17, groundY - 55, 20, 12);
    ctx.fillStyle = "#333";
    ctx.font = "9px monospace";
    ctx.fillText("村", village.x + 2, groundY - 46);
    ctx.fillText("村", village.x + village.width - 12, groundY - 46);
}

function drawVillageBuilding(ctx, b, style) {
    const s = style;
    // 墙体
    ctx.fillStyle = b.used ? "#9E9E9E" : s.wall;
    ctx.fillRect(b.x, b.y, b.width, b.height);
    // 屋顶
    ctx.fillStyle = s.roof;
    ctx.beginPath();
    ctx.moveTo(b.x - 8, b.y);
    ctx.lineTo(b.x + b.width / 2, b.y - 20);
    ctx.lineTo(b.x + b.width + 8, b.y);
    ctx.closePath();
    ctx.fill();
    // 门
    ctx.fillStyle = "#5D4037";
    ctx.fillRect(b.x + b.width / 2 - 8, b.y + b.height - 25, 16, 25);
    // 窗户
    ctx.fillStyle = "#BBDEFB";
    ctx.fillRect(b.x + 8, b.y + 12, 14, 12);
    ctx.fillRect(b.x + b.width - 22, b.y + 12, 14, 12);
    // 图标标签
    ctx.fillStyle = "#333";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.fillText(b.label, b.x + b.width / 2, b.y - 24);
    ctx.textAlign = "left";
    // 已使用标记
    if (b.used) {
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(b.x, b.y, b.width, b.height);
        ctx.fillStyle = "#FFF";
        ctx.font = "bold 14px monospace";
        ctx.textAlign = "center";
        ctx.fillText("✓", b.x + b.width / 2, b.y + b.height / 2 + 5);
        ctx.textAlign = "left";
    }
}

function drawVillageNPC(ctx, npc) {
    // 身体
    ctx.fillStyle = "#8D6E63";
    ctx.fillRect(npc.x + 4, npc.y + 16, 16, 24);
    // 头
    ctx.fillStyle = "#FFCCBC";
    ctx.fillRect(npc.x + 5, npc.y, 14, 16);
    // 眼睛
    ctx.fillStyle = "#333";
    ctx.fillRect(npc.x + 8, npc.y + 5, 3, 3);
    ctx.fillRect(npc.x + 14, npc.y + 5, 3, 3);
    // 鼻子
    ctx.fillStyle = "#A1887F";
    ctx.fillRect(npc.x + 10, npc.y + 9, 4, 5);
    // 腿
    ctx.fillStyle = "#5D4037";
    ctx.fillRect(npc.x + 5, npc.y + 40, 6, 8);
    ctx.fillRect(npc.x + 13, npc.y + 40, 6, 8);
    // 对话气泡
    if (npc.chatTimer > 0 && npc.chatBubble) {
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fillRect(npc.x - 10, npc.y - 25, 50, 18);
        ctx.fillStyle = "#333";
        ctx.font = "10px monospace";
        ctx.fillText(npc.chatBubble, npc.x - 6, npc.y - 12);
    }
}
