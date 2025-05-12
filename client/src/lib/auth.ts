import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "./queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signin: (email: string, password: string) => Promise<void>;
  signup: (email: string, phone: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  completeRegistration: (userData: any) => Promise<void>;
  signout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/user", {
          credentials: "include",
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await apiRequest("POST", "/api/auth/signin", { email, password });
      const data = await res.json();

      setUser(data.user);
      toast({
        title: "Success",
        description: "You've been successfully signed in",
      });
    } catch (error: any) {
      console.error("Sign in error:", error);
      setError(error.message || "Failed to sign in");
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, phone: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await apiRequest("POST", "/api/auth/signup", { email, phone });
      
      toast({
        title: "Success",
        description: "OTP has been sent to your email",
      });
    } catch (error: any) {
      console.error("Sign up error:", error);
      setError(error.message || "Failed to sign up");
      toast({
        title: "Error",
        description: error.message || "Failed to sign up",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await apiRequest("POST", "/api/auth/verify-otp", { email, otp });
      
      toast({
        title: "Success",
        description: "OTP verified successfully",
      });
    } catch (error: any) {
      console.error("OTP verification error:", error);
      setError(error.message || "Failed to verify OTP");
      toast({
        title: "Error",
        description: error.message || "Failed to verify OTP",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const completeRegistration = async (userData: any) => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await apiRequest("POST", "/api/auth/complete-registration", userData);
      const data = await res.json();

      setUser(data.user);
      toast({
        title: "Success",
        description: "Registration completed successfully",
      });
    } catch (error: any) {
      console.error("Registration completion error:", error);
      setError(error.message || "Failed to complete registration");
      toast({
        title: "Error",
        description: error.message || "Failed to complete registration",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await apiRequest("POST", "/api/auth/signout", {});

      setUser(null);
      toast({
        title: "Success",
        description: "You've been successfully signed out",
      });
    } catch (error: any) {
      console.error("Sign out error:", error);
      setError(error.message || "Failed to sign out");
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    signin,
    signup,
    verifyOtp,
    completeRegistration,
    signout,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
