export type Language = 'javascript' | 'typescript' | 'python' | 'rust' | 'cpp' | 'java';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Category = 
  | 'Algorithms' 
  | 'Arrays & Objects' 
  | 'Async & Promises' 
  | 'Math & Logic' 
  | 'Strings' 
  | 'Data Structures';

export interface TestCase {
  id: string;
  description: string;
  input: any[];
  expected?: any;
  shouldThrow?: boolean;
  expectedErrorSubstring?: string;
  hidden?: boolean;
}

export interface TestResult {
  testCaseId: string;
  description: string;
  passed: boolean;
  actual?: any;
  expected: any;
  error?: string;
  logs?: string[];
  executionTimeMs?: number;
  hidden?: boolean;
}

export interface ExecutionSummary {
  allPassed: boolean;
  totalTests: number;
  passedCount: number;
  results: TestResult[];
  stdout: string[];
  executionError?: string;
  durationMs: number;
}

export interface Challenge {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  language: Language;
  category: Category;
  tags: string[];
  estimatedMinutes: number;
  description: string;
  bugClue: string;
  buggyCode: string;
  expectedSolution: string;
  functionName: string;
  hint?: string;
  bugExplanation?: string;
  testCases: TestCase[];
}

export interface ChallengeStats {
  challengeId: string;
  completed: boolean;
  bestScore: number;
  fastestTimeSeconds: number;
  totalAttempts: number;
  lastCompletedAt?: number;
  history: {
    timestamp: number;
    score: number;
    timeSeconds: number;
    attempts: number;
  }[];
}

export interface UserProgress {
  statsByChallengeId: Record<string, ChallengeStats>;
  lastActiveChallengeId?: string;
  activeDrafts: Record<string, string>;
}

export interface ScoreBreakdown {
  baseScore: number;
  attemptPenalty: number;
  timePenalty: number;
  finalScore: number;
}
