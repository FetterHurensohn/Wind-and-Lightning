/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Layout dimensions
    'h-7', 'h-8', 'h-9', 'h-10', 'h-11', 'h-12', 'h-48',
    'w-[200px]', 'w-[280px]', 'w-[220px]', 'w-[320px]', 'w-[120px]',
    'h-[280px]', 'h-[320px]',
    'grid-cols-[200px_1fr_280px]', 'grid-cols-[220px_1fr_320px]',
    'grid-rows-[44px_1fr_280px]', 'grid-rows-[48px_1fr_320px]',
    // Font sizes
    'text-xs', 'text-sm', 'text-base', 'text-md',
    'text-[9px]', 'text-[10px]', 'text-[11px]', 'text-[12px]', 'text-[13px]',
    // Precise dimensions
    'w-[1px]', 'w-[2px]', 'w-[16px]', 'w-[18px]',
    'h-[1px]', 'h-[2px]', 'h-[16px]', 'h-[18px]',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        panel: 'var(--panel)',
        surface: 'var(--surface)',
        accent: 'var(--accent)',
        'accent-2': 'var(--accent-2)',
        muted: 'var(--muted)',
        text: 'var(--text)',
        'muted-contrast': 'var(--muted-contrast)',
        hover: 'var(--hover)',
        success: 'var(--success)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
