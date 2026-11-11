import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Plus,
  Minus,
  Car,
  RotateCcw,
  Zap,
  X,
} from 'lucide-react';

export interface DemoPanelProps {
  onAddWalkIn: () => void;
  onRemoveWalkIn: () => void;
  onSimulateVehicleArrival: () => void;
  onResetDemo: () => void;
  onGoldenTimeRush?: () => void;
  onClose?: () => void;
  walkInCount?: number;
  aheadTeams?: number;
  estimatedWaitMin?: number;
  className?: string;
  // Aliases for compatibility
  onIncrementWalkIn?: () => void;
  onDecrementWalkIn?: () => void;
  onSimulateAlighting?: () => void;
  onSimulateGoldenTime?: () => void;
}

export const DemoPanel: React.FC<DemoPanelProps> = ({
  onAddWalkIn,
  onRemoveWalkIn,
  onSimulateVehicleArrival,
  onResetDemo,
  onGoldenTimeRush,
  onClose,
  walkInCount,
  aheadTeams,
  estimatedWaitMin: _estimatedWaitMin,
  className = '',
  onIncrementWalkIn,
  onDecrementWalkIn,
  onSimulateAlighting,
  onSimulateGoldenTime,
}) => {
  const [, setIsSurging] = useState<boolean>(false);

  const handleAdd = onIncrementWalkIn ?? onAddWalkIn;
  const handleRemove = onDecrementWalkIn ?? onRemoveWalkIn;
  const handleArrival = onSimulateAlighting ?? onSimulateVehicleArrival;
  const handleRush = onGoldenTimeRush ?? onSimulateGoldenTime;

  // 골든타임 원클릭 급증 (+3팀)
  const handleGoldenTimeRush = () => {
    setIsSurging(true);
    if (handleRush) {
      handleRush();
    } else if (handleAdd) {
      handleAdd();
      handleAdd();
      handleAdd();
    }
    setTimeout(() => setIsSurging(false), 800);
  };

  const action =
    'w-full min-h-[48px] h-12 flex items-center justify-center gap-2 px-4 rounded-md text-sm font-bold transition-colors cursor-pointer active-press touch-manipulation select-none';

  return (
    <motion.aside
      initial={{ x: '100%', opacity: 0.8 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30, mass: 0.8 }}
      className={`w-[360px] w-full shrink-0 h-full flex flex-col bg-surface overflow-hidden select-none border-l border-line z-20 ${className}`}
    >
      <div className="h-16 px-5 border-b border-line flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="text-base font-bold text-ink truncate">시연 제어 패널</h2>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-2 shrink-0">
            <span className="h-2 w-2 rounded-full bg-main" aria-hidden="true" />
            <span>실시간 연동</span>
          </span>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="데모 닫기"
            className="w-12 h-12 min-h-[48px] min-w-[48px] rounded-md flex items-center justify-center text-ink-2 touch-hover-sunken touch-hover-ink active-press cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        <p className="text-sm text-ink-2 leading-relaxed">
          심사위원 시연 시, 현장 대기 팀을 증감시켜 차량 앱의{' '}
          <strong className="text-ink font-semibold">골든타임 재계산</strong>과{' '}
          <strong className="text-ink font-semibold">하차 감지 이벤트</strong>를 연출할 수 있습니다.
        </p>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink">현장 대기 팀 수 조작</h3>
            {(typeof walkInCount === 'number' || typeof aheadTeams === 'number') && (
              <span className="text-sm font-bold text-main tabular-nums">
                {typeof walkInCount === 'number' ? `현장 ${walkInCount}팀` : `총 ${aheadTeams}팀`}
              </span>
            )}
          </div>
          <p className="text-sm text-ink-2 leading-relaxed">
            대기 팀이 바뀌면 차량 내비 ETA와 매장 대기시간이 비교되어 차량 화면에 승인 카드가 즉시 팝업됩니다.
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleAdd}
              aria-label="현장 +1팀"
              className={`${action} bg-surface border border-line text-ink touch-hover-sunken`}
            >
              <Plus className="w-4 h-4" />
              <span>현장 +1팀</span>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              aria-label="현장 -1팀"
              className={`${action} bg-surface border border-line text-ink touch-hover-sunken`}
            >
              <Minus className="w-4 h-4" />
              <span>현장 -1팀</span>
            </button>
          </div>
        </section>

        <section className="pt-5 border-t border-line space-y-3">
          <h3 className="text-sm font-bold text-ink">골든타임 급증 시연 (+3팀)</h3>
          <p className="text-sm text-ink-2 leading-relaxed">
            심사위원 시연 시 단 한 번의 탭으로 +3팀 급증을 발생시켜 차량 골든타임 재계산(V-07 알림)을 유도합니다.
          </p>
          <button
            type="button"
            onClick={handleGoldenTimeRush}
            aria-label="+3팀 골든타임 시연"
            className={`${action} bg-sub text-ink touch-hover-sub`}
          >
            <Zap className="w-4 h-4" />
            <span>+3팀 골든타임 시연</span>
          </button>
        </section>

        <section className="pt-5 border-t border-line space-y-3">
          <h3 className="text-sm font-bold text-ink">차량 도착 & 하차 시뮬레이션</h3>
          <p className="text-sm text-ink-2 leading-relaxed">
            도착 이벤트, 정차, 도어 열림, 좌석 센서를 종합하여 POS에 하차 완료 배지를 띄웁니다.
          </p>
          <button
            type="button"
            onClick={handleArrival}
            aria-label="하차 확인 이벤트 발생"
            className={`${action} bg-surface border border-line text-ink touch-hover-sunken`}
          >
            <Car className="w-4 h-4" />
            <span>하차 확인 이벤트 발생</span>
          </button>
        </section>
      </div>

      <div className="p-4 border-t border-line shrink-0 mt-auto">
        <button
          type="button"
          onClick={onResetDemo}
          aria-label="시연 초기 상태로 리셋 (기본 상태 복원)"
          className={`${action} bg-sunken text-ink touch-hover-line font-medium`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>시연 초기 상태로 리셋 (기본 상태 복원)</span>
        </button>
      </div>
    </motion.aside>
  );
};

export default DemoPanel;
