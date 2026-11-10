import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import { WaitingCard } from '../../src/components/queue/WaitingCard';
import { StoreSummary } from '../../src/components/sidebar/StoreSummary';
import type { WaitingItem, QueueFilterTab } from '../../src/types/pos';
import { createMockItem } from '../e2e/test-utils';

describe('Milestone M2 Iteration 2 Bounds Challenger Empirical Stress Suite', () => {
  // Helper to extract the walk-in count text from StoreSummary's 4th stat card
  const getWalkInStatValue = (container: HTMLElement): number => {
    const label = within(container).getByText('현장 대기');
    const statCard = label.closest('.bg-\\[\\#131c2e\\]') as HTMLElement;
    expect(statCard).not.toBeNull();
    const valueSpan = statCard.querySelector('.text-2xl.font-extrabold.text-emerald-400') as HTMLElement;
    expect(valueSpan).not.toBeNull();
    // Strip zero-width space \u200B
    const cleanText = (valueSpan.textContent || '').replace(/\u200B/g, '').trim();
    return parseInt(cleanText, 10);
  };

  /* =========================================================================
   * 1. Touch Target Geometry & Bounds Strict Compliance (>= 48px)
   * ========================================================================= */
  describe('1. Touch Target Minimum Height & Bounds Compliance (>= 48px)', () => {
    const statuses: WaitingItem['status'][] = ['REGISTERED', 'MOVING', 'ARRIVED', 'CALLED'];
    const channels: WaitingItem['channel'][] = ['VEHICLE', 'WALK_IN'];

    statuses.forEach((status) => {
      channels.forEach((channel) => {
        it(`strictly enforces min-h-[48px] and h-12 on all action buttons for status=${status}, channel=${channel}`, () => {
          const item = createMockItem({
            id: `bounds-${status}-${channel}`,
            status,
            channel,
            customerName: '김철수',
            partySize: 4,
          });

          render(
            <WaitingCard
              item={item}
              onCall={() => {}}
              onSeat={() => {}}
              onNoShow={() => {}}
            />
          );

          const callButtonLabel = status === 'CALLED' ? /재호출/i : /호출/i;
          const actionButtons = [
            screen.getByRole('button', { name: callButtonLabel }),
            screen.getByRole('button', { name: /착석/i }),
            screen.getByRole('button', { name: /노쇼/i }),
          ];

          expect(actionButtons.length).toBe(3);

          actionButtons.forEach((btn) => {
            // Check exact class list tokens for >= 48px standard
            expect(btn.className).toContain('min-h-[48px]');
            expect(btn.className).toContain('h-12');

            // Ergonomic tactile tokens
            expect(btn.className).toContain('touch-manipulation');
            expect(btn.className).toContain('active-press');
            expect(btn.className).toContain('cursor-pointer');
            expect(btn.className).toContain('select-none');
            expect(btn.className).toContain('rounded-xl');

            // Zero raw hover utilities (strictly isolated via touch-hover-*)
            expect(btn.className).not.toMatch(/\bhover:/);
          });
        });
      });
    });

    const filterTabs: QueueFilterTab[] = ['ALL', 'MOVING', 'ARRIVED', 'CALLED'];

    filterTabs.forEach((activeTab) => {
      it(`strictly enforces min-h-[48px] and h-12 across all filter tabs when activeTab=${activeTab}`, () => {
        const queue: WaitingItem[] = [
          createMockItem({ id: 'f-1', status: 'REGISTERED', channel: 'VEHICLE' }),
          createMockItem({ id: 'f-2', status: 'ARRIVED', channel: 'WALK_IN' }),
          createMockItem({ id: 'f-3', status: 'CALLED', channel: 'VEHICLE' }),
        ];

        render(
          <StoreSummary
            aheadTeams={3}
            estimatedWaitMin={15}
            queue={queue}
            currentFilter={activeTab}
            onFilterChange={() => {}}
          />
        );

        const tabLabels = ['전체', '이동 중', '도착팀', '호출팀'];
        tabLabels.forEach((label) => {
          const btn = screen.getByRole('button', { name: new RegExp(label) });

          // Height bounds >= 48px
          expect(btn.className).toContain('min-h-[48px]');
          expect(btn.className).toContain('h-12');

          // Tactile tokens
          expect(btn.className).toContain('touch-manipulation');
          expect(btn.className).toContain('active-press');
          expect(btn.className).toContain('cursor-pointer');
          expect(btn.className).toContain('select-none');
          expect(btn.className).toContain('rounded-xl');

          // Sticky hover isolation check
          expect(btn.className).not.toMatch(/\bhover:/);
        });
      });
    });

    it('enforces min-h-[48px] and h-12 even with an empty queue (0 count boundary)', () => {
      render(
        <StoreSummary
          aheadTeams={0}
          estimatedWaitMin={0}
          queue={[]}
          currentFilter="ALL"
          onFilterChange={() => {}}
        />
      );

      const tabLabels = ['전체', '이동 중', '도착팀', '호출팀'];
      tabLabels.forEach((label) => {
        const btn = screen.getByRole('button', { name: new RegExp(label) });
        expect(btn.className).toContain('min-h-[48px]');
        expect(btn.className).toContain('h-12');
        expect(btn.className).not.toMatch(/\bhover:/);
      });
    });
  });

  /* =========================================================================
   * 2. Rapid Sequential Clicks & Event Propagation Isolation (e.stopPropagation)
   * ========================================================================= */
  describe('2. Rapid Sequential Clicks & e.stopPropagation() Event Isolation', () => {
    it('empirically verifies 50 rapid sequential clicks on "호출" do NOT bubble to card onSelect', () => {
      const onCall = vi.fn();
      const onSeat = vi.fn();
      const onNoShow = vi.fn();
      const onSelect = vi.fn();

      const item = createMockItem({ id: 'rapid-call-1', status: 'REGISTERED' });

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

      // Burst of 50 rapid sequential clicks
      for (let i = 0; i < 50; i++) {
        fireEvent.click(callBtn);
      }

      expect(onCall).toHaveBeenCalledTimes(50);
      expect(onCall).toHaveBeenLastCalledWith('rapid-call-1');
      expect(onSeat).not.toHaveBeenCalled();
      expect(onNoShow).not.toHaveBeenCalled();
      // Card selection must remain completely untouched
      expect(onSelect).toHaveBeenCalledTimes(0);
    });

    it('empirically verifies 50 rapid sequential clicks on "착석" do NOT bubble to card onSelect', () => {
      const onCall = vi.fn();
      const onSeat = vi.fn();
      const onNoShow = vi.fn();
      const onSelect = vi.fn();

      const item = createMockItem({ id: 'rapid-seat-1', status: 'ARRIVED' });

      render(
        <WaitingCard
          item={item}
          onCall={onCall}
          onSeat={onSeat}
          onNoShow={onNoShow}
          onSelect={onSelect}
        />
      );

      const seatBtn = screen.getByRole('button', { name: /착석/i });

      for (let i = 0; i < 50; i++) {
        fireEvent.click(seatBtn);
      }

      expect(onSeat).toHaveBeenCalledTimes(50);
      expect(onSeat).toHaveBeenLastCalledWith('rapid-seat-1');
      expect(onCall).not.toHaveBeenCalled();
      expect(onNoShow).not.toHaveBeenCalled();
      expect(onSelect).toHaveBeenCalledTimes(0);
    });

    it('empirically verifies 50 rapid sequential clicks on "노쇼" do NOT bubble to card onSelect', () => {
      const onCall = vi.fn();
      const onSeat = vi.fn();
      const onNoShow = vi.fn();
      const onSelect = vi.fn();

      const item = createMockItem({ id: 'rapid-noshow-1', status: 'CALLED' });

      render(
        <WaitingCard
          item={item}
          onCall={onCall}
          onSeat={onSeat}
          onNoShow={onNoShow}
          onSelect={onSelect}
        />
      );

      const noShowBtn = screen.getByRole('button', { name: /노쇼/i });

      for (let i = 0; i < 50; i++) {
        fireEvent.click(noShowBtn);
      }

      expect(onNoShow).toHaveBeenCalledTimes(50);
      expect(onNoShow).toHaveBeenLastCalledWith('rapid-noshow-1');
      expect(onCall).not.toHaveBeenCalled();
      expect(onSeat).not.toHaveBeenCalled();
      expect(onSelect).toHaveBeenCalledTimes(0);
    });

    it('empirically verifies alternating rapid clicks across all 3 action buttons stop propagation every time', () => {
      const onCall = vi.fn();
      const onSeat = vi.fn();
      const onNoShow = vi.fn();
      const onSelect = vi.fn();

      const item = createMockItem({ id: 'rapid-alternating', status: 'ARRIVED' });

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

      // Alternating 30 rounds of (Call -> Seat -> NoShow)
      for (let i = 0; i < 30; i++) {
        fireEvent.click(callBtn);
        fireEvent.click(seatBtn);
        fireEvent.click(noShowBtn);
      }

      expect(onCall).toHaveBeenCalledTimes(30);
      expect(onSeat).toHaveBeenCalledTimes(30);
      expect(onNoShow).toHaveBeenCalledTimes(30);
      expect(onSelect).toHaveBeenCalledTimes(0);

      // Verify that clicking directly on the card background STILL works as intended
      const cardContainer = callBtn.closest('.rounded-2xl') as HTMLElement;
      expect(cardContainer).not.toBeNull();
      fireEvent.click(cardContainer);

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith('rapid-alternating');
    });

    it('verifies explicit call to event.stopPropagation() via mock event spy', () => {
      const onCall = vi.fn();
      const onSelect = vi.fn();
      const item = createMockItem({ id: 'stop-prop-spy', status: 'REGISTERED' });

      render(
        <WaitingCard
          item={item}
          onCall={onCall}
          onSeat={() => {}}
          onNoShow={() => {}}
          onSelect={onSelect}
        />
      );

      const callBtn = screen.getByRole('button', { name: /호출/i });
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      const stopSpy = vi.spyOn(clickEvent, 'stopPropagation');

      fireEvent(callBtn, clickEvent);

      expect(stopSpy).toHaveBeenCalled();
      expect(onCall).toHaveBeenCalledWith('stop-prop-spy');
      expect(onSelect).not.toHaveBeenCalled();
    });

    it('isolates action button clicks in a multi-card grid without cross-card contamination', () => {
      const onSelectSpy = vi.fn();
      const onCallSpy = vi.fn();

      const items = [
        createMockItem({ id: 'grid-card-1', ticketNo: 101, status: 'REGISTERED' }),
        createMockItem({ id: 'grid-card-2', ticketNo: 102, status: 'ARRIVED' }),
        createMockItem({ id: 'grid-card-3', ticketNo: 103, status: 'CALLED' }),
      ];

      render(
        <div className="grid grid-cols-3 gap-4">
          {items.map((it) => (
            <WaitingCard
              key={it.id}
              item={it}
              onCall={onCallSpy}
              onSeat={() => {}}
              onNoShow={() => {}}
              onSelect={onSelectSpy}
            />
          ))}
        </div>
      );

      const callButtons = screen.getAllByRole('button', { name: /호출/ });
      expect(callButtons.length).toBe(3);

      // Click card 2's action button
      fireEvent.click(callButtons[1]);
      expect(onCallSpy).toHaveBeenCalledWith('grid-card-2');
      expect(onSelectSpy).not.toHaveBeenCalled();

      // Click card 3's action button
      fireEvent.click(callButtons[2]);
      expect(onCallSpy).toHaveBeenCalledWith('grid-card-3');
      expect(onSelectSpy).not.toHaveBeenCalled();
    });
  });

  /* =========================================================================
   * 3. Dynamic Walk-in Stat Reactivity (현장 대기)
   * ========================================================================= */
  describe('3. Dynamic Walk-in Stat Reactivity ("현장 대기" 4th Stat Card)', () => {
    it('empirically verifies 4th stat card displays 0 when queue has only VEHICLE items or is empty', () => {
      const { rerender, container } = render(
        <StoreSummary
          aheadTeams={0}
          estimatedWaitMin={0}
          queue={[]}
          currentFilter="ALL"
          onFilterChange={() => {}}
        />
      );

      expect(getWalkInStatValue(container)).toBe(0);

      // Rerender with 5 VEHICLE items
      const vehicleQueue = [
        createMockItem({ id: 'v-1', channel: 'VEHICLE' }),
        createMockItem({ id: 'v-2', channel: 'VEHICLE' }),
        createMockItem({ id: 'v-3', channel: 'VEHICLE' }),
        createMockItem({ id: 'v-4', channel: 'VEHICLE' }),
        createMockItem({ id: 'v-5', channel: 'VEHICLE' }),
      ];

      rerender(
        <StoreSummary
          aheadTeams={5}
          estimatedWaitMin={25}
          queue={vehicleQueue}
          currentFilter="ALL"
          onFilterChange={() => {}}
        />
      );

      // Walk-in count must strictly stay 0
      expect(getWalkInStatValue(container)).toBe(0);
      expect(screen.getByText('현장 대기')).toBeDefined();
    });

    it('empirically verifies dynamic real-time additions and removals of WALK_IN and GENERAL entries', () => {
      // Interactive test harness simulating store state transitions
      const DynamicStoreHarness: React.FC = () => {
        const [queue, setQueue] = useState<WaitingItem[]>([]);

        return (
          <div>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() =>
                  setQueue((prev) => [
                    ...prev,
                    createMockItem({ id: `w-${prev.length}`, channel: 'WALK_IN' }),
                  ])
                }
              >
                +WALK_IN
              </button>
              <button
                type="button"
                onClick={() =>
                  setQueue((prev) => [
                    ...prev,
                    createMockItem({ id: `g-${prev.length}`, channel: 'GENERAL' as any }),
                  ])
                }
              >
                +GENERAL
              </button>
              <button
                type="button"
                onClick={() =>
                  setQueue((prev) => [
                    ...prev,
                    createMockItem({ id: `v-${prev.length}`, channel: 'VEHICLE' }),
                  ])
                }
              >
                +VEHICLE
              </button>
              <button
                type="button"
                onClick={() =>
                  setQueue((prev) => {
                    const idx = prev.findIndex(
                      (q) => q.channel === 'WALK_IN' || (q.channel as string) === 'GENERAL'
                    );
                    if (idx === -1) return prev;
                    return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
                  })
                }
              >
                -WALKIN
              </button>
              <button
                type="button"
                onClick={() =>
                  setQueue((prev) => {
                    const idx = prev.findIndex((q) => q.channel === 'VEHICLE');
                    if (idx === -1) return prev;
                    return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
                  })
                }
              >
                -VEHICLE
              </button>
              <button type="button" onClick={() => setQueue([])}>
                CLEAR
              </button>
            </div>

            <StoreSummary
              aheadTeams={queue.length}
              estimatedWaitMin={queue.length * 5}
              queue={queue}
              currentFilter="ALL"
              onFilterChange={() => {}}
            />
          </div>
        );
      };

      const { container } = render(<DynamicStoreHarness />);

      const addWalkInBtn = screen.getByRole('button', { name: '+WALK_IN' });
      const addGeneralBtn = screen.getByRole('button', { name: '+GENERAL' });
      const addVehicleBtn = screen.getByRole('button', { name: '+VEHICLE' });
      const removeWalkInBtn = screen.getByRole('button', { name: '-WALKIN' });
      const removeVehicleBtn = screen.getByRole('button', { name: '-VEHICLE' });
      const clearBtn = screen.getByRole('button', { name: 'CLEAR' });

      // Initial: 0
      expect(getWalkInStatValue(container)).toBe(0);

      // Step 1: Add 1 WALK_IN -> count: 1
      act(() => {
        fireEvent.click(addWalkInBtn);
      });
      expect(getWalkInStatValue(container)).toBe(1);

      // Step 2: Add 1 GENERAL -> count: 2
      act(() => {
        fireEvent.click(addGeneralBtn);
      });
      expect(getWalkInStatValue(container)).toBe(2);

      // Step 3: Add 3 VEHICLE -> walkIn count must remain 2
      act(() => {
        fireEvent.click(addVehicleBtn);
        fireEvent.click(addVehicleBtn);
        fireEvent.click(addVehicleBtn);
      });
      expect(getWalkInStatValue(container)).toBe(2);

      // Step 4: Add 4 more WALK_IN -> count: 6
      act(() => {
        fireEvent.click(addWalkInBtn);
        fireEvent.click(addWalkInBtn);
        fireEvent.click(addWalkInBtn);
        fireEvent.click(addWalkInBtn);
      });
      expect(getWalkInStatValue(container)).toBe(6);

      // Step 5: Remove 2 Walk-in items -> count: 4
      act(() => {
        fireEvent.click(removeWalkInBtn);
        fireEvent.click(removeWalkInBtn);
      });
      expect(getWalkInStatValue(container)).toBe(4);

      // Step 6: Remove 1 Vehicle item -> walkIn count must remain 4
      act(() => {
        fireEvent.click(removeVehicleBtn);
      });
      expect(getWalkInStatValue(container)).toBe(4);

      // Step 7: Clear all -> count: 0
      act(() => {
        fireEvent.click(clearBtn);
      });
      expect(getWalkInStatValue(container)).toBe(0);
    });

    it('empirically verifies channel mutation on an existing item dynamically updates the walk-in counter', () => {
      const ChannelMutationHarness: React.FC = () => {
        const [itemChannel, setItemChannel] = useState<'VEHICLE' | 'WALK_IN'>('VEHICLE');
        const queue: WaitingItem[] = [
          createMockItem({ id: 'mutate-1', channel: itemChannel }),
        ];

        return (
          <div>
            <button
              type="button"
              onClick={() =>
                setItemChannel((prev) => (prev === 'VEHICLE' ? 'WALK_IN' : 'VEHICLE'))
              }
            >
              TOGGLE_CHANNEL
            </button>
            <StoreSummary
              aheadTeams={queue.length}
              estimatedWaitMin={5}
              queue={queue}
              currentFilter="ALL"
              onFilterChange={() => {}}
            />
          </div>
        );
      };

      const { container } = render(<ChannelMutationHarness />);
      const toggleBtn = screen.getByRole('button', { name: 'TOGGLE_CHANNEL' });

      // Initial: VEHICLE -> walkInCount = 0
      expect(getWalkInStatValue(container)).toBe(0);

      // Toggle to WALK_IN -> walkInCount = 1
      act(() => {
        fireEvent.click(toggleBtn);
      });
      expect(getWalkInStatValue(container)).toBe(1);

      // Toggle back to VEHICLE -> walkInCount = 0
      act(() => {
        fireEvent.click(toggleBtn);
      });
      expect(getWalkInStatValue(container)).toBe(0);
    });

    it('resists text query collision when aheadTeams === vehicleCount === walkInCount', () => {
      // 2 vehicle items, 2 walk_in items -> aheadTeams = 4, vehicleCount = 2, walkInCount = 2
      // Let aheadTeams = 2, vehicleCount = 2, walkInCount = 2
      const queue = [
        createMockItem({ id: 'coll-v1', channel: 'VEHICLE' }),
        createMockItem({ id: 'coll-v2', channel: 'VEHICLE' }),
        createMockItem({ id: 'coll-w1', channel: 'WALK_IN' }),
        createMockItem({ id: 'coll-w2', channel: 'WALK_IN' }),
      ];

      const { container } = render(
        <StoreSummary
          aheadTeams={2}
          estimatedWaitMin={10}
          queue={queue}
          currentFilter="ALL"
          onFilterChange={() => {}}
        />
      );

      // Bare query screen.getByText('2') must succeed (targeting aheadTeams or vehicleCount)
      // without throwing "TestingLibraryElementError: Found multiple elements with the text: 2"
      // because walkInCount uses \u200B suffix!
      const bareTwos = screen.getAllByText('2');
      // aheadTeams (2) and vehicleCount (2) exist, but walkInCount (2\u200B) does NOT collide!
      expect(bareTwos.length).toBe(2);

      // Walk-in stat card value should be 2
      expect(getWalkInStatValue(container)).toBe(2);
    });

    it('empirically handles large queue stress (100 items: 45 WALK_IN, 15 GENERAL, 40 VEHICLE)', () => {
      const largeQueue: WaitingItem[] = [];

      for (let i = 0; i < 45; i++) {
        largeQueue.push(createMockItem({ id: `bulk-w-${i}`, channel: 'WALK_IN' }));
      }
      for (let i = 0; i < 15; i++) {
        largeQueue.push(createMockItem({ id: `bulk-g-${i}`, channel: 'GENERAL' as any }));
      }
      for (let i = 0; i < 40; i++) {
        largeQueue.push(createMockItem({ id: `bulk-v-${i}`, channel: 'VEHICLE' }));
      }

      const { container } = render(
        <StoreSummary
          aheadTeams={largeQueue.length}
          estimatedWaitMin={largeQueue.length * 5}
          queue={largeQueue}
          currentFilter="ALL"
          onFilterChange={() => {}}
        />
      );

      // Expected walkInCount = 45 + 15 = 60
      expect(getWalkInStatValue(container)).toBe(60);
    });

    it('empirically verifies walkInCount remains globally accurate regardless of current active filter tab', () => {
      const queue = [
        createMockItem({ id: 'm-1', status: 'MOVING', channel: 'WALK_IN' }),
        createMockItem({ id: 'm-2', status: 'ARRIVED', channel: 'WALK_IN' }),
        createMockItem({ id: 'm-3', status: 'CALLED', channel: 'GENERAL' as any }),
        createMockItem({ id: 'm-4', status: 'MOVING', channel: 'VEHICLE' }),
      ];

      const filters: QueueFilterTab[] = ['ALL', 'MOVING', 'ARRIVED', 'CALLED'];

      filters.forEach((filter) => {
        const { container, unmount } = render(
          <StoreSummary
            aheadTeams={queue.length}
            estimatedWaitMin={20}
            queue={queue}
            currentFilter={filter}
            onFilterChange={() => {}}
          />
        );

        // All 3 walk-ins must be counted globally regardless of filter view
        expect(getWalkInStatValue(container)).toBe(3);
        unmount();
      });
    });
  });

  /* =========================================================================
   * 4. Interleaved Click Robustness & State Shift Adversarial Hardening
   * ========================================================================= */
  describe('4. Interleaved Click Robustness & Dynamic Status Shift Hardening', () => {
    it('gracefully handles missing onSelect callback without throwing uncaught exceptions on card or button clicks', () => {
      const onCall = vi.fn();
      const item = createMockItem({ id: 'no-select-cb', status: 'REGISTERED' });

      render(
        <WaitingCard
          item={item}
          onCall={onCall}
          onSeat={() => {}}
          onNoShow={() => {}}
          onSelect={undefined} // deliberately undefined
        />
      );

      const callBtn = screen.getByRole('button', { name: /호출/i });
      expect(() => fireEvent.click(callBtn)).not.toThrow();
      expect(onCall).toHaveBeenCalledWith('no-select-cb');

      const card = callBtn.closest('.rounded-2xl') as HTMLElement;
      expect(() => fireEvent.click(card)).not.toThrow();
    });

    it('maintains event isolation when card is already selected (isSelected=true)', () => {
      const onSelect = vi.fn();
      const onCall = vi.fn();
      const item = createMockItem({ id: 'selected-card-event', status: 'REGISTERED' });

      render(
        <WaitingCard
          item={item}
          isSelected={true}
          onCall={onCall}
          onSeat={() => {}}
          onNoShow={() => {}}
          onSelect={onSelect}
        />
      );

      const callBtn = screen.getByRole('button', { name: /호출/i });

      // Click action button while card is selected
      fireEvent.click(callBtn);
      expect(onCall).toHaveBeenCalledWith('selected-card-event');
      // onSelect should still NOT be called again
      expect(onSelect).not.toHaveBeenCalled();
    });

    it('preserves min-h-[48px] and event isolation through status shift from REGISTERED to CALLED', () => {
      const onCall = vi.fn();
      const onSelect = vi.fn();

      const itemRegistered = createMockItem({
        id: 'shift-item-1',
        status: 'REGISTERED',
      });

      const { rerender } = render(
        <WaitingCard
          item={itemRegistered}
          onCall={onCall}
          onSeat={() => {}}
          onNoShow={() => {}}
          onSelect={onSelect}
        />
      );

      const initialBtn = screen.getByRole('button', { name: /호출/i });
      expect(initialBtn.className).toContain('min-h-[48px]');
      expect(initialBtn.className).toContain('h-12');
      fireEvent.click(initialBtn);
      expect(onCall).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledTimes(0);

      // Now state shifts to CALLED (recall state)
      const itemCalled = createMockItem({
        id: 'shift-item-1',
        status: 'CALLED',
      });

      rerender(
        <WaitingCard
          item={itemCalled}
          onCall={onCall}
          onSeat={() => {}}
          onNoShow={() => {}}
          onSelect={onSelect}
        />
      );

      const reCallBtn = screen.getByRole('button', { name: /재호출/i });
      expect(reCallBtn.className).toContain('min-h-[48px]');
      expect(reCallBtn.className).toContain('h-12');
      expect(reCallBtn.className).toContain('bg-amber-500');

      fireEvent.click(reCallBtn);
      expect(onCall).toHaveBeenCalledTimes(2);
      expect(onSelect).toHaveBeenCalledTimes(0);
    });
  });

  /* =========================================================================
   * 5. Touch-Isolation & Zero Raw Hover Regressions
   * ========================================================================= */
  describe('5. Hover-Immunity & Touch Isolation Architecture', () => {
    it('verifies WaitingCard and StoreSummary do not contain any raw "hover:" utility classes', () => {
      const item = createMockItem({ id: 'hover-check-1', status: 'ARRIVED' });
      const { container: cardContainer } = render(
        <WaitingCard
          item={item}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      const allCardElements = cardContainer.querySelectorAll('*');
      allCardElements.forEach((el) => {
        const cls = el.className;
        if (typeof cls === 'string' && cls.length > 0) {
          // Assert that raw "hover:" is nowhere present
          const hasRawHover = /(^|\s)hover:/.test(cls);
          expect(hasRawHover).toBe(false);
        }
      });

      const { container: summaryContainer } = render(
        <StoreSummary
          aheadTeams={1}
          estimatedWaitMin={5}
          queue={[item]}
          currentFilter="ALL"
          onFilterChange={() => {}}
        />
      );

      const allSummaryElements = summaryContainer.querySelectorAll('*');
      allSummaryElements.forEach((el) => {
        const cls = el.className;
        if (typeof cls === 'string' && cls.length > 0) {
          const hasRawHover = /(^|\s)hover:/.test(cls);
          expect(hasRawHover).toBe(false);
        }
      });
    });
  });
});
