import React from 'react';
import { motion } from 'motion/react';
import {
  X,
  Car,
  Phone,
  Clock,
  MapPin,
  CheckCircle2,
  Bell,
  UserX,
  User,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import type {
  WaitingTeam,
  WaitingItem,
  TimelineEvent,
  QueueStatus,
  AlightingStatus,
  AlightingTelemetry,
} from '../../types/pos';

export interface TeamDetailDrawerProps {
  selectedTeam: WaitingTeam | WaitingItem | null;
  onClose: () => void;
  onCall: (id: string) => void;
  onSeat: (id: string) => void;
  onNoShow: (id: string) => void;
  className?: string;
}

// 헬퍼: 전화번호 마스킹 (010-****-1234). 번호가 없으면 빈 문자열
function maskPhone(phone?: string): string {
  if (!phone) return '';
  if (phone.includes('*')) return phone;
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 11) {
    return `${clean.slice(0, 3)}-****-${clean.slice(7)}`;
  }
  if (clean.length === 10) {
    return `${clean.slice(0, 3)}-***-${clean.slice(6)}`;
  }
  return phone;
}

// 헬퍼: 고객명이 없으면 지어내지 않고 미등록으로 표시
function getCustomerName(name?: string): string {
  return name || '이름 미등록';
}

export const TeamDetailDrawer: React.FC<TeamDetailDrawerProps> = ({
  selectedTeam,
  onClose,
  onCall,
  onSeat,
  onNoShow,
  className = '',
}) => {
  if (!selectedTeam) return null;

  // 데이터 정규화 (WaitingTeam & WaitingItem 상호 호환)
  const isVehicle = selectedTeam.channel === 'VEHICLE';
  const ticketNo =
    'ticketNumber' in selectedTeam
      ? selectedTeam.ticketNumber
      : selectedTeam.ticketNo;
  const etaMin =
    'etaMinutes' in selectedTeam
      ? selectedTeam.etaMinutes
      : selectedTeam.etaMin;
  const customerName = getCustomerName(selectedTeam.customerName);
  const phone = maskPhone(selectedTeam.phone);
  const partySize = selectedTeam.partySize;
  const status: QueueStatus = selectedTeam.status;
  const position = 'position' in selectedTeam ? selectedTeam.position : 1;

  // 차량 및 텔레메트리 정보
  const vehicleLabel = [selectedTeam.vehicleModel, selectedTeam.vehicleNumber]
    .filter(Boolean)
    .join(' · ');
  const distance =
    'distanceMeters' in selectedTeam &&
    typeof selectedTeam.distanceMeters === 'number'
      ? `${(selectedTeam.distanceMeters / 1000).toFixed(1)} km`
      : '-';

  // 하차 텔레메트리 정규화
  const rawArrivalResult =
    'arrivalResult' in selectedTeam ? selectedTeam.arrivalResult : undefined;
  const rawAlighted =
    'alighted' in selectedTeam ? selectedTeam.alighted : undefined;

  const isConfirmed =
    rawArrivalResult === 'CONFIRMED' ||
    selectedTeam.alighting?.status === 'CONFIRMED';
  const isUnconfirmed =
    rawArrivalResult === 'UNCONFIRMED' ||
    selectedTeam.alighting?.status === 'PARTIAL';
  const isManual = rawArrivalResult === 'MANUAL';

  const computedStatus: AlightingStatus = isConfirmed
    ? 'CONFIRMED'
    : isUnconfirmed
    ? 'PARTIAL'
    : 'NONE';

  const count =
    rawAlighted ??
    selectedTeam.alighting?.alightedCount ??
    (isConfirmed ? selectedTeam.partySize : 0);

  const alighting: AlightingTelemetry = selectedTeam.alighting || {
    status: computedStatus,
    alightedCount: count,
    totalPassengers: selectedTeam.partySize,
  };

  // 진행 감사 이력 (Audit Timeline) 정규화
  let timeline: TimelineEvent[];
  if (selectedTeam.timeline && selectedTeam.timeline.length > 0) {
    timeline = selectedTeam.timeline;
  } else {
    // 기록된 시각만 쓴다. 시각을 모르는 단계는 시각 없이 표시
    const events: TimelineEvent[] = [];
    const regTime = selectedTeam.registeredAt || '';

    events.push({
      id: 'evt-reg',
      timestamp: regTime,
      title: isVehicle ? '원격 웨이팅 접수' : '현장 태블릿 접수',
      description: isVehicle
        ? 'Pleos Connect 차량 내비에서 골든타임 자동 감지 및 승인 완료'
        : '매장 입구 현장 태블릿에서 대기 등록 완료',
      type: 'INFO',
    });

    if (status === 'ARRIVED' || status === 'CALLED' || status === 'SEATED') {
      events.push({
        id: 'evt-arr',
        timestamp: '',
        title: '차량 현장 도착 감지',
        description: '매장 주차 구역 진입 확인 (정차 및 P단 전환 감지)',
        type: 'SUCCESS',
      });

      if (isVehicle) {
        events.push({
          id: 'evt-alight',
          timestamp: '',
          title: '승차 인원 하차 센서 확인',
          description: `좌석 및 도어 센서 감지: ${alighting.alightedCount}/${alighting.totalPassengers}명 하차 완료`,
          type: alighting.status === 'CONFIRMED' ? 'SUCCESS' : 'WARNING',
        });
      }
    }

    if (status === 'CALLED' || status === 'SEATED') {
      events.push({
        id: 'evt-call',
        timestamp: selectedTeam.calledAt || '',
        title: '매장 점주 고객 호출',
        description: '입장 안내 카카오 알림톡 및 차량 디스플레이 호출 카드 전송',
        type: 'INFO',
      });
    }

    if (status === 'SEATED') {
      events.push({
        id: 'evt-seat',
        timestamp: selectedTeam.seatedAt || '',
        title: '테이블 착석 완료',
        description: '매장 입장 확인 및 지정 테이블 안내 완료',
        type: 'SUCCESS',
      });
    }

    timeline = events;
  }

  const badge = 'inline-flex items-center gap-1 text-xs px-2 py-1 rounded-sm font-semibold';

  const renderStatusBadge = () => {
    if (status === 'CALLED') {
      return (
        <span className={`${badge} bg-sub-tint text-ink`}>
          <Bell className="w-3.5 h-3.5" /> 호출됨
        </span>
      );
    }
    if (status === 'ARRIVED') {
      return (
        <span className={`${badge} bg-main-tint text-main`}>
          <CheckCircle2 className="w-3.5 h-3.5" /> 현장 도착
        </span>
      );
    }
    if (status === 'SEATED') {
      return (
        <span className={`${badge} bg-main-tint text-main`}>
          <CheckCircle2 className="w-3.5 h-3.5" /> 착석 완료
        </span>
      );
    }
    if (status === 'NO_SHOW') {
      return (
        <span className={`${badge} bg-danger-tint text-danger`}>
          <UserX className="w-3.5 h-3.5" /> 노쇼
        </span>
      );
    }
    return <span className={`${badge} bg-sunken text-ink-2`}>이동 중</span>;
  };

  const markerTone = (type: TimelineEvent['type']) =>
    type === 'SUCCESS'
      ? { ring: 'border-main', dot: 'bg-main' }
      : type === 'WARNING'
      ? { ring: 'border-sub', dot: 'bg-sub' }
      : type === 'ALERT'
      ? { ring: 'border-danger', dot: 'bg-danger' }
      : { ring: 'border-ink-2', dot: 'bg-ink-2' };

  const isCalled = status === 'CALLED';
  const primary = 'bg-main touch-hover-main active:bg-main-strong text-white';
  const secondary = 'bg-surface border border-line text-ink touch-hover-sunken';

  const action =
    'min-h-[48px] h-12 px-3 rounded-md font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer select-none touch-manipulation transition-colors duration-150 ease-out active-press';

  return (
    <motion.aside
      initial={{ x: '100%', opacity: 0.8 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30, mass: 0.8 }}
      className={`w-[360px] w-full shrink-0 h-full flex flex-col bg-surface overflow-hidden select-none border-l border-line z-20 ${className}`}
    >
      <div className="h-16 px-5 border-b border-line flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-bold text-ink">대기 상세 정보</h2>
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

        <button
          type="button"
          onClick={onClose}
          aria-label="상세 닫기"
          className="w-12 h-12 min-h-[48px] min-w-[48px] rounded-md flex items-center justify-center text-ink-2 touch-hover-sunken touch-hover-ink active-press cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        <section>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-1 shrink-0">
                <span className="text-sm text-ink-2">No.</span>
                <span className="text-4xl text-ink leading-none tabular-nums font-bold">
                  {ticketNo}
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-ink">{customerName}</h3>
                {phone && (
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-ink-2 tabular-nums">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-ink-2 block">대기 순서</span>
              <span className="text-sm font-bold text-ink">
                {position === 1 ? '다음 입장' : `${position}번째`}
              </span>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-line text-sm">
            <div className="flex items-baseline gap-2">
              <dt className="text-ink-2">탑승 인원:</dt>
              <dd className="font-bold text-ink tabular-nums">{partySize}명</dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="text-ink-2">접수 시각:</dt>
              <dd className="font-bold text-ink tabular-nums">{selectedTeam.registeredAt}</dd>
            </div>
          </dl>
        </section>

        {isVehicle ? (
          <section className="pt-5 border-t border-line space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-ink">차량 및 주행 텔레메트리</h4>
              {vehicleLabel && <span className="text-xs text-ink-2">{vehicleLabel}</span>}
            </div>

            <dl className="grid grid-cols-2 gap-3">
              <div className="bg-sunken rounded-md p-3">
                <dt className="text-xs text-ink-2 mb-0.5">매장까지 거리</dt>
                <dd className="flex items-center gap-1 text-sm font-bold text-ink tabular-nums">
                  <MapPin className="w-3.5 h-3.5 text-ink-2" />
                  {distance}
                </dd>
              </div>
              <div className="bg-sunken rounded-md p-3">
                <dt className="text-xs text-ink-2 mb-0.5">도착 예상 시간</dt>
                <dd className="flex items-center gap-1 text-sm font-bold text-ink tabular-nums">
                  <Clock className="w-3.5 h-3.5 text-ink-2" />
                  {etaMin <= 0 ? '도착 완료' : `약 ${etaMin}분`}
                </dd>
              </div>
            </dl>

            <div>
              <span className="text-xs text-ink-2 block mb-2">하차 확인 센서 상태</span>
              {isConfirmed ? (
                <div className="space-y-2">
                  <div className={`${badge} bg-main-tint text-main`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {alighting.alightedCount}/{alighting.totalPassengers}명 하차 완료
                    </span>
                  </div>
                  <ul className="text-xs text-ink-2 space-y-1">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-main" /> 매장 주차 구역 도착 확인 (GPS)
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-main" /> 차량 정차 및 도어 개폐 센서 감지
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-main" /> 승차 인원 전원 하차 확인
                    </li>
                  </ul>
                </div>
              ) : isManual ? (
                <div className={`${badge} bg-sunken text-ink-2`}>
                  <ShieldCheck className="w-4 h-4" />
                  <span>고객 직접 확인 필요 (수동 보고)</span>
                </div>
              ) : (
                <div className={`${badge} bg-sub-tint text-ink`}>
                  <AlertCircle className="w-4 h-4" />
                  <span>인원 미확인</span>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="pt-5 border-t border-line flex items-center gap-3 text-ink-2 text-sm">
            <User className="w-5 h-5 shrink-0" />
            <span>현장 방문 접수 (차량 연동 없음)</span>
          </section>
        )}

        <section className="pt-5 border-t border-line">
          <h4 className="text-sm font-bold text-ink mb-4">진행 감사 이력 (Audit Timeline)</h4>

          <div className="relative pl-6 space-y-4">
            <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-line" />

            {timeline.map((event) => {
              const tone = markerTone(event.type);
              return (
                <div key={event.id} className="relative flex items-start gap-3">
                  <div
                    className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 bg-surface flex items-center justify-center shrink-0 z-10 ${tone.ring}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-ink">{event.title}</span>
                      {event.timestamp && (
                        <span className="text-xs text-ink-2 tabular-nums shrink-0">
                          {event.timestamp}
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-xs text-ink-2 mt-0.5 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="p-4 border-t border-line shrink-0">
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onCall(selectedTeam.id)}
            className={`${action} ${isCalled ? secondary : primary}`}
          >
            <Bell className="w-4 h-4 shrink-0" />
            <span>{isCalled ? '재호출' : '호출'}</span>
          </button>

          <button
            type="button"
            onClick={() => onSeat(selectedTeam.id)}
            className={`${action} ${isCalled ? primary : secondary}`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>착석</span>
          </button>

          <button
            type="button"
            onClick={() => onNoShow(selectedTeam.id)}
            className={`${action} bg-sunken touch-hover-danger text-ink-2 font-medium`}
          >
            <UserX className="w-4 h-4 shrink-0" />
            <span>노쇼</span>
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default TeamDetailDrawer;
