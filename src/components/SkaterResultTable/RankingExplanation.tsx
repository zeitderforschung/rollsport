import { Group, Stack, Text } from '@mantine/core';

import type { HeadToHeadResult } from '../../types/HeadToHeadResult';
import type { SkaterResult } from '../../types/SkaterResult';
import type { TieBreakLevel } from '../../types/TieBreakLevel';

interface RankingExplanationProps {
  result: SkaterResult;
  allResults: SkaterResult[];
}

function getTieBreakFriendlyLabel(level: TieBreakLevel): string {
  switch (level) {
    case 'direct-comparison':
      return 'tied votes';
    case 'b-score-sum':
      return 'B-Score';
    case 'comparison-all':
      return 'votes';
    case 'total-score':
      return 'Total score';
    default:
      return '';
  }
}

export function RankingExplanation({ result, allResults }: RankingExplanationProps) {
  if (!result.headToHeadResults) return null;

  const totalMatchups = result.headToHeadResults.length;
  const wonMatchups = result.headToHeadResults.filter(h => h.won).length;

  // Find who this skater is tied with in M.V. count (if anyone)
  const tiedWith = allResults.filter(
    r => r.name !== result.name &&
         r.majorityVictories === result.majorityVictories &&
         r.rank !== result.rank  // Only show if they have different ranks (tie was broken)
  );

  // Separate tied skaters into those ranked above and below
  const tiedAbove = tiedWith.filter(r => r.rank < result.rank);
  const tiedBelow = tiedWith.filter(r => r.rank > result.rank);

  // Sort opponents by the skater's rank order
  const sortedResults = [...result.headToHeadResults].sort((a, b) => {
    const aResult = allResults.find(r => r.name === a.opponent);
    const bResult = allResults.find(r => r.name === b.opponent);
    return (aResult?.rank ?? 999) - (bResult?.rank ?? 999);
  });

  return (
    <Stack gap="xs">
      {/* Compact headline */}
      <Stack gap={2}>
        <Text size="md" fw={700}>
          {result.name}
        </Text>
        <Text size="sm" c="dimmed">
          Beat {wonMatchups} of {totalMatchups} skaters
        </Text>
      </Stack>

      {/* Tie-break explanation if needed */}
      {result.tieBreakLevel && result.tieBreakValue !== undefined && (tiedAbove.length > 0 || tiedBelow.length > 0) && (
        <Stack gap={2} mt={4}>
          {tiedAbove.length > 0 && tiedAbove.map(other => {
            const formattedMyValue = result.tieBreakValue! % 1 === 0 ? result.tieBreakValue!.toFixed(0) : result.tieBreakValue!.toFixed(1);
            const formattedOtherValue = other.tieBreakValue! % 1 === 0 ? other.tieBreakValue!.toFixed(0) : other.tieBreakValue!.toFixed(1);
            return (
              <Text key={other.name} size="xs" c="cyan" fs="italic">
                Behind {other.name} ({formattedMyValue} vs {formattedOtherValue}) by {getTieBreakFriendlyLabel(result.tieBreakLevel!)}
              </Text>
            );
          })}
          {tiedBelow.length > 0 && tiedBelow.map(other => {
            const formattedMyValue = result.tieBreakValue! % 1 === 0 ? result.tieBreakValue!.toFixed(0) : result.tieBreakValue!.toFixed(1);
            const formattedOtherValue = other.tieBreakValue! % 1 === 0 ? other.tieBreakValue!.toFixed(0) : other.tieBreakValue!.toFixed(1);
            return (
              <Text key={other.name} size="xs" c="cyan" fs="italic">
                Ahead of {other.name} ({formattedMyValue} vs {formattedOtherValue}) by {getTieBreakFriendlyLabel(result.tieBreakLevel!)}
              </Text>
            );
          })}
        </Stack>
      )}

      {/* Compact list of comparisons */}
      <Stack gap={6} mt={6}>
        {sortedResults.map((h: HeadToHeadResult) => (
          <Group
            key={h.opponent}
            justify="space-between"
            wrap="nowrap"
            pl="md"
            pr="md"
            py={8}
            style={{
              backgroundColor: h.won
                ? 'var(--mantine-color-green-9)'
                : 'var(--mantine-color-red-9)',
              borderRadius: '6px',
              borderLeft: h.won
                ? '3px solid var(--mantine-color-green-6)'
                : '3px solid var(--mantine-color-red-6)',
            }}
          >
            <Group gap={12} wrap="nowrap">
              <Text size="lg" fw={700} c={h.won ? 'green' : 'red'} style={{ minWidth: '20px', textAlign: 'center' }}>
                {h.won ? '✓' : '✗'}
              </Text>
              <Text size="sm" fw={500}>
                {h.opponent}
              </Text>
            </Group>
            <Text size="sm" fw={700} c={h.won ? 'green' : 'gray.4'} mr={4} style={{ whiteSpace: 'nowrap', textAlign: 'left' }}>
              {h.skaterVotes}:{h.opponentVotes} votes
            </Text>
          </Group>
        ))}
      </Stack>
    </Stack>
  );
}
