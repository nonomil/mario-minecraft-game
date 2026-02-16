/**
 * 18-village-render.js - Village rendering
 * v1.8.0
 */

function drawVillages(ctx) {
  if (!settings?.villageEnabled) return;
  if (!Array.isArray(activeVillages)) return;
  for (const village of activeVillages) {
    if (!village) continue;
    if (village.x + village.width < cameraX - 100) continue;
    if (village.x > cameraX + canvas.width + 100) continue;
    drawVillageGround(ctx, village);
    drawVillageDecorations(ctx, village);
    if (Array.isArray(village.buildings)) {
      for (const building of village.buildings) {
        drawVillageBuilding(ctx, building, village.style || {});
      }
    }
    if (Array.isArray(village.npcs)) {
      for (const npc of village.npcs) {
        drawVillageNPC(ctx, npc);
      }
    }
  }
}

function drawVillageNPC(ctx, npc) {
  if (!npc) return;
  const sx = npc.x - cameraX;
  const sy = groundY - 24;
  const legOffset = npc.animFrame === 0 ? 0 : 2;

  ctx.fillStyle = "#8B4513";
  ctx.fillRect(sx, sy, 16, 24);

  ctx.fillStyle = "#FFF";
  const eyeX = npc.facingRight ? sx + 10 : sx + 3;
  ctx.fillRect(eyeX, sy + 4, 4, 4);

  ctx.fillStyle = "#5D4037";
  ctx.fillRect(sx + 2 + legOffset, sy + 20, 5, 4);
  ctx.fillRect(sx + 9 + legOffset, sy + 20, 5, 4);

  if (npc.showBubble) {
    const bubbleW = 80;
    const bubbleH = 20;
    const bubbleX = sx + 8 - bubbleW / 2;
    const bubbleY = sy - bubbleH - 8;
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 4);
    } else {
      ctx.rect(bubbleX, bubbleY, bubbleW, bubbleH);
    }
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#000";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(npc.bubbleText || "", sx + 8, bubbleY + 14);
    ctx.textAlign = "left";
  }
}

function drawVillageGround(ctx, village) {
  if (!village) return;
  const sx = village.x - cameraX;
  const w = village.width || 0;
  const groundColor = village.style?.groundColor || "#6D4C41";
  ctx.fillStyle = groundColor;
  ctx.fillRect(sx, groundY, w, 6);
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 1;
  for (let i = 0; i < w; i += 20) {
    ctx.strokeRect(sx + i, groundY, 20, 6);
  }
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fillRect(sx, groundY - 300, 4, 300);
  ctx.fillRect(sx + w - 4, groundY - 300, 4, 300);
}

function drawVillageBuilding(ctx, building, style) {
  if (!building) return;
  const sx = building.x - cameraX;
  const sy = groundY - building.h;
  const colors = style?.buildingColors || {};
  const wall = colors.wall || "#8D6E63";
  const roof = colors.roof || "#5D4037";
  const door = colors.door || "#3E2723";

  ctx.fillStyle = wall;
  ctx.fillRect(sx, sy, building.w, building.h);
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 1;
  for (let row = 0; row < building.h; row += 10) {
    ctx.beginPath();
    ctx.moveTo(sx, sy + row);
    ctx.lineTo(sx + building.w, sy + row);
    ctx.stroke();
  }

  ctx.fillStyle = roof;
  ctx.beginPath();
  ctx.moveTo(sx - 8, sy);
  ctx.lineTo(sx + building.w / 2, sy - 25);
  ctx.lineTo(sx + building.w + 8, sy);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = door;
  const doorW = 16;
  const doorH = Math.min(30, building.h - 5);
  ctx.fillRect(sx + building.w / 2 - doorW / 2, sy + building.h - doorH, doorW, doorH);

  if (building.w >= 60) {
    ctx.fillStyle = "#FFEB3B";
    ctx.globalAlpha = 0.8;
    ctx.fillRect(sx + 8, sy + 8, 12, 12);
    if (building.w >= 80) {
      ctx.fillRect(sx + building.w - 20, sy + 8, 12, 12);
    }
    ctx.globalAlpha = 1.0;
  }

  const icons = {
    bed_house: "🛏️",
    word_house: "📎",
    save_stone: "🧱",
    library: "📘",
    hot_spring: "♨️",
    water_station: "🚧",
    blacksmith: "⚒️",
    lighthouse: "🗼",
    brewing_stand: "⚙️"
  };
  const icon = icons[building.type] || "🏠";
  const iconSize = 16 * (worldScale?.x || 1);
  ctx.font = `${iconSize}px serif`;
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff";
  ctx.fillText(icon, sx + building.w / 2, sy - 30);
  ctx.textAlign = "left";

  switch (building.type) {
    case "library":
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = "#8B4513";
        ctx.fillRect(sx + 10 + i * 8, sy - 60 + i * 8, 8, 12);
      }
      ctx.fillStyle = "#5D4037";
      ctx.fillRect(sx + 14, sy - 64, 4, 24);
      break;
    case "hot_spring":
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.beginPath();
      ctx.arc(sx + building.w / 2, sy - 30, 10, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "water_station":
      ctx.fillStyle = "#4FC3F7";
      ctx.fillRect(sx + 8, sy - 40, 16, 20);
      ctx.fillStyle = "#0277BD";
      ctx.fillRect(sx + 10, sy - 40, 12, 12);
      break;
    case "blacksmith":
      ctx.fillStyle = "#795548";
      ctx.fillRect(sx + 6, sy - 30, building.w - 12, 8);
      ctx.fillStyle = "#3E2723";
      ctx.fillRect(sx + 16, sy - 24, 16, 12);
      break;
    case "lighthouse":
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = `rgba(255, 255, ${200 + i * 55}, ${Math.random() * 0.3 + 0.2})`;
        ctx.fillRect(sx + 12 + i * 4, sy - 70 - i * 6, 8, 8);
      }
      ctx.fillStyle = "#FFEB3B";
      ctx.fillRect(sx + 12, sy - 58, building.w - 20, 8);
      break;
    case "brewing_stand":
      ctx.fillStyle = "#880E4F";
      ctx.fillRect(sx + 10, sy - 35, 12, 20);
      ctx.fillStyle = "#A52A2A";
      ctx.fillRect(sx + 26, sy - 35, 8, 12);
      break;
  }
}

function drawVillageDecorations(ctx, village) {
  if (!village || !Array.isArray(village.decorations)) return;
  for (const deco of village.decorations) {
    if (!deco) continue;
    const sx = deco.x - cameraX;
    const sy = groundY;
    switch (deco.type) {
      case "well":
        ctx.fillStyle = "#78909C";
        ctx.fillRect(sx, sy - 20, 20, 20);
        ctx.fillStyle = "#42A5F5";
        ctx.fillRect(sx + 3, sy - 17, 14, 10);
        break;
      case "farm":
        ctx.fillStyle = "#5D4037";
        ctx.fillRect(sx, sy - 4, 30, 4);
        ctx.fillStyle = "#66BB6A";
        for (let i = 0; i < 5; i++) ctx.fillRect(sx + 2 + i * 6, sy - 12, 4, 8);
        break;
      case "fence":
        ctx.fillStyle = "#8D6E63";
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(sx + i * 12, sy - 18, 3, 18);
        }
        ctx.fillRect(sx, sy - 14, 26, 3);
        ctx.fillRect(sx, sy - 6, 26, 3);
        break;
      default:
        ctx.fillStyle = "#9E9E9E";
        ctx.fillRect(sx, sy - 12, 12, 12);
        ctx.fillStyle = "#FFF";
        ctx.font = "8px monospace";
        ctx.fillText((deco.type || "?").charAt(0).toUpperCase(), sx + 2, sy - 3);
        break;
    }
  }
}

function drawVillageSaveStone(ctx, building, village) {
  if (!building || !village) return;
  const sx = building.x - cameraX;
  const sy = groundY - building.h;

  ctx.fillStyle = "#708090";
  ctx.fillRect(sx, sy, building.w, building.h);

  ctx.fillStyle = "#9E9E9E";
  ctx.fillRect(sx, sy, building.w, 8);

  ctx.fillStyle = village.saved ? "#4CAF50" : "#AAA";
  ctx.font = "bold 20px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(village.saved ? "🧱" : "?", sx + building.w / 2, sy + 20);

  ctx.strokeStyle = village.saved ? "#66BB6A" : "#888";
  ctx.lineWidth = 3;
  ctx.strokeRect(sx + 2, sy + 2, building.w - 4, building.h - 4);
  ctx.textAlign = "left";
}

function drawVillageSpecialBuilding(ctx, building) {
  if (!building) return;
  const sx = building.x - cameraX;
  const sy = groundY - building.h;

  switch (building.type) {
    case "library":
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = "#8B4513";
        ctx.fillRect(sx + 8 + i * 8, sy - 60 - i * 12, 8, 16);
      }
      ctx.fillStyle = "#5D4037";
      ctx.fillRect(sx + 12, sy - 64, 10, 24);
      break;
    case "hot_spring":
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.beginPath();
      ctx.arc(sx + 12, sy - 30, 8, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "water_station":
      ctx.fillStyle = "#4FC3F7";
      ctx.fillRect(sx + 10, sy - 30, 12, 20);
      break;
    case "blacksmith":
      ctx.fillStyle = "#795548";
      ctx.fillRect(sx + 8, sy - 24, 16, 12);
      break;
    case "lighthouse":
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = i === 0 ? "rgba(255, 255, 0, 0.8)" : "rgba(255, 255, 255, 0.6)";
        ctx.fillRect(sx + 8 + i * 6, sy - 50 + i * 10, 4, 10);
      }
      break;
    case "brewing_stand":
      ctx.fillStyle = "#880E4F";
      ctx.fillRect(sx + 8, sy - 20, 8, 16);
      break;
    default:
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = "#8B4513";
        ctx.fillRect(sx + 8 + i * 8, sy - 60 - i * 12, 8, 16);
      }
      break;
  }
}
