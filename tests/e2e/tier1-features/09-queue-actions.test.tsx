import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import { WaitingCard } from '../../../src/components/WaitingCard';
import { renderLoggedInApp, createMockItem } from '../test-utils';

describe('Tier 1 - Feature 09: Queue Card Action Workflow', () => {
  it('dispatches onCall handler with item ID when calling a team', () => {
    const onCall = vi.fn();
    const item = createMockItem({ id: 'team-xyz', status: 'REGISTERED' });
    render(
      <WaitingCard
        item={item}
        onCall={onCall}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /호출/i }));
    expect(onCall).toHaveBeenCalledWith('team-xyz');
  });

  it('dispatches onSeat handler with item ID when seating a team', () => {
    const onSeat = vi.fn();
    const item = createMockItem({ id: 'team-xyz', status: 'REGISTERED' });
    render(
      <WaitingCard
        item={item}
        onCall={() => {}}
        onSeat={onSeat}
        onNoShow={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /착석/i }));
    expect(onSeat).toHaveBeenCalledWith('team-xyz');
  });

  it('dispatches onNoShow handler with item ID when marking no-show', () => {
    const onNoShow = vi.fn();
    const item = createMockItem({ id: 'team-xyz', status: 'REGISTERED' });
    render(
      <WaitingCard
        item={item}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={onNoShow}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /노쇼/i }));
    expect(onNoShow).toHaveBeenCalledWith('team-xyz');
  });

  it('updates card badge to "호출됨" in live app when 호출 is clicked', async () => {
    await renderLoggedInApp();
    const callBtns = screen.getAllByRole('button', { name: /^호출$/i });
    expect(callBtns.length).toBeGreaterThan(0);
    
    // Tap call on first registered team
    fireEvent.click(callBtns[0]);
    
    // Should now display "호출됨" badge on the card
    expect(screen.getByText(/호출됨/)).toBeDefined();
    // And button text changes to "재호출"
    expect(screen.getByRole('button', { name: /재호출/i })).toBeDefined();
  });

  it('removes seated team from queue and decrements ahead count in live app', async () => {
    await renderLoggedInApp();
    expect(screen.getByText('12')).toBeDefined(); // ticket 12 exists
    
    const seatBtns = screen.getAllByRole('button', { name: /착석/i });
    fireEvent.click(seatBtns[0]);
    
    // Ticket 12 should be removed from board
    expect(screen.queryByText('12')).toBeNull();
    // Ahead count decrements to 2
    expect(screen.getByText('2')).toBeDefined();
  });
});
