export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/components/ui/**/*.{js,ts,jsx,tsx}", // ТОЛЬКО ui компоненты
  ],
  theme: {
    extend: {
      colors: {
        // Маппинг Tailwind на CSS переменные из design
        primary: "var(--color-accent-primary)",
        secondary: "var(--color-bg-secondary)",
        accent: "var(--color-accent-primary)",
        background: "var(--color-bg-primary)",
        foreground: "var(--color-text-primary)",
        border: "var(--color-border)",
      },
    }
  },
  plugins: [],
}
