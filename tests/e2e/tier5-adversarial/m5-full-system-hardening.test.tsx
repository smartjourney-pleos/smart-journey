import React, { act } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { App } from '../../../src/App';
import { Header } from '../../../src/components/layout/Header';
import { StoreSummary } from '../../../src/components/sidebar/StoreSummary';
import { QueueBoard } from '../../../src/components/queue/QueueBoard';
import { WaitingCard } from '../../../src/components/queue/WaitingCard';
import { TeamDetailDrawer } from '../../../src/components/detail/TeamDetailDrawer';
import { ConfirmDialog } from '../../../src/components/dialogs/ConfirmDialog';
import { DemoPanel } from '../../../src/components/demo/DemoPanel';
import { TabletLayout } from '../../../src/components/layout/TabletLayout';
import { createMockItem, createMockStore } from '../test-utils';
import type { WaitingItem, QueueFilterTab } from '../../../src/types/pos';

// Intercept STOMP callbacks to simulate real-time live events during tests
let capturedStompHandler: ((data: unknown) => void) | null = null;

vi.mock('../../../src/hooks/usePosStomp', () => ({
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

/**
 * Helper to assert that no descendant elements in the container have raw/naked "hover:" utilities.
 * Only touch-isolated classes (such as touch-hover-*) are permitted.
 */
function assertZeroNakedHover(container: HTMLElement) {
  const allElements = container.querySelectorAll('*');
  allElements.forEach((el) => {
    const cls = el.className;
    if (typeof cls === 'string' && cls.length > 0) {
      // Matches "hover:..." that is NOT preceded by another prefix or word character
      // e.g. "hover:bg-red-500", " hover:text-white"
      const hasNakedHover = /(?:^|\s)hover:[^\s]+/.test(cls);
      expect(
        hasNakedHover,
        `Element <${el.tagName.toLowerCase()}> has naked hover class: "${cls}"`
      ).toBe(false);
    }
  });
}

describe('Tier 5 Adversarial Hardening Suite (Milestone M5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedStompHandler = null;
  });

  /* =========================================================================
   * Suite 1: Comprehensive Touch Target Ergonomics & Bounds (>= 48px)
   * ========================================================================= */
  describe('Suite 1: Touch Target Ergonomics & Minimum Bounds Compliance (>= 48px)', () => {
    it('1.1 Enforces >= 48px bounds and tactile classes on all Header action triggers', () => {
      const store = createMockStore();
      render(
        <Header
          store={store}
          isConnected={true}
          isDemoOpen={false}
          onToggleDemo={() => {}}
          onOpenSettings={() => {}}
          onLogout={() => {}}
        />
      );

      const demoBtn = screen.getByRole('button', { name: /데모 컨트롤러 토글/i });
      const settingsBtn = screen.getByRole('button', { name: /매장 대기 시간 설정/i });
      const logoutBtn = screen.getByRole('button', { name: /시스템 로그아웃/i });

      [demoBtn, settingsBtn, logoutBtn].forEach((btn) => {
        expect(btn.className).toContain('min-h-[48px]');
        expect(btn.className).toContain('h-12');
        expect(btn.className).toContain('active-press');
        expect(btn.className).toContain('cursor-pointer');
      });
    });

    it('1.2 Enforces >= 48px bounds and touch manipulation across all StoreSummary filter tabs', () => {
      const tabs: QueueFilterTab[] = ['ALL', 'MOVING', 'ARRIVED', 'CALLED'];
      const queue = [
        createMockItem({ id: 'item-1', status: 'REGISTERED' }),
        createMockItem({ id: 'item-2', status: 'ARRIVED' }),
      ];

      tabs.forEach((tab) => {
        const { unmount } = render(
          <StoreSummary
            aheadTeams={2}
            estimatedWaitMin={10}
            queue={queue}
            currentFilter={tab}
            onFilterChange={() => {}}
          />
        );

        const tabNames = ['전체', '이동 중', '도착팀', '호출팀'];
        tabNames.forEach((name) => {
          const btn = screen.getByRole('button', { name: new RegExp(name) });
          expect(btn.className).toContain('min-h-[48px]');
          expect(btn.className).toContain('h-12');
          expect(btn.className).toContain('touch-manipulation');
          expect(btn.className).toContain('active-press');
          expect(btn.className).toContain('cursor-pointer');
        });

        unmount();
      });
    });

    it('1.3 Enforces >= 48px bounds across WaitingCard action buttons for all status configurations', () => {
      const statuses: WaitingItem['status'][] = ['REGISTERED', 'MOVING', 'ARRIVED', 'CALLED'];

      statuses.forEach((status) => {
        const item = createMockItem({ id: `tc-${status}`, status });
        const { unmount } = render(
          <WaitingCard
            item={item}
            onCall={() => {}}
            onSeat={() => {}}
            onNoShow={() => {}}
          />
        );

        const callLabel = status === 'CALLED' ? /^재호출$/i : /^호출$/i;
        const callBtn = screen.getByRole('button', { name: callLabel });
        const seatBtn = screen.getByRole('button', { name: /^착석$/i });
        const noShowBtn = screen.getByRole('button', { name: /^노쇼$/i });

        [callBtn, seatBtn, noShowBtn].forEach((btn) => {
          expect(btn.className).toContain('min-h-[48px]');
          expect(btn.className).toContain('h-12');
          expect(btn.className).toContain('touch-manipulation');
          expect(btn.className).toContain('active-press');
        });

        unmount();
      });
    });

    it('1.4 Enforces >= 48px bounds and square touch target on TeamDetailDrawer close & action buttons', () => {
      const item = createMockItem({ id: 'drawer-item-1', ticketNo: 42 });
      render(
        <TeamDetailDrawer
          selectedTeam={item}
          onClose={() => {}}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      const closeBtn = screen.getByRole('button', { name: /상세 닫기/i });
      expect(closeBtn.className).toContain('min-h-[48px]');
      expect(closeBtn.className).toContain('min-w-[48px]');
      expect(closeBtn.className).toContain('w-12');
      expect(closeBtn.className).toContain('h-12');

      const callBtn = screen.getByRole('button', { name: /^호출$/i });
      const seatBtn = screen.getByRole('button', { name: /^착석$/i });
      const noShowBtn = screen.getByRole('button', { name: /^노쇼$/i });

      [callBtn, seatBtn, noShowBtn].forEach((btn) => {
        expect(btn.className).toContain('min-h-[48px]');
        expect(btn.className).toContain('h-12');
        expect(btn.className).toContain('touch-manipulation');
        expect(btn.className).toContain('active-press');
      });
    });

    it('1.5 Enforces >= 48px bounds on ConfirmDialog close, cancel, and confirm buttons', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          type="SEAT"
          ticketNo={77}
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );

      const closeBtn = screen.getByRole('button', { name: /닫기/i });
      expect(closeBtn.className).toContain('min-h-[48px]');
      expect(closeBtn.className).toContain('min-w-[48px]');
      expect(closeBtn.className).toContain('w-12');
      expect(closeBtn.className).toContain('h-12');

      const cancelBtn = screen.getByRole('button', { name: /^취소$/i });
      const confirmBtn = screen.getByRole('button', { name: /^착석 완료$/i });

      [cancelBtn, confirmBtn].forEach((btn) => {
        expect(btn.className).toContain('min-h-[48px]');
        expect(btn.className).toContain('h-12');
        expect(btn.className).toContain('touch-manipulation');
        expect(btn.className).toContain('active-press');
      });
    });

    it('1.6 Enforces >= 48px bounds across all DemoPanel touch controls and reset trigger', () => {
      render(
        <DemoPanel
          onAddWalkIn={() => {}}
          onRemoveWalkIn={() => {}}
          onSimulateVehicleArrival={() => {}}
          onResetDemo={() => {}}
          onGoldenTimeRush={() => {}}
          onClose={() => {}}
        />
      );

      const closeBtn = screen.getByRole('button', { name: /데모 닫기/i });
      expect(closeBtn.className).toContain('min-h-[48px]');
      expect(closeBtn.className).toContain('min-w-[48px]');
      expect(closeBtn.className).toContain('w-12');
      expect(closeBtn.className).toContain('h-12');

      const addBtn = screen.getByRole('button', { name: /현장 \+1팀/i });
      const removeBtn = screen.getByRole('button', { name: /현장 -1팀/i });
      const goldenTimeBtn = screen.getByRole('button', { name: /\+3팀 골든타임 시연/i });
      const arrivalBtn = screen.getByRole('button', { name: /하차 확인 이벤트 발생/i });
      const resetBtn = screen.getByRole('button', { name: /시연 초기 상태로 리셋/i });

      [addBtn, removeBtn, goldenTimeBtn, arrivalBtn, resetBtn].forEach((btn) => {
        expect(btn.className).toContain('min-h-[48px]');
        expect(btn.className).toContain('h-12');
        expect(btn.className).toContain('touch-manipulation');
        expect(btn.className).toContain('active-press');
      });
    });
  });

  /* =========================================================================
   * Suite 2: Touchscreen Hover-Safety Audit (Zero Naked "hover:" Utilities)
   * ========================================================================= */
  describe('Suite 2: Touchscreen Hover-Safety Audit (Zero Naked "hover:" Classes)', () => {
    it('2.1 Audits Header, StoreSummary, QueueBoard, WaitingCard for zero naked hover: classes', () => {
      const store = createMockStore();
      const item = createMockItem({ id: 'audit-item-1', status: 'MOVING' });

      const { container: headerContainer } = render(
        <Header
          store={store}
          isConnected={true}
          isDemoOpen={false}
          onToggleDemo={() => {}}
          onOpenSettings={() => {}}
          onLogout={() => {}}
        />
      );
      assertZeroNakedHover(headerContainer);

      const { container: summaryContainer } = render(
        <StoreSummary
          aheadTeams={1}
          estimatedWaitMin={5}
          queue={[item]}
          currentFilter="ALL"
          onFilterChange={() => {}}
        />
      );
      assertZeroNakedHover(summaryContainer);

      const { container: cardContainer } = render(
        <WaitingCard
          item={item}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );
      assertZeroNakedHover(cardContainer);

      const { container: boardContainer } = render(
        <QueueBoard
          queue={[item]}
          aheadTeams={1}
          estimatedWaitMin={5}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );
      assertZeroNakedHover(boardContainer);
    });

    it('2.2 Audits TeamDetailDrawer, ConfirmDialog, and DemoPanel for zero naked hover: classes', () => {
      const item = createMockItem({ id: 'audit-item-2', status: 'ARRIVED' });

      const { container: drawerContainer } = render(
        <TeamDetailDrawer
          selectedTeam={item}
          onClose={() => {}}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );
      assertZeroNakedHover(drawerContainer);

      const { container: dialogContainer } = render(
        <ConfirmDialog
          isOpen={true}
          type="NO_SHOW"
          ticketNo={88}
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );
      assertZeroNakedHover(dialogContainer);

      const { container: demoContainer } = render(
        <DemoPanel
          onAddWalkIn={() => {}}
          onRemoveWalkIn={() => {}}
          onSimulateVehicleArrival={() => {}}
          onResetDemo={() => {}}
          onClose={() => {}}
        />
      );
      assertZeroNakedHover(demoContainer);
    });

    it('2.3 Audits fully-mounted App in logged-in state across all active panels', async () => {
      const { container } = await renderLoggedInPos();
      assertZeroNakedHover(container);
    });
  });

  /* =========================================================================
   * Suite 3: Safe Dialog Dismissal, Keyboard ESC & Backdrop Event Isolation
   * ========================================================================= */
  describe('Suite 3: Safe Dialog Dismissal, Keyboard ESC & Backdrop Event Isolation', () => {
    it('3.1 Closes ConfirmDialog on Escape key without executing confirmation callback', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <ConfirmDialog
          isOpen={true}
          type="SEAT"
          ticketNo={10}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(screen.getByText('착석 완료 처리')).toBeDefined();

      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('3.2 Closes ConfirmDialog on backdrop click without executing confirmation callback', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      const { container } = render(
        <ConfirmDialog
          isOpen={true}
          type="NO_SHOW"
          ticketNo={10}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      // The backdrop is the outer fixed container
      const backdrop = container.querySelector('.fixed.inset-0') as HTMLElement;
      expect(backdrop).not.toBeNull();

      fireEvent.click(backdrop);

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('3.3 Prevents dialog dismissal when clicking inside the modal dialog container', () => {
      const onCancel = vi.fn();

      const { container } = render(
        <ConfirmDialog
          isOpen={true}
          type="SEAT"
          ticketNo={10}
          onConfirm={() => {}}
          onCancel={onCancel}
        />
      );

      const modalContent = container.querySelector('.bg-surface.shadow-xl') as HTMLElement;
      expect(modalContent).not.toBeNull();

      fireEvent.click(modalContent);

      expect(onCancel).not.toHaveBeenCalled();
    });

    it('3.4 Full system flow: Detail drawer seat button triggers safe dialog, Escape key safely aborts', async () => {
      await renderLoggedInPos();

      // Click card 13 to open TeamDetailDrawer
      const card13 = screen.getAllByText('13')[0].closest('.cursor-pointer')!;
      fireEvent.click(card13);

      const drawer = screen.getByText('대기 상세 정보').closest('aside')!;
      const seatBtn = within(drawer).getByRole('button', { name: /^착석$/i });
      fireEvent.click(seatBtn);

      // Verify safe dialog is open
      expect(screen.getByText('착석 완료 처리')).toBeDefined();

      // Press Escape
      fireEvent.keyDown(window, { key: 'Escape' });

      // Dialog dismissed
      expect(screen.queryByText('착석 완료 처리')).toBeNull();

      // Ticket 13 must remain safely in the queue
      expect(screen.getAllByText('13').length).toBeGreaterThanOrEqual(1);
    });

    it('3.5 Full system flow: Detail drawer no-show button triggers safe dialog, backdrop click aborts', async () => {
      await renderLoggedInPos();

      // Click card 13 to open TeamDetailDrawer
      const card13 = screen.getAllByText('13')[0].closest('.cursor-pointer')!;
      fireEvent.click(card13);

      const drawer = screen.getByText('대기 상세 정보').closest('aside')!;
      const noShowBtn = within(drawer).getByRole('button', { name: /^노쇼$/i });
      fireEvent.click(noShowBtn);

      // Verify safe dialog is open
      expect(screen.getByText('노쇼(미방문) 처리')).toBeDefined();

      // Click backdrop
      const backdrop = document.querySelector('.fixed.inset-0') as HTMLElement;
      fireEvent.click(backdrop);

      // Dialog dismissed
      expect(screen.queryByText('노쇼(미방문) 처리')).toBeNull();

      // Ticket 13 remains in the queue
      expect(screen.getAllByText('13').length).toBeGreaterThanOrEqual(1);
    });

    it('3.6 Full system flow: Confirming in safe dialog completes action and cleans up selection state', async () => {
      await renderLoggedInPos();

      // Initial queue length: 3 (tickets 12, 13, 14)
      expect(screen.getByText('3 건')).toBeDefined();

      // Open card 13 drawer
      const card13 = screen.getAllByText('13')[0].closest('.cursor-pointer')!;
      fireEvent.click(card13);

      const drawer = screen.getByText('대기 상세 정보').closest('aside')!;
      const seatBtn = within(drawer).getByRole('button', { name: /^착석$/i });
      fireEvent.click(seatBtn);

      // Confirm the seat action
      const confirmBtn = screen.getByRole('button', { name: /^착석 완료$/i });
      fireEvent.click(confirmBtn);

      // Dialog closed
      expect(screen.queryByText('착석 완료 처리')).toBeNull();

      // Queue count decreased to 2
      expect(screen.getByText('2 건')).toBeDefined();

      // Drawer is closed and DemoPanel is restored
      expect(screen.getByText('시연 제어 패널')).toBeDefined();
    });
  });

  /* =========================================================================
   * Suite 4: Real-Time STOMP Live Sync & Malformed Payload Resilience
   * ========================================================================= */
  describe('Suite 4: Real-Time STOMP Live Sync & Malformed Payload Resilience', () => {
    it('4.1 Applies full queue replacement event via STOMP handler', async () => {
      await renderLoggedInPos();
      expect(capturedStompHandler).not.toBeNull();

      // Inject full queue update payload
      const replacementQueue: WaitingItem[] = [
        createMockItem({ id: 'stomp-1', ticketNo: 99, status: 'ARRIVED', partySize: 5 }),
      ];

      act(() => {
        capturedStompHandler?.({
          type: 'QUEUE_UPDATE',
          aheadTeams: 1,
          estimatedWaitMin: 5,
          queue: replacementQueue,
        });
      });

      // Verify queue updated to ticket 99
      expect(screen.getByText('99')).toBeDefined();
      expect(screen.getByText('1 건')).toBeDefined();
    });

    it('4.2 Dispatches alighting sensor event via STOMP: triggers status change, alighting badge, and timeline entry', async () => {
      await renderLoggedInPos();

      // Baseline: ticket 13 is in REGISTERED status
      expect(screen.getAllByText('13').length).toBeGreaterThanOrEqual(1);

      // STOMP alighting confirmation arrives for ticket 13 (id: wait-102)
      act(() => {
        capturedStompHandler?.({
          type: 'ALIGHTING_EVENT',
          waitingId: 'wait-102',
          alighted: 2,
        });
      });

      // Ticket 13 transitions to 현장 도착 (ARRIVED) and shows 2/2명 하차 완료
      expect(screen.getByText(/2\/2명 하차 완료/i)).toBeDefined();

      // Open detail drawer for ticket 13 and check timeline
      const card13 = screen.getAllByText('13')[0].closest('.cursor-pointer')!;
      fireEvent.click(card13);

      expect(screen.getByText('승차 인원 전원 하차 확인')).toBeDefined();
    });

    it('4.3 Dispatches ETA countdown event via STOMP: transitions status to ARRIVED when eta reaches 0', async () => {
      await renderLoggedInPos();

      // Baseline ticket 13 has etaMin: 4
      expect(screen.getByText('약 4분')).toBeDefined();

      // STOMP ETA update sets eta to 0
      act(() => {
        capturedStompHandler?.({
          type: 'ETA_UPDATE',
          waitingId: 'wait-102',
          etaMin: 0,
        });
      });

      // Both ticket 12 and ticket 13 now show "도착 완료"
      expect(screen.getAllByText('도착 완료').length).toBe(2);
    });

    it('4.4 Gracefully handles corrupted, malformed, or empty STOMP payloads without exceptions', async () => {
      await renderLoggedInPos();

      // Array of hostile / malformed STOMP payloads
      const malformedPayloads = [
        null,
        undefined,
        '',
        12345,
        {},
        { type: 'UNKNOWN_EVENT_TYPE' },
        { type: 'QUEUE_UPDATE', queue: 'not-an-array' },
        { type: 'ALIGHTING_EVENT' }, // missing waitingId
        { type: 'ALIGHTING_EVENT', waitingId: 'non-existent-id' },
        { type: 'ETA_UPDATE', waitingId: 'non-existent-id', etaMin: 'invalid' },
      ];

      malformedPayloads.forEach((payload) => {
        expect(() => {
          act(() => {
            capturedStompHandler?.(payload);
          });
        }).not.toThrow();
      });

      // Verify app continues rendering healthy state
      expect(screen.getByText('하늘본가 숯불갈비 시흥본점')).toBeDefined();
    });
  });

  /* =========================================================================
   * Suite 5: Rapid Interleaved Mutations, Race Conditions & State Invariants
   * ========================================================================= */
  describe('Suite 5: Rapid Interleaved Mutations, Race Conditions & State Invariants', () => {
    it('5.1 Survives rapid burst of mixed evaluator actions while preserving queue consistency', async () => {
      await renderLoggedInPos();

      const addBtn = screen.getByRole('button', { name: /현장 \+1팀/i });
      const goldenTimeBtn = screen.getByRole('button', { name: /\+3팀 골든타임 시연/i });
      const arrivalBtn = screen.getByRole('button', { name: /하차 확인 이벤트 발생/i });

      // Burst: Add 1 walk-in, simulate golden time (+3), and simulate vehicle arrival
      act(() => {
        fireEvent.click(addBtn);
      });
      act(() => {
        fireEvent.click(goldenTimeBtn);
      });
      act(() => {
        fireEvent.click(arrivalBtn);
      });

      // Initial 3 + 1 (walkin) + 3 (golden time) = 7 total teams
      expect(screen.getByText('7 건')).toBeDefined();
      expect(screen.getByText('7')).toBeDefined();
      expect(screen.getByText('35')).toBeDefined(); // 7 teams * 5 min = 35 min

      // Seat the first 2 teams rapidly
      const seatBtns = screen.getAllByRole('button', { name: /^착석$/i });
      act(() => {
        fireEvent.click(seatBtns[0]);
      });

      const updatedSeatBtns = screen.getAllByRole('button', { name: /^착석$/i });
      act(() => {
        fireEvent.click(updatedSeatBtns[0]);
      });

      // Queue is now 5 teams
      expect(screen.getByText('5 건')).toBeDefined();
      expect(screen.getByText('5')).toBeDefined();
      expect(screen.getByText('25')).toBeDefined();
    });

    it('5.2 Rapid tab switching under live STOMP message simulation does not corrupt filter view', async () => {
      await renderLoggedInPos();

      const tabMoving = screen.getByRole('button', { name: /이동 중/i });
      const tabArrived = screen.getByRole('button', { name: /도착팀/i });
      const tabCalled = screen.getByRole('button', { name: /호출팀/i });
      const tabAll = screen.getByRole('button', { name: /전체/i });

      // Alternate switching tabs while dispatching live STOMP events
      for (let i = 0; i < 5; i++) {
        fireEvent.click(tabMoving);
        act(() => {
          capturedStompHandler?.({
            type: 'ETA_UPDATE',
            waitingId: 'wait-102',
            etaMin: 1,
          });
        });

        fireEvent.click(tabArrived);
        fireEvent.click(tabCalled);
        fireEvent.click(tabAll);
      }

      // Final state: "전체" tab selected, all items visible
      expect(screen.getByText('3 건')).toBeDefined();
    });

    it('5.3 Verifies position invariants: re-indexes queue positions (1, 2, ..., N) after mid-queue removals', async () => {
      await renderLoggedInPos();

      // Baseline queue has tickets 12 (pos 1), 13 (pos 2), 14 (pos 3)
      expect(screen.getByText('다음 입장')).toBeDefined();
      expect(screen.getByText('2번째')).toBeDefined();
      expect(screen.getByText('3번째')).toBeDefined();

      // Seat the middle team (ticket 13)
      const seatBtns = screen.getAllByRole('button', { name: /^착석$/i });
      fireEvent.click(seatBtns[1]); // ticket 13

      // Remaining teams: ticket 12 (pos 1: 다음 입장), ticket 14 (now pos 2: 2번째)
      expect(screen.getByText('다음 입장')).toBeDefined();
      expect(screen.getByText('2번째')).toBeDefined();
      expect(screen.queryByText('3번째')).toBeNull();
    });

    it('5.4 Re-call debounce & state shift resilience: repeated calls update timestamp and badge', async () => {
      await renderLoggedInPos();

      // Initial call button for ticket 12 (exact regex to avoid matching StoreSummary "호출팀" tab)
      const callBtns = screen.getAllByRole('button', { name: /^호출$/i });
      fireEvent.click(callBtns[0]);

      // Call button immediately shifts to "재호출" with sub-tint styling
      const reCallBtn = screen.getByRole('button', { name: /^재호출$/i });
      expect(reCallBtn.className).toContain('bg-surface');

      // Click re-call 10 times consecutively
      for (let i = 0; i < 10; i++) {
        fireEvent.click(reCallBtn);
      }

      expect(screen.getByRole('button', { name: /^재호출$/i })).toBeDefined();
      expect(screen.getByText('호출됨')).toBeDefined();
    });
  });

  /* =========================================================================
   * Suite 6: Tablet Landscape Form Factor & Slot Arbitration (1024x768 to 1440x900)
   * ========================================================================= */
  describe('Suite 6: Tablet Landscape Form Factor & Slot Arbitration (1024x768 to 1440x900)', () => {
    const tabletViewports = [
      { name: '1024x768 (iPad Landscape Minimum)', width: 1024, height: 768 },
      { name: '1280x800 (Android Tablet Standard)', width: 1280, height: 800 },
      { name: '1440x900 (High-Resolution Tablet Landscape)', width: 1440, height: 900 },
    ];

    it.each(tabletViewports)(
      '6.1 Preserves 3-column architecture (Header 64px, Sidebar 280px, Board flex-1, Drawer 360px) at $name',
      ({ width, height }) => {
        window.innerWidth = width;
        window.innerHeight = height;

        const store = createMockStore();
        const { container, unmount } = render(
          <TabletLayout
            header={
              <Header
                store={store}
                isConnected={true}
                isDemoOpen={true}
                onToggleDemo={() => {}}
                onOpenSettings={() => {}}
                onLogout={() => {}}
              />
            }
            leftSidebar={<div data-testid="test-sidebar">Sidebar</div>}
            rightPanel={<div data-testid="test-panel">Right Panel</div>}
            isRightPanelOpen={true}
          >
            <div data-testid="test-main">Main Board</div>
          </TabletLayout>
        );

        // Header strictly 64px (h-16) shrink-0
        const header = container.querySelector('header');
        expect(header?.className).toContain('h-16');
        expect(header?.className).toContain('shrink-0');

        // Sidebar column strictly 280px (w-[280px]) shrink-0
        const sidebarCol = screen.getByTestId('test-sidebar').parentElement;
        expect(sidebarCol?.className).toContain('w-[280px]');
        expect(sidebarCol?.className).toContain('shrink-0');

        // Center main column flex-1 min-w-0
        const mainCol = screen.getByTestId('test-main').parentElement;
        expect(mainCol?.className).toContain('flex-1');
        expect(mainCol?.className).toContain('min-w-0');

        // Right contextual panel strictly 360px (w-[360px]) shrink-0
        const rightCol = screen.getByTestId('test-panel').parentElement;
        expect(rightCol?.className).toContain('w-[360px]');
        expect(rightCol?.className).toContain('shrink-0');

        unmount();
      }
    );

    it('6.2 Right contextual slot arbitration: cleanly switches between DemoPanel and TeamDetailDrawer', async () => {
      await renderLoggedInPos();

      // 1. Initial state: DemoPanel is rendered in right column
      expect(screen.getByText('시연 제어 패널')).toBeDefined();
      expect(screen.queryByText('대기 상세 정보')).toBeNull();

      // 2. Select card 12: TeamDetailDrawer replaces DemoPanel
      const card12 = screen.getAllByText('12')[0].closest('.cursor-pointer')!;
      fireEvent.click(card12);

      expect(screen.getByText('대기 상세 정보')).toBeDefined();
      expect(screen.queryByText('시연 제어 패널')).toBeNull();

      // 3. Close TeamDetailDrawer: DemoPanel is cleanly restored
      const closeDetailBtn = screen.getByRole('button', { name: /상세 닫기/i });
      fireEvent.click(closeDetailBtn);

      expect(screen.getByText('시연 제어 패널')).toBeDefined();
      expect(screen.queryByText('대기 상세 정보')).toBeNull();

      // 4. Header demo toggle button toggles DemoPanel off
      const demoToggleBtn = screen.getByRole('button', { name: /데모 컨트롤러 토글/i });
      fireEvent.click(demoToggleBtn);

      // Both DemoPanel and TeamDetailDrawer are now closed
      expect(screen.queryByText('시연 제어 패널')).toBeNull();
      expect(screen.queryByText('대기 상세 정보')).toBeNull();

      // 5. Selecting card 13 while DemoPanel was closed opens TeamDetailDrawer
      const card13 = screen.getAllByText('13')[0].closest('.cursor-pointer')!;
      fireEvent.click(card13);

      expect(screen.getByText('대기 상세 정보')).toBeDefined();

      // 6. Header demo toggle while drawer is open dismisses drawer and restores DemoPanel
      fireEvent.click(demoToggleBtn);
      expect(screen.getByText('시연 제어 패널')).toBeDefined();
      expect(screen.queryByText('대기 상세 정보')).toBeNull();
    });
  });
});
