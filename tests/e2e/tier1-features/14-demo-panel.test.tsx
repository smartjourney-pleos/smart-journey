import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderLoggedInApp } from '../test-utils';

describe('Tier 1 - Feature 14: Evaluator Demo Panel (P-06)', () => {
  it('renders evaluator demo controller heading', async () => {
    await renderLoggedInApp();
    expect(screen.getByText('시연 제어 패널')).toBeDefined();
  });

  it('renders instructional copy explaining golden time and alighting simulation', async () => {
    await renderLoggedInApp();
    expect(
      screen.getByText(/심사위원 시연 시, 현장 대기 팀을 증감시켜/i)
    ).toBeDefined();
  });

  it('renders walk-in team adjustment control section with +1 and -1 actions', async () => {
    await renderLoggedInApp();
    expect(screen.getByRole('button', { name: /현장 \+1팀/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /현장 -1팀/i })).toBeDefined();
  });

  it('renders vehicle arrival and alighting simulation trigger button', async () => {
    await renderLoggedInApp();
    expect(
      screen.getByRole('button', { name: /하차 확인 이벤트 발생/i })
    ).toBeDefined();
  });

  it('renders demo baseline reset action button', async () => {
    await renderLoggedInApp();
    expect(
      screen.getByRole('button', { name: /시연 초기 상태로 리셋/i })
    ).toBeDefined();
  });
});
