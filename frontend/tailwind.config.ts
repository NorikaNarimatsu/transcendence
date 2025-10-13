import type { Config } from 'tailwindcss' //Optional, but useful, it provides autocompletion and type checks in editors like VS Code.

export default {
  content: [
    "./index.html", //Root HTML
    "./src/**/*.{js,ts,jsx,tsx}", //Tailwind scans the files listed in here and generates CSS only for the classes it finds.
  ],
  theme: { //Theme contains Tailwind's design tokens (colors, spacing, fonts, breakpoints, etc)
    extend: { //Extend means adding to the default value instead of replacing it.
		colors: {
			blue: {
				deep: '#1900a7',
			},
			pink: {
				light: '#ffc7e9',
				dark: '#ec8fc7',
			},
			purple: {
				purple: '#7a63fe',
			}
		},
		fontFamily: {
			pixelify: ['"Pixelify Sans"', 'sans-serif'],
			dotgothic: ['"DotGothic16"', 'sans-serif'],
		},
		animation: {
			'marquee': 'marquee 15s linear infinite',
			'marquee-reverse': 'marquee-reverse 15s linear infinite',
		},
		keyframes: {
			marquee: {
          '0%': { transform: 'translateX(200%)' },
          '100%': { transform: 'translateX(-200%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-200%)' },
          '100%': { transform: 'translateX(200%)' },
        }
		}
	},
  },
  plugins: [], //An array of Tailwind plugins like @tailwindcss/forms or @tailwindcss/typography.
} satisfies Config
