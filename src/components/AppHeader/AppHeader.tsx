import { Stack, Text } from '@mantine/core';
import { Sparkles } from '../Sparkles/Sparkles';

export function AppHeader() {
  return (
    <Stack gap={4}>
      <Text size="xl" ta="center">
        <Sparkles count={6}>
          <Text span fw={500} className="rainbow-gradient">
            🛼 Rollkunstlauf Ranking Calculator
          </Text>
        </Sparkles>
      </Text>
      <Text size="xs" ta="center" c="dimmed" fs="italic">
        Why isn't the top-scoring skater in 1st place?
      </Text>
    </Stack>
  );
}
