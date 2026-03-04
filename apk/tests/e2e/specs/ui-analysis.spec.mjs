import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

/**
 * UI一致性分析测试 - 改进版
 * 目标：自动化提取游戏中所有UI元素的样式信息，分析一致性问题
 */

test.describe("UI一致性分析", () => {
  let uiData = {
    buttons: [],
    modals: [],
    texts: [],
    colors: new Set(),
    fontSizes: new Set(),
    fontFamilies: new Set(),
    borderRadius: new Set(),
    paddings: new Set(),
    margins: new Set(),
    screenshots: []
  };

  test.beforeEach(async ({ page }) => {
    await page.goto("/Game.html");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);
  });

  test("提取初始弹窗UI元素", async ({ page }) => {
    // 等待初始弹窗出现
    const overlay = page.locator("#screen-overlay");
    await page.waitForTimeout(1000);

    // 截图
    await page.screenshot({ path: "test-results/ui-analysis-initial-modal.png" });
    uiData.screenshots.push("初始弹窗");

    // 提取弹窗容器样式
    const overlayCard = page.locator(".overlay-card");
    if (await overlayCard.isVisible()) {
      const overlayStyles = await overlayCard.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          element: "弹窗容器",
          location: "初始弹窗",
          backgroundColor: computed.backgroundColor,
          border: computed.border,
          borderRadius: computed.borderRadius,
          padding: computed.padding,
          boxShadow: computed.boxShadow,
          maxWidth: computed.maxWidth,
          width: computed.width
        };
      });
      uiData.modals.push(overlayStyles);
    }

    // 提取弹窗标题
    const overlayTitle = page.locator(".overlay-title");
    if (await overlayTitle.isVisible()) {
      const titleText = await overlayTitle.textContent();
      const titleStyles = await overlayTitle.evaluate((el, txt) => {
        const computed = window.getComputedStyle(el);
        return {
          element: `弹窗标题: ${txt}`,
          location: "初始弹窗",
          fontSize: computed.fontSize,
          fontFamily: computed.fontFamily,
          fontWeight: computed.fontWeight,
          color: computed.color,
          textShadow: computed.textShadow,
          marginBottom: computed.marginBottom
        };
      }, titleText);
      uiData.texts.push(titleStyles);
    }

    // 提取弹窗文本
    const overlayText = page.locator(".overlay-text");
    if (await overlayText.isVisible()) {
      const text = await overlayText.textContent();
      const textStyles = await overlayText.evaluate((el, txt) => {
        const computed = window.getComputedStyle(el);
        return {
          element: `弹窗文本: ${txt?.substring(0, 20)}...`,
          location: "初始弹窗",
          fontSize: computed.fontSize,
          fontFamily: computed.fontFamily,
          fontWeight: computed.fontWeight,
          color: computed.color,
          lineHeight: computed.lineHeight,
          marginBottom: computed.marginBottom
        };
      }, text);
      uiData.texts.push(textStyles);
    }

    // 提取所有弹窗按钮
    const overlayBtns = page.locator(".overlay-btn");
    const btnCount = await overlayBtns.count();
    for (let i = 0; i < btnCount; i++) {
      const btn = overlayBtns.nth(i);
      if (await btn.isVisible()) {
        const text = await btn.textContent();
        const styles = await btn.evaluate((el, txt) => {
          const computed = window.getComputedStyle(el);
          return {
            element: `弹窗按钮: ${txt}`,
            location: "初始弹窗",
            fontSize: computed.fontSize,
            fontFamily: computed.fontFamily,
            fontWeight: computed.fontWeight,
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            borderRadius: computed.borderRadius,
            padding: computed.padding,
            border: computed.border,
            height: computed.height,
            width: computed.width
          };
        }, text);
        uiData.buttons.push(styles);
      }
    }

    console.log(`初始弹窗UI数据: 按钮${uiData.buttons.length}, 文本${uiData.texts.length}, 弹窗${uiData.modals.length}`);
  });

  test("提取游戏主界面HUD元素", async ({ page }) => {
    // 关闭初始弹窗（如果有）
    const skipBtn = page.locator("#btn-overlay-skip");
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipBtn.click();
      await page.waitForTimeout(500);
    }

    // 截图
    await page.screenshot({ path: "test-results/ui-analysis-main-hud.png" });
    uiData.screenshots.push("游戏主界面HUD");

    // 提取HUD按钮样式
    const hudButtons = [
      { id: "#btn-inventory", name: "背包按钮" },
      { id: "#btn-save-progress", name: "存档按钮" },
      { id: "#btn-settings", name: "设置按钮" },
      { id: "#btn-profile", name: "档案按钮" },
      { id: "#btn-repeat-pause", name: "重读/暂停按钮" }
    ];

    for (const btn of hudButtons) {
      const element = page.locator(btn.id);
      if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
        const styles = await element.evaluate((el, name) => {
          const computed = window.getComputedStyle(el);
          return {
            element: name,
            location: "游戏主界面HUD",
            fontSize: computed.fontSize,
            fontFamily: computed.fontFamily,
            fontWeight: computed.fontWeight,
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            borderRadius: computed.borderRadius,
            padding: computed.padding,
            margin: computed.margin,
            width: computed.width,
            height: computed.height,
            border: computed.border
          };
        }, btn.name);
        uiData.buttons.push(styles);
      }
    }

    // 提取HUD信息框样式
    const hudBoxes = page.locator(".hud-box");
    const hudBoxCount = await hudBoxes.count();
    for (let i = 0; i < Math.min(hudBoxCount, 5); i++) {
      const box = hudBoxes.nth(i);
      if (await box.isVisible({ timeout: 1000 }).catch(() => false)) {
        const text = await box.textContent();
        const styles = await box.evaluate((el, txt) => {
          const computed = window.getComputedStyle(el);
          return {
            element: `HUD信息框: ${txt?.substring(0, 15)}`,
            location: "游戏主界面HUD",
            fontSize: computed.fontSize,
            fontFamily: computed.fontFamily,
            fontWeight: computed.fontWeight,
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            borderRadius: computed.borderRadius,
            padding: computed.padding,
            margin: computed.margin,
            border: computed.border
          };
        }, text);
        uiData.texts.push(styles);
      }
    }

    // 提取单词显示区域
    const wordDisplay = page.locator("#word-display");
    if (await wordDisplay.isVisible({ timeout: 1000 }).catch(() => false)) {
      const text = await wordDisplay.textContent();
      const styles = await wordDisplay.evaluate((el, txt) => {
        const computed = window.getComputedStyle(el);
        return {
          element: `单词显示: ${txt}`,
          location: "游戏主界面HUD",
          fontSize: computed.fontSize,
          fontFamily: computed.fontFamily,
          fontWeight: computed.fontWeight,
          color: computed.color,
          textShadow: computed.textShadow
        };
      }, text);
      uiData.texts.push(styles);
    }

    console.log(`游戏主界面HUD: 按钮${uiData.buttons.length}, 文本${uiData.texts.length}`);
  });

  test("提取设置界面UI元素", async ({ page }) => {
    // 关闭初始弹窗
    const skipBtn = page.locator("#btn-overlay-skip");
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipBtn.click();
      await page.waitForTimeout(500);
    }

    // 打开设置
    await page.click("#btn-settings");
    await page.waitForTimeout(1000);

    // 截图
    await page.screenshot({ path: "test-results/ui-analysis-settings.png" });
    uiData.screenshots.push("设置界面");

    const settingsModal = page.locator("#settings-modal");
    await expect(settingsModal).toBeVisible();

    // 提取设置面板样式
    const settingsPanel = page.locator(".settings-panel");
    const panelStyles = await settingsPanel.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        element: "设置面板",
        location: "设置界面",
        backgroundColor: computed.backgroundColor,
        border: computed.border,
        borderRadius: computed.borderRadius,
        padding: computed.padding,
        boxShadow: computed.boxShadow,
        maxWidth: computed.maxWidth
      };
    });
    uiData.modals.push(panelStyles);

    // 提取设置标题
    const settingsTitle = page.locator(".settings-title");
    const titleText = await settingsTitle.textContent();
    const titleStyles = await settingsTitle.evaluate((el, txt) => {
      const computed = window.getComputedStyle(el);
      return {
        element: `设置标题: ${txt}`,
        location: "设置界面",
        fontSize: computed.fontSize,
        fontFamily: computed.fontFamily,
        fontWeight: computed.fontWeight,
        color: computed.color,
        textShadow: computed.textShadow
      };
    }, titleText);
    uiData.texts.push(titleStyles);

    // 提取设置按钮
    const settingsBtns = page.locator(".settings-panel .game-btn");
    const btnCount = await settingsBtns.count();
    for (let i = 0; i < Math.min(btnCount, 5); i++) {
      const btn = settingsBtns.nth(i);
      if (await btn.isVisible()) {
        const text = await btn.textContent();
        const styles = await btn.evaluate((el, txt) => {
          const computed = window.getComputedStyle(el);
          return {
            element: `设置按钮: ${txt}`,
            location: "设置界面",
            fontSize: computed.fontSize,
            fontFamily: computed.fontFamily,
            fontWeight: computed.fontWeight,
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            borderRadius: computed.borderRadius,
            padding: computed.padding,
            margin: computed.margin,
            width: computed.width,
            height: computed.height,
            border: computed.border
          };
        }, text);
        uiData.buttons.push(styles);
      }
    }

    // 提取设置标签
    const settingsLabels = page.locator(".settings-label");
    const labelCount = await settingsLabels.count();
    for (let i = 0; i < Math.min(labelCount, 5); i++) {
      const label = settingsLabels.nth(i);
      if (await label.isVisible()) {
        const text = await label.textContent();
        const styles = await label.evaluate((el, txt) => {
          const computed = window.getComputedStyle(el);
          return {
            element: `设置标签: ${txt?.substring(0, 20)}`,
            location: "设置界面",
            fontSize: computed.fontSize,
            fontFamily: computed.fontFamily,
            fontWeight: computed.fontWeight,
            color: computed.color
          };
        }, text);
        uiData.texts.push(styles);
      }
    }

    console.log(`设置界面: 按钮${uiData.buttons.length}, 文本${uiData.texts.length}, 弹窗${uiData.modals.length}`);
  });

  test("提取触摸控制按钮", async ({ page }) => {
    // 关闭初始弹窗
    const skipBtn = page.locator("#btn-overlay-skip");
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipBtn.click();
      await page.waitForTimeout(500);
    }

    // 截图
    await page.screenshot({ path: "test-results/ui-analysis-touch-controls.png" });
    uiData.screenshots.push("触摸控制");

    // 提取触摸按钮
    const touchBtns = page.locator(".touch-btn");
    const btnCount = await touchBtns.count();
    for (let i = 0; i < Math.min(btnCount, 8); i++) {
      const btn = touchBtns.nth(i);
      if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
        const text = await btn.textContent();
        const action = await btn.getAttribute("data-action");
        const styles = await btn.evaluate((el, info) => {
          const computed = window.getComputedStyle(el);
          return {
            element: `触摸按钮: ${info.text} (${info.action})`,
            location: "触摸控制",
            fontSize: computed.fontSize,
            fontFamily: computed.fontFamily,
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            borderRadius: computed.borderRadius,
            padding: computed.padding,
            width: computed.width,
            height: computed.height,
            border: computed.border,
            opacity: computed.opacity
          };
        }, { text, action });
        uiData.buttons.push(styles);
      }
    }

    console.log(`触摸控制: 按钮${uiData.buttons.length}`);
  });

  test.afterAll(async () => {
    // 汇总所有样式值
    [...uiData.buttons, ...uiData.texts, ...uiData.modals].forEach(item => {
      if (item.fontSize) uiData.fontSizes.add(item.fontSize);
      if (item.fontFamily) uiData.fontFamilies.add(item.fontFamily);
      if (item.color) uiData.colors.add(item.color);
      if (item.backgroundColor) uiData.colors.add(item.backgroundColor);
      if (item.borderRadius) uiData.borderRadius.add(item.borderRadius);
      if (item.padding) uiData.paddings.add(item.padding);
      if (item.margin) uiData.margins.add(item.margin);
    });

    // 生成详细报告
    const report = {
      summary: {
        totalElements: uiData.buttons.length + uiData.texts.length + uiData.modals.length,
        buttons: uiData.buttons.length,
        texts: uiData.texts.length,
        modals: uiData.modals.length,
        screenshots: uiData.screenshots
      },
      consistency: {
        fontSizes: {
          count: uiData.fontSizes.size,
          values: Array.from(uiData.fontSizes).sort()
        },
        fontFamilies: {
          count: uiData.fontFamilies.size,
          values: Array.from(uiData.fontFamilies)
        },
        colors: {
          count: uiData.colors.size,
          values: Array.from(uiData.colors)
        },
        borderRadius: {
          count: uiData.borderRadius.size,
          values: Array.from(uiData.borderRadius).sort()
        },
        paddings: {
          count: uiData.paddings.size,
          values: Array.from(uiData.paddings).sort()
        }
      },
      details: {
        buttons: uiData.buttons,
        texts: uiData.texts,
        modals: uiData.modals
      }
    };

    // 保存JSON报告
    const reportPath = "test-results/ui-analysis-report.json";
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");

    // 输出控制台摘要
    console.log("\n========== UI一致性分析汇总 ==========");
    console.log(`\n总计提取元素: ${report.summary.totalElements}`);
    console.log(`- 按钮: ${report.summary.buttons}`);
    console.log(`- 文本: ${report.summary.texts}`);
    console.log(`- 弹窗/面板: ${report.summary.modals}`);

    console.log(`\n字体大小种类: ${report.consistency.fontSizes.count}`);
    console.log(report.consistency.fontSizes.values);

    console.log(`\n字体族种类: ${report.consistency.fontFamilies.count}`);
    console.log(report.consistency.fontFamilies.values);

    console.log(`\n颜色种类: ${report.consistency.colors.count}`);
    console.log(`(前10个) ${report.consistency.colors.values.slice(0, 10)}`);

    console.log(`\n圆角种类: ${report.consistency.borderRadius.count}`);
    console.log(report.consistency.borderRadius.values);

    console.log(`\n内边距种类: ${report.consistency.paddings.count}`);
    console.log(`(前10个) ${report.consistency.paddings.values.slice(0, 10)}`);

    console.log(`\n报告已保存: ${reportPath}`);
    console.log("========================================\n");
  });
});
