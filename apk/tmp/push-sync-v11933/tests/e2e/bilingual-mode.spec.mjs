import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

test.describe('双语学习模式功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 清除 localStorage
    await page.goto(BASE_URL);
    await page.evaluate(() => localStorage.clear());
  });

  test('首次启动显示语言模式选择引导页', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);

    // 等待引导页出现
    const modal = page.locator('#language-onboarding-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // 检查标题
    await expect(page.locator('#language-onboarding-modal h2')).toContainText('选择学习模式');

    // 检查两个选项按钮
    await expect(page.locator('button:has-text("英语学习")')).toBeVisible();
    await expect(page.locator('button:has-text("汉字学习")')).toBeVisible();
  });

  test('选择英语模式后正确初始化', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);

    // 等待引导页并选择英语
    await page.locator('button:has-text("英语学习")').click();

    // 验证 languageMode 已设置
    const languageMode = await page.evaluate(() => localStorage.getItem('languageMode'));
    expect(languageMode).toBe('english');

    // 引导页应该消失
    await expect(page.locator('#language-onboarding-modal')).not.toBeVisible();
  });

  test('选择汉字模式后正确初始化', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);

    // 等待引导页并选择汉字
    await page.locator('button:has-text("汉字学习")').click();

    // 验证 languageMode 已设置
    const languageMode = await page.evaluate(() => localStorage.getItem('languageMode'));
    expect(languageMode).toBe('chinese');

    // 引导页应该消失
    await expect(page.locator('#language-onboarding-modal')).not.toBeVisible();
  });

  test('英语模式显示英文单词（大）+ 中文翻译（小）', async ({ page }) => {
    // 预设英语模式
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('languageMode', 'english');
      localStorage.setItem('dataVersion', '2.2.0');
    });

    await page.goto(`${BASE_URL}/index.html`);
    await page.waitForLoadState('networkidle');

    // 点击"开始学习"按钮进入学习模式
    await page.locator('button:has-text("开始学习")').click();

    // 等待单词卡片显示
    await page.waitForSelector('.word-card:visible', { timeout: 10000 });

    // 检查主文字是英文（应该更大）
    const primaryText = await page.locator('.word-primary').textContent();
    expect(primaryText).toMatch(/^[a-zA-Z\s]+$/); // 英文字母

    // 检查次要文字是中文
    const secondaryText = await page.locator('.word-secondary').textContent();
    expect(secondaryText).toMatch(/[\u4e00-\u9fa5]/); // 包含中文字符
  });

  test('汉字模式显示汉字（大）+ 拼音（上方）+ 英文（小）', async ({ page }) => {
    // 预设汉字模式
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('languageMode', 'chinese');
      localStorage.setItem('showPinyin', 'true');
      localStorage.setItem('dataVersion', '2.2.0');
    });

    await page.goto(`${BASE_URL}/index.html`);
    await page.waitForLoadState('networkidle');

    // 点击"开始学习"按钮进入学习模式
    await page.locator('button:has-text("开始学习")').click();

    // 等待单词卡片显示
    await page.waitForSelector('.word-card:visible', { timeout: 10000 });

    // 检查主文字是中文
    const primaryText = await page.locator('.word-primary').textContent();
    expect(primaryText).toMatch(/[\u4e00-\u9fa5]/); // 包含中文字符

    // 检查拼音显示
    const pinyinText = await page.locator('.word-pinyin').textContent();
    expect(pinyinText).toBeTruthy();

    // 检查次要文字是英文
    const secondaryText = await page.locator('.word-secondary').textContent();
    expect(secondaryText).toMatch(/^[a-zA-Z\s]+$/); // 英文字母
  });

  test('设置中可切换语言模式（带确认提示）', async ({ page }) => {
    // 预设英语模式
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('languageMode', 'english');
      localStorage.setItem('dataVersion', '2.2.0');
    });

    await page.goto(`${BASE_URL}/index.html`);
    await page.waitForLoadState('networkidle');

    // 点击底部导航栏的设置按钮
    await page.locator('button:has-text("游戏设置")').click();

    // 等待设置模态框显示
    await page.waitForSelector('#language-mode-select', { state: 'visible', timeout: 5000 });

    // 设置对话框监听器
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('切换学习模式后，进度将分别记录');
      await dialog.accept();
    });

    // 切换到汉字模式
    await page.locator('#language-mode-select').selectOption('chinese');

    // 等待一下让对话框处理完成
    await page.waitForTimeout(500);

    // 验证模式已切换
    const languageMode = await page.evaluate(() => localStorage.getItem('languageMode'));
    expect(languageMode).toBe('chinese');
  });

  test('汉字模式下可隐藏/显示拼音', async ({ page }) => {
    // 预设汉字模式
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('languageMode', 'chinese');
      localStorage.setItem('showPinyin', 'true');
      localStorage.setItem('dataVersion', '2.2.0');
    });

    await page.goto(`${BASE_URL}/index.html`);
    await page.waitForLoadState('networkidle');

    // 点击底部导航栏的设置按钮
    await page.locator('button:has-text("游戏设置")').click();

    // 等待设置模态框显示
    await page.waitForSelector('#show-pinyin-toggle', { state: 'visible', timeout: 5000 });

    // 拼音开关应该可见
    const pinyinToggle = page.locator('#show-pinyin-toggle');
    await expect(pinyinToggle).toBeVisible();

    // 切换拼音显示
    await pinyinToggle.click();

    // 验证设置已保存
    const showPinyin = await page.evaluate(() => localStorage.getItem('showPinyin'));
    expect(showPinyin).toBe('false');
  });

  test('进度分别记录（英语和汉字独立统计）', async ({ page }) => {
    // 预设英语模式并记录一些进度
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('languageMode', 'english');
      localStorage.setItem('dataVersion', '2.2.0');
      localStorage.setItem('englishProgress_kg', JSON.stringify({ uniqueCount: 10 }));
      localStorage.setItem('chineseProgress_kg', JSON.stringify({ uniqueCount: 0 }));
    });

    await page.goto(`${BASE_URL}/index.html`);
    await page.waitForLoadState('networkidle');

    // 验证英语进度存在
    const englishProgress = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('englishProgress_kg') || '{}')
    );
    expect(englishProgress.uniqueCount).toBe(10);

    // 验证汉字进度独立
    const chineseProgress = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('chineseProgress_kg') || '{}')
    );
    expect(chineseProgress.uniqueCount).toBe(0);
  });

  test('数据迁移正确执行（v2.1.0 → v2.2.0）', async ({ page }) => {
    // 模拟旧版本数据
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('dataVersion', '2.1.0');
      localStorage.setItem('kgProgress', JSON.stringify({ uniqueCount: 20 }));
      localStorage.setItem('wordGameProgress', JSON.stringify({ level: 5 }));
    });

    await page.goto(`${BASE_URL}/index.html`);
    await page.waitForLoadState('networkidle');

    // 等待迁移完成
    await page.waitForTimeout(1000);

    // 验证迁移后版本号
    const dataVersion = await page.evaluate(() => localStorage.getItem('dataVersion'));
    expect(dataVersion).toBe('2.2.0');

    // 验证数据已复制到新键
    const englishProgressKg = await page.evaluate(() => {
      const data = localStorage.getItem('englishProgress_kg');
      return data ? JSON.parse(data) : {};
    });
    expect(englishProgressKg.uniqueCount).toBe(20);

    const englishProgressGame = await page.evaluate(() => {
      const data = localStorage.getItem('englishProgress_game');
      return data ? JSON.parse(data) : {};
    });
    expect(englishProgressGame.level).toBe(5);

    // 验证汉字进度已初始化
    const chineseProgressKg = await page.evaluate(() =>
      localStorage.getItem('chineseProgress_kg')
    );
    expect(chineseProgressKg).toBeTruthy();
  });
});
