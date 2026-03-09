/**
 * 深度验证: 验证模块化拆分后游戏完整运行
 */
const { chromium } = require('@playwright/test');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        storageState: undefined // clean state
    });
    const page = await context.newPage();
    const errors = [];

    page.on('pageerror', err => errors.push(err.message));

    console.log('1. Loading game page (clean state)...');
    // Clear localStorage first
    await page.goto('http://127.0.0.1:4173/apk/Game.html', { waitUntil: 'networkidle' });
    await page.evaluate(() => { try { localStorage.clear(); } catch {} });
    // Reload with clean state
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Check boot state
    const bootState = await page.evaluate(() => {
        const api = window.MMWG_TEST_API;
        return api ? api.getState() : null;
    });
    console.log('   bootReady:', bootState?.bootReady ? '✓' : '✗');
    console.log('   startedOnce:', bootState?.startedOnce);

    // Check if login screen or start overlay is visible
    const uiState = await page.evaluate(() => {
        const login = document.getElementById('login-screen');
        const overlay = document.getElementById('screen-overlay');
        return {
            loginVisible: login?.classList.contains('visible') || false,
            loginDisplay: login ? getComputedStyle(login).display : 'none',
            overlayHidden: overlay?.getAttribute('aria-hidden'),
        };
    });
    console.log('   Login visible:', uiState.loginVisible);
    console.log('   Overlay hidden:', uiState.overlayHidden);

    // Try to login if login screen is visible
    if (uiState.loginVisible) {
        console.log('2. Logging in...');
        await page.fill('#username-input', 'TestPlayer');
        await page.click('#btn-login');
        await page.waitForTimeout(2000);
    } else {
        console.log('2. Login screen not shown (auto-login or start overlay)');
    }

    // Try to start the game
    console.log('3. Starting game...');
    await page.evaluate(() => {
        const api = window.MMWG_TEST_API;
        if (api && api.actions) {
            // If not started, try to boot
            if (api.actions.bootGameLoopIfNeeded) {
                api.actions.bootGameLoopIfNeeded();
            }
        }
        // Click overlay button
        const btn = document.getElementById('btn-overlay-action');
        if (btn) btn.click();
    });
    await page.waitForTimeout(3000);

    const afterStart = await page.evaluate(() => {
        const api = window.MMWG_TEST_API;
        if (!api) return null;
        const state = api.getState();
        return {
            startedOnce: state.startedOnce,
            paused: state.paused,
            score: state.score,
            playerHp: state.playerHp,
            playerMaxHp: state.playerMaxHp,
            wordCount: state.wordCount,
            wordItemsCount: state.wordItemsCount,
            inventory: state.inventory,
            activeVocabPackId: state.activeVocabPackId,
            movementSpeed: state.movementSpeed,
        };
    });
    console.log('   Game started:', afterStart?.startedOnce ? '✓' : '✗');
    console.log('   Player HP:', afterStart?.playerHp + '/' + afterStart?.playerMaxHp);
    console.log('   Vocab pack:', afterStart?.activeVocabPackId);
    console.log('   Word count:', afterStart?.wordCount);
    console.log('   Word items on map:', afterStart?.wordItemsCount);
    console.log('   Movement speed:', afterStart?.movementSpeed);
    console.log('   Has inventory:', afterStart?.inventory ? '✓' : '✗');

    // Let game run
    console.log('4. Running game loop for 3 seconds...');
    await page.waitForTimeout(3000);

    const afterRun = await page.evaluate(() => {
        const api = window.MMWG_TEST_API;
        if (!api) return null;
        return api.getState();
    });
    console.log('   Score:', afterRun?.score);
    console.log('   Paused:', afterRun?.paused);

    // Verify key systems work
    console.log('5. Verifying key systems...');
    const systemChecks = await page.evaluate(() => {
        const results = {};
        // Check canvas is rendering
        const canvas = document.getElementById('gameCanvas');
        results.canvasSize = canvas ? canvas.width + 'x' + canvas.height : 'missing';
        // Check HUD elements
        results.scoreEl = !!document.getElementById('score');
        results.hpEl = !!document.getElementById('hp');
        results.wordDisplay = !!document.getElementById('word-display');
        results.levelInfo = !!document.getElementById('level-info');
        results.weaponInfo = !!document.getElementById('weapon-info');
        // Check settings modal exists
        results.settingsModal = !!document.getElementById('settings-modal');
        // Check touch controls
        results.touchControls = !!document.getElementById('touch-controls');
        return results;
    });
    for (const [key, value] of Object.entries(systemChecks)) {
        console.log('   ' + key + ':', value);
    }

    if (errors.length > 0) {
        console.log('\n=== JavaScript Errors ===');
        errors.forEach(e => console.log('  ✗ ' + e));
    } else {
        console.log('\n=== No JavaScript Errors ===');
    }

    await browser.close();

    const success = errors.length === 0 && bootState?.bootReady;
    console.log(success ? '\n✓ Deep verification passed!' : '\n✗ Some issues found.');
    process.exit(success ? 0 : 1);
})();
