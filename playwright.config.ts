import { defineConfig, devices } from '@playwright/test';

const production = process.env.E2E_MODE === 'production';
const port = Number(process.env.E2E_PORT || (production ? 4173 : 5173));
const reportDir = process.env.E2E_REPORT_DIR || `artifacts/e2e-${production ? 'production' : 'development'}`;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 2,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: `${reportDir}/html`, open: 'never' }],
    ['json', { outputFile: `${reportDir}/results.json` }],
  ],
  outputDir: `${reportDir}/results`,
  use: {
    baseURL,
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'], browserName: 'chromium', viewport: { width: 390, height: 844 } },
    },
    {
      name: 'mobile-webkit',
      use: { ...devices['iPhone 13'], browserName: 'webkit', viewport: { width: 390, height: 844 } },
    },
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } },
    },
  ],
  webServer: {
    command: production
      ? `node scripts/serve-dist.mjs --port ${port}`
      : `npm run dev -- --port ${port} --strictPort`,
    url: baseURL,
    timeout: 60_000,
    reuseExistingServer: process.env.E2E_REUSE_SERVER === '1',
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
