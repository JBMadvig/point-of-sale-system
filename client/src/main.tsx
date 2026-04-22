import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { AuthProvider } from './providers/auth/AuthProvider.tsx';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { router } from './router.tsx';
import { queryClient } from './lib/queryClient.ts';
import { DeviceProvider } from './providers/device/DeviceProvider.tsx';
import { ThemeProvider } from './providers/theme/ThemeProvider.tsx';
import { WebSocketProvider } from './providers/websocket/WebsocketProvider.tsx';
import { ToastProvider } from './shared/components/Toast.tsx';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<ThemeProvider>
			<QueryClientProvider client={queryClient}>
				<DeviceProvider>
					<AuthProvider>
						<WebSocketProvider>
							<ToastProvider limit={5} timeout={5000}>
								<RouterProvider router={router} />
							</ToastProvider>
						</WebSocketProvider>
					</AuthProvider>
				</DeviceProvider>
			</QueryClientProvider>
		</ThemeProvider>
	</StrictMode>,
);
