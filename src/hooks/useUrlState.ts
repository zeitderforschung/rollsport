import { useEffect, useState } from 'react';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

export function useUrlState() {
  const [input, setInput] = useState(() => {
    // Load data from URL hash (everything after the #)
    const hash = window.location.hash.slice(1); // Remove leading #

    if (hash) {
      try {
        const decompressed = decompressFromEncodedURIComponent(hash);
        return decompressed || '';
      } catch {
        // If decompression fails, return empty
      }
    }
    return '';
  });

  // Update URL whenever input changes
  useEffect(() => {
    if (input.trim()) {
      const compressed = compressToEncodedURIComponent(input);
      window.history.replaceState({}, '', `#${compressed}`);
    } else {
      // Clear hash if input is empty
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [input]);

  return [input, setInput] as const;
}
