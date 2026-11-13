import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WaitingCard } from '../../src/components/queue/WaitingCard';
import { StoreSummary } from '../../src/components/sidebar/StoreSummary';
import { QueueBoard } from '../../src/components/queue/QueueBoard';
import type { WaitingItem } from '../../src/types/pos';
import { createMockItem } from '../e2e/test-utils';

describe('Milestone M2 Challenger 2 Empirical Stress Suite: Touch Targets, Micro-Interactions, Badges & Collisions', () => {
  describe('1. Touch Target Geometry & Ergonomics Verification', () => {
    it('empirically verifies every action button on WaitingCard has min-h-[48px] and touch-manipulation', () => {
      const item = createMockItem({ id: 'touch-geom-1', status: 'REGISTERED' });
      render(
        <WaitingCard
          item={item}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      const actionButtons = [
        screen.getByRole('button', { name: /호출/i }),
        screen.getByRole('button', { name: /착석/i }),
        screen.getByRole('button', { name: /노쇼/i }),
      ];

      for (const btn of actionButtons) {
        expect(btn.className).toContain('min-h-[48px]');
        expect(btn.className).toContain('touch-manipulation');
        expect(btn.className).toContain('cursor-pointer');
        expect(btn.className).toContain('active-press');
        expect(btn.className).toContain('select-none');
        expect(btn.className).toContain('rounded-md');
      }
    });

    it('empirically verifies action button clicks stop propagation to card selection', () => {
      const onSelect = vi.fn();
      const onCall = vi.fn();
      const onSeat = vi.fn();
      const onNoShow = vi.fn();

      const item = createMockItem({ id: 'card-prop-1', status: 'REGISTERED' });
      render(
        <WaitingCard
          item={item}
          onCall={onCall}
          onSeat={onSeat}
          onNoShow={onNoShow}
          onSelect={onSelect}
        />
      );

      const callBtn = screen.getByRole('button', { name: /호출/i });
      const seatBtn = screen.getByRole('button', { name: /착석/i });
      const noShowBtn = screen.getByRole('button', { name: /노쇼/i });

      // Click each action button
      fireEvent.click(callBtn);
      expect(onCall).toHaveBeenCalledWith('card-prop-1');
      expect(onSelect).not.toHaveBeenCalled();

      fireEvent.click(seatBtn);
      expect(onSeat).toHaveBeenCalledWith('card-prop-1');
      expect(onSelect).not.toHaveBeenCalled();

      fireEvent.click(noShowBtn);
      expect(onNoShow).toHaveBeenCalledWith('card-prop-1');
      expect(onSelect).not.toHaveBeenCalled();

      // Click card body directly
      const cardContainer = callBtn.closest('.rounded-lg') as HTMLElement;
      expect(cardContainer).not.toBeNull();
      fireEvent.click(cardContainer);
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith('card-prop-1');
    });

    it('empirically verifies filter tab buttons apply .active-press and touch-manipulation', () => {
      const queue = [createMockItem({ id: 'f-1' })];
      const onFilterChange = vi.fn();

      render(
        <StoreSummary
          aheadTeams={1}
          estimatedWaitMin={5}
          queue={queue}
          currentFilter="ALL"
          onFilterChange={onFilterChange}
        />
      );

      const tabs = ['전체', '이동 중', '도착팀', '호출팀'];
      for (const tabLabel of tabs) {
        const btn = screen.getByRole('button', { name: new RegExp(tabLabel) });
        expect(btn.className).toContain('min-h-[48px]');
        expect(btn.className).toContain('h-12');
        expect(btn.className).toContain('active-press');
        expect(btn.className).toContain('touch-manipulation');
        expect(btn.className).toContain('cursor-pointer');
        expect(btn.className).toContain('select-none');
        expect(btn.className).toContain('rounded-md');
      }
    });
  });

  describe('2. Badge & Telemetry Accuracy Verification', () => {
    it('empirically verifies channel badge: "🚗 차량 인증" vs "일반 현장"', () => {
      const vehicleItem = createMockItem({ id: 'v-1', channel: 'VEHICLE' });
      const walkInItem = createMockItem({ id: 'w-1', channel: 'WALK_IN' });

      const { rerender } = render(
        <WaitingCard
          item={vehicleItem}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      expect(screen.getByText(/차량 인증/i)).toBeDefined();
      expect(screen.queryByText(/일반 현장/i)).toBeNull();

      rerender(
        <WaitingCard
          item={walkInItem}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      expect(screen.getByText(/일반 현장/i)).toBeDefined();
      expect(screen.queryByText(/차량 인증/i)).toBeNull();
    });

    it('empirically verifies WALK_IN orders never render vehicle arrival or alighting badges', () => {
      // Even if hostile or malformed payload injects arrivalResult or alighting to WALK_IN
      const walkInWithAlighting = createMockItem({
        id: 'w-hostile',
        channel: 'WALK_IN',
        arrivalResult: 'CONFIRMED',
        alighted: 4,
        partySize: 4,
        alighting: { status: 'CONFIRMED', alightedCount: 4, totalPassengers: 4 },
      });

      render(
        <WaitingCard
          item={walkInWithAlighting}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      expect(screen.queryByText(/하차 완료/)).toBeNull();
      expect(screen.queryByText(/고객 직접 확인 필요/)).toBeNull();
      expect(screen.queryByText(/인원 미확인/)).toBeNull();
    });

    it('empirically verifies M/N명 하차 완료 telemetry badge accuracy and zero count handling', () => {
      // Test cases with diverse M/N counts
      const cases = [
        { count: 1, total: 1, expected: '1/1명 하차 완료' },
        { count: 2, total: 4, expected: '2/4명 하차 완료' },
        { count: 0, total: 3, expected: '0/3명 하차 완료' },
        { count: 6, total: 6, expected: '6/6명 하차 완료' },
      ];

      for (const c of cases) {
        const item = createMockItem({
          id: `case-${c.count}-${c.total}`,
          channel: 'VEHICLE',
          partySize: c.total,
          alighted: c.count,
          arrivalResult: 'CONFIRMED',
          alighting: {
            status: 'CONFIRMED',
            alightedCount: c.count,
            totalPassengers: c.total,
          },
        });

        const { unmount } = render(
          <WaitingCard
            item={item}
            onCall={() => {}}
            onSeat={() => {}}
            onNoShow={() => {}}
          />
        );

        expect(screen.getByText(c.expected)).toBeDefined();
        // Status is carried by the tinted badge, not by a pulsing dot
        expect(document.querySelector('.animate-ping')).toBeNull();
        unmount();
      }
    });

    it('empirically verifies fallback when alightedCount is null but partySize exists', () => {
      const item = createMockItem({
        id: 'fallback-party',
        channel: 'VEHICLE',
        partySize: 5,
        alighted: null,
        arrivalResult: 'CONFIRMED',
        alighting: undefined,
      });

      render(
        <WaitingCard
          item={item}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      expect(screen.getByText('5/5명 하차 완료')).toBeDefined();
    });

    it('empirically verifies status badge transitions: 이동 중, 현장 도착, 호출됨', () => {
      const movingItem = createMockItem({ id: 's-1', status: 'MOVING' });
      const arrivedItem = createMockItem({ id: 's-2', status: 'ARRIVED' });
      const calledItem = createMockItem({ id: 's-3', status: 'CALLED' });

      const { rerender } = render(
        <WaitingCard
          item={movingItem}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );
      expect(screen.getByText('이동 중')).toBeDefined();

      rerender(
        <WaitingCard
          item={arrivedItem}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );
      expect(screen.getByText('현장 도착')).toBeDefined();

      rerender(
        <WaitingCard
          item={calledItem}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );
      expect(screen.getByText('호출됨')).toBeDefined();
      expect(screen.getByRole('button', { name: /재호출/i })).toBeDefined();
    });
  });

  describe('3. Text Collision Avoidance Verification', () => {
    it('empirically verifies filter tab labels and card status badges never collide during queries', () => {
      const queue: WaitingItem[] = [
        createMockItem({ id: 'c-1', ticketNo: 101, status: 'CALLED', channel: 'VEHICLE' }),
        createMockItem({ id: 'c-2', ticketNo: 102, status: 'ARRIVED', channel: 'VEHICLE' }),
        createMockItem({ id: 'c-3', ticketNo: 103, status: 'MOVING', channel: 'WALK_IN' }),
      ];

      render(
        <div className="flex">
          <StoreSummary
            aheadTeams={queue.length}
            estimatedWaitMin={15}
            queue={queue}
            currentFilter="ALL"
            onFilterChange={() => {}}
          />
          <QueueBoard
            queue={queue}
            filter="ALL"
            onCall={() => {}}
            onSeat={() => {}}
            onNoShow={() => {}}
            showSummary={false}
          />
        </div>
      );

      // 1. "호출됨" matches ONLY the card status badge, NOT the "호출팀" filter tab
      const calledStatusBadges = screen.getAllByText(/호출됨/);
      expect(calledStatusBadges.length).toBe(1);
      expect(calledStatusBadges[0].tagName.toLowerCase()).toBe('span');
      expect(calledStatusBadges[0].closest('button')).toBeNull(); // NOT a button

      // 2. "호출팀" matches ONLY the filter tab button
      const calledTab = screen.getByRole('button', { name: /호출팀/ });
      expect(calledTab).toBeDefined();

      // 3. "현장 도착" matches ONLY the card status badge, NOT the "도착팀" filter tab
      const arrivedBadges = screen.getAllByText('현장 도착');
      expect(arrivedBadges.length).toBe(1);
      expect(arrivedBadges[0].closest('button')).toBeNull();

      // 4. "도착팀" matches ONLY the filter tab button
      const arrivedTab = screen.getByRole('button', { name: /도착팀/ });
      expect(arrivedTab).toBeDefined();

      // 5. Naked number checks: "3" from aheadTeams stat card does not collide with "3건" tab count
      expect(screen.getByText('3')).toBeDefined();
      expect(screen.getByText('3건')).toBeDefined();
      expect(screen.getByText('101')).toBeDefined();
      expect(screen.getByText('102')).toBeDefined();
      expect(screen.getByText('103')).toBeDefined();
    });

    it('stress tests long Korean customer names and vehicle specs without layout distortion', () => {
      const longNameItem = createMockItem({
        id: 'long-name',
        customerName: '홍길동과대한민국대표단방문팀(예약자대표)',
        phone: '010-1234-5678',
        vehicleModel: '제네시스 G90 롱휠베이스 리무진 AWD 에디션',
        vehicleNumber: '123가 4567 (특수 차량)',
        channel: 'VEHICLE',
        partySize: 8,
      });

      render(
        <WaitingCard
          item={longNameItem}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      expect(screen.getByText('홍길동과대한민국대표단방문팀(예약자대표)')).toBeDefined();
      expect(screen.getByText('010-1234-5678')).toBeDefined();
      expect(screen.getByText(/제네시스 G90 롱휠베이스 리무진 AWD 에디션/)).toBeDefined();
      expect(screen.getByText('8명')).toBeDefined();
    });
  });

  describe('4. Selection Highlighting & Elevation', () => {
    it('empirically verifies card elevation styling when isSelected is true vs false', () => {
      const item = createMockItem({ id: 'sel-test' });

      const { rerender, container } = render(
        <WaitingCard
          item={item}
          isSelected={false}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      const cardUnselected = container.firstElementChild as HTMLElement;
      expect(cardUnselected.className).not.toContain('border-main');
      expect(cardUnselected.className).not.toContain('ring-2 ring-main');

      rerender(
        <WaitingCard
          item={item}
          isSelected={true}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      const cardSelected = container.firstElementChild as HTMLElement;
      expect(cardSelected.className).toContain('border-main');
      expect(cardSelected.className).toContain('ring-2 ring-main');
      expect(cardSelected.className).not.toContain('translate');
      expect(cardSelected.className).not.toContain('shadow');
    });
  });

  describe('5. Filter Tab Dynamics & Count Calculations in StoreSummary', () => {
    it('empirically verifies filter tab counts and active/inactive styling states', () => {
      const queue: WaitingItem[] = [
        createMockItem({ id: 'q-reg', status: 'REGISTERED', channel: 'VEHICLE' }),
        createMockItem({ id: 'q-mov', status: 'MOVING', channel: 'VEHICLE' }),
        createMockItem({ id: 'q-arr1', status: 'ARRIVED', channel: 'WALK_IN' }),
        createMockItem({ id: 'q-arr2', status: 'ARRIVED', channel: 'VEHICLE' }),
        createMockItem({ id: 'q-cal', status: 'CALLED', channel: 'WALK_IN' }),
      ];

      const onFilterChange = vi.fn();

      const { rerender } = render(
        <StoreSummary
          aheadTeams={5}
          estimatedWaitMin={25}
          queue={queue}
          currentFilter="ALL"
          onFilterChange={onFilterChange}
        />
      );

      // Verify counts:
      // ALL = 5 (5건)
      // MOVING (REGISTERED + MOVING) = 2 (2건)
      // ARRIVED = 2 (2건)
      // CALLED = 1 (1건)
      expect(screen.getByText('5건')).toBeDefined();
      const twoCounts = screen.getAllByText('2건');
      expect(twoCounts.length).toBe(2); // MOVING and ARRIVED both 2건
      expect(screen.getByText('1건')).toBeDefined();

      // Verify vehicleCount in stat card: VEHICLE = 3
      expect(screen.getByText('3')).toBeDefined(); // vehicle count

      // Verify active styling on ALL tab
      const allTab = screen.getByRole('button', { name: /전체/ });
      expect(allTab.className).toContain('bg-main');
      expect(allTab.className).toContain('text-white');

      // Verify inactive styling on other tabs
      const movingTab = screen.getByRole('button', { name: /이동 중/ });
      expect(movingTab.className).toContain('text-ink-2');

      // Click MOVING tab
      fireEvent.click(movingTab);
      expect(onFilterChange).toHaveBeenCalledWith('MOVING');

      // Rerender with currentFilter="MOVING"
      rerender(
        <StoreSummary
          aheadTeams={5}
          estimatedWaitMin={25}
          queue={queue}
          currentFilter="MOVING"
          onFilterChange={onFilterChange}
        />
      );

      expect(movingTab.className).toContain('bg-main');
      expect(allTab.className).toContain('text-ink-2');
    });
  });

  describe('6. Telemetry & Status Edge Cases', () => {
    it('handles alighting status NONE without rendering unconfirmed or confirmed badge text', () => {
      const item = createMockItem({
        id: 'telemetry-none',
        channel: 'VEHICLE',
        arrivalResult: null,
        alighting: {
          status: 'NONE',
          alightedCount: 0,
          totalPassengers: 4,
        },
      });

      render(
        <WaitingCard
          item={item}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      // No alighting text should appear
      expect(screen.queryByText(/하차 완료/)).toBeNull();
      expect(screen.queryByText(/고객 직접 확인 필요/)).toBeNull();
      expect(screen.queryByText(/인원 미확인/)).toBeNull();
    });

    it('handles CALLED status card styling, bell icon, and recall action button', () => {
      const item = createMockItem({
        id: 'card-called',
        status: 'CALLED',
        channel: 'VEHICLE',
      });

      render(
        <WaitingCard
          item={item}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      // Card border and ring for CALLED
      const callBtn = screen.getByRole('button', { name: /재호출/i });
      expect(callBtn.className).toContain('bg-surface');
      expect(callBtn.className).toContain('text-ink');

      const card = callBtn.closest('.rounded-lg') as HTMLElement;
      expect(card.querySelector('span.bg-sub')).not.toBeNull();
    });
  });
});
