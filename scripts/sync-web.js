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

// Copy optional audio assets if present.
const audioSrc = path.join(repoRoot, "audio");
const audioDst = path.join(dstDir, "audio");
if (fs.existsSync(audioSrc)) {
  const copyDir = (from, to) => {
    fs.mkdirSync(to, { recursive: true });
    for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
      const srcPath = path.join(from, entry.name);
      const dstPath = path.join(to, entry.name);
      if (entry.isDirectory()) {
        copyDir(srcPath, dstPath);
      } else if (entry.isFile()) {
        fs.copyFileSync(srcPath, dstPath);
      }
    }
  };
  copyDir(audioSrc, audioDst);
}
