import { FastifyPluginCallback, FastifySchema } from 'fastify';

import { clearAuthCookies } from '@lib/cookie-helper';
import { deviceTokenHook } from '@lib/device-auth-hook';
import { FastifyReplyTypebox, FastifyRequestTypebox } from '@lib/fastify-types';
import { posLogoutRequestSchema, posLogoutResponseSchema } from '@lib/schemas/qr-auth.schema';
import { sendToSubscribers } from '@services/websocket.service';

export default <FastifyPluginCallback>function (app, _opts, done) {
    const schema = {
        body: posLogoutRequestSchema,
        response: {
            200: posLogoutResponseSchema,
        },
    } satisfies FastifySchema;

    app.route({
        url: '/pos-logout',
        method: 'POST',
        schema,
        preHandler: [deviceTokenHook],
        handler: async (
            req: FastifyRequestTypebox<typeof schema>,
            reply: FastifyReplyTypebox<typeof schema>,
        ) => {
            // Notify phone via WebSocket
            sendToSubscribers(`user:${req.body.userId}`, {
                type: 'pos-logout',
                userId: req.body.userId,
            });

            // Clear user session cookies but keep device cookie
            clearAuthCookies(reply);

            await reply.send({ success: true });
        },
    });

    done();
};
