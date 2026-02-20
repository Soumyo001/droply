"use client";
import { useForm } from "react-hook-form";
import { useSignUp } from "@clerk/nextjs";
import { signUpSchema } from "@/lib/schemas/signUpSchema";
import { z } from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { SignupForm } from "./signup-form";

export default function SignUpForm() {
    const [verifying, setVerifying] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [verificationCode, setVerificationCode] = useState<string>("");
    const [verificationError, setVerificationError] = useState<string|null>(null);
    const [authError, setAuthError] = useState<string|null>(null);
    const {signUp, isLoaded, setActive} = useSignUp();
    const router = useRouter();
    type signUpSchemaType = z.infer<typeof signUpSchema>;

    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<signUpSchemaType>({
      resolver: zodResolver(signUpSchema),
      defaultValues: {
        email: "",
        password: "",
        passwordConfirm: "",
      },
    });
    const onSubmit = async (data: signUpSchemaType) => {
        if(!isLoaded) return;
        setIsSubmitting(true);
        setAuthError(null);

        try {
            await signUp.create({
                emailAddress: data.email,
                password: data.password
            });
            await signUp.prepareEmailAddressVerification({
                strategy: "email_code"
            });
            setVerifying(true);
        } catch (error: any) {
            console.log("Signup error: ", error);
            setAuthError(
                error.errors?.[0]?.message
            );
        } finally {
            setIsSubmitting(false);
        }
    }
    const handleVerificationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!isLoaded || !signUp) return;
        setIsSubmitting(true);
        setAuthError(null);

        try {
            const result = await signUp.attemptEmailAddressVerification({
                code: verificationCode
            });
            if(result.status === "complete") {
                await setActive({session: result.createdSessionId});
                router.push("/dashboard");
            } else {
                setVerificationError("Verification incomplete");
            }
        } catch(error: any) {
            setVerificationError(error.errors?.[0]?.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    if(verifying) {
        return (
            <h1>this is OTP entering field</h1>
        )
    }
    return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm md:max-w-4xl">
          <SignupForm />
        </div>
      </div>
    );
}