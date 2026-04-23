import type { Html5QrcodeResult } from 'html5-qrcode';
import ScannerComponent from '../../../shared/components/ScannerComponent';
import { PanelContent, PanelItem } from '../../../shared/components/SlidingPanel';
import { useToast } from '../../../hooks/useToast';

export default function LandingScanner() {
    const toast = useToast();

    // Todo: setup websocket to handle when a barcode is scanned and handle it depending on where the user is on the pos system. For example, if the user is on the inventory page, it should search for the item, if the user is on the main dashboard, it should add the item to the basket. If user is creating a new item, it should fill the barcode field with the scanned barcode.
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
        <PanelContent className='flex flex-col gap-4 h-full'>
            <PanelItem className='flex flex-col gap-2'>
                <h2 className='text-2xl font-bold text-text'>Settings</h2>
            </PanelItem>
            <PanelItem className='flex flex-col gap-2'>
                <p>Use the scanner to scan barcode on items.</p>
                <ul>
                    <li>If you are in the inventory, use scanner to search for items</li>
                    <li>
                        Scan an item to add it to your basket, if you are on the POS main dashboard
                    </li>
                </ul>
            </PanelItem>
            <PanelItem className='flex flex-col gap-2 flex-1 min-h-0'>
                <ScannerComponent qrCodeSuccessCallback={onScannedBarcode} scanCooldownMs={1500} />
            </PanelItem>
        </PanelContent>
    );
}
