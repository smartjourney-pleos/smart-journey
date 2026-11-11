import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: (storeId: string, pin: string) => void;
}

const field =
  'w-full bg-surface border border-line rounded-md px-4 py-3 text-ink text-base focus:outline-none focus:border-main';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [storeId, setStoreId] = useState<string>('store-01');
  const [pin, setPin] = useState<string>('1234');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length >= 4) {
      onLogin(storeId, pin);
    }
  };

  return (
    <div className="min-h-screen bg-ground flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface border border-line rounded-lg p-8">
        <h1 className="text-2xl font-bold text-ink">Smart Journey POS</h1>
        <p className="text-sm text-ink-2 mt-1 mb-8">현대자동차 Pleos Connect 차량 원격 웨이팅 매장 관리 시스템</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">매장 선택</label>
            <select value={storeId} onChange={(e) => setStoreId(e.target.value)} className={field}>
              <option value="store-01">하늘본가 숯불갈비 시흥본점 (store-01)</option>
              <option value="store-02">배곧 바다향 칼국수 (store-02)</option>
              <option value="store-03">강남 프리미엄 다이닝 (store-03)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-2">매장 관리자 PIN (4자리)</label>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN 4자리 입력 (기본: 1234)"
              className={`${field} text-center tracking-widest text-lg tabular-nums`}
            />
            <p className="text-xs text-ink-2 mt-1.5">시연용 테스트 PIN: 1234</p>
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] mt-2 py-3 px-4 bg-main touch-hover-main active:bg-main-strong text-white rounded-md font-bold text-base transition-colors cursor-pointer"
          >
            POS 시스템 접속
          </button>
        </form>
      </div>
    </div>
  );
};
