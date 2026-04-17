import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

export type SlidingPanelContextType = {
	isOpen: boolean;
	openPanel: (content: ReactNode) => void;
	closePanel: () => void;
};

export const SlidingPanelContext =
	createContext<SlidingPanelContextType | null>(null);

export function useSlidingPanel() {
	const ctx = useContext(SlidingPanelContext);
	if (!ctx)
		throw new Error('useSlidingPanel must be used within SlidingPanelRoot');
	return ctx;
}
