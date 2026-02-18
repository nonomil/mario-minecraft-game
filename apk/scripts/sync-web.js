import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const repoRoot = path.resolve(__dirname, "..");
execFileSync(process.execPath, [path.join(repoRoot, "tools", "vocab-db", "publish.mjs")], {
  cwd: repoRoot,
  stdio: "inherit",
});
execFileSync(process.execPath, [path.join(repoRoot, "tools", "build-singlefile.js")], {
  cwd: repoRoot,
  stdio: "inherit",
});

const src = path.join(repoRoot, "out", "Game.offline.html");
const dstDir = path.join(repoRoot, "android-app", "web");
const dst = path.join(dstDir, "index.html");

fs.mkdirSync(dstDir, { recursive: true });
fs.copyFileSync(src, dst);
