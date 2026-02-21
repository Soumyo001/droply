'use client';
import { useSignUp } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signUpSchema } from "@/lib/schemas/signUpSchema";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/signup/page.module.css";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { 
    Card,
    CardHeader,
    CardFooter,
    CardContent,
    CardDescription,
    CardTitle 
} from "@/app/components/ui/card";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription
} from "@/app/components/ui/field";

type signUpSchemaType = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const [verifying, setVerifying] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [code, setCode] = useState<string>("");
  const [authError, setAuthError] = useState<string|null>(null);
  const [verificationError, setVerificationError] = useState<string|null>(null);
  const [resendInterval, setResendInterval] = useState(0);
  const { signUp, isLoaded, setActive } = useSignUp();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<signUpSchemaType>({
    resolver: zodResolver(signUpSchema),
    shouldUnregister: false,
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
      setAuthError(err.errors?.[0]?.longMessage ?? `Unknown error occured.error: ${err}.please try again.`);
    }
  }

  const handleVerification = async() => {
    if(!isLoaded) return;
    setVerificationError(null);
    setIsVerifying(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({code});
      if(result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setVerificationError("Verification incomplete. please try again");
        router.refresh();
      }
    } catch (err: any) {
      setVerificationError(err.errors?.[0]?.longMessage ?? `Unknown error occured.error: ${err}.please try again.`);
    } finally {
      setIsVerifying(false);
    }
  }

  const handleResend = async() => {
    if(!isLoaded || resendInterval > 0) return;
    setVerificationError(null);

    try {
        await signUp?.prepareEmailAddressVerification({strategy: "email_code"});
        setResendInterval(60);
        const interval = setInterval(() => {
            setResendInterval(prev => {
                if(prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    } catch (err: any) {
        setVerificationError(err.errors?.[0]?.longMessage ?? "Failed to resend code. please try again");
    }
  }

  if(verifying) {
    return ( 
        <div className={styles.page}>
            <Card className={styles.card}>
                <CardHeader>
                    <CardTitle>Check your email</CardTitle>
                    <CardDescription>We sent a 6-digit code to your email address.</CardDescription>
                </CardHeader>

                <form>
                    <CardContent className="space-y-2.5">
                        <div className="space-y-1.5">
                            <Label htmlFor="code">Verification code</Label>
                            <Input
                                id="code"
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                                value={code ?? ""}
                                onChange={(e)=> setCode(e.target.value)}
                            />
                        </div>
                        {verificationError && 
                            <p className="text-sm text-destructive">
                                {verificationError}
                            </p>
                        }
                    </CardContent>
                </form>
                <CardFooter className="flex flex-col gap-3">
                    <Button
                        type="button"
                        disabled={isVerifying}
                        className={styles.submit_button}
                        onClick={handleVerification}
                    >
                        {isVerifying? "Verifying...": "Verify"}
                    </Button>

                    <p className="text-center text-muted-foreground text-sm">
                        Didn't recive code ?{" "}
                        {resendInterval > 0 ? (
                            <span>{`00:${resendInterval}`}</span>
                        ) : (
                            <a 
                                onClick={handleResend}
                                className="text-foreground hover:underline cursor-pointer"
                            >
                                resend
                            </a>
                        )}
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
  }

    return (
      <div className={styles.page}>
          <Card className={styles.card}>
            <CardHeader>
              <CardTitle>Create an account</CardTitle>
              <CardDescription>Enter your details to get started</CardDescription>
            </CardHeader>
                          
            <CardContent className="space-y-3.5">
              <form onSubmit={handleSubmit(onSubmit)} id="signupform">
                <FieldGroup className="gap-y-3">
                  <Field className="space-y-1.5">
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">
                          {errors.email.message}
                      </p>
                    )}
                  </Field>
                  <Field className="space-y-1.5">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      placeholder="********"
                      {...register("password")}
                    />
                    {errors.password && (
                        <p className="text-sm text-destructive">
                            {errors.password.message}
                        </p>
                    )}
                  </Field>
                  <Field className="space-y-1.5">
                      <FieldLabel htmlFor="passwordConfirm">Confirm Password</FieldLabel>
                      <Input
                        id="passwordConfirm"
                        type="password"
                        placeholder="********"
                        {...register("passwordConfirm")}
                      />
                      {errors.passwordConfirm && (
                        <p className="text-sm text-destructive">
                            {errors.passwordConfirm.message}
                        </p>
                      )}
                  </Field>
                  {authError && 
                    <Field>
                      <p className="text-sm text-destructive">
                          {authError}
                      </p>
                    </Field>
                  }
                  <Field>
                    <div 
                      id="clerk-captcha" 
                      data-cl-theme="dark" 
                      data-cl-size="flexible" 
                      data-cl-language="es-ES" 
                    />
                  </Field>

                  <Field>
                    <Button
                      type="submit"
                      form="signupform"
                      disabled={isSubmitting}
                      className={styles.submit_button}
                    >
                        {isSubmitting? "Creating account..." : "Sign Up"}
                    </Button>
                    
                    <FieldDescription className="text-center text-muted-foreground text-sm">
                      Already have an account ?{" "}
                      <a 
                        href="/login" 
                        className="underline underline-offset-2 hover:text-foreground"
                      >
                        Sign in
                      </a>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
      </div>
    );
}