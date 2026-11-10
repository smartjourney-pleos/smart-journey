import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderLoggedInApp } from '../test-utils';

describe('Tier 4 - Scenario 4: No-Show Timeout & Queue Eviction Workflow', () => {
  it('handles customer call timeout followed by intentional no-show eviction', async () => {
    await renderLoggedInApp();

    // Baseline: 3 teams ahead
    expect(screen.getByText('3 건')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();

    // 1. Call ticket 12
    const callBtns = screen.getAllByRole('button', { name: /^호출$/i });
    fireEvent.click(callBtns[0]);
    expect(screen.getByText(/호출됨/)).toBeDefined();

    // 2. Customer fails to show up after timeout. Store owner taps [노쇼]
    const noShowBtns = screen.getAllByRole('button', { name: /노쇼/i });
    fireEvent.click(noShowBtns[0]);

    // 3. Team 12 is evicted from active waiting board
    expect(screen.queryByText('12')).toBeNull();

    // 4. Remaining teams advance: Ticket 13 advances to position 1 ("다음 입장")
    expect(screen.getByText('다음 입장')).toBeDefined();
    expect(screen.getByText('13')).toBeDefined();

    // 5. Total ahead count drops to 2, wait time drops to 10 min
    expect(screen.getByText('2 건')).toBeDefined();
    expect(screen.getByText('10')).toBeDefined();
  });
});
