import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderLoggedInApp } from '../test-utils';

describe('Tier 4 - Scenario 5: Evaluator PT Live Demonstration Sequence', () => {
  it('faithfully reproduces the complete PT evaluation demo flow for contest judges', async () => {
    await renderLoggedInApp();

    // ========================================================
    // Step 1: Pristine Baseline State
    // ========================================================
    // Judge observes store dashboard: 3 teams ahead, 15 min wait, 2 vehicles
    expect(screen.getByText('하늘본가 숯불갈비 시흥본점')).toBeDefined();
    expect(screen.getByText('3 건')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();
    expect(screen.getByText('15')).toBeDefined();

    // ========================================================
    // Step 2: Golden Time Simulation
    // ========================================================
    // In PT presentation, judge taps [+1팀] three times to surge queue (+3 teams)
    const addWalkInBtn = screen.getByRole('button', { name: /현장 \+1팀/i });
    fireEvent.click(addWalkInBtn);
    fireEvent.click(addWalkInBtn);
    fireEvent.click(addWalkInBtn);

    // Queue expands to 6 teams, wait time surges to 30 min.
    // In vehicle navigation, this immediately triggers the Golden Time Prompt card.
    expect(screen.getByText('6 건')).toBeDefined();
    expect(screen.getByText('6')).toBeDefined();
    expect(screen.getByText('30')).toBeDefined();

    // ========================================================
    // Step 3: Vehicle Arrival & Passenger Sensor Telemetry
    // ========================================================
    // Vehicle arrives in parking lot and passengers alight.
    // Judge taps [하차 확인 이벤트 발생] in Demo Controller.
    const simulateArrivalBtn = screen.getByRole('button', {
      name: /하차 확인 이벤트 발생/i,
    });
    fireEvent.click(simulateArrivalBtn);

    // Vehicle cards update in real-time to "현장 도착" and "M/N명 하차 완료"
    expect(screen.getByText(/4\/4명 하차 완료/i)).toBeDefined();
    expect(screen.getByText(/2\/2명 하차 완료/i)).toBeDefined();

    // ========================================================
    // Step 4: 점주 Calls Arrived Vehicle Guest
    // ========================================================
    const callBtns = screen.getAllByRole('button', { name: /^호출$/i });
    fireEvent.click(callBtns[0]); // Call head vehicle team (ticket 12)

    // Card displays "호출됨" badge
    expect(screen.getByText(/호출됨/)).toBeDefined();

    // ========================================================
    // Step 5: Demo Reset
    // ========================================================
    // Before next judging round, judge taps [시연 초기 상태로 리셋]
    const resetBtn = screen.getByRole('button', {
      name: /시연 초기 상태로 리셋/i,
    });
    fireEvent.click(resetBtn);

    // Everything is cleanly restored to baseline!
    expect(screen.getByText('3 건')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();
    expect(screen.getByText('15')).toBeDefined();
    expect(screen.getByText('12')).toBeDefined();
    expect(screen.getByText('13')).toBeDefined();
    expect(screen.getByText('14')).toBeDefined();
  });
});
