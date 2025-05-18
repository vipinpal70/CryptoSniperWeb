import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "./supabase"; // <-- Make sure this file exports the initialized client
import { User as SupabaseUser } from "@supabase/supabase-js";
import { error } from "console";

interface AuthContextType {
  user: SupabaseUser | null;
  isLoading: boolean;
  error: string | null;
  signin: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  updateUserPhone: (phone: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  signout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) console.error(error);
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error("Sign in error:", error.message);
      setError(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Signed in successfully",
      });
    }
    setIsLoading(false);
  };

  const signup = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      console.error("Sign up error:", error.message);
      setError(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Signup successful. Check your email for confirmation.",
      });
    }
    setIsLoading(false);
  };

  const verifyOtp = async (email: string, otp: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Verify the OTP using Supabase or API call
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup'
      });

      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "OTP verified successfully",
      });
      
      return true;
    } catch (error: any) {
      setError(error.message || "Failed to verify OTP");
      toast({
        title: "Error",
        description: error.message || "Failed to verify OTP",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateUserPhone = async (phone: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First check if the user is logged in
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session?.user) {
        throw new Error("User not authenticated");
      }
      
      // Update the user's phone number in the user metadata
      const { data, error } = await supabase.auth.updateUser({
        data: { phone: phone }
      });
      
      if (error) {
        throw error;
      }
      
      // Update the local user state
      if (data?.user) {
        setUser(data.user);
      }
      
      toast({
        title: "Success",
        description: "Phone number updated successfully",
      });
      
      return true;
    } catch (error: any) {
      setError(error.message || "Failed to update phone number");
      toast({
        title: "Error",
        description: error.message || "Failed to update phone number",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error("Google sign-in error:", error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const signout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out error:", error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setUser(null);
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        error,
        signin,
        signup,
        signout,
        verifyOtp,
        signInWithGoogle,
        updateUserPhone,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
