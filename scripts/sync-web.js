const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
execFileSync(process.execPath, [path.join(repoRoot, "tools", "build-singlefile.js")], {
  cwd: repoRoot,
  stdio: "inherit",
});

const src = path.join(repoRoot, "out", "Game.offline.html");
const dstDir = path.join(repoRoot, "android-app", "web");
const dst = path.join(dstDir, "index.html");

fs.mkdirSync(dstDir, { recursive: true });
fs.copyFileSync(src, dst);
