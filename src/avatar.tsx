import { forwardRef, useId, type ComponentPropsWithoutRef, type CSSProperties, type ReactNode } from 'react';
import type { Tone } from './primitives.js';

export type AvatarStatus = {
  tone: 'working' | 'waiting' | 'blocked' | 'done' | 'idle';
  /** Included in the portrait's accessible name, or the picker option's description. */
  label: string;
};

type AvatarContent =
  | { src: string; initial?: never; glyph?: never }
  | { src?: never; initial: string; glyph?: never }
  | { src?: never; initial?: never; glyph: ReactNode };

type AvatarAppearance = {
  /** Diameter in pixels, including the cut border. Defaults to 36. */
  size?: number;
  tone?: Tone;
  /** Rotation in degrees; follows the theme's tilt preference. Defaults to 0. */
  tilt?: number;
  status?: AvatarStatus;
};

export type AvatarProps = Omit<ComponentPropsWithoutRef<'span'>,
  'children' | 'role' | 'aria-label' | 'aria-labelledby' | 'aria-hidden'> & AvatarAppearance & AvatarContent & (
  | { decorative?: false; alt: string }
  | { decorative: true; alt?: never }
);

/** A named portrait, monogram, or glyph with a white sticker cut edge. */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar({
  src, initial, glyph, alt, decorative = false, size = 36, tone = 'neutral', tilt = 0,
  status, className, style, ...props
}, ref) {
  return <span {...props} ref={ref} className={className ? `kraft-avatar ${className}` : 'kraft-avatar'}
    role={decorative ? undefined : 'img'} aria-hidden={decorative || undefined}
    aria-label={decorative ? undefined : [alt, status?.label].filter(Boolean).join(', ')} data-tone={tone}
    style={{ '--kraft-avatar-size': `${size}px`, '--kraft-avatar-tilt': `${tilt}deg`, ...style } as CSSProperties}>
    <span className="kraft-avatar-face" aria-hidden="true">
      {src !== undefined ? <img src={src} alt="" draggable={false} />
        : <span className={initial !== undefined ? 'kraft-avatar-initial' : 'kraft-avatar-glyph'}>{initial ?? glyph}</span>}
    </span>
    {status && <span className="kraft-avatar-status" data-tone={status.tone} aria-hidden="true" />}
  </span>;
});

export type AvatarGroupProps = Omit<ComponentPropsWithoutRef<'ul'>, 'children'> & {
  label: string;
  avatars: readonly AvatarProps[];
  /** Maximum number of portraits before the overflow count. Defaults to 4. */
  max?: number;
  size?: number;
};

/** An overlapping native list; hidden portraits are represented by a count. */
export const AvatarGroup = forwardRef<HTMLUListElement, AvatarGroupProps>(function AvatarGroup({
  label, avatars, max = 4, size = 36, className, style, ...props
}, ref) {
  const limit = Number.isFinite(max) ? Math.max(0, Math.floor(max)) : avatars.length;
  const visible = avatars.slice(0, limit);
  const rest = avatars.length - visible.length;
  return <ul {...props} ref={ref} aria-label={label}
    className={className ? `kraft-avatar-group ${className}` : 'kraft-avatar-group'}
    style={{ '--kraft-avatar-size': `${size}px`, ...style } as CSSProperties}>
    {visible.map((avatar, index) => <li key={index}><Avatar {...avatar} size={size} /></li>)}
    {rest > 0 && <li><span className="kraft-avatar-more" role="img" aria-label={`${rest} more ${rest === 1 ? 'avatar' : 'avatars'}`}>+{rest}</span></li>}
  </ul>;
});

export type AvatarOption = AvatarContent & Pick<AvatarAppearance, 'tone' | 'tilt' | 'status'> & {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

export type AvatarPickerProps = Omit<ComponentPropsWithoutRef<'fieldset'>, 'children' | 'onChange'> & {
  label: string;
  name: string;
  options: readonly AvatarOption[];
  size?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, option: AvatarOption) => void;
  description?: string;
  hideLabel?: boolean;
  required?: boolean;
};

/** Native radios preserve arrow navigation, form submission, and form reset. */
export const AvatarPicker = forwardRef<HTMLFieldSetElement, AvatarPickerProps>(function AvatarPicker({
  label, name, options, size = 36, value, defaultValue, onValueChange, description,
  hideLabel = false, required, disabled, className, 'aria-describedby': describedBy, ...props
}, ref) {
  const id = useId();
  const controlled = value !== undefined;
  return <fieldset {...props} ref={ref} disabled={disabled}
    className={className ? `kraft-avatar-picker ${className}` : 'kraft-avatar-picker'}
    aria-describedby={[describedBy, description ? `${id}-description` : undefined].filter(Boolean).join(' ') || undefined}>
    <legend className={hideLabel ? 'kraft-visually-hidden' : 'kraft-avatar-picker-label'}>{label}</legend>
    {description && <p className="kraft-avatar-picker-description" id={`${id}-description`}>{description}</p>}
    <div className="kraft-avatar-options">
      {options.map((option, index) => {
        const { value: optionValue, label: optionLabel, description: optionDescription, disabled: optionDisabled, ...portrait } = option;
        const detail = [optionDescription, option.status?.label].filter(Boolean).join('. ');
        return <label key={optionValue} className="kraft-avatar-option">
          <input type="radio" name={name} value={optionValue} disabled={optionDisabled} required={required}
            checked={controlled ? value === optionValue : undefined}
            defaultChecked={!controlled ? defaultValue === optionValue : undefined}
            aria-labelledby={`${id}-option-${index}-label`}
            aria-describedby={detail ? `${id}-option-${index}-description` : undefined}
            onChange={() => onValueChange?.(optionValue, option)} />
          <Avatar {...portrait} size={size} decorative />
          <span className="kraft-visually-hidden" id={`${id}-option-${index}-label`}>{optionLabel}</span>
          {detail && <span className="kraft-visually-hidden" id={`${id}-option-${index}-description`}>{detail}</span>}
        </label>;
      })}
    </div>
  </fieldset>;
});
