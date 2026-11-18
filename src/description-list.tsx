import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';

export type DescriptionListItem = {
  id: string;
  label: ReactNode;
  value: ReactNode;
  action?: ReactNode;
  wide?: boolean;
};

export type DescriptionListProps = Omit<ComponentPropsWithoutRef<'dl'>, 'children'> & {
  items: readonly DescriptionListItem[];
  columns?: 1 | 2;
  layout?: 'stacked' | 'inline';
};

/** A native description list with room for a control beside each value. */
export const DescriptionList = forwardRef<HTMLDListElement, DescriptionListProps>(function DescriptionList({
  items, columns = 1, layout = 'stacked', className, ...props
}, ref) {
  return <dl {...props} ref={ref} data-columns={columns} data-layout={layout}
    className={className ? `kraft-description-list ${className}` : 'kraft-description-list'}>
    {items.map(item => <div className="kraft-description-item" data-wide={item.wide || undefined} key={item.id}>
      <dt>{item.label}</dt>
      <dd>
        <div className="kraft-description-value">{item.value}</div>
        {item.action != null && <div className="kraft-description-action">{item.action}</div>}
      </dd>
    </div>)}
  </dl>;
});
