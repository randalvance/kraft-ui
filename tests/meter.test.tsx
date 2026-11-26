import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Gauge, Meter, SlotMeter, Sparkline, type MeterSegment } from '../src';

const seats: MeterSegment[] = [
  { id: 'used', label: 'Used', value: 12 },
  { id: 'held', label: 'Held', value: 4, fill: 'hatched', tone: 'waiting' },
  { id: 'free', label: 'Free', value: 8, fill: 'free', tone: 'idle' },
];
const at = (element: Element, name: string) => (element as HTMLElement).style.getPropertyValue(name);

describe('Meter', () => {
  it('is one named meter with a value, a range, and a text alternative, and forwards the ref and native attributes', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Meter ref={ref} label="Seats" segments={seats} max={24} id="seats" className="plan" data-app="billing" title="Seats in use" />);
    const meter = screen.getByRole('meter', { name: 'Seats' });
    expect(meter).toBe(ref.current);
    expect(meter.tagName).toBe('DIV');
    expect(meter).toHaveClass('kraft-meter', 'plan');
    expect(meter).toHaveAttribute('id', 'seats');
    expect(meter).toHaveAttribute('data-app', 'billing');
    expect(meter).toHaveAttribute('title', 'Seats in use');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '24');
    expect(meter).toHaveAttribute('aria-valuenow', '16');
    expect(meter).toHaveAttribute('aria-valuetext', 'Used 12, Held 4, Free 8, of 24');
    expect(meter).toHaveAttribute('data-variant', 'ruler');
    expect(meter).not.toHaveAttribute('tabindex');
    expect(meter).not.toHaveAttribute('data-over');
    for (const child of meter.children) expect(child).toHaveAttribute('aria-hidden', 'true');
  });

  it('lays segments end to end with their fill and tone and lists them in a legend', () => {
    const { container } = render(<Meter label="Seats" segments={seats} max={24} />);
    const segments = [...container.querySelectorAll('.kraft-meter-track .kraft-meter-segment')];
    expect(segments.map(segment => [segment.getAttribute('data-fill'), segment.getAttribute('data-tone'), at(segment, '--kraft-meter-at'), at(segment, '--kraft-meter-size')]))
      .toEqual([['solid', 'working', '0%', '50%'], ['hatched', 'waiting', '50%', '16.67%'], ['free', 'idle', '66.67%', '33.33%']]);
    const legend = [...container.querySelectorAll('.kraft-meter-legend-item')];
    expect(legend.map(item => item.textContent)).toEqual(['Used12', 'Held4', 'Free8']);
    expect(legend[1].querySelector('.kraft-meter-swatch')).toHaveAttribute('data-fill', 'hatched');

    const plain = render(<Meter label="Quiet seats" segments={seats} max={24} legend={false} />);
    expect(plain.container.querySelector('.kraft-meter-legend')).toBeNull();
  });

  it('draws a single value, clamps it to the range, and takes a custom text alternative', () => {
    const { container } = render(<>
      <Meter label="Storage" value={62} tone="done" />
      <Meter label="Battery" value={140} min={20} max={120} formatValue={value => `${value} mAh`} />
      <Meter label="Under" value={-5} valueText="Nothing stored" />
    </>);
    const [storage, battery, under] = screen.getAllByRole('meter');
    expect(storage).toHaveAttribute('aria-valuenow', '62');
    expect(storage).toHaveAttribute('aria-valuetext', '62 of 100');
    expect(storage.querySelector('.kraft-meter-segment')).toHaveAttribute('data-tone', 'done');
    expect(storage.querySelector('.kraft-meter-legend')).toBeNull();
    expect(battery).toHaveAttribute('aria-valuemin', '20');
    expect(battery).toHaveAttribute('aria-valuenow', '120');
    expect(battery).toHaveAttribute('aria-valuetext', '140 mAh of 120 mAh');
    expect(at(battery.querySelector('.kraft-meter-segment')!, '--kraft-meter-size')).toBe('100%');
    expect(under).toHaveAttribute('aria-valuenow', '0');
    expect(under).toHaveAttribute('aria-valuetext', 'Nothing stored');
    expect(under.querySelector('.kraft-meter-segment')).toBeNull();
    expect(container.querySelectorAll('.kraft-meter-tick')).toHaveLength(0);
  });

  it('marks ticks by interval or by value and prints their labels on request', () => {
    const { container } = render(<>
      <Meter label="By step" value={10} max={24} ticks={4} tickLabels />
      <Meter label="By value" value={10} ticks={[0, 25, 50, 250]} />
      <Meter label="Too many" value={10} max={1000} ticks={0.5} />
    </>);
    const [step, value, many] = container.querySelectorAll('.kraft-meter');
    expect([...step.querySelectorAll('.kraft-meter-tick')].map(tick => at(tick, '--kraft-meter-at'))).toEqual(['0%', '16.67%', '33.33%', '50%', '66.67%', '83.33%', '100%']);
    const labels = [...step.querySelectorAll('.kraft-meter-tick-label')];
    expect(labels.map(label => label.textContent)).toEqual(['0', '4', '8', '12', '16', '20', '24']);
    expect(labels.map(label => label.getAttribute('data-edge'))).toEqual(['start', null, null, null, null, null, 'end']);
    expect(value.querySelectorAll('.kraft-meter-tick')).toHaveLength(3);
    expect(value.querySelector('.kraft-meter-tick-label')).toBeNull();
    expect(many.querySelector('.kraft-meter-tick')).toBeNull();
  });

  it('draws a limit mark and a spill past it, and says so', () => {
    const { container } = render(<>
      <Meter label="Under" max={120} limit={100} segments={[{ id: 'sent', label: 'Sent', value: 64 }]} />
      <Meter label="Over" max={120} limit={100} segments={[
        { id: 'sent', label: 'Sent', value: 92 }, { id: 'queued', label: 'Queued', value: 20, fill: 'hatched' }, { id: 'free', label: 'Free', value: 8, fill: 'free' },
      ]} />
      <Meter label="Off the end" value={150} limit={100} />
    </>);
    const [under, over, end] = container.querySelectorAll('.kraft-meter');
    expect(at(under.querySelector('.kraft-meter-limit')!, '--kraft-meter-at')).toBe('83.33%');
    expect(under.querySelector('.kraft-meter-spill')).toBeNull();
    expect(under).toHaveAttribute('aria-valuetext', 'Sent 64, of 120');
    expect(over).toHaveAttribute('data-over', 'true');
    expect(over).toHaveAttribute('aria-valuenow', '112');
    expect(over).toHaveAttribute('aria-valuetext', 'Sent 92, Queued 20, Free 8, of 120, over the limit of 100');
    const spill = over.querySelector('.kraft-meter-spill')!;
    expect([at(spill, '--kraft-meter-at'), at(spill, '--kraft-meter-size')]).toEqual(['83.33%', '10%']);
    expect(end).toHaveAttribute('aria-valuenow', '100');
    expect(end).toHaveAttribute('aria-valuetext', '150 of 100, over the limit of 100');
    expect(end.querySelector('.kraft-meter-spill')).toBeNull();
  });

  it('keeps fills and the limit in the compact bar and drops ticks and the legend', () => {
    render(<Meter variant="bar" label="Seats" segments={seats} max={24} limit={20} ticks={4} tickLabels legend />);
    const bar = screen.getByRole('meter', { name: 'Seats' });
    expect(bar).toHaveAttribute('data-variant', 'bar');
    expect(bar.querySelectorAll('.kraft-meter-track .kraft-meter-segment')).toHaveLength(3);
    expect(bar.querySelector('.kraft-meter-limit')).not.toBeNull();
    expect(bar.querySelector('.kraft-meter-tick, .kraft-meter-tick-label, .kraft-meter-legend')).toBeNull();
  });

  it('takes its name from visible text and requires one kind of name', () => {
    render(<><span id="plan">Plan seats</span><Meter aria-labelledby="plan" value={3} max={5} /></>);
    expect(screen.getByRole('meter', { name: 'Plan seats' })).not.toHaveAttribute('aria-label');
    // @ts-expect-error A meter needs a name.
    const unnamed = <Meter value={3} />;
    // @ts-expect-error A meter takes one kind of name, not both.
    const both = <Meter label="Seats" aria-labelledby="plan" value={3} />;
    expect([unnamed, both]).toHaveLength(2);
  });

  it('renders on the server', () => {
    const doc = new DOMParser().parseFromString(renderToString(<Meter label="Seats" segments={seats} max={24} limit={14} ticks={12} tickLabels />), 'text/html');
    const meter = doc.body.firstElementChild!;
    expect(meter.getAttribute('role')).toBe('meter');
    expect(meter.getAttribute('aria-label')).toBe('Seats');
    expect(meter.getAttribute('aria-valuenow')).toBe('16');
    expect(meter.getAttribute('aria-valuetext')).toBe('Used 12, Held 4, Free 8, of 24, over the limit of 14');
    expect(meter.querySelectorAll('.kraft-meter-track .kraft-meter-segment')).toHaveLength(3);
    expect(meter.querySelector('.kraft-meter-spill')?.getAttribute('style')).toContain('--kraft-meter-at:58.33%');
    expect([...meter.querySelectorAll('.kraft-meter-tick-label')].map(label => label.textContent)).toEqual(['0', '12', '24']);
  });
});

describe('SlotMeter', () => {
  it('is one named meter that counts the taken places and forwards the ref and native attributes', () => {
    const ref = createRef<HTMLDivElement>();
    render(<SlotMeter ref={ref} label="Agents" cap={6} slots={['working', { id: 'b', tone: 'working' }, 'waiting', 'blocked']} id="agents" className="pool" data-app="desk" />);
    const meter = screen.getByRole('meter', { name: 'Agents' });
    expect(meter).toBe(ref.current);
    expect(meter.tagName).toBe('DIV');
    expect(meter).toHaveClass('kraft-slot-meter', 'pool');
    expect(meter).toHaveAttribute('id', 'agents');
    expect(meter).toHaveAttribute('data-app', 'desk');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '6');
    expect(meter).toHaveAttribute('aria-valuenow', '4');
    expect(meter).toHaveAttribute('aria-valuetext', '4 of 6, 2 working, 1 waiting, 1 blocked');
    expect(meter).toHaveAttribute('data-size', 'md');
    expect(meter).not.toHaveAttribute('tabindex');
    const slots = [...meter.querySelectorAll('.kraft-slot')];
    expect(slots.map(slot => slot.getAttribute('data-tone') ?? 'empty')).toEqual(['working', 'working', 'waiting', 'blocked', 'empty', 'empty']);
    for (const slot of slots) expect(slot).toHaveAttribute('aria-hidden', 'true');
    expect(slots[4]).toHaveAttribute('data-empty', 'true');
    expect(slots[4].querySelector('svg')).toBeNull();
    expect(slots[0].querySelector('svg')).toHaveAttribute('focusable', 'false');
  });

  it('gives each tone its own form', () => {
    const { container } = render(<SlotMeter label="Forms" cap={5} slots={['working', 'waiting', 'blocked', 'done', 'idle']} />);
    const glyphs = [...container.querySelectorAll('.kraft-slot')].map(slot => slot.querySelector('.kraft-slot-glyph')?.getAttribute('d') ?? null);
    expect(glyphs.filter(Boolean)).toHaveLength(3);
    expect(new Set(glyphs.filter(Boolean)).size).toBe(3);
    expect([glyphs[0], glyphs[4]]).toEqual([null, null]);
  });

  it('ignores slots past the cap, renames tones, and takes a custom text alternative', () => {
    render(<>
      <SlotMeter label="Full" cap={2} size="sm" slots={['done', 'idle', 'working']} toneLabels={{ done: 'finished', idle: 'parked' }} />
      <SlotMeter label="Empty" cap={3} slots={[]} />
      <SlotMeter label="Custom" cap={2.9} slots={['working']} valueText="1 of 2 agents busy" />
      <SlotMeter label="None" cap={-1} slots={['working']} />
    </>);
    const full = screen.getByRole('meter', { name: 'Full' });
    expect(full).toHaveAttribute('aria-valuenow', '2');
    expect(full).toHaveAttribute('aria-valuetext', '2 of 2, 1 finished, 1 parked');
    expect(full).toHaveAttribute('data-size', 'sm');
    expect(full.querySelectorAll('.kraft-slot')).toHaveLength(2);
    expect(screen.getByRole('meter', { name: 'Empty' })).toHaveAttribute('aria-valuetext', '0 of 3');
    const custom = screen.getByRole('meter', { name: 'Custom' });
    expect(custom).toHaveAttribute('aria-valuemax', '2');
    expect(custom).toHaveAttribute('aria-valuetext', '1 of 2 agents busy');
    expect(screen.getByRole('meter', { name: 'None' })).toHaveAttribute('aria-valuemax', '0');
  });

  it('takes its name from visible text and renders on the server', () => {
    const doc = new DOMParser().parseFromString(renderToString(<>
      <span id="pool">Runner pool</span><SlotMeter aria-labelledby="pool" cap={3} slots={['done']} />
    </>), 'text/html');
    const meter = doc.body.querySelector('[role="meter"]')!;
    expect(meter.getAttribute('aria-labelledby')).toBe('pool');
    expect(meter.getAttribute('aria-label')).toBeNull();
    expect(meter.getAttribute('aria-valuenow')).toBe('1');
    expect(meter.querySelectorAll('.kraft-slot')).toHaveLength(3);
    expect(meter.querySelector('.kraft-slot[data-tone="done"] .kraft-slot-glyph')).not.toBeNull();
    // @ts-expect-error A slot meter needs a name.
    expect(<SlotMeter cap={1} slots={[]} />).toBeTruthy();
  });
});

describe('Gauge', () => {
  it('is one named meter with a percentage and forwards the ref, style, and native attributes', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Gauge ref={ref} label="Disk used" value={62} id="disk" className="host" data-app="ops" style={{ margin: 4 }} />);
    const gauge = screen.getByRole('meter', { name: 'Disk used' });
    expect(gauge).toBe(ref.current);
    expect(gauge.tagName).toBe('DIV');
    expect(gauge).toHaveClass('kraft-gauge', 'host');
    expect(gauge).toHaveAttribute('id', 'disk');
    expect(gauge).toHaveAttribute('data-app', 'ops');
    expect(gauge).toHaveAttribute('aria-valuemin', '0');
    expect(gauge).toHaveAttribute('aria-valuemax', '100');
    expect(gauge).toHaveAttribute('aria-valuenow', '62');
    expect(gauge).toHaveAttribute('aria-valuetext', '62%');
    expect(gauge).toHaveAttribute('data-tone', 'working');
    expect(gauge).toHaveAttribute('data-size', 'md');
    expect(gauge).not.toHaveAttribute('tabindex');
    expect(gauge.style.margin).toBe('4px');
    expect(at(gauge, '--kraft-gauge-turn')).toBe('0.62');
    const dial = gauge.querySelector('svg')!;
    expect(dial).toHaveAttribute('aria-hidden', 'true');
    expect(dial).toHaveAttribute('focusable', 'false');
    expect(dial.querySelector('.kraft-gauge-fill')).toHaveAttribute('stroke-dasharray', '62 100');
    expect(dial.querySelectorAll('.kraft-gauge-tick')).toHaveLength(11);
    const figure = gauge.querySelector('.kraft-gauge-value')!;
    expect(figure).toHaveTextContent('62%');
    expect(figure).toHaveAttribute('aria-hidden', 'true');
  });

  it('clamps the needle to the range and follows a custom range and format', () => {
    render(<>
      <Gauge label="Low" value={-20} />
      <Gauge label="High" value={130} showValue={false} />
      <Gauge label="Speed" value={65} min={20} max={80} tone="done" size="lg" formatValue={value => `${value} km/h`} />
      <Gauge label="Custom" value={41.6} valueText="About two fifths" />
    </>);
    const low = screen.getByRole('meter', { name: 'Low' });
    expect(low).toHaveAttribute('aria-valuenow', '0');
    expect(at(low, '--kraft-gauge-turn')).toBe('0');
    expect(low.querySelector('.kraft-gauge-fill')).toBeNull();
    const high = screen.getByRole('meter', { name: 'High' });
    expect(high).toHaveAttribute('aria-valuenow', '100');
    expect(high).toHaveAttribute('aria-valuetext', '100%');
    expect(high.querySelector('.kraft-gauge-value')).toBeNull();
    const speed = screen.getByRole('meter', { name: 'Speed' });
    expect(speed).toHaveAttribute('aria-valuenow', '65');
    expect(speed).toHaveAttribute('aria-valuetext', '65 km/h');
    expect(speed).toHaveAttribute('data-size', 'lg');
    expect(at(speed, '--kraft-gauge-turn')).toBe('0.75');
    const custom = screen.getByRole('meter', { name: 'Custom' });
    expect(custom).toHaveAttribute('aria-valuetext', 'About two fifths');
    expect(custom.querySelector('.kraft-gauge-value')).toHaveTextContent('42%');
  });

  it('marks a limit, draws its zone, and says when the value is past it', () => {
    render(<><Gauge label="Under" value={54} limit={80} /><Gauge label="Over" value={93} limit={80} /></>);
    const under = screen.getByRole('meter', { name: 'Under' });
    expect(under).not.toHaveAttribute('data-over');
    expect(under).toHaveAttribute('aria-valuetext', '54%');
    expect(under.querySelector('.kraft-gauge-zone')).toHaveAttribute('stroke-dasharray', '0 80 20 100');
    expect(under.querySelector('.kraft-gauge-limit')!.parentElement).toHaveAttribute('transform', 'rotate(144 60 60)');
    expect(under.querySelector('.kraft-gauge-spill')).toBeNull();
    const over = screen.getByRole('meter', { name: 'Over' });
    expect(over).toHaveAttribute('data-over', 'true');
    expect(over).toHaveAttribute('aria-valuetext', '93%, over the limit of 80%');
    expect(over.querySelector('.kraft-gauge-spill')).toHaveAttribute('stroke-dasharray', '0 80 13 100');
  });

  it('takes its name from visible text and renders on the server', () => {
    const doc = new DOMParser().parseFromString(renderToString(<>
      <span id="load">Load</span><Gauge aria-labelledby="load" value={25} tone="waiting" size="sm" />
    </>), 'text/html');
    const gauge = doc.body.querySelector('[role="meter"]')!;
    expect(gauge.getAttribute('aria-labelledby')).toBe('load');
    expect(gauge.getAttribute('aria-valuenow')).toBe('25');
    expect(gauge.getAttribute('aria-valuetext')).toBe('25%');
    expect(gauge.getAttribute('style')).toContain('--kraft-gauge-turn:0.25');
    expect(gauge.querySelector('.kraft-gauge-needle')).not.toBeNull();
    expect(gauge.querySelector('.kraft-gauge-value')?.textContent).toBe('25%');
    // @ts-expect-error A gauge needs a name.
    expect(<Gauge value={1} />).toBeTruthy();
  });
});

describe('Sparkline', () => {
  const week = [3, 5, 9, 0].map((value, index) => ({ label: ['Mon', 'Tue', 'Wed', 'Thu'][index], value }));

  it('is one named image that reads every point and forwards the ref and native attributes', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Sparkline ref={ref} label="Messages per day" data={week} id="usage" className="row" data-app="billing" />);
    const chart = screen.getByRole('img', { name: 'Messages per day: Mon 3, Tue 5, Wed 9, Thu 0' });
    expect(chart).toBe(ref.current);
    expect(chart.tagName).toBe('SPAN');
    expect(chart).toHaveClass('kraft-sparkline', 'row');
    expect(chart).toHaveAttribute('id', 'usage');
    expect(chart).toHaveAttribute('data-app', 'billing');
    expect(chart).toHaveAttribute('data-size', 'md');
    expect(chart).not.toHaveAttribute('tabindex');
    const bars = [...chart.querySelectorAll('.kraft-sparkline-bar')];
    expect(bars.map(bar => at(bar, '--kraft-sparkline-size'))).toEqual(['33.33%', '55.56%', '100%', '0%']);
    for (const bar of bars) expect(bar).toHaveAttribute('aria-hidden', 'true');
    expect(chart.querySelector('.kraft-sparkline-limit')).toBeNull();
  });

  it('marks a limit and the bars past it, and scales to a fixed maximum', () => {
    const { container } = render(<>
      <Sparkline label="Limited" data={week} limit={6} formatValue={value => `${value}k`} />
      <Sparkline label="Fixed" data={week} max={18} size="sm" />
      <Sparkline label="Roomy" data={week} limit={12} />
    </>);
    const [limited, fixed, roomy] = container.querySelectorAll('.kraft-sparkline');
    expect(limited).toHaveAttribute('aria-label', 'Limited: Mon 3k, Tue 5k, Wed 9k, Thu 0k, limit 6k');
    expect([...limited.querySelectorAll('.kraft-sparkline-bar')].map(bar => bar.hasAttribute('data-over'))).toEqual([false, false, true, false]);
    expect(at(limited.querySelector('.kraft-sparkline-limit')!, '--kraft-sparkline-size')).toBe('66.67%');
    expect(fixed).toHaveAttribute('data-size', 'sm');
    expect(at(fixed.querySelectorAll('.kraft-sparkline-bar')[2], '--kraft-sparkline-size')).toBe('50%');
    expect(at(roomy.querySelectorAll('.kraft-sparkline-bar')[2], '--kraft-sparkline-size')).toBe('75%');
    expect(at(roomy.querySelector('.kraft-sparkline-limit')!, '--kraft-sparkline-size')).toBe('100%');
  });

  it('takes a summary for a long series and renders an empty series on the server', () => {
    render(<Sparkline label="November" data={week} summary="30 days, 150 in all" />);
    expect(screen.getByRole('img', { name: 'November: 30 days, 150 in all' })).toBeInTheDocument();
    const doc = new DOMParser().parseFromString(renderToString(<><Sparkline label="No usage yet" data={[]} /><Sparkline label="Week" data={week} /></>), 'text/html');
    const [empty, full] = doc.body.children;
    expect(empty.outerHTML).toBe('<span class="kraft-sparkline" role="img" aria-label="No usage yet" data-size="md"></span>');
    expect(full.getAttribute('aria-label')).toBe('Week: Mon 3, Tue 5, Wed 9, Thu 0');
    expect(full.querySelectorAll('.kraft-sparkline-bar')).toHaveLength(4);
  });
});
