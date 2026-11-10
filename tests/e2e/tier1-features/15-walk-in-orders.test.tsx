import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderLoggedInApp } from '../test-utils';

describe('Tier 1 - Feature 15: Walk-in Order Manipulation', () => {
  it('adds a new walk-in card to the queue when +1팀 is clicked', async () => {
    await renderLoggedInApp();
    const initialItems = screen.getAllByText(/No\./i);
    const initialCount = initialItems.length;

    fireEvent.click(screen.getByRole('button', { name: /현장 \+1팀/i }));

    const afterItems = screen.getAllByText(/No\./i);
    expect(afterItems.length).toBe(initialCount + 1);
  });

  it('labels newly added walk-in card as "일반 현장"', async () => {
    await renderLoggedInApp();
    fireEvent.click(screen.getByRole('button', { name: /현장 \+1팀/i }));

    const generalBadges = screen.getAllByText(/일반 현장/i);
    expect(generalBadges.length).toBeGreaterThan(0);
  });

  it('increments total ahead teams summary stat on +1팀', async () => {
    await renderLoggedInApp();
    // Baseline is 3 ahead
    expect(screen.getByText('3')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /현장 \+1팀/i }));
    expect(screen.getByText('4')).toBeDefined();
  });

  it('removes the last added walk-in card on -1팀', async () => {
    await renderLoggedInApp();
    // Add 1
    fireEvent.click(screen.getByRole('button', { name: /현장 \+1팀/i }));
    expect(screen.getByText('4')).toBeDefined();

    // Remove 1
    fireEvent.click(screen.getByRole('button', { name: /현장 -1팀/i }));
    expect(screen.getByText('3')).toBeDefined();
  });

  it('does not decrement below 0 or remove vehicle teams on -1팀 when no walk-ins remain', async () => {
    await renderLoggedInApp();
    
    // Attempt multiple -1 clicks
    const minusBtn = screen.getByRole('button', { name: /현장 -1팀/i });
    fireEvent.click(minusBtn);
    fireEvent.click(minusBtn);
    fireEvent.click(minusBtn);

    // Initial mock has ticket 14 as WALK_IN, so ticket 14 gets removed.
    // Vehicle teams (ticket 12, ticket 13) must remain intact.
    expect(screen.getByText('12')).toBeDefined();
    expect(screen.getByText('13')).toBeDefined();
  });
});
