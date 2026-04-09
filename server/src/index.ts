import fastifyCookie from '@fastify/cookie';
import cors from '@fastify/cors';
import fjwt from '@fastify/jwt';
import fastifyMultipart from '@fastify/multipart';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import fastifyWebsocket from '@fastify/websocket';
import { initCurrencyService } from '@services/currency.service';
import { initWebsocket } from '@services/websocket.service';
import Fastify from 'fastify';

import { httpErrorHandler, notFoundHandler } from '@lib/http-errors';
import { connectToMongoDB } from '@lib/mongodb';
import routes from './routes';

(async () => {
    console.log('⏱️  Starting server...');

    await connectToMongoDB();
    await initCurrencyService();

    const fastify = Fastify().withTypeProvider<TypeBoxTypeProvider>();

    // Register JWT plugin
    await fastify.register(fjwt, {
        secret: process.env['JWT_SECRET'] || 'your-secret-key-change-in-production',
    });

    await fastify.register(fastifyCookie);

    await fastify.register(fastifyWebsocket);
    await initWebsocket(fastify);

    await fastify.register(cors, {
        origin: true,
        credentials: true,
        methods: [ 'GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS' ],
        allowedHeaders: [ 'Content-Type', 'Authorization', 'access-control-allow-headers' ],
    });

    await fastify.register(fastifyMultipart, {
        limits: {
            fileSize: 10 * 1024 * 1024, // 10MB max
            files: 1,
        },
    });

    fastify.setErrorHandler(httpErrorHandler);
    fastify.setNotFoundHandler(notFoundHandler);

    await fastify.register(routes, { prefix: '/api' });

    const port = Number(process.env['SERVER_PORT']) || 9001;
    const address = await fastify.listen({ port, host: '0.0.0.0' });

    console.log(`💡 Server running on ${address}`);

})().catch((err) => {
    console.error('An error occurred while starting the server:');
    console.error(err);
    process.exit(1);
});
