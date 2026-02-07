import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs(argv) {
  const out = { port: 4173 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--port") out.port = parseInt(argv[++i] || "4173", 10);
  }
  return out;
}

function mimeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".js") return "text/javascript; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".json") return "application/json; charset=utf-8";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".gif") return "image/gif";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".mp3") return "audio/mpeg";
  return "application/octet-stream";
}

const args = parseArgs(process.argv.slice(2));
const repoRoot = path.resolve(__dirname, "..");

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url || "/", "http://127.0.0.1");
    const rawPath = decodeURIComponent(url.pathname);
    const safePath = rawPath.replace(/\\+/g, "/");
    const joined = path.join(repoRoot, safePath);
    const resolved = path.resolve(joined);

    // Prevent path traversal.
    if (!resolved.startsWith(repoRoot)) {
      res.statusCode = 403;
      res.end("Forbidden");
      return;
    }

    let filePath = resolved;
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", mimeFor(filePath));
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.statusCode = 500;
    res.end(String(err && err.message ? err.message : err));
  }
});

server.listen(args.port, "127.0.0.1", () => {
  // eslint-disable-next-line no-console
  console.log(`Serving ${repoRoot} at http://127.0.0.1:${args.port}`);
});

