"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function VerificationErrorPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-50 p-3">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Verification Failed</h1>
        <p className="text-muted-foreground">
          We couldn't verify your email address. This might happen if:
        </p>
        <ul className="text-sm text-muted-foreground text-left list-disc pl-6 space-y-2">
          <li>The verification link has expired</li>
          <li>The link has already been used</li>
          <li>There was a technical problem</li>
        </ul>
        <div className="space-y-4">
          <Button
            onClick={() => router.push("/auth/login")}
            variant="outline"
            className="w-full"
          >
            Try Logging In
          </Button>
          <Button
            onClick={() => router.push("/auth/register")}
            className="w-full"
          >
            Register Again
          </Button>
          <p className="text-sm text-muted-foreground">
            If you continue to have problems, please contact support.
          </p>
        </div>
      </Card>
    </div>
  );
} 