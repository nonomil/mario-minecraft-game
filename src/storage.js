window.MMWG_STORAGE = {
    loadJson(key, fallback) {
        try {
            const raw = window.localStorage.getItem(key);
            if (!raw) return JSON.parse(JSON.stringify(fallback));
            return JSON.parse(raw);
        } catch {
            return JSON.parse(JSON.stringify(fallback));
        }
    },
    saveJson(key, value) {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch {
        }
    }
};
