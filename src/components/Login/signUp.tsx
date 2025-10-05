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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
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
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder='Email' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <div className='relative'>
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder='Password'
                        {...field}
                      />
                    </FormControl>
                    <Button
                      variant='ghost'
                      size='link'
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className='absolute right-3 top-1/2 -translate-y-1/2'
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <div className='relative'>
                    <FormControl>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder='Confirm password'
                        {...field}
                      />
                    </FormControl>
                    <Button
                      variant='ghost'
                      size='link'
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className='absolute right-3 top-1/2 -translate-y-1/2'
                    >
                      {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
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
