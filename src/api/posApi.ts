import type { PosQueueResponse, StoreSettings } from '../types/pos';

const API_BASE = '/api/v1/pos';

// 목 데이터 (서버가 아직 실행되지 않았을 때 개발 및 시연용)
export const initialMockQueue: PosQueueResponse = {
  store: {
    id: 'store-01',
    name: '하늘본가 숯불갈비 시흥본점',
    category: '한식 / 육류',
    settings: {
      minutesPerTeam: 5,
      arrivalBufferMin: 10,
      manualWaitMin: null,
    },
  },
  aheadTeams: 3,
  estimatedWaitMin: 15,
  queue: [
    {
      id: 'wait-101',
      ticketNo: 12,
      partySize: 4,
      status: 'ARRIVED',
      position: 1,
      etaMin: 0,
      channel: 'VEHICLE',
      arrivalResult: 'CONFIRMED',
      alighted: 4,
      registeredAt: '14:20:15',
      customerName: '김*수',
      phone: '010-****-1234',
      vehicleModel: 'Genesis GV70',
      vehicleNumber: '123가 4567',
    },
    {
      id: 'wait-102',
      ticketNo: 13,
      partySize: 2,
      status: 'REGISTERED',
      position: 2,
      etaMin: 4,
      channel: 'VEHICLE',
      arrivalResult: null,
      alighted: null,
      registeredAt: '14:25:30',
      customerName: '박*현',
      phone: '010-****-5678',
      vehicleModel: 'IONIQ 5',
      vehicleNumber: '45나 6789',
    },
    {
      id: 'wait-103',
      ticketNo: 14,
      partySize: 3,
      status: 'REGISTERED',
      position: 3,
      etaMin: 12,
      channel: 'WALK_IN',
      arrivalResult: null,
      alighted: null,
      registeredAt: '14:31:00',
      customerName: '이*민',
      phone: '010-****-9012',
    },
  ],
};

class PosApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async login(storeId: string, pin: string): Promise<{ token: string; storeName: string }> {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, pin }),
      });
      if (!res.ok) throw new Error('로그인 실패');
      return await res.json();
    } catch {
      // Mock fallback for offline/development
      return { token: 'mock-jwt-token', storeName: '하늘본가 숯불갈비 시흥본점' };
    }
  }

  async getQueue(): Promise<PosQueueResponse> {
    try {
      const res = await fetch(`${API_BASE}/queue`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error('대기열 조회 실패');
      return await res.json();
    } catch {
      return initialMockQueue;
    }
  }

  async callWaiting(waitingId: string): Promise<void> {
    await fetch(`${API_BASE}/waitings/${waitingId}/call`, {
      method: 'POST',
      headers: this.getHeaders(),
    }).catch(() => {});
  }

  async seatWaiting(waitingId: string): Promise<void> {
    await fetch(`${API_BASE}/waitings/${waitingId}/seat`, {
      method: 'POST',
      headers: this.getHeaders(),
    }).catch(() => {});
  }

  async noShowWaiting(waitingId: string): Promise<void> {
    await fetch(`${API_BASE}/waitings/${waitingId}/no-show`, {
      method: 'POST',
      headers: this.getHeaders(),
    }).catch(() => {});
  }

  async updateSettings(settings: Partial<StoreSettings>): Promise<void> {
    await fetch(`${API_BASE}/settings`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(settings),
    }).catch(() => {});
  }

  async triggerWalkInDemo(delta: number): Promise<void> {
    await fetch(`${API_BASE}/demo/walk-in`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ delta }),
    }).catch(() => {});
  }
}

export const posApi = new PosApiService();
