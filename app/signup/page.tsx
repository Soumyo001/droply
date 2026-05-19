'use client'
import { 
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card"
import { 
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel
} from "@/components/ui/field"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SignUpSchema, SignUpSchemaType } from "@/lib/validators/schema-validators/sign-up.schema"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSignUp } from "@clerk/nextjs/legacy"
import { toast } from "sonner"


const Signup = () => {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState<boolean>(false);
    const [authError, setAuthError] = useState<string|null>(null);
    const [code, setCode] = useState<string>("");
    const [verifying, setVerifying] = useState<boolean>(false);
    const [isVerifying, setIsVerifying] = useState<boolean>(false);
    const [verificationError, setVerificationError] = useState<string|null>(null);
    const [resendInterval, setResendInterval] = useState<number>(0);
    const { signUp, isLoaded, setActive } = useSignUp();
    const {
        register,
        handleSubmit,
        formState: {errors, isSubmitting},
    } = useForm<SignUpSchemaType>({
        resolver: zodResolver(SignUpSchema),
        defaultValues: {
            email: "",
            password: "",
            passwordConfirm: ""
        }
    });
    
    const onSubmit = async(data: SignUpSchemaType) => {
        if(!isLoaded) return;
        setAuthError(null);
        try {
            await signUp.create({emailAddress: data.email, password: data.password });
            await signUp.prepareEmailAddressVerification({strategy: "email_code"});
            setVerifying(true);
        } catch (err: any) {
            setAuthError(err.errors?.[0]?.longMessage ?? `Unknown error occured: ${err.message}`)
        }
    }

    const handleVerification = async() => {
        if(!isLoaded) return;
        setVerificationError(null);
        setIsVerifying(true);
        try {
            const result = await signUp.attemptEmailAddressVerification({code});
            if(result.status === "complete") {
                await setActive({session: result.createdSessionId});
                // post verification sync
                await toast.promise(
                    fetch('/api/user', {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({email: signUp.emailAddress})
                    }).then(async res => {
                        const body = await res.json();
                        if(!res.ok) throw new Error(body.message);
                        return body.message;
                    }),
                    {
                        loading: "syncing your account...",
                        success: data => data,
                        error: (err: Error) => err.message ?? `Failed to sync your account. you can retry on next login`
                    }
                );
            } else {
                setVerificationError("Verification failed. Please try again");
            }
        } catch (err: any) {
            setVerificationError(err.errors?.[0]?.longMessage ?? `Unknown error occured: ${err.message}`);
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
            setVerificationError(err.errors?.[0]?.longMessage ?? `Unknown error occured: ${err.message}`);
        }
    }

    if(verifying) {
        return (
            <div className="flex flex-col justify-center items-center w-full min-h-dvh px-10 max-sm:px-5 py-5">
                <Card className="max-w-md w-full max-sm:max-w-sm">
                    <CardHeader>
                        <CardTitle>Verification</CardTitle>
                        <CardDescription>Enter the code to verify</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="code">code</FieldLabel>
                                <Input
                                    id="code"
                                    type="text"
                                    maxLength={6}
                                    placeholder="Enter your 6-digit code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    required
                                />
                            </Field>
                            {verificationError && <Field>
                                <p className="text-sm text-destructive text-left">
                                    {verificationError}
                                </p>
                            </Field>}
                            <Field>
                                <Button
                                    type="button"
                                    variant={"outline"}
                                    onClick={handleVerification}
                                    disabled={isVerifying}
                                >
                                    {isVerifying? "Verifying...":"Verify"}
                                </Button>
                                <FieldDescription className="text-sm text-muted-foreground text-center">
                                    Didn't recive code yet?{" "}
                                    {resendInterval > 0? (
                                        <span>{`00:${String(resendInterval).padStart(2,"0")}`}</span>
                                    ):(
                                        <a
                                            onClick={handleResend}
                                            className="underline underline-offset-1 hover:text-primary cursor-pointer"
                                        >
                                            resend
                                        </a>
                                    )}
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
      <div className='flex flex-col justify-center items-center w-full min-h-dvh px-10 max-sm:px-5 py-5'>
          <Card className="max-w-md w-full max-sm:max-w-sm">
              <CardHeader>
                  <CardTitle>Signup</CardTitle>
                  <CardDescription>Provide the details to creat your account</CardDescription>
              </CardHeader>
              <CardContent>
                  <form id="signup-form" onSubmit={handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <Input
                                {...register("email")}
                                id="email"
                                type="email"
                                placeholder="example@gmail.com"
                                required
                            />
                            {errors.email && <p className="text-sm text-destructive">
                                {errors.email.message}
                            </p>}
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="password">Password</FieldLabel>
                            <div className="relative w-full">
                                <Input
                                    {...register("password")}
                                    id="password"
                                    type={showPassword? "text":"password"}
                                    placeholder="* * * * * * * *"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-none text-muted-foreground cursor-pointer"
                                >
                                    {showPassword
                                        ? <Eye className="w-4 h-4" data-darkreader-ignore/>
                                        : <EyeOff className="w-4 h-4" data-darkreader-ignore/>}
                                </button>
                            </div>
                            {errors.password && <p className="text-sm text-destructive">
                                {errors.password.message}
                            </p>}
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="passwordConfirm">Passowrd Confirm</FieldLabel>
                            <div className="relative w-full">
                                <Input
                                    {...register("passwordConfirm")}
                                    id="passwordConfirm"
                                    type={showPasswordConfirm? "text":"password"}
                                    placeholder="* * * * * * * *"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordConfirm(prev => !prev)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-none text-muted-foreground cursor-pointer"
                                >
                                    {showPasswordConfirm
                                            ? <Eye className="w-4 h-4"/>
                                            : <EyeOff className="w-4 h-4"/>}
                                </button>
                            </div>
                            {errors.passwordConfirm && <p className="text-sm text-destructive">
                                {errors.passwordConfirm.message}
                            </p>}
                        </Field>
                        {authError && <Field>
                            <p className="text-sm text-destructive text-left">
                                {authError}
                            </p>
                        </Field>}
                        <Field>
                            <div 
                                id="clerk-captcha" 
                                data-cl-theme="dark" 
                                data-cl-size="flexible" 
                                data-cl-language="en-us"
                            />
                            <Button
                                type="submit"
                                form="signup-form"
                                variant={"outline"}
                                disabled={isSubmitting}
                            >
                                {isSubmitting? "Creating account...":"Signup"}
                            </Button>
                            <FieldDescription className="text-sm text-center text-muted-foreground">
                                Already have an account ?{" "}
                                <a 
                                    href="/login"
                                    className="underline underline-offset-1 hover:text-primary"
                                >
                                    login
                                </a>
                            </FieldDescription>
                        </Field>
                    </FieldGroup>
                  </form>
              </CardContent>
          </Card>
      </div>
    )
}

export default Signup