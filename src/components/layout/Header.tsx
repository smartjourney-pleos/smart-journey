import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Settings, LogOut, Clock, Store, SlidersHorizontal } from 'lucide-react';
import type { StoreInfo } from '../../types/pos';

export interface HeaderProps {
  store: StoreInfo;
  isConnected: boolean;
  isDemoOpen?: boolean;
  onToggleDemo?: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  store,
  isConnected,
  isDemoOpen = false,
  onToggleDemo,
  onOpenSettings,
  onLogout,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-[#0d1322]/95 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between shrink-0 z-30 select-none shadow-sm">
      {/* 좌측: 매장 브랜드 및 정체성 */}
      <div className="flex items-center space-x-3.5 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-inner shrink-0">
          <Store className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center space-x-2 min-w-0">
            <h1
              className="text-base font-bold text-white tracking-tight truncate max-w-[240px]"
              title={store.name}
            >
              {store.name}
            </h1>
            <span className="text-[11px] bg-indigo-500/15 text-indigo-300 px-2 py-0.5 rounded-full font-semibold border border-indigo-500/30 shrink-0">
              {store.category}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium truncate">현대자동차 Pleos Connect · 스마트 저니 POS</p>
        </div>
      </div>

      {/* 우측: 실시간 연동 상태, 시계, 제어 토글 */}
      <div className="flex items-center space-x-4 shrink-0">
        {/* STOMP 실시간 연동 뱃지 */}
        <div
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
            isConnected
              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
              : 'bg-amber-950/60 text-amber-400 border-amber-500/40 animate-pulse'
          }`}
        >
          {isConnected ? (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          ) : (
            <span className="inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
          )}
          {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span>{isConnected ? '실시간 연동 중' : '실시간 재연결 중'}</span>
        </div>

        {/* 현재 시각 (디지털 시계 tabular-nums) */}
        <div className="flex items-center space-x-2 text-slate-200 font-mono text-sm bg-slate-800/60 px-3.5 py-1.5 rounded-xl border border-slate-700/60 tabular-nums shadow-inner min-w-[105px] justify-center">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{timeStr || '--:--:--'}</span>
        </div>

        {/* 제어 버튼군 */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* 심사위원 데모 패널 토글 */}
          {onToggleDemo && (
            <button
              onClick={onToggleDemo}
              aria-label="데모 컨트롤러 토글"
              className={`min-h-[48px] h-12 px-4 rounded-xl text-xs font-semibold border flex items-center justify-center space-x-2 shrink-0 transition-colors cursor-pointer active-press ${
                isDemoOpen
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-slate-800 touch-hover-slate-700 text-slate-300 border-slate-700/70'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-400 shrink-0" />
              <span>시연 데모</span>
            </button>
          )}

          {/* 매장 설정 버튼 */}
          <button
            onClick={onOpenSettings}
            aria-label="매장 대기 시간 설정"
            className={`min-h-[48px] h-12 px-4 bg-slate-800 touch-hover-slate-700 text-slate-300 border border-slate-700/70 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 shrink-0 transition-colors cursor-pointer active-press`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>설정</span>
          </button>

          {/* 종료 버튼 */}
          <button
            onClick={onLogout}
            aria-label="시스템 로그아웃"
            className={`min-h-[48px] h-12 px-4 bg-rose-950/30 touch-hover-rose-900 text-rose-300 border border-rose-800/40 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 shrink-0 transition-colors cursor-pointer active-press`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>종료</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
