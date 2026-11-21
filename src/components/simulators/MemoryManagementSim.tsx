import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, RotateCcw, Plus, Trash2 } from 'lucide-react';

interface BlockSegment {
  id: string;
  size: number;
  free: boolean;
}

const INITIAL_SEGMENTS: BlockSegment[] = [
  { id: 'OS', size: 40, free: false },
  { id: 'Hole 1', size: 100, free: true },
  { id: 'P1', size: 60, free: false },
  { id: 'Hole 2', size: 220, free: true },
  { id: 'P2', size: 50, free: false },
  { id: 'Hole 3', size: 130, free: true },
];

const PAGE_SIZE = 4096; // 4 KB
const PAGE_TABLE: Record<number, number> = {
  0: 5,
  1: 2,
  2: 9,
  3: 1,
  4: 7,
};
const TLB_ENTRIES: Record<number, number> = {
  0: 5,
  2: 9,
};

export const MemoryManagementSim: React.FC = () => {
  const [tab, setTab] = useState<'paging' | 'contiguous'>('paging');

  // Paging state
  const [logicalAddr, setLogicalAddr] = useState<number>(8500);

  // Contiguous allocation state
  const [strategy, setStrategy] = useState<'first' | 'best' | 'worst'>('best');
  const [reqSize, setReqSize] = useState<number>(90);
  const [segments, setSegments] = useState<BlockSegment[]>(INITIAL_SEGMENTS);
  const [procCounter, setProcCounter] = useState<number>(3);
  const [allocMessage, setAllocMessage] = useState<string>(
    'Select an allocation strategy and click Allocate to compare how holes are chosen.'
  );

  const pageNum = Math.floor(logicalAddr / PAGE_SIZE);
  const offset = logicalAddr % PAGE_SIZE;
  const inTlb = pageNum in TLB_ENTRIES;
  const frameNum = PAGE_TABLE[pageNum];
  const validPage = frameNum !== undefined;
  const physicalAddr = validPage ? frameNum * PAGE_SIZE + offset : null;

  const totalRam = segments.reduce((s, b) => s + b.size, 0);

  const allocateBlock = () => {
    const freeIndices = segments
      .map((seg, idx) => ({ seg, idx }))
      .filter((item) => item.seg.free && item.seg.size >= reqSize);

    if (freeIndices.length === 0) {
      setAllocMessage(
        `Allocation failed for ${reqSize} KB: Total free RAM may suffice, but no single contiguous hole is large enough (External Fragmentation).`
      );
      return;
    }

    let chosen = freeIndices[0];
    if (strategy === 'best') {
      chosen = freeIndices.reduce((best, curr) =>
        curr.seg.size < best.seg.size ? curr : best
      );
    } else if (strategy === 'worst') {
      chosen = freeIndices.reduce((worst, curr) =>
        curr.seg.size > worst.seg.size ? curr : worst
      );
    }

    const newLabel = `P${procCounter}`;
    const leftover = chosen.seg.size - reqSize;
    const updated: BlockSegment[] = [];

    segments.forEach((seg, idx) => {
      if (idx === chosen.idx) {
        updated.push({ id: newLabel, size: reqSize, free: false });
        if (leftover > 0) {
          updated.push({ id: `Hole`, size: leftover, free: true });
        }
      } else {
        updated.push(seg);
      }
    });

    setSegments(updated);
    setProcCounter((c) => c + 1);
    setAllocMessage(
      `${strategy.toUpperCase()}-Fit placed ${newLabel} (${reqSize} KB) into ${chosen.seg.size} KB hole, leaving ${leftover} KB.`
    );
  };

  const freeProcess = (idx: number) => {
    setSegments((prev) => {
      const next = prev.map((s, i) => (i === idx ? { ...s, id: 'Hole', free: true } : s));
      // Coalesce adjacent holes
      const coalesced: BlockSegment[] = [];
      for (const seg of next) {
        const last = coalesced[coalesced.length - 1];
        if (seg.free && last && last.free) {
          last.size += seg.size;
        } else {
          coalesced.push({ ...seg });
        }
      }
      return coalesced;
    });
    setAllocMessage('Freed block and coalesced any adjacent free holes.');
  };

  return (
    <div className="space-y-5">
      <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
        <button
          type="button"
          onClick={() => setTab('paging')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            tab === 'paging'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Paging &amp; TLB Address Translator
        </button>
        <button
          type="button"
          onClick={() => setTab('contiguous')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            tab === 'contiguous'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Contiguous Allocation (First / Best / Worst Fit)
        </button>
      </div>

      {tab === 'paging' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Stage: Address Breakdown & Hardware Lookup */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <p className="text-xs font-medium text-slate-500">Page Size = 4,096 Bytes (4 KB)</p>
                <h4 className="text-base font-semibold text-slate-900">
                  MMU Logical-to-Physical Translation
                </h4>
              </div>
              {validPage ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4" />
                  {inTlb ? 'TLB HIT (1 Cycle)' : 'TLB MISS -> Page Table Hit'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700">
                  <AlertCircle className="w-4 h-4" />
                  PAGE NOT MAPPED (Page &gt; 4)
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 text-center font-mono">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500 font-sans">Logical Address</p>
                <p className="text-lg font-semibold text-slate-900 mt-1 tabular-nums">
                  {logicalAddr}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-sky-50 border border-sky-200">
                <p className="text-xs text-sky-800 font-sans">Page Number (p)</p>
                <p className="text-lg font-semibold text-sky-900 mt-1 tabular-nums">{pageNum}</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500 font-sans">Offset (d)</p>
                <p className="text-lg font-semibold text-slate-900 mt-1 tabular-nums">{offset}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                <p className="text-xs font-semibold text-slate-900 mb-2">TLB Cache (Fast)</p>
                <div className="space-y-1 font-mono text-xs tabular-nums">
                  {Object.entries(TLB_ENTRIES).map(([p, f]) => (
                    <div
                      key={p}
                      className={`flex justify-between px-2.5 py-1 rounded ${
                        Number(p) === pageNum ? 'bg-emerald-100 text-emerald-950 font-semibold' : 'bg-white text-slate-700'
                      }`}
                    >
                      <span>Page {p}</span>
                      <span>Frame {f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                <p className="text-xs font-semibold text-slate-900 mb-2">Page Table (RAM)</p>
                <div className="space-y-1 font-mono text-xs tabular-nums">
                  {Object.entries(PAGE_TABLE).map(([p, f]) => (
                    <div
                      key={p}
                      className={`flex justify-between px-2.5 py-1 rounded ${
                        Number(p) === pageNum ? 'bg-sky-100 text-sky-950 font-semibold' : 'bg-white text-slate-700'
                      }`}
                    >
                      <span>Page {p}</span>
                      <span>Frame {f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-900 text-white font-mono text-xs tabular-nums">
              {validPage
                ? `Physical Address = (Frame ${frameNum} × 4096) + ${offset} = ${physicalAddr}`
                : `Address ${logicalAddr} maps to Page ${pageNum}, which is outside the valid Page Table [0..4].`}
            </div>
          </div>

          {/* Right Control Deck */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Logical Address (0 – 22,000 bytes):{' '}
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  {logicalAddr}
                </span>
              </label>
              <input
                type="range"
                min={0}
                max={22000}
                step={100}
                value={logicalAddr}
                onChange={(e) => setLogicalAddr(Number(e.target.value))}
                className="w-full accent-sky-700"
              />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">Quick Test Addresses</p>
              <div className="flex flex-wrap gap-2">
                {[1200, 5000, 8500, 14000, 18000, 21000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setLogicalAddr(val)}
                    className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-colors tabular-nums ${
                      logicalAddr === val
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed">
              Notice how the <strong>Page Offset ({offset})</strong> never changes during translation.
              Only the <strong>Page Number ({pageNum})</strong> is swapped for its physical{' '}
              <strong>Frame Number ({validPage ? frameNum : 'invalid'})</strong>.
            </div>
          </div>
        </div>
      ) : (
        /* Contiguous Allocator */
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
              {(['first', 'best', 'worst'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStrategy(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                    strategy === s
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s}-Fit
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <span>Process Size:</span>
                <input
                  type="range"
                  min={20}
                  max={200}
                  step={10}
                  value={reqSize}
                  onChange={(e) => setReqSize(Number(e.target.value))}
                  className="accent-sky-700"
                />
                <span className="font-mono font-semibold tabular-nums w-14">{reqSize} KB</span>
              </label>

              <button
                type="button"
                onClick={allocateBlock}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-700 rounded-lg hover:bg-sky-800"
              >
                <Plus className="w-3.5 h-3.5" />
                Allocate
              </button>
              <button
                type="button"
                onClick={() => {
                  setSegments(INITIAL_SEGMENTS);
                  setProcCounter(3);
                  setAllocMessage('Reset RAM layout to initial partitions.');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>

          {/* 600 KB Physical RAM Strip */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-500 tabular-nums">
              <span>0 KB</span>
              <span>600 KB Physical Memory Strip (Click a Process block to Free it)</span>
              <span>{totalRam} KB</span>
            </div>
            <div className="flex h-16 rounded-lg overflow-hidden border border-slate-300">
              {segments.map((seg, idx) => {
                const widthPct = (seg.size / totalRam) * 100;
                return (
                  <button
                    key={`${seg.id}-${idx}`}
                    type="button"
                    disabled={seg.free || seg.id === 'OS'}
                    onClick={() => freeProcess(idx)}
                    style={{ width: `${widthPct}%` }}
                    title={seg.free ? `Free Hole: ${seg.size} KB` : `Click to free ${seg.id}`}
                    className={`flex flex-col items-center justify-center border-r border-slate-300 last:border-r-0 text-xs font-mono tabular-nums transition-colors ${
                      seg.free
                        ? 'bg-slate-100 text-slate-600 cursor-default'
                        : seg.id === 'OS'
                        ? 'bg-slate-800 text-white cursor-default'
                        : 'bg-sky-600 text-white hover:bg-sky-700 cursor-pointer'
                    }`}
                  >
                    <span className="font-semibold truncate max-w-full px-1">{seg.id}</span>
                    <span className="text-[10px] opacity-90">{seg.size}K</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between gap-2">
            <span>{allocMessage}</span>
            <span className="font-mono text-slate-500 shrink-0 tabular-nums">
              Total Free: {segments.filter((s) => s.free).reduce((a, b) => a + b.size, 0)} KB
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
