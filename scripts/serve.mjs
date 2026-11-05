import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const root = resolve(import.meta.dirname, '../dist');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.m4a': 'audio/mp4', '.mp3': 'audio/mpeg' };
const portFlag = process.argv.indexOf('--port');
const hostFlag = process.argv.indexOf('--host');
const port = Number(portFlag >= 0 ? process.argv[portFlag + 1] : process.env.PORT || 8080);
const host = hostFlag >= 0 ? process.argv[hostFlag + 1] : '127.0.0.1';

createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    let path = decodeURIComponent(url.pathname);
    if (path === '/play') { response.writeHead(308, { Location: '/play/' }); response.end(); return; }
    if (path.endsWith('/')) path += 'index.html';
    let file = resolve(root, '.' + path);
    if (file !== root && !file.startsWith(root + sep)) throw new Error('Outside site root');
    try {
      const info = await stat(file);
      if (info.isDirectory()) file = resolve(file, 'index.html');
    } catch {
      if (!extname(path)) file = resolve(root, path.startsWith('/play/') ? 'play/index.html' : 'index.html');
    }
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
    response.end(body);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
}).listen(port, host, () => console.log(`Local preview: http://${host}:${port}/ and http://${host}:${port}/play/`));
