import crypto from 'crypto';
import { FastifyPluginCallback, FastifySchema } from 'fastify';

import { setDeviceCookie } from '@lib/cookie-helper';
import { FastifyReplyTypebox, FastifyRequestTypebox } from '@lib/fastify-types';
import { ForbiddenError, UnauthorizedError } from '@lib/http-errors';
import { DeviceTokenModel } from '@lib/mongodb/models/device-token.model';
import { UserModel, UserRoles } from '@lib/mongodb/models/user.model';
import { deviceActivateRequestSchema, deviceActivateResponseSchema } from '@lib/schemas/qr-auth.schema';

export default <FastifyPluginCallback>function (app, _opts, done) {
    const schema = {
        body: deviceActivateRequestSchema,
        response: {
            200: deviceActivateResponseSchema,
        },
    } satisfies FastifySchema;

    app.route({
        url: '/device-activate',
        method: 'POST',
        schema,
        handler: async (
            req: FastifyRequestTypebox<typeof schema>,
            reply: FastifyReplyTypebox<typeof schema>,
        ) => {
            const { email, password, deviceName } = req.body;

            const user = await UserModel.findOne({ email }).select('+password');
            if (!user) {
                throw new UnauthorizedError('Invalid email or password');
            }

            const isValidPassword = await user.comparePassword(password);
            if (!isValidPassword) {
                throw new UnauthorizedError('Invalid email or password');
            }

            if (user.role !== UserRoles.SUDO_ADMIN) {
                throw new ForbiddenError('Only sudo-admin users can activate devices');
            }

            const token = crypto.randomBytes(48).toString('hex');
            const name = deviceName || 'POS Device';

            await DeviceTokenModel.create({
                token,
                activatedBy: user._id,
                deviceName: name,
                active: true,
            });

            setDeviceCookie(reply, token);

            await reply.send({
                deviceName: name,
            });
        },
    });

    done();
};
