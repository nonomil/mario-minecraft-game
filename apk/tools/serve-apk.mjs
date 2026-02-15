import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

const port = process.argv.includes('--port')
  ? parseInt(process.argv[process.argv.indexOf('--port') + 1])
  : 4173;

const server = createServer(async (req, res) => {
  let urlPath = req.url === '/' ? '/Game.html' : (req.url || '/Game.html');
  urlPath = urlPath.split('?')[0]; // Remove query params
  try {
    urlPath = decodeURIComponent(urlPath);
  } catch {
  }

  const fullPath = resolve(rootDir, `.${urlPath}`);
  if (!fullPath.startsWith(rootDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    console.log(`✗ ${req.method} ${req.url} - 403`);
    return;
  }

  const ext = extname(urlPath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  try {
    const content = await readFile(fullPath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    res.end(content);
    console.log(`✓ ${req.method} ${req.url} - 200`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      console.log(`✗ ${req.method} ${req.url} - 404`);
    } else {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
      console.error(`✗ ${req.method} ${req.url} - 500:`, error.message);
    }
  }
});

server.listen(port, () => {
  console.log(`\n========================================`);
  console.log(`  Mario Minecraft 游戏服务器`);
  console.log(`========================================`);
  console.log(`  服务器运行在: http://localhost:${port}`);
  console.log(`  游戏地址: http://localhost:${port}/Game.html`);
  console.log(`========================================\n`);
  console.log(`按 Ctrl+C 停止服务器\n`);
});
