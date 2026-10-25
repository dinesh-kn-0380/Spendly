/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        primary: {
          DEFAULT: '#18181b', // zinc-900
          foreground: '#ffffff',
          50: '#f4f4f5',
          100: '#e4e4e7',
          200: '#d4d4d8',
          600: '#27272a',
          800: '#18181b',
          900: '#09090b',
        },
        credit: {
          DEFAULT: '#16a34a', // green-600
          light: '#dcfce7', // green-100
          dark: '#15803d', // green-700
          text: '#166534', // green-800
        },
        debit: {
          DEFAULT: '#e11d48', // rose-600
          light: '#ffe4e6', // rose-100
          dark: '#be123c', // rose-700
          text: '#9f1239', // rose-800
        },
        transfer: {
          DEFAULT: '#6366f1', // indigo-500
          light: '#e0e7ff', // indigo-100
          dark: '#4f46e5', // indigo-600
          text: '#3730a3', // indigo-800
        },
        border: 'hsl(var(--border))',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 2px 8px -2px rgba(0, 0, 0, 0.06), 0 1px 4px -1px rgba(0, 0, 0, 0.04)',
        'elevated': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
