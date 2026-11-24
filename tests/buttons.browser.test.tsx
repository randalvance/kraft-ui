import { afterEach, describe, expect, it, vi } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import { cleanup, render } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { Button, Card, CardAddTile, Heading, Link, Icon, IconButton, Inline, Pinwheel, Sticker, ThemeProvider, type Theme } from '../src';
import '../src/styles.css';

afterEach(cleanup);
const longLabel = 'KeepThisVeryLongUnbrokenIdeaIdentifier'.repeat(6);
const plus = <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>;
const variants = ['neutral', 'blue', 'sage', 'danger', 'attention', 'ghost', 'text', 'dashed'] as const;
const layouts = {
  standalone: {},
  flex: { display: 'flex', gap: 12, alignItems: 'start' },
  grid: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)' },
} satisfies Record<string, CSSProperties>;

function assertFits(button: HTMLButtonElement, frame: HTMLElement) {
  const buttonRect = button.getBoundingClientRect();
  const frameRect = frame.getBoundingClientRect();
  expect(buttonRect.width).toBeGreaterThan(0);
  expect(buttonRect.left).toBeGreaterThanOrEqual(frameRect.left - 1);
  expect(buttonRect.right).toBeLessThanOrEqual(frameRect.right + 1);
  expect(button.scrollWidth).toBeLessThanOrEqual(button.clientWidth + 1);
}

describe.each<Theme>(['paper', 'night'])('%s button resilience', theme => {
  it('keeps labels on one line unless wrapping is enabled', () => {
    const view = render(<ThemeProvider theme={theme}>
      <Button style={{ width: 145 }}>Keep this label together</Button>
      <Button wrap style={{ width: 145 }}>Keep this label together</Button>
    </ThemeProvider>);
    const [singleLine, multipleLines] = view.getAllByRole('button');
    expect(getComputedStyle(singleLine).whiteSpace).toBe('nowrap');
    expect(singleLine.getBoundingClientRect().height).toBe(36);
    expect(multipleLines.getBoundingClientRect().height).toBeGreaterThan(36);
  });

  it.each(Object.entries(layouts))('wraps long labels in %s layouts', (layoutName, style) => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const view = render(<ThemeProvider theme={theme} motion={false}>
        <div data-testid="frame" style={{ width: 180, ...style }}>
          <Button size={size} wrap>{longLabel}</Button>
          {layoutName === 'flex' && <IconButton size="sm" aria-label="Add note">{plus}</IconButton>}
        </div>
      </ThemeProvider>);
      const button = view.getByRole('button', { name: longLabel }) as HTMLButtonElement;
      assertFits(button, view.getByTestId('frame'));
      expect(button.textContent).toBe(longLabel);
      expect(button.getBoundingClientRect().height).toBeGreaterThan(44);
      view.unmount();
    }
  });

  it('wraps loading, translated, RTL, emoji, and nested labels', () => {
    const labels = [
      { text: longLabel, loading: true },
      { text: 'Änderungen an dieser gemeinsamen Notiz endgültig speichern' },
      { text: 'حفظهذهالملاحظةالطويلةللرجوعإليهالاحقًا'.repeat(4), dir: 'rtl' },
      { text: 'この長いメモを次回の作業のために保存する'.repeat(4) },
      { text: '📎📝📌'.repeat(18) },
    ];
    for (const label of labels) {
      const view = render(<ThemeProvider theme={theme} motion={false}>
        <div data-testid="frame" style={{ width: 180 }} dir={label.dir}>
          <Button loading={label.loading} wrap><span>{label.text}</span></Button>
        </div>
      </ThemeProvider>);
      const button = view.getByRole('button') as HTMLButtonElement;
      assertFits(button, view.getByTestId('frame'));
      expect(button.textContent).toBe(label.text);
      if (label.loading) expect(button.querySelector('.kraft-pinwheel')!.getBoundingClientRect().width).toBe(16);
      view.unmount();
    }
  });

  it.each([true, false])('keeps every pressed variant flat and aligned with decoration=%s', decoration => {
    const view = render(<ThemeProvider theme={theme} texture={decoration} motion={decoration} tilt={decoration}>
      {variants.map(variant => <Inline key={variant} wrap gap={12} style={{ width: 244 }}>
        <Button variant={variant} style={{ width: 114 }}><span>{variant} idle</span></Button>
        <Button variant={variant} style={{ width: 114 }} aria-pressed><span>{variant} on</span></Button>
        <Button style={{ width: 114 }}>Next row</Button>
      </Inline>)}
    </ThemeProvider>);
    for (const variant of variants) {
      const idle = view.getByRole('button', { name: `${variant} idle` });
      const pressed = view.getByRole('button', { name: `${variant} on`, pressed: true });
      const nextRow = pressed.nextElementSibling!;
      expect(nextRow.getBoundingClientRect().top).toBeGreaterThan(pressed.getBoundingClientRect().bottom);
      expect(pressed.getBoundingClientRect().top).toBe(idle.getBoundingClientRect().top);
      expect(pressed.firstElementChild!.getBoundingClientRect().bottom).toBe(idle.firstElementChild!.getBoundingClientRect().bottom);
      const css = getComputedStyle(pressed);
      expect(css.transform).toBe('none');
      expect(css.boxShadow).toContain('inset');
      expect(css.backgroundImage).toBe('none');
    }
  });

  it('lays out leading icons and corner badges in both directions', () => {
    const view = render(<ThemeProvider theme={theme}>
      {(['ltr', 'rtl'] as const).map(dir => <Inline key={dir} dir={dir} gap={16}>
        <Button variant="dashed" leading={<Icon name="plus" />}><span>Add {dir}</span></Button>
        <IconButton variant="bare" size="sm" aria-label={`Inbox ${dir}`} badge={<Sticker size="count">12</Sticker>}>
          <Icon name="inbox" />
        </IconButton>
      </Inline>)}
    </ThemeProvider>);
    for (const dir of ['ltr', 'rtl']) {
      const add = view.getByRole('button', { name: `Add ${dir}` });
      const [leading, label] = [...add.children].map(child => child.getBoundingClientRect());
      expect(dir === 'rtl' ? leading.left - label.right : label.left - leading.right).toBeCloseTo(8);

      const inbox = view.getByRole('button', { name: `Inbox ${dir}` });
      const target = inbox.getBoundingClientRect();
      const badge = view.getAllByText('12').find(count => inbox.contains(count))!.getBoundingClientRect();
      expect([target.width, target.height]).toEqual([28, 28]);
      expect(badge.top).toBeLessThan(target.top);
      expect(dir === 'rtl' ? badge.left < target.left : badge.right > target.right).toBe(true);
      expect(getComputedStyle(inbox).backgroundColor).toBe('rgba(0, 0, 0, 0)');
      expect(getComputedStyle(inbox).borderTopColor).toBe('rgba(0, 0, 0, 0)');
      expect(getComputedStyle(inbox).boxShadow).toBe('none');
    }
  });

  it('supports keyboard focus and activation for the new styles', async () => {
    const activate = vi.fn();
    const view = render(<ThemeProvider theme={theme} style={{ padding: 16 }}>
      <Inline gap={16}>
        <Button variant="ghost" onClick={activate}>Preview</Button>
        <Button variant="text" tone="danger" onClick={activate}>Remove</Button>
        <Button variant="dashed" onClick={activate}>Add</Button>
        <IconButton variant="bare" aria-label="Pin" aria-pressed onClick={activate}><Icon name="pin" /></IconButton>
      </Inline>
    </ThemeProvider>);
    const ghost = getComputedStyle(view.getByRole('button', { name: 'Preview' }));
    const text = getComputedStyle(view.getByRole('button', { name: 'Remove' }));
    const dashed = getComputedStyle(view.getByRole('button', { name: 'Add' }));
    expect(ghost.borderTopStyle).toBe('solid');
    expect(ghost.boxShadow).toBe('none');
    expect(text.borderTopColor).toBe('rgba(0, 0, 0, 0)');
    expect(text.color).not.toBe(ghost.color);
    expect(dashed.borderTopStyle).toBe('dashed');

    for (const button of view.getAllByRole('button')) {
      await userEvent.tab();
      expect(document.activeElement).toBe(button);
      expect(button.matches(':focus-visible')).toBe(true);
      expect(getComputedStyle(button).outlineStyle).toBe('solid');
      await userEvent.keyboard('{Enter}[Space]');
    }
    expect(activate).toHaveBeenCalledTimes(8);
  });

  it('lifts a pressable card on hover and leaves slot controls independently clickable', async () => {
    const open = vi.fn();
    const pin = vi.fn();
    const view = render(<ThemeProvider theme={theme} motion={false} style={{ display: 'grid', gap: 16, padding: 16 }}>
      <Card as="button" aria-label="Print studio" onClick={open} header="Print studio" tone="teal"
        corner={<button type="button" onClick={pin}>Pin studio</button>}>
        Review the proofs.
      </Card>
      <CardAddTile label="Add studio" />
    </ThemeProvider>);
    const target = view.getByRole('button', { name: 'Print studio' });
    const frame = target.closest('article')!;
    const restingShadow = getComputedStyle(frame).boxShadow;
    const card = page.getByRole('button', { name: 'Print studio' });
    await card.hover();
    expect(target.matches(':hover')).toBe(true);
    expect(getComputedStyle(frame).boxShadow).not.toBe(restingShadow);
    await card.click();
    expect(open).toHaveBeenCalledOnce();
    await page.getByRole('button', { name: 'Pin studio' }).click();
    expect(pin).toHaveBeenCalledOnce();
    expect(open).toHaveBeenCalledOnce();
  });

  it('preserves pressed hover and normal active states with real pointer input', async () => {
    let pointerDownTransform = '';
    const view = render(<ThemeProvider theme={theme} motion={false}>
      <Button aria-pressed="true">Pinned</Button>
      <Button onMouseDown={event => { pointerDownTransform = getComputedStyle(event.currentTarget).transform; }}>Normal</Button>
    </ThemeProvider>);
    const pinned = view.getByRole('button', { name: 'Pinned' });
    const pressedShadow = getComputedStyle(pinned).boxShadow;
    expect(getComputedStyle(pinned).transform).toBe('none');
    await page.getByRole('button', { name: 'Pinned' }).hover();
    expect(pinned.matches(':hover')).toBe(true);
    expect(getComputedStyle(pinned).transform).toBe('none');
    expect(getComputedStyle(pinned).boxShadow).toBe(pressedShadow);
    expect(pinned.getAttribute('aria-pressed')).toBe('true');
    await page.getByRole('button', { name: 'Normal' }).hover();
    const normal = view.getByRole('button', { name: 'Normal' });
    expect(getComputedStyle(normal).transform).toBe('matrix(1, 0, 0, 1, -1, -1)');
    await page.getByRole('button', { name: 'Normal' }).click();
    expect(pointerDownTransform).toBe('matrix(1, 0, 0, 1, 2, 3)');
    expect(getComputedStyle(normal).transform).toBe('matrix(1, 0, 0, 1, -1, -1)');
    expect(getComputedStyle(pinned).transform).toBe('none');
  });
  it('underlines a quiet heading link on real hover and keyboard focus', async () => {
    const view = render(<ThemeProvider theme={theme} style={{ padding: 24 }}>
      <Heading as="h2" size="title-sm"><Link href="#proofs" tone="inherit" underline="hover">Proofs</Link></Heading>
      <Button>After</Button>
    </ThemeProvider>);
    const link = view.getByRole('link', { name: 'Proofs' });
    expect(getComputedStyle(link).textDecorationLine).toBe('none');
    expect(getComputedStyle(link).color).toBe(getComputedStyle(link.parentElement!).color);
    await page.getByRole('link', { name: 'Proofs' }).hover();
    expect(link.matches(':hover')).toBe(true);
    expect(getComputedStyle(link).textDecorationLine).toBe('underline');
    await page.getByRole('button', { name: 'After' }).hover();
    expect(getComputedStyle(link).textDecorationLine).toBe('none');
    await userEvent.tab();
    expect(link).toBe(document.activeElement);
    expect(getComputedStyle(link).textDecorationLine).toBe('underline');
    expect(getComputedStyle(link).outlineStyle).toBe('solid');
  });
});

it('stops the shared spinner for theme motion settings and system reduced motion', async () => {
  const session = cdp();
  await session.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  try {
    const spinner = <Pinwheel label="Updating" />;
    const view = render(<ThemeProvider motion={false}>
      {spinner}
      <ThemeProvider motion><Button loading>Save</Button></ThemeProvider>
    </ThemeProvider>);
    const row = view.getByRole('status', { name: 'Updating' }).querySelector('svg')!;
    const button = view.getByRole('button', { name: 'Save' }).querySelector('svg')!;
    expect(row.getBoundingClientRect().width).toBe(24);
    expect(getComputedStyle(row).animationPlayState).toBe('paused');
    expect(getComputedStyle(button).animationPlayState).toBe('running');
    expect(getComputedStyle(button).animationName).toBe('kraft-pinwheel-spin');

    await session.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    expect(getComputedStyle(row).animationName).toBe('none');
    expect(getComputedStyle(button).animationName).toBe('none');
  } finally {
    await session.send('Emulation.setEmulatedMedia', { features: [] });
  }
});
