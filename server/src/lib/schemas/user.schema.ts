import { Type } from '@sinclair/typebox';

import { MongooseDateType, MongooseObjectIdType } from '@lib/fastify-types';

export const userRolesEnum = Type.Union([
    Type.Literal('admin'),
    Type.Literal('user'),
    Type.Literal('sudo-admin'),
]);

// Minimal user schema for login screen (public, no auth required)
export const userMinimalSchema = Type.Object({
    _id: MongooseObjectIdType,
    name: Type.String(),
    email: Type.String({ format: 'email' }),
    avatarUrl: Type.String(),
});

// Public user schema (without password)
export const userPublicSchema = Type.Object({
    _id: MongooseObjectIdType,
    email: Type.String({ format: 'email' }),
    name: Type.String(),
    role: userRolesEnum,
    balance: Type.Number(),
    currency: Type.String({ pattern: '^[A-Z]{3}$' }),
    // TODO: Make required (Type.Number()) once all existing users have been updated with tokenVersion
    tokenVersion: Type.Optional(Type.Number({ default: 0 })),
    avatarUrl: Type.String(),
    createdAt: MongooseDateType,
    updatedAt: MongooseDateType,
});

export const userDashboardSchema = Type.Object({
    _id: MongooseObjectIdType,
    email: Type.String({ format: 'email' }),
    name: Type.String(),
    role: userRolesEnum,
    balance: Type.Number(),
    currency: Type.String({ pattern: '^[A-Z]{3}$' }),
    // TODO: Make required (Type.Number()) once all existing users have been updated with tokenVersion
    tokenVersion: Type.Optional(Type.Number({ default: 0 })),
    createdAt: MongooseDateType,
    updatedAt: MongooseDateType,
});

// For backward compatibility
export const userSchema = userPublicSchema;

// Auth request schemas
export const loginRequestSchema = Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String(),
});

// Auth response schema (tokens are in HttpOnly cookies, not in the response body)
export const authResponseSchema = Type.Object({
    user: userPublicSchema,
});

// Id request for deleting specific user
export const idRequestSchema = Type.Object({
    _id: MongooseObjectIdType,
});
