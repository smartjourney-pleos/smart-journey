import React, { useState } from 'react';
import { X } from 'lucide-react';
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
    'w-full bg-surface border border-line rounded-md px-4 py-2.5 text-ink tabular-nums focus:outline-none focus:border-main';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
      <div className="bg-surface rounded-lg w-full max-w-md overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-line flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">매장 대기 시간 설정</h2>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="text-ink-2 p-2 rounded-md touch-hover-sunken touch-hover-ink transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              팀당 평균 식사·대기 시간 (분)
            </label>
            <input
              type="number"
              min={1}
              max={60}
              value={minutesPerTeam}
              onChange={(e) => setMinutesPerTeam(Number(e.target.value))}
              className={field}
            />
            <p className="text-xs text-ink-2 mt-1">기본값: 5분. (앞선 대기 팀 수 × 이 값으로 대기시간 계산)</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              차량 도착 여유 시간 (분)
            </label>
            <input
              type="number"
              min={0}
              max={30}
              value={arrivalBufferMin}
              onChange={(e) => setArrivalBufferMin(Number(e.target.value))}
              className={field}
            />
            <p className="text-xs text-ink-2 mt-1">기본값: 10분. 주차 및 이동 시간을 감안한 골든타임 버퍼</p>
          </div>

          <div className="pt-4 border-t border-line">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-ink">점주 수동 대기시간 덮어쓰기</label>
              <input
                type="checkbox"
                checked={useManual}
                onChange={(e) => setUseManual(e.target.checked)}
                className="w-5 h-5 accent-main"
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
                    className={field}
                  />
                  <span className="text-sm text-ink font-medium">분</span>
                </div>
                <p className="text-xs text-ink-2 mt-1">활성화 시 팀 수와 무관하게 이 시간이 차량 앱에 전달됩니다.</p>
              </div>
            )}
          </div>

          <div className="pt-4 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] px-5 bg-sunken touch-hover-line text-ink rounded-md text-sm font-semibold transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="min-h-[48px] px-5 bg-main touch-hover-main text-white rounded-md text-sm font-bold transition-colors cursor-pointer"
            >
              설정 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
