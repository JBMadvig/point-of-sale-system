import { useContext } from 'react';
import { ThemeContext } from '../providers/theme/ThemeContext';

export function useTheme() {
	const v = useContext(ThemeContext);
	if (!v) throw new Error('useTheme must be used inside <ThemeProvider>');
	return v;
}
