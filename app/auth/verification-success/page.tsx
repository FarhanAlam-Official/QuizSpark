"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

function VerificationSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Auto-redirect to login after 5 seconds
    const timer = setTimeout(() => {
      router.push("/auth/login");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Card className="w-full max-w-md p-8 text-center space-y-6">
      <div className="flex justify-center">
        <div className="rounded-full bg-green-50 p-3">
          <CheckCircle className="h-6 w-6 text-green-500" />
        </div>
      </div>
      <h1 className="text-2xl font-bold">Email Verified Successfully! 🎉</h1>
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Your email has been verified and your account is now active.
        </p>
        <p className="text-muted-foreground font-medium">
          Please log in to access your account and start using QuizSpark.
        </p>
      </div>
      <div className="space-y-4">
        <Button
          onClick={() => router.push("/auth/login")}
          className="w-full"
        >
          Continue to Login
        </Button>
        <p className="text-sm text-muted-foreground">
          You will be automatically redirected to login in 5 seconds...
        </p>
      </div>
    </Card>
  );
}

export default function VerificationSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-50 p-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Loading...</h1>
        </Card>
      }>
        <VerificationSuccessContent />
      </Suspense>
    </div>
  );
} 