import { Type } from '@sinclair/typebox';
import { FastifyPluginCallback, FastifySchema } from 'fastify';

import { FastifyRequestTypebox, ObjectIdStringType } from '@lib/fastify-types';
import { NotFoundError } from '@lib/http-errors';
import { UserModel } from '@lib/mongodb/models/user.model';

export default <FastifyPluginCallback>function (app, _opts, done) {
    const schema = {
        params: Type.Object({
            id: ObjectIdStringType,
        }),
    } satisfies FastifySchema;

    app.route({
        url: '/:id/avatar',
        method: 'GET',
        schema,
        handler: async (
            req: FastifyRequestTypebox<typeof schema>,
            reply,
        ) => {
            const user = await UserModel.findById(req.params.id)
                .select('+avatarData +avatarMimeType');

            if (!user || !user.avatarData) {
                throw new NotFoundError('Avatar not found');
            }

            return reply
                .header('Content-Type', user.avatarMimeType ?? 'image/jpeg')
                .header('Cache-Control', 'no-cache')
                .send(user.avatarData);
        },
    });

    done();
};
