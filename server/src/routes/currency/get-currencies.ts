import { getAvailableCurrencies } from '@services/currency.service';
import { Type } from '@sinclair/typebox';
import { FastifyPluginCallback, FastifySchema } from 'fastify';

import { authenticateHook } from '@lib/auth-hooks';
import { FastifyReplyTypebox, FastifyRequestTypebox } from '@lib/fastify-types';

export default <FastifyPluginCallback>function (app, opts, done) {
    const schema = {
        response: {
            200: Type.Array(Type.String()),
        },
    } satisfies FastifySchema;

    app.route({
        url: '/get-currencies',
        method: 'GET',
        schema,
        preHandler: [ authenticateHook ],
        handler: async (
            req: FastifyRequestTypebox<typeof schema>,
            reply: FastifyReplyTypebox<typeof schema>,
        ) => {
            await reply.send(getAvailableCurrencies());
        },
    });

    done();
};
