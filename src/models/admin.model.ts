import { Document, Model, Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export interface IAdmin extends Document {
    email: string;
    password: string;
    isPasswordCorrect: (password: string | Buffer) => Promise<boolean>;
    generateAuthToken: () => string;
}

interface IAdminModel extends Model<IAdmin> {}

const adminSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            default: "admin@admin.com",
        },
        password: {
            type: String,
            required: true,
            default: "admin",
        },
    },
    { timestamps: true },
);

adminSchema.pre<IAdmin>("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
});

adminSchema.methods.isPasswordCorrect = async function (
    this: IAdmin,
    password: string | Buffer,
) {
    return await bcrypt.compare(password, this.password);
};

adminSchema.methods.generateAuthToken = function (this: IAdmin) {
    const jwtSecret = process.env.JWT_SECRET || "TGH-Tech-secret-key";
    return jwt.sign({ _id: this._id, email: this.email }, jwtSecret, {
        expiresIn: "10d",
    });
};

export const Admin: IAdminModel = model<IAdmin, IAdminModel>(
    "Admin",
    adminSchema,
);
