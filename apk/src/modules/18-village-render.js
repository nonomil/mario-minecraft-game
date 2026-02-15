/**
 * 18-village-render.js - 村庄渲染
 * v1.8.0 实现村庄基础渲染
 */

function drawVillages(ctx) {
  if (!settings.villageEnabled) return;
  for (const village of activeVillages) {
    // 视口裁剪：只渲染可见的村庄
    if (village.x + village.width < cameraX - 100) continue;
    if (village.x > cameraX + canvas.width + 100) continue;
    drawVillageGround(ctx, village);
    drawVillageDecorations(ctx, village);
    for (const b of village.buildings) {
      drawVillageBuilding(ctx, b, village.style);
    }
    // v1.8.1 渲染 NPC (v1.8.1)
    for (const npc of village.npcs) {
      drawVillageNPC(ctx, npc);
    }
  }
}

// v1.8.1 NPC 渲染 (v1.8.1)
function drawVillageNPC(ctx, npc) {
  const sx = npc.x - cameraX;
  const sy = groundY - 24;
  const facing = npc.facingRight ? 1 : -1;

  // 身体
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(sx, sy, 16, 24);

  // 眼睛
  ctx.fillStyle = '#FFF';
  const eyeX = npc.facingRight ? sx + 10 : sx + 3;
  ctx.fillRect(eyeX, sy + 4, 4, 4);

  // 腿动画
  const legOffset = npc.animFrame === 0 ? 0 : 2;
  ctx.fillStyle = '#5D4037';
  ctx.fillRect(sx + 2 + legOffset, sy + 20, 5, 4);
  ctx.fillRect(sx + 9 + legOffset, sy + 20, 5, 4);

  // 对话气泡
  if (npc.showBubble) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    const bubbleW = 80;
    const bubbleH = 20;
    const bubbleX = sx + 8 - bubbleW / 2;
    const bubbleY = sy - bubbleH - 8;
    ctx.beginPath();
    ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(npc.bubbleText, sx + 8, bubbleY + 14);
    ctx.textAlign = 'left';
  }
}

function drawVillageGround(ctx, village) {
  const sx = village.x - cameraX;
  const w = village.width;
  // 村庄地面（石砖路）
  ctx.fillStyle = village.style.groundColor || '#6D4C41';
  ctx.fillRect(sx, groundY, w, 6);
  // 石砖纹理
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1;
  for (let i = 0; i < w; i += 20) {
    ctx.strokeRect(sx + i, groundY, 20, 6);
  }
  // 村庄入口标记
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(sx, groundY - 300, 4, 300);
  ctx.fillRect(sx + w - 4, groundY - 300, 4, 300);
}

function drawVillageBuilding(ctx, building, style) {
  const sx = building.x - cameraX;
  const sy = groundY - building.h;
  const colors = style.buildingColors;

  // 墙体
  ctx.fillStyle = colors.wall;
  ctx.fillRect(sx, sy, building.w, building.h);
  // 墙体纹理线
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1;
  for (let row = 0; row < building.h; row += 10) {
    ctx.beginPath();
    ctx.moveTo(sx, sy + row);
    ctx.lineTo(sx + building.w, sy + row);
    ctx.stroke();
  }

  // 屋顶（三角形）
  ctx.fillStyle = colors.roof;
  ctx.beginPath();
  ctx.moveTo(sx - 8, sy);
  ctx.lineTo(sx + building.w / 2, sy - 25);
  ctx.lineTo(sx + building.w + 8, sy);
  ctx.closePath();
  ctx.fill();

  // 门
  ctx.fillStyle = colors.door;
  const doorW = 16, doorH = Math.min(30, building.h - 5);
  ctx.fillRect(sx + building.w / 2 - doorW / 2, sy + building.h - doorH, doorW, doorH);

  // 窗户（发光）
  if (building.w >= 60) {
    ctx.fillStyle = '#FFEB3B';
    ctx.globalAlpha = 0.8;
    ctx.fillRect(sx + 8, sy + 8, 12, 12);
    if (building.w >= 80) {
      ctx.fillRect(sx + building.w - 20, sy + 8, 12, 12);
    }
    ctx.globalAlpha = 1.0;
  }

  // 建筑标识图标
  const icons = {
    bed_house: '🛏️', word_house: '📚', save_stone: '💾',
    library: '📖', hot_spring: '♨️', water_station: '💧',
    blacksmith: '⚒️', lighthouse: '🗼', brewing_stand: '⚗️'
  };
  const icon = icons[building.type] || '🏠';
  ctx.font = `${16 * (worldScale?.x || 1)}px serif`;
  ctx.textAlign = 'center';
  ctx.fillText(icon, sx + building.w / 2, sy - 30);
  ctx.textAlign = 'left';

  // v1.8.4 特色建筑额外渲染
  switch (building.type) {
    case 'library':
      // 图书馆：书本堆
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(sx + 10 + i * 8, sy - 60 + i * 8, 8, 12);
      }
      // 书脊
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(sx + 14, sy - 64, 4, 24);
      break;
    case 'hot_spring':
      // 温泉：蒸汽效果
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.arc(sx + building.w / 2, sy - 30, 10, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'water_station':
      // 水站：水桶
      ctx.fillStyle = '#4FC3F7';
      ctx.fillRect(sx + 8, sy - 40, 16, 20);
      ctx.fillStyle = '#0277BD';
      ctx.fillRect(sx + 10, sy - 40, 12, 12);
      break;
    case 'blacksmith':
      // 铁匠铺：砧板
      ctx.fillStyle = '#795548';
      ctx.fillRect(sx + 6, sy - 30, building.w - 12, 8);
      ctx.fillStyle = '#3E2723';
      ctx.fillRect(sx + 16, sy - 24, 16, 12);
      break;
    case 'lighthouse':
      // 灯塔：灯光
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = `rgba(255, 255, ${200 + i * 55}, ${Math.random() * 0.3 + 0.2})`;
        ctx.fillRect(sx + 12 + i * 4, sy - 50 - 20 - i * 6, 8, 8);
      }
      // 灯塔顶
      ctx.fillStyle = '#FFEB3B';
      ctx.fillRect(sx + 12, sy - 58, building.w - 20, 8);
      break;
    case 'brewing_stand':
      // 酿造台：瓶子
      ctx.fillStyle = '#880E4F';
      ctx.fillRect(sx + 10, sy - 35, 12, 20);
      ctx.fillStyle = '#A52A2A';
      ctx.fillRect(sx + 26, sy - 35, 8, 12);
      break;
  }
}

function drawVillageDecorations(ctx, village) {
  for (const deco of village.decorations) {
    const sx = deco.x - cameraX;
    const sy = groundY;
    // 简单像素装饰
    switch (deco.type) {
      case 'well':
        ctx.fillStyle = '#78909C';
        ctx.fillRect(sx, sy - 20, 20, 20);
        ctx.fillStyle = '#42A5F5';
        ctx.fillRect(sx + 3, sy - 17, 14, 10);
        break;
      case 'farm':
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(sx, sy - 4, 30, 4);
        ctx.fillStyle = '#66BB6A';
        for (let i = 0; i < 5; i++) ctx.fillRect(sx + 2 + i * 6, sy - 12, 4, 8);
        break;
      case 'fence':
        ctx.fillStyle = '#8D6E63';
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(sx + i * 12, sy - 18, 3, 18);
        }
        ctx.fillRect(sx, sy - 14, 26, 3);
        ctx.fillRect(sx, sy - 6, 26, 3);
        break;
      default:
        // 通用装饰：小方块 + 标签
        ctx.fillStyle = '#9E9E9E';
        ctx.fillRect(sx, sy - 12, 12, 12);
        ctx.fillStyle = '#FFF';
        ctx.font = '8px monospace';
        ctx.fillText(deco.type.charAt(0).toUpperCase(), sx + 2, sy - 3);
        break;
    }
  }
}

}

// v1.8.4 存档石碑渲染 (v1.8.4)
function drawVillageSaveStone(ctx, building, village) {
  const sx = building.x - cameraX;
  const sy = groundY - building.h;

  // 石碑主体
  ctx.fillStyle = '#708090';
  ctx.fillRect(sx, sy, building.w, building.h);

  // 石碑顶部装饰
  ctx.fillStyle = '#9E9E9E';
  ctx.fillRect(sx, sy, building.w, 8);

  // 存档符号
  ctx.fillStyle = village.saved ? '#4CAF50' : '#AAA';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(village.saved ? '💾' : '?', sx + building.w / 2, sy + 20);

  // 装饰边框
  ctx.strokeStyle = village.saved ? '#66BB6A' : '#888';
  ctx.lineWidth = 3;
  ctx.strokeRect(sx + 2, sy + 2, building.w - 4, building.h - 4);
}

}

// v1.8.4 特色建筑额外渲染 (v1.8.4)
function drawVillageSpecialBuilding(ctx, building, style) {
  const sx = building.x - cameraX;
  const sy = groundY - building.h;

  // 根据建筑类型渲染不同特色建筑
  switch (building.type) {
    case 'library':
      // 图书馆：书本堆
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(sx + 8 + i * 8, sy - 60 - i * 12, 8, 16);
      }
      // 书脊
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(sx + 12, sy - 64, 10, 24);
      break;
    case 'hot_spring':
      // 温泉：蒸汽效果
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(sx + 12, sy - 30, 8, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'water_station':
      // 水站：水桶
      ctx.fillStyle = '#4FC3F7';
      ctx.fillRect(sx + 10, sy - 30, 12, 20);
      break;
    case 'blacksmith':
      // 铁匠铺：砧板
      ctx.fillStyle = '#795548';
      ctx.fillRect(sx + 8, sy - 24, 16, 12);
      break;
    case 'lighthouse':
      // 灯塔：灯光
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = i === 0 ? 'rgba(255, 255, 0, 0.8)' : 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(sx + 8 + i * 6, sy - 50 + i * 10, 4, 10);
      }
      break;
    case 'brewing_stand':
      // 酿造台：瓶子
      ctx.fillStyle = '#880E4F';
      ctx.fillRect(sx + 8, sy - 20, 8, 16);
      break;
    default:
      // 默认：书本堆
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(sx + 8 + i * 8, sy - 60 - i * 12, 8, 16);
      }
  }
  }
}
