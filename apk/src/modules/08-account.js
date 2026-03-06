/**
 * 08-account.js - 账号系统、登录、成就
 * 从 main.js 拆分 (原始行 1621-2101)
 */
function clearStartOverlayTimer() {
    if (startOverlayTimer) {
        clearTimeout(startOverlayTimer);
        startOverlayTimer = 0;
    }
}

function setStartOverlayPage(page) {
    const root = document.getElementById("overlay-start");
    if (!root) return;
    root.querySelectorAll(".overlay-page").forEach(el => {
        const active = el.dataset.page === page;
        el.classList.toggle("active", active);
    });
    const title = document.getElementById("overlay-title");
    if (title) title.innerText = page === "intro" ? "Minecraft 单词游戏" : "选择档案";
    if (typeof updateStartOverlayButtons === "function") updateStartOverlayButtons();
}

function ensureStartOverlayContent() {
    const text = document.getElementById("overlay-text");
    if (!text) return;
    if (document.getElementById("overlay-start")) return;
    text.innerHTML = `
        <div class="overlay-start" id="overlay-start">
                        <div class="overlay-page overlay-page-intro active" data-page="intro">
                <div class="overlay-intro-sub">在冒险中学习单词，闯关解锁更多词库与装备。挑战关卡，获取奖励与新武器。</div>
                <div class="overlay-section">
                    <div class="overlay-section-title">🎮 操作说明</div>
                    <div class="overlay-key-row">
                        <span>⬅️ ➡️ 移动</span>
                        <span>⬆️ 跳跃（可二段跳）</span>
                    </div>
                    <div class="overlay-key-row">
                        <span>⚔️ J 攻击</span>
                        <span>🔄 K 切换武器</span>
                    </div>
                    <div class="overlay-key-row">
                        <span>💎 Z 使用钻石</span>
                        <span>📦 Y 互动/开箱</span>
                    </div>
                </div>
                <div class="overlay-section">
                    <div class="overlay-section-title">⚙️ 温馨提示</div>
                    <div class="overlay-hints-text">游戏速度、单词词库选择、学习设置等均可在右上角 ⚙️ 设置 中调整。</div>
                </div>
            </div>
            <div class="overlay-page overlay-page-setup" data-page="setup">
                <div class="overlay-account">
                    <div class="overlay-account-title">输入档案</div>
                    <div class="overlay-account-row">
                        <input class="overlay-input" id="overlay-username-input" type="text" placeholder="输入昵称/档案名" maxlength="20">
                        <button class="game-btn game-btn-small" id="btn-overlay-create">创建/进入</button>
                    </div>
                    <div class="overlay-account-hint">已有档案：选择继续/重玩/删除</div>
                    <div id="overlay-accounts-container" class="account-list"></div>

                    <!-- Language Mode Selection -->
                    <div id="overlay-language-mode-selection" class="overlay-language-mode-selection" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                        <div style="text-align:center;margin-bottom:12px;color:#ccc;font-size:14px;">🌍 选择学习模式</div>
                        <div style="display:flex;gap:12px;justify-content:center;">
                            <button class="game-btn game-btn-small" id="btn-overlay-language-english" style="flex:1;">🇬🇧 英语学习</button>
                            <button class="game-btn game-btn-small" id="btn-overlay-language-chinese" style="flex:1;">🇨🇳 汉字学习</button>
                        </div>
                        <div id="overlay-language-current" style="text-align:center;margin-top:8px;font-size:12px;color:#999;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderStartOverlayAccounts() {
    const container = document.getElementById("overlay-accounts-container");
    if (!container) return;
    const storedId = storage.getCurrentAccountId();
    const accounts = storage.getAccountList();
    const sortedAccounts = [...accounts].sort((a, b) => {
        if (a.id === storedId) return -1;
        if (b.id === storedId) return 1;
        return 0;
    });
    renderAccountList(container, sortedAccounts, storedId);
}

function wireStartOverlayAccountActions() {
    const input = document.getElementById("overlay-username-input");
    const btn = document.getElementById("btn-overlay-create");
    if (btn) {
        btn.addEventListener("click", () => {
            const username = (input?.value || "").trim();
            if (!username) {
                showToast("请输入用户名");
                input?.focus();
                return;
            }
            const existing = storage.getAccountList().find(a => a.username === username);
            const account = existing || storage.createAccount(username);
            loginWithAccount(account, { mode: "continue" });
            renderStartOverlayAccounts();
        });
    }
    if (input) {
        input.addEventListener("keydown", e => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            btn?.click();
        });
    }

    // Wire language mode selection buttons
    const enBtn = document.getElementById("btn-overlay-language-english");
    const zhBtn = document.getElementById("btn-overlay-language-chinese");
    const currentDisplay = document.getElementById("overlay-language-current");

    const updateLanguageModeDisplay = () => {
        const mode = settings?.languageMode || "english";
        if (currentDisplay) {
            currentDisplay.innerText = mode === "chinese" ? "当前：汉字学习" : "当前：英语学习";
        }
        if (enBtn) {
            enBtn.style.opacity = mode === "english" ? "1" : "0.6";
            enBtn.style.fontWeight = mode === "english" ? "bold" : "normal";
        }
        if (zhBtn) {
            zhBtn.style.opacity = mode === "chinese" ? "1" : "0.6";
            zhBtn.style.fontWeight = mode === "chinese" ? "bold" : "normal";
        }
    };

    if (enBtn) {
        enBtn.addEventListener("click", () => {
            if (settings) {
                settings.languageMode = "english";
                if (typeof saveSettings === "function") saveSettings();
                updateLanguageModeDisplay();
                showToast("已切换到英语学习模式");
            }
        });
    }

    if (zhBtn) {
        zhBtn.addEventListener("click", () => {
            if (settings) {
                settings.languageMode = "chinese";
                if (typeof saveSettings === "function") saveSettings();
                updateLanguageModeDisplay();
                showToast("已切换到汉字学习模式");
            }
        });
    }

    updateLanguageModeDisplay();
}

function updateStartOverlayActionState() {
    const btn = document.getElementById("btn-overlay-action");
    startOverlayReady = !!currentAccount;
    if (!btn) return;
    btn.disabled = !startOverlayReady;
    btn.innerText = startOverlayReady ? "开始游戏" : "请先选择档案";
}

function isStartOverlayVisible() {
    const overlay = document.getElementById("screen-overlay");
    return !!overlay && overlay.classList.contains("visible") && overlayMode === "start";
}

async function initLoginScreen() {
    const screen = document.getElementById("login-screen");
    if (!screen) return;
    const loginForm = document.getElementById("login-form");
    const accountList = document.getElementById("account-list");
    const accountsContainer = document.getElementById("accounts-container");
    const usernameInput = document.getElementById("username-input");
    const btnLogin = document.getElementById("btn-login");
    const btnNewAccount = document.getElementById("btn-new-account");
    const storedId = storage.getCurrentAccountId();
    const accounts = storage.getAccountList();
    const sortedAccounts = [...accounts].sort((a, b) => {
        if (a.id === storedId) return -1;
        if (b.id === storedId) return 1;
        return 0;
    });

    renderAccountList(accountsContainer, sortedAccounts, storedId);
    if (accounts.length) {
        loginForm.style.display = "none";
        accountList.style.display = "block";
    } else {
        loginForm.style.display = "block";
        accountList.style.display = "none";
    }

    ensureStartOverlayContent();
    renderStartOverlayAccounts();
    wireStartOverlayAccountActions();
    screen.classList.remove("visible");
    paused = true;
    if (typeof clearModalPauseStack === "function") clearModalPauseStack(false);
    setOverlay(true, "start");

    if (btnLogin) {
        btnLogin.addEventListener("click", () => {
            const username = (usernameInput?.value || "").trim();
            if (!username) {
                showToast("请输入用户名");
                return;
            }
            const existing = storage.getAccountList().find(a => a.username === username);
            const account = existing || storage.createAccount(username);
            loginWithAccount(account, { mode: "continue" });
        });
    }

    if (btnNewAccount) {
        btnNewAccount.addEventListener("click", () => {
            loginForm.style.display = "block";
            accountList.style.display = "none";
        });
    }
}

function renderAccountList(container, accounts, storedId) {
    if (!container) return;
    container.innerHTML = "";
    if (!accounts.length) {
        container.innerHTML = "<div class=\"account-empty\">暂无账号</div>";
        return;
    }
    accounts.forEach(account => {
        const div = document.createElement("div");
        div.className = "account-item";
        div.innerHTML = `
            <div class="account-avatar">用户</div>
            <div class="account-info">
                <div class="account-name">${account.username}${storedId && account.id === storedId ? ' <span style="opacity:.7;font-weight:700;">(上次)</span>' : ""}</div>
                <div class="account-stats">
                    最高分: ${account.progress?.highScore || 0} · 已学: ${account.vocabulary?.learnedWords?.length || 0}
                </div>
            </div>
            <div style="display:flex; gap:8px; align-items:center;">
                <button class="game-btn game-btn-small btn-account-continue" data-id="${account.id}">继续</button>
                <button class="game-btn game-btn-small game-btn-danger btn-account-restart" data-id="${account.id}">重玩</button>
                <button class="game-btn game-btn-small btn-delete-account" data-id="${account.id}">删除</button>
            </div>
        `;

        div.querySelector(".account-info")?.addEventListener("click", () => loginWithAccount(account, { mode: "continue" }));
        div.querySelector(".btn-account-continue")?.addEventListener("click", e => {
            e.stopPropagation();
            loginWithAccount(account, { mode: "continue" });
        });
        div.querySelector(".btn-account-restart")?.addEventListener("click", e => {
            e.stopPropagation();
            if (!confirm(`确定重玩 "${account.username}" 吗？\n将清空本账号的金币/背包/装备，但保留已学单词与成就。`)) return;
            loginWithAccount(account, { mode: "restart" });
        });

        const del = div.querySelector(".btn-delete-account");
        del?.addEventListener("click", e => {
            e.stopPropagation();
            if (confirm(`确定删除账号 "${account.username}" 吗？`)) {
                storage.deleteAccount(account.id);
                renderAccountList(container, storage.getAccountList(), storage.getCurrentAccountId());
            }
        });

        container.appendChild(div);
    });
}

function resetAccountRunState(account) {
    if (!account) return;
    account.progress = account.progress || {};
    account.progress.currentCoins = 0;
    account.progress.currentDiamonds = 0;

    account.inventory = account.inventory || {};
    account.inventory.items = { ...INVENTORY_TEMPLATE };
    account.inventory.equipment = { armor: null, armorDurability: 0 };
    account.inventory.armorCollection = [];
}

async function loginWithAccount(account, options) {
    if (!account) return;
    const mode = options && options.mode ? options.mode : "continue";
    if (mode === "restart") {
        if (typeof saveCurrentProgress === "function") saveCurrentProgress();
        resetAccountRunState(account);
        storage.saveAccount(account);
    }
    stopAutoSave();
    currentAccount = account;
    currentAccount.lastLoginAt = Date.now();
    storage.setCurrentAccountId(account.id);
    storage.saveAccount(currentAccount);
    loadAccountData(account);
    const startOverlayVisible = isStartOverlayVisible();
    const screen = document.getElementById("login-screen");
    if (screen) {
        screen.classList.remove("visible");
    }
    if (startOverlayVisible) {
        paused = true;
        if (typeof clearModalPauseStack === "function") clearModalPauseStack(false);
    } else {
        if (typeof clearModalPauseStack === "function") clearModalPauseStack(true);
        else paused = false;
    }
    showToast(`欢迎回来 ${account.username}`);
    startAutoSave();
    await setActiveVocabPack(settings.vocabSelection || "auto");
    clearOldWordItems();

    updateStartOverlayActionState();
    // If start() already finished wiring handlers, boot the game loop on first successful login.
    if (bootReady && !startOverlayVisible) bootGameLoopIfNeeded();
}

function bootGameLoopIfNeeded() {
    if (startedOnce) return;
    applySettingsToUI();
    initGame();
    updateWordUI(null);
    if (typeof clearModalPauseStack === "function") clearModalPauseStack(true);
    else paused = false;
    startedOnce = true;
    viewportIgnoreUntilMs = nowMs() + 3000;
    setOverlay(false);
    showToast("冒险开始！");

    // Guard: if groundY is off-screen (viewport not ready), defer start
    if (groundY <= 0 || groundY >= canvas.height) {
        console.warn('bootGameLoopIfNeeded: groundY out of bounds, scheduling retry', { groundY, canvasHeight: canvas.height });
        startedOnce = false;
        paused = true;
        requestAnimationFrame(() => {
            applySettingsToUI();
            bootGameLoopIfNeeded();
        });
        return;
    }

    update();
    draw();
}

function loadAccountData(account) {
    score = account?.progress?.currentCoins || 0;
    levelScore = 0;
    progress = normalizeProgress({
        vocab: (account.vocabulary && account.vocabulary.packProgress) ? account.vocabulary.packProgress : {}
    });
    if (account.vocabulary?.currentPack) {
        settings.vocabSelection = account.vocabulary.currentPack;
    }
    inventory = { ...INVENTORY_TEMPLATE, ...(account.inventory?.items || {}) };
    playerEquipment = account.inventory?.equipment ? { ...account.inventory.equipment } : { armor: null, armorDurability: 0 };
    armorInventory = Array.isArray(account.inventory?.armorCollection) ? [...account.inventory.armorCollection] : [];
    updateInventoryUI();
    updateArmorUI();
    const scoreEl = document.getElementById("score");
    if (scoreEl) scoreEl.innerText = score;
    updateVocabProgressUI();
    updateVocabPreview(settings.vocabSelection);
    if (player) {
        applyMotionToPlayer(player);
    }
}

function startAutoSave() {
    stopAutoSave();
    lastSaveTime = Date.now();
    autoSaveInterval = setInterval(() => {
        saveCurrentProgress();
    }, 30000);
}

function stopAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
    }
}

function saveCurrentProgress() {
    if (!currentAccount) return;
    const now = Date.now();
    const delta = Math.max(0, Math.floor((now - lastSaveTime) / 1000));
    lastSaveTime = now;
    currentAccount.totalPlayTime += delta;
    currentAccount.lastLoginAt = now;
    currentAccount.progress = currentAccount.progress || {};
    currentAccount.progress.currentCoins = score;
    currentAccount.progress.currentDiamonds = inventory.diamond || 0;
    currentAccount.vocabulary = currentAccount.vocabulary || {};
    currentAccount.vocabulary.packProgress = progress.vocab || {};
    currentAccount.vocabulary.currentPack = settings.vocabSelection || "";
    currentAccount.inventory = currentAccount.inventory || {};
    currentAccount.inventory.items = { ...inventory };
    currentAccount.inventory.equipment = { ...playerEquipment };
    currentAccount.inventory.armorCollection = [...armorInventory];
    storage.saveAccount(currentAccount);
}

function onWordCollected(wordObj) {
    if (!currentAccount || !wordObj?.en) return;
    if (!currentAccount.vocabulary) currentAccount.vocabulary = { learnedWords: [], packProgress: {}, currentPack: "" };
    const known = currentAccount.vocabulary.learnedWords || [];
    if (!known.includes(wordObj.en)) {
        known.push(wordObj.en);
        currentAccount.vocabulary.learnedWords = known;
        checkAchievement("words", known.length);
    }
    currentAccount.stats = currentAccount.stats || {};
    currentAccount.stats.wordsCollected = (currentAccount.stats.wordsCollected || 0) + 1;
    checkAchievement("score", score);
    saveCurrentProgress();
}

function onEnemyKilled() {
    if (!currentAccount) return;
    currentAccount.stats = currentAccount.stats || {};
    currentAccount.stats.enemiesKilled = (currentAccount.stats.enemiesKilled || 0) + 1;
    checkAchievement("enemies", currentAccount.stats.enemiesKilled);
    saveCurrentProgress();
}

function onChestOpened() {
    if (!currentAccount) return;
    currentAccount.stats = currentAccount.stats || {};
    currentAccount.stats.chestsOpened = (currentAccount.stats.chestsOpened || 0) + 1;
    checkAchievement("chests", currentAccount.stats.chestsOpened);
    saveCurrentProgress();
}

function onGameOver() {
    if (!currentAccount) return;
    currentAccount.stats = currentAccount.stats || {};
    currentAccount.stats.gamesPlayed = (currentAccount.stats.gamesPlayed || 0) + 1;
    currentAccount.stats.deathCount = (currentAccount.stats.deathCount || 0) + 1;
    currentAccount.progress = currentAccount.progress || {};
    currentAccount.progress.totalScore = (currentAccount.progress.totalScore || 0) + score;
    if (score > (currentAccount.progress.highScore || 0)) {
        currentAccount.progress.highScore = score;
        showToast(`新纪录！当前积分 ${score}`);
    }
    checkAchievement("score", score);
    saveCurrentProgress();
}

function checkAchievement(type, value) {
    if (!currentAccount) return;
    const relevant = ACHIEVEMENT_MAP[type] || [];
    relevant.forEach(id => {
        if (currentAccount.achievements?.unlocked?.includes(id)) return;
        const achievement = ACHIEVEMENTS[id];
        if (!achievement) return;
        if (value >= (achievement.target || 0)) {
            unlockAchievement(id);
        }
    });
}

function unlockAchievement(id) {
    if (!currentAccount) return;
    if (!currentAccount.achievements) {
        currentAccount.achievements = { unlocked: [], progress: {} };
    }
    if (currentAccount.achievements.unlocked.includes(id)) return;
    const achievement = ACHIEVEMENTS[id];
    if (!achievement) return;
    currentAccount.achievements.unlocked.push(id);
    storage.saveAccount(currentAccount);
    showAchievementUnlock(achievement);
}

function showAchievementUnlock(achievement) {
    const popup = document.createElement("div");
    popup.className = "achievement-popup";
    popup.innerHTML = `
        <div class="achievement-icon">${achievement.icon || "⭐"}</div>
        <div class="achievement-info">
            <div class="achievement-title">成就解锁</div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-desc">${achievement.desc}</div>
        </div>
    `;
    document.body.appendChild(popup);
    setTimeout(() => popup.classList.add("show"), 100);
    setTimeout(() => {
        popup.classList.remove("show");
        setTimeout(() => popup.remove(), 400);
    }, 3200);
}

function showProfileModal() {
    if (!currentAccount) return;
    const modal = document.getElementById("profile-modal");
    if (!modal) return;
    profileModalEl = modal;
    profileUsernameEl = document.getElementById("profile-username");
    profilePlaytimeEl = document.getElementById("profile-playtime");
    profileHighscoreEl = document.getElementById("profile-highscore");
    profileWordsEl = document.getElementById("profile-words");
    profileGamesEl = document.getElementById("profile-games");
    achievementsContainerEl = document.getElementById("achievements-container");
    if (profileUsernameEl) profileUsernameEl.innerText = currentAccount.username;
    if (profilePlaytimeEl) profilePlaytimeEl.innerText = formatPlayTime(currentAccount.totalPlayTime || 0);
    if (profileHighscoreEl) profileHighscoreEl.innerText = currentAccount.progress?.highScore || 0;
    if (profileWordsEl) profileWordsEl.innerText = currentAccount.vocabulary?.learnedWords?.length || 0;
    if (profileGamesEl) profileGamesEl.innerText = currentAccount.stats?.gamesPlayed || 0;
    renderAchievements();
    const learningPanelEl = document.getElementById("learning-stats-panel");
    if (learningPanelEl) learningPanelEl.innerHTML = renderLearningStats(currentAccount);

    // Wire weak words practice button after rendering
    const btnWeakWordsPractice = document.getElementById("btn-weak-words-practice");
    if (btnWeakWordsPractice) {
        btnWeakWordsPractice.addEventListener("click", () => {
            showToast("弱词专项练习功能即将上线");
        });
    }

    modal.classList.add("visible");
    modal.setAttribute("aria-hidden", "false");
    if (typeof pushPause === "function") pushPause();
    else paused = true;
}

function hideProfileModal() {
    if (!profileModalEl) return;
    profileModalEl.classList.remove("visible");
    profileModalEl.setAttribute("aria-hidden", "true");
    if (typeof popPause === "function") popPause();
    else paused = false;
}

function renderAchievements() {
    if (!achievementsContainerEl) return;
    achievementsContainerEl.innerHTML = "";
    const unlocked = new Set(currentAccount?.achievements?.unlocked || []);
    Object.values(ACHIEVEMENTS).forEach(achievement => {
        const div = document.createElement("div");
        const isUnlocked = unlocked.has(achievement.id);
        const progress = getAchievementProgress(achievement.id, currentAccount?.stats || {});
        div.className = `achievement-item ${isUnlocked ? "unlocked" : "locked"}`;
        div.innerHTML = `
            <div class="achievement-icon">${isUnlocked ? achievement.icon : "🔒"}</div>
            <div class="achievement-content">
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.desc}</div>
                ${!isUnlocked && progress ? `
                <div class="ach-progress-bar"><div class="ach-progress-fill" style="width:${progress.percent}%"></div></div>
                <div class="ach-progress-text">${progress.current} / ${progress.target}</div>
                ` : ""}
            </div>
        `;
        achievementsContainerEl.appendChild(div);
    });
}

function formatPlayTime(seconds) {
    const totalMinutes = Math.floor(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
        return `${hours}小时 ${minutes} 分钟`;
    }
    return `${minutes} 分钟`;
}

function wireProfileModal() {
    const modal = document.getElementById("profile-modal");
    const btnClose = document.getElementById("btn-profile-close");
    const btnSaveLeaderboard = document.getElementById("btn-profile-save-leaderboard");
    const btnExportSave = document.getElementById("btn-export-save");
    const btnImportSave = document.getElementById("btn-import-save");
    const btnProfileExportSave = document.getElementById("btn-profile-export-save");
    const btnProfileImportSave = document.getElementById("btn-profile-import-save");
    if (btnClose) btnClose.addEventListener("click", hideProfileModal);
    if (btnSaveLeaderboard) {
        btnSaveLeaderboard.addEventListener("click", () => {
            if (typeof saveCurrentProgress === "function") saveCurrentProgress();
            if (typeof saveProfileScoreToLeaderboard === "function") saveProfileScoreToLeaderboard();
        });
    }
    if (btnExportSave) btnExportSave.addEventListener("click", handleExportSave);
    if (btnImportSave) btnImportSave.addEventListener("click", handleImportSave);
    if (btnProfileExportSave) btnProfileExportSave.addEventListener("click", handleExportSave);
    if (btnProfileImportSave) btnProfileImportSave.addEventListener("click", handleImportSave);
    if (modal) {
        modal.addEventListener("click", e => {
            if (e.target === modal) hideProfileModal();
        });
    }
}

// --- Save Progress Modal ---

function showSaveProgressModal() {
    const modal = document.getElementById("save-progress-modal");
    if (!modal) return;
    const nameRow = document.getElementById("save-progress-name-row");
    const inputRow = document.getElementById("save-progress-input-row");
    const nameInput = document.getElementById("save-progress-name-input");
    const nameEl = document.getElementById("save-progress-name");
    const scoreEl = document.getElementById("save-progress-score");
    const wordsEl = document.getElementById("save-progress-words");
    const diamondsEl = document.getElementById("save-progress-diamonds");
    if (currentAccount) {
        if (nameRow) nameRow.style.display = "";
        if (inputRow) inputRow.style.display = "none";
        if (nameEl) nameEl.innerText = currentAccount.username;
    } else {
        if (nameRow) nameRow.style.display = "none";
        if (inputRow) inputRow.style.display = "";
        if (nameInput) nameInput.value = "";
    }
    if (scoreEl) scoreEl.innerText = score;
    if (wordsEl) wordsEl.innerText = currentAccount?.vocabulary?.learnedWords?.length || 0;
    if (diamondsEl) diamondsEl.innerText = inventory.diamond || 0;
    const btnViewProfile = document.getElementById("btn-save-view-profile");
    if (btnViewProfile) btnViewProfile.style.display = currentAccount ? "" : "none";
    modal.classList.add("visible");
    modal.setAttribute("aria-hidden", "false");
    if (typeof pushPause === "function") pushPause();
    else paused = true;
    if (!currentAccount && nameInput) setTimeout(() => nameInput.focus(), 100);
}

function hideSaveProgressModal() {
    const modal = document.getElementById("save-progress-modal");
    if (!modal) return;
    modal.classList.remove("visible");
    modal.setAttribute("aria-hidden", "true");
    if (typeof popPause === "function") popPause();
    else paused = false;
}

function confirmSaveProgress() {
    if (!currentAccount) {
        const nameInput = document.getElementById("save-progress-name-input");
        const username = (nameInput?.value || "").trim();
        if (!username) {
            showToast("请输入档案名");
            nameInput?.focus();
            return;
        }
        const existing = storage.getAccountList().find(a => a.username === username);
        const account = existing || storage.createAccount(username);
        loginWithAccount(account, { mode: "continue" });
    }
    saveCurrentProgress();
    showToast("💾 进度已保存");
    hideSaveProgressModal();
}

// --- First-launch vocab prompt helpers ---

function hasSeenVocabPrompt() {
    try { return window.localStorage.getItem("mmwg:vocabPromptSeen") === "1"; }
    catch { return false; }
}

function markVocabPromptSeen() {
    try { window.localStorage.setItem("mmwg:vocabPromptSeen", "1"); }
    catch {}
}

function handleExportSave() {
    if (typeof exportSaveCode !== "function") {
        alert("当前版本不支持导出存档码");
        return;
    }
    const code = exportSaveCode();
    if (!code) {
        alert("导出失败，请重试");
        return;
    }
    navigator.clipboard.writeText(code).then(() => {
        showToast("存档码已复制到剪贴板");
    }).catch(() => {
        prompt("请复制以下存档码：", code);
    });
}

function handleImportSave() {
    if (typeof importSaveCode !== "function") {
        alert("当前版本不支持导入存档码");
        return;
    }
    const code = prompt("请粘贴存档码：");
    if (!code) return;
    try {
        importSaveCode(code);
        alert("导入成功，页面将刷新。");
        location.reload();
    } catch {
        alert("存档码无效，请检查后重试。");
    }
}

function getWeakWords(wordStats, limit = 5) {
    const rows = Object.entries(wordStats || {}).map(([word, stat]) => {
        const correct = Number(stat?.correct) || 0;
        const wrong = Number(stat?.wrong) || 0;
        const total = correct + wrong;
        const errorRate = total > 0 ? wrong / total : 0;
        return { word, correct, wrong, errorRate };
    });
    return rows
        .filter(item => item.wrong > 0)
        .sort((a, b) => b.errorRate - a.errorRate)
        .slice(0, Math.max(1, limit));
}

function get7DayLearningTrend(account) {
    const dailyStats = account?.vocabulary?.dailyStats || {};
    const result = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const displayDate = `${date.getMonth() + 1}/${date.getDate()}`;
        const count = dailyStats[dateStr] || 0;
        result.push({ date: displayDate, count });
    }

    return result;
}

function getWeeklyStats(account) {
    const dailyStats = account?.vocabulary?.dailyStats || {};
    const wordStats = account?.vocabulary?.wordStats || {};
    const now = new Date();

    // 计算本周和上周的日期范围
    const dayOfWeek = now.getDay();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - dayOfWeek);
    thisWeekStart.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);

    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setDate(thisWeekStart.getDate() - 1);

    // 聚合本周数据
    let thisWeekWords = 0;
    let thisWeekCorrect = 0;
    let thisWeekWrong = 0;

    for (let d = new Date(thisWeekStart); d <= now; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        thisWeekWords += dailyStats[dateStr] || 0;
    }

    // 聚合上周数据
    let lastWeekWords = 0;
    let lastWeekCorrect = 0;
    let lastWeekWrong = 0;

    for (let d = new Date(lastWeekStart); d <= lastWeekEnd; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        lastWeekWords += dailyStats[dateStr] || 0;
    }

    // 计算正确率（从 wordStats 中获取，这里简化处理）
    Object.values(wordStats).forEach(stat => {
        thisWeekCorrect += Number(stat?.correct) || 0;
        thisWeekWrong += Number(stat?.wrong) || 0;
    });

    const thisWeekTotal = thisWeekCorrect + thisWeekWrong;
    const thisWeekAccuracy = thisWeekTotal > 0 ? Math.round((thisWeekCorrect / thisWeekTotal) * 100) : 0;

    return {
        thisWeek: { words: thisWeekWords, accuracy: thisWeekAccuracy },
        lastWeek: { words: lastWeekWords, accuracy: 0 }
    };
}

function renderLearningStats(account) {
    const stats = account?.vocabulary?.wordStats || {};
    const weak = getWeakWords(stats, 5);
    const learned = account?.vocabulary?.learnedWords?.length || 0;
    const mastered = Object.values(stats).filter(s => (Number(s?.correct) || 0) >= 3 && (Number(s?.wrong) || 0) === 0).length;

    // Task 1: 计算学习统计正确率
    let totalCorrect = 0;
    let totalWrong = 0;
    Object.values(stats).forEach(stat => {
        totalCorrect += Number(stat?.correct) || 0;
        totalWrong += Number(stat?.wrong) || 0;
    });
    const totalAttempts = totalCorrect + totalWrong;
    const accuracyPercent = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

    // Get challenge success count from progress
    const challengeSuccessCount = progress?.challengeSuccessCount || 0;

    // Task 2: 7天学习趋势
    const dailyLearning = get7DayLearningTrend(account);
    const trendHtml = dailyLearning.length > 0
        ? dailyLearning.map(day => (
            `<div class="trend-day-item">` +
            `<span class="trend-date">${day.date}</span>` +
            `<span class="trend-count">${day.count} 词</span>` +
            `</div>`
        )).join("")
        : `<div class="trend-empty">暂无学习记录</div>`;

    // Task 3: 本周 vs 上周对比
    const weeklyStats = getWeeklyStats(account);
    const thisWeek = weeklyStats.thisWeek;
    const lastWeek = weeklyStats.lastWeek;
    const hasLastWeekData = lastWeek.words > 0;

    let comparisonHtml = '';
    if (hasLastWeekData) {
        const wordsDiff = thisWeek.words - lastWeek.words;
        const wordsPercent = lastWeek.words > 0 ? Math.round((wordsDiff / lastWeek.words) * 100) : 0;
        const wordsDirection = wordsDiff >= 0 ? '↑' : '↓';
        const wordsChange = Math.abs(wordsPercent);

        comparisonHtml = (
            `<div class="weekly-comparison">` +
            `<div class="comparison-item">` +
            `本周学习 <strong>${thisWeek.words}</strong> 词 ` +
            `<span class="comparison-change ${wordsDiff >= 0 ? 'positive' : 'negative'}">${wordsDirection} ${wordsChange}%</span> vs 上周` +
            `</div>` +
            `</div>`
        );
    } else {
        comparisonHtml = `<div class="weekly-comparison">暂无对比数据</div>`;
    }

    const weakHtml = weak.length
        ? weak.map(item => (
            `<div class="weak-word-item">` +
            `<span>${item.word}</span>` +
            `<span class="error-rate">${Math.round(item.errorRate * 100)}%</span>` +
            `</div>`
        )).join("")
        : `<div class="weak-word-empty">暂无弱词，继续保持！</div>`;

    return (
        `<div class="stats-summary">` +
        `<div class="stat-card">已学 <strong>${learned}</strong></div>` +
        `<div class="stat-card">掌握 <strong>${mastered}</strong></div>` +
        `<div class="stat-card">正确率 <strong>${accuracyPercent}%</strong></div>` +
        `<div class="stat-card">挑战成功 <strong>${challengeSuccessCount}</strong></div>` +
        `</div>` +
        `<div class="trend-section">` +
        `<h3>最近7天学习</h3>` +
        trendHtml +
        comparisonHtml +
        `</div>` +
        `<div class="weak-words-section">` +
        `<h3>弱词清单</h3>` +
        weakHtml +
        `<button class="game-btn game-btn-small" id="btn-weak-words-practice" style="margin-top:12px;">🎯 弱词专项练习</button>` +
        `</div>`
    );
}

function getAchievementProgress(id, accountStats) {
    const def = ACHIEVEMENTS && ACHIEVEMENTS[id] ? ACHIEVEMENTS[id] : null;
    if (!def) return null;

    const mappedKey = def.metric || def.id || "";
    let currentRaw = 0;

    // 根据 metric 从不同的数据源获取当前值
    if (mappedKey === "learnedWords") {
        currentRaw = currentAccount?.vocabulary?.learnedWords?.length || 0;
    } else if (mappedKey === "highScore") {
        currentRaw = currentAccount?.progress?.highScore || 0;
    } else if (mappedKey === "learningStreak") {
        currentRaw = currentAccount?.stats?.learningStreak || 0;
    } else if (mappedKey === "perfectRuns") {
        currentRaw = currentAccount?.stats?.perfectRuns || 0;
    } else if (mappedKey === "nightSessions") {
        currentRaw = currentAccount?.stats?.nightSessions || 0;
    } else if (mappedKey === "armorCollected") {
        currentRaw = currentAccount?.inventory?.armorCollection?.length || 0;
    } else if (mappedKey === "diamondsCollected") {
        currentRaw = currentAccount?.stats?.diamondsCollected || 0;
    } else {
        // 默认从 accountStats 中获取
        currentRaw = Number(accountStats?.[mappedKey]) || 0;
    }

    const target = Math.max(1, Number(def.target) || 1);
    const current = Math.min(currentRaw, target);
    return { current, target, percent: Math.floor((current / target) * 100) };
}

window.handleExportSave = handleExportSave;
window.handleImportSave = handleImportSave;
window.getWeakWords = getWeakWords;
window.get7DayLearningTrend = get7DayLearningTrend;
window.getWeeklyStats = getWeeklyStats;
window.renderLearningStats = renderLearningStats;
window.getAchievementProgress = getAchievementProgress;

