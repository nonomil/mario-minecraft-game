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

    const DRAGON_ARENA_CENTER_X = 420;
    const DRAGON_ARENA_CENTER_Y = 228;
    const DRAGON_PHASE_ORBIT_X = {
        1: 90,
        2: 120,
        3: 70
    };
    const DRAGON_PHASE_ORBIT_Y = {
        1: 34,
        2: 34,
        3: 20
    };
    const DRAGON_X_MIN = 120;
    const DRAGON_X_MAX = 1160;
    const DRAGON_Y_MIN = 140;
    const DRAGON_Y_MAX = 340;
    const DRAGON_CRYSTAL_SIZE = {
        width: 28,
        height: 34
    };
    const DRAGON_CRYSTAL_PILLAR_BASE_Y = 284;
    const DRAGON_CRYSTAL_LAYOUT = [
        { id: 1, x: 180, y: 208 },
        { id: 2, x: 320, y: 202 },
        { id: 3, x: 520, y: 210 },
        { id: 4, x: 700, y: 220 }
    ];

    function clampPhase(value) {
        return Math.max(1, Math.min(3, Number(value) || 1));
    }

    function clampNumber(value, min, max) {
        return Math.max(min, Math.min(max, Number(value) || 0));
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

    function readPlayerSnapshot() {
        if (typeof globalThis.eval === "function") {
            try {
                return globalThis.eval(`(() => {
                    if (typeof player === "undefined" || !player) return null;
                    return {
                        x: Number(player.x) || 0,
                        y: Number(player.y) || 0,
                        width: Number(player.width) || 0,
                        height: Number(player.height) || 0,
                        velX: Number(player.velX) || 0,
                        velY: Number(player.velY) || 0,
                        grounded: Boolean(player.grounded)
                    };
                })()`);
            } catch (error) {}
        }
        if (globalThis.player) {
            return {
                x: Number(globalThis.player.x) || 0,
                y: Number(globalThis.player.y) || 0,
                width: Number(globalThis.player.width) || 0,
                height: Number(globalThis.player.height) || 0,
                velX: Number(globalThis.player.velX) || 0,
                velY: Number(globalThis.player.velY) || 0,
                grounded: Boolean(globalThis.player.grounded)
            };
        }
        return null;
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
            this.x = DRAGON_ARENA_CENTER_X;
            this.y = DRAGON_ARENA_CENTER_Y;
            this.vx = 0;
            this.vy = 0;
            this.width = 220;
            this.height = 96;
            this.contactDamage = 2;
            this.intentKey = "orbit_crystal_heal";
            this.updateCount = 0;
            this.fireballs = [];
            this.targetX = this.x;
            this.targetY = this.y;
            this.movementMode = "orbit";
            this.attackCooldown = 0;
            this.attackTimer = 0;
            this.diveTargetX = this.x;
            this.diveTargetY = this.y;
            this.fireballCooldown = 0;
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
            this.attackCooldown = 0;
            this.attackTimer = 0;
            this.fireballCooldown = 0;
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

        readPlayerAnchor(playerContext) {
            if (!playerContext) {
                return {
                    x: DRAGON_ARENA_CENTER_X,
                    y: DRAGON_ARENA_CENTER_Y + 120,
                    velX: 0,
                    velY: 0,
                    grounded: false
                };
            }
            return {
                x: clampNumber(playerContext.x, 80, 1220),
                y: clampNumber(playerContext.y, 180, 480),
                velX: Number(playerContext.velX) || 0,
                velY: Number(playerContext.velY) || 0,
                grounded: Boolean(playerContext.grounded)
            };
        }

        steerToward(targetX, targetY, smoothing = 0.18, maxSpeed = 22) {
            const desiredX = clampNumber(targetX, DRAGON_X_MIN, DRAGON_X_MAX);
            const desiredY = clampNumber(targetY, DRAGON_Y_MIN, DRAGON_Y_MAX);
            this.targetX = desiredX;
            this.targetY = desiredY;
            this.vx += (desiredX - this.x) * smoothing;
            this.vy += (desiredY - this.y) * smoothing;
            this.vx = clampNumber(this.vx, -maxSpeed, maxSpeed);
            this.vy = clampNumber(this.vy, -maxSpeed, maxSpeed);
            this.vx *= 0.82;
            this.vy *= 0.82;
            this.x = clampNumber(this.x + this.vx, DRAGON_X_MIN, DRAGON_X_MAX);
            this.y = clampNumber(this.y + this.vy, DRAGON_Y_MIN, DRAGON_Y_MAX);
        }

        update(playerContext) {
            if (!this.alive) return;
            this.updateCount += 1;
            if (this.state === "intro") {
                this.state = "combat";
            }
            this.refreshIntent();
            if (this.attackCooldown > 0) this.attackCooldown -= 1;
            if (this.attackTimer > 0) this.attackTimer -= 1;
            if (this.fireballCooldown > 0) this.fireballCooldown -= 1;

            const player = this.readPlayerAnchor(playerContext);
            const wobbleX = Math.sin(this.updateCount / 6) * 26;
            const wobbleY = Math.cos(this.updateCount / 9) * 10;
            const predictedPlayerX = player.x + player.velX * (this.phase === 2 ? 16 : 8);
            const phaseIntent = this.intentKey;

            if (this.phase === 1) {
                this.movementMode = "orbit_player";
                this.steerToward(predictedPlayerX + wobbleX * 0.8, player.y - 150 + wobbleY, 0.18, 26);
                return;
            }

            if (this.phase === 2) {
                if (phaseIntent === "dive_charge") {
                    this.movementMode = "dive_charge";
                    this.diveTargetX = predictedPlayerX;
                    this.diveTargetY = player.y - 18;
                    this.steerToward(this.diveTargetX, this.diveTargetY, 0.24, 34);
                    return;
                }
                this.movementMode = "fireball_breath";
                this.steerToward(player.x - 110 + wobbleX, player.y - 138 + wobbleY, 0.18, 24);
                return;
            }

            if (phaseIntent === "low_sweep") {
                this.movementMode = "low_sweep";
                this.steerToward(player.x + Math.sin(this.updateCount / 4) * 92, player.y - 88 + wobbleY, 0.24, 30);
                return;
            }

            this.movementMode = "perch_frenzy";
            this.steerToward(player.x + wobbleX * 0.6, player.y - 112 + wobbleY, 0.22, 28);
        }
    }

    function createPlaceholderCrystals() {
        return DRAGON_CRYSTAL_LAYOUT.map((entry) => ({
            id: entry.id,
            alive: true,
            x: entry.x,
            y: entry.y,
            width: DRAGON_CRYSTAL_SIZE.width,
            height: DRAGON_CRYSTAL_SIZE.height,
            beamActive: false
        }));
    }

    function findCrystalByIndex(crystals, index) {
        const value = Number(index);
        if (!Array.isArray(crystals) || value < 0 || !Number.isFinite(value)) return null;
        return crystals[value] || null;
    }

    function getCrystalBounds(crystal) {
        const width = Math.max(16, Number(crystal && crystal.width) || 28);
        const height = Math.max(18, Number(crystal && crystal.height) || 34);
        const x = (Number(crystal && crystal.x) || 0) - width * 0.5;
        const y = (Number(crystal && crystal.y) || 0) - height * 0.5;
        return { x, y, width, height };
    }

    function rectsIntersect(a, b) {
        return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
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
                playerX: readPlayerSnapshot() ? Number(readPlayerSnapshot().x) || 0 : null,
                playerY: readPlayerSnapshot() ? Number(readPlayerSnapshot().y) || 0 : null
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
        damageCrystalAtRect(x, y, width, height) {
            const hitRect = {
                x: Number(x) || 0,
                y: Number(y) || 0,
                width: Math.max(0, Number(width) || 0),
                height: Math.max(0, Number(height) || 0)
            };
            if (hitRect.width <= 0 || hitRect.height <= 0) return -1;
            const hitIndex = this.crystals.findIndex((entry) => entry && entry.alive && rectsIntersect(hitRect, getCrystalBounds(entry)));
            if (hitIndex >= 0) {
                this.destroyCrystal(hitIndex);
            }
            return hitIndex;
        },
        spawnBreathHazard(playerContext = null) {
            const playerX = playerContext ? clampNumber(playerContext.x, 120, 1160) : null;
            const playerY = playerContext ? clampNumber(playerContext.y, 220, 470) : null;
            const originX = playerX != null ? playerX + (this.hazards.length % 2 === 0 ? -24 : 24) : (this.dragon ? this.dragon.x : 420);
            const originY = playerY != null ? playerY + 24 : (this.dragon ? this.dragon.y + 60 : 220);
            this.hazards.push({
                id: `hazard-${this.updateCount}-${this.hazards.length}`,
                ttl: 24,
                phase: this.phase,
                x: originX,
                y: originY,
                radius: this.phase === 3 ? 56 : 42
            });
        },
        updateCrystals() {
            const aliveCrystals = this.crystals.filter((entry) => entry && entry.alive);
            let nearestBeamCrystalId = null;
            if (this.phase === 1 && aliveCrystals.length > 0 && this.dragon && this.dragon.alive) {
                let nearestDistance = Number.POSITIVE_INFINITY;
                for (const entry of aliveCrystals) {
                    const dx = (Number(entry.x) || 0) - (Number(this.dragon.x) || 0);
                    const dy = (Number(entry.y) || 0) - (Number(this.dragon.y) || 0);
                    const distance = Math.hypot(dx, dy);
                    if (distance < nearestDistance) {
                        nearestDistance = distance;
                        nearestBeamCrystalId = entry.id;
                    }
                }
            }
            this.crystals.forEach((entry) => {
                if (!entry) return;
                entry.beamActive = Boolean(entry.alive && nearestBeamCrystalId != null && entry.id === nearestBeamCrystalId);
            });
            if (this.phase === 1 && aliveCrystals.length > 0 && this.dragon && this.dragon.alive && this.updateCount % 5 === 0) {
                this.dragon.heal(4);
            }
        },
        updateHazards(playerContext = null) {
            if (this.phase >= 2 && this.updateCount % 6 === 0) {
                this.spawnBreathHazard(playerContext);
            }
            this.hazards = this.hazards
                .map((entry) => Object.assign({}, entry, { ttl: (Number(entry.ttl) || 0) - 1 }))
                .filter((entry) => entry.ttl > 0);
        },
        spawnFireball(playerContext = null) {
            if (!this.dragon || !playerContext || typeof DragonFireball === "undefined" || typeof projectiles === "undefined" || !Array.isArray(projectiles)) return false;
            if ((Number(this.dragon.fireballCooldown) || 0) > 0) return false;
            const targetX = clampNumber(playerContext.x + (Number(playerContext.velX) || 0) * 10, 80, 1220);
            const targetY = clampNumber(playerContext.y + Math.max(0, (Number(playerContext.velY) || 0) * 3), 120, 520);
            const fireball = new DragonFireball(this.dragon.x + 72, this.dragon.y - 12, targetX, targetY);
            fireball.arenaDragonFireball = true;
            fireball.source = "end_dragon_arena";
            projectiles.push(fireball);
            this.dragon.fireballCooldown = 20;
            return true;
        },
        applyPlayerPressure(playerContext = null) {
            if (!this.dragon || !playerContext || typeof damagePlayer !== "function") return;
            const playerWidth = Math.max(18, Number(playerContext.width) || 18);
            const playerHeight = Math.max(30, Number(playerContext.height) || 30);
            const dragonHitboxX = this.dragon.x - this.dragon.width * 0.5;
            const dragonHitboxY = this.dragon.y - this.dragon.height * 0.5;
            if (typeof rectIntersect === "function" && rectIntersect(playerContext.x, playerContext.y, playerWidth, playerHeight, dragonHitboxX, dragonHitboxY, this.dragon.width, this.dragon.height)) {
                damagePlayer(this.dragon.contactDamage, this.dragon.x, 120);
            }

            const playerCenterX = playerContext.x + playerWidth * 0.5;
            const playerCenterY = playerContext.y + playerHeight * 0.5;
            for (const hazard of this.hazards) {
                const radius = Number(hazard && hazard.radius) || 0;
                const dx = playerCenterX - (Number(hazard && hazard.x) || 0);
                const dy = playerCenterY - (Number(hazard && hazard.y) || 0);
                const safeRadius = radius + Math.max(playerWidth, playerHeight) * 0.35;
                if (Math.hypot(dx, dy) <= safeRadius) {
                    damagePlayer(1, hazard.x, 50);
                    break;
                }
            }

            if (this.phase >= 2 && this.dragon.intentKey === "fireball_breath") {
                this.spawnFireball(playerContext);
            }
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
            if (context && typeof globalThis.eval === "function") {
                try {
                    globalThis.eval(`(() => {
                        if (typeof player === "undefined" || !player) return;
                        if (${Number.isFinite(context.playerX)}) player.x = ${Number.isFinite(context.playerX) ? Number(context.playerX) : 0};
                        if (${Number.isFinite(context.playerY)}) player.y = ${Number.isFinite(context.playerY) ? Number(context.playerY) : 0};
                    })()`);
                } catch (error) {}
            } else if (context && globalThis.player) {
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
            const playerContext = readPlayerSnapshot();
            this.dragon.update(playerContext);
            this.phase = this.dragon.phase;
            this.updateCrystals();
            this.updateHazards(playerContext);
            this.applyPlayerPressure(playerContext);
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
                ctx.fillRect(
                    crystal.x - 10,
                    crystal.y + 10,
                    20,
                    Math.max(26, DRAGON_CRYSTAL_PILLAR_BASE_Y - crystal.y)
                );
                if (crystal.beamActive && this.dragon) {
                    ctx.strokeStyle = "rgba(223, 152, 255, 0.92)";
                    ctx.lineWidth = 5;
                    ctx.shadowColor = "rgba(178, 94, 255, 0.55)";
                    ctx.shadowBlur = 8;
                    if (typeof ctx.setLineDash === "function") {
                        ctx.setLineDash([14, 8]);
                    }
                    ctx.beginPath();
                    ctx.moveTo(crystal.x, crystal.y + 6);
                    ctx.lineTo(this.dragon.x, this.dragon.y + 6);
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                    if (typeof ctx.setLineDash === "function") {
                        ctx.setLineDash([]);
                    }
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
                const wingLift = Math.sin((dragon.updateCount || 0) / 6) * 8;
                const outlineColor = dragon.alive ? "#04050a" : "#1c1724";
                const bodyColor = damageFlashAlpha > 0 ? `rgba(255, 180, 214, ${0.38 + damageFlashAlpha * 0.45})` : (dragon.alive ? "#101116" : "#2d2634");
                const bodyShadeColor = damageFlashAlpha > 0 ? `rgba(255, 220, 236, ${0.24 + damageFlashAlpha * 0.3})` : (dragon.alive ? "#1a1c24" : "#41354a");
                const wingMembraneColor = dragon.alive ? "#090a10" : "#221c2d";
                const boneColor = damageFlashAlpha > 0 ? "#ffe4ef" : "#b7b9c2";
                const eyeColor = damageFlashAlpha > 0 ? "#fff0f7" : "#d94cff";
                const spineColor = damageFlashAlpha > 0 ? "#fff2f8" : "#6f7078";
                const fillOutlinedRect = (x, y, width, height, fillColor) => {
                    ctx.fillStyle = outlineColor;
                    ctx.fillRect(x - 2, y - 2, width + 4, height + 4);
                    ctx.fillStyle = fillColor;
                    ctx.fillRect(x, y, width, height);
                };
                const fillWing = (points) => {
                    ctx.fillStyle = outlineColor;
                    ctx.beginPath();
                    ctx.moveTo(points[0][0], points[0][1]);
                    for (let index = 1; index < points.length; index += 1) {
                        ctx.lineTo(points[index][0], points[index][1]);
                    }
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = wingMembraneColor;
                    ctx.beginPath();
                    ctx.moveTo(points[0][0], points[0][1]);
                    for (let index = 1; index < points.length; index += 1) {
                        ctx.lineTo(points[index][0], points[index][1]);
                    }
                    ctx.closePath();
                    ctx.fill();
                };

                ctx.save();
                ctx.translate(dragon.x, dragon.y);

                ctx.fillStyle = dragon.alive ? "rgba(4, 3, 10, 0.42)" : "rgba(16, 12, 20, 0.3)";
                ctx.beginPath();
                ctx.ellipse(10, 52, 118, 18, 0, 0, Math.PI * 2);
                ctx.fill();

                fillWing([
                    [-22, -6],
                    [-122, -82 - wingLift],
                    [-168, -58 - wingLift],
                    [-142, 14],
                    [-60, 22],
                    [-26, 8]
                ]);
                fillWing([
                    [8, -10],
                    [112, -86 + wingLift],
                    [166, -56 + wingLift],
                    [142, 18],
                    [70, 26],
                    [18, 10]
                ]);

                ctx.strokeStyle = boneColor;
                ctx.lineWidth = 6;
                ctx.lineCap = "square";
                ctx.beginPath();
                ctx.moveTo(-18, -4);
                ctx.lineTo(-112, -80 - wingLift);
                ctx.moveTo(-18, -4);
                ctx.lineTo(-150, -52 - wingLift);
                ctx.moveTo(-18, -4);
                ctx.lineTo(-124, 10);
                ctx.moveTo(10, -6);
                ctx.lineTo(106, -82 + wingLift);
                ctx.moveTo(10, -6);
                ctx.lineTo(148, -50 + wingLift);
                ctx.moveTo(10, -6);
                ctx.lineTo(132, 12);
                ctx.stroke();

                fillOutlinedRect(-38, -20, 82, 30, bodyColor);
                fillOutlinedRect(-70, -14, 36, 14, bodyShadeColor);
                fillOutlinedRect(-108, -22, 40, 18, bodyColor);
                fillOutlinedRect(-116, -12, 28, 10, bodyShadeColor);
                fillOutlinedRect(-10, 12, 10, 26, bodyShadeColor);
                fillOutlinedRect(18, 10, 10, 24, bodyShadeColor);

                for (let segment = 0; segment < 7; segment += 1) {
                    const segmentX = 42 + segment * 18;
                    const segmentY = -18 - segment * 6;
                    fillOutlinedRect(segmentX, segmentY, 18, 10, bodyColor);
                    ctx.fillStyle = spineColor;
                    ctx.fillRect(segmentX + 3, segmentY - 8, 10, 6);
                }

                for (let spine = 0; spine < 5; spine += 1) {
                    ctx.fillStyle = spineColor;
                    ctx.fillRect(-22 + spine * 15, -30, 10, 7);
                }

                ctx.fillStyle = bodyShadeColor;
                ctx.fillRect(-18, -12, 30, 10);
                ctx.fillRect(-92, -16, 10, 6);
                ctx.fillRect(-100, -28, 8, 8);
                ctx.fillRect(-80, -30, 8, 8);
                ctx.fillStyle = boneColor;
                ctx.fillRect(-103, -30, 5, 10);
                ctx.fillRect(-83, -32, 5, 10);
                ctx.fillStyle = eyeColor;
                ctx.fillRect(-98, -17, 5, 4);
                ctx.fillRect(-88, -17, 5, 4);

                if (damageFlashAlpha > 0) {
                    ctx.strokeStyle = `rgba(255, 224, 238, ${damageFlashAlpha})`;
                    ctx.lineWidth = 5;
                    ctx.strokeRect(-116, -32, 300, 74);
                }
                ctx.restore();
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
