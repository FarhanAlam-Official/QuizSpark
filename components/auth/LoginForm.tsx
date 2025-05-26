"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithLocalDb } from "@/lib/auth/localAuth";
import { validateEmail } from "@/lib/utils/validation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { authNotifications, formNotifications } from "@/lib/utils/notifications";

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

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Starting login submission...');
      const { email, password } = formData;

      // Validate email
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        formNotifications.invalidEmail();
        throw new Error(emailValidation.error);
      }

      if (!password) {
        formNotifications.requiredField('Password');
        throw new Error("Password is required");
      }

      let result;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔑 Attempting local database login...');
        result = await signInWithLocalDb(email, password);
        console.log('📋 Local login result:', { 
          success: !!result.data,
          hasError: !!result.error,
          userData: result.data?.user 
        });
      } else {
        console.log('🔐 Attempting Supabase login...');
        result = await supabase.auth.signInWithPassword({
          email,
          password,
          options: {
            redirectTo: `${window.location.origin}/auth/callback?type=magiclink&next=/dashboard`
          }
        });
      }

      if (result.error) {
        console.error('❌ Login error:', result.error);
        // Handle specific error cases
        if (result.error.message.includes('Invalid email or password')) {
          authNotifications.invalidCredentials();
        } else if (result.error.message.includes('Email not confirmed') || 
                  result.error.message.includes('verify your email')) {
          authNotifications.emailNotVerified();
        } else {
          authNotifications.loginError(result.error.message);
        }
        throw new Error(result.error.message);
      }

      if (!result.data?.user) {
        throw new Error('No user data received');
      }

      // Store authentication state
      login(result.data.user);

      console.log('✅ Login successful, redirecting...');
      authNotifications.loginSuccess();
      
      // Use window.location for a full page reload to trigger middleware
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('❌ Form submission error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="name@example.com"
          required
          disabled={isLoading}
          autoComplete="email"
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInputChange}
            required
            disabled={isLoading}
            autoComplete="current-password"
            className="w-full pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <Button className="w-full" type="submit" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
      <div className="text-center text-sm">
        <Link href="/auth/register" className="text-primary hover:underline">
          Don&apos;t have an account? Sign up
        </Link>
      </div>
      <div className="text-center text-sm">
        <Link
          href="/auth/forgot-password"
          className="text-muted-foreground hover:underline"
        >
          Forgot your password?
        </Link>
      </div>
    </form>
  );
} 