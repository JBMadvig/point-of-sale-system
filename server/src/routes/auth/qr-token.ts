import crypto from 'crypto';

import { FastifyPluginCallback, FastifySchema } from 'fastify';

import { authenticateHook } from '@lib/auth-hooks';
import { FastifyReplyTypebox, FastifyRequestTypebox } from '@lib/fastify-types';
import { QrTokenModel } from '@lib/mongodb/models/qr-token.model';
import { qrTokenResponseSchema } from '@lib/schemas/qr-auth.schema';

export default <FastifyPluginCallback>function (app, _opts, done) {
    const schema = {
        response: {
            200: qrTokenResponseSchema,
        },
    } satisfies FastifySchema;

    app.route({
        url: '/qr-token',
        method: 'POST',
        schema,
        preHandler: [authenticateHook],
        handler: async (
            req: FastifyRequestTypebox<typeof schema>,
            reply: FastifyReplyTypebox<typeof schema>,
        ) => {
            const token = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            await QrTokenModel.create({
                token,
                userId: req.user.userId,
                used: false,
                expiresAt,
            });

            await reply.send({
                qrToken: token,
                expiresAt: expiresAt.toISOString(),
            });
        },
    });

    done();
};
