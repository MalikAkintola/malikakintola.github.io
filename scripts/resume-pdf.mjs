// Saves the /resume/ page as an A4 PDF at public/resume.pdf (and dist/resume.pdf when a build exists).
// Run `npm run build` first, then `npm run resume:pdf`. It uses the Chrome or Edge already installed on
// the machine (set CHROME_PATH to choose one), so no browser download is needed.
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync, copyFileSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { chromium } from '@playwright/test';

const dist = resolve('dist');
if (!existsSync(join(dist, 'resume', 'index.html'))) {
  console.error('No build found. Run `npm run build` first.');
  process.exit(1);
}

const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
const server = createServer((req, res) => {
  let file = join(dist, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(dist)) { res.writeHead(403); return res.end(); }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const { port } = server.address();

async function launch() {
  if (process.env.CHROME_PATH) return chromium.launch({ executablePath: process.env.CHROME_PATH });
  for (const channel of ['chrome', 'msedge']) {
    try { return await chromium.launch({ channel }); } catch {}
  }
  return chromium.launch();
}

const browser = await launch();
try {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/resume/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const out = resolve('public', 'resume.pdf');
  await page.pdf({ path: out, format: 'A4', printBackground: false, preferCSSPageSize: true });
  copyFileSync(out, join(dist, 'resume.pdf'));
  console.log(`Saved ${out} and dist/resume.pdf`);
} finally {
  await browser.close();
  server.close();
}
