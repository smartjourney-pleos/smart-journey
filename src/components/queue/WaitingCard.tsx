import React from 'react';
import { motion } from 'motion/react';
import { Car, User, Bell, CheckCircle2, UserX } from 'lucide-react';
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

  const badge = 'inline-flex items-center gap-1 text-xs px-2 py-1 rounded-sm font-semibold';

  const renderStatusBadge = () => {
    if (item.status === 'CALLED') {
      return (
        <span className={`${badge} bg-sub-tint text-ink`}>
          <Bell className="w-3.5 h-3.5" /> 호출됨
        </span>
      );
    }

    if (item.status === 'ARRIVED') {
      return (
        <span className={`${badge} bg-main-tint text-main`}>
          <CheckCircle2 className="w-3.5 h-3.5" /> 현장 도착
        </span>
      );
    }

    return <span className={`${badge} bg-sunken text-ink-2`}>이동 중</span>;
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
        <div className={`${badge} bg-main-tint text-main`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>
            {count}/{total}명 하차 완료
          </span>
        </div>
      );
    }

    if (isManual) {
      return <div className={`${badge} bg-sunken text-ink-2`}>고객 직접 확인 필요</div>;
    }

    if (isUnconfirmed) {
      return <div className={`${badge} bg-sub-tint text-ink`}>인원 미확인</div>;
    }

    return null;
  };

  const stripe =
    item.status === 'CALLED' ? 'bg-sub' : item.status === 'ARRIVED' ? 'bg-main' : 'bg-line';

  // 다음에 누를 버튼 하나만 채우고, 나머지는 윤곽선으로 눌러 둔다
  const isCalled = item.status === 'CALLED';
  const primary = 'bg-main touch-hover-main active:bg-main-strong text-white';
  const secondary = 'bg-surface border border-line text-ink touch-hover-sunken';

  const action =
    'min-h-[48px] h-12 px-3 rounded-md font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer select-none touch-manipulation transition-colors duration-150 ease-out active-press';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
      onClick={() => onSelect?.(item.id)}
      className={`
        relative overflow-hidden bg-surface rounded-lg p-5 pl-6 border cursor-pointer select-none touch-manipulation
        transition-colors duration-150 ease-out active-press
        ${isSelected ? 'border-main ring-2 ring-main' : 'border-line touch-hover-line'}
      `}
    >
      <span className={`absolute left-0 inset-y-0 w-1.5 ${stripe}`} aria-hidden="true" />

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1 shrink-0">
            <span className="text-sm text-ink-2">No.</span>
            <span className="text-3xl font-bold text-ink leading-none tabular-nums">
              {item.ticketNo}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {isVehicle ? (
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-main">
                  <Car className="w-4 h-4" /> 차량 인증
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink-2">
                  <User className="w-4 h-4" /> 일반 현장
                </span>
              )}
              {renderStatusBadge()}
            </div>
            <p className="text-xs text-ink-2 mt-1 tabular-nums">
              접수 시각 {item.registeredAt}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs text-ink-2">대기 순서</span>
          <p className="text-lg font-bold text-ink">
            {item.position === 1 ? '다음 입장' : `${item.position}번째`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 py-3 border-y border-line mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-ink-2">인원:</span>
          <span className="text-base font-bold text-ink tabular-nums">{item.partySize}명</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-ink-2">남은 시간:</span>
          <span className="text-base font-bold text-ink tabular-nums">
            {item.etaMin <= 0 ? '도착 완료' : `약 ${item.etaMin}분`}
          </span>
        </div>
      </div>

      {(item.customerName || item.phone || (isVehicle && item.vehicleModel)) && (
        <div className="mb-3 text-sm text-ink-2 flex flex-wrap items-center gap-x-3 gap-y-0.5">
          {item.customerName && <span className="text-ink font-medium">{item.customerName}</span>}
          {item.phone && <span className="tabular-nums">{item.phone}</span>}
          {isVehicle && item.vehicleModel && (
            <span>
              {item.vehicleModel} {item.vehicleNumber ? `· ${item.vehicleNumber}` : ''}
            </span>
          )}
        </div>
      )}

      {isVehicle && (item.arrivalResult || item.alighting) && (
        <div className="mb-4">{renderArrivalBadge()}</div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCall(item.id);
          }}
          className={`${action} ${isCalled ? secondary : primary}`}
        >
          <Bell className="w-4 h-4 shrink-0" />
          <span>{isCalled ? '재호출' : '호출'}</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSeat(item.id);
          }}
          className={`${action} ${isCalled ? primary : secondary}`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>착석</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNoShow(item.id);
          }}
          className={`${action} bg-sunken touch-hover-danger text-ink-2 font-medium`}
        >
          <UserX className="w-4 h-4 shrink-0" />
          <span>노쇼</span>
        </button>
      </div>
    </motion.div>
  );
};

export default WaitingCard;
