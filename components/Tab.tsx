
import React from 'react';

interface TabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const Tab: React.FC<TabProps> = ({ label, isActive, onClick }) => {
  const activeClasses = 'bg-cyan-500/10 text-cyan-300';
  const inactiveClasses = 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200';

  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap py-2 px-4 rounded-md font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 ${isActive ? activeClasses : inactiveClasses}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {label}
    </button>
  );
};
