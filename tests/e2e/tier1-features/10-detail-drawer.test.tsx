import { describe, it, expect } from 'vitest';
import { screen, render } from '@testing-library/react';
import { WaitingCard } from '../../../src/components/WaitingCard';
import { createMockItem } from '../test-utils';

describe('Tier 1 - Feature 10: Team Detail Slide Drawer (P-03 Specifications)', () => {
  it('displays accurate ticket number and position in card inspection', () => {
    const item = createMockItem({ ticketNo: 99, position: 2 });
    render(
      <WaitingCard
        item={item}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByText('99')).toBeDefined();
    expect(screen.getByText('2번째')).toBeDefined();
  });

  it('displays vehicle telemetry verification when channel is VEHICLE', () => {
    const item = createMockItem({
      channel: 'VEHICLE',
      arrivalResult: 'CONFIRMED',
      alighted: 4,
      partySize: 4,
    });
    render(
      <WaitingCard
        item={item}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByText(/4\/4명 하차 완료/i)).toBeDefined();
  });

  it('displays manual confirmation notice when arrival is flagged MANUAL', () => {
    const item = createMockItem({
      channel: 'VEHICLE',
      arrivalResult: 'MANUAL',
    });
    render(
      <WaitingCard
        item={item}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByText('고객 직접 확인 필요')).toBeDefined();
  });

  it('displays unconfirmed notice when arrival telemetry is unverified', () => {
    const item = createMockItem({
      channel: 'VEHICLE',
      arrivalResult: 'UNCONFIRMED',
    });
    render(
      <WaitingCard
        item={item}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByText('인원 미확인')).toBeDefined();
  });

  it('displays registration timestamp on team item', () => {
    const item = createMockItem({ registeredAt: '12:34:56' });
    render(
      <WaitingCard
        item={item}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByText(/접수 시각 12:34:56/i)).toBeDefined();
  });
});
