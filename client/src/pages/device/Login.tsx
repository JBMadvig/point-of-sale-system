import type { Html5QrcodeResult } from 'html5-qrcode';
import { useToast } from '../../hooks/useToast';
import ScannerComponent from '../../shared/components/ScannerComponent';

export default function Login() {
    const toast = useToast();

    // TODO: Log user in when they scan the QR code on the POS login page. The QR code will contain a JWT token that can be used to log the user in.
    const onScannedBarcode = (decodedText: string, decodedResult: Html5QrcodeResult) => {
        toast.add({
            title: 'Scanned barcode',
            description: `Decoded text: ${decodedText}`,
            type: 'success',
            timeout: 5000,
        });
        console.log(
            'Scanned barcode: {decodedText:',
            decodedText,
            'decodedResult:',
            decodedResult,
            '}',
        );
    };
    return (
        <div>
            <h2 className='text-2xl font-bold text-text'>POS Login</h2>
            <p className='mt-4 text-text-muted'>
                Scan your QR code to log in to the POS system. You can generate a QR code on your
                youn phone by going to <code>/unit/login</code> and logging in.
            </p>
            <ScannerComponent qrCodeSuccessCallback={onScannedBarcode} scanCooldownMs={1500} />
        </div>
    );
}
