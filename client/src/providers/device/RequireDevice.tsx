import { Navigate, Outlet } from 'react-router';
import { useDevice } from '../../hooks/useDevice';

export function RequireDevice() {
	const { isActivated, isLoading } = useDevice();

	if (isLoading) return null; // or a spinner

	if (!isActivated) {
		return (
			<Navigate
				to='/activate-device'
				replace
			/>
		);
	}

	return <Outlet />;
}
