import React, { useState, useEffect } from 'react';
import { Settings, LogOut, SlidersHorizontal } from 'lucide-react';
import type { StoreInfo } from '../../types/pos';

export interface HeaderProps {
  store: StoreInfo;
  isConnected: boolean;
  isDemoOpen?: boolean;
  onToggleDemo?: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

const btn =
  'min-h-[48px] h-12 px-4 rounded-md text-sm font-semibold border flex items-center justify-center gap-2 shrink-0 transition-colors cursor-pointer active-press';

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
      setTimeStr(
        new Date().toLocaleTimeString('ko-KR', {
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
    <header className="h-16 bg-surface border-b border-line px-6 flex items-center justify-between shrink-0 z-30 select-none">
      <div className="flex items-baseline gap-3 min-w-0">
        <h1 className="text-lg font-bold text-ink truncate max-w-[240px]" title={store.name}>
          {store.name}
        </h1>
        <span className="text-sm text-ink-2 shrink-0">{store.category}</span>
      </div>

      <div className="flex items-center gap-5 shrink-0">
        <div className="flex items-center gap-2 text-sm font-medium text-ink-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-main' : 'bg-sub'}`}
            aria-hidden="true"
          />
          <span>{isConnected ? '실시간 연동 중' : '실시간 재연결 중'}</span>
        </div>

        <span className="text-base font-semibold text-ink tabular-nums min-w-[78px] text-right">
          {timeStr || '--:--:--'}
        </span>

        <div className="flex items-center gap-2 shrink-0">
          {onToggleDemo && (
            <button
              onClick={onToggleDemo}
              aria-label="데모 컨트롤러 토글"
              className={`${btn} ${
                isDemoOpen
                  ? 'bg-sub-tint text-ink border-sub'
                  : 'bg-surface touch-hover-sunken text-ink border-line'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 shrink-0" />
              <span>시연 데모</span>
            </button>
          )}

          <button
            onClick={onOpenSettings}
            aria-label="매장 대기 시간 설정"
            className={`${btn} bg-surface touch-hover-sunken text-ink border-line`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>설정</span>
          </button>

          <button
            onClick={onLogout}
            aria-label="시스템 로그아웃"
            className={`${btn} bg-surface touch-hover-danger text-danger border-line`}
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
