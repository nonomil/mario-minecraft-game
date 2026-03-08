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

function stripQueryAndHash(p) {
  const q = p.indexOf("?");
  const h = p.indexOf("#");
  let end = p.length;
  if (q !== -1) end = Math.min(end, q);
  if (h !== -1) end = Math.min(end, h);
  return p.slice(0, end);
}

function normalizeRelPath(p) {
  let s = p.trim();
  s = stripQueryAndHash(s);
  if (s.startsWith("./")) s = s.slice(2);
  while (s.startsWith("/")) s = s.slice(1);
  return s;
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

function decodeUnicodeEscapes(str) {
  return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function extractVocabFilesFromManifest(manifestJs) {
  const files = [];
  // Match both "file:" and strings in "files:" arrays
  const re = /"(words\/vocabs\/[^"]+\.js)"/g;
  let m;
  while ((m = re.exec(manifestJs))) {
    files.push(decodeUnicodeEscapes(m[1]));
  }
  return Array.from(new Set(files));
}

function makeInlineScript(content) {
  return `<script>\n${content}\n</script>`;
}

function makeInlineStyle(css) {
  return `<style>\n${css}\n</style>`;
}

function parseTagAttributes(tag) {
  const attrs = {};
  const re = /([^\s=]+)\s*=\s*(["'])(.*?)\2/g;
  let m;
  while ((m = re.exec(tag))) {
    attrs[m[1].toLowerCase()] = m[3];
  }
  return attrs;
}

function resolveCssImportPath(fromCssPath, rawHref) {
  const href = normalizeRelPath(rawHref);
  const fromDir = path.dirname(fromCssPath);
  const abs = path.resolve(fromDir, href);
  return abs;
}

function inlineCssImports(css, cssPath, projectRoot, visiting) {
  const key = path.resolve(cssPath);
  if (visiting.has(key)) {
    return "";
  }
  visiting.add(key);

  const importRe = /@import\s+(?:url\(\s*)?(?:(["'])([^"']+)\1|([^;\s)]+))(?:\s*\))?\s*([^;]*);/gi;
  let out = "";
  let lastIndex = 0;
  let m;
  while ((m = importRe.exec(css))) {
    out += css.slice(lastIndex, m.index);
    lastIndex = importRe.lastIndex;

    const href = (m[2] || m[3] || "").trim();
    const media = (m[4] || "").trim();
    const abs = resolveCssImportPath(cssPath, href);

    const relToRoot = path.relative(projectRoot, abs);
    const isInsideRoot = relToRoot && !relToRoot.startsWith("..") && !path.isAbsolute(relToRoot);
    if (!isInsideRoot) {
      out += m[0];
      continue;
    }
    if (!abs.toLowerCase().endsWith(".css")) {
      out += m[0];
      continue;
    }

    const importedCssRaw = readText(abs);
    const importedCss = inlineCssImports(importedCssRaw, abs, projectRoot, visiting);
    if (!importedCss.trim()) {
      continue;
    }
    if (media) {
      out += `@media ${media} {\n${importedCss}\n}\n`;
    } else {
      out += `${importedCss}\n`;
    }
  }
  out += css.slice(lastIndex);
  visiting.delete(key);
  return out;
}

function inlineLocalStylesheets(html, projectRoot) {
  const re = /<link\b[^>]*>/gi;
  let out = html;
  let m;
  let replacedCount = 0;
  const candidates = [];
  while ((m = re.exec(html))) {
    const tag = m[0];
    const attrs = parseTagAttributes(tag);
    const rel = (attrs.rel || "").toLowerCase();
    const hrefRaw = attrs.href || "";
    if (!rel.includes("stylesheet")) continue;
    if (!hrefRaw) continue;
    const href = normalizeRelPath(hrefRaw);
    if (!href.toLowerCase().endsWith(".css")) continue;
    if (!href.toLowerCase().startsWith("src/")) continue;
    candidates.push({ tag, hrefRaw, href });
  }

  for (const { tag, hrefRaw, href } of candidates) {
    const cssPath = path.join(projectRoot, ...href.split("/"));
    const cssRaw = readText(cssPath);
    const css = inlineCssImports(cssRaw, cssPath, projectRoot, new Set());
    out = out.replace(tag, makeInlineStyle(css));
    replacedCount += 1;
  }

  if (replacedCount === 0) {
    throw new Error(`Missing stylesheet link: rel=stylesheet href=src/*.css`);
  }

  if (/<link\b[^>]*\brel=(["'])stylesheet\1[^>]*\bhref=(["'])src\/[^"']+\.css\2/i.test(out)) {
    throw new Error("build-singlefile: unresolved stylesheet link remains in output HTML");
  }

  return out;
}

function extractModuleScriptTagsFromHtml(html) {
  const entries = [];
  const re = /<script\b[^>]*\bsrc=(["'])(src\/modules\/[^"']+)\1[^>]*>\s*<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    const src = normalizeRelPath(m[2]);
    if (!src.toLowerCase().startsWith("src/modules/")) continue;
    const file = src.slice("src/modules/".length);
    entries.push({ tag: m[0], file });
  }
  return entries;
}

function replaceScriptTagBySrcOnce(haystack, srcPath, replacement, label) {
  const target = normalizeRelPath(srcPath).toLowerCase();
  const re = /<script\b[^>]*\bsrc=(["'])([^"']+)\1[^>]*>\s*<\/script>/gi;
  let m;
  while ((m = re.exec(haystack))) {
    const tag = m[0];
    const src = normalizeRelPath(m[2]).toLowerCase();
    if (src !== target) continue;
    return haystack.replace(tag, replacement);
  }
  throw new Error(`Missing ${label || "script"}: ${srcPath}`);
}

function buildSingleFile({ projectRoot, templateHtmlPath, outPath }) {
  const templateHtml = readText(templateHtmlPath);

  const defaultsJs = readText(path.join(projectRoot, "src", "defaults.js"));
  const storageJs = readText(path.join(projectRoot, "src", "storage.js"));
  const manifestJs = readText(path.join(projectRoot, "words", "vocabs", "manifest.js"));

  const moduleEntries = extractModuleScriptTagsFromHtml(templateHtml);
  const moduleFiles = moduleEntries.map((e) => e.file);

  const vocabFiles = extractVocabFilesFromManifest(manifestJs);
  const vocabScripts = vocabFiles.map((f) => makeInlineScript(readText(path.join(projectRoot, f)))).join("\n");

  const embeddedJson = {
    "config/game.json": readJson(path.join(projectRoot, "config", "game.json")),
    "config/controls.json": readJson(path.join(projectRoot, "config", "controls.json")),
    "config/levels.json": readJson(path.join(projectRoot, "config", "levels.json")),
    "config/biomes.json": readJson(path.join(projectRoot, "config", "biomes.json")),
    "words/words-base.json": readJson(path.join(projectRoot, "words", "words-base.json")),
    "config/village.json": readJson(path.join(projectRoot, "config", "village.json")),
  };

  const preludeScript = buildPreludeDataScript(embeddedJson);

  let html = templateHtml;
  html = inlineLocalStylesheets(html, projectRoot);
  html = replaceScriptTagBySrcOnce(html, "src/defaults.js", makeInlineScript(defaultsJs), "defaults script");
  html = replaceScriptTagBySrcOnce(html, "src/storage.js", makeInlineScript(storageJs), "storage script");
  html = replaceScriptTagBySrcOnce(
    html,
    "words/vocabs/manifest.js",
    `${makeInlineScript(manifestJs)}\n${vocabScripts}\n${makeInlineScript(preludeScript)}`,
    "manifest script"
  );

  moduleEntries.forEach(({ tag, file }) => {
    const jsPath = path.join(projectRoot, "src", "modules", file);
    const content = readText(jsPath);
    html = html.replace(tag, makeInlineScript(content));
  });

  // Hard check: fail build if any module script src remains un-inlined
  if (/<script[^>]+src=(["'])src\/modules\/[^"']+\1/i.test(html)) {
    throw new Error("build-singlefile: unresolved module script src remains in output HTML");
  }

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
