import { test, expect, add, closeModal, openCart } from './feature-fixture';
import type { Page } from '@playwright/test';

// These browser launch options are file-scoped in Playwright 1.64.
test.use({ video: 'on', trace: 'on' });

const CART_KEY = 'shanyu-cart-v1';
const COUPON_KEY = 'shanyu-coupon-v1';
const claimed = { activityId: 'opening-10', claimed: true, enabled: true };
const claim = async (page: Page) => {
  await page.getByRole('button', { name: '领取开业礼', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: '确认领取并启用', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '查看礼券', exact: true })).toBeVisible();
};
const expectAmount = async (page: Page, subtotal: string, discount: string, total: string) => {
  await expect(page.getByTestId('cart-subtotal')).toHaveText(subtotal);
  await expect(page.getByTestId('cart-discount')).toContainText(discount);
  await expect(page.getByTestId('cart-total')).toHaveText(total);
};

test.describe('完整真实用户旅程（保留成功视频及trace）', () => {
  test('从未领券到优惠、失效、恢复、刷新及清空的一次连续流程', async ({ page }, testInfo) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /^打开购物袋，0件商品$/ })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('01-home-before-claim.png'), fullPage: true });
    await add(page, '山隅美式');
    await add(page, '云朵拿铁');
    await openCart(page);
    await expectAmount(page, '¥41.00', '0.00', '¥41.00');
    await page.screenshot({ path: testInfo.outputPath('02-before-coupon-41.png') });
    await closeModal(page);
    await page.getByRole('button', { name: '领取开业礼', exact: true }).click();
    const rules = page.getByRole('dialog');
    await expect(rules).toContainText('39');
    await expect(rules).toContainText('10');
    await expect(rules).toContainText(/一次|1次|1 次/);
    await page.screenshot({ path: testInfo.outputPath('03-coupon-rules.png') });
    await rules.getByRole('button', { name: '确认领取并启用', exact: true }).click();
    await expect(rules).toHaveCount(0);
    await openCart(page);
    await expectAmount(page, '¥41.00', '10.00', '¥31.00');
    const toggle = page.getByRole('switch', { name: '使用开业礼券', exact: true });
    await expect(toggle).toBeChecked();
    await page.screenshot({ path: testInfo.outputPath('04-after-coupon-31.png') });
    await toggle.click();
    await expect(toggle).not.toBeChecked();
    await expectAmount(page, '¥41.00', '0.00', '¥41.00');
    await toggle.click();
    await expectAmount(page, '¥41.00', '10.00', '¥31.00');
    await page.getByRole('button', { name: '减少 云朵拿铁', exact: true }).click();
    await expectAmount(page, '¥19.00', '0.00', '¥19.00');
    await expect(page.getByRole('dialog')).toContainText(/(?:还差|再选).*20\.00/);
    await page.screenshot({ path: testInfo.outputPath('05-below-threshold.png') });
    await closeModal(page);
    await add(page, '云朵拿铁');
    await openCart(page);
    await expectAmount(page, '¥41.00', '10.00', '¥31.00');
    await page.reload();
    await expect(page.getByRole('button', { name: '查看礼券', exact: true })).toBeVisible();
    await openCart(page);
    await expectAmount(page, '¥41.00', '10.00', '¥31.00');
    await expect(page.getByRole('switch', { name: '使用开业礼券' })).toBeChecked();
    await page.getByRole('button', { name: '清空购物袋', exact: true }).click();
    await expectAmount(page, '¥0.00', '0.00', '¥0.00');
    await page.reload();
    await expect(page.getByRole('button', { name: /^打开购物袋，0件商品$/ })).toBeVisible();
    await expect(page.getByRole('button', { name: '查看礼券', exact: true })).toBeVisible();
    await openCart(page);
    await expectAmount(page, '¥0.00', '0.00', '¥0.00');
    await page.screenshot({ path: testInfo.outputPath('06-empty-coupon-retained.png') });
    await expect(page.getByRole('button', { name: /支付|结算|下单/ })).toHaveCount(0);
  });
});

test('领取连点幂等、每单78元也只减10元、取消选择刷新后保留', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '领取开业礼', exact: true }).click();
  await page.getByRole('button', { name: '确认领取并启用', exact: true }).dblclick();
  await expect(page.getByRole('button', { name: '查看礼券', exact: true })).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), COUPON_KEY)).toEqual(claimed);
  await page.getByRole('button', { name: '查看礼券', exact: true }).click();
  await expect(page.getByRole('button', { name: '确认领取并启用', exact: true })).toHaveCount(0);
  await closeModal(page);
  await add(page, '燕麦轻拿铁', 3);
  await openCart(page);
  await expectAmount(page, '¥78.00', '10.00', '¥68.00');
  await page.getByRole('switch', { name: '使用开业礼券', exact: true }).click();
  await expectAmount(page, '¥78.00', '0.00', '¥78.00');
  await page.reload();
  await openCart(page);
  await expect(page.getByRole('switch', { name: '使用开业礼券', exact: true })).not.toBeChecked();
  await expectAmount(page, '¥78.00', '0.00', '¥78.00');
});

test('先领券再加购，从不足门槛到达标；未领取绝不提前减免', async ({ page }) => {
  await page.goto('/');
  await add(page, '燕麦轻拿铁', 3);
  await openCart(page);
  await expectAmount(page, '¥78.00', '0.00', '¥78.00');
  await page.getByRole('button', { name: '清空购物袋', exact: true }).click();
  await closeModal(page);
  await claim(page);
  await add(page, '山隅美式');
  await openCart(page);
  await expectAmount(page, '¥19.00', '0.00', '¥19.00');
  await expect(page.getByRole('dialog')).toContainText(/(?:还差|再选).*20\.00/);
  await closeModal(page);
  await add(page, '云朵拿铁');
  await openCart(page);
  await expectAmount(page, '¥41.00', '10.00', '¥31.00');
});

test('模拟优惠保存失败：提示未保存、不虚报领取成功，恢复后可重试', async ({ page }) => {
  await page.addInitScript(({ couponKey }) => {
    const original = Storage.prototype.setItem;
    (window as unknown as Record<string, unknown>).__failCouponSave = true;
    Storage.prototype.setItem = function(key, value) {
      if (key === couponKey && (window as unknown as Record<string, unknown>).__failCouponSave) throw new DOMException('Test injected quota error', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  }, { couponKey: COUPON_KEY });
  await page.goto('/');
  await page.getByRole('button', { name: '领取开业礼', exact: true }).click();
  await page.getByRole('button', { name: '确认领取并启用', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText(/未.*保存|保存.*失败/);
  await expect(page.getByRole('button', { name: '确认领取并启用', exact: true })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), COUPON_KEY)).toBeNull();
  await page.evaluate(() => { (window as unknown as Record<string, unknown>).__failCouponSave = false; });
  await page.getByRole('button', { name: '确认领取并启用', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), COUPON_KEY)).toEqual(claimed);
  await add(page, '山隅美式');
  await add(page, '云朵拿铁');
  await openCart(page);
  await expectAmount(page, '¥41.00', '10.00', '¥31.00');
});

test('模拟购物袋保存失败：金额与数量不变，恢复后可重新加购', async ({ page }) => {
  await page.addInitScript(({ cartKey }) => {
    const original = Storage.prototype.setItem;
    (window as unknown as Record<string, unknown>).__failCartSave = true;
    Storage.prototype.setItem = function(key, value) {
      if (key === cartKey && (window as unknown as Record<string, unknown>).__failCartSave) throw new DOMException('Test injected quota error', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  }, { cartKey: CART_KEY });
  await page.goto('/');
  await add(page, '山隅美式');
  await expect(page.getByRole('alert')).toContainText('未能保存购物袋');
  await expect(page.getByRole('button', { name: /^打开购物袋，0件商品$/ })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), CART_KEY)).toBeNull();
  await page.evaluate(() => { (window as unknown as Record<string, unknown>).__failCartSave = false; });
  await add(page, '山隅美式');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await openCart(page);
  await expectAmount(page, '¥19.00', '0.00', '¥19.00');
});

test('优惠开关保存失败：保留原选择与优惠，恢复后可再次切换', async ({ page }) => {
  await page.goto('/');
  await claim(page);
  await add(page, '山隅美式');
  await add(page, '云朵拿铁');
  await openCart(page);
  await page.evaluate(key => {
    const original = Storage.prototype.setItem;
    (window as unknown as Record<string, unknown>).__restoreSetItem = original;
    Storage.prototype.setItem = function(k, v) { if (k === key) throw new DOMException('Test injected quota error', 'QuotaExceededError'); return original.call(this, k, v); };
  }, COUPON_KEY);
  const toggle = page.getByRole('switch', { name: '使用开业礼券', exact: true });
  await toggle.click();
  await expect(page.getByRole('dialog').getByRole('alert')).toBeVisible();
  await expect(toggle).toBeChecked();
  await expectAmount(page, '¥41.00', '10.00', '¥31.00');
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), COUPON_KEY)).toEqual(claimed);
  await page.evaluate(() => { Storage.prototype.setItem = (window as unknown as Record<string, typeof Storage.prototype.setItem>).__restoreSetItem; });
  await toggle.click();
  await expect(toggle).not.toBeChecked();
  await expectAmount(page, '¥41.00', '0.00', '¥41.00');
});

test('畸形本地JSON和非法商品、数量安全恢复', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(({ cartKey, couponKey }) => { localStorage.setItem(cartKey, '{bad json'); localStorage.setItem(couponKey, 'null'); }, { cartKey: CART_KEY, couponKey: COUPON_KEY });
  await page.reload();
  await expect(page.getByRole('button', { name: /^打开购物袋，0件商品$/ })).toBeVisible();
  await expect(page.getByRole('button', { name: '领取开业礼', exact: true })).toBeVisible();
  await page.evaluate(({ cartKey, couponKey }) => {
    localStorage.setItem(cartKey, JSON.stringify({ americano: -1, latte: 1.5, oat: 100, 'flat-white': '2', unknown: 99, 'cold-brew': 1 }));
    localStorage.setItem(couponKey, JSON.stringify({ activityId: 'wrong', claimed: true, enabled: true }));
  }, { cartKey: CART_KEY, couponKey: COUPON_KEY });
  await page.reload();
  await expect(page.getByRole('button', { name: /^打开购物袋，1件商品$/ })).toBeVisible();
  await openCart(page);
  await expect(page.locator('.cart-row')).toHaveCount(1);
  await expect(page.getByLabel('山野冷萃数量', { exact: true })).toHaveText('1');
  await expectAmount(page, '¥25.00', '0.00', '¥25.00');
  await page.getByRole('button', { name: '减少 山野冷萃', exact: true }).click();
  await expectAmount(page, '¥0.00', '0.00', '¥0.00');
});
