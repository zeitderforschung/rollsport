import { Anchor, Text } from '@mantine/core';

export function AppFooter() {
  return (
    <Text ta="center" size="sm" c="dimmed">
      Based on <Anchor c="inherit" underline="hover" href="https://www.rollkunstlauf-driv.de/fileadmin/rollkunstlauf-driv/documente/regelwerk/Wertungskriterien/2025_01_DRIV_Wertungskriterien_Einzellaufen_Kuer.pdf" target="_blank">DRIV Wertungskriterien Einzellaufen Kür</Anchor> (Stand: 01/2025)
    </Text>
  );
}
