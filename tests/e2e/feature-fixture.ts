import { test as base, expect, type Page } from '@playwright/test';

// Every feature test independently monitors browser exceptions and nonlocal resources.
// Intentional storage errors are caught by the application, never ignored as page errors.
export const test = base.extend<{ audit: void }>({
  audit: [async ({ page }, use, testInfo) => {
    const pageErrors: string[] = [];
    const externalRequests: string[] = [];
    const failedResources: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('request', request => {
      const url = new URL(request.url());
      if (['http:', 'https:'].includes(url.protocol) && !['127.0.0.1', 'localhost'].includes(url.hostname)) externalRequests.push(request.url());
    });
    page.on('response', response => { if (response.status() >= 400) failedResources.push(`${response.status()} ${response.url()}`); });
    page.on('requestfailed', request => {
      // A navigation can cancel an in-flight image; HTTP errors and actual network failures still fail.
      const failure = request.failure()?.errorText ?? '';
      if (!/abort|cancel|NS_BINDING_ABORTED/i.test(failure)) failedResources.push(`${failure} ${request.url()}`);
    });
    await use();
    await testInfo.attach('browser-audit', { body: JSON.stringify({ pageErrors, externalRequests, failedResources }, null, 2), contentType: 'application/json' });
    expect(pageErrors, '浏览器运行过程中无未捕获异常').toEqual([]);
    expect(externalRequests, '所有资源与数据均来自本机').toEqual([]);
    expect(failedResources, '没有失败资源').toEqual([]);
  }, { auto: true }],
});
export { expect };

export const add = async (page: Page, name: string, count = 1) => {
  for (let i = 0; i < count; i++) await page.getByRole('button', { name: `加入购物袋 ${name}`, exact: true }).click();
};
export const openCart = async (page: Page) => {
  await page.getByRole('button', { name: /^打开购物袋/ }).click();
  await expect(page.getByRole('dialog', { name: '我的购物袋' })).toBeVisible();
};
export const closeModal = async (page: Page) => {
  await page.getByRole('dialog').getByRole('button', { name: '关闭弹窗', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
};
