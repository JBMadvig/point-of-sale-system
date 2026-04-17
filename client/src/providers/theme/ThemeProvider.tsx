import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ThemeContext, type Theme } from './ThemeContext';

const STORAGE_KEY = 'theme';

function getSystemPreference(): 'light' | 'dark' {
	return window.matchMedia('(prefers-color-scheme: dark)').matches
		? 'dark'
		: 'light';
}

function getInitialTheme(): Theme {
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === 'light' || stored === 'dark' || stored === 'system') {
		return stored;
	}
	return 'system';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<Theme>(getInitialTheme);
	const [systemPref, setSystemPref] = useState<'light' | 'dark'>(
		getSystemPreference,
	);

	useEffect(() => {
		const mq = window.matchMedia('(prefers-color-scheme: dark)');
		const handler = (e: MediaQueryListEvent) => {
			setSystemPref(e.matches ? 'dark' : 'light');
		};
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	}, []);

	const resolvedTheme = theme === 'system' ? systemPref : theme;

	useEffect(() => {
		const root = document.documentElement;
		if (resolvedTheme === 'dark') {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}
	}, [resolvedTheme]);

	const setTheme = (next: Theme) => {
		setThemeState(next);
		localStorage.setItem(STORAGE_KEY, next);
	};

	const value = useMemo(
		() => ({ theme, resolvedTheme, setTheme }),
		[theme, resolvedTheme],
	);

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}
