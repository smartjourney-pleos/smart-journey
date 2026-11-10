import React from 'react';
import { motion } from 'motion/react';
import {
  X,
  Car,
  Users,
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
  QueueChannel,
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

// 헬퍼: 전화번호 마스킹 (010-****-1234)
function maskPhone(phone?: string): string {
  if (!phone) return '010-****-1234';
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

// 헬퍼: 고객명 기본값
function getCustomerName(name?: string, channel: QueueChannel = 'VEHICLE'): string {
  if (name) return name;
  return channel === 'VEHICLE' ? '김*수 (Pleos Connect)' : '이*민 (현장 접수)';
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
  const customerName = getCustomerName(
    selectedTeam.customerName,
    selectedTeam.channel
  );
  const phone = maskPhone(selectedTeam.phone);
  const partySize = selectedTeam.partySize;
  const status: QueueStatus = selectedTeam.status;
  const position = 'position' in selectedTeam ? selectedTeam.position : 1;

  // 차량 및 텔레메트리 정보
  const vehicleModel =
    selectedTeam.vehicleModel || (isVehicle ? 'Genesis GV70' : undefined);
  const vehicleNumber =
    selectedTeam.vehicleNumber || (isVehicle ? '123가 4567' : undefined);
  const distance =
    'distanceMeters' in selectedTeam &&
    typeof selectedTeam.distanceMeters === 'number'
      ? `${(selectedTeam.distanceMeters / 1000).toFixed(1)} km`
      : '2.4 km';

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
    // 기본 시계열 합성
    const events: TimelineEvent[] = [];
    const regTime = selectedTeam.registeredAt || '12:00:00';

    events.push({
      id: 'evt-reg',
      timestamp: regTime,
      title: isVehicle ? '원격 웨이팅 접수' : '현장 태블릿 접수',
      description: isVehicle
        ? 'Pleos Connect 차량 내비에서 골든타임 자동 감지 및 승인 완료'
        : '매장 입구 현장 태블릿에서 대기 등록 완료',
      type: 'INFO',
    });

    if (isVehicle) {
      events.push({
        id: 'evt-eta',
        timestamp: '12:05:00',
        title: 'ETA 실시간 갱신',
        description: `실시간 교통 데이터 반영: 도착 예정 ${
          etaMin > 0 ? `${etaMin}분` : '도착 완료'
        }`,
        type: 'INFO',
      });
    }

    if (status === 'ARRIVED' || status === 'CALLED' || status === 'SEATED') {
      events.push({
        id: 'evt-arr',
        timestamp: '12:12:30',
        title: '차량 현장 도착 감지',
        description: '매장 주차 구역 진입 확인 (정차 및 P단 전환 감지)',
        type: 'SUCCESS',
      });

      if (isVehicle) {
        events.push({
          id: 'evt-alight',
          timestamp: '12:13:15',
          title: '승차 인원 하차 센서 확인',
          description: `좌석 및 도어 센서 감지: ${alighting.alightedCount}/${alighting.totalPassengers}명 하차 완료`,
          type: alighting.status === 'CONFIRMED' ? 'SUCCESS' : 'WARNING',
        });
      }
    }

    if (status === 'CALLED' || status === 'SEATED') {
      events.push({
        id: 'evt-call',
        timestamp: selectedTeam.calledAt || '12:15:00',
        title: '매장 점주 고객 호출',
        description: '입장 안내 카카오 알림톡 및 차량 디스플레이 호출 카드 전송',
        type: 'INFO',
      });
    }

    if (status === 'SEATED') {
      events.push({
        id: 'evt-seat',
        timestamp: selectedTeam.seatedAt || '12:18:00',
        title: '테이블 착석 완료',
        description: '매장 입장 확인 및 지정 테이블 안내 완료',
        type: 'SUCCESS',
      });
    }

    timeline = events;
  }

  // 상태 배지 렌더링
  const renderStatusBadge = () => {
    if (status === 'CALLED') {
      return (
        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs px-2.5 py-1 rounded-md font-bold animate-pulse flex items-center gap-1">
          <Bell className="w-3.5 h-3.5" /> 호출됨
        </span>
      );
    }
    if (status === 'ARRIVED') {
      return (
        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-2.5 py-1 rounded-md font-bold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> 현장 도착
        </span>
      );
    }
    if (status === 'SEATED') {
      return (
        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-2.5 py-1 rounded-md font-bold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> 착석 완료
        </span>
      );
    }
    if (status === 'NO_SHOW') {
      return (
        <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs px-2.5 py-1 rounded-md font-bold flex items-center gap-1">
          <UserX className="w-3.5 h-3.5" /> 노쇼
        </span>
      );
    }
    return (
      <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs px-2.5 py-1 rounded-md font-semibold">
        이동 중
      </span>
    );
  };

  return (
    <motion.aside
      initial={{ x: '100%', opacity: 0.8 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30, mass: 0.8 }}
      className={`w-[360px] w-full shrink-0 h-full flex flex-col bg-[#0f172a]/95 backdrop-blur-md overflow-hidden select-none border-l border-slate-800/80 shadow-xl z-20 ${className}`}
    >
      {/* 1. 상단 고정 헤더 (64px) */}
      <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-bold text-white tracking-tight">
            대기 상세 정보
          </h2>
          {isVehicle ? (
            <span className="inline-flex items-center gap-1 bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 text-[11px] px-2 py-0.5 rounded-md font-semibold">
              <Car className="w-3.5 h-3.5 text-cyan-400" /> 차량 인증
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 border border-slate-700 text-[11px] px-2 py-0.5 rounded-md font-semibold">
              <User className="w-3.5 h-3.5" /> 일반 현장
            </span>
          )}
          {renderStatusBadge()}
        </div>

        {/* 닫기 버튼 (최소 48px 터치 타깃 준수) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="상세 닫기"
          className="w-12 h-12 min-h-[48px] min-w-[48px] rounded-xl flex items-center justify-center text-slate-400 touch-hover-slate-700 touch-hover-text-slate-200 active-press cursor-pointer border border-transparent touch-hover-border-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. 스크롤 가능한 본문 영역 */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* 고객 프로필 & 대기 번호 카드 */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* 대형 모노스페이스 대기 번호표 */}
              <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-700/80 flex flex-col items-center justify-center font-bold shrink-0 shadow-inner">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold">
                  No.
                </span>
                <span className="text-2xl text-white font-mono leading-none tabular-nums font-extrabold">
                  {ticketNo}
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {customerName}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono tabular-nums">
                  <Phone className="w-3 h-3 text-slate-500" />
                  <span>{phone}</span>
                </div>
              </div>
            </div>

            {/* 순서 및 상태 */}
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">대기 순서</span>
              <span className="text-sm font-bold text-slate-200">
                {position === 1 ? '다음 입장' : `${position}번째`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>탑승 인원:</span>
              <span className="font-bold text-white font-mono">{partySize}명</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>접수 시각:</span>
              <span className="font-bold text-white font-mono">
                {selectedTeam.registeredAt}
              </span>
            </div>
          </div>
        </div>

        {/* 차량 텔레메트리 (차량 인증 예약인 경우) */}
        {isVehicle ? (
          <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                <Car className="w-4 h-4" />
                <span>차량 및 주행 텔레메트리</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                {vehicleModel} · {vehicleNumber}
              </span>
            </div>

            {/* 주행 상태 지표 */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-950/60 border border-slate-800/70 rounded-xl p-2.5">
                <span className="text-[10px] text-slate-400 block mb-0.5">
                  매장까지 거리
                </span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-sm font-bold text-white font-mono tabular-nums">
                    {distance}
                  </span>
                </div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/70 rounded-xl p-2.5">
                <span className="text-[10px] text-slate-400 block mb-0.5">
                  도착 예상 시간
                </span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-sm font-bold text-white font-mono tabular-nums">
                    {etaMin <= 0 ? '도착 완료' : `약 ${etaMin}분`}
                  </span>
                </div>
              </div>
            </div>

            {/* 하차 센서 텔레메트리 배지 & 체크리스트 */}
            <div className="pt-2 border-t border-slate-800/70">
              <span className="text-[11px] text-slate-400 block mb-2">
                하차 확인 센서 상태
              </span>
              {isConfirmed ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>
                      {alighting.alightedCount}/{alighting.totalPassengers}명 하차 완료
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-1 pl-1">
                    <div className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> 매장 주차 구역 도착 확인 (GPS)
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> 차량 정차 및 도어 개폐 센서 감지
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> 승차 인원 전원 하차 확인
                    </div>
                  </div>
                </div>
              ) : isManual ? (
                <div className="flex items-center gap-2 bg-slate-800 text-slate-300 border border-slate-600 px-3 py-2 rounded-xl text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span>고객 직접 확인 필요 (수동 보고)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-amber-950/60 text-amber-300 border border-amber-500/30 px-3 py-2 rounded-xl text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>인원 미확인</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-4 flex items-center gap-3 text-slate-400 text-xs">
            <User className="w-5 h-5 text-slate-500 shrink-0" />
            <span>현장 방문 접수 (차량 연동 없음)</span>
          </div>
        )}

        {/* 진행 감사 이력 (Chronological Audit Timeline) */}
        <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
            <Clock className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-bold text-white">
              진행 감사 이력 (Audit Timeline)
            </h4>
          </div>

          <div className="relative pl-6 space-y-4">
            {/* 세로 타임라인 연결선 */}
            <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-800" />

            {timeline.map((event) => {
              const isSuccess = event.type === 'SUCCESS';
              const isWarning = event.type === 'WARNING';
              const isAlert = event.type === 'ALERT';

              return (
                <div key={event.id} className="relative flex items-start gap-3">
                  {/* 타임라인 노드 마커 */}
                  <div
                    className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${
                      isSuccess
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                        : isWarning
                        ? 'bg-amber-950 border-amber-500 text-amber-400'
                        : isAlert
                        ? 'bg-rose-950 border-rose-500 text-rose-400'
                        : 'bg-blue-950 border-blue-500 text-blue-400'
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSuccess
                          ? 'bg-emerald-400'
                          : isWarning
                          ? 'bg-amber-400'
                          : isAlert
                          ? 'bg-rose-400'
                          : 'bg-blue-400'
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">
                        {event.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                        {event.timestamp}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. 하단 고정 액션 버튼 바 (48px 터치 타깃 & .active-press) */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/95 shrink-0">
        <div className="grid grid-cols-3 gap-2">
          {/* 호출 버튼 */}
          <button
            type="button"
            onClick={() => onCall(selectedTeam.id)}
            className={`min-h-[48px] h-12 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer select-none touch-manipulation transition-all duration-120 ease-out active-press ${
              status === 'CALLED'
                ? 'bg-amber-500 text-slate-950 touch-hover-amber-400'
                : 'bg-indigo-600 touch-hover-indigo-500 text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5 shrink-0" />
            <span>{status === 'CALLED' ? '재호출' : '호출'}</span>
          </button>

          {/* 착석 버튼 */}
          <button
            type="button"
            onClick={() => onSeat(selectedTeam.id)}
            className="min-h-[48px] h-12 px-3 bg-emerald-600 touch-hover-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer select-none touch-manipulation transition-all duration-120 ease-out active-press"
          >
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>착석</span>
          </button>

          {/* 노쇼 버튼 */}
          <button
            type="button"
            onClick={() => onNoShow(selectedTeam.id)}
            className="min-h-[48px] h-12 px-3 bg-slate-700 touch-hover-rose-900-70 touch-hover-text-rose-200 text-slate-300 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer select-none touch-manipulation transition-all duration-120 ease-out active-press"
          >
            <UserX className="w-3.5 h-3.5 shrink-0" />
            <span>노쇼</span>
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default TeamDetailDrawer;
