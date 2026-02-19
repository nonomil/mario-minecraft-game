import { expect, test } from "@playwright/test";

test("P2 biome switch config should match expected balance values", async ({ request }) => {
  const resp = await request.get("/config/biomes.json");
  expect(resp.ok()).toBeTruthy();
  const cfg = await resp.json();

  expect(cfg.switch.stepScore).toBe(300);
  expect(cfg.switch.minStay.volcano).toEqual({ score: 320, timeSec: 70 });
  expect(cfg.switch.minStay.nether).toEqual({ score: 360, timeSec: 75 });
});

test("P2 settings slider min should prevent flash switching", async ({ request }) => {
  const gameHtmlResp = await request.get("/Game.html");
  expect(gameHtmlResp.ok()).toBeTruthy();
  const gameHtml = await gameHtmlResp.text();
  expect(gameHtml).toContain('id="opt-biome-step" type="range" min="150"');

  const vocabResp = await request.get("/src/modules/09-vocab.js");
  expect(vocabResp.ok()).toBeTruthy();
  const vocabJs = await vocabResp.text();
  expect(vocabJs).toContain("Math.max(150, Math.min(2000, Number(merged.biomeSwitchStepScore) || 300))");
});

