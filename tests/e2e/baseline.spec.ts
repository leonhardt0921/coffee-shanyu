import { test, expect } from '@playwright/test';

test.describe('基线业务回归', () => {
  test('首页图片正常并可连续加购两种咖啡', async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /把日子，\s*泡慢一点。/ })).toBeVisible();
    await expect(page.locator('.product-card')).toHaveCount(6);
    for (const picture of await page.locator('main img').all()) await picture.scrollIntoViewIfNeeded();
    await expect.poll(async () => page.locator('main img').evaluateAll(images =>
      images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)
    )).toBe(true);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: testInfo.outputPath('baseline-home.png'), fullPage: true });
    await page.getByRole('button', { name: '加入购物袋 山隅美式', exact: true }).click();
    await page.getByRole('button', { name: '加入购物袋 云朵拿铁', exact: true }).click();
    await page.getByRole('button', { name: /^打开购物袋，2件商品$/ }).click();
    await expect(page.getByRole('dialog', { name: '我的购物袋' })).toBeVisible();
    await expect(page.getByTestId('cart-subtotal')).toHaveText('¥41.00');
    await expect(page.getByTestId('cart-total')).toHaveText('¥41.00');
    await page.screenshot({ path: testInfo.outputPath('baseline-cart-41.png') });
    expect(errors).toEqual([]);
  });

  test('购物袋数量、刷新持久化、删除和清空', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '加入购物袋 山隅美式', exact: true }).click();
    await page.getByRole('button', { name: /^打开购物袋/ }).click();
    await page.getByRole('button', { name: '增加 山隅美式', exact: true }).click();
    await expect(page.getByLabel('山隅美式数量', { exact: true })).toHaveText('2');
    await expect(page.getByTestId('cart-total')).toHaveText('¥38.00');
    await page.getByRole('button', { name: '减少 山隅美式', exact: true }).click();
    await expect(page.getByTestId('cart-total')).toHaveText('¥19.00');
    await page.reload();
    await page.getByRole('button', { name: /^打开购物袋，1件商品$/ }).click();
    await expect(page.getByTestId('cart-total')).toHaveText('¥19.00');
    await page.getByRole('button', { name: '删除 山隅美式', exact: true }).click();
    await expect(page.getByTestId('cart-total')).toHaveText('¥0.00');
    await page.getByRole('button', { name: '关闭弹窗', exact: true }).click();
    await page.getByRole('button', { name: '加入购物袋 云朵拿铁', exact: true }).click();
    await page.getByRole('button', { name: /^打开购物袋/ }).click();
    await page.getByRole('button', { name: '清空购物袋', exact: true }).click();
    await expect(page.getByTestId('cart-total')).toHaveText('¥0.00');
    await page.reload();
    await expect(page.getByRole('button', { name: /^打开购物袋，0件商品$/ })).toBeVisible();
  });

  test('四页导航和展示页直接刷新', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: '主导航' });
    for (const [label, route, heading] of [
      ['菜单', 'menu', '一页咖啡，六种好心情。'],
      ['订单', 'orders', '每一杯，都有它的时光。'],
      ['我的', 'me', '在山隅，做一会儿自己。'],
      ['首页', 'home', '把日子，泡慢一点。'],
    ]) {
      await nav.getByRole('link', { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`#${route}$`));
      await expect(page.getByRole('heading', { name: new RegExp(heading.replace('，', '，\\s*')) })).toBeVisible();
      await expect(nav.getByRole('link', { name: label, exact: true })).toHaveAttribute('aria-current', 'page');
      await page.reload();
      await expect(page.getByRole('heading', { name: new RegExp(heading.replace('，', '，\\s*')) })).toBeVisible();
    }
  });
});
