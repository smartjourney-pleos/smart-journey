import { describe, it, expect } from 'vitest';
import { screen, render } from '@testing-library/react';
import { WaitingCard } from '../../../src/components/WaitingCard';
import { createMockItem } from '../test-utils';

describe('Tier 2 - ETA Countdown & Arrival Boundaries', () => {
  it('displays "도착 완료" when ETA is exactly 0', () => {
    const item = createMockItem({ etaMin: 0 });
    render(
      <WaitingCard
        item={item}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByText('도착 완료')).toBeDefined();
  });

  it('clamps negative ETA (overdue arrival) to "도착 완료" instead of displaying negative minutes', () => {
    const overdueItem = createMockItem({ etaMin: -10 });
    render(
      <WaitingCard
        item={overdueItem}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByText('도착 완료')).toBeDefined();
    expect(screen.queryByText(/-10분/)).toBeNull();
  });

  it('displays standard format for 1 minute remaining boundary ("약 1분")', () => {
    const item = createMockItem({ etaMin: 1 });
    render(
      <WaitingCard
        item={item}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByText('약 1분')).toBeDefined();
  });

  it('renders large ETA durations (e.g. 180 minutes) cleanly', () => {
    const longWaitItem = createMockItem({ etaMin: 180 });
    render(
      <WaitingCard
        item={longWaitItem}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByText('약 180분')).toBeDefined();
  });

  it('displays arrival status badge "현장 도착" when status is ARRIVED regardless of ETA', () => {
    const item = createMockItem({ status: 'ARRIVED', etaMin: 0 });
    render(
      <WaitingCard
        item={item}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByText('현장 도착')).toBeDefined();
  });
});
