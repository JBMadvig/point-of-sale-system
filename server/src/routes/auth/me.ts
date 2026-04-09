import { FastifyPluginCallback, FastifySchema } from 'fastify';

import { authenticateHook } from '@lib/auth-hooks';
import { FastifyReplyTypebox, FastifyRequestTypebox } from '@lib/fastify-types';
import { NotFoundError } from '@lib/http-errors';
import { UserModel } from '@lib/mongodb/models/user.model';
import { userPublicSchema } from '@lib/schemas/user.schema';

export default <FastifyPluginCallback>function (app, opts, done) {
    const schema = {
        response: {
            200: userPublicSchema,
        },
    } satisfies FastifySchema;

    app.route({
        url: '/me',
        method: 'GET',
        schema,
        preHandler: [ authenticateHook ], // Protected route
        handler: async (
            req: FastifyRequestTypebox<typeof schema>,
            reply: FastifyReplyTypebox<typeof schema>,
        ) => {
            // User payload is available from authenticateHook
            const userId = req.user?.userId;

            if (!userId) {
                throw new NotFoundError('User not found');
            }

            // Find user
            const user = await UserModel.findById(userId);
            if (!user) {
                throw new NotFoundError('User not found');
            }

            await reply.send(user.toObject());
        },
    });

    done();
};
