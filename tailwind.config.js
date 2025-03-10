/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			colors: {
				primary: {
					50: '#f0f9ff',
					100: '#e0f2fe',
					200: '#bae6fd',
					300: '#7dd3fc',
					400: '#38bdf8',
					500: '#0ea5e9',
					600: '#0284c7',
					700: '#0369a1',
					800: '#075985',
					900: '#0c4a6e',
					950: '#082f49',
				},
				secondary: {
					50: '#fff7ed',
					100: '#ffedd5',
					200: '#fed7aa',
					300: '#fdba74',
					400: '#fb923c',
					500: '#f97316',
					600: '#ea580c',
					700: '#c2410c',
					800: '#9a3412',
					900: '#7c2d12',
					950: '#431407',
				},
			},
			animation: {
				'swing-slow': 'swing-slow 2.5s cubic-bezier(0.4, 0, 0.2, 1)',
				'swing-med': 'swing-med 2s cubic-bezier(0.4, 0, 0.2, 1)',
				'swing-fast': 'swing-fast 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
			},
			keyframes: {
				'swing-slow': {
					'0%': { transform: 'rotate(0deg)' },
					'25%': { transform: 'rotate(5deg)' },
					'50%': { transform: 'rotate(0deg)' },
					'75%': { transform: 'rotate(-5deg)' },
					'100%': { transform: 'rotate(0deg)' },
				},
				'swing-med': {
					'0%': { transform: 'rotate(0deg)' },
					'25%': { transform: 'rotate(7deg)' },
					'50%': { transform: 'rotate(0deg)' },
					'75%': { transform: 'rotate(-7deg)' },
					'100%': { transform: 'rotate(0deg)' },
				},
				'swing-fast': {
					'0%': { transform: 'rotate(0deg)' },
					'25%': { transform: 'rotate(10deg)' },
					'50%': { transform: 'rotate(0deg)' },
					'75%': { transform: 'rotate(-10deg)' },
					'100%': { transform: 'rotate(0deg)' },
				},
			},
		},
	},
	plugins: [],
};
