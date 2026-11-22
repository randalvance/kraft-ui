import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Checkbox, CheckboxGroup, Surface } from '../src';

const meta = {
  title: 'Primitives/CheckboxGroup',
  component: CheckboxGroup,
  args: { label: 'Print checklist' },
  decorators: [Story => <Surface style={{ width: 'min(100%, 560px)' }}><Story /></Surface>],
} satisfies Meta<typeof CheckboxGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const tasks = ['Check paper stock', 'Trim the covers', 'Fold the inserts', 'Collate the sheets', 'Sew the binding', 'Check page order', 'Pack the copies', 'Send the invoice'];

export const WithProgress: Story = {
  render: function Progress(args) {
    const [done, setDone] = useState(tasks.slice(0, 4));
    return <CheckboxGroup {...args} tally={`${done.length} of ${tasks.length}`}>
      {tasks.map(task => <Checkbox key={task} variant="pen" strikeWhenChecked checked={done.includes(task)}
        onChange={event => {
          const { checked } = event.currentTarget;
          setDone(previous => checked ? [...previous, task] : previous.filter(item => item !== task));
        }}
      >
        {task}
      </Checkbox>)}
    </CheckboxGroup>;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Print checklist' });
    await expect(group).toHaveAccessibleDescription('4 of 8');
    const first = canvas.getByRole('checkbox', { name: tasks[0] });
    await userEvent.tab();
    await expect(first).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(group).toHaveAccessibleDescription('3 of 8');
  },
};

export const Columns: Story = {
  args: { columns: 2, tally: '2 of 5' },
  render: args => <CheckboxGroup {...args}>
    {tasks.slice(0, 5).map((task, index) => <Checkbox key={task} defaultChecked={index < 2}>{task}</Checkbox>)}
  </CheckboxGroup>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rows = canvas.getAllByRole('checkbox').map(input => input.closest('label')!.getBoundingClientRect());
    await expect(rows[0].top).toBe(rows[1].top);
    await expect(rows[1].left).toBeGreaterThan(rows[0].left);
    await expect(rows[2].top).toBeGreaterThan(rows[0].top);
    await expect(rows[4].left).toBe(rows[0].left);
    const group = canvas.getByRole('group', { name: 'Print checklist' });
    group.style.width = '240px';
    try {
      const [first, second] = canvas.getAllByRole('checkbox').map(input => input.closest('label')!.getBoundingClientRect());
      await expect(second.left).toBe(first.left);
      await expect(second.top).toBeGreaterThan(first.top);
    } finally {
      group.style.removeProperty('width');
    }
  },
};

export const Horizontal: Story = {
  args: { label: 'Ink colors', orientation: 'horizontal' },
  render: args => <CheckboxGroup {...args}>
    <Checkbox defaultChecked>Blue</Checkbox>
    <Checkbox>Black</Checkbox>
    <Checkbox disabled>Red</Checkbox>
  </CheckboxGroup>,
};

export const Disabled: Story = {
  args: { disabled: true, tally: '1 of 2' },
  render: args => <CheckboxGroup {...args}>
    <Checkbox defaultChecked>{tasks[0]}</Checkbox>
    <Checkbox>{tasks[1]}</Checkbox>
  </CheckboxGroup>,
};
