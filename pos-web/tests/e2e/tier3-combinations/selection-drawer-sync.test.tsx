import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderLoggedInApp } from '../test-utils';

describe('Tier 3 - Cross-Feature: Team Action & Live State Synchronization', () => {
  it('updates card visual state live from "이동 중" to "호출됨" upon calling a registered team', async () => {
    await renderLoggedInApp();

    // Baseline: Ticket 13 is moving ("이동 중")
    expect(screen.getByText('13')).toBeDefined();
    expect(screen.getAllByText('이동 중').length).toBeGreaterThan(0);

    // Call the moving team (ticket 13)
    const callBtns = screen.getAllByRole('button', { name: /^호출$/i });
    fireEvent.click(callBtns[0]);

    // Status becomes CALLED with amber highlight
    expect(screen.getByText(/호출됨/)).toBeDefined();
    expect(screen.getByRole('button', { name: /재호출/i })).toBeDefined();
  });

  it('synchronizes queue position recalculation across all remaining teams after seating head of queue', async () => {
    await renderLoggedInApp();

    // Ticket 12 is at position 1 ("다음 입장")
    // Ticket 13 is at position 2 ("2번째")
    expect(screen.getByText('다음 입장')).toBeDefined();
    expect(screen.getByText('2번째')).toBeDefined();

    // Seat ticket 12
    const seatBtns = screen.getAllByRole('button', { name: /착석/i });
    fireEvent.click(seatBtns[0]);

    // Now ticket 13 advances to position 1 ("다음 입장")
    expect(screen.getByText('다음 입장')).toBeDefined();
    expect(screen.queryByText('12')).toBeNull();
  });

  it('synchronizes summary stats and queue board simultaneously upon no-show action', async () => {
    await renderLoggedInApp();

    // Baseline: 3 ahead
    expect(screen.getByText('3')).toBeDefined();
    expect(screen.getByText('3 건')).toBeDefined();

    // Click No-show on ticket 12
    const noShowBtns = screen.getAllByRole('button', { name: /노쇼/i });
    fireEvent.click(noShowBtns[0]);

    // Ahead count becomes 2, board displays 2 건
    expect(screen.getByText('2')).toBeDefined();
    expect(screen.getByText('2 건')).toBeDefined();
    expect(screen.queryByText('12')).toBeNull();
  });
});
