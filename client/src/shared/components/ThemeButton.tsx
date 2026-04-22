import { useTheme } from '../../hooks/useTheme';
import type { Theme } from '../../providers/theme/ThemeContext';
import type { ReactNode } from 'react';

function MonitorIcon() {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width='18'
            height='18'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            viewBox='0 0 24 24'
        >
            <rect x='2' y='3' width='20' height='14' rx='2' />
            <path d='M8 21h8M12 17v4' />
        </svg>
    );
}

function SunIcon() {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width='18'
            height='18'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            viewBox='0 0 24 24'
        >
            <circle cx='12' cy='12' r='4' />
            <path d='M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41' />
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width='18'
            height='18'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            viewBox='0 0 24 24'
        >
            <path d='M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z' />
        </svg>
    );
}

const icons: Record<Theme, () => ReactNode> = {
    system: MonitorIcon,
    light: SunIcon,
    dark: MoonIcon,
};

export function ThemeButton({
    theme,
    text,
    textOrientation = 'right',
}: {
    theme: Theme;
    text?: string;
    textOrientation?: 'left' | 'right';
}) {
    const { theme: current, setTheme } = useTheme();
    const Icon = icons[theme];
    const isActive = current === theme;

    return (
        <button
            onClick={() => setTheme(theme)}
            aria-pressed={isActive}
            title={`${theme.charAt(0).toUpperCase() + theme.slice(1)} theme`}
            className={`flex justify-items items-center cursor-pointer ${textOrientation === 'left' ? 'flex-row-reverse' : 'flex-row'} ${isActive ? 'bg-support text-text' : ''}`}
        >
            <Icon />
            {text && <span className='mx-2'>{text.charAt(0).toUpperCase() + text.slice(1)}</span>}
        </button>
    );
}
