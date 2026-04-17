import type { Config } from 'tailwindcss';

export default {
	content: ['./index.html', './src/**/*.{ts,tsx}'],
	theme: {
		extend: {
			colors: {
				border: 'oklch(var(--color-border))',
				bg: 'oklch(var(--color-bg))',
				dominant: 'oklch(var(--color-dominant))',
				surface: 'oklch(var(--color-surface))',
				support: 'oklch(var(--color-support))',
				text: 'oklch(var(--color-text))',
				'text-muted': 'oklch(var(--color-text-muted))',
				accent: 'oklch(var(--color-accent))',
				'accent-hover': 'oklch(var(--color-accent-hover))',
				'accent-text': 'oklch(var(--color-accent-text))',
				danger: 'oklch(var(--color-danger))',
				overlay: 'oklch(var(--color-overlay))',
			},
		},
	},
	plugins: [],
} satisfies Config;
