import { useEffect } from 'react';

export function usePaletteShortcut(onOpen: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (!event.key) return;
      const isCmdK = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';

      if (isCmdK) {
        event.preventDefault();
        onOpen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpen]);
}
