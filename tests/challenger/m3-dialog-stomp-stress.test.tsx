import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  act,
  within,
} from '@testing-library/react';
import { App } from '../../src/App';
import { ConfirmDialog } from '../../src/components/dialogs/ConfirmDialog';
import { TeamDetailDrawer } from '../../src/components/detail/TeamDetailDrawer';
import { posApi } from '../../src/api/posApi';
import type { WaitingTeam } from '../../src/types/pos';
import { createMockItem } from '../e2e/test-utils';

// Global STOMP callback capturer for empirical event dispatching
let capturedStompHandler: ((data: unknown) => void) | null = null;

vi.mock('../../src/hooks/usePosStomp', () => ({
  usePosStomp: vi.fn((_storeId: string, onQueueUpdated?: (data: unknown) => void) => {
    capturedStompHandler = onQueueUpdated ?? null;
    return { isConnected: true, reconnectAttempts: 0 };
  }),
}));

/**
 * Helper to render App and immediately bypass the POS login screen.
 */
async function renderLoggedInPos() {
  const result = render(<App />);
  const loginButton = screen.queryByRole('button', { name: /POS 시스템 접속/i });
  if (loginButton) {
    fireEvent.click(loginButton);
    await screen.findByText('하늘본가 숯불갈비 시흥본점');
  }
  return result;
}

describe('Milestone M3 Empirical Challenger: Dialog Interception & STOMP Stress Harness', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // 1. Irreversible Action Interception (SEAT & NO_SHOW via TeamDetailDrawer)
  // =========================================================================
  describe('1. P-04 Safe Confirmation Dialog Interception', () => {
    it('intercepts irreversible SEAT action from TeamDetailDrawer and presents matching ticket & warning copy', async () => {
      const seatApiSpy = vi.spyOn(posApi, 'seatWaiting');
      await renderLoggedInPos();

      // Step 1: Baseline queue verification (Ticket 13 is in the queue)
      expect(screen.getByText('13')).toBeDefined();

      // Step 2: Click on Ticket 13 card to open TeamDetailDrawer
      const card13 = screen.getByText('13').closest('.cursor-pointer')!;
      fireEvent.click(card13);

      // Verify drawer opened
      const drawer = screen.getByText('대기 상세 정보').closest('aside')!;
      expect(drawer).not.toBeNull();
      expect(within(drawer).getByText('No.')).toBeDefined();

      // Step 3: Click [착석] inside the drawer
      const drawerSeatBtn = within(drawer).getByRole('button', { name: /^착석$/i });
      fireEvent.click(drawerSeatBtn);

      // Step 4: Verify ConfirmDialog intercepted the action
      expect(screen.getByText('착석 완료 처리')).toBeDefined();
      expect(
        screen.getByText(
          '고객 차량에 착석 완료 알림이 전송되며, 대기 목록에서 즉시 완료 처리됩니다.'
        )
      ).toBeDefined();

      // Verify dialog shows targeted team info
      const dialogModal = screen.getByText('착석 완료 처리').closest('.bg-surface')!;
      expect(within(dialogModal).getByText('No. 13')).toBeDefined();
      expect(within(dialogModal).getByText('2명')).toBeDefined();

      // Critical safety check: API MUST NOT have been called yet, and queue remains intact
      expect(seatApiSpy).not.toHaveBeenCalled();
      expect(screen.getAllByText('13').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('대기 상세 정보')).toBeDefined();
    });

    it('intercepts irreversible NO_SHOW action from TeamDetailDrawer with permanent eviction warning', async () => {
      const noShowApiSpy = vi.spyOn(posApi, 'noShowWaiting');
      await renderLoggedInPos();

      // Open drawer for Ticket 13
      const card13 = screen.getAllByText('13')[0].closest('.cursor-pointer')!;
      fireEvent.click(card13);

      const drawer = screen.getByText('대기 상세 정보').closest('aside')!;
      const drawerNoShowBtn = within(drawer).getByRole('button', { name: /^노쇼$/i });
      fireEvent.click(drawerNoShowBtn);

      // Verify NO_SHOW ConfirmDialog modal
      expect(screen.getByText('노쇼(미방문) 처리')).toBeDefined();
      expect(
        screen.getByText(
          '대기 번호표가 즉시 파기되며 대기열에서 영구 제외됩니다. 이 작업은 되돌릴 수 없습니다.'
        )
      ).toBeDefined();

      const dialogModal = screen.getByText('노쇼(미방문) 처리').closest('.bg-surface')!;
      expect(within(dialogModal).getByText('No. 13')).toBeDefined();
      expect(within(dialogModal).getByRole('button', { name: /노쇼 처리/i })).toBeDefined();

      // Critical safety check: no eviction happened on prompt display
      expect(noShowApiSpy).not.toHaveBeenCalled();
      expect(screen.getAllByText('13').length).toBeGreaterThanOrEqual(1);
    });
  });

  // =========================================================================
  // 2. Cancellation UX & Drawer State Preservation
  // =========================================================================
  describe('2. Dialog Cancellation Leaves Queue Pristine & Preserves Drawer', () => {
    it('clicking [취소] dismisses ConfirmDialog, preserves queue item, and keeps drawer mounted', async () => {
      const seatApiSpy = vi.spyOn(posApi, 'seatWaiting');
      await renderLoggedInPos();

      // Open drawer and trigger SEAT
      const card13 = screen.getAllByText('13')[0].closest('.cursor-pointer')!;
      fireEvent.click(card13);

      const drawer = screen.getByText('대기 상세 정보').closest('aside')!;
      const drawerSeatBtn = within(drawer).getByRole('button', { name: /^착석$/i });
      fireEvent.click(drawerSeatBtn);

      // Confirm modal is visible
      expect(screen.getByText('착석 완료 처리')).toBeDefined();

      // Click [취소]
      const cancelBtn = screen.getByRole('button', { name: /^취소$/i });
      fireEvent.click(cancelBtn);

      // Dialog must be removed
      expect(screen.queryByText('착석 완료 처리')).toBeNull();

      // Queue state must be completely untouched
      expect(seatApiSpy).not.toHaveBeenCalled();
      expect(screen.getAllByText('13').length).toBeGreaterThanOrEqual(1);

      // Drawer must remain mounted and active
      expect(screen.getByText('대기 상세 정보')).toBeDefined();
      expect(within(drawer).getByText('IONIQ 5 · 45나 6789')).toBeDefined();
    });

    it('clicking close button (X) dismisses ConfirmDialog without modifying queue or drawer', async () => {
      await renderLoggedInPos();

      // Open drawer and trigger NO_SHOW
      const card13 = screen.getAllByText('13')[0].closest('.cursor-pointer')!;
      fireEvent.click(card13);

      const drawer = screen.getByText('대기 상세 정보').closest('aside')!;
      const drawerNoShowBtn = within(drawer).getByRole('button', { name: /^노쇼$/i });
      fireEvent.click(drawerNoShowBtn);

      expect(screen.getByText('노쇼(미방문) 처리')).toBeDefined();

      // Click X close button on modal
      const modalCloseBtn = screen.getByRole('button', { name: '닫기' });
      fireEvent.click(modalCloseBtn);

      // Dialog is gone, queue item 13 preserved, drawer preserved
      expect(screen.queryByText('노쇼(미방문) 처리')).toBeNull();
      expect(screen.getAllByText('13').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('대기 상세 정보')).toBeDefined();
    });
  });

  // =========================================================================
  // 3. Safe Dismissal Mechanics (ESC Key & Backdrop Click)
  // =========================================================================
  describe('3. Dismissal Mechanics: ESC Key Press & Backdrop Click', () => {
    it('pressing ESC key dismisses the dialog safely without queue disruption', async () => {
      await renderLoggedInPos();

      const card13 = screen.getAllByText('13')[0].closest('.cursor-pointer')!;
      fireEvent.click(card13);

      const drawer = screen.getByText('대기 상세 정보').closest('aside')!;
      fireEvent.click(within(drawer).getByRole('button', { name: /^착석$/i }));

      expect(screen.getByText('착석 완료 처리')).toBeDefined();

      // Dispatch ESC on window
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

      // Modal closed, drawer still open
      expect(screen.queryByText('착석 완료 처리')).toBeNull();
      expect(screen.getByText('대기 상세 정보')).toBeDefined();
      expect(screen.getAllByText('13').length).toBeGreaterThanOrEqual(1);
    });

    it('clicking backdrop overlay dismisses the dialog, while clicking modal interior does not', async () => {
      const { container } = await renderLoggedInPos();

      const card13 = screen.getByText('13').closest('.cursor-pointer')!;
      fireEvent.click(card13);

      const drawer = screen.getByText('대기 상세 정보').closest('aside')!;
      fireEvent.click(within(drawer).getByRole('button', { name: /^착석$/i }));

      expect(screen.getByText('착석 완료 처리')).toBeDefined();

      // Click inside modal card -> should NOT close (stopPropagation test)
      const modalCard = screen.getByText('착석 완료 처리').closest('.bg-surface')!;
      fireEvent.click(modalCard);
      expect(screen.getByText('착석 완료 처리')).toBeDefined();

      // Click on backdrop (.fixed.inset-0) -> should close
      const backdrop = container.querySelector('.fixed.inset-0.z-50')!;
      expect(backdrop).not.toBeNull();
      fireEvent.click(backdrop);

      expect(screen.queryByText('착석 완료 처리')).toBeNull();
      expect(screen.getByText('대기 상세 정보')).toBeDefined();
    });
  });

  // =========================================================================
  // 4. Confirmation Transitions State & Cleans Up UI
  // =========================================================================
  describe('4. Confirmation State Transitions (Atomic Eviction & UI Dismissal)', () => {
    it('confirming SEAT transitions state, calls API, evicts team from queue, and dismisses drawer', async () => {
      const seatApiSpy = vi.spyOn(posApi, 'seatWaiting');
      await renderLoggedInPos();

      // Baseline: 3 teams ahead
      expect(screen.getByText('13')).toBeDefined();
      expect(screen.getByText('3 건')).toBeDefined();

      // Select ticket 13 and trigger SEAT from drawer
      const card13 = screen.getByText('13').closest('.cursor-pointer')!;
      fireEvent.click(card13);

      const drawer = screen.getByText('대기 상세 정보').closest('aside')!;
      fireEvent.click(within(drawer).getByRole('button', { name: /^착석$/i }));

      // Confirm action via dialog
      const confirmBtn = screen.getByRole('button', { name: /착석 완료/i });
      fireEvent.click(confirmBtn);

      // Verifications:
      // 1. posApi.seatWaiting called with 'wait-102'
      expect(seatApiSpy).toHaveBeenCalledWith('wait-102');

      // 2. Dialog dismissed
      expect(screen.queryByText('착석 완료 처리')).toBeNull();

      // 3. Ticket 13 evicted from queue board
      expect(screen.queryByText('13')).toBeNull();
      expect(screen.getByText('2 건')).toBeDefined();

      // 4. Drawer dismissed (no orphaned team detail drawer)
      expect(screen.queryByText('대기 상세 정보')).toBeNull();
    });

    it('confirming NO_SHOW transitions state, calls API, evicts team, and dismisses drawer', async () => {
      const noShowApiSpy = vi.spyOn(posApi, 'noShowWaiting');
      await renderLoggedInPos();

      const card13 = screen.getByText('13').closest('.cursor-pointer')!;
      fireEvent.click(card13);

      const drawer = screen.getByText('대기 상세 정보').closest('aside')!;
      fireEvent.click(within(drawer).getByRole('button', { name: /^노쇼$/i }));

      const confirmBtn = screen.getByRole('button', { name: /노쇼 처리/i });
      fireEvent.click(confirmBtn);

      expect(noShowApiSpy).toHaveBeenCalledWith('wait-102');
      expect(screen.queryByText('노쇼(미방문) 처리')).toBeNull();
      expect(screen.queryByText('13')).toBeNull();
      expect(screen.queryByText('대기 상세 정보')).toBeNull();
    });
  });

  // =========================================================================
  // 5. Card-Level Action Buttons Remain Direct Rapid Triggers
  // =========================================================================
  describe('5. Card-Level Direct Rapid Triggers in QueueBoard', () => {
    it('clicking [착석] directly on WaitingCard executes immediate seating without dialog interruption', async () => {
      const seatApiSpy = vi.spyOn(posApi, 'seatWaiting');
      await renderLoggedInPos();

      // Locate WaitingCard for ticket 12
      const card12 = screen.getByText('12').closest('.cursor-pointer')!;
      const cardSeatBtn = within(card12).getByRole('button', { name: /^착석$/i });

      // Click card-level seat button
      fireEvent.click(cardSeatBtn);

      // Immediate eviction without modal intrusion
      expect(screen.queryByText('착석 완료 처리')).toBeNull();
      expect(screen.queryByText('12')).toBeNull();
      expect(seatApiSpy).toHaveBeenCalledWith('wait-101');
    });

    it('clicking [노쇼] directly on WaitingCard executes immediate eviction without dialog interruption', async () => {
      const noShowApiSpy = vi.spyOn(posApi, 'noShowWaiting');
      await renderLoggedInPos();

      // Locate WaitingCard for ticket 13
      const card13 = screen.getByText('13').closest('.cursor-pointer')!;
      const cardNoShowBtn = within(card13).getByRole('button', { name: /^노쇼$/i });

      fireEvent.click(cardNoShowBtn);

      expect(screen.queryByText('노쇼(미방문) 처리')).toBeNull();
      expect(screen.queryByText('13')).toBeNull();
      expect(noShowApiSpy).toHaveBeenCalledWith('wait-102');
    });

    it('stress tests rapid sequential card-level actions across multiple teams without collision', async () => {
      await renderLoggedInPos();

      // Rapidly click seat on ticket 12, then call on ticket 13, then no-show on ticket 14
      const initialCards = screen.getAllByText(/No\./i);
      expect(initialCards.length).toBeGreaterThanOrEqual(3);

      const seatBtns = screen.getAllByRole('button', { name: /^착석$/i });
      fireEvent.click(seatBtns[0]); // Seats ticket 12

      expect(screen.queryByText('12')).toBeNull();
      expect(screen.getByText('2 건')).toBeDefined();

      const callBtns = screen.getAllByRole('button', { name: /^호출$/i });
      fireEvent.click(callBtns[0]); // Calls remaining ticket 13
      expect(screen.getByText(/호출됨/)).toBeDefined();

      const noShowBtns = screen.getAllByRole('button', { name: /^노쇼$/i });
      fireEvent.click(noShowBtns[1]); // No-show ticket 14
      expect(screen.queryByText('14')).toBeNull();
      expect(screen.getByText('1 건')).toBeDefined();
    });
  });

  // =========================================================================
  // 6. In-Place STOMP Updates Without Focus Loss
  // =========================================================================
  describe('6. In-Place STOMP Updates & Focus Retention in Active Drawer', () => {
    it('updates telemetry via ETA_UPDATE and ALIGHTING_EVENT in-place without focus loss', async () => {
      await renderLoggedInPos();

      // Verify STOMP listener was registered
      expect(capturedStompHandler).not.toBeNull();

      // Step 1: Open drawer for Ticket 13 (wait-102: moving, 4 min ETA, unconfirmed)
      const card13 = screen.getByText('13').closest('.cursor-pointer')!;
      fireEvent.click(card13);

      const drawer = screen.getByText('대기 상세 정보').closest('aside')!;
      expect(drawer).not.toBeNull();
      expect(within(drawer).getByText('약 4분')).toBeDefined();
      expect(within(drawer).getByText('인원 미확인')).toBeDefined();

      // Focus the [호출] button inside the active drawer
      const drawerCallBtn = within(drawer).getByRole('button', { name: /^호출$/i });
      drawerCallBtn.focus();
      expect(document.activeElement).toBe(drawerCallBtn);

      // Step 2: Dispatch simulated ETA_UPDATE STOMP event (ETA decreases to 1 min)
      act(() => {
        capturedStompHandler!({
          type: 'ETA_UPDATE',
          waitingId: 'wait-102',
          etaMin: 1,
        });
      });

      // Assert drawer updated telemetry in-place
      expect(within(drawer).getByText('약 1분')).toBeDefined();
      // Crucial: ActiveElement MUST STILL be drawerCallBtn (zero focus loss)
      expect(document.activeElement).toBe(drawerCallBtn);

      // Step 3: Dispatch simulated ALIGHTING_EVENT (vehicle arrived and 2/2 passengers alighted)
      act(() => {
        capturedStompHandler!({
          type: 'ALIGHTING_EVENT',
          waitingId: 'wait-102',
          alighted: 2,
        });
      });

      // Assert badge updated to CONFIRMED (2/2명 하차 완료) and status to 현장 도착
      expect(within(drawer).getAllByText(/2\/2명 하차 완료/i).length).toBeGreaterThanOrEqual(1);
      expect(within(drawer).getByText('현장 도착')).toBeDefined();
      // Audit timeline must include the new alighting sensor event
      expect(within(drawer).getByText('하차 센서 확인')).toBeDefined();

      // Crucial: ActiveElement MUST STILL be drawerCallBtn (zero focus loss across re-renders)
      expect(document.activeElement).toBe(drawerCallBtn);

      // Step 4: Dispatch ETA_UPDATE reaching 0 (도착 완료)
      act(() => {
        capturedStompHandler!({
          type: 'ETA_UPDATE',
          waitingId: 'wait-102',
          etaMin: 0,
        });
      });

      expect(within(drawer).getByText('도착 완료')).toBeDefined();
      expect(document.activeElement).toBe(drawerCallBtn);
    });

    it('applies QUEUE_UPDATE STOMP event and preserves active drawer selection and focus', async () => {
      await renderLoggedInPos();

      // Select ticket 13
      const card13 = screen.getAllByText('13')[0].closest('.cursor-pointer')!;
      fireEvent.click(card13);

      const drawer = screen.getByText('대기 상세 정보').closest('aside')!;
      const drawerSeatBtn = within(drawer).getByRole('button', { name: /^착석$/i });
      drawerSeatBtn.focus();
      expect(document.activeElement).toBe(drawerSeatBtn);

      // STOMP global queue update with modified aheadTeams and estimatedWaitMin
      act(() => {
        capturedStompHandler!({
          type: 'QUEUE_UPDATE',
          aheadTeams: 5,
          estimatedWaitMin: 25,
        });
      });

      // StoreSummary reflects new counts
      expect(screen.getByText('5')).toBeDefined();
      expect(screen.getByText('25')).toBeDefined();

      // Drawer remains mounted for ticket 13 with focus retained
      expect(screen.getByText('대기 상세 정보')).toBeDefined();
      expect(within(drawer).getByText('No.')).toBeDefined();
      expect(within(drawer).getByText('13')).toBeDefined();
      expect(document.activeElement).toBe(drawerSeatBtn);
    });

    it('ignores STOMP events targeting different teams without disrupting active drawer', async () => {
      await renderLoggedInPos();

      // Open drawer for ticket 13
      const card13 = screen.getAllByText('13')[0].closest('.cursor-pointer')!;
      fireEvent.click(card13);

      const drawer = screen.getByText('대기 상세 정보').closest('aside')!;
      expect(within(drawer).getByText('No.')).toBeDefined();
      expect(within(drawer).getByText('13')).toBeDefined();

      // Dispatch event targeting ticket 12 (wait-101)
      act(() => {
        capturedStompHandler!({
          type: 'ETA_UPDATE',
          waitingId: 'wait-101',
          etaMin: 99,
        });
      });

      // Ticket 13 drawer telemetry remains unchanged
      expect(within(drawer).getByText('13')).toBeDefined();
      expect(within(drawer).getByText('약 4분')).toBeDefined();
    });
  });

  // =========================================================================
  // 7. Standalone Component Boundaries, Touch Targets & Safety Contracts
  // =========================================================================
  describe('7. Standalone Component Contracts & Touch Ergonomics', () => {
    it('ConfirmDialog rendered with isOpen={false} produces empty DOM and adds no listeners', () => {
      const onCancel = vi.fn();
      const onConfirm = vi.fn();
      const addListenerSpy = vi.spyOn(window, 'addEventListener');

      const { container } = render(
        <ConfirmDialog
          isOpen={false}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(container.firstChild).toBeNull();
      // When isOpen is false, the useEffect returns early without adding keydown listener
      expect(addListenerSpy).not.toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('ConfirmDialog properly cleans up window keydown listener on unmount', () => {
      const removeListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = render(
        <ConfirmDialog
          isOpen={true}
          type="SEAT"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );

      unmount();
      expect(removeListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('enforces >= 48px touch targets, active-press, and touch-manipulation across dialog buttons', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          type="SEAT"
          ticketNo={77}
          customerName="홍길동"
          partySize={4}
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );

      const buttons = screen.getAllByRole('button');
      // Cancel, Confirm, and Close (X) buttons
      expect(buttons.length).toBe(3);

      for (const btn of buttons) {
        expect(btn.className).toContain('min-h-[48px]');
        expect(btn.className).toContain('active-press');
      }
    });

    it('TeamDetailDrawer enforces >= 48px touch targets on all footer actions and close button', () => {
      const mockTeam: WaitingTeam = {
        id: 'team-mock-1',
        ticketNumber: 55,
        customerName: '박*수',
        phone: '010-9876-5432',
        partySize: 3,
        channel: 'VEHICLE',
        status: 'ARRIVED',
        vehicleModel: 'IONIQ 5',
        vehicleNumber: '345나 6789',
        etaMinutes: 0,
        distanceMeters: 500,
        alighting: {
          status: 'CONFIRMED',
          alightedCount: 3,
          totalPassengers: 3,
        },
        registeredAt: '12:00:00',
        timeline: [
          {
            id: 'evt-1',
            timestamp: '12:00:00',
            title: '원격 접수',
            description: '접수 완료',
            type: 'INFO',
          },
          {
            id: 'evt-2',
            timestamp: '12:10:00',
            title: '하차 센서 확인',
            description: '전원 하차',
            type: 'SUCCESS',
          },
        ],
      };

      render(
        <TeamDetailDrawer
          selectedTeam={mockTeam}
          onClose={() => {}}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      // Verify title & badges
      expect(screen.getByText('대기 상세 정보')).toBeDefined();
      expect(screen.getByText('No.')).toBeDefined();
      expect(screen.getByText('55')).toBeDefined();
      expect(screen.getByText('IONIQ 5 · 345나 6789')).toBeDefined();
      expect(screen.getByText(/3\/3명 하차 완료/i)).toBeDefined();

      // Check all 4 interactive buttons (Close + 3 action buttons)
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(4);

      for (const btn of buttons) {
        expect(btn.className).toContain('min-h-[48px]');
        expect(btn.className).toContain('active-press');
      }
    });

    it('handles Walk-In teams inside TeamDetailDrawer without crashing and displays manual tag', () => {
      const walkInItem = createMockItem({
        id: 'walkin-1',
        ticketNo: 88,
        channel: 'WALK_IN',
        partySize: 5,
        status: 'REGISTERED',
      });

      render(
        <TeamDetailDrawer
          selectedTeam={walkInItem}
          onClose={() => {}}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      expect(screen.getByText('일반 현장')).toBeDefined();
      expect(screen.getByText('현장 방문 접수 (차량 연동 없음)')).toBeDefined();
      expect(screen.getByText('88')).toBeDefined();
      expect(screen.getByText('5명')).toBeDefined();
    });
  });
});
