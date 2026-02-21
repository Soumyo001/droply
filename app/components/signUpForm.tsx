'use client';
import { useForm } from "react-hook-form";
import { useSignUp } from "@clerk/nextjs";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@/lib/schemas/signUpSchema";
import { useState } from "react";
import { useRouter } from "next/router";

type signUpSchemaType = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
    const [verifying, setVerifying] = useState(false);
    const [code, setCode] = useState<string>("");
    const [authError, setAuthError] = useState<string|null>(null);
    const [verifyError, setVerifyError] = useState<string|null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const { signUp, isLoaded, setActive  } = useSignUp();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<signUpSchemaType>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            email: "",
            password: "",
            passwordConfirm: "",
        },
    });

    const onSubmit = async(data: signUpSchemaType) => {
        if(!isLoaded) return;
        setAuthError(null);

        try {
            await signUp.create({
                emailAddress: data.email,
                password: data.password
            });
            await signUp.prepareEmailAddressVerification({strategy: "email_code"});
            setVerifying(true);
        } catch (err: any) {
            setAuthError(err.errors?.[0]?.longMessage ?? "something went wrong");
        }
    }

    const handleVerification = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!isLoaded) return;
        setVerifyError(null);
        setIsVerifying(true);

        try {
            const result = await signUp.attemptEmailAddressVerification({code});
            if(result.status === "complete") {
                await setActive({session: result.createdSessionId});
                router.push("/dashboard");
            } else {
                setVerifyError("Incomplete verification. please try again.");
            }
        } catch (err: any) {
            setVerifyError(err.errors?.[0]?.longMessage ?? "Unknown Error occured. please try again");
        } finally {
            setIsVerifying(false);
        }
    }

    if(verifying) {
        return <h1>Credentials are verifying</h1>
    }

    return <h1>Handling submit</h1>
}