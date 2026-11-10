import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderLoggedInApp } from '../test-utils';

describe('Tier 1 - Feature 16: Golden Time Simulation Preset', () => {
  it('simulates 3-team surge when tapping +1 walk-in three times', async () => {
    await renderLoggedInApp();
    const addBtn = screen.getByRole('button', { name: /현장 \+1팀/i });

    // Baseline: 3 teams ahead
    expect(screen.getByText('3')).toBeDefined();

    fireEvent.click(addBtn);
    fireEvent.click(addBtn);
    fireEvent.click(addBtn);

    // Ahead count should now be 6
    expect(screen.getByText('6')).toBeDefined();
  });

  it('proportionally increases estimated wait minutes with each added team', async () => {
    await renderLoggedInApp();
    const addBtn = screen.getByRole('button', { name: /현장 \+1팀/i });

    // Baseline: 3 teams * 5 min = 15 min
    expect(screen.getByText('15')).toBeDefined();

    // Surge +3 teams -> 6 teams * 5 min = 30 min
    fireEvent.click(addBtn);
    fireEvent.click(addBtn);
    fireEvent.click(addBtn);

    expect(screen.getByText('30')).toBeDefined();
  });

  it('updates total queue card count on board during golden time surge', async () => {
    await renderLoggedInApp();
    const addBtn = screen.getByRole('button', { name: /현장 \+1팀/i });

    fireEvent.click(addBtn);
    fireEvent.click(addBtn);
    fireEvent.click(addBtn);

    expect(screen.getByText(/6 건/i)).toBeDefined();
  });

  it('generates unique sequential ticket numbers for newly surged teams', async () => {
    await renderLoggedInApp();
    const addBtn = screen.getByRole('button', { name: /현장 \+1팀/i });

    fireEvent.click(addBtn);
    fireEvent.click(addBtn);

    const ticketNumbers = screen.getAllByText(/\d+/).map((el) => el.textContent);
    // Highest tickets in baseline are 12, 13, 14 -> newly generated will be 15, 16
    expect(ticketNumbers).toContain('15');
    expect(ticketNumbers).toContain('16');
  });

  it('preserves vehicle remote waiting count constant while surging walk-in teams', async () => {
    await renderLoggedInApp();
    const addBtn = screen.getByRole('button', { name: /현장 \+1팀/i });

    // Initial vehicle count is 2 (tickets 12 and 14)
    expect(screen.getByText('2')).toBeDefined();

    fireEvent.click(addBtn);
    fireEvent.click(addBtn);
    fireEvent.click(addBtn);

    // Vehicle count should remain 2
    expect(screen.getByText('2')).toBeDefined();
  });
});
