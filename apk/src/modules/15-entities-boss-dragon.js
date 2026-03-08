(function () {
    const PHASE_INTENTS = {
        1: ["orbit_crystal_heal"],
        2: ["dive_charge", "fireball_breath"],
        3: ["perch_frenzy", "low_sweep"]
    };

    const PHASE_META = {
        1: { label: "Phase 1 - Crystal Shield", objective: "Break crystals to stop healing" },
        2: { label: "Phase 2 - Dive and Breath", objective: "Dodge breath pools and punish dives" },
        3: { label: "Phase 3 - Frenzy Finish", objective: "Stay mobile and finish the dragon" }
    };

    function clampPhase(value) {
        return Math.max(1, Math.min(3, Number(value) || 1));
    }

    function readCurrentBiome() {
        if (typeof globalThis.eval === "function") {
            try {
                return globalThis.eval('typeof currentBiome !== "undefined" ? currentBiome : null');
            } catch (error) {}
        }
        return typeof globalThis.currentBiome !== "undefined" ? globalThis.currentBiome : null;
    }

    function writeCurrentBiome(nextBiome) {
        if (typeof globalThis.eval === "function") {
            try {
                globalThis.eval(`currentBiome = ${JSON.stringify(String(nextBiome || "forest"))}`);
                return;
            } catch (error) {}
        }
        globalThis.currentBiome = String(nextBiome || "forest");
    }

    function countAliveCrystals(crystals) {
        return Array.isArray(crystals) ? crystals.filter((entry) => entry && entry.alive).length : 0;
    }

    class EnderDragonBoss {
        constructor(phase = 1, state = "intro") {
            this.name = "Ender Dragon";
            this.maxHp = 300;
            this.hp = 300;
            this.phase = clampPhase(phase);
            this.state = String(state || "intro");
            this.alive = true;
            this.x = 420;
            this.y = 150;
            this.vx = 0;
            this.vy = 0;
            this.intentKey = "orbit_crystal_heal";
            this.updateCount = 0;
            this.fireballs = [];
            this.refreshIntent();
        }

        heal(amount) {
            const value = Math.max(0, Number(amount) || 0);
            this.hp = Math.min(this.maxHp, this.hp + value);
        }

        refreshIntent() {
            const intents = PHASE_INTENTS[this.phase] || PHASE_INTENTS[1];
            const index = intents.length <= 1 ? 0 : Math.floor(this.updateCount / 8) % intents.length;
            this.intentKey = intents[index];
        }

        setPhase(phase) {
            this.phase = clampPhase(phase);
            this.updateCount = 0;
            if (this.phase > 1 && this.state === "intro") {
                this.state = "combat";
            }
            this.refreshIntent();
        }

        takeDamage(amount) {
            const damage = Math.max(0, Number(amount) || 0);
            this.hp = Math.max(0, this.hp - damage);
            if (this.hp <= 0) {
                this.alive = false;
                this.state = "defeated";
            }
        }

        update() {
            if (!this.alive) return;
            this.updateCount += 1;
            if (this.state === "intro") {
                this.state = "combat";
            }
            this.x = 420 + Math.sin(this.updateCount / 10) * (this.phase === 1 ? 90 : this.phase === 2 ? 120 : 70);
            this.y = 150 + Math.cos(this.updateCount / 14) * (this.phase === 3 ? 24 : 50);
            this.refreshIntent();
        }
    }

    function createPlaceholderCrystals() {
        return [
            { id: 1, alive: true, x: 180, y: 120, beamActive: false },
            { id: 2, alive: true, x: 320, y: 96, beamActive: false },
            { id: 3, alive: true, x: 520, y: 110, beamActive: false },
            { id: 4, alive: true, x: 700, y: 132, beamActive: false }
        ];
    }

    function findCrystalByIndex(crystals, index) {
        const value = Number(index);
        if (!Array.isArray(crystals) || value < 0 || !Number.isFinite(value)) return null;
        return crystals[value] || null;
    }

    const existing = globalThis.endDragonArena || {};

    globalThis.endDragonArena = Object.assign(existing, {
        active: false,
        state: "idle",
        phase: 1,
        dragon: null,
        crystals: [],
        hazards: [],
        victoryReady: false,
        exitPortalReady: false,
        victoryTimer: 0,
        updateCount: 0,
        entryContext: null,
        returnContext: null,
        hudTitle: "",
        phaseLabel: "",
        crystalLabel: "",
        objectiveLabel: "",
        statusLabel: "",
        bannerText: "",
        bannerTimer: 0,
        phasePulse: 0,
        damageFlash: 0,
        portalPulse: 0,
        queueBanner(text, timer = 120) {
            this.bannerText = String(text || "");
            this.bannerTimer = Math.max(0, Number(timer) || 0);
        },
        updateHudState() {
            const meta = PHASE_META[this.phase] || PHASE_META[1];
            const aliveCrystalCount = countAliveCrystals(this.crystals);
            this.hudTitle = "ENDER DRAGON";
            this.phaseLabel = meta.label;
            this.crystalLabel = `Crystals: ${aliveCrystalCount}`;
            this.objectiveLabel = meta.objective;
            if (this.victoryReady && this.exitPortalReady) {
                this.statusLabel = "Exit Portal Open";
            } else if (this.victoryReady) {
                this.statusLabel = "Stabilizing Portal";
            } else if (aliveCrystalCount > 0 && this.phase === 1) {
                this.statusLabel = "Crystals are healing the dragon";
            } else {
                this.statusLabel = "Arena Locked";
            }
        },
        enter(options = {}) {
            this.active = true;
            this.state = String(options.state || "intro");
            this.phase = clampPhase(options.phase);
            this.dragon = new EnderDragonBoss(this.phase, this.state);
            this.crystals = createPlaceholderCrystals();
            this.hazards = [];
            this.victoryReady = false;
            this.exitPortalReady = false;
            this.victoryTimer = 0;
            this.updateCount = 0;
            this.entryContext = {
                biome: readCurrentBiome(),
                playerX: globalThis.player ? Number(globalThis.player.x) || 0 : null,
                playerY: globalThis.player ? Number(globalThis.player.y) || 0 : null
            };
            this.returnContext = Object.assign({}, this.entryContext);
            writeCurrentBiome("end");
            this.queueBanner("Enter the End Arena", 120);
            this.phasePulse = 0;
            this.damageFlash = 0;
            this.portalPulse = 0;
            this.updateHudState();
            return this;
        },
        setPhase(phase) {
            const nextPhase = clampPhase(phase);
            this.phase = nextPhase;
            if (this.dragon && typeof this.dragon.setPhase === "function") {
                this.dragon.setPhase(this.phase);
            }
            if (this.state === "idle") {
                this.state = "combat";
            }
            this.queueBanner((PHASE_META[nextPhase] || PHASE_META[1]).label, 96);
            this.phasePulse = 36;
            this.updateHudState();
        },
        damageDragon(amount) {
            if (!this.dragon || typeof this.dragon.takeDamage !== "function") return;
            const beforeHp = Number(this.dragon.hp) || 0;
            this.dragon.takeDamage(amount);
            if ((Number(this.dragon.hp) || 0) < beforeHp) {
                this.damageFlash = 18;
            }
            this.updateHudState();
        },
        destroyCrystal(index) {
            const crystal = findCrystalByIndex(this.crystals, index);
            if (!crystal || !crystal.alive) return;
            const linked = Boolean(crystal.beamActive);
            crystal.alive = false;
            crystal.beamActive = false;
            if (linked && this.dragon && this.dragon.alive) {
                this.dragon.takeDamage(10);
            }
            this.queueBanner("Crystal Destroyed", 72);
            this.updateHudState();
        },
        spawnBreathHazard() {
            const originX = this.dragon ? this.dragon.x : 420;
            const originY = this.dragon ? this.dragon.y + 60 : 220;
            this.hazards.push({
                id: `hazard-${this.updateCount}-${this.hazards.length}`,
                ttl: 24,
                phase: this.phase,
                x: originX + (this.hazards.length % 2 === 0 ? -35 : 35),
                y: originY,
                radius: this.phase === 3 ? 56 : 42
            });
        },
        updateCrystals() {
            const aliveCrystals = this.crystals.filter((entry) => entry && entry.alive);
            this.crystals.forEach((entry, index) => {
                if (!entry) return;
                entry.beamActive = index === 0 && entry.alive && this.phase === 1 && this.dragon && this.dragon.alive;
            });
            if (this.phase === 1 && aliveCrystals.length > 0 && this.dragon && this.dragon.alive && this.updateCount % 5 === 0) {
                this.dragon.heal(4);
            }
        },
        updateHazards() {
            if (this.phase >= 2 && this.updateCount % 6 === 0) {
                this.spawnBreathHazard();
            }
            this.hazards = this.hazards
                .map((entry) => Object.assign({}, entry, { ttl: (Number(entry.ttl) || 0) - 1 }))
                .filter((entry) => entry.ttl > 0);
        },
        forceVictory() {
            this.victoryReady = true;
            this.victoryTimer = 0;
            if (this.dragon) {
                this.dragon.alive = false;
                this.dragon.state = "defeated";
            }
            this.queueBanner("Dragon Defeated", 140);
            this.portalPulse = 1;
            this.updateHudState();
        },
        exit() {
            const context = this.returnContext ? Object.assign({}, this.returnContext) : null;
            this.reset();
            if (context && context.biome) {
                writeCurrentBiome(context.biome);
            }
            if (context && globalThis.player) {
                if (Number.isFinite(context.playerX)) globalThis.player.x = context.playerX;
                if (Number.isFinite(context.playerY)) globalThis.player.y = context.playerY;
            }
        },
        reset() {
            this.active = false;
            this.state = "idle";
            this.phase = 1;
            this.dragon = null;
            this.crystals = [];
            this.hazards = [];
            this.victoryReady = false;
            this.exitPortalReady = false;
            this.victoryTimer = 0;
            this.updateCount = 0;
            this.entryContext = null;
            this.returnContext = null;
            this.hudTitle = "";
            this.phaseLabel = "";
            this.crystalLabel = "";
            this.objectiveLabel = "";
            this.statusLabel = "";
            this.bannerText = "";
            this.bannerTimer = 0;
            this.phasePulse = 0;
            this.damageFlash = 0;
            this.portalPulse = 0;
        },
        update() {
            if (!this.active || !this.dragon) return;
            this.updateCount += 1;
            if (this.state === "intro") {
                this.state = "combat";
            }
            if (this.bannerTimer > 0) {
                this.bannerTimer -= 1;
            } else {
                this.bannerText = "";
            }
            if (this.phasePulse > 0) this.phasePulse -= 1;
            if (this.damageFlash > 0) this.damageFlash -= 1;
            if (this.victoryReady) {
                this.victoryTimer += 1;
                this.portalPulse = (this.portalPulse + 1) % 48;
                if (this.victoryTimer >= 8) {
                    this.exitPortalReady = true;
                }
                this.updateHudState();
                return;
            }
            this.dragon.update();
            this.phase = this.dragon.phase;
            this.updateCrystals();
            this.updateHazards();
            this.updateHudState();
        },
        renderBackground(ctx) {
            if (!ctx || !ctx.canvas) return;
            const { width, height } = ctx.canvas;
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, "#06030d");
            gradient.addColorStop(0.55, "#150a24");
            gradient.addColorStop(1, "#1d0f2e");
            ctx.save();
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = "rgba(207, 126, 255, 0.14)";
            for (let index = 0; index < 18; index += 1) {
                const x = ((index * 97) % width);
                const y = ((index * 53) % Math.max(80, height * 0.45));
                ctx.beginPath();
                ctx.arc(x, y, index % 3 === 0 ? 2 : 1.2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = "#2a2038";
            ctx.beginPath();
            ctx.ellipse(width * 0.5, height - 58, width * 0.36, 64, 0, 0, Math.PI * 2);
            ctx.fill();
            if (this.phasePulse > 0) {
                ctx.fillStyle = `rgba(215, 122, 255, ${Math.min(0.22, this.phasePulse / 140)})`;
                ctx.fillRect(0, 0, width, height);
            }
            ctx.restore();
        },
        renderEntities(ctx) {
            if (!ctx || !this.active) return;
            ctx.save();
            for (const crystal of this.crystals) {
                if (!crystal || !crystal.alive) continue;
                ctx.fillStyle = "#251b34";
                ctx.fillRect(crystal.x - 10, crystal.y + 10, 20, 230 - crystal.y);
                if (crystal.beamActive && this.dragon) {
                    ctx.strokeStyle = "rgba(203, 114, 255, 0.7)";
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.moveTo(crystal.x, crystal.y + 6);
                    ctx.lineTo(this.dragon.x, this.dragon.y + 6);
                    ctx.stroke();
                }
                ctx.fillStyle = "#aef1ff";
                ctx.beginPath();
                ctx.moveTo(crystal.x, crystal.y - 12);
                ctx.lineTo(crystal.x + 10, crystal.y);
                ctx.lineTo(crystal.x, crystal.y + 12);
                ctx.lineTo(crystal.x - 10, crystal.y);
                ctx.closePath();
                ctx.fill();
            }
            for (const hazard of this.hazards) {
                ctx.fillStyle = "rgba(188, 88, 255, 0.22)";
                ctx.beginPath();
                ctx.arc(hazard.x, hazard.y, hazard.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "rgba(238, 170, 255, 0.42)";
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            if (this.exitPortalReady) {
                const portalScale = 1 + Math.sin((this.portalPulse / 48) * Math.PI * 2) * 0.12;
                ctx.fillStyle = "rgba(120, 25, 170, 0.35)";
                ctx.beginPath();
                ctx.ellipse(420, 298, 50 * portalScale, 18 * portalScale, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#d48bff";
                ctx.lineWidth = 3;
                ctx.stroke();
                ctx.strokeStyle = "rgba(239, 190, 255, 0.35)";
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.ellipse(420, 298, 58 * portalScale, 24 * portalScale, 0, 0, Math.PI * 2);
                ctx.stroke();
            }
            if (this.dragon) {
                const dragon = this.dragon;
                const damageFlashAlpha = this.damageFlash > 0 ? Math.min(0.55, this.damageFlash / 20) : 0;
                ctx.translate(dragon.x, dragon.y);
                ctx.fillStyle = damageFlashAlpha > 0 ? `rgba(255, 176, 216, ${0.35 + damageFlashAlpha * 0.5})` : (dragon.alive ? "#1c1328" : "#31263d");
                ctx.fillRect(-42, -14, 84, 28);
                ctx.fillRect(28, -8, 24, 16);
                ctx.fillStyle = damageFlashAlpha > 0 ? `rgba(255, 218, 240, ${0.28 + damageFlashAlpha * 0.4})` : (dragon.alive ? "#2b1d3f" : "#463655");
                ctx.fillRect(-74, -6, 30, 12);
                ctx.fillRect(44, -22, 18, 12);
                ctx.fillRect(44, 10, 18, 12);
                if (damageFlashAlpha > 0) {
                    ctx.fillStyle = `rgba(255, 214, 236, ${damageFlashAlpha})`;
                    ctx.fillRect(-48, -18, 96, 36);
                }
                ctx.fillStyle = "#d79dff";
                ctx.fillRect(34, -5, 5, 5);
                ctx.restore();
                ctx.save();
            }
            ctx.restore();
        },
        renderHud(ctx) {
            if (!ctx || !ctx.canvas || !this.active || !this.dragon) return;
            const { width } = ctx.canvas;
            const ratio = Math.max(0, Math.min(1, this.dragon.maxHp > 0 ? this.dragon.hp / this.dragon.maxHp : 0));
            ctx.save();
            ctx.fillStyle = "rgba(9, 8, 18, 0.78)";
            ctx.fillRect(24, 18, width - 48, 86);
            ctx.strokeStyle = "rgba(199, 142, 255, 0.6)";
            ctx.lineWidth = 2;
            ctx.strokeRect(24, 18, width - 48, 86);
            ctx.fillStyle = "#f0d7ff";
            ctx.font = "bold 20px Verdana";
            ctx.fillText(this.hudTitle, 40, 44);
            ctx.font = "13px Verdana";
            ctx.fillStyle = "#ceb4e8";
            ctx.fillText(this.phaseLabel, 40, 64);
            ctx.fillText(this.crystalLabel, 40, 82);
            ctx.fillStyle = "#f5e9ff";
            ctx.fillText(this.objectiveLabel, 270, 64);
            ctx.fillStyle = "#ffcf8a";
            ctx.fillText(this.statusLabel, 270, 82);
            ctx.fillStyle = "rgba(59, 39, 79, 0.95)";
            ctx.fillRect(40, 88, width - 80, 10);
            ctx.fillStyle = ratio > 0.4 ? "#b86cff" : "#ff7e9d";
            ctx.fillRect(40, 88, Math.max(0, (width - 80) * ratio), 10);
            if (this.bannerText) {
                const bannerWidth = 320;
                const left = (width - bannerWidth) / 2;
                ctx.fillStyle = "rgba(31, 15, 49, 0.92)";
                ctx.fillRect(left, 118, bannerWidth, 34);
                ctx.strokeStyle = "rgba(221, 166, 255, 0.78)";
                ctx.strokeRect(left, 118, bannerWidth, 34);
                ctx.fillStyle = "#fff1ff";
                ctx.font = "bold 16px Verdana";
                ctx.textAlign = "center";
                ctx.fillText(this.bannerText, width / 2, 140);
                ctx.textAlign = "start";
            }
            ctx.restore();
        }
    });
})();
