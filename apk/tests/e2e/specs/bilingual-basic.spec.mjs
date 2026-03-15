import { test, expect } from '@playwright/test';

async function selectLanguageMode(page, mode) {
    await page.waitForSelector('#btn-overlay-language-english', { state: 'visible' });
    await page.click(`#btn-overlay-language-${mode}`);
}

async function bootGame(page) {
    await page.waitForFunction(() => typeof window.MMWG_TEST_API !== "undefined");
    await page.waitForFunction(() => typeof window.MMWG_STORAGE !== "undefined");
    await page.evaluate(async () => {
        const username = `pw_bilingual_${Date.now()}`;
        const account = window.MMWG_STORAGE.createAccount(username);
        await window.MMWG_TEST_API.actions.loginWithAccount(account, { mode: "continue" });
        window.MMWG_TEST_API.actions.bootGameLoopIfNeeded();
        if (typeof paused !== "undefined") paused = false;
        if (typeof pauseStack === "number") pauseStack = 0;
        if (typeof setOverlay === "function") setOverlay(false);
    });
    await page.waitForFunction(() => window.MMWG_TEST_API.getState().startedOnce === true, null, { timeout: 30_000 });
}

test.describe('Bilingual Mode Basic Integration', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:4173/Game.html');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test('should show language mode selection on first launch', async ({ page }) => {
        const panel = page.locator('#overlay-language-mode-selection');
        await expect(panel).toBeVisible({ timeout: 5000 });

        const enBtn = page.locator('#btn-overlay-language-english');
        const zhBtn = page.locator('#btn-overlay-language-chinese');
        const pyBtn = page.locator('#btn-overlay-language-pinyin');

        await expect(enBtn).toBeVisible();
        await expect(zhBtn).toBeVisible();
        await expect(pyBtn).toBeVisible();
    });

    test('should save language mode selection - English', async ({ page }) => {
        await selectLanguageMode(page, 'english');

        const languageMode = await page.evaluate(() => {
            return localStorage.getItem('mmwg:settings');
        });

        expect(languageMode).toContain('english');
    });

    test('should save language mode selection - Chinese', async ({ page }) => {
        await selectLanguageMode(page, 'chinese');

        const languageMode = await page.evaluate(() => {
            return localStorage.getItem('mmwg:settings');
        });

        expect(languageMode).toContain('chinese');
    });

    test('should have language mode setting in settings modal', async ({ page }) => {
        await selectLanguageMode(page, 'english');
        await bootGame(page);

        await page.click('#btn-settings');
        await page.waitForTimeout(500);

        const languageModeSelect = page.locator('#opt-language-mode');
        await expect(languageModeSelect).toBeVisible();

        const options = await languageModeSelect.locator('option').allTextContents();
        expect(options).toContain('🇬🇧 英语学习');
        expect(options).toContain('🇨🇳 汉字学习');
        expect(options).toContain('🇨🇳 幼小衔接');
    });

    test('should have pinyin display setting in settings modal', async ({ page }) => {
        await selectLanguageMode(page, 'english');
        await bootGame(page);

        await page.click('#btn-settings');
        await page.waitForTimeout(500);

        const showPinyinCheckbox = page.locator('#opt-show-pinyin');
        await expect(showPinyinCheckbox).toBeAttached();
    });

    test('should have Chinese vocabulary pack in manifest', async ({ page }) => {
        await selectLanguageMode(page, 'english');
        await page.waitForTimeout(500);

        const hasChineseVocab = await page.evaluate(() => {
            if (!window.vocabManifest || !window.vocabManifest.packs) return false;
            return window.vocabManifest.packs.some(pack =>
                pack.id && (pack.id.includes('hanzi') || pack.id.includes('汉字'))
            );
        });

        expect(hasChineseVocab).toBe(true);
    });

    test('should have bilingual vocab functions available', async ({ page }) => {
        await selectLanguageMode(page, 'english');
        await page.waitForTimeout(500);

        const hasBilingualFunctions = await page.evaluate(() => {
            return typeof window.BilingualVocab === 'object' &&
                   typeof window.BilingualVocab.normalizeWordContent === 'function' &&
                   typeof window.BilingualVocab.getCurrentLanguageMode === 'function' &&
                   typeof window.BilingualVocab.filterWordsByLanguageMode === 'function' &&
                   typeof window.BilingualVocab.getDisplayContent === 'function';
        });

        expect(hasBilingualFunctions).toBe(true);
    });

    test('should have data migration function available', async ({ page }) => {
        await selectLanguageMode(page, 'english');
        await page.waitForTimeout(500);

        const hasMigrationFunction = await page.evaluate(() => {
            return typeof window.initializeBilingualMigration === 'function';
        });

        expect(hasMigrationFunction).toBe(true);
    });
});
