import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const outputPath = path.join(repoRoot, "out", "Game.offline.html");

function testBuildSinglefileSupportsVersionedModuleScripts() {
  execFileSync(process.execPath, [path.join(repoRoot, "tools", "build-singlefile.js")], {
    cwd: repoRoot,
    stdio: "pipe",
  });

  const html = fs.readFileSync(outputPath, "utf8");
  assert.ok(html.includes("const defaultGameConfig = defaults.gameConfig || {};"), "singlefile 输出应内联模块代码");
  assert.doesNotMatch(
    html,
    /<script[^>]+src=(["'])src\/modules\/[^"']+\1/i,
    "singlefile 输出不应残留模块脚本 src"
  );
}

function run() {
  testBuildSinglefileSupportsVersionedModuleScripts();
  console.log("build singlefile query param regression checks passed");
}

run();
