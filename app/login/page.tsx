'use client'
import { 
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription
} from "@/components/ui/card"
import { 
    Field,
    FieldGroup,
    FieldLabel,
    FieldDescription
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { useForm } from "react-hook-form"
import { useSignIn } from "@clerk/nextjs/legacy"
import { SignInSchema, SignInSchemaType } from "@/lib/validators/schema-validators/sign-in.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { toast } from "sonner"

 const Login = () => {
    const [showPassword, setShowPassword] = useState<boolean>(false); 
    const [authError, setAuthError] = useState<string|null>(null);
    const { signIn, isLoaded, setActive } = useSignIn();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<SignInSchemaType>({
        resolver: zodResolver(SignInSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });

    const onSubmit = async (data: SignInSchemaType) => {
        if(!isLoaded) return;

        setAuthError(null);
        try {
            const result = await signIn.create({identifier: data.email, password: data.password});
            if(result.status === "complete") {
                await setActive({session: result.createdSessionId});
                const res = await fetch('/api/user', { cache: 'no-store' });
                // sync-on-404
                if(res.status === 404) {
                    toast.warning("Warning! user account not synced");
                    await toast.promise(
                        fetch('/api/user', {
                            method: "POST",
                            headers: {"Content-Type": "application/json"},
                            body: JSON.stringify({email: signIn.identifier})
                        }).then(async res => {
                            const body = await res.json();
                            if(!res.ok) throw new Error(body.message);
                            return body.message;
                        }),
                        {
                            loading: "syncing your account...",
                            success: data => data,
                            error: (err: Error) => err.message ?? "Sync failed. you can retry on next login"
                        }
                    );
                } else if(!res.ok) {
                    const body = await res.json();
                    toast.error(body.message);
                }
            } else {
                setAuthError(`Login failed. Please try again. Status: ${result.status}`);
            }
        } catch (err: any) {
            setAuthError(err.errors?.[0]?.longMessage ?? `Unknown error occured: ${err.message}`);
        }
    }

    return (
      <div className="flex flex-col justify-center items-center w-full min-h-dvh p-10 max-sm:p-5">
          <Card className="max-w-md w-full max-sm:max-w-sm">
              <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>
                      Provide your credentials to enter the site
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <form id="login-form" onSubmit={handleSubmit(onSubmit)}>
                      <FieldGroup>
                            <Field data-invalid={!!errors.email}>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    {...register("email")}
                                    id="email"
                                    type="email"
                                    placeholder="example@gmail.com"
                                    required
                                />
                                {errors.email && <p className="text-destructive text-sm">
                                    {errors.email.message}
                                </p>}
                            </Field>
                            <Field data-invalid={errors.password? true:false}>
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
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer bg-none"
                                    >
                                        {showPassword 
                                        ? <EyeOff className="w-5 h-5" data-darkreader-ignore/>
                                        : <Eye className="w-5 h-5" data-darkreader-ignore/>}
                                    </button>
                                </div>
                                {errors.password && <p className="text-sm text-destructive">
                                    {errors.password.message}
                                </p>}
                            </Field>
                            {authError && <Field>
                                <p className="text-sm text-destructive text-left">
                                    {authError}
                                </p>
                            </Field>}
                            <Field>
                                <Button
                                    type="submit"
                                    form="login-form"
                                    variant={"outline"}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting? "Authenticating...":"Login"}
                                </Button>
                                <FieldDescription className="text-center text-muted-foreground">
                                    Don't have an account ?{" "}
                                    <a
                                        href="/signup"
                                        className="cursor-pointer underline underline-offset-1 hover:text-primary"
                                    >
                                        Signup
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

export default Login