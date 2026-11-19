import { createRef, useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Avatar, AvatarGroup, AvatarPicker, Icon, type AvatarOption, type AvatarProps } from '../src';

const options: AvatarOption[] = [
  { value: 'mochi', label: 'Mochi', src: '/mochi.png', status: { tone: 'working', label: 'Working' } },
  { value: 'pip', label: 'Pip', initial: 'P', tone: 'sage', description: 'A patient helper' },
  { value: 'rue', label: 'Rue', glyph: <Icon name="agent" />, disabled: true },
  { value: 'kit', label: 'Kit', initial: 'K' },
];

describe('Avatar', () => {
  it('exposes one named image, includes status, and forwards span props and ref', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Avatar ref={ref} src="/mochi.png" alt="Mochi" size={84} tilt={-3}
      status={{ tone: 'working', label: 'Reviewing notes' }} className="pet" title="Agent portrait" />);
    const portrait = screen.getByRole('img', { name: 'Mochi, Reviewing notes' });
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(ref.current).toBe(portrait);
    expect(portrait).toHaveClass('kraft-avatar', 'pet');
    expect(portrait).toHaveAttribute('title', 'Agent portrait');
    expect(portrait.style.getPropertyValue('--kraft-avatar-size')).toBe('84px');
    expect(portrait.style.getPropertyValue('--kraft-avatar-tilt')).toBe('-3deg');
    expect(portrait.querySelector('img')).toHaveAttribute('src', '/mochi.png');
    expect(portrait.querySelector('img')).toHaveAttribute('alt', '');
    expect(portrait.querySelector('.kraft-avatar-status')).toHaveAttribute('aria-hidden', 'true');
  });

  it('names monograms and glyphs while hiding decorative portraits and their status', () => {
    render(<>
      <Avatar initial="P" alt="Pip" tone="sage" />
      <Avatar glyph={<Icon name="agent" label="An agent glyph" />} alt="Rue" />
      <Avatar decorative src="/mochi.png" status={{ tone: 'blocked', label: 'Blocked' }} data-testid="decoration" />
    </>);
    expect(screen.getByRole('img', { name: 'Pip' })).toHaveTextContent('P');
    expect(screen.getByRole('img', { name: 'Rue' })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(screen.getByTestId('decoration')).toHaveAttribute('aria-hidden', 'true');
  });

  it('requires alt text and exactly one portrait source in the public type', () => {
    // @ts-expect-error A meaningful image requires alt text.
    const unnamed: AvatarProps = { src: '/mochi.png' };
    // @ts-expect-error Monograms also require alt text.
    const unnamedInitial: AvatarProps = { initial: 'M' };
    // @ts-expect-error A portrait has exactly one source.
    const ambiguous: AvatarProps = { src: '/mochi.png', initial: 'M', alt: 'Mochi' };
    const decorative: AvatarProps = { glyph: <Icon name="agent" />, decorative: true };
    expect([unnamed, unnamedInitial, ambiguous, decorative]).toHaveLength(4);
  });
});

describe('AvatarGroup', () => {
  const avatars: AvatarProps[] = [
    { initial: 'M', alt: 'Mochi' }, { initial: 'P', alt: 'Pip' }, { initial: 'R', alt: 'Rue' },
  ];

  it('renders a named native list, only the visible portraits, and a named overflow count', () => {
    const ref = createRef<HTMLUListElement>();
    render(<AvatarGroup ref={ref} label="Helpers" avatars={avatars} max={2} size={24} className="team" />);
    const group = screen.getByRole('list', { name: 'Helpers' });
    expect(group.tagName).toBe('UL');
    expect(ref.current).toBe(group);
    expect(group).toHaveClass('team');
    expect(within(group).getAllByRole('listitem')).toHaveLength(3);
    expect(within(group).getByRole('img', { name: '1 more avatar' })).toHaveTextContent('+1');
    expect(screen.queryByRole('img', { name: 'Rue' })).not.toBeInTheDocument();
    expect(within(group).getByRole('img', { name: 'Mochi' }).style.getPropertyValue('--kraft-avatar-size')).toBe('24px');
  });

  it('handles an empty list and zero or fractional limits without losing the count', () => {
    const view = render(<AvatarGroup label="Helpers" avatars={[]} />);
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    view.rerender(<AvatarGroup label="Helpers" avatars={avatars} max={0} />);
    expect(screen.getByRole('img', { name: '3 more avatars' })).toBeInTheDocument();
    view.rerender(<AvatarGroup label="Helpers" avatars={avatars} max={1.8} />);
    expect(screen.getByRole('img', { name: '2 more avatars' })).toBeInTheDocument();
    view.rerender(<AvatarGroup label="Helpers" avatars={avatars} max={9} />);
    expect(screen.getAllByRole('img')).toHaveLength(3);
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });
});

describe('AvatarPicker', () => {
  it.each([undefined, 'mochi'])('participates in an external form with defaultValue=%s', async defaultValue => {
    const user = userEvent.setup();
    render(<>
      <form id="profile" aria-label="Profile"><button type="reset">Reset profile</button></form>
      <AvatarPicker form="profile" label="Choose a helper" name="helper" options={options}
        defaultValue={defaultValue} required />
    </>);
    const form = screen.getByRole('form', { name: 'Profile' }) as HTMLFormElement;
    expect(new FormData(form).get('helper')).toBe(defaultValue ?? null);
    expect(form.checkValidity()).toBe(defaultValue !== undefined);
    await user.click(screen.getByRole('radio', { name: 'Pip' }));
    expect(new FormData(form).get('helper')).toBe('pip');
    expect(form.checkValidity()).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Reset profile' }));
    expect(new FormData(form).get('helper')).toBe(defaultValue ?? null);
    expect(form.checkValidity()).toBe(defaultValue !== undefined);
    expect(screen.getByRole('radio', { name: 'Pip' })).not.toBeChecked();
  });

  it('uses named native radios, separate descriptions, native form values and reset', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const ref = createRef<HTMLFieldSetElement>();
    render(<form aria-label="Profile"><AvatarPicker ref={ref} label="Choose a helper" name="helper"
      options={options} defaultValue="mochi" required description="One helper per desk" onValueChange={onValueChange} />
      <button type="reset">Reset</button></form>);
    const group = screen.getByRole('group', { name: 'Choose a helper' });
    expect(ref.current).toBe(group);
    expect(group.tagName).toBe('FIELDSET');
    expect(group).toHaveAccessibleDescription('One helper per desk');
    expect(screen.getByRole('radio', { name: 'Mochi' })).toHaveAccessibleDescription('Working');
    const pip = screen.getByRole('radio', { name: 'Pip' });
    expect(pip).toHaveAccessibleDescription('A patient helper');
    expect(pip).toBeRequired();
    expect(screen.getByRole('radio', { name: 'Rue' })).toBeDisabled();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    await user.click(pip);
    expect(onValueChange).toHaveBeenLastCalledWith('pip', options[1]);
    const form = screen.getByRole('form', { name: 'Profile' }) as HTMLFormElement;
    expect(new FormData(form).get('helper')).toBe('pip');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(new FormData(form).get('helper')).toBe('mochi');
  });

  it('tabs into the checked option, navigates by arrow, skips disabled options, and wraps', async () => {
    const user = userEvent.setup();
    render(<AvatarPicker label="Helper" name="helper" options={options} defaultValue="pip" hideLabel />);
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Pip' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Kit' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Kit' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Mochi' })).toBeChecked();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('radio', { name: 'Kit' })).toBeChecked();
  });

  it('supports controlled values and native fieldset disabling', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState('mochi');
      return <AvatarPicker label="Helper" name="helper" options={options} value={value} onValueChange={setValue} />;
    }
    const view = render(<Controlled />);
    await user.click(screen.getByRole('radio', { name: 'Pip' }));
    expect(screen.getByRole('radio', { name: 'Pip' })).toBeChecked();
    const onValueChange = vi.fn();
    view.rerender(<AvatarPicker label="Helper" name="helper" options={options} disabled defaultValue="mochi" onValueChange={onValueChange} />);
    for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled();
    await user.click(screen.getByRole('radio', { name: 'Pip' }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('keeps a controlled selection until the caller changes it', () => {
    const onValueChange = vi.fn();
    render(<AvatarPicker label="Helper" name="helper" options={options} value="mochi" onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Pip' }));
    expect(onValueChange).toHaveBeenCalledWith('pip', options[1]);
    expect(screen.getByRole('radio', { name: 'Mochi' })).toBeChecked();
  });
});

it('server renders portraits, a counted list, and checked native radios without browser APIs', () => {
  const html = renderToString(<>
    <Avatar src="/mochi.png" alt="Mochi" status={{ tone: 'waiting', label: 'Waiting' }} />
    <AvatarGroup label="Helpers" avatars={[{ initial: 'P', alt: 'Pip' }, { initial: 'K', alt: 'Kit' }]} max={1} />
    <AvatarPicker label="Helper" name="helper" options={options} defaultValue="pip" />
  </>);
  expect(html).toContain('aria-label="Mochi, Waiting"');
  expect(html).toContain('<ul');
  expect(html).toContain('1 more avatar');
  expect(html).toContain('<fieldset');
  expect(html).toContain('<legend');
  expect(html).toMatch(/type="radio"[^>]*checked=""[^>]*value="pip"/);
});
