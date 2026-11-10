import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderLoggedInApp } from '../test-utils';

describe('Tier 1 - Feature 18: Demo Reset Control', () => {
  it('restores baseline queue card count after additions when reset is clicked', async () => {
    await renderLoggedInApp();
    const addBtn = screen.getByRole('button', { name: /현장 \+1팀/i });
    const resetBtn = screen.getByRole('button', { name: /시연 초기 상태로 리셋/i });

    // Add 2 teams
    fireEvent.click(addBtn);
    fireEvent.click(addBtn);
    expect(screen.getByText('5 건')).toBeDefined();

    // Reset
    fireEvent.click(resetBtn);
    expect(screen.getByText('3 건')).toBeDefined();
  });

  it('restores ahead teams count back to 3 after reset', async () => {
    await renderLoggedInApp();
    const addBtn = screen.getByRole('button', { name: /현장 \+1팀/i });
    const resetBtn = screen.getByRole('button', { name: /시연 초기 상태로 리셋/i });

    fireEvent.click(addBtn);
    expect(screen.getByText('4')).toBeDefined();

    fireEvent.click(resetBtn);
    expect(screen.getByText('3')).toBeDefined();
  });

  it('restores estimated wait minutes back to 15 after reset', async () => {
    await renderLoggedInApp();
    const addBtn = screen.getByRole('button', { name: /현장 \+1팀/i });
    const resetBtn = screen.getByRole('button', { name: /시연 초기 상태로 리셋/i });

    fireEvent.click(addBtn);
    fireEvent.click(addBtn);
    expect(screen.getByText('25')).toBeDefined();

    fireEvent.click(resetBtn);
    expect(screen.getByText('15')).toBeDefined();
  });

  it('clears simulated vehicle arrival status back to initial state on reset', async () => {
    await renderLoggedInApp();
    const simBtn = screen.getByRole('button', { name: /하차 확인 이벤트 발생/i });
    const resetBtn = screen.getByRole('button', { name: /시연 초기 상태로 리셋/i });

    // Trigger arrival -> both vehicle tickets 12 & 13 become arrived
    fireEvent.click(simBtn);
    expect(screen.getAllByText('현장 도착').length).toBe(2);

    // Reset -> ticket 13 reverts to "이동 중", ticket 12 remains baseline "현장 도착"
    fireEvent.click(resetBtn);
    expect(screen.getAllByText('이동 중').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('현장 도착').length).toBeGreaterThanOrEqual(1);
  });

  it('restores original ticket items (12, 13, 14) after multiple modifications', async () => {
    await renderLoggedInApp();
    const seatBtns = screen.getAllByRole('button', { name: /착석/i });
    const resetBtn = screen.getByRole('button', { name: /시연 초기 상태로 리셋/i });

    // Seat ticket 12
    fireEvent.click(seatBtns[0]);
    expect(screen.queryByText('12')).toBeNull();

    // Reset restores ticket 12
    fireEvent.click(resetBtn);
    expect(screen.getByText('12')).toBeDefined();
    expect(screen.getByText('13')).toBeDefined();
    expect(screen.getByText('14')).toBeDefined();
  });
});
