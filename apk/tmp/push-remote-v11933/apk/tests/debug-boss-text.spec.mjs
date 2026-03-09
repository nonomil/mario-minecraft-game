import { test, expect } from '@playwright/test';

test('验证BOSS文本显示正确', async ({ page }) => {
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

  // 等待BOSS出现和toast显示
  await page.waitForTimeout(2000);

  // 截图
  await page.screenshot({ path: 'tests/screenshots/boss-warden-triggered.png', fullPage: true });

  // 在iframe中查找toast
  const toastInFrame = await gameFrame.locator('.toast').textContent().catch(() => '');
  console.log('Frame中的Toast文本:', toastInFrame);

  // 检查页面状态信息
  const statusText = await page.locator('#status').textContent();
  console.log('状态信息:', statusText);

  // 验证BOSS是否激活
  const bossActive = await page.evaluate(() => {
    const gameFrame = document.getElementById('game');
    if (!gameFrame || !gameFrame.contentWindow) return false;
    const w = gameFrame.contentWindow;
    return w.bossArena && w.bossArena.active;
  });

  console.log('BOSS是否激活:', bossActive);

  // 如果BOSS激活，获取BOSS名称
  if (bossActive) {
    const bossName = await page.evaluate(() => {
      const gameFrame = document.getElementById('game');
      const w = gameFrame.contentWindow;
      return w.bossArena.boss ? w.bossArena.boss.name : 'unknown';
    });
    console.log('BOSS名称:', bossName);

    // 验证名称正确
    expect(bossName).toContain('监守者');
    expect(bossName).toContain('Warden');
    expect(bossName).not.toContain('???');
  } else {
    throw new Error('BOSS未能成功激活');
  }
});

test('验证Evoker BOSS文本显示正确', async ({ page }) => {
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

  // 选择Evoker BOSS
  await page.selectOption('#boss', 'evoker');
  await page.waitForTimeout(500);

  // 点击触发BOSS（正常关卡）
  await page.click('#btnBoss');

  // 等待BOSS出现
  await page.waitForTimeout(2000);

  // 截图
  await page.screenshot({ path: 'tests/screenshots/boss-evoker-triggered.png', fullPage: true });

  // 验证BOSS是否激活
  const bossActive = await page.evaluate(() => {
    const gameFrame = document.getElementById('game');
    if (!gameFrame || !gameFrame.contentWindow) return false;
    const w = gameFrame.contentWindow;
    return w.bossArena && w.bossArena.active;
  });

  console.log('BOSS是否激活:', bossActive);

  // 如果BOSS激活，获取BOSS名称
  if (bossActive) {
    const bossName = await page.evaluate(() => {
      const gameFrame = document.getElementById('game');
      const w = gameFrame.contentWindow;
      return w.bossArena.boss ? w.bossArena.boss.name : 'unknown';
    });
    console.log('BOSS名称:', bossName);

    // 验证名称正确
    expect(bossName).toContain('唤魔者');
    expect(bossName).toContain('Evoker');
    expect(bossName).not.toContain('???');
  } else {
    throw new Error('BOSS未能成功激活');
  }
});
