import { convertFromDKK } from '@services/currency.service';
import { sendToSubscribers } from '@services/websocket.service';
import { Type } from '@sinclair/typebox';
import { FastifyPluginCallback, FastifySchema } from 'fastify';

import { authenticateHook } from '@lib/auth-hooks';
import { FastifyReplyTypebox, FastifyRequestTypebox } from '@lib/fastify-types';
import { ForbiddenError } from '@lib/http-errors';
import { ItemModel } from '@lib/mongodb/models/item.model';
import { UserModel } from '@lib/mongodb/models/user.model';
import { CollectionItemSchema } from '@lib/schemas/item.schema';

export default <FastifyPluginCallback>function (app, _opts, done) {
    const schema = {
        body: Type.Object({
            barcode: Type.String(),
            targetUserId: Type.String(),
        }),
        response: {
            200: Type.Object({
                item: Type.Optional(CollectionItemSchema),
                currency: Type.Optional(Type.String()),
                barcode: Type.Optional(Type.String()),
            }),
        },
    } satisfies FastifySchema;

    app.route({
        url: '/scan',
        method: 'POST',
        schema,
        preHandler: [ authenticateHook ],
        handler: async (
            req: FastifyRequestTypebox<typeof schema>,
            reply: FastifyReplyTypebox<typeof schema>,
        ) => {
            const { barcode, targetUserId } = req.body;

            const item = await ItemModel.findOne({ barcode });
            const itemExists = !!item;

            switch (true) {
                case targetUserId !== req.user.userId:
                    throw new ForbiddenError('You can only scan items for yourself');
                    break;

                case !itemExists:
                    // Notify POS clients about the new barcode, so they can prompt the user to add it or use the barcode for creating new items
                    sendToSubscribers(`pos:${targetUserId}`, {
                        type: 'new-item-scanned',
                        barcode,
                    });

                    await reply.send({
                        barcode,
                    });
                    break;

                case itemExists: {

                    const user = await UserModel.findById(req.user.userId).select('currency');
                    const currency = user?.currency || 'DKK';

                    const obj = item.toObject();
                    const mappedItem = {
                        ...obj,
                        averagePrice: convertFromDKK(obj.averagePrice, currency),
                    };

                    sendToSubscribers(`pos:${targetUserId}`, {
                        type: 'item-scanned',
                        item: {
                            id: obj._id.toString(),
                            name: obj.name,
                            company: obj.company,
                            barcode: obj.barcode,
                            primaryCategory: obj.primaryCategory,
                            secondaryCategory: obj.secondaryCategory,
                            averagePrice: convertFromDKK(obj.averagePrice, currency),
                            currentStock: obj.currentStock,
                            abv: obj.abv,
                            volume: obj.volume,
                        },
                    });

                    await reply.send({
                        item: mappedItem,
                        currency,
                    });
                }

            }
        },
    });

    done();
};
