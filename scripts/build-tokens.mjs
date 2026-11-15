import { readFileSync, writeFileSync } from 'node:fs';
const tokens = JSON.parse(readFileSync('src/tokens.json', 'utf8'));
let css = '/* Kraft UI foundations. Generated from src/tokens.json by scripts/build-tokens.mjs. */\n';
for (const theme of ['paper', 'night']) {
  css += `${theme === 'paper' ? ':root, [data-kraft-theme="paper"]' : '[data-kraft-theme="night"]'} {\n  color-scheme: ${theme === 'paper' ? 'light' : 'dark'};\n`;
  for (const category of ['color', 'shadow']) {
    for (const token of tokens[category].tokens) css += `  --kraft-${token.name}: ${token.value[theme]};\n`;
  }
  css += `  --kraft-pulp-paper: url("./assets/pulp-paper-${theme}.png");\n  --kraft-pulp-board: url("./assets/pulp-board-${theme}.png");\n`;
  if (theme === 'paper') {
    for (const category of ['spacing', 'radius', 'tilt', 'stroke', 'motion']) {
      for (const token of tokens[category].tokens) css += `  --kraft-${token.name}: ${token.value};\n`;
    }
    for (const [name, value] of Object.entries(tokens.type.families)) css += `  --kraft-font-${name}: ${value};\n`;
  }
  css += '}\n';
}
writeFileSync('src/tokens.css', css);
