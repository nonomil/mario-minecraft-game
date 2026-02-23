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

function setOverlay(visible, mode) {
    const overlay = document.getElementById("screen-overlay");
    if (!overlay) return;
    const title = document.getElementById("overlay-title");
    const text = document.getElementById("overlay-text");
    const btn = document.getElementById("btn-overlay-action");
    const btnSkip = document.getElementById("btn-overlay-skip");
    const btnPick = document.getElementById("btn-overlay-pick-account");
    const btnScoreRevive = document.getElementById("btn-overlay-score-revive");
    const btnWrap = overlay.querySelector(".overlay-buttons");
    if (visible) {
        overlay.classList.add("visible");
        overlay.setAttribute("aria-hidden", "false");
        overlayMode = mode || "pause";
        if (mode === "start") {
            startOverlayActive = true;
            clearStartOverlayTimer();
            if (title) title.innerText = "Minecraft ????";
            if (text) text.innerHTML = START_OVERLAY_HINT_HTML;
            if (btn) btn.style.display = "none";
            if (btnScoreRevive) btnScoreRevive.style.display = "none";
            const btnLeaderboard = document.getElementById("btn-overlay-leaderboard");
            if (btnLeaderboard) btnLeaderboard.style.display = "none";
            if (btnSkip) btnSkip.style.display = "block";
            if (btnPick) btnPick.style.display = "block";
            if (btnWrap) btnWrap.classList.add("overlay-buttons-duo");
        } else if (mode === "pause") {
            if (title) title.innerText = "已暂停";
            if (text) text.innerHTML = START_OVERLAY_HINT_HTML;
            if (btn) btn.innerText = "继续";
            if (btnScoreRevive) btnScoreRevive.style.display = "none";
            if (btn) btn.style.display = "block";
            if (btnSkip) btnSkip.style.display = "none";
            if (btnPick) btnPick.style.display = "none";
            if (btnWrap) btnWrap.classList.remove("overlay-buttons-duo");

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
            if (btnScoreRevive) btnScoreRevive.style.display = "none";
            if (btn) btn.style.display = "block";
            if (btnSkip) btnSkip.style.display = "none";
            if (btnPick) btnPick.style.display = "none";
            if (btnWrap) btnWrap.classList.remove("overlay-buttons-duo");

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
                    `🏅 玩家等级: ${level}` +
                    getSessionWordSummaryHtml();
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
            // Show leaderboard button on gameover
            const btnLeaderboard = document.getElementById("btn-overlay-leaderboard");
            if (btnLeaderboard) btnLeaderboard.style.display = "block";
            if (btnSkip) btnSkip.style.display = "none";
            if (btnPick) btnPick.style.display = "none";
            if (btnWrap) btnWrap.classList.remove("overlay-buttons-duo");
        } else {
            if (title) title.innerText = "准备开始";
            if (text) text.innerHTML = START_OVERLAY_HINT_HTML;
            if (btn) btn.innerText = "开始游戏";
            if (btnScoreRevive) btnScoreRevive.style.display = "none";
            if (btn) btn.style.display = "block";
            if (btnSkip) btnSkip.style.display = "none";
            if (btnPick) btnPick.style.display = "none";
            if (btnWrap) btnWrap.classList.remove("overlay-buttons-duo");
        }
    } else {
        overlay.classList.remove("visible");
        overlay.setAttribute("aria-hidden", "true");
        if (overlayMode === "start") {
        if (!startedOnce) {
            bootGameLoopIfNeeded();
        } else {
            paused = false;
            pausedByModal = false;
            setOverlay(false);
        }
    } else if (overlayMode === "gameover") {
        if (getDiamondCount() >= 10) {
            inventory.diamond -= 10;
            playerHp = playerMaxHp;
            updateHpUI();
            updateDiamondUI();
            paused = false;
            pausedByModal = false;
            startedOnce = true;
            setOverlay(false);
        } else {
            initGame();
            paused = false;
            pausedByModal = false;
            startedOnce = true;
            setOverlay(false);
        }
    } else if (overlayMode === "error") {
        try {
            location.reload();
        } catch {
            initGame();
            paused = false;
            pausedByModal = false;
            startedOnce = true;
            setOverlay(false);
        }
    } else {
        paused = false;
        pausedByModal = false;
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
