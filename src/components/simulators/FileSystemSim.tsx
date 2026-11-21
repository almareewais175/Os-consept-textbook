import React, { useState } from 'react';
import { FileText, Plus, Trash2, Search, RotateCcw } from 'lucide-react';

type AllocMethod = 'contiguous' | 'linked' | 'indexed';

interface FileEntry {
  name: string;
  blocks: number[]; // data blocks
  indexBlock?: number; // for indexed allocation
  color: string;
}

const TOTAL_BLOCKS = 32;
const FILE_COLORS = [
  'bg-sky-600 text-white border-sky-700',
  'bg-emerald-600 text-white border-emerald-700',
  'bg-amber-600 text-white border-amber-700',
  'bg-indigo-600 text-white border-indigo-700',
];

export const FileSystemSim: React.FC = () => {
  const [method, setMethod] = useState<AllocMethod>('indexed');
  const [files, setFiles] = useState<FileEntry[]>([
    { name: 'notes.txt', blocks: [2, 3, 4], color: FILE_COLORS[0] },
    { name: 'kernel.bin', blocks: [8, 9, 10, 11], color: FILE_COLORS[1] },
  ]);
  const [newSize, setNewSize] = useState<number>(3);
  const [targetBlockOffset, setTargetBlockOffset] = useState<number>(2);
  const [selectedFile, setSelectedFile] = useState<string>('notes.txt');
  const [statusMsg, setStatusMsg] = useState<string>(
    'Inspect the 32-block disk grid and test sequential vs. random block access cost.'
  );

  // Compute occupied map depending on method
  const buildDiskMap = (currentFiles: FileEntry[], m: AllocMethod) => {
    const map: { owner: string | null; role: 'data' | 'index' | 'free'; color: string; nextPtr?: number }[] =
      Array.from({ length: TOTAL_BLOCKS }, () => ({
        owner: null,
        role: 'free',
        color: 'bg-slate-50 text-slate-400 border-slate-200',
      }));

    currentFiles.forEach((f) => {
      if (m === 'indexed' && f.indexBlock !== undefined) {
        map[f.indexBlock] = {
          owner: f.name,
          role: 'index',
          color: 'bg-slate-900 text-white border-slate-900',
        };
      }
      f.blocks.forEach((b, idx) => {
        if (b >= 0 && b < TOTAL_BLOCKS) {
          map[b] = {
            owner: f.name,
            role: 'data',
            color: f.color,
            nextPtr: m === 'linked' ? f.blocks[idx + 1] : undefined,
          };
        }
      });
    });

    return map;
  };

  const handleMethodChange = (nextMethod: AllocMethod) => {
    setMethod(nextMethod);
    // Re-seed clean demonstration files suited to the chosen method
    if (nextMethod === 'contiguous') {
      setFiles([
        { name: 'notes.txt', blocks: [1, 2, 3], color: FILE_COLORS[0] },
        { name: 'kernel.bin', blocks: [6, 7, 8, 9], color: FILE_COLORS[1] },
      ]);
    } else if (nextMethod === 'linked') {
      setFiles([
        { name: 'notes.txt', blocks: [1, 14, 22], color: FILE_COLORS[0] },
        { name: 'kernel.bin', blocks: [5, 19, 25, 30], color: FILE_COLORS[1] },
      ]);
    } else {
      setFiles([
        { name: 'notes.txt', indexBlock: 0, blocks: [4, 15, 21], color: FILE_COLORS[0] },
        { name: 'kernel.bin', indexBlock: 10, blocks: [12, 18, 24, 29], color: FILE_COLORS[1] },
      ]);
    }
    setSelectedFile('notes.txt');
    setStatusMsg(`Switched to ${nextMethod.toUpperCase()} allocation.`);
  };

  const diskMap = buildDiskMap(files, method);

  const createFile = () => {
    if (files.length >= 4) {
      setStatusMsg('Maximum 4 demo files reached. Delete a file first to free disk blocks.');
      return;
    }
    const freeIndices = diskMap
      .map((cell, idx) => (cell.role === 'free' ? idx : -1))
      .filter((idx) => idx !== -1);

    const fileName = `data_${files.length + 1}.dat`;
    const color = FILE_COLORS[files.length % FILE_COLORS.length];

    if (method === 'contiguous') {
      // Find contiguous run of newSize
      let start = -1;
      for (let i = 0; i <= TOTAL_BLOCKS - newSize; i++) {
        let ok = true;
        for (let k = 0; k < newSize; k++) {
          if (diskMap[i + k].role !== 'free') {
            ok = false;
            break;
          }
        }
        if (ok) {
          start = i;
          break;
        }
      }
      if (start === -1) {
        setStatusMsg(
          `Contiguous allocation failed: ${freeIndices.length} blocks are free, but no ${newSize} adjacent blocks exist (External Fragmentation).`
        );
        return;
      }
      const blocks = Array.from({ length: newSize }, (_, k) => start + k);
      setFiles((prev) => [...prev, { name: fileName, blocks, color }]);
      setSelectedFile(fileName);
      setStatusMsg(`Allocated ${fileName} contiguously at blocks [${blocks.join(', ')}].`);
    } else if (method === 'linked') {
      if (freeIndices.length < newSize) {
        setStatusMsg('Not enough free disk blocks.');
        return;
      }
      // Pick scattered free blocks to illustrate non-contiguous placement
      const picked = freeIndices.filter((_, idx) => idx % 2 === 0).slice(0, newSize);
      const finalBlocks =
        picked.length === newSize ? picked : freeIndices.slice(0, newSize);
      setFiles((prev) => [...prev, { name: fileName, blocks: finalBlocks, color }]);
      setSelectedFile(fileName);
      setStatusMsg(
        `Linked allocation chained ${fileName} across blocks ${finalBlocks.join(' -> ')}.`
      );
    } else {
      if (freeIndices.length < newSize + 1) {
        setStatusMsg('Need 1 Index Block plus data blocks.');
        return;
      }
      const indexBlock = freeIndices[0];
      const remaining = freeIndices.slice(1);
      const picked = remaining.filter((_, idx) => idx % 2 === 0).slice(0, newSize);
      const dataBlocks = picked.length === newSize ? picked : remaining.slice(0, newSize);
      setFiles((prev) => [...prev, { name: fileName, indexBlock, blocks: dataBlocks, color }]);
      setSelectedFile(fileName);
      setStatusMsg(
        `Indexed allocation stored pointers for [${dataBlocks.join(', ')}] inside i-node/Index Block #${indexBlock}.`
      );
    }
  };

  const deleteFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
    setStatusMsg(`Deleted ${name} and marked its bits free in the Free-Space Bit Vector.`);
  };

  const activeFileObj = files.find((f) => f.name === selectedFile) || files[0];
  const clampedOffset = activeFileObj
    ? Math.min(targetBlockOffset, activeFileObj.blocks.length - 1)
    : 0;

  const calculateRandomAccessReads = () => {
    if (!activeFileObj) return null;
    if (method === 'contiguous') {
      const target = activeFileObj.blocks[clampedOffset];
      return `1 direct disk read (Start Block ${activeFileObj.blocks[0]} + Offset ${clampedOffset} = Block #${target}).`;
    }
    if (method === 'linked') {
      const path = activeFileObj.blocks.slice(0, clampedOffset + 1).join(' -> ');
      return `${clampedOffset + 1} sequential disk reads required to follow pointers: ${path}.`;
    }
    const target = activeFileObj.blocks[clampedOffset];
    return `1 Index Block read (#${activeFileObj.indexBlock}) + 1 direct data read (Block #${target}) = O(1) lookup regardless of offset.`;
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
          {(['contiguous', 'linked', 'indexed'] as AllocMethod[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleMethodChange(m)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                method === m
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {m === 'indexed' ? 'Indexed (i-node)' : m}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
            <span>New File Size:</span>
            <input
              type="range"
              min={2}
              max={6}
              value={newSize}
              onChange={(e) => setNewSize(Number(e.target.value))}
              className="accent-sky-700"
            />
            <span className="font-mono font-semibold tabular-nums">{newSize} Blocks</span>
          </label>

          <button
            type="button"
            onClick={createFile}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-700 rounded-lg hover:bg-sky-800"
          >
            <Plus className="w-3.5 h-3.5" />
            Create File
          </button>

          <button
            type="button"
            onClick={() => handleMethodChange(method)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Two-Zone Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Disk Block Grid (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <p className="text-xs font-medium text-slate-500">32-Block Storage Volume</p>
              <h4 className="text-base font-semibold text-slate-900">
                Disk Block Map &amp; Free-Space Bit Vector
              </h4>
            </div>
            <span className="font-mono text-xs text-slate-600 tabular-nums">
              Free Blocks: {diskMap.filter((b) => b.role === 'free').length} / {TOTAL_BLOCKS}
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {diskMap.map((cell, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg border text-center font-mono text-xs tabular-nums ${cell.color}`}
              >
                <div className="text-[10px] opacity-80">#{idx}</div>
                <div className="font-semibold truncate mt-0.5">
                  {cell.role === 'index'
                    ? 'IDX'
                    : cell.owner
                    ? cell.owner.split('.')[0]
                    : 'free'}
                </div>
                {method === 'linked' && cell.role === 'data' && (
                  <div className="text-[10px] opacity-90">
                    {cell.nextPtr !== undefined ? `->${cell.nextPtr}` : 'EOF'}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bit Vector Strip */}
          <div className="pt-2">
            <p className="text-xs font-medium text-slate-500 mb-1.5">
              Free-Space Bit Vector (1 = Free, 0 = Allocated)
            </p>
            <div className="font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 tracking-widest text-slate-800 overflow-x-auto">
              {diskMap.map((c) => (c.role === 'free' ? '1' : '0')).join('')}
            </div>
          </div>
        </div>

        {/* Directory & Random Access Seek Inspector (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Directory Table</p>
            <div className="space-y-2">
              {files.map((f) => (
                <div
                  key={f.name}
                  className={`flex items-center justify-between gap-2 p-2.5 rounded-lg border text-xs ${
                    selectedFile === f.name
                      ? 'bg-sky-50 border-sky-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedFile(f.name)}
                    className="flex items-center gap-2 text-left flex-1 min-w-0"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                    <span className="font-mono font-semibold text-slate-900 truncate">{f.name}</span>
                    <span className="font-mono text-slate-500 tabular-nums shrink-0">
                      ({f.blocks.length} blks)
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteFile(f.name)}
                    className="p-1 text-slate-500 hover:text-rose-700"
                    aria-label={`Delete ${f.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {activeFileObj && (
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                <Search className="w-3.5 h-3.5 text-sky-700" />
                <span>Random Access Test: {activeFileObj.name}</span>
              </div>
              <label className="block text-xs text-slate-700">
                Read Logical Block Index:{' '}
                <span className="font-mono font-semibold tabular-nums">{clampedOffset}</span>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, activeFileObj.blocks.length - 1)}
                  value={clampedOffset}
                  onChange={(e) => setTargetBlockOffset(Number(e.target.value))}
                  className="w-full accent-sky-700 mt-1"
                />
              </label>
              <p className="text-xs text-slate-700 leading-relaxed font-mono">
                {calculateRandomAccessReads()}
              </p>
            </div>
          )}

          <p className="text-xs text-slate-600 leading-relaxed">{statusMsg}</p>
        </div>
      </div>
    </div>
  );
};
