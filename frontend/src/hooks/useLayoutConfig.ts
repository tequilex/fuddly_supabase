import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setLayoutConfig, resetLayoutConfig } from '../store/slices/uiSlice';
import type { LayoutConfig } from '../store/slices/uiSlice';

interface UseLayoutConfigOptions {
  // Simple boolean flags for convenience
  hideHeader?: boolean;
  hideFooter?: boolean;
  hideMobileBottomNav?: boolean;

  // Or use full config object for more control
  config?: Partial<LayoutConfig>;

  // Control cleanup behavior on unmount
  resetOnUnmount?: boolean; // Default: true
}

/**
 * Declarative hook to control layout visibility (header, footer, mobile nav)
 *
 * Usage examples:
 * ```tsx
 * // Simple: Hide header and nav on mobile
 * useLayoutConfig({ hideHeader: true, hideMobileBottomNav: true });
 *
 * // Advanced: Full config object
 * useLayoutConfig({
 *   config: {
 *     header: { visible: false },
 *     mobileBottomNav: { visible: false },
 *   }
 * });
 *
 * // Persist layout after unmount
 * useLayoutConfig({ hideHeader: true, resetOnUnmount: false });
 * ```
 *
 * @param options - Configuration options
 */
export const useLayoutConfig = (options: UseLayoutConfigOptions = {}) => {
  const dispatch = useAppDispatch();
  const {
    hideHeader,
    hideFooter,
    hideMobileBottomNav,
    resetOnUnmount = true
  } = options;

  useEffect(() => {
    // Build config from options
    const config: Partial<LayoutConfig> = {};

    // Apply simple boolean flags if provided
    if (hideHeader !== undefined) {
      config.header = { visible: !hideHeader };
    }

    if (hideFooter !== undefined) {
      config.footer = { visible: !hideFooter };
    }

    if (hideMobileBottomNav !== undefined) {
      config.mobileBottomNav = { visible: !hideMobileBottomNav };
    }

    // Apply layout config if there are changes
    if (Object.keys(config).length > 0) {
      dispatch(setLayoutConfig(config));
    }

    // Cleanup: reset to defaults when component unmounts
    return () => {
      if (resetOnUnmount) {
        dispatch(resetLayoutConfig());
      }
    };
  }, [
    dispatch,
    hideHeader,
    hideFooter,
    hideMobileBottomNav,
    resetOnUnmount,
  ]);
};
