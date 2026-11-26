---
"@randalvance/kraft-ui": minor
---

Add `Meter`, `SlotMeter`, `Gauge`, and `Sparkline` for showing how much of something is used. `Meter` draws a ruler from one `value` or from `segments` with `solid`, `hatched`, or `free` fills, with `ticks`, `tickLabels`, a `limit` mark, a spill past the limit, a legend, and a compact `variant="bar"`. `SlotMeter` draws one paper slot for each place under a `cap`, each in a status tone or empty. `Gauge` draws a half dial with a needle for a percentage, with an optional `limit` and three sizes. All three are one `role="meter"` with a value, a range, and a text alternative, named by `label` or `aria-labelledby`. `Sparkline` draws a small bar for each day of usage as one named image, with an optional `limit`. Adds the `MeterProps`, `MeterSegment`, `MeterFill`, `MeterVariant`, `MeterName`, `SlotMeterProps`, `SlotMeterSlot`, `SlotMeterSize`, `GaugeProps`, `GaugeSize`, `SparklineProps`, `SparklinePoint`, and `SparklineSize` types.
