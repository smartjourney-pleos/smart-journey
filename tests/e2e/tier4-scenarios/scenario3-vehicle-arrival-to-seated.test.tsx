import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderLoggedInApp } from '../test-utils';

describe('Tier 4 - Scenario 3: Vehicle Arrival, Passenger Alighting, Calling, and Seating Lifecycle', () => {
  it('executes complete end-to-end guest journey for vehicle remote reservation', async () => {
    await renderLoggedInApp();

    // Step 1: Vehicle guest (ticket 13) is moving with registered status
    expect(screen.getByText('13')).toBeDefined();
    expect(screen.getAllByText('이동 중').length).toBeGreaterThanOrEqual(1);

    // Step 2: Vehicle reaches store parking area and triggers arrival sensor
    const simulateArrivalBtn = screen.getByRole('button', {
      name: /하차 확인 이벤트 발생/i,
    });
    fireEvent.click(simulateArrivalBtn);

    // Step 3: Card transitions to "현장 도착" with confirmed alighting badge "2/2명 하차 완료" and ETA "도착 완료"
    expect(screen.getByText(/2\/2명 하차 완료/i)).toBeDefined();
    expect(screen.getAllByText('현장 도착').length).toBeGreaterThanOrEqual(1);

    // Step 4: 점주 notices green alighting badge and calls customer
    const callBtns = screen.getAllByRole('button', { name: /^호출$/i });
    fireEvent.click(callBtns[1]); // Call ticket 13

    // Step 5: Card displays "호출됨" badge and button changes to "재호출"
    expect(screen.getByText(/호출됨/)).toBeDefined();
    expect(screen.getByRole('button', { name: /재호출/i })).toBeDefined();

    // Step 6: Customer steps into restaurant; 점주 taps [착석]
    const seatBtns = screen.getAllByRole('button', { name: /착석/i });
    fireEvent.click(seatBtns[1]); // Seat ticket 13

    // Step 7: Ticket 13 is removed from queue and queue count decrements
    expect(screen.queryByText('13')).toBeNull();
    expect(screen.getByText('2 건')).toBeDefined();
  });
});
