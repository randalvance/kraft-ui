import { createRef } from 'react';
import { render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Stat, Stepper, Timeline, type StepperStep, type TimelineItem } from '../src';

describe('Stat', () => {
  it('prints the figure before its caption and forwards the ref and native attributes', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Stat ref={ref} value="12" label="Open cards" id="open" className="wide" data-app="desk" />);
    const stat = ref.current!;
    expect(stat.tagName).toBe('DIV');
    expect(stat).toHaveClass('kraft-stat', 'wide');
    expect(stat).toHaveAttribute('id', 'open');
    expect(stat).toHaveAttribute('data-app', 'desk');
    expect(stat).toHaveAttribute('data-tone', 'neutral');
    expect(stat).toHaveAttribute('data-size', 'md');
    expect(stat).toHaveAttribute('data-align', 'start');
    expect([...stat.children].map(child => child.textContent)).toEqual(['12', 'Open cards']);
    expect(stat).not.toHaveAttribute('role');
    expect(stat).not.toHaveAttribute('tabindex');
  });

  it('takes a tone, size, and alignment and renders on the server', () => {
    const html = renderToString(<Stat value={<>98<small>%</small></>} label="Passing" tone="sage" size="lg" align="end" />);
    expect(html).toContain('data-tone="sage"');
    expect(html).toContain('data-size="lg"');
    expect(html).toContain('data-align="end"');
    expect(html).toContain('<small>%</small>');
  });
});

const events: TimelineItem[] = [
  { id: 'a', time: '09:14', dateTime: '2026-11-24T09:14', title: 'Opened', description: 'By Pip', tone: 'done' },
  { id: 'b', time: 'Later', title: 'Checks running', tone: 'working', current: true, trailing: <button type="button">Open log</button> },
  { id: 'c', title: 'Queued' },
];

describe('Timeline', () => {
  it('is an ordered list of rows and forwards the ref and native attributes', () => {
    const ref = createRef<HTMLOListElement>();
    render(<Timeline ref={ref} items={events} aria-label="History" id="history" className="mine" />);
    const list = screen.getByRole('list', { name: 'History' });
    expect(list).toBe(ref.current);
    expect(list.tagName).toBe('OL');
    expect(list).toHaveClass('kraft-timeline', 'mine');
    expect(list).toHaveAttribute('id', 'history');
    expect(list).toHaveAttribute('data-orientation', 'vertical');
    expect(list).toHaveAttribute('data-has-time', 'true');
    expect(list.parentElement).not.toHaveClass('kraft-timeline-lane');
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
  });

  it('uses a native time only with a machine-readable value, and marks the current row', () => {
    render(<Timeline items={events} />);
    const [first, second, third] = screen.getAllByRole('listitem');
    expect(first.querySelector('time')).toHaveAttribute('datetime', '2026-11-24T09:14');
    expect(first).toHaveAttribute('data-tone', 'done');
    expect(first).toHaveTextContent('09:14OpenedBy Pip');
    expect(first).not.toHaveAttribute('aria-current');
    expect(second.querySelector('time')).toBeNull();
    expect(second.querySelector('.kraft-timeline-time')).toHaveTextContent('Later');
    expect(second).toHaveAttribute('aria-current', 'time');
    expect(within(second).getByRole('button', { name: 'Open log' })).toBeInTheDocument();
    expect(third.querySelector('.kraft-timeline-time')).toBeNull();
    expect(third).not.toHaveAttribute('data-tone');
    for (const marker of document.querySelectorAll('.kraft-timeline-marker')) expect(marker).toHaveAttribute('aria-hidden', 'true');
  });

  it('drops the time column when no row has a time', () => {
    render(<Timeline items={[{ id: 'a', title: 'One' }, { id: 'b', title: 'Two' }]} />);
    expect(screen.getByRole('list')).not.toHaveAttribute('data-has-time');
  });

  it('wraps the horizontal lane in a scroll region that is unnamed until it overflows', () => {
    const ref = createRef<HTMLOListElement>();
    render(<Timeline ref={ref} items={events} orientation="horizontal" scrollLabel="This week" />);
    const list = screen.getByRole('list');
    expect(list).toBe(ref.current);
    expect(list).toHaveAttribute('data-orientation', 'horizontal');
    expect(list.parentElement).toHaveClass('kraft-timeline-lane');
    expect(list.parentElement).not.toHaveAttribute('tabindex');
    expect(screen.queryByRole('region')).toBeNull();
  });

  it('renders both orientations on the server', () => {
    expect(renderToString(<Timeline items={events} />)).toContain('aria-current="time"');
    expect(renderToString(<Timeline items={events} orientation="horizontal" />)).toContain('kraft-timeline-lane');
  });
});

const steps: StepperStep[] = [
  { id: 'plan', label: 'Plan', description: 'Scope agreed', status: 'done', trailing: '2m' },
  { id: 'build', label: 'Build', status: 'current' },
  { id: 'test', label: 'Test', status: 'blocked' },
  { id: 'ship', label: 'Ship', description: 'Publish' },
];

describe('Stepper', () => {
  it('is an ordered list that says each state in words and forwards the ref and native attributes', () => {
    const ref = createRef<HTMLOListElement>();
    render(<Stepper ref={ref} steps={steps} aria-label="Release" id="release" className="mine" />);
    const list = screen.getByRole('list', { name: 'Release' });
    expect(list).toBe(ref.current);
    expect(list.tagName).toBe('OL');
    expect(list).toHaveClass('kraft-stepper', 'mine');
    expect(list).toHaveAttribute('id', 'release');
    expect(list).toHaveAttribute('data-variant', 'pipeline');
    const items = within(list).getAllByRole('listitem');
    expect(items.map(item => item.textContent)).toEqual(['Plan, DoneScope agreed2m', 'Build, Current', 'Test, Blocked', 'Ship, UpcomingPublish']);
    expect(items.map(item => item.getAttribute('data-status'))).toEqual(['done', 'current', 'blocked', 'upcoming']);
    expect(items.map(item => item.getAttribute('aria-current'))).toEqual([null, 'step', null, null]);
    expect(list.querySelector('button, a, [tabindex]')).toBeNull();
  });

  it('draws a different decorative mark for each state', () => {
    render(<Stepper steps={steps} />);
    const marks = [...document.querySelectorAll('.kraft-stepper-mark')];
    for (const mark of marks) {
      expect(mark).toHaveAttribute('aria-hidden', 'true');
      expect(mark).toHaveAttribute('focusable', 'false');
    }
    const shapes = marks.map(mark => [...mark.children].map(child => `${child.tagName}.${child.getAttribute('class')}`).join(' '));
    expect(new Set(shapes).size).toBe(4);
    expect(shapes[2]).toContain('rect');
  });

  it('renames the state words', () => {
    render(<Stepper steps={steps} statusLabels={{ blocked: 'Failed', upcoming: 'Not started' }} />);
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Plan, Done');
    expect(items[2]).toHaveTextContent('Test, Failed');
    expect(items[3]).toHaveTextContent('Ship, Not started');
  });

  it('prints only the current label on the track and keeps the others for assistive technology', () => {
    render(<Stepper steps={steps} variant="track" />);
    const items = screen.getAllByRole('listitem');
    expect(items.map(item => item.textContent)).toEqual(['Plan, Done', 'Build, Current', 'Test, Blocked', 'Ship, Upcoming']);
    expect(items.map(item => item.querySelector('.kraft-stepper-text')!.classList.contains('kraft-visually-hidden'))).toEqual([true, false, true, true]);
    expect(document.querySelector('.kraft-stepper-description, .kraft-stepper-trailing')).toBeNull();
  });

  it('renders on the server', () => {
    const html = renderToString(<Stepper steps={steps} variant="track" />);
    expect(html).toContain('data-variant="track"');
    expect(html).toContain('aria-current="step"');
  });
});
