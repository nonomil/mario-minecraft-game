import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function read(relPath) {
  return fs.readFileSync(path.join(repoRoot, relPath), "utf8");
}

function rebuildOfflineArtifacts() {
  execFileSync(process.execPath, [path.join(repoRoot, "tools", "build-singlefile.js")], {
    cwd: repoRoot,
    stdio: "ignore"
  });

  const outPath = path.join(repoRoot, "out", "Game.offline.html");
  const androidWebDir = path.join(repoRoot, "android-app", "web");
  const androidIndexPath = path.join(androidWebDir, "index.html");
  const buildDir = path.join(repoRoot, "build");
  const buildIndexPath = path.join(buildDir, "index.html");
  fs.mkdirSync(androidWebDir, { recursive: true });
  fs.mkdirSync(buildDir, { recursive: true });
  fs.copyFileSync(outPath, androidIndexPath);
  fs.copyFileSync(outPath, buildIndexPath);
}

function assertOfflineBundleIncludesLatestVocabSwitching(bundlePath) {
  const html = read(bundlePath);

  assert.match(
    html,
    /LEGACY_VOCAB_SELECTION_ALIASES/,
    `${bundlePath} 应内联最新词库兼容映射，避免旧存档词库 id 在离线/APK 包中失效`
  );
  assert.match(
    html,
    /normalizeVocabSelectionId/,
    `${bundlePath} 应包含词库选择归一化逻辑`
  );
  assert.match(
    html,
    /vocab\.kindergarten\.basic/,
    `${bundlePath} 应包含幼儿园旧 id 兼容映射`
  );
  assert.match(
    html,
    /vocab\.elementary_lower/,
    `${bundlePath} 应包含小学旧 id 兼容映射`
  );
  assert.doesNotMatch(
    html,
    /<script\b[^>]*\bsrc=(["'])(?:src\/|words\/vocabs\/)[^"']+\1/i,
    `${bundlePath} 不应残留任何本地脚本外链，否则 file:// / APK 单文件模式下仍会失效`
  );
  assert.match(
    html,
    /const\s+VOCAB_2_MINECRAFT____INTERMEDIATE\s*=\s*VOCAB_2_MINECRAFT____BASIC\s*;/,
    `${bundlePath} 应内联 Minecraft 中级词库兼容导出，避免 manifest 命中空全局`
  );
  assert.match(
    html,
    /const\s+MINECRAFT_WORDS_FULL\s*=\s*MINECRAFT_3_____\s*;/,
    `${bundlePath} 应内联 Minecraft 完整词库兼容导出`
  );
  assert.match(
    html,
    /const\s+kindergartenHanzi\s*=\s*\[/,
    `${bundlePath} 应内联汉字词库浏览器兼容导出`
  );
  assert.match(
    html,
    /"word":\s*"Diamond"/,
    `${bundlePath} 应包含 Minecraft 中级词库的实际数据`
  );
  assert.match(
    html,
    /"word":\s*"Air"/,
    `${bundlePath} 应包含 Minecraft 完整词库的实际数据`
  );
  assert.match(
    html,
    /createHanziEntry\(\{\s*character:\s*"人",\s*pinyin:\s*"rén",\s*english:\s*"person"/,
    `${bundlePath} 应包含新的单字汉字词库实际数据`
  );
  assert.doesNotMatch(
    html,
    /word:\s*["']smile["']/,
    `${bundlePath} 不应再残留旧的英文词条式汉字数据`
  );
}

function run() {
  rebuildOfflineArtifacts();
  assertOfflineBundleIncludesLatestVocabSwitching("out/Game.offline.html");
  assertOfflineBundleIncludesLatestVocabSwitching("android-app/web/index.html");
  assertOfflineBundleIncludesLatestVocabSwitching("build/index.html");
  console.log("offline vocab bundle regression checks passed");
}

run();
