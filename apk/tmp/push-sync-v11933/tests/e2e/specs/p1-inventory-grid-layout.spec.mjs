import { test, expect } from "@playwright/test";

test.describe("背包网格布局", () => {
  test("切换分页时应用对应布局类", async ({ page }) => {
    await page.goto("/Game.html");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1200);

    const skipBtn = page.locator("#btn-overlay-skip");
    if (await skipBtn.isVisible().catch(() => false)) {
      await skipBtn.click({ force: true });
      await page.waitForTimeout(200);
    }

    await page.click("#btn-inventory", { force: true });
    await expect(page.locator("#inventory-modal")).toHaveClass(/visible/);

    const content = page.locator("#inventory-content");

    await expect(content).toHaveClass(/inventory-tab-items/);

    await page.click('.inventory-tab[data-tab="materials"]', { force: true });
    await expect(content).toHaveClass(/inventory-tab-materials/);

    await page.click('.inventory-tab[data-tab="equipment"]', { force: true });
    await expect(content).toHaveClass(/inventory-tab-equipment/);

    const tabCount = await page.locator(".inventory-tab").count();
    expect(tabCount).toBeGreaterThanOrEqual(3);
  });
});
