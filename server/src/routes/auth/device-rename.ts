import { FastifyPluginCallback, FastifySchema } from 'fastify';

import { requireRole } from '@lib/auth-hooks';
import { deviceTokenHook } from '@lib/device-auth-hook';
import { FastifyReplyTypebox, FastifyRequestTypebox } from '@lib/fastify-types';
import { UserRoles } from '@lib/mongodb/models/user.model';
import {
    deviceRenameRequestSchema,
    deviceRenameResponseSchema,
} from '@lib/schemas/qr-auth.schema';

export default <FastifyPluginCallback>function (app, _opts, done) {
    const schema = {
        body: deviceRenameRequestSchema,
        response: {
            200: deviceRenameResponseSchema,
        },
    } satisfies FastifySchema;

    app.route({
        url: '/device-rename',
        method: 'PATCH',
        schema,
        // Must present a valid device cookie AND be logged in as sudo-admin
        preHandler: [deviceTokenHook, requireRole([UserRoles.SUDO_ADMIN])],
        handler: async (
            req: FastifyRequestTypebox<typeof schema>,
            reply: FastifyReplyTypebox<typeof schema>,
        ) => {
            // deviceTokenHook guarantees req.device exists
            const device = req.device!;

            device.deviceName = req.body.deviceName.trim();
            await device.save();

            await reply.send({ deviceName: device.deviceName });
        },
    });

    done();
};
