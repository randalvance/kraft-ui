import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import type { Tone } from './primitives.js';
import { ScrollRegion } from './scroll-region.js';
import type { StatusTone } from './status.js';

const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');
const present = (node: ReactNode) => node != null && typeof node !== 'boolean' && node !== '';

export type StatSize = 'sm' | 'md' | 'lg';

export type StatProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  /** The figure, such as `12` or `98%`. */
  value: ReactNode;
  /** The caption under the figure. */
  label: ReactNode;
  /** Inks the figure. The caption says what the figure means, so the tone is never the only signal. */
  tone?: Tone;
  /** Handwritten figure at 26, 38, or 52px. */
  size?: StatSize;
  align?: 'start' | 'center' | 'end';
};

/** A large handwritten figure over a small caption. */
export const Stat = forwardRef<HTMLDivElement, StatProps>(function Stat({
  value, label, tone = 'neutral', size = 'md', align = 'start', className, ...props
}, ref) {
  return <div {...props} ref={ref} className={cx('kraft-stat', className)} data-tone={tone} data-size={size} data-align={align}>
    <div className="kraft-stat-value">{value}</div>
    <div className="kraft-stat-label">{label}</div>
  </div>;
});

export type TimelineOrientation = 'vertical' | 'horizontal';

export type TimelineItem = {
  id: string;
  title: ReactNode;
  /** When it happened or is due, as shown. */
  time?: ReactNode;
  /** Machine-readable value for `time`. Renders a native `<time>`. */
  dateTime?: string;
  description?: ReactNode;
  /** Colours the marker. Say the state in the title as well. */
  tone?: StatusTone;
  /** Marks the row or slot that is happening now with `aria-current="time"`. */
  current?: boolean;
  /** Noninteractive or interactive content at the end of a history row, or under a schedule slot. */
  trailing?: ReactNode;
};

export type TimelineProps = Omit<ComponentPropsWithoutRef<'ol'>, 'children'> & {
  items: TimelineItem[];
  /** `vertical` is a ruled history. `horizontal` is a schedule lane that scrolls sideways when it overflows. */
  orientation?: TimelineOrientation;
  /** Names the schedule lane's scroll region when it overflows. */
  scrollLabel?: string;
};

/** An ordered list of dated events: ruled history rows, or a horizontal schedule lane. */
export const Timeline = forwardRef<HTMLOListElement, TimelineProps>(function Timeline({
  items, orientation = 'vertical', scrollLabel = 'Schedule', className, ...props
}, ref) {
  const list = <ol {...props} ref={ref} className={cx('kraft-timeline', className)} data-orientation={orientation}
    data-has-time={items.some(item => present(item.time)) || undefined}>
    {items.map(item => <li key={item.id} className="kraft-timeline-item" data-tone={item.tone}
      aria-current={item.current ? 'time' : undefined}>
      {present(item.time) && (item.dateTime
        ? <time className="kraft-timeline-time" dateTime={item.dateTime}>{item.time}</time>
        : <span className="kraft-timeline-time">{item.time}</span>)}
      <span className="kraft-timeline-marker" aria-hidden="true" />
      <div className="kraft-timeline-content">
        <div className="kraft-timeline-title">{item.title}</div>
        {present(item.description) && <div className="kraft-timeline-description">{item.description}</div>}
      </div>
      {present(item.trailing) && <div className="kraft-timeline-trailing">{item.trailing}</div>}
    </li>)}
  </ol>;
  return orientation === 'horizontal'
    ? <ScrollRegion className="kraft-timeline-lane" label={scrollLabel}>{list}</ScrollRegion>
    : list;
});

export type StepStatus = 'done' | 'current' | 'upcoming' | 'blocked';
export type StepperVariant = 'pipeline' | 'track';

export type StepperStep = {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  /** Defaults to `upcoming`. */
  status?: StepStatus;
  /** Content at the end of a pipeline row, such as a duration. */
  trailing?: ReactNode;
};

export type StepperProps = Omit<ComponentPropsWithoutRef<'ol'>, 'children'> & {
  steps: StepperStep[];
  /** `pipeline` stacks labelled steps on a thread. `track` is one compact row that prints only the current step's label. */
  variant?: StepperVariant;
  /** The words read after each label. Defaults to Done, Current, Upcoming, and Blocked. */
  statusLabels?: Partial<Record<StepStatus, string>>;
};

const defaultStatusLabels: Record<StepStatus, string> = { done: 'Done', current: 'Current', upcoming: 'Upcoming', blocked: 'Blocked' };

/* Each state has its own form: a ticked disc, a ring with a dot, a dashed ring, and a crossed square. */
function StepMark({ status }: { status: StepStatus }) {
  return <svg className="kraft-stepper-mark" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
    {status === 'blocked'
      ? <rect className="kraft-stepper-mark-face" x="2" y="2" width="16" height="16" rx="3" />
      : <circle className="kraft-stepper-mark-face" cx="10" cy="10" r="8" />}
    {status === 'done' && <path className="kraft-stepper-mark-glyph" d="m6.2 10.3 2.6 2.6 5-5.6" />}
    {status === 'current' && <circle className="kraft-stepper-mark-dot" cx="10" cy="10" r="3.5" />}
    {status === 'blocked' && <path className="kraft-stepper-mark-glyph" d="m7 7 6 6m0-6-6 6" />}
  </svg>;
}

/** Progress through an ordered set of steps: a vertical pipeline, or a compact step track. It is not interactive. */
export const Stepper = forwardRef<HTMLOListElement, StepperProps>(function Stepper({
  steps, variant = 'pipeline', statusLabels, className, ...props
}, ref) {
  const words = { ...defaultStatusLabels, ...statusLabels };
  return <ol {...props} ref={ref} className={cx('kraft-stepper', className)} data-variant={variant}>
    {steps.map(({ id, label, description, status = 'upcoming', trailing }) => {
      // The track prints only the current label; the others stay available to assistive technology.
      const quiet = variant === 'track' && status !== 'current';
      return <li key={id} className="kraft-stepper-step" data-status={status} aria-current={status === 'current' ? 'step' : undefined}>
        <StepMark status={status} />
        <div className={cx('kraft-stepper-text', quiet && 'kraft-visually-hidden')}>
          <span className="kraft-stepper-label">{label}</span>
          <span className="kraft-visually-hidden">, {words[status]}</span>
          {variant === 'pipeline' && present(description) && <div className="kraft-stepper-description">{description}</div>}
        </div>
        {variant === 'pipeline' && present(trailing) && <div className="kraft-stepper-trailing">{trailing}</div>}
      </li>;
    })}
  </ol>;
});
