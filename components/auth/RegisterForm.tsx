"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerWithLocalDb } from "@/lib/auth/localAuth";
import { validateEmail, validatePassword } from "@/lib/utils/validation";
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

  const sendVerificationEmail = async (email: string) => {
    const otp = generateOTP();
    storeOTP(email, otp);
    
    const response = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to send verification email');
    }
  };

  const handleVerificationComplete = async (otpInput: string) => {
    const { email, password } = formData;
    
    try {
      // Verify OTP
      const otpVerification = verifyOTP(email, otpInput);
      if (!otpVerification.isValid) {
        authNotifications.emailVerificationError(otpVerification.error || 'Invalid verification code');
        throw new Error(otpVerification.error);
      }

      // Register user in local DB
      const result = await registerWithLocalDb(email, password);
      if (result.error) {
        // Handle specific error cases
        if (result.error.message.includes('already exists')) {
          authNotifications.emailAlreadyExists();
        } else {
          authNotifications.registrationError(result.error.message);
        }
        throw new Error(result.error.message);
      }

      authNotifications.registrationSuccess();
      router.push("/auth/login");
    } catch (error: any) {
      console.error('Registration error:', error);
    }
  };

  const handleSupabaseSignUp = async (email: string, password: string) => {
    // Get the current URL
    const baseUrl = window.location.origin;
    const redirectUrl = `${baseUrl}/auth/callback?next=/dashboard`;

    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          registered_at: new Date().toISOString(),
        }
      },
    });

    if (result.error) {
      // Enhanced error handling
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
      const { email, password, confirmPassword } = formData;

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

      if (process.env.NODE_ENV === 'development') {
        // Development: Use custom OTP system
        await sendVerificationEmail(email);
        setShowOTPVerification(true);
        authNotifications.emailVerificationSent();
      } else {
        // Production: Use Supabase with enhanced handling
        const result = await handleSupabaseSignUp(email, password);
        
        // If successful, show verification page
        authNotifications.emailVerificationSent();
        router.push("/auth/verify-email?email=" + encodeURIComponent(email));
      }
    } catch (error: any) {
      setError(error.message);
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (showOTPVerification) {
    return (
      <OTPVerification
        email={formData.email}
        onVerificationComplete={handleVerificationComplete}
        onResendOTP={() => sendVerificationEmail(formData.email)}
      />
    );
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
            autoComplete="new-password"
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
            required
            disabled={isLoading}
            autoComplete="new-password"
            className="w-full pr-10"
          />
        </div>
      </div>
      <Button className="w-full" type="submit" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create account"}
      </Button>
      <div className="text-center text-sm">
        <Link href="/auth/login" className="text-primary hover:underline">
          Already have an account? Sign in
        </Link>
      </div>
    </form>
  );
} 