import { useState, useCallback, useMemo, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { TabletLayout } from './components/layout/TabletLayout';
import { StoreSummary } from './components/sidebar/StoreSummary';
import { QueueBoard } from './components/queue/QueueBoard';
import { DemoPanel } from './components/demo/DemoPanel';
import { SettingsModal } from './components/SettingsModal';
import { LoginScreen } from './components/LoginScreen';
import { TeamDetailDrawer } from './components/detail/TeamDetailDrawer';
import { ConfirmDialog } from './components/dialogs/ConfirmDialog';
import { usePosStomp } from './hooks/usePosStomp';
import { initialMockQueue, posApi } from './api/posApi';
import type {
  PosQueueResponse,
  QueueFilterTab,
  StoreSettings,
  WaitingItem,
} from './types/pos';

export function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [data, setData] = useState<PosQueueResponse>(initialMockQueue);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isDemoOpen, setIsDemoOpen] = useState<boolean>(true);
  const [currentFilter, setCurrentFilter] = useState<QueueFilterTab>('ALL');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const handleToggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (typeof document !== 'undefined') {
        if (next) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return next;
    });
  }, []);

  // P-04 안전 확인 다이얼로그 상태 (상세 패널 전용)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'SEAT' | 'NO_SHOW';
    team: WaitingItem | null;
  }>({
    isOpen: false,
    type: 'SEAT',
    team: null,
  });

  // 선택된 팀 (큐 데이터로부터 실시간 도출)
  const selectedTeam = useMemo(() => {
    if (!selectedTeamId) return null;
    return data.queue.find((item) => item.id === selectedTeamId) ?? null;
  }, [selectedTeamId, data.queue]);

  // 서버 대기열로 화면을 맞춘다. 서버의 /topic/pos 이벤트는 카드 한 장이라 받으면 전체를 다시 읽는다 (재연결 동기화와 같은 규칙).
  const refresh = useCallback(async () => {
    try {
      const queue = await posApi.getQueue();
      if (queue) setData(queue);
    } catch (e) {
      console.warn(e);
    }
  }, []);

  // 서버 액션 뒤 결과로 다시 맞춘다. 실패하면 낙관적으로 바꾼 화면도 서버 값으로 되돌린다.
  const sync = (request: Promise<void>) => {
    request.catch((e) => console.warn(e)).finally(refresh);
  };

  // ponytail: STOMP가 끊겨도 맞도록 5초마다 다시 읽는다. 부하가 문제면 끊겼을 때만 돌린다.
  useEffect(() => {
    if (!isLoggedIn || !posApi.isServer()) return;
    const timer = setInterval(refresh, 5000);
    return () => clearInterval(timer);
  }, [isLoggedIn, refresh]);

  const stompStatus = usePosStomp(
    isLoggedIn && posApi.isServer() ? data.store.id : '',
    posApi.serverToken(),
    refresh
  );

  // 로그인 처리
  const handleLogin = async (storeId: string, pin: string) => {
    const res = await posApi.login(storeId, pin);
    posApi.setToken(res.token);
    if (posApi.isServer()) await refresh();
    else setData({ ...initialMockQueue, store: { ...initialMockQueue.store, id: storeId, name: res.storeName } });
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
    sync(posApi.callWaiting(waitingId));
  };

  // 착석·노쇼 공통: 화면에서 먼저 뺀다 (즉시 실행)
  const removeTeam = (waitingId: string) => {
    setData((prev) => {
      const filtered = prev.queue.filter((item) => item.id !== waitingId);
      const newAhead = Math.max(0, prev.aheadTeams - 1);
      const estWait =
        prev.store.settings.manualWaitMin ??
        newAhead * prev.store.settings.minutesPerTeam;
      return {
        ...prev,
        aheadTeams: newAhead,
        estimatedWaitMin: estWait,
        queue: filtered.map((item, idx) => ({ ...item, position: idx + 1 })),
      };
    });
    setSelectedTeamId((prev) => (prev === waitingId ? null : prev));
  };

  const handleSeat = (waitingId: string) => {
    removeTeam(waitingId);
    sync(posApi.seatWaiting(waitingId));
  };

  // 노쇼 처리 (즉시 실행)
  const handleNoShow = (waitingId: string) => {
    removeTeam(waitingId);
    sync(posApi.noShowWaiting(waitingId));
  };

  // 상세 패널에서 착석 트리거 -> 확인 다이얼로그 오픈
  const handleDrawerSeat = (waitingId: string) => {
    const target = data.queue.find((item) => item.id === waitingId);
    if (target) {
      setConfirmDialog({
        isOpen: true,
        type: 'SEAT',
        team: target,
      });
    }
  };

  // 상세 패널에서 노쇼 트리거 -> 확인 다이얼로그 오픈
  const handleDrawerNoShow = (waitingId: string) => {
    const target = data.queue.find((item) => item.id === waitingId);
    if (target) {
      setConfirmDialog({
        isOpen: true,
        type: 'NO_SHOW',
        team: target,
      });
    }
  };

  // 확인 다이얼로그 승인 실행
  const handleConfirmAction = () => {
    if (!confirmDialog.team) return;
    const teamId = confirmDialog.team.id;
    if (confirmDialog.type === 'SEAT') {
      handleSeat(teamId);
    } else {
      handleNoShow(teamId);
    }
    setConfirmDialog({ isOpen: false, type: 'SEAT', team: null });
  };

  // 설정 저장
  const handleSaveSettings = (newSettings: StoreSettings) => {
    setData((prev) => {
      const estWait =
        newSettings.manualWaitMin ??
        prev.aheadTeams * newSettings.minutesPerTeam;
      return {
        ...prev,
        store: { ...prev.store, settings: newSettings },
        estimatedWaitMin: estWait,
      };
    });
    sync(posApi.updateSettings(newSettings));
  };

  // 데모 1: 현장 대기 +1 팀
  const handleAddWalkIn = () => {
    const nextTicket =
      (data.queue[data.queue.length - 1]?.ticketNo ?? 10) + 1;
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
      registeredAt: new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };

    setData((prev) => {
      const newQueue = [...prev.queue, newItem];
      const newAhead = prev.aheadTeams + 1;
      const estWait =
        prev.store.settings.manualWaitMin ??
        newAhead * prev.store.settings.minutesPerTeam;
      return {
        ...prev,
        aheadTeams: newAhead,
        estimatedWaitMin: estWait,
        queue: newQueue,
      };
    });

    sync(posApi.triggerWalkInDemo(1));
  };

  // 데모 2: 현장 대기 -1 팀
  const handleRemoveWalkIn = () => {
    const lastWalkIn = [...data.queue]
      .reverse()
      .find((q) => q.channel === 'WALK_IN');
    if (!lastWalkIn) return;

    setData((prev) => {
      const newQueue = prev.queue.filter((q) => q.id !== lastWalkIn.id);
      const newAhead = Math.max(0, prev.aheadTeams - 1);
      const estWait =
        prev.store.settings.manualWaitMin ??
        newAhead * prev.store.settings.minutesPerTeam;
      return {
        ...prev,
        aheadTeams: newAhead,
        estimatedWaitMin: estWait,
        queue: newQueue.map((item, idx) => ({ ...item, position: idx + 1 })),
      };
    });

    sync(posApi.triggerWalkInDemo(-1));
  };

  // 데모 2-1: 골든타임 급증 시연 (+3팀)
  const handleGoldenTimeRush = () => {
    const lastTicket =
      data.queue.length > 0
        ? Math.max(...data.queue.map((q) => q.ticketNo))
        : 10;
    const nowTime = new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const newItems: WaitingItem[] = [1, 2, 3].map((offset, idx) => ({
      id: `wait-rush-${Date.now()}-${offset}`,
      ticketNo: lastTicket + offset,
      partySize: [3, 2, 4][idx] ?? 2,
      status: 'REGISTERED' as const,
      position: data.queue.length + offset,
      etaMin: 15,
      channel: 'WALK_IN' as const,
      arrivalResult: null,
      alighted: null,
      registeredAt: nowTime,
    }));

    setData((prev) => {
      const newQueue = [...prev.queue, ...newItems];
      const newAhead = prev.aheadTeams + 3;
      const estWait =
        prev.store.settings.manualWaitMin ??
        newAhead * prev.store.settings.minutesPerTeam;
      return {
        ...prev,
        aheadTeams: newAhead,
        estimatedWaitMin: estWait,
        queue: newQueue,
      };
    });

    sync(posApi.triggerWalkInDemo(3));
  };

  // 데모 3: 차량 도착 및 하차 완료 시뮬레이션
  const handleSimulateVehicleArrival = () => {
    const nowTimestamp = new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

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
              alighting: {
                status: 'CONFIRMED',
                alightedCount: item.partySize,
                totalPassengers: item.partySize,
                lastSensorTime: nowTimestamp,
              },
            }
          : item
      ),
    }));
  };

  // 데모 4: 초기 리셋
  const handleResetDemo = () => {
    if (posApi.isServer()) sync(posApi.resetDemo());
    else setData(initialMockQueue);
    setCurrentFilter('ALL');
    setSelectedTeamId(null);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const isRightPanelOpen = Boolean(selectedTeam || isDemoOpen);

  return (
    <>
      <TabletLayout
        header={
          <Header
            store={data.store}
            isConnected={stompStatus.isConnected}
            isDemoOpen={isDemoOpen}
            onToggleDemo={() => {
              if (selectedTeamId) {
                setSelectedTeamId(null);
                setIsDemoOpen(true);
              } else {
                setIsDemoOpen((prev) => !prev);
              }
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onLogout={handleLogout}
            isDarkMode={isDarkMode}
            onToggleDarkMode={handleToggleDarkMode}
          />
        }
        leftSidebar={
          <StoreSummary
            aheadTeams={data.aheadTeams}
            estimatedWaitMin={data.estimatedWaitMin}
            queue={data.queue}
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
          />
        }
        rightPanel={
          selectedTeam ? (
            <TeamDetailDrawer
              key={selectedTeam.id}
              selectedTeam={selectedTeam}
              onClose={() => setSelectedTeamId(null)}
              onCall={handleCall}
              onSeat={handleDrawerSeat}
              onNoShow={handleDrawerNoShow}
            />
          ) : isDemoOpen ? (
            <DemoPanel
              onAddWalkIn={handleAddWalkIn}
              onRemoveWalkIn={handleRemoveWalkIn}
              onSimulateVehicleArrival={handleSimulateVehicleArrival}
              onResetDemo={handleResetDemo}
              onGoldenTimeRush={handleGoldenTimeRush}
              onClose={() => setIsDemoOpen(false)}
              walkInCount={
                data.queue.filter((item) => item.channel === 'WALK_IN').length
              }
              aheadTeams={data.aheadTeams}
              estimatedWaitMin={data.estimatedWaitMin}
            />
          ) : null
        }
        isRightPanelOpen={isRightPanelOpen}
      >
        <QueueBoard
          queue={data.queue}
          aheadTeams={data.aheadTeams}
          estimatedWaitMin={data.estimatedWaitMin}
          onCall={handleCall}
          onSeat={handleSeat}
          onNoShow={handleNoShow}
          onSelect={(id) =>
            setSelectedTeamId((prev) => (prev === id ? null : id))
          }
          selectedId={selectedTeamId}
          filter={currentFilter}
          showSummary={false}
        />
      </TabletLayout>

      {/* P-04 안전 확인 다이얼로그 */}
      {confirmDialog.isOpen && confirmDialog.team && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          type={confirmDialog.type}
          ticketNo={confirmDialog.team.ticketNo}
          customerName={confirmDialog.team.customerName}
          partySize={confirmDialog.team.partySize}
          onConfirm={handleConfirmAction}
          onCancel={() =>
            setConfirmDialog({ isOpen: false, type: 'SEAT', team: null })
          }
        />
      )}

      {/* 설정 모달 */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={data.store.settings}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
      />
    </>
  );
}

export default App;
