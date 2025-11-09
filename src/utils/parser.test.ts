import { describe, it, expect } from 'vitest';

import { parseInput } from './parser';

describe('parseInput', () => {
  it('should parse basic input with "und" separator', () => {
    const input = 'SkaterA: 1.4 1.4 1.4 und 1.5 1.5 1.5';
    const result = parseInput(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      name: 'SkaterA',
      aScores: [1.4, 1.4, 1.4],
      bScores: [1.5, 1.5, 1.5],
    });
  });

  it('should parse input without separator', () => {
    const input = 'SkaterB: 1.8 1.5 1.6 2.1 1.6 1.8';
    const result = parseInput(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      name: 'SkaterB',
      aScores: [1.8, 1.5, 1.6],
      bScores: [2.1, 1.6, 1.8],
    });
  });

  it('should parse input with comma decimal separator', () => {
    const input = 'SkaterC: 1,8 1,4 1,5 und 2,4 1,6 2,2';
    const result = parseInput(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      name: 'SkaterC',
      aScores: [1.8, 1.4, 1.5],
      bScores: [2.4, 1.6, 2.2],
    });
  });

  it('should parse input with different separators', () => {
    const input = 'SkaterD: 1.5 1.3 1.5 and 1.4 1.3 1.3';
    const result = parseInput(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      name: 'SkaterD',
      aScores: [1.5, 1.3, 1.5],
      bScores: [1.4, 1.3, 1.3],
    });
  });

  it('should parse input with extra characters', () => {
    const input = 'SkaterE: 1.5 / 1.6 / 1.9 - 1.5 / 1.9 / 2.1';
    const result = parseInput(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      name: 'SkaterE',
      aScores: [1.5, 1.6, 1.9],
      bScores: [1.5, 1.9, 2.1],
    });
  });

  it('should parse multiple skaters', () => {
    const input = `SkaterA: 1.4 1.4 1.4 und 1.5 1.5 1.5
SkaterB: 1.8 1.5 1.6 und 2.1 1.6 1.8
SkaterC: 1.8 1.4 1.5 und 2.4 1.6 2.2`;

    const result = parseInput(input);

    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('SkaterA');
    expect(result[1].name).toBe('SkaterB');
    expect(result[2].name).toBe('SkaterC');
  });

  it('should skip empty lines', () => {
    const input = `SkaterA: 1.4 1.4 1.4 und 1.5 1.5 1.5

SkaterB: 1.8 1.5 1.6 und 2.1 1.6 1.8`;

    const result = parseInput(input);

    expect(result).toHaveLength(2);
  });

  it('should skip comment lines', () => {
    const input = `# This is a comment
SkaterA: 1.4 1.4 1.4 und 1.5 1.5 1.5
// Another comment
SkaterB: 1.8 1.5 1.6 und 2.1 1.6 1.8`;

    const result = parseInput(input);

    expect(result).toHaveLength(2);
  });

  it('should parse lines without colon and generate name', () => {
    const input = `SkaterA: 1.4 1.4 1.4 und 1.5 1.5 1.5
1.8 1.5 1.6 2.1 1.6 1.8
SkaterB: 1.8 1.5 1.6 und 2.1 1.6 1.8`;

    const result = parseInput(input);

    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('SkaterA');
    expect(result[1].name).toBe('Skater 1');
    expect(result[1]).toEqual({
      name: 'Skater 1',
      aScores: [1.8, 1.5, 1.6],
      bScores: [2.1, 1.6, 1.8],
    });
    expect(result[2].name).toBe('SkaterB');
  });

  it('should accept lines with partial scores and pad with null', () => {
    const input = `SkaterA: 1.4 1.4 1.4 und 1.5 1.5 1.5
SkaterB: 1.4 1.4
SkaterC: 1.8 1.5 1.6 und 2.1 1.6 1.8`;

    const result = parseInput(input);

    expect(result).toHaveLength(3);
    expect(result[1].name).toBe('SkaterB');
    expect(result[1]).toEqual({
      name: 'SkaterB',
      aScores: [1.4, 1.4, null],
      bScores: [null, null, null],
    });
  });

  it('should handle names with spaces', () => {
    const input = 'Skater Name: 1.4 1.4 1.4 und 1.5 1.5 1.5';
    const result = parseInput(input);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Skater Name');
  });

  it('should only take first 6 numbers if more are provided', () => {
    const input = 'SkaterF: 1.7 1.7 1.6 1.9 2.1 2.0 3.0 4.0';
    const result = parseInput(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      name: 'SkaterF',
      aScores: [1.7, 1.7, 1.6],
      bScores: [1.9, 2.1, 2.0],
    });
  });

  it('should handle mixed decimal formats', () => {
    const input = 'SkaterG: 1,6 1.6 1.5 und 1,6 1.4 1,3';
    const result = parseInput(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      name: 'SkaterG',
      aScores: [1.6, 1.6, 1.5],
      bScores: [1.6, 1.4, 1.3],
    });
  });

  it('should auto-generate unique names for multiple unnamed entries', () => {
    const input = `1.4 1.4 1.4 1.5 1.5 1.5
1.8 1.5 1.6 2.1 1.6 1.8
1.7 1.7 1.6 und 1.9 2.1 2.0`;

    const result = parseInput(input);

    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('Skater 1');
    expect(result[1].name).toBe('Skater 2');
    expect(result[2].name).toBe('Skater 3');
  });

  it('should accept entry with only 1 score', () => {
    const input = 'SkaterH: 2.5';
    const result = parseInput(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      name: 'SkaterH',
      aScores: [2.5, null, null],
      bScores: [null, null, null],
    });
  });

  it('should accept entry with no scores at all', () => {
    const input = `SkaterA: 1.4 1.4 1.4 und 1.5 1.5 1.5
SkaterB: no numbers here
SkaterC: 1.8 1.5 1.6 und 2.1 1.6 1.8`;

    const result = parseInput(input);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('SkaterA');
    expect(result[1].name).toBe('SkaterC');
  });
});
