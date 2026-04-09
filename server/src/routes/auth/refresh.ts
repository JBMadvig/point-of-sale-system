import { FastifyPluginCallback, FastifySchema } from 'fastify';

import { FastifyReplyTypebox, FastifyRequestTypebox } from '@lib/fastify-types';
import { UnauthorizedError } from '@lib/http-errors';
import { generateTokens, verifyRefreshToken } from '@lib/jwt-helper';
import { UserModel } from '@lib/mongodb/models/user.model';
import { authResponseSchema } from '@lib/schemas/user.schema';

export default <FastifyPluginCallback>function (app, _opts, done) {
    const schema = {
        response: {
            200: authResponseSchema,
        },
    } satisfies FastifySchema;

    app.route({
        url: '/refresh',
        method: 'POST',
        schema,
        handler: async (
            req: FastifyRequestTypebox<typeof schema>,
            reply: FastifyReplyTypebox<typeof schema>,
        ) => {
            // Verify refresh token
            const payload = await verifyRefreshToken(req);

            // Find user
            const user = await UserModel.findById(payload.userId);
            if (!user) {
                throw new UnauthorizedError('User not found');
            }

            // Validate tokenVersion to ensure session hasn't been invalidated
            if (user.tokenVersion !== payload.tokenVersion) {
                throw new UnauthorizedError('Session invalidated. Please log in again.');
            }

            // Generate new tokens (sets HttpOnly cookies automatically)
            await generateTokens(reply, user);

            await reply.send({
                user: user.toObject(),
            });
        },
    });

    done();
};
