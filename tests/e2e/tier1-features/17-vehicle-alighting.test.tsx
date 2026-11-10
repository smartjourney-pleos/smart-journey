import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderLoggedInApp } from '../test-utils';

describe('Tier 1 - Feature 17: Vehicle Arrival & Alighting Trigger', () => {
  it('triggers vehicle arrival simulation when "하차 확인 이벤트 발생" is clicked', async () => {
    await renderLoggedInApp();
    const simBtn = screen.getByRole('button', { name: /하차 확인 이벤트 발생/i });
    fireEvent.click(simBtn);

    // Vehicle cards should display "현장 도착" status badge
    const arrivedBadges = screen.getAllByText('현장 도착');
    expect(arrivedBadges.length).toBeGreaterThan(0);
  });

  it('updates remaining time to "도착 완료" for arrived vehicles', async () => {
    await renderLoggedInApp();
    const simBtn = screen.getByRole('button', { name: /하차 확인 이벤트 발생/i });
    fireEvent.click(simBtn);

    const completedTimes = screen.getAllByText('도착 완료');
    expect(completedTimes.length).toBeGreaterThanOrEqual(2);
  });

  it('displays "M/N명 하차 완료" badge on arrived vehicle cards', async () => {
    await renderLoggedInApp();
    const simBtn = screen.getByRole('button', { name: /하차 확인 이벤트 발생/i });
    fireEvent.click(simBtn);

    // Initial vehicle tickets 12 has 4 people, ticket 14 has 2 people
    expect(screen.getByText(/4\/4명 하차 완료/i)).toBeDefined();
    expect(screen.getByText(/2\/2명 하차 완료/i)).toBeDefined();
  });

  it('does not alter walk-in orders when vehicle arrival is triggered', async () => {
    await renderLoggedInApp();
    const simBtn = screen.getByRole('button', { name: /하차 확인 이벤트 발생/i });
    fireEvent.click(simBtn);

    // Ticket 13 is general walk-in with status REGISTERED ('이동 중')
    expect(screen.getAllByText('이동 중').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('13')).toBeDefined();
  });

  it('applies emerald border treatment to arrived vehicle cards', async () => {
    const { container } = await renderLoggedInApp();
    const simBtn = screen.getByRole('button', { name: /하차 확인 이벤트 발생/i });
    fireEvent.click(simBtn);

    const emeraldCards = container.querySelectorAll('.border-emerald-500\\/40');
    expect(emeraldCards.length).toBeGreaterThanOrEqual(2);
  });
});
