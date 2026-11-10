import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import fs from 'node:fs';
import path from 'node:path';
import { WaitingCard } from '../../src/components/queue/WaitingCard';
import { StoreSummary } from '../../src/components/sidebar/StoreSummary';
import type { WaitingItem, QueueFilterTab } from '../../src/types/pos';
import { createMockItem } from '../e2e/test-utils';

describe('Milestone M2 Iteration 2 Challenger 2: Hover Isolation & Active-Press Stress Suite', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const indexCssPath = path.join(rootDir, 'src/index.css');
  const waitingCardPath = path.join(rootDir, 'src/components/queue/WaitingCard.tsx');
  const waitingCardWrapperPath = path.join(rootDir, 'src/components/WaitingCard.tsx');
  const storeSummaryPath = path.join(rootDir, 'src/components/sidebar/StoreSummary.tsx');

  // =========================================================================
  // Target 1: Complete absence of raw hover: utility classes
  // =========================================================================
  describe('1. Raw hover: Utility Class Elimination Verification', () => {
    it('empirically verifies zero raw hover: utilities exist in WaitingCard source files', () => {
      const paths = [waitingCardPath, waitingCardWrapperPath];
      for (const p of paths) {
        expect(fs.existsSync(p), `File must exist: ${p}`).toBe(true);
        const source = fs.readFileSync(p, 'utf-8');
        const rawHoverMatches = [...source.matchAll(/\bhover:([a-zA-Z0-9\-[\]/]+)/g)];
        expect(
          rawHoverMatches.map((m) => m[0]),
          `Found raw hover utility in ${p}`
        ).toEqual([]);
      }
    });

    it('empirically verifies zero raw hover: utilities exist in StoreSummary source file', () => {
      expect(fs.existsSync(storeSummaryPath), `File must exist: ${storeSummaryPath}`).toBe(true);
      const source = fs.readFileSync(storeSummaryPath, 'utf-8');
      const rawHoverMatches = [...source.matchAll(/\bhover:([a-zA-Z0-9\-[\]/]+)/g)];
      expect(
        rawHoverMatches.map((m) => m[0]),
        `Found raw hover utility in ${storeSummaryPath}`
      ).toEqual([]);
    });

    it('stress tests all WaitingCard DOM state permutations for complete absence of hover: in rendered classes', () => {
      const statuses: WaitingItem['status'][] = ['REGISTERED', 'MOVING', 'ARRIVED', 'CALLED'];
      const channels: WaitingItem['channel'][] = ['VEHICLE', 'WALK_IN'];
      const selectStates = [false, true];
      const arrivalResults: (WaitingItem['arrivalResult'] | undefined)[] = [
        'CONFIRMED',
        'MANUAL',
        'UNCONFIRMED',
        undefined,
      ];

      for (const status of statuses) {
        for (const channel of channels) {
          for (const isSelected of selectStates) {
            for (const arrivalResult of arrivalResults) {
              const item = createMockItem({
                id: `perm-${status}-${channel}-${isSelected}-${arrivalResult ?? 'none'}`,
                status,
                channel,
                arrivalResult: arrivalResult ?? null,
                alighting:
                  arrivalResult === 'CONFIRMED'
                    ? { status: 'CONFIRMED', alightedCount: 2, totalPassengers: 2 }
                    : undefined,
              });

              const { container, unmount } = render(
                <WaitingCard
                  item={item}
                  isSelected={isSelected}
                  onCall={() => {}}
                  onSeat={() => {}}
                  onNoShow={() => {}}
                />
              );

              // Inspect all elements in container
              const allElements = container.querySelectorAll('*');
              for (const el of allElements) {
                const className = el.getAttribute('class') || '';
                const hoverMatches = className
                  .split(/\s+/)
                  .filter((cls) => cls.startsWith('hover:'));
                expect(
                  hoverMatches,
                  `Rendered element <${el.tagName}> contains raw hover: in state [${status}, ${channel}, sel=${isSelected}, arr=${arrivalResult}]`
                ).toEqual([]);
              }

              unmount();
            }
          }
        }
      }
    });

    it('stress tests StoreSummary DOM tree across all filter tabs and queue states for zero hover: classes', () => {
      const filters: QueueFilterTab[] = ['ALL', 'MOVING', 'ARRIVED', 'CALLED'];
      const testQueues: WaitingItem[][] = [
        [], // Empty queue
        [createMockItem({ id: 'q-1', channel: 'VEHICLE', status: 'MOVING' })],
        [
          createMockItem({ id: 'q-1', channel: 'VEHICLE', status: 'CALLED' }),
          createMockItem({ id: 'q-2', channel: 'WALK_IN', status: 'ARRIVED' }),
          createMockItem({ id: 'q-3', channel: 'WALK_IN', status: 'REGISTERED' }),
        ],
      ];

      for (const currentFilter of filters) {
        for (const queue of testQueues) {
          const { container, unmount } = render(
            <StoreSummary
              aheadTeams={queue.length}
              estimatedWaitMin={queue.length * 5}
              queue={queue}
              currentFilter={currentFilter}
              onFilterChange={() => {}}
            />
          );

          const allElements = container.querySelectorAll('*');
          for (const el of allElements) {
            const className = el.getAttribute('class') || '';
            const hoverMatches = className
              .split(/\s+/)
              .filter((cls) => cls.startsWith('hover:'));
            expect(
              hoverMatches,
              `Rendered StoreSummary element <${el.tagName}> contains raw hover:`
            ).toEqual([]);
          }

          unmount();
        }
      }
    });
  });

  // =========================================================================
  // Target 2: Placement of .touch-hover-* inside pointer: fine media query
  // =========================================================================
  describe('2. Media Query Encapsulation of .touch-hover-* Utilities', () => {
    it('empirically verifies @media (hover: hover) and (pointer: fine) block exists in index.css', () => {
      expect(fs.existsSync(indexCssPath)).toBe(true);
      const cssContent = fs.readFileSync(indexCssPath, 'utf-8');

      expect(cssContent).toContain('@media (hover: hover) and (pointer: fine)');
    });

    it('verifies ALL .touch-hover-* utility definitions are strictly enclosed inside the media query block', () => {
      const cssContent = fs.readFileSync(indexCssPath, 'utf-8');

      const startIdx = cssContent.indexOf('@media (hover: hover) and (pointer: fine)');
      expect(startIdx).toBeGreaterThan(-1);

      // Extract media block using brace counting
      const openBraceIdx = cssContent.indexOf('{', startIdx);
      let depth = 1;
      let endIdx = openBraceIdx + 1;
      while (endIdx < cssContent.length && depth > 0) {
        if (cssContent[endIdx] === '{') depth++;
        else if (cssContent[endIdx] === '}') depth--;
        endIdx++;
      }

      const mediaBlock = cssContent.substring(startIdx, endIdx);
      const outsideBefore = cssContent.substring(0, startIdx);
      const outsideAfter = cssContent.substring(endIdx);

      // Check for leaks outside media query
      const leakedBefore = outsideBefore.match(/\.touch-hover-[a-zA-Z0-9\-_]+/g) || [];
      const leakedAfter = outsideAfter.match(/\.touch-hover-[a-zA-Z0-9\-_]+/g) || [];

      expect(leakedBefore, 'Detected .touch-hover-* class declared before media query').toEqual([]);
      expect(leakedAfter, 'Detected .touch-hover-* class declared after media query').toEqual([]);

      // Verify declared tokens inside media query
      const declaredInside = mediaBlock.match(/\.touch-hover-[a-zA-Z0-9\-_]+/g) || [];
      expect(declaredInside.length).toBeGreaterThanOrEqual(8);

      // Specific tokens expected by M2 specification
      const expectedTokens = [
        '.touch-hover-border-slate-600',
        '.touch-hover-indigo-500',
        '.touch-hover-amber-400',
        '.touch-hover-emerald-500',
        '.touch-hover-rose-900-70',
        '.touch-hover-text-rose-200',
        '.touch-hover-slate-800-70',
        '.touch-hover-text-slate-200',
      ];

      for (const token of expectedTokens) {
        expect(declaredInside, `Missing expected token ${token} inside media query`).toContain(
          token
        );
      }
    });

    it('verifies every .touch-hover-* class referenced by WaitingCard & StoreSummary has a corresponding CSS rule', () => {
      const cssContent = fs.readFileSync(indexCssPath, 'utf-8');
      const waitingCardSrc = fs.readFileSync(waitingCardPath, 'utf-8');
      const storeSummarySrc = fs.readFileSync(storeSummaryPath, 'utf-8');

      const usedInWaitingCard = waitingCardSrc.match(/touch-hover-[a-zA-Z0-9\-_]+/g) || [];
      const usedInStoreSummary = storeSummarySrc.match(/touch-hover-[a-zA-Z0-9\-_]+/g) || [];

      const allUsed = Array.from(new Set([...usedInWaitingCard, ...usedInStoreSummary]));
      expect(allUsed.length).toBeGreaterThanOrEqual(8);

      for (const className of allUsed) {
        const regex = new RegExp(`\\.${className}:hover\\s*\\{`);
        expect(
          regex.test(cssContent),
          `Class .${className}:hover rule not found in index.css`
        ).toBe(true);
      }
    });

    it('empirically verifies compiled production CSS retains the hover:hover and pointer:fine media query', () => {
      const distDir = path.join(rootDir, 'dist/assets');
      if (fs.existsSync(distDir)) {
        const cssFiles = fs.readdirSync(distDir).filter((f) => f.endsWith('.css'));
        if (cssFiles.length > 0) {
          const compiledCss = fs.readFileSync(path.join(distDir, cssFiles[0]), 'utf-8');
          // Vite/Tailwind minifies spaces: @media (hover:hover) and (pointer:fine)
          const hasCompiledMedia =
            compiledCss.includes('(hover:hover) and (pointer:fine)') ||
            compiledCss.includes('(hover: hover) and (pointer: fine)');
          expect(
            hasCompiledMedia,
            'Compiled production bundle must preserve (hover:hover) and (pointer:fine) media block'
          ).toBe(true);
        }
      }
    });
  });

  // =========================================================================
  // Target 3: .active-press responsiveness & CSS conflict freedom
  // =========================================================================
  describe('3. Emil Kowalski .active-press Tactile Deflection Verification', () => {
    it('empirically verifies .active-press and .active-press:active CSS rules in index.css', () => {
      const cssContent = fs.readFileSync(indexCssPath, 'utf-8');

      // 1. Definition check
      expect(cssContent).toContain('.active-press {');
      expect(cssContent).toContain('transition: transform 120ms var(--ease-out);');
      expect(cssContent).toContain('.active-press:active {');
      expect(cssContent).toContain('transform: scale(0.97);');

      // 2. Token sanity: --ease-out must be cubic-bezier(0.23, 1, 0.32, 1)
      expect(cssContent).toContain('--ease-out: cubic-bezier(0.23, 1, 0.32, 1);');
    });

    it('verifies .active-press is applied to WaitingCard container and all 3 action buttons', () => {
      const item = createMockItem({ id: 'btn-active-test', status: 'REGISTERED' });
      const { container } = render(
        <WaitingCard
          item={item}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      // Card root container
      const cardContainer = container.firstElementChild as HTMLElement;
      expect(cardContainer.className).toContain('active-press');

      // 3 Action buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(3);

      for (const btn of buttons) {
        expect(btn.className).toContain('active-press');
        expect(btn.className).toContain('touch-manipulation');
        expect(btn.className).toContain('cursor-pointer');
        expect(btn.className).toContain('select-none');
        expect(btn.className).toContain('min-h-[48px]');
        expect(btn.className).toContain('h-12');
      }
    });

    it('verifies .active-press is applied to all StoreSummary filter tabs', () => {
      const queue = [createMockItem({ id: 'tab-test-1' })];
      render(
        <StoreSummary
          aheadTeams={1}
          estimatedWaitMin={5}
          queue={queue}
          currentFilter="ALL"
          onFilterChange={() => {}}
        />
      );

      const filterTabs = ['전체', '이동 중', '도착팀', '호출팀'];
      for (const tabLabel of filterTabs) {
        const btn = screen.getByRole('button', { name: new RegExp(tabLabel) });
        expect(btn.className).toContain('active-press');
        expect(btn.className).toContain('min-h-[48px]');
        expect(btn.className).toContain('h-12');
        expect(btn.className).toContain('touch-manipulation');
        expect(btn.className).toContain('cursor-pointer');
      }
    });

    it('adversarially checks for CSS transform conflicts on WaitingCard during selection and active press', () => {
      const item = createMockItem({ id: 'conflict-test', status: 'REGISTERED' });
      const { rerender, container } = render(
        <WaitingCard
          item={item}
          isSelected={false}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      const unselectedCard = container.firstElementChild as HTMLElement;
      expect(unselectedCard.className).not.toContain('-translate-y-0.5');

      rerender(
        <WaitingCard
          item={item}
          isSelected={true}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      const selectedCard = container.firstElementChild as HTMLElement;
      // When isSelected is true, -translate-y-0.5 is present
      expect(selectedCard.className).toContain('-translate-y-0.5');
      expect(selectedCard.className).toContain('active-press');

      // Verify that in Tailwind 4, -translate-y-0.5 uses the modern 'translate' property,
      // which does not conflict with or overwrite 'transform: scale(0.97)' from .active-press:active.
      const distDir = path.join(rootDir, 'dist/assets');
      if (fs.existsSync(distDir)) {
        const cssFiles = fs.readdirSync(distDir).filter((f) => f.endsWith('.css'));
        if (cssFiles.length > 0) {
          const compiledCss = fs.readFileSync(path.join(distDir, cssFiles[0]), 'utf-8');
          // In Tailwind v4, translate-y utilities map to 'translate:', not 'transform:'
          expect(compiledCss).toMatch(/\.-translate-y-0\\\.5\{[^}]*translate:/);
          // And active-press maps to transform:scale(.97)
          expect(compiledCss).toContain('.active-press:active{transform:scale(.97)}');
        }
      }
    });

    it('verifies active:bg-* classes on action buttons do not touch or conflict with transform', () => {
      const item = createMockItem({ id: 'btn-conflict-test', status: 'ARRIVED' });
      render(
        <WaitingCard
          item={item}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      );

      const seatBtn = screen.getByRole('button', { name: /착석/i });
      expect(seatBtn.className).toContain('active:bg-emerald-700');
      expect(seatBtn.className).toContain('active-press');

      // Check compiled CSS to verify active:bg-emerald-700 only alters background-color
      const distDir = path.join(rootDir, 'dist/assets');
      if (fs.existsSync(distDir)) {
        const cssFiles = fs.readdirSync(distDir).filter((f) => f.endsWith('.css'));
        if (cssFiles.length > 0) {
          const compiledCss = fs.readFileSync(path.join(distDir, cssFiles[0]), 'utf-8');
          const ruleMatch = compiledCss.match(/\.active\\:bg-emerald-700:active\{([^}]+)\}/);
          expect(ruleMatch).not.toBeNull();
          if (ruleMatch) {
            expect(ruleMatch[1]).toContain('background-color');
            expect(ruleMatch[1]).not.toContain('transform');
            expect(ruleMatch[1]).not.toContain('scale');
          }
        }
      }
    });
  });
});
