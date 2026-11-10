import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';

export interface StompStatus {
  isConnected: boolean;
  reconnectAttempts: number;
}

export function usePosStomp(
  storeId: string,
  onQueueUpdated?: (data: unknown) => void
) {
  const [status, setStatus] = useState<StompStatus>({
    isConnected: false,
    reconnectAttempts: 0,
  });
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!storeId) return;

    // Use ws://localhost:8080/ws or window.location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const brokerURL = `${protocol}//${window.location.host}/ws`;

    const client = new Client({
      brokerURL,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setStatus({ isConnected: true, reconnectAttempts: 0 });

        // 1. 매장 큐 종합 토픽 구독
        client.subscribe(`/topic/stores/${storeId}/queue`, (message) => {
          try {
            const body = JSON.parse(message.body);
            if (onQueueUpdated) {
              onQueueUpdated(body);
            }
          } catch (e) {
            console.error('STOMP 메시지 파싱 오류 (/topic/stores):', e);
          }
        });

        // 2. POS 개별 텔레메트리 및 하차 센서 이벤트 토픽 구독
        client.subscribe(`/topic/pos/${storeId}`, (message) => {
          try {
            const body = JSON.parse(message.body);
            if (onQueueUpdated) {
              onQueueUpdated(body);
            }
          } catch (e) {
            console.error('STOMP 메시지 파싱 오류 (/topic/pos):', e);
          }
        });
      },
      onDisconnect: () => {
        setStatus((prev) => ({ ...prev, isConnected: false }));
      },
      onStompError: (frame) => {
        console.warn('STOMP 에러 프레임:', frame);
        setStatus((prev) => ({
          isConnected: false,
          reconnectAttempts: prev.reconnectAttempts + 1,
        }));
      },
      onWebSocketClose: () => {
        setStatus((prev) => ({
          isConnected: false,
          reconnectAttempts: prev.reconnectAttempts + 1,
        }));
      },
    });

    try {
      client.activate();
      clientRef.current = client;
    } catch {
      // Offline fallback
    }

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [storeId, onQueueUpdated]);

  return status;
}

export default usePosStomp;
