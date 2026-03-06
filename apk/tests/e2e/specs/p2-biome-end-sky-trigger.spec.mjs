import { expect, test } from "@playwright/test";

test("P2 End biome should be unlockable at score 3800+", async ({ request }) => {
  const resp = await request.get("/config/biomes.json");
  expect(resp.ok()).toBeTruthy();
  const cfg = await resp.json();

  // Verify End biome exists and has correct unlock score
  expect(cfg.switch.unlockScore.end).toBe(3800);
  expect(cfg.biomes.end).toBeDefined();
  expect(cfg.biomes.end.id).toBe("end");
  expect(cfg.biomes.end.name).toBe("End");
});

test("P2 Sky Dimension biome should be unlockable at score 5000+", async ({ request }) => {
  const resp = await request.get("/config/biomes.json");
  expect(resp.ok()).toBeTruthy();
  const cfg = await resp.json();

  // Verify Sky Dimension biome exists and has correct unlock score
  expect(cfg.switch.unlockScore.sky_dimension).toBe(5000);
  expect(cfg.biomes.sky_dimension).toBeDefined();
  expect(cfg.biomes.sky_dimension.id).toBe("sky_dimension");
  expect(cfg.biomes.sky_dimension.name).toBe("Sky Dimension");
});

test("P2 End biome should have low gravity effects", async ({ request }) => {
  const resp = await request.get("/config/biomes.json");
  expect(resp.ok()).toBeTruthy();
  const cfg = await resp.json();

  const endBiome = cfg.biomes.end;
  expect(endBiome.effects).toBeDefined();
  expect(endBiome.effects.gravityMultiplier).toBeDefined();
  expect(endBiome.effects.gravityMultiplier).toBeLessThan(1);
  expect(endBiome.effects.jumpMultiplier).toBeGreaterThan(1);
});

test("P2 Sky Dimension should have wind mechanics config", async ({ request }) => {
  const resp = await request.get("/config/biomes.json");
  expect(resp.ok()).toBeTruthy();
  const cfg = await resp.json();

  const skyBiome = cfg.biomes.sky_dimension;
  expect(skyBiome.effects).toBeDefined();
  expect(skyBiome.effects.gravityMultiplier).toBe(0.8);
  expect(skyBiome.effects.jumpMultiplier).toBe(1.3);
  expect(skyBiome.effects.particles).toBe("golden_sparkle");
  expect(skyBiome.groundType).toBe("cloud");
});

test("P2 biome switching logic should include End and Sky in order", async ({ request }) => {
  const resp = await request.get("/config/biomes.json");
  expect(resp.ok()).toBeTruthy();
  const cfg = await resp.json();

  const order = cfg.switch.order;
  expect(order).toContain("end");
  expect(order).toContain("sky_dimension");

  // Sky Dimension should come after End in progression
  const endIndex = order.indexOf("end");
  const skyIndex = order.indexOf("sky_dimension");
  expect(skyIndex).toBeGreaterThan(endIndex);
});

test("P2 End biome environment code should exist", async ({ request }) => {
  const resp = await request.get("/src/modules/06-biome.js");
  expect(resp.ok()).toBeTruthy();
  const code = await resp.text();

  // Verify End environment functions exist
  expect(code).toContain("updateEndEnvironment");
  expect(code).toContain("renderEndEnvironment");
  expect(code).toContain("renderEndEntities");
  expect(code).toContain("clearEndEntities");

  // Verify End-specific mechanics
  expect(code).toContain("endPortals");
  expect(code).toContain("endCrystals");
  expect(code).toContain("endCreatures");
  expect(code).toContain("gravityMultiplier");
});

test("P2 Sky Dimension wind system code should exist", async ({ request }) => {
  const resp = await request.get("/src/modules/06-biome.js");
  expect(resp.ok()).toBeTruthy();
  const code = await resp.text();

  // Verify Sky wind system functions exist
  expect(code).toContain("updateSkyWindSystem");
  expect(code).toContain("renderSkyWindZones");
  expect(code).toContain("ensureSkyWindZones");
  expect(code).toContain("recycleSkyWindZones");

  // Verify wind mechanics
  expect(code).toContain("skyWindZones");
  expect(code).toContain("SKY_WIND_TYPES");
  expect(code).toContain("applySkyWindForceToPlayer");
});
