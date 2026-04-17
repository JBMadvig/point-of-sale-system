import { createContext } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export type ThemeContextType = {
	theme: Theme;
	resolvedTheme: 'light' | 'dark';
	setTheme: (theme: Theme) => void;
};

export const ThemeContext = createContext<ThemeContextType | null>(null);
