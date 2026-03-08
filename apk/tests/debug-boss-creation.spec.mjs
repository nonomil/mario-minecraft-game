import { test } from '@playwright/test';

test('实时监控BOSS创建过程', async ({ page }) => {
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

  // 在iframe中设置监听器，监控boss创建
  await page.evaluate(() => {
    const gameFrame = document.getElementById('game');
    if (!gameFrame || !gameFrame.contentWindow) return;

    const w = gameFrame.contentWindow;

    // 保存原始的enter函数
    const originalEnter = w.bossArena.enter;

    // 包装enter函数
    w.bossArena.enter = function(...args) {
      console.log('=== bossArena.enter 被调用 ===');
      console.log('参数:', args);

      const result = originalEnter.apply(this, args);

      console.log('enter执行后:');
      console.log('- active:', this.active);
      console.log('- boss存在:', !!this.boss);
      console.log('- boss类型:', this.boss ? this.boss.constructor.name : 'null');
      console.log('- boss.name:', this.boss ? this.boss.name : 'null');

      return result;
    };

    // 保存原始的createBoss函数
    const originalCreateBoss = w.bossArena.createBoss;

    // 包装createBoss函数
    w.bossArena.createBoss = function(type) {
      console.log('=== createBoss 被调用 ===');
      console.log('type:', type);

      const boss = originalCreateBoss.call(this, type);

      console.log('createBoss返回:');
      console.log('- boss存在:', !!boss);
      console.log('- boss类型:', boss ? boss.constructor.name : 'null');
      console.log('- boss.name:', boss ? boss.name : 'null');
      console.log('- boss所有属性:', boss ? Object.keys(boss).slice(0, 10) : []);

      return boss;
    };
  });

  // 选择Warden BOSS
  await page.selectOption('#boss', 'warden');
  await page.waitForTimeout(500);

  // 开始监听控制台
  page.on('console', msg => {
    console.log('浏览器控制台:', msg.text());
  });

  // 点击触发BOSS
  console.log('\n=== 点击触发BOSS按钮 ===\n');
  await page.click('#btnBoss');

  // 等待一小段时间让日志输出
  await page.waitForTimeout(1000);

  // 检查最终状态
  const finalState = await page.evaluate(() => {
    const gameFrame = document.getElementById('game');
    if (!gameFrame || !gameFrame.contentWindow) return { error: 'no iframe' };

    const w = gameFrame.contentWindow;

    return {
      arenaActive: w.bossArena.active,
      bossExists: !!w.bossArena.boss,
      bossName: w.bossArena.boss ? w.bossArena.boss.name : null,
      bossType: w.bossArena.boss ? w.bossArena.boss.type : null,
      bossAlive: w.bossArena.boss ? w.bossArena.boss.alive : null
    };
  });

  console.log('\n=== 最终状态 ===');
  console.log(JSON.stringify(finalState, null, 2));

  // 截图
  await page.screenshot({ path: 'tests/screenshots/boss-creation-debug.png', fullPage: true });
});
