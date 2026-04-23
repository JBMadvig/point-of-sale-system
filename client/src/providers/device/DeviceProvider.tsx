import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ReactNode } from 'react';

import { authApi } from '../../endpoints/auth/api';
import { ApiError } from '../../lib/api';
import type { DeviceActiveResponse, DeviceContextType } from '../../shared/types/auth';
import { Ctx } from './DeviceContext';

const DEVICE_STATUS_KEY = ['device-status'] as const;

export function DeviceProvider({ children }: { children: ReactNode }) {
	const qc = useQueryClient();

	const statusQuery = useQuery<DeviceActiveResponse | null>({
		queryKey: DEVICE_STATUS_KEY,
		queryFn: async () => {
			try {
				return await authApi.deviceStatus();
			} catch (err) {
				// A 401 means "no / invalid device cookie" — that's a valid
				// "not activated" answer, not a retryable failure.
				if (err instanceof ApiError && err.status === 401) return null;
				throw err;
			}
		},
		retry: (failCount, err) =>
			!(err instanceof ApiError && err.status === 401) && failCount < 2,
		staleTime: 5 * 60_000,
	});

    const activateMut = useMutation({
        mutationFn: ({
            email,
            password,
            deviceName,
        }: {
            email: string;
            password: string;
            deviceName: string;
        }) => authApi.activate(email, password, deviceName),
        onSuccess: ({ deviceName }) => {
            qc.setQueryData<DeviceActiveResponse>(DEVICE_STATUS_KEY, {
                activated: true,
                deviceName,
            });
        },
    });

	const deactivateMut = useMutation({
		mutationFn: () => authApi.deactivate(),
		onSuccess: () => {
			// Drop every cached query (device status, /me, everything).
			qc.clear();
			// Wipe local persistence per spec.
			localStorage.clear();
			// Clear any non-httpOnly cookies the app writes.
			// (httpOnly cookies — deviceToken / accessToken / refreshToken — are
			// already cleared by the server's Set-Cookie headers.)
			document.cookie.split(';').forEach((c) => {
				const name = c.split('=')[0].trim();
				if (name) document.cookie = `${name}=; Max-Age=0; path=/`;
			});
			// Hard reload: wipes React state, every provider re-initializes
			// clean, and the new /device-status query correctly sees "not activated".
			window.location.href = '/activate-device';
		},
	});

	const deviceRenameMut = useMutation({
		mutationFn: (deviceName: string) => authApi.deviceRename(deviceName),
		onSuccess: ({ deviceName }) => {
			qc.setQueryData<DeviceActiveResponse | null>(DEVICE_STATUS_KEY, (prev) =>
				prev ? { ...prev, deviceName } : prev,
			);
		},
	});

    const value: DeviceContextType = {
        deviceName: statusQuery.data?.deviceName ?? '',
        isActivated: !!statusQuery.data?.activated,
        isLoading: statusQuery.isLoading,
        activate: async (email, password, deviceName) => {
            await activateMut.mutateAsync({ email, password, deviceName });
        },
        deactivate: async () => {
            await deactivateMut.mutateAsync();
        },
        deviceRename: async (deviceName) => {
            await deviceRenameMut.mutateAsync(deviceName);
        },
    };

	return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
