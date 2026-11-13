import React, { useEffect, useState } from 'react';
import { DEMO_STORES, posApi, type PosStoreOption } from '../api/posApi';
import { Radio, Delete, RotateCcw, ShieldCheck, Store, KeyRound, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (storeId: string, pin: string) => Promise<void>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [stores, setStores] = useState<PosStoreOption[]>(DEMO_STORES);
  const [storeId, setStoreId] = useState<string>(String(DEMO_STORES[0].storeId));
  const [pin, setPin] = useState<string>('1234');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    posApi.getStores().then(setStores);
  }, []);

  const handleKeypadPress = (digit: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  const handleQuickDemo = () => {
    setPin('1234');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length >= 4) {
      setError(null);
      onLogin(storeId, pin).catch((err: Error) => setError(err.message));
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-ground flex items-center justify-center p-6 select-none touch-manipulation">
      <div className="w-full max-w-lg bg-surface border border-line rounded-2xl p-8 shadow-pleos-2">
        {/* Pleos Connect Mobility Branding */}
        <div className="flex items-center justify-between mb-6 pb-5 border-b border-line">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-main-tint text-main text-xs font-extrabold tracking-wider border border-main/20">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              PLEOS CONNECT
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sunken text-ink-2">
              Tablet POS v2.0
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-pleos-active">
            <ShieldCheck className="w-3.5 h-3.5" /> 차량 연동 보안 인증
          </span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">Smart Journey POS</h1>
          <p className="text-sm text-ink-2 mt-1">
            현대자동차 Pleos Connect 차량 원격 웨이팅 매장 관리 시스템
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Store Selection Field */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-ink uppercase tracking-wider mb-2">
              <Store className="w-4 h-4 text-main" /> 매장 선택
            </label>
            <div className="relative">
              <select
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                className="w-full min-h-[48px] h-12 bg-sunken/40 border border-line rounded-xl px-4 py-2.5 text-ink text-sm font-semibold appearance-none focus:outline-none focus:border-main focus:ring-2 focus:ring-main/20 transition-all cursor-pointer"
              >
                {stores.map((s) => (
                  <option key={s.storeId} value={String(s.storeId)}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PIN Input & Visual Dots Display */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-ink uppercase tracking-wider">
                <KeyRound className="w-4 h-4 text-main" /> 매장 관리자 PIN (4자리)
              </label>
              <button
                type="button"
                onClick={handleQuickDemo}
                className="text-xs font-semibold text-main hover:text-main-strong flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" /> 시연용 PIN 1234 입력
              </button>
            </div>

            {/* Visual PIN Dots Indicator */}
            <div className="bg-sunken/50 border border-line rounded-xl p-4 flex flex-col items-center justify-center gap-3">
              <div className="flex items-center gap-4">
                {[0, 1, 2, 3].map((index) => {
                  const filled = pin.length > index;
                  return (
                    <div
                      key={index}
                      className={`w-4 h-4 rounded-full transition-all duration-150 ${
                        filled
                          ? 'bg-main scale-110 shadow-[0_0_8px_rgba(0,100,255,0.5)]'
                          : 'bg-line border border-ink-2/30'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Accessible input for keyboard typing / testing */}
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="PIN 4자리 입력 (기본: 1234)"
                className="w-full text-center text-sm font-semibold tracking-widest bg-transparent border-0 text-ink-2 focus:outline-none focus:text-ink tabular-nums"
                aria-label="매장 관리자 PIN 입력"
              />
            </div>
          </div>

          {/* Pleos On-Screen Numeric Keypad (Design Guide p56-57) */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeypadPress(digit)}
                className="min-h-[52px] h-[52px] rounded-xl bg-surface border border-line text-ink font-bold text-lg flex items-center justify-center cursor-pointer select-none touch-manipulation touch-hover-sunken active-press transition-colors shadow-sm"
              >
                {digit}
              </button>
            ))}

            <button
              type="button"
              onClick={handleClear}
              aria-label="전체 지우기"
              className="min-h-[52px] h-[52px] rounded-xl bg-sunken text-ink-2 font-medium text-xs flex flex-col items-center justify-center cursor-pointer select-none touch-manipulation touch-hover-line active-press transition-colors"
            >
              <RotateCcw className="w-4 h-4 mb-0.5" />
              초기화
            </button>

            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              className="min-h-[52px] h-[52px] rounded-xl bg-surface border border-line text-ink font-bold text-lg flex items-center justify-center cursor-pointer select-none touch-manipulation touch-hover-sunken active-press transition-colors shadow-sm"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleBackspace}
              aria-label="한 글자 지우기"
              className="min-h-[52px] h-[52px] rounded-xl bg-sunken text-ink-2 font-medium text-xs flex flex-col items-center justify-center cursor-pointer select-none touch-manipulation touch-hover-line active-press transition-colors"
            >
              <Delete className="w-4 h-4 mb-0.5" />
              지우기
            </button>
          </div>

          <p className="text-xs text-ink-2 text-center">시연용 테스트 PIN: 1234</p>
          {error && <p className="text-xs text-danger-strong text-center">{error}</p>}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={pin.length < 4}
            className={`w-full min-h-[48px] h-12 py-3 px-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all cursor-pointer select-none touch-manipulation active-press ${
              pin.length >= 4
                ? 'bg-main text-white touch-hover-main active:bg-main-strong shadow-md shadow-main/20'
                : 'bg-sunken text-ink-2 cursor-not-allowed border border-line'
            }`}
          >
            <span>POS 시스템 접속</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
