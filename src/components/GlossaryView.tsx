import React, { useMemo, useState } from 'react';
import { Search, ArrowUpRight } from 'lucide-react';
import { ALL_GLOSSARY_TERMS, CHAPTERS } from '../data/chapters';
import { ChapterId } from '../types/os';

interface GlossaryViewProps {
  onOpenChapter: (chapterId: ChapterId) => void;
}

export const GlossaryView: React.FC<GlossaryViewProps> = ({ onOpenChapter }) => {
  const [query, setQuery] = useState<string>('');
  const [chapterFilter, setChapterFilter] = useState<ChapterId | 'all'>('all');

  const filteredTerms = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_GLOSSARY_TERMS.filter((item) => {
      const matchesChapter = chapterFilter === 'all' || item.chapterId === chapterFilter;
      const matchesQuery =
        q === '' ||
        item.term.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q);
      return matchesChapter && matchesQuery;
    });
  }, [query, chapterFilter]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <p className="text-xs font-medium text-slate-500">
          Reference Glossary · Operating System Concepts (10th Edition)
        </p>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight text-balance">
          Key Operating Systems Terminology
        </h1>
        <p className="text-base text-slate-600 max-w-2xl">
          Every core technical term kept in standard English for academic clarity across exams, systems courses, and kernel documentation.
        </p>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms (e.g., PCB, TLB, Semaphore, Thrashing)..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setChapterFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              chapterFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Chapters ({ALL_GLOSSARY_TERMS.length})
          </button>
          {CHAPTERS.map((ch) => (
            <button
              key={ch.id}
              type="button"
              onClick={() => setChapterFilter(ch.id)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                chapterFilter === ch.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ch. {ch.number}
            </button>
          ))}
        </div>
      </div>

      {/* Terms Grid */}
      {filteredTerms.length === 0 ? (
        <div className="p-10 text-center bg-white border border-slate-200 rounded-xl text-sm text-slate-600">
          No matching glossary terms found for &ldquo;{query}&rdquo;.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTerms.map((item) => (
            <div
              key={`${item.chapterId}-${item.term}`}
              className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span>{item.chapterTitle}</span>
                </div>
                <h2 className="text-base font-semibold text-slate-900 font-mono">
                  {item.term}
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed">{item.definition}</p>
              </div>
              {item.chapterId && (
                <button
                  type="button"
                  onClick={() => onOpenChapter(item.chapterId!)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-900 self-start cursor-pointer"
                >
                  Open Chapter
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
