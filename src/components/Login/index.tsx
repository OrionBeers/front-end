import google from "@/assets/google-logo.png";
import { useAuth } from "@/lib/auth.provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { LoginSchema } from "../../lib/login.schema";
import loginSchema from "../../lib/login.schema";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Form, FormField } from "../ui/form";
import { Input } from "../ui/input";
import SignUp from "./signUp";

const Login = () => {
  const { login } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginSchema>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginSchema) => {
    login({
      type: "credentials",
      credentials: values,
    });
  };

  if (showSignUp) {
    return <SignUp setShowSignUp={setShowSignUp} />;
  }

  return (
    <Card className='w-[500px] max-w-[90%]'>
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col gap-4 w-full'
          >
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => <Input placeholder='Email' {...field} />}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <div className='relative'>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder='Password'
                    {...field}
                  />
                  <Button
                    variant='ghost'
                    size='link'
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
              )}
            />
            <Button type='submit'>Submit</Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className='flex flex-col md:flex-row md:justify-between gap-2 border-t border-t-muted-foreground/20 pt-4'>
        <Button
          variant='secondary'
          onClick={() => {
            login({ type: "google" });
          }}
        >
          <img
            src={google}
            alt='Google Logo'
            className='w-5 h-5 mr-1'
            width={20}
            height={20}
          />
          Login with Google
        </Button>
        <p>
          Don't have an account?{" "}
          <Button
            variant='link'
            size='link'
            onClick={() => setShowSignUp(true)}
          >
            Sign up
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
};

export default Login;
