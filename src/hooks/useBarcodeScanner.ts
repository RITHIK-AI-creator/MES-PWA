import { useEffect, useRef } from 'react';

export const useBarcodeScanner = (onScan: (barcode: string) => void) => {
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    let barcode = '';
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is explicitly typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key === 'Enter') {
        if (barcode) {
          onScanRef.current(barcode);
        }
        barcode = '';
      } else if (e.key.length === 1) {
        // Normal character
        barcode += e.key;

        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          // Reset barcode if it takes too long between keystrokes (not a scanner)
          barcode = '';
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeoutId);
    };
  }, []);
};
