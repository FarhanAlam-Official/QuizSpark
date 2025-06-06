"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import type { User, UserRole } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

interface AuthProviderProps {
  children: React.ReactNode;
  initialSession?: Session | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, initialSession }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Initialize with initial session if available
    const initializeUser = async () => {
      try {
        if (initialSession?.user && supabase) {
          // Get user metadata from users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', initialSession.user.id)
            .single();

          if (userError) throw userError;
          setUser(userData as User);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [initialSession, supabase]);

  useEffect(() => {
    const setupAuthListener = async () => {
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      // Check current session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (session?.user) {
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userError) throw userError;
          setUser(userData as User);
        } catch (error) {
          console.error('Error getting user data:', error);
          setUser(null);
        }
      }

      // Subscribe to auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event: AuthChangeEvent, session: Session | null) => {
          if (event === 'SIGNED_OUT') {
            setUser(null);
            router.push('/auth/login');
          } else if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
            try {
              const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (userError) throw userError;
              setUser(userData as User);
            } catch (error) {
              console.error('Error getting user data:', error);
              setUser(null);
            }
          }
          setIsLoading(false);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    };

    setupAuthListener();
  }, [router, supabase]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    if (!supabase) return;
    
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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