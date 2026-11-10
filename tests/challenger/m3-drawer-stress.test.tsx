import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { TeamDetailDrawer } from '../../src/components/detail/TeamDetailDrawer';
import { ConfirmDialog } from '../../src/components/dialogs/ConfirmDialog';
import type {
  WaitingTeam,
  TimelineEvent,
} from '../../src/types/pos';
import { createMockItem, renderLoggedInApp } from '../e2e/test-utils';

describe('Milestone M3 Empirical Challenger Stress Suite: Detail Drawer, Telemetry & Touch Safety', () => {
  describe('1. Card Selection and Mounting Synchronization', () => {
    it('empirically verifies card selection in full App reliably mounts TeamDetailDrawer with matching ticket, name, and party size (명)', async () => {
      await renderLoggedInApp();

      // Initially ticket 12, 13, 14 are in the queue.
      // DemoPanel is open by default, TeamDetailDrawer is not mounted.
      expect(screen.queryByText('대기 상세 정보')).toBeNull();

      // Click card 12 on QueueBoard
      const card12 = screen.getByText('12').closest('div[class*="rounded-2xl"]');
      expect(card12).not.toBeNull();
      fireEvent.click(card12!);

      // Detail drawer mounts!
      const drawer = screen.getByText('대기 상세 정보').closest('aside')!;
      expect(drawer).not.toBeNull();
      expect(within(drawer).getByText('No.')).toBeDefined();

      // Drawer has large ticket number 12, customer name, and party size with '명'
      expect(within(drawer).getByText('12')).toBeDefined();
      expect(within(drawer).getByText('김*수 (Pleos Connect)')).toBeDefined();
      expect(within(drawer).getByText('4명')).toBeDefined();
      expect(within(drawer).getByText('다음 입장')).toBeDefined();
    });

    it('empirically verifies switching between cards smoothly updates drawer contents to the target team', async () => {
      await renderLoggedInApp();

      // Select Card 12
      const card12 = screen.getByText('12').closest('div[class*="rounded-2xl"]');
      fireEvent.click(card12!);
      let drawer = screen.getByText('대기 상세 정보').closest('aside')!;
      expect(within(drawer).getByText('12')).toBeDefined();
      expect(within(drawer).getByText('4명')).toBeDefined();

      // Select Card 13 (2명, position 2)
      const card13 = screen.getByText('13').closest('div[class*="rounded-2xl"]');
      fireEvent.click(card13!);

      // Now drawer reflects ticket 13
      drawer = screen.getByText('대기 상세 정보').closest('aside')!;
      expect(within(drawer).getByText('13')).toBeDefined();
      expect(within(drawer).getByText('2명')).toBeDefined();
      expect(within(drawer).getByText('2번째')).toBeDefined();
    });

    it('empirically verifies clicking the already selected card toggles/closes the drawer', async () => {
      await renderLoggedInApp();

      const card12 = screen.getByText('12').closest('div[class*="rounded-2xl"]');
      // 1st click -> opens drawer
      fireEvent.click(card12!);
      expect(screen.getByText('대기 상세 정보')).toBeDefined();

      // 2nd click on same card -> closes drawer and restores DemoPanel
      fireEvent.click(card12!);
      expect(screen.queryByText('대기 상세 정보')).toBeNull();
    });

    it('empirically verifies close button (aria-label="상세 닫기") unmounts drawer and restores DemoPanel', async () => {
      await renderLoggedInApp();

      const card12 = screen.getByText('12').closest('div[class*="rounded-2xl"]');
      fireEvent.click(card12!);
      expect(screen.getByText('대기 상세 정보')).toBeDefined();

      // Click close button
      const closeBtn = screen.getByRole('button', { name: '상세 닫기' });
      fireEvent.click(closeBtn);

      expect(screen.queryByText('대기 상세 정보')).toBeNull();
    });

    it('mounts TeamDetailDrawer directly with WaitingTeam domain interface (ticketNumber, phone masking, customerName)', () => {
      const waitingTeam: WaitingTeam = {
        id: 'team-spec-1',
        ticketNumber: 42,
        customerName: '홍길동',
        phone: '01012345678',
        partySize: 6,
        channel: 'VEHICLE',
        status: 'MOVING',
        vehicleModel: 'Genesis GV80',
        vehicleNumber: '99가 8888',
        etaMinutes: 8,
        distanceMeters: 4500,
        alighting: {
          status: 'NONE',
          alightedCount: 0,
          totalPassengers: 6,
        },
        registeredAt: '11:45:00',
        timeline: [],
      };

      render(
        <TeamDetailDrawer
          selectedTeam={waitingTeam}
          onClose={() => {}}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      expect(screen.getByText('대기 상세 정보')).toBeDefined();
      expect(screen.getByText('42')).toBeDefined();
      expect(screen.getByText('홍길동')).toBeDefined();
      expect(screen.getByText('010-****-5678')).toBeDefined();
      expect(screen.getByText('6명')).toBeDefined();
      expect(screen.getByText('Genesis GV80 · 99가 8888')).toBeDefined();
      expect(screen.getByText('4.5 km')).toBeDefined();
      expect(screen.getByText('약 8분')).toBeDefined();
    });

    it('empirically tests phone masking helper across 11-digit, 10-digit, pre-masked, and undefined values', () => {
      const testCases = [
        { phone: '01099998888', expected: '010-****-8888' },
        { phone: '0101234567', expected: '010-***-4567' },
        { phone: '010-****-0000', expected: '010-****-0000' },
        { phone: undefined, expected: '010-****-1234' },
      ];

      for (const tc of testCases) {
        const item = createMockItem({
          id: `phone-test-${tc.phone || 'def'}`,
          phone: tc.phone,
          customerName: '테스트고객',
        });

        const { unmount } = render(
          <TeamDetailDrawer
            selectedTeam={item}
            onClose={() => {}}
            onCall={() => {}}
            onSeat={() => {}}
            onNoShow={() => {}}
          />
        );

        expect(screen.getByText(tc.expected)).toBeDefined();
        unmount();
      }
    });

    it('empirically verifies party size formatting strictly appends "명" across boundary sizes (1, 2, 8, 25)', () => {
      const partySizes = [1, 2, 8, 25];

      for (const p of partySizes) {
        const item = createMockItem({
          id: `party-test-${p}`,
          partySize: p,
        });

        const { unmount } = render(
          <TeamDetailDrawer
            selectedTeam={item}
            onClose={() => {}}
            onCall={() => {}}
            onSeat={() => {}}
            onNoShow={() => {}}
          />
        );

        expect(screen.getByText(`${p}명`)).toBeDefined();
        unmount();
      }
    });

    it('empirically verifies position indicator formatting (position 1 -> 다음 입장, position > 1 -> N번째)', () => {
      const itemPos1 = createMockItem({ id: 'pos-1', position: 1 });
      const { unmount: unmount1 } = render(
        <TeamDetailDrawer
          selectedTeam={itemPos1}
          onClose={() => {}}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );
      expect(screen.getByText('다음 입장')).toBeDefined();
      unmount1();

      const itemPos5 = createMockItem({ id: 'pos-5', position: 5 });
      const { unmount: unmount5 } = render(
        <TeamDetailDrawer
          selectedTeam={itemPos5}
          onClose={() => {}}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );
      expect(screen.getByText('5번째')).toBeDefined();
      unmount5();
    });
  });

  describe('2. Telemetry Edge Cases & Channel Resilience', () => {
    it('empirically verifies channel === WALK_IN displays walk-in notice and never crashes with missing vehicle telemetry', () => {
      const walkInItem = createMockItem({
        id: 'walkin-edge',
        ticketNo: 77,
        channel: 'WALK_IN',
        vehicleModel: undefined,
        vehicleNumber: undefined,
        distanceMeters: undefined,
        arrivalResult: null,
        alighted: null,
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

      // Header indicates general walk-in
      expect(screen.getByText('일반 현장')).toBeDefined();
      // Body displays walk-in notice
      expect(screen.getByText('현장 방문 접수 (차량 연동 없음)')).toBeDefined();
      // Vehicle telemetry box is NOT rendered
      expect(screen.queryByText('차량 및 주행 텔레메트리')).toBeNull();
      // Customer name fallback defaults to 현장 접수
      expect(screen.getByText('이*민 (현장 접수)')).toBeDefined();
    });

    it('empirically verifies etaMin <= 0 displays "도착 완료" across negative and zero boundaries', () => {
      const etaBoundaries = [0, -1, -10, -99];

      for (const eta of etaBoundaries) {
        const item = createMockItem({
          id: `eta-bound-${eta}`,
          channel: 'VEHICLE',
          etaMin: eta,
        });

        const { unmount } = render(
          <TeamDetailDrawer
            selectedTeam={item}
            onClose={() => {}}
            onCall={() => {}}
            onSeat={() => {}}
            onNoShow={() => {}}
          />
        );

        expect(screen.getByText('도착 완료')).toBeDefined();
        unmount();
      }
    });

    it('empirically verifies etaMin > 0 displays "약 N분"', () => {
      const item = createMockItem({
        id: 'eta-positive',
        channel: 'VEHICLE',
        etaMin: 14,
      });

      render(
        <TeamDetailDrawer
          selectedTeam={item}
          onClose={() => {}}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      expect(screen.getByText('약 14분')).toBeDefined();
    });

    it('empirically verifies Passenger Alighting State 1: CONFIRMED renders emerald badge, ping dot, and 3 checklists', () => {
      const item = createMockItem({
        id: 'alight-confirmed',
        channel: 'VEHICLE',
        partySize: 4,
        arrivalResult: 'CONFIRMED',
        alighted: 4,
        alighting: {
          status: 'CONFIRMED',
          alightedCount: 4,
          totalPassengers: 4,
        },
      });

      render(
        <TeamDetailDrawer
          selectedTeam={item}
          onClose={() => {}}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      expect(screen.getByText('4/4명 하차 완료')).toBeDefined();
      expect(screen.getByText('매장 주차 구역 도착 확인 (GPS)')).toBeDefined();
      expect(screen.getByText('차량 정차 및 도어 개폐 센서 감지')).toBeDefined();
      expect(screen.getByText('승차 인원 전원 하차 확인')).toBeDefined();
    });

    it('empirically verifies Passenger Alighting State 2: MANUAL renders slate shield notice "고객 직접 확인 필요 (수동 보고)"', () => {
      const item = createMockItem({
        id: 'alight-manual',
        channel: 'VEHICLE',
        arrivalResult: 'MANUAL',
      });

      render(
        <TeamDetailDrawer
          selectedTeam={item}
          onClose={() => {}}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      expect(screen.getByText('고객 직접 확인 필요 (수동 보고)')).toBeDefined();
      expect(screen.queryByText('승차 인원 전원 하차 확인')).toBeNull();
    });

    it('empirically verifies Passenger Alighting State 3: UNCONFIRMED / PARTIAL renders amber warning "인원 미확인"', () => {
      const item = createMockItem({
        id: 'alight-unconfirmed',
        channel: 'VEHICLE',
        arrivalResult: 'UNCONFIRMED',
        alighting: {
          status: 'PARTIAL',
          alightedCount: 1,
          totalPassengers: 4,
        },
      });

      render(
        <TeamDetailDrawer
          selectedTeam={item}
          onClose={() => {}}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      expect(screen.getByText('인원 미확인')).toBeDefined();
    });
  });

  describe('3. Chronological Timeline Rendering & Severity Dot Stress', () => {
    it('empirically verifies empty timeline [] triggers automatic sequence synthesis based on vehicle & status', () => {
      // 1. Vehicle Registered team
      const regTeam = createMockItem({
        id: 'timeline-reg',
        channel: 'VEHICLE',
        status: 'REGISTERED',
        registeredAt: '12:00:00',
        etaMin: 10,
        timeline: [],
      });

      const { unmount: unmount1 } = render(
        <TeamDetailDrawer
          selectedTeam={regTeam}
          onClose={() => {}}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      expect(screen.getByText('원격 웨이팅 접수')).toBeDefined();
      expect(screen.getByText('ETA 실시간 갱신')).toBeDefined();
      expect(screen.getByText(/도착 예정 10분/)).toBeDefined();
      unmount1();

      // 2. Arrived vehicle team
      const arrTeam = createMockItem({
        id: 'timeline-arr',
        channel: 'VEHICLE',
        status: 'ARRIVED',
        arrivalResult: 'CONFIRMED',
        alighted: 4,
        partySize: 4,
        timeline: [],
      });

      const { unmount: unmount2 } = render(
        <TeamDetailDrawer
          selectedTeam={arrTeam}
          onClose={() => {}}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      expect(screen.getByText('차량 현장 도착 감지')).toBeDefined();
      expect(screen.getByText('승차 인원 하차 센서 확인')).toBeDefined();
      unmount2();

      // 3. Called team
      const calledTeam = createMockItem({
        id: 'timeline-called',
        status: 'CALLED',
        calledAt: '12:15:30',
        timeline: [],
      });

      const { unmount: unmount3 } = render(
        <TeamDetailDrawer
          selectedTeam={calledTeam}
          onClose={() => {}}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      expect(screen.getByText('매장 점주 고객 호출')).toBeDefined();
      expect(screen.getByText('12:15:30')).toBeDefined();
      unmount3();

      // 4. Seated team
      const seatedTeam = createMockItem({
        id: 'timeline-seated',
        status: 'SEATED',
        seatedAt: '12:20:00',
        timeline: [],
      });

      const { unmount: unmount4 } = render(
        <TeamDetailDrawer
          selectedTeam={seatedTeam}
          onClose={() => {}}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      expect(screen.getByText('테이블 착석 완료')).toBeDefined();
      expect(screen.getByText('12:20:00')).toBeDefined();
      unmount4();
    });

    it('empirically verifies empty timeline synthesis for WALK_IN team uses "현장 태블릿 접수"', () => {
      const walkIn = createMockItem({
        id: 'timeline-walkin',
        channel: 'WALK_IN',
        status: 'REGISTERED',
        registeredAt: '13:00:00',
        timeline: [],
      });

      render(
        <TeamDetailDrawer
          selectedTeam={walkIn}
          onClose={() => {}}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      expect(screen.getByText('현장 태블릿 접수')).toBeDefined();
      expect(screen.queryByText('ETA 실시간 갱신')).toBeNull();
    });

    it('empirically verifies all 4 severity dot marker types (INFO, SUCCESS, WARNING, ALERT) are distinctly styled', () => {
      const explicitTimeline: TimelineEvent[] = [
        {
          id: 'evt-info',
          timestamp: '12:00:00',
          title: '정보 이벤트',
          description: '정보 알림 내용',
          type: 'INFO',
        },
        {
          id: 'evt-success',
          timestamp: '12:05:00',
          title: '성공 이벤트',
          description: '성공 처리 내용',
          type: 'SUCCESS',
        },
        {
          id: 'evt-warning',
          timestamp: '12:10:00',
          title: '경고 이벤트',
          description: '경고 발생 내용',
          type: 'WARNING',
        },
        {
          id: 'evt-alert',
          timestamp: '12:15:00',
          title: '위험 경보 이벤트',
          description: '위험 경보 감지 내용',
          type: 'ALERT',
        },
      ];

      const item = createMockItem({
        id: 'timeline-all-severities',
        timeline: explicitTimeline,
      });

      const { container } = render(
        <TeamDetailDrawer
          selectedTeam={item}
          onClose={() => {}}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      // Verify all 4 titles and descriptions render
      expect(screen.getByText('정보 이벤트')).toBeDefined();
      expect(screen.getByText('성공 이벤트')).toBeDefined();
      expect(screen.getByText('경고 이벤트')).toBeDefined();
      expect(screen.getByText('위험 경보 이벤트')).toBeDefined();

      // Verify marker classes exist in container
      expect(container.querySelector('.border-blue-500')).not.toBeNull();
      expect(container.querySelector('.bg-blue-400')).not.toBeNull();

      expect(container.querySelector('.border-emerald-500')).not.toBeNull();
      expect(container.querySelector('.bg-emerald-400')).not.toBeNull();

      expect(container.querySelector('.border-amber-500')).not.toBeNull();
      expect(container.querySelector('.bg-amber-400')).not.toBeNull();

      expect(container.querySelector('.border-rose-500')).not.toBeNull();
      expect(container.querySelector('.bg-rose-400')).not.toBeNull();
    });

    it('empirically verifies stress test with 15+ chronological timeline entries renders cleanly without layout disruption', () => {
      const largeTimeline: TimelineEvent[] = Array.from({ length: 16 }, (_, i) => ({
        id: `stress-evt-${i}`,
        timestamp: `12:${i < 10 ? '0' + i : i}:00`,
        title: `감사 기록 Step #${i + 1}`,
        description: `진행 단계 ${i + 1} 상세 감사 로그 텍스트`,
        type: i % 4 === 0 ? 'INFO' : i % 4 === 1 ? 'SUCCESS' : i % 4 === 2 ? 'WARNING' : 'ALERT',
      }));

      const item = createMockItem({
        id: 'large-timeline-team',
        timeline: largeTimeline,
      });

      render(
        <TeamDetailDrawer
          selectedTeam={item}
          onClose={() => {}}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      expect(screen.getByText('감사 기록 Step #1')).toBeDefined();
      expect(screen.getByText('감사 기록 Step #16')).toBeDefined();
      expect(screen.getAllByText(/감사 기록 Step #/).length).toBe(16);
    });
  });

  describe('4. Touch Targets Strictly >= 48px on All Interactive Drawer Elements', () => {
    it('empirically verifies all buttons in TeamDetailDrawer (Close, Call, Seat, NoShow) have min-h-[48px] and h-12', () => {
      const item = createMockItem({ id: 'touch-test-team', status: 'REGISTERED' });

      render(
        <TeamDetailDrawer
          selectedTeam={item}
          onClose={() => {}}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      // Close button
      const closeBtn = screen.getByRole('button', { name: '상세 닫기' });
      expect(closeBtn.className).toContain('min-h-[48px]');
      expect(closeBtn.className).toContain('h-12');
      expect(closeBtn.className).toContain('w-12');
      expect(closeBtn.className).toContain('min-w-[48px]');
      expect(closeBtn.className).toContain('active-press');

      // Call button
      const callBtn = screen.getByRole('button', { name: /호출/i });
      expect(callBtn.className).toContain('min-h-[48px]');
      expect(callBtn.className).toContain('h-12');
      expect(callBtn.className).toContain('touch-manipulation');
      expect(callBtn.className).toContain('active-press');

      // Seat button
      const seatBtn = screen.getByRole('button', { name: /착석/i });
      expect(seatBtn.className).toContain('min-h-[48px]');
      expect(seatBtn.className).toContain('h-12');
      expect(seatBtn.className).toContain('touch-manipulation');
      expect(seatBtn.className).toContain('active-press');

      // NoShow button
      const noShowBtn = screen.getByRole('button', { name: /노쇼/i });
      expect(noShowBtn.className).toContain('min-h-[48px]');
      expect(noShowBtn.className).toContain('h-12');
      expect(noShowBtn.className).toContain('touch-manipulation');
      expect(noShowBtn.className).toContain('active-press');
    });

    it('empirically verifies ConfirmDialog buttons (Close, Cancel, Confirm) strictly satisfy min-h-[48px] and h-12', () => {
      render(
        <ConfirmDialog
          isOpen={true}
          type="SEAT"
          ticketNo={12}
          customerName="김*수"
          partySize={4}
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      );

      // Close button
      const closeBtn = screen.getByRole('button', { name: '닫기' });
      expect(closeBtn.className).toContain('min-h-[48px]');
      expect(closeBtn.className).toContain('min-w-[48px]');
      expect(closeBtn.className).toContain('h-12');
      expect(closeBtn.className).toContain('w-12');

      // Cancel button
      const cancelBtn = screen.getByRole('button', { name: '취소' });
      expect(cancelBtn.className).toContain('min-h-[48px]');
      expect(cancelBtn.className).toContain('h-12');
      expect(cancelBtn.className).toContain('touch-manipulation');

      // Confirm button
      const confirmBtn = screen.getByRole('button', { name: '착석 완료' });
      expect(confirmBtn.className).toContain('min-h-[48px]');
      expect(confirmBtn.className).toContain('h-12');
      expect(confirmBtn.className).toContain('touch-manipulation');
    });
  });

  describe('5. Drawer Action Workflow & Safe Confirmation Dialog Lifecycle', () => {
    it('empirically verifies calling a team from drawer transitions button to "재호출"', async () => {
      await renderLoggedInApp();

      // Select Card 13 (currently REGISTERED)
      const card13 = screen.getByText('13').closest('div[class*="rounded-2xl"]');
      fireEvent.click(card13!);

      const drawer = screen.getByText('대기 상세 정보').closest('aside')!;
      // Inside drawer, click "호출"
      const drawerCallBtn = within(drawer).getByRole('button', { name: /^호출$/i });
      fireEvent.click(drawerCallBtn);

      // Drawer call button becomes "재호출" with amber styling
      const reCallBtn = within(drawer).getByRole('button', { name: /재호출/i });
      expect(reCallBtn).toBeDefined();
    });

    it('empirically verifies clicking "착석" in drawer intercepts with ConfirmDialog and cancels safely', async () => {
      await renderLoggedInApp();

      // Select Card 12
      const card12 = screen.getByText('12').closest('div[class*="rounded-2xl"]');
      fireEvent.click(card12!);

      const drawer = screen.getByText('대기 상세 정보').closest('aside')!;
      // In drawer, click "착석"
      const drawerSeatBtn = within(drawer).getByRole('button', { name: /^착석$/i });
      fireEvent.click(drawerSeatBtn);

      // ConfirmDialog is opened!
      const modal = screen.getByText('착석 완료 처리').closest('div[class*="fixed inset-0"]')!;
      expect(modal).not.toBeNull();
      expect(within(modal).getByText(/고객 차량에 착석 완료 알림이 전송되며/)).toBeDefined();

      // Click "취소"
      const cancelBtn = within(modal).getByRole('button', { name: '취소' });
      fireEvent.click(cancelBtn);

      // Modal closed, team 12 still present in queue and drawer still open
      expect(screen.queryByText('착석 완료 처리')).toBeNull();
      expect(screen.getByText('대기 상세 정보')).toBeDefined();
      expect(within(drawer).getByText('12')).toBeDefined();
    });

    it('empirically verifies confirming "착석 완료" in ConfirmDialog seats team, clears drawer, and updates queue', async () => {
      await renderLoggedInApp();

      // Select Card 12
      const card12 = screen.getByText('12').closest('div[class*="rounded-2xl"]');
      fireEvent.click(card12!);

      const drawer = screen.getByText('대기 상세 정보').closest('aside')!;
      // In drawer, click "착석"
      const drawerSeatBtn = within(drawer).getByRole('button', { name: /^착석$/i });
      fireEvent.click(drawerSeatBtn);

      // In modal, click "착석 완료"
      const modal = screen.getByText('착석 완료 처리').closest('div[class*="fixed inset-0"]')!;
      const confirmBtn = within(modal).getByRole('button', { name: '착석 완료' });
      fireEvent.click(confirmBtn);

      // Team 12 is seated -> drawer is unmounted, modal is closed, 12 is removed from queue
      expect(screen.queryByText('착석 완료 처리')).toBeNull();
      expect(screen.queryByText('대기 상세 정보')).toBeNull();
      expect(screen.queryByText('12')).toBeNull();
    });

    it('empirically verifies clicking "노쇼" in drawer intercepts with ConfirmDialog displaying permanent removal warning', async () => {
      await renderLoggedInApp();

      // Select Card 13
      const card13 = screen.getByText('13').closest('div[class*="rounded-2xl"]');
      fireEvent.click(card13!);

      const drawer = screen.getByText('대기 상세 정보').closest('aside')!;
      // In drawer, click "노쇼"
      const drawerNoShowBtn = within(drawer).getByRole('button', { name: /^노쇼$/i });
      fireEvent.click(drawerNoShowBtn);

      // ConfirmDialog opens with No-Show copy
      const modal = screen.getByText('노쇼(미방문) 처리').closest('div[class*="fixed inset-0"]')!;
      expect(modal).not.toBeNull();
      expect(within(modal).getByText(/대기 번호표가 즉시 파기되며 대기열에서 영구 제외됩니다/)).toBeDefined();

      // Confirm NoShow
      const confirmBtn = within(modal).getByRole('button', { name: '노쇼 처리' });
      fireEvent.click(confirmBtn);

      // Ticket 13 is removed from queue, drawer closed
      expect(screen.queryByText('13')).toBeNull();
      expect(screen.queryByText('노쇼(미방문) 처리')).toBeNull();
      expect(screen.queryByText('대기 상세 정보')).toBeNull();
    });

    it('empirically verifies ConfirmDialog dismisses on Escape key and on backdrop click', () => {
      const onCancel = vi.fn();
      render(
        <ConfirmDialog
          isOpen={true}
          type="SEAT"
          onConfirm={() => {}}
          onCancel={onCancel}
        />
      );

      // Press Escape
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onCancel).toHaveBeenCalledTimes(1);

      // Click backdrop
      const backdrop = screen.getByText('착석 완료 처리').closest('div[class*="fixed inset-0"]');
      expect(backdrop).not.toBeNull();
      fireEvent.click(backdrop!);
      expect(onCancel).toHaveBeenCalledTimes(2);
    });
  });
});
