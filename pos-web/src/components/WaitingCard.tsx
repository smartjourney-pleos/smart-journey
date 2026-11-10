import React from 'react';
import { Car, Users, User, Bell, CheckCircle2, UserX } from 'lucide-react';
import type { WaitingItem } from '../types/pos';

interface WaitingCardProps {
  item: WaitingItem;
  onCall: (id: string) => void;
  onSeat: (id: string) => void;
  onNoShow: (id: string) => void;
}

export const WaitingCard: React.FC<WaitingCardProps> = ({
  item,
  onCall,
  onSeat,
  onNoShow,
}) => {
  const isVehicle = item.channel === 'VEHICLE';

  // 상태 배지 렌더링
  const renderStatusBadge = () => {
    if (item.status === 'CALLED') {
      return (
        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs px-2.5 py-1 rounded-md font-bold animate-pulse flex items-center gap-1">
          <Bell className="w-3.5 h-3.5" /> 호출됨
        </span>
      );
    }

    if (item.status === 'ARRIVED') {
      return (
        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-2.5 py-1 rounded-md font-bold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> 현장 도착
        </span>
      );
    }

    return (
      <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs px-2.5 py-1 rounded-md font-semibold">
        이동 중
      </span>
    );
  };

  // 하차 결과 배지 (명세서 7절 규약)
  const renderArrivalBadge = () => {
    if (!item.arrivalResult) return null;

    if (item.arrivalResult === 'CONFIRMED') {
      return (
        <div className="flex items-center gap-1.5 bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-md text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{item.alighted ?? item.partySize}/{item.partySize}명 하차 완료</span>
        </div>
      );
    }

    if (item.arrivalResult === 'MANUAL') {
      return (
        <div className="flex items-center gap-1.5 bg-slate-800 text-slate-300 border border-slate-600 px-2.5 py-1 rounded-md text-xs font-semibold">
          <span>고객 직접 확인 필요</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5 bg-amber-950/80 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-md text-xs font-semibold">
        <span>인원 미확인</span>
      </div>
    );
  };

  return (
    <div
      className={`relative rounded-2xl p-5 border transition-all duration-200 shadow-md ${
        item.status === 'CALLED'
          ? 'bg-slate-800/90 border-amber-500/60 ring-2 ring-amber-500/30'
          : item.status === 'ARRIVED'
          ? 'bg-slate-800/80 border-emerald-500/40'
          : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
      }`}
    >
      {/* 상단: 순번, 채널 및 상태 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-700 flex flex-col items-center justify-center font-bold">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">No.</span>
            <span className="text-xl text-white font-mono leading-none">{item.ticketNo}</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              {isVehicle ? (
                <span className="inline-flex items-center gap-1 bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 text-xs px-2 py-0.5 rounded font-semibold">
                  <Car className="w-3.5 h-3.5 text-cyan-400" /> 차량 인증
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-slate-700/80 text-slate-300 text-xs px-2 py-0.5 rounded font-semibold">
                  <User className="w-3.5 h-3.5" /> 일반 현장
                </span>
              )}
              {renderStatusBadge()}
            </div>
            <p className="text-xs text-slate-400 mt-1">접수 시각 {item.registeredAt}</p>
          </div>
        </div>

        {/* 대기 순서 */}
        <div className="text-right">
          <span className="text-xs text-slate-400">대기 순서</span>
          <p className="text-lg font-bold text-slate-200">
            {item.position === 1 ? '다음 입장' : `${item.position}번째`}
          </p>
        </div>
      </div>

      {/* 중단: 탑승 인원 및 예상 도착 시간 */}
      <div className="grid grid-cols-2 gap-2.5 py-3 px-3.5 bg-slate-900/50 rounded-xl border border-slate-700/40 mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          <span className="text-xs text-slate-400">인원:</span>
          <span className="text-sm font-bold text-white">{item.partySize}명</span>
        </div>
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-slate-400">남은 시간:</span>
          <span className="text-sm font-bold text-white font-mono">
            {item.etaMin <= 0 ? '도착 완료' : `약 ${item.etaMin}분`}
          </span>
        </div>
      </div>

      {/* 하차 결과 배지 (차량 앱 연동 시) */}
      {isVehicle && item.arrivalResult && (
        <div className="mb-4">{renderArrivalBadge()}</div>
      )}

      {/* 하단: 액션 버튼 */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onCall(item.id)}
          className={`py-2 px-3 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1 ${
            item.status === 'CALLED'
              ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          {item.status === 'CALLED' ? '재호출' : '호출'}
        </button>

        <button
          onClick={() => onSeat(item.id)}
          className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          착석
        </button>

        <button
          onClick={() => onNoShow(item.id)}
          className="py-2 px-3 bg-slate-700 hover:bg-rose-900/70 hover:text-rose-200 text-slate-300 rounded-xl font-medium text-xs transition cursor-pointer flex items-center justify-center gap-1"
        >
          <UserX className="w-3.5 h-3.5" />
          노쇼
        </button>
      </div>
    </div>
  );
};
