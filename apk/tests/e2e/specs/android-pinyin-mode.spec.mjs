import { expect, test } from "@playwright/test";

test("Android offline pinyin mode should start game with player", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (err) => {
    pageErrors.push(err?.message || String(err));
  });

  await page.goto("/android-app/web/index.html");
  await page.getByRole("button", { name: /幼小衔接/ }).click();
  await page.getByRole("button", { name: "选择档案" }).click();
  await page.getByRole("textbox", { name: "输入昵称/档案名" }).fill("pinyin");
  await page.getByRole("button", { name: "创建/进入" }).click();
  await page.getByRole("button", { name: "开始游戏" }).click();

  await page.waitForFunction(() => {
    return typeof player !== "undefined" && !!player && typeof player.x === "number";
  });

  const playerInfo = await page.evaluate(() => {
    if (typeof player === "undefined" || !player) return null;
    return { x: player.x, y: player.y };
  });
  expect(playerInfo).toBeTruthy();
  expect(pageErrors.some((msg) => msg.includes("BRIDGE_PINYIN_OVERRIDES"))).toBeFalsy();
});
