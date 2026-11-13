import React, { useState, useEffect } from 'react';
import { Settings, LogOut, SlidersHorizontal, Sun, Moon, Radio } from 'lucide-react';
import type { StoreInfo } from '../../types/pos';

export interface HeaderProps {
  store: StoreInfo;
  isConnected: boolean;
  isDemoOpen?: boolean;
  onToggleDemo?: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

const btn =
  'min-h-[48px] h-12 px-4 rounded-md text-sm font-semibold border flex items-center justify-center gap-2 shrink-0 transition-colors cursor-pointer active-press select-none touch-manipulation';

export const Header: React.FC<HeaderProps> = ({
  store,
  isConnected,
  isDemoOpen = false,
  onToggleDemo,
  onOpenSettings,
  onLogout,
  isDarkMode = false,
  onToggleDarkMode,
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
      {/* Pleos Connect Identity & Store Meta */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-main-tint text-main text-xs font-extrabold tracking-wider border border-main/20">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            PLEOS CONNECT
          </span>
        </div>

        <div className="flex items-baseline gap-2.5 min-w-0">
          <h1 className="text-lg font-bold text-ink truncate max-w-[240px]" title={store.name}>
            {store.name}
          </h1>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sunken text-ink-2 shrink-0">
            {store.category}
          </span>
        </div>
      </div>

      {/* Pleos Status Bar SP0/SP1 System Area */}
      <div className="flex items-center gap-5 shrink-0">
        {/* Dynamic Status Indicator (SP0) */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            isConnected
              ? 'bg-main-tint/60 text-main border-main/20'
              : 'bg-sub-tint/60 text-ink border-sub/30'
          }`}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full shrink-0 ${
              isConnected ? 'bg-main shadow-[0_0_8px_rgba(0,100,255,0.6)]' : 'bg-sub'
            }`}
            aria-hidden="true"
          />
          <span>{isConnected ? '실시간 연동 중' : '실시간 재연결 중'}</span>
        </div>

        {/* Tabular Time Display (SP1 Static) */}
        <span className="text-base font-bold text-ink tabular-nums min-w-[78px] text-right tracking-tight">
          {timeStr || '--:--:--'}
        </span>

        {/* Action Button Group */}
        <div className="flex items-center gap-2 shrink-0">
          {onToggleDarkMode && (
            <button
              type="button"
              onClick={onToggleDarkMode}
              aria-label="화면 모드 전환"
              title={isDarkMode ? '라이트 모드로 전환' : '인카 다크 모드로 전환'}
              className={`${btn} bg-surface touch-hover-sunken text-ink border-line px-3`}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-sub" /> : <Moon className="w-4 h-4 text-ink-2" />}
            </button>
          )}

          {onToggleDemo && (
            <button
              type="button"
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
            type="button"
            onClick={onOpenSettings}
            aria-label="매장 대기 시간 설정"
            className={`${btn} bg-surface touch-hover-sunken text-ink border-line`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>설정</span>
          </button>

          <button
            type="button"
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
