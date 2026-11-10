import React from 'react';

export interface TabletLayoutProps {
  header: React.ReactNode;
  leftSidebar?: React.ReactNode;
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
  isRightPanelOpen?: boolean;
  className?: string;
}

export const TabletLayout: React.FC<TabletLayoutProps> = ({
  header,
  leftSidebar,
  children,
  rightPanel,
  isRightPanelOpen = true,
  className = '',
}) => {
  return (
    <div
      className={`h-[100dvh] h-screen w-screen flex flex-col bg-slate-950 bg-[#090d16] text-slate-100 overflow-hidden font-sans select-none overscroll-none ${className}`}
    >
      {/* 1. 고정 헤더 영역 (64px) */}
      {header}

      {/* 2. 태블릿 3단 분할 메인 영역 (100dvh - 64px) */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        {/* 좌측 사이드바: 280px 요약 통계 및 필터 탭 */}
        {leftSidebar && (
          <div className="w-[280px] shrink-0 border-r border-slate-800/80 bg-[#0d1322]/80 backdrop-blur-sm flex flex-col overflow-y-auto">
            {leftSidebar}
          </div>
        )}

        {/* 중앙 메인 보드: Flex-1 반응형 대기열 카드 그리드 */}
        <main className="flex-1 min-w-0 bg-[#090d16] flex flex-col overflow-hidden relative">
          {children}
        </main>

        {/* 우측 컨텍스트 패널: 360px 슬라이드 드로어 (상세 뷰 / 심사위원 데모 패널) */}
        {rightPanel && isRightPanelOpen && (
          <aside className="w-[360px] shrink-0 border-l border-slate-800/80 bg-[#0f172a]/95 backdrop-blur-md flex flex-col overflow-hidden shadow-xl z-20">
            {rightPanel}
          </aside>
        )}
      </div>
    </div>
  );
};

export default TabletLayout;
