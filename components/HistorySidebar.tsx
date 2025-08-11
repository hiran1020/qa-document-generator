import React from 'react';
import { HistoryItem } from '../types';

interface HistorySidebarProps {
  history: HistoryItem[];
  activeItemId: string | null;
  onSelectItem: (item: HistoryItem) => void;
  onNewSession: () => void;
  onClearHistory: () => void;
  isLoading: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 1 0 .53 1.402c.823-.254 1.66-.388 2.535-.429v10.264a.75.75 0 0 0 1.5 0V5.633c.875.04 1.712.175 2.535.429a.75.75 0 0 0 .53-1.402c-.785-.248-1.57-.391-2.365-.468v-.443A2.75 2.75 0 0 0 8.75 1ZM3.5 6.75A.75.75 0 0 1 4.25 6h9.5a.75.75 0 0 1 0 1.5h-9.5A.75.75 0 0 1 3.5 6.75Z" clipRule="evenodd" />
    </svg>
);

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, activeItemId, onSelectItem, onNewSession, onClearHistory, isLoading, isSidebarOpen, setIsSidebarOpen }) => {
    
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <>
            {/* Overlay for mobile */}
            <div 
                onClick={() => setIsSidebarOpen(false)}
                className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
                aria-hidden="true"
            />
            <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-950/80 backdrop-blur-sm border-r border-slate-800 flex flex-col flex-shrink-0 z-40 transform transition-transform duration-300 ease-in-out md:static md:transform-none md:bg-slate-950/70 md:backdrop-blur-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 border-b border-slate-800">
                    <button
                        onClick={onNewSession}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    >
                        <PlusIcon className="w-5 h-5" />
                        New Session
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {isLoading && (
                        <div className="p-4 text-center text-slate-400">Loading history...</div>
                    )}
                    {!isLoading && history.length === 0 && (
                        <div className="p-4 text-center text-sm text-slate-500">No saved sessions.</div>
                    )}
                    {!isLoading && (
                        <nav className="p-2 space-y-1">
                            {history.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => onSelectItem(item)}
                                    className={`w-full text-left p-3 rounded-md transition-colors duration-200 group ${activeItemId === item.id ? 'bg-cyan-500/10 text-cyan-300' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
                                >
                                    <p className="text-sm font-medium truncate">{item.title}</p>
                                    <p className={`text-xs mt-1 ${activeItemId === item.id ? 'text-cyan-400/80' : 'text-slate-500 group-hover:text-slate-400'}`}>
                                        {formatDate(item.timestamp)}
                                    </p>
                                </button>
                            ))}
                        </nav>
                    )}
                </div>
                
                <div className="p-4 border-t border-slate-800">
                    {history.length > 0 && (
                        <button
                            onClick={onClearHistory}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400 font-semibold text-sm rounded-md transition-colors duration-200"
                            aria-label="Clear all history"
                        >
                            <TrashIcon className="w-4 h-4" />
                            Clear History
                        </button>
                    )}
                </div>

            </aside>
        </>
    );
};