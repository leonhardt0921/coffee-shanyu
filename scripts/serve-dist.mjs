import http from 'node:http';
import { stat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.join(projectRoot, 'dist');
const argumentIndex = process.argv.indexOf('--port');
const port = Number(argumentIndex >= 0 ? process.argv[argumentIndex + 1] : process.env.PORT || 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('Invalid port. Use --port <1–65535>.');
  process.exit(1);
}
try {
  await stat(path.join(root, 'index.html'));
} catch {
  console.error('Missing dist/index.html. Run npm run build first.');
  process.exit(1);
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.webm': 'video/webm',
};

function reply(response, status, body, headers = {}) {
  response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', ...headers });
  response.end(body);
}

const server = http.createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    reply(response, 405, 'Method not allowed', { Allow: 'GET, HEAD' });
    return;
  }
  let pathname;
  try {
    pathname = decodeURIComponent((request.url || '/').split('?')[0]);
  } catch {
    reply(response, 400, 'Malformed URL');
    return;
  }
  if (pathname.includes('\0') || pathname.includes('\\') || pathname.split('/').includes('..')) {
    reply(response, 403, 'Forbidden');
    return;
  }
  let filePath = path.resolve(root, `.${pathname}`);
  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
    reply(response, 403, 'Forbidden');
    return;
  }
  try {
    const fileStat = await stat(filePath).catch(() => null);
    if (fileStat?.isDirectory()) filePath = path.join(filePath, 'index.html');
    if (!fileStat && !path.extname(pathname) && request.headers.accept?.includes('text/html')) {
      filePath = path.join(root, 'index.html');
    }
    const body = await readFile(filePath);
    response.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream',
      'Content-Length': body.byteLength,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch (error) {
    reply(response, error.code === 'ENOENT' || error.code === 'EISDIR' ? 404 : 500, 'File unavailable');
  }
});

server.on('error', (error) => {
  console.error(`Local preview failed: ${error.message}`);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => {
  console.log(`Serving production dist at http://127.0.0.1:${port} (PID ${process.pid})`);
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
