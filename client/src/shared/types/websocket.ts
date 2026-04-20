export type WSMessage =
	| { event: 'initRequest' }
	| { event: 'pos-login'; userId: string }
	| { event: 'pos-logout'; userId: string }
	| { event: 'item-scanned'; id: string; name: string; categories: string[]; price: number; stock: number; abv?: number; volume?: number }
	| { event: 'new-item-scanned'; barcode: string };

export type WSListener<T extends WSMessage = WSMessage> = (data: T) => void;

export interface WebSocketContextType {
	connected: boolean;
	subscribe: (roomId: string) => void;
	unsubscribe: (roomId: string) => void;
	on: <T extends WSMessage>(event: T['event'], listener: WSListener<T>) => () => void;
}
