/**
 * 18-interaction-chains.js - 群系交互链系统
 * 森林庇护所、沙漠绿洲骆驼、雪地冰镐、蘑菇岛弹跳、樱花花瓣兔子
 * 版本: v1.6.7
 */

// ============ 交互链配置数据 ============
const INTERACTION_CHAINS = {
    // 森林: 砍树(3次攻击) → 木材 ×5 → 庇护所(60秒, 敌人不生成+回血加速)
    forest_shelter: {
        craftCost: { wood: 5 },
        buildTime: 2000,
        duration: 60000,
        cooldown: 120000,
        effects: {
            noEnemySpawn: true,
            healBoost: 1.5,
            radius: 100
        },
        visual: {
            width: 80,
            height: 60,
            color: '#8B4513',
            smokeParticles: true
        }
    },
    // 沙漠: 绿洲(5%) → 回血(3秒2心) → 骆驼(10秒, 速度1.2x+免疫仙人掌+跳跃+20%)
    desert_camel: {
        oasis: {
            spawnChance: 0.05,
            healAmount: 2,
            healTime: 3000,
            oneTimeUse: true
        },
        ride: {
            duration: 10000,
            cooldown: 30000,
            effects: {
                speedMultiplier: 1.2,
                cactusImmune: true,
                jumpBoost: 1.2
            }
        }
    },
    // 雪地: 砍冰雕(5次,8%) → 冰镐(30秒,1次破坏冰锥/冰块) → 冰冻核心×10 → 冰霜护甲(60秒,冻结攻击者2秒)
    snow_ice_system: {
        iceSculpture: {
            spawnChance: 0.08,
            durability: 5,
            dropItem: 'ice_pickaxe'
        },
        icePickaxe: {
            duration: 30000,
            breakSpeed: 1,
            dropCore: true
        },
        frostArmor: {
            craftCost: { ice_core: 10 },
            duration: 60000,
            cooldown: 90000,
            effect: {
                freezeAttacker: true,
                freezeDuration: 2000
            }
        }
    },
    // 蘑菇岛: 巨型蘑菇弹跳(1.5x高度) → 连续弹跳累计层数 → 3层后跳跃翻倍+空中二段跳
    mushroom_bounce: {
        bounceMultiplier: 1.5,
        maxCombo: 3,
        comboEffects: {
            level3: {
                jumpMultiplier: 2.0,
                doubleJump: true,
                visualEffect: 'golden_aura'
            }
        },
        resetOnGround: true
    },
    // 樱花: 花瓣收集(花朵30%掉落) ×10 → 喂养兔子 → 无敌buff(3秒)
    cherry_petal: {
        petalDrop: {
            source: 'flower',
            dropChance: 0.3
        },
        rabbitFeed: {
            cost: { cherry_petal: 10 },
            cooldown: 60000
        },
        invincibilityBuff: {
            duration: 3000,
            visualEffect: 'golden_aura_blink',
            soundEffect: 'bell_chime'
        }
    }
};

// ============ 森林庇护所系统 ============
let forestShelter = {
    active: false,
    x: 0,
    y: 0,
    timer: 0,
    cooldownTimer: 0
};

function canBuildForestShelter() {
    return (inventory.wood || 0) >= INTERACTION_CHAINS.forest_shelter.craftCost.wood &&
           forestShelter.cooldownTimer <= 0;
}

function buildForestShelter() {
    if (!canBuildForestShelter()) return false;

    const cost = INTERACTION_CHAINS.forest_shelter.craftCost;
    inventory.wood -= cost.wood;
    updateInventoryUI();

    forestShelter.active = true;
    forestShelter.x = player.x;
    forestShelter.y = groundY - INTERACTION_CHAINS.forest_shelter.visual.height;
    forestShelter.timer = INTERACTION_CHAINS.forest_shelter.duration;
    forestShelter.cooldownTimer = INTERACTION_CHAINS.forest_shelter.cooldown;

    showFloatingText('🏠 庇护所已建立!', player.x, player.y - 40, '#8B4513');
    return true;
}

function updateForestShelter() {
    if (forestShelter.active) {
        forestShelter.timer -= 16.67; // 约60fps的delta
        if (forestShelter.timer <= 0) {
            forestShelter.active = false;
            showToast('🏠 庇护所效果结束');
        }
    }
    if (forestShelter.cooldownTimer > 0) {
        forestShelter.cooldownTimer -= 16.67;
    }
}

function getForestShelterEffect() {
    if (!forestShelter.active) return null;
    const config = INTERACTION_CHAINS.forest_shelter;
    const dx = player.x - forestShelter.x;
    const dy = player.y - forestShelter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= config.effects.radius) {
        return {
            noEnemySpawn: config.effects.noEnemySpawn,
            healBoost: config.effects.healBoost
        };
    }
    return null;
}

// ============ 沙漠绿洲骆驼系统 ============
let desertOases = [];
let desertCamels = [];
let camelRideState = {
    active: false,
    timer: 0,
    cooldownTimer: 0
};

function spawnDesertOasis(x, y) {
    desertOases.push({
        x: x,
        y: y,
        width: 120,
        height: 60,
        healTimer: 0,
        used: false
    });
}

function spawnDesertCamel(x, y, nearOasis) {
    desertCamels.push({
        x: x,
        y: y,
        width: 30,
        height: 25,
        nearOasis: nearOasis,
        interacted: false
    });
}

function updateDesertSystems() {
    // 绿洲回血
    desertOases.forEach(oasis => {
        if (oasis.used) return;

        const dx = player.x - oasis.x;
        const dy = player.y - oasis.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 80) {
            oasis.healTimer += 16.67;
            if (oasis.healTimer >= INTERACTION_CHAINS.desert_camel.oasis.healTime) {
                playerHp = Math.min(playerHp + INTERACTION_CHAINS.desert_camel.oasis.healAmount, playerMaxHp);
                updateHpUI();
                showFloatingText('+2 ❤️', player.x, player.y - 30, '#2196F3');
                oasis.used = true;
            }
        } else {
            oasis.healTimer = 0;
        }
    });

    // 骆驼骑行
    desertCamels.forEach(camel => {
        if (camel.interacted) return;

        const dx = player.x - camel.x;
        const dy = player.y - camel.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 40 && camelRideState.cooldownTimer <= 0) {
            camel.interacted = true;
            camelRideState.active = true;
            camelRideState.timer = INTERACTION_CHAINS.desert_camel.ride.duration;
            camelRideState.cooldownTimer = INTERACTION_CHAINS.desert_camel.ride.cooldown;
            showFloatingText('🐫 骆驼骑行!', player.x, player.y - 30, '#FDD835');
        }
    });

    // 骆驼骑行效果
    if (camelRideState.active) {
        camelRideState.timer -= 16.67;
        if (camelRideState.timer <= 0) {
            camelRideState.active = false;
            showToast('🐫 骆驼骑行结束');
        }
    }
    if (camelRideState.cooldownTimer > 0) {
        camelRideState.cooldownTimer -= 16.67;
    }

    // 离开沙漠时清理
    if (currentBiome !== 'desert') {
        desertOases = [];
        desertCamels = [];
    }
}

function getCamelRideEffect() {
    if (!camelRideState.active) return null;
    return INTERACTION_CHAINS.desert_camel.ride.effects;
}

// ============ 雪地冰镐系统 ============
let iceSculptures = [];
let icePickaxeActive = {
    active: false,
    timer: 0
};
let iceCoresCollected = 0;
let frostArmorActive = {
    active: false,
    timer: 0,
    cooldownTimer: 0
};

function spawnIceSculpture(x, y) {
    iceSculptures.push({
        x: x,
        y: y,
        width: 20,
        height: 30,
        hp: INTERACTION_CHAINS.snow_ice_system.iceSculpture.durability,
        maxHp: INTERACTION_CHAINS.snow_ice_system.iceSculpture.durability
    });
}

function hitIceSculpture(sculpture) {
    sculpture.hp--;
    showFloatingText(`❄️ ${sculpture.hp}`, sculpture.x, sculpture.y - 20, '#87CEEB');

    if (sculpture.hp <= 0) {
        // 激活冰镐
        icePickaxeActive.active = true;
        icePickaxeActive.timer = INTERACTION_CHAINS.snow_ice_system.icePickaxe.duration;
        showFloatingText('⛏️ 冰镐激活!', sculpture.x, sculpture.y - 40, '#87CEEB');
        iceSculptures = iceSculptures.filter(s => s !== sculpture);
        return true;
    }
    return false;
}

function breakIceBlock(iceBlock) {
    if (!icePickaxeActive.active) return false;

    // 普通冰块需要3次攻击，有冰镐只需1次
    iceBlock.hp = 0;

    // 掉落冰冻核心
    iceCoresCollected++;
    showFloatingText('💎 冰冻核心 +1', iceBlock.x, iceBlock.y - 10, '#00CED1');
    return true;
}

function craftFrostArmor() {
    const cost = INTERACTION_CHAINS.snow_ice_system.frostArmor.craftCost;
    if (iceCoresCollected < cost.ice_core || frostArmorActive.cooldownTimer > 0) {
        return false;
    }

    iceCoresCollected -= cost.ice_core;
    frostArmorActive.active = true;
    frostArmorActive.timer = INTERACTION_CHAINS.snow_ice_system.frostArmor.duration;
    frostArmorActive.cooldownTimer = INTERACTION_CHAINS.snow_ice_system.frostArmor.cooldown;

    showFloatingText('🛡️ 冰霜护甲!', player.x, player.y - 30, '#00CED1');
    return true;
}

function updateSnowIceSystem() {
    // 冰镐计时
    if (icePickaxeActive.active) {
        icePickaxeActive.timer -= 16.67;
        if (icePickaxeActive.timer <= 0) {
            icePickaxeActive.active = false;
            showToast('⛏️ 冰镐效果结束');
        }
    }

    // 冰霜护甲计时
    if (frostArmorActive.active) {
        frostArmorActive.timer -= 16.67;
        if (frostArmorActive.timer <= 0) {
            frostArmorActive.active = false;
            showToast('🛡️ 冰霜护甲效果结束');
        }
    }
    if (frostArmorActive.cooldownTimer > 0) {
        frostArmorActive.cooldownTimer -= 16.67;
    }

    // 离开雪地时清理冰雕
    if (currentBiome !== 'snow') {
        iceSculptures = [];
    }
}

function getFrostArmorEffect() {
    if (!frostArmorActive.active) return null;
    return INTERACTION_CHAINS.snow_ice_system.frostArmor.effect;
}

// ============ 蘑菇岛弹跳连击系统 ============
let mushroomBounceState = {
    combo: 0,
    lastBounceTime: 0,
    lastBounceY: 0
};

function onMushroomBounce(mushroomY) {
    const config = INTERACTION_CHAINS.mushroom_bounce;
    const now = Date.now();

    // 检查是否连续弹跳
    const isContinuous = now - mushroomBounceState.lastBounceTime < 1000 &&
                        Math.abs(mushroomBounceState.lastBounceY - mushroomY) < 50;

    if (isContinuous) {
        mushroomBounceState.combo++;
    } else {
        mushroomBounceState.combo = 1;
    }

    mushroomBounceState.lastBounceTime = now;
    mushroomBounceState.lastBounceY = mushroomY;

    // 应用弹跳效果
    let bounceMultiplier = config.bounceMultiplier;

    if (mushroomBounceState.combo >= config.maxCombo) {
        const effects = config.comboEffects.level3;
        bounceMultiplier = effects.jumpMultiplier;
        showFloatingText(`🍄 连击 ×${mushroomBounceState.combo}!`, player.x, player.y - 40, '#BA55D3');
    } else if (mushroomBounceState.combo > 1) {
        showFloatingText(`🍄 连击 ×${mushroomBounceState.combo}`, player.x, player.y - 30, '#DDA0DD');
    }

    return {
        bounceMultiplier: bounceMultiplier,
        doubleJump: mushroomBounceState.combo >= config.maxCombo
    };
}

function resetMushroomCombo(onGround = true) {
    if (onGround && INTERACTION_CHAINS.mushroom_bounce.resetOnGround) {
        mushroomBounceState.combo = 0;
    }
}

function getMushroomBounceEffects() {
    const config = INTERACTION_CHAINS.mushroom_bounce;
    if (mushroomBounceState.combo >= config.maxCombo) {
        return config.comboEffects.level3;
    }
    return null;
}

// ============ 樱花花瓣兔子系统 ============
let cherryPetalCollected = 0;
let cherryRabbits = [];
let invincibilityBuff = {
    active: false,
    timer: 0,
    cooldownTimer: 0
};

function onFlowerCollected() {
    // 30%概率额外掉落花瓣
    if (Math.random() < INTERACTION_CHAINS.cherry_petal.petalDrop.dropChance) {
        cherryPetalCollected++;
        showFloatingText('🌸 花瓣 +1', player.x, player.y - 30, '#FFB7C5');
    }
}

function spawnCherryRabbit(x, y) {
    cherryRabbits.push({
        x: x,
        y: y,
        width: 20,
        height: 16,
        fed: false
    });
}

function feedCherryRabbit(rabbit) {
    const cost = INTERACTION_CHAINS.cherry_petal.rabbitFeed.cost;
    if (cherryPetalCollected < cost.cherry_petal || invincibilityBuff.cooldownTimer > 0) {
        return false;
    }

    cherryPetalCollected -= cost.cherry_petal;
    rabbit.fed = true;

    // 激活无敌buff
    invincibilityBuff.active = true;
    invincibilityBuff.timer = INTERACTION_CHAINS.cherry_petal.invincibilityBuff.duration;
    invincibilityBuff.cooldownTimer = INTERACTION_CHAINS.cherry_petal.rabbitFeed.cooldown;

    showFloatingText('🐰 无敌!', player.x, player.y - 30, '#FFB7C5');
    return true;
}

function updateCherryPetalSystem() {
    // 无敌buff计时
    if (invincibilityBuff.active) {
        invincibilityBuff.timer -= 16.67;
        if (invincibilityBuff.timer <= 0) {
            invincibilityBuff.active = false;
            showToast('🌸 无敌效果结束');
        }
    }
    if (invincibilityBuff.cooldownTimer > 0) {
        invincibilityBuff.cooldownTimer -= 16.67;
    }

    // 离开樱花丛时清理兔子
    if (currentBiome !== 'cherry_grove') {
        cherryRabbits = [];
    }
}

function getInvincibilityEffect() {
    if (!invincibilityBuff.active) return null;
    return {
        invincible: true,
        visualEffect: INTERACTION_CHAINS.cherry_petal.invincibilityBuff.visualEffect
    };
}

// ============ 渲染函数 ============
function renderInteractionChains(ctx, camX) {
    // 森林庇护所
    if (forestShelter.active) {
        const dx = forestShelter.x - camX;
        const config = INTERACTION_CHAINS.forest_shelter.visual;
        ctx.fillStyle = config.color;
        ctx.fillRect(dx, forestShelter.y, config.width, config.height);
        // 烟囱冒烟
        if (config.smokeParticles) {
            ctx.fillStyle = 'rgba(128,128,128,0.5)';
            ctx.beginPath();
            ctx.arc(dx + config.width / 2, forestShelter.y - 5, 5, 0, Math.PI * 2);
            ctx.fill();
        }
        // 显示剩余时间
        ctx.fillStyle = '#FFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.ceil(forestShelter.timer / 1000)}s`, dx + config.width / 2, forestShelter.y - 10);
        ctx.textAlign = 'left';
    }

    // 雪地冰雕
    iceSculptures.forEach(ice => {
        const dx = ice.x - camX;
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(dx, ice.y, ice.width, ice.height);
        // 冰裂纹
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(dx + 5, ice.y + 5);
        ctx.lineTo(dx + ice.width - 5, ice.y + ice.height - 5);
        ctx.stroke();
    });

    // 沙漠绿洲
    desertOases.forEach(oasis => {
        const dx = oasis.x - camX;
        // 棕榈树
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(dx + oasis.width / 2 - 5, oasis.y - 30, 10, 30);
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(dx + oasis.width / 2, oasis.y - 30, 15, 0, Math.PI * 2);
        ctx.fill();
        // 水池
        ctx.fillStyle = 'rgba(33, 150, 243, 0.6)';
        ctx.fillRect(dx, oasis.y, oasis.width, oasis.height);
        // 回血进度
        if (!oasis.used && oasis.healTimer > 0) {
            ctx.fillStyle = '#FFF';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${Math.ceil(oasis.healTimer / 60)}s`, dx + oasis.width / 2, oasis.y + oasis.height / 2);
            ctx.textAlign = 'left';
        }
    });

    // 沙漠骆驼
    desertCamels.forEach(camel => {
        const dx = camel.x - camX;
        ctx.fillStyle = '#D2B48C';
        ctx.fillRect(dx, camel.y, camel.width, camel.height);
        // 骆驼头
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(dx + camel.width, camel.y + 5, 8, 8);
        if (camel.interacted) {
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(dx, camel.y, camel.width, camel.height);
        }
    });

    // 樱花兔子
    cherryRabbits.forEach(rabbit => {
        const dx = rabbit.x - camX;
        ctx.fillStyle = '#F5F5DC';
        ctx.fillRect(dx, rabbit.y, rabbit.width, rabbit.height);
        // 兔子耳朵
        ctx.fillStyle = '#FFB6C1';
        ctx.fillRect(dx + 5, rabbit.y - 6, 4, 6);
        ctx.fillRect(dx + 11, rabbit.y - 6, 4, 6);
        if (!rabbit.fed && cherryPetalCollected >= 10) {
            // 显示可互动
            ctx.fillStyle = '#FFB7C5';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('❤️', dx + rabbit.width / 2, rabbit.y - 10);
            ctx.textAlign = 'left';
        }
    });

    // 蘑菇岛连击提示
    if (mushroomBounceState.combo > 0) {
        ctx.fillStyle = '#BA55D3';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`🍄 连击 ×${mushroomBounceState.combo}`, canvas.width - 10, 50);
        ctx.textAlign = 'left';
    }

    // 冰镐状态
    if (icePickaxeActive.active) {
        ctx.fillStyle = '#87CEEB';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`⛏️ ${Math.ceil(icePickaxeActive.timer / 1000)}s`, canvas.width - 10, 70);
        ctx.textAlign = 'left';
    }

    // 冰霜护甲状态
    if (frostArmorActive.active) {
        ctx.fillStyle = '#00CED1';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`🛡️ ${Math.ceil(frostArmorActive.timer / 1000)}s`, canvas.width - 10, 90);
        ctx.textAlign = 'left';
    }

    // 无敌buff状态
    if (invincibilityBuff.active) {
        ctx.fillStyle = '#FFB7C5';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`🌸 ${Math.ceil(invincibilityBuff.timer / 1000)}s`, canvas.width - 10, 110);
        ctx.textAlign = 'left';
    }
}

// ============ 清理函数 ============
function clearInteractionChains() {
    forestShelter = { active: false, x: 0, y: 0, timer: 0, cooldownTimer: 0 };
    desertOases = [];
    desertCamels = [];
    camelRideState = { active: false, timer: 0, cooldownTimer: 0 };
    iceSculptures = [];
    icePickaxeActive = { active: false, timer: 0 };
    iceCoresCollected = 0;
    frostArmorActive = { active: false, timer: 0, cooldownTimer: 0 };
    mushroomBounceState = { combo: 0, lastBounceTime: 0, lastBounceY: 0 };
    cherryPetalCollected = 0;
    cherryRabbits = [];
    invincibilityBuff = { active: false, timer: 0, cooldownTimer: 0 };
}

// ============ 每帧更新 ============
function updateAllInteractionChains() {
    updateForestShelter();
    updateDesertSystems();
    updateSnowIceSystem();
    updateCherryPetalSystem();

    // 离开地面时重置蘑菇连击
    if (!player.grounded) {
        resetMushroomCombo(false);
    }
}
