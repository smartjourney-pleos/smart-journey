import { afterEach, describe, expect, it, vi } from 'vitest';
import { posApi, toWaitingItem } from '../../../src/api/posApi';

// smart-journey-server PosDtos 계약과 화면 타입 사이의 변환
describe('Server contract (smart-journey-server /api/v1/pos)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    posApi.setToken(null);
  });

  it('maps a server queue item to a board card', () => {
    const card = toWaitingItem(
      {
        waitingId: 7,
        ticketNo: 3,
        partySize: 4,
        channel: 'VEHICLE',
        status: 'ARRIVED',
        etaMin: null,
        arrival: { result: 'CONFIRMED', alighted: 3, partySize: 4, arrivedAt: '2026-11-13T02:07:34Z' },
        registeredAt: '2026-11-13T02:00:00Z',
      },
      1,
    );
    expect(card).toMatchObject({ id: '7', position: 2, etaMin: 0, arrivalResult: 'CONFIRMED', alighted: 3 });
    expect(card.alighting).toMatchObject({ status: 'PARTIAL', alightedCount: 3, totalPassengers: 4 });
  });

  it('falls back to mock only when the server is down, not on a wrong PIN', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 502 })));
    const offline = await posApi.login('2', '1234');
    expect(offline.storeName).toBe('소프트웨어드림센터');

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"code":"POS_LOGIN_FAILED"}', { status: 401 })));
    await expect(posApi.login('1', '0000')).rejects.toThrow('PIN');
  });

  it('logs in with accessToken and calls walk-in endpoints with count', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ accessToken: 'jwt', storeName: '42dot', storeId: 1 })))
      .mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const res = await posApi.login('1', '1234');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ storeId: 1, pin: '1234' });
    posApi.setToken(res.token);
    expect(posApi.serverToken()).toBe('jwt');

    await posApi.triggerWalkInDemo(3);
    await posApi.triggerWalkInDemo(-1);
    expect(fetchMock.mock.calls[1][0]).toBe('/api/v1/pos/demo/walk-ins');
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ count: 3, partySize: 2 });
    expect(fetchMock.mock.calls[2][0]).toBe('/api/v1/pos/demo/walk-ins?count=1');
    expect(fetchMock.mock.calls[2][1].method).toBe('DELETE');
  });
});
