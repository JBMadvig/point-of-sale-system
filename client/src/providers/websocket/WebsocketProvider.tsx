import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { WebSocketContextType, WSListener, WSMessage } from '../../shared/types/websocket';
import { Ctx } from './WebsocketContext';

export function WebSocketProvider({ children }: { children: ReactNode }) {
	const qc = useQueryClient();
	const ws = useRef<WebSocket | null>(null);
	const listeners = useRef<Map<string, Set<WSListener>>>(new Map());
	const [connected, setConnected] = useState(false);

	useEffect(() => {
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		const host = import.meta.env.VITE_WS_HOST ?? window.location.host;
		const socket = new WebSocket(`${protocol}//${host}/ws`);
		ws.current = socket;

		socket.onopen = () => setConnected(true);
		socket.onclose = () => setConnected(false);

		socket.onmessage = (e) => {
			const msg: WSMessage = JSON.parse(e.data);

			if (msg.event === 'item-scanned' || msg.event === 'new-item-scanned') {
				qc.setQueryData(['last-scanned-item'], msg);
			}
			if (msg.event === 'pos-login' || msg.event === 'pos-logout') {
				qc.invalidateQueries({ queryKey: ['pos-session'] });
			}

			listeners.current.get(msg.event)?.forEach((fn) => fn(msg));
		};

		const ping = setInterval(() => {
			if (socket.readyState === WebSocket.OPEN) {
				socket.send(JSON.stringify({ event: 'ping' }));
			}
		}, 30_000);

		return () => {
			clearInterval(ping);
			socket.onopen = null;
			socket.onclose = null;
			socket.onmessage = null;
			if (socket.readyState === WebSocket.CONNECTING) {
				socket.addEventListener('open', () => socket.close());
			} else {
				socket.close();
			}
		};
	}, [qc]);

	const rawSend = (payload: object) => {
		if (ws.current?.readyState === WebSocket.OPEN) {
			ws.current.send(JSON.stringify(payload));
		}
	};

	const value: WebSocketContextType = {
		connected,
		subscribe: (roomId) => rawSend({ event: 'subscribe', room: roomId }),
		unsubscribe: (roomId) => rawSend({ event: 'unsubscribe', room: roomId }),
		on: (event, listener) => {
			if (!listeners.current.has(event)) listeners.current.set(event, new Set());
			listeners.current.get(event)!.add(listener as WSListener);
			return () => listeners.current.get(event)?.delete(listener as WSListener);
		},
	};

	return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}; 