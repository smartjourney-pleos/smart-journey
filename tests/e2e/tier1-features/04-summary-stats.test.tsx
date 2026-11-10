import { describe, it, expect } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import { QueueBoard } from '../../../src/components/QueueBoard';
import { renderLoggedInApp, createMockItem } from '../test-utils';

describe('Tier 1 - Feature 04: Left Sidebar Summary Statistics', () => {
  it('renders current total waiting teams with explicit "팀" unit label', async () => {
    await renderLoggedInApp();
    expect(screen.getByText('현재 총 대기')).toBeDefined();
    const teamUnits = screen.getAllByText('팀');
    expect(teamUnits.length).toBeGreaterThanOrEqual(2);
  });

  it('renders vehicle remote waiting teams with explicit "팀" unit label', async () => {
    await renderLoggedInApp();
    expect(screen.getByText('차량 원격 웨이팅')).toBeDefined();
  });

  it('renders estimated wait time with explicit "분" unit label', async () => {
    await renderLoggedInApp();
    expect(screen.getByText('예상 대기 시간')).toBeDefined();
    expect(screen.getByText('분')).toBeDefined();
  });

  it('accurately counts vehicle remote teams from queue items', () => {
    const queue = [
      createMockItem({ channel: 'VEHICLE' }),
      createMockItem({ channel: 'WALK_IN' }),
      createMockItem({ channel: 'VEHICLE' }),
    ];
    render(
      <QueueBoard
        queue={queue}
        aheadTeams={3}
        estimatedWaitMin={15}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    // 2 vehicle teams
    expect(screen.getByText('2')).toBeDefined();
  });

  it('dynamically updates total teams count when walk-in order is added via demo control', async () => {
    await renderLoggedInApp();
    const addBtn = screen.getByRole('button', { name: /현장 \+1팀/i });
    
    // Initial ahead count in mock is 3
    expect(screen.getByText('3')).toBeDefined();
    
    // Tap +1 walk-in
    fireEvent.click(addBtn);
    
    // Ahead count should now be 4
    expect(screen.getByText('4')).toBeDefined();
  });
});
