/**
 * 07-viewport.js - 视口缩放与配置应用
 * 从 main.js 拆分 (原始行 1245-1620)
 */
function nowMs() {
    return (typeof performance !== "undefined" && performance && typeof performance.now === "function")
        ? performance.now()
        : Date.now();
}

function getViewportSize() {
    // Prefer visual viewport for more accurate sizing on mobile (URL bar / keyboard / zoom),
    // but fall back to layout viewport when the values look suspiciously small.
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    const doc = document.documentElement;
    const innerW = window.innerWidth || doc.clientWidth || 0;
    const innerH = window.innerHeight || doc.clientHeight || 0;
    let w = (vv && typeof vv.width === "number") ? vv.width : 0;
    let h = (vv && typeof vv.height === "number") ? vv.height : 0;

    const fallbackW = innerW || doc.clientWidth || 0;
    const fallbackH = innerH || doc.clientHeight || 0;
    const minOkW = fallbackW ? Math.max(120, fallbackW * 0.6) : 120;
    const minOkH = fallbackH ? Math.max(120, fallbackH * 0.6) : 120;

    if (!(w >= minOkW && h >= minOkH)) {
        w = fallbackW;
        h = fallbackH;
    }

    if (!(w > 0)) w = fallbackW || 1;
    if (!(h > 0)) h = fallbackH || 1;
    return { width: Math.max(1, w), height: Math.max(1, h) };
}

function getSafeInsetsPx() {
    const cs = getComputedStyle(document.documentElement);
    const toPx = (v) => {
        const n = Number(String(v || "").trim().replace("px", ""));
        return Number.isFinite(n) ? n : 0;
    };
    return {
        top: toPx(cs.getPropertyValue("--safe-top")),
        right: toPx(cs.getPropertyValue("--safe-right")),
        bottom: toPx(cs.getPropertyValue("--safe-bottom")),
        left: toPx(cs.getPropertyValue("--safe-left"))
    };
}

function getGameAreaSize() {
    const vv = getViewportSize();
    const insets = getSafeInsetsPx();
    // Body already applies safe-area padding, so the usable game area is the visible viewport minus insets.
    const w = Math.max(1, Math.floor(vv.width - insets.left - insets.right));
    const h = Math.max(1, Math.floor(vv.height - insets.top - insets.bottom));
    return { width: w, height: h };
}

function computeWorldScale(viewport) {
    if (!baseCanvasSize) {
        baseCanvasSize = { width: gameConfig.canvas.width, height: gameConfig.canvas.height };
    }
    const vw = Math.max(1, Number(viewport?.width) || 0);
    const vh = Math.max(1, Number(viewport?.height) || 0);
    const scaleX = vw / baseCanvasSize.width;
    const scaleY = vh / baseCanvasSize.height;
    const unit = Math.min(scaleX, scaleY);
    worldScale = { x: scaleX, y: scaleY, unit };
    return worldScale;
}

function scaleGameConfig(viewport) {
    if (!baseGameConfig) {
        baseGameConfig = JSON.parse(JSON.stringify(gameConfig));
        baseCanvasSize = { width: baseGameConfig.canvas.width, height: baseGameConfig.canvas.height };
    }
    const vp = viewport || getViewportSize();
    const scale = computeWorldScale(vp);
    const cfg = JSON.parse(JSON.stringify(baseGameConfig));

    cfg.canvas.width = Math.max(1, Math.floor(vp.width));
    cfg.canvas.height = Math.max(1, Math.floor(vp.height));

    if (cfg.physics) {
        cfg.physics.gravity = (baseGameConfig.physics?.gravity || 0) * scale.unit;
        cfg.physics.jumpStrength = (baseGameConfig.physics?.jumpStrength || 0) * scale.unit;
        cfg.physics.movementSpeed = (baseGameConfig.physics?.movementSpeed || 0) * scale.unit;
        const baseInventoryHeight = Number(baseCanvasSize?.height) - Number(baseGameConfig.physics?.groundY ?? 530);
        const inventoryBase = Number.isFinite(baseInventoryHeight) ? baseInventoryHeight : 70;
        const baseScale = Number(settings?.uiScale) || 1.0;
        const uiScale = Math.max(0.6, Math.min(2.2, scale.unit * baseScale));
        const inventoryHeight = inventoryBase * uiScale;
        cfg.physics.groundY = cfg.canvas.height - inventoryHeight;
    }

    if (cfg.world) {
        cfg.world.blockSize = (baseGameConfig.world?.blockSize || 0) * scale.unit;
        cfg.world.cameraOffsetX = (baseGameConfig.world?.cameraOffsetX || 0) * scale.x;
        cfg.world.mapBuffer = (baseGameConfig.world?.mapBuffer || 0) * scale.x;
        cfg.world.removeThreshold = (baseGameConfig.world?.removeThreshold || 0) * scale.x;
        cfg.world.fallResetY = (baseGameConfig.world?.fallResetY || 0) * scale.y;
    }

    if (cfg.player) {
        cfg.player.width = (baseGameConfig.player?.width || 0) * scale.unit;
        cfg.player.height = (baseGameConfig.player?.height || 0) * scale.unit;
    }

    if (cfg.spawn && baseGameConfig.spawn) {
        if (typeof baseGameConfig.spawn.wordItemMinGap === "number") {
            cfg.spawn.wordItemMinGap = baseGameConfig.spawn.wordItemMinGap * scale.x;
        }
    }

    if (cfg.platforms && baseGameConfig.platforms) {
        if (typeof baseGameConfig.platforms.cloudHeightMin === "number") {
            cfg.platforms.cloudHeightMin = baseGameConfig.platforms.cloudHeightMin * scale.y;
        }
        if (typeof baseGameConfig.platforms.cloudHeightMax === "number") {
            cfg.platforms.cloudHeightMax = baseGameConfig.platforms.cloudHeightMax * scale.y;
        }
        if (typeof baseGameConfig.platforms.movingPlatformSpeedMin === "number") {
            cfg.platforms.movingPlatformSpeedMin = baseGameConfig.platforms.movingPlatformSpeedMin * scale.unit;
        }
        if (typeof baseGameConfig.platforms.movingPlatformSpeedMax === "number") {
            cfg.platforms.movingPlatformSpeedMax = baseGameConfig.platforms.movingPlatformSpeedMax * scale.unit;
        }
    }

    if (cfg.golems && baseGameConfig.golems) {
        if (baseGameConfig.golems.ironGolem) {
            cfg.golems.ironGolem.speed = baseGameConfig.golems.ironGolem.speed * scale.unit;
        }
        if (baseGameConfig.golems.snowGolem) {
            cfg.golems.snowGolem.speed = baseGameConfig.golems.snowGolem.speed * scale.unit;
        }
    }

    return cfg;
}

function scaleEnemyStats() {
    if (!baseEnemyStats) baseEnemyStats = JSON.parse(JSON.stringify(ENEMY_STATS));
    Object.keys(baseEnemyStats).forEach(key => {
        const base = baseEnemyStats[key];
        const target = ENEMY_STATS[key];
        if (!target) return;
        if (base.size) {
            target.size = {
                w: base.size.w * worldScale.unit,
                h: base.size.h * worldScale.unit
            };
        }
        if (typeof base.speed === "number") {
            target.speed = base.speed * worldScale.unit;
        }
    });
}

function scaleWeapons() {
    if (!baseWeapons) baseWeapons = JSON.parse(JSON.stringify(WEAPONS));
    Object.keys(baseWeapons).forEach(key => {
        const base = baseWeapons[key];
        const target = WEAPONS[key];
        if (!target) return;
        if (typeof base.range === "number") target.range = base.range * worldScale.x;
        if (typeof base.knockback === "number") target.knockback = base.knockback * worldScale.unit;
    });
}

function scaleBiomeConfigs() {
    if (!biomeConfigs || typeof biomeConfigs !== "object") return;
    if (!baseBiomeConfigs) baseBiomeConfigs = JSON.parse(JSON.stringify(biomeConfigs));
    Object.keys(biomeConfigs).forEach(key => {
        const base = baseBiomeConfigs[key];
        const target = biomeConfigs[key];
        if (!base || !target) return;
        if (base.effects && typeof base.effects.waterLevel === "number") {
            if (!target.effects) target.effects = {};
            target.effects.waterLevel = base.effects.waterLevel * worldScale.y;
        }
    });
}

function scaleCloudPlatformConfig() {
    // Cloud platforms are an optional feature. Some builds/scripts may not include the
    // config (and related entities). Guard to avoid crashing the whole game.
    if (typeof CLOUD_PLATFORM_CONFIG === "undefined") return;
    if (!baseCloudPlatformConfig) baseCloudPlatformConfig = JSON.parse(JSON.stringify(CLOUD_PLATFORM_CONFIG));
    Object.keys(CLOUD_PLATFORM_CONFIG).forEach(key => {
        const base = baseCloudPlatformConfig[key];
        const target = CLOUD_PLATFORM_CONFIG[key];
        if (!base || !target) return;
        if (typeof base.bounceForce === "number") target.bounceForce = base.bounceForce * worldScale.unit;
        if (typeof base.moveSpeed === "number") target.moveSpeed = base.moveSpeed * worldScale.unit;
        if (typeof base.moveRange === "number") target.moveRange = base.moveRange * worldScale.unit;
    });
}

function applyConfig(viewport = null) {
    const vp = viewport || getGameAreaSize();
    const oldScale = worldScale ? { ...worldScale } : null;
    const oldGroundY = groundY;

    gameConfig = scaleGameConfig(vp);
    canvas.width = gameConfig.canvas.width;
    canvas.height = gameConfig.canvas.height;
    canvasHeight = gameConfig.canvas.height;
    groundY = gameConfig.physics.groundY;
    blockSize = gameConfig.world.blockSize;
    cameraOffsetX = gameConfig.world.cameraOffsetX;
    mapBuffer = gameConfig.world.mapBuffer;
    removeThreshold = gameConfig.world.removeThreshold;
    fallResetY = gameConfig.world.fallResetY;
    scaleCloudPlatformConfig();
    scaleEnemyStats();
    scaleWeapons();
    scaleBiomeConfigs();
    applySpeedSetting();

    // 如果缩放比例变化，重映射世界坐标
    if (oldScale && startedOnce) {
        remapWorldCoordinates(oldScale, oldGroundY);
    }
}

// 视口变化后重映射所有世界实体坐标
function remapWorldCoordinates(oldScale, oldGroundY) {
    if (!oldScale || !worldScale) return;

    const scaleRatioX = worldScale.x / oldScale.x;
    const scaleRatioUnit = worldScale.unit / oldScale.unit;

    // 重映射玩家位置
    if (player) {
        player.x *= scaleRatioX;
        // 玩家 y 坐标相对于地面重映射
        const oldDistFromGround = oldGroundY - player.y;
        player.y = groundY - oldDistFromGround * scaleRatioUnit;
        player.width = gameConfig.player.width;
        player.height = gameConfig.player.height;
        // 速度会由 applyMotionToPlayer 重新计算，不需要手动缩放
        applyMotionToPlayer(player);
    }

    // 重映射平台位置
    platforms.forEach(p => {
        p.x *= scaleRatioX;
        // 地面平台锚定到新的 groundY
        if (Math.abs(p.y - oldGroundY) < 5) {
            p.y = groundY;
        } else {
            const oldDistFromGround = oldGroundY - p.y;
            p.y = groundY - oldDistFromGround * scaleRatioUnit;
        }
        p.width *= scaleRatioX;
        p.height = blockSize;
    });

    // 重映射树木位置
    trees.forEach(t => {
        t.x *= scaleRatioX;
        const oldDistFromGround = oldGroundY - (t.y + t.height);
        t.y = groundY - t.height - oldDistFromGround * scaleRatioUnit;
        t.width *= scaleRatioUnit;
        t.height *= scaleRatioUnit;
    });

    // 重映射宝箱位置
    chests.forEach(c => {
        c.x *= scaleRatioX;
        const oldDistFromGround = oldGroundY - c.y;
        c.y = groundY - oldDistFromGround * scaleRatioUnit;
    });

    // 重映射物品位置
    items.forEach(i => {
        i.x *= scaleRatioX;
        const oldDistFromGround = oldGroundY - i.y;
        i.y = groundY - oldDistFromGround * scaleRatioUnit;
    });

    // 重映射敌人位置
    enemies.forEach(e => {
        e.x *= scaleRatioX;
        const oldDistFromGround = oldGroundY - e.y;
        e.y = groundY - oldDistFromGround * scaleRatioUnit;
        e.width *= scaleRatioUnit;
        e.height *= scaleRatioUnit;
    });

    // 重映射傀儡位置
    golems.forEach(g => {
        g.x *= scaleRatioX;
        const oldDistFromGround = oldGroundY - g.y;
        g.y = groundY - oldDistFromGround * scaleRatioUnit;
    });

    // 重映射装饰物位置
    decorations.forEach(d => {
        d.x *= scaleRatioX;
        const oldDistFromGround = oldGroundY - d.y;
        d.y = groundY - oldDistFromGround * scaleRatioUnit;
    });

    // 重映射相机位置
    cameraX *= scaleRatioX;
    lastGenX *= scaleRatioX;
}

function transformWorldEntityForViewport(entity, scaleX, scaleY, scaleUnit) {
    if (!entity || typeof entity !== "object") return;

    const posXKeys = ["x", "originX", "baseX", "minX", "maxX", "leftBound", "rightBound", "startX", "endX", "targetX", "lastX"];
    const posYKeys = ["y", "originY", "baseY", "minY", "maxY", "topBound", "bottomBound", "startY", "endY", "targetY", "lastY"];
    const sizeXKeys = ["width", "w", "radiusX"];
    const sizeYKeys = ["height", "h", "radiusY"];
    const speedXKeys = ["velX", "speedX", "dx"];
    const speedYKeys = ["velY", "speedY", "dy"];
    const unitKeys = ["radius", "size", "range", "attackRange", "detectRange", "jumpStrength", "speed", "moveSpeed", "knockback"];

    posXKeys.forEach(key => {
        if (typeof entity[key] === "number" && isFinite(entity[key])) entity[key] *= scaleX;
    });
    posYKeys.forEach(key => {
        if (typeof entity[key] === "number" && isFinite(entity[key])) entity[key] *= scaleY;
    });
    sizeXKeys.forEach(key => {
        if (typeof entity[key] === "number" && isFinite(entity[key])) entity[key] *= scaleX;
    });
    sizeYKeys.forEach(key => {
        if (typeof entity[key] === "number" && isFinite(entity[key])) entity[key] *= scaleY;
    });
    speedXKeys.forEach(key => {
        if (typeof entity[key] === "number" && isFinite(entity[key])) entity[key] *= scaleX;
    });
    speedYKeys.forEach(key => {
        if (typeof entity[key] === "number" && isFinite(entity[key])) entity[key] *= scaleY;
    });
    unitKeys.forEach(key => {
        if (typeof entity[key] === "number" && isFinite(entity[key])) entity[key] *= scaleUnit;
    });
}

function realignWorldForViewport(previousLayout) {
    if (!previousLayout || !startedOnce) return;

    const oldWidth = Math.max(1, Number(previousLayout.canvasWidth) || 1);
    const oldHeight = Math.max(1, Number(previousLayout.canvasHeight) || 1);
    const newWidth = Math.max(1, Number(canvas.width) || 1);
    const newHeight = Math.max(1, Number(canvas.height) || 1);

    const scaleX = newWidth / oldWidth;
    const scaleY = newHeight / oldHeight;
    const scaleUnit = Math.min(scaleX, scaleY);

    if (!isFinite(scaleX) || !isFinite(scaleY) || !isFinite(scaleUnit)) return;

    const collections = [platforms, trees, chests, items, enemies, golems, projectiles, decorations, particles, floatingTexts, wordGates];
    collections.forEach(list => {
        if (!Array.isArray(list)) return;
        list.forEach(entry => transformWorldEntityForViewport(entry, scaleX, scaleY, scaleUnit));
    });

    if (player) {
        transformWorldEntityForViewport(player, scaleX, scaleY, scaleUnit);
        applyMotionToPlayer(player);
        if (typeof player.height === "number" && isFinite(player.height)) {
            player.y = Math.min(player.y, groundY - player.height);
        }
    }

    if (Array.isArray(playerPositionHistory) && playerPositionHistory.length) {
        playerPositionHistory = playerPositionHistory.map(point => {
            if (!point || typeof point !== "object") return point;
            return {
                ...point,
                x: typeof point.x === "number" ? point.x * scaleX : point.x,
                y: typeof point.y === "number" ? point.y * scaleY : point.y
            };
        });
    }

    if (typeof cameraX === "number" && isFinite(cameraX)) cameraX *= scaleX;
    if (typeof lastGenX === "number" && isFinite(lastGenX)) lastGenX *= scaleX;
    if (typeof lastWordItemX === "number" && isFinite(lastWordItemX)) lastWordItemX *= scaleX;
}

function applySpeedSetting() {
    if (!gameConfig?.physics || !baseGameConfig?.physics) return;
    const level = String(settings.movementSpeedLevel || "normal").toLowerCase();
    const multiplier = SPEED_LEVELS[level] ?? SPEED_LEVELS.normal;
    const unit = worldScale?.unit || 1;
    const baseSpeed = (baseGameConfig.physics?.movementSpeed || 1.2) * unit;
    gameConfig.physics.movementSpeed = baseSpeed * multiplier;
    if (player) {
        applyMotionToPlayer(player);
    }
    saveSettings();
}
