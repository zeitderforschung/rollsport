import { Container, Stack } from '@mantine/core';

import { useUrlState } from './hooks/useUrlState';
import { useScoreCalculation } from './hooks/useScoreCalculation';
import { AppHeader } from './components/AppHeader/AppHeader';
import { ScoreInput } from './components/ScoreInput/ScoreInput';
import { HeadToHeadNetwork } from './components/HeadToHeadNetwork/HeadToHeadNetwork';
import { SkaterResultTable } from './components/SkaterResultTable/SkaterResultTable';
import { AppFooter } from './components/AppFooter/AppFooter';

function App() {
  const [input, setInput] = useUrlState();
  const { results, error } = useScoreCalculation(input);

  return (
    <Container size="xl" py="md">
      <Stack gap="md">
        <AppHeader />
        <ScoreInput input={input} onInputChange={setInput} error={error} />

        {results.length > 0 && (
          <Stack gap="md">
            <SkaterResultTable results={results} />
            <HeadToHeadNetwork results={results} maxHeight={800} />
          </Stack>
        )}

        <AppFooter />
      </Stack>
    </Container>
  );
}

export default App;
