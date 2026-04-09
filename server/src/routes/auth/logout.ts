import { FastifyPluginCallback } from 'fastify';

import { clearAuthCookies } from '@lib/cookie-helper';

export default <FastifyPluginCallback>function (app, _opts, done) {
    app.route({
        url: '/logout',
        method: 'POST',
        handler: async (_req, reply) => {
            clearAuthCookies(reply);
            await reply.send({ success: true });
        },
    });

    done();
};
