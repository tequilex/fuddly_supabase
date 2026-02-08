import { useState, useEffect } from 'react';

/**
 * Hook to detect media query matches
 * @param query - CSS media query string (e.g., '(max-width: 768px)')
 * @returns boolean indicating if the query matches
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Create listener function
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Add listener (supports both old and new API)
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // @ts-ignore - for older browsers
      media.addListener(listener);
    }

    // Cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        // @ts-ignore - for older browsers
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
};

/**
 * Hook to detect mobile devices (max-width: 480px)
 */
export const useIsMobile = () => useMediaQuery('(max-width: 480px)');

/**
 * Hook to detect tablet and mobile devices (max-width: 768px)
 */
export const useIsTablet = () => useMediaQuery('(max-width: 768px)');

/**
 * Hook to detect desktop devices (min-width: 769px)
 */
export const useIsDesktop = () => useMediaQuery('(min-width: 769px)');
