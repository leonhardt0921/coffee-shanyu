import { test, expect, add, closeModal, openCart } from './feature-fixture';

test('320、375、390、430宽度：无横向溢出、44px触控、底部内容可见', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await page.goto('/');
  for (const width of [320, 375, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await expect.poll(async () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const tooSmall = await page.locator('button, a[href], [role="switch"]').evaluateAll(elements => elements.flatMap(element => {
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return [];
      return rect.width < 44 || rect.height < 44 ? [{ name: element.getAttribute('aria-label') ?? element.textContent?.trim(), width: rect.width, height: rect.height }] : [];
    }));
    expect(tooSmall, `${width}px页面所有交互元素至少44×44`).toEqual([]);
    await page.locator('.demo-footer').scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const bounds = await page.evaluate(() => ({
      footer: document.querySelector('.demo-footer')!.getBoundingClientRect().bottom,
      dock: document.querySelector('.cart-dock')!.getBoundingClientRect().top,
      navTop: document.querySelector('.bottom-nav')!.getBoundingClientRect().top,
      dockBottom: document.querySelector('.cart-dock')!.getBoundingClientRect().bottom,
    }));
    expect(bounds.footer).toBeLessThanOrEqual(bounds.dock);
    expect(bounds.dockBottom).toBeLessThanOrEqual(bounds.navTop);
    await page.screenshot({ path: testInfo.outputPath(`layout-${width}-bottom.png`) });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: testInfo.outputPath(`layout-${width}-home.png`) });
  }
});

test('活动弹窗有焦点约束、Escape关闭并返回触发按钮', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: '领取开业礼', exact: true });
  await trigger.focus();
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Shift+Tab');
  expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  const cartTrigger = page.getByRole('button', { name: /^打开购物袋/ });
  await cartTrigger.focus();
  await cartTrigger.click();
  await page.keyboard.press('Escape');
  await expect(cartTrigger).toBeFocused();
});

test('窄屏长购物袋可滚动、底部金额可见、控件可操作并关闭', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');
  for (const name of ['山隅美式', '云朵拿铁', '燕麦轻拿铁', '馥郁小白', '山野冷萃', '香草云拿铁']) await add(page, name);
  await openCart(page);
  const dialog = page.getByRole('dialog', { name: '我的购物袋' });
  expect(await dialog.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true);
  await page.getByTestId('cart-total').scrollIntoViewIfNeeded();
  await expect(page.getByTestId('cart-total')).toBeVisible();
  await expect(page.getByTestId('cart-total')).toHaveText('¥144.00');
  const rect = await page.getByTestId('cart-total').boundingBox();
  expect(rect!.y + rect!.height).toBeLessThanOrEqual(568);
  const tooSmall = await dialog.locator('button, [role="switch"]').evaluateAll(elements => elements.flatMap(element => {
    const rect = element.getBoundingClientRect();
    return rect.width < 44 || rect.height < 44 ? [{ name: element.getAttribute('aria-label') ?? element.textContent, width: rect.width, height: rect.height }] : [];
  }));
  expect(tooSmall).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('320-long-cart-scrolled.png') });
  await page.getByRole('button', { name: '清空购物袋', exact: true }).click();
  await expect(page.getByTestId('cart-total')).toHaveText('¥0.00');
  await closeModal(page);
  await expect(page.getByRole('button', { name: /^打开购物袋，0件商品$/ })).toBeVisible();
});

test('减少动态效果设置生效，菜单/订单/我的使用本地素材且可直接刷新', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.locator('.product-image img').first().evaluate(element => getComputedStyle(element).transitionDuration)).toBe('0s');
  const nav = page.getByRole('navigation', { name: '主导航' });
  for (const [label, route] of [['菜单', 'menu'], ['订单', 'orders'], ['我的', 'me'], ['首页', 'home']]) {
    await nav.getByRole('link', { name: label, exact: true }).click();
    await page.reload();
    await expect(page).toHaveURL(new RegExp(`#${route}$`));
    await expect(nav.getByRole('link', { name: label, exact: true })).toHaveAttribute('aria-current', 'page');
    for (const image of await page.locator('main img').all()) await image.scrollIntoViewIfNeeded();
    await expect.poll(async () => page.locator('main img').evaluateAll(images => images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if (route !== 'home') await expect(page.locator('main button')).toHaveCount(0);
  }
});
