import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { writeFileSync } from 'node:fs';
const records: unknown[] = [];
export default defineConfig({ plugins: [react()], test: {
  include: ['.impeccable/audit-evidence/2026-11-15/runtime.test.jsx'],
  browser: { enabled: true, headless: true, provider: playwright(), instances: [{ browser: 'chromium' }], viewport: { width: 320, height: 900 },
    commands: {
      auditKey: async ({ page }, key: string) => { await page.keyboard.press(key); },
      auditMedia: async ({ page }, media: object) => { await page.emulateMedia(media); },
      auditScreenshot: async ({ frame }, name: string) => { const target = await frame(); await target.locator('.kraft-root').screenshot({ path: '.impeccable/audit-evidence/2026-11-15/' + name + '.png' }); },
      auditRecord: async (_, record: unknown) => { records.push(record); writeFileSync('.impeccable/audit-evidence/2026-11-15/runtime-results.json', JSON.stringify(records, null, 2)); },
    },
  },
} });
