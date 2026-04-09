import { FastifyReply, FastifyRequest, preHandlerAsyncHookHandler } from 'fastify';

import { ForbiddenError, UnauthorizedError } from './http-errors';
import { JWTPayload, verifyAccessToken } from './jwt-helper';
import { UserModel } from './mongodb/models/user.model';

// Extend @fastify/jwt to type the user payload
declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: JWTPayload;
        user: JWTPayload;
    }
}

/**
 * Verifies JWT access token and validates tokenVersion against the database.
 * Throws UnauthorizedError if the token has been invalidated.
 */
async function verifyAndValidateUser(request: FastifyRequest): Promise<JWTPayload> {
    const payload = await verifyAccessToken(request);
    const user = await UserModel.findById(payload.userId).select('tokenVersion');

    if (!user || user.tokenVersion !== payload.tokenVersion) {
        throw new UnauthorizedError('Session invalidated. Please log in again.');
    }

    return payload;
}

/**
 * Fastify preHandler hook to authenticate requests
 * Verifies JWT access token, validates tokenVersion, and attaches user payload to request
 */
export const authenticateHook: preHandlerAsyncHookHandler = async (
    request: FastifyRequest,
    _reply: FastifyReply,
) => {
    const payload = await verifyAndValidateUser(request);
    request.user = payload;
};

/**
 * Factory function to create a role-based authorization hook
 * @param allowedRoles - Array of roles that are allowed to access the route
 */
export function requireRole(allowedRoles: string[]): preHandlerAsyncHookHandler {
    return async (request: FastifyRequest, _reply: FastifyReply) => {
        const payload = await verifyAndValidateUser(request);
        request.user = payload;

        if (!allowedRoles.includes(payload.role)) {
            throw new ForbiddenError('Insufficient permissions');
        }
    };
}
