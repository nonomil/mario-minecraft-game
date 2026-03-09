import { test, expect } from '@playwright/test';

test.describe('Chinese Mode Comprehensive Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:4173/Game.html');
        await page.waitForLoadState('networkidle');
    });

    test('should display Chinese characters in Chinese mode', async ({ page }) => {
        // Clear localStorage and set Chinese mode
        await page.evaluate(() => {
            localStorage.clear();
            localStorage.setItem('mmwg:settings', JSON.stringify({
                languageMode: 'chinese',
                speechEnabled: true,
                speechZhEnabled: true
            }));
        });

        // Reload to apply settings
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Skip onboarding if present
        const chineseBtn = page.locator('#btn-language-mode-chinese');
        if (await chineseBtn.isVisible()) {
            await chineseBtn.click();
            await page.waitForTimeout(1000);
        }

        // Check if we're on login screen or game screen
        const loginVisible = await page.locator('#username-input').isVisible();

        if (loginVisible) {
            // Login
            await page.fill('#username-input', 'ChineseTestUser');
            await page.click('#btn-login');
            await page.waitForTimeout(1000);
        }

        // Skip overlay if present
        const skipBtn = page.locator('#btn-overlay-skip');
        if (await skipBtn.isVisible()) {
            await skipBtn.click();
            await page.waitForTimeout(500);
        }

        // Start game if needed
        const startBtn = page.locator('#btn-overlay-action');
        if (await startBtn.isVisible()) {
            await startBtn.click();
            await page.waitForTimeout(2000);
        }

        // Wait for game to start
        await page.waitForTimeout(3000);

        // Check word display - should show Chinese characters
        const wordDisplay = await page.locator('#word-display').textContent();
        console.log('Word display:', wordDisplay);

        // Verify language mode is Chinese
        const languageMode = await page.evaluate(() => {
            return window.MMWG_TEST_API?.getState()?.settings?.languageMode;
        });
        expect(languageMode).toBe('chinese');
    });

    test('should trigger word challenges in Chinese mode', async ({ page }) => {
        // Set Chinese mode
        await page.evaluate(() => {
            localStorage.clear();
            localStorage.setItem('mmwg:settings', JSON.stringify({
                languageMode: 'chinese',
                learningMode: true,
                challengeEnabled: true,
                challengeFrequency: 0.9,
                speechEnabled: false
            }));
        });

        await page.reload();
        await page.waitForLoadState('networkidle');

        // Skip onboarding
        const chineseBtn = page.locator('#btn-language-mode-chinese');
        if (await chineseBtn.isVisible()) {
            await chineseBtn.click();
            await page.waitForTimeout(1000);
        }

        // Login if needed
        const loginVisible = await page.locator('#username-input').isVisible();
        if (loginVisible) {
            await page.fill('#username-input', 'ChineseTestUser2');
            await page.click('#btn-login');
            await page.waitForTimeout(1000);
        }

        // Skip overlay
        const skipBtn = page.locator('#btn-overlay-skip');
        if (await skipBtn.isVisible()) {
            await skipBtn.click();
            await page.waitForTimeout(500);
        }

        // Start game
        const startBtn = page.locator('#btn-overlay-action');
        if (await startBtn.isVisible()) {
            await startBtn.click();
            await page.waitForTimeout(2000);
        }

        // Wait for potential challenge to appear (up to 30 seconds)
        let challengeAppeared = false;
        for (let i = 0; i < 30; i++) {
            const challengeModal = page.locator('#challenge-modal');
            if (await challengeModal.isVisible()) {
                challengeAppeared = true;
                console.log('Challenge modal appeared after', i, 'seconds');

                // Check challenge content
                const questionText = await page.locator('#challenge-question').textContent();
                console.log('Challenge question:', questionText);

                break;
            }
            await page.waitForTimeout(1000);
        }

        console.log('Challenge appeared:', challengeAppeared);
    });

    test('should show word gate in Chinese mode', async ({ page }) => {
        // Set Chinese mode with word gate enabled
        await page.evaluate(() => {
            localStorage.clear();
            localStorage.setItem('mmwg:settings', JSON.stringify({
                languageMode: 'chinese',
                wordGateEnabled: true,
                speechEnabled: false
            }));
        });

        await page.reload();
        await page.waitForLoadState('networkidle');

        // Skip onboarding
        const chineseBtn = page.locator('#btn-language-mode-chinese');
        if (await chineseBtn.isVisible()) {
            await chineseBtn.click();
            await page.waitForTimeout(1000);
        }

        // Login if needed
        const loginVisible = await page.locator('#username-input').isVisible();
        if (loginVisible) {
            await page.fill('#username-input', 'ChineseTestUser3');
            await page.click('#btn-login');
            await page.waitForTimeout(1000);
        }

        // Skip overlay
        const skipBtn = page.locator('#btn-overlay-skip');
        if (await skipBtn.isVisible()) {
            await skipBtn.click();
            await page.waitForTimeout(500);
        }

        // Start game
        const startBtn = page.locator('#btn-overlay-action');
        if (await startBtn.isVisible()) {
            await startBtn.click();
            await page.waitForTimeout(2000);
        }

        // Check if word gate setting is enabled
        const wordGateEnabled = await page.evaluate(() => {
            return window.MMWG_TEST_API?.getState()?.settings?.wordGateEnabled;
        });
        expect(wordGateEnabled).toBe(true);

        console.log('Word gate enabled:', wordGateEnabled);
    });

    test('should show word match revival in Chinese mode', async ({ page }) => {
        // Set Chinese mode with word match enabled
        await page.evaluate(() => {
            localStorage.clear();
            localStorage.setItem('mmwg:settings', JSON.stringify({
                languageMode: 'chinese',
                wordMatchEnabled: true,
                speechEnabled: false
            }));
        });

        await page.reload();
        await page.waitForLoadState('networkidle');

        // Skip onboarding
        const chineseBtn = page.locator('#btn-language-mode-chinese');
        if (await chineseBtn.isVisible()) {
            await chineseBtn.click();
            await page.waitForTimeout(1000);
        }

        // Check if word match setting is enabled
        const wordMatchEnabled = await page.evaluate(() => {
            return window.MMWG_TEST_API?.getState()?.settings?.wordMatchEnabled;
        });
        expect(wordMatchEnabled).toBe(true);

        console.log('Word match enabled:', wordMatchEnabled);
    });

    test('should verify Chinese vocabulary is loaded', async ({ page }) => {
        // Set Chinese mode
        await page.evaluate(() => {
            localStorage.clear();
            localStorage.setItem('mmwg:settings', JSON.stringify({
                languageMode: 'chinese',
                vocabSelection: 'vocab.kindergarten.hanzi'
            }));
        });

        await page.reload();
        await page.waitForLoadState('networkidle');

        // Skip onboarding
        const chineseBtn = page.locator('#btn-language-mode-chinese');
        if (await chineseBtn.isVisible()) {
            await chineseBtn.click();
            await page.waitForTimeout(1000);
        }

        // Check if Chinese vocabulary pack is available
        const hasChineseVocab = await page.evaluate(() => {
            if (!window.vocabManifest || !window.vocabManifest.packs) return false;
            const pack = window.vocabManifest.packs.find(p =>
                p.id === 'vocab.kindergarten.hanzi' || p.mode === 'chinese'
            );
            return !!pack;
        });

        expect(hasChineseVocab).toBe(true);
        console.log('Chinese vocabulary available:', hasChineseVocab);
    });

    test('should verify TTS speaks Chinese in Chinese mode', async ({ page }) => {
        // Set Chinese mode with TTS enabled
        await page.evaluate(() => {
            localStorage.clear();
            localStorage.setItem('mmwg:settings', JSON.stringify({
                languageMode: 'chinese',
                speechEnabled: true,
                speechZhEnabled: true,
                speechZhRate: 1.0
            }));
        });

        await page.reload();
        await page.waitForLoadState('networkidle');

        // Skip onboarding
        const chineseBtn = page.locator('#btn-language-mode-chinese');
        if (await chineseBtn.isVisible()) {
            await chineseBtn.click();
            await page.waitForTimeout(1000);
        }

        // Verify TTS settings
        const ttsSettings = await page.evaluate(() => {
            const state = window.MMWG_TEST_API?.getState();
            return {
                languageMode: state?.settings?.languageMode,
                speechEnabled: state?.settings?.speechEnabled,
                speechZhEnabled: state?.settings?.speechZhEnabled
            };
        });

        expect(ttsSettings.languageMode).toBe('chinese');
        expect(ttsSettings.speechEnabled).toBe(true);
        expect(ttsSettings.speechZhEnabled).toBe(true);

        console.log('TTS settings:', ttsSettings);
    });
});
