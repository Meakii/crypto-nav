import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';


const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--ibm-plex-sans)'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        button: {
          primary: {
            bg: {
              default: 'hsl(var(--color-interactive-button-brand-bg-default))',
              hover: 'hsl(var(--color-interactive-button-brand-bg-hover))',
              pressed: 'hsl(var(--color-interactive-button-brand-bg-pressed))',
            },
            border: {
              default: 'hsl(var(--color-interactive-button-brand-border-default))',
            },
            label: {
              default: 'hsl(var(--color-interactive-button-brand-label))',
            }
          }
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    plugin(function({ addComponents, theme }) {
      addComponents({
        '.btn-primary': {
          backgroundColor: 'var(--color-interactive-button-brand-bg-default)',
          borderColor: 'var(--color-interactive-button-brand-border-default)',
          borderWidth: '1px',
          borderStyle: 'solid',
          color: 'var(--color-interactive-button-brand-label)',
          '&:hover': {
            backgroundColor: 'var(--color-interactive-button-brand-bg-hover, var(--color-interactive-button-brand-bg-default))',
          },
          '&:active': {
            backgroundColor: 'var(--color-interactive-button-brand-bg-active, var(--color-interactive-button-brand-bg-default))',
          },
        },
        '.btn-outlined': {
          backgroundColor: 'transparent',
          borderColor: 'var(--color-interactive-button-primary-border-default)',
          borderWidth: '1px',
          borderStyle: 'solid',
          color: 'var(--color-interactive-button-primary-label-default)',
          '&:hover': {
            borderColor: 'var(--color-interactive-button-primary-border-hover)',
            color: 'var(--color-interactive-button-primary-label-hover)',
          },
          '&:active': {
            borderColor: 'var(--color-interactive-button-primary-border-pressed)',
            color: 'var(--color-interactive-button-primary-label-pressed)',
          },
        },
        '.tab-contained': {
          backgroundColor: 'var(--color-tabs-contained-bg-default)',
          color: 'var(--color-tabs-contained-label-default)',
          '&:hover': {
            backgroundColor: 'var(--color-tabs-contained-bg-hover)',
            color: 'var(--color-tabs-contained-label-hover)',
          },
          '&:active': {
            backgroundColor: 'var(--color-tabs-contained-bg-active)',
            color: 'var(--color-tabs-contained-label-active)',
          },
        },
        '.btn-menu': {
          backgroundColor: 'transparent',
          color: 'var(--color-interactive-neutral-label-default)',
          '&:hover': {
            backgroundColor: 'var(--color-interactive-neutral-bg-hover)',
            color: 'var(--color-interactive-neutral-label-hover)',
          },
          '&:active': {
            backgroundColor: 'var(--color-interactive-neutral-bg-active)',
            color: 'var(--color-interactive-neutral-label-active)',
          },
        },
        '.input-default': {
          backgroundColor: 'transparent',
          color: 'var(--color-interactive-neutral-label-default)',
          borderColor: 'var(--color-interactive-outline-default)',
          borderWidth: '1px',
          borderStyle: 'solid',
          '&:hover': {
            borderColor: 'var(--color-interactive-outline-hover)',
          },
          '&:active': {
            borderColor: 'var(--color-interactive-outline-active)',
          },
        },
      });
    }),
  ],
};
export default config;