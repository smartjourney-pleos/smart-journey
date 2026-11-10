import { describe, it, expect, vi } from 'vitest';
import { screen, render, fireEvent } from '@testing-library/react';
import { WaitingCard } from '../../../src/components/WaitingCard';
import { Header } from '../../../src/components/Header';
import { createMockItem, createMockStore } from '../test-utils';

describe('Tier 1 - Feature 19: Adversarial Hardening & Encoding Integrity', () => {
  it('handles item with null/undefined optional telemetry fields gracefully', () => {
    const item = createMockItem({
      arrivalResult: null,
      alighted: null,
      calledAt: null,
    });
    expect(() =>
      render(
        <WaitingCard
          item={item}
          onCall={() => {}}
          onSeat={() => {}}
          onNoShow={() => {}}
        />
      )
    ).not.toThrow();
  });

  it('escapes and safely displays special characters in store name and category', () => {
    const store = createMockStore({
      name: '<script>alert("xss")</script> & "Store"',
      category: '<b style="color:red">VIP</b>',
    });
    render(
      <Header
        store={store}
        isConnected={true}
        onOpenSettings={() => {}}
        onLogout={() => {}}
      />
    );
    expect(
      screen.getByText('<script>alert("xss")</script> & "Store"')
    ).toBeDefined();
    expect(screen.getByText('<b style="color:red">VIP</b>')).toBeDefined();
  });

  it('handles extreme party size boundaries without visual crash (e.g. 1 person vs 99 people)', () => {
    const soloItem = createMockItem({ partySize: 1, ticketNo: 1 });
    const { rerender } = render(
      <WaitingCard
        item={soloItem}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByText('1명')).toBeDefined();

    const megaGroupItem = createMockItem({ partySize: 99, ticketNo: 2 });
    rerender(
      <WaitingCard
        item={megaGroupItem}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByText('99명')).toBeDefined();
  });

  it('safely handles zero and negative ETA values without NaN displays', () => {
    const zeroEta = createMockItem({ etaMin: 0 });
    const { rerender } = render(
      <WaitingCard
        item={zeroEta}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByText('도착 완료')).toBeDefined();

    const negativeEta = createMockItem({ etaMin: -5 });
    rerender(
      <WaitingCard
        item={negativeEta}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByText('도착 완료')).toBeDefined();
  });

  it('survives rapid consecutive multi-tap on action buttons without crashing', () => {
    const onCall = vi.fn();
    const item = createMockItem({ id: 'rapid-1' });
    render(
      <WaitingCard
        item={item}
        onCall={onCall}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    const callBtn = screen.getByRole('button', { name: /호출/i });
    for (let i = 0; i < 10; i++) {
      fireEvent.click(callBtn);
    }
    expect(onCall).toHaveBeenCalledTimes(10);
  });
});
