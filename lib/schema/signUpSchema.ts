import * as z from "zod";

export const signUpSchema = z.object({
    email: z.string()
        .min(1, {message: "Please provide the email address"})
        .email({message: "Invalid email. please try again"}),
    password: z.string()
        .min(1, {message: "Please enter password"})
        .min(8, {message: "Password must be minimum 8 characters"}),
    passwordConfirm: z.string()
        .min(1, {message: "Please confirm your password"})
}).refine(
    (data) => (data.password === data.passwordConfirm),
    {
        message: "Passwords do not match",
        path:  ["passwordConfirm"]
    }
);