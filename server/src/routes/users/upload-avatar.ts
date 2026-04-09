import { MultipartFile } from '@fastify/multipart';
import { Type } from '@sinclair/typebox';
import { FastifyPluginCallback, FastifySchema } from 'fastify';
import sharp from 'sharp';

import { authenticateHook } from '@lib/auth-hooks';
import { FastifyRequestTypebox, ObjectIdStringType } from '@lib/fastify-types';
import { BadRequestError, ForbiddenError, NotFoundError } from '@lib/http-errors';
import { UserModel, UserRoles } from '@lib/mongodb/models/user.model';

const ALLOWED_MIME_TYPES = [ 'image/jpeg', 'image/png' ];

export default <FastifyPluginCallback>function (app, _opts, done) {
    const schema = {
        params: Type.Object({
            id: ObjectIdStringType,
        }),
    } satisfies FastifySchema;

    app.route({
        url: '/:id/avatar',
        method: 'POST',
        schema,
        preHandler: [ authenticateHook ],
        handler: async (
            req: FastifyRequestTypebox<typeof schema>,
            reply,
        ) => {
            const targetUserId = req.params.id;
            const requestingUser = req.user;

            // Load target user
            const targetUser = await UserModel.findById(targetUserId);
            if (!targetUser) {
                throw new NotFoundError('User not found');
            }

            // Authorization
            const isSelf = requestingUser.userId === targetUserId;
            const requestorRole = requestingUser.role as UserRoles;
            if (!isSelf) {
                if (requestorRole === UserRoles.USER) {
                    throw new ForbiddenError('You can only upload your own avatar');
                }
                if (requestorRole === UserRoles.ADMIN && targetUser.role === UserRoles.SUDO_ADMIN) {
                    throw new ForbiddenError('Admins cannot modify sudo-admin avatars');
                }
            }

            // Parse multipart file
            const file: MultipartFile | undefined = await req.file();
            if (!file) {
                throw new BadRequestError('No file provided');
            }

            if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
                throw new BadRequestError('Only JPEG and PNG images are allowed');
            }

            // Read file into buffer
            let buffer: Buffer;
            try {
                buffer = await file.toBuffer();
            } catch (err: unknown) {
                if (err instanceof Error && 'code' in err && err.code === 'FST_REQ_FILE_TOO_LARGE') {
                    throw new BadRequestError('File too large. Maximum size is 10MB');
                }
                throw err;
            }

            // Resize and convert to WebP
            const processedBuffer = await sharp(buffer)
                .resize(512, 512, { fit: 'cover' })
                .webp({ quality: 80 })
                .toBuffer();

            // Update user document
            targetUser.avatarData = processedBuffer;
            targetUser.avatarMimeType = 'image/webp';
            targetUser.avatarUrl = `/api/users/${targetUserId}/avatar`;
            await targetUser.save();

            return reply.status(200).send({
                avatarUrl: `/api/users/${targetUserId}/avatar`,
            });
        },
    });

    done();
};
