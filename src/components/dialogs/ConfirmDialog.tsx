import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertTriangle, Users } from 'lucide-react';

export type ConfirmActionType =
  | 'SEAT'
  | 'SEATED'
  | 'NO_SHOW'
  | 'CANCEL'
  | 'DEFAULT';

export interface ConfirmDialogProps {
  /** 다이얼로그 표시 여부 */
  isOpen: boolean;
  /** 액션 종류 */
  type?: ConfirmActionType;
  /** 커스텀 타이틀 (지정 시 기본 타이틀 덮어씀) */
  title?: string;
  /** 커스텀 본문 설명 */
  description?: string;
  /** 확인 버튼 텍스트 (지정 시 기본 텍스트 덮어씀) */
  confirmLabel?: string;
  /** 취소 버튼 텍스트 */
  cancelLabel?: string;
  /** 확인 버튼 색상 테마 */
  confirmVariant?: 'emerald' | 'rose' | 'indigo' | 'amber';
  /** 대상 팀 대기 번호 */
  ticketNo?: number;
  /** 대상 팀 고객명 */
  customerName?: string;
  /** 대상 팀 인원 수 */
  partySize?: number;
  /** 확인 콜백 */
  onConfirm: () => void;
  /** 취소/닫기 콜백 */
  onCancel: () => void;
  /** 추가 클래스 */
  className?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  type = 'DEFAULT',
  title,
  description,
  confirmLabel,
  cancelLabel = '취소',
  confirmVariant,
  ticketNo,
  customerName,
  partySize,
  onConfirm,
  onCancel,
  className = '',
}) => {
  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isSeat = type === 'SEAT' || type === 'SEATED';
  const isNoShow = type === 'NO_SHOW';

  // 제목 기본값
  const defaultTitle = isSeat
    ? '착석 완료 처리'
    : isNoShow
    ? '노쇼(미방문) 처리'
    : '작업 확인';

  const modalTitle = title || defaultTitle;

  // 본문 기본값
  const teamLabel = ticketNo ? `No. ${ticketNo}` : '';
  const customerLabel = customerName ? `${customerName} 고객님` : '해당 팀';

  const defaultDescription = isSeat
    ? `${teamLabel ? `[${teamLabel}] ` : ''}${customerLabel}을 착석 완료 처리하시겠습니까?`
    : isNoShow
    ? `${teamLabel ? `[${teamLabel}] ` : ''}${customerLabel}을 노쇼 처리하시겠습니까?`
    : '해당 작업을 진행하시겠습니까?';

  const modalDescription = description || defaultDescription;

  // 결과 경고 문구
  const consequenceText = isSeat
    ? '고객 차량에 착석 완료 알림이 전송되며, 대기 목록에서 즉시 완료 처리됩니다.'
    : isNoShow
    ? '대기 번호표가 즉시 파기되며 대기열에서 영구 제외됩니다. 이 작업은 되돌릴 수 없습니다.'
    : null;

  // 확인 버튼 라벨 및 스타일
  const defaultConfirmLabel = isSeat
    ? '착석 완료'
    : isNoShow
    ? '노쇼 처리'
    : '확인';
  const finalConfirmLabel = confirmLabel || defaultConfirmLabel;

  const variant =
    confirmVariant || (isSeat ? 'emerald' : isNoShow ? 'rose' : 'indigo');

  const confirmBtnStyles =
    variant === 'emerald'
      ? 'bg-emerald-600 touch-hover-emerald-500 text-white'
      : variant === 'rose'
      ? 'bg-rose-600 touch-hover-rose-500 text-white'
      : variant === 'amber'
      ? 'bg-amber-600 touch-hover-amber-500 text-slate-950 font-bold'
      : 'bg-indigo-600 touch-hover-indigo-500 text-white';

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none touch-manipulation"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onCancel();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350, duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className={`bg-slate-900 border border-slate-700/80 rounded-2xl md:rounded-3xl shadow-2xl max-w-md w-full overflow-hidden text-slate-100 ${className}`}
        >
          {/* 헤더 */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  isSeat
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : isNoShow
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                    : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                }`}
              >
                {isSeat ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {modalTitle}
              </h3>
            </div>

            <button
              type="button"
              onClick={onCancel}
              aria-label="닫기"
              className="w-12 h-12 min-h-[48px] min-w-[48px] rounded-xl flex items-center justify-center text-slate-400 touch-hover-slate-700 touch-hover-text-slate-200 active-press cursor-pointer border border-transparent touch-hover-border-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 본문 */}
          <div className="p-6 space-y-4">
            {/* 팀 요약 정보 (있을 경우) */}
            {(ticketNo !== undefined || partySize !== undefined) && (
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                {ticketNo !== undefined && (
                  <span className="font-mono text-sm font-bold text-white tabular-nums">
                    No. {ticketNo}
                  </span>
                )}
                {partySize !== undefined && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-mono font-bold text-white tabular-nums">
                      {partySize}명
                    </span>
                  </div>
                )}
              </div>
            )}

            <p className="text-sm text-slate-200 leading-relaxed">
              {modalDescription}
            </p>

            {consequenceText && (
              <div
                className={`p-3.5 rounded-xl text-xs leading-relaxed border ${
                  isSeat
                    ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-950/50 border-rose-500/30 text-rose-300'
                }`}
              >
                {consequenceText}
              </div>
            )}
          </div>

          {/* 푸터 액션 (모든 버튼 strictly >= 48px 터치 타깃) */}
          <div className="p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="min-h-[48px] h-12 px-5 bg-slate-800 touch-hover-slate-700 text-slate-300 rounded-xl font-medium text-sm flex items-center justify-center cursor-pointer select-none touch-manipulation transition-all duration-120 ease-out active-press"
            >
              {cancelLabel}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className={`min-h-[48px] h-12 px-5 rounded-xl font-bold text-sm flex items-center justify-center cursor-pointer select-none touch-manipulation transition-all duration-120 ease-out active-press ${confirmBtnStyles}`}
            >
              {finalConfirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmDialog;
