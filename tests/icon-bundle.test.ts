// @vitest-environment node
import { build } from 'vite';
import { rollup } from 'rollup';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { memoryIcon, microphoneIcon, searchIcon, type IconDefinition } from '../src';
import * as glyphs from '../src/icon-glyphs';

let library: string;

beforeAll(async () => {
  // Exercise the published JavaScript entry, including the library build's
  // annotations and re-exports, without writing to dist or depending on a prior build.
  vi.stubEnv('NODE_ENV', 'production');
  try {
    const result = await build({ configFile: 'vite.config.ts', logLevel: 'silent', build: { write: false } });
    const builds = Array.isArray(result) ? result : [result];
    const entry = builds.flatMap(output => 'output' in output ? output.output : [])
      .find(output => output.type === 'chunk' && output.isEntry);
    if (!entry || entry.type !== 'chunk') throw new Error('The package build did not produce an entry chunk');
    library = entry.code;
  } finally {
    vi.unstubAllEnvs();
  }
}, 60_000);

async function bundleConsumer(source: string) {
  const bundle = await rollup({
    input: 'consumer',
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    plugins: [{
      name: 'in-memory-package-consumer',
      resolveId(id) {
        if (id === 'consumer') return '\0consumer';
        if (id === '@randalvance/kraft-ui') return '\0kraft-ui';
      },
      load(id) {
        if (id === '\0consumer') return source;
        if (id === '\0kraft-ui') return library;
      },
    }],
  });
  try {
    const result = await bundle.generate({ format: 'es' });
    return result.output.filter(output => output.type === 'chunk').map(output => output.code).join('\n');
  } finally {
    await bundle.close();
  }
}

function pathData(definition: IconDefinition) {
  return definition.flatMap(([tag, props]) => tag === 'path' && 'd' in props ? [String(props.d)] : []);
}

describe('Icon package tree shaking', () => {
  it('retains only selected glyphs when a consumer creates a named subset', async () => {
    const baseline = await bundleConsumer(`
      import { createIcon } from '@randalvance/kraft-ui';
      export const AppIcon = createIcon({});
    `);
    const code = await bundleConsumer(`
      import { createIcon, searchIcon } from '@randalvance/kraft-ui';
      export const AppIcon = createIcon({ search: searchIcon });
    `);
    const selectedPaths = pathData(searchIcon);
    expect(selectedPaths.length).toBeGreaterThan(0);
    const occurrences = (source: string, path: string) => source.split(path).length - 1;
    for (const path of selectedPaths) expect(occurrences(code, path)).toBe(occurrences(baseline, path) + 1);
    const unusedPaths = Object.values(glyphs).flatMap(pathData).filter(path => !selectedPaths.includes(path));
    expect(unusedPaths.length).toBeGreaterThan(40);
    // Some existing controls inline matching geometry. Selecting an Icon must
    // add no unused glyph definitions beyond that existing control code.
    for (const path of unusedPaths) expect(occurrences(code, path), path).toBe(occurrences(baseline, path));
  });

  it('removes the icon catalogue and renderer when the consumer does not use icons', async () => {
    const code = await bundleConsumer(`
      import { Button } from '@randalvance/kraft-ui';
      export { Button };
    `);
    for (const definition of [memoryIcon, microphoneIcon, searchIcon]) {
      for (const path of pathData(definition)) expect(code.includes(path), path).toBe(false);
    }
    expect(/(['"])kraft-icon\1/.test(code)).toBe(false);
  });
});
