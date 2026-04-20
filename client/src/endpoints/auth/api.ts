import { api } from '../../lib/api';
import type { DeviceActiveResponse, User } from '../../shared/types/auth';

export const authApi = {
	login: (email: string, password: string) =>
		api<{ user: User }>('/api/auth/login', {
			method: 'POST',
			json: { email, password },
			skipAuthRetry: true,
		}),
	me: () => api<User>('/api/auth/me'),
	refresh: () =>
		api<{ user: User }>('/api/auth/refresh', {
			method: 'POST',
			skipAuthRetry: true,
		}),
	logout: () => api<void>('/api/auth/logout', { method: 'POST' }),
	deviceStatus: () =>
		api<DeviceActiveResponse>('/api/auth/device-status', {
			skipAuthRetry: true,
		}),
	activate: (email: string, password: string, deviceName?: string) =>
		api<{ deviceName: string }>('/api/auth/device-activate', {
			method: 'POST',
			json: { email, password, deviceName },
			skipAuthRetry: true,
		}),
	deactivate: () =>
		api<{ success: boolean }>('/api/auth/device-deactivate', {
			method: 'POST',
			skipAuthRetry: true,
		}),
	deviceRename: (deviceName: string) =>
		api<{ deviceName: string }>('/api/auth/device-rename', {
			method: 'PATCH',
			json: { deviceName },
		}),
};
