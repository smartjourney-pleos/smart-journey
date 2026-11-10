import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderLoggedInApp } from '../test-utils';

describe('Tier 4 - Scenario 1: Real-World Lunch Rush Workload', () => {
  it('handles simulated lunch rush with 5 incoming vehicles and 3 walk-ins smoothly', async () => {
    await renderLoggedInApp();

    // 1. Initial baseline: 3 teams ahead, 15 min wait, 2 vehicles
    expect(screen.getByText('3')).toBeDefined();
    expect(screen.getByText('15')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();

    // 2. Lunch rush starts: 3 walk-ins arrive at counter
    const addWalkInBtn = screen.getByRole('button', { name: /현장 \+1팀/i });
    fireEvent.click(addWalkInBtn);
    fireEvent.click(addWalkInBtn);
    fireEvent.click(addWalkInBtn);

    // Ahead count is now 6, wait time is 30 min
    expect(screen.getByText('6')).toBeDefined();
    expect(screen.getByText('30')).toBeDefined();
    expect(screen.getByText('6 건')).toBeDefined();

    // 3. Store owner seats the first 2 ready customers
    const seatBtns = screen.getAllByRole('button', { name: /착석/i });
    fireEvent.click(seatBtns[0]); // Seat ticket 12
    
    const remainingSeatBtns = screen.getAllByRole('button', { name: /착석/i });
    fireEvent.click(remainingSeatBtns[0]); // Seat ticket 13

    // Ahead count drops to 4, wait time recalculates to 20 min
    expect(screen.getByText('4')).toBeDefined();
    expect(screen.getByText('20')).toBeDefined();
    expect(screen.getByText('4 건')).toBeDefined();

    // 4. More walk-in orders arrive during ongoing peak service
    fireEvent.click(addWalkInBtn);
    fireEvent.click(addWalkInBtn);

    // Ahead count increases to 6, wait time to 30 min
    expect(screen.getByText('6')).toBeDefined();
    expect(screen.getByText('30')).toBeDefined();
    expect(screen.getByText('6 건')).toBeDefined();
  });
});
