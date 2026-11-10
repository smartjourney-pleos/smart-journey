import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderLoggedInApp } from '../test-utils';

describe('Tier 3 - Cross-Feature: Filter Channels & Walk-in Order Manipulation', () => {
  it('increments total count while keeping vehicle count constant when walk-in is added', async () => {
    await renderLoggedInApp();

    // Baseline: total 3, vehicle 2
    expect(screen.getByText('3')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();

    // Add 1 walk-in
    fireEvent.click(screen.getByRole('button', { name: /현장 \+1팀/i }));

    // Total becomes 4, vehicle remains 2
    expect(screen.getByText('4')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();
  });

  it('removes only walk-in orders when -1팀 is triggered, leaving all vehicle orders untouched', async () => {
    await renderLoggedInApp();

    // Add 2 walk-ins (now total 5: 2 vehicle + 3 walk-in)
    fireEvent.click(screen.getByRole('button', { name: /현장 \+1팀/i }));
    fireEvent.click(screen.getByRole('button', { name: /현장 \+1팀/i }));
    expect(screen.getByText('5')).toBeDefined();

    // Remove 1 walk-in
    fireEvent.click(screen.getByRole('button', { name: /현장 -1팀/i }));
    expect(screen.getByText('4')).toBeDefined();
    // Vehicle count remains 2
    expect(screen.getByText('2')).toBeDefined();
  });

  it('isolates vehicle orders after removing all walk-in orders from queue', async () => {
    await renderLoggedInApp();

    // Baseline has 1 walk-in (ticket 14). Remove it.
    fireEvent.click(screen.getByRole('button', { name: /현장 -1팀/i }));

    // Now 2 teams remain, both VEHICLE
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('2 건')).toBeDefined();
    expect(screen.queryByText(/일반 현장/)).toBeNull();
    expect(screen.getAllByText(/차량 인증/).length).toBe(2);
  });
});
