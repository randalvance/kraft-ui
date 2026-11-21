import { useEffect, useRef, useState, type ReactNode } from 'react';

type ScrollRegionProps = {
  className: string;
  id?: string;
  label?: string;
  labelledBy?: string;
  children: ReactNode;
};

/** Gives overflowing content a named keyboard stop, including regions with no controls. */
export function ScrollRegion({ className, id, label, labelledBy, children }: ScrollRegionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);

  useEffect(() => {
    const region = ref.current;
    if (!region) return;

    const update = () => setScrollable(region.scrollWidth > region.clientWidth || region.scrollHeight > region.clientHeight);
    const resize = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(update);
    const observeContent = () => {
      resize?.disconnect();
      resize?.observe(region);
      for (const child of region.children) resize?.observe(child);
      update();
    };
    const mutation = new MutationObserver(observeContent);
    mutation.observe(region, { childList: true, subtree: true, characterData: true });
    observeContent();
    return () => {
      mutation.disconnect();
      resize?.disconnect();
    };
  }, []);

  return <div ref={ref} id={id} className={className} tabIndex={scrollable ? 0 : undefined}
    role={scrollable ? 'region' : undefined}
    aria-label={scrollable ? label : undefined} aria-labelledby={scrollable ? labelledBy : undefined}>
    {children}
  </div>;
}
