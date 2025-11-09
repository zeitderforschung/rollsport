/**
 * COMPREHENSIVE EXAMPLE GENERATOR
 *
 * This script uses a brute-force random search strategy to find tournament examples
 * that demonstrate ALL edge cases of the Majority System ranking algorithm.
 *
 * Requirements:
 * 1. Highest total score at rank #3 - proves that total score ≠ rank
 * 2. ALL 4 tie-break levels present in the results:
 *    - direct-comparison (Tie-Break 1)
 *    - b-score-sum (Tie-Break 2)
 *    - comparison-all (Tie-Break 3)
 *    - total-score (Tie-Break 4)
 *
 * Usage:
 *   npx tsx scripts/find-comprehensive-example.ts
 *
 * The script will:
 * - Generate random tournaments with realistic scores (1.5-3.5 range)
 * - Test each tournament against the requirements
 * - Return the first perfect match, or best attempt after max attempts
 * - Output the data in app input format for easy copying
 *
 * Successfully found perfect example at attempt #2,496 (Nov 2025)
 */

import type { SkaterScores } from '../src/types/SkaterScores';
import type { TieBreakLevel } from '../src/types/TieBreakLevel';
import { calculateRankings } from '../src/utils/scoring';

/**
 * Simple seeded random number generator (LCG algorithm)
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 2**32;
    return this.seed / 2**32;
  }

  reset(seed: number) {
    this.seed = seed;
  }
}

const rng = new SeededRandom(Date.now());

/**
 * Generate random scores for a skater
 */
function randomScores(judgeCount: number): { aScores: number[], bScores: number[] } {
  return {
    aScores: Array(judgeCount).fill(0).map(() => Math.round((rng.next() * 2 + 1.5) * 10) / 10),
    bScores: Array(judgeCount).fill(0).map(() => Math.round((rng.next() * 2 + 1.5) * 10) / 10)
  };
}

/**
 * Generate random tournament data
 */
function generateRandomTournament(skaterCount: number, judgeCount: number): SkaterScores[] {
  const names = ['Anna', 'Ben', 'Clara', 'David', 'Emma', 'Felix', 'Grace', 'Hannah', 'Iris', 'Julia'];
  return Array.from({ length: skaterCount }, (_, i) => ({
    name: names[i] || `Skater${i}`,
    ...randomScores(judgeCount)
  }));
}

/**
 * Check if results meet ALL requirements
 */
function meetsRequirements(results: ReturnType<typeof calculateRankings>, strict: boolean = true): boolean {
  // Requirement 1: Highest total score must be at rank #3
  const highestTotal = Math.max(...results.map(r => r.totalScore));
  const highestTotalSkater = results.find(r => r.totalScore === highestTotal);

  if (!highestTotalSkater) {
    return false;
  }

  // In strict mode, require rank #3 exactly. In loose mode, accept top 3.
  const highestAtCorrectRank = strict
    ? highestTotalSkater.rank === 3
    : highestTotalSkater.rank <= 3;

  if (!highestAtCorrectRank) {
    return false;
  }

  // Requirement 2: ALL 4 tie-break levels must be present
  const tieBreakLevels = new Set<TieBreakLevel>();
  for (const result of results) {
    if (result.tieBreakInfo) {
      for (const info of result.tieBreakInfo) {
        tieBreakLevels.add(info.level);
      }
    }
  }

  const hasAllTieBreaks =
    tieBreakLevels.has('direct-comparison') &&
    tieBreakLevels.has('b-score-sum') &&
    tieBreakLevels.has('comparison-all') &&
    tieBreakLevels.has('total-score');

  return hasAllTieBreaks;
}

/**
 * Find comprehensive example using random strategy
 */
function findComprehensiveExample(
  skaterCount: number = 10,
  judgeCount: number = 3,
  maxAttempts: number = 1000000
): SkaterScores[] | null {
  console.log('Starting EXTENDED search for comprehensive example...');
  console.log(`Target: Highest total at rank #3 + ALL 4 tie-break levels`);
  console.log(`Max attempts: ${maxAttempts.toLocaleString()}`);
  console.log();

  let bestAttempt: { data: SkaterScores[], results: ReturnType<typeof calculateRankings>, score: number } | null = null;
  let bestWithAllTieBreaks: { data: SkaterScores[], results: ReturnType<typeof calculateRankings> } | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const tournament = generateRandomTournament(skaterCount, judgeCount);
    const results = calculateRankings(tournament);

    // Check if meets STRICT requirements (highest at rank #3)
    if (meetsRequirements(results, true)) {
      console.log(`✓ FOUND PERFECT SOLUTION at attempt #${(attempt + 1).toLocaleString()}!`);
      return tournament;
    }

    // Track best attempt with all tie-breaks (even if highest not at rank #3)
    const tieBreakLevels = new Set<TieBreakLevel>();
    for (const result of results) {
      if (result.tieBreakInfo) {
        for (const info of result.tieBreakInfo) {
          tieBreakLevels.add(info.level);
        }
      }
    }

    const hasAllTieBreaks =
      tieBreakLevels.has('direct-comparison') &&
      tieBreakLevels.has('b-score-sum') &&
      tieBreakLevels.has('comparison-all') &&
      tieBreakLevels.has('total-score');

    if (hasAllTieBreaks && !bestWithAllTieBreaks) {
      bestWithAllTieBreaks = { data: tournament, results };
    }

    const highestTotal = Math.max(...results.map(r => r.totalScore));
    const highestTotalSkater = results.find(r => r.totalScore === highestTotal);

    // Score: number of tie-break levels (0-4) + bonus for highest total position
    let score = tieBreakLevels.size * 3; // Each tie-break level worth 3 points
    if (highestTotalSkater) {
      if (highestTotalSkater.rank === 3) score += 20; // HUGE bonus for rank #3
      else if (highestTotalSkater.rank === 2) score += 10; // Good bonus for rank #2
      else if (highestTotalSkater.rank === 1) score += 5;  // Small bonus for rank #1
      else if (highestTotalSkater.rank === 4) score += 8;  // Good bonus for rank #4
    }

    if (!bestAttempt || score > bestAttempt.score) {
      bestAttempt = { data: tournament, results, score };
    }

    if ((attempt + 1) % 50000 === 0) {
      console.log(`Attempt ${(attempt + 1).toLocaleString()}: Best score = ${bestAttempt.score}/32 (12 for tie-breaks + 20 for rank #3)`);
      if (bestAttempt.results) {
        const ht = Math.max(...bestAttempt.results.map(r => r.totalScore));
        const hts = bestAttempt.results.find(r => r.totalScore === ht);
        const tbs = new Set<TieBreakLevel>();
        bestAttempt.results.forEach(r => r.tieBreakInfo?.forEach(t => tbs.add(t.level)));
        console.log(`  → Highest total at rank #${hts?.rank}, Tie-breaks: ${tbs.size}/4`);
      }
    }
  }

  console.log();
  console.log(`✗ Could not find PERFECT solution after ${maxAttempts.toLocaleString()} attempts`);

  // Fallback: Return best with all tie-breaks if found, otherwise best overall
  if (bestWithAllTieBreaks) {
    console.log('✓ Returning best attempt WITH all 4 tie-break levels:');
    return bestWithAllTieBreaks.data;
  } else if (bestAttempt) {
    console.log(`Returning best overall attempt (score ${bestAttempt.score}/32):`);
    return bestAttempt.data;
  }

  return null;
}

// RUN THE SEARCH
const result = findComprehensiveExample(10, 3, 1000000);

if (result) {
  console.log();
  console.log('='.repeat(80));
  console.log('COMPREHENSIVE EXAMPLE FOUND!');
  console.log('='.repeat(80));
  console.log();

  // Calculate and display results
  const results = calculateRankings(result);
  results.sort((a, b) => a.rank - b.rank);

  // Display in app input format
  console.log('Copy this into the app:');
  console.log('-'.repeat(80));
  console.log();
  for (const skater of result) {
    const aScoresStr = skater.aScores.map(s => s.toFixed(1)).join(' ');
    const bScoresStr = skater.bScores.map(s => s.toFixed(1)).join(' ');
    console.log(`${skater.name}: ${aScoresStr} / ${bScoresStr}`);
  }
  console.log();
  console.log('-'.repeat(80));
  console.log('Rankings:');
  console.log('-'.repeat(80));
  console.log();

  for (const r of results) {
    let badge = '';
    if (r.rank === 1) badge = '🥇';
    else if (r.rank === 2) badge = '🥈';
    else if (r.rank === 3) badge = '🥉';

    const tieInfo = r.tieBreakInfo && r.tieBreakInfo.length > 0
      ? ` TB: ${r.tieBreakInfo.map(t => `${t.level}=${t.value.toFixed(1)}`).join(', ')}`
      : '';

    console.log(`#${r.rank} ${badge} ${r.name.padEnd(8)} - M.V.: ${r.majorityVictories.toFixed(1)}, Total: ${r.totalScore.toFixed(1)}${tieInfo}`);
  }

  console.log();
  console.log('-'.repeat(80));
  console.log('Validation:');
  console.log('-'.repeat(80));
  console.log();

  // Validate requirements
  const highestTotal = Math.max(...results.map(r => r.totalScore));
  const highestSkater = results.find(r => r.totalScore === highestTotal);
  console.log(`✓ Highest total: ${highestSkater?.name} at rank #${highestSkater?.rank} with ${highestTotal.toFixed(1)}`);

  const tieBreakLevels = new Set<TieBreakLevel>();
  for (const result of results) {
    if (result.tieBreakInfo) {
      for (const info of result.tieBreakInfo) {
        tieBreakLevels.add(info.level);
      }
    }
  }
  console.log(`✓ Tie-breaks present: ${Array.from(tieBreakLevels).join(', ')}`);

  if (tieBreakLevels.size === 4) {
    console.log('✓ ALL 4 tie-break levels present!');
  } else {
    console.log(`✗ Missing tie-break levels: ${4 - tieBreakLevels.size}`);
  }

  if (highestSkater && highestSkater.rank === 3) {
    console.log('✓ PERFECT: Highest total is at rank #3!');
  } else if (highestSkater && highestSkater.rank <= 3) {
    console.log(`✓ GOOD: Highest total is in top 3 (rank #${highestSkater.rank})`);
  }

} else {
  console.log('✗ No solution found.');
  process.exit(1);
}
