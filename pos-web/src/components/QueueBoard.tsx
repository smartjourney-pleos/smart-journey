import React from 'react';
import type { WaitingItem } from '../types/pos';
import { WaitingCard } from './WaitingCard';
import { Users, Car, Hourglass, Sparkles } from 'lucide-react';

interface QueueBoardProps {
  queue: WaitingItem[];
  aheadTeams: number;
  estimatedWaitMin: number;
  onCall: (id: string) => void;
  onSeat: (id: string) => void;
  onNoShow: (id: string) => void;
}

export const QueueBoard: React.FC<QueueBoardProps> = ({
  queue,
  aheadTeams,
  estimatedWaitMin,
  onCall,
  onSeat,
  onNoShow,
}) => {
  const vehicleCount = queue.filter((q) => q.channel === 'VEHICLE').length;

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden">
      {/* 요약 대시보드 통계 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">현재 총 대기</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-white font-mono">{aheadTeams}</span>
              <span className="text-xs text-slate-400">팀</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">차량 원격 웨이팅</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-cyan-400 font-mono">{vehicleCount}</span>
              <span className="text-xs text-slate-400">팀</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Hourglass className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">예상 대기 시간</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-amber-400 font-mono">{estimatedWaitMin}</span>
              <span className="text-xs text-slate-400">분</span>
            </div>
          </div>
        </div>
      </div>

      {/* 대기 목록 타이틀 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-white">실시간 웨이팅 현황</h2>
          <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full border border-slate-700 font-mono">
            {queue.length} 건
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> 차량 자동 등록
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span> 현장 등록
          </span>
        </div>
      </div>

      {/* 대기열 카드 그리드 (태블릿 최적화 스크롤) */}
      <div className="flex-1 overflow-y-auto pr-1">
        {queue.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-3xl p-12">
            <Sparkles className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-base font-semibold text-slate-300">현재 대기 중인 고객이 없습니다.</p>
            <p className="text-xs text-slate-500 mt-1">차량 앱이나 현장에서 새 웨이팅이 접수되면 실시간으로 표시됩니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            {queue.map((item) => (
              <WaitingCard
                key={item.id}
                item={item}
                onCall={onCall}
                onSeat={onSeat}
                onNoShow={onNoShow}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
