// Exports poster-ready visuals into ./poster-assets using the live app.
// Run with: npm run assets   (needs Microsoft Edge or Google Chrome installed)
import { createServer } from 'vite';
import { chromium } from 'playwright-core';
import opentype from 'opentype.js';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('../poster-assets/', import.meta.url));
mkdirSync(OUT, { recursive: true });

/* ---------------- 1. Vector logo files (wordmark converted to outlines) ---------------- */
const NAVY = '#14213D';
const CREAM = '#F7F4EC';
const ORANGE = '#F28C28';
const fontPath = fileURLToPath(new URL('../node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-600-normal.woff', import.meta.url));
const buf = readFileSync(fontPath);
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

const mark = (first, x = 0, y = 0, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke-linecap="round" stroke-width="5.6">` +
  `<path d="M6 24.5a9 9 0 0 1 18 0" stroke="${first}"/><path d="M16 15.5a9 9 0 0 0 18 0" stroke="${ORANGE}"/></g>`;

function wordmark(color, x, baseline, size) {
  // Letter-spacing -0.04em, matching the app.
  let cursor = x;
  let d = '';
  const glyphs = font.stringToGlyphs('relay');
  glyphs.forEach((g, i) => {
    d += g.getPath(cursor, baseline, size).toPathData(2);
    cursor += (g.advanceWidth / font.unitsPerEm) * size - 0.04 * size;
    if (i < glyphs.length - 1) cursor += (font.getKerningValue(g, glyphs[i + 1]) / font.unitsPerEm) * size;
  });
  return { path: `<path d="${d}" fill="${color}"/>`, width: cursor - x };
}

function logoSvg(tone) {
  const first = tone === 'dark' ? CREAM : NAVY;
  const text = tone === 'dark' ? CREAM : NAVY;
  const size = 96; // wordmark font size
  const markSize = 116;
  const H = 112;
  const w = wordmark(text, markSize + 16, 84, size);
  const width = Math.ceil(markSize + 16 + w.width + 6);
  const bg = tone === 'dark' ? `<rect width="100%" height="100%" rx="24" fill="${NAVY}"/>` : '';
  const pad = tone === 'dark' ? 40 : 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${width + pad * 2} ${H + pad * 2}" width="${width + pad * 2}" height="${H + pad * 2}">${
    tone === 'dark' ? `<rect x="${-pad}" y="${-pad}" width="${width + pad * 2}" height="${H + pad * 2}" rx="28" fill="${NAVY}"/>` : bg
  }${mark(first, 0, 0, markSize / 40)}${w.path}</svg>\n`;
}

writeFileSync(`${OUT}relay-logo.svg`, logoSvg('light'));
writeFileSync(`${OUT}relay-logo-on-navy.svg`, logoSvg('dark'));
writeFileSync(
  `${OUT}relay-mark.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="400" height="400">${mark(NAVY)}</svg>\n`,
);
writeFileSync(
  `${OUT}relay-app-icon.svg`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="400" height="400"><rect width="40" height="40" rx="10" fill="${NAVY}"/>${mark(CREAM, 4, 4, 0.8)}</svg>\n`,
);
console.log('✓ logo SVGs');

/* ---------------- 2. Screens ---------------- */
const server = await createServer({ server: { port: 5198, strictPort: false }, logLevel: 'error' });
await server.listen();
const url = server.resolvedUrls.local[0];
let browser;
try {
  browser = await chromium.launch({ channel: 'msedge' });
} catch {
  browser = await chromium.launch({ channel: 'chrome' });
}

const CLEAN_CSS = `[role=status]{display:none!important} *{caret-color:transparent!important}`;
const TRANSPARENT_CSS = `html,body,#root>div{background:transparent!important}`;
const CUTOUT_CSS = TRANSPARENT_CSS + `#app-frame{box-shadow:0 0 0 8px #FFFEFB,0 0 0 9px #E3DDD1!important} #app-frame *{backdrop-filter:none!important}`;

async function newPage(width, height, scale = 3) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: CLEAN_CSS });
  await page.evaluate(() => document.fonts.ready);
  return page;
}

/** Screenshot the phone-style app panel on a transparent background (includes its soft shadow). */
async function framed(page, name) {
  await page.mouse.move(0, 0);
  await page.waitForTimeout(350);
  const style = await page.addStyleTag({ content: CUTOUT_CSS });
  const b = await page.locator('#app-frame').boundingBox();
  const m = 10;
  await page.screenshot({
    path: `${OUT}${name}.png`,
    omitBackground: true,
    clip: { x: b.x - m, y: b.y - m, width: b.width + m * 2, height: b.height + m * 2 },
  });
  await style.evaluate((n) => n.remove());
  console.log(`✓ ${name}.png`);
}

async function claim(page, id, dayLabel, confirmLabel) {
  await page.locator(`#screen-discover [data-listing="${id}"]`).click();
  await page.getByRole('button', { name: 'Claim for move-in day' }).click();
  await page.getByRole('radio', { name: dayLabel }).click();
  await page.getByRole('button', { name: confirmLabel }).click();
  await page.getByText("It's yours!").waitFor();
}
const nav = (page, n) => page.getByRole('navigation').getByRole('button', { name: new RegExp('^' + n) });

// Desktop booth composition + framed screens
{
  const page = await newPage(1440, 960, 2);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}booth-desktop-view.png` });
  console.log('✓ booth-desktop-view.png');
  await page.close();
}
{
  const page = await newPage(1440, 1000, 3);
  await framed(page, 'A-discover-phone');

  await page.locator('#screen-discover [data-listing="l-fridge-townsend"]').click();
  await page.getByRole('heading', { name: 'Compact Mini Fridge' }).waitFor();
  await framed(page, 'B-fridge-detail-phone');

  await page.evaluate(() => {
    const scroller = document.querySelector('.z-40 [data-scroll]');
    const panel = document.getElementById('clean-title')?.closest('section');
    if (scroller && panel) scroller.scrollTop += panel.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 20;
  });
  await framed(page, 'B-fridge-checklist-phone');

  await page.getByRole('button', { name: 'Claim for move-in day' }).click();
  await page.getByRole('radio', { name: 'Friday, Aug 20, 2027' }).click();
  await framed(page, 'C-claim-date-phone');
  await page.getByRole('button', { name: 'Confirm for Fri, Aug 20' }).click();
  await page.getByText("It's yours!").waitFor();
  await framed(page, 'C-claim-success-phone');

  // Build a two-item lineup: fridge reserved + desk lamp completed with a rating.
  await page.getByRole('dialog').getByRole('button', { name: 'Keep browsing' }).click();
  await claim(page, 'l-lamp-nugent', 'Saturday, Aug 21, 2027', 'Confirm for Sat, Aug 21');
  await page.getByRole('dialog').getByRole('button', { name: 'View my claims' }).click();
  const lamp = page.locator('article', { hasText: 'Adjustable Desk Lamp' });
  await lamp.getByRole('button', { name: 'Confirm pickup' }).click();
  await page.getByRole('button', { name: 'Yes, I have it' }).click();
  await lamp.getByRole('radio', { name: '5 stars' }).click();
  await lamp.getByRole('button', { name: 'Submit rating' }).click();
  await nav(page, 'Discover').click();
  await nav(page, 'My claims').click();
  await framed(page, 'C-my-claims-phone');

  await nav(page, 'List an item').click();
  await page.getByRole('button', { name: 'Try sample' }).click();
  await page.getByText('Dusted, shade included').click();
  await page.getByText('Cord checked for damage').click();
  await page.evaluate(() => {
    const s = document.getElementById('screen-list');
    const t = document.getElementById('f-category');
    if (s && t) s.scrollTop += t.getBoundingClientRect().top - s.getBoundingClientRect().top - 16;
  });
  await framed(page, 'E-list-item-phone');
  await page.evaluate(() => {
    const s = document.getElementById('screen-list');
    const t = document.getElementById('f-cleaning');
    if (s && t) s.scrollTop += t.getBoundingClientRect().top - s.getBoundingClientRect().top - 220;
  });
  await framed(page, 'E-list-checklist-phone');
  await page.close();
}

// Full-length, unframed mobile screens (crop or place inside a device frame as needed)
{
  const page = await newPage(412, 915, 3);
  await page.screenshot({ path: `${OUT}A-discover-screen.png` });
  console.log('✓ A-discover-screen.png');
  await page.locator('#screen-discover [data-listing="l-fridge-townsend"]').click();
  await page.getByRole('heading', { name: 'Compact Mini Fridge' }).waitFor();
  const h = await page.evaluate(() => document.querySelector('.z-40 [data-scroll]').scrollHeight + 90);
  await page.setViewportSize({ width: 412, height: h });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}B-fridge-detail-full-screen.png` });
  console.log('✓ B-fridge-detail-full-screen.png');
  await page.close();
}

// D. Process graphic
for (const [tone, name] of [
  ['light', 'D-process-cream'],
  ['dark', 'D-process-navy'],
  ['transparent', 'D-process-transparent'],
]) {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(`${url}?poster=process&tone=${tone}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  if (tone === 'transparent') await page.addStyleTag({ content: TRANSPARENT_CSS });
  await page.locator('#poster').screenshot({ path: `${OUT}${name}.png`, omitBackground: tone === 'transparent' });
  console.log(`✓ ${name}.png`);
  await ctx.close();
}

// Logo PNGs (transparent) for tools that don't accept SVG
{
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 600 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  for (const f of ['relay-logo', 'relay-logo-on-navy', 'relay-mark', 'relay-app-icon']) {
    const svg = readFileSync(`${OUT}${f}.svg`, 'utf8');
    await page.setContent(`<html><body style="margin:0;background:transparent">${svg.replace('<svg ', '<svg id="s" ')}</body></html>`);
    await page.locator('#s').screenshot({ path: `${OUT}${f}.png`, omitBackground: true });
  }
  console.log('✓ logo PNGs');
  await ctx.close();
}

await browser.close();
await server.close();
console.log(`\nSaved to ${OUT}`);
