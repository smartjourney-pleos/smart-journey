import { describe, it, expect } from 'vitest';
import { screen, render } from '@testing-library/react';
import { WaitingCard } from '../../../src/components/WaitingCard';
import { createMockItem } from '../test-utils';

describe('Tier 1 - Feature 08: Tactile Button Micro-Interactions', () => {
  it('combines text labels with icons for unambiguous touch affordance', () => {
    const item = createMockItem({ status: 'REGISTERED' });
    render(
      <WaitingCard
        item={item}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: /호출/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /착석/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /노쇼/i })).toBeDefined();
  });

  it('applies tactile cursor-pointer to action buttons', () => {
    const item = createMockItem({ status: 'CALLED' });
    render(
      <WaitingCard
        item={item}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    const seatBtn = screen.getByRole('button', { name: /착석/i });
    expect(seatBtn.className).toContain('cursor-pointer');
  });

  it('applies rounded-md border radius token to tactile action buttons', () => {
    const item = createMockItem({ status: 'REGISTERED' });
    render(
      <WaitingCard
        item={item}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    const callBtn = screen.getByRole('button', { name: /호출/i });
    expect(callBtn.className).toContain('rounded-md');
  });

  it('fills the seat button once the team has been called', () => {
    const item = createMockItem({ status: 'CALLED' });
    render(
      <WaitingCard
        item={item}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    const seatBtn = screen.getByRole('button', { name: /착석/i });
    expect(seatBtn.className).toContain('bg-main');
  });

  it('demotes call button to an outline when team is already CALLED', () => {
    const item = createMockItem({ status: 'CALLED' });
    render(
      <WaitingCard
        item={item}
        onCall={() => {}}
        onSeat={() => {}}
        onNoShow={() => {}}
      />
    );
    const recallBtn = screen.getByRole('button', { name: /재호출/i });
    expect(recallBtn.className).toContain('bg-surface');
  });
});
