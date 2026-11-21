import React from 'react';
import { ArrowLeft, ArrowRight, Lightbulb, BookOpen, CheckSquare } from 'lucide-react';
import { ChapterData, ChapterId, QuizProgress } from '../types/os';
import { IntroDualModeSim } from './simulators/IntroDualModeSim';
import { ProcessLifecycleSim } from './simulators/ProcessLifecycleSim';
import { CpuSchedulingSim } from './simulators/CpuSchedulingSim';
import { SyncDeadlockSim } from './simulators/SyncDeadlockSim';
import { MemoryManagementSim } from './simulators/MemoryManagementSim';
import { VirtualMemorySim } from './simulators/VirtualMemorySim';
import { FileSystemSim } from './simulators/FileSystemSim';
import { QuizSection } from './QuizSection';

interface ChapterViewProps {
  chapter: ChapterData;
  prevChapter?: ChapterData;
  nextChapter?: ChapterData;
  quizProgress: QuizProgress;
  onSelectChapter: (id: ChapterId) => void;
  onSaveQuizProgress: (chapterId: string, state: QuizProgress[string]) => void;
}

export const ChapterView: React.FC<ChapterViewProps> = ({
  chapter,
  prevChapter,
  nextChapter,
  quizProgress,
  onSelectChapter,
  onSaveQuizProgress,
}) => {
  const renderSimulator = () => {
    switch (chapter.id) {
      case 'intro':
        return <IntroDualModeSim />;
      case 'processes':
        return <ProcessLifecycleSim />;
      case 'scheduling':
        return <CpuSchedulingSim />;
      case 'synchronization':
        return <SyncDeadlockSim />;
      case 'memory':
        return <MemoryManagementSim />;
      case 'virtual-memory':
        return <VirtualMemorySim />;
      case 'file-systems':
        return <FileSystemSim />;
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <article className="space-y-12 pb-16">
      {/* Chapter Header */}
      <header className="space-y-4 border-b border-slate-200 pb-8">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>Chapter {chapter.number}</span>
          <span aria-hidden="true">·</span>
          <span>{chapter.silberschatzRef}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{chapter.estimatedMinutes} min study</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{chapter.quiz.length} review questions</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight text-balance">
          {chapter.title}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
          {chapter.overview}
        </p>

        {/* Quick Intra-Chapter Section Jumper */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => scrollToSection('chapter-analogy')}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            01. Analogy
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('chapter-steps')}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            02. Step-by-Step
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('chapter-lab')}
            className="px-3 py-1.5 text-xs font-medium text-sky-800 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 cursor-pointer"
          >
            03. Interactive Lab
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('chapter-summary')}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            04. Summary &amp; Terms
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('chapter-quiz')}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            05. Review Quiz
          </button>
        </div>
      </header>

      {/* Section 1: Real-World Analogy */}
      <section id="chapter-analogy" className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">01. Real-World Analogy</p>
            <h2 className="text-xl font-semibold text-slate-900">{chapter.analogy.title}</h2>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-3xl">
          {chapter.analogy.scenario}
        </p>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="py-2.5 px-4 font-semibold">Operating System Concept</th>
                <th className="py-2.5 px-4 font-semibold">Real-World Equivalent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {chapter.analogy.mapping.map((row) => (
                <tr key={row.osTerm}>
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-900">
                    {row.osTerm}
                  </td>
                  <td className="py-2.5 px-4 text-slate-700">{row.realWorld}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 2: Step-by-Step Explanations */}
      <section id="chapter-steps" className="space-y-5">
        <div>
          <p className="text-xs font-medium text-slate-500">02. Core Mechanics</p>
          <h2 className="text-2xl font-semibold text-slate-900 mt-1">
            Step-by-Step Breakdown
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {chapter.steps.map((step) => (
            <div
              key={step.stepNumber}
              className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2.5">
                <span className="font-mono text-xs font-semibold text-sky-700 tabular-nums">
                  Step {step.stepNumber}
                </span>
                <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="text-sm text-slate-700 leading-relaxed">{step.explanation}</p>
              </div>
              <div className="pt-3 border-t border-slate-100 text-xs text-slate-600">
                <span className="font-semibold text-slate-900">Key Principle: </span>
                {step.keyTakeaway}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Interactive Diagram & Simulator */}
      <section id="chapter-lab" className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-sky-700">03. Interactive Lab</p>
          <h2 className="text-2xl font-semibold text-slate-900">{chapter.labTitle}</h2>
          <p className="text-sm text-slate-600 max-w-3xl">{chapter.labPrompt}</p>
        </div>
        {renderSimulator()}
      </section>

      {/* Section 4: Concise Summary & Key Terms */}
      <section id="chapter-summary" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-sky-700 shrink-0" />
            <h3 className="text-lg font-semibold text-slate-900">Concise Chapter Summary</h3>
          </div>
          <ul className="space-y-3 text-sm text-slate-700 leading-relaxed">
            {chapter.summary.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="font-mono text-xs font-semibold text-slate-400 mt-1 tabular-nums">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-700 shrink-0" />
            <h3 className="text-lg font-semibold text-slate-900">
              Key Technical Terms (English Reference)
            </h3>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {chapter.keyTerms.map((item) => (
              <div key={item.term} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <dt className="font-mono text-xs font-semibold text-slate-900">{item.term}</dt>
                <dd className="text-xs text-slate-600 leading-relaxed mt-1">{item.definition}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Section 5: Short Review Quiz */}
      <QuizSection
        chapterId={chapter.id}
        chapterTitle={`${chapter.number}. ${chapter.shortTitle}`}
        questions={chapter.quiz}
        savedState={quizProgress[chapter.id]}
        onSaveProgress={onSaveQuizProgress}
      />

      {/* Chapter Pagination Footer */}
      <nav
        aria-label="Chapter pagination"
        className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-200"
      >
        {prevChapter ? (
          <button
            type="button"
            onClick={() => onSelectChapter(prevChapter.id)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              Ch. {prevChapter.number}: {prevChapter.shortTitle}
            </span>
          </button>
        ) : (
          <div />
        )}

        {nextChapter && (
          <button
            type="button"
            onClick={() => onSelectChapter(nextChapter.id)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-sky-700 transition-colors cursor-pointer"
          >
            <span>
              Next — Ch. {nextChapter.number}: {nextChapter.shortTitle}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </nav>
    </article>
  );
};
