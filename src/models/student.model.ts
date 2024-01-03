import { Document, Model, Schema, Types, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export enum TaskStatus {
    Pending = "pending",
    Overdue = "overdue",
    Completed = "completed",
}

export interface ITask {
    _id?: Types.ObjectId;
    description: string;
    dueTime: Date;
    status: TaskStatus;
}

export interface IStudent extends Document {
    name: string;
    password: string;
    email: string;
    department: string;
    tasks: Array<ITask>;
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAuthToken(): string;
}

interface IStudentModel extends Model<IStudent> { }

const studentSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        department: {
            type: String,
            required: true,
        },
        tasks: [
            {
                description: { type: String, required: true },
                dueTime: { type: Date, required: true },
                status: {
                    type: String,
                    enum: [TaskStatus.Completed, TaskStatus.Overdue, TaskStatus.Pending],
                    default: TaskStatus.Pending,
                },
            },
        ],
    },
    { timestamps: true },
);

studentSchema.pre<IStudent>("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
});

studentSchema.methods.isPasswordCorrect = async function (password: string) {
    return await bcrypt.compare(password, this.password);
};

studentSchema.methods.generateAuthToken = function () {
    const jwtSecret = process.env.JWT_SECRET || "TGH-Tech-secret-key";
    return jwt.sign({ _id: this._id, email: this.email }, jwtSecret, {
        expiresIn: "10d",
    });
};

export const Student: IStudentModel = model<IStudent, IStudentModel>(
    "Student",
    studentSchema,
);
