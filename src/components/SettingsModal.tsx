import React, { useState } from 'react';
import { X, Save, Clock, ShieldAlert } from 'lucide-react';
import type { StoreSettings } from '../types/pos';

interface SettingsModalProps {
  isOpen: boolean;
  settings: StoreSettings;
  onClose: () => void;
  onSave: (newSettings: StoreSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSave,
}) => {
  const [minutesPerTeam, setMinutesPerTeam] = useState<number>(settings.minutesPerTeam);
  const [arrivalBufferMin, setArrivalBufferMin] = useState<number>(settings.arrivalBufferMin);
  const [useManual, setUseManual] = useState<boolean>(settings.manualWaitMin !== null);
  const [manualWaitMin, setManualWaitMin] = useState<number>(settings.manualWaitMin ?? 20);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      minutesPerTeam,
      arrivalBufferMin,
      manualWaitMin: useManual ? manualWaitMin : null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* 모달 헤더 */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">매장 대기 시간 설정</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 본문 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              팀당 평균 식사·대기 시간 (분)
            </label>
            <input
              type="number"
              min={1}
              max={60}
              value={minutesPerTeam}
              onChange={(e) => setMinutesPerTeam(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">기본값: 5분. (앞선 대기 팀 수 × 이 값으로 대기시간 계산)</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              차량 도착 여유 시간 (분)
            </label>
            <input
              type="number"
              min={0}
              max={30}
              value={arrivalBufferMin}
              onChange={(e) => setArrivalBufferMin(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">기본값: 10분. 주차 및 이동 시간을 감안한 골든타임 버퍼</p>
          </div>

          {/* 수동 대기시간 강제 설정 */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                점주 수동 대기시간 덮어쓰기
              </label>
              <input
                type="checkbox"
                checked={useManual}
                onChange={(e) => setUseManual(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
              />
            </div>
            {useManual && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={manualWaitMin}
                    onChange={(e) => setManualWaitMin(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-amber-500/50 rounded-xl px-4 py-2.5 text-amber-300 font-mono focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-sm text-slate-300 font-medium">분</span>
                </div>
                <p className="text-[11px] text-amber-400/80 mt-1">활성화 시 팀 수와 무관하게 이 시간이 차량 앱에 전달됩니다.</p>
              </div>
            )}
          </div>

          {/* 버튼 */}
          <div className="pt-4 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              설정 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
