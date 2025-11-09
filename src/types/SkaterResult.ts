import type { SkaterScores } from './SkaterScores';
import type { TieBreakLevel } from './TieBreakLevel';
import type { HeadToHeadResult } from './HeadToHeadResult';

export interface SkaterResult extends SkaterScores {
  totalScore: number; // Gesamtpunktzahl: sum of all judge totals (A+B per judge), used for display and Tie-break Level 4
  rank: number;
  majorityVictories: number; // M.V. / Verhältniszahl - number of pairwise victories
  tieBreakLevel?: TieBreakLevel; // Which tie-breaker determined this skater's rank (if any)
  tieBreakValue?: number; // The actual value used in the tie-breaker
  tieBreakInfo?: Array<{ level: TieBreakLevel; value: number }>; // All tie-break levels and values
  headToHeadResults?: HeadToHeadResult[]; // Detailed breakdown of each matchup
}
