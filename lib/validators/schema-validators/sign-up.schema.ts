import { z } from "zod"

export const SignUpSchema = z.object({
    email: z.string()
        .min(1, {message: "Email is required"})
        .email({
            message: "Please enter a valid email",
            pattern: z.regexes.html5Email
        }),
    password: z.string()
            .min(1, {message: "Password is required"})
            .min(8, {message: "Password must be at least 8 characters"})
            .regex(/[A-Z]/, "Must contain one uppercase letter")
            .regex(/[a-z]/, "Must contain one lowercase letter")
            .regex(/[0-9]/, "Must contain one number")
            .regex(/[!@#$%^&*(),.?":{}|<>]/, "Must contain special character"),
    passwordConfirm: z.string()
            .min(1, {message: "Please re-enter your password"})
}).refine(
    data => data.password === data.passwordConfirm,
    {
        message: "Passwords do not match",
        path: ["passwordConfirm"]
    }
);

export type SignUpSchemaType = z.infer<typeof SignUpSchema>;