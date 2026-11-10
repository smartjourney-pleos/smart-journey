import React, { useState } from 'react';
import { Store, KeyRound, ArrowRight } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (storeId: string, pin: string) => void;
}

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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Smart Journey POS</h1>
          <p className="text-xs text-slate-400 mt-1">현대자동차 Pleos Connect 차량 원격 웨이팅 매장 관리 시스템</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">매장 선택</label>
            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="store-01">하늘본가 숯불갈비 시흥본점 (store-01)</option>
              <option value="store-02">배곧 바다향 칼국수 (store-02)</option>
              <option value="store-03">강남 프리미엄 다이닝 (store-03)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">매장 관리자 PIN (4자리)</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="PIN 4자리 입력 (기본: 1234)"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white font-mono text-center tracking-widest text-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 text-center">시연용 테스트 PIN: 1234</p>
          </div>

          <button
            type="submit"
            className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            <span>POS 시스템 접속</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
