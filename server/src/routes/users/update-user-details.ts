import { convertFromDKK, convertToDKK } from '@services/currency.service';
import { Type } from '@sinclair/typebox';
import { FastifyPluginCallback, FastifySchema } from 'fastify';
import { MongoServerError } from 'mongodb';

import { authenticateHook } from '@lib/auth-hooks';
import { FastifyRequestTypebox, ObjectIdStringType } from '@lib/fastify-types';
import { BadRequestError, ConflictError, ForbiddenError, InternalServerError, NotFoundError } from '@lib/http-errors';
import { generateTokens } from '@lib/jwt-helper';
import { UserModel, UserRoles } from '@lib/mongodb/models/user.model';
import { userPublicSchema, userRolesEnum } from '@lib/schemas/user.schema';

export default <FastifyPluginCallback>function (app, _opts, done) {
    const schema = {
        params: Type.Object({
            id: ObjectIdStringType,
        }),
        body: Type.Object({
            name: Type.Optional(Type.String({ minLength: 2, maxLength: 100 })),
            email: Type.Optional(Type.String({ format: 'email' })),
            currency: Type.Optional(Type.String()),
            role: Type.Optional(userRolesEnum),
            balance: Type.Optional(Type.Number()),
        }),
        response: {
            200: Type.Object({
                user: userPublicSchema,
                accessToken: Type.Optional(Type.String()),
                refreshToken: Type.Optional(Type.String()),
            }),
        },
    } satisfies FastifySchema;

    app.route({
        url: '/:id',
        method: 'POST',
        schema,
        preHandler: [ authenticateHook ],
        handler: async (
            req: FastifyRequestTypebox<typeof schema>,
            reply,
        ) => {
            const targetUserId = req.params.id;
            const requestingUser = req.user;

            // Load target user
            const targetUser = await UserModel.findById(targetUserId);
            if (!targetUser) {
                throw new NotFoundError('User not found');
            }

            const isSelf = requestingUser.userId === targetUserId;
            const requestorRole = requestingUser.role as UserRoles;
            const isAdmin = requestorRole === UserRoles.ADMIN;
            const isSudoAdmin = requestorRole === UserRoles.SUDO_ADMIN;
            const isAdminOrAbove = isAdmin || isSudoAdmin;

            // Global guard: admins cannot modify sudo-admin users (unless it's themselves)
            if (!isSelf && isAdmin && targetUser.role === UserRoles.SUDO_ADMIN) {
                throw new ForbiddenError('Admins cannot modify sudo-admin users');
            }

            // Ensure at least one field is being updated
            if (req.body.name === undefined && req.body.email === undefined && req.body.currency === undefined && req.body.role === undefined && req.body.balance === undefined) {
                throw new BadRequestError('No fields to update');
            }

            // Track whether email or role changed (for token handling)
            let emailChanged = false;
            let roleChanged = false;

            // NAME: admin/sudo-admin OR self
            if (req.body.name !== undefined) {
                if (!isAdminOrAbove && !isSelf) {
                    throw new ForbiddenError('You do not have permission to update this user\'s name');
                }
                targetUser.name = req.body.name;
            }

            // EMAIL: admin/sudo-admin OR self
            if (req.body.email !== undefined) {
                if (!isAdminOrAbove && !isSelf) {
                    throw new ForbiddenError('You do not have permission to update this user\'s email');
                }
                if (req.body.email !== targetUser.email) {
                    emailChanged = true;
                }
                targetUser.email = req.body.email;
            }
            // EMAIL: admin/sudo-admin OR self
            if (req.body.currency !== undefined) {
                if (!isAdminOrAbove && !isSelf) {
                    throw new ForbiddenError('You do not have permission to update this user\'s currency');
                }
                targetUser.currency = req.body.currency;
            }

            // BALANCE: admin/sudo-admin only
            if (req.body.balance !== undefined) {
                if (!isAdminOrAbove) {
                    throw new ForbiddenError('Only admins can update user balance');
                }
                targetUser.balance = convertToDKK(req.body.balance, targetUser.currency);
            }

            // ROLE: complex authorization rules
            if (req.body.role !== undefined) {
                if (!isAdminOrAbove) {
                    throw new ForbiddenError('Only admins can update user roles');
                }

                const newRole = req.body.role as UserRoles;

                // Block admin self-demotion
                if (isSelf && isAdmin && newRole === UserRoles.USER) {
                    throw new ForbiddenError('Cannot demote yourself. Ask a sudo-admin.');
                }

                if (isAdmin) {
                    // Admin can only change users whose current role is 'user' or 'admin'
                    if (targetUser.role === UserRoles.SUDO_ADMIN) {
                        throw new ForbiddenError('Admins cannot change the role of a sudo-admin');
                    }
                    // Admin can only assign 'user' or 'admin'
                    if (newRole === UserRoles.SUDO_ADMIN) {
                        throw new ForbiddenError('Admins cannot assign the sudo-admin role');
                    }
                }
                // sudo-admin can change any user to any role (no additional checks)

                if (newRole !== targetUser.role) {
                    roleChanged = true;
                }
                targetUser.role = newRole;
            }

            // Token invalidation: if another user's email or role changed, increment their tokenVersion
            if (!isSelf && (emailChanged || roleChanged)) {
                targetUser.tokenVersion = (targetUser.tokenVersion ?? 0) + 1;
            }

            // Save with duplicate-key error handling
            try {
                await targetUser.save();
            } catch (error) {
                if (error instanceof MongoServerError) {
                    if (error.code === 11000) {
                        throw new ConflictError('A user with this email already exists', {
                            value: error.keyValue,
                        });
                    }
                }

                console.error('Error updating user:', error);
                throw new InternalServerError();
            }

            // Token refresh for self: if the requesting user changed their own email or role
            let accessToken: string | undefined;
            let refreshToken: string | undefined;

            if (isSelf && (emailChanged || roleChanged)) {
                const tokens = await generateTokens(reply, targetUser);
                accessToken = tokens.accessToken;
                refreshToken = tokens.refreshToken;
            }

            const userObj = targetUser.toObject();

            await reply.send({
                user: {
                    ...userObj,
                    balance: convertFromDKK(userObj.balance, userObj.currency),
                },
                ...(accessToken && { accessToken }),
                ...(refreshToken && { refreshToken }),
            });
        },
    });

    done();
};
