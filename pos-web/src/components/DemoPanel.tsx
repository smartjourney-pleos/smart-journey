import React from 'react';
import { PlayCircle, Plus, Minus, Car, RotateCcw } from 'lucide-react';

interface DemoPanelProps {
  onAddWalkIn: () => void;
  onRemoveWalkIn: () => void;
  onSimulateVehicleArrival: () => void;
  onResetDemo: () => void;
}

export const DemoPanel: React.FC<DemoPanelProps> = ({
  onAddWalkIn,
  onRemoveWalkIn,
  onSimulateVehicleArrival,
  onResetDemo,
}) => {
  return (
    <aside className="w-80 bg-slate-900/90 border-l border-slate-800 p-5 flex flex-col shrink-0 justify-between">
      <div>
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
          <PlayCircle className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">심사·시연 데모 컨트롤러</h3>
        </div>
        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          심사위원 시연 시, 현장 대기 팀을 증감시켜 차량 앱의 <strong>골든타임 재계산</strong>과 <strong>하차 감지 이벤트</strong>를 연출할 수 있습니다.
        </p>

        {/* 1. 현장 대기 조작 */}
        <div className="mb-6 bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
          <span className="text-xs font-bold text-slate-300 block mb-2">현장 대기 팀 수 조작</span>
          <p className="text-[11px] text-slate-400 mb-3">
            대기 팀이 바뀌면 차량 내비 ETA와 매장 대기시간이 비교되어 차량 화면에 승인 카드가 즉시 팝업됩니다.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onAddWalkIn}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> 현장 +1팀
            </button>
            <button
              onClick={onRemoveWalkIn}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-700/60 hover:bg-slate-700 text-slate-300 border border-slate-600/50 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              <Minus className="w-4 h-4" /> 현장 -1팀
            </button>
          </div>
        </div>

        {/* 2. 차량 도착 및 하차 시뮬레이션 */}
        <div className="mb-6 bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
          <span className="text-xs font-bold text-slate-300 block mb-2">차량 도착 & 하차 시뮬레이션</span>
          <p className="text-[11px] text-slate-400 mb-3">
            도착 이벤트, 정차, 도어 열림, 좌석 센서를 종합하여 POS에 하차 완료 배지를 띄웁니다.
          </p>
          <button
            onClick={onSimulateVehicleArrival}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            <Car className="w-4 h-4 text-emerald-400" />
            <span>하차 확인 이벤트 발생</span>
          </button>
        </div>
      </div>

      {/* 리셋 버튼 */}
      <div className="pt-4 border-t border-slate-800">
        <button
          onClick={onResetDemo}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg text-xs font-medium transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>시연 초기 상태로 리셋</span>
        </button>
      </div>
    </aside>
  );
};
