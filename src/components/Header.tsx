import React from 'react';

export type AppView = 'overview' | 'chapter' | 'glossary';

interface HeaderProps {
  activeView: AppView;
  activeChapterNumber: string;
  onNavigateOverview: () => void;
  onNavigateLabs: () => void;
  onNavigateGlossary: () => void;
  onNavigateQuizzes: () => void;
  onPrimaryAction: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  activeChapterNumber,
  onNavigateOverview,
  onNavigateLabs,
  onNavigateGlossary,
  onNavigateQuizzes,
  onPrimaryAction,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={onNavigateOverview}
          className="font-display text-lg font-bold tracking-tight text-slate-900 hover:text-sky-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          OS Concepts
        </button>

        {/* Zone 2: 4 Concise Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={onNavigateOverview}
            className={`hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeView === 'overview' ? 'text-slate-900 underline' : ''
            }`}
          >
            Curriculum
          </button>
          <button
            type="button"
            onClick={onNavigateLabs}
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Interactive Labs
          </button>
          <button
            type="button"
            onClick={onNavigateGlossary}
            className={`hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeView === 'glossary' ? 'text-slate-900 underline' : ''
            }`}
          >
            Glossary
          </button>
          <button
            type="button"
            onClick={onNavigateQuizzes}
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Review Quizzes
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action Button */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onPrimaryAction}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-sky-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {activeView === 'chapter' ? `Chapter ${activeChapterNumber}` : 'Resume Study'}
          </button>
        </div>
      </div>
    </header>
  );
};
