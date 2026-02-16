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

    const time = Date.now() * 0.00005;
    ctx.strokeStyle = 'rgba(255, 69, 0, 0.3)';
    ctx.lineWidth = 2;

    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const yOffset = i * 20;
        for (let x = 0; x < canvas.width; x += 5) {
            const y = canvas.height * 0.6 + yOffset +
                      Math.sin(x * 0.02 + time + i) * 10;
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
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

    if (currentBiome === 'end') {
        initEndStars();
    }
}

function renderBiomeVisuals(ctx, camX) {
    // 天空渲染
    renderBiomeSky(ctx, currentBiome);

    // 粒子效果
    biomeParticlePool.render(ctx, camX);

    // 特殊效果
    renderSculkPulseWaves(ctx, camX);
    renderHeatWave(ctx);
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
    heatWaveTimer = 0;
}
