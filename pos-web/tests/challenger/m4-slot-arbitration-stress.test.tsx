import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import fs from 'node:fs';
import path from 'node:path';
import { App } from '../../src/App';
import { DemoPanel } from '../../src/components/demo/DemoPanel';
import DemoPanelBarrel, { DemoPanel as DemoPanelNamed } from '../../src/components/DemoPanel';
import { TeamDetailDrawer } from '../../src/components/detail/TeamDetailDrawer';
import { Header } from '../../src/components/layout/Header';
import { createMockItem, createMockStore } from '../e2e/test-utils';

/**
 * Standard test helper to render the App and log in immediately.
 */
async function renderLoggedInApp() {
  const result = render(<App />);
  const loginButton = screen.queryByRole('button', { name: /POS 시스템 접속/i });
  if (loginButton) {
    fireEvent.click(loginButton);
    await screen.findByText('하늘본가 숯불갈비 시흥본점');
  }
  return result;
}

describe('Milestone M4 Challenger: Slot Arbitration & Micro-Interaction Stress Suite', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const demoPanelSrcPath = path.join(rootDir, 'src/components/demo/DemoPanel.tsx');
  const indexCssPath = path.join(rootDir, 'src/index.css');

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // 1. Right Panel Slot Arbitration State Machine Stress Tests
  // =========================================================================
  describe('1. Right Panel Slot Arbitration State Machine', () => {
    it('empirically verifies baseline state: DemoPanel is mounted by default and TeamDetailDrawer is absent', async () => {
      await renderLoggedInApp();

      // DemoPanel is mounted by default when isDemoOpen is true
      expect(screen.getByText('시연 제어 패널')).toBeDefined();
      expect(screen.getByText('심사·시연 데모 컨트롤러')).toBeDefined();
      expect(screen.getByText('실시간 연동')).toBeDefined();

      // TeamDetailDrawer is not mounted initially
      expect(screen.queryByText('대기 상세 정보')).toBeNull();

      // Right contextual column is open and contains DemoPanel
      const rightPanelHeading = screen.getByText('시연 제어 패널');
      const asideElement = rightPanelHeading.closest('aside');
      expect(asideElement).not.toBeNull();
      expect(asideElement?.className).toContain('w-[360px]');
    });

    it('empirically verifies selecting a team card unmounts DemoPanel and mounts TeamDetailDrawer cleanly', async () => {
      await renderLoggedInApp();

      // Select Card 12
      const card12 = screen.getByText('12').closest('.cursor-pointer')!;
      expect(card12).not.toBeNull();
      fireEvent.click(card12);

      // TeamDetailDrawer must mount
      expect(screen.getByText('대기 상세 정보')).toBeDefined();
      expect(screen.getByText('김*수 (Pleos Connect)')).toBeDefined();

      // DemoPanel must be cleanly unmounted (no coexistence / slot collision)
      expect(screen.queryByText('시연 제어 패널')).toBeNull();
      expect(screen.queryByText('심사·시연 데모 컨트롤러')).toBeNull();

      // Exactly one contextual aside in the right column
      const drawerAside = screen.getByText('대기 상세 정보').closest('aside')!;
      expect(drawerAside).not.toBeNull();
    });

    it('empirically verifies clicking the selected card again deselects it and restores DemoPanel', async () => {
      await renderLoggedInApp();

      const card12 = screen.getByText('12').closest('.cursor-pointer')!;
      // 1st click: open drawer
      fireEvent.click(card12);
      expect(screen.getByText('대기 상세 정보')).toBeDefined();
      expect(screen.queryByText('시연 제어 패널')).toBeNull();

      // 2nd click: deselect card -> drawer closes and DemoPanel is restored
      fireEvent.click(card12);
      expect(screen.queryByText('대기 상세 정보')).toBeNull();
      expect(screen.getByText('시연 제어 패널')).toBeDefined();
      expect(screen.getByText('심사·시연 데모 컨트롤러')).toBeDefined();
    });

    it('empirically verifies closing TeamDetailDrawer via [상세 닫기] button restores DemoPanel', async () => {
      await renderLoggedInApp();

      // Select Card 13
      const card13 = screen.getByText('13').closest('.cursor-pointer')!;
      fireEvent.click(card13);
      expect(screen.getByText('대기 상세 정보')).toBeDefined();

      // Click drawer close button
      const closeDrawerBtn = screen.getByRole('button', { name: '상세 닫기' });
      fireEvent.click(closeDrawerBtn);

      // Drawer unmounts and DemoPanel restores
      expect(screen.queryByText('대기 상세 정보')).toBeNull();
      expect(screen.getByText('시연 제어 패널')).toBeDefined();
    });

    it('empirically verifies clicking Header [시연 데모] when TeamDetailDrawer is open pre-empts drawer and mounts DemoPanel', async () => {
      await renderLoggedInApp();

      // Select Card 12 -> drawer open
      const card12 = screen.getByText('12').closest('.cursor-pointer')!;
      fireEvent.click(card12);
      expect(screen.getByText('대기 상세 정보')).toBeDefined();
      expect(screen.queryByText('시연 제어 패널')).toBeNull();

      // Click Header [시연 데모] button
      const headerDemoToggle = screen.getByRole('button', { name: '데모 컨트롤러 토글' });
      fireEvent.click(headerDemoToggle);

      // TeamDetailDrawer must unmount and DemoPanel must mount
      expect(screen.queryByText('대기 상세 정보')).toBeNull();
      expect(screen.getByText('시연 제어 패널')).toBeDefined();
    });

    it('empirically verifies clicking DemoPanel internal close button [X] collapses the right column completely', async () => {
      await renderLoggedInApp();

      expect(screen.getByText('시연 제어 패널')).toBeDefined();

      // Click DemoPanel close button
      const demoCloseBtn = screen.getByRole('button', { name: '데모 닫기' });
      fireEvent.click(demoCloseBtn);

      // DemoPanel unmounts
      expect(screen.queryByText('시연 제어 패널')).toBeNull();
      expect(screen.queryByText('심사·시연 데모 컨트롤러')).toBeNull();
      expect(screen.queryByText('대기 상세 정보')).toBeNull();

      // Verify the right contextual aside is collapsed/absent
      const rightPanelContainers = document.querySelectorAll('aside.w-\\[360px\\], aside[class*="w-[360px]"]');
      expect(rightPanelContainers.length).toBe(0);
    });

    it('empirically verifies re-opening DemoPanel from Header toggle when right column is collapsed', async () => {
      await renderLoggedInApp();

      // Close DemoPanel
      const demoCloseBtn = screen.getByRole('button', { name: '데모 닫기' });
      fireEvent.click(demoCloseBtn);
      expect(screen.queryByText('시연 제어 패널')).toBeNull();

      // Click Header [시연 데모] toggle to re-open
      const headerDemoToggle = screen.getByRole('button', { name: '데모 컨트롤러 토글' });
      fireEvent.click(headerDemoToggle);

      // DemoPanel should now be visible again
      expect(screen.getByText('시연 제어 패널')).toBeDefined();
      expect(screen.getByText('심사·시연 데모 컨트롤러')).toBeDefined();
    });

    it('empirically verifies drawer restoration and collapse semantics when isDemoOpen was false', async () => {
      await renderLoggedInApp();

      // 1. User closes DemoPanel -> isDemoOpen becomes false, right panel collapses
      const demoCloseBtn = screen.getByRole('button', { name: '데모 닫기' });
      fireEvent.click(demoCloseBtn);
      expect(screen.queryByText('시연 제어 패널')).toBeNull();

      // 2. User selects Card 14 while DemoPanel is closed -> TeamDetailDrawer opens
      const card14 = screen.getByText('14').closest('.cursor-pointer')!;
      fireEvent.click(card14);
      expect(screen.getByText('대기 상세 정보')).toBeDefined();
      expect(screen.queryByText('시연 제어 패널')).toBeNull();

      // 3. User closes TeamDetailDrawer -> because isDemoOpen was false, right column collapses completely
      const closeDrawerBtn = screen.getByRole('button', { name: '상세 닫기' });
      fireEvent.click(closeDrawerBtn);

      expect(screen.queryByText('대기 상세 정보')).toBeNull();
      expect(screen.queryByText('시연 제어 패널')).toBeNull();

      const asideContainers = document.querySelectorAll('aside.w-\\[360px\\], aside[class*="w-[360px]"]');
      expect(asideContainers.length).toBe(0);
    });

    it('stress tests rapid multi-state alternating sequences without zombie panels or state corruption', async () => {
      await renderLoggedInApp();

      const card12 = screen.getByText('12').closest('.cursor-pointer')!;
      const card13 = screen.getByText('13').closest('.cursor-pointer')!;
      const card14 = screen.getByText('14').closest('.cursor-pointer')!;
      const headerDemoToggle = screen.getByRole('button', { name: '데모 컨트롤러 토글' });

      // Stress cycle: 6 full rounds of switching
      for (let round = 0; round < 6; round++) {
        // Step A: Select Card 12 -> Drawer open
        fireEvent.click(card12);
        expect(screen.getByText('대기 상세 정보')).toBeDefined();
        expect(screen.queryByText('시연 제어 패널')).toBeNull();

        // Step B: Select Card 13 -> Drawer smoothly switches
        fireEvent.click(card13);
        expect(screen.getByText('대기 상세 정보')).toBeDefined();
        expect(screen.queryByText('시연 제어 패널')).toBeNull();

        // Step C: Preempt with Header Demo toggle -> DemoPanel mounts
        fireEvent.click(headerDemoToggle);
        expect(screen.queryByText('대기 상세 정보')).toBeNull();
        expect(screen.getByText('시연 제어 패널')).toBeDefined();

        // Step D: Select Card 14 -> Drawer open
        fireEvent.click(card14);
        expect(screen.getByText('대기 상세 정보')).toBeDefined();
        expect(screen.queryByText('시연 제어 패널')).toBeNull();

        // Step E: Close drawer -> DemoPanel restored
        const drawerClose = screen.getByRole('button', { name: '상세 닫기' });
        fireEvent.click(drawerClose);
        expect(screen.queryByText('대기 상세 정보')).toBeNull();
        expect(screen.getByText('시연 제어 패널')).toBeDefined();

        // Step F: Close DemoPanel -> collapsed
        const demoClose = screen.getByRole('button', { name: '데모 닫기' });
        fireEvent.click(demoClose);
        expect(screen.queryByText('시연 제어 패널')).toBeNull();
        expect(screen.queryByText('대기 상세 정보')).toBeNull();

        // Step G: Re-open DemoPanel from Header
        fireEvent.click(headerDemoToggle);
        expect(screen.getByText('시연 제어 패널')).toBeDefined();
      }
    });
  });

  // =========================================================================
  // 2. Ergonomic DOM Assertions: Touch Targets >= 48px
  // =========================================================================
  describe('2. Ergonomic DOM Assertions (Touch Targets >= 48px)', () => {
    it('empirically asserts EVERY interactive button in DemoPanel satisfies >= 48px touch target requirements', () => {
      const mockAdd = vi.fn();
      const mockRemove = vi.fn();
      const mockArrival = vi.fn();
      const mockReset = vi.fn();
      const mockGoldenTime = vi.fn();
      const mockClose = vi.fn();

      render(
        <DemoPanel
          onAddWalkIn={mockAdd}
          onRemoveWalkIn={mockRemove}
          onSimulateVehicleArrival={mockArrival}
          onResetDemo={mockReset}
          onGoldenTimeRush={mockGoldenTime}
          onClose={mockClose}
          walkInCount={1}
          aheadTeams={3}
          estimatedWaitMin={15}
        />
      );

      const buttons = screen.getAllByRole('button');
      // Must contain 6 interactive buttons:
      // 1. 데모 닫기
      // 2. 현장 +1팀
      // 3. 현장 -1팀
      // 4. +3팀 골든타임 시연
      // 5. 하차 확인 이벤트 발생
      // 6. 시연 초기 상태로 리셋
      expect(buttons.length).toBe(6);

      for (const btn of buttons) {
        const cls = btn.className;
        const satisfies48px =
          cls.includes('min-h-[48px]') || cls.includes('h-12');
        expect(
          satisfies48px,
          `Button "${btn.getAttribute('aria-label') || btn.textContent}" must have min-h-[48px] or h-12. Class: ${cls}`
        ).toBe(true);
      }
    });

    it('empirically verifies DemoPanel close button strictly has w-12 h-12 and min-w-[48px] min-h-[48px]', () => {
      const mockClose = vi.fn();
      render(
        <DemoPanel
          onAddWalkIn={() => {}}
          onRemoveWalkIn={() => {}}
          onSimulateVehicleArrival={() => {}}
          onResetDemo={() => {}}
          onClose={mockClose}
        />
      );

      const closeBtn = screen.getByRole('button', { name: '데모 닫기' });
      expect(closeBtn).toBeDefined();
      const cls = closeBtn.className;

      expect(cls).toContain('w-12');
      expect(cls).toContain('h-12');
      expect(cls).toContain('min-w-[48px]');
      expect(cls).toContain('min-h-[48px]');
    });

    it('empirically verifies all action buttons in DemoPanel have explicit min-h-[48px] h-12', () => {
      render(
        <DemoPanel
          onAddWalkIn={() => {}}
          onRemoveWalkIn={() => {}}
          onSimulateVehicleArrival={() => {}}
          onResetDemo={() => {}}
          onGoldenTimeRush={() => {}}
        />
      );

      const addBtn = screen.getByRole('button', { name: '현장 +1팀' });
      const removeBtn = screen.getByRole('button', { name: '현장 -1팀' });
      const goldenTimeBtn = screen.getByRole('button', { name: '+3팀 골든타임 시연' });
      const arrivalBtn = screen.getByRole('button', { name: '하차 확인 이벤트 발생' });
      const resetBtn = screen.getByRole('button', { name: /시연 초기 상태로 리셋/i });

      const actionButtons = [addBtn, removeBtn, goldenTimeBtn, arrivalBtn, resetBtn];
      for (const btn of actionButtons) {
        expect(btn.className).toContain('min-h-[48px]');
        expect(btn.className).toContain('h-12');
      }
    });

    it('empirically rejects undersized buttons: zero buttons in DemoPanel have h-8, h-9, h-10 or py-1/py-2 without 48px enforcement', () => {
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

      const buttons = screen.getAllByRole('button');
      for (const btn of buttons) {
        const cls = btn.className;
        expect(cls).not.toMatch(/\bh-(?:6|7|8|9|10)\b/);
        // If py- is present, min-h-[48px] must be present
        if (cls.match(/\bpy-(?:1|1\.5|2|2\.5)\b/)) {
          expect(cls).toContain('min-h-[48px]');
        }
      }
    });

    it('empirically verifies Header [시연 데모] button satisfies min-h-[48px] h-12 touch target', () => {
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

      const demoBtn = screen.getByRole('button', { name: '데모 컨트롤러 토글' });
      expect(demoBtn.className).toContain('min-h-[48px]');
      expect(demoBtn.className).toContain('h-12');
    });

    it('empirically verifies TeamDetailDrawer close button and action buttons satisfy >= 48px touch target requirements', () => {
      const mockTeam = createMockItem({ id: 'team-48px', ticketNo: 99 });
      render(
        <TeamDetailDrawer
          selectedTeam={mockTeam}
          onClose={() => {}}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      const closeBtn = screen.getByRole('button', { name: '상세 닫기' });
      expect(closeBtn.className).toContain('w-12');
      expect(closeBtn.className).toContain('h-12');
      expect(closeBtn.className).toContain('min-w-[48px]');
      expect(closeBtn.className).toContain('min-h-[48px]');

      const actionButtons = [
        screen.getByRole('button', { name: /호출/i }),
        screen.getByRole('button', { name: /착석/i }),
        screen.getByRole('button', { name: /노쇼/i }),
      ];

      for (const btn of actionButtons) {
        expect(btn.className).toContain('min-h-[48px]');
        expect(btn.className).toContain('h-12');
      }
    });
  });

  // =========================================================================
  // 3. Micro-Interactions, Active-Press & Hover Isolation
  // =========================================================================
  describe('3. Micro-Interactions & Hover Isolation', () => {
    it('empirically verifies EVERY button in DemoPanel possesses .active-press class for physical tactile scale feedback', () => {
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

      const buttons = screen.getAllByRole('button');
      for (const btn of buttons) {
        expect(
          btn.className,
          `Button ${btn.getAttribute('aria-label') || btn.textContent} must include active-press`
        ).toContain('active-press');
      }
    });

    it('empirically verifies interactive action buttons in DemoPanel include touch-manipulation', () => {
      render(
        <DemoPanel
          onAddWalkIn={() => {}}
          onRemoveWalkIn={() => {}}
          onSimulateVehicleArrival={() => {}}
          onResetDemo={() => {}}
          onGoldenTimeRush={() => {}}
        />
      );

      const actionButtons = [
        screen.getByRole('button', { name: '현장 +1팀' }),
        screen.getByRole('button', { name: '현장 -1팀' }),
        screen.getByRole('button', { name: '+3팀 골든타임 시연' }),
        screen.getByRole('button', { name: '하차 확인 이벤트 발생' }),
        screen.getByRole('button', { name: /시연 초기 상태로 리셋/i }),
      ];

      for (const btn of actionButtons) {
        expect(btn.className).toContain('touch-manipulation');
      }
    });

    it('empirically verifies ZERO naked non-isolated hover: utility classes in rendered DemoPanel DOM', () => {
      render(
        <DemoPanel
          onAddWalkIn={() => {}}
          onRemoveWalkIn={() => {}}
          onSimulateVehicleArrival={() => {}}
          onResetDemo={() => {}}
          onGoldenTimeRush={() => {}}
          onClose={() => {}}
          walkInCount={2}
          aheadTeams={4}
          estimatedWaitMin={20}
        />
      );

      const allElements = screen.getAllByRole('button');
      for (const el of allElements) {
        const cls = el.className;
        const nakedHoverMatches = cls.match(/\bhover:([a-zA-Z0-9\-[\]/]+)/g);
        expect(
          nakedHoverMatches,
          `Found naked hover utility in rendered DemoPanel button: ${nakedHoverMatches}`
        ).toBeNull();
      }
    });

    it('empirically verifies static source file DemoPanel.tsx has ZERO naked hover: utilities', () => {
      expect(fs.existsSync(demoPanelSrcPath), `File must exist: ${demoPanelSrcPath}`).toBe(true);
      const source = fs.readFileSync(demoPanelSrcPath, 'utf-8');
      const rawHoverMatches = [...source.matchAll(/\bhover:([a-zA-Z0-9\-[\]/]+)/g)];
      expect(
        rawHoverMatches.map((m) => m[0]),
        `Found raw hover utility in ${demoPanelSrcPath}`
      ).toEqual([]);
    });

    it('empirically verifies touch-isolated .touch-hover-* classes on DemoPanel buttons', () => {
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

      const closeBtn = screen.getByRole('button', { name: '데모 닫기' });
      expect(closeBtn.className).toContain('touch-hover-slate-700');

      const addBtn = screen.getByRole('button', { name: '현장 +1팀' });
      expect(addBtn.className).toContain('touch-hover-indigo-500');

      const removeBtn = screen.getByRole('button', { name: '현장 -1팀' });
      expect(removeBtn.className).toContain('touch-hover-slate-700');

      const goldenTimeBtn = screen.getByRole('button', { name: '+3팀 골든타임 시연' });
      expect(goldenTimeBtn.className).toContain('touch-hover-amber-400');

      const arrivalBtn = screen.getByRole('button', { name: '하차 확인 이벤트 발생' });
      expect(arrivalBtn.className).toContain('touch-hover-emerald-500');

      const resetBtn = screen.getByRole('button', { name: /시연 초기 상태로 리셋/i });
      expect(resetBtn.className).toContain('touch-hover-slate-700');
    });

    it('empirically verifies index.css isolates .touch-hover-* rules inside @media (hover: hover) and (pointer: fine)', () => {
      expect(fs.existsSync(indexCssPath), `File must exist: ${indexCssPath}`).toBe(true);
      const css = fs.readFileSync(indexCssPath, 'utf-8');

      // Verify active-press definition
      expect(css).toContain('.active-press');
      expect(css).toContain('transform: scale(0.97)');

      // Verify hover isolation media query exists
      expect(css).toContain('@media (hover: hover) and (pointer: fine)');

      // Extract the media query block
      const mediaStart = css.indexOf('@media (hover: hover) and (pointer: fine)');
      expect(mediaStart).toBeGreaterThan(-1);
      const reducedMotionStart = css.indexOf('@media (prefers-reduced-motion: reduce)');
      const mediaContent = css.slice(mediaStart, reducedMotionStart > -1 ? reducedMotionStart : undefined);

      // Verify the critical touch-hover tokens reside INSIDE the fine pointing media query
      expect(mediaContent).toContain('.touch-hover-slate-700:hover');
      expect(mediaContent).toContain('.touch-hover-indigo-500:hover');
      expect(mediaContent).toContain('.touch-hover-amber-400:hover');
      expect(mediaContent).toContain('.touch-hover-emerald-500:hover');
      expect(mediaContent).toContain('.touch-hover-text-slate-200:hover');
    });
  });

  // =========================================================================
  // 4. Boundary, Fallbacks & Stress Scenarios
  // =========================================================================
  describe('4. Boundary, Fallbacks & Stress Scenarios', () => {
    it('empirically verifies close button is cleanly omitted when onClose is undefined', () => {
      render(
        <DemoPanel
          onAddWalkIn={() => {}}
          onRemoveWalkIn={() => {}}
          onSimulateVehicleArrival={() => {}}
          onResetDemo={() => {}}
        />
      );

      // No close button should be rendered
      expect(screen.queryByRole('button', { name: '데모 닫기' })).toBeNull();
      // Total buttons should be 5
      expect(screen.getAllByRole('button').length).toBe(5);
    });

    it('empirically verifies golden time rush falls back to calling handleAdd 3 times when onGoldenTimeRush is omitted', () => {
      const mockAdd = vi.fn();
      render(
        <DemoPanel
          onAddWalkIn={mockAdd}
          onRemoveWalkIn={() => {}}
          onSimulateVehicleArrival={() => {}}
          onResetDemo={() => {}}
        />
      );

      const goldenTimeBtn = screen.getByRole('button', { name: '+3팀 골든타임 시연' });
      fireEvent.click(goldenTimeBtn);

      expect(mockAdd).toHaveBeenCalledTimes(3);
    });

    it('empirically verifies compatibility aliases: onIncrementWalkIn, onDecrementWalkIn, onSimulateAlighting, onSimulateGoldenTime', () => {
      const incSpy = vi.fn();
      const decSpy = vi.fn();
      const alightSpy = vi.fn();
      const goldenSpy = vi.fn();

      render(
        <DemoPanel
          onAddWalkIn={() => {}}
          onRemoveWalkIn={() => {}}
          onSimulateVehicleArrival={() => {}}
          onResetDemo={() => {}}
          onIncrementWalkIn={incSpy}
          onDecrementWalkIn={decSpy}
          onSimulateAlighting={alightSpy}
          onSimulateGoldenTime={goldenSpy}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: '현장 +1팀' }));
      expect(incSpy).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: '현장 -1팀' }));
      expect(decSpy).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: '+3팀 골든타임 시연' }));
      expect(goldenSpy).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: '하차 확인 이벤트 발생' }));
      expect(alightSpy).toHaveBeenCalledTimes(1);
    });

    it('empirically verifies barrel re-export fidelity: DemoPanelBarrel equals canonical DemoPanel', () => {
      expect(DemoPanelBarrel).toBe(DemoPanel);
      expect(DemoPanelNamed).toBe(DemoPanel);
    });

    it('empirically verifies robust burst clicking without runtime errors or uncaught exceptions', () => {
      const mockAdd = vi.fn();
      const mockRemove = vi.fn();
      const mockArrival = vi.fn();
      const mockRush = vi.fn();
      const mockReset = vi.fn();

      render(
        <DemoPanel
          onAddWalkIn={mockAdd}
          onRemoveWalkIn={mockRemove}
          onSimulateVehicleArrival={mockArrival}
          onResetDemo={mockReset}
          onGoldenTimeRush={mockRush}
          walkInCount={0}
        />
      );

      const addBtn = screen.getByRole('button', { name: '현장 +1팀' });
      const removeBtn = screen.getByRole('button', { name: '현장 -1팀' });
      const rushBtn = screen.getByRole('button', { name: '+3팀 골든타임 시연' });
      const arrivalBtn = screen.getByRole('button', { name: '하차 확인 이벤트 발생' });
      const resetBtn = screen.getByRole('button', { name: /시연 초기 상태로 리셋/i });

      // Burst tap 10 times each
      for (let i = 0; i < 10; i++) {
        fireEvent.click(addBtn);
        fireEvent.click(removeBtn);
        fireEvent.click(rushBtn);
        fireEvent.click(arrivalBtn);
        fireEvent.click(resetBtn);
      }

      expect(mockAdd).toHaveBeenCalledTimes(10);
      expect(mockRemove).toHaveBeenCalledTimes(10);
      expect(mockRush).toHaveBeenCalledTimes(10);
      expect(mockArrival).toHaveBeenCalledTimes(10);
      expect(mockReset).toHaveBeenCalledTimes(10);
    });

    it('empirically verifies live badge with ping animation is rendered in DemoPanel header', () => {
      render(
        <DemoPanel
          onAddWalkIn={() => {}}
          onRemoveWalkIn={() => {}}
          onSimulateVehicleArrival={() => {}}
          onResetDemo={() => {}}
          onClose={() => {}}
        />
      );

      const badge = screen.getByText('실시간 연동');
      expect(badge).toBeDefined();
      const badgeContainer = badge.closest('span.inline-flex')!;
      expect(badgeContainer).not.toBeNull();
      expect(badgeContainer.className).toContain('text-emerald-300');

      // Check ping pulse indicator element inside
      const pingPulse = badgeContainer.querySelector('.animate-ping');
      expect(pingPulse).not.toBeNull();
    });
  });
});
