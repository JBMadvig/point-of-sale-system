import { createBrowserRouter, Navigate } from 'react-router';
import Landing from './pages/unit/Landing';
import { RequireAuth } from './providers/auth/RequireAuth';
import { RequireDevice } from './providers/device/RequireDevice';
import PointOfSale from './pages/device/pos/page';
import ActivateDevice from './pages/device/ActivateDevice';
import POSLogin from './pages/device/POSLogin';
import Login from './pages/unit/Login';


export const router = createBrowserRouter([
	{
		// Leads to the unit landing page, where user can log in and get the QR code to login on the POS device and scan items from.
		path: '/',
		element: (
			<Navigate
				to='/unit/login'
				replace
			/>
		),
	},
	// Unit paths. Includes the landing to login in, and a 
	{
		path: '/unit',
		children: [
			{ path: 'login', element: <Login /> },
			{
				element: <RequireAuth />,
				children: [{ path: 'landing', element: <Landing /> }],
			},
		],
	},
	{
		path: '/device',
		element: (
			<Navigate
				to='/device/activate-device'
				replace
			/>
		),
		children: [
			// Public routes — accessible without an activated device
			{ path: 'activate-device', element: <ActivateDevice /> },
			// Device-gated routes — require an activated device cookie
			{
				element: <RequireDevice />,
				children: [
					{ path: 'pos-login', element: <POSLogin /> },
					// User-gated routes nested inside the device gate
					{
						element: <RequireAuth />,
						children: [{ path: 'pos', element: <PointOfSale /> }],
					},
					// Admin / sudo-admin routes
					{
						element: <RequireAuth allowedRoles={['admin', 'sudo-admin']} />,
						children: [{ path: 'inventory', element: <div>Inventory</div> }],
					},
				],
			},
		],
	},
]);
