import { Type } from '@sinclair/typebox';
import { FastifyPluginCallback, FastifySchema } from 'fastify';

import { FastifyReplyTypebox, FastifyRequestTypebox } from '@lib/fastify-types';
import { UserModel } from '@lib/mongodb/models/user.model';
import { userMinimalSchema } from '@lib/schemas/user.schema';

export default <FastifyPluginCallback>function (app, opts, done) {
    const schema = {
        response: {
            200: Type.Array(userMinimalSchema),
        },
    } satisfies FastifySchema;

    app.route({
        url: '/',
        method: 'GET',
        schema,
        handler: async (
            req: FastifyRequestTypebox<typeof schema>,
            reply: FastifyReplyTypebox<typeof schema>,
        ) => {
            // Fetch only minimal user data for login screen (no auth required)
            const users = await UserModel.find({}).select('_id name email avatarUrl');

            await reply.send(users.map(user => user.toObject()));
        },
    });

    done();
};
