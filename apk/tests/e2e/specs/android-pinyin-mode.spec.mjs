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

  const bridgeState = await page.evaluate(() => ({
    selection: settings?.vocabSelection || "",
    active: typeof activeVocabPackId !== "undefined" ? activeVocabPackId : ""
  }));
  expect(bridgeState.selection).toBe("vocab.bridge.auto");
  expect(["vocab.bridge.language", "vocab.bridge.math", "vocab.bridge.english"]).toContain(bridgeState.active);

  const displayCheck = await page.evaluate(() => {
    const word = { word: "天空", chinese: "天空", pinyin: "tian kong", subject: "language" };
    const display = window.BilingualVocab?.getDisplayContent?.(word);
    return { primary: display?.primaryText || "", secondary: display?.secondaryText || "" };
  });
  expect(displayCheck.primary).toBe("天空");
  expect(displayCheck.secondary).toBe("tian kong");

  const wordCardCheck = await page.evaluate(() => {
    const card = document.getElementById("word-card");
    const en = document.getElementById("word-card-en");
    const zh = document.getElementById("word-card-zh");
    showWordCard({ word: "天空", chinese: "天空", pinyin: "tian kong", subject: "language" });
    const languageState = {
      visible: card?.classList.contains("visible") || false,
      en: en?.innerText || "",
      zh: zh?.innerText || ""
    };
    showWordCard({ word: "加法", chinese: "加法", subject: "math" });
    const mathVisible = card?.classList.contains("visible") || false;
    return { languageState, mathVisible };
  });
  expect(wordCardCheck.languageState.visible).toBeTruthy();
  expect(wordCardCheck.languageState.en).toBe("天空");
  expect(wordCardCheck.languageState.zh).toBe("tian kong");
  expect(wordCardCheck.mathVisible).toBeFalsy();

  const speakCheck = await page.evaluate(() => {
    if (typeof getSpeakSequence !== "function") return null;
    const seq = getSpeakSequence({ word: "天空", chinese: "天空", pinyin: "tian kong", english: "sky" });
    return seq.map((item) => item.lang);
  });
  expect(speakCheck).toEqual(["zh-CN"]);
});
