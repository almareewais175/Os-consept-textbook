import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, ArrowRight, RotateCcw, StepForward, Cpu, HardDrive, Terminal } from 'lucide-react';

type ScenarioId = 'read-file' | 'math-add' | 'illegal-halt';

interface TraceStep {
  title: string;
  zone: 'user' | 'trap' | 'kernel' | 'hardware';
  modeBit: 1 | 0;
  instruction: string;
  annotation: string;
  statusLabel: string;
  statusType: 'nominal' | 'elevated' | 'warning';
}

const SCENARIOS: Record<
  ScenarioId,
  {
    label: string;
    apiCall: string;
    description: string;
    steps: TraceStep[];
  }
> = {
  'read-file': {
    label: 'System Call: read(fd, buf, 64)',
    apiCall: 'read(3, buffer, 64)',
    description: 'User program requests 64 bytes from an open disk file via POSIX API.',
    steps: [
      {
        title: '1. User Application Calls API',
        zone: 'user',
        modeBit: 1,
        instruction: 'call libc::read(3, buf, 64)',
        annotation:
          'Program executes in User Mode (Mode Bit = 1). It cannot touch the disk controller directly, so it invokes the standard C library wrapper.',
        statusLabel: 'USER MODE',
        statusType: 'nominal',
      },
      {
        title: '2. Hardware Trap & Mode Switch',
        zone: 'trap',
        modeBit: 0,
        instruction: 'syscall / int 0x80 (Trap #14)',
        annotation:
          'The wrapper places the syscall number in a CPU register and triggers a Trap. Hardware saves the user Program Counter, looks up the Interrupt Vector, and flips Mode Bit from 1 to 0.',
        statusLabel: 'TRAP TO KERNEL',
        statusType: 'warning',
      },
      {
        title: '3. Kernel Validates & Issues I/O',
        zone: 'kernel',
        modeBit: 0,
        instruction: 'sys_read() -> driver_read_block()',
        annotation:
          'Now in Kernel Mode (Mode Bit = 0), the OS verifies file descriptor 3 and buffer address permissions, then dispatches a privileged I/O command to the disk controller.',
        statusLabel: 'KERNEL MODE',
        statusType: 'elevated',
      },
      {
        title: '4. Hardware Transfers Data & Interrupts',
        zone: 'hardware',
        modeBit: 0,
        instruction: 'DMA transfer -> IRQ #14 complete',
        annotation:
          'The disk controller transfers 64 bytes via DMA and raises a hardware Interrupt. The Kernel ISR copies bytes safely into the user buffer.',
        statusLabel: 'HARDWARE I/O',
        statusType: 'elevated',
      },
      {
        title: '5. Return From Trap to User Mode',
        zone: 'user',
        modeBit: 1,
        instruction: 'iret / sysret (return 64)',
        annotation:
          'Kernel executes return-from-trap, resetting Mode Bit back to 1 and restoring the user Program Counter. The application resumes with 64 bytes ready.',
        statusLabel: 'USER MODE',
        statusType: 'nominal',
      },
    ],
  },
  'math-add': {
    label: 'User Compute: sum = a + b',
    apiCall: 'int sum = a + b;',
    description: 'Pure arithmetic runs entirely inside User Mode without Kernel intervention.',
    steps: [
      {
        title: '1. Fetch Instruction in User Space',
        zone: 'user',
        modeBit: 1,
        instruction: 'mov eax, [a]',
        annotation:
          'CPU operates in User Mode (Mode Bit = 1). Reading a local variable inside the process’s own address space requires no privileged instruction.',
        statusLabel: 'USER MODE',
        statusType: 'nominal',
      },
      {
        title: '2. Execute Arithmetic on ALU',
        zone: 'user',
        modeBit: 1,
        instruction: 'add eax, [b]; mov [sum], eax',
        annotation:
          'The ALU adds the registers directly at nanosecond speed. No Trap, Interrupt, or Mode Bit switch occurs—keeping normal computation ultra-fast.',
        statusLabel: 'USER MODE',
        statusType: 'nominal',
      },
    ],
  },
  'illegal-halt': {
    label: 'Privileged Violation: HLT',
    apiCall: 'asm("hlt"); // unauthorized',
    description: 'User program attempts a privileged CPU halt instruction while Mode Bit = 1.',
    steps: [
      {
        title: '1. User Program Attempts HLT',
        zone: 'user',
        modeBit: 1,
        instruction: 'hlt (privileged opcode)',
        annotation:
          'CPU checks the Mode Bit before executing HLT. Since Mode Bit = 1 (User Mode), executing a halt instruction is strictly forbidden.',
        statusLabel: 'VIOLATION DETECTED',
        statusType: 'elevated',
      },
      {
        title: '2. Hardware Raises Protection Trap',
        zone: 'trap',
        modeBit: 0,
        instruction: 'General Protection Fault -> Vector #13',
        annotation:
          'Hardware refuses to run HLT, flips Mode Bit to 0, and traps into the Kernel’s exception handler via Interrupt Vector #13.',
        statusLabel: 'PROTECTION TRAP',
        statusType: 'elevated',
      },
      {
        title: '3. Kernel Terminates Offending Process',
        zone: 'kernel',
        modeBit: 0,
        instruction: 'sys_exit(SIGILL / SIGSEGV)',
        annotation:
          'The Kernel isolates the fault, terminates the misbehaving process, and keeps all other programs and hardware completely safe.',
        statusLabel: 'PROCESS TERMINATED',
        statusType: 'elevated',
      },
    ],
  },
};

export const IntroDualModeSim: React.FC = () => {
  const [scenarioId, setScenarioId] = useState<ScenarioId>('read-file');
  const [stepIdx, setStepIdx] = useState<number>(0);

  const scenario = SCENARIOS[scenarioId];
  const currentStep = scenario.steps[stepIdx];

  const handleSelectScenario = (id: ScenarioId) => {
    setScenarioId(id);
    setStepIdx(0);
  };

  const handleNext = () => {
    setStepIdx((prev) => (prev + 1) % scenario.steps.length);
  };

  const handleReset = () => {
    setStepIdx(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Zone: Interactive Architecture Stage (7 cols) */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <p className="text-xs font-medium text-slate-500">Hardware Protection Register</p>
            <h4 className="text-base font-semibold text-slate-900 mt-0.5">
              CPU Execution Mode &amp; Address Flow
            </h4>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50">
            {currentStep.modeBit === 1 ? (
              <ShieldCheck className="w-4 h-4 text-sky-700 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            )}
            <span className="font-mono text-xs font-semibold text-slate-900 tabular-nums">
              Mode Bit = {currentStep.modeBit}
            </span>
            <span className="text-slate-300" aria-hidden="true">|</span>
            <span className="text-xs font-medium text-slate-700">
              {currentStep.modeBit === 1 ? 'User Mode' : 'Kernel Mode'}
            </span>
          </div>
        </div>

        {/* Visual Dual-Mode Architecture Lanes */}
        <div className="space-y-3">
          {/* Lane 1: User Space */}
          <div
            className={`p-4 rounded-lg border transition-colors ${
              currentStep.zone === 'user'
                ? 'bg-sky-50 border-sky-300'
                : 'bg-slate-50/70 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-700 shrink-0" />
                <span className="text-sm font-semibold text-slate-900">
                  User Space (Mode Bit = 1)
                </span>
              </div>
              {currentStep.zone === 'user' && (
                <span className="text-xs font-semibold text-sky-700">ACTIVE EXECUTION</span>
              )}
            </div>
            <p className="mt-2 font-mono text-xs text-slate-700 bg-white border border-slate-200 rounded px-3 py-2">
              {currentStep.zone === 'user' ? `> ${currentStep.instruction}` : scenario.apiCall}
            </p>
          </div>

          {/* Boundary Divider: Trap / Interrupt Vector */}
          <div
            className={`p-3 rounded-lg border flex items-center justify-between gap-3 transition-colors ${
              currentStep.zone === 'trap'
                ? 'bg-amber-50 border-amber-300'
                : 'bg-white border-dashed border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Trap Boundary &amp; Interrupt Vector Table</span>
            </div>
            <span className="font-mono text-xs text-slate-600">
              {currentStep.zone === 'trap' ? currentStep.instruction : 'Mode Switch Gate'}
            </span>
          </div>

          {/* Lane 2: Kernel Space */}
          <div
            className={`p-4 rounded-lg border transition-colors ${
              currentStep.zone === 'kernel'
                ? 'bg-amber-50 border-amber-300'
                : 'bg-slate-50/70 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-slate-700 shrink-0" />
                <span className="text-sm font-semibold text-slate-900">
                  OS Kernel Space (Mode Bit = 0)
                </span>
              </div>
              {currentStep.zone === 'kernel' && (
                <span className="text-xs font-semibold text-amber-800">PRIVILEGED EXECUTION</span>
              )}
            </div>
            <p className="mt-2 font-mono text-xs text-slate-700 bg-white border border-slate-200 rounded px-3 py-2">
              {currentStep.zone === 'kernel'
                ? `> ${currentStep.instruction}`
                : 'Interrupt Service Routine & Syscall Dispatcher'}
            </p>
          </div>

          {/* Lane 3: Physical Hardware */}
          <div
            className={`p-4 rounded-lg border transition-colors ${
              currentStep.zone === 'hardware'
                ? 'bg-emerald-50 border-emerald-300'
                : 'bg-slate-50/70 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-slate-700 shrink-0" />
                <span className="text-sm font-semibold text-slate-900">
                  Physical Hardware &amp; Disk Controller
                </span>
              </div>
              {currentStep.zone === 'hardware' && (
                <span className="text-xs font-semibold text-emerald-800">DMA &amp; IRQ ACTIVE</span>
              )}
            </div>
            <p className="mt-2 font-mono text-xs text-slate-600">
              {currentStep.zone === 'hardware'
                ? `> ${currentStep.instruction}`
                : 'Protected behind Kernel Mode (direct user access blocked)'}
            </p>
          </div>
        </div>
      </div>

      {/* Right Zone: Control & Concept Deck (5 cols) */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">Select Execution Scenario</p>
          <div className="flex flex-col gap-2">
            {(Object.keys(SCENARIOS) as ScenarioId[]).map((id) => {
              const active = id === scenarioId;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelectScenario(id)}
                  className={`text-left px-3.5 py-2.5 rounded-lg border text-sm transition-colors ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900 font-medium'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-mono text-xs opacity-80">{SCENARIOS[id].label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Controls */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200">
          <div className="text-xs font-mono text-slate-600 tabular-nums">
            Step {stepIdx + 1} of {scenario.steps.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-700 rounded-lg hover:bg-sky-800 transition-colors whitespace-nowrap shrink-0"
            >
              <StepForward className="w-3.5 h-3.5" />
              {stepIdx === scenario.steps.length - 1 ? 'Restart Trace' : 'Next Step'}
            </button>
          </div>
        </div>

        {/* Real-Time Concept Annotation */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h5 className="text-sm font-semibold text-slate-900">{currentStep.title}</h5>
            <span className="text-xs font-mono font-medium text-slate-600">
              {currentStep.statusLabel}
            </span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{currentStep.annotation}</p>
        </div>
      </div>
    </div>
  );
};
