import { DocumentType, getModelForClass, prop } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

export enum PrimaryCategories {
    BEER = 'beer',
    CIDER = 'cider',
    WINE = 'wine',
    SPIRIT = 'spirit',
    SODA = 'soda',
    OTHER = 'other',
}

export class Item extends TimeStamps {
    @prop({ type: () => String, required: true })
    public name: string;

    @prop({ type: () => String,
        required: true,
        enum: PrimaryCategories,
        default: PrimaryCategories.OTHER,
    })
    public primaryCategory: PrimaryCategories;

    @prop({ type: () => String })
    public secondaryCategory: string;

    @prop({ type: () => Number, required: false, default: 0, min: 0, max: 100 })
    public abv: number;

    @prop({ type: () => Number, required: true, default: 0, min: 0 })
    public volume: number;

    @prop({ type: () => Number, required: true, default: 0 })
    public averagePrice: number;

    @prop({ type: () => Number, required: true, default: 0 })
    public currentStock: number;

    @prop({ type: () => Number, required: true, default: 0 })
    public totalStockValue: number;

    @prop({ type: () => String, sparse: true, unique: true })
    public barcode?: string;
}

export const ItemModel = getModelForClass(Item);
export type ItemDocument = DocumentType<Item>;
