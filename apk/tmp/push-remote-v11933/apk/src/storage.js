// Save version for migration support
const SAVE_VERSION = "1.0.0";

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
        // Create backup before saving
        const existing = this.getAccount(account.id);
        if (existing) {
            createBackup(account.id, existing);
        }

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

function exportSaveCode() {
    try {
        const data = {};
        Object.keys(window.localStorage || {}).forEach((key) => {
            if (!String(key).startsWith("mmwg")) return;
            data[key] = window.localStorage.getItem(key);
        });

        // Add version and timestamp
        const saveData = {
            version: SAVE_VERSION,
            timestamp: Date.now(),
            data: data
        };

        // Compress and encode
        const jsonStr = JSON.stringify(saveData);
        const compressed = compressSaveData(jsonStr);
        return btoa(encodeURIComponent(compressed));
    } catch (err) {
        console.warn("exportSaveCode failed", err);
        return "";
    }
}

function importSaveCode(code) {
    if (!code) throw new Error("empty code");

    try {
        const compressed = decodeURIComponent(atob(String(code).trim()));
        const jsonStr = decompressSaveData(compressed);
        let saveData = JSON.parse(jsonStr);

        // Migrate if needed
        saveData = migrateSaveData(saveData);

        // Apply save data
        const payload = saveData.data || saveData;
        if (!payload || typeof payload !== "object") {
            throw new Error("invalid payload");
        }

        Object.entries(payload).forEach(([key, value]) => {
            if (!String(key).startsWith("mmwg")) return;
            window.localStorage.setItem(key, String(value ?? ""));
        });

        return true;
    } catch (err) {
        console.error("importSaveCode failed", err);
        throw err;
    }
}

// Save data migration
function migrateSaveData(saveData) {
    // No version = v0 (old format)
    if (!saveData.version) {
        console.log("Migrating save from v0 to v1.0.0");
        return {
            version: SAVE_VERSION,
            timestamp: Date.now(),
            data: saveData
        };
    }

    // Current version
    if (saveData.version === SAVE_VERSION) {
        return saveData;
    }

    // Unsupported version
    throw new Error(`Unsupported save version: ${saveData.version}`);
}

// Simple compression (fallback to original if compression fails)
function compressSaveData(str) {
    try {
        // Use LZ-based compression if available
        if (typeof LZString !== 'undefined' && LZString.compress) {
            return LZString.compress(str);
        }
        // Fallback: no compression
        return str;
    } catch {
        return str;
    }
}

function decompressSaveData(str) {
    try {
        // Try LZ decompression
        if (typeof LZString !== 'undefined' && LZString.decompress) {
            const decompressed = LZString.decompress(str);
            if (decompressed) return decompressed;
        }
        // Fallback: assume uncompressed
        return str;
    } catch {
        return str;
    }
}

// LocalStorage quota detection
function checkStorageQuota() {
    try {
        const testKey = "__mmwg_quota_test__";
        const testSize = 1024 * 1024; // 1MB
        const testData = "x".repeat(testSize);

        window.localStorage.setItem(testKey, testData);
        window.localStorage.removeItem(testKey);

        return {
            available: true,
            estimated: "充足"
        };
    } catch (e) {
        return {
            available: false,
            error: e.message,
            estimated: "不足"
        };
    }
}

// Storage diagnostics
function diagnoseStorage() {
    const quota = checkStorageQuota();
    const keys = Object.keys(window.localStorage || {}).filter(k => k.startsWith("mmwg"));

    let totalSize = 0;
    keys.forEach(key => {
        const value = window.localStorage.getItem(key) || "";
        totalSize += key.length + value.length;
    });

    return {
        available: quota.available,
        quota: {
            used: totalSize,
            available: quota.available ? "充足" : "不足"
        },
        saves: {
            count: keys.length,
            totalSize: totalSize
        },
        issues: quota.available ? [] : ["LocalStorage 配额不足"]
    };
}

// Backup system
function createBackup(accountId, accountData) {
    try {
        const backupKey = `mmwg_backup_${accountId}`;
        const backups = JSON.parse(window.localStorage.getItem(backupKey) || "[]");

        const backup = {
            timestamp: Date.now(),
            data: clone(accountData),
            checksum: calculateChecksum(accountData)
        };

        backups.push(backup);

        // Keep only last 3 backups
        if (backups.length > 3) {
            backups.shift();
        }

        window.localStorage.setItem(backupKey, JSON.stringify(backups));
        return true;
    } catch (e) {
        console.warn("Backup creation failed:", e);
        return false;
    }
}

function getBackups(accountId) {
    try {
        const backupKey = `mmwg_backup_${accountId}`;
        const backups = JSON.parse(window.localStorage.getItem(backupKey) || "[]");
        return backups;
    } catch {
        return [];
    }
}

function restoreFromBackup(accountId, backupIndex = -1) {
    try {
        const backups = getBackups(accountId);
        if (backups.length === 0) {
            throw new Error("No backups available");
        }

        // Default to latest backup
        const index = backupIndex < 0 ? backups.length - 1 : backupIndex;
        if (index >= backups.length) {
            throw new Error("Invalid backup index");
        }

        const backup = backups[index];

        // Verify checksum
        const currentChecksum = calculateChecksum(backup.data);
        if (currentChecksum !== backup.checksum) {
            console.warn("Backup checksum mismatch, data may be corrupted");
        }

        // Restore account
        window.MMWG_STORAGE.saveAccount(backup.data);

        return {
            success: true,
            timestamp: backup.timestamp,
            checksumValid: currentChecksum === backup.checksum
        };
    } catch (e) {
        console.error("Restore from backup failed:", e);
        return {
            success: false,
            error: e.message
        };
    }
}

function calculateChecksum(data) {
    try {
        const str = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(36);
    } catch {
        return "";
    }
}

// Bilingual mode data migration (v2.1.0 → v2.2.0)
function checkBilingualMigrationNeeded() {
    try {
        const currentDataVersion = localStorage.getItem('dataVersion');
        return currentDataVersion !== '2.2.0';
    } catch (error) {
        console.warn('Check bilingual migration failed:', error);
        return false;
    }
}

function copyStorageKey(fromKey, toKey, fallbackValue) {
    const toValue = localStorage.getItem(toKey);
    if (toValue !== null) {
        return;
    }

    const fromValue = localStorage.getItem(fromKey);
    if (fromValue !== null) {
        localStorage.setItem(toKey, fromValue);
        return;
    }

    if (typeof fallbackValue !== 'undefined') {
        localStorage.setItem(toKey, JSON.stringify(fallbackValue));
    }
}

function migrateToBilingualV2_2_0() {
    const currentDataVersion = localStorage.getItem('dataVersion');
    if (currentDataVersion === '2.2.0') {
        console.log('Skip bilingual migration: already at dataVersion 2.2.0');
        return true;
    }

    console.log('Migrating to bilingual v2.2.0...');

    // Copy existing progress to English mode
    copyStorageKey('kgProgress', 'englishProgress_kg', {});
    copyStorageKey('wordGameProgress', 'englishProgress_game', {});

    // Initialize Chinese mode progress
    if (localStorage.getItem('chineseProgress_kg') === null) {
        localStorage.setItem('chineseProgress_kg', JSON.stringify({}));
    }
    if (localStorage.getItem('chineseProgress_game') === null) {
        localStorage.setItem('chineseProgress_game', JSON.stringify({}));
    }

    // Set default language mode to English
    if (localStorage.getItem('languageMode') === null) {
        localStorage.setItem('languageMode', 'english');
    }

    // Set default pinyin display to true
    if (localStorage.getItem('showPinyin') === null) {
        localStorage.setItem('showPinyin', 'true');
    }

    localStorage.setItem('dataVersion', '2.2.0');
    console.log('Bilingual migration completed');
    return true;
}

function initializeBilingualMigration() {
    if (checkBilingualMigrationNeeded()) {
        migrateToBilingualV2_2_0();
    }
}

window.exportSaveCode = exportSaveCode;
window.importSaveCode = importSaveCode;
window.checkStorageQuota = checkStorageQuota;
window.diagnoseStorage = diagnoseStorage;
window.createBackup = createBackup;
window.getBackups = getBackups;
window.restoreFromBackup = restoreFromBackup;
window.initializeBilingualMigration = initializeBilingualMigration;
