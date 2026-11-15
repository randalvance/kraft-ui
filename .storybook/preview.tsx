import type { Preview } from '@storybook/react-vite';
import { ThemeProvider } from '../src';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/nunito';
import '@fontsource/caveat/500.css';
import '@fontsource/caveat/600.css';
import '../src/styles.css';
import './preview.css';
const preview: Preview = {
 tags: ['autodocs'],
 initialGlobals: { theme: import.meta.env.VITE_KRAFT_THEME ?? 'paper', texture: 'on', motion: 'on', tilt: 'on' },
 globalTypes: {
  theme: { description: 'Material theme', toolbar: { icon: 'paintbrush', items: ['paper', 'night'], dynamicTitle: true } },
  texture: { toolbar: { icon: 'photo', items: ['on', 'off'], dynamicTitle: true } },
  motion: { toolbar: { icon: 'play', items: ['on', 'off'], dynamicTitle: true } },
  tilt: { description: 'Paper decoration tilt; stickers always stay upright', toolbar: { icon: 'contrast', items: ['on', 'off'], dynamicTitle: true } },
 },
 decorators: [(Story, context) => <ThemeProvider theme={context.globals.theme} texture={context.globals.texture !== 'off'} motion={context.globals.motion !== 'off'} tilt={context.globals.tilt !== 'off'} className="story-stage"><Story /></ThemeProvider>],
 parameters: {
  layout: 'fullscreen', controls: { expanded: true },
  a11y: { test: 'error' },
  options: { storySort: { order: ['Start here', 'Foundations', 'Primitives', 'Compositions'] } },
 },
};
export default preview;
