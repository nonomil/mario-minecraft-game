import { test, expect } from '@playwright/test';

test.describe('Bilingual Mode Basic Integration', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:4173/Game.html');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test('should show language mode onboarding modal on first launch', async ({ page }) => {
        const modal = page.locator('#language-mode-onboarding-modal');
        await expect(modal).toBeVisible({ timeout: 5000 });

        const enBtn = page.locator('#btn-language-mode-english');
        const zhBtn = page.locator('#btn-language-mode-chinese');

        await expect(enBtn).toBeVisible();
        await expect(zhBtn).toBeVisible();
    });

    test('should save language mode selection - English', async ({ page }) => {
        const modal = page.locator('#language-mode-onboarding-modal');
        await expect(modal).toBeVisible({ timeout: 5000 });

        await page.click('#btn-language-mode-english');

        await expect(modal).toBeHidden({ timeout: 3000 });

        const languageMode = await page.evaluate(() => {
            return localStorage.getItem('mmwg:settings');
        });

        expect(languageMode).toContain('english');
    });

    test('should save language mode selection - Chinese', async ({ page }) => {
        const modal = page.locator('#language-mode-onboarding-modal');
        await expect(modal).toBeVisible({ timeout: 5000 });

        await page.click('#btn-language-mode-chinese');

        await expect(modal).toBeHidden({ timeout: 3000 });

        const languageMode = await page.evaluate(() => {
            return localStorage.getItem('mmwg:settings');
        });

        expect(languageMode).toContain('chinese');
    });

    test('should have language mode setting in settings modal', async ({ page }) => {
        // Clear localStorage to ensure fresh state
        await page.evaluate(() => localStorage.clear());

        // Reload page
        await page.goto('http://localhost:4173/Game.html');
        await page.waitForLoadState('networkidle');

        // Skip onboarding
        await page.click('#btn-language-mode-english');
        await page.waitForTimeout(1000);

        // Check if we're on login screen or game screen
        const loginVisible = await page.locator('#username-input').isVisible();

        if (loginVisible) {
            // Login flow
            await page.fill('#username-input', 'TestUser');
            await page.click('#btn-login');
            await page.waitForTimeout(1000);

            // Start game
            const startBtn = page.locator('#btn-overlay-action');
            if (await startBtn.isVisible()) {
                await startBtn.click();
                await page.waitForTimeout(1000);
            }
        } else {
            // Already in game, skip overlay if present
            const skipBtn = page.locator('#btn-overlay-skip');
            if (await skipBtn.isVisible()) {
                await skipBtn.click();
                await page.waitForTimeout(500);
            }
        }

        // Open settings
        await page.click('#btn-settings');
        await page.waitForTimeout(500);

        const languageModeSelect = page.locator('#opt-language-mode');
        await expect(languageModeSelect).toBeVisible();

        const options = await languageModeSelect.locator('option').allTextContents();
        expect(options).toContain('🇬🇧 英语学习');
        expect(options).toContain('🇨🇳 汉字学习');
    });

    test('should have pinyin display setting in settings modal', async ({ page }) => {
        // Clear localStorage to ensure fresh state
        await page.evaluate(() => localStorage.clear());

        // Reload page
        await page.goto('http://localhost:4173/Game.html');
        await page.waitForLoadState('networkidle');

        // Skip onboarding
        await page.click('#btn-language-mode-english');
        await page.waitForTimeout(1000);

        // Check if we're on login screen or game screen
        const loginVisible = await page.locator('#username-input').isVisible();

        if (loginVisible) {
            // Login flow
            await page.fill('#username-input', 'TestUser');
            await page.click('#btn-login');
            await page.waitForTimeout(1000);

            // Start game
            const startBtn = page.locator('#btn-overlay-action');
            if (await startBtn.isVisible()) {
                await startBtn.click();
                await page.waitForTimeout(1000);
            }
        } else {
            // Already in game, skip overlay if present
            const skipBtn = page.locator('#btn-overlay-skip');
            if (await skipBtn.isVisible()) {
                await skipBtn.click();
                await page.waitForTimeout(500);
            }
        }

        // Open settings
        await page.click('#btn-settings');
        await page.waitForTimeout(500);

        const showPinyinCheckbox = page.locator('#opt-show-pinyin');
        await expect(showPinyinCheckbox).toBeVisible();
    });

    test('should have Chinese vocabulary pack in manifest', async ({ page }) => {
        await page.click('#btn-language-mode-english');
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
        await page.click('#btn-language-mode-english');
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
        await page.click('#btn-language-mode-english');
        await page.waitForTimeout(500);

        const hasMigrationFunction = await page.evaluate(() => {
            return typeof window.initializeBilingualMigration === 'function';
        });

        expect(hasMigrationFunction).toBe(true);
    });
});
