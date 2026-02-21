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
}

function ensureStartOverlayContent() {
    const text = document.getElementById("overlay-text");
    if (!text) return;
    if (document.getElementById("overlay-start")) return;
    text.innerHTML = `
        <div class="overlay-start" id="overlay-start">
            <div class="overlay-page overlay-page-intro active" data-page="intro">
                <div class="overlay-intro-title">Minecraft 单词游戏</div>
                <div class="overlay-intro-sub">在冒险中学习单词，闯关解锁更多词库与装备。</div>
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
                </div>
                <div class="overlay-hints-title">操作说明</div>
                <div class="overlay-hints-text">${START_OVERLAY_HINT_HTML}</div>
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
    pausedByModal = true;
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
        pausedByModal = true;
    } else {
        paused = false;
        pausedByModal = false;
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
    paused = false;
    pausedByModal = false;
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
    modal.classList.add("visible");
    modal.setAttribute("aria-hidden", "false");
    pausedByModal = true;
    paused = true;
}

function hideProfileModal() {
    if (!profileModalEl) return;
    profileModalEl.classList.remove("visible");
    profileModalEl.setAttribute("aria-hidden", "true");
    if (pausedByModal) {
        pausedByModal = false;
        paused = false;
    }
}

function renderAchievements() {
    if (!achievementsContainerEl) return;
    achievementsContainerEl.innerHTML = "";
    const unlocked = new Set(currentAccount?.achievements?.unlocked || []);
    Object.values(ACHIEVEMENTS).forEach(achievement => {
        const div = document.createElement("div");
        const isUnlocked = unlocked.has(achievement.id);
        div.className = `achievement-item ${isUnlocked ? "unlocked" : "locked"}`;
        div.innerHTML = `
            <div class="achievement-icon">${isUnlocked ? achievement.icon : "🔒"}</div>
            <div class="achievement-content">
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.desc}</div>
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
    if (btnClose) btnClose.addEventListener("click", hideProfileModal);
    if (btnSaveLeaderboard) {
        btnSaveLeaderboard.addEventListener("click", () => {
            if (typeof saveCurrentProgress === "function") saveCurrentProgress();
            if (typeof saveProfileScoreToLeaderboard === "function") saveProfileScoreToLeaderboard();
        });
    }
    if (modal) {
        modal.addEventListener("click", e => {
            if (e.target === modal) hideProfileModal();
        });
    }
}
