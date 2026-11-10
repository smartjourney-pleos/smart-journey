import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderLoggedInApp } from '../test-utils';

describe('Tier 3 - Cross-Feature: Sensor Alighting Telemetry & Call Action Coupling', () => {
  it('transitions moving vehicle to arrived with confirmed alighting and enables immediate call', async () => {
    await renderLoggedInApp();

    // Baseline: ticket 13 is moving ("이동 중")
    expect(screen.getByText('13')).toBeDefined();

    // Trigger arrival simulation
    fireEvent.click(
      screen.getByRole('button', { name: /하차 확인 이벤트 발생/i })
    );

    // Ticket 13 is now arrived with confirmed alighting (2/2명 하차 완료)
    expect(screen.getByText(/2\/2명 하차 완료/i)).toBeDefined();

    // Call ticket 13
    const callBtns = screen.getAllByRole('button', { name: /^호출$/i });
    fireEvent.click(callBtns[0]);

    // Now called
    expect(screen.getByText(/호출됨/)).toBeDefined();
  });

  it('completes the full lifecycle: alighting -> call -> seat for an incoming vehicle team', async () => {
    await renderLoggedInApp();

    // 1. Trigger vehicle arrival
    fireEvent.click(
      screen.getByRole('button', { name: /하차 확인 이벤트 발생/i })
    );
    expect(screen.getByText(/4\/4명 하차 완료/i)).toBeDefined();

    // 2. Call the arrived vehicle (ticket 12 is at head)
    const callBtns = screen.getAllByRole('button', { name: /^호출$/i });
    fireEvent.click(callBtns[0]);
    expect(screen.getByText(/호출됨/)).toBeDefined();

    // 3. Seat the called customer
    const seatBtns = screen.getAllByRole('button', { name: /착석/i });
    fireEvent.click(seatBtns[0]);

    // Ticket 12 is removed from queue
    expect(screen.queryByText('12')).toBeNull();
    // Vehicle count drops from 2 to 1
    expect(screen.getByText('1')).toBeDefined();
  });

  it('preserves alighting telemetry verification across successive filter or walk-in actions', async () => {
    await renderLoggedInApp();

    // 1. Trigger arrival
    fireEvent.click(
      screen.getByRole('button', { name: /하차 확인 이벤트 발생/i })
    );
    expect(screen.getByText(/4\/4명 하차 완료/i)).toBeDefined();

    // 2. Add walk-in order
    fireEvent.click(screen.getByRole('button', { name: /현장 \+1팀/i }));

    // Arrived telemetry badge remains intact
    expect(screen.getByText(/4\/4명 하차 완료/i)).toBeDefined();
  });
});
