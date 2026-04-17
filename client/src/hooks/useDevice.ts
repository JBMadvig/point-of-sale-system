import { useContext } from 'react';
import { Ctx } from '../providers/device/DeviceContext';

export function useDevice() {
	const v = useContext(Ctx);
	if (!v) throw new Error('useDevice must be used inside <DeviceProvider>');
	return v;
}
