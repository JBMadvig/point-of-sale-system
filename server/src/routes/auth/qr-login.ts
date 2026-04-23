import { sendToSubscribers } from '@services/websocket.service';
import { FastifyPluginCallback, FastifySchema } from 'fastify';

import { deviceTokenHook } from '@lib/device-auth-hook';
import { FastifyReplyTypebox, FastifyRequestTypebox } from '@lib/fastify-types';
import { NotFoundError, UnauthorizedError } from '@lib/http-errors';
import { generateTokens } from '@lib/jwt-helper';
import { QrTokenModel } from '@lib/mongodb/models/qr-token.model';
import { UserModel } from '@lib/mongodb/models/user.model';
import { qrLoginRequestSchema, qrLoginResponseSchema } from '@lib/schemas/qr-auth.schema';

export default <FastifyPluginCallback>function (app, _opts, done) {
    const schema = {
        body: qrLoginRequestSchema,
        response: {
            200: qrLoginResponseSchema,
        },
    } satisfies FastifySchema;

    app.route({
        url: '/qr-login',
        method: 'POST',
        schema,
        preHandler: [ deviceTokenHook ],
        handler: async (
            req: FastifyRequestTypebox<typeof schema>,
            reply: FastifyReplyTypebox<typeof schema>,
        ) => {
            // Atomically find and mark as used to prevent race conditions
            const qrToken = await QrTokenModel.findOneAndUpdate(
                {
                    token: req.body.qrToken,
                    used: false,
                    expiresAt: { $gt: new Date() },
                },
                { $set: { used: true } },
                { new: true },
            );

            if (!qrToken) {
                throw new UnauthorizedError('Invalid or expired QR code');
            }

            const user = await UserModel.findById(qrToken.userId);
            if (!user) {
                throw new NotFoundError('User not found');
            }

            // Generate tokens (sets HttpOnly cookies automatically)
            await generateTokens(reply, user);

            // Notify phone via WebSocket
            sendToSubscribers(`user:${user._id.toString()}`, {
                type: 'pos-login',
                userId: user._id.toString(),
            });

            const { password: _, ...userResponse } = user.toObject();

            await reply.send({
                user: userResponse,
            });
        },
    });

    done();
};
