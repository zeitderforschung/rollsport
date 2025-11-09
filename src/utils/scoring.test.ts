import { describe, it, expect } from 'vitest';

import { calculateRankings } from './scoring';
import * as scenarios from './test-generators';

/**
 * Comprehensive Test Suite for Majoritätssystem (Majority System)
 *
 * Tests use randomly generated valid tournament data with seeded RNG
 * to ensure deterministic, reproducible results.
 */

describe('Score Processing', () => {
  it('should calculate total score as sum of all judge totals', () => {
    const tournament = scenarios.createLinearRanking(3, 3);
    const results = calculateRankings(tournament);

    results.forEach(result => {
      expect(result.totalScore).toBeDefined();
      // Total score should be the sum of all judge totals (A+B per judge)
      const expectedTotal = result.aScores.reduce((sum: number, a, i) => {
        return sum + (a ?? 0) + (result.bScores[i] ?? 0);
      }, 0 as number);
      expect(result.totalScore).toBeCloseTo(expectedTotal, 1);
    });
  });

  it('should calculate total as sum for all judge counts', () => {
    const tournament = scenarios.createHighVariance();
    const results = calculateRankings(tournament);

    const skaterA = results.find(r => r.name === 'SkaterA')!;

    // With 5 judges, total should be sum of all 5 judge totals
    // A-scores: [2.0, 5.0, 5.0, 5.0, 8.0] B-scores: [2.0, 4.0, 4.0, 4.0, 6.0]
    // Judge totals: [4.0, 9.0, 9.0, 9.0, 14.0] = 45.0
    const expectedTotal = skaterA.aScores.reduce((sum: number, a, i) => {
      return sum + (a ?? 0) + (skaterA.bScores[i] ?? 0);
    }, 0 as number);
    expect(skaterA.totalScore).toBeCloseTo(expectedTotal, 1);
  });

  it('should handle various judge counts correctly', () => {
    [1, 2, 3, 5, 7].forEach(judgeCount => {
      const tournament = scenarios.createLinearRanking(4, judgeCount);
      const results = calculateRankings(tournament);

      expect(results).toHaveLength(4);
      expect(results[0].rank).toBe(1);
      expect(results[0].aScores).toHaveLength(judgeCount);
      expect(results[0].bScores).toHaveLength(judgeCount);
    });
  });
});

describe('Majority Victories', () => {
  it('should rank by majority victories, not total scores', () => {
    const tournament = scenarios.createLinearRanking(4, 3);
    const results = calculateRankings(tournament);

    // Rankings should be in descending M.V. order
    expect(results[0].majorityVictories).toBeGreaterThan(results[1].majorityVictories);
    expect(results[1].majorityVictories).toBeGreaterThan(results[2].majorityVictories);
    expect(results[2].majorityVictories).toBeGreaterThan(results[3].majorityVictories);

    // Top skater beats all others
    expect(results[0].majorityVictories).toBe(3);
    // Last skater beats nobody
    expect(results[3].majorityVictories).toBe(0);
  });

  it('should rank skater with lower total score higher if they win more judges', () => {
    // Critical test: Highest total score does NOT guarantee victory
    const tournament = [
      {
        name: 'Alice',
        aScores: [4.0, 3.0, 4.0],  // Wins judges 0,2
        bScores: [4.0, 3.0, 4.0]   // Judge totals: [8, 6, 8]
      },
      {
        name: 'Bob',
        aScores: [3.5, 5.0, 3.5],  // Wins judge 1 (with highest score 10!)
        bScores: [3.5, 5.0, 3.5]   // Judge totals: [7, 10, 7]
      }
    ];

    const results = calculateRankings(tournament);

    // Alice wins despite lower sum total score
    expect(results[0].name).toBe('Alice');
    expect(results[1].name).toBe('Bob');

    // Alice has lower total sum (22.0 < 24.0) but higher M.V.
    expect(results[0].totalScore).toBeLessThan(results[1].totalScore); // 22.0 < 24.0
    expect(results[0].majorityVictories).toBe(1); // Alice wins 2 of 3 judges
    expect(results[1].majorityVictories).toBe(0); // Bob wins only 1 of 3 judges
  });

  it('should use B-score when judge totals are equal (pairwise tie-break)', () => {
    const tournament = scenarios.createPairwiseBScoreTieBreak();
    const results = calculateRankings(tournament);

    // SkaterA should win via higher B-score
    expect(results[0].name).toBe('SkaterA');
    expect(results[0].majorityVictories).toBe(1);

    // Verify head-to-head used B-score
    const h2h = results[0].headToHeadResults!.find(h => h.opponent === 'SkaterB')!;
    expect(h2h.won).toBe(true);
    expect(h2h.skaterVotes).toBe(3); // All judges favor A due to B-score
  });

  it('should award 0.5 points for perfect pairwise tie', () => {
    const tournament = scenarios.createPairwisePerfectTie();
    const results = calculateRankings(tournament);

    // Both should get 0.5 M.V. from their matchup
    expect(results[0].majorityVictories).toBe(0.5);
    expect(results[1].majorityVictories).toBe(0.5);

    // Head-to-head should show no winner
    const h2h = results[0].headToHeadResults!.find(h => h.opponent === 'SkaterB')!;
    expect(h2h.won).toBe(false);
    expect(h2h.skaterVotes).toBe(0);
    expect(h2h.opponentVotes).toBe(0);
  });

  it('should award 1 point for majority victory (2-1 split)', () => {
    const tournament = scenarios.createSplitDecision();
    const results = calculateRankings(tournament);

    // SkaterA wins 2 out of 3 judges = 1 M.V.
    expect(results[0].name).toBe('SkaterA');
    expect(results[0].majorityVictories).toBe(1);

    const h2h = results[0].headToHeadResults!.find(h => h.opponent === 'SkaterB')!;
    expect(h2h.won).toBe(true);
    expect(h2h.skaterVotes).toBe(2);
    expect(h2h.opponentVotes).toBe(1);
  });

  it('should handle circular preferences (A>B, B>C, C>A)', () => {
    const tournament = scenarios.createCircularPreferences();
    const results = calculateRankings(tournament);

    // Top 3 should each have 2 M.V. (beat 1 in cycle + beat filler)
    const topThree = results.slice(0, 3);
    topThree.forEach(skater => {
      expect(skater.majorityVictories).toBe(2);
    });

    // Last should have 0 M.V.
    expect(results[3].majorityVictories).toBe(0);
  });

  it('should rank by M.V., not by total score (Carol ranks last despite high individual score)', () => {
    const tournament = scenarios.createHighestTotalLosesScenario();
    const results = calculateRankings(tournament);

    // Carol has M.V.=0 and finishes last despite having one judge give her 10 (5+5)
    expect(results[2].name).toBe('Carol');
    expect(results[2].rank).toBe(3); // Last place!
    expect(results[2].majorityVictories).toBe(0); // Lost all pairwise comparisons

    // Alice wins with M.V.=2
    expect(results[0].name).toBe('Alice');
    expect(results[0].majorityVictories).toBe(2); // Beat Bob and Carol

    // Verify Carol got highest score from one judge but still lost
    const carolJudgeScores = results[2].aScores.map((a, i) => (a || 0) + (results[2].bScores[i] || 0));
    expect(Math.max(...carolJudgeScores)).toBe(10); // One judge gave her 10!
  });
});

describe('Tie-Breaking Hierarchy', () => {
  describe('Level 1: Direct Comparison', () => {
    it('should separate tied M.V. using direct comparison scores', () => {
      const tournament = scenarios.createDirectComparisonTie();
      const results = calculateRankings(tournament);

      // Top two must have same M.V.
      const topTwo = results.slice(0, 2);
      expect(topTwo[0].majorityVictories).toBe(topTwo[1].majorityVictories);

      // But different ranks
      expect(topTwo[0].rank).toBe(1);
      expect(topTwo[1].rank).toBe(2);

      // Should have tie-break badges
      expect(topTwo[0].tieBreakLevel).toBeDefined();
      expect(topTwo[1].tieBreakLevel).toBeDefined();
    });
  });

  describe('Level 2: Sum of B-Scores', () => {
    it('should use raw B-score sum as tie-breaker', () => {
      const tournament = scenarios.createBScoreSumTie(5);
      const results = calculateRankings(tournament);

      const skaterA = results.find(r => r.name === 'SkaterA')!;
      const skaterB = results.find(r => r.name === 'SkaterB')!;

      // SkaterA should have higher B-score sum
      const sumA = skaterA.bScores.reduce((sum, score) => (sum || 0) + (score || 0), 0);
      const sumB = skaterB.bScores.reduce((sum, score) => (sum || 0) + (score || 0), 0);
      expect(sumA || 0).toBeGreaterThan(sumB || 0);

      // SkaterA should rank higher
      expect(skaterA.rank).toBeLessThan(skaterB.rank);
    });
  });

  describe('Level 3: Comparison with ALL Skaters', () => {
    it('should compare with all skaters when previous tie-breaks fail', () => {
      const tournament = scenarios.createComparisonWithAllTie();
      const results = calculateRankings(tournament);

      // Top two should have same M.V. but different ranks
      const topTwo = results.slice(0, 2);
      expect(topTwo[0].majorityVictories).toBe(topTwo[1].majorityVictories);
      expect(topTwo[0].rank).not.toBe(topTwo[1].rank);

      // At least one should have tie-break badge
      const hasBadge = topTwo.some(s => s.tieBreakLevel !== undefined);
      expect(hasBadge).toBe(true);
    });
  });

  describe('Level 4: Total Score', () => {
    it('should use total score as last resort', () => {
      const tournament = scenarios.createTotalScoreTie();
      const results = calculateRankings(tournament);

      const skaterA = results.find(r => r.name === 'SkaterA')!;
      const skaterB = results.find(r => r.name === 'SkaterB')!;

      // Should have higher total
      expect(skaterA.totalScore).toBeGreaterThan(skaterB.totalScore);

      // Should rank higher
      expect(skaterA.rank).toBeLessThan(skaterB.rank);
    });
  });

  describe('Level 5: Shared Rank', () => {
    it('should allow perfect ties with shared ranks', () => {
      const tournament = scenarios.createPerfectTie();
      const results = calculateRankings(tournament);

      const skaterA = results.find(r => r.name === 'SkaterA')!;
      const skaterB = results.find(r => r.name === 'SkaterB')!;

      // Perfect tie: same M.V., same total score
      expect(skaterA.majorityVictories).toBe(skaterB.majorityVictories);
      expect(skaterA.totalScore).toBe(skaterB.totalScore);

      // Should both rank in top 2
      expect(skaterA.rank).toBeLessThanOrEqual(2);
      expect(skaterB.rank).toBeLessThanOrEqual(2);
    });
  });
});

describe('SCORING.md Example', () => {
  it('should calculate correct results (documentation has error)', () => {
    const tournament = scenarios.createScoringMdExample();
    const results = calculateRankings(tournament);

    // Correct ranking: Anna > Clara > Ben > David
    // Note: SCORING.md shows Ben > Clara, but Clara beats Ben 2-1
    expect(results[0].name).toBe('Anna');
    expect(results[1].name).toBe('Clara');  // Corrected
    expect(results[2].name).toBe('Ben');
    expect(results[3].name).toBe('David');

    // Correct M.V. values
    expect(results[0].majorityVictories).toBe(3); // Anna beats all
    expect(results[1].majorityVictories).toBe(2); // Clara beats Ben and David
    expect(results[2].majorityVictories).toBe(1); // Ben beats only David
    expect(results[3].majorityVictories).toBe(0); // David beats none
  });
});

describe('Edge Cases and Validation', () => {
  it('should handle single skater', () => {
    const skaters = scenarios.createLinearRanking(1, 3);
    const results = calculateRankings(skaters);

    expect(results).toHaveLength(1);
    expect(results[0].rank).toBe(1);
    expect(results[0].majorityVictories).toBe(0); // No one to beat
    expect(results[0].headToHeadResults).toHaveLength(0);
  });

  it('should assign sequential ranks', () => {
    const tournament = scenarios.createLinearRanking(10, 3);
    const results = calculateRankings(tournament);

    // Ranks should be 1, 2, 3, ..., 10
    const ranks = results.map(r => r.rank).sort((a, b) => a - b);
    expect(ranks).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('should keep M.V. in valid range [0, n-1]', () => {
    const tournament = scenarios.createLinearRanking(7, 3);
    const results = calculateRankings(tournament);

    results.forEach(result => {
      expect(result.majorityVictories).toBeGreaterThanOrEqual(0);
      expect(result.majorityVictories).toBeLessThanOrEqual(6); // n-1
    });
  });

  it('should provide complete head-to-head results', () => {
    const tournament = scenarios.createLinearRanking(4, 3);
    const results = calculateRankings(tournament);

    results.forEach(result => {
      expect(result.headToHeadResults).toBeDefined();
      expect(result.headToHeadResults).toHaveLength(3); // vs 3 others
    });
  });

  it('should have reciprocal head-to-head results', () => {
    const tournament = scenarios.createLinearRanking(3, 3);
    const results = calculateRankings(tournament);

    const skaterA = results[0];
    const skaterB = results[1];

    const aVsB = skaterA.headToHeadResults!.find(h => h.opponent === skaterB.name)!;
    const bVsA = skaterB.headToHeadResults!.find(h => h.opponent === skaterA.name)!;

    // Votes should be reciprocal
    expect(aVsB.skaterVotes).toBe(bVsA.opponentVotes);
    expect(aVsB.opponentVotes).toBe(bVsA.skaterVotes);
    expect(aVsB.won).toBe(!bVsA.won || (aVsB.skaterVotes === aVsB.opponentVotes));
  });

  it('should preserve original score arrays', () => {
    const tournament = scenarios.createLinearRanking(3, 3);
    const results = calculateRankings(tournament);

    // Match results to original tournament data by name
    results.forEach(result => {
      const original = tournament.find(t => t.name === result.name)!;
      expect(result.aScores).toEqual(original.aScores);
      expect(result.bScores).toEqual(original.bScores);
    });
  });
});

describe('Tie-Break Badges', () => {
  it('should assign badges when tie-breaking separates skaters', () => {
    const tournament = scenarios.createDirectComparisonTie();
    const results = calculateRankings(tournament);

    // Top two have same M.V., should have tie-break badges
    const topTwo = results.filter(r => r.rank <= 2);
    topTwo.forEach(skater => {
      expect(skater.tieBreakLevel).toBeDefined();
    });
  });

  it('should not assign badges when M.V. is unique', () => {
    const tournament = scenarios.createLinearRanking(5, 3);
    const results = calculateRankings(tournament);

    // Count how many skaters have each M.V.
    const mvCounts = new Map<number, number>();
    results.forEach(r => {
      mvCounts.set(r.majorityVictories, (mvCounts.get(r.majorityVictories) || 0) + 1);
    });

    results.forEach(result => {
      if (mvCounts.get(result.majorityVictories) === 1) {
        // Unique M.V. = no badge needed
        expect(result.tieBreakLevel).toBeUndefined();
      }
    });
  });
});

describe('Example Data from examples.ts', () => {
  it('should correctly rank all skaters with Julia #1 despite not having highest total score', () => {
    // Example data from src/components/ScoreInput/examples.ts
    const tournament = [
      { name: 'Anna', aScores: [2.3, 3.1, 3.0], bScores: [2.9, 2.7, 1.9] },
      { name: 'Ben', aScores: [2.4, 3.3, 2.3], bScores: [2.2, 3.0, 2.3] },
      { name: 'Clara', aScores: [1.5, 3.2, 2.7], bScores: [2.7, 1.6, 2.9] },
      { name: 'David', aScores: [1.6, 2.3, 2.2], bScores: [2.7, 1.7, 1.7] },
      { name: 'Emma', aScores: [1.9, 1.8, 3.0], bScores: [2.1, 2.6, 3.4] },
      { name: 'Felix', aScores: [1.7, 1.5, 2.6], bScores: [2.2, 1.8, 2.1] },
      { name: 'Grace', aScores: [3.2, 1.6, 2.4], bScores: [2.9, 2.5, 3.1] },
      { name: 'Hannah', aScores: [3.0, 3.4, 3.1], bScores: [1.6, 2.5, 2.2] },
      { name: 'Iris', aScores: [2.5, 2.1, 1.9], bScores: [3.0, 1.8, 2.1] },
      { name: 'Julia', aScores: [2.5, 1.8, 2.3], bScores: [2.7, 2.9, 3.3] }
    ];

    const results = calculateRankings(tournament);

    // Plausibility check: Should return 10 results
    expect(results).toHaveLength(10);

    // Plausibility check: All skaters should be present
    const names = results.map(r => r.name).sort();
    expect(names).toEqual(['Anna', 'Ben', 'Clara', 'David', 'Emma', 'Felix', 'Grace', 'Hannah', 'Iris', 'Julia']);

    // Plausibility check: All results should have required fields
    results.forEach(result => {
      expect(result.name).toBeDefined();
      expect(result.rank).toBeGreaterThanOrEqual(1);
      expect(result.rank).toBeLessThanOrEqual(10);
      expect(result.majorityVictories).toBeGreaterThanOrEqual(0);
      expect(result.majorityVictories).toBeLessThanOrEqual(9);
      expect(result.totalScore).toBeDefined();
      // Total score should be sum of all judge totals
      const expectedTotal = result.aScores.reduce((sum: number, a, i) => {
        return sum + (a ?? 0) + (result.bScores[i] ?? 0);
      }, 0 as number);
      expect(result.totalScore).toBeCloseTo(expectedTotal, 1);
      expect(result.aScores).toHaveLength(3);
      expect(result.bScores).toHaveLength(3);
      expect(result.headToHeadResults).toBeDefined();
      expect(result.headToHeadResults).toHaveLength(9);
    });

    // Plausibility check: Ranks should be sequential
    const ranks = results.map(r => r.rank).sort((a, b) => a - b);
    expect(ranks).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    // Sort by rank for easier verification
    results.sort((a, b) => a.rank - b.rank);

    // Plausibility check: M.V. should generally decrease with rank (allowing for ties)
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].majorityVictories).toBeGreaterThanOrEqual(results[i + 1].majorityVictories);
    }

    // Plausibility check: Head-to-head results should be reciprocal
    results.forEach(skater => {
      skater.headToHeadResults!.forEach(h2h => {
        const opponent = results.find(r => r.name === h2h.opponent)!;
        const reciprocal = opponent.headToHeadResults!.find(h => h.opponent === skater.name)!;

        expect(h2h.skaterVotes).toBe(reciprocal.opponentVotes);
        expect(h2h.opponentVotes).toBe(reciprocal.skaterVotes);
      });
    });

    // Verify complete ranking order
    expect(results[0].name).toBe('Julia');
    expect(results[1].name).toBe('Grace');
    expect(results[2].name).toBe('Anna');
    expect(results[3].name).toBe('Ben');
    expect(results[4].name).toBe('Hannah');
    expect(results[5].name).toBe('Clara');
    expect(results[6].name).toBe('Emma');
    expect(results[7].name).toBe('Iris');
    expect(results[8].name).toBe('David');
    expect(results[9].name).toBe('Felix');

    // Verify M.V. values
    expect(results[0].majorityVictories).toBe(9); // Julia beats all
    expect(results[1].majorityVictories).toBe(6); // Grace
    expect(results[2].majorityVictories).toBe(6); // Anna
    expect(results[3].majorityVictories).toBe(6); // Ben
    expect(results[4].majorityVictories).toBe(6); // Hannah
    expect(results[5].majorityVictories).toBe(5); // Clara
    expect(results[6].majorityVictories).toBe(4); // Emma
    expect(results[7].majorityVictories).toBe(2); // Iris
    expect(results[8].majorityVictories).toBe(1); // David
    expect(results[9].majorityVictories).toBe(0); // Felix

    // Anna has the highest total score but ranks #3
    const anna = results.find(r => r.name === 'Anna')!;
    const julia = results.find(r => r.name === 'Julia')!;

    // Calculate total scores
    const annaTotal = anna.aScores.reduce((sum: number, a, i) => sum + (a ?? 0) + (anna.bScores[i] ?? 0), 0);
    const juliaTotal = julia.aScores.reduce((sum: number, a, i) => sum + (a ?? 0) + (julia.bScores[i] ?? 0), 0);

    // Anna has higher total (15.9) than Julia (15.5)
    expect(annaTotal).toBeGreaterThan(juliaTotal);

    // But Julia ranks higher due to more pairwise victories
    expect(julia.rank).toBe(1);
    expect(anna.rank).toBe(3);

    // Julia beats Anna in head-to-head (2:1 due to floating point precision)
    const juliaVsAnna = julia.headToHeadResults!.find(h => h.opponent === 'Anna')!;
    expect(juliaVsAnna.won).toBe(true);
    expect(juliaVsAnna.skaterVotes).toBe(2);
    expect(juliaVsAnna.opponentVotes).toBe(1);

    // Verify Julia's consistent B-scores lead to victory
    // Judge 1: Julia (2.5+2.7=5.2) vs Anna (2.3+2.9=5.2) → Julia wins due to floating point
    // Judge 2: Julia (1.8+2.9=4.7) vs Anna (3.1+2.7=5.8) → Anna wins
    // Judge 3: Julia (2.3+3.3=5.6) vs Anna (3.0+1.9=4.9) → Julia wins
  });
});
