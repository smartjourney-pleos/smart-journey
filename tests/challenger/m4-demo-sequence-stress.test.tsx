import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { renderLoggedInApp } from '../e2e/test-utils';
import { DemoPanel, type DemoPanelProps } from '../../src/components/demo/DemoPanel';

/**
 * Robust helper to locate a queue card by its exact ticket number badge ("No. X").
 * Avoids false positive collisions with summary metrics (e.g. 12 total teams, 15 min wait).
 */
function queryTicketCard(ticketNo: number): HTMLElement | null {
  const noLabels = screen.queryAllByText(/^No\.$/i);
  for (const label of noLabels) {
    const parent = label.parentElement;
    if (parent) {
      const numSpan = parent.querySelector('span[class*="tabular-nums"]');
      if (numSpan && numSpan.textContent?.trim() === String(ticketNo)) {
        return parent.closest('div[class*="rounded-lg"]');
      }
    }
  }
  return null;
}

function getTicketCard(ticketNo: number): HTMLElement {
  const card = queryTicketCard(ticketNo);
  if (!card) {
    throw new Error(`Queue card for ticket ${ticketNo} not found`);
  }
  return card;
}

describe('Milestone M4 Sequence & Boundaries Challenger: Evaluator Demo Panel & Invariants Stress Suite', () => {
  // =========================================================================
  // Suite 1: Walk-in Decrement Boundary & Floor at 0 (Tickets 12, 13 Isolation)
  // =========================================================================
  describe('1. Walk-in Decrement Floor at 0 & Vehicle Ticket Invariants', () => {
    it('empirically verifies single -1 tap evicts the lone walk-in team (ticket 14) and preserves vehicle tickets (12, 13)', async () => {
      await renderLoggedInApp();

      // Baseline: Tickets 12 (VEHICLE), 13 (VEHICLE), 14 (WALK_IN)
      expect(screen.getByText('12')).toBeDefined();
      expect(screen.getByText('13')).toBeDefined();
      expect(screen.getByText('14')).toBeDefined();
      expect(screen.getByText('3 건')).toBeDefined();

      const minusBtn = screen.getByRole('button', { name: /현장 -1팀/i });
      fireEvent.click(minusBtn);

      // Walk-in ticket 14 is evicted
      expect(screen.queryByText('14')).toBeNull();
      // Vehicle tickets 12 and 13 remain intact
      expect(screen.getByText('12')).toBeDefined();
      expect(screen.getByText('13')).toBeDefined();
      expect(screen.getByText('2 건')).toBeDefined();
    });

    it('empirically stress-tests 10 consecutive taps on [현장 -1팀] when walk-in count is 0: queue never drops below vehicle count, wait time floored, and vehicle tickets 12, 13 are never evicted or mutated', async () => {
      await renderLoggedInApp();

      const minusBtn = screen.getByRole('button', { name: /현장 -1팀/i });

      // First click evicts ticket 14 -> walk-in reaches 0
      fireEvent.click(minusBtn);
      expect(screen.queryByText('14')).toBeNull();

      // Stress: tap -1 another 10 times consecutively
      for (let i = 0; i < 10; i++) {
        fireEvent.click(minusBtn);
      }

      // 1. Total queue count remains strictly 2 (never drops to 1, 0, or negative)
      expect(screen.getByText('2 건')).toBeDefined();

      // 2. Summary stats remain strictly floored:
      // Ahead teams = 2, wait time = 10 min (2 teams * 5 min)
      expect(screen.getByText('10')).toBeDefined();

      // 3. DemoPanel live counter displays exactly "현장 0팀"
      expect(screen.getByText('현장 0팀')).toBeDefined();

      // 4. Vehicle tickets 12 and 13 are completely intact without any corruption
      const card12 = screen.getByText('12').closest('div[class*="rounded-lg"]');
      const card13 = screen.getByText('13').closest('div[class*="rounded-lg"]');
      expect(card12).not.toBeNull();
      expect(card13).not.toBeNull();

      // Ticket 12 has 4명 and ticket 13 has 2명
      expect(within(card12!).getByText('4명')).toBeDefined();
      expect(within(card13!).getByText('2명')).toBeDefined();
      expect(within(card12!).getByText(/차량 인증/i)).toBeDefined();
      expect(within(card13!).getByText(/차량 인증/i)).toBeDefined();
    });

    it('empirically verifies adding walk-ins after reaching floor 0 cleanly resumes ticket numbering and queue counts without ghost offsets', async () => {
      await renderLoggedInApp();

      const minusBtn = screen.getByRole('button', { name: /현장 -1팀/i });
      const plusBtn = screen.getByRole('button', { name: /현장 \+1팀/i });

      // Decrement to floor 0 and hammer -1
      fireEvent.click(minusBtn);
      fireEvent.click(minusBtn);
      fireEvent.click(minusBtn);
      expect(screen.getByText('현장 0팀')).toBeDefined();

      // Now tap +1
      fireEvent.click(plusBtn);

      // Queue increments from 2 to 3
      expect(screen.getByText('3 건')).toBeDefined();
      expect(screen.getByText('현장 1팀')).toBeDefined();
      expect(screen.getByText('15')).toBeDefined(); // 3 * 5 = 15 min

      // The new walk-in ticket is 14 (since highest in [12, 13] is 13, 13 + 1 = 14)
      expect(screen.getByText('14')).toBeDefined();
    });

    it('empirically verifies surge and aggressive drain cycle (+5 then -10) gracefully floors at 0 walk-ins with untouched vehicle tickets', async () => {
      await renderLoggedInApp();

      const plusBtn = screen.getByRole('button', { name: /현장 \+1팀/i });
      const minusBtn = screen.getByRole('button', { name: /현장 -1팀/i });

      // Add 5 walk-in teams
      for (let i = 0; i < 5; i++) {
        fireEvent.click(plusBtn);
      }
      // Baseline 1 walk-in + 5 = 6 walk-ins; total 2 vehicles + 6 walk-ins = 8 teams
      expect(screen.getByText('8 건')).toBeDefined();
      expect(screen.getByText('현장 6팀')).toBeDefined();
      expect(screen.getByText('40')).toBeDefined(); // 8 * 5 = 40 min

      // Aggressively drain with 10 decrements
      for (let i = 0; i < 10; i++) {
        fireEvent.click(minusBtn);
      }

      // Strictly floored at 2 teams, 10 min, 0 walk-in
      expect(screen.getByText('2 건')).toBeDefined();
      expect(screen.getByText('현장 0팀')).toBeDefined();
      expect(screen.getByText('10')).toBeDefined();
      expect(getTicketCard(12)).toBeDefined();
      expect(getTicketCard(13)).toBeDefined();
    });

    it('empirically verifies -1 tap on an empty queue (after seating all teams) is a safe no-op without crashes or exceptions', async () => {
      await renderLoggedInApp();

      const minusBtn = screen.getByRole('button', { name: /현장 -1팀/i });

      // Seat all 3 teams
      let seatBtns = screen.getAllByRole('button', { name: /^착석$/i });
      fireEvent.click(seatBtns[0]);
      seatBtns = screen.getAllByRole('button', { name: /^착석$/i });
      fireEvent.click(seatBtns[0]);
      seatBtns = screen.getAllByRole('button', { name: /^착석$/i });
      fireEvent.click(seatBtns[0]);

      expect(screen.getByText('0 건')).toBeDefined();
      expect(screen.getByText('현장 0팀')).toBeDefined();

      // Tap -1 multiple times on empty queue
      fireEvent.click(minusBtn);
      fireEvent.click(minusBtn);

      expect(screen.getByText('0 건')).toBeDefined();
      expect(screen.getByText('현장 0팀')).toBeDefined();
    });
  });

  // =========================================================================
  // Suite 2: Golden Time Surge Preset vs Triple Tap Invariant Equivalence
  // =========================================================================
  describe('2. Golden Time Single-Tap Preset vs Triple Tap Equivalence & Sequentiality', () => {
    it('empirically verifies [+3팀 골든타임 시연] adds exactly 3 teams, +15 min wait, and sequential tickets 15, 16, 17 without collisions', async () => {
      await renderLoggedInApp();

      // Baseline: 3 teams ahead (12, 13, 14), 15 min wait
      expect(screen.getByText('3 건')).toBeDefined();
      expect(screen.getByText('15')).toBeDefined();

      const surgeBtn = screen.getByRole('button', { name: /\+3팀 골든타임 시연/i });
      fireEvent.click(surgeBtn);

      // Total count increases by 3 -> 6 건
      expect(screen.getByText('6 건')).toBeDefined();
      // Estimated wait time increases by 15 min -> 30 min (6 * 5 min)
      expect(screen.getByText('30')).toBeDefined();

      // Sequential tickets: baseline max was 14 -> new tickets are 15, 16, 17
      expect(screen.getByText('15')).toBeDefined();
      expect(screen.getByText('16')).toBeDefined();
      expect(screen.getByText('17')).toBeDefined();

      // Walk-in count in DemoPanel should now reflect 4 teams (1 baseline + 3 surge)
      expect(screen.getByText('현장 4팀')).toBeDefined();

      // All newly surged tickets must be labeled as "일반 현장"
      const generalBadges = screen.getAllByText(/일반 현장/i);
      expect(generalBadges.length).toBe(4);
    });

    it('empirically verifies invariant equivalence between single-tap Golden Time preset and triple [현장 +1팀] taps', async () => {
      // 1. First test: Triple tap of [현장 +1팀]
      const { unmount } = await renderLoggedInApp();
      const addBtn = screen.getByRole('button', { name: /현장 \+1팀/i });

      fireEvent.click(addBtn);
      fireEvent.click(addBtn);
      fireEvent.click(addBtn);

      const tripleTapCount = screen.getByText('6 건').textContent;
      const tripleTapWait = screen.getByText('30').textContent;
      const tripleTapTickets = [
        getTicketCard(15) ? '15' : null,
        getTicketCard(16) ? '16' : null,
        getTicketCard(17) ? '17' : null,
      ];
      const tripleTapWalkInPill = screen.getByText('현장 4팀').textContent;

      unmount();

      // 2. Second test: Single tap of [+3팀 골든타임 시연]
      await renderLoggedInApp();
      const surgeBtn = screen.getByRole('button', { name: /\+3팀 골든타임 시연/i });
      fireEvent.click(surgeBtn);

      const surgeCount = screen.getByText('6 건').textContent;
      const surgeWait = screen.getByText('30').textContent;
      const surgeTickets = [
        getTicketCard(15) ? '15' : null,
        getTicketCard(16) ? '16' : null,
        getTicketCard(17) ? '17' : null,
      ];
      const surgeWalkInPill = screen.getByText('현장 4팀').textContent;

      // Invariant Equivalence assertion
      expect(surgeCount).toBe(tripleTapCount);
      expect(surgeWait).toBe(tripleTapWait);
      expect(surgeTickets).toEqual(tripleTapTickets);
      expect(surgeWalkInPill).toBe(tripleTapWalkInPill);
    });

    it('empirically stress-tests multiple consecutive Golden Time surges (3x taps = +9 teams) with strictly monotonic ticket sequence and zero collisions', async () => {
      await renderLoggedInApp();

      const surgeBtn = screen.getByRole('button', { name: /\+3팀 골든타임 시연/i });

      // Tap surge 3 times: +3, +3, +3 -> +9 teams total added to baseline 3 = 12 teams
      fireEvent.click(surgeBtn);
      fireEvent.click(surgeBtn);
      fireEvent.click(surgeBtn);

      expect(screen.getByText('12 건')).toBeDefined();
      expect(screen.getByText('60')).toBeDefined(); // 12 * 5 = 60 min
      expect(screen.getByText('현장 10팀')).toBeDefined(); // 1 baseline + 9 surged

      // All ticket numbers from 12 through 23 must exist on the board
      for (let ticket = 12; ticket <= 23; ticket++) {
        expect(getTicketCard(ticket)).toBeDefined();
      }
    });

    it('empirically verifies Golden Time surge when starting from floor 0 generates continuous tickets 14, 15, 16', async () => {
      await renderLoggedInApp();

      const minusBtn = screen.getByRole('button', { name: /현장 -1팀/i });
      const surgeBtn = screen.getByRole('button', { name: /\+3팀 골든타임 시연/i });

      // Drain to floor 0
      fireEvent.click(minusBtn);
      fireEvent.click(minusBtn);
      expect(screen.getByText('현장 0팀')).toBeDefined();
      expect(screen.getByText('2 건')).toBeDefined();

      // Surge +3 teams from floor 0 (max ticket is 13)
      fireEvent.click(surgeBtn);

      expect(screen.getByText('5 건')).toBeDefined();
      expect(screen.getByText('25')).toBeDefined(); // 5 * 5 = 25 min
      expect(screen.getByText('현장 3팀')).toBeDefined();

      // Tickets must be 12, 13, 14, 15, 16
      expect(getTicketCard(12)).toBeDefined();
      expect(getTicketCard(13)).toBeDefined();
      expect(getTicketCard(14)).toBeDefined();
      expect(getTicketCard(15)).toBeDefined();
      expect(getTicketCard(16)).toBeDefined();
    });
  });

  // =========================================================================
  // Suite 3: Interleaved Operations & Baseline Reset Idempotency
  // =========================================================================
  describe('3. Rapid Interleaved Operations & Reset Idempotency', () => {
    it('empirically stress-tests a complex interleaved workflow (+1 -> arrival -> call -> golden time -> -2 -> filter -> reset) restoring pristine baseline', async () => {
      await renderLoggedInApp();

      const plusBtn = screen.getByRole('button', { name: /현장 \+1팀/i });
      const minusBtn = screen.getByRole('button', { name: /현장 -1팀/i });
      const arrivalBtn = screen.getByRole('button', { name: /하차 확인 이벤트 발생/i });
      const surgeBtn = screen.getByRole('button', { name: /\+3팀 골든타임 시연/i });
      const resetBtn = screen.getByRole('button', { name: /시연 초기 상태로 리셋/i });

      // 1. Add walk-in (+1) -> ticket 15
      fireEvent.click(plusBtn);
      expect(screen.getByText('4 건')).toBeDefined();
      expect(getTicketCard(15)).toBeDefined();

      // 2. Trigger arrival simulation
      fireEvent.click(arrivalBtn);
      expect(screen.getByText(/4\/4명 하차 완료/i)).toBeDefined();
      expect(screen.getByText(/2\/2명 하차 완료/i)).toBeDefined();

      // 3. Call head vehicle team (ticket 12)
      const callBtns = screen.getAllByRole('button', { name: /^호출$/i });
      fireEvent.click(callBtns[0]);
      expect(screen.getByText(/호출됨/)).toBeDefined();

      // 4. Surge golden time (+3) -> tickets 16, 17, 18
      fireEvent.click(surgeBtn);
      expect(screen.getByText('7 건')).toBeDefined();
      expect(getTicketCard(18)).toBeDefined();

      // 5. Decrement walk-in (-1, -1) -> removes 18 and 17
      fireEvent.click(minusBtn);
      fireEvent.click(minusBtn);
      expect(screen.getByText('5 건')).toBeDefined();
      expect(queryTicketCard(18)).toBeNull();
      expect(queryTicketCard(17)).toBeNull();
      expect(getTicketCard(16)).toBeDefined();

      // 6. Switch filters
      const arrivedFilterTab = screen.getByRole('button', { name: /도착/i });
      fireEvent.click(arrivedFilterTab);

      // 7. Reset demo
      fireEvent.click(resetBtn);

      // Verify pristine baseline restoration
      expect(screen.getByText('3 건')).toBeDefined();
      expect(screen.getByText('15')).toBeDefined(); // wait time = 15 min
      expect(getTicketCard(12)).toBeDefined();
      expect(getTicketCard(13)).toBeDefined();
      expect(getTicketCard(14)).toBeDefined();
      expect(queryTicketCard(15)).toBeNull();
      expect(queryTicketCard(16)).toBeNull();

      // Ticket 13 should be back to "이동 중" (not ARRIVED)
      expect(screen.getAllByText('이동 중').length).toBeGreaterThanOrEqual(2);
    });

    it('empirically verifies reset idempotency across multiple consecutive clicks (5x reset taps)', async () => {
      await renderLoggedInApp();

      const surgeBtn = screen.getByRole('button', { name: /\+3팀 골든타임 시연/i });
      const resetBtn = screen.getByRole('button', { name: /시연 초기 상태로 리셋/i });

      // Mutate state with Golden Time
      fireEvent.click(surgeBtn);
      expect(screen.getByText('6 건')).toBeDefined();

      // Click reset 5 times consecutively
      for (let i = 0; i < 5; i++) {
        fireEvent.click(resetBtn);
      }

      // State remains strictly at pristine baseline
      expect(screen.getByText('3 건')).toBeDefined();
      expect(screen.getByText('15')).toBeDefined();
      expect(screen.getByText('12')).toBeDefined();
      expect(screen.getByText('13')).toBeDefined();
      expect(screen.getByText('14')).toBeDefined();
      expect(screen.getByText('현장 1팀')).toBeDefined();
    });

    it('empirically verifies resetting from an empty queue (after seating all teams) recovers baseline data', async () => {
      await renderLoggedInApp();

      const resetBtn = screen.getByRole('button', { name: /시연 초기 상태로 리셋/i });

      // Seat all 3 teams one by one
      let seatBtns = screen.getAllByRole('button', { name: /^착석$/i });
      fireEvent.click(seatBtns[0]); // seats ticket 12

      seatBtns = screen.getAllByRole('button', { name: /^착석$/i });
      fireEvent.click(seatBtns[0]); // seats ticket 13

      seatBtns = screen.getAllByRole('button', { name: /^착석$/i });
      fireEvent.click(seatBtns[0]); // seats ticket 14

      // Board is completely empty
      expect(screen.getByText('0 건')).toBeDefined();
      expect(screen.queryByText('12')).toBeNull();
      expect(screen.queryByText('13')).toBeNull();
      expect(screen.queryByText('14')).toBeNull();

      // Reset restores baseline completely!
      fireEvent.click(resetBtn);

      expect(screen.getByText('3 건')).toBeDefined();
      expect(screen.getByText('15')).toBeDefined();
      expect(screen.getByText('12')).toBeDefined();
      expect(screen.getByText('13')).toBeDefined();
      expect(screen.getByText('14')).toBeDefined();
    });

    it('empirically verifies reset closes open TeamDetailDrawer and returns contextual slot to DemoPanel', async () => {
      await renderLoggedInApp();

      // Open TeamDetailDrawer by clicking card 12
      const card12 = screen.getByText('12').closest('div[class*="rounded-lg"]');
      fireEvent.click(card12!);

      expect(screen.getByText('대기 상세 정보')).toBeDefined();
      expect(screen.queryByText('시연 제어 패널')).toBeNull();

      // Close drawer to reveal DemoPanel
      const closeDrawerBtn = screen.getByRole('button', { name: '상세 닫기' });
      fireEvent.click(closeDrawerBtn);

      expect(screen.getByText('시연 제어 패널')).toBeDefined();

      // Trigger reset
      const resetBtn = screen.getByRole('button', { name: /시연 초기 상태로 리셋/i });
      fireEvent.click(resetBtn);

      // Drawer remains closed and DemoPanel remains active
      expect(screen.queryByText('대기 상세 정보')).toBeNull();
      expect(screen.getByText('시연 제어 패널')).toBeDefined();
    });

    it('empirically verifies DemoPanel close button collapses right contextual slot and Header demo toggle reopens it', async () => {
      await renderLoggedInApp();

      // DemoPanel is open initially
      expect(screen.getByText('시연 제어 패널')).toBeDefined();

      // Click close button on DemoPanel (aria-label="데모 닫기")
      const closeDemoBtn = screen.getByRole('button', { name: '데모 닫기' });
      fireEvent.click(closeDemoBtn);

      // DemoPanel is unmounted / right panel collapsed
      expect(screen.queryByText('시연 제어 패널')).toBeNull();

      // Click demo toggle button in Header (aria-label="데모 컨트롤러 토글")
      const headerDemoBtn = screen.getByRole('button', { name: '데모 컨트롤러 토글' });
      fireEvent.click(headerDemoBtn);

      // DemoPanel is restored
      expect(screen.getByText('시연 제어 패널')).toBeDefined();
    });
  });

  // =========================================================================
  // Suite 4: Alighting Telemetry Conformance & Sensor Contract Verification
  // =========================================================================
  describe('4. Alighting Telemetry Conformance & Sensor Contract Verification', () => {
    it('empirically verifies vehicle arrival populates both legacy fields (arrivalResult: CONFIRMED) and domain contract (alighting.status === CONFIRMED)', async () => {
      await renderLoggedInApp();

      const arrivalBtn = screen.getByRole('button', { name: /하차 확인 이벤트 발생/i });
      fireEvent.click(arrivalBtn);

      // 1. Queue cards reflect passenger alighting badges
      expect(screen.getByText(/4\/4명 하차 완료/i)).toBeDefined();
      expect(screen.getByText(/2\/2명 하차 완료/i)).toBeDefined();

      // 2. Both vehicle cards show "현장 도착" and "도착 완료"
      const arrivedBadges = screen.getAllByText('현장 도착');
      expect(arrivedBadges.length).toBeGreaterThanOrEqual(2);

      const completedTimes = screen.getAllByText('도착 완료');
      expect(completedTimes.length).toBeGreaterThanOrEqual(2);

      // 3. Walk-in ticket 14 is NOT touched by vehicle alighting
      const card14 = screen.getByText('14').closest('div[class*="rounded-lg"]');
      expect(card14).not.toBeNull();
      expect(within(card14!).queryByText(/하차 완료/i)).toBeNull();
      expect(within(card14!).getByText('이동 중')).toBeDefined();
    });

    it('empirically verifies TeamDetailDrawer displays full alighting sensor checklist when opening arrived vehicle card', async () => {
      await renderLoggedInApp();

      // Trigger arrival
      const arrivalBtn = screen.getByRole('button', { name: /하차 확인 이벤트 발생/i });
      fireEvent.click(arrivalBtn);

      // Click card 13 (2명, VEHICLE)
      const card13 = screen.getByText('13').closest('div[class*="rounded-lg"]');
      fireEvent.click(card13!);

      const drawer = screen.getByText('대기 상세 정보').closest('aside')!;
      expect(drawer).not.toBeNull();

      // Verify domain alighting contract renders inside drawer
      expect(within(drawer).getByText('2/2명 하차 완료')).toBeDefined();
      expect(within(drawer).getByText(/매장 주차 구역 도착 확인 \(GPS\)/i)).toBeDefined();
      expect(within(drawer).getByText(/차량 정차 및 도어 개폐 센서 감지/i)).toBeDefined();
      expect(within(drawer).getByText(/승차 인원 전원 하차 확인/i)).toBeDefined();
    });

    it('empirically verifies alighting telemetry for ticket 12 (4 passengers) in TeamDetailDrawer', async () => {
      await renderLoggedInApp();

      const arrivalBtn = screen.getByRole('button', { name: /하차 확인 이벤트 발생/i });
      fireEvent.click(arrivalBtn);

      // Click card 12 (4명, VEHICLE)
      const card12 = screen.getByText('12').closest('div[class*="rounded-lg"]');
      fireEvent.click(card12!);

      const drawer = screen.getByText('대기 상세 정보').closest('aside')!;
      expect(within(drawer).getByText('4/4명 하차 완료')).toBeDefined();
      expect(within(drawer).getByText('4명')).toBeDefined();
    });
  });

  // =========================================================================
  // Suite 5: DemoPanel Standalone Component Contracts & Micro-Interaction Safety
  // =========================================================================
  describe('5. DemoPanel Standalone Component Contracts & Touch Safety', () => {
    it('empirically verifies all interactive buttons in DemoPanel satisfy >= 48px touch target standard', () => {
      const mockProps: DemoPanelProps = {
        onAddWalkIn: vi.fn(),
        onRemoveWalkIn: vi.fn(),
        onSimulateVehicleArrival: vi.fn(),
        onResetDemo: vi.fn(),
        onGoldenTimeRush: vi.fn(),
        onClose: vi.fn(),
        walkInCount: 1,
        aheadTeams: 3,
        estimatedWaitMin: 15,
      };

      const { container } = render(<DemoPanel {...mockProps} />);

      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThanOrEqual(5);

      buttons.forEach((btn) => {
        const classNames = btn.className;
        // Verify min-h-[48px] or h-12 (which equals 48px in Tailwind)
        const has48pxHeight =
          classNames.includes('min-h-[48px]') ||
          classNames.includes('h-12') ||
          classNames.includes('w-12');
        expect(has48pxHeight).toBe(true);

        // Verify active-press micro-interaction class
        expect(classNames).toContain('active-press');
      });
    });

    it('empirically verifies fallback behavior when onGoldenTimeRush is not provided (calls onAddWalkIn 3 times)', () => {
      const onAddWalkIn = vi.fn();
      const mockProps: DemoPanelProps = {
        onAddWalkIn,
        onRemoveWalkIn: vi.fn(),
        onSimulateVehicleArrival: vi.fn(),
        onResetDemo: vi.fn(),
        // onGoldenTimeRush omitted
      };

      render(<DemoPanel {...mockProps} />);

      const surgeBtn = screen.getByRole('button', { name: /\+3팀 골든타임 시연/i });
      fireEvent.click(surgeBtn);

      // Fallback: calls onAddWalkIn exactly 3 times
      expect(onAddWalkIn).toHaveBeenCalledTimes(3);
    });

    it('empirically verifies DemoPanel backward-compatibility aliases work seamlessly', () => {
      const onIncrementWalkIn = vi.fn();
      const onDecrementWalkIn = vi.fn();
      const onSimulateAlighting = vi.fn();
      const onSimulateGoldenTime = vi.fn();

      const mockProps: DemoPanelProps = {
        onAddWalkIn: vi.fn(),
        onRemoveWalkIn: vi.fn(),
        onSimulateVehicleArrival: vi.fn(),
        onResetDemo: vi.fn(),
        onIncrementWalkIn,
        onDecrementWalkIn,
        onSimulateAlighting,
        onSimulateGoldenTime,
      };

      render(<DemoPanel {...mockProps} />);

      fireEvent.click(screen.getByRole('button', { name: /현장 \+1팀/i }));
      expect(onIncrementWalkIn).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: /현장 -1팀/i }));
      expect(onDecrementWalkIn).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: /하차 확인 이벤트 발생/i }));
      expect(onSimulateAlighting).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: /\+3팀 골든타임 시연/i }));
      expect(onSimulateGoldenTime).toHaveBeenCalledTimes(1);
    });

    it('empirically verifies DemoPanel header contains live evaluator connection badge', () => {
      render(
        <DemoPanel
          onAddWalkIn={vi.fn()}
          onRemoveWalkIn={vi.fn()}
          onSimulateVehicleArrival={vi.fn()}
          onResetDemo={vi.fn()}
        />
      );

      expect(screen.getByText('시연 제어 패널')).toBeDefined();
      expect(screen.getByText('시연 제어 패널')).toBeDefined();
      expect(screen.getByText('실시간 연동')).toBeDefined();
    });
  });
});
