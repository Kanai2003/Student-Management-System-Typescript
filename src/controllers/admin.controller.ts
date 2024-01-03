import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { ITask, Student, TaskStatus } from "../models/student.model";
import { Admin } from "../models/admin.model";

interface AdminRegisterRequest extends Request {
    body: {
        email: string;
        password: string;
    };
}

interface AdminLoginRequest extends Request {
    body: {
        email: string;
        password: string;
    };
}

interface AddStudentRequest extends Request {
    body: {
        name: string;
        email: string;
        department: string;
        password: string;
    };
}

interface AddTaskRequest extends Request {
    body: {
        studentId: string;
        description: string;
        dueTime: Date;
    };
}

const adminRegister = asyncHandler(
    async (req: AdminRegisterRequest, res: Response) => {
        const { email, password } = req.body;

        const newAdmin = await Admin.create({ email, password });
        const createdAdmin = await Admin.findById(newAdmin._id).select(
            "-password",
        );

        if (!createdAdmin) {
            throw new ApiError(500, "Something went wrong while creating user");
        }

        return res
            .status(201)
            .json(
                new ApiResponse(200, createdAdmin, "User created successfully"),
            );
    },
);

const adminLogin = asyncHandler(
    async (req: AdminLoginRequest, res: Response) => {
        const { email, password } = req.body;

        if (!(email && password)) {
            throw new ApiError(400, "Email and Password is required");
        }

        const admin = await Admin.findOne({ email });

        if (!admin) {
            throw new ApiError(400, "Admin not found");
        }

        const isPasswordMatched = await admin.isPasswordCorrect(password);

        if (!isPasswordMatched) {
            throw new ApiError(400, "Wrong password");
        }

        const loggedInAdmin = await Admin.findById(admin._id).select(
            "-password",
        );

        if (!loggedInAdmin) {
            throw new ApiError(500, "Something went wrong while logging in");
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        };

        return res
            .status(200)
            .cookie("token", loggedInAdmin.generateAuthToken(), options)
            .json(
                new ApiResponse(
                    200,
                    { admin: loggedInAdmin },
                    "Admin logged in successfully",
                ),
            );
    },
);

const addStudent = asyncHandler(
    async (req: AddStudentRequest, res: Response) => {
        const { name, email, department, password } = req.body;
        // fix
        if (!(name && email && department && password)) {
            throw new ApiError(400, "All fields are required");
        }

        const newStudent = await Student.create({
            name,
            email,
            department,
            password,
        });

        const createdStudent = await Student.findById(newStudent._id).select(
            "-password",
        );
        if (!createdStudent) {
            throw new ApiError(500, "Something went wrong while creating user");
        }

        return res
            .status(201)
            .json(
                new ApiResponse(
                    200,
                    createdStudent,
                    "User created successfully",
                ),
            );
    },
);

const addTaskToOneStudent = asyncHandler(
    async (req: AddTaskRequest, res: Response) => {
        const { studentId, description, dueTime } = req.body;
        if (!(studentId && description && dueTime)) {
            throw new ApiError(400, "All fields are required");
        }

        const student = await Student.findById(studentId);

        if (!student) {
            throw new ApiError(400, "Student not found");
        }

        const newTask: ITask = {
            description,
            dueTime,
            status: TaskStatus.Pending,
        };

        student.tasks.push(newTask);
        await student.save();

        return res
            .status(201)
            .json(new ApiResponse(200, student, "Task added successfully"));
    },
);

const addTaskToAllStudent = asyncHandler(
    async (req: Request, res: Response) => {
        const { description, dueTime } = req.body;
        if (!(description && dueTime)) {
            throw new ApiError(400, "All fields are required");
        }

        const students = await Student.find();

        for (const student of students) {
            const newTask: ITask = {
                description,
                dueTime,
                status: TaskStatus.Pending,
            };
            student.tasks.push(newTask);
            await student.save();
        }

        return res
            .status(201)
            .json(new ApiResponse(200, students, "Task added successfully"));
    },
);

export {
    adminLogin,
    adminRegister,
    addStudent,
    addTaskToOneStudent,
    addTaskToAllStudent,
};
