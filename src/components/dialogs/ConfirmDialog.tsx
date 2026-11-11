import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

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
  confirmVariant?: 'main' | 'danger' | 'sub';
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
    confirmVariant || (isSeat ? 'main' : isNoShow ? 'danger' : 'main');

  const confirmBtnStyles =
    variant === 'danger'
      ? 'bg-danger touch-hover-danger-solid text-white'
      : variant === 'sub'
      ? 'bg-sub touch-hover-sub text-ink'
      : 'bg-main touch-hover-main text-white';

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 select-none touch-manipulation"
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
          className={`bg-surface rounded-lg shadow-xl shadow-pleos-3 max-w-md w-full overflow-hidden text-ink border border-line ${className}`}
        >
          {/* Pleos System Popup Header */}
          <div className="px-6 py-4 border-b border-line flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {isSeat ? (
                <CheckCircle2 className="w-5 h-5 text-main" />
              ) : isNoShow ? (
                <ShieldAlert className="w-5 h-5 text-danger" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-sub" />
              )}
              <h3 className="text-lg font-bold text-ink">{modalTitle}</h3>
            </div>

            <button
              type="button"
              onClick={onCancel}
              aria-label="닫기"
              className="w-12 h-12 min-h-[48px] min-w-[48px] -mr-3 rounded-md flex items-center justify-center text-ink-2 touch-hover-sunken touch-hover-ink active-press cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Pleos Popup Body */}
          <div className="p-6 space-y-4">
            {(ticketNo !== undefined || partySize !== undefined) && (
              <div className="bg-sunken rounded-md px-4 py-3 flex items-center justify-between border border-line/60">
                {ticketNo !== undefined && (
                  <span className="text-base font-bold text-ink tabular-nums">
                    No. {ticketNo}
                  </span>
                )}
                {partySize !== undefined && (
                  <span className="text-base font-bold text-ink tabular-nums">
                    {partySize}명
                  </span>
                )}
              </div>
            )}

            <p className="text-base text-ink leading-relaxed font-medium">{modalDescription}</p>

            {consequenceText && (
              <p
                className={`px-4 py-3 rounded-md text-sm leading-relaxed border ${
                  isSeat
                    ? 'bg-main-tint text-main border-main/20'
                    : 'bg-danger-tint text-danger border-danger/20 font-medium'
                }`}
              >
                {consequenceText}
              </p>
            )}
          </div>

          {/* Pleos Popup Action Row (Horizontal Align) */}
          <div className="px-6 py-4 border-t border-line flex items-center justify-end gap-3 bg-sunken/20">
            <button
              type="button"
              onClick={onCancel}
              className="min-h-[48px] h-12 px-5 bg-sunken touch-hover-line text-ink rounded-md font-medium text-sm flex items-center justify-center cursor-pointer select-none touch-manipulation transition-colors duration-150 ease-out active-press"
            >
              {cancelLabel}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className={`min-h-[48px] h-12 px-5 rounded-md font-bold text-sm flex items-center justify-center cursor-pointer select-none touch-manipulation transition-colors duration-150 ease-out active-press shadow-sm ${confirmBtnStyles}`}
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
