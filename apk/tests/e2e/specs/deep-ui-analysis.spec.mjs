import { test, expect } from "@playwright/test";

/**
 * 深度UI测试 - 完整游戏流程
 * 目标：模拟真实玩家行为，触发所有弹窗和UI场景，收集完整的UI数据
 */

test.describe("深度UI测试 - 完整游戏流程", () => {
  let uiData = {
    screenshots: [],
    modals: [],
    buttons: [],
    texts: [],
    dialogs: []
  };

  test.beforeEach(async ({ page }) => {
    await page.goto("/Game.html");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);
  });

  test("场景1: 登录流程", async ({ page }) => {
    // 等待登录界面或初始弹窗
    await page.waitForTimeout(1000);

    // 截图：初始状态
    await page.screenshot({ path: "test-results/deep-ui/01-initial-state.png", fullPage: true });
    uiData.screenshots.push("01-initial-state");

    // 检查是否有登录界面
    const loginScreen = page.locator("#login-screen");
    const isLoginVisible = await loginScreen.isVisible().catch(() => false);

    if (isLoginVisible) {
      // 填写用户名
      await page.fill("#username-input", "深度测试用户");
      await page.screenshot({ path: "test-results/deep-ui/02-login-filled.png", fullPage: true });

      // 点击登录
      await page.click("#btn-login");
      await page.waitForTimeout(1000);
    }

    // 截图：登录后状态
    await page.screenshot({ path: "test-results/deep-ui/03-after-login.png", fullPage: true });
    uiData.screenshots.push("03-after-login");
  });

  test("场景2: 初始弹窗和教程", async ({ page }) => {
    // 跳过登录
    await skipLogin(page);

    // 等待初始弹窗
    const overlay = page.locator("#screen-overlay");
    await expect(overlay).toBeVisible({ timeout: 5000 });

    // 截图：初始弹窗
    await page.screenshot({ path: "test-results/deep-ui/04-initial-modal.png", fullPage: true });

    // 提取弹窗内容
    const modalData = await extractModalData(page, "#screen-overlay", "初始弹窗");
    uiData.modals.push(modalData);

    // 检查是否有"跳过"按钮
    const skipBtn = page.locator("#btn-overlay-skip");
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipBtn.click();
      await page.waitForTimeout(500);
    } else {
      // 点击"开始游戏"
      const startBtn = page.locator("#btn-overlay-action");
      if (await startBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await startBtn.click();
        await page.waitForTimeout(1000);
      }
    }

    // 截图：进入游戏后
    await page.screenshot({ path: "test-results/deep-ui/05-game-started.png", fullPage: true });
  });

  test("场景3: 游戏内HUD和单词显示", async ({ page }) => {
    await skipLogin(page);
    await skipInitialModal(page);

    // 等待游戏加载
    await page.waitForTimeout(2000);

    // 截图：游戏主界面
    await page.screenshot({ path: "test-results/deep-ui/06-game-main.png", fullPage: true });

    // 提取HUD元素
    const hudElements = await page.evaluate(() => {
      const elements = [];

      // HUD按钮
      document.querySelectorAll('.hud-btn').forEach(btn => {
        const computed = window.getComputedStyle(btn);
        elements.push({
          type: 'hud-button',
          text: btn.textContent,
          fontSize: computed.fontSize,
          backgroundColor: computed.backgroundColor,
          color: computed.color
        });
      });

      // HUD信息框
      document.querySelectorAll('.hud-box').forEach(box => {
        const computed = window.getComputedStyle(box);
        elements.push({
          type: 'hud-box',
          text: box.textContent,
          fontSize: computed.fontSize,
          backgroundColor: computed.backgroundColor,
          color: computed.color
        });
      });

      // 单词显示
      const wordDisplay = document.querySelector('#word-display');
      if (wordDisplay) {
        const computed = window.getComputedStyle(wordDisplay);
        elements.push({
          type: 'word-display',
          text: wordDisplay.textContent,
          fontSize: computed.fontSize,
          color: computed.color,
          textShadow: computed.textShadow
        });
      }

      return elements;
    });

    uiData.texts.push(...hudElements);
    console.log(`提取了 ${hudElements.length} 个HUD元素`);
  });

  test("场景4: 设置界面", async ({ page }) => {
    await skipLogin(page);
    await skipInitialModal(page);

    // 打开设置
    await page.click("#btn-settings");
    await page.waitForTimeout(1000);

    // 截图：设置界面
    await page.screenshot({ path: "test-results/deep-ui/07-settings-modal.png", fullPage: true });

    // 提取设置界面数据
    const settingsData = await extractModalData(page, "#settings-modal", "设置界面");
    uiData.modals.push(settingsData);

    // 测试高级设置
    const advancedBtn = page.locator("#btn-settings-advanced");
    if (await advancedBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await advancedBtn.click();
      await page.waitForTimeout(1000);

      // 截图：高级设置
      await page.screenshot({ path: "test-results/deep-ui/08-advanced-settings.png", fullPage: true });

      // 关闭高级设置
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }

    // 关闭设置
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
  });

  test("场景5: 背包/物品栏", async ({ page }) => {
    await skipLogin(page);
    await skipInitialModal(page);

    // 打开背包
    await page.click("#btn-inventory");
    await page.waitForTimeout(1000);

    // 截图：背包界面
    await page.screenshot({ path: "test-results/deep-ui/09-inventory.png", fullPage: true });

    // 提取背包数据
    const inventoryData = await page.evaluate(() => {
      const modal = document.querySelector('#inventory-modal');
      if (!modal) return null;

      const computed = window.getComputedStyle(modal);
      const items = [];

      // 提取物品槽
      document.querySelectorAll('.inventory-item, .inv-slot').forEach(slot => {
        const slotComputed = window.getComputedStyle(slot);
        items.push({
          type: 'inventory-slot',
          width: slotComputed.width,
          height: slotComputed.height,
          backgroundColor: slotComputed.backgroundColor,
          border: slotComputed.border
        });
      });

      return {
        modal: '背包界面',
        backgroundColor: computed.backgroundColor,
        borderRadius: computed.borderRadius,
        items: items
      };
    });

    if (inventoryData) {
      uiData.modals.push(inventoryData);
    }

    // 关闭背包
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
  });

  test("场景6: 档案/成就界面", async ({ page }) => {
    await skipLogin(page);
    await skipInitialModal(page);

    // 打开档案
    await page.click("#btn-profile");
    await page.waitForTimeout(1000);

    // 截图：档案界面
    await page.screenshot({ path: "test-results/deep-ui/10-profile.png", fullPage: true });

    // 提取档案数据
    const profileData = await extractModalData(page, "#profile-modal", "档案界面");
    uiData.modals.push(profileData);

    // 关闭档案
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
  });

  test("场景7: 模拟游戏内单词卡片", async ({ page }) => {
    await skipLogin(page);
    await skipInitialModal(page);

    // 等待游戏运行
    await page.waitForTimeout(3000);

    // 尝试触发单词卡片（通过模拟游戏事件）
    const wordCardTriggered = await page.evaluate(() => {
      const wordCard = document.querySelector('#word-card');
      if (wordCard) {
        // 手动显示单词卡片
        wordCard.classList.add('visible');
        wordCard.querySelector('.word-card-en').textContent = 'APPLE';
        wordCard.querySelector('.word-card-zh').textContent = '苹果';
        return true;
      }
      return false;
    });

    if (wordCardTriggered) {
      await page.waitForTimeout(500);
      await page.screenshot({ path: "test-results/deep-ui/11-word-card.png", fullPage: true });

      // 提取单词卡片样式
      const wordCardData = await page.evaluate(() => {
        const card = document.querySelector('#word-card');
        const inner = document.querySelector('.word-card-inner');
        const en = document.querySelector('.word-card-en');
        const zh = document.querySelector('.word-card-zh');

        const cardComputed = window.getComputedStyle(inner);
        const enComputed = window.getComputedStyle(en);
        const zhComputed = window.getComputedStyle(zh);

        return {
          modal: '单词卡片',
          container: {
            backgroundColor: cardComputed.backgroundColor,
            border: cardComputed.border,
            borderRadius: cardComputed.borderRadius,
            padding: cardComputed.padding
          },
          english: {
            fontSize: enComputed.fontSize,
            fontWeight: enComputed.fontWeight,
            color: enComputed.color,
            textShadow: enComputed.textShadow
          },
          chinese: {
            fontSize: zhComputed.fontSize,
            fontWeight: zhComputed.fontWeight,
            color: zhComputed.color,
            textShadow: zhComputed.textShadow
          }
        };
      });

      uiData.modals.push(wordCardData);
    }
  });

  test("场景8: 学习挑战弹窗", async ({ page }) => {
    await skipLogin(page);
    await skipInitialModal(page);

    // 尝试触发学习挑战（通过模拟）
    const challengeTriggered = await page.evaluate(() => {
      const modal = document.querySelector('.learning-modal');
      if (modal) {
        modal.classList.add('visible');
        // 模拟挑战内容
        const question = modal.querySelector('.learning-modal-question');
        if (question) {
          question.textContent = '选择正确的单词：';
        }
        return true;
      }
      return false;
    });

    if (challengeTriggered) {
      await page.waitForTimeout(500);
      await page.screenshot({ path: "test-results/deep-ui/12-learning-challenge.png", fullPage: true });

      const challengeData = await extractModalData(page, ".learning-modal", "学习挑战");
      uiData.modals.push(challengeData);
    }
  });

  test("场景9: 护甲选择界面", async ({ page }) => {
    await skipLogin(page);
    await skipInitialModal(page);

    // 点击护甲状态框
    const armorStatus = page.locator("#armor-status");
    if (await armorStatus.isVisible({ timeout: 2000 }).catch(() => false)) {
      await armorStatus.click();
      await page.waitForTimeout(1000);

      // 截图：护甲选择
      await page.screenshot({ path: "test-results/deep-ui/13-armor-select.png", fullPage: true });

      const armorData = await extractModalData(page, "#armor-select-modal", "护甲选择");
      uiData.modals.push(armorData);

      // 关闭
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }
  });

  test("场景10: Toast提示消息", async ({ page }) => {
    await skipLogin(page);
    await skipInitialModal(page);

    // 触发Toast
    const toastTriggered = await page.evaluate(() => {
      const toast = document.querySelector('#toast');
      if (toast) {
        toast.textContent = 'Level Up!';
        toast.style.display = 'block';
        return true;
      }
      return false;
    });

    if (toastTriggered) {
      await page.waitForTimeout(300);
      await page.screenshot({ path: "test-results/deep-ui/14-toast.png", fullPage: true });

      const toastData = await page.evaluate(() => {
        const toast = document.querySelector('#toast');
        const computed = window.getComputedStyle(toast);
        return {
          type: 'toast',
          text: toast.textContent,
          fontSize: computed.fontSize,
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          border: computed.border,
          borderRadius: computed.borderRadius,
          padding: computed.padding
        };
      });

      uiData.texts.push(toastData);
    }
  });

  test("场景11: 触摸控制按钮（移动端）", async ({ page }) => {
    await skipLogin(page);
    await skipInitialModal(page);

    // 模拟移动设备
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    // 截图：移动端视图
    await page.screenshot({ path: "test-results/deep-ui/15-mobile-view.png", fullPage: true });

    // 提取触摸按钮
    const touchButtons = await page.evaluate(() => {
      const buttons = [];
      document.querySelectorAll('.touch-btn').forEach(btn => {
        const computed = window.getComputedStyle(btn);
        buttons.push({
          type: 'touch-button',
          action: btn.getAttribute('data-action'),
          width: computed.width,
          height: computed.height,
          fontSize: computed.fontSize,
          backgroundColor: computed.backgroundColor,
          borderRadius: computed.borderRadius
        });
      });
      return buttons;
    });

    uiData.buttons.push(...touchButtons);
    console.log(`提取了 ${touchButtons.length} 个触摸按钮`);
  });

  test.afterAll(async () => {
    // 生成完整报告
    const report = {
      testDate: new Date().toISOString(),
      summary: {
        totalScreenshots: uiData.screenshots.length,
        totalModals: uiData.modals.length,
        totalButtons: uiData.buttons.length,
        totalTexts: uiData.texts.length
      },
      data: uiData
    };

    // 保存报告（使用动态import）
    const fs = await import('fs');
    fs.writeFileSync(
      'test-results/deep-ui/ui-analysis-complete.json',
      JSON.stringify(report, null, 2),
      'utf-8'
    );

    console.log('\n========== 深度UI测试完成 ==========');
    console.log(`截图数量: ${report.summary.totalScreenshots}`);
    console.log(`弹窗数量: ${report.summary.totalModals}`);
    console.log(`按钮数量: ${report.summary.totalButtons}`);
    console.log(`文本元素: ${report.summary.totalTexts}`);
    console.log('完整报告: test-results/deep-ui/ui-analysis-complete.json');
    console.log('========================================\n');
  });
});

// ========== 辅助函数 ==========

async function skipLogin(page) {
  const loginScreen = page.locator("#login-screen");
  const isLoginVisible = await loginScreen.isVisible({ timeout: 2000 }).catch(() => false);

  if (isLoginVisible) {
    await page.fill("#username-input", "测试用户");
    await page.click("#btn-login");
    await page.waitForTimeout(1000);
  }
}

async function skipInitialModal(page) {
  const skipBtn = page.locator("#btn-overlay-skip");
  if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await skipBtn.click();
    await page.waitForTimeout(500);
  } else {
    const startBtn = page.locator("#btn-overlay-action");
    if (await startBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await startBtn.click();
      await page.waitForTimeout(1000);
    }
  }
}

async function extractModalData(page, selector, name) {
  return await page.evaluate(({ sel, modalName }) => {
    const modal = document.querySelector(sel);
    if (!modal || !modal.classList.contains('visible')) {
      return null;
    }

    const container = modal.querySelector('.overlay-card, .modal, .settings-panel, .learning-modal-content, .armor-modal-content') || modal;
    const computed = window.getComputedStyle(container);

    // 提取标题
    const title = modal.querySelector('.overlay-title, .modal-header, .settings-title, .learning-modal-header, .armor-modal-header');
    const titleComputed = title ? window.getComputedStyle(title) : null;

    // 提取按钮
    const buttons = [];
    modal.querySelectorAll('button, .btn, .overlay-btn, .game-btn').forEach(btn => {
      if (btn.offsetParent !== null) { // 只提取可见按钮
        const btnComputed = window.getComputedStyle(btn);
        buttons.push({
          text: btn.textContent.trim(),
          fontSize: btnComputed.fontSize,
          backgroundColor: btnComputed.backgroundColor,
          color: btnComputed.color,
          borderRadius: btnComputed.borderRadius,
          padding: btnComputed.padding
        });
      }
    });

    return {
      modal: modalName,
      container: {
        backgroundColor: computed.backgroundColor,
        border: computed.border,
        borderRadius: computed.borderRadius,
        padding: computed.padding,
        maxWidth: computed.maxWidth
      },
      title: titleComputed ? {
        fontSize: titleComputed.fontSize,
        fontWeight: titleComputed.fontWeight,
        color: titleComputed.color,
        textShadow: titleComputed.textShadow
      } : null,
      buttons: buttons
    };
  }, { sel: selector, modalName: name });
}
