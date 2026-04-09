import { Type } from '@sinclair/typebox';
import { FastifyPluginCallback, FastifySchema } from 'fastify';

import { authenticateHook } from '@lib/auth-hooks';
import { FastifyRequestTypebox, ObjectIdStringType } from '@lib/fastify-types';
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from '@lib/http-errors';
import { generateTokens } from '@lib/jwt-helper';
import { UserModel, UserRoles } from '@lib/mongodb/models/user.model';

export default <FastifyPluginCallback>function (app, _opts, done) {
    const schema = {
        params: Type.Object({
            id: ObjectIdStringType,
        }),
        body: Type.Object({
            currentPassword: Type.Optional(Type.String()),
            newPassword: Type.String({ minLength: 8 }),
            bypassCurrentPassword: Type.Optional(Type.Boolean()),
        }),
        response: {
            200: Type.Object({
                success: Type.Boolean(),
                accessToken: Type.Optional(Type.String()),
                refreshToken: Type.Optional(Type.String()),
            }),
        },
    } satisfies FastifySchema;

    app.route({
        url: '/:id/change-password',
        method: 'POST',
        schema,
        preHandler: [ authenticateHook ],
        handler: async (
            req: FastifyRequestTypebox<typeof schema>,
            reply,
        ) => {
            const targetUserId = req.params.id;
            const requestingUser = req.user;

            const isSelf = requestingUser.userId === targetUserId;
            const requestorRole = requestingUser.role as UserRoles;
            const isSudoAdmin = requestorRole === UserRoles.SUDO_ADMIN;

            // Only the user themselves or a sudo-admin can change passwords
            if (!isSelf && !isSudoAdmin) {
                throw new ForbiddenError('You do not have permission to change this user\'s password');
            }

            // Load target user with password field
            const targetUser = await UserModel.findById(targetUserId).select('+password');
            if (!targetUser) {
                throw new NotFoundError('User not found');
            }

            const bypassCurrentPassword = req.body.bypassCurrentPassword;

            if (bypassCurrentPassword) {
                // Only sudo-admins can bypass the current password check
                if (!isSudoAdmin) {
                    throw new ForbiddenError('Only sudo-admins can bypass the current password check');
                }
            } else {
                // Current password is required
                if (!req.body.currentPassword) {
                    throw new BadRequestError('Current password is required');
                }

                const isCorrect = await targetUser.comparePassword(req.body.currentPassword);
                if (!isCorrect) {
                    throw new UnauthorizedError('Incorrect current password');
                }
            }

            // Update password (pre-save hook handles hashing)
            targetUser.password = req.body.newPassword;

            // Invalidate existing sessions
            targetUser.tokenVersion = (targetUser.tokenVersion ?? 0) + 1;

            await targetUser.save();

            // If self-edit, return new tokens so the user stays logged in
            let accessToken: string | undefined;
            let refreshToken: string | undefined;

            if (isSelf) {
                const tokens = await generateTokens(reply, targetUser);
                accessToken = tokens.accessToken;
                refreshToken = tokens.refreshToken;
            }

            await reply.send({
                success: true,
                ...(accessToken && { accessToken }),
                ...(refreshToken && { refreshToken }),
            });
        },
    });

    done();
};
