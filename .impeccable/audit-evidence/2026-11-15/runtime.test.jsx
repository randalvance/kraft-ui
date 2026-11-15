import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { commands } from 'vitest/browser';
import { cleanup, render } from '@testing-library/react';
import { Button, IconButton, Link, ThemeProvider, Surface, Stack, Text, Sticker } from '../../../src/index.ts';
import '../../../src/styles.css';

beforeEach(async () => { await commands.auditMedia({ reducedMotion: 'no-preference', forcedColors: 'none' }); });
afterEach(cleanup);
const icon = <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>;
for (const theme of ['paper', 'night']) describe(theme, () => {
  it('verifies native keyboard order, activation, and focus-visible rings', async () => {
    let clicks=0;
    const view=render(<ThemeProvider theme={theme} style={{padding:16}}>
      <span tabIndex={0} data-testid="entry" />
      <Button disabled>Unavailable</Button><Button loading>Saving</Button>
      <Button onClick={()=>clicks++}>Keep</Button>
      <IconButton aria-label="Add note">{icon}</IconButton>
      <Link href="#notes">Notes</Link>
    </ThemeProvider>);
    view.getByTestId('entry').focus();
    const result=[];
    for (const name of ['Keep','Add note','Notes']) {
      await commands.auditKey('Tab');
      const el=document.activeElement, css=getComputedStyle(el);
      expect(el.getAttribute('aria-label')||el.textContent).toBe(name);
      expect(el.matches(':focus-visible')).toBe(true);
      expect(css.outlineStyle).toBe('solid');expect(css.outlineWidth).toBe('2px');expect(css.outlineOffset).toBe('5px');
      result.push({name,focusVisible:el.matches(':focus-visible'),outline:css.outline,offset:css.outlineOffset});
      await commands.auditScreenshot(theme+'-focus-'+name.replaceAll(' ','-'));
      if(name==='Keep') { await commands.auditKey('Enter');await commands.auditKey('Space');expect(clicks).toBe(2); }
    }
    await commands.auditRecord({theme,category:'keyboard',result,clicks});
  });
  it('preserves state with reduced motion and high-contrast preferences', async () => {
    const view=render(<ThemeProvider theme={theme}><Button aria-pressed="true">Pinned</Button></ThemeProvider>);
    const button=view.getByRole('button');
    await commands.auditMedia({reducedMotion:'reduce'});
    expect(matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(true);
    expect(getComputedStyle(button).transitionDuration).toBe('0s');
    expect(getComputedStyle(button).transform).toBe('matrix(1, 0, 0, 1, 2, 3)');
    await commands.auditMedia({forcedColors:'active'});
    const css=getComputedStyle(button);
    expect(css.borderTopStyle).toBe('solid');expect(css.boxShadow).toBe('none');
    await commands.auditRecord({theme,category:'preferences',transition:css.transitionDuration,transform:css.transform,forcedColors:matchMedia('(forced-colors: active)').matches,border:css.borderTopColor,color:css.color,background:css.backgroundColor});
  });
  it('fits narrow reflow and text-spacing overrides', async () => {
    const view=render(<ThemeProvider theme={theme} style={{width:280,padding:16}}>
      <Stack gap={24}><Surface padding={16}><Stack gap={16}><Text>A narrow sheet with enough room for reading, resizing, and space between words.</Text><Button>{'KeepThisLongUnbrokenIdea'.repeat(8)}</Button><Sticker>Keep</Sticker><IconButton size="sm" aria-label="Add note">{icon}</IconButton></Stack></Surface></Stack>
    </ThemeProvider>);
    const root=view.container.querySelector('.kraft-root');
    const stylesheet=document.createElement('style');stylesheet.textContent='.kraft-root * { line-height:1.5 !important; letter-spacing:.12em !important; word-spacing:.16em !important; } .kraft-root p { margin-block-end:2em !important; }';document.head.append(stylesheet);
    try {
      const measured=[...root.querySelectorAll('.kraft-button,.kraft-text,.kraft-sticker')].map(el=>({class:el.className,width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth}));
      for(const value of measured)expect(value.scrollWidth).toBeLessThanOrEqual(value.clientWidth+1);
      const small=view.getByRole('button',{name:'Add note'}).getBoundingClientRect();expect(small.width).toBe(28);expect(small.height).toBe(28);
      await commands.auditRecord({theme,category:'reflow',viewport:innerWidth,rootWidth:root.getBoundingClientRect().width,measured});
    } finally {stylesheet.remove();}
  });
});

it('measures host style isolation and nested themes', async () => {
 const foreign=document.createElement('div');foreign.style.display='flex';document.body.append(foreign);
 const before=getComputedStyle(foreign).alignItems;foreign.dataset.align='center';foreign.dataset.wrap='true';
 const after=getComputedStyle(foreign).alignItems;const wrap=getComputedStyle(foreign).flexWrap;foreign.remove();
 const view=render(<ThemeProvider theme="paper"><div data-testid="paper"><Button variant="blue">Paper</Button></div><ThemeProvider theme="night" texture={false} motion={false} tilt={false}><Button variant="blue">Night</Button><Sticker>Keep</Sticker></ThemeProvider></ThemeProvider>);
 const paper=view.getByRole('button',{name:'Paper'}),night=view.getByRole('button',{name:'Night'});
 expect(getComputedStyle(paper).backgroundColor).not.toBe(getComputedStyle(night).backgroundColor);
 expect(getComputedStyle(night).transitionDuration.split(',').every(value => value.trim() === '0s')).toBe(true);
 expect(getComputedStyle(view.getByText('Keep')).transform).toBe('none');
 await commands.auditRecord({category:'isolation',foreignAlignBefore:before,foreignAlignAfter:after,foreignWrap:wrap,paper:getComputedStyle(paper).color,night:getComputedStyle(night).color,nightTexture:getComputedStyle(night).getPropertyValue('--kraft-texture-paper')});
});
