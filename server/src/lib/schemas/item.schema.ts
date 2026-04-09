import { Type } from '@sinclair/typebox';

import { MongooseDateType, MongooseObjectIdType } from '@lib/fastify-types';

export const PrimaryItemUnionCategories = Type.Union([
    Type.Literal('beer'),
    Type.Literal('cider'),
    Type.Literal('wine'),
    Type.Literal('spirit'),
    Type.Literal('soda'),
    Type.Literal('other'),
]);
export const SortingUnionDirections = Type.Union([
    Type.Literal('ascending'),
    Type.Literal('descending'),
]);

export const FullItemUnionSchema = Type.Union([
    Type.Literal('_id'),
    Type.Literal('name'),
    Type.Literal('volume'),
    Type.Literal('barcode'),
    Type.Literal('primaryCategory'),
    Type.Literal('secondaryCategory'),
    Type.Literal('averagePrice'),
    Type.Literal('currentStock'),
    Type.Literal('totalStockValue'),
    Type.Literal('abv'),
    Type.Literal('updatedAt'),
    Type.Literal('createdAt'),
]);

// Full Item schema
export const FullItemSchema = Type.Object({
    _id: MongooseObjectIdType,
    name: Type.String(),
    primaryCategory: PrimaryItemUnionCategories,
    secondaryCategory: Type.String(),
    averagePrice: Type.Number(),
    currentStock: Type.Number(),
    totalStockValue: Type.Number(),
    abv: Type.Number(),
    volume: Type.Number(),
    barcode: Type.Optional(Type.String()),
    updatedAt: MongooseDateType,
    createdAt: MongooseDateType,
});

// Item schema for collection view
export const CollectionItemSchema = Type.Object({
    _id: MongooseObjectIdType,
    name: Type.String(),
    primaryCategory: PrimaryItemUnionCategories,
    secondaryCategory: Type.String(),
    averagePrice: Type.Number(),
    currentStock: Type.Number(),
    abv: Type.Number(),
    volume: Type.Number(),
    barcode: Type.Optional(Type.String()),
});

// Create Item schema when adding new item to inventory
export const CreateItemSchema = Type.Object({
    _id: MongooseObjectIdType,
    name: Type.String(),
    primaryCategory: PrimaryItemUnionCategories,
    secondaryCategory: Type.String(),
    totalPaid: Type.Number(),
    abv: Type.Number(),
    volume: Type.Number(),
    amount: Type.Number(),
    barcode: Type.Optional(Type.String()),
});

export const ItemSchemaWithSearchAndSortAndPagination = Type.Object({
    items: Type.Array(FullItemSchema),
    currency: Type.String(),
    itemsInSearch: Type.Number(),
    totalItems: Type.Number(),
    searchParams: Type.Object({
        searchQuery: Type.String(),
        sortBy: FullItemUnionSchema,
        sortDirection: SortingUnionDirections,
        page: Type.Number({ minimum:1 }),
        entriesPrPage: Type.Number({ minimum:1, maximum:100 }),
        totalPagesWithCurrentLimit: Type.Number(),
    }),
});
