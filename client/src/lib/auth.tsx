import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "./supabase"; // <-- Make sure this file exports the initialized client
import { User as SupabaseUser } from "@supabase/supabase-js";
import { error } from "console";

interface AuthContextType {
  user: SupabaseUser | null;
  isLoading: boolean;
  error: string | null;
  signin: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  updateUserPhone: (phone: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  signout: () => Promise<void>;
  // Custom backend authentication
  setCustomUser: (userData: any) => void;
  hasCustomAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCustomAuth, setHasCustomAuth] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const getSession = async () => {
      // Check for custom authentication first
      const hasCustomAuthStored = localStorage.getItem('has_custom_auth') === 'true';
      const authToken = localStorage.getItem('auth_token');
      
      if (hasCustomAuthStored && authToken) {
        setHasCustomAuth(true);
        
        // Try to get user data from backend using the token
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${authToken}`
            },
            credentials: 'include'
          });
          
          if (response.ok) {
            const userData = await response.json();
            
            // Add safety check for userData
            if (!userData) {
              console.error('No user data returned from /api/auth/me endpoint');
              return;
            }
            
            // Create a Supabase-like user object with careful null checks
            const customUser = {
              id: userData?.id || userData?.user?.id || 'custom-id',
              email: userData?.email || userData?.user?.email || 'unknown@example.com',
              user_metadata: {
                ...(userData || {}),
                custom_auth: true
              },
              app_metadata: {
                provider: 'custom'
              }
            } as unknown as SupabaseUser;
            
            setUser(customUser);
          }
        } catch (error) {
          console.error('Error fetching custom user data:', error);
        }
      }
      
      // Then check Supabase session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) console.error(error);
      
      // Only set user from Supabase if we don't have a custom user
      if (!hasCustomAuthStored && session?.user) {
        setUser(session.user);
      }
      
      setIsLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Only update user from Supabase if we don't have custom auth
      if (!hasCustomAuth) {
        setUser(session?.user ?? null);
      }
    });

    return () => subscription.unsubscribe();
  }, [hasCustomAuth]);

  const signin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Sign in the user with Supabase (no OTP for login)
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (error) {
        console.error("Sign in error:", error.message);
        setError(error.message);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return false;
      } else {
        toast({
          title: "Success",
          description: "Signed in successfully",
        });
        return true;
      }
    } catch (error: any) {
      console.error("Sign in error:", error.message);
      setError(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // If user doesn't exist, proceed with signup
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            // Add any additional user metadata here
            signup_date: new Date().toISOString(),
          }
        }
      });

      if (signUpError) {
        // Handle specific error cases
        if (signUpError.message.includes('already registered')) {
          toast({
            title: "Email already in use",
            description: "This email is already registered. Please sign in or use a different email.",
            variant: "destructive",
          });
          return false;
        }
        throw signUpError;
      }

      toast({
        title: "Success",
        description: "Signup successful! Please check your email to verify your account.",
      });
      
      return true;
    } catch (error: any) {
      console.error("Sign up error:", error.message);
      setError(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Verify the OTP using Supabase
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
        description: "Email verified successfully",
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
    // Clear custom auth data first
    localStorage.removeItem('auth_token');
    localStorage.removeItem('has_custom_auth');
    setHasCustomAuth(false);
    
    // Then sign out from Supabase
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

  // Function to set a custom user from backend authentication
  const setCustomUser = (userData: any) => {
    // Create a Supabase-like user object
    const customUser = {
      id: userData.id || userData.user?.id || 'custom-id',
      email: userData.email || userData.user?.email,
      user_metadata: {
        ...userData,
        custom_auth: true
      },
      app_metadata: {
        provider: 'custom'
      }
    } as unknown as SupabaseUser;
    
    // Set the user in state
    setUser(customUser);
    setHasCustomAuth(true);
    
    // Store auth token if available
    if (userData.token) {
      localStorage.setItem('auth_token', userData.token);
    }
    
    // Store custom auth flag
    localStorage.setItem('has_custom_auth', 'true');
  };
  
  // Check for custom auth on initial load
  useEffect(() => {
    const hasCustomAuthStored = localStorage.getItem('has_custom_auth') === 'true';
    if (hasCustomAuthStored) {
      setHasCustomAuth(true);
    }
  }, []);

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
        setCustomUser,
        hasCustomAuth
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
