import { createServer } from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, '..');
const outputRoot = path.join(webRoot, 'audit-output');
const shotsRoot = path.join(outputRoot, 'screens');
const captureManifestPath = path.join(outputRoot, 'capture_manifest.json');
const galleryPath = path.join(outputRoot, 'gallery.html');
const domSnapshotPath = path.join(outputRoot, 'dom_snapshot.json');
const reportSeedPath = path.join(outputRoot, 'ui_audit_seed.md');
const errorLogPath = path.join(outputRoot, 'run-error.json');
const port = 4173;

const CLICKABLE_SELECTOR = [
  'button',
  '[role="button"]',
  'a[href]',
  'summary',
  'input[type="button"]',
  'input[type="submit"]',
  'input[type="reset"]',
  '[data-action]',
  '[onclick]'
].join(', ');

const DIALOG_SELECTOR = [
  'dialog',
  '[role="dialog"]',
  '[aria-modal="true"]',
  '.modal',
  '.popup',
  '.dialog',
  '.overlay'
].join(', ');

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function sanitizeLabel(input, fallback) {
  const trimmed = String(input || '').trim();
  const safe = trimmed
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return safe || fallback;
}

function dedupeByText(nodes) {
  const seen = new Set();
  return nodes.filter((node) => {
    const key = [
      node.tag,
      node.text,
      node.ariaLabel,
      node.id,
      node.className,
      node.href,
      Math.round(node.x),
      Math.round(node.y)
    ].join('|');
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

async function ensureDir(targetPath) {
  await fs.mkdir(targetPath, { recursive: true });
}

async function readStaticFile(urlPath) {
  const normalized = decodeURIComponent(urlPath.split('?')[0]);
  const relativePath = normalized === '/' ? '/index.html' : normalized;
  const filePath = path.normalize(path.join(webRoot, relativePath));
  if (!filePath.startsWith(webRoot)) {
    return { status: 403, body: 'Forbidden', type: 'text/plain; charset=utf-8' };
  }

  try {
    const stats = await fs.stat(filePath);
    const finalPath = stats.isDirectory() ? path.join(filePath, 'index.html') : filePath;
    const body = await fs.readFile(finalPath);
    return {
      status: 200,
      body,
      type: contentType(finalPath)
    };
  } catch {
    return { status: 404, body: 'Not Found', type: 'text/plain; charset=utf-8' };
  }
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.js':
    case '.mjs':
      return 'application/javascript; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.svg':
      return 'image/svg+xml';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.woff':
      return 'font/woff';
    case '.woff2':
      return 'font/woff2';
    default:
      return 'application/octet-stream';
  }
}

async function withServer(run) {
  const server = createServer(async (req, res) => {
    const file = await readStaticFile(req.url || '/');
    res.writeHead(file.status, {
      'Content-Type': file.type,
      'Cache-Control': 'no-store'
    });
    res.end(file.body);
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });

  try {
    return await run();
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
}

async function buildGallery(manifest) {
  const cards = manifest.captures
    .map((capture) => {
      const summary = [
        capture.kind,
        capture.url,
        capture.text ? `text: ${escapeHtml(capture.text)}` : '',
        capture.dialogCount ? `dialogs: ${capture.dialogCount}` : '',
        capture.clickedSelector ? `selector: ${escapeHtml(capture.clickedSelector)}` : ''
      ]
        .filter(Boolean)
        .join(' | ');

      return `
        <article class="card">
          <img src="./screens/${escapeHtml(path.basename(capture.file))}" alt="${escapeHtml(capture.name)}" />
          <div class="meta">
            <h2>${escapeHtml(capture.name)}</h2>
            <p>${escapeHtml(summary)}</p>
          </div>
        </article>
      `;
    })
    .join('\n');

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>UI Audit Gallery</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f5ecdb;
      --ink: #1f2a1e;
      --muted: #56624e;
      --card: rgba(255, 251, 242, 0.95);
      --accent: #cf7d24;
      --outline: rgba(55, 43, 20, 0.12);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Trebuchet MS", "Segoe UI", sans-serif;
      background:
        radial-gradient(circle at top left, rgba(255,255,255,0.65), transparent 35%),
        linear-gradient(180deg, #efe3cb 0%, #dcc4a0 100%);
      color: var(--ink);
      padding: 24px;
    }
    header {
      margin: 0 auto 24px;
      max-width: 1280px;
    }
    h1 {
      margin: 0 0 8px;
      font-size: 32px;
      letter-spacing: 0.04em;
    }
    p {
      margin: 0;
      color: var(--muted);
      line-height: 1.6;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
      gap: 20px;
      max-width: 1280px;
      margin: 0 auto;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--outline);
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 18px 42px rgba(35, 24, 4, 0.12);
    }
    .card img {
      display: block;
      width: 100%;
      height: auto;
      background: #fff;
    }
    .meta {
      padding: 16px;
      border-top: 1px solid var(--outline);
    }
    .meta h2 {
      margin: 0 0 8px;
      font-size: 18px;
      color: #40260f;
    }
  </style>
</head>
<body>
  <header>
    <h1>UI Audit Gallery</h1>
    <p>${escapeHtml(`Captured ${manifest.captures.length} states from ${manifest.startUrl}`)}</p>
  </header>
  <main class="grid">
    ${cards}
  </main>
</body>
</html>`;

  await fs.writeFile(galleryPath, html, 'utf8');
}

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function collectDomSnapshot(page) {
  return page.evaluate(({ clickableSelector, dialogSelector }) => {
    const computed = (element) => window.getComputedStyle(element);
    const textNodes = Array.from(document.querySelectorAll('body *'))
      .filter((element) => {
        const style = computed(element);
        const text = element.textContent?.trim();
        return text && style.display !== 'none' && style.visibility !== 'hidden';
      })
      .slice(0, 80)
      .map((element) => {
        const style = computed(element);
        return {
          tag: element.tagName.toLowerCase(),
          text: element.textContent.trim().slice(0, 120),
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          color: style.color,
          background: style.backgroundColor
        };
      });

    const clickables = Array.from(document.querySelectorAll(clickableSelector))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const style = computed(element);
        return {
          tag: element.tagName.toLowerCase(),
          text: (element.innerText || element.textContent || '').trim().slice(0, 120),
          ariaLabel: element.getAttribute('aria-label') || '',
          id: element.id || '',
          className: element.className || '',
          href: element.getAttribute('href') || '',
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          display: style.display,
          visibility: style.visibility
        };
      })
      .filter((element) => element.width > 8 && element.height > 8);

    const dialogs = Array.from(document.querySelectorAll(dialogSelector)).map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        tag: element.tagName.toLowerCase(),
        text: (element.innerText || element.textContent || '').trim().slice(0, 180),
        width: rect.width,
        height: rect.height
      };
    });

    const body = computed(document.body);
    const root = computed(document.documentElement);

    return {
      title: document.title,
      url: location.href,
      bodyTextColor: body.color,
      bodyBackground: body.backgroundColor,
      bodyBackgroundImage: body.backgroundImage,
      baseFontFamily: body.fontFamily,
      baseFontSize: body.fontSize,
      rootBackground: root.backgroundColor,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      clickables,
      dialogs,
      textNodes
    };
  }, { clickableSelector: CLICKABLE_SELECTOR, dialogSelector: DIALOG_SELECTOR });
}

async function runAudit() {
  await ensureDir(outputRoot);
  await ensureDir(shotsRoot);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 1
  });
  const startUrl = `http://127.0.0.1:${port}/index.html`;
  const auditAccountName = 'AuditKid';
  const captures = [];
  const consoleEvents = [];
  const pageErrors = [];
  let captureIndex = 0;

  page.on('console', (message) => {
    consoleEvents.push({
      type: message.type(),
      text: message.text()
    });
  });

  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  async function isVisible(selector) {
    const locator = page.locator(selector).first();
    if (!(await locator.count())) {
      return false;
    }
    return locator.isVisible().catch(() => false);
  }

  async function visibleModalIds() {
    return page.evaluate(() => {
      const modalIds = [
        'screen-overlay',
        'inventory-modal',
        'crafting-modal',
        'settings-modal',
        'advanced-settings-modal',
        'profile-modal',
        'save-progress-modal',
        'learning-report-modal',
        'leaderboard-modal',
        'armor-select-modal',
        'challenge-modal',
        'vocab-prompt-modal',
        'login-screen'
      ];

      return modalIds.filter((id) => {
        const element = document.getElementById(id);
        if (!element) return false;
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const ariaHidden = element.getAttribute('aria-hidden');
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          rect.width > 0 &&
          rect.height > 0 &&
          ariaHidden !== 'true'
        );
      });
    });
  }

  async function capture(kind, name, details = {}) {
    const safeLabel = sanitizeLabel(name, `${kind}-${String(captureIndex).padStart(2, '0')}`);
    const fileName = `${String(captureIndex).padStart(2, '0')}-${safeLabel}.png`;
    const target = path.join(shotsRoot, fileName);
    await page.screenshot({ path: target, fullPage: true });
    const dialogCount = await page.locator(DIALOG_SELECTOR).count();
    const viewport = await page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight
    }));
    captures.push({
      index: captureIndex,
      kind,
      name,
      file: toPosix(target),
      url: page.url(),
      dialogCount,
      viewport,
      visibleModalIds: await visibleModalIds(),
      ...details
    });
    captureIndex += 1;
  }

  async function captureError(kind, name, details = {}, error) {
    captures.push({
      index: captureIndex,
      kind,
      name,
      file: '',
      url: page.url(),
      viewport: await page.evaluate(() => ({
        width: window.innerWidth,
        height: window.innerHeight
      })),
      visibleModalIds: await visibleModalIds(),
      ...details,
      error: error.message
    });
    captureIndex += 1;
  }

  async function clickAndCapture(selector, name, options = {}) {
    const locator = page.locator(selector).first();
    if (!(await locator.count())) {
      await captureError('missing', name, { clickedSelector: selector }, new Error('Element not found'));
      return false;
    }

    try {
      if (!options.skipScroll) {
        await locator.scrollIntoViewIfNeeded().catch(() => {});
      }
      await locator.click({
        timeout: options.timeout ?? 3000,
        force: options.force ?? false
      });
      await page.waitForTimeout(options.wait ?? 500);
      await capture(options.kind ?? 'interaction', name, {
        clickedSelector: selector,
        note: options.note || '',
        expect: options.expect || ''
      });
      return true;
    } catch (error) {
      await captureError('error', name, { clickedSelector: selector }, error);
      return false;
    }
  }

  async function closeIfVisible(selector, name) {
    if (!(await isVisible(selector))) {
      return false;
    }
    return clickAndCapture(selector, name, {
      kind: 'dialog-close',
      wait: 350
    });
  }

  async function fillInput(selector, value, name, details = {}) {
    const locator = page.locator(selector).first();
    if (!(await locator.count())) {
      await captureError('missing', name, { filledSelector: selector }, new Error('Input not found'));
      return false;
    }

    try {
      await locator.fill(value, { timeout: 2500 });
      await page.waitForTimeout(200);
      await capture('input', name, {
        filledSelector: selector,
        filledValue: value,
        ...details
      });
      return true;
    } catch (error) {
      await captureError('error', name, { filledSelector: selector }, error);
      return false;
    }
  }

  async function goHome(wait = 600) {
    await page.goto(startUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(wait);
  }

  await goHome(800);
  await capture('page', 'initial-view', { note: 'Landing state' });

  const domSnapshot = await collectDomSnapshot(page);

  const overlaySelections = [
    ['#btn-overlay-language-english', 'overlay-language-gb'],
    ['#btn-overlay-language-chinese', 'overlay-language-cn'],
    ['#btn-overlay-language-pinyin', 'overlay-language-py'],
    ['#btn-overlay-grade-scope-preschool', 'overlay-grade-pre'],
    ['#btn-overlay-grade-scope-grade1', 'overlay-grade-g1'],
    ['#btn-overlay-grade-scope-grade2', 'overlay-grade-g2'],
    ['#btn-overlay-grade-scope-full', 'overlay-grade-all']
  ];

  if (await isVisible('#screen-overlay.visible')) {
    for (const [selector, name] of overlaySelections) {
      if (await isVisible(selector)) {
        await clickAndCapture(selector, name, { kind: 'overlay-selection' });
      }
    }

    if (await isVisible('#btn-overlay-pick-account')) {
      await clickAndCapture('#btn-overlay-pick-account', 'overlay-account-setup', {
        kind: 'overlay-page'
      });
    }

    if (await isVisible('#overlay-username-input')) {
      const filled = await fillInput('#overlay-username-input', auditAccountName, 'overlay-account-input-ready', {
        kind: 'overlay-account'
      });
      if (filled && await isVisible('#btn-overlay-create')) {
        await clickAndCapture('#btn-overlay-create', 'overlay-account-created', {
          kind: 'overlay-account',
          wait: 1000
        });
      }
    }

    if (await isVisible('#btn-overlay-action')) {
      await clickAndCapture('#btn-overlay-action', 'overlay-enter-game', {
        kind: 'overlay-exit',
        wait: 1000
      });
    } else if (await isVisible('#btn-overlay-skip')) {
      await clickAndCapture('#btn-overlay-skip', 'overlay-skip-to-game', {
        kind: 'overlay-exit',
        wait: 900
      });
    }
  }

  await page.waitForTimeout(900);
  await capture('page', 'gameplay-main', { note: 'Gameplay HUD after exiting overlay' });

  const modalFlows = [
    { open: '#btn-inventory', name: 'inventory-modal', close: '#btn-inventory-close' },
    { open: '#btn-crafting', name: 'crafting-modal', close: '#btn-crafting-close' },
    {
      open: '#btn-settings',
      name: 'settings-modal',
      close: '#btn-settings-close',
      nested: [
        { open: '#btn-settings-advanced', name: 'advanced-settings-modal', close: '#btn-advanced-settings-close' }
      ]
    },
    { open: '#btn-save-progress', name: 'save-progress-modal', close: '#btn-save-progress-close' }
  ];

  for (const flow of modalFlows) {
    if (!(await isVisible(flow.open))) {
      continue;
    }
    const opened = await clickAndCapture(flow.open, flow.name, {
      kind: 'modal-open',
      wait: 700
    });
    if (!opened) {
      continue;
    }

    if (Array.isArray(flow.nested)) {
      for (const nested of flow.nested) {
        if (await isVisible(nested.open)) {
          const nestedOpened = await clickAndCapture(nested.open, nested.name, {
            kind: 'modal-open',
            wait: 700
          });
          if (nestedOpened) {
            await closeIfVisible(nested.close, `${nested.name}-closed`);
          }
        }
      }
    }

    await closeIfVisible(flow.close, `${flow.name}-closed`);
  }

  if (await isVisible('#btn-profile')) {
    const profileOpened = await clickAndCapture('#btn-profile', 'profile-modal', {
      kind: 'modal-open',
      wait: 700
    });

    if (profileOpened) {
      if (await isVisible('#btn-profile-learning-report')) {
        const reportOpened = await clickAndCapture('#btn-profile-learning-report', 'learning-report-modal', {
          kind: 'modal-open',
          wait: 700
        });
        if (reportOpened) {
          await closeIfVisible('#btn-learning-report-close', 'learning-report-modal-closed');
        }
      }

      if (!(await isVisible('#profile-modal')) && await isVisible('#btn-profile')) {
        await clickAndCapture('#btn-profile', 'profile-modal-reopen', {
          kind: 'modal-open',
          wait: 700
        });
      }

      if (await isVisible('#btn-profile-save-leaderboard')) {
        const leaderboardOpened = await clickAndCapture('#btn-profile-save-leaderboard', 'leaderboard-modal', {
          kind: 'modal-open',
          wait: 800
        });
        if (leaderboardOpened) {
          await closeIfVisible('#btn-leaderboard-close', 'leaderboard-modal-closed');
        }
      }

      if (await isVisible('#profile-modal')) {
        await closeIfVisible('#btn-profile-close', 'profile-modal-closed');
      }
    }
  }

  const controlFlows = [
    ['#btn-repeat-pause', 'control-repeat-pause'],
    ['button[data-action="left"]', 'control-left'],
    ['button[data-action="right"]', 'control-right'],
    ['button[data-action="jump"]', 'control-jump'],
    ['#btn-attack', 'control-attack'],
    ['button[data-action="use-diamond"]', 'control-use-diamond'],
    ['button[data-action="interact"]', 'control-interact'],
    ['button[data-action="switch"]', 'control-switch'],
    ['button[aria-label="打开合成"]', 'control-open-crafting']
  ];

  for (const [selector, name] of controlFlows) {
    if (!(await isVisible(selector))) {
      continue;
    }
    await clickAndCapture(selector, name, {
      kind: 'control',
      wait: 450
    });

    if (await isVisible('#crafting-modal')) {
      await capture('modal-open', 'crafting-modal-from-touch', {
        clickedSelector: selector
      });
      await closeIfVisible('#btn-crafting-close', 'crafting-modal-from-touch-closed');
    }
  }

  await page.setViewportSize({ width: 393, height: 852 });
  await goHome(900);
  await capture('mobile-page', 'mobile-initial-view', {
    device: 'mobile',
    note: 'Mobile viewport landing state'
  });

  if (await isVisible('#btn-overlay-pick-account')) {
    await clickAndCapture('#btn-overlay-pick-account', 'mobile-overlay-account-setup', {
      kind: 'mobile-overlay-page',
      wait: 500
    });
  }

  if (await isVisible('#overlay-username-input')) {
    const mobileFilled = await fillInput('#overlay-username-input', auditAccountName, 'mobile-overlay-account-input', {
      device: 'mobile'
    });
    if (mobileFilled && await isVisible('#btn-overlay-create')) {
      await clickAndCapture('#btn-overlay-create', 'mobile-overlay-account-created', {
        kind: 'mobile-overlay-account',
        wait: 1000
      });
    }
  }

  if (await isVisible('#btn-overlay-action')) {
    await clickAndCapture('#btn-overlay-action', 'mobile-overlay-enter-game', {
      kind: 'mobile-overlay-exit',
      wait: 900
    });
  } else if (await isVisible('#btn-overlay-skip')) {
    await clickAndCapture('#btn-overlay-skip', 'mobile-overlay-skip', {
      kind: 'mobile-overlay-exit',
      wait: 900
    });
  }

  await page.waitForTimeout(800);
  await capture('mobile-page', 'mobile-gameplay-main', {
    device: 'mobile',
    note: 'Mobile viewport gameplay HUD'
  });

  if (await isVisible('#btn-settings')) {
    const mobileSettingsOpened = await clickAndCapture('#btn-settings', 'mobile-settings-modal', {
      kind: 'mobile-modal-open',
      wait: 700
    });
    if (mobileSettingsOpened) {
      await closeIfVisible('#btn-settings-close', 'mobile-settings-modal-closed');
    }
  }

  const finalSnapshot = await collectDomSnapshot(page);
  const mobileSnapshot = await collectDomSnapshot(page);
  const manifest = {
    generatedAt: new Date().toISOString(),
    startUrl,
    captures,
    consoleEvents,
    pageErrors,
    summary: {
      totalCaptures: captures.filter((capture) => capture.file).length,
      totalInteractions: captures.filter((capture) => capture.kind.startsWith('interaction')).length,
      totalErrors: captures.filter((capture) => capture.kind === 'error').length,
      dialogSelectors: DIALOG_SELECTOR,
      clickableSelectors: CLICKABLE_SELECTOR
    }
  };

  await fs.writeFile(captureManifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  await fs.writeFile(domSnapshotPath, JSON.stringify({ initial: domSnapshot, final: finalSnapshot, mobile: mobileSnapshot }, null, 2), 'utf8');

  const seedReport = `# UI Audit Seed

## Runtime Snapshot
- Start URL: ${startUrl}
- Captures: ${manifest.summary.totalCaptures}
- Interactions attempted: ${manifest.summary.totalInteractions}
- Interaction errors: ${manifest.summary.totalErrors}
- Base font: ${domSnapshot.baseFontFamily} / ${domSnapshot.baseFontSize}
- Body background: ${domSnapshot.bodyBackground}
- Body background image: ${domSnapshot.bodyBackgroundImage}
- Audit account: ${auditAccountName}

## Notes
- Review screenshots in ./screens/
- Review manifest in capture_manifest.json
- Review DOM metrics in dom_snapshot.json
`;
  await fs.writeFile(reportSeedPath, seedReport, 'utf8');
  await buildGallery(manifest);

  const galleryPage = await browser.newPage({
    viewport: { width: 1400, height: 1200 },
    deviceScaleFactor: 1
  });
  await galleryPage.goto(`http://127.0.0.1:${port}/audit-output/gallery.html`, { waitUntil: 'load' });
  await galleryPage.screenshot({
    path: path.join(outputRoot, 'audit-contact-sheet.png'),
    fullPage: true
  });
  await galleryPage.close();
  await browser.close();
}

try {
  await withServer(runAudit);
} catch (error) {
  await ensureDir(outputRoot);
  const payload = {
    message: error.message,
    stack: error.stack
  };
  await fs.writeFile(errorLogPath, JSON.stringify(payload, null, 2), 'utf8');
  throw error;
}
