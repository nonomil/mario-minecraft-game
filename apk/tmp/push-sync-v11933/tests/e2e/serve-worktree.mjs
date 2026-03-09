import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, resolve } from 'path';

const rootDir = process.cwd();
const portArgIndex = process.argv.indexOf('--port');
const port = portArgIndex >= 0 ? Number(process.argv[portArgIndex + 1]) || 4174 : 4174;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
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

createServer(async (req, res) => {
  let urlPath = req.url === '/' ? '/Game.html' : (req.url || '/Game.html');
  urlPath = urlPath.split('?')[0];
  try {
    urlPath = decodeURIComponent(urlPath);
  } catch {}

  const fullPath = resolve(rootDir, `.${urlPath}`);
  if (!fullPath.startsWith(rootDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  try {
    const content = await readFile(fullPath);
    const ext = extname(urlPath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(content);
  } catch (error) {
    const statusCode = error && error.code === 'ENOENT' ? 404 : 500;
    res.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(statusCode === 404 ? '404 Not Found' : '500 Internal Server Error');
  }
}).listen(port, '127.0.0.1');
