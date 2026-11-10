import { describe, it, expect } from 'vitest';
import { screen, render } from '@testing-library/react';
import { WaitingCard } from '../../../src/components/WaitingCard';
import { createMockItem } from '../test-utils';

describe('Tier 1 - Feature 07: Queue Card Visual Specs', () => {
  it('renders ticket number with No. label and monospace styling', () => {
    const item = createMockItem({ ticketNo: 42 });
    render(
      <WaitingCard
        item={item}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByText('No.')).toBeDefined();
    expect(screen.getByText('42')).toBeDefined();
  });

  it('renders "차량 인증" badge for VEHICLE channel orders', () => {
    const item = createMockItem({ channel: 'VEHICLE' });
    render(
      <WaitingCard
        item={item}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByText(/차량 인증/i)).toBeDefined();
  });

  it('renders "일반 현장" badge for WALK_IN channel orders', () => {
    const item = createMockItem({ channel: 'WALK_IN' });
    render(
      <WaitingCard
        item={item}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByText(/일반 현장/i)).toBeDefined();
  });

  it('renders party size with explicit "명" suffix', () => {
    const item = createMockItem({ partySize: 6 });
    render(
      <WaitingCard
        item={item}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByText('6명')).toBeDefined();
  });

  it('renders "다음 입장" label when position is 1, and "N번째" otherwise', () => {
    const firstItem = createMockItem({ position: 1, ticketNo: 1 });
    const { rerender } = render(
      <WaitingCard
        item={firstItem}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByText('다음 입장')).toBeDefined();

    const secondItem = createMockItem({ position: 3, ticketNo: 2 });
    rerender(
      <WaitingCard
        item={secondItem}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByText('3번째')).toBeDefined();
  });
});
