import type { PosQueueResponse, StoreSettings, WaitingItem } from '../types/pos';

export interface PosStoreOption {
  storeId: number;
  name: string;
}

// 서버 계약 (smart-journey-server PosDtos). 화면 타입으로 바꿔서 쓴다.
interface ServerQueueItem {
  waitingId: number;
  ticketNo: number;
  partySize: number;
  channel: 'VEHICLE' | 'WALK_IN';
  status: WaitingItem['status'];
  etaMin: number | null;
  arrival: { result: 'CONFIRMED' | 'MANUAL' | 'UNCONFIRMED'; alighted: number | null; partySize: number; arrivedAt: string } | null;
  registeredAt: string;
}

interface ServerQueue {
  storeId: number;
  aheadTeams: number;
  estimatedWaitMin: number;
  items: ServerQueueItem[];
}

const MOCK_TOKEN = 'mock-jwt-token';

const clock = (iso: string) =>
  new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

export function toWaitingItem(item: ServerQueueItem, index: number): WaitingItem {
  const a = item.arrival;
  return {
    id: String(item.waitingId),
    ticketNo: item.ticketNo,
    partySize: item.partySize,
    status: item.status,
    position: index + 1,
    etaMin: item.etaMin ?? 0,
    channel: item.channel,
    arrivalResult: a?.result ?? null,
    alighted: a?.alighted ?? null,
    registeredAt: clock(item.registeredAt),
    alighting:
      a?.result === 'CONFIRMED' && a.alighted != null
        ? {
            status: a.alighted >= a.partySize ? 'CONFIRMED' : 'PARTIAL',
            alightedCount: a.alighted,
            totalPassengers: a.partySize,
            lastSensorTime: clock(a.arrivedAt),
          }
        : undefined,
  };
}


const API_BASE = '/api/v1/pos';

// 데모 매장. 서버 시드(R__demo_seed.sql)·차량 앱과 같은 장소다. 웨이팅은 시연 데이터.
export const DEMO_STORES: PosStoreOption[] = [
  { storeId: 1, name: '42dot' },
  { storeId: 2, name: '소프트웨어드림센터' },
];

// 목 데이터 (서버에 연결하지 못했을 때만 쓴다)
export const initialMockQueue: PosQueueResponse = {
  store: {
    id: '1',
    name: '42dot',
    category: '데모 매장',
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
  private storeName = '';

  setToken(token: string | null) {
    this.token = token;
  }

  /** STOMP CONNECT용 JWT. 목 데이터 모드면 null */
  serverToken(): string | null {
    return this.isServer() ? this.token : null;
  }

  /** 서버에 로그인했는지. 서버가 꺼져 있어 목 데이터로 들어왔으면 false */
  isServer(): boolean {
    return this.token !== null && this.token !== MOCK_TOKEN;
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

  private async send(method: string, path: string, body?: unknown): Promise<void> {
    if (!this.isServer()) return;
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: this.getHeaders(),
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`${method} ${path} 실패 (${res.status})`);
  }

  /** 로그인 화면 매장 목록. 서버가 없으면 데모 매장 */
  async getStores(): Promise<PosStoreOption[]> {
    try {
      const res = await fetch(`${API_BASE}/stores`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return DEMO_STORES;
    }
  }

  async login(storeId: string, pin: string): Promise<{ token: string; storeName: string }> {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId: Number(storeId), pin }),
      });
    } catch {
      res = new Response(null, { status: 503 });
    }
    // 서버가 꺼져 있을 때만 목 데이터로 들어간다 (Vite 프록시는 연결 실패를 5xx로 돌려준다)
    if (res.status >= 500) {
      const name = DEMO_STORES.find((s) => String(s.storeId) === storeId)?.name ?? initialMockQueue.store.name;
      return { token: MOCK_TOKEN, storeName: name };
    }
    if (!res.ok) {
      const error = await res.json().catch(() => null);
      throw new Error(error?.code === 'POS_LOGIN_LOCKED' ? 'PIN을 여러 번 틀려 5분간 잠겼어요' : 'PIN이 맞지 않아요');
    }
    const body = await res.json();
    this.storeName = body.storeName;
    return { token: body.accessToken, storeName: body.storeName };
  }

  /** 서버 대기열을 화면 모양으로. 서버 모드가 아니면 null */
  async getQueue(): Promise<PosQueueResponse | null> {
    if (!this.isServer()) return null;
    const [queueRes, settingsRes] = await Promise.all([
      fetch(`${API_BASE}/queue`, { headers: this.getHeaders() }),
      fetch(`${API_BASE}/settings`, { headers: this.getHeaders() }),
    ]);
    if (!queueRes.ok || !settingsRes.ok) throw new Error('대기열 조회 실패');
    const queue: ServerQueue = await queueRes.json();
    const settings = await settingsRes.json();
    return {
      store: {
        id: String(queue.storeId),
        name: this.storeName,
        category: '데모 매장',
        settings: {
          minutesPerTeam: settings.minutesPerTeam,
          arrivalBufferMin: settings.arrivalBufferMin,
          manualWaitMin: settings.manualWaitMin ?? null,
        },
      },
      aheadTeams: queue.aheadTeams,
      estimatedWaitMin: queue.estimatedWaitMin,
      queue: queue.items.map(toWaitingItem),
    };
  }

  callWaiting(waitingId: string) {
    return this.send('POST', `/waitings/${waitingId}/call`);
  }

  seatWaiting(waitingId: string) {
    return this.send('POST', `/waitings/${waitingId}/seat`);
  }

  noShowWaiting(waitingId: string) {
    return this.send('POST', `/waitings/${waitingId}/no-show`);
  }

  updateSettings(settings: Partial<StoreSettings>) {
    const manual = settings.manualWaitMin;
    return this.send('PATCH', '/settings', {
      minutesPerTeam: settings.minutesPerTeam,
      arrivalBufferMin: settings.arrivalBufferMin,
      manualWaitMin: manual ?? undefined,
      clearManualWait: manual === null,
    });
  }

  /** 현장 대기 +N / −N 팀 (데모) */
  triggerWalkInDemo(delta: number) {
    if (delta > 0) return this.send('POST', '/demo/walk-ins', { count: delta, partySize: 2 });
    return this.send('DELETE', `/demo/walk-ins?count=${-delta}`);
  }

  resetDemo() {
    return this.send('POST', '/demo/reset');
  }
}

export const posApi = new PosApiService();
