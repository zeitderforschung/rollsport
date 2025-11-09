import { Paper, Table } from '@mantine/core';

import type { SkaterResult } from '../../types/SkaterResult';
import { TableHeader } from './TableHeader';
import { TableRow } from './TableRow';

interface SkaterResultTableProps {
  results: SkaterResult[];
}

export function SkaterResultTable({ results }: SkaterResultTableProps) {
  return (
    <Paper shadow="sm" p="md" withBorder radius="md" className="fade-in">
      <Table.ScrollContainer minWidth={800}>
        <Table striped highlightOnHover>
          <TableHeader />
          <Table.Tbody>
            {results.map((result) => (
              <TableRow key={result.name} result={result} allResults={results} />
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
}
