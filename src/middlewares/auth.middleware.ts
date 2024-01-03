import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import jwt from "jsonwebtoken";
import { Admin, IAdmin } from "../models/admin.model";
import { Student, IStudent } from "../models/student.model";

interface CustomRequest extends Request {
    admin?: IAdmin;
    student?: IStudent;
}

export const verifyAdmin = asyncHandler(
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const token =
            req.cookies.token ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized");
        }

        const decodedToken = jwt.verify(
            token,
            process.env.JWT_SECRET || "TGH-Tech-secret-key",
        ) as { _id: string };

        const admin = await Admin.findById(decodedToken._id);

        if (!admin) {
            throw new ApiError(401, "Unauthorized");
        }

        req.admin = admin;

        next();
    },
);

export const verifyStudent = asyncHandler(
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const token =
            req.cookies.token ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized");
        }

        const decodedToken = jwt.verify(
            token,
            process.env.JWT_SECRET || "TGH-Tech-secret-key",
        ) as { _id: string };

        const student = await Student.findById(decodedToken._id);

        if (!student) {
            throw new ApiError(401, "Unauthorized");
        }

        req.student = student;

        next();
    },
);
