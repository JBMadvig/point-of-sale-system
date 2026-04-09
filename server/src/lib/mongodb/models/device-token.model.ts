import { DocumentType, getModelForClass, prop } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import mongoose from 'mongoose';

export class DeviceToken extends TimeStamps {
    @prop({ type: () => String, required: true, unique: true })
    public token: string;

    @prop({ type: () => mongoose.Types.ObjectId, required: true, ref: 'User' })
    public activatedBy: mongoose.Types.ObjectId;

    @prop({ type: () => String, required: false, default: '' })
    public deviceName: string;

    @prop({ type: () => Boolean, required: true, default: true })
    public active: boolean;
}

export const DeviceTokenModel = getModelForClass(DeviceToken);
export type DeviceTokenDocument = DocumentType<DeviceToken>;
