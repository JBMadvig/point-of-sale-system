import { Type } from '@sinclair/typebox';

import { userPublicSchema } from './user.schema';

// POST /api/auth/qr-token response
export const qrTokenResponseSchema = Type.Object({
    qrToken: Type.String(),
    expiresAt: Type.String({ format: 'date-time' }),
});

// POST /api/auth/qr-login request body
export const qrLoginRequestSchema = Type.Object({
    qrToken: Type.String(),
});

// POST /api/auth/qr-login response (tokens are in HttpOnly cookies)
export const qrLoginResponseSchema = Type.Object({
    user: userPublicSchema,
});

// POST /api/auth/device-activate request body
export const deviceActivateRequestSchema = Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String(),
    deviceName: Type.Optional(Type.String()),
});

// POST /api/auth/device-activate response (device token is in HttpOnly cookie)
export const deviceActivateResponseSchema = Type.Object({
    deviceName: Type.String(),
});

// GET /api/auth/device-status response
export const deviceStatusResponseSchema = Type.Object({
    activated: Type.Boolean(),
    deviceName: Type.Optional(Type.String()),
});

// POST /api/auth/device-deactivate response
export const deviceDeactivateResponseSchema = Type.Object({
    success: Type.Boolean(),
});

// PATCH /api/auth/device-rename request body
export const deviceRenameRequestSchema = Type.Object({
    deviceName: Type.String({ minLength: 1, maxLength: 50 }),
});

// PATCH /api/auth/device-rename response
export const deviceRenameResponseSchema = Type.Object({
    deviceName: Type.String(),
});

// POST /api/auth/pos-logout request body
export const posLogoutRequestSchema = Type.Object({
    userId: Type.String(),
});

// POST /api/auth/pos-logout response
export const posLogoutResponseSchema = Type.Object({
    success: Type.Boolean(),
});

// GET /api/auth/pos-status response
export const posStatusResponseSchema = Type.Object({
    loggedIn: Type.Boolean(),
    userId: Type.Optional(Type.String()),
});
