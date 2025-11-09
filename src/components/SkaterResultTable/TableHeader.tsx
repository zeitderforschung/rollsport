import { Group, HoverCard, Stack, Table, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

export function TableHeader() {
  return (
    <Table.Thead>
      <Table.Tr>
        <Table.Th>Rank</Table.Th>
        <Table.Th>Name</Table.Th>
        <Table.Th>Tie-Breaks</Table.Th>
        <Table.Th ta="center">
          <HoverCard width={320} shadow="md" position="top">
            <HoverCard.Target>
              <Group gap={4} justify="center" style={{ cursor: 'help' }}>
                <Text>M.V.</Text>
                <IconInfoCircle size={16} style={{ opacity: 0.6 }} />
              </Group>
            </HoverCard.Target>
            <HoverCard.Dropdown>
              <Stack gap="xs">
                <Text size="sm" fw={600}>Majority Victories (M.V.)</Text>
                <Text size="sm">
                  How many other skaters this skater beat in head-to-head comparisons.
                </Text>
                <Text size="sm" c="dimmed">
                  Higher M.V. = better rank. When M.V. is the same, tie-breakers decide the placement.
                </Text>
              </Stack>
            </HoverCard.Dropdown>
          </HoverCard>
        </Table.Th>
        <Table.Th ta="center">Total</Table.Th>
        <Table.Th>Judge Scores</Table.Th>
      </Table.Tr>
    </Table.Thead>
  );
}
