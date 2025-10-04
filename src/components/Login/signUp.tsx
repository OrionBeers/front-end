import type { SignUpSchema } from "@/lib/ signup.schema";
import signUpSchema from "@/lib/ signup.schema";
import { useAuth } from "@/lib/auth.provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
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

const SignUp = ({
  setShowSignUp,
}: {
  setShowSignUp: (val: boolean) => void;
}) => {
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SignUpSchema>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (values: SignUpSchema) => {
    signUp(values);
  };

  return (
    <Card className='w-[500px] max-w-[90%]'>
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
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
                    className='absolute right-3 top-1/2 -translate-y-1/2'
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
              )}
            />
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <div className='relative'>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder='Confirm password'
                    {...field}
                  />
                  <Button
                    variant='ghost'
                    size='link'
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className='absolute right-3 top-1/2 -translate-y-1/2'
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
              )}
            />
            <Button type='submit'>Submit</Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className='flex flex-col md:flex-row md:justify-between gap-2 border-t border-t-muted-foreground/20 pt-4'>
        <p>
          Already have an account?{" "}
          <Button
            variant='link'
            size='link'
            onClick={() => setShowSignUp(false)}
          >
            Log in
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
};

export default SignUp;
