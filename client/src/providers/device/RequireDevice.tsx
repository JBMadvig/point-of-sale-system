import { Navigate, Outlet } from 'react-router';
import { useDevice } from '../../hooks/useDevice';
import { deviceRoutes } from '../../shared/types/routes';

export function RequireDevice() {
    const { isActivated, isLoading } = useDevice();

    if (isLoading) return null; // or a spinner

    if (!isActivated) {
        return <Navigate to={deviceRoutes.activate} replace />;
    }

    return <Outlet />;
}
