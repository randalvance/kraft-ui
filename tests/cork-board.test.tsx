import { createRef } from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { CorkBoard, CorkBoardColumn, CorkBoardItem, Pin, StickyNote } from '../src';

describe('Pin', () => {
  it('is a decorative span outside the accessibility tree by default', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Pin ref={ref} data-testid="pin" className="mine" tone="blue" />);
    const pin = screen.getByTestId('pin');
    expect(pin).toBe(ref.current);
    expect(pin.tagName).toBe('SPAN');
    expect(pin).toHaveClass('kraft-pin', 'mine');
    expect(pin).toHaveAttribute('data-tone', 'blue');
    expect(pin).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('exposes a labelled span as an image', () => {
    render(<Pin label="Pinned" />);
    expect(screen.getByRole('img', { name: 'Pinned' })).toHaveAttribute('data-tone', 'red');
  });

  it('is a named native button that does not submit forms and can be disabled', () => {
    const ref = createRef<HTMLButtonElement>();
    const submit = vi.fn(event => event.preventDefault());
    const unpin = vi.fn();
    const { rerender } = render(<form onSubmit={submit}>
      <Pin as="button" ref={ref} label="Unpin the poster proof" onClick={unpin} />
    </form>);
    const button = screen.getByRole('button', { name: 'Unpin the poster proof' });
    expect(button).toBe(ref.current);
    expect(button).toHaveAttribute('type', 'button');
    expect(button).not.toHaveAttribute('aria-hidden');
    fireEvent.click(button);
    expect(unpin).toHaveBeenCalledTimes(1);
    expect(submit).not.toHaveBeenCalled();

    rerender(<form onSubmit={submit}>
      <Pin as="button" ref={ref} label="Unpin the poster proof" onClick={unpin} disabled />
    </form>);
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(unpin).toHaveBeenCalledTimes(1);
  });
});

describe('CorkBoard', () => {
  it('wraps a scrolling body in a frame that takes native props and the ref', () => {
    const ref = createRef<HTMLElement>();
    render(<CorkBoard ref={ref} id="ideas" className="wall" aria-label="Ideas" role="group"
      maxHeight={320} minItemWidth={180}>
      <StickyNote>Order paper</StickyNote>
    </CorkBoard>);
    const board = screen.getByRole('group', { name: 'Ideas' });
    expect(board).toBe(ref.current);
    expect(board.tagName).toBe('DIV');
    expect(board).toHaveAttribute('id', 'ideas');
    expect(board).toHaveClass('kraft-cork-board', 'wall');
    expect(board).toHaveAttribute('data-layout', 'grid');
    const body = board.querySelector<HTMLElement>(':scope > .kraft-cork-board-body')!;
    expect(body).toContainElement(screen.getByRole('article'));
    expect(body).toHaveStyle({ maxBlockSize: '320px' });
    expect(body.style.getPropertyValue('--kraft-cork-board-item-width')).toBe('180px');
    expect(body).not.toHaveAttribute('tabindex');
    expect(body).not.toHaveAttribute('role');
  });

  it('renders a labelled section with a fixed-height free layout', () => {
    render(<CorkBoard as="section" aria-label="Wall" layout="free" height="24rem" />);
    const board = screen.getByRole('region', { name: 'Wall' });
    expect(board.tagName).toBe('SECTION');
    expect(board).toHaveAttribute('data-layout', 'free');
    expect(board.querySelector<HTMLElement>('.kraft-cork-board-body')!.style.blockSize).toBe('24rem');
  });

  it('makes an overflowing body a named, focusable scroll region', () => {
    const height = vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(900);
    try {
      render(<CorkBoard scrollLabel="Ideas board"><StickyNote>Order paper</StickyNote></CorkBoard>);
      const body = screen.getByRole('region', { name: 'Ideas board' });
      expect(body).toHaveClass('kraft-cork-board-body');
      expect(body).toHaveAttribute('tabindex', '0');
    } finally {
      height.mockRestore();
    }
  });
});

describe('CorkBoardItem', () => {
  it('places an item by coordinates and z-order and forwards native props and the ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<CorkBoard layout="free">
      <CorkBoardItem ref={ref} data-testid="item" className="mine" x={40} y={120} z={3}
        pin={<Pin data-testid="pin" />}>
        <StickyNote>Order paper</StickyNote>
      </CorkBoardItem>
    </CorkBoard>);
    const item = screen.getByTestId('item');
    expect(item).toBe(ref.current);
    expect(item).toHaveClass('kraft-cork-board-item', 'mine');
    expect(item.style.getPropertyValue('--kraft-cork-board-item-x')).toBe('40px');
    expect(item.style.getPropertyValue('--kraft-cork-board-item-y')).toBe('120px');
    expect(item.style.getPropertyValue('--kraft-cork-board-item-z')).toBe('3');
    expect(item).toContainElement(screen.getByRole('article'));
    expect(item).toContainElement(screen.getByTestId('pin'));
    expect(item).not.toHaveAttribute('tabindex');
    expect(item).not.toHaveAttribute('role');
  });

  it('makes a movable item a named tab stop that moves with the arrow keys', () => {
    const move = vi.fn();
    render(<CorkBoard layout="free">
      <CorkBoardItem x={40} y={120} label="Order paper" onMove={move}>
        <StickyNote>Order paper</StickyNote>
      </CorkBoardItem>
    </CorkBoard>);
    const item = screen.getByRole('group', { name: 'Order paper' });
    expect(item).toHaveAttribute('tabindex', '0');
    expect(item).toHaveAttribute('aria-keyshortcuts', 'ArrowUp ArrowRight ArrowDown ArrowLeft');
    act(() => item.focus());
    expect(item).toHaveFocus();

    expect(fireEvent.keyDown(item, { key: 'ArrowRight' })).toBe(false);
    expect(move).toHaveBeenLastCalledWith({ x: 48, y: 120 });
    fireEvent.keyDown(item, { key: 'ArrowLeft' });
    expect(move).toHaveBeenLastCalledWith({ x: 32, y: 120 });
    fireEvent.keyDown(item, { key: 'ArrowUp' });
    expect(move).toHaveBeenLastCalledWith({ x: 40, y: 112 });
    fireEvent.keyDown(item, { key: 'ArrowDown', shiftKey: true });
    expect(move).toHaveBeenLastCalledWith({ x: 40, y: 160 });
    expect(move).toHaveBeenCalledTimes(4);

    expect(fireEvent.keyDown(item, { key: 'a' })).toBe(true);
    expect(move).toHaveBeenCalledTimes(4);
  });

  it('uses a custom step and keeps the item on the board', () => {
    const move = vi.fn();
    render(<CorkBoardItem x={5} y={0} step={20} label="Order paper" onMove={move} />);
    const item = screen.getByRole('group', { name: 'Order paper' });
    fireEvent.keyDown(item, { key: 'ArrowLeft' });
    expect(move).toHaveBeenLastCalledWith({ x: 0, y: 0 });
    fireEvent.keyDown(item, { key: 'ArrowUp' });
    expect(move).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(item, { key: 'ArrowDown' });
    expect(move).toHaveBeenLastCalledWith({ x: 5, y: 20 });
  });

  it('leaves arrow keys to nested controls and to handlers that prevent the default', () => {
    const move = vi.fn();
    const { rerender } = render(<CorkBoardItem x={8} y={8} label="Draft" onMove={move}>
      <textarea aria-label="Note text" />
    </CorkBoardItem>);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'ArrowRight' });
    expect(move).not.toHaveBeenCalled();

    rerender(<CorkBoardItem x={8} y={8} label="Draft" onMove={move} onKeyDown={event => event.preventDefault()} />);
    fireEvent.keyDown(screen.getByRole('group', { name: 'Draft' }), { key: 'ArrowRight' });
    expect(move).not.toHaveBeenCalled();
  });
});

describe('CorkBoardColumn', () => {
  it('names a region from its pinned heading and reads the count with its label', () => {
    const ref = createRef<HTMLElement>();
    render(<CorkBoard layout="columns">
      <CorkBoardColumn ref={ref} id="doing" className="mine" name="In progress" count={2} countLabel="2 notes">
        <StickyNote>Order paper</StickyNote>
      </CorkBoardColumn>
    </CorkBoard>);
    const column = screen.getByRole('region', { name: 'In progress' });
    expect(column).toBe(ref.current);
    expect(column.tagName).toBe('SECTION');
    expect(column).toHaveAttribute('id', 'doing');
    expect(column).toHaveClass('kraft-cork-board-column', 'mine');
    const header = column.querySelector<HTMLElement>(':scope > .kraft-cork-board-column-header')!;
    expect(header).toHaveAttribute('data-material', 'kraft');
    expect(within(header).getByRole('heading', { level: 2, name: 'In progress' })).toBeInTheDocument();
    expect(header.querySelector('.kraft-pin')).toHaveAttribute('aria-hidden', 'true');
    const count = header.querySelector<HTMLElement>('.kraft-cork-board-column-count')!;
    expect(count).toHaveTextContent('2');
    expect(within(count).getByText('2')).toHaveAttribute('aria-hidden', 'true');
    expect(within(count).getByText('2 notes')).toHaveClass('kraft-visually-hidden');
    expect(column.querySelector(':scope > .kraft-cork-board-column-items'))
      .toContainElement(screen.getByRole('article'));
  });

  it('supports another heading level, no count, and an explicit accessible name', () => {
    render(<CorkBoardColumn name="Done" headingLevel={3} aria-label="Finished work" />);
    const column = screen.getByRole('region', { name: 'Finished work' });
    expect(column).not.toHaveAttribute('aria-labelledby');
    expect(within(column).getByRole('heading', { level: 3, name: 'Done' })).toBeInTheDocument();
    expect(column.querySelector('.kraft-cork-board-column-count')).not.toBeInTheDocument();
  });

  it('shows a bare count to everyone when it has no label', () => {
    render(<CorkBoardColumn name="To do" count={0} />);
    expect(screen.getByText('0')).not.toHaveAttribute('aria-hidden');
  });
});

describe('cork board server rendering', () => {
  it('renders the frame, layouts, items, columns and pins', () => {
    const html = renderToString(<>
      <CorkBoard layout="free" height={300}>
        <CorkBoardItem x={12} y={24} z={2} label="Order paper" onMove={() => {}} pin={<Pin as="button" label="Unpin" />}>
          <StickyNote>Order paper</StickyNote>
        </CorkBoardItem>
      </CorkBoard>
      <CorkBoard layout="columns">
        <CorkBoardColumn name="To do" count={1}><Pin tone="green" /></CorkBoardColumn>
      </CorkBoard>
    </>);
    expect(html).toContain('<div class="kraft-cork-board" data-layout="free">');
    expect(html).toContain('class="kraft-cork-board-body" style="block-size:300px"');
    expect(html).toContain('--kraft-cork-board-item-x:12px;--kraft-cork-board-item-y:24px;--kraft-cork-board-item-z:2');
    expect(html).toContain('role="group" aria-label="Order paper"');
    expect(html).toContain('<button type="button" aria-label="Unpin" class="kraft-pin" data-tone="red">');
    expect(html).toContain('data-layout="columns"');
    expect(html).toContain('>To do</h2>');
    expect(html).toContain('aria-hidden="true" class="kraft-pin" data-tone="green"');
  });
});
