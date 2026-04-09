import { DocumentType, getModelForClass, pre, prop } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import bcrypt from 'bcrypt';

export enum UserRoles {
    ADMIN = 'admin',
    USER = 'user',
    SUDO_ADMIN = 'sudo-admin',
}

@pre<User>('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
})
export class User extends TimeStamps {
    @prop({ type: () => String, required: true, unique: true })
    public email: string;

    @prop({ type: () => String, required: true })
    public name: string;

    @prop({ type: () => String, required: true, select: false })
    public password: string;

    @prop({ type: () => String, required: true, enum: UserRoles, default: UserRoles.USER })
    public role: UserRoles;

    @prop({ type: () => Number, required: true, default: 0 })
    public balance: number;

    @prop({ type: () => String, required: true, default: 'DKK' })
    public currency: string;

    @prop({ type: () => Number, required: true, default: 0 })
    public tokenVersion: number;

    @prop({ type: () => String, required: false, default: '' })
    public avatarUrl: string;

    @prop({ type: () => Buffer, select: false })
    public avatarData?: Buffer;

    @prop({ type: () => String, select: false })
    public avatarMimeType?: string;

    // Method to compare password
    public async comparePassword(candidatePassword: string): Promise<boolean> {
        return await bcrypt.compare(candidatePassword, this.password);
    }
}

export const UserModel = getModelForClass(User);
export type UserDocument = DocumentType<User>;
