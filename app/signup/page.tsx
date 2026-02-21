'use client';
import { SignupForm } from "@/app/components/signup-form";
import { useSignUp } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signUpSchema } from "@/lib/schemas/signUpSchema";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";

type signUpSchemaType = z.infer<typeof signUpSchema>;

export default function Page() {
  const [verifying, setVerifying] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [code, setCode] = useState<string>("");
  const [authError, setAuthError] = useState<string|null>(null);
  const [verificationError, setVerificationError] = useState<string|null>(null);
  const { signUp, isLoaded, setActive } = useSignUp();
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
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true);
    } catch (err: any) {
      setAuthError(err.errors?.[0]?.longMessage ?? `Unknown error occured.\n${err}\nplease try again.`);
    }
  }

  const handleVerification = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!isLoaded) return;
    setVerificationError(null);
    setIsVerifying(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({code});
      if(result.status === "complete") {
        await setActive({ session: result.createdUserId });
        router.push("/dashboard");
      }
    } catch (err: any) {
      setVerificationError(err.errors?.[0]?.longMessage ?? `Unknown error occured.\n${err}\nplease try again.`);
    } finally {
      setIsVerifying(false);
    }
  }

  if(verifying) {
    return ( <h1>Is Verifying</h1> );
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  );
}
