import { convertFromDKK } from '@services/currency.service';
import { Type } from '@sinclair/typebox';
import { FastifyPluginCallback, FastifySchema } from 'fastify';

import { authenticateHook } from '@lib/auth-hooks';
import { FastifyReplyTypebox, FastifyRequestTypebox } from '@lib/fastify-types';
import { ItemModel } from '@lib/mongodb/models/item.model';
import { UserModel } from '@lib/mongodb/models/user.model';
import { CollectionItemSchema } from '@lib/schemas/item.schema';

export default <FastifyPluginCallback>function (app, opts, done) {
    const schema = {
        response: {
            200: Type.Object({
                items: Type.Array(CollectionItemSchema),
                currency: Type.String(),
            }),
        },
    } satisfies FastifySchema;

    app.route({
        url: '/get-items-collection',
        method: 'GET',
        schema,
        preHandler: [ authenticateHook ],
        handler: async (
            req: FastifyRequestTypebox<typeof schema>,
            reply: FastifyReplyTypebox<typeof schema>,
        ) => {

            const items = await ItemModel.find({}).select('_id name primaryCategory secondaryCategory averagePrice volume currentStock abv');

            // Get users currency setting for convertion of prices and values
            const user = await UserModel.findById(req.user.userId).select('currency');
            const currency = user?.currency || 'DKK';

            await reply.send({
                items: items.map(item => {
                    const obj = item.toObject();
                    return {
                        ...obj,
                        averagePrice: convertFromDKK(obj.averagePrice, currency),
                    };
                }),
                currency,
            });
        },
    });

    done();
};
