import { api } from '../../lib/api';
import type { DeviceActiveResponse, User } from '../../shared/types/auth';

export const authApi = {

	/**** USER UNIT API'S  ****/
	/* Login for the user facing unit */
	login: (email: string, password: string) =>
		api<{ user: User }>('/api/auth/login', {
			method: 'POST',
			json: { email, password },
			skipAuthRetry: true,
		}),

	/* Logout for the user facing unit */
	logout: () => api<void>('/api/auth/logout', { method: 'POST' }),

	/* Fetching data for the user currently logged in on the user faced unit */
	me: () => api<User>('/api/auth/me'),
	
	/* Refresh acesstoken */
	refresh: () =>
		api<{ user: User }>('/api/auth/refresh', {
			method: 'POST',
			skipAuthRetry: true,
		}),
		
	/* Request QR token for login */
	requestQRtoken: () =>
		api<{ qrToken: string; expiresAt: string }>('/api/auth/qr-token', {
			method: 'POST',
		}),

	/* Check is current user is signed in to the POS system */
	getPosStatus: () =>
		api<{ loggedIn: boolean; userId?: string; deviceName?: string }>('/api/auth/pos-status', {
			skipAuthRetry: true,
		}),

	/**** DEVICE API'S  ****/

	/* Check if current device is activated */
	deviceStatus: () =>
		api<DeviceActiveResponse>('/api/auth/device-status', {
			skipAuthRetry: true,
		}),
	
		/* Activate device */
	activate: (email: string, password: string, deviceName: string) =>
		api<{ deviceName: string }>('/api/auth/device-activate', {
			method: 'POST',
			json: { email, password, deviceName },
			skipAuthRetry: true,
		}),

	/* Deactivate device */
	deactivate: () =>
		api<{ success: boolean }>('/api/auth/device-deactivate', {
			method: 'POST',
			skipAuthRetry: true,
		}),
	
	/* Rename device */
	deviceRename: (deviceName: string) =>
		api<{ deviceName: string }>('/api/auth/device-rename', {
			method: 'PATCH',
			json: { deviceName },
		}),
};
