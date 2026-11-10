import { describe, it, expect } from 'vitest';
import { screen, render } from '@testing-library/react';
import { WaitingCard } from '../../../src/components/WaitingCard';
import { createMockItem } from '../test-utils';

describe('Tier 2 - Party Size Boundaries & Extreme Capacities', () => {
  it('correctly formats single diner boundary (1 person -> "1명")', () => {
    const item = createMockItem({ partySize: 1 });
    render(
      <WaitingCard
        item={item}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByText('1명')).toBeDefined();
  });

  it('correctly formats couple boundary (2 persons -> "2명")', () => {
    const item = createMockItem({ partySize: 2 });
    render(
      <WaitingCard
        item={item}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByText('2명')).toBeDefined();
  });

  it('correctly formats standard family group boundary (4 persons -> "4명")', () => {
    const item = createMockItem({ partySize: 4 });
    render(
      <WaitingCard
        item={item}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByText('4명')).toBeDefined();
  });

  it('correctly formats large group table boundary (12 persons -> "12명")', () => {
    const item = createMockItem({ partySize: 12 });
    render(
      <WaitingCard
        item={item}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByText('12명')).toBeDefined();
  });

  it('formats passenger alighting ratio correctly for large groups (e.g. 10/12명 하차 완료)', () => {
    const item = createMockItem({
      channel: 'VEHICLE',
      arrivalResult: 'CONFIRMED',
      partySize: 12,
      alighted: 10,
    });
    render(
      <WaitingCard
        item={item}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByText(/10\/12명 하차 완료/i)).toBeDefined();
  });
});
