// End-to-end QA for the Relay prototype.
// Starts a Vite dev server, drives the app in headless Microsoft Edge (or Chrome),
// and checks every demo flow. Run with: npm test
import { createServer } from 'vite';
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const SHOTS = process.env.QA_SHOTS; // optional folder for screenshots
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const server = await createServer({ server: { port: 5199, strictPort: false }, logLevel: 'error' });
await server.listen();
const url = server.resolvedUrls.local[0];

let browser;
try {
  browser = await chromium.launch({ channel: 'msedge' });
} catch {
  browser = await chromium.launch({ channel: 'chrome' });
}

let passed = 0;
const failures = [];
async function check(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failures.push(name);
    console.log(`  ✗ ${name}\n      ${String(e.message || e).split('\n').slice(0, process.env.QA_VERBOSE ? 14 : 1).join('\n      ')}`);
  }
}
const expect = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(url, { waitUntil: 'networkidle' });

const disc = page.locator('#screen-discover');
const cards = () => disc.locator('[data-listing]').count();
const chip = (name) => disc.getByRole('button', { name: new RegExp('^' + name) });
const navBtn = (name) => page.getByRole('navigation').getByRole('button', { name: new RegExp('^' + name) });
const shot = async (n) => SHOTS && page.screenshot({ path: `${SHOTS}/${n}.png` });

console.log('\nDiscover');
await check('all 12 seeded listings appear', async () => expect((await cards()) === 12, `got ${await cards()}`));
await check('featured ISR fridge is first and Relay-checked', async () => {
  const first = disc.locator('[data-listing]').first();
  expect((await first.getAttribute('data-listing')) === 'l-fridge-townsend', 'fridge not first');
  expect((await first.innerText()).includes('Relay-checked'), 'no badge');
});
await check('4 listings are Relay-checked', async () => {
  const n = await disc.locator('[data-listing]', { hasText: 'Relay-checked' }).count();
  expect(n === 4, `got ${n}`);
});
await check('dorm filter: ISR → 3', async () => {
  await chip('ISR').click();
  expect((await cards()) === 3, `got ${await cards()}`);
});
await check('dorm + category filters combine: ISR + Fridges → 1', async () => {
  await chip('Fridges').click();
  expect((await cards()) === 1, `got ${await cards()}`);
});
await check('FAR + Fridges → 1 (Trelease)', async () => {
  await chip('FAR').click();
  expect((await disc.locator('[data-listing]').first().getAttribute('data-listing')) === 'l-fridge-trelease', 'wrong item');
});
await check('conflicting filters show empty state; Clear filters works', async () => {
  await chip('PAR').click();
  expect((await cards()) === 0, 'expected 0');
  await disc.getByText('Nothing here yet.').waitFor();
  await disc.getByRole('button', { name: 'Clear filters' }).click();
  expect((await cards()) === 12, `got ${await cards()}`);
});
await check('search "lamp" → 2', async () => {
  await disc.getByPlaceholder('Search dorm essentials...').fill('lamp');
  expect((await cards()) === 2, `got ${await cards()}`);
});
await check('search "free" → 2 free items; clear button resets', async () => {
  await disc.getByPlaceholder('Search dorm essentials...').fill('free');
  expect((await cards()) === 2, `got ${await cards()}`);
  await disc.getByRole('button', { name: 'Clear search' }).click();
  expect((await cards()) === 12, `got ${await cards()}`);
});
await check('search + dorm filter: "microwave" + Ikenberry → 1', async () => {
  await disc.getByPlaceholder('Search dorm essentials...').fill('microwave');
  await chip('Ikenberry').click();
  expect((await cards()) === 1, `got ${await cards()}`);
  await chip('All halls').click();
  await disc.getByRole('button', { name: 'Clear search' }).click();
});
await check('sort by price low → high puts Free first', async () => {
  await disc.locator('select').selectOption('low');
  const first = await disc.locator('[data-listing]').first().innerText();
  expect(first.includes('Free'), 'first is not free');
  const last = await disc.locator('[data-listing]').last().getAttribute('data-listing');
  expect(last === 'l-fridge-trelease', `last is ${last}`);
  await disc.locator('select').selectOption('featured');
});
await shot('01-discover');

console.log('\nItem detail + claim');
await check('fridge card opens the correct detail', async () => {
  await disc.locator('[data-listing="l-fridge-townsend"]').click();
  await page.getByRole('heading', { name: 'Compact Mini Fridge' }).waitFor();
  const t = await page.locator('.z-40').innerText();
  for (const s of ['Maya Chen', '4.9', '12 handoffs', 'Cleaned. Checked. Ready.', 'Fully defrosted', 'Cooling tested', 'ISR designated meeting area', 'August 2027'])
    expect(t.includes(s), `missing "${s}"`);
});
await shot('02-detail');
await check('claim sheet requires a date, then confirms', async () => {
  await page.getByRole('button', { name: 'Claim for move-in day' }).click();
  const confirm = page.getByRole('button', { name: 'Choose a day to continue' });
  expect(await confirm.isDisabled(), 'confirm should be disabled');
  await page.getByRole('radio', { name: 'Friday, Aug 20, 2027' }).click();
  await shot('03-claim-sheet');
  await page.getByRole('button', { name: 'Confirm for Fri, Aug 20' }).click();
  await page.getByText("It's yours!").waitFor();
  await page.waitForTimeout(500);
});
await shot('04-claim-success');
await check('"View my claims" shows the fridge with the chosen date', async () => {
  await page.getByRole('dialog').getByRole('button', { name: 'View my claims' }).click();
  const c = page.locator('#screen-claims');
  await c.getByText('Compact Mini Fridge').waitFor();
  const t = await c.innerText();
  expect(t.includes('Friday, Aug 20, 2027'), 'date missing');
  expect(t.includes('Reserved'), 'status missing');
  expect(t.includes('ISR designated meeting area'), 'pickup missing');
});
await check('claimed fridge disappears from Discover (11 left)', async () => {
  await navBtn('Discover').click();
  expect((await cards()) === 11, `got ${await cards()}`);
  expect((await disc.locator('[data-listing="l-fridge-townsend"]').count()) === 0, 'fridge still listed');
});
await check('bottom nav badge shows 1 active claim', async () => {
  expect((await page.getByRole('navigation').getByRole('button', { name: 'My claims, 1 active' }).count()) === 1, 'badge missing');
});

console.log('\nMy claims: pickup + rating');
await check('confirm pickup dialog → Picked up', async () => {
  await navBtn('My claims').click();
  await page.getByRole('button', { name: 'Confirm pickup' }).click();
  await page.getByRole('dialog', { name: 'Confirm pickup' }).waitFor();
  await shot('05-pickup-dialog');
  await page.getByRole('button', { name: 'Yes, I have it' }).click();
  await page.getByText('How was the handoff with Maya?').waitFor();
});
await check('rating requires a star; submit → Complete', async () => {
  const submit = page.getByRole('button', { name: 'Submit rating' });
  expect(await submit.isDisabled(), 'submit should be disabled before rating');
  await page.getByRole('radio', { name: '5 stars' }).click();
  await submit.click();
  await page.getByText('Handoff complete').waitFor();
  expect((await page.getByLabel('You rated 5 out of 5').count()) === 1, 'rating not stored');
  expect((await page.getByRole('button', { name: 'Submit rating' }).count()) === 0, 'duplicate rating possible');
});
await shot('06-claims-complete');

console.log('\nList an item');
await navBtn('List an item').click();
const list = page.locator('#screen-list');
await check('empty submit shows validation errors', async () => {
  await list.getByRole('button', { name: 'Publish listing' }).click();
  const t = await list.innerText();
  for (const s of ['Give your item a name', 'Choose a category', 'Choose your residence area', 'Choose a condition', 'Enter a price', 'Add a short description'])
    expect(t.includes(s), `missing "${s}"`);
});
await check('soft goods are blocked ("Memory foam pillow")', async () => {
  await list.getByPlaceholder('e.g. Compact mini fridge').fill('Memory foam pillow');
  await list.getByText('falls under soft goods').waitFor();
});
await check('category selection shows category-specific cleaning steps', async () => {
  await list.getByRole('radio', { name: 'Fridge' }).click();
  await list.getByText('Fully defrosted').waitFor();
  await list.getByRole('radio', { name: 'Microwave' }).click();
  await list.getByText('Turntable washed').waitFor();
});
await check('invalid price is rejected', async () => {
  await list.getByLabel('Price in dollars').fill('999');
  await list.getByRole('button', { name: 'Publish listing' }).click();
  await list.getByText('between $1 and $500').waitFor();
});
await check('"Try sample" fills everything except cleaning steps', async () => {
  await list.getByRole('button', { name: 'Try sample' }).click();
  expect((await list.getByPlaceholder('e.g. Compact mini fridge').inputValue()) === 'Dimmable LED Desk Lamp', 'title not filled');
  expect((await list.getByText('0/4').count()) === 1, 'checklist should be 0/4');
});
await check('publish blocked until cleaning checklist is complete', async () => {
  await list.getByRole('button', { name: 'Publish listing' }).click();
  await list.getByText('Complete every cleaning step before publishing.').waitFor();
  await shot('07-list-checklist-required');
});
await check('Free toggle sets price to zero', async () => {
  await list.getByRole('radio', { name: 'Free' }).click();
  await list.getByText('Someone’s move-in just got easier.').waitFor();
  await list.getByRole('radio', { name: 'Set price' }).click();
  await list.getByLabel('Price in dollars').fill('10');
});
await check('completing checklist + publish succeeds', async () => {
  for (const s of ['Dusted, shade included', 'Cord checked for damage', 'Bulb working', 'Switch tested']) await list.getByText(s, { exact: true }).click();
  await list.getByText('4/4').waitFor();
  await list.getByRole('button', { name: 'Publish listing' }).click();
  await list.getByText('You’re live.').waitFor();
  await page.waitForTimeout(400);
});
await shot('08-list-published');
await check('"View listing" opens the new listing detail', async () => {
  await list.getByRole('button', { name: 'View listing' }).click();
  await page.getByRole('heading', { name: 'Dimmable LED Desk Lamp' }).waitFor();
  await page.getByText('Your listing is live on Discover').waitFor();
  await page.getByRole('button', { name: 'Back to Discover' }).click();
});
await check('new listing is searchable on Discover', async () => {
  await disc.getByPlaceholder('Search dorm essentials...').fill('dimmable');
  expect((await cards()) === 1, `got ${await cards()}`);
});

console.log('\nReset demo');
await check('reset restores listings, claims, filters, form and screen', async () => {
  await page.getByRole('button', { name: 'Profile and demo options' }).click();
  await page.getByRole('menuitem', { name: /Reset demo/ }).click();
  await page.waitForTimeout(200);
  expect((await cards()) === 12, `got ${await cards()}`);
  expect((await disc.getByPlaceholder('Search dorm essentials...').inputValue()) === '', 'search not cleared');
  expect(await disc.isVisible(), 'not on Discover');
  await navBtn('My claims').click();
  await page.getByText('Your room is waiting.').waitFor();
  await navBtn('List an item').click();
  expect((await list.getByPlaceholder('e.g. Compact mini fridge').inputValue()) === '', 'form not reset');
});
await check('claim flow works again after reset (repeatable demo)', async () => {
  await navBtn('Discover').click();
  await disc.locator('[data-listing="l-fridge-townsend"]').click();
  await page.getByRole('button', { name: 'Claim for move-in day' }).click();
  await page.getByRole('radio', { name: 'Saturday, Aug 21, 2027' }).click();
  await page.getByRole('button', { name: 'Confirm for Sat, Aug 21' }).click();
  await page.getByText("It's yours!").waitFor();
  await page.getByRole('dialog').getByRole('button', { name: 'Keep browsing' }).click();
  expect((await cards()) === 11, `got ${await cards()}`);
  await page.getByRole('button', { name: 'Profile and demo options' }).click();
  await page.getByRole('menuitem', { name: /Reset demo/ }).click();
  expect((await cards()) === 12, 'second reset failed');
});

console.log('\nLayout');
for (const [w, h] of [
  [390, 844],
  [768, 1024],
  [1280, 720],
  [1440, 900],
]) {
  await check(`no horizontal overflow at ${w}×${h}`, async () => {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(150);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(over <= 0, `overflow ${over}px`);
    const frame = await page.locator('#app-frame').boundingBox();
    expect(frame && frame.height <= h && frame.y >= 0, 'app frame does not fit viewport');
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/layout-${w}.png` });
  });
}
await check('no runtime errors in console', async () => expect(errors.length === 0, errors.join(' | ')));

await browser.close();
await server.close();
console.log(`\n${passed} passed, ${failures.length} failed`);
process.exit(failures.length ? 1 : 0);
