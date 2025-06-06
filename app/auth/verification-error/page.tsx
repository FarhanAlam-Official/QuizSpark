"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft } from "lucide-react";

export default function VerificationErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-50 p-3">
            <XCircle className="h-6 w-6 text-red-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Verification Failed</h1>
        <p className="text-muted-foreground">
          We couldn't verify your email. This might happen if:
        </p>
        <ul className="text-sm text-muted-foreground text-left list-disc pl-6 space-y-2">
          <li>The verification link has expired</li>
          <li>The link was already used</li>
          <li>The link was modified or is invalid</li>
        </ul>
        <div className="space-y-4 pt-4">
          <Link href="/auth/register">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign Up
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            Need help? <Link href="/contact" className="text-primary hover:underline">Contact Support</Link>
          </p>
        </div>
      </Card>
    </div>
  );
} 