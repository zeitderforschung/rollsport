import { Group, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

interface JudgeScoresProps {
  aScores: (number | null)[];
  bScores: (number | null)[];
}

export function JudgeScores({ aScores, bScores }: JudgeScoresProps) {
  const hasNullScores = aScores.some(s => s === null) || bScores.some(s => s === null);

  return (
    <Group gap="md" wrap="nowrap">
      <Text size="sm" c="dimmed" ff="monospace">
        <strong>A:</strong>{' '}
        {aScores.map((s, idx) => {
          const score = s !== null ? s.toFixed(1) : '-';
          return (
            <span key={idx}>
              {idx > 0 && ', '}
              {score}
            </span>
          );
        })}
        <br />
        <strong>B:</strong>{' '}
        {bScores.map((s, idx) => {
          const score = s !== null ? s.toFixed(1) : '-';
          return (
            <span key={idx}>
              {idx > 0 && ', '}
              {score}
            </span>
          );
        })}
      </Text>
      {hasNullScores && (
        <IconAlertTriangle size={16} color="orange" style={{ flexShrink: 0 }} />
      )}
    </Group>
  );
}
