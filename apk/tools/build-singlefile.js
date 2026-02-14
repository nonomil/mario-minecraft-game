import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function replaceOnce(haystack, needle, replacement, label) {
  const idx = haystack.indexOf(needle);
  if (idx === -1) {
    throw new Error(`Missing ${label || "pattern"}: ${needle}`);
  }
  return haystack.replace(needle, replacement);
}

function buildPreludeDataScript(data) {
  const dataText = JSON.stringify(data, null, 2);
  return `(() => {
  const data = ${dataText};
  const originalFetch = window.fetch ? window.fetch.bind(window) : null;
  window.fetch = function(input, init){
    const url = typeof input === 'string' ? input : (input && input.url ? input.url : '');
    const key = url.replace(/^(\\.\\.\\/)+/, '');
    if (data && Object.prototype.hasOwnProperty.call(data, key)) {
      const body = JSON.stringify(data[key]);
      return Promise.resolve(new Response(body, { status: 200, headers: { 'Content-Type': 'application/json' } }));
    }
    return originalFetch ? originalFetch(input, init) : Promise.reject(new Error('offline fetch blocked: ' + url));
  };

  const head = document.head;
  const originalAppend = head.appendChild.bind(head);
  head.appendChild = function(node){
    try {
      if (node && node.tagName === 'SCRIPT' && node.src && node.src.indexOf('words/vocabs/') !== -1) {
        setTimeout(() => { if (typeof node.onload === 'function') node.onload(); }, 0);
        return node;
      }
    } catch {}
    return originalAppend(node);
  };
})();`;
}

function extractVocabFilesFromManifest(manifestJs) {
  const files = [];
  // Match both "file:" and strings in "files:" arrays
  const re = /"(words\/vocabs\/[^"]+\.js)"/g;
  let m;
  while ((m = re.exec(manifestJs))) {
    files.push(m[1]);
  }
  return Array.from(new Set(files));
}

function makeInlineScript(content) {
  return `<script>\n${content}\n</script>`;
}

function makeInlineStyle(css) {
  return `<style>\n${css}\n</style>`;
}

function buildSingleFile({ projectRoot, templateHtmlPath, outPath }) {
  const templateHtml = readText(templateHtmlPath);

  const stylesCss = readText(path.join(projectRoot, "src", "styles.css"));
  const defaultsJs = readText(path.join(projectRoot, "src", "defaults.js"));
  const storageJs = readText(path.join(projectRoot, "src", "storage.js"));
  const manifestJs = readText(path.join(projectRoot, "words", "vocabs", "manifest.js"));

  // Read all module files in order
  const moduleFiles = [
    "01-config.js", "02-utils.js", "03-audio.js", "04-weapons.js",
    "05-difficulty.js", "06-biome.js", "07-viewport.js", "08-account.js",
    "09-vocab.js", "10-ui.js", "11-game-init.js", "12-challenges.js",
    "13-game-loop.js", "14-renderer-main.js", "14-renderer-entities.js",
    "14-renderer-decorations.js", "15-entities-base.js", "15-entities-decorations.js",
    "15-entities-particles.js", "15-entities-combat.js", "16-events.js",
    "17-bootstrap.js"
  ];
  const moduleScripts = moduleFiles.map(f => {
    const content = readText(path.join(projectRoot, "src", "modules", f));
    return makeInlineScript(content);
  }).join("\n");

  const vocabFiles = extractVocabFilesFromManifest(manifestJs);
  const vocabScripts = vocabFiles.map((f) => makeInlineScript(readText(path.join(projectRoot, f)))).join("\n");

  const embeddedJson = {
    "config/game.json": readJson(path.join(projectRoot, "config", "game.json")),
    "config/controls.json": readJson(path.join(projectRoot, "config", "controls.json")),
    "config/levels.json": readJson(path.join(projectRoot, "config", "levels.json")),
    "config/biomes.json": readJson(path.join(projectRoot, "config", "biomes.json")),
    "words/words-base.json": readJson(path.join(projectRoot, "words", "words-base.json")),
  };

  const preludeScript = buildPreludeDataScript(embeddedJson);

  let html = templateHtml;
  html = replaceOnce(
    html,
    `<link rel="stylesheet" href="src/styles.css">`,
    makeInlineStyle(stylesCss),
    "stylesheet link"
  );
  html = replaceOnce(
    html,
    `<script src="src/defaults.js"></script>`,
    makeInlineScript(defaultsJs),
    "defaults script"
  );
  html = replaceOnce(
    html,
    `<script src="src/storage.js"></script>`,
    makeInlineScript(storageJs),
    "storage script"
  );
  html = replaceOnce(
    html,
    `<script src="words/vocabs/manifest.js"></script>`,
    `${makeInlineScript(manifestJs)}\n${vocabScripts}\n${makeInlineScript(preludeScript)}`,
    "manifest script"
  );

  // Replace all module script tags with inline scripts
  moduleFiles.forEach(f => {
    const pattern = `<script src="src/modules/${f}"></script>`;
    if (html.indexOf(pattern) !== -1) {
      html = html.replace(pattern, makeInlineScript(readText(path.join(projectRoot, "src", "modules", f))));
    }
  });

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, "utf8");
}

function main() {
  const projectRoot = path.resolve(__dirname, "..");
  const templateHtmlPath = path.join(projectRoot, "Game.html");

  buildSingleFile({
    projectRoot,
    templateHtmlPath,
    outPath: path.join(projectRoot, "out", "Game.offline.html"),
  });

  buildSingleFile({
    projectRoot,
    templateHtmlPath,
    outPath: path.join(projectRoot, "out", "Minecraft_Mario_Words_Game.html"),
  });
}

main();
