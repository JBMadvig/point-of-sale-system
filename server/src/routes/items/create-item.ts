import { convertToDKK } from '@services/currency.service';
import { Type } from '@sinclair/typebox';
import { FastifyPluginCallback, FastifySchema } from 'fastify';
import { MongoServerError } from 'mongodb';

import { authenticateHook } from '@lib/auth-hooks';
import { FastifyReplyTypebox, FastifyRequestTypebox } from '@lib/fastify-types';
import { ConflictError, InternalServerError } from '@lib/http-errors';
import { ItemModel } from '@lib/mongodb/models/item.model';
import { CollectionItemSchema, PrimaryItemUnionCategories } from '@lib/schemas/item.schema';

export default <FastifyPluginCallback>function (app, _opts, done) {
    const schema = {
        body: Type.Object({
            name: Type.String(),
            primaryCategory: PrimaryItemUnionCategories,
            secondaryCategory: Type.String(),
            abv: Type.Number(),
            volume: Type.Number(),
            price: Type.Number(),
            currency: Type.String(),
            amount: Type.Number(),
        }),
        response: {
            200: Type.Object({
                itemAdded: CollectionItemSchema,
            }),
        },
    } satisfies FastifySchema;

    app.route({
        url: '/create-item',
        method: 'POST',
        schema,
        preHandler: [ authenticateHook ],
        handler: async (
            req: FastifyRequestTypebox<typeof schema>,
            reply: FastifyReplyTypebox<typeof schema>,
        ) => {
            const {
                name,
                primaryCategory,
                secondaryCategory,
                abv,
                volume,
                price,
                amount,
                currency,
            } = req.body;

            const convertedPrice = convertToDKK(price, currency);

            const averagePrice = convertedPrice / amount;

            const totalStockValue = averagePrice * amount;

            const newItem = new ItemModel({
                name,
                primaryCategory,
                secondaryCategory,
                abv,
                volume,
                averagePrice,
                currentStock: amount,
                totalStockValue,
            });

            try {
                await newItem.save();
            } catch (error) {
                if (error instanceof MongoServerError && error.code === 11000) {
                    throw new ConflictError('An item with this name already exists');
                }
                console.error('Error creating item:', error);
                throw new InternalServerError();
            }

            return reply.status(200).send({
                itemAdded: newItem.toObject(),
            });
        },
    });

    done();
};
