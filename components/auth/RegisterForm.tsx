"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateEmail, validatePassword, validateUsername } from "@/lib/utils/validation";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";
import { OTPVerification } from "./OTPVerification";
import { Eye, EyeOff, Wand2 } from "lucide-react";
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
    if (!supabase) throw new Error('Supabase client not initialized');

    const baseUrl = window.location.origin;
    const redirectUrl = `${baseUrl}/auth/callback`;

    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: username,
          role: 'user'
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

  const generateStrongPassword = () => {
    const length = 16;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    let password = "";
    
    // Ensure at least one of each required character type
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // Uppercase
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // Lowercase
    password += "0123456789"[Math.floor(Math.random() * 10)]; // Number
    password += "!@#$%^&*()_+-=[]{}|;:,.<>?"[Math.floor(Math.random() * 23)]; // Special char
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setFormData(prev => ({
      ...prev,
      password,
      confirmPassword: password
    }));
    formNotifications.submitSuccess("Strong password generated!");
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

      // Sign up the user
      const result = await handleSupabaseSignUp(email, password, username);
      
      if (result.data?.user) {
        // Show verification notification
        authNotifications.emailVerificationSent();
        
        // Use router.replace instead of push to avoid the redirect loop
        router.replace(`/auth/check-email?email=${encodeURIComponent(email)}&type=signup`);
      } else {
        throw new Error('Registration failed');
      }
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
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="username" className="text-sm font-medium">Username</Label>
        <Input
          id="username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleInputChange}
          placeholder="johndoe"
          disabled={isLoading}
          required
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="name@example.com"
          disabled={isLoading}
          required
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInputChange}
            placeholder="••••••••"
            disabled={isLoading}
            required
            className="w-full pr-20"
          />
          <div className="absolute right-0 top-0 h-full flex items-center gap-1 pr-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-transparent"
              onClick={generateStrongPassword}
              title="Generate strong password"
            >
              <Wand2 className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-transparent"
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
        <PasswordStrengthIndicator password={formData.password} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="••••••••"
            disabled={isLoading}
            required
            className="w-full"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full font-medium"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Creating account...</span>
          </div>
        ) : (
          "Create account"
        )}
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Already have an account?
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => window.location.href = '/auth/login'}
      >
        Sign in
      </Button>
    </form>
  );
} 