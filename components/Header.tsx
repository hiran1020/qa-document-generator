import React from 'react';

const SparkleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.75.75v3.546a.75.75 0 01-1.5 0V5.25A.75.75 0 019 4.5zM12.75 8.663a.75.75 0 00-1.5 0v3.546a.75.75 0 001.5 0V8.663zM15 4.5a.75.75 0 01.75.75v3.546a.75.75 0 01-1.5 0V5.25A.75.75 0 0115 4.5zM12 15.75a.75.75 0 01.75.75v2.096a.75.75 0 01-1.5 0v-2.096a.75.75 0 01.75-.75z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM4.067 13.522a.75.75 0 011.06 0l1.82 1.82a.75.75 0 11-1.06 1.06l-1.82-1.82a.75.75 0 010-1.06zM17.06 15.34l1.82-1.82a.75.75 0 111.06 1.06l-1.82 1.82a.75.75 0 11-1.06-1.06z" clipRule="evenodd" />
    </svg>
);

const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

interface HeaderProps {
    onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    return (
        <header className="relative text-center pt-8 pb-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800/50">
            <button
                onClick={onMenuClick}
                className="md:hidden absolute top-1/2 -translate-y-1/2 left-4 p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                aria-label="Open menu"
            >
                <MenuIcon className="w-6 h-6" />
            </button>
            <div className="inline-flex items-center justify-center gap-3">
                <SparkleIcon className="w-10 h-10 text-cyan-400" />
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
                    AI QA Document Generator
                </h1>
            </div>
            <p className="mt-4 text-lg text-slate-400 max-w-4xl mx-auto">
                Upload a demo video or describe a feature, and let AI generate your complete QA suite—from high-level plans and user stories to accessibility checklists and detailed test cases.
            </p>
        </header>
    );
};