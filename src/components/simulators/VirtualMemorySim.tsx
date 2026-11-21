import React, { useMemo, useState } from 'react';
import { CheckCircle2, AlertTriangle, RotateCcw, StepForward } from 'lucide-react';

type ReplAlgo = 'FIFO' | 'LRU' | 'OPTIMAL';

interface StepRecord {
  refPage: number;
  frames: (number | null)[];
  hit: boolean;
  evicted: number | null;
}

const PRESETS: Record<string, { label: string; sequence: string }> = {
  silberschatz: {
    label: 'Silberschatz Classic',
    sequence: '7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1',
  },
  belady: {
    label: 'Belady Anomaly (Try 3 vs 4 Frames in FIFO)',
    sequence: '1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5',
  },
};

function runPageReplacement(pages: number[], frameCount: number, algo: ReplAlgo): StepRecord[] {
  const frames: (number | null)[] = new Array(frameCount).fill(null);
  const loadedAt: number[] = new Array(frameCount).fill(-1);
  const lastUsedAt: number[] = new Array(frameCount).fill(-1);
  const records: StepRecord[] = [];

  pages.forEach((page, step) => {
    const hitIndex = frames.indexOf(page);
    if (hitIndex !== -1) {
      lastUsedAt[hitIndex] = step;
      records.push({
        refPage: page,
        frames: [...frames],
        hit: true,
        evicted: null,
      });
      return;
    }

    // Page Fault
    const emptyIdx = frames.indexOf(null);
    if (emptyIdx !== -1) {
      frames[emptyIdx] = page;
      loadedAt[emptyIdx] = step;
      lastUsedAt[emptyIdx] = step;
      records.push({
        refPage: page,
        frames: [...frames],
        hit: false,
        evicted: null,
      });
      return;
    }

    // Need to evict a victim frame
    let victimIdx = 0;
    if (algo === 'FIFO') {
      let oldest = Infinity;
      for (let i = 0; i < frameCount; i++) {
        if (loadedAt[i] < oldest) {
          oldest = loadedAt[i];
          victimIdx = i;
        }
      }
    } else if (algo === 'LRU') {
      let leastRecent = Infinity;
      for (let i = 0; i < frameCount; i++) {
        if (lastUsedAt[i] < leastRecent) {
          leastRecent = lastUsedAt[i];
          victimIdx = i;
        }
      }
    } else if (algo === 'OPTIMAL') {
      let farthestNext = -1;
      for (let i = 0; i < frameCount; i++) {
        const nextUse = pages.slice(step + 1).indexOf(frames[i]!);
        if (nextUse === -1) {
          victimIdx = i;
          break;
        }
        if (nextUse > farthestNext) {
          farthestNext = nextUse;
          victimIdx = i;
        }
      }
    }

    const evicted = frames[victimIdx];
    frames[victimIdx] = page;
    loadedAt[victimIdx] = step;
    lastUsedAt[victimIdx] = step;

    records.push({
      refPage: page,
      frames: [...frames],
      hit: false,
      evicted,
    });
  });

  return records;
}

export const VirtualMemorySim: React.FC = () => {
  const [algo, setAlgo] = useState<ReplAlgo>('LRU');
  const [frameCount, setFrameCount] = useState<number>(3);
  const [seqText, setSeqText] = useState<string>(PRESETS.silberschatz.sequence);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const pages = useMemo(() => {
    return seqText
      .split(/[\s,]+/)
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n) && n >= 0 && n <= 99)
      .slice(0, 24);
  }, [seqText]);

  const records = useMemo(
    () => runPageReplacement(pages, frameCount, algo),
    [pages, frameCount, algo]
  );

  const visibleCount = activeStep === null ? records.length : Math.min(activeStep, records.length);
  const visibleRecords = records.slice(0, visibleCount);
  const faults = visibleRecords.filter((r) => !r.hit).length;
  const hits = visibleRecords.filter((r) => r.hit).length;
  const faultRate = visibleCount > 0 ? ((faults / visibleCount) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-5">
      {/* Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            {(['FIFO', 'LRU', 'OPTIMAL'] as ReplAlgo[]).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => {
                  setAlgo(a);
                  setActiveStep(null);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  algo === a
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {a}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-3 text-xs font-medium text-slate-700">
            <span>Physical Frames:</span>
            <input
              type="range"
              min={2}
              max={5}
              value={frameCount}
              onChange={(e) => {
                setFrameCount(Number(e.target.value));
                setActiveStep(null);
              }}
              className="accent-sky-700"
            />
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              {frameCount} Frames
            </span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setActiveStep((prev) =>
                  prev === null ? 1 : prev < records.length ? prev + 1 : null
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-sky-700 rounded-lg hover:bg-sky-800 whitespace-nowrap shrink-0"
            >
              <StepForward className="w-3.5 h-3.5" />
              {activeStep === null
                ? 'Step from Ref #1'
                : activeStep < records.length
                ? `Step (${activeStep}/${records.length})`
                : 'Show Full Trace'}
            </button>
            <button
              type="button"
              onClick={() => {
                setSeqText(PRESETS.silberschatz.sequence);
                setActiveStep(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200">
          <span className="text-xs font-medium text-slate-600">Reference String:</span>
          <input
            type="text"
            value={seqText}
            onChange={(e) => {
              setSeqText(e.target.value);
              setActiveStep(null);
            }}
            className="flex-1 min-w-[220px] px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-slate-50 text-slate-900"
            aria-label="Page reference string"
          />
          <button
            type="button"
            onClick={() => {
              setSeqText(PRESETS.belady.sequence);
              setAlgo('FIFO');
              setActiveStep(null);
            }}
            className="px-3 py-1.5 text-xs font-medium text-sky-800 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 whitespace-nowrap"
          >
            Load Belady’s Anomaly Preset
          </button>
        </div>
      </div>

      {/* Frame Replacement Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200">
            <p className="text-xs text-rose-800 font-medium">Total Page Faults</p>
            <p className="text-lg font-semibold font-mono text-rose-950 tabular-nums mt-0.5">
              {faults} Faults
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200">
            <p className="text-xs text-emerald-800 font-medium">Total Page Hits</p>
            <p className="text-lg font-semibold font-mono text-emerald-950 tabular-nums mt-0.5">
              {hits} Hits
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-600 font-medium">Page Fault Rate</p>
            <p className="text-lg font-semibold font-mono text-slate-900 tabular-nums mt-0.5">
              {faultRate}%
            </p>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <table className="w-full border-collapse text-center font-mono text-xs tabular-nums">
            <thead>
              <tr>
                <th className="p-2 text-left text-slate-500 font-sans border-b border-slate-200 sticky left-0 bg-white">
                  Ref Page
                </th>
                {visibleRecords.map((rec, idx) => (
                  <th
                    key={idx}
                    className="p-2 border-b border-slate-200 font-semibold text-slate-900 min-w-[44px]"
                  >
                    {rec.refPage}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: frameCount }).map((_, fIdx) => (
                <tr key={fIdx} className="border-b border-slate-100">
                  <td className="p-2 text-left text-slate-500 font-sans sticky left-0 bg-white">
                    Frame {fIdx}
                  </td>
                  {visibleRecords.map((rec, stepIdx) => {
                    const val = rec.frames[fIdx];
                    const isActive = val === rec.refPage;
                    return (
                      <td
                        key={stepIdx}
                        className={`p-2 border-l border-slate-100 ${
                          isActive && !rec.hit
                            ? 'bg-sky-50 text-sky-900 font-semibold'
                            : isActive && rec.hit
                            ? 'bg-emerald-50 text-emerald-900 font-semibold'
                            : 'text-slate-700'
                        }`}
                      >
                        {val === null ? '—' : val}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <td className="p-2 text-left text-slate-500 font-sans sticky left-0 bg-white">
                  Status
                </td>
                {visibleRecords.map((rec, idx) => (
                  <td key={idx} className="p-2 border-l border-slate-100">
                    {rec.hit ? (
                      <span
                        title="Page Hit"
                        className="inline-flex items-center gap-0.5 text-emerald-700 font-sans font-semibold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        H
                      </span>
                    ) : (
                      <span
                        title={
                          rec.evicted !== null
                            ? `Page Fault (Evicted ${rec.evicted})`
                            : 'Page Fault (Empty Frame)'
                        }
                        className="inline-flex items-center gap-0.5 text-rose-700 font-sans font-semibold"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        F
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
