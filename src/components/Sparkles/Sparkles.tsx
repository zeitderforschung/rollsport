import { Box } from '@mantine/core';

import styles from './Sparkles.module.css';

interface SparklesProps {
  children: React.ReactNode;
  count?: number;
}

// Fixed sparkle positions matching original implementation
const SPARKLE_POSITIONS = [
  { top: '10%', left: '10%', right: undefined, delay: '0s' },
  { top: '20%', left: undefined, right: '15%', delay: '0.5s' },
  { top: '60%', left: '20%', right: undefined, delay: '1s' },
  { top: '70%', left: undefined, right: '10%', delay: '1.5s' },
  { top: '40%', left: '5%', right: undefined, delay: '0.8s' },
  { top: '50%', left: undefined, right: '20%', delay: '1.2s' },
];

export function Sparkles({ children, count = 6 }: SparklesProps) {
  const sparkles = SPARKLE_POSITIONS.slice(0, count);

  return (
    <Box component="span" pos="relative" display="inline-block">
      {sparkles.map((sparkle, index) => (
        <Box
          key={index}
          component="span"
          className={styles.sparkle}
          style={{
            top: sparkle.top,
            left: sparkle.left,
            right: sparkle.right,
            animationDelay: sparkle.delay,
          }}
        />
      ))}
      <Box component="span" pos="relative" style={{ zIndex: 1 }}>
        {children}
      </Box>
    </Box>
  );
}
