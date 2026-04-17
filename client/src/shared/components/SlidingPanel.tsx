import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SlidingPanelContext } from './SlidingPanelContext';

const ease = [0.32, 0.72, 0, 1] as const;
const duration = 0.5;

const backgroundVariants = {
	closed: {
		scale: 1,
		x: '0%',
		borderRadius: '0px',
		filter: 'brightness(1)',
		transition: { duration, ease },
	},
	open: {
		scale: 0.88,
		x: '-68%',
		borderRadius: '16px',
		filter: 'brightness(0.7)',
		transition: { duration, ease },
	},
};

const panelVariants = {
	hidden: {
		x: '100%',
		transition: { duration, ease },
	},
	visible: {
		x: '0%',
		transition: { duration, ease },
	},
};

const contentContainerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			delayChildren: 0.1,
			staggerChildren: 0.08,
		},
	},
};

const contentItemVariants = {
	hidden: { opacity: 0, y: 12 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.35, ease: 'easeOut' as const },
	},
};

export function PanelContent({ children }: { children: ReactNode }) {
	return (
		<motion.div
			variants={contentContainerVariants}
			initial='hidden'
			animate='visible'
			className='p-8'>
			{children}
		</motion.div>
	);
}

export function PanelItem({ children }: { children: ReactNode }) {
	return <motion.div variants={contentItemVariants}>{children}</motion.div>;
}

export function SlidingPanelRoot({ children }: { children: ReactNode }) {
	const [panelContent, setPanelContent] = useState<ReactNode>(null);
	const [isOpen, setIsOpen] = useState(false);

	const openPanel = useCallback((content: ReactNode) => {
		setPanelContent(content);
		setIsOpen(true);
	}, []);

	const closePanel = useCallback(() => {
		setIsOpen(false);
	}, []);

	useEffect(() => {
		if (!isOpen) return;
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') closePanel();
		};
		window.addEventListener('keydown', handleKey);
		return () => window.removeEventListener('keydown', handleKey);
	}, [isOpen, closePanel]);

	return (
		<SlidingPanelContext.Provider value={{ isOpen, openPanel, closePanel }}>
			<div className='relative w-full h-dvh overflow-hidden bg-bg'>
				<motion.div
					className='absolute inset-0 overflow-hidden'
					variants={backgroundVariants}
					animate={isOpen ? 'open' : 'closed'}>
					<div className='w-full h-full overflow-auto'>{children}</div>
				</motion.div>

				{isOpen && (
					<div
						className='absolute inset-y-0 left-0 cursor-pointer'
						style={{ width: '26%' }}
						onClick={closePanel}
					/>
				)}

				<AnimatePresence
					onExitComplete={() => {
						if (!isOpen) setPanelContent(null);
					}}>
					{isOpen && (
						<motion.div
							key='sliding-panel'
							className='absolute top-0 right-0 h-full p-4'
							style={{ width: '74%' }}
							variants={panelVariants}
							initial='hidden'
							animate='visible'
							exit='hidden'>
							<div className='w-full h-full border border-border bg-dominant rounded-2xl overflow-auto shadow-2xl'>
								{panelContent}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</SlidingPanelContext.Provider>
	);
}
