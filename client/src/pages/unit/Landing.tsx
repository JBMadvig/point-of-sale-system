import { Button } from '@base-ui/react/button';
import { useAuth } from '../../hooks/useAuth';
import { useEffect, useRef, useState } from 'react';
import { authApi } from '../../endpoints/auth/api';
import QRCode from 'qrcode';
import { Navigate } from 'react-router';
import { SlidingPanelRoot } from '../../shared/components/SlidingPanel';
import { useSlidingPanel } from '../../shared/components/SlidingPanelContext';
import LandingSettings from './components/LandingSettings';
import LandingScanner from './components/LandingScanner';
import { unitRoutes } from '../../shared/types/routes';

function LandingMain() {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [userIsLoggedIn, setUserIsLoggedIn] = useState(false);
    const [loggedInDeviceName, setLoggedInDeviceName] = useState<string | undefined>();

    const qrToken = useRef<string>('');
    const refreshInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    const { openPanel } = useSlidingPanel();
    const { user } = useAuth();

    useEffect(() => {
        const generateQRcode = async () => {
            try {
                const newQrToken = await authApi.requestQRtoken();
                qrToken.current = newQrToken.qrToken;
                try {
                    const qrCodeDataUrl = await QRCode.toDataURL(newQrToken.qrToken, {
                        width: 250,
                        margin: 2,
                    });
                    setQrCodeUrl(qrCodeDataUrl);
                } catch (error) {
                    console.log('Failed to generate QR code from Token:', error);
                }
            } catch (error) {
                console.log('Failed to generate QR code:', error);
            }
        };

        generateQRcode();
        refreshInterval.current = setInterval(generateQRcode, 9 * 60 * 1000);

        return () => {
            if (refreshInterval.current) clearInterval(refreshInterval.current);
        };
    }, []);

    useEffect(() => {
        async function checkLoginStatus() {
            try {
                const status = await authApi.getPosStatus();
                if (user?._id === status.userId && status.loggedIn) {
                    setUserIsLoggedIn(true);
                    setLoggedInDeviceName(status.deviceName);
                } else {
                    setUserIsLoggedIn(false);
                    setLoggedInDeviceName(undefined);
                }
            } catch (error) {
                console.log('Failed to check POS login status:', error);
            }
        }
        checkLoginStatus();
    }, [user]);

    return (
        <div className='h-dvh w-full relative flex flex-col items-center justify-center gap-4'>
            <h1 className='text-4xl'>Scan to login</h1>
            <p>Scan the QR code to login on an activated device.</p>
            {userIsLoggedIn && (
                <p className='text-green-500'>
                    You are logged in{loggedInDeviceName ? ` on ${loggedInDeviceName}` : ' on a device'}!
                </p>
            )}
            {qrCodeUrl ? (
                <img
                    className='rounded-xl'
                    src={qrCodeUrl}
                    alt='Login QR Code'
                    width='250'
                    height='250'
                />
            ) : (
                <div className='w-62.5 h-62.5 bg-gray-500 animate-puls rounded-lg '></div>
            )}
            <Button
                className='flex cursor-pointer items-center justify-center h-10 px-3.5 m-0 outline-0 border border-border rounded-md bg-accent font-inherit text-base font-normal leading-6 text-text select-none hover:data-disabled:bg-dominant hover:bg-support active:data-disabled:bg-dominant active:bg-support focus-visible:outline-2 focus-visible:outline-accent focus-visible:-outline-offset-1 data-disabled:text-text-muted transition-all'
                onClick={() => openPanel(<LandingScanner />)}
            >
                Open barcode scanner
            </Button>

            {/* Settings button in upper right corner */}
            <Button
                className='absolute p-4 top-4 right-4 cursor-pointer hover:animate-spin'
                onClick={() => openPanel(<LandingSettings />)}
            >
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                >
                    {/* <!--Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free--> */}
                    <path d='M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4m0 6c-1.08 0-2-.92-2-2s.92-2 2-2 2 .92 2 2-.92 2-2 2'></path>
                    <path d='m20.42 13.4-.51-.29c.05-.37.08-.74.08-1.11s-.03-.74-.08-1.11l.51-.29c.96-.55 1.28-1.78.73-2.73l-1-1.73a2.006 2.006 0 0 0-2.73-.73l-.53.31c-.58-.46-1.22-.83-1.9-1.11v-.6c0-1.1-.9-2-2-2h-2c-1.1 0-2 .9-2 2v.6c-.67.28-1.31.66-1.9 1.11l-.53-.31c-.96-.55-2.18-.22-2.73.73l-1 1.73c-.55.96-.22 2.18.73 2.73l.51.29c-.05.37-.08.74-.08 1.11s.03.74.08 1.11l-.51.29c-.96.55-1.28 1.78-.73 2.73l1 1.73c.55.95 1.77 1.28 2.73.73l.53-.31c.58.46 1.22.83 1.9 1.11v.6c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-.6a8.7 8.7 0 0 0 1.9-1.11l.53.31c.95.55 2.18.22 2.73-.73l1-1.73c.55-.96.22-2.18-.73-2.73m-2.59-2.78c.11.45.17.92.17 1.38s-.06.92-.17 1.38a1 1 0 0 0 .47 1.11l1.12.65-1 1.73-1.14-.66c-.38-.22-.87-.16-1.19.14-.68.65-1.51 1.13-2.38 1.4-.42.13-.71.52-.71.96v1.3h-2v-1.3c0-.44-.29-.83-.71-.96-.88-.27-1.7-.75-2.38-1.4a1.01 1.01 0 0 0-1.19-.15l-1.14.66-1-1.73 1.12-.65c.39-.22.58-.68.47-1.11-.11-.45-.17-.92-.17-1.38s.06-.93.17-1.38A1 1 0 0 0 5.7 9.5l-1.12-.65 1-1.73 1.14.66c.38.22.87.16 1.19-.14.68-.65 1.51-1.13 2.38-1.4.42-.13.71-.52.71-.96v-1.3h2v1.3c0 .44.29.83.71.96.88.27 1.7.75 2.38 1.4.32.31.81.36 1.19.14l1.14-.66 1 1.73-1.12.65c-.39.22-.58.68-.47 1.11Z'></path>
                </svg>
            </Button>
        </div>
    );
}

export default function Landing() {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to={unitRoutes.login} replace />;
    }

    return (
        <SlidingPanelRoot>
            <LandingMain />
        </SlidingPanelRoot>
    );
}
