import { Type } from '@sinclair/typebox';
import { FastifyPluginCallback, FastifySchema } from 'fastify';

import { requireRole } from '@lib/auth-hooks';
import { FastifyReplyTypebox, FastifyRequestTypebox, ObjectIdStringType } from '@lib/fastify-types';
import { ForbiddenError, NotFoundError } from '@lib/http-errors';
import { UserModel, UserRoles } from '@lib/mongodb/models/user.model';

export default <FastifyPluginCallback>function (app, opts, done) {
    const schema = {
        params: Type.Object({
            userId: ObjectIdStringType,
        }),
        response: {
            204: Type.Never(),
        },
    } satisfies FastifySchema;

    app.route({
        url: '/:userId/delete',
        method: 'DELETE',
        schema,
        preHandler: [ requireRole([ 'admin', 'sudo-admin' ]) ],
        handler: async (
            req: FastifyRequestTypebox<typeof schema>,
            reply: FastifyReplyTypebox<typeof schema>,
        ) => {

            const targetUser = await UserModel.findById(req.params.userId).exec();

            if (!targetUser) throw new NotFoundError('Document not found');

            if (targetUser.role === UserRoles.SUDO_ADMIN) {
                if ((req.user.role as UserRoles) !== UserRoles.SUDO_ADMIN) {
                    throw new ForbiddenError('Only sudo-admins can delete sudo-admin accounts');
                }

                const sudoAdminCount = await UserModel.countDocuments({ role: UserRoles.SUDO_ADMIN }).exec();
                if (sudoAdminCount <= 1) {
                    throw new ForbiddenError('Cannot delete the last sudo-admin account');
                }
            }

            await UserModel.findByIdAndDelete(req.params.userId).exec();

            await reply.status(204).send();
        },
    });

    done();
};
