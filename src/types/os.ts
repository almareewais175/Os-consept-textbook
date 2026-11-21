export type ChapterId =
  | 'intro'
  | 'processes'
  | 'scheduling'
  | 'synchronization'
  | 'memory'
  | 'virtual-memory'
  | 'file-systems';

export interface LearningStep {
  stepNumber: string;
  title: string;
  explanation: string;
  keyTakeaway: string;
}

export interface AnalogyMapping {
  osTerm: string;
  realWorld: string;
}

export interface ChapterAnalogy {
  title: string;
  scenario: string;
  mapping: AnalogyMapping[];
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  chapterId?: ChapterId;
  chapterTitle?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ChapterData {
  id: ChapterId;
  number: string;
  title: string;
  shortTitle: string;
  silberschatzRef: string;
  estimatedMinutes: number;
  overview: string;
  analogy: ChapterAnalogy;
  steps: LearningStep[];
  labTitle: string;
  labPrompt: string;
  summary: string[];
  keyTerms: GlossaryTerm[];
  quiz: QuizQuestion[];
}

export interface QuizProgress {
  [chapterId: string]: {
    answers: { [questionId: string]: number };
    submitted: boolean;
    score: number;
    total: number;
  };
}
