import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function readLaunchScript() {
  const launchScript = fs
    .readdirSync(repoRoot)
    .find((entry) => entry.endsWith(".bat") && !["dev.bat", "push.bat"].includes(entry));

  assert.ok(launchScript, "仓库根目录应存在启动游戏批处理脚本");
  return fs.readFileSync(path.join(repoRoot, launchScript), "utf8");
}

function testLaunchScriptCleansOccupiedPortBeforeStartingServer() {
  const source = readLaunchScript();

  assert.match(source, /set "GAME_PORT=4173"/, "启动脚本应以 4173 作为首选启动端口");
  assert.match(source, /for \/L %%P in \(%GAME_PORT%,1,%END_PORT%\) do \(/, "启动脚本应在首选端口不可用时继续尝试后续端口");
  assert.match(source, /call :prepare_port %%P/, "启动脚本应复用统一的端口准备逻辑");
  assert.match(source, /set "FINAL_PORT=%%P"/, "启动脚本应记录最终可用端口供后续启动和打开浏览器使用");
  assert.match(source, /taskkill \/PID !FOUND_PID! \/F/, "端口被占用时应显式结束占用 PID");
  assert.match(
    source,
    /taskkill \/PID !FOUND_PID! \/F[\s\S]*call :find_port_pid/,
    "结束占用进程后应重新检查 4173 端口是否已经释放"
  );
  assert.match(
    source,
    /无法释放端口[\s\S]*改试下一个端口/,
    "如果端口无法释放，脚本应继续尝试下一个端口，而不是直接撞到 EADDRINUSE"
  );
}

function run() {
  testLaunchScriptCleansOccupiedPortBeforeStartingServer();
  console.log("launch game port cleanup regression checks passed");
}

run();
