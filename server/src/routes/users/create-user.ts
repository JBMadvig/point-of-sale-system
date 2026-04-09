import { convertFromDKK, convertToDKK } from '@services/currency.service';
import { Type } from '@sinclair/typebox';
import { FastifyPluginCallback, FastifySchema } from 'fastify';
import { MongoServerError } from 'mongodb';

import { requireRole } from '@lib/auth-hooks';
import { FastifyRequestTypebox } from '@lib/fastify-types';
import { ConflictError, ForbiddenError, InternalServerError } from '@lib/http-errors';
import { UserModel, UserRoles } from '@lib/mongodb/models/user.model';
import { userPublicSchema, userRolesEnum } from '@lib/schemas/user.schema';

export default <FastifyPluginCallback>function (app, _opts, done) {
    const schema = {
        body: Type.Object({
            name: Type.String({ minLength: 2, maxLength: 100 }),
            email: Type.String({ format: 'email' }),
            password: Type.String({ minLength: 8 }),
            currency: Type.String(),
            role: userRolesEnum,
            balance: Type.Number(),
        }),
        response: {
            201: Type.Object({
                user: userPublicSchema,
            }),
        },
    } satisfies FastifySchema;

    app.route({
        url: '/create',
        method: 'POST',
        schema,
        preHandler: [ requireRole([ 'admin', 'sudo-admin' ]) ],
        handler: async (
            req: FastifyRequestTypebox<typeof schema>,
            reply,
        ) => {
            const { name, email, password, currency, role, balance } = req.body;
            const requestorRole = req.user.role as UserRoles;

            // Admins can only assign 'user' or 'admin' roles
            if (requestorRole === UserRoles.ADMIN && role === UserRoles.SUDO_ADMIN) {
                throw new ForbiddenError('Admins cannot assign the sudo-admin role');
            }

            // Check if user already exists
            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                throw new ConflictError('A user with this email already exists');
            }

            // Convert balance to DKK currency, before adding it to the database, if the provided currency is not DKK
            const balanceInDKK = convertToDKK(balance, currency);

            const newUser = new UserModel({
                email,
                name,
                password,
                role,
                balance: balanceInDKK,
                currency,
                avatarUrl: '',
            });

            try {
                await newUser.save();
            } catch (error) {
                if (error instanceof MongoServerError && error.code === 11000) {
                    throw new ConflictError('A user with this email already exists');
                }
                console.error('Error creating user:', error);
                throw new InternalServerError();
            }

            const { password: _, ...userResponse } = newUser.toObject();

            // Convert balance back from DKK to the provided currency before sending the response
            await reply.status(201).send({
                user: {
                    ...userResponse,
                    balance: convertFromDKK(userResponse.balance, currency),
                },
            });
        },
    });

    done();
};
