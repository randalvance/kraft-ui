import { spawnSync } from 'node:child_process';
for (const theme of ['paper', 'night']) {
  console.log(`\nChecking stories in ${theme} theme`);
  const result = spawnSync(process.execPath, ['node_modules/vitest/vitest.mjs', 'run', '--project', 'storybook'], {
    stdio: 'inherit', env: { ...process.env, VITE_KRAFT_THEME: theme },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
