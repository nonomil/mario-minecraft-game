import { expect, test } from "@playwright/test";

async function openGameAndBoot(page) {
  await page.goto("/Game.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.MMWG_TEST_API !== "undefined");
  await page.waitForFunction(() => typeof window.MMWG_STORAGE !== "undefined");

  await page.evaluate(async () => {
    const username = `pw_phrase_follow_${Date.now()}`;
    const account = window.MMWG_STORAGE.createAccount(username);
    await window.MMWG_TEST_API.actions.loginWithAccount(account, { mode: "continue" });
    window.MMWG_TEST_API.actions.bootGameLoopIfNeeded();
    if (typeof paused !== "undefined") paused = false;
    if (typeof pausedByModal !== "undefined") pausedByModal = false;
    if (typeof setOverlay === "function") setOverlay(false);
  });

  await page.waitForFunction(() => window.MMWG_TEST_API.getState().startedOnce === true, null, { timeout: 30_000 });
  await page.waitForFunction(() => typeof pickWordForSpawn === "function", null, { timeout: 30_000 });
}

async function pickWordWithPhrase(page, maxTries = 240) {
  return page.evaluate((tries) => {
    let picked = null;
    for (let i = 0; i < tries; i++) {
      const w = pickWordForSpawn();
      if (!w || w.__followUpPhrase) continue;
      if (!String(w.phrase || "").trim()) continue;
      picked = w;
      break;
    }
    if (!picked) return null;
    return {
      en: picked.en,
      phrase: picked.phrase,
      zh: picked.zh
    };
  }, maxTries);
}

async function pickSequenceFromFreshQueue(page, maxTries = 120) {
  return page.evaluate((tries) => {
    for (let i = 0; i < tries; i++) {
      if (typeof followUpQueue !== "undefined" && Array.isArray(followUpQueue)) followUpQueue.length = 0;
      const source = pickWordForSpawn();
      if (!source || source.__followUpPhrase) continue;
      if (!String(source.phrase || "").trim()) continue;
      const a = pickWordForSpawn();
      const b = pickWordForSpawn();
      const c = pickWordForSpawn();
      const map = (w) => (w ? { en: w.en, follow: !!w.__followUpPhrase, source: w.__sourceWordEn || "" } : null);
      return {
        source: { en: source.en, phrase: source.phrase, zh: source.zh || "" },
        seq: { a: map(a), b: map(b), c: map(c) }
      };
    }
    return null;
  }, maxTries);
}

test("P1 direct mode should spawn follow-up phrase immediately", async ({ page }) => {
  await openGameAndBoot(page);

  const result = await page.evaluate(() => {
    if (typeof settings !== "undefined" && settings) {
      settings.phraseFollowMode = "direct";
      settings.phraseFollowGapCount = 2;
      settings.phraseFollowDirectRatio = 1;
      settings.avoidWordRepeats = false;
    }
    if (typeof wordPicker !== "undefined") wordPicker = null;
    if (typeof followUpQueue !== "undefined" && Array.isArray(followUpQueue)) followUpQueue.length = 0;
    if (typeof startLevel === "function") startLevel(0);
    return true;
  });
  expect(result).toBeTruthy();

  const source = await pickWordWithPhrase(page);
  expect(source).toBeTruthy();

  const next = await page.evaluate(() => {
    const w = pickWordForSpawn();
    return w ? { en: w.en, follow: !!w.__followUpPhrase, source: w.__sourceWordEn || "" } : null;
  });
  expect(next).toBeTruthy();
  expect(next.follow).toBeTruthy();
  expect(next.en).toBe(source.phrase);
  expect(next.source).toBe(source.en);
});

test("P1 gap2 mode should spawn follow-up phrase after two normal words", async ({ page }) => {
  await openGameAndBoot(page);

  await page.evaluate(() => {
    if (typeof settings !== "undefined" && settings) {
      settings.phraseFollowMode = "gap2";
      settings.phraseFollowGapCount = 2;
      settings.phraseFollowDirectRatio = 0;
      settings.avoidWordRepeats = false;
    }
    if (typeof wordPicker !== "undefined") wordPicker = null;
    if (typeof followUpQueue !== "undefined" && Array.isArray(followUpQueue)) followUpQueue.length = 0;
    if (typeof startLevel === "function") startLevel(0);
  });

  const picked = await pickSequenceFromFreshQueue(page);
  expect(picked).toBeTruthy();
  const source = picked.source;
  const seq = picked.seq;

  expect(seq.a).toBeTruthy();
  expect(seq.b).toBeTruthy();
  expect(seq.c).toBeTruthy();
  expect(seq.a.follow).toBeFalsy();
  expect(seq.b.follow).toBeFalsy();
  expect(seq.c.follow).toBeTruthy();
  expect(seq.c.en).toBe(source.phrase);
  expect(seq.c.source).toBe(source.en);
});
