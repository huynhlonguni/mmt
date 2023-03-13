/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	content: [
		"./src/**/*.{js,jsx,ts,tsx}",
	],
	theme: {
		extend: {
			colors: {
				zinc: {
					750: '#333338',
					950: '#0c0c0e',
				},
			}
		},
	},
	plugins: [
		require("daisyui"),
		require('@tailwindcss/typography'),
		require("tailwindcss-scoped-groups")({
			groups: ["one", "two"],
		}),
	],
}
