import { FastifyPluginCallback, FastifySchema } from 'fastify';

import { deviceTokenHook } from '@lib/device-auth-hook';
import { FastifyReplyTypebox, FastifyRequestTypebox } from '@lib/fastify-types';
import { verifyAccessToken } from '@lib/jwt-helper';
import { UserModel } from '@lib/mongodb/models/user.model';
import { posStatusResponseSchema } from '@lib/schemas/qr-auth.schema';

export default <FastifyPluginCallback>function (app, _opts, done) {
    const schema = {
        response: {
            200: posStatusResponseSchema,
        },
    } satisfies FastifySchema;

    app.route({
        url: '/pos-status',
        method: 'GET',
        schema,
        preHandler: [ deviceTokenHook ],
        handler: async (
            req: FastifyRequestTypebox<typeof schema>,
            reply: FastifyReplyTypebox<typeof schema>,
        ) => {
            try {
                const payload = verifyAccessToken(req);
                const user = await UserModel.findById(payload.userId).select('tokenVersion');

                if (!user || user.tokenVersion !== payload.tokenVersion) {
                    return reply.send({ loggedIn: false });
                }

                return reply.send({ loggedIn: true, userId: payload.userId });
            } catch {
                return reply.send({ loggedIn: false });
            }
        },
    });

    done();
};
