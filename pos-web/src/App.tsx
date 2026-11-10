import { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { QueueBoard } from './components/QueueBoard';
import { DemoPanel } from './components/DemoPanel';
import { SettingsModal } from './components/SettingsModal';
import { LoginScreen } from './components/LoginScreen';
import { usePosStomp } from './hooks/usePosStomp';
import { initialMockQueue, posApi } from './api/posApi';
import type { PosQueueResponse, StoreSettings, WaitingItem } from './types/pos';

export function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [data, setData] = useState<PosQueueResponse>(initialMockQueue);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // STOMP WebSocket 연결
  const handleQueueUpdated = useCallback((stompMessage: unknown) => {
    console.log('STOMP 실시간 갱신 수신:', stompMessage);
    // 실제 서버 연동 시에는 GET /pos/queue 를 재호출하거나 페이로드 머지
  }, []);

  const stompStatus = usePosStomp(isLoggedIn ? data.store.id : '', handleQueueUpdated);

  // 로그인 처리
  const handleLogin = async (storeId: string, pin: string) => {
    const res = await posApi.login(storeId, pin);
    posApi.setToken(res.token);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    posApi.setToken(null);
  };

  // 대기 팀 호출
  const handleCall = (waitingId: string) => {
    setData((prev) => ({
      ...prev,
      queue: prev.queue.map((item) =>
        item.id === waitingId ? { ...item, status: 'CALLED' } : item
      ),
    }));
    posApi.callWaiting(waitingId);
  };

  // 착석 완료
  const handleSeat = (waitingId: string) => {
    setData((prev) => {
      const filtered = prev.queue.filter((item) => item.id !== waitingId);
      const newAhead = Math.max(0, prev.aheadTeams - 1);
      const estWait = prev.store.settings.manualWaitMin ?? newAhead * prev.store.settings.minutesPerTeam;
      return {
        ...prev,
        aheadTeams: newAhead,
        estimatedWaitMin: estWait,
        queue: filtered.map((item, idx) => ({ ...item, position: idx + 1 })),
      };
    });
    posApi.seatWaiting(waitingId);
  };

  // 노쇼 처리
  const handleNoShow = (waitingId: string) => {
    handleSeat(waitingId);
    posApi.noShowWaiting(waitingId);
  };

  // 설정 저장
  const handleSaveSettings = (newSettings: StoreSettings) => {
    setData((prev) => {
      const estWait = newSettings.manualWaitMin ?? prev.aheadTeams * newSettings.minutesPerTeam;
      return {
        ...prev,
        store: { ...prev.store, settings: newSettings },
        estimatedWaitMin: estWait,
      };
    });
    posApi.updateSettings(newSettings);
  };

  // 데모 1: 현장 대기 +1 팀
  const handleAddWalkIn = () => {
    const nextTicket = (data.queue[data.queue.length - 1]?.ticketNo ?? 10) + 1;
    const newItem: WaitingItem = {
      id: `wait-${Date.now()}`,
      ticketNo: nextTicket,
      partySize: Math.floor(Math.random() * 3) + 2,
      status: 'REGISTERED',
      position: data.queue.length + 1,
      etaMin: 15,
      channel: 'WALK_IN',
      arrivalResult: null,
      alighted: null,
      registeredAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setData((prev) => {
      const newQueue = [...prev.queue, newItem];
      const newAhead = prev.aheadTeams + 1;
      const estWait = prev.store.settings.manualWaitMin ?? newAhead * prev.store.settings.minutesPerTeam;
      return {
        ...prev,
        aheadTeams: newAhead,
        estimatedWaitMin: estWait,
        queue: newQueue,
      };
    });

    posApi.triggerWalkInDemo(1);
  };

  // 데모 2: 현장 대기 -1 팀
  const handleRemoveWalkIn = () => {
    const lastWalkIn = [...data.queue].reverse().find((q) => q.channel === 'WALK_IN');
    if (!lastWalkIn) return;

    setData((prev) => {
      const newQueue = prev.queue.filter((q) => q.id !== lastWalkIn.id);
      const newAhead = Math.max(0, prev.aheadTeams - 1);
      const estWait = prev.store.settings.manualWaitMin ?? newAhead * prev.store.settings.minutesPerTeam;
      return {
        ...prev,
        aheadTeams: newAhead,
        estimatedWaitMin: estWait,
        queue: newQueue.map((item, idx) => ({ ...item, position: idx + 1 })),
      };
    });

    posApi.triggerWalkInDemo(-1);
  };

  // 데모 3: 차량 도착 및 하차 완료 시뮬레이션
  const handleSimulateVehicleArrival = () => {
    setData((prev) => ({
      ...prev,
      queue: prev.queue.map((item) =>
        item.channel === 'VEHICLE'
          ? {
              ...item,
              status: 'ARRIVED',
              etaMin: 0,
              arrivalResult: 'CONFIRMED',
              alighted: item.partySize,
            }
          : item
      ),
    }));
  };

  // 데모 4: 초기 리셋
  const handleResetDemo = () => {
    setData(initialMockQueue);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 overflow-hidden font-sans">
      {/* 태블릿 상단 헤더 */}
      <Header
        store={data.store}
        isConnected={stompStatus.isConnected}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
      />

      {/* 태블릿 메인 영역 (가로 모드 분할: 대기열 보드 + 데모 제어 사이드바) */}
      <div className="flex-1 flex overflow-hidden">
        <QueueBoard
          queue={data.queue}
          aheadTeams={data.aheadTeams}
          estimatedWaitMin={data.estimatedWaitMin}
          onCall={handleCall}
          onSeat={handleSeat}
          onNoShow={handleNoShow}
        />
        <DemoPanel
          onAddWalkIn={handleAddWalkIn}
          onRemoveWalkIn={handleRemoveWalkIn}
          onSimulateVehicleArrival={handleSimulateVehicleArrival}
          onResetDemo={handleResetDemo}
        />
      </div>

      {/* 설정 모달 */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={data.store.settings}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
      />
    </div>
  );
}

export default App;
