import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import { WaitingCard } from '../../../src/components/WaitingCard';
import { renderLoggedInApp, createMockItem } from '../test-utils';

describe('Tier 2 - Action Debouncing & Multi-tap Integrity', () => {
  it('handles burst rapid clicks on Call button gracefully', () => {
    const onCall = vi.fn();
    const item = createMockItem({ id: 'burst-1' });
    render(
      <WaitingCard
        item={item}
        onCall={onCall}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    const callBtn = screen.getByRole('button', { name: /호출/i });
    for (let i = 0; i < 5; i++) {
      fireEvent.click(callBtn);
    }
    expect(onCall).toHaveBeenCalledTimes(5);
  });

  it('prevents double-seating by immediately removing card from board on first tap', async () => {
    await renderLoggedInApp();
    const seatBtns = screen.getAllByRole('button', { name: /착석/i });
    const firstSeatBtn = seatBtns[0];

    // Click seat
    fireEvent.click(firstSeatBtn);

    // The seated card is unmounted, so it cannot be double-tapped
    expect(screen.queryByText('12')).toBeNull();
  });

  it('maintains state consistency under rapid alternating walk-in addition and removal', async () => {
    await renderLoggedInApp();
    const addBtn = screen.getByRole('button', { name: /현장 \+1팀/i });
    const removeBtn = screen.getByRole('button', { name: /현장 -1팀/i });

    // Baseline: 3 teams
    expect(screen.getByText('3')).toBeDefined();

    // Alternate: +1, -1, +1, +1, -1, +1
    fireEvent.click(addBtn);    // 4
    fireEvent.click(removeBtn); // 3
    fireEvent.click(addBtn);    // 4
    fireEvent.click(addBtn);    // 5
    fireEvent.click(removeBtn); // 4
    fireEvent.click(addBtn);    // 5

    expect(screen.getByText('5')).toBeDefined();
    expect(screen.getByText('5 건')).toBeDefined();
  });

  it('produces idempotent baseline state when reset button is rapidly tapped multiple times', async () => {
    await renderLoggedInApp();
    const addBtn = screen.getByRole('button', { name: /현장 \+1팀/i });
    const resetBtn = screen.getByRole('button', { name: /시연 초기 상태로 리셋/i });

    fireEvent.click(addBtn);
    fireEvent.click(addBtn);
    expect(screen.getByText('5 건')).toBeDefined();

    // Spam reset 5 times
    for (let i = 0; i < 5; i++) {
      fireEvent.click(resetBtn);
    }

    expect(screen.getByText('3 건')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();
    expect(screen.getByText('15')).toBeDefined();
  });

  it('handles rapid arrival simulation toggles without corrupting queue size', async () => {
    await renderLoggedInApp();
    const simBtn = screen.getByRole('button', { name: /하차 확인 이벤트 발생/i });

    // Trigger arrival 3 times consecutively
    fireEvent.click(simBtn);
    fireEvent.click(simBtn);
    fireEvent.click(simBtn);

    // Total queue size remains 3
    expect(screen.getByText('3 건')).toBeDefined();
    expect(screen.getAllByText('현장 도착').length).toBe(2);
  });
});
