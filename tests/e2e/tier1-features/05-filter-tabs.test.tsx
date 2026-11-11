import { describe, it, expect } from 'vitest';
import { screen, render } from '@testing-library/react';
import { QueueBoard } from '../../../src/components/QueueBoard';
import { renderLoggedInApp, createMockItem } from '../test-utils';

describe('Tier 1 - Feature 05: Queue Filter Tabs & Categories', () => {
  it('displays real-time waiting status section title', async () => {
    await renderLoggedInApp();
    expect(screen.getByText('실시간 웨이팅 현황')).toBeDefined();
  });

  it('renders queue count pill badge with format "N 건"', async () => {
    await renderLoggedInApp();
    const countBadge = screen.getByText(/3 건/i);
    expect(countBadge).toBeDefined();
  });

  it('labels each card with its channel instead of a separate legend', async () => {
    await renderLoggedInApp();
    expect(screen.getAllByText('차량 인증').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('일반 현장').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(/차량 자동 등록/)).toBeNull();
  });

  it('reflects correct queue count badge for custom queue sizes', () => {
    const queue = [
      createMockItem({ ticketNo: 1 }),
      createMockItem({ ticketNo: 2 }),
      createMockItem({ ticketNo: 3 }),
      createMockItem({ ticketNo: 4 }),
      createMockItem({ ticketNo: 5 }),
    ];
    render(
      <QueueBoard
        queue={queue}
        aheadTeams={5}
        estimatedWaitMin={25}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByText('5 건')).toBeDefined();
  });
});
