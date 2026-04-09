import { convertFromDKK, convertToDKK } from '@services/currency.service';
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
            id: Type.String(),
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
                itemUpdated: CollectionItemSchema,
                currency: Type.String(),
                avgPriceChange: Type.Object({
                    prevAvgPrice: Type.Number(),
                    newAvgPrice: Type.Number(),
                }),
                stockChange: Type.Object({
                    prevStock: Type.Number(),
                    newStock: Type.Number(),
                }),
                totalStockValueChange: Type.Object({
                    prevTotalStockValue: Type.Number(),
                    newTotalStockValue: Type.Number(),
                }),
            }),
        },
    } satisfies FastifySchema;

    app.route({
        url: '/update-item',
        method: 'UPDATE',
        schema,
        preHandler: [ authenticateHook ],
        handler: async (
            req: FastifyRequestTypebox<typeof schema>,
            reply: FastifyReplyTypebox<typeof schema>,
        ) => {
            const {
                id,
                name,
                primaryCategory,
                secondaryCategory,
                abv,
                volume,
                currency,
                price,
                amount,
            } = req.body;

            // Get the item from the inventory to update the average price and total stock value
            const prevItem = await ItemModel.findById(id);
            if (!prevItem) {
                throw new InternalServerError('Item not found in inventory');
            }

            // Calculate new average price and total stock value based on existing values and new values
            const danishPrice = convertToDKK(price, currency);

            const newTotalStock = prevItem.currentStock + amount;
            const newTotalStockValue = prevItem.totalStockValue + danishPrice;
            const averagePrice = newTotalStockValue / newTotalStock;

            let updatedItem;
            try {
                updatedItem = await ItemModel.findByIdAndUpdate(id, {
                    name,
                    primaryCategory,
                    secondaryCategory,
                    abv,
                    volume,
                    averagePrice,
                    currentStock: newTotalStock,
                    totalStockValue: newTotalStockValue,
                }, { new: true });
            } catch (error) {
                if (error instanceof MongoServerError && error.code === 11000) {
                    throw new ConflictError('An item with this name already exists');
                }
                console.error('Error creating item:', error);
                throw new InternalServerError();
            }

            if (!updatedItem) {
                throw new InternalServerError('Failed to retrieve updated item');
            }

            return reply.status(200).send({
                itemUpdated: updatedItem.toObject(),
                currency,
                avgPriceChange: {
                    prevAvgPrice: convertFromDKK(prevItem.averagePrice, currency),
                    newAvgPrice: convertFromDKK(averagePrice, currency),
                },
                stockChange: {
                    prevStock: prevItem.currentStock,
                    newStock: newTotalStock,
                },
                totalStockValueChange: {
                    prevTotalStockValue: convertFromDKK(prevItem.totalStockValue, currency),
                    newTotalStockValue: convertFromDKK(newTotalStockValue, currency),
                },
            });
        },
    });

    done();
};
