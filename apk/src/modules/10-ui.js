/**
 * 10-ui.js - UI覆盖层、游戏结束、复活
 * 从 main.js 拆分 (原始行 2497-2836)
 */
function getSessionWordSummaryHtml(limit = 6) {
    const counts = sessionWordCounts && typeof sessionWordCounts === "object" ? sessionWordCounts : {};
    const entries = Object.entries(counts)
        .filter(([, c]) => Number(c) > 0)
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .slice(0, Math.max(1, limit));
    if (!entries.length) return "";

    const wordMap = new Map();
    const uniqueWords = typeof getUniqueSessionWords === "function" ? getUniqueSessionWords() : [];
    uniqueWords.forEach(w => {
        if (!w?.en) return;
        wordMap.set(String(w.en), String(w.zh || "").trim());
    });
    const parts = entries.map(([en, cnt]) => {
        const zh = wordMap.get(en);
        return `${en}${zh ? `(${zh})` : ""} x${cnt}`;
    });
    return `<br><br>🧠 本局高频词: ${parts.join(" · ")}`;
}

function updateStartOverlayButtons() {
    if (overlayMode !== "start") return;
    const overlay = document.getElementById("screen-overlay");
    if (!overlay) return;

    const btn = document.getElementById("btn-overlay-action");
    const btnSkip = document.getElementById("btn-overlay-skip");
    const btnPick = document.getElementById("btn-overlay-pick-account");
    const btnWrap = overlay.querySelector(".overlay-buttons");

    const introActive = !!document.querySelector(".overlay-page-intro.active");
    const setupActive = !!document.querySelector(".overlay-page-setup.active");

    if (btnWrap) btnWrap.classList.add("overlay-buttons-duo");

    if (btnSkip) btnSkip.style.display = introActive ? "block" : "none";
    if (btnPick) {
        btnPick.style.display = "block";
        btnPick.innerText = setupActive ? "创建新账号" : "选择档案";
    }
    if (btn) btn.style.display = setupActive ? "block" : "none";
}

function setOverlay(visible, mode) {
    const overlay = document.getElementById("screen-overlay");
    if (!overlay) return;
    const title = document.getElementById("overlay-title");
    const text = document.getElementById("overlay-text");
    const btn = document.getElementById("btn-overlay-action");
    const btnSkip = document.getElementById("btn-overlay-skip");
    const btnPick = document.getElementById("btn-overlay-pick-account");
    const btnScoreRevive = document.getElementById("btn-overlay-score-revive");
    const btnLeaderboard = document.getElementById("btn-overlay-leaderboard");
    const btnWrap = overlay.querySelector(".overlay-buttons");

    const hideStartButtons = () => {
        if (btnSkip) btnSkip.style.display = "none";
        if (btnPick) btnPick.style.display = "none";
        if (btnWrap) btnWrap.classList.remove("overlay-buttons-duo");
    };
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
            wireIntroConfirmButton();
            if (title) title.innerText = "Minecraft 单词游戏";
            if (btnScoreRevive) btnScoreRevive.style.display = "none";
            if (btnLeaderboard) btnLeaderboard.style.display = "none";
            updateStartOverlayButtons();
        } else if (mode === "pause") {
            if (title) title.innerText = "已暂停";
            if (text) text.innerHTML = START_OVERLAY_HINT_HTML;
            if (btn) btn.innerText = "继续";
            if (btn) btn.style.display = "block";
            if (btnScoreRevive) btnScoreRevive.style.display = "none";
            if (btnLeaderboard) btnLeaderboard.style.display = "none";
            hideStartButtons();
        } else if (mode === "error") {
            if (title) title.innerText = "Error";
            if (text) {
                const raw = (typeof window !== "undefined" && window.__MMWG_LAST_ERROR) ? String(window.__MMWG_LAST_ERROR) : "";
                const safe = raw ? raw.replace(/&/g, "&amp;").replace(/</g, "&lt;") : "";
                const detail = safe
                    ? `<pre style="text-align:left;white-space:pre-wrap;max-height:40vh;overflow:auto;margin:10px 0 0;padding:10px;border:1px solid rgba(255,255,255,0.25);background:rgba(0,0,0,0.25)">${safe}</pre>`
                    : "";
                text.innerHTML = "A fatal error occurred. The game is paused. Please reload." + detail;
            }
            if (btn) btn.innerText = "Reload";
            if (btn) btn.style.display = "block";
            if (btnScoreRevive) btnScoreRevive.style.display = "none";
            if (btnLeaderboard) btnLeaderboard.style.display = "none";
            hideStartButtons();
        } else if (mode === "gameover") {
            const diamonds = getDiamondCount();
            if (title) title.innerText = "💀 游戏结束";
            if (text) {
                const level = Math.max(1, Math.floor(score / 1000) + 1);
                const sessionSummary = typeof buildSessionWordsSummary === "function"
                    ? buildSessionWordsSummary()
                    : getSessionWordSummaryHtml();
                text.innerHTML =
                    `📚 学习单词: ${getLearnedWordCount()}<br>` +
                    `💎 钻石: ${diamonds}<br>` +
                    `⭐ 当前积分: ${score}<br>` +
                    `⚔️ 击杀敌人: ${enemyKillStats.total || 0}<br>` +
                    `🏅 玩家等级: ${level}` +
                    sessionSummary;
            }
            if (btn) {
                const cfg = getReviveConfig();
                const diamondCost = Number(cfg.diamondCost) || 10;
                btn.innerText = diamonds >= diamondCost ? `💎${diamondCost} 复活` : "重新开始";
                btn.style.display = "block";
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
            // Show leaderboard button on gameover
            if (btnLeaderboard) btnLeaderboard.style.display = "block";
            hideStartButtons();
        } else {
            if (title) title.innerText = "准备开始";
            if (text) text.innerHTML = START_OVERLAY_HINT_HTML;
            if (btn) btn.innerText = "开始游戏";
            if (btn) btn.style.display = "block";
            if (btnScoreRevive) btnScoreRevive.style.display = "none";
            if (btnLeaderboard) btnLeaderboard.style.display = "none";
            hideStartButtons();
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
        if (btnLeaderboard) btnLeaderboard.style.display = "none";
        hideStartButtons();
    }
}
function wireIntroConfirmButton() {
    const btn = document.getElementById("btn-overlay-intro-confirm");
    if (!btn || btn.dataset.wired) return;
    btn.dataset.wired = "1";
    btn.addEventListener("click", () => {
        setStartOverlayPage("setup");
        wireStartOverlayAccountActions();
        renderStartOverlayAccounts();
        const input = document.getElementById("overlay-username-input");
        if (input) setTimeout(() => input.focus(), 100);
    });
}
function proceedToGameOver() {
    setOverlay(true, "gameover");
}

function showGameReview(results) {
    const screen = document.getElementById("review-screen");
    const list = document.getElementById("review-word-list");
    const flash = document.getElementById("review-flash-cards");
    const btn = document.getElementById("review-continue-btn");
    const rows = Array.isArray(results) ? results : [];
    if (!screen || !list || !flash || !btn || rows.length === 0) {
        proceedToGameOver();
        return;
    }

    list.innerHTML = rows.map((item) => {
        const ok = !!item.correct;
        const bg = ok ? "#1f6f3d" : "#7a2f2f";
        const text = String(item.word || "");
        return `<span style="padding:6px 10px;border-radius:8px;background:${bg};">${text} ${ok ? "✓" : "✗"}</span>`;
    }).join("");

    const wrongRows = rows.filter(item => !item.correct);
    let idx = 0;
    const flashWrong = () => {
        if (idx >= wrongRows.length) {
            flash.innerHTML = "";
            return;
        }
        const item = wrongRows[idx++];
        flash.innerHTML = `<div style="font-size:26px;font-weight:700;">${item.word || ""}</div><div style="opacity:.75;">${item.zh || ""}</div>`;
        setTimeout(flashWrong, 1200);
    };
    if (wrongRows.length > 0) flashWrong();
    else flash.innerHTML = `<div style="opacity:.9;">本局答题表现不错，继续冲刺！</div>`;

    screen.style.display = "block";
    const closeReview = () => {
        screen.style.display = "none";
        window._sessionWordResults = [];
        proceedToGameOver();
    };
    btn.onclick = closeReview;
    setTimeout(() => {
        if (screen.style.display !== "none") closeReview();
    }, 8000);
}
window.showGameReview = showGameReview;

function triggerGameOver() {
    paused = true;
    showToast("💀 生命耗尽");
    onGameOver();
    if (maybeLaunchWordMatchRevive()) {
        return;
    }
    showGameReview(window._sessionWordResults || []);
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
        this.hasInteracted = false;
        this.timerPaused = false;
        this.pausedAt = 0;
    }

    start() {
        if (!wordMatchScreenEl) return;
        if (this.attempts >= this.maxAttempts) {
            showToast(UI_TEXTS.reviveUsed);
            setOverlay(true, "gameover");
            return;
        }
        this.attempts++;
        this.hasInteracted = false;
        this.timerPaused = false;
        this.pausedAt = 0;
        wordMatchActive = true;
        wordMatchScreenEl.classList.add("visible");
        this.render();
        this.startTimer();
    }

    pauseTimerOnFirstInteraction() {
        if (this.hasInteracted || this.timerPaused || this.finished) return;
        this.hasInteracted = true;
        this.timerPaused = true;
        this.pausedAt = Date.now();
        this.stopTimer();
        if (matchTimerEl) {
            matchTimerEl.innerText = "⏸";
            matchTimerEl.style.color = "#FFA726";
        }
        if (matchSubtitleEl) {
            matchSubtitleEl.innerText = "计时已暂停，请仔细匹配";
        }
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
        this.pauseTimerOnFirstInteraction();
        this.selectedLeftId = el.dataset.id;
        matchLeftEl.querySelectorAll(".match-item").forEach(item => item.classList.remove("selected"));
        el.classList.add("selected");
    }

    selectRight(el) {
        if (!el || !this.selectedLeftId) return;
        this.pauseTimerOnFirstInteraction();
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
            showToast(UI_TEXTS.reviveSuccess);
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
        // If still on intro page, don't skip - user must click confirm
        const introPage = document.querySelector(".overlay-page-intro.active");
        if (introPage) return;
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
            if (typeof clearModalPauseStack === "function") clearModalPauseStack(true);
            else paused = false;
            setOverlay(false);
        }
    } else if (overlayMode === "gameover") {
        if (getDiamondCount() >= 10) {
            inventory.diamond -= 10;
            playerHp = playerMaxHp;
            updateHpUI();
            updateDiamondUI();
            if (typeof clearModalPauseStack === "function") clearModalPauseStack(true);
            else paused = false;
            startedOnce = true;
            setOverlay(false);
        } else {
            initGame();
            if (typeof clearModalPauseStack === "function") clearModalPauseStack(true);
            else paused = false;
            startedOnce = true;
            setOverlay(false);
        }
    } else if (overlayMode === "error") {
        try {
            location.reload();
        } catch {
            initGame();
            if (typeof clearModalPauseStack === "function") clearModalPauseStack(true);
            else paused = false;
            startedOnce = true;
            setOverlay(false);
        }
    } else {
        if (typeof clearModalPauseStack === "function") clearModalPauseStack(true);
        else paused = false;
        startedOnce = true;
        setOverlay(false);
    }
    const btnMix = document.getElementById("btn-repeat-pause");
    if (btnMix) btnMix.innerText = "🔊 重读";
    repeatPauseState = "repeat";
}

function skipStartOverlay() {
    // "跳过" is allowed to bypass intro + account selection.
    viewportIgnoreUntilMs = nowMs() + 2000;
    if (overlayMode !== "start") {
        resumeGameFromOverlay();
        return;
    }

    if (!startedOnce) {
        bootGameLoopIfNeeded();
    } else {
        if (typeof clearModalPauseStack === "function") clearModalPauseStack(true);
        else paused = false;
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

// Leaderboard functions
function showLeaderboardModal() {
    const modal = document.getElementById("leaderboard-modal");
    if (!modal) return;
    modal.classList.add("visible");
    modal.setAttribute("aria-hidden", "false");
    const saveSection = document.getElementById("leaderboard-save-section");
    if (saveSection) saveSection.style.display = "";
    renderLeaderboard();
    // Pre-fill name input with current account username
    const nameInput = document.getElementById("leaderboard-name-input");
    if (nameInput && currentAccount) {
        nameInput.value = currentAccount.username || "";
    }
}

function hideLeaderboardModal() {
    const modal = document.getElementById("leaderboard-modal");
    if (!modal) return;
    modal.classList.remove("visible");
    modal.setAttribute("aria-hidden", "true");
}

function saveToLeaderboard() {
    const nameInput = document.getElementById("leaderboard-name-input");
    const name = (nameInput?.value || "匿名玩家").trim().slice(0, 20);
    const record = {
        name: name,
        score: score,
        wordsLearned: getLearnedWordCount(),
        enemiesKilled: enemyKillStats.total || 0,
        date: Date.now()
    };
    MMWG_STORAGE.saveToLeaderboard(record);
    showToast("📝 成绩已保存到排行榜");
    renderLeaderboard();
    // Hide the save section after saving
    const saveSection = document.getElementById("leaderboard-save-section");
    if (saveSection) saveSection.style.display = "none";
}

function saveProfileScoreToLeaderboard() {
    if (typeof saveCurrentProgress === "function") saveCurrentProgress();
    const nameInput = document.getElementById("leaderboard-name-input");
    if (nameInput && currentAccount?.username) nameInput.value = currentAccount.username;
    if (typeof hideProfileModal === "function") hideProfileModal();
    showLeaderboardModal();
    saveToLeaderboard();
}

function renderLeaderboard() {
    const listEl = document.getElementById("leaderboard-list");
    if (!listEl) return;
    const leaderboard = MMWG_STORAGE.getLeaderboard();
    if (leaderboard.length === 0) {
        listEl.innerHTML = "<div style='text-align:center; padding:20px; color:#888;'>暂无记录</div>";
        return;
    }
    listEl.innerHTML = leaderboard.map((record, index) => {
        const rank = index + 1;
        const rankClass = rank <= 3 ? `rank-${rank}` : "";
        const rankIcon = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank;
        const dateStr = new Date(record.date).toLocaleDateString("zh-CN", {
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        });
        return `
            <div class="leaderboard-item ${rankClass}">
                <div class="leaderboard-rank leaderboard-rank-${rank}">${rankIcon}</div>
                <div class="leaderboard-name">${escapeHtml(record.name)}</div>
                <div class="leaderboard-stats">
                    <span class="leaderboard-score">${record.score}分</span>
                    <span class="leaderboard-words">📚${record.wordsLearned}</span>
                </div>
                <div class="leaderboard-date">${dateStr}</div>
            </div>
        `;
    }).join("");
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
