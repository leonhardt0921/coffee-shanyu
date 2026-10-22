import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';

// A paced, real browser walkthrough for article footage; never substitutes for E2E.
const baseURL = process.env.DEMO_URL || 'http://127.0.0.1:4173';
const output = path.resolve(process.env.DEMO_OUTPUT || 'artifacts/demo-capture');
if (new URL(baseURL).hostname !== '127.0.0.1') throw new Error('Use the verified loopback preview.');
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'zh-CN', recordVideo: { dir: output, size: { width: 390, height: 844 } } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const pause = () => page.waitForTimeout(850);
const shot = async name => { await pause(); await page.screenshot({ path: path.join(output, name) }); };
const openBag = () => page.getByRole('button', { name: /^打开购物袋/ }).click();
const close = () => page.getByRole('button', { name: '关闭弹窗', exact: true }).click();
await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
try {
  await page.goto(baseURL);
  await page.waitForLoadState('networkidle');
  await shot('01-mobile-home.png');
  await page.locator('.coupon-card').evaluate(element => element.scrollIntoView({ block: 'center' }));
  await shot('02-mobile-campaign.png');
  await page.getByRole('button', { name: '加入购物袋 山隅美式', exact: true }).click();
  await pause();
  await page.getByRole('button', { name: '加入购物袋 云朵拿铁', exact: true }).click();
  await openBag();
  await expect(page.getByTestId('cart-total')).toHaveText('¥41.00');
  await shot('03-cart-before-41.png');
  await close();
  await page.getByRole('button', { name: '领取开业礼', exact: true }).click();
  await shot('04-coupon-rules.png');
  await page.getByRole('button', { name: '确认领取并启用', exact: true }).click();
  await pause();
  if (await page.getByRole('dialog').count()) await close();
  await openBag();
  await expect(page.getByTestId('cart-total')).toHaveText('¥31.00');
  await shot('05-cart-after-31.png');
  await page.getByRole('switch', { name: '使用开业礼券' }).click();
  await expect(page.getByTestId('cart-total')).toHaveText('¥41.00');
  await pause();
  await page.getByRole('switch', { name: '使用开业礼券' }).click();
  await expect(page.getByTestId('cart-total')).toHaveText('¥31.00');
  await pause();
  await page.getByRole('button', { name: '减少 云朵拿铁', exact: true }).click();
  await expect(page.getByTestId('cart-total')).toHaveText('¥19.00');
  await shot('06-below-threshold.png');
  await close();
  await page.getByRole('button', { name: '加入购物袋 云朵拿铁', exact: true }).click();
  await page.reload();
  await openBag();
  await expect(page.getByTestId('cart-total')).toHaveText('¥31.00');
  await shot('07-refresh-preserved.png');
  await close();
  const nav = page.getByRole('navigation', { name: '主导航' });
  for (const [label, filename] of [['菜单','08-menu.png'],['订单','09-orders.png'],['我的','10-profile.png']]) {
    await nav.getByRole('link', { name: label, exact: true }).click();
    await shot(filename);
  }
  await nav.getByRole('link', { name: '首页', exact: true }).click();
  await pause();
  expect(errors).toEqual([]);
  await context.tracing.stop({ path: path.join(output, 'walkthrough-trace.zip') });
  const video = page.video();
  await context.close();
  if (video) await rename(await video.path(), path.join(output, 'coffee-walkthrough.webm'));
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  await desktop.goto(baseURL);
  await desktop.waitForLoadState('networkidle');
  await desktop.screenshot({ path: path.join(output, '11-desktop-home.png') });
  await desktop.close();
  await writeFile(path.join(output, 'capture.json'), JSON.stringify({ capturedAt: new Date().toISOString(), baseURL, viewport: { width: 390, height: 844 }, deviceEmulation: true, physicalDeviceTest: false, errors, result: 'passed', sequence: ['41 before claim', '31 after claim', '41 disabled', '31 enabled', '19 below threshold', '31 after reload'], footage: 'Actual paced Chromium interaction; pauses added for readability; no simulated log or transaction.' }, null, 2));
  console.log(`Real walkthrough saved: ${output}`);
} finally {
  await browser.close();
}
