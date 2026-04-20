import { useContext } from 'react';
import { Ctx } from '../providers/websocket/WebsocketContext';

export function useWebSocket() {
	const v = useContext(Ctx);
	if (!v) throw new Error('useWebSocket must be used inside <WebSocketProvider>');
	return v;
}
