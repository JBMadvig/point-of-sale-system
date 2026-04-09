import { FastifyPluginCallback, FastifySchema } from 'fastify';

import { FastifyReplyTypebox, FastifyRequestTypebox } from '@lib/fastify-types';
import { UnauthorizedError } from '@lib/http-errors';
import { generateTokens } from '@lib/jwt-helper';
import { UserModel } from '@lib/mongodb/models/user.model';
import { authResponseSchema, loginRequestSchema } from '@lib/schemas/user.schema';

export default <FastifyPluginCallback>function (app, _opts, done) {
    const schema = {
        body: loginRequestSchema,
        response: {
            200: authResponseSchema,
        },
    } satisfies FastifySchema;

    app.route({
        url: '/login',
        method: 'POST',
        schema,
        handler: async (
            req: FastifyRequestTypebox<typeof schema>,
            reply: FastifyReplyTypebox<typeof schema>,
        ) => {
            const { email, password } = req.body;

            // Find user with password field explicitly selected
            const user = await UserModel.findOne({ email }).select('+password');

            if (!user) {
                throw new UnauthorizedError('Invalid email or password');
            }

            // Compare password
            const isValidPassword = await user.comparePassword(password);
            if (!isValidPassword) {
                throw new UnauthorizedError('Invalid email or password');
            }

            // Generate tokens (sets HttpOnly cookies automatically)
            await generateTokens(reply, user);

            // Return user without password
            const { password: _, ...userResponse } = user.toObject();

            await reply.send({
                user: userResponse,
            });
        },
    });

    done();
};
