import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, Cpu, BookOpen } from 'lucide-react';
import { CHAPTERS, ALL_GLOSSARY_TERMS } from './data/chapters';
import { ChapterId, QuizProgress } from './types/os';
import { Header, AppView } from './components/Header';
import { ChapterView } from './components/ChapterView';
import { GlossaryView } from './components/GlossaryView';

const STORAGE_KEY = 'os_concepts_quiz_progress_v1';
const HERO_IMAGE_URL = '/src/assets/images/hero_os_architecture_1795284626088.jpg';

export default function App() {
  const [view, setView] = useState<AppView>('overview');
  const [activeChapterId, setActiveChapterId] = useState<ChapterId>('intro');
  const [heroImgError, setHeroImgError] = useState<boolean>(false);
  const [quizProgress, setQuizProgress] = useState<QuizProgress>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quizProgress));
    } catch {
      // Ignore storage quota errors gracefully
    }
  }, [quizProgress]);

  const activeIndex = CHAPTERS.findIndex((c) => c.id === activeChapterId);
  const activeChapter = CHAPTERS[activeIndex] || CHAPTERS[0];
  const prevChapter = activeIndex > 0 ? CHAPTERS[activeIndex - 1] : undefined;
  const nextChapter = activeIndex < CHAPTERS.length - 1 ? CHAPTERS[activeIndex + 1] : undefined;

  const totalQuestions = CHAPTERS.reduce((sum, c) => sum + c.quiz.length, 0);
  const completedQuizzes = CHAPTERS.filter((c) => quizProgress[c.id]?.submitted).length;
  const totalCorrect = CHAPTERS.reduce(
    (sum, c) => sum + (quizProgress[c.id]?.submitted ? quizProgress[c.id].score : 0),
    0
  );

  const openChapter = (id: ChapterId, scrollTargetId?: string) => {
    setActiveChapterId(id);
    setView('chapter');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (scrollTargetId) {
      setTimeout(() => {
        const el = document.getElementById(scrollTargetId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  };

  const handleSaveQuizProgress = (chapterId: string, state: QuizProgress[string]) => {
    setQuizProgress((prev) => ({ ...prev, [chapterId]: state }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header
        activeView={view}
        activeChapterNumber={activeChapter.number}
        onNavigateOverview={() => {
          setView('overview');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateLabs={() => openChapter(activeChapter.id, 'chapter-lab')}
        onNavigateGlossary={() => {
          setView('glossary');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateQuizzes={() => openChapter(activeChapter.id, 'chapter-quiz')}
        onPrimaryAction={() => openChapter(activeChapter.id)}
      />

      <main className="flex-1">
        {view === 'overview' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-14">
            {/* Hero Split Section */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>Silberschatz, Galvin &amp; Gagne</span>
                  <span aria-hidden="true">·</span>
                  <span>Operating System Concepts, 10th Edition</span>
                </div>

                <h1 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-[1.1] text-balance">
                  Operating Systems, Explained Visually and Step by Step.
                </h1>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                  Build rock-solid intuition for kernels, processes, CPU scheduling, synchronization,
                  memory paging, virtual memory, and file systems through everyday analogies,
                  live interactive labs, and instant review quizzes.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => openChapter('intro')}
                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-sky-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <span>Start Chapter 01</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openChapter('scheduling', 'chapter-lab')}
                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Try CPU Scheduling Lab
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="h-full min-h-[280px] rounded-xl overflow-hidden border border-slate-200 bg-white">
                  {!heroImgError ? (
                    <img
                      src={HERO_IMAGE_URL}
                      alt="Isometric architectural diagram of an operating system kernel connecting CPU cores, memory frames, and disk storage"
                      referrerPolicy="no-referrer"
                      onError={() => setHeroImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full min-h-[280px] bg-gradient-to-br from-slate-100 via-sky-50 to-slate-100 flex flex-col items-center justify-center p-8 text-center space-y-3">
                      <Cpu className="w-10 h-10 text-sky-700" />
                      <p className="font-display text-lg font-semibold text-slate-900">
                        Kernel · CPU · Memory · Storage
                      </p>
                      <p className="text-xs text-slate-600 max-w-xs">
                        Interactive visual architecture aligned with Silberschatz Operating System Concepts (10th Edition).
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Full-Width 4-Column Curriculum KPI Strip */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-xs text-slate-500">Core Modules</p>
                <p className="text-2xl font-bold font-display text-slate-900 tabular-nums mt-1">
                  {CHAPTERS.length} Chapters
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-xs text-slate-500">Hands-On Simulators</p>
                <p className="text-2xl font-bold font-display text-slate-900 tabular-nums mt-1">
                  7 Live Labs
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-xs text-slate-500">English Terminology</p>
                <p className="text-2xl font-bold font-display text-slate-900 tabular-nums mt-1">
                  {ALL_GLOSSARY_TERMS.length} Key Terms
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-xs text-slate-500">Quiz Mastery</p>
                <p className="text-2xl font-bold font-display text-sky-700 tabular-nums mt-1">
                  {completedQuizzes}/{CHAPTERS.length} Quizzes ({totalCorrect}/{totalQuestions})
                </p>
              </div>
            </section>

            {/* Core Chapters Grid */}
            <section className="space-y-6">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Course Syllabus</p>
                  <h2 className="text-2xl font-bold text-slate-900 mt-1">
                    Seven Core Operating Systems Chapters
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setView('glossary')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  Browse Full English Glossary
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {CHAPTERS.map((ch) => {
                  const prog = quizProgress[ch.id];
                  const isDone = prog?.submitted;

                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => openChapter(ch.id)}
                      className="group text-left bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between gap-5 hover:border-sky-400 transition-colors cursor-pointer"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                          <span className="font-mono font-semibold text-slate-700 tabular-nums">
                            Chapter {ch.number} · {ch.silberschatzRef}
                          </span>
                          {isDone && (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold tabular-nums">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {prog.score}/{prog.total}
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-sky-700 transition-colors">
                          {ch.title}
                        </h3>

                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                          {ch.overview}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 truncate pr-2">
                          Lab: {ch.labTitle}
                        </span>
                        <span className="font-semibold text-sky-700 inline-flex items-center gap-1 shrink-0">
                          Study
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {view === 'chapter' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Mobile Chapter Selector */}
            <div className="lg:hidden mb-6 overflow-x-auto pb-2">
              <div className="inline-flex items-center gap-1.5">
                {CHAPTERS.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => openChapter(ch.id)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border whitespace-nowrap shrink-0 cursor-pointer ${
                      ch.id === activeChapter.id
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    {ch.number}. {ch.shortTitle}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-10 items-start">
              {/* Desktop Chapter Rail */}
              <aside className="hidden lg:block w-64 shrink-0 sticky top-24 space-y-6">
                <div className="space-y-1">
                  <p className="px-3 text-xs font-medium text-slate-500 mb-2">
                    Core Curriculum
                  </p>
                  {CHAPTERS.map((ch) => {
                    const active = ch.id === activeChapter.id;
                    const prog = quizProgress[ch.id];
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => openChapter(ch.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                          active
                            ? 'bg-white border border-slate-200 font-semibold text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                        }`}
                      >
                        <span className="truncate">
                          <span className="font-mono text-xs text-slate-400 mr-2 tabular-nums">
                            {ch.number}
                          </span>
                          {ch.shortTitle}
                        </span>
                        {prog?.submitted && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 text-xs">
                  <p className="font-semibold text-slate-900">Your Progress</p>
                  <p className="text-slate-600 tabular-nums">
                    {completedQuizzes} of {CHAPTERS.length} chapter quizzes completed ({totalCorrect}/
                    {totalQuestions} correct)
                  </p>
                </div>
              </aside>

              {/* Main Study Stage */}
              <div className="flex-1 min-w-0">
                <ChapterView
                  chapter={activeChapter}
                  prevChapter={prevChapter}
                  nextChapter={nextChapter}
                  quizProgress={quizProgress}
                  onSelectChapter={(id) => openChapter(id)}
                  onSaveQuizProgress={handleSaveQuizProgress}
                />
              </div>
            </div>
          </div>
        )}

        {view === 'glossary' && (
          <GlossaryView onOpenChapter={(id) => openChapter(id)} />
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            Primary Reference: <span className="text-slate-700 font-medium">Operating System Concepts (10th Edition)</span> — Silberschatz, Galvin, &amp; Gagne.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setView('overview')}
              className="hover:text-slate-900 cursor-pointer"
            >
              Curriculum
            </button>
            <button
              type="button"
              onClick={() => setView('glossary')}
              className="hover:text-slate-900 cursor-pointer"
            >
              Glossary
            </button>
            <button
              type="button"
              onClick={() => openChapter('intro')}
              className="hover:text-slate-900 cursor-pointer"
            >
              Chapter 01
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
