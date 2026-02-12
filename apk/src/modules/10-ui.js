/**
 * 10-ui.js - UI覆盖层、游戏结束、复活
 * 从 main.js 拆分 (原始行 2497-2836)
 */
function setOverlay(visible, mode) {
    const overlay = document.getElementById("screen-overlay");
    if (!overlay) return;
    const title = document.getElementById("overlay-title");
    const text = document.getElementById("overlay-text");
    const btn = document.getElementById("btn-overlay-action");
    const btnScoreRevive = document.getElementById("btn-overlay-score-revive");
    if (visible) {
        overlay.classList.add("visible");
        overlay.setAttribute("aria-hidden", "false");
        overlayMode = mode || "pause";
        if (mode === "start") {
            startOverlayActive = true;
            ensureStartOverlayContent();
            renderStartOverlayAccounts();
            updateStartOverlayActionState();
            setStartOverlayPage("intro");
            clearStartOverlayTimer();
            startOverlayTimer = setTimeout(() => setStartOverlayPage("setup"), START_OVERLAY_INTRO_MS);
            if (title) title.innerText = "Minecraft 单词游戏";
            if (btnScoreRevive) btnScoreRevive.style.display = "none";
        } else if (mode === "pause") {
            if (title) title.innerText = "已暂停";
            if (text) text.innerHTML = START_OVERLAY_HINT_HTML;
            if (btn) btn.innerText = "继续";
            if (btnScoreRevive) btnScoreRevive.style.display = "none";
        } else if (mode === "gameover") {
            const diamonds = getDiamondCount();
            if (title) title.innerText = "💀 游戏结束";
            if (text) {
                const level = Math.max(1, Math.floor(score / 1000) + 1);
                text.innerHTML =
                    `📚 学习单词: ${getLearnedWordCount()}<br>` +
                    `💎 钻石: ${diamonds}<br>` +
                    `⭐ 当前积分: ${score}<br>` +
                    `⚔️ 击杀敌人: ${enemyKillStats.total || 0}<br>` +
                    `🏅 玩家等级: ${level}`;
            }
            if (btn) {
                const cfg = getReviveConfig();
                const diamondCost = Number(cfg.diamondCost) || 10;
                btn.innerText = diamonds >= diamondCost ? `💎${diamondCost} 复活` : "重新开始";
            }
            if (btnScoreRevive) {
                const cfg = getReviveConfig();
                const scoreCost = Number(cfg.scoreCost) || 500;
                const enoughScore = score >= scoreCost;
                btnScoreRevive.style.display = "block";
                btnScoreRevive.disabled = !enoughScore;
                btnScoreRevive.innerText = enoughScore
                    ? `积分复活 (${scoreCost}分)`
                    : `积分复活 (需要${scoreCost}分)`;
            }
        } else {
            if (title) title.innerText = "准备开始";
            if (text) text.innerHTML = START_OVERLAY_HINT_HTML;
            if (btn) btn.innerText = "开始游戏";
            if (btnScoreRevive) btnScoreRevive.style.display = "none";
        }
    } else {
        overlay.classList.remove("visible");
        overlay.setAttribute("aria-hidden", "true");
        if (overlayMode === "start") {
            clearStartOverlayTimer();
            startOverlayActive = false;
        }
        overlayMode = "start";
        if (btnScoreRevive) btnScoreRevive.style.display = "none";
    }
}
function triggerGameOver() {
    paused = true;
    showToast("💀 生命耗尽");
    onGameOver();
    if (maybeLaunchWordMatchRevive()) {
        return;
    }
    setOverlay(true, "gameover");
}
function maybeLaunchWordMatchRevive() {
    if (!settings.wordMatchEnabled || wordMatchActive || !matchLeftEl || !matchRightEl) return false;
    const words = getUniqueSessionWords();
    if (words.length < (LEARNING_CONFIG.wordMatch.wordCount || 5)) return false;
    activeWordMatch = new WordMatchGame(words);
    activeWordMatch.start();
    return true;
}

class WordMatchGame {
    constructor(words) {
        this.words = shuffle(words).slice(0, Math.max(1, LEARNING_CONFIG.wordMatch.wordCount || 5));
        this.leftItems = shuffle(this.words.map(w => ({ id: w.en, text: w.en, word: w })));
        this.rightItems = shuffle(this.words.map(w => ({ id: w.en, text: w.zh || w.en, word: w })));
        this.connections = [];
        this.selectedLeftId = null;
        this.timerMs = LEARNING_CONFIG.wordMatch.timeLimit || 30000;
        this.timerEndAt = 0;
        this.finished = false;
        this.attempts = 0;
        this.maxAttempts = 1;
    }

    start() {
        if (!wordMatchScreenEl) return;
        if (this.attempts >= this.maxAttempts) {
            showToast("复活机会已用完");
            setOverlay(true, "gameover");
            return;
        }
        this.attempts++;
        wordMatchActive = true;
        wordMatchScreenEl.classList.add("visible");
        this.render();
        this.startTimer();
    }

    render() {
        if (!matchLeftEl || !matchRightEl || !matchTotalEl) return;
        if (matchResultEl) {
            matchResultEl.classList.remove("visible");
            matchResultEl.innerText = "";
        }
        if (matchSubtitleEl) matchSubtitleEl.innerText = "将英文与中文拉线连对，只有1次机会";
        matchLeftEl.innerHTML = this.leftItems.map(item => `<div class="match-item" data-id="${item.id}" data-type="en">${item.text}</div>`).join("");
        matchRightEl.innerHTML = this.rightItems.map(item => `<div class="match-item" data-id="${item.id}" data-type="zh">${item.text}</div>`).join("");
        matchTotalEl.innerText = String(this.words.length);
        this.bindEvents();
        this.updateMatchCount();
        this.drawLines();
        if (matchSubmitBtn) matchSubmitBtn.disabled = false;
    }

    bindEvents() {
        if (matchLeftEl) {
            matchLeftEl.querySelectorAll(".match-item").forEach(el => {
                el.addEventListener("click", () => this.selectLeft(el));
            });
        }
        if (matchRightEl) {
            matchRightEl.querySelectorAll(".match-item").forEach(el => {
                el.addEventListener("click", () => this.selectRight(el));
            });
        }
    }

    selectLeft(el) {
        if (!el) return;
        this.selectedLeftId = el.dataset.id;
        matchLeftEl.querySelectorAll(".match-item").forEach(item => item.classList.remove("selected"));
        el.classList.add("selected");
    }

    selectRight(el) {
        if (!el || !this.selectedLeftId) return;
        const leftId = this.selectedLeftId;
        const rightId = el.dataset.id;
        const existingIndex = this.connections.findIndex(conn => conn.left === leftId || conn.right === rightId);
        if (existingIndex >= 0) this.connections.splice(existingIndex, 1);
        this.connections.push({ left: leftId, right: rightId });
        this.selectedLeftId = null;
        matchLeftEl.querySelectorAll(".match-item").forEach(item => item.classList.remove("selected"));
        this.drawLines();
        this.updateMatchCount();
    }

    drawLines() {
        if (!matchLinesEl || !matchLeftEl || !matchRightEl) return;
        const container = document.querySelector(".match-container");
        if (!container) return;
        const containerRect = container.getBoundingClientRect();
        const lines = this.connections.map(conn => {
            const leftEl = matchLeftEl.querySelector(`[data-id="${conn.left}"]`);
            const rightEl = matchRightEl.querySelector(`[data-id="${conn.right}"]`);
            if (!leftEl || !rightEl) return "";
            const leftRect = leftEl.getBoundingClientRect();
            const rightRect = rightEl.getBoundingClientRect();
            const x1 = leftRect.right - containerRect.left;
            const y1 = leftRect.top + leftRect.height / 2 - containerRect.top;
            const x2 = rightRect.left - containerRect.left;
            const y2 = rightRect.top + rightRect.height / 2 - containerRect.top;
            const isCorrect = conn.left === conn.right;
            return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${isCorrect ? "#4CAF50" : "#FFCA28"}" stroke-width="3"/>`;
        }).join("");
        matchLinesEl.innerHTML = lines;
    }

    updateMatchCount() {
        if (matchCountEl) matchCountEl.innerText = String(this.connections.length);
    }

    startTimer() {
        this.stopTimer();
        this.timerEndAt = Date.now() + this.timerMs;
        if (matchTimerEl) matchTimerEl.innerText = String(Math.ceil(this.timerMs / 1000));
        wordMatchTimer = setInterval(() => {
            const remaining = this.timerEndAt - Date.now();
            if (matchTimerEl) matchTimerEl.innerText = String(Math.max(0, Math.ceil(remaining / 1000)));
            if (remaining <= 0) {
                this.submit();
            }
        }, 100);
    }

    stopTimer() {
        if (wordMatchTimer) {
            clearInterval(wordMatchTimer);
            wordMatchTimer = null;
        }
    }

    submit() {
        if (this.finished) return;
        this.finished = true;
        this.stopTimer();
        if (matchSubmitBtn) matchSubmitBtn.disabled = true;
        const correct = this.connections.filter(conn => conn.left === conn.right).length;
        const success = correct >= (LEARNING_CONFIG.wordMatch.minCorrectToRevive || 4);
        this.showResult(success, correct);
    }

    showResult(success, correctCount) {
        if (matchResultEl) {
            matchResultEl.classList.add("visible");
            matchResultEl.innerText = success
                ? `✅ 正确 ${correctCount} 道，祝你复活！`
                : `❌ 正确 ${correctCount} 道，复活失败`;
        }
        if (matchSubtitleEl) {
            matchSubtitleEl.innerText = success ? "继续前行！" : "重整旗鼓再来一次";
        }
        if (success) {
            playerHp = Math.min(playerMaxHp, LEARNING_CONFIG.wordMatch.reviveHp || 3);
            addScore(correctCount * (LEARNING_CONFIG.wordMatch.bonusPerMatch || 10));
            updateHpUI();
            showToast("✨ 词语匹配复活成功！");
            setTimeout(() => this.cleanup(true), 1200);
        } else {
            setTimeout(() => {
                this.cleanup(false);
                setOverlay(true, "gameover");
            }, 1400);
        }
    }

    cleanup(success) {
        this.stopTimer();
        wordMatchActive = false;
        activeWordMatch = null;
        if (matchResultEl) matchResultEl.classList.remove("visible");
        if (wordMatchScreenEl) wordMatchScreenEl.classList.remove("visible");
        if (success) {
            paused = false;
            setOverlay(false);
        }
    }
}
function resumeGameFromOverlay() {
    // Prevent an immediate mobile viewport change from reopening the start overlay.
    viewportIgnoreUntilMs = nowMs() + 2000;
    if (overlayMode === "start") {
        if (!currentAccount) {
            showToast("请先选择或创建档案");
            setStartOverlayPage("setup");
            const input = document.getElementById("overlay-username-input");
            input?.focus();
            return;
        }
        if (!startedOnce) {
            bootGameLoopIfNeeded();
        } else {
            paused = false;
            setOverlay(false);
        }
    } else if (overlayMode === "gameover") {
        if (getDiamondCount() >= 10) {
            inventory.diamond -= 10;
            playerHp = playerMaxHp;
            updateHpUI();
            updateDiamondUI();
            paused = false;
            startedOnce = true;
            setOverlay(false);
        } else {
            initGame();
            paused = false;
            startedOnce = true;
            setOverlay(false);
        }
    } else {
        paused = false;
        startedOnce = true;
        setOverlay(false);
    }
    const btnMix = document.getElementById("btn-repeat-pause");
    if (btnMix) btnMix.innerText = "🔊 重读";
    repeatPauseState = "repeat";
}

function getReviveConfig() {
    const revive = (gameConfig && gameConfig.revive) || {};
    return {
        diamondCost: revive.diamondCost ?? 10,
        scoreCost: revive.scoreCost ?? 500,
        scoreReviveHpPercent: revive.scoreReviveHpPercent ?? 0.5,
        invincibleFrames: revive.invincibleFrames ?? 180
    };
}

function reviveWithScore() {
    const cfg = getReviveConfig();
    const cost = Number(cfg.scoreCost) || 500;
    if (score < cost) {
        showToast(`积分不足（需要 ${cost} 分）`);
        return;
    }
    score -= cost;
    if (score < 0) score = 0;
    const scoreEl = document.getElementById("score");
    if (scoreEl) scoreEl.innerText = score;
    const hpPercent = Math.max(0, Math.min(1, Number(cfg.scoreReviveHpPercent) || 0.5));
    playerHp = Math.max(1, Math.floor(playerMaxHp * hpPercent));
    updateHpUI();
    playerInvincibleTimer = Number(cfg.invincibleFrames) || 180;
    paused = false;
    startedOnce = true;
    setOverlay(false);
    const px = player ? player.x : cameraX;
    const py = player ? player.y - 50 : canvas.height / 2;
    showFloatingText("积分复活", px, py);
    showToast("积分复活成功");
}

function keyLabel(code) {
    if (!code) return "";
    if (code === "Space") return "空格";
    if (code.startsWith("Key") && code.length === 4) return code.slice(3);
    if (code.startsWith("Arrow")) return code.replace("Arrow", "方向");
    return code;
}
