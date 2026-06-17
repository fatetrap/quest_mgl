// --- SPACED REPETITION ENGINE ---
//
// A lightweight Leitner-style spaced repetition system (SRS). Every word lives
// in a "box" from 1 (struggling / brand new) to MAX_BOX (mastered). Correct
// answers promote a word one box; mistakes send it back to box 1. Selection is
// weighted so that weak and unseen words appear far more often than mastered
// ones — the same principle Anki/SuperMemo use to fight the forgetting curve.
//
// Why this design (grounded in learning-science research):
//  - Spaced repetition: reviewing material at expanding intervals can improve
//    long-term retention dramatically vs. random or massed practice.
//  - Testing effect / retrieval practice: difficulty escalates with mastery
//    (recognition -> recall), because effortful retrieval strengthens memory.
//  - Immediate feedback and per-word tracking support self-directed learning.
//
// All progress is persisted to localStorage so a learner's mastery carries
// across sessions.

import { Challenge, ReviewMode } from './types';

export const MAX_BOX = 5;
const STORAGE_KEY = 'quest_mgl_srs_v1';

export interface WordProgress {
  box: number;       // Leitner box, 1..MAX_BOX
  seen: number;      // total times the word has been shown
  correct: number;   // total correct answers
  streak: number;    // current consecutive correct answers
  lastRound: number; // session round index when last shown (in-session spacing)
}

export type ProgressMap = Record<string, WordProgress>;

const freshWord = (): WordProgress => ({
  box: 1,
  seen: 0,
  correct: 0,
  streak: 0,
  lastRound: -999,
});

export const getWord = (progress: ProgressMap, phrase: string): WordProgress =>
  progress[phrase] ?? freshWord();

// --- Persistence -----------------------------------------------------------

export const loadProgress = (): ProgressMap => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as ProgressMap) : {};
  } catch {
    return {};
  }
};

export const saveProgress = (progress: ProgressMap): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage may be unavailable (private mode / quota) — fail silently.
  }
};

// --- Leitner update --------------------------------------------------------

export const recordResult = (
  progress: ProgressMap,
  phrase: string,
  isCorrect: boolean,
  round: number,
): ProgressMap => {
  const w = getWord(progress, phrase);
  const next: WordProgress = {
    box: isCorrect ? Math.min(MAX_BOX, w.box + 1) : 1,
    seen: w.seen + 1,
    correct: w.correct + (isCorrect ? 1 : 0),
    streak: isCorrect ? w.streak + 1 : 0,
    lastRound: round,
  };
  return { ...progress, [phrase]: next };
};

// --- Difficulty escalation -------------------------------------------------

// Map a word's mastery box to how it should be tested. Climbing the test-format
// hierarchy (recognition -> recall) introduces "desirable difficulty" only once
// the learner can handle it.
export const modeForBox = (box: number): ReviewMode => {
  if (box <= 2) return 'CHOICE_HINTED';
  if (box <= 4) return 'CHOICE';
  return 'TYPE';
};

// --- Weighted selection ----------------------------------------------------

const weightFor = (
  w: WordProgress,
  round: number,
): number => {
  // New words get a moderate weight so fresh material is steadily introduced
  // without drowning out review of words the learner is actively struggling on.
  let base = w.seen === 0 ? 12 : Math.pow(MAX_BOX - w.box + 1, 2); // box1=25 .. box5=1

  // In-session spacing: avoid showing the same word twice in quick succession.
  if (w.seen > 0) {
    const since = round - w.lastRound;
    if (since <= 1) base *= 0.1;
    else if (since <= 2) base *= 0.5;
  }

  return Math.max(base, 0.01);
};

// Pick the next challenge using box-weighted randomness. `avoidPhrase` (the word
// just shown) is excluded outright so it never repeats back-to-back.
export const selectChallenge = (
  challenges: Challenge[],
  progress: ProgressMap,
  round: number,
  avoidPhrase?: string,
): Challenge => {
  const pool = challenges.filter(c => c.phrase !== avoidPhrase);
  const candidates = pool.length > 0 ? pool : challenges;

  const weights = candidates.map(c => weightFor(getWord(progress, c.phrase), round));
  const total = weights.reduce((sum, w) => sum + w, 0);

  let roll = Math.random() * total;
  for (let i = 0; i < candidates.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
};

// --- Free-recall answer matching -------------------------------------------

// Normalize a typed answer so trivial differences don't count as wrong:
// case, surrounding whitespace, leading articles, and punctuation.
export const normalizeAnswer = (s: string): string =>
  s
    .toLowerCase()
    .trim()
    .replace(/^(a|an|the)\s+/, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const levenshtein = (a: string, b: string): number => {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array<number>(n + 1);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
};

// Accept a typed answer if it matches the target after normalization, tolerating
// a single typo on words long enough that a near-miss is clearly the same word.
export const isRecallCorrect = (typed: string, target: string): boolean => {
  const a = normalizeAnswer(typed);
  const b = normalizeAnswer(target);
  if (a.length === 0) return false;
  if (a === b) return true;
  if (b.length >= 4 && levenshtein(a, b) <= 1) return true;
  return false;
};

// --- Aggregate stats (for the glossary / HUD) ------------------------------

export interface MasteryStats {
  total: number;     // total words in the deck
  started: number;   // words seen at least once
  mastered: number;  // words at the top box
}

export const masteryStats = (
  challenges: Challenge[],
  progress: ProgressMap,
): MasteryStats => {
  let started = 0;
  let mastered = 0;
  for (const c of challenges) {
    const w = getWord(progress, c.phrase);
    if (w.seen > 0) started++;
    if (w.box >= MAX_BOX) mastered++;
  }
  return { total: challenges.length, started, mastered };
};
