import { createBrowserRouter, Navigate } from 'react-router';
import Landing from './pages/unit/Landing';
import { RequireAuth } from './providers/auth/RequireAuth';
import { RequireDevice } from './providers/device/RequireDevice';
import PointOfSale from './pages/device/pos/page';
import ActivateDevice from './pages/device/ActivateDevice';
import POSLogin from './pages/device/Login';
import UnitLogin from './pages/unit/Login';
import { unitRoutes, deviceRoutes } from './shared/types/routes';
import { cleanPath } from './lib/utils/clean-path';

/**
 * ! All paths are stored in routes.ts, found in /types/routes.ts
 * If adding more routes do it there so there only exists one source of truth for paths in the app
 * The paths in the router config below should be converted from absolute to relative using the cleanPath() method, found in /lib/utils/clean-path.ts, which removes everything before the last slash in the path, so that they work correctly with nested routes and route guards.
 * If you need to add a new route, add it to routes.ts and then add it to the router config below, using cleanPath to convert it to a relative path.
 * */

export const router = createBrowserRouter([
    {
        // Leads to the unit login page, where user can log in and get the QR code to login on the POS device and scan items from.
        path: unitRoutes.root,
        element: <Navigate to={unitRoutes.login} replace />,
    },

    // Unit paths. Includes the landing to login in, and a
    {
        path: unitRoutes.root,
        children: [
            { path: cleanPath(unitRoutes.root), element: <UnitLogin /> },
            {
                element: <RequireAuth />,
                children: [{ path: cleanPath(unitRoutes.landing), element: <Landing /> }],
            },
        ],
    },
    {
        path: deviceRoutes.root,
        element: <Navigate to={deviceRoutes.activate} replace />,
        children: [
            // Public routes — accessible without an activated device
            { path: cleanPath(deviceRoutes.activate), element: <ActivateDevice /> },
            // Device-gated routes — require an activated device cookie
            {
                element: <RequireDevice />,
                children: [
                    { path: deviceRoutes.login, element: <POSLogin /> },
                    // User-gated routes nested inside the device gate
                    {
                        element: <RequireAuth />,
                        children: [{ path: deviceRoutes.pos, element: <PointOfSale /> }],
                    },
                    // Admin / sudo-admin routes
                    {
                        element: <RequireAuth allowedRoles={['admin', 'sudo-admin']} />,
                        children: [{ path: deviceRoutes.inventory, element: <div>Inventory</div> }],
                    },
                ],
            },
        ],
    },
]);
