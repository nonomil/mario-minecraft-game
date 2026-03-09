/**
 * 16-events.js - 事件绑定与输入处理
 * 从 main.js 拆分 (原始行 7076-7401)
 */
function wireSettingsModal() {
    const modal = document.getElementById("settings-modal");
    const btnOpen = document.getElementById("btn-settings");
    const btnClose = document.getElementById("btn-settings-close");
    const btnSave = document.getElementById("btn-settings-save");
    const btnResetProgress = document.getElementById("btn-reset-progress");
    const progressVocab = document.getElementById("progress-vocab");

    const optLearningMode = document.getElementById("opt-learning-mode");
    const optChallengeMode = document.getElementById("opt-challenge-mode");
    const optChallengeFrequency = document.getElementById("opt-challenge-frequency");
    const optWordCardDuration = document.getElementById("opt-word-card-duration");
    const optSpeech = document.getElementById("opt-speech");
    const optSpeechEn = document.getElementById("opt-speech-en");
    const optSpeechZh = document.getElementById("opt-speech-zh");
    const optSpeechZhEnabled = document.getElementById("opt-speech-zh-enabled");
    const optBgm = document.getElementById("opt-bgm");
    const optUiScale = document.getElementById("opt-ui-scale");
    const optMotionScale = document.getElementById("opt-motion-scale");
    const optDifficulty = document.getElementById("opt-difficulty");
    const optBiomeStep = document.getElementById("opt-biome-step");
    const optTouch = document.getElementById("opt-touch");
    const optNoRepeat = document.getElementById("opt-no-repeat");
    const optVocab = document.getElementById("opt-vocab");
    if (optVocab) {
        optVocab.addEventListener("change", () => updateVocabPreview(optVocab.value));
    }
    if (optSpeechZhEnabled && optSpeechZh) {
        optSpeechZhEnabled.addEventListener("change", () => {
            optSpeechZh.disabled = !optSpeechZhEnabled.checked;
        });
    }
    const optShowImage = document.getElementById("opt-show-image");
    const optWordGate = document.getElementById("opt-word-gate");
    const optWordMatch = document.getElementById("opt-word-match");
    const optSpeed = document.getElementById("opt-speed");
    const optKeys = document.getElementById("opt-keys");
    let resetArmed = false;
    let resetTimer = null;

    function fill() {
        if (optLearningMode) optLearningMode.checked = !!settings.learningMode;
        if (optChallengeMode) optChallengeMode.checked = !!settings.challengeEnabled;
        if (optChallengeFrequency) {
            const currentFreq = Number(settings.challengeFrequency ?? 0.3);
            const options = [0.15, 0.3, 0.5];
            const closest = options.reduce((a, b) =>
                Math.abs(b - currentFreq) < Math.abs(a - currentFreq) ? b : a
            );
            optChallengeFrequency.value = String(closest);
        }
        if (optWordCardDuration) optWordCardDuration.value = String(settings.wordCardDuration || 900);
        if (optSpeech) optSpeech.checked = !!settings.speechEnabled;
        if (optSpeechEn) optSpeechEn.value = String(settings.speechEnRate ?? 0.8);
        if (optSpeechZh) optSpeechZh.value = String(settings.speechZhRate ?? 0.9);
        if (optSpeechZhEnabled) optSpeechZhEnabled.checked = !!settings.speechZhEnabled;
        if (optSpeechZh) optSpeechZh.disabled = !settings.speechZhEnabled;
        if (optBgm) optBgm.checked = !!settings.musicEnabled;
        if (optUiScale) optUiScale.value = String(settings.uiScale ?? 1.0);
        if (optMotionScale) optMotionScale.value = String(settings.motionScale ?? 1.25);
        if (optDifficulty) {
            const desired = settings.difficultySelection || "auto";
            optDifficulty.value = desired;
            if (optDifficulty.value !== desired) optDifficulty.value = "auto";
        }
        if (optBiomeStep) optBiomeStep.value = String(settings.biomeSwitchStepScore ?? 200);
        if (optTouch) optTouch.checked = !!settings.touchControls;
        if (optNoRepeat) optNoRepeat.checked = !!settings.avoidWordRepeats;
        if (optShowImage) optShowImage.checked = !!settings.showWordImage;
        if (optVocab) optVocab.value = settings.vocabSelection || "auto";
        if (optWordGate) optWordGate.checked = !!settings.wordGateEnabled;
        if (optWordMatch) optWordMatch.checked = !!settings.wordMatchEnabled;
        if (optSpeed) optSpeed.value = settings.movementSpeedLevel || "normal";
        if (optKeys) optKeys.value = settings.keyCodes || [keyBindings.jump, keyBindings.attack, keyBindings.interact, keyBindings.switch, keyBindings.useDiamond].join(",");
        if (progressVocab) updateVocabProgressUI();
        if (optVocab) updateVocabPreview(optVocab.value);
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

    async function save() {
        if (optLearningMode) settings.learningMode = !!optLearningMode.checked;
        if (optChallengeMode) settings.challengeEnabled = !!optChallengeMode.checked;
        if (optChallengeFrequency) settings.challengeFrequency = Number(optChallengeFrequency.value) || 0.3;
        if (optWordCardDuration) settings.wordCardDuration = Number(optWordCardDuration.value) || 900;
        if (optSpeech) settings.speechEnabled = !!optSpeech.checked;
        if (optSpeechEn) settings.speechEnRate = Number(optSpeechEn.value);
        if (optSpeechZh) settings.speechZhRate = Number(optSpeechZh.value);
        if (optSpeechZhEnabled) settings.speechZhEnabled = !!optSpeechZhEnabled.checked;
        if (optBgm) settings.musicEnabled = !!optBgm.checked;
        if (optUiScale) settings.uiScale = Number(optUiScale.value);
        if (optMotionScale) settings.motionScale = Number(optMotionScale.value);
        if (optDifficulty) settings.difficultySelection = String(optDifficulty.value || "auto");
        if (optBiomeStep) settings.biomeSwitchStepScore = Number(optBiomeStep.value);
        if (optTouch) settings.touchControls = !!optTouch.checked;
        if (optNoRepeat) settings.avoidWordRepeats = !!optNoRepeat.checked;
        if (optShowImage) settings.showWordImage = !!optShowImage.checked;
        if (optVocab) settings.vocabSelection = String(optVocab.value || "auto");
        if (optWordGate) settings.wordGateEnabled = !!optWordGate.checked;
        if (optWordMatch) settings.wordMatchEnabled = !!optWordMatch.checked;
        if (optSpeed) settings.movementSpeedLevel = String(optSpeed.value || "normal");
        if (optKeys) settings.keyCodes = String(optKeys.value || "");

        settings = normalizeSettings(settings);
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
        // Apply selected difficulty immediately (even while paused in settings).
        difficultyState = null;
        updateDifficultyState(true);
        if (player) {
            applyMotionToPlayer(player);
            applyBiomeEffectsToPlayer();
        }
        await setActiveVocabPack(settings.vocabSelection || "auto");
        clearOldWordItems();
        spawnWordItemNearPlayer();
        showVocabSwitchEffect();
        updateVocabPreview(settings.vocabSelection);
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
                btnMix.innerText = "⏸ 暂停";
                return;
            }
            paused = !paused;
            if (paused && startedOnce) setOverlay(true, "pause");
            if (!paused) setOverlay(false);
            repeatPauseState = "repeat";
            btnMix.innerText = "🔊 重读";
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
    const btnProfile = document.getElementById("btn-profile");
    if (btnProfile) {
        btnProfile.addEventListener("click", showProfileModal);
    }
    const armorBadge = document.getElementById("armor-status");
    if (armorBadge) {
        armorBadge.addEventListener("click", () => {
            showArmorSelectUI();
        });
    }
    const invBadge = document.getElementById("inventory-status");
    if (invBadge) {
        invBadge.addEventListener("click", () => {
            showInventoryModal();
        });
    }
}

function wireArmorModal() {
    const modal = document.getElementById("armor-select-modal");
    const btnClose = document.getElementById("btn-armor-close");
    if (btnClose) btnClose.addEventListener("click", hideArmorSelectUI);
    if (modal) {
        modal.addEventListener("click", e => {
            if (e.target === modal) hideArmorSelectUI();
        });
    }
}

function wireInventoryModal() {
    inventoryModalEl = document.getElementById("inventory-modal");
    inventoryContentEl = document.getElementById("inventory-content");
    inventoryTabButtons = Array.from(document.querySelectorAll(".inventory-tab"));
    const btnClose = document.getElementById("btn-inventory-close");
    if (btnClose) btnClose.addEventListener("click", hideInventoryModal);
    if (inventoryTabButtons) {
        inventoryTabButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                setInventoryTab(btn.dataset.tab || "items");
            });
        });
    }
    if (inventoryModalEl) {
        inventoryModalEl.addEventListener("click", e => {
            if (e.target === inventoryModalEl) hideInventoryModal();
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

function wireLearningModals() {
    challengeModalEl = document.getElementById("challenge-modal");
    challengeQuestionEl = document.getElementById("challenge-question");
    challengeOptionsEl = document.getElementById("challenge-options");
    challengeInputWrapperEl = document.getElementById("challenge-input-wrapper");
    challengeInputEl = document.getElementById("challenge-input");
    challengeTimerEl = document.getElementById("challenge-timer");
    challengeRepeatBtn = document.getElementById("challenge-repeat");
    wordMatchScreenEl = document.getElementById("word-match-screen");
    matchLeftEl = document.getElementById("match-left");
    matchRightEl = document.getElementById("match-right");
    matchLinesEl = document.getElementById("match-lines");
    matchCountEl = document.getElementById("match-count");
    matchTotalEl = document.getElementById("match-total");
    matchResultEl = document.getElementById("match-result");
    matchSubtitleEl = document.getElementById("match-subtitle");
    matchTimerEl = document.getElementById("match-timer");
    matchSubmitBtn = document.getElementById("btn-match-submit");

    // === v1.6.4 新增：单词本按钮事件绑定 ===
    const btnVocabBook = document.getElementById("btn-vocab-book");
    if (btnVocabBook) {
        btnVocabBook.addEventListener("click", () => {
            showVocabBook();
        });
    }

    const btnCloseVocabBook = document.getElementById("btn-close-vocab-book");
    if (btnCloseVocabBook) {
        btnCloseVocabBook.addEventListener("click", () => {
            hideVocabBook();
        });
    }

    const vocabBookModal = document.getElementById("vocab-book-modal");
    if (vocabBookModal) {
        vocabBookModal.addEventListener("click", e => {
            if (e.target === vocabBookModal) hideVocabBook();
        });
    }

    if (challengeRepeatBtn) {
        challengeRepeatBtn.addEventListener("click", () => {
            if (currentLearningChallenge?.wordObj) {
                speakWord(currentLearningChallenge.wordObj);
            }
        });
    }
    if (challengeInputEl) {
        challengeInputEl.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                e.preventDefault();
                const userAnswer = (challengeInputEl.value || "").trim().toLowerCase();
                const target = (currentLearningChallenge?.answer || "").toLowerCase();
                completeLearningChallenge(userAnswer === target);
            }
        });
    }
    if (matchSubmitBtn) {
        matchSubmitBtn.addEventListener("click", () => {
            activeWordMatch?.submit();
        });
    }
}
