import { FastifyReply, FastifyRequest, preHandlerAsyncHookHandler } from 'fastify';

import { UnauthorizedError } from './http-errors';
import { DeviceTokenDocument, DeviceTokenModel } from './mongodb/models/device-token.model';

declare module 'fastify' {
    interface FastifyRequest {
        device?: DeviceTokenDocument;
    }
}

export const deviceTokenHook: preHandlerAsyncHookHandler = async (
    request: FastifyRequest,
    _reply: FastifyReply,
) => {
    const deviceToken = request.cookies?.['deviceToken'];

    if (!deviceToken) {
        throw new UnauthorizedError('Device token required');
    }

    const device = await DeviceTokenModel.findOne({
        token: deviceToken,
        active: true,
    });

    if (!device) {
        throw new UnauthorizedError('Invalid or revoked device token');
    }

    request.device = device;
};
