import { Html5Qrcode } from 'html5-qrcode';
import type { QrcodeSuccessCallback } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';

interface ScannerComponentProps {
    fps?: number;
    qrbox?: { width: number; height: number };
    scanCooldownMs?: number;
    qrCodeSuccessCallback: QrcodeSuccessCallback;
}

const DEFAULT_QRBOX = { width: 250, height: 250 };

const ScannerComponent = ({
    fps = 10,
    qrbox = DEFAULT_QRBOX,
    scanCooldownMs = 0,
    qrCodeSuccessCallback,
}: ScannerComponentProps) => {
    const divRef = useRef<HTMLDivElement>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const successRef = useRef(qrCodeSuccessCallback);
    const lastScanAt = useRef<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        successRef.current = qrCodeSuccessCallback;
    });

    useEffect(() => {
        if (!divRef.current) return;

        let active = true;
        const scanner = new Html5Qrcode(divRef.current.id);
        scannerRef.current = scanner;

        scanner
            .start(
                { facingMode: 'environment' },
                { fps, qrbox },
                (...args) => {
                    const now = Date.now();
                    if (now - lastScanAt.current < scanCooldownMs) return;
                    lastScanAt.current = now;
                    successRef.current(...args);
                },
                () => {},
            )
            .then(() => {
                if (!active) {
                    try { scanner.stop(); } catch { /* noop */ }
                    try { scanner.clear(); } catch { /* noop */ }
                } else {
                    setLoading(false);
                }
            })
            .catch((err) => console.error('Scanner start failed:', err));

        return () => {
            active = false;
            try { scanner.stop(); } catch { /* noop */ }
            try { scanner.clear(); } catch { /* noop */ }
            scannerRef.current = null;
        };
    }, [fps, qrbox, scanCooldownMs]);

    return (
        <div className='relative w-full h-full'>
            {loading && (
                <div className='absolute inset-0 flex items-center justify-center rounded-xl bg-dominant'>
                    <div className='h-8 w-8 animate-spin rounded-full border-4 border-border border-t-accent' />
                </div>
            )}
            <div ref={divRef} id='barcode-reader' className='w-full overflow-hidden rounded-xl' />
        </div>
    );
};

export default ScannerComponent;
