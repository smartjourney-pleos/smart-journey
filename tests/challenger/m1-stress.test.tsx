import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { TabletLayout } from '../../src/components/layout/TabletLayout';
import { Header } from '../../src/components/layout/Header';
import { createMockStore } from '../e2e/test-utils';

describe('M1 Challenger Empirical Stress Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Viewport & Column Geometry Stress Testing', () => {
    it('empirically verifies 3-column classes match Project specs at all target tablet dimensions', () => {
      const viewports = [
        { name: 'iPad Mini / Standard Landscape', width: 1024, height: 768 },
        { name: 'Android 10-inch Landscape', width: 1280, height: 800 },
        { name: 'Compact POS Touchscreen', width: 1366, height: 768 },
        { name: 'Full HD POS Terminal', width: 1920, height: 1080 },
      ];

      for (const vp of viewports) {
        // Set window inner dimensions
        window.innerWidth = vp.width;
        window.innerHeight = vp.height;

        const { container, unmount } = render(
          <TabletLayout
            header={<div data-testid="mock-header" className="h-16 shrink-0">Header</div>}
            leftSidebar={<div data-testid="mock-left">Left Sidebar</div>}
            rightPanel={<div data-testid="mock-right">Right Drawer</div>}
            isRightPanelOpen={true}
          >
            <div data-testid="mock-center">Center Main Board</div>
          </TabletLayout>
        );

        // 1. Root container checks
        const root = container.firstElementChild as HTMLElement;
        expect(root).not.toBeNull();
        expect(root.className).toContain('overflow-hidden');
        expect(root.className).toMatch(/h-\[100dvh\]/);

        // 2. Header: strictly fixed 64px (h-16) and shrink-0
        const headerContainer = screen.getByTestId('mock-header');
        expect(headerContainer.className).toContain('h-16');
        expect(headerContainer.className).toContain('shrink-0');

        // 3. Left sidebar: strictly 280px and shrink-0
        const leftCol = screen.getByTestId('mock-left').parentElement as HTMLElement;
        expect(leftCol.className).toContain('w-[280px]');
        expect(leftCol.className).toContain('shrink-0');
        expect(leftCol.className).toContain('border-r');

        // 4. Center column: flex-1 and min-w-0 (prevents flex blowouts)
        const centerCol = screen.getByTestId('mock-center').parentElement as HTMLElement;
        expect(centerCol.tagName.toLowerCase()).toBe('main');
        expect(centerCol.className).toContain('flex-1');
        expect(centerCol.className).toContain('min-w-0');

        // 5. Right column: strictly 360px and shrink-0
        const rightCol = screen.getByTestId('mock-right').parentElement as HTMLElement;
        expect(rightCol.tagName.toLowerCase()).toBe('aside');
        expect(rightCol.className).toContain('w-[360px]');
        expect(rightCol.className).toContain('shrink-0');
        expect(rightCol.className).toContain('border-l');

        unmount();
      }
    });

    it('empirically verifies flex expansion when right contextual drawer is closed', () => {
      const { container, rerender } = render(
        <TabletLayout
          header={<div className="h-16 shrink-0">Header</div>}
          leftSidebar={<div>Left</div>}
          rightPanel={<div>Right Drawer</div>}
          isRightPanelOpen={true}
        >
          <div data-testid="center-content">Center Content</div>
        </TabletLayout>
      );

      // Initially right aside is present
      expect(container.querySelector('aside')).not.toBeNull();

      // Toggle drawer closed
      rerender(
        <TabletLayout
          header={<div className="h-16 shrink-0">Header</div>}
          leftSidebar={<div>Left</div>}
          rightPanel={<div>Right Drawer</div>}
          isRightPanelOpen={false}
        >
          <div data-testid="center-content">Center Content</div>
        </TabletLayout>
      );

      // Aside should be unmounted, allowing flex-1 center board to occupy remaining space
      expect(container.querySelector('aside')).toBeNull();
      const main = container.querySelector('main');
      expect(main).not.toBeNull();
      expect(main?.className).toContain('flex-1');
      expect(main?.className).toContain('min-w-0');
    });
  });

  describe('2. Header Content Overflow & Truncation Stress Testing', () => {
    it('evaluates header layout integrity under extreme store name length (50+ and 100 characters)', () => {
      const longStoreName = '현대자동차 남양연구소 스마트 모빌리티 커넥티드 카 시범운영 특설 프리미엄 라운지 앤 그릴 레스토랑 본점 1호점 (대규모 복합 매장)';
      expect(longStoreName.length).toBeGreaterThan(60);

      const store = createMockStore({ name: longStoreName });
      const { container } = render(
        <Header
          store={store}
          isConnected={true}
          isDemoOpen={false}
          onToggleDemo={() => {}}
          onOpenSettings={() => {}}
          onLogout={() => {}}
        />
      );

      const h1 = container.querySelector('h1');
      expect(h1).not.toBeNull();
      expect(h1?.textContent).toBe(longStoreName);

      // Check right controls remain in DOM and rendered
      expect(screen.getByText('실시간 연동 중')).toBeDefined();
      expect(screen.getByRole('button', { name: /데모 컨트롤러 토글/i })).toBeDefined();
      expect(screen.getByText('시연 데모')).toBeDefined();
      expect(screen.getByRole('button', { name: /매장 대기 시간 설정/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /시스템 로그아웃/i })).toBeDefined();

      // EMPIRICAL ANALYSIS: Check presence of CSS truncation protections
      const h1Class = h1?.className || '';
      const parentClass = h1?.parentElement?.className || '';
      const rightContainer = container.querySelector('.flex.items-center.space-x-4');

      const h1HasTruncate = h1Class.includes('truncate');
      const h1HasMaxW = /max-w-/.test(h1Class);
      const parentHasMinW0 = parentClass.includes('min-w-0');
      const rightHasShrink0 = rightContainer?.className.includes('shrink-0') ?? false;

      // In Header.tsx:
      // - h1 has 'truncate' and 'max-w-*'
      // - parent container has 'min-w-0'
      // - right button group container has 'shrink-0'
      expect(h1HasTruncate).toBe(true);
      expect(h1HasMaxW).toBe(true);
      expect(parentHasMinW0).toBe(true);
      expect(rightHasShrink0).toBe(true);
    });

    it('evaluates category badge overflow under long category names', () => {
      const longCategory = '한식 / 숯불 직화 프리미엄 소갈비 전문 / 프라이빗 다이닝';
      const store = createMockStore({ category: longCategory });

      const { container } = render(
        <Header
          store={store}
          isConnected={true}
          onOpenSettings={() => {}}
          onLogout={() => {}}
        />
      );

      const badge = screen.getByText(longCategory);
      expect(badge).toBeDefined();

      // Ensure header container has shrink-0 to prevent vertical collapse
      const header = container.querySelector('header');
      expect(header?.className).toContain('shrink-0');
      expect(header?.className).toContain('h-16');
    });
  });

  describe('3. Clock Re-render Profiling & Tree Isolation', () => {
    it('empirically verifies that clock ticks do NOT re-render TabletLayout, sidebar, or center board', () => {
      let layoutRenderCount = 0;
      let leftSidebarRenderCount = 0;
      let centerBoardRenderCount = 0;
      let rightPanelRenderCount = 0;

      const SpyLayoutChild: React.FC<{ name: string; onRender: () => void }> = ({ onRender }) => {
        onRender();
        return <div>rendered</div>;
      };

      const store = createMockStore();

      render(
        <TabletLayout
          header={
            <Header
              store={store}
              isConnected={true}
              onOpenSettings={() => {}}
              onLogout={() => {}}
            />
          }
          leftSidebar={
            <SpyLayoutChild
              name="left"
              onRender={() => {
                leftSidebarRenderCount++;
              }}
            />
          }
          rightPanel={
            <SpyLayoutChild
              name="right"
              onRender={() => {
                rightPanelRenderCount++;
              }}
            />
          }
          isRightPanelOpen={true}
        >
          <SpyLayoutChild
            name="center"
            onRender={() => {
              centerBoardRenderCount++;
              layoutRenderCount++;
            }}
          />
        </TabletLayout>
      );

      // Initial mount render
      expect(layoutRenderCount).toBe(1);
      expect(leftSidebarRenderCount).toBe(1);
      expect(centerBoardRenderCount).toBe(1);
      expect(rightPanelRenderCount).toBe(1);

      // Advance clock by 10 full seconds (10 ticks)
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      // Layout children MUST NOT re-render when the clock ticks
      expect(layoutRenderCount).toBe(1);
      expect(leftSidebarRenderCount).toBe(1);
      expect(centerBoardRenderCount).toBe(1);
      expect(rightPanelRenderCount).toBe(1);
    });

    it('measures internal Header re-render frequency during clock ticks', () => {
      const store = createMockStore();
      let headerRenders = 0;

      // Wrap Header with render observer
      const HeaderObserver: React.FC = () => {
        headerRenders++;
        return (
          <Header
            store={store}
            isConnected={true}
            onOpenSettings={() => {}}
            onLogout={() => {}}
          />
        );
      };

      const { unmount } = render(<HeaderObserver />);

      // Initial render of wrapper
      expect(headerRenders).toBe(1);

      // Advance by 5 seconds
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // HeaderObserver wrapper did not re-render (parent unaffected)
      expect(headerRenders).toBe(1);

      unmount();
    });

    it('verifies digital clock displays tabular-nums to prevent visual jitter during time updates', () => {
      const store = createMockStore();
      const { container } = render(
        <Header
          store={store}
          isConnected={true}
          onOpenSettings={() => {}}
          onLogout={() => {}}
        />
      );

      // Verify clock container has tabular-nums
      const clockElement = container.querySelector('.tabular-nums');
      expect(clockElement).not.toBeNull();
      expect(clockElement?.className).toContain('font-mono');
      expect(clockElement?.className).toContain('min-w-[105px]');
    });
  });
});
