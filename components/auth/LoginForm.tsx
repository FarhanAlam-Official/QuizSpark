"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateEmail } from "@/lib/utils/validation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { authNotifications } from "@/lib/utils/notifications";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  const router = useRouter();
  const supabase = createClient();
  const { login } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Validate email
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.error);
      }

      console.log('Attempting to sign in...');
      
      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      if (!authData.user) {
        console.error('No user data returned from auth');
        throw new Error('No user data returned');
      }

      console.log('Successfully authenticated, fetching user profile...');

      // Get user metadata
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError) {
        console.error('Error fetching user profile:', userError);
        throw new Error('Failed to get user profile');
      }

      if (!userData) {
        console.error('No user profile found');
        throw new Error('User profile not found');
      }

      console.log('Successfully fetched user profile, logging in...');

      // Login successful
      login({
        id: authData.user.id,
        email: authData.user.email!,
        role: userData.role,
        name: userData.name || '',
        avatar_url: userData.avatar_url || null,
        bio: userData.bio || null,
        preferences: userData.preferences || {},
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        last_login_at: userData.last_login_at || new Date().toISOString(),
        login_count: userData.login_count || 0,
        is_email_verified: authData.user.email_confirmed_at !== null,
        is_active: userData.is_active !== false
      });

      console.log('Login successful, redirecting...');
      authNotifications.loginSuccess();
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message);
      authNotifications.loginError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          value={formData.email}
          onChange={handleInputChange}
          disabled={isLoading}
          required
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
          <Link
            href="/auth/forgot-password"
            className="text-sm font-medium text-primary hover:text-primary/90"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleInputChange}
            disabled={isLoading}
            required
            className="w-full pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full font-medium"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Signing in...</span>
          </div>
        ) : (
          "Sign in"
        )}
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            New to QuizSpark?
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => window.location.href = '/auth/register'}
      >
        Create an account
      </Button>
    </form>
  );
} 