import { RequestHandler } from "express";
import { StudentRequest } from "../controllers/student.controller";

const asyncHandler = (
    requestHandler: RequestHandler<any, any, any, any>,
): RequestHandler => {
    return (req: StudentRequest, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error) =>
            next(error),
        );
    };
};

export { asyncHandler };
