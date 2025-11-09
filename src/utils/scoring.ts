import type { SkaterScores } from '../types/SkaterScores';
import type { SkaterResult } from '../types/SkaterResult';
import type { HeadToHeadResult } from '../types/HeadToHeadResult';
import type { TieBreakLevel } from '../types/TieBreakLevel';

/**
 * Calculates Gesamtpunktzahl (total score) as the sum of all judge totals.
 * This is used for display and as the final tie-breaker (Tie-break Level 4).
 */
function calculateTotalScore(skater: SkaterScores): number {
  const totals = calculateJudgeTotals(skater);
  return totals.reduce((sum, total) => sum + total, 0);
}

/**
 * Rounds a number to 1 decimal place
 */
function roundToOneDecimal(num: number): number {
  return Math.round(num * 10) / 10;
}

/**
 * Calculate individual judge totals (A + B) for a skater
 */
function calculateJudgeTotals(skater: SkaterScores): number[] {
  const numJudges = Math.max(
    skater.aScores.filter(s => s !== null).length,
    skater.bScores.filter(s => s !== null).length
  );

  const totals: number[] = [];
  for (let i = 0; i < numJudges; i++) {
    const aScore = skater.aScores[i] ?? 0;
    const bScore = skater.bScores[i] ?? 0;
    totals.push(aScore + bScore);
  }

  return totals;
}

/**
 * Compare two skaters for one judge.
 * Returns: 1 if skater1 wins, 0.5 if tie, 0 if skater2 wins
 */
function compareSkatersByJudge(
  skater1Total: number,
  skater1BScore: number,
  skater2Total: number,
  skater2BScore: number
): number {
  if (skater1Total > skater2Total) return 1;
  if (skater2Total > skater1Total) return 0;

  // Totals are equal, compare B-scores
  if (skater1BScore > skater2BScore) return 1;
  if (skater2BScore > skater1BScore) return 0;

  // Complete tie
  return 0.5;
}

/**
 * Perform pairwise comparison between two skaters across all judges.
 * Returns the comparison score for skater1 (0 to numJudges)
 */
function pairwiseComparison(
  skater1: SkaterScores,
  skater2: SkaterScores
): number {
  const totals1 = calculateJudgeTotals(skater1);
  const totals2 = calculateJudgeTotals(skater2);

  const numJudges = Math.max(totals1.length, totals2.length);
  let score = 0;

  for (let i = 0; i < numJudges; i++) {
    const total1 = totals1[i] ?? 0;
    const total2 = totals2[i] ?? 0;
    const bScore1 = skater1.bScores[i] ?? 0;
    const bScore2 = skater2.bScores[i] ?? 0;

    score += compareSkatersByJudge(total1, bScore1, total2, bScore2);
  }

  return score;
}

/**
 * Calculate detailed head-to-head results for a skater against all opponents.
 * For each opponent, determines who won and how many judges voted for each skater.
 */
function calculateHeadToHeadDetails(
  skater: SkaterScores,
  allSkaters: SkaterScores[]
): HeadToHeadResult[] {
  const results: HeadToHeadResult[] = [];

  for (const opponent of allSkaters) {
    if (opponent.name === skater.name) continue;

    // Calculate judge totals for both skaters
    const numJudges = Math.max(
      Math.max(
        skater.aScores.filter(s => s !== null).length,
        skater.bScores.filter(s => s !== null).length
      ),
      Math.max(
        opponent.aScores.filter(s => s !== null).length,
        opponent.bScores.filter(s => s !== null).length
      )
    );

    let skaterVotes = 0;
    let opponentVotes = 0;

    // For each judge, determine who won
    for (let judgeIdx = 0; judgeIdx < numJudges; judgeIdx++) {
      const skaterTotal = (skater.aScores[judgeIdx] ?? 0) + (skater.bScores[judgeIdx] ?? 0);
      const skaterBScore = skater.bScores[judgeIdx] ?? 0;
      const opponentTotal = (opponent.aScores[judgeIdx] ?? 0) + (opponent.bScores[judgeIdx] ?? 0);
      const opponentBScore = opponent.bScores[judgeIdx] ?? 0;

      const result = compareSkatersByJudge(skaterTotal, skaterBScore, opponentTotal, opponentBScore);

      if (result === 1) {
        skaterVotes++;
      } else if (result === 0) {
        opponentVotes++;
      }
      // If result is 0.5 (tie), neither gets the vote
    }

    results.push({
      opponent: opponent.name,
      won: skaterVotes > opponentVotes,
      skaterVotes,
      opponentVotes,
    });
  }

  return results;
}

/**
 * Calculate majority victories (M.V.) for each skater
 */
function calculateMajorityVictories(skaters: SkaterScores[]): Map<string, number> {
  const victories = new Map<string, number>();

  // Initialize all skaters with 0 victories
  for (const skater of skaters) {
    victories.set(skater.name, 0);
  }

  // Pairwise comparisons
  for (let i = 0; i < skaters.length; i++) {
    for (let j = i + 1; j < skaters.length; j++) {
      const skater1 = skaters[i];
      const skater2 = skaters[j];

      const score1 = pairwiseComparison(skater1, skater2);
      const numJudges = Math.max(
        calculateJudgeTotals(skater1).length,
        calculateJudgeTotals(skater2).length
      );
      const score2 = numJudges - score1;

      // Award victories based on who has majority
      if (score1 > score2) {
        victories.set(skater1.name, victories.get(skater1.name)! + 1);
      } else if (score2 > score1) {
        victories.set(skater2.name, victories.get(skater2.name)! + 1);
      } else {
        // Tie - both get 0.5
        victories.set(skater1.name, victories.get(skater1.name)! + 0.5);
        victories.set(skater2.name, victories.get(skater2.name)! + 0.5);
      }
    }
  }

  return victories;
}

/**
 * Calculate sum of B-scores for a skater
 */
function calculateBScoreSum(skater: SkaterScores): number {
  return skater.bScores
    .filter((s): s is number => s !== null)
    .reduce((sum, score) => sum + score, 0);
}

/**
 * Tie-breaking Level 1: Direct comparison of tied skaters only (Vergleichszahl)
 * Each tied skater is compared with all other tied skaters.
 */
function tieBreakByDirectComparison(
  tiedSkaters: SkaterScores[]
): Map<string, number> {
  const comparisonScores = new Map<string, number>();

  for (const skater of tiedSkaters) {
    comparisonScores.set(skater.name, 0);
  }

  // Compare each skater with all other tied skaters
  for (let i = 0; i < tiedSkaters.length; i++) {
    for (let j = i + 1; j < tiedSkaters.length; j++) {
      const skater1 = tiedSkaters[i];
      const skater2 = tiedSkaters[j];

      const score1 = pairwiseComparison(skater1, skater2);
      const numJudges = Math.max(
        calculateJudgeTotals(skater1).length,
        calculateJudgeTotals(skater2).length
      );
      const score2 = numJudges - score1;

      comparisonScores.set(skater1.name, comparisonScores.get(skater1.name)! + score1);
      comparisonScores.set(skater2.name, comparisonScores.get(skater2.name)! + score2);
    }
  }

  return comparisonScores;
}

/**
 * Tie-breaking Level 3: Comparison of tied skaters with ALL skaters
 * (Vergleichszahl im Vergleich mit allen Läufern)
 * According to Rainer Kayser rules, if Level 1 and Level 2 don't resolve the tie,
 * we must calculate the sum of comparison scores against ALL skaters, not just tied ones.
 */
function tieBreakByComparisonWithAll(
  tiedSkaters: SkaterScores[],
  allSkaters: SkaterScores[]
): Map<string, number> {
  const comparisonScores = new Map<string, number>();

  for (const tiedSkater of tiedSkaters) {
    comparisonScores.set(tiedSkater.name, 0);
  }

  // For each tied skater, compare with ALL skaters (including themselves gives 0)
  for (const tiedSkater of tiedSkaters) {
    let totalScore = 0;

    for (const otherSkater of allSkaters) {
      if (tiedSkater.name === otherSkater.name) {
        // Skip self-comparison (or it would give half score)
        continue;
      }

      const score = pairwiseComparison(tiedSkater, otherSkater);
      totalScore += score;
    }

    comparisonScores.set(tiedSkater.name, totalScore);
  }

  return comparisonScores;
}

/**
 * Calculates rankings using the Majority System (Majoritätssystem)
 *
 * Ranking is determined by the following criteria (in order):
 * 1. Majority Victories (M.V. / Verhältniszahl): Number of wins in pairwise comparisons
 * 2. Tie-break Level 1: Direct comparison score (Vergleichszahl) between tied skaters only
 * 3. Tie-break Level 2: Sum of B-scores
 * 4. Tie-break Level 3: Comparison score with ALL skaters (not just tied ones)
 * 5. Tie-break Level 4: Total score (A + B) as last resort
 * 6. If all criteria are equal: Skaters remain tied
 *
 * Based on Rainer Kayser's "Rollkunstlauf - Von den Noten zu den Plätzen"
 * and DRIV (Deutscher Rollsport- und Inline-Verband) regulations.
 */
export function calculateRankings(skaters: SkaterScores[]): SkaterResult[] {
  if (skaters.length === 0) return [];

  // Calculate Gesamtpunktzahl (total score) for each skater
  const results: SkaterResult[] = skaters.map(skater => {
    const totalScore = roundToOneDecimal(calculateTotalScore(skater));

    return {
      ...skater,
      totalScore,
      rank: 0,
      majorityVictories: 0,
    };
  });

  // Calculate majority victories for each skater
  const victories = calculateMajorityVictories(skaters);
  for (const result of results) {
    result.majorityVictories = victories.get(result.name)!;
    result.headToHeadResults = calculateHeadToHeadDetails(result, skaters);
  }

  // Sort by majority victories (descending)
  const sorted = [...results].sort((a, b) => {
    // Primary: Majority victories
    if (b.majorityVictories !== a.majorityVictories) {
      return b.majorityVictories - a.majorityVictories;
    }

    // If we get here, we have tied skaters - need tie-breaking
    return 0; // Will handle ties in a second pass
  });

  // Handle ties with proper tie-breaking rules
  let currentRank = 1;
  let i = 0;

  while (i < sorted.length) {
    // Find all skaters with the same M.V. as current
    const currentMV = sorted[i].majorityVictories;
    const tiedGroup: SkaterResult[] = [];
    let j = i;

    while (j < sorted.length && sorted[j].majorityVictories === currentMV) {
      tiedGroup.push(sorted[j]);
      j++;
    }

    if (tiedGroup.length === 1) {
      // No tie, assign rank
      tiedGroup[0].rank = currentRank;
    } else {
      // Tie-breaking needed
      const tiedSkaters = tiedGroup.map(r => ({
        name: r.name,
        aScores: r.aScores,
        bScores: r.bScores,
      }));

      // Tie-break 1: Direct comparison (Vergleichszahl) - only tied skaters
      const comparisonScores = tieBreakByDirectComparison(tiedSkaters);

      // Tie-break 2: Sum of B-scores
      const bScoreSums = new Map<string, number>();
      for (const skater of tiedSkaters) {
        bScoreSums.set(skater.name, calculateBScoreSum(skater));
      }

      // Tie-break 3: Comparison with ALL skaters (Vergleichszahl mit allen Läufern)
      const comparisonWithAll = tieBreakByComparisonWithAll(tiedSkaters, skaters);

      // Sort the tied group using tie-breaking rules
      tiedGroup.sort((a, b) => {
        const compA = comparisonScores.get(a.name)!;
        const compB = comparisonScores.get(b.name)!;
        if (compB !== compA) {
          return compB - compA;
        }

        // Tie-break 2: Sum of B-scores
        const bSumA = bScoreSums.get(a.name)!;
        const bSumB = bScoreSums.get(b.name)!;
        if (bSumB !== bSumA) {
          return bSumB - bSumA;
        }

        // Tie-break 3: Comparison with ALL skaters
        const compAllA = comparisonWithAll.get(a.name)!;
        const compAllB = comparisonWithAll.get(b.name)!;
        if (compAllB !== compAllA) {
          return compAllB - compAllA;
        }

        // Tie-break 4: Total score (Gesamtpunktzahl) - last resort
        return b.totalScore - a.totalScore;
      });

      // Assign ranks first
      for (let k = 0; k < tiedGroup.length; k++) {
        tiedGroup[k].rank = currentRank + k;
        sorted[i + k] = tiedGroup[k];
      }

      // For each skater in a tie-break group, collect all tie-break information
      if (tiedGroup.length > 1) {
        // First, find the first level where ANY differentiation occurs in the group
        const allDirectComp = tiedGroup.map(s => comparisonScores.get(s.name)!);
        const allBScoreSum = tiedGroup.map(s => bScoreSums.get(s.name)!);
        const allCompAll = tiedGroup.map(s => comparisonWithAll.get(s.name)!);
        const allTotalScore = tiedGroup.map(s => s.totalScore);

        const hasDirectCompVariation = new Set(allDirectComp).size > 1;
        const hasBScoreSumVariation = new Set(allBScoreSum).size > 1;
        const hasCompAllVariation = new Set(allCompAll).size > 1;
        const hasTotalScoreVariation = new Set(allTotalScore).size > 1;

        // Determine the first level where the group differentiates
        let firstDiffLevel: TieBreakLevel | null = null;
        if (hasDirectCompVariation) firstDiffLevel = 'direct-comparison';
        else if (hasBScoreSumVariation) firstDiffLevel = 'b-score-sum';
        else if (hasCompAllVariation) firstDiffLevel = 'comparison-all';
        else if (hasTotalScoreVariation) firstDiffLevel = 'total-score';

        for (let k = 0; k < tiedGroup.length; k++) {
          const current = tiedGroup[k];
          const compareWith = k < tiedGroup.length - 1 ? tiedGroup[k + 1] : tiedGroup[k - 1];

          const currentComp = comparisonScores.get(current.name)!;
          const compareComp = comparisonScores.get(compareWith.name)!;
          const currentBSum = bScoreSums.get(current.name)!;
          const compareBSum = bScoreSums.get(compareWith.name)!;
          const currentCompAll = comparisonWithAll.get(current.name)!;
          const compareCompAll = comparisonWithAll.get(compareWith.name)!;

          // Set backward compatibility fields first
          if (currentComp !== compareComp) {
            current.tieBreakLevel = 'direct-comparison';
            current.tieBreakValue = currentComp;
          } else if (currentBSum !== compareBSum) {
            current.tieBreakLevel = 'b-score-sum';
            current.tieBreakValue = currentBSum;
          } else if (currentCompAll !== compareCompAll) {
            current.tieBreakLevel = 'comparison-all';
            current.tieBreakValue = currentCompAll;
          } else if (current.totalScore !== compareWith.totalScore) {
            current.tieBreakLevel = 'total-score';
            current.tieBreakValue = current.totalScore;
          }

          // Build tieBreakInfo array: show levels where this skater is still tied with someone
          const tieBreakInfo: Array<{ level: TieBreakLevel; value: number }> = [];

          let reachedFirstDiff = false;
          let stillTiedWith = new Set(tiedGroup.map(s => s.name));
          stillTiedWith.delete(current.name);

          // Direct comparison
          if (!reachedFirstDiff && firstDiffLevel === 'direct-comparison') {
            reachedFirstDiff = true;
          }
          if (reachedFirstDiff && hasDirectCompVariation) {
            tieBreakInfo.push({ level: 'direct-comparison', value: currentComp });

            // Remove skaters with different direct comparison values
            const newStillTiedWith = new Set<string>();
            for (const name of stillTiedWith) {
              const other = tiedGroup.find(s => s.name === name)!;
              if (comparisonScores.get(other.name) === currentComp) {
                newStillTiedWith.add(name);
              }
            }
            stillTiedWith = newStillTiedWith;

            if (stillTiedWith.size === 0) {
              current.tieBreakInfo = tieBreakInfo;
              continue;
            }
          }

          // B-Score Sum
          if (!reachedFirstDiff && firstDiffLevel === 'b-score-sum') {
            reachedFirstDiff = true;
          }
          if (reachedFirstDiff && hasBScoreSumVariation) {
            tieBreakInfo.push({ level: 'b-score-sum', value: currentBSum });

            // Remove skaters with different B-score sums
            const newStillTiedWith = new Set<string>();
            for (const name of stillTiedWith) {
              const other = tiedGroup.find(s => s.name === name)!;
              if (bScoreSums.get(other.name) === currentBSum) {
                newStillTiedWith.add(name);
              }
            }
            stillTiedWith = newStillTiedWith;

            if (stillTiedWith.size === 0) {
              current.tieBreakInfo = tieBreakInfo;
              continue;
            }
          }

          // Comparison with all
          if (!reachedFirstDiff && firstDiffLevel === 'comparison-all') {
            reachedFirstDiff = true;
          }
          if (reachedFirstDiff && hasCompAllVariation) {
            tieBreakInfo.push({ level: 'comparison-all', value: currentCompAll });

            // Remove skaters with different comparison-all values
            const newStillTiedWith = new Set<string>();
            for (const name of stillTiedWith) {
              const other = tiedGroup.find(s => s.name === name)!;
              if (comparisonWithAll.get(other.name) === currentCompAll) {
                newStillTiedWith.add(name);
              }
            }
            stillTiedWith = newStillTiedWith;

            if (stillTiedWith.size === 0) {
              current.tieBreakInfo = tieBreakInfo;
              continue;
            }
          }

          // Total score
          if (!reachedFirstDiff && firstDiffLevel === 'total-score') {
            reachedFirstDiff = true;
          }
          if (reachedFirstDiff && hasTotalScoreVariation) {
            tieBreakInfo.push({ level: 'total-score', value: current.totalScore });
            current.tieBreakInfo = tieBreakInfo;
            continue;
          }

          // If we reach here, the skater wasn't separated at any level
          current.tieBreakInfo = tieBreakInfo;
        }
      }
    }

    currentRank += tiedGroup.length;
    i = j;
  }

  return sorted;
}
