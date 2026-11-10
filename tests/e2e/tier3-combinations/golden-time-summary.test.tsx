import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderLoggedInApp } from '../test-utils';

describe('Tier 3 - Cross-Feature: Golden Time Surge & Summary Wait Time Synchronization', () => {
  it('updates both total ahead count and estimated wait minutes synchronously during surge', async () => {
    await renderLoggedInApp();

    // Baseline: 3 ahead, 15 min wait
    expect(screen.getByText('3')).toBeDefined();
    expect(screen.getByText('15')).toBeDefined();

    const addBtn = screen.getByRole('button', { name: /현장 \+1팀/i });
    // Add 3 teams for golden time rush
    fireEvent.click(addBtn);
    fireEvent.click(addBtn);
    fireEvent.click(addBtn);

    // Synchronized update: 6 ahead, 30 min wait
    expect(screen.getByText('6')).toBeDefined();
    expect(screen.getByText('30')).toBeDefined();
  });

  it('restores synchronized state between summary cards and queue items upon reset', async () => {
    await renderLoggedInApp();

    const addBtn = screen.getByRole('button', { name: /현장 \+1팀/i });
    const resetBtn = screen.getByRole('button', { name: /시연 초기 상태로 리셋/i });

    // Surge to 5 teams
    fireEvent.click(addBtn);
    fireEvent.click(addBtn);
    expect(screen.getByText('5')).toBeDefined();
    expect(screen.getByText('25')).toBeDefined();

    // Reset restores both to baseline (3 teams, 15 min wait)
    fireEvent.click(resetBtn);
    expect(screen.getByText('3')).toBeDefined();
    expect(screen.getByText('15')).toBeDefined();
    expect(screen.getByText('3 건')).toBeDefined();
  });

  it('maintains vehicle count invariant while wait time and total ahead expand', async () => {
    await renderLoggedInApp();

    // Vehicle remote count is 2
    expect(screen.getByText('2')).toBeDefined();

    const addBtn = screen.getByRole('button', { name: /현장 \+1팀/i });
    for (let i = 0; i < 4; i++) {
      fireEvent.click(addBtn);
    }

    // Ahead is 7, wait time is 35, but vehicle count is still strictly 2
    expect(screen.getByText('7')).toBeDefined();
    expect(screen.getByText('35')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();
  });
});
