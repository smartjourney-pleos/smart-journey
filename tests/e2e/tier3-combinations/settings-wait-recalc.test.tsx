import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderLoggedInApp } from '../test-utils';

describe('Tier 3 - Cross-Feature: Settings Update & Live Wait Time Recalculation', () => {
  it('recalculates estimated wait time dynamically when minutesPerTeam is updated in settings', async () => {
    await renderLoggedInApp();

    // Baseline: 3 teams * 5 min = 15 min
    expect(screen.getByText('15')).toBeDefined();

    // Open settings modal
    fireEvent.click(screen.getByRole('button', { name: /설정/i }));
    expect(screen.getByText('매장 대기 시간 설정')).toBeDefined();

    // Change minutesPerTeam from 5 to 10
    const inputs = screen.getAllByRole('spinbutton');
    const minutesInput = inputs[0];
    fireEvent.change(minutesInput, { target: { value: '10' } });

    // Save
    fireEvent.click(screen.getByRole('button', { name: /설정 저장/i }));

    // Estimated wait time should now be 3 teams * 10 min = 30 min
    expect(screen.getByText('30')).toBeDefined();
  });

  it('overrides automatic calculation with fixed manual wait time when manual override is saved', async () => {
    await renderLoggedInApp();

    // Open settings modal
    fireEvent.click(screen.getByRole('button', { name: /설정/i }));

    // Check manual override checkbox
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // Save with default manual value (20 min)
    fireEvent.click(screen.getByRole('button', { name: /설정 저장/i }));

    // Estimated wait time should now be fixed at 20 min regardless of ahead count
    expect(screen.getByText('20')).toBeDefined();
  });

  it('keeps manual wait time invariant even when additional walk-in teams arrive', async () => {
    await renderLoggedInApp();

    // Enable manual override to 20 min
    fireEvent.click(screen.getByRole('button', { name: /설정/i }));
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /설정 저장/i }));
    expect(screen.getByText('20')).toBeDefined();

    // Add 2 walk-in teams (ahead count becomes 5)
    fireEvent.click(screen.getByRole('button', { name: /현장 \+1팀/i }));
    fireEvent.click(screen.getByRole('button', { name: /현장 \+1팀/i }));
    expect(screen.getByText('5')).toBeDefined();

    // Estimated wait time must remain fixed at manual 20 min
    expect(screen.getByText('20')).toBeDefined();
  });
});
