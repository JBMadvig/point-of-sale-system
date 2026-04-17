import { PanelContent, PanelItem } from '../../../shared/components/SlidingPanel';

export default function LoginInfoPanel() {
	return (
		<PanelContent>
			<PanelItem>
				<h2 className='text-2xl font-bold text-text'>User login</h2>
			</PanelItem>
			<PanelItem>
				<p className='mt-4 text-text-muted'>
					Use the login form to confirm your identity and use this device to log in on an activated device. On this
				</p>
			</PanelItem>
			<PanelItem>
				<h3 className='mt-8 text-lg font-semibold text-text'>
					Features
				</h3>
			</PanelItem>
			<PanelItem>
				<ul className='mt-3 space-y-2 text-text-muted'>
					<li>QR code to login from activated devices</li>
					<li>Barcode scanning for adding items to basket or searching/adding new items</li>
				</ul>
			</PanelItem>
		</PanelContent>
	);
}
