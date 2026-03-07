(function () {
    const PHASE_INTENTS = {
        1: ["orbit_crystal_heal"],
        2: ["dive_charge", "fireball_breath"],
        3: ["perch_frenzy", "low_sweep"]
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
            writeCurrentBiome("end_arena");
            return this;
        },
        setPhase(phase) {
            this.phase = clampPhase(phase);
            if (this.dragon && typeof this.dragon.setPhase === "function") {
                this.dragon.setPhase(this.phase);
            }
            if (this.state === "idle") {
                this.state = "combat";
            }
        },
        damageDragon(amount) {
            if (!this.dragon || typeof this.dragon.takeDamage !== "function") return;
            this.dragon.takeDamage(amount);
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
        },
        spawnBreathHazard() {
            this.hazards.push({
                id: `hazard-${this.updateCount}-${this.hazards.length}`,
                ttl: 24,
                phase: this.phase
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
        },
        update() {
            if (!this.active || !this.dragon) return;
            this.updateCount += 1;
            if (this.state === "intro") {
                this.state = "combat";
            }
            if (this.victoryReady) {
                this.victoryTimer += 1;
                if (this.victoryTimer >= 8) {
                    this.exitPortalReady = true;
                }
                return;
            }
            this.dragon.update();
            this.phase = this.dragon.phase;
            this.updateCrystals();
            this.updateHazards();
        },
        renderBackground() {},
        renderEntities() {},
        renderHud() {}
    });
})();
