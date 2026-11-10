import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Settings, LogOut, Clock, Store } from 'lucide-react';
import type { StoreInfo } from '../types/pos';

interface HeaderProps {
  store: StoreInfo;
  isConnected: boolean;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  store,
  isConnected,
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
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between shrink-0 shadow-lg">
      {/* 매장 정보 */}
      <div className="flex items-center space-x-3">
        <div className="bg-indigo-600/30 p-2.5 rounded-xl border border-indigo-500/30 text-indigo-400">
          <Store className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white tracking-tight">{store.name}</h1>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-medium border border-indigo-500/30">
              {store.category}
            </span>
          </div>
          <p className="text-xs text-slate-400">Pleos Connect Smart Journey POS</p>
        </div>
      </div>

      {/* 상태 및 시계 */}
      <div className="flex items-center space-x-6">
        {/* STOMP 연결 상태 */}
        <div
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            isConnected
              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
              : 'bg-amber-950/60 text-amber-400 border-amber-500/40 animate-pulse'
          }`}
        >
          {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span>{isConnected ? '실시간 연동 중' : '실시간 재연결 중'}</span>
        </div>

        {/* 현재 시각 */}
        <div className="flex items-center space-x-2 text-slate-300 font-mono text-sm bg-slate-900/60 px-3.5 py-1.5 rounded-lg border border-slate-700/60">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>{timeStr}</span>
        </div>

        {/* 제어 버튼 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenSettings}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-slate-200 rounded-lg text-sm font-medium transition cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>설정</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 rounded-lg text-sm font-medium transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>종료</span>
          </button>
        </div>
      </div>
    </header>
  );
};
