import React, { useState } from 'react';
import { Lock, Unlock, AlertTriangle, CheckCircle2, RotateCcw, StepForward } from 'lucide-react';

export const SyncDeadlockSim: React.FC = () => {
  const [tab, setTab] = useState<'race' | 'deadlock'>('race');

  // Race condition state
  const [mutexEnabled, setMutexEnabled] = useState<boolean>(false);
  const [raceStep, setRaceStep] = useState<number>(0);

  // Deadlock state
  const [orderedLocks, setOrderedLocks] = useState<boolean>(false);
  const [dlStep, setDlStep] = useState<number>(0);

  // Interleaved execution traces for counter++ (initial counter = 5)
  const raceTraceUnsafe = [
    {
      actor: 'Initial',
      action: 'Shared counter = 5',
      regA: '—',
      regB: '—',
      mem: 5,
      note: 'Two threads (T1 & T2) both want to execute counter++ concurrently without a Mutex lock.',
    },
    {
      actor: 'Thread 1',
      action: 'LOAD regA <- counter (5)',
      regA: '5',
      regB: '—',
      mem: 5,
      note: 'T1 loads counter (5) into its private CPU register, then gets preempted by the scheduler!',
    },
    {
      actor: 'Thread 2',
      action: 'LOAD regB <- counter (5)',
      regA: '5',
      regB: '5',
      mem: 5,
      note: 'T2 also reads the stale value 5 because T1 has not written back yet.',
    },
    {
      actor: 'Thread 2',
      action: 'ADD regB = 6; STORE counter <- 6',
      regA: '5',
      regB: '6',
      mem: 6,
      note: 'T2 finishes incrementing and writes 6 to shared memory.',
    },
    {
      actor: 'Thread 1',
      action: 'ADD regA = 6; STORE counter <- 6',
      regA: '6',
      regB: '6',
      mem: 6,
      note: 'RACE CONDITION: T1 overwrites memory with 6! Two increments occurred, yet counter is 6 instead of 7.',
    },
  ];

  const raceTraceSafe = [
    {
      actor: 'Initial',
      action: 'Shared counter = 5 (Mutex Unlocked)',
      regA: '—',
      regB: '—',
      mem: 5,
      note: 'Mutex protection is ON. Threads must acquire() the Mutex before entering the Critical Section.',
    },
    {
      actor: 'Thread 1',
      action: 'acquire(mutex) -> LOAD regA <- 5',
      regA: '5',
      regB: '—',
      mem: 5,
      note: 'T1 acquires the Mutex lock and loads 5. Even if T2 tries to run now, T2 blocks on acquire().',
    },
    {
      actor: 'Thread 2',
      action: 'acquire(mutex) -> BLOCKED',
      regA: '5',
      regB: 'waiting',
      mem: 5,
      note: 'Mutual Exclusion enforced: T2 cannot enter the Critical Section until T1 calls release().',
    },
    {
      actor: 'Thread 1',
      action: 'ADD regA = 6; STORE 6; release(mutex)',
      regA: '6',
      regB: 'woken',
      mem: 6,
      note: 'T1 safely writes 6 and releases the Mutex, waking Thread 2.',
    },
    {
      actor: 'Thread 2',
      action: 'acquire() -> LOAD 6 -> STORE 7 -> release()',
      regA: '6',
      regB: '7',
      mem: 7,
      note: 'SUCCESS: T2 reads the up-to-date 6 and stores 7. Zero lost updates.',
    },
  ];

  const activeRaceTrace = mutexEnabled ? raceTraceSafe : raceTraceUnsafe;
  const currentRace = activeRaceTrace[raceStep];

  const dlTraceCircular = [
    {
      p1Holds: 'None',
      p1Waits: 'None',
      p2Holds: 'None',
      p2Waits: 'None',
      deadlocked: false,
      note: 'Both resources (Lock A, Lock B) are currently free. P1 acquires A first; P2 acquires B first.',
    },
    {
      p1Holds: 'Lock A',
      p1Waits: 'None',
      p2Holds: 'Lock B',
      p2Waits: 'None',
      deadlocked: false,
      note: 'Hold and Wait setup: P1 holds Lock A, while P2 concurrently holds Lock B.',
    },
    {
      p1Holds: 'Lock A',
      p1Waits: 'Lock B',
      p2Holds: 'Lock B',
      p2Waits: 'Lock A',
      deadlocked: true,
      note: 'DEADLOCK (Circular Wait): P1 waits for Lock B (held by P2) while P2 waits for Lock A (held by P1). Neither can ever proceed.',
    },
  ];

  const dlTraceOrdered = [
    {
      p1Holds: 'None',
      p1Waits: 'None',
      p2Holds: 'None',
      p2Waits: 'None',
      deadlocked: false,
      note: 'Global Lock Ordering enabled: every thread MUST acquire Lock A before Lock B.',
    },
    {
      p1Holds: 'Lock A',
      p1Waits: 'None',
      p2Holds: 'None',
      p2Waits: 'Lock A (Queued)',
      deadlocked: false,
      note: 'P1 acquires Lock A. P2 requests Lock A first (not Lock B) and waits cleanly without holding anything.',
    },
    {
      p1Holds: 'Releases A & B',
      p1Waits: 'Done',
      p2Holds: 'Lock A -> Lock B',
      p2Waits: 'None',
      deadlocked: false,
      note: 'NO DEADLOCK: P1 finishes and releases A and B; P2 acquires A then B in order. Circular Wait is broken.',
    },
  ];

  const activeDlTrace = orderedLocks ? dlTraceOrdered : dlTraceCircular;
  const currentDl = activeDlTrace[dlStep];

  return (
    <div className="space-y-5">
      <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
        <button
          type="button"
          onClick={() => setTab('race')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            tab === 'race' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Critical Section &amp; Race Condition Lab
        </button>
        <button
          type="button"
          onClick={() => setTab('deadlock')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            tab === 'deadlock'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Deadlock &amp; Resource Allocation Graph
        </button>
      </div>

      {tab === 'race' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Stage */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs font-medium text-slate-500">Shared Memory Counter</p>
                <h4 className="text-base font-semibold text-slate-900 font-mono tabular-nums">
                  counter = {currentRace.mem} (Expected after 2 runs: 7)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMutexEnabled((v) => !v);
                  setRaceStep(0);
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  mutexEnabled
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-rose-50 text-rose-900 border-rose-300'
                }`}
              >
                {mutexEnabled ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                {mutexEnabled ? 'Mutex Lock: ON' : 'Mutex Lock: OFF'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-slate-500 font-sans">Thread 1 Register</p>
                <p className="text-base font-semibold text-slate-900 mt-1 tabular-nums">
                  regA = {currentRace.regA}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-slate-500 font-sans">Shared RAM</p>
                <p className="text-base font-semibold text-sky-800 mt-1 tabular-nums">
                  counter = {currentRace.mem}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-slate-500 font-sans">Thread 2 Register</p>
                <p className="text-base font-semibold text-slate-900 mt-1 tabular-nums">
                  regB = {currentRace.regB}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs">
              [{currentRace.actor}] {currentRace.action}
            </div>
          </div>

          {/* Control Deck */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-600 tabular-nums">
                Step {raceStep + 1} of {activeRaceTrace.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRaceStep(0)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setRaceStep((s) => (s + 1) % activeRaceTrace.length)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-700 rounded-lg hover:bg-sky-800"
                >
                  <StepForward className="w-3.5 h-3.5" />
                  {raceStep === activeRaceTrace.length - 1 ? 'Restart' : 'Next Step'}
                </button>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border text-sm leading-relaxed ${
                raceStep === activeRaceTrace.length - 1 && !mutexEnabled
                  ? 'bg-rose-50 border-rose-300 text-rose-950'
                  : raceStep === activeRaceTrace.length - 1 && mutexEnabled
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              {currentRace.note}
            </div>
          </div>
        </div>
      ) : (
        /* Deadlock RAG Explorer */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs font-medium text-slate-500">Resource Allocation Graph</p>
                <h4 className="text-base font-semibold text-slate-900">
                  {currentDl.deadlocked ? 'Cycle Detected — Deadlocked' : 'System State — Running'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOrderedLocks((v) => !v);
                  setDlStep(0);
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  orderedLocks
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-amber-50 text-amber-900 border-amber-300'
                }`}
              >
                {orderedLocks ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5" />
                )}
                {orderedLocks ? 'Prevention: Resource Ordering ON' : 'Prevention: OFF (Unordered)'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <p className="font-sans text-sm font-semibold text-slate-900">Process P1</p>
                <p className="text-slate-700">Holds: {currentDl.p1Holds}</p>
                <p className={currentDl.deadlocked ? 'text-rose-700 font-semibold' : 'text-slate-700'}>
                  Waiting For: {currentDl.p1Waits}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <p className="font-sans text-sm font-semibold text-slate-900">Process P2</p>
                <p className="text-slate-700">Holds: {currentDl.p2Holds}</p>
                <p className={currentDl.deadlocked ? 'text-rose-700 font-semibold' : 'text-slate-700'}>
                  Waiting For: {currentDl.p2Waits}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-600 tabular-nums">
                Step {dlStep + 1} of {activeDlTrace.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDlStep(0)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setDlStep((s) => (s + 1) % activeDlTrace.length)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-700 rounded-lg hover:bg-sky-800"
                >
                  <StepForward className="w-3.5 h-3.5" />
                  {dlStep === activeDlTrace.length - 1 ? 'Restart' : 'Next Step'}
                </button>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border text-sm leading-relaxed ${
                currentDl.deadlocked
                  ? 'bg-rose-50 border-rose-300 text-rose-950'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              {currentDl.note}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
