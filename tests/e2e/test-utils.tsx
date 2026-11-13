import React from 'react';
import { render, screen, fireEvent, type RenderResult } from '@testing-library/react';
import App from '../../src/App';
import type { WaitingItem, StoreInfo, PosQueueResponse } from '../../src/types/pos';

/**
 * Standard test helper to render the App and log in immediately.
 */
export async function renderLoggedInApp(): Promise<RenderResult> {
  const result = render(<App />);
  
  // If login screen is shown, click login
  const loginButton = screen.queryByRole('button', { name: /POS 시스템 접속/i });
  if (loginButton) {
    fireEvent.click(loginButton);
    // Wait for the main screen store name
    await screen.findByRole('heading', { name: '42dot' });
  }
  
  return result;
}

/**
 * Mock generator for WaitingItem.
 */
export function createMockItem(overrides: Partial<WaitingItem> = {}): WaitingItem {
  return {
    id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    ticketNo: 101,
    partySize: 4,
    status: 'REGISTERED',
    position: 1,
    etaMin: 15,
    channel: 'VEHICLE',
    arrivalResult: null,
    alighted: null,
    registeredAt: '12:00:00',
    calledAt: null,
    ...overrides,
  };
}

/**
 * Mock generator for StoreInfo.
 */
export function createMockStore(overrides: Partial<StoreInfo> = {}): StoreInfo {
  return {
    id: '1',
    name: '42dot',
    category: '데모 매장',
    settings: {
      minutesPerTeam: 5,
      arrivalBufferMin: 10,
      manualWaitMin: null,
    },
    ...overrides,
  };
}

/**
 * Mock generator for complete PosQueueResponse.
 */
export function createMockQueueResponse(
  queue: WaitingItem[] = [],
  overrides: Partial<PosQueueResponse> = {}
): PosQueueResponse {
  return {
    store: createMockStore(),
    queue,
    aheadTeams: queue.length,
    estimatedWaitMin: queue.length * 5,
    ...overrides,
  };
}
