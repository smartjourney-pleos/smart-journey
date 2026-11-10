import { describe, it, expect } from 'vitest';
import { screen, render, fireEvent } from '@testing-library/react';
import { QueueBoard } from '../../../src/components/QueueBoard';
import { renderLoggedInApp, createMockItem } from '../test-utils';

describe('Tier 2 - Queue Boundaries & Stress', () => {
  it('handles empty queue (0 teams) gracefully with zeroed statistics', () => {
    render(
      <QueueBoard
        queue={[]}
        aheadTeams={0}
        estimatedWaitMin={0}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByText('현재 대기 중인 고객이 없습니다.')).toBeDefined();
    expect(screen.getByText('0 건')).toBeDefined();
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(2);
  });

  it('handles large queue load (25+ teams) without dropping elements', () => {
    const largeQueue = Array.from({ length: 25 }, (_, i) =>
      createMockItem({
        id: `large-${i + 1}`,
        ticketNo: 100 + i + 1,
        position: i + 1,
        channel: i % 2 === 0 ? 'VEHICLE' : 'WALK_IN',
      })
    );
    render(
      <QueueBoard
        queue={largeQueue}
        aheadTeams={25}
        estimatedWaitMin={125}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByText('25 건')).toBeDefined();
    expect(screen.getByText('101')).toBeDefined();
    expect(screen.getAllByText('125').length).toBeGreaterThanOrEqual(1);
  });

  it('renders exceptionally large ticket numbers (e.g. No. 9999) without truncation', () => {
    const item = createMockItem({ ticketNo: 9999 });
    render(
      <QueueBoard
        queue={[item]}
        aheadTeams={1}
        estimatedWaitMin={5}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByText('9999')).toBeDefined();
  });

  it('supports sequential seat removal until queue reaches zero', async () => {
    await renderLoggedInApp();
    // Initially 3 items
    expect(screen.getByText('3 건')).toBeDefined();

    // Seat all 3 items sequentially
    for (let i = 0; i < 3; i++) {
      const seatBtns = screen.getAllByRole('button', { name: /착석/i });
      fireEvent.click(seatBtns[0]);
    }

    // Now empty
    expect(screen.getByText('현재 대기 중인 고객이 없습니다.')).toBeDefined();
    expect(screen.getByText('0 건')).toBeDefined();
  });

  it('successfully re-populates queue from empty state when walk-in is added', async () => {
    await renderLoggedInApp();
    // Empty the queue
    for (let i = 0; i < 3; i++) {
      const seatBtns = screen.getAllByRole('button', { name: /착석/i });
      fireEvent.click(seatBtns[0]);
    }
    expect(screen.getByText('0 건')).toBeDefined();

    // Tap +1 walk-in
    fireEvent.click(screen.getByRole('button', { name: /현장 \+1팀/i }));

    // Should now contain 1 item and remove empty message
    expect(screen.queryByText('현재 대기 중인 고객이 없습니다.')).toBeNull();
    expect(screen.getByText('1 건')).toBeDefined();
  });
});
