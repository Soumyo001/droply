'use client';
import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/app/components/ui/field";
import { Input } from "@/app/components/ui/input";
import { z } from "zod";
import { useSignIn } from "@clerk/nextjs";
import { signInSchema } from "@/lib/schemas/signInSchema";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

type signInSchemaType = z.infer<typeof signInSchema>;
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [authError, setAuthError] = useState<string|null>(null);
  const { signIn, isLoaded, setActive } = useSignIn();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<signInSchemaType>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: ""
    }
  });

  const onSubmit = async(data: signInSchemaType) => {
    if(!isLoaded) return;
    setAuthError(null);

    try {
      const result = await signIn.create({
        identifier: data.identifier,
        password: data.password
      });
      if(result.status === "complete") {
        await setActive({session: result.createdSessionId});
        router.push("/dashboard");
      } else {
        setAuthError("Authentication failed. please try again");
        router.refresh();
      }
    } catch (err: any) {
      setAuthError(err.errors?.[0]?.longMessage ?? `Unknown error occured. error: ${err}`);
    }

  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("identifier")}
                  required
                />
                {errors.identifier && 
                  <p className="text-sm text-destructive">
                    {errors.identifier.message}
                  </p>
                }
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-1 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="********"
                  {...register("password")}
                  required 
                />
                {errors.password && 
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                }
              </Field>
              {authError && 
                <Field>
                  <p className="text-sm text-destructive">{authError}</p>
                </Field>
              }
              <Field>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="transition-all duration-200 active:translate-y-0 hover:-translate-y-1 w-full"
                >
                  {isSubmitting? "Authenticating...":"Login"}
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <a 
                    href="/signup"
                    className="underline underline-offset-2 hover:text-foreground"
                  >
                    Sign up
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
