import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import { Header } from '../../../src/components/Header';
import { renderLoggedInApp, createMockStore } from '../test-utils';

describe('Tier 1 - Feature 02: High-Contrast Header Bar', () => {
  it('renders store title prominently in header', async () => {
    await renderLoggedInApp();
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
    expect(screen.getByText('하늘본가 숯불갈비 시흥본점')).toBeDefined();
  });

  it('renders store category pill badge with high contrast', async () => {
    await renderLoggedInApp();
    expect(screen.getByText('한식 / 육류')).toBeDefined();
  });

  it('displays STOMP sync indicator with connected state', () => {
    const store = createMockStore();
    render(
      <Header
        store={store}
        isConnected={true}
        onOpenSettings={() => {}}
        onLogout={() => {}}
      />
    );
    expect(screen.getByText('실시간 연동 중')).toBeDefined();
  });

  it('displays STOMP sync indicator with reconnecting state when disconnected', () => {
    const store = createMockStore();
    render(
      <Header
        store={store}
        isConnected={false}
        onOpenSettings={() => {}}
        onLogout={() => {}}
      />
    );
    expect(screen.getByText('실시간 재연결 중')).toBeDefined();
  });

  it('triggers settings modal callback when settings button is tapped', () => {
    const store = createMockStore();
    const onOpenSettings = vi.fn();
    render(
      <Header
        store={store}
        isConnected={true}
        onOpenSettings={onOpenSettings}
        onLogout={() => {}}
      />
    );
    const settingsBtn = screen.getByRole('button', { name: /설정/i });
    fireEvent.click(settingsBtn);
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });
});
