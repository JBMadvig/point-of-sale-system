import { FastifyPluginCallback } from 'fastify';

export default <FastifyPluginCallback>async function (app) {

    const routes = [
        app.register(import('./get-currencies')),
    ];

    await Promise.all(routes);
};
