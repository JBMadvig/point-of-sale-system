import { FastifyReply, FastifyRequest } from 'fastify';

import { setAuthCookies } from './cookie-helper';
import { UnauthorizedError } from './http-errors';
import { UserDocument } from './mongodb/models/user.model';

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    tokenVersion: number;
    type: 'access' | 'refresh'; // Token type to differentiate
}

export function verifyAccessToken(request: FastifyRequest): JWTPayload {
    const token = request.cookies?.['accessToken'];
    if (!token) {
        throw new UnauthorizedError('No access token provided');
    }

    try {
        const payload = request.server.jwt.verify<JWTPayload>(token);
        if (payload.type !== 'access') {
            throw new UnauthorizedError('Invalid token type');
        }
        return payload;
    } catch (error) {
        if (error instanceof UnauthorizedError) throw error;
        throw new UnauthorizedError('Invalid or expired access token');
    }
}

export function verifyRefreshToken(request: FastifyRequest): JWTPayload {
    const token = request.cookies?.['refreshToken'];
    if (!token) {
        throw new UnauthorizedError('No refresh token provided');
    }

    try {
        const payload = request.server.jwt.verify<JWTPayload>(token);
        if (payload.type !== 'refresh') {
            throw new UnauthorizedError('Invalid token type');
        }
        return payload;
    } catch (error) {
        if (error instanceof UnauthorizedError) throw error;
        throw new UnauthorizedError('Invalid or expired refresh token');
    }
}

export async function generateTokens(reply: FastifyReply, user: UserDocument) {
    const basePayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        tokenVersion: Number(user.tokenVersion ?? 0),
    };

    // Generate access token (60 minutes)
    const accessToken = await reply.jwtSign(
        { ...basePayload, type: 'access' as const },
        { expiresIn: '60m' },
    );

    // Generate refresh token (7 days)
    const refreshToken = await reply.jwtSign(
        { ...basePayload, type: 'refresh' as const },
        { expiresIn: '7d' },
    );

    // Set as HttpOnly cookies
    setAuthCookies(reply, accessToken, refreshToken);

    return { accessToken, refreshToken };
}
