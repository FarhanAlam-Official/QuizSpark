"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerWithLocalDb } from "@/lib/auth/localAuth";
import { validateEmail, validatePassword, validateUsername } from "@/lib/utils/validation";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { OTPVerification } from "./OTPVerification";
import { Eye, EyeOff } from "lucide-react";
import { generateOTP, storeOTP, verifyOTP } from "@/lib/utils/otp";
import { sendOTPEmail } from "@/lib/email/brevoService";
import { authNotifications, formNotifications } from "@/lib/utils/notifications";

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showOTPVerification, setShowOTPVerification] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSupabaseSignUp = async (email: string, password: string, username: string) => {
    const baseUrl = window.location.origin;
    const redirectUrl = `${baseUrl}/auth/callback?type=signup&next=/dashboard`;

    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username,
          registered_at: new Date().toISOString(),
        }
      },
    });

    if (result.error) {
      switch (true) {
        case result.error.message.includes('already registered'):
          authNotifications.emailAlreadyExists();
          throw new Error('This email is already registered');
        case result.error.message.includes('rate limit'):
          authNotifications.tooManyRequests();
          throw new Error('Too many attempts. Please try again later');
        case result.error.message.includes('invalid email'):
          authNotifications.invalidEmailFormat();
          throw new Error('Invalid email format');
        case result.error.message.includes('weak password'):
          formNotifications.invalidPassword(['Password is too weak']);
          throw new Error('Password is too weak');
        default:
          authNotifications.registrationError(result.error.message);
          throw new Error(result.error.message);
      }
    }

    return result;
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { email, password, confirmPassword, username } = formData;

      // Validate username
      const usernameValidation = validateUsername(username);
      if (!usernameValidation.isValid) {
        formNotifications.invalidUsername(usernameValidation.error || 'Invalid username');
        throw new Error(usernameValidation.error || 'Invalid username');
      }

      // Validate email
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        formNotifications.invalidEmail();
        throw new Error(emailValidation.error);
      }

      // Validate password
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        formNotifications.invalidPassword(passwordValidation.errors);
        throw new Error(passwordValidation.errors.join(". "));
      }

      // Check password confirmation
      if (password !== confirmPassword) {
        formNotifications.passwordMismatch();
        throw new Error("Passwords do not match");
      }

      // Production: Use Supabase with enhanced handling
      const result = await handleSupabaseSignUp(email, password, username);
      
      // If successful, show verification page
      authNotifications.emailVerificationSent();
      router.push(`/auth/check-email?email=${encodeURIComponent(email)}&type=signup`);
    } catch (error: any) {
      setError(error.message);
      console.error('Registration error:', error);
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
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleInputChange}
          placeholder="Choose a username"
          disabled={isLoading}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email"
          disabled={isLoading}
          required
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
            placeholder="Create a password"
            disabled={isLoading}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </button>
        </div>
        <PasswordStrengthIndicator password={formData.password} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm your password"
            disabled={isLoading}
            required
          />
        </div>
      </div>
      <Button className="w-full" type="submit" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
} 