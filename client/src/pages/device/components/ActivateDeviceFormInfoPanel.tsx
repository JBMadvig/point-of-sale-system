import { PanelContent, PanelItem } from '../../../shared/components/SlidingPanel';

export default function ActivateDeviceFormInfoPanel() {
    return (
        <PanelContent>
            <PanelItem>
                <h2 className='text-2xl font-bold text-text'>Activate Device</h2>
            </PanelItem>
            <PanelItem>
                <p className='mt-4 text-text-muted'>Only sudo admins can activate devices.</p>
                <p className='mt-4 text-text-muted'>
                    Once a device is activated, user can access then point of sale system by
                    scanning their QR code they have generated on their phone.
                </p>
                <p className='mt-4 text-text-muted'>
                    When a QR code is successfully scanned, user will be logged in on the device and
                    can start using POS features such as:
                </p>
            </PanelItem>
            <PanelItem>
                <ul className='mt-3 space-y-2 text-text-muted'>
                    <li>Shop items in the POS. Basket system with searchbar, filterring etc.</li>
                    <li>
                        Add new items to inventory and add value to their balance by contributing to
                        the stock of the bar.
                    </li>
                </ul>
            </PanelItem>
        </PanelContent>
    );
}
