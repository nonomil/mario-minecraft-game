/**
 * 18-village-render.js - Village rendering (Minecraft style)
 * Draws village as background environment with stone/wood block buildings
 */

// Block colors per biome
const VILLAGE_BLOCK_COLORS = {
  forest: { stone: '#8B8B8B', plank: '#B8945A', log: '#6B4226', glass: '#A8D8EA', roof: '#2E7D32', path: '#6D4C41' },
  snow: { stone: '#C8C8C8', plank: '#D7CCC8', log: '#5D4037', glass: '#B3E5FC', roof: '#1565C0', path: '#B0BEC5' },
  desert: { stone: '#D2B48C', plank: '#DEB887', log: '#8B7355', glass: '#FFE0B2', roof: '#FF8F00', path: '#BCAAA4' },
  mountain: { stone: '#696969', plank: '#8B7D6B', log: '#4A4A4A', glass: '#B0C4DE', roof: '#455A64', path: '#607D8B' },
  ocean: { stone: '#5F9EA0', plank: '#87CEEB', log: '#2F4F4F', glass: '#E0F7FA', roof: '#0277BD', path: '#4DB6AC' },
  nether: { stone: '#8B0000', plank: '#4A0028', log: '#2C0014', glass: '#FF6F00', roof: '#880E4F', path: '#6A1B9A' }
};

function getVillageColors(biomeId) {
  return VILLAGE_BLOCK_COLORS[biomeId] || VILLAGE_BLOCK_COLORS.forest;
}

// Draw a single Minecraft-style block (stone/plank with grid lines)
function drawBlock_village(ctx, x, y, w, h, color, borderColor) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = borderColor || 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(x, y, w, h);
}

// Draw a Minecraft-style house using blocks
function drawBlockHouse(ctx, bx, by, w, h, colors, type) {
  const bs = 10; // block size
  const cols = Math.floor(w / bs);
  const rows = Math.floor(h / bs);
  // Walls - stone/plank blocks
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isEdge = c === 0 || c === cols - 1;
      const color = isEdge ? colors.log : colors.plank;
      drawBlock_village(ctx, bx + c * bs, by + r * bs, bs, bs, color);
    }
  }
  // Roof - triangle of blocks
  const roofRows = Math.ceil(cols / 2);
  for (let r = 0; r < roofRows; r++) {
    const startC = r;
    const endC = cols - r;
    for (let c = startC; c < endC; c++) {
      drawBlock_village(ctx, bx + c * bs, by - (r + 1) * bs, bs, bs, colors.roof);
    }
  }
  // Door
  const doorW = Math.max(1, Math.floor(cols / 4));
  const doorH = Math.min(3, rows - 1);
  const doorStartC = Math.floor((cols - doorW) / 2);
  for (let r = rows - doorH; r < rows; r++) {
    for (let c = doorStartC; c < doorStartC + doorW; c++) {
      drawBlock_village(ctx, bx + c * bs, by + r * bs, bs, bs, '#3E2723');
    }
  }
  // Windows (glass blocks)
  if (cols >= 6) {
    const winY = by + bs;
    drawBlock_village(ctx, bx + bs, winY, bs, bs, colors.glass);
    drawBlock_village(ctx, bx + (cols - 2) * bs, winY, bs, bs, colors.glass);
  }
  // Icon label
  const icons = { bed_house: "🛏️", word_house: "📘", trader_house: "🧑‍🌾", save_stone: "💾" };
  const icon = icons[type] || "🏠";
  ctx.font = `${14 * (worldScale?.x || 1)}px serif`;
  ctx.textAlign = 'center';
  ctx.fillText(icon, bx + w / 2, by - roofRows * bs - 4);
  ctx.textAlign = 'left';
}

// Draw a bed inside the bed_house area
function drawVillageBed(ctx, bx, by, colors) {
  // Bed frame (wood)
  ctx.fillStyle = colors.log;
  ctx.fillRect(bx, by, 30, 8);
  // Pillow (white)
  ctx.fillStyle = '#FFF';
  ctx.fillRect(bx, by - 4, 10, 4);
  // Blanket (red)
  ctx.fillStyle = '#D32F2F';
  ctx.fillRect(bx + 10, by - 3, 20, 3);
}

// Draw village path (cobblestone)
function drawVillagePath(ctx, village) {
  const sx = village.x;
  const w = village.width || 800;
  const colors = getVillageColors(village.biomeId);
  const bs = 12;
  const pathY = groundY;
  // Cobblestone path
  ctx.fillStyle = colors.path;
  ctx.fillRect(sx, pathY, w, 8);
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < w; i += bs) {
    ctx.strokeRect(sx + i, pathY, bs, 8);
  }
}

// Draw a well (stone blocks + water)
function drawVillageWell(ctx, x) {
  const sx = x;
  const wy = groundY - 24;
  // Stone base
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      drawBlock_village(ctx, sx + c * 8, wy + r * 8, 8, 8, '#8B8B8B');
    }
  }
  // Water inside
  ctx.fillStyle = 'rgba(33,150,243,0.6)';
  ctx.fillRect(sx + 8, wy + 8, 8, 8);
  // Roof posts
  ctx.fillStyle = '#6B4226';
  ctx.fillRect(sx + 2, wy - 16, 3, 16);
  ctx.fillRect(sx + 19, wy - 16, 3, 16);
  // Roof
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(sx, wy - 20, 24, 4);
}

// Draw a lamp post
function drawVillageLamp(ctx, x, colors) {
  const sx = x;
  const ly = groundY - 40;
  ctx.fillStyle = colors.log;
  ctx.fillRect(sx + 3, ly, 4, 40);
  // Lantern
  ctx.fillStyle = '#FFEB3B';
  ctx.globalAlpha = 0.8 + Math.sin(Date.now() / 300) * 0.2;
  ctx.fillRect(sx, ly - 4, 10, 8);
  ctx.globalAlpha = 1.0;
  // Glow
  ctx.fillStyle = 'rgba(255,235,59,0.15)';
  ctx.beginPath();
  ctx.arc(sx + 5, ly, 20, 0, Math.PI * 2);
  ctx.fill();
}

// Draw a fence section
function drawVillageFence(ctx, x, colors) {
  const sx = x;
  const fy = groundY - 18;
  ctx.fillStyle = colors.log;
  ctx.fillRect(sx, fy, 3, 18);
  ctx.fillRect(sx + 14, fy, 3, 18);
  ctx.fillRect(sx + 28, fy, 3, 18);
  ctx.fillStyle = colors.plank;
  ctx.fillRect(sx, fy + 4, 31, 3);
  ctx.fillRect(sx, fy + 12, 31, 3);
}

// Draw village entrance sign
function drawVillageSign(ctx, x, biomeName) {
  const sx = x;
  const sy = groundY - 50;
  // Post
  ctx.fillStyle = '#6B4226';
  ctx.fillRect(sx + 12, sy + 20, 4, 30);
  // Sign board
  ctx.fillStyle = '#B8945A';
  ctx.fillRect(sx, sy, 28, 18);
  ctx.strokeStyle = '#5D4037';
  ctx.lineWidth = 1;
  ctx.strokeRect(sx, sy, 28, 18);
  // Text
  ctx.fillStyle = '#3E2723';
  ctx.font = 'bold 7px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Village', sx + 14, sy + 12);
  ctx.textAlign = 'left';
}

// Draw NPC (Minecraft villager style)
function drawVillageNPC(ctx, npc) {
  if (!npc) return;
  // Keep villager close to player silhouette size (player is ~26x52), slightly smaller.
  const bodyW = 20;
  const bodyH = 18;
  const headW = 16;
  const headH = 14;
  const legW = 7;
  const legH = 12;
  const totalH = bodyH + headH + legH;
  const sx = npc.x;
  const sy = groundY - totalH;
  const legOff = npc.animFrame === 0 ? 0 : 2;
  // Body (robe)
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(sx, sy + headH, bodyW, bodyH);
  // Head
  ctx.fillStyle = '#D2A679';
  ctx.fillRect(sx + 2, sy, headW, headH);
  // Nose
  ctx.fillStyle = '#C49A6C';
  ctx.fillRect(sx + 8, sy + 6, 5, 5);
  // Eyes
  ctx.fillStyle = '#3E2723';
  const eyeX = npc.facingRight ? sx + 11 : sx + 6;
  ctx.fillRect(eyeX, sy + 5, 2, 2);
  // Legs
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(sx + 2 + legOff, sy + headH + bodyH, legW, legH);
  ctx.fillRect(sx + bodyW - legW - 2 - legOff, sy + headH + bodyH, legW, legH);
  // Speech bubble
  if (npc.showBubble) {
    const bw = 88, bh = 18;
    const bx = sx + bodyW / 2 - bw / 2;
    const by = sy - bh - 6;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') ctx.roundRect(bx, by, bw, bh, 3);
    else ctx.rect(bx, by, bw, bh);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#333';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(npc.bubbleText || '', sx + bodyW / 2, by + 13);
    ctx.textAlign = 'left';
  }
}
// Main village draw function
function drawVillages(ctx) {
  if (!settings?.villageEnabled) return;
  if (!Array.isArray(activeVillages)) return;
  for (const village of activeVillages) {
    if (!village) continue;
    if (village.x + village.width < cameraX - 100) continue;
    if (village.x > cameraX + canvas.width + 100) continue;
    drawVillageBackground(ctx, village);
    drawVillagePath(ctx, village);
    drawVillageDecorations(ctx, village);
    if (Array.isArray(village.buildings)) {
      for (const building of village.buildings) {
        const colors = getVillageColors(village.biomeId);
        drawBlockHouse(ctx, building.x, groundY - building.h, building.w, building.h, colors, building.type);
        // Draw bed next to bed_house
        if (building.type === 'bed_house') {
          drawVillageBed(ctx, building.x + building.w + 8, groundY - 10, colors);
        }
      }
    }
    if (Array.isArray(village.npcs)) {
      for (const npc of village.npcs) drawVillageNPC(ctx, npc);
    }
    // Village name banner
    drawVillageBanner(ctx, village);
  }
}

// Draw soft background tint for village area
function drawVillageBackground(ctx, village) {
  const sx = village.x;
  const w = village.width || 800;
  // Soft warm overlay
  ctx.fillStyle = 'rgba(255,248,225,0.12)';
  ctx.fillRect(sx, 0, w, groundY);
  // Entrance/exit pillars (stone blocks)
  const colors = getVillageColors(village.biomeId);
  const pillarH = 60;
  for (let r = 0; r < pillarH; r += 10) {
    drawBlock_village(ctx, sx, groundY - pillarH + r, 10, 10, colors.stone);
    drawBlock_village(ctx, sx + w - 10, groundY - pillarH + r, 10, 10, colors.stone);
  }
  // Torch on pillars
  ctx.fillStyle = '#FFEB3B';
  ctx.globalAlpha = 0.7 + Math.sin(Date.now() / 250) * 0.3;
  ctx.fillRect(sx + 2, groundY - pillarH - 6, 6, 6);
  ctx.fillRect(sx + w - 8, groundY - pillarH - 6, 6, 6);
  ctx.globalAlpha = 1.0;
}

// Draw village decorations
function drawVillageDecorations(ctx, village) {
  if (!village) return;
  const colors = getVillageColors(village.biomeId);
  const vx = village.x;
  const w = village.width || 800;
  // Entrance sign
  drawVillageSign(ctx, vx + 20, village.biomeId);
  // Well in center
  drawVillageWell(ctx, vx + w / 2 - 12);
  // Lamp posts
  drawVillageLamp(ctx, vx + 160, colors);
  drawVillageLamp(ctx, vx + w - 180, colors);
  // Fences at edges
  drawVillageFence(ctx, vx + 40, colors);
  drawVillageFence(ctx, vx + w - 70, colors);
}

// Draw village name banner at top
function drawVillageBanner(ctx, village) {
  const sx = village.x;
  const w = village.width || 800;
  const cx = sx + w / 2;
  const biomeName = typeof getBiomeName === 'function' ? getBiomeName(village.biomeId) : village.biomeId;
  const text = `🏘️ ${biomeName}村庄`;
  ctx.font = `bold ${12 * (worldScale?.x || 1)}px sans-serif`;
  ctx.textAlign = 'center';
  // Background bar
  const tw = ctx.measureText(text).width + 16;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(cx - tw / 2, 8, tw, 22, 6);
    ctx.fill();
  } else {
    ctx.fillRect(cx - tw / 2, 8, tw, 22);
  }
  ctx.fillStyle = '#FFF';
  ctx.fillText(text, cx, 24);
  ctx.textAlign = 'left';
}

