import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'light' | 'dark';

export interface LayoutConfig {
  header: { visible: boolean };
  footer: { visible: boolean };
  mobileBottomNav: { visible: boolean };
}

export interface UIState {
  theme: Theme;
  layout: LayoutConfig;
}

// Helper: Get theme from localStorage
const getStoredTheme = (): Theme => {
  try {
    const stored = localStorage.getItem('fuddly-theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch (error) {
    console.error('Failed to read theme from localStorage:', error);
  }
  return 'light'; // Default to light theme
};

// Default layout configuration
const defaultLayoutConfig: LayoutConfig = {
  header: { visible: true },
  footer: { visible: true },
  mobileBottomNav: { visible: true },
};

const initialState: UIState = {
  theme: getStoredTheme(),
  layout: defaultLayoutConfig,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;

      // Persist to localStorage
      try {
        localStorage.setItem('fuddly-theme', action.payload);
      } catch (error) {
        console.error('Failed to save theme to localStorage:', error);
      }
    },
    toggleTheme: (state) => {
      // Toggle: light <-> dark
      state.theme = state.theme === 'light' ? 'dark' : 'light';

      try {
        localStorage.setItem('fuddly-theme', state.theme);
      } catch (error) {
        console.error('Failed to save theme to localStorage:', error);
      }
    },
    setLayoutConfig: (state, action: PayloadAction<Partial<LayoutConfig>>) => {
      state.layout = {
        ...state.layout,
        ...action.payload,
      };
    },
    resetLayoutConfig: (state) => {
      state.layout = defaultLayoutConfig;
    },
  },
});

export const { setTheme, toggleTheme, setLayoutConfig, resetLayoutConfig } = uiSlice.actions;

// Selectors
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectLayoutConfig = (state: { ui: UIState }) => state.ui.layout;
export const selectHeaderVisible = (state: { ui: UIState }) => state.ui.layout.header.visible;
export const selectFooterVisible = (state: { ui: UIState }) => state.ui.layout.footer.visible;
export const selectMobileBottomNavVisible = (state: { ui: UIState }) => state.ui.layout.mobileBottomNav.visible;

export default uiSlice.reducer;
