import React from 'react';
import type { QueueFilterTab, WaitingItem } from '../../types/pos';

export interface StoreSummaryProps {
  aheadTeams: number;
  estimatedWaitMin: number;
  queue: WaitingItem[];
  currentFilter: QueueFilterTab;
  onFilterChange: (tab: QueueFilterTab) => void;
  className?: string;
}

const Stat: React.FC<{ label: string; value: React.ReactNode; unit: string; big?: boolean }> = ({
  label,
  value,
  unit,
  big = false,
}) => (
  <div className="flex items-baseline justify-between py-3 border-b border-line">
    <span className="text-sm text-ink-2">{label}</span>
    <span className="flex items-baseline gap-1">
      <span
        className={`font-bold text-ink tabular-nums leading-none ${big ? 'text-4xl' : 'text-xl'}`}
      >
        {value}
      </span>
      <span className="text-sm text-ink-2">{unit}</span>
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

  const filterTabs: Array<{ key: QueueFilterTab; label: string; count: number }> = [
    { key: 'ALL', label: '전체', count: queue.length },
    { key: 'MOVING', label: '이동 중', count: movingCount },
    { key: 'ARRIVED', label: '도착팀', count: arrivedCount },
    { key: 'CALLED', label: '호출팀', count: calledCount },
  ];

  return (
    <div className={`p-5 flex flex-col gap-6 select-none ${className}`}>
      <div>
        <Stat label="현재 총 대기" value={aheadTeams} unit="팀" big />
        <Stat label="차량 원격 웨이팅" value={vehicleCount} unit="팀" />
        <Stat label="현장 대기" value={<>{walkInCount}&#8203;</>} unit="팀" />
        <Stat label="예상 대기 시간" value={estimatedWaitMin} unit="분" />
      </div>

      <div className="flex flex-col gap-1.5">
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
              <span>{tab.label}</span>
              <span className="tabular-nums">{tab.count}건</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StoreSummary;
