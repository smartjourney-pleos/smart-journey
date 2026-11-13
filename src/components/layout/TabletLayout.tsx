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
      className={`h-[100dvh] h-screen w-screen flex flex-col bg-ground text-ink overflow-hidden font-sans select-none overscroll-none ${className}`}
    >
      {header}

      <div className="flex-1 flex overflow-hidden w-full relative">
        {leftSidebar && (
          <div className="w-[280px] shrink-0 border-r border-line bg-surface flex flex-col overflow-y-auto">
            {leftSidebar}
          </div>
        )}

        <main className="flex-1 min-w-0 flex flex-col overflow-hidden relative">
          {children}
        </main>

        {rightPanel && isRightPanelOpen && (
          <aside className="w-[360px] shrink-0 border-l border-line bg-surface flex flex-col overflow-hidden z-20">
            {rightPanel}
          </aside>
        )}
      </div>
    </div>
  );
};

export default TabletLayout;
