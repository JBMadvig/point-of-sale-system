import { FastifyPluginCallback, FastifySchema } from 'fastify';

import { requireRole } from '@lib/auth-hooks';
import { clearAuthCookies, clearDeviceCookie } from '@lib/cookie-helper';
import { deviceTokenHook } from '@lib/device-auth-hook';
import { FastifyReplyTypebox, FastifyRequestTypebox } from '@lib/fastify-types';
import { DeviceTokenModel } from '@lib/mongodb/models/device-token.model';
import { UserRoles } from '@lib/mongodb/models/user.model';
import { deviceDeactivateResponseSchema } from '@lib/schemas/qr-auth.schema';

export default <FastifyPluginCallback>function (app, _opts, done) {
    const schema = {
        response: {
            200: deviceDeactivateResponseSchema,
        },
    } satisfies FastifySchema;

    app.route({
        url: '/device-deactivate',
        method: 'POST',
        schema,
        // Must present a valid device cookie AND be logged in as sudo-admin
        preHandler: [deviceTokenHook, requireRole([UserRoles.SUDO_ADMIN])],
        handler: async (
            req: FastifyRequestTypebox<typeof schema>,
            reply: FastifyReplyTypebox<typeof schema>,
        ) => {
            // deviceTokenHook guarantees req.device exists
            await DeviceTokenModel.deleteOne({ _id: req.device!._id });

            // Wipe the device cookie and the current user's auth cookies
            clearDeviceCookie(reply);
            clearAuthCookies(reply);

            await reply.send({ success: true });
        },
    });

    done();
};
