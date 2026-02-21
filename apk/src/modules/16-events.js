/**
 * 16-events.js - 事件绑定与输入处理
 * 从 main.js 拆分 (原始行 7076-7401)
 */
function wireSettingsModal() {
    const modal = document.getElementById("settings-modal");
    const btnOpen = document.getElementById("btn-settings");
    const btnClose = document.getElementById("btn-settings-close");
    const btnSave = document.getElementById("btn-settings-save");
    const btnAdvanced = document.getElementById("btn-settings-advanced");
    const btnResetProgress = document.getElementById("btn-reset-progress");
    const progressVocab = document.getElementById("progress-vocab");
    const advancedModal = document.getElementById("advanced-settings-modal");
    const btnAdvancedClose = document.getElementById("btn-advanced-settings-close");
    const btnAdvancedSave = document.getElementById("btn-advanced-settings-save");
    const optPhraseFollowMode = document.getElementById("opt-phrase-follow-mode");
    const optPhraseFollowDirectRatio = document.getElementById("opt-phrase-follow-direct-ratio");
    const optPhraseFollowGapCount = document.getElementById("opt-phrase-follow-gap-count");
    const optWordRepeatWindow = document.getElementById("opt-word-repeat-window");
    const optPhraseFollowAdaptive = document.getElementById("opt-phrase-follow-adaptive");
    const optWordRepeatBias = document.getElementById("opt-word-repeat-bias");
    const optWordFollowStats = document.getElementById("opt-word-follow-stats");

    const optLearningMode = document.getElementById("opt-learning-mode");
    const optChallengeMode = document.getElementById("opt-challenge-mode");
    const optChallengeFreq = document.getElementById("opt-challenge-freq");
    const optWordCardDuration = document.getElementById("opt-word-card-duration");
    const optSpeech = document.getElementById("opt-speech");
    const optSpeechEn = document.getElementById("opt-speech-en");
    const optSpeechZh = document.getElementById("opt-speech-zh");
    const optSpeechZhEnabled = document.getElementById("opt-speech-zh-enabled");
    const optBgm = document.getElementById("opt-bgm");
    const optUiScale = document.getElementById("opt-ui-scale");
    const optDeviceMode = document.getElementById("opt-device-mode");
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
    let advancedModalVisible = false;

    function readFollowUpMetrics() {
        const m = globalThis.__MMWG_FOLLOWUP_METRICS || {};
        const calls = Number(m.pickCalls) || 0;
        const served = Number(m.followServed) || 0;
        const queued = Number(m.followQueued) || 0;
        const deferred = Number(m.followDeferredByExclude) || 0;
        const dropped = Number(m.followDroppedByQueueLimit) || 0;
        const hitRate = calls > 0 ? (served / calls).toFixed(2) : "0.00";
        return { calls, served, queued, deferred, dropped, hitRate };
    }

    function renderFollowUpStats() {
        if (!optWordFollowStats) return;
        const m = readFollowUpMetrics();
        optWordFollowStats.innerText = `calls=${m.calls}, served=${m.served}, hitRate=${m.hitRate}, queued=${m.queued}, deferred=${m.deferred}, dropped=${m.dropped}`;
    }

    function fillAdvanced() {
        if (optPhraseFollowMode) optPhraseFollowMode.value = String(settings.phraseFollowMode || "hybrid");
        if (optPhraseFollowDirectRatio) optPhraseFollowDirectRatio.value = String(settings.phraseFollowDirectRatio ?? 0.7);
        if (optPhraseFollowGapCount) {
            const gap = String(settings.phraseFollowGapCount ?? 2);
            optPhraseFollowGapCount.value = gap;
            if (optPhraseFollowGapCount.value !== gap) optPhraseFollowGapCount.value = "2";
        }
        if (optWordRepeatWindow) optWordRepeatWindow.value = String(settings.wordRepeatWindow ?? 6);
        if (optPhraseFollowAdaptive) optPhraseFollowAdaptive.checked = settings.phraseFollowAdaptive !== false;
        if (optWordRepeatBias) {
            const desiredBias = String(settings.wordRepeatBias || "reinforce_wrong");
            optWordRepeatBias.value = desiredBias;
            if (optWordRepeatBias.value !== desiredBias) optWordRepeatBias.value = "reinforce_wrong";
        }
        renderFollowUpStats();
    }

    function openAdvanced() {
        if (!advancedModal) return;
        fillAdvanced();
        advancedModal.classList.add("visible");
        advancedModal.setAttribute("aria-hidden", "false");
        advancedModalVisible = true;
    }

    function closeAdvanced() {
        if (!advancedModal) return;
        advancedModal.classList.remove("visible");
        advancedModal.setAttribute("aria-hidden", "true");
        advancedModalVisible = false;
    }

    function saveAdvanced() {
        if (optPhraseFollowMode) settings.phraseFollowMode = String(optPhraseFollowMode.value || "hybrid");
        if (optPhraseFollowDirectRatio) settings.phraseFollowDirectRatio = Number(optPhraseFollowDirectRatio.value || 0.7);
        if (optPhraseFollowGapCount) settings.phraseFollowGapCount = Number(optPhraseFollowGapCount.value || 2);
        if (optWordRepeatWindow) settings.wordRepeatWindow = Number(optWordRepeatWindow.value || 6);
        if (optPhraseFollowAdaptive) settings.phraseFollowAdaptive = !!optPhraseFollowAdaptive.checked;
        if (optWordRepeatBias) settings.wordRepeatBias = String(optWordRepeatBias.value || "reinforce_wrong");
        settings = normalizeSettings(settings);
        wordPicker = null;
        followUpQueue = [];
        if (typeof resetFollowUpMetrics === "function") resetFollowUpMetrics();
        renderFollowUpStats();
        saveSettings();
        closeAdvanced();
        showToast("高级学习设置已保存");
    }

    function fill() {
        if (optLearningMode) optLearningMode.checked = !!settings.learningMode;
        if (optChallengeMode) optChallengeMode.checked = !!settings.challengeEnabled;
        if (optChallengeFreq) {
            const desiredFreq = String(settings.challengeFrequency ?? 0.3);
            optChallengeFreq.value = desiredFreq;
            if (optChallengeFreq.value !== desiredFreq) optChallengeFreq.value = "0.3";
        }
        if (optWordCardDuration) {
            const desiredDuration = String(settings.wordCardDuration ?? 900);
            optWordCardDuration.value = desiredDuration;
            if (optWordCardDuration.value !== desiredDuration) optWordCardDuration.value = "900";
        }
        if (optSpeech) optSpeech.checked = !!settings.speechEnabled;
        if (optSpeechEn) optSpeechEn.value = String(settings.speechEnRate ?? 0.8);
        if (optSpeechZh) optSpeechZh.value = String(settings.speechZhRate ?? 0.9);
        if (optSpeechZhEnabled) optSpeechZhEnabled.checked = !!settings.speechZhEnabled;
        if (optSpeechZh) optSpeechZh.disabled = !settings.speechZhEnabled;
        if (optBgm) optBgm.checked = !!settings.musicEnabled;
        if (optUiScale) optUiScale.value = String(settings.uiScale ?? 1.0);
        if (optDeviceMode) optDeviceMode.value = settings.deviceMode || "auto";
        if (optMotionScale) optMotionScale.value = String(settings.motionScale ?? 1.25);
        if (optDifficulty) {
            const desired = settings.difficultySelection || "auto";
            optDifficulty.value = desired;
            if (optDifficulty.value !== desired) optDifficulty.value = "auto";
        }
        if (optBiomeStep) optBiomeStep.value = String(settings.biomeSwitchStepScore ?? 300);
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
        closeAdvanced();
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
        if (optChallengeFreq) settings.challengeFrequency = Number(optChallengeFreq.value || 0.3);
        if (optWordCardDuration) settings.wordCardDuration = Number(optWordCardDuration.value || 900);
        if (optSpeech) settings.speechEnabled = !!optSpeech.checked;
        if (optSpeechEn) settings.speechEnRate = Number(optSpeechEn.value);
        if (optSpeechZh) settings.speechZhRate = Number(optSpeechZh.value);
        if (optSpeechZhEnabled) settings.speechZhEnabled = !!optSpeechZhEnabled.checked;
        if (optBgm) settings.musicEnabled = !!optBgm.checked;
        if (optUiScale) settings.uiScale = Number(optUiScale.value);
        if (optDeviceMode) settings.deviceMode = String(optDeviceMode.value || "auto");
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
    if (btnAdvanced) btnAdvanced.addEventListener("click", openAdvanced);
    if (btnAdvancedClose) btnAdvancedClose.addEventListener("click", closeAdvanced);
    if (btnAdvancedSave) btnAdvancedSave.addEventListener("click", saveAdvanced);
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
            if (e.target === modal && !advancedModalVisible) close();
        });
    }
    if (advancedModal) {
        advancedModal.addEventListener("click", e => {
            if (e.target === advancedModal) closeAdvanced();
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
    const btnInventory = document.getElementById("btn-inventory");
    if (btnInventory) {
        btnInventory.addEventListener("click", () => {
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

        const supportsPointer = (typeof window !== "undefined") && ("PointerEvent" in window);
        if (supportsPointer) {
            btn.addEventListener("pointerdown", e => {
                e.preventDefault();
                try { btn.setPointerCapture(e.pointerId); } catch {}
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
            return;
        }

        // Fallback for older Android WebViews without Pointer Events.
        btn.addEventListener("touchstart", e => { e.preventDefault(); onDown(); }, { passive: false });
        btn.addEventListener("touchend", e => { e.preventDefault(); onUp(); }, { passive: false });
        btn.addEventListener("touchcancel", e => { e.preventDefault(); onUp(); }, { passive: false });
        btn.addEventListener("mousedown", e => { e.preventDefault(); onDown(); }, { passive: false });
        btn.addEventListener("mouseup", e => { e.preventDefault(); onUp(); }, { passive: false });
        btn.addEventListener("mouseleave", () => onUp());
    }

    function bindTap(action, fn) {
        const btn = root.querySelector(`[data-action="${action}"]`);
        if (!btn) return;
        let armed = false;
        let lastTapAt = 0;
        const fireTap = (e) => {
            if (e) e.preventDefault();
            const now = Date.now();
            if (now - lastTapAt < 180) return;
            lastTapAt = now;
            fn();
        };
        const supportsPointer = (typeof window !== "undefined") && ("PointerEvent" in window);
        if (supportsPointer) {
            btn.addEventListener("pointerdown", e => {
                e.preventDefault();
                armed = true;
                try { btn.setPointerCapture(e.pointerId); } catch {}
            }, { passive: false });
            btn.addEventListener("pointerup", e => {
                if (!armed) return;
                armed = false;
                fireTap(e);
            }, { passive: false });
            btn.addEventListener("pointercancel", () => { armed = false; }, { passive: false });
            btn.addEventListener("lostpointercapture", () => { armed = false; });
            return;
        }

        btn.addEventListener("touchstart", e => { e.preventDefault(); armed = true; }, { passive: false });
        btn.addEventListener("touchend", e => {
            if (!armed) return;
            armed = false;
            fireTap(e);
        }, { passive: false });
        btn.addEventListener("touchcancel", () => { armed = false; }, { passive: false });
        btn.addEventListener("mousedown", e => { e.preventDefault(); armed = true; }, { passive: false });
        btn.addEventListener("mouseup", e => {
            if (!armed) return;
            armed = false;
            fireTap(e);
        }, { passive: false });
        btn.addEventListener("mouseleave", () => { armed = false; });
        btn.addEventListener("click", e => { e.preventDefault(); }, { passive: false });
    }

    function bindLongPress(action, fn, holdMs = 420) {
        const btn = root.querySelector(`[data-action="${action}"]`);
        if (!btn) return;
        let timer = null;
        let fired = false;
        const clearPress = () => {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
        };
        const startPress = (e) => {
            if (e) e.preventDefault();
            clearPress();
            fired = false;
            timer = setTimeout(() => {
                fired = true;
                fn();
            }, holdMs);
        };
        const endPress = (e) => {
            if (e) e.preventDefault();
            clearPress();
        };

        const supportsPointer = (typeof window !== "undefined") && ("PointerEvent" in window);
        if (supportsPointer) {
            btn.addEventListener("pointerdown", e => {
                startPress(e);
                try { btn.setPointerCapture(e.pointerId); } catch {}
            }, { passive: false });
            btn.addEventListener("pointerup", endPress, { passive: false });
            btn.addEventListener("pointercancel", endPress, { passive: false });
            btn.addEventListener("lostpointercapture", clearPress);
            return;
        }

        btn.addEventListener("touchstart", startPress, { passive: false });
        btn.addEventListener("touchend", endPress, { passive: false });
        btn.addEventListener("touchcancel", endPress, { passive: false });
        btn.addEventListener("mousedown", startPress, { passive: false });
        btn.addEventListener("mouseup", endPress, { passive: false });
        btn.addEventListener("mouseleave", clearPress);
        btn.addEventListener("click", e => {
            e.preventDefault();
            if (fired) fired = false;
        }, { passive: false });
    }

    bindHold("left", () => { keys.left = true; }, () => { keys.left = false; });
    bindHold("right", () => { keys.right = true; }, () => { keys.right = false; });
    bindTap("jump", () => { jumpBuffer = gameConfig.jump.bufferFrames; });
    bindTap("attack", () => { handleAttack("tap"); });
    bindTap("interact", () => { handleInteraction("tap"); });
    bindTap("interior-exit", () => {
        if (typeof isVillageInteriorActive === "function" && isVillageInteriorActive()) {
            if (typeof exitVillageInterior === "function") exitVillageInterior("🏠 离开房屋");
        }
    });
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
    challengeHintBtn = document.getElementById("challenge-hint");
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

    if (challengeRepeatBtn) {
        challengeRepeatBtn.addEventListener("click", () => {
            if (currentLearningChallenge?.wordObj) {
                speakWord(currentLearningChallenge.wordObj);
            }
        });
    }
    if (challengeHintBtn) {
        challengeHintBtn.addEventListener("click", () => {
            if (typeof useLearningChallengeHint === "function") {
                useLearningChallengeHint();
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
