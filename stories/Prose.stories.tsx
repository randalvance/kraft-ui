import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Blockquote, Checkbox, Code, CodeBlock, Prose, Surface } from '../src';

const meta = {
  title: 'Components/Prose',
  component: Prose,
  parameters: { docs: { description: { component: 'Reading rhythm for long-form content such as a note, a report, or rendered markdown. Place plain HTML inside it; headings, paragraphs, lists, links, rules, tables, inline code, code blocks, quotes, and todo items take their spacing and marks from Prose.' } } },
  decorators: [Story => <Surface padding={24} style={{ maxWidth: 760 }}><Story /></Surface>],
} satisfies Meta<typeof Prose>;
export default meta;
type Story = StoryObj<typeof meta>;

export const RenderedMarkdown: Story = {
  args: {
    as: 'article',
    children: <>
      <h1>Release notes</h1>
      <p>The paper shelf now keeps <strong>drafts</strong> beside finished notes. Read the <a href="#migration">migration guide</a> before you update, and run <code>npm run check</code> afterwards.</p>
      <h2>What changed</h2>
      <ul>
        <li>Notes keep their place when you switch workspaces.</li>
        <li>Pinned notes stay at the top.
          <ul><li>Pins sync across devices.</li></ul>
        </li>
      </ul>
      <ol>
        <li>Update the package.</li>
        <li>Import the stylesheet once.</li>
      </ol>
      <blockquote><p>Cardboard holds things, paper carries words, and stickers mark things.</p></blockquote>
      <pre><code>{'npm install @randalvance/kraft-ui\nnpm run build'}</code></pre>
      <h3>Release checklist</h3>
      <ul>
        <li><label><input type="checkbox" checked disabled /> Write the changeset</label></li>
        <li><label><input type="checkbox" disabled /> Publish the package</label></li>
      </ul>
      <hr />
      <table>
        <caption>Supported themes</caption>
        <thead><tr><th>Theme</th><th>Ground</th></tr></thead>
        <tbody>
          <tr><td>Paper</td><td>Warm desk</td></tr>
          <tr><td>Night</td><td>Same desk after dark</td></tr>
        </tbody>
      </table>
    </>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const article = canvasElement.querySelector('article.kraft-prose')!;
    const heading = canvas.getByRole('heading', { level: 1, name: 'Release notes' });
    await expect(getComputedStyle(heading).fontSize).toBe('26px');
    const link = canvas.getByRole('link', { name: 'migration guide' });
    link.focus();
    await expect(getComputedStyle(link).outlineStyle).toBe('solid');
    const [done, open] = canvas.getAllByRole('checkbox');
    await expect(getComputedStyle(done.closest('li')!).textDecorationLine).toBe('line-through');
    await expect(getComputedStyle(open.closest('li')!).textDecorationLine).toBe('none');
    await expect(getComputedStyle(canvas.getByText('npm run check')).fontFamily).toContain('Courier');
    await expect(canvas.getByRole('table', { name: 'Supported themes' })).toBeInTheDocument();
    await expect(article.querySelector('blockquote')).toBeInTheDocument();
  },
};

export const Todos: Story = {
  render: function Todos() {
    return <Prose>
      <h2>Packing list</h2>
      <ul>
        <li><Checkbox defaultChecked>Masking tape</Checkbox></li>
        <li><Checkbox>Kraft paper</Checkbox></li>
        <li><Checkbox>Stickers</Checkbox></li>
      </ul>
    </Prose>;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const paper = canvas.getByRole('checkbox', { name: 'Kraft paper' });
    const item = paper.closest('li')!;
    await expect(getComputedStyle(item).textDecorationLine).toBe('none');
    paper.focus();
    await userEvent.keyboard('[Space]');
    await expect(paper).toBeChecked();
    await expect(getComputedStyle(item).textDecorationLine).toBe('line-through');
    await expect(getComputedStyle(canvas.getByRole('checkbox', { name: 'Masking tape' }).closest('li')!).textDecorationLine).toBe('line-through');
  },
};

export const Composed: Story = {
  render: () => <Prose as="section" aria-labelledby="composed-title">
    <h2 id="composed-title">Setting up the theme</h2>
    <p>Wrap the application in <Code>ThemeProvider</Code> and import the stylesheet once.</p>
    <CodeBlock language="tsx" copyable code={"import '@randalvance/kraft-ui/styles.css';\n\n<ThemeProvider theme=\"paper\">\n  <App />\n</ThemeProvider>"} />
    <Blockquote cite="https://example.com/brand"><p>Playfulness is small and deliberate.</p></Blockquote>
    <p>Night is the same desk after dark.</p>
  </Prose>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: 'Setting up the theme' })).toHaveClass('kraft-prose');
    await expect(canvas.getByRole('button', { name: 'Copy code' })).toBeInTheDocument();
    await expect(getComputedStyle(canvasElement.querySelector('.kraft-code-block-scroll')!).marginBottom).toBe('0px');
  },
};
