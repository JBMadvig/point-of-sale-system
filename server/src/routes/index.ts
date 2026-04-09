import { FastifyPluginCallback } from 'fastify';

export default <FastifyPluginCallback>async function (app) {
    const routes = [
        app.register(import('./auth'), { prefix: '/auth' }),
        app.register(import('./currency'), { prefix: '/currency' }),
        app.register(import('./health'), { prefix: '/health' }),
        app.register(import('./items'), { prefix: '/items' }),
        app.register(import('./users'), { prefix: '/users' }),
        app.register(import('./tmps'), { prefix: '/tmps' }),
    ];

    await Promise.all(routes);
};
