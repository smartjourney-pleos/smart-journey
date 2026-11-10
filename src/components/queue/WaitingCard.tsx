import React from 'react';
import { motion } from 'motion/react';
import { Car, Users, User, Bell, CheckCircle2, UserX } from 'lucide-react';
import type { WaitingItem } from '../../types/pos';

export interface WaitingCardProps {
  item: WaitingItem;
  onCall: (id: string) => void;
  onSeat: (id: string) => void;
  onNoShow: (id: string) => void;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
}

export const WaitingCard: React.FC<WaitingCardProps> = ({
  item,
  onCall,
  onSeat,
  onNoShow,
  onSelect,
  isSelected = false,
}) => {
  const isVehicle = item.channel === 'VEHICLE';

  // 상태 배지 렌더링
  const renderStatusBadge = () => {
    if (item.status === 'CALLED') {
      return (
        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs px-2.5 py-1 rounded-md font-bold animate-pulse flex items-center gap-1 transition-all duration-160 ease-out">
          <Bell className="w-3.5 h-3.5" /> 호출됨
        </span>
      );
    }

    if (item.status === 'ARRIVED') {
      return (
        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-2.5 py-1 rounded-md font-bold flex items-center gap-1 transition-all duration-160 ease-out">
          <CheckCircle2 className="w-3.5 h-3.5" /> 현장 도착
        </span>
      );
    }

    return (
      <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs px-2.5 py-1 rounded-md font-semibold transition-all duration-160 ease-out">
        이동 중
      </span>
    );
  };

  // 하차 결과 배지 (명세서 7절 규약)
  const renderArrivalBadge = () => {
    const isConfirmed =
      item.arrivalResult === 'CONFIRMED' ||
      item.alighting?.status === 'CONFIRMED';
    const isManual = item.arrivalResult === 'MANUAL';
    const isUnconfirmed =
      item.arrivalResult === 'UNCONFIRMED' ||
      item.alighting?.status === 'PARTIAL';

    if (isConfirmed) {
      const count = item.alighted ?? item.alighting?.alightedCount ?? item.partySize;
      const total = item.alighting?.totalPassengers ?? item.partySize;
      return (
        <div className="flex items-center gap-1.5 bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-md text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>
            {count}/{total}명 하차 완료
          </span>
        </div>
      );
    }

    if (isManual) {
      return (
        <div className="flex items-center gap-1.5 bg-slate-800 text-slate-300 border border-slate-600 px-2.5 py-1 rounded-md text-xs font-semibold">
          <span>고객 직접 확인 필요</span>
        </div>
      );
    }

    if (isUnconfirmed) {
      return (
        <div className="flex items-center gap-1.5 bg-amber-950/80 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-md text-xs font-semibold">
          <span>인원 미확인</span>
        </div>
      );
    }

    return null;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
      onClick={() => onSelect?.(item.id)}
      className={`
        relative rounded-2xl p-5 border shadow-md cursor-pointer select-none touch-manipulation
        transition-all duration-160 ease-out active-press
        ${
          isSelected
            ? 'bg-slate-800/95 border-cyan-500/80 ring-2 ring-cyan-500/40 -translate-y-0.5 shadow-lg shadow-cyan-950/40'
            : item.status === 'CALLED'
            ? 'bg-slate-800/90 border-amber-500/60 ring-2 ring-amber-500/30'
            : item.status === 'ARRIVED'
            ? 'bg-slate-800/80 border-emerald-500/40'
            : 'bg-slate-800/60 border-slate-700/80 touch-hover-border-slate-600'
        }
      `}
    >
      {/* 상단: 순번, 채널 및 상태 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-700 flex flex-col items-center justify-center font-bold shrink-0">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">No.</span>
            <span className="text-xl text-white font-mono leading-none tabular-nums font-bold">
              {item.ticketNo}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {isVehicle ? (
                <span className="inline-flex items-center gap-1 bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 text-xs px-2 py-0.5 rounded font-semibold">
                  <Car className="w-3.5 h-3.5 text-cyan-400" /> 차량 인증
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-slate-700/80 text-slate-300 border border-slate-600/30 text-xs px-2 py-0.5 rounded font-semibold">
                  <User className="w-3.5 h-3.5" /> 일반 현장
                </span>
              )}
              {renderStatusBadge()}
            </div>
            <p className="text-xs text-slate-400 mt-1 tabular-nums font-mono">
              접수 시각 {item.registeredAt}
            </p>
          </div>
        </div>

        {/* 대기 순서 */}
        <div className="text-right shrink-0">
          <span className="text-xs text-slate-400">대기 순서</span>
          <p className="text-lg font-bold text-slate-200">
            {item.position === 1 ? '다음 입장' : `${item.position}번째`}
          </p>
        </div>
      </div>

      {/* 중단: 탑승 인원 및 예상 도착 시간 */}
      <div className="grid grid-cols-2 gap-2.5 py-3 px-3.5 bg-slate-900/50 rounded-xl border border-slate-700/40 mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-xs text-slate-400">인원:</span>
          <span className="text-sm font-bold text-white tabular-nums font-mono">{item.partySize}명</span>
        </div>
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs text-slate-400">남은 시간:</span>
          <span className="text-sm font-bold text-white font-mono tabular-nums">
            {item.etaMin <= 0 ? '도착 완료' : `약 ${item.etaMin}분`}
          </span>
        </div>
      </div>

      {/* 고객 및 차량 메타데이터 (있을 경우 표시) */}
      {(item.customerName || item.phone || (isVehicle && item.vehicleModel)) && (
        <div className="mb-3 px-1 text-xs text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {item.customerName && <span className="text-slate-300 font-medium">{item.customerName}</span>}
          {item.phone && <span className="text-slate-500 font-mono">{item.phone}</span>}
          {isVehicle && item.vehicleModel && (
            <span className="text-cyan-400/90 font-medium">
              {item.vehicleModel} {item.vehicleNumber ? `· ${item.vehicleNumber}` : ''}
            </span>
          )}
        </div>
      )}

      {/* 하차 결과 배지 (차량 앱 연동 시) */}
      {isVehicle && (item.arrivalResult || item.alighting) && (
        <div className="mb-4">{renderArrivalBadge()}</div>
      )}

      {/* 하단: 액션 버튼 (에밀 코발스키 .active-press & 최소 48px 터치 타깃) */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCall(item.id);
          }}
          className={`min-h-[48px] h-12 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer select-none touch-manipulation transition-all duration-120 ease-out active-press ${
            item.status === 'CALLED'
              ? 'bg-amber-500 text-slate-950 touch-hover-amber-400'
              : 'bg-indigo-600 touch-hover-indigo-500 text-white'
          }`}
        >
          <Bell className="w-3.5 h-3.5 shrink-0" />
          <span>{item.status === 'CALLED' ? '재호출' : '호출'}</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSeat(item.id);
          }}
          className="min-h-[48px] h-12 px-3 bg-emerald-600 touch-hover-emerald-500 active:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer select-none touch-manipulation transition-all duration-120 ease-out active-press"
        >
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>착석</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNoShow(item.id);
          }}
          className="min-h-[48px] h-12 px-3 bg-slate-700 touch-hover-rose-900-70 touch-hover-text-rose-200 text-slate-300 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer select-none touch-manipulation transition-all duration-120 ease-out active-press"
        >
          <UserX className="w-3.5 h-3.5 shrink-0" />
          <span>노쇼</span>
        </button>
      </div>
    </motion.div>
  );
};

export default WaitingCard;
