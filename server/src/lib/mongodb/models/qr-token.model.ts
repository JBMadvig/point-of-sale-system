import { DocumentType, getModelForClass, index, prop } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import mongoose from 'mongoose';

@index({ expiresAt: 1 }, { expireAfterSeconds: 0 }) // MongoDB TTL index for auto-cleanup
export class QrToken extends TimeStamps {
    @prop({ type: () => String, required: true })
    public token: string;

    @prop({ type: () => mongoose.Types.ObjectId, required: true, ref: 'User' })
    public userId: mongoose.Types.ObjectId;

    @prop({ type: () => Boolean, required: true, default: false })
    public used: boolean;

    @prop({ type: () => Date, required: true })
    public expiresAt: Date;
}

export const QrTokenModel = getModelForClass(QrToken);
export type QrTokenDocument = DocumentType<QrToken>;
