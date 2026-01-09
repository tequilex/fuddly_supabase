import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'light' | 'dark';

export interface UIState {
  theme: Theme;
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

const initialState: UIState = {
  theme: getStoredTheme(),
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
  },
});

export const { setTheme, toggleTheme } = uiSlice.actions;

// Selectors
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;

export default uiSlice.reducer;
