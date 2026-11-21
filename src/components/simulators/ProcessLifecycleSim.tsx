import React, { useState } from 'react';
import { Play, Pause, HardDrive, CheckCircle2, Plus, RotateCcw, Layers, Cpu } from 'lucide-react';

type ProcessState = 'New' | 'Ready' | 'Running' | 'Waiting' | 'Terminated';

interface SimProcess {
  pid: number;
  name: string;
  state: ProcessState;
  pc: number;
  registers: string;
  priority: number;
}

const INITIAL_PROCESSES: SimProcess[] = [
  { pid: 101, name: 'browser_tab', state: 'Running', pc: 0x04a2, registers: 'AX=14, SP=7F00', priority: 2 },
  { pid: 102, name: 'compiler_cc', state: 'Ready', pc: 0x01c8, registers: 'AX=08, SP=6A10', priority: 1 },
  { pid: 103, name: 'file_indexer', state: 'Waiting', pc: 0x0890, registers: 'AX=00, SP=5C40', priority: 3 },
];

export const ProcessLifecycleSim: React.FC = () => {
  const [processes, setProcesses] = useState<SimProcess[]>(INITIAL_PROCESSES);
  const [selectedPid, setSelectedPid] = useState<number>(101);
  const [viewMode, setViewMode] = useState<'lifecycle' | 'threads'>('lifecycle');
  const [lastEvent, setLastEvent] = useState<string>(
    'PID 101 (browser_tab) is currently executing on the CPU core.'
  );
  const [nextPid, setNextPid] = useState<number>(104);

  const selectedProc = processes.find((p) => p.pid === selectedPid) || processes[0];
  const runningProc = processes.find((p) => p.state === 'Running');

  const spawnProcess = () => {
    const newProc: SimProcess = {
      pid: nextPid,
      name: `worker_${nextPid}`,
      state: 'New',
      pc: 0x0000,
      registers: 'AX=00, SP=8000',
      priority: 2,
    };
    setProcesses((prev) => [...prev, newProc]);
    setSelectedPid(nextPid);
    setNextPid((n) => n + 1);
    setLastEvent(`Created PID ${newProc.pid} in New state. Admit it to the Ready Queue next.`);
  };

  const admitProcess = (pid: number) => {
    setProcesses((prev) =>
      prev.map((p) => (p.pid === pid && p.state === 'New' ? { ...p, state: 'Ready' } : p))
    );
    setLastEvent(`Admitted PID ${pid}: New -> Ready Queue.`);
  };

  const dispatchProcess = (pid: number) => {
    setProcesses((prev) =>
      prev.map((p) => {
        if (p.pid === pid && p.state === 'Ready') {
          return { ...p, state: 'Running', pc: p.pc + 4 };
        }
        if (p.state === 'Running' && p.pid !== pid) {
          return { ...p, state: 'Ready' };
        }
        return p;
      })
    );
    setLastEvent(
      `Context Switch: Saved outgoing PCB and dispatched PID ${pid} from Ready -> Running.`
    );
  };

  const triggerIoWait = (pid: number) => {
    setProcesses((prev) =>
      prev.map((p) => (p.pid === pid && p.state === 'Running' ? { ...p, state: 'Waiting' } : p))
    );
    setLastEvent(`PID ${pid} requested disk I/O: Running -> Waiting. CPU is now free.`);
  };

  const completeIo = (pid: number) => {
    setProcesses((prev) =>
      prev.map((p) => (p.pid === pid && p.state === 'Waiting' ? { ...p, state: 'Ready' } : p))
    );
    setLastEvent(`I/O Interrupt completed for PID ${pid}: Waiting -> Ready Queue.`);
  };

  const preemptRunning = (pid: number) => {
    setProcesses((prev) =>
      prev.map((p) => (p.pid === pid && p.state === 'Running' ? { ...p, state: 'Ready', pc: p.pc + 8 } : p))
    );
    setLastEvent(`Timer Interrupt expired for PID ${pid}: Running -> Ready Queue.`);
  };

  const terminateProcess = (pid: number) => {
    setProcesses((prev) =>
      prev.map((p) => (p.pid === pid && p.state === 'Running' ? { ...p, state: 'Terminated' } : p))
    );
    setLastEvent(`PID ${pid} called exit(): Running -> Terminated.`);
  };

  const resetAll = () => {
    setProcesses(INITIAL_PROCESSES);
    setSelectedPid(101);
    setNextPid(104);
    setLastEvent('Reset simulation to initial 3 processes.');
  };

  const states: ProcessState[] = ['New', 'Ready', 'Running', 'Waiting', 'Terminated'];

  return (
    <div className="space-y-5">
      {/* Segmented View Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode('lifecycle')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'lifecycle'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Process States &amp; PCB
          </button>
          <button
            type="button"
            onClick={() => setViewMode('threads')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'threads'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Single vs. Multithreaded Memory
          </button>
        </div>

        {viewMode === 'lifecycle' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={spawnProcess}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-sky-700 rounded-lg hover:bg-sky-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Spawn Process
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        )}
      </div>

      {viewMode === 'lifecycle' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Zone: 5-State Queues Stage (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <p className="text-xs font-medium text-slate-500">Five-State Diagram &amp; Queues</p>
                <h4 className="text-base font-semibold text-slate-900">
                  CPU Core: {runningProc ? `PID ${runningProc.pid} (${runningProc.name})` : 'Idle'}
                </h4>
              </div>
              <span className="text-xs font-mono text-slate-600 tabular-nums">
                Active Processes: {processes.filter((p) => p.state !== 'Terminated').length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {states.map((st) => {
                const items = processes.filter((p) => p.state === st);
                const stateStyle =
                  st === 'Running'
                    ? 'bg-emerald-50/60 border-emerald-300'
                    : st === 'Waiting'
                    ? 'bg-amber-50/60 border-amber-300'
                    : 'bg-slate-50 border-slate-200';
                return (
                  <div key={st} className={`p-3.5 rounded-lg border ${stateStyle} min-h-[118px]`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-900">{st}</span>
                      <span className="text-xs font-mono text-slate-500 tabular-nums">
                        {items.length}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {items.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Empty</p>
                      ) : (
                        items.map((proc) => (
                          <button
                            key={proc.pid}
                            type="button"
                            onClick={() => setSelectedPid(proc.pid)}
                            className={`w-full text-left px-2.5 py-1.5 rounded border text-xs font-mono transition-colors ${
                              selectedPid === proc.pid
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400'
                            }`}
                          >
                            PID {proc.pid} · {proc.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <span className="font-semibold text-slate-900">Kernel Log: </span>
              {lastEvent}
            </div>
          </div>

          {/* Right Zone: Selected PCB Inspector & State Transitions (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            {selectedProc && (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Process Control Block (PCB)</p>
                    <h4 className="text-base font-semibold text-slate-900 font-mono">
                      PID {selectedProc.pid} — {selectedProc.name}
                    </h4>
                  </div>
                  <span className="text-xs font-semibold text-sky-700">{selectedProc.state}</span>
                </div>

                <dl className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <dt className="text-slate-500">Process State</dt>
                    <dd className="mt-1 font-mono font-semibold text-slate-900">{selectedProc.state}</dd>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <dt className="text-slate-500">Program Counter (PC)</dt>
                    <dd className="mt-1 font-mono font-semibold text-slate-900 tabular-nums">
                      0x{selectedProc.pc.toString(16).padStart(4, '0')}
                    </dd>
                  </div>
                  <div className="col-span-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <dt className="text-slate-500">Saved CPU Registers</dt>
                    <dd className="mt-1 font-mono font-semibold text-slate-900">
                      {selectedProc.registers}
                    </dd>
                  </div>
                </dl>

                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <p className="text-xs font-medium text-slate-500">Trigger Valid State Transition</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProc.state === 'New' && (
                      <button
                        type="button"
                        onClick={() => admitProcess(selectedProc.pid)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-sky-700 rounded-lg hover:bg-sky-800 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Admit to Ready
                      </button>
                    )}
                    {selectedProc.state === 'Ready' && (
                      <button
                        type="button"
                        onClick={() => dispatchProcess(selectedProc.pid)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Dispatch to CPU (Context Switch)
                      </button>
                    )}
                    {selectedProc.state === 'Running' && (
                      <>
                        <button
                          type="button"
                          onClick={() => preemptRunning(selectedProc.pid)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-800 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          <Pause className="w-3.5 h-3.5" />
                          Timer Preempt (to Ready)
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerIoWait(selectedProc.pid)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-900 bg-amber-50 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors"
                        >
                          <HardDrive className="w-3.5 h-3.5" />
                          I/O Wait (to Waiting)
                        </button>
                        <button
                          type="button"
                          onClick={() => terminateProcess(selectedProc.pid)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-900 bg-rose-50 border border-rose-300 rounded-lg hover:bg-rose-100 transition-colors"
                        >
                          Exit (Terminate)
                        </button>
                      </>
                    )}
                    {selectedProc.state === 'Waiting' && (
                      <button
                        type="button"
                        onClick={() => completeIo(selectedProc.pid)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-sky-700 rounded-lg hover:bg-sky-800 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Complete I/O Interrupt (to Ready)
                      </button>
                    )}
                    {selectedProc.state === 'Terminated' && (
                      <p className="text-xs text-slate-500">
                        This process has finished execution and awaits parent wait() cleanup.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Threads vs Single-Threaded Process Architectural Comparison */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border border-slate-200 rounded-xl p-6">
          <div className="p-5 rounded-lg bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-slate-700" />
              <h4 className="text-base font-semibold text-slate-900">Single-Threaded Process</h4>
            </div>
            <p className="text-xs text-slate-600">
              One execution path owns its entire Code, Data, Files, Registers, and Stack exclusively.
            </p>
            <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
              <div className="p-2.5 bg-white border border-slate-200 rounded">Code</div>
              <div className="p-2.5 bg-white border border-slate-200 rounded">Data</div>
              <div className="p-2.5 bg-white border border-slate-200 rounded">Files</div>
            </div>
            <div className="p-3 bg-sky-50 border border-sky-200 rounded text-center font-mono text-xs text-sky-900">
              Thread 1: Private Registers + Private Stack + PC
            </div>
          </div>

          <div className="p-5 rounded-lg bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-700" />
              <h4 className="text-base font-semibold text-slate-900">Multithreaded Process (3 Threads)</h4>
            </div>
            <p className="text-xs text-slate-600">
              Sibling threads share Code, Data, and Files directly, while each maintains private Registers &amp; Stack.
            </p>
            <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
              <div className="p-2.5 bg-white border border-slate-200 rounded">Shared Code</div>
              <div className="p-2.5 bg-white border border-slate-200 rounded">Shared Data</div>
              <div className="p-2.5 bg-white border border-slate-200 rounded">Shared Files</div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs text-sky-900">
              <div className="p-2.5 bg-sky-50 border border-sky-200 rounded">T1 Regs &amp; Stack</div>
              <div className="p-2.5 bg-sky-50 border border-sky-200 rounded">T2 Regs &amp; Stack</div>
              <div className="p-2.5 bg-sky-50 border border-sky-200 rounded">T3 Regs &amp; Stack</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
