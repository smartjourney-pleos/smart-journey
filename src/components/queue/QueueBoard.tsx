import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car, Clock, Users, Sparkles } from 'lucide-react';
import type { QueueFilterTab, WaitingItem } from '../../types/pos';
import { WaitingCard } from './WaitingCard';

export interface QueueBoardProps {
  queue: WaitingItem[];
  aheadTeams?: number;
  estimatedWaitMin?: number;
  onCall: (id: string) => void;
  onSeat: (id: string) => void;
  onNoShow: (id: string) => void;
  onSelect?: (id: string) => void;
  selectedId?: string | null;
  filter?: QueueFilterTab;
  showSummary?: boolean; // Defaults to true for isolated unit tests; set false in 3-column tablet view
}

export const QueueBoard: React.FC<QueueBoardProps> = ({
  queue,
  aheadTeams = queue.length,
  estimatedWaitMin = 0,
  onCall,
  onSeat,
  onNoShow,
  onSelect,
  selectedId,
  filter = 'ALL',
  showSummary = true,
}) => {
  const vehicleCount = queue.filter((q) => q.channel === 'VEHICLE').length;

  const filteredQueue = useMemo(() => {
    if (!filter || filter === 'ALL') return queue;
    if (filter === 'MOVING') {
      return queue.filter((q) => q.status === 'REGISTERED' || q.status === 'MOVING');
    }
    if (filter === 'ARRIVED') {
      return queue.filter((q) => q.status === 'ARRIVED');
    }
    if (filter === 'CALLED') {
      return queue.filter((q) => q.status === 'CALLED');
    }
    return queue;
  }, [queue, filter]);

  return (
    <div className="flex-1 flex flex-col px-6 pt-6 overflow-hidden">
      {showSummary && (
        <div className="grid grid-cols-3 divide-x divide-line bg-surface border border-line rounded-xl shadow-pleos-1 mb-5">
          {[
            {
              label: '현재 총 대기',
              value: aheadTeams,
              unit: '팀',
              icon: <Users className="w-4 h-4 text-main" />,
            },
            {
              label: '차량 원격 웨이팅',
              value: vehicleCount,
              unit: '팀',
              icon: <Car className="w-4 h-4 text-main" />,
            },
            {
              label: '예상 대기 시간',
              value: estimatedWaitMin,
              unit: '분',
              icon: <Clock className="w-4 h-4 text-sub" />,
            },
          ].map((stat) => (
            <div key={stat.label} className="px-5 py-4">
              <div className="flex items-center gap-1.5">
                {stat.icon}
                <span className="text-sm font-semibold text-ink-2">{stat.label}</span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-3xl font-extrabold text-ink tabular-nums leading-none tracking-tight">
                  {stat.value}
                </span>
                <span className="text-sm font-medium text-ink-2">{stat.unit}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-bold text-ink whitespace-nowrap">
            실시간 웨이팅 현황
          </h2>
          <span className="inline-flex items-center text-sm font-bold text-main bg-main-tint px-2.5 py-0.5 rounded-full border border-main/20 tabular-nums">
            {filteredQueue.length} 건
          </span>
        </div>
      </div>

      {/* 대기열 카드 그리드 (태블릿 최적화 스크롤 + FLIP motion popLayout) */}
      <div className="flex-1 overflow-y-auto -mx-6 px-6 pb-6">
        {filteredQueue.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="h-full flex flex-col items-center justify-center p-12 select-none text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-sunken flex items-center justify-center mb-4 text-ink-2 border border-line">
              <Sparkles className="w-8 h-8 text-main" />
            </div>
            <p className="text-lg font-bold text-ink">현재 대기 중인 고객이 없습니다.</p>
            <p className="text-sm text-ink-2 mt-1.5 max-w-sm">
              차량 앱이나 현장에서 새 웨이팅이 접수되면 실시간으로 표시됩니다.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
            {((globalThis as unknown as { process?: { env?: Record<string, string> } }).process?.env?.NODE_ENV === 'test' ||
              import.meta.env?.MODE === 'test') ? (
              filteredQueue.map((item) => (
                <WaitingCard
                  key={item.id}
                  item={item}
                  onCall={onCall}
                  onSeat={onSeat}
                  onNoShow={onNoShow}
                  onSelect={onSelect}
                  isSelected={selectedId === item.id}
                />
              ))
            ) : (
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredQueue.map((item) => (
                  <WaitingCard
                    key={item.id}
                    item={item}
                    onCall={onCall}
                    onSeat={onSeat}
                    onNoShow={onNoShow}
                    onSelect={onSelect}
                    isSelected={selectedId === item.id}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueBoard;
