import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Badge, Mat, Pinwheel, Sticker, Tape } from '../src';

describe('paper materials and marks', () => {
  it('renders compact marks as native spans with refs and server-rendered sizes', () => {
    const badge = createRef<HTMLSpanElement>();
    const sticker = createRef<HTMLSpanElement>();
    render(<><Badge ref={badge} size="sm">Ready</Badge><Sticker ref={sticker} size="count" decorative>12</Sticker></>);
    expect(badge.current?.tagName).toBe('SPAN');
    expect(badge.current).toHaveAttribute('data-size', 'sm');
    expect(sticker.current?.tagName).toBe('SPAN');
    expect(sticker.current).toHaveAttribute('aria-hidden', 'true');
    expect(renderToString(<><Badge size="count">0</Badge><Sticker size="sm">K</Sticker></>))
      .toMatch(/data-size="count">0<\/span>.*data-size="sm">K<\/span>/);
  });

  it('forwards Mat props and ref to its native element and insets the paper sheet', () => {
    const ref = createRef<HTMLElement>();
    render(<Mat as="article" aria-label="Proof" ref={ref} tone="amber" padding={8} className="proof">
      <h2>Review the proof</h2>
    </Mat>);
    const mat = screen.getByRole('article', { name: 'Proof' });
    expect(ref.current).toBe(mat);
    expect(mat).toHaveClass('proof');
    expect(mat).toHaveAttribute('data-tone', 'amber');
    const paper = mat.querySelector<HTMLElement>(':scope > .kraft-surface');
    expect(paper).toHaveAttribute('data-material', 'paper');
    expect(paper?.style.getPropertyValue('--kraft-padding')).toBe('var(--kraft-space-8)');
    expect(paper).toContainElement(screen.getByRole('heading', { name: 'Review the proof' }));
  });

  it('keeps unlabelled Tape and Pinwheel out of the accessibility tree', () => {
    render(<><Tape data-testid="tape" label=" " /><Pinwheel data-testid="pinwheel" /></>);
    expect(screen.getByTestId('tape')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('pinwheel')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('exposes labelled marks as an image and a status and forwards span refs', () => {
    const tape = createRef<HTMLSpanElement>();
    const pinwheel = createRef<HTMLSpanElement>();
    render(<>
      <Tape ref={tape} aria-label="Masking tape" placement="bottom-right" />
      <Pinwheel ref={pinwheel} aria-labelledby="job" size="button" />
      <span id="job">Preparing the proof</span>
    </>);
    expect(tape.current).toBe(screen.getByRole('img', { name: 'Masking tape' }));
    expect(tape.current).toHaveAttribute('data-placement', 'bottom-right');
    expect(pinwheel.current).toBe(screen.getByRole('status', { name: 'Preparing the proof' }));
    expect(pinwheel.current).toHaveAttribute('data-size', 'button');
    expect(pinwheel.current?.querySelector('svg')).toHaveAttribute('focusable', 'false');
  });

  it('renders the sheet, tape, and named status on the server', () => {
    const html = renderToString(<Mat as="section" tone="sage"><Tape /><Pinwheel label="Loading proof" /></Mat>);
    expect(html).toContain('<section class="kraft-mat" data-tone="sage">');
    expect(html).toContain('data-material="paper"');
    expect(html).toContain('aria-hidden="true" class="kraft-tape" data-placement="top"');
    expect(html).toContain('role="status" aria-label="Loading proof"');
  });
});
