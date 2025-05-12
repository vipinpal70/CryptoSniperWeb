import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import AuthLayout from "@/components/AuthLayout";

const completeProfileSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  name: z.string().min(1, { message: "Name is required" }),
  phone: z.string().min(8, { message: "Please enter a valid phone number" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
});

type CompleteProfileValues = z.infer<typeof completeProfileSchema>;

export default function CompleteProfile() {
  const [_, navigate] = useLocation();
  const { completeRegistration, isLoading } = useAuth();
  const { toast } = useToast();
  
  const email = sessionStorage.getItem("signupEmail") || "";
  const name = sessionStorage.getItem("signupName") || "";
  const phone = sessionStorage.getItem("signupPhone") || "";
  
  const form = useForm<CompleteProfileValues>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: {
      email,
      name,
      phone,
      username: "",
      password: "",
      apiKey: "",
      apiSecret: "",
    },
  });
  
  useEffect(() => {
    if (!email) {
      navigate("/signup");
      toast({
        title: "Error",
        description: "Please complete the signup form first",
        variant: "destructive",
      });
    }
  }, [email, navigate, toast]);
  
  async function onSubmit(values: CompleteProfileValues) {
    try {
      await completeRegistration(values);
      
      // Clear session storage
      sessionStorage.removeItem("signupEmail");
      sessionStorage.removeItem("signupName");
      sessionStorage.removeItem("signupPhone");
      
      navigate("/");
    } catch (error) {
      console.error("Profile completion error:", error);
    }
  }
  
  return (
    <AuthLayout>
      <h2 className="text-xl font-medium mb-6">
        Hi, <span className="text-primary">{email}</span>
      </h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Your name" 
                    {...field} 
                  />
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
                  <Input 
                    placeholder="+1 234 567 890" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Choose a username" 
                    {...field} 
                  />
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Create a strong password" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-neutral-700">
                  You need to provide your exchange API keys. This is shown for demo purposes only.
                </p>
              </div>
            </div>
          </div>
          
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exchange API key</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Your exchange API key" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="apiSecret"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exchange Secret key</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Your exchange secret key" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
}
