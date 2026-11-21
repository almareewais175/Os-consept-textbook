import React, { useMemo, useState } from 'react';
import { Play, RotateCcw, Plus, Trash2 } from 'lucide-react';

type Algorithm = 'FCFS' | 'SJF' | 'SRTF' | 'RR' | 'PRIORITY';

interface JobInput {
  id: string;
  arrival: number;
  burst: number;
  priority: number;
}

interface GanttSlice {
  id: string;
  start: number;
  end: number;
}

interface JobMetric {
  id: string;
  arrival: number;
  burst: number;
  priority: number;
  completion: number;
  turnaround: number;
  waiting: number;
  response: number;
}

const DEFAULT_JOBS: JobInput[] = [
  { id: 'P1', arrival: 0, burst: 8, priority: 2 },
  { id: 'P2', arrival: 1, burst: 4, priority: 1 },
  { id: 'P3', arrival: 2, burst: 9, priority: 3 },
  { id: 'P4', arrival: 3, burst: 5, priority: 2 },
];

const JOB_COLORS: Record<string, string> = {
  P1: 'bg-sky-600 text-white',
  P2: 'bg-emerald-600 text-white',
  P3: 'bg-amber-600 text-white',
  P4: 'bg-indigo-600 text-white',
  P5: 'bg-rose-600 text-white',
  IDLE: 'bg-slate-200 text-slate-600',
};

function simulateSchedule(
  jobs: JobInput[],
  algo: Algorithm,
  quantum: number
): { slices: GanttSlice[]; metrics: JobMetric[] } {
  if (jobs.length === 0) return { slices: [], metrics: [] };

  const n = jobs.length;
  const remaining = jobs.map((j) => j.burst);
  const firstRun = new Array(n).fill(-1);
  const completion = new Array(n).fill(0);
  const timeline: string[] = [];

  let time = 0;
  let completed = 0;
  const rrQueue: number[] = [];
  const inQueue = new Array(n).fill(false);
  let rrCurrent = -1;
  let rrSliceUsed = 0;

  while (completed < n && time < 200) {
    // Enqueue newly arrived processes for RR
    for (let i = 0; i < n; i++) {
      if (jobs[i].arrival <= time && remaining[i] > 0 && !inQueue[i] && i !== rrCurrent) {
        rrQueue.push(i);
        inQueue[i] = true;
      }
    }

    let chosen = -1;

    if (algo === 'FCFS') {
      let bestArr = Infinity;
      for (let i = 0; i < n; i++) {
        if (jobs[i].arrival <= time && remaining[i] > 0) {
          if (jobs[i].arrival < bestArr) {
            bestArr = jobs[i].arrival;
            chosen = i;
          }
        }
      }
    } else if (algo === 'SJF') {
      // Non-preemptive SJF: keep running current if not finished
      if (timeline.length > 0) {
        const lastId = timeline[timeline.length - 1];
        const lastIdx = jobs.findIndex((j) => j.id === lastId);
        if (lastIdx !== -1 && remaining[lastIdx] > 0) {
          chosen = lastIdx;
        }
      }
      if (chosen === -1) {
        let bestBurst = Infinity;
        for (let i = 0; i < n; i++) {
          if (jobs[i].arrival <= time && remaining[i] > 0 && jobs[i].burst < bestBurst) {
            bestBurst = jobs[i].burst;
            chosen = i;
          }
        }
      }
    } else if (algo === 'SRTF') {
      let bestRem = Infinity;
      for (let i = 0; i < n; i++) {
        if (jobs[i].arrival <= time && remaining[i] > 0 && remaining[i] < bestRem) {
          bestRem = remaining[i];
          chosen = i;
        }
      }
    } else if (algo === 'PRIORITY') {
      // Lower number = higher priority, non-preemptive
      if (timeline.length > 0) {
        const lastId = timeline[timeline.length - 1];
        const lastIdx = jobs.findIndex((j) => j.id === lastId);
        if (lastIdx !== -1 && remaining[lastIdx] > 0) {
          chosen = lastIdx;
        }
      }
      if (chosen === -1) {
        let bestPri = Infinity;
        for (let i = 0; i < n; i++) {
          if (jobs[i].arrival <= time && remaining[i] > 0 && jobs[i].priority < bestPri) {
            bestPri = jobs[i].priority;
            chosen = i;
          }
        }
      }
    } else if (algo === 'RR') {
      if (rrCurrent === -1 && rrQueue.length > 0) {
        rrCurrent = rrQueue.shift()!;
        inQueue[rrCurrent] = false;
        rrSliceUsed = 0;
      }
      chosen = rrCurrent;
    }

    if (chosen === -1) {
      timeline.push('IDLE');
      time++;
      continue;
    }

    if (firstRun[chosen] === -1) {
      firstRun[chosen] = time;
    }

    timeline.push(jobs[chosen].id);
    remaining[chosen]--;
    time++;

    if (algo === 'RR') {
      rrSliceUsed++;
      // Check arrivals at exact end of this tick before re-queuing
      for (let i = 0; i < n; i++) {
        if (jobs[i].arrival <= time && remaining[i] > 0 && !inQueue[i] && i !== rrCurrent) {
          rrQueue.push(i);
          inQueue[i] = true;
        }
      }
      if (remaining[chosen] === 0) {
        completion[chosen] = time;
        completed++;
        rrCurrent = -1;
        rrSliceUsed = 0;
      } else if (rrSliceUsed >= quantum) {
        rrQueue.push(chosen);
        inQueue[chosen] = true;
        rrCurrent = -1;
        rrSliceUsed = 0;
      }
    } else if (remaining[chosen] === 0) {
      completion[chosen] = time;
      completed++;
    }
  }

  // Merge adjacent timeline slots into Gantt slices
  const slices: GanttSlice[] = [];
  for (let t = 0; t < timeline.length; t++) {
    const id = timeline[t];
    if (slices.length > 0 && slices[slices.length - 1].id === id) {
      slices[slices.length - 1].end = t + 1;
    } else {
      slices.push({ id, start: t, end: t + 1 });
    }
  }

  const metrics: JobMetric[] = jobs.map((j, idx) => {
    const turnaround = completion[idx] - j.arrival;
    const waiting = turnaround - j.burst;
    const response = firstRun[idx] - j.arrival;
    return {
      id: j.id,
      arrival: j.arrival,
      burst: j.burst,
      priority: j.priority,
      completion: completion[idx],
      turnaround,
      waiting,
      response,
    };
  });

  return { slices, metrics };
}

export const CpuSchedulingSim: React.FC = () => {
  const [jobs, setJobs] = useState<JobInput[]>(DEFAULT_JOBS);
  const [algo, setAlgo] = useState<Algorithm>('RR');
  const [quantum, setQuantum] = useState<number>(3);
  const [revealLimit, setRevealLimit] = useState<number | null>(null);

  const { slices, metrics } = useMemo(
    () => simulateSchedule(jobs, algo, quantum),
    [jobs, algo, quantum]
  );

  const totalTime = slices.length > 0 ? slices[slices.length - 1].end : 1;
  const visibleTime = revealLimit === null ? totalTime : Math.min(revealLimit, totalTime);

  const avgTurnaround =
    metrics.length > 0
      ? (metrics.reduce((acc, m) => acc + m.turnaround, 0) / metrics.length).toFixed(2)
      : '0.00';
  const avgWaiting =
    metrics.length > 0
      ? (metrics.reduce((acc, m) => acc + m.waiting, 0) / metrics.length).toFixed(2)
      : '0.00';
  const avgResponse =
    metrics.length > 0
      ? (metrics.reduce((acc, m) => acc + m.response, 0) / metrics.length).toFixed(2)
      : '0.00';

  const updateJob = (idx: number, field: 'arrival' | 'burst' | 'priority', val: number) => {
    const clamped =
      field === 'burst' ? Math.max(1, Math.min(20, val)) : Math.max(0, Math.min(15, val));
    setJobs((prev) => prev.map((j, i) => (i === idx ? { ...j, [field]: clamped } : j)));
    setRevealLimit(null);
  };

  const addJob = () => {
    if (jobs.length >= 5) return;
    const nextId = `P${jobs.length + 1}`;
    setJobs((prev) => [...prev, { id: nextId, arrival: 4, burst: 4, priority: 2 }]);
    setRevealLimit(null);
  };

  const removeLastJob = () => {
    if (jobs.length <= 2) return;
    setJobs((prev) => prev.slice(0, -1));
    setRevealLimit(null);
  };

  const stepTimeline = () => {
    setRevealLimit((prev) => {
      if (prev === null) return 1;
      if (prev >= totalTime) return null;
      return prev + 1;
    });
  };

  return (
    <div className="space-y-6">
      {/* Controls Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
          {(['FCFS', 'SJF', 'SRTF', 'RR', 'PRIORITY'] as Algorithm[]).map((alg) => (
            <button
              key={alg}
              type="button"
              onClick={() => {
                setAlgo(alg);
                setRevealLimit(null);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                algo === alg
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {alg === 'PRIORITY' ? 'Priority' : alg}
            </button>
          ))}
        </div>

        {algo === 'RR' && (
          <label className="flex items-center gap-3 text-xs font-medium text-slate-700">
            <span className="whitespace-nowrap">Time Quantum (q):</span>
            <input
              type="range"
              min={1}
              max={6}
              value={quantum}
              onChange={(e) => {
                setQuantum(Number(e.target.value));
                setRevealLimit(null);
              }}
              className="accent-sky-700"
            />
            <span className="font-mono font-semibold text-slate-900 tabular-nums w-10">
              {quantum} ms
            </span>
          </label>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={stepTimeline}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-sky-700 rounded-lg hover:bg-sky-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Play className="w-3.5 h-3.5" />
            {revealLimit === null ? 'Step from t=0' : revealLimit < totalTime ? `Step (t=${revealLimit})` : 'Show Full'}
          </button>
          <button
            type="button"
            onClick={() => {
              setJobs(DEFAULT_JOBS);
              setRevealLimit(null);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Live Gantt Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-slate-500">CPU Dispatch Timeline</p>
            <h4 className="text-base font-semibold text-slate-900">
              Gantt Chart — {algo} {algo === 'RR' ? `(q = ${quantum} ms)` : ''}
            </h4>
          </div>
          <span className="font-mono text-xs text-slate-600 tabular-nums">
            Total Time: {visibleTime} / {totalTime} ms
          </span>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="min-w-[540px]">
            <div className="flex h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
              {slices.map((slice, idx) => {
                if (slice.start >= visibleTime) return null;
                const clampedEnd = Math.min(slice.end, visibleTime);
                const widthPct = ((clampedEnd - slice.start) / totalTime) * 100;
                return (
                  <div
                    key={`${slice.id}-${idx}`}
                    style={{ width: `${widthPct}%` }}
                    className={`flex flex-col items-center justify-center border-r border-white/30 text-xs font-mono font-semibold tabular-nums transition-opacity ${
                      JOB_COLORS[slice.id] || 'bg-slate-700 text-white'
                    }`}
                  >
                    <span>{slice.id}</span>
                    <span className="text-[10px] opacity-85 font-normal">
                      {slice.start}–{clampedEnd}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500">Avg Turnaround Time</p>
            <p className="text-lg font-semibold font-mono text-slate-900 tabular-nums mt-0.5">
              {avgTurnaround} ms
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500">Avg Waiting Time</p>
            <p className="text-lg font-semibold font-mono text-slate-900 tabular-nums mt-0.5">
              {avgWaiting} ms
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500">Avg Response Time</p>
            <p className="text-lg font-semibold font-mono text-slate-900 tabular-nums mt-0.5">
              {avgResponse} ms
            </p>
          </div>
        </div>
      </div>

      {/* Editable Process Table & Computed Metrics */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-slate-900">
            Process Workload &amp; Per-Process Metrics
          </h4>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={addJob}
              disabled={jobs.length >= 5}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Process
            </button>
            <button
              type="button"
              onClick={removeLastJob}
              disabled={jobs.length <= 2}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono tabular-nums">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-3 font-medium">Process</th>
                <th className="py-2 px-3 font-medium">Arrival (ms)</th>
                <th className="py-2 px-3 font-medium">Burst (ms)</th>
                <th className="py-2 px-3 font-medium">Priority (1=High)</th>
                <th className="py-2 px-3 font-medium">Completion</th>
                <th className="py-2 px-3 font-medium">Turnaround</th>
                <th className="py-2 pl-3 font-medium">Waiting</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job, idx) => {
                const m = metrics[idx];
                return (
                  <tr key={job.id}>
                    <td className="py-2.5 pr-3 font-semibold text-slate-900">{job.id}</td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min={0}
                        max={15}
                        value={job.arrival}
                        onChange={(e) => updateJob(idx, 'arrival', Number(e.target.value))}
                        className="w-14 px-2 py-1 border border-slate-300 rounded bg-white text-slate-900"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={job.burst}
                        onChange={(e) => updateJob(idx, 'burst', Number(e.target.value))}
                        className="w-14 px-2 py-1 border border-slate-300 rounded bg-white text-slate-900"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={job.priority}
                        onChange={(e) => updateJob(idx, 'priority', Number(e.target.value))}
                        className="w-14 px-2 py-1 border border-slate-300 rounded bg-white text-slate-900"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{m?.completion ?? 0} ms</td>
                    <td className="py-2.5 px-3 text-slate-700">{m?.turnaround ?? 0} ms</td>
                    <td className="py-2.5 pl-3 font-semibold text-sky-800">{m?.waiting ?? 0} ms</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
