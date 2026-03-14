// ============ BOSS 战斗系统：共享视觉与工具 ============

const BOSS_VISUAL_TOKENS = Object.freeze({
    blazeCoreDark: '#38210A',
    blazeCoreMid: '#5A3310',
    blazeGlowWarm: '#FFB300',
    blazeGlowHot: '#FFF59D',
    blazeRodLight: '#FFD54F',
    blazeRodMid: '#FFB300',
    blazeRodShadow: '#A85A00',
    blazeFace: '#251300',
    blazeEye: '#FFE082',
    blazeEmber: 'rgba(255, 140, 0, 0.55)',
    ashDark: 'rgba(28, 28, 28, 0.78)',
    ashLight: 'rgba(108, 108, 108, 0.48)',
    boneDark: '#1A1A1A',
    boneMid: '#343434',
    boneLight: '#565656',
    boneAsh: '#7A7A7A',
    eyeRed: '#D32F2F',
    eyeHot: '#FF6B6B',
    swordEdge: '#A8B0B8',
    swordMid: '#7E8791',
    swordGuard: '#5D646B',
    swordGrip: '#34261D'
});

function drawShadowEllipse(ctx, centerX, centerY, width, height, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, width / 2, height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawGlowOrb(ctx, centerX, centerY, innerRadius, outerRadius, innerColor, outerColor) {
    const gradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius);
    gradient.addColorStop(0, innerColor);
    gradient.addColorStop(1, outerColor);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
    ctx.fill();
}

function drawBlazeFigure(ctx, centerX, centerY, options = {}) {
    const size = Number(options.size) || 1;
    const timeValue = Number(options.timeValue) || (Date.now() / 220);
    const flashActive = !!options.flashActive;
    const rodCount = Math.max(6, Number(options.rodCount) || 12);
    const coreWidth = 18 * size;
    const coreHeight = 24 * size;
    const outerRadius = 24 * size;
    const innerRadius = 15 * size;
    const faceWidth = 13 * size;
    const faceHeight = 9 * size;
    const faceY = centerY - 4 * size;

    drawShadowEllipse(ctx, centerX, centerY + 24 * size, 32 * size, 8 * size, 'rgba(0, 0, 0, 0.28)');
    drawGlowOrb(
        ctx,
        centerX,
        centerY,
        3 * size,
        20 * size,
        flashActive ? '#FFFFFF' : BOSS_VISUAL_TOKENS.blazeGlowHot,
        'rgba(255, 140, 0, 0.18)'
    );

    ctx.save();
    ctx.fillStyle = BOSS_VISUAL_TOKENS.blazeCoreDark;
    ctx.fillRect(centerX - coreWidth / 2, centerY - coreHeight / 2, coreWidth, coreHeight);
    ctx.fillStyle = BOSS_VISUAL_TOKENS.blazeCoreMid;
    ctx.fillRect(centerX - coreWidth / 2 + 2 * size, centerY - coreHeight / 2 + 2 * size, coreWidth - 4 * size, coreHeight - 4 * size);
    ctx.fillStyle = BOSS_VISUAL_TOKENS.blazeFace;
    ctx.fillRect(centerX - faceWidth / 2, faceY - faceHeight / 2, faceWidth, faceHeight);
    ctx.fillStyle = BOSS_VISUAL_TOKENS.blazeEye;
    ctx.fillRect(centerX - 4 * size, faceY - 1 * size, 2 * size, 2 * size);
    ctx.fillRect(centerX + 2 * size, faceY - 1 * size, 2 * size, 2 * size);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.24)';
    ctx.fillRect(centerX - 2 * size, centerY - coreHeight / 2 + 2 * size, 4 * size, 3 * size);

    const rodsPerRing = rodCount / 2;
    for (let index = 0; index < rodCount; index++) {
        const ringIndex = index < rodsPerRing ? 0 : 1;
        const localIndex = index % rodsPerRing;
        const radius = ringIndex === 0 ? outerRadius : innerRadius;
        const rodHeight = (ringIndex === 0 ? 16 : 12) * size + (localIndex % 3) * 3 * size;
        const rodWidth = 5 * size;
        const angle = timeValue * (ringIndex === 0 ? 1.05 : -1.35) + ((Math.PI * 2) / rodsPerRing) * localIndex;
        const verticalWave = Math.sin(timeValue * 2.1 + index * 0.9) * (ringIndex === 0 ? 7 : 4) * size;
        const rodX = centerX + Math.cos(angle) * radius - rodWidth / 2;
        const rodY = centerY + Math.sin(angle * 1.2) * 8 * size + verticalWave - rodHeight / 2;
        const rodGradient = ctx.createLinearGradient(rodX, rodY, rodX, rodY + rodHeight);
        rodGradient.addColorStop(0, BOSS_VISUAL_TOKENS.blazeRodLight);
        rodGradient.addColorStop(0.55, BOSS_VISUAL_TOKENS.blazeRodMid);
        rodGradient.addColorStop(1, BOSS_VISUAL_TOKENS.blazeRodShadow);
        ctx.fillStyle = rodGradient;
        ctx.fillRect(rodX, rodY, rodWidth, rodHeight);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.fillRect(rodX + 1 * size, rodY + 1 * size, Math.max(1, 1 * size), Math.max(2, rodHeight * 0.25));
    }

    const emberCount = options.emberCount || 5;
    for (let index = 0; index < emberCount; index++) {
        const emberX = centerX + Math.sin(timeValue * 1.7 + index * 1.3) * (8 + index * 2) * size;
        const emberY = centerY + 20 * size - ((timeValue * 18 + index * 11) % (24 * size));
        ctx.fillStyle = BOSS_VISUAL_TOKENS.blazeEmber;
        ctx.fillRect(emberX, emberY, Math.max(2, 2 * size), Math.max(2, 2 * size));
    }
    ctx.restore();
}

function drawWitherSkeletonMinion(ctx, drawX, drawY, minion, facing) {
    const centerX = drawX + minion.width / 2;
    drawShadowEllipse(ctx, centerX, drawY + minion.height + 4, minion.width * 0.8, 8, 'rgba(0, 0, 0, 0.22)');
    ctx.save();
    ctx.fillStyle = BOSS_VISUAL_TOKENS.boneDark;
    ctx.fillRect(drawX + 6, drawY + 2, 12, 12);
    ctx.fillStyle = BOSS_VISUAL_TOKENS.boneMid;
    ctx.fillRect(drawX + 10, drawY + 16, 4, 16);
    for (let ribIndex = 0; ribIndex < 3; ribIndex++) {
        const ribY = drawY + 18 + ribIndex * 5;
        ctx.fillStyle = ribIndex % 2 === 0 ? BOSS_VISUAL_TOKENS.boneLight : BOSS_VISUAL_TOKENS.boneMid;
        ctx.fillRect(drawX + 6, ribY, 12, 2);
    }
    ctx.fillStyle = BOSS_VISUAL_TOKENS.boneLight;
    ctx.fillRect(drawX + 4, drawY + 16, 3, 15);
    ctx.fillRect(drawX + 17, drawY + 16, 3, 15);
    ctx.fillRect(drawX + 8, drawY + 32, 3, 14);
    ctx.fillRect(drawX + 13, drawY + 32, 3, 14);
    ctx.fillStyle = BOSS_VISUAL_TOKENS.eyeRed;
    ctx.fillRect(drawX + 8, drawY + 6, 2, 2);
    ctx.fillRect(drawX + 14, drawY + 6, 2, 2);
    const swordX = facing >= 0 ? drawX + minion.width : drawX - 4;
    ctx.fillStyle = BOSS_VISUAL_TOKENS.swordMid;
    ctx.fillRect(swordX, drawY + 18, 4, 14);
    ctx.restore();
}
