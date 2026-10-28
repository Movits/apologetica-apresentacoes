// Servidor estático mínimo para abrir os decks por http (sem dependências).
//
//   node scripts/serve.mjs          (porta 8090)
//   node scripts/serve.mjs 3000

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, normalize, extname, sep } from 'node:path';
import { ROOT } from './lib/load-decks.mjs';

const PORT = Number(process.argv[2]) || 8090;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (path.endsWith('/')) path += 'index.html';
    const file = normalize(join(ROOT, path));
    if (!file.startsWith(ROOT + sep)) throw Object.assign(new Error('fora da raiz'), { code: 'ENOENT' });
    if (!(await stat(file)).isFile()) throw Object.assign(new Error('não é arquivo'), { code: 'ENOENT' });
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch (e) {
    res.writeHead(e.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(e.code === 'ENOENT' ? 'Não encontrado' : 'Erro no servidor');
  }
}).listen(PORT, () => console.log(`Apresentações em http://localhost:${PORT}/`));
