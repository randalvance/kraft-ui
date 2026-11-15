import type { StorybookConfig } from '@storybook/react-vite';
const config: StorybookConfig = {
 stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(ts|tsx)'],
 addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
 framework: '@storybook/react-vite',
 docs: { defaultName: 'Docs' },
};
export default config;
