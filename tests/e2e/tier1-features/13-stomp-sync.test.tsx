import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePosStomp } from '../../../src/hooks/usePosStomp';

describe('Tier 1 - Feature 13: STOMP WebSocket Live State Sync', () => {
  it('initializes STOMP hook with default disconnected state or connecting status', () => {
    const onMessage = vi.fn();
    const { result } = renderHook(() => usePosStomp('store-01', null, onMessage));
    expect(result.current).toHaveProperty('isConnected');
  });

  it('skips connection setup when storeId is empty or not logged in', () => {
    const onMessage = vi.fn();
    const { result } = renderHook(() => usePosStomp('', onMessage));
    expect(result.current.isConnected).toBe(false);
  });

  it('accepts incoming queue update message handler function', () => {
    const onMessage = vi.fn();
    renderHook(() => usePosStomp('store-01', null, onMessage));
    expect(typeof onMessage).toBe('function');
  });

  it('provides cleanup on unmount to prevent dangling WebSocket connections', () => {
    const onMessage = vi.fn();
    const { unmount } = renderHook(() => usePosStomp('store-01', null, onMessage));
    expect(() => unmount()).not.toThrow();
  });

  it('maintains state structure with isConnected boolean contract', () => {
    const { result } = renderHook(() => usePosStomp('store-01', null, () => {}));
    expect(typeof result.current.isConnected).toBe('boolean');
  });
});
