import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
export default defineConfig({ test: { projects: [
 { test: { name: 'unit', environment: 'jsdom', include: ['tests/**/*.test.{ts,tsx}'], exclude: ['tests/**/*.browser.test.tsx'], setupFiles: ['tests/setup.ts'] } },
 { plugins: [react()], test: { name: 'buttons', include: ['tests/buttons.browser.test.tsx'], browser: { enabled: true, headless: true, provider: playwright(), instances: [{ browser: 'chromium' }] } } },
 { plugins: [react()], test: { name: 'contrast', include: ['tests/contrast.browser.test.tsx'], browser: { enabled: true, headless: true, viewport: { width: 1100, height: 1100 }, provider: playwright({ contextOptions: { viewport: { width: 1400, height: 1400 }, deviceScaleFactor: 1 } }), instances: [{ browser: 'chromium' }] } } },
 { plugins: [storybookTest({ configDir: '.storybook' })], test: { name: 'storybook', browser: { enabled: true, headless: true, provider: playwright(), instances: [{ browser: 'chromium' }] } } },
] } });
