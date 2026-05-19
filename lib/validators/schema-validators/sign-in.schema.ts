import { z } from "zod"

export const SignInSchema = z.object({
    email: z.string()
        .min(1, {message: "Please enter your email"})    
        .email({
            message: "Please enter a valid email", 
            pattern: z.regexes.html5Email
        }),
    password: z.string()
        .min(1, {message: "Please enter your password"})
});

export type SignInSchemaType = z.infer<typeof SignInSchema>;