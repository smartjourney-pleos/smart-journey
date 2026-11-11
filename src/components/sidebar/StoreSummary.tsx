import React from 'react';
import { Layers, Navigation, CheckCircle2, Bell, Flame } from 'lucide-react';
import type { QueueFilterTab, WaitingItem } from '../../types/pos';

export interface StoreSummaryProps {
  aheadTeams: number;
  estimatedWaitMin: number;
  queue: WaitingItem[];
  currentFilter: QueueFilterTab;
  onFilterChange: (tab: QueueFilterTab) => void;
  className?: string;
}

const Stat: React.FC<{
  label: string;
  value: React.ReactNode;
  unit: string;
  big?: boolean;
}> = ({ label, value, unit, big = false }) => (
  <div className="flex items-baseline justify-between py-3 border-b border-line last:border-b-0">
    <span className={`text-sm ${big ? 'text-ink font-bold' : 'text-ink-2'}`}>{label}</span>
    <span className="flex items-baseline gap-1.5">
      <span
        className={`font-extrabold text-ink tabular-nums leading-none tracking-tight ${
          big ? 'text-4xl' : 'text-xl'
        }`}
      >
        {value}
      </span>
      <span className="text-sm font-medium text-ink-2">{unit}</span>
    </span>
  </div>
);

export const StoreSummary: React.FC<StoreSummaryProps> = ({
  aheadTeams,
  estimatedWaitMin,
  queue,
  currentFilter,
  onFilterChange,
  className = '',
}) => {
  const vehicleCount = queue.filter((q) => q.channel === 'VEHICLE').length;
  const walkInCount = queue.filter(
    (q) => q.channel === 'WALK_IN' || (q.channel as string) === 'GENERAL'
  ).length;
  const movingCount = queue.filter(
    (q) => q.status === 'REGISTERED' || q.status === 'MOVING'
  ).length;
  const arrivedCount = queue.filter((q) => q.status === 'ARRIVED').length;
  const calledCount = queue.filter((q) => q.status === 'CALLED').length;

  const filterTabs: Array<{
    key: QueueFilterTab;
    label: string;
    count: number;
    icon: React.ReactNode;
  }> = [
    { key: 'ALL', label: '전체', count: queue.length, icon: <Layers className="w-4 h-4" /> },
    { key: 'MOVING', label: '이동 중', count: movingCount, icon: <Navigation className="w-4 h-4" /> },
    { key: 'ARRIVED', label: '도착팀', count: arrivedCount, icon: <CheckCircle2 className="w-4 h-4" /> },
    { key: 'CALLED', label: '호출팀', count: calledCount, icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <div className={`p-5 flex flex-col gap-6 select-none ${className}`}>
      {/* Pleos Metrics Container */}
      <section className="bg-surface rounded-xl p-4 border border-line">
        <div className="flex items-center justify-between pb-2 mb-1 border-b border-line/60">
          <span className="text-xs font-bold text-ink-2 uppercase tracking-wider">
            매장 대기 현황 요약
          </span>
          {aheadTeams > 5 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-sub-tint text-ink border border-sub/30">
              <Flame className="w-3 h-3 text-sub" /> 혼잡
            </span>
          )}
        </div>

        <div>
          <Stat label="현재 총 대기" value={aheadTeams} unit="팀" big />
          <Stat label="차량 원격 웨이팅" value={vehicleCount} unit="팀" />
          <Stat label="현장 대기" value={<>{walkInCount}&#8203;</>} unit="팀" />
          <Stat label="예상 대기 시간" value={estimatedWaitMin} unit="분" />
        </div>
      </section>

      {/* Pleos Segmented Box Tabs (Category Filter) */}
      <nav aria-label="웨이팅 상태별 필터" className="flex flex-col gap-1.5">
        <span className="text-xs font-bold text-ink-2 uppercase tracking-wider px-1 mb-1">
          상태별 큐 필터
        </span>
        {filterTabs.map((tab) => {
          const isActive = currentFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onFilterChange(tab.key)}
              className={`min-h-[48px] h-12 flex items-center justify-between w-full px-4 rounded-md text-sm cursor-pointer select-none touch-manipulation transition-colors duration-150 ease-out active-press ${
                isActive
                  ? 'bg-main text-white font-bold'
                  : 'text-ink-2 touch-hover-sunken touch-hover-ink font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-white' : 'text-ink-2'}>{tab.icon}</span>
                <span>{tab.label}</span>
              </div>
              <span
                className={`tabular-nums text-xs px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-sunken text-ink-2'
                }`}
              >
                {tab.count}건
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default StoreSummary;
