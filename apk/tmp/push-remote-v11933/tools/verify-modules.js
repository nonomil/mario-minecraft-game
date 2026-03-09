/**
 * 快速验证模块化拆分后游戏是否正常加载
 */
const { chromium } = require('@playwright/test');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const errors = [];

    page.on('pageerror', err => {
        errors.push(err.message);
    });

    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push('[console.error] ' + msg.text());
        }
    });

    console.log('Loading game page...');
    await page.goto('http://127.0.0.1:4173/apk/Game.html', { waitUntil: 'networkidle' });

    // Wait a bit for scripts to execute
    await page.waitForTimeout(2000);

    // Check if key globals exist
    const checks = await page.evaluate(() => {
        return {
            canvas: !!document.getElementById('gameCanvas'),
            loginScreen: !!document.getElementById('login-screen'),
            MMWG_DEFAULTS: !!window.MMWG_DEFAULTS,
            MMWG_STORAGE: !!window.MMWG_STORAGE,
            MMWG_VOCAB_MANIFEST: !!window.MMWG_VOCAB_MANIFEST,
            // Check key functions/classes exist
            hasEntity: typeof Entity === 'function',
            hasPlatform: typeof Platform === 'function',
            hasEnemy: typeof Enemy === 'function',
            hasGolem: typeof Golem === 'function',
            // Check key game functions
            hasStart: typeof start === 'function',
            hasDraw: typeof draw === 'function',
            hasUpdate: typeof update === 'function',
            hasInitGame: typeof initGame === 'function',
            hasSpeakWord: typeof speakWord === 'function',
            hasSetOverlay: typeof setOverlay === 'function',
            // Check test API
            hasTestApi: !!window.MMWG_TEST_API,
            testApiState: window.MMWG_TEST_API ? !!window.MMWG_TEST_API.getState : false,
        };
    });

    console.log('\n=== Module Loading Checks ===');
    let allPassed = true;
    for (const [key, value] of Object.entries(checks)) {
        const status = value ? '✓' : '✗';
        console.log(`  ${status} ${key}: ${value}`);
        if (!value) allPassed = false;
    }

    if (errors.length > 0) {
        console.log('\n=== JavaScript Errors ===');
        errors.forEach(e => console.log('  ✗ ' + e));
        allPassed = false;
    } else {
        console.log('\n=== No JavaScript Errors ===');
    }

    // Try to get game state via test API
    if (checks.hasTestApi) {
        const state = await page.evaluate(() => window.MMWG_TEST_API.getState());
        console.log('\n=== Game State ===');
        console.log('  bootReady:', state.bootReady);
        console.log('  score:', state.score);
        console.log('  paused:', state.paused);
        console.log('  settings:', state.settings ? 'loaded' : 'null');
        console.log('  currentAccount:', state.currentAccount);
    }

    await browser.close();

    if (allPassed) {
        console.log('\n✓ All checks passed! Modular split is working correctly.');
        process.exit(0);
    } else {
        console.log('\n✗ Some checks failed.');
        process.exit(1);
    }
})();
