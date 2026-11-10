import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderLoggedInApp } from '../test-utils';

describe('Tier 4 - Scenario 2: Remote Vehicle Delay While Walk-in Gets Seated First', () => {
  it('allows walk-in customer to be called and seated while remote vehicle remains active in queue', async () => {
    await renderLoggedInApp();

    // Baseline: Ticket 12 (Vehicle), Ticket 13 (Vehicle), Ticket 14 (Walk-in)
    expect(screen.getByText('12')).toBeDefined();
    expect(screen.getByText('13')).toBeDefined();
    expect(screen.getByText('14')).toBeDefined();

    // Walk-in customer (ticket 14) is ready at the restaurant door.
    // Store owner calls ticket 14
    const callBtns = screen.getAllByRole('button', { name: /^호출$/i });
    // Ticket 14 is the 3rd card
    fireEvent.click(callBtns[2]);

    // Ticket 14 status becomes CALLED
    expect(screen.getByText(/호출됨/)).toBeDefined();

    // Store owner seats the walk-in customer
    const seatBtns = screen.getAllByRole('button', { name: /착석/i });
    fireEvent.click(seatBtns[2]);

    // Walk-in customer ticket 14 is seated and removed from the active board
    expect(screen.queryByText('14')).toBeNull();

    // Crucial check: Remote vehicles (ticket 12, ticket 13) remain securely in queue
    expect(screen.getByText('12')).toBeDefined();
    expect(screen.getByText('13')).toBeDefined();

    // Summary statistics reflect 2 remaining teams, both remote vehicles
    expect(screen.getByText('2 건')).toBeDefined();
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('10')).toBeDefined(); // 2 teams * 5 min = 10 min
  });
});
