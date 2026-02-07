function wireSettingsModal() {
    const modal = document.getElementById("settings-modal");
    const btnOpen = document.getElementById("btn-settings");
    const btnClose = document.getElementById("btn-settings-close");
    const btnSave = document.getElementById("btn-settings-save");
    const btnResetProgress = document.getElementById("btn-reset-progress");
    const progressVocab = document.getElementById("progress-vocab");

    const optLearningMode = document.getElementById("opt-learning-mode");
    const optChallengeMode = document.getElementById("opt-challenge-mode");
    const optChallengeFreq = document.getElementById("opt-challenge-freq");
    const optSpeech = document.getElementById("opt-speech");
    const optSpeechEn = document.getElementById("opt-speech-en");
    const optSpeechZh = document.getElementById("opt-speech-zh");
    const optBgm = document.getElementById("opt-bgm");
    const optUiScale = document.getElementById("opt-ui-scale");
    const optDeviceMode = document.getElementById("opt-device-mode");
    const optOrientationLock = document.getElementById("opt-orientation-lock");
    const optMotionScale = document.getElementById("opt-motion-scale");
    const optBiomeStep = document.getElementById("opt-biome-step");
    const optGameDifficulty = document.getElementById("opt-game-difficulty");
    const optTouch = document.getElementById("opt-touch");
    const optNoRepeat = document.getElementById("opt-no-repeat");
    const optVocab = document.getElementById("opt-vocab");
    const optVocabStage = document.getElementById("opt-vocab-stage");
    const optVocabDifficulty = document.getElementById("opt-vocab-difficulty");
    const optShowImage = document.getElementById("opt-show-image");
    const optShowLabels = document.getElementById("opt-show-labels");
    const optWordGate = document.getElementById("opt-word-gate");
    const optWordMatch = document.getElementById("opt-word-match");
    const optResolutionMode = document.getElementById("opt-resolution-mode");
    const optKeys = document.getElementById("opt-keys");
    let resetArmed = false;
    let resetTimer = null;

    function fill() {
        if (optLearningMode) optLearningMode.checked = !!settings.learningMode;
        if (optChallengeMode) optChallengeMode.checked = !!settings.challengeEnabled;
        if (optChallengeFreq) optChallengeFreq.value = String(settings.challengeFrequency ?? 0.3);
        if (optSpeech) optSpeech.checked = !!settings.speechEnabled;
        if (optSpeechEn) optSpeechEn.value = String(settings.speechEnRate ?? 0.8);
        if (optSpeechZh) optSpeechZh.value = String(settings.speechZhRate ?? 0.9);
        if (optBgm) optBgm.checked = !!settings.musicEnabled;
        if (optUiScale) optUiScale.value = String(settings.uiScale ?? 1.0);
        if (optDeviceMode) optDeviceMode.value = String(settings.deviceMode || "auto");
        if (optOrientationLock) optOrientationLock.value = String(settings.orientationLock || "auto");
        if (optMotionScale) optMotionScale.value = String(settings.motionScale ?? 1.25);
        if (optBiomeStep) optBiomeStep.value = String(settings.biomeSwitchStepScore ?? 200);
        if (optGameDifficulty) optGameDifficulty.value = settings.gameDifficulty || "medium";
        if (optTouch) optTouch.checked = !!settings.touchControls;
        if (optNoRepeat) optNoRepeat.checked = !!settings.avoidWordRepeats;
        if (optShowImage) optShowImage.checked = !!settings.showWordImage;
        if (optWordGate) optWordGate.checked = !!settings.wordGateEnabled;
        if (optWordMatch) optWordMatch.checked = !!settings.wordMatchEnabled;
        if (optShowLabels) optShowLabels.checked = !!settings.showEnvironmentLabels;
        if (optResolutionMode) optResolutionMode.value = settings.resolutionMode || "auto";
        if (optVocab) optVocab.value = settings.vocabSelection || "auto";
        if (optVocabStage) optVocabStage.value = settings.vocabStage || "auto";
        if (optVocabDifficulty) optVocabDifficulty.value = settings.vocabDifficulty || "auto";
        if (optKeys) optKeys.value = settings.keyCodes || [keyBindings.jump, keyBindings.attack, keyBindings.interact, keyBindings.switch, keyBindings.useDiamond].join(",");
        if (progressVocab) updateVocabProgressUI();
    }

    function open() {
        if (!modal) return;
        pausedByModal = !paused;
        paused = true;
        fill();
        modal.classList.add("visible");
        modal.setAttribute("aria-hidden", "false");
    }

    function close() {
        if (!modal) return;
        modal.classList.remove("visible");
        modal.setAttribute("aria-hidden", "true");
        if (pausedByModal) paused = false;
        pausedByModal = false;
    }

    function resetProgress() {
        resetVocabRotationAndProgress();
    }

    function save() {
        if (optLearningMode) settings.learningMode = !!optLearningMode.checked;
        if (optChallengeMode) settings.challengeEnabled = !!optChallengeMode.checked;
        if (optChallengeFreq) settings.challengeFrequency = Number(optChallengeFreq.value);
        if (optSpeech) settings.speechEnabled = !!optSpeech.checked;
        if (optSpeechEn) settings.speechEnRate = Number(optSpeechEn.value);
        if (optSpeechZh) settings.speechZhRate = Number(optSpeechZh.value);
        if (optBgm) settings.musicEnabled = !!optBgm.checked;
        if (optUiScale) settings.uiScale = Number(optUiScale.value);
        if (optDeviceMode) settings.deviceMode = String(optDeviceMode.value || "auto");
        if (optOrientationLock) settings.orientationLock = String(optOrientationLock.value || "auto");
        if (optMotionScale) settings.motionScale = Number(optMotionScale.value);
        if (optBiomeStep) settings.biomeSwitchStepScore = Number(optBiomeStep.value);
        if (optGameDifficulty) settings.gameDifficulty = String(optGameDifficulty.value || "medium");
        if (optTouch) settings.touchControls = !!optTouch.checked;
        if (optNoRepeat) settings.avoidWordRepeats = !!optNoRepeat.checked;
        if (optShowImage) settings.showWordImage = !!optShowImage.checked;
        if (optWordGate) settings.wordGateEnabled = !!optWordGate.checked;
        if (optWordMatch) settings.wordMatchEnabled = !!optWordMatch.checked;
        if (optShowLabels) settings.showEnvironmentLabels = !!optShowLabels.checked;
        if (optResolutionMode) settings.resolutionMode = String(optResolutionMode.value || "auto");
        if (optVocab) settings.vocabSelection = String(optVocab.value || "auto");
        if (optVocabStage) settings.vocabStage = String(optVocabStage.value || "auto");
        if (optVocabDifficulty) settings.vocabDifficulty = String(optVocabDifficulty.value || "auto");
        if (optKeys) settings.keyCodes = String(optKeys.value || "");

        settings = normalizeSettings(settings);
        difficultyState = null;
        if (settings.deviceMode === "phone") settings.touchControls = true;
        const parsed = parseKeyCodes(settings.keyCodes);
        if (parsed) {
            keyBindings.jump = parsed[0];
            keyBindings.attack = parsed[1];
            keyBindings.interact = parsed[2];
            keyBindings.switch = parsed[3];
            keyBindings.useDiamond = parsed[4];
        }

        wordPicker = null;
        applyBgmSetting();
        saveSettings();
        applySettingsToUI();
        updateDifficultyState(true);
        if (player) {
            applyMotionToPlayer(player);
            applyBiomeEffectsToPlayer();
        }
        setActiveVocabPack(settings.vocabSelection || "auto");
        close();
    }

    if (btnOpen) btnOpen.addEventListener("click", open);
    if (btnClose) btnClose.addEventListener("click", close);
    if (btnSave) btnSave.addEventListener("click", save);
    if (btnResetProgress) {
        btnResetProgress.addEventListener("click", () => {
            if (!resetArmed) {
                resetArmed = true;
                btnResetProgress.innerText = "再点一次确认";
                if (resetTimer) clearTimeout(resetTimer);
                resetTimer = setTimeout(() => {
                    resetArmed = false;
                    btnResetProgress.innerText = "重置轮换";
                }, 2000);
                return;
            }
            resetArmed = false;
            if (resetTimer) clearTimeout(resetTimer);
            btnResetProgress.innerText = "重置轮换";
            resetProgress();
        });
    }
    if (modal) {
        modal.addEventListener("click", e => {
            if (e.target === modal) close();
        });
    }
}

function wireHudButtons() {
    const btnMix = document.getElementById("btn-repeat-pause");
    if (btnMix) {
        btnMix.addEventListener("click", () => {
            if (repeatPauseState === "repeat") {
                if (lastWord) speakWord(lastWord);
                repeatPauseState = "pause";
                btnMix.innerText = "暂停";
                return;
            }
            paused = !paused;
            if (paused && startedOnce) setOverlay(true, "pause");
            if (!paused) setOverlay(false);
            repeatPauseState = "repeat";
            btnMix.innerText = "重读";
        });
    }

    const btnSummon = document.getElementById("btn-summon-golem");
    if (btnSummon) {
        btnSummon.addEventListener("click", () => {
            if (inventory.iron >= 10) {
                tryCraft("iron_golem");
            } else if (inventory.pumpkin >= 10) {
                tryCraft("snow_golem");
            } else {
                showToast("材料不足！需要 10 个铁块或南瓜");
            }
        });
    }
}

function wireTouchControls() {
    const root = document.getElementById("touch-controls");
    if (!root) return;

    function bindHold(action, onDown, onUp) {
        const btn = root.querySelector(`[data-action="${action}"]`);
        if (!btn) return;
        btn.addEventListener("pointerdown", e => {
            e.preventDefault();
            btn.setPointerCapture(e.pointerId);
            onDown();
        }, { passive: false });
        btn.addEventListener("pointerup", e => {
            e.preventDefault();
            onUp();
        }, { passive: false });
        btn.addEventListener("pointercancel", e => {
            e.preventDefault();
            onUp();
        }, { passive: false });
        btn.addEventListener("lostpointercapture", () => onUp());
    }

    function bindTap(action, fn) {
        const btn = root.querySelector(`[data-action="${action}"]`);
        if (!btn) return;
        btn.addEventListener("pointerdown", e => {
            e.preventDefault();
            fn();
        }, { passive: false });
    }

    bindHold("left", () => { keys.left = true; }, () => { keys.left = false; });
    bindHold("right", () => { keys.right = true; }, () => { keys.right = false; });
    bindTap("jump", () => { jumpBuffer = gameConfig.jump.bufferFrames; });
    bindTap("attack", () => { handleAttack("tap"); });
    bindTap("interact", () => { handleInteraction(); });
    bindTap("switch", () => { switchWeapon(); });
    bindTap("use-diamond", () => { useDiamondForHp(); });
}

async function start() {
    const [loadedGame, loadedControls, loadedLevels, loadedWords, loadedBiomes] = await Promise.all([
        loadJsonWithFallback("../config/game.json", defaultGameConfig),
        loadJsonWithFallback("../config/controls.json", defaultControls),
        loadJsonWithFallback("../config/levels.json", defaultLevels),
        loadJsonWithFallback("../words/words-base.json", defaultWords),
        loadJsonWithFallback("../config/biomes.json", { switch: DEFAULT_BIOME_SWITCH, biomes: DEFAULT_BIOME_CONFIGS })
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

    applyConfig();
    applySettingsToUI();
    window.addEventListener("resize", applySettingsToUI);
    window.addEventListener("orientationchange", applySettingsToUI);
    ensureVocabEngine();
    renderVocabSelect();
    await setActiveVocabPack(settings.vocabSelection || "auto");
    wireHudButtons();
    wireSettingsModal();
    wireTouchControls();

    const overlayBtn = document.getElementById("btn-overlay-action");
    if (overlayBtn) overlayBtn.addEventListener("click", resumeGameFromOverlay);
    const overlay = document.getElementById("screen-overlay");
    if (overlay) overlay.addEventListener("click", e => { if (e.target === overlay) resumeGameFromOverlay(); });

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
        const isDown = e.code === "ArrowDown" || String(e.key || "").toLowerCase() === "s";
        const isUp = e.code === "ArrowUp" || String(e.key || "").toLowerCase() === "w";
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
        if (isDown) keys.down = true;
        if (isUp) keys.up = true;
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
            if (btnPause) btnPause.innerText = paused ? "▶ 继续" : "⏸ 暂停";
            if (paused) setOverlay(true, "pause");
            else setOverlay(false);
        }
    });

    window.addEventListener("keyup", e => {
        const isRight = matchesBinding(e, keyBindings.right) || e.code === "ArrowRight" || e.key === "ArrowRight";
        const isLeft = matchesBinding(e, keyBindings.left) || e.code === "ArrowLeft" || e.key === "ArrowLeft";
        const isDown = e.code === "ArrowDown" || String(e.key || "").toLowerCase() === "s";
        const isUp = e.code === "ArrowUp" || String(e.key || "").toLowerCase() === "w";
        const isAttack = matchesBinding(e, keyBindings.attack) || String(e.key || "").toLowerCase() === "j";
        if (isRight) keys.right = false;
        if (isLeft) keys.left = false;
        if (isDown) keys.down = false;
        if (isUp) keys.up = false;
        if (isAttack) handleAttackRelease();
    });

    window.addEventListener("blur", () => { keys.right = false; keys.left = false; keys.down = false; keys.up = false; });
    document.addEventListener("visibilitychange", () => {
        if (!startedOnce) return;
        if (document.hidden) {
            paused = true;
            const btnPause = document.getElementById("btn-pause");
            if (btnPause) btnPause.innerText = "▶ 继续";
            if (!pausedByModal) setOverlay(true, "pause");
        }
    });

    initGame();
    updateWordUI(null);
    paused = true;
    setOverlay(true, "start");
    update();
    draw();
}

start();
