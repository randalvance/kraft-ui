import type { Preview } from '@storybook/react-vite';
import { ThemeProvider } from '../src';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/fraunces/wght-italic.css';
import '@fontsource-variable/nunito';
import '@fontsource/caveat/500.css';
import '@fontsource/caveat/600.css';
import '../src/styles.css';
import './preview.css';
// Fontsource faces use font-display: swap and download on first use, so a story can
// lay out with a fallback font and reflow mid-play. Load them before any story renders.
const storyFonts = ['16px "Nunito Variable"', '16px "Fraunces Variable"', 'italic 16px "Fraunces Variable"', '500 16px Caveat', '600 16px Caveat'];
const preview: Preview = {
 tags: ['autodocs'],
 loaders: [async () => { await Promise.all(storyFonts.map(font => document.fonts.load(font))); return {}; }],
 initialGlobals: { theme: import.meta.env.VITE_KRAFT_THEME ?? 'paper', texture: 'on', motion: 'on', tilt: 'on' },
 globalTypes: {
  theme: { description: 'Material theme', toolbar: { icon: 'paintbrush', items: ['paper', 'night'], dynamicTitle: true } },
  texture: { toolbar: { icon: 'photo', items: ['on', 'off'], dynamicTitle: true } },
  motion: { toolbar: { icon: 'play', items: ['on', 'off'], dynamicTitle: true } },
  tilt: { description: 'Paper decoration and opt-in portrait tilt', toolbar: { icon: 'contrast', items: ['on', 'off'], dynamicTitle: true } },
 },
 decorators: [(Story, context) => <ThemeProvider theme={context.globals.theme} texture={context.globals.texture !== 'off'} motion={context.globals.motion !== 'off'} tilt={context.globals.tilt !== 'off'} className="story-stage"><Story /></ThemeProvider>],
 parameters: {
  layout: 'fullscreen', controls: { expanded: true },
  a11y: { test: 'error' },
  options: { storySort: { order: ['Start here', 'Foundations', 'Primitives', 'Components', 'Compositions'] } },
 },
};
export default preview;
