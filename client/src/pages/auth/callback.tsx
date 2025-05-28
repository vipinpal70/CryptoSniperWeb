import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const [_, navigate] = useLocation();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        // User is signed in and email is verified
        navigate('/');
      }
    });
  }, [navigate]);

  return <div>Verifying your email...</div>;
}