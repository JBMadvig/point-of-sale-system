import { FastifyInstance } from 'fastify';

export const activeConnections: {
    webSocket: WebSocket,
    roomsSubscribed: string[],
}[] = [];

type Payload = {
    type: 'ping',
} | {
    type: 'initRequest',
} | {
    type: 'subscribe',
    room: string,
} | {
    type: 'unsubscribe',
    room: string,
} | {
    type: 'pos-login',
    userId: string,
} | {
    type: 'pos-logout',
    userId: string,
} | {
    type: 'item-scanned',
    item: {
        id: string;
        name: string;
        company: string;
        barcode: string | null;
        primaryCategory: string;
        secondaryCategory: string;
        averagePrice: number;
        currentStock: number;
        abv: number;
        volume: number;
    };
} | {
    type: 'new-item-scanned',
    barcode: string;
}

export const initWebsocket = async(fastify: FastifyInstance) => {
    await fastify.register(function (fastify) {
        fastify.get('/ws', { websocket: true }, (newSocket: WebSocket) => {
            newSocket.send(JSON.stringify({ type: 'initRequest' }));
            activeConnections.push({
                webSocket: newSocket,
                roomsSubscribed: [],
            });

            newSocket.addEventListener('message', (message: MessageEvent<string>) => {
                try {
                    const data = JSON.parse(message.data) as Payload;
                    handleIncomingMessage(newSocket, data);
                } catch (error) {
                    console.error('Invalid JSON received:', message.data, 'error:', error);
                }
            });

            newSocket.addEventListener('close', () => {
                const index = activeConnections.findIndex((s) => s.webSocket === newSocket);
                if (index > -1) {
                    activeConnections.splice(index, 1);
                }
            });
        });
    });
};

export const sendToAllSocket = (payload: Payload) => {
    for (const conn of activeConnections) {
        conn.webSocket.send(JSON.stringify(payload));
    }
};

export const sendToSubscribers = (roomId: string, payload: Payload) => {
    for (const conn of activeConnections) {
        if (conn.roomsSubscribed.includes(roomId)) {
            conn.webSocket.send(JSON.stringify(payload));
        }
    }
};

const handleIncomingMessage = (socket: WebSocket, payload: Payload) => {
    switch (payload.type) {
        case 'ping':
            console.log('Ping');
            break;

        case 'subscribe': {
            const conn = activeConnections.find((c) => c.webSocket === socket);
            if (conn && !conn.roomsSubscribed.includes(payload.room)) {
                conn.roomsSubscribed.push(payload.room);
            }
            break;
        }

        case 'unsubscribe': {
            const conn = activeConnections.find((c) => c.webSocket === socket);
            if (conn) {
                conn.roomsSubscribed = conn.roomsSubscribed.filter((r) => r !== payload.room);
            }
            break;
        }

        // These are only ever sent by the server
        case 'initRequest':
        case 'pos-login':
        case 'pos-logout':
        case 'item-scanned':
        case 'new-item-scanned':
            break;

        default:
            payload satisfies never;
    }
};
