import { execFileSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

if (process.argv.length !== 3) {
  throw new Error('Usage: node scripts/smoke-package.mjs <tarball>');
}
const tarball = resolve(process.argv[2]);
const tsc = fileURLToPath(import.meta.resolve('typescript/bin/tsc'));

const consumer = `
import { Icon, Tabs, ThemeProvider, type TabItem } from '@randalvance/kraft-ui';

const items: TabItem[] = [{
  id: 'notes', label: 'Notes', tabId: 'notes-tab', panelId: 'notes-panel',
  iconOnly: true, leading: <Icon name="file" />,
}];

export const notebook = (
  <ThemeProvider theme="night">
    <Tabs aria-label="Notebook" panel="external" items={items} />
    <section role="tabpanel" id="notes-panel" aria-labelledby="notes-tab">A note.</section>
  </ThemeProvider>
);
`;

const verify = `
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { notebook } from './consumer.js';

const markup = renderToString(notebook);
for (const value of ['role="tablist"', 'aria-controls="notes-panel"', 'aria-labelledby="notes-tab"', '<svg']) {
  assert.ok(markup.includes(value), 'SSR markup is missing ' + value);
}

const css = readFileSync(new URL(import.meta.resolve('@randalvance/kraft-ui/styles.css')), 'utf8');
assert.match(css, /[.]kraft-root/);
const tokens = JSON.parse(readFileSync(new URL(import.meta.resolve('@randalvance/kraft-ui/tokens.json')), 'utf8'));
assert.ok(Object.keys(tokens).length > 0, 'Expected design tokens in the package');
`;

for (const major of [18, 19]) {
  const cwd = await mkdtemp(join(tmpdir(), 'kraft-ui-consumer-'));
  const run = (command, args) => execFileSync(command, args, { cwd, stdio: 'inherit' });
  try {
    await writeFile(join(cwd, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
    await writeFile(join(cwd, 'consumer.tsx'), consumer);
    await writeFile(join(cwd, 'verify.mjs'), verify);
    run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', tarball,
      `react@${major}`, `react-dom@${major}`, `@types/react@${major}`, `@types/react-dom@${major}`]);
    run(process.execPath, [tsc, '--strict', '--module', 'nodenext', '--jsx', 'react-jsx', '--target', 'es2022', 'consumer.tsx']);
    run(process.execPath, ['verify.mjs']);
    console.log(`Installed tarball passed the React ${major} consumer smoke test.`);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
}
