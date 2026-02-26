import { test, expect } from "@playwright/test";

test("task7: manifest is accessible", async ({ request }) => {
  const resp = await request.get("/manifest.json");
  expect(resp.ok()).toBeTruthy();
  const json = await resp.json();
  expect(json.name).toBeTruthy();
  expect(json.start_url).toBeTruthy();
});

test("task7: service worker script is accessible", async ({ request }) => {
  const resp = await request.get("/service-worker.js");
  expect(resp.ok()).toBeTruthy();
});
