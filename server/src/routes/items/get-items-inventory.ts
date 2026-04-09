import { convertFromDKK } from '@services/currency.service';
import { Type } from '@sinclair/typebox';
import { FastifyPluginCallback, FastifySchema } from 'fastify';

import { requireRole } from '@lib/auth-hooks';
import { FastifyReplyTypebox, FastifyRequestTypebox } from '@lib/fastify-types';
import { ItemModel } from '@lib/mongodb/models/item.model';
import { UserModel } from '@lib/mongodb/models/user.model';
import { FullItemUnionSchema, ItemSchemaWithSearchAndSortAndPagination, SortingUnionDirections } from '@lib/schemas/item.schema';

export default <FastifyPluginCallback>function (app, opts, done) {
    const schema = {
        body: Type.Object({
            searchQuery: Type.Optional(Type.String()),
            sortBy: FullItemUnionSchema,
            sortDirection: SortingUnionDirections,
            page: Type.Number({ minimum: 1 }),
            entriesPrPage: Type.Number({ minimum: 1, maximum:100 }),
        }),
        response: {
            200: ItemSchemaWithSearchAndSortAndPagination,
        },
    } satisfies FastifySchema;

    app.route({
        url: '/get-items-inventory',
        method: 'POST',
        schema,
        preHandler: [ requireRole([ 'admin', 'sudo-admin' ]) ],
        handler: async (
            req: FastifyRequestTypebox<typeof schema>,
            reply: FastifyReplyTypebox<typeof schema>,
        ) => {
            // This call is used to get all the items for the /inventory.
            const searchQuery = req.body.searchQuery || '';

            const sortBy = req.body.sortBy;
            const sortDirection = req.body.sortDirection;
            const entriesPrPage = req.body.entriesPrPage;
            const page = req.body.page;

            // Calculate how many entried we should skip, to reach the requested page according to the resultsPrPage
            const resultsToSkip = (page - 1 ) * entriesPrPage;

            // Make the search filter to use both in `items` and `itemsInSearch` (without sort, skip etc)
            const filter = { name: { $regex: searchQuery, $options: 'i' } };

            const [ items, itemsInSearch, totalItems ] = await Promise.all([
                ItemModel
                    .find(filter)
                    .sort({ [sortBy]: sortDirection })
                    .skip(resultsToSkip)
                    .limit(entriesPrPage)
                    .select('_id name primaryCategory secondaryCategory averagePrice currentStock totalStockValue abv volume updatedAt createdAt'),
                ItemModel.countDocuments(filter),
                ItemModel.countDocuments(),
            ]);

            const totalPages = Math.ceil(itemsInSearch / req.body.entriesPrPage);

            // Get users currency setting for convertion of prices and values
            const user = await UserModel.findById(req.user.userId).select('currency');
            const currency = user?.currency || 'DKK';

            await reply.send({
                items: items.map(item => {
                    const obj = item.toObject();
                    return {
                        ...obj,
                        averagePrice: convertFromDKK(obj.averagePrice, currency),
                        totalStockValue: convertFromDKK(obj.totalStockValue, currency),
                    };
                }),
                currency,
                itemsInSearch,
                totalItems,
                searchParams:{
                    searchQuery,
                    sortBy,
                    sortDirection,
                    page,
                    entriesPrPage,
                    totalPagesWithCurrentLimit: totalPages,
                },
            },
            );
        },
    });

    done();
};
