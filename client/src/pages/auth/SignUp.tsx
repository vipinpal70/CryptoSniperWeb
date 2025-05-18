import React from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import AuthLayout from "@/components/AuthLayout";
import { Eye, EyeOff } from "lucide-react";
import { log } from "node:console";
import { supabase } from "@/lib/supabase";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const signUpSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  name: z.string().min(1, { message: "Name is required" }),
  phone: z.string()
  .min(10, { message: "Please enter a valid phone number" })
  .max(10, { message: "Please enter a valid phone number" }),
  password: z.string().min(8, { message: "Please enter a valid password number" }),
});

type SignUpValues = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const [_, navigate] = useLocation();
  const { signup, signInWithGoogle, isLoading } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      phone: "",
    },
  });

  async function onSubmit(values: SignUpValues) {
    console.log("otp verification code testing");

    try {
      // const verifyResponse = await apiRequest("POST", "/api/auth/signup", {
      //   email: values.email,
      // });

      // if (verifyResponse?.message === "OTP sent successfully") {
      //   // Save details in sessionStorage for future steps
      sessionStorage.setItem("signupEmail", values.email);
      sessionStorage.setItem("signupName", values.name);
      sessionStorage.setItem("signupPhone", values.phone);
      // sessionStorage.setItem("signupPassword",values.password)
        
      // }

      await signup(values.email, values.password)
      await new Promise(resolve => setTimeout(resolve, 5));
      const user_dict = {
      "name": values.name,
      "email": values.email,
      "phone": values.phone,
      "password": values.password,
      "status": "pending",
      "referral_code": "",
      "invited_by": "",
      "referral_count": 0,
      "broker_name": ""
    };

    const completeResponse = await apiRequest("POST", "/api/auth/complete-profile", user_dict);
    if (completeResponse?.message === "Registration completed successfully") {
      console.log("Profile completed successfully");
      const profileCompletedKey = `profile_completed_${values.email}`;
      localStorage.setItem(profileCompletedKey, 'true');
    }

    

    navigate("/verify-otp");


    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        title: "Error",
        description: error as string,
        variant: "destructive",
      });
    }
  }

  const handleGoogleSignIn = async () => {
    console.log('handleGoogleSignIn calling...');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/home`,
        },
      });

      if (error) {
        console.error("Google sign-in error:", error.message);
      }
    } catch (error) {
      console.error("Google sign-in exception:", error);
    }
  };

  // const handleGoogleSignIn = async () => {
  //   console.log('auth calling...');
  //   try {
  //     // await signInWithGoogle();

  //     const { data, error } = await supabase.auth.signInWithOAuth({
  //       provider: "google",
  //     });

  //     if (error) {
  //       console.error("Google sign-in error:", error.message);
  //     } else {
  //       console.log("Redirecting to Google data fetched", data);
  //       navigate("/");
  //     }
  //   } catch (error) {
  //     console.error("Google sign-in error:", error);
  //   }
  // };

  return (
    <AuthLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">Sign up</h1>
        <p className="text-sm text-neutral-600">
          Already an account?{" "}
          <a href="/signin" className="text-primary font-medium block text-end">
            Sign in
          </a>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enter your Email id</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+91 XXX-XX-YY-YYY" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enter Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...field}
                      className="pr-10"
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending OTP..." : "Send OTP"}
          </Button>

          <div className="relative flex items-center justify-center">
            <span className="flex-shrink mx-4 text-neutral-400 text-sm">
              or
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
}
