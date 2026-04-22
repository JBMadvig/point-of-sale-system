import { type ReactNode } from 'react';

interface ButtonGroupProps {
    children: ReactNode;
    className?: string;
    orientation?: 'horizontal' | 'vertical';
}

export function ButtonGroup({
    children,
    className = '',
    orientation = 'horizontal',
}: ButtonGroupProps) {
    const isHorizontal = orientation === 'horizontal';

    return (
        <div
            role='group'
            className={[
                'flex overflow-hidden max-w-fit rounded-lg border border-border bg-dominant',
                isHorizontal ? 'flex-row' : 'flex-col',
                '*:rounded-none *:px-4 *:py-2 *:cursor-pointer *:text-sm *:font-medium *:transition-colors [&>*:hover]:bg-support',
                isHorizontal
                    ? '[&>*:first-child]:rounded-l-lg [&>*:last-child]:rounded-r-lg'
                    : '[&>*:first-child]:rounded-t-lg [&>*:last-child]:rounded-b-lg',
                isHorizontal
                    ? '[&>*:not(:last-child)]:border-r [&>*:not(:last-child)]:border-r-border'
                    : '[&>*:not(:last-child)]:border-b [&>*:not(:last-child)]:border-b-border',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            {children}
        </div>
    );
}
