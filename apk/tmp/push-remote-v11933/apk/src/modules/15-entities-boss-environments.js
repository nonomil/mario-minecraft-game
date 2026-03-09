(function initBossEnvironmentController(global) {
    const ENVIRONMENT_DEFINITIONS = {
        wither: {
            id: "wither_necropolis",
            label: "凋零冥殿",
            theme: "shadow",
            hazardProfile: {
                phase2: { interval: 15, ttl: 24, kind: "grave_smoke" },
                phase3: { interval: 8, ttl: 30, kind: "void_skull" }
            }
        },
        ghast: {
            id: "ghast_skydock",
            label: "恶魂空港",
            theme: "storm",
            hazardProfile: {
                phase2: { interval: 14, ttl: 22, kind: "gust_front" },
                phase3: { interval: 8, ttl: 30, kind: "crosswind" }
            }
        },
        blaze: {
            id: "blaze_core",
            label: "烈焰熔核",
            theme: "volcanic",
            hazardProfile: {
                phase2: { interval: 14, ttl: 20, kind: "ember_wave" },
                phase3: { interval: 8, ttl: 28, kind: "solar_flare" }
            }
        },
        wither_skeleton: {
            id: "bone_foundry",
            label: "骨冢铸场",
            theme: "ashen",
            hazardProfile: {
                phase2: { interval: 16, ttl: 22, kind: "ash_burst" },
                phase3: { interval: 9, ttl: 28, kind: "bone_spike" }
            }
        },
        warden: {
            id: "deep_dark",
            label: "幽匿深域",
            theme: "darkness",
            hazardProfile: {
                phase2: { interval: 15, ttl: 22, kind: "dark_echo" },
                phase3: { interval: 9, ttl: 30, kind: "sonic_rift" }
            }
        },
        evoker: {
            id: "totem_hall",
            label: "图腾秘厅",
            theme: "arcane",
            hazardProfile: {
                phase2: { interval: 15, ttl: 24, kind: "totem_glow" },
                phase3: { interval: 8, ttl: 30, kind: "arcane_fang" }
            }
        }
    };

    const DEFAULT_THEME = "neutral";
    const DEFAULT_STATE = "idle";
    const MAX_PREVIEW_HAZARDS = 8;
    const VOLCANIC_BASE_ALPHA = 0.24;
    const DARKNESS_BASE_ALPHA = 0.3;
    const SHADOW_BASE_ALPHA = 0.26;
    const ASHEN_BASE_ALPHA = 0.24;
    const ARCANE_BASE_ALPHA = 0.25;
    const DEFAULT_BASE_ALPHA = 0.16;

    function normalizeBossType(type) {
        const normalized = String(type || "").trim().toLowerCase();
        return ENVIRONMENT_DEFINITIONS[normalized] ? normalized : "wither";
    }

    function readDefinition(type) {
        return ENVIRONMENT_DEFINITIONS[normalizeBossType(type)];
    }

    function readHazardStage(phase) {
        return Math.max(2, Math.min(3, Number(phase) || 2));
    }

    function readThemeBaseAlpha(theme) {
        if (theme === "volcanic") return VOLCANIC_BASE_ALPHA;
        if (theme === "darkness") return DARKNESS_BASE_ALPHA;
        if (theme === "shadow") return SHADOW_BASE_ALPHA;
        if (theme === "ashen") return ASHEN_BASE_ALPHA;
        if (theme === "arcane") return ARCANE_BASE_ALPHA;
        return DEFAULT_BASE_ALPHA;
    }

    function readPhaseVisualBoost(intensity) {
        const level = Math.max(0, Number(intensity) || 0);
        if (level >= 3) return 0.09;
        if (level >= 2) return 0.055;
        if (level >= 1) return 0.035;
        return 0;
    }

    function readOverlayStrength(theme, intensity, hazardCount) {
        const baseAlpha = readThemeBaseAlpha(theme);
        const phaseBoost = readPhaseVisualBoost(intensity);
        const hazardBoost = Math.min(0.08, Math.max(0, Number(hazardCount) || 0) * 0.01);
        return Math.min(0.72, baseAlpha + phaseBoost + hazardBoost);
    }

    const existing = global.bossEnvironmentController || {};

    global.getBossEnvironmentDefinition = readDefinition;
    global.bossEnvironmentController = Object.assign(existing, {
        active: false,
        bossType: null,
        environmentId: null,
        label: "",
        theme: DEFAULT_THEME,
        state: DEFAULT_STATE,
        hazards: [],
        intensity: 0,
        encounterSource: null,
        updateCount: 0,
        lastHazardKind: "",
        windForce: 0,
        pulseFrames: 0,
        pulseSerial: 0,
        safeZoneInset: 0,
        visionRadius: 140,
        driftForce: 0,
        sealFrames: 0,
        comboKey: "",
        comboFrames: 0,
        enter(bossType, options = {}) {
            const normalizedType = normalizeBossType(bossType);
            const definition = readDefinition(normalizedType);
            this.active = true;
            this.bossType = normalizedType;
            this.environmentId = definition.id;
            this.label = definition.label;
            this.theme = definition.theme || DEFAULT_THEME;
            this.state = String(options.state || "engaged");
            this.hazards = [];
            this.intensity = 1;
            this.encounterSource = options.source ? String(options.source) : "manual";
            this.updateCount = 0;
            this.lastHazardKind = "";
            this.windForce = 0;
            this.pulseFrames = 0;
            this.pulseSerial = 0;
            this.safeZoneInset = 0;
            this.visionRadius = 140;
            this.driftForce = 0;
            this.sealFrames = 0;
            this.comboKey = "";
            this.comboFrames = 0;
            return this;
        },
        pushHazard(kind, ttl, phase) {
            this.lastHazardKind = String(kind || "pressure_zone");
            this.hazards.push({
                id: `${this.environmentId || "arena"}-${this.updateCount}-${this.hazards.length}`,
                kind: this.lastHazardKind,
                ttl: Math.max(1, Number(ttl) || 1),
                phase: Math.max(1, Number(phase) || 1)
            });
        },
        updateHazards() {
            this.hazards = this.hazards
                .map((entry) => Object.assign({}, entry, { ttl: (Number(entry.ttl) || 0) - 1 }))
                .filter((entry) => entry.ttl > 0)
                .slice(-MAX_PREVIEW_HAZARDS);
        },
        triggerCombo(key, frames = 18) {
            this.comboKey = String(key || "");
            this.comboFrames = Math.max(1, Number(frames) || 1);
        },
        spawnBossPressureHazards(boss) {
            const definition = readDefinition(this.bossType);
            const profile = definition && definition.hazardProfile ? definition.hazardProfile : null;
            const phase = Math.max(1, Number(boss && boss.phase) || 1);
            if (!profile || phase < 2) return;
            const stageKey = phase >= 3 ? "phase3" : `phase${readHazardStage(phase)}`;
            const stage = profile[stageKey];
            if (!stage) return;
            if (this.updateCount % stage.interval !== 0) return;
            this.pushHazard(stage.kind, stage.ttl, phase);
        },
        update(arena) {
            if (!this.active) return;
            const boss = arena && arena.boss ? arena.boss : null;
            if (!arena || !arena.active || !boss) {
                this.reset();
                return;
            }
            this.updateCount += 1;
            this.intensity = Math.max(1, Number(boss.phase) || 1);
            this.state = boss.alive === false ? "victory" : "engaged";
            if (this.comboFrames > 0) {
                this.comboFrames -= 1;
                if (this.comboFrames <= 0) this.comboKey = "";
            }
            if (this.theme === "storm") {
                const amplitude = 0.22 + this.intensity * 0.12 + Math.min(0.22, this.hazards.length * 0.02);
                this.windForce = Math.sin(this.updateCount * 0.18) * amplitude;
            } else {
                this.windForce = 0;
            }
            if (this.theme === "shadow") {
                const baseDrift = 0.18 + this.intensity * 0.07 + Math.min(0.18, this.hazards.length * 0.02);
                this.driftForce = baseDrift;
            } else {
                this.driftForce = 0;
            }
            if (this.theme === "volcanic") {
                if (this.pulseFrames > 0) this.pulseFrames -= 1;
                if (this.intensity >= 3 && this.updateCount % 24 === 0) {
                    this.pulseFrames = 12;
                    this.pulseSerial += 1;
                }
            } else {
                this.pulseFrames = 0;
            }
            if (this.theme === "ashen") {
                this.safeZoneInset = 22 + this.intensity * 10 + Math.min(26, this.hazards.length * 4);
            } else {
                this.safeZoneInset = 0;
            }
            if (this.theme === "darkness") {
                this.visionRadius = Math.max(78, 132 - this.intensity * 10 - this.hazards.length * 4);
            } else {
                this.visionRadius = 140;
            }
            if (this.theme === "arcane") {
                if (this.sealFrames > 0) this.sealFrames -= 1;
                if (this.intensity >= 3 && this.updateCount % 18 === 0) {
                    this.sealFrames = 12;
                }
            } else {
                this.sealFrames = 0;
            }
            if (boss.alive !== false) {
                this.spawnBossPressureHazards(boss);
            }
            this.updateHazards();
        },
        renderOverlay(ctx) {
            if (!this.active || !global.canvas) return;
            const hazardCount = Array.isArray(this.hazards) ? this.hazards.length : 0;
            const overlayStrength = readOverlayStrength(this.theme, this.intensity, hazardCount);
            const hazardBoost = Math.min(0.08, hazardCount * 0.01);
            if (this.theme === "volcanic") {
                const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                gradient.addColorStop(0, `rgba(255, 120, 40, ${overlayStrength})`);
                gradient.addColorStop(1, `rgba(70, 10, 0, ${Math.min(0.24, overlayStrength * 0.55)})`);
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                const emberCount = Math.max(4, Math.min(8, hazardCount + 3));
                for (let index = 0; index < emberCount; index += 1) {
                    const cycle = (this.updateCount * (0.011 + index * 0.002)) + index * 0.17;
                    const progress = cycle - Math.floor(cycle);
                    const x = canvas.width * (0.12 + progress * 0.76);
                    const y = canvas.height * (0.18 + ((index * 23) % 9) * 0.07);
                    const radius = 12 + index * 2;
                    ctx.fillStyle = `rgba(255, 214, 102, ${0.18 + index * 0.04})`;
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, Math.PI * 2);
                    ctx.fill();
                }
                if (this.pulseFrames > 0) {
                    ctx.fillStyle = `rgba(255, 240, 180, ${0.06 + this.pulseFrames * 0.018})`;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                return;
            }
            if (this.theme === "darkness") {
                ctx.save();
                ctx.fillStyle = `rgba(6, 10, 16, ${overlayStrength})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.globalCompositeOperation = "destination-out";
                const px = ((global.player && Number(global.player.x)) || 0) - ((typeof global.cameraX === "number" ? global.cameraX : 0)) + (((global.player && Number(global.player.width)) || 32) * 0.5);
                const py = ((global.player && Number(global.player.y)) || (canvas.height * 0.6)) + (((global.player && Number(global.player.height)) || 40) * 0.45);
                const radius = Math.max(56, Number(this.visionRadius) || 120);
                const mask = ctx.createRadialGradient(px, py, 12, px, py, radius);
                mask.addColorStop(0, "rgba(0,0,0,0.95)");
                mask.addColorStop(1, "rgba(0,0,0,0)");
                ctx.fillStyle = mask;
                ctx.beginPath();
                ctx.arc(px, py, radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                return;
            }
            if (this.theme === "storm") {
                const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                gradient.addColorStop(0, `rgba(130, 150, 170, ${Math.min(0.42, overlayStrength * 0.82)})`);
                gradient.addColorStop(1, `rgba(40, 55, 78, ${Math.min(0.22, overlayStrength * 0.5)})`);
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                const streakCount = Math.max(4, Math.min(8, hazardCount + 2));
                for (let index = 0; index < streakCount; index += 1) {
                    const drift = (this.updateCount * 7 + index * 90) % (canvas.width + 220);
                    const startX = drift - 160;
                    const startY = 80 + index * 54;
                    ctx.strokeStyle = `rgba(230, 244, 255, ${0.10 + index * 0.03})`;
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(startX + 110, startY - 16);
                    ctx.stroke();
                }
                return;
            }
            if (this.theme === "shadow") {
                ctx.fillStyle = `rgba(18, 10, 30, ${overlayStrength})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                const riftCount = Math.min(5, this.hazards.length + 1);
                for (let index = 0; index < riftCount; index += 1) {
                    const x = canvas.width * (0.18 + index * 0.16);
                    const y = canvas.height * (0.18 + ((index * 19) % 5) * 0.13);
                    const width = 42 + index * 10;
                    const height = 92 + index * 12;
                    ctx.fillStyle = `rgba(168, 120, 255, ${0.08 + index * 0.025})`;
                    ctx.fillRect(x, y, width, height);
                }
                return;
            }
            if (this.theme === "ashen") {
                const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                gradient.addColorStop(0, `rgba(86, 86, 86, ${overlayStrength})`);
                gradient.addColorStop(1, `rgba(28, 28, 28, ${Math.min(0.18, overlayStrength * 0.45)})`);
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                const shardCount = Math.max(4, Math.min(8, hazardCount + 2));
                for (let index = 0; index < shardCount; index += 1) {
                    const x = canvas.width * (0.08 + index * 0.12);
                    const y = canvas.height * (0.74 - (index % 3) * 0.08);
                    ctx.fillStyle = `rgba(210, 210, 210, ${0.08 + index * 0.018})`;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + 14, y - 44);
                    ctx.lineTo(x + 28, y);
                    ctx.closePath();
                    ctx.fill();
                }
                return;
            }
            if (this.theme === "arcane") {
                ctx.fillStyle = `rgba(38, 18, 70, ${overlayStrength})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                const sigilRadius = Math.min(canvas.width, canvas.height) * 0.16;
                ctx.strokeStyle = `rgba(190, 120, 255, ${Math.min(0.45, overlayStrength + 0.1)})`;
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(canvas.width * 0.82, canvas.height * 0.24, sigilRadius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(canvas.width * 0.82 - sigilRadius, canvas.height * 0.24);
                ctx.lineTo(canvas.width * 0.82 + sigilRadius, canvas.height * 0.24);
                ctx.moveTo(canvas.width * 0.82, canvas.height * 0.24 - sigilRadius);
                ctx.lineTo(canvas.width * 0.82, canvas.height * 0.24 + sigilRadius);
                ctx.stroke();
                return;
            }
            ctx.fillStyle = `rgba(255, 255, 255, ${DEFAULT_BASE_ALPHA})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        },
        exit() {
            this.reset();
        },
        reset() {
            this.active = false;
            this.bossType = null;
            this.environmentId = null;
            this.label = "";
            this.theme = DEFAULT_THEME;
            this.state = DEFAULT_STATE;
            this.hazards = [];
            this.intensity = 0;
            this.encounterSource = null;
            this.updateCount = 0;
            this.lastHazardKind = "";
            this.windForce = 0;
            this.pulseFrames = 0;
            this.pulseSerial = 0;
            this.safeZoneInset = 0;
            this.visionRadius = 140;
            this.driftForce = 0;
            this.sealFrames = 0;
            this.comboKey = "";
            this.comboFrames = 0;
        },
        getSnapshot() {
            return {
                active: Boolean(this.active),
                bossType: this.bossType || null,
                environmentId: this.environmentId || null,
                label: this.label || "",
                theme: this.theme || DEFAULT_THEME,
                state: this.state || DEFAULT_STATE,
                hazardCount: Array.isArray(this.hazards) ? this.hazards.length : 0,
                intensity: Math.max(0, Number(this.intensity) || 0),
                encounterSource: this.encounterSource || null,
                lastHazardKind: this.lastHazardKind || "",
                windForce: Number(this.windForce) || 0,
                pulseFrames: Math.max(0, Number(this.pulseFrames) || 0),
                pulseSerial: Math.max(0, Number(this.pulseSerial) || 0),
                safeZoneInset: Math.max(0, Number(this.safeZoneInset) || 0),
                visionRadius: Math.max(0, Number(this.visionRadius) || 0),
                driftForce: Number(this.driftForce) || 0,
                sealFrames: Math.max(0, Number(this.sealFrames) || 0),
                comboKey: this.comboKey || "",
                comboFrames: Math.max(0, Number(this.comboFrames) || 0),
                visualStrength: readOverlayStrength(this.theme, this.intensity, Array.isArray(this.hazards) ? this.hazards.length : 0)
            };
        }
    });
})(globalThis);
