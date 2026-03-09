import { expect, test } from "@playwright/test";

test("P0 render path should avoid double camera offset", async ({ request }) => {
  const resp = await request.get("/src/modules/14-renderer-entities.js");
  expect(resp.ok()).toBeTruthy();
  const text = await resp.text();

  expect(text).toContain("bossArena.renderBoss(ctx, 0)");
  expect(text).toContain("bossArena.renderProjectiles(ctx, 0)");
  expect(text).not.toContain("bossArena.renderBoss(ctx, cameraX)");
  expect(text).not.toContain("bossArena.renderProjectiles(ctx, cameraX)");
});

