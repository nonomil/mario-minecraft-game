import { expect, test } from "@playwright/test";

async function openGameAndBoot(page) {
  await page.goto("/Game.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.MMWG_TEST_API !== "undefined");
  await page.waitForFunction(() => typeof window.MMWG_STORAGE !== "undefined");

  await page.evaluate(async () => {
    const username = `pw_chinese_mode_${Date.now()}`;
    const account = window.MMWG_STORAGE.createAccount(username);
    await window.MMWG_TEST_API.actions.loginWithAccount(account, { mode: "continue" });
    window.MMWG_TEST_API.actions.bootGameLoopIfNeeded();
    if (typeof paused !== "undefined") paused = false;
    if (typeof pauseStack === "number") pauseStack = 0;
    if (typeof setOverlay === "function") setOverlay(false);
  });

  await page.waitForFunction(() => window.MMWG_TEST_API.getState().startedOnce === true, null, { timeout: 30_000 });
}

test("P0 chinese mode should show Chinese-first card and speak Chinese then English", async ({ page }) => {
  await openGameAndBoot(page);

  const result = await page.evaluate(async () => {
    const calls = [];
    window.MMWG_TTS = {
      speak(text, lang, options = {}) {
        calls.push({
          text: String(text || ""),
          lang: String(lang || ""),
          rate: Number(options.rate || 0)
        });
        return Promise.resolve();
      }
    };

    window.MMWG_TEST_API.setState({
      settings: {
        languageMode: "chinese",
        speechEnabled: true,
        speechZhEnabled: true
      }
    });

    speakWord({
      en: "cat",
      zh: "猫",
      phrase: "a cat",
      phraseTranslation: "一只猫"
    });

    await new Promise(resolve => setTimeout(resolve, 50));

    return {
      calls,
      wordDisplay: document.getElementById("word-display")?.textContent || "",
      wordDisplaySub: document.getElementById("word-display-zh")?.textContent || "",
      cardTop: document.getElementById("word-card-en")?.textContent || "",
      cardBottom: document.getElementById("word-card-zh")?.textContent || "",
      phrase: document.getElementById("word-card-phrase")?.textContent || "",
      secondarySpeechLabel: document.getElementById("opt-speech-zh-enabled")?.closest("label")?.textContent?.trim() || ""
    };
  });

  expect(result.calls.map(item => item.text)).toEqual(["猫", "cat"]);
  expect(result.calls.map(item => item.lang)).toEqual(["zh-CN", "en-US"]);
  expect(result.wordDisplay).toBe("猫");
  expect(result.wordDisplaySub).toBe("cat");
  expect(result.cardTop).toBe("猫");
  expect(result.cardBottom).toBe("cat");
  expect(result.phrase).toBe("一只猫 · a cat");
  expect(result.secondarySpeechLabel).toContain("朗读英文释义");
});

test("P0 english mode should keep English-first card and speak English then Chinese", async ({ page }) => {
  await openGameAndBoot(page);

  const result = await page.evaluate(async () => {
    const calls = [];
    window.MMWG_TTS = {
      speak(text, lang, options = {}) {
        calls.push({
          text: String(text || ""),
          lang: String(lang || ""),
          rate: Number(options.rate || 0)
        });
        return Promise.resolve();
      }
    };

    window.MMWG_TEST_API.setState({
      settings: {
        languageMode: "english",
        speechEnabled: true,
        speechZhEnabled: true
      }
    });

    speakWord({
      en: "cat",
      zh: "猫",
      phrase: "a cat",
      phraseTranslation: "一只猫"
    });

    await new Promise(resolve => setTimeout(resolve, 50));

    return {
      calls,
      wordDisplay: document.getElementById("word-display")?.textContent || "",
      wordDisplaySub: document.getElementById("word-display-zh")?.textContent || "",
      cardTop: document.getElementById("word-card-en")?.textContent || "",
      cardBottom: document.getElementById("word-card-zh")?.textContent || "",
      phrase: document.getElementById("word-card-phrase")?.textContent || "",
      secondarySpeechLabel: document.getElementById("opt-speech-zh-enabled")?.closest("label")?.textContent?.trim() || ""
    };
  });

  expect(result.calls.map(item => item.text)).toEqual(["cat", "猫"]);
  expect(result.calls.map(item => item.lang)).toEqual(["en-US", "zh-CN"]);
  expect(result.wordDisplay).toBe("cat");
  expect(result.wordDisplaySub).toBe("猫");
  expect(result.cardTop).toBe("cat");
  expect(result.cardBottom).toBe("猫");
  expect(result.phrase).toBe("a cat · 一只猫");
  expect(result.secondarySpeechLabel).toContain("朗读中文释义");
});
