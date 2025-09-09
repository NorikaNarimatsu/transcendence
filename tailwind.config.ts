import type { Config } from 'tailwindcss' //Optional, but useful, it provides autocompletion and type checks in editors like VS Code.

export default {
  content: [
    "./index.html", //Root HTML
    "./src/**/*.{js,ts,jsx,tsx}", //Tailwind scans the files listed in here and generates CSS only for the classes it finds.
  ],
  theme: { //Theme contains Tailwind's design tokens (colors, spacing, fonts, breakpoints, etc)
    extend: { //Extend means adding to the default value instead of replacing it.
		colors: {
			brand: {
				deep_blue: '1900a7',
				light_pink: 'ffc7e9',
				dark_pink: 'ec8fc7',
				purple: '7a63fe',
			},
		},
	},
  },
  plugins: [], //An array of Tailwind plugins like @tailwindcss/forms or @tailwindcss/typography.
} satisfies Config
