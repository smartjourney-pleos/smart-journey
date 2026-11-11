import React, { useState } from 'react';
import { X, Clock, Navigation, Sliders, ShieldCheck } from 'lucide-react';
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

  const field =
    'w-full bg-sunken/40 border border-line rounded-xl px-4 py-3 text-ink font-semibold tabular-nums focus:outline-none focus:border-main focus:ring-2 focus:ring-main/20 text-base transition-all';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 select-none touch-manipulation"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-surface rounded-2xl w-full max-w-lg overflow-hidden shadow-pleos-3 border border-line"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pleos Popup Header */}
        <div className="px-6 py-4 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-main-tint flex items-center justify-center text-main">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">매장 대기 시간 설정</h2>
              <p className="text-xs text-ink-2">Pleos Connect 차량 내비 골든타임 연동 정책</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="w-12 h-12 min-h-[48px] min-w-[48px] -mr-2 rounded-xl flex items-center justify-center text-ink-2 touch-hover-sunken touch-hover-ink active-press cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Minutes Per Team */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-ink uppercase tracking-wider mb-2">
              <Clock className="w-4 h-4 text-main" /> 팀당 평균 식사·대기 시간 (분)
            </label>
            <input
              type="number"
              min={1}
              max={60}
              value={minutesPerTeam}
              onChange={(e) => setMinutesPerTeam(Number(e.target.value))}
              className={field}
            />
            <p className="text-xs text-ink-2 mt-1.5 leading-relaxed">
              기본값: 5분. (앞선 대기 팀 수 × 이 값으로 대기시간 계산)
            </p>
          </div>

          {/* Arrival Buffer */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-ink uppercase tracking-wider mb-2">
              <Navigation className="w-4 h-4 text-main" /> 차량 도착 여유 시간 (분)
            </label>
            <input
              type="number"
              min={0}
              max={30}
              value={arrivalBufferMin}
              onChange={(e) => setArrivalBufferMin(Number(e.target.value))}
              className={field}
            />
            <p className="text-xs text-ink-2 mt-1.5 leading-relaxed">
              기본값: 10분. 주차 및 이동 시간을 감안한 골든타임 버퍼
            </p>
          </div>

          {/* Manual Wait Time Override Toggle */}
          <div className="pt-4 border-t border-line">
            <div className="bg-sunken/40 rounded-xl p-4 border border-line">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-ink block">점주 수동 대기시간 덮어쓰기</span>
                  <span className="text-xs text-ink-2">팀 수와 무관하게 고정 시간 차량 앱 전달</span>
                </div>
                <input
                  type="checkbox"
                  checked={useManual}
                  onChange={(e) => setUseManual(e.target.checked)}
                  className="w-5 h-5 accent-main cursor-pointer"
                />
              </div>

              {useManual && (
                <div className="mt-3 pt-3 border-t border-line/60">
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={manualWaitMin}
                      onChange={(e) => setManualWaitMin(Number(e.target.value))}
                      className={field}
                    />
                    <span className="text-sm text-ink font-bold shrink-0">분</span>
                  </div>
                  <p className="text-xs text-ink-2 mt-1.5">
                    활성화 시 팀 수와 무관하게 이 시간이 차량 앱에 전달됩니다.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Dialog Action Buttons */}
          <div className="pt-3 border-t border-line flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] h-12 px-5 bg-sunken touch-hover-line text-ink rounded-xl text-sm font-semibold flex items-center justify-center cursor-pointer select-none touch-manipulation transition-colors active-press"
            >
              취소
            </button>
            <button
              type="submit"
              className="min-h-[48px] h-12 px-6 bg-main touch-hover-main text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer select-none touch-manipulation transition-colors active-press shadow-md shadow-main/20"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>설정 저장</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
