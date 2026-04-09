import { FastifyPluginCallback } from 'fastify';

export default <FastifyPluginCallback>async function (app) {

    const routes = [
        app.register(import('./create-item')),
        app.register(import('./get-items-inventory')),
        app.register(import('./get-items-collection')),
        app.register(import('./scan')),
    ];

    await Promise.all(routes);
};
