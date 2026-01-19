import { useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import { selectTheme } from '../store/slices/uiSlice';

/**
 * Hook to manage theme application to DOM
 * Handles:
 * - Applying data-theme attribute to document.documentElement
 * - Syncing with Redux state
 */
export const useTheme = () => {
  const theme = useAppSelector(selectTheme);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return { theme };
};
