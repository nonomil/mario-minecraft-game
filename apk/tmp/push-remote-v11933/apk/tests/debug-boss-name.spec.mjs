import { test } from '@playwright/test';

test('调试BOSS名称问题', async ({ page }) => {
  // 打开调试页面
  await page.goto('http://localhost:4173/tests/debug-pages/GameDebug.html');

  // 等待iframe加载
  await page.waitForTimeout(3000);

  // 获取游戏iframe
  const gameFrame = page.frameLocator('#game');

  // 关闭教程弹窗（如果存在）
  try {
    const skipButton = gameFrame.locator('button:has-text("跳过")');
    if (await skipButton.isVisible({ timeout: 2000 })) {
      await skipButton.click();
      await page.waitForTimeout(500);
    }
  } catch (e) {
    console.log('没有教程弹窗或已关闭');
  }

  // 选择Warden BOSS
  await page.selectOption('#boss', 'warden');
  await page.waitForTimeout(500);

  // 点击触发BOSS（正常关卡）
  await page.click('#btnBoss');

  // 等待BOSS出现
  await page.waitForTimeout(2000);

  // 详细调试信息
  const debugInfo = await page.evaluate(() => {
    const gameFrame = document.getElementById('game');
    if (!gameFrame || !gameFrame.contentWindow) {
      return { error: 'iframe not accessible' };
    }

    const w = gameFrame.contentWindow;

    if (!w.bossArena) {
      return { error: 'bossArena not found' };
    }

    if (!w.bossArena.boss) {
      return { error: 'boss not found', arenaActive: w.bossArena.active };
    }

    const boss = w.bossArena.boss;

    return {
      bossExists: !!boss,
      bossType: boss.type,
      bossName: boss.name,
      bossConstructorName: boss.constructor.name,
      bossKeys: Object.keys(boss).slice(0, 20), // 前20个属性
      nameValue: boss.name,
      nameType: typeof boss.name,
      configName: boss.config ? boss.config.name : 'no config',
      arenaActive: w.bossArena.active
    };
  });

  console.log('=== BOSS调试信息 ===');
  console.log(JSON.stringify(debugInfo, null, 2));

  // 截图
  await page.screenshot({ path: 'tests/screenshots/boss-debug-info.png', fullPage: true });

  // 尝试直接读取JS文件内容，检查是否真的更新了
  const jsContent = await page.evaluate(() => {
    return fetch('/src/modules/15-entities-boss.js')
      .then(r => r.text())
      .then(text => {
        // 查找Warden的name定义
        const match = text.match(/class WardenBoss[\s\S]{0,500}name:\s*['"]([^'"]+)['"]/);
        return match ? match[1] : 'not found';
      })
      .catch(e => 'fetch error: ' + e.message);
  });

  console.log('JS文件中Warden的name定义:', jsContent);
});
