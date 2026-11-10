import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  PlayCircle,
  Plus,
  Minus,
  Car,
  RotateCcw,
  Zap,
  Sparkles,
  X,
  Users,
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

  return (
    <motion.aside
      initial={{ x: '100%', opacity: 0.8 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30, mass: 0.8 }}
      className={`w-[360px] w-full shrink-0 h-full flex flex-col bg-[#0f172a]/95 backdrop-blur-md overflow-hidden select-none border-l border-slate-800/80 shadow-xl z-20 ${className}`}
    >
      {/* 1. 고정 헤더 영역 (64px) */}
      <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-900/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <PlayCircle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight truncate">
                시연 제어 패널
              </h2>
              {/* 심사위원 실시간 연동 뱃지 */}
              <span className="inline-flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span>실시간 연동</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium truncate">
              심사·시연 데모 컨트롤러
            </p>
          </div>
        </div>

        {/* 닫기 버튼 (최소 48px 터치 타깃 준수) */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="데모 닫기"
            className="w-12 h-12 min-h-[48px] min-w-[48px] rounded-xl flex items-center justify-center text-slate-400 touch-hover-slate-700 touch-hover-text-slate-200 active-press cursor-pointer border border-transparent touch-hover-border-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. 스크롤 가능한 본문 영역 */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* 설명 배너 (테스트 어설션 호환) */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-400 leading-relaxed shadow-sm">
          <p>
            심사위원 시연 시, 현장 대기 팀을 증감시켜 차량 앱의{' '}
            <strong className="text-slate-200 font-semibold">골든타임 재계산</strong>과{' '}
            <strong className="text-slate-200 font-semibold">하차 감지 이벤트</strong>를 연출할 수 있습니다.
          </p>
        </div>

        {/* 섹션 1: 현장 대기 조작 */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-400" />
              현장 대기 팀 수 조작
            </span>
            {(typeof walkInCount === 'number' || typeof aheadTeams === 'number') && (
              <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 px-2 py-0.5 rounded-md tabular-nums font-bold">
                {typeof walkInCount === 'number' ? `현장 ${walkInCount}팀` : `총 ${aheadTeams}팀`}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            대기 팀이 바뀌면 차량 내비 ETA와 매장 대기시간이 비교되어 차량 화면에 승인 카드가 즉시 팝업됩니다.
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleAdd}
              aria-label="현장 +1팀"
              className="min-h-[48px] h-12 flex items-center justify-center gap-1.5 px-3 bg-indigo-600/30 touch-hover-indigo-500 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold transition cursor-pointer active-press touch-manipulation select-none shadow-sm"
            >
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>현장 +1팀</span>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              aria-label="현장 -1팀"
              className="min-h-[48px] h-12 flex items-center justify-center gap-1.5 px-3 bg-slate-700/60 touch-hover-slate-700 text-slate-300 border border-slate-600/50 rounded-xl text-xs font-bold transition cursor-pointer active-press touch-manipulation select-none shadow-sm"
            >
              <Minus className="w-4 h-4 text-slate-400" />
              <span>현장 -1팀</span>
            </button>
          </div>
        </div>

        {/* 섹션 2: 골든타임 급증 시연 (+3팀) (Feature 16) */}
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              골든타임 급증 시연 (+3팀)
            </span>
            <span className="text-[10px] text-amber-400/90 font-mono bg-amber-900/40 border border-amber-500/40 px-2 py-0.5 rounded-full font-semibold">
              심사 PT 추천
            </span>
          </div>
          <p className="text-[11px] text-amber-200/70 leading-relaxed">
            심사위원 시연 시 단 한 번의 탭으로 +3팀 급증을 발생시켜 차량 골든타임 재계산(V-07 알림)을 유도합니다.
          </p>
          <button
            type="button"
            onClick={handleGoldenTimeRush}
            aria-label="+3팀 골든타임 시연"
            className="w-full min-h-[48px] h-12 flex items-center justify-center gap-2 px-4 bg-amber-500/20 touch-hover-amber-400 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition cursor-pointer active-press touch-manipulation select-none shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>+3팀 골든타임 시연</span>
          </button>
        </div>

        {/* 섹션 3: 차량 도착 & 하차 시뮬레이션 (Feature 17) */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Car className="w-4 h-4" />
              차량 도착 & 하차 시뮬레이션
            </span>
            <span className="text-[10px] text-emerald-400/80 font-mono bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
              GPS · 센서 연동
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            도착 이벤트, 정차, 도어 열림, 좌석 센서를 종합하여 POS에 하차 완료 배지를 띄웁니다.
          </p>
          <button
            type="button"
            onClick={handleArrival}
            aria-label="하차 확인 이벤트 발생"
            className="w-full min-h-[48px] h-12 flex items-center justify-center gap-2 px-4 bg-emerald-600/30 touch-hover-emerald-500 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition cursor-pointer active-press touch-manipulation select-none shadow-sm"
          >
            <Car className="w-4 h-4 text-emerald-400" />
            <span>하차 확인 이벤트 발생</span>
          </button>
        </div>
      </div>

      {/* 4. 하단 고정 리셋 버튼 바 (Feature 18) */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/95 shrink-0 mt-auto">
        <button
          type="button"
          onClick={onResetDemo}
          aria-label="시연 초기 상태로 리셋 (기본 상태 복원)"
          className="w-full min-h-[48px] h-12 flex items-center justify-center gap-2 px-4 bg-slate-800 touch-hover-slate-700 text-slate-400 touch-hover-text-slate-200 border border-slate-700/60 rounded-xl text-xs font-medium transition cursor-pointer active-press touch-manipulation select-none"
        >
          <RotateCcw className="w-4 h-4 text-slate-400" />
          <span>시연 초기 상태로 리셋 (기본 상태 복원)</span>
        </button>
      </div>
    </motion.aside>
  );
};

export default DemoPanel;
