import { Badge, Group, Table, Text, Tooltip } from '@mantine/core';

import type { SkaterResult } from '../../types/SkaterResult';
import type { TieBreakLevel } from '../../types/TieBreakLevel';
import { RankingExplanation } from './RankingExplanation';
import { JudgeScores } from './JudgeScores';

import styles from './TableRow.module.css';

interface TableRowProps {
  result: SkaterResult;
  allResults: SkaterResult[];
}

function getTieBreakBadgeLabel(
  tieBreakInfo?: Array<{ level: TieBreakLevel; value: number }>
): string {
  if (!tieBreakInfo || tieBreakInfo.length === 0) {
    return '';
  }

  const parts: string[] = [];

  for (const { level, value } of tieBreakInfo) {
    const formattedValue = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);

    switch (level) {
      case 'direct-comparison':
        parts.push(`Tied votes: ${formattedValue}`);
        break;
      case 'b-score-sum':
        parts.push(`B-Score: ${formattedValue}`);
        break;
      case 'comparison-all':
        parts.push(`Votes: ${formattedValue}`);
        break;
      case 'total-score':
        parts.push(`Total: ${formattedValue}`);
        break;
    }
  }

  return parts.join(', ');
}

function getTieBreakTooltip(level: TieBreakLevel): string {
  switch (level) {
    case 'direct-comparison':
      return 'Judge votes when comparing against other skaters with the same rank';
    case 'b-score-sum':
      return 'Sum of all Artistic scores (B-scores) - higher is better';
    case 'comparison-all':
      return 'Total judge votes when comparing against all skaters in the competition';
    case 'total-score':
      return 'Final total score (Technical + Artistic) used as last tie-breaker';
    default:
      return '';
  }
}

function getRowClassName(rank: number): string {
  switch (rank) {
    case 1:
      return styles.firstPlaceGlow;
    case 2:
      return styles.secondPlaceHighlight;
    case 3:
      return styles.thirdPlaceHighlight;
    default:
      return '';
  }
}

function getRankIcon(rank: number) {
  const size = rank <= 3 ? '1.75rem' : '1.25rem';
  switch (rank) {
    case 1:
      return <span style={{ fontSize: size }}>🥇</span>;
    case 2:
      return <span style={{ fontSize: size }}>🥈</span>;
    case 3:
      return <span style={{ fontSize: size }}>🥉</span>;
    default:
      return null;
  }
}

export function TableRow({ result, allResults }: TableRowProps) {
  return (
    <Table.Tr className={getRowClassName(result.rank)}>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <Badge
            variant={result.rank <= 3 ? 'filled' : 'light'}
            size="lg"
            className={result.rank === 1 ? styles.pulseBadge : ''}
          >
            {result.rank}
          </Badge>
          {getRankIcon(result.rank)}
        </Group>
      </Table.Td>
      <Table.Td fw={600}>
        <Tooltip
          label={<RankingExplanation result={result} allResults={allResults} />}
          position="right"
          multiline
          w={250}
          color="dark"
          withArrow
          radius="lg"
          p="md"
          offset={10}
          events={{ hover: true, focus: true, touch: true }}
          withinPortal
        >
          <Text span style={{ borderBottom: '1px dotted', cursor: 'help' }}>
            {result.name}
          </Text>
        </Tooltip>
      </Table.Td>
      <Table.Td>
        {result.tieBreakInfo && result.tieBreakInfo.length > 0 ? (
          <Group gap={4} style={{ flexWrap: 'wrap' }}>
            {result.tieBreakInfo.map((info, idx) => (
              <Tooltip
                key={idx}
                label={getTieBreakTooltip(info.level)}
                position="top"
                withArrow
                multiline
                w={220}
              >
                <Badge size="sm" variant="light" c="cyan" style={{ cursor: 'help' }}>
                  {getTieBreakBadgeLabel([info])}
                </Badge>
              </Tooltip>
            ))}
          </Group>
        ) : (
          <Text size="sm" c="dimmed">—</Text>
        )}
      </Table.Td>
      <Table.Td ta="center" ff="monospace" fw={600}>
        {result.majorityVictories}
      </Table.Td>
      <Table.Td ta="center" ff="monospace">
        {result.totalScore.toFixed(1)}
      </Table.Td>
      <Table.Td>
        <JudgeScores aScores={result.aScores} bScores={result.bScores} />
      </Table.Td>
    </Table.Tr>
  );
}
