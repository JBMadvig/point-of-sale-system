import { type ReactNode } from 'react';
import { Toast } from '@base-ui/react/toast';

export function ToastProvider({
    children,
    limit = 5,
    timeout = 5000,
}: {
    children: ReactNode;
    limit?: number;
    timeout?: number;
}) {
    return (
        <Toast.Provider limit={limit} timeout={timeout}>
            {children}
            <ToastViewportWithToasts />
        </Toast.Provider>
    );
}

function ToastViewportWithToasts() {
    const { toasts } = Toast.useToastManager();

    return (
        <Toast.Viewport
            className={[
                'fixed bottom-4 right-4 z-10',
                'flex flex-col-reverse gap-2',
                'w-90 max-w-[calc(100vw-2rem)]',
                'outline-none',
            ]
                .filter(Boolean)
                .join(' ')}
        >
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} />
            ))}
        </Toast.Viewport>
    );
}

type ToastData = ReturnType<typeof Toast.useToastManager>['toasts'][number];

function ToastItem({ toast }: { toast: ToastData }) {
    return (
        <Toast.Root
            toast={toast}
            swipeDirection={['right', 'down']}
            className={[
                'bg-dominant border border-border rounded-xl shadow-lg',
                'data-[type=success]:border-l-4 data-[type=success]:border-l-accent',
                'data-[type=error]:border-l-4 data-[type=error]:border-l-danger',
                'relative w-full overflow-hidden',
                'transition-all duration-300 ease-out',
                'data-starting-style:opacity-0 data-starting-style:translate-x-4',
                'data-ending-style:opacity-0 data-ending-style:translate-x-8',
            ]
                .filter(Boolean)
                .join(' ')}
        >
            <Toast.Content className='flex items-center gap-3 p-4'>
                <TypeIcon type={toast.type} />

                <div className='flex-1 min-w-0'>
                    {toast.title && (
                        <Toast.Title className='text-text font-semibold text-sm leading-snug' />
                    )}
                    {toast.description && (
                        <Toast.Description className='text-text-muted text-sm mt-0.5 leading-snug' />
                    )}
                    <Toast.Action
                        className={[
                            'mt-2 inline-flex items-center rounded-lg px-3 py-1.5',
                            'bg-accent text-accent-text text-xs font-medium',
                            'hover:bg-accent-hover transition-colors cursor-pointer',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                    />
                </div>

                <Toast.Close
                    className={[
                        'shrink-0 p-0.5 rounded-md',
                        'text-text-muted hover:text-text',
                        'transition-colors cursor-pointer',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                    aria-label='Dismiss notification'
                >
                    <CloseIcon />
                </Toast.Close>
            </Toast.Content>
        </Toast.Root>
    );
}

function TypeIcon({ type }: { type?: string }) {
    if (type === 'success') {
        return (
            <span className='shrink-0 mt-0.5 text-accent' aria-hidden>
                <svg
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                >
                    <path d='M20 6 9 17l-5-5' />
                </svg>
            </span>
        );
    }
    if (type === 'error') {
        return (
            <span className='shrink-0 mt-0.5 text-danger' aria-hidden>
                <svg
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                >
                    <circle cx='12' cy='12' r='10' />
                    <path d='m15 9-6 6M9 9l6 6' />
                </svg>
            </span>
        );
    }
    if (type === 'info') {
        return (
            <span className='shrink-0 mt-0.5 text-text-muted' aria-hidden>
                <svg
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                >
                    <circle cx='12' cy='12' r='10' />
                    <path d='M12 16v-4M12 8h.01' />
                </svg>
            </span>
        );
    }
    return null;
}

function CloseIcon() {
    return (
        <svg
            width='14'
            height='14'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2.5'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden
        >
            <path d='M18 6 6 18M6 6l12 12' />
        </svg>
    );
}
