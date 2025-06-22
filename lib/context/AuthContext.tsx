"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AuthChangeEvent, Session, SupabaseClient } from "@supabase/supabase-js";
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
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  // Initialize Supabase client
  useEffect(() => {
    const client = createClient();
    setSupabase(client);
  }, []);

  useEffect(() => {
    let mounted = true;

    // Initialize with initial session if available
    const initializeUser = async () => {
      try {
        if (!supabase) {
          if (mounted) setIsLoading(false);
          return;
        }

        // First try to get user from initial session
        if (initialSession?.user) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', initialSession.user.id)
            .single();

          if (!userError && userData && mounted) {
            setUser(userData as User);
          }
        } else {
          // If no initial session, check current session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (!sessionError && session?.user && mounted) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (!userError && userData && mounted) {
              setUser(userData as User);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    if (supabase) {
      initializeUser();

      // Subscribe to auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event: AuthChangeEvent, session: Session | null) => {
          if (!mounted || !supabase) return;

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

              if (!userError && userData && mounted) {
                setUser(userData as User);
              }
            } catch (error) {
              console.error('Error getting user data:', error);
              if (mounted) setUser(null);
            }
          }
          if (mounted) setIsLoading(false);
        }
      );

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, [initialSession, router, supabase]);

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