import type { SkaterScores } from '../src/types/SkaterScores';
import { calculateRankings } from '../src/utils/scoring';

// 8 skaters: Use symmetry to create guaranteed ties
// The key insight: Ben and Clara will have identical scores but mirrored across judges
// This makes them beat/lose to the same opponents = tied M.V.
const skaters: SkaterScores[] = [
  // Rank 1: Anna - beats everyone (7 MV)
  {
    name: 'Anna',
    aScores: [2.9, 2.8, 2.9],
    bScores: [2.8, 2.7, 2.8],
  },

  // Rank 2: Ben & Clara - TIED at 6 MV, differ by direct comparison
  // They both beat David, Emma, Felix, Grace, Hannah (5 skaters)
  // They both lose to Anna
  // The tie is their head-to-head
  {
    name: 'Ben',
    aScores: [2.6, 2.5, 2.4],  // J1: 5.2, J2: 5.0, J3: 4.8
    bScores: [2.6, 2.5, 2.4],  // Sum: 7.5
  },
  {
    name: 'Clara',
    aScores: [2.4, 2.5, 2.6],  // J1: 4.8, J2: 5.0, J3: 5.2 (mirrored!)
    bScores: [2.4, 2.5, 2.6],  // Sum: 7.5 (same!)
  },

  // Rank 4: David & Emma - TIED at 4.5 MV
  // Both beat Felix, Grace, Hannah, and tie with each other
  {
    name: 'David',
    aScores: [2.2, 2.3, 2.2],  // J1: 4.6, J2: 4.7, J3: 4.6
    bScores: [2.4, 2.4, 2.4],  // Sum: 7.2 (higher)
  },
  {
    name: 'Emma',
    aScores: [2.2, 2.2, 2.3],  // J1: 4.6, J2: 4.6, J3: 4.7 (similar pattern)
    bScores: [2.4, 2.4, 2.4],  // Sum: 7.2 (same! Will need comparison-all)
  },

  // Rank 6: Felix & Grace - TIED, need final tie-breakers
  {
    name: 'Felix',
    aScores: [1.9, 2.0, 1.9],
    bScores: [1.9, 2.0, 1.9],  // Sum: 5.8
  },
  {
    name: 'Grace',
    aScores: [1.9, 1.9, 2.0],
    bScores: [1.9, 1.9, 2.0],  // Sum: 5.8 (same)
  },

  // Rank 8: Hannah - loses to everyone (0 MV)
  {
    name: 'Hannah',
    aScores: [1.6, 1.7, 1.6],
    bScores: [1.7, 1.7, 1.7],
  },
];

const results = calculateRankings(skaters);

console.log('Ranking Results:\n');
for (const result of results.sort((a, b) => a.rank - b.rank)) {
  const tie = result.tieBreakLevel ? ` [TB: ${result.tieBreakLevel}]` : '';
  console.log(`#${result.rank} ${result.name.padEnd(8)} - M.V.: ${result.majorityVictories.toFixed(1)}, Total: ${result.totalScore.toFixed(1)}${tie}`);
}
