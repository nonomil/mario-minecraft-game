import assert from "node:assert/strict";
import fs from "node:fs";

function read(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function testBootstrapDisablesServiceWorkerOnLocalhost() {
  const source = read("src/modules/17-bootstrap.js");
  assert.match(source, /localhost|127\.0\.0\.1/, "localhost 环境应被识别出来");
  assert.match(source, /navigator\.serviceWorker\.getRegistrations\(/, "localhost 下应主动获取并注销旧 SW");
  assert.match(source, /caches\.keys\(/, "localhost 下应主动清理旧缓存");
}

function testDebugPageClearsCachesBeforeLoadingGame() {
  const source = read("tests/debug-pages/GameDebug.html");
  assert.match(source, /async function resetDebugCaches\(/, "debug 页应在加载游戏前清理缓存");
  assert.match(source, /navigator\.serviceWorker\.getRegistrations\(/, "debug 页应注销旧 SW");
  assert.match(source, /gameFrame\.src = `\.\.\/\.\.\/Game\.html\?debug_frame_ts=/, "debug 页应在清缓存后重新设置 iframe src");
}


function testGameHtmlVersionsLocalAssets() {
  const gameHtml = read("Game.html");
  const version = JSON.parse(read("version.json")).versionName;
  const assetUrls = [...gameHtml.matchAll(/<(?:script|link)[^>]+(?:src|href)="([^"]+)"/g)].map((match) => match[1]);
  const localAssets = assetUrls.filter((url) => !url.startsWith("#"));

  assert.ok(localAssets.length > 0, "Game.html 应包含本地静态资源");
  for (const url of localAssets) {
    assert.ok(url.endsWith(`?v=${version}`), `资源应绑定当前版本号避免旧 SW 命中缓存: ${url}`);
  }
}

function run() {
  testBootstrapDisablesServiceWorkerOnLocalhost();
  testDebugPageClearsCachesBeforeLoadingGame();
  testGameHtmlVersionsLocalAssets();
  console.log("dev cache busting regression checks passed");
}

run();
