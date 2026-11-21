import { ChapterData } from '../types/os';

export const CHAPTERS: ChapterData[] = [
  {
    id: 'intro',
    number: '01',
    title: 'Introduction to Operating Systems',
    shortTitle: 'Intro to OS',
    silberschatzRef: 'Silberschatz Ch. 1 & 2',
    estimatedMinutes: 10,
    overview:
      'An operating system acts as an intermediary between computer users and hardware. It manages CPU, memory, and I/O devices while protecting the system through dual-mode execution and controlled system calls.',
    analogy: {
      title: 'The Restaurant Kitchen and Dining Room',
      scenario:
        'Imagine a busy restaurant. Diners in the dining room cannot walk into the kitchen to operate industrial ovens or grab raw ingredients directly—doing so would cause chaos and safety hazards. Instead, diners hand requests to a waiter, who passes structured order tickets to the head chef in the kitchen.',
      mapping: [
        { osTerm: 'User Application', realWorld: 'Diner ordering a meal from the menu' },
        { osTerm: 'System Call', realWorld: 'Written order ticket submitted to the kitchen' },
        { osTerm: 'Kernel Mode (Mode Bit = 0)', realWorld: 'Head chef with full access to stoves and knives' },
        { osTerm: 'User Mode (Mode Bit = 1)', realWorld: 'Dining room where guests are safely isolated' },
        { osTerm: 'Hardware / I/O Devices', realWorld: 'Ovens, refrigerators, and pantry supplies' },
      ],
    },
    steps: [
      {
        stepNumber: '01',
        title: 'Resource Allocation & Control Program',
        explanation:
          'At its core, the Operating System (OS) wears two hats: a Resource Allocator that decides which program gets CPU time, memory space, or disk access, and a Control Program that prevents user errors or improper hardware usage.',
        keyTakeaway: 'The Kernel is the single program running at all times on the computer.',
      },
      {
        stepNumber: '02',
        title: 'Interrupt-Driven Architecture',
        explanation:
          'Modern operating systems are interrupt-driven. When a keyboard key is pressed or a disk finishes reading data, the hardware raises an Interrupt signal. The CPU pauses its current instruction, checks the Interrupt Vector, and jumps to the OS Interrupt Service Routine (ISR).',
        keyTakeaway: 'A Trap (or exception) is a software-generated interrupt caused by an error or a user request.',
      },
      {
        stepNumber: '03',
        title: 'Dual-Mode Operation & the Mode Bit',
        explanation:
          'To stop buggy or malicious programs from overwriting the OS, hardware provides a Mode Bit: 1 indicates User Mode (restricted), and 0 indicates Kernel Mode (privileged). Privileged instructions—such as halting the CPU or modifying timers—are only legal when Mode Bit = 0.',
        keyTakeaway: 'Attempting a privileged instruction in User Mode triggers a hardware trap to the Kernel.',
      },
      {
        stepNumber: '04',
        title: 'System Calls as the Safe Bridge',
        explanation:
          'When a user program needs a privileged service like reading a file (read()), it invokes a System Call via an API (POSIX or Win32). This executes a trap instruction that flips the Mode Bit to 0, lets the Kernel perform the work, and flips the Mode Bit back to 1 upon return.',
        keyTakeaway: 'System calls provide the standard programming interface to Kernel services.',
      },
    ],
    labTitle: 'Dual-Mode & System Call Execution Tracer',
    labPrompt:
      'Trigger different application actions below and step through the hardware Mode Bit transitions, Interrupt Vector lookup, and Kernel execution path.',
    summary: [
      'The Kernel is the core program always resident in memory; everything else is a system or application program.',
      'Hardware Interrupts (external devices) and Traps (software exceptions/system calls) drive OS execution.',
      'Dual-Mode Operation (User Mode = 1, Kernel Mode = 0) protects the OS from errant user code.',
      'System Calls bridge User Mode programs to privileged Kernel services through controlled traps.',
    ],
    keyTerms: [
      {
        term: 'Kernel',
        definition: 'The one program running at all times on the computer, managing hardware and system services.',
      },
      {
        term: 'Mode Bit',
        definition: 'A hardware bit added to the CPU to indicate the current execution mode: Kernel (0) or User (1).',
      },
      {
        term: 'Interrupt',
        definition: 'A hardware signal sent to the CPU by a device indicating an event that needs immediate OS attention.',
      },
      {
        term: 'Trap',
        definition: 'A software-generated interrupt caused either by an error (e.g., division by zero) or by a System Call request.',
      },
      {
        term: 'System Call',
        definition: 'The programmatic interface through which a user-space process requests a privileged service from the OS Kernel.',
      },
      {
        term: 'Privileged Instruction',
        definition: 'A CPU instruction (e.g., I/O control, timer reset, halt) allowed to execute only in Kernel Mode.',
      },
    ],
    quiz: [
      {
        id: 'intro-q1',
        question: 'When a user application attempts to execute a Privileged Instruction while the Mode Bit is 1, what does the hardware do?',
        options: [
          'Executes the instruction normally and logs a warning',
          'Flips the Mode Bit to 0 automatically and grants user access',
          'Treats it as illegal and generates a hardware Trap to the Operating System',
          'Ignores the instruction and skips to the next line of code',
        ],
        correctIndex: 2,
        explanation:
          'In User Mode (Mode Bit = 1), privileged instructions are blocked by hardware. The CPU immediately raises a Trap to transfer control safely to the Kernel.',
      },
      {
        id: 'intro-q2',
        question: 'Which statement accurately distinguishes an Interrupt from a Trap in Silberschatz et al.?',
        options: [
          'Interrupts are triggered by software APIs; Traps are triggered by disk controllers',
          'Interrupts are asynchronous hardware signals; Traps are synchronous software-generated interrupts',
          'Traps run only in User Mode; Interrupts run only when the CPU is idle',
          'There is no distinction; both terms describe identical electrical signals',
        ],
        correctIndex: 1,
        explanation:
          'Hardware devices assert Interrupts asynchronously (e.g., I/O completion), whereas a Trap is triggered synchronously by executing an instruction (an error or a System Call).',
      },
      {
        id: 'intro-q3',
        question: 'What is the primary purpose of the Interrupt Vector?',
        options: [
          'To store all files currently open by user applications',
          'To map an interrupt number to the memory address of its specific Interrupt Service Routine (ISR)',
          'To encrypt system call arguments passed between user space and kernel space',
          'To count how many CPU cores are available during boot',
        ],
        correctIndex: 1,
        explanation:
          'The Interrupt Vector is an array of pointers to Interrupt Service Routines, allowing the CPU to jump straight to the right handler without scanning every device.',
      },
      {
        id: 'intro-q4',
        question: 'Why do programmers typically call POSIX or Win32 API functions (like ReadFile) instead of invoking raw System Calls directly?',
        options: [
          'APIs bypass Kernel Mode entirely for higher speed',
          'APIs provide portability across platforms and hide low-level assembly trap details',
          'System Calls cannot accept parameters or return values',
          'Raw System Calls are disabled on 64-bit processors',
        ],
        correctIndex: 1,
        explanation:
          'Application Programming Interfaces (APIs) abstract hardware-specific trap instructions and register conventions, making code portable across OS versions and architectures.',
      },
    ],
  },
  {
    id: 'processes',
    number: '02',
    title: 'Processes and Threads',
    shortTitle: 'Processes & Threads',
    silberschatzRef: 'Silberschatz Ch. 3 & 4',
    estimatedMinutes: 12,
    overview:
      'A program sitting on disk is passive; once loaded into memory and executing, it becomes an active Process. Understanding how the OS tracks processes with the Process Control Block (PCB) and switches between them—or schedules lightweight Threads inside them—is the foundation of multitasking.',
    analogy: {
      title: 'A Chef Following Multiple Recipes',
      scenario:
        'A recipe printed in a cookbook is just static text (a Program). When a chef starts cooking it using pots, ingredients, and stove burners, it becomes an active Process. If the chef pauses soup prep to chop salad while water boils, placing a bookmark on the soup page is saving the PCB during a Context Switch. Hiring two sous-chefs who share the same kitchen counter and ingredients to chop and stir simultaneously models Multithreading.',
      mapping: [
        { osTerm: 'Program (on disk)', realWorld: 'Printed recipe book sitting on a shelf' },
        { osTerm: 'Process (active)', realWorld: 'Cooking session with active pots, workspace, and state' },
        { osTerm: 'Process Control Block (PCB)', realWorld: 'Bookmark noting current step, timer, and pan temperature' },
        { osTerm: 'Context Switch', realWorld: 'Putting down one dish, recording progress, and resuming another' },
        { osTerm: 'Threads in a Process', realWorld: 'Multiple cooks sharing the same kitchen counter & ingredients' },
      ],
    },
    steps: [
      {
        stepNumber: '01',
        title: 'Anatomy of a Process in Memory',
        explanation:
          'A process layout consists of four distinct sections: Text (compiled code), Data (global variables), Heap (dynamically allocated memory growing upward), and Stack (temporary function parameters, return addresses, and local variables growing downward).',
        keyTakeaway: 'A Program is passive; a Process is an active entity with a Program Counter and memory layout.',
      },
      {
        stepNumber: '02',
        title: 'The Five-State Process Lifecycle',
        explanation:
          'As a process executes, it transitions among five states: New (being created), Ready (waiting in the Ready Queue for a CPU core), Running (instructions executing on the CPU), Waiting (blocked for I/O or an event), and Terminated (finished execution).',
        keyTakeaway: 'Only one process per CPU core can be in the Running state at any given instant.',
      },
      {
        stepNumber: '03',
        title: 'Process Control Block (PCB) & Context Switch',
        explanation:
          'The OS represents each process via a PCB containing its PID, Process State, Program Counter, CPU Registers, Scheduling info, and Memory pointers. Switching the CPU from process P0 to P1 requires a Context Switch: saving P0’s state into PCB0 and loading P1’s state from PCB1.',
        keyTakeaway: 'Context-switch time is pure overhead—the system does no useful user work while switching.',
      },
      {
        stepNumber: '04',
        title: 'Threads: Lightweight Concurrency',
        explanation:
          'A Thread is the basic unit of CPU utilization. Threads belonging to the same process share Code, Data, and Open Files, while each thread maintains its own private Thread ID, Program Counter, Register Set, and Stack—making thread switching dramatically faster than process switching.',
        keyTakeaway: 'Sharing memory within a process eliminates expensive IPC copies between cooperating threads.',
      },
    ],
    labTitle: 'Process State Machine, PCB Inspector & Thread Sandbox',
    labPrompt:
      'Spawn processes, dispatch them onto the CPU, trigger I/O waits or time-slice preemptions, and inspect live PCB snapshots or toggle the Process vs. Thread memory view.',
    summary: [
      'A Process has Text, Data, Heap, and Stack segments plus an associated Process Control Block (PCB).',
      'Processes move between New, Ready, Running, Waiting, and Terminated states managed by OS queues.',
      'A Context Switch saves the outgoing process’s registers/PC to its PCB and restores the incoming PCB.',
      'Threads share Code, Data, and Files within a process while keeping private Registers and Stacks.',
    ],
    keyTerms: [
      {
        term: 'Process Control Block (PCB)',
        definition: 'Kernel data structure storing all information needed to pause and resume a process (PID, state, PC, registers, memory limits).',
      },
      {
        term: 'Context Switch',
        definition: 'The kernel operation of saving the CPU state of the current process and restoring the state of the next scheduled process.',
      },
      {
        term: 'Ready Queue',
        definition: 'The list of all processes residing in main memory that are ready and waiting to execute on a CPU core.',
      },
      {
        term: 'Thread',
        definition: 'A lightweight unit of execution within a process, consisting of a thread ID, program counter, register set, and stack.',
      },
      {
        term: 'Zombie Process',
        definition: 'A process that has terminated, but whose entry remains in the process table until its parent calls wait() to read its exit status.',
      },
      {
        term: 'IPC (Interprocess Communication)',
        definition: 'Mechanisms (Shared Memory or Message Passing) allowing separate processes to exchange data safely.',
      },
    ],
    quiz: [
      {
        id: 'proc-q1',
        question: 'Which components are private to EACH Thread inside a multithreaded process (not shared with sibling threads)?',
        options: [
          'Code (Text) section and global Data variables',
          'Heap memory and open file descriptors',
          'Program Counter, CPU Register Set, and Stack',
          'Process ID (PID) and Page Table',
        ],
        correctIndex: 2,
        explanation:
          'Threads within the same process share Code, Data, Heap, and open files, but every thread needs its own Program Counter, Register Set, and Stack to track independent execution.',
      },
      {
        id: 'proc-q2',
        question: 'When a Running process issues a blocking disk read request, which state transition occurs immediately?',
        options: [
          'Running -> Ready',
          'Running -> Waiting',
          'Ready -> Waiting',
          'Running -> Terminated',
        ],
        correctIndex: 1,
        explanation:
          'Because the process cannot proceed until the disk I/O completes, the OS moves it from Running to Waiting (blocked) and dispatches another Ready process.',
      },
      {
        id: 'proc-q3',
        question: 'What happens to a process immediately after an interrupt signals that its I/O operation has completed?',
        options: [
          'It jumps directly from Waiting to Running on the CPU',
          'It moves from Waiting to the Ready Queue',
          'It enters the New state to be reloaded',
          'It triggers a Terminated state',
        ],
        correctIndex: 1,
        explanation:
          'I/O completion makes the process eligible to run again, so it moves from Waiting to Ready. The CPU scheduler decides when it enters Running.',
      },
      {
        id: 'proc-q4',
        question: 'Why does Silberschatz emphasize minimizing Context Switch frequency where possible?',
        options: [
          'Context switches permanently erase the process Heap',
          'Context switch time is pure OS overhead during which no user instructions execute',
          'Context switches can only occur in User Mode',
          'Every context switch doubles the size of the PCB',
        ],
        correctIndex: 1,
        explanation:
          'While saving and restoring PCB state, the CPU is doing administrative bookkeeping rather than useful application work, creating latency overhead.',
      },
    ],
  },
  {
    id: 'scheduling',
    number: '03',
    title: 'CPU Scheduling',
    shortTitle: 'CPU Scheduling',
    silberschatzRef: 'Silberschatz Ch. 5',
    estimatedMinutes: 14,
    overview:
      'Whenever multiple processes sit in the Ready Queue, the Short-Term Scheduler must choose which process runs next. Different algorithms balance throughput, waiting time, and interactive responsiveness.',
    analogy: {
      title: 'Airport Check-In and Coffee Shop Queues',
      scenario:
        'A single-barista coffee shop using First-Come, First-Served (FCFS) stalls everyone behind one 12-drink catering order (the Convoy Effect). An express grocery lane for 1-item shoppers resembles Shortest-Job-First (SJF). A chess club where players rotate every 2 minutes uses Round Robin (RR) to guarantee fair turns, while an Emergency Room triage desk models Priority Scheduling.',
      mapping: [
        { osTerm: 'FCFS (First-Come, First-Served)', realWorld: 'Standard single line at a coffee counter' },
        { osTerm: 'Convoy Effect', realWorld: 'Short single-espresso buyers stuck behind a huge catering order' },
        { osTerm: 'SJF / SRTF', realWorld: 'Express lane serving shortest tasks first' },
        { osTerm: 'Round Robin (Time Quantum q)', realWorld: 'Fair rotating timer giving every customer a fixed slice' },
        { osTerm: 'Priority Scheduling + Aging', realWorld: 'ER triage that prevents minor cases from waiting forever' },
      ],
    },
    steps: [
      {
        stepNumber: '01',
        title: 'CPU–I/O Burst Cycle & Key Metrics',
        explanation:
          'Process execution alternates between a CPU Burst and an I/O Burst. Schedulers are evaluated using five metrics: CPU Utilization, Throughput, Turnaround Time (Completion − Arrival), Waiting Time (time spent in the Ready Queue), and Response Time (First Run − Arrival).',
        keyTakeaway: 'Turnaround Time = Waiting Time + Total CPU Execution Time.',
      },
      {
        stepNumber: '02',
        title: 'FCFS & The Convoy Effect',
        explanation:
          'First-Come, First-Served (FCFS) is non-preemptive and simple to implement via a FIFO queue. However, if a long CPU-bound process arrives first, short processes pile up behind it, causing high average waiting time—known as the Convoy Effect.',
        keyTakeaway: 'FCFS is fair in arrival order but poor for average waiting time and interactive systems.',
      },
      {
        stepNumber: '03',
        title: 'SJF and Preemptive SRTF',
        explanation:
          'Shortest-Job-First (SJF) selects the process with the smallest next CPU burst, provably minimizing average waiting time. Its preemptive counterpart, Shortest-Remaining-Time-First (SRTF), switches immediately if a newly arrived process has less remaining burst than the running process.',
        keyTakeaway: 'SJF/SRTF achieve optimal average waiting time, though exact future burst length must be predicted.',
      },
      {
        stepNumber: '04',
        title: 'Round Robin (RR) & Priority Aging',
        explanation:
          'Round Robin assigns a fixed Time Quantum (q, typically 10–100 ms). If a process does not finish within q, a timer interrupt preempts it and appends it to the tail of the Ready Queue. For Priority Scheduling, Aging gradually boosts the priority of long-waiting processes to prevent Starvation.',
        keyTakeaway: 'Too small a Time Quantum q inflates context-switch overhead; too large a q degrades RR into FCFS.',
      },
    ],
    labTitle: 'Interactive Gantt Chart & Scheduling Metrics Lab',
    labPrompt:
      'Select an algorithm, tune the Time Quantum for Round Robin, edit process arrival/burst times, and step through the timeline to observe real-time Turnaround, Waiting, and Response metrics.',
    summary: [
      'Preemptive scheduling can interrupt a Running process (e.g., SRTF, RR); non-preemptive keeps the CPU until yield/wait/exit (e.g., FCFS, non-preemptive SJF).',
      'FCFS suffers from the Convoy Effect when long bursts precede short ones.',
      'SJF / SRTF minimize average waiting time but require predicting CPU burst lengths.',
      'Round Robin balances responsiveness via Time Quantum q; Aging solves Starvation in Priority Scheduling.',
    ],
    keyTerms: [
      {
        term: 'Turnaround Time',
        definition: 'The total interval from the time of process submission (Arrival) to the time of completion (Completion − Arrival).',
      },
      {
        term: 'Waiting Time',
        definition: 'The sum of periods a process spends waiting in the Ready Queue (Turnaround Time − CPU Burst Time).',
      },
      {
        term: 'Response Time',
        definition: 'The time from submission of a request until the first CPU response is produced—critical for interactive apps.',
      },
      {
        term: 'Convoy Effect',
        definition: 'Performance degradation in FCFS when many short processes wait behind one long CPU-bound process.',
      },
      {
        term: 'Time Quantum',
        definition: 'A small fixed unit of CPU time (usually 10–100 ms) allocated per turn in Round Robin scheduling.',
      },
      {
        term: 'Starvation & Aging',
        definition: 'Starvation occurs when low-priority processes wait indefinitely; Aging prevents it by gradually raising priority over time.',
      },
    ],
    quiz: [
      {
        id: 'sched-q1',
        question: 'Three processes arrive at t = 0 with CPU bursts: P1 = 24 ms, P2 = 3 ms, P3 = 3 ms. Under FCFS in order P1, P2, P3, what is the average Waiting Time?',
        options: [
          '3 ms',
          '10 ms',
          '17 ms',
          '27 ms',
        ],
        correctIndex: 2,
        explanation:
          'P1 waits 0 ms, P2 waits 24 ms, P3 waits 27 ms. Average Waiting Time = (0 + 24 + 27) / 3 = 51 / 3 = 17 ms—a classic example of the Convoy Effect.',
      },
      {
        id: 'sched-q2',
        question: 'Which scheduling algorithm is provably optimal for minimizing average Waiting Time for a given set of processes?',
        options: [
          'First-Come, First-Served (FCFS)',
          'Shortest-Job-First (SJF)',
          'Round Robin (RR)',
          'Static Priority Scheduling',
        ],
        correctIndex: 1,
        explanation:
          'Moving a shorter process ahead of a longer process decreases the waiting time of the short process more than it increases the waiting time of the long process, making SJF optimal.',
      },
      {
        id: 'sched-q3',
        question: 'In Round Robin scheduling, what happens if the Time Quantum q becomes very small (approaching context-switch duration)?',
        options: [
          'Round Robin behaves identically to FCFS',
          'Average Turnaround Time drops to zero',
          'Context-switch overhead dominates and effective CPU utilization drops',
          'Processes no longer require a Ready Queue',
        ],
        correctIndex: 2,
        explanation:
          'If q is too small, the CPU spends an excessive percentage of time saving and restoring PCBs rather than executing process instructions.',
      },
      {
        id: 'sched-q4',
        question: 'How does Aging solve the problem of Indefinite Blocking (Starvation) in Priority Scheduling?',
        options: [
          'By terminating any process that waits longer than 10 seconds',
          'By gradually increasing the priority of processes that wait in the system for a long time',
          'By forcing all processes to use identical priority values',
          'By converting all I/O bursts into CPU bursts',
        ],
        correctIndex: 1,
        explanation:
          'Aging steadily elevates a waiting process’s priority as time passes, guaranteeing that even the lowest-priority job eventually becomes highest priority and runs.',
      },
    ],
  },
  {
    id: 'synchronization',
    number: '04',
    title: 'Synchronization and Deadlocks',
    shortTitle: 'Sync & Deadlocks',
    silberschatzRef: 'Silberschatz Ch. 6, 7 & 8',
    estimatedMinutes: 15,
    overview:
      'When concurrent threads or processes share data, arbitrary scheduling interleavings can corrupt shared state (Race Conditions). Locks and Semaphores enforce Mutual Exclusion—yet improper locking creates Deadlock, where threads wait forever for one another.',
    analogy: {
      title: 'A Single-Lane Bridge and Four-Way Gridlock',
      scenario:
        'A narrow mountain bridge fits only one car at a time: a traffic flagman (Mutex / Binary Semaphore) holds oncoming cars until the bridge clears so two cars do not collide in a Race Condition. Meanwhile, Deadlock is a four-way intersection where four cars enter simultaneously, each blocking the car on its left while waiting for the car on its right to move first.',
      mapping: [
        { osTerm: 'Critical Section', realWorld: 'The single-lane mountain bridge itself' },
        { osTerm: 'Race Condition', realWorld: 'Two cars entering from opposite ends and colliding' },
        { osTerm: 'Mutex Lock / Semaphore', realWorld: 'Bridge flagman holding a single token permit' },
        { osTerm: 'Deadlock (Circular Wait)', realWorld: 'Four cars locked nose-to-tail at an intersection' },
        { osTerm: 'Resource Ordering', realWorld: 'Right-of-way rule breaking symmetry before entry' },
      ],
    },
    steps: [
      {
        stepNumber: '01',
        title: 'Race Conditions & The Critical Section',
        explanation:
          'A single high-level statement like counter++ compiles into three machine steps: load, increment, and store. If a context switch interleaves two threads mid-update, one update is lost. A Critical Section solution must satisfy three criteria: Mutual Exclusion, Progress, and Bounded Waiting.',
        keyTakeaway: 'Non-atomic read-modify-write sequences on shared memory produce Race Conditions.',
      },
      {
        stepNumber: '02',
        title: 'Mutex Locks & Semaphores',
        explanation:
          'A Mutex Lock protects a critical section via acquire() and release(). A Semaphore is an integer variable S accessed only via two atomic operations: wait(S) (decrements S; blocks if S ≤ 0) and signal(S) (increments S and wakes a waiting thread).',
        keyTakeaway: 'Binary Semaphores (0 or 1) act like locks; Counting Semaphores track multiple identical resources.',
      },
      {
        stepNumber: '03',
        title: 'The Four Necessary Conditions for Deadlock',
        explanation:
          'Deadlock occurs if and only if all four Coffman conditions hold simultaneously: (1) Mutual Exclusion, (2) Hold and Wait, (3) No Preemption, and (4) Circular Wait. Breaking even one condition guarantees Deadlock cannot happen.',
        keyTakeaway: 'A cycle in a single-instance Resource Allocation Graph (RAG) is both necessary and sufficient for deadlock.',
      },
      {
        stepNumber: '04',
        title: 'Prevention, Avoidance & Banker’s Algorithm',
        explanation:
          'Deadlock Prevention invalidates one of the four conditions—most practically Circular Wait by imposing a strict global lock-acquisition order. Deadlock Avoidance (such as Dijkstra’s Banker’s Algorithm) checks before granting a request whether the system remains in a Safe State.',
        keyTakeaway: 'Unsafe state does not mean immediate deadlock—it means the OS can no longer guarantee avoiding one.',
      },
    ],
    labTitle: 'Critical Section Race Lab & Deadlock RAG Explorer',
    labPrompt:
      'Switch between the Race Condition Lab (step through two concurrent threads with Mutex OFF vs. ON) and the Deadlock Resource Allocation Graph (trigger or break Circular Wait).',
    summary: [
      'Any Critical Section solution must guarantee Mutual Exclusion, Progress, and Bounded Waiting.',
      'Mutex Locks and Semaphores synchronize access to shared variables without lost updates.',
      'Deadlock requires all four conditions: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.',
      'Ordering lock acquisition eliminates Circular Wait; Banker’s Algorithm verifies Safe States before allocation.',
    ],
    keyTerms: [
      {
        term: 'Race Condition',
        definition: 'A situation where multiple threads manipulate shared data concurrently and the outcome depends on the exact order of execution.',
      },
      {
        term: 'Critical Section',
        definition: 'A code segment in which a process or thread accesses shared resources that must not be concurrently accessed by another thread.',
      },
      {
        term: 'Mutual Exclusion',
        definition: 'Requirement ensuring that if one process is executing in its critical section, no other process can enter that critical section.',
      },
      {
        term: 'Semaphore',
        definition: 'A synchronization tool using an integer variable manipulated atomically via wait() (P) and signal() (V) operations.',
      },
      {
        term: 'Deadlock',
        definition: 'A state where a set of blocked processes each holds a resource and waits to acquire a resource held by another process in the set.',
      },
      {
        term: 'Safe State',
        definition: 'A state in which the OS can allocate resources to every process in some sequence (a safe sequence) and avoid deadlock.',
      },
    ],
    quiz: [
      {
        id: 'sync-q1',
        question: 'Which three requirements must ANY valid solution to the Critical Section Problem satisfy?',
        options: [
          'Paging, Segmentation, and Swapping',
          'Mutual Exclusion, Progress, and Bounded Waiting',
          'Hold and Wait, Circular Wait, and Preemption',
          'FCFS, SJF, and Round Robin',
        ],
        correctIndex: 1,
        explanation:
          'Silberschatz defines Mutual Exclusion (one at a time), Progress (no indefinite postponement when CS is free), and Bounded Waiting (limit on how long a thread waits) as the three mandatory properties.',
      },
      {
        id: 'sync-q2',
        question: 'A Counting Semaphore S is initialized to 4. After 6 wait(S) operations and 3 signal(S) operations complete, what is the value of S?',
        options: [
          '0',
          '1',
          '3',
          '-1',
        ],
        correctIndex: 1,
        explanation:
          'Each wait() decrements S by 1 and each signal() increments S by 1: 4 − 6 + 3 = 1.',
      },
      {
        id: 'sync-q3',
        question: 'How does imposing a strict global ordering on lock acquisition (e.g., always acquire Lock A before Lock B) prevent Deadlock?',
        options: [
          'It breaks Mutual Exclusion',
          'It breaks No Preemption',
          'It breaks Circular Wait',
          'It eliminates all Context Switches',
        ],
        correctIndex: 2,
        explanation:
          'If every process requests resources in strictly increasing numerical order, a closed cycle of processes waiting on each other (Circular Wait) is mathematically impossible.',
      },
      {
        id: 'sync-q4',
        question: 'If a Resource Allocation Graph contains a cycle and every resource type has multiple instances, what can we conclude?',
        options: [
          'The system is definitely deadlocked',
          'A deadlock MAY exist, but is not guaranteed if another instance can be released',
          'No deadlock can ever occur with multiple instances',
          'The system is guaranteed to be in a Safe State',
        ],
        correctIndex: 1,
        explanation:
          'A cycle is necessary and sufficient for deadlock only when each resource type has a single instance. With multiple instances, a cycle is necessary but not sufficient.',
      },
    ],
  },
  {
    id: 'memory',
    number: '05',
    title: 'Memory Management',
    shortTitle: 'Memory Management',
    silberschatzRef: 'Silberschatz Ch. 9',
    estimatedMinutes: 14,
    overview:
      'Main memory (RAM) must be partitioned among the OS and active processes safely and efficiently. Hardware MMUs translate Logical Addresses generated by the CPU into Physical Addresses, evolving from Contiguous Allocation to non-contiguous Paging with a high-speed TLB.',
    analogy: {
      title: 'A Library Card Catalog and Scattered Bookshelves',
      scenario:
        'Contiguous memory allocation is like insisting an entire 10-volume encyclopedia sit together on one unbroken shelf—leaving awkward small gaps (External Fragmentation). Paging solves this by breaking the encyclopedia into uniform 100-page binders (Pages) stored on any open shelf slot (Frames) anywhere in the library, while keeping an index map (Page Table) and a sticky note on your desk for frequent lookups (TLB).',
      mapping: [
        { osTerm: 'Logical Address (Page # + Offset)', realWorld: 'Volume # and page number inside the encyclopedia' },
        { osTerm: 'Physical Frame', realWorld: 'Any standard empty slot on a library bookshelf' },
        { osTerm: 'Page Table', realWorld: 'Master directory mapping Volume # to Shelf Slot #' },
        { osTerm: 'TLB (Translation Lookaside Buffer)', realWorld: 'Pocket sticky note caching the 5 shelves you visit most' },
        { osTerm: 'External Fragmentation', realWorld: 'Scattered tiny shelf gaps too narrow for a full set' },
      ],
    },
    steps: [
      {
        stepNumber: '01',
        title: 'Logical vs. Physical Address & The MMU',
        explanation:
          'The CPU generates a Logical (virtual) Address; the physical RAM hardware sees a Physical Address. The Memory Management Unit (MMU) performs run-time mapping between the two, using Base and Limit registers in simple systems or Page Tables in paged systems.',
        keyTakeaway: 'Base + Limit registers ensure a process cannot read or write outside its allocated memory bounds.',
      },
      {
        stepNumber: '02',
        title: 'Contiguous Allocation & Fragmentation',
        explanation:
          'When processes occupy one contiguous block of RAM, holes appear as processes finish. First-Fit picks the first large enough hole, Best-Fit picks the smallest sufficient hole, and Worst-Fit picks the largest hole. Over time, small unusable holes create External Fragmentation.',
        keyTakeaway: 'First-Fit and Best-Fit generally outperform Worst-Fit in both speed and memory utilization.',
      },
      {
        stepNumber: '03',
        title: 'Paging: Eliminating External Fragmentation',
        explanation:
          'Paging divides physical memory into fixed-size blocks called Frames and logical memory into same-size blocks called Pages. Every Logical Address splits into a Page Number (p) and Page Offset (d). The Page Table maps p to a Frame Number (f), yielding Physical Address = f × PageSize + d.',
        keyTakeaway: 'Paging eliminates External Fragmentation completely, leaving at most minor Internal Fragmentation in the last page.',
      },
      {
        stepNumber: '04',
        title: 'Accelerating Lookup with the TLB',
        explanation:
          'Reading the Page Table in RAM for every memory instruction would double memory access time. Hardware solves this with the Translation Lookaside Buffer (TLB), a fast associative cache holding recent (Page -> Frame) pairs. On a TLB Hit, translation happens in a single hardware cycle.',
        keyTakeaway: 'Effective Access Time (EAT) depends heavily on the TLB Hit Ratio α.',
      },
    ],
    labTitle: 'Paging & TLB Translator + Contiguous Allocator Lab',
    labPrompt:
      'Translate Logical Addresses step-by-step through the TLB and Page Table, or switch to the Contiguous Allocation tab to compare First-Fit, Best-Fit, and Worst-Fit fragmentation.',
    summary: [
      'The MMU translates CPU Logical Addresses into RAM Physical Addresses at run time.',
      'Contiguous Allocation (First-Fit, Best-Fit, Worst-Fit) suffers from External Fragmentation.',
      'Paging breaks RAM into Frames and logical space into Pages, eliminating External Fragmentation.',
      'The TLB caches frequent Page-to-Frame mappings to achieve near-native memory access speed.',
    ],
    keyTerms: [
      {
        term: 'MMU (Memory Management Unit)',
        definition: 'Hardware device that maps virtual/logical addresses to physical RAM addresses during execution.',
      },
      {
        term: 'External Fragmentation',
        definition: 'Total free memory exists to satisfy a request, but it is broken into non-contiguous holes too small to use.',
      },
      {
        term: 'Internal Fragmentation',
        definition: 'Unused memory inside an allocated fixed-size block (such as the unused tail of a process’s last Page).',
      },
      {
        term: 'Page & Frame',
        definition: 'A Page is a fixed-size block of logical memory; a Frame is an equal-sized block of physical RAM.',
      },
      {
        term: 'Page Table',
        definition: 'Per-process data structure storing the physical Frame number corresponding to each logical Page number.',
      },
      {
        term: 'TLB (Translation Lookaside Buffer)',
        definition: 'A fast, associative hardware cache that stores recent Page Table translations to avoid extra RAM reads.',
      },
    ],
    quiz: [
      {
        id: 'mem-q1',
        question: 'Suppose a system uses 4 KB pages (4,096 bytes) and Logical Address = 9,000. What are the Page Number (p) and Offset (d)?',
        options: [
          'p = 2, d = 808',
          'p = 2, d = 900',
          'p = 3, d = 100',
          'p = 1, d = 4904',
        ],
        correctIndex: 0,
        explanation:
          '9,000 ÷ 4,096 = 2 with a remainder of 9,000 − (2 × 4,096) = 9,000 − 8,192 = 808. So p = 2 and d = 808.',
      },
      {
        id: 'mem-q2',
        question: 'Which problem does Paging completely eliminate compared to variable-size Contiguous Allocation?',
        options: [
          'Internal Fragmentation',
          'External Fragmentation',
          'Context Switching overhead',
          'Need for a CPU Program Counter',
        ],
        correctIndex: 1,
        explanation:
          'Because any free Frame can be assigned to any process needing a Page, memory never breaks into unusable variable-sized gaps—eliminating External Fragmentation.',
      },
      {
        id: 'mem-q3',
        question: 'If a TLB lookup takes 10 ns, main memory access takes 100 ns, and the TLB Hit Ratio is 90%, what is the Effective Access Time (EAT) assuming a single-level Page Table?',
        options: [
          '110 ns',
          '120 ns',
          '190 ns',
          '210 ns',
        ],
        correctIndex: 1,
        explanation:
          'On a TLB Hit (0.90): 10 + 100 = 110 ns. On a TLB Miss (0.10): 10 + 100 (page table) + 100 (data) = 210 ns. EAT = 0.90(110) + 0.10(210) = 99 + 21 = 120 ns.',
      },
      {
        id: 'mem-q4',
        question: 'Given free memory holes of [100 KB, 500 KB, 200 KB, 300 KB, 600 KB] in order, which hole does Best-Fit choose for a 212 KB process?',
        options: [
          '500 KB',
          '200 KB',
          '300 KB',
          '600 KB',
        ],
        correctIndex: 2,
        explanation:
          'Best-Fit scans all holes and chooses the smallest hole that is >= 212 KB. Between 500, 300, and 600, 300 KB leaves the smallest leftover fragment (88 KB).',
      },
    ],
  },
  {
    id: 'virtual-memory',
    number: '06',
    title: 'Virtual Memory',
    shortTitle: 'Virtual Memory',
    silberschatzRef: 'Silberschatz Ch. 10',
    estimatedMinutes: 15,
    overview:
      'Programs rarely need every single page in RAM simultaneously. Virtual Memory separates user logical memory from physical RAM via Demand Paging, allowing processes larger than physical memory to run—provided Page Replacement avoids Thrashing.',
    analogy: {
      title: 'A Compact Study Desk and a Large Filing Cabinet',
      scenario:
        'You do not spread all 50 textbooks across a small study desk at once (physical RAM Frames). You place only the 3 chapters you are actively reading on the desk and keep the rest in a filing cabinet (Backing Store / Disk). Reaching for a chapter not on the desk is a Page Fault: you pause, fetch it from the cabinet, and if the desk is full, file away an older chapter (Page Replacement). If you spend all your time swapping folders instead of reading, that is Thrashing.',
      mapping: [
        { osTerm: 'Physical RAM Frames', realWorld: 'Limited surface slots on your study desk' },
        { osTerm: 'Backing Store (Swap Disk)', realWorld: 'Large filing cabinet holding every chapter' },
        { osTerm: 'Page Fault', realWorld: 'Stopping work to walk over and fetch a missing folder' },
        { osTerm: 'LRU Page Replacement', realWorld: 'Putting away the folder you haven’t touched in the longest time' },
        { osTerm: 'Thrashing', realWorld: 'Constantly swapping folders every second with zero real studying done' },
      ],
    },
    steps: [
      {
        stepNumber: '01',
        title: 'Demand Paging & The Valid-Invalid Bit',
        explanation:
          'With Demand Paging, pages are loaded into RAM only when actually referenced. Each Page Table entry holds a Valid-Invalid Bit: v means the page is in RAM; i means it is either invalid or currently on Backing Store (disk). Accessing an i-marked valid page triggers a Page Fault trap.',
        keyTakeaway: 'Programs only pay the I/O cost for the pages they actually execute or touch.',
      },
      {
        stepNumber: '02',
        title: 'Handling a Page Fault in 6 Steps',
        explanation:
          'When a Page Fault occurs: (1) Hardware traps to OS; (2) OS verifies the reference is legal; (3) OS locates a free Frame; (4) OS schedules disk read to load the page into the Frame; (5) OS updates the Page Table bit to v; (6) OS restarts the interrupted instruction seamlessly.',
        keyTakeaway: 'A Page Fault is orders of magnitude slower than a RAM hit (milliseconds vs. nanoseconds).',
      },
      {
        stepNumber: '03',
        title: 'Page Replacement: FIFO, Optimal, and LRU',
        explanation:
          'When all physical frames are full, the OS must evict a victim page. FIFO evicts the oldest loaded page (vulnerable to Belady’s Anomaly, where more frames can paradoxically cause more faults). Optimal (OPT) evicts the page unused for the longest time in the future (benchmark ideal). LRU approximates Optimal using recent past history.',
        keyTakeaway: 'LRU and Optimal are Stack Algorithms—they never suffer from Belady’s Anomaly.',
      },
      {
        stepNumber: '04',
        title: 'Thrashing & The Working-Set Model',
        explanation:
          'If too many processes run concurrently without enough frames to hold their active locality (their Working Set), processes fault nonstop. CPU utilization collapses while disk paging saturates—a state called Thrashing. The OS cures Thrashing by suspending processes so remaining ones get full Working Sets.',
        keyTakeaway: 'Effective Virtual Memory relies on Locality of Reference (temporal and spatial).',
      },
    ],
    labTitle: 'Page Replacement Simulator (FIFO / LRU / Optimal)',
    labPrompt:
      'Adjust the physical frame count, pick a reference string, and step through FIFO, LRU, or Optimal page replacement to watch Page Hits, Page Faults, and Belady’s Anomaly live.',
    summary: [
      'Demand Paging loads pages lazily upon Page Fault, letting programs exceed physical RAM size.',
      'Page Faults trap to the OS, load the missing page from disk into a frame, set Valid = v, and restart the instruction.',
      'FIFO is simple but exhibits Belady’s Anomaly; LRU uses past recency to approximate the Optimal future-looking policy.',
      'Thrashing happens when total Working-Set demand exceeds available physical frames.',
    ],
    keyTerms: [
      {
        term: 'Demand Paging',
        definition: 'Virtual memory technique where pages are loaded into physical memory only when referenced during execution.',
      },
      {
        term: 'Page Fault',
        definition: 'A trap raised when a process accesses a logical page whose Page Table Valid-Invalid Bit indicates it is not currently in RAM.',
      },
      {
        term: 'Belady’s Anomaly',
        definition: 'The counterintuitive phenomenon (seen in FIFO) where allocating more physical frames increases the number of Page Faults.',
      },
      {
        term: 'LRU (Least Recently Used)',
        definition: 'A page replacement algorithm that evicts the page that has not been referenced for the longest period of time.',
      },
      {
        term: 'Thrashing',
        definition: 'High paging activity where a system spends more time swapping pages between RAM and disk than executing instructions.',
      },
      {
        term: 'Working Set',
        definition: 'The set of pages a process is actively referencing within the most recent Δ memory-reference window.',
      },
    ],
    quiz: [
      {
        id: 'vm-q1',
        question: 'What happens during a Page Fault once the Operating System verifies that the memory access is legal?',
        options: [
          'The process is immediately terminated for invalid memory access',
          'The OS finds a free frame, loads the page from backing store, sets the Valid bit to v, and restarts the instruction',
          'The TLB is cleared and the CPU halts permanently',
          'The page is skipped and the next instruction runs with zero delay',
        ],
        correctIndex: 1,
        explanation:
          'A valid Page Fault is a normal virtual-memory event: the OS fetches the missing page from disk into a frame, updates the Page Table entry, and restarts the trapped instruction.',
      },
      {
        id: 'vm-q2',
        question: 'Which Page Replacement algorithm can suffer from Belady’s Anomaly?',
        options: [
          'Optimal (OPT)',
          'Least Recently Used (LRU)',
          'First-In, First-Out (FIFO)',
          'Working-Set Clock',
        ],
        correctIndex: 2,
        explanation:
          'FIFO is not a stack algorithm, so for certain reference strings (like 1,2,3,4,1,2,5,1,2,3,4,5) increasing frames from 3 to 4 produces MORE page faults.',
      },
      {
        id: 'vm-q3',
        question: 'Why cannot a general-purpose OS directly run the Optimal (OPT) Page Replacement algorithm?',
        options: [
          'OPT produces more page faults than FIFO',
          'OPT requires knowing the future sequence of memory references',
          'OPT only works with a single frame',
          'OPT breaks Dual-Mode hardware protection',
        ],
        correctIndex: 1,
        explanation:
          'Optimal replacement evicts the page that will not be used for the longest time in the future—impossible to know ahead of time, making OPT a theoretical benchmark.',
      },
      {
        id: 'vm-q4',
        question: 'If CPU utilization drops sharply while disk paging I/O climbs toward 100%, what is the system experiencing?',
        options: [
          'The Convoy Effect',
          'Thrashing',
          'External Fragmentation',
          'TLB Saturation',
        ],
        correctIndex: 1,
        explanation:
          'That classic symptom—low CPU utilization paired with heavy swap disk activity—signals Thrashing, because processes lack enough frames for their Working Sets.',
      },
    ],
  },
  {
    id: 'file-systems',
    number: '07',
    title: 'File Systems',
    shortTitle: 'File Systems',
    silberschatzRef: 'Silberschatz Ch. 13 & 14',
    estimatedMinutes: 13,
    overview:
      'Storage hardware exposes raw numbered blocks, while users expect named files and folders. The File System bridges that gap using Directory Structures, File Control Blocks (FCBs / i-nodes), and Allocation Methods that balance sequential speed, random access, and fragmentation.',
    analogy: {
      title: 'Three Ways to Organize Pages of a Book',
      scenario:
        'Contiguous allocation prints your essay on consecutive pages 10–14—fast to read straight through, but impossible to expand if page 15 is already taken. Linked allocation is a treasure hunt where page 10 tells you the next clue is on page 42, making random jumps slow. Indexed allocation (like a UNIX i-node) puts a Table of Contents card at the front listing every page number directly.',
      mapping: [
        { osTerm: 'Contiguous Allocation', realWorld: 'Consecutive bound pages 10–14 (fast read, hard to grow)' },
        { osTerm: 'Linked Allocation', realWorld: 'Scavenger-hunt note on each page pointing to the next' },
        { osTerm: 'Indexed Allocation (i-node)', realWorld: 'Table of Contents listing every exact block address' },
        { osTerm: 'Free-Space Bit Vector', realWorld: 'Grid of checkboxes marking each seat occupied (0) or free (1)' },
        { osTerm: 'Directory Structure', realWorld: 'Library signage mapping human names to catalog IDs' },
      ],
    },
    steps: [
      {
        stepNumber: '01',
        title: 'File Attributes, Operations & Open-File Table',
        explanation:
          'A file is a logical storage unit with attributes (name, identifier, type, size, permissions, timestamps). To avoid searching directories on every read()/write(), open() caches metadata in a System-Wide and Per-Process Open-File Table, returning a lightweight File Descriptor.',
        keyTakeaway: 'Once opened, subsequent file operations use the integer File Descriptor instead of re-parsing path strings.',
      },
      {
        stepNumber: '02',
        title: 'Directory Structures & Symbolic Links',
        explanation:
          'Modern OSs organize files using Tree-Structured or Acyclic-Graph Directories. Hard Links point two directory names to the exact same underlying i-node (tracked by a link count), whereas Symbolic Links store a separate file containing the target path name.',
        keyTakeaway: 'Deleting a file removes it from disk only when its hard-link reference count drops to zero.',
      },
      {
        stepNumber: '03',
        title: 'Allocation Methods: Contiguous, Linked & Indexed',
        explanation:
          'Contiguous Allocation stores a file in consecutive blocks (great sequential & random access, suffers External Fragmentation). Linked Allocation chains blocks via pointers (no external fragmentation, terrible random access). Indexed Allocation stores all block pointers in an Index Block (or multi-level UNIX i-node), supporting fast direct access without external fragmentation.',
        keyTakeaway: 'Multi-level UNIX i-nodes combine direct pointers for tiny files with indirect pointers for huge files.',
      },
      {
        stepNumber: '04',
        title: 'Free-Space Management (Bit Vector / Bitmap)',
        explanation:
          'The File System tracks unused disk blocks via a Free-Space List—most commonly a Bit Vector where each block is represented by 1 bit (1 = free, 0 = allocated). CPUs include bit-manipulation instructions to locate the first free block in nanoseconds.',
        keyTakeaway: 'A 1 TB disk with 4 KB blocks needs a compact bitmap of roughly 32 MB.',
      },
    ],
    labTitle: 'Disk Block Allocation & i-node Seek Explorer',
    labPrompt:
      'Create, read (sequential vs. random block access), and delete files across a 32-block disk under Contiguous, Linked, and Indexed (i-node) allocation to compare pointer hops and fragmentation.',
    summary: [
      'The Open-File Table avoids repeated directory lookups by caching file descriptors upon open().',
      'Contiguous Allocation excels at sequential speed but struggles with file growth and External Fragmentation.',
      'Linked Allocation eliminates external fragmentation but requires O(n) pointer traversal for random access.',
      'Indexed Allocation (i-node) achieves O(1) direct block lookup with zero external fragmentation.',
    ],
    keyTerms: [
      {
        term: 'File Control Block (FCB) / i-node',
        definition: 'On-disk metadata structure holding file ownership, permissions, size, timestamps, and pointers to data blocks.',
      },
      {
        term: 'Contiguous Allocation',
        definition: 'Allocation method requiring each file to occupy a set of adjacent blocks on the storage device.',
      },
      {
        term: 'Linked Allocation',
        definition: 'Allocation method where each data block contains a pointer to the next block in the file chain.',
      },
      {
        term: 'Indexed Allocation',
        definition: 'Allocation method that gathers all block pointers for a file into a single Index Block (or multi-level i-node).',
      },
      {
        term: 'Bit Vector (Bitmap)',
        definition: 'Free-space management structure using one bit per disk block to indicate whether the block is free or allocated.',
      },
      {
        term: 'Hard Link vs. Symbolic Link',
        definition: 'A Hard Link shares the exact same i-node number; a Symbolic Link is a special file holding a pathname pointer.',
      },
    ],
    quiz: [
      {
        id: 'fs-q1',
        question: 'Which File Allocation method supports fast O(1) random access to any block while completely avoiding External Fragmentation?',
        options: [
          'Contiguous Allocation',
          'Linked Allocation',
          'Indexed Allocation (i-node)',
          'Linear Tape Allocation',
        ],
        correctIndex: 2,
        explanation:
          'Indexed Allocation lets the OS jump straight to the i-th block pointer inside the Index Block / i-node without scanning previous blocks or requiring contiguous disk space.',
      },
      {
        id: 'fs-q2',
        question: 'What is the main disadvantage of basic Linked Allocation for large files?',
        options: [
          'Files cannot grow dynamically after creation',
          'It causes severe External Fragmentation on disk',
          'Random access to block k requires traversing k − 1 blocks from the start',
          'It cannot be used with tree-structured directories',
        ],
        correctIndex: 2,
        explanation:
          'Because pointers live inside each data block, reaching the middle of a file under basic Linked Allocation forces sequential disk reads from block 0.',
      },
      {
        id: 'fs-q3',
        question: 'Why does a UNIX i-node use direct pointers plus single, double, and triple indirect pointers?',
        options: [
          'To encrypt user files with three separate keys',
          'To keep metadata tiny for small files while still scaling to massive multi-gigabyte files',
          'To force all files into Contiguous Allocation',
          'To replace the Need for a Free-Space Bit Vector',
        ],
        correctIndex: 1,
        explanation:
          'Most files are small and fit inside the ~12 direct pointers (1 hop), while indirect blocks expand capacity exponentially only when a file grows large.',
      },
      {
        id: 'fs-q4',
        question: 'If a Symbolic Link points to /docs/report.txt and the user deletes /docs/report.txt, what happens?',
        options: [
          'The file data stays alive through the symbolic link',
          'The symbolic link becomes a dangling pointer that fails when opened',
          'The entire directory /docs is automatically deleted',
          'The file is converted into a Contiguous Allocation block',
        ],
        correctIndex: 1,
        explanation:
          'Unlike a Hard Link (which increments the i-node reference count), a Symbolic Link simply stores a path string; deleting the target leaves a dangling link.',
      },
    ],
  },
];

export const ALL_GLOSSARY_TERMS = CHAPTERS.flatMap((chapter) =>
  chapter.keyTerms.map((kt) => ({
    ...kt,
    chapterId: chapter.id,
    chapterTitle: `${chapter.number}. ${chapter.shortTitle}`,
  }))
);
