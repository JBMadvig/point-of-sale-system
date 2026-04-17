import { FastifyPluginCallback, FastifySchema } from 'fastify';

import { deviceTokenHook } from '@lib/device-auth-hook';
import { FastifyReplyTypebox, FastifyRequestTypebox } from '@lib/fastify-types';
import { deviceStatusResponseSchema } from '@lib/schemas/qr-auth.schema';

export default <FastifyPluginCallback>function (app, _opts, done) {
    const schema = {
        response: {
            200: deviceStatusResponseSchema,
        },
    } satisfies FastifySchema;

    app.route({
        url: '/device-status',
        method: 'GET',
        schema,
        preHandler: [ deviceTokenHook ], // Protected route
        handler: async (
            req: FastifyRequestTypebox<typeof schema>,
            reply: FastifyReplyTypebox<typeof schema>,
        ) => {
            // deviceTokenHook guarantees req.device exists and is active
            const device = req.device!;

            await reply.send({
                activated: device.active,
                deviceName: device.deviceName || undefined,
            });
        },
    });

    done();
};
