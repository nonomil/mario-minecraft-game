/**
 * 验证主项目 (非APK) 模块化同步后是否正常
 */
const { chromium } = require('@playwright/test');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    console.log('Testing main project at /Game.html...');
    await page.goto('http://127.0.0.1:4173/Game.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const checks = await page.evaluate(() => ({
        canvas: !!document.getElementById('gameCanvas'),
        loginScreen: !!document.getElementById('login-screen'),
        testApi: !!window.MMWG_TEST_API,
        hasEntity: typeof Entity === 'function',
        hasEnemy: typeof Enemy === 'function',
        hasDraw: typeof draw === 'function',
        hasUpdate: typeof update === 'function',
        bootReady: window.MMWG_TEST_API?.getState()?.bootReady,
        wordCount: window.MMWG_TEST_API?.getState()?.wordCount,
        vocabPack: window.MMWG_TEST_API?.getState()?.activeVocabPackId,
    }));

    console.log('\n=== Main Project Checks ===');
    for (const [k, v] of Object.entries(checks)) {
        console.log(`  ${v ? '✓' : '✗'} ${k}: ${v}`);
    }

    if (errors.length > 0) {
        console.log('\n=== Errors ===');
        errors.forEach(e => console.log('  ✗ ' + e));
    } else {
        console.log('\n=== No JavaScript Errors ===');
    }

    await browser.close();
    const ok = errors.length === 0 && checks.bootReady;
    console.log(ok ? '\n✓ Main project sync verified!' : '\n✗ Issues found.');
    process.exit(ok ? 0 : 1);
})();
