"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function VerificationSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-50 p-3">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Email Verified!</h1>
        <p className="text-muted-foreground">
          Your email has been successfully verified. You can now access all features of your account.
        </p>
        <div className="pt-4">
          <Link href="/auth/login">
            <Button className="w-full">
              Continue to Login
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
} 