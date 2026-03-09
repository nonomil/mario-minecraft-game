/**
 * 19-biome-visuals.js - 群系视觉效果规范
 * 粒子效果、天空渲染、特殊视觉效果
 * 版本: v1.6.9
 */

// ============ 粒子效果配置数据 ============
const BIOME_PARTICLE_CONFIG = {
    forest: {
        type: 'leaf',
        spawnRate: 12,
        velocity: { x: () => (Math.random() - 0.5) * 0.5, y: 0.8 },
        size: { min: 4, max: 6 },
        color: '#228B22',
        alpha: { min: 0.6, max: 1.0 },
        lifespan: 180
    },
    cherry_grove: {
        type: 'petal',
        spawnRate: 12,
        velocity: { x: () => (Math.random() - 0.5) * 0.5, y: 0.8 },
        size: { min: 4, max: 7 },
        color: '#FFB7C5',
        alpha: { min: 0.6, max: 1.0 },
        lifespan: 240
    },
    snow: {
        type: 'snowflake',
        spawnRate: 20,
        velocity: { x: () => (Math.random() - 0.5) * 0.3, y: 0.5 },
        size: { min: 2, max: 5 },
        color: '#FFFFFF',
        alpha: { min: 0.7, max: 1.0 },
        lifespan: 300
    },
    desert: {
        type: 'dust',
        spawnRate: 10,
        velocity: { x: 1.2, y: () => (Math.random() - 0.5) * 0.2 },
        size: { min: 3, max: 4 },
        color: '#D2B48C',
        alpha: { min: 0.3, max: 0.6 },
        lifespan: 120
    },
    cave: {
        type: 'dust',
        spawnRate: 8,
        velocity: { x: () => (Math.random() - 0.5) * 0.18, y: () => -0.08 - Math.random() * 0.08 },
        size: { min: 2, max: 5 },
        color: '#B8C0CC',
        alpha: { min: 0.15, max: 0.38 },
        lifespan: 220
    },
    mushroom_island: {
        type: 'spore',
        spawnRate: 6,
        velocity: { x: () => (Math.random() - 0.5) * 0.3, y: -0.6 },
        size: { min: 3, max: 5 },
        color: '#BA55D3',
        alpha: { min: 0.4, max: 0.8 },
        lifespan: 240
    },
    nether: {
        type: 'ember',
        spawnRate: 15,
        velocity: { x: () => (Math.random() - 0.5) * 0.5, y: -0.8 },
        size: { min: 2, max: 4 },
        color: '#FF4500',
        alpha: { min: 0.5, max: 0.9 },
        lifespan: 150
    },
    ocean: {
        type: 'bubble',
        spawnRate: 6,
        velocity: { x: () => (Math.random() - 0.5) * 0.3, y: -1.0 },
        size: { min: 3, max: 6 },
        color: '#87CEEB',
        alpha: { min: 0.6, max: 0.9 },
        lifespan: 180
    },
    deep_dark: {
        type: 'sculk_pulse',
        spawnRate: 1, // 每3秒1次
        velocity: { x: 0, y: 0 },
        size: { min: 2, max: 3 },
        color: '#008080',
        alpha: { min: 0.5, max: 1.0 },
        lifespan: 60
    },
    end: {
        type: 'end_particle',
        spawnRate: 10,
        velocity: { x: () => (Math.random() - 0.5) * 0.2, y: () => (Math.random() - 0.5) * 0.2 },
        size: { min: 3, max: 5 },
        color: '#8B00FF',
        alpha: { min: 0.5, max: 0.9 },
        lifespan: 240
    },
    sky_dimension: {
        type: 'golden_sparkle',
        spawnRate: 8,
        velocity: { x: () => (Math.random() - 0.5) * 0.4, y: () => (Math.random() - 0.5) * 0.4 },
        size: { min: 4, max: 6 },
        color: '#FFD700',
        alpha: { min: 0.7, max: 1.0 },
        lifespan: 300
    }
};

// ============ 天空渲染配置 ============
const BIOME_SKY_CONFIG = {
    forest: ['#88CC88'],
    cherry_grove: ['#FFE4E1', '#FFC0CB'],
    snow: ['#CCE6FF'],
    desert: ['#FFEECC'],
    cave: ['#141821', '#232838', '#3B3B4F'],
    mushroom_island: ['#DDA0DD', '#BA55D3'],
    mountain: ['#666688'],
    ocean: ['#AAD4F5', '#4682B4', '#191970'],
    nether: ['#CC3333'],
    deep_dark: ['#0A0A1A', '#0D1B2A', '#1B3A4B'],
    end: ['#0D0015', '#1A0A2E', '#2D1B4E'],
    sky_dimension: ['#87CEEB', '#FFD700', '#FF6347']
};

// ============ 粒子类 ============
class BiomeParticle {
    constructor(config, x, y) {
        this.x = x;
        this.y = y;
        this.vx = typeof config.velocity.x === 'function' ? config.velocity.x() : config.velocity.x;
        this.vy = typeof config.velocity.y === 'function' ? config.velocity.y() : config.velocity.y;
        this.size = config.size.min + Math.random() * (config.size.max - config.size.min);
        this.color = config.color;
        this.alpha = config.alpha.min;
        this.life = config.lifespan;
        this.maxLife = config.lifespan;
        this.type = config.type;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.alpha = (this.life / this.maxLife) * 0.8 + 0.2;
    }

    render(ctx, camX) {
        const dx = this.x - camX;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;

        switch (this.type) {
            case 'leaf':
            // 树叶形状
                ctx.beginPath();
                ctx.ellipse(dx, this.y, this.size, this.size / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'petal':
                // 花瓣形状
                ctx.beginPath();
                ctx.arc(dx, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'snowflake':
                // 雪花形状
                ctx.beginPath();
                ctx.arc(dx, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'dust':
                // 尘土矩形
                ctx.fillRect(dx, this.y, this.size, this.size);
                break;
            case 'spore':
                // 孢子圆形
                ctx.beginPath();
                ctx.arc(dx, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'ember':
                // 余焰圆形
                ctx.beginPath();
                ctx.arc(dx, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'bubble':
                // 气泡空心圆
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(dx, this.y, this.size, 0, Math.PI * 2);
                ctx.stroke();
                break;
            case 'golden_sparkle':
                // 金色光点
                ctx.beginPath();
                ctx.arc(dx, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                break;
        }

        ctx.globalAlpha = 1;
    }
}

// ============ 粒子池管理 ============
const biomeParticlePool = {
    particles: [],
    maxParticles: 200,
    lastSpawn: 0,

    add(particle) {
        if (this.particles.length >= this.maxParticles) {
            this.particles.shift();
        }
        this.particles.push(particle);
    },

    update() {
        this.particles = this.particles.filter(p => {
            p.update();
            return p.life > 0;
        });
    },

    render(ctx, camX) {
        this.particles.forEach(p => {
            if (p.x > camX - 50 && p.x < camX + canvas.width + 50) {
                p.render(ctx, camX);
            }
        });
    }
};

// ============ 天空渲染 ============
function renderBiomeSky(ctx, biomeId) {
    const colors = BIOME_SKY_CONFIG[biomeId] || BIOME_SKY_CONFIG.forest;

    if (colors.length === 1) {
        // 单色天空
        ctx.fillStyle = colors[0];
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (colors.length === 2) {
        // 双色渐变
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (colors.length === 3) {
        // 三色渐变
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(0.5, colors[1]);
        gradient.addColorStop(1, colors[2]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// ============ 特殊视觉效果 ============
let sculkPulseWaves = [];
let endStars = [];
let oceanLightBeams = [];
let heatWaveTimer = 0;
let volcanoAshParticles = [];
let volcanoLavaPools = [];

// 初始化末地星星
function initEndStars() {
    if (endStars.length === 0) {
        for (let i = 0; i < 30; i++) {
            endStars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height * 0.6,
                size: 2 + Math.random() * 2,
                color: ['#FFFFFF', '#E6E6FA', '#DDA0DD'][Math.floor(Math.random() * 3)],
                twinkleOffset: Math.random() * Math.PI * 2
            });
        }
    }
}

// 深暗之域幽匿脉冲波
function spawnSculkPulseWave(x, y) {
    sculkPulseWaves.push({
        x: x,
        y: y,
        radius: 0,
        maxRadius: 150,
        life: 60,
        maxLife: 60
    });
}

function updateSculkPulseWaves() {
    if (currentBiome !== 'deep_dark') {
        sculkPulseWaves = [];
        return;
    }

    // 每3秒生成一次脉冲波
    const now = Date.now();
    if (now - biomeParticlePool.lastSpawn > 3000) {
        spawnSculkPulseWave(
            cameraX + Math.random() * canvas.width,
            groundY - 100
        );
        biomeParticlePool.lastSpawn = now;
    }

    sculkPulseWaves = sculkPulseWaves.filter(wave => {
        wave.radius = (1 - wave.life / wave.maxLife) * wave.maxRadius;
        wave.life--;
        return wave.life > 0;
    });
}

function renderSculkPulseWaves(ctx, camX) {
    sculkPulseWaves.forEach(wave => {
        const dx = wave.x - camX;
        const progress = 1 - wave.life / wave.maxLife;
        const alpha = (wave.life / wave.maxLife) * 0.8;

        // 颜色渐变
        const r = Math.floor(0 + progress * (0 - 0));
        const g = Math.floor(128 + progress * (255 - 128));
        const b = Math.floor(128 + progress * (255 - 128));

        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(dx, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.stroke();
    });
}

// 火山热浪扭曲效果
function renderHeatWave(ctx) {
    if (currentBiome !== 'volcano') return;

    const t = Date.now() * 0.004;
    ctx.save();
    ctx.strokeStyle = "rgba(255, 140, 0, 0.2)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 16; i++) {
        const pool = volcanoLavaPools[i % Math.max(1, volcanoLavaPools.length)];
        const baseX = pool ? (pool.worldX - cameraX + pool.width * 0.5) : (i + 1) * (canvas.width / 18);
        const baseY = pool ? pool.y : canvas.height - 90;
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        for (let step = 0; step < 8; step++) {
            const rise = step * 14;
            const swing = Math.sin(t + i * 0.9 + step * 0.8) * (8 - step) * 0.9;
            ctx.lineTo(baseX + swing, baseY - rise);
        }
        ctx.stroke();
    }
    ctx.restore();
}

function updateVolcanoVisualState() {
    if (currentBiome !== "volcano") {
        volcanoAshParticles = [];
        volcanoLavaPools = [];
        return;
    }

    const desiredPools = Math.max(3, Math.floor(canvas.width / 300));
    if (volcanoLavaPools.length !== desiredPools) {
        volcanoLavaPools = Array.from({ length: desiredPools }, (_, i) => {
            const offset = 120 + i * 260 + Math.random() * 70;
            const width = 40 + Math.random() * 36;
            return {
                worldX: cameraX + offset,
                width,
                height: 14 + Math.random() * 9,
                y: canvas.height - (34 + Math.random() * 18),
                bubbles: []
            };
        });
    }

    volcanoLavaPools.forEach(pool => {
        if (pool.worldX < cameraX - 120) {
            pool.worldX = cameraX + canvas.width + 120 + Math.random() * 180;
        }
        if (Math.random() < 0.08 && pool.bubbles.length < 10) {
            pool.bubbles.push({
                x: pool.worldX + 6 + Math.random() * Math.max(8, pool.width - 12),
                y: pool.y + pool.height - 2,
                life: 26 + Math.floor(Math.random() * 18),
                maxLife: 44
            });
        }
        pool.bubbles = pool.bubbles.filter(b => {
            b.y -= 0.55;
            b.life--;
            return b.life > 0;
        });
    });

    if (Math.random() < 0.35 && volcanoAshParticles.length < 100) {
        volcanoAshParticles.push({
            x: Math.random() * canvas.width,
            y: -8,
            vx: (Math.random() - 0.5) * 0.28,
            vy: 0.25 + Math.random() * 0.45,
            size: 1 + Math.random() * 2.2,
            alpha: 0.28 + Math.random() * 0.35,
            life: 150 + Math.floor(Math.random() * 120)
        });
    }

    volcanoAshParticles = volcanoAshParticles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        return p.life > 0 && p.y < canvas.height + 14;
    });
}

function renderVolcanoSilhouette(ctx) {
    if (currentBiome !== "volcano") return;
    const floorY = canvas.height - 130;
    const mainPeakX = canvas.width * 0.62;
    const sidePeakX = canvas.width * 0.28;

    ctx.save();
    const mountainGrad = ctx.createLinearGradient(0, floorY - 220, 0, floorY + 20);
    mountainGrad.addColorStop(0, "#23181a");
    mountainGrad.addColorStop(1, "#3a2521");
    ctx.fillStyle = mountainGrad;

    ctx.beginPath();
    ctx.moveTo(mainPeakX - 170, floorY);
    ctx.lineTo(mainPeakX - 72, floorY - 210);
    ctx.lineTo(mainPeakX - 16, floorY - 232);
    ctx.lineTo(mainPeakX + 26, floorY - 228);
    ctx.lineTo(mainPeakX + 78, floorY - 208);
    ctx.lineTo(mainPeakX + 178, floorY);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(sidePeakX - 135, floorY + 8);
    ctx.lineTo(sidePeakX - 45, floorY - 124);
    ctx.lineTo(sidePeakX + 8, floorY - 142);
    ctx.lineTo(sidePeakX + 58, floorY - 120);
    ctx.lineTo(sidePeakX + 140, floorY + 8);
    ctx.closePath();
    ctx.fill();

    const craterGlow = ctx.createRadialGradient(mainPeakX, floorY - 220, 10, mainPeakX, floorY - 220, 56);
    craterGlow.addColorStop(0, "rgba(255,120,40,0.8)");
    craterGlow.addColorStop(1, "rgba(255,120,40,0)");
    ctx.fillStyle = craterGlow;
    ctx.beginPath();
    ctx.arc(mainPeakX, floorY - 220, 56, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 20; i++) {
        const drift = (i * 17 + gameFrame) % 150;
        const smokeX = mainPeakX - 24 + (i % 6) * 9 + Math.sin((gameFrame + i * 11) * 0.04) * 6;
        const smokeY = floorY - 218 - drift;
        const a = Math.max(0.06, 0.4 - drift / 220);
        ctx.fillStyle = `rgba(90, 90, 95, ${a})`;
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, 4 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function renderLavaPools(ctx) {
    if (currentBiome !== "volcano") return;
    ctx.save();
    volcanoLavaPools.forEach(pool => {
        const dx = pool.worldX - cameraX;
        if (dx + pool.width < -40 || dx > canvas.width + 40) return;

        ctx.fillStyle = "rgba(40, 18, 10, 0.9)";
        ctx.fillRect(dx - 4, pool.y - 4, pool.width + 8, pool.height + 8);

        const lavaGrad = ctx.createLinearGradient(dx, pool.y, dx, pool.y + pool.height);
        lavaGrad.addColorStop(0, "rgba(255,170,60,0.95)");
        lavaGrad.addColorStop(0.5, "rgba(255,96,28,0.95)");
        lavaGrad.addColorStop(1, "rgba(164,32,12,0.95)");
        ctx.fillStyle = lavaGrad;
        ctx.fillRect(dx, pool.y, pool.width, pool.height);

        pool.bubbles.forEach(b => {
            const alpha = Math.max(0.2, b.life / b.maxLife);
            ctx.fillStyle = `rgba(255, 210, 120, ${alpha})`;
            ctx.beginPath();
            ctx.arc(b.x - cameraX, b.y, 2.2, 0, Math.PI * 2);
            ctx.fill();
        });
    });
    ctx.restore();
}

function renderVolcanoAsh(ctx) {
    if (currentBiome !== "volcano") return;
    ctx.save();
    volcanoAshParticles.forEach(p => {
        ctx.fillStyle = `rgba(78, 78, 82, ${p.alpha})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    ctx.restore();
}

function renderCaveBackdrop(ctx, camX) {
    if (currentBiome !== "cave") return;
    const floorY = canvas.height - 126;
    ctx.save();

    const caveGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    caveGradient.addColorStop(0, "rgba(8, 12, 18, 0.88)");
    caveGradient.addColorStop(0.45, "rgba(18, 22, 34, 0.72)");
    caveGradient.addColorStop(1, "rgba(30, 28, 38, 0.38)");
    ctx.fillStyle = caveGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const step = 148;
    const startX = Math.floor(camX / step) * step - step;
    for (let worldX = startX; worldX < camX + canvas.width + step * 2; worldX += step) {
        const dx = worldX - camX;

        ctx.fillStyle = "rgba(26, 20, 18, 0.78)";
        ctx.fillRect(dx + 18, floorY - 112, 12, 120);
        ctx.fillRect(dx + 102, floorY - 112, 12, 120);
        ctx.fillRect(dx + 12, floorY - 118, 108, 14);

        ctx.strokeStyle = "rgba(108, 92, 78, 0.45)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(dx - 8, floorY - 18);
        ctx.lineTo(dx + 132, floorY - 18);
        ctx.moveTo(dx - 8, floorY - 8);
        ctx.lineTo(dx + 132, floorY - 8);
        for (let tie = 0; tie < 6; tie++) {
            const tieX = dx + tie * 24;
            ctx.moveTo(tieX, floorY - 22);
            ctx.lineTo(tieX + 10, floorY - 4);
        }
        ctx.stroke();

        ctx.fillStyle = "rgba(104, 124, 180, 0.18)";
        ctx.beginPath();
        ctx.moveTo(dx + 42, floorY - 118);
        ctx.lineTo(dx + 58, floorY - 144);
        ctx.lineTo(dx + 76, floorY - 112);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "rgba(92, 220, 255, 0.1)";
        ctx.beginPath();
        ctx.arc(dx + 59, floorY - 128, 14, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

// 海洋光束效果
function updateOceanLightBeams() {
    if (currentBiome !== 'ocean') {
        oceanLightBeams = [];
        return;
    }

    if (oceanLightBeams.length === 0) {
        for (let i = 0; i < 3; i++) {
            oceanLightBeams.push({
                offsetX: Math.random() * 50,
                width: 80
            });
        }
    }
}

function renderOceanLightBeams(ctx) {
    oceanLightBeams.forEach((beam, i) => {
        const time = Date.now() * 0.001;
        const x = canvas.width * (0.2 + i * 0.3) + Math.sin(time + i * 2) * 50;

        const gradient = ctx.createLinearGradient(
            x - beam.width / 2, 0,
            x + beam.width / 2, 0
        );
        gradient.addColorStop(0, 'rgba(173, 216, 230, 0)');
        gradient.addColorStop(0.5, 'rgba(173, 216, 230, 0.3)');
        gradient.addColorStop(1, 'rgba(173, 216, 230, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(
            x - beam.width / 2,
            0,
            beam.width,
            canvas.height
        );
    });
}

// 末地星空效果
function renderEndStars(ctx) {
    if (currentBiome !== 'end') {
        endStars = [];
        return;
    }

    endStars.forEach(star => {
        const alpha = 0.5 + Math.sin(Date.now() * 0.00005 + star.twinkleOffset) * 0.5;
        ctx.fillStyle = star.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

function getBiomeVisionMaskConfig(biomeId = currentBiome) {
    if (biomeId === "cave") {
        return {
            overlayAlpha: 0.68,
            baseRadius: 150,
            torchBoost: 0.7,
            torchGlowBoost: 1.18,
            decorationTypes: [],
            decorationRadius: 0
        };
    }
    if (biomeId === "deep_dark") {
        const noise = typeof getDeepDarkNoiseLevel === "function" ? getDeepDarkNoiseLevel() : 0;
        return {
            overlayAlpha: 0.8,
            baseRadius: Math.max(95, 140 - noise * 0.4),
            torchBoost: 0.48,
            torchGlowBoost: 1.05,
            decorationTypes: ["soul_lantern"],
            decorationRadius: 118
        };
    }
    return null;
}

function hasBiomeVisionMask(biomeId = currentBiome) {
    return !!getBiomeVisionMaskConfig(biomeId);
}

function getBiomeDarknessOverlayAlpha(biome) {
    const biomeId = biome?.id || currentBiome;
    const rawAlpha = Math.max(0, Number(biome?.effects?.darkness) || 0);
    if (!rawAlpha) return 0;
    if (!hasBiomeVisionMask(biomeId)) return rawAlpha;
    const retained = biomeId === "cave" ? 0.45 : 0.55;
    return Math.max(0.18, Math.min(rawAlpha, rawAlpha * retained));
}

function getPlayerVisionRadiusForBiome(biomeId = currentBiome) {
    const config = getBiomeVisionMaskConfig(biomeId);
    if (!config) return 0;
    const torchRadius = typeof getPlayerTorchLightRadius === "function"
        ? Math.max(0, Number(getPlayerTorchLightRadius()) || 0)
        : 0;
    return Math.max(config.baseRadius, config.baseRadius + torchRadius * config.torchBoost);
}

function cutVisionHole(ctx, x, y, innerRadius, outerRadius) {
    if (!Number.isFinite(x) || !Number.isFinite(y) || outerRadius <= 0) return;
    const light = ctx.createRadialGradient(x, y, innerRadius, x, y, outerRadius);
    light.addColorStop(0, "rgba(0,0,0,0.96)");
    light.addColorStop(0.7, "rgba(0,0,0,0.45)");
    light.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = light;
    ctx.beginPath();
    ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
    ctx.fill();
}

function renderBiomeVisionMask(ctx, camX) {
    const config = getBiomeVisionMaskConfig(currentBiome);
    if (!config) return;
    ctx.save();
    ctx.fillStyle = `rgba(0, 0, 0, ${config.overlayAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "destination-out";

    const px = (player?.x || cameraX) - camX + (player?.width || 32) * 0.5;
    const py = (player?.y || (canvas.height * 0.6)) + (player?.height || 40) * 0.45;
    cutVisionHole(ctx, px, py, 16, getPlayerVisionRadiusForBiome(currentBiome));

    if (typeof torches !== "undefined" && Array.isArray(torches)) {
        for (const torch of torches) {
            if (!torch || torch.remove) continue;
            const tx = torch.x - camX;
            const ty = torch.y;
            const radius = Math.max(90, (Number(torch.lightRadius) || 140) * config.torchGlowBoost);
            cutVisionHole(ctx, tx, ty, 12, radius);
        }
    }

    if (typeof decorations !== "undefined" && Array.isArray(decorations)) {
        for (const d of decorations) {
            if (!d || d.remove || !config.decorationTypes.includes(d.type)) continue;
            const lx = d.x - camX + (d.width || 0) * 0.5;
            const ly = d.y + (d.height || 0) * 0.45;
            cutVisionHole(ctx, lx, ly, 10, config.decorationRadius);
        }
    }

    ctx.restore();
}

function renderDeepDarkVisionMask(ctx, camX) {
    if (currentBiome !== "deep_dark") return;
    renderBiomeVisionMask(ctx, camX);
}

function renderBiomePostEffects(ctx, camX) {
    renderBiomeVisionMask(ctx, camX);
}

// ============ 生成群系粒子 ============
function spawnBiomeParticles() {
    const config = BIOME_PARTICLE_CONFIG[currentBiome];
    if (!config) return;

    const now = Date.now();
    const spawnInterval = 1000 / config.spawnRate;

    if (now - biomeParticlePool.lastSpawn > spawnInterval) {
        const baseX = cameraX + Math.random() * canvas.width;
        biomeParticlePool.add(new BiomeParticle(config, baseX, -10));
        biomeParticlePool.lastSpawn = now;
    }
}

// ============ 主更新和渲染 ============
function updateBiomeVisuals() {
    biomeParticlePool.update();
    updateSculkPulseWaves();
    updateOceanLightBeams();
    updateVolcanoVisualState();

    if (currentBiome === 'end') {
        initEndStars();
    }
}

function renderBiomeVisuals(ctx, camX) {
    // 天空渲染
    renderBiomeSky(ctx, currentBiome);
    renderCaveBackdrop(ctx, camX);
    if (currentBiome === "volcano") renderVolcanoSilhouette(ctx);

    // 粒子效果
    biomeParticlePool.render(ctx, camX);

    // 特殊效果
    renderSculkPulseWaves(ctx, camX);
    renderHeatWave(ctx);
    renderVolcanoAsh(ctx);
    renderLavaPools(ctx);
    renderOceanLightBeams(ctx);
    renderEndStars(ctx);
}

// ============ 清理函数 ============
function clearBiomeVisuals() {
    biomeParticlePool.particles = [];
    biomeParticlePool.lastSpawn = 0;
    sculkPulseWaves = [];
    endStars = [];
    oceanLightBeams = [];
    volcanoAshParticles = [];
    volcanoLavaPools = [];
    heatWaveTimer = 0;
}
