import { Button } from '@base-ui/react/button';
import { useAuth } from '../../hooks/useAuth';
import { useEffect, useRef, useState } from 'react';
import { authApi } from '../../endpoints/auth/api';
import  QRCode from 'qrcode';



export default function Landing() {
	const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
	
	const { logout } = useAuth();
	
	const qrToken= useRef<string>('');
	const refreshInterval = useRef<ReturnType<typeof setInterval> | null>(null);
	
	useEffect(() => {
		const generateQRcode = async () => {
			try {
				const newQrToken = await authApi.requestQRtoken();
				qrToken.current = (newQrToken.qrToken);
				try {
					const qrCodeDataUrl = await QRCode.toDataURL(newQrToken.qrToken, { width: 250, margin: 2 });
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


	const onLogOut = () => {
		try {
			logout();
		} catch (error) {
			console.log(error);
		}
	};
	return (
		<>
			<p>Landing is working!</p>
			<img
				className="rounded-xl"
				src={qrCodeUrl}
				alt="Login QR Code"
				width="250"
				height="250"
          />
			<Button
				onClick={onLogOut}
				className='flex cursor-pointer items-center justify-center h-10 px-3.5 m-0 outline-0 border border-border rounded-md bg-accent font-inherit text-base font-normal leading-6 text-text select-none hover:data-disabled:bg-dominant hover:bg-support active:data-disabled:bg-dominant active:bg-support focus-visible:outline-2 focus-visible:outline-accent focus-visible:-outline-offset-1 data-disabled:text-text-muted transition-all'>
				Logout
			</Button>
		</>
	);
}
