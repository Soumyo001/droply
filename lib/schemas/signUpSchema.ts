import * as z from "zod";

export const signUpSchema = z.object({
    email: z
        .string()
        .min(1, {message: "Email is required"})
        .email(),
    password: z
        .string()
        .min(1, {message: "Password is required"})
        .min(8, {message: "Passowrd length minimum 8 characters"}),
    passwordConfirm: z
        .string()
        .min(1, {message: "Please confirm your password"})
}).refine(
    (data) => data.password === data.passwordConfirm,
    {
        message: "Passwords do not match",
        path: ["passwordConfirm"]
    }
);