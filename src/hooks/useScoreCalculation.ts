import { useEffect, useState } from 'react';

import type { SkaterResult } from '../types/SkaterResult';
import { parseInput } from '../utils/parser';
import { calculateRankings } from '../utils/scoring';

export function useScoreCalculation(input: string) {
  const [results, setResults] = useState<SkaterResult[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    try {
      setError('');

      // Don't show error if input is empty or just whitespace
      if (!input.trim()) {
        setResults([]);
        return;
      }

      const skatersData = parseInput(input);

      if (skatersData.length === 0) {
        setError('Hmm, I couldn\'t find any valid scores. Make sure each line has at least one number!');
        setResults([]);
        return;
      }

      const rankings = calculateRankings(skatersData);
      setResults(rankings);
    } catch (err) {
      setError(`Oops! ${err instanceof Error ? err.message : 'Something went wrong. Please check your input.'}`);
      setResults([]);
    }
  }, [input]);

  return { results, error };
}
