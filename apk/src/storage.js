const ACCOUNT_SCHEMA = {
    id: "",
    username: "",
    avatar: "default",
    createdAt: 0,
    lastLoginAt: 0,
    totalPlayTime: 0,
    progress: {
        currentLevel: 1,
        highScore: 0,
        totalScore: 0,
        totalCoins: 0,
        currentCoins: 0,
        currentDiamonds: 0
    },
    vocabulary: {
        learnedWords: [],
        masteredWords: [],
        wordStats: {},
        completedPacks: [],
        currentPack: "",
        packProgress: {}
    },
    achievements: {
        unlocked: [],
        progress: {}
    },
    inventory: {
        items: {},
        equipment: {
            armor: null,
            armorDurability: 0
        },
        armorCollection: []
    },
    stats: {
        gamesPlayed: 0,
        enemiesKilled: 0,
        chestsOpened: 0,
        wordsCollected: 0,
        deathCount: 0,
        maxCombo: 0,
        longestRun: 0
    }
};

function clone(value) {
    try {
        return JSON.parse(JSON.stringify(value));
    } catch {
        return value;
    }
}

window.MMWG_STORAGE = {
    loadJson(key, fallback) {
        try {
            const raw = window.localStorage.getItem(key);
            if (!raw) return clone(fallback);
            return JSON.parse(raw);
        } catch {
            return clone(fallback);
        }
    },
    saveJson(key, value) {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch {
            console.warn("Storage save failed:", key);
        }
    },
    getAccountList() {
        return this.loadJson("mmwg_accounts", []);
    },
    saveAccountList(accounts) {
        this.saveJson("mmwg_accounts", accounts);
    },
    getCurrentAccountId() {
        try {
            return window.localStorage.getItem("mmwg_current_account") || null;
        } catch {
            return null;
        }
    },
    setCurrentAccountId(id) {
        try {
            if (id) {
                window.localStorage.setItem("mmwg_current_account", id);
            } else {
                window.localStorage.removeItem("mmwg_current_account");
            }
        } catch {
            console.warn("Storage save failed: mmwg_current_account");
        }
    },
    getAccount(id) {
        const list = this.getAccountList();
        return list.find(a => a.id === id) || null;
    },
    saveAccount(account) {
        const accounts = this.getAccountList();
        const idx = accounts.findIndex(a => a.id === account.id);
        if (idx >= 0) {
            accounts[idx] = clone(account);
        } else {
            accounts.push(clone(account));
        }
        this.saveAccountList(accounts);
    },
    deleteAccount(id) {
        let accounts = this.getAccountList();
        accounts = accounts.filter(a => a.id !== id);
        this.saveAccountList(accounts);
        if (this.getCurrentAccountId() === id) {
            this.setCurrentAccountId(null);
        }
    },
    createAccount(username) {
        const id = `account_${Date.now()}`;
        const account = {
            ...clone(ACCOUNT_SCHEMA),
            id,
            username,
            createdAt: Date.now(),
            lastLoginAt: Date.now()
        };
        this.saveAccount(account);
        return account;
    },
    // Leaderboard functions
    getLeaderboard() {
        return this.loadJson("mmwg_leaderboard", []);
    },
    saveToLeaderboard(record) {
        const leaderboard = this.getLeaderboard();
        leaderboard.push({
            ...record,
            id: `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
        // Sort by score descending, keep top 100
        leaderboard.sort((a, b) => b.score - a.score);
        const trimmed = leaderboard.slice(0, 100);
        this.saveJson("mmwg_leaderboard", trimmed);
        return trimmed;
    },
    clearLeaderboard() {
        this.saveJson("mmwg_leaderboard", []);
    }
};
