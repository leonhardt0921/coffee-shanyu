import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  // Playwright writes HTML trace snapshots; they must not reload the app mid-test.
  server: { watch: { ignored: ['**/artifacts/**', '**/.workbuddy-cache/**'] } },
  test: { include: ['tests/unit/**/*.test.ts'], environment: 'node', reporters: ['default', 'json'], outputFile: { json: 'artifacts/unit-results.json' } },
});
