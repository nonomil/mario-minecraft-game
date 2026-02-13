/**
 * 17-bootstrap.js - 启动入口与测试API
 * 从 main.js 拆分 (原始行 7402-7663)
 */
async function start() {
    const [loadedGame, loadedControls, loadedLevels, loadedWords, loadedBiomes] = await Promise.all([
        loadJsonWithFallback("config/game.json", defaultGameConfig),
        loadJsonWithFallback("config/controls.json", defaultControls),
        loadJsonWithFallback("config/levels.json", defaultLevels),
        loadJsonWithFallback("words/words-base.json", defaultWords),
        loadJsonWithFallback("config/biomes.json", { switch: DEFAULT_BIOME_SWITCH, biomes: DEFAULT_BIOME_CONFIGS })
    ]);

    gameConfig = mergeDeep(defaultGameConfig, loadedGame);
    difficultyConfigCache = null;
    lootConfigCache = null;
    keyBindings = { ...defaultControls, ...(loadedControls || {}) };
    levels = Array.isArray(loadedLevels) && loadedLevels.length ? loadedLevels : defaultLevels;
    wordDatabase = Array.isArray(loadedWords) && loadedWords.length ? loadedWords : defaultWords;
    const bundle = normalizeBiomeBundle(loadedBiomes);
    biomeConfigs = bundle.biomes;
    biomeSwitchConfig = bundle.switch;
    baseGameConfig = JSON.parse(JSON.stringify(gameConfig));
    baseCanvasSize = { width: baseGameConfig.canvas.width, height: baseGameConfig.canvas.height };
    baseEnemyStats = JSON.parse(JSON.stringify(ENEMY_STATS));
    baseWeapons = JSON.parse(JSON.stringify(WEAPONS));
    baseBiomeConfigs = JSON.parse(JSON.stringify(biomeConfigs));
    baseCloudPlatformConfig = typeof CLOUD_PLATFORM_CONFIG === "undefined"
        ? null
        : JSON.parse(JSON.stringify(CLOUD_PLATFORM_CONFIG));
    settings = normalizeSettings(settings);
    const parsed = parseKeyCodes(settings.keyCodes);
    if (parsed) {
        keyBindings.jump = parsed[0];
        keyBindings.attack = parsed[1];
        keyBindings.interact = parsed[2];
        keyBindings.switch = parsed[3];
        keyBindings.useDiamond = parsed[4];
    }

    wireAudioUnlock();
    applyBgmSetting();

    applySettingsToUI();
    window.addEventListener("resize", scheduleApplySettingsToUI);
    window.addEventListener("orientationchange", scheduleApplySettingsToUI);
    if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", scheduleApplySettingsToUI, { passive: true });
        // Some mobile browsers only update visual viewport via scroll when the URL bar collapses/expands.
        window.visualViewport.addEventListener("scroll", scheduleApplySettingsToUI, { passive: true });
    }
    ensureVocabEngine();
    renderVocabSelect();
    await setActiveVocabPack(settings.vocabSelection || "auto");
    wireHudButtons();
    wireArmorModal();
    wireInventoryModal();
    wireProfileModal();
    wireSettingsModal();
    wireLearningModals();
    wireTouchControls();
    await initLoginScreen();

    const overlayBtn = document.getElementById("btn-overlay-action");
    if (overlayBtn) {
        overlayBtn.addEventListener("click", resumeGameFromOverlay);
        overlayBtn.addEventListener("pointerdown", e => {
            e.preventDefault();
            resumeGameFromOverlay();
        }, { passive: false });
    }
    const overlayScorebtn = document.getElementById("btn-overlay-score-revive");
    if (overlayScorebtn) {
        overlayScorebtn.addEventListener("click", () => {
            reviveWithScore();
        });
    }
    const overlay = document.getElementById("screen-overlay");
    if (overlay) {
        overlay.addEventListener("click", e => { if (e.target === overlay) resumeGameFromOverlay(); });
        overlay.addEventListener("pointerdown", e => {
            if (e.target !== overlay) return;
            e.preventDefault();
            resumeGameFromOverlay();
        }, { passive: false });
    }

    function matchesBinding(e, binding) {
        if (!binding) return false;
        if (e.code === binding || e.key === binding) return true;
        const k = String(e.key || "");
        if (binding === "Space") return e.code === "Space" || k === " " || k === "Spacebar";
        if (binding.startsWith("Key") && binding.length === 4) {
            return e.code === binding || k.toLowerCase() === binding.slice(3).toLowerCase();
        }
        return false;
    }

    window.addEventListener("keydown", e => {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
        const isJump = matchesBinding(e, keyBindings.jump) || e.code === "ArrowUp" || e.code === "Space";
        const isRight = matchesBinding(e, keyBindings.right) || e.code === "ArrowRight" || e.key === "ArrowRight";
        const isLeft = matchesBinding(e, keyBindings.left) || e.code === "ArrowLeft" || e.key === "ArrowLeft";
        const isAttack = matchesBinding(e, keyBindings.attack) || String(e.key || "").toLowerCase() === "j";
        const isWeaponSwitch = matchesBinding(e, keyBindings.switch) || String(e.key || "").toLowerCase() === "k";
        const isInteract = matchesBinding(e, keyBindings.interact) || String(e.key || "").toLowerCase() === "y";
        const isUseDiamond = matchesBinding(e, keyBindings.useDiamond) || String(e.key || "").toLowerCase() === "z";
        const isDecorInteract = String(e.key || "").toLowerCase() === "e";
        const isPause = e.code === "Escape";
        const tag = e.target && e.target.tagName ? e.target.tagName.toUpperCase() : "";
        const inInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
        if (isJump) {
            if (!e.repeat) {
                jumpBuffer = gameConfig.jump.bufferFrames;
            }
        }
        if (isRight) keys.right = true;
        if (isLeft) keys.left = true;
        if (isAttack) handleAttack("press");
        if (isWeaponSwitch) switchWeapon();
        if (isUseDiamond) useDiamondForHp();
        if (isInteract) handleInteraction();
        if (isDecorInteract) handleDecorationInteract();
        if (!inInput && e.key >= "1" && e.key <= "9") {
            selectedSlot = parseInt(e.key, 10) - 1;
            updateInventoryUI();
            const itemKey = HOTBAR_ITEMS[selectedSlot];
            showToast(`选择: ${ITEM_LABELS[itemKey] || itemKey || "空"}`);
        }
        if (!inInput && String(e.key || "").toLowerCase() === "x" && !paused) {
            if (inventory.iron >= 10) {
                tryCraft("iron_golem");
            } else if (inventory.pumpkin >= 10) {
                tryCraft("snow_golem");
            } else {
                showToast("材料不足！需要 10 个铁块或南瓜");
            }
        }
        if (isPause && startedOnce) {
            paused = !paused;
            const btnPause = document.getElementById("btn-pause");
            if (btnPause) btnPause.innerText = paused ? "▶️ 继续" : "⏸ 暂停";
            if (paused) setOverlay(true, "pause");
            else setOverlay(false);
        }
    });

    window.addEventListener("keyup", e => {
        const isRight = matchesBinding(e, keyBindings.right) || e.code === "ArrowRight" || e.key === "ArrowRight";
        const isLeft = matchesBinding(e, keyBindings.left) || e.code === "ArrowLeft" || e.key === "ArrowLeft";
        const isAttack = matchesBinding(e, keyBindings.attack) || String(e.key || "").toLowerCase() === "j";
        if (isRight) keys.right = false;
        if (isLeft) keys.left = false;
        if (isAttack) handleAttackRelease();
    });

    window.addEventListener("blur", () => { keys.right = false; keys.left = false; });
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            if (bgmAudio && !bgmAudio.paused) {
                bgmPausedByVisibility = true;
                try { bgmAudio.pause(); } catch {}
            }
        } else if (bgmPausedByVisibility) {
            bgmPausedByVisibility = false;
            applyBgmSetting();
        }

        if (!startedOnce) return;
        if (document.hidden) {
            paused = true;
            const btnPause = document.getElementById("btn-pause");
            if (btnPause) btnPause.innerText = "▶️ 继续";
            if (!pausedByModal) setOverlay(true, "pause");
        }
    });

    bootReady = true;
    const loginVisible = document.getElementById("login-screen")?.classList.contains("visible");
    if (!loginVisible) {
        bootGameLoopIfNeeded();
    }
    return;
}

start();

// Minimal test hook for Playwright. Kept small to avoid coupling gameplay to tests.
// (Top-level `let` bindings are not readable from Playwright `page.evaluate()`, so expose closures instead.)
function registerTestApi() {
    if (typeof window === "undefined") return;
    if (window.MMWG_TEST_API) return;

    window.MMWG_TEST_API = {
        getState() {
            return {
                paused,
                pausedByModal,
                startedOnce,
                bootReady,
                score,
                levelScore,
                playerHp,
                playerMaxHp,
                playerInvincibleTimer,
                settings: settings ? { ...settings } : null,
                activeVocabPackId: activeVocabPackId || null,
                wordCount: Array.isArray(wordDatabase) ? wordDatabase.length : 0,
                wordItemsCount: Array.isArray(items) ? items.filter(i => i && i.wordObj).length : 0,
                movementSpeed: gameConfig?.physics?.movementSpeed ?? null,
                golemCount: Array.isArray(golems) ? golems.length : 0,
                firstGolemFollowDelay: Array.isArray(golems) && golems[0] ? (golems[0].followDelay ?? null) : null,
                inventory: inventory ? { ...inventory } : null,
                equipment: playerEquipment ? { ...playerEquipment } : null,
                armorInventory: Array.isArray(armorInventory) ? [...armorInventory] : null,
                currentAccount: currentAccount ? { id: currentAccount.id, username: currentAccount.username } : null
            };
        },
        setState(patch) {
            if (!patch || typeof patch !== "object") return;
            if (typeof patch.score === "number") score = patch.score;
            if (typeof patch.levelScore === "number") levelScore = patch.levelScore;
            if (typeof patch.paused === "boolean") paused = patch.paused;
            if (typeof patch.pausedByModal === "boolean") pausedByModal = patch.pausedByModal;
            if (typeof patch.playerHp === "number") playerHp = patch.playerHp;
            if (typeof patch.playerMaxHp === "number") playerMaxHp = patch.playerMaxHp;
            if (typeof patch.playerInvincibleTimer === "number") playerInvincibleTimer = patch.playerInvincibleTimer;
            if (patch.settings && typeof patch.settings === "object") {
                settings = normalizeSettings({ ...settings, ...patch.settings });
                saveSettings();
                applySettingsToUI();
            }
            if (patch.inventory && typeof patch.inventory === "object" && inventory) {
                inventory = { ...inventory, ...patch.inventory };
                updateInventoryUI();
            }
            if (patch.equipment && typeof patch.equipment === "object" && playerEquipment) {
                playerEquipment = { ...playerEquipment, ...patch.equipment };
                updateArmorUI();
            }
            if (Array.isArray(patch.armorInventory)) {
                armorInventory = patch.armorInventory.map(a => ({ id: a.id, durability: a.durability }));
                updateArmorUI();
            }
        },
        actions: {
            bootGameLoopIfNeeded,
            loginWithAccount,
            reviveWithScore,
            setActiveVocabPack,
            clearOldWordItems,
            equipArmor,
            unequipArmor,
            applySpeedSetting,
            spawnWordItemNearPlayer,
            tryCraft,
            saveCurrentProgress,
            updateInventoryUI,
            updateArmorUI,
            updateVocabProgressUI
        }
    };
}

registerTestApi();
