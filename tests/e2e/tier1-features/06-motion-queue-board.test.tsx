import { describe, it, expect } from 'vitest';
import { screen, render } from '@testing-library/react';
import { QueueBoard } from '../../../src/components/QueueBoard';
import { renderLoggedInApp } from '../test-utils';

describe('Tier 1 - Feature 06: Fluid Motion Queue Board', () => {
  it('renders all initial queue items in the card grid', async () => {
    await renderLoggedInApp();
    expect(screen.getByText('12')).toBeDefined(); // ticket 12
    expect(screen.getByText('13')).toBeDefined(); // ticket 13
    expect(screen.getByText('14')).toBeDefined(); // ticket 14
  });

  it('renders empty queue state when queue array is empty', () => {
    render(
      <QueueBoard
        queue={[]}
        aheadTeams={0}
        estimatedWaitMin={0}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByText('현재 대기 중인 고객이 없습니다.')).toBeDefined();
  });

  it('displays descriptive guidance in empty queue state', () => {
    render(
      <QueueBoard
        queue={[]}
        aheadTeams={0}
        estimatedWaitMin={0}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(
      screen.getByText('차량 앱이나 현장에서 새 웨이팅이 접수되면 실시간으로 표시됩니다.')
    ).toBeDefined();
  });

  it('applies responsive grid classes for tablet columns', async () => {
    const { container } = await renderLoggedInApp();
    const grid = container.querySelector('.grid.gap-4[class*="auto-fill"]');
    expect(grid).not.toBeNull();
    expect(grid?.className).toContain('auto-fill');
  });

  it('provides dedicated vertical scrolling container with padding', async () => {
    const { container } = await renderLoggedInApp();
    const scrollContainer = container.querySelector('.overflow-y-auto');
    expect(scrollContainer).not.toBeNull();
  });
});
