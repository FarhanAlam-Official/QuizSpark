"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { authNotifications } from "@/lib/utils/notifications";

// Get the site URL, fallback to window.location.origin for client-side
const getSiteUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || '';
};

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [isResending, setIsResending] = useState(false);
  const supabase = createClient();

  const handleResendEmail = async () => {
    if (!email) return;
    
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${getSiteUrl()}/auth/callback?type=signup&next=/dashboard`,
        },
      });

      if (error) {
        throw error;
      }

      authNotifications.emailVerificationSent();
    } catch (error: any) {
      authNotifications.registrationError(error.message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md p-8 text-center space-y-6">
      <div className="flex justify-center">
        <div className="rounded-full bg-blue-50 p-3">
          <Mail className="h-6 w-6 text-blue-500" />
        </div>
      </div>
      <h1 className="text-2xl font-bold">Check your email</h1>
      {email && (
        <p className="text-muted-foreground">
          We've sent a verification link to <span className="font-medium text-foreground">{email}</span>
        </p>
      )}
      <p className="text-muted-foreground">
        Click the link in the email to verify your account and complete the registration.
      </p>
      <div className="text-sm text-muted-foreground space-y-4">
        <div className="space-y-2">
          <p className="font-medium">Didn't receive the email?</p>
          <ul className="space-y-1">
            <li>• Check your spam folder</li>
            <li>• Make sure you entered the correct email address</li>
          </ul>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleResendEmail}
          disabled={isResending || !email}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
          {isResending ? 'Resending...' : 'Resend verification email'}
        </Button>
      </div>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-blue-50 p-3">
              <Mail className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Loading...</h1>
        </Card>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
} 