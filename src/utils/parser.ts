import type { SkaterScores } from '../types/SkaterScores';

/**
 * Parses input text where each line contains:
 * Name: score1 score2 score3 [separator] score4 score5 score6
 * OR
 * score1 score2 score3 [separator] score4 score5 score6 (auto-generates "Skater N" name)
 *
 * The first 3 scores are A-scores, the last 3 are B-scores
 * Supports both comma and period as decimal separator
 * Any text between numbers (like "und", "and", etc.) is ignored
 */
export function parseInput(input: string): SkaterScores[] {
  const lines = input.trim().split('\n');
  const results: SkaterScores[] = [];
  let unnamedCounter = 1;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Skip comment lines
    if (trimmedLine.startsWith('#') || trimmedLine.startsWith('//')) continue;

    // Split by colon to separate name from scores
    const colonIndex = trimmedLine.indexOf(':');
    let name: string;
    let scoresText: string;

    if (colonIndex === -1) {
      // No colon found - treat entire line as scores, generate name
      name = `Skater ${unnamedCounter++}`;
      scoresText = trimmedLine;
    } else {
      name = trimmedLine.substring(0, colonIndex).trim();
      scoresText = trimmedLine.substring(colonIndex + 1).trim();
    }

    // Replace commas with periods for decimal parsing
    // Also handle common separators and noise
    const normalizedText = scoresText
      .replace(/,/g, '.')  // German decimal separator
      .replace(/\s+/g, ' '); // Normalize whitespace

    // Extract all numbers (including decimals)
    // This regex handles: 1.5, 1,5 (after normalization), .5, 5.
    const numbers = normalizedText.match(/\d+\.?\d*|\.\d+/g);

    // Be lenient - accept lines with at least 1 number, pad with null for missing scores
    if (!numbers || numbers.length === 0) {
      console.warn(`Skipping line "${line}" - no numbers found`);
      continue;
    }

    const scores: (number | null)[] = numbers.slice(0, 6).map(n => parseFloat(n));

    // Validate all extracted scores are valid numbers
    if (scores.some(s => s !== null && isNaN(s))) {
      console.warn(`Skipping line "${line}" - contains invalid numbers`);
      continue;
    }

    // Pad with nulls if we have fewer than 6 scores
    while (scores.length < 6) {
      scores.push(null);
    }

    // First 3 are A-scores, last 3 are B-scores
    const aScores = scores.slice(0, 3) as (number | null)[];
    const bScores = scores.slice(3, 6) as (number | null)[];

    results.push({
      name,
      aScores,
      bScores
    });
  }

  return results;
}
