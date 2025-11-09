import { Alert, Anchor, Button, Group, Paper, Stack, Text, Textarea } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconShare } from '@tabler/icons-react';

import { PLACEHOLDER_TEXT, EXAMPLE_TEXT } from './examples';

interface ScoreInputProps {
  input: string;
  onInputChange: (value: string) => void;
  error?: string;
}

export function ScoreInput({ input, onInputChange, error }: ScoreInputProps) {
  const handleLoadExample = () => {
    if (input.trim() && input !== EXAMPLE_TEXT) {
      modals.openConfirmModal({
        title: 'Replace current input?',
        children: (
          <Text size="sm">
            This will replace your current input with the example data. Your current data will be lost.
          </Text>
        ),
        labels: { confirm: 'Load example', cancel: 'Cancel' },
        confirmProps: { color: 'cyan' },
        radius: 'lg',
        onConfirm: () => onInputChange(EXAMPLE_TEXT),
      });
    } else {
      onInputChange(EXAMPLE_TEXT);
    }
  };

  const handleClear = () => {
    if (input.trim() && input !== EXAMPLE_TEXT) {
      modals.openConfirmModal({
        title: 'Clear all input?',
        children: (
          <Text size="sm">
            This will delete all your current input. This action cannot be undone.
          </Text>
        ),
        labels: { confirm: 'Clear', cancel: 'Cancel' },
        confirmProps: { color: 'red' },
        radius: 'lg',
        onConfirm: () => onInputChange(''),
      });
    } else {
      onInputChange('');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notifications.show({
        title: 'Link copied!',
        message: 'Share this link to let others see your results',
        color: 'cyan',
      });
    } catch {
      notifications.show({
        title: 'Failed to copy',
        message: 'Please try again',
        color: 'red',
      });
    }
  };

  return (
    <Paper shadow="sm" p="md" withBorder radius="md">
      <Stack gap="sm">
        <Group justify="flex-end" align="center">
          <Group gap="md">
            <Anchor
              size="sm"
              onClick={handleLoadExample}
              style={{ cursor: 'pointer' }}
            >
              Load example
            </Anchor>
            <Anchor
              size="sm"
              onClick={handleClear}
              style={{ cursor: 'pointer' }}
            >
              Clear
            </Anchor>
            <Button
              size="xs"
              variant="light"
              leftSection={<IconShare size={14} />}
              onClick={handleShare}
              radius="md"
            >
              Share
            </Button>
          </Group>
        </Group>
        <Textarea
          value={input}
          onChange={(e) => onInputChange(e.currentTarget.value)}
          rows={10}
          placeholder={PLACEHOLDER_TEXT}
          styles={{ input: { fontFamily: 'monospace' } }}
          radius="md"
        />
        <Text size="xs" style={{ fontStyle: 'italic' }}>
          <Text c="dimmed" span ff="monospace">Format:</Text> <Text span ff="monospace">Name: A1 A2 A3 / B1 B2 B3</Text>
        </Text>
        {error && (
          <Alert color="orange" radius="md">
            {error}
          </Alert>
        )}
      </Stack>
    </Paper>
  );
}
