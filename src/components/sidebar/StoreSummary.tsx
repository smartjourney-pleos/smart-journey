import React from 'react';
import { Users, Car, UserCheck, Hourglass } from 'lucide-react';
import type { QueueFilterTab, WaitingItem } from '../../types/pos';

export interface StoreSummaryProps {
  aheadTeams: number;
  estimatedWaitMin: number;
  queue: WaitingItem[];
  currentFilter: QueueFilterTab;
  onFilterChange: (tab: QueueFilterTab) => void;
  className?: string;
}

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
    <div className={`p-4 flex flex-col gap-4 select-none ${className}`}>
      {/* 1. 상단 타이틀 */}
      <div className="pb-1 border-b border-slate-800/80">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          대기 현황 요약
        </span>
        <p className="text-xs text-slate-300 font-semibold mt-0.5">실시간 관제 지표</p>
      </div>

      {/* 2. 요약 지표 통계 카드 (단위 명시: 팀, 분) - 4단 수직 스택 */}
      <div className="flex flex-col gap-2">
        {/* 현재 총 대기 */}
        <div className="bg-[#131c2e] border border-slate-700/80 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">현재 총 대기</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-extrabold text-white font-mono tabular-nums leading-none">
                {aheadTeams}
              </span>
              <span className="text-xs text-slate-400 font-medium">팀</span>
            </div>
          </div>
        </div>

        {/* 차량 원격 웨이팅 */}
        <div className="bg-[#131c2e] border border-slate-700/80 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">차량 원격 웨이팅</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-extrabold text-cyan-400 font-mono tabular-nums leading-none">
                {vehicleCount}
              </span>
              <span className="text-xs text-slate-400 font-medium">팀</span>
            </div>
          </div>
        </div>

        {/* 일반 현장 대기 / 현장 대기 (Feature 4 & PosSummary 준수) */}
        <div className="bg-[#131c2e] border border-slate-700/80 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">현장 대기</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-extrabold text-emerald-400 font-mono tabular-nums leading-none">
                {walkInCount}&#8203;
              </span>
              <span className="text-xs text-slate-400 font-medium">팀</span>
            </div>
          </div>
        </div>

        {/* 예상 대기 시간 */}
        <div className="bg-[#131c2e] border border-slate-700/80 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Hourglass className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">예상 대기 시간</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-extrabold text-amber-400 font-mono tabular-nums leading-none">
                {estimatedWaitMin}
              </span>
              <span className="text-xs text-slate-400 font-medium">분</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 대기열 필터 탭 (min-h-[48px] 터치 규격 및 건 접미사) */}
      <div className="pt-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
          대기열 필터
        </span>
        <div className="flex flex-col gap-1.5">
          {filterTabs.map((tab) => {
            const isActive = currentFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onFilterChange(tab.key)}
                className={`
                  min-h-[48px] h-12 flex items-center justify-between w-full px-3.5 rounded-xl font-medium text-xs
                  cursor-pointer select-none touch-manipulation transition-all duration-160 ease-out active-press
                  ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-950/40 border border-indigo-500/50'
                      : 'bg-slate-800/40 text-slate-400 touch-hover-text-slate-200 touch-hover-slate-800-70 border border-slate-700/30'
                  }
                `}
              >
                <span>{tab.label}</span>
                <span
                  className={`
                    px-2 py-0.5 rounded-full text-[11px] font-mono tabular-nums
                    ${
                      isActive
                        ? 'bg-indigo-500/40 text-white font-bold'
                        : 'bg-slate-900/60 text-slate-500 border border-slate-700/40'
                    }
                  `}
                >
                  {tab.count}건
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. 하단 고정 배너 */}
      <div className="mt-auto pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 text-center font-mono">
        <span>Pleos Connect POS · 1024px+</span>
      </div>
    </div>
  );
};

export default StoreSummary;
