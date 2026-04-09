import { convertFromDKK } from '@services/currency.service';
import { Type } from '@sinclair/typebox';
import { FastifyPluginCallback, FastifySchema } from 'fastify';

import { requireRole } from '@lib/auth-hooks';
import { FastifyReplyTypebox, FastifyRequestTypebox } from '@lib/fastify-types';
import { UnauthorizedError } from '@lib/http-errors';
import { UserModel } from '@lib/mongodb/models/user.model';
import { userPublicSchema } from '@lib/schemas/user.schema';

export default <FastifyPluginCallback>function (app, opts, done) {
    const schema = {
        params: Type.Object({
            id: Type.String(),
        }),
        response: {
            200: userPublicSchema,
        },
    } satisfies FastifySchema;

    app.route({
        url: '/:id',
        method: 'GET',
        schema,
        preHandler: [ requireRole([ 'admin', 'sudo-admin' ]) ],
        handler: async (
            req: FastifyRequestTypebox<typeof schema>,
            reply: FastifyReplyTypebox<typeof schema>,
        ) => {
            // Fetch user data except password - If changed, we send the pasted old ++ two news to compare if they are right.
            const user = await UserModel.findById(req.params.id).select('_id name email role balance currency avatarUrl');
            if (!user) {
                throw new UnauthorizedError('User not found');
            }

            const userObj = user.toObject();

            await reply.send({
                ...userObj,
                balance: convertFromDKK(userObj.balance, userObj.currency),
            });
        },
    });

    done();
};
