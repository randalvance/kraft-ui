import { forwardRef, type ComponentPropsWithoutRef, type CSSProperties } from 'react';
import type { StatusTone } from './status.js';

const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const defaultFormat = (value: number) => String(Math.round(value * 100) / 100);
const vars = (style: CSSProperties | undefined, values: Record<string, string | number>) => ({ ...values, ...style }) as CSSProperties;

type MeterRootProps = Omit<ComponentPropsWithoutRef<'div'>,
  'children' | 'role' | 'aria-label' | 'aria-labelledby' | 'aria-valuenow' | 'aria-valuemin' | 'aria-valuemax' | 'aria-valuetext'>;

/** Every meter needs a name: a `label`, or the id of visible text through `aria-labelledby`. */
export type MeterName =
  | { label: string; 'aria-labelledby'?: never }
  | { 'aria-labelledby': string; label?: never };

export type MeterFill = 'solid' | 'hatched' | 'free';
export type MeterVariant = 'ruler' | 'bar';

export type MeterSegment = {
  id: string;
  /** What this part is, such as `Used`. It prints in the legend and is read in the text alternative. */
  label: string;
  value: number;
  /** `solid` and `hatched` count toward the value. `free` is outlined room that does not. */
  fill?: MeterFill;
  tone?: StatusTone;
};

export type MeterProps = MeterRootProps & MeterName & {
  /** A single amount. Use `segments` instead to split the amount into parts. */
  value?: number;
  /** Parts laid end to end from `min`. */
  segments?: readonly MeterSegment[];
  min?: number;
  max?: number;
  /** Draws a limit mark. Any amount past it is drawn as a spill and said in the text alternative. */
  limit?: number;
  /** The distance between ruler ticks, or the values to mark. */
  ticks?: number | readonly number[];
  /** Prints each tick's value under the ruler. */
  tickLabels?: boolean;
  /** Lists the segments under the ruler. Defaults to true when there are segments. */
  legend?: boolean;
  /** `ruler` draws ticks, tick labels, and a legend. `bar` is a thin strip with none of them. */
  variant?: MeterVariant;
  /** The tone of a single `value`. */
  tone?: StatusTone;
  /** Formats numbers in tick labels, the legend, and the default text alternative. */
  formatValue?: (value: number) => string;
  /** Replaces the default text alternative, such as `12 of 24 seats, 4 held`. */
  valueText?: string;
};

function tickValues(ticks: MeterProps['ticks'], min: number, max: number) {
  if (ticks == null) return [];
  if (typeof ticks !== 'number') return ticks.filter(tick => tick >= min && tick <= max);
  if (!(ticks > 0) || (max - min) / ticks > 200) return [];
  const count = Math.floor((max - min) / ticks + 1e-9);
  return Array.from({ length: count + 1 }, (_, index) => min + index * ticks);
}

/**
 * A ruler that shows how much of something is used. Its parts differ in fill as
 * well as colour, and the whole meter is one `role="meter"` with a text alternative.
 */
export const Meter = forwardRef<HTMLDivElement, MeterProps>(function Meter({
  label, value, segments, min = 0, max = 100, limit, ticks, tickLabels = false, legend, variant = 'ruler',
  tone = 'working', formatValue = defaultFormat, valueText, className, 'aria-labelledby': labelledBy, ...props
}, ref) {
  const span = max > min ? max - min : 1;
  const percent = (amount: number) => `${Math.round(clamp(amount / span, 0, 1) * 1e4) / 100}%`;
  const parts: readonly MeterSegment[] = segments ?? (value == null ? [] : [{ id: 'value', label: '', value, fill: 'solid', tone }]);

  let cursor = min, filledEnd = min, used = 0;
  const drawn = parts.map(part => {
    const amount = Math.max(0, part.value);
    const start = cursor;
    cursor += amount;
    const fill = part.fill ?? 'solid';
    if (fill !== 'free') { used += amount; filledEnd = cursor; }
    return { ...part, fill, tone: part.tone ?? 'working', start: clamp(start, min, max), end: clamp(cursor, min, max) };
  });
  const now = clamp(segments ? min + used : value ?? min, min, max);
  const over = limit != null && filledEnd > limit;
  const ruler = variant === 'ruler';
  const marks = ruler ? tickValues(ticks, min, max) : [];
  const showLegend = ruler && (legend ?? Boolean(segments?.length)) && drawn.length > 0;

  const spoken = valueText ?? [
    segments?.length
      ? `${drawn.map(part => `${part.label} ${formatValue(Math.max(0, part.value))}`).join(', ')}, of ${formatValue(max)}`
      : `${formatValue(value ?? min)} of ${formatValue(max)}`,
    over && `over the limit of ${formatValue(limit)}`,
  ].filter(Boolean).join(', ');

  return <div {...props} ref={ref} className={cx('kraft-meter', className)} role="meter"
    aria-label={label} aria-labelledby={labelledBy} aria-valuemin={min} aria-valuemax={max} aria-valuenow={now} aria-valuetext={spoken}
    data-variant={variant} data-over={over || undefined}>
    <span className="kraft-meter-ruler" aria-hidden="true">
      {marks.length > 0 && <span className="kraft-meter-ticks">
        {marks.map(mark => <span key={mark} className="kraft-meter-tick" style={vars(undefined, { '--kraft-meter-at': percent(mark - min) })} />)}
      </span>}
      <span className="kraft-meter-rail">
        <span className="kraft-meter-track">
          {drawn.map(part => part.end > part.start && <span key={part.id} className="kraft-meter-segment"
            data-fill={part.fill} data-tone={part.tone}
            style={vars(undefined, { '--kraft-meter-at': percent(part.start - min), '--kraft-meter-size': percent(part.end - part.start) })} />)}
          {over && Math.min(filledEnd, max) > limit && <span className="kraft-meter-spill"
            style={vars(undefined, { '--kraft-meter-at': percent(limit - min), '--kraft-meter-size': percent(Math.min(filledEnd, max) - limit) })} />}
        </span>
        {limit != null && limit >= min && limit <= max && <span className="kraft-meter-limit"
          style={vars(undefined, { '--kraft-meter-at': percent(limit - min) })} />}
      </span>
      {tickLabels && marks.length > 0 && <span className="kraft-meter-tick-labels">
        {marks.map(mark => <span key={mark} className="kraft-meter-tick-label"
          data-edge={mark === min ? 'start' : mark === max ? 'end' : undefined} style={vars(undefined, { '--kraft-meter-at': percent(mark - min) })}>{formatValue(mark)}</span>)}
      </span>}
    </span>
    {showLegend && <span className="kraft-meter-legend" aria-hidden="true">
      {drawn.map(part => <span key={part.id} className="kraft-meter-legend-item">
        <span className="kraft-meter-swatch kraft-meter-segment" data-fill={part.fill} data-tone={part.tone} />
        <span className="kraft-meter-legend-label">{part.label}</span>
        <span className="kraft-meter-legend-value">{formatValue(Math.max(0, part.value))}</span>
      </span>)}
    </span>}
  </div>;
});

export type SlotMeterSize = 'sm' | 'md';

export type SlotMeterSlot = {
  id?: string;
  tone: StatusTone;
};

export type SlotMeterProps = MeterRootProps & MeterName & {
  /** The number of places. One slot is drawn for each. */
  cap: number;
  /** The taken places, in order. Places after them are drawn empty; slots past the cap are not drawn. */
  slots: readonly (SlotMeterSlot | StatusTone)[];
  size?: SlotMeterSize;
  /** Names each tone in the default text alternative. */
  toneLabels?: Partial<Record<StatusTone, string>>;
  /** Replaces the default text alternative, such as `3 of 5 agents busy`. */
  valueText?: string;
};

const toneOrder: StatusTone[] = ['working', 'waiting', 'blocked', 'done', 'idle'];

/**
 * One paper slot for each place under a cap. Taken slots carry a status tone and
 * differ in form as well as colour; the rest are empty dashed outlines.
 */
export const SlotMeter = forwardRef<HTMLDivElement, SlotMeterProps>(function SlotMeter({
  label, cap, slots, size = 'md', toneLabels, valueText, className, 'aria-labelledby': labelledBy, ...props
}, ref) {
  const places = Math.max(0, Math.floor(cap));
  const taken = slots.slice(0, places).map(slot => typeof slot === 'string' ? { tone: slot } as SlotMeterSlot : slot);
  const counts = toneOrder.map(tone => ({ tone, count: taken.filter(slot => slot.tone === tone).length })).filter(entry => entry.count > 0);
  const spoken = valueText ?? [`${taken.length} of ${places}`,
    ...counts.map(entry => `${entry.count} ${toneLabels?.[entry.tone] ?? entry.tone}`)].join(', ');

  return <div {...props} ref={ref} className={cx('kraft-slot-meter', className)} role="meter"
    aria-label={label} aria-labelledby={labelledBy} aria-valuemin={0} aria-valuemax={places} aria-valuenow={taken.length} aria-valuetext={spoken}
    data-size={size}>
    {Array.from({ length: places }, (_, index) => {
      const slot = taken[index];
      return <span key={slot?.id ?? index} className="kraft-slot" aria-hidden="true" data-tone={slot?.tone} data-empty={slot ? undefined : true}>
        {slot && <svg className="kraft-slot-face" viewBox="0 0 10 14" focusable="false">
          <rect className="kraft-slot-fill" x=".75" y=".75" width="8.5" height="12.5" rx="1" />
          {slot.tone === 'waiting' && <path className="kraft-slot-glyph" d="M1 5 5 1M1 9.5 9 1.5M1 13 9 5M4.5 13 9 8.5" />}
          {slot.tone === 'blocked' && <path className="kraft-slot-glyph" d="M3 5 7 9M7 5 3 9" />}
          {slot.tone === 'done' && <path className="kraft-slot-glyph" d="M2.8 7.2 4.4 8.9 7.3 5.3" />}
        </svg>}
      </span>;
    })}
  </div>;
});

export type GaugeSize = 'sm' | 'md' | 'lg';

export type GaugeProps = MeterRootProps & MeterName & {
  value: number;
  min?: number;
  max?: number;
  /** Marks a limit on the dial. The arc past it is drawn as a danger zone, and a value past it is said in the text alternative. */
  limit?: number;
  tone?: StatusTone;
  size?: GaugeSize;
  /** Prints the figure under the needle. Defaults to true. */
  showValue?: boolean;
  /** Formats the printed figure and the default text alternative. Defaults to a whole percentage of the range. */
  formatValue?: (value: number) => string;
  /** Replaces the default text alternative. */
  valueText?: string;
};

const dial = 'M12 60A48 48 0 0 1 108 60';
const zone = 'M9.5 60A50.5 50.5 0 0 1 110.5 60';

/** A half dial with a needle for a percentage. It is one `role="meter"` and is not interactive. */
export const Gauge = forwardRef<HTMLDivElement, GaugeProps>(function Gauge({
  label, value, min = 0, max = 100, limit, tone = 'working', size = 'md', showValue = true, formatValue, valueText,
  className, style, 'aria-labelledby': labelledBy, ...props
}, ref) {
  const span = max > min ? max - min : 1;
  const now = clamp(value, min, max);
  const turn = (now - min) / span;
  const filled = Math.round(turn * 1e4) / 100;
  const format = formatValue ?? ((amount: number) => `${Math.round((clamp(amount, min, max) - min) / span * 100)}%`);
  const edge = limit == null ? undefined : Math.round(clamp((limit - min) / span, 0, 1) * 1e4) / 100;
  const over = limit != null && value > limit;
  const figure = format(value);
  const spoken = valueText ?? (over ? `${figure}, over the limit of ${format(limit)}` : figure);

  return <div {...props} ref={ref} className={cx('kraft-gauge', className)} role="meter"
    aria-label={label} aria-labelledby={labelledBy} aria-valuemin={min} aria-valuemax={max} aria-valuenow={now} aria-valuetext={spoken}
    data-tone={tone} data-size={size} data-over={over || undefined} style={vars(style, { '--kraft-gauge-turn': Math.round(turn * 1e4) / 1e4 })}>
    <svg className="kraft-gauge-dial" viewBox="0 0 120 68" aria-hidden="true" focusable="false">
      <path className="kraft-gauge-edge" d={dial} />
      <path className="kraft-gauge-track" d={dial} />
      {edge != null && edge < 100 && <path className="kraft-gauge-zone" d={zone} pathLength={100} strokeDasharray={`0 ${edge} ${100 - edge} 100`} />}
      {filled > 0 && <path className="kraft-gauge-fill" d={dial} pathLength={100} strokeDasharray={`${filled} 100`} />}
      {edge != null && over && filled > edge && <path className="kraft-gauge-spill" d={dial} pathLength={100}
        strokeDasharray={`0 ${edge} ${Math.round((filled - edge) * 100) / 100} 100`} />}
      <path className="kraft-gauge-base" d="M5 60.5H115" />
      {Array.from({ length: 11 }, (_, index) => <line key={index} className="kraft-gauge-tick" x1="26" x2={index % 5 ? 23 : 20} y1="60" y2="60"
        transform={`rotate(${index * 18} 60 60)`} />)}
      {edge != null && <g transform={`rotate(${edge * 1.8} 60 60)`}>
        <path className="kraft-gauge-limit-cut" d="M3 60H19" />
        <path className="kraft-gauge-limit" d="M3 60H19" />
      </g>}
      <g className="kraft-gauge-needle">
        <path className="kraft-gauge-needle-cut" d="M17 60 60 55.5 60 64.5Z" />
        <path className="kraft-gauge-needle-ink" d="M20 60 60 57.5 60 62.5Z" />
      </g>
      <circle className="kraft-gauge-hub" cx="60" cy="60" r="5.5" />
      <circle className="kraft-gauge-pin" cx="60" cy="60" r="1.75" />
    </svg>
    {showValue && <span className="kraft-gauge-value" aria-hidden="true">{figure}</span>}
  </div>;
});

export type SparklineSize = 'sm' | 'md';

export type SparklinePoint = {
  /** What the bar stands for, such as `Mon` or `24 Nov`. It is read in the text alternative. */
  label: string;
  value: number;
};

export type SparklineProps = Omit<ComponentPropsWithoutRef<'span'>, 'children' | 'role' | 'aria-label'> & {
  /** Names the series, such as `Messages per day`. */
  label: string;
  /** One bar for each point, oldest first. */
  data: readonly SparklinePoint[];
  /** The value of a full-height bar. Defaults to the largest value, or the limit if that is larger. */
  max?: number;
  /** Draws a dashed limit line. Bars past it are hatched in danger ink. */
  limit?: number;
  size?: SparklineSize;
  formatValue?: (value: number) => string;
  /** Replaces the default text alternative, which reads every point. */
  summary?: string;
};

/** A small bar for each day of usage. It is one named image whose text alternative reads every value. */
export const Sparkline = forwardRef<HTMLSpanElement, SparklineProps>(function Sparkline({
  label, data, max, limit, size = 'md', formatValue = defaultFormat, summary, className, ...props
}, ref) {
  const top = Math.max(max ?? Math.max(0, limit ?? 0, ...data.map(point => point.value)), Number.EPSILON);
  const height = (amount: number) => `${Math.round(clamp(amount / top, 0, 1) * 1e4) / 100}%`;
  const spoken = summary ?? [
    data.map(point => `${point.label} ${formatValue(point.value)}`).join(', '),
    limit != null && `limit ${formatValue(limit)}`,
  ].filter(Boolean).join(', ');

  return <span {...props} ref={ref} className={cx('kraft-sparkline', className)} role="img"
    aria-label={spoken ? `${label}: ${spoken}` : label} data-size={size}>
    {data.map((point, index) => <span key={index} className="kraft-sparkline-bar" aria-hidden="true"
      data-over={limit != null && point.value > limit ? true : undefined}
      style={vars(undefined, { '--kraft-sparkline-size': height(point.value) })} />)}
    {limit != null && limit <= top && <span className="kraft-sparkline-limit" aria-hidden="true"
      style={vars(undefined, { '--kraft-sparkline-size': height(limit) })} />}
  </span>;
});
