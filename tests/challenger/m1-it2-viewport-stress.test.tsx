import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { TabletLayout } from '../../src/components/layout/TabletLayout';
import { Header } from '../../src/components/layout/Header';
import { createMockStore } from '../e2e/test-utils';

describe('M1 Iteration 2 Challenger: Viewport & Layout Empirical Stress Suite', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Viewport Matrix Stress (1024x768 to 1920x1080)', () => {
    const viewports = [
      { name: '1024x768 (iPad Landscape Minimum)', width: 1024, height: 768 },
      { name: '1280x800 (Android 10-inch Standard)', width: 1280, height: 800 },
      { name: '1366x768 (Compact Commercial POS)', width: 1366, height: 768 },
      { name: '1440x900 (High-res Tablet / Desktop)', width: 1440, height: 900 },
      { name: '1920x1080 (Full HD POS Terminal)', width: 1920, height: 1080 },
    ];

    it.each(viewports)('preserves 3-column architecture and header height at $name ($width x $height)', ({ width, height }) => {
      window.innerWidth = width;
      window.innerHeight = height;

      const store = createMockStore();
      const { container, unmount } = render(
        <TabletLayout
          header={
            <Header
              store={store}
              isConnected={true}
              isDemoOpen={false}
              onToggleDemo={() => {}}
              onOpenSettings={() => {}}
              onLogout={() => {}}
            />
          }
          leftSidebar={<div data-testid="sidebar-content">Sidebar 280px</div>}
          rightPanel={<div data-testid="drawer-content">Drawer 360px</div>}
          isRightPanelOpen={true}
        >
          <div data-testid="board-content">Main Board</div>
        </TabletLayout>
      );

      // Verify header height invariant: strictly 64px (h-16) and shrink-0
      const header = container.querySelector('header');
      expect(header).not.toBeNull();
      expect(header?.className).toContain('h-16');
      expect(header?.className).toContain('shrink-0');
      expect(header?.className).toContain('justify-between');

      // Verify left sidebar column: strictly 280px and shrink-0
      const leftCol = screen.getByTestId('sidebar-content').parentElement;
      expect(leftCol?.className).toContain('w-[280px]');
      expect(leftCol?.className).toContain('shrink-0');

      // Verify center main column: flex-1 and min-w-0
      const centerCol = screen.getByTestId('board-content').parentElement;
      expect(centerCol?.tagName.toLowerCase()).toBe('main');
      expect(centerCol?.className).toContain('flex-1');
      expect(centerCol?.className).toContain('min-w-0');

      // Verify right panel column: strictly 360px and shrink-0
      const rightCol = screen.getByTestId('drawer-content').parentElement;
      expect(rightCol?.tagName.toLowerCase()).toBe('aside');
      expect(rightCol?.className).toContain('w-[360px]');
      expect(rightCol?.className).toContain('shrink-0');

      unmount();
    });
  });

  describe('2. Extreme Store Name Content Stress', () => {
    const extremeStoreNames = [
      {
        scenario: '50+ characters store name',
        name: '현대자동차 남양연구소 스마트 모빌리티 커넥티드 카 시범운영 특설 프리미엄 라운지 앤 그릴 레스토랑',
      },
      {
        scenario: '100+ characters store name',
        name: '현대자동차 남양연구소 스마트 모빌리티 커넥티드 카 시범운영 특설 프리미엄 라운지 앤 그릴 레스토랑 본점 1호점 (대규모 복합 매장 직영점 특수 구역 내 위치한 최첨단 미래형 스마트 다이닝 라운지)',
      },
      {
        scenario: 'Unbroken single-word string without whitespace',
        name: 'SupercalifragilisticexpialidociousLongWordWithoutAnySpacesAtAllThatCouldBreakLayoutIfNoTruncateTokenIsApplied',
      },
      {
        scenario: 'Special characters, emojis, and HTML-like tokens',
        name: '🚗 Hyundai & Genesis VIP Lounge <B2-Special> "Main" \'Branch\' #1 (100% Guaranteed)',
      },
      {
        scenario: 'Empty store name',
        name: '',
      },
    ];

    it.each(extremeStoreNames)('maintains layout integrity and truncation under $scenario', ({ name }) => {
      const store = createMockStore({ name });
      const { container } = render(
        <Header
          store={store}
          isConnected={true}
          isDemoOpen={true}
          onToggleDemo={() => {}}
          onOpenSettings={() => {}}
          onLogout={() => {}}
        />
      );

      const h1 = container.querySelector('h1');
      expect(h1).not.toBeNull();
      expect(h1?.textContent).toBe(name);

      // Verify title attribute for accessibility and truncated tooltip
      expect(h1?.getAttribute('title')).toBe(name);

      // Verify truncation and maximum width tokens
      expect(h1?.className).toContain('truncate');
      expect(h1?.className).toContain('max-w-[240px]');

      // Verify parent min-w-0 prevents flex blowout
      expect(h1?.parentElement?.className).toContain('min-w-0');

      // Verify right action container has shrink-0 to prevent compression
      const rightContainer = container.querySelector('.flex.items-center.gap-5');
      expect(rightContainer?.className).toContain('shrink-0');

      // Verify all three control buttons remain mounted and interactive
      expect(screen.getByRole('button', { name: /데모 컨트롤러 토글/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /매장 대기 시간 설정/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /시스템 로그아웃/i })).toBeDefined();
    });

    it('handles long category names with shrink-0 badge preservation', () => {
      const longCategory = '한식 / 프리미엄 숯불 직화 소갈비 전문 / 프라이빗 VIP 다이닝 코스';
      const store = createMockStore({ category: longCategory });
      const { container } = render(
        <Header
          store={store}
          isConnected={true}
          onOpenSettings={() => {}}
          onLogout={() => {}}
        />
      );

      const categorySpan = screen.getByText(longCategory);
      expect(categorySpan).toBeDefined();
      expect(categorySpan.className).toContain('shrink-0');

      // Header remains strictly h-16
      const header = container.querySelector('header');
      expect(header?.className).toContain('h-16');
      expect(header?.className).toContain('shrink-0');
    });
  });

  describe('3. Touch Target Geometry & Tactile Feedback Verification', () => {
    it('empirically asserts all header buttons strictly satisfy >= 48px touch target height', () => {
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

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(3);

      buttons.forEach((btn) => {
        const cls = btn.className;

        // Verify minimum touch height
        const hasMinH48 = cls.includes('min-h-[48px]');
        const hasH12 = cls.includes('h-12');
        expect(hasMinH48).toBe(true);
        expect(hasH12).toBe(true);

        // Verify horizontal touch padding
        expect(cls).toContain('px-4');

        // Verify tactile feedback token
        expect(cls).toContain('active-press');

        // Verify NO ad-hoc active:scale-97
        expect(cls).not.toContain('active:scale-97');

        // Verify touch-isolated hover (NO raw hover:)
        const classList = cls.split(/\s+/);
        const rawHoverClasses = classList.filter((c) => c.startsWith('hover:'));
        expect(rawHoverClasses).toEqual([]);

        // Verify cursor pointer
        expect(cls).toContain('cursor-pointer');

        // Verify shrink-0 to prevent lateral collapse
        expect(cls).toContain('shrink-0');
      });
    });

    it('applies correct state-dependent styling when demo panel is open vs closed', () => {
      const store = createMockStore();
      const { rerender } = render(
        <Header
          store={store}
          isConnected={true}
          isDemoOpen={false}
          onToggleDemo={() => {}}
          onOpenSettings={() => {}}
          onLogout={() => {}}
        />
      );

      // Demo button when closed: slate background with touch-hover-sunken
      let demoBtn = screen.getByRole('button', { name: /데모 컨트롤러 토글/i });
      expect(demoBtn.className).toContain('bg-surface');
      expect(demoBtn.className).toContain('touch-hover-sunken');
      expect(demoBtn.className).toContain('text-ink');

      // Rerender with isDemoOpen = true
      rerender(
        <Header
          store={store}
          isConnected={true}
          isDemoOpen={true}
          onToggleDemo={() => {}}
          onOpenSettings={() => {}}
          onLogout={() => {}}
        />
      );

      demoBtn = screen.getByRole('button', { name: /데모 컨트롤러 토글/i });
      expect(demoBtn.className).toContain('bg-sub-tint');
      expect(demoBtn.className).toContain('text-ink');
      expect(demoBtn.className).toContain('border-sub');
    });

    it('gracefully renders when onToggleDemo is omitted', () => {
      const store = createMockStore();
      render(
        <Header
          store={store}
          isConnected={true}
          onOpenSettings={() => {}}
          onLogout={() => {}}
        />
      );

      // Demo button should not be rendered
      expect(screen.queryByRole('button', { name: /데모 컨트롤러 토글/i })).toBeNull();

      // Settings and logout buttons must still be rendered and meet standards
      const settingsBtn = screen.getByRole('button', { name: /매장 대기 시간 설정/i });
      const logoutBtn = screen.getByRole('button', { name: /시스템 로그아웃/i });
      expect(settingsBtn).toBeDefined();
      expect(logoutBtn).toBeDefined();
      expect(settingsBtn.className).toContain('min-h-[48px]');
      expect(logoutBtn.className).toContain('min-h-[48px]');
    });
  });

  describe('4. STOMP Real-Time Badge & Live Clock Resilience', () => {
    it('empirically verifies STOMP connection status rendering and styling transitions', () => {
      const store = createMockStore();
      const { rerender } = render(
        <Header
          store={store}
          isConnected={true}
          onOpenSettings={() => {}}
          onLogout={() => {}}
        />
      );

      // Connected state
      expect(screen.getByText('실시간 연동 중')).toBeDefined();
      const connectedDot = screen.getByText('실시간 연동 중').previousElementSibling;
      expect(connectedDot?.className).toContain('bg-main');

      // Disconnected / Reconnecting state
      rerender(
        <Header
          store={store}
          isConnected={false}
          onOpenSettings={() => {}}
          onLogout={() => {}}
        />
      );

      expect(screen.getByText('실시간 재연결 중')).toBeDefined();
      const disconnectedDot = screen.getByText('실시간 재연결 중').previousElementSibling;
      expect(disconnectedDot?.className).toContain('bg-sub');
      expect(disconnectedDot?.className).not.toContain('animate-');
    });

    it('verifies clock formatting and periodic tick isolation', () => {
      const store = createMockStore();
      const { container } = render(
        <Header
          store={store}
          isConnected={true}
          onOpenSettings={() => {}}
          onLogout={() => {}}
        />
      );

      const clockContainer = container.querySelector('.tabular-nums');
      expect(clockContainer).not.toBeNull();
      expect(clockContainer?.className).toContain('tabular-nums');
      expect(clockContainer?.className).toContain('min-w-[78px]');

      // Advance by 1 second
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Clock string should have 8 chars (HH:mm:ss)
      expect(clockContainer?.textContent).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });
  });
});
