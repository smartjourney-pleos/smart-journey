import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TeamDetailDrawer } from '../../src/components/detail/TeamDetailDrawer';
import { ConfirmDialog } from '../../src/components/dialogs/ConfirmDialog';
import type { WaitingTeam } from '../../src/types/pos';
import { createMockItem, renderLoggedInApp } from '../e2e/test-utils';

describe('Milestone M3 Forensic Integrity Stress Suite', () => {
  describe('1. TeamDetailDrawer (P-03) Forensic Verifications', () => {
    const mockVehicleTeam: WaitingTeam = {
      id: 'team-gv70-01',
      ticketNumber: 42,
      customerName: '홍길동',
      phone: '01012345678',
      partySize: 3,
      channel: 'VEHICLE',
      status: 'ARRIVED',
      vehicleModel: 'Genesis GV70',
      vehicleNumber: '123가 4567',
      etaMinutes: 0,
      distanceMeters: 1800,
      registeredAt: '12:05:00',
      alighting: {
        status: 'CONFIRMED',
        alightedCount: 3,
        totalPassengers: 3,
        lastSensorTime: '12:15:30',
      },
      timeline: [
        {
          id: 'evt-1',
          timestamp: '12:05:00',
          title: '원격 웨이팅 접수',
          description: '차량 내비에서 승인',
          type: 'INFO',
        },
        {
          id: 'evt-2',
          timestamp: '12:12:00',
          title: '현장 도착 감지',
          description: '주차 구역 진입',
          type: 'SUCCESS',
        },
        {
          id: 'evt-3',
          timestamp: '12:13:00',
          title: '하차 지연 주의',
          description: '도어 미개폐',
          type: 'WARNING',
        },
        {
          id: 'evt-4',
          timestamp: '12:14:00',
          title: '센서 이상 알림',
          description: '센서 점검 필요',
          type: 'ALERT',
        },
      ],
    };

    it('renders genuine customer profile and masked phone number (11-digit)', () => {
      render(
        <TeamDetailDrawer
          selectedTeam={mockVehicleTeam}
          onClose={() => {}}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      // Customer name and ticket number
      expect(screen.getByText('홍길동')).toBeDefined();
      expect(screen.getByText('42')).toBeDefined();
      // Masked phone number (010-****-5678)
      expect(screen.getByText('010-****-5678')).toBeDefined();
      // Party size with '명' unit
      expect(screen.getByText('3명')).toBeDefined();
      // Registration timestamp (rendered in profile and timeline)
      expect(screen.getAllByText('12:05:00').length).toBeGreaterThanOrEqual(1);
    });

    it('renders vehicle telemetry: model, plate, distance, and confirmed alighting', () => {
      render(
        <TeamDetailDrawer
          selectedTeam={mockVehicleTeam}
          onClose={() => {}}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      // Vehicle model and plate
      expect(screen.getByText(/Genesis GV70 · 123가 4567/)).toBeDefined();
      // Formatted distance (1800m -> 1.8 km)
      expect(screen.getByText('1.8 km')).toBeDefined();
      // ETA: 0 minutes -> '도착 완료'
      expect(screen.getByText('도착 완료')).toBeDefined();
      // Alighting sensor badge: '3/3명 하차 완료'
      expect(screen.getByText('3/3명 하차 완료')).toBeDefined();
    });

    it('renders walk-in team profile without vehicle telemetry', () => {
      const mockWalkInItem = createMockItem({
        id: 'walkin-99',
        ticketNo: 77,
        customerName: '박현장',
        phone: '01098765432',
        partySize: 2,
        channel: 'WALK_IN',
        status: 'REGISTERED',
      });

      render(
        <TeamDetailDrawer
          selectedTeam={mockWalkInItem}
          onClose={() => {}}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      expect(screen.getByText('박현장')).toBeDefined();
      expect(screen.getByText('77')).toBeDefined();
      expect(screen.getByText('010-****-5432')).toBeDefined();
      expect(screen.getByText('현장 방문 접수 (차량 연동 없음)')).toBeDefined();
    });

    it('renders all 4 timeline event node types (INFO, SUCCESS, WARNING, ALERT) with corresponding styling', () => {
      const { container } = render(
        <TeamDetailDrawer
          selectedTeam={mockVehicleTeam}
          onClose={() => {}}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      // Verify all 4 titles exist
      expect(screen.getByText('원격 웨이팅 접수')).toBeDefined();
      expect(screen.getByText('현장 도착 감지')).toBeDefined();
      expect(screen.getByText('하차 지연 주의')).toBeDefined();
      expect(screen.getByText('센서 이상 알림')).toBeDefined();

      // Check vertical connector line
      const connector = container.querySelector('.bg-slate-800.w-0\\.5');
      expect(connector).not.toBeNull();

      // Check node marker styling for all 4 types
      expect(container.querySelector('.border-emerald-500')).not.toBeNull();
      expect(container.querySelector('.border-amber-500')).not.toBeNull();
      expect(container.querySelector('.border-rose-500')).not.toBeNull();
      expect(container.querySelector('.border-blue-500')).not.toBeNull();
    });

    it('enforces strict touch target sizing (>= 48px) and .active-press on all interactive controls', () => {
      const { container } = render(
        <TeamDetailDrawer
          selectedTeam={mockVehicleTeam}
          onClose={() => {}}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      // Close button
      const closeBtn = screen.getByRole('button', { name: '상세 닫기' });
      expect(closeBtn.className).toContain('min-h-[48px]');
      expect(closeBtn.className).toContain('min-w-[48px]');
      expect(closeBtn.className).toContain('active-press');

      // Action buttons: call, seat, no-show
      const buttons = container.querySelectorAll('button');
      buttons.forEach((btn) => {
        expect(btn.className).toMatch(/min-h-\[48px\]|h-12/);
        expect(btn.className).toContain('active-press');
      });
    });

    it('triggers action callbacks on user click', () => {
      const onCall = vi.fn();
      const onSeat = vi.fn();
      const onNoShow = vi.fn();
      const onClose = vi.fn();

      render(
        <TeamDetailDrawer
          selectedTeam={mockVehicleTeam}
          onClose={onClose}
          onCall={onCall}
          onSeat={onSeat}
          onNoShow={onNoShow}
        />
      );

      // Close
      fireEvent.click(screen.getByRole('button', { name: '상세 닫기' }));
      expect(onClose).toHaveBeenCalledTimes(1);

      // Call
      fireEvent.click(screen.getByRole('button', { name: /호출/i }));
      expect(onCall).toHaveBeenCalledWith('team-gv70-01');

      // Seat
      fireEvent.click(screen.getByRole('button', { name: /착석/i }));
      expect(onSeat).toHaveBeenCalledWith('team-gv70-01');

      // No-show
      fireEvent.click(screen.getByRole('button', { name: /노쇼/i }));
      expect(onNoShow).toHaveBeenCalledWith('team-gv70-01');
    });
  });

  describe('2. ConfirmDialog (P-04) Forensic Verifications', () => {
    it('does not render when isOpen is false', () => {
      render(
        <ConfirmDialog
          isOpen={false}
          type="SEAT"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );
      expect(screen.queryByText('착석 완료 처리')).toBeNull();
    });

    it('renders SEAT confirmation with consequence warning and >= 48px touch targets', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <ConfirmDialog
          isOpen={true}
          type="SEAT"
          ticketNo={42}
          customerName="홍길동"
          partySize={3}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(screen.getByText('착석 완료 처리')).toBeDefined();
      expect(screen.getByText(/홍길동 고객님을 착석 완료 처리하시겠습니까/)).toBeDefined();
      expect(
        screen.getByText(/고객 차량에 착석 완료 알림이 전송되며, 대기 목록에서 즉시 완료 처리됩니다/)
      ).toBeDefined();

      const cancelBtn = screen.getByRole('button', { name: '취소' });
      const confirmBtn = screen.getByRole('button', { name: '착석 완료' });

      expect(cancelBtn.className).toContain('min-h-[48px]');
      expect(cancelBtn.className).toContain('active-press');
      expect(confirmBtn.className).toContain('min-h-[48px]');
      expect(confirmBtn.className).toContain('active-press');

      // Click confirm
      fireEvent.click(confirmBtn);
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('renders NO_SHOW confirmation with consequence warning and handles ESC dismiss', () => {
      const onCancel = vi.fn();

      render(
        <ConfirmDialog
          isOpen={true}
          type="NO_SHOW"
          ticketNo={42}
          customerName="홍길동"
          onConfirm={() => {}}
          onCancel={onCancel}
        />
      );

      expect(screen.getByText('노쇼(미방문) 처리')).toBeDefined();
      expect(
        screen.getByText(/대기 번호표가 즉시 파기되며 대기열에서 영구 제외됩니다/)
      ).toBeDefined();

      // Press Escape key
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('dismisses when clicking outside modal backdrop', () => {
      const onCancel = vi.fn();
      const { container } = render(
        <ConfirmDialog
          isOpen={true}
          type="SEAT"
          onConfirm={() => {}}
          onCancel={onCancel}
        />
      );

      const backdrop = container.querySelector('.fixed.inset-0');
      expect(backdrop).not.toBeNull();
      fireEvent.click(backdrop!);
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('3. App Integration & STOMP State Merging', () => {
    it('mounts TeamDetailDrawer when a queue card is selected in App', async () => {
      await renderLoggedInApp();

      // Find first queue card and click it to select
      const card = screen.getByText('12').closest('[role="button"]') || screen.getByText('12');
      fireEvent.click(card);

      // TeamDetailDrawer should now be visible in the 360px right panel
      expect(screen.getByText('대기 상세 정보')).toBeDefined();
      expect(screen.getByRole('button', { name: '상세 닫기' })).toBeDefined();
    });

    it('triggers ConfirmDialog from TeamDetailDrawer seat button and executes seat upon confirm', async () => {
      await renderLoggedInApp();

      // Select ticket 12
      const card = screen.getByText('12');
      fireEvent.click(card);

      // Detail drawer should be mounted
      expect(screen.getByText('대기 상세 정보')).toBeDefined();

      // Click seat in detail drawer (located inside the drawer action bar)
      const detailDrawer = screen.getByText('대기 상세 정보').closest('aside');
      expect(detailDrawer).not.toBeNull();

      const seatBtnInDrawer = detailDrawer!.querySelector('button.bg-emerald-600') as HTMLButtonElement;
      expect(seatBtnInDrawer).not.toBeNull();
      fireEvent.click(seatBtnInDrawer);

      // Confirm dialog must appear
      expect(screen.getByText('착석 완료 처리')).toBeDefined();

      // Click confirm button
      const confirmBtn = screen.getByRole('button', { name: '착석 완료' });
      fireEvent.click(confirmBtn);

      // Ticket 12 should now be removed from queue
      expect(screen.queryByText('12')).toBeNull();
    });
  });
});
