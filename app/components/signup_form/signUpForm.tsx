'use client';
import { useSignUp } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signUpSchema } from "@/lib/schemas/signUpSchema";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/components/signup_form/signup.module.css";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { 
    Card,
    CardHeader,
    CardFooter,
    CardContent,
    CardDescription,
    CardTitle 
} from "../ui/card";

type signUpSchemaType = z.infer<typeof signUpSchema>;

export default function SignupForm() {
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
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setVerificationError("Verification incomplete. please try again");
        router.refresh();
      }
    } catch (err: any) {
      setVerificationError(err.errors?.[0]?.longMessage ?? `Unknown error occured.\n${err}\nplease try again.`);
    } finally {
      setIsVerifying(false);
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

                <form onSubmit={handleVerification} id="verificationForm">
                    <CardContent>
                        <div className="space-y-1.5">
                            <Label htmlFor="code">Verification code</Label>
                            <Input
                                id="code"
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                                value={code}
                                onChange={(e)=> setCode(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </form>
                <CardFooter>
                    <Button
                        type="button"
                    >
                        Verify
                    </Button>
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
    
              <form onSubmit={handleSubmit(onSubmit)} id="signupform">
                  <CardContent className="space-y-3.5">
                      <div className="space-y-1.5">
                          <Label>Email</Label>
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
                      </div>
                      <div className="space-y-1.5">
                          <Label>Password</Label>
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
                      </div>
                      <div className="space-y-1.5">
                          <Label>Confirm Password</Label>
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
                      </div>
                      <div 
                          id="clerk-captcha" 
                          data-cl-theme="dark" 
                          data-cl-size="flexible" 
                          data-cl-language="es-ES" 
                      />
                  </CardContent>
              </form>
              <CardFooter className="flex flex-col gap-3">
                  <Button
                      type="submit"
                      form="signupform"
                      disabled={isSubmitting}
                      className={styles.submit_button}
                  >
                      {isSubmitting? "Creating account..." : "Sign Up"}
                  </Button>
                        
                  <p className="text-center text-muted-foreground text-sm">
                      Already have an account ?{" "}
                      <a 
                          href="/login" 
                          className="text-foreground hover:underline"
                      >
                          sign in
                      </a>
                  </p>
              </CardFooter>
          </Card>
      </div>
    );
}