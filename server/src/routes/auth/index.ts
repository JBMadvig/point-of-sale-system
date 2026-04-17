import { FastifyPluginCallback } from 'fastify';

export default <FastifyPluginCallback>async function (app) {
    const routes = [
        app.register(import('./login')),
        app.register(import('./refresh')),
        app.register(import('./me')),
        app.register(import('./qr-token')),
        app.register(import('./qr-login')),
        app.register(import('./device-activate')),
        app.register(import('./device-status')),
        app.register(import('./device-deactivate')),
        app.register(import('./device-rename')),
        app.register(import('./pos-logout')),
        app.register(import('./pos-status')),
        app.register(import('./logout')),
    ];

    await Promise.all(routes);
};
