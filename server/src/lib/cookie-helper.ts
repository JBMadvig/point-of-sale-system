import { FastifyReply } from 'fastify';

const isProduction = process.env['NODE_ENV'] === 'production';

export function setAuthCookies(reply: FastifyReply, accessToken: string, refreshToken: string) {
    reply.setCookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        path: '/api',
        maxAge: 60 * 60, // 1 hour
    });
    reply.setCookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        path: '/api/auth',
        maxAge: 7 * 24 * 60 * 60, // 7 days
    });
}

export function clearAuthCookies(reply: FastifyReply) {
    reply.clearCookie('accessToken', { path: '/api' });
    reply.clearCookie('refreshToken', { path: '/api/auth' });
}

export function setDeviceCookie(reply: FastifyReply, deviceToken: string) {
    reply.setCookie('deviceToken', deviceToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        path: '/api/auth',
        maxAge: 365 * 24 * 60 * 60, // 1 year
    });
}
