"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft } from "lucide-react";
import { Suspense } from "react";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const type = searchParams.get("type") || "verification";

  const isReset = type === "reset";
  const title = isReset ? "Check your email" : "Verify your email";
  const description = isReset
    ? "We've sent you a link to reset your password. Click the link in the email to reset your password."
    : "We've sent you a verification link. Click the link in the email to verify your account.";

  return (
    <Card className="w-full max-w-md p-8 text-center space-y-6">
      <div className="flex justify-center">
        <div className="rounded-full bg-blue-50 p-3">
          <Mail className="h-6 w-6 text-blue-500" />
        </div>
      </div>
      <h1 className="text-2xl font-bold">{title}</h1>
      {email && (
        <p className="text-muted-foreground">
          We've sent an email to <span className="font-medium text-foreground">{email}</span>
        </p>
      )}
      <p className="text-muted-foreground">
        {description}
      </p>
      <div className="text-sm text-muted-foreground space-y-4">
        <div className="space-y-2">
          <p className="font-medium">Didn't receive the email?</p>
          <ul className="space-y-1">
            <li>• Check your spam folder</li>
            <li>• Make sure you entered the correct email address</li>
            <li>• Please wait a few minutes before trying again</li>
          </ul>
        </div>
      </div>
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or
            </span>
          </div>
        </div>
        <Link
          href={isReset ? "/auth/forgot-password" : "/auth/register"}
          className="flex items-center justify-center text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {isReset ? "Try again" : "Back to sign up"}
        </Link>
      </div>
    </Card>
  );
}

export default function CheckEmailPage() {
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
        <CheckEmailContent />
      </Suspense>
    </div>
  );
} 