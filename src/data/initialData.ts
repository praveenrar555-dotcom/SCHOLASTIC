import { Deck, Flashcard, CornellNote, StudyTask, QuizQuestion, StudyStats } from '../types/study';

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const twoDaysAgo = new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0];
const threeDaysAgo = new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0];
const fourDaysAgo = new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0];

export const INITIAL_DECKS: Deck[] = [
  {
    id: 'deck-cogsci',
    title: 'Cognitive Science & Learning Mechanics',
    description: 'Evidence-based cognitive architectures, active recall, dual coding, and memory consolidation.',
    subject: 'Psychology',
    accentColor: 'indigo',
    createdAt: fourDaysAgo,
    updatedAt: today,
  },
  {
    id: 'deck-systems',
    title: 'Distributed Systems & Data Structures',
    description: 'Algorithmic complexity, B-Trees, CAP theorem, cache eviction policies, and consensus protocols.',
    subject: 'Computer Science',
    accentColor: 'emerald',
    createdAt: threeDaysAgo,
    updatedAt: today,
  },
  {
    id: 'deck-physio',
    title: 'Human Physiology & Homeostasis',
    description: 'Action potentials, cellular respiration, renal autoregulation, and neuroendocrine signaling.',
    subject: 'Medicine',
    accentColor: 'rose',
    createdAt: twoDaysAgo,
    updatedAt: today,
  }
];

export const INITIAL_CARDS: Flashcard[] = [
  // Cognitive Science Deck
  {
    id: 'card-cs-1',
    deckId: 'deck-cogsci',
    question: 'What is the Testing Effect (Retrieval Practice) and why is it superior to passive rereading?',
    answer: 'Retrieval practice actively reconstructs memory traces, strengthening neural pathways and creating contextual associations. Passive re-reading creates an "illusion of competence" via perceptual fluency without reinforcing retrieval routes.',
    hint: 'Think of Roediger & Karpicke (2006) landmark study.',
    extraNotes: 'Testing changes the memory representation itself, making knowledge significantly more resistant to decay over time.',
    tags: ['Active Recall', 'Memory', 'Metacognition'],
    box: 3,
    intervalDays: 4,
    nextReviewDate: today,
    repetitions: 3,
    lapses: 0
  },
  {
    id: 'card-cs-2',
    deckId: 'deck-cogsci',
    question: 'Explain the three types of cognitive load in Sweller’s Cognitive Load Theory.',
    answer: '1. Intrinsic Load: Inherent difficulty of the material itself.\n2. Extraneous Load: Interference introduced by poor instructional design or unnecessary split attention.\n3. Germane Load: Productive mental effort dedicated to schema construction and automation.',
    hint: 'Intrinsic, Extraneous, and Germane.',
    extraNotes: 'Effective study environments minimize extraneous load while scaffolding intrinsic complexity.',
    tags: ['Cognitive Load', 'Pedagogy'],
    box: 2,
    intervalDays: 2,
    nextReviewDate: today,
    repetitions: 2,
    lapses: 0
  },
  {
    id: 'card-cs-3',
    deckId: 'deck-cogsci',
    question: 'What is the Interleaving Effect and when does it outperform blocked practice?',
    answer: 'Interleaving alternates between different but related skills or problem types during study. While it feels harder during acquisition (desirable difficulty), it trains discrimination between problem categories and leads to superior long-term retention and transfer.',
    hint: 'Contrasts with AAA-BBB-CCC blocking.',
    tags: ['Desirable Difficulties', 'Retention'],
    box: 4,
    intervalDays: 7,
    nextReviewDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    repetitions: 4,
    lapses: 0
  },
  {
    id: 'card-cs-4',
    deckId: 'deck-cogsci',
    question: 'What is Paivio’s Dual-Coding Theory?',
    answer: 'Human cognition processes information through two separate but interacting modalities: non-verbal (visual imagery) and verbal (linguistic). Presenting information through both codes simultaneously provides two distinct retrieval pathways.',
    hint: 'Visual + Verbal mental models.',
    tags: ['Dual Coding', 'Visualization'],
    box: 1,
    intervalDays: 1,
    nextReviewDate: today,
    repetitions: 1,
    lapses: 1
  },

  // Computer Science Deck
  {
    id: 'card-sys-1',
    deckId: 'deck-systems',
    question: 'Why are B-Trees preferred over Binary Search Trees for on-disk database indexing?',
    answer: 'Disk I/O is orders of magnitude slower than CPU memory. B-Trees have a very high branching factor (fan-out), which keeps the tree shallow (height 3-4 can hold millions of keys). This minimizes the number of random disk seeks required to locate a record.',
    hint: 'Block reads and shallow tree depth.',
    extraNotes: 'A typical B-Tree node matches the filesystem page size (4KB or 8KB).',
    tags: ['Databases', 'Disk I/O', 'Trees'],
    box: 3,
    intervalDays: 4,
    nextReviewDate: today,
    repetitions: 3,
    lapses: 0
  },
  {
    id: 'card-sys-2',
    deckId: 'deck-systems',
    question: 'What is the Amortized Time Complexity of resizing dynamic arrays (e.g. Vector/ArrayList)?',
    answer: 'Amortized O(1). When capacity is exceeded, the array doubles in size (O(n) copy). However, doubling means n operations take ~2n total work, distributing the expensive copy cost across all insertions such that each operation costs O(1) on average.',
    hint: 'Geometric expansion factor (typically 2x or 1.5x).',
    tags: ['Algorithms', 'Complexity'],
    box: 2,
    intervalDays: 2,
    nextReviewDate: today,
    repetitions: 2,
    lapses: 0
  },
  {
    id: 'card-sys-3',
    deckId: 'deck-systems',
    question: 'Define the CAP Theorem trade-offs in distributed systems.',
    answer: 'In any network-partitioned distributed data store (P), one must choose between Consistency (C: every read receives the most recent write or an error) and Availability (A: every non-failing node returns a response, without guarantee that it is the latest write).',
    hint: 'Partition tolerance is non-negotiable in real networks.',
    tags: ['Distributed Systems', 'Architecture'],
    box: 5,
    intervalDays: 14,
    nextReviewDate: new Date(Date.now() + 86400000 * 8).toISOString().split('T')[0],
    repetitions: 5,
    lapses: 0
  },

  // Human Physiology Deck
  {
    id: 'card-phy-1',
    deckId: 'deck-physio',
    question: 'What ion channels drive the Depolarization and Repolarization phases of a neuronal action potential?',
    answer: 'Depolarization: Voltage-gated Na+ channels rapidly open, allowing Na+ to rush into the cell down its electrochemical gradient.\nRepolarization: Na+ channels inactivate, and voltage-gated K+ channels slowly open, allowing K+ to exit the cell, restoring the negative membrane potential.',
    hint: 'Sodium influx followed by potassium efflux.',
    tags: ['Neurobiology', 'Biophysics'],
    box: 2,
    intervalDays: 2,
    nextReviewDate: today,
    repetitions: 2,
    lapses: 0
  },
  {
    id: 'card-phy-2',
    deckId: 'deck-physio',
    question: 'Explain the mechanism of the Frank-Starling Law of the Heart.',
    answer: 'The stroke volume of the heart increases in response to an increase in the volume of blood in the ventricles before contraction (end-diastolic volume). Increased stretch optimizes actin-myosin filament overlap and increases troponin C sensitivity to calcium.',
    hint: 'Pre-load and muscle fiber stretch.',
    tags: ['Cardiology', 'Biomechanics'],
    box: 1,
    intervalDays: 1,
    nextReviewDate: today,
    repetitions: 1,
    lapses: 0
  }
];

export const INITIAL_NOTES: CornellNote[] = [
  {
    id: 'note-ltp',
    title: 'Neurobiology of Long-Term Potentiation (LTP)',
    subject: 'Neuroscience',
    date: yesterday,
    tags: ['Synaptic Plasticity', 'Memory', 'Neurochemistry'],
    cues: [
      {
        id: 'cue-1',
        prompt: 'What triggers NMDA receptor activation?',
        detail: 'Depolarization of postsynaptic membrane expels the blocking Mg2+ ion, allowing Ca2+ influx.'
      },
      {
        id: 'cue-2',
        prompt: 'What is CaMKII’s role in early LTP?',
        detail: 'Phosphorylates AMPA receptors to increase conductance and drives insertion of new AMPA receptors into dendritic spines.'
      },
      {
        id: 'cue-3',
        prompt: 'How does late LTP achieve permanence?',
        detail: 'Requires gene transcription via CREB pathway and local dendritic protein synthesis to enlarge synaptic architecture.'
      }
    ],
    notes: `### Overview of Synaptic Plasticity
Long-Term Potentiation (LTP) is the primary cellular model for how memory is encoded in neural circuits. First characterized in the hippocampus by Bliss & Lømo.

### Receptor Dynamics
* **AMPA Receptors:** Fast ligand-gated Na+ channels that mediate baseline excitatory neurotransmission.
* **NMDA Receptors:** Act as coincidence detectors requiring both glutamate binding AND postsynaptic depolarization (to dislodge the physiological Mg2+ plug).
* **Calcium Influx:** Triggers downstream second-messenger cascades, notably CaMKII (calcium/calmodulin-dependent protein kinase II) and PKC.

### Structural Changes
1. Spine enlargement and actin cytoskeleton polymerization.
2. Retrograde signaling (nitric oxide) enhancing presynaptic neurotransmitter release probability.
3. Retrograde spine remodeling persists for days to weeks.`,
    summary: 'LTP is the synaptic basis of memory. It converts transient stimulation into sustained synaptic strength via NMDA-dependent calcium influx, immediate AMPA receptor insertion (early phase), and CREB-mediated structural protein synthesis (late phase).'
  },
  {
    id: 'note-distributed',
    title: 'Raft Consensus Protocol & State Machine Replication',
    subject: 'Computer Science',
    date: twoDaysAgo,
    tags: ['Distributed Systems', 'Fault Tolerance'],
    cues: [
      {
        id: 'cue-d1',
        prompt: 'Three states of a Raft node?',
        detail: 'Leader, Follower, and Candidate.'
      },
      {
        id: 'cue-d2',
        prompt: 'How does leader election prevent split-brain?',
        detail: 'Randomized election timeouts (150-300ms) and majority quorum requirement (N/2 + 1).'
      },
      {
        id: 'cue-d3',
        prompt: 'Log Matching Invariant definition?',
        detail: 'If two logs contain an entry with the same index and term, they are identical up to that entry.'
      }
    ],
    notes: `### The Consensus Problem
Distributed systems need multiple nodes to agree on a sequence of state transitions despite network delays, packet drops, or node restarts.

### Key Phases
* **Leader Election:** Followers expect periodic heartbeats. When heartbeat times out, a node transitions to Candidate, increments term, votes for itself, and requests votes.
* **Log Replication:** The leader receives client commands, writes to its local log, sends AppendEntries RPCs to all peers, and commits once a majority quorum replies.
* **Safety Invariant:** A leader never overwrites its own entries and only commits entries from its current term.`,
    summary: 'Raft breaks consensus into explicit sub-problems: randomized leader election, replicated log synchronization via majority quorum, and term-based safety invariants.'
  }
];

export const INITIAL_QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'According to the Testing Effect, which study strategy leads to the highest long-term retention over 1 week?',
    options: [
      'Repeatedly reading the chapter four consecutive times',
      'One initial reading followed by three active recall retrieval sessions',
      'Creating color-coded linear highlight annotations without self-testing',
      'Listening to audio recordings of the lecture at double speed'
    ],
    correctIndex: 1,
    explanation: 'Empirical research by Roediger & Karpicke demonstrates that retrieval practice produces substantial gains in delayed retention, whereas repeated study produces a false sense of mastery that rapidly degrades.',
    subject: 'Psychology'
  },
  {
    id: 'q2',
    question: 'In a B-Tree of order M, why is node fan-out kept deliberately large for disk storage?',
    options: [
      'To minimize CPU arithmetic instructions during binary search',
      'To reduce the tree height so fewer sequential disk seeks are required',
      'To allow nodes to be stored across multiple RAM slots simultaneously',
      'To avoid having to ever balance the tree during insertions'
    ],
    correctIndex: 1,
    explanation: 'A large fan-out minimizes the depth of the tree (height O(log_M N)), meaning very few disk I/O seek operations are needed to traverse from root to leaf.',
    subject: 'Computer Science'
  },
  {
    id: 'q3',
    question: 'Which event directly relieves the magnesium (Mg2+) ion block of the NMDA receptor during synaptic stimulation?',
    options: [
      'High concentrations of extracellular potassium (K+)',
      'Substantial depolarization of the postsynaptic membrane',
      'GABA release from neighboring inhibitory interneurons',
      'Enzymatic cleavage of the receptor by acetylcholinesterase'
    ],
    correctIndex: 1,
    explanation: 'The Mg2+ ion is physically lodged inside the NMDA pore at resting potentials; positive depolarization of the postsynaptic membrane repels the divalent cation, opening the channel to calcium.',
    subject: 'Medicine'
  },
  {
    id: 'q4',
    question: 'What is the optimal spacing gap for spaced repetition review according to cognitive research?',
    options: [
      'Reviewing every card exactly every 24 hours indefinitely',
      'Reviewing right before the probability of retrieval drops below ~85-90%',
      'Cramming everything the night before the target deadline',
      'Waiting until the memory is completely forgotten before reviewing'
    ],
    correctIndex: 1,
    explanation: 'Expanding retrieval intervals that test memory just as it is approaching the forgetting boundary produce maximum consolidation with minimal total review effort.',
    subject: 'Psychology'
  },
  {
    id: 'q5',
    question: 'In an ACID compliant database, what does the "Isolation" property guarantee?',
    options: [
      'Database files are isolated on separate physical hard drives',
      'Concurrent transactions execute without interfering with one another as if serial',
      'Once committed, data survives power failures and hardware crashes',
      'All constraints (foreign keys, uniqueness) are enforced instantly'
    ],
    correctIndex: 1,
    explanation: 'Isolation ensures that intermediate states of concurrent transactions are invisible to each other, preventing race conditions like dirty reads and non-repeatable reads.',
    subject: 'Computer Science'
  }
];

export const INITIAL_TASKS: StudyTask[] = [
  {
    id: 'task-1',
    title: 'Review due flashcards in Cognitive Science deck',
    subject: 'Psychology',
    priority: 'high',
    completed: false,
    estimatedMinutes: 20,
    completedMinutes: 0,
    dueDate: today
  },
  {
    id: 'task-2',
    title: 'Perform Cornell Active Recall blurting on Long-Term Potentiation',
    subject: 'Neuroscience',
    priority: 'high',
    completed: false,
    estimatedMinutes: 25,
    completedMinutes: 0,
    dueDate: today
  },
  {
    id: 'task-3',
    title: 'Complete 50-minute deep study block on B-Tree page algorithms',
    subject: 'Computer Science',
    priority: 'medium',
    completed: false,
    estimatedMinutes: 50,
    completedMinutes: 0,
    dueDate: today
  },
  {
    id: 'task-4',
    title: 'Self-test Practice Exam on systems architecture',
    subject: 'Computer Science',
    priority: 'medium',
    completed: true,
    estimatedMinutes: 15,
    completedMinutes: 15,
    dueDate: yesterday
  }
];

export const INITIAL_STATS: StudyStats = {
  dailyFocusMinutes: {
    [fourDaysAgo]: 45,
    [threeDaysAgo]: 75,
    [twoDaysAgo]: 60,
    [yesterday]: 90,
    [today]: 35
  },
  totalCardsReviewed: 84,
  currentStreak: 5,
  longestStreak: 12,
  lastActiveDate: today,
  totalSessions: 18
};
