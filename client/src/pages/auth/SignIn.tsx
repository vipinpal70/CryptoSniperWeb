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
import { Checkbox } from "@/components/ui/checkbox";
import AuthLayout from "@/components/AuthLayout";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().optional(),
});

type SignInValues = z.infer<typeof signInSchema>;

export default function SignIn() {
  const [_, navigate] = useLocation();
  const { signin, signInWithGoogle, setCustomUser } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });



  // const handleGoogleSignIn = async () => {
  //   console.log('handleGoogleSignIn calling...');

  //   try {
  //     const { data, error } = await supabase.auth.signInWithOAuth({
  //       provider: "google",
  //       options: {
  //         redirectTo: `${window.location.origin}`,
  //       },

  //     });

  //     console.log('Supabase fetched data', data);

  //     if (error) {
  //       console.error("Google sign-in error:", error.message);
  //     }
  //   } catch (error) {
  //     console.error("Google sign-in exception:", error);
  //   }
  // };

  const handleGoogleSignIn = async () => {
    console.log('handleGoogleSignIn calling...');

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
          skipBrowserRedirect: false, // Ensure browser redirects to OAuth provider
          queryParams: {
            prompt: 'select_account', // This forces the account selection popup
            access_type: 'offline'    // Request refresh token too
          }
        }
      });

      console.log('Supabase fetched data', data);

      if (error) {
        console.error("Google sign-in error:", error.message);
      }
    } catch (error) {
      console.error("Google sign-in exception:", error);
    }
  };


  async function onSubmit(values: SignInValues) {
    try {
      // Set loading state to true when starting the submission
      setIsLoading(true);
      
      // First try to authenticate with Supabase
      try {
        // Attempt Supabase authentication
        const { data, error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password
        });
        
        if (error) {
          console.log("Supabase authentication failed, trying custom backend...");
          // If Supabase auth fails, we'll try the custom backend below
          throw error;
        }
        
        if (data.session) {
          // Supabase auth succeeded
          console.log("Supabase authentication successful");
          
          // Add a small delay to ensure auth state is fully propagated
          setTimeout(() => {
            navigate("/");
          }, 500);
          return;
        }
      } catch (supabaseError) {
        // Supabase authentication failed, continue to custom backend
        console.log("Falling back to custom backend authentication");
      }
      
      // If Supabase auth failed, try custom backend authentication
      try {
        // Make a direct request to your custom backend authentication endpoint
        const response = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: values.email,
            password: values.password
          }),
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Backend authentication failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success || data.token) {
          console.log("Custom backend authentication successful", data);
          
          // Use the setCustomUser function from the auth context to set the user
          setCustomUser(data);
          
          // For users authenticated with the custom backend,
          // create a corresponding Supabase account to keep systems in sync
          try {
            // First check if user already exists in Supabase
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: values.email,
              password: values.password
            });
            
            if (signUpError && !signUpError.message.includes('already exists')) {
              console.warn("Failed to create Supabase account for existing user", signUpError);
            }
            
            // Try to sign in with Supabase again
            const { data: signInData } = await supabase.auth.signInWithPassword({
              email: values.email,
              password: values.password
            });
            
            // Navigate to home page with a delay to ensure auth state is updated
            setTimeout(() => {
              navigate("/");
            }, 500);
          } catch (syncError) {
            console.warn("Error syncing authentication systems", syncError);
            // Still navigate to home since backend auth succeeded
            setTimeout(() => {
              navigate("/");
            }, 500);
          }
        } else {
          throw new Error("Authentication failed");
        }
      } catch (backendError) {
        console.error("Backend authentication error:", backendError);
        throw backendError;
      }
    } catch (error) {
      console.error("Sign in error:", error);
      // Reset loading state on error
      setIsLoading(false);
    } finally {
      // Ensure loading state is reset even if there's an uncaught exception
      // We don't reset here if authentication was successful to avoid button flicker during navigation
      // The loading state will be reset when the component unmounts
    }
  }



  return (
    <AuthLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-neutral-600">
          Don't have an account?{" "}
          <a href="/signup" className="text-primary font-medium">
            Sign up
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
                <FormLabel>Your email id/ client id</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
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
                <div className="flex justify-between items-center mb-1">
                  <FormLabel>Password</FormLabel>
                  <a href="#" className="text-sm text-primary">
                    Forgot password?
                  </a>
                </div>
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-sm cursor-pointer">
                  Remember me
                </FormLabel>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Continue"}
          </Button>

          <div className="relative flex items-center justify-center">
            <span className="flex-shrink mx-4 text-neutral-400 text-sm">or</span>
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
