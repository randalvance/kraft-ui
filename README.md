# Kraft UI

Tactile React primitives made of paper, cardboard, and stickers.

Cardboard holds things. Paper carries words. Stickers mark things. Kraft UI brings that material vocabulary to composable, accessible interfaces in Paper and Night themes.

## Install

```sh
npm install @randalvance/kraft-ui
```

The package is being prepared for its first release. For local evaluation, run `npm pack` in this repository and install the resulting archive in your application.

```tsx
import { ThemeProvider, Stack, Surface, Heading, Text, Button } from '@randalvance/kraft-ui';
import '@randalvance/kraft-ui/styles.css';

export function Note() {
  return (
    <ThemeProvider theme="paper">
      <Surface as="article">
        <Stack gap={16}>
          <Heading as="h2">A fresh sheet</Heading>
          <Text>A place for your next idea.</Text>
          <Button variant="blue">Keep this idea</Button>
        </Stack>
      </Surface>
    </ThemeProvider>
  );
}
```

## Primitives

| Group | Exports |
| --- | --- |
| Theme | `ThemeProvider` |
| Layout | `Box`, `Stack`, `Inline` |
| Typography | `Text`, `Heading` |
| Material | `Surface` |
| Controls | `Button`, `IconButton`, `Link` |
| Marks | `Separator`, `Badge`, `Sticker` |

Layout, typography, and surfaces accept `as` to select the semantic HTML element. Native props and refs pass through. Buttons stay buttons; links stay anchors. `IconButton` requires `aria-label`. `Button` defaults to `type="button"`; loading disables activation, exposes `aria-busy`, and retains its label. Toggle buttons use application-managed state and `aria-pressed`; selected toggles remain depressed on hover. Text buttons wrap long labels within their available width, including in flex and grid layouts.

Spacing props use `0 | 2 | 3 | 4 | 6 | 8 | 10 | 12 | 14 | 16 | 24`. Button and mark tones are `neutral | blue | sage | danger | attention`. Stickers are upright and noninteractive; use `decorative` for redundant marks. Round stickers are true 64px circles; customize `--kraft-sticker-size` for another diameter and use pills for longer labels. Small icon buttons are 28×28px circles with 16px glyphs. `Surface` materials are `paper | cardboard | kraft`. Paper and kraft support elevations 0–3; cardboard uses its structural elevation for 1–3 and no shadow for 0.

Form controls and complex widgets are outside the initial release.

## Themes and customization

Use `<ThemeProvider theme="night" texture={false} motion={false} tilt={false}>` for a quieter Night interface. The tilt setting controls paper decoration; stickers never rotate. Providers are scoped, can nest, and do not mutate the document. Reduced-motion preferences always disable transitions. Theme selection is explicit: applications choose persistence and system-preference behavior.

CSS variables use the `--kraft-` prefix. Override them on an application scope, for example `style={{ '--kraft-font-sans': 'Your font, sans-serif' } as React.CSSProperties}`. Surfaces provide material-aware link and secondary-text ink. Nested surfaces and providers reset those roles for their own material/theme. Night kraft uses its readable primary ink for secondary copy. Raw foundation tokens are available from `@randalvance/kraft-ui/tokens.json`. The stylesheet has root token defaults; visual resets and typography are scoped to Kraft components and providers.

Fonts are application-owned. The default stacks are Fraunces/Georgia, Nunito/system sans, Caveat/cursive, and Courier New/monospace. No remote font requests are made by the library. Storybook demonstrates locally bundled fonts.

React 18 and 19 and server rendering are supported. The package is ESM with TypeScript declarations. Modern evergreen browsers are required for CSS color mixing.

## Development

Use Node 24 (`nvm use`) and npm.

```sh
npm ci
npx playwright install chromium
npm run storybook
```

- `npm run typecheck`: component and story types.
- `npm test`: native semantics, keyboard behavior, refs, and server rendering.
- `npm run test:buttons`: real-browser wrapping and pointer-state regressions in both themes.
- `npm run test:contrast`: screenshot-based text contrast checks across materials, themes, and texture preferences.
- `npm run test:stories`: browser-rendered stories, interactions, and accessibility checks.
- `npm run build`: distributable ESM, CSS, assets, declarations, and tokens.
- `npm run build-storybook`: static documentation.
- `npm run check`: all required checks.

Storybook provides theme and decoration controls, material/color/type/spacing foundations, individual component APIs, and a working desk composition. Merged changes deploy to [the component explorer](https://randalvance.github.io/kraft-ui/) after GitHub Pages is configured.

See [DESIGN.md](DESIGN.md) for visual rules, [PRODUCT.md](PRODUCT.md) for product constraints, and [releasing](docs/releasing.md) for release setup.
